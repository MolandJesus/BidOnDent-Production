# Role Audit — Shop

> **Generated:** 2025-07-11 — Pass 25 (Track 3)  
> **Purpose:** Document every screen, feature, and data flow a Shop user can reach. Distinguish real (Supabase-persisted) from partial/stub/planned.  
> **Rule:** Audit-only. NO code changes accompany this pass.

---

## Role Determination

1. User signs up via Clerk → selects "Auto Shop" in `ClerkAccountTypeSelector.tsx`
2. `user_type: "shop"` stored in Clerk metadata via `updateUserMetadata()`
3. Edge function syncs to Supabase `profiles.account_type = 'shop'`
4. `useUserData.ts` loads profile cloud-first → localStorage cache
5. `DashboardRouter.tsx` routes tabs/views based on `userType`
6. First login triggers `ShopOnboarding.tsx` (4-step business setup)

---

## Onboarding Flow (4 Steps)

| Step                            | Content                                                                | Status |
| ------------------------------- | ---------------------------------------------------------------------- | :----: |
| 1. Business Info                | Shop name, address, city/state/ZIP, phone, website                     |   ✅   |
| 2. Business Hours               | Operating hours (text or picker)                                       |   ✅   |
| 3. Certifications & Specialties | Multi-select: ASE, I-CAR, PPG, etc. + collision/dent/paint specialties |   ✅   |
| 4. Preferences & Submit         | Insurance toggle, turnaround estimate, review + submit                 |   ✅   |

**Completion:** Sets `profiles.setup_completed = true` in Supabase.  
**Light/dark:** All 4 steps are appearance-mode-aware (fixed in Pass 23).

---

## Navigation Tabs

| Tab         | Icon          | Target                                                          |
| ----------- | ------------- | --------------------------------------------------------------- |
| Home        | Dashboard     | `HomeScreen` — shop operations overview, map, quick actions     |
| Requests    | ClipboardList | `ShopRequestsScreen` — marketplace reports / incoming requests  |
| Estimates   | Mail          | `ShopEstimateInboxScreen` — estimate request inbox              |
| Active Jobs | Wrench        | `ShopActiveJobsScreen` — accepted jobs with status tracking     |
| Account     | User          | `AccountScreen` — business profile, certifications, preferences |

---

## Screen Inventory

| Screen            | Component                     | Functional | Mobile | Notes                                                       |
| ----------------- | ----------------------------- | :--------: | :----: | ----------------------------------------------------------- |
| Dashboard Home    | `HomeScreen.tsx`              |     ✅     |   ✅   | "Shop operations" eyebrow, request count, bids summary, map |
| Shop Onboarding   | `ShopOnboarding.tsx`          |     ✅     |   ✅   | 4-step flow, appearance-aware                               |
| Incoming Requests | `ShopRequestsScreen.tsx`      |     ✅     |   ✅   | Marketplace reports, search, filter, bid submission         |
| Estimate Inbox    | `ShopEstimateInboxScreen.tsx` |     ⚠️     |   ✅   | UI ready, Supabase persistence uncertain                    |
| Active Jobs       | `ShopActiveJobsScreen.tsx`    |     ✅     |   ✅   | Job cards with status progression                           |
| Account / Profile | `AccountScreen.tsx`           |     ✅     |   ✅   | Business info, certifications, specialties                  |
| Shop Directory    | `ShopDirectoryScreen.tsx`     |     ✅     |   ✅   | Browse competitor network                                   |
| Report Detail     | `ReportDetailScreen.tsx`      |     ✅     |   ✅   | Full report view from marketplace                           |

---

## Core Product Loop

```
Reports Appear in Marketplace → Shop Views → Submits Bid → Customer Accepts → Job Assigned
```

All steps are functional and Supabase-persisted.

---

## Marketplace & Bid Submission

### Browsing Reports

| Feature                                             | Status | Data Source                                    |
| --------------------------------------------------- | :----: | ---------------------------------------------- |
| Marketplace report list                             |   ✅   | `getMarketplaceReports()` → Supabase real-time |
| Search (customer/vehicle/damage)                    |   ✅   | Client-side string match                       |
| Status filter (new/bidding/accepted/closed)         |   ✅   | Client-side enum                               |
| Report cards (vehicle, damage, location, bid count) |   ✅   | Hydrated from `damage_reports`                 |
| Map preview of requests                             |   ✅   | Amber pins on MapLibre GL JS                   |
| Auto-sort (0-bid reports first)                     |   ✅   | Client-side sort                               |

### Bid Submission Flow

```
Shop clicks "Submit Bid" on request card
  → ShopBidModal opens (full-screen)
  → Pre-filled: shop name, vehicle, damage area
  → Input: amount ($), turnaround (days), description
  → Validation: amount > 0, days > 0, description required
  → POST /bids via submitBid()
  → Edge function creates bids record
  → Toast: "Bid submitted — customer notified"
  → Button changes to "See Bids"
```

| Feature                  | Status | Notes                                                               |
| ------------------------ | :----: | ------------------------------------------------------------------- |
| Bid form validation      |   ✅   | Min/max amount + required description                               |
| Bid submission           |   ✅   | Supabase edge function, throws on error (Pass 21-22)                |
| Error differentiation    |   ✅   | "not found" / "sign in" / "already have bid" / generic (Pass 21-22) |
| Bid confirmation         |   ✅   | Toast notification                                                  |
| Duplicate bid prevention |   ✅   | Edge function rejects if shop already has active bid on report      |

