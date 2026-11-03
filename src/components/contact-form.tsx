"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 rounded-2xl border border-green-600 bg-green-50 p-4 text-sm text-green-800">
        Thanks! Your message has been sent — we&apos;ll be in touch soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="c-name" className="block text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="c-email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="c-phone" className="block text-sm font-medium text-foreground">
          Phone (optional)
        </label>
        <input
          id="c-phone"
          name="phone"
          type="tel"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="c-message" className="block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-terracotta-600">
          Something went wrong — please try again, or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-2.5 text-sm font-semibold text-green-50 transition hover:bg-green-600 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
