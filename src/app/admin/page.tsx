import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { LogoutButton } from "@/components/admin/logout-button";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata: Metadata = { title: "Admin Dashboard" };

// Always show live orders/inquiries, never a stale build-time snapshot.
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, inquiries] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { items: true },
    }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-green-900">Admin Dashboard</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin/products" className="text-sm font-semibold text-green-700 hover:underline">
            Manage Products →
          </Link>
          <Link href="/admin/subscribers" className="text-sm font-semibold text-green-700 hover:underline">
            Email Subscribers →
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-green-900">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/70">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted">{order.email} · {order.phone}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.pickupDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {order.items.reduce((n, i) => n + i.quantity, 0)} items
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatPrice(order.totalCents)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-green-900">Recent Inquiries</h2>
        {inquiries.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/70">No messages yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {inquiries.map((inq) => (
              <li key={inq.id} className="rounded-2xl border border-border bg-surface p-4 text-sm">
                <p className="font-medium text-foreground">
                  {inq.name} · <span className="text-muted">{inq.email}</span>
                  {inq.phone ? <span className="text-muted"> · {inq.phone}</span> : null}
                </p>
                <p className="mt-1 text-foreground/80">{inq.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
