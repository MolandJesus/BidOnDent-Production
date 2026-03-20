# Phase 1 Platform Architecture Audit

**Date**: March 20, 2026  
**Scope**: Audit only. No major provider swap, schema change, or full navigation implementation.  
**North Star**: BidOnDent should evolve from "website with a coverage map" into a premium, trustworthy, map-capable product surface without faking what is not truly live.

## Executive Summary

BidOnDent already has a stronger foundation than a typical polished demo:

- the customer report flow is materially connected to Clerk-aware backend persistence,
- the coverage map is reusable across landing and dashboard,
- the dashboard bell is no longer dead UI,
- the app shell is faster than before and does not fully block on auth hydration.

But the repo is still in a transitional state:

- the app is state-routed rather than URL-routed,
- customer workflows are more real than shop and insurer workflows,
- notifications are partially live and partially seeded,
- the current map stack is good for operational coverage lookup but not for honest globe or turn-by-turn ambitions,
- the fullscreen "orbital" experiment is not production-quality,
- admin access still reflects older email-linked/test-account assumptions.

The clearest architecture recommendation is:

1. Keep the current lightweight map stack for embedded operational coverage maps.
2. Design a separate immersive map/navigation layer instead of stretching Leaflet into a fake navigation engine.
3. Keep turn-by-turn, live speed, speed limits, and premium voice guidance in the planned architecture until a real provider-backed navigation stack is approved.

## 1. Current Architecture Brief

## 1.1 App shell and control flow

- `src/app/App.tsx` is the true orchestration root.
- The app is not URL-router-driven. It uses internal state and hash-based exceptions only for a few public pages like privacy/about.
- Public and authenticated surfaces are split at the shell level:
  - `src/app/components/app/LandingPageLayout.tsx`
  - `src/app/components/app/DashboardLayout.tsx`
- The main routing seam is:
  - `src/app/hooks/useNavigation.ts`
  - `src/app/utils/buildDashboardRouterProps.ts`
  - `src/app/routers/DashboardRouter.tsx`
  - `src/app/routers/DashboardRouterScreens.tsx`

## 1.2 Auth and persistence boundaries

- Clerk is the active identity/session provider.
- Clerk metadata is the source for name, phone, account type, and account setup completion.
- Supabase is used for:
  - persisted reports
  - bids
  - vehicles
  - partner shops
  - storage
  - edge functions
  - some direct realtime subscriptions

Important architectural reality:

- The app is not yet purely "Clerk frontend -> secure server adapter -> Supabase" everywhere.
- Some client code still touches Supabase directly in ways that do not match the long-term Clerk-first architecture.

## 1.3 Shared client state ownership

- `useUserData` owns shared app state for:
  - user info
  - vehicles
  - reports
  - bids
  - notifications
  - local cache persistence
  - cloud hydration
- `useAppHandlers` owns app-level mutations:
  - login/logout
  - submit bid
  - submit report
- `useAppEffects` keeps Clerk profile data mirrored into local app state.

This is workable now, but too much of the future platform still converges into `useUserData`.

## 1.4 Map ownership today

Current coverage map stack:

- `src/app/components/landing/OperatingRegionsSection.tsx`
- `src/app/components/landing/CoverageMapDialog.tsx`
- `src/app/components/maps/ServiceCoverageMap.tsx`
- `src/app/components/maps/MapViewportController.tsx`
- `src/app/components/maps/MapZoomTracker.tsx`
- `src/app/components/maps/mapTileLayers.ts`
- `src/app/hooks/useCoveragePartnerShops.ts`
- `src/app/services/supabase/map.ts`

What it currently is:

- a Leaflet-based coverage and shop-discovery map
- embedded on the landing page
- reused in dashboard via `DashboardCoveragePanel`
- ZIP and geolocation aware
- built around raster tiles and marker overlays

What it currently is not:

- a route engine
- a true globe renderer
- a turn-by-turn navigation system
- a mobile-ready navigation domain

## 1.5 Notification ownership today

Notification-related seams:

- `src/app/components/app/DashboardLayout.tsx`
- `src/app/components/dashboard/NotificationCenter.tsx`
- `src/app/components/dashboard/ProfileDropdown.tsx`
- `src/app/components/dashboard/profile-dropdown-realtime.tsx`
- seeded defaults in `src/app/constants/index.ts`

