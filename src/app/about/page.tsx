import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${siteConfig.name}, a greenhouse in Central Illinois.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-green-900 sm:text-4xl">
        About {siteConfig.name}
      </h1>
      <p className="mt-6 text-base leading-relaxed text-foreground/80">
        {siteConfig.name} is a family-run greenhouse in Central Illinois, growing
        high-quality annuals, hanging baskets, combo planters, perennials, and herbs
        from the ground up. Every plant we sell is grown right here in our own
        greenhouse — not trucked in from somewhere else — so you get strong, healthy
        plants that are ready to thrive in your garden.
      </p>
      <p className="mt-4 text-base leading-relaxed text-foreground/80">
        Each spring we fill our greenhouse with a huge variety of annual flowers,
        geraniums, hanging baskets, and more — from tried-and-true favorites to the
        newest varieties. We love helping neighbors fill their porches, patios, and
        flower beds with color that lasts all season.
      </p>
      <p className="mt-4 text-base leading-relaxed text-foreground/80">
        Order online and pick up fresh from the greenhouse, or stop by in person during
        the season to see what&apos;s blooming.
      </p>
    </div>
  );
}
