# BidOnDent Docs Operating Index

**Last updated:** April 2, 2026 (Pass 562 — All files ≤500 lines, extraction sweep complete)
**Status:** Active documentation operating index
**Active docs:** 11 | **Archived docs:** 24+

BidOnDent is a **map-first automotive repair marketplace**. The map is the product. Everything else exists to support the spatial workflow around reporting damage, finding shops, routing, bids, and insurer coordination.

## 30-Second Startup

You do **not** need to read every doc.

Read in this order:

1. `CLAUDE_AI_MASTER_CONTEXT.md` — first-read master context for product identity, architecture rules, map system, and active operating constraints.
2. `BIDONDENT_MAP_TRACKER_2026-03-21.md` — current execution reality, recent passes, known issues, validation notes.
3. Then choose only the docs that match your task:
   - `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` for map strategy and non-negotiables
   - `CODE_ORGANIZATION_AUDIT.md` for refactor boundaries and file-pressure hot spots
   - `GETTING_STARTED.md` for local setup

## How This System Is Organized

### Product and Architecture Truth

- `CLAUDE_AI_MASTER_CONTEXT.md` — first read, master context, architecture law, active system identity.
- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — map strategy, product law, map-first non-negotiables.
- `BIDONDENT_PRODUCT_BRAIN.md` — deeper product handbook and system reasoning. Useful when making broader product or UX decisions, not required every session.
- `CODE_ORGANIZATION_AUDIT.md` — codebase structure, safe seams, file-size pressure, extraction boundaries.
- `MOLANDJEUS_DESIGN_DECISIONS.md` — design philosophy and visual hierarchy decisions.

### Execution and Current State

- `BIDONDENT_MAP_TRACKER_2026-03-21.md` — the active pass log and current-state tracker.
- `BIDONDENT_FINISHING_MASTER_PLAN.md` — execution policy and priority order. This is not the pass log.

### Setup and Onboarding

- `GETTING_STARTED.md` — local setup and first run.
- `SUPABASE_SETUP_GUIDE.md` — backend, storage, and edge-function setup.
- `GOOGLE_OAUTH_SETUP.md` — Clerk and Google OAuth setup.

### Optional Operator References

- `ATTRIBUTIONS.md` — licenses and external asset attribution.

### Archive

Everything under `docs/archive/` is historical reference. It may still be useful for traceability, but it is not the active operating surface.

Notable archived docs:

- `archive/MAP_TRACKER_PASSES_1_499.md` — historical pass log (passes 1–499).
- `archive/MAP_MASTER_PLAN_IMPL_NOTES.md` — per-pass implementation notes from the master plan.
- `archive/PRODUCT_BRAIN_EXPERIENCE_MAPS.md` — screen-by-screen CTA maps for all roles.
- `archive/PRODUCT_BRAIN_FUTURE_MAP_INTEL.md` — role-specific future map intelligence plans.
- `archive/DESIGN_DECISIONS_IMPL_DETAILS.md` — atmospheric depth, gradient, orb implementation values.
- `archive/COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md` — early pass history.
- `archive/PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` — pre-refactor product snapshot.
- `archive/FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` — validation checklist (historical).

## Read This, Not Everything

Use the smallest doc set that answers the task:

- Bug fix or implementation pass: `CLAUDE_AI_MASTER_CONTEXT.md` + `BIDONDENT_MAP_TRACKER_2026-03-21.md`
- Refactor or extraction: add `CODE_ORGANIZATION_AUDIT.md`
- Map strategy: add `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
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
