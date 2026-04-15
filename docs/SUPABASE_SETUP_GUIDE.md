# Supabase Setup Guide — Full Backend Reference

> ### ⚠️ HARDENING PHASE NOTICE (2026-04-14)
>
> This guide remains the canonical backend reference, but several sections will be updated by hardening passes:
>
> - **Phase 1.5 (.env migration)** — COMPLETE. Clerk and Supabase keys now read from `.env` via `import.meta.env`. The old `utils/clerk/info.tsx` and `utils/supabase/info.tsx` files have been deleted.
> - **Phase 3.1 (RLS rollout)** — COMPLETE. All 10 launch-critical tables now have Clerk JWT-based RLS policies using `requesting_clerk_user_id()` SQL helper (extracts `sub` from `request.jwt.claims`). Policies use dual-path: Clerk JWT primary, `auth.uid()` fallback for backward compat. Prerequisite: Clerk JWT template "supabase" must be configured in Clerk Dashboard, signed with Supabase's JWT secret, for Realtime auth. Migration: `024_clerk_jwt_rls_policies.sql`.
> - **Phase 3.2 (Event capture)** — COMPLETE. `platform_activity_events` now has `actor_id`, `object_id`, `outcome` columns. All launch-critical write flows (report create, bid create, bid accept/reject, job assignment create) emit structured events. Migration: `025_event_capture_columns.sql`.
> - **Phase 3.3 (Idempotency)** — COMPLETE. Unique partial indexes on `bids(damage_report_id, clerk_shop_user_id)` and `job_assignments(damage_report_id)` prevent duplicate submissions. Bid acceptance has state-machine guard (only `pending → accepted/rejected`). Migration: `026_idempotency_guards.sql`.
> - **Phase 3.4 (Soft delete)** — COMPLETE. `deleted_at TIMESTAMPTZ` added to damage_reports, bids, job_assignments, vehicles. All delete handlers now set `deleted_at` instead of hard deleting. All query handlers filter `deleted_at IS NULL`. RLS policies filter deleted rows. Migration: `027_soft_delete.sql`. Account deletion in auth.ts still uses hard deletes (GDPR compliance).
> - **Section 13 (Edge Function Deployment)** still documents the `make-server-9f243523` legacy alias. That alias is a live backward-compatibility layer deferred to [Post-Launch Roadmap item L1](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md). Keep the current deploy command until L1 fires; do not remove it prematurely.
>
> During the hardening phase, execution law is the [Soft Launch Hardening Plan](BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md).

> ### 🔑 PREREQUISITE: Clerk JWT Template
>
> Clerk Dashboard **must** have a JWT template named **`supabase`** configured and signed with the Supabase project's JWT secret (`SUPABASE_JWT_SECRET`). Without this template, all Clerk-JWT RLS policies (`requesting_clerk_user_id()`) will return `NULL` and deny every authenticated request. Runtime verification is deferred to deployment smoke test.

Last updated: April 14, 2026 (Phase 3.1–3.4 complete — RLS, event capture, idempotency, soft delete)
Status: Active — comprehensive backend reference for current and future backend migration

BidOnDent uses **Clerk** for authentication/identity and **Supabase** for application data, file storage, and edge-function-backed API services. This document is the single source of truth for the entire backend architecture. If the project migrates to a different backend, this document defines every contract that must be replicated.

---

## 1. Production Environment

| Key                          | Value                                       |
| ---------------------------- | ------------------------------------------- |
| Supabase project ref         | `wmdcnjgtsppftrofaqqa`                      |
| Canonical edge function slug | `server`                                    |
| Legacy edge function slug    | `make-server-9f243523` (compatibility only) |
| Live edge build version      | `2026-03-21-v10`                            |
| Edge function runtime        | Deno (Supabase Edge Functions)              |
| Auth provider                | Clerk (JWT-based, verified server-side)     |

---

## 2. Ownership Boundaries

### Supabase Owns

