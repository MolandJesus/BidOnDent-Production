# Doc Consolidation Plan (2026-05-04)

**Authority level:** PLAN — describes the doc-tree consolidation work scoped for Phase 1.5 of the v3.3 master plan.

**Last updated:** 2026-05-04

**Status:** Active. Phase 1.5b–1.5d execute against this plan. Phase 1.5e generates the section-doc index that follows from this consolidation.

---

## Why this plan exists

The owner directive 2026-05-04 ("merge a lot of documents together if they have matching information and updating them and then making new doc for each section of this huge HUGE plan for codebase") expanded the v3.2 plan into v3.3. Without consolidating before Phase 4+ generates new section-docs, the doc tree would grow on top of existing overlap.

This plan executes consolidation **before** new docs proliferate, so each future Phase 4+ doc lands in a clean tree with a clear tier and naming pattern.

**Hard stop:** [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) is the locked apex design canon — never merged, never split, never edited per owner directive 2026-05-04. Cluster B is therefore inverted relative to first-pass audit recommendations.

---

## Doc inventory (post-Phase 1, pre-Phase 1.5b)

23 active docs in `docs/`, 9,228 LOC total. 55 archived.

| File                                       |   LOC | Tier                            | Cluster | Action                                                  |
| ------------------------------------------ | ----: | ------------------------------- | ------- | ------------------------------------------------------- |
| `PLAN_PRODUCT_BRAIN.md`                    | 1,444 | PLAN (mislabeled — mixes tiers) | A       | Split                                                   |
| `LAW_HARDENING_PLAN.md`                    |   888 | LAW                             | —       | Healthy, no action                                      |
| `REF_KNOWN_ISSUES.md`                      |   838 | REF                             | —       | Healthy, no action                                      |
| `SUPABASE_SETUP_GUIDE.md`                  |   691 | REF                             | D       | Receive onboarding appendix from D                      |
| `MOLANDJESUS_DESIGN_DECISIONS.md`          |   643 | LAW-equivalent (locked apex)    | B       | **NEVER TOUCH**                                         |
| `PLAN_DASHBOARD_REDESIGN.md`               |   489 | PLAN                            | —       | Healthy, no action                                      |
| `REF_CODE_ORGANIZATION.md`                 |   421 | REF                             | A       | Receive code-org content from PRODUCT_BRAIN             |
| `REF_SYSTEM_STATE.md`                      |   382 | REF                             | A       | Receive system-state content from PRODUCT_BRAIN         |
| `PLAN_MAP_MASTER.md`                       |   336 | PLAN                            | C       | Absorb FUTURE_NAV doc                                   |
| `REF_VISUAL_SYSTEM.md`                     |   322 | REF                             | B       | Add single deferral header → MOLANDJESUS                |
| `LAW_PROJECT_RULES.md`                     |   297 | LAW                             | —       | Healthy (just updated in Phase 1)                       |
| `REF_AI_COLLABORATION_PROTOCOL.md`         |   285 | REF                             | —       | Healthy                                                 |
| `PLAN_CHAT_SYSTEM_IMESSAGE_IOS26.md`       |   278 | PLAN                            | —       | Healthy, deferred                                       |
| `LAW_LAYERED_ARCHITECTURE.md`              |   255 | LAW                             | —       | New (Phase 1)                                           |
| `PHASE_6_SMOKE_TEST_CHECKLIST.md`          |   251 | (mislabeled, OPS-tier)          | E       | Rename to `OPS_PHASE_6_SMOKE_TEST.md`                   |
| `PLAN_POST_LAUNCH_ROADMAP.md`              |   211 | PLAN                            | —       | Healthy                                                 |
| `REF_AI_BROWSER_NAVIGATION.md`             |   208 | REF                             | —       | Healthy                                                 |
| `README.md`                                |   203 | INDEX                           | —       | Already updated in Phase 1                              |
| `PLAN_PAYMENT_MODEL.md`                    |   192 | PLAN                            | —       | Healthy, deferred                                       |
| `REF_MODULE_STATUS.md`                     |   172 | REF                             | —       | Healthy (specialized)                                   |
| `PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` |   158 | PLAN                            | C       | Archive, content already in `PLAN_MAP_MASTER`           |
| `GETTING_STARTED.md`                       |   131 | (mislabeled, OPS-tier)          | D       | Rename to `OPS_DEVELOPER_SETUP.md`, absorb GOOGLE_OAUTH |
| `GOOGLE_OAUTH_SETUP.md`                    |   125 | (mislabeled, OPS-tier)          | D       | Merge into `OPS_DEVELOPER_SETUP.md`, archive original   |
| `ATTRIBUTIONS.md`                          |     8 | LEGAL                           | —       | Standalone, fine                                        |

