# Phase 2 Platform Recommendation

**Last updated:** March 28, 2026
**Status:** Historical architecture recommendation reference

**Date**: March 20, 2026  
**Scope**: Architecture-first Phase 2 recommendation plus one tightly scoped implementation wave  
**North Star**: Move BidOnDent toward a premium map-driven product surface with honest capability boundaries.  
**Status (2026-03-21)**: Phase 2 Wave 1 largely complete. Most "Not real" items now implemented. Phase 3 direction documented below.

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

## 3. What Should Wait (updated 2026-03-21)

Most items from the original "What Should Wait" list have been implemented since Phase 2 was written. This section now reflects what genuinely should still wait.

### Already implemented (no longer waiting)

- ~~in-app route engine~~ → OSRM public integration, real routing
- ~~in-app turn-by-turn navigation HUD~~ → 15+ maneuver templates, step-by-step UI
- ~~live speed and speed-limit integration~~ → Overpass API + GPS-derived speed with confidence scoring
- ~~premium TTS voice implementation~~ → Web Speech API with personas and volume presets (browser-quality, not premium-quality)

### Still waiting (genuine future items)

- Provider swap to Mapbox GL / MapLibre GL — blocked until globe rendering or rate limits justify cost
- True globe rendering — requires provider migration, no established timeline
- Premium TTS voices (Google Cloud TTS, ElevenLabs) — current browser TTS works but quality varies across devices
- Schema changes for cloud-synced navigation sessions — `navigation_sessions` Supabase table not yet created
- Schema changes for marketplace-aware map intelligence — `shop_service_areas`, `report_locations`, `shop_availability` tables not yet created
- Major auth architecture changes tied to navigation or mobile — Clerk/Supabase identity alignment still pending

## 4. Live Now vs Next Later

| Area                                  | Status now     | Recommendation                                                       |
| ------------------------------------- | -------------- | -------------------------------------------------------------------- |
| Embedded coverage map                 | Real           | Keep and refine                                                      |
| Fullscreen coverage dialog            | Real (2026-03) | Polished — command center with glass overlays + command pod          |
| External directions launch            | Real           | Keep and deepen                                                      |
| Local map state memory                | Real           | Keep and deepen                                                      |
| Local directions/session memory       | Real (2026-03) | localStorage v2 — saves route, origin, destination, provider         |
| Premium fullscreen composition        | Real (2026-03) | Glass overlays, command pod, in-map controls, layered entry timing   |
| Midnight royal-blue theme             | Real (2026-03) | Full royal-blue palette in mapSurfaceTheme + theme.css controls      |
| Unified capability truth in code/docs | Real (2026-03) | Product Brain + Map Master + Tracker + Phase 2 now cross-referenced  |
| Route overview panel shell            | Real (2026-03) | Implemented — route summary card + turn list in command center       |
| Navigation session domain             | Real (2026-03) | localStorage v2 with route/origin/destination/provider               |
| Voice mode model                      | Real (2026-03) | Web Speech API TTS with voice personas and volume presets            |
| In-app turn-by-turn                   | Real (2026-03) | OSRM public service → 15+ maneuver templates → step-by-step UI       |
| Live speed / speed limit              | Real (2026-03) | GPS-derived speed + Overpass API speed-limit with confidence scoring |
| True globe with accurate stars        | Not real       | Wait for provider decision (requires Mapbox GL / MapLibre GL)        |

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

## 7. Phase 2 Retrospective (2026-03-21)

Phase 2 Wave 1 has been largely completed. The truth table above now shows 10 of 14 items as "Real (2026-03)." Key accomplishments:

- Navigation session domain fully implemented with localStorage v2 versioned envelopes
- Voice navigation, turn-by-turn, speed HUD all implemented with real free-tier APIs
- Fullscreen command center polished with glass overlays, command pod, layered animations
- Royal-blue palette applied to full map surface theme (light + dark)
- Immersive map chrome partially modularized (surface controls, status bar, command center components)
- Strategic docs cross-referenced and truth table corrected

Remaining from original Phase 2 scope:

- Globe rendering still blocked on provider decision
- Navigation session cloud sync still localStorage-only

## 8. Phase 3 Direction

Phase 3 represents the next strategic wave. It should not be started until Phase 2's remaining reliability gaps are addressed. Each pillar follows the consistent 6-part structure. The Product Brain contains full implementation detail — this section captures the architectural direction.

### Phase 3 Goal

Move BidOnDent from "map features work" to "map features are productized, reliable, and marketplace-aware."

### Pillar 1: Navigation reliability hardening

**1. Current State:** GPS, routing, voice, and speed HUD all work but with no graceful degradation for failures. No rerouting, no cross-browser testing, no error telemetry.

