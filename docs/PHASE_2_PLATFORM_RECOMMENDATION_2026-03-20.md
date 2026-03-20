# Phase 2 Platform Recommendation

**Date**: March 20, 2026  
**Scope**: Architecture-first Phase 2 recommendation plus one tightly scoped implementation wave  
**North Star**: Move BidOnDent toward a premium map-driven product surface without pretending the current stack already supports true globe or in-app navigation.

## 1. Comparison: My Plan vs Your Direction

### What I was already planning next

- finish notification source-of-truth cleanup
- improve coverage map truthfulness and local session memory
- keep embedded maps fast and avoid fake provider-heavy features
- prepare a cleaner navigation foundation before considering a provider swap

### What you have been asking for across our history

- more premium fullscreen map design
- stronger Apple Maps-inspired hierarchy and polish, but still BidOnDent
- local memory for reloads, especially map and directions context
- true globe ambition when zooming far out
- future mobile-driving readiness
- turn-by-turn, route overview, voice controls, speed/safety HUD architecture
- stronger code organization, better docs, fewer dead or fake-feeling controls

### What the screenshots are clearly pushing toward

- a map that feels like a premium command center, not a utility widget
- better glass, composition, spacing, and control hierarchy
- clearer difference between embedded operational maps and immersive fullscreen mode
- a future navigation surface with richer route/session UI

### Where these align

- truthful implementation matters more than flashy fakery
- the fullscreen map needs to feel more premium than it does now
- local memory and session continuity matter
- map code should be split into clearer modules
- the app needs a future-safe navigation architecture before it needs fake turn-by-turn UI

### Where they conflict

- your globe request points toward a globe-capable provider
- the current Leaflet stack is still the right fit for embedded coverage lookups
- forcing Leaflet to impersonate Apple Maps globe/navigation behavior creates broken and misleading UX

## 2. Best Next Move

The highest-value next wave is:

**Build the immersive coverage command-center foundation properly while keeping embedded coverage maps lightweight and honest.**

That means:

1. keep Leaflet as the embedded operational coverage map
2. cleanly separate immersive fullscreen chrome from map rendering
3. add a real navigation session memory layer for external route handoff
4. improve fullscreen composition, hierarchy, and royal-blue night treatment
5. document the truth:
   - external directions are live now
   - local route/session memory is live now
   - real globe, in-app turn-by-turn, live speed, and voice navigation still wait on a provider decision

This gets BidOnDent closer to the premium direction immediately **without lying about unsupported capabilities**.

## 3. What Should Wait

These should **not** be forced into this wave:

- provider swap to Mapbox/MapLibre/other globe-capable stack
- true globe rendering
- in-app route engine
- in-app turn-by-turn navigation HUD
- live speed and speed-limit integration
- premium TTS voice implementation
- schema or auth architecture changes tied to navigation or mobile

## 4. Live Now vs Next Later

| Area                                  | Status now            | Recommendation                     |
| ------------------------------------- | --------------------- | ---------------------------------- |
| Embedded coverage map                 | Real                  | Keep and refine                    |
| Fullscreen coverage dialog            | Real but needs polish | Improve now                        |
| External directions launch            | Real                  | Keep and deepen                    |
| Local map state memory                | Real                  | Keep and deepen                    |
| Local directions/session memory       | Partial               | Build now                          |
| Premium fullscreen composition        | Partial               | Improve now                        |
| Midnight royal-blue theme             | Partial               | Improve now                        |
| Unified capability truth in code/docs | Partial               | Improve now                        |
| Route overview panel shell            | Not real              | Scaffold next                      |
| Navigation session domain             | Partial               | Build now                          |
| Voice mode model                      | Not real              | Scaffold next                      |
| In-app turn-by-turn                   | Not real              | Wait for provider/product decision |
| Live speed / speed limit              | Not real              | Wait for provider/product decision |
| True globe with accurate stars        | Not real              | Wait for provider/product decision |

## 5. Exact File / Module Plan

### Docs

- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
  - this recommendation and truth table
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
  - update backlog to reflect the chosen Phase 2 wave
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`
  - keep production truth aligned with current implementation

### Navigation foundation

- `src/app/types/navigation.ts`
  - provider/session/navigation types
- `src/app/services/navigation/navigationSession.ts`
  - local persistence for last route handoff
- `src/app/services/navigation/externalNavigation.ts`
  - save route handoff state when launching Apple Maps / Google Maps / Waze

### Immersive map chrome split

- `src/app/components/maps/MapSurfaceHeaderBadges.tsx`
  - title/focus/overview badges
- `src/app/components/maps/MapSurfaceControls.tsx`
  - roadmap / midnight / satellite / focus / overview / fullscreen controls
- `src/app/components/maps/MapSurfaceStatusBar.tsx`
  - bottom live status pills
- `src/app/components/maps/command-center/CoverageCommandCenterHeader.tsx`
  - dialog header shell
- `src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx`
  - metrics, selected destination, and recent route memory

### Existing files to refine

- `src/app/components/maps/ServiceCoverageMap.tsx`
  - consume new map chrome modules
  - improve immersive low-zoom composition
  - improve midnight visual treatment
- `src/app/components/landing/CoverageMapDialog.tsx`
  - consume new command-center header/sidebar modules
- `src/app/components/landing/CoverageNearestShops.tsx`
  - use shared provider labels and keep shop actions tighter
- `src/app/components/landing/OperatingRegionsSection.tsx`
  - wire navigation session memory into the fullscreen experience

## 6. Phase 2 Wave Chosen Right Now

This first Phase 2 implementation wave should do four things only:

1. document the Phase 2 recommendation
2. add local navigation session memory
3. modularize the immersive map shell into smaller map modules
4. visually refine the fullscreen command center so it feels more premium and more deliberate

That keeps the work:

- architecture-first
- code-clean
- truthful
- aligned with your screenshots
- small enough to validate safely before bigger provider decisions
