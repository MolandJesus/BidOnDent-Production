# Tier B Confidence Coverage Matrix — 2026-05-09

**Doc tier:** REFERENCE
**Authority:** characterization snapshot at end of Coverage Map Confidence Expansion lane (Passes 255 / 256 / 257)
**Status:** current truth as of 2026-05-09

---

## Purpose

This is the consolidated map of **what Tier B confidence work has and has not pinned** as of the close of the Coverage Map Confidence Expansion lane. Future maintainers (human or AI) should be able to read this single page and immediately understand:

- which Tier B surfaces are protected by behavioral characterization,
- which surfaces are intentionally unprotected,
- where semantic risk still lives,
- what is intentionally a non-goal,
- and what future lanes are recommended when capacity allows.

This doc is **not** authority over what should change. It is a snapshot of what is known, what is locked by tests, and what remains a blind spot. LAW docs still govern execution.

---

## Confidence cohort definition

"Tier B" in this repo means the map host surfaces — the React components that own the resolved viewport contract handed to the MapLibre adapter. There are two production Tier B hosts:

| Host                          | File                                                                                                                            | Role                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `MapLibreDashboardMapPreview` | [src/app/components/dashboard/MapLibreDashboardMapPreview.tsx](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) | Engine 3, PONC ("preview owns no camera"). autoFit + callerBoundsExplicit branch semantics.   |
| `MapLibreServiceCoverageMap`  | [src/app/components/maps/MapLibreServiceCoverageMap.tsx](../src/app/components/maps/MapLibreServiceCoverageMap.tsx)             | Full coverage host. No autoFit. Caller-driven viewport, layered chrome, performance tracking. |

Both compose the headless engine seam at `MapEngineCanvas` ([src/app/components/maps/engine/MapEngineCanvas.tsx](../src/app/components/maps/engine/MapEngineCanvas.tsx)).

---

## Coverage matrix

Legend: ✅ characterized · 🟡 partial · ⬜ uncharacterized · 🚫 intentional non-goal

### Tier B preview — `MapLibreDashboardMapPreview`

| Behavior dimension                                     | Status | Pin location                                                                                                                       |
| ------------------------------------------------------ | :----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| Single-render branch behavior (4 branches)             |   ✅   | Pass 241 four-branch lock                                                                                                          |
| Engine 3 default-flip simulation                       |   ✅   | [engine3DefaultFlipSimulation.test.tsx](../src/app/__tests__/engine3DefaultFlipSimulation.test.tsx) (Pass 245)                     |
| Reduced-motion × autoFit byte-identity (single render) |   ✅   | [engine3ReducedMotionAutoFitInteraction.test.tsx](../src/app/__tests__/engine3ReducedMotionAutoFitInteraction.test.tsx) (Pass 246) |
| Rollback rehearsal                                     |   ✅   | Pass 247                                                                                                                           |
| KI-196 default-param identity / EMPTY\_\* singletons   |   ✅   | [ki196DefaultParamStability.test.tsx](../src/app/__tests__/ki196DefaultParamStability.test.tsx) (Pass 251)                         |
| Mount/unmount churn                                    |   ✅   | [tierBPreviewLifecycle.test.tsx §1](../src/app/__tests__/tierBPreviewLifecycle.test.tsx) (Pass 254)                                |
| Repeated rerender stability                            |   ✅   | tierBPreviewLifecycle §2 (Pass 254)                                                                                                |
| Prop churn stability (autoFit=never)                   |   ✅   | tierBPreviewLifecycle §3 (Pass 254)                                                                                                |
| Dynamic shops list grow/shrink (autoFit=always)        |   ✅   | tierBPreviewLifecycle §4 (Pass 254)                                                                                                |
| Empty-state lifecycle round-trip                       |   ✅   | tierBPreviewLifecycle §5 (Pass 254)                                                                                                |
| Reduced-motion preference flip continuity              |   ✅   | [reducedMotionContinuity.test.tsx](../src/app/__tests__/reducedMotionContinuity.test.tsx) §1, §2, §3, §5 (Pass 256)                |
| Long preference-flip sequence (n > 3)                  |   ✅   | reducedMotionContinuity §5 (Pass 256)                                                                                              |
| Pin/marker rendering DOM structure                     |   🚫   | non-goal — implementation snapshot, not behavioral invariant                                                                       |
| WebGL context lifecycle                                |   🚫   | non-goal — engine-internal, jsdom cannot characterize                                                                              |
| Real MapLibre style application                        |   🚫   | non-goal — engine-internal                                                                                                         |

