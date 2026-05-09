# Map Program Unification Plan (2026-05-08)

> **Tier:** PLAN. Future direction, not current truth. Multi-pass refactor under
> Soft Launch Hardening — gated on master-builder review against
> [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) before any
> shell-extraction pass starts.
>
> **Companion docs:** [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) (strategic vision),
> [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) (KI-170 / KI-171 / KI-172 — the
> three findings this plan exists to retire), [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md)
> (apex visual canon — locked, additive-only).

**Author:** audit AI (Pass 10) under master-builder dispatch 2026-05-08.
**Status:** Draft for builder review. No implementation passes start until
the master builder signs off against LAW_LAYERED_ARCHITECTURE.

---

## Why this doc exists

The map program currently presents as **five visually unrelated surfaces** that
share the MapLibre engine but diverge across every other axis: top chrome,
side panels, status pills, legends, search affordances, tile toggles, and
routing surfaces. KI-170 catalogues the divergence as 100% across measured
axes. KI-171 layers in the public-landing observation that three different map
languages stack vertically on a single scroll. KI-172 (closed Pass 10) was a
data-trust contradiction caused by the divergence — landing rendered six
rated demo pins while the sidebar reported "0 partner shops" because the
disclaimer banner the dashboard relied on was never ported across.

The unification target is a single composable `<MapProgramShell>` with
host-mounted slots, so the five surfaces share chrome by default and
intentionally differ only where the host context demands it.

---

## §1. Surface inventory (current state, 2026-05-08)

Five surfaces. For each: file path, mount context, what chrome it owns
directly, what it lacks (relative to the union of all five).

### 1.1 `CoverageBrowseExperience` — landing fullscreen body

- **File:** [`src/app/components/landing/CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx) (490 lines after Pass 10 KI-172 edit; was 463).
- **Mount:** rendered inside `CoverageMapDialog` when `presentationMode === "browse"`. Also reachable from `OperatingRegionsSection`'s lazy-inline mount path before the user opens the dialog.
- **Owns:** `<ServiceCoverageMap immersiveFullscreen showSurfaceChrome={false}>` (delegates engine + base chrome), desktop sidebar via `CoverageCommandCenterSidebar` wrapped in `bd-glass-card--map`, `CoverageBrowseMapOverlays` (top instruction + ETA + start-nav), `MobileMapBottomSheet` on mobile, search/discovery role plumbing, route preview, saved-locations.
- **Lacks (relative to union):** persistent top-bar with Search/Explore/Saved/Shops tabs (those live in the sidebar instead — see KI-170), tile-mode toggle in chrome (delegated to sidebar control), legend strip, status-bar partner-shop count, three-icon right toolbar.
- **Pass 10 addition:** disclaimer banner (`bd-notice--warn` overlay, `usingDemoFallback`-gated) ported from dashboard, satisfying KI-172.

### 1.2 `CoverageMapDialog` — landing modal wrapper

- **File:** [`src/app/components/landing/CoverageMapDialog.tsx`](../src/app/components/landing/CoverageMapDialog.tsx) (321 lines).
- **Mount:** triggered by `OperatingRegionsSection` (and the `bd:open-landing-coverage-map` global event from the hero double-tap). Radix `Dialog` shell.
- **Owns:** modal frame + dialog accessibility (title, description, close-X), presentation-mode switch (`browse` vs `navigating` → swaps body between `CoverageBrowseExperience` and `CoverageActiveNavigationLayout`), notification dispatch on navigation actions, voice priming gate.
- **Lacks:** anything below the dialog frame is delegated to its body — the dialog itself contributes only the modal envelope.

### 1.3 `OperatingRegionsSection` — landing inline section

- **File:** [`src/app/components/landing/OperatingRegionsSection.tsx`](../src/app/components/landing/OperatingRegionsSection.tsx) (599 lines — note: at L2 budget ceiling, future additions should be split, not appended).
- **Mount:** inline section on the landing page below the hero.
- **Owns:** `useScrollAnimation`, `useParallaxOffset`, `useMediaQuery`, `useOperatingRegionsCoverage`, lazy-mount via IntersectionObserver (Pass 49 / KI-053 — long-task containment), inline `ServiceCoverageMap` mount with minimal chrome, `CoverageSearchPanel`, `CoverageNearestShops`, `CoverageMapDialog` open/close state, `bd:open-landing-coverage-map` global event listener.
- **Lacks:** rich command center, sidebar tabs, route preview, navigation HUD — all delegated to `CoverageMapDialog` body when expanded.

### 1.4 `MapLibreServiceCoverageMap` — the engine + base chrome wrapper

- **File:** [`src/app/components/maps/MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx) (368 lines).
- **Mount:** rendered by `CoverageBrowseExperience`, `CoverageActiveNavigationLayout`, `OperatingRegionsSection` inline path, dashboard Smart Shop Map mount (the host that exposes the legend / ROUTE box from KI-164/166), and any future shells that target the same engine.
- **Owns:** `react-map-gl/maplibre` `<Map>` instantiation, `maplibreResizePatch`, `MapLibreCoverageMapLayers`, `MapLibrePartnerShopLayer`, `MapLibreReportLayer` (gated by `showReportLayer`), `MapLibreDiscoveryPlaceLayer`, `MapNavigationHud` (gated by `showNavigationHud`), `MapSurfaceControls`, `MapSurfaceHeaderBadges`, `MapSurfaceStatusBar`, viewport controllers, follow-location controller, arrival camera effect, performance tracking.
- **Lacks:** the dashboard-side dual legend (KI-166), Smart Shop Map "Finding the best shops…" loading pill (KI-165), ROUTE-box positioning logic (KI-164) — these live in the dashboard host and overlay the engine, **not** inside this component.
- **Architectural smell:** this component is doing two jobs — engine wrapper + base chrome host. The unification proposes splitting these into `<MapEngineCanvas>` (pure engine) and `<MapProgramShell>` (chrome host). See §2.

