# BidOnDent Map Tracker (2026-03-21)

Last updated: March 21, 2026  
Status: Active execution tracker
Companion to: `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`

Also cross-reference:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — map implementation reality table, design expansion plan
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table (updated 2026-03)

## Purpose

Track execution slices, validation outcomes, and next map priorities without duplicating master-plan strategy.

## Current Program Status

- Reliability and diagnostics: In progress
- Explainable trust UI: In progress
- Real discovery/routing integrity: In progress
- Mobile and desktop quality parity: In progress
- Workspace diagnostics and readability cleanup: In progress

## Completed Delivery Slices

### Reliability and diagnostics

- Map performance summaries now use recent-window logic and canonical sample age.
- Diagnostics ingestion now sanitizes malformed/future-skewed sample data.
- Local cache self-healing added for map performance telemetry.
- Provider health ingestion and summaries hardened with canonical recency fields.
- Single-pass summary aggregation adopted for map and provider telemetry paths.
- Deterministic diagnostics helpers and lightweight check modules added.
- Dev console check entry points added:
  - `window.runMapPerformanceDiagnosticsChecks()`
  - `window.runProviderHealthDiagnosticsChecks()`
  - `window.runNavigationDiagnosticsChecks()`
- Startup hydration for persisted navigation state now routes through a central versioned parse/validate/normalize/migrate helper so malformed or stale storage payloads cannot break boot.
- Persisted payload self-healing now rewrites normalized envelopes for map performance, provider health, discovery quality snapshots, navigation session, guidance preferences, saved locations, parked-car location, and discovery role.
- Added deterministic discovery-quality diagnostics checks for snapshot counter/ratio math normalization and integrated them into unified diagnostics checks.
- Non-navigation localStorage paths hardened: `useNavigation` view-state reads now validate field types and ViewMode membership via `Set`; `reportDraftStorage` validates full draft + vehicle shape before accepting cached data (malformed drafts self-heal via cleanup); `useUserData` and `useUserDataHelpers` `setItem` calls wrapped in try/catch for quota/private-mode resilience; falsy empty-array handling fixed for cached notifications (|| → ??).
- Navigation reliability audit (2026-03-21): confirmed route errors, GPS errors, and address errors all surface in the UI via `CoverageNavigationPlanner` with retry affordances. Speed-limit `.catch()` now nulls the snapshot on non-aborted failure so stale data cannot persist after a lookup error. GPS staleness detection identified as a future-pass item (no `gpsStatus` enum yet).
- GPS degradation detection (2026-03-22): Added `gpsStatus` (`active | lost | stale`) to `useCoverageNavigationExperience`. A 3-second interval checks whether the last `watchPosition` update is older than 10 seconds and promotes status to `stale`; the error callback sets `lost`. `CoverageNavigationPlanner` renders an inline warning banner (rose for lost, amber for stale) with `LocateFixed` icon. Existing `gpsError` and accuracy display preserved. Checklist item 2a delivered.
- Speed-limit unavailable state (2026-03-22): Added `speedLimitStatus` (`off | waiting | loading | available | unavailable`) to `useCoverageNavigationExperience`. The speed-limit fetch effect now tracks lifecycle: `off` when monitor/GPS disabled, `waiting` when no position yet, `loading` during fetch, `available` on success with data, `unavailable` on null result or error. `CoverageNavigationPlanner` renders an inline slate-toned banner with `ShieldAlert` icon when status is `unavailable` and speed alerts are enabled. Checklist item 4 delivered.
- NavigationErrorBoundary (2026-03-22): Created `NavigationErrorBoundary.tsx` class component in `components/maps/`. Wraps `CoverageNavigationPlanner` + discovery/saved panels inside `CoverageBrowseExperience.tsx`. On render error: logs to console, shows `bd-glass-card` fallback with amber warning icon, "Navigation hit an error" message, and Retry button that resets boundary state. 62 lines, zero dependencies beyond React + Lucide.
- HomeScreen Stage 3a glass adoption (2026-03-22): Stat cards, reports list container, quick actions panel, and recent activity panel all switched from `bg-white rounded-2xl border border-slate-200 shadow-sm` to `bd-glass-card`. Stat card badges switched to `bd-glass-badge`. All user types (customer, shop, insurer) now see glass-forward dashboard. 5 class replacements in `HomeScreen.tsx`.
- DashboardCoveragePanel wiring (2026-03-22): `DashboardCoveragePanel` is now imported and rendered in `HomeScreen.tsx` between the stats grid and the main content grid. All three user types (customer, shop, insurer) see the coverage command center on their dashboard. Props wired: `primaryColor`, `secondaryColor`, `userType`, `onOpenCoveragePage` (→ `onViewShops`). The panel's "Open Coverage Map" button opens `CoverageMapDialog` with full navigation experience; "Full Search Flow" navigates to the coverage page. Glass design tokens (`bd-glass-panel`, `bd-glass-card`) are visible on the dashboard surface for the first time.

