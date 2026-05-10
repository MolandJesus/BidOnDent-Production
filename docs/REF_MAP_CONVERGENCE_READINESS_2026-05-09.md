---
status: CANONICAL
authority: REFERENCE
scope: map-runtime-convergence-readiness
canonical_source_of_truth: REF_MAP_CONVERGENCE_READINESS_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Bridge audit between the characterization-era test infrastructure (Passes 231e-j) and the controlled-convergence era. Inventories remaining hidden authority, classifies declarative-vs-imperative camera ownership, maps reduced-motion inconsistencies, identifies orchestration overlap, and separates safe convergence candidates from Phase 3 architectural risks.
last_updated: 2026-05-09
---

# Map Runtime Convergence-Readiness Audit (Pass 231k)

> Block D / Pass 231k deliverable. Read-only audit. No production
> source touched. **Bridge document** between two distinct eras:
>
> - **Characterization era (Passes 231e–231j):** test infrastructure
>   plus current-behavior pinning. Done.
> - **Controlled convergence era (Phase 1 onward, Pass 232+):**
>   targeted runtime changes against pinned baselines. Owner-gated
>   per `REF_BLOCK_D_CLOSEOUT_2026-05-09.md` §6.
>
> This audit's job is to make the second era safer by giving the
> next builder + the next planner a single reference for "where the
> hidden authority is, what's safe to converge first, and what
> requires Phase 3 architectural decisions."
>
> **Authority:** REFERENCE. Subordinate to LAW_MAP_RENDERER_CONTRACT
> and the active PLAN sequence.
>
> **Inputs (the characterization-era output):**
>
> - [`src/app/test-utils/mapTestHarness.ts`](../src/app/test-utils/mapTestHarness.ts) (Pass 231e + 231i extension)
> - [`src/app/components/maps/engine/MapEngineCanvas.test.tsx`](../src/app/components/maps/engine/MapEngineCanvas.test.tsx) (Pass 193 contract lock)
> - [`src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx) (Pass 231g)
> - [`src/app/components/shop/useMapPaneState.test.tsx`](../src/app/components/shop/useMapPaneState.test.tsx) (Pass 231h)
> - [`src/app/components/maps/mapLibreControllers.test.tsx`](../src/app/components/maps/mapLibreControllers.test.tsx) (Pass 231i)
> - [`src/app/utils/maplibreResizePatch.test.ts`](../src/app/utils/maplibreResizePatch.test.ts) (Pass 231j)
>
> **Companion governance docs:**
>
> - [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md)
> - [`PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md`](PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md)
> - [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md)

---

## §1. What characterization-era produced

48 tests now lock map-runtime behavior in CI (vitest 839/839 PASS as of `41bac732`). The matrix:

| Surface                                  | Coverage                                                                                        | Pass     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| `useMapEngineGeoJSON`                    | 8-key shape + coordinate swap + search-target double feature                                    | 186      |
| Engine 1 — `MapEngineCanvas`             | Render + prop wiring + canvas frame composition                                                 | 193      |
| Engine 3 — `MapLibreDashboardMapPreview` | Mount/unmount, per-instance id, gesture suppression, `fittedView` override matrix (KI-181)      | 231g     |
| Engine 2 — `useMapPaneState`             | Initial state, `handleMapLoad`/`handleMapLoadError`/`handleRetryMap`, 12s timeout, `geoError`   | 231h     |
| Engine 1 controllers                     | Viewport jumpTo+flyTo, follow-location guidance entry, arrival flyTo, route-fit fitBounds       | 231i     |
| Reduced-motion topology baseline         | 3-of-4 controllers do NOT consult `matchMedia`; route-fit delegates to MapLibre internals       | 231i     |
| Resize-patch invariant                   | Sentinel set on direct + transitive (Engine 3) import — KI-190 closed                           | 231j     |
| Test-harness self-contract               | `installPrefersReducedMotion`, `viewportFixtures`, sentinel helpers, stub module shape          | 231e     |

The harness layer is now infrastructure architecture, not "just tests" (per ChatGPT-relayed
governance assessment 2026-05-09). Centralization is enforced going forward.

---

## §2. Remaining hidden authority

"Hidden authority" = a surface with imperative camera mutation OR
viewport-control side effects that are not visible at the call
site and not consulted against `prefers-reduced-motion`.

### 2.1 Engine 1 controllers — duration leak

| Controller                          | File / line                                                                                              | Imperative call       | Reduced-motion gated? |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| `MapLibreViewportController`        | [mapLibreControllers.tsx:27](../src/app/components/maps/mapLibreControllers.tsx#L27)                     | `flyTo({ duration: 1150 })` | NO                    |
| `MapLibreFollowLocationController`  | [mapLibreControllers.tsx:82,121](../src/app/components/maps/mapLibreControllers.tsx#L82)                 | `flyTo({ duration: 600 / 850 / 1000 / 1800 })` | NO                    |
| `MapLibreArrivalCameraEffect`       | [mapLibreControllers.tsx:158](../src/app/components/maps/mapLibreControllers.tsx#L158)                   | `flyTo({ duration: 2000, essential: true })` | NO                    |
| `MapLibreRouteFitController`        | [mapLibreControllers.tsx:215](../src/app/components/maps/mapLibreControllers.tsx#L215)                   | `fitBounds({ duration: 900 })` | DELEGATED             |

**Hidden-authority severity:** P2-LAW-CONFORMANCE. The three top
controllers fire animated camera transitions without consulting
`matchMedia('(prefers-reduced-motion: reduce)')`, which violates
LAW_MAP_RENDERER_CONTRACT §3.6. Pinned today by Pass 231i.

### 2.2 Engine 2 — viewport manager + click handlers

| Source                                              | File / line                                                                                                                              | Imperative call     | Reduced-motion gated? |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------- |
| `MapLibreShopDirectoryViewportManager` (jump-to)    | [MapLibreShopDirectoryViewportManager.tsx:85](../src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx#L85)                  | `jumpTo`            | n/a (instantaneous)   |
| Viewport manager (single-point fly)                 | [MapLibreShopDirectoryViewportManager.tsx:140](../src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx#L140)                | `flyTo({ duration: 900 })` | NO                    |
| Viewport manager (fitBounds)                        | [MapLibreShopDirectoryViewportManager.tsx:166](../src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx#L166)                | `fitBounds`         | DELEGATED             |
| Viewport manager (refit)                            | [MapLibreShopDirectoryViewportManager.tsx:213](../src/app/components/shop/MapLibreShopDirectoryViewportManager.tsx#L213)                | `flyTo`             | NO                    |
| `useShopMapInteraction` shop click                  | [useShopMapInteraction.ts:125](../src/app/components/shop/useShopMapInteraction.ts#L125)                                                | `e.target.flyTo`    | NO                    |
| `useShopMapInteraction` saved-place click           | [useShopMapInteraction.ts:156](../src/app/components/shop/useShopMapInteraction.ts#L156)                                                | `e.target.flyTo`    | NO                    |

**Hidden-authority severity:** P2-LAW-CONFORMANCE (KI-180). The viewport manager
and click handlers are the largest imperative surface left. None
consult `matchMedia`. **Not yet test-pinned** — would require an
Engine-2-controller-style test pass against the viewport manager
specifically. Tracked as a follow-up to 231h.

### 2.3 Engine 3 — silent `fittedView` override

| Source                                          | File / line                                                                                                                | Hidden authority                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `MapLibreDashboardMapPreview.fittedView` memo   | [MapLibreDashboardMapPreview.tsx:49-72](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx#L49)               | When `≥ 2` fitPoints exist, the caller's `center` + `zoom` props are silently overridden    |

**Hidden-authority severity:** P2-HIDDEN-AUTHORITY (KI-181). Pinned today
by Pass 231g. The fix path is the explicit `autoFit: 'always' |
'when-no-caller-bounds' | 'never'` prop already named in
`PLAN_MAP_CONVERGENCE_SEQUENCE` §3.1 (Phase 1 first pass).

### 2.4 `MapLibreReportLayer` flyTo on report click

[`MapLibreReportLayer.tsx:175`](../src/app/components/maps/MapLibreReportLayer.tsx#L175) —
imperative `e.target.flyTo` on report-pin click. **Does** consult `matchMedia`
(line 87). The only Engine-1-side imperative call that already meets
LAW §3.6.

---

## §3. Declarative-vs-imperative ownership map

Per `REF_RUNTIME_PHILOSOPHY_2026-05-09.md`. Maps each camera
mutation surface to its authority model.

| Engine | Surface                                | Authority model                        | LAW §2 conformant? |
| ------ | -------------------------------------- | -------------------------------------- | ------------------ |
| 1      | Initial mount                          | Uncontrolled `initialViewState`        | YES                |
| 1      | Viewport controller                    | Declarative — revision-keyed `useEffect` |  YES (model) / NO (motion gating)  |
| 1      | Follow-location controller             | Declarative — `enabled`/`revision` keyed `useEffect` | YES (model) / NO (motion gating) |
| 1      | Arrival camera                         | Declarative — `hasArrived` keyed `useEffect`, single-shot via ref | YES (model) / NO (motion gating) |
| 1      | Route fit controller                   | Declarative — `routeFitKey` keyed `useEffect` | YES (model + motion delegated) |
| 1      | Report-pin click flyTo                 | Imperative — event-handler `e.target.flyTo` with explicit `matchMedia` check | YES                |
| 2      | Mount + initial viewport               | Uncontrolled `initialViewState` + `mapRenderNonce` hard remount key | YES                |
| 2      | Viewport manager                       | Imperative — `useMap()` + `flyTo` / `fitBounds` / `jumpTo` | NO (camera authority gap) |
| 2      | Click handlers (shop / saved place)    | Imperative — `e.target.flyTo`          | NO (motion gating gap) |
| 3      | Mount + viewport                       | Controlled — `viewState` state + `onMove` setter | YES (Tier B opt-in per LAW §4.2) |
| 3      | `fittedView` override                  | Hidden authority — silent `useEffect` overrides caller's center/zoom | NO (KI-181)         |
| 3      | Click handler (popup)                  | Stateful — opens tooltip, no camera mutation | YES (preview owns no camera) |

**Key observation, now canonical terminology:**

> **Preview owns no camera.**

Engine 3 (`MapLibreDashboardMapPreview`) is Tier B operational preview
per LAW §4.2. After the Phase 1 `autoFit` prop lands, Engine 3 will
fully satisfy "preview owns no camera": gestures suppressed, no
imperative mutation, viewport-as-prop. Use this language in future
commits, KI registrations, and PLAN docs.

---

## §4. Reduced-motion inconsistency map

| Surface                              | Approach                              | Conformant? | Reference                                                                       |
| ------------------------------------ | ------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| Engine 1 viewport controller         | None — direct `flyTo({ duration })`   | NO          | Pass 231i pin                                                                  |
| Engine 1 follow-location controller  | None — direct `flyTo({ duration })`   | NO          | Pass 231i pin                                                                  |
| Engine 1 arrival camera              | None — direct `flyTo({ duration })`   | NO          | Pass 231i pin                                                                  |
| Engine 1 route fit controller        | Delegated to MapLibre internals       | PARTIAL     | mapLibreControllers.tsx:212 comment claims this; not unit-testable from jsdom   |
| Engine 1 `MapLibreReportLayer` click | Explicit `matchMedia` check           | YES         | MapLibreReportLayer.tsx:87                                                     |
| Engine 2 viewport manager            | None                                  | NO          | KI-180                                                                         |
| Engine 2 click handlers              | None                                  | NO          | KI-180                                                                         |
| Engine 2 tile-fade overlay           | Explicit `matchMedia` check           | YES         | MapLibreShopDirectoryMapPane.tsx:192                                           |
| Engine 2 `ShopDirectoryMapLayers`    | Explicit `matchMedia` check           | YES         | ShopDirectoryMapLayers.tsx:164                                                 |
| Engine 3 (no camera transitions)     | Trivially satisfied                   | YES         | Tier B = preview owns no camera                                                |

**Net pattern:** the *camera transitions* lack matchMedia gating; the
*decorative animations* have it. The split is not principled — it
reflects when each piece was authored. KI-191's Vitest promotion
of `audit-reduced-motion.mjs` would catch CSS-side regressions but
not the camera-side gap.

---

## §5. Orchestration overlap

`REF_NAVIGATION_AUTHORITY_2026-05-09.md` (Pass 224) names two
orchestration hosts. Their overlap is the highest-severity item
on the convergence backlog (KI-182):

| Host                                | File                                                                                                  | Owns                                                                                                         | Tier      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------- |
| Host A — `useCoverageNavigationExperience` | [src/app/hooks/useCoverageNavigationExperience.ts](../src/app/hooks/useCoverageNavigationExperience.ts) | Coverage navigation: silent, ephemeral, no reroute governance, no persistence, exploratory                  | Tier A *  |
| Host B — `useShopDirectoryNavigation`      | [src/app/hooks/useShopDirectoryNavigation.ts](../src/app/hooks/useShopDirectoryNavigation.ts)           | Shop-directory navigation: operational, persisted, voice/toast/wake-lock, reroute-governed                  | Tier A    |

> \* Tier-A-by-default; LAW §7 question 1 leaves open whether
> coverage navigation should grow into the full Host B contract or
> be reclassified to Tier B preview-only. Owner deferred this decision.

**KI-182:** "Navigation" denotes two structurally different runtimes.
Until LAW §7-1 resolves, both hosts coexist. Convergence-pass authors
must reference which host they're touching by name (Host A or Host B),
never by the bare word "navigation".

**Test coverage for both:** ZERO (KI-188). Tied for biggest gap on
the test-coverage matrix from `REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md`
§2.2. Out of scope for the 231e-j characterization era.

---

## §6. Safe convergence candidates (next-up, low risk)

Ordered by risk × value. Each has a pinned baseline test from
characterization era; the convergence pass against it produces a
visible CI diff.

### 6.1 Engine 3 `autoFit` prop (Phase 1, KI-181)

- **Test contract pinned:** Pass 231g, 6-case matrix in
  [`MapLibreDashboardMapPreview.test.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx).