Reality:

- the top-right bell now works and is a meaningful shell entry point,
- but the repo still contains overlapping notification logic between bell and profile dropdown,
- seeded default notifications remain in constants,
- the realtime helper still uses direct Supabase client subscriptions rather than a Clerk-safe server-driven model.

## 1.6 Role workflow maturity

### Customer

- strongest and most real flow today
- can submit reports through Clerk-aware edge routes
- sees report-linked bids
- has meaningful dashboard/report/bid surfaces

### Shop

- can view marketplace-style requests derived from reports
- can submit bids through backend persistence
- still relies on synthetic display fields like generic customer names and service-area text

### Insurer

- can see claim-like views derived from reports
- still uses substantial synthetic claim presentation logic
- "new claim" flow is more UI shell than true end-to-end persisted claim workflow

### Admin

- still anchored in legacy email/test-account config
- still not aligned with the requested temporary relaxed access model

## 2. Current State vs Screenshot Direction

| Area                    | Current checked-out state                                                   | Screenshot / requested direction                                                               | Gap       |
| ----------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| Public landing          | Premium enough, stronger than the older dashboard surfaces                  | Premium, modern, glassy, product-like, still trustworthy                                       | Moderate  |
| Dashboard shell         | Clean and usable                                                            | More command-center-like and cohesive across all roles                                         | Moderate  |
| Customer flow           | Most live and coherent                                                      | Fully trustworthy, polished, operational                                                       | Moderate  |
| Shop flow               | Reads live reports and persists bids, but many fields are still synthesized | Real operational workspace with true opportunities, service-area logic, stronger states        | High      |
| Insurer flow            | Claims are derived from report data with several fake-safe values           | Real claims/product workflow with clear assignment, review, and partner visibility             | High      |
| Notification bell       | Works now and routes somewhere meaningful                                   | Richer, unified notification source of truth                                                   | Moderate  |
| Inline map              | Good operational coverage map                                               | Fast, practical, beautiful, brand-consistent                                                   | Moderate  |
| Fullscreen map          | Better than inline map, but still clearly Leaflet-based                     | Premium fullscreen command center with globe-capable immersive mode                            | High      |
| Globe zoom-out          | Faux orbital effect only; visually broken in current state                  | Real globe when zooming far out in immersive mode only                                         | Very high |
| Directions / navigation | Not implemented as a real system                                            | Route overview, turn-by-turn, voice modes, speed limit/current speed, mobile-driving readiness | Very high |
| Midnight mode           | Uses generic dark raster tiles                                              | More premium royal-blue operational night mode                                                 | Moderate  |

## 3. Map Stack Evaluation

## 3.1 Current stack

### What the repo uses right now

- `leaflet`
- `react-leaflet`
- raster tile sources:
  - OpenStreetMap
  - CARTO dark
  - Esri World Imagery
- browser geolocation
- simple ZIP-prefix lookup and distance math

### Strengths

- fast enough for embedded operational coverage
- easy to reason about
- already integrated
- good fit for:
  - coverage lookup
  - service-region overview
  - nearby partner discovery
  - simple radius visualization

### Limitations

- no real globe rendering
- no vector-style runtime theming comparable to Apple-like premium map systems
- no route engine in the current codebase
- no navigation session model
- no speed-limit/current-speed lane
- no voice guidance abstraction
- no native-mobile portability story for navigation UX

## 3.2 Official-provider capability reality

### Leaflet

Leaflet’s official quick start and reference describe it as an interactive web map library centered around standard map primitives, layers, markers, popups, raster layers, vector layers, and map events. It is a strong 2D slippy-map foundation, but not a true globe/navigation platform.

Sources:

- https://leafletjs.com/examples/quick-start/index.html
- https://leafletjs.com/reference

### MapLibre GL JS

MapLibre GL JS now supports globe projection on the web, and its roadmap explicitly notes globe view for GL JS while separately noting that globe view is not yet available for MapLibre Native.

What that means for BidOnDent:

- web-side immersive globe is plausible
- mobile/native parity is weaker today
- route, voice, speed-limit, and guidance systems would still need separate solutions

Sources:

- https://maplibre.org/maplibre-gl-js/docs/API/interfaces/Projection/
- https://maplibre.org/roadmap/maplibre-gl-js/globe-view/
- https://maplibre.org/roadmap/globe-view/
- https://maplibre.org/roadmap/maplibre-native

