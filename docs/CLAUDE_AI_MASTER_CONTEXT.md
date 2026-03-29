# BidOnDent — Master AI Context

> **Single source of truth for any AI agent working on this repo.**
> All other AI handoff docs defer to this file. Read this first, every session.
>
> **Last updated:** 2026-03-28 (Pass 432 — comprehensive doc sync)
> **Status:** Active master context source of truth
> **Branch:** `BidOnDent-Horizon-Beta` (working) → `main` (stable, Vercel auto-deploy)
> **Build:** ✅ 0 errors · ~2.1s · 514KB main bundle (index chunk)
> **TypeScript:** 0 tsc errors (achieved Pass 421, maintained through 431)
> **Images:** 22.9MB total (was 53.6MB — Pass 430 JPEG conversion)

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
- React Leaflet / Leaflet (interactive maps)
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

- `"dark"` → CARTO dark tiles + dark glass overlays
- `"light"` → OpenStreetMap tiles + light glass overlays (white text over map is wrong — overlays adapt)
- Map theme is stored in `useShopDirectorySession` as `mapTheme` state
- Leaflet popup backgrounds are always white — popup content always uses dark text (`text-slate-800`)

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

Used by: `OperatingRegionsSection`, `CustomerMapWidget`, `CoverageMapDialog`

```
ServiceCoverageMap.tsx       ← Leaflet base map, tile mode switcher
CoverageMapDialog.tsx        ← Full-screen coverage modal (customer widget)
CoverageMapOverlays.tsx      ← Landing page overlays
useCoveragePartnerShops.ts   ← Fetches real partner shops from Supabase
useCoverageNavigationExperience.ts ← Navigation origin management
```

**Theme:** Uses `resolveMapSurfaceTone(tileMode)` → `getMapSurfaceTheme(tone)` from `mapSurfaceTheme.ts`.

### B. ShopDirectoryMapPane (dashboard Find A Shop)

Used by: `ShopDirectoryScreen` (hybrid + list modes), `ShopDirectoryImmersiveMap` (full-screen map mode)

