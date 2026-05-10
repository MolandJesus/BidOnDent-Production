---
status: CANONICAL
authority: REFERENCE
scope: map-runtime-test-infrastructure
canonical_source_of_truth: REF_MAP_TEST_HARNESS_STRATEGY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: Strategy + canonical mock-layer design for the map runtime test harness that the Block-D execution-safe sequence (passes 231e–231j) will implement. Test-infra only; no production runtime impact.
last_updated: 2026-05-09
---

# Map Runtime Test Harness Strategy (Pass 231f)

> Block D / Pass 231f deliverable. Read-only strategy doc. No source
> changes in this pass. Pass 231e (Builder AI 2) is delivering the
> harness implementation in parallel; this doc names KI→pass mapping,
> per-pass sequencing, the explicit out-of-scope boundary, and locks
> the `autoFit` contract test recipe before the Phase 1 prop lands.
>
> **Authority:** REFERENCE. Safe-for-autopilot test infrastructure
> ladder. Defines the shared-mock layer and test-utility surface that
> the engine, orchestration-host, surface, and invariant-enforcement
> tests all build on.
>
> **Inputs:**
>
> - [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) §3 (lifecycle obligations) + §5.2 (required validations)
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) §2.1–§2.3 (per-engine contract)
> - [`REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md`](REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md) §2 (gap matrix) + §3 (phase requirements)
> - [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) KI-181, KI-187 → KI-191 (the OPEN test-coverage + invariant-enforcement KIs this strategy resolves)

---

## §1. What this strategy resolves

Five OPEN KIs that LAW + Phase 1 cannot ship safely without:

| KI         | Severity                | What it asks for                                                                         | This strategy answers via                                                          |
| ---------- | ----------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| KI-187     | P1-TEST-COVERAGE        | Mount/unmount + `onLoad`/`onError` test coverage on all 3 engines                        | Shared `<Map>` stub (§3.1) + lifecycle probe utility (§3.4) + Engine 2/3 tests     |
| KI-188     | P1-TEST-COVERAGE        | Orchestration-host coverage (Host A/B)                                                   | Out of scope here (hook composition is its own concern); strategy notes hand-off  |
| KI-189     | P2-TEST-COVERAGE        | Surface-level mount tests across the 8 map-bearing surfaces                              | Surface-test recipe (§4) reusing the harness                                       |
| KI-190     | P2-INVARIANT-NOT-ENFORCED | CI assertion that `maplibreResizePatch` runs before any `<Map>` mount                    | Resize-patch invariant probe (§3.5)                                                |
| KI-191     | P2-INVARIANT-NOT-ENFORCED | `prefers-reduced-motion` contract enforced in CI, not just in `audit-reduced-motion.mjs` | Reduced-motion test helper + Vitest promotion of the script's checks (§3.6 + §5.3) |
| KI-181     | P2-HIDDEN-AUTHORITY     | Engine 3 `autoFit` prop must have observable, contract-locked behavior                   | `autoFit` contract test recipe (§5.4)                                              |

This is a **test-infrastructure-only** strategy. Nothing here proposes
a production runtime change. Per Block D execution-safe authorization,
that is the entire scope.

---

## §2. Existing test inventory (audited 2026-05-09)

Two map-specific test files exist:

| File                                                                                                        | What it tests                                            | Mock pattern                                  |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| [`src/app/components/maps/useMapEngineGeoJSON.test.tsx`](../src/app/components/maps/useMapEngineGeoJSON.test.tsx)         | Hook output shape + coordinate-swap behavior (Pass 186)  | None — hook is pure data                      |
| [`src/app/components/maps/engine/MapEngineCanvas.test.tsx`](../src/app/components/maps/engine/MapEngineCanvas.test.tsx) | Engine 1 render + prop-passthrough contract (Pass 193)   | **Inline** `vi.mock` for `react-map-gl/maplibre`, the three controllers, and `MapLibreCoverageMapLayers` |

Confirmed via `grep -rln "vi.mock" src/app/components/maps/ src/app/components/dashboard/` — only the second file uses module mocks. There is **no shared mock module** today.

**Implication:** if Engines 2 and 3 each get tests written from scratch, three independent inline-mock blocks for `react-map-gl/maplibre` will diverge over time. The Pass 192/193 lesson is the contract value comes from the *shape* — duplicated mocks erode the shape.

The shared mock layer (§3) is therefore a strict prerequisite to the
KI-187 fix passes, not an independent nice-to-have.

---

## §3. Canonical mock layer (the harness)

### 3.1 Folder layout (Pass 231e implementation, audited 2026-05-09)

