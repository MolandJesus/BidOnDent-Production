# Supabase Setup Guide — Full Backend Reference

> ### ⚠️ HARDENING PHASE NOTICE (2026-04-14)
>
> This guide remains the canonical backend reference, but several sections will be updated by hardening passes:
>
> - **Phase 1.5 (.env migration)** — COMPLETE. Clerk and Supabase keys now read from `.env` via `import.meta.env`. The old `utils/clerk/info.tsx` and `utils/supabase/info.tsx` files have been deleted.
> - **Phase 3.1 (RLS rollout)** — COMPLETE. All 10 launch-critical tables now have Clerk JWT-based RLS policies using `requesting_clerk_user_id()` SQL helper (extracts `sub` from `request.jwt.claims`). Policies use dual-path: Clerk JWT primary, `auth.uid()` fallback for backward compat. Prerequisite: Clerk JWT template "supabase" must be configured in Clerk Dashboard, signed with Supabase's JWT secret, for Realtime auth. Migration: `024_clerk_jwt_rls_policies.sql`.
> - **Phase 3.2 (Event capture)** — COMPLETE. `platform_activity_events` now has `actor_id`, `object_id`, `outcome` columns. All launch-critical write flows (report create, bid create, bid accept/reject, job assignment create) emit structured events. Migration: `025_event_capture_columns.sql`.
> - **Phase 3.3 (Idempotency)** — COMPLETE. Unique partial indexes on `bids(damage_report_id, clerk_shop_user_id)` and `job_assignments(damage_report_id)` prevent duplicate submissions. Damage report POST now uses `(clerk_user_id, client_request_id)` dedupe for repeated request replays, and bid acceptance uses an atomic `pending → accepted/rejected` update so concurrent retries cannot double-send shop notifications. Migrations: `026_idempotency_guards.sql`, `20260416000002_report_submission_idempotency.sql`.
> - **Phase 3.4 (Soft delete)** — COMPLETE. `deleted_at TIMESTAMPTZ` added to damage_reports, bids, job_assignments, vehicles. All delete handlers now set `deleted_at` instead of hard deleting. All query handlers filter `deleted_at IS NULL`. RLS policies filter deleted rows. Migration: `027_soft_delete.sql`. Account deletion in auth.ts still uses hard deletes (GDPR compliance).
> - **Phase 5.5 / 2026-04-27 prod deploy** — LIVE. Production `server` is now version 47 on project `wmdcnjgtsppftrofaqqa`. The deployed bundle includes workflow authorization hardening, completion propagation, authenticated marketplace seed-fallback removal, and customer ownership recovery/self-heal for Clerk ID rotation (KI-055). Remaining Pass 1/2 verification follow-through stays tracked in `LAW_HARDENING_PLAN.md`.
> - **Section 13 (Edge Function Deployment)** still documents the `make-server-9f243523` legacy alias. That alias is a live backward-compatibility layer deferred to [Post-Launch Roadmap item L1](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md). Keep the current deploy command until L1 fires; do not remove it prematurely.
>
> During the hardening phase, execution law is the [Hardening Plan (LAW)](LAW_HARDENING_PLAN.md).

> ### 🔑 PREREQUISITE: Clerk JWT Template
>
> Clerk Dashboard **must** have a JWT template named **`supabase`** configured and signed with the Supabase project's JWT secret (`SUPABASE_JWT_SECRET`). Without this template, all Clerk-JWT RLS policies (`requesting_clerk_user_id()`) will return `NULL` and deny every authenticated request. Runtime verification is deferred to deployment smoke test.

Last updated: April 27, 2026 (prod `server` v47 live; Clerk-rotation recovery verified)
Status: Active — comprehensive backend reference for current and future backend migration

BidOnDent uses **Clerk** for authentication/identity and **Supabase** for application data, file storage, and edge-function-backed API services. This document is the single source of truth for the entire backend architecture. If the project migrates to a different backend, this document defines every contract that must be replicated.

---

## 1. Production Environment

| Key                          | Value                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Supabase project ref         | `wmdcnjgtsppftrofaqqa`                                                          |
| Canonical edge function slug | `server`                                                                        |
| Legacy edge function slug    | `make-server-9f243523` (compatibility only)                                     |
| Live edge function version   | `47` (updated 2026-04-27 11:23:25 UTC)                                          |
| Edge function runtime        | Deno (Supabase Edge Functions)                                                  |
| Auth provider                | Clerk (JWT-based, verified inside edge handlers; deploys use `--no-verify-jwt`) |

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

