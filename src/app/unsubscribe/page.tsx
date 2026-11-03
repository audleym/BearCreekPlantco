import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UnsubscribeButton } from "@/components/account-actions";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };
export const dynamic = "force-dynamic";

// Linked from the bottom of update emails: /unsubscribe?token=...
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const { token } = await searchParams;
  const sub =
    typeof token === "string" && token.length <= 100
      ? await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } })
      : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-green-900">Email updates</h1>
      {!sub ? (
        <p className="mt-4 text-sm text-foreground/70">
          This unsubscribe link isn&apos;t valid. If you&apos;d like to stop getting emails,{" "}
          <Link href="/contact" className="font-semibold text-green-700 hover:underline">
            contact us
          </Link>{" "}
          and we&apos;ll take care of it.
        </p>
      ) : sub.unsubscribedAt ? (
        <p className="mt-4 text-sm text-foreground/70">
          {sub.email} is already unsubscribed — you won&apos;t get any more update emails.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-foreground/70">
            Stop sending email updates to <strong>{sub.email}</strong>?
          </p>
          <UnsubscribeButton token={sub.unsubscribeToken} />
        </>
      )}
    </div>
  );
}
