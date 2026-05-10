---
status: ACTIVE
authority: PLAN
scope: persistent-map-session-planning
canonical_source_of_truth: PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Read-only topology audit for the Persistent Map Session lane. Enumerates every map surface, viewport authority, gesture source, MapLibre instance boundary, and re-init site. Pass 258 of PMS planning lane.
last_updated: 2026-05-09
---

# PMS Topology Audit — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 258 of the PMS Planning lane (owner-authorized 2026-05-09).
> **Companion docs (siblings in this lane):**
>
> - [`PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md`](PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md) — Pass 259 options matrix
> - [`PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md`](PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md) — Pass 260 sequencing plan
>   **Predecessors:**
> - [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) — locked confidence baseline
> - [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — Step C unification plan
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — inventory of engines and seams

---

## Purpose and lane scope

This document characterizes the **current** map topology as observed in the
codebase on 2026-05-09. It is the substrate the PMS architecture options matrix
(Pass 259) and execution sequencing plan (Pass 260) build on.

**This pass is doc-only.** No source files were modified. The audit is
read-only. Every entry below is verifiable from the file path + line cited.

The PMS feature itself is **NOT** authorized in this lane. Per owner directive
2026-05-09 the planning lane goal is to "produce the execution-grade blueprint
that allows the future PMS build lane to execute safely."

---

## §1 — Map host surfaces (the renderable map components)

There are **three** production MapLibre engine instance sites in the codebase.
Each is a distinct WebGL context creation point at runtime.

| #   | Engine site              | Source                                                                                                                                                 | Role                                                                                    | PMS classification                                                                                                                                                           |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Coverage host engine     | [src/app/components/maps/engine/MapEngineCanvas.tsx](../src/app/components/maps/engine/MapEngineCanvas.tsx) (`react-map-gl/maplibre` `Map` import L31) | Headless engine seam consumed exclusively by `MapLibreServiceCoverageMap`.              | **Shared-session-safe** — single host, declarative-only authority. Primary PMS instance candidate.                                                                           |
| E2  | Shop directory engine    | [src/app/components/shop/MapLibreShopDirectoryMapPane.tsx](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) (`Map` import L6)              | Shop directory immersive map. Engine 2.                                                 | **Migration-risk surface** — separate engine, separate orchestration. Out of PMS Phase 1 scope.                                                                              |
| E3  | Dashboard preview engine | [src/app/components/dashboard/MapLibreDashboardMapPreview.tsx](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) (`Map` import L4)      | Engine 3. PONC ("preview owns no camera"). All previews in dashboard + reports screens. | **Shared-session-safe** under contract — but Tier B branch semantics are LOCKED (see §11). PMS Phase 1 candidate to merge with E1 only via byte-identical viewport contract. |

Other `react-map-gl/maplibre` consumers (Source / Layer / Popup / `useMap`) are
**not** new instances — they attach to the engine in their parent's render
tree:

```
MapLibreDiscoveryPlaceLayer.tsx       (Source/Layer)
MapLibrePartnerShopLayer.tsx          (Source/Layer)
MapLibreCoverageMapLayers.tsx         (Source/Layer)
MapLibreReportLayer.tsx               (Source/Layer)
mapLibreControllers.tsx               (useMap → imperative camera)
ReportLayerPopup.tsx                  (Popup)
shop/ShopDirectoryShopPinLayers.tsx   (Source/Layer)
shop/ShopDirectoryNavStepLayers.tsx   (Source/Layer)
shop/ShopDirectoryMapPopup.tsx        (Popup)
shop/useShopMapInteraction.ts         (useMap)
shop/ShopDirectoryMapLayers.tsx       (Source/Layer)
shop/MapLibreShopDirectoryViewportManager.tsx (useMap)
shop/MapPaneInfoPopups.tsx            (Popup)
```

There are **zero** `new maplibregl.Map(` direct constructions in `src/`. All
instance creation flows through the three engine sites above.

---

## §2 — Map host call sites (which screens render which host)

### `MapLibreServiceCoverageMap` (E1) call sites

| Call site | File                                                                                                                                  | Surface                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1         | [src/app/components/landing/OperatingRegionsSection.tsx](../src/app/components/landing/OperatingRegionsSection.tsx) L10               | Landing inline coverage map (`/`)                                                                        |
| 2         | [src/app/components/landing/CoverageBrowseExperience.tsx](../src/app/components/landing/CoverageBrowseExperience.tsx) L12             | Landing fullscreen "Coverage" dialog (`CoverageMapDialog`) — **also reused by `DashboardCoveragePanel`** |
| 3         | [src/app/components/landing/CoverageActiveNavigationLayout.tsx](../src/app/components/landing/CoverageActiveNavigationLayout.tsx) L16 | Active turn-by-turn nav layout (immersive fullscreen)                                                    |

**PMS implication:** These three call sites already share a single host
component but mount it at three different React positions in three different
parent trees. Today, navigating from (1) to (2) on the landing page triggers a
**full unmount + remount** of the host (and therefore its WebGL context).

### `MapLibreDashboardMapPreview` (E3) call sites

| Call site | File                                                                                                                      | Surface                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1         | [src/app/components/dashboard/CustomerMapWidget.tsx](../src/app/components/dashboard/CustomerMapWidget.tsx) L18           | Customer dashboard `HomeScreen`                               |
| 2         | [src/app/components/dashboard/ShopMapWidget.tsx](../src/app/components/dashboard/ShopMapWidget.tsx) L9                    | Shop dashboard `HomeScreen` (**owner-dirty file — no touch**) |
| 3         | [src/app/components/dashboard/InsurerMapWidget.tsx](../src/app/components/dashboard/InsurerMapWidget.tsx) L8              | Insurer dashboard `HomeScreen`                                |
| 4         | [src/app/components/reports/ReportDetailScreen.tsx](../src/app/components/reports/ReportDetailScreen.tsx) L9              | Report detail screen                                          |
| 5         | [src/app/components/reports/ReportsListScreen.tsx](../src/app/components/reports/ReportsListScreen.tsx) L8                | Reports list screen                                           |
| 6         | [src/app/components/reports/CompetitorAnalysisScreen.tsx](../src/app/components/reports/CompetitorAnalysisScreen.tsx) L14 | Shop competitor analysis screen                               |

**PMS implication:** All six sites are reached from within `DashboardLayout`.
Navigating between any two of them re-mounts the preview component and creates
a fresh MapLibre instance.

### `ShopMapWidget` call site

| Call site | File                                                                                                            | Surface                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1         | [src/app/components/codelayer/HomeScreen.tsx](../src/app/components/codelayer/HomeScreen.tsx) L3 (used at L349) | Conditional render when `role === "shop"` on dashboard home |

**Owner-dirty.** No touch. PMS migration excludes this widget from any
unification work until owner clears the dirty state.

### `MapLibreReportMapPreview`

Does not exist in the codebase. Report preview surfaces (4–6 above) all use
`MapLibreDashboardMapPreview`. This is a clarification — there is **no**
separate report-preview component to migrate.

---

## §3 — Routing topology

The app has **no React Router** and **no `src/app/pages/` directory**. Routing
is hash-based plus boolean-state-driven:

| Layer                          | Mechanism                                                  | File                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hash routes                    | `useHashPage` hook                                         | [src/app/components/app/AppShell.tsx](../src/app/components/app/AppShell.tsx)                                                                                                |
| Top-level dispatch             | hash + auth state                                          | [src/app/App.tsx](../src/app/App.tsx) (~L200)                                                                                                                                |
| Authenticated dashboard routes | switch on `navigation.activeView` / `navigation.activeTab` | [src/app/routers/DashboardRouter.tsx](../src/app/routers/DashboardRouter.tsx), [src/app/routers/DashboardSecondaryViews.tsx](../src/app/routers/DashboardSecondaryViews.tsx) |
| Navigation state               | `useNavigation` hook                                       | [src/app/hooks/useNavigation.ts](../src/app/hooks/useNavigation.ts)                                                                                                          |
| Router prop assembly           | utility                                                    | [src/app/utils/buildDashboardRouterProps.ts](../src/app/utils/buildDashboardRouterProps.ts)                                                                                  |
| Demo dispatch                  | `readDevDemoMode()`                                        | `App.tsx` L464–468 → `DevDemoCustomerApp` / `DevDemoShopApp`                                                                                                                 |

**Top-level branches:**

1. Hash routes: `/about`, `/privacy`, `/terms`, `/insurer-partnership` (lazy-loaded). **No maps.**
2. Landing (`/` no hash, signed-out): `renderLandingPage` → `OperatingRegionsSection` (E1 mounts inline) + optional `CoverageMapDialog` (E1 mounts again immersive) + optional `CoverageActiveNavigationLayout` (E1 mounts again).
3. Dashboard (signed-in): `DashboardLayout` → `DashboardRouter` → role-conditional widget (E3 mounts) | reports screen (E3 mounts) | `DashboardCoveragePanel` → `CoverageMapDialog` (E1 mounts) | `MapLibreShopDirectoryMapPane` (E2 mounts).
4. Dev demo (state flag): `DevDemoCustomerApp` / `DevDemoShopApp` reuse the same widgets.

**PMS implication:** Because routing is state-driven (not URL-segment-driven),
implementing PMS does **not** require React Router introduction. Persistence
across "routes" reduces to keeping a single React subtree mounted across
state changes — significantly simpler than the React Router case.

**However:** the landing↔dashboard transition is gated by Clerk auth state, not
just hash state. A persistent map root that survives landing↔dashboard MUST
live above the Clerk auth boundary (in `App.tsx` or `main.tsx`), not below.

---

## §4 — Mount / unmount boundaries (current re-init frequency)

Every site that calls one of the three engine components is a mount/unmount
boundary. The full list, ordered by likelihood-per-session:

| Boundary                      | Mount trigger                           | Unmount trigger                         | Re-init cost                                    |
| ----------------------------- | --------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| Landing inline coverage (E1)  | Landing route entered                   | Landing route exited (auth or hash nav) | High — full WebGL context                       |
| Landing coverage dialog (E1)  | User opens "Browse Coverage"            | Dialog dismissed                        | High — second WebGL context, parallel to inline |
| Landing nav layout (E1)       | `CoverageActiveNavigationLayout` mounts | Nav exits                               | High                                            |
| Dashboard role widget (E3)    | `HomeScreen` mounts (per role branch)   | Tab switch away from home               | High — every home revisit                       |
| Reports list (E3)             | `ReportsListScreen` mounts              | Tab switch away                         | High                                            |
| Report detail (E3)            | `ReportDetailScreen` mounts             | Tab back / detail close                 | High                                            |
| Competitor analysis (E3)      | `CompetitorAnalysisScreen` mounts       | Tab away                                | High                                            |
| Dashboard coverage panel (E1) | `DashboardCoveragePanel` activated      | Panel dismissed                         | High                                            |
| Shop directory pane (E2)      | Directory route entered                 | Directory left                          | High                                            |

**Estimated session re-init count today:**
A customer who lands → auth → home → reports list → report detail → back to
home → coverage panel mounts **at least 6 distinct MapLibre instances** in
sequence (landing E1, landing dialog if opened, dashboard home E3, reports
list E3, report detail E3, dashboard home E3 again, coverage panel E1).

A shop user navigating directory → shop home → reports → directory adds E2
into the rotation.

**PMS performance gate (owner directive translated):** Reduce the per-session
WebGL context count to **≤ 1** for the unified E1 ↔ E3 surface (and **≤ 2**
including E2 if Phase 2 unifies). This is the principal performance lever in
the entire feature.

---

## §5 — Viewport authorities

### `MapLibreServiceCoverageMap` (E1) — **declarative-only**

Camera authority is fully declarative via the `revision` prop. Imperative
camera moves are issued by sibling controllers in [src/app/components/maps/mapLibreControllers.tsx](../src/app/components/maps/mapLibreControllers.tsx):

| Controller                               | Trigger                           | Imperative call                                                                                                      |
| ---------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `MapLibreViewportController` (L8)        | `[center, zoom, revision]` change | `jumpTo` on first call, `flyTo` thereafter                                                                           |
| `MapLibreFollowLocationController` (L39) | GPS update / guidance entry       | `easeTo` (tighter zoom + debounce in guidance mode); first-entry dramatic zoom; bearing/pitch reset on guidance exit |
| `MapLibreArrivalCameraEffect` (L144)     | Arrival event                     | One-shot tween                                                                                                       |
| `MapLibreRouteFitController` (L182)      | `routeFitKey` change              | `fitBounds` over route geometry                                                                                      |

Props consumed by the host: `center`, `zoom`, `revision`, `tileMode`,
`activeSearchTarget`, `radiusMeters`, `radiusMiles`, `regionCount`,
`selectedShopId`, `selectedDiscoveryPlaceId`, `immersiveFullscreen`,
`presentationMode`, `followCurrentPosition`, `followCurrentPositionRevision`,
`guidanceMode`, `currentHeadingDegrees`, `currentPosition`, `routeGeometry`,
`routeFitKey`, `destination`, `nextInstruction`. **No `autoFit`.**

Derivation hooks: [useOperatingRegionsCoverage.ts](../src/app/hooks/useOperatingRegionsCoverage.ts), [useCoverageNavigationExperience.ts](../src/app/hooks/useCoverageNavigationExperience.ts).

### `MapLibreDashboardMapPreview` (E3) — **declarative + autoFit**

Props at [src/app/components/dashboard/MapLibreDashboardMapPreview.tsx](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) L78–118.
Internal `fittedView` memo at L49–72 overrides `center`/`zoom` when ≥2
fit-points exist AND `autoFit` permits.

| Prop                   | Default                      | Locked?                                                    |
| ---------------------- | ---------------------------- | ---------------------------------------------------------- |
| `shops`                | `EMPTY_PARTNER_SHOPS`        | identity LOCKED (Pass 251)                                 |
| `reportPins`           | `EMPTY_REPORT_PINS`          | identity LOCKED (Pass 251)                                 |
| `serviceAreaCircles`   | `EMPTY_SERVICE_AREA_CIRCLES` | identity LOCKED (Pass 251)                                 |
| `center`               | required                     | byte-identity LOCKED across reduced-motion (Pass 246, 256) |
| `zoom`                 | required                     | as above                                                   |
| `autoFit`              | `"always"`                   | branch behavior LOCKED (Pass 241, 245)                     |
| `callerBoundsExplicit` | `false`                      | branch behavior LOCKED (Pass 241)                          |

13 of 14 call sites pass `autoFit` explicitly (per [engine3CallSiteAutoFitContract.test.ts](../src/app/__tests__/engine3CallSiteAutoFitContract.test.ts)). `ShopMapWidget` is the owner-dirty exception.

**PMS implication:** A unified host MUST honor both authority models —
declarative-revision (E1) and autoFit + callerBoundsExplicit (E3) — without
altering either. The cleanest path is to keep both hosts and lift only the
**engine instance** (E1's `MapEngineCanvas` underlying MapLibre) into a
persistent root, leaving the host components themselves as thin wrappers
around the persistent engine. Architecture options Pass 259 will weigh this.

---

## §6 — Gesture-mode sources

**Single in-tree reference**: [src/app/components/maps/engine/MapEngineCanvas.tsx](../src/app/components/maps/engine/MapEngineCanvas.tsx) L183 — `cooperativeGestures={!immersiveFullscreen}`.

Forwarded by `MapLibreServiceCoverageMap` from its own `immersiveFullscreen`
prop (default `false` at the host).

`MapLibreDashboardMapPreview` does **not** set `cooperativeGestures` and uses
the `react-map-gl` default (which equates to non-cooperative).

**PMS implication:** Today gesture mode is **derived from a host-mount-time
prop**. If PMS keeps a single engine mounted across routes, the gesture mode
becomes a **route-state-derived** value: when the user is on the dashboard
preview route, cooperative gestures should be off (preview is non-interactive
chrome); when the user is on the immersive coverage route, cooperative gestures
should be on (immersive owns the viewport). This transition becomes a
**runtime state toggle**, which Pass 256 invariants do not yet cover for the
preview surface — Pass 259 must include this as a tested-before-shipped gate.

---

## §7 — Map-state ownership boundaries

Today, every map state slice is owned by one of three places:

| State slice                                                                   | Owner                                                               | Lifetime                                                   | PMS classification                                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Coverage selection (counties, partner shops, discovery places, search target) | `useOperatingRegionsCoverage` (hook)                                | Mounted-host lifetime                                      | Shared-session-safe; lift to context candidate                                               |
| Coverage navigation (route, GPS, follow, guidance, voice)                     | `useCoverageNavigationExperience` (hook)                            | Mounted-host lifetime                                      | Shared-session-safe; already partially persisted via `services/navigation/persistedState.ts` |
| Performance samples                                                           | `useMapPerformanceTracking` + `mapPerformance.ts` (localStorage v2) | Persisted across sessions; in-memory window per host mount | **Lifetime change required** — see §10                                                       |
| Dashboard preview view (selected report, selected shop)                       | Per-screen local state in widgets                                   | Per-screen mount                                           | Preview-only; route-local                                                                    |
| Tile mode                                                                     | Per-host local state                                                | Per-host mount                                             | Shared-session-safe; lift to user-prefs candidate                                            |

**PMS implication:** Coverage selection + coverage navigation hooks already
have well-defined APIs and are session-scoped by intent. They are the easiest
to lift into a shell-level context. Dashboard preview state is
**route-local** and must remain so. Performance tracking semantics need
explicit revision (§10).

---

## §8 — Performance observers

| Observer                     | File                                                                                                                                                               | Storage key                                          | What it persists                                                            | Lifetime today                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `useMapPerformanceTracking`  | [src/app/components/maps/useMapPerformanceTracking.ts](../src/app/components/maps/useMapPerformanceTracking.ts)                                                    | n/a (in-memory ring)                                 | sample window for current host mount                                        | Host-mount lifetime                                                                                      |
| `mapPerformance` persistence | [src/app/services/navigation/mapPerformance.ts](../src/app/services/navigation/mapPerformance.ts)                                                                  | `bidondent.navigation.mapPerformance.v1` (version 2) | `MapInteractionSample[]` capped at maxSamples                               | Persists across sessions; `MapInteractionStatus` derived: `"idle" \| "healthy" \| "watch" \| "degraded"` |
| Engine→host perf wires       | [src/app/components/maps/engine/MapEngineCanvas.tsx](../src/app/components/maps/engine/MapEngineCanvas.tsx) L63                                                    | n/a                                                  | Forwards `onZoomStart/onZoomEnd/onMoveStart/onMoveEnd/handleZoom` from host | Engine-mount lifetime                                                                                    |
| Diagnostics surface          | [src/app/components/maps/command-center/PlannerDiagnosticsPanel.tsx](../src/app/components/maps/command-center/PlannerDiagnosticsPanel.tsx) L13, 139, 157          | n/a                                                  | Reads `mapPerformance.recentOverBudgetCount / recentSampleCount`            | Panel-mount lifetime                                                                                     |
| Planner consumer             | [src/app/components/maps/command-center/CoverageNavigationPlanner.tsx](../src/app/components/maps/command-center/CoverageNavigationPlanner.tsx) L17, 120, 121, 259 | n/a                                                  | Reads `getMapPerformanceSummary()`                                          | Planner-mount lifetime                                                                                   |

**PMS implication (CRITICAL):** Today the in-memory performance window resets
on every host mount. Under PMS the engine stays mounted across routes, so the
performance window becomes session-scoped. The `mapPerformance` summary status
(`idle/healthy/watch/degraded`) currently transitions back to `idle` after a
host unmount; under PMS that "reset" no longer occurs and the status reflects
a longer continuous interval. **Diagnostics consumers in
`PlannerDiagnosticsPanel` and `CoverageNavigationPlanner` rely on the current
window semantics.** Pass 259 must include a "performance tracking lifetime"
option for each architecture — does it preserve the current window behavior
(via a manual window-reset on PMS route transitions) or accept the new
session-scoped semantics (and update consumers).

---

## §9 — Imperative camera controllers (out-of-band camera moves)

All four imperative camera controllers live in
[src/app/components/maps/mapLibreControllers.tsx](../src/app/components/maps/mapLibreControllers.tsx):

| Controller                         | Line | Effect deps                | PMS lifetime risk                                                                                 |
| ---------------------------------- | ---- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| `MapLibreViewportController`       | L8   | `[center, zoom, revision]` | First-call `jumpTo` becomes "first-call-after-PMS-mount-not-after-route-mount" — semantics change |
| `MapLibreFollowLocationController` | L39  | GPS + guidance state       | Guidance entry/exit reset of bearing/pitch becomes session-scoped                                 |
| `MapLibreArrivalCameraEffect`      | L144 | Arrival flag               | One-shot becomes "one-shot per session" not "one-shot per host mount"                             |
| `MapLibreRouteFitController`       | L182 | `routeFitKey`              | `fitBounds` semantics unchanged                                                                   |

**PMS implication:** Each controller's "first-mount" branch must be re-keyed
under PMS to "first-active-route" or "first-active-revision" rather than
React-mount. This is a non-trivial controller-internal change; Pass 259 must
weight options by how disruptive they are to these controllers.

---

## §10 — Re-init frequency snapshot (current vs PMS target)

| Metric                           | Current per session (typical customer flow) | PMS target                |
| -------------------------------- | ------------------------------------------- | ------------------------- |
| MapLibre instance count (E1+E3)  | 4–6                                         | 1                         |
| WebGL context creations          | 4–6                                         | 1                         |
| Style reloads                    | 4–6 (one per init)                          | 1 + tile-mode flips       |
| Tile re-requests on route change | full set per init                           | 0 (geometry preserved)    |
| Memory peak                      | spikes per init then GC                     | flat after first init     |
| First map paint per route change | ~300–800ms (cold init)                      | <50ms (route-only update) |

**These are estimates** based on engine-instance count and standard MapLibre
init costs. Pass 260 will require empirical measurement before the PMS build
lane begins (instrumentation pass).

---

## §11 — Surface classification for PMS migration

| Surface                                                           | Class                              | Notes                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `MapLibreServiceCoverageMap` (E1)                                 | **PMS Phase 1 candidate**          | Single host, declarative authority, three call sites. Lowest semantic risk.                            |
| `MapLibreDashboardMapPreview` (E3)                                | **PMS Phase 1 candidate (gated)**  | Six call sites; Tier B branch semantics LOCKED; merge requires byte-identical viewport contract proof. |
| `MapLibreShopDirectoryMapPane` (E2)                               | **PMS Phase 2 deferred**           | Separate engine, separate orchestration, separate viewport manager. Out of Phase 1 scope.              |
| `ShopMapWidget` (E3 caller)                                       | **PMS-untouchable**                | Owner-dirty file. No edits without owner clearing dirty state.                                         |
| `mapLibreControllers.tsx` (4 controllers)                         | **PMS-impacted**                   | Effect-dep keying must change under any PMS option that keeps the engine mounted across routes.        |
| `useMapPerformanceTracking` + `mapPerformance.ts`                 | **PMS-impacted**                   | Window lifetime semantics change. Diagnostics consumers must be re-evaluated.                          |
| `useOperatingRegionsCoverage` + `useCoverageNavigationExperience` | **PMS shared-session-safe**        | Lift-to-shell candidates. Already session-intent-shaped.                                               |
| Per-screen widget state (selected report, selected shop)          | **PMS preview-only / route-local** | Must NOT be lifted to PMS; remains per-screen.                                                         |

---

## §12 — Likely PMS win areas (in priority order)

1. **Eliminate dashboard preview re-init churn (E3, 6 call sites).** Single
   biggest performance win. Every tab switch within the dashboard currently
   re-creates a WebGL context.
2. **Eliminate landing↔dashboard re-init (E1).** Second-biggest win.
   Continuity of map state across the auth boundary improves perceived
   premium-ness and matches the owner's "report → map → shop → action"
   loop directive.
3. **Reports preview → fullscreen handoff.** The owner-stated motivating
   feature: clicking a preview lifts the same engine to a fullscreen surface
   with viewport continuity. This is naturally easier once (1) and (2) are
   done.
4. **Coverage selection state continuity across panel open/close.** Today
   opening `DashboardCoveragePanel` re-derives selection from URL/local
   state; PMS lets selection survive the panel close.
5. **Performance sample window continuity** for diagnostics — depends on
   §10's resolution (do consumers prefer per-route-windows or per-session
   windows).

---

## §13 — Possible memory-retention risks

| Risk                      | Source                                                                          | Mitigation candidate                                                                                |
| ------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Layer/source accumulation | `Source`/`Layer` children of three different host trees attaching to one engine | PMS host MUST own layer lifecycle explicitly; mount/unmount must be route-driven, not engine-driven |
| Popup leak                | `Popup` consumers across screens                                                | Popups must be route-scoped; close-on-route-exit hook required                                      |
| Event listener leak       | Engine `onZoom*/onMove*` wired to per-route hosts                               | Engine event handlers must be re-routable per active host                                           |
| GeoJSON cache growth      | `useMapEngineGeoJSON.ts`                                                        | Cache eviction policy required for long-session maps                                                |
| Tile cache                | MapLibre internal                                                               | Acceptable; bounded by MapLibre                                                                     |
| Performance sample buffer | `mapPerformance` ring                                                           | Already capped at `maxSamples`; OK                                                                  |

---

## §14 — Possible stale-state risks

| Risk                          | Mechanism                                                                       | Mitigation candidate                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Stale viewport on route enter | Engine retains last-route viewport                                              | New-route entry must emit `revision` bump or explicit `setView` to clear              |
| Stale gesture mode            | `cooperativeGestures` carries from previous route                               | Gesture mode must become route-state-derived (see §6)                                 |
| Stale layer visibility        | Previous route's layers remain mounted                                          | Layer mount lifecycle must be route-keyed, not engine-keyed                           |
| Stale follow-location state   | `MapLibreFollowLocationController` retains active state                         | Controller must be route-keyed or explicitly reset on route change                    |
| Stale arrival camera flag     | `MapLibreArrivalCameraEffect` one-shot semantics                                | Re-key to route-active scope                                                          |
| Stale tile mode               | User changed mode in coverage view, returns to preview which has different mode | Tile mode must be either lifted to user-pref (§7) or route-scoped with explicit reset |

---

## §15 — App shell candidates for the PMS root

| Candidate                                                           | File                                                                                        | Reach                       | Tradeoff                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| Inside `DashboardLayout` (above `DashboardRouter` outlet)           | [src/app/components/app/DashboardLayout.tsx](../src/app/components/app/DashboardLayout.tsx) | All dashboard routes        | Does NOT survive landing↔dashboard transition. Simplest scope.                   |
| Between `MotionConfig` and `GlobalErrorBoundary` in `main.tsx`      | [src/main.tsx](../src/main.tsx)                                                             | All app routes              | Survives landing↔dashboard. Highest scope; highest reward; highest blast radius. |
| Inside `App.tsx`'s authenticated branch wrapper                     | [src/app/App.tsx](../src/app/App.tsx)                                                       | Authenticated app only      | Survives dashboard route changes; does not survive auth flip                      |
| New top-level `MapSessionProvider` between Clerk provider and `App` | n/a (would create)                                                                          | All app routes inside Clerk | Cleanest separation; requires new file                                            |

Pass 259 will weight these.

---

## §16 — Demo-mode interaction with PMS

`useCoveragePartnerShops.ts` L5 imports `DEMO_MODE` from
[src/app/config/demoMode.ts](../src/app/config/demoMode.ts) and is the **only**
map data hook that branches on demo config. Demo fixture partner shops flow
through both E1 and E3. The map host components themselves contain no
demo-mode conditionals.

**PMS implication:** PMS does not need to special-case demo mode. The data
hooks already handle it transparently.

---

## §17 — What is NOT changed by this audit

Per lane discipline, this audit does **not**:

- Modify any source file
- Change any test
- Alter any LAW or REF doc beyond AI_LOCK
- Pre-commit any architecture choice
- Recommend implementation timing

It establishes the substrate. Pass 259 weighs options against this substrate.
Pass 260 sequences the chosen option's execution.

---

## §18 — Cross-references

- [`docs/REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) — confidence forward constraints (the locks PMS inherits)
- [`docs/PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — predecessor unification plan (Step C)
- [`docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — engine inventory
- [`docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) — Engine 3 camera authority semantics
- [`docs/REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md) — navigation state ownership
- [`docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md`](REF_MAP_MOTION_CONTRACT_2026-05-09.md) — reduced-motion inheritance
- [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon
- [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — four-layer model
- `AI_LOCK.md` — current session coordination
