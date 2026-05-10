---
status: CANONICAL
authority: REFERENCE
scope: map-renderer-inventory
canonical_source_of_truth: REF_MAP_RENDERER_INVENTORY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Inventory of every MapLibre engine mount, its lifecycle contract, and known orchestration boundaries.
last_updated: 2026-05-09
---

# Map Renderer Inventory + Lifecycle Audit (2026-05-09)

> Block C / Pass 223 deliverable. Read-only audit. No runtime changes.
>
> Companion to:
>
> - [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — convergence roadmap
> - [`REF_CONVERGENCE_TOPOLOGY_2026-05-09.md`](REF_CONVERGENCE_TOPOLOGY_2026-05-09.md) — Pass 213 audit
> - [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) § 6 Map Stack
>
> This doc is the canonical home for "where MapLibre instantiates and what
> contract each instance honors". Add new engine mounts here in the same
> pass they ship.

---

## §1. Engine inventory

Three independent MapLibre `<Map>` instantiations exist in `src/`. Each holds
its own GL context, source/layer registry, and viewport state.

| #   | Engine                                                       | File                                                                                                                              | Lines | Mount-site count                    | First shipped         |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------- | --------------------- |
| 1   | **`MapEngineCanvas`** (canonical headless adapter)           | [`src/app/components/maps/engine/MapEngineCanvas.tsx`](../src/app/components/maps/engine/MapEngineCanvas.tsx)                     | 238   | 1 (`MapLibreServiceCoverageMap`)    | Pass 192 (2026-05-08) |
| 2   | **`MapLibreShopDirectoryMapPane`** (shop directory engine)   | [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx)         | 552   | 1 self-mount (the file IS the host) | pre-Pass 100          |
| 3   | **`MapLibreDashboardMapPreview`** (dashboard preview engine) | [`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) | 273   | 6 callers (see §3)                  | pre-Pass 100          |

**Engine count: 3 independent MapLibre engines.** Confirms the count
declared in `PLAN_MAP_UNIFICATION_2026-05-08.md` § 10.

---

## §2. Per-engine lifecycle contracts

### 2.1 Engine 1 — `MapEngineCanvas`

**Role tier (proposed in Pass 227):** Tier A — canonical interactive runtime.

**Mount form:**

```tsx
<Map id="coverage-map" initialViewState={...} mapStyle={mapStyle} ... />
```

**Lifecycle contract:**

| Concern                   | Implementation                                                                                                                   | Notes                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pre-mount safety          | `import "../../../utils/maplibreResizePatch"` at top of file                                                                     | MUST run before any Map instantiation; documented in file header                                                                 |
| Mount key                 | `id="coverage-map"` (static)                                                                                                     | Single-instance enforced by static id                                                                                            |
| Initial viewport          | `initialViewState={{longitude, latitude, zoom}}` (uncontrolled)                                                                  | Subsequent viewport changes flow through `MapLibreViewportController` (declarative ref-based)                                    |
| Style                     | `mapStyle={mapStyle}` (StyleSpecification, full reload on swap)                                                                  | Owner: `MapLibreServiceCoverageMap`                                                                                              |
| Bounds                    | `maxBounds` set when NOT immersive; `minZoom` 8/2 conditional                                                                    | Cooperative gesture mode on embedded preview                                                                                     |
| Performance handlers      | `onZoomStart/End/onMoveStart/End/onZoom`                                                                                         | Sourced from `useMapPerformanceTracking` on host                                                                                 |
| Imperative handle         | None. No `forwardRef`, no `useImperativeHandle`                                                                                  | File header explicitly notes: "Pass 188 pre-flight grep confirmed zero `MapRef` / `mapRef.current` consumers anywhere in `src/`" |
| Camera mutation           | Three controllers child-mounted: `MapLibreViewportController`, `MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect` | All declarative; no host-side `map.flyTo()` calls                                                                                |
| Source/layer registration | Single `<MapLibreCoverageMapLayers>` block                                                                                       | Owns counties, partner shops, discovery places, GPS, route, search target                                                        |
| Cleanup                   | React-managed via component unmount                                                                                              | Resize patch handles known crash; otherwise relies on `react-map-gl/maplibre`                                                    |
| Error boundary            | None at engine level                                                                                                             | Host (`MapLibreServiceCoverageMap`) does not wrap                                                                                |

**Strengths:**

- Cleanest contract of the three. Headless adapter pattern.
- All camera mutation is declarative + revision-keyed.
- No imperative handle = no leak surface for stale `mapRef` refs.
- File-header doc explains intent, references plan + LAW.

**Risks:**

- No `onLoad` / `onError` hook surfaced; if style loading fails, host has no recourse.
- No error boundary; a layer-render exception unmounts the entire surface.
- `id="coverage-map"` static; cannot mount two instances side-by-side without collision (acceptable today).

---

### 2.2 Engine 2 — `MapLibreShopDirectoryMapPane`

**Role tier (proposed in Pass 227):** Tier A — canonical interactive runtime (parallel to Engine 1, owned by the shop directory surface).

**Mount form:**

```tsx
<Map
  key={mapRenderNonce}
  id="shop-directory-map"
  initialViewState={{...}}
  mapStyle={mapStyle}
  onLoad={handleMapLoad}
  onError={handleMapLoadError}
  ...
/>
```

**Lifecycle contract:**

| Concern                   | Implementation                                                                                                                                                      | Notes                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Pre-mount safety          | `import "../../utils/maplibreResizePatch"`                                                                                                                          | Same pattern as Engine 1                                           |
| Mount key                 | `id="shop-directory-map"` + `key={mapRenderNonce}`                                                                                                                  | The `mapRenderNonce` allows host-controlled hard remount           |
| Container gating          | `{containerReady && (<NavigationErrorBoundary>...)}`                                                                                                                | Mount deferred until container has measurable dimensions           |
| Error boundary            | `<NavigationErrorBoundary>` wraps the `<Map>`                                                                                                                       | Better than Engine 1                                               |
| Initial viewport          | `initialViewState` uncontrolled                                                                                                                                     | Viewport delegated to `MapLibreShopDirectoryViewportManager` child |
| Style                     | `mapStyle={mapStyle}`                                                                                                                                               | Tile-mode aware (satellite vs roadmap)                             |
| Pitch / zoom envelope     | `minZoom`, `maxZoom`, `maxPitch` all gated on `navigationMode === "guidance"` and `tileMode`                                                                        | Multi-axis conditional behavior — more complex than Engine 1       |
| Performance handlers      | `onClick`, `onMouseMove`, `onMouseLeave`                                                                                                                            | No move/zoom perf tracking                                         |
| `onLoad` / `onError`      | Both present (`handleMapLoad` / `handleMapLoadError`)                                                                                                               | Distinct from Engine 1                                             |
| Imperative handle         | None directly; viewport manager uses `useMap()` internally                                                                                                          | Indirect imperative path through `react-map-gl`'s context          |
| Camera mutation           | `<MapLibreShopDirectoryViewportManager>` child uses `useMap()` + `map.flyTo` / `fitBounds`                                                                          | Imperative mutation lives inside child component                   |
| Source/layer registration | Multiple `<Source>/<Layer>` blocks inline (service areas, shop pins) + `<ShopDirectoryMapLayers>` + `<ShopDirectoryNavStepLayers>` + `<ShopDirectoryShopPinLayers>` | Layer authority distributed across 4 child components              |
| Cleanup                   | React unmount + `mapRenderNonce` allows hard reset                                                                                                                  | More aggressive than Engine 1                                      |
| Standard controls         | `GeolocateControl`, `NavigationControl`, `ScaleControl`                                                                                                             | Engine 1 only has Navigation + Attribution                         |

**Strengths:**

- Has `onLoad` / `onError` hooks (covers gap in Engine 1).
- Wrapped in `NavigationErrorBoundary` (covers gap in Engine 1).
- Container-gated mount (defers Map instantiation until measurable size).
- Hard-remount escape hatch via `mapRenderNonce`.

**Risks:**

- 552 lines — the largest map file in the repo. Mixes engine mount, layer
  registration, viewport management, popup state, error handling, and
  geolocation.
- Distributed layer authority (4 child layer files + inline `<Source>`s)
  makes it hard to reason about source/layer cleanup order on style swap.
- Pitch / zoom envelope changes mid-flight when `navigationMode` toggles —
  if MapLibre internal state lags React state, brief camera glitches are
  possible.
- Imperative camera mutation inside `<MapLibreShopDirectoryViewportManager>`
  competes with controlled viewport in callers; potential authority
  conflicts (see § 4 below).

---

### 2.3 Engine 3 — `MapLibreDashboardMapPreview`

**Role tier (proposed in Pass 227):** Tier B — operational preview runtime (lightweight, gesture-suppressed, click-to-tooltip).

**Mount form:**

```tsx
<Map
  id={`dashboard-preview-${mapId}`}
  {...viewState}
  onMove={(e) => setViewState(e.viewState)}
  mapStyle={mapStyle}
  scrollZoom={false}
  dragPan={false}
  dragRotate={false}
  doubleClickZoom={false}
  touchZoomRotate={false}
  keyboard={false}
  ...
/>
```

**Lifecycle contract:**

| Concern                   | Implementation                                                                                        | Notes                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Pre-mount safety          | `import "../../utils/maplibreResizePatch"`                                                            | Same                                                                                                                                 |
| Mount key                 | `id={`dashboard-preview-${mapId}`}` (per-instance via `useId()`)                                      | Allows multiple simultaneous mounts                                                                                                  |
| Initial viewport          | **Controlled** — `{...viewState}` + `onMove` setter                                                   | Different from Engines 1 & 2 (uncontrolled)                                                                                          |
| Auto-fit                  | Computed in `fittedView` `useMemo` from shop coords (≥2 shops)                                        | Bbox + log2 zoom heuristic; not MapLibre `fitBounds`                                                                                 |
| Style                     | `mapStyle={mapStyle}` (`isLight` ? roadmap : night)                                                   | Style swap triggers full reload                                                                                                      |
| Interactivity             | All disabled: `scrollZoom`, `dragPan`, `dragRotate`, `doubleClickZoom`, `touchZoomRotate`, `keyboard` | Click-to-tooltip is the only allowed interaction                                                                                     |
| Performance handlers      | `onClick` only                                                                                        | No move/zoom tracking                                                                                                                |
| `onLoad` / `onError`      | Neither                                                                                               | Failure mode is silent                                                                                                               |
| Imperative handle         | None                                                                                                  | Pure declarative                                                                                                                     |
| Camera mutation           | `useEffect` resets `viewState` when `center`/`zoom`/`fittedView` props change                         | Authority conflict risk: if parent controls `center` AND user pans, parent overrides on next render (mitigated by `dragPan={false}`) |
| Source/layer registration | Inline only — no child layer components                                                               | 3 sources: `dashboard-service-areas`, `dashboard-shops`, `dashboard-reports`                                                         |
| Cleanup                   | React unmount                                                                                         | No special handling                                                                                                                  |
| Vignette overlay          | Sibling `<div>` after `<Map>`                                                                         | Pure visual; no map state involvement                                                                                                |

**Strengths:**

- Smallest, most self-contained.
- Gesture suppression makes the preview behave consistently across hosts.
- Per-instance `id` allows multiple mounts (e.g. side-by-side).

**Risks:**

- **Used by 6 callers (§ 3) with subtly different needs.** This is the
  primary convergence target identified in `PLAN_MAP_UNIFICATION` § 1.6.
- Silent failure mode (no `onLoad` / `onError`).
- Auto-fit heuristic is hand-rolled (log2 + clamp), not MapLibre `fitBounds`.
  Diverges from Engine 1 / Engine 2 viewport behavior.
- Controlled viewport pattern is the inverse of the other two engines —
  hosts that interleave preview + canonical engines must context-switch
  mental models.

---

## §3. Mount-site / caller inventory

### 3.1 `MapEngineCanvas` callers

| Caller                       | File                                                                                                                  | Mount role                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `MapLibreServiceCoverageMap` | [`src/app/components/maps/MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx) | Sole host. Owns chrome composition, perf tracking, controller orchestration. |

### 3.2 `MapLibreShopDirectoryMapPane` callers

The pane is its own host (the file IS the mount site). Surrounding shop
surfaces compose around it:

| Surrounding surface             | File                                                                                                                        | Composition role                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `ShopDirectoryHybridMapSection` | [`src/app/components/shop/ShopDirectoryHybridMapSection.tsx`](../src/app/components/shop/ShopDirectoryHybridMapSection.tsx) | Top-level shop-directory layout host |
| `ImmersiveMapViewport`          | [`src/app/components/shop/ImmersiveMapViewport.tsx`](../src/app/components/shop/ImmersiveMapViewport.tsx)                   | Fullscreen presentation wrapper      |
| `ShopDirectoryMapPopup`         | [`src/app/components/shop/ShopDirectoryMapPopup.tsx`](../src/app/components/shop/ShopDirectoryMapPopup.tsx)                 | Popup card composed inside the pane  |

### 3.3 `MapLibreDashboardMapPreview` callers (the duplication target)

| Caller                     | File                                                                                                                    | Use case                            | Tier classification (proposed) |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------ |
| `CustomerMapWidget`        | [`src/app/components/dashboard/CustomerMapWidget.tsx`](../src/app/components/dashboard/CustomerMapWidget.tsx)           | Dashboard widget — customer view    | Tier B                         |
| `ShopMapWidget`            | [`src/app/components/dashboard/ShopMapWidget.tsx`](../src/app/components/dashboard/ShopMapWidget.tsx)                   | Dashboard widget — shop view        | Tier B                         |
| `InsurerMapWidget`         | [`src/app/components/dashboard/InsurerMapWidget.tsx`](../src/app/components/dashboard/InsurerMapWidget.tsx)             | Dashboard widget — insurer view     | Tier B                         |
| `ReportsListScreen`        | [`src/app/components/reports/ReportsListScreen.tsx`](../src/app/components/reports/ReportsListScreen.tsx)               | Inline preview for the reports list | Tier B                         |
| `ReportDetailScreen`       | [`src/app/components/reports/ReportDetailScreen.tsx`](../src/app/components/reports/ReportDetailScreen.tsx)             | Per-report context preview          | Tier B                         |
| `CompetitorAnalysisScreen` | [`src/app/components/reports/CompetitorAnalysisScreen.tsx`](../src/app/components/reports/CompetitorAnalysisScreen.tsx) | Bid competitor geographic context   | Tier B                         |

> **Update vs Pass 217:** That pass listed 4 callers. Pass 223 grep shows
> **6 callers**. Both `CustomerMapWidget` and `ShopMapWidget` are also
> consumers (in addition to the originally documented `InsurerMapWidget`).
> `PLAN_MAP_UNIFICATION_2026-05-08.md` § 1.6 should be updated by Pass 225
> (duplication analysis) to reflect this corrected count.

---

## §4. Cross-engine concerns

### 4.1 `id` collision risk

| Engine | Map id                         | Collision risk                                                  |
| ------ | ------------------------------ | --------------------------------------------------------------- |
| 1      | `coverage-map` (static)        | Two simultaneous mounts would collide — not currently triggered |
| 2      | `shop-directory-map` (static)  | Same risk                                                       |
| 3      | `dashboard-preview-${useId()}` | Per-instance — safe                                             |

If convergence collapses Engines 1 and 2 into a shared canonical engine,
the static-id pattern needs a per-host id strategy.

### 4.2 Shared utilities

| Utility                     | Used by       | Notes                                                                         |
| --------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `maplibreResizePatch`       | All 3 engines | Critical pre-mount safety. MUST be imported before any `<Map>` instantiation. |
| `maplibreStyles`            | Engines 1 + 3 | Shared style registry                                                         |
| `geoCircle.circleToPolygon` | Engines 2 + 3 | Service-area geometry                                                         |

### 4.3 Camera authority models (3 incompatible patterns)

| Engine | Camera pattern                                            | Mutation entry point                                                                            |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1      | Uncontrolled + revision-keyed declarative controllers     | `MapLibreViewportController`, `MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect` |
| 2      | Uncontrolled + imperative `useMap()` inside child manager | `MapLibreShopDirectoryViewportManager`                                                          |
| 3      | Controlled (`{...viewState}` + `onMove`)                  | Direct setter; parent prop overrides via `useEffect`                                            |

**Convergence implication:** Pass 226 (lifecycle contract draft) must pick
ONE camera authority model as canonical. The current three-way split is
the strongest source of mental-model fragmentation across engines.

### 4.4 Error / failure surfaces

| Engine | `onLoad` | `onError` | Error boundary                | Container gating |
| ------ | -------- | --------- | ----------------------------- | ---------------- |
| 1      | ✗        | ✗         | ✗                             | ✗                |
| 2      | ✓        | ✓         | ✓ (`NavigationErrorBoundary`) | ✓                |
| 3      | ✗        | ✗         | ✗                             | ✗                |

Engine 2 has the strongest failure surface. Convergence target should
adopt Engine 2's error contract.

### 4.5 Layer authority distribution

| Engine | Layer authority                                                   |
| ------ | ----------------------------------------------------------------- |
| 1      | Single child component (`MapLibreCoverageMapLayers`) — clean      |
| 2      | Distributed across 4+ child components + inline `<Source>` blocks |
| 3      | Inline only (3 `<Source>` blocks) — clean for the size            |

Engine 2's distribution is the source-of-truth concern: if a layer is
registered by one child but cleaned up by another, style-swap timing
errors become possible.

---

## §5. Findings summary

1. **3 engines confirmed.** Counts match `PLAN_MAP_UNIFICATION` § 10 + § 1.7.
2. **Dashboard preview caller count corrected:** 6, not 4. Update needed in `PLAN_MAP_UNIFICATION` § 1.6.
3. **Three incompatible camera authority models** are the strongest blocker to convergence — bigger than the engine count itself.
4. **Engine 1 has the cleanest contract;** Engine 2 has the strongest failure surface; Engine 3 is the simplest. The canonical convergence target should inherit Engine 1's headless adapter shape, Engine 2's error contract, and Engine 3's per-instance id pattern.
5. **`maplibreResizePatch` import is a non-negotiable pre-mount invariant** — Pass 226 lifecycle contract must lock this as a contract obligation.
6. **No imperative `MapRef` consumers exist anywhere** (verified Pass 188; still true). The convergence target SHOULD NOT introduce one.

---

## §6. Hand-off to Pass 224

Pass 224 will trace navigation orchestration authority — which surface
holds the active route, who writes ETA, how reroutes propagate, and
whether the three engines hear about navigation state through compatible
channels. Combined with §4.3's camera-authority finding above, Pass 224
output will inform Pass 226's lifecycle contract choice.
