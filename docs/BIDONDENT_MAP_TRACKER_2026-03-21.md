# BidOnDent Map Tracker

**Last updated:** April 5, 2026 (Pass 814 — Report pin status/bid audit: already complete)
**Status:** Active execution tracker
**Pass count:** 814
**Build:** 0 errors (~3.2s)
**Tests:** 555/555 passing (55 test files)
**Branch:** BidOnDent-Horizon-Beta

---

## Quick State Summary

**Real code / real backend plumbing:**

- Full MapLibre GL JS WebGL map engine (Leaflet removed Pass 448)
- Report → map pin → shop popup → bid → accept → navigate: complete end-to-end loop in code
- Shop bids from map (MapBidSheet → Supabase edge function), customer bid acceptance with competing-bid auto-rejection
- Estimate requests: full Supabase backend lifecycle (customer→shop→respond→accept/decline)
- Turn-by-turn voice navigation (Web Speech API) with deviation detection and auto-reroute (fully wired via useNavigationReroute → useShopDirectoryNavigation)
- Direct navigation to any place (not just marketplace shops) — NavigationDestination type system, adapters, QA drive panel with 45 Atlanta destinations (Passes 634–641)
- Report geocoding (Nominatim address + ZIP centroid fallback), bid count badges on map pins
- Glass design system unified across landing + dashboard (bd-dashboard-\* CSS primitives, Pass 632)
- Cloud-synced saved shops, watchlists, shortlists, website preferences (Supabase `website_relationships` table)
- Provider-agnostic business profiles (shop + insurer) in Supabase
- Navigation session cloud persistence (Supabase `navigation_sessions` table)
- Real-time bid updates via Supabase Realtime (`useBidsForReport` hook subscribes to INSERT/UPDATE/DELETE on `bids` table)
- Real-time customer bid notifications (`useCustomerBidNotifications` — toast + feed when shop submits bid, Pass 782)
- Real-time shop bid status notifications (`useShopBidStatusNotifications` — toast when customer accepts/rejects, Pass 784)
- Real-time customer report status notifications (`useCustomerReportStatusNotifications` — toast on report lifecycle changes, Pass 785)
- Real-time insurer claim notifications (`useInsurerClaimNotifications` — toast on claim lifecycle changes, Pass 786)
- Real-time shop estimate request notifications (`useShopEstimateNotifications` — toast + refetch when customer submits estimate request, Pass 797)
- Real-time shop estimate status notifications (`useShopEstimateStatusNotifications` — toast + refetch when customer accepts/declines estimate, Pass 800)
- Real-time customer estimate response notifications (`useCustomerEstimateResponseNotifications` — toast + refetch when shop responds with pricing, Pass 798)
- Notification deduplication (3-second window via title+body key, prevents Supabase reconnect spam, Pass 788)
- Job status update error surfacing (optimistic rollback + user-facing error notification, Pass 789)
- Vehicle delete confirmation + save error handling with optimistic rollback (Pass 795)
- Insurer claim approve/deny error surfacing with success/error notifications (Pass 794)
- Lazy chunk retry for all 24 lazy-loaded screens (`lazyWithRetry` utility, Pass 617)
- Chunk-aware error boundary with "Update available / Reload Page" UX (Pass 617)
- VIN input sanitization on both vehicle forms (auto-uppercase, strip I/O/Q, maxLength=17, Pass 619)
- Photo upload mounted guard prevents setState after unmount (Pass 618)
- OWASP security audit passed: zero XSS, zero SQL injection, zero hardcoded secrets (Pass 619)
- Zero production `any` types; zero dead code; zero ungated console statements (Passes 609, 611, 622)
- Report geocoding preserves stored coordinates through transform — no re-geocoding on load (Pass 804)
- Map report pins properly show vehicle/damage info for customer reports via toMapReportShape boundary transform (Pass 805)
- Silent Supabase data-load and auto-save failures surfaced to users (Pass 801)
- Duplicate incomplete transformSupabaseReport removed from useUserDataHelpers.ts — canonical transform lives in userDataUtils.ts only (Pass 807)

**Seeded / dev-usable (not yet live marketplace behavior):**

- Shop directory data is Supabase-backed but populated with seeded BidOnDent-branded hubs (3 seed shops), not real third-party shop signups
- Marketplace loop requires manual discovery — no notification to shops when new reports appear in their area
- Geocoding is Nominatim (free, rate-limited) — functional for dev, not production-scale
- Demo mode provides synthetic data to populate screens; real mode shows only seed data
- Demo customer reports now include seed bids (3 bids across 2 seed reports, Pass 781)

**Data honesty status (verified Pass 779):**

- All marketplace screens show "Not provided" for missing fields — zero fake placeholders remain
- Seed data clearly guarded — actions on seed IDs are blocked with explicit messaging
- Edge function `hydrateReport` returns real customer profile + bid count from Supabase

**Not yet built:**

- Push notifications, payment processing, offline detection
- Real PostGIS geo-queries for shop proximity
- Real third-party shop onboarding / organic shop participation
- Shop service area definition and visualization (polygon/radius storage)
- In-app real-time notifications complete (8 hooks across all user types; push notifications still needed for native/background delivery)

**Historical passes (1–499):** Archived to `docs/archive/MAP_TRACKER_PASSES_1_499.md`

---

## Passes 801–810 — Reliability, Type Safety, Dead Code & Re-Anchor Audit (2026-04-05)

| Pass | Title                                 | Key Changes                                                                                                                                                                                                                   |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 801  | Surface silent Supabase failures      | useUserData catch block now sets reportsError + stops loading instead of DEV-only log; useUserDataCloudSync fires onSyncError callback on auto-save failure                                                                   |
| 802  | Type transformSupabaseReport return   | Added explicit FrontendReport return type with narrow status cast; eliminated 4 `as unknown` casts in useUserDataHelpers + useUserDataLoader                                                                                  |
| 803  | File size governance audit            | All core files under 500-line hard limit — no extraction needed                                                                                                                                                               |
| 804  | Fix report geocoding data loss        | transformSupabaseReport now includes latitude/longitude; useReportLayerData prefers stored coordinates over re-geocoding; eliminates unnecessary Nominatim calls                                                              |
| 805  | Fix map report data mismatch          | Added toMapReportShape() boundary transform in userDataUtils.ts; replaced unsafe `as unknown as DamageReport[]` cast in DashboardSecondaryViews — map pins now show correct vehicle/damage info for customer reports          |
| 807  | Remove dead transform functions       | Removed ~120 lines: transformSupabaseReport, transformSupabaseReports, transformSupabaseBid, extractBidsFromReports, createFreshUserData from useUserDataHelpers.ts (all dead code, canonical transforms in userDataUtils.ts) |
| 808  | Phase 1-2 documentation sync          | Updated CODE_ORGANIZATION_AUDIT, tracker, and master context to reflect Pass 801-807 results                                                                                                                                  |
| 809  | Update CODE_ORGANIZATION_AUDIT        | Synced audit doc with Phase 1-2 completion status and verified baseline numbers                                                                                                                                               |
| 810  | Fix notification priority type errors | Fixed priority type mismatch in useCustomerReportStatusNotifications and useInsurerClaimNotifications                                                                                                                         |
| 811  | Shop service area foundation          | Created shop_service_areas migration (017), edge function CRUD handlers, client service (serviceAreas.ts), registered routes                                                                                                 |
| 812  | Wire ShopMapWidget to real areas      | GET handler supports session-based fetch, added getMyShopServiceAreas client fn, useShopServiceAreas hook, ShopMapWidget shows real area data + dynamic map center                                                            |
| 813  | Service area circle overlay           | DashboardMapPreview gains serviceAreaCircles prop with GeoJSON polygon rendering (fill + dashed border), ShopMapWidget passes radius areas as circle overlays on mini-map                                                     |
| 814  | Report pin status/bid audit           | Verified: status-color coding (amber/green/slate) + bid count badges already fully wired in MapLibreReportLayer.tsx. No changes needed — passes 814-815 scope already delivered.                                              |

**Full re-anchor audit (Pass 810+):**

- Build: ✅ 0 errors, 3.19s, 2877 modules
- Tests: ✅ 555/555 (55 test files, 3.34s)
- VS Code diagnostics: ✅ 0 errors
- Git: clean working tree, HEAD at afc63822
- All files under 500-line hard cap (largest: DashboardRouter 456, MapLibreShopDirectoryMapPane 447)
- OSRM routing verified genuinely wired (routeEngine.ts → router.project-osrm.org)
- All 12+ edge function handlers confirmed real
- Demo mode isolated and clearly flagged
- Canonical long-horizon master plan created in BIDONDENT_FINISHING_MASTER_PLAN.md

**Audit findings (no code changes needed):**

- All 5 critical user flows (report creation, bid submission, vehicle management, photo upload, shop onboarding) verified fully wired to Supabase edge functions
- Customer accept-bid flow verified: updateBidStatus → updateReportStatus → reject competing bids → createJobAssignment → map route handoff
- Insurer claims workflow 70% production-ready — core approve/deny wired, gaps are P3/P4 new features
- Geolocation error handling verified: ShopDirectoryOriginSearch + GeoErrorToast already surface GPS failures
- getPublicPartnerShops() throw verified caught by useCoveragePartnerShops with fetchError state
- All remaining `as unknown`/`as any` casts in production code are intentional (MapLibre library boundaries, window globals) or test-only (partial mocks)

---

## Passes 769–779 — Data Honesty Sweep + Sticky Header Removal (2026-04-04)

| Pass | Title                                    | Key Changes                                                                                                         |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 769  | Fix demo mode bid submission             | DashboardRouter Promise propagation, demo bid guard for seed IDs                                                    |
| 770  | Remove sticky headers (customer screens) | Removed frozen sticky headers from CustomerDashboard, ReportScreen, BidsScreen, AccountMenu                         |
| 771  | Remove sticky headers (shop screens)     | Removed sticky headers from ShopRequestsScreen, ShopEstimatesScreen, ShopActiveJobsScreen                           |
| 772  | Remove sticky headers (insurer screens)  | Removed sticky headers from InsurerClaimsScreen, InsurerPartnerShopsScreen, InsurerDashboard                        |
| 773  | Remove sticky headers (shared screens)   | Removed sticky headers from DemoModeScreen, FindShopsScreen, ShopDetailScreen                                       |
| 774  | Wire insurer claim submission to backend | InsurerClaimsScreen approve/deny handlers call Supabase edge function                                               |
| 775  | Honest shop marketplace data path        | `hydrateReport` edge function JOINs profiles + counts bids; `transformSupabaseReport` maps real customer/bid fields |
| 776  | Seed data transparency + action guards   | Fixed dishonest bidsCount on seed data; added guards preventing real API calls on seed-prefixed IDs                 |
| 777  | Insurer claims data honesty              | Claim numbers now RPT-{reportId}; priority from photo count only; shopAssigned from accepted bid                    |
| 778  | Shop job tasks and progress honesty      | Tasks reflect real bid state via hasBids flag; progress computed from task completion ratio (not hardcoded)         |
| 779  | Complete fake fallback sweep             | Replaced all remaining fake customer labels across marketplace ("Customer"→"Not provided", etc)                     |

**Key changes (Passes 775–779 data honesty sweep):**

- `hydrateReport` edge function now JOINs `profiles` table for customer_name/email/phone per report, counts bids from `bids` table
- `transformSupabaseReport` maps real customer, bid count, insurance fields from Supabase response
- All marketplace screens show "Not provided" for missing data instead of fake placeholders
- Seed data (`SEED_DAMAGE_REPORTS`) corrected: bidsCount was dishonestly 2, now 0
- Seed data guards prevent real API calls (bids, approve, deny) on seed-prefixed report IDs
- Insurer claim numbers are RPT-{reportId} (traceable) instead of synthetic CLM-0001 sequence
- Shop active job tasks use real bid state; progress is computed from task completion ratio
- Grep-verified zero remaining fake customer fallbacks across entire codebase

**P4-UX noted for future fix:** `tel:Not provided` and `mailto:Not provided` links on shop/insurer cards should be disabled when no real contact info exists.

---

## Passes 780–784 — Bid Loop Completion + Mobile Safety (2026-04-04)

| Pass | Title                                     | Key Changes                                                                                                                    |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 780  | Disable broken contact links              | Disabled tel:/mailto: links when contact info is "Not provided"                                                                |
| 781  | Seed demo bids for customer demo          | Added SEED_DEMO_BIDS constant (3 bids across 2 seed reports); useBidsForReport returns seed bids locally                       |
| 782  | Real-time bid notifications for customers | Created useCustomerBidNotifications hook; subscribes to Supabase Realtime bid INSERTs per report                               |
| 783  | Mobile viewport safety                    | CustomerMapWidget overflow-visible→hidden; CTA min-h 40→44px (all 3 widgets); HomeScreen overflow-x-hidden                     |
| 784  | Shop bid acceptance/rejection notify      | Created useShopBidStatusNotifications hook; subscribes to global bid UPDATEs; filters by shopId; pushes toast on status change |

**Key changes (Passes 781–784 notification + UX sweep):**

- Bidding loop notification is now complete: customer notified when shop bids, shop notified when customer accepts/rejects
- Demo customers now see realistic bid data (3 bids with prices, timelines, shop names)
- Mobile viewport hardened: no horizontal overflow possible on dashboard home, touch targets ≥44px
- Real-time subscriptions use Supabase Realtime postgres_changes on `bids` table (INSERT for customers, UPDATE for shops)

---

## Passes 785–787 — Full Notification Coverage + Empty State Polish (2026-04-04)

| Pass | Title                                       | Key Changes                                                                                                             |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 785  | Customer report status change notifications | Added subscribeToReportUpdates to RealtimeReportService; useCustomerReportStatusNotifications hook for status lifecycle |
| 786  | Insurer claim status change notifications   | useInsurerClaimNotifications hook reusing report update channel; filters claim-lifecycle events                         |
| 787  | Context-aware empty states                  | ShopRequestsScreen + InsurerClaimsScreen: differentiate zero-data vs filtered-empty with guiding copy                   |

**Key changes (Passes 785–787):**

- All three user types now have real-time notification coverage:
  - Customer: new bids (Pass 782), report status changes (Pass 785)
  - Shop: new reports (pre-existing), bid acceptance/rejection (Pass 784)
  - Insurer: claim lifecycle changes (Pass 786)
- RealtimeReportService extended with UPDATE subscription channel alongside existing INSERT channel
- Empty states now guide users clearly when there is genuinely no data vs when filters hide results

---

## Passes 788–789 — Notification Dedup + Backend Error Surfacing (2026-04-04)

| Pass | Title                             | Key Changes                                                                                                                |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 788  | Notification deduplication        | useNotificationEvents.push() deduplicates events with identical title+body within 3-second window; Map-based tracking      |
| 789  | Fix silent job status update fail | onUpdateJobStatus now throws on failure; ShopActiveJobsScreen awaits + rolls back optimistic UI + shows error notification |

**Key changes (Passes 788–789):**

- Duplicate notifications from Supabase reconnection are now silently dropped (3s dedup window)
- Shop job status updates no longer fail silently — users see "Update failed" notification if backend persist fails
- Seed/demo data status changes skip backend call entirely (local-only by design)
- P2-ARCH: `onConfirmCompletion` has a similar silent-catch pattern — noted for next pass

---

## Passes 790–791 — Error Surfacing Sweep (Critical Product Loop) (2026-04-04)

| Pass | Title                                       | Key Changes                                                                                                                   |
| ---- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 790  | Fix silent bid acceptance failure           | handleAcceptBid throws on backend failure; BidsScreen awaits + rolls back optimistic state + error notification               |
| 791  | Fix silent bid rejection + confirm complete | onRejectBid + onConfirmCompletion throw on failure; callers await with error notification; ReportDetailScreen wired to notifs |

**Key changes (Passes 789–791 error surfacing sweep):**

- All critical user actions now surface backend failures to the user:
  - Job status update (Pass 789): optimistic rollback + error notification
  - Bid acceptance (Pass 790): optimistic rollback + error notification, success notification deferred until backend confirms
  - Bid rejection (Pass 791): error notification on failure
  - Completion confirmation (Pass 791): error notification on failure, success notification on confirm
- `buildDashboardRouterPropsHelpers.test.ts` updated: `handleAcceptBid` failure test expects thrown error
- Zero silent error swallowing remains in the core report→bid→accept→repair→complete loop
- Remaining fire-and-forget patterns (marketplace refresh) are P4 — acceptable for non-critical secondary actions

---

## Passes 794–795 — Error Surfacing Completion + Vehicle Safety (2026-04-04)

| Pass | Title                                                 | Key Changes                                                                                                                                                |
| ---- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 794  | Fix silent insurer claim approve/deny failure         | DashboardRouter throws on false return from updateClaimDecision; InsurerClaimsScreen awaits handlers, shows success/error notifications                    |
| 795  | Vehicle delete confirmation + error handling/rollback | Inline delete confirmation banner; handleDelete/handleSave async with try/catch + optimistic rollback; onSaveVehicles async (no longer fire-and-forget)    |
| 796  | Auto-refresh estimate requests + shop bids            | refetchCustomerEstimates + refetchShopBids callbacks in useDashboardData; wired through DashboardRouter → ShopDirectoryScreen after successful submissions |

**Key changes (Passes 794–795):**

- Insurer claim approve/deny now surfaces backend failures with error notification (was completely silent)
- Vehicle deletion requires explicit confirmation ("Delete this vehicle? This can't be undone.")
- Both vehicle delete and save have optimistic rollback on failure: vehicles restore to pre-action state
- `buildDashboardRouterProps.onSaveVehicles` now `async` — awaits `deleteVehicle()` calls (was fire-and-forget with `.catch()`)
- `dashboard-router-types.ts`: `onSaveVehicles` type accepts `void | Promise<void>`
- Error surfacing sweep now covers ALL user types and ALL critical + secondary actions
- Customer estimate requests and shop submitted bids lists now auto-refresh after successful submissions (was fetch-once-on-mount)

