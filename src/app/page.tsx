import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site-config";
import { ProductCard } from "@/components/product-card";

// Featured products and stock change often — always render fresh.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "asc" },
    take: 4,
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-green-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
              Central Illinois • Greenhouse Grown
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-green-900 sm:text-5xl">
              Beautiful, healthy plants grown right here at home.
            </h1>
            <p className="mt-4 max-w-md text-base text-foreground/80">
              {siteConfig.description} Order online and pick up fresh from the greenhouse.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-green-50 shadow-sm transition hover:bg-green-600"
              >
                Shop Plants
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-green-700 px-6 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                Hours &amp; Location
              </Link>
            </div>
          </div>
          <div
            aria-hidden
            className="flex h-64 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-green-600/20 text-7xl sm:h-80"
          >
            🌱🌸🪴
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-green-900 sm:text-3xl">
            What We Grow
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-green-700 hover:underline">
            View full shop →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-green-600 hover:shadow-md"
            >
              <p className="font-display text-lg font-semibold text-green-900 group-hover:text-green-700">
                {cat.name}
              </p>
              <p className="mt-2 text-sm text-foreground/70">{cat.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-green-50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-semibold text-green-900 sm:text-3xl">
              Greenhouse Favorites
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-green-900 sm:text-3xl">
          Order Online, Pick Up at the Greenhouse
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Shop online",
              body: "Browse what's in season and add your favorites to the cart.",
            },
            {
              step: "2",
              title: "Pick a pickup date",
              body: "Choose a pickup window and pay securely online at checkout.",
            },
            {
              step: "3",
              title: "Swing by the greenhouse",
              body: "Pull in, grab your order, and get growing!",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-border bg-surface p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-sm font-bold text-white">
                {item.step}
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-green-900">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-foreground/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
