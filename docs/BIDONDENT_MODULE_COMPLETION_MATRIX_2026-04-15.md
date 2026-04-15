# BidOnDent Module Completion Matrix

**Created:** 2026-04-15 (Pass 868 — Phase 5.3)
**Last verified:** 2026-04-15 (Pass 873)
**Status:** Active — canonical module completion reference
**Build baseline:** 2.90s, 0 errors, 60 PWA precache entries
**Test baseline:** 554/554 pass (0 failures — 12 pre-existing failures fixed in Pass 872)

---

## Summary

| Glyph | Meaning           | Count |
| ----- | ----------------- | ----- |
| ✅    | Verified wired    | 17    |
| ➖    | N/A for this role | 2     |
| ⛔    | Deferred gap      | 2     |

**Total cells:** 21 (3 roles × 7 modules)

**Sub-gap note:** Insurer Notifications cell is classified ✅ because RT claim lifecycle notifications work end-to-end. A sub-gap exists: no INSERT hook fires when a new claim is submitted (only UPDATE lifecycle events are captured). This is bundled into the Insurer Role Promotion Epic below — it does not affect the cell-level ✅ classification.

---

## Module Completion Matrix (3 roles × 7 modules)

| Module          | Customer                                                                                                   | Shop                                                                                                         | Insurer                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Auth/onboarding | ✅ Clerk → `ClerkAccountTypeSelector` → `profiles` edge fn (`App.tsx:303`)                                 | ✅ + 4-step `ShopOnboarding` → `shop_profiles` (`App.tsx:310`)                                               | ✅ + 3-step `InsurerOnboarding` → `insurer_profiles` (`App.tsx:323`)                                            |
| Report creation | ✅ 6-step wizard (`ReportScreen.tsx`), photos → Storage, Nominatim geocoding, draft persist                | ➖ N/A                                                                                                       | ➖ N/A                                                                                                          |
| Bid flow        | ✅ `BidsScreen` view + accept → auto-reject others + job assign (`buildDashboardRouterPropsHelpers.ts:15`) | ✅ `MapBidSheet` → `submitBid()` → edge `createBid()` (`bids.ts:11`)                                         | ✅ `InsurerClaimsScreen` approve/deny → `updateClaimDecision` edge fn (`DashboardRouter.tsx:327`, Pass 774+794) |
| Job assignment  | ✅ Created on accept → `createJobAssignment()` (`workflow.ts:45`)                                          | ✅ `ShopActiveJobsScreen` + status updates via `updateJobAssignmentStatus()` (`workflow.ts:79`)              | ⛔ `insurer_user_id` column exists on `job_assignments`; no dedicated job-tracking UI                           |
| Notifications   | ✅ RT: `useCustomerBidNotifications` + `useCustomerEstimateResponseNotifications`; Email: code wired       | ✅ RT: `useShopNearbyReportNotifications` + `useShopBidStatusNotifications` + `useShopEstimateNotifications` | ✅ RT: `useInsurerClaimNotifications` (`useDashboardData.ts:56`) — claim lifecycle UPDATEs                      |
| Map/geo         | ✅ `CustomerMapWidget` + report pin + turn-by-turn nav (OSRM routing, voice, GPS)                          | ✅ `ShopMapWidget` + service areas + `MapLibreShopDirectoryMapPane` + immersive guidance                     | ✅ `InsurerMapWidget` (network overview) + shared shop directory infrastructure                                 |
| Profile/account | ✅ `EditProfileModal` (name/phone/photo) + vehicles + `DeleteAccountModal`                                 | ✅ + `ShopProfileModal` + `ServiceAreaEditorModal` (`AccountMenu.tsx:147`)                                   | ⛔ Personal edit works (`EditProfileModal`); no company profile edit modal                                      |

---

## Evidence Trail

### Static verification (code-trace)

