# BidOnDent — Known Issues (REFERENCE)

**Authority level:** REFERENCE — describes current known gaps, bugs, and structural issues.

**Last updated:** 2026-04-25

**Update rules:**

- Add new issues as discovered. Use next available ID.
- When fixed, mark `Status: RESOLVED (date)` — do not delete.
- Prune RESOLVED issues older than 3 months to `docs/archive/`.

---

## Launch Blockers

### KI-001: Marketplace reports are unbounded for shops/insurers

- **Impact:** Shop and insurer dashboards fetch ALL `damage_reports` with no pagination and no geographic filtering. Will degrade at ~100 reports and break at ~500+.
- **Location:** [useMarketplaceReports.ts](../src/app/hooks/useMarketplaceReports.ts) calls `getAllDamageReports()` → edge function `getMarketplaceReports` which does `select('*').is('deleted_at', null)` with no limit.
- **Current reality:** Every shop sees every report from every city. This makes the marketplace unusable at any real scale.
- **Fix direction:** Wire `getReportsInServiceArea` (already built) to filter by shop's PostGIS service area. Add pagination (`limit`/`offset`) to the marketplace endpoint. As interim, add a `limit(100)` to the query.
- **Status:** RESOLVED (2026-04-16) — `getMarketplaceReports` now auto-filters for shops via `resolveShopGeoReportIds` (PostGIS `find_reports_in_service_area` RPC). Shops with service areas see only geo-relevant reports. Shops without service areas fall back to 50 most recent. Insurers/admins bounded to 100. Requires edge function redeploy.
- **Residual:** Shops without configured service areas see unbounded-ish fallback (50 limit). The real fix is ensuring all shops configure service areas during onboarding.

### KI-002: Email notifications not delivering

- **Impact:** When a customer receives a bid, or a shop's bid is accepted, there is no notification. Users must poll the app manually.
- **Location:** [notificationEmails.ts](../supabase/functions/server/handlers/notificationEmails.ts) — handlers exist but `RESEND_API_KEY` is not deployed to the Supabase edge function environment.
- **Code-side status:** COMPLETE. Three notification dispatchers (`notifyCustomerNewBid`, `notifyShopBidStatus`, `notifyCustomerClaimDecision`) with preference checks, Resend API integration, branded HTML templates, graceful fallback on failure. Column name bug (`full_name` → `name`) fixed. Email template deep links replaced with root URL (no URL routing yet — KI-011).
- **Remaining (human-only):**
  1. Create Resend account at resend.com and get API key
  2. Verify sender domain (`bidondent.com`) in Resend dashboard — or use `onboarding@resend.dev` for testing
  3. Deploy secrets to Supabase edge function env: `supabase secrets set RESEND_API_KEY=re_xxx`
  4. Optionally set `EMAIL_FROM_ADDRESS` and `SITE_URL` if defaults are wrong
  5. Deploy edge function: `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa`
  6. Test: submit a bid → verify customer receives email
- **Status:** Open — P0 launch blocker. Code-side complete; blocked on human secret deployment.

### KI-003: Rate limiter identity key from query params, not JWT

