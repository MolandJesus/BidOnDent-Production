## Map Vision & Design Governance (2026-03-22)

For the future direction and design governance of BidOnDent maps/navigation, see:

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` (strategic vision, blue system, atmosphere, day/night guidance planning)
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` (execution tracker, vision alignment, future guidance)
- `BIDONDENT_PRODUCT_BRAIN.md` (operational bridge: current vs aspirational truth, map identity, blue system, day/night intent)
- `MOLANDJEUS_DESIGN_DECISIONS.md` (design articulation: atmosphere, depth, glass, control feel, emotional target)

All future map/product/design direction is planned/aspirational unless otherwise stated in the tracker.

# Documentation Index

Last updated: March 21, 2026
Status: Active documentation governance index

This folder is a governed documentation set.

The goal is to keep only documents that are:

- accurate to the current codebase,
- useful for active delivery decisions,
- and intentionally non-duplicative.

## Source Of Truth Documents

### Onboarding and environment

- `GETTING_STARTED.md`
  - local setup and first-run flow
- `SUPABASE_SETUP_GUIDE.md`
  - Supabase setup and migration execution
- `GOOGLE_OAUTH_SETUP.md`
  - Google OAuth configuration

### Architecture and delivery governance

- `PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
  - baseline architecture findings and risk map
- `PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
  - recommended structural direction
- `CODE_ORGANIZATION_AUDIT.md`
  - modularity and code ownership guidance
- `PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
  - active platform implementation backlog
- `PRODUCTION_READINESS_AUDIT_2026-03-20.md`
  - production constraints and readiness checks

### Map system governance

- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
  - strategic map architecture, quality standards, and non-negotiables
  - **Final map vision: product-owned, royal-blue-first, blue system for meaning, day/night guidance planned, not a desktop clone or generic SaaS map UI**
- `BIDONDENT_MAP_TRACKER_2026-03-21.md`
  - execution tracker for map delivery slices and validation outcomes
  - **Tracks progress toward blue-driven, day/night-aware, product-owned map experience**

### Supporting references

- `BIDONDENT_PRODUCT_BRAIN.md`
  - broader product context and narrative
- `MAP_EXPERIENCE_ARCHITECTURE.md`
  - map architecture reference details
- `BIDONDENT_HORIZON_MIGRATION.md`
  - migration summary and file-level historical movement
- `MOLANDJEUS_DESIGN_DECISIONS.md`
  - design-direction reference for the MolandJesus collaboration context
- `ATTRIBUTIONS.md`
  - third-party attribution and licensing notes

## Documentation Rules

1. Do not maintain duplicate status trackers for the same domain.
2. Keep strategic decisions in master docs and implementation details in trackers.
3. If a doc no longer reflects code reality, either update it immediately or retire it.
4. Every map-related implementation change must update both map docs:
   - `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
   - `BIDONDENT_MAP_TRACKER_2026-03-21.md`
5. Supabase is source of truth; local storage behavior must be documented only as cache/recovery.

## Retired On March 21, 2026

The following docs were removed from the active set because they were stale, duplicative, or superseded by governed source-of-truth docs:

- `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`
- `PROJECT_STATUS.md`

If historical context from retired docs is needed later, capture only the relevant facts in the current source-of-truth documents rather than restoring retired files.
