# Light / Dark Mode Audit — BidOnDent

> **Generated:** 2025-07-11 — Pass 24 (Track 2)  
> **Scope:** All component files under `src/app/components/`  
> **Purpose:** Catalog appearance-mode readiness across every UI surface so future passes can remediate systematically.  
> **Rule:** This document is audit-only. NO code changes accompany this pass.

---

## Summary

| Metric                         | Count |   % |
| ------------------------------ | ----: | --: |
| Total component files analyzed |   131 | 100 |
| ✅ Fully appearance-aware      |   ~65 |  50 |
| ⚠️ Partially appearance-aware  |   ~20 |  15 |
| ❌ Hardcoded / missing support |   ~46 |  35 |

**Design system convention:** Components receive `appearanceMode` (or `isLight` boolean) as a prop. Conditional Tailwind classes control text, background, border, and accent colors. CSS tokens (`bd-report-section`, `bd-report-input`, `bd-glass-control--*`) handle common patterns.

---

## Directory Breakdown

### `src/app/components/shop/` (79 files)

#### ✅ Fully Appearance-Aware (17+)

- `ShopRequestCard.tsx` — `isLight` prop with helper functions (`getStatusColor()`, `getUrgencyColor()`)
- `LikedShopCard.tsx` — `isLight` prop with full conditional styling
- `ShopOnboardingStep1.tsx` — `isLight` prop + `bd-report-input` / `bd-report-section` tokens
- `ShopOnboardingStep2.tsx` — `isLight` prop + conditional classes (Pass 23)
- `ShopOnboardingStep3.tsx` — `isLight` prop + conditional classes (Pass 23)
- `ShopOnboardingStep4.tsx` — `isLight` prop + conditional classes (Pass 23)
- `ShopOnboarding.tsx` — Passes `isLight` to all four steps (Pass 23)

#### ⚠️ Acceptable — Map-Overlay Components

- Map-based shop components (ShopDirectoryScreen, MapLibreShopDirectoryMapPane, ShopDirectoryInlineUI, etc.) intentionally use dark styling for map overlays. White text on translucent dark glass is correct here.

#### ❌ Issues Found

| File                    | Problem                                                        | Priority |
| ----------------------- | -------------------------------------------------------------- | -------- |
| `photo-guide-steps.tsx` | Hardcoded `text-gray-700`, `border-gray-300` — no conditionals | P2       |
| `PhotoGuide.tsx`        | Hardcoded colors not verified                                  | P2       |

---

### `src/app/components/insurer/` (20 files)

#### ✅ Fully Appearance-Aware (10)

- `InsurerClaimCard.tsx` — `appearanceMode` prop with full styling
- `InsurerClaimsScreen.tsx` — `appearanceMode` with `isLight` logic
- `ManualProspectCard.tsx` — `appearanceMode` with proper conditionals
- `InsurerPartnerShopCard.tsx` — `appearanceMode` prop
- `InsurerConnectionScreen.tsx` — Appearance-aware

#### ⚠️ Partially Appearance-Aware (2)

- `InsurerNewClaimForm.tsx` — Some conditionals, may have gaps

#### ❌ Issues Found

| File                                         | Problem                                                                                                                                           | Priority |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `InsurerPartnershipPage.tsx` (in `landing/`) | **Hardcoded light mode only** — `text-slate-700`, `text-slate-900`, `text-slate-600`, `border-slate-200`, `bg-slate-50`. No `appearanceMode` prop | P0       |

---

### `src/app/components/codelayer/` (44 files)

#### ✅ Fully Appearance-Aware (22)

- `HomeScreen.tsx` — `appearanceMode` with full coverage
- `BidsScreen.tsx` — `appearanceMode` prop
- `BidsEmptyState.tsx` — `isLight` prop
- `BidsSummaryHeader.tsx` — Appearance-aware
- `HomeReportsList.tsx` — Conditional styling
- `AccountScreen.tsx` — Appearance-aware
- Report module components (StepPhotos, StepDescription, etc.) — Mostly conditional

#### ⚠️ Partially Appearance-Aware (3)

- `ReportScreen.tsx` — Mixed conditionals and hardcodes
- `BidsGeographyMap.tsx` — Some gaps

#### ❌ Issues Found

| File                    | Problem                                                                | Priority |
| ----------------------- | ---------------------------------------------------------------------- | -------- |
| `ImageWithFallback.tsx` | Fallback renders `bg-white/[0.08]` (dark-only). No light mode fallback | P1       |

---

### `src/app/components/reports/` (7 files)

#### ✅ Fully Appearance-Aware (5)

- `ReportDetailScreen.tsx` — `appearanceMode` with extensive conditionals
- `ReportDetailInterestedShops.tsx` — `isLight` prop throughout
- `CompetitorAnalysisScreen.tsx` — `appearanceMode` prop
- `CompetitorShopCard.tsx` — `isLight` prop
- `ReportsListScreen.tsx` — `isLight` prop with full styling

#### ❌ Issues Found

| File                       | Problem                                                                 | Priority |
| -------------------------- | ----------------------------------------------------------------------- | -------- |
| `PhotoGalleryLightbox.tsx` | Hardcoded dark mode: `bg-white/10`, `text-white`. No light mode support | P0       |
| `MissingReportState.tsx`   | Hardcoded dark mode styling                                             | P2       |

---

### `src/app/components/dashboard/` (15 files)

#### ✅ Fully Appearance-Aware (10)

- `MapLibreDashboardMapPreview.tsx` — `isLight` prop with map style switching
- `InsurerMapWidget.tsx` — `isLight` prop
- `CustomerMapWidget.tsx` — Appearance-aware
- `ShopMapWidget.tsx` — Appearance-aware
- `NotificationCenter.tsx` — Proper styling
- `MobileBottomNav.tsx` — Conditional

