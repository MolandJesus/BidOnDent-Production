# BidOnDent — Known Issues (REFERENCE)

**Authority level:** REFERENCE — describes current known gaps, bugs, and structural issues.

**Last updated:** 2026-05-03

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

### KI-051: CSP missing overpass-api.de blocks public map place discovery

- **Impact:** The fullscreen coverage command center promises address and point-of-interest search, but in-browser the connect-src CSP in `vite.config.ts` did not allow `overpass-api.de`, while `src/app/services/navigation/placeDiscovery.ts` and `src/app/services/navigation/speedLimit.ts` fetch that domain directly. Result: richer place-discovery behavior was broken when the public full map opened from `CoverageMapDialog.tsx` and from the search surface in `PlannerAddressSearch.tsx`. Static recommendations still rendered; live discovery did not.
- **Location:** [vite.config.ts](../vite.config.ts) (CSP `connect-src`); [src/app/services/navigation/placeDiscovery.ts](../src/app/services/navigation/placeDiscovery.ts); [src/app/services/navigation/speedLimit.ts](../src/app/services/navigation/speedLimit.ts); consumers in [src/app/components/maps/command-center/PlannerAddressSearch.tsx](../src/app/components/maps/command-center/PlannerAddressSearch.tsx) and [src/app/components/landing/CoverageMapDialog.tsx](../src/app/components/landing/CoverageMapDialog.tsx).
- **Fix:** Option (b) shipped — `https://overpass-api.de` added to the dev-server `connect-src` allow-list in `vite.config.ts` on **2026-04-29 in commit `c7664c85`** (`fix(ui): friendly edge-error mapping + CSP allow-list overpass-api.de`). Production is statically served from Vercel with no separate CSP header (verified: no `vercel.json`, no `_headers`, no meta-tag CSP in `index.html`), so production browsers had unrestricted access throughout — only the dev-server browser audits were CSP-blocked. The 2026-04-26 audit observation was against pre-fix dev server.
- **Validation:** 2026-05-02 doc audit confirmed line 79 of `vite.config.ts` includes `https://overpass-api.de` in `connect-src`. Both `placeDiscovery.ts:67` and `speedLimit.ts:96` fetch the allowed origin directly with no proxy needed.
- **Note on lingering "Load failed" sightings:** The "Real nearby places: Load failed" string seen in the post-Pass-6 audit screenshots (2026-05-02) is the **browser's native fetch failure message** (Safari renders `Load failed`; Chrome renders `Failed to fetch`), surfaced unmapped through `NavigationDiscoveryPlacesList`. Post-CSP-fix, that message indicates a downstream issue (Overpass rate limit, transient outage, or browser network error) — not a CSP block. If it recurs persistently, file as a new KI scoped to provider-reliability or to routing the message through `edgeErrorMessage.ts:39` for friendlier copy.
- **Status:** RESOLVED 2026-04-29 (commit `c7664c85`). KI status sync 2026-05-02 (this update).

### KI-052: Public map invents travel time/distance for zero-distance demo routes

- **Impact:** The landing-page coverage command center showed `0.0 mi` plus `6–9 min` before route start and `50 ft` plus `1 min` after start, on a recommendation pinned to identical coordinates as its origin. Trust gap on the strongest public product surface — implies route metrics that do not exist.
- **Location:** Root cause: minimum-distance / minimum-duration floors in [src/app/components/maps/mapRoutePresentation.ts](../src/app/components/maps/mapRoutePresentation.ts). Surfaced in [src/app/components/maps/command-center/PlannerRoutePreview.tsx](../src/app/components/maps/command-center/PlannerRoutePreview.tsx) and [src/app/components/landing/CoverageActiveNavigationLayout.tsx](../src/app/components/landing/CoverageActiveNavigationLayout.tsx) which consume the floored values directly. Demo data in [src/app/components/landing/coverageData.ts](../src/app/components/landing/coverageData.ts) pins ZIP `10601` to the same coordinates as `BidOnDent Metro Hub`, which is what triggers the zero-distance edge case in the live demo.
- **Current reality:** Detected during the 2026-04-26 local audit pass. Build green. Issue only surfaces when origin and destination resolve to the same coordinates — but that exact case is reachable via the public demo path, so it is user-visible.
- **Fix direction:** Remove the minimum-distance and minimum-duration floors in `mapRoutePresentation.ts` so zero-distance and arrival-adjacent states render as `0 mi` / `Arrived` / blank, instead of synthetic numbers. Cross-check the consuming components handle the new zero/null shape. Optionally also separate the two coordinate-identical demo entries in `coverageData.ts` so the demo flow tests a real route by default.
- **Status:** Open — P4 (truthfulness polish on map-first product surface; pre-launch desirable, post-launch acceptable).

### KI-054: Dev-server CSP did not allow local Supabase, forcing brittle in-process proxy workarounds for browser audits

