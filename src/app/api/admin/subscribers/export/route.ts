import { prisma } from "@/lib/prisma";
import { unsubscribeUrl } from "@/lib/subscribers";

// CSV of active subscribers, ready to import into any email tool or mail merge.
// Protected by the /api/admin middleware check.
export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  // Quote everything; neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const subs = await prisma.subscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { subscribedAt: "asc" },
  });

  const rows = [
    ["email", "name", "source", "subscribed_at", "unsubscribe_url"],
    ...subs.map((s) => [
      s.email,
      s.name ?? "",
      s.source,
      s.subscribedAt.toISOString(),
      unsubscribeUrl(s.unsubscribeToken),
    ]),
  ];
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bear-creek-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
