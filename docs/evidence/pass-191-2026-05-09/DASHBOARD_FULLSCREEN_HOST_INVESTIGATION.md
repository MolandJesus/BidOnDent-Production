# Step C.1 sub-pass 3 — dashboard-fullscreen host investigation (read-only)

**Pass:** 191 (master builder) · **Date:** 2026-05-09
**Authority:** Master builder follow-on to Pass 189 (sub-pass 2). Read-only — no source touched.
**Source plan:** [`docs/PLAN_MAP_UNIFICATION_2026-05-08.md`](../../PLAN_MAP_UNIFICATION_2026-05-08.md) §4 Step C.1.

---

## Why this investigation exists

Plan §4 Step C, line 238: "**Migrate `dashboard-fullscreen` first** (2 passes). Lowest risk: dashboard map is the richest UI but has the most tested surface area."

Plan §4 Step A note, line 218 (already flagged): "⚠ Dashboard Smart Shop Map host — KI-164 investigation never pinpointed the host, but Step A's resolved scope (Engine B only) means the dashboard fullscreen migration is part of Step C, not Step A."

Sub-pass 2 (Pass 189, commit `9d154645`) extracted `<MapEngineCanvas>` cleanly. Before the master builder begins sub-pass 3 (introducing `<MapProgramShell host="dashboard-fullscreen">`), the host file actually being targeted needs to be named — otherwise sub-pass 3 has no concrete consumer to migrate. This doc names it.

---

## Method

```bash
grep -rln "MapLibreServiceCoverageMap\|ServiceCoverageMap" src --include="*.ts" --include="*.tsx"
grep -rln "MapLibreDashboardMapPreview" src --include="*.ts" --include="*.tsx"
find src -path "*dashboard*" -name "*.tsx"
```

Tool output verified by direct file reads of every dashboard-prefixed map component plus `HomeScreen.tsx`.

---

## Finding 1 — `MapLibreServiceCoverageMap` has no dashboard consumer

`grep -rln` results restricted to `src/`:

```
src/app/components/maps/mapLibreServiceCoverageMapHelpers.ts        (helper file — pure types/builders)
src/app/components/maps/mapLibreControllers.tsx                     (referenced in code comment only)
src/app/components/maps/MapLibreServiceCoverageMap.tsx              (self)
src/app/components/maps/engine/MapEngineCanvas.tsx                  (Pass 189 — engine extraction)
src/app/components/maps/useMapEngineGeoJSON.ts                      (Pass 185 hook, references in JSDoc)
src/app/components/landing/CoverageBrowseExperience.tsx             (LANDING dialog body)
src/app/components/landing/OperatingRegionsSection.tsx              (LANDING inline section)
src/app/components/landing/CoverageActiveNavigationLayout.tsx       (LANDING navigation layout)
```

**Three real runtime consumers, all under `src/app/components/landing/`. Zero dashboard consumers.**

This contradicts the plan's premise that the dashboard hosts a `MapLibreServiceCoverageMap` mount.

## Finding 2 — Dashboard map widgets render a parallel MapLibre instance