---

## Pass 797 — Shop Estimate Inbox Real-Time Notifications (2026-04-04)

| Pass | Title                                       | Key Changes                                                                                                                              |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 797  | Shop estimate inbox real-time notifications | RealtimeEstimateService for estimate_requests INSERTs; useShopEstimateNotifications hook; refetchShopEstimates wired in useDashboardData |

**Key changes (Pass 797):**

- Shops now receive real-time notifications when customers submit estimate requests (was fetch-once-on-mount only)
- Created `RealtimeEstimateService` — 3rd Supabase Realtime service singleton, subscribes to `estimate_requests` INSERT events
- Created `useShopEstimateNotifications` — 6th real-time notification hook, pushes toast + calls refetch callback
- `useDashboardData` wired with `refetchShopEstimates` callback using `getShopEstimateRequests` + state setter
- Real-time notification coverage now includes:
  - Customer: new bids (782), report status (785)
  - Shop: new reports (pre-existing), bid status (784), new estimate requests (797)
  - Insurer: claim lifecycle (786)
- Remaining real-time gaps: estimate responses → customers, customer accept/decline → shops

---

## Pass 798 — Customer Estimate Response Real-Time Notifications + Type Fixes (2026-04-04)

| Pass | Title                                                 | Key Changes                                                                                                                                                          |
| ---- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 798  | Customer estimate response notifications + type fixes | subscribeToUpdates() on RealtimeEstimateService; useCustomerEstimateResponseNotifications hook; NotificationCategory/DeepLink types fixed; App.tsx deep link handler |

**Key changes (Pass 798):**

- Customers now receive real-time notifications when shops respond to their estimate requests (status → "responded")
- Extended `RealtimeEstimateService` with `subscribeToUpdates()` method for UPDATE events (2nd channel on same service)
- Created `useCustomerEstimateResponseNotifications` — 7th real-time notification hook
- Fixed `NotificationCategory` type: added "estimate" (was missing, caused TS error)
- Fixed `NotificationDeepLink` type: added `{ screen: "estimates" }` (was missing, caused TS error)
- Added "estimates" case to App.tsx deep link handler: navigates to shop estimates tab
- Real-time notification coverage now complete for all user types:
  - Customer: new bids (782), report status (785), estimate responses (798)
  - Shop: new reports (pre-existing), bid status (784), new estimate requests (797)
  - Insurer: claim lifecycle (786)
- Remaining real-time gap: customer accept/decline estimate → shops (lower priority, shop sees on inbox refresh)

---

## Passes 799–800 — Profile Error Surfacing + Estimate Loop Completion (2026-04-04)

| Pass | Title                                                  | Key Changes                                                                                                                                                  |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 799  | Fix silent profile save failure                        | AccountScreen.saveProfileChanges catch block now pushes "Profile Save Failed" notification instead of silently swallowing                                    |
| 800  | Shop estimate accept/decline notifications + multi-sub | useShopEstimateStatusNotifications hook; RealtimeEstimateService refactored to Set<callback> for multi-subscriber; estimate notification loop fully complete |

**Key changes (Passes 799–800):**

- Profile save errors now surface to users via toast notification (was completely silent, P2-DATA)
- Shops now receive real-time notifications when customers accept or decline their estimates
- `RealtimeEstimateService.subscribeToUpdates()` refactored from single-callback to `Set<EstimateCallback>` pattern:
  - Channel created once, shared by all subscribers
  - Channel torn down only when last subscriber disconnects
  - Previously second subscriber was silently dropped
- Real-time estimate notification loop now fully complete:
  - Customer submits estimate request → shop notified (Pass 797)
  - Shop responds with pricing → customer notified (Pass 798)
  - Customer accepts/declines → shop notified (Pass 800)
- 8 real-time notification hooks total across all user types
- No remaining real-time notification gaps in the core product loop

---

## Passes 792–793 — Loading State Polish (2026-04-04)

| Pass | Title                       | Key Changes                                                                                            |
| ---- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| 792  | BidsScreen loading state    | Pipe bidsLoading from useBidsForReport to BidsScreen; show spinner during fetch instead of empty state |
| 793  | Report detail loading state | Show spinner while reportsLoading is true instead of false 'Report not found' error                    |

**Key changes (Passes 792–793):**

- BidsScreen no longer flashes "No bids yet" while Supabase fetch is in progress — shows spinner
- ReportDetailScreen no longer shows "Report not found" during loading — shows spinner
- Both follow same pattern as existing ShopRequestsScreen/InsurerClaimsScreen loading states

---

## Passes 633–641 — Direct Navigation System + Architecture Compliance (2026-04-13)

| Pass | Title                             | Key Changes                                                                                                      |
| ---- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 633  | IDOR security fix                 | IDOR vulnerability in edge function — user can only access own data                                              |
| 634  | NavigationDestination type system | `NavigationDestination` + `NavigationDestinationKind` types in mapDomain.ts                                      |
| 635  | Destination adapters              | 4 adapter functions (shop→dest, session waypoint, coverage target, geocode result) + 4 tests                     |
| 636  | Direct navigation handler         | `handleStartDirectNavigation(dest)` in useShopDirectoryNavigation — starts session for any NavigationDestination |
| 637  | Doc coordination update           | ChatGPT parallel worker prompt + coordination docs                                                               |
| 638  | Fix P1 race condition             | `handleStartDirectNavigation` activates synchronously; lifecycle sync effect guards `directDestination`          |
| 639  | Destination-agnostic lifecycle    | `liveNavigationActive` flag covers shop + direct; follow-position/arrival/auto-end fire for both                 |
| 640  | Guidance card null-safety         | `selectedShop`/`selectedOrigin` nullable in guidance card; render guard loosened — card shows during direct nav  |
| 641  | Derived state extraction          | Extract ~100 lines of derived state to `shopDirectoryNavigationDerived.ts`; main hook 547→497 lines (under 500)  |

**Key artifacts created (Passes 634–641):**

- `NavigationDestination` type — universal destination shape for shops, places, addresses
- `navigationDestinationAdapters.ts` — 4 adapter functions (all tested)
- `shopDirectoryNavigationDerived.ts` — Pure computation helpers: flags, route display, ETA/distance, action labels
- QA Drive Panel (ChatGPT Passes 700–712) — 45 Atlanta destinations with neighborhood filter, DEV-only
- Direct nav pipeline fully wired: QA Picker → session → lifecycle → guidance card → route fetching → display

---

## Passes 625–632 — Bundle Optimization, Hardening, Dashboard Surface System (2026-04-05)

| Pass | Title                        | Key Changes                                                                                                                                                                                               |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 625  | Failing test fix             | Fixed 1 broken test in edge function test suite                                                                                                                                                           |
| 626  | Bundle optimization          | Index chunk 604KB → 206KB via lazy-loading heavy screens                                                                                                                                                  |
| 627  | Doc drift fixes              | Master context + tracker alignment                                                                                                                                                                        |
| 628  | Edge function hardening      | Supabase edge function safety improvements                                                                                                                                                                |
| 629  | Edge function hardening pt 2 | Additional edge function validation                                                                                                                                                                       |
| 630  | Mock notification removal    | Removed synthetic notification data                                                                                                                                                                       |
| 631  | Code cleanup                 | Minor cleanup pass                                                                                                                                                                                        |
| 632  | Dashboard Surface System     | +443 lines CSS primitives in theme.css (bd-dashboard-panel/section/chip/note/button classes with dark/light variants). 22 component migrations, zero logic changes. Co-authored with ChatGPT design pass. |

**Key artifacts created (Pass 632):**

- `bd-dashboard-panel` + variants (`--deep`, `--accent-blue`, `--accent-cyan`, `--accent-indigo`) — Primary surface glass panels with backdrop-filter, pseudo-element highlights
- `bd-dashboard-section` + variants (same + `--accent-rose`, `--interactive`, `--selected`) — Secondary surface sections
- `bd-dashboard-chip`, `bd-dashboard-note` (`--deep`), button primitives (`primary`, `secondary`, `ghost`, `filter`) — Utility surfaces
- Full `[data-appearance-mode="light"]` overrides for all primitives
- AccountMenu refactored from repetitive JSX to data-driven `renderRow` pattern

---

## Passes 612–622 — Runtime Hardening + Code Cleanliness (2026-04-03)

**Condensed summary of 11 passes focused on runtime safety, security, and code quality.**

| Pass | Title                             | Key Changes                                                                                                                      |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 612  | Aria-hidden focus trap fix        | 150ms setTimeout delay before focus on map drawer open                                                                           |
| 613  | Parallelize data loading          | Promise.all/Promise.allSettled for cloud sync operations                                                                         |
| 614  | Runtime robustness + UX           | Multiple runtime safety improvements                                                                                             |
| 615  | Doc update                        | Master context header updated to Pass 614 state                                                                                  |
| 617  | Lazy chunk retry + error boundary | Created `lazyWithRetry` utility for all 24 lazy-loaded screens; ScreenErrorBoundary detects chunk errors and shows "Reload Page" |
| 618  | Photo upload mounted guard        | `mountedRef` in useReportForm prevents setState after unmount during async photo upload                                          |
| 619  | VIN input sanitization            | OWASP security audit: zero XSS, zero injection. VIN inputs auto-uppercase, strip I/O/Q, maxLength=17                             |
| 621  | Doc update                        | Master context updated to Pass 619 with security audit line                                                                      |
| 622  | Dead code removal                 | Deleted orphaned `RealtimeBidExample.tsx` (396 lines, 0 imports)                                                                 |
| 623  | Runtime screen verification       | All screens tested: Dashboard ✅, Report ✅, Bids ✅, Account ✅, Demo Mode (Customer + Shop) ✅                                 |

**Key artifacts created:**

- `src/app/utils/lazyWithRetry.ts` — Retries failed dynamic imports once after 1.5s delay
- Enhanced `ScreenErrorBoundary.tsx` — Chunk-aware error detection with specific "Update available" messaging

**Security audit confirmed:** Zero XSS vectors, zero SQL injection, zero hardcoded secrets, proper CORS, proper auth boundary (Clerk → edge → Supabase).

---

## Passes 568–611 — Code Extraction Sweep Phase 2 + Stability (2026-04-03)

**Condensed summary of 44 passes focused on further code extraction below 500-line soft limit, runtime fixes, and type safety.**

| Pass    | Title                               | Key Changes                                                                                                  |
| ------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 568     | Delete dead **test**.ts             | Removed unused test config file                                                                              |
| 569     | Extract computed values             | `useShopDirectoryComputedValues` from `useShopDirectorySession` (500→406)                                    |
| 570     | Extract renderLandingPage           | From `App.tsx` (496→446)                                                                                     |
| 571     | DEMO_MODE env-driven                | Defaults false in production                                                                                 |
| 572–573 | Extract props types                 | MapPane + ImmersiveMap props to dedicated type files                                                         |
| 574     | Extract CoverageBrowseExperience    | Types and helpers                                                                                            |
| 575     | Extract userDataValidation          | From `useUserDataHelpers` (487→279)                                                                          |
| 576     | Extract useGuidanceSettings         | From `useShopDirectoryNavigation` (485→442)                                                                  |
| 577     | Extract ShopDirectoryScreen helpers | Props type + helpers (484→433)                                                                               |
| 578–580 | Extract shop component helpers      | RoutePanel utils, ShopDetailSheet sub-components, atlantaTestHubSeed data                                    |
| 581     | Fix duplicate export                | HomeReportsList export + dead HomeSidebar removed                                                            |
| 582     | Extract directoryAdapters utilities | To companion file                                                                                            |
| 583–589 | Extract screen helpers              | ShopRequests, InsurerConnection, ShopEstimate, LikedShops, Account, ShopDirectoryGuidance, InsurerNewClaim   |
| 590–594 | Extract hook/service helpers        | BidsScreen, CoverageMap, ShopDirectoryMapPane, CoverageNearestShops, useUserData cloud sync                  |
| 597–601 | Extract service utilities           | websiteIdentitySanitizers, routeVoicePhrases, routeEngine voice builder, marketIntelligence, demoDataService |
| 602–608 | Extract additional helpers          | shopMapExperience, marketSeedData, placeDiscovery, directoryAdapters, onAcceptBid handler                    |
| 609     | Eliminate remaining any types       | From shared type definitions                                                                                 |
| 610     | Fix aria-hidden focus trap          | On report popup button                                                                                       |
| 611     | DEV-gate console statements         | 2 remaining ungated console statements                                                                       |

---

## Pass 567 — Security hardening: credentials, CORS, console leakage (2026-04-03)

- **Why this pass was chosen:** Full security audit revealed 3 CRITICAL + 2 HIGH issues. Hardcoded passwords in source control, wildcard CORS, and ungated console warnings in production code.
- **What changed:**
  - **Removed hardcoded credentials:** `ADMIN_SWITCH_PASSWORD` ("admin123") now reads from `VITE_ADMIN_SWITCH_PASSWORD` env var. Demo password "demo123" removed from `demoMode.ts`, `DemoLoginHelper.tsx`, `DemoModeBanner.tsx` — centralized to `VITE_DEMO_PASSWORD` env var.
  - **CORS lockdown:** Edge function `corsHeaders` changed from wildcard `*` to whitelisted origins (bidondent.com, vercel, localhost in dev). Dynamic origin reflection via `getCorsOrigin()`. Restricted allowed headers to `Content-Type, Authorization, x-clerk-user-id`. Removed `Access-Control-Expose-Headers: *`.
  - **Console leakage:** DEV-gated `console.warn` in `profileImageUpload.ts` (upload timeout/failure) and `MapLibreShopDirectoryViewportManager.tsx` (invalid viewport bounds).
  - **`.env.example`** updated with new env vars.
- **Files touched:** `adminConfig.ts`, `demoMode.ts`, `DemoLoginHelper.tsx`, `DemoModeBanner.tsx`, `constants.ts` (edge), `index.ts` (edge), `helpers.ts` (edge), `profileImageUpload.ts`, `MapLibreShopDirectoryViewportManager.tsx`, `.env.example`
- **Validation:** Build: 3.34s, 0 errors. Diagnostics: 0.
- **Problem taxonomy:** P0:3-fixed (hardcoded creds, CORS wildcard) P1:0 P2:0 P3:0 P4:2-fixed (console leakage) P5:0 P6:0 P7:0
- **Security audit also confirmed:** RLS policies properly hardened (migration 012), edge function auth checks robust, `sanitizeErrorMessage()` used consistently in all catch blocks, error boundaries in place at global/screen/navigation/image levels.
- **Best next pass:** Functional code fixes — connect broken UI flows, fix `any` types in shared type definitions, or `useShopDirectorySession.ts` extraction (at 500-line hard limit).

## Pass 566 — Runtime console fix + report UX polish (2026-04-03)

- **Why this pass was chosen:** P1-RUNTIME (console error every drawer open) + P4-UX (user-facing "undefined" text and "Submitted Unknown" on core map surface).
- **What changed:**
  - **DrawerOverlay (drawer.tsx):** Wrapped with `React.forwardRef()` to fix Radix SlotClone ref-forwarding console error that fired on every drawer open.
  - **ReportDetailDrawer:** Changed `submittedAt` fallback from `"Unknown"` to `null` — the "Submitted" line is now conditionally hidden when no `created_at` date exists, eliminating "Submitted Unknown" text.
  - **ReportLayerPopup:** Added null guards for `vehicle_year`, `vehicle_make`, `vehicle_model`, `damage_type`, `damage_severity` — prevents rendering "undefined" text when report data is incomplete. Falls back to "Damage Report" for missing vehicle info.
- **Files touched:** `drawer.tsx`, `ReportDetailDrawer.tsx`, `ReportLayerPopup.tsx`
- **Validation:** Build: 3.26s, 0 errors. Diagnostics: 0.
- **Problem taxonomy:** P1:1-fixed (forwardRef console error) P4:2-fixed (undefined text, Submitted Unknown)
- **Best next pass:** `useShopDirectorySession.ts` is at exactly 500 lines (hard limit, 0 headroom) — extraction needed before any additions. Or: shop notification of new reports (P1 marketplace gap).

## Pass 565 — Structural extraction: useNavigationLaunch (2026-04-03)

- **Why this pass was chosen:** P3-ARCH. `useOperatingRegionsCoverage.ts` was stuck at 515 lines on disk — Prettier `printWidth: 100` auto-expands the return object to one-property-per-line, defeating compaction (tried 3× in Passes 552/556, reverted each time). Only structural extraction solves this durably.
- **What changed:**
  - **Created `useNavigationLaunch.ts`** (126 lines): Extracted navigation-launch concern — `navigationSession`, `navigationStartRequestId`, `pendingNavigationStartShopId` state; focus-sync effect (auto-select pending shop on return from external nav); pending-start effect (~28 lines, manages navigation session priming + voice engine + geomessage); `handleOpenDirections` and `handleOpenBidOnDentNavigation` functions.
  - **Modified `useOperatingRegionsCoverage.ts`** (436 lines, was 515): Removed 3 state declarations, 2 effects, 2 functions. Added `useNavigationLaunch({...})` call. Return object delegates 4 properties to `navLaunch.*`.
  - **Fixed duplicate `circlePolygon` import** in `MapLibreServiceCoverageMap.tsx` (build-breaker — Vite babel overlay in browser).
  - **Fixed 3 type errors** in `CustomerEstimateDetailSheet.tsx` (`estimate.id` and `estimate.status` are optional — added null guards).
