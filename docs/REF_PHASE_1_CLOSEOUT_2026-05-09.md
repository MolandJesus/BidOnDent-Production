---
status: CANONICAL
authority: REFERENCE
scope: phase-1-tier-bc-alignment-closeout-and-dispatch
canonical_source_of_truth: REF_PHASE_1_CLOSEOUT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Phase 1 ("Lowest-risk Tier B/C alignment") closeout. Captures what the four Phase 1 passes (232/233/234/235) delivered, the convergence metadata convention they ratified, the updated dispatch packet for Phase 2 (motion conformance + Engine 3 contract), and the explicit owner-mandated STOP gate before Engine 2 work begins.
last_updated: 2026-05-09
---

# Phase 1 — Closeout + Dispatch Packet (2026-05-09)

> Phase 1 / final pass. **STOP gate.** No Engine 2 work, no Host A/B
> modification, no operational runtime semantics change, no
> persistence change, no reroute lifecycle change, no continuity
> guarantee change executes after this without explicit owner
> authorization for the specific next pass.

---

## §1. Phase 1 mission recap

Owner-stated mission (verbatim from the post-Block-D ratification):

> **Phase 1 — Lowest-risk Tier B/C alignment.** Pass 232 →
> Pass 233 → Pass 234 → Pass 235. STOP. Must preserve: Preview
> runtime identity, no Operational escalation leakage, panel-first
> doctrine.

The four Tier B preview surfaces enumerated in the
`PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md` carry-forward map
(231b §5) all needed:

1. Self-declaration of runtime class (`preview`).
2. Self-declaration of tier semantic (`B`).
3. Self-declaration of escalation target (`data-expand-target`).
4. Confirmation of the 231c §4.2 tap-to-expand contract.
5. Confirmation of the 231c §6 panel-first archetype.

Phase 1 did not change runtime semantics. It did not change camera
authority. It did not change persistence. It only made the existing
runtime alignment **machine-verifiable** by lifting it into the DOM
via the standard `data-runtime-class` / `data-tier-semantic` /
`data-expand-target` attributes plus the 10-point convergence
metadata comment block.

---

## §2. What the four Phase 1 passes delivered

| Pass | Surface                               | Commit      | What changed                                                                                                                                                                                       | What did not change                                                                                                                                                                                                                                                                                                                          |
| ---- | ------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 232  | `ReportDetailScreen`                  | `271e737e`  | Convergence metadata + tier attributes on the report-location map block. Added `Maximize2` + "Tap to expand" overlay. Added `onMapClick={onFindShops}` to `<DashboardMapPreview>`.                 | Existing "View All Shops on Map" CTA preserved verbatim. No runtime / camera / persistence change.                                                                                                                                                                                                                                           |
| 233  | `ReportsListScreen`                   | `ad97b3c7`  | Convergence metadata + tier attributes on the reports overview map. `data-expand-target="DEFERRED:full-reports-map-not-yet-implemented"`.                                                          | Tap-to-expand affordance NOT added (governance halt — narrow): 231b §5 names a target that does not yet exist. Pin tap → individual report (preview→preview drill via existing `onSelectReport`) remains the only escalation. The Class A acknowledgement entry on `motion.section` was preserved verbatim and remains `reduceMotion`-aware. |
| 234  | `CustomerMapWidget` + `ShopMapWidget` | `34a6fd83`  | Convergence metadata + tier attributes on both widgets. `CustomerMapWidget` → `coverage-map`. `ShopMapWidget` → `shop-directory`.                                                                  | Both widgets were already correctly aligned at the runtime level (both wire `onMapClick={onViewShops}`, both show prominent expand CTAs). This pass only added the tier declaration so the alignment is machine-verifiable.                                                                                                                  |
| 235  | `CompetitorAnalysisScreen`            | _this pass_ | Convergence metadata + tier attributes on the competitor density `motion.section`. Added `onMapClick={onOpenMap}` to `<DashboardMapPreview>`. `data-expand-target="shop-directory-analysis-mode"`. | Pin tap remains an in-screen analysis state mutation (`setFocusedCompetitorId`) — preview→preview, not an escalation. Existing motion.section is the Class A acknowledgement entry, already `reduceMotion`-aware. No runtime / camera / persistence change.                                                                                  |

