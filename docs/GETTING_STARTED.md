# Getting Started

Last updated: April 14, 2026 (Phase 1.5 .env migration complete)
Status: Active onboarding guide

Get BidOnDent running locally with Clerk + Supabase in about 10 minutes.

Scope note: This guide is for local setup and first-run flow. For current execution truth during hardening, read [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md), then [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) and [`README.md`](README.md).

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Clerk account: https://clerk.com
- Supabase account: https://supabase.com

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

```bash
cp .env.example .env
```

Fill in your `.env` with:

| Variable                     | Source                                                    |
| ---------------------------- | --------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → Your App → API Keys (starts with `pk_`) |
| `VITE_SUPABASE_URL`          | Supabase Project Settings → API → Project URL             |
| `VITE_SUPABASE_ANON_KEY`     | Supabase Project Settings → API → anon/public key         |

Optional for local development:

- `SUPABASE_ACCESS_TOKEN` — CLI auth for deployments
- `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD` — direct Postgres access

Keep all `.env` values local-only. Do not commit `.env` or `.env.*` files.

## 3) Bootstrap the database

As of 2026-04-15 the schema is a single consolidated migration: [`supabase/migrations/20251230000001_full_schema.sql`](../supabase/migrations/20251230000001_full_schema.sql). The 27 historical incremental migrations are archived at `supabase/migrations/_archived/` and must not be re-applied — see that folder's README for context.

### Option A — Local Docker stack (preferred for dev)

Install the Supabase CLI, make sure Docker Desktop is running, then from the repo root:

```bash
supabase start
```

The CLI spins up Postgres + Studio + edge runtime locally and applies `20251230000001_full_schema.sql` on first boot. Studio is at http://127.0.0.1:54323.

### Option B — Dashboard paste against a hosted project

If you're bootstrapping a brand-new hosted Supabase project (fresh staging, cloned prod, personal sandbox):

1. Open the project's SQL Editor in the Supabase dashboard.
2. Paste the contents of `supabase/migrations/20251230000001_full_schema.sql` and run it.
3. Verify: 17 tables in `public`, 34 RLS policies, 3 canonical + 3 legacy storage buckets (all `public = false`), PostGIS enabled.

`supabase db push` is **not** a supported path right now: production's migration history contains the old per-file names, so a push would try to re-apply the consolidated file and fail. Dashboard paste is the current bootstrap path for hosted environments.

This bootstrap creates:

- Core tables (profiles, vehicles, damage reports, bids)
- Website identity/session tables (`website_preferences`, `website_relationships`)
- RLS policies, indexes, triggers
- Canonical storage buckets (`bidondent-account-media`, `bidondent-vehicle-media`, `bidondent-report-media`) — all private, accessed via edge functions + signed URLs

## 4) Start the app

```bash
npm run dev
```

Open: http://localhost:5173

## 5) First login

Regular user:

- Sign up with any email
- Choose account type: Customer, Shop, or Insurer
- Complete account setup

## Data persistence notes

- Supabase stores profiles, vehicles, reports, and photo URLs.
- Website memory for the new map and account-aware search experience syncs through Supabase edge routes and `website_preferences` / `website_relationships`.
- localStorage is used as a per-user cache for speed.
- Report drafts are local-only and do not sync across devices.

## Common issues

- Missing keys: verify `.env` has `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` set.
- Auth UI not loading: verify Clerk key starts with `pk_`.
- Database errors: confirm migrations ran in order.
- Photos not uploading: confirm the canonical media buckets exist and the `server` edge function is deployed.

## Next docs

- Supabase setup details: `SUPABASE_SETUP_GUIDE.md`
- Google OAuth: `GOOGLE_OAUTH_SETUP.md`
- Current documentation index: `README.md`
- Full overview: `../README.md`
