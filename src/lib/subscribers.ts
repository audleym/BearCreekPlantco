import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/customer-auth";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Add (or re-add) someone to the email updates list. Only call on an explicit opt-in. */
export async function subscribe(email: string, opts: { name?: string | null; source: string }) {
  const normalized = normalizeEmail(email);
  return prisma.subscriber.upsert({
    where: { email: normalized },
    create: { email: normalized, name: opts.name || null, source: opts.source },
    update: { unsubscribedAt: null, ...(opts.name ? { name: opts.name } : {}) },
  });
}

export async function unsubscribeByEmail(email: string) {
  await prisma.subscriber.updateMany({
    where: { email: normalizeEmail(email), unsubscribedAt: null },
    data: { unsubscribedAt: new Date() },
  });
}

export async function isSubscribed(email: string): Promise<boolean> {
  const sub = await prisma.subscriber.findUnique({ where: { email: normalizeEmail(email) } });
  return Boolean(sub && !sub.unsubscribedAt);
}

export function unsubscribeUrl(token: string): string {
  return `${siteOrigin()}/unsubscribe?token=${encodeURIComponent(token)}`;
}
