import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Called by the /unsubscribe page's button (not on page load, so email
// link scanners can't unsubscribe people by accident).
export async function POST(req: Request) {
  const parsed = z.object({ token: z.string().min(1).max(100) }).safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) return NextResponse.json({ error: "Invalid link" }, { status: 400 });

  const result = await prisma.subscriber.updateMany({
    where: { unsubscribeToken: parsed.data.token, unsubscribedAt: null },
    data: { unsubscribedAt: new Date() },
  });
  const exists =
    result.count > 0 ||
    (await prisma.subscriber.count({ where: { unsubscribeToken: parsed.data.token } })) > 0;
  if (!exists) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
