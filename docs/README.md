# Documentation Index

**Last updated:** March 28, 2026
**Status:** Active documentation governance index

Start here first:

- `CLAUDE_AI_MASTER_CONTEXT.md` — single source of truth for AI execution context

This folder is a governed documentation system. Keep docs:

- accurate to current code reality
- useful for active delivery and onboarding
- intentionally non-duplicative

## Source Of Truth Documents

### Master AI context

- `CLAUDE_AI_MASTER_CONTEXT.md` — product, architecture, map program, current state, and hard rules

### Onboarding and auth/setup

- `GETTING_STARTED.md` — local setup and first-run flow
- `SUPABASE_SETUP_GUIDE.md` — Supabase setup, storage contract, edge deploy, and auth/data ownership boundaries
- `GOOGLE_OAUTH_SETUP.md` — Clerk + Google OAuth provider setup

### Architecture and delivery governance

- `PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md` — architecture baseline findings
- `PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture recommendation baseline
- `CODE_ORGANIZATION_AUDIT.md` — modularity and code ownership guidance
- `PLATFORM_REFACTOR_BACKLOG_2026-03-20.md` — implementation backlog
- `PRODUCTION_READINESS_AUDIT_2026-03-20.md` — production constraints and readiness
- `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` — pre-refactor baseline across account/page/map/mobile/desktop/docs
- `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` — explicit route/account/page verification matrix

### Map system governance

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic map architecture and non-negotiables
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` — pass-level map execution tracker

### Planning and roadmap

- `BIDONDENT_FINISHING_MASTER_PLAN.md` — finishing priorities and validation gates
- `MCP_PLUGIN_INTEGRATION_PLAN.md` — MCP adoption roadmap
- `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` — historical pass archive (not the active execution tracker)

### Supporting references

- `BIDONDENT_PRODUCT_BRAIN.md`
- `MAP_EXPERIENCE_ARCHITECTURE.md`
- `BIDONDENT_HORIZON_MIGRATION.md`
- `MOLANDJEUS_DESIGN_DECISIONS.md`
- `ATTRIBUTIONS.md`

## Documentation Rules

1. Do not maintain duplicate status trackers for the same domain.
2. Keep strategic decisions in master docs and implementation details in trackers.
3. If docs and code disagree, document the mismatch and reconcile quickly.
4. Every map-related implementation change must update both:
   - `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
   - `BIDONDENT_MAP_TRACKER_2026-03-21.md`
5. Supabase is source of truth; local storage is cache/recovery only and must not override cloud truth.
6. All docs must include clear `Last updated` and `Status` markers.

## Parallel AI Documentation Protocol

When another AI is concurrently working on security or backend tracks:

1. Never erase unexplained new entries in docs from parallel tracks.
2. Append new pass notes; avoid destructive rewrites of shared trackers.
3. Prefer additive updates in map/docs trackers and baseline artifacts.
4. If two passes collide on numbering, preserve both entries and flag normalization as a dedicated docs pass.
5. Treat `CLAUDE_AI_MASTER_CONTEXT.md` + `BIDONDENT_MAP_TRACKER_2026-03-21.md` as merge anchors.

## Retired/Removed Docs

Removed from active set due to duplication/supersession:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`

If historical details are needed, migrate relevant facts into active source-of-truth docs instead of restoring retired files.