### 1.5 `ShopDirectoryImmersiveMap` — shop directory immersive surface

- **File:** [`src/app/components/shop/ShopDirectoryImmersiveMap.tsx`](../src/app/components/shop/ShopDirectoryImmersiveMap.tsx) (361 lines).
- **Mount:** rendered by `ShopDirectoryScreen` and `ShopDirectoryHybridStage` when the user enters the immersive map mode.
- **Owns:** `ImmersiveMapTopBar`, `ImmersiveMapResultsDrawer` (drawer-snap state), `ImmersiveMapViewport` (separate from `MapLibreServiceCoverageMap` — own viewport control), `ImmersiveOriginPicker`, `ShopDirectoryMapInfoPanel`, route options + selection state, navigation session telemetry, GPS / speed-limit / voice-mode plumbing, deviation prompt, off-route detection, follow-current-position controller.
- **Lacks (relative to union):** integration with `MapLibreServiceCoverageMap`'s shared chrome (this is the highest-behavioral-coupling surface and migrates last).
- **Architectural smell:** parallel viewport implementation. Migration must verify `ImmersiveMapViewport` and `MapLibreServiceCoverageMap` can converge on the same engine wrapper without losing the directory-specific behaviors (route options, drawer snap, origin picker).

---

## §2. `<MapProgramShell>` shell + slot contract

### 2.1 Always-present chrome (shell-owned)

