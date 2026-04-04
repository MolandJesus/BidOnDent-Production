# BidOnDent — Finishing Master Plan

**Last updated:** April 5, 2026 (Full re-anchor audit — verified build/test/arch truth, canonical long-horizon plan created)
**Created:** 2026-03-25
**Status:** Canonical long-horizon execution plan
**Current pass:** 836
**Build:** ✅ 0 errors · 3.3s · 2890+ modules
**Tests:** ✅ 555/555 (55 test files)
**Diagnostics:** ✅ 0 errors

Use alongside:

- `CLAUDE_AI_MASTER_CONTEXT.md` for product and architecture truth
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` for pass-by-pass execution reality
- `CODE_ORGANIZATION_AUDIT.md` for codebase structure and safe seams

---

## What This Doc Owns

- The canonical **phased execution plan** for making BidOnDent production-ready
- Phase definitions, pass estimates, dependencies, and exit criteria
- Confirmed gaps and their priority/effort classification
- Hard rules and stop conditions

## What This Doc Does Not Own

- Pass-by-pass execution log (that's the Tracker)
- Deep architecture reference (that's the Master Context + Code Org Audit)
- Setup instructions (that's GETTING_STARTED.md + SUPABASE_SETUP_GUIDE.md)

---

## Verified Current State (Pass 810, April 5, 2026)

This section was verified by a full re-anchor audit — not assumed from prior summaries.

### REAL (Genuinely Wired & Functional)

- **Core product loop:** Report → Supabase → map pin → shop sees report → bid → customer accepts → competing bids auto-rejected → job assignment created → map navigation
- **Map engine:** MapLibre GL JS 5.21.1 + react-map-gl 8.1.0, CARTO/Esri tiles, real shop + report markers
- **OSRM routing:** Real — `routeEngine.ts` calls public OSRM server, returns routes with geometry + steps + alternatives
- **Turn-by-turn voice navigation:** Real — Web Speech API, deviation detection, auto-reroute
- **Edge functions:** 12+ real handlers (reports, bids, estimates, workflow, profiles, storage, auth, admin)
- **Real-time notifications:** 8 Supabase Realtime hooks across all 3 user types (customer/shop/insurer)
- **Error surfacing:** All critical actions surface backend failures to users (no silent swallowing)
- **Data honesty:** All "Not provided" for missing data, seed data guarded, demo mode cleanly isolated
- **Photo upload:** Signed URL storage in Supabase, mounted guard for unmount safety
- **Estimate requests:** Full lifecycle (create → respond → accept/decline)
- **Vehicle management:** Real CRUD with confirmation + optimistic rollback
- **Security:** OWASP audit passed (zero XSS, zero injection, VIN sanitized)
- **Cloud sync:** useUserData → Supabase with localStorage as cache only
- **All files under 500-line hard cap** (largest: DashboardRouter 456, MapLibreShopDirectoryMapPane 447)

### PARTIAL (Wired But Incomplete)

- **Shop discovery:** Radius search works via haversine, but no PostGIS, no service area polygons
- **Shop service areas:** Backend CRUD + client service + ShopMapWidget wired to real data + circle overlay visualization on dashboard map. Missing: service area editor UI, full shop directory map integration
- **Insurance claims:** Tables + handlers exist, approve/deny wired, Details button now navigates to report detail (Pass 819). Claims management UI ~80% complete.
- **Navigation:** In-app OSRM routing is real; external Apple/Google/Waze export exists as backup
- **Notifications:** In-app real-time notification is complete; no email, no native push

### PLACEHOLDER (Type/UI Exists, No Implementation)

- ~~**Shop/Insurer map widgets:** Insurer widget still structure-only placeholder stats~~ ✅ DONE (Pass 849 audit): InsurerMapWidget is wired to real data — `reports` prop receives live `shopInsurerReports` from Supabase, `partnerShops` from `useCoveragePartnerShops → getPublicPartnerShops()`. Pending/photo-backed counts, shop count, avg rating all derived from real data.

### MISSING (Not Yet Built)

- Payment processing (no Stripe, no payment handler, no revenue model — planning doc created Pass 828)
- Advanced analytics/reporting dashboard

---

## Hard Rules

1. **No silent scope expansion.** If a problem is discovered during a pass but is outside scope, log it — don't absorb it.
2. **No fake capability.** Product trust depends on honest behavior, copy, and data boundaries.
3. **No broad rewrites.** Prefer scoped slices, extraction, and verification.
4. **One pass = one coherent change.** No mixing unrelated work.
5. **No doc drift.** If execution truth changes, update active docs in the same pass.
6. **No bypassing architecture law.** Services, hooks, components, and backend boundaries stay intact.
7. **No `git add -A`.** Stage only the files you intentionally changed.
8. **Validate every pass.** Build + diagnostics + mobile reasoning minimum.

---

## Phased Execution Plan

### Phase 1: Map Program Completion (Passes 811–825) ✅ COMPLETE

**Goal:** Make the map feel production-ready with realistic data density.

**Note:** Marker clustering for both shops and reports was discovered to be already fully implemented (MapLibre built-in clustering with click-to-zoom). This was incorrectly listed as "not built" in prior docs.

**Completion summary (Pass 819):** All exit criteria met. Service areas wired (811-813), report pins verified (814), tel/mailto fixed (816), claims Details→report navigation wired (819). No P4-UX issues remain in core flow.

| Pass Range | Feature                        | What Changes                                                                                                            | Effort       |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| 811–813    | Shop service area foundation   | Create `shop_service_areas` Supabase migration + edge function CRUD, wire ShopMapWidget to display real areas           | Medium       |
| 814–815    | Report status on map           | Verify report pins use status-color map (already present — audit and polish if needed), add bid count to report markers | Small        |
| 816–818    | Map UX polish                  | Fix tel/mailto disabled links (P4), review map empty states, cluster zoom-on-click behavior polish                      | Small        |
| 819–821    | Insurance claims UI completion | Complete claims management dashboard, claim-to-report detail view                                                       | Medium       |
| 822–825    | Buffer / overflow              | Remaining P4 UX issues, map interaction edge cases                                                                      | Small-Medium |

**Dependencies:** None — all work is on existing foundation.

**Exit Criteria:**

- Clustering works with 50+ markers at multiple zoom levels
- Shop service areas can be created via edge function and visualized on map
- Map pins show report status + bid counts
- Zero P4-UX issues in core customer → map → shop flow
- Build + test + diagnostics clean

---

### Phase 2: Geographic Intelligence + Shop Enrollment (Passes 826–845) ✅ COMPLETE

**Goal:** Enable organic shop growth and geographic matching.

**Completion summary (Pass 823):** All core exit criteria met. PostGIS enabled with spatial indexes (820), geographic matching edge functions (821), real-time nearby report notifications (822), service area editor UI (823). Shop self-registration (intake + wizard + admin queue) was already built. Client-side haversine retained for display distances — PostGIS is source of truth for matching.

| Pass Range | Feature                                 | What Changes                                                                                             | Effort |
| ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------ |
| 826–828    | PostGIS setup                           | Enable PostGIS extension, add geometry columns to shops/reports, migrate existing lat/lng data           | Medium |
| 829–831    | Geographic matching                     | Replace haversine with ST_DWithin queries, report-to-shop matching by service area                       | Medium |
| 832–834    | Shop notification on new nearby reports | Trigger notification (Realtime + future email) when report appears in shop's service area                | Medium |
| 835–839    | Shop self-onboarding                    | Public signup page, profile wizard, service area definition (radius + polygon), admin verification queue | Large  |
| 840–845    | Buffer / overflow                       | Edge cases, onboarding polish, geographic query optimization                                             | Medium |

**Dependencies:** Phase 1 (shop service areas must exist before geographic matching).

**Exit Criteria:**

- Shops can self-register with service area
- Reports auto-match to nearby shops via PostGIS
- Shops notified in real-time when new report appears in their area
- PostGIS queries replace all haversine distance calculations
- Admin can verify/approve new shop registrations

---

### Phase 3: Notifications + Insurance Completion (Passes 824–827) ✅ COMPLETE

**Goal:** Complete the notification system and insurance workflows end-to-end.

**Completion summary (Pass 827):** All exit criteria met. Notification preferences UI wired with optimistic updates (824). Email notification infrastructure built with Resend — branded templates for all 3 user types, preference-aware dispatch, fire-and-forget triggers on bid creation, bid status change, and claim decisions (825). Claims shop assignment plumbed end-to-end: schema field, backend, client service, callback (826). Claims screen now uses real shop directory data instead of demo hardcoded list (827). Requires `RESEND_API_KEY` secret in Supabase edge function env for email delivery.

| Pass | Feature                  | What Changed                                                                                   |
| ---- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| 824  | Notification preferences | Settings modal wired to live toggles (in-app/email/SMS), edge route + client service + hook    |
| 825  | Email notifications      | Resend email utility, 6 branded templates, preference-aware dispatcher, 3 trigger points wired |
| 826  | Claims shop assignment   | Migration 020, backend + client plumbing for shop assignment on claims, job_assignments record |
| 827  | Claims real shop list    | InsurerNewClaimScreen uses useNetworkDirectory for real shops, fallback to demo if empty       |

**Exit Criteria:**

- ✅ Users receive email for critical marketplace events (infrastructure built, 3 trigger points wired)
- ✅ Insurance claims flow is end-to-end functional (create → assign shop → track → resolve)
- ✅ Notification preferences configurable per user (in-app, email, SMS toggles)
- ✅ All 3 user types have complete notification coverage (in-app real-time + email)

---

### Phase 4: Revenue + Scale (Passes 828+)

**Goal:** Production revenue model and scale infrastructure.

| Pass Range | Feature                  | What Changes                                                             | Effort   |
| ---------- | ------------------------ | ------------------------------------------------------------------------ | -------- |
| 828        | Payment model design     | Planning pass — define pricing model (per-bid, subscription, commission) | Planning |
| 829–833    | Stripe integration       | Payment service, checkout flow, billing management                       | Large    |
| 834–837    | Push notifications (PWA) | Service worker registration, FCM setup, native push                      | Large    |
| 838–842    | Performance + scale      | Bundle optimization, query caching, CDN strategy                         | Medium   |
| 843–847    | Production hardening     | Rate limiting, monitoring, error alerting, analytics                     | Medium   |

**Dependencies:** Phases 1–3 complete (product must be functionally complete before monetization).

**Exit Criteria:**

- Revenue model operational
- Users receive native push notifications
- Application handles 1000+ concurrent users
- Monitoring and alerting in place

---

## Priority Order for Pass Selection

When choosing what to do next within a phase:

1. Fix real breakage or trust failures first.
2. Fix blockers in the core product loop next.
3. Strengthen the map experience (it IS the product).
4. Tighten architecture only when it directly reduces delivery risk.
5. Polish only after behavior, trust, and verification are solid.

## Validation Gate

Every pass must answer YES to at least one:

1. Does this make the product more correct or more trustworthy?
2. Does this reduce friction in the real user flow?
3. Does this reinforce the map-first product identity?
4. Does this move the system closer to production readiness?

## Stop Conditions

Pause and realign if:

- Build breaks after 2 fix attempts on the same error
- A pass would delete more than 3 files
- A change touches auth, payment, or identity systems without explicit approval
- Required product behavior is unclear
- Docs are contradictory enough to block safe action

## North Star

The product should feel like a **live map system**, not a disconnected website with map widgets attached.

Every pass should make BidOnDent feel more spatial, more trustworthy, and more operationally coherent.
