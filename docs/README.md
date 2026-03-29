# BidOnDent Docs Operating Index

**Last updated:** March 29, 2026
**Status:** Active documentation operating index

BidOnDent is a **map-first automotive repair marketplace**. The map is the product. Everything else exists to support the spatial workflow around reporting damage, finding shops, routing, bids, and insurer coordination.

## 30-Second Startup

You do **not** need to read every doc.

Read in this order:

1. `CLAUDE_AI_MASTER_CONTEXT.md` — first-read source of truth for product identity, architecture rules, map system, and active operating constraints.
2. `BIDONDENT_MAP_TRACKER_2026-03-21.md` — current execution reality, recent passes, known issues, validation notes.
3. Then choose only the docs that match your task:
   - `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` for map strategy and non-negotiables
   - `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` and `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` for current baseline and validation truth
   - `CODE_ORGANIZATION_AUDIT.md` for refactor boundaries and file-pressure hot spots
   - `GETTING_STARTED.md` for local setup

## How This System Is Organized

### Product and Architecture Truth

- `CLAUDE_AI_MASTER_CONTEXT.md` — first read, master context, architecture law, active system identity.
- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — map strategy, product law, map-first non-negotiables.
- `BIDONDENT_PRODUCT_BRAIN.md` — deeper product handbook and system reasoning. Useful when making broader product or UX decisions, not required every session.
- `CODE_ORGANIZATION_AUDIT.md` — codebase structure, safe seams, file-size pressure, extraction boundaries.
- `MAP_EXPERIENCE_ARCHITECTURE.md` — implementation-level map reference for the map program.
- `MOLANDJEUS_DESIGN_DECISIONS.md` — design philosophy and visual hierarchy decisions.

### Execution and Current State

- `BIDONDENT_MAP_TRACKER_2026-03-21.md` — the active pass log and current-state tracker.
- `BIDONDENT_FINISHING_MASTER_PLAN.md` — execution policy and priority order. This is not the pass log.
- `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` — verified pre-refactor product snapshot.
- `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` — validation checklist across roles, routes, and surfaces.

### Setup and Onboarding

- `GETTING_STARTED.md` — local setup and first run.
- `SUPABASE_SETUP_GUIDE.md` — backend, storage, and edge-function setup.
- `GOOGLE_OAUTH_SETUP.md` — Clerk and Google OAuth setup.

### Optional Operator References

- `AI_REFACTOR_KICKOFF_PROMPT_2026-03-28.md` — optional prompt for starting a fresh AI chat. Helpful, but not authoritative.
- `MCP_PLUGIN_INTEGRATION_PLAN.md` — MCP adoption and plugin rollout planning.
- `ATTRIBUTIONS.md` — licenses and external asset attribution.

### Archive

Everything under `docs/archive/` is historical reference. It may still be useful for traceability, but it is not the active operating surface.

Most important archived docs:

- `archive/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — historical pass-era dashboard, no longer an active tracker.
- `archive/COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md` — early pass history.
- `archive/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md` — older architecture snapshot superseded by the current audit.
- `archive/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — historical recommendations superseded by implementation.

## Read This, Not Everything

Use the smallest doc set that answers the task:

- Bug fix or implementation pass: `CLAUDE_AI_MASTER_CONTEXT.md` + `BIDONDENT_MAP_TRACKER_2026-03-21.md`
- Refactor or extraction: add `CODE_ORGANIZATION_AUDIT.md`
- Validation or truth check: add the baseline + verification matrix
- Setup or auth/storage work: add the relevant setup guide
- Historical research: only then open `docs/archive/`

## Governance Rules

1. **Code beats docs.** If docs disagree with the repository, fix the docs.
2. **One concept = one home.** Do not create parallel truth docs or duplicate trackers.
3. **Do not create doc sprawl.** Prefer updating an existing canonical doc over making a new file.
4. **Archive instead of hoarding.** If a doc stops being active, move it to `docs/archive/` or clearly retire it.
5. **Map work updates map docs.** Changes to map behavior, architecture, or execution status must keep `BIDONDENT_MAP_TRACKER_2026-03-21.md` and `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` aligned.
6. **Active docs need metadata.** Keep `Last updated` and `Status` markers accurate.
7. **Keep cross-links honest.** If a doc is renamed, archived, or repurposed, update references everywhere in the docs system.

## Parallel AI Protocol

When another AI is working in parallel:

1. Prefer additive updates in shared trackers.
2. Do not erase unexplained new entries without verifying intent.
3. Treat `CLAUDE_AI_MASTER_CONTEXT.md` and `BIDONDENT_MAP_TRACKER_2026-03-21.md` as merge anchors.
4. If pass numbering collides, preserve the history first and normalize later in a docs-only pass.

### Lane Discipline

- **Lead AI lane:** primary map/product flow work, shop-directory UX, major user-visible map shells, and high-impact routing or interaction changes.
- **Support AI lane:** docs governance, low-conflict trust hardening, isolated helper/service cleanup, and concise tracker updates that help future sessions operate safely.
- If a lead-lane file already shows active unowned churn, support work should not stack more edits into that same surface.
- If a change could collide with lead-owned map shells or main user-facing routing flow, skip it and choose a safer support-lane pass instead.

## Previously Retired

These files were removed before the archive system was formalized:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`