- All application data tables (profiles, vehicles, damage_reports, bids, estimate_requests, etc.)
- Provider-agnostic website memory (`website_preferences`)
- Durable relationship storage (`website_relationships`)
- Shop and insurer directory profiles (`shop_profiles`, `insurer_profiles`)
- Uploaded media and signed file URLs (3 canonical + 3 legacy storage buckets)
- Edge function API — all CRUD handlers, workflow, navigation, intake, admin
- Rate limiting (in-memory, per-instance)
- Database initialization and migration

### Clerk Owns

- Sign-up, sign-in, session lifecycle
- JWT token issuance (verified by edge functions via JWKS)
- Account deletion at the auth-provider layer
- Top-level user identity → translated into `websiteIdentity` on the client

### Contract Rule

If switching backends, every route in `SUPABASE_EDGE_ROUTES` (Section 6) must have an equivalent endpoint. Every table in Section 8 must be replicated. Every auth guard in Section 10 must be preserved.

---

## 3. Local Configuration

### Frontend keys (`.env` — copy `.env.example` to `.env`)

| Variable                     | Source                                                |
| ---------------------------- | ----------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys (starts with `pk_`)        |
| `VITE_SUPABASE_URL`          | Supabase Project Settings → API → Project URL         |
| `VITE_SUPABASE_ANON_KEY`     | Supabase Project Settings → API → anon/public key     |
| `VITE_SENTRY_DSN`            | Sentry project DSN (optional, enables error tracking) |

### Operator secrets (`.env` only — never committed)

```
SUPABASE_ACCESS_TOKEN          # CLI auth for deployments
SUPABASE_DB_URL                # Direct Postgres connection string
SUPABASE_DB_PASSWORD           # Alternate to DB_URL
VITE_SUPABASE_URL              # Client-side Supabase URL
VITE_SUPABASE_SERVICE_ROLE_KEY # Server-side full-access key
```

### Edge function environment variables (set in Supabase dashboard)

```
SUPABASE_URL                   # Auto-injected by Supabase
SUPABASE_SERVICE_ROLE_KEY      # Auto-injected by Supabase
SUPABASE_ANON_KEY              # Auto-injected by Supabase
SUPABASE_DB_URL                # Direct Postgres URL for database_init
CLERK_SECRET_KEY               # For JWT verification
CLERK_PUBLISHABLE_KEY          # For Clerk API calls
```

---

## 4. Edge Function Server Architecture

### Entry point: `supabase/functions/server/index.ts`

The single Deno edge function (`server`) handles all API routes via path-based dispatch inside `Deno.serve()`. On cold start it runs `initializeDatabaseTables()` and `initializeStorageBuckets()`.

### Config files

| File                  | Purpose                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `config/constants.ts` | CORS headers, build version, admin email, environment variable extraction                                   |
| `config/clients.ts`   | Two Supabase clients: `supabase` (service role — full access) and `supabaseAuth` (anon key — RLS-protected) |

### Request flow

```
HTTP Request
  → OPTIONS? → 204 with CORS
  → Rate limit check (identity + IP)
  → Path extraction via stripFunctionPrefix()
  → Route dispatch (if/else chain in Deno.serve)
  → Handler function (auth → validate → DB operation → respond)
  → JSON response with CORS headers
```

---

## 5. Edge Function Handlers

All handlers live in `supabase/functions/server/handlers/`.