- **Impact:** The Vite dev-server CSP `connect-src` only allowed `https://*.supabase.co` (cloud), so any browser audit that pointed the app at the local Docker Supabase stack (`http://127.0.0.1:54321`) had every request blocked. The 2026-04-26 audit AI worked around this by spinning a same-origin Node proxy on port 4174, then later baking it into the repo as `scripts/local-browser-proxy.mjs` + an `http-proxy` dev dep + a second npm script. That proxy was a single point of failure: when its terminal was killed (or it OOM'd) the "dev server" appeared dead in-browser, even though Vite was still up.
- **Location:** [vite.config.ts](../vite.config.ts) `server.headers["Content-Security-Policy"]` `connect-src` directive.
- **Fix:** Code-side complete (2026-04-26).
  - Extended dev-server CSP `connect-src` to include `http://127.0.0.1:54321`, `http://localhost:54321`, `ws://127.0.0.1:54321`, `ws://localhost:54321`. This header is emitted by Vite's dev server only — production CSP (Vercel headers) is unaffected.
  - Simplified `scripts/dev-local-browser.mjs` to point Vite directly at the local Supabase API URL discovered via `supabase status -o env` (was previously pointing at the proxy origin). Now exposes `BIDONDENT_LOCAL_SUPABASE_URL` env override for the rare host/port deviation case.
  - Deleted `scripts/local-browser-proxy.mjs` (no longer needed).
  - Removed `http-proxy` dev dependency and the `local-browser-proxy` npm script from `package.json`.
  - Updated `docs/GETTING_STARTED.md` and `docs/REF_AI_BROWSER_NAVIGATION.md` to reflect the simpler one-command flow targeting `localhost:5173` directly.
  - Build green (3.79s, 0 errors); tests 568/568 passing.
- **Why this matters beyond the immediate fix:** The proxy approach hid the real architecture from devs (browser thought Supabase lived at 4174) and added a fragile process to the audit hot path. Fixing CSP at the source means future audit AIs have one less moving piece to keep alive and one less thing that can crash mid-pass.
- **Status:** RESOLVED (code-side, 2026-04-26 — no deploy needed; dev-only change).

### KI-055: Customer-owned data could disappear after Clerk ID rotation

- **Impact:** A returning customer could lose visibility of saved vehicles, report history, and customer-scoped bid access after a Clerk identity rotation or legacy `NULL` ownership state. The app header/profile still rendered because profile lookup fell back by email, but strict handler queries against the current `session.clerkUserId` could surface only a partial slice of the owned data.
- **Location:** [vehicles.ts](../supabase/functions/server/handlers/vehicles.ts), [reports.ts](../supabase/functions/server/handlers/reports.ts), and the customer ownership branch in [bids.ts](../supabase/functions/server/handlers/bids.ts).
- **Root cause:** Ownership rows existed under a mix of current `clerk_user_id`, historical `clerk_user_id`, and legacy `NULL` values linked by stable `user_id`. The previous recovery shape only ran the `user_id` fallback when the primary `clerk_user_id` query returned zero rows, which missed mixed accounts that had both current and legacy rows.
- **Fix:** RESOLVED code-side and deployed live on 2026-04-27. All three handlers now always merge the candidate-`clerk_user_id` query with a `user_id` ownership sweep, dedupe by row id, sort the merged result, and self-heal stale or `NULL` `clerk_user_id` values to the current session ID. Live SQL verification on project `wmdcnjgtsppftrofaqqa` confirmed a single vehicle ownership bucket (`user_37l2aa5TqRLeLesZQIq5ibdXUul = 20`) with no remaining `NULL` rows after the deployed fetch path ran.
- **Validation:** Local live UI verification after deploy showed `Account > My Vehicles` rendering `20 vehicles`, and the report intake step-1 saved-vehicle picker showed `20 saved` entries for the affected account.
- **Status:** RESOLVED (2026-04-27, commit `a62d683e`) — deployed to production and live-verified.

### KI-053: Map performance budget overruns on landing/fullscreen map

- **Impact:** During the 2026-04-26 audit, `mapPerformance.ts` repeatedly logged pan/zoom samples exceeding the configured budgets (observed: 502ms, 520ms, 543ms, with one 2096ms burst against 380ms / 450ms budgets). The instrumentation already exists; the budgets are being missed. Performance impact on map-first UX, especially on lower-end devices.
- **Location:** Instrumentation in [src/app/services/navigation/mapPerformance.ts](../src/app/services/navigation/mapPerformance.ts). Triggered during landing-page map and fullscreen `CoverageMapDialog.tsx` interactions.
- **Current reality:** Detected during the 2026-04-26 local audit pass. Observability is in place — no data-collection work needed. The data shows the budgets are not being met today.
- **Fix direction:** Investigate which layer/source/event handler is dominating frame time during pan/zoom (likely either the marker rendering path, the route geometry source, or un-throttled effects in the map controllers). Profile with Chrome DevTools performance panel before authoring any fix. Out of pre-launch scope unless investigation reveals a cheap win.
- **Status:** Open — P4 (polish; observability already exists, fix needs profiling).

### KI-056: Realtime live updates not flowing for Clerk-authenticated channels

- **Impact:** Authenticated subscribers (browser-side, Clerk-issued JWT) successfully connected to Supabase Realtime but `postgres_changes` events never delivered. Customer Bids tab and shop Active Jobs tab silently failed to update on cross-account writes; the only way to see new bids was to refresh the page.
- **Location:** `src/app/services/supabase/client.ts` (Realtime auth wiring); `src/app/App.tsx` (refresh interval); `supabase/migrations/20260429000001_realtime_publication.sql` (publication membership).
- **Root cause (compound):**
  1. The frontend injected a Clerk JWT into Realtime via a one-time `setAuth(token)` call on Clerk-load. After the token's short lifetime expired, every subsequent `channel.subscribe` silently failed against the cached stale token, and the modern `accessToken` callback option wasn't configured.
  2. The local Supabase `supabase_realtime` publication had zero tables — Realtime only forwards `postgres_changes` events for tables that are publication members. Production (`wmdcnjgtsppftrofaqqa`) already had the right tables, but local was missing them, and any fresh staging would have hit the same gap.
  3. RLS policies on the affected tables were already correct: they use `requesting_clerk_user_id()` (the JWT-`sub` helper at `20251230000001_full_schema.sql:31`), not `auth.uid()`-based comparisons. No policy rewrite was applied.
- **Fix (commit `1c34e44f` plus follow-up):**
  1. `client.ts`: pass an async `accessToken` callback to `createClient` that fetches a fresh `getToken({ template: "supabase" })` from Clerk at channel-join time. Eliminates the token-expiry race on initial subscribe.
  2. `client.ts`: convert `setSupabaseRealtimeAuth()` to a no-op (kept for backward compat).
  3. `client.ts`: add `refreshRealtimeAuth()` which fetches a fresh Clerk JWT and calls `realtime.setAuth(token)` to broadcast it to every live channel — needed for long-lived channels because the `accessToken` callback only fires at channel-join, not on heartbeat.
  4. `App.tsx`: drop the now-redundant initial `setSupabaseRealtimeAuth` call; add a 50s `refreshRealtimeAuth()` interval in the Clerk-load effect (cleared on unmount).
  5. `useBidsForReport.ts`: defensive retry-once (2s delay) on `CHANNEL_ERROR` for the case where Clerk session is mid-refresh at subscribe time.
  6. `migrations/20260429000001_realtime_publication.sql`: idempotent DO block that adds `bids`, `damage_reports`, and `estimate_requests` to `supabase_realtime`. Tolerates the publication not existing and skips already-member tables.
- **Validation:** Phase 3 audit (2026-04-30) against production: WebSocket connected with Clerk JWT, `phx_reply status:"ok"` received for all subscribed bid channels, live INSERT against `bids` delivered to a customer-side subscriber after a token refresh on a near-expiry JWT.
- **Status:** RESOLVED — frontend code changes committed; production publication already had the necessary tables. No production schema changes were applied directly.

### KI-057: Realtime channel cycling in React StrictMode (dev only)

- **Impact:** In development, React StrictMode double-invokes effects. `useBidsForReport` creates channels, StrictMode cleanup removes them, then mounts again. This causes `phx_join → phx_leave → phx_join` cycling on every Bids tab open. Channels do eventually settle with `phx_reply status:"ok"` but the cycling produces misleading "WebSocket closed before connection established" console warnings.
- **Location:** `src/app/hooks/useBidsForReport.ts` + `src/app/services/realtime/RealtimeBidService.ts`.
- **Current reality:** Cosmetic in dev. StrictMode is disabled in production builds (Vite's `npm run build` removes double-invoke behavior). Phase 3 live test (2026-04-30) confirmed channels reach `SUBSCRIBED` state and receive INSERT events in production-equivalent conditions. No fix needed for prod.
- **Fix direction:** If dev DX becomes painful, add an unmount guard using `AbortController` or move subscription to a non-StrictMode-affected location. Not worth the complexity until it causes a real dev workflow issue.
- **Note:** A near-expiry JWT at channel-creation time can cause the first join to use the anon role. The 50s `refreshRealtimeAuth()` interval mitigates this — calling `rt.setAuth(freshToken)` updates all channel auth and delivers any queued events.
- **Status:** Open — P7 (tech debt, cosmetic in dev, non-blocking in production)

### KI-047: Supabase security advisor flagged public tables in staging and leads projects

- **Impact:** Supabase security advisor reported `Table publicly accessible` on two separate hosted projects. In BidOnDent staging, six public-facing app tables had drifted away from their canonical RLS state. In the separate `bidondent-leads` Prisma project, `public."Lead"` and `public._prisma_migrations` were granted to `anon`/`authenticated` without RLS.
- **Current reality:** RESOLVED. Staging project `lhhdqycnhweaxqviwdqt` had an orphan remote migration row `001` blocking schema operations; after repairing that history row, the targeted backfill migration `supabase/migrations/20260423000001_remote_rls_backfill.sql` was applied remotely. Leads project `yjbugpzarlyidgxbljjn` received a targeted remote migration that enables RLS on `public."Lead"` and `public._prisma_migrations` with no public policies.
- **Validation:** `supabase migration list` now shows aligned local/remote history for both fix directories. Linked `supabase db dump --schema public` confirms `ENABLE ROW LEVEL SECURITY` on the leads tables and the expected staging policies for `shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `job_assignments`, `notification_preferences`, and `shop_service_areas`.
- **Status:** RESOLVED (2026-04-23)

### KI-058: Persisted signed URLs in damage_reports.photo_urls expire after 24h

- **Impact:** Damage report photos broke ~24h after upload. The dashboard rendered placeholder icons instead of photos. Users had to refresh hopelessly — refreshing didn't help because the persisted URL itself was dead.
- **Location:** [supabase/functions/server/handlers/storage.ts](../supabase/functions/server/handlers/storage.ts) `handleUploadPhoto` was returning a 24h signed URL as `publicUrl`; the client persisted that into `damage_reports.photo_urls` (text[]).
- **Root cause:** Conflated upload-time signing (one-shot, 24h max) with persistence-suitable URLs. Read paths via `hydrateReport` would have re-signed correctly, but they were operating on already-expired URL strings the next day.
- **Fix (2026-05-02):** Storage pointer pattern. Upload returns `storage://<bucket>/<path>` pointer. DB stores pointers. Read paths re-sign at every request via `hydrateSignedStorageUrl()` / `hydrateSignedStorageUrls()`. Backfill migration `20260501000001_storage_pointer_backfill.sql` converted 4 prod rows. See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §16 and the `supabase-storage-signed-urls` skill.
- **Status:** RESOLVED (2026-05-02). All hydrate read paths audited (`reports.ts`, `workflow.ts`, `vehicles.ts`, `profiles.ts`, `network_profiles.ts`); only `getJobAssignments` had a bypass which was fixed in the same commit.
- **2026-05-03 follow-up:** re-audit confirmed the read paths are still clean. One narrow gap closed in the same pass: `hydrateReport` in `reports.ts` had a catch-block fallback that returned the raw `record.photo_urls` (storage:// pointers) when hydration threw, which would leak unhydrated pointers to the client. Fallback now returns an empty array — fails closed instead of leaking. Requires edge function redeploy to take effect in production.

### KI-059: Gateway `verify_jwt: true` breaks Clerk JWT auth

- **Impact:** When `verify_jwt: true` is configured for the `server` edge function, the Supabase gateway returns `401 UNAUTHORIZED_LEGACY_JWT` for every Clerk-authenticated request before the function runs. Symptom: signed-in users see empty dashboards and unrenderable photos.
- **Location:** Function `verify_jwt` flag + `supabase/config.toml` `[functions.server]` block.
- **Root cause:** The Supabase gateway only validates JWTs signed by Supabase's own JWT secret. Clerk JWTs (signed by Clerk) cannot pass gateway validation. The function does its own Clerk verification via `requireClerkSession()`, which only runs if the gateway lets the request through.
- **Fix (2026-05-02):** Set `verify_jwt: false` and pin it in `supabase/config.toml` `[functions.server]` so future deploys read it from config and don't need `--no-verify-jwt` on every command. Symptom-mapping table at [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §17.
- **Status:** RESOLVED (2026-05-02). Skill: `supabase-clerk-edge-function`.

### KI-060: Two legacy edge functions still deployed and unused

- **Impact:** `make-server-9f243523` (v70) and `make-server-85e96b22` (v2) remain ACTIVE on `wmdcnjgtsppftrofaqqa` but no current code path calls them. They consume no compute when idle but add log/dashboard noise and confuse new contributors.
- **Location:** Edge function listing for project `wmdcnjgtsppftrofaqqa`. Frontend code calls only `/server/<route>`.
- **Fix direction:** Verify zero traffic to either via `get_logs`. Delete via Dashboard → Edge Functions → three-dot → Delete. `make-server-9f243523` is referenced in `SUPABASE_SETUP_GUIDE.md` §13 as a "legacy alias for compatibility" — that note can also be removed when the function is deleted. Tracked as Post-Launch L1 (per the existing roadmap reference in §13).
- **Status:** Open — low priority. Nothing breaks if left in place; deletion is housekeeping.

### KI-061: Production compute over-provisioned for current data footprint

- **Impact:** `wmdcnjgtsppftrofaqqa` was running on **Medium** compute (~$60/mo) for 16 MB of database content and 2 auth users. Bill was ~$100/mo across the org. Compute downgrade is reversible at any time.
- **Location:** Supabase Dashboard → project → Settings → Compute and Disk.
- **Fix (2026-05-02):** Downgraded production to **Micro** (~$10/mo). Saves ~$50/mo. Will need to revisit when real traffic begins; Micro can hit shared_buffers/connection limits earlier than Medium under load.
- **Status:** RESOLVED (2026-05-02). Skill: `supabase-pro-cost-control`.

### KI-062: Hero scene bid cards not hidden on mobile — layout overflow regression

- **Impact:** At ≤767px viewport width the hero right-column scene (3 `bd-bid-card-float` elements) remains in the DOM and overflows into the left column. The "Repair Completed!" card covers the "Learn More" secondary CTA and the trust chip row. Observed at 375px and 680px in both light and dark modes. Plan Decision #4 requires hiding the entire right-side scene on mobile.
- **Location:** `src/app/components/landing/HeroSection.tsx` — bid card elements use absolute positioning with no `hidden md:block` or `md:hidden`-guarded wrapper class on the scene container.
- **Root cause:** Pass C added the hero scene; the mobile CSS motion budget guard (`@media (max-width: 767px)`) only disables `animation` on `bd-bid-card-float` — it does not set `display: none` on the scene container or bid card elements.
- **Fix direction:** Wrap the hero right-column scene in a `hidden md:flex` (or `md:block`) container so it collapses on mobile, or add `display: none` to the mobile CSS block for `bd-bid-card-float` elements.
- **Status:** RESOLVED 2026-05-03 — added `display: none !important` to the existing `@media (max-width: 767px) .bd-bid-card-float` rule in `theme.css`. System-level guard, safe because `bd-bid-card-float` is pinned to hero-scene context only (Pass B). Visible at 375/680px in both modes confirmed fixed.

### KI-063: Hero scene has 3 floating bid chip cards (plan spec: 2); card labels imply real operational data

- **Impact:** Anti-Goal #9 in `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md` requires bid card text to be "obviously sample/illustrative or use generic labels." Current labels: "Avg. response < 48 hrs", "Repair Completed! / Bid selected and scheduled through platform" read as live operational claims. The plan specified 2 chips with labels "Quote • $1,240" and "ETA 4 days." A third chip ("NY Active Service Region") is also present beyond the plan spec.
- **Location:** `src/app/components/landing/HeroSection.tsx` — hero scene bid card elements.
- **Fix direction:** Reduce to 2 cards. Update labels to be clearly sample/illustrative (e.g., "Quote • $1,240", "ETA 4 days") per plan spec.
- **Status:** RESOLVED 2026-05-03 — both subparts now closed:
  - Anti-Goal #9 copy: Card 1 "Bids Received / Avg. response < 48 hrs" → "Sample quote / $1,240 estimate" (circle "3" → "$"); Card 3 "Repair Completed! / Bid selected and scheduled through platform" → "Estimated ETA / ~4 days for sample repair".
  - Decision #2 card count: NY / Active Service Region badge removed from hero scene — count now 2, matching plan spec. Same NY content stays communicated via hero eyebrow ("Now serving New York"), trust chip ("Now available in NY"), and Coverage section region chips, so no factual loss to landing.

### KI-064: Honda Accord dashboard thumbnail renders as a solid red rectangle

- **Impact:** The 2023 Honda Accord report card on the customer dashboard shows a solid red rectangle in place of the damage photo. Trust break — looks broken at first glance and contradicts the "premium glass fallback for missing media" guarantee added in V1.
- **Location:** `src/app/components/codelayer/HomeReportsList.tsx` reads `report.photos[0]` and pipes it through `ImageWithFallback`. The hydration path on the server (`supabase/functions/server/handlers/reports.ts:98`) calls `hydrateSignedStorageUrls`, so under normal flow `photo_urls[0]` reaches the client as a signed HTTPS URL. `ImageWithFallback` only triggers its fallback on (a) empty/non-string src, (b) `storage://` literal, or (c) `<img>` `onerror`.
- **Root cause hypothesis (read-only investigation only — not confirmed against production data):** the persisted `photo_urls[0]` for this specific record points to an image whose **content** is a red rectangle (e.g. a 1×1 placeholder JPEG, a corrupt upload, or a legacy seed/fixture). Hydration succeeds, the signed URL fetches a real image, the browser renders it cleanly — and the image just happens to be red. The V1 fallback can't catch this because nothing is "broken" from the renderer's perspective.
- **Why architecture is unlikely to be the root cause:** Other report thumbnails on the same dashboard render correctly (e.g. the 2021 Toyota Camry damage photo loads fine). If hydration were globally broken, all photos would fail the same way. The Camry path proves the read+adapter+`ImageWithFallback` chain works end-to-end.
- **Diagnostic the owner can run (production data, read-only):**
  ```sql
  SELECT id, vehicle_make, vehicle_model, vehicle_year, photo_urls
  FROM damage_reports
  WHERE vehicle_make ILIKE 'Honda%'
    AND vehicle_model ILIKE 'Accord%'
    AND vehicle_year = 2023
  ORDER BY created_at DESC
  LIMIT 5;
  ```
  Three possible outcomes:
  - `photo_urls[0]` is a `storage://` literal → hydration is failing for this record specifically; debug `hydrateReport` catch path.
  - `photo_urls[0]` is empty/null → record has no photo, `ImageWithFallback`'s fallback should fire; if it isn't, that's a bug to chase.
  - `photo_urls[0]` is a `storage://` pointer pointing to a real object whose bytes are a red placeholder → confirmed data, not code; correct via owner-approved record fix or re-upload.
- **Fix direction:**
  - If data: re-upload a real damage photo for that report, or null out `photo_urls` so the fallback fires. No production mutation without explicit owner approval.
  - If hydration: file-specific fix in the `hydrateReport` catch path or in the storage util.
- **Status:** Open — diagnostic still pending owner SQL run against production data; do not mutate production data without owner sign-off. Phase 3 (2026-05-03) verified that `HomeReportsList.tsx:206` already pipes `report.photos[0]` through `ImageWithFallback`, and KI-065's defense-in-depth gap (every other raw `<img>` user-media site) is now resolved (commit `01c3f300`). The red rectangle therefore cannot be a `storage://` leak or onError fallback miss on this surface — it has to be the underlying image bytes (the diagnostic's third outcome). Code-level safe: confirmed. Awaiting owner data action.

- **Symptom update (2026-05-03, dev server):** Owner reports the Honda Accord card now shows the **generic image-placeholder icon** (mountain/landscape glyph), not a red rectangle. This means `ImageWithFallback` is now successfully _firing its fallback_ on this surface — three possible triggers, all benign code-side:
  1. `report.photos[0]` is empty/null → empty-src fallback fires (designed behavior).
  2. `report.photos[0]` is a `storage://` literal → storage-pointer fallback fires (designed; would mean dev hydration is failing for this record only).
  3. `report.photos[0]` resolves but the image bytes are tiny/broken/blank → new generic small-image fallback added in commit `992b728f` fires (designed).
     Owner action on **dev/staging** (safe to mutate non-prod):
  - Easiest: open the report in the dashboard and re-upload a real damage photo. Confirms (1) or (2) was the cause and clears it.
  - SQL inspection (against the dev/staging Supabase project): run the SELECT from the previous bullet to see whether `photo_urls` is empty, a `storage://` pointer, or a hydrated URL.
  - Production: still no mutation without explicit owner sign-off.

### KI-065: Defense-in-depth gap — multiple raw `<img>` sites can render `storage://` if server hydration catch-clause fires

- **Impact:** The server-side hydration path (`supabase/functions/server/handlers/reports.ts:95-150`, `vehicles.ts`, `profiles.ts`, `network_profiles.ts`) wraps `hydrateSignedStorageUrl(s)` in a try/catch that returns the raw `photo_urls` / `image_url` / `profile_image_url` if hydration throws. That catch-fallback can leak `storage://` pointers to the client. Several frontend render sites bind those URLs directly to `<img src=...>` without using either `ImageWithFallback` wrapper, so a hydration failure produces an invisible/broken image rather than a designed fallback. Theoretical exposure under normal flow; real exposure if hydration throws (e.g. Storage outage, RLS edit, expired service-role token, missing object).
- **What was hardened in this pass (commit-level fixes, not a full sweep):**
  - `src/app/components/figma/ImageWithFallback.tsx` now mirrors the codelayer `ImageWithFallback` `storage://` guard, so its 4 existing callsites (`BenefitsSection`, `dashboard/DashboardHeader`, `dashboard/ProfileDropdown`, `account/AccountHeader`) are protected zero-cost.
  - `src/app/components/app/DashboardSidebar.tsx:265` and `src/app/components/app/DashboardHeader.tsx:431` profile-image conditionals now drop through to the initials avatar (designed fallback) when `userImageUrl` starts with `storage://`.
  - `src/app/components/codelayer/account/EditProfileModal.tsx:133` profile-image conditional now drops through to the default profile image when `profileImage` starts with `storage://`.
- **Sites still rendering raw `<img>` with user/DB-sourced URLs (no fallback wrapper):**
  - `src/app/components/reports/ReportDetailScreen.tsx:447` — full-size selected report photo
  - `src/app/components/reports/PhotoGalleryLightbox.tsx:69, 128` — main lightbox image + thumbnail strip
  - `src/app/components/maps/ReportDetailDrawer.tsx:176` — drawer photo strip
  - `src/app/components/maps/ReportLayerPopup.tsx:41` — map popup preview thumbnail
  - `src/app/components/shop/ShopRequestCard.tsx:204` — shop-side request preview
  - `src/app/components/shop/ShopDetailSheet.tsx:109` — shop record image
  - `src/app/components/insurer/InsurerClaimCard.tsx:136` — insurer claim preview
  - `src/app/components/insurer/InsurerPartnerShopCard.tsx:65` — insurer partner-shop image
- **Fix direction (next pass):** the cleanest move is to wrap each of these in the codelayer `ImageWithFallback` (matches the dashboard report-card treatment from V1 — premium glass placeholder on `storage://` / empty / load-error). Minimal-surface alternative: add a tiny `isRenderableMediaUrl` shared util and gate each conditional like the three sites fixed in this pass. Either way, low risk; the surfaces above all already render hydrated URLs in normal flow.
- **Root-cause alternative:** instead of patching ~8 frontend sites, consider tightening the server hydration catch path so it returns `null` (or empty array) rather than the raw `storage://` string. That makes downstream rendering uniformly safe — `<img src="">` falls back via the standard onError path, and `null` skips the conditional entirely. Tradeoff: loses the ability to present a "soft" hydration failure (showing the raw record) in dev/debug.
- **Status:** RESOLVED 2026-05-03 (commit `01c3f300`). Phase 3 of the merge-readiness autopilot pass swept all eight remaining sites in the inventory above and replaced the raw `<img>` with `ImageWithFallback` (which already guards `storage://` and onError). Server hydrate catch-path can no longer leak a broken image to any user-media surface in the app — every render path now lands on either a real signed URL or the premium glass-tile fallback. Architecture-side root-cause fix (server hydrate returning `null` instead of raw `storage://`) deferred — defensive coverage on the client is now complete and uniform, removing the urgency. Skill: `supabase-storage-signed-urls`.

### KI-066: Visual LAW palette drift remains in selected dashboard shadow stacks

- **Impact:** The locked 2026-05-03 LAW palette forbids the older yellow-amber register (`rgba(220,165,90,*)`, `rgba(220,140,50,*)`, `rgba(160,95,25,*)`, `rgba(254,248,220,*)`) and pure-white inset highlights on premium surfaces. A targeted planning sweep found remaining dashboard overlay/panel shadow stacks still using those values. New polish layered on top would inherit the drift and make the gold language harder to control.
- **Location:** `src/app/components/dashboard/ProfileDropdown.tsx` inline `boxShadow`; `src/app/components/dashboard/NotificationCenter.tsx` empty-state icon plate shadow; `src/styles/theme.css` light-mode `.bd-dashboard-panel::before` / `.bd-dashboard-section::before` and corner-lamp `::after` rules. Full file/line queue is in `docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md` P0.
- **Fix direction:** Run the P0 grep sweep from `PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md` before adding any new visual polish. Replace stale yellow-amber values with the locked bronze/champagne values from `LAW_PROJECT_RULES.md` § Premium Gold Palette. Replace load-bearing pure-white insets with champagne/cream or cool ice-blue insets as appropriate.
- **Status:** RESOLVED 2026-05-03. Multi-pass sweep across the dashboard, landing, and map control surface families:
  - Light dashboard surfaces: `6f541f89` + `fb60f03d` (theme.css panel/section/report rules; ProfileDropdown, NotificationCenter, MarketStatusIndicator, CustomerMapWidget, MapLibreDashboardMapPreview, MobileBottomNav, ProfileRoleStats, ShopMapWidget, InsurerMapWidget, DashboardAtmosphere, DashboardSidebar footer + avatar rings, DashboardHeader white-body surfaces).
  - Dark dashboard surfaces: `51876a72` (mirror of light pass on the `:` dark branches across the same files).
  - Landing surfaces: `55fa2755` (AboutOpportunitySection, AboutPage, BenefitsSection, CTASection, HeroSection, InsurerPartnershipPage, LandingPageHeader, OperatingRegionsSection, TrustStatsSection — light + dark, theatrical role preserved with cream-warm gradients on TrustStats commitment cards, cool blue-cream on hero floating chips).
  - Map control surfaces: this commit (`mapSurfaceTheme.ts` light branch — segmented, secondary/compact/icon buttons, soft badges, list cards, tertiary surfaces — moved off white-body and white insets onto the cool blue-cream + bronze trim + cream inset family).
    Branch-aware grep on dashboard + landing + maps now returns zero forbidden-register hits in light branches; dark branches across dashboard surfaces also clean. Deeper map leaf components (MapBidSheet, MapLibrePartnerShopLayer, navigation/_, command-center/_) deferred to a dedicated map-polish pass — central `mapSurfaceTheme.ts` propagation gives the bulk of the visual win without risking regressions on Codex's recent immersive-map work. Skill: `bd-design-identity`.
  - **Component-leaf follow-up (this pass):** Repository-wide grep surfaced four additional active component-level drift sites missed by the prior sweep — aligned to the locked palette: `src/app/components/codelayer/ImageWithFallback.tsx` (fallback inset), `src/app/components/codelayer/HomeScreenSections.tsx` (mobile right-edge fade affordance), `src/app/components/codelayer/HomeReportsList.tsx` (report card thumbnail plate, light + dark), and `src/styles/theme.css` `.bd-dashboard-panel::after` global/dark corner lamp (light variant was already aligned). Component-side branch is now zero-hit for all forbidden registers (`grep -rn "rgba(220, *165, *90\\|rgba(220, *140, *50" src/app/` returns nothing).
  - **Map leaf follow-up (FULLY RESOLVED 2026-05-03):** All ~14 deferred map leaf components closed across 4 sub-commits per the cloud autopilot pass: `148c61ef` (navigation/), `bc0691d1` (command-center/), `e3870b23` (MapLibre*), `8e3aa8ac` (ReportDetailDrawer + MapBidSheet verified clean). Decorative 1px starfield pinpricks in `MapLibreServiceCoverageMap.tsx:185–190` preserved per LAW case-by-case provision.
  - **KI-066c (theme.css ~108 forbidden hits) — RESOLVED 2026-05-03 (commit `d54b9f05`):** Disciplined per-family global sweep (Python regex script) closed 113 forbidden-register hits across `bd-glass-card--landing/dashboard`, `bd-glass-badge` variants, `bd-shell-header--dark`, `bd-glow-pool`, `bd-report-flow`, `bd-dashboard-section--accent-*` families, `bd-dashboard-primary-button` states, `bd-bid-card-float` sheen, light-mode token shadow halos. Light-mode ivory body gradients (rgba(254,248,232), rgba(248,238,215), rgba(254,247,230), rgba(247,235,210)) explicitly PRESERVED per LAW Light-Mode Surface Rule — only trim/halo/lamp/cream-inset registers were swapped. Branch-aware grep across `src/styles/theme.css` now returns zero forbidden-register hits.
  - **KI-066d (4 audit-discovered residuals) — RESOLVED 2026-05-03:** Multi-AI audit caught 4 forbidden-register hits the KI-066c Python sweep missed: theme.css L857 (`--bd-warm-dark-amber-ellipse-top` `rgba(220,140,40,0.3)` → `rgba(196,130,45,0.30)`), theme.css L1529 (`.bd-glass-card--landing-warm` dark inset `rgba(255,230,175,0.32)` → `rgba(252,240,208,0.32)`), theme.css L1589 (`.bd-dashboard-atmosphere` dark top radial `rgba(220,140,40,0.26)` → `rgba(196,130,45,0.26)`), theme.css L3447 (`.bd-gold-sheen-hover` sweep midpoint `rgba(220,165,80,0.3)` → `rgba(196,144,65,0.30)`). Branch-aware grep on `src/styles/theme.css` + `src/app/components/` + `src/app/` now returns ZERO forbidden-register hits. Codebase at 100% LAW palette compliance.
  - **Bucket 1.2 audit (dashboard hand-rolled shadow re-verification) — SKIP, no-op:** Multi-AI audit verified all 7 files claimed in the Phase A1 commit message (`ProfileDropdown.tsx`, `NotificationCenter.tsx`, `DashboardHeader.tsx`, `CustomerMapWidget.tsx`, `ShopMapWidget.tsx`, `InsurerMapWidget.tsx`, `DashboardSidebar.tsx`) are already 6-criteria depth-bar compliant from prior KI-066 work or are fully class-based and inherit from theme.css tokens. `DashboardSidebar.tsx` does not exist — real nav is `MobileBottomNav.tsx` + `DesktopNavTabs.tsx` (both forbidden-clean). No edits required.

### KI-067: Mobile fullscreen coverage map opens too sheet-first for a map-first product

- **Impact:** Mobile screenshots show the full coverage map experience dominated by the command sheet/panel on open, with the map mostly hidden. That undercuts BidOnDent's map-first identity and makes the fullscreen interaction feel like a form drawer instead of an immersive spatial browser. Some screenshots also suggest close affordance duplication/confusion.
- **Location:** `src/app/components/landing/MobileMapBottomSheet.tsx`, `src/app/components/landing/CoverageMapDialog.tsx`, `src/app/components/landing/CoverageBrowseExperience.tsx`, and `src/app/components/landing/CoverageBrowseSidebarContent.tsx`.
- **Fix direction:** Default mobile fullscreen map to a compact/peek sheet state so the map remains visible, then allow deliberate expansion. Preserve the owner-approved double-tap/double-click gate from the hero map. Keep one obvious close path, protect bottom safe-area spacing, and verify Search/Explore/Saved/Shops modes in light and dark.
- **Status:** Partial — softer pattern shipped 2026-05-03 (commit `fc4b5c56`): NotificationCenter and ProfileDropdown popovers now anchor near the bottom of the viewport on mobile (with safe-area padding) and carry a bronze/gold drag-handle bar at the top — visual reachability fix without committing to full sheet conversion. The full map dialog bottom-sheet height reshape itself remains deferred (HOLD per relay — Codex territory; needs explicit owner approval before reshape).

### KI-068: Shop family load-bearing white surfaces (light mode)

- **Impact:** Repository-wide audit during the Phase A3 cloud autopilot pass surfaced 36 files in `src/app/components/shop/` with 77 hits of `bg-white/[789]+` or `rgba(255,255,255,0.7+)` load-bearing surfaces. Light-mode whitening risk concentrated in shop directory shell, immersive map top bar/origin picker, sheets/modals, search/origin/route panels, and screen headers. Dark-side bg-white/[0.04-0.10] low-opacity overlays were preserved (atmospheric accents per LAW).
- **Status:** RESOLVED 2026-05-03 across 5 sub-commits per sub-family:
  - `73db2f2e` — sheets/modals (ShopDetailSheet, shopDetailSheetParts, ShopBidModal, ShopRatingModal)
  - `7b150f58` — directory shell + immersive (ShopDirectoryHybridStage, ShopDirectoryHybridHeader, ShopDirectoryHybridMapSection, ShopDirectoryHero, ImmersiveMapTopBar, ImmersiveOriginPicker, ImmersiveMapResultsDrawer)
  - `23b2562c` — map overlays + info panel (ShopDirectoryMapOverlays, ShopDirectoryMapPaneOverlays, ShopDirectoryMapPaneInlineUI, ShopDirectoryMapInfoPanel, MapLibreShopDirectoryMapPane)
  - `6c2cf166` — search/origin/route panels (ShopDirectorySearchPanel, ShopDirectoryOriginSearch, ShopDirectoryRoutePreviewCard, ShopDirectoryListBody, ShopDirectoryContextCards, ShopDirectoryIntelligencePanel)
  - `e7eeaac4` — cards/lists/screens (LikedShopCard, LikedShopsScreen, ShopRequestsScreen, ShopActiveJobsScreen, ShopOnboarding, ShopEstimateInboxScreen, GuidanceArrivalSection, ShopActiveJobDetailModal, EstimateRequestSheet, ShopActiveJobCard)
- All load-bearing whites swapped to the locked palette pattern (cream rgba(247,232,194) → cool blue rgba(232,238,248) gradient + bronze rgba(140,82,22) trim + cream rgba(252,240,208,0.78) inset highlight + drop shadow). Dark branches simultaneously upgraded to the dark depth bar (gold lamp inset bevel, bronze rim, cool blue 1px structural ring, bronze atmospheric halo). Skill: `bd-design-identity`.

### KI-069: Dark-mode panels lacked gold-lamp top bevel + bronze atmospheric halo + cool blue structural ring

- **Impact:** Pre-Phase-A1 dark dashboard panels and sections were palette-correct but read flatter than their light counterparts because the shadow stack relied on `rgba(2,6,23,*)` black drops without a gold-lamp inset highlight on the inside top edge or a bronze atmospheric halo on the outer edge. The "navy lit by gold lamp" identity was visible but understated. Owner directive ("ESPECIALLY shadow, 3D depth, gold lighting") called for the missing layers.
- **Status:** RESOLVED 2026-05-03 across `ed38beea` (theme.css dark dashboard tokens + panel/section variants) and `54c231fb` (mapSurfaceTheme.ts dark tone tokens + map leaf inline shadow stacks: CurrentSpeedBadge, NavigationActionRail, NavigationDeviationPrompt, MapLibrePartnerShopLayer popup; OperatingRegionsSection mode-badges spine; Coverage Command Center sticky header card emphasis). The 6-criteria dark depth bar is now binding across the dashboard + map families:
  1. Top inset bevel: `rgba(196,144,65,0.18-0.28)` — gold lamp from above
  2. Outer shadow: 2-layer black (close 0_8-12 + far 0_22-32) + bronze atmospheric halo `rgba(196,130,45,0.10-0.18)`
  3. Bottom inset rim: `rgba(140,82,22,0.18-0.24)` — bronze depth seam
  4. 1px structural ring: cool blue `rgba(96,165,250,0.14-0.22)`
  5. Border: cool blue `rgba(96,165,250,0.20-0.30)` (warm pop tiles like `--accent-gold` / `--accent-champagne` keep warm bronze trim per LAW)
  6. Body: navy gradient (preserved); no white >=70% opacity
- The .bd-dashboard-section--interactive existing hover transform (`translateY(-1px)` + brighter hover-shadow var) now picks up the brightened inset bevel + halo from the upgraded section-hover-shadow token.

### KI-071: HeroSection inline boxShadow forbidden-register residuals + mapSurfaceTheme.ts comment-block forbidden literals

- **Impact:** Two inline `boxShadow` stacks in `src/app/components/landing/HeroSection.tsx` carried forbidden-register values that survived the KI-066c theme.css-only sweep (sweep was scoped to theme.css, did not touch component inline styles). L593 desktop hero map shell had a single trailing atmospheric halo `rgba(228,140,55,0.08)` mixed into an otherwise depth-bar-compliant 7-layer shadow stack; rewriting the stack risked regressing the locked depth grammar. L984 mobile "Double-tap for full map" pill had only a 2-layer thin shadow (`inset 0 1px 0 rgba(228,175,100,0.22), 0 2px 12px rgba(2,6,23,0.34)`) — both forbidden-register and structurally below the depth bar. Additionally, `mapSurfaceTheme.ts` L99 contained literal forbidden-register tokens inside a documentation comment, which kept tripping branch-aware grep audits as false positives.
- **Status:** RESOLVED 2026-05-03 (this commit). Three surgical edits:
  1. `HeroSection.tsx:593` — one-token swap `rgba(228,140,55,0.08)` → `rgba(196,130,45,0.08)`. Surrounding 7-layer stack preserved (already depth-bar compliant: cool blue ring, gold inset bevel, bronze inset rim, 2-layer black drop, cool blue grounding glow).
  2. `HeroSection.tsx:984` — full close-and-lift to 6-layer dark depth bar: gold lamp top bevel `rgba(196,144,65,0.22)` + bronze rim `rgba(140,82,22,0.22)` + cool blue 1px ring `rgba(96,165,250,0.18)` + close black drop `0 16px 32px rgba(2,6,23,0.30)` + far black drop `0 4px 12px rgba(2,6,23,0.22)` + bronze atmospheric halo `0 0 60px rgba(196,130,45,0.12)`. Mobile hero map premium framing now matches the desktop treatment.
  3. `mapSurfaceTheme.ts:99` — comment-block literal forbidden tokens replaced with `(legacy register, replaced by KI-066)` phrase. Audit grep no longer false-positives on documentation comments.
- **Result:** Branch-aware grep across `src/styles/theme.css` + `src/app/components/` + `src/app/` returns ZERO forbidden-register hits (combined with KI-066d theme.css audit closure). Codebase reached 100% LAW palette compliance. Skill: `bd-design-identity`.

### KI-072: Gagged shadows between dashboard panels on customer home screen

- **Impact:** With the 6-criteria dark depth bar fully bound across `.bd-dashboard-panel` (gold lamp top bevel + bronze rim + cool blue ring + 2-layer black drop + bronze atmospheric halo at `0 0 60px`/`0 0 110px`), stacking adjacent panels at `gap-3.5 md:gap-5` (~14px / 20px) caused atmospheric halos and far-drop shadows from sibling panels to visually collide. Bronze halos overlapped, far-drop layers stacked into muddy bands, and the surface read as "gagged" — boxy, contiguous, and lacking the breathing room a premium glass system needs.
- **Location:** Root cause: `src/app/components/codelayer/HomeScreen.tsx:137` (the only top-level panel-stacking grid in the customer dashboard) + `src/styles/theme.css` dark token block L2462-2474 (`--bd-dashboard-panel-shadow`) + L2480-2485 (`--bd-dashboard-section-shadow`) + light token block L2530-2535 (`--bd-dashboard-panel-shadow`).
- **Fix direction:** Three coordinated edits in one commit — gap bump on the root stacking grid + far-drop softening on dark/light panel + section shadow tokens + asymmetric downward bronze halo bias on `.bd-dashboard-panel` only (sections sit inside panels, not as the stack; light mode stays cool-shadow-on-cream and skips the warm bias).
- **Status:** RESOLVED 2026-05-03. Three edits:
  1. `HomeScreen.tsx:137` — `gap-3.5 md:gap-5` → `gap-5 md:gap-7`. Mobile 20px / desktop 28px breathing room. Top-level stacking grid only — sibling grids (item-level, popovers, secondary cards) untouched.
  2. `theme.css` dark `--bd-dashboard-panel-shadow`: far-drop softened (`0 32px 80px rgba(2,6,23,0.46)` → `0 22px 56px rgba(2,6,23,0.36)`; `0 12px 24px rgba(2,6,23,0.30)` → `0 8px 18px rgba(2,6,23,0.24)`) + appended asymmetric downward bronze halo `0 24px 60px rgba(196,130,45,0.10)` so glow biases below the panel. Symmetric atmospheric halos (`0 0 60px` / `0 0 110px`) preserved for ambient lift.
  3. `theme.css` dark `--bd-dashboard-section-shadow`: same direction, smaller (`0 22px 56px` → `0 16px 40px`; `0 8px 18px` → `0 6px 14px`). NO asymmetric bias — sections sit inside panels, not as the stacking surface.
  4. `theme.css` light `--bd-dashboard-panel-shadow`: cool-shadow softened (`0 26px 56px rgba(15,30,60,0.22)` → `0 18px 42px rgba(15,30,60,0.22)`; `0 56px 110px rgba(15,30,60,0.10)` → `0 36px 80px rgba(15,30,60,0.10)`). NO bias addition in light — cool-shadow-on-cream is the light mode grounding language; warm bronze bias would disturb it.
- **Result:** Adjacent panels now read as separate floating glass plates with ambient space between them, not as stacked shingles. Asymmetric downward bronze bias on dark panels reinforces the "lamp from above" lighting convention (light hits the top, glow falls below). Skill: `bd-design-identity`.

### KI-073: Dashboard atmospheric gold glow underweight in dark mode + landing page lacks gold lamp lighting entirely

- **Impact:** Owner directive: "needs more atmospheric glow with premium gold in dashboard, more shadow + 3D + layering." Pre-Bucket-7 dashboard atmosphere had three gold gutter washes (D6 left at 0.18α dark, D6 right at 0.15α dark, D7 bottom at 0.13α dark) but no top corner lamps and no bronze floor wash, so the room read as cool blue with subtle warm rails — insufficient premium gold lamp lighting per owner directive. Landing page atmosphere had ZERO gold layers — just a single dark base radial. Owner directive: "bring dashboard's premium look to landing while keeping landing's eye-catching richer colors." Both surfaces needed amplified gold lamp lighting that lights the SPACE between panels rather than painting any panel itself.
- **Location:** `src/app/components/app/DashboardAtmosphere.tsx` (existing 3 gold gutters at L94-127); `src/app/components/app/LandingPageLayout.tsx` (no gold layers, just inline base radial at L68-70).
- **Fix direction:** Amplify (alphas + new radials), do NOT restructure. Add top-left + top-right corner lamps + bronze floor wash to dashboard. Add a parallel-but-restrained gold lamp stack (2 corners + 2 gutters + 1 bottom = 5 layers) to landing, using lower alphas so landing's richer hero gradients stay theatrical.
- **Status:** RESOLVED 2026-05-03. Two-file commit:
  1. `DashboardAtmosphere.tsx` — added three NEW dark-mode-prominent layers BEFORE existing gold gutters (so they sit deeper under the panel stack):
     - **D8 top-left corner gold lamp**: `radial-gradient(ellipse 42% 32% at 8% 0%, rgba(196,144,65,0.22), transparent 60%)` dark / `0.06α` light ghost.
     - **D9 top-right corner gold lamp**: `rgba(196,144,65,0.16) at 92% 0%` dark (asymmetric weaker than D8 — single ceiling lamp source biased upper-left), `0.04α` light.
     - **D10 bronze floor wash**: `linear-gradient(180deg, transparent 70%, rgba(196,130,45,0.10) 100%)` dark only — light dashboard floor stays cool blue-cream per LAW.
     - Existing D6 left / D6 right / D7 bottom dark alphas amplified +0.04 each (0.18→0.22, 0.15→0.19, 0.13→0.17). Light alphas untouched (light is "close to perfect" per owner directive).
  2. `LandingPageLayout.tsx` — added FIVE new fixed full-screen gold layers as first children inside the wrapper div (paint between wrapper bg and page content):
     - **L1 top-left corner lamp**: `0.18α` dark / `0.05α` light
     - **L2 top-right corner lamp**: `0.13α` dark / `0.04α` light
     - **L3 left gutter wash**: `0.15α` dark / `0.08α` light
     - **L4 right gutter wash**: `0.12α` dark / `0.07α` light
     - **L5 bottom wash**: `0.10α` dark / `0.06α` light
     - All alphas slightly lower than dashboard equivalents because landing's hero gradients carry more decorative color; over-amplifying gold would mute the hero's eye-catching role per owner directive.
- **Result:** Dashboard dark mode now reads as a lit room with premium ceiling-lamp asymmetric gold from upper-left + bronze floor. Landing dark mode picks up parallel premium lamp lighting while preserving its richer hero color story. Cohesion across landing + dashboard: shared gold lamp grammar, distinct surface character. Light mode: subtle ghost of the same grammar for dashboard, restrained for landing — no over-cream regression. Skill: `bd-design-identity`.

### KI-074: Map widgets + hero map + map controls lacked premium glass redesign treatment

- **Impact:** Owner directive: "map design gets significant redesign and gets premium treatment since it is the future on both landing page and dashboard." Pre-Bucket-1.3/5.6/5.7/5.8/5.9 map surfaces felt "punched into" their containers — flat seams between panel chrome and live map canvases, no premium ambient lighting on the map preview surface itself, hero maps lacked dual-source lighting beyond their existing single-axis bloom, MapSurfaceControls were disconnected pills rather than a unified control unit, and no curved-glass edge sheen made the maps read as "glass containing a lit map" rather than tile-rectangles. Owner wanted map elevated from "polish" to "redesign" — these gaps were the sum of that.
- **Location:** `src/app/components/dashboard/CustomerMapWidget.tsx`, `src/app/components/dashboard/ShopMapWidget.tsx`, `src/app/components/dashboard/InsurerMapWidget.tsx`, `src/app/components/landing/HeroSection.tsx` (mobile + desktop hero map invocations), `src/app/components/maps/MapSurfaceControls.tsx`, `src/styles/theme.css` (new `.bd-map-canvas-sheen` utility).
- **Status:** RESOLVED 2026-05-03 across 5 sub-bucket commits:
  - **Bucket 1.3 (commit `f3cbb342`)** — inner-glass bezel ring on all three role map widgets. CustomerMapWidget gets the strongest treatment (cool blue 0.18α), Shop/Insurer slightly softer (0.16α). Cool blue ring works in both light + dark — no per-mode branching needed.
  - **Bucket 5.6 (commit `d92698fa`)** — CustomerMapWidget top ambient gold lamp overlay. 6% lamp gold tint at the top edge of the map preview, fades to transparent at h-12 (~22% of map height). Pointer-events-none. Locks the map preview into the dashboard's "lit room" feel.
  - **Bucket 5.7 (commit `a4153034`)** — hero map dual-source counter-glow on both mobile + desktop hero invocations. Cool blue sky catch at top-left + warm bronze lamp catch at bottom-right. Single CSS background-image with two radial sources for efficiency.
  - **Bucket 5.8 (commit `997bbaae`)** — MapSurfaceControls premium capsule rail wrapping all controls (segmented Map/Night/Satellite + Focus/Overview/Expand). Per-tone tuning: dark navy + cool blue ring + bronze atmospheric halo; light cream-tint + bronze ring + bronze halo. backdrop-blur-md on both. flex-wrap retained for narrow viewport fallback.
  - **Bucket 5.9 (this commit)** — `.bd-map-canvas-sheen` utility added to `theme.css`. Cream top catchlight (0.14α) + bronze bottom rim (0.16α). Inherits parent border-radius. Applied to all three role map widgets as a sibling div inside the bezel ring wrapper. Mode-agnostic — works against light + dark map tiles equally.
- **Result:** Map surfaces now read as premium glass containing a lit map across landing + dashboard. The shared map family signature is: bezel ring (Bucket 1.3) + ambient gold lamp overlay (5.6 dashboard / 5.7 hero dual-source) + canvas edge sheen (5.9). Map controls grouped into one premium capsule rail (5.8). Cohesion across landing + dashboard + map per owner directive; distinct character preserved via per-surface alpha tuning. Premium gold expressed via lighting (lamp overlays, sky-catch, bronze rim) — never via paint on the map canvas itself. Skill: `bd-design-identity`. Sub-commits: `f3cbb342`, `d92698fa`, `a4153034`, `997bbaae`, this commit.

### KI-075: Future navigation engine + map functional buildout (DEFERRED)

- **Impact:** The 2026-05-03 cloud autopilot master pass closed the visual / depth-bar layer across navigation + map surfaces (KI-066/069/072/073/074). The functional layer behind those surfaces is partial: turn-by-turn routing engine not connected, voice TTS not implemented, deviation detection is stub, saved places use localStorage instead of Supabase, no real-time partner-shop availability on map markers, per-role map layer activation rules are not defined. Owner directive ("note to fully build out navigation and all other functionality in the future. Focus on design for now") explicitly defers this scope.
- **Status:** **DEFERRED** — see [`docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md`](PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md) for the full plan: scaffolding inventory (Section 1), provider tiers + geocoder + saved-places + per-role layers (Section 2), sequencing + load-bearing skills (Section 3), and the four trigger conditions that must ALL be true before this scope moves from PLAN to LAW (Section 4).
- **Trigger to activate:** owner-driven greenlight + design phase declared complete + provider decision made + no conflicting LAW changes. No AI may pull items off this plan without all four conditions firing. The plan doc spells out the dependency graph so future passes don't accidentally land in the middle of nav-engine work during a design pass.
- **Result (this commit):** Plan doc created at `docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md`, indexed in `docs/README.md`, KI-075 logged with explicit DEFERRED status. Closes Bucket 9 of the cloud autopilot master pass.

### KI-076: Dashboard pages scroll past content into empty atmospheric background + page-end shadow halo termination feels abrupt

- **Impact:** Owner-flagged: "most dashboard pages scroll too far — have all pages end closer to where content ends instead of being able to scroll way past content and just only seeing dashboard background." User-visible on every customer dashboard view (Home, Bids, Account). Two-fold cause: (1) `HomeScreen.tsx:135` carried `min-h-[80vh]` which forced the screen to fill 80% of viewport even when content was shorter, creating a viewport-floor of empty atmospheric background below the last panel; (2) `pb-20 md:pb-10` on each role screen wrapper duplicated `<main>`'s `pb-24 md:pb-8` bottom-nav clearance, adding ~80-100px of empty space below the last panel before the bottom nav. Combined, users could scroll well past the last card and see only DashboardAtmosphere — reads as "broken page, more should be here." Same padding reduction also addresses the page-end halo termination — the last panel's `0 0 60-110px` bronze atmospheric halo from the 8-criteria depth bar can now render without being masked by excessive empty padding.
- **Location:** `src/app/components/codelayer/HomeScreen.tsx:135`, `src/app/components/codelayer/BidsScreen.tsx:220`, `src/app/components/codelayer/AccountScreen.tsx:303`. Sub-step `src/app/components/codelayer/report/StepPhotos.tsx:40` carries the same `min-h-[80vh]` pattern but is part of the report-flow Step 5 — deferred to a follow-up audit since it's a sub-step inside Report flow rather than a top-level role screen.
- **Status:** RESOLVED 2026-05-04 (Pass 1 of 2026-05-04 mobile + dark autopilot). Three coordinated edits, single commit:
  1. `HomeScreen.tsx:135` — removed `min-h-[80vh]`, changed `pb-20 md:pb-10` → `pb-6 md:pb-8`. Customer dashboard home now sizes to actual content + 24/32px breathing space above the bottom-nav clearance handled by `<main pb-24 md:pb-8>`.
  2. `BidsScreen.tsx:220` — `pb-20` → `pb-6 md:pb-8`. Bids list page no longer scrolls past content.
  3. `AccountScreen.tsx:303` — `pb-20` → `pb-6 md:pb-8`. Account hub page no longer scrolls past content.
- **Result:** Adjacent dashboard pages now end cleanly at last-panel + ~24-32px breathing space + bottom-nav clearance. The last panel's bronze atmospheric halo from the depth bar now has room to render and tapers naturally into the DashboardAtmosphere instead of getting chopped at the scroll boundary. No content cut off behind the bottom nav. Verified at `npx tsc --noEmit` clean + `npm run build` clean. Skill: `bd-design-identity`.
- **Follow-up (deferred, low priority):** `StepPhotos.tsx:40` carries the same `min-h-[80vh]` pattern. It's a Step 5 sub-component of the report flow, not a top-level role screen. Audit + fix in a future pass if owner reports the same scroll-past behavior on Step 5 specifically. Bottom nav clearance via `<main pb-24>` already handles the safe-area concern.

### KI-077: Dark dashboard panels + sections read flat compared to light mode's warm cream richness

- **Impact:** Owner directive: "more premium in dark mode" + "premium gold with metallic trims and the liquid glass look." Pre-Pass-2 dark dashboard panels carried the 8-criteria depth bar (gold lamp top bevel + bronze rim + cool blue ring + 2-layer black drop + bronze atmospheric halo + edge catchlights + cool blue ring + body) but the panel BODY itself was a flat navy gradient. The DashboardAtmosphere D8/D9 corner lamps from Bucket 7 sit BEHIND the panels in the viewport, so the panels themselves still read as deep navy blocks rather than as a "lit room with warm cream richness" matching light mode's gorgeous baseline. Sibling cool-toned sections (report cards stacked vertically) felt especially flat at 375px mobile width because the existing 0.08/0.05 edge catchlights were below visibility threshold at narrow widths.
- **Location:** `src/styles/theme.css` dark token block — `--bd-dashboard-panel-bg`, `--bd-dashboard-panel-shadow`, `--bd-dashboard-section-bg`, `--bd-dashboard-section-shadow`. Cause: the body tokens were pure linear gradients with no internal radial; the shadow stacks had top inset bevel and atmospheric halo alphas tuned for desktop visibility but not narrow mobile widths.
- **Fix direction:** Layer an internal top-edge ceiling lamp radial INTO the body token (before the existing linear gradient) so the panel itself reads as lit-from-above. Bump top inset bevel alpha. Bump atmospheric halo alphas on sections (cool-toned cards need more lift). Bump edge catchlights on sections (narrow widths swallow low alphas). Premium gold via lighting only — never paint. No cream over-application.
- **Status:** RESOLVED 2026-05-04 (Pass 2 of 2026-05-04 mobile + dark autopilot). Four coordinated edits, single commit:
  1. `--bd-dashboard-panel-bg` (dark): added `radial-gradient(ellipse 70% 30% at 50% 0%, rgba(196,144,65,0.14), transparent 70%)` layer ABOVE the existing navy linear gradient. Internal ceiling lamp gives the panel body its own lit-from-above warmth without painting cream.
  2. `--bd-dashboard-panel-shadow` (dark): top inset bevel pushed `rgba(196,144,65,0.22)` → `rgba(196,144,65,0.30)`. Gold lamp trim now matches light mode's cream lift presence in dark.
  3. `--bd-dashboard-section-bg` (dark): added narrower internal ceiling lamp `radial-gradient(ellipse 60% 25% at 50% 0%, rgba(196,144,65,0.10), transparent 70%)` so cool-toned report cards stacked vertically still feel lit. Lower alpha than panels (0.10 vs 0.14) because sections nest inside panels.
  4. `--bd-dashboard-section-shadow` (dark): atmospheric halos bumped (`rgba(196,130,45,0.12)` → `0.15`, `rgba(196,130,45,0.06)` → `0.08`); edge catchlights bumped (`rgba(252,240,208,0.08)` → `0.10`, `rgba(252,240,208,0.05)` → `0.07`). All bumps within hard stops (single-layer halo cap 0.22 not breached; cream catchlights well below the 0.95 LAW whitening threshold).
- **Result:** Dark dashboard panels now read as their own lit room — internal ceiling lamp gives the panel body warmth that previously only DashboardAtmosphere provided. Cool-toned sibling sections (report cards) stay visually distinct but no longer feel dimmer than the panels containing them. The 8-criteria depth bar still binds; this commit ADDS to the body token without modifying any criterion. Light mode unaffected (only dark tokens edited). Verified `npx tsc --noEmit` clean + `npm run build` clean + branch-aware grep ZERO forbidden hits. Skill: `bd-design-identity`.
