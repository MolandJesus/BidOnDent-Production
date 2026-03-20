# Code Organization Audit

**Date**: March 20, 2026  
**Scope**: Current checked-out BidOnDent repo only
**Status**: Active source-of-truth for code structure guidance

## Purpose

This document replaces the older generic audit checklist with a repo-specific view of how BidOnDent is actually organized today.

Use this together with:

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

## Current Architecture Snapshot

### App shell

- `src/app/App.tsx` is the orchestration root.
- The app is state-driven, not URL-router-driven.
- Clerk owns identity/session.
- Supabase is used for data, storage, edge handlers, and some direct realtime usage.

### Primary control seams

- `src/app/hooks/useNavigation.ts`
  owns the in-app view state and persists the current tab/view to local storage.
- `src/app/hooks/useUserData.ts`
  owns shared user-scoped client state, cloud hydration, cache persistence, notifications, reports, bids, and vehicles.
- `src/app/hooks/useAppHandlers.ts`
  owns app-level mutation handlers such as submit report, submit bid, login/logout.
- `src/app/utils/buildDashboardRouterProps.ts`
  is the adapter layer between the app shell and dashboard screens.
- `src/app/routers/DashboardRouter.tsx`
  is a thin shell.
- `src/app/routers/DashboardRouterScreens.tsx`
  currently holds most authenticated screen routing decisions.

### Shell components

- `src/app/components/app/LandingPageLayout.tsx`
  is the public-site shell.
- `src/app/components/app/DashboardLayout.tsx`
  is the authenticated shell.

### Domain/component structure

- `src/app/components/landing/`
  public marketing and coverage/discovery UI
- `src/app/components/maps/`
  current Leaflet-based coverage map primitives
- `src/app/components/dashboard/`
  shared dashboard shell widgets like header, nav, coverage panel, notification center
- `src/app/components/codelayer/`
  legacy-but-still-primary customer/dashboard screens
- `src/app/components/shop/`
  shop-facing screens
- `src/app/components/insurer/`
  insurer-facing screens
- `src/app/components/admin/`
  admin/test-account tooling
- `src/app/services/supabase/`
  client-side Supabase access layer
- `supabase/functions/server/`
  edge/server handlers and schema init

## File Size Status

The repository is currently under the active size cap:

- No `.ts/.tsx/.js/.jsx` files in `src/` or `supabase/` exceed 500 lines.
- The largest active screen/router files are still the next best split targets:
  - `src/app/routers/DashboardRouterScreens.tsx`
  - `src/app/components/insurer/InsurerNewClaimScreen.tsx`
  - `src/app/components/auth/LoginModal.tsx`
  - `src/app/components/dashboard/ProfileDropdown.tsx`
  - `src/app/components/app/DashboardLayout.tsx`

## What Is Organized Well

- The app shell now has a clearer split between public and authenticated surfaces.
- Dashboard routing is thinner than before and no longer buried entirely in one god-component.
- The report flow already has extracted helper modules for draft storage and photo upload.
- The coverage map is no longer trapped in one landing-page file.
- Backend schema bootstrapping is split across focused SQL modules instead of one oversized file.
- The notification bell now has a dedicated component instead of being a dead icon.

## What Is Still Structurally Weak

### 1. State ownership is still broad

- `useUserData` owns many concerns at once:
  - cloud hydration
  - cache persistence
  - notification state
  - report state
  - bid extraction
  - vehicle persistence
- This is workable today, but it is not the right long-term seam for a map/navigation platform.

### 2. Routing is stateful but loosely typed

- `ViewMode` in `src/app/types/index.ts` does not fully reflect all actual view strings used in the dashboard router.
- `dashboard-router-types.ts` still leans heavily on `any[]`.
- The app’s navigation model is understandable, but it is not yet modeled as a strict navigation domain.

### 3. Role flows are not equally mature

- Customer flow is the most real.
- Shop flow reads real reports and can submit real bids, but still fabricates several display fields.
- Insurer flow is more of an adapter layer over report data and still synthesizes claim-facing values.
- Admin tooling is still a separate legacy island with email-linked test-account assumptions.

### 4. Notification ownership is split

- `DashboardLayout` owns shell presentation.
- `NotificationCenter` owns the richer bell UI.
- `ProfileDropdown` still contains overlapping notification logic and an older realtime presentation path.
- Default seeded notifications still exist in `src/app/constants/index.ts`.

### 5. Map code is reusable, but not yet a real map platform

- The current map domain is clean enough for coverage search.
- It is not yet separated into:
  - operational coverage map
  - immersive fullscreen map
  - navigation session state
  - routing provider abstraction
  - voice guidance abstraction
- The current faux orbital mode should be treated as transitional experimentation, not finished architecture.

## Current Domain-Level Risks

### Type mismatches

- `src/app/types/index.ts` and `src/app/services/supabase/types.ts` describe overlapping but different report/bid/vehicle shapes.
- UI layers repeatedly normalize mixed report shapes instead of relying on one authoritative view model.

### Mixed live and synthetic data

- Several shop and insurer screens still derive fake-safe values such as:
  - `customerName: "Customer"`
  - synthetic claim numbers
  - synthesized estimated damage
  - placeholder contact data
- This keeps screens non-empty, but it weakens trust and complicates future mobile or notification flows.

### Legacy admin surface

- `src/app/config/adminConfig.ts`
  and `src/app/utils/adminCheck.ts`
  still treat admin as an email/test-account concern.
- This conflicts with the current requested direction of temporary broad admin access for authenticated users.

## Recommended Folder Evolution

Do not broad-stroke move the whole repo at once. The safest evolution path is:

### Keep existing shells

- keep `components/app/`
- keep `routers/`
- keep `hooks/`
- keep `services/`

### Introduce new domain folders deliberately

- `src/app/features/coverage/`
  for shared coverage-search state and business rules
- `src/app/features/navigation/`
  for future route/session/voice models
- `src/app/features/notifications/`
  if notification logic continues to grow beyond the bell/dropdown boundary

### Migrate shared models out of legacy generic types

- move map and navigation models into dedicated typed modules
- move report/bid view adapters closer to report/bid domains
- reduce repeated per-screen normalization logic

## Documentation Governance

### Current source-of-truth docs

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/CODE_ORGANIZATION_AUDIT.md`
- `docs/PLATFORM_REFACTOR_BACKLOG_2026-03-20.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

### Docs that need retirement review

These older docs were retired on March 20, 2026 because they no longer matched the live code:

- `docs/FIXES_APPLIED.md`
- `docs/IDENTIFIED_ISSUES.md`
- `docs/PROJECT_COMPLETION_SUMMARY.md`
- `docs/PROJECT_STATUS.md`
- `docs/COMPREHENSIVE_TEST_PLAN.md`
- `docs/CROSS_ACCOUNT_TESTING_PLAN.md`

Use `docs/README.md` as the current documentation entry point instead.

## Next Structural Priorities

### Now

- Keep files under 500 lines while extracting new navigation/map domains.
- Replace stale generic documentation with repo-specific source-of-truth docs.
- Tighten the navigation and dashboard router typing surface.
- Consolidate notification ownership so bell and dropdown do not compete.

### Next

- Create a real `coverage` state hook shared by landing and dashboard.
- Introduce dedicated navigation types and persistence for route/session memory.
- Move admin access policy behind one isolated access layer.
- Remove or refactor screens that still synthesize fake-safe business data.

### Later

- Move toward feature/domain folders for coverage, navigation, and role workflows.
- Retire duplicate report/bid/vehicle type definitions in favor of one normalized view-model path.
- Split role-specific operational surfaces into smaller route-loaded screen bundles.