### Mapbox GL JS + Navigation stack

Mapbox’s official docs show:

- web globe projection in GL JS,
- directions/route APIs,
- native iOS Navigation SDK with voice instructions,
- native Android navigation support for speed-limit UI and speed warnings.

That makes Mapbox the most complete match for the requested future shape if BidOnDent wants:

- true immersive globe on web,
- real routing,
- better native/mobile portability for turn-by-turn experiences,
- voice-guidance architecture that can graduate from web shell to native later.

Tradeoff:

- provider cost / vendor lock-in
- token management
- future pricing sensitivity

Sources:

- https://docs.mapbox.com/mapbox-gl-js/guides/projections/
- https://docs.mapbox.com/mapbox-gl-js/guides/globe/
- https://docs.mapbox.com/api/navigation/directions/
- https://docs.mapbox.com/ios/navigation/guides/
- https://docs.mapbox.com/android/navigation/v2/guides/ui-components/speed-limit/
- https://docs.mapbox.com/android/navigation/ux/configuration/speed-limits-configuration/

### CesiumJS

CesiumJS is excellent for a high-precision 3D globe and world-scale geospatial scenes. It is not the natural first choice for BidOnDent’s everyday embedded operational coverage maps or Apple-like route UX.

Best use case:

- dramatic globe-heavy exploratory or geospatial scenes

Weaker fit for:

- task-focused operational embedded maps
- conventional consumer turn-by-turn map UX

Sources:

- https://cesium.com/platform/cesiumjs/
- https://cesium.com/learn/cesiumjs-learn/

## 3.3 Recommendation

### Recommended architecture

Do not force one map technology to do every job.

Instead, split the map system into three layers:

#### Layer A: Operational Coverage Map

- stays lightweight
- embedded in landing/dashboard/workflows
- optimized for speed and practical coverage tasks
- can remain on the current Leaflet stack in the near term

#### Layer B: Immersive Fullscreen Map

- premium fullscreen command-center experience
- brand-rich roadmap/night/satellite presentation
- candidate home for true globe behavior
- should not be forced into every embedded operational map

#### Layer C: Navigation Platform

- route search
- route overview
- turn list
- navigation HUD
- location tracking
- voice mode controls
- persisted route session memory
- mobile-portable architecture

This layer should be provider-abstracted and treated as its own product surface, not a button added to the current Leaflet component.

## 4. Live Now vs Planned Later Truth Table

| Capability                                            | Live now  | Planned later / not yet live | Evidence                                                                                                                         |
| ----------------------------------------------------- | --------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Landing renders before Clerk hydration                | Yes       | No                           | `src/app/App.tsx`                                                                                                                |
| Customer reports save through Clerk-aware backend     | Yes       | No                           | `src/app/hooks/useAppHandlers.ts`, `src/app/services/supabase/clerkEdgeData.ts`, `supabase/functions/server/handlers/reports.ts` |
| Shop bids persist through backend                     | Yes       | No                           | `src/app/hooks/useAppHandlers.ts`, `supabase/functions/server/handlers/bids.ts`                                                  |
| Customer bid list renders from live bid objects       | Yes       | No                           | `src/app/components/codelayer/BidsScreen.tsx`                                                                                    |
| Notification bell opens real panel                    | Yes       | No                           | `src/app/components/app/DashboardLayout.tsx`, `src/app/components/dashboard/NotificationCenter.tsx`                              |
| Notification source of truth is fully unified         | No        | Yes                          | seeded defaults still live in `src/app/constants/index.ts`; overlapping dropdown logic still exists                              |
| Embedded coverage map with ZIP/geolocation/radius     | Yes       | No                           | `OperatingRegionsSection`, `ServiceCoverageMap`, `useCoveragePartnerShops`                                                       |
| Satellite mode                                        | Yes       | No                           | `mapTileLayers.ts`                                                                                                               |
| Midnight mode                                         | Partially | Yes                          | current mode is generic CARTO dark raster tiles, not a custom premium BidOnDent system                                           |
| Fullscreen command-center coverage map                | Yes       | No                           | `CoverageMapDialog.tsx`                                                                                                          |
| True globe rendering                                  | No        | Yes                          | current fullscreen mode is still Leaflet-based and faux orbital logic                                                            |
| Turn-by-turn routing                                  | No        | Yes                          | no routing provider dependency, no route engine, no turn model                                                                   |
| Voice guidance                                        | No        | Yes                          | no voice service abstraction or TTS/provider integration                                                                         |
| Current speed / speed limit                           | No        | Yes                          | no location-matching or road-speed data path                                                                                     |
| Directions session local memory                       | No        | Yes                          | view state is persisted, but no route/navigation session state exists                                                            |
| Last-view local memory                                | Yes       | No                           | `src/app/hooks/useNavigation.ts`                                                                                                 |
| Report draft local memory                             | Yes       | No                           | `src/app/components/codelayer/report/reportDraftStorage.ts`                                                                      |
| Shop requests are fully truthful operational jobs     | No        | Yes                          | request list still synthesizes customer and contact fields in `ShopRequestsScreen.tsx`                                           |
| Insurer claims are fully real claim workflows         | No        | Yes                          | claim views still synthesize numbers and labels in `InsurerClaimsScreen.tsx`                                                     |
| Admin access matches requested temporary relaxed mode | No        | Yes                          | legacy email/test-account config still present                                                                                   |