| Cell                   | Evidence                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer Auth          | `ClerkAccountTypeSelector` renders at `App.tsx:303`; Clerk Provider wraps app                                                                   |
| Customer Report        | 6-step `ReportScreen.tsx` wizard; `useReportForm.ts` manages state; `StepServiceLocation.tsx` integrates Nominatim; photos → Supabase Storage   |
| Customer Bid           | `BidsScreen` lists bids; accept calls `acceptBid()` → auto-reject + `createJobAssignment()` (`buildDashboardRouterPropsHelpers.ts:15`)          |
| Customer Job           | `createJobAssignment()` at `workflow.ts:45`; customer sees job status in dashboard                                                              |
| Customer Notifications | `useCustomerBidNotifications` + `useCustomerEstimateResponseNotifications` subscribe via Supabase Realtime                                      |
| Customer Map           | `CustomerMapWidget` renders map + report pin; `routeEngine.ts` provides OSRM routing + voice + GPS                                              |
| Customer Profile       | `EditProfileModal` (name/phone/photo); vehicle CRUD; `DeleteAccountModal` wired in `AccountMenu.tsx`                                            |
| Shop Auth              | 4-step `ShopOnboarding` → `shop_profiles` via edge fn; wired at `App.tsx:310`                                                                   |
| Shop Report            | ➖ N/A — shops do not create reports                                                                                                            |
| Shop Bid               | `MapBidSheet` → `submitBid()` → `createBid()` edge handler (`bids.ts:11`); `notifyCustomerNewBid` fires on success                              |
| Shop Job               | `ShopActiveJobsScreen` displays jobs; `updateJobAssignmentStatus()` at `workflow.ts:79` handles status transitions                              |
| Shop Notifications     | 3 RT hooks: `useShopNearbyReportNotifications`, `useShopBidStatusNotifications`, `useShopEstimateNotifications`                                 |
| Shop Map               | `ShopMapWidget` + service area display + `MapLibreShopDirectoryMapPane` + immersive route guidance                                              |
| Shop Profile           | `ShopProfileModal` + `ServiceAreaEditorModal` wired from `AccountMenu.tsx:147`                                                                  |
| Insurer Auth           | 3-step `InsurerOnboarding` → `insurer_profiles` via edge fn; wired at `App.tsx:323`                                                             |
| Insurer Report         | ➖ N/A — insurers do not create reports                                                                                                         |
| Insurer Bid            | `InsurerClaimsScreen` approve/deny → `updateClaimDecision` edge fn; wired at `DashboardRouter.tsx:327` (Pass 774, fixed Pass 794)               |
| Insurer Job            | ⛔ `insurer_user_id` column exists on `job_assignments` table; no UI surface for tracking                                                       |
| Insurer Notifications  | ✅ `useInsurerClaimNotifications` subscribed at `useDashboardData.ts:56` for claim lifecycle UPDATEs; ⛔ sub-gap: no INSERT hook for new claims |
| Insurer Map            | `InsurerMapWidget` (network overview widget); shares `MapLibreShopDirectoryMapPane` infrastructure                                              |
| Insurer Profile        | ⛔ `EditProfileModal` works for personal fields; backend `saveInsurerBusinessProfile` exists in `networkProfiles.ts` but no UI modal            |

### Runtime verification log

| Timestamp  | Role     | Scenario                    | Result                                                                                                                            |
| ---------- | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-15 | Customer | Dashboard layout (demo OFF) | ✅ Full viewport, no double scrollbars, map widget visible. Header + sidebar + content fill viewport correctly.                   |
| 2026-04-15 | Shop     | Dashboard layout (demo ON)  | ✅ DemoModeBanner renders as amber `role="status"` bar: "Demo Mode — Viewing as Shop · Press Esc to dismiss". Content scrolls OK. |
| 2026-04-15 | All      | Waitlist RLS durability     | ✅ `WITH CHECK (true)` public INSERT confirmed in both `database_schema_sql_intake.ts` and `024_clerk_jwt_rls_policies.sql`.      |

> **Note:** Insurer runtime verification not backfilled. Code-trace is sufficient for deferred cells per Phase 5 scope rules.