Total surfaces aligned: **5** (Phase 1 promised 4 surface passes;
Pass 234 covered two widgets in one commit per the carry-forward
map's grouping).

---

## §3. The 10-point convergence metadata convention (ratified)

Every Phase 1 pass declared the same 10-point metadata block in
the source code immediately above the affected JSX surface. This
convention is **architectural law** going forward (per owner
ratification, "every pass MUST declare 10-point convergence
metadata"):

```
 1. Runtime paths touched     : P1–P9
 2. Runtime classes touched   : Operational / Exploratory / Preview
 3. Tier semantics touched    : A / B / C
 4. Motion classes touched    : P / A / O
 5. Shell hierarchy impact    : (panel-first / map-first / hybrid)
 6. Authority semantics       : (changed / unchanged)
 7. Reduced-motion inheritance: (impact / unchanged)
 8. Hidden-authority risk     : (zero / low / medium / high + why)
 9. Continuity guarantees     : (affected / unaffected)
10. Rollback semantics        : (how to revert + what behavior reverts to)
```

The DOM convention complements the comment block:

- `data-runtime-class="preview" | "exploratory" | "operational"`
- `data-tier-semantic="A" | "B" | "C"`
- `data-expand-target="<destination>" | "DEFERRED:<reason>"`
- `data-affordance="tap-to-expand"` (on the visible affordance
  element, when one exists distinct from the surface wrapper)

Future audits should be able to grep for `data-runtime-class` and
get a complete inventory of declared map surfaces.

---

## §4. What Phase 1 unlocks

Phase 1 establishes the **declarative runtime ground truth** for
every Tier B preview surface in the codebase. With this in place:

1. **Phase 2 (motion conformance + Engine 3 contract)** can begin
   knowing exactly which surfaces inherit Engine 3's existing
   `scrollZoom={false}` / `dragPan={false}` Tier B doctrine
   (lines 163–164 of `MapLibreDashboardMapPreview`) and exactly
   which surfaces declare which escalation targets.

2. **Convergence audits** (manual or automated) can now compare:
   `data-tier-semantic` declared on a surface vs. the Engine 3
   contract values at the renderer. Any drift between declaration
   and reality becomes a tractable diff, not an archaeology problem.

3. **The carry-forward map (231b §5)** can be marked PARTIALLY
   SATISFIED: every Tier B surface now self-declares its escalation
   target. Targets that do not yet exist (e.g.
   `full-reports-map-not-yet-implemented` from Pass 233) are
   documented in source as `DEFERRED:` with a reason, instead of
   being silently absent.

4. **Future preview surfaces** have a hard-required template: the
   10-point convergence metadata block + the three `data-*`
   attributes. Reviewers can demand both before merging any new
   map-bearing component.

---

## §5. What Phase 1 explicitly did NOT do

These were forbidden categories per owner Phase 1 directive and
remain out of scope:

- ❌ Host A / Host B orchestration changes.
- ❌ Operational runtime semantics changes.
- ❌ Engine 2 (`MapLibreShopDirectoryMapPane`) authority rewrites.
- ❌ Persistence behavior changes.
- ❌ Reroute lifecycle changes.
- ❌ Continuity guarantee changes.
- ❌ Engine merging.
- ❌ Hidden camera authority introduction.
- ❌ Reduced-motion inheritance weakening.

Phase 1 verified, line by line, that every edit preserved these
invariants. The convergence metadata block in each pass commit
documents the verification trail.

---

## §6. STOP gate — owner-mandated, binding

Per owner ratification of Block D:

> **At the end of Pass 235: STOP again. No Engine 2 work begins
> automatically.**

This STOP gate is binding. The next phase (Phase 2 — motion
conformance + Engine 3 contract) requires explicit owner
authorization with:

1. Confirmation of Phase 2 scope.
2. Confirmation that Engine 2 remains untouched in Phase 2.
3. Confirmation of the per-pass STOP cadence within Phase 2.

Until that authorization arrives, no further Phase 1+ map work
runs.

---

## §7. Updated dispatch packet for Phase 2 (motion conformance + Engine 3 contract)

> Not authorized to execute. Provided as the planning artifact for
> the next owner conversation.

### §7.1 Phase 2 scope (provisional)

Phase 2's purpose is to make Engine 3's runtime contract conform
to the canonical motion + reduced-motion rules in
`LAW_ANIMATION_AND_ATMOSPHERE.md` and
`docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md`. Specifically:

1. Audit Engine 3 (`MapLibreDashboardMapPreview`) for any
   imperative camera motion (e.g. `flyTo`, `easeTo`, `jumpTo`)
   that does not respect `prefers-reduced-motion`.
2. Audit Engine 3 for any layer / source mutation that triggers
   implicit camera motion.
3. Audit Engine 3 for tooltip / interaction motion that does not
   respect `prefers-reduced-motion`.
4. Verify Engine 3's `data-tier-semantic="B"` consumers (the 5
   Phase 1 surfaces) all behave correctly under
   `prefers-reduced-motion: reduce`.

### §7.2 Phase 2 hard constraints (provisional)

- Engine 2 MUST remain untouched.
- Host A / Host B MUST remain untouched.
- Operational runtime paths (P1, P2, P5–P9) MUST remain untouched.
- Camera authority on Engine 3 MUST remain "preview owns no camera"
  (Engine 3 is stateless re. camera per Phase 1 verification).
- Persistence MUST remain untouched.
- Per-pass STOP cadence MUST be enforced.

### §7.3 Phase 2 success criteria (provisional)

- `prefers-reduced-motion: reduce` audit script (Phase 2-2 prep:
  `scripts/audit-reduced-motion.mjs` already exists) passes for
  all 5 Phase 1 surfaces.
- Engine 3 contract section in
  `docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md` is updated with
  measured conformance evidence.
- No regression on Engine 3's existing Tier B doctrine
  (`scrollZoom={false}` / `dragPan={false}`).

---

## §8. Co-update rules satisfied by this closeout

- ✅ `REF_KNOWN_ISSUES.md` — no new bugs introduced; no resolved
  issues to mark. (Phase 1 was declarative only.)
- ✅ `REF_SYSTEM_STATE.md` — no migration / no edge endpoint
  change.
- ✅ `docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md` — Engine 3
  consumer count (6 callers) unchanged. The 5 Phase 1 surfaces
  represent 5 of those 6 consumers. The sixth is
  `MapLibreDashboardMapPreview.test.tsx` (test). _(This file is
  owner-dirty / untracked per the Phase 1 hard-stop list and was
  not touched.)_
- ✅ `docs/REF_BLOCK_D_CLOSEOUT_2026-05-09.md` — Block D's STOP
  gate has been respected; this doc documents the partial lift.

---

## §9. Hard-stop file list (carried forward from Phase 1)

These files were owner-dirty or owner-untracked at the start of
Phase 1 and were NEVER touched:

- `CLAUDE.md`
- `docs/LAW_PROJECT_RULES.md`
- `docs/PLAN_AUDIT_DEEP_2026-05-07.md`
- `docs/PLAN_MAP_UNIFICATION_2026-05-08.md`
- `docs/REF_AI_COLLABORATION_PROTOCOL.md`
- `docs/REF_BLOCK_C_DISPATCH_PACKET_2026-05-09.md`
- `docs/REF_BLOCK_D_CLOSEOUT_2026-05-09.md`
- `docs/REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md`
- `docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md`
- `docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md`
- `src/app/test-utils/mapTestHarness.ts` _(this AI's own Pass 231e
  output, but flagged owner-dirty by collaboration protocol since
  the resume of Phase 1)_
- `src/app/features/navigation/computeNavigationMetrics.test.ts`
- `src/app/utils/edgeErrorMessage.test.ts`
- `src/app/utils/formatVehicleLabel.test.ts`
- `docs/COWORK_GLOBAL_INSTRUCTIONS.md` _(untracked)_
- `src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx`
  _(untracked)_

This list carries forward into Phase 2 unchanged unless owner
explicitly clears specific files.

---

## §10. End of Phase 1

Phase 1 is complete. The next action is owner authorization (or
denial) of Phase 2 per §6.
