# BidOnDent Product Brain — Archived Experience Maps

**Archived:** April 2, 2026 (Pass 537 — Documentation System Cleanup)
**Source:** BIDONDENT_PRODUCT_BRAIN.md, lines 701-1158
**Reason:** Screen-by-screen CTA maps are valuable reference but add 458 lines of bulk to the active Product Brain. Archived for on-demand reference.

---

## Customer Experience Map

### Customer Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `New Repair Request`

Quick actions:

- `New Repair Request`
- `View Bids`
- `Connect Insurance`
- `Find Shops`

Recent list behavior:

- recent reports are shown
- clicking a report opens detail flow

Stats shown:

- active requests
- total bids received
- completed repairs
- money saved

### Damage Report Flow

Main file:

- `src/app/components/codelayer/ReportScreen.tsx`

Substeps:

- `StepVehicleInfo.tsx`
- `StepDamageArea.tsx`
- `StepPhotos.tsx`
- `StepDescription.tsx`
- `StepComplete.tsx`

What the flow does:

- saves a draft in localStorage
- lets users pick a saved vehicle or enter one manually
- lets users choose damage area
- prompts photo guide before photo upload if needed
- compresses photos aggressively before upload
- attempts cloud upload to Supabase storage
- falls back to base64/local state if needed
- submits a report to the edge function

Key buttons by step:

- vehicle step:
  - select saved vehicle
  - `Continue`
- damage step:
  - area buttons
  - `Back`
  - `Continue`
- photos step:
  - `Take Photo`
  - `Upload Photo`
  - per-photo remove button
  - `Back`
  - `Continue`
- description step:
  - `Back`
  - `Continue`
- complete step:
  - `View My Reports`
  - `Back to Dashboard`

### Photo Guide

File:

- `src/app/components/shop/PhotoGuide.tsx`

Even though it lives in the shop folder, it is part of the customer report experience.

This is a good reminder not to assume folder names always tell the whole story.

### Bids Screen

File:

- `src/app/components/codelayer/BidsScreen.tsx`

Current behavior:

- shows sample bids
- allows sorting by:
  - all
  - lowest price
  - fastest
  - highest rated
- expandable bid cards
- per-bid controls:
  - `Accept Bid`
  - call icon
  - message icon
  - external-link icon
  - rating/thumbs-up action for customers

Important reality:

- this screen is currently presentation-heavy and sample-data driven

### Reports List

File:

- `src/app/components/reports/ReportsListScreen.tsx`

Main controls:

- back button
- filter tabs:
  - all
  - pending
  - active
  - completed
- click report card -> report detail
- click photo thumbnail -> lightbox/gallery

### Report Detail

File:

- `src/app/components/reports/ReportDetailScreen.tsx`

Main sections:

- damage photos
- vehicle information
- damage description
- submission details
- interested shops

Current CTA on bid-ready shop cards:

- `View Bid`

Important reality:

- interested shop list is mock/sample data

### Vehicles

File:

- `src/app/components/shop/VehicleProfileScreen.tsx`

This is a customer-facing vehicle manager despite living in `components/shop`.

Main controls:

- back
- `Add Vehicle`
- edit icon
- delete icon
- form:
  - `Cancel`
  - `Save Vehicle`
- empty state:
  - `Add Your First Vehicle`

### Favorite Shops

File:

- `src/app/components/shop/LikedShopsScreen.tsx`

Controls:

- back
- unlike heart
- `Request Quote`
- call icon
- message icon

### Connect Insurance

File:

- `src/app/components/insurer/InsurerConnectionScreen.tsx`

This is customer-facing despite the insurer folder placement.

Controls:

- back
- search insurers
- select insurer
- connect modal:
  - enter policy number
  - optional claim number
  - `Cancel`
  - `Connect`

## Shop Experience Map

### Shop Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `View Requests`

Quick actions:

- `Open Requests`
- `Active Jobs`
- `Competitors`
- `Browse Insurers`

Stats:

- open requests
- active jobs
- completed jobs
- potential revenue

Important reality:

- shop home receives seeded reports from constants rather than truly live marketplace data

### Requests

File:

- `src/app/components/shop/ShopRequestsScreen.tsx`

Main controls:

- search
- filters:
  - all
  - new
  - bidding
  - closed
- call customer
- email customer
- `Submit Bid`
- bid modal:
  - bid amount input
  - `Cancel`
  - `Submit Bid`

Important reality:

- request list is sample data inside the component
- this is not yet a clean live request board

### Active Jobs

File:

- `src/app/components/shop/ShopActiveJobsScreen.tsx`

Main controls:

- search
- status filters
- call
- email
- message
- `View Full Details`
- modal close

Important reality:

- jobs are sample data inside the component

### Competitor Analysis

File:

- `src/app/components/reports/CompetitorAnalysisScreen.tsx`

Main controls:

- back
- search
- sort by rating/jobs/distance

Purpose:

- market awareness for shops

### Insurance Company Directory

File:

- `src/app/components/insurer/InsuranceCompaniesScreen.tsx`

For shop users, this becomes a partner prospecting surface.

Main controls:

- back
- search
- filters
- per-company CTA:
  - `Partner`

## Insurer Experience Map

### Insurer Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `Start New Claim`

Quick actions:

- `View Claims`
- `Create New Claim`
- `Partner Shops`
- `Browse Insurers`

Stats:

- active claims
- claims resolved
- partner shops
- average cycle time

### Claims Management

File:

- `src/app/components/insurer/InsurerClaimsScreen.tsx`

Main controls:

- search
- filters:
  - all
  - pending
  - reviewing
  - approved
  - denied
- call customer
- email customer
- details button
- pending claims:
  - `Review & Approve`
- approval modal:
  - approved amount input
  - `Cancel`
  - `Approve Claim`

Important reality:

- claims list is sample data inside the component

### Partner Shops

File:

- `src/app/components/insurer/InsurerPartnerShopsScreen.tsx`

Main controls:

- search
- filters
- `Add Shop`
- per-shop:
  - call
  - email
  - mapped shops: `BidOnDent Maps`
  - manual prospects: `Export Directions`
- add-shop modal:
  - shop info fields
  - specialty toggles
  - certification toggles
  - `Cancel`
  - `Add Partner Shop`

Important reality:

- partner network data is sample data inside the component

### New Claim

File:

- `src/app/components/insurer/InsurerNewClaimScreen.tsx`

Main controls:

- back
- role tab switch:
  - `Policyholders`
  - `Auto Shops`
- search
- customer cards:
  - call
  - email
  - message
  - `Create Claim for <name>`
- shop cards:
  - call
  - email
  - message
  - `Assign to Claim`
- claim modal:
  - policy number
  - incident date
  - damage description
  - estimated amount
  - priority
  - `Cancel`
  - `Create Claim`

Important reality:

- creation UI exists
- component is sample-data driven

## Admin And Devtools

Key files:

- `src/app/components/admin/*`
- `src/app/config/adminConfig.ts`
- `src/app/utils/adminCheck.ts`
- `src/app/components/devtools/*`

What exists:

- admin dashboard
- linked test accounts
- bulk user management
- edge function health checks
- database verification
- storage inspection / monitoring
- admin promotion/demotion tools

What to remember:

- admin code is real repo surface area
- but it is intentionally marked as removable for production