---

## Managing Submitted Bids

| Feature                                    | Status | Data Source                                   |
| ------------------------------------------ | :----: | --------------------------------------------- |
| Bid history                                |   ✅   | `getShopSubmittedBids(shopClerkUserId)`       |
| Status display (pending/accepted/rejected) |   ✅   | Enum badges                                   |
| Acceptance notification                    |   ✅   | Real-time via `useShopBidStatusNotifications` |
| Rejection notification                     |   ✅   | Same hook                                     |
| Customer contact on acceptance             |   ✅   | Email/phone shown                             |

---

## Estimate Requests

| Feature                            | Status | Notes                                                            |
| ---------------------------------- | :----: | ---------------------------------------------------------------- |
| Estimate inbox (incoming tab)      |   ✅   | Shows customer requests per card                                 |
| Estimate inbox (outgoing tab)      |   ⚠️   | UI exists, response persistence unclear                          |
| Shop response form (cost/timeline) |   ⚠️   | Form exists, Supabase handler may not be complete (TODO in code) |
| Customer notification of response  |   ✅   | Real-time via `useShopEstimateNotifications`                     |
| Accept/decline from customer       |   ⚠️   | Customer can respond but downstream job assignment unclear       |

---

## Active Jobs

| Feature               | Status | Data Source                                                            |
| --------------------- | :----: | ---------------------------------------------------------------------- |
| Job list              |   ✅   | Supabase `job_assignments` with joined report + bid                    |
| Status display        |   ✅   | Enum: scheduled / in_progress / awaiting_parts / completed / cancelled |
| Status update buttons |   ✅   | PATCH `job_assignments.status` via `updateJobAssignmentStatus()`       |
| Task progress         |   ✅   | Calculated from status (hardcoded task list)                           |
| Customer contact      |   ✅   | Hydrated from report + profiles                                        |
| Damage photos         |   ✅   | Via `report.photos[]`                                                  |
| Job location map      |   ✅   | MapLibre GL JS, centered at job address                                |

---

## Account & Business Profile

| Feature                                  | Status | Sync Target                                            |
| ---------------------------------------- | :----: | ------------------------------------------------------ |
| Edit business name/phone/website/address |   ✅   | Supabase `profiles`                                    |
| Edit certifications                      |   ✅   | JSON array in `profiles.certifications`                |
| Edit specialties                         |   ✅   | JSON array in `profiles.specialties`                   |
| Insurance toggle                         |   ✅   | Boolean `profiles.insurance_eligible`                  |
| Service areas                            |   ⚠️   | Layout exists, persistence to `shop_service_areas` TBD |
| Logo/photo upload                        |   ❌   | Not implemented                                        |
| Rating display                           |   ⚠️   | Shown on marketplace, calculation logic unclear        |
| Light/dark appearance toggle             |   ✅   | `AppearanceModeContext` + localStorage                 |

---

## Map Interactions

| Surface        | Component                | Features                                                      |
| -------------- | ------------------------ | ------------------------------------------------------------- |
| Home widget    | `ShopMapWidget`          | Shop location, nearby report pins (amber), network shops      |
| Marketplace    | `ShopRequestsScreen` map | All request pins, shop location                               |
| Shop Directory | `ShopDirectoryScreen`    | Competitor browse, distance comparison, cert/specialty filter |
| Job detail     | Embedded map             | Centered at job address                                       |

---

## Data Flow Summary

| Data                    | Source of Truth                     | Cache                      |     Real-Time     |
| ----------------------- | ----------------------------------- | -------------------------- | :---------------: |
| Marketplace reports     | Supabase `damage_reports`           | localStorage seed fallback |        ✅         |
| Submitted bids          | Supabase `bids`                     | —                          | ✅ (subscription) |
| Job assignments         | Supabase `job_assignments`          | —                          |        ✅         |
| Estimate requests       | Supabase `estimate_requests`        | —                          |        ✅         |
| Profile / business info | Supabase `profiles`                 | localStorage cache         |         —         |
| Onboarding state        | Supabase `profiles.setup_completed` | —                          |         —         |

---

## Demo vs. Real Data

- **Production:** All data from Supabase. Marketplace reports are live.
- **Demo mode** (`VITE_DEMO_MODE=true`): Seed reports injected if no real reports exist. No demo job assignments.
- No synthetic data in production UI.

---

## Known Gaps

| Issue                          | Priority | Detail                                                           |
| ------------------------------ | :------: | ---------------------------------------------------------------- |
| Estimate request persistence   |    P2    | Form exists but edge handler may not be fully wired; marked TODO |
| Service areas                  |    P3    | Config UI exists but geographic filtering not integrated         |
| Job assignment workflow events |    P2    | Created on bid acceptance, but event logging incomplete          |
| Rating calculation             |    P3    | Shown in UI but calculation algorithm undocumented               |
| Business hours                 |    P5    | Text field only, no time picker or validation                    |
| Logo/photo upload              |    P3    | Not implemented — affects marketplace credibility                |
| Offline browsing               |    P5    | Marketplace requires live Supabase for real-time reports         |
