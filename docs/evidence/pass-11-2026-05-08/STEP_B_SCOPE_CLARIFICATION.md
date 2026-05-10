# Step B — scope clarification before extraction

**Author:** audit AI (Pass 24 prep, post-cowork-Pass-23 Step A ship)
**Date:** 2026-05-08
**Status:** Open question for master-builder review

---

## §1. Codebase reality vs plan doc Step B framing

Plan doc §4 Step B (line ref `PLAN_MAP_UNIFICATION_2026-05-08.md`):
> "Step B — Extract shared bottom-right utility cluster (1 pass). New file:
> `src/app/components/maps/shell/MapProgramUtilityCluster.tsx`. Lift
> locate-me, recenter, compass, zoom into one cluster."

Plan doc §2.1 specifies bottom-right utilities are: "locate-me, recenter,
compass (immersive only), zoom (where engine doesn't already render its
own)."

### What's actually in the codebase

**Engine A (`MapLibreServiceCoverageMap.tsx`):**
- Imports `react-map-gl/maplibre`'s built-in `NavigationControl`,
  `AttributionControl`.
- Renders `<NavigationControl position="bottom-right" showCompass={immersiveFullscreen} />`
  at line 308. That's the entire bottom-right cluster — MapLibre handles
  zoom + compass natively.
- Does NOT have custom locate-me / recenter buttons in the bottom-right.
- Has a SEPARATE custom component `MapSurfaceControls.tsx` (123 lines) that
  renders the TOP-RIGHT segmented control (Map/Night/Satellite tile-mode +
  Focus + Overview + Expand). Different position, different UX shape.

**Engine B (`MapLibreShopDirectoryMapPane.tsx`):**
- Imports `Map, GeolocateControl, NavigationControl, ScaleControl`.
- Renders `<GeolocateControl>` (line 309) + `<NavigationControl>` (line 326)
  + `<ScaleControl>`. All MapLibre built-ins.
- The compass + zoom + geolocate are all native MapLibre — no custom React
  for them.

**Engine C (`MapLibreDashboardMapPreview.tsx`):**
- Likely similar pattern (uses `react-map-gl/maplibre` natives).

### Net mismatch

The "shared bottom-right utility cluster" the plan doc describes already
exists — but it's MapLibre's built-in controls, not a custom React
component. There's no obvious extraction target equivalent to Step A's
`ImmersiveMapTopBar`.

What CAN be extracted (corrected scope candidates):

1. **`MapSurfaceControls.tsx` → `MapProgramTileToggle.tsx`** —
   canonicalize the Engine-A top-right segmented control into the shell
   directory. Engine B uses a different tile-mode UX (icon-cycle button
   in `ImmersiveMapTopBar`) which is now covered by the shell's
   `MapProgramTopBar`. So this extraction doesn't unify either — it just
   relocates Engine A's separate UX.

2. **`<MapProgramNavigationControl>` thin wrapper** — wrap the MapLibre
   `NavigationControl` with canonical config (`position="bottom-right"`,
   `showCompass={immersiveFullscreen}` rule, accessibility hooks). Adds
   a small abstraction layer but doesn't replace native controls.

3. **`<MapProgramGeolocateControl>` + `<MapProgramScaleControl>` thin
   wrappers** — similar to #2. Engine B uses both; Engine A doesn't.

4. **Defer Step B entirely** — the bottom-right is already canonical via
   MapLibre. Plan doc §4 Step B was authored before the 3-engine
   reality was understood (audit AI Pass 11 §1.4/§1.5 finding +
   co-worker's 19-surface matrix). The plan should be updated to
   reflect the actual extraction targets, which are fewer than originally
   framed.

## §2. Recommendation

**Defer Step B as currently scoped.** The codebase already canonicalizes
the bottom-right utility cluster via MapLibre built-ins. No real
extraction target exists for that quadrant.

The Engine-A top-right segmented control (`MapSurfaceControls`) IS a
candidate for canonicalization, but that's a separate pass with a
different name (e.g. `MapProgramTileToggle` rather than the misleading
`MapProgramUtilityCluster`).

**Suggested next-step path:**

1. **Master builder updates plan doc §4 Step B** to either:
   - (A) Drop Step B entirely and renumber Steps C-G accordingly.
   - (B) Reframe Step B as `MapProgramTileToggle` extraction targeting
     the Engine-A `MapSurfaceControls` component (top-right placement,
     not bottom-right).
   - (C) Clarify that Step B is the "MapLibre native config canonicalization"
     pass — small thin-wrapper components for `NavigationControl` etc.
2. **Audit AI / co-worker AI** picks up the clarified Step B in a
   subsequent pass.

## §3. Why I did NOT ship Step B blind

Per cooperative-edit lesson logged in `AI_LOCK.md` and master builder's
Pass 180 §7.5 directive ("Pure presentational lift — no behavior change,
no new callbacks. Same handlers in, same handlers out"), shipping a
misguided extraction would:

- Create a new file with no clear scope — easier to delete later than to
  unwind from consumer integration.
- Risk creating an empty / vague abstraction that future AIs cycle on.
- Violate the "containment over expansion" rule from
  `LAW_HARDENING_PLAN.md`.

Better to surface the finding here and defer to master-builder review.

## §4. Doesn't block other work

Step B clarification doesn't block:

- Step A.2 (host-discriminator extension on `MapProgramTopBar`) — gates
  on §1.4/§1.5 fork resolution, not on Step B.
- Step C (dashboard-fullscreen migration) — gates on Step A landing
  (already done) and would only need Step B IF Step B exists. If Step B
  is deferred/dropped, Step C can proceed without it.
- Other code-quality / KI work.

Standing by for master-builder direction.

---

**End of Step B clarification.**
