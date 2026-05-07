# BidOnDent — Known Issues (REFERENCE)

**Authority level:** REFERENCE — describes current known gaps, bugs, and structural issues.

**Last updated:** 2026-05-07 (Pass 55 — docs hygiene sweep. 70 RESOLVED/WONTFIX entries archived to [`archive/RESOLVED_KIS_2026-05-07.md`](archive/RESOLVED_KIS_2026-05-07.md). REF_KNOWN_ISSUES.md now active-only (25 entries). Pass 53 added KI-075 description correction; Pass 54 fixed reroute confirm-timing bug.)

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
- **Remaining work:** F.2 (throttle `useParallaxOffset`), F.3 (passive listeners audit), F.4 (defer/idle GPS speed-limit init off the landing render path), F.5 (provider-side investigation — out of pre-launch scope). Each scoped as a separate pass. F.2 is the next planned step.
- **Status:** PARTIAL RESOLUTION (2026-05-07, Pass 49) — F.1 shipped; F.2-F.5 still open. P4 (polish; no functional regression).

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

### KI-100: F-24 follow-up — full Supabase swap for `buildShopRecommendations` (P2-DATA, deferred)

- **Impact:** Long-term resolution of F-24. Replace `buildShopRecommendations()` synchronous source from `marketSeedShops.ts.SHOPS` with an async query against Supabase `public_partner_shops` (or `shop_profiles`) table, plus an empty-state UI when the query returns zero rows in a user's service area.
- **Location:** [src/app/services/intelligence/marketIntelligence.ts](src/app/services/intelligence/marketIntelligence.ts) (`getShopDirectory` + `buildShopRecommendations`); 20+ consumers across `src/app/components/shop/` + `src/app/components/maps/`.
- **Fix direction (deferred):** Convert `buildShopRecommendations()` to async, returning a Promise. Replace `SHOPS.filter(...)` with a Supabase query against `public_partner_shops` (already exists per migration 20251230000001 §3.13 + populated via shop signup flow). Wrap the 20+ consumer call sites in async/await + loading states. Add empty-state UI ("No partner shops in your area yet — be the first to know when one signs up" + email-capture). Keep `SHOPS` only as `import.meta.env.DEV` fallback. Flip `SHOP_DIRECTORY_IS_PREVIEW` to `false` once the real-data path resolves with non-empty rows. Remove `<PreviewDirectoryNotice />` from surfaces once flag is false. Significant scope — ~20 file refactor — should be a dedicated pass with diagnose-first protocol like F-16. Pre-requisite: confirm `public_partner_shops` table exists on prod (related to KI-095 investigation pattern).
- **Status:** **OPEN** — DEFERRED (intentional defer per autopilot scope discipline). Owner directive 2026-05-05 authorized F-24 mitigation pass; full swap requires explicit second authorization given the scope.
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

### KI-101: F-01 — "Toyoto" misspelled vehicle make persisted in DB (P6-SPELL — owner action)

- **Impact:** Audit AI F-01 (P6-SPELL): the 2021 Toyota Camry vehicle record was saved with the make field as "Toyoto" (misspelled). Propagates to every display of this vehicle/report — dashboard "Your Reports" h3 (`2021 Toyoto Camry`), Account tab Vehicles list, Report creation flow Step 1 vehicle selector, Make field pre-fill. Visible typo on production-facing content. Make input placeholder correctly shows "Toyota" — so the field hint is correct but there's no enforcement.
- **Location:** `vehicles` table row for the affected user. Code-side: vehicle entry form has placeholder hint but no validation/autocorrect.
- **Fix direction:** **Owner action:** UPDATE the `vehicles` table row to correct "Toyoto" → "Toyota" via Supabase Dashboard SQL Editor (single UPDATE statement). **Code improvement (deferred, optional):** add make validation/autocorrection against a canonical makes list in the vehicle entry form. Non-trivial — would touch the report wizard's vehicle step + account vehicle entry — not appropriate for autopilot ship without explicit go-ahead. Bigger value would be a future `vehicles` migration adding a CHECK constraint or normalized-makes lookup table.
- **Status:** **OPEN** — owner DB action pending. Code improvement deferred.
- **Skill:** None — pure data hygiene + future schema decision.

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
- **Status:** **OPEN — P7-TECHDEBT.** Phase 6.5 closed via Path B (deferred-aesthetic note, original scope). Phase 7.5 closed via Path Y (docs-only, F2 + F3 scope extension — dashboard surfaces). Phase 7.6 / KI-113 close (2026-05-05, commits `b1fea150` → `bb20f554`) cleared the reduced-motion contract gating — any future sub-fix activation on motion/react surfaces now mechanically inherits root `<MotionConfig reducedMotion="user">` (`src/main.tsx`) + per-file `useReducedMotion()` pattern (45 files); CSS keyframe activations (original landing gold-lamp + F4 / F5 / F6) must still author their own `@media (prefers-reduced-motion: reduce)` block per [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §3. Phase 8.5 closed via Path Y (docs-only, F4 + F5 + F6 scope extension — map ambient surfaces: route preview draw-on, pin pulse on canvas, liquid sheen extension to map frames; Phase 8.5 audit F3 camera idle drift maps to existing KI-112 F2 — no duplicate). Sub-fixes (original landing scope + F2 / F3 / F4 / F5 / F6) remain owner-taste-deferred to post-launch aesthetic pass. This KI is the parked record for the full atmosphere/idle/enter-motion gap family across landing + dashboard + map.

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
