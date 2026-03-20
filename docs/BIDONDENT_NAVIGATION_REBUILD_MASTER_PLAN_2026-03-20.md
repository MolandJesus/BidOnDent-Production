# BidOnDent Navigation Rebuild Master Plan

**Date**: March 20, 2026  
**Status**: Active source-of-truth plan  
**Primary goal**: Rebuild the current coverage and navigation experience into a cleaner, more Apple Maps-inspired product surface while staying honest about what a web browser can and cannot truly do today.

## 1. Why This Plan Exists

This plan replaces the previous "polish-only" framing for the map work.

The current direction is no longer just:

- make the fullscreen map prettier
- add a few route details
- save a little more local state

The new direction is:

- make the fullscreen map feel much closer to a premium consumer navigation product
- keep the implementation understandable for human developers
- ship real browser-backed search, route preview, live GPS tracking, voice modes, speed and speed-limit context
- add meaningful Apple Maps-style conveniences like saved places and parked-car memory
- keep the browse state full of BidOnDent-specific value instead of generic map filler
- support real place lookup plus live/demo-friendly body-shop discovery data for insurer and customer testing flows
- prepare the map surface so customer, insurer, and shop accounts can each land in a purpose-built version of the same navigation foundation
- keep the code organized enough that future provider upgrades or native app work do not require tearing everything apart

This document is intentionally extensive because the request is no longer a small feature request. It is a product-surface rebuild.

## 2. Product Intent

BidOnDent should feel like:

- a trustworthy coverage and routing surface
- a premium map experience rather than a generic utility widget
- a navigation flow that feels deliberate and polished
- a branded product, not a direct copy of Apple Maps
- a BidOnDent-first marketplace surface where nearby shops, insurer lookup, and coverage intelligence are visible in the product identity

BidOnDent should **not** pretend to be:

- a native iOS navigation SDK
- a true Apple Maps clone
- a globe-capable 3D map engine when the current web stack cannot do that honestly

## 3. North Star Experience

When this rebuild matures, a user should be able to:

1. Search a home, store, or shop address naturally.
2. Pick from real address results.
3. See a clean route preview inside BidOnDent.
4. Start an active navigation mode with a top maneuver card, live tracking, a bottom sheet, and voice controls.
5. Save important places such as Home, Work, Frequent Shop, and custom places.
6. Save the parked-car location from the last known device fix.
7. Jump between roadmap, night, and satellite views that feel more premium and more intentional.
8. Resume context after reload without losing search, destination, or recent guidance preferences.
9. Browse real nearby places and body shops in a landing-page fullscreen surface that still reads as BidOnDent.
10. Give insurers, customers, and shops tailored map entry points without duplicating the whole navigation stack.

## 4. Truthful Baseline As Of March 20, 2026

### Already live or mostly live

- ZIP and radius coverage lookup
- fullscreen coverage dialog
- address search using submit-based Nominatim lookup
- route preview using OSRM demo routing
- browser GPS tracking
- current speed from device GPS when available
- nearby-road speed-limit lookup from OSM maxspeed tags
- browser speech-synthesis voice guidance with British-English preference when available
- role-switchable live nearby-place discovery using public OpenStreetMap data
- selectable live-place preview cards and highlighted live-place map markers inside fullscreen browse mode
- local persistence for map state and navigation preferences
- external handoff to Apple Maps, Google Maps, and Waze

### Real gaps that still exist

- no true vector navigation map engine
- no native-grade route snapping
- no lane guidance
- no map rotation tied to heading
- no true globe
- no provider-grade autocomplete backend
- no premium/provider-backed real-places catalog yet beyond current public web-search sources
- no shared cloud-synced saved places yet
- only partial parked-car memory so far
- only partial Apple-style active-navigation layout so far
- no role-aware customer/insurer/shop map presentation yet

That means the plan must upgrade the experience **without lying about these constraints**.

## 5. Core Product Principles

### 5.1 Human-Organized Code First

Every major addition should land in one of these categories:

- domain types
- storage/services
- hooks/state
- presentational UI
- map controllers
- documentation/tests

We should avoid:

- giant god-components
- UI components that also own storage decisions
- hooks that hide unrelated behavior
- "quick" anonymous in-component helper piles

### 5.2 Premium But Honest

We can emulate:

- hierarchy
- glass
- spacing
- motion
- overlay composition
- bottom-sheet behavior
- saved places workflow
- parked-car memory
- real places and body-shop discovery should remain product-branded and role-aware

We should not fake:

- 3D globe Earth rendering with the current Leaflet setup
- native heading-follow rotation
- lane-level automotive guidance
- true provider-backed autocomplete quality if we are still using Nominatim submit search

### 5.3 Local-First Now, Upgradeable Later

