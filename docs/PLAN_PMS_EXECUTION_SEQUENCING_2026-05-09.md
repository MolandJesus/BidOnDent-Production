---
status: ACTIVE
authority: PLAN
scope: persistent-map-session-planning
canonical_source_of_truth: PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Pass 260 of the PMS planning lane. Phased execution-sequencing blueprint for the Pass 259 recommendation (O6/O1 hybrid persistence in location (d), MapSessionProvider between Clerk and App). Decomposes the implementation into 7 reversible phases (Phase 0 pre-instrumentation through Phase 6 verification + ship), each with success criterion, CI gate, owner approval point, and rollback shape. Doc-only — no source touched. This plan is the implementation runbook the eventual PMS build lane will execute against AFTER owner authorizes Pass 259's recommendation.
last_updated: 2026-05-09
---

# PMS Execution Sequencing Plan — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 260 of the PMS Planning lane (owner-authorized
> 2026-05-09).
>
> **Companion docs (siblings in this lane):**
>
> - [`PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md`](PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md) — Pass 258 substrate
> - [`PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md`](PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md) — Pass 259 decision matrix (the recommendation this plan sequences)
> - [`REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md`](REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md) — Pass 261 measurement methodology
>
> **This pass:** doc-only. Sequences the Pass 259 recommendation
> into a phased implementation order. **Implementation may NOT
> begin without explicit owner authorization** of Pass 259's §5
> recommendation. This plan describes *how* to execute, not *that*
> we will execute.
>
> **Lane discipline (unchanged):** characterization/planning only.
> If behavior could plausibly change, STOP and characterize instead
> of modifying.

---

## §1 — Mission

Decompose the Pass 259 recommended option (O6 hybrid persistence,
E1 sub-pattern O1, location (d) `MapSessionProvider` between
Clerk and `App`) into seven implementation phases. Each phase:

- has **one well-defined deliverable**,
- is **independently reversible**,
- carries **explicit CI gates** (existing tests + new tests),
- carries **measurement gates** that anchor to the four
  performance gates G1-G4 (Pass 257 §163, Pass 261 §2),
- terminates at an **owner approval point** before the next
  phase begins.

The plan is conservative by design: many small, reviewable steps
each preserving the option to abort.

---

## §2 — Phase overview

| Phase | Title                                           | Layer          | Files added           | Files modified         | Reversibility      | Owner gate before next phase  |
| ----- | ----------------------------------------------- | -------------- | --------------------- | ---------------------- | ------------------ | ------------------------------ |
| 0     | Pre-implementation instrumentation               | L3 + L4 + CI   | counter utilities + perf marks helper | App shell + engines | TRIVIAL revert     | Lighthouse baseline captured + 4 counters wired |
| 1     | `MapSessionProvider` scaffold (engine-less)      | L2/L3          | `MapSessionProvider.tsx` | `App.tsx` (one mount line) | TRIVIAL revert | Provider renders + zero CI regressions |
| 2     | Engine lift into the provider                    | L2/L3          | none                  | `MapSessionProvider.tsx` (engine added) | TRIVIAL revert (re-emptying provider) | Engine renders inside provider; prior call sites still work pre-Phase 3 |
| 3     | Slot-consumer rollout for E1 call sites          | L2             | `CoverageMapSlot.tsx` | 3 E1 call-site files   | OK revert (3 file restores) | Each E1 call site behavior is byte-identical |
| 4     | Imperative controller re-keying (Pass 258 §9)    | L2             | none                  | `mapLibreControllers.tsx` (4 controller bodies) | OK revert (one file) | Controller tests + new `routeActiveAt` tests green |
| 5     | Performance-tracking lifetime resolution          | L3 + L4        | none (tests only)     | `useMapPerformanceTracking.ts` + `mapPerformance.ts` + `PlannerDiagnosticsPanel.tsx` + `CoverageNavigationPlanner.tsx` | OK revert (4 files) | Diagnostics consumers display correctly under PMS |
| 6     | Auth-flip cleanup + verification ship gate        | L2 + verify    | tests only            | `MapSessionProvider.tsx` (cleanup useEffect) | TRIVIAL revert | All four gates G1-G4 measurable + within budget |