The single Deno edge function (`server`) handles all API routes via path-based dispatch inside `Deno.serve()`. On cold start it runs `initializeDatabaseTables()` (validation-only safety net at this stage, not broad schema creation) and `initializeStorageBuckets()`.

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

### Customer ownership recovery rule (2026-04-27)

- `profiles`, `vehicles`, and `damage_reports` intentionally retain both `user_id` and `clerk_user_id` during the current Clerk-first launch phase.
- `getAuthenticatedProfile()` resolves by `clerk_user_id` first, then normalized email. That makes profile resolution tolerant of Clerk ID rotation when the email remains stable.
- `getVehicles()`, `getReports()`, and the customer-ownership branch of `getBids()` now merge candidate `clerk_user_id` matches with a `user_id` sweep, dedupe by row id, and self-heal stale or `NULL` `clerk_user_id` values to the active Clerk session on read.
- This recovery path is customer-only. Shop ownership checks, insurer checks, and workflow authorization remain strict.

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

### Source of truth: consolidated single-pass migration (2026-04-15)

**`supabase/migrations/20251230000001_full_schema.sql` is the single authoritative
schema source.** It represents the final intended state of every table, RLS policy,
trigger, function, index, and storage bucket after all hardening work through
Phase 5.1. Any fresh environment (local Docker, new staging project, new prod
project) is bootstrapped by applying this one file.

The 27 historical incremental migrations that previously occupied this folder are
archived at `supabase/migrations/_archived/` for audit reference only. They must
not be applied to any environment — see that folder's README for the full list of
cross-dependency bugs that made them fail on fresh databases (duplicate CREATE
TABLE definitions with conflicting CHECK constraints, orphaned RLS policies,
double-firing triggers, storage bucket privatization undone by a later file,
and cross-dependencies on tables created only by `database_init.tsx`).

### Production migration history caveat

Production (`wmdcnjgtsppftrofaqqa`) was built incrementally via the 27 archived
migrations and already contains their entries in `supabase_migrations.schema_migrations`.
The consolidated file has **not** been applied to production and its name is **not**
in prod's history. As a direct consequence:

- `supabase db push` against production would see `20251230000001_full_schema.sql`
  as a new migration and try to re-apply it, which fails with "already exists" errors.
- **All production schema changes must go through dashboard paste** until this is
  resolved. Post-launch, prod's `schema_migrations` can be reconciled by inserting
  a row for the consolidated file name (one-time SQL) so `supabase db push` works
  cleanly for future changes.

### Future schema changes

Every schema-affecting change from 2026-04-15 forward lands as a **new** migration
file alongside the consolidated one — e.g. `20260501000001_add_foo.sql`. These new
files apply cleanly to local, staging, and prod because they sort after both the
consolidated migration (fresh environments) and the archived names (production history).

Do **not** edit `20251230000001_full_schema.sql` to add new schema. Treat it as a
frozen baseline.

### Legacy cold-start safety net: `database_init.tsx`

`supabase/functions/server/database_init.tsx` still runs `initializeDatabaseTables()`
on edge function cold start via `supabase/functions/server/index.ts:92`. It predates
the migrations-first rule and contains its own inline SQL that creates a partial
subset of the schema idempotently. Retained as a cold-start safety net only — not
authoritative. New schema work goes into new migration files. Retirement is tracked
on the Post-Launch Roadmap.

### ~~Modular helper stubs: `database_schema_sql_*.ts`~~ — Removed (Pass 878)

Reference-only dead code, never consumed by any runtime path. Deleted in Pass 878.

### Migration files (`supabase/migrations/`)

