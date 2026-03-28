# Full Site Functional Verification Matrix

**Last updated:** March 28, 2026
**Status:** Active pre-refactor verification matrix
**Scope:** Full account-type and page-functionality verification baseline before any broad refactor.

## Verification Intent

This matrix is the operational checklist for validating that every major user-facing path remains functional across:

- customer account
- shop account
- insurer account
- shared/public pages
- map program surfaces
- mobile and desktop view behavior

Use this matrix as the execution baseline for refactor-safe work.

## Route Coverage Source

Primary routing reference:

- `src/app/routers/DashboardRouter.tsx`

Supporting navigation/shell references:

- `src/app/hooks/useNavigation.ts`
- `src/app/components/app/DashboardLayout.tsx`
- `src/app/components/dashboard/MobileBottomNav.tsx`

## Customer Verification

- [x] Dashboard Home (`dashboard/home`)
- [x] Report wizard (`dashboard/report`)
- [x] Bids (`dashboard/bids`)
- [x] Account (`dashboard/account`)
- [x] Reports list (`reports-list`)
- [x] Report detail (`report-detail`)
- [x] Liked shops (`liked-shops`)
- [x] Vehicles (`vehicles`)
- [x] Shop directory (`shop-directory`)
- [x] Insurer connect (`insurer-connect`)

## Shop Verification

- [x] Dashboard Home (`dashboard/home`)
- [x] Requests (`dashboard/requests`)
- [x] Active jobs (`dashboard/jobs`)
- [x] Account (`dashboard/account`)
- [x] Competitor analysis (`competitor-analysis`)
- [x] Shop directory (`shop-directory`)
- [x] Reports list/detail shared routes (`reports-list`, `report-detail`)

## Insurer Verification

- [x] Dashboard Home (`dashboard/home`)
- [x] Claims (`dashboard/claims`)
- [x] Partner shops (`dashboard/shops`)
- [x] New claim (`new-claim`)
- [x] Insurance companies (`insurance-companies`)
- [x] Insurer connect (`insurer-connect`)
- [x] Shop directory (`shop-directory`)
- [x] Account (`dashboard/account`)

## Shared Surface Verification

- [x] Smoke test (`smoke-test`)
- [x] Demo switcher (`demo-switcher`)
- [x] Route fallback behavior for unknown routes
- [x] Landing page top-level sections and CTA flow

## Map Program Verification

- [x] Shop directory view-mode switching (hybrid, map, list)
- [x] Selected shop map-card directions action
- [x] Search-in-area controls and clear state
- [x] Mobile-safe list bottom clearance in map mode
- [x] 44px touch-target hardening across map/list/search actions
- [x] Liked shops light/dark appearance parity in map-adjacent flow

## Latest UX Regression Fixes (This Session)

- [x] Landing-page settings modal now renders in a portal to guarantee top-layer visibility above landing content (`SettingsModal.tsx`).
- [x] Dashboard logo typography normalized by removing italic styling from the "On" text in `BidOnDent` (`DashboardLayout.tsx`).

## Mobile / Desktop Baseline Checks

### Mobile (375px minimum)

- [x] No known blocking overlap in settings modal layering after portal fix
- [x] Critical map/list/search controls meet touch-target guidance on recently updated surfaces
- [x] Safe-area behavior handled for map/list interactions

### Desktop

- [x] Dashboard shell route surfaces reachable by account role
- [x] Map/list split behavior preserved
- [x] No known desktop-only regressions in this pass stream

## Known Non-Blocking Risks To Track

- Existing Vite dynamic-import warnings still present (architectural debt, not runtime blockers)
- Map pass numbering in tracker/master docs has historical collisions from prior sessions and should be normalized in a dedicated docs pass

## Security Boundary Verification (Concurrent Track)

- [x] App edge-request runtime supports Clerk token-backed authorization headers.
- [x] Public intake submissions route through edge handlers (no direct browser table insert path).
- [x] Workflow event and job-assignment writes route through edge handlers.
- [x] Navigation session persistence uses Clerk-authenticated cloud path for signed-in users.
- [x] Storage lifecycle includes authenticated delete flow and signed URL hydration assumptions.
- [x] Server handlers enforce role/identity-aware authorization guards on sensitive routes.

## Refactor Readiness Gate

Refactor work should not begin until this matrix remains true after any additional stabilization passes.

Recommended gate:

1. Build passes with no errors.
2. Diagnostics pass on touched files.
3. Map tracker/master and baseline docs updated in the same pass.
4. Mobile and desktop behavior confirmed for touched UI.
5. Security boundary assumptions revalidated whenever service contracts are refactored.
6. No touched file exceeds 600 lines; preferred target remains under 500 lines.

## Concurrent Security-Track Note

If security-track passes run in parallel, keep this matrix focused on functionality verification and document security-driven behavior changes as additive notes rather than replacing existing verification rows.
