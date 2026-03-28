# Pre-Refactor Full Site Baseline

**Last updated:** March 28, 2026
**Status:** Active pre-refactor baseline
**Purpose:** Establish one verified baseline across product functionality, map program, mobile/desktop behavior, code structure, and documentation completeness before broad refactor work.

## Scope

This baseline covers:

- Account-type functional coverage in the authenticated app shell
- Route and screen availability in dashboard navigation
- Map program execution state and UX constraints
- Mobile and desktop interaction readiness
- Code-structure risk areas that should shape refactor sequencing
- Documentation compliance and synchronization status across the full docs folder

## Method

- Audited route conditions and rendered screens in `src/app/routers/DashboardRouter.tsx`
- Audited navigation state handling in `src/app/hooks/useNavigation.ts`
- Audited shell/tab access behavior in `src/app/components/app/DashboardLayout.tsx` and `src/app/components/dashboard/MobileBottomNav.tsx`
- Audited map/list/shop UX surfaces touched in current pass stream
- Inventoried all markdown docs under `docs/`

## Functional Coverage Matrix

### Customer account

- Dashboard home: available
- Report flow: available
- Bids tab: available
- Account tab: available
- Reports list/detail: available
- Liked shops: available
- Vehicles: available
- Shop directory map/list/hybrid: available
- Insurer connect page: available

### Shop account

- Dashboard home: available
- Requests tab: available
- Active jobs tab: available
- Account tab: available
- Competitor analysis: available
- Shop directory map/list/hybrid: available
- Reports list/detail views: available through shared routing paths

### Insurer account

- Dashboard home: available
- Claims tab: available
- Partner shops tab: available
- New claim view: available
- Insurance companies view: available
- Insurer connect page: available
- Shop directory map/list/hybrid: available
- Account tab: available

### Shared utility surfaces

- Smoke test view: available
- Demo switcher: available
- Route fallback view: available for invalid view/tab combinations

## Map Program Baseline

### Verified current strengths

- Map/list/hybrid view system is operational and routed
- Selected-shop actions are available directly in map pane
- Directions label consistency is wired between list and map surfaces
- Search-in-area and area-active controls are available in map pane
- Mobile-safe-area bottom clearance exists for map/list flow
- Touch-target hardening completed for map pane actions and search panel controls

### Known active risks before refactor

- Action prominence hierarchy is still not fully unified across all map/list cards and overlays
- Existing Vite dynamic-import warnings persist (non-blocking but architectural debt)
- Pass numbering in some map docs has historical collisions and should be normalized in a dedicated docs pass before large-scale refactor reporting

## Mobile and Desktop Baseline

### Mobile (375px target)

- Major map controls and map-adjacent actions now meet 44px minimum touch-target guidance on recently touched surfaces
- Settings and map/list safe-area behavior improved in prior passes
- Remaining work should focus on cross-surface action hierarchy consistency and dense-cluster control rhythm

### Desktop

- Split-pane map/list shell remains operational
- Dashboard shell and role routes are stable
- No new desktop regressions identified in this pass stream

## Code Structure Baseline (Pre-Refactor)

### Current strengths

- Clear app shell and route orchestration split
- Core map experience has dedicated components and session hooks
- Services/hooks/components boundaries are mostly respected in current map work

### Pressure points to address during refactor planning

- Navigation and dashboard routing are stateful and broad, with many view-mode branches in one router surface
- Remaining large files and mixed-domain state ownership should be refactored in scoped slices, not broad rewrites
- Type and model overlap across shared domain entities remains a known seam

## Concurrent AI Security-Track Reality (Verified)

The following implementation reality must be treated as active system behavior before refactor:

- Edge request auth now supports Clerk session token propagation from app runtime helpers.
- Multiple app services that previously had browser-direct fallback paths now rely on authenticated edge handlers.
- Navigation session cloud persistence was moved to Clerk-keyed storage semantics and explicit restorable session selection.
- User media storage handling has shifted toward private bucket assumptions plus signed URL hydration and authenticated delete paths.
- Server handler authorization has been hardened with shared authz helpers for admin-only, marketplace-only, and website-identity-constrained routes.

Refactor constraint:

- Do not merge UI simplification with auth boundary rewrites in the same pass.
- Keep service-edge contracts stable while reducing file size/complexity.

## Documentation Synchronization Baseline

All docs in `docs/` now contain explicit `Last updated` and `Status` metadata markers for governance consistency.

Parallel-track coordination baseline:

- Security-track documentation updates may be appended by a concurrent AI pass.
- Merge policy is additive-first: preserve both pass entries and normalize numbering later in a dedicated docs-only pass if needed.

### Full docs inventory (reviewed)

- `AI_BACKEND_TASK_PROMPT.md`
- `AI_DASHBOARD_WORK_PROMPT.md`
- `AI_DESIGN_HANDOFF_PROMPT.md`
- `AI_HANDOFF_PROMPT.md`
- `AI_LIQUID_GLASS_HANDOFF_PROMPT.md`
- `ATTRIBUTIONS.md`
- `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`
- `BIDONDENT_FINISHING_MASTER_PLAN.md`
- `BIDONDENT_HORIZON_MIGRATION.md`
- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- `BIDONDENT_MAP_TRACKER_2026-03-21.md`
- `BIDONDENT_PRODUCT_BRAIN.md`
- `CHATGPT_AUTOPILOT_STRATEGY_QUESTIONS.md`
- `CLAUDE_AI_MASTER_CONTEXT.md`
- `CODE_ORGANIZATION_AUDIT.md`
- `COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md`
- `DUAL_AI_COORDINATION_PROMPT.md`
- `GETTING_STARTED.md`
- `GOOGLE_OAUTH_SETUP.md`
- `MAP_EXPERIENCE_ARCHITECTURE.md`
- `MCP_PLUGIN_INTEGRATION_PLAN.md`
- `MOLANDJEUS_DESIGN_DECISIONS.md`
- `PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
- `PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `PRODUCTION_READINESS_AUDIT_2026-03-20.md`
- `README.md`
- `SUPABASE_SETUP_GUIDE.md`

## Refactor Readiness Recommendation

Before broad refactor execution:

1. Freeze this baseline as the current truth snapshot.
2. Normalize pass-number continuity in map docs to avoid audit ambiguity.
3. Execute refactor in sequenced vertical slices by user-facing loop (report -> map -> shop -> action), validating mobile then desktop on each slice.
4. Keep security-track and UX-track changes isolated to avoid cross-agent drift.
5. Enforce file-size governance: hard cap 600 lines, preferred cap 500 lines, with extraction before feature expansion.
