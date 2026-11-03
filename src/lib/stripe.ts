import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  // Don't throw at import time in dev — surface a clear error only when actually used.
  console.warn(
    "STRIPE_SECRET_KEY is not set. Checkout will not work until it is configured in .env.local."
  );
}

export const stripe = new Stripe(key ?? "sk_test_missing", {
  apiVersion: "2026-10-28.endive",
});
