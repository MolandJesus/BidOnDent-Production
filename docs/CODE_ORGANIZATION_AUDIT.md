## Map/Design Governance Direction (2026-03-22)

The future BidOnDent map/platform/design vision is now governed by:

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` (strategic vision, blue system, atmosphere, day/night guidance planning)
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` (execution tracker, vision alignment, future guidance)
- `BIDONDENT_PRODUCT_BRAIN.md` (operational bridge: current vs aspirational truth, map identity, blue system, day/night intent)
- `MOLANDJEUS_DESIGN_DECISIONS.md` (design articulation: atmosphere, depth, glass, control feel, emotional target)

All future map/product/design direction is planned/aspirational unless otherwise stated in the tracker.

# Code Organization Audit

**Last updated:** March 28, 2026
**Status:** Active source-of-truth audit

**Date**: March 22, 2026  
**Scope**: Current checked-out BidOnDent repo only  
**Status**: Active source-of-truth for code structure and design-system governance

## Purpose

This document replaces the older generic audit checklist with a repo-specific view of how BidOnDent is actually organized today.

Use this together with:

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

## Current Architecture Snapshot

### App shell

- `src/app/App.tsx` is the orchestration root.
- The app is state-driven, not URL-router-driven.
- Clerk owns identity/session.
- Supabase is used for data, storage, edge handlers, and some direct realtime usage.

### Primary control seams

- `src/app/hooks/useNavigation.ts`
  owns the in-app view state and persists the current tab/view to local storage.
- `src/app/hooks/useUserData.ts`
  owns shared user-scoped client state, cloud hydration, cache persistence, notifications, reports, bids, and vehicles.
- `src/app/hooks/useAppHandlers.ts`
  owns app-level mutation handlers such as submit report, submit bid, login/logout.
- `src/app/utils/buildDashboardRouterProps.ts`
  is the adapter layer between the app shell and dashboard screens.
- `src/app/routers/DashboardRouter.tsx`
  is a thin shell.
- `src/app/routers/DashboardRouterScreens.tsx`
  currently holds most authenticated screen routing decisions.

### Shell components

- `src/app/components/app/LandingPageLayout.tsx`
  is the public-site shell.
- `src/app/components/app/DashboardLayout.tsx`
  is the authenticated shell.

### Domain/component structure

- `src/app/components/landing/`
  public marketing and coverage/discovery UI
- `src/app/components/maps/`
  current Leaflet-based coverage map primitives
- `src/app/components/dashboard/`
  shared dashboard shell widgets like header, nav, coverage panel, notification center
- `src/app/components/codelayer/`
  legacy-but-still-primary customer/dashboard screens
- `src/app/components/shop/`
  shop-facing screens
- `src/app/components/insurer/`
  insurer-facing screens
- `src/app/components/admin/`
  admin/test-account tooling
- `src/app/services/supabase/`
  client-side Supabase access layer
- `supabase/functions/server/`
  edge/server handlers and schema init

## File Size Status

The repository is mostly under the active 500-line hard cap:

