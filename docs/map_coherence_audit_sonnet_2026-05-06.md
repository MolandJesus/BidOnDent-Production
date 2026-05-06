# Pass 12 Map Coherence Audit — 2026-05-06

**Author:** Claude Opus 4.7 via Sonnet relay (BidOnDent-Horizon-Beta)
**Status:** Phase 1 (read-only audit) — no code or theme edits in this commit.
**Scope:** Inventory the divergence between landing-page and dashboard map experiences so the owner can pick canonical patterns before any unification edits ship.
**Owner directive (verbatim, 2026-05-06):** _"focus on map and map functionality. also make sure both landing page map experience and dashboard full map program are using same site map program for look, design, functionality, and navigation system so map program is coherent across entire program."_

---

## Headline finding

The four owner reference screenshots reveal **two completely separate map systems** living side-by-side in the codebase, not one shared system styled differently:

| System                                                                                                                                                                 | Used by                                                                            | Renderer                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------ |
| **Coverage Map** (`CoverageMapDialog` + `CoverageBrowseExperience` + `CoverageActiveNavigationLayout`)                                                                 | Landing inline, Landing fullscreen, Dashboard "Coverage command center" fullscreen | `MapLibreServiceCoverageMap`   |
| **Shop Directory Map** (`ShopDirectoryImmersiveMap` / `ShopDirectoryHybridStage` + `ShopDirectoryMapOverlays` + `ShopDirectoryMapPaneOverlays` + `MapPaneLegendPanel`) | Dashboard "Find Shops" inline + immersive view                                     | `MapLibreShopDirectoryMapPane` |

The owner's screenshot 3 (landing fullscreen "Mode Midnight 6 regions 6 live shops" + Coverage Command Center sidebar with Search/Explore/Saved/Shops tabs) and screenshot 4 (dashboard inline "ROUTE" card with `1005m / 1035m / 853.4 mi / 876.8 mi` + ALL/PENDING/APPROVED/IN REPAIR/RESOLVED/DONE legend) are not the same map at all — they are two architecturally separate component trees that happen to both show roads and pins.

This is the unification gap. "Make them coherent" means **converge two systems**, not "tune chrome on one shared system."

---

## Phase 1 — divergence inventory

### Surface index

| #   | Surface                                        | Component path                                                                                                                                                                                                                                   | Renderer                                 |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 1   | **Landing inline**                             | [`src/app/components/landing/OperatingRegionsSection.tsx`](src/app/components/landing/OperatingRegionsSection.tsx)                                                                                                                               | `MapLibreServiceCoverageMap` directly    |
| 2   | **Landing fullscreen**                         | [`src/app/components/landing/CoverageMapDialog.tsx`](src/app/components/landing/CoverageMapDialog.tsx) → [`CoverageBrowseExperience.tsx`](src/app/components/landing/CoverageBrowseExperience.tsx)                                               | `MapLibreServiceCoverageMap` (immersive) |
| 3   | **Dashboard "Coverage" panel fullscreen**      | [`src/app/components/dashboard/DashboardCoveragePanel.tsx`](src/app/components/dashboard/DashboardCoveragePanel.tsx) → `CoverageMapDialog`                                                                                                       | `MapLibreServiceCoverageMap` (immersive) |
| 4   | **Dashboard "Find Shops" inline**              | [`src/app/components/shop/ShopDirectoryScreen.tsx`](src/app/components/shop/ShopDirectoryScreen.tsx) → `ShopDirectoryImmersiveMap` → [`ImmersiveMapViewport.tsx`](src/app/components/shop/ImmersiveMapViewport.tsx) → `ShopDirectoryMapOverlays` | `MapLibreShopDirectoryMapPane`           |
| 5   | **Dashboard "Find Shops" hybrid** (alt layout) | [`ShopDirectoryHybridStage.tsx`](src/app/components/shop/ShopDirectoryHybridStage.tsx) → [`ShopDirectoryHybridMapSection.tsx`](src/app/components/shop/ShopDirectoryHybridMapSection.tsx)                                                        | `MapLibreShopDirectoryMapPane`           |

### Divergence table