---

## Cluster A — System Truth (Phase 1.5c)

**Files:** `PLAN_PRODUCT_BRAIN.md` (1,444) + `REF_SYSTEM_STATE.md` (382) + `REF_CODE_ORGANIZATION.md` (421) + `REF_MODULE_STATUS.md` (172) = 2,419 LOC.

**Problem:** `PLAN_PRODUCT_BRAIN.md` mixes tiers — LAW-adjacent invariants, current REF state, and PLAN cards in one 1,444-line file. Future agents read it as gospel and get a stale partial picture.

**Action:**

1. Split `PLAN_PRODUCT_BRAIN.md` content by tier:
   - **Current-state sections** ("What BidOnDent Currently Is", role descriptions, architecture snapshots) → audit for new content vs duplicates of REF_SYSTEM_STATE/REF_CODE_ORGANIZATION/REF_MODULE_STATUS. Move new material into the matching REF doc.
   - **Code-organization sections** ("Code Organization Style To Preserve", file-layout patterns) → REF_CODE_ORGANIZATION (cross-ref LAW_LAYERED_ARCHITECTURE for new authority).
   - **Future-facing CARDS** (strategic vision, unfunded ideas, future product directions) → new file `PLAN_PRODUCT_FUTURE_CARDS.md`.
2. Replace `PLAN_PRODUCT_BRAIN.md` content with a 30-line stub redirecting readers to the three target docs (REF_SYSTEM_STATE, REF_CODE_ORGANIZATION, PLAN_PRODUCT_FUTURE_CARDS). Keep filename to preserve link integrity in archived docs that reference it.
3. Update cross-refs in CLAUDE.md, AGENTS.md, README.md if they reference PRODUCT_BRAIN.

**Risk:** Highest-LOC merge. Run after the dry-run cluster (B) succeeds.

---

## Cluster B — Design Truth (Phase 1.5b — DRY RUN)

**Files:** `REF_VISUAL_SYSTEM.md` (322) + `MOLANDJESUS_DESIGN_DECISIONS.md` (643) = 965 LOC.

**Problem:** Both docs cover identity, atmosphere, landing audit, design system locked state. First-pass audit recommended merging canon into REF_VISUAL_SYSTEM and reducing MOLANDJESUS to a "thin owner-decision log."

**Owner override 2026-05-04:** "Leave MolaandJesus doc alone and make it locked main doc for design for everything." MOLANDJESUS is the apex; REF_VISUAL_SYSTEM defers to it.

**Action (inverted):**

1. **Do NOT touch** `MOLANDJESUS_DESIGN_DECISIONS.md`.
2. Add single-line deferral header to top of `REF_VISUAL_SYSTEM.md`:
   > _Defer to [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) for canonical design rules. This doc covers component-level implementation details only._
3. No content moves. No archive operations.

**Risk:** Lowest possible. One-line edit. **Used as the dry-run merge to validate the workflow before Cluster A's higher-impact split.**

---

## Cluster C — Map Plan Consolidation (Phase 1.5d)

**Files:** `PLAN_MAP_MASTER.md` (336) + `PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` (158) = 494 LOC.