### Tier B host — `MapLibreServiceCoverageMap`

| Behavior dimension                                                   | Status | Pin location                                                                                               |
| -------------------------------------------------------------------- | :----: | ---------------------------------------------------------------------------------------------------------- |
| KI-196 default-param identity / EMPTY_COUNTIES / EMPTY_PARTNER_SHOPS |   ✅   | [ki196DefaultParamStability.test.tsx](../src/app/__tests__/ki196DefaultParamStability.test.tsx) (Pass 251) |
| Mount/unmount churn                                                  |   ✅   | [coverageMapLifecycle.test.tsx §1](../src/app/__tests__/coverageMapLifecycle.test.tsx) (Pass 255)          |
| Repeated rerender stability                                          |   ✅   | coverageMapLifecycle §2 (Pass 255)                                                                         |
| Counties grow/shrink                                                 |   ✅   | coverageMapLifecycle §3 (Pass 255)                                                                         |
| PartnerShops grow/shrink                                             |   ✅   | coverageMapLifecycle §4 (Pass 255)                                                                         |
| DiscoveryPlaces continuity (no leak into other lists)                |   ✅   | coverageMapLifecycle §5 (Pass 255)                                                                         |
| Empty ↔ populated round-trip (no stale residue)                     |   ✅   | coverageMapLifecycle §6 (Pass 255)                                                                         |
| Rapid prop churn (caller-driven viewport)                            |   ✅   | coverageMapLifecycle §7 (Pass 255)                                                                         |
| `interactiveLayerIds` derivation                                     |   ✅   | coverageMapLifecycle §8 (Pass 255)                                                                         |
| Repeated import stability                                            |   ✅   | coverageMapLifecycle §9 (Pass 255)                                                                         |
| `revision` bump does not perturb passthrough viewport                |   ✅   | coverageMapLifecycle §10 (Pass 255)                                                                        |
| Reduced-motion engine-boundary independence                          |   ✅   | reducedMotionContinuity §4 (Pass 256)                                                                      |
| Performance tracking (`useMapPerformanceTracking`) lifecycle         |   🟡   | indirectly exercised via §1/§2 mount cycles; no direct invariant assertion                                 |
| Follow-location controller behavior                                  |   ⬜   | not characterized — controller-internal                                                                    |
| Arrival camera effect                                                |   ⬜   | not characterized — controller-internal                                                                    |
| Active-search-target radius rendering                                |   ⬜   | not characterized — visual                                                                                 |
| Route geometry rendering                                             |   ⬜   | not characterized — visual                                                                                 |
| GPS accuracy/heading overlay                                         |   ⬜   | not characterized — visual                                                                                 |
| Tile-mode change side-effects                                        |   🟡   | passthrough verified (engine-boundary `mapStyle` reflects mode); no full-cycle invariant                   |
| WebGL context lifecycle                                              |   🚫   | non-goal — engine-internal                                                                                 |

### Test infrastructure

| Concern                                     | Status | Pin location                                                                                                 |
| ------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------ |
| Eager Supabase singleton stderr suppression |   ✅   | [vitestSetup.ts](../src/test-setup/vitestSetup.ts) supabase mock (Pass 253)                                  |
| jsdom localStorage / sessionStorage shim    |   ✅   | vitestSetup.ts storage shim (Pass 255 extension)                                                             |
| Async-warning trigger-chain documentation   |   ✅   | [asyncWarningCharacterization.test.ts](../src/app/__tests__/asyncWarningCharacterization.test.ts) (Pass 252) |
| `react-map-gl/maplibre` stub harness        |   ✅   | [mapTestHarness.ts](../src/app/test-utils/mapTestHarness.ts)                                                 |
| `prefers-reduced-motion` matchMedia stub    |   ✅   | mapTestHarness.installPrefersReducedMotion                                                                   |

