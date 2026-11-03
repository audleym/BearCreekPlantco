import Link from "next/link";
import { fullAddress, siteConfig } from "@/lib/site-config";
import { CopyrightYear } from "@/components/copyright-year";
import { NewsletterForm } from "@/components/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-green-900 text-green-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <div>
          <p className="font-display text-xl font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-green-100">{siteConfig.tagline}</p>
          <a
            href={siteConfig.facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-100 underline-offset-4 hover:underline"
          >
            Follow us on Facebook →
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-100/80">
            Visit Us
          </p>
          <p className="mt-2 text-sm text-green-100">{fullAddress}</p>
          {siteConfig.phone && (
            <p className="mt-1 text-sm text-green-100">{siteConfig.phone}</p>
          )}
          <p className="mt-1 text-sm text-green-100">{siteConfig.email}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-100/80">
            Quick Links
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/shop" className="text-green-100 hover:underline">
                Shop Plants
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-green-100 hover:underline">
                About the Greenhouse
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-green-100 hover:underline">
                Hours &amp; Location
              </Link>
            </li>
            <li>
              <Link href="/account" className="text-green-100 hover:underline">
                Your Account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-100/80">
            Get Email Updates
          </p>
          <p className="mt-2 text-sm text-green-100">
            Be the first to know when spring plants are ready and pickup days open up.
          </p>
          <NewsletterForm tone="dark" />
        </div>
      </div>
      <div className="border-t border-green-700/60 px-4 py-4 text-center text-xs text-green-100/70 sm:px-6">
        © <CopyrightYear /> {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
