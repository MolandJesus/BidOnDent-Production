# Getting Started

Get BidOnDent running locally with Clerk + Supabase in about 10 minutes.

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

Key locations:
- Clerk: Dashboard -> Your App -> API Keys
- Supabase: Project Settings -> API -> Project URL and anon key

Optional: `.env.example` is included if you want to wire keys to Vite env later.

## 3) Run database migrations

Follow the order in `supabase/migrations/README.md` and run each migration in Supabase SQL Editor.

This creates:
- Core tables (profiles, vehicles, damage reports, bids)
- RLS policies and indexes
- Storage buckets (if using the storage migration)

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
- localStorage is used as a per-user cache for speed.
- Report drafts are local-only and do not sync across devices.

## Common issues

- Missing keys: re-check `utils/clerk/info.tsx` and `utils/supabase/info.tsx`.
- Auth UI not loading: verify Clerk key starts with `pk_`.
- Database errors: confirm migrations ran in order.
- Photos not uploading: confirm storage buckets exist.

## Next docs

- Supabase setup details: `SUPABASE_SETUP_GUIDE.md`
- Google OAuth: `GOOGLE_OAUTH_SETUP.md`
- Current documentation index: `README.md`
- Full overview: `../README.md`