- `src/app/components/shop/ShopDirectoryScreen.tsx` reduced from 1383 → 979 lines via Pass 2; refactored in Pass 9 (~1060 lines); Pass 10 added immersive early-return (~1163 lines); **Pass 11 extraction: 1163 → 478 lines.** State, effects, handlers, computed values extracted to `useShopDirectorySession` hook. Hero and search panel extracted to dedicated components. Screen is now a thin composition layer: navigation intelligence orchestration + layout delegation. Under 500-line hard cap.
- `src/app/hooks/useShopDirectorySession.ts` (**new, Pass 11**, 494 lines): all 18 state variables, session-memory sync, selection effects, search/origin/directions handlers, all computed values (mapListings, summary, contextChips, roleHighlights, routeOptions, etc). Accepts `{ identity, userType, vehicles, reports }`.
- `src/app/components/shop/ShopDirectoryHero.tsx` (**new, Pass 11**, 149 lines): two render modes — compact bar (map/hybrid) with back+badge+title+count, or full hero card with gradient, metrics grid, intelligence panel, callout cards.
- `src/app/components/shop/ShopDirectorySearchPanel.tsx` (**new, Pass 11**, 276 lines): search form, origin selector, suggested origins, save origin button, view mode toggle, sort select, rating filter, theme toggle, role-specific panel.
- `src/app/components/shop/ShopDirectoryImmersiveMap.tsx` (Pass 10, 253 lines): full-viewport immersive map experience. `fixed inset-0 z-40` container. Floating glass top bar (back + search + drawer toggle + mode switch + theme). Collapsible left-side results drawer with compact result cards. Renders `ShopDirectoryMapPane` + `ShopDirectoryMapOverlays` at full viewport.
- `src/app/components/shop/ShopDirectoryMapOverlays.tsx` (Pass 9, updated Pass 10, 187 lines): floating in-map overlay layer. Renders intelligence chip (top-left, expandable), route preview card (bottom-left, expandable turn list), and deviation prompt slot (top-center). Added `navigationMode` prop (`browse | route-preview | guidance`) gating overlay visibility by navigation state.
- `src/app/components/shop/ShopDirectoryMapPane.tsx` (Pass 9, updated Pass 10, 447 lines): Leaflet map surface container. `children` prop for overlay injection. Added `suppressHeader` prop to hide built-in top gradient badges in immersive mode.
- The largest active screen/router files that are next best split targets:
  - `src/app/routers/DashboardRouterScreens.tsx`
  - `src/app/components/dashboard/ProfileDropdown.tsx`
  - `src/app/components/app/DashboardLayout.tsx`
- **Pass 84 fixes**: `DashboardRouter.tsx` and `DashboardTabScreens.tsx` now correctly plumb `onDeleteAccount` and `websiteIdentity` props to `AccountScreen`. Migration `010_add_clerk_user_id_to_damage_reports.sql` aligns database schema with edge function expectations. `MobileMapBottomSheet.tsx` has `pointer-events-auto` for touch gesture capture.

## What Is Organized Well

- The app shell now has a clearer split between public and authenticated surfaces.
- Dashboard routing is thinner than before and no longer buried entirely in one god-component.
- The report flow already has extracted helper modules for draft storage and photo upload.
- The coverage map is no longer trapped in one landing-page file.
- Backend schema bootstrapping is split across focused SQL modules instead of one oversized file.
- The notification bell now has a dedicated component instead of being a dead icon.
- **Pass 109–110 (2026-03-23):** Error observability is now a clean three-tier architecture. `src/app/services/errorReporting.ts` is the single adapter for all capture calls. `src/app/services/sentryInit.ts` owns Sentry lifecycle. All error boundaries (GlobalErrorBoundary, NavigationErrorBoundary, ImageErrorBoundary) route through `errorReporting.ts` — Sentry is decoupled and swappable. Activate by setting `VITE_SENTRY_DSN` in `.env`.

## What Is Still Structurally Weak

### 1. State ownership is still broad

- `useUserData` owns many concerns at once:
  - cloud hydration
  - cache persistence
  - notification state
  - report state
  - bid extraction
  - vehicle persistence
- This is workable today, but it is not the right long-term seam for a map/navigation platform.

### 2. Routing is stateful but loosely typed

- `ViewMode` in `src/app/types/index.ts` does not fully reflect all actual view strings used in the dashboard router.
- `dashboard-router-types.ts` still leans heavily on `any[]`.
- The app’s navigation model is understandable, but it is not yet modeled as a strict navigation domain.

### 3. Role flows are not equally mature

- Customer flow is the most real.
- Shop flow reads real reports and can submit real bids, but still fabricates several display fields.
- Insurer flow is more of an adapter layer over report data and still synthesizes claim-facing values.
- Admin tooling is still a separate legacy island with email-linked test-account assumptions.

### 4. Notification ownership is split

- `DashboardLayout` owns shell presentation.
- `NotificationCenter` owns the richer bell UI.
- `ProfileDropdown` still contains overlapping notification logic and an older realtime presentation path.
- Default seeded notifications still exist in `src/app/constants/index.ts`.

### 5. Map code is now a cleanly separated map platform