- **Impact:** Security issue. Rate limit key is derived from `url.searchParams.get('clerkUserId')` — a client-supplied value. A malicious client can pass a different userId to get a separate rate limit bucket, effectively bypassing rate limits.
- **Location:** [server/index.ts:119](../supabase/functions/server/index.ts#L119) — `const identity = url.searchParams.get('clerkUserId') ?? url.searchParams.get('customerClerkUserId') ?? null`
- **Current reality:** Rate limiting works for honest clients. Easy to bypass by any client that varies the query param.
- **Fix direction:** Extract identity from the verified Clerk JWT session (already parsed by `requireClerkSession`) rather than from query params. This requires restructuring the rate limit check to happen after (or during) auth verification, or extracting the JWT subject without full verification for rate-limit-only purposes.
- **Status:** RESOLVED (2026-04-16) — `extractJwtSubject()` decodes the JWT `sub` claim from the Authorization header instead of trusting query params. Falls back to IP-only if no JWT present. Requires edge function redeploy.

### KI-004: No bid acceptance confirmation dialog

- **Impact:** Accepting a bid is a financial commitment. Currently fires immediately on click with no "are you sure?" step. Accidental taps on mobile could accept a bid unintentionally.
- **Location:** [BidsScreen.tsx:299-320](../src/app/components/codelayer/BidsScreen.tsx#L299) — `onAccept` callback fires mutation directly. Has optimistic rollback on failure (good) but no pre-confirmation.
- **Current reality:** Click → mutation fires → notification pushed. No confirmation step.
- **Fix direction:** Add a confirmation dialog/bottom sheet before calling `onAcceptBid`. Show shop name, price, timeframe. "Accept this bid?" with confirm/cancel.
- **Status:** RESOLVED (2026-04-16) — `BidAcceptConfirmationDialog` added with Radix AlertDialog. Shows shop name, price, timeframe before confirming.

### KI-005: Many mutation failures only console.error

- **Impact:** When API calls fail, users see nothing — the UI appears to freeze or silently revert. Violates Law 5 (Errors Are User-Visible).
- **Location:** Multiple handlers in [buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts) — `onRejectBid`, `onUpdateJobStatus`, `onConfirmCompletion`, `onSaveVehicles` catch errors but only throw or console.error. No toast/UI feedback.
- **Current reality:** Some paths do have error toasts (marketplace report fetch, bid submission). Many do not.
- **Fix direction:** Add toast notifications to all async mutation handlers. Use the existing `NotificationContext.showToast()` pattern.
- **Status:** RESOLVED (2026-04-16) — `showErrorToast` callback added to `buildDashboardRouterProps`. All mutation handlers (`onRejectBid`, `onSaveVehicles`, `onUpdateJobStatus`, `onDeleteReport`, `onConfirmCompletion`) now show error toasts on failure via `NotificationContext.showToast()`.

---

## Architecture Bottlenecks

### KI-010: buildDashboardRouterProps is an architectural choke point

- **Impact:** Every new feature requires threading a callback through 4+ files: type interface → builder function → DashboardRouter → intermediate component → consuming component. This makes feature development O(n) in touched files.
- **Location:** [buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts) (267 lines) constructs 60+ props including inline async mutation handlers that mix Supabase service calls with local state updates. [dashboard-router-types.ts](../src/app/routers/dashboard-router-types.ts) (91 lines) defines the interface.
- **Current reality:** Adding one callback (e.g., `onDeleteReport`) required edits to: types file, builder, DashboardRouter, HomeScreen, HomeReportsList.
- **Fix direction:** Post-launch, replace with `DashboardContext` React Context. Components consume via `useDashboardContext()`. Builder function becomes a context provider.
- **Status:** Open — P2 (does not block launch, blocks sustainable feature development)

### KI-011: State-driven routing prevents URL sharing/bookmarking

- **Impact:** Users cannot share a link to a specific report, bid, or screen. No deep linking. Browser URL never changes. This blocks word-of-mouth growth (marketplace's primary acquisition channel).
- **Location:** [useNavigation.ts](../src/app/hooks/useNavigation.ts) — `viewMode` and `currentTab` stored in React state + localStorage. `history.pushState` used for back button but URL stays at `/`.
- **Current reality:** Navigation works well for single-session use. Bookmark, share, and refresh all go to whatever was in localStorage last.
- **Fix direction:** Post-launch, migrate to React Router or TanStack Router. URL becomes source of truth. `useNavigation` hook replaced by router's navigation API.
- **Status:** Open — P2 (does not block launch, blocks growth)

### KI-012: Bids have split state ownership

- **Impact:** `useUserData` holds stale bids from initial fetch. `useBidsForReport` holds live bids with Realtime subscription. `DashboardRouter` merges them with `liveBids.length > 0 ? liveBids : bids`. If Realtime disconnects, user silently falls back to stale data with no indicator.
- **Location:** [DashboardRouter.tsx:260](../src/app/routers/DashboardRouter.tsx#L260) — merge logic. [useBidsForReport.ts](../src/app/hooks/useBidsForReport.ts) — live bids.
- **Current reality:** Works when Realtime is connected. Silent degradation on disconnect.
- **Fix direction:** Add a "live" indicator or reconnection status. Consider making `useBidsForReport` the sole source for bid data when viewing bids.
- **Status:** Open — P3

---

## Data / Type / Model Issues

### KI-020: Type boundary has multiple mapping locations

- **Impact:** Renaming a DB column requires finding every mapping location. No single source of truth for snake_case → camelCase translation.
- **Location:** At least 4 mapping points: (1) `hydrateReport` in edge function handlers, (2) `mapReportFromApi` in `services/supabase/reports.ts`, (3) `mapBid` in `useBidsForReport.ts` (handles 4 field names for `shopId` alone), (4) inline mapping in various components.
- **Current reality:** Works because all mapping locations happen to agree. A schema change would require updating 4+ files and any missed location silently returns undefined/empty.
- **Fix direction:** Consolidate to single adapter functions per entity type (Law 4). Post-launch refactor.
- **Status:** Open — P2

### KI-021: DamageReport.status values differ between DB and domain type

- **Impact:** DB CHECK constraint uses `pending`, `reviewing`, `quoted`, `accepted`, `completed`, `cancelled`. Domain type uses `"pending" | "in-review" | "active" | "completed" | "resolved"`. The adapter (`normalizeReportStatus` in `adapters.ts`) maps between them, but any code path that writes domain values directly to DB will violate the constraint.
- **Location:** DB: `full_schema.sql:118` CHECK constraint. Domain: [types/index.ts:34](../src/app/types/index.ts#L34). Adapter: [adapters.ts:28](../src/app/services/supabase/adapters.ts#L28) `normalizeReportStatus`.
- **Current reality:** The adapter layer converts between formats. All known status-write paths now use valid DB values: `onConfirmCompletion` writes `"completed"` (was `"resolved"` — invalid), server-side accept-bid writes `"accepted"`. DB `"cancelled"` maps to domain `"pending"` (harmless — not used in core flow). Domain `"resolved"` is defined but no longer written anywhere.
- **Fix direction:** Align domain type to use DB values, or ensure adapter always translates. Post-launch refactor.
- **Status:** Open — P3 (narrowed: no active status-write violations remain)

### KI-022: updateReportStatus silent failure after bid acceptance

- **Impact:** After a customer accepts a bid, the report status should update to reflect the accepted state. Previously failed silently because the update was a separate client-to-server call that could fail independently.
- **Root cause:** The accept-bid flow was client-orchestrated across 3 separate API calls: (1) update bid status, (2) update report status, (3) create job assignment. When call #2 or #3 failed (network, timeout, navigation), the report stayed "pending" despite the bid being accepted.
- **Fix:** Moved report status update and job assignment creation into the server-side `updateBidStatus` handler. When a bid is accepted, the server atomically: accepts the bid, auto-rejects competitors, updates report status to "accepted", and creates a job assignment. Client no longer orchestrates these separately.
- **Status:** RESOLVED (2026-04-16) — Server-side atomic accept-bid flow in `bids.ts`. Client helper `handleAcceptBid` simplified to single API call + local state update. Requires edge function redeploy.

---

## Product / Workflow Gaps

### KI-030: Insurer role is a thin stub

- **Impact:** The insurer role has screens (`InsurerClaimsScreen`, `InsurerPartnerShopsScreen`) but no real claims data model. "Claims" are just damage reports. Claim approval/denial patches `damage_reports` directly. No policy verification, no adjuster workflow, no claims table.
- **Location:** [InsurerClaimsScreen](../src/app/components/insurer/InsurerClaimsScreen.tsx), [updateClaimDecision](../src/app/services/supabase/reports.ts).
- **Current reality:** Insurer can view all marketplace reports and "approve/deny" them by patching report fields. This is a demo-grade implementation.
- **Fix direction:** Defer real insurer investment until a real insurer signs up. Current stub is acceptable for soft launch if expectations are managed. Do not invest further.
- **Status:** Open — P3 (acknowledged, not blocking)

### KI-031: Empty view placeholders with no content

- **Impact:** Three `ViewMode` entries route to screens with no real content or backend: `competitor-analysis`, `insurance-companies`, `liked-shops`.
- **Location:** [useNavigation.ts VALID_VIEW_MODES](../src/app/hooks/useNavigation.ts#L12), various `onView*` handlers in `buildDashboardRouterProps`.
- **Current reality:** The screens still exist and ViewMode values are preserved, but the dead-end quick action tiles ("Competitors", "Browse Insurers") have been removed from shop and insurer home dashboards. ShopDirectoryScreen no longer routes to `competitor-analysis`. The empty screens are no longer reachable from normal navigation flows.
- **Residual:** The ViewMode values, route entries in DashboardSecondaryViews, navigation callbacks in buildDashboardRouterProps, and the screen components themselves remain for future use. `liked-shops` remains reachable via customer shop directory flow but renders a functional (if empty) saved-shops UI.
- **Status:** RESOLVED (2026-04-16) — dead-end navigation surfaces removed

### KI-032: Demo mode wired into production navigation

- **Impact:** ~150 lines of conditional logic across navigation, routing, and data fetching. Adds complexity to every feature. Should be behind a URL param or separate deploy per Hardening Plan Group 3a.
- **Location:** [useNavigation.ts](../src/app/hooks/useNavigation.ts) (enableDemoMode/exitDemoMode), [buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts) (demoMode conditionals), [DashboardRouter.tsx](../src/app/routers/DashboardRouter.tsx).
- **Current reality:** Demo mode sparkles button removed from header/sidebar. Demo mode is no longer accessible from normal user navigation. The demo-switcher view, DemoAccountSwitcher component, and demo state logic remain for developer/investor use but require programmatic access. URL param gating (Group 3a) remains a post-launch improvement.
- **Residual:** Demo conditional logic still present in routing/data-fetching code (~150 lines). Full URL param gating deferred.
- **Status:** RESOLVED (2026-04-16) — demo mode hidden from production navigation surfaces

---

## Operational / Trust Issues

### KI-040: Rate limiting is per-instance, not distributed

- **Impact:** Each edge function instance has its own in-memory rate limit store. If Supabase scales to multiple instances, rate limits are effectively multiplied.
- **Location:** [rateLimiter.ts](../supabase/functions/server/utils/rateLimiter.ts) — `const _store = new Map<string, RateLimitEntry>()`.
- **Current reality:** Acceptable for soft launch with low traffic. Will not hold at scale.
- **Fix direction:** Post-launch, migrate to Redis/Upstash for distributed rate limiting.
- **Status:** Open — P3 (not launch-blocking at low volume)

### KI-041: No content moderation pipeline

- **Impact:** Photos uploaded via damage reports go directly to Supabase Storage. No NSFW detection, no review queue.
- **Current reality:** Acceptable for soft launch with known participants. Must be addressed before public launch.
- **Fix direction:** Add image moderation service (e.g., AWS Rekognition, Google Cloud Vision) as a post-upload check. Flag/quarantine suspicious uploads.
- **Status:** Open — P3 (deferred to post-launch)

### KI-042: No dispute resolution mechanism

- **Impact:** After a bid is accepted, there is no mechanism if the shop doesn't show up, the repair quality is bad, or the price changes.
- **Current reality:** The "accept bid" action creates a job assignment with no enforcement, no escrow, no review system.
- **Fix direction:** Post-launch: reviews/ratings, then dispute workflow, then payment with escrow.
- **Status:** Open — P3 (deferred to post-launch)

### KI-043: Non-shop sessions trigger shop service-area API noise in account flows

- **Impact:** Customer/insurer account surface validation can emit avoidable `404/500` console noise tied to shop service-area fetch paths. This weakens runtime trust signals during QA and obscures real errors.
- **Current reality:** RESOLVED. `useShopServiceAreas()` now supports explicit enable guards, `useDashboardData()` only fetches service areas for shop users, and `ServiceAreaEditorModal` only fetches when opened.
- **Fix direction:** Keep shop-only service-area loading behind role- or modal-aware guards whenever new surfaces reuse this hook.
- **Status:** RESOLVED (2026-04-17)

### KI-044: Customer estimate request fetch can fail auth on dashboard reload

- **Impact:** Customer dashboard reloads can emit `500` console errors and leave estimate-request state incomplete when the edge function rejects the current Clerk token issuer.
- **Current reality:** Root cause was a startup race in the web client: some edge requests could fire before the Clerk token getter was registered, causing the request runtime to fall back to the Supabase anon key during dashboard hydration. That degraded into misleading Clerk issuer failures on the edge and noisy reload-time console errors.
- **Fix direction:** Resolved code-side by making `buildSupabaseEdgeHeadersAsync()` wait briefly for Clerk token registration before falling back to anon auth.
- **Validation:** Fresh browser reload captured `GET /functions/v1/server/estimate-requests?clerkUserId=...` returning `200` twice with no `Invalid Clerk token issuer` error. Remaining reload-time `500` noise is currently tied to `/functions/v1/server/navigation-session`, not estimate requests.
- **Status:** RESOLVED (2026-04-17) — verified in browser against the live edge environment.

### KI-045: Navigation session cloud sync depends on missing backend schema in the connected environment

- **Impact:** Authenticated dashboard loads could emit `500` noise from `/functions/v1/server/navigation-session`, and navigation session cross-device continuity is unavailable while the connected Supabase environment lacks `public.navigation_sessions`.
- **Current reality:** Live edge verification returned `{"error":"Could not find the table 'public.navigation_sessions' in the schema cache"}`. The client is now hardened to detect that specific failure, clear pending retries, and temporarily fall back to local session storage instead of repeatedly calling the broken cloud path.
- **Fix direction:** Restore schema parity in the connected Supabase environment by deploying the `navigation_sessions` table. The client-side cooldown is a mitigation only; true cross-device sync resumes when the backend table exists.
- **Validation:** After the hardening patch, a clean dashboard reload on a fresh page showed the normal edge hydration requests returning `200` and no `navigation-session` requests during the cooldown window.
- **Status:** MITIGATED (2026-04-17) — runtime noise suppressed client-side; backend schema drift still exists.

### KI-046: Browser geocoding flows depended on direct Nominatim requests

- **Impact:** Smart Shop Map origin search, navigation address suggestions, and report coordinate fallback could fail in-browser when direct requests to `nominatim.openstreetmap.org` were blocked or noisy, which weakened the map program's reload/search trust path.
- **Current reality:** Resolved. Shared browser geocoding callers now use the public `/functions/v1/server/geocode/search` route on the Supabase `server` function, which proxies the Nominatim request server-side.
- **Fix direction:** Keep browser geocoding behind the shared edge proxy and reuse that route for future place-search/geocode flows instead of adding new direct provider fetches in UI-facing code.
- **Validation:** Fresh desktop reload, live origin search (`Yonkers NY`), and mobile reload at `375x812` all returned `200` from `/functions/v1/server/geocode/search` with no direct browser requests to `nominatim.openstreetmap.org` observed.
- **Status:** RESOLVED (2026-04-17) — deployed live on the connected Supabase project.

### KI-048: Workflow handlers leak data and allow cross-user mutation

- **Impact:** `getJobAssignments` returns enriched job rows including customer name/email/phone with no auth check — public PII read by anyone who hits the route (the `server` edge function is deployed `--no-verify-jwt`, so the Supabase gateway does not block unauthenticated calls). `updateJobAssignmentStatus` and `createJobAssignment` require a Clerk session but perform no ownership check, so any authenticated user can flip any assignment's status by ID or author assignments naming arbitrary parties. `submitInsuranceClaim` and `updateClaimDecision` use `requireMarketplaceContext`, which permits shop accounts to author insurer-only claim decisions (privilege escalation into insurer authority).
- **Location:** [supabase/functions/server/handlers/workflow.ts](../supabase/functions/server/handlers/workflow.ts); [utils/authz.ts](../supabase/functions/server/utils/authz.ts).
- **Fix:** Code-side complete (Pass 5.5 / Pass 1, 2026-04-25). Added `requireInsurerContext` helper to `utils/authz.ts`. In `workflow.ts`: `getJobAssignments` now calls `requireAuthenticatedProfile` and rejects callers who are neither the named shop nor admin (403). `updateJobAssignmentStatus` pre-fetches the row and rejects callers not in `{shop, customer, insurer}_clerk_user_id` and not admin (403). `createJobAssignment` rejects callers who are not the named customer and not admin (403). `submitInsuranceClaim` and `updateClaimDecision` switched from `requireMarketplaceContext` to `requireInsurerContext` (insurer or admin only — verified UI callers are insurer-gated at [DashboardRouter.tsx:320-355](../src/app/routers/DashboardRouter.tsx#L320) and [DashboardSecondaryViews.tsx:286-310](../src/app/routers/DashboardSecondaryViews.tsx#L286), so no UI surface affected). `getWorkflowErrorStatus` updated to surface 403 for both `Marketplace access required` and `Insurer access required`. Build green (3.34s, 0 errors); tests 568/568 passing. Per-route verification artifacts captured in the pass log section of `LAW_HARDENING_PLAN.md`.
- **Remaining (human-only):** Edge function redeploy required: `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt`. After deploy, run the per-route verification checklist against the live edge environment and capture the actual status codes.
- **Status:** RESOLVED (code-side, 2026-04-25 — pending edge function redeploy + live verification).

### KI-049: Customer completion does not propagate to job_assignments

- **Impact:** When a customer confirms repair completion, `damage_reports.status` is set to `"completed"` but the linked `job_assignments` row is not touched. The shop's Active Jobs view reads from `job_assignments`, so the customer's completion is invisible to the shop indefinitely. Two source-of-truth rows on the same workflow disagree.
- **Location:** [supabase/functions/server/handlers/reports.ts](../supabase/functions/server/handlers/reports.ts) `updateReport`.
- **Fix:** Code-side complete (Pass 5.5 / Pass 2, 2026-04-25). `updateReport` now propagates: when the incoming `status` is `'completed'` and the report row update succeeds, the matching `job_assignments` row (status in `scheduled`/`in_progress`/`awaiting_parts`, not soft-deleted) is updated to `'completed'` in the same handler. A `repair_completed` activity event linking both IDs is emitted fire-and-forget. Propagation is non-fatal — assignment update failure is logged but does not roll back the report update. Note: the bid-accept "active vs accepted" label is **not** drift (adapter-reconciled by `normalizeReportStatus` per KI-021); the completion path was the only real lifecycle drift. Build green (3.22s, 0 errors); tests 568/568 passing.
- **Validation:** Local runtime verified 2026-04-26 by secondary AI (GPT-5.4-high) against the served edge function — `updateReport` call completed, the linked `job_assignments` row moved to `completed`, and a `repair_completed` activity event was written. Prod live verification still pending deploy.
- **Remaining (human-only):** Edge function redeploy (`supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt`). Then customer flow → confirm completion → shop's Active Jobs view shows the assignment as `completed` after refetch.
- **Status:** RESOLVED (code-side + local runtime verified 2026-04-26 — pending prod redeploy + prod live verification).

### KI-050: Authenticated marketplace falls back to seed data on cold start

- **Impact:** When live marketplace data is empty (cold-start with no live reports OR fetch failure), `useDashboardData` substituted `SEED_DAMAGE_REPORTS` for shop and insurer marketplace surfaces. An authenticated shop saw a populated marketplace and formed a false impression of platform liquidity. Contradicted the locked Hardening Plan Phase 4A.2 gate criterion ("Empty states no longer show fake shops").
- **Location:** [src/app/routers/useDashboardData.ts](../src/app/routers/useDashboardData.ts).
- **Fix:** Code-side complete (Pass 5.5 / Pass 3, 2026-04-25). `SEED_DAMAGE_REPORTS` import removed from `useDashboardData.ts`. `shopInsurerReports = liveMarketplaceReports` (direct passthrough). `usingSeedFallback = false`. Empty live data now renders the per-screen empty state already present on [ShopRequestsScreen.tsx:354-360](../src/app/components/shop/ShopRequestsScreen.tsx#L354) ("No repair requests yet"), [ShopActiveJobsScreen.tsx:392-401](../src/app/components/shop/ShopActiveJobsScreen.tsx#L392) ("No active jobs yet"), [InsurerClaimsScreen.tsx:347-359](../src/app/components/insurer/InsurerClaimsScreen.tsx#L347) ("No claims yet"). The amber `isSeedData` banners on all three screens are now unreachable but kept in code as harmless dead branches (cleanup deferred — out of pass scope). Seed-id mutation guards (`String(id).startsWith("seed-")`) preserved as belt-and-suspenders. `SEED_DAMAGE_REPORTS` constant stays exported for demo-mode use. No backend change. Build green (3.23s, 0 errors); tests 568/568 passing.
- **Validation:** Live visual verification complete 2026-04-26 by secondary AI (GPT-5.4-high) on all three target screens (`ShopRequestsScreen`, `ShopActiveJobsScreen`, `InsurerClaimsScreen`) in both light and map-dark appearance modes. Empty state was forced via network interception of marketplace + job-assignment feeds rather than seed/demo records. All three screens rendered the expected empty copy ("No repair requests yet" / "No active jobs yet" / "No claims yet") with no example-data banner and no layout breakage. No new accounts required.
- **Status:** RESOLVED (code-side + live visual verification complete 2026-04-26 — no further verification required for this KI; client-only change, no deploy needed).

### KI-047: Supabase security advisor flagged public tables in staging and leads projects

- **Impact:** Supabase security advisor reported `Table publicly accessible` on two separate hosted projects. In BidOnDent staging, six public-facing app tables had drifted away from their canonical RLS state. In the separate `bidondent-leads` Prisma project, `public."Lead"` and `public._prisma_migrations` were granted to `anon`/`authenticated` without RLS.
- **Current reality:** RESOLVED. Staging project `lhhdqycnhweaxqviwdqt` had an orphan remote migration row `001` blocking schema operations; after repairing that history row, the targeted backfill migration `supabase/migrations/20260423000001_remote_rls_backfill.sql` was applied remotely. Leads project `yjbugpzarlyidgxbljjn` received a targeted remote migration that enables RLS on `public."Lead"` and `public._prisma_migrations` with no public policies.
- **Validation:** `supabase migration list` now shows aligned local/remote history for both fix directories. Linked `supabase db dump --schema public` confirms `ENABLE ROW LEVEL SECURITY` on the leads tables and the expected staging policies for `shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `job_assignments`, `notification_preferences`, and `shop_service_areas`.
- **Status:** RESOLVED (2026-04-23)
