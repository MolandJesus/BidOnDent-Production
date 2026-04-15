# BidOnDent Docs Operating Index

**Last updated:** 2026-04-14 (Soft Launch Hardening phase — Hardening Plan + Post-Launch Roadmap are now project law)
**Status:** Active documentation operating index
**Current phase:** Soft Launch Hardening (pre-Phase 0 execution)

BidOnDent is a **map-first automotive repair marketplace**. The map is the product. Everything else exists to support the spatial workflow around reporting damage, finding shops, routing, bids, and insurer coordination.

---

## ⚡ Current Project Law (READ FIRST)

The following two documents supersede everything else as day-to-day execution law during the Soft Launch Hardening phase:

1. **[`BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md`](BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md)** — the locked execution plan for getting to soft launch. North Star, Launch Scope Guardrails, Locked Decisions (Groups 1–7), Execution Plan (Phases 0–6 with checkpoint gates), and Execution Discipline (standing rules). **This is project law.** Any AI executing on autopilot must treat it as such.
2. **[`BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md`](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md)** — companion doc listing deliberately deferred work with priority bands and triggers. Explicitly **not** a second backlog. Items here are only picked up when their stated trigger fires.

**If any other doc in this folder conflicts with those two, the two new docs win.** File an update in a docs-only pass rather than drifting execution.

---

## 30-Second Startup

You do **not** need to read every doc.

Read in this order:

1. **[Soft Launch Hardening Plan](BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md)** — the what, why, and when of every launch-scope task. Always first read during the hardening phase.
2. **[Post-Launch Roadmap](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md)** — skim so you know what is deferred and why. Prevents accidental reactivation of deferred work.
3. **[`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md)** — product identity, architecture rules, active constraints.
4. **[`BIDONDENT_MAP_TRACKER_2026-03-21.md`](BIDONDENT_MAP_TRACKER_2026-03-21.md)** — historical pass log and current-state reference. No longer the primary "where are we" tool — the Module Completion Matrix (built in Phase 5) takes that role once populated.
5. Then pick task-specific docs from the sections below.

---

## How This System Is Organized

### Project Law (supersedes everything else)

- **[`BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md`](BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md)** — current execution law. Locked decisions, Launch Scope Guardrails, phased Execution Plan, Execution Discipline.
- **[`BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md`](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md)** — controlled holding area for deferred work. Priority bands + triggers. Not a backlog.

### Product, Architecture & Design Reference

- **[`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md)** — first-read master context for product identity, architecture rules, map system.
- **[`BIDONDENT_PRODUCT_BRAIN.md`](BIDONDENT_PRODUCT_BRAIN.md)** — deeper product handbook and system reasoning. Strategic vision, not day-to-day execution.
- **[`BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`](BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md)** — map strategy, product law, map-first non-negotiables. Feature-level map work is paused during hardening; strategic vision unchanged.
- **[`CODE_ORGANIZATION_AUDIT.md`](CODE_ORGANIZATION_AUDIT.md)** — codebase structure, safe seams, extraction boundaries.
- **[`MOLANDJEUS_DESIGN_DECISIONS.md`](MOLANDJEUS_DESIGN_DECISIONS.md)** — design philosophy and visual hierarchy. Aesthetic work frozen during hardening except where required by Phase 4 trust surfaces.

### Execution Reference (historical audit trail)

- **[`BIDONDENT_MAP_TRACKER_2026-03-21.md`](BIDONDENT_MAP_TRACKER_2026-03-21.md)** — pass-by-pass history. Continues from pass 855+ during hardening as an audit trail. The Module Completion Matrix (built in Phase 5) becomes the primary "where are we" tool once populated.
- **[`BIDONDENT_MODULE_COMPLETION_MATRIX_2026-04-15.md`](BIDONDENT_MODULE_COMPLETION_MATRIX_2026-04-15.md)** — canonical module completion reference (3 roles × 7 modules). Corrected cell tally, per-cell evidence, email flow wiring, runtime verification log, and deferred Insurer Role Promotion Epic.

### Setup & Operations

