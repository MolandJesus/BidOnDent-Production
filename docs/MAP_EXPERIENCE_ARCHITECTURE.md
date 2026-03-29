# BidOnDent Map Experience Architecture

Last updated: March 29, 2026
Status: Active architecture reference

This document records the actual checked-in shape of the BidOnDent map/search experience after the map-first rebuild work that preserved the newer identity/session/intelligence plumbing.

## Current Repo Truth

- The app still routes through local `viewMode` and `currentTab`, not React Router.
- Provider-agnostic website identity exists in `src/app/services/auth/websiteIdentity.ts`.
- `websiteIdentity` now owns `websiteUserKey`, `sessionId`, and persistent website session memory.
- `marketIntelligence.ts` remains the seeded recommendation engine for shops and insurers.
- Provider-agnostic business profile persistence now exists for shop and insurer accounts.
- `ShopDirectoryScreen.tsx` is now a dedicated map-first shell instead of only a stretched recommendation card list.
- The active renderer is `maplibre-gl@5.21.1` with `react-map-gl@8.1.0`.
- The desktop experience uses one rounded clipped shell with a stable left rail + right map pane.
- The mobile-safe path remains list-forward, with the same shared intelligence and memory behind it.
- Compact fullscreen/mobile shop results now use a route-first card hierarchy instead of mirroring the denser desktop action stack.
- Pre-navigation route preview is also now intentionally abbreviated on phones, showing only the earliest steps until live guidance begins.

## Key Files

- `src/app/components/shop/ShopDirectoryScreen.tsx`
  Map-first orchestration screen. Owns search, view mode, theme, origin, recent searches, saved places, and result selection.
- `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`
  MapLibre pane with GeoJSON sources/layers, route glow, selected/origin markers, and popup-driven selection.
- `src/app/components/shop/ShopDirectoryMapLayers.tsx`
  Extracted route/marker Source+Layer block for the shop-directory map surface.
- `src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx`
  Extracted map-pane chrome for header badges, legend, selected-shop card, and search-area pills.
- `src/app/components/shop/ShopDirectoryOriginSearch.tsx`
  Reusable origin-search lane for the shop flow, combining U.S.-wide Nominatim address lookup with quick-pick origin chips.
- `src/app/components/shop/ShopDirectoryResultCard.tsx`
  Shared result card for shop browse states. Compact mode now uses a route-first mobile hierarchy with smaller media, lighter metric pills, and reduced action clutter.
- `src/app/components/shop/ShopDirectoryRoutePanel.tsx`
  Pre-navigation route chooser. Now uses appearance-aware active-route styling and shorter instruction previews so phone-sized planning surfaces stay readable.
- `src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx`
  Shop-directory viewport orchestration for fit/fly/broadcast behavior.
- `src/app/hooks/useShopDirectoryRoutePreview.ts`
  OSRM-backed live route preview hook for the shop flow, with local fallback route generation when the live provider is unavailable.
- `src/app/components/maps/MapLibreServiceCoverageMap.tsx`
  Coverage-map renderer for landing and dashboard flows.
- `src/app/components/maps/MapLibreCoverageMapLayers.tsx`
  Extracted route/county/GPS/search-target layers for the coverage map.
- `src/app/components/landing/CoverageMapDialog.tsx`
  Fullscreen coverage shell that can now auto-enter BidOnDent navigation from landing/dashboard direction requests once route preview is ready.
- `src/app/components/landing/CoverageSearchPanel.tsx`
  Public coverage command bar. Now accepts ZIP, home, and store-address input with manual-origin status feedback before fullscreen map entry.
- `src/app/components/landing/MobileMapBottomSheet.tsx`
  Mobile fullscreen coverage browse sheet. Keeps sidebar/search/discovery content accessible without trapping the map and now uses taller snap behavior for route-first mobile browsing.
- `src/app/hooks/useOperatingRegionsCoverage.ts`
  Landing coverage orchestration hook. Now owns the landing-section request token that opens BidOnDent Maps first for shop directions and persists manual address-origin state for public coverage search.
- `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`
  Compact click-through dashboard preview surface.
- `src/app/routers/DashboardRouter.tsx`
  Merges marketplace reports with hydrated local report/photo state so shop and insurer dashboard surfaces can render live request/claim content before demo fallback.
- `src/app/components/maps/mapLibreControllers.tsx`
  Shared viewport, follow-location, and route-fit controllers used by the coverage map.
- `src/app/components/shop/LikedShopsScreen.tsx`
  Customer saved-shop view, now reading the same map session collection.
- `src/app/components/reports/CompetitorAnalysisScreen.tsx`
  Shop competitor watchlist view, now reading the same map session collection.
