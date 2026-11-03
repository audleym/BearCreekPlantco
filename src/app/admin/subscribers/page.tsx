import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Email Subscribers" };
export const dynamic = "force-dynamic";

const sourceLabels: Record<string, string> = {
  website: "Signup form",
  account: "Account page",
  checkout: "Checkout",
};

export default async function AdminSubscribersPage() {
  const [subscribers, unsubscribedCount, customerCount] = await Promise.all([
    prisma.subscriber.findMany({ where: { unsubscribedAt: null }, orderBy: { subscribedAt: "desc" } }),
    prisma.subscriber.count({ where: { unsubscribedAt: { not: null } } }),
    prisma.customer.count(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-green-900">Email Subscribers</h1>
        <Link href="/admin" className="text-sm font-semibold text-green-700 hover:underline">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Subscribed" value={subscribers.length} />
        <Stat label="Unsubscribed" value={unsubscribedCount} />
        <Stat label="Customer accounts" value={customerCount} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <a
          href="/api/admin/subscribers/export"
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-green-50 transition hover:bg-green-600"
        >
          Download CSV
        </a>
        <p className="max-w-xl text-sm text-foreground/70">
          Import this into your email tool (Mailchimp, Gmail mail merge, etc.). Each row includes a
          personal unsubscribe link — put it at the bottom of every email you send.
        </p>
      </div>

      {subscribers.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/70">
          No subscribers yet. The signup form is in the footer of every page.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Signed up via</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-foreground/80">{s.name ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/80">{sourceLabels[s.source] ?? s.source}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground/80">
                    {s.subscribedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-green-900">{value}</p>
    </div>
  );
}
