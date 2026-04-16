# Role Audit — Insurer

> **Generated:** 2025-07-11 — Pass 25 (Track 3)  
> **Purpose:** Document every screen, feature, and data flow an Insurer user can reach. Distinguish real (Supabase-persisted) from partial/stub/planned.  
> **Rule:** Audit-only. NO code changes accompany this pass.

---

## Role Determination

1. User signs up via Clerk → selects "Insurer" in `ClerkAccountTypeSelector.tsx`
2. `user_type: "insurer"` stored in Clerk metadata via `updateUserMetadata()`
3. Edge function syncs to Supabase `profiles.account_type = 'insurer'`
4. `useUserData.ts` loads profile cloud-first → localStorage cache
5. `DashboardRouter.tsx` routes tabs/views based on `userType`
6. First login triggers `InsurerOnboarding.tsx` (3-step setup)

---

## Onboarding Flow (3 Steps)

| Step                 | Content                                                                                 | Status |
| -------------------- | --------------------------------------------------------------------------------------- | :----: |
| 1. Company Info      | Company name, license number, address, city/state/ZIP, phone, website                   |   ✅   |
| 2. Claims Management | Claim types multi-select, auto-approval toggle, max claim amount, shop partnership pref |   ✅   |
| 3. Review & Submit   | Summary → submit → sets `setup_completed: true`                                         |   ✅   |

**Claim types available:** Collision, Comprehensive, Liability, UIM, MedPay, PIP  
**Auto-approval:** UI toggle exists but enforcement logic not implemented (⚠️).

---

## Navigation Tabs

| Tab           | Icon      | Target                                                          |
| ------------- | --------- | --------------------------------------------------------------- |
| Home          | Dashboard | `HomeScreen` — claims overview, quick stats, recent claims, map |
| Claims        | Shield    | `InsurerClaimsScreen` — claim management dashboard              |
| Partner Shops | Building2 | `InsurerPartnerShopsScreen` — shop network management           |
| Account       | User      | `AccountScreen` — company profile, preferences                  |

---

## Screen Inventory

| Screen                           | Component                       | Functional | Mobile | Notes                                                      |
| -------------------------------- | ------------------------------- | :--------: | :----: | ---------------------------------------------------------- |
| Dashboard Home                   | `HomeScreen.tsx`                |     ✅     |   ✅   | "Claims overview" eyebrow, quick stats, recent claims, map |
| Insurer Onboarding               | `InsurerOnboarding.tsx`         |     ✅     |   ✅   | 3-step flow                                                |
| Claims Dashboard                 | `InsurerClaimsScreen.tsx`       |     ✅     |   ✅   | Search, filter, approve/deny, map                          |
| File New Claim                   | `InsurerNewClaimScreen.tsx`     |     ✅     |   ✅   | Manual claim entry form                                    |
| Partner Shops                    | `InsurerPartnerShopsScreen.tsx` |     ⚠️     |   ✅   | List + map, but partnership workflow TBD                   |
| Insurer Connection               | `InsurerConnectionScreen.tsx`   |     ⚠️     |   ✅   | Inquiry form, partial                                      |
| Account / Profile                | `AccountScreen.tsx`             |     ✅     |   ✅   | Company info, claim prefs                                  |
| Insurance Companies (cross-role) | `InsuranceCompaniesScreen.tsx`  |     ✅     |   ✅   | Customer-facing insurer directory                          |

---

## Core Product Loop (Insurer Perspective)

```
File Claim (or receive flagged report) → Review → Approve/Deny → Shop Assignment → Track
```

The approve/deny flow is functional. Shop assignment after approval is partially wired.

---

## Claims Management

### Browsing Claims

| Feature                                               | Status | Data Source                                              |
| ----------------------------------------------------- | :----: | -------------------------------------------------------- |
| Claims list                                           |   ✅   | Supabase `damage_reports` WHERE `insurance_claim = true` |
| Search (customer/claim number/vehicle/policy)         |   ✅   | Client-side string match                                 |
| Status filter (pending/reviewing/approved/denied)     |   ✅   | Client-side enum                                         |
| Claim cards (customer, vehicle, damage, status badge) |   ✅   | Hydrated from `damage_reports`                           |
| Map preview of claims                                 |   ✅   | Amber pins on MapLibre GL JS                             |

### Claim Approval Flow

```
Insurer clicks "Approve" on claim card
  → InsurerClaimApprovalModal
  → Confirm customer identity
  → Input: approved amount ($)
  → Input: coverage details (optional notes)
  → "Approve" button
  → PATCH /damage_reports/{reportId}
    { claim_status: "approved", approved_amount, claim_decision_date, approver_id }
  → Workflow event logged: "claim_approved"
  → Toast: "Claim approved, customer notified"
```

### Claim Denial Flow

```
Insurer clicks "Deny" on claim card
  → InsurerClaimDenialModal
  → Confirm customer identity
  → Input: denial reason (required)
  → "Deny" button
  → PATCH /damage_reports/{reportId}
    { claim_status: "denied", denial_reason, claim_decision_date }
  → Workflow event logged: "claim_denied"
  → Toast: "Claim denied, customer notified"
```