- **Files touched:** `useNavigationLaunch.ts` (new), `useOperatingRegionsCoverage.ts`, `MapLibreServiceCoverageMap.tsx`, `CustomerEstimateDetailSheet.tsx`
- **Validation:** Build: 3.24s, 0 errors. Diagnostics: 0. All files ≤500 lines.
- **Problem taxonomy:** P0:1-fixed (duplicate import) P1:0 P2:0 P3:1-fixed (extraction) P4:0 P5:0 P6:0 P7:0
- **Architecture decisions:** `useNavigationLaunch` takes a deps object with selectedShop, navigation state, and callbacks — no circular dependencies. Parent hook passes through `navLaunch.*` in return object. Zero behavior change.
- **Doc updates:** CLAUDE_AI_MASTER_CONTEXT (last-updated, key files table), CODE_ORGANIZATION_AUDIT (pass entry), PRODUCT_BRAIN (file sizes note), MAP_TRACKER (this entry).
- **What this unlocks:** `useOperatingRegionsCoverage.ts` is now 436 lines — 64 lines of headroom. Prettier-safe. No further compaction/extraction needed for this file.
- **Best next pass:** Continue with map product loop or handguide enrichment for AI agent onboarding quality.

## Passes 563–564 — Repository Truth Reconciliation + Commit (2026-04-02)

- **What changed:** Audited 49 untracked + 124 modified files from extraction sweep. Fixed doc drift in CLAUDE_AI_MASTER_CONTEXT (Section 17 wrong file names, stale exception language), PRODUCT_BRAIN (stale feature maturity claims), CODE_ORGANIZATION_AUDIT (stale ShopDirectoryScreen claims). Committed 212-file working tree as `14aa33d5`.
- **Files touched:** 4 docs + git commit (212 files, 24,538 insertions, 12,821 deletions)

---

## Pass 545 — Extract websiteIdentity sanitizers (2026-04-02)

- **Why this pass was chosen:** P3-ARCH. `websiteIdentity.ts` was 683 lines — 1.37× the 500-line hard limit. Contains ~370 lines of pure sanitization/validation logic (type guards, primitive sanitizers, domain object sanitizers, and the main `sanitizeMemory` function) that are self-contained data transforms with no side effects.
- **What changed:**
  - **Created `websiteIdentitySanitizers.ts`** (435 lines): All validation/sanitization logic extracted — `DEFAULT_MAP_SESSION`, `DEFAULT_MEMORY`, allowed-value constant arrays, type guards (`isRecord`, `deepEqual`, `isAllowedValue`, `isFiniteNumber`, `isValidTimestamp`, `isNonEmptyString`), primitive sanitizers (`sanitizeNumericCollection`, `sanitizeStringArray`, `sanitizePositiveInteger`, `sanitizeNullablePositiveInteger`), domain sanitizers (`sanitizeCoordinates`, `sanitizeViewportBounds`, `sanitizePlace`, `sanitizeSavedPlaceMetadata`, `sanitizeSavedPlace`, `sanitizeRecentSearch`, `sanitizeSearchFilters`), and the main `sanitizeMemory` + `sanitizeWebsiteSessionMemory` functions.
  - **Modified `websiteIdentity.ts`** (274 lines, was 683): Identity + storage orchestrator only — types, interfaces, session management functions, and the public API (`buildWebsiteIdentity`, `loadWebsiteSessionMemory`, `replaceWebsiteSessionMemory`, `updateWebsiteSessionMemory`). Re-exports `sanitizeWebsiteSessionMemory` for backward compatibility.
- **Files touched:** `websiteIdentity.ts` (modified), `websiteIdentitySanitizers.ts` (new)
- **Validation:** Build: 3.20s, 0 errors, 2808 modules. Diagnostics: 0 across both files.
- **Problem taxonomy:** P3:[1] found/fixed/0 remaining.
- **Architecture decisions:** Sanitizer file imports types from `websiteIdentity` (type-only, no circular runtime deps). Main file imports `DEFAULT_MEMORY`, `deepEqual`, `sanitizeMemory`, `sanitizeWebsiteSessionMemory` from sanitizer. Re-exports `sanitizeWebsiteSessionMemory` so existing consumers (`websitePreferencesSync.ts`) don't need import path changes.
- **What this unlocks:** Next extraction targets: `useShopDirectoryNavigation.ts` (680), `CoverageMapDialog.tsx` (680), `ShopDirectoryMapLayers.tsx` (652).
- **Best next pass:** Pass 546 — Extract `useShopDirectoryNavigation.ts` (680 → under 500).

## Pass 544 — Extract BidsScreen (2026-04-02)

- **Why this pass was chosen:** P3-ARCH. `BidsScreen.tsx` was 708 lines — 1.4× the 500-line hard limit. Third-largest file in the codebase after the two map files tamed in Passes 542-543.
- **What changed:**
  - **Created `BidsEmptyState.tsx`** (109 lines): Full early-return empty state — header card with back button, "Repair Bids" title (role-aware subtitle), and waiting-state card with Clock icon, role-aware copy, and "Submit a Report" CTA.
  - **Created `BidsSummaryHeader.tsx`** (107 lines): Glass card header with radial gradient decorations, back button, "Repair Bids" title, bid count subtitle, Sparkle badge, and 3-column stats grid (Lowest Bid, Average Quote, Fastest Timeline).
  - **Created `BidsGeographyMap.tsx`** (113 lines): Map comparison section — "Bid geography comparison" header with mapped-count badge, DashboardMapPreview with shop/report pins, color-coded legend, or empty fallback with MapPin icon.
  - **Modified `BidsScreen.tsx`** (442 lines, was 708): Pure orchestrator — imports, props type, state/computed values, and JSX composition delegating to 3 extracted children plus existing BidCardArticle, ShopRatingModal, AcceptedBidConfirmationSheet.
- **Files touched:** `BidsScreen.tsx` (modified), `BidsEmptyState.tsx` (new), `BidsSummaryHeader.tsx` (new), `BidsGeographyMap.tsx` (new)
- **Validation:** Build: 3.16s, 0 errors, 2807 modules. Diagnostics: 0 across all 4 files.
- **Problem taxonomy:** P3:[1] found/fixed/0 remaining.
- **Architecture decisions:** Each extracted component is self-contained with typed props — no shared context needed. MapPin icon kept in orchestrator for the all-rejected CTA section. Data computation (useMemo hooks) remains in orchestrator since multiple children depend on it.
- **What this unlocks:** All three 700+ line files now under 500. Next extraction targets: `websiteIdentity.ts` (683), `useShopDirectoryNavigation.ts` (680), `CoverageMapDialog.tsx` (680).
- **Best next pass:** Pass 545 — Extract `websiteIdentity.ts` (683 → under 500).

## Pass 543 — Extract MapLibreShopDirectoryMapPane (2026-04-02)

- **Why this pass was chosen:** P3-ARCH. `MapLibreShopDirectoryMapPane.tsx` was 771 lines — the second-largest file in the codebase, 1.5× the 500-line hard limit. High-impact architectural extraction.
- **What changed:**
  - **Created `useMapPaneState.ts`** (375 lines): Extracted all internal state (13 useState, 1 useRef), 8 useEffect lifecycle hooks, 6 useMemo GeoJSON builders, 5 useCallback handlers, tile sync logic, computed values (selectedShop, selectedRoute, isDark, isNight, etc.), and interactive layer IDs.
  - **Created `MapPaneAtmosphereOverlays.tsx`** (74 lines): Night mode tint + glow, satellite tint + glow, ambient vignette — 5 conditional overlay divs.
  - **Created `MapPaneInfoPopups.tsx`** (89 lines): Saved place popup + route info popup (previously inline Popup components inside `<Map>`).
  - **Modified `MapLibreShopDirectoryMapPane.tsx`** (499 lines, was 771): Pure render orchestrator — props type, destructuring, hook call, and JSX composition. No direct useState/useEffect/useMemo/useCallback.
- **Files touched:** `MapLibreShopDirectoryMapPane.tsx` (modified), `useMapPaneState.ts` (new), `MapPaneAtmosphereOverlays.tsx` (new), `MapPaneInfoPopups.tsx` (new)
- **Validation:** Build: 3.19s, 0 errors, 2804 modules. Diagnostics: 0 across all 4 files.
- **Problem taxonomy:** P3:[1] found/fixed/0 remaining.
- **Architecture decisions:** Hook pattern (`useMapPaneState`) follows project convention (hooks = orchestration/state lifecycle). All internal state management extracted; component is pure render. Map load/error handlers moved into hook for clean callback delegation. Popup types inferred from `useShopMapInteraction` return shape.
- **What this unlocks:** The two largest map files now tamed. Next extraction targets: `BidsScreen.tsx` (708), `websiteIdentity.ts` (683), `useShopDirectoryNavigation.ts` (680).
- **Best next pass:** Pass 544 — Extract `BidsScreen.tsx` (708 → under 500).

## Pass 542 — Extract ShopDirectoryImmersiveMap (2026-04-02)

- **Why this pass was chosen:** P3-ARCH. `ShopDirectoryImmersiveMap.tsx` was 927 lines — the largest file in the codebase, nearly 2× the 500-line hard limit. Highest-impact architectural extraction available.
- **What changed:**
  - **Created `ImmersiveMapTopBar.tsx`** (138 lines): Floating top bar with back button, search input, drawer toggle, split-view switch, tile-mode cycle. Computes own style tokens from `isDark`.
  - **Created `ImmersiveMapResultsDrawer.tsx`** (294 lines): Collapsible bottom sheet (mobile) / side drawer (desktop) with drag handle, snap states, sort pills, shop result cards. Exports `DrawerSnap` type. Owns `handleDragEnd`, `snapHeights`, style tokens.
  - **Created `ImmersiveMapViewport.tsx`** (406 lines): MapPane + MapOverlays + guidance-mode sheets (ActionRail, TurnList, VoiceControls, Settings) + edge vignettes. Owns internal `turnListOpen`/`voiceControlsOpen`/`settingsOpen` state + cleanup useEffect.
  - **Modified `ShopDirectoryImmersiveMap.tsx`** (492 lines, was 927): Pure orchestrator — props type, destructuring, shared state (`drawerOpen`, `drawerSnap`, tile overrides), computed flags, ambient glow layers, and composition of 5 children (Viewport, OriginPicker, InfoPanel, TopBar, ResultsDrawer).
- **Files touched:** `ShopDirectoryImmersiveMap.tsx` (modified), `ImmersiveMapTopBar.tsx` (new), `ImmersiveMapResultsDrawer.tsx` (new), `ImmersiveMapViewport.tsx` (new)
- **Validation:** Build: 3.25s, 0 errors, 2801 modules. Diagnostics: 0 across all 4 files.
- **Problem taxonomy:** P3:[1] found/fixed/0 remaining.
- **Architecture decisions:** Children compute own style tokens from `isDark` (same pattern as Pass 541). Guidance-sheet state moved into Viewport (only consumer). Drawer snap/drag logic moved into ResultsDrawer. Orchestrator retains shared state (drawer open/snap, tile overrides) passed to both TopBar and Drawer.
- **What this unlocks:** Largest file in the codebase tamed. All shop directory files now under 500-line hard limit. Next extraction targets: `MapLibreShopDirectoryMapPane.tsx` (771), `BidsScreen.tsx` (708).
- **Best next pass:** Pass 543 — Extract `MapLibreShopDirectoryMapPane.tsx` (771 → under 500).

## Pass 541 — Extract ShopDirectoryHybridStage (2026-04-02)

- **Why this pass was chosen:** P3-ARCH. `ShopDirectoryHybridStage.tsx` was 516 lines (over 500-line hard limit) after Pass 540 extraction + second AI's design compaction work. Quick, safe architectural cleanup.
- **What changed:**
  - **Created `ShopDirectoryHybridHeader.tsx`** (83 lines): Extracted header block (eyebrow label, role/sort/tone/count badges, title, description). Computes its own style classnames from `isLight` prop.
  - **Created `ShopDirectoryHybridMapSection.tsx`** (266 lines): Extracted map container (NavigationErrorBoundary → MapPane → guidance overlay → MapOverlays) + summary footer bar + all 4 callbacks (`onSwitchToListMode`, `handleViewportChange`, `handleTileDarkChange`, `renderGuidanceOverlay`).
  - **Modified `ShopDirectoryHybridStage.tsx`** (271 lines, was 516): Removed 5 imports (MapPane, MapOverlays, ManeuverCard, ErrorBoundary, getDefaultMapCenter), removed `useCallback`, removed 5 style variables now internal to children, removed all 4 callbacks. Orchestrator role preserved: computed labels, shell/panel layout, search panel, list body, sheets.
- **Files touched:** `ShopDirectoryHybridStage.tsx` (modified), `ShopDirectoryHybridHeader.tsx` (new), `ShopDirectoryHybridMapSection.tsx` (new)
- **Validation:** Build: 3.16s, 0 errors, 2798 modules. Diagnostics: 0. Spellcheck: 0. All 3 files under 300-line soft limit.
- **Problem taxonomy:** P3:[1] found/fixed/0 remaining.
- **Architecture decisions:** Children compute their own style classnames from `isLight` to avoid prop drilling 5+ className strings. Session/nav/actions hook return types passed through (existing pattern).
- **What this unlocks:** HybridStage clean. Next extraction target: `ShopDirectoryImmersiveMap.tsx` (927 lines — largest file in codebase).
- **Best next pass:** Pass 542 — Extract `ShopDirectoryImmersiveMap.tsx` (927 → under 500).

## Pass 539 — Real-Time Bids + Doc Consolidation (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME + P5-DOC. Real-time bid notifications were the biggest partial feature (service existed but wasn't wired to production UI). Two temporary/redundant doc files needed integration and removal.
- **What changed:**
  - **`useBidsForReport` hook** now subscribes to Supabase Realtime via `RealtimeBidService` after initial fetch. New bids appear instantly (INSERT), status changes reflect immediately (UPDATE), deleted bids disappear (DELETE). Connection status exposed via `connectionStatus` return value. Dedup guard prevents duplicate entries. Ref-based stale closure protection.
  - **MAP_EXPERIENCE_ARCHITECTURE.md deleted** — unique content (mapSession fields, 3-layer persistence startup flow, role-aware map panel behavior, compact overlay density pattern) integrated into PRODUCT_BRAIN "Current Map/Search Reality" section.
  - **MAP_UI_HANDOFF_2026-04-02.md deleted** — temporary staging note; scope items (dashboard map layout shift, compact overlay density, landing coverage redesign, mobile/fullscreen fixes) now recorded here.
  - **Quick State Summary updated** — real-time bids promoted from "seeded/partial" to "real" tier.
  - **Doc references updated** — CODE_ORG_AUDIT, README, MASTER_CONTEXT all updated to remove MAP_EXPERIENCE_ARCHITECTURE references. Active doc count: 12 → 11.
- **Files touched:** `src/app/hooks/useBidsForReport.ts`, `docs/BIDONDENT_PRODUCT_BRAIN.md`, `docs/CODE_ORGANIZATION_AUDIT.md`, `docs/README.md`, `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` + 2 docs deleted
- **Validation:** Build: 0 errors, 3.37s. Diagnostics: 0.
- **Problem taxonomy:** P1:1-fixed P5:3-fixed P7:0
- **Architecture decisions:** Wired real-time into the existing hook (not the component) so BidsScreen gets updates without any prop/component changes. Used `useRef` for reportId to prevent stale closures in subscription callbacks.
- **Doc updates:** PRODUCT_BRAIN expanded with map session persistence + 3-layer architecture. Two docs retired.
- **What this unlocks:** Customers see new bids and status changes in real time. Future: shop-side report discovery notifications.
- **Best next pass:** ShopDirectoryScreen.tsx extraction (1,003 lines → under 500-line hard cap).

---

## Pass 538 — Corrective Documentation Truth Pass (2026-04-02)

- **Why this pass was chosen:** P5-DOC. Pass 537 cleaned the doc system but propagated some overstated product truth claims. This pass makes surgical corrections to align docs with verified code reality, using the framing: _real code ≠ seeded product flow ≠ live marketplace_.
- **What changed:**
  - **MAP_TRACKER Quick State Summary rewritten** with 3-tier framing: "Real code / real backend plumbing" → "Seeded / dev-usable" → "Not yet built." Shop data clarified as Supabase-backed seeded hubs, not real third-party signups. Marketplace discovery gap called out explicitly. Voice nav + auto-reroute confirmed REAL (was ambiguous). Navigation session cloud sync added to "real" tier.
  - **CODE_ORGANIZATION_AUDIT**: `ShopDirectoryScreen.tsx` (~1,003 lines) flagged as current 500-line hard cap violation in both File Size Status and Current Visual-System Weaknesses sections.
  - **PRODUCT_BRAIN**: "All src files under 500-line hard cap" corrected to note `ShopDirectoryScreen.tsx` exception.
  - **CLAUDE_AI_MASTER_CONTEXT**: Same 500-line claim corrected.
- **Files touched:** 4 docs (MAP_TRACKER, CODE_ORG_AUDIT, PRODUCT_BRAIN, MASTER_CONTEXT)
- **Validation:** No src changes. Build not needed (docs-only).
- **Problem taxonomy:** P5:4-fixed P7:0
- **What this unlocks:** Future AI sessions start with honest product state. No false confidence about marketplace maturity or file-size compliance.
- **Best next pass:** Marketplace loop hardening — wire RealtimeBidService into BidsScreen + shop-area report discovery notification.

---

## Pass 537 — Documentation System Cleanup (2026-04-02)

