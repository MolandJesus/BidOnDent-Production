# Pass 26 — Shop Dashboard Audit (Read-Only)

**Date**: 2026-04-15  
**Branch**: `BidOnDent-Horizon-Beta` at `a65086e2` (Pass 25)  
**Environment**: Dev server `localhost:5174`, remote Supabase (`wmdcnjgtsppftrofaqqa.supabase.co`)  
**TestShop account**: `molalign1504s@gmail.com` (Clerk ID `user_3CPY...`)  
**Customer account**: `molalign5@gmail.com`  
**Type**: READ-ONLY audit — zero code changes

---

## 1. Executive Summary

The shop dashboard renders all five tabs (Dashboard, Requests, Estimates, Active Jobs, Account) without crashes. However, the **entire marketplace loop is non-functional**: the remote edge function `getAllDamageReports` returns 403 "Marketplace access required" because the TestShop Clerk user has no matching `profiles` row on the remote Supabase. This forces a seed-data fallback on every marketplace surface, making bid submission impossible and blocking the full green-path loop.

Three confirmed bugs were reproduced with browser evidence and code-traced to root cause. All three share the same upstream failure: **missing shop profile on remote Supabase**.

---

## 2. Bug Reproductions

### Bug A — "Failed to submit bid"

**Steps to reproduce**:
1. Log in as TestShop
2. Navigate to Requests tab (Marketplace)
3. Click "Submit Bid" on first seed report (2019 Honda CR-V)
4. Fill in $500 bid amount, 3 estimated days
5. Click "Submit Bid"

**Result**: Red error text: "This is a demo request. Real bids can only be submitted on live customer reports."

**Root cause**: Client-side guard in `ShopRequestsScreen.tsx:104` — `selectedRequest.id.startsWith("seed-")`. This fires because ALL visible reports are seed data (consequence of Bug C).

**Code path**:
```
ShopRequestsScreen.handleSubmitBid()
  → if selectedRequest.id.startsWith("seed-") → show demo error → return
```

**Verdict**: Bug A is a SYMPTOM of Bug C. If real reports were visible, the seed guard would not trigger. The bid submission path itself (lines 112+) is wired to `onSubmitBid` and appears structurally correct.

---

### Bug C — Marketplace shows seed fallback instead of real reports

**Steps to reproduce**:
1. Log in as TestShop
2. Click "Requests" in sidebar
3. Observe yellow banner: "Showing example requests for preview."
4. Observe seed reports with "Not provided" customer names and "#seed-rep" IDs

**Console errors**:
- `403` on `getAllDamageReports` — "Marketplace access required" (repeated on every call)
- `404` on `getShopEstimateRequests` — endpoint not deployed on remote
- `404` on `getMyShopServiceAreas` — endpoint not deployed on remote

**Root cause chain**:
1. `useMarketplaceReports(userType)` → calls `getAllDamageReports()`
2. Edge function `reports.ts` → `requireMarketplaceContext(req, supabase)`
3. `requireMarketplaceContext` → `requireAuthenticatedProfile` → `getAuthenticatedProfile`
4. `getAuthenticatedProfile` queries `profiles` table by `clerk_user_id` → **no row found** on remote Supabase
5. Falls back to email lookup → also no match
6. Returns `null` profile → `isMarketplaceActor = false` → throws 403
7. `useMarketplaceReports` catches → `marketplaceReports = []`
8. `useDashboardData.ts:121` — `usingSeedFallback = liveMarketplaceReports.length === 0` → `true`
9. `shopInsurerReports = SEED_DAMAGE_REPORTS` (from constants)
10. `ShopRequestsScreen` renders seed data with yellow banner

**Key files**:
- `src/app/hooks/useMarketplaceReports.ts` — fetch + fallback logic
- `src/app/routers/useDashboardData.ts:121-122` — seed fallback decision
- `supabase/functions/server/utils/authz.ts:247-265` — marketplace check
- `supabase/functions/server/utils/authz.ts:158-198` — profile lookup

**Fix required**: Ensure the remote Supabase `profiles` table has a row with `clerk_user_id = user_3CPY...` and `account_type = 'shop'`. Alternatively, the profile sync/creation flow during onboarding may not be reaching the remote database.

---

### Bug D — "View All" routes shop to customer reports screen

**Steps to reproduce**:
1. Log in as TestShop
2. On Dashboard home, click "View All →" next to "Incoming Requests"
3. Observe navigation to "REPORT LIBRARY / My Reports" — a customer-oriented screen with "All, Pending, Active, Completed" filters

**Expected**: Shop should navigate to the Requests tab (marketplace view)