Saved places and parked-car memory should start as:

- local-browser features
- typed storage contracts
- swappable services

This keeps the work useful now and easy to promote later into:

- account-backed persistence
- mobile-native persistence
- provider-backed sync

## 6. Product Scope

## 6.1 Must-Build

- Apple Maps-inspired active-navigation mode
- cleaner route-preview mode
- better search presentation
- real places lookup path that can later move behind a server/provider adapter
- browse-mode nearby stores plus guide cards instead of idle speed widgets
- saved places section
- parked-car location feature
- richer voice controls
- prettier roadmap and night styling
- account-type-aware map entry points for customer, insurer, and shop use cases
- documentation refresh

## 6.2 Nice-To-Have In This Wave

- share ETA helper
- call destination from the bottom sheet
- recent destinations list
- "recenter to me" quick control in active mode

## 6.3 Explicitly Deferred

- native globe
- true 3D building layer
- lane guidance
- traffic models
- cloud-synced saved places
- provider swap to Mapbox / MapLibre / other

## 7. Experience Modes

The rebuilt system should have two clearly separated modes.

### 7.1 Route Setup / Preview Mode

Purpose:

- search for an address
- pick destination
- inspect route summary
- choose voice/GPS/speed settings
- review nearby shops, saved places, and browse guides

Primary UI:

- clean search surface
- nearby stores and guides section
- saved places shortcuts
- parked-car card when available
- route summary card
- "Start Route" button
- no persistent speed-limit badge block in this mode

### 7.2 Active Navigation Mode

Purpose:

- follow the route
- read the next maneuver instantly
- monitor arrival time, remaining time, and distance
- show current speed and posted-limit badges only in this mode
- access turn list and voice controls quickly

Primary UI:

- top maneuver card
- floating control rail
- bottom summary sheet
- turn list drawer
- voice controls drawer
- tighter, cleaner map rendering
- route-only speed badges with over-limit warning states

## 7.3 BidOnDent Role Surfaces

The fullscreen map cannot become a generic maps clone. It needs role-specific framing built on the same shared foundation.

### Customer-facing fullscreen goals

- search a home or destination naturally
- preview nearby BidOnDent partner shops
- understand route convenience and saved-place shortcuts
- keep the experience polished enough for landing-page marketing use

### Insurer-facing fullscreen goals

- search by place, claim area, or destination region
- compare nearby body shops more directly
- use the fullscreen map as a shop-lookup and partner-comparison surface
- support truthful demo/testing with live or live-like nearby partner data

### Shop-facing fullscreen goals

- view nearby competing or complementary shops where policy allows
- understand regional density and destination convenience
- reuse the same route/search foundation without leaking insurer-only workflow controls

## 8. Information Architecture

## 8.1 Navigation Domain

The navigation domain should own:

- address results
- active origin
- selected destination
- route preview
- step progression
- GPS fix and speed
- speed-limit snapshot
- voice preferences
- saved places
- parked car

## 8.2 Presentation Domain

Presentation should own:

- whether active navigation mode is open
- whether turn list is open
- whether voice controls sheet is open
- whether the map should auto-follow the current position
- copy/share transient states

## 8.3 Map Domain

The map layer should own:

- tiles
- markers
- route line
- GPS marker
- follow-location camera behavior
- chrome visibility rules per presentation mode

## 9. Proposed Code Organization

This is the target organization for this wave.

### Existing files to keep and refine

- `src/app/hooks/useCoverageNavigationExperience.ts`
- `src/app/services/navigation/addressSearch.ts`
- `src/app/services/navigation/routeEngine.ts`
- `src/app/services/navigation/speedLimit.ts`
- `src/app/services/navigation/voiceGuidance.ts`
- `src/app/components/maps/ServiceCoverageMap.tsx`
- `src/app/components/landing/CoverageMapDialog.tsx`

### New storage/service files

- `src/app/services/navigation/savedLocations.ts`
  - local saved places storage
- `src/app/services/navigation/parkedCarLocation.ts`
  - local parked-car memory storage

### New UI files

- `src/app/components/maps/navigation/NavigationActiveSurface.tsx`
- `src/app/components/maps/navigation/NavigationManeuverCard.tsx`
- `src/app/components/maps/navigation/NavigationBottomSheet.tsx`
- `src/app/components/maps/navigation/NavigationQuickControls.tsx`
- `src/app/components/maps/navigation/NavigationTurnListDrawer.tsx`
- `src/app/components/maps/navigation/NavigationVoiceControlsDrawer.tsx`
- `src/app/components/maps/navigation/NavigationSavedPlacesPanel.tsx`
- `src/app/components/maps/navigation/navigationVisuals.tsx`

### New controller files

