# BidOnDent — Backend & Service Layer Task Prompt

**For: AI assistant working on non-UI tasks**
**Date: 2026-03-25**
**Branch: `feature/platform-bugfix-sweep-by-MolandJesus`**

---

## CRITICAL RULE: DO NOT TOUCH UI/DESIGN FILES

Another AI is actively working on all visual/design/component work. You must **never** modify any of these file categories:

### OFF-LIMITS (do not edit, do not "clean up", do not refactor):
- `src/app/components/**/*.tsx` — ALL component files
- `src/app/components/**/*.css` — ALL style files
- Any Tailwind classes, colors, layouts, spacing, or visual output
- `src/app/App.tsx` — main app shell (has active UI changes)
- `src/app/routers/*.tsx` — router components (have active UI changes)
- `src/app/hooks/useScrollAnimation.ts` — UI hook
- `tailwind.config.*` or `postcss.config.*`
- `index.html`
- Any `docs/*.md` files (those are tracked by the design AI)

### YOUR DOMAIN (safe to work on):
- `supabase/functions/server/**` — Edge function handlers
- `src/app/services/supabase/*.ts` — Client-side Supabase service layer
- `src/app/services/realtime/*.ts` — Realtime bid service
- `src/app/services/performance/*.ts` — Performance optimizer
- `src/app/services/storage/*.ts` — Storage service layer
- `src/app/services/navigation/*.ts` — Navigation services
- `src/app/services/intelligence/*.ts` — Market intelligence / shop data
- `src/app/services/auth/*.ts` — Auth and identity sync
- `src/app/services/errorReporting.ts`
- `src/app/services/storageMonitor.ts`
- `src/app/services/clerkService.ts`
- `src/app/services/demoDataService.ts` / `demoAuthService.ts`
- `src/app/hooks/useUserData.ts` — data-fetching logic only (no UI changes)
- `src/app/hooks/userDataActions.ts` / `userDataUtils.ts` / `useUserDataHelpers.ts`
- `src/app/hooks/useAuth.ts`
- `src/app/hooks/useAppEffects.ts` / `useAppHandlers.ts` — logic only
- `src/app/utils/*.ts` — utility functions
- `src/app/services/__tests__/*.ts` — tests
- Database schema files in `supabase/functions/server/database_schema_sql*.ts`
- `supabase/functions/server/storage_init.tsx` / `database_init.tsx`

---

## PROJECT CONTEXT

BidOnDent is an auto body repair bidding platform. Stack:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Auth:** Clerk (primary), with legacy Supabase auth fallbacks being phased out
- **Backend:** Supabase (Postgres DB + Edge Functions + Storage)
- **Edge Functions:** Single consolidated Deno edge function at `supabase/functions/server/`
- **Client-server:** All client-side data goes through `requestSupabaseEdge()` in `src/app/services/supabase/runtime.ts`, which calls the edge function
- **No test framework configured yet** — only manual browser console tests exist

### Auth Model
- Clerk handles authentication. `clerkUserId` is the primary identity key everywhere.
- Legacy `user_id` (Supabase auth UUID) still exists in some DB rows and fallback code.
- Edge functions receive `clerkUserId` in request body or query params — they do NOT use Supabase auth sessions.
- Client gets `clerkUserId` from Clerk's `useUser()` hook via `useAuth()`.

### Database Tables (known)
- `profiles` — user profiles, keyed by `clerk_user_id`
- `vehicles` — saved vehicles, keyed by `clerk_user_id`
- `damage_reports` — repair intake reports, keyed by `clerk_user_id`
- `bids` — shop bids on reports, keyed by `clerk_shop_user_id` + `damage_report_id`
- `website_preferences` — user settings/preferences
- `website_relationships` — user relationship data
- `shop_profiles` / `insurer_profiles` — business profiles
- `partner_shops_map` — shops shown on map

---

## TASK LIST (prioritized)

### P1 — Data Integrity & Auth