[`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../../../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) (273 lines) imports `<Map>` directly from `react-map-gl/maplibre` and instantiates its own engine. It does **not** consume `<MapEngineCanvas>` or `<MapLibreServiceCoverageMap>`.

It includes:
- The same `maplibreResizePatch` side-effect import.
- The same `maplibre-gl/dist/maplibre-gl.css` import.
- A self-contained auto-fit viewport calc (lines 41-100) — separate from `MapLibreViewportController`.
- Source/Layer/Popup composition for shops, report pins, and service-area circles.

The three persona widgets ([`CustomerMapWidget`](../../../src/app/components/dashboard/CustomerMapWidget.tsx), [`ShopMapWidget`](../../../src/app/components/dashboard/ShopMapWidget.tsx), [`InsurerMapWidget`](../../../src/app/components/dashboard/InsurerMapWidget.tsx)) all `import DashboardMapPreview from "./MapLibreDashboardMapPreview"`. They are the only consumers.

## Finding 3 — Dashboard map mount is a compact preview, not a fullscreen surface

[`src/app/components/codelayer/HomeScreen.tsx:347`](../../../src/app/components/codelayer/HomeScreen.tsx#L347):

```tsx
{/* Map widget — compact preview with CTA to full Shop Directory */}
{userType === "shop" ? (
  <ShopMapWidget … />
) : userType === "insurer" ? (
  <InsurerMapWidget … />
) : (
  <CustomerMapWidget … />
)}
```

The widget IS the dashboard-side map. It renders inline in the home feed as a card-shaped preview with a CTA. There is **no fullscreen dashboard map experience** anywhere in `src/` that mounts `MapLibreServiceCoverageMap`.

The plan's `dashboard-fullscreen` host as described in §1 / §3 / §4 Step C does not currently exist as a code surface. The KI-164 / KI-166 / KI-169 references in those sections describe future-state (post-migration) layout, not a present mount path.

## Finding 4 — The actual fullscreen surfaces using the engine

These are the three real consumers of `<MapLibreServiceCoverageMap>` (which now renders `<MapEngineCanvas>` after Pass 189):

| Host | File | Plan §1 surface |
|---|---|---|
| Landing dialog body | [`CoverageBrowseExperience.tsx`](../../../src/app/components/landing/CoverageBrowseExperience.tsx) (490 lines) | §1.1 — labelled `landing-dialog` in §3 |
| Landing inline section | [`OperatingRegionsSection.tsx`](../../../src/app/components/landing/OperatingRegionsSection.tsx) (599 lines, at L2 budget ceiling) | §1.3 — labelled `operating-regions-inline` in §3 |
| Landing active-navigation layout | [`CoverageActiveNavigationLayout.tsx`](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx) (~325 lines) | not enumerated separately in §1 — used via `landing-dialog` `presentationMode === "navigating"` switch |

The shop-directory immersive surface (`ImmersiveMapViewport`, plan §1.5) is a parallel viewport — explicitly out of scope until Step F.

---

## Implications for sub-pass 3

The plan §4 Step C ordering ("dashboard-fullscreen first … landing-dialog second") is unsound because the named first target doesn't exist. Two ways to resolve:

**Option (a) — re-target sub-pass 3 to `landing-dialog`.**

Make the first `<MapProgramShell host="…">` migration target `CoverageBrowseExperience` (the landing dialog body). It already mounts `MapLibreServiceCoverageMap`; it already has the chrome (sidebar, top instruction, demo-fallback banner from Pass 10 KI-172) the plan §3 host-config table assigns to `landing-dialog`. This is now the lowest-risk migration because the surface, the engine wiring, and the regression coverage all already exist.

This is the option this evidence doc recommends. It also folds plan §4 Step C and Step D into a single step (since the original Step D was the landing-dialog migration). Net: one less step in the migration roadmap.

**Option (b) — promote `MapLibreDashboardMapPreview` first.**

Migrate `MapLibreDashboardMapPreview` to consume `<MapEngineCanvas>` so the dashboard maps share the engine, then introduce `<MapProgramShell host="dashboard-mini">` over the converged engine. This is structurally meaningful (it eliminates the parallel-engine implementation) but is a bigger lift and changes the established sub-pass order (it inserts a new prerequisite step before sub-pass 3).

**Recommendation: option (a).** It preserves the sub-pass 3 line item ("introduce `<MapProgramShell>`") with a real consumer, defers the engine convergence work for `MapLibreDashboardMapPreview` to a separate later pass (which can be re-evaluated after the shell is stable), and matches the audit AI's recurring "containment over expansion" feedback.

The plan §4 Step C line `dashboard-fullscreen first` should be retitled `landing-dialog first (re-targeted Pass 191)` and the existing Step D content folded into Step C.

---

## What this doc does NOT do

- Does not edit any LAW doc.
- Does not edit `MOLANDJESUS_DESIGN_DECISIONS.md` (locked apex canon).
- Does not edit any KI entry.
- Does not edit source code.
- Does not preempt the master-builder Step C re-target decision — only surfaces evidence and a recommendation.

The plan §4 Step C re-target itself is a separate edit, in this same Pass 191, additive only — see commit footer.

---

## Verification

```bash
# Stamp 2026-05-09T(time of writing)
$ grep -rln "MapLibreServiceCoverageMap" src --include="*.ts" --include="*.tsx" | wc -l
8                              # 5 files in maps/ (engine + helpers + self + tests + hook); 3 in landing/
$ grep -rln "MapLibreDashboardMapPreview" src --include="*.ts" --include="*.tsx" | wc -l
4                              # 1 self + 3 dashboard widgets
$ grep -l "from \"react-map-gl/maplibre\"" src --include="*.tsx" -r
src/app/components/maps/MapLibreCoverageMapLayers.tsx
src/app/components/maps/engine/MapEngineCanvas.tsx
src/app/components/dashboard/MapLibreDashboardMapPreview.tsx
src/app/components/maps/mapLibreControllers.tsx
src/app/components/shop/ImmersiveMapViewport.tsx
```

The five files above are the **complete inventory of MapLibre engine instantiations** in `src/`. Three are owned by the unified engine path (`MapLibreCoverageMapLayers` / `MapEngineCanvas` / `mapLibreControllers`); two are parallel implementations (`MapLibreDashboardMapPreview`, `ImmersiveMapViewport`). Sub-pass 3 cannot legitimately target `dashboard-fullscreen` because it would need to lift one of the parallel implementations first.