**Problem:** FUTURE_NAV_AND_MAP_FUNCTIONALITY is older and substantively subsumed by PLAN_MAP_MASTER. Two docs covering the same ground create confusion about which is current.

**Action:**

1. Verify FUTURE_NAV content is fully captured in PLAN_MAP_MASTER (or migrate any unique content first).
2. Move `PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` to `docs/archive/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY_archived_2026-05-04.md` per existing archive convention.
3. Update cross-refs in README.md, KI-075 entry in REF_KNOWN_ISSUES.md (if it references FUTURE_NAV), and any PLAN_MAP_MASTER references.

**Risk:** Low. Pure archive, content already preserved.

---

## Cluster D — Onboarding/Setup Consolidation (Phase 1.5d)

**Files:** `GETTING_STARTED.md` (131) + `GOOGLE_OAUTH_SETUP.md` (125) = 256 LOC, both effectively OPS-tier despite mislabeled location.

**Problem:** Two ad-hoc setup docs at different paths with no clear tier. Developer onboarding friction.

**Action:**

1. Create new `docs/OPS_DEVELOPER_SETUP.md` consolidating both:
   - GETTING_STARTED → "Local Environment" section
   - GOOGLE_OAUTH_SETUP → "Google OAuth Setup" section as appendix
2. Archive originals to `docs/archive/2026-05-04-doc-consolidation/`.
3. Cross-ref from README.md OPS section, SUPABASE_SETUP_GUIDE.md (for completeness).

**Risk:** Low. Pure ops content move.

---

## Cluster E — OPS Tier Formalization (Phase 1.5d)

**Files:** `PHASE_6_SMOKE_TEST_CHECKLIST.md` (251) — currently the only ops-tier doc, mislabeled.

**Problem:** Per the new LAW > REF > PLAN > OPS hierarchy formalized in Phase 1, this doc needs the OPS\_ prefix to be discoverable.

**Action:**

1. Rename `PHASE_6_SMOKE_TEST_CHECKLIST.md` → `OPS_PHASE_6_SMOKE_TEST.md` via `git mv` (preserves history).
2. Update all cross-refs (LAW_HARDENING_PLAN.md likely references it; README.md ops section).

**Risk:** Low. Rename + cross-ref updates only.

---

## Phase 1.5 commit plan (5 commits)

| Commit | Phase | Cluster | Risk        | Files touched                                                                                                                                                                            |
| ------ | ----- | ------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | 1.5a  | —       | doc-only    | This file (PLAN_DOC_CONSOLIDATION_2026-05-04.md) — new                                                                                                                                   |
| 2      | 1.5b  | B       | dry-run     | REF_VISUAL_SYSTEM.md (1 line added)                                                                                                                                                      |
| 3      | 1.5c  | A       | high-impact | PLAN_PRODUCT_BRAIN.md (rewritten as stub), REF_SYSTEM_STATE.md (extended), REF_CODE_ORGANIZATION.md (extended), PLAN_PRODUCT_FUTURE_CARDS.md (new), README.md cross-refs                 |
| 4      | 1.5d  | C+D+E   | medium      | PLAN_FUTURE_NAV (archive), OPS_DEVELOPER_SETUP.md (new from GETTING_STARTED+GOOGLE_OAUTH), PHASE_6_SMOKE_TEST → OPS_PHASE_6_SMOKE_TEST rename, README.md updates, archive folder updates |
| 5      | 1.5e  | —       | doc-only    | PLAN_DOC_INDEX_BY_PHASE.md — new (section-doc tree pre-declared for Phases 4–8.5)                                                                                                        |

Hard stops between commits. Build not required (doc-only).

---

## Cross-references

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — the architecture charter this consolidation operates under
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — the OPS tier definition + MOLANDJESUS apex lock
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked, never touched
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination state
- [`README.md`](README.md) — doc operating index, updated in same passes
