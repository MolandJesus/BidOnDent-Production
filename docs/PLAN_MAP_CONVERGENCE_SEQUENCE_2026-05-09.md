---
status: PROPOSED
authority: PLAN
scope: map-runtime-convergence-sequencing
canonical_source_of_truth: PLAN_MAP_CONVERGENCE_SEQUENCE_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Per-surface tier classification + ordered runtime convergence sequence with phase gates and required test coverage per step.
last_updated: 2026-05-09
---

# PLAN — Map Runtime Convergence Sequence (PROPOSED)

> Block C / Pass 227 deliverable. **PROPOSED — not yet authorized.**
> No runtime changes execute until owner ratifies LAW_MAP_RENDERER_CONTRACT
> at/after Pass 230 AND explicitly authorizes Pass N+1 (first runtime
> convergence pass).
>
> Authority tier: PLAN. Conflicts with REF/LAW resolved against this doc.
>
> Inputs:
>
> - [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) — Pass 226 draft contract
> - Passes 223, 224, 225, 225.5 (all four REF audits)

---

## §1. Per-surface tier classification (proposed)

Every existing map mount, classified per LAW_MAP_RENDERER_CONTRACT § 4.

| Surface                     | File                                           | Engine today | Proposed tier            | Notes                                                                                                                                                                                      |
| --------------------------- | ---------------------------------------------- | ------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Coverage map                | `MapLibreServiceCoverageMap` (mounts Engine 1) | 1            | **Tier A** (with caveat) | Caveat: today's coverage NAV runtime is partial (Pass 224). Tier A requires either growing into Host B or downgrading to Tier B preview. Open question § 7.1 of LAW_MAP_RENDERER_CONTRACT. |
| Shop directory map          | `MapLibreShopDirectoryMapPane` (Engine 2)      | 2            | **Tier A**               | Already meets Tier A nav-runtime obligations via Host B. Camera authority must migrate from imperative to declarative per § 2 of contract.                                                 |
| Customer dashboard preview  | `CustomerMapWidget` (Engine 3)                 | 3            | **Tier B**               | Has shop click + map click handlers → Tier B.                                                                                                                                              |
| Shop dashboard preview      | `ShopMapWidget` (Engine 3)                     | 3            | **Tier B**               | Service-area overlay + map click → Tier B.                                                                                                                                                 |
| Insurer dashboard preview   | `InsurerMapWidget` (Engine 3)                  | 3            | **Tier B**               | Map click → Tier B.                                                                                                                                                                        |
| Reports list preview        | `ReportsListScreen` (Engine 3)                 | 3            | **Tier B**               | Report-pin click → Tier B.                                                                                                                                                                 |
| Report detail map           | `ReportDetailScreen` (Engine 3)                | 3            | **Tier C candidate**     | Single pin, no click handlers, no overlay. Lowest-risk first convergence target (Pass 225 § 6.2). Owner decides Tier B vs Tier C in § 7.4 of contract.                                     |
| Competitor analysis preview | `CompetitorAnalysisScreen` (Engine 3)          | 3            | **Tier B**               | Shop click → Tier B.                                                                                                                                                                       |

**Summary:** 2 Tier A, 5 Tier B, 1 Tier C-candidate. No surface is
Tier A-only-after-convergence; both Tier A surfaces exist today.

---

## §2. Ordered convergence sequence

Sequence is ordered by **risk-ascending**, not by file count or
visual impact. Each step is a separate pass; each pass follows
LAW_MAP_RENDERER_CONTRACT § 5 discipline.

### Phase 1 — Lowest-risk Tier B/C alignment (passes 232–235)

> Goal: prove the contract works on the safest surface before touching
> any Tier A surface.