- **Why this pass was chosen:** P5-DOC → P3-ARCH. The docs system had grown to ~13,000 lines across 18 active docs — bloated with stale pass logs, duplicate planning content, verbose implementation hex values, and references to retired docs. AI agents were wasting context window on obsolete content. Comprehensive audit + stress-test of each doc's value led to this systematic cleanup.
- **What changed:**
  - **Archived 5 stale docs** to `docs/archive/`: NEW_SESSION_MASTER_PROMPT (actively harmful — contains false claims about missing backends), PRE_REFACTOR_BASELINE, VERIFICATION_MATRIX, AI_REFACTOR_KICKOFF, MCP_PLUGIN_INTEGRATION_PLAN.
  - **MAP_TRACKER rebuilt** (5,947 → 729 lines): Passes 1–499 archived to `docs/archive/MAP_TRACKER_PASSES_1_499.md`. Added Quick State Summary with verified product claims. Kept passes 500–536 + Active Risks/Vision/Roadmap.
  - **PRODUCT_BRAIN trimmed** (2,117 → 1,392 lines): Experience Maps (458 lines) archived to `docs/archive/PRODUCT_BRAIN_EXPERIENCE_MAPS.md`. Role-Specific Future Map Intel + Nav Roadmap (232 lines) archived to `docs/archive/PRODUCT_BRAIN_FUTURE_MAP_INTEL.md`. Screenshot Reality Check removed (stale since Pass 185).
  - **MAP_MASTER_PLAN trimmed** (1,675 → 288 lines): 1,325 lines of per-pass implementation notes + old pass summaries archived to `docs/archive/MAP_MASTER_PLAN_IMPL_NOTES.md`. Kept only strategic content: Mission, Non-Negotiables, Architecture, Themes, Future Direction, Definition of Done.
  - **MOLANDJEUS_DESIGN_DECISIONS trimmed** (761 → 540 lines): Atmospheric depth hex values, gradient maps, orb system details archived to `docs/archive/DESIGN_DECISIONS_IMPL_DETAILS.md`.
  - **CODE_ORGANIZATION_AUDIT trimmed** (380 → 353 lines): Removed stale Documentation Governance section referencing retired files.
  - **README.md updated**: New doc architecture (12 active + 24+ archived), removed references to archived docs, updated archive manifest.
  - **CLAUDE_AI_MASTER_CONTEXT.md updated**: Section 13 now lists all 12 active docs + MAP_EXPERIENCE_ARCHITECTURE. Updated metadata.

- **Product claim verification (from code audit):**
  - Bid acceptance E2E: ✅ TRUE (full chain: BidsScreen → updateBidStatus → edge handler → competing bids rejected → report status updated → shop navigation handoff)
  - Real-time bid notifications: ⚠️ PARTIAL (RealtimeBidService.ts exists with Supabase subscriptions but only used in example component, NOT in main BidsScreen)
  - Shop bids from map: ✅ TRUE (MapBidSheet → submitBid → edge handler → Supabase)
  - Estimate request backend: ✅ TRUE (full bidirectional flow)
  - Report-to-map pin accuracy: ✅ TRUE (geocoded + ZIP centroid fallback)

- **Files touched:** docs/BIDONDENT_MAP_TRACKER_2026-03-21.md, docs/BIDONDENT_PRODUCT_BRAIN.md, docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md, docs/MOLANDJEUS_DESIGN_DECISIONS.md, docs/CODE_ORGANIZATION_AUDIT.md, docs/README.md, docs/CLAUDE_AI_MASTER_CONTEXT.md, docs/archive/ (8 new archive files)
- **Validation:** Build: pending. Diagnostics: docs-only pass, no src changes. Spellcheck: docs-only.
- **Problem taxonomy:** P0:0 P1:0 P2:0 P3:0 P4:0 P5:7-fixed P6:0 P7:0
- **Architecture decisions:** 12-doc active system with tiered reading path. All verbose content archived (not deleted). MAP_EXPERIENCE_ARCHITECTURE.md kept as standalone reference (was originally slated for archive, kept after code audit).
- **Doc updates:** All active docs updated. README rewritten. MASTER_CONTEXT Section 13 expanded.
- **What this unlocks:** AI agents now consume ~5,000 lines instead of ~13,000. Faster context loading, less confusion from stale content, clear reading path.
- **Best next pass:** Real-time notification integration (RealtimeBidService → BidsScreen wiring, the biggest partial feature).

---

## Pass 536 — Consolidate Duplicated Dashboard Shell Types (2026-04-02)

- **Why this pass was chosen:** P3-ARCH — `ProfileDropdownData` was defined 4 times identically across DashboardLayout, DashboardSidebar, DashboardHeader, and LandingPageLayout. `UserProfile` was duplicated 3 times across the dashboard files. One copy (LandingPageLayout) had divergent fields (`notifications`, `notificationSyncActive`) that the others lacked, creating a maintenance trap.
- **What changed:**
  - **Created `src/app/types/dashboardShell.ts`**: Single source of truth for `ProfileDropdownData` (with `notifications?` and `notificationSyncActive?` as optional to cover both dashboard and landing page usage) and `UserProfile`.
  - **DashboardLayout.tsx**: Replaced inline type definitions with import from `dashboardShell.ts`, removed 18 lines of duplicate types.
  - **DashboardSidebar.tsx**: Same — removed inline `UserProfile` + `ProfileDropdownData`, added import.
  - **DashboardHeader.tsx**: Same.
  - **LandingPageLayout.tsx**: Same — removed inline `ProfileDropdownData` (was the divergent copy with extra fields).
