import { NextResponse, type NextRequest } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  googleRedirectUri,
  isGoogleLoginConfigured,
  randomToken,
  safeNextPath,
  siteOrigin,
} from "@/lib/customer-auth";

// GET /api/auth/google/start?next=/checkout → redirects to Google's sign-in page.
export async function GET(req: NextRequest) {
  if (!isGoogleLoginConfigured()) {
    return NextResponse.redirect(new URL("/account?error=not_configured", req.url));
  }

  // Always sign in on the canonical domain (e.g. not www.), so the state
  // cookie and the session cookie end up on the same host as the callback.
  const canonical = siteOrigin();
  if (req.nextUrl.origin !== canonical) {
    return NextResponse.redirect(`${canonical}${req.nextUrl.pathname}${req.nextUrl.search}`);
  }

  const state = randomToken();
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", googleRedirectUri());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 60 * 10,
  });
  return res;
}
