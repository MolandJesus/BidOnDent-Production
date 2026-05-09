---
status: CANONICAL
authority: REFERENCE
scope: map-runtime-test-coverage-gaps
canonical_source_of_truth: REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Inventory of existing map/navigation test coverage and the gaps that block safe runtime convergence. Defines required coverage per phase from PLAN_MAP_CONVERGENCE_SEQUENCE.
last_updated: 2026-05-09
---

# Map Runtime Test Coverage Gap Analysis (2026-05-09)

> Block C / Pass 228 deliverable. Read-only audit. No code changes.
>
> Companions:
>
> - [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) §5.2 — required validations
> - [`PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md`](PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md) §4 — coverage matrix per risk

---

## §1. Existing coverage inventory

| Layer                     | File                                                                                                                                | Covers                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Engine 1 (canonical)      | [`engine/MapEngineCanvas.test.tsx`](../src/app/components/maps/engine/MapEngineCanvas.test.tsx)                                     | Render + basic prop wiring                    |
| Engine GeoJSON            | [`maps/useMapEngineGeoJSON.test.tsx`](../src/app/components/maps/useMapEngineGeoJSON.test.tsx)                                      | GeoJSON memoization                           |
| Reroute gating policy     | [`features/navigation/shouldTriggerReroute.test.ts`](../src/app/features/navigation/shouldTriggerReroute.test.ts)                   | Pure function — Pass 205 regression-locked    |
| Deviation detection       | [`features/navigation/detectDeviation.test.ts`](../src/app/features/navigation/detectDeviation.test.ts)                             | Pure function                                 |
| Cloud session service     | [`services/navigation/navigationSessionCloudService.test.ts`](../src/app/services/navigation/navigationSessionCloudService.test.ts) | Service behavior                              |
| Stale nav cleanup         | [`utils/clearStaleNavSessions.test.ts`](../src/app/utils/clearStaleNavSessions.test.ts)                                             | Pure function                                 |
| Shop intelligence helpers | `services/intelligence/shopMap*.test.ts` (5 files)                                                                                  | Adapters / collections / routing data shaping |

**Total test files touching map/nav:** 8 unit-test files plus 5 intelligence helpers.

---

## §2. Critical gaps blocking convergence

### 2.1 Engine coverage

| Engine                             | Mount/unmount test    | Failure-surface (`onLoad`/`onError`) test | Camera mutation test |
| ---------------------------------- | --------------------- | ----------------------------------------- | -------------------- |
| 1 — `MapEngineCanvas`              | partial (render only) | **MISSING**                               | **MISSING**          |
| 2 — `MapLibreShopDirectoryMapPane` | **MISSING**           | **MISSING**                               | **MISSING**          |
| 3 — `MapLibreDashboardMapPreview`  | **MISSING**           | **MISSING**                               | **MISSING**          |

**Impact:** No engine has test coverage that would catch a mount-time
regression (blank canvas, missing resize patch, container-gating
bypass). All 3 engines could regress silently in CI today.

### 2.2 Orchestration host coverage

| Host                                       | Lifecycle test | Hook composition test | State transition test |
| ------------------------------------------ | -------------- | --------------------- | --------------------- |
| Host A — `useCoverageNavigationExperience` | **MISSING**    | **MISSING**           | **MISSING**           |
| Host B — `useShopDirectoryNavigation`      | **MISSING**    | **MISSING**           | **MISSING**           |

**Impact:** The two orchestration hosts (per Pass 224) have ZERO unit
or integration test coverage. This is the single biggest gap. Any
convergence pass touching either host could regress full-runtime
behavior with no CI signal.

### 2.3 Surface (consumer) coverage

| Surface                                     | Mount test  | Interaction test |
| ------------------------------------------- | ----------- | ---------------- |
| Coverage map (`MapLibreServiceCoverageMap`) | **MISSING** | **MISSING**      |
| Shop directory map host                     | **MISSING** | **MISSING**      |
| `CustomerMapWidget`                         | **MISSING** | **MISSING**      |
| `ShopMapWidget`                             | **MISSING** | **MISSING**      |
| `InsurerMapWidget`                          | **MISSING** | **MISSING**      |
| `ReportsListScreen` map                     | **MISSING** | **MISSING**      |
| `ReportDetailScreen` map                    | **MISSING** | **MISSING**      |
| `CompetitorAnalysisScreen` map              | **MISSING** | **MISSING**      |

**Impact:** None of the 8 map-bearing surfaces have surface-level
tests. Visual regressions, prop wiring bugs, and tier-classification
mistakes would only be caught by manual QA.

### 2.4 Lifecycle contract obligations (per LAW contract §3)

| Obligation                                                   | Current test coverage                                                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `maplibreResizePatch` pre-mount import enforced              | **MISSING** — no test asserts patch is imported before any map mount                                 |
| Per-instance `id` strategy                                   | **MISSING**                                                                                          |
| `onLoad` + `onError` handlers wired                          | **MISSING**                                                                                          |
| Error boundary parent                                        | **MISSING**                                                                                          |
| Container gating before mount                                | **MISSING**                                                                                          |
| `prefers-reduced-motion` consulted before camera transitions | **PARTIAL** — `scripts/audit-reduced-motion.mjs` exists but is a script, not a CI-enforced unit test |

---

## §3. Coverage requirements per convergence phase