**Total scope:** ~8-12 source files modified + 2-3 new files +
~30-50 new tests. No LAW changes. No REF rewrites. No KI
introductions. No owner-dirty file edits. No Engine 2 work.

**Phase ordering rationale:** Phase 0 establishes measurement
*before* implementation so regressions are detectable from
Phase 1 onward. Phases 1+2 are split (provider scaffold vs
engine lift) to keep each commit reviewable. Phase 3 is the
behavioral shift (call sites switch to slots); it sits AFTER
the engine works inside the provider so the test surface is
already established. Phases 4-5 address the documented PMS
forward constraints (Pass 258 §8, §9). Phase 6 is the
verification gate.

---

## §3 — Phase 0: Pre-implementation instrumentation

### §3.1 Goals

- Capture Lighthouse baseline scores (G1) for landing /
  dashboard / reports routes against the current build, without
  any PMS code.
- Wire dev-only counters for MapLibre instances (G2) and
  WebGL contexts (G3) per Pass 261 §7.2-§7.3.
- Wire Performance API marks at engine mount, engine dispose,
  route enter, route leave (G4) per Pass 261 §7.4.

### §3.2 Files added

| Path                                                    | Role                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app/utils/devMapInstanceCounter.ts`                | Dev/test-only constructor wrap; exposes `window.__bdMapInstanceCount` (dev/test only).      |
| `src/app/utils/devGlContextCounter.ts`                  | Dev/test-only `getContext` patch; exposes `window.__bdGlContextLog`.                        |
| `src/app/utils/perfMarks.ts`                            | `markEngineMount()`, `markEngineDispose()`, `markRouteEnter()`, `markRouteLeave()` helpers. |

### §3.3 Files modified

- `src/main.tsx` — import the dev counters at the top (dev/test
  build only).
- `src/app/components/maps/engine/MapEngineCanvas.tsx` — add
  `markEngineMount()` / `markEngineDispose()` calls. Same for
  `MapLibreShopDirectoryMapPane` and
  `MapLibreDashboardMapPreview`.
- `src/app/components/app/AppShell.tsx` — add `markRouteEnter`
  / `markRouteLeave` calls in the route-dispatch boundary.

### §3.4 Tests added

- `src/app/__tests__/devMapInstanceCounter.test.ts` — verifies
  counter increments on construct, decrements on dispose, and
  is dead-code in production builds.
- `src/app/__tests__/perfMarksContract.test.ts` — verifies the
  four marks fire at the expected boundary points.

### §3.5 Success criterion

- `npm run build` succeeds.
- Suite passes (target: 927+ → 927+ + new tests, depending on
  exact count).
- Lighthouse against `/`, `/dashboard`, `/reports` produces
  baseline numbers persisted to the PR description (or to
  `REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md` §10 as a
  baseline data block).

### §3.6 CI gate

- Existing suite passes unchanged (counters don't ship to prod).
- New tests pass.
- Build succeeds.

### §3.7 Rollback shape

TRIVIAL — three new files deleted; ~15 lines removed from three
existing files. ~30 minutes of revert.

### §3.8 Owner approval gate before Phase 1

Owner signs off on the captured baseline numbers; confirms PMS
implementation is authorized to proceed.

---

## §4 — Phase 1: `MapSessionProvider` scaffold (engine-less)

### §4.1 Goals

- Introduce the new architectural seam (the
  `MapSessionProvider` component + its context) without
  actually moving any engine into it.
- Provider returns `{ children }` plus an empty context value;
  the engine arrives in Phase 2.

### §4.2 Files added

| Path                                                       | Role                                                                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/components/maps/MapSessionProvider.tsx`           | Provider component. **First import line:** `import "../../utils/maplibreResizePatch";` (per Pass 259 §6 #1).                       |
| `src/app/components/maps/mapSessionContext.ts`             | Context type + default-value (everything `null` / no-op).                                                                            |
| `src/app/__tests__/mapSessionProviderScaffold.test.tsx`    | Unit tests: provider renders children, context default is the no-op shape, provider unmounts cleanly.                                |

### §4.3 Files modified

- `src/app/App.tsx` — wrap the authenticated tree in
  `<MapSessionProvider>`. One import + one mount line.

### §4.4 Tests added

Above (§4.2 third row).

### §4.5 Success criterion

- All existing tests pass unchanged.
- New scaffold tests pass.
- The app behaves identically to pre-Phase-1 (provider is a
  no-op pass-through).

### §4.6 CI gate

- Suite green.
- No instance counter changes (engine still mounts at the
  legacy call sites; instance count unchanged).

### §4.7 Rollback shape

TRIVIAL — delete two new files; remove the wrapper from
`App.tsx`. ~10 minutes.

### §4.8 Owner approval gate before Phase 2

Owner reviews the provider API shape (the context type) and
approves moving the engine into it.

---

## §5 — Phase 2: Engine lift into the provider

### §5.1 Goals

- Move E1's `<MapEngineCanvas>` mount into
  `MapSessionProvider` so a single instance lives at the app
  shell.
- The legacy call sites (Pass 258 §2.1: three E1 call sites)
  still mount their own E1 engines as well — both coexist
  during this phase. The dev instance counter will read 2 or
  more during navigation through E1 routes; that's expected.
  Phase 3 cuts the legacy mounts.

### §5.2 Files added

None.

### §5.3 Files modified

- `src/app/components/maps/MapSessionProvider.tsx` — the
  engine `<MapEngineCanvas>` is mounted inside the provider's
  off-screen container; context exposes the engine's `mapRef`
  (or equivalent stable handle).
- (Optional) one `style` line on the provider's container to
  position the engine off-screen until consumers register a
  visible slot.

### §5.4 Tests added

- `src/app/__tests__/mapSessionEngineLift.test.tsx` — verifies
  the provider mounts exactly one engine; instance counter
  reaches 1 from the provider's mount alone (no slot consumers
  yet).