- **Files touched:** 5 files (1 new + 4 modified), this tracker
- **Validation:** Build: 0 errors, 3.45s. Diagnostics: 0.
- **Problem taxonomy:** P3-ARCH:2/2/0 — Both duplicated types consolidated. Zero remaining duplicates.
- **Architecture decisions:** Made `notifications` and `notificationSyncActive` optional on the shared type so both dashboard (doesn't pass them) and landing page (does pass them) consumers work without type errors. Placed in `src/app/types/` alongside existing domain type files.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Future changes to `ProfileDropdownData` or `UserProfile` only need one edit instead of 4. Prevents the divergence pattern that created the LandingPageLayout variant.

---

## Pass 535 — Eliminate Production `any` Types (2026-04-02)

- **Why this pass was chosen:** P3-ARCH — 40 `any` occurrences across 18 files weakened type safety across the dashboard, layout, and component layers. Prioritized now because multiple files touched in recent passes exposed this debt.
- **What changed:**
  - **types/index.ts**: `WorkflowEvent.metadata` and `ActivityLog.details` → `Record<string, unknown>`
  - **StepVehicleInfo.tsx**: `vehicles: any[]` → `SavedVehicle[]` (new local type with `id`), removed `any` annotation from `.map()` callback
  - **ImageWithFallback.tsx**: `[rest: string]: any` → extends `React.ImgHTMLAttributes<HTMLImageElement>`
  - **AdminAccountSetup.tsx**: `catch (error: any)` → `catch (err: unknown)` with `instanceof Error` narrowing
  - **StorageInspector.tsx**: `catch (error: any)` → `catch (err: unknown)` with narrowing
  - **AccountInfoCard.tsx**: `vehicles: any[]` → typed array with `id`, `make`, `model`, `year`
  - **AdminAccountManager.tsx**: `as any` → `as "customer" | "shop" | "insurer"`
  - **ProfileDropdown.tsx**: `reports?: any[]` → `Report[]`, `vehicles?: any[]` → typed, `bids?: any[]` → typed, `bid: any` → `{ shopName?: string }`
  - **LandingPageLayout.tsx**: `reports: any[]` → `Report[]`
  - **DashboardSidebar.tsx**: `ProfileDropdownData.reports: any[]` → `Report[]`, props `reports: any[]` → `Report[]`
  - **DashboardHeader.tsx**: `ProfileDropdownData.reports: any[]` → `Report[]`, props `reports: any[]` → `Report[]`
  - **DashboardLayout.tsx**: `ProfileDropdownData.reports: any[]` → `Report[]`, props `reports: any[]` → `Report[]`
  - **ShopActiveJobsScreen.tsx**: `reports?: any[]` → `Report[]`, removed `.map()` `any` annotations
  - **InsurerNewClaimScreen.tsx**: `reports?: any[]` → `Report[]`, `onCreateClaim?: (claimData: any)` → typed payload
  - **InsurerPartnerShopsScreen.tsx**: `onAddShop?: (shopData: any)` → `CustomProspect`
  - **AccountScreen.tsx**: `vehicles?: any[]` → typed, `reports?: any[]` → `Report[]`
- **Files touched:** 16 files total (listed above), this tracker
- **Validation:** Build: 0 errors, 3.44s. Diagnostics: 0.
- **Problem taxonomy:** P3-ARCH:35/35/5 — 35 `any` occurrences eliminated. 5 remaining: `Report[key: string]: any` (RISKY, index signature), `ListScreenProps` (RISKY, generic), `maplibreResizePatch` (intentional), `ShopDirectoryImmersiveMap` (CSS custom props workaround), `StorageInspector` devtools `clerk_user_id` access.
- **Architecture decisions:** Used `Report` from `src/types/index.ts` for all report arrays (leverages existing index signature for dynamic fields). Used inline types for `vehicles` and `bids` in ProfileDropdown/AccountInfoCard rather than importing Supabase types to avoid coupling layout files to the backend type system.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Type safety across all dashboard screens, layout files, and form components. IDE autocompletion now works for report/vehicle/bid properties. Only 5 intentional/risky `any` remain.

---

## Pass 534 — MapBidSheet Validation Feedback + Touch Target Fix (2026-04-02)

- **Why this pass was chosen:** P4-UX — MapBidSheet correctly disables the submit button when fields are incomplete/invalid, but provides NO visual feedback explaining why. Users see a grayed-out button with no hint. Also, ShopBidsSummary "View Jobs →" button failed the 44px mobile touch target rule.
- **What changed:**
  - **MapBidSheet.tsx**: Added contextual validation hint text above the submit button. Shows "Enter a bid amount greater than $0" or "Enter estimated days (1 or more)" depending on which field is missing/invalid. Only appears after user has started entering data (not on empty form).
  - **ShopBidsSummary.tsx**: Added `min-h-[44px] min-w-[44px] flex items-center justify-center` to "View Jobs →" button for mobile touch compliance.
- **Files touched:** `MapBidSheet.tsx`, `ShopBidsSummary.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.33s. Diagnostics: 0. Mobile: touch targets compliant.
- **Problem taxonomy:** P4-UX:2/2/0
- **Architecture decisions:** Validation hint uses inline conditional rendering, no new state. Appears only when form is partially filled to avoid premature error messaging.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops placing bids from the map now get clear guidance on what's missing. Mobile touch compliance complete for ShopBidsSummary.

---

## Pass 533 — Stored-Coordinate Preference Sweep (2026-04-02)

- **Why this pass was chosen:** P2-DATA — Pass 531 fixed the 3 dashboard map widgets but 7 more screens still used ZIP-only `zipToCoordinates()` for report pins, ignoring stored `latitude`/`longitude`. Reports with geocoded coordinates but unrecognized ZIP prefixes were invisible across Active Jobs, Requests, Reports List, Report Detail, Bids, Claims, and the Shop Directory initial center.
- **What changed:**
  - **ShopActiveJobsScreen**: `jobPins` memo now prefers `report.latitude`/`report.longitude`; falls back to ZIP.
  - **ShopRequestsScreen**: `requestPins` memo — same fix.
  - **InsurerClaimsScreen**: `claimPins` memo — same fix.
  - **ReportsListScreen**: `reportMapPins` memo — same fix.
  - **ReportDetailScreen**: `reportCoords` memo — same fix.
  - **BidsScreen**: `reportCoords` memo — same fix.
  - **DashboardSecondaryViews**: `reportMapCenter` computation — same fix.
- **Files touched:** `ShopActiveJobsScreen.tsx`, `ShopRequestsScreen.tsx`, `InsurerClaimsScreen.tsx`, `ReportsListScreen.tsx`, `ReportDetailScreen.tsx`, `BidsScreen.tsx`, `DashboardSecondaryViews.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.10s. No diagnostics.
- **Problem taxonomy:** P2-DATA:7/7/0 — All remaining ZIP-only pin consumers fixed. Zero remaining after Passes 531+533 combined (10 total files fixed).
- **Architecture decisions:** Same lat/lng-first pattern as Pass 531. `StepServiceLocation` and `MapLibreReportLayer` correctly excluded (creation-time geocoding and already-correct respectfully).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Every report pin across all dashboard screens, detail views, and map consumers now uses authoritative geocoded coordinates. Complete consistency with the main Shop Directory map.

---

## Pass 532 — Shop Submitted Bids Summary on Dashboard Home (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME — Shops could submit bids on customer damage reports but had zero visibility into their submitted bids, statuses, or outcomes. The shop side of the core marketplace loop (bid → track → act) was blind after submission.
- **What changed:**
  - **DashboardRouter**: Now stores full `shopSubmittedBids` array (was only extracting report IDs). Passes bids to HomeScreen as `shopSubmittedBids` prop.
  - **ShopBidsSummary** (NEW): Compact card showing total bid count, status breakdown (Pending/Accepted/Rejected badges with counts), and 3 most recent bids with amount, estimated days, description, and status. Uses `bd-glass-card` with `bd-light-surface` for light mode.
  - **HomeScreen**: Added `shopSubmittedBids` prop. Renders `ShopBidsSummary` between reports list and map widget for shop users when bids exist.
- **Files touched:** `DashboardRouter.tsx`, `HomeScreen.tsx`, `ShopBidsSummary.tsx` (NEW), this tracker
- **Validation:** Build: 0 errors, 3.24s. No diagnostics.
- **Problem taxonomy:** P1-RUNTIME:1/1/0 — Shop bid visibility gap closed.
- **Architecture decisions:** Reused existing `getShopSubmittedBids` service (already called in DashboardRouter). Component placed in `src/app/components/shop/` following existing shop component conventions. Summary card pattern matches existing home screen section style. "View Jobs" CTA links to existing Active Jobs tab.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops can now see their bid activity directly on the dashboard home. Foundation for full ShopMyBidsScreen (dedicated bid management view with withdraw/re-bid actions). Closes the shop-side visibility gap in the bid loop.

---

## Pass 531 — Fix Dashboard Report Pin Coordinates (2026-04-02)

- **Why this pass was chosen:** P2-DATA — All three dashboard map widgets (CustomerMapWidget, ShopMapWidget, InsurerMapWidget) positioned report pins using only `zipToCoordinates()`. Reports with stored `latitude`/`longitude` (geocoded since Pass 523) but an unrecognized ZIP prefix were invisible on dashboard preview maps. This broke core-loop report visibility for any report outside the hardcoded ZIP prefix table.
- **What changed:**
  - **CustomerMapWidget**: `reportPins` memo now checks `r.latitude`/`r.longitude` first; only falls back to `zipToCoordinates()` when stored coords are null.
  - **ShopMapWidget**: Same coordinate-preference fix.
  - **InsurerMapWidget**: Same coordinate-preference fix.
- **Files touched:** `CustomerMapWidget.tsx`, `ShopMapWidget.tsx`, `InsurerMapWidget.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.11s. No diagnostics.
- **Problem taxonomy:** P2-DATA:1/1/0 — Stored geocoded coordinates ignored by dashboard widgets.
- **Architecture decisions:** Prefer authoritative stored coordinates over derived ZIP lookup. ZIP fallback preserved for legacy reports without geocoded data.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Dashboard preview maps now show all geocoded reports regardless of ZIP. Consistent pin positioning between dashboard widgets and the full Shop Directory map.

---

## Pass 530 — Report-Specific "View Bids" Navigation from Map (2026-04-02)

- **Why this pass was chosen:** P4-UX — When a customer clicked "View Bids" in the report detail drawer on the map, it navigated to the Bids tab without any report context. The Bids screen showed all bids across all reports with no indication which report triggered the navigation. This broke the contextual flow of report → map → drawer → "View Bids".
- **What changed:**
  - **ShopDirectoryScreen**: Changed `onViewBids` prop type from `() => void` to `(reportId?: string) => void`. Updated `onViewBidsForCustomer` to pass through the `reportId` argument.
  - **DashboardSecondaryViews**: Updated `onViewBids` callback to accept `reportId`. When present, calls `onSelectReport(reportId)` before switching to the bids tab, ensuring the report is selected in state.
- **Files touched:** `ShopDirectoryScreen.tsx`, `DashboardSecondaryViews.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.25s (2791 modules). No diagnostics.
- **Problem taxonomy:** P4-UX:1/1/0 — "View Bids" from map lost report context.
- **Architecture decisions:** Leveraged existing `onSelectReport` to set report context rather than adding a new prop to BidsScreen. The selected report ID is now available in state for future BidsScreen filtering/scrolling.
- **Doc updates:** This tracker entry.
- **What this unlocks:** "View Bids" from the map drawer now pre-selects the relevant report. Foundation for BidsScreen per-report filtering. Completes the map → drawer → bids contextual navigation chain.

---

## Pass 529 — Enrich + Compact Report Detail Drawer (2026-04-02)

- **Why this pass was chosen:** P4-UX — The report detail drawer opened from map pins used oversized text (`text-2xl` title, `text-lg` body) and showed minimal data (no vehicle year, no damage type/severity badges, only zip code for location). This didn't match the compact overlay design language established in Pass 528 and missed available data that helps users make decisions.
- **What changed:**
  - **ReportDetailDrawer**: Complete layout overhaul:
    - Title: `text-2xl` → `text-lg`, includes vehicle year
    - Subtitle: Shows `city, state · ZIP · damage area` instead of just `zip · damage area`
    - New badges row: damage type, severity (color-coded by level), status (color-coded), bid count — all in `text-[10px]` uppercase compact style
    - Description: `text-lg font-medium` → `text-sm leading-relaxed`
    - Photos: Added `shrink-0` to prevent thumbnail compression
    - Meta: Simplified to single `text-[11px]` "Submitted" line
    - Padding: `p-6` → `px-5 pt-5 pb-5`, buttons `py-3` → `py-2.5`, gaps `mt-2` → `mt-1.5`
    - Severity badges color-coded: severe/critical = red, moderate = amber, mild = slate
    - Status badges color-coded: approved/in-repair = green, resolved/completed = slate, pending = amber
- **Files touched:** `ReportDetailDrawer.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.10s (2791 modules). No diagnostics.
- **Problem taxonomy:** P4-UX:1/1/0 — drawer was oversized and data-sparse.
- **Architecture decisions:** Inlined severity/status color logic rather than extracting to utils since it's used only here. Drawer renders via Radix portal so container queries don't apply — used fixed compact sizes instead. All touch targets remain ≥44px.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Report drawer now shows complete report context (type, severity, location, status, bids) at a glance. Users can make informed decisions without opening the full report detail screen. Matches the compact glass overlay design language.

---

## Pass 528 — Map Overlay Container-Query Responsive Scaling (2026-04-02)

- **Why this pass was chosen:** P4-UX — Map overlays (header badges, shop card, legend, filter chips, CTA button) used viewport-based breakpoints (`sm:`, `md:`), so they appeared cramped when the map was rendered in a narrower container (e.g., the right column of the Shop Directory grid). Text and padding didn't scale down, making the map feel cluttered.
- **What changed:**
  - **MapLibreShopDirectoryMapPane**: Added `@container` class to the map wrapper div, making it a CSS container query context for all nested overlays.
  - **ShopDirectoryMapPaneOverlays — MapPaneHeaderBadges**: Replaced viewport breakpoints with container queries. Padding: `px-2.5 py-2 sm:px-4 sm:py-3` → `px-2 py-1.5 @xl:px-2.5 @xl:py-2 @3xl:px-4 @3xl:py-3`. Shop count: `text-base` → `text-sm @xl:text-base`.
  - **ShopDirectoryMapPaneOverlays — MapPaneBottomOverlay**: Full container-query rework:
    - Outer gradient: `px-3 pt-10 sm:px-5 sm:pt-16` → `px-2 pt-6 @lg:px-3 @lg:pt-8 @3xl:px-5 @3xl:pt-12` (less map area consumed)
    - Shop card: `sm:max-w-md p-2.5 sm:p-3` → `@xl:max-w-sm @3xl:max-w-md p-2 @lg:p-2.5 @3xl:p-3`
    - Shop name: `text-base sm:text-lg` → `text-sm @xl:text-base @3xl:text-lg`
    - AI Fit score box: `rounded-xl px-2 py-1.5` → `rounded-lg px-1.5 py-1 @xl:rounded-xl @xl:px-2 @xl:py-1.5`
    - AI Fit score: `text-base` → `text-sm @xl:text-base`
    - Route badges: `mt-2 gap-1.5` → `mt-1 @xl:mt-2 gap-1`
    - Distance/ETA row: `mt-2 text-sm gap-x-3` → `mt-1.5 text-xs @xl:text-sm @xl:gap-x-3`
    - AI summary: `hidden sm:block text-sm` → `hidden @3xl:block text-xs` (only in large containers)
    - CTA button: `mt-2 text-xs px-2.5 py-1.5` → `mt-1.5 @xl:mt-2 text-[11px] @xl:text-xs px-2 @xl:px-2.5`
    - Legend: `text-[10px] sm:text-[11px] px-2.5 sm:px-3 sm:py-2` → `text-[9px] @xl:text-[10px] @3xl:text-[11px] px-2 @xl:px-2.5 @3xl:px-3`
    - Inner flex gap: `gap-3` → `gap-2 @xl:gap-3`
- **Files touched:** `MapLibreShopDirectoryMapPane.tsx`, `ShopDirectoryMapPaneOverlays.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.12s (2791 modules). No diagnostics.
- **Problem taxonomy:** P4-UX:1/1/0 — overlays cramped in constrained map container.
- **Architecture decisions:** Used Tailwind v4 native `@container`/`@xl:`/`@3xl:` instead of custom CSS or JS resize observers. All overlays are descendants of the map wrapper div which is the container. Breakpoints chosen: `@lg` (512px) for minimal improvements, `@xl` (576px) for medium, `@3xl` (768px) for full desktop sizing.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Map overlays now automatically scale down in smaller containers (column layouts, embedded maps). The map feels less cluttered with more visible map area. Foundation for embedding compact maps elsewhere in the app.

---

## Pass 527 — Auto-Select Report Pin on Map FlyTo (2026-04-02)

- **Why this pass was chosen:** P4-UX — Pass 526 added "View on Map" navigation from report cards, but the map flew to the report location without auto-opening the report drawer. Users had to manually find and tap the correct pin — defeating the purpose of a one-tap report→map flow.
- **What changed:**
  - **DashboardSecondaryViews**: Passes `selectedReportId` as `focusReportId` to ShopDirectoryScreen when rendering the shop-directory view.
  - **ShopDirectoryScreen**: Added `focusReportId?: string` prop, passes it through to ShopDirectoryMapPane.
  - **MapLibreShopDirectoryMapPane**: Added `focusReportId?: string` prop, passes it to MapLibreReportLayer.
  - **MapLibreReportLayer**: Added `focusReportId?: string` prop. New `useEffect` watches for reports to load, then auto-selects the matching report and opens the detail drawer. Uses `focusHandled` flag to fire only once per mount.
- **Files touched:** `DashboardSecondaryViews.tsx`, `ShopDirectoryScreen.tsx`, `MapLibreShopDirectoryMapPane.tsx`, `MapLibreReportLayer.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.19s (2791 modules). No diagnostics on any touched file.
- **Problem taxonomy:** P4-UX:1/1/0 — map flyTo didn't auto-select the target report.
- **Architecture decisions:** `focusHandled` boolean state prevents re-triggering if reports refresh. The effect runs once when reports array populates and `focusReportId` is set. The prop chain is: DashboardSecondaryViews → ShopDirectoryScreen → MapPane → ReportLayer. Only fires on initial mount, not on subsequent navigations within the same map session.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Complete report→map loop: user taps MapPin on dashboard → map flies to location → report drawer auto-opens with vehicle info, photos, "Find Shops Nearby" and "Place Bid" actions. Also works from ReportDetail "View All Shops on Map" button. Foundation for deep-linking to specific reports via URL params.

## Pass 526 — Report-to-Map Navigation (2026-04-02)

- **Why this pass was chosen:** P4-UX — The core product loop (report → map → shop → action) was broken at the first transition: users saw reports on the dashboard home but had no way to jump directly to that report's location on the map. They had to manually navigate to the Shop Directory and scan around.
- **What changed:**
  - **HomeScreen**: Added `onViewReportOnMap` prop, passed down to `HomeReportsList`.
  - **HomeScreenSections**: Added `onViewReportOnMap` prop to `HomeReportsList`. Each report card now shows a MapPin icon button (44px touch target, stopPropagation to avoid conflicting with card click). Tapping it triggers the callback with the report ID.
  - **DashboardRouter**: Wired `onViewReportOnMap` callback — selects the report (`onSelectReport`) then navigates to `"shop-directory"`. This triggers the existing `reportMapCenter` computation in `DashboardSecondaryViews` which passes `initialMapCenter` to `ShopDirectoryScreen` → MapPane flies to report's geocoded location on mount.
- **Files touched:** `HomeScreen.tsx`, `HomeScreenSections.tsx`, `DashboardRouter.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.17s (2791 modules). No diagnostics on touched files.
- **Problem taxonomy:** P4-UX:1/1/0 — no report-to-map navigation path.
- **Architecture decisions:** Leveraged the existing `reportMapCenter` pipeline in DashboardSecondaryViews (no new map-side code needed). The MapPin button uses `e.stopPropagation()` to avoid triggering the card's `onOpenReport` click handler. Button is only rendered when `onViewReportOnMap` is provided (progressive enhancement).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Users now have a one-tap path from any report card to the map centered on that report. Strengthens report → map → shop discovery loop. Foundation for deeper report-map integration (e.g., report detail → "view nearby shops" → map with pre-filtered results).

## Pass 525 — Role-Based Default Report Filters + Empty State (2026-04-02)

- **Why this pass was chosen:** P4-UX — Pass 524 added status filter chips but defaulted to "All" for every role. Shops need to see biddable (pending) reports immediately, not wade through resolved/completed ones. Also, selecting a filter that hides all reports gave zero feedback.
- **What changed:**
  - **MapLibreShopDirectoryMapPane**: `reportStatusFilter` now defaults to `"pending"` for shop users, `"all"` for customers/insurers. `userType` prop is now passed down to `MapLibreReportLayer`.
  - **MapLibreReportLayer**: Added `userType` prop (type `MarketUserType`). Added filtered-empty state — when reports exist but the active filter hides all of them, a floating pill shows "No {status} reports on map" centered above the map.
  - **MarketUserType import**: Added to MapLibreReportLayer for type safety.
- **Files touched:** `MapLibreShopDirectoryMapPane.tsx`, `MapLibreReportLayer.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.10s (2791 modules). No diagnostics on touched files.
- **Problem taxonomy:** P4-UX:2/2/0 — role-unaware defaults + missing empty state feedback.
- **Architecture decisions:** Default filter is set at MapPane init time based on `userType` prop. Empty state only shows when total reports > 0 but filtered count = 0 (distinguishes "no data" from "filter too narrow"). `userType` flows: ShopDirectoryScreen → MapPane → ReportLayer.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Per-role map experience tuning. Shops land directly on actionable reports. Foundation for role-specific filter presets and saved filter memory.

## Pass 524 — Report Status Filter on Map (2026-04-02)

- **Why this pass was chosen:** P1-UX — All reports rendered on the map regardless of status. Shop users couldn't filter to only biddable (pending/approved) reports; customers couldn't isolate their in-repair reports. This made the map overwhelming and reduced shop discovery efficiency.
- **What changed:**
  - **MapPaneBottomOverlay**: Added `reportStatusFilter` and `onReportStatusFilterChange` props. Renders a row of compact status filter chips (All / Pending / Approved / In Repair / Resolved / Done) below the legend when reports are visible. Chips are color-coded to match map marker colors. Active chip gets visual highlight.
  - **MapLibreShopDirectoryMapPane**: Added `reportStatusFilter` state (defaults to "all"). Passes filter to `MapLibreReportLayer` via `statusFilter` prop. Passes filter + setter to `MapPaneBottomOverlay`.
  - **MapLibreReportLayer**: Added `statusFilter` prop. Added `filteredReportsWithCoordinates` memo that filters by status. GeoJSON features and report count notification now use filtered list. Click/popup lookups still use unfiltered list (so opened drawers work even after re-filtering).
- **Files touched:** `ShopDirectoryMapPaneOverlays.tsx`, `MapLibreShopDirectoryMapPane.tsx`, `MapLibreReportLayer.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.12s (2791 modules). No diagnostics on touched files.
- **Problem taxonomy:** P1-UX:1/1/0 — users couldn't filter map reports by status.
- **Architecture decisions:** Filter is client-side only (GeoJSON feature filtering before render). Cluster logic operates on filtered set. Defaults to "all" (backwards compatible). Unfiltered list retained for popup/drawer lookups so a user can still view a report detail even if filter changes after opening.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops can target newest biddable reports. Customers can visualize repair progress. Insurers can monitor claims by status. Foundation for saved filter preferences and role-based default filters.

## Pass 523 — Geocoded Coordinates on Damage Reports (2026-04-02)

- **Why this pass was chosen:** P2-DATA — Reports stored only zip code as location data. Geocoded coordinates (lat/lng) were computed in StepServiceLocation but never persisted. This blocked distance-based shop matching, service area filtering, and proper map-based report clustering.
- **What changed:**
  - **Types**: Added `latitude?: number | null` and `longitude?: number | null` to both `DamageReport` interfaces (app types + supabase types).
  - **DB Schema**: Added `latitude DOUBLE PRECISION` and `longitude DOUBLE PRECISION` columns to `damage_reports` table (both in-code schema and migration file). Added composite index on `(latitude, longitude)` for spatial queries.
  - **Edge function**: `buildReportPayload` now includes `latitude`/`longitude` with type guard.
  - **Client service**: `saveDamageReport` payload now includes `latitude`/`longitude`.
  - **Report form**: `useReportForm` stores `reportCoords` state. `handleSubmitReport` includes coords in submitted report object. `StepServiceLocation` now accepts `onCoordsChange` callback and propagates resolved coordinates (geocoded or ZIP-derived) up to parent.
  - **Payload builder**: `buildSupabaseReportPayload` in `userDataUtils.ts` now includes `latitude`/`longitude`.
  - **ReportScreen**: Passes `onCoordsChange={form.setReportCoords}` to `StepServiceLocation`.
- **Files touched:** `types/index.ts`, `supabase/types.ts`, `016_add_report_coordinates.sql` (new), `database_schema_sql_core.ts`, `handlers/reports.ts`, `services/supabase/reports.ts`, `useReportForm.ts`, `StepServiceLocation.tsx`, `ReportScreen.tsx`, `userDataUtils.ts`, this tracker
- **Validation:** Build: 0 errors, 3.09s (2791 modules). No diagnostics.
- **Problem taxonomy:** P2-DATA:1/1/0 — reports lacked geocoded coordinates.
- **Architecture decisions:** Coordinates are nullable (existing reports won't break). StepServiceLocation propagates coords via callback on every change (geocoded address preferred, ZIP fallback). Migration file + in-code schema both updated for consistency.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Distance-based shop matching, service area filtering, report density heatmap, map-based report clustering. Reports now carry true lat/lng through the entire persistence pipeline.

## Pass 522 — Shop Response Message Input (2026-04-02)

- **Why this pass was chosen:** P4-UX — When shops clicked "Respond" on estimate requests, the status changed to "responded" but no message was sent. Customers saw "Shop responded" in their detail sheet but with no actual response content. This made the entire estimate response flow feel broken/empty.
- **What changed:**
  - `ShopEstimateInboxScreen.tsx`: Added `responseMessages` state map for per-request message drafts. Added textarea above action buttons for typing responses. "Respond" button renamed to "Send Response". Message is passed through `handleAction` → `onUpdateStatus` callback. Message state clears after successful send.
  - `DashboardRouter.tsx`: Updated `onUpdateStatus` callback to pass `responseMessage` as 4th arg to `updateEstimateRequest()`. Optimistically updates `response_message` in local state.
- **Files touched:** `ShopEstimateInboxScreen.tsx`, `DashboardRouter.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.24s (2791 modules).
- **Problem taxonomy:** P4-UX:1/1/0 — shop responses had no message content.
- **Architecture decisions:** Per-request message state via `Record<string, string>` map. Messages cleared on successful send. Existing `updateEstimateRequest` already accepted `responseMessage` param — this just wired it up.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Full estimate conversation: shop types message → customer sees it in detail sheet → customer accepts/declines. Complete two-way estimate lifecycle.

## Pass 521 — Shop Estimate Inbox: Customer Acceptance Visibility (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME — Pass 520 completed the customer acceptance flow, but shops had no visibility into whether customers accepted their estimate responses. The `STATUS_LABELS` map and filter UI only covered pending/viewed/responded/declined. This broke the shop side of the estimate lifecycle loop.
- **What changed:**
  - `ShopEstimateInboxScreen.tsx`: Added "accepted" entry to `STATUS_LABELS` (emerald green styling). Added "accepted" to filter status type union and filter tabs. Updated "already actioned" indicator to show "✓ Customer accepted your estimate" with emerald color for accepted status.
- **Files touched:** `ShopEstimateInboxScreen.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.22s (2791 modules).
- **Problem taxonomy:** P1-RUNTIME:1/1/0 — shop couldn't see customer acceptance.
- **Architecture decisions:** Reuses existing STATUS_LABELS pattern. No new components needed.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Complete two-way estimate lifecycle visibility. Shops can now filter by "accepted" to see work they've won. Next: shop response message input (currently hardcoded), or report → map → shop loop improvements.

## Pass 520 — Customer Estimate Detail + Acceptance Flow (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME — The core product loop was broken at the customer acceptance step. Customers could see estimate request status cards on the dashboard but couldn't view shop response details or take action (accept/decline). This is the last gap in the estimate request → shop response → customer acceptance flow.
- **What changed:**
  - `estimateRequests.ts` (client service): Added `response_message?: string | null` to `EstimateRequest` interface. Added `customerRespondToEstimate()` function using PUT method for customer acceptance/decline.
  - `estimate_requests.ts` (edge function): Added `customerRespondToEstimate` handler — validates customer owns the request, ensures status is "responded" before allowing acceptance, updates status to "accepted" or "declined".
  - `server/index.ts`: Registered PUT route for `/estimate-requests` → `customerRespondToEstimate`.
  - `CustomerEstimateDetailSheet.tsx` (NEW): Bottom sheet showing estimate details — original request, shop response message, Accept/Decline buttons (for responded estimates), accepted confirmation state. Uses `bd-glass` dark theme styling.
  - `HomeScreen.tsx`: Estimate request cards are now interactive `<button>` elements with hover states. Added `onSelectEstimate` callback prop. Added "accepted" status display (blue) alongside existing pending/viewed/responded/declined.
  - `DashboardRouter.tsx`: Added `selectedEstimate` state, `handleCustomerEstimateResponse` handler, imported `CustomerEstimateDetailSheet`. Sheet renders as portal outside AnimatePresence. Passes `onSelectEstimate` to HomeScreen.
- **Files touched:** `estimateRequests.ts`, `estimate_requests.ts` (edge), `server/index.ts`, `CustomerEstimateDetailSheet.tsx` (new), `HomeScreen.tsx`, `DashboardRouter.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.03s (2791 modules). No diagnostics.
- **Problem taxonomy:** P1-RUNTIME:1/1/0 — customer couldn't accept/decline estimates. P4-UX:1/1/0 — estimate cards were not interactive.
- **Architecture decisions:** PUT method for customer actions (vs PATCH for shop actions) — clean separation of authorization paths. Detail sheet is a portal-based Radix bottom sheet, rendered outside AnimatePresence to avoid animation conflicts. Server validates customer ownership before allowing status change.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Complete estimate request lifecycle: customer submits → shop responds → customer accepts/declines. Dashboard estimate cards now show all statuses including "accepted". Next: notification/email on status change, shop dashboard showing accepted estimates.

## Pass 519 — Map Widget Enhancement + View Transition Fix (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME + P4-UX — (1) ShopDirectoryScreen was leaking below HomeScreen on dashboard because DashboardSecondaryViews rendered in a separate AnimatePresence scope, causing overlapping transitions. Both views were simultaneously visible. (2) CustomerMapWidget still carried 200+ lines of dead CoverageMapDialog code (state, hooks, imports, rendering). (3) Map widget lacked capability teasers to entice users toward the full Smart Map experience.
- **What changed:**
  - `CustomerMapWidget.tsx`: Complete rewrite. Removed CoverageMapDialog import/rendering and ALL supporting state (isMapExpanded, tileMode, mapRevision, selectedShopId, preferredNavigationProvider, navigationSession, navigationStartRequestId, voiceGuidanceEnabled, selectedShop, navigation hook, nearbyShops, 5 handler functions, 3 effects). Added capability teaser row (AI Matching, Directions, Compare). Map becomes clickable container with bottom gradient "Tap to explore" overlay. Primary CTA upgraded to gradient blue button with Sparkles icon. Reduced from ~400 lines to ~230 lines.
  - `DashboardRouter.tsx`: Moved DashboardSecondaryViews INTO the main AnimatePresence scope (wrapped in `motion.div key={secondary-${viewMode}}`). Added `viewMode !== "dashboard"` guard. This ensures `mode="wait"` applies across ALL view transitions — HomeScreen fully exits before ShopDirectoryScreen enters, and vice versa. Eliminates the dual-AnimatePresence overlap bug.
- **Files touched:** `CustomerMapWidget.tsx`, `DashboardRouter.tsx`, this tracker
- **Validation:** Build: 0 errors, 3.02s. HomeScreen chunk: 33.26 kB (stable). Verified: dashboard home → "Browse all shops" → clean transition to Shop Directory (no overlap). Back → clean HomeScreen only.
- **Problem taxonomy:** P1-RUNTIME:1/1/0 — secondary view leaking into home screen. P4-UX:1/1/0 — map widget lacked capability showcasing. P7-TECHDEBT:1/1/0 — dead CoverageMapDialog code removed.
- **Architecture decisions:** Single AnimatePresence scope for all view transitions in DashboardRouter. CoverageMapDialog completely removed from dashboard path (only used on landing page via CoverageBanner). CustomerMapWidget is now a lightweight preview + CTA component with no dialog dependencies.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Clean view transitions throughout dashboard. Lighter CustomerMapWidget (removed ~170 lines of dead code). Capability teasers entice users toward full Smart Map. DashboardSecondaryViews no longer leaks content.

## Pass 518 — Dashboard Layout Restructure + Documentation (2026-04-02)

- **Why this pass was chosen:** P4-UX — Dashboard home page had two map widgets (a sticky hero at the top AND a second widget below reports). User confirmed the map should only appear ONCE, below the reports list, as a compact preview. Additionally, clicking shop tiles/CTAs on the map widget opened the legacy `CoverageMapDialog` instead of navigating to Shop Directory. User explicitly requested layout documentation for future AI/human reference.
- **What changed:**
  - `HomeScreen.tsx`: Removed sticky hero map widget from top of dashboard. Moved `CustomerMapWidget`/`ShopMapWidget`/`InsurerMapWidget` to BOTTOM (after `HomeReportsList`). New layout order: Welcome bar → Onboarding card → Quick Actions → Estimate Requests → Reports List → Map Widget.
  - `CustomerMapWidget.tsx`: Changed `onShopClick` (map marker click) and shop tile `onClick` from `setIsMapExpanded(true)` (opens legacy CoverageMapDialog) to `onViewShops()` (navigates to Shop Directory page). All map widget interactions now route to `ShopDirectoryScreen`.
  - `CLAUDE_AI_MASTER_CONTEXT.md`: Added section "D. Dashboard Home Screen Layout (CANONICAL)" documenting correct layout order, navigation flow, and anti-patterns (no hero map, no CoverageMapDialog from dashboard).
- **Files touched:** `HomeScreen.tsx`, `CustomerMapWidget.tsx`, `CLAUDE_AI_MASTER_CONTEXT.md`, this tracker
- **Validation:** Build: 0 errors, 3.21s. HomeScreen chunk: 33.11 kB.
- **Problem taxonomy:** P4-UX:2/2/0 — duplicate map widget, broken maximize/expand interaction.
- **Architecture decisions:** Map widget is a compact preview CTA, not a hero element. All map widget clicks navigate to ShopDirectoryScreen via `onViewShops()`. CoverageMapDialog remains in CustomerMapWidget code but has no UI trigger from dashboard (only reachable from landing page coverage preview).
- **Doc updates:** `CLAUDE_AI_MASTER_CONTEXT.md` section D added. This tracker entry.
- **What this unlocks:** Clean single-map dashboard layout. All map interactions correctly route to Shop Directory. Documentation prevents future AI sessions from re-adding hero map or using CoverageMapDialog from dashboard.

## Pass 517 — Bid Auth Guard + Customer Estimate Visibility (2026-04-02)

- **Why this pass was chosen:** Two issues blocking the core marketplace loop: (1) P2-RUNTIME — bid submission had no auth guard, producing opaque "no response from server" error when userId is stale; (2) P3-UX — customers could submit estimate requests but had zero visibility into their status — `getMyEstimateRequests()` existed but was never called. Customers wait indefinitely with no feedback.
- **What changed:**
  - `useAppHandlers.ts`: Added `if (!userId) throw new Error("Please sign in to submit a bid.")` guard before `submitBidToSupabase` call — matches existing `handleReportSubmit` pattern.
  - `HomeScreen.tsx`: Added `estimateRequests` prop + "Estimate Requests" card section for customers. Shows up to 3 most recent requests with shop name, description, and live status (Pending/Viewed by shop/Shop responded/Declined) with color-coded status icons (Clock/CheckCircle2/XCircle). Dark/light mode support, glass design system.
  - `DashboardRouter.tsx`: Added `getMyEstimateRequests` import, `customerEstimateRequests` state + fetch effect keyed on `userType === "customer"` + `providerUserId`, passed to HomeScreen.
- **Files touched:** `useAppHandlers.ts`, `HomeScreen.tsx`, `DashboardRouter.tsx`
- **Validation:** Build: 0 errors, 3.11s. HomeScreen chunk: 33.31 kB (was 31.49 kB).
- **Problem taxonomy:** P2-RUNTIME:1/1/0 — bid auth guard. P3-UX:1/1/0 — customer estimate status invisible.
- **Architecture decisions:** Estimate request status cards render inside HomeScreen (dashboard home) rather than a new tab — avoids nav bloat for customers (4 tabs sufficient). Shows max 3 to keep dashboard compact. Full list can be added to ShopDirectory later.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Customers now see estimate request status on their dashboard. Shops respond → customers see "Shop responded". Complete estimate request loop: Customer → Request → Shop Respond/Decline → Customer Visibility. Next: response message display, full estimate request list view.

## Pass 516 — Estimate Inbox Respond/Decline Actions (2026-04-02)

- **Why this pass was chosen:** P1-RUNTIME — ShopEstimateInboxScreen (Pass 514) was read-only. Shops could see customer estimate requests but had zero actions — no respond, no decline. Customers waiting indefinitely with no feedback. Breaks the estimate request loop entirely.
- **What changed:**
  - `estimate_requests.ts` (edge function): Added `updateEstimateRequest` handler (PATCH) — validates status, verifies shop ownership via `shop_profiles.clerk_user_id` → `shop_profiles.id` → `estimate_requests.shop_id`, updates status + optional `response_message`, returns updated record.
  - `server/index.ts`: Wired PATCH `/estimate-requests` route to `updateEstimateRequest`.
  - `estimateRequests.ts` (client service): Added `updateEstimateRequest(requestId, status, clerkUserId, responseMessage?)` function.
  - `ShopEstimateInboxScreen.tsx`: Added `onUpdateStatus` callback prop, `updatingId` loading state, Respond (green) and Decline (neutral) action buttons in expanded card view. Buttons only show for pending/viewed requests. Already-actioned requests show status indicator text. 44px touch targets, dark/light mode support.
  - `DashboardRouter.tsx`: Wired `onUpdateStatus` callback — calls `updateEstimateRequest`, optimistically updates local state on success.
- **Files touched:** `estimate_requests.ts` (edge), `server/index.ts`, `estimateRequests.ts` (client), `ShopEstimateInboxScreen.tsx`, `DashboardRouter.tsx`
- **Validation:** Build: 0 errors, 3.20s. `ShopEstimateInboxScreen` chunk: 8.30 kB (2.84 kB gzip).
- **Problem taxonomy:** P1-RUNTIME:1/1/0 — dead-end inbox, no shop actions on estimate requests.
- **Architecture decisions:** Shop ownership verified server-side (`clerk_user_id` → `shop_profiles.id` → `estimate_requests.shop_id`) — prevents shops from updating requests belonging to other shops. Optimistic local state update on success to avoid full refetch.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops can now respond to or decline customer estimate requests. Closes the estimate request loop. Next: customer notification when shop responds, response message input UI.

## Pass 515 — Marketplace Refresh + Silent Failure Fixes (2026-04-02)

- **Why this pass was chosen:** After building the estimate inbox (Pass 514), audited the core marketplace loop and found 2 high-impact silent failures: (1) P1-RUNTIME — shops/insurers never see newly submitted reports until page refresh because `refetchMarketplace()` was not called after report submission; (2) P2-UX — estimate request showed success notification even when `submitEstimateRequest` returned null (edge function failure).
- **What changed:**
  - `DashboardRouter.tsx`: Wrapped `onReportSubmit` prop passed to `ReportScreen` — now calls `refetchMarketplace()` after the original callback completes, so shops/insurers see new reports immediately.
  - `ShopDirectoryScreen.tsx`: `handleSubmitEstimate` now returns early with `setEstimateError("Could not send request. Please try again.")` when `submitEstimateRequest` returns null, instead of proceeding to show a false success notification.
- **Files touched:** `DashboardRouter.tsx`, `ShopDirectoryScreen.tsx`
- **Validation:** Build: 0 errors, 3.07s. Diagnostics: 0.
- **Problem taxonomy:** P1-RUNTIME:1/1/0, P2-UX:1/1/0 — marketplace stale after submit, false success notification.
- **Architecture decisions:** Wrapped the `onReportSubmit` callback at the DashboardRouter level (where `refetchMarketplace` lives) rather than threading the refetch function through props — minimal surface area, no type changes needed.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops now see newly submitted reports immediately. Users get honest failure feedback on estimate requests. Core marketplace loop integrity improved.

## Pass 514 — Shop Estimate Request Inbox (2026-04-02)

- **Why this pass was chosen:** P0-DATA — Customers could submit estimate requests to shops via EstimateRequestSheet, but shops had zero visibility into incoming requests. The system was deceiving users: "Your request was sent to [shop]" when shops had no inbox to see them. Core marketplace loop broken.
- **What changed:**
  - `ShopEstimateInboxScreen.tsx` (NEW): Full estimate inbox screen with search, status filters (all/pending/viewed/responded/declined), expandable request cards showing customer name, description, timeline, time-ago, and contact info. Glass design system, dark/light mode, 44px touch targets.
  - `estimate_requests.ts` (edge function): Extended `getEstimateRequests` to accept `shopClerkUserId` param — looks up shop_profiles by `clerk_user_id` to resolve `shop_id`, then queries estimate_requests by that ID.
  - `estimateRequests.ts` (client service): Added `getShopEstimateRequests(shopClerkUserId)` function.
  - `constants/index.ts`: Added `Mail` icon import, added `{ id: "estimates", label: "Estimates", icon: Mail }` to `SHOP_NAV_TABS` (5 tabs now: Dashboard/Requests/Estimates/Active Jobs/Account).
  - `DashboardRouter.tsx`: Lazy import for `ShopEstimateInboxScreen`, estimate fetching effect keyed on `websiteIdentity.providerUserId`, rendering block for `estimates` tab, route match registered.
- **Files touched:** `ShopEstimateInboxScreen.tsx` (NEW), `estimate_requests.ts` (edge), `estimateRequests.ts` (client), `constants/index.ts`, `DashboardRouter.tsx`
- **Validation:** Build: 0 errors, 3.12s. New chunk: `ShopEstimateInboxScreen-DLrJ4JNu.js` — 6.84 kB (2.50 kB gzip). Properly code-split.
- **Problem taxonomy:** P0-DATA:1/1/0 — shops had no access to customer estimate requests.
- **Architecture decisions:** Used `shopClerkUserId` edge param (resolves via `shop_profiles.clerk_user_id` → `shop_profiles.id` → `estimate_requests.shop_id`) instead of passing raw shop_id from frontend — avoids exposing internal IDs in client queries. Kept screen read-only for MVP (no respond/decline actions yet).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Shops can now see incoming estimate requests. Closes the broken estimate request loop. Next: add respond/decline actions, push notifications for new estimates.

## Pass 513 — Reports Service Error Consistency (2026-04-02)

- **Why this pass was chosen:** Comprehensive map code audit (subagent) found 9 reported issues across hooks, services, and components. After manual verification, 2 were real: (1) `getDamageReports` returned `[]` instead of `{ error: "..." }` after retry exhaustion — callers show empty state instead of error; (2) `saveDamageReport` used unsafe `result.report as DamageReport` cast.
- **What changed:**
  - `reports.ts`: `getDamageReports` now returns `{ error: "Failed to fetch reports after 2 attempts" }` after retry exhaustion — consistent with the declared `DamageReport[] | { error: string }` return type. Callers (`useUserDataLoader`, `PerformanceOptimizer`) already handle both shapes via `Array.isArray()`.
  - `reports.ts`: `saveDamageReport` changed `result.report as DamageReport` → `result?.report ?? null` — safe navigation prevents crash on unexpected response shapes.
- **Files touched:** `reports.ts`
- **Validation:** Build: 0 errors, 3.19s. Diagnostics: 0.
- **Audit triage (7 dismissed):** bids.ts "null access" — not real (`requestSupabaseEdge` always returns object, `??` handles undefined props); route preview "stuck loading" — not real (subagent misread boolean logic: `!aborted || didTimeout()` correctly clears on timeout); useEffect missing deps — intentional one-time geolocation auto-center; updateReportStatus/updateClaimDecision "always true" — server errors throw and hit catch block; deleteBid same pattern.
- **Problem taxonomy:** P2-DATA:2/2/0 — inconsistent error return, unsafe type cast.
- **Architecture decisions:** Kept existing return type union `DamageReport[] | { error: string }` — both callers already handle it correctly. No new patterns introduced.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Users now see error messages instead of empty state when report fetching fails silently. Safer report saving pipeline.

## Pass 512 — Map Code Hardening (2026-04-02)

- **Why this pass was chosen:** Comprehensive map code audit found 8 issues across the map pipeline. 5 were real bugs: unsafe type cast in report click handler, silent bid count fetch failures, missing `Number.isFinite` in bid validation, null geo coordinates in bid enrichment, missing `damage_location` in required fields validation.
- **What changed:**
  - `MapLibreReportLayer.tsx`: Removed unsafe `as string` cast on `feature.properties?.id` — added null guard + `String()` coercion.
  - `MapLibreReportLayer.tsx`: Replaced empty `catch {}` in bid count fetch with DEV warning log.
  - `MapBidSheet.tsx`: Added `Number.isFinite(parsedAmount)` to `canSubmit` check.
  - `bids.ts` (edge function): Added `.filter()` to exclude null geo coordinates before building geoMap.
  - `reports.ts` (edge function): Added `'damage_location'` to `requiredFields` array.
- **Files touched:** `MapLibreReportLayer.tsx`, `MapBidSheet.tsx`, `supabase/functions/server/handlers/bids.ts`, `supabase/functions/server/handlers/reports.ts`
- **Validation:** Build: 0 errors, 3.16s. Diagnostics: 0.
- **Problem taxonomy:** P1-RUNTIME:2/2/0, P2-DATA:3/3/0 — unsafe cast, silent catch, missing validation, null geo, missing required field.
- **Architecture decisions:** Used `String()` coercion instead of template literal for reportId to preserve intent clarity. Added DEV-only logging for bid count failures (not user-facing).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Safer report pin clicks, better debugging for bid counts, stricter report creation validation, clean geo data in map pipeline.

## Pass 511 — Dark Mode Status Badge Consistency (2026-04-02)

- **Why this pass was chosen:** Report status badges ("Pending", "In Repair", etc.) used hardcoded light-mode colors (`bg-sky-100 text-sky-700`) in dark mode, creating jarring bright pills against the dark glass background.
- **What changed:**
  - `ReportsListScreen.tsx`: All 5 status badges now branch on `isLight` — dark mode uses `bg-{color}-500/15 text-{color}-300`.
  - `ReportDetailScreen.tsx`: Same fix for "pending" and fallback status badges. (Active/completed/resolved were already mode-aware.)
- **Files touched:** `ReportsListScreen.tsx`, `ReportDetailScreen.tsx`
- **Validation:** Build: 0 errors, 3.21s. Diagnostics: 0. Audited all other badge usages — ShopRequestCard, LikedShopsScreen, MapLibreReportLayer, BidsScreen, InsurerClaimsScreen all already mode-aware.
- **Problem taxonomy:** P4-UX:4/4/0 — hardcoded light-mode badges in dark mode (2 pending, 1 indigo-fallback in ReportDetail, 5 total in ReportsList).
- **Architecture decisions:** Used consistent pattern: `bg-{color}-500/15 text-{color}-300` for dark mode badges (matches existing convention in ShopRequestCard, LikedShopsScreen, etc.).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Visual consistency across all dark mode surfaces. All user-facing status badges now respect appearance mode.

## Pass 510 — Report Location "View All Shops" CTA (2026-04-02)

- **Why this pass was chosen:** The Report Detail screen's embedded map showed the report location and bidding shops, but had no affordance to find more shops. Users could only see shops that already bid — no path to discover new ones from the map context.
- **What changed:**
  - `ReportDetailScreen.tsx`: Added "View All Shops on Map" button below the Report Location map embed. Uses the existing `onFindShops` prop (already wired to navigate to Shop Directory). Button uses `primaryColor` with 10% opacity background, 44px min touch target, Search icon.
- **Files touched:** `ReportDetailScreen.tsx`
- **Validation:** Build: 0 errors, 3.22s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:1/1/0 — missing CTA on report location map.
- **Architecture decisions:** Reused existing `onFindShops` prop (already wired from `DashboardSecondaryViews` → `onViewModeChange("shop-directory")`). No new props or callbacks needed. Button conditionally renders only when `onFindShops` is provided.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Direct Report → Shop Directory navigation from the report location map. Closes the biggest gap in the Report → Map → Shop → Action loop for users with pending reports.

## Pass 509 — Safe Area Inset Fix on Bottom Sheets (2026-04-02)

- **Why this pass was chosen:** MapBidSheet and EstimateRequestSheet used a non-existent `safe-area-inset-bottom` CSS class — zero bottom padding on iPhone notch devices, hiding CTA buttons behind the home indicator.
- **What changed:**
  - `MapBidSheet.tsx`: Replaced dead `safe-area-inset-bottom` class with `pb-[max(2rem,env(safe-area-inset-bottom))]` — proper notch clearance with 2rem minimum.
  - `EstimateRequestSheet.tsx`: Same fix — dead class replaced with working `env()` padding.
- **Files touched:** `MapBidSheet.tsx`, `EstimateRequestSheet.tsx`
- **Validation:** Build: 0 errors, 3.20s. Diagnostics: 0. Audited all other sheets — ShopDetailSheet, NavigationSummarySheet, ImmersiveOriginPicker, MobileBottomNav already use correct `env()` syntax.
- **Problem taxonomy:** P4-UX:2/2/0 — dead CSS class caused zero safe-area padding on notched iPhones.
- **Architecture decisions:** Used `max(2rem, env(safe-area-inset-bottom))` pattern (consistent with ShopDetailSheet's `max(0.75rem, env(...))` pattern) to ensure minimum padding even on non-notched devices.
- **Doc updates:** This tracker entry.
- **What this unlocks:** "Place Bid" and "Request Estimate" buttons now reachable on all modern iPhones. Completes mobile-first compliance for all bottom sheet CTAs.

## Pass 508 — Bid Currency Formatting + Display Consistency (2026-04-02)

- **Why this pass was chosen:** Bid amounts displayed as raw numbers across the entire bid flow — no commas, no consistent `$` prefix. This creates a P4-UX trust problem: users see `$1500` instead of `$1,500`.
- **What changed:**
  - `MapBidSheet.tsx`: Bid input reformatted with live currency formatting (`sanitizeCurrencyInput` + `formatAmountDisplay`). Input changed from `type="number"` to `type="text" inputMode="decimal"` with "Bid: $X,XXX.XX" summary below.
  - `BidCardArticle.tsx`: `${bid.price}` → `${bid.price.toLocaleString()}`, `+${savings}` → `+${savings.toLocaleString()}` — all bid cards now show formatted prices.
  - `BidsScreen.tsx`: Stats cards "Lowest Bid" and "Average Quote" now formatted with `.toLocaleString()`. Notification text `bid for ${bid.price}` → `bid for $${bid.price.toLocaleString()}`.
- **Files touched:** `MapBidSheet.tsx`, `BidCardArticle.tsx`, `BidsScreen.tsx`
- **Validation:** Build: 0 errors, 3.34s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:6/6/0 — unformatted currency across bid input, bid cards, stats, and notification.
- **Architecture decisions:** Used `.toLocaleString()` for display (matches existing pattern in ReportDetailScreen). MapBidSheet uses custom sanitizer for input because `type="number"` doesn't allow live formatting. No new dependencies.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Consistent `$X,XXX` formatting across all bid surfaces. Builds financial trust. Strengthens the Shop → Action (bid) loop.

## Pass 507 — Report Pin Clarity + Photo Preview (2026-04-02)

- **Why this pass was chosen:** Report pins on the map lacked visual distinction from shops, and the popup showed text-only info without any photo preview — users couldn't understand their report without opening the full drawer.
- **What changed:**
  - `MapLibreReportLayer.tsx`: Report pin circles enlarged from radius 11→13 with thicker stroke (2.5→3). Popup now shows "Your Report" ownership label and a damage photo thumbnail (first image from `photo_urls`) above the vehicle info.
- **Files touched:** `MapLibreReportLayer.tsx`
- **Validation:** Build: 0 errors, 3.49s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:2/2/0 — report pins lacked visual weight; popup lacked photo context.
- **Architecture decisions:** Photo uses first item from `photo_urls` array (same data already loaded). No new API calls. "Your Report" label uses amber color matching the pin color for visual consistency.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Users can instantly identify their reports on the map and see damage photos without leaving the map context. Strengthens the Report → Find Shops flow.

## Pass 506 — Map UX Sweep: Origin Wrap + Info Panel Name (2026-04-02)

- **Why this pass was chosen:** Origin picker used hidden horizontal scrolling (violating mobile-first "no h-scroll" rule), and the minimized shop info panel truncated long shop names to unreadable text.
- **What changed:**
  - `ImmersiveOriginPicker.tsx`: Changed origin chips from `overflow-x-auto scrollbar-none` to `flex-wrap` — pills now wrap to next line on mobile instead of hiding behind invisible scroll.
  - `ShopDirectoryOriginSearch.tsx`: Same h-scroll fix for the list/hybrid mode origin picker.
  - `ShopDirectoryMapInfoPanel.tsx`: Minimized pill changed from `max-w-[200px] truncate` to `max-w-[220px] line-clamp-2 leading-snug` — two-line display shows full shop names.
- **Files touched:** `ImmersiveOriginPicker.tsx`, `ShopDirectoryOriginSearch.tsx`, `ShopDirectoryMapInfoPanel.tsx`
- **Validation:** Build: 0 errors, 3.48s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:3/3/0 — h-scroll violation (2 files) + name truncation.
- **Architecture decisions:** `flex-wrap` chosen over dropdown/vertical list because it preserves the quick-pick chip UX while eliminating hidden content. `line-clamp-2` on the info panel preserves the compact pill shape while showing enough name.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Mobile users see all origin options without scrolling. Desktop users read full shop names. Complies with "no horizontal scroll at any breakpoint" rule.

## Pass 505 — Estimate Requests Supabase Backend (2026-04-02)

- **Why this pass was chosen:** Pass 504's estimate request flow used a simulated 600ms delay with local-only confirmation. Persisting to Supabase completes the customer product loop end-to-end: Report → Find Shops → Request Estimate → stored in database.
- **What changed:**
  - `estimateRequests.ts` (NEW service): `submitEstimateRequest()` and `getMyEstimateRequests()` — mirrors bids.ts pattern using `requestSupabaseEdge`.
  - `runtime.ts`: Added `estimateRequests: "/estimate-requests"` to `SUPABASE_EDGE_ROUTES`.
  - `handlers/estimate_requests.ts` (NEW edge handler): `createEstimateRequest` + `getEstimateRequests` — auth via `requireAuthenticatedProfile` + `ensureClerkUserMatchesSession`, inserts into `estimate_requests` table.
  - `database_schema_sql_estimate_requests.ts` (NEW schema): `estimate_requests` table with UUID PK, clerk_customer_user_id, shop_id, description, timeline, status, RLS enabled, updated_at trigger.
  - `database_schema_sql.ts`: Registered estimate_requests schema in initialization array.
  - `index.ts`: Registered POST/GET `/estimate-requests` routes.
  - `ShopDirectoryScreen.tsx`: Replaced simulated delay with real `submitEstimateRequest()` call. Falls back to local confirmation if edge function returns null (dev environment).
- **Files touched:** `estimateRequests.ts` (new), `runtime.ts`, `estimate_requests.ts` (new handler), `database_schema_sql_estimate_requests.ts` (new), `database_schema_sql.ts`, `index.ts`, `ShopDirectoryScreen.tsx`
- **Validation:** Build: 0 errors, 3.19s (2788 modules). Diagnostics: 0.
- **Problem taxonomy:** P0-FEATURE:1/1/0 — estimate requests were simulated-only, now backed by real persistence layer.
- **Architecture decisions:** Follows exact same service → edge handler → schema pattern as bids. Local confirmation fallback preserved for dev where edge functions return 500. Timeline CHECK constraint enforces valid values at DB level. RLS enabled with service_role_all policy (will need user-scoped policies when auth is fully wired).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Full customer product loop persistence. Shop-side estimate inbox view. Estimate → bid conversion flow. Push notifications for new estimate requests.
- **Best next pass:** Shop-side estimate inbox (shops see incoming estimate requests), or map report layer P3-ARCH type safety cleanup.

## Pass 504 — Customer Estimate Request Sheet (2026-04-02)

- **Why this pass was chosen:** "Request Estimate" button on the shop directory showed a "Coming Soon" notification — the only dead-end in the customer-side product loop. Customers could find shops and see routes but couldn't initiate contact.
- **What changed:**
  - `EstimateRequestSheet.tsx` (NEW): Mobile-first bottom sheet with damage description textarea + timeline picker (ASAP / This week / Flexible). Follows MapBidSheet pattern — full dark/light theme, glass gradients, 44px+ touch targets, submit spinner, error display. Renders at `z-[60]` with backdrop blur.
  - `ShopDirectoryScreen.tsx`: Replaced "Coming Soon" `handleRequestEstimate` with handler that opens `EstimateRequestSheet`. Added `estimateShop`, `estimateSubmitting`, `estimateError` state. `handleSubmitEstimate` confirms locally with notification (Supabase persistence marked TODO). Sheet rendered in both immersive and list/hybrid modes.
- **Files touched:** `EstimateRequestSheet.tsx` (new), `ShopDirectoryScreen.tsx`
- **Validation:** Build: 0 errors, 3.22s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:1/1/0 — customer "Request Estimate" was a dead-end placeholder.
- **Architecture decisions:** Sheet is local-confirm only for now (600ms simulated delay + notification). Marked with TODO for Supabase edge function. Follows same state pattern as bid flow (`estimateShop`/`estimateSubmitting`/`estimateError` mirrors `bidReport`/`bidSubmitting`/`bidError`). Timeline picker uses segmented buttons rather than a dropdown for faster mobile input.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Customers can now request estimates from any shop on the map. Completes the customer-initiated side of the product loop: Report → Find Shops → Request Estimate. Backend persistence is the natural follow-up.
- **Best next pass:** Wire estimate requests to Supabase persistence (create `estimate_requests` table + edge function), or improve map report layer type safety (P3-ARCH cleanup).

## Pass 503 — Find Nearby Shops Location Context (2026-04-02)

- **Why this pass was chosen:** When tapping "Find Nearby Shops" on a report, the shop directory opened at the default NY center instead of the report's location. Users had to manually pan the map — breaking the Report → Map → Shop loop.
- **What changed:**
  - `ShopDirectoryScreen.tsx`: Added optional `initialMapCenter?: Coordinates` prop, passed through to `useShopDirectorySession`.
  - `useShopDirectorySession.ts`: Added `initialMapCenter` to session args. `mapCenter` state now initializes to `initialMapCenter ?? savedMemory.lastMapCenter`. `mapZoom` defaults to `12` when `initialMapCenter` is provided (neighborhood-level view).
  - `DashboardSecondaryViews.tsx`: Computes `reportMapCenter` from the selected report's zip code (via `zipToCoordinates`), falling back to the latest report. Passes `initialMapCenter={reportMapCenter}` to `ShopDirectoryScreen`.
- **Files touched:** `ShopDirectoryScreen.tsx`, `useShopDirectorySession.ts`, `DashboardSecondaryViews.tsx`
- **Validation:** Build: 0 errors, 3.11s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:1/1/0 — shop directory ignored report location context on "Find Nearby Shops" navigation.
- **Architecture decisions:** `initialMapCenter` takes priority over saved session memory (first-mount only — useState initializer). Zoom set to 12 for neighborhood context. `reportMapCenter` computed via `useMemo` to avoid re-computation on unrelated renders. `zipToCoordinates` already existed — no new utility needed.
- **Doc updates:** This tracker entry.
- **What this unlocks:** Report → Map → Shop loop now centers on the report's location. Users see nearby shops immediately without panning. Direct connection between damage location and shop proximity.
- **Best next pass:** "Request Estimate" action — replace "Coming Soon" placeholder with functional estimate request flow (P4-UX, product loop completion).

## Pass 502 — Immersive Map Tile Picker Dedup + Sync (2026-04-02)

- **Why this pass was chosen:** The immersive map rendered the MapPane's internal `MapTilePicker` at `top-16 left-2 z-[520]` behind the immersive top bar gradient (`z-[550]`), making it partially hidden and hard to discover. A separate SunMoon theme toggle in the top bar only cycled light/dark/auto (no satellite access), creating two disconnected tile controls on the same surface.
- **What changed:**
  - `MapLibreShopDirectoryMapPane.tsx`: Added `suppressTilePicker` and `externalTileMode` props. When `suppressTilePicker` is true, the internal `MapTilePicker` is hidden. When `externalTileMode` is provided, a new `useEffect` syncs the internal `tileMode` state to the external value, ensuring the actual map tiles follow the parent's tile selection.
  - `ShopDirectoryImmersiveMap.tsx`: Replaced the `SunMoon` theme toggle button with a tile-mode cycle button that rotates through roadmap → night → satellite → roadmap. The button icon updates to reflect the current mode (`MapIcon`, `MoonStar`, `Satellite`). New `activeTileMode` derivation provides the initial tile mode from theme context. Passes `suppressTilePicker` and `externalTileMode={tileModeOverride}` to MapPane, ensuring the cycle button controls both background/glows AND actual map tiles.
- **Files touched:** `MapLibreShopDirectoryMapPane.tsx`, `ShopDirectoryImmersiveMap.tsx`
- **Validation:** Build: 0 errors, 3.13s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:2/2/0 — (1) tile picker hidden behind immersive top bar gradient, (2) SunMoon toggle disconnected from tile mode (no satellite access, one-way sync).
- **Architecture decisions:** Single tile-cycle button replaces two disconnected controls. Same 44×44px footprint as the former SunMoon button — no layout change. The `externalTileMode` prop enables parent-driven tile mode without breaking MapPane's internal sync (both effects coexist and self-terminate via React's same-value setState optimization). `onToggleTheme` prop preserved in type but unused in immersive mode.
- **Doc updates:** This tracker entry.
- **What this unlocks:** All three tile modes (roadmap, night, satellite) accessible from the immersive top bar with a single discoverable button. Background glows/vignettes and actual map tiles now change together. No more hidden or conflicting tile controls.
- **Best next pass:** "Find Nearby Shops" location context — pass report coordinates when navigating from report detail to shop directory so the map centers on the report location instead of the default NY center (P4-UX).

## Pass 501 — Night Mode Defaults + Dashboard Preview Viewport Fix (2026-04-02)

- **Why this pass was chosen:** Landing page coverage map defaulted to light (roadmap) tiles on a dark navy background, creating visual dissonance. Dashboard map preview widget zoomed out to the entire eastern US because a report pin with a non-NY ZIP code pulled the auto-fit viewport south. Both issues degraded the map-first premium experience.
- **What changed:**
  - `useOperatingRegionsCoverage.ts`: Default tile mode changed from `"roadmap"` to `"night"`. Landing page coverage map now starts with dark CARTO tiles matching the dark page background. Users who previously saved a tile preference retain their choice (localStorage persistence).
  - `CustomerMapWidget.tsx`: Default tile mode changed from hardcoded `"roadmap"` to appearance-aware `isLight ? "roadmap" : "night"`. Expanded CoverageMapDialog now respects dashboard appearance mode.
  - `MapLibreDashboardMapPreview.tsx`: Viewport auto-fit now uses shop locations only (not report pins) for bounds computation. Report pins outside the coverage area no longer pull the viewport to irrelevant regions. When shops are unavailable, falls back to all points.
- **Files touched:** `useOperatingRegionsCoverage.ts`, `CustomerMapWidget.tsx`, `MapLibreDashboardMapPreview.tsx`
- **Validation:** Build: 0 errors, 3.07s. Diagnostics: 0. Spellcheck: 0.
- **Problem taxonomy:** P4-UX:3/3/0 — (1) landing page light map on dark page, (2) widget tile mode ignoring appearance, (3) preview viewport pulled by out-of-area report.
- **Architecture decisions:** Tile mode defaults are now surface-appropriate — landing page always dark, dashboard respects appearance mode toggle. Viewport fitting prioritizes shop locations (the service geography) over report pins (which may be anywhere the user lives).
- **Doc updates:** This tracker entry.
- **What this unlocks:** Unified dark premium map aesthetic across all surfaces. Dashboard widget correctly previews the NY coverage area regardless of report locations.
- **Best next pass:** Route fetch error feedback — when OSRM fails, show toast/visual indicator instead of silent failure (P3-ARCH).

## Pass 500 — Dashboard Map Aesthetic Alignment with Landing Page (2026-04-02)

- **Why this pass was chosen:** Dashboard full-screen map used plain slate/white overlay tokens while the landing page had premium blue-accented glass gradients, ambient radial overlays, and richer visual depth. User explicitly requested aligning their visual language.
- **What changed:**
  - `ShopDirectoryMapPaneOverlays.tsx`: Replaced all `useOverlayTokens` with blue-accented glass gradients matching `mapSurfaceTheme.ts` (badge cards, shop cards, legend, top/bottom gradients, CTAs, search pills). Dark mode now uses navy-blue linear gradients instead of flat slate-950. Light mode uses frosted slate-200 glass.
  - `ShopDirectoryMapPaneInlineUI.tsx`: Upgraded tile picker from plain text buttons to premium segmented control with Lucide icons (MapIcon, MoonStar, Satellite), rounded-full pill shape, and active state gradients matching the landing page. Empty state and loading skeleton now use blue-accented glass.
  - `MapLibreShopDirectoryMapPane.tsx`: Added immersive ambient vignette overlay (radial gradient from center to edges) matching the landing page's depth treatment. z-index 490, `pointer-events-none`.
  - `ShopDirectoryMapPopup.tsx`: Popup theme tokens upgraded to blue-accented glass (score card, CTA buttons match landing page primary/secondary button treatment).
  - `theme.css`: MapLibre popup CSS upgraded globally — light popups now have `rounded-[1.5rem]`, gradient background, `backdrop-blur(40px)`. Dark popups use navy-blue gradient `rgba(30,58,138,0.34)→rgba(15,23,42,0.82)` border-color `rgba(147,197,253,0.20)`. Both landing and dashboard popups now share identical dark glass treatment.
- **Files touched:** `ShopDirectoryMapPaneOverlays.tsx`, `ShopDirectoryMapPaneInlineUI.tsx`, `MapLibreShopDirectoryMapPane.tsx`, `ShopDirectoryMapPopup.tsx`, `theme.css`
- **Validation:** Build: 0 errors, 3.18s. Diagnostics: 0.
- **Problem taxonomy:** P4-UX:8/8/0 (visual inconsistency between landing and dashboard maps).
- **Architecture decisions:** Dashboard overlays now use the same blue-accented design language as `mapSurfaceTheme.ts` but via local tokens (not importing the full theme system) to avoid coupling. This keeps the dashboard map's immersive full-screen container while gaining the landing page's visual richness.
- **What this unlocks:** Both map surfaces now share a unified premium glass aesthetic. Future design work can reference either surface interchangeably.

---

## Active Risks

1. Provider telemetry can still appear healthy if upstream events become sparse without timely refresh.
2. Discovery quality depends on third-party OSM/Overpass metadata consistency.
3. Trust UI complexity can drift if new indicators bypass canonical summary contracts.
4. Startup hydration risk reduced: non-navigation localStorage paths now validate shape, handle quota/private-mode, and self-heal malformed data. Core navigation paths were already safe via `persistedState.ts`. Remaining risk: Supabase response types are untyped (`any`) in `useUserData.ts`.
5. Accumulating VS Code diagnostics/spell-check noise can hide real regressions and reduce map-code readability if cleanup does not stay aligned with canonical contracts.

## Vision Alignment & Future Guidance (Pass 17)

### Map Product Final Vision

- The BidOnDent map product is moving toward a **royal-blue-first, product-owned navigation world**.
- Blue system: royal blue for identity/action/route, baby/light blue for air/sky/calm, deep ocean blue for depth/premium, gray-blue/navy for night/dark mode.
- Map surfaces, overlays, and controls must use these blue tones intentionally for meaning, not just as decoration.
- The map should feel like a branded geographic world, not a generic tile with overlays.
- **Day/night guidance mode**: Automatic day/night visual switching based on local time/route context is a planned feature (not yet implemented). Day mode = lighter/sky/atmospheric; night mode = navy/gray-blue/low-glare.
- All map and design decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI.

### Tracker Alignment

- This tracker will log progress toward the above vision and ensure all map-related work aligns with the product-owned, blue-driven, day/night-aware direction.
- No feature will be marked as delivered until it is real in code.

---

## Next Priority Queue

1. Continue design-system correction and visual consistency — hover standardization delivered, glass classes deployed, dark navy delivered. Preserve and refine.
2. Continue provider telemetry depth and canonical risk classification with minimal UI churn.
3. Expand trust-signal evidence weighting using canonical normalized persisted summaries only.
4. Continue command-center interaction polish (micro-animations, state transitions, and focus management) while preserving search-first hierarchy.
5. Add targeted manual stale/future-skew payload injection checklist snippets for QA runbooks.
6. Continue navigation productization Level 2 (reliability): deviation detection, cross-browser voice testing.
7. Landing page unification complete (Pass 12). Next: Stage 3b form/table glass treatment.

## Staged Future Roadmap

This roadmap tracks the progression from current state toward aspirational features. Items move from "Planned" to "In Progress" to "Delivered" as work begins. See the Product Brain for full architectural detail on each item.

### Near-Term (next 2-3 passes)

| Item                                          | Status    | Depends On                            | Tracker Theme           |
| --------------------------------------------- | --------- | ------------------------------------- | ----------------------- | --- | ------------------------- | --------- | ------- | ----------------------- |
| Navigation reliability (graceful degradation) | Delivered | Nothing                               | Future Theme A, Level 2 |
| Design token extraction to global scope       | Delivered | Nothing                               | Theme 6 / Stage 1       |
| Customer nearest-shops compact widget         | Delivered | Partner shop data (already available) | Future Theme B          |
| DashboardCoveragePanel glass adoption         | Delivered | Design token extraction (done)        | Theme 6 / Stage 2       |
| Design system visual correction (Pass 0)      | Delivered | Nothing                               | Theme 5 / Pass 0        |
| Landing page glass unification                | Delivered | Pass 0 delivered                      | Theme 6 / Stage 3       |
| ShopDirectoryScreen extraction                | Delivered | Nothing                               | Architecture cleanup    |
| Deviation detection foundation                | Delivered | Nothing                               | Navigation Intelligence |
| Off-route prompt UI                           | Delivered | Deviation detection foundation        | Navigation Intelligence |
| Automatic reroute trigger groundwork          | Delivered | Off-route prompt UI                   | Navigation Intelligence |     | Cross-browser voice audit | Delivered | Nothing | Navigation Intelligence |

### Medium-Term (3-6 passes)

| Item                                                | Status    | Depends On                           | Tracker Theme           |
| --------------------------------------------------- | --------- | ------------------------------------ | ----------------------- |
| Navigation settings UI (voice picker, speed toggle) | Planned   | Level 2 reliability first            | Future Theme A, Level 3 |
| Cloud-synced navigation sessions                    | Delivered | `navigation_sessions` Supabase table | Future Theme A, Level 3 |
| Shop service area visualization                     | Planned   | `shop_service_areas` Supabase table  | Future Theme B          |
| Design token adoption in shell surfaces             | Delivered | Stage 1 token extraction             | Theme 6 / Stage 2       |
| Role-specific dashboard stat card glass treatment   | Delivered | Stage 2 shell adoption               | Theme 6 / Stage 3       |

### Long-Term (6+ passes)

| Item                              | Status  | Depends On                      | Tracker Theme           |
| --------------------------------- | ------- | ------------------------------- | ----------------------- |
| Automatic rerouting on deviation  | Planned | Reroute trigger groundwork      | Future Theme A, Level 3 |
| Marketplace-aware navigation      | Planned | Shop availability data          | Future Theme A, Level 4 |
| Insurer claims density heatmap    | Planned | Aggregated geo-coded claim data | Future Theme B          |
| Provider migration evaluation     | Planned | Usage data showing rate limits  | Future Theme C          |
| Full site-wide design unification | Planned | Stages 1-3 Design system        | Theme 6 / Stage 4       |

## Validation Checklist Per Map Pass

1. Build passes.
2. Touched map flows verified after reload.
3. Startup boot verified with stale, malformed, empty, and missing persisted diagnostics payloads.
4. VS Code diagnostics count reduced or justified for all touched files; no meaningful warnings hidden just to quiet the workspace.
5. Spelling/readability fixes reviewed so naming and wording remain consistent with canonical map/trust terminology.
6. Mobile and desktop checks completed for touched UI.
7. Trust-state regression spot-check completed (`healthy/watch/degraded` scenarios).

## Immediate Execution Direction

1. ~~Fix startup hydration/persisted-state resilience~~ — Delivered.
2. ~~Clean current workspace diagnostics~~ — Delivered.
3. ~~Begin navigation productization Level 2~~ — Delivered. GPS staleness detection, speed-limit unavailable state, NavigationErrorBoundary all shipped.
4. ~~Begin design token extraction Stage 1~~ — Delivered.
5. ~~Adopt design tokens in shell surfaces~~ — Delivered.
6. ~~Extract oversized files~~ — Delivered. routeEngine.ts phrase arrays extracted.
7. ~~Design system visual correction (Pass 0)~~ — Delivered. Navy dark mode, blue-tinted glass, unified hover, premium map controls, ad-hoc blur reviewed.
8. ~~Role-aware dashboard widgets~~ — Delivered. CustomerMapWidget, ShopMapWidget, InsurerMapWidget.
9. ~~Continue landing page glass unification (HeroSection animated carousel, remaining marketing surfaces)~~ — Delivered. All primary marketing sections adopt glass design system. Animated carousel is a follow-up enhancement.
10. ~~Continue navigation productization (deviation detection, cross-browser voice testing).~~ — Deviation detection foundation Delivered. New domain: `src/app/features/navigation/` with `deviationTypes.ts`, `detectDeviation.ts`, `useNavigationIntelligence.ts`. Route-change, off-route, stopped, and delay-increase events integrated into ShopDirectoryScreen. Cross-browser voice testing is next.
11. ~~Extract `ShopDirectoryScreen.tsx` (1383 lines) into composable sub-modules.~~ — Delivered. Screen reduced to 979 lines. Extracted: `ShopDirectoryResultCard`, `ShopDirectoryIntelligencePanel`, `ShopDirectoryRoutePanel`, `ShopDirectoryContextCards`.
12. ~~Off-route prompt UI.~~ — Delivered. `NavigationDeviationPrompt.tsx` in `components/maps/navigation/`. Calm, glass-styled floating banner reacts to `latestEvent` from `useNavigationIntelligence`. Integrated into ShopDirectoryScreen between intelligence header and map shell.
13. ~~Automatic reroute trigger groundwork.~~ — Delivered. New files in `features/navigation/`: `rerouteTypes.ts` (reroute lifecycle, request, state types + constants), `shouldTriggerReroute.ts` (pure decision helper with severity/cooldown/lifecycle checks), `useNavigationReroute.ts` (orchestration hook: idle → eligible → pending → completed → cooldown). Off-route prompt `onReviewRoute` now wired through reroute flow — selects alternate route on confirm with 60s cooldown against re-trigger.
14. ~~Cross-browser voice audit.~~ — Delivered. Created `voiceSupport.ts` with `VoiceSupportStatus` type (available/no-api/no-voices/gesture-blocked), `detectVoiceSupport()` snapshot, `primeVoiceEngine()` for Safari gesture gate. Hardened `voiceGuidance.ts`: `SpeakResult` return type (spoken/muted/no-api/no-text) replaces boolean, `onerror` handler on utterances tracks speech failures, cross-browser compatibility documented in code headers. Wired `primeVoiceEngine()` into `useCoverageNavigationExperience` — fires on voice mode activation from user gesture. Browser matrix documented: Chrome async voices, Safari gesture gate, Firefox limited voices, iOS screen-lock, Chrome 15s pause bug.
15. ~~Voice deviation alerts + reroute announcements.~~ — Delivered. Created `deviationVoicePhrases.ts`: phrase pools for off-route (medium + high severity), delay increase, reroute pending, reroute confirmed — all randomly sampled. Created `useNavigationVoiceAlerts.ts`: orchestration hook consuming `latestEvent` + `rerouteStatus` + voice settings. Deduplicates via announced-event-ID set and last-announced-reroute-status ref. Off-route/delay-increase filtered by severity (low = silent). Delay increase restricted to `full` mode; off-route fires on `alerts-only` and `full`. Reroute pending + cooldown (= just completed) each spoken once on transition. Single voice entry point: all speech dispatched through `speakNavigationInstruction`. Wired into `ShopDirectoryScreen` alongside intelligence + reroute hooks. Barrel exports extended. Build: 2395 modules, 1.64s, 0 errors. Diagnostics: 0. Spellcheck: 0.
16. ~~Typed navigation domain refinement.~~ — Delivered. `DeviationEvent` converted from flat interface with `Record<string, unknown>` metadata to a **discriminated union**: `RouteChangeEvent`, `OffRouteEvent`, `StoppedEvent`, `DelayIncreaseEvent`, `UnknownDeviationEvent` — each variant carries a typed metadata interface, consumers can narrow by `type` literal safely. Removed generic `buildEvent()` from `detectDeviation.ts` — each detector now returns its specific variant type directly. Added `NavigationVoiceSettings = Pick<NavigationGuidanceSettings, "voiceMode" | "voicePersona" | "voiceVolumePreset">` to `types/navigation.ts` as the canonical voice settings slice. Added `SpeakInstructionArgs = NavigationVoiceSettings & { text: string }` to `voiceGuidance.ts` — eliminates inline type duplication at call sites. Retired `VoiceAlertSettings` duplicate — `useNavigationVoiceAlerts` now accepts `NavigationVoiceSettings`. Barrel exports extended with all 5 variant types + `DeviationPosition`. Build: 2395 modules, 1.73s, 0 errors. Diagnostics: 0. Spellcheck: 0.
17. ~~Map UX realignment + Build Progress Dashboard.~~ — Delivered. Created `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` as a pass-era progress board for that historical phase (now archived). Map-first UX structural correction: created `ShopDirectoryMapOverlays.tsx` — floating in-map overlay layer (intelligence chip top-left, route preview card bottom-left, deviation prompt top-center) using glass-style `bg-slate-950/70 backdrop-blur-md` styling. Modified `ShopDirectoryMapPane.tsx` to accept `children?: React.ReactNode` for overlay injection. Refactored `ShopDirectoryScreen.tsx`: hero collapses to compact bar in map/hybrid modes; route panel, role intelligence panel, and context cards hidden from sidebar in map/hybrid modes (now surface on map overlay); `NavigationDeviationPrompt` moved to float on map surface in map/hybrid modes. Fullscreen map now map-first — sidebar contains only search + results. Build: 2396 modules, 1.62s, 0 errors. Diagnostics: 0. Spellcheck: 0.
18. ~~Map UX realignment Phase 2 — immersive viewport + map-owned search.~~ — Delivered. Created `ShopDirectoryImmersiveMap.tsx` (253 lines): full-viewport (`fixed inset-0 z-40`) immersive map experience. Map takes over entire viewport in map mode. Floating glass top bar with back button, map-owned search input (`rounded-full bg-slate-950/70 backdrop-blur-md`), results drawer toggle, mode switch (Split/List), and theme toggle. Collapsible left-side results drawer with `ShopDirectoryResultCard` list replaces fixed sidebar. `ShopDirectoryScreen` now early-returns the immersive component in map mode — list/hybrid paths unchanged. Added `suppressHeader` boolean prop to `ShopDirectoryMapPane` to hide built-in top gradient badges in immersive mode. Added `navigationMode` prop (`browse | route-preview | guidance`) to `ShopDirectoryMapOverlays` — intelligence chip and route card gated by mode; deviation prompt shows only in route-preview/guidance. `ShopDirectoryScreen` derives `navigationMode` from intelligence events and selected route. Build: 2397 modules, 1.67s, 0 errors. Diagnostics: 0. Spellcheck: 0.
19. ~~ShopDirectoryScreen extraction + navigation session lifecycle.~~ — Delivered. **Extraction**: `ShopDirectoryScreen.tsx` slimmed from 1163 → 478 lines via 3 extractions. Created `useShopDirectorySession.ts` (494 lines): all 18 state variables, effects, handlers, and computed values extracted to dedicated hook. Created `ShopDirectorySearchPanel.tsx` (276 lines): search form, origin selector, view/sort controls, role panel. Created `ShopDirectoryHero.tsx` (149 lines): two-mode hero (compact bar vs full card). Fixed potential TDZ bug: `selectedRoute` const used before declaration in navigation mode ternary. **Navigation session lifecycle**: Created `sessionTypes.ts` (96 lines): formal state machine `idle → planning → active ⇄ paused → ended` with `NavigationSession`, `NavigationSessionEvent`, `SessionWaypoint`, `SessionPauseEntry` types. Created `useNavigationSession.ts` (190 lines): reducer-driven hook with `startPlanning`, `selectRoute`, `activate`, `pause`, `resume`, `end`, `reset` actions; tracks active seconds minus pause time; `isNavigating` and `hasSession` derived booleans. Integrated into `ShopDirectoryScreen`: session auto-transitions `idle → planning` on shop+route selection, `planning → route-locked` on route select, ends on route clear. Build: 2401 modules, 1.63s, 0 errors. Diagnostics: 0. Spellcheck: 0.
