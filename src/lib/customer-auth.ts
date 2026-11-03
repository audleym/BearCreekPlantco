// Customer sign-in with Google (OAuth 2.0 / OpenID Connect), hand-rolled so
// there's no auth library to keep in sync with Next.js upgrades.
//
// Session = a signed cookie holding the customer's ID and an expiry:
//   base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, SESSION_SECRET))
// Nothing secret lives in the cookie; the signature just stops tampering.

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "bc_session";
export const OAUTH_STATE_COOKIE = "bc_oauth_state";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isGoogleLoginConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.SESSION_SECRET,
  );
}

/** The canonical site origin, e.g. https://bearcreekplantco.com */
export function siteOrigin(): string {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin;
}

export function googleRedirectUri(): string {
  return `${siteOrigin()}/api/auth/google/callback`;
}

/** Only allow redirecting back to a path on this site (no open redirects). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/account";
  }
  return next;
}

// ---- signing helpers -------------------------------------------------------

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

// ---- session ---------------------------------------------------------------

type SessionPayload = { cid: string; exp: number };

export async function createSessionValue(customerId: string): Promise<string> {
  const payload: SessionPayload = {
    cid: customerId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function readSessionValue(value: string | undefined): Promise<string | null> {
  if (!value || !process.env.SESSION_SECRET) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  if (!timingSafeEqual(sig, await hmac(body))) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64url(body))) as SessionPayload;
    if (typeof payload.cid !== "string" || payload.exp < Date.now() / 1000) return null;
    return payload.cid;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** The signed-in customer for this request, or null. Server-only. */
export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const customerId = await readSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!customerId) return null;
  return prisma.customer.findUnique({ where: { id: customerId } });
}
