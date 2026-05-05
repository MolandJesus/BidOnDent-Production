# Section-Doc Index by Phase (PLAN)

**Authority level:** PLAN — pre-declares the ~11 documentation artifacts that Phase 4 through Phase 8.5 of the v3.3 master plan will generate.

**Last updated:** 2026-05-04

**Purpose:** Without this index, each Phase 4+ commit would invent its own doc filename and the tree would grow chaotically. This pre-declaration lets the owner see the entire doc-growth surface upfront and lets each phase commit land in a clean tree with a tier-consistent name.

**Companion docs:**

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — the architecture charter
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — the LAW > REF > PLAN > OPS tier model
- [`PLAN_DOC_CONSOLIDATION_2026-05-04.md`](PLAN_DOC_CONSOLIDATION_2026-05-04.md) — the Phase 1.5 consolidation that cleaned the tree before this index pre-declaration
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon (referenced by every design-touching new doc)

---

## Tier conventions for new docs

Every new doc generated in Phase 4–8.5 must follow these rules:

| Tier     | Prefix  | When to use                                                                           | Authority                                             |
| -------- | ------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **LAW**  | `LAW_`  | Permanent behavioral rules / charters / canon. New canon never overrides MOLANDJESUS. | Cannot be violated without per-session owner override |
| **REF**  | `REF_`  | Current truth. Authoritative for "what is"                                            | Updated when system state changes                     |
| **PLAN** | `PLAN_` | Future direction. Not current truth                                                   | Triggers required before action                       |
| **OPS**  | `OPS_`  | Procedures, runbooks, audit logs, phase execution logs                                | Reference-only; describes what was done               |

Date-suffixed audit/log docs use the format `OPS_<TOPIC>_YYYY-MM-DD.md` (e.g. `OPS_MOBILE_AUDIT_2026-05-04.md`).

---

## Pre-declared docs by phase

### Phase 3.6 — Dependabot triage (added 2026-05-04 mid-execution)

| Doc                                   | Tier | Purpose                                                                                                                                               | Notes                                                                                                              |
| ------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `OPS_DEPENDABOT_TRIAGE_2026-05-04.md` | OPS  | Snapshot of `npm audit` triage executed in Phase 3.6. Classification (runtime/build-only/framework-pinned), bump scope, hard-stop check, build state. | **SHIPPED 2026-05-04** alongside the Clerk + postcss patch commits (`9b11bb9b`, `df122c25`). All 3 vulns resolved. |

### Phase 4 — Mobile audit doc + sweep

