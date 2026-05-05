# Getting Started

Last updated: 2026-05-02 (storage pointer pattern + verify_jwt:false documented)
Status: Active onboarding guide

Get BidOnDent running locally with Clerk + Supabase in about 10 minutes.

**Scope note:** This guide is for local setup and first-run flow. For current execution truth during hardening, read [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md), then [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) and [`README.md`](README.md).

**AI agents:** read [`../AGENTS.md`](../AGENTS.md) (or [`../CLAUDE.md`](../CLAUDE.md)) at the repo root before starting any work. It points to the load-bearing rules and skill set.

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

### Local browser audit mode (browser hits the local Docker Supabase stack)

When the browser needs to exercise the local Docker Supabase stack instead of the cloud project, use the repo-owned helper. It auto-discovers the local API URL and anon key — no copy/paste of secrets, no proxy hop.

```bash
supabase start            # if the local stack isn't already running
npm run dev:local-browser
```

Open: http://localhost:5173

Notes:

- `npm run dev:local-browser` runs `supabase status -o env` to read the local Docker `API_URL` and `ANON_KEY`, then starts Vite with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set to those values for that process only. Your `.env` is not modified.
- The dev-server CSP in `vite.config.ts` allow-lists `http://127.0.0.1:54321` and `http://localhost:54321` for dev only, so the browser can call the local stack directly. The production CSP (set via Vercel headers) is unaffected.
- Override the discovered URL only if needed: `BIDONDENT_LOCAL_SUPABASE_URL=http://127.0.0.1:54321 npm run dev:local-browser`.

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
- Local browser audit can't reach Supabase: confirm `supabase start` is running and `npm run dev:local-browser` printed the local API URL on startup. The dev-server CSP allows local Supabase on `127.0.0.1:54321` / `localhost:54321` only — if you point `BIDONDENT_LOCAL_SUPABASE_URL` at a different host or port, extend the CSP `connect-src` in `vite.config.ts` (dev block only).
- Auth UI not loading: verify Clerk key starts with `pk_`.
- Database errors: confirm migrations ran in order.
- Photos not uploading: confirm the canonical media buckets exist and the `server` edge function is deployed.
- Photos uploaded but not rendering after a day: storage pointer pattern issue. See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §16 — DB should hold `storage://…` pointers, never raw signed URLs.
- Signed-in users see empty dashboards / 401s on every API call: gateway `verify_jwt` was flipped back to `true`. See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §17 to fix.

## Next docs

- Supabase setup details: `SUPABASE_SETUP_GUIDE.md`
- Google OAuth: `GOOGLE_OAUTH_SETUP.md`
- Current documentation index: `README.md`
- Full overview: `../README.md`