| Handler file               | Routes served                                               | Purpose                                                                     |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `admin.ts`                 | `/admin/*` (9 routes)                                       | User management, admin delegation, test accounts, intake operations         |
| `auth.ts`                  | `/track-login`, `/delete-account`                           | Login tracking, full account deletion                                       |
| `bids.ts`                  | `/bids` (CRUD)                                              | Bid lifecycle: create, list, update status, delete. Enriches with shop geo. |
| `estimate_requests.ts`     | `/estimate-requests` (POST/GET)                             | Customer estimate request submissions and retrieval                         |
| `health.ts`                | `/health`, `/health/deep`, `/migrate-database`              | Liveness check, DB connectivity check, migration trigger                    |
| `intake.ts`                | `/intake/shop-interest`, `/intake/insurer-interest`         | Public onboarding forms for shops and insurers                              |
| `navigation.ts`            | `/navigation-session` (GET/POST/DELETE)                     | Persistent map/flow state per user                                          |
| `network_profiles.ts`      | `/shop-profile`, `/insurer-profile`, `/directory-inventory` | Business profile CRUD, directory listing                                    |
| `preferences.ts`           | `/website-preferences` (GET/POST)                           | Provider-agnostic session memory (dashboard state, map prefs)               |
| `profiles.ts`              | `/user-profile` (GET/POST)                                  | User profile retrieval and creation (supports Clerk + website keys)         |
| `reports.ts`               | `/reports` (CRUD)                                           | Damage report lifecycle, marketplace inventory                              |
| `storage.ts`               | `/upload-photo`, `/delete-photo`, `/storage/*`              | File upload/delete, signed URLs, bucket listing, stats, cleanup             |
| `vehicles.ts`              | `/vehicles` (CRUD), `/delete-vehicle`                       | Vehicle profile management                                                  |
| `website_relationships.ts` | `/website-relationships` (GET/POST)                         | Durable user↔shop/insurer relationship tracking                            |
| `workflow.ts`              | `/workflow-event`, `/job-assignment`, `/claim-decision`     | Workflow events, job assignments, claim decisions                           |

---

## 6. API Route Map

All routes are defined in `src/app/services/supabase/runtime.ts` as `SUPABASE_EDGE_ROUTES`.

```typescript
SUPABASE_EDGE_ROUTES = {
  // ── Admin ──
  admin.checkAdminExists:     "/admin/check-admin-exists"
  admin.createTestAccount:    "/admin/create-test-account"
  admin.createUser:           "/admin/create-user"
  admin.deleteUser:           "/admin/delete-user"
  admin.deleteUsers:          "/admin/delete-users"
  admin.listUsers:            "/admin/list-users"
  admin.profiles:             "/admin/profiles"
  admin.manageAdmin:          "/admin/manage-admin"
  admin.setupAdmin:           "/admin/setup-admin"

  // ── Auth ──
  auth.deleteAccount:         "/delete-account"
  auth.trackLogin:            "/track-login"

  // ── Core data ──
  bids:                       "/bids"
  estimateRequests:           "/estimate-requests"
  claimDecision:              "/claim-decision"
  reports:                    "/reports"
  vehicles:                   "/vehicles"
  deleteVehicle:              "/delete-vehicle"
  userProfile:                "/user-profile"

  // ── Business profiles ──
  shopProfile:                "/shop-profile"
  insurerProfile:             "/insurer-profile"
  directoryInventory:         "/directory-inventory"

  // ── Intake (public) ──
  shopInterest:               "/intake/shop-interest"
  insurerInterest:            "/intake/insurer-interest"

  // ── Map/session ──
  navigationSession:          "/navigation-session"
  websitePreferences:         "/website-preferences"
  websiteRelationships:       "/website-relationships"

  // ── Workflow ──
  jobAssignment:              "/job-assignment"
  jobAssignmentStatus:        "/job-assignment/status"
  workflowEvent:              "/workflow-event"

  // ── Storage ──
  uploadPhoto:                "/upload-photo"
  deletePhoto:                "/delete-photo"
  storageList:                "/storage/list"
  storageSignedUrl:           "/storage/signed-url"
  storageStats:               "/storage-stats"
  cleanupOldReports:          "/cleanup-old-reports"

  // ── System ──
  health:                     "/health"
  healthDeep:                 "/health/deep"
  migrateDatabase:            "/migrate-database"
}
```

---

## 7. Client Service Layer

All service files live in `src/app/services/supabase/`. Each wraps `requestSupabaseEdge()` from `runtime.ts`.

