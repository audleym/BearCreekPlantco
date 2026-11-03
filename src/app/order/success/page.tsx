import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export const metadata: Metadata = { title: "Order Confirmed" };

type SearchParams = Promise<{ order_id?: string }>;

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { order_id } = await searchParams;
  const order = order_id
    ? await prisma.order.findUnique({ where: { id: order_id }, include: { items: true } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <ClearCartOnMount />
      <p className="text-5xl">🌼</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-green-900">
        Thanks for your order!
      </h1>

      {order ? (
        <>
          <p className="mt-3 text-sm text-foreground/70">
            We&apos;ve got your order and will have it ready for pickup on{" "}
            <strong>
              {order.pickupDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
            . A confirmation has been noted on order{" "}
            <span className="font-mono">#{order.id.slice(-8)}</span>.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-5 text-left">
            <p className="text-sm font-semibold text-green-900">Order Summary</p>
            <ul className="mt-3 space-y-1 text-sm text-foreground/80">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>{formatPrice(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-display font-semibold text-green-900">
              <span>Total</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-foreground/70">
          Your order was received. If you have any questions, feel free to contact us.
        </p>
      )}

      <Link
        href="/shop"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-green-50 hover:bg-green-600"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