- Navigation session state: **Delivered** (Pass 11/19) — `sessionTypes.ts`, `useNavigationSession.ts`, `navigationSessionCloudService.ts` (Supabase-backed)
- Voice guidance: **Delivered** — `useNavigationVoiceAlerts.ts`, `deviationVoicePhrases.ts`, Web Speech API wrapper
- Deviation detection: **Delivered** — `detectDeviation.ts`, `useNavigationIntelligence.ts`, discriminated union types
- Reroute lifecycle: **Delivered** — `useNavigationReroute.ts`, `shouldTriggerReroute.ts`, cooldown/severity logic
- Immersive fullscreen map: **Delivered** (Pass 10) — `ShopDirectoryImmersiveMap.tsx`
- Remaining future work:
  - Routing provider abstraction (OSRM only today — abstract when multi-provider justified)
  - Operational coverage map with real geocoding (Nominatim demo today)

## Current Domain-Level Risks

### Type mismatches

- `src/app/types/index.ts` and `src/app/services/supabase/types.ts` describe overlapping but different report/bid/vehicle shapes.
- UI layers repeatedly normalize mixed report shapes instead of relying on one authoritative view model.

### Mixed live and synthetic data

- Several shop and insurer screens still derive fake-safe values such as:
  - `customerName: "Customer"`
  - synthetic claim numbers
  - synthesized estimated damage
  - placeholder contact data
- This keeps screens non-empty, but it weakens trust and complicates future mobile or notification flows.

### Legacy admin surface

- `src/app/config/adminConfig.ts`
  and `src/app/utils/adminCheck.ts`
  still treat admin as an email/test-account concern.
- This conflicts with the current requested direction of temporary broad admin access for authenticated users.

## Recommended Folder Evolution

Do not broad-stroke move the whole repo at once. The safest evolution path is:

### Keep existing shells

- keep `components/app/`
- keep `routers/`
- keep `hooks/`
- keep `services/`

### Introduce new domain folders deliberately

- `src/app/features/coverage/`
  for shared coverage-search state and business rules
- `src/app/features/navigation/` ✅ **EXISTS** — deviation detection + reroute groundwork + voice alerts + session lifecycle delivered
  - `deviationTypes.ts` — `DeviationType`, `DeviationSeverity`, `NavigationSnapshot`, constants; **`DeviationEvent` is a discriminated union** — `RouteChangeEvent`, `OffRouteEvent`, `StoppedEvent`, `DelayIncreaseEvent`, `UnknownDeviationEvent`, each with a typed metadata interface; `DeviationPosition` coordinate type
  - `detectDeviation.ts` — pure `detectDeviations(prev, current)` helper (route change, off-route, stopped, delay increase); **each detector returns its specific variant type directly** — generic `buildEvent()` removed
  - `useNavigationIntelligence.ts` — `useNavigationIntelligence()` hook: stores events, exposes `evaluate()`, `pushEvent()`, `latestEvent`
  - `sessionTypes.ts` (**new, Pass 11**, 96 lines) — navigation session state machine types: `NavigationSessionStatus` (`idle | planning | active | paused | ended`), `NavigationSession`, `NavigationSessionEvent` discriminated union, `SessionWaypoint`, `SessionPauseEntry`, `NavigationSessionActions`
  - `useNavigationSession.ts` (**new, Pass 11**, 190 lines) — `useNavigationSession()` hook: reducer-driven session lifecycle; actions: `startPlanning`, `selectRoute`, `activate`, `pause`, `resume`, `end`, `reset`; computes `activeSeconds` (total minus pause time); `isNavigating` and `hasSession` derived booleans
  - `rerouteTypes.ts` — `RerouteStatus`, `RerouteOrigin`, `RerouteRequest`, `RerouteState`, cooldown/severity constants
  - `shouldTriggerReroute.ts` — pure `shouldTriggerReroute(event, state)` decision helper with severity/cooldown/lifecycle checks
  - `useNavigationReroute.ts` — `useNavigationReroute(latestEvent)` hook: lifecycle orchestration (idle → eligible → pending → completed → cooldown), cooldown timer, typed actions
  - `deviationVoicePhrases.ts` — phrase pools for off-route (medium/high), delay increase, reroute pending, reroute confirmed; `getDeviationPhrase()`, `getReroutePhrase()`
  - `useNavigationVoiceAlerts.ts` — `useNavigationVoiceAlerts(latestEvent, rerouteStatus, settings: NavigationVoiceSettings)` hook: severity filtering, event-ID deduplication, reroute-status transition tracking, single voice entry point
  - `index.ts` — barrel re-export (deviation + reroute + voice alerts); **exports all 5 discriminated union variant types** + `DeviationPosition`
  - Integrated into `ShopDirectoryScreen` via route snapshot `useEffect` + reroute hook + voice alerts hook
  - UI surface: `components/maps/navigation/NavigationDeviationPrompt.tsx` — calm off-route banner, `onReviewRoute` wired through reroute flow
