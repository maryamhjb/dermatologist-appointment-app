# Dermatologist appointment app

A Persian (RTL) web application for **online appointment booking**, **patient dashboards**, and a **staff admin panel**, built for a dermatology practice (branding: دکتر مریم حاجی‌بابایی). Patients sign in with **email one-time passwords (OTP)** via [Supabase Auth](https://supabase.com/docs/guides/auth). Data lives in **PostgreSQL** on Supabase with **Row Level Security (RLS)**.

---

## Features

### Public site

- Marketing home page (hero, features, offices).
- Gallery route (`/gallery`).
- Header navigation is defined in `lib/navigation/public-nav.ts`.

### Authentication

- Single entry: **`/auth/login`** — email + OTP for both login and registration (registration collects name in user metadata).
- **`/auth/callback`** — exchanges Supabase magic-link `code` or `token_hash` for a session (see `app/auth/callback/route.ts`).
- **`proxy.ts`** (Next.js 16 request proxy) refreshes the auth session and redirects root-level auth query strings (`/?code=…`) to `/auth/callback` when redirect URLs are misconfigured in Supabase.

### Patient dashboard (`/dashboard`)

- View appointments, open booking dialog, browse procedures, see loyalty points.
- **Admin link** (“پنل مدیریت”) appears when the signed-in user has a row in `public.admin_users`. Detection uses the server plus **`SUPABASE_SERVICE_ROLE_KEY`** so RLS quirks on `admin_users` do not hide staff from seeing the link.

### Admin panel (`/admin/dashboard`)

- Staff-only UI; access is verified via **`GET /api/me/admin`**, which reads `admin_users` with the service role after validating the session.
- Roles: `super_admin` vs `assistant` (defined on `admin_users.role`).
- Legacy URL `/admin/login` points users at the same OTP flow as patients (`/auth/login`).

### API routes

- **`/api/me/admin`** — returns `{ isAdmin, admin }` for the current session (dynamic, no cache).
- **`/api/init-db`** — reference route that attempted schema setup via `exec` RPC; **production setups should apply SQL with `psql` instead** (see Database).

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [shadcn-style](https://ui.shadcn.com/) components |
| Auth & database | [Supabase](https://supabase.com/) (`@supabase/ssr`, `@supabase/supabase-js`) |
| Forms | react-hook-form, Zod |
| Package manager | pnpm (see `packageManager` in `package.json`) |

---

## Prerequisites

- **Node.js** (LTS recommended).
- **pnpm** (`corepack enable` or install globally).
- A **Supabase project** with Auth and a Postgres database.

---

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in values from the Supabase dashboard (**Project Settings → API** and **Database**).

| Variable | Required for | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | App | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App | Public anon key (RLS applies). |
| `NEXT_PUBLIC_SITE_URL` | Auth redirects | e.g. `http://localhost:3000` in dev; production origin in prod. |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin detection | **Server only.** Never expose to the client. Used to read `admin_users` for `/api/me/admin` and the dashboard admin link when RLS blocks anon reads. |
| `POSTGRES_URL_NON_POOLING` | Migrations / CLI | Direct Postgres URL for `psql` (optional for app runtime). |

Other keys in `.env.example` may come from hosting templates (e.g. Vercel); keep them if your deployment supplies them.

### 3. Supabase Auth URLs

In **Authentication → URL Configuration**:

- Set **Site URL** to your app origin (e.g. `http://localhost:3000`).
- Add **Redirect URLs**: `{origin}/auth/callback` and `{origin}/auth/callback/**`.

Enable **Email** provider and, if you use 6-digit codes, configure email OTP per Supabase docs.

### 4. Database schema and RLS

Apply the canonical migration (idempotent policies, seeds offices, etc.):

```bash
# From project root, with POSTGRES_URL_NON_POOLING in the environment:
psql "$POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f scripts/migrate_to_app_schema.sql
```

Alternative reference scripts live under `scripts/` (e.g. `setup_database.sql`, `001_create_tables.sql`). Prefer **`migrate_to_app_schema.sql`** so RLS policies match what the app expects.

The `public` schema includes (among others):

- **`offices`** — clinic locations and availability.
- **`procedures`** — services, pricing, duration (FA labels).
- **`time_slots`** — bookable slots per office/date.
- **`patients`** — profile row per auth user (`id` = `auth.users.id`), points.
- **`appointments`** — links patient, office, slot, procedure, status.
- **`comments`** — patient comments / ratings; moderation fields reference **`admin_users`**.
- **`point_transactions`**, **`point_settings`** — loyalty accounting.
- **`admin_users`** — staff: `id` references `auth.users`, `role` ∈ `super_admin` | `assistant`.

RLS is enabled on these tables; policies generally allow patients to see their own data and allow staff actions when `auth.uid()` appears in `admin_users`.

### 5. Granting admin access

Admins are **not** inferred from a flag on `auth.users`. Insert a row into `public.admin_users` using the user’s UUID from `auth.users` (Supabase **Authentication → Users** or SQL):

```sql
INSERT INTO public.admin_users (id, full_name, role, email)
VALUES (
  'USER_UUID_FROM_AUTH',
  'Display Name',
  'super_admin',
  'user@example.com'
);
```

Use `assistant` for a limited staff role. Ensure **`SUPABASE_SERVICE_ROLE_KEY`** is set in `.env.local` so the app can detect admins reliably.

### 6. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build
pnpm start
```

---

## Project structure (high level)

```text
app/
  (public)/          # Marketing routes (home, gallery)
  admin/             # Admin UI
  auth/              # Login + OAuth/OTP callback route
  dashboard/         # Server page + client dashboard shell
  api/               # Route handlers (init-db, me/admin)
components/          # UI, layout, booking, auth forms
lib/
  auth/              # Server-only admin row loader
  navigation/        # Public nav config
  supabase/          # Browser, server, service-role clients
  site-brand.ts      # Persian titles / doctor naming
scripts/             # SQL migrations and legacy setup files
proxy.ts             # Next.js 16 proxy: session refresh + auth redirect helper
```

Supabase clients:

- **`lib/supabase/client.ts`** — browser (anon key).
- **`lib/supabase/server.ts`** — server components / route handlers (cookies).
- **`lib/supabase/service-role.ts`** — server-only; bypasses RLS for controlled reads (never import from client code).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint |

---

## Why a separate `admin_users` table?

Staff records need **`role`**, display fields, and **foreign keys** from tables like `comments` and `point_settings`. Keeping them in `public.admin_users` (keyed by `auth.users.id`) avoids overloading `auth` metadata, keeps RLS rules explicit, and matches Supabase’s split between **Auth** and **application data**.

---

## v0

This repository was originally bootstrapped with [v0](https://v0.app); you can keep iterating there if your workflow is linked to that project.

---

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Supabase Auth (SSR)](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
