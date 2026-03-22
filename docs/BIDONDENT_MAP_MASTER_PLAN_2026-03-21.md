# BidOnDent Map Master Plan (2026-03-21)

Last updated: March 21, 2026  
Owner: Product + Engineering  
Status: Active strategic source of truth

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
8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

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

### Theme 5: Visual language and motion system

- Keep a BidOnDent-first visual identity while adopting a playful, rounded, depth-rich glass treatment inspired by modern mobile-native UI patterns.
- Prioritize a royal light/dark blue palette as the primary map-surface and control accent system.
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

The themes above (1–6) describe the current program. The themes below describe future evolution that is documented but not yet in active development. Each theme follows the consistent 6-part structure: Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals. The Product Brain contains the full detail — this plan captures strategic direction.

### Future Theme A: Navigation productization

**1. Current State:** GPS, turn-by-turn, speed HUD, and voice all work (Tier 1–2). No graceful degradation for GPS loss, network errors, or stale data. No rerouting, cloud sync, or user-facing settings. UX varies across browsers.

**2. Productizing Stage:** Graceful degradation for GPS loss, network errors, stale speed data. Deviation detection with reroute prompt. Error telemetry. Cross-browser voice testing.

**3. Aspirational Stage:** User-facing settings UI (voice picker, speed unit, volume). Cloud sync via Supabase. Automatic rerouting. ETA updates. Marketplace-aware routing to partner shops. Offline caching. Provider abstraction.

**4. Technical Prerequisites:** Supabase `navigation_sessions` and `navigation_preferences` tables. Error boundary around navigation components. Deviation calculation utility. Browser compatibility matrix for Web Speech API.

**5. UI/UX Evolution Path:** (1) Now → functional panel with no error states. (2) After productizing → same panel with visible warnings for degraded conditions. (3) After aspirational → settings drawer, live ETA, auto-reroute, shop info cards at route end.

**6. Non-goals:** Do not migrate away from OSRM/Nominatim/Overpass preemptively. Do not build multi-stop routing before single-route reliability is production-grade. Do not add CarPlay/Android Auto before web navigation is polished.

**Cross-doc reference:** Product Brain "Navigation Productization Roadmap" has the full structured breakdown.

### Future Theme B: Marketplace-specific map intelligence

**1. Current State:** No role-specific map intelligence exists. All roles see the same shared coverage map. No geo-coded report data, no service area boundaries, no claims analytics.

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

**1. Current State:** Leaflet (rendering) + OSRM public (routing) + Nominatim (geocoding) + Overpass (speed limits). All free-tier, all functional at current scale. No rate limit issues observed.

**2. Productizing Stage:** No provider changes needed. Focus on reliability within the current stack (error handling, fallbacks, graceful degradation). Document the browser compatibility matrix.

**3. Aspirational Stage:** Evaluate commercial providers only when triggered:

| Trigger                   | Candidate Provider                  | Feature Unlocked                      |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| Globe rendering required  | Mapbox GL or MapLibre GL            | 3D globe, smooth zoom, vector tiles   |
| Free-tier rate limits hit | Self-hosted OSRM, Mapbox Directions | Reliable routing at scale             |
| Traffic data needed       | Google Directions API, TomTom       | Real-time traffic-aware routing       |
| Offline maps needed       | MapLibre + PMTiles                  | Offline tile packs, zero-network maps |

**4. Technical Prerequisites:** Provider abstraction layer (build when first migration is justified, not before). Self-hosted alternatives evaluated before commercial APIs. Budget approval for per-request costs.

**5. UI/UX Evolution Path:** (1) Now → Leaflet tiles with OpenStreetMap. (2) After vector tile migration → smoother zoom, rotatable maps, 3D terrain. (3) After traffic integration → real-time congestion overlay on routes. No visual change should be user-breaking.

**6. Non-goals:** Do not migrate providers for aesthetic reasons. Do not build the provider abstraction layer preemptively. Do not commit to commercial providers without usage data justifying the cost.

### Future Theme D: Documentation-system maturity

**1. Current State:** Four strategic docs with cross-references and shared three-tier vocabulary. Docs are maintained by human + AI pair. Cross-doc consistency verified in audits.

**2. Productizing Stage:** Ensure every major future direction across all docs uses the consistent 6-part structure (this pass). Ensure every doc explicitly names which other docs to check for related content.

**3. Aspirational Stage:** Docs function as an execution-ready operating system — any new engineer or AI agent can read the four docs and know exactly what exists, what's next, what's not built, and why.

**4. Technical Prerequisites:** None — this is process discipline, not infrastructure.

**5. UI/UX Evolution Path:** N/A — these are internal docs.

**6. Non-goals:** Do not create additional docs for sub-features. Keep the doc count at four. Add sections to existing docs rather than spawning new files.

## Definition Of Done For Any Map Change

1. Build passes.
2. Persistence and reload behavior verified for touched flows.
3. Mobile and desktop behavior verified for touched UI.
4. Trust/fallback behavior verified when provider or performance signals degrade.
5. Both map docs updated with concise, non-duplicative entries.

## Documentation Discipline

- Keep this master plan stable, strategic, and short-lived only by decision changes.
- Put granular delivery notes in the tracker.
- Retire stale map plans instead of keeping parallel "active" master docs.