- `src/app/features/notifications/`
  if notification logic continues to grow beyond the bell/dropdown boundary

### Migrate shared models out of legacy generic types

- move map and navigation models into dedicated typed modules
- move report/bid view adapters closer to report/bid domains
- reduce repeated per-screen normalization logic

## Documentation Governance

### Current source-of-truth docs

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/CODE_ORGANIZATION_AUDIT.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- `docs/README.md`

### Docs that need retirement review

These older docs were retired because they no longer matched the live code:

- `docs/FIXES_APPLIED.md`
- `docs/IDENTIFIED_ISSUES.md`
- `docs/PROJECT_COMPLETION_SUMMARY.md`
- `docs/PROJECT_STATUS.md`
- `docs/COMPREHENSIVE_TEST_PLAN.md`
- `docs/CROSS_ACCOUNT_TESTING_PLAN.md`
- `docs/BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `docs/JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`

Use `docs/README.md` as the current documentation entry point instead.

## Next Structural Priorities

### Now

- Keep files under 500 lines while extracting new navigation/map domains.
- Replace stale generic documentation with repo-specific source-of-truth docs.
- Tighten the navigation and dashboard router typing surface.
- Consolidate notification ownership so bell and dropdown do not compete.
- ~~Extract `ShopDirectoryScreen.tsx` (1383 lines) into composable sub-modules.~~ — Delivered (Pass 11/77). Screen reduced to 339 lines. Extracted: `useShopDirectorySession`, `ShopDirectorySearchPanel`, `ShopDirectoryHero`, `ShopDirectoryImmersiveMap`, `ShopDirectoryMapPane`, `ShopDirectoryMapOverlays`, `ShopDirectoryListBody`.

### Next

- Create a real `coverage` state hook shared by landing and dashboard.
- Introduce dedicated navigation types and persistence for route/session memory.
- Move admin access policy behind one isolated access layer.
- Remove or refactor screens that still synthesize fake-safe business data.

### Later

- Move toward feature/domain folders for coverage, navigation, and role workflows.
- Retire duplicate report/bid/vehicle type definitions in favor of one normalized view-model path.
- Split role-specific operational surfaces into smaller route-loaded screen bundles.

---

## Design System Status

**Phase**: Design system correction + platform refinement (not feature expansion).

### Active glass classes (delivered 2026-03-22)

| Class               | Purpose                                                             | Governed by |
| ------------------- | ------------------------------------------------------------------- | ----------- |
| `bd-glass-panel`    | Large surface panels (sidebars, overlays)                           | `theme.css` |
| `bd-glass-card`     | Content cards (stat cards, reports, activity)                       | `theme.css` |
| `bd-glass-badge`    | Inline badges and labels                                            | `theme.css` |
| `bd-glass-control`  | Interactive controls (buttons, toggles) — includes CSS hover/active | `theme.css` |
| `bd-glass-floating` | Elevated floating elements (tooltips, dropdowns)                    | `theme.css` |

### Token sources

- **CSS tokens**: `src/styles/theme.css` — `:root` and `.dark` blocks define all `--bd-*` custom properties and glass class implementations.
- **JS theme objects**: `src/app/theme/globalSurfaceTheme.ts` — runtime surface tokens matching CSS.
- **Map theme**: `src/app/components/maps/mapSurfaceTheme.ts` — map-specific tone-aware theme (light/dark) with glass panel, card, and button variants.

### Dark mode palette (delivered)

- Base: `#0c1929` (deep navy, not gray-900)
- Card: `#132237`
- Accent/muted: `#1c2e47`
- Glass: blue-tinted (`rgba(96, 165, 250, 0.08)` dark bg, `rgba(147, 197, 253, 0.12)` dark border)

