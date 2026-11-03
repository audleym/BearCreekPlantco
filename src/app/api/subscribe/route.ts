import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribe } from "@/lib/subscribers";

const schema = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(100).optional(),
  // Honeypot: real visitors never see or fill this field; bots often do.
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true }); // quietly drop bots

  await subscribe(parsed.data.email, { name: parsed.data.name, source: "website" });
  return NextResponse.json({ ok: true });
}
