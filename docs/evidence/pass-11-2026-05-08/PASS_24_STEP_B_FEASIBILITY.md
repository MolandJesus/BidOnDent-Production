# Pass 24 — Step B feasibility check (utility cluster extraction)

**Date:** 2026-05-08, post-Pass-23.
**Authority:** plan doc §4 Step B is master-builder-authorized in principle (per Pass 180 §7.5 "Do not start Step B in the same pass" — implies Step B is OK in a separate pass once Step A is done).
**Outcome:** **NOT SHIPPED.** Step B has the same UX-divergence problem Step A surfaced, plus an additional structural concern: most of the "utility cluster" is MapLibre built-in primitives wired at the engine level, not custom-component territory that can be lifted to a shell.

---

## Plan-doc §4 Step B framing (original intent)

> "Extract shared bottom-right utility cluster (1 pass) — New file: `src/app/components/maps/shell/MapProgramUtilityCluster.tsx`. Lift locate-me, recenter, compass, zoom into one cluster. Preserve Pass 166 smooth flyTo, Pass 171 upper-third pin-pan offset, Pass 172 immersive-fullscreen compass."

## Reality check — what's actually there

### Engine A (`MapLibreServiceCoverageMap`) bottom-right area
- `<NavigationControl position="bottom-right" showCompass={immersiveFullscreen} />` (L308) — MapLibre built-in (zoom + optional compass).
- `MapSurfaceControls` separately renders LocateFixed (Focus) + ScanSearch (Overview) + Expand — but these appear **top-right** alongside the tile-mode segmented row, not bottom-right.

### Engine B (`MapLibreShopDirectoryMapPane`) bottom-right area
- `<GeolocateControl position={...} />` (L309) — MapLibre built-in (locate-me).
- `<NavigationControl position="bottom-right" showCompass={navigationMode === "guidance"} />` (L326-329) — MapLibre built-in (zoom + conditional compass).
- `<ScaleControl position="bottom-left" maxWidth={120} unit="imperial" />` (L330) — MapLibre built-in (scale; bottom-LEFT, not bottom-right).

### Pass 166 / Pass 171 / Pass 172 actual locations
- **Pass 166 smooth flyTo** lives in `mapLibreControllers.tsx` (engine controller hook, not a UI component).
- **Pass 171 upper-third pin-pan offset** lives in `useShopMapInteraction.ts:147-150` (hook-level).
- **Pass 172 immersive-fullscreen compass** is the `showCompass={immersiveFullscreen}` flag at `MapLibreServiceCoverageMap.tsx:308` — a flag on a built-in MapLibre primitive, not its own component.

## Why Step B isn't a clean lift

Three structural concerns:

1. **MapLibre primitives, not custom components.** `NavigationControl`, `GeolocateControl`, `ScaleControl` are imports from `react-map-gl/maplibre`. They're rendered directly inside the engine's `<Map>` component because MapLibre requires them to be Map children. They cannot be lifted to a shell that sits OUTSIDE the engine canvas — they need to be Map children.

2. **Focus / Overview live in a different visual region** than the bottom-right utility cluster. `MapSurfaceControls` (Engine A) renders Focus + Overview + Expand alongside the tile-mode toggles in the **top-right capsule rail**, not bottom-right. The plan doc §4 Step B framing of "bottom-right utility cluster" doesn't actually match the surface layout of Engine A.

3. **Engine A vs Engine B utility differs.** Engine A has `NavigationControl` + the top-right Focus/Overview from `MapSurfaceControls`. Engine B has `NavigationControl` + `GeolocateControl` + `ScaleControl` — different built-in set, different positioning.

## What Step B would actually require

To honor the plan-doc spirit ("preserve Pass 166 / Pass 171 / Pass 172"), Step B would need to:

- (a) Move `Focus` + `Overview` from the top-right `MapSurfaceControls` capsule into a NEW shell-level top-right cluster — but those are tightly bound to `tone`/`canCenter`/`onCenterActive`/`onResetView` props that flow through `MapSurfaceControls`, AND are positioned alongside tile-mode (which Pass 23 left in `MapSurfaceControls` because of the same divergence concern).
- (b) Standardize the engine-level MapLibre `<NavigationControl>` config across both engines (currently `showCompass` is `immersiveFullscreen` on Engine A but `navigationMode === "guidance"` on Engine B — different contracts).
- (c) Decide whether `GeolocateControl` (Engine B only) + `ScaleControl` (Engine B only) become shell-level slots or stay engine-specific.

All three of those decisions are GATED on master-builder picking the §1.4/§1.5 fork. The fork answers "do we converge engines and unify the utilities, or do we accept divergent engines and let utilities differ?"

## Recommendation

**Defer Step B until master-builder fork resolution.** Pass 24 NOT SHIPPED. The Step B file is real future work but it requires structural decisions that aren't on the autopilot table.

Audit AI's coordination doc §2.A already lists "Plan doc §1.4/§1.5 fork resolution" as the gating decision. Step B properly belongs after that resolution lands.

## Net for cowork-A

- Pass 23 Step A SHIPPED (immersive top-bar lifted to canonical `shell/` location, re-export shim preserves API)
- Pass 24 Step B NOT SHIPPED (recommend defer; documented why)
- All other autopilot tracks: previously exhausted

## What I'm holding

No more pending source-code work. Evidence file ready (this document). Ready to coordinate with audit AI on whichever next track they pick or hold for master-builder.

End of Pass 24 feasibility evidence.
