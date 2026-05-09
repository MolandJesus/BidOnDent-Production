# BidOnDent — Known Issues (REFERENCE)

**Authority level:** REFERENCE — describes current known gaps, bugs, and structural issues.

**Last updated:** 2026-05-07 (External audit AI passes 4-5 — 7 more KIs added: KI-138 notification_preferences table missing (P1, ROOT CAUSE confirmed via Supabase MCP — `notification_preferences` table does not exist in production; edge handler 500s on every call), KI-139 reduced-motion CSS coverage gap (40 keyframes vs 23 guards; P2), KI-140 mobile map legend density (P2), KI-141 mobile header missing title (P3), KI-142 mobile Quick Actions discoverability (P3), KI-143 "Offline · last known" pill verification (P3), KI-144 Supabase advisor lint cluster (13 security + 198 perf; P3-batched). **KI-101 RESOLVED** — audit AI applied SQL fix via Supabase MCP under owner fix-authority; planner verified independently via Supabase MCP query. **KI-118 expanded scope** — confirmed sheet-pattern-class issue, single `useEscapeToClose` hook fix. **KI-126 re-scoped** — desktop two-column-grid empty-state only; mobile single-column unaffected. Earlier today: KIs 116/117/122/123/124/125/126/127 (passes 1-2), 128/129/130/131/132/133 (pass 3), 134/135/136/137 (post-pass-3). Numbering jump 118 → 122 to avoid collision with archived KIs 119/120/121. **Pass 55** archived 70 RESOLVED/WONTFIX entries; **Pass 53** added KI-075 description correction; **Pass 54** fixed reroute confirm-timing bug.)

**Update rules:**

- Add new issues as discovered. Use next available ID.
- When fixed, mark `Status: RESOLVED (date)` — do not delete.
- Periodically prune RESOLVED entries to `docs/archive/RESOLVED_KIS_<DATE>.md` (most recent: Pass 55, 2026-05-07).

---

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

---

## Product / Workflow Gaps

### KI-030: Insurer role is a thin stub

- **Impact:** The insurer role has screens (`InsurerClaimsScreen`, `InsurerPartnerShopsScreen`) but no real claims data model. "Claims" are just damage reports. Claim approval/denial patches `damage_reports` directly. No policy verification, no adjuster workflow, no claims table.
- **Location:** [InsurerClaimsScreen](../src/app/components/insurer/InsurerClaimsScreen.tsx), [updateClaimDecision](../src/app/services/supabase/reports.ts).
- **Current reality:** Insurer can view all marketplace reports and "approve/deny" them by patching report fields. This is a demo-grade implementation.
- **Fix direction:** Defer real insurer investment until a real insurer signs up. Current stub is acceptable for soft launch if expectations are managed. Do not invest further.
- **Status:** Open — P3 (acknowledged, not blocking)

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

### KI-045: Navigation session cloud sync depends on missing backend schema in the connected environment

- **Impact:** Authenticated dashboard loads could emit `500` noise from `/functions/v1/server/navigation-session`, and navigation session cross-device continuity is unavailable while the connected Supabase environment lacks `public.navigation_sessions`.
- **Current reality:** Live edge verification returned `{"error":"Could not find the table 'public.navigation_sessions' in the schema cache"}`. The client is now hardened to detect that specific failure, clear pending retries, and temporarily fall back to local session storage instead of repeatedly calling the broken cloud path.
- **Fix direction:** Restore schema parity in the connected Supabase environment by deploying the `navigation_sessions` table. The client-side cooldown is a mitigation only; true cross-device sync resumes when the backend table exists.
- **Validation:** After the hardening patch, a clean dashboard reload on a fresh page showed the normal edge hydration requests returning `200` and no `navigation-session` requests during the cooldown window.
- **Status:** MITIGATED (2026-04-17) — runtime noise suppressed client-side; backend schema drift still exists.

### KI-053: Map performance budget overruns on landing/fullscreen map

