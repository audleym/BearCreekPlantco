import Link from "next/link";
import Image from "next/image";
import type { Product } from "@prisma/client";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:shadow-md">
      <Link href={`/shop/${product.slug}`} className="block">
        {product.imageUrl ? (
          <div className="relative h-40 w-full overflow-hidden bg-green-50">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-[center_25%]"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="flex h-40 items-center justify-center bg-green-50 text-5xl"
          >
            🌿
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/shop/${product.slug}`}>
          <p className="font-display text-base font-semibold text-green-900 hover:text-green-700">
            {product.name}
          </p>
        </Link>
        <p className="text-xs uppercase tracking-wide text-muted">{product.size}</p>
        <p className="line-clamp-2 text-sm text-foreground/70">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-semibold text-green-900">
            {formatPrice(product.priceCents)}
          </span>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceCents={product.priceCents}
            size={product.size}
            inStock={inStock}
          />
        </div>
        {!inStock && (
          <p className="text-xs font-medium text-terracotta-600">Currently sold out</p>
        )}
      </div>
    </div>
  );
}
