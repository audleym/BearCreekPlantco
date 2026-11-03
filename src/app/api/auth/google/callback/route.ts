import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  createSessionValue,
  googleRedirectUri,
  isGoogleLoginConfigured,
  safeNextPath,
  sessionCookieOptions,
} from "@/lib/customer-auth";
import { normalizeEmail } from "@/lib/subscribers";

type GoogleIdToken = {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function fail(req: NextRequest, reason: string) {
  const res = NextResponse.redirect(new URL(`/account?error=${reason}`, req.url));
  res.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth/google" });
  return res;
}

// Google redirects here with ?code=...&state=... after the customer signs in.
export async function GET(req: NextRequest) {
  if (!isGoogleLoginConfigured()) return fail(req, "not_configured");

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail(req, "cancelled"); // e.g. they clicked Cancel

  const code = params.get("code");
  const state = params.get("state");

  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? "{}");
  } catch {}
  if (!code || !state || !saved.state || saved.state !== state) return fail(req, "state");

  // Exchange the one-time code for tokens, server to server.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    console.error("Google token exchange failed", tokenRes.status, await tokenRes.text());
    return fail(req, "google");
  }
  const tokens = (await tokenRes.json()) as { id_token?: string };

  // The ID token came straight from Google over HTTPS, so per Google's docs
  // its signature doesn't need re-verifying — but we still check its claims.
  let claims: GoogleIdToken;
  try {
    const part = tokens.id_token!.split(".")[1];
    claims = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return fail(req, "google");
  }
  const validIssuer = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (
    !validIssuer ||
    claims.aud !== process.env.GOOGLE_CLIENT_ID ||
    claims.exp < Date.now() / 1000 ||
    !claims.sub ||
    !claims.email ||
    !claims.email_verified
  ) {
    return fail(req, "unverified");
  }

  const email = normalizeEmail(claims.email);
  const profile = { email, name: claims.name ?? null, image: claims.picture ?? null, lastLoginAt: new Date() };

  // Match on Google's account ID first; fall back to email (e.g. if the
  // same address was linked to a different Google account before).
  const existing =
    (await prisma.customer.findUnique({ where: { googleSub: claims.sub } })) ??
    (await prisma.customer.findUnique({ where: { email } }));

  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { ...profile, googleSub: claims.sub },
      })
    : await prisma.customer.create({ data: { ...profile, googleSub: claims.sub } });

  const res = NextResponse.redirect(new URL(safeNextPath(saved.next), req.url));
  res.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth/google" });
  res.cookies.set(SESSION_COOKIE, await createSessionValue(customer.id), sessionCookieOptions);
  return res;
}
