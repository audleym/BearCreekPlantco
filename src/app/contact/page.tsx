import type { Metadata } from "next";
import { fullAddress, siteConfig } from "@/lib/site-config";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Hours & Contact",
  description: `Visit ${siteConfig.name} in Central Illinois — hours, location, and contact info.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-green-900 sm:text-4xl">
        Visit &amp; Contact
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-green-900">Location</h2>
            <p className="mt-2 text-sm text-foreground/80">{fullAddress}</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-green-900">Hours</h2>
            <p className="mt-1 text-sm text-foreground/60">{siteConfig.seasonNote}</p>
            <dl className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {siteConfig.hours.map((h) => (
                <div key={h.day} className="flex justify-between px-4 py-2.5 text-sm">
                  <dt className="font-medium text-foreground">{h.day}</dt>
                  <dd className="text-foreground/70">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-green-900">Get in Touch</h2>
            {siteConfig.phone && (
              <p className="mt-2 text-sm text-foreground/80">
                Phone:{" "}
                <a href={siteConfig.phoneHref} className="text-green-700 hover:underline">
                  {siteConfig.phone}
                </a>
              </p>
            )}
            <p className="mt-1 text-sm text-foreground/80">
              Email:{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-green-700 hover:underline">
                {siteConfig.email}
              </a>
            </p>
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline"
            >
              Follow us on Facebook →
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-green-900">Send a Message</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Have a question about availability, a large order, or anything else? Send us a
            note and we&apos;ll get back to you.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
