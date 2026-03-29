# BidOnDent Documentation System

**Last updated:** March 29, 2026 — Pass 437 (Doc System Refactor)
**Status:** Active documentation governance index

---

## Start Here

Read **`CLAUDE_AI_MASTER_CONTEXT.md`** before every session. It is the single source of truth for product context, architecture, design system, current state, and next priorities.

---

## Active Documents (17 files)

### Core — Product & Architecture Truth

| Document                         | Purpose                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_AI_MASTER_CONTEXT.md`    | **Master context.** Product, architecture, map program, design system, current state, hard rules. Read first. |
| `BIDONDENT_PRODUCT_BRAIN.md`     | **Product handbook.** Quick Cards, upgrade checklists, design system deep-dive, execution bridge.             |
| `CODE_ORGANIZATION_AUDIT.md`     | **Architecture snapshot.** File structure, weak seams, safe boundaries, size governance.                      |
| `MOLANDJEUS_DESIGN_DECISIONS.md` | **Design philosophy.** Breathing room rule, information hierarchy, glass system, page-by-page audit.          |

### Map System

| Document                                  | Purpose                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` | **Map strategy & law.** Map-as-product, blue system, day/night vision, non-negotiables. |
| `BIDONDENT_MAP_TRACKER_2026-03-21.md`     | **Map execution tracker.** Pass-level delivery reality, verification, known risks.      |
| `MAP_EXPERIENCE_ARCHITECTURE.md`          | **Map implementation.** Key files, component hierarchy, persistence architecture.       |

### Execution & Planning

| Document                                   | Purpose                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `BIDONDENT_FINISHING_MASTER_PLAN.md`       | **Execution policy.** What remains, priority order, validation gates.  |
| `MCP_PLUGIN_INTEGRATION_PLAN.md`           | **MCP adoption.** Plugin assessment, phased rollout plan.              |
| `AI_REFACTOR_KICKOFF_PROMPT_2026-03-28.md` | **Reusable AI kickoff.** Entry-point prompt for new AI/refactor chats. |

### Setup & Onboarding

| Document                  | Purpose                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `GETTING_STARTED.md`      | **Local setup.** Prerequisites, first run, data persistence notes.                     |
| `SUPABASE_SETUP_GUIDE.md` | **Backend setup.** Supabase project, edge functions, storage contract, auth ownership. |
| `GOOGLE_OAUTH_SETUP.md`   | **Auth setup.** Clerk + Google OAuth configuration.                                    |

### Validation

| Document                                                 | Purpose                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`          | **Baseline.** Account-type coverage, route availability, mobile/desktop readiness. |
| `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` | **QA matrix.** Route/account/page verification checklist.                          |

### Legal

| Document          | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `ATTRIBUTIONS.md` | **Licenses.** shadcn/ui (MIT), Unsplash photos. |

---

## Archive (`/docs/archive/`)

Historical documents preserved for reference. Not actively maintained.

| Document                                            | Why Archived                                       |
| --------------------------------------------------- | -------------------------------------------------- |
| `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`             | Superseded by Finishing Master Plan + Map Tracker  |
| `COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md`        | Historical pass archive (Passes 1–40)              |
| `PRODUCTION_READINESS_AUDIT_2026-03-20.md`          | Superseded by Pre-Refactor Baseline                |
| `PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md` | Superseded by Code Organization Audit              |
| `PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`     | Superseded by actual implementation                |
| `PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`           | Retired — items completed or absorbed              |
| `BIDONDENT_HORIZON_MIGRATION.md`                    | Completed branch migration record                  |
| `AI_HANDOFF_PROMPT.md`                              | Superseded by Master Context                       |
| `AI_BACKEND_TASK_PROMPT.md`                         | One-off agent coordination, superseded             |
| `AI_DASHBOARD_WORK_PROMPT.md`                       | One-off agent coordination, superseded             |
| `AI_DESIGN_HANDOFF_PROMPT.md`                       | One-off agent coordination, superseded             |
| `AI_LIQUID_GLASS_HANDOFF_PROMPT.md`                 | Completed sprint, all passes done                  |
| `DUAL_AI_COORDINATION_PROMPT.md`                    | Dual-agent experiment ended                        |
| `CHATGPT_AUTOPILOT_STRATEGY_QUESTIONS.md`           | External strategy poll, answered by implementation |

---

## Documentation Rules

1. **Code > Docs.** If docs disagree with code, docs are wrong. Fix docs.
2. **One concept = one home.** No duplicate status trackers for the same domain.
3. **Every doc must have** `Last updated` and `Status` markers.
4. **Map changes** must update both `BIDONDENT_MAP_MASTER_PLAN` and `BIDONDENT_MAP_TRACKER`.
5. **Supabase = source of truth.** localStorage is cache/recovery only.
6. Docs should be useful for **active delivery and onboarding** — not preserved out of habit.

## Parallel AI Documentation Protocol

When another AI is concurrently working on security or backend tracks:

1. Never erase unexplained new entries in docs from parallel tracks.
2. Append new pass notes; avoid destructive rewrites of shared trackers.
3. Prefer additive updates in map/docs trackers and baseline artifacts.
4. If two passes collide on numbering, preserve both entries and flag normalization as a dedicated docs pass.
5. Treat `CLAUDE_AI_MASTER_CONTEXT.md` + `BIDONDENT_MAP_TRACKER_2026-03-21.md` as merge anchors.

## Previously Retired (Pre-Archive)

These were removed before the archive system existed:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`