- **Impact:** During the 2026-04-26 audit, `mapPerformance.ts` repeatedly logged pan/zoom samples exceeding the configured budgets (observed: 502ms, 520ms, 543ms, with one 2096ms burst against 380ms / 450ms budgets). The instrumentation already exists; the budgets are being missed. Performance impact on map-first UX, especially on lower-end devices.
- **Location:** Instrumentation in [src/app/services/navigation/mapPerformance.ts](../src/app/services/navigation/mapPerformance.ts). Triggered during landing-page map and fullscreen `CoverageMapDialog.tsx` interactions.
- **Current reality:** Detected during the 2026-04-26 local audit pass. Observability is in place — no data-collection work needed. The data shows the budgets are not being met today.
- **Pass 48 re-frame (2026-05-07, commit `7fb190a2`):** Profiled the originally-suspected surface (`CoverageMapDialog`) and the landing inline coverage map under identical pan/zoom/hover load. Result: dialog showed **0 ms** long-task burden on both viewports. The actual hot surface is the **landing inline coverage map** (687 ms @ 1280, 897 ms @ 375), where co-mounted landing-page chrome (parallax / scroll / hero / GPS hooks) competes with MapLibre's render loop on the main thread. Top contributors are V8 internals (4× `InvokeApiInterruptCallback` bursts at 166-171 ms) and MapLibre internals — both provider-side hard stops. Mobile additionally shows `V8.GC_MC_BACKGROUND_MARKING` in the top-10 (memory pressure on 375). Full evidence: [`docs/evidence/pass-48-2026-05-07/PERF_ANALYSIS.md`](evidence/pass-48-2026-05-07/PERF_ANALYSIS.md). Marker-render and route-geometry suspects retired; the cheap-win sequence F.1-F.5 documented there.
- **Pass 49 partial fix (2026-05-07):** F.1 implemented — landing inline `<ServiceCoverageMap>` is now lazy-mounted behind an `IntersectionObserver` (`rootMargin: "200px"`) inside `OperatingRegionsSection.tsx`. Same-height `aria-hidden` placeholder until intersection. **When the user does not scroll to the map, MapLibre never executes** — confirmed by trace (post-trace `mapMounted: false` assertion + `maplibre-gl.js` absent from top-10 URLs in noscroll trace; present at 197.5 ms in scrolled trace). Map cost is preserved when needed (scrolled 1280: 670 ms vs Pass 48 baseline 687 ms — within noise, expected). Full analysis: [`docs/evidence/pass-49-2026-05-07/PERF_ANALYSIS_AFTER.md`](evidence/pass-49-2026-05-07/PERF_ANALYSIS_AFTER.md).
- **Pass 85 partial fix (2026-05-07):** F.2 closed. [`useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts) was already RAF-throttled + passive-listener + reduced-motion gated; remaining waste was sub-pixel re-renders. Hook now quantizes to integer pixels and bails the `setOffset` when the new value matches the previous, eliminating React re-renders during sub-pixel scroll deltas in HeroSection + OperatingRegionsSection (the two parallax consumers on the landing surface).
- **Pass 86 partial fix (2026-05-07):** F.3 closed. Repo-wide audit of `addEventListener("scroll" | "wheel" | "touch*")` returned only two scroll listeners — `useParallaxOffset` (already `{ passive: true }` per Pass 49) and [`LandingPageHeader.tsx`](../src/app/components/landing/LandingPageHeader.tsx) (header shadow toggle). The header listener is now also `{ passive: true }` since it never calls `preventDefault`. No `wheel`/`touch*` listeners exist on the landing surface.
- **Remaining work:** F.4 (defer/idle GPS speed-limit init off the landing render path), F.5 (provider-side investigation — out of pre-launch scope). Each scoped as a separate pass.
- **Status:** PARTIAL RESOLUTION (2026-05-07, Passes 49 + 85 + 86) — F.1 + F.2 + F.3 shipped; F.4-F.5 still open. P4 (polish; no functional regression).

### KI-060: Two legacy edge functions still deployed and unused

- **Impact:** `make-server-9f243523` (v70) and `make-server-85e96b22` (v2) remain ACTIVE on `wmdcnjgtsppftrofaqqa` but no current code path calls them. They consume no compute when idle but add log/dashboard noise and confuse new contributors.
- **Location:** Edge function listing for project `wmdcnjgtsppftrofaqqa`. Frontend code calls only `/server/<route>`.
- **Fix direction:** Verify zero traffic to either via `get_logs`. Delete via Dashboard → Edge Functions → three-dot → Delete. `make-server-9f243523` is referenced in `SUPABASE_SETUP_GUIDE.md` §13 as a "legacy alias for compatibility" — that note can also be removed when the function is deleted. Tracked as Post-Launch L1 (per the existing roadmap reference in §13).
- **Status:** Open — low priority. Nothing breaks if left in place; deletion is housekeeping.

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

### KI-067: Mobile fullscreen coverage map opens too sheet-first for a map-first product

- **Impact:** Mobile screenshots show the full coverage map experience dominated by the command sheet/panel on open, with the map mostly hidden. That undercuts BidOnDent's map-first identity and makes the fullscreen interaction feel like a form drawer instead of an immersive spatial browser. Some screenshots also suggest close affordance duplication/confusion.
- **Location:** `src/app/components/landing/MobileMapBottomSheet.tsx`, `src/app/components/landing/CoverageMapDialog.tsx`, `src/app/components/landing/CoverageBrowseExperience.tsx`, and `src/app/components/landing/CoverageBrowseSidebarContent.tsx`.
- **Fix direction:** Default mobile fullscreen map to a compact/peek sheet state so the map remains visible, then allow deliberate expansion. Preserve the owner-approved double-tap/double-click gate from the hero map. Keep one obvious close path, protect bottom safe-area spacing, and verify Search/Explore/Saved/Shops modes in light and dark.
- **Status:** Partial — softer pattern shipped 2026-05-03 (commit `fc4b5c56`): NotificationCenter and ProfileDropdown popovers now anchor near the bottom of the viewport on mobile (with safe-area padding) and carry a bronze/gold drag-handle bar at the top — visual reachability fix without committing to full sheet conversion. The full map dialog bottom-sheet height reshape itself remains deferred (HOLD per relay — Codex territory; needs explicit owner approval before reshape).

### KI-075: Future navigation engine + map functional buildout (ACTIVE — UNLOCKED 2026-05-07; engine inventory corrected 2026-05-07 Pass 53)

- **Impact:** The 2026-05-03 cloud autopilot master pass closed the visual / depth-bar layer across navigation + map surfaces (KI-066/069/072/073/074). Originally logged as "turn-by-turn routing engine not connected, voice TTS not implemented, deviation detection is stub, saved places use localStorage instead of Supabase, no real-time partner-shop availability on map markers, per-role map layer activation rules are not defined." **Pass 53 audit (2026-05-07) corrected this inventory** — see [`docs/evidence/pass-53-2026-05-07/ENGINE_AUDIT.md`](evidence/pass-53-2026-05-07/ENGINE_AUDIT.md) for the full trace. **Actual current state:**
  - Turn-by-turn routing engine: **WIRED** (`useNavigationRoutePreview.ts:240-298` advances `currentStepIndex` on adaptive GPS proximity; off-route auto-refetch at ~100 m).
  - Voice TTS: **WIRED** (Web Speech API via `voiceGuidance.ts`; step cues at `useNavigationRoutePreview.ts:268-272`; deviation/reroute alerts via `useNavigationVoiceAlerts.ts`; cross-browser priming via `primeVoiceEngine`).
  - Deviation detection: **WIRED** (`detectDeviation.ts` with GPS jitter guard; snapshot ingest in `useNavigationLifecycleEffects.ts:51-78`; ring-buffer history in `useNavigationIntelligence.ts`).
  - Reroute lifecycle: **WIRED** (`useNavigationReroute.ts` full FSM idle→eligible→pending→completed→cooldown; auto + manual paths; UI prompt via `NavigationDeviationPrompt`; toast via `useNavigationToastBridge`).
  - Session lifecycle + cloud sync: **WIRED** (`useNavigationSession.ts` FSM with Supabase `fetchNavigationSession` / `saveNavigationSessionToCloud`).
  - Animation contract: **HONORED** (CSS-first via `theme.css:554-625`; `prefers-reduced-motion` reset at `theme.css:689`; zero `framer-motion` in nav surfaces).
  - **Real outstanding gaps:** (a) `handleReviewRoute` (`useShopDirectoryNavigation.ts:405`) confirms reroute cooldown synchronously before the OSRM refetch resolves — minor timing bug, low severity. (b) Saved places persist to **localStorage only** (`useSavedNavigationLocations.ts:1-16` → `services/navigation/savedLocations`); cloud schema missing. (c) Real-time partner-shop availability not wired (no Supabase channel for shop availability). (d) Per-role map layer activation rules not defined. (e) Animation cross-reference vs LAW's 29 canonical keyframes deferred to Pass 57. (f) Architectural duplication: two off-route paths exist (silent ~100 m auto-refetch in `useNavigationRoutePreview` + threshold-gated UI prompt in `useNavigationReroute`) — implicit, no user-visible bug.
  - Originally deferred 2026-05-04 per owner directive ("note to fully build out navigation and all other functionality in the future. Focus on design for now"). Owner reversed that defer 2026-05-07 (see Trigger assertion below).
- **Status:** **ACTIVE** as of 2026-05-07. Originally **DEFERRED** 2026-05-04 — original plan doc archived (Phase 1.5d, Cluster C). Content preserved at [`docs/archive/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY_archived_2026-05-04.md`](archive/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY_archived_2026-05-04.md): scaffolding inventory (Section 1), provider tiers + geocoder + saved-places + per-role layers (Section 2), sequencing + load-bearing skills (Section 3), and the four trigger conditions that must ALL be true before this scope moves from PLAN to LAW (Section 4). Active map strategy lives in [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md).
- **Trigger to activate:** owner-driven greenlight + design phase declared complete + provider decision made + no conflicting LAW changes. No AI may pull items off this plan without all four conditions firing. The plan doc spells out the dependency graph so future passes don't accidentally land in the middle of nav-engine work during a design pass.
- **Trigger assertion (2026-05-07, owner authority chain in conversation transcript):**
  1. **Owner-driven greenlight:** ✓ Asserted by Mola via planner-AI relay 2026-05-07 ("no you do the 'state the 4 KI-075 unlock triggers' auto pilot run while builder ai does map work").
  2. **Design phase declared complete:** ✓ Asserted. KI-066/069/072/073/074 closed the visual / depth-bar layer 2026-05-03; subsequent Pass 884-888 work tightened map chrome continuity across the seven user-visible map states; MOLANDJESUS_DESIGN_DECISIONS.md is locked apex canon.
  3. **Provider decision made:** ✓ Asserted. Stack locked to MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (rendering) + OSRM public (routing) + Nominatim via shared Supabase edge proxy `/geocode/search` (geocoding) + Overpass (speed limits) per `PLAN_MAP_MASTER.md` Future Theme C. No commercial provider migration is approved.
  4. **No conflicting LAW changes:** ✓ Asserted. The PLAN_MAP_MASTER hardening pause notice is doc-tier guidance, not LAW. The actual LAW docs (LAW_PROJECT_RULES, LAW_LAYERED_ARCHITECTURE, LAW_ANIMATION_AND_ATMOSPHERE, LAW_HARDENING_PLAN) do not bar KI-075 functional work. PLAN_MAP_MASTER.md hardening notice cross-references this KI in the same pass for traceability.
- **Scope under unlock (containment-over-expansion still applies):** This KI does not authorize a single mega-pass. Each functional buildout item ships as its own surgical pass with its own LAW check. Builder may pull one KI-075 item per pass plus hardening-safe polish; multi-item passes require explicit per-pass owner approval. Provider migrations, voice library additions, and schema migrations remain bounded by `supabase-clerk-edge-function` + `supabase-storage-signed-urls` + `feedback_supabase_cli_pg17` rules.
- **Result (this commit):** Plan doc created at `docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md`, indexed in `docs/README.md`, KI-075 logged with explicit DEFERRED status. Closes Bucket 9 of the cloud autopilot master pass.

### KI-100: F-24 follow-up — full Supabase swap for `buildShopRecommendations` (P3-DEAD-CODE-MOSTLY, scope corrected)

- **Impact (corrected 2026-05-08, Pass 17 audit AI):** the original "20+ consumers" framing was wildly inflated. Independent grep + co-worker AI Pass 15 sweep both confirmed:
  - `getShopDirectory`: ZERO production consumers — REMOVED Pass 17 (was thin wrapper around `SHOPS`).
  - `buildShopRecommendations`: ZERO production consumers in `src/app/components/`. Only consumers are 4 references in `marketIntelligence.test.ts` (the function's own tests). The function reads `SHOPS` from `marketSeedShops.ts` and returns recommendations, but no React component or hook actually invokes it.
- **Revised scope:** the F-24 follow-on is now ~3 files at most (the helpers themselves + their tests + the `SHOPS` seed file), not the 20+ files originally cited. Either:
  1. Wire `buildShopRecommendations` into a real consumer (the test surface suggests it was intended for a shop-directory list/grid that never landed) — at which point the Supabase swap becomes meaningful.
  2. Confirm the function is permanently abandoned and remove it alongside `SHOPS` and the test file (cascading dead-code removal — net file deletion of `marketIntelligence.ts`'s recommendation half).
- **Original fix direction (preserved for reference, but scope-inflated):** Convert `buildShopRecommendations()` to async, returning a Promise. Replace `SHOPS.filter(...)` with a Supabase query against `public_partner_shops` (already exists per migration 20251230000001 §3.13 + populated via shop signup flow). Add empty-state UI. Flip `SHOP_DIRECTORY_IS_PREVIEW` to `false` once the real-data path resolves. Remove `<PreviewDirectoryNotice />` from surfaces once flag is false.
- **Status:** **OPEN — DOWNGRADED P2-DATA → P3-DEAD-CODE-MOSTLY 2026-05-08 (Pass 17 audit AI).** The Supabase-swap work is contingent on first deciding whether `buildShopRecommendations` has a future. If yes (path 1), it becomes a 3-5 file refactor (not 20+). If no (path 2), it becomes dead-code removal of ~80 LoC. Either path is a single-pass janitor task. Owner directive 2026-05-05 authorization stands; explicit second authorization no longer required for the corrected scope.
- **Pass 17 cleanup landed:** `getShopDirectory()` removed (3 lines), `nyMetroTestHubSeed.ts` stubbed (229 lines → 22-line dead-code stub awaiting host-side `rm`).
- **Skill:** `supabase-clerk-edge-function` (any new shop-fetch handler will follow this pattern).

### KI-106: SpeedLimitBadge solid `bg-white` — semantic real-world signage exception (P7-DOCS-ONLY)

- **Impact:** During the 2026-05-05 fresh-eyes audit, the only solid `bg-white` (no alpha) usage left in `src/` outside dev-only files is at [src/app/components/maps/navigation/SpeedLimitBadge.tsx:37](src/app/components/maps/navigation/SpeedLimitBadge.tsx#L37) — an 84×84 circular badge that mimics a US speed-limit road sign. The white IS the design intent (matches real-world driver-recognized signage with red ring + black numerals). Not a panel, not arbitrary surface paint — semantic convention.
- **Location:** [src/app/components/maps/navigation/SpeedLimitBadge.tsx:37](src/app/components/maps/navigation/SpeedLimitBadge.tsx#L37) — `className="...rounded-full border-[6px] border-rose-500 bg-white text-slate-950..."`.
- **Status:** **OPEN — INTENTIONAL EXCEPTION (P7-DOCS-ONLY)**. Documents the exception so future audits don't flag this as a LAW Light-Mode Surface Rule violation. Same exception class as `amber-*` warning chips in `CoverageSearchPanel`/`CoverageActiveNavigationLayout`/`CoverageNearestShopCard` — semantic UI convention, not arbitrary canon surface paint.
- **Fix direction:** No fix needed. If a future design pass wants the badge to feel premium-canon-aligned while still recognizable, options would be:
  - (a) Add a subtle bronze trim ring outside the rose-500 border (preserves real-world recognition + adds canon hint).
  - (b) Shift `bg-white` to `bg-[#fffaf0]` (very subtle warm cream tint — still reads as white but inside canon family). Owner judgment call.
- **Skill:** `bd-design-identity` (semantic exception class).
- **Audit context:** 2026-05-05 fresh-eyes scan also confirmed: ZERO off-canon goldenrod values in landing/shop/dashboard component paint (only HowItWorksSection.tsx:88 has them inside a doc-comment about prior Pass I swap, not actual paint). ZERO fire-and-forget signOut/Promise patterns post-KI-097. ZERO storage hydration gaps — `vehicles.image_url`, `profiles.profile_image_url`, `damage_reports.photo_urls` all properly hydrate via `hydrateSignedStorageUrl(s)` in their respective handlers.

### KI-101: F-01 — "Toyoto" misspelled vehicle make persisted in DB (RESOLVED 2026-05-07)

- **Impact (historical):** The 2021 Toyota Camry vehicle record was saved with `make="Toyoto"`. Propagated to `vehicles` table → Account Vehicles list + Report Step 1 picker, AND `damage_reports.vehicle_make` (denormalized at submit time). Two surfaces, two DB rows.
- **Resolution (2026-05-07):** External audit AI applied the fix directly via Supabase MCP under owner-granted "fix authority" for safe data corrections. Two SQL UPDATEs against project `wmdcnjgtsppftrofaqqa`:
  ```sql
  UPDATE public.vehicles SET make='Toyota' WHERE id='c7260d31-31a4-4dbc-9657-616abc4f4a34';
  UPDATE public.damage_reports SET vehicle_make='Toyota' WHERE vehicle_id='c7260d31-31a4-4dbc-9657-616abc4f4a34';
  ```
  **Planner-AI verified independently 2026-05-07** via Supabase MCP `execute_sql`: `SELECT make FROM vehicles WHERE id='c7260d31...'` now returns `make: "Toyota"`. Audit AI also visually confirmed "2021 Toyota Camry" renders on mobile Report Step 1.
- **Code improvement (deferred):** Add canonical-makes validation in vehicle entry form. Non-trivial — touches report wizard Step 1 + account vehicle entry. Tracked separately if needed.
- **Status:** **RESOLVED 2026-05-07** — both DB rows fixed; verified independently by planner. Move to archive on next docs hygiene pass.
- **Skill:** None — pure data hygiene; safe-fix authority precedent for audit AI.

### KI-102: F-03 — Cat photo as damage report thumbnail (P2-DATA — owner action)

- **Impact:** Audit AI F-03 (P2-DATA, test data quality): the "2014 Mazda Mazda6" damage report (Mar 28, 2026, "Front bumper") displays an orange tabby cat photo as its thumbnail on dashboard "Your Reports" + full map experience popup when the report pin is opened. Owner test upload from development. `ImageWithFallback` renders it correctly — the issue is the data content, not the code. A body shop reviewing incoming customer reports would see a cat photo for a "front bumper" repair request. Undermines professional credibility.
- **Location:** `damage_reports` table row for the Mazda6 record + associated `photo_urls` storage pointer.
- **Fix direction:** **Owner action:** delete the offending photo from Supabase Storage + UPDATE the `damage_reports` row to clear/replace `photo_urls` for this report. OR delete the entire test report row. Per `supabase-storage-signed-urls` skill — storage refs are `storage://<bucket>/<path>` pointers; deletion needs both the storage object removal and the DB row update.
- **Status:** **OPEN** — owner data hygiene action pending.
- **Skill:** `supabase-storage-signed-urls`.

### KI-103: F-14 — `bidondent@gmail.com` in landing footer (P4-UX — owner decision)

- **Impact:** Audit AI F-14 (P4-UX, trust/credibility): the landing page footer displays `bidondent@gmail.com` as the primary contact email. For a professional auto repair marketplace claiming premium brand positioning, a Gmail address signals a pre-launch or hobby project rather than an established business.
- **Location:** [src/app/components/landing/FooterSection.tsx](src/app/components/landing/FooterSection.tsx) (or wherever `bidondent@gmail.com` is hardcoded — confirm via grep).
- **Fix direction:** Replace with domain-based email (e.g., `contact@bidondent.com` or `support@bidondent.com`) before soft-launch customer demos. **Cannot ship unilaterally** — routing emails to a non-existent mailbox is worse than the credibility hit. **Owner decision required:**
  - (a) Owner sets up `contact@bidondent.com` domain mailbox first, then code change replaces the Gmail string. Recommended path.
  - (b) Owner accepts Gmail through soft launch, defers fix until domain mail is provisioned.
  - (c) Owner provides preferred replacement email; code change ships immediately against that.
- **Status:** **OPEN** — owner decision pending.
- **Skill:** None — owner business decision.

### KI-089: Dead storage adapter direct-upload path (architectural observation — no fix needed)

- **Impact:** Phase 0 audit (Section D4) found `src/app/services/storage/SupabaseStorageAdapter.ts:102` direct-upload fallback path uses `getPublicUrl()` — would return a non-functional public URL since LAW says all buckets are private. Production code never calls this path: production uploads go through the edge function via `services/supabase/storage.ts:handleUploadPhoto` which correctly returns `storage://` pointers. The entire `StorageService` + `SupabaseStorageAdapter` direct-upload abstraction layer is dead but harmless.
- **Location:** `src/app/services/storage/SupabaseStorageAdapter.ts`, `src/app/services/storage/StorageService.ts`, `src/app/services/storage/StorageService.test.ts`, `src/app/services/index.ts:85,87` re-exports.
- **Fix direction (deferred):** Removal would touch 3+ files (delete StorageService.ts + SupabaseStorageAdapter.ts + StorageService.test.ts + edit services/index.ts) — exceeds the autopilot hard-stop budget (delete > 3 files in single commit) and risks breaking unknown consumers. Better handled in a dedicated cleanup pass post-launch when the entire `services/storage/` directory can be evaluated.
- **Status:** **OPEN** — DOCUMENT-ONLY (intentional defer per autopilot hard-stop budget). Per Phase 0 audit task #4. Per `supabase-storage-signed-urls` skill (the canonical pattern uses pointers + edge function uploads, which IS the production path; the unused direct-upload abstraction is a pre-launch architectural artifact that doesn't violate the skill — it's just dead code).

### KI-107: HeroSection.tsx is 1,110 lines — exceeds L2 hard limit (P3 reminder)

- **Impact:** [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) is the single largest source file in the codebase. Per [LAW_LAYERED_ARCHITECTURE.md](LAW_LAYERED_ARCHITECTURE.md) the L2 hard limit is 600 lines. HeroSection sits at 1,110 — nearly 2× over. It composes hero copy, sample-quote map preview, stats chips row, CTA dock, and an animated background layer all in one file.
- **Location:** [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx)
- **Why P3 (not OPEN bug):** The file works. There is no live regression. Refactoring it requires owner naming because the extraction seam choice is design-tied (which sub-components should exist, what their boundaries should be). Naming this here makes the future obligation visible without queueing the work.
- **Fix direction (deferred):** Extract candidates: hero copy block, sample-quote map preview component, stats chips row, CTA dock, animated background layer. Target: hero shell ≤300 lines + 4–5 child components ≤200 each. The hero map preview extraction may also be a Phase 6 (landing + dashboard map redesign) target — see [LAW_LAYERED_ARCHITECTURE.md](LAW_LAYERED_ARCHITECTURE.md) "Known existing exceptions" and the v3.3 master plan Phase 6 / Phase 6.5 scope.
- **Status:** **P3 reminder — grandfathered.** Refactor only on owner naming. No autopilot pass should opportunistically split this file as a side-effect of feature work.
- **Related grandfathered exceeds-budget files (also P3):** OperatingRegionsSection.tsx (556), DashboardHeader.tsx (538), App.tsx (528), useOperatingRegionsCoverage.ts (512). Same rule — refactor only on owner naming.

### KI-108: L2 → L4 systemic direct-import pattern across map system (P3, grandfathered)

- **Impact:** ~30 L2 surfaces (components/maps/, components/dashboard/, components/shop/, components/insurer/, components/landing/) import from L4 services directly (`services/supabase/*`, `services/navigation/*`, `services/intelligence/*`), bypassing the L3 orchestration layer that [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) requires. This is architectural drift from the charter, not a runtime bug.
- **Severity:** Architectural drift. **NOT a runtime regression.** Code works. Strongly typed. Refactoring is mechanical, not perilous.
- **Location:** Highest-density violations:
  - [src/app/components/maps/useReportLayerData.ts](../src/app/components/maps/useReportLayerData.ts) — 4 service imports (reports, bids, supabaseService, map)
  - [src/app/components/dashboard/DashboardCoveragePanel.tsx](../src/app/components/dashboard/DashboardCoveragePanel.tsx) — 4 navigation services
  - 3 dashboard MapWidget components (Customer/Shop/Insurer) — `services/supabase/map`
  - 6+ shop screens — `services/intelligence/shopMapExperience`, `services/supabase/map`, `services/supabaseService`
  - 5+ landing surfaces (Coverage*, Business*, Waitlist*) — `services/navigation/*`, `services/supabase/\*`
- **Evidence:** [`archive/OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04_archived_2026-05-06.md`](archive/OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04_archived_2026-05-06.md) "Cross-layer flow audit" section — full file-by-file enumeration with line-level imports.
- **Fix direction:** Phase 8 L3 hook extraction. Concrete proposals from the diagnose:
  - `useGeoCoordinates(zip)` wraps `zipToCoordinates` + cache
  - `useHaversineDistance(originLat, originLng, destLat, destLng)` wraps `haversineMiles`
  - `useShopMapListings(role)` wraps `buildShopMapListings` + `getRoleCollectionActionLabels` + `getDefaultMapCenter` (closes the highest-coupling site, see KI-110)
  - `useNavigationVoicePriming()` wraps `primeVoiceEngine` + handles autoplay-policy
  - Move `useReportLayerData.ts` from `components/maps/` → `hooks/` so its L4 imports happen at the proper layer
    These ~5 hooks would shrink the L2 → L4 surface from ~30 to ~5 (the hooks themselves).
- **Removal trigger:** Phase 8 (Map L3/L4 + provider boundary) execution. Charter explicitly grandfathered existing files; refactor is part of Phase 8's scope, not an opportunistic touch during Phase 6/6.5/7/7.5.
- **Next review:** Future phase that closes the broader L2 → L4 grandfathered set (post-Phase-8 cleanup OR Phase 9 if scoped).
- **Phase 8 closure (2026-05-05):** **Partial closure — 4 hooks shipped covering the substantive-use surfaces; per-list-item + trivial-pure-function callers remain grandfathered with documented selectivity policy.**
  - **Hooks shipped:** [`useGeoCoordinates`](../src/app/hooks/useGeoCoordinates.ts) (commit `24e66d76`), [`useHaversineDistance`](../src/app/hooks/useHaversineDistance.ts) (commit `3118198e`), [`useNavigationVoicePriming`](../src/app/hooks/useNavigationVoicePriming.ts) (commit `48764ccb`), [`useShopMapListings`](../src/app/hooks/useShopMapListings.ts) (commit `8fa136d7`). Plus relocation of `useReportLayerData.ts` from `components/maps/` → `hooks/` (commit `07947353`).
  - **Substantive-use callers migrated (8 single-call sites):** BidsScreen, ReportDetailScreen, StepServiceLocation (useGeoCoordinates), CoverageActiveNavigationLayout (useHaversineDistance), DashboardCoveragePanel, CoverageBrowseExperience, CoverageMapDialog (useNavigationVoicePriming), InsurerPartnerShopsScreen, LikedShopsScreen, CompetitorAnalysisScreen (useShopMapListings).
  - **Documented residual (15+ surfaces remain with direct L4 imports):**
    - **Per-list-item callers** — files calling `zipToCoordinates` / `haversineMiles` / `getRoleCollectionActionLabels` inside `.map()` over a list. Hooks-in-loops React rule prevents migration. Affected: CustomerMapWidget, ShopMapWidget, InsurerMapWidget, InsurerClaimsScreen, ShopRequestsScreen, ShopActiveJobsScreen, useReportLayerData (zipToCoordinates inside report iteration), DashboardCoveragePanel + CustomerMapWidget (haversineMiles inside shops `.map()`), ImmersiveMapResultsDrawer + ShopDirectoryListBody (getRoleCollectionActionLabels inside shops `.map()`).
    - **Trivial pure-function callers** — direct imports for getter-style L4 functions where hook wrapping adds zero value: ShopDirectorySearchPanel (getRoleCollectionTitle), ShopDirectoryHybridMapSection (getDefaultMapCenter), InsurerPartnerShopCard (toggleRoleCollectionShopId).
    - **Type-only imports** — InsurerPartnerShopCard, ImmersiveMapResultsDrawer, ShopDirectoryListBody import `type { ShopMapListing }`. Type imports don't count as runtime architectural drift; left as-is.
  - **Future-phase resolution paths (none committed):** Either (a) relocate `zipToCoordinates` / `haversineMiles` / `getRoleCollectionActionLabels` etc. to a pure-utility module (`utils/geo`, `hooks/utils/`) so direct L2 imports are no longer L4 violations, OR (b) refactor each per-list-item caller to pre-compute via top-level `useMemo` + array-indexed lookup inside the `.map()`. Owner-named only.
- **Status:** **OPEN — P3 grandfathered with reduced surface area.** Phase 8 closure is partial-by-architecture; the 4 shipped hooks cover the single-call surfaces cleanly. Cross-ref [`archive/OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05_archived_2026-05-06.md`](archive/OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05_archived_2026-05-06.md) §1 hooks 1-4 + close footer for full scope refinement audit trail.

### KI-111: `command-center/` and `navigation/` subtrees growing toward sub-folder discipline threshold (P6)

- **Impact:** [src/app/components/maps/command-center/](../src/app/components/maps/command-center/) is at 8 files; [src/app/components/maps/navigation/](../src/app/components/maps/navigation/) is at 7+ files. Same monolithic-by-convention pattern is emerging in `components/shop/` (80 files, 17,462 LOC concentrated). Without a sub-folder discipline check, these subtrees grow until they're hard to navigate.
- **Severity:** P6. Discoverability smell, not a structural issue. No file-size violations within the subtrees.
- **Location:** Two subtrees flagged this audit:
  - [src/app/components/maps/command-center/](../src/app/components/maps/command-center/) — Coverage* + Planner* files
  - [src/app/components/maps/navigation/](../src/app/components/maps/navigation/) — Navigation\* sheets/panels
  - Adjacent risk: `src/app/components/shop/` has long been over the discoverability threshold; Phase 7 is the natural place to consider sub-folder split (e.g. `shop/directory/`, `shop/jobs/`, `shop/profile/`, `shop/onboarding/`).
- **Evidence:** [`archive/OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04_archived_2026-05-06.md`](archive/OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04_archived_2026-05-06.md) findings table row 4 + inventory section.
- **Fix direction:** Owner-named decision during Phase 7 (Bids/Report/Shop/Insurer map redesign) on whether to introduce sub-folder convention. NOT urgent. NOT a refactor target during 6.5/7.5/8.5 atmosphere phases. Likely candidate: introduce sub-folders only when adding a third-tier of file (so a Phase 7 commit that creates a 9th file in `command-center/` could trigger the split).
- **Removal trigger:** Phase 7 subtree review (not a hard requirement; review only).
- **Next review:** Phase 7 kickoff.
- **Status:** **OPEN — P6.**

### KI-112: Static atmosphere/idle motion gaps where keyframe motion would apply — landing warm-register sections + dashboard surfaces + dropdowns + map ambient surfaces (P7-TECHDEBT)

> **Scope extended 2026-05-05 (Phase 7.5 close)** to subsume Phase 7.5 audit findings F2 (dashboard mini-map idle drift NOT shipped) and F3 (dropdown entrance/exit NOT shipped). **Scope extended again 2026-05-05 (Phase 8.5 close, Path Y)** to subsume Phase 8.5 audit findings F1 (map route preview draw-on, becomes KI-112 F4), F2 (map pin pulse on MapLibre canvas, becomes KI-112 F5), and F4 (liquid sheen extension to map surface frames, becomes KI-112 F6); Phase 8.5 audit F3 (camera idle drift) maps directly to existing KI-112 F2 (dashboard atmosphere mini-map idle drift) — no duplicate entry created. Originally scoped to landing warm-register gold-lamp halos only; now tracks the broader "static surfaces where keyframe-based ambient/idle/enter motion would apply but is not consumed" family across landing + dashboard + map.

- **Impact (original scope — landing warm-register gold-lamp breathing):** Landing warm-register surfaces (BenefitsSection "Why Choose" + AboutOpportunitySection "Built on Transparency" + adjacent gold-halo sites) render premium gold-lamp halos as **static radial gradients**. The `pulseGlow` keyframe is defined in [`src/styles/animations.css`](../src/styles/animations.css) L101 but is not consumed by any of these surfaces. Result: the page's atmosphere reads correct (gold canon densely applied — 205 `rgba(196,…)` hits in `theme.css`), but the lamp halos themselves don't oscillate the way premium-glass UI typically does. Aesthetic depth gap, not a functional or readability issue.
- **Impact (F2 — dashboard atmosphere mini-map idle drift, added 2026-05-05):** [`DashboardAtmosphere.tsx`](../src/app/components/app/DashboardAtmosphere.tsx) (184 LOC) renders dashboard backdrop as 100% static gradient + radial layers; zero animation classes consumed. [`MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) renders mini-map preview with zero camera-drift / idle-pan motion. Same pattern family as the landing gold-lamp gap: a surface where canon supports atmospheric breathing/drift but the consuming component renders statically. Phase 7.5 charter scoped "mini-map idle drift" as a deliverable; the audit found it was not shipped.
- **Impact (F3 — dashboard dropdown entrance/exit, added 2026-05-05):** [`NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx) (406 LOC) and [`ProfileDropdown.tsx`](../src/app/components/dashboard/ProfileDropdown.tsx) (451 LOC) render with CSS `transition-colors` only on hover affordance; no fade/scale/slide enter/exit animations on the dropdown panel itself. The dropdowns appear and disappear instantly via plain conditional render. Phase 7.5 charter scoped "dropdown entrance/exit animations" as a deliverable; the audit found them not shipped. Folded into KI-112's "static where atmosphere/canon supports motion" family by structural analogy: stateful enter/exit is canon (per [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §5 envelope) but not consumed at these surfaces.
- **Impact (F4 — map route preview draw-on, added 2026-05-05 Phase 8.5 close):** MapLibre canvas-rendered route line layers (Report layer + shop directory) + DOM route preview cards ([`PlannerRoutePreview.tsx`](../src/app/components/maps/command-center/PlannerRoutePreview.tsx), [`ShopDirectoryRoutePreviewCard.tsx`](../src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx)) render as static lines or with `animate-pulse` skeleton / `LoaderCircle animate-spin` loaders only. Canon keyframes `bdRouteShimmer` (`theme.css:3638`, `6s linear infinite`) + `dashMove` (`animations.css`) are defined but have **zero consumers**. Phase 8.5 audit charter-mismatch flag: keyframes are DOM-targeted; canvas route lines need MapLibre paint property animation (`line-dasharray` interpolation) OR DOM-overlaid SVG route stroke. Neither is shipped.
- **Impact (F5 — map pin pulse on MapLibre canvas, added 2026-05-05 Phase 8.5 close):** MapLibre canvas circle/icon pin layers ([`MapLibreReportLayer.tsx`](../src/app/components/maps/MapLibreReportLayer.tsx) report pins, [`MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) shop pins) render statically; click triggers `flyTo` camera animation, not pin animation. Canon keyframe `bdPinPulse` (`.bd-pin-pulse` class at `theme.css:3653-3681`) is consumed only by landing `HeroSection.tsx` DOM-rendered hero pins. Phase 8.5 audit charter-mismatch flag: keyframe is DOM-targeted via CSS class; canvas pins can't directly use CSS classes. Pulsing actual map pins requires MapLibre native `circle-radius` interpolation OR DOM HTML markers overlaid on the map.
- **Impact (F6 — liquid sheen extension to map surface frames, added 2026-05-05 Phase 8.5 close):** Map surface frame containers ([`MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx), [`MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx)) render without `bd-liquid-gold-flow` consumption. The keyframe + class are shipped on landing (`HeroSection.tsx`, `OperatingRegionsSection.tsx`) but not extended to map frames. Phase 8.5 charter scope: extend existing landing-side liquid-gold to map-surface frames. Trivial to wire up (~10 LOC of CSS class application) — simplest of the six KI-112 sub-fixes.
- **Severity:** P7-TECHDEBT for all three sub-scopes. Aesthetic addition territory; **not a defensive fix.** No regression. No accessibility issue (the reduced-motion gap on motion/react surfaces is tracked separately in **KI-113**, not here). No user-facing bug — every surface in scope renders correctly without the missing motion.
- **Location:**
  - **Landing gold-lamp halos (original scope):**
    - [`src/app/components/landing/BenefitsSection.tsx`](../src/app/components/landing/BenefitsSection.tsx) L85 + L109 — static `radial-gradient(ellipse … rgba(196, 130, 45, 0.16) / rgba(196, 144, 65, 0.18))` halos
    - [`src/app/components/landing/AboutOpportunitySection.tsx`](../src/app/components/landing/AboutOpportunitySection.tsx) L110+ — orb glow + radial gold halo
    - Adjacent gold-halo sites across landing (TrustStatsSection, BusinessInquirySection warm-register surfaces) — survey on activation
  - **Dashboard atmosphere (F2, added 2026-05-05):**
    - [`src/app/components/app/DashboardAtmosphere.tsx`](../src/app/components/app/DashboardAtmosphere.tsx) (184 LOC, zero animation classes)
    - [`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) (no camera idle drift)
  - **Dashboard dropdowns (F3, added 2026-05-05):**
    - [`src/app/components/dashboard/NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx) (406 LOC, CSS transition-colors only)
    - [`src/app/components/dashboard/ProfileDropdown.tsx`](../src/app/components/dashboard/ProfileDropdown.tsx) (451 LOC, CSS transition-colors only)
  - **Map route preview draw-on (F4, added 2026-05-05 Phase 8.5):**
    - [`src/app/components/maps/command-center/PlannerRoutePreview.tsx`](../src/app/components/maps/command-center/PlannerRoutePreview.tsx) (DOM route card; Tailwind `animate-pulse` for loading skeletons only)
    - [`src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx`](../src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx) (DOM route card; `LoaderCircle animate-spin` for loading state only)
    - MapLibre route line layers across Report + shop directory map surfaces (canvas-rendered via MapLibre style spec; not DOM)
  - **Map pin pulse (F5, added 2026-05-05 Phase 8.5):**
    - [`src/app/components/maps/MapLibreReportLayer.tsx`](../src/app/components/maps/MapLibreReportLayer.tsx) (report pins; static layer)
    - [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) (shop pins; static layer)
  - **Liquid sheen extension to map surface frames (F6, added 2026-05-05 Phase 8.5):**
    - [`src/app/components/maps/MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx) (coverage map frame; not consuming `bd-liquid-gold-flow`)
    - [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) (shop directory map frame; not consuming `bd-liquid-gold-flow`)
- **Evidence:**
  - [`archive/OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md`](archive/OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md) §2 ("Gold lamp breathing") + findings table row 1 (original scope)
  - [`archive/OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md`](archive/OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md) §1.1, §1.2, §4.1 + findings F2 + F3 (extended scope — dashboard surfaces)
  - [`archive/OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05_archived_2026-05-06.md`](archive/OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05_archived_2026-05-06.md) §1.1, §1.2, §1.4 + findings F1 + F2 + F4 (extended scope — map ambient surfaces; audit F3 maps to existing KI-112 F2)
- **Fix direction (deferred):** Six sub-fixes possible independently or together. (1) Landing gold-lamp: wire `pulseGlow` (or a new `bdGoldLampBreathe` keyframe with a slower/more atmospheric curve — 8–12s cycle) to the static gold-lamp halos via a new CSS class (e.g. `bd-gold-lamp-breathe`). (2) Dashboard atmosphere/mini-map: author dashboard-appropriate idle camera or layer drift keyframe; consume in DashboardAtmosphere + MapLibreDashboardMapPreview. (3) Dashboard dropdowns: opt for either the `motion/react` envelope (`AnimatePresence` + initial/animate/exit per LAW_ANIMATION_AND_ATMOSPHERE §5) or pure CSS keyframe enter/exit. (4) Map route preview draw-on: wire `bdRouteShimmer` + `dashMove` via either MapLibre `line-dasharray` interpolation (canvas-side, `setPaintProperty` JS animation) OR DOM-overlaid SVG route stroke (DOM-side, allowing direct CSS keyframe class consumption). (5) Map pin pulse: wire `bdPinPulse` via either MapLibre `circle-radius` interpolation (canvas-side) OR DOM HTML markers overlaid on the map. (6) Liquid sheen extension to map frames: trivial — apply `bd-liquid-gold-flow` class to MapLibreServiceCoverageMap + MapLibreShopDirectoryMapPane frame containers (~10 LOC of CSS application; simplest of all six). Mandatory `prefers-reduced-motion: reduce` guard per [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §3 in the same commit as any activation (the root `<MotionConfig reducedMotion="user">` wrap and `useReducedMotion()` pattern shipped in Phase 7.6 / KI-113 close already provide the mechanical contract for motion/react surfaces — sub-fix authors inherit it for free; CSS keyframe activations on F1 / F4 / F5 / F6 must still author their own `@media (prefers-reduced-motion: reduce)` block per LAW §3). Owner taste decisions required before any sub-fix activation.
- **Removal trigger:** Post-launch aesthetic pass OR Phase 8.5 ambient/idle motion work, whichever comes first. Sub-fixes may activate independently.
- **Next review:** Post-launch retrospective OR Phase 8.5 kickoff.
- **Why parked here, not in OPS audit only:** The OPS pre-execution audit is a point-in-time snapshot; the KI ledger is the durable home for parked aesthetic gaps. Future agents reading `REF_KNOWN_ISSUES.md` will surface these candidates without re-reading audit docs. Phase 6.5 close commit cross-refs the original scope; Phase 7.5 close commit cross-refs the extended scope (F2 + F3).
- **Status:** **PARTIALLY RESOLVED — P7-TECHDEBT.** Phase 6.5 closed via Path B (deferred-aesthetic note, original scope). Phase 7.5 closed via Path Y (docs-only, F2 + F3 scope extension — dashboard surfaces). Phase 7.6 / KI-113 close (2026-05-05, commits `b1fea150` → `bb20f554`) cleared the reduced-motion contract gating — any future sub-fix activation on motion/react surfaces now mechanically inherits root `<MotionConfig reducedMotion="user">` (`src/main.tsx`) + per-file `useReducedMotion()` pattern (45 files); CSS keyframe activations (original landing gold-lamp + F4 / F5 / F6) must still author their own `@media (prefers-reduced-motion: reduce)` block per [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §3. Phase 8.5 originally closed via Path Y (docs-only, F4 + F5 + F6 scope extension — map ambient surfaces: route preview draw-on, pin pulse on canvas, liquid sheen extension to map frames; Phase 8.5 audit F3 camera idle drift maps to existing KI-112 F2 — no duplicate). **F4 + F5 RESOLVED 2026-05-07** via Passes 90 (`3ba6c855`) + 91 (`8a3349dd`) under owner per-session "real map program" directive: route polyline now animates via MapLibre `line-trim-offset` (1100ms ease-out cubic, modern equivalent of the planned `bdRouteShimmer`/`dashMove` dasharray approach) and selected shop pin glow now breathes via imperative `setPaintProperty` rAF on `circle-opacity` (modern equivalent of the planned `bdPinPulse` canvas activation). Both honor OS-level `prefers-reduced-motion: reduce` via `window.matchMedia` JS check; LAW §3 contract preserved at the OS layer. **F6 RESOLVED 2026-05-07** via Pass 100: `bd-liquid-gold-flow` extended to both [`MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) (z-[205], opacity 0.18 dark / 0.10 light) and [`MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx) (z-[249], same opacity, tone-aware via `resolveMapSurfaceTone`). Inherits the existing `@media (prefers-reduced-motion: reduce)` guard authored on `bd-liquid-gold-flow` in `theme.css` §4564 — LAW §3 contract preserved. Remaining sub-fixes (original landing scope + F2 + F3) remain owner-taste-deferred to post-launch aesthetic pass. This KI is the parked record for the full atmosphere/idle/enter-motion gap family across landing + dashboard + map.

### KI-114: navigation_saved_places migration scaffolded but not applied (P5-DOC, owner action)

> **Added 2026-05-07 — Pass 58 close.** Pass 58 shipped scaffolding for cloud-synced navigation saved places (home/work/saved/recent) without applying the migration, because the local Supabase CLI db push is broken under PG17 (see repo memory `supabase-cli-pg17-notes.md`). Owner applies via Supabase Studio.

- **Impact:** Until owner applies `supabase/migrations/20260507000001_create_navigation_saved_places.sql` against prod, every GET to `/navigation-saved-places` returns `42P01 undefined_table` → handler degrades to `{ places: [], fallback: true }` (HTTP 200), client circuit-breaker (60s backoff) kicks in, and `useSavedNavigationLocations` runs on its localStorage mirror only. Cross-device sync of pinned places does not activate. No user-visible breakage; same behavior as pre-Pass-58.
- **Severity:** P5-DOC / owner-action. Not blocking. Not a code defect. Self-healing once migration applied + edge function restarted.
- **Location:**
  - Migration: [`supabase/migrations/20260507000001_create_navigation_saved_places.sql`](../supabase/migrations/20260507000001_create_navigation_saved_places.sql)
  - Handler: [`supabase/functions/server/handlers/navigation_saved_places.ts`](../supabase/functions/server/handlers/navigation_saved_places.ts)
  - Client service: [`src/app/services/supabase/navigationSavedPlaces.ts`](../src/app/services/supabase/navigationSavedPlaces.ts)
  - Hook: [`src/app/hooks/useSavedNavigationLocations.ts`](../src/app/hooks/useSavedNavigationLocations.ts)
- **Apply steps:**
  1. Open Supabase Studio → SQL editor → paste migration body → run.
  2. Restart `server` edge function (Studio → Edge Functions → server → Restart, or redeploy).
  3. Verify with: `curl -H "Authorization: Bearer <clerk_jwt>" https://<project>.supabase.co/functions/v1/server/navigation-saved-places` → expect `{"places":[],"success":true}`.
- **Removal trigger:** Owner applies migration + verifies edge response no longer carries `fallback:true`. Move to RESOLVED archive when confirmed.
- **Status:** **OPEN — P5-DOC.** Awaiting owner apply.

### KI-115: shop_availability migration scaffolded but not applied (P5-DOC, owner action)

> **Added 2026-05-07 — Pass 59 close.** Pass 59 shipped scaffolding for real-time partner-shop availability (extends `shop_profiles` with `is_available`, `available_until`, `availability_updated_at`, `availability_note` columns + adds `shop_profiles` to the `supabase_realtime` publication) without applying the migration. Local Supabase CLI db push is broken under PG17 (see repo memory `supabase-cli-pg17-notes.md`). Owner applies via Supabase Studio. Mirrors KI-114 exactly.

- **Impact:** Until owner applies `supabase/migrations/20260507000002_add_shop_availability_columns.sql` against prod, every PUT to `/shop-availability` returns `42703 undefined_column` → handler degrades to `{ success: true, fallback: true }` (HTTP 200), client circuit-breaker (60s backoff) kicks in, and `useShopAvailability` viewer-mode realtime channel never receives events (because `shop_profiles` is not yet in `supabase_realtime`). No user-visible breakage this Pass — there is no UI consumer yet (Pass 62 scope). Owner may apply at any time without coordinating with code.
- **Severity:** P5-DOC / owner-action. Not blocking. Not a code defect. Self-healing once migration applied + edge function restarted.
- **Location:**
  - Migration: [`supabase/migrations/20260507000002_add_shop_availability_columns.sql`](../supabase/migrations/20260507000002_add_shop_availability_columns.sql)
  - Handler: [`supabase/functions/server/handlers/shop_availability.ts`](../supabase/functions/server/handlers/shop_availability.ts)
  - Client service: [`src/app/services/supabase/shopAvailability.ts`](../src/app/services/supabase/shopAvailability.ts)
  - Hook: [`src/app/hooks/useShopAvailability.ts`](../src/app/hooks/useShopAvailability.ts)
- **Apply steps:**
  1. Open Supabase Studio → SQL editor → paste migration body → run. Confirm `RAISE NOTICE 'added public.shop_profiles to supabase_realtime publication'` (or "already in") fires.
  2. Restart `server` edge function (Studio → Edge Functions → server → Restart, or redeploy).
  3. Verify with: `curl -H "Authorization: Bearer <clerk_jwt>" -X PUT -H "Content-Type: application/json" -d '{"isAvailable": true}' https://<project>.supabase.co/functions/v1/server/shop-availability` → expect `{"availability":{"isAvailable":true,...},"success":true}` (NOT `fallback:true`).
  4. Verify GET works: `curl https://<project>.supabase.co/functions/v1/server/shop-availability/<shop_uuid>` → expect `{"availability":{"isAvailable":true,...},"success":true}`.
- **Removal trigger:** Owner applies migration + verifies edge response no longer carries `fallback:true` + a smoke realtime subscription (Studio → Database → Replication → supabase_realtime publication → confirm shop_profiles listed). Move to RESOLVED archive when confirmed.
- **Pass 62 dependency:** Marker UI integration (color-coded availability dots, dashboard toggle) requires this migration to be applied first. Pass 62 should not ship UI consuming the realtime data while KI-115 is OPEN.
- **Status:** **OPEN — P5-DOC.** Awaiting owner apply.

### KI-116: Navigation engine mounts on passive surfaces — umbrella P0 cluster (P0-RUNTIME)

> **Added 2026-05-07 — external audit AI deep audit.** Single root cause produces six distinct user-visible symptoms. Audit AI captured the smoking gun via `localStorage` inspection: `coverageCurrentLocation` GPS reading was `(33.95, -84.09)` (Suwanee, GA) while an active nav session in localStorage had destination `(40.93, -73.90)` (Yonkers, NY). Haversine = 743 mi, matches the on-screen "737.2 mi off route" banner. **The session was in `status: "planning"` with `activatedAt: null`** — the deviation engine should not have been evaluating at all.

- **Impact (six symptoms, one cause):**
  1. "You're off route — 737.2 mi from the planned route" banner persists at idle on dashboard inline coverage map AND in fullscreen map.
  2. Auto-reroute "Finding a new route…" toast fires from passive (non-navigation) surfaces.
  3. "Stopped detected" toast fires from passive surfaces.
  4. Notification counter increments without user action (audit AI observed 3 → 9+ → 17 → 23 → 9+ from idle clicking).
  5. `useNavigationGpsTracking.ts:197` emits "Speed limit lookup failed" errors continuously while user is on the dashboard (Overpass calls firing for the user's idle GPS location).
  6. Carto basemap 503 storm: ~50 % of tile requests fail; tile coords span Yonkers → Rockies → Pacific Northwest because the dashboard inline map's `fitBounds` envelopes ALL demo shops cross-country. Tile prefetch follows the cross-US bbox.
- **Location:** [`src/app/hooks/useNavigationGpsTracking.ts`](../src/app/hooks/useNavigationGpsTracking.ts) is consumed from [`src/app/hooks/useShopDirectoryNavigation.ts:78`](../src/app/hooks/useShopDirectoryNavigation.ts#L78) and [`src/app/hooks/useCoverageNavigationExperience.ts:113`](../src/app/hooks/useCoverageNavigationExperience.ts#L113). Both reachable from the dashboard inline coverage panel via Pass 49's lazy-mount path. The `detectDeviation` math at [`src/app/features/navigation/detectDeviation.ts:145-167`](../src/app/features/navigation/detectDeviation.ts#L145) is correct — `OFF_ROUTE_THRESHOLD_MILES = 0.3` triggers when distance > 0.3 mi, which 743 mi satisfies. Bug is mount scope, not algorithm.
- **Fix direction (audit AI's R1 — single highest-leverage fix):** Gate the deviation engine on `session.status === 'active'` AND on a navigation surface (NOT dashboard / NOT bids / NOT inline coverage). One change collapses all six symptoms.
  - Confirm `useNavigationGpsTracking` is only mounted on actual nav screens (Smart Shop Map active flow, fullscreen turn-by-turn).
  - For dashboard inline coverage panel: verify it does NOT mount the GPS tracking + deviation pipeline. If it currently does, gate with a `mode: "passive" | "navigation"` prop or similar.
  - For `useNavigationIntelligence.evaluate(snapshot)`: short-circuit when `session.status !== "active"`.
- **Severity:** **P0-RUNTIME.** Ships catastrophic first-impression user experience: phantom warnings, runaway notifications, persistent error toasts. Not shippable in current state.
- **Prerequisite for downstream passes:** Pass 61 (test coverage) cannot proceed until this is fixed — tests would otherwise encode the buggy mount scope as expected behavior. Pass 63 (KI-053 perf descriptor memoization) is wasted work while the tile storm is driven by cross-US fitBounds, not descriptor instability.
- **Status:** **RESOLVED 2026-05-07 — Pass 61 + Pass 61b.** Pass 61 gated `intelligence.evaluate(snapshot)` on `navSession.session.status === "active"` at the single call site in [`src/app/hooks/useNavigationLifecycleEffects.ts`](../src/app/hooks/useNavigationLifecycleEffects.ts). The deviation engine now no-ops on every passive surface (dashboard inline coverage, shop directory browse, etc.) regardless of mount scope. Symptoms 1–4 (737mi banner, "Finding new route" toast, "Stopped detected" toast, notification counter inflation) collapsed. **Pass 61b** added an `isActiveNavigation` arg to [`src/app/hooks/useCoverageNavigationExperience.ts`](../src/app/hooks/useCoverageNavigationExperience.ts) (defaults `true` for back-compat) and gates `speedLimitMonitorEnabled` on it. [`src/app/components/dashboard/DashboardCoveragePanel.tsx`](../src/app/components/dashboard/DashboardCoveragePanel.tsx) now passes `isActiveNavigation: false`; [`src/app/hooks/useShopDirectoryNavigation.ts`](../src/app/hooks/useShopDirectoryNavigation.ts) ANDs `speedLimitMonitorEnabled` with `navSession.session.status === "active"`. Symptom 5 (continuous "Speed limit lookup failed" Overpass spam) collapsed. Symptom 6 (Carto 503 tile storm from cross-US `fitBounds`) is a separate root cause (KI-053 family / dashboard inline map bbox) and remains tracked there. Builds clean 3.29s + 3.47s.

### KI-117: Stale `bidondent_nav_session_*` keys persist across reload AND across sign-out (P1-RUNTIME, expanded)

> **Added 2026-05-07 — external audit AI deep audit. Expanded 2026-05-07 — sign-out walkthrough revealed the bug is broader than reload-only.** Original observation: nav session from a prior browsing context still resident in `localStorage` after a fresh page load. Session state: `status: "planning"`, `activatedAt: null`, destination set, no recent user action.
>
> **Sign-out walkthrough expansion:** **3 stale planning sessions persist after Sign Out + reload.** Sign-out clears Clerk auth (cookies dropped 7 → 4, Clerk session cleared) but leaves all `bidondent_nav_session_user_*` entries untouched in localStorage. A different user signing into the same browser inherits the prior user's planning state. Companion privacy concern KI-133 (`bidondent_user:<email>` key name embedding).

- **Impact (now broader):** Even with KI-116's mount-scope fix in place, stale sessions in localStorage:
  1. Persist across reload (original) — phantom 737mi banner driver.
  2. Persist across **sign-out + reload** (new) — next user inherits prior user's planning state.
  3. Cross-account leak on shared devices: real privacy implication.
- **Fix direction (expanded):**
  1. On **dashboard mount**: clear `bidondent_nav_session_*` keys when `status === "planning"` AND (`activatedAt === null` OR `updatedAt` older than X minutes).
  2. On **sign-out flow**: explicitly delete every `bidondent_nav_session_*`, `bidondent_user:*`, `coverageCurrentLocation`, and any other user-scoped key before redirecting to landing.
  3. Consider switching planning sessions to `sessionStorage` so they evaporate when the tab closes.
- **Severity:** **P1-RUNTIME (expanded).** Now covers reload persistence AND sign-out cleanup gap. Single companion fix to KI-116, same pass.
- **Status:** **RESOLVED 2026-05-07 — Pass 61.** New util [`src/app/utils/clearStaleNavSessions.ts`](../src/app/utils/clearStaleNavSessions.ts) exports `clearStalePlanningNavSessions()` (sweeps `bidondent_nav_session_*` keys with `status: "planning"` AND no `activatedAt` OR `updatedAt` >30min old) and `clearAllUserScopedSessionKeys()` (nukes `bidondent_nav_session_*`, `bidondent_nav_active_session_*`, `bidondent_user:*`, `coverageCurrentLocation`, pending-write queue, cloud-unavailable marker). Stale sweep wired on App mount in [`src/app/App.tsx`](../src/app/App.tsx). Full purge wired on sign-out in [`src/app/hooks/useAppHandlers.ts`](../src/app/hooks/useAppHandlers.ts) `handleLogout` (both success + error paths so cleanup runs even when Clerk sign-out throws). Cross-account leak on shared devices (privacy concern) is closed.

### KI-118: ESC key does not close map UI panels (Voice Controls, Navigation Settings) (P2-A11Y)

> **Added 2026-05-07 — external audit AI deep audit.** Audit AI clicked into Voice Controls panel, then pressed ESC — panel persisted. Same on Navigation Settings panel.

- **Impact:** Standard escape-closes-modal pattern broken. Keyboard-only users cannot dismiss these panels without clicking the X. Screen reader users may also be stuck. Direct WCAG 2.1 §2.1.2 (keyboard trap) concern.
- **Location:** [`src/app/components/maps/navigation/NavigationVoiceControlsSheet.tsx`](../src/app/components/maps/navigation/NavigationVoiceControlsSheet.tsx) (no `onKeyDown` / `useEffect` listener for `Escape`). Same pattern likely in [`src/app/components/maps/navigation/NavigationSettingsSheet.tsx`](../src/app/components/maps/navigation/NavigationSettingsSheet.tsx).
- **Fix direction:** Add `useEffect` listener for `keydown` → `event.key === "Escape"` → call `onClose()`. Standard React pattern, ~10 LOC per file. Should also focus-trap within the panel while open (focus does not currently move into panel).
- **Severity:** **P2-A11Y.** Real keyboard accessibility blocker. Small, mechanical fix.
- **Status:** **RESOLVED 2026-05-07 — Pass 63.** New shared hook [`src/app/hooks/useEscapeKey.ts`](../src/app/hooks/useEscapeKey.ts) (`useEscapeKey(enabled, onEscape)`). Wired into [`NavigationVoiceControlsSheet.tsx`](../src/app/components/maps/navigation/NavigationVoiceControlsSheet.tsx) and [`NavigationSettingsSheet.tsx`](../src/app/components/maps/navigation/NavigationSettingsSheet.tsx). Listener auto-detaches when `open` flips false. Focus-trap improvement deferred. KI-147 (fullscreen ESC exit) tracked separately — same hook, different mount site, will close in a follow-up pass.

### KI-122: Fullscreen map in-canvas "Light" tile mode renders pure white empty canvas (P2-VISUAL)

> **Added 2026-05-07 — external audit AI deep audit.** Numbering jump 118 → 122 to avoid collision with archived KI-119 / KI-120 / KI-121 (in `archive/RESOLVED_KIS_2026-05-07.md`). The fullscreen map has an in-canvas tile-mode toggle distinct from the app-level theme toggle. The toggle cycles Night → Satellite → Light. The Light position fails to load any tile source.

- **Impact:** User toggles to Light tile mode in fullscreen → map becomes a blank white canvas with no basemap, no markers, no route. Recovery is to cycle toggle again or reload. Light-mode preference reads as "broken light rendering" to any user who toggles in this order.
- **Location:** Fullscreen map's tile-mode segmented control — likely a CARTO Positron tile-source URL not registered or a misconfigured style. NOT the app-level light theme (which works correctly per audit AI: "Light mode is excellent on dashboard").
- **Fix direction:** Ensure the "Light" mode binds to a working CARTO Positron style (or equivalent free tile source). Verify CSP allowlist permits `cartocdn.com/light_all/`.
- **Severity:** **P2-VISUAL.** Limited blast radius (only fires when user toggles a non-default control), but the blank-white state is alarming.
- **Status:** **RESOLVED-NOT-REPRODUCIBLE — Pass 84 (2026-05-07).** Source-walk confirms the tile-mode toggle has only THREE positions: `roadmap | night | satellite` (per [`MapTileMode`](../src/app/components/maps/serviceCoverageMapTypes.ts) type). There is NO "Light" position in the cycle — the segmented control in [`MapSurfaceControls.tsx`](../src/app/components/maps/MapSurfaceControls.tsx) renders exactly three buttons (Map / Night / Satellite). The audit AI hallucinated a fourth "Light" position, likely confusing the in-canvas tile toggle with the app-level theme switch (which IS light/dark and works correctly per the same audit). All three actual tile modes wire to working CARTO sources: roadmap → CARTO Voyager rastertiles, night → CARTO dark_all, satellite → Esri World Imagery (verified in [`mapLibreStyles.ts`](../src/app/components/maps/mapLibreStyles.ts) and [`ShopDirectoryImmersiveMap.tsx`](../src/app/components/shop/ShopDirectoryImmersiveMap.tsx)). If the owner observes a true blank-canvas at runtime in any of the three real modes, file a fresh KI with a screenshot — this one is closed as non-reproducible.

### KI-123: Notification badge cap visual ("8+", "9+") desyncs from ARIA raw count (P3-A11Y)

> **Added 2026-05-07 — external audit AI deep audit.** Notification bell visually shows capped values like "8+" / "9+" but `aria-label` exposes raw counts ("17 unread", "23 unread"). Screen reader announces a different number than the visual badge.

- **Impact:** Sighted + screen reader users hear different counts. Lower priority than KI-116 / KI-117 which are inflating the count in the first place.
- **Fix direction:** Either cap the ARIA count to match visual ("more than 8 unread") or remove the visual cap. Match visual + ARIA semantics.
- **Severity:** **P3-A11Y.** Cosmetic-tier accessibility issue.
- **Status:** **RESOLVED — Pass 80 (2026-05-07).** [`DashboardHeader.tsx`](../src/app/components/app/DashboardHeader.tsx) bell `aria-label` now matches the visual cap: when `unreadCount > 9`, screen readers hear "Open notifications, more than 9 unread" (mirrors the visual "9+"); otherwise the exact count is announced. Sighted + screen reader users hear the same semantic. The other notification badge surfaces ([`dashboard/DashboardHeader.tsx`](../src/app/components/dashboard/DashboardHeader.tsx) red dot + [`ProfileDropdown.tsx`](../src/app/components/dashboard/ProfileDropdown.tsx) inline pill) render the raw count without a visual cap, so they already match — no change needed.

### KI-124: Polish bundle from external audit (P2-COPY + P3-VISUAL)

> **Added 2026-05-07 — external audit AI deep audit.** Bundled to keep the KI list manageable; each item is small (<10 LOC) and independent.

- **Sub-items:**
  1. **"1 offers" pluralization** — Bid Comparison header should read "1 offer" when count is 1. P2-COPY.
  2. **"2014 Mazda Mazda6"** — vehicle string concatenates make + model where model already contains the make. Likely `${make} ${model}` rendering when `model = "Mazda6"`. Detect + dedup. P2-COPY/DATA.
  3. **"Smoke Test Checklist" visible to end users on Account tab** — should be dev-only. Gate behind `import.meta.env.DEV`. P2-UX.
  4. **"Save immediately" copy contradicts "Save Appearance" button** in Appearance Settings modal — pick one model. If saves are immediate, drop the button (or rename "Done"). P2-COPY.
  5. **Voice persona stored value `british-smooth` displays as "Google UK English Female"** — mapping inconsistency between persona key and display label. Display label should derive from persona key consistently across surfaces. P3-DATA.
  6. **"Browse all shops & AI matching" gradient bleeds past container's rounded corner** — single CSS `overflow: hidden` or `clip-path` fix on the wrapper. P3-VISUAL.
  7. **Right action bar in fullscreen map: 4 unlabeled icon buttons** — adds first-time-user discoverability gap. ARIA labels exist but no visible text. Add subtle text labels under each icon (e.g., "Turns" / "Voice" / "Settings" / "Center"). P3-UX.
  8. **Tile-mode toggle has no visible mode label** — only the icon swaps. Add a small text label ("Night" / "Satellite" / "Light"). P3-UX.
  9. **Off-route status pill (top-right) AND centered banner show simultaneously** — pick one location. Recommend the corner pill; the centered banner covers the road network the user is trying to read. P3-UX.
  10. **Missing "Cancel navigation" / "End session" affordance in fullscreen UI** — no way to clear planning state from the fullscreen UI. Add a clear-route control. P2-UX.
- **Severity:** Mix of P2-COPY / P2-UX / P3. None are launch-blocking.
- **Status:** **PARTIAL — Pass 64 + Pass 67 + Pass 72 + Pass 73 (2026-05-07).** Items #1, #2, #3, #4, #5, #6, #7, #8 RESOLVED. (#7) [`NavigationActionRail.tsx`](../src/app/components/maps/navigation/NavigationActionRail.tsx) now renders small uppercase labels under each icon button (Turns / Voice / Settings / Center) — first-time-user discoverability gap closed. Buttons switched to `flex-col` with `min-h-[44px]` `min-w-[44px]` so touch targets remain compliant (KI-136 contract preserved). (#8) Tile-mode toggle in [`MapSurfaceControls.tsx`](../src/app/components/maps/MapSurfaceControls.tsx) now shows the mode label (Map / Night / Satellite) on **all viewports** (was `hidden sm:inline`); also gained `aria-pressed` + descriptive `aria-label` for screen readers. Items #9, #10 still **OPEN** (need DOM + design decisions).

### KI-125: Report flow Step 1 vehicle picker — placeholder text matches saved vehicle but input `value` is empty (P1-DATA/UX)

> **Added 2026-05-07 — external audit AI Report flow walkthrough.** When the user lands on Report Step 1 with a saved vehicle, the input fields render with placeholder text that LOOKS LIKE pre-filled data ("Toyota", "Camry", "2021"), but the actual `value` attribute is `""` (empty). Audit AI confirmed via DOM inspection.

- **Impact:** User sees what looks like pre-filled vehicle data and clicks "Continue" assuming the form is complete. Form submission fails or sends empty values. Confusing data integrity bug. Two distinct hypotheses for root cause:
  1. The "Use" button on a saved-vehicle card is supposed to fill the inputs but isn't firing the controlled-component updater. Saved-vehicle data is rendered as placeholder hint only.
  2. The placeholder text is templated from saved-vehicle data deliberately, but the form expects user to confirm by typing — a dark-pattern UX even if it works downstream.
- **Location:** Report flow Step 1 vehicle entry component(s). Pre-existing report entry path. Audit AI's exact words: "fields show `value: ""` but placeholders match user's saved vehicle. So the visual is misleading — Toyota/Camry/2021 LOOK filled but aren't."
- **Fix direction:** Verify the "Use" CTA on saved-vehicle cards: does it actually copy the saved vehicle data into the controlled inputs? If not, fix the click handler to call `setValue` for make/model/year. Alternative: use distinct placeholder text ("e.g. Toyota") rather than echoing the saved vehicle, so users don't read placeholder as filled.
- **Severity:** **P1-DATA/UX.** Real user-facing risk of submitting empty form. Test coverage gap — Pass 61 should include a regression test for "saved-vehicle Use button populates form values."
- **Status:** **RESOLVED 2026-05-07 — Pass 65.** Source-walk confirmed the "Use" button on saved-vehicle cards is correctly wired: `onClick → onVehicleChange({ make, model, year: String(savedVehicle.year), vin })` flows through `ReportScreen` → `form.setVehicle` → useState update → controlled inputs re-render with new values. The audit AI's "value: """ observation was a coincidence — the hardcoded placeholders ("Toyota", "Camry", "2021") happened to match their saved vehicle. To prevent future confusion, placeholders are now prefixed with "e.g. " ("e.g. Toyota", "e.g. Camry", "e.g. 2021"), making it visually unambiguous that the field is empty until the user picks a saved vehicle or types.

### KI-126: Report flow wizard — empty-state layout overflow on ALL form steps before inputs are populated (P1-LAYOUT, RE-SCOPED)

> **Added 2026-05-07 — external audit AI Report flow walkthrough. Re-scoped 2026-05-07 third pass — confirmed systemic across wizard steps, NOT step-specific.** Original observation was Step 3 only; deep audit found Step 4 (Photos) shows the SAME empty-state clipping ("nage photos" missing "Da", "ridence" missing "Ev", "one clear photo" missing "Take", "ighting and close-up" missing "L"). Step 2 only renders cleanly because its "form" is a 6-button picker with the buttons pre-populated. Conclusion: **the empty-state overflow rule fires on every wizard step whose form panel has no input content**. One layout fix repairs every step.

- **Impact:** First-paint Steps 3 + 4 (and presumably Step 5 if it has a form panel) render with heading + labels clipped at left edge. Step 3 fixes itself once ZIP is entered; Step 4 likely fixes itself when first photo is added. Reads as half-broken on every wizard arrival until user starts typing/uploading.
- **Location:** Wizard form-card left-edge positioning rule. Empty-state-conditional. Audit AI's hypothesis: a `transform: translateX(-N)` rule keyed off `:not(:has(input:not(:placeholder-shown)))` or similar miscalibrated content-conditional positioning. Single shared CSS rule, single shared fix.
- **Fix direction:** Identify the rule via DevTools Elements panel — open Step 3 with empty form, inspect the heading element, walk up to the clipping ancestor, capture the computed transform/positioning. Then test if the same selector matches Step 4. Single-rule fix expected to repair all wizard steps. **PROMOTED to P1** based on Step-4-also-affected confirmation — every Report flow user hits this on every wizard step until inputs are filled.
- **Severity:** **P1-LAYOUT** (was P2; promoted on third-pass evidence). Affects core conversion funnel.
- **Status:** **OPEN — NEEDS-DOM-EVIDENCE — Pass 88 (2026-05-07).** Source-walk eliminates the audit AI's hypothesized root cause: a repo-wide grep across `src/**/*.{ts,tsx,css}` for `:has(input`, `placeholder-shown`, `fadeInLeft`, `animate-fade-in-left`, `translate-x-`, and Framer Motion `initial={{ x:` returned **zero matches** in any wizard step or wizard wrapper. The only motion on `<motion.div>` in [`ReportScreen.tsx`](../src/app/components/codelayer/ReportScreen.tsx) lines 286-294 is `initial={{ opacity: 0, y: 8 }} → animate={{ opacity: 1, y: 0 }}` (Y-axis only, 220ms, gated by `reduceMotion`). `bd-report-shell` declares `overflow: hidden` ([`theme.css`](../src/styles/theme.css) line 2554) so any decorative pseudo-element bleed is contained. There is no empty-state-conditional positioning rule anywhere in the codebase. Two remaining hypotheses, both require live DOM inspection to confirm or reject: (a) the `scrollIntoView({ inline: "nearest" })` on step transition ([`ReportScreen.tsx`](../src/app/components/codelayer/ReportScreen.tsx) line 211) is horizontally shifting the page when an interior element exceeds the viewport width — would manifest as identical clipping on every wizard arrival, fix via `inline: "center"` or removing the inline argument; (b) the audit AI's screenshot captured a transient mid-Y-translate frame and the "left clipping" was a visual artifact of the partial fade-in, not a real layout bug. Next builder pass: open Steps 3+4 in a customer-role browser session (current shop-role TestShop session cannot reach the wizard), inspect the heading element's computed-style + ancestor chain, and report findings before any CSS edit. Do **not** ship a speculative CSS fix against a hypothesis the source-walk has eliminated.

### KI-127: "Off route" toast overlaps user avatar in dashboard header (P2-LAYOUT)

> **Added 2026-05-07 — external audit AI dashboard scroll walkthrough.** The persistent off-route toast (driven by KI-116) overlaps the user avatar / notification bell area in the header at certain viewport widths.

- **Impact:** Two layout concerns combined:
  1. Toast z-index sits on top of header chrome → user can't click their avatar / notification bell
  2. Visual hierarchy collision — two attention-seeking elements in the same screen region
- **Note:** This bug becomes invisible once KI-116 is fixed (toast won't render on dashboard at all). But if KI-116 is fixed by gating the toast at the wrong boundary (e.g., still allowing toast on dashboard but only when active), the layout collision remains a real issue. Builder validates after KI-116 fix that any persistent toast in this region either:
  - Re-anchors to a different position (bottom of viewport with safe-area inset, or below the header)
  - Is dismissable (unlike the current persistent banner)
- **Location:** Toast z-index / position styles + header layout. Visible at the viewport audit AI was at (likely 1280×900 desktop after previous resize attempts).
- **Severity:** **P2-LAYOUT.** Will likely become moot when KI-116 ships; track as a follow-up validation after that fix lands.
- **Status:** **RESOLVED-DEPENDENT 2026-05-07 — Pass 61.** With KI-116 RESOLVED, the off-route toast no longer fires on the dashboard at all (eval is gated on active nav session, which never exists on the dashboard surface). The header overlap symptom cannot reproduce. If a future regression re-introduces toasts in the header region, re-open with explicit z-index/anchor work — the underlying chrome layout itself was not touched in this pass.\*\*

### KI-128: Report flow Step 3 → Step 4 — "Skip for now" returns to Step 3 instead of advancing (P1-UX)

> **Added 2026-05-07 — external audit AI Report flow walkthrough.** Clicking Continue on Step 3 (Location) opens a "Photo Tips" onboarding modal. The modal has two CTAs: "Got it — start taking photos" and "Skip for now". **Got it correctly advances to Step 4. Skip for now CLOSES the modal but leaves the user on Step 3.** Clicking Continue then re-opens the same modal. The flow is effectively stuck unless the user clicks Got it.

- **Impact:** Users who tap Skip for now expecting to bypass the tips screen instead end up in a modal-loop that reads as broken. Real risk of users abandoning the report mid-flow. Audit AI's exact words: "the dismiss behavior is weird: 'Skip for now' closes the modal but leaves you on Step 3, not Step 4. Continue then re-opens the modal."
- **Location:** The Photo Tips modal component + its Skip handler. Likely the Skip handler only calls `onClose()` without also advancing the wizard step. Got it handler likely calls `onClose()` + `goToNextStep()`.
- **Fix direction:** Skip for now should call BOTH `onClose()` AND `goToNextStep()` so the user lands on Step 4 with photos empty. Got it should also advance to Step 4 (with photo picker open by default). Two-line fix. Test the back button from Step 4 — should return to Step 3, not the modal.
- **Severity:** **P1-UX.** Real flow blocker for users who tap Skip. Affects the core conversion funnel (report submission).
- **Status:** **RESOLVED 2026-05-07 — Pass 62.** Added distinct `onSkip` prop to [`PhotoGuide.tsx`](../src/app/components/shop/PhotoGuide.tsx) (defaults to `onClose` for back-compat). [`ReportScreen.tsx`](../src/app/components/codelayer/ReportScreen.tsx) passes a Skip handler that closes the modal AND calls `form.nextStep()` AND sets `hasSeenGuideThisSession(true)` so it does not re-open on next Continue tap. Backdrop tap and corner X still call the original `onClose` (true cancel). `hasSeenPhotoGuide` persistence flag is intentionally NOT set on Skip — user skipped, did not acknowledge.

### KI-129: Report flow Step 1 — required-field visual asterisks but `required: false` on HTML inputs (P2-DATA/A11Y)

> **Added 2026-05-07 — external audit AI Report flow walkthrough.** Make / Model / Year fields render with red asterisk in the label visual styling, but the underlying HTML inputs have `required: false`. The form does not block submit on empty fields.

- **Impact:** Visual asterisks signal required-ness to users; HTML attribute determines actual validation. The two disagree. A user could complete Step 1 with empty Make/Model/Year and submit (assuming KI-125's "Use" button issue is also bypassed). Browser-native form validation cannot fire because the inputs aren't marked required. Compounds with KI-125 (placeholder/value mismatch) — both contribute to "Step 1 looks complete, but isn't."
- **Location:** Report flow Step 1 vehicle form. Likely a CSS class adds the visual asterisk indicator without a corresponding `required` attribute on the input.
- **Fix direction:** Pick one truth. Either: (a) add `required` to the HTML inputs (browser-native validation kicks in), or (b) remove the visual asterisks if the form is genuinely optional. Recommend (a) — Make/Model/Year are conceptually required for any report. Verify the validation message styling matches the bd-design system, not browser defaults.
- **Severity:** **P2-DATA/A11Y.** Real validation gap. Screen readers may also announce inconsistent semantics.
- **Status:** **RESOLVED 2026-05-07 — Pass 66.** Added `required` attribute to make/model/year inputs in [`StepVehicleInfo.tsx`](../src/app/components/codelayer/report/StepVehicleInfo.tsx) — closes the screen-reader semantic gap (browsers expose `required` as `aria-required="true"`). Continue button was already correctly gated via `canContinue`. Defensive guard added at the top of `handleVehicleContinue` in [`useReportForm.ts`](../src/app/components/codelayer/useReportForm.ts) so the wizard refuses to advance even if a future caller bypasses the disabled-button gate. Audit AI's "user could submit empty" claim was technically false (button was disabled), but the a11y semantics are now correct.

### KI-130: No service worker registered — app has no offline support (P3-INFRA)

> **Added 2026-05-07 — external audit AI offline check.** `navigator.serviceWorker.controller === null`. The app has no SW registration, no Cache Storage entries.

- **Impact:** When network drops mid-session (e.g., user driving toward a shop, signal degrades), the app shows broken-loading state instead of a designed offline screen or cached app shell. For a navigation-adjacent product, offline tile cache + cached app shell would be a real differentiator.
- **Location:** No SW file in build output. PWA manifest may also be missing — verify in DevTools Application panel.
- **Fix direction:** Long-term: Workbox-generated SW with network-first caching for app shell, stale-while-revalidate for Carto tiles, network-only for API. Short-term: even a minimal "you're offline" route would beat the current broken state. Consider Vite PWA plugin for the scaffolding.
- **Severity:** **P3-INFRA.** Not launch-blocking on desktop. Would be moderate priority for a mobile PWA push.
- **Status:** **RESOLVED — Pass 79 (2026-05-07).** Source verification (KI-150 Pass 76 + this pass) confirms `vite-plugin-pwa` is wired in [`vite.config.ts`](../vite.config.ts) lines 13-62 with `registerType: "autoUpdate"`, manifest, and Workbox runtime caching for Supabase API (NetworkFirst, 50 entries, 5min TTL) + map tiles (CacheFirst, 500 entries, 7-day TTL). Build output also confirms — last build emitted `dist/sw.js` + `dist/workbox-354287e6.js` with 64 precached entries (3.8 MiB). The audit AI's `navigator.serviceWorker.controller === null` was Vite-dev-server behavior; production builds register the SW automatically. Closed at source.

### KI-131: Landing headline carousel auto-rotates without prefers-reduced-motion pause or manual control (P2-A11Y)

> **Added 2026-05-07 — external audit AI landing audit.** The hero headline carousel auto-rotates through 3 taglines every few seconds. There is no manual pause control, no manual skip, and no prefers-reduced-motion gate.

- **Impact:** Vestibular-sensitive users get continuous motion in the hero. Users mid-read get the tagline yanked from under them. Direct WCAG 2.2.2 Pause, Stop, Hide concern.
- **Location:** Landing hero headline carousel component.
- **Fix direction:** (a) Pause auto-rotation when `prefers-reduced-motion: reduce`. (b) Add a small pause/play affordance (a button next to the dot indicators). (c) Pause on hover/focus. Common library patterns from Embla/Swiper handle (a) + (c) natively.
- **Severity:** **P2-A11Y.** WCAG 2.2.2 violation. Polished landing pages in 2026 universally handle this; BidOnDent is currently not.
- **Status:** **RESOLVED — Pass 79 (2026-05-07).** Verified [`HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx) lines 73-78 already gate the auto-rotation interval on `prefersReducedMotion.current` (set from `window.matchMedia("(prefers-reduced-motion: reduce)").matches` on mount). Added a `userPaused` state flag — when the user clicks any carousel dot, the flag flips true and the `useEffect` cleanup tears down the interval. Dot button labels now read "Show tagline N of 3 (pauses auto-rotation)" with `aria-pressed` for screen readers. WCAG 2.2.2 Pause/Stop/Hide satisfied: (a) reduced-motion users never see auto-rotation; (b) all users get manual skip + implicit pause-on-interaction.

### KI-132: SPA history grows unboundedly — `history.length` reached 21 in one audit session (P3-ROUTING)

> **Added 2026-05-07 — external audit AI navigation audit.** Each tab change inside the SPA pushes a new `history` entry. After a normal audit session on one tab, `historyLength` grew to 21. Browser back from `Dashboard → Find Shops → Bids` does not predictably return to the home dashboard.

- **Impact:** Browser back behavior is unpredictable for users navigating with the back button. Compounds with KI-011 (state-driven routing prevents URL sharing/bookmarking) — that KI is already P2 in the active list. KI-132 is the practical user-facing symptom of KI-011.
- **Location:** `useNavigation.ts` — calls `history.pushState` for tab changes inside the SPA. Each push is a new history entry, but they share URL `/`. Browser back unwinds them but the user's mental model expects "back = previous page", not "back = previous tab".
- **Fix direction:** Tied to KI-011 fix — migrate to React Router or TanStack Router so URL becomes source of truth for tab state. Until then: avoid `history.pushState` for tab-internal navigation; use `replaceState` so back button maps to "exit the app", not "previous tab".
- **Severity:** **P3-ROUTING.** Tied to KI-011's broader fix. Not isolated.
- **Status:** **OPEN — P3-ROUTING. Companion to KI-011.**

### KI-133: localStorage key embeds user email in key name — `bidondent_user:<email>` (P3-PRIVACY)

> **Added 2026-05-07 — external audit AI sign-out walkthrough.** Audit AI ran `Object.keys(localStorage)` and observed a key shaped like `bidondent_user:molalign5@gmail.com`. The user's email address is embedded in the key NAME, not just the value. Persists after sign-out (KI-117 territory).

- **Impact:** Anyone with browser debugger access (devtools, shared computer, malicious extension) can scan key names without parsing values and learn the prior user's email. Privacy hardening concern. Lower priority than KI-117's stale-session leak but same general class of post-sign-out residue.
- **Location:** Whatever code writes `bidondent_user:<id>` keys. Likely in the auth/session bridge.
- **Fix direction:** Use a fixed key name (`bidondent_user`) and store the user identifier in the value (JSON). OR: scope to `sessionStorage` so the key dies when the tab closes. OR: hash/UUID the user ID in the key name.
- **Severity:** **P3-PRIVACY.** Low-blast-radius privacy concern. Lower than KI-117 cleanup but companion fix.
- **Status:** **OPEN — P3-PRIVACY.**

### KI-134: Clerk silent re-auth after Sign Out — `__clerk_db_jwt` cookie persists, auto-restores session on next load (P1-SECURITY)

> **Added 2026-05-07 — external audit AI third pass.** After Sign Out + reload, audit AI clicked the Login link and was returned to the dashboard immediately without entering credentials. Investigation confirmed: a lingering `__clerk_db_jwt` cookie was being used by Clerk to silently re-authenticate. The Sign Out flow drops 7 → 4 cookies (3 Clerk session cookies cleared) but `__clerk_db_jwt` survives. **This means Sign Out is not a true session destroy.** Anyone with browser access after a "signed out" state can resume the prior user's session by reloading.

- **Impact:** Real security concern on shared devices. The user's expectation of "Sign Out" is "the next person to use this browser cannot get to my account." Current behavior fails that expectation. Combined with KI-117 (stale localStorage) + KI-133 (email-in-key-name), the post-sign-out residue is substantial.
- **Open question for owner:** Is this **intended** Clerk behavior (long-lived refresh token for "stay signed in" UX) that just isn't being labeled as such? If so, the fix is renaming "Sign Out" to "Switch Accounts" or surfacing a "Forget this device" affordance. If it's NOT intended, the fix is calling Clerk's `signOut({ session: true, application: true })` (or whichever Clerk API destroys the device-level token) on the Sign Out flow.
- **Location:** Clerk integration, sign-out handler. Likely calls `clerk.signOut()` with default options that preserve the device JWT for "remember me" UX.
- **Fix direction:** Two paths depending on owner intent:
  1. **Full destroy:** call `clerk.signOut({ sessionId: ..., redirectUrl: '/' })` plus explicit cookie clear for `__clerk_db_jwt` + `__client_uat`. Forces re-auth on next visit.
  2. **Honest naming:** rename "Sign Out" to "Switch Accounts" + add "Forget this device" link that does the full destroy. Acknowledges the long-lived-session UX.
- **Severity:** **P1-SECURITY.** Owner decides between full-destroy and honest-naming.
- **Status:** **OPEN — P1-SECURITY.** Pairs with KI-117 + KI-133 in the post-sign-out cleanup cluster.

### KI-135: No skip-link for keyboard-only users — first Tab goes to logo, not "Skip to main content" (P2-A11Y)

> **Added 2026-05-07 — external audit AI keyboard tab order audit.** From a fresh load, pressing Tab focuses the BidOnDent logo button. There is no `<a href="#main">Skip to main content</a>` skip-link affordance. Screen reader and keyboard-only users must traverse every sidebar nav item, header bell, and avatar menu before reaching content.

- **Impact:** WCAG 2.4.1 Bypass Blocks — users need a way to skip repeated content. Currently they don't. Compounds with KI-118 (ESC handlers missing) — the keyboard accessibility story has gaps.
- **Location:** App shell layout — likely `src/app/App.tsx` or the dashboard layout root. The skip-link should be the first focusable element on the page, visually hidden until focused.
- **Fix direction:** Add `<a href="#main-content" class="bd-skip-link">Skip to main content</a>` as the first child of `<body>` (or app root). CSS: hidden via `clip: rect(0 0 0 0)` until `:focus`, then renders as a top-left pinned glass pill matching the bd-\* identity. Add `id="main-content"` to the appropriate landmark (likely `<main>`).
- **Severity:** **P2-A11Y.** WCAG 2.4.1 violation. Low-effort fix, ~20 LOC + matching style.
- **Status:** **RESOLVED 2026-05-07 — Pass 68.** Skip-link added as the first child of [`DashboardLayout.tsx`](../src/app/components/app/DashboardLayout.tsx) (`<a href="#main-content" class="bd-skip-link">Skip to main content</a>`) with matching `id="main-content"` + `tabIndex={-1}` on the `<main>` element so the focus actually lands. New `.bd-skip-link` style appended to [`src/styles/theme.css`](../src/styles/theme.css) — visually hidden via `clip: rect(0 0 0 0)` until `:focus`/`:focus-visible`, then renders as a top-left pinned glass pill matching the bd-\* identity (dark + light variants, light variant uses the locked premium gold trim).

### KI-136: Search input + BidOnDent logo button below 44pt touch-target threshold (P2-UX)

> **Added 2026-05-07 — external audit AI touch-target audit.** Audit AI measured every tabbable element on Dashboard. Two elements fall below the WCAG 2.5.5 / Apple HIG 44×44 minimum:
>
> - Search reports input: 260×34 (height short by 10pt)
> - BidOnDent logo button: 148×40 (height short by 4pt)
>
> Both will still be sub-44 at 375 mobile viewport because the heights are typography-driven, not viewport-conditional.

- **Impact:** Fingertip mis-tap risk on mobile. The 9 other elements that flagged in the audit (notification bell, View on map, Delete report, etc.) are exactly 44×44 — they pass. These two are the real misses.
- **Location:**
  - Search input — likely `src/app/components/dashboard/SearchReportsInput.tsx` or similar. Input height is set by font-size + padding; needs `min-height: 44px` or matching padding.
  - Logo button — likely the header logo. Wrapping link/button needs taller hit area.
- **Fix direction:** Add `min-height: 44px` to both elements, or increase vertical padding to satisfy. Ensure the visual design doesn't break when height grows. Logo can keep visual size of 40px but expand the click area via `padding-block: 2px 2px` and `display: inline-flex; align-items: center`.
- **Severity:** **P2-UX.** Real mobile usability hit. Trivial CSS fix.
- **Status:** **RESOLVED 2026-05-07 — Pass 69.** Search wrapper in [`DashboardHeader.tsx`](../src/app/components/app/DashboardHeader.tsx) now has `min-h-[44px]` (was 34px from `py-2` typography). Sidebar logo button in [`DashboardSidebar.tsx`](../src/app/components/app/DashboardSidebar.tsx) now has `min-h-[44px]` (was 40px). The mobile DashboardHeader logo button already had `min-h-[44px]` from a prior pass — no change. Visual layout preserved (button content stays vertically centered; only the click area grew).

### KI-137: Sign Out and Delete Account share the SESSION section — mis-tap risk (P2-UX)

> **Added 2026-05-07 — external audit AI Account tab walkthrough.** The Account → Settings section labeled "SESSION" contains both Sign Out (everyday action) and Delete Account (destructive action) as immediate neighbors. Audit AI's exact words: "putting them next to each other invites mis-tap."

- **Impact:** Real risk. Sign Out is a common action; Delete Account is permanent. Adjacency is dangerous UX.
- **Fix direction:**
  - Move Sign Out to the bottom-left sidebar pill area (one-click, like every other product). Already there in some products' designs.
  - Keep Delete Account in a separate "Danger Zone" section deeper in Settings, with explicit confirmation (type your email, then click).
  - Visual: Delete Account always uses destructive-tone (red trim), Sign Out uses neutral-tone.
- **Severity:** **P2-UX.** Standard SaaS Account-page pattern violation.
- **Status:** **RESOLVED 2026-05-07 — Pass 70.** [`AccountMenu.tsx`](../src/app/components/codelayer/account/AccountMenu.tsx) now splits the two actions across distinct sections: "Session" (Sign Out only) and "Danger Zone" (Delete Account only). Danger Zone is visually separated by `mt-4 border border-rose-500/30`, eyebrow uses `text-rose-400`, and the right-side label reads "Irreversible". Delete Account still routes through [`DeleteAccountModal`](../src/app/components/codelayer/account/DeleteAccountModal.tsx) for the confirmation step. Sidebar one-click Sign Out (the deeper redesign) deferred — current split removes the mis-tap risk without re-architecting the Account screen.

### KI-138: Notification preferences endpoint returns 500 + UI stuck on infinite loading — `notification_preferences` table missing in production (P1-RUNTIME)

> **Added 2026-05-07 — external audit AI pass 4 + pass 4 extended.** Discovered via DevTools Network capture during Appearance Settings modal → Notifications section. Endpoint `https://wmdcnjgtsppftrofaqqa.supabase.co/functions/v1/server/notification-preferences` returns HTTP 500. UI shows "Loading preferences…" with spinner indefinitely (>8s waited). No error toast, no retry, no fallback to defaults.

> **ROOT CAUSE (Supabase MCP audit pass 4 extended):** The `notification_preferences` table **does not exist in production**. The edge handler at `supabase/functions/server/handlers/notification_preferences.ts` queries `from('notification_preferences').select('*').eq('clerk_user_id', ...)`. Postgres returns `42P01 undefined_table`. Handler catches and returns 500. **KI-095's graceful-degradation pattern is not catching it** — the UI infinite-loading state never falls back to defaults. Two bugs in one: server schema gap + client error-handling gap.
>
> **Planner verified independently 2026-05-07** via `execute_sql` on `information_schema.tables`: zero rows for `notification%` patterns in `public` schema (only `public.website_preferences` exists, which is a different table for a different concern).

- **Impact:** User cannot adjust notification preferences via Appearance Settings. Modal renders three working sections (Privacy / Appearance / Language) and one silently-dead section (Notifications). Erodes trust on every visit to Account → Appearance Settings.
- **Fix direction (TWO required, in this order):**
  1. **Owner-action: write + apply notification_preferences migration.** Schema needs at minimum: `clerk_user_id text PRIMARY KEY`, plus boolean preference fields matching the UI (`email_enabled`, `email_bid_updates`, `email_report_updates`, `email_nearby_reports`, `email_estimate_updates`, `sms_enabled`), `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`. Plus RLS policies matching `website_preferences` patterns. Apply via Supabase Studio per `feedback_supabase_cli_pg17`.
  2. **Code-side: fix client error-handling.** Wrap the load handler in try/catch. On failure, render checkboxes with default-on values + small banner "Couldn't load preferences. Using defaults — try again?" + Retry button. Defensive UX even if backend works correctly.
- **Severity:** **P1-RUNTIME.** User-blocking on the Notification Preferences UX. Real backend gap + real client gap.
- **Backend status (2026-05-07 pass 8):** **SCHEMA RESOLVED.** Audit AI applied `apply_migration` via Supabase MCP creating `public.notification_preferences` byte-for-byte from `FALLBACK_PREFERENCES` const (18 cols: `id` text PK with `gen_random_uuid()::text` default, `clerk_user_id` text NOT NULL UNIQUE, 14 boolean preference columns matching the UI, `created_at`/`updated_at` timestamptz). RLS pattern modeled identically on `website_preferences` (`USING(false) WITH CHECK(false)` — server-mediated, edge function service-role bypass only). `set_updated_at` BEFORE UPDATE trigger using `public.handle_updated_at()`. Verification via `information_schema`: table ✓, 18 cols ✓, 2 indexes (PK + UNIQUE auto-index) ✓, RLS enabled ✓, 1 policy ✓, 1 trigger ✓. Initial redundant explicit index on `clerk_user_id` dropped post-create to prevent KI-145-style duplication.
- **Status:** **OPEN — P1-OPS.** Backend gap CLOSED. Client gap CLOSED via Pass 83 (2026-05-07): [`useNotificationPreferences.ts`](../src/app/hooks/useNotificationPreferences.ts) now exposes `isUsingDefaults` + `loadError` + `reload`; [`SettingsModal.tsx`](../src/app/components/codelayer/account/SettingsModal.tsx) renders an amber "Couldn't load saved preferences. Editing local defaults — changes won't persist until reconnected." banner with a Retry button when the initial GET failed. The hook already gracefully fell back to defaults (no infinite spinner), but the user now SEES the degraded state instead of silently editing local-only state. Remaining work: (1) owner deploys edge function v51 per KI-146 (one CLI command — handler at HEAD has graceful-fallback logic and will now find the table created by the Pass 8 migration).

### KI-139: prefers-reduced-motion CSS coverage gap — 40 keyframes vs 23 reduce-motion guards (P2-A11Y)

> **Added 2026-05-07 — external audit AI pass 4 CSS audit.** Counted: 40 `@keyframes` definitions in stylesheets loaded on Dashboard. 23 selectors inside `@media (prefers-reduced-motion: reduce)` blocks. **Coverage gap of up to 17 keyframes.** Pass 56 added missing reduce-guards but addition of new keyframes since (likely Pass 49-59 navigation/coverage work) may have outpaced the contract.

- **Impact:** Vestibular-sensitive users may still experience animation under `prefers-reduced-motion: reduce`. Direct LAW_ANIMATION_AND_ATMOSPHERE §3 violation if confirmed.
- **Approach (audit AI's recommendation):** ~50-LOC Node script that:
  1. Greps `@keyframes <name>` patterns out of `src/styles/*.css`.
  2. Greps `@media (prefers-reduced-motion: reduce)` blocks and the `animation-name` / `animation-duration: 0s` overrides within them.
  3. For each keyframe, verifies a guard exists.
  4. Mismatches → CI failure.
     Add to lint workflow.
- **Severity:** **P2-A11Y.** Verifies LAW §3 contract holds against drift.
- **Status:** **RESOLVED 2026-05-07 — Pass 71.** Added [`scripts/audit-reduced-motion.mjs`](../scripts/audit-reduced-motion.mjs) and `npm run audit:reduced-motion`. Script does a real coverage analysis (not a flat regex count): for every `@keyframes` it identifies the consumer selectors via `animation` / `animation-name` references, then verifies each consumer is also targeted inside a `@media (prefers-reduced-motion: reduce)` block by an animation-disabling rule (or covered by a wildcard reduce rule). Audit AI's "23 vs 40" count was a flat grep — actual coverage today is **34/34 keyframes guarded** (script reports `exit=0`). Script blocks future drift; can be wired into CI.

### KI-140: Mobile Smart Shop Map legend overlay too dense — 5 dots + 6 pills + checkbox + eye icon obscure the map (P2-UX)

> **Added 2026-05-07 — external audit AI pass 5 mobile audit.** At 555×922 viewport, the Smart Shop Map renders a legend overlay containing: 5 category dots (Origin/Selected/Top pick/Reports/Saved/Routes), Routes checkbox, eye-icon toggle, and a 6-pill horizontal status filter row (ALL/PENDING/APPROVED/IN REPAIR/RESOLVED/DONE). The "DONE" pill is visibly clipped at viewport edge. The overlay obscures the actual map.

- **Impact:** Map-first product where the map itself is partially obscured by chrome. Status pills overflow horizontally without visible scrollbar indicator. Adds cognitive load on a small screen.
- **Fix direction:**
  1. Collapse legend to a single pill "Legend (5)" that expands a sheet on tap, mirroring the Apple Maps pattern.
  2. Add scroll-indicator dots/arrows to the status pill row OR convert to a horizontal-scroll segmented control with momentum.
  3. Bonus: the legend overlay should auto-hide after 3s of no interaction, re-show on tap.
- **Severity:** **P2-UX.** Mobile usability hit on a primary surface.
- **Status:** **RESOLVED — Pass 78 (2026-05-07).** [`MapPaneLegendPanel.tsx`](../src/app/components/shop/MapPaneLegendPanel.tsx) now collapses to a single tap-to-expand "Legend" pill (rounded-full, layers icon + chevron) when `density === "compact"` (mobile fullscreen map call sites). Default state is collapsed; users opt in to the full panel + status filter row by tapping. Expanded state gains an inline collapse button (chevron-up) for symmetry. Non-compact (desktop / wider panes) keeps the original always-on layout so power users do not lose density. Map surface is now visible by default on mobile.

### KI-141: Mobile header drops page title — users lose orientation between tabs (P3-UX)

> **Added 2026-05-07 — external audit AI pass 5 mobile audit.** At mobile viewport, the header chrome shows BidOnDent logo (left) + bell + avatar (right). The desktop "Dashboard" / "Bids" / "Account" page title label is removed at mobile. Audit AI: "users lose context of which page they're on."

- **Impact:** Bottom nav shows the active tab via top-edge accent, but the header is silent on context. Users mid-tab may briefly second-guess where they are.
- **Fix direction:** Add small page-title label below logo OR next to avatar at mobile. Either:
  - Static label tied to active tab.
  - Breadcrumb pattern for nested views (e.g., Dashboard › Bids).
- **Severity:** **P3-UX.** Lower priority than KI-140 but a real polish gap.
- **Status:** **RESOLVED — Pass 75 (2026-05-07).** Mobile header now shows the active tab label as a small `font-semibold` span between the logo button and the right-side actions (logo · "Bids" · bell · avatar). Desktop continues to render the larger `<h2>` per [`DashboardHeader.tsx`](../src/app/components/app/DashboardHeader.tsx); the new mobile span is the `md:hidden` twin and stays `truncate` so it never wraps the header.

### KI-142: Mobile Quick Actions row becomes 2-up grid — 3 of 4 actions require scroll to discover (P3-UX)

> **Added 2026-05-07 — external audit AI pass 5 mobile audit.** Dashboard Quick Actions card row is 4-across at desktop, 2-up grid at mobile. With 4 cards total, mobile users see only 2 above the fold; remaining 2 require vertical scroll to reach.

- **Impact:** Discovery gap. New users may never realize "Find Shops" and "Connect Insurance" exist.
- **Fix direction:** Convert to horizontal-scroll carousel at mobile with momentum + scroll indicator. Pattern matches App Store / Apple Music. All 4 cards visible by swipe; first 1.5 cards always above the fold as visual hint.
- **Severity:** **P3-UX.** Discovery polish.
- **Status:** **RESOLVED — Pass 77 (2026-05-07) — VERIFIED ALREADY HORIZONTAL-SCROLL.** Source read of [`HomeScreenSections.tsx`](../src/app/components/codelayer/HomeScreenSections.tsx) lines ~190-260 confirms the Quick Actions row is **already** a horizontal-scroll snap carousel on mobile: `flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide` with `w-[min(15rem,72vw)] shrink-0 snap-start` per tile + a right-edge gold-fade affordance hinting at more content. The grid only kicks in at `sm:grid sm:grid-cols-2 md:grid-cols-4`. Audit AI's "2-up grid at mobile" observation was a misread (likely viewport above the `sm` breakpoint at the moment of capture). No code change required.

### KI-143: Mobile Bids tab shows "Offline · last known" pill — verify intent (P3-VERIFY)

> **Added 2026-05-07 — external audit AI pass 5 mobile audit.** At mobile viewport on Bids tab, audit AI observed an "Offline · last known" pill in the Bid Comparison header. Pill not visible at desktop. Audit AI flags as "either intentional mobile-only feature or a real connectivity issue surfacing."

- **Impact:** Unclear. If intentional offline indicator that's mobile-only by design, low concern (could even be a feature worth promoting to desktop). If an unintended surfacing of stale data, real concern.
- **Fix direction:** Builder verifies in source code whether pill is conditionally rendered on mobile-only OR on offline-state-only. If mobile-only by design, document; if state-only, investigate why it triggered during audit AI's session (was the audit AI offline? or is the pill firing a false positive?).
- **Severity:** **P3-VERIFY.** Investigation pass; severity adjusts after finding.
- **Status:** **RESOLVED — Pass 76 (2026-05-07) — VERIFIED INTENTIONAL, NOT MOBILE-ONLY.** Source read of [`BidsSummaryHeader.tsx`](../src/app/components/codelayer/BidsSummaryHeader.tsx) lines 16-56 confirms the pill is rendered by `getLiveStatusChip(status, isLight)` which switches on `connectionStatus`:
  - `"connected"` → emerald "Live" pill.
  - `"error"` → amber "Reconnecting…" pill.
  - `"disconnected"` → slate "Offline · last known" pill.
  - `"idle"` → hidden (seed/demo report or no active subscription).

  There is no mobile-only branch — the pill renders identically on every viewport whenever the realtime channel reports disconnected. Audit AI's session was either offline or the realtime channel was genuinely disconnected at the moment of capture. Behavior is correct and intentional. No code change required.

### KI-144: Supabase advisor lint cluster — 13 security + 198 performance lints (P3-INFRA, batched)

> **Added 2026-05-07 — external audit AI pass 4 extended Supabase MCP audit.** Captured production advisor lints. Quantified, with concrete remediations.

- **Security lints (13):**
  - INFO × 4: RLS-enabled-no-policy on `estimate_requests`, `job_assignments`, `kv_store_85e96b22`, `kv_store_9f243523`. Currently locked (deny-by-default). If admin-only intentional, OK; otherwise needs policies.
  - WARN × 4: `function_search_path_mutable` on `requesting_clerk_user_id`, `safe_auth_uid`, `handle_updated_at`, `update_updated_at_column`. Real security risk — set `SET search_path = public` on each function.
  - WARN × 4: `rls_policy_always_true` (overly permissive). Three intentional public-form INSERT funnels (`shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`); one suspicious (`kv_store_baa15238` ALL with USING + WITH CHECK true bypasses RLS entirely).
  - WARN × 1: `auth_leaked_password_protection` disabled — Supabase Auth's HaveIBeenPwned check is OFF. Trivial enable in Studio.
- **Performance lints (198):**
  - WARN × 102: `multiple_permissive_policies` — many tables have multiple RLS policies for same action+role. Slow at scale.
  - INFO × 69: `unused_index` — drop never-used indexes.
  - WARN × 21: `auth_rls_initplan` — RLS policies re-evaluating `auth.uid()` per row. Standard fix: wrap in `(SELECT auth.uid())`.
  - INFO × 3: `unindexed_foreign_keys`.
  - WARN × 2: `duplicate_index` — `kv_store_85e96b22` has 4 IDENTICAL indexes; drop 3.
  - INFO × 1: `auth_db_connections_absolute` — Auth server connection-config style.
- **Highest-leverage fixes (planner-recommended order):**
  1. Drop 3 of 4 duplicate `kv_store_85e96b22` indexes (zero-risk perf win).
  2. Enable HaveIBeenPwned in Studio (zero-risk security win).
  3. Set `search_path` on 4 functions (write migration).
  4. Audit `kv_store_baa15238` always-true policy (intentional or bug?).
  5. Wrap `auth.uid()` calls in `(SELECT auth.uid())` across 21 RLS policies.
- **Severity:** **P3-INFRA, batched.** None launch-blocking. Drop-3-duplicate-indexes is the cleanest SQL win — safe for audit-AI fix-authority.
- **Status:** **OPEN — P3-INFRA, batched.** Owner-action surface for the security wins; builder-AI write migration for `search_path` fix.

### KI-145: Drop 3 duplicate indexes on `kv_store_85e96b22` (RESOLVED 2026-05-07)

> **Added 2026-05-07 — external audit AI pass 6 safe-fix.** Resolved same-day under owner-granted fix-authority for safe SQL data corrections / cleanup. Splits from KI-144 batch as the cleanest-leverage win that's worth its own RESOLVED record for the audit trail.

- **Impact:** `public.kv_store_85e96b22` had 4 byte-identical btree indexes on `(key text_pattern_ops)` + a PK index using a different operator class. Wasted disk + write amplification on every kv-store mutation.
- **Resolution (2026-05-07):** External audit AI verified all 4 `kv_store_85e96b22_key_idx*` indexes were byte-identical via `pg_indexes` query, then dropped 3 redundant via Supabase MCP:
  ```sql
  DROP INDEX IF EXISTS public.kv_store_85e96b22_key_idx1;
  DROP INDEX IF EXISTS public.kv_store_85e96b22_key_idx2;
  DROP INDEX IF EXISTS public.kv_store_85e96b22_key_idx3;
  ```
- **Verification:** Planner-AI confirmed independently 2026-05-07 via `execute_sql` against `pg_indexes`: table now has exactly 2 indexes (`kv_store_85e96b22_pkey` + `kv_store_85e96b22_key_idx`). Five → two indexes, zero behavior change, pure perf cleanup.
- **Status:** **RESOLVED 2026-05-07.** Move to RESOLVED archive on next docs hygiene pass.
- **Skill:** None — pure DB cleanup; safe-fix authority precedent extended.

### KI-146: KI-138 graceful-degrade fix code already written but not deployed (P1-OPS, owner-action)

> **Added 2026-05-07 — external audit AI pass 6 GitHub source read.** Audit AI inspected `supabase/functions/server/handlers/notification_preferences.ts` at HEAD via signed-in GitHub browser tab. Discovered the KI-138 graceful-degrade fix is **already committed in the source repo** at commit `0df5d4c` ("fix(notifications): F-04 — graceful fallback + diagnostic logging"). The handler has `FALLBACK_PREFERENCES` const (16 columns) + `isPersistenceUnavailable(error)` checking Postgres codes 42P01/42501/0LP01 + HTTP 200 fallback response on schema-missing errors.

- **Impact:** Production server function is at v50 (per audit AI Supabase MCP). The fix is at HEAD on main but not deployed. This means **one `supabase functions deploy server` command would fix the KI-138 UI infinite-loading symptom immediately, even before the migration lands**. Schema-side fix is still required for full resolution but UX fix is one command away.
- **Captured FALLBACK_PREFERENCES schema (16 columns)** — informs the migration owner needs to write:
  - `id text DEFAULT ''` (UUID-shaped in real rows; consider `text PRIMARY KEY DEFAULT gen_random_uuid()::text` per `feedback_supabase_cli_pg17`)
  - `clerk_user_id text NOT NULL` (with UNIQUE constraint or PK if id is generated)
  - `in_app_bid_updates boolean DEFAULT true`
  - `in_app_report_updates boolean DEFAULT true`
  - `in_app_nearby_reports boolean DEFAULT true`
  - `in_app_estimate_updates boolean DEFAULT true`
  - `email_bid_updates boolean DEFAULT true`
  - `email_report_updates boolean DEFAULT true`
  - `email_nearby_reports boolean DEFAULT true`
  - `email_estimate_updates boolean DEFAULT true`
  - `sms_bid_updates boolean DEFAULT false`
  - `sms_report_updates boolean DEFAULT false`
  - `email_enabled boolean DEFAULT true` (master toggle)
  - `sms_enabled boolean DEFAULT false` (master toggle)
  - `share_data_with_shops boolean DEFAULT true` (privacy)
  - `show_profile_to_insurers boolean DEFAULT false` (privacy)
  - Plus implicit `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
- **Code comment lineage:** handler line 14 references "Mirrors the DEFAULT clauses in migration 20251230000001_full_schema.sql §3.17" — section either was never added to the migration file or was added but never applied to prod.
- **Owner action sequence (in order):**
  1. `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa` — deploys v51 with graceful-degrade. UI UX fixes immediately.
  2. Write fresh migration `supabase/migrations/<TS>_create_notification_preferences.sql` with the 16-column schema above + RLS policies matching `website_preferences` patterns.
  3. Apply migration via Supabase Studio per `feedback_supabase_cli_pg17`.
  4. Verify: `curl -H "Authorization: Bearer <jwt>" https://<project>.supabase.co/functions/v1/server/notification-preferences` returns `{preferences:{...},success:true}` (NOT `fallback:true`).
- **Status:** **OPEN — P1-OPS.** Owner-action: deploy edge function v51 + write/apply migration. Splits from KI-138 because the deploy is one-command and unblocks UX without the schema work.

### KI-147: Fullscreen map mode itself does not exit on ESC (P2-A11Y, KI-118 cluster expansion)

> **Added 2026-05-07 — external audit AI pass 6 Smart Shop Map fullscreen test.** Audit AI tapped 4-corner expand button at mobile, entered fullscreen map mode. Verified: bottom nav remains accessible (✓), legend overlay auto-declutters (✓), back-arrow exits fullscreen (✓). **ESC key does NOT exit fullscreen.** Same KI-118 sheet-pattern issue extended to the fullscreen-map overlay surface.

- **Impact:** Keyboard-only users have only the back-arrow as exit. Standard "ESC closes overlay" pattern broken at the fullscreen-map level too.
- **Fix direction:** Same `useEscapeToClose(open, onClose)` hook proposed for KI-118 — apply to the fullscreen-map exit handler. Should be 6th application site after Voice Controls + Navigation Settings + Turn List drawer + Results drawer + (one more sheet to verify).
- **Severity:** **P2-A11Y.** Companion to KI-118 cluster.
- **Status:** **RESOLVED — Pass 81 (2026-05-07).** Wired the existing `useEscapeKey` hook (Pass 63) into [`ShopDirectoryScreen.tsx`](../src/app/components/shop/ShopDirectoryScreen.tsx) at the top level — gated by `session.isImmersive`, calls `setMapViewMode("hybrid")` on ESC, mirrors the on-screen back-arrow behavior. KI-118 cluster now covers Voice Controls + Navigation Settings sheets (Pass 63) AND the immersive fullscreen-map surface itself (this pass). Sheet-level overlay sheets that mount inside the immersive layer continue to use their own ESC handling (sheets stop-propagate before the screen-level handler fires) so closing a Voice Controls overlay no longer drops the user out of fullscreen by accident.

### KI-148: Fullscreen map entry triggers a SECOND phantom deviation event (P1-RUNTIME, KI-116 cluster expansion)

> **Added 2026-05-07 — external audit AI pass 6 fullscreen test.** Beyond the persistent off-route banner (KI-116), audit AI observed that **entering fullscreen map mode triggers a NEW phantom deviation event** — a second "Off route" pill (yellow warning + dismiss-X) appears top-right when transitioning into fullscreen. So the deviation engine fires not just on initial mount but ALSO on viewport-mode transitions.

- **Impact:** Confirms the deviation engine is mounted at multiple call sites, each firing on its own lifecycle event. Strengthens KI-116 fix scope: builder needs to gate ALL `intelligence.evaluate()` call sites, not just one.
- **Fix direction:** Same as KI-116 root cause fix. This finding adds a regression-test requirement to Pass 61: enter fullscreen map without an active session, verify no new deviation event fires.
- **Status:** **RESOLVED-DEPENDENT — Pass 81 (2026-05-07).** With KI-116 RESOLVED via Pass 61's `intelligence.evaluate(snapshot)` gate on `navSession.session.status === "active"` at the single call site in [`useNavigationLifecycleEffects.ts`](../src/app/hooks/useNavigationLifecycleEffects.ts), the deviation engine no longer fires from any mount site without an active nav session. Fullscreen-map entry on the immersive surface is just another mount of the same call site, so the second phantom event cannot reproduce. If a future regression re-introduces deviation toasts during fullscreen entry without an active session, re-open with explicit viewport-transition guard work — the underlying mount-time evaluation guard is at the call site, not at the surface boundary.

### KI-149: "Previous session restored" toast fires on every page load — visual confirmation of KI-134 silent re-auth (P3-UX)

> **Added 2026-05-07 — external audit AI pass 6 page-load observation.** A "Previous session restored" toast renders on every page load, including post-sign-out + reload. Visible artifact of KI-134's `__clerk_db_jwt` silent re-auth.

- **Impact:** The toast itself acknowledges the silent re-auth to the user. This is honest but normalizes the behavior. Either:
  - The toast IS the design intent ("we remembered you across sessions") — in which case the Sign Out copy should be honest about this ("Switch Accounts" rename per KI-134 option 2), AND the toast can stay.
  - The toast is a leak — in which case it should be suppressed AND KI-134 should ship full-destroy semantic (option 1).
- **Fix direction:** Tied to KI-134 owner decision. If "Switch Accounts" rename: replace toast copy with "Welcome back, Molalign" (one-time per cold session, not on every reload). If full-destroy: suppress toast post-sign-out flow.
- **Severity:** **P3-UX.** Companion to KI-134; ships in same pass.
- **Status:** **OPEN — P3-UX.**

### KI-150: PWA service worker exists in repo `public/` but not registered in dev — KI-130 likely RESOLVED at production (P3-VERIFY)

> **Added 2026-05-07 — external audit AI pass 6 GitHub repo browse.** Audit AI noted "Pass 829 added PWA service worker + manifest + offline shell in repo's public/ folder (last month)". Browser shows `navigator.serviceWorker.controller === null` because Vite dev server doesn't register SW. Production likely does.

- **Impact:** KI-130 was filed as P3-INFRA "no service worker registered". Audit AI's source-side finding suggests the SW exists; only dev-mode render is unregistered.
- **Verification needed:** Builder confirms via `vite preview` build OR owner Lighthouse run captures whether `navigator.serviceWorker.controller` is non-null in production-mode.
- **Status:** **RESOLVED — Pass 76 (2026-05-07) — VERIFIED REGISTERED AT PROD.** Source read of [`vite.config.ts`](../vite.config.ts) lines 13-62 confirms `VitePWA({ registerType: "autoUpdate", … })` is wired with manifest + workbox runtime caching for Supabase API + map tiles. `vite-plugin-pwa` injects the SW registration script automatically at build time; the dev server intentionally skips it (Vite's standard behavior to avoid SW caching during HMR). Therefore `navigator.serviceWorker.controller === null` in dev is expected, and the SW registers normally on the deployed build. KI-130 closed at source; no further action.

### KI-151: Repo "Security and quality" GitHub tab shows 2 active alerts (P3-INVESTIGATE)

> **Added 2026-05-07 — external audit AI pass 6 GitHub repo browse.** Audit AI saw 2 active alerts in the repo's Security tab header. Not investigated this pass (out of scope).

- **Impact:** Unknown until investigated. Could be:
  - Dependabot vulnerability alert (npm package CVE)
  - CodeQL static analysis finding
  - Secret scanning hit (false positive most likely)
- **Fix direction:** Owner reviews via `gh pr` or GitHub UI. Each alert has its own remediation per type.
- **Status:** **OPEN — P3-INVESTIGATE.** Owner-action.

### KI-152: 🚨 Supabase Service Role JWT publicly leaked in repo since 2026-02-10 (P0-SECURITY)

> **Added 2026-05-07 — external audit AI pass 7 GitHub Security tab investigation.** GitHub Secret Scanning has flagged a Supabase Service Key in the public repo at `.env:4` since 2026-02-10 (~3 months exposure). Service Role JWTs bypass Row-Level Security entirely; whoever holds the key has full read/write to every table regardless of RLS.

- **Impact (worst-case assumption):** Anyone who indexed the public repo since 2026-02-10 (search engines, automated scrapers, bad actors) may hold the leaked key. RLS protections are moot for service-role calls — every table is fully readable AND writable by the holder. PII (clerk_user_id, profile data, vehicles, damage reports, bids) all accessible.
- **REQUIRED OWNER ACTIONS (in this exact order, today):**
  1. **ROTATE the Service Role Key NOW.** Supabase Dashboard → Project `wmdcnjgtsppftrofaqqa` → Settings → API → "Service Role Key" → Regenerate. Old key is revoked at the moment you click Regenerate. **Anything currently using the old key will break** — CI/CD, Vercel env vars, GitHub Actions secrets, local `.env.local`, and any deployment configs all need the new key before they can call Supabase again.
  2. **Audit Supabase logs for the past 90 days** for `service_role` API calls from unfamiliar IPs/origins. Run via Supabase MCP `get_logs(service: "api")` filtered to `role=service_role` if possible, OR via Studio → Logs Explorer.
  3. **Update all consumers** of the old key: every `.env*` file on dev machines, Vercel project env vars, GitHub Actions repository secrets, any cron job, any worker, any Studio integration, edge function secrets (`supabase secrets set`), etc.
  4. **Verify `.env` is gitignored** going forward. The leak proves the file was committed at some point.
  5. **Optional: rewrite git history** to scrub the old key from public repo. GitHub's official guidance: "rotation is sufficient — rewriting public history is high-risk and key value is already compromised regardless." Skip unless owner wants belt-and-suspenders.
- **Severity:** **P0-SECURITY.** Highest priority of any owner-action across the entire audit chain. Gates every other shipping decision until rotation completes.
- **Status:** **OPEN — P0-SECURITY.** Owner-action only. Builder cannot help; audit-AI cannot help (rotation is dashboard-only).

### KI-153: GitHub Actions ci.yml missing `permissions:` block — CodeQL Medium alert (P2-INFRA)

> **Added 2026-05-07 — external audit AI pass 7 GitHub Security tab investigation.** GitHub CodeQL flagged `.github/workflows/ci.yml:15` for "Workflow does not contain permissions" (Medium severity). Default `GITHUB_TOKEN` has read+write to everything, expanding blast radius if a third-party action is compromised.

- **Impact:** Standard supply-chain hardening. Real, low-effort.
- **Fix direction:** Add a top-level `permissions:` block to ci.yml. Minimum viable:
  ```yaml
  permissions:
    contents: read
    pull-requests: read
  ```
  Then add specific elevations only on jobs that need them (e.g. `permissions: { contents: write }` on a release job). ~5 LOC.
- **Severity:** **P2-INFRA.** Joins Phase 3 polish bundle.
- **Status:** **RESOLVED — Pass 74 (2026-05-07).** Added top-level `permissions: { contents: read, pull-requests: read }` block to [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) between the `concurrency:` and `jobs:` sections. Build-and-test job only checks out, installs, formats, tests, and builds — no write-side calls — so the minimum-viable scope is sufficient. CodeQL alert should clear on next workflow run.

### KI-144 sub-items partially RESOLVED (search_path lock applied — 4 of 14 sub-items)

> **Update 2026-05-07 — external audit AI pass 7 safe-fix.** Verified 4 functions only reference built-in PostgreSQL primitives (NOW, current_setting, nullif) via `pg_get_functiondef(p.oid)` query. Safe to lock. Applied via Supabase MCP:
>
> ```sql
> ALTER FUNCTION public.handle_updated_at() SET search_path = public;
> ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
> ALTER FUNCTION public.requesting_clerk_user_id() SET search_path = public;
> ALTER FUNCTION public.safe_auth_uid() SET search_path = public;
> ```
>
> Re-ran security advisors: 13 lints → 9 lints. The 4 `function_search_path_mutable` WARNs are now cleared.
>
> Remaining 9 advisors all need owner intent (RLS policy decisions, mass `auth.uid()` rewrap, unused-index intent).

### KI-138 backend CLOSED — `notification_preferences` table created (PARTIAL RESOLUTION 2026-05-07, edge deploy still pending)

> **Status update 2026-05-07 — external audit AI pass 8 applied + planner-AI verified.** Backend gap of KI-138 is now closed. UI-side full resolution still requires KI-146 (deploy server edge function v51).

- **What audit AI applied via Supabase MCP `apply_migration`:** Created `public.notification_preferences` with the 16-column schema captured byte-for-byte from `FALLBACK_PREFERENCES` const at `supabase/functions/server/handlers/notification_preferences.ts` (commit `0df5d4c`). Plus `created_at` + `updated_at timestamptz DEFAULT now()`. RLS modeled exactly on `website_preferences` pattern: `ENABLE ROW LEVEL SECURITY` + single policy `FOR ALL USING (false) WITH CHECK (false)` (server-mediated only — service role bypasses, no client-direct access). Trigger `set_updated_at BEFORE UPDATE EXECUTE FUNCTION handle_updated_at()`. Two essential indexes (PK on `id` + UNIQUE on `clerk_user_id`).
- **Planner verified independently 2026-05-07** via `information_schema` query: table exists ✓, 18 columns ✓, 1 RLS policy ✓, 2 indexes ✓, RLS enabled ✓.
- **Watch-out for future migrations** (audit AI pass 8 §C): the migration's `CREATE TRIGGER ... EXECUTE FUNCTION public.handle_updated_at()` syntax wiped the function's `SET search_path = public` lock (KI-144 regression). Audit AI re-applied. Planner verified the lock had regressed AGAIN on second observation; planner re-applied. **Master plan must include rule:** any migration touching `handle_updated_at` / `update_updated_at_column` ends with all four `ALTER FUNCTION ... SET search_path = public` statements as belt-and-suspenders.
- **Remaining work:** Owner runs `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa` (per KI-146). Once v51 lands, the handler reads from the new table, persists real preferences, no fallback path needed. Appearance Settings → Notifications UX fully unblocked.
- **Status:** **PARTIAL RESOLUTION 2026-05-07 — backend CLOSED, edge deploy pending.** KI-138 stays OPEN until KI-146 deploys.

### KI-152 service-role log audit — 100-event window CLEAN (P0-SECURITY rotation still required)

> **Status update 2026-05-07 — external audit AI pass 8 service-role log audit.** 100 most-recent api log events sampled. Every event has user-agent `Deno/2.1.4 (variant; SupabaseEdgeRuntime/1.74.0)` — legitimate Supabase Edge Runtime traffic. Status codes: all 200. No external IPs, no DROP/TRUNCATE/UPDATE-WHERE-1=1 patterns, no high-frequency bursts, no mass-SELECT. Traffic distribution matches expected per-user scoping (`clerk_user_id=eq.user_<id>` filters).

- **Caveat:** absence of evidence ≠ evidence of absence. The 100-event window covers ~3 seconds; the leak window is 90+ days. Owner runs Studio Logs Explorer with a 90-day filter for full-window proof.
- **Status update only — KI-152 itself stays OPEN** as P0-SECURITY pending owner key rotation. Visible-window audit clean is a small comfort; rotation is still mandatory.

### KI-154: Google OAuth `disallowed_useragent` blocks "Sign in with Google" in VS Code's Simple Browser (P3-DEV-EXPERIENCE — MITIGATED 2026-05-07)

> **Added 2026-05-07 — Pass 170 mitigation.** Google's "Use secure browsers" policy rejects OAuth requests from embedded browsers / WebViews / Electron-based shells. VS Code's Simple Browser (vscode-browser) qualifies as embedded. The "Sign in with Google" button inside the Clerk-hosted modal redirects to `accounts.google.com/signin/oauth/...` which detects the embedded UA and returns:
>
>     Error 403: disallowed_useragent
>     "Clerk's request does not comply with Google's policies"
>
> This is **NOT a BidOnDent code bug**. Same policy applies to every OAuth client. Real Chrome / Firefox / Safari work normally — owner confirmed external Chrome works ("Chrome audit AI works").

- **Impact (dev-only):** Developers iterating in VS Code's Simple Browser can't test Google sign-in flows without context-switching to a separate Chrome window.
- **Mitigation (Pass 170):** Dev-mode banner detects embedded browser via UA pattern matching (`Electron/`, `wv)`, `VSCode`, `Code/`, `Simple Browser`) and surfaces two workarounds:
  1. Open `localhost:5173` in a real Chrome window (full OAuth works).
  2. Append `?demo=customer` or `?demo=shop` to bypass Clerk entirely (synthesized data; pre-existing dev-mode in `App.tsx:464-468`).
  Banner is dismissable + persisted via `localStorage.bidondent.dev.embedded-browser-banner.dismissed`.
- **Files (Pass 170):**
  - New: `src/app/utils/embeddedBrowserCheck.ts` — UA detection + describe helper
  - New: `src/app/components/dev/EmbeddedBrowserBanner.tsx` — top-of-viewport banner, gated on `import.meta.env.DEV` + `isEmbeddedBrowser()`
  - Modified: `src/app/App.tsx` — banner wired inside ClerkProvider
- **Production cost:** ZERO. Vite tree-shakes the entire banner component when `import.meta.env.DEV` is `false`. No bundle weight, no runtime check, no UA sniffing in prod.
- **Severity:** **P3-DEV-EXPERIENCE — MITIGATED.** Code-side cannot fully resolve Google's policy; banner is the right human-facing fix. Move to RESOLVED archive on next docs hygiene pass.
- **Status:** **MITIGATED 2026-05-07** — banner shipped Pass 170. Full OAuth still requires real Chrome.

### KI-155: Nav sidebar overlaps wizard headings at 1280-1422 desktop widths (P1-LAYOUT)

> **Added 2026-05-07 — external audit AI Pass 9 §1.1 Report flow walkthrough.** Confirmed via `elementFromPoint(245, 200)` returning a NAV BUTTON (`.group w-full flex items-center gap-3 px-3.5 py-2.5`) instead of the wizard's H2 heading. The wizard's `bd-report-section` left edge sits at x=245 while the persistent left nav sidebar's right edge sits at x=275. **30px overlap — first 8 characters of every wizard heading are hidden behind the nav buttons.**
>
> Examples observed at ~1422px viewport:
> - Step 4 heading "Add damage photos" rendered as "ge photos" (first 8 chars behind nav).
> - Step 3 helper text and Step 2 heading similarly clipped.
> - Step 1 NOT affected — saved-vehicle picker has different positioning that lands clear of the sidebar.

- **Impact:** Significant content invisibility at common laptop widths (1280-1422px viewport, common for 13" MacBooks). Users see truncated headings on Steps 2, 3, 4, 5 and may misread the wizard.
- **Location:** Wizard panel (`bd-report-section`) margin / max-width vs persistent left nav sidebar. Likely a missing `lg:ml-N` or a `max-w-` ceiling that doesn't account for the sidebar's width. Builder verifies via DevTools.
- **Fix direction:** Two paths:
  1. **Push wizard right** — add `md:ml-{sidebar-width}` to the wizard's outer container OR ensure the parent flex container reserves the sidebar's width.
  2. **Shrink wizard panel** — apply `max-w-{N}` so the wizard fits within the available content area outside the sidebar.
  Path 1 is preferred (preserves wizard width). Single-file fix expected.
- **Severity:** **P1-LAYOUT.** Real user-facing content invisibility on common viewports.
- **Status:** **OPEN — P1-LAYOUT.** Targeted Pass 171 (this turn).

### KI-156: Report flow Step 4 inconsistent photo labeling — Photo 1 no caption / Photo 2 "Cloud photo" (P3-FUNCTIONAL)

> **Added 2026-05-07 — external audit AI Pass 9 §1.1.** Both uploaded photos rendered, but only Photo 2 had a caption ("Cloud photo"); Photo 1 had no caption. Inconsistent treatment.

- **Impact:** Mild polish gap. Either both photos should show caption affordance or neither. Users may not understand the labeling.
- **Fix direction:** Audit the photo-rendering component; pick one model (always show caption affordance OR never). Surgical 1-file fix.
- **Severity:** **P3-FUNCTIONAL.** Polish.
- **Status:** **OPEN — P3-FUNCTIONAL.**

### KI-157: Wizard step transitions take 3-5 seconds for opacity fade — perceived sluggishness (P3-UX)

> **Added 2026-05-07 — external audit AI Pass 9 §1.1 capture artifact analysis.** Audit AI initially mistook step transitions for "ghosted UI" because the opacity fade-in is so slow (~3-5s) that intermediate captures show partially-visible content. Real users would perceive the wizard as sluggish.

- **Impact:** Each forward navigation through the wizard feels slow. Compounds with KI-128 photo-required gating (no Skip) — users feel stuck.
- **Fix direction:** Locate the transition CSS or framer-motion easing. Reduce duration from 3-5s to 200-400ms (matches the entrance-animation loop pattern Pass 151-169 uses: `duration-200`). Verify reduce-motion contract still holds.
- **Severity:** **P3-UX.** Polish; user-perception bug.
- **Status:** **OPEN — P3-UX.**

### KI-126: REFINED 2026-05-07 — likely already-resolved

> **Status update 2026-05-07 — Pass 9 §1.1 verification.** External audit AI confirmed Step 1 desktop two-column-grid renders cleanly at 1280, 1422, 1725 px viewport widths. The empty-state overflow originally reported was **the same screenshot-capture artifact** that briefly showed wizard heading "clipping" — when audit AI walked through with proper waits, all wizard step layouts render correctly at those widths.
>
> KI-126 may already be RESOLVED by the 142 unpushed commits + Phase 2 work that landed earlier in this autopilot chain (Pass 63 onwards). Verification commit reference unknown — flagged for next docs hygiene pass to confirm + archive.
>
> The "first 8 chars hidden" issue from this turn IS NOT KI-126 (empty-state overflow) — that was KI-155 (nav-sidebar overlap), a distinct layout bug. KI-126 stays OPEN until a code-side commit reference can be cited that explicitly closes it; if none, demote to MITIGATED-VERIFIED-CLEAN-IN-AUDIT.

### KI-101: Audit Pass 9 §1.1 confirms FULL propagation end-to-end (status update — RESOLUTION reaffirmed)

> **Status update 2026-05-07 — Pass 9 §1.1 full walkthrough.** Audit AI walked Customer Report flow Step 1 → Step 5 (final). KI-101 propagation verified at:
>
> 1. Dashboard "Repair Activity" list — shows "2021 Toyota Camry" ✓
> 2. Step 1 saved-vehicle picker — both pills show "2021 Toyota Camry" + "2014 Mazda Mazda6" ✓
> 3. Step 1 "Use" button — populates `make=Toyota`, `model=Camry`, `year=2021` (no "Toyoto" leak) ✓
> 4. Wizard structure REVEALED: there is NO Step 5 Review surface. Steps are: 1 Vehicle / 2 Damage zone / 3 Location / 4 Photos / 5 Description + Submit. No separate "confirm all inputs" page. Vehicle data goes Step 1 → DB on Submit. **No additional client-side render path needs the fix to extend.**
>
> **The load-bearing question that gated planner-AI's master plan across 8 audit passes is RESOLVED: KI-101 database fix is fully sufficient. No Step 5 client-render fix needed.** Master builder plan can dispatch Phase 2 + Phase 5 with full confidence in this KI's RESOLVED stamp. Move to RESOLVED archive on next docs hygiene pass.

### KI-155/156/157 status-correction 2026-05-07 — code review contradicts audit AI evidence

> **Update 2026-05-07 — planner-AI follow-up code review.** Master builder reviewed source for the three §1.1 new findings and discovered code-side evidence that contradicts audit AI's browser observations. Each is downgraded pending real-Chrome reproduction.

- **KI-155 (nav-sidebar overlap):** [`DashboardLayout.tsx:143-167`](../src/app/components/app/DashboardLayout.tsx#L143) places `DashboardSidebar` and the main content column as flex-row siblings (`<div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-x-hidden">`). [`DashboardSidebar.tsx:53`](../src/app/components/app/DashboardSidebar.tsx#L53) uses `md:w-72 md:sticky md:top-0` (288px wide, sticky positioning, NOT fixed). In a flex-row layout, the main column starts AT the sidebar's right edge (~288px) and the wizard inside `<main>` cannot overlap the sidebar mathematically. Audit AI's `elementFromPoint(245, 200)` returning a NAV BUTTON is hard to reconcile with these measurements. **Hypothesis:** screenshot-capture coordinate system at audit AI's tool maps differently than CSS pixels (audit AI noted at one point "viewport is 1725 wide, screenshot is 1518 wide"). DOM-side measurements showed `H3.left=422` cleanly inside the form panel.
- **KI-156 (photo labeling):** [`StepPhotos.tsx:120-124`](../src/app/components/codelayer/report/StepPhotos.tsx#L120) renders `{isCloud ? "Cloud photo" : "Local photo"}` — a ternary that ALWAYS produces a caption. There is no code path where Photo 1 has no caption. Audit AI may have missed Photo 1's "Local photo" caption visually.
- **KI-157 (slow wizard transitions):** [`ReportScreen.tsx:291`](../src/app/components/codelayer/ReportScreen.tsx#L291) declares `transition={{ duration: reduceMotion ? 0 : 0.22 }}` — that's 220ms with proper reduce-motion gate. NOT 3-5 seconds. The "ghosted UI" audit AI saw was likely tool-side render lag.
- **Status all three:** **NEEDS-REPRODUCTION-IN-REAL-CHROME.** Pause without committing fix. Owner or audit AI verifies in real Chrome (NOT VS Code Simple Browser per KI-154) by sizing window to 1280-1422 px exactly + opening Report flow Step 4 + measuring with DevTools Elements panel. If reproducible, rotate KIs back to OPEN with concrete repro steps. If not, archive as audit-tool artifacts.

### KI-158: handle_updated_at search_path lock wiped on every edge function cold start (P2-SECURITY-DRIFT — SOURCE-PATCHED 2026-05-07)

> **Added 2026-05-07 — audit AI Pass 9 §2 ROOT CAUSE TRACED + master builder Pass 174 source-patched same turn.**
>
> Audit AI Pass 9 §2 confirmed `function_search_path_mutable` advisor returned on `public.handle_updated_at` even after Pass 7 ALTER FUNCTION + Pass 8 re-application. Hypothesized recurring cold-start bootstrap rewrite. Master builder Pass 174 traced root cause to [`supabase/functions/server/database_init.tsx:56-63`](../supabase/functions/server/database_init.tsx#L56) — the edge function bootstrap reissues `CREATE OR REPLACE FUNCTION public.handle_updated_at()` on every cold start without `SET search_path = public`, wiping the lock.

- **Pattern (decay loop):**
  1. Pass 7 / Pass 8 / Pass 9 §2 / [audit AI 'Testing BidOnDent website locally'] applies `ALTER FUNCTION ... SET search_path = public`
  2. Edge function cold start fires `database_init.tsx` bootstrap
  3. `CREATE OR REPLACE FUNCTION public.handle_updated_at()` (without `SET search_path` clause) wipes the lock
  4. Advisor flags `function_search_path_mutable` again
  5. GOTO 1
- **Pass 174 source patch (this turn — master builder):**
  1. `supabase/functions/server/database_init.tsx:56-63` — append `SET search_path = public` inside the `CREATE OR REPLACE` clause. **Load-bearing fix.** Survives future cold starts.
  2. `supabase/migrations/20251230000001_full_schema.sql:22-28` — same patch in the canonical schema migration for source-of-truth correctness.
  3. `ALTER FUNCTION public.handle_updated_at() SET search_path = public` re-applied via Supabase MCP **as immediate stopgap** until owner deploys edge function v51. Verified: `proconfig: ["search_path=public"]`.
- **Owner action required:** deploy edge function v51 (`supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa`). After deploy, next cold start preserves the lock; no more drift. Source patch is committed in this pass; deploy is the gating step.
- **Severity:** **P2-SECURITY-DRIFT — SOURCE-PATCHED 2026-05-07.** Stopgap lock holds today; permanent fix lands when edge function v51 deploys.
- **Status:** **OPEN — pending owner edge function deploy.** Auto-resolves on deploy. Cross-AI handoff: `[Testing BidOnDent website locally — Pass 9 §2]` traced; `[planner-AI Pass 174]` patched.

### KI-159: auth_rls_initplan family — ~21 RLS policies re-evaluating auth.uid() per row (P2-PERFORMANCE — AUTHORIZED for next pass)

> **Added 2026-05-07 — audit AI Pass 9 §2 backend audit refresh.** Every RLS policy on `profiles`, `vehicles`, `damage_reports`, `shop_profiles`, `insurer_profiles`, `bids` calls `auth.uid()` (or `auth.role()` / `current_setting()`) directly in USING/WITH CHECK expressions. Postgres re-evaluates per row; wrapping in `(select auth.<fn>())` evaluates once per query. Pure perf win, zero semantic change, well-documented Supabase pattern.

- **Impact:** ~21 advisor warnings; real perf cost at scale on auth-heavy paths (vehicles, damage_reports, bids queries).
- **Fix direction:** single transaction with `ALTER POLICY ... USING/WITH CHECK ((select auth.uid()))` wrapping. **MUST verify exact policy bodies via `pg_get_expr(polqual, polrelid)` + `pg_get_expr(polwithcheck, polrelid)` BEFORE applying** — the names alone don't capture the full expression. Audit AI staged candidate SQL in their Pass 9 §2 report.
- **Authorization:** **AUTHORIZED for audit AI to ship next pass under safe-fix authority precedent (KI-145, KI-144 search_path).** Verification gate: `pg_get_expr` reads first to lock exact expressions; same-shape `(select ...)` wrapper applied; single transaction; reversible via dropping the wrapper.
- **Severity:** **P2-PERFORMANCE.**
- **Status:** **OPEN — AUTHORIZED for next audit-AI pass.**

### KI-160: multiple_permissive_policies — ~25 duplicate RLS policy pairs causing ~110 advisor warnings (P2-PERFORMANCE — PARTIAL AUTHORIZED)

> **Added 2026-05-07 — audit AI Pass 9 §2.** Migration drift: every table has two RLS policies expressing identical intent under different names (older `<role> can <verb> own <noun>` vs newer `Users can <verb> their own <noun>s`). Both fire on every query. Pick one canonical name per pair; drop the other.

- **AUTHORIZED for autonomous drop (mechanical duplicates — same logic, same surface):**
  - `vehicles` — drop "Users can <verb> own vehicles" (4 verbs); keep "Users can <verb> their own vehicles" (canonical)
  - `damage_reports` — pick ONE of "Customers can <verb> own reports" / "Users can <verb> their own damage reports"; drop the other (consistent across 4 verbs)
  - `shop_profiles` SELECT — drop "Shop users can view own profile" (subsumed by "All users can view shop profiles")
  - `insurer_profiles` SELECT — drop "Insurer users can view own profile" (subsumed by "All users can view insurer profiles")
  - `profiles` INSERT — drop "Allow profile creation for admin setup" + "Users can insert own profile"; keep "Users can insert their own profile"
  - `profiles` UPDATE — drop "Users can update own profile"; keep "Users can update their own profile"
- **HOLD for owner approval (visibility-surface change):**
  - `profiles` SELECT — "Users can read all profiles" (overly permissive — verify intentional)
  - `damage_reports` SELECT — "Customers can view own reports" + "Insurers can view all reports" + "Shops can view all reports" (subsumption assertion needs role-mapping verification)
  - `bids` SELECT/DELETE/INSERT/UPDATE — "Authenticated shops can manage bids" + "Authenticated users can read bids" (verify against narrower per-role policies)
- **Severity:** **P2-PERFORMANCE (mechanical drops) + P2-SECURITY (owner-gated drops).**
- **Status:** **OPEN — PARTIAL AUTHORIZED.** Audit AI ships mechanical drops next pass; owner-gated rows wait.

### KI-152 status correction 2026-05-07 — 100-event audit window too narrow

> **Update 2026-05-07 — audit AI Pass 9 §2 correction.** Pass 8 service-role log audit (100 events) covered ~30-90 seconds depending on traffic. Too narrow to claim "clean for visible window." Recommend pg_audit setup or wider Studio Logs Explorer sweep (90-day filter) before downgrading severity. Service Role Key rotation owner-action remains the load-bearing remediation regardless of audit findings.

### KI-161: Active navigation — duplicate maneuver instruction across NEXT MANEUVER banner + Live Navigation panel (P1-CONTENT — RESOLVED 2026-05-08)

> **Added 2026-05-08 — audit AI Pass 9 §3 map-program audit.** During turn-by-turn navigation, the next-maneuver instruction renders simultaneously in two places: the top-center `NavigationActiveManeuverCard` ("NEXT MANEUVER" banner, max-width 640px) and the bottom-right `MapNavigationHud` ("Live Navigation" panel). Both display the same instruction word-for-word with the same "Next maneuver" eyebrow label. Apple Maps and Google Maps each show maneuver text in exactly one place during nav.

- **Sources:** [`src/app/components/maps/navigation/NavigationActiveManeuverCard.tsx:84-93`](../src/app/components/maps/navigation/NavigationActiveManeuverCard.tsx#L84-L93) (top banner) + [`src/app/components/maps/MapNavigationHud.tsx:112-119`](../src/app/components/maps/MapNavigationHud.tsx#L112-L119) (bottom panel).
- **Fix shipped Pass 176:** `CoverageActiveNavigationLayout.tsx:325` now passes `nextInstruction={null}` to `MapLibreServiceCoverageMap`. `MapNavigationHud`'s maneuver block at L112-119 is gated on `nextInstruction ?` (falsy when null), so the bottom-right panel no longer renders the duplicate text on this surface. `NavigationActiveManeuverCard` is the single source of truth for maneuver text in active nav. Other surfaces that mount `MapNavigationHud` without `NavigationActiveManeuverCard` (`CoverageBrowseExperience`, `OperatingRegionsSection` — preview/browse modes) keep the HUD's maneuver block intact via their existing pass-through. Typecheck clean.
- **Severity:** **P1-CONTENT.**
- **Status:** **RESOLVED 2026-05-08 (Pass 176).**

### KI-162: Active navigation — `liveRemainingEtaLabel` rendered "Nm" instead of "N min" (P1-CONTENT — RESOLVED 2026-05-08)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Bottom-left navigation panel rendered ETA as `<p>3288m</p>` — DOM-confirmed. The `m` suffix on a time quantity reads as meters, not minutes, especially next to a Distance card. Bug was two-fold:
> 1. [`src/app/hooks/shopDirectoryNavigationDerived.ts:173`](../src/app/hooks/shopDirectoryNavigationDerived.ts#L173) — built label as `${Math.round(remainingDurationSeconds / 60)}m`. Math correct (seconds → minutes), suffix wrong.
> 2. [`src/app/components/shop/ShopDirectoryGuidanceCard.tsx:291`](../src/app/components/shop/ShopDirectoryGuidanceCard.tsx#L291) — fallback used `${selectedRoute.estimatedDurationMinutes}m`.

- **Fix shipped Pass 175:** swap `m` → ` min` in both source locations + update [`shopDirectoryNavigationDerived.test.ts:180`](../src/app/hooks/shopDirectoryNavigationDerived.test.ts#L180) fixture from `"15m"` → `"15 min"`. Typecheck clean, vitest 14/14 passing.
- **Note:** the `3288` value itself (54.8 hours of driving) is implausible for a typical route and points to a separate `remainingDurationSeconds` source-data issue. Captured under **KI-169** (route units mix / 853.4-mi-21-hr route lacks sanity check).
- **Severity:** **P1-CONTENT.**
- **Status:** **RESOLVED 2026-05-08 (Pass 175). Companion data-sanity work tracked under KI-169.**

### KI-163: Active navigation — control sprawl across 5 corners of viewport (P2-DESIGN)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Map controls fan out across 5 visual clusters in nav mode: top-left back button, top-right shop list + map-view pill, **right-edge vertical toolbar** at x:1576 (TURNS / VOICE / SETTINGS / CENTER stacked), bottom-left navigation panel, bottom-right zoom + compass. Apple Maps consolidates to 2-3 corners. The right-edge vertical toolbar is the unconventional outlier — those four functions traditionally live as a row inside the navigation panel header or behind a single overflow menu.

- **Fix direction:** collapse the right-edge `NavigationActionRail` into the bottom-left navigation panel header (icon row), leaving only back button (top-left), top-right pills, and bottom-right zoom/compass.
- **Severity:** **P2-DESIGN.**
- **Status:** **OPEN.**

### KI-164: Smart Shop Map fullscreen — ROUTE box overlaps bottom legend strip by 129px (P1-LAYOUT — RESOLVED 2026-05-08, Pass 12 audit AI)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Bottom-left ROUTE box at y:655–865 (z:510). Bottom legend strip at y:736–921 (z:500) spans full width 1658px. They overlap from y:736 to y:865 — 129 vertical px of stacked content. Z-index keeps ROUTE on top, but they occupy the same screen region instead of partitioning it.

- **Fix direction:** either compress legend to single 44px-tall row pinned to absolute bottom, or move ROUTE box up to start at y:430 directly under selected-shop card.
- **Severity:** **P1-LAYOUT.**
- **Status:** **RESOLVED 2026-05-08 (Pass 12 audit AI).** Pass 10 host unidentified → Pass 11 code-level pinpoint → Pass 12 fix shipped under user-authorized full-auto build authority. The Pass 11 dispatch said "pinpoint + recommend only"; user override at start of Pass 12 ("go full auto auditing chrome browser and building") cleared that gate.
  - **Legend host:** [`src/app/components/shop/MapPaneLegendPanel.tsx`](../src/app/components/shop/MapPaneLegendPanel.tsx) (now 247 lines after Pass 12 edit; was 206). Renders the dual legend (semantic Origin/Selected/Top pick/Reports/Saved/Routes plus status filter chips All/Pending/Approved/In Repair/Resolved/Done).
  - **Mount site:** [`src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx:294`](../src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx#L294) — inside `MapPaneBottomOverlay` (wrapper at line 135: `pointer-events-none absolute inset-x-0 bottom-0 z-[500]`). Selected-shop card and legend are flex-wrap siblings inside the same container.
  - **Top-level mount:** [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx:482`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L482).
  - **Reframe of audit measurement (preserved from Pass 11):** the audit's "ROUTE box at y:655–865 (z:510)" is the **selected-shop card** with route-source badge ("Estimated route" / "Live route"), distance label, and ETA — not a separate routing panel. The 129px overlap arose because shop card and legend were flex-wrap siblings inside the same absolute-bottom container; on narrower viewports the wrap stacking pushed the legend up under the card.
  - **Fix shipped Pass 12** in [`MapPaneLegendPanel.tsx`](../src/app/components/shop/MapPaneLegendPanel.tsx):
    1. Removed the `isCompactDensity &&` gate on the collapse-to-pill render — pill now renders for ALL densities when `isExpanded === false`. Was Pass 78 / KI-140 compact-density-only; extended.
    2. Replaced `useState(!isCompactDensity)` with `useState<boolean>(readLegendExpandedFromStorage)` so initial state reads from `localStorage["bd:map:legend:expanded"]`. Default value when key absent: `false` (collapsed) per master builder Pass 180 §7.3 + co-worker first-time-visitor concern.
    3. Added `useEffect` writing the boolean to localStorage on every toggle so the user's expand-preference persists across sessions.
    4. Inline collapse-button (`ChevronDown` rotate-180) is now shown at all densities, not just compact, so default-density users have a way back to the pill state once expanded.
    5. Added two tiny helper functions (`readLegendExpandedFromStorage`, `writeLegendExpandedToStorage`) with SSR + try/catch guards for private-mode/quota failures. localStorage access is best-effort; default state is the safe state.
  - **Footprint reduction:** legend collapsed → 36px pill; legend expanded → unchanged. With default = collapsed, the 185px / 20%-viewport bug KI-166 captured shrinks to ~36px / ~4% of viewport. Selected-shop card and legend no longer share the wrap stacking when both are collapsed; the 129px overlap stops being possible by construction.
  - **Anti-regression carries (verified clean):** `bd-glass-card--map` utility preserved, `motion-reduce:animate-none` guard preserved, ARIA attributes (`aria-label`, `aria-expanded`) preserved on both pill and inline collapse button. `npm run typecheck` clean post-edit.
  - **Browser-verification note:** dev server's MapLibre tile load failed during this session ("Map failed to load" fallback shown); visual verification on a healthy build deferred to the next session with working tiles. Code-level + typecheck verification was the gating evidence for ship — DOM verification is post-ship validation, not pre-ship gate per user's full-auto authorization.
  - **Future relocation:** during Step C.2 of [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) the legend moves to `<MapProgramShell>` `legend` slot without behavior change; localStorage persistence and collapse-to-pill rendering carry forward.

### KI-165: Smart Shop Map fullscreen — phantom second top-bar pill ("Finding the best shops…") leaks past load (P2-LAYOUT — PARTIAL-RESOLVED 2026-05-08, Pass 14 audit AI)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Loading-state pill at x:324, y:112 (~50px below the actual top-bar) creates a perceived second top-bar row. Persists even after shops have loaded — loading-state leak. Should either auto-dismiss after first fetch resolves, or render inline within search bar as a status badge.

- **Severity:** **P2-LAYOUT.**
- **Status:** **HOLD — RENDER SITE LOCATED 2026-05-08 (audit AI Pass 12).** Pass 12 full-auto code search located the actual pill render site. Pass 11 hypothesis (ImmersiveMapTopBar) and Pass 10 trace (`shopMapExperienceHelpers.ts:224` → `buildShopMapExperience`) were both wrong leads. The actual site:
  - **Pill render site:** [`src/app/components/dashboard/CustomerMapWidget.tsx:174`](../src/app/components/dashboard/CustomerMapWidget.tsx#L174) — a floating top-left badge inside the dashboard mini-map widget (`bd-dashboard-chip absolute top-3 left-3 z-10`). Renders during `isLoadingShops` from `useCoveragePartnerShops()`.
  - **Actual rendered text:** `"Finding shops…"` (with unicode ellipsis), NOT `"Finding the best shops…"`. The audit AI's transcribed text was approximate.
  - **Surface attribution correction:** the audit said "Smart Shop Map fullscreen" but `CustomerMapWidget` is the **dashboard mini-map preview** (mounted via [`HomeScreen.tsx:365`](../src/app/components/codelayer/HomeScreen.tsx#L365)) — not the fullscreen Smart Shop Map. Either (a) the audit screenshot was actually of the mini-map and the surface was misnamed, or (b) the same `bd-dashboard-chip` pattern is used elsewhere in fullscreen Smart Shop Map AND the audit caught it there. The current source has only the one render site at `CustomerMapWidget.tsx:174`.
  - **Loading-state-leak claim assessment:** the conditional at L174 is `isLoadingShops ? "Finding shops…" : ...` — structurally correct, the pill SHOULD disappear once `isLoadingShops` flips to false. If the audit's "persists even after shops have loaded" observation was real, the leak source would be in `useCoveragePartnerShops()` not in the pill render. Re-verification needed: (a) DOM inspection on a healthy build to confirm pill disappears post-load, (b) trace the hook's loading-state lifecycle if the leak reproduces.
  - **Recommended Pass 13 fix scope:**
    1. If the audit's leak claim reproduces → debug `useCoveragePartnerShops()` loading-state lifecycle. Likely a missing `setIsLoadingShops(false)` in an error branch or a stale closure in the fetch effect.
    2. If the leak does NOT reproduce → the audit observation was likely on a stale build state; mark KI-165 RESOLVED-NOT-REPRODUCIBLE.
  - **`buildShopMapExperience` cleanup carry-over (still valid from Pass 11):** the helper is dead code in source. Recommend removal in a separate janitor pass when convenient.
  - **Hook-lifecycle trace (Pass 12 closeout):** read [`useCoveragePartnerShops.ts`](../src/app/hooks/useCoveragePartnerShops.ts) end-to-end (91 lines). Hook is structurally CLEAN: `setIsLoadingShops(true)` at effect start (L51), `setIsLoadingShops(false)` in `.finally()` (L64) which runs on both success + error paths, `mounted` boolean guard (L49/56/60/65) prevents stale-closure writes after unmount, cleanup `return () => { mounted = false; }` (L68) tears down properly. Standard React fetch-effect pattern correctly applied.
  - **Implication:** the audit's "loading-state leak" cannot be a hook lifecycle bug — if it were, all 4 widgets consuming `useCoveragePartnerShops` (CustomerMapWidget, ShopMapWidget, InsurerMapWidget, DashboardCoveragePanel) would surface stale loading state simultaneously. They don't from a structural read. Most likely diagnosis: **approximate audit transcription** ("Finding the best shops…" → actual `"Finding shops…"`) at CustomerMapWidget.tsx:174-175, with the "persists past load" observation being either a stale cache / slow-network artifact, OR a stale build state where `buildShopMapExperience` was previously wired to a since-removed render path.
  - **Predicted post-DOM-verification status:** if pill disappears post-load on healthy build → **RESOLVED-NOT-REPRODUCIBLE**, consign `buildShopMapExperience` to dormant-export sweep. If pill persists → consumer-side bug in `CustomerMapWidget` (likely a stale closure or render-path issue), NOT the hook.
  - **Pass 12+ corroboration with co-worker AI — TIMEOUT-LEAK ROOT CAUSE IDENTIFIED:** the hook's `.finally()` block only runs when the Promise settles. [`getPublicPartnerShops()`](../src/app/services/supabase/map.ts#L152) at `src/app/services/supabase/map.ts:152-167` directly awaits a Supabase client query with **NO `AbortController`, NO timeout, NO `Promise.race` guard**. If Supabase hangs (network stall, server overload, slow DB query), the Promise never settles, `.finally()` never fires, and `isLoadingShops` stays `true` indefinitely. **This is the structural root cause** of the audit's "loading-state leak persists past load" observation — co-worker AI's timeout-leak hypothesis is corroborated.
  - **Systemic exposure scope (Pass 12+ sweep):** only [`src/app/services/navigation/requestTimeout.ts`](../src/app/services/navigation/requestTimeout.ts) implements the canonical `createTimeoutAbortController` pattern. 17+ other service files (auth/, storage, supabase/profiles, supabase/map, etc.) use Supabase client queries directly without timeout protection. **`useCoveragePartnerShops` is one instance of a wider class of unguarded fetches.** Any of those services could exhibit the same timeout-leak symptom under network stall.
  - **Recommended Pass 14+ remediation (NOT IMPLEMENTED — out of Pass 12 user-authorized scope):**
    1. Wrap `getPublicPartnerShops` with `createTimeoutAbortController(8000)` or use Supabase's newer `.abortSignal()` query method. 8s timeout is appropriate for a partner-shops list fetch.
    2. In `useCoveragePartnerShops`, catch `AbortError` in `.catch()` so `setIsLoadingShops(false)` fires via `.finally()` even on timeout. Also consider exposing a "timed out, retry?" UX surface via `fetchError` rather than silently degrading to `usingDemoFallback`.
    3. Systemic anti-regression: add a §6 item to [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md): "All client-initiated Supabase / fetch calls behind a UI loading-state must be wrapped with a timeout (`createTimeoutAbortController` from `services/navigation/requestTimeout.ts` or equivalent). Loading states without timeout-protected fetches are pre-rejected at PR review."
  - **Status carry-over:** KI-165 stays HOLD until Pass 14 lands. With root cause identified, the fix scope is concrete and small (1-2 lines in `getPublicPartnerShops` + catch refinement in the hook). If owner authorizes Pass 14 systemic timeout-wrap, KI-165 closes alongside the broader fetch-hardening pass.
  - **Pass 14 SHIPPED 2026-05-08 (audit AI, user-authorized continuation directive):** [`getPublicPartnerShops`](../src/app/services/supabase/map.ts#L152) now wraps its Supabase query in `createTimeoutAbortController(8000)`. Function gains an optional `signal?: AbortSignal` parameter for caller-supplied cancellation; absent that, an internal 8s timeout is created and cleared in `finally`. Signal flows to Supabase via `.abortSignal()` (supabase-js v2.89.0 supports it). When internal timeout fires, error message becomes "Partner shops request timed out — please retry." (distinguishable from real-error path so UI retry affordances can be more forgiving on timeouts). +55 / -13 lines including JSDoc-style comment block citing Pass 12+ root-cause finding. Typecheck clean.
  - **Status:** **PARTIAL-RESOLVED 2026-05-08 (Pass 14).** Root cause closed at the service-layer source. Remaining work for full RESOLVED status:
    1. **DOM verification** on a healthy build to confirm the pill flips correctly post-load and that timeout errors render acceptable UI in CustomerMapWidget. Path (a) RESOLVED-NOT-REPRODUCIBLE if pill flips correctly. Path (b)/(c) closed by the timeout fix.
    2. **Systemic timeout-hardening** of the other 16 unguarded service fetches (auth/, supabase/profiles, supabase/workflow, supabase/navigationSavedPlaces, etc.). Pass 14 establishes the pattern; Pass 15+ extends. Recommended priority: services backing dashboard widgets first (`useCoveragePartnerShops` is now hardened; sibling hooks may have similar exposure), then auth flows, then write-side workflows.
       - **Pass 14 Step 2 SHIPPED 2026-05-08 (audit AI):** [`networkProfiles.ts`](../src/app/services/networkProfiles.ts) — co-worker AI's verified leak-surface inventory P1×2 file. All 5 `fetch()` call sites now wrapped via a local `fetchWithTimeout` helper that delegates to the canonical `createTimeoutAbortController`. 8s ceiling on GETs (`fetchShopBusinessProfile`, `fetchInsurerBusinessProfile`, `fetchDirectoryInventory`); 12s ceiling on POSTs (`saveShopBusinessProfile`, `saveInsurerBusinessProfile`). +74 / -28 lines. Typecheck clean. **P1 leak-surfaces both closed (2/2).**
       - **Pass 15 SHIPPED 2026-05-08 (audit AI, autopilot continuation):** auth-sync canonical-pattern migration. [`services/auth/websitePreferencesSync.ts`](../src/app/services/auth/websitePreferencesSync.ts) (+43/-14) and [`services/auth/websiteRelationshipsSync.ts`](../src/app/services/auth/websiteRelationshipsSync.ts) (+35/-14): replaced local `Promise.race`-style `withTimeout` (which left fetch running after wrapper rejection — soft resource leak) with the canonical `createTimeoutAbortController` pattern. Both files migrated to async-factory signature `withTimeout(async (signal) => fetch(..., { signal }))`. 5s ceiling preserved. Closes the auth-sync soft-leak class.
       - **Pass 16 SHIPPED 2026-05-08 (audit AI, autopilot continuation):** helper consolidation. Co-worker AI's Pass 15 extracted shared `fetchWithTimeout` to [`services/navigation/requestTimeout.ts`](../src/app/services/navigation/requestTimeout.ts) (+43 lines). [`services/networkProfiles.ts`](../src/app/services/networkProfiles.ts) and [`services/supabase/adminIntake.ts`](../src/app/services/supabase/adminIntake.ts) retrofitted to import the shared helper; local copies removed. Net code-quality improvement; behavior unchanged.
       - **Pass 14 Step 3 SHIPPED 2026-05-08 (audit AI, user-continuation autopilot):** highest-leverage Step yet — wraps the two SHARED edge-function wrappers that downstream services use:
         - [`services/supabase/runtime.ts:requestSupabaseEdge`](../src/app/services/supabase/runtime.ts) (+34 / -9): the canonical edge-function caller used by services across the codebase. Now accepts caller-supplied `signal` (preferred) and falls back to internal 10s timeout when absent. Every consumer inherits protection without per-call edits.
         - [`services/supabase/edgeFunctions.ts:edgeFunctionFetch`](../src/app/services/supabase/edgeFunctions.ts) (+22 / -6): alternate edge-function wrapper consumed by `edgeFunctionJson`. Same pattern. Same downstream cascade benefit.
         - **Auth-sync false-positive correction:** co-worker's P2 sweep listed `services/auth/websitePreferencesSync.ts` and `services/auth/websiteRelationshipsSync.ts` as leak-surfaces. On audit, both files have local `withTimeout` helpers (Promise.race style with `setTimeout`/`clearTimeout`) at L32-48 / similar. Functionally protected against UI loading-state hangs. Differ from canonical pattern (don't abort the underlying fetch on timeout — soft resource leak), but not the loading-state-pin class. Removed from leak-surface count. Pass 15+ candidate: refactor to canonical `createTimeoutAbortController` for proper resource cleanup (lower priority — refactor not bug fix).
       - **Updated P2 inventory after Step 3:** 4 of 6 leak-surfaces closed cumulatively. Remaining: `services/supabase/adminIntake.ts` (2 calls, write-side admin flows — independent of Step 3's wrappers), `WaitlistCapture` (P3, 1 call). Standing five-gate hold applies for further Pass 15+ extension.
    3. **Anti-regression item 19 candidate** for plan doc §6: "All client-initiated Supabase / fetch calls behind a UI loading-state must be wrapped with a timeout via `createTimeoutAbortController` from `services/navigation/requestTimeout.ts`. Loading states without timeout-protected fetches are pre-rejected at PR review." Master builder review pending.
  - **`ImmersiveMapTopBar` cleared:** read [`src/app/components/shop/ImmersiveMapTopBar.tsx`](../src/app/components/shop/ImmersiveMapTopBar.tsx) (142 lines) end-to-end. Renders only the back button, search bar, drawer toggle (with shop count), split-view button, and tile-mode button. Does NOT render any persona-experience title or "Finding the best shops" text. Master builder's Pass 11 dispatch hypothesis ("Likely culprit is `ImmersiveMapTopBar`") is rejected.
  - **`buildShopMapExperience` is dead code in the source tree:** the helper is defined in `shopMapExperienceHelpers.ts:218–228` (the customer-fallback persona block carrying the "Smart shop matching" badge + "Finding the best shops for your repair" title + "BidOnDent matches shops based on your vehicle…" description). It is **not imported by any source file** — `grep -rn "buildShopMapExperience" src/app` returns zero call-site matches and `shopMapExperience.ts` does not re-export it (only re-exports `buildRoleAwareMapHighlights` + `buildRoleAwareRouteSummary` + `buildShopRouteOptions`). The function survives in the production bundle (`dist/assets/shopMapExperience-*.js`) likely because esbuild kept the export, but it is not wired to any current rendering path.
  - **None of the helper's unique output strings render in source:** `grep` for "Smart shop matching", "Connected Carriers", "Damage Signals", "Top-3 Avg Ticket", "Insurer-Ready Shops", "Network-Ready", "best shops", "best fit", "BidOnDent matches shops" returns ZERO source-tree hits outside `shopMapExperienceHelpers.ts` and its test file. The pill the audit captured cannot be coming from this helper as currently wired.
  - **Implication:** the audit's "Finding the best shops…" pill at x:324 / y:112 is rendered from one of:
    1. A hardcoded string in a not-yet-found component (most likely; the audit observation is reliable, so something IS rendering this text).
    2. A stale build state where `buildShopMapExperience` was wired to a since-removed render path; the audit screenshot may predate the dead-code state.
    3. A different helper that produces similar persona-tailored copy (e.g. `buildRoleAwareMapHighlights`).
  - **Cannot ship the proposed `isLoading && shops.length === 0` 1-line gate** without the actual render site. Recommend next pass: DOM inspection on `/dashboard` Smart Shop Map fullscreen with this exact pill on screen, capture the React fiber owner via DevTools, then apply the gate. Code-level grep alone is insufficient — the source-tree dead-code state proves the pill must live behind a layer of indirection grep cannot see.
  - **Companion finding worth flagging:** if `buildShopMapExperience` is genuinely dead code (not just hard-to-find), it should be removed in a separate cleanup pass per the half-finished-prop pattern master builder noted on KI-172. Adding to the open "dormant exports / unused-helper sweep" backlog.

### KI-166: Smart Shop Map fullscreen — bottom legend strip eats 185px (20%) of viewport (P2-LAYOUT — RESOLVED 2026-05-08, Pass 12 audit AI)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Dual legend (semantic Origin/Selected/Top pick/Reports/Saved/Routes + status ALL/PENDING/APPROVED/IN-REPAIR/RESOLVED/DONE) rendered as twin pill groups, consuming y:736 → y:921 = 185px = 20% of 921px viewport. Apple/Google Maps don't expose a permanent legend — pin shape + color is self-evident.

- **Fix direction:** merge into single collapsible legend (default-collapsed, count + "▼ legend" toggle), or demote to hover-tooltip on pin glyphs. Master builder Pass 180 §7.3.3 approved option (a) collapsed-with-toggle + localStorage persistence.
- **Severity:** **P2-LAYOUT.**
- **Status:** **RESOLVED 2026-05-08 (Pass 12 audit AI).** Co-resolved with KI-164 by the same `MapPaneLegendPanel.tsx` collapse-by-default extension. Default-density now starts collapsed (36px tap-to-expand pill), matching the compact-density behavior shipped in Pass 78 / KI-140. The 185px / 20%-viewport footprint reduces to 36px / ~4% in the default state. Expanded state still available via tap and persisted per-user via `localStorage["bd:map:legend:expanded"]`. See KI-164 entry for full implementation detail.

### KI-167: Smart Shop Discovery card — "My Location" preset chip duplicated in row (P2-CONTENT — RESOLVED 2026-05-08)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Location-preset chip row renders as `[△ My Location] [Yonkers] [White Plains] [New Rochelle] [Spring Valley] [My Location]`. "My Location" appears twice — once at far left with active-state triangle prefix, once at far right without. Likely the active chip is being re-appended to the rendered list. Single-array dedupe fix.

- **Root cause:** [`ShopDirectoryOriginSearch.tsx:50-58`](../src/app/components/shop/ShopDirectoryOriginSearch.tsx#L50-L58) appended `selectedOrigin` as a trailing chip when it wasn't already in the first-4 `quickSuggestedOrigins` slice. The user-geolocation place (placeId `"user-geolocation"`) is never in that static list — but it's already represented by the dedicated "My Location" button rendered immediately to the left. So selecting My Location triggered a duplicate.
- **Fix shipped Pass 177:** added `selectedIsUserGeolocation` guard to the trailing-append branch. The dedicated button now exclusively represents the user-geolocation state; non-geolocation custom origins still get the trailing chip preserved.
- **Severity:** **P2-CONTENT.**
- **Status:** **RESOLVED 2026-05-08 (Pass 177).**

### KI-168: Smart Shop Map fullscreen entry — three layered transition states visible during load (P2-LOADING)

> **Added 2026-05-08 — audit AI Pass 9 §3.** When entering fullscreen, transition shows: live shop card top-left + "Loading map…" spinner pill dead-center + faded ROUTE box + faded legend bar at ~15% opacity. Three layered states for ~2 seconds. Either bottom panels should not render until map hydrated, or spinner should be the only visible chrome during load.

- **Inventoried Pass 192** ([evidence/pass-192-2026-05-09/KI_168_TRANSITION_STATES_INVENTORY.md](evidence/pass-192-2026-05-09/KI_168_TRANSITION_STATES_INVENTORY.md)): root cause is five sibling overlays in `MapLibreShopDirectoryMapPane` mounting at the same depth as `<Map>` with only `<MapLoadingSkeleton>` consuming the `mapLoaded` flag. Recommended option (a): gate the overlays on `mapLoaded` with an entrance fade.
- **Sub-pass 1 SHIPPED Pass 194:** in [`MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) the `<MapPaneBottomOverlay>` mount is now gated `!suppressBottomCard && mapLoaded && !mapLoadFailed` and wrapped in `<div className="map-ui-enter">` for a 420ms cubic-bezier cross-fade once tiles are ready. The `map-ui-enter` keyframe carries the `prefers-reduced-motion: reduce` guard at [`theme.css:700-707`](../src/styles/theme.css#L700-L707) and a mobile 320ms duration override at [`theme.css:729-733`](../src/styles/theme.css#L729-L733). Closes the ROUTE-box + legend-bar half of the audit (the two bottom-anchored overlays). Top-left "shop card" is the chrome host's `MapSurfaceHeaderBadges` — separate mount point, separate sub-pass.
- **Severity:** **P2-LOADING.**
- **Status:** **PARTIALLY RESOLVED (Pass 194 sub-pass 1 of 2-3).** Remaining: top-chrome gating (or confirmation that header badges are intentionally render-eager) + visual baseline re-capture. Hold open until owner re-tests and confirms.

### KI-169: Dashboard mini-map ROUTE box — alternative cards mix meters + miles + implausible 21-hour route value (P2-CONTENT — RESOLVED 2026-05-09)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Route alternative cards show `1005m / 853.4 mi` and `1009m / 872.0 mi` — top number meters, bottom miles, in same card. The 1005m vs 1009m alternatives are 4m apart but 853.4 vs 872.0 mi are 18.6 mi apart. Compounded by 853.4mi / 1264min route (>21 hours of driving) with no sanity check. Likely the top should be a route-type label (Fastest / Shortest) not a duplicate distance.

- **First half shipped Pass 179 (route-engine sanity flag):**
  - Added `flagImplausibleRoute()` helper in [`shopMapRouting.ts`](../src/app/services/intelligence/shopMapRouting.ts) that flags routes failing any of three plausibility bands: distance > 100mi, duration > 240min, or implied speed outside [10, 80] mph (the speed band catches divide-by-tiny-distance corruption).
  - `buildShopRouteOptions` now annotates every generated `RouteOption` with optional `isImplausible: boolean` and `implausibleReasons: string[]` fields (non-breaking — current consumers ignore them).
  - Dev-only `console.warn` fires when a route is flagged, carrying diagnostic context (shop name + origin/destination coordinates) so upstream coordinate corruption can be traced. Most likely cause is origin defaulting to `(0,0)` or a stale stub since the audit captured 853.4 mi for a NY-area request.
  - Test coverage: 8 new `flagImplausibleRoute` cases including the audit's exact 853.4mi / 1264min reproduction. Vitest 16/16. Typecheck clean.
- **Second half STAGED Pass 13 (audit AI, on disk uncommitted):** the `1005m / 853.4 mi` mixed-units card was located at [`ShopDirectoryRoutePreviewCard.tsx:176`](../src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx#L176). Co-worker AI Pass 11 T-C surfaced this as a Pass 175 partial-application — the top-line was rendering `{route.estimatedDurationMinutes}m` (duration formatted as if it were distance, hence the "1005m / 1009m" pair the audit captured). Pass 13 fix: `{route.estimatedDurationMinutes}m` → `{route.estimatedDurationMinutes} min`. Same fix closes the partial-application of KI-162 at this site. Awaiting master-builder review + commit. Sweep across the rest of the codebase confirms this is the ONLY remaining Pass 175 partial-application site.
- **Second half SHIPPED Pass 182 (audit AI Pass 13 fold-in):** the `1005m / 853.4 mi` mixed-units card was located at [`ShopDirectoryRoutePreviewCard.tsx:189`](../src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx#L189). Co-worker AI Pass 11 T-C surfaced this as a Pass 175 partial-application — the top-line was rendering `{route.estimatedDurationMinutes}m` (duration formatted as if it were distance, hence the "1005m / 1009m" pair the audit captured). Fix: `{route.estimatedDurationMinutes}m` → `{route.estimatedDurationMinutes} min`. Same fix closes the partial-application of KI-162 at this site. Sweep across the rest of the codebase confirmed this is the ONLY remaining Pass 175 partial-application site. Landed in Pass 182 cluster commit on 2026-05-09.
- **Third half SHIPPED Pass 184 (consumer wiring):** Pass 179's `flagImplausibleRoute` annotations (`isImplausible`, `implausibleReasons` on `RouteOption`) had no UI consumer — set on the data but not surfaced to the user. Wired into [`ShopDirectoryRoutePreviewCard.tsx:163-200`](../src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx#L163-L200): chips with `route.isImplausible === true` now render with an amber 1px ring + a small `TriangleAlert` icon in the top-right corner. The `aria-label` carries the full implausible-reasons string for screen readers. Chip is NOT hidden — preserves data visibility and lets the user pick a different alternative manually if all options are flagged. Build clean, typecheck PASS, vitest 30/30 on touched suites.
- **Consumer-surface verified Pass 187:** the `RouteOption.isImplausible` flag fans out to four declared consumers (`ShopDirectoryRoutePreviewCard`, `ImmersiveMapResultsDrawer`, `ShopDirectoryMapInfoPanel`, `GuidanceArrivalSection`), but only `ShopDirectoryRoutePreviewCard` renders **route alternatives as chips**. The other three consume `selectedRoute.estimatedDurationMinutes` (single-route metric display, not a chip row), so they have no surface for an amber-ring warn — the existing `selectedRoute` value is what the user already accepted, and warning on it post-hoc would be redundant. `PlannerRoutePreview` uses `NavigationRoutePreview[]` from the navigation engine (a different data path entirely — real OSRM/etc responses, not `RouteOption` stubs), so it is **not** a fanout target for this flag. If implausible-route detection is needed on the navigation engine path, that's a separate KI scoped to `useNavigationRoutePreview` / `useShopDirectoryRoutePreview`.
- **Upstream coordinate fix — pending:** with the dev-warn now in place AND the chip warn-icon now visible, the next 853-mi route trigger in development will both fire `console.warn` AND render an amber-ringed chip — which together pinpoint when/where the coordinate corruption happens. Hold for owner reproduction or an audit AI DevTools session.
- **Severity:** **P2-CONTENT (data-sanity).**
- **Status:** **RESOLVED 2026-05-09 (Passes 179 + 182 + 184).** Upstream coordinate-corruption tracing is captured by the dev-warn + amber-ring chip; not blocking on this KI. If the warn fires repeatedly in production logs (Sentry), open a follow-up KI scoped to the coordinate-source bug specifically.

### KI-170: Landing Coverage Dialog vs Dashboard Smart Shop Map fullscreen — 100% divergent design language (P1-PARITY)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Both surfaces share the MapLibre engine but otherwise share zero visual identity: different mounts (modal vs full-page), different top chrome (close-X vs Back/Search/Search-this-area/15/Split/Map-toggle), different left panels (COVERAGE COMMAND CENTER tabs vs selected-shop+ROUTE), different right toolbars (4 unlabeled icons vs 4 labeled in nav), different legend density (none vs dual), different search affordances (single ZIP vs ZIP+chips+SmartMatch), different tile toggles (none vs Map/Night/Satellite), different routing surfaces (none vs full route box). Same product, two unrelated UIs.

- **Fix direction:** new `<MapProgramShell>` abstraction with composable slots — top-bar + map area + bottom-right utilities always present; left/right panels + status pill + legend mounted by host context. Four hosts: `<DashboardSmartShopMap>`, `<LandingCoverageDialog>`, `<NavigationActiveMode>`, `<DashboardMiniMap>`. Tracked separately under [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — **AUTHORED 2026-05-08 (audit AI Pass 10).** 9-pass migration roadmap from extracted top-bar (Step A) through dashboard-fullscreen (Step C) → landing-dialog (Step D) → operating-regions / mini (Step E) → shop-directory-immersive (Step F). Gated on master-builder review against `LAW_LAYERED_ARCHITECTURE.md`.
- **Severity:** **P1-PARITY.**
- **Status:** **OPEN — multi-pass refactor (plan doc shipped 2026-05-08; implementation gated on master-builder review).**

### KI-171: Landing page — three different "map" presentations stacked vertically on one scroll (P2-CONSISTENCY)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Public landing page contains three distinct map representations: (1) Hero stylized SVG illustration with floating "Sample quote" + "Estimated ETA" chips and "DOUBLE-TAP FOR FULL MAP" affordance; (2) Inline Coverage MapLibre with minimal chrome (just zoom + small badge); (3) Coverage Command Center dialog with rich left panel (Search/Explore/Saved/Shops tabs + persona switcher). Combined with dashboard mini-map + Smart Shop Map fullscreen on signed-in side = 5+ distinct map UIs. Three visual languages on a single scroll on the landing page alone.

- **Fix direction:** subsumed by **KI-170 unification plan**.
- **Severity:** **P2-CONSISTENCY.**
- **Status:** **OPEN — paired with KI-170.**

### KI-172: Landing Coverage Dialog — map shows 6 rated shop pins but Shops tab says "0 partner shops" (P1-DATA — RESOLVED 2026-05-08)

> **Added 2026-05-08 — audit AI Pass 9 §3.** Coverage Dialog renders 6 shop pins with rating labels (4.6, 4.7, 4.8, 4.9). The "🛍 Shops" tab shows "Service area is expanding — No partner shops within 20 miles yet." Explore tab shows "0 shops / 15 places". Map ↔ list contradiction. Dashboard fullscreen at least carries a banner ("Showing example shop locations. Verified partner shops will appear once your account is connected."); landing version omits that disclaimer.

- **Root cause:** the `usingDemoFallback` prop was already plumbed through `CoverageBrowseExperience` → `CoverageBrowseSidebarContent` (used to drive sidebar copy), but no banner consumer existed in the dialog body. Banner rendering only existed on the dashboard side at [`ShopDirectoryHybridStage.tsx:124-132`](../src/app/components/shop/ShopDirectoryHybridStage.tsx#L124-L132) and [`ShopDirectoryScreen.tsx:327-336`](../src/app/components/shop/ShopDirectoryScreen.tsx#L327-L336). Map ↔ list contradiction was preserved because demo data continued to populate map pins while the sidebar count read live data.
- **Fix shipped Pass 10 (audit AI):** added a top-center overlay banner inside [`CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx) (single-file, 27-line additive change) using the canonical `bd-notice--warn` utility, `AlertTriangle` icon, and `motion-reduce:animate-none` guard. Banner is `usingDemoFallback`-gated; positioned at `inset-x-4 top-4 z-[600]` (below desktop sidebar at z-[610], above map chrome). Verbatim copy match with the dashboard source. Typecheck passes clean. Will relocate to `<MapProgramShell>` `statusPill` slot during Step D of [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) without visual change.
- **Fix direction (alternates not pursued):** (b) hide example/preview pins on landing when no real partners in radius — would require coverage-data refactor and risks empty map for new users; (c) include preview pins in count with "(preview)" annotation — would require sidebar-content rewrite and double-translates the same trust signal already captured by the banner.
- **Severity:** **P1-DATA.**
- **Status:** **RESOLVED 2026-05-08 (audit AI Pass 10).**

### KI-177: shadcn/ui primitive boilerplate — 47 of 53 files dormant (~4,178 LoC dead) (P3-TECH-DEBT)

> **Added 2026-05-08 — Pass 25b cowork-A dormant-exports sweep; numbers refined Pass 27 cowork-A re-audit.** `src/app/components/ui/` ships **4,771 total LoC across 53 files** (initial Pass 25b estimate of 4,707 LoC across ~36 files was undercounted — actual file count is 53, including supporting `sidebar-*` splits and `use-mobile.ts`). Closed-graph audit via `grep -rh "from .*\\.+/ui/" src/ | grep -oE "ui/[^\"']+" | sort -u` shows only **6 files** have any consumers from outside `src/app/components/ui/`: `NotificationToast.tsx`, `utils.ts` (the `cn` helper, widely consumed), `alert-dialog.tsx`, `dialog.tsx`, `drawer.tsx`, `sheet.tsx`. The other **47 files** (accordion, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sidebar + sidebar-context + sidebar-constants + sidebar-primitives + sidebar-variants, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip, use-mobile) are dormant. Standard shadcn boilerplate added at scaffolding time but never wired into the BidOnDent UI — which uses custom `bd-*` primitives in `src/styles/theme.css` instead.

- **Closed-graph proof (re-verified Pass 27):** the 6 alive files import only from `@radix-ui/react-*` packages externally — they do **not** transitively pull in any of the 47 dormant ui/ files. Removing the 47 dormant files would not break compilation. Verified by reading each alive file's import list.
- **Verified dormant LoC:** **4,178 lines** (53 files total minus the 6 alive files).
- **Fix direction:** future janitor pass (post-launch, P3 priority) — delete the 47 dormant primitive files and their associated radix-ui peer deps from `package.json` (verify no other consumers first via grep). Estimated impact: ~4,178 LoC removed, several MB of `node_modules` reclaimed, faster `tsc --noEmit` and faster bundler cold-start. Zero behavior change.
- **Why it stayed:** shadcn-style scaffolding installs a large default set of primitives; BidOnDent diverged early to a custom `bd-*` design system but the unused primitives were never pruned. No regression risk has surfaced because the dormant files don't participate in any compile or runtime graph.
- **Evidence:** [`docs/evidence/pass-11-2026-05-08/PASS_25B_SHADCN_UI_DORMANT.md`](evidence/pass-11-2026-05-08/PASS_25B_SHADCN_UI_DORMANT.md) + Pass 27 re-audit re-verifying the closed graph.
- **Severity:** **P3-TECH-DEBT** (no user-visible impact, no compilation risk, deferrable to post-launch).
- **Status:** **OPEN — janitor pass deferred until after Soft Launch Hardening completes; closed-graph proof re-verified 2026-05-08 Pass 27 cowork-A.**

### KI-178: hooks/utils dormant exports — `photoUtils.ts` partially dead (4/5), `useUserDataHelpers` 6/10 dead, `useCountUp` dead — RESOLVED 2026-05-08 (−224 LoC shipped) (P3-TECH-DEBT)

> **Added 2026-05-08 — Pass 25 cowork-A dormant-exports sweep. Audit-AI verification correction + Pass 25 ship 2026-05-08.**
>
> **Cowork-A's original Pass 25 claims (partially overstated):**
>
> 1. ~~`src/app/utils/photoUtils.ts` (154 lines) — entire file has zero consumers.~~ **OVERSTATED.**
> 2. ~~`src/app/hooks/useUserDataHelpers.ts` — 5 of 6 exports dormant.~~ **OVERSTATED on the denominator.**
> 3. `src/app/hooks/useScrollAnimation.ts` / `useCountUp` — zero consumers. **CONFIRMED.**
>
> **Audit AI's independent verification (corrects record):**
>
> 1. **`src/app/utils/photoUtils.ts`** — `compressImage` export has **6 consumers** (`imageCompression.ts`, `AccountScreen.tsx`, `reportPhotoUpload.ts`, `profileImageUpload.ts`, etc.). Only **4 of 5 exports** were dead. File retained, dead exports removed.
> 2. **`src/app/hooks/useUserDataHelpers.ts`** — actual export count was **10**, not 6. **6 of 10** exports were dead (not 5 of 6). Live exports retained.
> 3. **`useCountUp`** — confirmed 0 consumers. Removed.
>
> **What shipped (Pass 25 audit AI):** −224 LoC of verified dead code removed across 3 files. Typecheck PASS exit 0.

- **Methodology lesson:** cowork-A's Pass 25/25b grep methodology used path patterns that did not catch all consumer permutations (specifically: variable export names imported individually rather than via star-import or named-with-alias). Audit AI's independent verification used a more conservative consumer-count approach per export, surfacing 4 missed live consumers. Future dormant-export sweeps should use audit AI's methodology: enumerate exports by name, then `grep -rln "<exportName>" src/ --include="*.ts" --include="*.tsx" | grep -v "<file-itself>"` for each export.
- **Final ship:** −224 LoC removed. Net dead-code reduction confirmed; no false-positive deletions thanks to audit AI's verification step.
- **Evidence:** [`docs/evidence/pass-11-2026-05-08/PASS_25_HOOKS_UTILS_DORMANT_SWEEP.md`](evidence/pass-11-2026-05-08/PASS_25_HOOKS_UTILS_DORMANT_SWEEP.md) (cowork-A original sweep) + [`docs/evidence/pass-11-2026-05-08/DORMANT_EXPORTS_SWEEP.md`](evidence/pass-11-2026-05-08/DORMANT_EXPORTS_SWEEP.md) (cowork-A) + audit AI's Pass 25 ship commit (uncommitted on disk pending host-side `rm -f .git/*.lock`).
- **Severity:** **P3-TECH-DEBT** (no user-visible impact, no compilation risk).
- **Status:** **RESOLVED 2026-05-08 (audit AI Pass 25 — −224 LoC shipped, typecheck PASS).** KI-177 (shadcn ui/) remains open as separate consolidated post-launch janitor target.

### KI-179: Navigation engine route alternatives lack `isImplausible` instrumentation (P3-TECH-DEBT)

> **Filed 2026-05-09 — audit AI Pass 187 review fold-in.** KI-169's third-half wiring (Pass 184) put an amber-ring warn on `RouteOption.isImplausible` chips in `ShopDirectoryRoutePreviewCard`. KI-169's consumer-surface footnote noted that `PlannerRoutePreview` consumes `NavigationRoutePreview[]` from the navigation engine (real OSRM/etc responses), NOT `RouteOption[]` — different data path with no equivalent sanity flag. This KI is the destination that footnote points at.

- **Scope:** the navigation engine path (`src/app/services/navigation/routeEngine.ts` → `useNavigationRoutePreview` → `useCoverageNavigationExperience`) emits `NavigationRoutePreview` objects with `distanceMeters` + `durationSeconds`. None of those structures carry an `isImplausible` flag. If the engine ever returns an absurd route (e.g. an OSRM provider error producing inflated distances), no UI surface warns the user.
- **Fix direction:** mirror Pass 179's pattern — a `flagImplausibleNavigationRoute()` sanity helper at the engine boundary, with the same plausibility bands (distance > 100mi, duration > 240min, implied speed outside [10, 80] mph). Annotate `NavigationRoutePreview` with optional `isImplausible` + `implausibleReasons` fields, opt-in. Surface in `PlannerRoutePreview` chip row with the same amber-ring + `TriangleAlert` pattern as Pass 184.
- **Why P3 not P1:** this is theoretical instrumentation — no field reproduction yet on the navigation engine path. The Pass 179 / 184 work was reactive to the audit AI's captured 853mi case, but that case was on the dashboard mini-map (`RouteOption` stub data), not the navigation engine. Until a Sentry log or audit reproduces an implausible navigation-engine route, this is preventive instrumentation.
- **Evidence cross-link:** [KI-169 third-half consumer-surface footnote](#ki-169-dashboard-mini-map-route-box--alternative-cards-mix-meters--miles--implausible-21-hour-route-value-p2-content--resolved-2026-05-09).
- **Severity:** **P3-TECH-DEBT.**
- **Status:** **OPEN — preventive, not blocking.** Defer until a navigation-engine implausibility is observed in Sentry or during browser audit.