### Explainable trust UI

- Combined trust signal (`idle/healthy/watch/degraded`) wired into planner.
- Planner drill-down now shows primary driver and provider risk context.
- At-risk provider highlight behavior added for watch/degraded states.
- Canonical provider risk reason tags surfaced (`recent-error`, `failure-rate`, `stale-telemetry`).
- Added explicit stale-telemetry refresh guidance in trust UI so provider age warnings include clear recovery actions.
- Added shared planner presentation helpers for confidence-trend labels and route-alternative delta messaging so threshold behavior remains deterministic.
- Added deterministic manual checks for trend thresholds (`-10`, `+10`, `-2`, and sub-threshold flat behavior) plus route-alternative delta labels (`similar/slower/faster`) and wired them into the unified diagnostics checks runner.
- Confidence score surfaced and bounded to canonical range expectations.
- Confidence trend hint added with significant-shift thresholds:
  - significant drop: delta <= -10
  - strong gain: delta >= +10

### Discovery and routing integrity

- Production gating tightened so demo map discovery data cannot silently leak into production paths.
- Route-launch continuity expanded across map-facing searchable shop surfaces.
- Deterministic placeholder coordinates retained only for demo/manual entries lacking geocodes.
- Added discovery quality telemetry snapshot counters (accepted by quality tier, below-threshold filtered, deduped, and diversity-trimmed) so false-positive pressure is measurable per discovery run.
- Planner diagnostics details now surface discovery-quality pressure (`limited accepted` and `below-threshold filtered`) for faster production tuning.
- Planner diagnostics details now surface category-level discovery mix ratios and limited-acceptance rate percentage for quicker false-positive triage by role context.

### UX quality and acceptance

- Mobile contrast and motion acceptance sweep completed for command-center and active-navigation overlays.
- Reduced-motion-safe animation behavior preserved for map UI motion utilities.
- Trust-card and provider snapshot layout tuned for smaller mobile breakpoints (stacked header/actions, full-width detail controls, improved provider-row spacing) to keep diagnostics readable during triage.
- Expanded command-center sidebar moved to a search-first workflow model with explicit quick-view tabs (Search, Explore, Saved, Shops) so only one heavy panel is shown at a time.
- Expanded map layout widened the sidebar rail and increased map canvas height to reduce text/button clipping and improve control affordance density on desktop.
- Navigation planner now supports search-focused rendering with diagnostics/advanced detail progressive disclosure to reduce visual noise during first-step address and origin setup.
- macOS app-shell pass in progress: left docked command rail, reduced duplicate sidebar cards, and aligned floating map action rail + route summary card to remove button scatter in expanded desktop mode.
- Royal-blue visual pass applied to map surface theme and map controls to establish consistent light/dark BidOnDent color identity.
- Leaflet attribution presentation now suppresses the default Leaflet brand prefix while preserving required provider attribution strings and introducing a dedicated BidOnDent map badge.
- Added a compact in-map command pod (search/explore/saved/shops + tile/center/reset controls) so critical left-rail actions are available directly as overlays.
- Glass-heavy map overlays now include layered entry timing and subtle float motion utility with reduced-motion-safe fallback preserved.
- Mobile zoom and attribution controls compacted with tighter spacing and smaller tap visuals for improved phone ergonomics.

### Design-system Stage 1 delivery (2026-03-21)

- Extracted BidOnDent royal-blue palette to CSS custom properties in `:root`: `--bd-royal-blue`, `--bd-royal-blue-strong`, `--bd-royal-blue-medium`, `--bd-royal-blue-soft`, `--bd-royal-blue-faint`, plus glass blur/background/border/shadow/radius tokens.
- Created three global glass utility classes: `.bd-glass-panel`, `.bd-glass-card`, `.bd-glass-badge` — NOT scoped to `.coverage-map-surface`, usable on any element app-wide.
- Dark-tone variants support both `.dark` class and `[data-theme="dark"]` selector.
- Reduced-motion fallback disables backdrop-filter for glass classes.
- `-webkit-backdrop-filter` included for Safari compatibility.
- Stage 2 prerequisite (global tokens + classes exist) is now met. `DashboardCoveragePanel` glass adoption can proceed.

### DashboardCoveragePanel glass adoption (2026-03-21)

