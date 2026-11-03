import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
};

// Pickup date availability changes often — always render fresh.
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const pickupDates = await prisma.pickupDate.findMany({
    where: { isOpen: true, date: { gte: new Date(new Date().toDateString()) } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-green-900">Checkout</h1>
      <p className="mt-2 text-sm text-foreground/70">
        All orders are for pickup at the greenhouse. You&apos;ll pay securely online by card.
      </p>
      <CheckoutForm pickupDates={pickupDates.map((p) => ({ id: p.id, date: p.date.toISOString() }))} />
    </div>
  );
}