| Aspect                           | Landing inline (#1)                                                                                                                                                                                                                                                   | Landing/Dashboard fullscreen (#2 + #3)                                                                                                                                                                                                                                                                                                                       | Dashboard inline (#4 / #5)                                                                                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Shared dialog**                | n/a                                                                                                                                                                                                                                                                   | ✅ `CoverageMapDialog` (one component)                                                                                                                                                                                                                                                                                                                       | ❌ separate stack                                                                                                                                                                                                                                                                          |
| **Tile mode control**            | None visible inline (user must open fullscreen)                                                                                                                                                                                                                       | "Mode Midnight" text eyebrow + tone resolver via `tileMode === "night"`                                                                                                                                                                                                                                                                                      | Segmented pill `Map / Night / Satellite` ([`ShopDirectoryMapPaneOverlays.tsx`](src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx))                                                                                                                                                  |
| **Search UX**                    | n/a inline                                                                                                                                                                                                                                                            | Full Coverage Command Center sidebar with tabs `Search / Explore / Saved / Shops` ([`CoverageCommandCenterSidebar.tsx`](src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx) + [`CoverageBrowseSidebarContent.tsx`](src/app/components/landing/CoverageBrowseSidebarContent.tsx))                                                        | Floating "Search this area" pill ([`ShopDirectoryMapPaneOverlays.tsx`](src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx#L344))                                                                                                                                                     |
| **Origin/address input**         | Inline ZIP + address inputs in section card ([`CoverageSearchPanel.tsx`](src/app/components/landing/CoverageSearchPanel.tsx))                                                                                                                                         | "YOUR LOCATION City of Beacon" + "Search address or place" inside sidebar                                                                                                                                                                                                                                                                                    | None visible — address resolved via geolocation hook + `useShopDirectory*`                                                                                                                                                                                                                 |
| **Route preview card**           | n/a                                                                                                                                                                                                                                                                   | Two-card stack: "RECENT ROUTE Elite Auto Works Google Maps · 8:36 PM" + "YOUR ROUTE BidOnDent Hudson Hub" + bottom strip with arrival/min/mi + Share ETA + Start Route ([`CoverageBrowseExperience.tsx`](src/app/components/landing/CoverageBrowseExperience.tsx) + [`CoverageBrowseMapOverlays`](src/app/components/landing/CoverageBrowseMapOverlays.tsx)) | Single floating "ROUTE" card with dual mileage chips (`1005m/853.4mi`, `1035m/876.8mi`), `LIVE ROUTE`, `My Locatio... 737.2 mi · 1264 min`, Request Estimate / Start Navigation buttons ([`ShopDirectoryRoutePreviewCard.tsx`](src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx)) |
| **Nav-start CTA label**          | n/a                                                                                                                                                                                                                                                                   | **"Start Route"** ([`CoverageBrowseMapOverlays`](src/app/components/landing/CoverageBrowseMapOverlays.tsx))                                                                                                                                                                                                                                                  | **"Start Navigation"** (or "Get Directions" fallback, [`ShopDirectoryMapPaneOverlays.tsx#L288`](src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx#L288), [`ShopDirectoryRoutePreviewCard.tsx#L314`](src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx#L314))                |
| **Legend**                       | None                                                                                                                                                                                                                                                                  | None                                                                                                                                                                                                                                                                                                                                                         | `ALL / PENDING / APPROVED / IN REPAIR / RESOLVED / DONE` (report status colors) + `Top pick` ([`MapPaneLegendPanel.tsx`](src/app/components/shop/MapPaneLegendPanel.tsx))                                                                                                                  |
| **Filter chips above map**       | None                                                                                                                                                                                                                                                                  | None                                                                                                                                                                                                                                                                                                                                                         | `Selected · Top pick · Reports (3) · Saved · Routes`                                                                                                                                                                                                                                       |
| **Atmospheric chrome (Pass 11)** | Section uses `bd-landing-section-toplamp` + `bd-landing-section-bottomwash` (custom landing chrome). Coverage map shell uses `theme.shellClassName` from `getMapSurfaceTheme(tone, true)`. **No** Pass 11 cream catchlight / bronze rim / warm halo on the map shell. | Sidebar shell is bespoke (`map-command-sidebar-shell` + `map-liquid-sheen` + custom shadow `0_30px_80px_rgba(2,6,23,0.48)`). **No** Pass 11 utility class. Bottom strip card: bespoke.                                                                                                                                                                       | Route card, legend panel, filter chips: bespoke shadows. **No** Pass 11 utility class.                                                                                                                                                                                                     |
| **Tone resolver**                | `resolveMapSurfaceTone(tileMode)` (LAW-locked)                                                                                                                                                                                                                        | Same                                                                                                                                                                                                                                                                                                                                                         | Independent — uses `appearanceMode` prop directly in some cases                                                                                                                                                                                                                            |
| **Default tile mode**            | `night` if dark appearance, `roadmap` if light                                                                                                                                                                                                                        | inherits from invoker                                                                                                                                                                                                                                                                                                                                        | Defaults to `roadmap` ([`DashboardCoveragePanel.tsx#L48`](src/app/components/dashboard/DashboardCoveragePanel.tsx#L48)); shop directory has its own default                                                                                                                                |

### Key observations

1. **Landing fullscreen ↔ Dashboard "Coverage" fullscreen are already unified.** Both go through `CoverageMapDialog`. The owner's screenshot 3 is the same dialog the dashboard's "Open Coverage Map" button opens. ✅ No work needed there for chrome unification.
2. **Dashboard "Find Shops" inline (screenshot 4) is the divergent system.** It's a completely separate component tree (`ShopDirectory*`) with its own overlays, route card, legend, and filter chips. It does not share `CoverageMapDialog`, `CoverageBrowseExperience`, `CoverageBrowseSidebarContent`, or any sidebar component with the landing/coverage flow.
3. **Two route-preview cards exist with different UX:**
   - Coverage flow: vertical sidebar cards (RECENT ROUTE + YOUR ROUTE + arrival strip)
   - Shop directory flow: floating compact card with dual alternatives (1005m/1035m)
4. **Two nav-start CTA labels exist:** "Start Route" (coverage) vs "Start Navigation" (shop directory). Pick one.
5. **No Pass 11 atmospheric utilities reach any map surface.** The `bd-glass-card--dashboard`, cream catchlight + bronze rim + warm halo treatments shipped in Pass 11 #1–#7 are absent on:
   - Coverage Command Center sidebar shell (uses bespoke `map-command-sidebar-shell` + `map-liquid-sheen`)
   - Coverage bottom strip (arrival/min/mi card)
   - Shop directory route card
   - Shop directory legend panel
   - Shop directory filter chips row

---

## Phase 2 — unification recommendations (DO NOT EDIT YET)

These are picks the owner approves before any code lands.

### Decision 1 — Map system architecture

**Recommend: keep two systems, but converge their CHROME via shared utilities.**

Reasoning: the two systems have different DATA models (coverage = partner-shop density across regions; shop directory = per-report shop discovery + bid context + report status legend). Forcing them into one component would couple unrelated state and 10x the props surface. The user-perceived "coherence" the owner is asking for is **visual chrome + interaction patterns + label parity**, not a single component.

**Concrete unification surface:**

- **Tile mode control:** extract `MapTileSegmentedControl` (Map / Night / Satellite pill) used by shop directory. Adopt in `MapSurfaceControls` (currently used by `MapLibreServiceCoverageMap`). Replaces both the "Mode Midnight" text eyebrow and the bespoke shop directory pill with one component.
- **Route preview card:** create a single `MapRoutePreviewCard` component used by both flows. Pick the dashboard's compact floating layout (more spatial, sits on the map) over the landing's vertical sidebar stack (clutters sidebar). Standardize the dual-mileage chip pattern.
- **Nav-start CTA label:** standardize on **"Start Navigation"** (more explicit; "Start Route" is ambiguous between "preview the route" and "start driving"). Update `CoverageBrowseMapOverlays` to use the shop directory label.
- **Search UX:** keep both. Landing fullscreen needs the discoverable Search/Explore/Saved/Shops tabs because it's a marketing surface (visitor doesn't have a report context yet). Dashboard "Find Shops" already has a report context, so the floating "Search this area" pill is correct.
- **Legend:** keep dashboard-only. Landing has no per-report status, so ALL/PENDING/APPROVED/IN REPAIR/RESOLVED/DONE is meaningless there.

### Decision 2 — Atmospheric chrome on map surfaces (Pass 12.X)

**Recommend: introduce ONE new utility — `bd-glass-card--map`** — that carries the Pass 11 #3/#4 atmospheric stack tuned for map overlays:

```css
/* DARK */
border: 1px solid rgba(96, 165, 250, 0.22);
box-shadow:
  0 12px 44px rgba(2, 6, 23, 0.55),
  /* contact / drop */ 0 0 80px rgba(196, 130, 45, 0.22),
  /* warm gold ambient (LAW cap) */ 0 0 60px rgba(59, 130, 246, 0.12),
  /* cool blue identity */ inset 0 1px 0 rgba(196, 144, 65, 0.36),
  /* cream/gold catchlight */ inset 0 -1px 0 rgba(140, 82, 22, 0.32),
  /* bronze rim */ inset 0 -2px 0 rgba(252, 240, 208, 0.06); /* polished sub-rim */
background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(23, 37, 84, 0.92));
backdrop-filter: blur(20px) saturate(150%);

/* LIGHT — locked Premium Gold Palette, calm cream-paper */
[data-appearance-mode="light"] .bd-glass-card--map {
  /* untouched cream-paper variant */
}
```

Apply to:

- Coverage Command Center sidebar shell (replace `map-command-sidebar-shell` shadow)
- Coverage bottom strip card (arrival/min/mi)
- Shop directory route card (`ShopDirectoryRoutePreviewCard` outer wrap)
- Shop directory legend panel (`MapPaneLegendPanel` outer wrap)
- Shop directory filter chips row container (`ShopDirectoryMapPaneOverlays` filter pill bar)

This is the same Pass 11 #3/#4 grammar already shipped to `ReportDetailDrawer` and `MapBidSheet`. Bringing maps into the same family completes the dark-mode atmospheric pass.

### Decision 3 — Default tile mode parity

Currently `DashboardCoveragePanel` defaults to `roadmap` regardless of dark mode (line 48). Other surfaces respect appearance. **Recommend: standardize the tile-mode-on-mount rule:** if `appearanceMode === "map-dark"` (or unspecified dark), default to `night`. Otherwise `roadmap`. User-toggled `satellite` persists across reloads (already handled by `useOperatingRegionsCoverage` line 47).

---

## Phase 3 — migration plan (ranked, smallest blast radius first)

| Pass                         | Scope                                                                               | Files                                                                                         | Risk                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **12 #1**                    | Add `bd-glass-card--map` utility to `theme.css` (definition only, not applied yet). | `src/styles/theme.css`                                                                        | Zero — pure addition                                 |
| **12 #2**                    | Apply `bd-glass-card--map` to Coverage Command Center sidebar shell.                | `CoverageBrowseExperience.tsx` (replace `map-command-sidebar-shell` shadow line)              | Low — visual only, no behavior                       |
| **12 #3**                    | Apply `bd-glass-card--map` to Coverage bottom strip card (arrival/min/mi).          | `CoverageBrowseMapOverlays.tsx`                                                               | Low                                                  |
| **12 #4**                    | Apply `bd-glass-card--map` to `ShopDirectoryRoutePreviewCard` outer wrap.           | `ShopDirectoryRoutePreviewCard.tsx`                                                           | Low                                                  |
| **12 #5**                    | Apply `bd-glass-card--map` to `MapPaneLegendPanel` + filter chips bar.              | `MapPaneLegendPanel.tsx`, `ShopDirectoryMapPaneOverlays.tsx`                                  | Low                                                  |
| **12 #6**                    | Standardize nav-start CTA label to "Start Navigation" across coverage flow.         | `CoverageBrowseMapOverlays.tsx`, `CoverageBrowseSidebarContent.tsx` (any "Start Route" sites) | Low — label only                                     |
| **12 #7**                    | Fix `DashboardCoveragePanel` default tile mode to follow `appearanceMode`.          | `DashboardCoveragePanel.tsx` line 48                                                          | Low — single state init                              |
| **12 #8 (optional, larger)** | Extract `MapTileSegmentedControl` and adopt in `MapSurfaceControls`.                | New file + 2 invokers updated                                                                 | Medium — touches shared map renderer                 |
| **12 #9 (optional, larger)** | Extract `MapRoutePreviewCard` shared component.                                     | New file + 2 invoker updates                                                                  | Medium — replaces two existing route card components |

Recommend executing 12 #1–#7 as the first chrome-unification batch (each is its own narrow pass per project discipline). Defer 12 #8–#9 until after the owner sees the chrome changes land — they are the actual architectural unification and should be a separate decision.

---

## Hard-stop flags

### HSF-1 — Mileage display is wrong on dashboard route card (REAL BUG, not chrome)

Owner's screenshot 4 shows the dashboard "ROUTE" card displaying:

- Two mileage chips: `1005m / 853.4 mi` and `1035m / 876.8 mi`
- `LIVE ROUTE` strip: `My Locatio...  737.2 mi · 1264 min`

For an account based in NY-area with a "My Location" pin clearly inside the visible map frame and a `Focused: Express Auto Body` shop also in the same frame, **737.2 miles / 1264 minutes (21 hours) is impossible.** The two leading chips show meters paired with miles in a way that suggests the route distance is being rendered twice through a unit converter (e.g. miles value passed to a `formatMeters` helper, or vice versa).

**Most likely root cause:** unit conversion in the route preview helper — values appear to have been converted to miles **and then converted again as if they were still meters**. `1005m → 0.6 mi` would be plausible; `1005m / 853.4mi` shown side-by-side is the symptom.

**Recommended owner action:** track as a separate finding. This audit's chrome-unification scope does not touch the route preview helper, but the fix likely lives in `ShopDirectoryRoutePreviewCard.tsx` distance formatting or in the `useShopDirectoryRoute*` hook that computes `distanceMiles` / `distanceMeters`. Open as KI-### in `REF_KNOWN_ISSUES.md` before any Pass 12 chrome work ships.

### HSF-2 — `map-command-sidebar-shell` and `map-liquid-sheen` are bespoke

`CoverageBrowseExperience.tsx` lines ~280–305 define ad-hoc chrome (`map-command-sidebar-shell`, `map-liquid-sheen`, hand-rolled blue/cream gradients) outside the `bd-*` utility system. This is the kind of scattered chrome that future LAW audits will flag. Pass 12 #2 absorbs this into `bd-glass-card--map` and the bespoke classes can be deprecated.

### HSF-3 — No LAW violations found in map surface code

I checked the relevant files for:

- ❌ pure white surfaces — none
- ❌ yellow-amber tokens (`amber-300/400/500`) — none in any map component (the amber-\* sweep from Pass 10 already cleared these)
- ❌ off-locked gold values (220/165/90, 254/248/220, 160/95/25, 220/140/50) — none
- ❌ data leaks via `storage://` — n/a (map components don't hydrate user media)
- ❌ direct Supabase from component — n/a (`useCoveragePartnerShops` hook routes through edge function)

Map system is clean for LAW; the gap is purely chrome unification + label parity + the unit-bug HSF-1.

---

## Files referenced

### Coverage system (shared landing + dashboard fullscreen)

- [`src/app/components/landing/OperatingRegionsSection.tsx`](src/app/components/landing/OperatingRegionsSection.tsx) — landing inline invoker
- [`src/app/components/landing/CoverageMapDialog.tsx`](src/app/components/landing/CoverageMapDialog.tsx) — shared fullscreen dialog
- [`src/app/components/landing/CoverageBrowseExperience.tsx`](src/app/components/landing/CoverageBrowseExperience.tsx) — browse layout (sidebar + map)
- [`src/app/components/landing/CoverageActiveNavigationLayout.tsx`](src/app/components/landing/CoverageActiveNavigationLayout.tsx) — turn-by-turn layout
- [`src/app/components/landing/CoverageBrowseMapOverlays.tsx`](src/app/components/landing/CoverageBrowseMapOverlays.tsx) — bottom strip + Start Route CTA
- [`src/app/components/landing/CoverageBrowseSidebarContent.tsx`](src/app/components/landing/CoverageBrowseSidebarContent.tsx) — sidebar tab views
- [`src/app/components/landing/CoverageSearchPanel.tsx`](src/app/components/landing/CoverageSearchPanel.tsx) — inline ZIP/address search
- [`src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx`](src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx) — Mode Midnight eyebrow + tab shell
- [`src/app/components/dashboard/DashboardCoveragePanel.tsx`](src/app/components/dashboard/DashboardCoveragePanel.tsx) — dashboard fullscreen invoker
- [`src/app/hooks/useOperatingRegionsCoverage.ts`](src/app/hooks/useOperatingRegionsCoverage.ts) — landing data hook (LAW boundary, do not touch)

### Shop Directory system (dashboard inline — divergent)

- [`src/app/components/shop/ShopDirectoryScreen.tsx`](src/app/components/shop/ShopDirectoryScreen.tsx) — top-level screen
- [`src/app/components/shop/ShopDirectoryImmersiveMap.tsx`](src/app/components/shop/ShopDirectoryImmersiveMap.tsx) — immersive layout
- [`src/app/components/shop/ShopDirectoryHybridStage.tsx`](src/app/components/shop/ShopDirectoryHybridStage.tsx) — alt hybrid layout
- [`src/app/components/shop/ImmersiveMapViewport.tsx`](src/app/components/shop/ImmersiveMapViewport.tsx) — viewport wrapper
- [`src/app/components/shop/ShopDirectoryHybridMapSection.tsx`](src/app/components/shop/ShopDirectoryHybridMapSection.tsx) — hybrid section wrapper
- [`src/app/components/shop/ShopDirectoryMapOverlays.tsx`](src/app/components/shop/ShopDirectoryMapOverlays.tsx) — overlays for the immersive layout
- [`src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx`](src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx) — overlays for the map pane (Search this area, Start Navigation, filter chips)
- [`src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx`](src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx) — ROUTE floating card (HSF-1 lives here)
- [`src/app/components/shop/ShopDirectoryRoutePanel.tsx`](src/app/components/shop/ShopDirectoryRoutePanel.tsx) — route panel
- [`src/app/components/shop/MapPaneLegendPanel.tsx`](src/app/components/shop/MapPaneLegendPanel.tsx) — ALL/PENDING/APPROVED/IN REPAIR/RESOLVED/DONE legend
- [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) — renderer

### Shared substrate (LAW-locked, do NOT touch internals)

- [`src/app/components/maps/MapLibreServiceCoverageMap.tsx`](src/app/components/maps/MapLibreServiceCoverageMap.tsx) — coverage renderer
- [`src/app/components/maps/MapSurfaceControls.tsx`](src/app/components/maps/MapSurfaceControls.tsx) — tile mode + reset controls
- [`src/app/components/maps/mapSurfaceTheme.ts`](src/app/components/maps/mapSurfaceTheme.ts) — `resolveMapSurfaceTone`, `getMapSurfaceTheme` (LAW-locked)
- [`src/app/components/maps/serviceCoverageMapTypes.ts`](src/app/components/maps/serviceCoverageMapTypes.ts) — `MapTileMode`, `MapSurfaceTone`

---

## Visual evidence

- Owner-supplied references in Pass 12 brief (2026-05-06): light Account, dark Account, landing fullscreen coverage map, dashboard inline shop directory map.
- Fresh capture: [`docs/audit-assets/visual-2026-05-06/60-dark-pass12-audit-dashboard-current-state.png`](docs/audit-assets/visual-2026-05-06/60-dark-pass12-audit-dashboard-current-state.png) (current state of the live dashboard for grounding).

---

## Awaiting owner approval

Before any Pass 12 #1–#7 chrome edits ship:

1. ✅ / ❌ — Approve the **two-systems-with-shared-chrome** architecture decision (vs forcing one component).
2. ✅ / ❌ — Approve **"Start Navigation"** as the canonical CTA label.
3. ✅ / ❌ — Approve the **`bd-glass-card--map`** utility introduction with the Pass 11 #3/#4 grammar.
4. ✅ / ❌ — Approve **HSF-1** (mileage bug) tracking as a separate KI-### before any Pass 12 chrome work begins, OR explicitly defer.
5. ✅ / ❌ — Approve **deferring** the larger 12 #8 (`MapTileSegmentedControl`) and 12 #9 (`MapRoutePreviewCard`) extraction passes until after #1–#7 land.

Once approved, Pass 12 #1 (`bd-glass-card--map` utility definition) is the immediate next pass. Each subsequent pass is independent and reversible per project discipline.

---

**End of audit.** No code or theme files modified in this commit.
