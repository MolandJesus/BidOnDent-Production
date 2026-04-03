# Supabase Setup Guide — Full Backend Reference

Last updated: April 2, 2026
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

### Tracked source keys (committed to repo)

| File                      | Exports                      |
| ------------------------- | ---------------------------- |
| `utils/clerk/info.tsx`    | `clerkPublishableKey`        |
| `utils/supabase/info.tsx` | `projectId`, `publicAnonKey` |

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

### Inline initialization (`database_init.tsx`)

On edge function cold start, `initializeDatabaseTables()` runs:

1. Connects via `SUPABASE_DB_URL` using Deno postgres client
2. Suppresses notices: `SET client_min_messages TO WARNING`
3. Executes all SQL in a **single transaction** (avoids deadlocks)
4. Creates `handle_updated_at()` trigger function first
5. Creates core tables inline (profiles, website_preferences, etc.)
6. Adds columns conditionally with `IF NOT EXISTS` for safe re-runs

### Modular schema files (`database_schema_sql_*.ts`)

| File                                       | Constant                            | Tables                                                                                          |
| ------------------------------------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `database_schema_sql_core.ts`              | `coreDatabaseSchemaSql`             | profiles, website_preferences, website_relationships, shop_profiles, insurer_profiles, vehicles |
| `database_schema_sql_bid_flow.ts`          | `bidFlowDatabaseSchemaSql`          | bids, job_assignments, damage_reports                                                           |
| `database_schema_sql_estimate_requests.ts` | `estimateRequestsDatabaseSchemaSql` | estimate_requests                                                                               |
| `database_schema_sql_intake.ts`            | `intakeDatabaseSchemaSql`           | shop_interest_submissions, insurer_interest_submissions                                         |

These are aggregated in `database_schema_sql.ts`:

```typescript
export const databaseInitializationSql = [
  coreDatabaseSchemaSql,
  bidFlowDatabaseSchemaSql,
  estimateRequestsDatabaseSchemaSql,
  intakeDatabaseSchemaSql,
].join("\n");
```

### Migration files (`supabase/migrations/`)

Run in order for fresh environments:

| #   | File                                               | Purpose                                            |
| --- | -------------------------------------------------- | -------------------------------------------------- |
| 001 | `001_initial_schema.sql`                           | Baseline: profiles, vehicles, damage_reports, bids |
| 001 | `001_create_profiles_table.sql`                    | Legacy profiles DDL                                |
| 002 | `002_create_vehicles_table.sql`                    | Vehicles with user-scoped RLS                      |
| 003 | `003_create_damage_reports_table.sql`              | Damage reports with role-based RLS                 |
| 004 | `004_fix_profiles_recursion.sql`                   | Fix infinite recursion in profile policies         |
| 005 | `005_create_website_preferences_table.sql`         | Provider-agnostic session memory                   |
| 006 | `006_make_business_profiles_provider_agnostic.sql` | Clerk identity on business profiles                |
| 007 | `007_create_website_relationships_table.sql`       | Durable user↔entity relationships                 |
| 008 | `008_organize_website_storage_and_profiles.sql`    | Storage bucket reorganization                      |
| 009 | `009_create_navigation_sessions.sql`               | Persistent navigation flow state                   |
| 010 | `010_add_clerk_user_id_to_damage_reports.sql`      | Clerk-first auth on reports                        |
| 011 | `011_fix_damage_reports_rls_for_clerk.sql`         | RLS updates for Clerk identity                     |
| 012 | `012_harden_rls_policies.sql`                      | Strengthened RLS across all tables                 |
| 013 | `013_privatize_user_storage_buckets.sql`           | User-scoped storage access                         |
| 014 | `014_navigation_sessions_clerk_identity.sql`       | Navigation sessions Clerk support                  |
| 015 | `015_add_claim_decision_fields.sql`                | Claims decision tracking columns                   |
| —   | `20231223000001_create_storage_buckets.sql`        | Creates all storage buckets                        |

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

- [ ] Update `utils/supabase/info.tsx` with new project reference
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

## Current Frontend Contract

The frontend should use:

- `src/app/services/supabase/runtime.ts`
- `src/app/services/supabase/admin.ts`
- `src/app/services/auth/websitePreferencesSync.ts`
- `src/app/services/auth/websiteRelationshipsSync.ts`

Avoid hardcoding function URLs or bucket names directly in components.
