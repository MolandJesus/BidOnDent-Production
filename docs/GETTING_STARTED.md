# Getting Started

Last updated: April 3, 2026
Status: Active onboarding guide

Get BidOnDent running locally with Clerk + Supabase in about 10 minutes.

Scope note: This guide is for local setup and first-run flow. For current execution truth, read `CLAUDE_AI_MASTER_CONTEXT.md`, `BIDONDENT_MAP_TRACKER_2026-03-21.md`, and `docs/README.md` instead of relying on archived baseline snapshots.

## Prerequisites

- Node.js 18+
- Clerk account: https://clerk.com
- Supabase account: https://supabase.com

## 1) Install dependencies

```bash
npm install
```

## 2) Configure keys

Update the key files in the repo:

- `utils/clerk/info.tsx` -> set `clerkPublishableKey`
- `utils/supabase/info.tsx` -> set `projectId` and `publicAnonKey`
- optional local operator secrets go in `.env` only:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD`

Key locations:

- Clerk: Dashboard -> Your App -> API Keys
- Supabase: Project Settings -> API -> Project URL and anon key

Keep all `.env` values local-only. Do not commit `.env` or `.env.*` files.

## 3) Run database migrations

Follow the order in `supabase/migrations/README.md` and run each migration in Supabase SQL Editor.

This creates:

- Core tables (profiles, vehicles, damage reports, bids)
- Website identity/session tables (`website_preferences`, `website_relationships`)
- RLS policies and indexes
- Canonical website storage buckets (`bidondent-account-media`, `bidondent-vehicle-media`, `bidondent-report-media`)

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

- Missing keys: re-check `utils/clerk/info.tsx` and `utils/supabase/info.tsx`.
- Auth UI not loading: verify Clerk key starts with `pk_`.
- Database errors: confirm migrations ran in order.
- Photos not uploading: confirm the canonical media buckets exist and the `server` edge function is deployed.

## Next docs

- Supabase setup details: `SUPABASE_SETUP_GUIDE.md`
- Google OAuth: `GOOGLE_OAUTH_SETUP.md`
- Current documentation index: `README.md`
- Full overview: `../README.md`
