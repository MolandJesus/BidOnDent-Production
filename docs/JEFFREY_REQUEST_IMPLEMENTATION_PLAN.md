# Jeffrey Request Implementation Plan (March 2026)

## Purpose
This document maps Jeffrey's original request list to:
- what is completed,
- what is partially completed,
- what remains,
- and the exact plan to finish in a production-safe way.

## Request Status Matrix

1. Radius map + ZIP code under Find Shops
- Status: complete (v1)
- Current state: interactive map now supports ZIP lookup, radius overlay, county markers, and nearest partner shop matching from public Supabase partner records.
- Completion target: enrich with advanced geospatial indexing and dynamic route-time estimation in v2.

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
- Status: complete (v1)
- Current state: required fields implemented and submissions persisted.
- Completion target: add validation hardening, admin notes, and email confirmation workflow.

9. Clarify what happens after report submission and bid events
- Status: mostly complete
- Current state: lifecycle UI, event logging, and insurer/shop operational flows are now aligned to live report-derived views.
- Completion target: finalize dispatch policy and notification reliability for fully automated handoff.

10. Database activity for submissions, acceptances, bids, cost
- Status: partially complete
- Current state: activity tables/events exist and key events are logged.
- Completion target: standardize event schema, add acceptance/cost rollups, and admin analytics views.

11. Shop account should show actual jobs
- Status: complete (v1)
- Current state: Shop Requests and Active Jobs render from report-driven data rather than static samples.
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
- Current state: this consolidated roadmap replaces ad-hoc planning files and is now the canonical tracker.
- Completion target: maintain this document as the single source of truth.

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
1. Build map module and geospatial query flow.
2. Add ZIP + radius controls and service-area filtering.
3. Integrate with "Find Shops" only when data and query performance are production-safe.

## Design and Code Standards For Remaining Work
1. Use shared components and existing design tokens to avoid style drift.
2. Keep business logic in services/hooks and keep UI components presentation-focused.
3. Add lightweight typing for all new data contracts before wiring UI.
4. Preserve commit discipline: one feature domain per commit.
5. Validate each phase with build + spell-check + targeted manual checks.

## Definition of Done for Jeffrey Scope
1. All original requests are marked complete in this file.
2. No placeholder links remain for About, Privacy, Contact, and Insurer Partnership.
3. Shop and insurer operational views are data-backed (not sample-only) in production paths.
4. Radius map and ZIP search are shipped with clear UX and stable query performance.
