# BidOnDent — Master AI Context

> **Primary first-read master context for any AI agent working on this repo.**
> Read this first, then follow the startup path in `docs/README.md` for current execution truth and task-specific docs.
>
> **Last updated:** 2026-03-29 (Map program passes 478-483 sync)
> **Status:** Active master context
> **Branch:** `BidOnDent-Horizon-Beta` (working) → `main` (stable, Vercel auto-deploy)
> **Build:** ✅ 0 errors · ~3.1s · MapLibre GL JS WebGL engine
> **Map engine:** MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (Leaflet fully removed Pass 448)
> **TypeScript:** 0 tsc errors (re-verified 2026-03-29 during MapLibre stabilization)
> **Images:** 22.9MB total (was 53.6MB — Pass 430 JPEG conversion)
> **Production `any` types:** 0 (was 21 — eliminated Passes 433-434; 7 remain in test files only)

---

## 1. What Is BidOnDent?

BidOnDent is a **map-first marketplace for automotive dent repair**. The map is not a feature — it IS the product. Three user types interact through a spatial loop:

```
Customer: Report damage → Pin on map → Shops bid → Accept → Navigate to repair
Shop:     See report map → Submit bid → Win job → Get customer
Insurer:  Browse shop network → Partner shops → Track claims
```

**Tech stack:**

- React 18 + TypeScript + Vite 6.4.1
- Tailwind CSS (custom `bd-glass-*` design tokens)
- Supabase (PostgreSQL, Storage, Edge Functions via Hono)
- Clerk (identity — auth, user metadata, provider-agnostic website identity)
- MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (WebGL maps — Leaflet fully removed Pass 448)
- CARTO Voyager (light), CARTO Dark All (night), Esri Satellite tile layers
- OSRM routing, Nominatim search, Web Speech API (British voice navigation)
- Vercel deployment (auto from `main`)

**Coverage area:** NY metro — Westchester, Rockland, Dutchess, Nassau, Orange, Putnam counties.

---

## 2. Architecture Rules (Non-Negotiable)

```
services/   = data/domain logic only — no React, no UI state
hooks/      = orchestration/state lifecycle — bridges services ↔ components
components/ = rendering + local interaction only — calls hooks, not services directly
utils/      = transforms/formatting/calculations — pure functions only
```

- **Clerk** = identity (auth, user metadata, session)
- **Supabase** = backend (always via edge functions, never direct DB calls in components)
- **localStorage** = cache only, never source of truth
- File soft limit: 300 lines. Hard limit: 500 lines.
- Never bypass Supabase RLS; never commit `.env` files.

### Concurrent Security-Track Rule

If another AI is actively updating security/auth/data boundaries:

- Keep documentation updates additive and merge-safe.
- Do not overwrite newly added security guidance without verification.
- Synchronize auth/storage ownership notes across `SUPABASE_SETUP_GUIDE.md`, `GOOGLE_OAUTH_SETUP.md`, and this master context in the same pass.

### Concurrent AI Snapshot (2026-03-28)

Verified concurrent security/runtime work landed while docs governance passes were running:

- Supabase edge runtime now supports Clerk-backed auth headers for app-origin edge requests.
- Public intake writes and workflow event/job-assignment mutations were routed behind edge handlers.
- Navigation-session persistence moved to Clerk-bound cloud session semantics with local-only fallback for anonymous mode.
- Storage model hardened toward private user buckets with signed URL hydration and authenticated deletion flows.
- Server handlers adopted stricter authz gates (admin, marketplace, website identity) and reduced sensitive error leakage.

Execution implication: future refactor work must preserve the Clerk -> edge -> Supabase boundary and avoid reintroducing direct browser table/storage mutation paths.

### Appearance Mode System

`DashboardAppearanceMode` = `"light"` | `"map-dark"` (set via `data-appearance-mode` attribute)

**Two-layer design:**

- **`map-dark` mode:** Dark navy frosted glass everywhere. Light text (`text-slate-100`/`text-white`).
- **`light` mode:** Glass containers with `.bd-light-surface` class render as white surfaces with dark text (`#334155`). Glass containers WITHOUT `.bd-light-surface` keep the CSS fallback (light text on warm dark glass — still readable).

**`bd-light-surface` pattern (Passes 353–354):**  
Add `${isLight ? " bd-light-surface" : ""}` to any `bd-glass-card`, `bd-glass-panel`, or `bd-glass-floating` element that uses `isLight`/`isLightAppearance` text conditionals. The CSS utility overrides the glass background to white gradient and excludes the element from forced-light-text descendant overrides in `theme.css`.

**Do NOT add `bd-light-surface`** to elements that already swap glass classes in a ternary (e.g., `isLight ? "bg-white/80..." : "bd-glass-card"`), or to elements with always-dark inline backgrounds.

