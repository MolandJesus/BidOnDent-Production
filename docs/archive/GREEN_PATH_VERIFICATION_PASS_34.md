# Pass 34 — Green-Path Marketplace Verification

**Date**: April 15, 2026  
**Branch**: BidOnDent-Horizon-Beta  
**Builder**: Claude Opus 4.6

---

## Summary

The core marketplace loop (Steps 1–4) has been **VERIFIED as functional**. A critical CORS blocker was found and fixed during this pass, enabling all edge function communication from localhost dev servers.

---

## CORS Fix (Blocking Issue Found & Resolved)

**Root cause**: The edge function's `ALLOWED_ORIGINS` array in `supabase/functions/server/config/constants.ts` only listed `localhost:5173` and `localhost:5174`. Vite bounced to port `5175` (ports 5173–5174 were occupied), causing ALL edge function calls to fail with CORS preflight rejections.

**Fix**: Added `localhost:5175` and `localhost:5176` to the `ALLOWED_ORIGINS` array. Edge function redeployed to remote Supabase via `supabase functions deploy server --no-verify-jwt`.

**File changed**: `supabase/functions/server/config/constants.ts`

---

## Step-by-Step Results

| Step | Description                     | Status        | Notes                                                                                                                                 |
| ---- | ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Customer creates damage report  | ✅ PASS       | Reports already exist from prior sessions (48e97a54, 6b14694e)                                                                        |
| 2    | Shop sees report on marketplace | ✅ PASS       | Real data loaded — no seed banner. 3 marketplace reports visible. Map shows "2/3 mapped".                                             |
| 3    | Shop submits bid on report      | ✅ PASS       | $450 bid on 2021 Toyoto Camry. Console: "✅ Bid submitted and persisted to Supabase". POST /bids → 200.                               |
| 4    | Customer sees the bid           | ✅ PASS       | Bids screen shows "1 bid for 2021 Toyoto Camry". TestShop bid card: $450, 3-4 days, "Recommended", "Lowest bid". Description visible. |
| 5    | Customer accepts bid            | ⚠️ PARTIAL    | Local state updated ("✅ Bid status updated to accepted"). Two backend calls fail (see below).                                        |
| 6    | Shop sees active job            | 🔲 NOT TESTED | Depends on Step 5 backend success                                                                                                     |
| 7    | Shop marks job complete         | 🔲 NOT TESTED | Future wiring                                                                                                                         |
| 8    | Customer rates                  | 🔲 NOT TESTED | Future wiring                                                                                                                         |

---

## Console Error Table (After CORS Fix)

| Error                                                                    | HTTP Status | Endpoint                | Severity | Notes                                                                                                                                                       |
| ------------------------------------------------------------------------ | ----------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Could not find the 'latitude' column of 'damage_reports' in schema cache | 500         | PUT /reports/{id}       | **P1**   | Fired when customer accepts bid → updateReportStatus. Remote Supabase schema cache may not have this column, or the query references a non-existent column. |
| invalid input syntax for type uuid: "user_37l2aa…"                       | 500         | POST /job-assignment    | **P1**   | Clerk user ID passed where UUID expected. The job_assignments table likely has a UUID column that shouldn't receive Clerk IDs.                              |
| Could not resolve user identity                                          | 401         | GET /shop-service-areas | P2       | Auth issue on shop-service-areas endpoint — JWT verified but profile lookup failed.                                                                         |
| Failed to load service areas                                             | 500         | GET /shop-service-areas | P2       | Server-side error resolving service areas                                                                                                                   |
| invalid input syntax for type integer: "ffb7d09c-…"                      | 500         | GET /estimate-requests  | P2       | UUID passed where integer expected — likely a column type mismatch.                                                                                         |
| 403 on website-relationships, website-preferences, shop-profile          | 403         | Various                 | P3       | Auth/permission issues on secondary endpoints — not blocking core loop                                                                                      |
| Clerk 'supabase' JWT template not configured                             | 404         | Clerk API               | P4       | Supabase JWT template not set up in Clerk — only affects Realtime auth                                                                                      |

---

## Key Findings

### What Works

- **Profile bootstrap**: Shop profile loaded from Supabase (id: `ed5d677e-3da1-45f9-bdfa-ad492ad7c41b`)
- **Marketplace data**: 3 real reports loaded via edge function (`[DEV] Loaded 3 marketplace reports via edge`)
- **Map integration**: Report locations mapped (2/3 with ZIP codes)
- **Bid submission**: End-to-end from shop UI to Supabase persistence
- **Bid visibility**: Customer can see bids from shops in the Bids comparison view
- **Bid acceptance (local)**: UI transitions correctly when bid is accepted
- **Realtime subscriptions**: Report and bid subscriptions connect (SUBSCRIBED status)

### What's Broken (Backend/Schema)

1. **`updateReportStatus`** — references a `latitude` column that may not exist in the remote `damage_reports` table's schema cache. The edge function query likely includes `latitude`/`longitude` in a select or where clause even when not needed.
2. **`createJobAssignment`** — passes Clerk user IDs (`user_xxx`) where the `job_assignments` table expects UUIDs. The wiring needs to resolve the internal profile UUID before inserting.
3. **`estimate-requests`** — column type mismatch (UUID vs integer).

### Non-Blocking Issues

- WebSocket reconnection flicker on page transitions (cosmetic)
- Report detail view shows "0 bids received" in "Interested Shops" section even when bids exist (the data is shown correctly in the Bids screen, but the report detail fetches differently)
- Shop service areas endpoint fails (not critical for core loop)

---

## Architecture Notes

- The CORS issue was a deployment gap, not a code bug — the dev port list was incomplete.
- The auth flow works: Clerk RS256 JWT → edge function → 3-tier verification → profile resolution. The RS256 concerns from planning were addressed by the existing JWKS fallback chain.
- The marketplace query runs through `requireMarketplaceContext` → `getAuthenticatedProfile` which successfully resolved the shop profile by `clerk_user_id`.

---

## Recommendation for Planning AI

### P0 — Must fix for production-ready core loop

1. Fix `updateReportStatus` query to not reference non-existent columns
2. Fix `createJobAssignment` to resolve Clerk user ID → profile UUID before insert
3. Fix `estimate-requests` column type mismatch

### P2 — Important but not blocking core loop

4. Fix report detail view to show received bids (mismatch vs Bids screen)
5. Fix shop-service-areas auth/identity resolution

### P4 — Future

6. Configure Clerk supabase JWT template for Realtime auth
7. Fix website-relationships/preferences 403 errors