---

## Remaining blind spots (in priority order)

These are gaps that future lanes could close. **None are currently authorized** — listed for visibility only.

1. **Coverage host controller-internal behavior.** `MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect`, `MapLibreViewportController` have no behavioral characterization at the React boundary. The risk is moderate — these controllers issue imperative `flyTo`/`fitBounds`/`jumpTo` calls; a regression in their effect dependency arrays would silently degrade map behavior on selection / route change / arrival.
2. **Performance tracking lifecycle invariants.** `useMapPerformanceTracking` is exercised indirectly by Pass 255 §1/§2 (the mount/unmount cycles would crash if the hook regressed), but no assertion targets it directly. A direct invariant test would pin: sample-recording on zoom/move events, sample-window correctness across renders, persisted-state round-trip integrity.
3. **Visual-layer rendering invariants.** Route geometry, GPS overlays, search-target radius, and active-search-target rendering are uncharacterized. These are visual concerns that resist behavioral assertion, but a stable layer-presence assertion (which layer IDs are mounted under which conditions) is feasible.
4. **Tile-mode full-cycle invariants.** `tileMode` passthrough is verified, but mode-change side-effects (style swap, label visibility, dark/light atmosphere) are not pinned at the engine boundary.

---

## Intentional non-goals

These are explicitly **not** in scope for any confidence lane and should not be added without owner authorization:

- **WebGL / GPU lifecycle assertions.** jsdom cannot host WebGL; characterization at this layer requires Playwright + real browser. Out of scope.
- **MapLibre style-application correctness.** Engine-internal. Out of scope.
- **DOM structure / CSS class snapshots.** These are implementation snapshots, not behavioral invariants. Forbidden by lane discipline.
- **Pin/marker visual fidelity.** Visual; resists behavioral assertion. Out of scope until visual-regression infrastructure exists.
- **Real Supabase / Clerk / Realtime integration tests.** Auth + storage invariants are protected at the L4 edge-function layer; characterization at the React boundary is duplicative. Out of scope.
- **`autoFit` / `callerBoundsExplicit` semantic changes.** These are LOCKED by Pass 241 + Pass 245 + Pass 246 + Pass 254. They can be characterized further but **never** modified inside a confidence lane.
- **`ShopMapWidget` characterization.** Owner-dirty surface — no test or source touch without explicit authorization.
- **`sub-pass C` files.** Owner-protected — no touch without explicit authorization.

---

## STOP certification

This lane (Passes 255 / 256 / 257) **did not** introduce any:

- runtime semantic changes
- source file modifications (outside `src/test-setup/vitestSetup.ts`, which is test-env only)
- motion / animation / timing changes
- viewport authority changes
- `autoFit` / `callerBoundsExplicit` changes
- `ShopMapWidget` changes
- `services/supabase/client.ts` production runtime changes
- orchestration / shell / routing changes
- broad refactors

Any future lane that proposes any of the above must claim its own authorization and is not covered by this confidence baseline.

**Net delivery, Coverage Map Confidence Expansion lane:**

| Pass | Deliverable                                       | Tests added | Suite total | Stderr |
| ---- | ------------------------------------------------- | :---------: | :---------: | :----: |
| 255  | jsdom storage shim + coverage map lifecycle suite |     +11     |   922/922   |   0    |
| 256  | reduced-motion continuity characterization        |     +5      |   927/927   |   0    |
| 257  | this consolidation doc                            |      0      |   927/927   |   0    |

Cumulative across the entire Tier B confidence arc (Passes 251 → 257): **+34 tests, 0 stderr errors, 0 source semantic changes, 0 forbidden surfaces touched.**

---

## Forward constraints — Persistent Map Session (PMS) lane

