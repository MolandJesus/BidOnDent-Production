# REF — KI-196 Default-Param / Unstable-Reference Inventory

**Created:** 2026-05-09
**Pass:** 249 (KI-196 lane / Phase 3B-adjacent stability hardening)
**Tier:** REFERENCE
**Status:** ACTIVE — feeds the Pass 250 SAFE-TO-HARDEN matrix.
**Authority:** Owner-authorized full-autopilot pivot OUT of Phase 3B
continuation. Lane = KI-196 family + behavior-preserving hardening
ONLY. Hard restriction: no autoFit / authority / viewport / camera
semantic changes; no sub-pass C work.

---

## Mission

Inventory every default array/object parameter and identifiable
unstable-reference hazard across the **map runtime surface** and
its **adjacent hooks**. Classify each by:

- propagation path (where the value flows)
- consumer pattern (memo deps, effect deps, render-only)
- amplification risk (does an unstable identity reach a `useEffect`
  that mutates state?)
- KI-196 root-doctrine alignment (re KI-181 §12.3 and the
  documented `reportPins = []` hazard).

Output is read-only. Pass 250 produces the executable hardening
matrix; Pass 251 lands only behavior-preserving fixes.

---

## §1. Hazard hits — map runtime + adjacent hooks

Search performed across:

- `src/app/components/dashboard/**/*.tsx`
- `src/app/components/maps/**/*.{ts,tsx}` (incl. `engine/`,
  `command-center/`)
- `src/app/hooks/**/*.{ts,tsx}`
- `src/app/features/**/*.{ts,tsx}`

Patterns: `=\s*\[\s*\]\s*[,)]`, `=\s*\{\s*\}\s*[,)]`.

### Hits

| #   | Site (file : line)                                                        | Param                         | Type    | Owner-dirty? |
| --- | ------------------------------------------------------------------------- | ----------------------------- | ------- | ------------ |
| 1   | `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx:84`         | `reportPins = []`             | Array   | NO           |
| 2   | `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx:85`         | `serviceAreaCircles = []`     | Array   | NO           |
| 3   | `src/app/components/dashboard/InsurerMapWidget.tsx:28`                    | `reports = []`                | Array   | NO           |
| 4   | `src/app/components/dashboard/ShopMapWidget.tsx:29`                       | `reports = []`                | Array   | **YES**      |
| 5   | `src/app/components/dashboard/CustomerMapWidget.tsx:41`                   | `reports = []`                | Array   | NO           |
| 6   | `src/app/components/maps/MapLibreServiceCoverageMap.tsx:22`               | `counties = []`               | Array   | NO           |
| 7   | `src/app/components/maps/MapLibreServiceCoverageMap.tsx:23`               | `partnerShops = []`           | Array   | NO           |
| 8   | `src/app/components/maps/MapLibreServiceCoverageMap.tsx:43`               | `discoveryPlaces = []`        | Array   | NO           |
| 9   | `src/app/components/maps/command-center/CoverageNavigationPlanner.tsx:82` | `addressSuggestions = []`     | Array   | NO           |
| 10  | `src/app/hooks/shopDirectorySessionUtils.ts:98`                           | `vehicles = [], reports = []` | Pure-fn | NO           |
| 11  | `src/app/components/maps/engine/MapEngineCanvas.test.tsx:91`              | `overrides = {}`              | Test-fn | NO           |

No `={}` default-param hazards found in the runtime surface
(only one in test code). Hits #10 and #11 are non-render contexts
and excluded from runtime risk classification.

---

## §2. Per-site risk classification

Each runtime hit is classified by the **consumer pattern** of the
defaulted prop inside its component body — i.e., the path the
defaulted reference takes if the caller omits the prop.

### Hit 1 — `MapLibreDashboardMapPreview.reportPins = []`

- **Propagation path:** `reportPins` → `allPoints` useMemo (deps
  `[shops, reportPins]`) → `fittedView` useMemo (deps `[shops,
allPoints]`) → `effectiveFittedView` useMemo (deps `[autoFit,
callerBoundsExplicit, fittedView]`) → `useEffect` (deps
  `[center, zoom, effectiveFittedView]`) → `setViewState`.