### Hover standard (delivered)

- Unified: `hover:bg-white/40` site-wide (soft glow, not color jump).
- Borders softened: `border-slate-200/60` and `border-gray-200/60`.
- Do NOT use: `hover:bg-slate-50`, `hover:bg-gray-50`, `hover:bg-slate-100`, `hover:bg-gray-100`.

### Surfaces unified under one visual language

- Map surfaces and dashboard surfaces now share the same token and glass-class system.
- Map zoom controls: pill group, blue gradient, glass blur, navy dark variant.
- All interactive controls should use `bd-glass-control` unless there is a documented contextual exception.

### Intentional contextual exceptions

These ad-hoc blur patterns were reviewed and are allowed to remain custom:

| Surface                                                                            | Reason                                                               |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Colored-surface search inputs (CompetitorAnalysisScreen, InsuranceCompaniesScreen) | White-on-color blur on gradient headers — no `bd-glass-*` class fits |
| Image overlay badges (InsurerPartnerShopsScreen)                                   | Floating over photo; badge semantics differ from `bd-glass-badge`    |
| Photo guide card (photo-guide-steps.tsx)                                           | Dark-surface instructional panel                                     |
| PhotoGuide icon container                                                          | Animated icon on gradient                                            |
| Landing page header (LandingPageHeader)                                            | Scroll-responsive `bg-white/90 backdrop-blur-2xl` behavior           |
| Admin dialog overlay (GoToAdminButton)                                             | Modal backdrop                                                       |

If a future pass introduces a reusable pattern from these exceptions, extract it to a `bd-glass-*` class.

---

## AI Coding Guardrails for Styling

1. **Do not introduce raw one-off blur/opacity styles** when an existing `bd-glass-*` class fits. Check `theme.css` before adding inline `backdrop-blur-*` or `bg-white/*` patterns.
2. **If a visual pattern is reused more than once**, it must become a shared `bd-glass-*` class or extend an existing one.
3. **Design-system work must not break the 500-line rule** or collapse service/hook/component separation. Extract before deepening.
4. **Do not use** `hover:bg-slate-50`, `hover:bg-gray-50`, `hover:bg-slate-100`, or `hover:bg-gray-100`. The standard is `hover:bg-white/40`.
5. **Do not use flat `border-slate-300`** on interactive elements. The standard is `border-slate-200/60` or `border-gray-200/60`.
6. **Dark mode must feel navy** (deep blue energy), not gray-900. If adding a new dark surface, derive from `#0c1929` / `#132237` / `#1c2e47`.
7. **Map glass system is production-quality**. Do not change it for experimentation. Any change needs a design reason documented in `MOLANDJEUS_DESIGN_DECISIONS.md`.

---

## Current Visual-System Weaknesses

1. **Dark mode refinement ongoing**: Navy base is delivered but continued tuning toward Apple Maps-style soft night mode is expected in future passes.
2. **Map control consistency**: Premium styling is in place now but must be preserved across future feature passes. Any new map control must use the `mapSurfaceTheme.ts` tone system.
3. **ShopDirectoryScreen** (339 lines after Pass 77 extraction): Extracted `useShopDirectorySession` hook, `ShopDirectorySearchPanel`, `ShopDirectoryHero`, `ShopDirectoryImmersiveMap`, `ShopDirectoryMapPane`, `ShopDirectoryMapOverlays`, `ShopDirectoryListBody`. Well under 500-line hard cap.
4. **Landing page**: Not yet fully unified with the glass design system. Pass 1 (HeroSection carousel) is next.
5. **Some role screens** still use raw Tailwind gray palette instead of theme tokens. These are acceptable as-is but should migrate during future glass adoption passes.

---

## Current Priority Focus

- Visual-system correction and consistency remain the active priority.
- Feature work must not outpace design-system and architecture clarity.
- The project is in a "design system correction + platform refinement" phase, not random feature expansion.
- Governance docs (this file, Product Brain, Map Tracker, MOLANDJEUS) should be updated with every meaningful pass.
