"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, removeItem, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-green-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Browse the shop and add a few plants to get started.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-green-50 hover:bg-green-600"
        >
          Shop Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-green-900">Your Cart</h1>

      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4 sm:p-5">
            <div
              aria-hidden
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl"
            >
              🌿
            </div>
            <div className="flex-1">
              <Link
                href={`/shop/${item.slug}`}
                className="font-display font-semibold text-green-900 hover:text-green-700"
              >
                {item.name}
              </Link>
              <p className="text-xs uppercase tracking-wide text-muted">{item.size}</p>
              <p className="mt-1 text-sm text-foreground/70">
                {formatPrice(item.priceCents)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                Quantity for {item.name}
              </label>
              <input
                id={`qty-${item.productId}`}
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  setQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))
                }
                className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="text-sm font-medium text-terracotta-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <p className="w-20 text-right font-display font-semibold text-green-900">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/shop" className="text-sm font-medium text-green-700 hover:underline">
          ← Continue shopping
        </Link>
        <div className="text-right">
          <p className="text-sm text-foreground/70">Order total</p>
          <p className="font-display text-2xl font-semibold text-green-900">
            {formatPrice(totalCents)}
          </p>
          <Link
            href="/checkout"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-green-50 hover:bg-green-600"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