1. **Audit edge function auth: ensure clerkUserId is validated, not just passed through**
   - Currently edge functions trust whatever `clerkUserId` the client sends
   - Add Clerk JWT verification to edge functions using Clerk's backend SDK or JWKS
   - File: `supabase/functions/server/utils/clerk.ts` (already exists — check what's there and extend)
   - Apply to all handlers that mutate data (POST/PUT/DELETE)

2. **getBids edge handler: customer can't fetch their own bids**
   - `GET /bids` requires either `reportId` or `clerkUserId` — but `clerkUserId` filters by `clerk_shop_user_id` (shop's ID)
   - A customer needs to fetch bids for ALL their reports. Current flow: customer calls `getMyBids(clerkUserId)` which hits `GET /bids?clerkUserId=X` — but that filters by shop user ID, not customer
   - Fix: Add a `customerClerkUserId` query param that joins `bids` → `damage_reports` to find bids on the customer's reports
   - Files: `supabase/functions/server/handlers/bids.ts`, `src/app/services/supabase/bids.ts`

3. **Remove remaining `supabase.auth.getUser()` calls from client services**
   - `src/app/services/supabase/reports.ts` lines 96-101 and 127-132 still fall back to `supabase.auth.getUser()` — this is the old Supabase auth, not Clerk
   - These fallbacks will never work for Clerk-authenticated users, so they're dead code that adds confusion
   - Replace with proper error handling that tells the caller "no clerkUserId available"

### P2 — Edge Function Hardening

4. **Add request rate limiting / abuse prevention to edge functions**
   - The edge function has no rate limiting — any client can spam endpoints
   - Add a simple in-memory rate limiter (per clerkUserId, per IP) to `supabase/functions/server/index.ts`
   - Limit: 60 requests/minute per identity for reads, 20/minute for writes

5. **Add input validation to edge function handlers**
   - `createBid` accepts any `amount` including negative numbers
   - `createReport` doesn't validate required fields like `vehicle_make`, `damage_type`
   - Add validation at the edge function layer (not client — client validation is a UI concern)
   - Files: `supabase/functions/server/handlers/bids.ts`, `supabase/functions/server/handlers/reports.ts`

6. **Bid acceptance should reject other bids on the same report**
   - When a customer accepts a bid (`PUT /bids/:id` with `status: "accepted"`), other pending bids on the same `damage_report_id` should be auto-rejected
   - This is a critical business rule currently missing from the edge function
   - File: `supabase/functions/server/handlers/bids.ts` — `updateBidStatus()`

### P3 — Testing & Reliability

7. **Set up Vitest for the project**
   - Add `vitest` to devDependencies
   - Create `vitest.config.ts`
   - Write real unit tests for the client-side service layer (`src/app/services/supabase/*.ts`)
   - The existing "tests" in `src/app/services/__tests__/integration.test.ts` are browser console scripts, not real tests — leave them but add proper Vitest tests alongside

8. **Add error typing to edge function responses**
   - Edge functions return `{ error: string }` on failure but there's no structured error codes
   - Define an error code enum (e.g., `MISSING_FIELD`, `UNAUTHORIZED`, `NOT_FOUND`, `RATE_LIMITED`)
   - Update `createResponse` in `supabase/functions/server/utils/helpers.ts` to include error codes
   - Update `parseSupabaseEdgeResponse` in `src/app/services/supabase/runtime.ts` to parse and surface them

9. **Add health check endpoint improvements**
   - Current `/health` just returns a static response
   - Add actual checks: DB connectivity, storage bucket accessibility
   - Add a `/health/deep` endpoint that tests a read from each critical table

### P4 — Data Layer Improvements

10. **Add pagination to `getReports` and `getBids` edge handlers**
    - Currently returns ALL reports/bids — will scale poorly
    - Add `limit` and `offset` query params with sensible defaults (limit=50)
    - Files: `supabase/functions/server/handlers/reports.ts`, `supabase/functions/server/handlers/bids.ts`

11. **Add `damage_reports.clerk_user_id` index if missing**
    - Verify the database schema files include proper indexes
    - Add missing indexes for common query patterns: `bids.damage_report_id`, `damage_reports.clerk_user_id`, `vehicles.clerk_user_id`
    - File: `supabase/functions/server/database_schema_sql*.ts`

12. **Storage cleanup: the `storageMonitor.ts` and `photoUtils.ts` could use hardening**
    - `src/app/services/storageMonitor.ts` — check for proper cleanup of event listeners
    - `src/app/utils/photoUtils.ts` — check for proper error handling in image compression/resize

---

## EXECUTION RULES

1. **One task at a time.** State which task number you're working on, make the changes, verify build passes (`npx vite build`), then move on.
2. **Never expand scope.** If you discover a UI issue while working on a service file, log it but do not fix it.
3. **Test your changes compile.** Run `npx tsc --noEmit` after each task (ignore the `@types/react-dom` warning — that's pre-existing).
4. **Do not create new component files.** Your work is services, hooks (data logic), edge functions, utils, and tests only.
5. **Do not modify the git history.** Don't amend commits. Make new commits per task.
6. **Preserve the existing edge function API contract.** Don't rename routes or change response shapes in breaking ways — add new fields/params, don't remove existing ones.
7. **Use `import.meta.env.DEV` for dev-only logging.** Don't add `console.log` to production paths.

---

## HOW TO VERIFY

```bash
# Type check (ignore react-dom warnings)
npx tsc --noEmit

# Production build
npx vite build

# If you set up Vitest:
npx vitest run
```

---

## FILES YOU'LL NEED TO READ FIRST

Before starting, read these to understand the full service architecture:
- `src/app/services/supabase/runtime.ts` — how client calls edge functions
- `supabase/functions/server/index.ts` — edge function routing
- `supabase/functions/server/config/clients.ts` — Supabase client init
- `supabase/functions/server/utils/clerk.ts` — existing Clerk verification
- `src/app/services/supabase/types.ts` — shared data types
- `src/app/hooks/useUserData.ts` — how the app loads user data (read-only context)
