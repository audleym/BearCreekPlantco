import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { categories, getCategory } from "@/lib/categories";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Shop Plants",
  description: "Browse everything currently available at the greenhouse.",
};

type SearchParams = Promise<{ category?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category } = await searchParams;
  const activeCategory = category ? getCategory(category) : undefined;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(activeCategory ? { category: activeCategory.slug } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-green-900 sm:text-4xl">
          Shop Plants
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Everything below is currently available for pickup at the greenhouse. Add what
          you&apos;d like to your cart, then choose a pickup date at checkout.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !activeCategory
              ? "border-green-700 bg-green-700 text-green-50"
              : "border-border bg-surface text-foreground/80 hover:border-green-600"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activeCategory?.slug === cat.slug
                ? "border-green-700 bg-green-700 text-green-50"
                : "border-border bg-surface text-foreground/80 hover:border-green-600"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-sm text-foreground/70">
          Nothing available in this category right now — check back soon!
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