The landing page is a separate surface — it uses inline style conditionals for light/dark, not `bd-light-surface`.

### Map Theme System (Separate from Appearance Mode)

`MapTheme` = `"light"` | `"dark"` — per-map tile toggle inside `ShopDirectoryScreen`.
`MapTileMode` = `"roadmap"` | `"night"` | `"satellite"` — per-map tile source in coverage map.

- `"dark"` → CARTO Dark All tiles + dark glass overlays
- `"light"` → CARTO Voyager tiles + light glass overlays
- `"satellite"` → Esri World Imagery tiles
- Map theme is stored in `useShopDirectorySession` as `mapTheme` state
- MapLibre popup styling in `theme.css` — `.maplibregl-popup-content` with glass blur, dark mode variants
- Tile layer definitions: `mapLibreStyles.ts` exports `StyleSpecification` objects per tile mode

---

## 3. Design System

**Target aesthetic:** Apple Maps-inspired. Map is base layer. Everything floats above geography.

**Glass CSS classes** (defined in `src/styles/theme.css`):

- `bd-glass-panel` — floating panels, sidebars
- `bd-glass-card` — content cards, result cards
- `bd-glass-control` — interactive controls (buttons, pills)
- `bd-glass-badge` — status badges
- `bd-glass-floating` — top-level floats (notification center, overlays)

**Color system:**

- Royal blue `#003d82` → primary identity / CTAs
- Sky blue `#00a0e9` → secondary / gradients
- Navy → depth / night background
- Soft blue → atmosphere tints

**Rules:**

- Use `bd-glass-*` classes. Avoid inline `rgba(255,255,255,...)` hacks.
- Touch targets: min 44×44px.
- Mobile-first — 375px minimum viewport.
- No horizontal scroll at any breakpoint.
- No `bg-white` on premium surfaces.

---

## 4. Historical Snapshot — Pass 286 Era

Archive note: This section captures the implementation snapshot from the Pass 286 time window and immediate follow-on hardening notes. For current execution truth before refactor, use `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` and `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`.

**276 structured passes completed before this session** (at 173% of original 160-pass plan).

### What's been built and is solid:

- Glass design system across all screens (`bd-glass-*`)
- Dark surface color system — all light backgrounds eliminated
- Appearance mode (light/map-dark) system + cross-tab sync
- Dashboard shell (DashboardLayout, MobileBottomNav, NotificationCenter)
- Report wizard (5-step glass flow, Supabase photo storage)
- Bid system (real Supabase data, acceptance flow)
- Clerk identity + provider-agnostic website session memory
- Network directory (shops + insurers from Supabase, seed fallback)
- Route-level code splitting (783KB, down from 1078KB)
- Type safety sweep (39 files, no `any[]` in critical paths)
- Security hardening (console.log DEV-gates, path traversal fix, MIME validation)
- Supabase edge functions (canonical slug `server`)
- Liquid glass UI (passes 236-242): all white surfaces eliminated
- Navigation system (useNavigationSession, useNavigationIntelligence, voice alerts, reroute)

### Map program snapshot — Pass 286 (historical):

**Problem found:** Map was entirely hardcoded to Dallas, TX. All overlays had hardcoded dark styles ignoring `mapTheme` toggle. Customers had no path from dashboard home to ShopDirectoryScreen.

**What was fixed:**