- **[`GETTING_STARTED.md`](GETTING_STARTED.md)** — local setup and first run. **Heads up:** Phase 1.5 of the hardening plan migrates Clerk/Supabase key configuration from `utils/*/info.tsx` to `.env` — this guide must be updated in the same pass that migration lands.
- **[`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md)** — backend, storage, and edge-function setup. Same `.env` migration note applies. References to `make-server-9f243523` remain until Post-Launch Roadmap item L1 fires.
- **[`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)** — Clerk + Google OAuth setup.

### Deferred Design Docs

- **[`PAYMENT_MODEL_DESIGN.md`](PAYMENT_MODEL_DESIGN.md)** — Phase 4 planning. **Deferred** per Post-Launch Roadmap F1. Do not implement without a fired trigger.

### Optional References

- **[`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)** — licenses and external asset attribution.

### Archive

Everything under [`docs/archive/`](archive/) is historical reference, retained for traceability. Not active operating surface.

Recent archive moves (2026-04-14):

- `archive/DUAL_AI_COORDINATION.md` — superseded by Group 2a's "main AI on autopilot + smaller support AI for cleanup" model. Historical context only.
- `archive/BIDONDENT_FINISHING_MASTER_PLAN.md` — pre-launch "finishing" plan. Fully superseded by the Soft Launch Hardening Plan as execution law.
- `archive/SESSION_AUDIT_2026-04-06.md` — point-in-time audit for passes 851–854. Historical snapshot only.

---

## Read This, Not Everything

Use the smallest doc set that answers the task:

- **Any execution work during hardening:** always the Hardening Plan + Post-Launch Roadmap, then anything else.
- **Bug fix or implementation pass:** Hardening Plan + `CLAUDE_AI_MASTER_CONTEXT.md` + Map Tracker.
- **Refactor or extraction:** add `CODE_ORGANIZATION_AUDIT.md`.
- **Map strategy (strategic, not feature-level):** add `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`.
- **Setup / auth / storage work:** add the relevant setup guide — and confirm the change respects Launch Scope Guardrails.
- **Considering a deferred item:** read the Post-Launch Roadmap entry first; do not reactivate without a fired trigger.
- **Historical research:** only then open `docs/archive/`.

---

## Governance Rules

1. **Hardening Plan + Post-Launch Roadmap are law.** Every other doc in this folder is reference; those two are binding during the hardening phase. Conflicts resolve in their favor.
2. **Code beats docs.** If docs disagree with the repository, fix the docs.
3. **One concept = one home.** Do not create parallel truth docs or duplicate trackers.
4. **Do not create doc sprawl.** Prefer updating an existing canonical doc over making a new file.
5. **Archive instead of hoarding.** If a doc stops being active, move it to `docs/archive/` or clearly retire it.
6. **Active docs need metadata.** Keep `Last updated` and `Status` markers accurate.
7. **Keep cross-links honest.** If a doc is renamed, archived, or repurposed, update references everywhere in the docs system in the same pass.

### Hardening-phase doc-sync rule (binding on the main AI on autopilot)

While executing the Hardening Plan, every pass that changes a load-bearing fact must also update the docs it contradicts — in the same pass, not later. Specifically:

- **Phase 1.5 (.env migration)** must update `GETTING_STARTED.md`, `SUPABASE_SETUP_GUIDE.md`, `README.md` (project root), and the error copy in `AppShell.tsx:17`. The Hardening Plan lists this explicitly.
- **Phase 2.2 (identity normalization)** must update any doc that still references `user_id` UUID columns for launch-critical tables.
- **Phase 3.1 (RLS rollout)** must update `SUPABASE_SETUP_GUIDE.md` with the new RLS posture where it conflicts.
- **Phase 5.3 (Module Completion Matrix)** creates a new doc that becomes the primary "where are we" reference. README.md must add it to the active index in the same pass.
- **Any Launch Scope Guardrail verification or reclassification** must be reflected in the Hardening Plan's Change Log in the same pass, per Execution Discipline rule 5.
- **If a pass adjusts the Module Completion Matrix, the Hardening Plan, or the Post-Launch Roadmap**, summarize the change in the pass log in `BIDONDENT_MAP_TRACKER_2026-03-21.md` so the audit trail remains continuous.

Silent doc drift during auto-execution is a discipline failure. If you cannot update the affected docs in the same pass, stop and escalate.

---

## Previously Retired (pre-archive system)

These files were removed before the archive system was formalized:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`
