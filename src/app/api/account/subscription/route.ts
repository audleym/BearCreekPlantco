import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { subscribe, unsubscribeByEmail } from "@/lib/subscribers";

// Signed-in customers turning email updates on/off from /account.
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = z.object({ subscribed: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if (parsed.data.subscribed) {
    await subscribe(customer.email, { name: customer.name, source: "account" });
  } else {
    await unsubscribeByEmail(customer.email);
  }
  return NextResponse.json({ ok: true, subscribed: parsed.data.subscribed });
}