| Feature                | Status | Notes                                                   |
| ---------------------- | :----: | ------------------------------------------------------- |
| Approve with amount    |   ✅   | Updates `damage_reports` + logs workflow event          |
| Deny with reason       |   ✅   | Updates `damage_reports` + logs workflow event          |
| Approval/denial modals |   ✅   | React Motion UI, form validation                        |
| Workflow event logging |   ✅   | Creates audit trail records                             |
| Customer notification  |   ⚠️   | DB updated, but email/SMS notifications not implemented |

---

## Filing New Claims

| Feature                      | Status | Notes                                                               |
| ---------------------------- | :----: | ------------------------------------------------------------------- |
| Manual claim form            |   ✅   | Customer name/email/phone, policy number, vehicle, damage, location |
| Form validation              |   ✅   | Required fields enforced                                            |
| Auto-generated claim numbers |   ✅   | Server-side via edge function                                       |
| Claim creation               |   ✅   | Creates `damage_reports` with `insurance_claim: true`               |
| Location geocoding           |   ✅   | ZIP code → lat/lng lookup                                           |
| Mobile layout                |   ✅   | Single column, scrollable form                                      |

---

## Partner Shop Management

| Feature                        | Status | Notes                                                                     |
| ------------------------------ | :----: | ------------------------------------------------------------------------- |
| Partner shop list              |   ✅   | Supabase `public_partner_shops` query                                     |
| Shop detail view               |   ✅   | Certifications, specialties, rating, phone                                |
| Map of partner shops           |   ✅   | Blue pins on MapLibre GL JS                                               |
| Add prospect (manual tracking) |   ⚠️   | `AddProspectModal` + `ManualProspectCard` — UI ready, persistence unclear |
| Prospect status tracking       |   ⚠️   | Contacted/Interested/Negotiating/Partnered/Rejected — UI only             |
| Add/remove partner             |   ⚠️   | No clear "approve partnership" workflow; relationship table may not exist |
| Certification filter           |   ⚠️   | UI element exists, filter logic may not be hooked                         |

---

## Account & Company Profile

| Feature                                 | Status | Sync Target                            |
| --------------------------------------- | :----: | -------------------------------------- |
| Edit company name/phone/website/address |   ✅   | Supabase `profiles`                    |
| Edit license number                     |   ✅   | Supabase `profiles`                    |
| Edit claim types                        |   ✅   | JSON array in profile                  |
| Auto-approval toggle                    |   ⚠️   | UI exists, enforcement not implemented |
| Max claim amount                        |   ✅   | Dollar threshold stored                |
| Light/dark appearance toggle            |   ✅   | `AppearanceModeContext` + localStorage |

---

## Map Interactions

| Surface       | Component          | Features                                             |
| ------------- | ------------------ | ---------------------------------------------------- |
| Home widget   | `InsurerMapWidget` | Partner shop pins (blue) + recent claim pins (amber) |
| Claims view   | Embedded map       | All claim locations                                  |
| Partner Shops | Embedded map       | All partner shop locations                           |
| Claim detail  | Embedded map       | Centered at claim address                            |

---

## Data Flow Summary

| Data                    | Source of Truth                     | Cache                      | Real-Time |
| ----------------------- | ----------------------------------- | -------------------------- | :-------: |
| Claims (damage_reports) | Supabase                            | localStorage seed fallback |    ✅     |
| Partner shops           | Supabase `public_partner_shops`     | —                          |     —     |
| Workflow events         | Supabase `workflow_events`          | —                          |     —     |
| Profile / company info  | Supabase `profiles`                 | localStorage cache         |     —     |
| Onboarding state        | Supabase `profiles.setup_completed` | —                          |     —     |
| Manual prospects        | ⚠️ Unclear                          | —                          |     —     |

---

## Demo vs. Real Data

- **Production:** Claims queried from Supabase. Partner shops from live data.
- **Demo mode** (`VITE_DEMO_MODE=true`): Seed claims injected if none exist. Demo partner shops from hardcoded reference list.
- No synthetic data in production UI.

---

## Known Gaps

| Issue                                  | Priority | Detail                                                                       |
| -------------------------------------- | :------: | ---------------------------------------------------------------------------- |
| Customer notification on approve/deny  |    P2    | DB updated, but no email/SMS delivery mechanism                              |
| Partner shop management workflow       |    P2    | No "approve partnership" action; relationship table unclear                  |
| Manual prospect persistence            |    P3    | UI built but Supabase storage/retrieval not verified                         |
| Auto-approval rule enforcement         |    P3    | Toggle exists in UI/profile but no automated claim processing                |
| Claim-to-shop assignment               |    P3    | After approval, shop assignment workflow is incomplete                       |
| Insurer onboarding gating              |    P4    | `setup_completed` flag set, but unclear what downstream behavior it gates    |
| `InsurerPartnershipPage.tsx` (landing) |    P0    | Hardcoded light mode — completely broken in dark mode (see Light/Dark Audit) |
