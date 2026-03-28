# BidOnDent — Design & UI Continuation Prompt

**Last updated:** March 28, 2026
**Status:** Historical superseded prompt

> **SUPERSEDED** — This doc is historical. The current master context is [`CLAUDE_AI_MASTER_CONTEXT.md`](CLAUDE_AI_MASTER_CONTEXT.md). Read that first. The passes listed here (1–7) are all complete.

**For: Claude Code (design AI) continuing autopilot in a new chat**
**Date: 2026-03-25**
**Branch: `feature/platform-bugfix-sweep-by-MolandJesus`**
**Last committed pass: 221 (commit `7faa568a`)**
**Next pass number: 222**

---

## CRITICAL: READ MEMORY FILES FIRST

Before doing anything, read the two memory files that define your behavior:

1. **`~/.claude/projects/.../memory/feedback_autopilot_rules.md`** — Strict autopilot execution discipline: no scope creep, one pass at a time, decision filters
2. **`~/.claude/projects/.../memory/feedback_design_identity.md`** — BidOnDent design identity: calm/premium/map-first, blue system rules, what to avoid

These are law. Every pass must satisfy the primary filter: _"Does this make the site feel more central, more premium, more breathable, and more distinctly BidOnDent?"_

---

## WHAT ANOTHER AI IS WORKING ON (DO NOT TOUCH)

A separate AI is handling backend/service work on these files. **Never edit them:**