Mapping LAW contract §5.2 + PLAN sequence §4 to specific test
additions required before each phase ships.

### 3.1 Required for Phase 1 (Tier B/C alignment, passes 232–235)

Risk level: low. Required additions:

1. **Engine 3 mount/unmount test** — verify `MapLibreDashboardMapPreview`
   mounts, fires `onLoad`/`onError` (after they are wired in pass 232+),
   and unmounts cleanly across all 6 callers.
2. **`autoFit` prop behavior test** — for each `autoFit` value
   (`'always'`, `'when-no-caller-bounds'`, `'never'`), verify the
   resulting viewState. Closes Pass 225 § 4 hidden authority.
3. **Per-caller surface-mount test** for at least one Tier B caller
   (suggest: `ReportDetailScreen` first, since it is also the Tier C
   candidate from Pass 227 § 1).

**Phase 1 cannot ship without (1) and (2).** Caller coverage (3) can
be deferred to Phase 1's last pass.

### 3.2 Required for Phase 2 (Engine 2 contract conformance, passes 236–238)

Risk level: high. Required additions:

1. **Engine 2 mount/unmount test** — mirror Engine 3's coverage but
   for `MapLibreShopDirectoryMapPane`.
2. **Declarative camera controller test** — for pass 236, verify the
   new revision-keyed declarative camera produces the same end-state
   viewport as the imperative `flyTo` it replaces.
3. **Reduced-motion contract test** — for pass 237, verify that when
   `prefers-reduced-motion: reduce` is set, no animated camera move
   is issued.
4. **Layer authority centralization test** — for pass 238, verify
   layer add/remove order matches the centralized authority.

**Phase 2 cannot ship without all 4.**

### 3.3 Required for Phase 3 (Coverage navigation classification, passes 239–24X)

Risk level: critical (Branch A) or high (Branch B).

**Branch A (coverage grows into Host B):**

1. **Host A → Host B parity test** — verify Host A now exposes the same
   contract as Host B for: session, reroute, lifecycle, voice/toast.
2. **Cloud session restore test** — verify coverage navigation
   survives a simulated reload via `navigationSessionCloudService`.
3. **Reroute gating test on coverage surface** — verify
   `shouldTriggerReroute` is consulted from coverage just like from
   shop directory.
4. **Storage key reconciliation test** — verify
   `bidondent_navigation_session` (legacy) and `bidondent_nav_*`
   (per-user) cluster do not collide when both are present.

**Branch B (coverage downgrades to Tier B preview):**

1. **Coverage-as-preview classification test** — verify coverage
   surface no longer accepts live nav entry points.
2. **Hand-off test** — verify "navigate" actions on coverage hand off
   to shop directory rather than starting an in-place session.

### 3.4 Required for Phase 4 (Engine 1/2 collapse evaluation, passes 24Y–24Z)

Risk level: high. Required additions are out of scope for this audit
because Phase 4 is intentionally not pre-scoped. If the owner
authorizes Phase 4, a Pass 228-style coverage update will precede it.

---

## §4. Test framework + infrastructure observations

1. **Vitest is the framework** for all existing unit tests. Map mount
   tests will need `jsdom` plus a `maplibre-gl` mock or a
   canvas-rendering shim. Engine 1's existing test demonstrates
   the pattern is workable.
2. **No Playwright coverage exists today** for map surfaces. If the
   owner wants browser-real validation (rather than jsdom + mocks),
   a parallel Playwright suite would be required. This is a separate
   decision, not a blocker for the unit-level requirements above.
3. **`scripts/audit-reduced-motion.mjs`** is the only motion-canon
   automation today; it is a one-off audit script, not a CI check.
   Phase 2 should promote its checks into a unit test to enforce the
   contract on every PR.

---

## §5. Effort sequencing recommendation

To unblock convergence with the least overall risk:

1. **Add Phase 1 coverage FIRST** (engine 3 mount/unmount + `autoFit`
   behavior). This is the smallest test footprint and unlocks the
   safest phase.
2. **Add Engine 2 mount/unmount coverage** before Phase 2 starts. This
   is the riskiest engine to modify.
3. **Add Host B parity test** before any Phase 3 work begins. Without
   it, Branch A's host-growing changes have no regression signal.

Test additions are themselves passes. They do not require the LAW
contract to be ratified (test-only changes are safe-for-autopilot).
The owner may authorize them independently and in parallel with
Pass 230 ratification work.

---

## §6. Findings summary

1. **Engine layer:** 1 of 3 engines has a render test; 0 of 3 have
   mount/unmount + failure-surface coverage.
2. **Orchestration layer:** 0 of 2 hosts have any unit/integration
   coverage. This is the single biggest gap.
3. **Surface layer:** 0 of 8 map-bearing surfaces have surface-level
   tests.
4. **Lifecycle contract obligations:** 0 of 6 contract obligations
   (LAW §3) are enforced by CI today; reduced-motion has a script-
   level audit only.
5. **Pure-function navigation logic:** WELL covered (reroute gating,
   deviation, cloud service, stale cleanup all have tests).
6. **Recommendation:** add Phase 1 coverage as test-only passes
   independent of LAW ratification, so test infrastructure is ready
   when convergence executes.

**Hand-off to Pass 229:** Pass 229 opens KI entries against
REF_KNOWN_ISSUES for each concrete convergence step in PLAN sequence
§2 plus each coverage gap in §2 of this doc.