---

## Email Delivery Status

**Provider:** Resend (`https://api.resend.com/emails`)
**Key access:** `Deno.env.get("RESEND_API_KEY")` — edge function environment only. Zero references in `src/**` (client bundle). **No P0 security concern.**

### Email flow wiring (3 dispatch functions, 3 templates)

| Flow                        | Dispatch function             | Template                    | Call site         | Status   |
| --------------------------- | ----------------------------- | --------------------------- | ----------------- | -------- |
| Customer: new bid received  | `notifyCustomerNewBid`        | `newBidReceived`            | `bids.ts:139`     | ✅ Wired |
| Customer: claim decision    | `notifyCustomerClaimDecision` | `claimDecisionNotification` | `workflow.ts:416` | ✅ Wired |
| Shop: bid accepted/rejected | `notifyShopBidStatus`         | `bidStatusNotification`     | `bids.ts:385`     | ✅ Wired |

**All 3 email flows are fully wired.** Two dead-code flows (`notifyShopNearbyReport` dispatch + `nearbyReportAlert` template, `newClaimSubmitted` template) were removed in Pass 869 — they had no call sites and their trigger logic (geographic matching, insurer new-claim pipeline) does not exist yet. They will be rebuilt from scratch when the Insurer Role Promotion Epic fires.

### Deployment status

- **`RESEND_API_KEY`:** Not deployed to Supabase edge function secrets.
- **Manual step required:**
  ```bash
  supabase secrets set RESEND_API_KEY=<key> --project-ref wmdcnjgtsppftrofaqqa
  ```
- **Runtime verification:** Deferred — requires deployed key + Resend dashboard confirmation. Cannot verify delivery from static trace alone.

### Email trigger mapping table (Phase 5.2 requirement — Pass 874)

| #   | Trigger Event                             | Handler + Line                                   | Dispatch Function             | Template                    | Expected Recipient                                                                 | Expected Timing                                                     | Preference Guard       | Observed Result         |
| --- | ----------------------------------------- | ------------------------------------------------ | ----------------------------- | --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------- | ----------------------- |
| 1   | Shop creates a bid on a customer's report | `bids.ts:139` (inside `createBid`)               | `notifyCustomerNewBid`        | `newBidReceived`            | Customer who owns the damage report (looked up via `damage_reports.clerk_user_id`) | Fire-and-forget, immediately after successful bid INSERT            | `email_bid_updates`    | `pending secret deploy` |
| 2   | Customer accepts or rejects a bid         | `bids.ts:385` (inside `updateBidStatus`)         | `notifyShopBidStatus`         | `bidStatusNotification`     | Shop that submitted the bid (via `bids.clerk_shop_user_id`)                        | Fire-and-forget, immediately after successful bid status UPDATE     | `email_bid_updates`    | `pending secret deploy` |
| 3   | Insurer approves or denies a claim        | `workflow.ts:416` (inside `updateClaimDecision`) | `notifyCustomerClaimDecision` | `claimDecisionNotification` | Customer who owns the damage report (looked up via `damage_reports.clerk_user_id`) | Fire-and-forget, immediately after successful claim decision UPDATE | `email_report_updates` | `pending secret deploy` |

**Dispatch pattern:** All three are fire-and-forget (`.catch(() => {})`) — email failure never blocks the API response. Each checks user notification preferences via `isEmailEnabled()` before sending. Each resolves recipient email from `profiles.email` via `getUserEmail()`.

**Idempotency note:** No deduplication guard exists at the email layer. If the same handler is called twice with the same inputs (e.g., retry logic upstream), two emails will send. This is acceptable for launch — the upstream handlers have their own idempotency guards (see Pass 876 audit).

**Missing flows (deferred):** See Insurer Role Promotion Epic below for `notifyShopNearbyReport` (geographic matching) and `newClaimSubmitted` (insurer pipeline). Both were removed as dead code in Pass 869 and will be rebuilt from scratch.

---

## Deferred Work

