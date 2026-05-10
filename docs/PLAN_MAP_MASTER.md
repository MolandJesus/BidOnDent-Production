---
status: DEFERRED
authority: PLAN
scope: map-master-vision
canonical_source_of_truth: PLAN_MAP_MASTER.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: Strategic map vision (paused during hardening); blue system, atmosphere, day/night planning.
last_updated: 2026-05-09
---

# BidOnDent Map Master Plan

> ### ⚡ HARDENING PHASE NOTICE (2026-04-14, AMENDED 2026-05-07)
>
> This document remains the **strategic vision** for the map program. It is **not** current execution law.
>
> During the Soft Launch Hardening phase, the binding execution doc is [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md). **Feature-level map work is paused** — no new map features, no aspirational atmosphere work, no provider migrations. The strategic vision in this doc stays intact for post-launch reactivation; it just does not drive the day-to-day queue while hardening is active.
>
> Exception: any map change that is required to close a Launch Scope Guardrail or support a Hardening Plan phase item is allowed under the Hardening Plan's scope, not this doc's.
>
> **2026-05-07 amendment — KI-075 unlocked:** Owner asserted all four KI-075 trigger conditions on 2026-05-07 via planner-AI authority chain. Functional buildout scope (turn-by-turn engine, voice TTS, deviation detection, saved-places persistence, real-time marker availability, per-role layer rules) is now ACTIVE and may proceed under the containment-over-expansion rule (one functional item per pass plus hardening-safe polish). See [`REF_KNOWN_ISSUES.md` KI-075](REF_KNOWN_ISSUES.md#ki-075-future-navigation-engine--map-functional-buildout-active--unlocked-2026-05-07) for trigger assertions and per-pass scope ceiling. Provider stack stays locked (MapLibre + OSRM + Nominatim-via-edge + Overpass).

**Last updated:** April 17, 2026 (Hardening phase active — strategic vision retained, submitted address search commit hardening documented)
**Status:** DEFERRED — strategic vision (paused during hardening)

> Implementation notes archived to `docs/archive/MAP_MASTER_PLAN_IMPL_NOTES.md`. Per-pass delivery notes belong in the Map Tracker.

---

## 2026-04-17: Hardening-Safe Map Chrome Polish Note

- Hardening-safe map UI polish is allowed when it improves trust, readability, navigation clarity, or mobile/desktop usability without expanding map feature scope.
- On 2026-04-17, shared map chrome was tightened across two existing map families already in the product: the landing/fullscreen coverage browse flow and the dashboard Smart Shop Map stage.
- This work stayed inside existing interaction models and focused on hierarchy, shell cohesion, pre-search empty states, and map-adjacent control clarity.
- Browser-automation rules are now part of map operating discipline: Playwright-like agents must use the BidOnDent logo flow to return to landing surfaces while authenticated.
- Coverage browse maps now require explicit opt-in before mounting shared report pins. This hardening guard prevents customer-facing coverage surfaces from accidentally calling marketplace-only report endpoints while leaving the shop-directory report-map path intact.
- Strategic direction remains unchanged: premium, product-owned blue-system map UI with stronger trust signaling and clear cross-surface consistency.

## 2026-04-17: Browser-Verified Cross-Surface Map Chrome Continuity Note

- Current delivered map chrome continuity now explicitly spans seven user-visible states: landing coverage inline, landing fullscreen Search, landing fullscreen Explore, landing fullscreen Saved, landing fullscreen Shops, dashboard Smart Shop Map immersive/fullscreen mode, and active turn-by-turn navigation.
- The delivered improvements stayed hardening-safe and UX-scoped: narrower command-center shells, grouped top/right control clusters, shared liquid-glass panel/card/rail treatment, route-preview/guidance shells that read as one family, and stronger pre-search or empty-state messaging instead of inert empty space.
- This was not a map-feature expansion. Provider stack, routing engine, marketplace contracts, navigation-session architecture, and discovery data model all stayed the same.
- Browser validation confirmed that active navigation still works in the checked-in build through the Smart Shop Map route-preview path. In desktop browser sessions without granted location permission, the degraded state stays explicit (`GPS weak` plus retry guidance) instead of failing silently.
- Map QA protocol now has to cover dashboard inline/fullscreen states and active navigation states when those surfaces are touched, not only the landing full-map tabs.

## 2026-04-17: Submitted Address Search Commit Hardening (Pass 888)

- Hardening-safe map UX work is allowed when it closes a misleading public interaction without expanding feature scope. Pass 888 fits that rule: the existing map search contract already supports predictive suggestions plus committed manual origins, but submit behavior left some flows visually incomplete until a second tap.
- The delivered behavior now treats `Find` as a real submit action for deterministic cases across both existing address-search families already in the product: landing/fullscreen coverage browse and Smart Shop Map origin search. When there is one clear match, submit commits it, syncs origin state, and unlocks the existing nearby-shop / route-preview flows immediately.
- Ambiguous searches still stay explicit. This pass did not turn submit into blind auto-selection; it only commits a single, uniquely matching, or clearly dominant result and otherwise preserves manual choice.
- This was not a provider or routing change. Nominatim-backed suggestion/search, OSRM routing, and the overall map architecture stayed the same.
- Strategic direction remains unchanged: search-first map UX should feel trustworthy, intentional, and complete, with no silent half-finished states between user intent and visible map response.

---

## Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

### Future Direction: Product-Owned Map Identity, Blue System, and Atmosphere

- The final BidOnDent map product is planned to feel **product-owned, premium, and BidOnDent-native** — not a macOS clone, not generic SaaS, not pasted Apple UI.
- The blue system is a future semantic hierarchy: deep royal blue for primary identity and controls, lighter sky/baby blue for atmosphere and guidance, dark ocean/navy blue for depth and night, gray-blue for subdued/inactive/low-noise UI. Blue should behave like **light through glass**, not paint on controls.
- The map should feel like a **living world**: more depth, atmosphere, layered transparency, liquid glass overlays, and “surface floating above geography.”
- Future immersion direction: richer world feel, environmental depth, spatial layering, and better blending between map and UI. True 3D/world rendering is **aspirational only** and depends on future provider/platform decisions.
- **Day/night guidance mode switching** is a planned, not implemented, feature. Any future implementation must respect provider stack, real capability boundaries, and user override/settings.
- Controls should feel tactile, soft, layered, calm, and premium — not loud, harsh, over-glossed, or like desktop window chrome. Controls should float above the world, not feel like toolbar buttons.
- Glass/material direction: target is breathable, warm, softly illuminated, transparent/translucent — not over-solidified, painted, cold, or aggressively glossy.
- The future map experience should be more emotional and trustworthy: calm, guided, breathable, confident, premium, friendly, and trustworthy — not cold, flat, generic, or overly technical.

All of the above is **future direction** and not yet implemented unless otherwise stated in the tracker.

# BidOnDent Map Master Plan (2026-03-21)

Last updated: March 23, 2026  
Owner: Product + Engineering  
Status: Active strategic reference

## Companion Documents

This plan should be read alongside:

- `docs/PLAN_PRODUCT_BRAIN.md` — STUB (2026-05-04). Original archived at `docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`. Canonical homes for new work: `LAW_PROJECT_RULES.md` (product architecture, role model), `MOLANDJESUS_DESIGN_DECISIONS.md` (design system direction — apex, locked).
- `docs/archive/BIDONDENT_MAP_TRACKER_2026-03-21_archived_2026-05-02.md` — granular delivery history and active risks
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table and module plan
- [`docs/PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — **NEW (2026-05-08, audit AI Pass 10).** `<MapProgramShell>` slot-contract proposal that retires KI-170 / KI-171 / KI-172 by unifying the 5 divergent map surfaces. 9-pass migration roadmap; gated on master-builder review against `LAW_LAYERED_ARCHITECTURE.md`.

Any map decision should cross-check all four docs to avoid contradictions.

## Mission

Deliver a production-grade, map-first BidOnDent experience that is:

- trustworthy (real provider-backed behavior in production paths),
- resilient (clear fallback and error visibility),
- premium (intentional UI motion/clarity across desktop and mobile),
- and maintainable (cleanly separated map domains and documentation discipline).

## Non-Negotiables (Humans + AI)

1. Supabase is source of truth for report, vehicle, profile, and user-linked persistence.
2. localStorage is cache/recovery only and must never silently override cloud truth.
3. Real providers are required for routing/place/search in production user paths.
4. Demo map data must remain clearly labeled and isolated to demo-only paths.
5. Every map-related change must update both map docs in the same change set:
   - `docs/PLAN_MAP_MASTER.md`
   - `docs/archive/BIDONDENT_MAP_TRACKER_2026-03-21_archived_2026-05-02.md`
6. Every map UI pass must be validated on both mobile and desktop.
7. No map-facing silent failures: telemetry, fallback state, and user messaging must stay explicit.

8. Navigation session persistence is designed to be Supabase-backed through the `navigation_sessions` table. When that table exists in the connected backend, session state is hydrated from Supabase on boot and saved on update, with localStorage acting as cache/recovery. When the connected backend is missing `navigation_sessions`, the client now drops to a timed local-only fallback and suppresses repeat cloud sync calls until schema parity is restored.

9. Browser geocoding for Smart Shop Map origin search, navigation address suggestions, and report-layer coordinate fallback now runs through the shared public `server` edge function route (`/geocode/search`) instead of direct browser calls to Nominatim. The provider remains Nominatim, but the runtime contract is now edge-proxied and deployed as part of the shared Supabase router.

## 2026-03-22: Map Overlay Intelligence Enrichment (Pass 18)

- **Scope:** ShopDirectoryMapOverlays now computes and displays real navigation intelligence: live distance, ETA, and session state, using actual Place and ShopMapListing coordinates. Overlay logic is session-aware, with edge case handling for missing/incomplete data. No visual or design system changes; overlays only enriched with real metrics.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Overlays validated for both mobile and desktop. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

## 2026-03-23: Navigation Session Cloud Sync (Pass 19)

- **Scope:** Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Session persistence verified after reload and across devices. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

## 2026-04-17: Navigation Session Cloud-Drift Fallback Hardening (Pass 884)

- **Scope:** Hardened the navigation session sync runtime so environments missing `public.navigation_sessions` no longer keep emitting edge-route `500`s during dashboard hydration. The app now detects the missing-table failure, clears pending retries, and temporarily falls back to local session storage while backend schema parity is restored. No map UI redesign or route-flow logic changed.
- **Validation:** Focused navigation/auth runtime tests passed, production build stayed clean, and a clean dashboard reload on a fresh page showed normal edge hydration traffic without `navigation-session` requests during the fallback cooldown.
- **Docs:** Known Issues, the Product Brain, and both map docs were updated in the same change set.

## 2026-04-17: Edge-Proxied Geocoding Transport Hardening (Pass 885)

- **Scope:** Added a public `/geocode/search` route to the shared Supabase `server` edge function and moved shared map geocoding callers onto it. This keeps the real Nominatim provider in place while removing direct browser dependency on provider CORS behavior for Smart Shop Map origin search, navigation suggestions, and report coordinate fallback. No provider migration or map UI redesign changed in this pass.
- **Validation:** Focused geocoding tests passed, production build stayed clean, the shared `server` edge function was deployed live, and fresh desktop/mobile reloads plus a live origin search all returned `200` from `/functions/v1/server/geocode/search` with no direct browser requests to `nominatim.openstreetmap.org`.
- **Docs:** Known Issues, REF_SYSTEM_STATE, and both map docs were updated in the same change set.

## Architecture Direction

### Map domain boundaries

- `services/navigation/*` owns provider IO, telemetry, sanitization, and summary contracts.
- `hooks/*` owns orchestration/state composition for map workflows.
- `components/maps/*` owns presentation and interaction surfaces.
- Diagnostic check modules stay deterministic and dependency-light.

### Trust as product feature

Map reliability is not hidden infrastructure. It is a user-facing quality signal.

- Provider health and map performance telemetry are first-class.
- Combined trust state (`idle/healthy/watch/degraded`) must remain explainable.
- Confidence scoring and trend hints are acceptable only when derived from canonical summary contracts.

### Data truth model

- Production map discovery/routing/search must prefer real providers.
- Demo fallback entries can exist only behind explicit demo mode gating.
- Placeholder coordinates are allowed only for deterministic continuity in demo/manual records.

## Delivery Themes (Current Program)

### Theme 1: Reliability and diagnostics

- Harden telemetry ingestion and local-cache self-healing.
- Enforce versioned persisted-state parsing and normalization on startup so stale or malformed browser payloads cannot crash hydration.
- Keep summary generation deterministic and low overhead.
- Expose lightweight dev-only check entry points for confidence in refactors.
- GPS degradation detection and graceful degradation (delivered 2026-03-22 via `NavigationErrorBoundary`).
- Speed-limit unavailable state handling (delivered 2026-03-22).

### Theme 2: Explainable trust UI

- Keep planner trust status fast to scan.
- Surface risk reason tags and at-risk provider context.
- Surface explicit stale-telemetry refresh guidance so trust warnings stay actionable.
- Keep confidence-trend and route-alternative messaging backed by deterministic helper logic and checks.
- Preserve meaningful confidence trend signaling without noise.

### Theme 3: Real discovery and routing integrity

- Prevent demo leakage into production results.
- Preserve route-launch continuity from searchable shop surfaces.
- Track discovery quality filtering outcomes with measurable counters so false-positive pressure is visible.
- Keep discovery telemetry readable in category-mix ratios so quality tuning decisions are role-aware.
- Keep provider fallback behavior explicit to users.

### Theme 4: Quality of interaction

- Maintain smooth UI transitions and clear visual hierarchy.
- Keep the expanded command-center map search-first: reduce concurrent panel noise, prioritize route origin/search actions, and use progressive disclosure for secondary controls.
- Keep desktop expanded-map presentation in a cohesive macOS-style app shell (single aligned action rail, single route summary card, and consistent button rhythm).
- Keep small-screen readability/tap-target comfort at parity with desktop quality.
- Keep diagnostics trust surfaces readable at small breakpoints so risk triage remains fast on mobile.
- Honor reduced-motion behavior for animated map controls.

### Theme 5: Visual language, blue system, and motion system

- The BidOnDent map product must feel **product-owned** and not a macOS clone or generic SaaS map UI.
- The visual identity is **royal-blue-first**: royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode.
- Map surfaces, overlays, and controls must use the blue system intentionally for meaning, not just decoration.
- The map should feel like a **branded geographic world**: the sky, water, route, and overlays all belong to BidOnDent, not a third-party tile with branding on top.
- **Day/night guidance mode**: The future map experience will support automatic day/night visual switching based on local time or route context, similar to premium navigation products. This is a planned feature, not yet implemented. Day mode is lighter, breathable, and sky-driven; night mode is calm, navy, low-glare, and guidance-first.
- All map design and product decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI patterns.
- Use in-map overlays (not only side panels) for key route/search actions so map context stays visible while users act.
- Keep attribution legally compliant while presenting branded map identity (BidOnDent map badge + provider attribution clarity).
- Make animation quality a first-class acceptance item: layered entry timing, subtle floating glass motion, and deterministic reduced-motion fallback.
- Continue evolving toward search-first, fewer-button, gesture-friendly interaction flows over time without removing desktop discoverability.

### Theme 6: Site-wide design expansion and dashboard map surfaces

- The royal-blue glass design language proven on map surfaces should extend to dashboard shells, landing pages, and role-specific experiences following the staged adoption plan in the Product Brain.
- Dashboard map widgets should follow CarPlay-style principles: compact, glanceable, always-visible, live-updating — not hidden behind full-screen dialogs.
- Each account type (customer, shop, insurer) should eventually have a role-specific compact map widget on their dashboard showing contextually relevant geographic information (nearest shops, incoming requests, claims density).
- `DashboardCoveragePanel.tsx` already proves the embedded map pattern works — future work builds on this foundation.
- Map design decisions (palette, animation, glass treatment) should remain consistent whether the map appears as a full-screen command center or a compact dashboard widget.
- Current integration barrier is high for most non-map surfaces (they use separate Tailwind-only styling with no map token consumption). Stage 1 preparation (global design tokens in `theme.css`) must come before component adoption.

## Future Direction Themes

The themes above (1–6) capture a historical strategic snapshot from the 2026-03-23 planning cycle. The themes below describe future evolution that is documented but not yet in active development. Each theme follows the consistent 6-part structure: Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals. For current execution reality, use the latest baseline and verification matrix docs.

### Future Theme A: Navigation productization

**1. Current State (Pass 92):** GPS, turn-by-turn, speed HUD, and voice all work and are production-quality. Graceful degradation for GPS loss delivered (Pass 68). Deviation detection with reroute prompt delivered. Cloud sync via Supabase delivered (Pass 19). Error boundary around navigation components delivered (`NavigationErrorBoundary`). Circuit breaker for OSRM delivered (3-fail open, 90s cooldown). Session retry resilience delivered (exponential backoff). Voice alerts with mode-aware dispatch delivered. Consumer copy cleaned across all map surfaces (Passes 87–92). Dev diagnostics gated behind `import.meta.env.DEV` (Pass 91).

**2. Productizing Stage (mostly delivered):** ~~Graceful degradation for GPS loss~~ Done. ~~Deviation detection with reroute prompt~~ Done. ~~Error telemetry~~ Done. Remaining: network error recovery UI, cross-browser voice edge cases.

**3. Aspirational Stage:** User-facing settings UI (voice picker, speed unit, volume). ~~Cloud sync via Supabase~~ Done. Automatic rerouting (currently user-confirmed). ETA updates during active navigation. Marketplace-aware routing to partner shops. Offline caching. Provider abstraction.

**4. Technical Prerequisites (mostly delivered):** ~~Supabase `navigation_sessions` table~~ Done. `navigation_preferences` table not yet created. ~~Error boundary around navigation components~~ Done. ~~Deviation calculation utility~~ Done. Browser compatibility matrix for Web Speech API (informal, not formalized).

**5. UI/UX Evolution Path:** (1) Now → functional panel with no error states. (2) After productizing → same panel with visible warnings for degraded conditions. (3) After aspirational → settings drawer, live ETA, auto-reroute, shop info cards at route end.

**6. Non-goals:** Do not migrate away from OSRM/Nominatim/Overpass preemptively. Do not build multi-stop routing before single-route reliability is production-grade. Do not add CarPlay/Android Auto before web navigation is polished.

**Cross-doc reference:** Product Brain "Navigation Productization Roadmap" has the full structured breakdown.

### Future Theme B: Marketplace-specific map intelligence

**1. Current State:** Customer role has a compact nearest-shops widget (`CustomerMapWidget`) delivered March 2026 showing 5 nearest shops with distance + rating, expandable to full CoverageMapDialog. Shop and insurer roles have placeholder widgets (`ShopMapWidget`, `InsurerMapWidget`) with structure-only stats. No geo-coded report data, no service area boundaries, no claims analytics.

**2. Productizing Stage:**

- **Customer:** Nearest partner shops widget (data already available via `useCoveragePartnerShops()`)
- **Shop:** Service area boundary visualization (requires `shop_service_areas` table)
- **Insurer:** Network coverage map with capacity/rating overlays

**3. Aspirational Stage:**

- **Customer:** Smart shop recommendation routing with distance/rating/wait-time weighting
- **Shop:** Incoming request heatmaps, customer proximity alerts, competitor overlays
- **Insurer:** Claims density analysis, coverage gap detection, optimal claim-to-shop assignment

**4. Technical Prerequisites:** Supabase schema extensions — `report_locations` (geo-indexed), `shop_service_areas` (polygons/radius), `shop_availability` (real-time capacity), `claim_assignments` (geographic context). Real-time subscriptions for live update surfaces.

**5. UI/UX Evolution Path:** (1) Now → shared coverage map for all roles. (2) After productizing → role-specific compact dashboard widgets showing contextually relevant data. (3) After aspirational → each role has a purpose-built map intelligence surface with interactive drill-down.

**6. Non-goals:** Do not build heatmap/clustering infrastructure before underlying Supabase tables exist. Do not show fabricated intelligence — display "not enough data" when data is missing. Do not build shop-to-shop messaging or technician dispatch through the map.

**Cross-doc reference:** Product Brain "Role-Specific Future Map Intelligence" has per-role structured plans.

### Future Theme C: Provider evolution

**1. Current State:** MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (rendering) + OSRM public (routing) + Nominatim via shared Supabase edge proxy (geocoding) + Overpass (speed limits). The renderer migration is complete, and the stack remains free-tier and functional at current scale.

**2. Productizing Stage:** No provider changes needed. Focus on reliability within the current stack (error handling, fallbacks, graceful degradation). Document the browser compatibility matrix.

**3. Aspirational Stage:** Evaluate commercial providers only when triggered:

| Trigger                   | Candidate Provider                  | Feature Unlocked                      |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| Globe rendering required  | Mapbox GL or MapLibre GL            | 3D globe, smooth zoom, vector tiles   |
| Free-tier rate limits hit | Self-hosted OSRM, Mapbox Directions | Reliable routing at scale             |
| Traffic data needed       | Google Directions API, TomTom       | Real-time traffic-aware routing       |
| Offline maps needed       | MapLibre + PMTiles                  | Offline tile packs, zero-network maps |

**4. Technical Prerequisites:** Provider abstraction layer (build when first migration is justified, not before). Self-hosted alternatives evaluated before commercial APIs. Budget approval for per-request costs.

**5. UI/UX Evolution Path:** (1) Now → MapLibre with CARTO/Esri raster styles. (2) After vector tile migration → smoother zoom, rotatable maps, 3D terrain. (3) After traffic integration → real-time congestion overlay on routes. No visual change should be user-breaking.

**6. Non-goals:** Do not migrate providers for aesthetic reasons. Do not build the provider abstraction layer preemptively. Do not commit to commercial providers without usage data justifying the cost.

### Future Theme D: Documentation-system maturity

**1. Current State:** Four strategic docs with cross-references and shared three-tier vocabulary. Docs are maintained by human + AI pair. Cross-doc consistency verified in audits.

**2. Productizing Stage:** Ensure every major future direction across all docs uses the consistent 6-part structure (this pass). Ensure every doc explicitly names which other docs to check for related content.

**3. Aspirational Stage:** Docs function as an execution-ready operating system — any new engineer or AI agent can read the four docs and know exactly what exists, what's next, what's not built, and why.

**4. Technical Prerequisites:** None — this is process discipline, not infrastructure.

**5. UI/UX Evolution Path:** N/A — these are internal docs.

**6. Non-goals:** Do not create additional docs for sub-features. Keep the doc count at four. Add sections to existing docs rather than spawning new files.

### Future Theme E: Mobile-first map experience

**1. Current State (Pass 22):** Mobile map surfaces now use edge-to-edge full-bleed layout — no rounded shells, no side margins, no min-height overflow on short viewports. Floating navigation overlays (maneuver card, bottom HUD) now render on mobile, not hidden behind `lg:` breakpoints. CoverageMapDialog is full-viewport on mobile. ShopDirectoryScreen removes framed container on mobile. Desktop richness is preserved via responsive `md:`/`lg:` breakpoints.

**2. Productizing Stage:** Bottom-sheet / drawer pattern for shop listings on mobile (swipe up from bottom). Compact floating controls sized for thumb reach. Gesture-friendly map interactions (pinch, swipe). Pull-to-refresh for discovery results. Safe-area-insets support for notched phones.

**3. Aspirational Stage:** Native-feeling mobile navigation with haptic feedback (vibration API). Progressive web app (PWA) with offline map tile cache. Lock-screen widget showing active navigation. Voice-first interaction mode on mobile (activate/pause/end by voice).

**4. Technical Prerequisites:** Bottom-sheet component (Radix or custom with `@use-gesture`). Touch event handlers separate from pointer events. Viewport height handling (`dvh` units where supported). PWA manifest and service worker for offline support.

**5. UI/UX Evolution Path:** (1) Now → responsive layout, floating controls visible on all sizes. (2) After productizing → swipe-friendly bottom sheets, thumb-zone-optimized controls. (3) After aspirational → PWA install, offline maps, haptics, voice-first.

**6. Non-goals:** Do not build a separate mobile-only codebase. Do not strip desktop features to simplify mobile. Do not attempt native app compilation (React Native, Capacitor) before web mobile is polished.

### Future Theme F: Globe / world mode honesty

**1. Current State:** MapLibre currently renders flat raster styles in 2D mode. There is no globe, 3D terrain, or world-mode rendering enabled in the checked-in build, and attempting to fake it with ornamental transforms would create a misleading experience.

**2. Productizing Stage:** No globe mode. Focus on polishing the 2D map experience — smooth tile transitions, proper zoom constraints, attribution clarity, and high-quality tile sources.

**3. Aspirational Stage:** True globe rendering requires a WebGL-based map renderer:

| Option          | Globe Support | Licensing   | Notes                                             |
| --------------- | ------------- | ----------- | ------------------------------------------------- |
| MapLibre GL JS  | Yes (native)  | BSD-3       | Free, open source, community maintained           |
| Mapbox GL JS v3 | Yes (native)  | Proprietary | Requires Mapbox API key; per-request pricing      |
| CesiumJS        | Yes (3D)      | Apache 2.0  | Full 3D globe; heavy bundle; overkill for 2D nav  |
| deck.gl         | Yes (layer)   | MIT         | Data visualization layer; not a full map renderer |

**4. Technical Prerequisites:** Provider abstraction layer (build only when migration is justified). WebGL support detection with graceful fallback to 2D. Performance budget for mobile devices with limited GPU.

**5. UI/UX Evolution Path:** (1) Now → flat 2D tiles, no globe. (2) After vector tiles (MapLibre) → smooth vector rendering, rotation, pitch. (3) After globe → seamless zoom from world view to street level. No forced transitions — users who prefer flat 2D should always have that option.

**6. Non-goals:** Do not fake globe with CSS transforms or decorative pitch hacks. Do not add 3D terrain before the core navigation experience is production-grade. Do not commit to Mapbox GL pricing without usage data. Do not present globe mode as "coming soon" until the vector-style migration is actually underway.

## Definition Of Done For Any Map Change

1. Build passes.
2. Persistence and reload behavior verified for touched flows.
3. Mobile and desktop behavior verified for touched UI.
4. Trust/fallback behavior verified when provider or performance signals degrade.
5. Both map docs updated with concise, non-duplicative entries.

6. For navigation session changes: Supabase is the source of truth for session state; localStorage is cache only. Session state must persist across reloads and devices. Cloud sync logic must be covered by tests and documented in both map docs and the Product Brain.

## Documentation Discipline

- Keep this master plan stable, strategic, and short-lived only by decision changes.
- Put granular delivery notes in the tracker.
- Retire stale map plans instead of keeping parallel "active" master docs.
