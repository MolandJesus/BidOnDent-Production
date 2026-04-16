# BidOnDent — Known Issues (REFERENCE)

**Authority level:** REFERENCE — describes current known gaps, bugs, and structural issues.

**Last updated:** 2026-04-16

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
- **Current reality:** Rate limiting works for honest clients. Trivially bypassable by any client that varies the query param.
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
- **Location:** [useNavigation.ts](../src/app/hooks/useNavigation.ts) (enableDemoMode/exitDemoMode), [buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts) (demoMode conditionals), [DashboardRouter.tsx](../src/app/routers/DashboardRouter.tsx), [HomeScreen.tsx](../src/app/components/codelayer/HomeScreen.tsx).
- **Current reality:** Demo mode is accessible from normal navigation (onEnterDemoMode callback). Hardening Plan Phase 4A.1 specifies gating behind URL param.
- **Fix direction:** Per Hardening Plan Group 3a.
- **Status:** Open — P2 (tracked in Hardening Plan Phase 4A.1)

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