The actual harness lives at `src/app/test-utils/mapTestHarness.ts`
(single file, ~220 lines, Pass 231e in flight). Folder location chosen
over the alternate `src/app/components/maps/__test-utils__/` path
because the harness is consumed across `components/maps/`,
`components/dashboard/`, `components/shop/`, and any future
map-bearing surface — keeping it shell-agnostic at `app/test-utils/`
prevents an artificial map-folder coupling.

The harness exports:

| Export                                       | Role                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mockReactMapGlMaplibre()`                   | Stub `<Map>`, `AttributionControl`, `NavigationControl`, `Source`, `Layer`, `Marker`, `Popup`, `useMap()`. `<Map>` fires `onLoad` via microtask. |
| `mockMaplibreCss()` / `mockMaplibreResizePatch()` | Silence the side-effect imports                                                                                                |
| `installPrefersReducedMotion(reduce)`        | jsdom `matchMedia` stub — returns teardown fn                                                                                   |
| `viewportFixtures`                           | `continentalUS` / `bayArea` / `singlePinTight` / `metroFit`                                                                     |
| `assertResizePatchSideEffectObserved()`      | KI-190 invariant assertion — checks `window.__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` was already true at call time                |
| `resetResizePatchMarker()`                   | Clean-slate helper for invariant tests                                                                                          |

What is **not** in this strategy's "shared mock layer" but the strategy
still tracks (for follow-up passes):

- Controller stub layer (Engine 1's three controllers + Engine 2's
  viewport manager) — currently not yet in the harness; Pass 231f+
  Engine 1 tests stub these inline (per `MapEngineCanvas.test.tsx`).
  Promotion can happen lazily once a second consumer needs them.
- Layer stub layer (MapLibreCoverageMapLayers / shop layers) — same
  rationale; promote when a second consumer arrives.
- Lifecycle probe (`MutationObserver`-based) — not yet in harness;
  Pass 231g (Engine 2 mount/unmount) is the first test that will
  require it. Strategy: ship the probe inline in the first consumer
  test, promote to harness when a second consumer arrives.

This "promote on second use" rule mirrors the existing `bd-design-identity`
discipline (memory feedback) — avoid premature framework expansion. The
harness already covers what KI-190 + KI-191 + Engine 3 `autoFit` need;
the rest is gated on actual second-use evidence.

### 3.2 `<Map>` stub contract (the hot path)

The stub must satisfy three callers (Engine 1 / 2 / 3) without
duplicating their concerns. Required surface:

| Prop / behavior                                                                                                                                                           | Why                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Renders children inside a `<div data-testid="stub-map">`                                                                                                                  | Engine 1 + 2 + 3 all child-mount controls                                                           |
| Forwards `id`, `mapStyle`, `cooperativeGestures`, gesture flags as `data-*` attributes                                                                                    | Engine 3 disables every gesture; tests must observe                                                  |
| Calls `onLoad?.({ target: stubMapInstance })` synchronously after mount unless `simulateLoadFailure` is set in test scope                                                 | Engine 2 has `onLoad`/`onError` paths to test                                                        |
| Calls `onError?.(stubError)` synchronously when `simulateLoadFailure` is set                                                                                              | Engine 2 / future Engine 1 lifecycle gap (KI-184)                                                   |
| Calls `onZoomStart` / `onZoomEnd` / `onMoveStart` / `onMoveEnd` / `onZoom` via test-driven helpers                                                                        | Performance tracking exercised in Engine 1                                                          |
| Stub `useMap()` exposes a `flyTo` / `fitBounds` / `jumpTo` / `getZoom` mock the test can `expect(...).toHaveBeenCalledWith(...)`                                          | Engine 2 controllers + Engine 3 viewport drive imperative mutation                                   |
| Provides a `__test_state` global lookup keyed by `id`                                                                                                                     | Lets a test that owns the wrapper read controller state without prop-drilling                       |

The stub does **NOT** simulate WebGL, tile loading, source/layer
registration, or projection math. Tests that need those must run
separately (E2E / Playwright); the unit/contract tier defines them as
out of scope.

### 3.3 Controller stub contract

`mapLibreControllers.tsx` exports four declarative controllers (the
Engine 1 lifecycle pattern). The stub re-exports them with the same
names but as observation-only React components that emit
`data-testid="stub-<controller>"` and forward critical props as
`data-*` attributes.

This mirrors what `MapEngineCanvas.test.tsx` already does inline; the
shared module just removes the duplication. Engine 2's
`MapLibreShopDirectoryViewportManager` (which uses `useMap()` +
imperative `flyTo`) is the harder case — its tests will need a
`useMap()` spy from the `<Map>` stub (§3.2 last row), not a controller stub.

### 3.4 Lifecycle probe (`lifecycleProbe.ts`)

A test-only utility that returns:

```ts
type LifecycleProbe = {
  mountCount: number;
  unmountCount: number;
  loadFireCount: number;
  errorFireCount: number;
  observe(node: HTMLElement | null): void;
  reset(): void;
};
```

The probe is fed via `MutationObserver` in the test setup so a single
helper can verify mount/unmount across any harness call. This is the
shared affordance that KI-187 needs to be ticked off across all three
engines without per-test boilerplate.

### 3.5 Resize-patch invariant probe (`resizePatchProbe.ts`)

KI-190 asks for CI enforcement. Strategy:

1. The probe imports a sentinel exported by `maplibreResizePatch` itself
   (an idempotent flag toggle). If the sentinel is `false` at the
   moment any engine module is imported, the probe `throw`s.
2. A dedicated `resizePatch.invariant.test.ts` imports each engine
   module in isolation (Vitest module isolation) and asserts the
   sentinel was already true. If the engine forgets the import, this
   test fails before any rendering happens.
3. The patch file gets a tiny one-line export to expose the sentinel.
   That is the *only* production-side change Phase 0 requires; all
   other phases ship test-only.

Sentinel approach is preferred over snapshotting `maplibre-gl`
internals because the snapshot would couple to the upstream API.

### 3.6 Reduced-motion helper (`reducedMotion.ts`)

LAW contract §3.6 + KI-191. Strategy:

1. `reducedMotion.ts` exports `mockPrefersReducedMotion(value: boolean)`
   that swaps `window.matchMedia` with a stub returning `{ matches: value, addEventListener, removeEventListener }`.
2. Tests call it in `beforeEach` to pin the media query value.
3. `reducedMotion.invariant.test.ts` (Pass 231j) re-runs every camera
   transition test once with `mockPrefersReducedMotion(true)` and
   asserts that no animated camera call (`flyTo` with non-zero
   `duration`, `easeTo`, `panTo` with `duration`) fires. Engine 2's
   imperative `flyTo` calls (KI-180) will fail this — that's the
   point. The failure becomes the convergence-pass forcing function,
   not a silent regression.
4. The `audit-reduced-motion.mjs` script's CSS-side checks (KI-139)
   are orthogonal and stay where they are; this Vitest test covers
   the camera-side gap KI-191 names.

### 3.7 Viewport fixture (`viewportFixture.ts`)

Six canonical `[center, zoom, revision]` triples covering: world,
country-level, region-level, city-level, navigation-level, arrival.
Used by Engine 1/2 controller tests so revision-bump behavior is
exercised against the same coordinate corners every pass. Eliminates
the "test passes locally because zoom 10 happens to produce a valid
bbox" failure mode.

---

## §4. Surface-test recipe (KI-189)

For each of the 8 map-bearing surfaces, a single small test file:

```ts
// pattern (per surface):
//   1. Mount the surface with minimum required props (mocked services).
//   2. Assert the stub-map data-testid is in the document.
//   3. Assert the surface declares its tier (Tier B/C surfaces will
//      do this via a `tier` prop in Phase 1; Tier A surfaces can
//      assert the canonical engine ID is present).
//   4. Unmount and assert the lifecycle probe sees a clean tear-down.
```

Surface tests do not exercise interaction beyond mount/unmount. They
catch tier-classification mistakes and prop-wiring breakage. They do
not replace E2E tests for actual user flows.

---

## §5. Pass sequencing (Pass 231e onward)

The harness ships in a deliberate order so each pass can land green
without waiting on the next. Pass numbers leave 232–235 reserved for
the Phase 1 production sequence (`PLAN_MAP_CONVERGENCE_SEQUENCE` §3.1)
and use the `231<letter>` slot the way 231a–231c already did.

| Pass  | Scope                                                              | KI ticked      | Production change?                                          | Risk | Status                |
| ----- | ------------------------------------------------------------------ | -------------- | ----------------------------------------------------------- | ---- | --------------------- |
| 231d  | Motion + transition contract audit                                 | —              | None                                                        | none | LANDED (`366c2a66`)   |
| 231e  | `src/app/test-utils/mapTestHarness.ts` — shared mock layer (§3.1)  | KI-187 prep    | None                                                        | low  | IN FLIGHT (Builder 2) |
| 231f  | This strategy doc                                                  | —              | None                                                        | none | THIS PASS             |
| 231g  | Engine 3 mount/unmount + `autoFit` contract tests (§5.4)           | KI-187, KI-181 | None                                                        | low  | next                  |
| 231h  | Engine 2 mount/unmount + failure-surface tests                     | KI-187 (Eng 2) | None                                                        | low  | queued                |
| 231i  | Resize-patch sentinel-export + KI-190 invariant test (§3.5)        | KI-190         | One line in `maplibreResizePatch` (sentinel export)         | low  | queued                |
| 231j  | Camera-transition reduced-motion conformance tests (§3.6)          | KI-191         | None                                                        | low  | queued                |
| 231k  | Reduced-motion invariant test promoted from `audit-reduced-motion` | KI-191 (CSS)   | None                                                        | low  | queued                |

Each pass is independently revertable. None modifies a controller, an
engine, or a surface — only adds tests + the one-line resize-patch
sentinel.

### 5.4 Engine 3 `autoFit` contract test recipe (KI-181)

`MapLibreDashboardMapPreview`'s caller-supplied `center`/`zoom` is
silently overridden by an internal `fittedView` whenever ≥2 shops
exist. KI-181 asks for the fix to expose `autoFit: 'always' |
'when-no-caller-bounds' | 'never'`. This strategy locks the test
shape **before** the prop ships:

```ts
describe("MapLibreDashboardMapPreview autoFit", () => {
  it("'always': fitted bbox wins over caller [center, zoom] when ≥2 shops", () => {});
  it("'when-no-caller-bounds' (default): caller's center/zoom wins when supplied; fitted bbox wins when both are nullish", () => {});
  it("'never': caller's center/zoom always wins, fitted bbox is ignored", () => {});
});
```

The Phase 1 production pass that adds the prop (per
`PLAN_MAP_CONVERGENCE_SEQUENCE` §3.1) will run against this test
contract — the prop's behavior is fixed by the test before the
implementation lands. Same discipline as Pass 186 → Pass 192/193 for
Engine 1.

---

## §6. Out of scope

This strategy explicitly does **NOT** address:

- **KI-188 (orchestration host coverage).** Host A/B tests are a
  hook-composition concern, not an engine concern. They share the
  reduced-motion helper from §3.6 but otherwise need their own
  strategy doc (proposed Pass 231k+ if Block D authorizes).
- **Live navigation E2E.** Voice fire, toast fire, wake-lock
  acquisition, cloud session restore (LAW contract §5.2) are E2E
  concerns that need a Playwright harness. Out of scope for the unit
  tier.
- **MapLibre projection math / tile loading correctness.** Those are
  upstream-library concerns. We assert against React-side wiring, not
  WebGL.
- **Visual regression diffs.** Those need a screenshot pipeline; the
  unit tier is class-name + prop-passthrough only.

---

## §7. Risk + revertability

Every pass listed in §5 is:

- **Test-only** except 231h's one-line sentinel export. That export is
  additive and behaviorally inert — removing it only breaks the
  invariant test, not any production path.
- **Independently revertable.** No pass depends on a later pass's
  artifact.
- **Below the LAW §5.4 hard-stop bar.** None changes a tier
  classification, removes a navigation runtime capability, modifies
  the camera-authority model, or touches an owner-dirty file.

This is precisely the scope ChatGPT-relayed authorization (Block D
execution-safe) names as approved.

---

## §8. Status

- **Drafted:** 2026-05-09 (Pass 231f).
- **Status:** ACTIVE strategy. Pass 231e harness implementation in
  flight; Pass 231g (Engine 3 mount + `autoFit`) is the next implementation pass against this strategy.
- **Authority:** REFERENCE. Subordinate to `LAW_MAP_RENDERER_CONTRACT`.
- **Owner approval required:** false (test-infrastructure scope).
- **Supersedes:** none.
- **Superseded by:** none.

---

## §9. Coordination notes (2026-05-09)

- This pass is non-conflicting with Builder AI 2's in-flight Pass 231e
  (the harness file at `src/app/test-utils/mapTestHarness.ts`). The
  strategy doc only **references** that file; it does not modify it.
- Pass numbering avoids the production block 232–235 reserved by
  `PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md` §3.1 (Phase 1 Tier B/C
  alignment). All test-infrastructure passes stay inside the `231<letter>`
  range.
- Owner-dirty docs at the time of writing (`PLAN_MAP_UNIFICATION`,
  `LAW_PROJECT_RULES`, `CLAUDE.md`, several REF docs in the new
  block-D dispatch packet, plus `COWORK_GLOBAL_INSTRUCTIONS.md`) were
  not touched in this pass per AI_LOCK rule 5.