| File                                                     | What Changed                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/components/shop/ShopDirectoryMapPane.tsx`       | Full `mapTheme` theming (9 token variables), NY fallback center, fixed Leaflet popup text to dark-on-white; added "Search in this area" + "Searching this area" pills with `onSearchInArea` / `onClearAreaSearch` / `searchWithinViewport` props; local `hasPanned` state shows pill after first pan                                     |
| `src/app/components/shop/ShopDirectoryMapOverlays.tsx`   | Added `mapTheme` prop, full light/dark token set for all overlays                                                                                                                                                                                                                                                                        |
| `src/app/components/shop/ShopDirectoryImmersiveMap.tsx`  | `mapTheme` theming for top bar + drawer, NY fallback center; added `onSetMapViewportBounds` prop wired to `onViewportChange`                                                                                                                                                                                                             |
| `src/app/components/shop/ShopDirectoryScreen.tsx`        | Added `mapTheme` pass-through to hybrid mode overlays; wired `navigationMode` to hybrid mode overlays (was missing); viewport bounds wired in both hybrid and immersive `onViewportChange`; passes `handleSearchInArea` / `handleClearAreaSearch` / `searchWithinViewport` to map pane; passes `onSetMapViewportBounds` to immersive map |
| `src/app/services/intelligence/shopMapData.ts`           | Replaced all Dallas TX data with NY coverage area (6 shops: Yonkers, White Plains, Spring Valley, Poughkeepsie, Hempstead, Middletown)                                                                                                                                                                                                   |
| `src/app/services/intelligence/shopMapExperience.ts`     | Fixed directory shop fallback city/state from Dallas/TX to White Plains/NY; fixed shop callout text to reference NY counties; added `viewportBounds` param to `buildShopMapListings` → passed to `applyShopMapListingFilters`                                                                                                            |
| `src/app/services/intelligence/directoryAdapters.ts`     | Replaced TX-only `CITY_COORDINATE_DIRECTORY` with 17 NY coverage area cities; fixed insurer HQ fallback to White Plains/NY                                                                                                                                                                                                               |
| `src/app/components/insurer/insurerPartnerShopsUtils.ts` | Fixed `buildManualProspectCoordinate` base from Dallas to Westchester NY                                                                                                                                                                                                                                                                 |
| `src/app/components/insurer/AddProspectModal.tsx`        | Updated city/state/zip placeholders to NY                                                                                                                                                                                                                                                                                                |
| `src/app/components/dashboard/CustomerMapWidget.tsx`     | Added `onViewShops` prop + "Browse all shops & AI matching" button                                                                                                                                                                                                                                                                       |
| `src/app/components/codelayer/HomeScreen.tsx`            | Wired `onViewShops` to `CustomerMapWidget` so customers reach `ShopDirectoryScreen`                                                                                                                                                                                                                                                      |
| `src/app/hooks/useShopDirectorySession.ts`               | Added `mapViewportBounds` + `searchWithinViewport` state; wired into `buildShopMapListings`; added `handleSearchInArea` + `handleClearAreaSearch` handlers; exposed all four from hook return                                                                                                                                            |

---

## 5. Map Program Architecture

The map program has two subsystems:

### A. ServiceCoverageMap (landing page + coverage dialog)

Used by: `OperatingRegionsSection`, `CustomerMapWidget`, `DashboardCoveragePanel`, `CoverageMapDialog`

```
MapLibreServiceCoverageMap.tsx       ← MapLibre GL JS base map, tile mode switcher, route glow, GPS glow
  └── MapLibreCoverageMapLayers.tsx  ← Extracted route/county/GPS/search-target rendering block
CoverageMapDialog.tsx                ← Full-screen coverage map modal with auto-start navigation handoff
useOperatingRegionsCoverage.ts       ← Landing coverage orchestration + map-open/start-navigation requests
CoverageMapOverlays.tsx              ← Landing page overlays
MapLibrePartnerShopLayer.tsx         ← GeoJSON partner shop circle layer
MapLibreReportLayer.tsx              ← GeoJSON report marker layer
MapLibreDiscoveryPlaceLayer.tsx      ← Category-colored discovery place circles
mapLibreControllers.tsx              ← Shared viewport/follow/route-fit controllers
mapLibreHelpers.ts                   ← Shared geometry helpers
useCoveragePartnerShops.ts           ← Fetches real partner shops from Supabase
useCoverageNavigationExperience.ts   ← Navigation origin management
mapLibreStyles.ts                    ← StyleSpecification objects (roadmap/night/satellite)
```

**Theme:** Uses `resolveMapSurfaceTone(tileMode)` → `getMapSurfaceTheme(tone)` from `mapSurfaceTheme.ts`.
**Tiles:** CARTO Voyager (roadmap), CARTO Dark All (night), Esri Satellite — configured as raster tile StyleSpecifications.

### B. MapLibreShopDirectoryMapPane (dashboard Find A Shop)

Used by: `ShopDirectoryScreen` (hybrid + list modes), `ShopDirectoryImmersiveMap` (full-screen map mode)

```
ShopDirectoryScreen.tsx                    ← Orchestrator (hybrid + list layout)
  └── MapLibreShopDirectoryMapPane.tsx     ← MapLibre map pane (GeoJSON sources, route glow, overlays)
        └── ShopDirectoryMapLayers.tsx     ← Extracted Source/Layer rendering block for routes + markers
        └── ShopDirectoryMapPaneOverlays.tsx ← Header badges, bottom card/legend, search-area pills
        └── MapLibreShopDirectoryViewportManager.tsx ← useMap() viewport fit/fly logic
        └── ShopDirectoryMapOverlays.tsx   ← Floating overlays (intelligence, route, actions)
