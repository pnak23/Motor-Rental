# Angkor Wheels Rental — Motorbike Rental Platform (Siem Reap)

A full-stack motorbike rental website and admin management system for a rental
business in Siem Reap, Cambodia: a public booking site plus a role-based admin
dashboard that controls every piece of content and business data on the site.

Built with **Nuxt 4** (Vue 3 + TypeScript), using Nuxt's own server API as the
backend (no separate NestJS service needed), **PostgreSQL** as the database,
and **Bootstrap 5** for layout/components with a custom design system on top.

---

## 1. Quick start

### Option A — Docker (recommended, closest to production)

```bash
cp .env.example .env          # edit JWT_SECRET at minimum
docker compose up --build
```

This starts Postgres (with the schema auto-applied from
`prisma/migrations/0001_init/migration.sql`) and the app on
**http://localhost:3000**. Run the seed script once the containers are up:

```bash
docker compose exec app node --env-file=.env prisma/seed.ts
# if tsx isn't available in the runtime image, seed from your host instead:
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/motorbike_rental?schema=public" npx tsx prisma/seed.ts
```

### Option B — Local Node + local/remote Postgres

```bash
npm install
cp .env.example .env                     # point DATABASE_URL at your Postgres
psql "$DATABASE_URL" -f prisma/migrations/0001_init/migration.sql
npm run db:seed                          # seeds demo data + admin login
npm run dev                              # http://localhost:3000
```

**Admin login (seeded):**
- Platform super admin: `admin@siemreapwheels.com` / `Admin123!`
- Angkor Wheels Rental shop owner: `owner@angkorwheels.com` / `Owner123!`
- Pub Street Scooters shop owner: `owner@pubstreetscooters.com` / `Owner123!`

Admin dashboard: **http://localhost:3000/admin**

### Production build

```bash
npm run build
node --env-file=.env .output/server/index.mjs
```

(Nitro's Node server does **not** auto-load `.env` in production the way
`nuxt dev` does — either use `--env-file` (Node ≥ 20.6) or export the
variables another way, e.g. your process manager / Docker `environment:`.)

---

## 2. A note on the tech stack: Prisma schema, `pg` at runtime

The spec asked for Prisma as the ORM. `prisma/schema.prisma` is included and
is the **authoritative, accurate model of the database** — every table,
column, enum, relation, and index in the app is defined there first.

However, actually running Prisma's CLI (`generate`/`migrate`/`db push`) turned
out to require downloading a native engine binary from Prisma's own CDN
(`binaries.prisma.sh`), and that download is blocked in the sandboxed
environment this project was built in. I tried the legitimate ways around it
(Prisma 7's new Rust-free query-compiler + driver-adapter mode, matching WASM
engine packages from npm, downgrading to Prisma 6) — all of them still needed
that one blocked network call somewhere in the CLI's schema-parsing path.
Rather than trying to route around a deliberate network restriction, I:

1. Hand-wrote the SQL migration (`prisma/migrations/0001_init/migration.sql`)
   to match `schema.prisma` exactly, column for column.
2. Built the server's data-access layer directly on **`pg`** (node-postgres)
   with parameterized, reviewable SQL (`server/utils/db.ts` and the query
   code in each `server/api/**` handler) instead of the generated Prisma
   Client.

This is a completely standard, production-proven pattern (not a workaround
hack) — plenty of real Nuxt/Node apps talk to Postgres this way — and it has
the side benefit of zero native-binary dependency at deploy time. If you have
normal internet access and would prefer the generated Prisma Client, you can
still run `npx prisma generate` / `npx prisma migrate dev` yourself; the
schema is ready for it, nothing else needs to change to start adopting it
incrementally.

---

## 3. What's implemented

Everything below is real, working code — not mock/demo stubs — and the core
flows (auth, booking creation + availability, motorbike CRUD + images,
booking status workflow) were exercised end-to-end against a live Postgres
instance while building this, including a concurrency test that confirmed two
overlapping booking requests for the same motorbike correctly resolve to one
success and one `409 Conflict`.

**Public website:** homepage (dynamic hero/banners/featured bikes/FAQ teaser),
motorbike listing with search/filter/sort/pagination, motorbike detail page
(gallery with zoom/fullscreen/swipe, specs, tiered pricing, live availability
+ price quote, booking form with instant confirmation + Telegram/WhatsApp/
call links), about, contact (form + dynamic info), FAQ, rental policy,
locations, how-it-works. Nothing here is hardcoded — business name, prices,
photos, FAQs, policies, locations, and hero/about copy all come from the
database and are editable from `/admin`.

**Admin dashboard (`/admin`):** JWT-cookie auth with `SUPER_ADMIN` / `ADMIN` /
`STAFF` roles enforced server-side on every admin API route; live dashboard
stats (motorbike counts, revenue today/week/month/year, rental stats, mini
charts, top motorbikes); motorbike CRUD with drag-and-drop image upload
(auto-optimized to WebP + thumbnail via `sharp`, set-primary, reorder,
delete) and per-motorbike custom pricing rules; booking management with a
full status timeline, financial adjustments (discount/charges/deposit), and
availability-safe date/motorbike edits; customer profiles with booking
history and block/unblock; locations, FAQ, and banner CRUD; maintenance
records that automatically take a motorbike out of the available pool;
a tabbed content/policy editor covering business info, social links,
homepage hero, about page, and every rental-policy field; user management
with role assignment; an audit log viewer; and a contact-message inbox.

