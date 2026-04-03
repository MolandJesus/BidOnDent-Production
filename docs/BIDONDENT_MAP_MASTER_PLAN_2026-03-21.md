# BidOnDent Map Master Plan

**Last updated:** April 2, 2026 (Pass 537)
**Status:** Strategic law for map program

> Implementation notes archived to `docs/archive/MAP_MASTER_PLAN_IMPL_NOTES.md`. Per-pass delivery notes belong in the Map Tracker.

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

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — overall product architecture, role model, and design system direction
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — granular delivery history and active risks
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table and module plan

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
   - `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
   - `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
6. Every map UI pass must be validated on both mobile and desktop.
7. No map-facing silent failures: telemetry, fallback state, and user messaging must stay explicit.

8. Navigation session persistence is now Supabase-backed: all navigation session state is stored in the `navigation_sessions` table in Supabase. localStorage is used only as a cache/recovery layer and never overrides cloud truth. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. See "Cloud Navigation Persistence" card in Product Brain for full detail.

## 2026-03-22: Map Overlay Intelligence Enrichment (Pass 18)

- **Scope:** ShopDirectoryMapOverlays now computes and displays real navigation intelligence: live distance, ETA, and session state, using actual Place and ShopMapListing coordinates. Overlay logic is session-aware, with edge case handling for missing/incomplete data. No visual or design system changes; overlays only enriched with real metrics.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Overlays validated for both mobile and desktop. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

## 2026-03-23: Navigation Session Cloud Sync (Pass 19)

- **Scope:** Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Session persistence verified after reload and across devices. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

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

**1. Current State:** MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (rendering) + OSRM public (routing) + Nominatim (geocoding) + Overpass (speed limits). The renderer migration is complete, and the stack remains free-tier and functional at current scale.

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