ShopDirectoryImmersiveMap.tsx              ← Full-viewport map mode (own top bar + results drawer)
ShopDirectoryOriginSearch.tsx              ← U.S.-wide origin search UI (Nominatim + suggested origin chips)
useShopDirectorySession.ts                 ← All session state (search, filter, sort, map, routes)
useShopDirectoryRoutePreview.ts            ← OSRM-backed live route alternatives with local fallback
shopMapExperience.ts                       ← buildShopMapListings, role-aware copy, filters
shopMapData.ts                             ← NY coordinates, suggested origins
shopMapRouting.ts                          ← Local route fallback + distance/ETA helpers
directoryAdapters.ts                       ← Supabase shop/insurer → map listing adapters
```

### C. MapLibreDashboardMapPreview (dashboard widgets)

Used by: `CustomerMapWidget`, `ShopMapWidget`, `InsurerMapWidget`

```
MapLibreDashboardMapPreview.tsx      ← Lightweight click-through preview maps
```

**Three view modes:**

- `"hybrid"` — sidebar (search + list) + map pane side by side
- `"list"` — sidebar only, no map
- `"map"` — full-screen immersive (`ShopDirectoryImmersiveMap`)

### C. Entry Points to ShopDirectoryScreen

| Entry                                         | User Type | How                                                       |
| --------------------------------------------- | --------- | --------------------------------------------------------- |
| `CustomerMapWidget` "Browse all shops" button | customer  | `onViewShops` → `DashboardRouter` → `ShopDirectoryScreen` |
| `ShopMapWidget` "View Map" button             | shop      | `onViewShops` → same                                      |
| `InsurerMapWidget` "View Map" button          | insurer   | `onViewShops` → same                                      |
| `LikedShopsScreen` "Open Map"                 | customer  | `onOpenMap` → same                                        |
| `CompetitorAnalysisScreen` "Open Map"         | shop      | `onOpenMap` → same                                        |
| `InsurerPartnerShopsScreen` "Open Map"        | insurer   | `onOpenMap` → same                                        |
| `InsurerPartnerShopCard` "BidOnDent Maps"     | insurer   | write map memory → `onOpenMap` → preselected destination  |

---

## 6. Historical Action Log (Pass 286 Follow-on)

Archive note: The checklist below records the priorities captured during the Pass 286 cycle. Do not treat this block as the active next-pass queue.

### Map Program — Immediate

| Priority | Task                                                                         | Why                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ DONE  | Fix `navigationMode` not passed to `ShopDirectoryMapOverlays` in hybrid mode | Fixed in pass 286                                                                                                                     |
| ✅ DONE  | Add viewport bounds tracking in `useShopDirectorySession`                    | Fixed in pass 286 — full pipeline: pan → hasPanned → "Search in this area" pill → filter                                              |
| ✅ DONE  | Add "Search in this area" button to `ShopDirectoryMapPane`                   | Fixed in pass 286                                                                                                                     |
| ✅ DONE  | Real shop data from Supabase partner profiles                                | Pass 316 — `useCoveragePartnerShops` → `convertPartnerShopsToProfiles` → merged into `allDirectoryShops` in `useShopDirectorySession` |
| ✅ DONE  | Add `mapViewportBounds` to session persist                                   | Pass 319 — persists viewport bounds in `MapSessionMemory`, restores on session/identity reload                                        |
| ✅ DONE  | Mobile map audit at 375px                                                    | Pass 320 — touch targets enforced to 44px min across immersive map, overlays, search panel                                            |

### Product Loop — Next Phase

| Priority | Task                                | Why                                                           |
| -------- | ----------------------------------- | ------------------------------------------------------------- |
| ✅ DONE  | Report → map pin connection         | Pass 317 — `MapReportMarkers` added to `ShopDirectoryMapPane` |
| ✅ DONE  | Bid → spatial context               | Pass 323 — shop geo coordinates wired through bid pipeline    |
| ✅ DONE  | Shop selection → navigation handoff | Pass 318 — "Start Navigation" CTA on route preview card       |
| P3       | Mobile map at 375px audit           | Pass 320 — 44px touch targets enforced                        |

### Hardening

| Priority | Task                                              | Notes                                                                        |
| -------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| ✅ DONE  | Supabase RLS policies (`USING(true)` on 4 tables) | Pass 321 — migration 012 tightens profiles, submissions, activity events     |
| ✅ DONE  | CI/CD pipeline                                    | Pass 327 — GitHub Actions: format check → test → build on push/PR            |
| ✅ DONE  | Basic test coverage                               | Pass 324 — Vitest + 33 tests for formatters, routing, collections            |
| ✅ DONE  | Bundle size (~783KB → 502KB)                      | Pass 325 — vendor-motion, vendor-clerk, vendor-sentry chunks (36% reduction) |
| ✅ DONE  | WCAG AA audit                                     | Pass 326 — focus-visible, aria-labels, Escape handlers                       |

---

## 7. Hard Rules for Any AI

1. **Read this doc first.** Then read `.github/copilot-instructions.md`.
2. **Map is the primary product surface.** Every pass must strengthen the spatial experience.
3. **One pass = one coherent change.** Never bundle unrelated fixes.
4. **Run `npm run build` after every pass.** Zero errors required.
5. **Mobile-first.** Validate 375px before desktop for every UI change.
6. **Light mode uses `bd-light-surface` for white surfaces.** In `map-dark` mode, text is light on dark glass. In `light` mode, elements with `bd-light-surface` get white backgrounds with dark text. Elements without it retain dark glass + light text (CSS fallback). See "Appearance Mode System" above.
7. **Map theme (`mapTheme`) is separate from appearance mode.** Components with map surfaces need both.
8. **MapLibre popups use glass blur styling.** Dark mode popups use dark glass; light popups use white glass. See `theme.css` `.maplibregl-popup-*` rules.
9. **NY is the coverage area.** No Dallas/TX coordinates anywhere in the codebase.
10. **Stop and ask** if: deleting >3 files, touching auth/payment/Clerk config, Supabase RLS policies, or build fails after 2 attempts.

---

## 8. Key Files Quick Reference

### Map Program (MapLibre GL JS — Leaflet fully removed Pass 448)

| File                                                               | Purpose                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| `src/app/components/shop/ShopDirectoryScreen.tsx`                  | Main orchestrator for dashboard shop discovery        |
| `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`         | MapLibre map pane (GeoJSON, route glow, overlays)     |
| `src/app/components/shop/ShopDirectoryMapLayers.tsx`               | Extracted Source/Layer rendering for shop directory   |
| `src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx`         | Map-pane badges, legend, shop card, search pills      |
| `src/app/components/shop/ShopDirectoryMapOverlays.tsx`             | Floating intelligence + route + action overlays       |
| `src/app/components/shop/ShopDirectoryImmersiveMap.tsx`            | Full-viewport immersive map mode                      |
| `src/app/components/shop/ShopDirectoryOriginSearch.tsx`            | U.S.-wide origin search UI for shop flow              |
| `src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx` | useMap() viewport fit/fly-to                          |
| `src/app/components/maps/MapLibreServiceCoverageMap.tsx`           | Landing + coverage map (route glow, GPS glow)         |
| `src/app/components/maps/MapLibreCoverageMapLayers.tsx`            | Extracted route/county/GPS/search-target layers       |
| `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`     | Lightweight click-through dashboard preview maps      |
| `src/app/components/maps/MapLibrePartnerShopLayer.tsx`             | GeoJSON partner shop circle layer                     |
| `src/app/components/maps/MapLibreReportLayer.tsx`                  | GeoJSON report marker layer                           |
| `src/app/components/maps/MapLibreDiscoveryPlaceLayer.tsx`          | Category-colored discovery place circles              |
| `src/app/components/maps/mapLibreControllers.tsx`                  | Shared MapLibre viewport/follow/route-fit controllers |
| `src/app/components/maps/mapLibreHelpers.ts`                       | Shared geometry helpers for coverage map rendering    |
| `src/app/components/maps/mapLibreStyles.ts`                        | StyleSpecification objects (roadmap/night/satellite)  |
| `src/app/hooks/useShopDirectorySession.ts`                         | All session state for shop directory                  |
| `src/app/hooks/useShopDirectoryRoutePreview.ts`                    | Live OSRM route alternatives for shop directory       |
| `src/app/services/intelligence/shopMapExperience.ts`               | Shop listing builder, filters, role highlights        |
| `src/app/services/intelligence/shopMapData.ts`                     | NY shop coordinates + suggested origins               |
| `src/app/services/intelligence/shopMapRouting.ts`                  | Local route fallback + distance/ETA helpers           |
| `src/app/services/intelligence/directoryAdapters.ts`               | Supabase shop/insurer → ShopMapListing adapter        |
| `src/app/components/landing/CoverageMapDialog.tsx`                 | Full-screen coverage map modal + auto-start handoff   |
| `src/app/hooks/useOperatingRegionsCoverage.ts`                     | Landing coverage orchestration + in-app route launch  |
| `src/app/components/dashboard/CustomerMapWidget.tsx`               | Customer home map widget                              |
| `src/app/components/dashboard/ShopMapWidget.tsx`                   | Shop home map widget                                  |
| `src/app/components/dashboard/InsurerMapWidget.tsx`                | Insurer home map widget                               |

### Core Shell

| File                                          | Purpose                                              |
| --------------------------------------------- | ---------------------------------------------------- |
| `src/app/App.tsx`                             | Root component, appearance mode state                |
| `src/app/components/app/DashboardLayout.tsx`  | Dashboard shell, header, sidebar                     |
| `src/app/routers/DashboardRouter.tsx`         | All view routing (shop-directory, liked-shops, etc.) |
| `src/app/components/codelayer/HomeScreen.tsx` | Dashboard home (3 map widgets by userType)           |
| `src/styles/theme.css`                        | All `bd-glass-*` CSS design tokens                   |

### Services

| File                                                  | Purpose                                              |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `src/app/services/auth/websiteIdentity.ts`            | Provider-agnostic identity + session memory          |
| `src/app/services/networkProfiles.ts`                 | Directory inventory (shops + insurers from Supabase) |
| `src/app/services/supabase/runtime.ts`                | Canonical Supabase client                            |
| `src/app/services/intelligence/marketIntelligence.ts` | Shop recommendation engine                           |

---

## 9. Development Commands

| Command                                             | Purpose                                               |
| --------------------------------------------------- | ----------------------------------------------------- |
| `npm run dev`                                       | Start Vite dev server                                 |
| `npm run build`                                     | Production build (must = 0 errors)                    |
| `npx cspell lint "src/**/*.{ts,tsx}" --no-progress` | Spellcheck                                            |
| **Do NOT** `npx tsc --noEmit`                       | Resolves wrong package — use Vite diagnostics instead |

---

## 10. Known Technical Debt

| Issue                                                     | Severity | Notes                                                                              |
| --------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| Supabase RLS `USING(true)` on 4 tables                    | HIGH     | Production security gap — requires migration, ask before touching                  |
| `dynamic/static import overlap` on `bids.ts`/`reports.ts` | LOW      | Prevents chunk separation                                                          |
| ~~No CI/CD pipeline~~                                     | ✅ DONE  | Pass 327 — GitHub Actions: format check → test → build on push/PR                  |
| ~~No test coverage~~                                      | ✅ DONE  | Pass 324 — Vitest + 33 tests for formatters, routing, collections                  |
| ~~Bundle 783KB~~                                          | ✅ DONE  | Pass 325 → now 514KB index chunk (36% reduction + route-level code splitting)      |
| ~~2–14MB PNG assets~~                                     | ✅ DONE  | Pass 430 — JPEG conversion: 53.6MB → 22.9MB (57% reduction); 3 dead images removed |

---

## 11. Branch & Deployment

- **Working branch:** `BidOnDent-Horizon-Beta`
- **Stable/deploy branch:** `main` (Vercel auto-deploys from here)
- **Supabase project:** `wmdcnjgtsppftrofaqqa`
- **Canonical edge function:** `server` (legacy alias: `make-server-9f243523`)
- **Storage buckets:** `bidondent-account-media`, `bidondent-vehicle-media`, `bidondent-report-media`

---

## 12. Pass Format (Required for Every Pass)

```
### Pass N — [Title] (YYYY-MM-DD)

