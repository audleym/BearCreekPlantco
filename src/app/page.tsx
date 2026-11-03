import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const heroButtons = [
  { href: "/shop?category=annual-flowers", label: "Annuals", icon: "/brand/icon-annuals.png" },
  {
    href: "/shop?category=hanging-baskets",
    label: "Hanging Baskets",
    icon: "/brand/icon-hanging-baskets.png",
  },
  { href: "/shop", label: "Shop All Plants", icon: "/brand/icon-shop-all.png" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <h1 className="sr-only">
          {siteConfig.name}: greenhouse grown, locally trusted plants
        </h1>
        <div className="relative overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/brand/hero-banner.jpg"
            alt={`${siteConfig.name} greenhouse filled with hanging baskets and annual flowers. Greenhouse Grown, Locally Trusted.`}
            width={1672}
            height={941}
            preload
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="h-auto w-full"
          />
          {/* Sits on the strip built into the photo; on phones it gets its own backing to stay tappable. */}
          <nav
            aria-label="Shop plants"
            className="absolute inset-x-0 bottom-0 grid h-[15.5%] min-h-14 grid-cols-3 divide-x divide-white/40 bg-green-900/90 py-2 sm:bg-transparent sm:py-3"
          >
            {heroButtons.map((button) => (
              <Link
                key={button.href}
                href={button.href}
                className="flex flex-col items-center justify-center gap-1 px-1 text-center text-xs font-medium uppercase tracking-wide text-white transition hover:bg-white/15 focus-visible:bg-white/15 sm:text-sm"
              >
                <Image
                  src={button.icon}
                  alt=""
                  width={76}
                  height={70}
                  className="hidden h-8 w-auto sm:block"
                />
                {button.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

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
