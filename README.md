# Bear Creek Plant Company — Website

A Next.js site for Bear Creek Plant Company (Central Illinois greenhouse): a
marketing site plus online ordering with Stripe checkout and in-store pickup.

## What's here

- **Public site**: Home, Shop (by category), product pages, About, Hours & Contact
- **Cart & checkout**: client-side cart (localStorage) → Stripe Checkout → pickup-date order
- **Admin area** (`/admin`): view/update orders, manage products & stock, read contact inquiries
- **Database**: Prisma + Postgres (hosted free on Neon) — same database for local dev and production
- **Product catalog**: seeded from Bear Creek's actual spring order (`prisma/seed.ts`) — see below

## About the product photos

Most products (91 of 105) ship with a photo pulled from the breeder/grower photos
in Hummert's variety catalog, since that's standard practice for growers selling
plants they've grown from purchased liners. They're placeholders, not your own
photography — swap them for real photos of your plants once they're growing, by
replacing the matching file in `public/products/<slug>.jpg` (same filename) or
setting a new image URL per product from `/admin/products`. A few items
(3 ornamental grasses, 1 coleus, and 10 combo-basket mixes) don't have a catalog
photo and show a leaf emoji placeholder instead — those are good candidates for
early real photos.

## First-time setup

```bash
npm install
cp .env.example .env.local   # then also copy the same values into .env (Prisma CLI reads .env)
                              # — DATABASE_URL should be your Neon connection string
npm run db:push              # syncs the database schema from prisma/schema.prisma
npm run db:seed              # loads/updates the product catalog + a few pickup dates
npm run dev                  # http://localhost:3000
```

### Required setup before going live

1. **Business info** — edit `src/lib/site-config.ts` with your real town/ZIP, phone,
   and email (a few fields are marked `TODO` / `ADD YOUR...`).
2. **Stripe** — create a free account at https://dashboard.stripe.com, grab your
   **secret key** from the Dashboard → Developers → API keys, and put it in
   `STRIPE_SECRET_KEY` in `.env.local`. For the webhook (below), you'll also need
   `STRIPE_WEBHOOK_SECRET`.
3. **Admin password** — set `ADMIN_PASSWORD` in `.env.local` to something only you know.
   That's the password for `/admin`.
4. **Products** — the seeded catalog in `prisma/seed.ts` reflects your real spring
   order (105 items — all individual plants at $4, all combo mixes as $15 hanging
   baskets). Stock counts are placeholders; set real quantities, adjust prices, or
   add/remove items any time from `/admin/products`,
   or edit `prisma/seed.ts` and re-run `npm run db:seed`.
5. **Pickup dates** — also seeded as a few upcoming Saturdays. For now, add/edit these
   directly in the database (e.g. with `npm run db:studio`, which opens a visual
   database editor) — there's no admin UI for pickup dates yet.

### Customer sign-in with Google (optional)

Customers can sign in with Google to see their past orders at `/account`, get their
name/email pre-filled at checkout, and turn email updates on/off. The "Sign in" link
stays hidden until these three variables are set:

1. Go to https://console.cloud.google.com/apis/credentials → **Create credentials →
   OAuth client ID** (if asked, first set up the consent screen: External, app name
   "Bear Creek Plant Company", your email).
2. Application type **Web application**. Under **Authorized redirect URIs** add
   `https://bearcreekplantco.com/api/auth/google/callback` (and
   `http://localhost:3000/api/auth/google/callback` for local testing).
3. Put the client ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and set
   `SESSION_SECRET` to any long random string (in `.env.local` and in Vercel).

### Email updates list

There's a signup form in the footer of every page, an opt-in checkbox at checkout,
and a toggle on `/account`. View subscribers and download a CSV at
`/admin/subscribers` — import it into Mailchimp, a Gmail mail merge, etc. Each row
has a personal `unsubscribe_url`; include it at the bottom of every email you send
(it's required by anti-spam law, and it marks them unsubscribed here too).

### Stripe webhook (needed so paid orders actually get marked "paid")

Stripe needs a way to tell the site when a payment succeeds.

- **Local development**: install the [Stripe CLI](https://docs.stripe.com/stripe-cli),
  then run:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
  This prints a `whsec_...` value — put it in `STRIPE_WEBHOOK_SECRET` in `.env.local`.
- **Production**: in the Stripe Dashboard → Developers → Webhooks, add an endpoint
  pointing at `https://yourdomain.com/api/stripe/webhook`, subscribed to the
  `checkout.session.completed` event. Stripe will give you a webhook signing secret —
  put that in `STRIPE_WEBHOOK_SECRET` on your hosting provider.

## Deploying

The easiest path is **[Vercel](https://vercel.com)** (made by the Next.js team, free tier
is plenty for a small business site):

1. Push this repo to GitHub (already done — `audleym/BearCreekPlantco`).
2. Import it into Vercel (vercel.com → Add New Project → pick the repo).
3. In Vercel's project settings → Environment Variables, add everything from
   `.env.example` with your real values (`DATABASE_URL` is the same Neon
   connection string already in use; `STRIPE_SECRET_KEY`, `ADMIN_PASSWORD`, etc.
   — `NEXT_PUBLIC_SITE_URL` should be set to your real `*.vercel.app` domain,
   or your custom domain once you have one).
4. Deploy. The database already has the schema and product catalog loaded, so
   no extra setup is needed there.
5. Add the Stripe webhook pointed at your live domain (see above), then set the
   `STRIPE_WEBHOOK_SECRET` it gives you in Vercel's environment variables and
   redeploy.
6. If you have a domain already, point it at Vercel in your project's Domains settings.

## Useful commands

| Command            | What it does                                      |
| ------------------ | -------------------------------------------------- |
| `npm run dev`       | Start the local dev server                         |
| `npm run build`     | Production build (also run by your host on deploy) |
| `npm run db:push`   | Sync the database schema                           |
| `npm run db:seed`   | Load/update the starter product catalog            |
| `npm run db:studio` | Open a visual database browser/editor              |

## Project structure

```
prisma/schema.prisma      Database schema (Product, Order, OrderItem, PickupDate, Inquiry)
prisma/seed.ts             Starter product catalog + pickup dates
src/lib/site-config.ts     Business name, address, phone, hours — edit this first
src/lib/categories.ts      Shop category list
src/app/                   Pages (home, shop, cart, checkout, admin, etc.)
src/app/api/                API routes (checkout, Stripe webhook, admin, contact)
src/components/             Shared UI + the cart
```
