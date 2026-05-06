# BidOnDent Full Audit — 2026-05-04 (Sonnet 4.6)

**Branch:** `BidOnDent-Horizon-Beta`  
**Date:** 2026-05-04  
**Auditor:** GitHub Copilot (Claude Sonnet 4.6 / Mola's Coder mode)  
**Mode:** AUDIT ONLY — No file edits, no commits, no fixes.  
**Dev server:** `http://localhost:5173` (Vite 6)  
**Cloud project:** Supabase `wmdcnjgtsppftrofaqqa` (edge function v50)  
**Authenticated user audited as:** Molalign Meagher (molalign5@gmail.com) — Car Owner role

---

## Audit Scope

Evidence-based audit of BidOnDent's current state across:

1. Visual canon adherence (LAW Light-Mode Surface Rule + Premium Gold Palette)
2. UX flow integrity (dashboard, report flow, bids, account, landing, full map)
3. Functional correctness (data, storage, auth, API)
4. Code-level checks (forbidden colors, storage leaks, verify_jwt)

**Surfaces audited:**

- Dashboard (light mode + dark mode)
- Report creation flow (Step 1 of 5)
- Bids tab (dark mode)
- Account tab (dark mode + light mode)
- Appearance Settings modal
- Landing page (dark mode + light mode, full scroll)
- Full map experience (Smart Map, Recommended Shops)
- Error boundary (code review)
- Coverage map (landing page)
- CTA and footer sections

**Surfaces NOT audited (limitations):**

- Mobile viewport (VS Code integrated browser cannot honor `page.setViewportSize()` — all captures at ~1329px desktop. Mobile behavior CANNOT be verified in this environment.)
- Shop dashboard (no shop account available)
- Insurer dashboard (no insurer account available)
- Report Steps 2–5 (deferred after Step 1 confirmation)
- Notifications panel (no in-app notification triggered)
- Report detail screen deep-dive

---

## Summary Ranking Table

| ID   | Priority       | Category          | Surface                      | Description                                                                                                                              | Status  |
| ---- | -------------- | ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| F-24 | **P2-DATA**    | Demo data as real | Full map / Recommended Shops | All 15 "recommended shops" are hardcoded demo seed data — fake ratings, fake reviews, fake certifications. No Supabase shop integration. | **NEW** |
| F-04 | **P1-RUNTIME** | API 500 error     | Appearance Settings          | `GET /notification-preferences` returns 500. Client circuit-breaker suppresses for 60s. Root cause: cloud DB schema issue.               | **NEW** |
| F-16 | **P1-RUNTIME** | Auth persistence  | Sign-out flow                | Clerk session persists after "Log Out" click; user re-authenticates on next page interaction without re-entering credentials.            | **NEW** |
| F-03 | **P2-DATA**    | Test data quality | Dashboard + map popup        | Cat photo used as damage report thumbnail for 2014 Mazda Mazda6. Visible on dashboard AND in map popup.                                  | **NEW** |
| F-02 | **P2-DATA**    | KI-064 OPEN       | Dashboard / report cards     | 2023 Honda Accord thumbnail shows placeholder mountain icon. KI-064 still open — awaiting owner DB action.                               | Known   |
| F-01 | **P6-SPELL**   | Data typo         | Everywhere                   | "2021 Toyoto Camry" (Toyoto → Toyota) across dashboard, account, bids subtitle, report flow vehicle selector.                            | **NEW** |
| F-14 | **P4-UX**      | Trust             | Landing footer               | `bidondent@gmail.com` as contact email looks less professional than a domain email.                                                      | **NEW** |
| F-18 | **P4-UX**      | Canon deviation   | Error boundary               | `rgba(255,255,255,0.82)` + `bg-white` in error recovery screen (`src/main.tsx`). Only visible on fatal crash.                            | **NEW** |
| F-12 | **P4-UX**      | Section seams     | Landing page                 | Hard color transitions between cool-blue and warm-amber sections. Multiple sharp seams.                                                  | **NEW** |
| F-15 | **P4-UX**      | Map visual        | Landing hero (light)         | Demo map in hero renders very pale/light in light mode — less impactful than dark mode version.                                          | **NEW** |

---

## CONFIRMED PASSES (canon compliance)

| Check                                                              | Result                        |
| ------------------------------------------------------------------ | ----------------------------- |
| Zero pure `rgb(255,255,255)` backgrounds in dashboard (light mode) | ✅ PASS — 0 white bg elements |
| Zero pure `rgb(255,255,255)` backgrounds on landing (light mode)   | ✅ PASS — 0 white bg elements |
| Forbidden previous-gen gold values in source code                  | ✅ PASS — 0 matches           |
| `verify_jwt = false` in `supabase/config.toml`                     | ✅ CONFIRMED                  |
| `storage://` pointer guards in all image-rendering components      | ✅ CONFIRMED                  |
| Dashboard dark mode atmospheric gold glow                          | ✅ KI-073 CONFIRMED RESOLVED  |
| Compare tile peach blush in dark mode (KI-086)                     | ✅ CONFIRMED RESOLVED         |
| Dashboard scroll-past (KI-076)                                     | ✅ CONFIRMED RESOLVED         |
| Landing `About` section `#ffffff` background (KI-090)              | ✅ CONFIRMED RESOLVED         |
| `bg-white` solid usage — dashboard components                      | ✅ PASS — 0 matches           |
| Dashboard light mode warm hero panel on cool canvas                | ✅ CANON COMPLIANT            |
| Dashboard light mode Quick Action tiles (warm/cool distinction)    | ✅ CANON COMPLIANT            |

---

## Detailed Findings

---

### F-24 — P2-DATA — DEMO SHOP DATA SHOWN AS REAL RECOMMENDATIONS

**Priority:** P2-DATA (data integrity, soft launch trust)  
**Surface:** Full map experience → "RECOMMENDED SHOPS" section  
**Severity:** High for trust/readiness

**Evidence:**  
`src/app/services/intelligence/marketSeedShops.ts` defines `CORE_SHOPS` — an array of hardcoded demo shops (Express Auto Body, Premium Collision Center, Elite Auto Works, etc.) with fabricated ratings (4.8–4.9), fabricated review counts (91–203), fabricated certifications (ASE Certified, I-CAR Gold Class, Mercedes Certified, Porsche Approved, Jaguar Land Rover Authorized), Unsplash stock photos, and fabricated completion rates (98–99%).

`src/app/services/intelligence/marketIntelligence.ts`:

```typescript
import { SHOPS } from "./marketSeedData"; // imports CORE_SHOPS
export function getShopDirectory() { return SHOPS; }
export function buildShopRecommendations(...) {
  const recommendations = SHOPS.filter(...).map(...) // only uses seed data
```

The full map view shows "15 results" of recommended shops — all are seed data. A user can click "Request Estimate", "Save for bids", or "Start Navigation" on these non-existent shops.

**Impact:** Customers see a fully-populated marketplace with professional shops, ratings, and certifications that do not exist. If a customer tries to "Request Estimate" from Express Auto Body, nothing real happens. This misrepresents the marketplace's actual shop inventory during soft launch.

**Root cause:** `buildShopRecommendations()` uses `SHOPS` from `marketSeedData.ts` exclusively. There is no Supabase shop query or hybrid real+demo approach.

**Fix direction:** Either (a) replace with real shop data from Supabase, (b) suppress the recommended shops section until real shops are onboarded, or (c) add a prominent "Demo data — coming soon" label to the section.

---

### F-04 — P1-RUNTIME — NOTIFICATION PREFERENCES 500 ERROR

**Priority:** P1-RUNTIME  
**Surface:** Appearance Settings modal → loads `GET /notification-preferences`  
**Severity:** Medium — notification preferences unavailable, circuit breaker active

**Evidence:**  
Console error: `[error] Failed to load resource: the server responded with a status of 500 ()`  
Triggered when Appearance Settings dialog is opened.

Client-side service (`src/app/services/supabase/notificationPreferences.ts`) has a circuit breaker:

```typescript
let cachedFailure: { until: number } | null = null;
const FAILURE_BACKOFF_MS = 60_000;

export async function getNotificationPreferences() {
  if (cachedFailure && Date.now() < cachedFailure.until) {
    throw new Error("notification-preferences temporarily unavailable");
  }
  // ... makes API call
  // on failure: cachedFailure = { until: Date.now() + FAILURE_BACKOFF_MS };
```

The `notification_preferences` table exists in migrations (`20251230000001_full_schema.sql`) with the correct schema. The edge function handler (`server/handlers/notification_preferences.ts`) uses `requireClerkSession()` + service role Supabase client.

**Possible root causes:**

1. Table `notification_preferences` does not exist on the cloud production Supabase project (schema not applied)
2. Schema mismatch between migrations and the deployed production DB (column exists in migration, absent in prod)
3. Edge function v50 has a runtime error (check Supabase function logs)

**Impact:** Notification preferences are inaccessible. The 60-second circuit breaker suppresses error noise but also means user preferences cannot be read or saved for a minute after the first failure.

---

### F-16 — P1-RUNTIME — CLERK SESSION PERSISTS AFTER LOG OUT

**Priority:** P1-RUNTIME  
**Surface:** Sign-out flow  
**Severity:** Medium — user trust, session hygiene

**Evidence:**  
After clicking "Log Out" via the user dropdown menu → "Log Out" menu item, the app navigated to the landing page in a logged-out state (confirmed via screenshot: "Login" / "Get Started" buttons visible). However, after clicking the appearance mode toggle on the landing page, the authenticated state was restored without the user re-entering credentials. The landing page then showed "Dashboard" button and profile photo (authenticated state).

**Root cause (likely):** Clerk's session token persisted in browser storage (cookie or localStorage) despite the `signOut()` call. The appearance toggle triggered a re-render, and Clerk's SDK re-hydrated the active session from the persisted token.

**Note:** This behavior may differ between development and production environments. Clerk sessions are typically long-lived and device-persistent by design. In production, the user may need to use Clerk's full sign-out flow (clearing all devices) to terminate the session.

**Verification needed:** Test the log-out flow in a private/incognito browser tab to confirm whether the session truly ends or persists across page loads.

---

### F-03 — P2-DATA — CAT PHOTO AS DAMAGE REPORT THUMBNAIL

**Priority:** P2-DATA (test data quality, trust)  
**Surface:** Dashboard report cards + Full map popup  
**Severity:** Medium — visible to the logged-in user (and to any shop reviewing reports)

**Evidence:**  
The "2014 Mazda Mazda6" damage report (Mar 28, 2026, "Front bumper") displays an orange tabby cat photo as its thumbnail on:

- Dashboard "Your Reports" section
- Full map experience popup when the report pin is opened

This was an owner test upload (non-damage photo submitted during development). The `ImageWithFallback` component renders it correctly — the issue is the data content, not the code.

**Impact:** A body shop reviewing incoming customer reports would see a cat photo for a "front bumper" repair request. Undermines professional credibility. Should be replaced or deleted before soft launch customer demos.

---

### F-01 — P6-SPELL — "TOYOTO" TYPO ACROSS ALL SURFACES

**Priority:** P6-SPELL (user-facing data quality)  
**Surface:** Dashboard, Account, Bids tab, Report flow  
**Severity:** Low-Medium — visible typo on production-facing content

**Evidence:**  
The 2021 Toyota Camry vehicle record was saved with the make field as "Toyoto" (misspelled). This propagates to every display of this vehicle/report:

- Dashboard "Your Reports": `"2021 Toyoto Camry"` in report card heading (h3)
- Bids tab header: `"2 bids for 2023 Honda Accord"` — but the separate 2021 Camry report shows "Toyoto"
- Account tab "Vehicles" section: `"2021 Toyoto Camry"` in the vehicle list
- Report creation flow (Step 1): Vehicle selector button shows `"2021 Toyoto Camry"`, and the "Make \*" text field pre-fills with "Toyoto" (placeholder shows the correct "Toyota")

**Root cause:** User-entered data stored verbatim with no make validation or autocorrection. The Make input placeholder correctly shows "Toyota" — so the field hint is correct but there's no enforcement.

**Fix direction:** (a) Owner action: Update the `vehicles` table record for this entry. (b) Code improvement (optional): Add a make validation/autocorrection against a canonical makes list for the vehicle entry form.

---

### F-14 — P4-UX — GMAIL CONTACT EMAIL IN FOOTER

**Priority:** P4-UX (trust, professional credibility)  
**Surface:** Landing page footer  
**Severity:** Low

**Evidence:**  
The landing page footer displays `bidondent@gmail.com` as the primary contact email. For a professional auto repair marketplace claiming premium brand positioning, a Gmail address signals a pre-launch or hobby project rather than an established business.

**Fix direction:** Replace with a domain-based email (e.g., `contact@bidondent.com` or `support@bidondent.com`) before soft launch customer demos.

---

### F-18 — P4-UX — ERROR BOUNDARY USES NEAR-WHITE BACKGROUNDS

**Priority:** P4-UX (minor canon deviation)  
**Surface:** Error boundary recovery screen (`src/main.tsx`)  
**Severity:** Very Low — only visible during catastrophic React crashes

**Evidence:**  
`src/main.tsx` GlobalErrorBoundary `render()` method:

```tsx
// Outer wrapper
<div className="min-h-screen bg-[#eef2f7] ..."> // cool blue-gray ✅

// Card panel — inline style uses rgba(255,255,255,...)
style={{
  background: "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(241,245,249,0.64))",
  backdropFilter: "blur(20px)",
}}

// "Reload Page" secondary button
className="... bg-white px-5 py-2.5 ..."
```

The outer wrapper uses `#eef2f7` (cool blue-gray — correct). But the card panel gradient starts at `rgba(255,255,255,0.82)` and the secondary button uses solid `bg-white`. Per LAW, no pure white panel backgrounds.

**Fix direction:** Replace `rgba(255,255,255,0.82)` with `rgba(248,250,255,0.82)` (slight cool tint) and `bg-white` with `bg-[rgba(248,250,255,0.82)]` or similar. Only shown on catastrophic failure — very low urgency.

---

### F-12 — P4-UX — HARD SECTION TRANSITIONS ON LANDING PAGE

**Priority:** P4-UX (cosmetic visual quality)  
**Surface:** Landing page (light mode and dark mode)  
**Severity:** Low

**Evidence:**  
The landing page has multiple atmospheric sections with distinct background temperatures:

1. Hero: Cool blue-gray with warm gold lamp (top-right glow)
2. "How It Works": Cool dark navy (dark mode) / cool blue-gray (light mode)
3. "Why Choose BidOnDent?": Warm amber/cream section
4. "Who We Serve": Cool navy (dark mode) / cool blue-gray (light mode)
5. Process/Trust: Warm amber
6. "About BidOnDent": Cool navy
7. Coverage Map: Cool navy
8. "Ready to Get Started?": Dark navy CTA panel

The transitions between warm amber sections and cool navy sections create visible hard seams — particularly between "How It Works" and "Why Choose BidOnDent?", and between "Why Choose BidOnDent?" and "Who We Serve".

**Assessment:** This may be intentional design (distinct atmospheric zones). However, the seams look abrupt especially in dark mode. Gradient fade overlays at section boundaries would improve the flow.

---

### F-15 — P4-UX — LANDING HERO DEMO MAP PALE IN LIGHT MODE

**Priority:** P4-UX (cosmetic)  
**Surface:** Landing page hero (light mode) — right-side demo map  
**Severity:** Very Low

**Evidence:**  
In dark mode, the landing hero demo map has rich, atmospheric dark tiles with the routing visualization creating visual contrast. In light mode, the map renders with very pale/light-tan tiles and the routing lines are barely visible against the light background. The "Sample quote" and "Estimated ETA" chips render on a very light background.

**Impact:** The light mode hero map is less visually compelling than the dark mode version. The demo map's impact is reduced.

---

## Architecture / Security Checks

### Auth Contract

- `verify_jwt = false` in `supabase/config.toml [functions.server]` — **CONFIRMED CORRECT**
- Edge functions use `requireClerkSession()` for JWT verification at the handler level
- Gateway does not attempt to verify Clerk JWTs at the Supabase gateway layer
- **Status:** ✅ Auth contract intact

### Storage URL Handling

- `storage://bucket/path` pointers confirmed in use (not signed URLs persisted)
- All image-rendering components guard against `storage://` with `startsWith("storage://")` checks:
  - `DashboardHeader.tsx:432`
  - `DashboardSidebar.tsx:272`
  - `ImageWithFallback.tsx:14` (both `codelayer` and `figma` versions)
  - `EditProfileModal.tsx:133`
- `hydrateSignedStorageUrl()` called on read paths in edge functions
- **Status:** ✅ Storage pattern correctly implemented

### Visual Canon — Forbidden Previous-Gen Colors

Grep check across all `src/**/*.{ts,tsx,css}`:

- `rgba(220, 165, 90, *)` — **0 matches** ✅
- `rgba(254, 248, 220, *)` — **0 matches** ✅
- `rgba(160, 95, 25, *)` — **0 matches** ✅
- `rgba(253, 224, 124, *)` — **0 matches** ✅
- `rgba(220, 140, 50, *)` — **0 matches** ✅

### Pure White Background Surfaces

- Dashboard light mode computed check: **0 pure `rgb(255,255,255)` backgrounds** ✅
- Landing page light mode computed check: **0 pure `rgb(255,255,255)` backgrounds** ✅
- Near-white elements use `rgba(255, 251, 245, 0.50–0.82)` (warm cream, partial alpha, on interactive controls) — acceptable

### Premium Gold Palette in Use

Active values confirmed in `theme.css`:

- Top lamp: `rgba(196, 144, 65, 0.16–0.24)` — **present** ✅
- Gold inset: `rgba(252, 238, 204, 0.7)` — **present** ✅
- Bronze trim: `rgba(140, 82, 22, 0.28–0.55)` — **present** ✅
- Outer halo: `rgba(196, 130, 45, 0.18–0.22)` — **present** ✅

### Known Issues — Confirmed Status

| KI             | Issue                                 | Status per Audit                                                             |
| -------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| KI-064         | Honda Accord thumbnail placeholder    | ✅ STILL OPEN — confirmed                                                    |
| KI-052         | Demo route synthetic time/distance    | ✅ STILL OPEN — confirmed (Route panel shows synthetic data)                 |
| KI-057         | Realtime StrictMode WebSocket cycling | ✅ STILL OPEN — WebSocket warning observed in console during full map scroll |
| KI-073         | Dashboard atmosphere gold glow        | ✅ CONFIRMED RESOLVED                                                        |
| KI-076         | Dashboard scroll-past                 | ✅ CONFIRMED RESOLVED                                                        |
| KI-079         | Bottom nav inactive tabs readable     | ✅ CONFIRMED RESOLVED                                                        |
| KI-086         | Compare card peach blush (dark mode)  | ✅ CONFIRMED RESOLVED                                                        |
| KI-090         | About section `#ffffff` background    | ✅ CONFIRMED RESOLVED                                                        |
| KI-091/092/093 | Pass H/I/J canon adoption             | ✅ CONFIRMED RESOLVED                                                        |

---

## Mobile Audit — LIMITATION NOTE

**Mobile viewport emulation is NOT functional in the VS Code integrated browser.** Despite calling `page.setViewportSize({ width: 375, height: 812 })`, the actual `window.innerWidth` remained 1329px. `page.emulate()` is not supported (TypeError). All screenshots in this audit are at ~1329px desktop viewport.

**Mobile-specific behavior CANNOT be verified from this environment.** To audit mobile, an external browser with proper mobile emulation (Chrome DevTools device mode, Firefox responsive design mode, or a physical device) is required.

All KI items related to mobile should be verified in a proper mobile environment before soft launch.

---

## Open Risk Summary

| Risk                                           | Severity   | Blocking Soft Launch?                                  |
| ---------------------------------------------- | ---------- | ------------------------------------------------------ |
| Demo shops shown as real marketplace inventory | HIGH       | ⚠️ YES — misleads users about actual shop availability |
| Notification preferences 500 error             | MEDIUM     | No, but degrades Appearance Settings UX                |
| Clerk session persists after log-out           | MEDIUM     | Requires investigation in production                   |
| Cat photo on damage report                     | LOW-MEDIUM | No, but visible during demos                           |
| "Toyoto" typo in user data                     | LOW        | No, but visible on premium product                     |
| Gmail contact email in footer                  | LOW        | No, but affects professional credibility               |
| Error boundary pure-white backgrounds          | VERY LOW   | No                                                     |

---

## Best Next Pass Recommendation

**Pass — Demo Shop Data Audit + Gating**

The highest-impact next action is to investigate and address the demo shop data situation (F-24). Specifically:

1. Confirm whether `buildShopRecommendations()` is expected to use only seed data (acceptable for demo/preview phase) or whether it should query real Supabase shops.
2. If seed data is intentional for soft launch: Add a clear "Demo — partner shops coming soon" indicator to the Recommended Shops section header to set honest user expectations.
3. If real data should be shown: Wire the shop recommendation service to query the `businesses`/`shops` table from Supabase instead of `CORE_SHOPS`.

Secondary: Investigate the `notification-preferences` 500 error by checking Supabase function logs and confirming the table exists in the production DB (`SELECT COUNT(*) FROM public.notification_preferences`).

---

_End of audit. Branch: `BidOnDent-Horizon-Beta`. Date: 2026-05-04. No files were modified during this audit._