| File                  | Key exports                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `runtime.ts`          | `requestSupabaseEdge()`, `buildSupabaseEdgeHeaders()`, `SUPABASE_EDGE_ROUTES`, bucket constants, error types   |
| `authSession.ts`      | `setClerkTokenGetter()`, `getClerkTokenForEdgeRequests()` — Clerk JWT bridge                                   |
| `client.ts`           | `supabase` client instance, `getSupabaseClient()`                                                              |
| `types.ts`            | `Profile`, `Vehicle`, `DamageReport`, `Bid`, `PartnerShopMapRecord` interfaces                                 |
| `profiles.ts`         | `getProfile()`, `saveProfile()`, `markSetupCompleted()`                                                        |
| `vehicles.ts`         | `getVehicles()`, `saveVehicle()`, `deleteVehicle()`                                                            |
| `reports.ts`          | `getDamageReports()`, `saveDamageReport()`, `updateReportStatus()`, `deleteDamageReport()`                     |
| `bids.ts`             | `submitBid()`, `getBidsForReport()`, `updateBidStatus()`, `getMyBids()`, `deleteBid()`                         |
| `estimateRequests.ts` | `submitEstimateRequest()`, `getMyEstimateRequests()`                                                           |
| `storage.ts`          | `uploadPhoto()`, `deletePhoto()`, `getSignedStorageUrl()`, `listStorageObjects()`                              |
| `workflow.ts`         | `logWorkflowEvent()`, `createJobAssignment()`, `updateJobAssignmentStatus()`                                   |
| `intake.ts`           | `submitShopInterest()`, `submitInsurerInterest()`                                                              |
| `admin.ts`            | `getEdgeFunctionHealth()`, `setupAdminAccount()`, `listAdminUsers()`, `createAdminUser()`, `deleteAdminUser()` |
| `adminIntake.ts`      | `loadAdminIntakeOperations()`, `updateAdminSubmissionStatus()`                                                 |
| `map.ts`              | `zipToCoordinates()`, `geocodeAddress()`, `haversineMiles()`, `getPublicPartnerShops()`                        |
| `clerkEdgeData.ts`    | Clerk-first wrappers: `getReportsByClerkUser()`, `saveReportByClerkUser()`, `submitBidByClerkUser()`, etc.     |
| `edgeFunctions.ts`    | Lower-level `buildEdgeFunctionUrl()`, `edgeFunctionFetch()`, `edgeFunctionJson()`                              |

---

## 8. Database Schema — Complete Table Reference

### Core identity tables

| Table                   | Key columns                                                                                                                                                                                               | Notes                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `profiles`              | `id` UUID PK, `user_id` FK → auth.users, `clerk_user_id` TEXT, `website_user_key` TEXT, `email` UNIQUE, `name`, `account_type` CHECK (customer/shop/insurer), `is_admin`, `setup_completed`, `last_login` | Central identity. RLS: read all, write own.               |
| `website_preferences`   | `id` UUID PK, `website_user_key` UNIQUE, `clerk_user_id`, `normalized_email`, `account_type`, `session_memory` JSONB                                                                                      | Provider-agnostic dashboard/map state. Service-role only. |
| `website_relationships` | `id` UUID PK, `website_user_key`, `relationship_type`, `target_type`, `target_id`                                                                                                                         | Saved shops, watchlists, shortlists. Service-role only.   |

### User data tables

| Table            | Key columns                                                                                                                                                                               | Notes                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `vehicles`       | `id` UUID PK, `user_id` FK, `clerk_user_id`, `make`, `model`, `year`, `vin`, `image_url`                                                                                                  | RLS: own vehicles only.                                  |
| `damage_reports` | `id` UUID PK, `user_id` FK, `clerk_user_id`, `vehicle_id` FK, `damage_type`, `damage_severity`, `address`, `zip_code`, `photo_urls` TEXT[], `status`, `claim_decision`, `approved_amount` | RLS: customers own, shops/insurers read all marketplace. |

### Marketplace tables

| Table               | Key columns                                                                                                                                                                           | Notes                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `bids`              | `id` UUID PK, `damage_report_id` FK → damage_reports, `clerk_shop_user_id`, `shop_name`, `amount` DECIMAL, `estimated_days` INT, `status` CHECK (pending/accepted/rejected/withdrawn) | Shop bids on customer damage reports. |
| `estimate_requests` | `id` UUID PK, `clerk_customer_user_id`, `shop_id` INT, `shop_name`, `description`, `timeline` CHECK (urgent/this-week/flexible), `status` CHECK (pending/viewed/responded/declined)   | Customer requests for shop estimates. |
| `job_assignments`   | `id` UUID PK, `damage_report_id` FK, `shop_user_id`, `status`, `scheduled_start_at`                                                                                                   | Links accepted bid → active job.      |