The owner has authorized a forthcoming **Persistent Map Session** feature lane (planning + build, separate from this confidence lane). It will extract a single MapLibre instance to the app shell, share map session state across landing/dashboard surfaces, and add a reports-preview → fullscreen handoff.

**This confidence baseline imposes the following constraints on the PMS lane:**

1. **Tier B preview branch semantics are LOCKED.** PMS may NOT alter `autoFit` modes, `callerBoundsExplicit` gates, the four single-render branches, or the byte-identity contract under reduced-motion. If PMS unifies preview and host, the unified surface MUST produce viewports byte-identical to the current preview for every `(autoFit, callerBoundsExplicit, shops, reduced-motion)` tuple covered by Passes 241 / 245 / 246 / 254.
2. **Reduced-motion preference-flip continuity is LOCKED.** PMS may NOT introduce preference-dependent host-side viewport behavior. The Pass 256 invariants (§1–§5) must hold for any unified or refactored Tier B surface.
3. **`EMPTY_*` singleton identity is LOCKED.** PMS may NOT replace the module-scope singletons with per-render literals. The Pass 251 + Pass 254 + Pass 255 identity tests will catch this.
4. **Engine-boundary contract at `MapEngineCanvas` is OBSERVED.** PMS may extend the contract (add new props) but may NOT remove existing props the host hands down without first updating Pass 255 §3–§8 + §10. Test changes and source changes must land in the same commit.
5. **Performance tracking lifetime semantics will change under PMS.** Currently `useMapPerformanceTracking` resets on host unmount; under PMS the host stays mounted across route changes, so the performance window becomes session-scoped. This is acceptable but must be documented in the PMS lane's REF doc, and Pass 255 §1 mount/unmount churn assertions must be re-evaluated against the new lifetime.
6. **Cooperative gestures contract becomes a state toggle under PMS.** Currently `cooperativeGestures: !immersiveFullscreen` is host-mount-derived; under PMS it becomes route-state-derived. The PMS lane must add a behavioral test that asserts the gesture mode reflects the current route's intent, not the previous route's residue.
7. **Performance directive (owner add-on, 2026-05-09):** "Make site performance fast and stable as you build this out in autopilot." The PMS lane charter must include explicit performance gates: (a) no regressions in Lighthouse perf scores on landing / dashboard / reports routes; (b) MapLibre instance count must remain at 1 across route changes; (c) WebGL context creation count must drop to ≤ 1 per session; (d) navigation between map-bearing routes must complete without re-initializing the map. These gates should be added to the PMS lane's verification protocol.

---

## Future recommended lanes (not currently authorized)

When capacity allows and PMS has shipped, candidate confidence lanes in priority order:

1. **Coverage controller behavioral characterization** — pin `MapLibreViewportController`, `MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect` at the React boundary.
2. **Performance tracking direct invariants** — pin `useMapPerformanceTracking` sample-recording, window correctness, persisted-state round-trip.
3. **Visual layer presence invariants** — assert which layer IDs mount under which (route geometry, GPS overlays, search target) conditions, without asserting visual fidelity.
4. **Tile-mode full-cycle invariants** — pin engine-boundary side-effects of `tileMode` changes.
5. **Skill lift** — the pattern "eager-singleton + jsdom storage gap suppression in `vitestSetup.ts`" is general enough to lift into `~/.claude/skills/vitest-environment-shims/` if it recurs in future projects.

None of these are authorized today. Each requires explicit owner authorization in its own lane.

---

## Cross-references

- [`docs/LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — project law (governs all work)
- [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — four-layer model
- [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon, reduced-motion contract
- [`docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) — Engine 3 camera authority semantics
- [`docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — Tier B / engine seam inventory
- [`docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md`](REF_MAP_MOTION_CONTRACT_2026-05-09.md) — reduced-motion inheritance rule
- [`docs/REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md`](REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md) — historical coverage gap analysis (predecessor to this matrix)
- [`docs/PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — Step C unification plan
- [`AI_LOCK.md`](../AI_LOCK.md) — current multi-AI session coordination state
