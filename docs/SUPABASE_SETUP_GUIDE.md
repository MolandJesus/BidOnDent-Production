# Supabase Setup Guide

Last updated: March 21, 2026

BidOnDent uses Clerk for authentication and Supabase for application data, storage, and edge-function-backed website services.

## Current Production Truth

- Project ref: `wmdcnjgtsppftrofaqqa`
- Canonical edge function: `server`
- Legacy alias still deployed: `make-server-9f243523`
- Verified live edge version: `2026-03-21-v10`
- Canonical website buckets:
  - `bidondent-account-media`
  - `bidondent-vehicle-media`
  - `bidondent-report-media`
- Legacy buckets intentionally kept for old uploaded assets:
  - `bidondent-profiles`
  - `bidondent-vehicles`
  - `bidondent-damage-photos`
- Removed legacy empty bucket:
  - `bidondent-landing-page-images`

## What Supabase Owns

- `profiles`, `vehicles`, `damage_reports`, `bids`
- provider-agnostic website memory in `website_preferences`
- provider-agnostic durable relationship rows in `website_relationships`
- provider-agnostic shop and insurer directory profiles
- uploaded media and public file URLs
- edge handlers for profile sync, map/session sync, storage, and admin utilities

## What Clerk Owns

- sign-up and sign-in
- session lifecycle
- account deletion at the auth-provider layer
- top-level user identity that BidOnDent translates into `websiteIdentity`

## Local Configuration

Tracked source keys:

- `utils/clerk/info.tsx` -> `clerkPublishableKey`
- `utils/supabase/info.tsx` -> `projectId`, `publicAnonKey`

Local-only operator secrets in `.env`:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

Do not commit `.env` or paste raw secret values into tracked documentation.

## Database Setup

Run the migrations in `supabase/migrations/` in order. The important current website-era migrations are:

1. `005_create_website_preferences_table.sql`
2. `006_make_business_profiles_provider_agnostic.sql`
3. `007_create_website_relationships_table.sql`
4. `008_organize_website_storage_and_profiles.sql`

These add:

- provider-agnostic website identity columns on `profiles`
- durable website preference storage
- durable relationship storage for saved shops/watchlists/shortlists/carriers
- canonical media buckets

## Edge Function Deploy

CLI deploy commands:

```bash
supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa
supabase functions deploy make-server-9f243523 --project-ref wmdcnjgtsppftrofaqqa
```

The second deploy exists only to preserve compatibility with older callers while the repo finishes moving fully to the canonical `server` slug.

## Storage Contract

Use canonical buckets for all new uploads:

- profile/account images -> `bidondent-account-media`
- vehicle images -> `bidondent-vehicle-media`
- report images -> `bidondent-report-media`

Do not create new uploads in `bidondent-landing-page-images`.

Do not delete `bidondent-profiles`, `bidondent-vehicles`, or `bidondent-damage-photos` until existing asset references have been fully migrated.

## Verification Checklist

- `server/health` returns status `ok`
- canonical buckets exist
- `website_preferences` exists
- `website_relationships` exists
- `profiles` has `clerk_user_id` and `website_user_key`
- new profile image uploads land in `bidondent-account-media`
- map/session sync reads and writes through the deployed edge routes

## Current Frontend Contract

The frontend should use:

- `src/app/services/supabase/runtime.ts`
- `src/app/services/supabase/admin.ts`
- `src/app/services/auth/websitePreferencesSync.ts`
- `src/app/services/auth/websiteRelationshipsSync.ts`

Avoid hardcoding function URLs or bucket names directly in components.
