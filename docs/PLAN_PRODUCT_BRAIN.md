# PLAN_PRODUCT_BRAIN — Stub (REDIRECT)

**Authority level:** PLAN (stub) — content redirected 2026-05-04 per Phase 1.5c of the v3.3 master plan.

**Last updated:** 2026-05-04

---

## What happened to this doc

The original 1,444-line `PLAN_PRODUCT_BRAIN.md` mixed three tiers of content (LAW-adjacent invariants, current REF state, future PLAN cards) in one file, which misled agents reading it as a single source of truth. Per the doc-tier model in [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) and the four-layer model in [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md), the content has been redirected to its proper homes:

| Original section topic                                               | New location                                                                                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quick Reference — System Upgrade CARDS (forward-looking work cards)  | [`PLAN_PRODUCT_FUTURE_CARDS.md`](PLAN_PRODUCT_FUTURE_CARDS.md)                                                                                          |
| Product definition, role hierarchy, what BidOnDent must never become | [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)                                                                                                          |
| Current Supabase + Map + Architecture reality                        | [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md)                                                                                                            |
| Code Organization Style To Preserve                                  | [`REF_CODE_ORGANIZATION.md`](REF_CODE_ORGANIZATION.md) and [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md)                                 |
| Module / role completion status                                      | [`REF_MODULE_STATUS.md`](REF_MODULE_STATUS.md)                                                                                                          |
| Visual Language sections                                             | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) (apex, locked) and [`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) (implementation) |
| Public Landing Page Map / Dashboard Shell Map / Profile Dropdown     | [`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) and [`PLAN_DASHBOARD_REDESIGN.md`](PLAN_DASHBOARD_REDESIGN.md)                                           |
| Map vision and provider evolution                                    | [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md)                                                                                                              |
| Pass 18 future map identity / atmosphere governance                  | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) (apex, locked)                                                                     |
| Experience Maps (Archived)                                           | already in `docs/archive/` (pre-existing archive subfolder)                                                                                             |

## Where the original 1,444 lines now live

Full original content preserved at [`docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`](archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md). Git history is intact (`git mv` was used).

## Why this stub exists instead of deletion

Cross-references to `PLAN_PRODUCT_BRAIN.md` exist in archived docs and may exist in commit messages or external tools. Keeping the filename with a redirect avoids broken-link rot while still removing the misleading "1,444 lines of mixed-tier content" landing surface.

---

## For agents

Do not re-expand this stub. If you find content in it that should be canon, add the canon to the matching destination doc (per the table above) — never re-grow this file.

If you need historical context, read [`docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`](archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md) directly.