| #   | Pass | Surface                                                    | Action                                                                                                                                   | Risk |
| --- | ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | 232  | `ReportDetailScreen`                                       | Lock Tier C classification (or Tier B with strict props per owner § 7.4 decision). Add explicit `autoFit` prop. Wire `onLoad`/`onError`. | low  |
| 2   | 233  | `ReportsListScreen`                                        | Lock Tier B classification. Add explicit `autoFit` prop. Wire `onLoad`/`onError`. Verify tap-to-expand affordance visible.               | low  |
| 3   | 234  | `CustomerMapWidget` + `ShopMapWidget` + `InsurerMapWidget` | Lock Tier B classification on all three. Add explicit `autoFit` prop (resolves Pass 225 § 4 hidden authority).                           | low  |
| 4   | 235  | `CompetitorAnalysisScreen`                                 | Lock Tier B. Same conformance work. Phase 1 complete.                                                                                    | low  |

**Phase 1 gate:** all 6 Tier B/C surfaces declare tier explicitly,
honor `autoFit` prop, wire failure-surface handlers. No engine swap
yet. No camera authority changes. No navigation runtime changes.
This phase only adds explicit declaration and closes hidden-authority
gaps.

**What breaks if Phase 1 ships incorrectly:** preview viewport
behavior changes (auto-fit may stop overriding when callers pass
center/zoom). Mitigation: default `autoFit` to `'when-no-caller-bounds'`
to preserve current behavior; callers opt into other modes.

### Phase 2 — Engine 2 contract conformance (passes 236–238)

> Goal: bring the existing Tier A shop directory engine into contract
> conformance without swapping the engine.

| #   | Pass | Surface                        | Action                                                                                                                                      | Risk   |
| --- | ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 5   | 236  | `MapLibreShopDirectoryMapPane` | Replace imperative `flyTo` calls in `MapLibreShopDirectoryViewportManager` with declarative revision-keyed controllers per § 2 of contract. | high   |
| 6   | 237  | Same                           | Wire `prefers-reduced-motion` consultation into all camera transitions (closes LAW_ANIMATION_AND_ATMOSPHERE gap from Pass 225.5 § 5).       | medium |
| 7   | 238  | Same                           | Centralize layer authority (currently distributed across 4 children per Pass 223).                                                          | medium |

**Phase 2 gate:** Engine 2 conforms to LAW_MAP_RENDERER_CONTRACT § 2

- § 3 fully. Camera authority is now uniform across both Tier A
  engines. Phase 2 is the highest-risk phase because it modifies the
  live navigation runtime.

**What breaks if Phase 2 ships incorrectly:** route preview animation
feel changes; reroute camera transitions may stutter; voice/toast
timing may shift. Mitigation: per-pass smoke test of full Host B
navigation runtime (route → reroute → arrival).

### Phase 3 — Coverage navigation classification (passes 239–24X)

> Goal: resolve LAW_MAP_RENDERER_CONTRACT § 7.1 open question. Sequence
> depends on owner's decision.

**Branch A: coverage grows into Host B (Tier A path)**

| #   | Pass | Surface                           | Action                                                                                             | Risk     |
| --- | ---- | --------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| 8a  | 239a | `useCoverageNavigationExperience` | Add `useNavigationSession` (cloud sync).                                                           | critical |
| 9a  | 240a | Same                              | Add `useNavigationReroute` (gated reroute).                                                        | critical |
| 10a | 241a | Same                              | Add `useNavigationLifecycleEffects` (wake-lock, visibility).                                       | high     |
| 11a | 242a | Same                              | Add `useNavigationVoiceAlerts` + `useNavigationToastBridge`.                                       | medium   |
| 12a | 243a | Same                              | Reconcile `bidondent_navigation_session` legacy key vs `bidondent_nav_*` cluster (Pass 224 § 2.2). | high     |

**Branch B: coverage downgrades to Tier B preview (preview-only path)**

