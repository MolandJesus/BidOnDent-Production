## Map Vision & Design Governance (2026-03-25)

**Last updated:** March 25, 2026
**Status:** Active documentation index and governance — FINISHING PHASE

For all map, navigation, and design governance, see:

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic vision, blue system, atmosphere, day/night guidance (source of truth)
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` — execution tracker, pass log, validation outcomes (source of truth)
- `BIDONDENT_PRODUCT_BRAIN.md` — operational bridge: current vs aspirational truth, map identity, blue system, day/night intent
- `MOLANDJEUS_DESIGN_DECISIONS.md` — design articulation: atmosphere, depth, glass, control feel, emotional target

**Mobile-first, map-as-primary, and blue/glass design system are enforced throughout.**
All future map/product/design direction is planned/aspirational unless otherwise stated in the tracker. Every map-related change must update both map docs.

# Documentation Index

**Last updated:** March 25, 2026
**Status:** Active documentation governance index

This folder is a governed documentation set. Only keep documents that are:

- accurate to the current codebase
- useful for active delivery and onboarding
- intentionally non-duplicative

## Source Of Truth Documents

### Onboarding and environment

- `GETTING_STARTED.md` — local setup and first-run flow
- `SUPABASE_SETUP_GUIDE.md` — Supabase setup and migration execution
- `GOOGLE_OAUTH_SETUP.md` — Google OAuth configuration

### Architecture and delivery governance

- `PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md` — baseline architecture findings and risk map
- `PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — recommended structural direction
- `CODE_ORGANIZATION_AUDIT.md` — modularity and code ownership guidance
- `PLATFORM_REFACTOR_BACKLOG_2026-03-20.md` — active platform implementation backlog
- `PRODUCTION_READINESS_AUDIT_2026-03-20.md` — production constraints and readiness checks

### Map system governance

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic map architecture, quality standards, and non-negotiables (product-owned, royal-blue-first, blue system for meaning, day/night guidance planned, not a desktop clone)
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` — execution tracker for map delivery slices and validation outcomes (tracks progress toward blue-driven, day/night-aware, product-owned map experience)

### Tooling and integration

- `MCP_PLUGIN_INTEGRATION_PLAN.md` — MCP plugin adoption roadmap (Supabase, Sentry, Figma, Notion, Gmail, Calendar)

### Finishing roadmap

- `BIDONDENT_FINISHING_MASTER_PLAN.md` — definitive finishing roadmap: pass execution order, priorities, validation gates, stop conditions

### Supporting references

- `BIDONDENT_PRODUCT_BRAIN.md` — broader product context and narrative
- `MAP_EXPERIENCE_ARCHITECTURE.md` — map architecture reference details
- `BIDONDENT_HORIZON_MIGRATION.md` — migration summary and file-level historical movement
- `MOLANDJEUS_DESIGN_DECISIONS.md` — design-direction reference for the MolandJesus collaboration context
- `ATTRIBUTIONS.md` — third-party attribution and licensing notes

## Documentation Rules

1. Do not maintain duplicate status trackers for the same domain.
2. Keep strategic decisions in master docs and implementation details in trackers.
3. If a doc no longer reflects code reality, update it immediately or retire it.
4. Every map-related implementation change must update both map docs:

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- `BIDONDENT_MAP_TRACKER_2026-03-21.md`

5. Supabase is source of truth; local storage is cache/recovery only and must not override cloud truth.
6. All docs must have a clear "last updated" and "status" line.
7. Remove or archive any docs not referenced here.

## Retired/Removed Docs

The following docs have been removed from the active set because they were stale, duplicative, or superseded by governed source-of-truth docs:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`

If historical context from retired docs is needed, capture only the relevant facts in the current source-of-truth documents rather than restoring retired files.
