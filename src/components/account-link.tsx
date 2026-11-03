"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { loginEnabled: boolean; customer: { name: string | null; email: string } | null };

// Header link: "Sign in" or the customer's first name. Fetched client-side so
// pages can stay statically rendered.
export function AccountLink({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!me || (!me.loginEnabled && !me.customer)) return null;

  const label = me.customer ? (me.customer.name?.split(" ")[0] || "Account") : "Sign in";
  return (
    <Link href="/account" onClick={onNavigate} className={className}>
      <span aria-hidden>👤</span> <span>{label}</span>
    </Link>
  );
}