| Doc                               | Tier | Purpose                                                                                                                                    | Notes                                                                                              |
| --------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `OPS_MOBILE_AUDIT_2026-05-XX.md`  | OPS  | Pre-sweep audit — viewport overflow, sub-44px touch targets, modal/drawer traps, missing safe-area insets, gesture conflicts. ~150 lines.  | Date suffix set on commit day. Per [`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md). |
| `LAW_MOBILE_VIEWPORT_DOCTRINE.md` | LAW  | (Conditional) Mobile viewport canon if owner approves extraction from `REF_VISUAL_SYSTEM.md`. May not generate if existing canon suffices. | Cross-refs MOLANDJESUS as apex.                                                                    |

### Phase 4.5 — Animation/atmosphere charter

| Doc                               | Tier | Purpose                                                                                                                                                                                                                      | Notes                                                                                                                                                                                                                                                                                                     |
| --------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LAW_ANIMATION_AND_ATMOSPHERE.md` | LAW  | Permitted motion vocabulary, performance budget, `prefers-reduced-motion` contract, section-transition pattern, atmosphere-folder rules. CSS-first; framer-motion deferred to explicit Phase 4.6 if 6.5/7.5 hits a CSS wall. | **SHIPPED 2026-05-04.** 5 sections: (1) what motion is for (trust + spatial continuity, never decoration), (2) 29 canonical keyframes catalogued in 6 categories, (3) mandatory `prefers-reduced-motion` contract, (4) atmosphere folder reservation timing, (5) framer-motion escape clause (Phase 4.6). |

### Phase 5 — Map architecture diagnose

| Doc                                           | Tier | Purpose                                                                                                                                                                                        | Notes                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md` | OPS  | Read-only diagnose: every map-touching file, layer assignment, line counts, provider boundary audit, state-flow diagram, mobile/desktop divergence map, demo data isolation check. ~300 lines. | **SHIPPED 2026-05-04.** Findings: 0 P0/P1/P2; 2 P3 (L2→L4 systemic + useOperatingRegionsCoverage grandfathered); 0 P4; 1 P5 (shopMapExperience coupling); 1 P6 (command-center monolith). Conditional `PLAN_MAP_L3_L4_BOUNDARY.md` SKIPPED per relay "don't force it" rule — owner reviews diagnose first. |
| `PLAN_MAP_L3_L4_BOUNDARY.md`                  | PLAN | Formal proposal for L3 orchestration + L4 service-layer boundaries identified by the diagnose. Each subsection is owner-greenlight-gated.                                                      | **NOT WRITTEN 2026-05-04** — diagnose found P3 systemic pattern but pre-locking Phase 8 scope before owner review risks scope creep. Owner-named only. Row retained in this index as conditional for any future Phase 5.x or Phase 8 prep authorization.                                                   |

### Phase 6 — Landing + dashboard map redesign

| Doc                                             | Tier | Purpose                                                                                                                                                                                                                              | Notes                                                                                                                                                                                |
| ----------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PLAN_PHASE_6_SCOPE.md`                         | PLAN | Scope contract for Phase 6: product intent, in/out-of-scope surfaces, cluster breakdown, risks pulled from Phase 5 diagnose, owner decision points, success criteria, rollback plan. Mirrors `PLAN_PHASE_4_MOBILE_SWEEP.md` pattern. | **SUPERSEDED 2026-05-04** by `OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`. Status banner + retrospective added at top of doc. Preserved as historical reference.                  |
| `OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md` | OPS  | Read-only audit of Clusters 6B / 6C / 6D / 6E surfaces after Cluster 6A halt revealed scope-contract premise was wrong. Verifies canon compliance, KI-108 inventory, Pass C / prior sweep coverage, revised commit estimates.        | **SHIPPED 2026-05-04.** Phase 6 closed via Path A — 1 fix commit (Cluster 6E DashboardCoveragePanel defensive light-mode text-color gating). 3 of 5 clusters had 0 findings.         |
| `OPS_LANDING_DASHBOARD_MAP_REDESIGN_LOG.md`     | OPS  | Per-commit execution log for the landing+dashboard map redesign sub-phases. One entry per shipped commit with file-touched list and visual-verification note.                                                                        | **NOT WRITTEN 2026-05-04** — Path A produced only one fix commit; the audit doc is the durable record so a separate execution-log doc would be redundant. Conditional doc cancelled. |

**Phase 6 status: CLOSED 2026-05-04** (Path A executed — single 6E defensive fix; majority subsumed by Pass C / Pass H / KI-091).

### Phase 6.5 — Landing atmosphere + section transitions

| Doc                                               | Tier | Purpose                                                                                                                                                                                                 | Notes                                                                                                                                                                                                          |
| ------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md` | OPS  | Read-only audit of landing atmosphere infrastructure (parallax, idle drift, section transitions, gold lamp breathing) against `LAW_ANIMATION_AND_ATMOSPHERE.md`. Mirrors Phase 6 pre-execution pattern. | **SHIPPED 2026-05-04.** Findings: 0 defensive (1 aesthetic gap parked as KI-112). 4 of 4 originally-scoped deliverables ship-shape. Phase 6.5 closed via **Path B** (close-only with deferred-aesthetic note). |
| `OPS_LANDING_ATMOSPHERE_LOG.md`                   | OPS  | Per-commit execution log for landing atmosphere passes (parallax, idle drift, gold lamp breathing, section transitions).                                                                                | **NOT WRITTEN 2026-05-04** — Path B chosen; the audit doc + KI-112 are the durable record. Same outcome as Phase 6's `OPS_LANDING_DASHBOARD_MAP_REDESIGN_LOG`.                                                 |

**Phase 6.5 status: CLOSED 2026-05-04** (Path B executed — atmosphere infrastructure subsumed by prior sweeps; gold-lamp-breathe aesthetic gap parked as KI-112 P7-TECHDEBT).

### Phase 7 — Bids/report/shop/insurer map redesign

| Doc                                             | Tier | Purpose                                                                                                                                                                                         | Notes                                                                                                                                                                     |
| ----------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md` | OPS  | Read-only audit of Phase 7 surfaces (bids, report wizard map step, shop directory, insurer screens) against `LAW_LAYERED_ARCHITECTURE.md` + `MOLANDJESUS`. Mirrors Phase 6 + 6.5 audit pattern. | **SHIPPED 2026-05-04.** Findings: 0 defensive (1 P6 already-tracked KI-111). 0 hard-limit violations. KI-108–112 inventories all verified. Phase 7 closed via **Path B**. |
| `OPS_BIDS_REPORT_SHOP_INSURER_MAP_LOG.md`       | OPS  | Per-commit execution log for the remaining-map-surface redesign. Includes shop/ sub-folder split decision if shop dir grows past hard limit during this phase.                                  | **NOT WRITTEN 2026-05-04** — Path B chosen; the audit doc + KI-111 are the durable record. Same outcome as Phase 6 + 6.5 close-only paths.                                |

**Phase 7 status: CLOSED 2026-05-04** (Path B executed — visual + functional surfaces subsumed by prior sweeps; `shop/` sub-folder split deferred owner-named, tracked as KI-111 P6).

### Phase 7.5 — Dashboard atmosphere + interior animations

| Doc                               | Tier | Purpose                                                                                                                                        | Notes                                         |
| --------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `OPS_DASHBOARD_ATMOSPHERE_LOG.md` | OPS  | Per-commit execution log for dropdown entrance/exit animations, mini-map idle drift, Smart Map Tools hover, card-stack reveal, sidebar timing. | Cross-refs `LAW_ANIMATION_AND_ATMOSPHERE.md`. |

### Phase 8 — Map L3/L4 + provider boundary

| Doc                              | Tier | Purpose                                                                                                                                                                     | Notes                                                                                                           |
| -------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `OPS_MAP_L3_L4_EXECUTION_LOG.md` | OPS  | Per-commit execution log for the high-risk L3/L4 boundary work. Each commit references which `PLAN_MAP_L3_L4_BOUNDARY.md` subsection it implements + verification evidence. | Per-commit owner gate. Skill notes: `supabase-clerk-edge-function`, `supabase-storage-signed-urls` if relevant. |

### Phase 8.5 — Map ambient + idle motion

| Doc                             | Tier | Purpose                                                                                                   | Notes                                                                |
| ------------------------------- | ---- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `OPS_MAP_AMBIENT_MOTION_LOG.md` | OPS  | Per-commit execution log for route preview draw-on, pin pulse, camera idle drift, liquid sheen extension. | Cross-refs `LAW_ANIMATION_AND_ATMOSPHERE.md`. Per-commit owner gate. |

---

## Total expected new docs (Phases 4 through 8.5)

| Tier | Count | Files                                                                                                                                                                                                   |
| ---- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LAW  |   1–2 | `LAW_ANIMATION_AND_ATMOSPHERE.md` (definite), `LAW_MOBILE_VIEWPORT_DOCTRINE.md` (conditional, owner gate)                                                                                               |
| PLAN |     1 | `PLAN_MAP_L3_L4_BOUNDARY.md`                                                                                                                                                                            |
| OPS  |     8 | mobile audit, map architecture diagnose, landing+dashboard map log, landing atmosphere log, bids/report/shop/insurer map log, dashboard atmosphere log, map L3/L4 execution log, map ambient motion log |

**Total: 10–11 new docs over the full Phase 4–8.5 span.** Predictable doc growth, clear tiers, clear naming pattern. No surprise docs.

---

## Additions/changes during execution

If a phase needs a doc not listed here, the phase commit must update this index in the same commit (add a row, note the rationale). This index is the running contract for the doc-growth surface.

If a doc listed here is not generated (e.g. `LAW_MOBILE_VIEWPORT_DOCTRINE.md` is conditional), the phase commit that decides "not generating" must mark the row in this index with strikethrough + reason.

## Cross-references

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — code organization charter
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — doc tier model + co-update rules
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon
- [`PLAN_DOC_CONSOLIDATION_2026-05-04.md`](PLAN_DOC_CONSOLIDATION_2026-05-04.md) — Phase 1.5 consolidation plan that this index follows
- [`README.md`](README.md) — docs operating index
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination state
