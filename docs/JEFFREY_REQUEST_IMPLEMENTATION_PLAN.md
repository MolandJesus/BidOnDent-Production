# Jeffrey Request Implementation Plan (March 2026)

## Purpose

This document maps Jeffrey's original request list to:

- what is completed,
- what is partially completed,
- what remains,
- and the exact plan to finish in a production-safe way.

## March 20 Implementation Update

- Clerk-based report persistence is now repaired and live.
- Shop bid submission is now backed by a deployed edge route instead of local-only state.
- Remote Supabase schema now includes the missing intake/workflow tables and Clerk-compatible bid columns.
- Customer bid screens now render live bid data instead of hardcoded samples.
- The home coverage map is now refactored into reusable modules and upgraded with true recentering, satellite mode, and a fullscreen command-center view.
- The fullscreen command center now has a clearer browse/setup state and a separate in-app active-route state with guide cards, saved places, parked-car memory, and active-only speed badges.
- The fullscreen browse state now supports role-switched live nearby-place discovery so customer, insurer, and shop demos can show real public market places around the active area.
- Real nearby places can now be selected and previewed inside the fullscreen browse flow instead of only acting as external-launch links.
- Coverage search state now resumes locally after reload, including active ZIP/radius/map mode and preferred external directions app.
- Partner-shop cards now launch real external driving directions in Apple Maps, Google Maps, or Waze instead of pretending in-app turn-by-turn is already implemented.
- The last route handoff is now remembered locally so the fullscreen coverage workflow can resume context after reload.
- Public landing routes now render immediately while auth restores in the background, avoiding the blank loading screen seen during slow startup.
- Dashboard home no longer falls back to seeded shop/insurer home data, and the coverage system is now reachable from dashboard home as well.
- Notification ownership is now cleaner: the bell and profile dropdown share one background-refreshed activity feed and the old seeded placeholder alerts are being retired.
- Remaining work is now concentrated in secure realtime delivery, deployment/verification of the new admin intake and delete-account routes, and persisted onboarding state for non-customer roles.

## Request Status Matrix

1. Radius map + ZIP code under Find Shops

- Status: complete (v1.6 foundation)
- Current state: interactive map now supports ZIP lookup, radius overlay, county markers, nearest partner shop matching from public Supabase partner records, live-location centering, midnight/satellite modes, fullscreen command center, local resume state, and real external route launch.
- Completion target: enrich with advanced geospatial indexing, true provider-backed route geometry, and optional dashboard/admin reuse in v2.

2. About Us should link to a dedicated Opportunity/Why page

- Status: complete
- Current state: dedicated About page is live and linked from header/footer and About section.
- Completion target: keep page content aligned with future legal/brand approvals.

3. Pricing section decision (remove or clarify free for customers)

- Status: complete (landing + primary nav surfaces)
- Current state: landing/footer pricing callouts have been replaced with "Free for customers" positioning.
- Completion target: keep future copy aligned to free-customer messaging.

4. Find Shops remove for now

- Status: complete
- Current state: Find Shops language and primary customer action paths are now removed/reframed.
- Completion target: verify any deep legacy entry points are hidden until map/radius release.

5. Operating locations banner (NY counties like Rockland, Dutchess, Westchester)

- Status: complete (content pass)
- Current state: coverage section now includes Rockland, Dutchess, and Westchester with broader nearby counties.
- Completion target: confirm final county set with business ops before launch freeze.

6. Privacy Policy legal language from Adam

- Status: partially complete
- Current state: dedicated privacy policy page is now available with a legal placeholder marker.
- Completion target: replace placeholder with Adam-approved final legal language.

7. Contact should be bidondent@gmail.com

- Status: complete (landing touchpoints)
- Current state: landing/footer contact and mailto now use bidondent@gmail.com.
- Completion target: keep admin/support documentation references consistent.

8. Shop Signup Form fields and intake flow

- Status: complete (v1 backend verified)
- Current state: required fields are implemented and the production project now includes the missing intake tables required for persistence.
- Completion target: add validation hardening, admin notes, and email confirmation workflow.