**Root cause**: `buildDashboardRouterProps.ts:85`:
```typescript
onViewAllReports: () => {
  navigation.setViewMode("reports-list");
}
```
This callback is used for ALL user types. No role check. Compare with the correct shop action at line 99:
```typescript
onViewRequests: () => {
  navigation.setCurrentTab("requests");
  navigation.setViewMode("dashboard");
}
```

**Also**: `HomeScreen.tsx:81` — `listViewAllAction = onViewAllReports` for all roles (no branching), even though the header IS role-aware (shows "Incoming Requests" for shop).

**Fix**: Add role check — if `userType === "shop"`, `onViewAllReports` should call `setCurrentTab("requests")` instead of `setViewMode("reports-list")`.

---

## 3. Dashboard Walkthrough

### Tab: Dashboard (Home)
- **SHOP OPERATIONS** hero: "Welcome back, TestShop" / "Track incoming requests and active repairs" / "View Requests →" CTA
- **COMMAND DECK** — Quick Actions (4 shortcuts): Open Requests, Active Jobs, Competitors, Browse Insurers
- **REPAIR ACTIVITY** — Incoming Requests: 2 seed reports ("Damage Report #seed-rep") with map pin icons, bid counts, "View All →" button (Bug D)
- **Your Service Area** — MapLibre preview with coverage data
- **Coverage Snapshot** — Service Areas: Not set / Partners: 0 / "2 live requests in your queue"
- **Issues**: Seed data presented without a banner on this screen (unlike Requests tab). "View All" navigates to wrong screen.

### Tab: Requests (Marketplace)
- **REPAIR REQUESTS / Marketplace** heading
- Search bar + filter buttons: All Requests, New, Bidding, Accepted, Closed
- **Yellow seed banner**: "Showing example requests for preview..."
- **Request locations map**: "0/2 mapped" / "No request locations available yet"
- Two seed request cards with Submit Bid buttons
- **Issues**: 403 errors on `getAllDamageReports`. Seed fallback active. Bid submission blocked.

### Tab: Estimates
- **ESTIMATE INBOX / Estimates** heading
- Search bar + filter buttons: All, Pending, Viewed, Responded, Declined, Accepted
- Empty state: "No estimate requests yet / When customers request estimates from your shop, they'll appear here."
- **Issues**: 404 on `getShopEstimateRequests` — endpoint not deployed on remote. Clean empty state UX (no crash).

### Tab: Active Jobs
- **SHOP OPERATIONS / Active Jobs** heading
- Search bar + filter buttons: All Jobs, Pending, In Progress, Awaiting Parts, Completed
- **Error toast** (top-right): "Unable to load jobs. Please check your connection and try again."
- **Yellow seed banner**: "Showing example jobs for preview..."
- **Job locations map**: "0/2 mapped" / "No job locations available yet"
- Seed job card: "Job #seed-report-1" / Pending / 2021 Toyota Camry / Progress 67% / Workflow steps (Report Received ✓, Bid Submitted ✓, Repair Start □)
- **Issues**: Error toast appears (likely from marketplace/bids fetch failure). Seed fallback active.

### Tab: Account
- **ACCOUNT HUB**: TestShop avatar, "Profile" badge, camera icon
- **IDENTITY / Account Information**: Profile completion 80%
  - Name: TestShop
  - Phone: (777) 777-7777
  - Email: molalign1504s@gmail.com
  - Shop Profile: "-" (empty)
  - Edit button
- **ACCOUNT CONTROLS / Actions & Preferences** (3 zones):
  - Preferences (2 items): Appearance Settings, Payment Preview