1. Pass chosen and why: [1-2 sentences]
2. What changed: [bullet list]
3. Files touched: [list]
4. Validation: Build [time/errors]. Diagnostics [count]. Mobile/Desktop [status].
5. What this unlocks: [next capabilities]
6. Best next pass: [specific recommendation]
```

---

## 13. Docs That Reference This File

All other AI docs in this repo point to this file as the master context. See `docs/README.md` for the full governed documentation index.

| Doc                                            | Use When                                     |
| ---------------------------------------------- | -------------------------------------------- |
| `docs/README.md`                               | Need the full documentation governance index |
| `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`      | Need the product completion roadmap          |
| `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` | Need map design law and strategic intent     |
| `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`     | Need map delivery reality tracker            |
| `docs/BIDONDENT_PRODUCT_BRAIN.md`              | Need full product strategy framework         |
| `docs/CODE_ORGANIZATION_AUDIT.md`              | Need architecture snapshot + weak seams      |
| `docs/MOLANDJEUS_DESIGN_DECISIONS.md`          | Need design philosophy + page audit          |
| `.github/copilot-instructions.md`              | Need architecture rules + pass output format |
| `docs/GETTING_STARTED.md`                      | New developer environment setup              |
| `docs/SUPABASE_SETUP_GUIDE.md`                 | Supabase project configuration               |

**Archived docs** (moved to `/docs/archive/` in Pass 437):

14 historical and superseded documents archived. See `docs/README.md` for full archive manifest.

---

---

## 14. Quality & Reliability Sweep (Passes 400–437)

Major milestones in this phase:

- **All user-facing `alert()` calls eliminated** — replaced with inline error/success feedback
- **Zero tsc errors** — achieved in Pass 421, maintained through 437
- **Zero production `any` types** — was 21, eliminated Passes 433-434 (7 remain in test files only)
- **57% image size reduction** — PNG→JPEG conversion (53.6MB → 22.9MB)
- **Race conditions fixed** — useBusinessProfile fetch (426), useUserData autosave (427)
- **Error propagation hardened** — bid submission (425), profile save (428), submitBid throw-on-missing (435)
- **8 oversized files refactored** — all src files now under 500 lines (Passes 400-407)
- **3 dead code items removed** — accountDeletion.ts (419), 3 unused image imports (430)
- **Session sync resilience** — Promise.allSettled for cloud fetches (435)
- **ShopProfileModal fully wired** — all 5 form fields save to Supabase via edge function (436)
- **Doc system refactored** — 14 historical docs archived, governance index rewritten (437)

| Pass    | Title                                                  | Status  |
| ------- | ------------------------------------------------------ | ------- |
| 400-407 | Refactor 8 oversized files (all < 500 lines)           | ✅ Done |
| 408     | Sidebar scroll + SettingsModal dark mode               | ✅ Done |
| 409-416 | Product quality sweep                                  | ✅ Done |
| 417     | HelpModal + ShopProfileModal alert→inline              | ✅ Done |
| 418     | Fix ShopProfileModal imports + demo data               | ✅ Done |
| 419     | Remove dead accountDeletion.ts                         | ✅ Done |
| 420     | Business inquiry form validation                       | ✅ Done |
| 421     | Fix TypeScript type errors (3 → 0)                     | ✅ Done |
| 422     | AccountScreen image upload error inline                | ✅ Done |
| 423     | PaymentModal coming soon placeholder                   | ✅ Done |
| 424     | All remaining user-facing alerts                       | ✅ Done |
| 425     | Bid submission error propagation + loading             | ✅ Done |
| 426     | Business profile fetch race condition fix              | ✅ Done |
| 427     | Autosave race in useUserData                           | ✅ Done |
| 428     | AccountScreen async error safety                       | ✅ Done |
| 429     | Master context doc sync                                | ✅ Done |
| 430     | PNG→JPEG image optimization (57% reduction)            | ✅ Done |
| 431     | BidsScreen useEffect deps + type fix                   | ✅ Done |
| 432     | Comprehensive doc sync (4 docs)                        | ✅ Done |
| 433     | Eliminate `any` from hooks/services (14→0)             | ✅ Done |
| 434     | Eliminate `any` from components/types (8→0)            | ✅ Done |
| 435     | Runtime safety: submitBid, Promise.allSettled, useMemo | ✅ Done |
| 436     | Wire ShopProfileModal 3 unlinked inputs                | ✅ Done |
| 437     | Doc system refactor (14 archived, governance rewrite)  | ✅ Done |

---

## 15. MapLibre GL JS Migration + Stabilization (Passes 442–481)

Complete engine swap from Leaflet (canvas) to MapLibre GL JS (WebGL), followed by ongoing map-surface stabilization and layout refinement. Leaflet is fully removed.

| Pass | Title                                                        | Status  |
| ---- | ------------------------------------------------------------ | ------- |
| 442  | Map + Dashboard security hardening                           | ✅ Done |
| 443  | Runtime safety — .charAt/.split guards                       | ✅ Done |
| 444  | Map tile upgrade — OSM → CARTO Voyager                       | ✅ Done |
| 445  | Type safety — remove `as any` cast                           | ✅ Done |
| 446  | MapLibre Phase 1 — Core coverage map engine swap             | ✅ Done |
| 447  | ShopDirectory + Dashboard MapLibre migration                 | ✅ Done |
| 448  | Remove Leaflet entirely — 14 files, 2021 lines deleted       | ✅ Done |
| 449  | MapLibre popup + attribution CSS (glass blur)                | ✅ Done |
| 450  | MapLibre code fixes (audit findings)                         | ✅ Done |
| 451  | Route line glow + GPS position glow effects                  | ✅ Done |
| 452  | Master context + map docs MapLibre alignment                 | ✅ Done |
| 453  | Dashboard preview click + popup-selection sync               | ✅ Done |
| 454  | Extract shared MapLibre controllers + helpers                | ✅ Done |
| 455  | Dashboard preview controlled viewport fix                    | ✅ Done |
| 456  | Remove dead ServiceCoverageMap popup code                    | ✅ Done |
| 457  | Fix ShopDirectory `attributionControl` typing                | ✅ Done |
| 458  | MapLibre stabilization + doc truth sync                      | ✅ Done |
| 459  | Add directions CTA to shop map popup                         | ✅ Done |
| 460  | Shop marker visual hierarchy + labels                        | ✅ Done |
| 461  | Mobile-first bottom overlay + always-visible legend          | ✅ Done |
| 462  | Extract shop directory Source/Layer block                    | ✅ Done |
| 463  | County labels + search-radius distance label                 | ✅ Done |
| 464  | Immersive map mobile layout improvements                     | ✅ Done |
| 465  | Premium route polyline outline layer                         | ✅ Done |
| 466  | Dark overlay contrast boost (isolated map pane)              | ✅ Done |
| 467  | Feed live GPS into shop navigation intelligence              | ✅ Done |
| 468  | Keep shop map popup synced with sidebar selection            | ✅ Done |
| 469  | Extract coverage-map route and marker layers                 | ✅ Done |
| 470  | Safe-area bottom spacing + legend polish                     | ✅ Done |
| 471  | In-app directions default + live routes + nationwide origins | ✅ Done |
| 472  | Coverage control polish: icons + glass backgrounds           | ✅ Done |
| 473  | Coverage tabs in-app routing handoff                         | ✅ Done |
| 474  | Coverage landing/dashboard in-app navigation default         | ✅ Done |
| 475  | Insurer mapped partner shops → BidOnDent Maps                | ✅ Done |
| 476  | Coverage browse origin lock + landing command-bar cleanup    | ✅ Done |
| 477  | Demote external export in active navigation sheet            | ✅ Done |
| 478  | Public coverage nationwide address-origin search             | ✅ Done |
| 479  | Fullscreen light-theme + mobile navigation chrome cleanup    | ✅ Done |
| 480  | Live dashboard/shop/insurer report feed + photo cards        | ✅ Done |
| 481  | Mobile map scroll + smart-shop menu cleanup                  | ✅ Done |
| 482  | Compact mobile shop-card cleanup + dashboard CTA clarity     | ✅ Done |
| 483  | Route-preview panel light/mobile cleanup                     | ✅ Done |

**MapLibre architecture:**

- 7 MapLibre components in `src/app/components/maps/`
- Shared dashboard/shop map surfaces now live across `components/maps/`, `components/shop/`, and `components/dashboard/`
- `mapLibreStyles.ts` — tile StyleSpecifications (raster tile sources)
- `mapLibreControllers.tsx` — reusable `useMap()` camera controllers
- `mapLibreHelpers.ts` — shared geometry helper extraction
- `ShopDirectoryMapPaneOverlays.tsx` — extracted map-pane chrome (badges, legend, search pills)
- `MapLibreCoverageMapLayers.tsx` — extracted coverage-map route/county/GPS/search-target layers
- `ShopDirectoryMapLayers.tsx` — extracted shop-directory route/marker layers
- `ShopDirectoryOriginSearch.tsx` — reusable U.S.-wide origin search lane for shop flow
- `useShopDirectoryRoutePreview.ts` — real OSRM-backed shop-route alternatives with local fallback
- `DashboardRouter.tsx` — now merges marketplace reports with hydrated local report/photo state before allowing shop/insurer dashboards to fall back to demo seed data
- `ShopRequestCard.tsx` / `InsurerClaimCard.tsx` — downstream role cards now surface preview imagery from live submitted reports
- Landing coverage and dashboard coverage widgets now open BidOnDent Maps first for shop directions; Apple/Google/Waze are retained only as explicit export fallback from the active navigation summary sheet
- Coverage browse/landing surfaces now keep ZIP/address search targets authoritative until the user explicitly switches to geolocation mode; passive background GPS no longer hijacks browse route previews
- Public landing coverage search now accepts U.S.-wide ZIP, home, and store-address input, persisting manual address origins into nearby-shop routing and fullscreen coverage navigation
- Active navigation summary chrome now keeps Apple/Google/Waze hidden behind an explicit export disclosure, reinforcing BidOnDent Maps as the primary live route mode
- Fullscreen light-mode browse/navigation shells now use cooler slate-blue glass and tighter mobile-safe route chrome instead of the earlier washed-out white treatment
- Compact mobile shop-result cards now prioritize route start, lighter supporting actions, and smaller score treatment instead of carrying full desktop card density into fullscreen browse states
- Route-preview cards now use appearance-aware styling and shorter pre-navigation step stacks so route planning stays readable on phones and in light mode
- Insurer mapped partner-shop cards now preselect a destination in website map memory and open the BidOnDent shop-directory map flow; manual prospects still export externally
- GeoJSON Source + Layer approach for all markers (data-driven paint expressions)
- `useMap()` imperative API for viewport management
- Route glow: `line-blur` paint property for premium Apple Maps-like effect
- GPS glow: `circle-blur` paint property for location pulse effect
- Popups/attribution: CSS glass blur styling in `theme.css`

---

_Updated each session. Next AI: read this, then `.github/copilot-instructions.md`, then start the highest-priority item from Section 6._
