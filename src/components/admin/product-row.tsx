"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@prisma/client";

export function ProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const [price, setPrice] = useState((product.priceCents / 100).toFixed(2));
  const [stock, setStock] = useState(product.stock);
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [saving, setSaving] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setSaving(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <tr className={!active ? "opacity-50" : undefined}>
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted">{product.category} · {product.size}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-muted">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => save({ priceCents: Math.round(Number(price) * 100) })}
            className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={() => save({ stock })}
          className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-sm"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => {
            setFeatured(e.target.checked);
            save({ featured: e.target.checked });
          }}
        />
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            save({ active: e.target.checked });
          }}
        />
      </td>
      <td className="px-4 py-3 text-xs text-muted">{saving ? "Saving…" : ""}</td>
    </tr>
  );
}