- **Production change:** add `autoFit: 'always' | 'when-no-caller-bounds' | 'never'` prop. Default `'when-no-caller-bounds'` matches today's intent (preserve caller wins when fitPoints < 2).
- **Risk:** low. 6 callers per `REF_MAP_RENDERER_INVENTORY_2026-05-09.md` §3.3, all already align with the proposed default.
- **Why first:** lowest blast radius + highest evidence quality. Locks "preview owns no camera" canonically.
- **Authorization status:** Phase 1 — owner per-pass approval required.

### 6.2 ReportDetailScreen Tier C/B alignment (Phase 1)

- **Test contract pinned:** none yet (no Pass 193-equivalent for ReportDetailScreen). Pre-flight Pass 232a equivalent recommended before any production change.
- **Production change:** add explicit `tier: 'B' | 'C'` declaration on the surface mount.
- **Risk:** low. Single-pin use case; no autoFit involvement.
- **Why second:** maximally test-friendly surface. Sets the per-caller-tier-declaration pattern for the rest of Phase 1.
- **Authorization status:** Phase 1 — owner per-pass approval required.

### 6.3 Engine 1 controller reduced-motion gating (Phase 2 candidate, KI-180 / KI-191)

- **Test contract pinned:** Pass 231i. Six "STILL uses duration: N" tests will fail when the fix lands → that's the visible diff.
- **Production change:** add `matchMedia('(prefers-reduced-motion: reduce)')` check inside each of the three controllers; pass `duration: 0` (or skip the call) when reduce is set.
- **Risk:** medium. The follow-location controller's logic is complex — guidance entry, force-revision, debounce. A naive matchMedia gate could break the dramatic-zoom-in moment.
- **Why third:** Phase 2 is the right home; not a Phase 1 task.
- **Authorization status:** Phase 2 — explicit owner gate.

