import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCurrentCustomer, isGoogleLoginConfigured } from "@/lib/customer-auth";
import { isSubscribed } from "@/lib/subscribers";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { SignOutButton, SubscriptionToggle } from "@/components/account-actions";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = { title: "Your Account" };
export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  cancelled: "Sign-in was cancelled.",
  state: "Your sign-in link expired — please try again.",
  google: "We couldn't reach Google — please try again.",
  unverified: "Your Google account's email address isn't verified.",
  not_configured: "Sign-in isn't available yet.",
};

const statusLabels: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid — we're getting it ready",
  ready: "Ready for pickup",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const { error } = await searchParams;
  const customer = await getCurrentCustomer();

  if (!customer) {
    const loginEnabled = isGoogleLoginConfigured();
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold text-green-900">Your Account</h1>
        {typeof error === "string" && errorMessages[error] && (
          <p className="mt-4 rounded-lg border border-terracotta-500/40 bg-terracotta-500/10 px-4 py-3 text-sm text-terracotta-600">
            {errorMessages[error]}
          </p>
        )}
        {loginEnabled ? (
          <>
            <p className="mt-3 text-sm text-foreground/70">
              Sign in to see your orders and manage email updates. You don&apos;t need an account
              to order — it just makes checkout quicker.
            </p>
            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-foreground/70">
            Customer accounts are coming soon. You can still <Link href="/shop" className="font-semibold text-green-700 hover:underline">order online</Link> without one.
          </p>
        )}
        <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-green-900">Get email updates</p>
          <NewsletterForm />
        </div>
      </div>
    );
  }

  const [orders, subscribed] = await Promise.all([
    prisma.order.findMany({
      where: {
        email: { equals: customer.email, mode: "insensitive" },
        status: { not: "pending_payment" },
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 20,
    }),
    isSubscribed(customer.email),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-green-900">
            Hi{customer.name ? `, ${customer.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-sm text-muted">Signed in as {customer.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-semibold text-green-900">Email updates</h2>
        <div className="mt-3">
          <SubscriptionToggle initial={subscribed} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-green-900">Your orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/70">
            No orders yet for {customer.email}.{" "}
            <Link href="/shop" className="font-semibold text-green-700 hover:underline">
              Browse the shop →
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-border bg-surface p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    Pickup{" "}
                    {order.pickupDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs font-medium text-green-700">
                    {statusLabels[order.status] ?? order.status}
                  </p>
                </div>
                <ul className="mt-2 space-y-0.5 text-foreground/80">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity} × {item.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold text-green-900">{formatPrice(order.totalCents)}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">
          Orders show here when they were placed with {customer.email}.
        </p>
      </section>
    </div>
  );
}
