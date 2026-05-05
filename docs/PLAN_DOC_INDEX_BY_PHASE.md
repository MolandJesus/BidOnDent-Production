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

| Doc                                           | Tier | Purpose                                                                                                                                                                                        | Notes                                                              |
| --------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-XX.md` | OPS  | Read-only diagnose: every map-touching file, layer assignment, line counts, provider boundary audit, state-flow diagram, mobile/desktop divergence map, demo data isolation check. ~300 lines. | Doc-only commit; no code changes.                                  |
| `PLAN_MAP_L3_L4_BOUNDARY.md`                  | PLAN | Formal proposal for L3 orchestration + L4 service-layer boundaries identified by the diagnose. Each subsection is owner-greenlight-gated.                                                      | Cross-refs `LAW_LAYERED_ARCHITECTURE.md` and `PLAN_MAP_MASTER.md`. |

### Phase 6 — Landing + dashboard map redesign

| Doc                                         | Tier | Purpose                                                                                                                                                       | Notes                                         |
| ------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `OPS_LANDING_DASHBOARD_MAP_REDESIGN_LOG.md` | OPS  | Per-commit execution log for the landing+dashboard map redesign sub-phases. One entry per shipped commit with file-touched list and visual-verification note. | Cross-refs MOLANDJESUS for any design choice. |

### Phase 6.5 — Landing atmosphere + section transitions

| Doc                             | Tier | Purpose                                                                                                                  | Notes                                         |
| ------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `OPS_LANDING_ATMOSPHERE_LOG.md` | OPS  | Per-commit execution log for landing atmosphere passes (parallax, idle drift, gold lamp breathing, section transitions). | Cross-refs `LAW_ANIMATION_AND_ATMOSPHERE.md`. |

### Phase 7 — Bids/report/shop/insurer map redesign

| Doc                                       | Tier | Purpose                                                                                                                                                        | Notes                                          |
| ----------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `OPS_BIDS_REPORT_SHOP_INSURER_MAP_LOG.md` | OPS  | Per-commit execution log for the remaining-map-surface redesign. Includes shop/ sub-folder split decision if shop dir grows past hard limit during this phase. | Cross-refs MOLANDJESUS + `PLAN_MAP_MASTER.md`. |

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
