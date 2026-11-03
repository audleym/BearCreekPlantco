import { NextResponse } from "next/server";
import { getCurrentCustomer, isGoogleLoginConfigured } from "@/lib/customer-auth";

// Used by the header to show "Sign in" vs. the customer's name, without
// making every page render per-request.
export async function GET() {
  const customer = await getCurrentCustomer();
  return NextResponse.json(
    {
      loginEnabled: isGoogleLoginConfigured(),
      customer: customer
        ? { name: customer.name, email: customer.email, image: customer.image }
        : null,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
