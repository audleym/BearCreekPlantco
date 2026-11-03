"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

type PickupDate = { id: string; date: string };

export function CheckoutForm({ pickupDates }: { pickupDates: PickupDate[] }) {
  const { items, totalCents } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-foreground/70">
          Your cart is empty — add some plants before checking out.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      customer: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
      },
      pickupDateId: String(formData.get("pickupDateId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-semibold text-green-900">Order Summary</p>
        <ul className="mt-3 space-y-1 text-sm text-foreground/80">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span>{formatPrice(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-display font-semibold text-green-900">
          <span>Total</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" required className="sm:col-span-2" />
      </div>

      <div>
        <label htmlFor="pickupDateId" className="block text-sm font-medium text-foreground">
          Pickup date
        </label>
        {pickupDates.length === 0 ? (
          <p className="mt-1 text-sm text-terracotta-600">
            No pickup dates are open right now — please contact us to arrange pickup.
          </p>
        ) : (
          <select
            id="pickupDateId"
            name="pickupDateId"
            required
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {pickupDates.map((pd) => (
              <option key={pd.id} value={pd.id}>
                {new Date(pd.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Order notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Anything we should know about your order?"
        />
      </div>

      {error && <p className="text-sm font-medium text-terracotta-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || pickupDates.length === 0}
        className="w-full rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-green-50 transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Redirecting to secure checkout…" : "Continue to Payment"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
      />
    </div>
  );
}