- `src/app/components/insurer/InsurerPartnerShopsScreen.tsx`
  Insurer shortlist / recruitment view, now reading the same map session collection plus manual prospects. Mapped partner-shop actions can now seed website map memory and open the insurer-scoped shop-directory map flow.
- `src/app/services/intelligence/shopMapExperience.ts`
  Seeded geo metadata, provider-agnostic directory overlays, distance math, and role-aware map panel copy.
- `src/app/services/intelligence/marketIntelligence.ts`
  Recommendation scoring and explainability engine still used underneath the map shell, now able to merge provider-agnostic insurer directory records.
- `src/app/services/networkProfiles.ts`
  Client adapter for provider-agnostic shop/insurer profile persistence plus shared directory inventory fetches.
- `src/app/hooks/useBusinessProfile.ts`
  Loads and saves the signed-in shop or insurer business profile keyed by `website_user_key`.
- `src/app/hooks/useNetworkDirectory.ts`
  Shared hook that hydrates live directory inventory into the map, insurer connection, and related role screens.
- `src/app/services/auth/websiteIdentity.ts`
  Persistent website session memory. Now properly preserves nested `mapSession` state.
- `src/app/services/auth/websitePreferencesSync.ts`
  Cloud sync adapter for provider-agnostic website memory.
- `src/app/services/auth/websiteRelationshipsSync.ts`
  Cloud sync adapter for durable relationship records that mirror map collections and connected carriers.
- `src/app/hooks/useWebsiteSessionSync.ts`
  Startup hydration hook that reconciles local website memory with cloud-backed preferences and relationship rows.
- `supabase/functions/server/handlers/preferences.ts`
  Service-role edge handler for provider-agnostic website preferences.
- `supabase/functions/server/handlers/website_relationships.ts`
  Service-role edge handler for durable saved shops, watchlists, shortlists, and connected-carrier records.
- `supabase/functions/server/handlers/network_profiles.ts`
  Service-role edge handlers for provider-agnostic shop profiles, insurer profiles, and shared directory inventory.
- `supabase/migrations/005_create_website_preferences_table.sql`
  Database table for durable app-level website memory keyed by `website_user_key`.
- `supabase/migrations/006_make_business_profiles_provider_agnostic.sql`
  Makes `shop_profiles` and `insurer_profiles` usable from Clerk-backed website identities and adds map/directory fields.
- `supabase/migrations/007_create_website_relationships_table.sql`
  Creates durable provider-agnostic relationship rows for saved shops, watchlists, shortlists, and connected insurers.
- `src/app/utils/buildDashboardRouterProps.ts`
  Passes `websiteIdentity`, reports, vehicles, and user role down to dashboard screens.
- `src/app/routers/DashboardRouter.tsx`
  Routes `shop-directory` and `insurer-connect` while passing signed-in identity/context.

## What Persists

`WebsiteSessionMemory.mapSession` now safely persists:

- `savedPlaces`
- `recentSearches`
- `customerSavedShopIds`
- `shopWatchlistIds`
- `insurerShortlistIds`
- `lastSearchOrigin`
- `lastSearchQuery`
- `lastSearchFilters`
- `mapViewMode`
- `mapTheme`
- `lastViewedShopId`
- `lastMapCenter`
- `lastMapZoom`

This sits beside the existing:

- `shopDirectory` search/filter/sort memory
- `insuranceConnection` carrier-link memory

## Local Vs Cloud

There are now three persistence layers working together:

- local website session memory in browser storage for instant startup and offline-safe continuity
- durable `website_preferences` cloud storage keyed by `website_user_key`
- durable `website_relationships` cloud rows keyed by `website_user_key`

Startup flow:

1. build `websiteIdentity`
2. hydrate local memory immediately
3. fetch cloud-backed preferences for the same `website_user_key`
4. fetch durable relationship rows for saved shops, watchlists, shortlists, and connected carriers
5. merge the newer/preferred cloud state into local website memory
6. debounce future writes back to the cloud preferences and relationships endpoints

This means the map/search state is no longer limited to one browser session when the backend route is available.

## Supabase Runtime Contract Under The Map

The map stack now rides on the same cleaned-up website-era Supabase contract as the rest of the app:

- frontend route/bucket constants live in `src/app/services/supabase/runtime.ts`
- canonical edge slug is `server`
- legacy edge slug `make-server-9f243523` stays deployed only as an alias during migration
- canonical new-upload buckets are:
  - `bidondent-account-media`
  - `bidondent-vehicle-media`
  - `bidondent-report-media`
- the empty legacy bucket `bidondent-landing-page-images` has been removed from the live project

Implication:

- map and account work should not hardcode Supabase URLs or bucket names in components
- new map-related uploads or previews should use the shared runtime contract
- legacy buckets may still be read for older assets, but new code should not target them

