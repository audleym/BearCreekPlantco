"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-sm font-medium text-terracotta-600 hover:underline"
    >
      Sign out
    </button>
  );
}

export function SubscriptionToggle({ initial }: { initial: boolean }) {
  const [subscribed, setSubscribed] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    const next = !subscribed;
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/account/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: next }),
      });
      if (!res.ok) throw new Error();
      setSubscribed(next);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={subscribed}
          disabled={saving}
          onChange={toggle}
          className="mt-0.5 h-4 w-4 accent-green-700"
        />
        <span className="text-sm text-foreground">
          Email me about new plants, sales and pickup days
          <span className="block text-xs text-muted">
            {subscribed ? "You're subscribed." : "You're not subscribed."}
          </span>
        </span>
      </label>
      {error && <p className="mt-2 text-sm text-terracotta-600">Couldn&apos;t save — please try again.</p>}
    </div>
  );
}

export function UnsubscribeButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");

  if (status === "done") {
    return (
      <p className="mt-4 text-sm font-medium text-green-800" role="status">
        You&apos;ve been unsubscribed. Sorry to see you go!
      </p>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={status === "working"}
        onClick={async () => {
          setStatus("working");
          const res = await fetch("/api/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }).catch(() => null);
          setStatus(res?.ok ? "done" : "error");
        }}
        className="rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-green-50 transition hover:bg-green-600 disabled:opacity-60"
      >
        {status === "working" ? "Unsubscribing…" : "Unsubscribe me"}
      </button>
      {status === "error" && (
        <p className="mt-3 text-sm text-terracotta-600">
          That link didn&apos;t work — it may be out of date. Contact us and we&apos;ll remove you.
        </p>
      )}
    </div>
  );
}