- Outer section container adopted `bd-glass-panel` class — replaces hardcoded `bg-white rounded-2xl border border-slate-200 shadow-sm` with token-driven glass surface.
- Coverage badge adopted `--bd-royal-blue-faint` background and `--bd-royal-blue` text — replaces generic Tailwind `bg-blue-50 text-blue-700` with brand-aligned tokens.
- Three stat cards adopted `bd-glass-card` class — replaces hardcoded `rounded-xl border border-slate-200 bg-slate-50`.
- Dynamic per-role gradient buttons (`primaryColor`/`secondaryColor` props) intentionally preserved — those are role-theming, not brand tokens.
- Dark mode support automatically inherited via `bd-glass-*` class dark variants.
- Component is defined but not yet wired into routing — glass treatment will be visible once connected.

### Shell surface glass adoption (2026-03-21)

- `MobileBottomNav.tsx`: Adopted `bd-glass-panel` class — replaces manual `bg-white/95 backdrop-blur border-slate-200` with token-driven glass surface. Inherits dark mode support.
- `ProfileDropdown.tsx`: Both variants adopted glass tokens — embedded gets `bd-glass-card`, absolute popover gets `bd-glass-panel`. Replaces hardcoded `bg-white rounded-xl/lg border shadow` patterns.
- All three Stage 2 target surfaces (DashboardCoveragePanel, MobileBottomNav, ProfileDropdown) now use design tokens.

### Code organization delivery (2026-03-21)

- Extracted 24 voice instruction phrase arrays (432 lines) from `routeEngine.ts` into new `routeVoicePhrases.ts` — engine file reduced from 828 → 422 lines, under the 500-line guardrail.
- Pure mechanical extraction: no logic changes, no behavior differences, zero-impact on bundle size (tree-shaking confirmed identical output).

### Cross-doc audit (2026-03-21)

- Confirmed all navigation features are real production code: GPS tracking, turn-by-turn (OSRM public), speed HUD (Overpass API), voice navigation (Web Speech API), address search (Nominatim).
- Fixed `osrm-demo` route provider mislabel to `osrm-public` across types, route engine, and preferences — the engine calls real production OSRM, label was misleading.
- Updated Phase 2 truth table: 10 of 14 items now marked "Real (2026-03)" — only globe rendering remains "Not real."
- Added implementation reality table and design expansion plan to Product Brain for cross-doc awareness.
- Added companion document references to Map Master Plan and this tracker.
- Identified cloud sync gap: all navigation persistence is localStorage-only, no Supabase sync.

### Future direction logged

All future directions follow the consistent 6-part structure (Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals) in their source docs:

| Direction                                                                     | Source Doc      | Section                                 |
| ----------------------------------------------------------------------------- | --------------- | --------------------------------------- |
| Navigation productization (Functional → Reliable → Polished → Platform-Grade) | Product Brain   | "Navigation Productization Roadmap"     |
| Role-specific map intelligence (customer/shop/insurer)                        | Product Brain   | "Role-Specific Future Map Intelligence" |
| Design system expansion (glass tokens → shell → dashboards → site-wide)       | Product Brain   | "Design System Direction"               |
| Provider evolution decision framework                                         | Map Master Plan | "Future Theme C"                        |
| Dashboard compact map widgets (CarPlay-style per role)                        | Map Master Plan | "Future Theme B"                        |

This tracker does not duplicate the full 6-part plans above. The staged roadmap tables below track execution status against those plans.

## Active Risks

1. Provider telemetry can still appear healthy if upstream events become sparse without timely refresh.
2. Discovery quality depends on third-party OSM/Overpass metadata consistency.
3. Trust UI complexity can drift if new indicators bypass canonical summary contracts.
4. Startup hydration risk reduced: non-navigation localStorage paths now validate shape, handle quota/private-mode, and self-heal malformed data. Core navigation paths were already safe via `persistedState.ts`. Remaining risk: Supabase response types are untyped (`any`) in `useUserData.ts`.
5. Accumulating VS Code diagnostics/spell-check noise can hide real regressions and reduce map-code readability if cleanup does not stay aligned with canonical contracts.

## Next Priority Queue

1. Continue provider telemetry depth and canonical risk classification with minimal UI churn.
2. Expand trust-signal evidence weighting using canonical normalized persisted summaries only.
3. Continue command-center interaction polish (micro-animations, state transitions, and focus management) while preserving search-first hierarchy and expanding gesture-ready interaction affordances.
4. Add targeted manual stale/future-skew payload injection checklist snippets for QA runbooks.
5. Continue map/trust feature roadmap once hydration guardrails remain stable across sessions, with progressive reduction of redundant buttons in favor of compact overlay-first actions.
6. Continue navigation productization Level 2 (reliability): GPS staleness detection, deviation detection, cross-browser voice testing. Initial audit confirmed route/GPS/address error UI is mature; speed-limit stale data fixed.
7. Begin design token extraction Stage 1: add CSS custom properties for royal-blue palette values and create non-map-scoped glass utility classes in `theme.css`.

