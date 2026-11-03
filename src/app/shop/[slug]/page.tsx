import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.active) notFound();

  const category = getCategory(product.category);
  const related = await prisma.product.findMany({
    where: { category: product.category, active: true, NOT: { id: product.id } },
    take: 3,
  });

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted">
        <Link href="/shop" className="hover:text-green-700">
          Shop
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/shop?category=${category.slug}`} className="hover:text-green-700">
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {product.imageUrl ? (
          <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-green-50 md:h-[28rem]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-[center_25%]"
              priority
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="flex h-80 items-center justify-center rounded-3xl bg-green-50 text-8xl"
          >
            🌿
          </div>
        )}

        <div>
          <h1 className="font-display text-3xl font-semibold text-green-900">
            {product.name}
          </h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-muted">{product.size}</p>
          <p className="mt-4 font-display text-2xl font-semibold text-green-900">
            {formatPrice(product.priceCents)}
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              priceCents={product.priceCents}
              size={product.size}
              inStock={inStock}
              className="px-8 py-3 text-base"
            />
            {!inStock && (
              <p className="mt-2 text-sm font-medium text-terracotta-600">
                Currently sold out — check back soon.
              </p>
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-green-50 p-4 text-sm text-foreground/80">
            Orders are picked up at the greenhouse — choose your pickup date at checkout.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-green-900">
            You might also like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