### Business profile tables

| Table              | Key columns                                                                                                        | Notes                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `shop_profiles`    | `id` UUID PK, `clerk_user_id`, `website_user_key`, `business_name`, `specialties`, `geo_latitude`, `geo_longitude` | Shop directory + map geo.  |
| `insurer_profiles` | `id` UUID PK, `clerk_user_id`, `website_user_key`, `company_name`, `benefits`, `max_claim_amount`                  | Insurer partner directory. |

### Intake tables

| Table                          | Key columns                                              | Notes                                           |
| ------------------------------ | -------------------------------------------------------- | ----------------------------------------------- |
| `shop_interest_submissions`    | `id` UUID PK, `shop_name`, `email`, `phone`, `status`    | Public shop onboarding. Service-role review.    |
| `insurer_interest_submissions` | `id` UUID PK, `company_name`, `email`, `phone`, `status` | Public insurer onboarding. Service-role review. |

### Session tables

| Table                 | Key columns                                                    | Notes                                 |
| --------------------- | -------------------------------------------------------------- | ------------------------------------- |
| `navigation_sessions` | `id` UUID PK, `website_user_key`, `flow_state`, `session_data` | Persistent map/navigation flow state. |

### All tables use

- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()` with `handle_updated_at()` trigger
- Row-Level Security enabled

---

## 9. Database Initialization Strategy

### Source of truth: `supabase/migrations/`

**The `supabase/migrations/` folder is the single authoritative source for the
database schema.** Any fresh environment (local dev, staging, a new prod) must
be bootstrapped by applying every file in this folder in lexicographic order.
Every schema-affecting change — new table, new column, new policy, new trigger
— must be introduced by a new migration file.

This rule was **not** historically enforced. Prior to 2026-04-15 the schema was
a Frankenstein built from three overlapping sources:

1. Migration files in `supabase/migrations/`
2. Runtime edge-function init in `database_init.tsx` (called on cold start)
3. One-off dashboard pastes (`database-setup/*.sql`, ad-hoc SQL editor runs)

Several launch-critical tables (`shop_interest_submissions`,
`insurer_interest_submissions`, `platform_activity_events`, `public_partner_shops`,
`job_assignments`, `estimate_requests`) and Clerk-era columns on `bids`,
`vehicles`, and `profiles` were never captured in a migration. This broke the
staging bootstrap on 2026-04-15 when migration 012 tried to drop policies on
tables that had never been created from the migrations folder alone.

Migration `011b_canonical_catchup.sql` was added to close the drift gap. It is
idempotent (all `IF NOT EXISTS` / `DO $$ ... IF NOT EXISTS $$`), so running it
against production is a no-op — production already has every table and column
it defines. On a fresh environment it fills in exactly what's missing so
migrations 012, 024, 025, 026, and 027 apply cleanly.

### Legacy cold-start safety net: `database_init.tsx`

`supabase/functions/server/database_init.tsx` still runs `initializeDatabaseTables()`
on edge function cold start via `supabase/functions/server/index.ts:92`. This
predates the migrations-first rule and contains its own ~700-line inline SQL
blob that creates a partial subset of the schema idempotently. It is retained
as a **cold-start safety net only** — it exists so that edge functions remain
resilient to a partially bootstrapped database in an emergency. It is **not**
authoritative and **must not** be treated as equal to the migrations folder.
New schema work goes into migrations; this file is frozen pending retirement
(tracked on the post-launch roadmap).

### ~~Modular helper stubs: `database_schema_sql_*.ts`~~ — Removed (Pass 878)

These files were reference-only dead code — never consumed by any runtime path.
`database_init.tsx` uses its own inline SQL, not these modules. They were deleted
in Pass 878 after verification confirmed zero external consumers. The migrations
folder is the enforced source of truth (see §9 header and Execution Discipline rule 4).

### Migration files (`supabase/migrations/`)

Apply in lexicographic filename order for fresh environments:

| #    | File                                               | Purpose                                                            |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------ |
| 001  | `001_create_profiles_table.sql`                    | Legacy profiles DDL + `handle_updated_at()` trigger function       |
| 001  | `001_initial_schema.sql`                           | Baseline: profiles, vehicles, damage_reports, bids, shop/insurer   |
| 002  | `002_create_vehicles_table.sql`                    | Vehicles with user-scoped RLS                                      |
| 003  | `003_create_damage_reports_table.sql`              | Damage reports with role-based RLS                                 |
| 004  | `004_fix_profiles_recursion.sql`                   | Fix infinite recursion in profile policies                         |
| 005  | `005_create_website_preferences_table.sql`         | Provider-agnostic session memory                                   |
| 006  | `006_make_business_profiles_provider_agnostic.sql` | Clerk identity on business profiles                                |
| 007  | `007_create_website_relationships_table.sql`       | Durable user↔entity relationships                                 |
| 008  | `008_organize_website_storage_and_profiles.sql`    | Storage bucket reorganization                                      |
| 009  | `009_create_navigation_sessions.sql`               | Persistent navigation flow state                                   |
| 010  | `010_add_clerk_user_id_to_damage_reports.sql`      | Clerk-first auth on reports                                        |
| 011  | `011_fix_damage_reports_rls_for_clerk.sql`         | RLS updates for Clerk identity                                     |
| 011b | `011b_canonical_catchup.sql`                       | **Catchup**: missing tables/columns so 012+ apply on fresh DB      |
| 012  | `012_harden_rls_policies.sql`                      | Strengthened RLS across all tables                                 |
| 013  | `013_privatize_user_storage_buckets.sql`           | User-scoped storage access                                         |
| 014  | `014_navigation_sessions_clerk_identity.sql`       | Navigation sessions Clerk support                                  |
| 015  | `015_add_claim_decision_fields.sql`                | Claims decision tracking columns                                   |
| 016  | `016_add_report_coordinates.sql`                   | Geocoded lat/lng on damage_reports                                 |
| 017  | `017_create_shop_service_areas.sql`                | Per-shop radius / zip service areas                                |
| 018  | `018_enable_postgis_geography.sql`                 | PostGIS + GEOGRAPHY(POINT) columns + spatial indexes               |
| 019  | `019_create_notification_preferences.sql`          | Per-user email/in-app/SMS toggles                                  |
| 020  | `020_add_shop_assignment_to_reports.sql`           | `assigned_shop_clerk_user_id` on damage_reports                    |
| 021  | `021_add_privacy_columns.sql`                      | Privacy toggles on notification_preferences                        |
| 024  | `024_clerk_jwt_rls_policies.sql`                   | Full Clerk JWT RLS rewrite (`requesting_clerk_user_id()` helper)   |
| 025  | `025_event_capture_columns.sql`                    | `actor_id/object_id/outcome` on platform_activity_events           |
| 026  | `026_idempotency_guards.sql`                       | Unique indexes preventing duplicate bids / job_assignments         |
| 027  | `027_soft_delete.sql`                              | `deleted_at` on launch-critical tables                             |
| —    | `20231223000001_create_storage_buckets.sql`        | Legacy storage bucket setup (earliest sort; supersedes by 008/013) |

### Staging / fresh-environment bootstrap (PG17 note)

Supabase PG17 projects isolate `uuid-ossp` and `postgis` into the `extensions`
schema, which is **not** on the default `search_path` for the CLI-provisioned
role. `supabase db push` is broken against PG17 staging as a result — use the
dashboard SQL editor paste path instead. See
`memory/feedback_supabase_cli_pg17.md` for the full gotcha and
`staging_bootstrap.sql` for the concatenated, `gen_random_uuid()`-swapped blob
used to bootstrap staging from scratch.

---

## 10. Authentication & Authorization

### Client-side flow

1. User signs in via Clerk → Clerk issues JWT
2. `authSession.ts` stores a `ClerkTokenGetter` function
3. `buildSupabaseEdgeHeadersAsync()` retrieves fresh Clerk token
4. Token sent as `Authorization: Bearer <token>` to edge functions

### Server-side auth guards (`utils/authz.ts`)

| Function                                              | Purpose                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `requireClerkSession(req)`                            | Extracts + verifies Clerk JWT from Authorization header                      |
| `ensureClerkUserMatchesSession(session, clerkUserId)` | Validates request clerkUserId matches JWT subject                            |
| `ensureWebsiteUserKeyMatchesSession(session, key)`    | Validates website user key matches session                                   |
| `buildWebsiteUserKey(email, clerkId)`                 | Derives stable identity key from email + Clerk ID                            |
| `normalizeEmail(email)`                               | Lowercases and trims email                                                   |
| `requireAuthenticatedProfile(req, supabase, opts)`    | Full auth: verify JWT → load profile from DB → return `{ profile, session }` |
| `requireAdminContext(req, supabase)`                  | Full auth + verify `is_admin === true` on profile                            |

### JWT verification (`utils/clerk.ts`)

- Verifies Clerk JWT signature via JWKS endpoint
- Validates issuer matches Clerk instance
- Caches JWKS keys in memory
- Returns `VerifiedClerkSession` with `sub` (Clerk user ID), `email`, claims

---

## 11. Rate Limiting

Implemented in `utils/rateLimiter.ts` — in-memory, per-warm-instance.

| Type                          | Limit       | Window     |
| ----------------------------- | ----------- | ---------- |
| Read (GET)                    | 60 requests | 60 seconds |
| Write (POST/PUT/DELETE/PATCH) | 20 requests | 60 seconds |

- Key: `${clerkUserId}:${ip}` or `${ip}` if anonymous
- Exempt routes: `/health`, `/health/deep`, `/migrate-database`
- Garbage collection: expired entries pruned every 2 minutes
- Resets on cold start (intentional — best-effort abuse deterrent)

---

## 12. Storage Buckets

### Canonical buckets (use for all new uploads)

| Constant       | Bucket name               | Purpose                       |
| -------------- | ------------------------- | ----------------------------- |
| `accountMedia` | `bidondent-account-media` | Profile, shop, insurer images |
| `reportMedia`  | `bidondent-report-media`  | Damage report photos          |
| `vehicleMedia` | `bidondent-vehicle-media` | Vehicle photos                |

### Legacy buckets (read-only, kept for old uploaded assets)

| Constant            | Bucket name                     | Purpose                  |
| ------------------- | ------------------------------- | ------------------------ |
| `damagePhotos`      | `bidondent-damage-photos`       | Old damage report images |
| `profiles`          | `bidondent-profiles`            | Old profile images       |
| `vehicles`          | `bidondent-vehicles`            | Old vehicle images       |
| `landingPageImages` | `bidondent-landing-page-images` | Removed (was empty)      |

All user-scoped buckets have RLS enabled (migration 013).

---

## 13. Edge Function Deployment

```bash
# Deploy canonical edge function
supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa

# Deploy legacy alias (compatibility only — remove when fully migrated)
supabase functions deploy make-server-9f243523 --project-ref wmdcnjgtsppftrofaqqa
```

### URL pattern

```
https://wmdcnjgtsppftrofaqqa.supabase.co/functions/v1/server/<route>
```

---

## 14. Backend Migration Checklist

If migrating from Supabase to another backend:

### Data layer

- [ ] Replicate all 14 tables from Section 8 with equivalent schemas
- [ ] Preserve `handle_updated_at()` trigger behavior (auto-update `updated_at`)
- [ ] Preserve CHECK constraints on status/type columns
- [ ] Replicate RLS logic (or equivalent per-user access control)

### API layer

- [ ] Implement all routes from Section 6 (35+ endpoints)
- [ ] Preserve request/response JSON shapes (service layer depends on them)
- [ ] Update `SUPABASE_EDGE_ROUTES` in `runtime.ts` to point at new base URL
- [ ] Update `requestSupabaseEdge()` in `runtime.ts` for new auth header format
- [ ] Update `buildSupabaseEdgeHeaders()` if auth token format changes

### Auth layer

- [ ] Preserve Clerk JWT verification (or equivalent)
- [ ] Preserve `requireAuthenticatedProfile()` pattern (JWT → profile lookup → permission check)
- [ ] Preserve `ensureClerkUserMatchesSession()` anti-impersonation guard
- [ ] Preserve admin context check (`is_admin` flag)

### Storage layer

- [ ] Migrate 3 canonical buckets + 3 legacy buckets
- [ ] Preserve signed URL generation for private media
- [ ] Update `storage.ts` service for new upload/download API

### Rate limiting

- [ ] Implement equivalent 60 reads/min, 20 writes/min per identity
- [ ] Preserve IP-based fallback for anonymous requests

### Client integration

- [ ] Update `.env` with new `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Update `src/app/services/supabase/client.ts` if direct client access changes
- [ ] Update `authSession.ts` token getter if auth header format changes

---

## 15. Parallel Security-Track Coordination

When a parallel AI/security pass updates auth, edge guards, or data-access docs:

- Keep this guide additive; do not delete fresh security notes without verification.
- Preserve source-of-truth ownership: Clerk = identity, Supabase = data/storage/edge.
- If new edge/auth flows are introduced, update both this guide and `CLAUDE_AI_MASTER_CONTEXT.md` in the same pass.
- Record pass notes in trackers rather than rewriting historical setup details.

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

## Staging Environment

> ⚠️ **Pending account setup** — No staging Supabase project exists yet. The steps below describe the intended preview/staging flow once a staging project is created.

### Preview deployment flow (Vercel)

BidOnDent is deployed to Vercel. Every push to `BidOnDent-Horizon-Beta` or a PR branch should generate a Vercel preview deployment. To verify:

1. Open the Vercel dashboard → **BidOnDent-Production** project → **Deployments** tab.
2. Confirm a preview URL exists for a recent `BidOnDent-Horizon-Beta` commit.
3. The preview URL will use whichever environment variables are configured under **Settings → Environment Variables → Preview**.

### Staging Supabase project (manual setup required)

To isolate preview deployments from production data:

1. Create a new Supabase project (e.g., `bidondent-staging`) in the Supabase dashboard.
2. Run all 27 migrations in order against the staging project:
   ```bash
   supabase db push --db-url "postgresql://postgres:<password>@<staging-host>:5432/postgres"
   ```
3. Set the following environment variables on Vercel under **Preview** scope:
   | Variable | Value |
   | ------------------------------- | ---------------------------------- |
   | `VITE_SUPABASE_PROJECT_ID` | Staging project ref |
   | `VITE_SUPABASE_ANON_KEY` | Staging anon/public key |
   | `VITE_CLERK_PUBLISHABLE_KEY` | Same Clerk key (shared identity) |
   | `VITE_SENTRY_ENVIRONMENT` | `staging` |
4. Deploy the Supabase edge function (`server`) to the staging project:
   ```bash
   supabase functions deploy server --project-ref <staging-ref>
   ```
5. Set edge function secrets on the staging project:
   ```bash
   supabase secrets set CLERK_SECRET_KEY=<key> RESEND_API_KEY=<key> --project-ref <staging-ref>
   ```

### Current status

- **Vercel project:** Connected (assumed via GitHub integration — no `vercel.json` or CLI config in repo).
- **Preview deployments:** Unverified from repo. Check Vercel dashboard manually.
- **Staging Supabase:** Does not exist. Requires account-level action described above.

---

## Current Frontend Contract

The frontend should use:

- `src/app/services/supabase/runtime.ts`
- `src/app/services/supabase/admin.ts`
- `src/app/services/auth/websitePreferencesSync.ts`
- `src/app/services/auth/websiteRelationshipsSync.ts`

Avoid hardcoding function URLs or bucket names directly in components.