**2. Productizing Stage:** Add graceful degradation for GPS loss, network errors, stale speed data. Deviation detection with reroute prompt. Cross-browser voice testing. Error telemetry.

**3. Aspirational Stage:** Automatic rerouting, live ETA updates, navigation settings UI, cloud sync.

**4. Technical Prerequisites:** Error boundary around navigation components. Deviation calculation utility. Browser compatibility matrix for Web Speech API.

**5. UI/UX Evolution Path:** Same panel → visible error/warning states → settings drawer → responsive live updates.

**6. Non-goals:** Do not add multi-stop routing or CarPlay before single-route reliability is production-grade.

**Full detail:** Product Brain "Navigation Productization Roadmap"

### Pillar 2: Design system expansion

**1. Current State:** Royal-blue glass design language exists only on map surfaces. 7 of 9 major app surfaces use no map tokens. All glass/blur CSS is scoped to `.coverage-map-surface`.

**2. Productizing Stage:** Extract palette to CSS custom properties (`--bd-royal-blue`, etc.). Create non-map-scoped glass classes (`bd-glass-panel`, `bd-glass-card`). Adopt in DashboardCoveragePanel, MobileBottomNav, ProfileDropdown.

**3. Aspirational Stage:** Role dashboard cards, landing sections, and full dashboard shell adopt glass tokens. Single `globalSurfaceTheme.ts` serves the entire app.

**4. Technical Prerequisites:** CSS custom properties for royal-blue palette. Non-map-scoped glass utility classes. Dark mode support in all consuming surfaces.

**5. UI/UX Evolution Path:** Map-only glass → shared shell surfaces → role dashboards → full site-wide identity.

**6. Non-goals:** Do not force glass on forms/tables/data-entry. Do not create a component library abstraction. Do not skip Stage 1-2 prerequisites when starting Stage 3.

**Full detail:** Product Brain "Design System Direction"

### Pillar 3: Cloud persistence for navigation

**1. Current State:** All navigation persistence is localStorage-only with v2 versioned envelopes. Sessions are lost on device change. No cloud sync.

**2. Productizing Stage:** Create `navigation_sessions` Supabase table. Build sync service with conflict resolution. Migrate from localStorage-primary to Supabase-primary with localStorage as cache only.

**3. Aspirational Stage:** Full navigation history with cloud persistence. Cross-device session continuity. Navigation preferences synced.

**4. Technical Prerequisites:** `navigation_sessions` Supabase table schema. `navigation_preferences` Supabase table. Conflict resolution strategy (last-write-wins with version check).

**5. UI/UX Evolution Path:** No visible change initially — sync happens transparently. Later: navigation history viewable in settings/profile.

**6. Non-goals:** Do not change the navigation UI to accommodate sync. Do not add sync indicators that distract from the driving experience. Supabase is source of truth — this is a non-negotiable.

### Pillar 4: Role-specific map intelligence (first pass)

**1. Current State:** All roles see the same shared coverage map. No role-specific geographic intelligence. No geo-coded report data or service area boundaries.

**2. Productizing Stage:** Customer nearest-shops compact widget (data already available). Shop service area visualization (requires `shop_service_areas` Supabase table). Insurer network coverage overview (requires relationship + location data).

**3. Aspirational Stage:** Request heatmaps, proximity alerts, claims density analysis, coverage gap detection, smart shop recommendation routing.

**4. Technical Prerequisites:** `report_locations` table (geo-indexed). `shop_service_areas` table. `shop_availability` table. Real-time Supabase subscriptions.

**5. UI/UX Evolution Path:** Shared coverage map → role-specific compact dashboard widgets → interactive drill-down intelligence surfaces.

**6. Non-goals:** Do not build heatmaps before underlying data tables exist. Do not show fabricated intelligence. Ensure demo mode support from day one.

**Full detail:** Product Brain "Role-Specific Future Map Intelligence"

### Phase 3 Cross-Cutting Non-Goals

These apply to Phase 3 as a whole, not to any single pillar:

- Do not pursue globe rendering or provider migration in Phase 3
- Do not change auth architecture (Clerk/Supabase alignment) as part of Phase 3

### Phase 3 Architecture Risks

1. Cloud sync conflict resolution is non-trivial — if a user has different sessions on different devices, which wins?
2. Supabase schema additions for map intelligence tables must not break existing migrations
3. Design token adoption in non-map surfaces could reveal inconsistencies in dark mode support
4. Role-specific map widgets need demo mode support from day one

### Cross-Document References for Phase 3

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — feature maturity tiers, design system staged plan, navigation productization levels, role-specific map intelligence architecture
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — Future Themes A-D, provider evolution decision framework
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — staged future roadmap with near/medium/long-term items