```
ShopDirectoryScreen.tsx              ← Orchestrator (hybrid + list layout)
  └── ShopDirectoryMapPane.tsx       ← Leaflet map pane (markers, routes, overlays)
        └── ShopDirectoryMapViewportManager.tsx ← Viewport fit/fly logic
        └── ShopDirectoryMapOverlays.tsx        ← Floating overlays (intelligence, route, actions)
ShopDirectoryImmersiveMap.tsx        ← Full-viewport map mode (own top bar + results drawer)
useShopDirectorySession.ts           ← All session state (search, filter, sort, map, routes)
shopMapExperience.ts                 ← buildShopMapListings, buildShopRouteOptions, filters
shopMapData.ts                       ← NY coordinates, suggested origins
shopMapRouting.ts                    ← Distance, ETA, route building
directoryAdapters.ts                 ← Supabase shop/insurer → map listing adapters
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
8. **Leaflet popups are always white.** Always use dark text inside Leaflet popups.
9. **NY is the coverage area.** No Dallas/TX coordinates anywhere in the codebase.
10. **Stop and ask** if: deleting >3 files, touching auth/payment/Clerk config, Supabase RLS policies, or build fails after 2 attempts.

---

## 8. Key Files Quick Reference

### Map Program

| File                                                          | Purpose                                         |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `src/app/components/shop/ShopDirectoryScreen.tsx`             | Main orchestrator for dashboard shop discovery  |
| `src/app/components/shop/ShopDirectoryMapPane.tsx`            | Leaflet map pane with theme-aware overlays      |
| `src/app/components/shop/ShopDirectoryMapOverlays.tsx`        | Floating intelligence + route + action overlays |
| `src/app/components/shop/ShopDirectoryImmersiveMap.tsx`       | Full-viewport immersive map mode                |
| `src/app/components/shop/ShopDirectoryMapViewportManager.tsx` | Viewport fit/fly-to + tile layers               |
| `src/app/hooks/useShopDirectorySession.ts`                    | All session state for shop directory            |
| `src/app/services/intelligence/shopMapExperience.ts`          | Shop listing builder, filters, role highlights  |
| `src/app/services/intelligence/shopMapData.ts`                | NY shop coordinates + suggested origins         |
| `src/app/services/intelligence/shopMapRouting.ts`             | Distance/ETA/route computation                  |
| `src/app/services/intelligence/directoryAdapters.ts`          | Supabase shop/insurer → ShopMapListing adapter  |
| `src/app/components/maps/ServiceCoverageMap.tsx`              | Landing page map (separate from dashboard)      |
| `src/app/components/landing/CoverageMapDialog.tsx`            | Full-screen coverage map modal                  |
| `src/app/components/dashboard/CustomerMapWidget.tsx`          | Customer home map widget                        |
| `src/app/components/dashboard/ShopMapWidget.tsx`              | Shop home map widget                            |
| `src/app/components/dashboard/InsurerMapWidget.tsx`           | Insurer home map widget                         |

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

All other AI docs in this repo point to this file as the master context. The following are historical/specialized and should be consulted for deep context on specific areas:

| Doc                                            | Use When                                     |
| ---------------------------------------------- | -------------------------------------------- |
| `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`   | Need archived pass history context           |
| `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`      | Need the product completion roadmap          |
| `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` | Need map design law and strategic intent     |
| `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`     | Need map delivery reality tracker            |
| `docs/BIDONDENT_PRODUCT_BRAIN.md`              | Need full product strategy framework         |
| `.github/copilot-instructions.md`              | Need architecture rules + pass output format |
| `docs/GETTING_STARTED.md`                      | New developer environment setup              |
| `docs/SUPABASE_SETUP_GUIDE.md`                 | Supabase project configuration               |

**Retired (superseded by this doc):**

- `docs/AI_HANDOFF_PROMPT.md` — replaced by this file
- `docs/AI_DESIGN_HANDOFF_PROMPT.md` — replaced by this file
- `docs/AI_LIQUID_GLASS_HANDOFF_PROMPT.md` — work is complete (passes 236-242 done)
- `docs/AI_DASHBOARD_WORK_PROMPT.md` — replaced by this file
- `docs/AI_BACKEND_TASK_PROMPT.md` — replaced by this file
- `docs/DUAL_AI_COORDINATION_PROMPT.md` — no longer running dual agents

---

---

## 14. Quality & Reliability Sweep (Passes 400–431)

Major milestones in this phase:

- **All user-facing `alert()` calls eliminated** — replaced with inline error/success feedback
- **Zero tsc errors** — achieved in Pass 421, maintained through 431
- **57% image size reduction** — PNG→JPEG conversion (53.6MB → 22.9MB)
- **Race conditions fixed** — useBusinessProfile fetch (426), useUserData autosave (427)
- **Error propagation hardened** — bid submission (425), profile save (428)
- **8 oversized files refactored** — all src files now under 500 lines (Passes 400-407)
- **3 dead code items removed** — accountDeletion.ts (419), 3 unused image imports (430)

| Pass    | Title                                        | Status  |
| ------- | -------------------------------------------- | ------- |
| 400-407 | Refactor 8 oversized files (all < 500 lines) | ✅ Done |
| 408     | Sidebar scroll + SettingsModal dark mode     | ✅ Done |
| 409-416 | Product quality sweep                        | ✅ Done |
| 417     | HelpModal + ShopProfileModal alert→inline    | ✅ Done |
| 418     | Fix ShopProfileModal imports + demo data     | ✅ Done |
| 419     | Remove dead accountDeletion.ts               | ✅ Done |
| 420     | Business inquiry form validation             | ✅ Done |
| 421     | Fix TypeScript type errors (3 → 0)           | ✅ Done |
| 422     | AccountScreen image upload error inline      | ✅ Done |
| 423     | PaymentModal coming soon placeholder         | ✅ Done |
| 424     | All remaining user-facing alerts             | ✅ Done |
| 425     | Bid submission error propagation + loading   | ✅ Done |
| 426     | Business profile fetch race condition fix    | ✅ Done |
| 427     | Autosave race in useUserData                 | ✅ Done |
| 428     | AccountScreen async error safety             | ✅ Done |
| 429     | Master context doc sync                      | ✅ Done |
| 430     | PNG→JPEG image optimization (57% reduction)  | ✅ Done |
| 431     | BidsScreen useEffect deps + type fix         | ✅ Done |

---

_Updated each session. Next AI: read this, then `.github/copilot-instructions.md`, then start the highest-priority item from Section 6._