### 6.4 KI-191 Vitest promotion of `audit-reduced-motion.mjs`

- **Test contract pinned:** none — script exists, output is parseable.
- **Production change:** none (test-only addition).
- **Risk:** none.
- **Why fourth:** test-infra completion of the reduced-motion track. Pure CI enforcement; doesn't depend on §6.3 landing first.
- **Authorization status:** test-only — pre-authorized per `REF_BLOCK_D_CLOSEOUT_2026-05-09.md` §6.

---

## §7. Phase 3 architectural risks (NOT yet safe to converge)

Items that require LAW §7 resolution or owner architectural decisions
before any implementation work begins. **Do not surface as builder
passes without explicit owner authorization for that specific decision.**

### 7.1 Coverage navigation Tier classification (LAW §7-1)

- **Question:** Tier A (grow Host A into full Host B contract) or Tier B (declare preview-only)?
- **Why blocked:** owner has not chosen. Either direction has irreversible consequences for Coverage UX.
- **Test prerequisites:** Host A test coverage (KI-188).
- **Recommended pre-work:** characterize Host A's current behavioral surface (read-only audit) so the decision space is concrete.

### 7.2 Engine 2 imperative `flyTo` migration (KI-180)

- **Question:** Replace Engine 2's imperative camera with declarative revision-keyed controllers (Engine 1 model)?
- **Why blocked:** imperative model is load-bearing for the route-options drawer + origin picker UX.
- **Test prerequisites:** Engine 2 viewport manager characterization (KI-180 baseline test pass — follow-up to 231h).
- **Risk class:** critical. Per LAW §5.4 hard-stop list ("Modify the canonical camera authority model").