9. Clarify what happens after report submission and bid events

- Status: materially improved
- Current state: customer reports, live bid counts, and report-linked bid views now flow through shared customer/shop/insurer data paths.
- Completion target: finalize secure realtime notification delivery and dispatch automation.

10. Database activity for submissions, acceptances, bids, cost

- Status: partially complete
- Current state: activity and intake tables now exist remotely and bid persistence is live.
- Completion target: standardize acceptance/cost rollups, admin analytics views, and secure admin mutation routes.

11. Shop account should show actual jobs

- Status: complete (v1.5)
- Current state: Shop Requests render from live report data, submitted bids persist through the backend, and the shop home dashboard no longer falls back to seeded report cards.
- Completion target: add final service-area eligibility filters and role-level assignment logic.

12. Insurer partnership should link to informational page + contact details

- Status: complete
- Current state: dedicated insurer partnership page is live and linked with approved contact details.
- Completion target: enrich with legal/commercial terms once available.

13. Remove "10K happy customers / 500 partner shops" banner claims

- Status: complete
- Current state: replaced with non-fabricated process-focused trust messaging.

14. Update all docs and remove obsolete planning docs

- Status: complete
- Current state: this roadmap is now supplemented by `PRODUCTION_READINESS_AUDIT_2026-03-20.md` for verified runtime/backend status and `BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md` for the fullscreen/navigation rebuild.
- Completion target: maintain this document as the Jeffrey-request tracker and treat the navigation master plan as the map-specific source of truth.

## Remaining Work Plan

### Phase 1: Policy and Content Alignment (fast, low risk)

1. Replace all contact references with bidondent@gmail.com.
2. Remove/hide all remaining Pricing and Find Shops links in active UI.
3. Update county list to approved operations list (include Rockland and Dutchess if confirmed).
4. Add dedicated Privacy Policy page (placeholder if legal text pending) with clear "pending legal final" marker.

### Phase 2: Dedicated Informational Pages (medium)

1. Add dedicated About/Opportunity page and route. (Complete)
2. Add dedicated Insurer Partnership information page and route. (Complete)
3. Keep visual language consistent with landing/dashboard design system (typography, spacing, component rhythm).

### Phase 3: Workflow and Jobs Data Completion (medium/high)

1. Replace sample job/request datasets with live Supabase-backed reads. (In progress: shop + insurer claims + insurer intake flows are now data-backed from reports)
2. Ensure shop users only see applicable jobs/requests (service area + status filters).
3. Finalize workflow event model for report -> bid -> acceptance -> schedule -> completion.

### Phase 4: Radius Map + ZIP Search (major)

1. Build map module and geospatial query flow. (Complete, v1)
2. Add ZIP + radius controls and service-area filtering. (Complete, v1)
3. Split immersive fullscreen map chrome from the embedded operational map so the premium layer can evolve without bloating the everyday coverage workflow. (Complete)
4. Finish the BidOnDent-first fullscreen rebuild:
   - real places lookup path
   - browse-mode nearby stores and guide cards
   - active navigation overlays
   - parked-car and saved places
   - insurer/customer/shop role-aware surfaces
5. Integrate provider-backed globe/navigation features only after an approved provider decision and cost review.

## Design and Code Standards For Remaining Work

1. Use shared components and existing design tokens to avoid style drift.
2. Keep business logic in services/hooks and keep UI components presentation-focused.
3. Add lightweight typing for all new data contracts before wiring UI.
4. Preserve commit discipline: one feature domain per commit.
5. Validate each phase with build + spell-check + targeted manual checks.
6. Keep incremental refactors moving so primary app files and backend helper modules stay under the 500-line ceiling.
7. Recent cleanup continued in the report flow, dashboard router, and user-data hook so future Jeffrey scope changes land in smaller, more isolated files.

## Definition of Done for Jeffrey Scope

1. All original requests are marked complete in this file.
2. No placeholder links remain for About, Privacy, Contact, and Insurer Partnership.
3. Shop and insurer operational views are data-backed (not sample-only) in production paths.
4. Radius map and ZIP search are shipped with clear UX and stable query performance.