- **Issues**: Shop Profile field shows "-" (likely because profile isn't persisted to remote). No obvious errors.

### Sidebar
- 5 nav items: Dashboard, Requests, Estimates, Active Jobs, Account
- "Demo Mode" toggle at bottom
- User footer: TestShop / molalign1504s@gmail.com
- Active tab has blue highlight + chevron indicator
- No issues observed.

---

## 4. Console Error Summary (Page Load)

| Error | Status | Endpoint | Count | Root Cause |
|-------|--------|----------|-------|------------|
| Marketplace access required | 403 | `getAllDamageReports` | 3+ | No shop profile row on remote Supabase |
| Not found | 404 | `getShopEstimateRequests` | 1 | Edge function not deployed on remote |
| Not found | 404 | `getMyShopServiceAreas` | 1 | Edge function not deployed on remote |
| Invalid Clerk token issuer | 500 | `getShopSubmittedBids` | intermittent | Clerk dev token issuer mismatch with remote config |
| JWT template not configured | warn | Realtime | 1 | Supabase Realtime JWT not set up |
| ERR_ABORTED | varies | website relationships/preferences | 2+ | Clerk dashboard features not configured |

---

## 5. Green-Path Rehearsal

**8-step marketplace loop**: customer creates report → shop sees it → shop bids → customer reviews → customer accepts → shop starts job → shop completes → customer rates

### Step-by-step status:

| Step | Action | Status | Blocker |
|------|--------|--------|---------|
| 1 | Customer creates damage report | NOT TESTED | Would need account switch |
| 2 | Shop sees report on marketplace | **BLOCKED** | Bug C — 403 on marketplace fetch |
| 3 | Shop submits bid on report | **BLOCKED** | Bug A — seed guard prevents bids |
| 4 | Customer receives bid notification | BLOCKED | Step 3 prerequisite |
| 5 | Customer accepts bid | BLOCKED | Step 4 prerequisite |
| 6 | Shop starts repair job | BLOCKED | Step 5 prerequisite |
| 7 | Shop completes job | BLOCKED | Step 6 prerequisite |
| 8 | Customer rates shop | BLOCKED | Step 7 prerequisite |

**Verdict**: The green path is **COMPLETELY BLOCKED at step 2**. The core marketplace loop cannot function until the remote Supabase has a valid shop profile for the test account.

---

## 6. Other Issues Discovered

1. **Dashboard home shows seed data WITHOUT a banner** — Requests tab has a yellow "Showing example requests" banner, but Dashboard home's "Incoming Requests" section shows the same seed data with no visual indicator that it's demo data. This could confuse a real shop user.

2. **Active Jobs error toast** — "Unable to load jobs" toast fires on the Active Jobs tab, in addition to the seed fallback. The error recovery UX is adequate but the toast is redundant with the seed banner.

3. **Two 404 endpoints on remote** — `getShopEstimateRequests` and `getMyShopServiceAreas` are called but return 404 from the remote deployment, meaning these edge functions haven't been deployed to production yet.

4. **"Competitors" and "Browse Insurers" quick action buttons** — visible on Dashboard but their destination/functionality was not tested. These may be placeholder features.

5. **Coverage Snapshot shows "2 live requests"** — This text comes from seed data. It should show "2 demo requests" or be suppressed when using seed fallback.

6. **Profile completion 80%** but Shop Profile shows "-" — The profile completion metric doesn't reflect that the critical shop profile field is empty.

---

## 7. Root Cause Hierarchy

All three bugs share the same upstream failure:

```
Remote Supabase profiles table
  └── No row with clerk_user_id matching TestShop's Clerk ID
      └── getAuthenticatedProfile returns null
          └── requireMarketplaceContext throws 403
              └── getAllDamageReports fails
                  └── useMarketplaceReports returns []
                      └── usingSeedFallback = true
                          ├── Bug C: Marketplace shows seed data
                          └── Bug A: Bid guard blocks seed bids
                          
Bug D is independent: buildDashboardRouterProps.ts:85 missing role check
```

**Priority fix order**:
1. **P1**: Fix remote profile sync — ensure shop onboarding creates a `profiles` row on remote Supabase with correct `clerk_user_id` and `account_type = 'shop'`
2. **P1**: Fix Bug D — add role check to `onViewAllReports` in `buildDashboardRouterProps.ts`
3. **P2**: Deploy missing edge functions (`getShopEstimateRequests`, `getMyShopServiceAreas`) to remote
4. **P3**: Add seed-data indicator on Dashboard home "Incoming Requests" section

---

## 8. Files Read (Not Modified)

- `src/app/components/shop/ShopRequestsScreen.tsx` — seed banner + bid guard
- `src/app/hooks/useMarketplaceReports.ts` — marketplace fetch + fallback
- `src/app/routers/useDashboardData.ts` — seed fallback decision logic
- `src/app/utils/buildDashboardRouterProps.ts` — Bug D root cause (line 85)
- `src/app/components/codelayer/HomeScreen.tsx` — `listViewAllAction` binding
- `supabase/functions/server/utils/authz.ts` — `requireMarketplaceContext` + `getAuthenticatedProfile`
- `supabase/functions/server/utils/clerk.ts` — JWT verification chain
- `supabase/functions/server/config/constants.ts` — env config
- `src/app/services/supabase/runtime.ts` — URL building + auth headers

---

## 9. Best Next Pass

**Pass 27 — Fix remote profile sync + Bug D routing**

1. Create/verify a `profiles` row on remote Supabase for TestShop (`clerk_user_id`, `account_type = 'shop'`)
2. Add role check to `onViewAllReports` in `buildDashboardRouterProps.ts`
3. Verify marketplace loads real reports (not seed fallback)
4. Verify bid submission succeeds on real report
5. Re-run green-path rehearsal through step 3