## 5. Broken / Weak Workflow Surfaces Identified

These are Phase 1 findings only. They are not solved here unless already fixed in earlier passes.

### Shell / navigation

- `DashboardLayout` header search is currently decorative only.
- Some view strings are effectively untyped or only loosely typed across navigation and router boundaries.

### Notifications

- Seeded notifications still exist and can make the product appear more live than it really is.
- `ProfileDropdown` still contains overlapping notification/realtime logic even though the bell is now the better shell surface.

### Shop flow

- `ShopRequestsScreen.tsx` still injects generic customer identity/contact placeholders rather than truthful live data.
- Service-area eligibility is not yet a first-class constraint.

### Insurer flow

- `InsurerClaimsScreen.tsx` fabricates claim numbers and estimates.
- `InsurerNewClaimScreen.tsx` is still mostly a UI workflow shell over derived data rather than a persisted claim-management path.

### Admin

- admin is still conceptually tied to email-linked account rules and test-account switching
- this conflicts with the requested temporary relaxed-access model

### Map

- current fullscreen faux orbital mode is visually broken and should not be treated as a finished feature
- no truthful navigation domain exists yet

## 6. Recommended Phased Implementation Plan

## Phase 1: Audit and source-of-truth docs

Goal:

- clarify architecture
- identify reality gaps
- define a clean module plan
- stop fake-complete expectations

Outputs:

- this audit
- refreshed code organization doc
- refreshed backlog

## Phase 2: Foundation cleanup

Goal:

- strengthen type safety and ownership before provider work

Targets:

- tighten `ViewMode` and router typing
- isolate notification ownership
- replace seeded notification defaults with honest empty/live states
- centralize role-view report adapters
- define local memory/session contracts for map and navigation
- remove or quarantine the broken faux orbital logic if not immediately replaced

## Phase 3: Map platform split

Goal:

- cleanly separate lightweight coverage maps from immersive maps

Targets:

- extract shared coverage-search state from landing/dashboard shells
- split `ServiceCoverageMap` into operational vs immersive variants
- create a `map provider adapter` seam
- upgrade midnight mode into a richer branded operational theme

## Phase 4: Navigation platform foundation

Goal:

- build truthful navigation architecture without pretending web-only polish equals production nav

Targets:

- route models
- navigation session state
- voice mode state
- route overview panel
- turn list panel
- local memory for resumed directions
- feature flags for non-live provider-backed features if needed

## Phase 5: Provider-backed immersive/navigation implementation

Goal:

- only after approval, adopt the right provider-backed stack for real globe + routing ambitions

Decision gate:

- if vendor lock-in/cost is acceptable, Mapbox is the strongest match for the requested web + future native direction
- if open-source-first is prioritized, MapLibre is the stronger web-globe option, but native parity and navigation capability are weaker

## Phase 6: Role workflow completion

Goal:

- make shop, insurer, and admin surfaces as truthful and operational as the customer flow

Targets:

- real claim linkage
- truthful shop opportunity routing
- relaxed admin access model
- admin clutter reduction
- better cross-role notification/event delivery

## 7. Exact File / Module Plan

This plan fits the current repo without forcing a total folder rewrite.

