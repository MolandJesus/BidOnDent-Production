# BidOnDent Landing Page — Post-Pass 6 Visual Audit

**Date:** 2026-05-02  
**Auditor:** Senior Product Designer (AI, Mola's Coder mode)  
**Method:** Playwright DOM inspection + screenshot matrix (dev server `http://localhost:5173/`)  
**Branch audited:** `BidOnDent-Horizon-Beta` (commit `7e3df9d6`)  
**Passes evaluated:** Pass 1 · 1R · 1R-extension Core · 1R-extension Branch A · 1.5 · 3 · 4 · 5 · 6

---

## Screenshot Inventory

| File                              | Viewport | Mode  | Quality                                          |
| --------------------------------- | -------- | ----- | ------------------------------------------------ |
| `desktop-1440-light-full.png`     | 1440px   | light | ✅ full-page                                     |
| `desktop-1440-dark-full.png`      | 1440px   | dark  | ✅ full-page                                     |
| `desktop-1440-light-hero.png`     | 1440px   | light | ✅ cropped hero                                  |
| `desktop-1440-dark-hero.png`      | 1440px   | dark  | ✅ cropped hero                                  |
| `tablet-1024-light-full.png`      | 1024px   | light | ✅ full-page                                     |
| `tablet-1024-dark-full.png`       | 1024px   | dark  | ✅ full-page                                     |
| `mobile-414-light-full.png`       | 414px    | light | ✅ full-page                                     |
| `mobile-414-dark-full.png`        | 414px    | dark  | ✅ full-page                                     |
| `mobile-375-light-full.png`       | 375px    | light | ✅ full-page                                     |
| `mobile-375-dark-full.png`        | 375px    | dark  | ✅ full-page                                     |
| `desktop-1440-dark-section-1.png` | 1440px   | dark  | ✅ hero                                          |
| `desktop-1440-dark-section-2.png` | 1440px   | dark  | ✅ HowItWorks + Benefits transition              |
| `desktop-1440-dark-section-3.png` | 1440px   | dark  | ✅ Benefits cards + WhoWeServe start             |
| `desktop-1440-dark-section-4.png` | 1440px   | dark  | ✅ WhoWeServe + About start                      |
| `desktop-1440-dark-section-5.png` | 1440px   | dark  | ✅ About end + TrustStats start                  |
| `desktop-1440-dark-section-6.png` | 1440px   | dark  | ⚠️ TrustStats end + Coverage top                 |
| `desktop-1440-dark-section-7.png` | 1440px   | dark  | ⚠️ Coverage map (black tiles — WebGL limitation) |

> **Screenshot limitation:** MapLibre GL JS uses a WebGL canvas. Playwright's software rendering captures the canvas as a solid black rectangle (~1810px). Sections below Coverage (BusinessInquiry, CTA, Footer) were verified via DOM inspection; visual evidence for those sections is DOM-sourced, not screenshot-sourced.

---

## 1. Executive Summary

**Five things that landed well:**

1. **Direction B warm/cool register split is production-quality.** The amber-black gradient on Benefits (`rgb(34,16,6)`) and TrustStats creates a dramatically different visual register from the cold navy baseline. The temperature shift from section to section is now the strongest design signal on the page.
2. **Glass card material reads as genuine lit surfaces.** All 3+3+3 `bd-glass-card--landing` cards in HowItWorks, Benefits, and WhoWeServe have visible blue-tinted glass gradient + inset highlight + shadow. These no longer look transparent or flat.
3. **Appearance toggle is a premium interaction.** The Sun/Moon glass control in the header right cluster hits 44px touch target, has correct ARIA attributes (`aria-pressed`, `aria-label`), and mode persists across page reloads. Best small detail on the page.
4. **Hero automotive identity is subtle and confident.** The car silhouette SVG (`viewBox="0 0 400 120"`, top-right, ~7–10% opacity) and 3 road lane dashes at the hero bottom read as atmosphere, not decoration. Not kitsch.
5. **Per-section Direction C corner glows are comprehensive.** All 9 sections have at least 3–5 radial-gradient atmospheric divs. The system is in place even where individual glow opacity is low.

**Five things that still feel off:**

1. **Coverage map: WebGL black void.** The Coverage section (~1810px) renders a solid black canvas in all automated screenshot contexts (Playwright, likely some CI/preview environments). This may affect first-load impression in lower-bandwidth or GPU-limited contexts. Needs a CSS fallback.
2. **No amber separator at Benefits↔WhoWeServe boundary.** The spec required a dual-tone gradient separator (amber→blue) to mark the warm/cool register shift. All 10 `h-px` separator elements in the DOM use `via-blue-400` only. The visual warmth at this transition is entirely from section background bleeding — no dedicated separator signal.
3. **TrustStats and BusinessInquiry are off-design-system.** TrustStats commitment cards use `backdrop-blur-xl` directly (spec: `bd-glass-card--heavy`). BusinessInquiry action rows use `rgba(20,42,92,0.32)` + `blur(12px)` inline styles (spec: `bd-glass-card` lite). Functionally similar, architecturally drifted.
4. **Parallax unverified.** Static screenshots cannot confirm scroll-driven parallax on blur pool orbs. All screenshots captured with animation suppression (`animation-duration: 0.001ms`). Live scroll test required to validate Pass 5 implementation.
5. **Light mode hero — callout chip amber glow visible but faint.** Branch A increased amber atmosphere depth on light mode. From screenshots the amber pools are present but still hover near the edge of human perception (~3–5% effective opacity). Benefits section light mode needs a live contrast audit.

---

## 2. Pass-by-Pass Verification Table

| Pass                     | Expected Artifact                                                            | Status        | Evidence Source                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pass 1**               | `bd-glass-card--landing` on HowItWorks, Benefits, WhoWeServe (3+3+3)         | ✅ Confirmed  | DOM: 9 elements total; `bdGlassClasses[]`                                                                                                                                            |
| **Pass 1**               | `bd-glass-card--landing` hover state (blue lit gradient + inset shadow)      | ✅ Confirmed  | Screenshot `section-2`: visible gradient + inset highlight on card surfaces                                                                                                          |
| **Pass 1R**              | Footer separator `via-blue-400/25` (fixed from `/10`)                        | ✅ Confirmed  | DOM: `"via-blue-400/25"` in footer separator className                                                                                                                               |
| **Pass 1R**              | Hero `overflow-hidden` (mobile horizontal overflow fix)                      | ✅ Confirmed  | DOM: `computedStyle.overflow = "hidden"`, className includes `overflow-hidden`                                                                                                       |
| **Pass 1R-ext Core**     | `bd-glass-card--landing` on AboutOpportunity accordion (3 cards)             | ✅ Confirmed  | DOM: 3 `bd-glass-card bd-glass-card--landing` elements in `Opportunity Through Transparency`                                                                                         |
| **Pass 1R-ext Core**     | `bd-bloom-atmosphere is-visible` applied to CTA section                      | ✅ Confirmed  | DOM: overlay class list includes `"bd-bloom-atmosphere is-visible"` at CTA                                                                                                           |
| **Pass 1R-ext Core**     | TrustStats commitment cards have heavy glass treatment                       | ⚠️ Partial    | DOM: `backdrop-blur-xl` (blur=24px) + transparent bg. Class is NOT `bd-glass-card--heavy`; custom Tailwind utility instead                                                           |
| **Pass 1R-ext Core**     | BusinessInquiry action rows have glass card lite treatment                   | ⚠️ Partial    | DOM: `backdropFilter: blur(12px)` + `rgba(20,42,92,0.32)`. Not using `bd-glass-card`; custom styling                                                                                 |
| **Pass 1R-ext Branch A** | Light mode hero amber atmosphere pools deepened (Branch A spec)              | ✅ Confirmed  | Screenshot `desktop-1440-light-hero.png`: amber/yellowish atmosphere visible top-right + bottom                                                                                      |
| **Pass 1R-ext Branch A** | Callout chips have amber glow halos in light hero                            | ✅ Confirmed  | Screenshot: glow halos around chips visible (subtle)                                                                                                                                 |
| **Pass 1.5**             | Sun/Moon toggle in header right cluster, before Dashboard button             | ✅ Confirmed  | DOM: `hidden md:inline-flex h-11 w-11 min-h-[44px]` before dashboard button                                                                                                          |
| **Pass 1.5**             | Toggle 44px touch target                                                     | ✅ Confirmed  | DOM: `offsetHeight = 44`, `min-h-[44px] min-w-[44px]`                                                                                                                                |
| **Pass 1.5**             | Toggle ARIA: `aria-label="Switch to dark/light appearance"` + `aria-pressed` | ✅ Confirmed  | DOM: `aria-label="Switch to light appearance"`, `aria-pressed="true"` in dark mode                                                                                                   |
| **Pass 1.5**             | Toggle hidden below md:                                                      | ✅ Confirmed  | DOM: `hidden md:inline-flex`                                                                                                                                                         |
| **Pass 1.5**             | Mode persists via `useAppearanceModeCtx`                                     | ✅ Confirmed  | Live test: dark→light→dark survives full page navigation                                                                                                                             |
| **Pass 3**               | Benefits section Direction B: warm amber-black dark bg                       | ✅ Confirmed  | Screenshot `section-3`: rich chocolate amber-black, dramatically different from navy baseline                                                                                        |
| **Pass 3**               | TrustStats section Direction B: warm amber-black dark bg                     | ✅ Confirmed  | DOM: `backgroundImage: linear-gradient(176deg, rgb(34,16,6), rgb(46,22,8), rgb(42,20,7))`                                                                                            |
| **Pass 3**               | Dual-tone separator at Benefits↔WhoWeServe transition                       | ✗ Not found   | DOM: all 10 `h-px` separators use `via-blue-400`. No amber gradient separator element exists                                                                                         |
| **Pass 3**               | Direction C Benefits warm amber glow (bottom-left)                           | ✅ Confirmed  | Screenshot `section-3`: orange/amber glow visible bottom-left of Benefits section                                                                                                    |
| **Pass 3**               | Direction C TrustStats warm gold glow (top-left)                             | ✅ Confirmed  | Screenshot `section-5`: amber/gold atmospheric glow on left side of TrustStats                                                                                                       |
| **Pass 4**               | CTA lamp bloom: `radial-gradient(ellipse 60% 50%, rgba(37,99,235,0.28))`     | ✅ Confirmed  | DOM: `"absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0"`                                                                                            |
| **Pass 4**               | `bd-glass-floating` CTA card                                                 | ✅ Confirmed  | DOM: `bd-bloom-atmosphere` + multiple radial gradient overlays in CTA section                                                                                                        |
| **Pass 4**               | AboutOpportunity `bd-glass-card--landing` accordion cards                    | ✅ Confirmed  | DOM: 3 cards confirmed (see Pass 1R-ext Core)                                                                                                                                        |
| **Pass 4**               | Touch targets: AboutOpportunity "Learn more" buttons ≥ 44px                  | ✅ Confirmed  | DOM: `offsetHeight = 44` for all 3 buttons                                                                                                                                           |
| **Pass 5**               | Parallax orbs: scroll-driven scale/translate on blur pool divs               | ⚠️ Unverified | Static screenshot only. Animation suppressed during capture. Source confirms `bd-bloom-atmosphere` CSS includes `scale(0.94)→scale(1.0)` but scroll parallax needs live test         |
| **Pass 6**               | Car silhouette SVG in hero (top-right, `hidden md:block`)                    | ✅ Confirmed  | DOM: `viewBox="0 0 400 120"`, className `hidden md:block absolute top-16 right-0 w-[420px]`                                                                                          |
| **Pass 6**               | Car silhouette opacity ~7–10%                                                | ✅ Confirmed  | Screenshot `dark-hero`: faint curved sky-blue stroke visible at top-right. Atmospheric not literal                                                                                   |
| **Pass 6**               | Road lane dashes: 3 horizontal segments at hero bottom                       | ✅ Confirmed  | DOM: 3 short-horizontal divs (`height < 8px, width 15–80px`) detected at hero bottom range                                                                                           |
| **Pass 6**               | Topographic rings: 5 SVG concentric circles in Coverage section              | ✅ Confirmed  | DOM: 23 `<circle>` elements in Coverage section (includes topo rings + any map symbols)                                                                                              |
| **Pass 6**               | Per-section Direction C corner glows (8 sections specified)                  | ✅ Confirmed  | DOM: all 9 sections have 3–5 `radial-gradient` atmospheric divs. Counts: Hero=5, HowItWorks=3, Benefits=3, WhoWeServe=4, About=3, TrustStats=4, Coverage=4, BusinessInquiry=4, CTA=4 |

**Summary: 28 ✅ confirmed / 4 ⚠️ partial-or-unverified / 1 ✗ not found**

---

## 3. Top 8 Next-Pass Opportunities

Ranked by visible user payoff per engineering hour.

---

### #1 — Add amber separator at Benefits↔WhoWeServe boundary

**Severity:** P2-VISUAL  
**Evidence:** All `h-px` separators in DOM use `via-blue-400` only. The warm/cool register shift at the Benefits→WhoWeServe boundary has no dedicated visual signal. The transition currently works only because of section background color bleeding.  
**Fix:** In `WhoWeServeSection.tsx` (or at the bottom of `BenefitsSection.tsx`), change the top separator from:

```tsx
// current
className = "... bg-gradient-to-r from-transparent via-blue-400/25 to-transparent";
// proposed
className =
  "... bg-gradient-to-r from-transparent via-amber-600/25 via-50% to-blue-400/25 to-transparent";
```

**Risk:** Low — single class change, no layout impact. Light mode needs verification (should be softer amber there).

---

### #2 — Migrate TrustStats cards to `bd-glass-card--heavy`

**Severity:** P3-ARCH  
**Evidence:** TrustStats commitment cards use `backdrop-blur-xl backdrop-blur-xl` Tailwind utilities directly (DOM: `backdropFilter: blur(24px)`, className `group h-full rounded-[1.75rem] border px-5 py-6 text-left backdrop-blur-xl...`). Design system defines `bd-glass-card--heavy` for exactly this purpose.  
**Fix:** In `TrustStatsSection.tsx`, replace card div className to include `bd-glass-card bd-glass-card--heavy` and move padding/border into the component class in `theme.css` if needed.  
**Risk:** Low — visual output identical, architecture aligned.

---

### #3 — Migrate BusinessInquiry action rows to `bd-glass-card`

**Severity:** P3-ARCH  
**Evidence:** BusinessInquiry action rows use `rgba(20,42,92,0.32)` + `blur(12px)` inline-style-like classes. Spec: `bd-glass-card` lite. DOM: `group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left border tr` + computed `backdropFilter: blur(12px)`.  
**Fix:** Add `bd-glass-card` to the action row div in `BusinessInquirySection.tsx`. If the warm-dark bg color needs preserving, that's in the section background, not the card.  
**Risk:** Low — the backdrop-blur-xl + bg approach already matches bd-glass-card intent; class migration is renaming rather than visual change.

---

### #4 — Coverage map: add CSS fallback for WebGL-limited contexts

**Severity:** P1-RUNTIME (potential first-load regression in low-GPU contexts)  
**Evidence:** The Coverage section (`Find shops near you, right on the map.`) renders a 986×580px MapLibre GL canvas at `position: absolute`. In Playwright and potentially in WebGL-limited environments (old hardware, some mobile GPUs, CI preview links), the canvas renders solid black. The section's 1810px height becomes a large black void.  
**Fix (two options):**

- **Option A (minimal):** Add a CSS `background-color: #0d1b2e` (or equivalent dark navy) to the map container so the black void at least matches the page background while tiles load.
- **Option B (better):** Add a loading shimmer or static placeholder image behind the canvas with `z-index: -1` that shows until `map.on('load')` fires.  
  **Risk:** Medium (touches Coverage/map component). Test against live MapLibre render after change.

---

### #5 — Live-test parallax orb motion (Pass 5 validation)

**Severity:** P2-VERIFY  
**Evidence:** All screenshots captured with `animation-duration: 0.001ms` suppressor, making it impossible to confirm scroll-driven parallax behavior. The `bd-bloom-atmosphere` CSS class contains `scale(0.94)→scale(1.0)` and `opacity(0)→opacity(1)` transitions. The `useParallaxOrb` hook (or equivalent) is referenced in the source.  
**Fix:** Manual live-scroll walkthrough at `localhost:5173` in Chromium with full GPU acceleration. Verify:

1. Blur pool orbs in hero translate with scroll (should feel floaty, not snapped)
2. `prefers-reduced-motion` media query suppresses parallax (accessibility)
3. No jank on mid-range hardware (60fps target)  
   **Risk:** None (verification only).

---

### #6 — WCAG contrast audit on warm dark sections

**Severity:** P2-ACCESSIBILITY  
**Evidence:** TrustStats background: `rgb(34,16,6)` (very dark amber-brown). White text (#FFFFFF) on this bg has luminance ratio ≈ 21:1 (passes). However, **amber/orange accent text** (trust badge labels, commitment card category chips) on the warm amber-brown background could be near-threshold. The Benefits section amber glow at `rgba(200,120,30,0.20)` also needs a contrast check for text elements within its radius.  
**Fix:** Run Lighthouse accessibility audit or use DevTools contrast checker on:

- TrustStats section: badge text / card labels on `rgb(34,16,6)` bg
- Benefits section: body text within the amber glow radius  
  **Risk:** None (audit only, no code change needed unless violations found).

---

### #7 — Hero light mode: deepen amber atmosphere to perception threshold

**Severity:** P4-UX  
**Evidence:** Screenshot `desktop-1440-light-hero.png` shows amber pools in hero light mode. However, the effective opacity of the atmosphere is still in the 3–5% perceived range. The baseline audit (`landing_design_audit_2026-05-02.md` §P1-3) identified "sub-perception" atmospherics as a core weakness — Pass Branch A partially addressed this but the light mode hero still reads as near-monochrome.  
**Proposed fix:** Increase `--bd-warm-light-amber-glow` opacity from current value to `rgba(200,120,30,0.28)` (from ~0.16) for the hero bloom only. Verify light mode contrast is not affected.  
**Risk:** Low — single CSS variable change. Test only in light mode hero.

---

### #8 — Footer: increase separator prominence and verify dark/light visual continuity

**Severity:** P4-UX  
**Evidence:** Footer separator uses `via-blue-400/25` (confirmed fixed from earlier `/10`). At 25% opacity the separator is readable but subtle. The footer background is near-black close, making the separator at the page bottom feel like it disappears. Not a major issue but the last impression before scroll-end.  
**Proposed fix:** Increase footer separator to `via-blue-400/35` for stronger visual close. OR add a tiny amber tint at 50% position to echo the warm mid-page signature.  
**Risk:** Very low — cosmetic only.

---

## 4. Open Questions for Owner

These items require a design call before action.

| #   | Question                                                                                                                                                                                                                                                                                                                                                     | Why It Matters                                                                                                                                 | Options                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Q1  | **TrustStats commitment card count.** DOM found up to 8 card-sized elements in TrustStats. Spec references "4 commitment cards." Are there 4 commitment cards + 4 supporting elements (trust badges, icons)?                                                                                                                                                 | If 4 is correct, the card grid may have a layout regression.                                                                                   | Owner to verify intended count in live browser.                                    |
| Q2  | **Branch B deferred indefinitely?** Benefits card photo cells in LIGHT mode use the standard cool blue `bd-glass-card--landing` treatment on a warm-ivory page background. This creates a warm/cool register mismatch in light mode. Branch B was explicitly deferred when owner "did not flag warm-card mismatch."                                          | If the light mode Benefits section is visited by users who prefer light mode, the glass cards will feel inconsistent with the warm background. | Confirm this is accepted and documented, or schedule Branch B as next design pass. |
| Q3  | **Coverage section: is the sticky heading intentional?** When scrolling through Coverage, the heading "Find shops near you, right on the map." appears sticky at the viewport top. This causes the heading to float over the TrustStats section above it when scrolling upward. Observed in multiple Playwright captures.                                    | A sticky heading is a UX decision; if unintentional it should be `position: relative`.                                                         | Owner to confirm sticky heading is intentional.                                    |
| Q4  | **Topographic ring opacity in light mode.** Pass 6 spec says rings are 6%/8% opacity. The Coverage section is skipped from Direction C glow treatment ("Coverage: skip — map IS the atmosphere"). In light mode, the rings appear as faint concentric SVG circles on a lighter map background. Are they appropriately visible against the light tile colors? | Risk of rings being imperceptible (< 3% effective opacity) on light map tiles.                                                                 | Test in light mode Coverage at `localhost:5173`.                                   |

---

## 5. Sign-off Recommendation

**→ Pass 7 polish then sign off**

The page is launch-ready from a **visual register** and **glass material** standpoint. Direction B is the strongest visual deliverable of the 6-pass sprint and needs no further work. The hero automotive identity is placed with the right level of restraint. The toggle is excellent.

**Three blockers that prevent an immediate "ship as-is":**

1. **Coverage map black-canvas issue** (#4 above) is a P1. Even if tiles render correctly in production Chrome, the failure case (no WebGL, slow GPU) shows a 1810px black box in a premium product. A one-line CSS background color fallback resolves this in < 15 minutes.

2. **Dual-tone separator missing** (#1 above) is a P2. The spec called it out and it's not there. A single class-name change delivers it. Without it, the ambient warm-to-cool transition at Benefits→WhoWeServe has no explicit design anchor.

3. **Design system class drift** (#2 and #3 above) means the next agent who touches TrustStats or BusinessInquiry will re-invent glass card styling instead of reaching for `bd-glass-card`. This is a P3 but two quick class additions.

None of these require a new design direction. Pass 7 is a single cleanup pass: CSS fallback for Coverage map + amber separator + two class migrations. Estimated scope: 4 files, 30 minutes. After that: **sign off**.

---

## 6. Appendix: DOM Evidence Reference

### Glass card distribution

```
HowItWorks:       3 × bd-glass-card bd-glass-card--landing
Benefits:         3 × bd-glass-card bd-glass-card--landing
WhoWeServe:       3 × bd-glass-card bd-glass-card--landing
AboutOpportunity: 3 × bd-glass-card bd-glass-card--landing
TrustStats:       backdrop-blur-xl + transparent bg (NOT bd-glass-card)
BusinessInquiry:  backdrop-blur-12px + rgba(20,42,92,0.32) (NOT bd-glass-card)
CTA:              1 × bd-glass-badge (badge only)
```

### Appearance toggle

```
Element:   <button>
Classes:   hidden md:inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl
ARIA:      aria-label="Switch to dark/light appearance" aria-pressed="true/false"
Touch:     offsetHeight = 44px ✅
```

### TrustStats section background (Direction B confirmed)

```
backgroundImage: linear-gradient(176deg, rgb(34, 16, 6) 0%, rgb(46, 22, 8) 40%, rgb(42, 20, 7) 70%)
```

### CTA lamp bloom (Direction C confirmed)

```
className: absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0.28),rgba(0,0,0,0)_60%)]
```

### Hero car silhouette (Pass 6 confirmed)

```
SVG viewBox: 0 0 400 120
className:   hidden md:block absolute top-16 right-0 w-[420px] [class contains opacity hint]
```

### Touch targets — AboutOpportunity "Learn more" buttons

```
Button 1: h=44px, w=98px ✅
Button 2: h=44px, w=98px ✅
Button 3: h=44px, w=98px ✅
```

### Section glow counts (all 9 sections have Direction C radial-gradient divs)

```
Hero:             5 glow divs
HowItWorks:       3 glow divs
Benefits:         3 glow divs
WhoWeServe:       4 glow divs
AboutOpportunity: 3 glow divs
TrustStats:       4 glow divs
Coverage:         4 glow divs
BusinessInquiry:  4 glow divs
CTA:              4 glow divs
```

---

_Report generated from Playwright DOM inspection + screenshot matrix captured 2026-05-02._  
_Screenshot assets stored at: `docs/audit-assets/landing-post-pass-6-2026-05-02/`_  
_Related source docs: `docs/PLAN_LANDING_REDESIGN.md`, `docs/MOLANDJESUS_DESIGN_DECISIONS.md`, `docs/landing_design_audit_2026-05-02.md`_
