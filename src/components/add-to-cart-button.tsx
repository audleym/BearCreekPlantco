"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-context";

type Props = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  inStock: boolean;
  className?: string;
};

export function AddToCartButton({
  productId,
  slug,
  name,
  priceCents,
  size,
  inStock,
  className,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center rounded-full bg-border px-5 py-2.5 text-sm font-semibold text-foreground/50 ${className ?? ""}`}
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ productId, slug, name, priceCents, size });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-2.5 text-sm font-semibold text-green-50 transition hover:bg-green-600 ${className ?? ""}`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