#### ⚠️ Partially Appearance-Aware (2)

- `ProfileDropdown.tsx` — Has `isLightAppearance` prop but only partial coverage

#### ❌ Issues Found

| File                   | Problem                                                                                                                  | Priority |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------- |
| `DashboardHeader.tsx`  | **No appearance-mode prop.** Hardcoded `text-slate-100`, `text-gray-500`, `text-gray-800`. Logo unreadable in light mode | P0       |
| `ProfileRoleStats.tsx` | Hardcoded light text                                                                                                     | P1       |
| `DesktopNavTabs.tsx`   | Needs verification                                                                                                       | P2       |

---

### `src/app/components/landing/` (31 files)

#### ✅ Fully Appearance-Aware (20)

- `LandingPageHeader.tsx` — `isLightAppearance` prop with extensive coverage
- `HeroSection.tsx` — `isLightAppearance` with full styling
- `BenefitsSection.tsx` — `isLightAppearance` conditionals
- `HowItWorksSection.tsx` — `isLightAppearance` support
- `TrustStatsSection.tsx` — Appearance-aware
- `BusinessInquirySection.tsx` — `isLightAppearance` prop
- `CoverageNearestShops.tsx` — Conditional styling

#### ⚠️ Partially Appearance-Aware (3)

- `FooterSection.tsx` — Uses `isLightAppearance` but some hardcoded accents
- `OperatingRegionsSection.tsx` — `isLightAppearance` but incomplete
- Various form components — May have gaps

#### ❌ Issues Found

| File                         | Problem                                                                         | Priority |
| ---------------------------- | ------------------------------------------------------------------------------- | -------- |
| `InsurerPartnershipPage.tsx` | Hardcoded light mode only — no dark mode support at all                         | P0       |
| `AboutPage.tsx`              | Hardcoded light mode only — `text-slate-700`, `bg-slate-50`, `border-slate-200` | P0       |
| `CTASection.tsx`             | Likely hardcoded light — needs verification                                     | P2       |
| `WhoWeServeSection.tsx`      | May use light-only colors — needs verification                                  | P2       |

---

### `src/app/components/demo/` (4 files)

#### ❌ All Demo Components Hardcoded

| File                      | Problem                                                                   | Priority |
| ------------------------- | ------------------------------------------------------------------------- | -------- |
| `SmokeTestScreen.tsx`     | Hardcoded light mode: `text-gray-900`, `text-gray-500`, `border-gray-100` | P1       |
| `DemoAccountSwitcher.tsx` | Hardcoded dark mode: `bg-white/[0.10]`, `text-slate-100`                  | P1       |
| `DemoLoginHelper.tsx`     | Hardcoded light mode: `text-gray-600`, `text-gray-500`                    | P1       |
| `DemoModeBanner.tsx`      | Hardcoded `bg-amber-500/90` — acceptable as a persistent banner           | P3       |

---

## Critical Problems — Prioritized Remediation List

### P0 — User-Facing, High Impact

1. **`DashboardHeader.tsx`** — No appearance prop, logo and profile text unreadable in light mode — ✅ FIXED in Pass 31
2. **`InsurerPartnershipPage.tsx`** — Entire page hardcoded light — invisible text in dark mode — ✅ FIXED in Pass 33
3. **`AboutPage.tsx`** — Entire page hardcoded light — invisible text in dark mode — ✅ FIXED in Pass 33
4. **`PhotoGalleryLightbox.tsx`** — **Intentionally dark** — fullscreen photo lightbox, correct UX pattern (Instagram/Google Photos standard). Reclassified from P0 to N/A.

### P1 — High Priority

5. **`ImageWithFallback.tsx`** — Fallback is dark-only, broken images look wrong in light mode — ✅ FIXED in Pass 35
6. **`ProfileRoleStats.tsx`** — Already fully appearance-aware (has `isLightAppearance` prop with 6 conditional class variables — container, values, labels, footer). Incorrectly listed as P1 — reclassified to N/A.
7. **`SmokeTestScreen.tsx`** — Demo checklist invisible in dark mode
8. **`DemoAccountSwitcher.tsx`** — Can't preview in light mode
9. **`DemoLoginHelper.tsx`** — Can't view in dark mode

### P2 — Medium Priority

10. **`MissingReportState.tsx`** — Hardcoded dark styling
11. **`photo-guide-steps.tsx`** — Hardcoded gray colors
12. **`PhotoGuide.tsx`** — Hardcoded colors
13. **`CTASection.tsx`** — Needs verification
14. **`WhoWeServeSection.tsx`** — Needs verification
15. **`DesktopNavTabs.tsx`** — Needs verification
16. **`ProfileDropdown.tsx`** — Partial coverage

---

## Standards for New Components

Every new component must follow this pattern:

```tsx
type Props = {
  appearanceMode?: DashboardAppearanceMode; // or isLight?: boolean
};

export default function MyComponent({ appearanceMode = "map-dark" }: Props) {
  const isLight = appearanceMode === "light";

  return (
    <div className={isLight ? "text-slate-900 bg-white/90" : "text-slate-100 bg-white/10"}>
      {/* All visible text, backgrounds, borders must be conditional */}
    </div>
  );
}
```

**CSS tokens available:** `bd-report-section`, `bd-report-input`, `bd-glass-control--primary`, `bd-glass-control--secondary`, `bd-glass-control--utility`

---

## How to Use This Document

1. Pick items from the **P0** list first — these affect real user-facing screens.
2. Each remediation is a single pass: add the appearance prop, update all hardcoded classes, validate in both modes.
3. After fixing a component, update this document: move it from ❌ to ✅ and note the pass number.
4. Components marked ⚠️ need spot-checking — they may already be fine or may have edge cases.