| File                             | Role                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20251230000001_full_schema.sql` | **Consolidated single-pass bootstrap.** The entire schema in one file: 17 tables, 34 Clerk-JWT-aware RLS policies, 18 `updated_at` triggers, utility functions (`handle_updated_at`, `update_updated_at_column`, `requesting_clerk_user_id`), PostGIS extension + spatial indexes, 3 canonical + 3 legacy private storage buckets, role grants. Frozen baseline. |
| `_archived/*.sql`                | Historical incremental migrations (27 files) through 2026-04-15. Audit-only. **Do not apply.** See `_archived/README.md`.                                                                                                                                                                                                                                        |

Future schema changes land as new files alongside the baseline, using a timestamp that sorts after it (e.g. `20260501000001_add_foo.sql`). They apply cleanly to fresh environments (which already have the baseline) and — once production's `schema_migrations` is reconciled — to production as well.

### Fresh-environment bootstrap paths

| Environment                  | Path                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Local dev (Supabase Docker)  | `supabase start` applies the consolidated migration automatically on first boot.                      |
| New hosted staging / sandbox | Paste `20251230000001_full_schema.sql` into the target project's SQL editor. Dashboard path, not CLI. |
| Existing production          | Already built incrementally. Do not re-bootstrap. Schema changes via dashboard paste (see §9 caveat). |

**PG17 note:** Supabase PG17 projects isolate `uuid-ossp` and `postgis` into the `extensions` schema, which is not on the default `search_path` for the CLI-provisioned role. `supabase db push` is broken against PG17 projects — use dashboard paste. See `memory/feedback_supabase_cli_pg17.md` for the full gotcha.

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
| `getAuthenticatedProfile(supabase, session)`          | Loads profile by `clerk_user_id`, then falls back to normalized email        |
| `ensureClerkUserMatchesSession(session, clerkUserId)` | Validates request clerkUserId matches JWT subject                            |
| `ensureWebsiteUserKeyMatchesSession(session, key)`    | Validates website user key matches session                                   |
| `buildWebsiteUserKey(email, clerkId)`                 | Derives stable identity key from email + Clerk ID                            |
| `normalizeEmail(email)`                               | Lowercases and trims email                                                   |
| `requireAuthenticatedProfile(req, supabase, opts)`    | Full auth: verify JWT → load profile from DB → return `{ profile, session }` |
| `requireInsurerContext(req, supabase)`                | Full auth + verify insurer/admin authority for claim workflows               |
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
supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt

# Deploy legacy alias (compatibility only — remove when fully migrated)
supabase functions deploy make-server-9f243523 --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt
```

Current production metadata (2026-04-27): `server` version 47, updated 2026-04-27 11:23:25 UTC.

`--no-verify-jwt` is required because the Supabase gateway does not validate Clerk-issued bearer tokens. The actual auth boundary is handler-level verification via `requireClerkSession()` and the higher-level auth/context helpers in `utils/authz.ts`.

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
- If new edge/auth flows are introduced, update both this guide and [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) in the same pass.
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

Staging Supabase project: `lhhdqycnhweaxqviwdqt` (created 2026-04-15 for Phase 5 hardening).

### Supabase

- **Bootstrap:** Paste `supabase/migrations/20251230000001_full_schema.sql` into the staging project's SQL editor. Do not use `supabase db push` — PG17 search-path incompatibility blocks it.
- **Edge function:** `supabase functions deploy server --project-ref lhhdqycnhweaxqviwdqt` (verified working per Pass 880).
- **Edge function secrets:** `supabase secrets set CLERK_SECRET_KEY=<key> RESEND_API_KEY=<key> --project-ref lhhdqycnhweaxqviwdqt`.

### Deployment preview flow (TBD)

Deployment method is not yet decided. The app builds as a Vite static site (`npm run build` → `dist/`) and is deployable to any static hosting provider. Development and testing use `localhost:5173` with the local Supabase Docker stack.

### Local Docker stack (Phase 5 hardening addition — primary dev workflow)

As of 2026-04-15, `supabase start` spins up a full local stack (Postgres + Studio + edge runtime) with the consolidated migration applied automatically. This is the primary development and testing environment:

```bash
supabase start               # boots the local stack
npm run dev                   # starts Vite dev server at localhost:5173
supabase functions serve     # serves edge functions from supabase/functions/server
```

Studio: http://127.0.0.1:54323. API: http://127.0.0.1:54321. DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

Local Clerk keys live in `supabase/.env.local` (gitignored). Local Supabase auto-injects `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` at function serve time.

### Current status

- **Local Docker stack:** Complete (Pass c2b44425). Primary dev/test environment.
- **Staging Supabase bootstrap:** Complete (Pass 872).
- **Staging edge function deploy:** Complete (Pass 880).
- **Deployment method:** TBD — not blocking any Phase 5/6 work.

---

## Current Frontend Contract

The frontend should use:

- `src/app/services/supabase/runtime.ts`
- `src/app/services/supabase/admin.ts`
- `src/app/services/auth/websitePreferencesSync.ts`
- `src/app/services/auth/websiteRelationshipsSync.ts`

Avoid hardcoding function URLs or bucket names directly in components.