- **Top bar:** logo / back / search bar / search-this-area button / tile-mode toggle / split-view toggle / map-toggle.
- **Map area:** `<MapEngineCanvas>` mount (the extracted MapLibre engine — `MapLibreServiceCoverageMap` minus its chrome).
- **Bottom-right utilities:** locate-me, recenter, compass (immersive only), zoom (where engine doesn't already render its own). Honors Pass 171 upper-third pin-pan offset, Pass 172 immersive-fullscreen compass, Pass 166 smooth flyTo on bounds-fit.

### 2.2 Host-mounted slots (slot props)

- **`leftPanel`** — sidebar / command center / search results drawer.
- **`rightPanel`** — selected-shop card / ROUTE box / navigation HUD.
- **`statusPill`** — top-of-map status (loading, demo-fallback, error). KI-172 banner is the canonical demo-fallback `statusPill`.
- **`legend`** — semantic legend strip (currently dashboard-only). Default-collapsed per KI-166 fix direction; opt-in by host.
- **`hoverInspector`** — hover-tooltip layer for pin glyphs (alternative to permanent legend per KI-166).
- **`bottomSheet`** — mobile-only drawer (`MobileMapBottomSheet` or `ImmersiveMapResultsDrawer`-style snap).

### 2.3 Slot prop API (TypeScript)

```ts
import type { ReactNode } from "react";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
  MapSurfaceTone,
} from "../maps/serviceCoverageMapTypes";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";

/**
 * Engine-bound props — always required; passed straight to
 * <MapEngineCanvas>. Hosts cannot opt these out.
 */
export type MapProgramShellEngineProps = {
  tone: MapSurfaceTone;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  radiusMeters: number;
  radiusMiles: string;
  immersiveFullscreen?: boolean;
  presentationMode?: "coverage" | "navigation";
};

/**
 * Slots that hosts can optionally render. Undefined = render nothing
 * for that slot. The shell decides positioning, z-index, and motion;
 * the slot owns content only.
 */
export type MapProgramShellSlots = {
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  statusPill?: ReactNode;
  legend?: ReactNode;
  hoverInspector?: ReactNode;
  bottomSheet?: ReactNode;
};

/**
 * Behavior props — uniform handlers the shell wires into the always-
 * present chrome (top bar, bottom-right utilities). Hosts override by
 * providing their own callback shapes.
 */
export type MapProgramShellBehavior = {
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop?: (shopId: string) => void;
  onSearchSubmit?: (query: string) => void;
  onSearchInArea?: () => void;
  onRetryPartnerShops?: () => void;
};

export type MapProgramShellProps = MapProgramShellEngineProps &
  MapProgramShellSlots &
  MapProgramShellBehavior & {
    /** Host identifier — drives default slot visibility + LAW palette branch. */
    host:
      | "dashboard-fullscreen"
      | "landing-dialog"
      | "operating-regions-inline"
      | "shop-directory-immersive"
      | "dashboard-mini";
    /** Persona overlay state — promoted to shell only if all four hosts agree to it; otherwise stays host-level. */
    navigation?: CoverageNavigationExperience;
    className?: string;
    children?: never;
  };
```

**Slot contract rules:**

1. The shell never reaches into slot content. Slots are opaque `ReactNode`.
2. The shell owns slot **positioning, z-index, and motion** — hosts must not apply `absolute` / `z-*` / `animate-in` to their slot content. This prevents the "host overlays compete with shell chrome" pattern that produces KI-164.
3. Mobile + desktop handling is shell-resolved. Hosts pass the same slots; the shell decides whether `leftPanel` becomes a sidebar (desktop) or part of `bottomSheet` (mobile).
4. The shell's always-present chrome (§2.1) is **non-overridable**. Hosts can hide it via `host` discriminator only — not via slot replacement. This is what makes the program "unified" rather than "five themes of the same template".

---

## §3. Host configurations table (4 hosts × 6 slots)

> KI-170 names the four primary hosts. `OperatingRegionsSection` is treated
> as a degenerate case of `landing-dialog` (same shell, no `leftPanel`,
> no `statusPill`, no `legend`).

| Slot             | `dashboard-fullscreen`                                                                          | `landing-dialog`                                                                                                    | `shop-directory-immersive`                                                                                      | `dashboard-mini`                                  |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `leftPanel`      | `<SmartShopMapLeftRail>` — selected-shop card, ROUTE box (post-§4 migration), persona switcher. | `<CoverageCommandCenterSidebar>` wrapping `<CoverageBrowseSidebarContent>` (Search / Explore / Saved / Shops tabs). | `<ImmersiveMapResultsDrawer leftMode>` — currently rendered as bottom drawer; migrates to left rail on desktop. | none                                              |
| `rightPanel`     | `<MapNavigationHud>` (live nav) or none in browse mode.                                         | `<CoverageBrowseMapOverlays>` (top instruction, ETA, start-nav).                                                    | `<ShopDirectoryMapInfoPanel>` (selected-shop detail).                                                           | none                                              |
| `statusPill`     | demo-fallback warn banner (already shipped on dashboard, source for the KI-172 port).           | demo-fallback warn banner (Pass 10 KI-172 port).                                                                    | none currently — directory has different demo-data semantics; revisit during §4 step 4.                         | route-summary mini-pill (the KI-169 fix surface). |
| `legend`         | dual semantic + status legend (KI-166 — collapsed-by-default after fix).                        | none.                                                                                                               | none.                                                                                                           | none.                                             |
| `hoverInspector` | future tooltip mode (KI-166 alternative).                                                       | future tooltip mode.                                                                                                | none — directory uses persistent info panel instead.                                                            | none.                                             |
| `bottomSheet`    | none on desktop; mobile uses generic shell sheet.                                               | `<MobileMapBottomSheet>` wrapping the same content as `leftPanel`.                                                  | `<ImmersiveMapResultsDrawer>` with snap behavior.                                                               | none.                                             |

---

## §4. Migration roadmap (pass-by-pass, no big-bang)

> Each step ships independently and the program continues to work. No step
> requires a coordinated multi-file rewrite.

### Step A — Extract shared top-bar (1 pass) — **SCOPED COMPLETE 2026-05-09 (Pass 181 / cowork Pass 23 fold-in)**

> **Important scope clarification (Pass 187, 2026-05-09):** "Step A" in this plan
> means **Engine B top-bar canonicalization only** — i.e. lifting
> `ImmersiveMapTopBar` to `src/app/components/maps/shell/MapProgramTopBar.tsx`.
> It does **not** mean shell unification proper. Shell unification (multi-host,
> slot-based) starts at Step C.1 (`<MapEngineCanvas>` extraction). Future
> agents reading "Step A ✅" should not assume the full shell is in place.

- ✅ New file shipped: `src/app/components/maps/shell/MapProgramTopBar.tsx` (canonical L2 shell home, 199 lines).
- ✅ `ImmersiveMapTopBar.tsx` refactored to thin re-export shim — Engine B (shop-directory-immersive) consumers continue working unchanged via a 27-line type-preserving re-export.
- ✅ Master-builder Pass 181 commit: `d3a5ad7c` (after host-side build verification: typecheck PASS, vitest 577/577, npm run build clean 3861 KiB precache).
- ✅ Master-builder gate #6 resolved (Pass 183, option a): Engine A (`CoverageBrowseExperience` via `MapSurfaceControls` — inline-embedded UX shape) and Engine B (immersive-fullscreen via the new `MapProgramTopBar`) are kept as **two co-existing top-bar components**. Engine convergence proceeds at Step C.1, where the `<MapEngineCanvas>` extraction makes a single shell wrapper sound.
- ⚠ **Dashboard Smart Shop Map host** — KI-164 investigation never pinpointed the host, but Step A's resolved scope (Engine B only) means the dashboard fullscreen migration is part of Step C, not Step A.
- Evidence: `docs/evidence/pass-11-2026-05-08/PASS_23_STEP_A_SHIP.md` (cowork-A) + `STEP_B_SCOPE_CLARIFICATION.md` (audit AI parallel convergence on the same UX-divergence finding).

### Step B — Extract shared bottom-right utility cluster (1 pass) — **NOT FEASIBLE AS SCOPED (Pass 24 cowork-A)**

- ⚠ **Feasibility blocker:** the bottom-right cluster on each engine is composed of MapLibre-native primitives wired differently per engine, not a custom JSX cluster:
  - **Engine A** (`CoverageBrowseExperience` via `MapSurfaceControls`): MapLibre `NavigationControl` (built-in) + Focus / Overview / Expand custom buttons inside `MapSurfaceControls`.
  - **Engine B** (`shop-directory-immersive`): MapLibre `NavigationControl` + `GeolocateControl` + `ScaleControl`, all built-in primitives, registered directly on the map instance.
- A "presentational lift" cannot move MapLibre-native control instances — they're tied to the map lifecycle. The shared cluster would need to be either (a) a _factory_ that registers the right MapLibre controls per host (orchestration concern, not L2 component), or (b) a true custom JSX cluster that _replaces_ MapLibre-native controls and re-implements zoom/locate/scale (significant behavior re-write, not a lift).
- Evidence: `docs/evidence/pass-11-2026-05-08/PASS_24_STEP_B_FEASIBILITY.md` (cowork-A) + `STEP_B_SCOPE_CLARIFICATION.md` (audit AI parallel convergence).
- **Recommendation:** master-builder re-scope Step B before any pass starts. Either (a) accept "MapLibre-native controls per engine, no shared cluster", (b) re-scope as an L3 orchestration extraction (factory pattern), or (c) push it to Step C.1 `<MapEngineCanvas>` extraction where the map lifecycle is already owned.

### Step B (original — superseded) — Extract shared bottom-right utility cluster (1 pass)

- ~~New file: `src/app/components/maps/shell/MapProgramUtilityCluster.tsx`.~~
- ~~Lift locate-me, recenter, compass, zoom into one cluster.~~
- ~~Preserve Pass 166 smooth flyTo, Pass 171 upper-third pin-pan offset, Pass 172 immersive-fullscreen compass.~~

### Step C — Migrate `dashboard-fullscreen` first (2 passes)

> **⚠ Pass 191 finding — premise unsound, re-target pending owner decision:**
> Investigation [`docs/evidence/pass-191-2026-05-09/DASHBOARD_FULLSCREEN_HOST_INVESTIGATION.md`](evidence/pass-191-2026-05-09/DASHBOARD_FULLSCREEN_HOST_INVESTIGATION.md)
> verified that **no dashboard-side mount of `MapLibreServiceCoverageMap` exists in
> `src/`**. Dashboard maps are a card-shaped preview rendered by `MapLibreDashboardMapPreview`
> (a parallel MapLibre instance). The "dashboard-fullscreen" host described in §1 / §3 / §4
> does not currently exist as a code surface, so sub-pass 3 cannot legitimately target it
> without first migrating `MapLibreDashboardMapPreview` onto `<MapEngineCanvas>` (a separate
> structural pass not currently planned). The evidence doc recommends **option (a):
> re-target sub-pass 3 to `landing-dialog`** (the `CoverageBrowseExperience` host, which
> already mounts the engine and has the chrome §3 assigns to `landing-dialog`). This
> would also fold the existing Step D content into Step C. **Holding for owner sign-off
> before editing the step ordering itself.**

- Lowest risk: dashboard map is the richest UI but has the most tested surface area.
- Pass C.1: introduce `<MapProgramShell>` with `host="dashboard-fullscreen"` and feed existing `<MapLibreServiceCoverageMap>` into it via `<MapEngineCanvas>` extraction. No behavior change.
- Pass C.2: relocate dashboard-side legend + ROUTE box into shell slots (`legend`, `leftPanel`). This is the structural fix for KI-164 and KI-166 once the shell positioning is authoritative.

#### Step C.1 sub-pass progress (2026-05-09)

- ✅ **Sub-pass 1** (Pass 185, commit `1b38ecdf`): extracted `useMapEngineGeoJSON` hook from `MapLibreServiceCoverageMap`. The 8 memo'd builders now live in `src/app/components/maps/useMapEngineGeoJSON.ts` (102 lines). Host shrunk 368 → 347 lines.
- ✅ **Sub-pass 1 contract lock** (Pass 186, commit `3d59c5c0`): `useMapEngineGeoJSON.test.tsx` shipped — 3 tests pin the 8-key shape, the route lat/lng→lng/lat coordinate swap, and the search-target double-feature output. Vitest 580/580 passing. Any regression during sub-pass 2 will fail at the hook boundary, not look like a downstream rendering bug.
- ✅ **Sub-pass 2 pre-flight** (Pass 188, 2026-05-09): grep verified **zero `useRef<MapRef>` / `mapRef.current` / `MapRef` consumers anywhere in `src/`** (`grep -rn "useRef<MapRef\\|MapRef\\b\\|mapRef\\.current" src/` returns nothing outside test files). The host does NOT hand a ref outward — `<MapEngineCanvas>` does **not** need `forwardRef` from day one. This avoids a churn cycle if the extraction had assumed otherwise.
- ✅ **Sub-pass 2** (Pass 189, 2026-05-09): extracted `<MapEngineCanvas>` to `src/app/components/maps/engine/MapEngineCanvas.tsx` (238 lines, under the 300-line soft target — first file in the `engine/` sub-folder per §7.1 architectural note). Lifted: the canvas wrapper div, `<Map>` instance, `AttributionControl`, `NavigationControl`, `MapLibreViewportController`, `MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect`, and `<MapLibreCoverageMapLayers>`. The two side-effect imports that gate `<Map>` initialization (`maplibreResizePatch` and `maplibre-gl/dist/maplibre-gl.css`) moved with the engine — they belong to the canvas, not the chrome host. Plain default-export function component, no `forwardRef`. Host shrunk 347 → 298 lines (-49). `useMapEngineGeoJSON` outputs feed straight in as props. Chrome (`MapSurfaceHeaderBadges`, `MapSurfaceControls`, `MapNavigationHud`, `MapSurfaceStatusBar`, ambient + gold-flow overlays) stays in the host wrapper unchanged. Verified: typecheck PASS, vitest 580/580 PASS, build clean. Pass 186 contract test (`useMapEngineGeoJSON.test.tsx`) still green — the hook boundary survived the extraction without modification.
- ✅ **Sub-pass 2 contract lock** (Pass 193, 2026-05-09): `MapEngineCanvas.test.tsx` shipped — 3 tests pin the engine boundary the same way Pass 186 pinned the hook boundary. Coverage: (1) wrapper div + `<Map>` + the four lifted children (Attribution, NavigationControl, the three controllers, the layers component) all mount; wrapper className composition (`coverage-map-canvas` + `mapCanvasClassName` + `mapHeightClassName`) intact. (2) `immersiveFullscreen` flag forwards to `NavigationControl.showCompass`. (3) Engine-shape passthrough — `revision`, `followCurrentPosition`, `guidanceMode`, `hasArrived`, `tone`, `isNavigationPresentation`, `showReportLayer` all reach the right child. MapLibre's WebGL deps are stubbed (`react-map-gl/maplibre`, the MapLibre CSS side-effect import, `maplibreResizePatch`, the controllers module, `MapLibreCoverageMapLayers`) so jsdom can run the suite. Vitest 583/583 (was 580; +3 new). Any future regression during sub-pass 3 (whichever host gets re-targeted) will fail at the engine boundary rather than appearing as a downstream rendering bug.
- ⏸ **Sub-pass 3 (gated)**: originally planned as introducing `<MapProgramShell host="dashboard-fullscreen">` wrapping `<MapEngineCanvas>` with chrome slots from §2. **Gated by Pass 191 finding** ([evidence/pass-191-2026-05-09/DASHBOARD_FULLSCREEN_HOST_INVESTIGATION.md](evidence/pass-191-2026-05-09/DASHBOARD_FULLSCREEN_HOST_INVESTIGATION.md)) that `dashboard-fullscreen` has no real consumer. Awaiting owner re-target decision (option a — `landing-dialog` first; option b — promote `MapLibreDashboardMapPreview` to the shared engine first). Until then sub-pass 3 does **not** start. The Pass 193 engine contract lock is now in place to protect whichever option owner picks.

### Step D — Migrate `landing-dialog` second (1 pass)

- Replace `CoverageBrowseExperience`'s ad-hoc shell composition with `<MapProgramShell host="landing-dialog">` + slots.
- The Pass 10 KI-172 banner becomes a `statusPill` slot value rather than an inline overlay — moves with no visual change.
- `CoverageBrowseMapOverlays` becomes the `rightPanel` slot.

### Step E — Migrate `operating-regions-inline` + `dashboard-mini` (1 pass)

- Both are degenerate cases. `OperatingRegionsSection`'s lazy-mount IntersectionObserver stays in the host — the shell does not own mount lifecycle.
- `dashboard-mini` is the surface KI-169 lives on; the route-summary mini-pill becomes a `statusPill` slot.

### Step F — Migrate `shop-directory-immersive` last (3 passes)

- Highest behavioral coupling: separate viewport, route options, drawer snap, origin picker.
- Pass F.1: prove `ImmersiveMapViewport` can be replaced by `<MapEngineCanvas>` without losing route-option layer rendering or selected-route state.
- Pass F.2: lift `ImmersiveMapTopBar` content into the shared top-bar (already shared after Step A).
- Pass F.3: relocate drawer-snap behavior to shell `bottomSheet` slot conformance.

### Step G — Retire ad-hoc shells (1 pass + tracker entry)

- Remove the conditional chrome flags on `MapLibreServiceCoverageMap` (`showSurfaceChrome`, `immersiveFullscreen`, etc.) once all hosts route through `<MapProgramShell>`.
- Update `REF_KNOWN_ISSUES.md` — mark KI-170 / KI-171 RESOLVED. Mark KI-164 / KI-166 RESOLVED if the slot relocation closed the layout overlap (verify via Playwright per `REF_AI_BROWSER_NAVIGATION.md`).

**Total:** 9 passes. None greenlit by this plan doc — each one starts after the master builder reviews against `LAW_LAYERED_ARCHITECTURE.md`.

---

## §5. Feature-transfer matrix (12-row backport list)

> **Reading guide:** "shell-level" = the receiving host gets it for free
> after `<MapProgramShell>` lift. "host-level" = the host has to mount
> the slot explicitly. Source / destination indicate the dominant
> direction during landing-dialog ↔ dashboard-fullscreen reconciliation.

| #   | Feature                                         | Source surface           | Destination(s)                                       | Tier        | Notes                                                                                                    |
| --- | ----------------------------------------------- | ------------------------ | ---------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Tile-mode toggle (Map / Night / Satellite)      | dashboard-fullscreen     | landing-dialog, shop-directory-immersive             | shell-level | Lift in Step A.                                                                                          |
| 2   | Search-this-area button                         | dashboard-fullscreen     | landing-dialog, shop-directory-immersive             | shell-level | Behavior already factored in `searchWithinViewport` props.                                               |
| 3   | Locate-me utility                               | shop-directory-immersive | landing-dialog, dashboard-fullscreen                 | shell-level | Lift in Step B.                                                                                          |
| 4   | Pin-pan upper-third offset (Pass 171)           | shop-directory-immersive | all                                                  | shell-level | Engine behavior — no new code, just centralized.                                                         |
| 5   | Immersive-fullscreen compass (Pass 172)         | shop-directory-immersive | dashboard-fullscreen, landing-dialog (when expanded) | shell-level | Hide on `dashboard-mini`.                                                                                |
| 6   | Smooth flyTo on bounds-fit (Pass 166)           | dashboard-fullscreen     | all                                                  | shell-level | Already engine-level; verify preserved during Step C.1 extraction.                                       |
| 7   | Demo-fallback disclaimer banner                 | dashboard-fullscreen     | landing-dialog                                       | host-level  | **Shipped Pass 10 KI-172** as inline overlay; relocates to `statusPill` slot in Step D.                  |
| 8   | Persona switcher (driver / shop / insurer view) | dashboard-fullscreen     | landing-dialog (Shops tab)                           | host-level  | Stays in `leftPanel` of each host — different sidebars.                                                  |
| 9   | Selected-shop detail card                       | dashboard-fullscreen     | shop-directory-immersive (already has its own)       | host-level  | Two separate panels with different data shapes — keep as host-level.                                     |
| 10  | ROUTE box                                       | dashboard-fullscreen     | landing-dialog (in active-nav mode)                  | host-level  | KI-164 layout fix lands during Step C.2 relocation, not now.                                             |
| 11  | Live navigation HUD (`MapNavigationHud`)        | dashboard-fullscreen     | landing-dialog (`CoverageActiveNavigationLayout`)    | shell-level | Already engine-adjacent — promote to shell `rightPanel` default for `presentationMode === "navigation"`. |
| 12  | Turn list empty state (Pass 167)                | shop-directory-immersive | dashboard-fullscreen                                 | host-level  | Lives inside the navigation HUD; preserve when promoting #11.                                            |

---

## §6. Anti-regression list

The lifted shell **must preserve** every guard below. Any extraction pass
that loses one of these is a regression and reverts.

1. **Pass 166 — smooth flyTo on bounds-fit.** Engine-level easing must
   survive the `<MapEngineCanvas>` extraction. Verify by recording flyTo
   duration on a known county-bounds change before and after.
2. **Pass 171 — upper-third pin-pan offset.** Pin-click pan must place
   the selected pin at the upper-third of the viewport, not the center.
3. **Pass 172 — immersive-fullscreen compass.** Compass renders in
   immersive mode only; click-to-reset-north preserved.
4. **Pass 167 — turn list empty state.** When no upcoming turns, the
   navigation HUD shows the empty-state graphic, not blank space.
5. **Every `motion-reduce:animate-none` guard** on every shell- or
   slot-rendered animated element. Required by
   [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md)
   `prefers-reduced-motion` contract.
6. **`bd-*` utility classes** on form fields, cards, buttons, notice
   strips. The shell must use them (e.g. `bd-glass-card--map`,
   `bd-notice--warn`). Hand-rolled Tailwind on shell internals is a
   LAW violation.
7. **[`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) § Light-Mode Surface Rule
   premium gold lamp identity.** No flat-white surfaces. No yellow-amber gold.
   Warm-cream insets only at the documented values
   (`rgba(252, 238-240, 204-208)`); halos at `rgba(196, 144, 65)` /
   `rgba(196, 130, 45)`; trim at `rgba(140, 82, 22)`. Forbidden values
   (`rgba(220, 165, 90)`, `rgba(254, 248, 220)`, `rgba(160, 95, 25)`)
   must not return.
8. **8-criteria depth bar for dark surfaces** per
   [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md).
   Shell dark mode must inherit, not redefine, the depth bar.
9. **Pass 49 / KI-053 lazy-mount on `OperatingRegionsSection`.** Do not
   regress to eager mount during the inline-host migration in Step E.
   The IntersectionObserver guard stays host-side.
10. **Pass 884 — navigation-session cloud-drift fallback.** When
    `public.navigation_sessions` is absent, the local-only fallback must
    survive any shell refactor. Shell should not re-introduce
    fire-and-forget edge calls.
11. **`verify_jwt: false` pin** on `[functions.server]` per
    [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §17. The shell
    refactor is client-side only; if any server change creeps in, the
    pin must be reasserted.
12. **Pointer-on-write / sign-on-read for media URLs** per
    [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §16. Shell
    refactor must not start persisting signed URLs.

---

## Open questions for the master builder

1. **Step C ordering.** Is dashboard-fullscreen-first the right
   risk-minimization choice, or should Step D (landing-dialog) lead
   because its surface area is smaller and the bug burden (KI-170,
   KI-171, KI-172) is more concentrated there?
2. **`ImmersiveMapViewport` convergence.** Step F.1 assumes the
   directory's separate viewport implementation can converge on
   `<MapEngineCanvas>`. If they cannot — e.g. directory needs a
   route-option layer the coverage engine doesn't ship — the shell
   either grows a route-option slot or directory stays out of the
   unification. Decide before F starts.
3. **Legend default.** KI-166 fix direction listed two options:
   (a) collapsed-by-default with `▼ legend` toggle, or
   (b) demote to hover-tooltip on pin glyphs. Option (a) is more
   discoverable; (b) is closer to Apple/Google Maps. Owner call.
4. **Persona switcher on landing.** Currently dashboard-only. Promoting
   it to landing-dialog would unify the surfaces but exposes an
   authenticated-feature affordance to public users. Defer until owner
   confirms public scope.

---

## Cross-references

- This plan is referenced from
  [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) under KI-170 fix
  direction.
- Strategic vision lives in
  [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — feature-pause
  guardrails apply; this plan is hardening-safe (UX cohesion +
  trust) per the 2026-04-17 hardening-safe map chrome polish note.
- Implementation passes are tracked in the active commit log under
  the `(audit AI Pass N)` / `feat(map)` / `refactor(map)` prefixes.

---

## §7. Master-builder review (Pass 180, 2026-05-08)

**Reviewer:** Master Builder AI (Opus 4.7).
**Verdict:** **APPROVED with three notes.** Step A authorized for the next builder pass.

### 7.1 LAW alignment check

Verified against [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) §"The Four Layers" + §"Folder-to-Layer Mapping":

- `src/app/components/maps/shell/MapProgramTopBar.tsx` (Step A) — **L2** (composed UI in `components/maps/`). Compliant.
- `src/app/components/maps/shell/MapProgramUtilityCluster.tsx` (Step B) — **L2**. Compliant.
- `<MapProgramShell>` host wrapper — **L2**. Compliant.
- `<MapEngineCanvas>` (Step C.1 extraction) — LAW labels MapLibre adapter as L4 conceptually. Since the canvas must render JSX it can't literally be L4 (services don't render). **Architectural note:** place the extraction at `src/app/components/maps/engine/MapEngineCanvas.tsx` — the `engine/` sub-folder makes the L4-in-spirit boundary explicit and lets reviewers immediately see "this is the headless adapter, not chrome." Don't park it in `services/` since it's component code.

No forbidden cross-layer flows are introduced by the proposed splits. Each new file composes downward (L2 → L3 hooks → L4 services); none reach across.

### 7.2 File-size budget check

LAW L2 limits: soft 400, hard 600. Two files in the migration path are at risk:

- `OperatingRegionsSection.tsx` — currently 599 lines (already grandfathered per LAW §"Grandfathered file inventory"). Step E **must not push it over 600.** If the host migration adds more than 1 line net, split a child component out instead.
- `CoverageBrowseExperience.tsx` — currently 490 lines (post-Pass-10). Headroom = 110 lines. Step D's slot relocations should be net-neutral or net-negative since the `statusPill` slot replaces an inline overlay; verify before commit.

New files (`MapProgramTopBar`, `MapProgramUtilityCluster`, `MapProgramShell`, `MapEngineCanvas`) start fresh against the soft 400 budget. None should exceed 400 at first ship — split into helpers earlier if approaching.

### 7.3 Open-questions resolutions

1. **Step C ordering — dashboard-fullscreen first.** **APPROVED.** Richest tested surface, deepest test coverage on `MapLibreServiceCoverageMap`, lowest unknown risk. Landing-dialog second (Step D) is correct.
2. **`ImmersiveMapViewport` convergence — defer to F.1 spike.** **APPROVED.** If F.1 finds the directory needs a route-option layer the coverage engine doesn't ship, the right move is to **promote route-option rendering to the shared `<MapEngineCanvas>`** rather than fork the engine — that keeps the engine single-source. Document the decision in F.1's commit message either way.
3. **Legend default — option (a) collapsed-with-toggle.** **APPROVED.** BidOnDent's status semantics (PENDING / APPROVED / IN-REPAIR / RESOLVED / DONE) carry meaning that a hover-tooltip can't surface for keyboard users or first-time visitors. Apple/Google Maps don't have status legends because their pin types don't carry workflow state — different problem space. Toggle defaults to **collapsed**; expanded state persists in `localStorage` per-user.
4. **Persona switcher on landing — HOLD for owner.** **CONFIRMED.** Cross-checks against LAW_PROJECT_RULES § Public Scope: exposing an authenticated-feature affordance to public users could leak product-shape information we haven't decided to publish. Defer until owner explicitly opts in.

### 7.4 Anti-regression list — additions

Plan §6's 12-item list is comprehensive. **Adding two items** for Step-A-specific risk:

13. **Pass 175 — `liveRemainingEtaLabel` "N min" suffix** ([`shopDirectoryNavigationDerived.ts:173`](../src/app/hooks/shopDirectoryNavigationDerived.ts#L173)). The shell migration must not regress to the old `"Nm"` suffix. Verify any ETA rendering that lifts from host into shell preserves the corrected formatter.
14. **Pass 176 — single-source maneuver text** ([`CoverageActiveNavigationLayout.tsx:325`](../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L325) `nextInstruction={null}`). When `<MapNavigationHud>` lifts to shell `rightPanel` (feature-transfer matrix #11), the shell must continue to gate the maneuver block on prop falsity so the duplicate doesn't return.

### 7.5 Step A authorization — **PARTIAL SHIP 2026-05-08 (Pass 23 cowork-A)**

**Status:** Engine B coverage shipped, Engine A coverage deferred pending master-builder re-scope.

**Originally authorized scope:**

- New file: `src/app/components/maps/shell/MapProgramTopBar.tsx` (~150-250 lines target).
- Lift the union of: logo / back / search input / search-this-area / tile-mode toggle / split-view / map-toggle.
- Replace top-bar fragments in `CoverageBrowseExperience`, dashboard Smart Shop Map host (still to be pinpointed — KI-164 investigation), and `ImmersiveMapTopBar` consumers with the lifted component.
- Pure presentational lift — no behavior change, no new callbacks. Same handlers in, same handlers out.
- Verify: typecheck clean, vitest unaffected, smoke-test in dev for visual parity at 1440×900 + 390×844 viewports.

**What actually shipped (Pass 23 cowork-A):**

- ✅ `src/app/components/maps/shell/MapProgramTopBar.tsx` created (canonical L2 home).
- ✅ `ImmersiveMapTopBar.tsx` refactored to re-export shim. Engine B consumers unchanged.
- ✅ Typecheck PASS exit 0.

**What did NOT ship (deferred to master-builder review):**

- ⚠ `CoverageBrowseExperience` migration — `MapSurfaceControls` UX shape is inline-embedded, not immersive-fullscreen. Lifting both under one component exceeds "pure presentational lift" scope.
- ⚠ Dashboard Smart Shop Map host migration — host never pinpointed (KI-164 unresolved at time of Pass 23).

**Pending master-builder decision (gate #6):** Engine A consumer strategy:

- (a) Two co-existing top-bar components, one per UX shape (MapSurfaceControls inline + MapProgramTopBar immersive).
- (b) MapProgramTopBar grows a `variant: "inline" | "immersive"` prop and absorbs MapSurfaceControls.
- (c) Defer indefinitely; current 2-component split is acceptable.

Do **not** start Step B in the same pass. Containment-over-expansion: one extraction concern per pass. **Pass 24 cowork-A confirmed Step B is not feasible as originally scoped — see §4 Step B above for re-scope recommendation.**

### 7.6 Items NOT authorized in this pass

- Step C through Step G — gated on Step A landing first.
- KI-166 legend default-collapsed structural change — gated on Step C.2 (legend slot relocation).
- KI-164 ROUTE box repositioning — gated on Step C.2.
- `<MapEngineCanvas>` extraction — gated on Step C.1.
- Persona switcher promotion to landing — owner-gated indefinitely.

---

**End of plan.**
