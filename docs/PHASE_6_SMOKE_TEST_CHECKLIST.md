# Phase 6 Smoke-Test Checklist

**Created:** 2026-04-15 (Pass 869 — pre-Phase 6 prep)
**Source:** Hardening Plan Phase 6.1 + 6.3
**Status:** Skeleton — result columns blank until staging + prod runs

---

## Instructions

Run this checklist **twice**: once against the staging preview URL (Phase 6.1), once against the production URL after deploy (Phase 6.3). Use **fresh accounts** created during the test — not seeded, demo, or previously used test accounts. Record evidence (screenshot or log line) for each item.

---

## Environment Info

| Field             | Staging                  | Production            |
| ----------------- | ------------------------ | --------------------- |
| URL               | _(fill after 5.1 setup)_ | https://bidondent.com |
| Supabase project  | _(fill after 5.1 setup)_ | wmdcnjgtsppftrofaqqa  |
| Clerk environment | _(shared)_               | _(shared)_            |
| Date run          |                          |                       |
| Tester            |                          |                       |

---

## Checklist

### 1. Customer Signup (fresh account)

| #   | Step                               | Expected                                                   | Staging Result | Prod Result |
| --- | ---------------------------------- | ---------------------------------------------------------- | -------------- | ----------- |
| 1.1 | Sign up with a new email via Clerk | Clerk account created, redirected to account type selector |                |             |
| 1.2 | Select "Customer" account type     | Customer profile created in Supabase `profiles` table      |                |             |
| 1.3 | Verify dashboard loads             | Customer dashboard renders with all widgets, no errors     |                |             |

### 2. Report Submission

| #   | Step                                       | Expected                                                       | Staging Result | Prod Result |
| --- | ------------------------------------------ | -------------------------------------------------------------- | -------------- | ----------- |
| 2.1 | Start new damage report                    | 6-step wizard opens                                            |                |             |
| 2.2 | Complete all 6 steps with at least 1 photo | Report saved, photo uploaded to Supabase Storage               |                |             |
| 2.3 | Verify report appears in dashboard         | Report visible in customer's reports list with correct details |                |             |
| 2.4 | Verify report pin on map                   | Report appears as a pin on the customer map widget             |                |             |

### 3. Shop Signup + Bid (fresh account)

| #   | Step                                                   | Expected                                                      | Staging Result | Prod Result |
| --- | ------------------------------------------------------ | ------------------------------------------------------------- | -------------- | ----------- |
| 3.1 | Sign up with a different email, select "Shop"          | Shop onboarding flow (4 steps) → `shop_profiles` created      |                |             |
| 3.2 | Complete shop onboarding (business info, service area) | Shop profile saved, service area stored                       |                |             |
| 3.3 | View nearby reports on shop map                        | Customer's report from step 2 visible in shop's coverage area |                |             |
| 3.4 | Submit a bid on the report                             | Bid created via edge function, appears in customer's bid list |                |             |

### 4. Bid Acceptance + Job Assignment

| #   | Step                                     | Expected                                                                    | Staging Result | Prod Result |
| --- | ---------------------------------------- | --------------------------------------------------------------------------- | -------------- | ----------- |
| 4.1 | Switch to customer account, view bids    | New bid from shop visible in bids screen                                    |                |             |
| 4.2 | Accept the bid                           | Bid status → accepted, competing bids auto-rejected, job assignment created |                |             |
| 4.3 | Verify job appears in shop's active jobs | `ShopActiveJobsScreen` shows the new job                                    |                |             |

### 5. Email Delivery

| #   | Step                                                          | Expected                                                       | Staging Result | Prod Result |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------- | -------------- | ----------- |
| 5.1 | Check customer inbox after bid creation (step 3.4)            | "New bid from [shop]" email received (`notifyCustomerNewBid`)  |                |             |
| 5.2 | Check shop inbox after bid acceptance (step 4.2)              | "Your bid was accepted" email received (`notifyShopBidStatus`) |                |             |
| 5.3 | _(Optional)_ Trigger claim decision if insurer account exists | Claim decision email received (`notifyCustomerClaimDecision`)  |                |             |

### 6. Navigation

| #   | Step                                                | Expected                                            | Staging Result | Prod Result |
| --- | --------------------------------------------------- | --------------------------------------------------- | -------------- | ----------- |
| 6.1 | Open navigation to the shop from customer dashboard | Route displayed with turn-by-turn directions (OSRM) |                |             |
| 6.2 | Verify voice/GPS controls render                    | Navigation UI functional, no console errors         |                |             |

### 7. Security — RLS Verification

| #   | Step                                                    | Expected                                               | Staging Result | Prod Result |
| --- | ------------------------------------------------------- | ------------------------------------------------------ | -------------- | ----------- |
| 7.1 | Open browser console (unauthenticated/anon)             | Console accessible                                     |                |             |
| 7.2 | Attempt direct Supabase query on `profiles` table       | Query returns empty or is rejected — RLS blocks access |                |             |
| 7.3 | Attempt direct Supabase query on `damage_reports` table | Query returns empty or is rejected — RLS blocks access |                |             |
| 7.4 | Attempt direct Supabase query on `bids` table           | Query returns empty or is rejected — RLS blocks access |                |             |

### 8. Observability

| #   | Step                                        | Expected                                                                  | Staging Result | Prod Result |
| --- | ------------------------------------------- | ------------------------------------------------------------------------- | -------------- | ----------- |
| 8.1 | Trigger a deliberate client-side error      | Error captured in Sentry (check Sentry dashboard)                         |                |             |
| 8.2 | Verify `platform_activity_events` populated | Events for report creation, bid creation, bid acceptance visible in table |                |             |

### 9. Legal Surfaces

| #   | Step                                                 | Expected                                                            | Staging Result | Prod Result |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------- | -------------- | ----------- |
| 9.1 | From landing page nav/footer, click Terms of Service | Page renders, content is not misleading about current functionality |                |             |
| 9.2 | From landing page nav/footer, click Privacy Policy   | Page renders, content is not misleading about current functionality |                |             |

---

## Summary

| Category             | Items     | Staging Pass | Prod Pass |
| -------------------- | --------- | ------------ | --------- |
| Customer signup      | 3         | /3           | /3        |
| Report submission    | 4         | /4           | /4        |
| Shop signup + bid    | 4         | /4           | /4        |
| Bid acceptance + job | 3         | /3           | /3        |
| Email delivery       | 2-3       | /2           | /2        |
| Navigation           | 2         | /2           | /2        |
| RLS verification     | 4         | /4           | /4        |
| Observability        | 2         | /2           | /2        |
| Legal surfaces       | 2         | /2           | /2        |
| **Total**            | **26-27** |              |           |

---

## Gate Criteria (Phase 6)

- [ ] Every smoke-test item passes on staging
- [ ] Every smoke-test item passes on prod
- [ ] No regressions from Phase 4 changes
- [ ] Observability is catching real events
- [ ] Emails are landing in real inboxes