### Insurer Role Promotion Epic

All deferred insurer gaps are bundled under a single trigger rather than tracked individually:

**Trigger:** Post-launch signal that insurer adoption is a growth lever.

When this trigger fires, the following work items activate as a single epic:

1. **Insurer job-tracking UI** — `insurer_user_id` column already exists on `job_assignments`. Build a dedicated `InsurerJobsScreen` (or extend `InsurerClaimsScreen`) to display assigned jobs and their status transitions. Estimated scope: 1 component + 1 hook + DashboardRouter wiring.

2. **Insurer new-claim INSERT notification** — Wire a Supabase Realtime subscription (INSERT on claims/damage_reports where insurer is relevant) into `useInsurerClaimNotifications` or a new companion hook. Build a new `newClaimSubmitted` email template + dispatch function in `notificationEmails.ts` (previous dead-code versions removed in Pass 869). Estimated scope: 1 hook update + 1 dispatch function + 1 template + 1 handler call site.

3. **Insurer company profile edit modal** — Backend service `saveInsurerBusinessProfile` already exists in `networkProfiles.ts`. Build `InsurerProfileModal` (mirror `ShopProfileModal` pattern) and add insurer-specific menu items to `AccountMenu.tsx`. Estimated scope: 1 component + AccountMenu update.

4. **Shop nearby-report email notification** — Build geographic matching logic in `createReport` handler (query shops by service area overlap), create `notifyShopNearbyReport` dispatch function + `nearbyReportAlert` email template (previous dead-code versions removed in Pass 869). Estimated scope: geographic query + 1 dispatch function + 1 template + 1 call site.

**Rationale:** Insurer is the third role in BidOnDent's marketplace. The Customer → Shop core loop is the launch-critical path. Insurer functionality is functional enough for onboarding, claim review, and basic monitoring. Full operational tooling for insurers is deferred until adoption signals justify the investment.

---

## 2026-04-15 Addendum (Pass 873)

### Schema drift closure (Passes 871–872)

Pass 870 reported staging migrations as successful, but user verification revealed only `profiles` existed. Root cause: `supabase/migrations/` was never a complete schema source — six tables and multiple Clerk-identity columns were created only by `database_init.tsx` or ad-hoc dashboard pastes.

**Fix:** New migration `011b_canonical_catchup.sql` (idempotent) closes the drift gap. Migrations folder is now the single authoritative schema source (`docs/SUPABASE_SETUP_GUIDE.md` §9). `database_init.tsx` demoted to legacy cold-start safety net.

### Test baseline fix (Pass 872)

12 pre-existing test failures in `bids.test.ts` / `reports.test.ts` resolved. Root cause: service layer lacked try/catch — rejections bubbled up instead of matching the graceful-fallback contract tests asserted. All 6 `bids.ts` exports + 4 `reports.ts` methods wrapped. `saveDamageReport` intentionally left throwing (its test explicitly asserts "throws on network error"). Test count: **554/554** (was 542/554).

### Phase 5.1 code-side closure

Staging Supabase project `lhhdqycnhweaxqviwdqt` fully populated from migrations folder alone. All tables + routines verified present. Remaining Phase 5.1 items are user-side (Vercel preview env vars, edge function deploy). Phase 5.2 (RESEND) and 5.3 (this matrix) remain in progress.

### Cell tally re-verification

No cell status changes from Passes 871–872. Schema drift was infrastructure, not module-level. The 17 ✅ / 2 ➖ / 2 ⛔ tally remains accurate.

---

## Maintenance Notes

- This document is the canonical module completion reference, replacing the inline matrix in the Map Tracker (Pass 867).
- Update this document when any matrix cell status changes (new feature lands, gap is filled, or a new gap is discovered).
- Runtime verification rows should be added as real smoke tests are performed (e.g., after RESEND deployment, after staging environment setup).
- Cell count arithmetic: 17 ✅ + 2 ➖ + 2 ⛔ = 21 total cells. Last verified: Pass 873.