- **Consumer pattern:** **HIGH AMPLIFICATION** — passes through
  three useMemos and one state-mutating useEffect.
- **Active rerender risk:** **LOW in production today** — every
  observed external caller passes an explicit `reportPins` prop
  (audited in Pass 242). Risk is a **latent loop hazard** if a
  future caller omits the prop or a future caller passes a fresh
  `[]` literal inline.
- **KI-196 root site:** YES. Documented in
  `REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12.3.
- **Memo instability risk:** HIGH if triggered. Identity-only
  churn is enough to fire the effect.
- **Effect amplification risk:** YES — the effect calls
  `setViewState`, which causes re-render, which re-renders the
  default `[]` literal, which restarts the chain.

### Hit 2 — `MapLibreDashboardMapPreview.serviceAreaCircles = []`

- **Propagation path:** `serviceAreaCircles` → `serviceAreaPolygons`
  useMemo (deps `[serviceAreaCircles]`) → render-only consumer
  (`<Source>` data prop, gated on `length > 0`).
- **Consumer pattern:** **MEDIUM AMPLIFICATION** — feeds a useMemo
  but NOT a state-mutating effect.
- **Active rerender risk:** **LOW** — useMemo recomputes are
  cheap; no setState consequence.
- **KI-196 root site:** Adjacent. Same default-`[]` hazard shape
  as Hit 1, but the consumer pattern is benign.
- **Memo instability risk:** LOW — recomputes silently produce
  the same effective render output.
- **Effect amplification risk:** NO.

### Hit 3 — `InsurerMapWidget.reports = []`

- **Propagation path:** `reports` → `reportPins` useMemo (deps
  `[reports]`) → passed as explicit `reportPins` prop into
  `<DashboardMapPreview>` → enters Hit 1's chain INSIDE that
  child.
- **Consumer pattern:** **MEDIUM AMPLIFICATION (transitive)** —
  the local useMemo absorbs identity churn (recomputes but
  produces a new array regardless), then the new array becomes
  the upstream identity for Hit 1.
- **Active rerender risk:** **LOW today** — every observed
  caller of `InsurerMapWidget` passes an explicit `reports` prop
  (insurer dashboard router level, stable hook result).
- **Active rerender risk:** **LATENT** — if any future caller
  omits `reports`, it triggers the local useMemo every render
  (cheap), then feeds Hit 1's chain.
- **KI-196 root site:** Tributary to Hit 1.

### Hit 4 — `ShopMapWidget.reports = []`

- **OWNER-DIRTY.** Excluded from this inventory's
  hardening-candidate set per AI_LOCK rule. Listed for completeness;
  Pass 250 will explicitly mark this as DEFER.

### Hit 5 — `CustomerMapWidget.reports = []`

- Same shape as Hit 3. Local useMemo `reportPins` absorbs
  identity, also feeds `displayShops` useMemo (deps
  `[partnerShops, reportPins]`) which sorts and slices.
- **Consumer pattern:** **MEDIUM AMPLIFICATION (transitive +
  local sort cost).**
- **Active rerender risk:** LOW today; LATENT if caller omits.
- **KI-196 root site:** Tributary to Hit 1; also widens local
  amplification by triggering a sort.

### Hit 6 — `MapLibreServiceCoverageMap.counties = []`

- **Propagation path:** `counties` → `useMapEngineGeoJSON({
counties, ... })` → `countyGeoJSON` (memoized inside hook).
- **Consumer pattern:** **MEDIUM AMPLIFICATION** — feeds an
  external memoization hook that builds GeoJSON; consumer is
  render-data only.
- **Active rerender risk:** LOW. No state-mutating effect path
  identified at the surface.
- **KI-196 root site:** Adjacent.

### Hit 7 — `MapLibreServiceCoverageMap.partnerShops = []`

- Render-only consumer pattern (passed to Source/Layer). LOW
  amplification.

### Hit 8 — `MapLibreServiceCoverageMap.discoveryPlaces = []`

- Used in `interactiveLayerIds` useMemo (deps include
  `discoveryPlaces.length`, NOT the array identity itself).
- **Consumer pattern:** **LOW AMPLIFICATION** — the memo deps
  use `.length`, which means identity churn does NOT fire the
  memo unless length actually changes.
- **Memo instability risk:** LOW (length-keyed dep).
- **KI-196 root site:** Effectively NEUTRAL.

### Hit 9 — `CoverageNavigationPlanner.addressSuggestions = []`

- Heavy-prop component (50+ props). `addressSuggestions` consumer
  not yet traced; preliminary scan suggests render-data use.
- **Consumer pattern:** Needs Pass 250 trace before classifying.
  Provisionally MEDIUM.

### Hit 10 — `shopDirectorySessionUtils.getContextChips`

- Pure utility function, not a React render path. The defaults
  exist for ergonomic call-site convenience. NOT a hazard.

### Hit 11 — `MapEngineCanvas.test.tsx defaultProps`

- Test fixture. Not a runtime hazard.

---

## §3. Cross-cutting observations

1. **One canonical root site.** All amplification flows back to
   Hit 1 (`MapLibreDashboardMapPreview.reportPins`). The widget-
   level `reports = []` defaults (Hits 3/4/5) are tributaries
   that feed Hit 1's chain through their local `reportPins`
   useMemos.

2. **`serviceAreaCircles` is a near-twin of `reportPins`** but
   sits in a benign render-only consumer position. It is the
   safest single-token hardening target on the same renderer.

3. **No `={}` runtime hazards.** The map surface uses object
   defaults sparingly; what does exist lives in pure-fn / test
   contexts.

4. **`discoveryPlaces` is already self-stabilized** by length-keyed
   memo deps in `MapLibreServiceCoverageMap`. Hardening it would
   be redundant.

5. **No memo with `useMemo(() => fn, [])` empty-array-wrapping**
   pattern was discovered to extract — the existing memos all
   list real deps. Hardening will focus on **default-prop
   identity stability**, not on memo-dep restructuring.

6. **Pass 247 §1 footprint already locks Hit 1's signature shape**
   — the default-flip rollback footprint test allows ≥1, ≤2
   `callerBoundsExplicit = false` and `autoFit = "always"`
   occurrences but does NOT lock the form of `reportPins = []`.
   A defensive `reportPins = EMPTY_REPORT_PINS` change is
   compatible with Pass 247 invariants.

---

## §4. Out-of-scope confirmations (KI-196 lane discipline)

This pass did NOT and will NOT touch:

- `autoFit` default value (`"always"` stays).
- `callerBoundsExplicit` default value (`false` stays).
- Any `effectiveFittedView` branch logic.
- Any sub-pass C gating logic.
- Any viewport heuristic (`fittedView` math).
- Any camera semantics.
- ShopMapWidget (Hit 4) — owner-dirty, excluded.
- The 3 owner-dirty test files (`computeNavigationMetrics.test.ts`,
  `edgeErrorMessage.test.ts`, `formatVehicleLabel.test.ts`).
- Audit AI documentation files (13 modified docs in
  worktree status).

---

## §5. Handoff to Pass 250

Pass 250 will produce a SAFE-TO-HARDEN matrix that:

- For each non-owner-dirty hit, lists:
  - rollback complexity (one-token? multi-site?)
  - blast radius (single component? cross-tree?)
  - semantic sensitivity (does identity stabilization change
    any consumer's observed semantics?)
  - CI coverage sufficiency (which tests would catch a
    regression?)
  - whether singleton extraction changes equality semantics
    (e.g., does any consumer rely on inequality?)
- Produces an explicit GO / DEFER / NO classification.
- For GO items, names the exact hardening transformation
  (e.g., "extract `EMPTY_REPORT_PINS` module-scope const,
  set as default").

Pass 251 lands ONLY items marked GO, with companion tests proving
semantic equivalence.
