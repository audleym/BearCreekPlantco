"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/categories";

export function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? ""),
      priceCents: Math.round(Number(formData.get("price") ?? 0) * 100),
      size: String(formData.get("size") ?? ""),
      stock: Number(formData.get("stock") ?? 0),
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add product.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setOpen(false);
    e.currentTarget.reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-green-50 hover:bg-green-600"
      >
        + Add Product
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="name"
          placeholder="Name"
          required
          className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
        />
        <select name="category" required className="rounded-lg border border-border px-3 py-2 text-sm">
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="size"
          placeholder='Size (e.g. 4.5" pot)'
          required
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Price (USD)"
          required
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
        <input
          name="stock"
          type="number"
          min="0"
          placeholder="Stock"
          required
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
        <textarea
          name="description"
          placeholder="Description"
          required
          rows={2}
          className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2"
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-terracotta-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-green-50 hover:bg-green-600 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Product"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground/80"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