| #   | Pass | Surface          | Action                                                                                                      | Risk   |
| --- | ---- | ---------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| 8b  | 239b | Coverage surface | Reclassify as Tier B. Remove live nav entry points. Hand off to shop directory (Tier A) for any nav action. | high   |
| 9b  | 240b | Coverage surface | Strip `useNavigationGpsTracking` + `useNavigationRoutePreview` from coverage if not needed for preview.     | medium |
| 10b | 241b | Coverage surface | Update copy + UI affordances to remove "navigate" terminology.                                              | low    |

**Phase 3 gate:** "navigation" denotes ONE runtime, not two. Pass 224
§ 5 mental-model break is resolved.

### Phase 4 — Engine 1/2 evaluation (passes 24Y–24Z)

> Goal: only AFTER Phases 1–3 ship, evaluate whether Engines 1 and 2
> can collapse into a single canonical engine, or whether keeping both
> is acceptable now that they share a contract.

This phase is intentionally NOT scoped here. The owner decides whether
to enter it after observing Phases 1–3. Per the project framing, the
goal is **minimum conceptual fragmentation, not minimum file count**
— two engines under one contract is acceptable; one engine under one
contract is preferable but not required.

---

## §3. Phase gates

Between each phase the following MUST be true before the next phase
starts:

1. All passes in the previous phase merged with green builds.
2. Test coverage from Pass 228 (forthcoming) gap analysis met for
   that phase's risk level.
3. Owner explicit "proceed to Phase N+1" authorization.
4. No new KI entries opened against the converged surfaces in the
   intervening time without resolution.
5. Documentation updates per LAW_MAP_RENDERER_CONTRACT § 5 in each
   merged pass.

---

## §4. Estimated test coverage required per risk level

(Detailed in Pass 228; previewed here.)

| Risk     | Mount/unmount tests | Visual diff | Smoke test required                                                                    |
| -------- | ------------------- | ----------- | -------------------------------------------------------------------------------------- |
| Low      | required            | required    | n/a                                                                                    |
| Medium   | required            | required    | reduced-motion + autoFit prop                                                          |
| High     | required            | required    | full surface interaction (gesture, click, panel)                                       |
| Critical | required            | required    | full Host B nav runtime smoke (route, reroute, voice, toast, wake-lock, cloud restore) |

---

## §5. Rollback strategy

Each pass MUST have a per-pass rollback plan (LAW contract § 5.1).
Sequence-level rollback strategy:

- Phase 1 rollback: revert per-pass commits; props restore to
  default; no data state to clean.
- Phase 2 rollback: revert per-pass commits; Engine 2 returns to
  imperative flyTo. No data state to clean.
- Phase 3 rollback (Branch A): revert per-pass commits; coverage
  navigation returns to subset runtime. Cloud session keys may have
  been written for coverage users — these can be left in place
  (per-user keys, no cross-user impact) or swept via the existing
  `clearAllUserScopedSessionKeys` cleanup.
- Phase 3 rollback (Branch B): revert per-pass commits; coverage
  surface re-enters live nav runtime. No data state to clean.
- Phase 4 rollback: revert per-pass commits; restore prior engine.

**Hard rule:** no convergence pass may make a non-revertible data
mutation. Schema changes, persistent storage migrations, and any
write that cannot be cleanly undone are FORBIDDEN within convergence
passes. They require a separate authorized pass per
LAW_PROJECT_RULES.

---

## §6. What this plan deliberately does NOT do

- Does not declare an engine count outcome. Two engines under one
  contract is acceptable.
- Does not pre-commit Branch A vs Branch B for Phase 3. Owner
  decides at Pass 230 ratification.
- Does not specify exact test file paths. That is Pass 228's job.
- Does not estimate calendar time. Estimates would be guesses.
- Does not authorize any pass. Authorization is per-pass, after
  Pass 230 owner gate.

---

## §7. Status

- **Drafted:** 2026-05-09 (Pass 227).
- **Status:** PROPOSED.
- **Authorization gate:** Pass 230 owner ratification.
- **Until ratification:** informational only.
- **After ratification:** authority becomes PLAN-binding for the
  ordered execution sequence.