**Booking engine:** tiered pricing (daily / weekly / monthly, plus optional
per-motorbike custom rules by day range), and a booking-availability check
that takes a row lock on the motorbike inside a transaction before checking
for date-range overlap — so two simultaneous booking requests for the same
bike cannot both succeed, which was verified live.

## 4. What's next (honest scope note)

The spec (50 sections) describes a full production SaaS platform; what's
above is a genuinely working system covering its core value, built and
smoke-tested end to end, but a few areas are intentionally lighter and would
be the natural next increment:

- **Reports/analytics** are real (live SQL aggregates) but the charts are
  simple CSS bar charts rather than a full charting library — swapping in
  Chart.js/Recharts is straightforward since the data shape is already there.
- **SEO extras** (sitemap.xml/robots.txt generation) aren't wired up yet;
  per-motorbike SEO fields (title/description/keywords/OG image) exist in the
  schema and are editable, just not yet consumed by a sitemap generator.
- **Notifications** (Telegram/email on new booking) are designed for —
  `business_settings`/env vars have the right fields — but not implemented;
  admins currently see new bookings via the dashboard/bookings list.
- **Payments** are intentionally not implemented (per the spec's own
  instruction not to build payment first), but the schema already has
  `paymentStatus` / `paymentMethod` / `paidAmount` columns ready for it.
- Categories are managed via a simple API (`/api/admin/categories`) rather
  than a dedicated admin page — fine for a handful of categories, would want
  a small UI page if the category list grows.

## 5. Project structure

```
motorbike-rental/
├── app/                      # Nuxt 4 app source
│   ├── pages/                # file-based routes (public + /admin/**)
│   ├── layouts/              # default (public), admin, blank (login)
│   ├── components/           # layout/, motorbike/, booking/, admin/, ui/
│   ├── stores/                # Pinia: auth, settings
│   ├── composables/           # useApi, useToast
│   ├── middleware/             # admin-auth route guard
│   └── assets/scss/main.scss  # design tokens + component styles
├── server/
│   ├── api/
│   │   ├── auth/              # login, logout, me
│   │   ├── public/            # motorbikes, bookings, settings, faqs, ...
│   │   └── admin/             # every admin-only CRUD endpoint
│   └── utils/                 # db, auth, availability, pricing, upload, audit
├── prisma/
│   ├── schema.prisma           # authoritative data model
│   ├── migrations/0001_init/   # hand-authored SQL matching the schema
│   └── seed.ts                 # demo data + admin user
├── public/uploads/motorbikes/  # uploaded photos (local storage)
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## 6. API overview

```
/api/auth/login | logout | me

/api/public/motorbikes            GET  (search/filter/sort/pagination)
/api/public/motorbikes/[slug]     GET  (detail)
/api/public/motorbikes/availability POST (quote + availability check)
/api/public/bookings               POST (create booking)
/api/public/locations | faqs | banners | settings   GET
/api/public/contact                POST

/api/admin/motorbikes              GET/POST, /[id] GET/PUT/DELETE
/api/admin/motorbikes/[id]/images         POST (upload)
/api/admin/motorbikes/[id]/images/[imageId]  DELETE
/api/admin/motorbikes/[id]/images/[imageId]/primary  PUT
/api/admin/motorbikes/[id]/images/reorder PUT
/api/admin/categories              GET/POST
/api/admin/bookings                GET, /[id] GET/PUT, /[id]/status PUT
/api/admin/customers                GET, /[id] GET/PUT
/api/admin/locations | faqs | banners  GET/POST, /[id] PUT/DELETE
/api/admin/maintenance              GET/POST, /[id] PUT/DELETE
/api/admin/pricing                  GET/POST, /[id] DELETE
/api/admin/settings                 GET/PUT
/api/admin/users                    GET/POST, /[id] PUT/DELETE
/api/admin/audit-logs               GET
/api/admin/contact-messages         GET, /[id] PUT
/api/admin/dashboard/stats          GET
```

All responses follow `{ success: true, data }` on success and throw H3 errors
(`{ statusCode, statusMessage }`) on failure, per the spec's error-handling
convention.

## 7. Security notes

- Passwords hashed with bcrypt; sessions are JWTs in an `httpOnly`,
  `sameSite=lax` cookie (marked `secure` automatically in production).
- Every `/api/admin/**` handler calls `requireAuth()` (optionally with a role
  allow-list) before touching data — there is no admin route that trusts the
  client.
- All SQL is parameterized (no string-built queries), and Zod validates every
  request body server-side (client-side validation is never trusted alone).
- Image uploads are validated by MIME type and size, then re-encoded through
  `sharp` (which also strips EXIF/metadata) before being written to disk —
  the original uploaded file is never persisted as-is.