- `src/app/components/maps/MapFollowLocationController.tsx`

### Optional new hook

- `src/app/hooks/useSavedNavigationLocations.ts`
  - if the storage layer becomes large enough to justify its own hook

## 10. Saved Places Plan

Saved places should feel familiar and fast.

### 10.1 First release behavior

Store locally:

- Home
- Work
- custom saved places
- recent destinations

Each saved place should include:

- id
- label
- category
- optional subtitle
- coordinates
- source
- lastUsedAt
- createdAt

### 10.2 Saved place actions

Each saved place should support:

- use as origin
- use as destination
- rename
- delete

### 10.3 Saved places categories

Initial categories:

- `home`
- `work`
- `saved`
- `recent`
- `parked-car`

### 10.4 UX placement

Saved places should appear in route setup mode:

- below the search field
- above the long route planner details
- with obvious Home and Work affordances

They may also appear in active mode:

- as contextual chips in the bottom sheet
- or as a quick destination-replace action later

## 11. Parked Car Plan

This feature should be useful and honest in the browser.

### 11.1 First release behavior

The user can tap:

- `Save Parked Car`

That action stores:

- current GPS coordinate
- timestamp
- GPS accuracy
- optional nearest-road label

### 11.2 Parked car UX

The parked-car card should show:

- saved time
- rough location label
- accuracy note if helpful
- actions:
  - center on parked car
  - route to parked car
  - clear parked car

### 11.3 Truthfulness note

This is not automatic Bluetooth/car-detection parked-car logic like native Apple Maps.

This first version should be:

- manual save
- local browser storage
- GPS-based

That is still useful and truthful.

## 12. Search Experience Plan

## 12.1 Current reality

Current search is submit-based and uses Nominatim.

That means:

- we can return real address results
- we should avoid pretending we have premium keystroke-by-keystroke autocomplete quality

## 12.2 Improved presentation

The UI should still feel premium by improving:

- field styling
- result list hierarchy
- saved places below search
- recent destinations
- clearer "use current location" action

## 12.3 Future upgrade path

If a provider decision is approved later, this domain should be swappable to:

- a provider-backed search/autocomplete API
- stronger POI lookup
- better normalization and ranking

## 13. Active Navigation UI Spec

This is the heart of the Apple Maps-inspired rebuild.

## 13.1 Top Maneuver Card

Must show:

- current maneuver icon
- current instruction text
- distance to maneuver
- next maneuver preview

Should feel:

- bold
- dark
- high-contrast
- rounded and floating

## 13.2 Floating Control Rail

Must include:

- route steps
- voice controls
- recenter/follow my location

Optional:

- end route shortcut if needed later

## 13.3 Bottom Summary Sheet

Must include:

- arrival clock time
- remaining minutes
- remaining distance
- destination card
- call action if phone exists
- share ETA
- voice controls
- end route

Should feel:

- bright
- softly blurred
- heavy rounded corners
- more like a polished iOS bottom sheet than a generic sidebar card

## 13.4 Turn List Drawer

Must show:

- full step list
- highlighted current step
- upcoming steps underneath
- maneuver icons and distances

## 13.5 Voice Controls Drawer

Must show:

- Muted
- Alerts Only
- Full Voice
- volume preset:
  - Louder
  - Normal
  - Softer

Should also show:

- preferred voice label if browser provides one
- a note when browser voice guidance is unavailable

## 14. Visual Redesign Plan

## 14.1 Map View

Roadmap should move closer to:

- softer base tones
- cleaner overlays
- calmer control styling
- more premium white/blue glass surfaces

BidOnDent branding should stay visible via:

- brand-blue accents
- premium cyan/sky route emphasis
- deliberate typography and panel rhythm

## 14.2 Night View

Night mode should feel:

- atmospheric
- premium
- legible
- branded

It should avoid:

- generic "dark website mode" energy
- muddy slate-on-slate layering

It should lean into:

- royal blue/cyan accents
- subtle stars only where appropriate
- stronger contrast for route lines and controls

## 14.3 BidOnDent Identity Guardrails

The UI can be inspired by Apple Maps, but should not:

- copy exact iconography everywhere
- clone Apple’s layout one-for-one
- erase BidOnDent naming or brand accents

The right target is:

- "Apple-quality hierarchy and clarity"
- with "BidOnDent product identity"

## 15. Button-by-Button Interaction Plan

## 15.1 Search button

Does:

- submits address query
- loads results
- clears stale error

## 15.2 Use My Location

Does:

- requests geolocation
- sets current device fix as origin
- recenters map

## 15.3 Start Route

Does:

- enters active navigation mode
- enables follow-location map behavior
- swaps fullscreen UI from planner/sidebar mode into active-navigation mode

