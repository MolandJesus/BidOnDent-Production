# BidOnDent Shop Account Audit — 2026-04-29

**Auditor**: GitHub Copilot (Mola's Coder mode)  
**Test account**: `molalign1504s@gmail.com` / display: "TestShop"  
**Environment**: `http://localhost:5173/` (Vite dev server, Supabase production edge functions)  
**Auth**: Clerk JWT (production environment, localhost origin)  
**Method**: Playwright browser automation + accessibility snapshot inspection + network request capture  
**Date**: 2026-04-29

---

## Executive Summary

1. **Bid submission works end-to-end.** The Requests tab → bid modal → submit flow fires correctly, writes to Supabase, updates the card in real-time, triggers the notification bell badge, and persists across page reload. This is the most important shop-side action and it works.

2. **Profile and settings persistence is largely broken.** Shop Profile returns a 403 auth error on save. Service Area returns 500. Notification preferences silently lose all changes on reload. The appearance theme (localStorage) is the only preference that actually persists.

3. **Active job status transitions are inaccessible** in Playwright due to a modal scroll overflow issue — the Update Status buttons (Awaiting Parts / Mark Completed) are pushed below the 90vh fold and Playwright cannot interact with them. Real browser may work; this needs hands-on verification.

4. **Estimates is a structural dead end.** The tab has a fully built inbox UI (search + 6 filter pills) but zero real data and no discoverable path for a customer to trigger an estimate request from the shop side.

5. **Notifications are session-only.** The bell badge fires correctly on bid submission but is cleared on every page reload. No notification records survive in either localStorage or Supabase.

---

## Phase 1 — Visual and Flow Findings

### Dashboard

| Mode  | Status               | Issues                                                       |
| ----- | -------------------- | ------------------------------------------------------------ |
| Dark  | ✅ Renders correctly | Welcome banner, Quick Actions, Incoming Requests all visible |
| Light | ✅ Renders correctly | Same layout, clean white/blue palette                        |

- **Quick Actions** (3 tiles: Open Requests, Active Jobs, Shop Directory) — all present and clickable.
- **Incoming Requests** section (REPAIR ACTIVITY): Shows 4 real request cards with correct vehicle names, dates, bid counts.
- **My Submitted Bids** widget: Shows 3 bids (1 Pending, 2 Accepted, 0 Rejected) — real data, persisted.
- **Your Service Area map**: Renders OpenStreetMap tile, White Plains NY area. Two real location pins visible. "View Map" CTA present.
- **SNAPSHOT section**: SERVICE AREAS: "Not set", PARTNERS: 6, "4 live requests in your queue, Newest intake: rear".
- **Visual note**: Dashboard is information-dense in a positive way. Cards, maps, and bid widgets coexist cleanly. No layout overflow observed.

### Requests

| Mode  | Status               | Issues                                                              |
| ----- | -------------------- | ------------------------------------------------------------------- |
| Dark  | ✅ Renders correctly | All request cards, filter pills, search bar, map widget all visible |
| Light | ✅ Renders correctly | Same                                                                |

- Filter pills: All, Bidding, Accepted, Completed, Declined — all render.
- Search bar functional (visual only; not tested for query results).
- Request cards show vehicle photo, owner name, vehicle year/make/model, location, damage area, priority badge, bid count.
- Bid modal (ShopBidModal): Opens cleanly in dark mode. Contains amount input, turnaround days input, description textarea. All fields functional.
- **P1 bug (filter)**: After bid submission, the "Bidding" filter shows "No requests found" even though the bid is shown in "All Requests" view. The submitted bid card is not recognized as "Bidding" by the filter.

### Estimates

| Mode  | Status                 | Issues                                         |
| ----- | ---------------------- | ---------------------------------------------- |
| Dark  | ✅ Empty state renders | Dead-end: no CTA, no path to receive estimates |
| Light | ✅ Empty state renders | Same                                           |

- Full inbox UI (search + 6 status filters: All/Pending/Viewed/Responded/Declined/Accepted) is built but always shows empty for real data.
- No entry point is visible on the shop side for directing customers to send estimate requests.
- Empty state message: "No estimate requests yet / When customers request estimates from your shop, they'll appear here."
- **P1**: No path for the shop to see how or where customers can send an estimate. Feels like a stub screen.

### Active Jobs

| Mode  | Status              | Issues                                                         |
| ----- | ------------------- | -------------------------------------------------------------- |
| Dark  | ✅ Job cards render | Demo mode modal X button non-functional (page reload required) |
| Light | ✅ Job cards render | Error toast visible (500 error from edge function)             |

- Job cards show: job number, customer name, vehicle, status badge (Pending/In Progress), progress bar, bid amount.
- Map widget renders with 5 job pins in demo mode (White Plains cluster); 3 pins in real mode (nationwide spread — CA, NE, SE).
- **ShopActiveJobDetailModal**: Opens correctly. Shows Customer Info (including PII: email + phone), Job Details, Job Lifecycle (5 steps), Update Status buttons.
- **P0/P1 overflow bug**: Update Status buttons (Awaiting Parts, Mark Completed) are below the 90vh fold due to Job Lifecycle section height. Modal has `overflow-y-auto` but Playwright cannot interact with below-fold buttons. No visual scroll affordance exists (no scrollbar visible in screenshot). Real browser may scroll; unverified.
- **Design note**: The shop account uses sharper/squarer edges in cards and modals compared to the customer account's more rounded design. Consistent with intentional design differentiation.

### Account

| Mode  | Status               | Issues                      |
| ----- | -------------------- | --------------------------- |
| Dark  | ✅ Renders correctly | Full settings panel visible |
| Light | ✅ Renders correctly | Same                        |

- Profile card: photo placeholder, name, email, profile completion percentage (80%).
- PREFERENCES section: Appearance Settings button.
- PROFILE TOOLS section: Shop Profile, Service Areas, Help & Support, **Smoke Test Checklist** (dev artifact — should not be visible in production).
- SESSION section: Sign Out (normal), Delete Account (red/destructive — correctly styled with warning color).
- **P5**: "Smoke Test Checklist" item is visible to authenticated shop users. Labeled "Quick QA shortcuts for this local environment." This is a dev-only tool exposed in a production-facing UI section.

### Theme Parity Matrix

| Tab                       | Dark/Light layout parity     | Dark text contrast | Light text contrast                                |
| ------------------------- | ---------------------------- | ------------------ | -------------------------------------------------- |
| Dashboard                 | ✅ Full parity               | ✅ Pass            | ✅ Pass                                            |
| Requests                  | ✅ Full parity               | ✅ Pass            | ✅ Pass                                            |
| Estimates                 | ✅ Full parity               | ✅ Pass            | ✅ Pass                                            |
| Active Jobs               | ✅ Full parity               | ✅ Pass            | ✅ Pass                                            |
| Account                   | ✅ Full parity               | ✅ Pass            | ✅ Pass                                            |
| Shop Profile modal        | ⚠️ Silver glass backdrop bug | —                  | Black page backdrop (modal renders on solid black) |
| Service Areas modal       | ✅ Correct white modal       | ✅ Pass            | ✅ Pass                                            |
| Appearance Settings modal | ✅ Correct white modal       | ✅ Pass            | ✅ Pass                                            |
| ShopActiveJobDetailModal  | ✅ Correct modal chrome      | ✅ Pass            | ✅ Pass                                            |
| ShopBidModal              | ✅ Correct modal chrome      | ✅ Pass            | —                                                  |

**Notable visual anomaly**: The Shop Profile dialog renders with a silver/metallic grey background and the surrounding page goes completely black when the modal opens. This is the same "silver glass" rendering bug previously documented on hash route pages. Affects `ShopProfileEditModal` (or equivalent component).

---

## Phase 2 — Functionality Findings

### Scenario 1: Bid Submission ✅ PASSED — Fully Functional

**Report**: Alex Guidice / 2018 BMW 550i / rear / Pleasanton CA  
**Bid submitted**: $500 / 3 days / "Phase 2 audit test bid — TestShop submission for Alex Guidice 2018 BMW 550i rear repair."

**What worked:**

- ShopBidModal opened from Requests tab card click.
- Amount ($500), turnaround (3 days), description fields all accepted input.
- Submit triggered Supabase edge function call. HTTP 200 returned.
- Success toast "Bid Submitted" fired immediately.
- Notification bell badge updated to "1 unread" in the same render cycle.
- Request card updated in real-time: "1 bids submitted" + "Bid Sent — Awaiting Response" status.
- Bid persisted across page reload (visible in "My Submitted Bids" dashboard widget and Requests tab).
- Bid description text preserved verbatim on reload.

**What didn't work:**

- After submission, the "Bidding" filter on Requests tab shows "No requests found" — the card only appears in "All Requests." This is a filter logic mismatch (P1).
- Alex Guidice's priority badge changed from HIGH to MEDIUM after bid submission — possibly dynamic or backend update. Noted as possible expected behavior, but worth confirming intent.

**Network**: Supabase edge function call: HTTP 200. Response contained bid ID. No errors.

**Persistence**: Confirmed. Reload verified. Bid still visible after two reload cycles.

---

### Scenario 2: Active Job Status Transitions ⚠️ PARTIALLY TESTED — Critical Blocker

**Job**: Job #F0930364 / Molalign Meagher / 2023 Honda Accord / In Progress / $575 / 67% progress

**What worked:**

- Job card rendered correctly in Active Jobs tab with correct data.
- ShopActiveJobDetailModal opened via "View Full Details" button.
- Modal content fully rendered: Customer Info (email: molalign5@gmail.com, phone: (845) 490-8919), Job Details, Job Lifecycle (5 steps with correct status indicators), Update Status heading, Awaiting Parts and Mark Completed buttons — all confirmed in DOM via accessibility snapshot.
- Job Lifecycle progression: Request Received ✅ → Bid Submitted ✅ → Job Awarded ✅ → Repair Execution (In progress) → Job Closed (⬜ upcoming).

**What blocked testing:**

- Update Status buttons are below the 90vh fold of the modal. The modal has `overflow-y-auto` in its outer container class, meaning it should be scrollable in a real browser. However, Playwright could not scroll the modal content, and all attempts to interact with the Update Status buttons (mouse.wheel, page.evaluate scroll, JS dispatchEvent click, keyboard Page Down) failed.
- Status was **not changed** during this test. The job remains "In Progress" at 67%.
- **This is the most critical gap in the shop-side test coverage.** Whether shops can actually advance job status in a real browser is unverified.

**PII exposure note**: The modal displays customer email and phone number in plaintext. This is intentional (shop needs to contact the customer), but it should be documented as a data handling decision.

**Network**: No status update call was made (testing was blocked). No errors from modal render itself.

---

### Scenario 3: Shop Profile / Onboarding ❌ FAILED — Save Blocked by Auth Error

**Entry point**: Account → Profile Tools → Shop Profile

**What worked:**

- Shop Profile modal opens cleanly.
- 5 fields present: Shop Name (empty), Business Address (empty), Phone Number (pre-populated: (777) 777-7777 from account), Business Hours (empty), Certifications (textarea, empty).
- Real-time feedback: typing in Shop Name immediately updated the Account card's "Shop Profile" field and bumped profile completion from **80% → 100%** in real-time. This is impressive live binding.
- Save Changes button was correctly disabled until a field was modified, then enabled.

**What failed:**

- Clicking Save Changes returned HTTP **403**: "Authenticated website identity mismatch."
- The 403 is a Clerk JWT validation failure — the production Clerk domain (`bidon.io` or similar) rejects the `localhost:5173` origin's token when calling the shop profile edge function.
- Profile completion reverted to 80% on the next Account tab load. Shop Profile field returned to "-".
- No shop profile data persisted.

**Root cause**: Auth mismatch between Clerk localhost development session token and production Supabase edge function domain validation. This is a dev environment constraint, not necessarily a production bug — but it means the entire shop profile flow is untestable in local dev.

**Visual bug**: When Shop Profile modal is open, the surrounding page backdrop turns **solid black** and the modal renders with a silver/metallic grey background. This is the "silver glass" rendering bug. The modal is usable but visually jarring.

---

### Scenario 4: Estimates Inbox — Real Data ❌ EMPTY — Feature Not Reachable

**Entry point**: Estimates tab (direct navigation)

**What was found:**

- The Estimates tab renders the full inbox UI: search bar + 6 filter pills (All, Pending, Viewed, Responded, Declined, Accepted).
- Real account data: "No estimate requests yet / When customers request estimates from your shop, they'll appear here."
- This matches the demo mode state exactly — the infrastructure is built but zero real estimate traffic exists for any test account.
- The edge function that loads estimates fired; no 500 error (unlike Service Areas). It returned an empty result set cleanly.

**What is unclear and untested:**

- There is no visible CTA or documented flow for how a customer requests an estimate from a specific shop.
- Looking at the customer dashboard in a prior session, there was no "Request Estimate from [Shop]" button visible either.
- The estimates feature appears to be a complete inbox on the shop side (built, styled, filtered) with the customer-side entry point either missing, buried, or not yet built.

**Impact**: A shop cannot receive estimates if customers have no discoverable way to send them. This is a broken product loop — the tab is a dead end for all current users.

---

### Scenario 5: Service Area Editing ❌ FAILED — Server Error on Both Load and Save

**Entry point**: Account → Profile Tools → Service Areas

**What worked:**

- Service Areas panel opens correctly (does not show silver glass bug — correct white modal).
- Empty state renders with a helpful CTA: "No service areas defined yet / Add your first service area to start receiving nearby reports."
- "Add Service Area" button opens an inline form.
- Form has two type modes: **Radius** (lat/lon + miles radius) and **ZIP Codes** (comma-separated text field).
- **Radius mode**: Latitude and Longitude numeric spinbuttons with geolocation defaults (placeholder 33.749, -84.388 = Atlanta GA). Radius defaults to 15 miles. "Use my current location" button present.
- **ZIP Codes mode**: Single textarea with Atlanta-area ZIP placeholder (30301, 30302, 30303).
- Toggle between modes works cleanly.
- The form is well-designed for the task.

**What failed:**

- Initial load: HTTP 500 from `getMyShopServiceAreas` — "Failed to load service areas." UI gracefully falls back to empty state.
- Save (ZIP mode, empty ZIPs): HTTP 400 — "zip_codes array required for zip_codes type." Correct validation, raw backend error message displayed in UI (P4 — should be user-friendly).
- Save (Radius mode, empty coords): HTTP 400 — "center_latitude and center_longitude required for radius type." Same issue.
- Save (Radius mode, NYC coords 40.7128 / -74.0060 / 15 miles): HTTP 500 — "Failed to save service area."

**Root cause**: The 500 error on save with valid data strongly suggests the TestShop account (`molalign1504s@gmail.com`) does not have a record in the `shops` table, causing a foreign key constraint failure when trying to insert a service area. The edge function error message is not surfaced clearly.

**Note**: Unlike Shop Profile (403 = auth), Service Areas returns 400 for validation and 500 for server error — indicating the endpoint IS reachable and the Clerk JWT is accepted. The failure is DB-side, not auth-side.

---

### Scenario 6: Profile + Appearance Settings Save ⚠️ MIXED — Theme Persists, Notifications Do Not

**Entry point**: Account → Preferences → Appearance Settings

**What the modal contains:**

- **Notifications — In-App**: 4 checkboxes (Bid updates ✅, Report updates ✅, Nearby reports ✅, Estimate updates ✅)
- **Notifications — Email**: Email enabled ✅, Bid updates ✅, Report updates ✅, Nearby reports ⬜, Estimate updates ⬜
- **Notifications — SMS**: SMS notifications enabled ⬜
- **Privacy**: Share data with shops ✅, Show profile to insurers ⬜
- **Appearance**: Map Dark (radio) | Light (radio, selected)
- **Language**: Coming soon, English disabled
- Banner: "Appearance and notification changes save immediately."
- Cancel + Save Appearance buttons at bottom.

**What worked:**

- Modal opens cleanly.
- Toggling a checkbox (Email Nearby Reports: ⬜ → ✅) changes state in React UI.
- Clicking Save Appearance closes the modal without error.
- `bidondent.appearance-mode` key in localStorage = `"light"` — **theme choice persists to localStorage**.

**What failed:**

- After page reload and re-opening Appearance Settings, Email Nearby Reports was back to ⬜.
- No Supabase network call was captured for notification preference save.
- No localStorage key exists for notification preferences.
- **Notification preference changes are silently discarded.** The UI gives no error, modal closes normally, but state is lost on reload.

**Root cause**: Either (a) the notification save triggers a Supabase edge function that silently fails, or (b) the save only writes to in-memory React state that is never persisted. The banner saying "changes save immediately" is misleading — the appearance theme saves (via localStorage) but notification checkboxes do not.

---

### Scenario 7: Map Widget State ⚠️ FUNCTIONAL BUT DISCONNECTED FROM SERVICE AREA

**Maps tested**: Dashboard "Your Service Area" map + Requests map + Active Jobs map

**Findings:**

- Dashboard map renders correctly in both light and dark modes.
- Map is centered on White Plains / New York metro area even though SERVICE AREAS = "Not set."
- **Requests map** (Phase 1 demo): Shows 5 pins in White Plains NY cluster. Real mode: 3 pins nationwide.
- **Active Jobs map** (Phase 1 demo): Shows 5 pins White Plains. Real mode: 3 nationwide.
- **Dashboard map** (real mode): Shows White Plains NY area with 2 visible pins (New City NY and White Plains).
- None of the maps respond to service area configuration (since service areas are empty). Map center appears to be a hardcoded default or based on a fallback geolocation.

**SNAPSHOT widget** (below dashboard map):

- SERVICE AREAS: "Not set" — correctly reflects the empty service area state.
- PARTNERS: 6 — some partner count data is loaded.
- "4 live requests in your queue / Newest intake: rear" — live queue count is accurate (confirmed by Requests tab showing 4 real reports).
- "View Map" CTA button overlaps the SNAPSHOT section header in the dashboard layout (minor layout collision — P4).

**Concern**: The map shows geographic data (White Plains NY area) that doesn't correspond to the TestShop account's configured service area (none) or physical location. The shop has no idea where the map is centered or why. If service area drives the map, the "Not set" state should show a map prompt, not a mystery map of suburban New York.

---

### Scenario 8: Notification Bell ⚠️ FIRES BUT DOES NOT PERSIST

**Entry point**: Header bell icon

**During Scenario 1** (bid submission):

- Bell badge updated to "1 unread" immediately after successful bid submission.
- Badge label: `button "Open notifications, 1 unread"`.
- This is correct reactive behavior — the UI knew a new event occurred and surfaced it.

**After page reload**:

- Bell badge gone. No badge visible in header.
- Clicking bell opens Notification Center panel correctly: white popover, "Notifications" heading with "Snapshot" subtitle, bell icon, X close button.
- Content: "No notifications yet / Activity from your account will appear here."
- Notifications are **not persisted** — neither in localStorage nor Supabase.

**Panel design**:

- The panel renders cleanly as a right-aligned dropdown off the header bell.
- Close button (X) works correctly.
- The "Snapshot" subtitle appears to describe the current notification philosophy (not real-time).
- There is no "Mark all as read" or "View all" link.

**Impact**: A shop that submits a bid, gets a success toast and badge, then closes their browser tab will return to a notification center showing nothing. The notification history is permanently lost. This undermines trust in the activity feed.

---

## Cross-Cutting Findings

### Authentication

- Clerk JWT works for bid submission and job data fetch (Supabase returns real data).
- Clerk JWT **fails** for Shop Profile save (403 — "Authenticated website identity mismatch") — this is a domain validation issue specific to the `shopProfile` edge function.
- Service Areas edge function accepts the JWT (returns 400/500, not 403) — different auth policy.
- All edge functions that return 500 on the shop side likely share a root cause: the TestShop account has no corresponding `shops` table record.

### Realtime / WebSocket

- WebSocket connections are consistently failing (expected in local dev — realtime not wired for this environment).
- No real-time bid acceptance events or job status push events are active.

### Edge Function Health Summary

| Edge function           | HTTP status   | Behavior                                                     |
| ----------------------- | ------------- | ------------------------------------------------------------ |
| `getAllDamageReports`   | Varies        | Works — returns 4 live reports                               |
| `submitBid`             | 200           | ✅ Works correctly                                           |
| `updateShopProfile`     | 403           | ❌ Fails — auth/domain mismatch                              |
| `getMyShopServiceAreas` | 500           | ❌ Fails — DB error                                          |
| `saveShopServiceArea`   | 400 / 500     | Validation works (400); DB write fails (500)                 |
| `getShopActiveJobs`     | 200 (partial) | Returns jobs, some 500 errors on tab load                    |
| `getEstimateRequests`   | 200 (empty)   | Returns empty cleanly                                        |
| `getNotifications`      | —             | Not called on reload — notifications are not fetched from DB |

### PII Exposure

- ShopActiveJobDetailModal displays customer email (molalign5@gmail.com) and phone number ((845) 490-8919) in plaintext.
- This is appropriate for the shop's operational needs but should be logged as a data handling decision, especially for GDPR/CCPA compliance review.

### Data Quality Issues

- "Toyoto Camry" (sic) in real report data — typo in vehicle name (`make: "Toyota"`, `model: "Camry"` submitted as "Toyoto") — P6 data quality, surfaced throughout dashboard and Active Jobs.
- "Customer" as a customer name in one report — test data artifact (P3).
- Report description "It's probably better to select the categories of damage" — test data artifact visible in dashboard (P3).

---

## Live-Market Readiness Assessment

| Feature                          | Shop-Side Status                            | Confidence                    |
| -------------------------------- | ------------------------------------------- | ----------------------------- |
| Browse incoming repair requests  | ✅ Working                                  | High                          |
| Submit a bid                     | ✅ Working end-to-end                       | High                          |
| View active jobs                 | ✅ Working (card list)                      | High                          |
| Advance job status               | ⚠️ Untestable via Playwright (modal scroll) | Low — needs real browser test |
| Edit shop profile                | ❌ 403 on save (dev env constraint)         | Unknown for production        |
| Set service areas                | ❌ 500 on save (likely DB schema gap)       | Not ready                     |
| Receive estimate requests        | ❌ Dead end — no customer entry point       | Not ready                     |
| Notification persistence         | ❌ Session-only                             | Not ready                     |
| Notification preferences (save)  | ❌ Silent data loss                         | Not ready                     |
| Map widget — service area driven | ❌ Disconnected (shows default NYC area)    | Not ready                     |
| Appearance theme                 | ✅ localStorage persists                    | Ready                         |
| Tab navigation                   | ✅ All 5 tabs navigate correctly            | Ready                         |
| Dark/light mode                  | ✅ Full parity across all tabs              | Ready                         |

**Overall**: The core bidding loop (browse requests → submit bid → see bid in dashboard) is solid and production-ready. The shop management layer (profile, service areas, notifications, estimates) has significant persistence and backend gaps that need to be resolved before live launch.

---

## Open Questions

1. **Active job status transitions**: Do the Update Status buttons (Awaiting Parts / Mark Completed) work in a real browser? The modal scroll issue may be Playwright-only. This must be verified manually before live launch.

2. **Estimates entry point**: How does a customer request an estimate from a specific shop? Is this feature built on the customer side? If not, the shop-side inbox is an incomplete dead end.

3. **Shop Profile 403**: Is this a `localhost` dev environment issue (Clerk domain validation) or will it fail in production too? If production uses the correct domain, this may be dev-only. But it needs a test in staging.

4. **Service Areas 500**: Does the TestShop account (`molalign1504s@gmail.com`) have a corresponding record in the `shops` table? If not, all shop-scoped writes will fail. The DB schema may require a manual `shops` row insert for test accounts.

5. **Notification persistence design**: Is the intention for notifications to be ephemeral (session-only) or persisted? The current behavior (session-only) is not user-friendly for shop operators. If notifications are meant to persist, the `getNotifications` edge function should be called on app load.

6. **"Bidding" filter logic**: Why doesn't the newly submitted bid appear in the Bidding filter? Is there a status enum mismatch between the bid's Supabase record and the frontend filter condition?

7. **Map center in "Not set" service area state**: Is the White Plains NY area a hardcoded default or derived from some other data? The shop has no context for why their map shows New York.

8. **Smoke Test Checklist visibility**: Is this intentionally exposed for all shop accounts, or should it be gated by a dev/admin flag?

---

## Problem Taxonomy Summary

| Category        | Found | Description                                                                                                                                                                                                  |
| --------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P0-BUILD**    | 0     | No build failures during audit                                                                                                                                                                               |
| **P1-RUNTIME**  | 5     | (1) Active job modal scroll overflow; (2) Bidding filter shows empty post-bid; (3) Notification preferences silent data loss; (4) Notifications not persisted; (5) Estimates dead end with no customer entry |
| **P2-DATA**     | 2     | (1) Shop Profile 403 on save; (2) Service Areas 500 on save (likely missing `shops` row)                                                                                                                     |
| **P3-ARCH**     | 1     | Notification save has no Supabase backend call — likely missing edge function or handler                                                                                                                     |
| **P4-UX**       | 3     | (1) Map "Not set" shows mystery NYC geography; (2) Raw backend error messages in UI ("zip_codes array required for zip_codes type"); (3) View Map button overlaps SNAPSHOT section                           |
| **P5-DOC**      | 1     | Smoke Test Checklist exposed in production-facing Account UI                                                                                                                                                 |
| **P6-SPELL**    | 2     | "Toyoto" (sic) in real report data; report descriptions contain test-data artifacts                                                                                                                          |
| **P7-TECHDEBT** | 2     | Shop Profile silver glass modal bug; Active job PII display decision not documented                                                                                                                          |

---

## Best Next Passes (Priority Order)

1. **Fix "Bidding" filter logic** — the post-bid submission filter regression is P1 and should be a fast fix (frontend only). A shop that submits a bid and can't find it in the Bidding filter will lose confidence immediately.

2. **Verify active job status transition in real browser** — open the app in Chrome, navigate to Active Jobs, open Job #F0930364, scroll the modal, and confirm Update Status buttons are reachable. If they work, no fix needed. If they don't, add scroll affordance or restructure the modal layout.

3. **Fix Shop Profile 403 in dev** — investigate whether the `updateShopProfile` edge function has a stricter Clerk domain check than other endpoints. If it's a dev-only issue, create a dev bypass. If it's a production issue, fix the domain check.

4. **Fix Service Areas 500** — confirm whether a `shops` row exists for `molalign1504s@gmail.com`. If not, insert one or update the edge function to create it on first save.

5. **Fix notification preference persistence** — either wire the Save Appearance button to a Supabase `upsert` for notification prefs, or store to localStorage as a workaround with a TODO to migrate to DB.

6. **Design the estimates entry point** — identify whether the customer-side "request estimate from a shop" flow exists. If it doesn't, create it. The shop-side inbox is built and ready to receive once the customer flow is wired.

---

_Report generated after completing 8 functional scenarios in Phase 2 and a full Phase 1 visual sweep of all 5 tabs in both light and dark modes._