### §5.5 Success criterion

- All existing tests pass.
- New engine-lift tests pass.
- During real-app navigation:
  - Routes that use E1 still work (legacy mounts coexist).
  - Routes that don't use E1 carry the provider's E1 instance
    silently (off-screen).
- Instance counter reads N+1 during E1 routes (legacy + provider).

### §5.6 CI gate

- Suite green.
- New tests confirm exactly one provider-engine.

### §5.7 Rollback shape

TRIVIAL — re-empty the provider. ~5 minutes.

### §5.8 Owner approval gate before Phase 3

Owner reviews provider's runtime behavior (off-screen instance
healthy, no regressions in legacy routes) and approves cutting
the legacy mounts.

---

## §6 — Phase 3: Slot-consumer rollout for E1 call sites

### §6.1 Goals

- Replace each E1 call site's `<MapLibreServiceCoverageMap>`
  with a new `<CoverageMapSlot>` that proxies into the
  provider's persistent engine.
- After this phase, instance count for E1-bearing routes drops
  to 1.

### §6.2 Files added

| Path                                                     | Role                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/app/components/maps/CoverageMapSlot.tsx`            | Reads `MapSessionProvider` context; positions the persistent engine into the slot's location; forwards the props the legacy `<MapLibreServiceCoverageMap>` accepted. |
| `src/app/__tests__/coverageMapSlotContract.test.tsx`     | Verifies: (a) slot renders without mounting a new engine; (b) viewport prop changes propagate; (c) two simultaneous slots can't both be visible (single-engine constraint). |

### §6.3 Files modified

- `src/app/components/landing/OperatingRegionsSection.tsx` —
  replace `<MapLibreServiceCoverageMap>` with `<CoverageMapSlot>`.
- `src/app/components/landing/CoverageBrowseExperience.tsx` —
  same.
- `src/app/components/landing/CoverageActiveNavigationLayout.tsx` —
  same.

### §6.4 Tests added

Above (§6.2 second row).

### §6.5 Success criterion

- Each call site's behavior is **byte-identical** to its
  pre-Phase-3 behavior. Visual regression: none. Layer
  composition: identical. Viewport response: identical.
- Instance counter reads exactly 1 across all E1-bearing route
  navigations.
- GL context counter reads exactly 1 per session.
- Performance API marks confirm zero `engine:dispose`/`engine:mount`
  pairs during E1↔E1 route changes (Phase 3 satisfies G4 for E1).

### §6.6 CI gate

- Suite green.
- New slot-contract tests pass.
- Three new visual-equivalence tests (per call site) pass.

### §6.7 Rollback shape

OK — delete `CoverageMapSlot.tsx`; restore the three call
sites' `<MapLibreServiceCoverageMap>` mounts. ~30 minutes
mechanical revert; the slot file has no dependents outside the
three call sites.

### §6.8 Owner approval gate before Phase 4

Owner reviews:
- screenshots of all three E1 routes (pre vs post-Phase-3),
- instance counter logs across a typical session,
- Performance API marks confirming G4 for E1.

If all match, Phase 4 is authorized.

---

## §7 — Phase 4: Imperative controller re-keying (Pass 258 §9)

### §7.1 Goals

- Update the four imperative camera controllers in
  `mapLibreControllers.tsx` to derive their "first-mount" /
  "first-active" semantics from the provider's `routeActiveAt`
  context value instead of React mount timing.
- This addresses Pass 258 §9 risk: under PMS the controllers'
  effect-deps semantics shift; explicit re-keying makes the
  shift intentional.

### §7.2 Files added

None.

### §7.3 Files modified

- `src/app/components/maps/mapLibreControllers.tsx` — four
  controller bodies updated:
  - `MapLibreViewportController` — first-call vs subsequent
    keyed on `routeActiveAt` not React mount.
  - `MapLibreFollowLocationController` — guidance entry/exit
    bearing/pitch reset keyed on `routeActiveAt`.
  - `MapLibreArrivalCameraEffect` — one-shot becomes one-shot
    per `routeActiveAt`.
  - `MapLibreRouteFitController` — unchanged behavior (already
    `routeFitKey`-keyed); added a comment confirming PMS
    compatibility.

### §7.4 Tests added

- `src/app/__tests__/mapLibreControllersRouteActiveAt.test.tsx` — for each controller:
  - asserts the existing-keyed behavior still works,
  - asserts the new `routeActiveAt`-keyed behavior fires on
    route changes when the engine is persistent.

### §7.5 Success criterion

- Existing controller tests pass.
- New `routeActiveAt` tests pass.
- Manual smoke: navigation between two E1 routes triggers the
  expected controller re-keying (e.g., `MapLibreViewportController`
  fires `flyTo` to the new route's center, not `jumpTo`).

### §7.6 CI gate

- Suite green + new tests pass.

### §7.7 Rollback shape

OK — single-file revert. ~20 minutes.

### §7.8 Owner approval gate before Phase 5

Owner reviews controller behavior on route changes (esp. follow-
location and arrival-camera one-shot semantics).

---

## §8 — Phase 5: Performance-tracking lifetime resolution

### §8.1 Goals

- Resolve the lifetime-shift documented in Pass 258 §8 / Pass
  261 §3.1: under PMS the `useMapPerformanceTracking` window
  stays mounted across routes, becoming session-scoped.
- Two valid resolutions; **decide before this phase begins**:
  - **Resolution A (session-scoped):** accept the new lifetime;
    update `PlannerDiagnosticsPanel` and `CoverageNavigationPlanner`
    consumers to display session-scoped windows correctly.
  - **Resolution B (per-route reset):** add an explicit
    `mapPerformance.resetWindow()` call at provider's
    `routeActiveAt` change; preserves current window semantics.
- **Recommended:** Resolution A. Session-scoped windows give
  diagnostics a more honest signal under PMS. The cost is one
  data-display update in two consumer files. Resolution B is a
  fallback if owner prefers backward-compatible window
  semantics.

### §8.2 Files modified

**Resolution A** (recommended):

- `src/app/components/maps/useMapPerformanceTracking.ts` — comment
  update only; lifetime is now provider-controlled.
- `src/app/services/navigation/mapPerformance.ts` — comment
  update.
- `src/app/components/maps/command-center/PlannerDiagnosticsPanel.tsx` —
  display label updated from "this session's pan/zoom samples"
  to whatever is appropriate; window-bounds re-rendered
  correctly.
- `src/app/components/maps/command-center/CoverageNavigationPlanner.tsx` —
  same display update if applicable.

**Resolution B** (fallback):

- `src/app/components/maps/MapSessionProvider.tsx` — add
  `mapPerformance.resetWindow()` call on `routeActiveAt`
  change.
- `src/app/services/navigation/mapPerformance.ts` — export
  `resetWindow()`.

### §8.3 Tests added

- `src/app/__tests__/perfTrackingLifetimeUnderPMS.test.tsx` —
  verifies the chosen resolution's invariant.

### §8.4 Success criterion

- Diagnostics consumers display correctly under PMS.
- Existing perf-tracking tests still pass.
- New lifetime tests pass.

### §8.5 CI gate

- Suite green + new tests pass.

### §8.6 Rollback shape

OK — 4 small file reverts (Resolution A) or 2 small file reverts
(Resolution B).

### §8.7 Owner approval gate before Phase 6

Owner reviews diagnostics panel screenshots in PMS mode and
confirms the displayed signal is sensible.

---

## §9 — Phase 6: Auth-flip cleanup + verification ship gate

### §9.1 Goals

- `MapSessionProvider` listens to Clerk session signal; on
  sign-out, disposes the engine and clears the context.
- Final verification: all four gates G1-G4 measurably satisfied.

### §9.2 Files modified

- `src/app/components/maps/MapSessionProvider.tsx` — add the
  Clerk-session-aware cleanup `useEffect`.

### §9.3 Tests added

- `src/app/__tests__/mapSessionAuthFlipCleanup.test.tsx` —
  verifies sign-out disposes the engine; sign-in re-creates a
  fresh engine.

### §9.4 Verification suite

This phase is the SHIP GATE. Run, in order:

1. **G2 / G3 verification** (instance counter + GL context counter):
   - During a typical customer flow (landing → auth → home →
     reports list → report detail → coverage panel), instance
     counter reaches 1 and GL context counter reaches 1.
2. **G4 verification** (Performance API):
   - Across the same flow, no `engine:mount` mark fires after
     the initial provider construction.
3. **G1 verification** (Lighthouse):
   - Re-run Lighthouse on `/`, `/dashboard`, `/reports`. Compare
     to Phase 0 baseline. No regressions of >5 points on any
     score.
4. **Auth-flip verification:**
   - Sign in, navigate, sign out. Engine disposes; instance
     counter returns to 0.

### §9.5 Success criterion

- All four gates measurably satisfied.
- Auth-flip cleanup test passes.
- Suite green: 927 + new lifecycle tests across all six phases.

### §9.6 CI gate

- Final suite green.

### §9.7 Rollback shape

If verification fails on any gate, the rollback shape depends on
which phase introduced the regression — each phase has its own
trivial-or-OK rollback (see §3-§9). The cleanest abort is to
revert in REVERSE phase order until the regression disappears,
then ship the truncated subset (or roll back PMS entirely).

### §9.8 Final owner approval gate

Owner approves shipping to staging, then production. PMS lane
closes; `REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md` §10 is
updated with the post-PMS measured numbers.

---

## §10 — Owner approval points (consolidated checklist)

| Gate                | When it fires                                  | What owner reviews                                                 |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Pre-Phase 1         | After Pass 259 recommendation accepted          | Pass 259 §5 recommendation; this plan's scope.                     |
| Pre-Phase 2 (Phase 0 → 1 boundary) | After Phase 0 baseline captured                | Lighthouse baseline numbers; counter readings.                     |
| Pre-Phase 3 (Phase 2 → 3 boundary) | After engine lift                               | Provider runtime behavior in legacy-mount-coexistence mode.        |
| Pre-Phase 4 (Phase 3 → 4 boundary) | After slot rollout                              | Three E1 routes' visual + behavioral parity.                        |
| Pre-Phase 5 (Phase 4 → 5 boundary) | After controller re-keying                      | Controller behavior on route changes.                              |
| Pre-Phase 6 (Phase 5 → 6 boundary) | After perf-tracking lifetime resolution         | Diagnostics-panel display under PMS.                               |
| Final ship gate     | After Phase 6 verification                      | All four gates G1-G4 measurably satisfied; auth-flip clean.        |

The seven-gate structure means: **the owner can stop the project
at any phase boundary and ship the partial improvement** without
regressing the rest of the system. No phase relies on a later
phase to remain healthy.

---

## §11 — Rollback master playbook

If a regression surfaces post-ship, revert phases in REVERSE
order until the regression disappears. Each phase's revert is
documented above. The dominant concerns:

| Symptom (post-ship)                                    | Likely phase   | Revert action                                                             |
| ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------- |
| Sign-out leaves stale map state                         | Phase 6        | Revert auth-flip cleanup; engine becomes a leak (acceptable interim).      |
| Diagnostics panel shows wrong window                    | Phase 5        | Revert perf-tracking lifetime resolution (or switch resolution A↔B).        |
| Camera controllers misbehave on route change             | Phase 4        | Revert controller re-keying.                                                |
| Visual regression on landing/coverage routes            | Phase 3        | Revert slot rollout; legacy mounts return.                                  |
| Engine fails to mount inside provider                    | Phase 2        | Re-empty provider; engine reverts to per-route mounting.                    |
| App fails to render at all                              | Phase 1        | Remove provider wrapper from `App.tsx`.                                     |
| Counter / mark instrumentation cost shows in production | Phase 0        | Verify dev-only build gates; emergency: remove the four files.              |

In every case, the revert is one or a few file changes. No
revert requires re-architecture.

---

## §12 — What this plan does NOT do

- Does NOT touch any production source.
- Does NOT touch any test file.
- Does NOT pre-commit any phase as policy. Phase 0 may not begin
  without explicit owner authorization of the Pass 259 §5
  recommendation.
- Does NOT propose Engine 2 unification (Phase-2-deferred per
  Pass 258 §11).
- Does NOT modify autoFit / callerBoundsExplicit / sub-pass C
  / Engine 3 internals / viewport / camera authority semantics
  / gesture semantics / reduced-motion semantics. The plan
  preserves these locks by construction (E3 stays
  mount-per-site).
- Does NOT touch ShopMapWidget (owner-dirty).
- Does NOT modify `LAW_*` or `REF_*` documentation.
- Does NOT introduce new KIs / new doc tiers / new framework
  expansion.
- Does NOT propose alternative architecture options. Pass 259's
  §5 recommendation is the input; this plan only sequences it.

---

## §13 — Cross-references

- [`PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md`](PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md) — Pass 258 substrate.
- [`PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md`](PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md) — Pass 259 decision matrix; §5 recommendation is the input to this plan; §6 forward constraints map directly onto Phases 1-5; §7 risk register maps onto §11 rollback playbook.
- [`REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md`](REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md) — Pass 261 measurement methodology; §7 instrumentation methodology becomes Phase 0; §8 instrumentation candidate list becomes Phase 0's file inventory.
- [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) — Pass 257 confidence baseline; G1-G4 gates source.
- [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — engine inventory.
- [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — four-layer model (each phase tagged with affected layers).
- [`AI_LOCK.md`](../AI_LOCK.md) — current session coordination.

---

## §14 — Status

- **Drafted:** 2026-05-09 (Pass 260, Primary Builder AI for PMS planning).
- **Status:** ACTIVE plan. Updates only when:
  - Pass 259's recommendation is owner-amended,
  - Pass 261's measurement methodology is owner-amended,
  - a new phase boundary becomes necessary.
- **Authority:** PLAN. Subordinate to LAW_PROJECT_RULES,
  LAW_LAYERED_ARCHITECTURE, the active execution authority.
- **Owner approval required:** **TRUE.** Phase 0 may not begin
  without explicit owner authorization of Pass 259's §5
  recommendation AND this plan's scope.
- **Supersedes:** none.
- **Superseded by:** none.

**PMS planning corpus closure (this commit):**

The four-document corpus is now complete and self-consistent:

- Pass 258: topology substrate (current state).
- Pass 261: measurement methodology (how we'll know if we
  succeeded).
- Pass 259: architecture options + recommendation (what we
  should build).
- Pass 260 (this doc): execution sequencing (how we should
  build it, phased and reversible).

Together these provide the **execution-grade blueprint** the
owner relay 2026-05-09 requested.

**Next pass (post-PMS-planning standdown):** none authorized
in this lane. Implementation requires owner authorization. If
authorized, the implementation lane begins at Phase 0 (§3).