## 7.1 Coverage map domain

Recommended additions:

- `src/app/features/coverage/useCoverageSearchState.ts`
- `src/app/features/coverage/coverage-storage.ts`
- `src/app/features/coverage/coverage-adapters.ts`
- `src/app/features/coverage/coverage-types.ts`

Recommended responsibility split:

- keep `OperatingRegionsSection.tsx` as a presentation shell
- move shared ZIP/radius/location/search state out of the landing component
- let dashboard/admin reuse the same search state contract

## 7.2 Map presentation domain

Recommended additions:

- `src/app/features/map/OperationalCoverageMap.tsx`
- `src/app/features/map/ImmersiveCoverageMap.tsx`
- `src/app/features/map/MapModeControls.tsx`
- `src/app/features/map/MapHud.tsx`
- `src/app/features/map/MapLegend.tsx`
- `src/app/features/map/map-provider-adapter.ts`

Recommended evolution:

- current `ServiceCoverageMap.tsx` should eventually become a composition layer or be split
- embedded operational map should stay fast
- immersive fullscreen map can own richer visuals and low-zoom globe behavior

## 7.3 Navigation domain

Recommended additions:

- `src/app/features/navigation/navigation-types.ts`
- `src/app/features/navigation/navigation-storage.ts`
- `src/app/features/navigation/useNavigationSession.ts`
- `src/app/features/navigation/routing-service.ts`
- `src/app/features/navigation/location-tracking-service.ts`
- `src/app/features/navigation/voice-guidance-service.ts`
- `src/app/features/navigation/RouteOverviewPanel.tsx`
- `src/app/features/navigation/TurnByTurnPanel.tsx`
- `src/app/features/navigation/NavigationHUD.tsx`
- `src/app/features/navigation/SpeedLimitBadge.tsx`
- `src/app/features/navigation/CurrentSpeedBadge.tsx`
- `src/app/features/navigation/VoiceControlsSheet.tsx`

Key rule:

- do not bury future route/session/voice state inside the current Leaflet coverage component

## 7.4 Notification domain

Recommended additions:

- `src/app/features/notifications/notification-types.ts`
- `src/app/features/notifications/notification-adapters.ts`
- `src/app/features/notifications/useNotificationCenterState.ts`

Recommended cleanup:

- keep the shell bell as the primary notifications surface
- reduce `ProfileDropdown` notification duplication
- replace seeded defaults with honest initial states or server-backed activity

## 7.5 Role workflow adapters

Recommended additions:

- `src/app/features/reports/report-view-models.ts`
- `src/app/features/bids/bid-view-models.ts`
- `src/app/features/insurer/claim-view-models.ts`
- `src/app/features/shop/request-view-models.ts`

Purpose:

- stop repeatedly transforming mixed report shapes inside individual screens
- reduce fake-safe derived fields that are currently scattered through shop/insurer screens

## 8. Documentation Governance Updates

## Active source-of-truth docs after this phase

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/CODE_ORGANIZATION_AUDIT.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`
- `docs/JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`

## Docs that should no longer be treated as authoritative without review

- `docs/FIXES_APPLIED.md`
- `docs/IDENTIFIED_ISSUES.md`
- `docs/PROJECT_COMPLETION_SUMMARY.md`
- `docs/PROJECT_STATUS.md`
- `docs/COMPREHENSIVE_TEST_PLAN.md`
- `docs/CROSS_ACCOUNT_TESTING_PLAN.md`

## 9. Recommended Architecture Decision

### Recommended answer for now

Do not swap providers in Phase 1.

Recommended next-step architecture:

- keep Leaflet for fast embedded operational coverage maps,
- prepare a separate immersive/navigation domain,
- make a provider decision only after explicit approval,
- treat real globe + turn-by-turn + speed-limit + voice guidance as provider-backed work, not a styling exercise.

### Recommendation if immersive globe + premium navigation are approved later

If the goal is:

- true fullscreen globe,
- route overview,
- future mobile-driving alignment,
- native voice/speed-limit capability later,

then Mapbox is the strongest single-stack candidate.

If the goal is:

- open-source-first web globe,
- lower vendor lock-in,
- no immediate native-navigation commitment,

then MapLibre GL JS is the cleaner web-only globe candidate, but it is weaker for the future mobile-navigation story.