## 15.4 Route Steps

Does:

- opens the step list drawer

## 15.5 Voice Controls

Does:

- opens voice controls drawer

## 15.6 Recenter

Does:

- flies map camera back to current live position or active focus

## 15.7 Save Parked Car

Does:

- stores current GPS fix locally as parked-car location

## 15.8 Route To Parked Car

Does:

- turns the parked-car location into the active destination

## 15.9 Save Place

Does:

- stores selected address or destination into local saved locations

## 15.10 Share ETA

Does:

- uses native share when available
- falls back to clipboard copy

## 15.11 Call Destination

Does:

- opens `tel:` when the selected shop has a phone number

## 15.12 End Route

Does:

- exits active navigation mode
- keeps destination and route preview available in setup mode unless the user changes them

## 16. Stage Plan

## Stage 0: Documentation Reset

Deliverables:

- this master plan
- backlink updates from older navigation docs

Exit criteria:

- one current navigation source of truth exists

## Stage 1: Domain Cleanup

Deliverables:

- navigation settings include voice volume preset
- saved-locations storage service
- parked-car storage service
- clearer type model for navigation presentation

Exit criteria:

- storage and settings are typed and reusable

## Stage 2: Route Setup Upgrade

Deliverables:

- saved places panel
- parked car card
- recent destinations support
- start-route CTA in planner

Exit criteria:

- route preview mode feels intentional and useful before navigation starts

## Stage 3: Active Navigation Surface

Deliverables:

- top maneuver card
- bottom summary sheet
- floating control rail
- turn list drawer
- voice controls drawer
- map follow behavior

Exit criteria:

- fullscreen route mode feels substantially closer to the provided Apple Maps screenshots

## Stage 4: Cartography and Visual Polish

Deliverables:

- prettier roadmap presentation
- improved night styling
- stronger route line polish
- calmer markers and overlays in navigation mode

Exit criteria:

- map visuals feel premium and branded, not generic

## Stage 5: Saved Places Expansion

Deliverables:

- Home and Work setup shortcuts
- edit/delete saved places
- route-from / route-to actions

Exit criteria:

- saved locations become a real reusable navigation tool, not just a static list

## Stage 6: Reliability and Truthfulness Pass

Deliverables:

- docs updated to reflect what is actually live
- stale or contradictory docs replaced or retired
- test/build verification complete

Exit criteria:

- implementation and documentation agree

## Stage 7: Future Provider Decision

This stage is intentionally later.

Potential work:

- provider-backed autocomplete
- vector map rendering
- true globe
- traffic data
- mobile-native parity strategy

## 17. Documentation Update Plan

The following documents should be updated to align with this plan:

- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

Potential action:

- mark older map-planning documents as historical if they conflict with current reality

## 18. Testing Plan

### Functional

- address search returns usable results
- saved place can be created, used, and deleted
- parked car can be saved, routed to, and cleared
- start route enters active mode
- end route exits active mode
- turn list opens and reflects current step
- voice controls change guidance behavior
- share ETA works or degrades gracefully

### Visual

- roadmap mode feels cleaner on desktop and mobile
- night mode feels branded and legible
- active navigation overlays do not collide
- bottom sheet remains readable at narrow widths

### Persistence

- voice settings survive reload
- saved places survive reload
- parked car survives reload
- route context does not collapse unexpectedly after route preview refresh

### Truthfulness

- no fake globe claim in code or docs
- no fake provider-backed autocomplete claim
- no fake native parked-car automation claim

## 19. Risks

### Risk: Overbuilding inside one file

Mitigation:

- split active navigation into smaller components

### Risk: UI looks premium but behavior feels fake

Mitigation:

- keep actions tied to real browser-backed behavior

### Risk: Docs drift from implementation again

Mitigation:

- update docs in the same wave as code

### Risk: Leaflet fights navigation aspirations

Mitigation:

- keep map provider seams explicit
- do not overpromise globe/3D features

## 20. Definition of Done For This Rebuild Wave

This wave is done when:

1. The fullscreen navigation experience has a true setup mode and active-navigation mode.
2. Saved places exist and are usable.
3. Parked car can be saved and routed to.
4. Voice controls include muted / alerts / full plus volume presets.
5. Roadmap and night views feel more premium and more branded.
6. The code is split into understandable human-sized modules.
7. Current docs are updated to match the implementation truth.

## 21. Immediate Implementation Order

The next code steps should happen in this order:

1. extend navigation types and settings
2. add saved-locations and parked-car storage services
3. add saved places / parked car UI into route setup mode
4. add active-navigation overlay components
5. add map follow controller and cleaner navigation-mode map rendering
6. refresh docs and verify with a full build

This is the working plan for the remainder of the rebuild.