### 7.3 Cross-surface camera continuity (LAW §7-3)

- **Question:** Should camera state persist across surfaces (e.g., user pans on coverage, switches to dashboard, dashboard remembers the pan)?
- **Why blocked:** open question; explicit "out of scope or future feature" decision needed.
- **Risk class:** critical. Affects state-shape across orchestration hosts.

### 7.4 Pitch caps unification (LAW §7-2)

- **Question:** Unified pitch policy or per-surface declared intent?
- **Why blocked:** owner-deferred. Engine 1 caps at 0 (or 65 in immersive); Engine 2 caps at 0 / 65 conditional on tile mode + guidance; Engine 3 has no explicit cap.
- **Risk class:** medium. UX-visible if changed.

### 7.5 Tier C dedicated engine (LAW §7-4)

- **Question:** Is Tier C deserving of its own engine, or is Tier B with stricter props sufficient?
- **Why blocked:** depends on whether ReportDetailScreen single-pin use is the only Tier C candidate.
- **Risk class:** low. Mostly an inventory question.

---

## §8. Bridge — how to use this audit

When taking a convergence pass:

1. **Identify the target surface.** Cite §2 for hidden-authority membership and §3 for declarative-vs-imperative classification.
2. **Find the pinned baseline test.** Cite §1 row. If none exists, the pass is in §6/§7 territory and a characterization pre-flight is required first.
3. **Cite LAW + REF.** Per LAW §5.3, every convergence pass commit message includes the contract line + the §5.1 artifacts.
4. **Verify the diff is visible.** A safe convergence pass produces a *failing* assertion in a pinned test — that failure is the pre-merge sanity check that the work landed.
5. **Document orientation in this file's §6 / §7 if topology shifts.** This doc is the convergence map; its accuracy is the master builder's responsibility.

---

## §9. Out of scope for Pass 231k

This audit does NOT:

- Fix any hidden authority.
- Add or change `matchMedia` checks anywhere in production.
- Migrate any camera authority model.
- Resolve any LAW §7 question.
- Add Host A or Host B test coverage.
- Touch any owner-dirty file.

These are explicitly Phase 1+ work and require owner per-pass authorization
per `REF_BLOCK_D_CLOSEOUT_2026-05-09.md` §6.

---

## §10. Status

- **Drafted:** 2026-05-09 (Pass 231k).
- **Status:** ACTIVE bridge document. Updated when the convergence
  topology shifts (e.g., a §6 candidate ships and joins §1; a §7
  question resolves and migrates to §6).
- **Authority:** REFERENCE. Subordinate to LAW_MAP_RENDERER_CONTRACT
  and the active PLAN sequence.
- **Owner approval required:** false (this doc records architectural
  state; it does not propose changes).
- **Supersedes:** none.
- **Superseded by:** none.

**Block D characterization era closed at Pass 231k.** Phase 1
controlled-convergence era begins at Pass 232 — owner-gated.
