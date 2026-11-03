"use client";

import { useState } from "react";

// Email updates signup. `tone="dark"` for the green footer, "light" elsewhere.
export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const dark = tone === "dark";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong — please try again.");
      setStatus("done");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className={`mt-3 text-sm font-medium ${dark ? "text-green-50" : "text-green-800"}`} role="status">
        You&apos;re on the list! We&apos;ll email you when new plants are ready.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`nl-email-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-email-${tone}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={`min-w-0 flex-1 rounded-full border px-4 py-2 text-sm ${
            dark
              ? "border-green-700 bg-green-50 text-foreground placeholder:text-muted"
              : "border-border bg-surface"
          }`}
        />
        {/* Honeypot — hidden from people, tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ${
            dark
              ? "bg-terracotta-500 text-white hover:bg-terracotta-600"
              : "bg-green-700 text-green-50 hover:bg-green-600"
          }`}
        >
          {status === "submitting" ? "Signing up…" : "Sign me up"}
        </button>
      </div>
      {status === "error" && (
        <p className={`mt-2 text-sm ${dark ? "text-green-50" : "text-terracotta-600"}`}>{error}</p>
      )}
      <p className={`mt-2 text-xs ${dark ? "text-green-100/70" : "text-muted"}`}>
        Occasional emails about what&apos;s blooming and pickup days. Unsubscribe anytime.
      </p>
    </form>
  );
}