- `supabase/functions/server/**` — all edge function code
- `src/app/services/**/*.ts` — all service layer files
- `src/app/services/__tests__/**` — tests
- `src/app/hooks/useUserData.ts` — data fetching logic (you can read but don't edit)
- `src/app/hooks/userDataActions.ts` / `userDataUtils.ts` / `useUserDataHelpers.ts`
- `src/app/hooks/useAuth.ts`
- `src/app/utils/photoUtils.ts`
- `src/app/services/supabase/runtime.ts`
- `vitest.config.*` (they may create this)

If you discover a backend/data bug while doing design work, **log it in your pass notes but do not fix it.**

---

## PROJECT CONTEXT

**Stack:** React + TypeScript + Vite + Tailwind CSS + Clerk auth + Supabase backend
**Design system:** Custom `bd-glass-*` classes defined in `src/styles/theme.css`
**Key classes:** `bd-glass-panel`, `bd-glass-card`, `bd-glass-badge`, `bd-glass-control`, `bd-glass-control--primary`, `bd-glass-control--secondary`, `bd-glass-control--utility`, `bd-glass-floating`
**Color system:** Royal blue (#003d82 identity/action), soft blue (atmosphere), navy (depth/night), gray-blue (subdued). `primaryColor` = `#003d82`, `secondaryColor` = `#00a0e9`
**Two modes:** Landing page (light theme) and Dashboard (dark map-first theme)

---

## CURRENT STATE — WHAT THE MOBILE UI LOOKS LIKE NOW

Based on fresh screenshots taken 2026-03-25. The landing page section order is:

```
LandingPageHeader (sticky)
  ↓
HeroSection — src/app/components/landing/HeroSection.tsx
  ↓
HowItWorksSection — src/app/components/landing/HowItWorksSection.tsx
  ↓
BenefitsSection — src/app/components/landing/BenefitsSection.tsx
  ↓
WhoWeServeSection — src/app/components/landing/WhoWeServeSection.tsx
  ↓
AboutOpportunitySection — src/app/components/landing/AboutOpportunitySection.tsx
  ↓
TrustStatsSection — src/app/components/landing/TrustStatsSection.tsx
  ↓
OperatingRegionsSection — src/app/components/landing/OperatingRegionsSection.tsx
  ↓
BusinessInquirySection — src/app/components/landing/BusinessInquirySection.tsx
  ↓
CTASection — src/app/components/landing/CTASection.tsx
  ↓
FooterSection — src/app/components/landing/FooterSection.tsx
```

Layout shells:

- `src/app/components/app/LandingPageLayout.tsx` — assembles landing sections
- `src/app/components/app/DashboardLayout.tsx` — dashboard with sidebar + mobile bottom nav

Dashboard tabs (mobile bottom nav):

- Dashboard (HomeScreen) — `src/app/components/codelayer/HomeScreen.tsx` / `HomeScreenSections.tsx`
- Report — `src/app/components/codelayer/ReportScreen.tsx` + `report/*.tsx` steps
- Bids — `src/app/components/codelayer/BidsScreen.tsx`
- Account — `src/app/components/codelayer/AccountScreen.tsx` + `account/*.tsx`

---

## KNOWN ISSUES FROM MOBILE SCREENSHOTS (prioritized)

### P1 — Must Fix

1. **BenefitsSection: Card titles unreadable over images (mobile)**
   - File: `src/app/components/landing/BenefitsSection.tsx`
   - "Get Your Car Fixed Right", "Experienced Professionals", "Transparent Estimates" — the `<h4>` title text sits directly below the image but the image and title are so close that on some cards the title bleeds into or overlaps the image edge
   - The title is dark text on a light card, but the visual proximity to the image creates a cramped, hard-to-parse feel
   - Fix: Increase `mb-3` on the image container to `mb-4`, or add a small visual separator. Consider whether the image height (`h-44`) is too tall on mobile — it pushes the title below the fold of the card

2. **BusinessInquirySection: Heading gradient text is hard to read**
   - File: `src/app/components/landing/BusinessInquirySection.tsx`
   - "Shop Signup and Insurer Partnerships" — the gradient text is washed out and low contrast
   - Fix: Use solid `text-slate-900` for the heading, or darken the gradient stops significantly

### P2 — Should Fix

3. **Hero → HowItWorks transition: excessive white space on mobile**
   - Between the hero image bottom (with "Repair Completed!" overlay) and the "Three Steps" badge, there's a large blank gap
   - Root: Hero section has `pb-14 sm:pb-20`, and HowItWorks has `pt-12 md:pt-16`
   - Fix: Reduce hero `pb` on mobile to `pb-8` or tighten HowItWorks `pt` to `pt-6`

4. **BenefitsSection: Trust badges row — "NY Service Area" badge is partially cut off**
   - File: `src/app/components/landing/BenefitsSection.tsx` lines 123-146
   - The three trust badges ("$0 Free for Customers", "3+ Bids Per Request", "NY Service Area") wrap awkwardly on narrow mobile — the NY badge drops below and gets visually lost
   - Fix: Make badges slightly smaller on mobile, or change to a 2+1 layout that wraps gracefully

5. **WhoWeServeSection: Cards stack but are spaced well — needs a small improvement**
   - The three cards (Customers, Shops, Insurers) stack vertically on mobile and look good overall
   - Minor: The `border-2` on each card makes the vertical borders feel heavy when stacked. Consider reducing to `border` (1px) on mobile

6. **TrustStatsSection: 4-column grid on mobile collapses to single column with excessive vertical space**
   - The 4 commitment items ("Structured Intake", "Transparent Bids", etc.) each take a full row with large icon + centered text
   - On mobile, consider a 2x2 grid (`grid-cols-2`) to reduce scroll length

### P3 — Polish

7. **HowItWorksSection: Step icon containers have a visible square border artifact**
   - The icon bg uses `${primaryColor}14` (very transparent) with `border: 1px solid ${primaryColor}12` — on some screens, the border is barely visible but creates a "box within a box" feel
   - Consider removing the explicit border and relying on the background tint + shadow alone

8. **AboutOpportunitySection: "Read Full About Overview" button feels disconnected**
   - The button sits below the three cards but has no visual connector to the section
   - Minor: Add a subtle top separator or reduce gap between cards and button

9. **CTASection: Decorative blue circles at corners are oversized on mobile**
   - The absolute-positioned squares/circles (`w-10`/`w-12` mobile) clip against the card edges
   - Reduce size on mobile or pull them slightly further outside

10. **OperatingRegionsSection: Map performance diagnostics visible**
    - "Awaiting samples · No recent samples · 7 stored · Zoom 265ms · Pan 253ms" and "Last sample: 03:49 PM (6h ago)" are visible in the map widget
    - This looks like a DEV-only diagnostic overlay that should be hidden in production
    - File: likely in `src/app/components/dashboard/CustomerMapWidget.tsx` or map overlay components
    - Fix: Gate behind `import.meta.env.DEV`

11. **Dashboard home: "Welcome, Molalign!" card could use tighter spacing**
    - The gap between the NearbyShops widget and the Welcome card feels slightly large on mobile
    - File: `src/app/components/codelayer/HomeScreenSections.tsx`

12. **Landing page header: "Dashboard" button stays visible even when scrolling deep into the page**
    - This is correct behavior (it's the nav), but on mobile the header takes up significant vertical space
    - Consider reducing header height on mobile by ~4-8px (smaller logo, tighter padding)

### P4 — Future Consideration

13. **Footer: Column layout on mobile could be tighter**
    - The 4-column footer collapses to single column, creating a very long scroll
    - Consider 2x2 grid on mobile for the link columns

14. **Report wizard (Step 1 - Vehicle Info): "Pick a saved vehicle" card styling is clean**
    - No issues. The vehicle selector cards look polished on mobile dark theme.

15. **Bids screen empty state: Well-designed**
    - "Waiting for shop responses" with the clock icon is clear and informative. No changes needed.

16. **Account screen: Profile card gradient + fields look premium**
    - The blue gradient header with profile image is polished. No changes needed.

---

## HOW TO EXECUTE PASSES

Each pass follows this exact structure:

### Before the pass:

```bash
# Verify clean build
npx vite build
```

### During the pass:

1. **State the pass number and what you're changing** (e.g., "Pass 222 — P1: Fix BenefitsSection card title readability on mobile")
2. **Read the file(s) you'll edit** — never edit blind
3. **Make the minimum changes** to fix the stated issue
4. **Verify build** after changes

### After the pass:

```bash
# Type check
npx tsc --noEmit
# Build
npx vite build
```

### Pass discipline:

- **One issue per pass.** Don't bundle unrelated fixes.
- **Never add features.** This is design refinement only.
- **Never touch service/hook logic.** If you see a data bug, note it and move on.
- **Never expand scope mid-pass.** If fixing card spacing reveals a color issue, that's a separate pass.
- **Code cleanup only in files you're already touching.**
- **Commit after each pass** with message: `Pass N — PX: Brief description`

---

## UNCOMMITTED CHANGES STATUS

There are **46 files** with uncommitted changes from passes 196-221. These should be committed as a batch before you start new passes:

```bash
git add -A
git commit -m "Passes 196-221 — Platform bugfix sweep: report wizard dark theme, account redesign, dashboard density, routing, data layer hardening"
```

After that commit, start fresh passes at **222**.

---

## LANDING PAGE FILE QUICK REFERENCE

| Section           | File                                  | Key mobile issue                              |
| ----------------- | ------------------------------------- | --------------------------------------------- |
| Header            | `landing/LandingPageHeader.tsx`       | Slightly tall on mobile                       |
| Hero              | `landing/HeroSection.tsx`             | Bottom padding too generous                   |
| How It Works      | `landing/HowItWorksSection.tsx`       | Icon border artifact                          |
| Benefits          | `landing/BenefitsSection.tsx`         | **Card titles unreadable, trust badges wrap** |
| Who We Serve      | `landing/WhoWeServeSection.tsx`       | Heavy card borders                            |
| About             | `landing/AboutOpportunitySection.tsx` | Button feels disconnected                     |
| Trust Stats       | `landing/TrustStatsSection.tsx`       | Single-col wastes space                       |
| Operating Regions | `landing/OperatingRegionsSection.tsx` | Map diagnostics visible                       |
| Coverage Search   | `landing/CoverageSearchPanel.tsx`     | Clean — no issues                             |
| Business Inquiry  | `landing/BusinessInquirySection.tsx`  | **Heading gradient unreadable**               |
| CTA               | `landing/CTASection.tsx`              | Decorative circles oversized                  |
| Footer            | `landing/FooterSection.tsx`           | Long single-col on mobile                     |

## DASHBOARD FILE QUICK REFERENCE

| Screen          | File                                                  | Status                      |
| --------------- | ----------------------------------------------------- | --------------------------- |
| Home            | `codelayer/HomeScreen.tsx` + `HomeScreenSections.tsx` | Clean, minor spacing        |
| Report wizard   | `codelayer/ReportScreen.tsx` + `report/*.tsx`         | Clean after dark theme pass |
| Bids            | `codelayer/BidsScreen.tsx`                            | Clean                       |
| Account         | `codelayer/AccountScreen.tsx` + `account/*.tsx`       | Clean after redesign        |
| Map widget      | `dashboard/CustomerMapWidget.tsx`                     | Diagnostics need DEV gate   |
| Mobile nav      | `dashboard/MobileBottomNav.tsx`                       | Clean                       |
| Dashboard shell | `app/DashboardLayout.tsx`                             | Clean                       |

---

## DESIGN PRINCIPLES CHEAT SHEET

- **Map is base layer** — everything floats above geography
- **Blue is a system:** royal blue (identity/action), soft blue (atmosphere), navy (depth/night), gray-blue (subdued)
- **Glass = breathable, warm, translucent** — not over-solidified
- **Controls = tactile, soft, layered, calm, premium**
- Use `bd-glass-*` canonical classes. Avoid one-off blur/bg-white hacks.
- **Avoid:** flat bg-white on premium surfaces, hard gray borders, harsh hover swaps, boxy controls, cramped spacing
- **Risk zones:** blue tint overdone, map immersion weakening CTAs, design drift into features
- **Never weaken CTA weight** for immersion (learned from onboarding card revert)

---

## SUGGESTED PASS ORDER

Start with P1s, then P2s. Do one per pass.

```
Pass 222 — P1: BenefitsSection card title spacing and image height on mobile
Pass 223 — P1: BusinessInquirySection heading gradient readability
Pass 224 — P2: Hero → HowItWorks vertical gap reduction on mobile
Pass 225 — P2: BenefitsSection trust badges mobile wrapping
Pass 226 — P2: WhoWeServeSection card border weight on mobile
Pass 227 — P2: TrustStatsSection mobile grid (2x2 instead of 1-col)
Pass 228 — P3: HowItWorksSection icon border artifact cleanup
Pass 229 — P3: AboutOpportunitySection button visual connector
Pass 230 — P3: CTASection decorative circle sizing on mobile
Pass 231 — P3: Map diagnostics DEV gate
Pass 232 — P3: Dashboard home card spacing
Pass 233 — P3: Landing header mobile height reduction
Pass 234 — P4: Footer mobile 2x2 grid
```

This is a suggested order. Use judgment — if you see something urgent in your review that wasn't captured here, prioritize it. But always follow the pass structure.
