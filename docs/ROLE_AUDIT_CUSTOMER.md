# Role Audit — Customer

> **Generated:** 2025-07-11 — Pass 25 (Track 3)  
> **Purpose:** Document every screen, feature, and data flow a Customer user can reach. Distinguish real (Supabase-persisted) from partial/stub/planned.  
> **Rule:** Audit-only. NO code changes accompany this pass.

---

## Role Determination

1. User signs up via Clerk → selects "Customer" in `ClerkAccountTypeSelector.tsx`
2. `user_type: "customer"` stored in Clerk metadata via `updateUserMetadata()`
3. Edge function syncs to Supabase `profiles.account_type = 'customer'`
4. `useUserData.ts` loads profile cloud-first → localStorage cache
5. `DashboardRouter.tsx` routes tabs/views based on `userType`

---

## Navigation Tabs

| Tab     | Icon      | Target                                                                |
| ------- | --------- | --------------------------------------------------------------------- |
| Home    | Dashboard | `HomeScreen` — welcome bar, quick actions, recent reports, map widget |
| Report  | Camera    | `ReportScreen` — 6-step report creation wizard                        |
| Bids    | FileCheck | `BidsScreen` — view/accept/reject incoming shop bids                  |
| Account | User      | `AccountScreen` — profile, vehicles, preferences, logout              |

---

## Screen Inventory

| Screen              | Component                      | Functional | Mobile | Notes                                               |
| ------------------- | ------------------------------ | :--------: | :----: | --------------------------------------------------- |
| Dashboard Home      | `HomeScreen.tsx`               |     ✅     |   ✅   | Role-aware welcome, quick actions, report list, map |
| Report Creation     | `ReportScreen.tsx`             |     ✅     |   ✅   | 6-step wizard with draft auto-save                  |
| Reports List        | `ReportsListScreen.tsx`        |     ✅     |   ✅   | Search, status filter, thumbnails, map preview      |
| Report Detail       | `ReportDetailScreen.tsx`       |     ✅     |   ✅   | Full info, photos, bids, location map               |
| Bids / Acceptance   | `BidsScreen.tsx`               |     ✅     |   ⚠️   | Map height may compress on very small screens       |
| Account / Profile   | `AccountScreen.tsx`            |     ✅     |   ✅   | Edit profile, manage vehicles, appearance toggle    |
| Shop Directory      | `ShopDirectoryScreen.tsx`      |     ✅     |   ✅   | Browse shops, request estimates, route guidance     |
| Liked Shops         | `LikedShopsScreen.tsx`         |     ⚠️     |   ✅   | Saved-places partial (localStorage only)            |
| Insurance Companies | `InsuranceCompaniesScreen.tsx` |     ✅     |   ✅   | Browse insurer partners, connect                    |

---

## Core Product Loop

```
Create Report → Shops See It → Bids Arrive → Accept Bid → Job Assigned
```

This is the primary revenue loop. All steps are functional and Supabase-persisted.

---

## Report Creation Flow (6 Steps)

| Step                | Content                                           | Persistence                              | Status |
| ------------------- | ------------------------------------------------- | ---------------------------------------- | :----: |
| 1. Vehicle Info     | Year, make, model, VIN (optional)                 | localStorage draft + Supabase on submit  |   ✅   |
| 2. Damage Area      | Front/rear/side/roof selection                    | localStorage draft                       |   ✅   |
| 3. Photos           | Up to N photos, upload to Supabase Storage        | Supabase Storage bucket, base64 fallback |   ✅   |
| 4. Service Location | ZIP code + optional address → geocoded to lat/lng | localStorage draft, Supabase on submit   |   ✅   |
| 5. Description      | Damage description + incident context             | localStorage draft                       |   ✅   |
| 6. Review & Submit  | Summary → POST to edge function                   | Supabase `damage_reports` table          |   ✅   |

**Draft auto-save:** `reportDraftStorage.ts` saves to localStorage after each step, clears on submit.  
**Photo upload:** `reportPhotoUpload.ts` uploads to `damage_report_photos/{userId}/{reportId}/` with retry logic.

---

## Bid Viewing & Acceptance

| Feature               | Status | Data Source                                                             |
| --------------------- | :----: | ----------------------------------------------------------------------- |
| Bid list (live)       |   ✅   | `useBidsForReport` — Supabase real-time subscription                    |
| Filter by status      |   ✅   | Client-side enum: pending / accepted / rejected                         |
| Shop info on bid card |   ✅   | Name, rating, distance (Haversine calc)                                 |
| Accept bid            |   ✅   | `updateBidStatus(bidId, "accepted")` → creates `job_assignments` record |
| Reject bid            |   ✅   | `updateBidStatus(bidId, "rejected")`                                    |
| Confirmation modal    |   ✅   | Shows shop contact info before confirm                                  |
| Geography map         |   ✅   | Report pin + all bidding shop pins                                      |

---

## Account & Profile

| Feature                      | Status | Sync Target                              |
| ---------------------------- | :----: | ---------------------------------------- |
| Edit name/email              |   ✅   | Clerk + Supabase `profiles`              |
| Edit phone                   |   ✅   | Supabase `profiles.phone`                |
| Add/edit/delete vehicle      |   ✅   | Supabase `vehicles` + localStorage cache |
| Light/dark appearance toggle |   ✅   | `AppearanceModeContext` + localStorage   |
| Logout                       |   ✅   | Clerk `signOut()` + state clear          |
| Delete account               |   ✅   | Cascading deletion (irreversible)        |

---

## Map Interactions

| Surface        | Component             | Features                                                      |
| -------------- | --------------------- | ------------------------------------------------------------- |
| Home widget    | `CustomerMapWidget`   | Own report pins (amber) + bid shop pins (blue)                |
| Shop Directory | `ShopDirectoryScreen` | Browse shops, OSRM routing, voice guidance, estimate requests |
| Bids geography | `BidsGeographyMap`    | Report pin + all bid shop pins, distance legend               |
| Report detail  | Embedded map          | Centered at report lat/lng                                    |

---

## Data Flow Summary

| Data          | Source of Truth           | Cache           |     Real-Time     |
| ------------- | ------------------------- | --------------- | :---------------: |
| Reports       | Supabase `damage_reports` | localStorage    |        ✅         |
| Bids          | Supabase `bids`           | —               | ✅ (subscription) |
| Profile       | Supabase `profiles`       | localStorage    |         —         |
| Vehicles      | Supabase `vehicles`       | localStorage    |         —         |
| Photos        | Supabase Storage          | base64 fallback |         —         |
| Draft reports | localStorage only         | —               |         —         |

---

## Demo vs. Real Data

- **Production:** All data from Supabase. No synthetic injection.
- **Demo mode** (`VITE_DEMO_MODE=true`): Seed reports + bids used as fallback if Supabase fetch fails. Fallback is **not** visually labeled as demo in customer UI.
- localStorage caches may return stale seed data offline.

---

## Known Gaps

| Issue                       | Priority | Detail                                                                                                 |
| --------------------------- | :------: | ------------------------------------------------------------------------------------------------------ |
| Insurance claim integration |    P2    | Report can be flagged as insurance, but customer cannot file claims directly — must go through insurer |
| Estimate request response   |    P3    | Customer can request estimate from shop, but accept/decline downstream flow is partial                 |
| Mobile bid map height       |    P4    | Map may compress on screens < 320px                                                                    |
| Photo quality guidance      |    P5    | Photo guide is optional and dismissible                                                                |
| Offline mode                |    P5    | No service worker; map requires network                                                                |
| Liked shops persistence     |    P3    | localStorage only — not synced to Supabase                                                             |