## Business Profiles And Real Directory Data

- Shop and insurer onboarding now save provider-agnostic business profiles instead of stopping at UI-only forms.
- `App.tsx` now treats missing shop/insurer business profiles as incomplete onboarding for those account types.
- `useNetworkDirectory` feeds persisted shop and insurer profiles into:
  - the Smart Shop Map
  - Saved Shops
  - Competitor Analysis
  - Partner Shops
  - Insurer Connection
- The seeded recommendation engine is still intact, but it now merges in persisted business directory entries instead of forcing the map to stay seed-only.
- If live directory fetches are unavailable, the seeded experience remains the fallback path.

## Role-Aware Behavior In The Current Map Shell

### Customer

- Customer panel frames the experience as repair routing.
- Connected insurer preferences still influence ranking.
- Vehicle/report context chips surface damage and make signals.
- Primary actions save/remove shops for bids.
- The same saved-shop collection now powers the dedicated Saved Shops screen.
- Those saved shops now also mirror into durable `website_relationships` rows.

### Shop

- Shop panel frames the map as competitor scouting / market benchmarking.
- Top-of-panel metrics focus on average ticket and insurer-ready competitors.
- Primary actions track/remove competitors from a watchlist.
- The same watchlist now powers the dedicated Competitor Analysis screen.
- That watchlist now also mirrors into durable `website_relationships` rows.

### Insurer

- Insurer panel frames the map as partner-network recruitment.
- Top-of-panel metrics focus on network-ready shops and completion rates.
- Primary actions shortlist/remove partner candidates.
- The same shortlist now powers the Partner Shops screen, alongside manual prospect entries.
- That shortlist now also mirrors into durable `website_relationships` rows.

## Map Data Model

The current map layer is now hybrid:

- seeded recommendations and carrier intelligence still provide the fallback dataset
- persisted shop profiles can now appear as real directory listings across the map and related role screens
- persisted insurer profiles can now appear inside the carrier connection directory
- connected carriers now persist as durable relationship rows rather than only session memory
- when live profiles have no geocoded coordinates yet, the map uses deterministic city-anchored approximate placement so they render inside the correct market shell until true geocoding arrives
- when an origin is selected, displayed map distance is recalculated from coordinates
- if no origin is selected, the recommendation distance remains the fallback label

## Technical Guardrails Implemented

- One outer rounded shell with `overflow-hidden`
- Stable split layout with explicit min-width/min-height handling
- No nested `100vw` or `100vh` inside the framed shell
- Explicit map height so the MapLibre canvas stays inside the pane
- Shared `useMap()` camera controllers handle fit/fly/follow behavior after mount and route changes
- Persisted map center and zoom on interaction end
- Coverage browse/search surfaces now preserve explicit ZIP/address-selected origin context until the user intentionally switches into geolocation mode
- Active navigation summary sheets now treat Apple/Google/Waze as explicit export fallback, not a co-equal primary route mode
- Fullscreen browse/navigation light-mode shells now avoid the previous washed-out white glass by using more restrained slate-blue immersive tokens
- Mobile browse sheets/results drawers now normalize snap/scroll state and use explicit touch-scroll containers so fullscreen map menus do not get stuck open but unable to scroll on phones

## Known Gaps / Next Slices

- No true backend geosearch or geocoding yet
- Live profile markers still use approximate city-anchored placement until a real geocoder/polygon service is added
- Saved shops, watchlists, shortlists, and insurer connections now mirror into durable relationship rows, but they are still generic relationship entities rather than fully normalized domain-specific business tables
- No marker clustering library yet, even though map session has future-facing cluster preferences
- Route preview and in-app navigation are now defaulted in the shop-directory flow, coverage browse `Shops` actions, landing/dashboard coverage shop-direction entry points, and mapped insurer partner-shop actions, but not every map/search surface has first-class in-app guidance yet
- Manual insurer prospects are still exported externally because they are not yet modeled as first-class in-app destinations
- No true insurer network-contract workflow yet beyond shortlist and directory persistence
- Turn-by-turn phrasing needs continued expansion and QA toward 1,000+ scenario-sensitive responses while keeping instructions concise and safe
- Live directory entries still need universal route-launch actions and real geocoding before the map can be treated as fully operational

## Recommended Next Expansion Path

1. Add true geocoding or service polygons for live shop and insurer profiles.
2. Decide whether `website_relationships` should remain the shared durable layer or split into domain-specific network tables as workflows harden.
3. Add clustering and search-within-bounds once live result counts grow past the current mixed seed/profile scale.
4. Extend the same provider-agnostic directory model into richer account/profile editing and partner-network contract flows.