## Staged Future Roadmap

This roadmap tracks the progression from current state toward aspirational features. Items move from "Planned" to "In Progress" to "Delivered" as work begins. See the Product Brain for full architectural detail on each item.

### Near-Term (next 2-3 passes)

| Item                                          | Status      | Depends On                            | Tracker Theme           |
| --------------------------------------------- | ----------- | ------------------------------------- | ----------------------- |
| Navigation reliability (graceful degradation) | In Progress | Nothing — can start now               | Future Theme A, Level 2 |
| Design token extraction to global scope       | Delivered   | Nothing — can start now               | Theme 6 / Stage 1       |
| Customer nearest-shops compact widget         | Planned     | Partner shop data (already available) | Future Theme B          |
| DashboardCoveragePanel glass adoption         | Delivered   | Design token extraction (done)        | Theme 6 / Stage 2       |

### Medium-Term (3-6 passes)

| Item                                                | Status    | Depends On                           | Tracker Theme           |
| --------------------------------------------------- | --------- | ------------------------------------ | ----------------------- |
| Navigation settings UI (voice picker, speed toggle) | Planned   | Level 2 reliability first            | Future Theme A, Level 3 |
| Cloud-synced navigation sessions                    | Planned   | `navigation_sessions` Supabase table | Future Theme A, Level 3 |
| Shop service area visualization                     | Planned   | `shop_service_areas` Supabase table  | Future Theme B          |
| Design token adoption in shell surfaces             | Delivered | Stage 1 token extraction             | Theme 6 / Stage 2       |
| Role-specific dashboard stat card glass treatment   | Planned   | Stage 2 shell adoption               | Theme 6 / Stage 3       |

### Long-Term (6+ passes)

| Item                              | Status  | Depends On                      | Tracker Theme           |
| --------------------------------- | ------- | ------------------------------- | ----------------------- |
| Automatic rerouting on deviation  | Planned | Deviation detection (Level 2)   | Future Theme A, Level 3 |
| Marketplace-aware navigation      | Planned | Shop availability data          | Future Theme A, Level 4 |
| Insurer claims density heatmap    | Planned | Aggregated geo-coded claim data | Future Theme B          |
| Provider migration evaluation     | Planned | Usage data showing rate limits  | Future Theme C          |
| Full site-wide design unification | Planned | Stages 1-3 Design system        | Theme 6 / Stage 4       |

## Validation Checklist Per Map Pass

1. Build passes.
2. Touched map flows verified after reload.
3. Startup boot verified with stale, malformed, empty, and missing persisted diagnostics payloads.
4. VS Code diagnostics count reduced or justified for all touched files; no meaningful warnings hidden just to quiet the workspace.
5. Spelling/readability fixes reviewed so naming and wording remain consistent with canonical map/trust terminology.
6. Mobile and desktop checks completed for touched UI.
7. Trust-state regression spot-check completed (`healthy/watch/degraded` scenarios).

## Immediate Execution Direction

1. ~~Fix startup hydration/persisted-state resilience~~ — Delivered. Non-navigation localStorage paths hardened.
2. ~~Clean current workspace diagnostics~~ — Delivered. Two real bugs fixed (vehicle shape validation, falsy empty-array).
3. ~~Begin navigation productization Level 2~~ — In Progress. Route/GPS/address error UI confirmed mature; speed-limit stale data fixed. Next: GPS staleness detection, deviation detection.
4. ~~Begin design token extraction Stage 1~~ — Delivered. CSS custom properties + global glass classes in `theme.css`.
5. ~~Adopt design tokens in shell surfaces~~ — Delivered. DashboardCoveragePanel, MobileBottomNav, ProfileDropdown all use `bd-glass-*` tokens.
6. ~~Extract oversized files~~ — Delivered. routeEngine.ts phrase arrays extracted to routeVoicePhrases.ts (828 → 422 lines).
7. Resume roadmap work with provider telemetry depth, canonical risk classification, and trust-signal refinement now that startup safety, workspace cleanliness, code organization, and design token foundation are under control.
8. When starting role-specific map widget work, begin with customer nearest-shops widget — it has the least data dependency (partner shops already available via `useCoveragePartnerShops()`).
