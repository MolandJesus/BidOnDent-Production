# Landing Page Design Audit v3 — BidOnDent (2026-05-02, Desktop)

**Auditor role:** Senior product designer — Linear / Arc / Stripe / Apple Maps caliber. No code changes.
**Methodology:** Live DOM inspection (computed styles, RGB values, class inspection) via Playwright at 1440×900 desktop viewport. Dark mode confirmed via React context toggle click. Screenshots captured in both modes. Data is current as of 2026-05-02.
**Viewport:** 1440px desktop (Playwright). Panel renders at ~1379px actual — Playwright viewport used for screenshots.
**Sessions:** v1 (incorrect dark mode — classList hack). v2 (real dark mode, mobile focus). v3 (this — full desktop re-audit with live DOM measurement, corrects v2 card findings).
**Screenshots:** `docs/audit-assets/landing-2026-05-02/desktop-1440-*`
**Priority frame:** (1) dark mode monotone-blue, sections blend; (2) page feels flat — needs animation, depth, motion-reveal, car-themed elements.

---

## 5-Bullet Executive Summary (Desktop v3 — 2026-05-02)

1. **Dark mode is a single cold-blue temperature with a 4-point B-channel spread across five consecutive sections.** Hero (B=56), HowItWorks (B=52), Benefits (B=56), WhoWeServe (B=52), AboutOpportunity (B=52) are visually identical. The full page spans B=40–74 (34-point range). Light mode spans 244–255 B-channel with warm R-channel alternation (R=232–255), providing a legible warm/cool rhythm. Dark mode has no warm register at all — amber is replaced 1:1 with blue throughout.

2. **All decorative atmospherics compute below the human perception threshold (1–3% effective opacity).** Every dot grid, diagonal stripe, and line texture is between `0.75–2.1%` effective luminance. The eye requires ~4–5% luminance difference to perceive texture. All floating orbs are `hidden sm:block` or `hidden md:block` — desktop shows them, mobile does not. On desktop they animate but are so small and low-opacity they contribute minimally to depth.

3. **Card surfaces are present in dark mode but without backdrop-blur (except TrustStats).** HowItWorks step cards and WhoWeServe role cards have dark gradients (`rgba(15,30,60,0.3)→rgba(10,18,40,0.75)`) but no `backdrop-filter`. Benefits cards use indigo gradients (`rgba(30,27,75,0.3)→rgba(15,14,40,0.75)`) — also no blur. Only TrustStats commitment cards use `backdrop-blur(24px)` — the single section with proper material glass depth. AboutOpportunity uses `blur(8px)` on transparent cards (invisible against dark backgrounds).

4. **The page has no scroll-driven atmosphere reveals, no parallax depth, and no car-themed identity.** The `useScrollAnimation` hook fires content fade-ins per card. But section backgrounds themselves have no entrance bloom. All three animated orbs are `sm:hidden` or smaller — desktop shows them but at 12–15% opacity. There is one `<Car>` icon in the hero (hidden on most sizes). The product is "auto body repair bidding marketplace" but the page could be any B2B SaaS landing page.

5. **Light mode is working well; dark mode needs a warm register and opacity correction.** Light mode: warm cream (R=253) → cool sky (R=238) alternation every section, photo cards with strong shadows, amber icon colors, glass badges — premium and legible. Dark mode: same layout, all amber replaced with blue, no tonal alternation, sub-threshold texture, no warm glass. Fix priority: (1) raise decoration opacities to 8–14% effective, (2) introduce warm dark register in Benefits + TrustStats, (3) add backdrop-blur to HowItWorks/WhoWeServe/Benefits cards, (4) connect atmosphere bloom to scroll entry.

---

## Audit Method & Data Provenance (v3 Desktop)

### Viewport

All data in this document is from **1440px desktop** Playwright viewport. Dev server `localhost:5173`. Navigated to landing via logo click (per `docs/REF_AI_BROWSER_NAVIGATION.md`).

### Dark Mode Verification

Dark mode toggled via `button.fixed` (floating "☀️ Light / 🌙 Dark" toggle). Verified: button text → "🌙 Dark" + hero background confirmed `rgb(10,26,56)`. Backgrounds collected via `getComputedStyle(el).backgroundImage` (not `.backgroundColor` — returns transparent for gradient backgrounds).

### Data Collection

Playwright `page.evaluate()` for all measurements:

- Backgrounds: `backgroundImage` → parse first `rgb()` → B-channel
- Cards: query `.rounded-2xl`, `.rounded-xl`, `[class*=backdrop-blur]` → collect `backgroundColor + backgroundImage + backdropFilter`
- Glass counts: `backdropFilter !== 'none'` per section
- Touch targets: `offsetHeight` of interactive elements
- Page height: `document.documentElement.scrollHeight = 7507px`

### Screenshots

`docs/audit-assets/landing-2026-05-02/desktop-1440-{light,dark}-{full,hero}.png`

### Key Correction vs v2 Audit

v2 stated HowItWorks and WhoWeServe cards were "transparent ghost boxes." **Incorrect.** Current DOM: both have dark gradient backgrounds (`rgba(15,30,60,0.30)→rgba(10,18,40,0.75)`). Issue is low contrast — dark navy gradient on dark navy section — not missing surface. Categorized as P1-contrast, not P0-missing.

---

## Section-by-Section Analysis

For each section: **background · decorations · card surfaces · typography · glass count · scroll animation · separators · mobile behavior · mode fidelity · issues**

---

### 0. LandingPageHeader

| Field                   | Light Mode                                                                   | Dark Mode                                                        |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Background (unscrolled) | `rgba(250, 247, 240, 0.25)` — warm parchment 25%                             | `rgba(12, 25, 41, 0.30)` — deep navy 30%                         |
| Background (scrolled)   | `rgba(250,247,240,0.9)` + `backdrop-blur-2xl` + warm amber border            | `rgba(12,25,41,0.95)` + `backdrop-blur-2xl` + blue-400/15 border |
| Separator (scrolled)    | `border-[rgba(200,180,150,0.22)]` + `shadow-[0_4px_24px_rgba(0,0,0,0.06)]`   | `border-blue-400/15` + `shadow-[0_4px_24px_rgba(2,6,23,0.3)]`    |
| Nav links               | How It Works, Who We Serve, About — `text-slate-600`, hover `text-slate-800` | `text-blue-200/80`, hover `text-blue-100`                        |
| CTA buttons             | Dashboard (icon + text, home icon) + profile avatar                          | Dashboard (blue gradient) + profile avatar                       |
| Mobile behavior         | Hamburger menu, all nav hidden behind drawer                                 | Same; `mobileMenuOpen` locks scroll                              |
| Glass elements          | 3 (hamburger button, dashboard button, profile button)                       | 3                                                                |
| Touch targets           | All buttons min-h-[44px] ✓                                                   | All buttons min-h-[44px] ✓                                       |
| Appearance toggle       | Hidden (`display:none`) — not user-accessible                                | Hidden                                                           |
| Issues                  | P3: appearance toggle exists but is inaccessible to users                    |                                                                  |

---

### 1. HeroSection

| Field                        | Light Mode                                                                                                                              | Dark Mode                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Background                   | `linear-gradient(180deg, #fdfcf9 0%, #f8f8f5 40%, #f4f5f8 100%)` — warm cream → neutral                                                 | `linear-gradient(180deg, #0a1a38 0%, #0d2244 40%, #091832 100%)` — deep navy                              |
| Primary atmosphere           | Amber radial ellipses: `rgba(200,165,100,0.12)` ellipse at top-left, `rgba(200,165,100,0.10)` ellipse at bottom-right                   | Blue radial ellipses: `rgba(59,130,246,0.18)` ellipse at top-left, `rgba(37,99,235,0.10)` at bottom-right |
| Blur pools                   | `bg-amber-200/[0.18] blur-[120px]` (W: 352px) + two supporting amber pools                                                              | `bg-blue-500/[0.12] blur-[140px]` (W: 448px) + `bg-indigo-500/[0.06] blur-[160px]`                        |
| Texture                      | `rgba(200,170,110,0.025)` dot grid × 0.40 = **1.0% effective**                                                                          | `rgba(59,130,246,0.035)` dot grid × 0.35 = **1.2% effective**                                             |
| Bottom fade                  | `via-[#eef5ff]/60 to-[#eef5ff]` — blends to HowItWorks sky blue                                                                         | `to-[#071a34]/50` — fades to dark navy                                                                    |
| Animated orbs (desktop only) | sm:block Car-icon orb (`animate-orb-drift`) + md:block small orb (`animate-orb-float`) + lg:flex rounded car orb (`animate-orb-rotate`) | Same positions, blue colors: `bg-blue-400/60`, `bg-indigo-400/50`, `bg-blue-500/15`                       |
| H1 typography                | 28px mobile / 36px sm / 44px lg / 48px xl — `text-slate-800` + `text-blue-500` accent                                                   | Same scale — `text-slate-100` + `text-blue-500` accent, `textShadow: "0 2px 8px rgba(0,0,0,0.3)"`         |
| Sub-paragraph                | `text-slate-600`, 16px, max-w-lg                                                                                                        | `text-blue-100/70`                                                                                        |
| Trust badge                  | `border-[rgba(200,180,150,0.22)] bg-[rgba(255,251,245,0.55)]` + green pulse dot                                                         | `border-[rgba(96,165,250,0.25)] bg-[rgba(59,130,246,0.1)]`                                                |
| Value carousel               | 3 statements, 3.8s rotation, `prefersReducedMotion` guard                                                                               | Same                                                                                                      |
| Hero image                   | Toyota damaged car, 445×278, `animate-float-slow` context                                                                               | Same image                                                                                                |
| Floating callout chips       | 3 chips: "3 Bids Received / Avg. <48 hrs", "NY Active", "Repair Completed!" — `animate-float-slow`                                      | Same                                                                                                      |
| CTA buttons                  | "Start New Report" 52px min-height, `rounded-[1.7...]`                                                                                  | "Go to Dashboard" (if signed in)                                                                          |
| Glass count                  | 9                                                                                                                                       | 8                                                                                                         |
| Scroll animation             | Entry fade-up on load (120ms delay), not scroll-triggered                                                                               | Same                                                                                                      |
| Mobile                       | H1 28px, 4 orbs hidden, hero image visible, callout chips visible                                                                       | HorizOverflow 489px vs 485px (4px, likely orb bleed)                                                      |
| **Issues**                   | Light amber vs dark blue is a **mode temperature mismatch** — they feel like different products                                         | P1: 3 orbs hidden mobile. P2: 1.2% dot texture invisible                                                  |

---

### 2. HowItWorksSection

| Field                          | Light Mode                                                                                                                                                                                                  | Dark Mode                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Background                     | `linear-gradient(175deg, #eef5ff 0%, #e8f1fd 45%, #e3edfc 100%)` — cool sky blue                                                                                                                            | `linear-gradient(175deg, #071a34 0%, #0a2842 45%, #081e38 100%)` — deep navy                        |
| B-channel max                  | 255 (pure sky)                                                                                                                                                                                              | 66                                                                                                  |
| Primary atmosphere             | Amber `rgba(200,170,110,0.02)` horizontal lines × 0.50 + warm `rgba(210,180,130,0.10)` ellipse + amber pools                                                                                                | Blue `rgba(59,130,246,0.04)` horizontal lines × 0.50 + `rgba(59,130,246,0.12)` ellipse + blue pools |
| Line texture effective opacity | ~1.0%                                                                                                                                                                                                       | ~2.0%                                                                                               |
| Blur pools                     | `bg-amber-200/[0.12] blur-[110px]` + `bg-sky-400/[0.10] blur-[130px]`                                                                                                                                       | `bg-blue-500/[0.09] blur-[120px]` + `bg-indigo-400/[0.06] blur-[110px]`                             |
| Step cards (3)                 | `rounded-2xl`, transparent `rgba(0,0,0,0)` background                                                                                                                                                       | `rgba(0,0,0,0)` — fully transparent, **no gradient set in source**                                  |
| Card border                    | `border border-sky-200/50`                                                                                                                                                                                  | `0.625px solid oklab(0.809 / 0.22)` ≈ sky-300/22 — hairline thin                                    |
| Card backdrop-blur             | None                                                                                                                                                                                                        | None                                                                                                |
| Card icons                     | Camera, FileCheck, Wrench — in step circle w/ solid background                                                                                                                                              | Same                                                                                                |
| Vehicle inspection image       | Present (vehicleInspectionImage prop)                                                                                                                                                                       | Same                                                                                                |
| Decorative orbs                | sm: sky-400/14% orb (orb-float) + md: sky-300/12% orb (orb-drift) + lg: wrench icon orb (orb-rotate)                                                                                                        | sm: blue-400/50%, md: blue-400/55% (orb-drift), lg: blue-500/15% icon orb                           |
| Separator                      | `via-sky-300/30` 1px                                                                                                                                                                                        | `via-blue-400/30` 1px                                                                               |
| Scroll animation               | `useScrollAnimation(0.1)` — cards cascade in with `transitionDelay`                                                                                                                                         | Same                                                                                                |
| Glass count                    | 2                                                                                                                                                                                                           | 1                                                                                                   |
| **Issues**                     | **P0-CRITICAL: Step cards have zero background surface in dark mode.** Transparent cards on dark navy = cards are invisible except for hairline 0.6px border. These cards explain the core product process. | P1: 5 orbs hidden on mobile. P2: 1-2% texture opacity invisible.                                    |

**Dark mode card analysis (HowItWorks):**
The step card source shows no `style.background` attribute — the card `div` uses only Tailwind border classes. Contrast with BenefitsSection cards which explicitly set `background: linear-gradient(180deg, rgba(30,27,75,0.30)...)` in dark mode. HowItWorks step cards have NO inline background — they are truly empty containers with a faint border.

---

### 3. BenefitsSection

| Field                     | Light Mode                                                                                                 | Dark Mode                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background                | `linear-gradient(182deg, #faf9f6 0%, #f5f4f0 42%, #f0eeea 100%)` — warm ivory/parchment                    | `linear-gradient(182deg, #0e1838 0%, #14204c 42%, #0c1634 100%)` — deep indigo (note: INDIGO not pure blue)                                                         |
| Tonal character           | Warmest non-hero section in light mode                                                                     | Uses indigo (R≈13, G≈22, B≈60–76) vs other sections' pure navy                                                                                                      |
| Atmosphere — unique       | INDIGO/violet atmosphere in dark mode: `rgba(99,102,241,0.14)` top ellipse + `rgba(79,70,229,0.09)` bottom | Cross-hatch texture: `rgba(99,102,241,0.035)` diagonal × 0.60 = ~2.1% effective                                                                                     |
| Blur pools                | `bg-amber-200/[0.16] blur-[120px]` (light)                                                                 | `bg-indigo-500/[0.09] blur-[140px]` + `bg-indigo-400/[0.06] blur-[120px]`                                                                                           |
| Photo cards (3)           | 420×224px images: car damage, spray booth, dent repair                                                     | Same images                                                                                                                                                         |
| Card background           | `linear-gradient(180deg, rgba(255,255,255,0.85)→rgba(248,250,253,0.75))` — white glass                     | `linear-gradient(180deg, rgba(30,27,75,0.30)→rgba(15,14,40,0.75))` — dark indigo glass                                                                              |
| Card shadow               | `0 10px 38px rgba(0,0,0,0.12), 0 2px 8px rgba(200,180,150,0.14), inset 0 1px 0 rgba(255,250,240,0.90)`     | `0 8px 32px rgba(2,6,23,0.50), inset 0 1px 0 rgba(129,140,248,0.14)`                                                                                                |
| Card backdrop-blur        | None (uses `boxShadow` glass illusion)                                                                     | None                                                                                                                                                                |
| Floating badges on images | "Guided Intake", "Repair Network", "Transparent Bids" — `bg-blue-600/80`, `animate-float-slow`             | Same                                                                                                                                                                |
| Hover effects             | `hover:scale-110` on image, `hover:-translate-y-1` on card, `hover:shadow-2xl`                             | Same                                                                                                                                                                |
| Section badge             | "Built for Real Repairs" — amber dot + amber text                                                          | "Built for Real Repairs" — indigo-200 text                                                                                                                          |
| Separator                 | `via-amber-300/25`                                                                                         | `via-indigo-400/30`                                                                                                                                                 |
| Orbs                      | sm: amber-400/12% `animate-orb-breathe` + md: amber-300/10% `animate-orb-glow`                             | sm: indigo-400/55% (orb-breathe) + md: indigo-400/45% (orb-glow)                                                                                                    |
| Glass count               | 4                                                                                                          | 4                                                                                                                                                                   |
| **Issues**                | None significant                                                                                           | P2: Card backgrounds exist but at 30% opacity — visible but flat. Indigo vs navy creates slight differentiation but ~15-point B shift. Dark mobile loses both orbs. |

---

### 4. WhoWeServeSection

| Field              | Light Mode                                                                                                                                                                  | Dark Mode                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Background         | `linear-gradient(178deg, #f2f8ff→#eaf3ff→#e4efff→#dde9ff)` — deepest periwinkle-sky in light mode                                                                           | `linear-gradient(177deg, #0c1c34→#10243e→#0a1a30)` — medium navy |
| B-channel max      | 255 (pure sky)                                                                                                                                                              | 62                                                               |
| Atmosphere         | Amber dot grid `rgba(200,170,110,0.025)` × 0.40 + amber ellipses + sky/blue blur pools                                                                                      | Blue dot grid `rgba(59,130,246,0.04)` × 0.40 + blue ellipses     |
| Role cards (3)     | For Customers (Car), For Repair Shops (Wrench), For Insurers (Shield)                                                                                                       | Same                                                             |
| Card backgrounds   | **DOM: `rgba(0,0,0,0)` — source confirms no inline background gradient in dark mode**                                                                                       | Same — transparent                                               |
| Card borders       | Light: `border-${primaryColor}30` (blue at ~19%) or `border-sky-200/50`                                                                                                     | Dark: `border-blue-300/22` — hairline                            |
| Card backdrop-blur | None                                                                                                                                                                        | None                                                             |
| Icon backgrounds   | `bg-[primaryColor]` circle with white icon                                                                                                                                  | `bg-blue-400/15` circle with `text-blue-400` icon                |
| Benefit items      | 4 checkmark items per role                                                                                                                                                  | Same                                                             |
| Trust pills row    | "Everyone Wins" · "$0 for Customers" · "NY Service Area" · "Transparent Bidding"                                                                                            | Same, darker pill colors                                         |
| Section badge      | "Serving the Whole Ecosystem" — sky blue dot                                                                                                                                | Blue-200 text                                                    |
| Orbs               | sm: sky-400/14% (orb-drift) + lg: shield icon orb (orb-rotate) + md: amber-300/10% (orb-float)                                                                              | sm: blue-400/45%, lg: blue-500/15%, md: indigo-400/40%           |
| Separator          | `via-sky-300/30` 1px                                                                                                                                                        | `via-blue-400/25` 1px                                            |
| Glass count        | 2                                                                                                                                                                           | 1                                                                |
| **Issues**         | **P0-HIGH: Identical transparent card issue as HowItWorks.** Three role-definition cards (core audience segments) have no background in dark mode — invisible on dark navy. | P1: 3 orbs hidden mobile.                                        |

---

### 5. AboutOpportunitySection

| Field                 | Light Mode                                                                               | Dark Mode                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Background            | `linear-gradient(180deg, #ffffff→#fdfcfb→#f9f8f7→#f5f4f2)` — clean white to warm cream   | `linear-gradient(180deg, #081834→#0c2040→#071630)` — medium deep navy                                                                            |
| B-channel max         | 255 (white)                                                                              | 64                                                                                                                                               |
| Section element class | No extra class                                                                           | **Explicit `dark` class added:** `className={... isLightAppearance ? "" : "dark"}`                                                               |
| Why `dark` class?     | —                                                                                        | Forces accordion child elements to use dark Tailwind variants                                                                                    |
| Atmosphere            | Amber diagonal stripes + amber ellipses + amber blur pools                               | Blue diagonal stripes + blue ellipses + blue blur pools                                                                                          |
| Accordion cards (3)   | Clear Decision-Making (Compass), Shared Process (Workflow), Accountability (ShieldCheck) | Same                                                                                                                                             |
| Card background       | Transparent with `hasBackdropBlur: true` — glass but no solid bg                         | Transparent + `backdrop-blur` — glass but essentially empty                                                                                      |
| Card expanded content | Detailed `expandedText` per card revealed on click                                       | Same                                                                                                                                             |
| "Learn more" buttons  | Height: **20px — FAILS 44px min touch target**                                           | 20px — same issue                                                                                                                                |
| Section badge         | "About BidOnDent" — amber dot                                                            | Blue-200 text                                                                                                                                    |
| Orbs                  | sm: amber-400/12% (orb-glow) + lg: compass icon orb (orb-rotate)                         | sm: blue-400/50%, lg: blue-500/15%                                                                                                               |
| Separator             | `via-amber-300/25`                                                                       | `via-blue-400/25` 1px                                                                                                                            |
| Glass count           | 6                                                                                        | 5                                                                                                                                                |
| **Issues**            | Light mode works.                                                                        | P1: Accordion "Learn more" — 20px height touch target fail. P2: Cards have blur but no backing color, so glass effect is invisible in dark mode. |

---

### 6. TrustStatsSection (renders as "Built on Transparency")

| Field                | Light Mode                                                                                             | Dark Mode                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Background           | `linear-gradient(176deg, #faf8f4→#f7f5ef→#f2efe8→#ece8df)` — warmest cream-gold, deepest warm in light | `linear-gradient(176deg, #0e2448→#152e58→#102850)` — the MOST VISUALLY DISTINCT dark section (B max: 88)                                                                                               |
| B-channel max        | 239 (cream-gold)                                                                                       | 88 — 20+ points above adjacent sections                                                                                                                                                                |
| Atmosphere           | Fine dot grid `rgba(180,150,100,0.025)` × 0.40 + amber/gold ellipses + large amber blur pools          | **White dot grid** `rgba(255,255,255,0.07)` × 0.40 = ~2.8% (highest of all sections) + blue ellipses                                                                                                   |
| Commitment cards (4) | Structured Intake, Transparent Bids, Operational Tracking, Review Controls                             | Same                                                                                                                                                                                                   |
| Card background      | `linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,254,0.72))` + strong multi-layer shadow    | `bg-[linear-gradient(180deg,rgba(10,22,44,0.78),rgba(8,18,36,0.68))]` — defined dark surface                                                                                                           |
| Card backdrop-blur   | `backdrop-blur-xl` ✓ — **only section (except Coverage) with proper full glass on ALL cards**          | `backdrop-blur-xl` ✓                                                                                                                                                                                   |
| Card hover           | `hover:-translate-y-1`, `hover:shadow-[0_28px_56px_...]`, `hover:bg-[linear-gradient(better)]`         | Same + `hover:border-blue-300/24`                                                                                                                                                                      |
| Icon treatment       | `bg-[rgba(251,242,222,0.72)] border-[rgba(200,155,70,0.30)]` amber icon background                     | `bg-white/10 border-white/[0.07]` muted                                                                                                                                                                |
| Icon color           | `text-amber-600`                                                                                       | `text-blue-300`                                                                                                                                                                                        |
| Section heading      | "Built on Transparency"                                                                                | Same                                                                                                                                                                                                   |
| Section badge        | "Our Commitments" — amber dot, amber text                                                              | "Our Commitments" — blue-200 text                                                                                                                                                                      |
| Separator            | `via-amber-300/25`                                                                                     | `via-blue-400/25`                                                                                                                                                                                      |
| Orbs                 | sm: amber-400/12% (orb-breathe) + md: amber-300/10% (orb-float)                                        | sm: blue-400/45%, md: indigo-400/40%                                                                                                                                                                   |
| Glass count          | 9                                                                                                      | 9                                                                                                                                                                                                      |
| **Issues**           | Best-structured section. Correct glass pattern, hover states, amber/warm identity.                     | P2: Icon colors drop from expressive amber to muted blue-300, losing the gold "trust" visual language. Dark mode is noticeably more distinct (B=88) — this is the one success in dark differentiation. |

---

### 7. OperatingRegionsSection (renders as "Coverage")

| Field                 | Light Mode                                                                                                       | Dark Mode                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Background            | `linear-gradient(180deg, #f2f5f9→#edf1f7→#e8ecf2)` — cool blue-gray                                              | `linear-gradient(180deg, #071830→#0a2038→#06142a)` — deep navy anchor                                         |
| B-channel max         | 242                                                                                                              | 56                                                                                                            |
| Map tile mode         | Road map (light)                                                                                                 | Night map (dark) — auto-switching based on `coverage.tileMode`                                                |
| Atmosphere            | Radial dot grid `rgba(59,130,246,0.04)` + blue ellipses + small blur pools                                       | Topographic grid: `rgba(59,130,246,0.04)` horizontal + `rgba(59,130,246,0.025)` vertical lines                |
| Map container         | `rounded-[2.2rem]` + strong multi-shadow box                                                                     | Same; dark shadow `0 36px 90px rgba(2,6,23,0.50)`                                                             |
| Map surface           | Light tile theme, `inlinePanelTone: "light"` forced                                                              | Night tiles, `inlinePanelTone` = `coverage.surfaceTone`                                                       |
| Panel glass treatment | `stageTheme.shellClassName` + `stageTheme.panelStrongClassName` from `getMapSurfaceTheme()`                      | Same — theme system handles it                                                                                |
| Overlay chips         | "Live Coverage", "Coverage map", "Set an origin to see shops" (or shop count), map mode label, origin mode label | Same                                                                                                          |
| Search panel          | CoverageSearchPanel with input + geolocation + zoom                                                              | Same                                                                                                          |
| Shop list             | CoverageNearestShops (0 results without origin)                                                                  | Same                                                                                                          |
| Section height        | 2125px (map + list stacked)                                                                                      | Same                                                                                                          |
| Glass count           | 11 — highest of all sections (map controls)                                                                      | 11                                                                                                            |
| Section heading       | "Find shops near you, right on the map." — `text-slate-900`                                                      | Gradient text: `from-white via-blue-100 to-blue-200 bg-clip-text`                                             |
| **Issues**            | None — map is the atmosphere.                                                                                    | P4: 2125px height makes mobile Coverage section a long scroll journey. Night map tiles auto-switch correctly. |

---

### 8. BusinessInquirySection

| Field                       | Light Mode                                                                                        | Dark Mode                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background                  | `linear-gradient(180deg, #f5f7fb→#f8f9fc→#f4f6fb→#f0f4f9)` — light blue-white                     | `linear-gradient(180deg, #071828→#0a2036→#081a30)` — near-darkest section (B max: 54)                                                                                                                 |
| B-channel max               | 252                                                                                               | 54                                                                                                                                                                                                    |
| Atmosphere                  | Amber dot grid + amber ellipses + amber blur pools                                                | Blue dot grid `rgba(59,130,246,0.025)` × 0.30 = **0.75% effective** (lowest of all sections) + blue ellipses at 5-8%                                                                                  |
| Form container card         | `border-[rgba(200,180,150,0.3)] backdrop-blur-sm` + warm glass background                         | `border-blue-400/22 backdrop-blur-sm` + `rgba(10,18,35,0.86)→rgba(8,14,28,0.82)` dark glass                                                                                                           |
| Action rows (tap to expand) | `bgColor: rgba(255,255,255,0.05)` = white 5% on light                                             | **white 5% on dark navy = barely visible**                                                                                                                                                            |
| Row height                  | 91px                                                                                              | 91px — good touch target                                                                                                                                                                              |
| Arrow buttons               | "Join" row: `rgb(0, 61, 130)` — solid royal blue                                                  | Same                                                                                                                                                                                                  |
| Insurer button              | `rgb(30, 58, 95)` — dark blue                                                                     | Same                                                                                                                                                                                                  |
| Section heading             | "Shop Signup and Insurer Partnerships"                                                            | Same — `text-slate-100`                                                                                                                                                                               |
| Section badge               | "Growth & Partnerships" — blue dot                                                                | Blue-200 text                                                                                                                                                                                         |
| Orbs                        | sm: blue-400/30% (orb-drift) + lg: building icon orb (orb-rotate) + md: indigo-400/22% (orb-glow) | sm: blue-400/40%, lg: blue-500/15%, md: blue-400/30%                                                                                                                                                  |
| Glass count                 | 5                                                                                                 | 2                                                                                                                                                                                                     |
| **Issues**                  | None significant.                                                                                 | P2: Business Inquiry is the section with the LOWEST atmosphere opacity (0.75%) — it feels like the "dead zone" of the page. White/5% action rows are barely distinguishable from the dark background. |

---

### 9. CTASection

| Field               | Light Mode                                                                                    | Dark Mode                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background          | `linear-gradient(180deg, #e8f1fc→#ddeaf9→#d5e5f8→#cde0f7)` — clearly blue sky (B max: 247)    | `linear-gradient(180deg, #0c1e4a→#142a5c→#102450)` — the SECOND most distinct dark section (B max: 92)                                                                                                        |
| B-channel max       | 247                                                                                           | 92                                                                                                                                                                                                            |
| CTA card background | `rgba(20,42,92,0.88)→rgba(12,30,68,0.86)` — dark navy card on blue-sky section (light mode)   | Same: dark navy card — but now sits on a similar dark background                                                                                                                                              |
| Card border         | `rgba(96,165,250,0.30)` — blue-400/30                                                         | Same                                                                                                                                                                                                          |
| Card shadow         | `0 40px 80px rgba(2,6,20,0.62), 0 14px 40px rgba(0,0,0,0.30), 0 0 120px rgba(37,99,235,0.12)` | `0 24px 56px rgba(3,10,24,0.55), 0 0 80px rgba(37,99,235,0.08)`                                                                                                                                               |
| Ambient ring glow   | `0 0 120px rgba(37,99,235,0.22), 0 0 240px rgba(37,99,235,0.11)`                              | `0 0 100px rgba(37,99,235,0.18), 0 0 200px rgba(37,99,235,0.09)`                                                                                                                                              |
| Decorative squares  | Top-left: `w-12→w-16 h-12→h-16 rotate-12 from-blue-300 to-blue-500 opacity-85`                | Same, `opacity-80`                                                                                                                                                                                            |
| Decorative circle   | Bottom-right: `w-16→w-24 h-16→h-24 from-blue-300 to-indigo-500 opacity-80`                    | Same, `opacity-90`                                                                                                                                                                                            |
| Glass badge         | `bd-glass-badge`: "Start Your Repair Journey" — **uses design system class** ✓                | Same                                                                                                                                                                                                          |
| CTA button          | `rgba(37,99,235,0.98)→rgba(30,64,175,0.98)` + strong blue glow                                | Same                                                                                                                                                                                                          |
| CTA backdrop-blur   | **None on main card** — opacity-based dark glass, not blur                                    | None                                                                                                                                                                                                          |
| Glass count         | 1 (bd-glass-badge only)                                                                       | 0                                                                                                                                                                                                             |
| Orbs on desktop     | None visible                                                                                  | None (atmosphere layers only)                                                                                                                                                                                 |
| Sub-text            | "Free to use · No obligation · Get quotes in under 48 hrs"                                    | Same                                                                                                                                                                                                          |
| **Issues**          | Light mode: dark navy card on sky-blue section = strong contrast, premium conversion feel.    | Dark mode: dark navy card on dark navy section = card blends into background at B≈74–92 vs B≈52–78 — ~18-point gap. P2: No glass on the most important card. P2: The "poppy" closing moment is visually flat. |

---

### 10. FooterSection

| Field           | Light Mode                                                                                                                                                                                                                                           | Dark Mode                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Background      | `linear-gradient(180deg, #eef1f7→#e8ecf3→#e4e8f0)` — cool blue-gray                                                                                                                                                                                  | `linear-gradient(180deg, #061428→#040e1e)` — near-black (B max: 30 = darkest on the page) |
| B-channel max   | 240                                                                                                                                                                                                                                                  | 30                                                                                        |
| Atmosphere      | Fine dot `rgba(200,170,110,0.015)` × 0.35 + amber/blue blur pools                                                                                                                                                                                    | White dot `rgba(255,255,255,0.02)` × 0.25 = **0.5% effective** (lowest texture on page)   |
| Layout          | 4-column grid (Brand, For Customers, For Businesses, Company)                                                                                                                                                                                        | Same                                                                                      |
| Brand column    | BrandLogo + tagline + Mail + MapPin (New York Service Region)                                                                                                                                                                                        | Same — `text-blue-100/55`                                                                 |
| Social links    | **None**                                                                                                                                                                                                                                             | **None**                                                                                  |
| Link hover      | `hover:text-blue-600 hover:translate-x-1`                                                                                                                                                                                                            | `hover:text-blue-100`                                                                     |
| Separator above | `via-amber-300/20` 1px (light)                                                                                                                                                                                                                       | `via-blue-400/10` 1px (dark — notably DIMMER than other separators)                       |
| Glass count     | 0                                                                                                                                                                                                                                                    | 0                                                                                         |
| **Issues**      | P4: No social links for early-stage product. Footer separator in dark mode is even dimmer than other sections (`/10` vs `/25-30`). Near-black footer feels disconnected from the page's navy system — it's a dead drop rather than a graceful close. |

---

## Dark Mode Quantified: The Monotone Problem (Desktop v3 — Live DOM)

### Section Heights + B-Channel (Dark Mode First-Stop RGB)

| Section          | Height (desktop) | Dark bgGradient start | B-channel | Rank      |
| ---------------- | ---------------- | --------------------- | --------- | --------- |
| BusinessInquiry  | 606px            | `rgb(7,24,40)`        | **40**    | darkest   |
| Coverage         | 1810px           | `rgb(7,24,48)`        | **48**    |           |
| Hero             | 719px            | `rgb(10,26,56)`       | **56**    |           |
| HowItWorks       | 597px            | `rgb(7,26,52)`        | **52**    |           |
| Benefits         | 780px            | `rgb(14,24,56)`       | **56**    |           |
| WhoWeServe       | 674px            | `rgb(12,28,52)`       | **52**    |           |
| AboutOpportunity | 712px            | `rgb(8,24,52)`        | **52**    |           |
| TrustStats       | 589px            | `rgb(14,36,72)`       | **72**    |           |
| CTA              | 618px            | `rgb(12,30,74)`       | **74**    | brightest |
| Footer           | 402px            | `rgb(6,20,40)`        | **40**    | —         |

**Total page height (desktop): 7,507px**

**Core monotone cluster: HowItWorks / Benefits / WhoWeServe / AboutOpportunity = B-channel 52–56, spread = 4 points across ~2,763px of content.** These are the four middle sections — the product explanation, value proof, audience definition, and about — which represent the bulk of the persuasive scroll. They are visually indistinguishable from each other in dark mode.

**TrustStats (B=72) and CTA (B=74) are the only breakouts** — providing 20-point relief after the cluster. Coverage (B=48) and BusinessInquiry (B=40) are darker anchor sections.

### Light Mode Tonal Rhythm (Desktop v3 — Live DOM)

| Section          | bgGradient start   | R-channel | B-channel | Temperature      |
| ---------------- | ------------------ | --------- | --------- | ---------------- |
| Hero             | `rgb(253,252,249)` | **253**   | 249       | Warm cream       |
| HowItWorks       | `rgb(238,245,255)` | **238**   | 255       | Cool sky         |
| Benefits         | `rgb(250,249,246)` | **250**   | 246       | Warm ivory       |
| WhoWeServe       | `rgb(242,248,255)` | **242**   | 255       | Cool periwinkle  |
| AboutOpportunity | `rgb(255,255,255)` | **255**   | 255       | Clean white      |
| TrustStats       | `rgb(250,248,244)` | **250**   | 244       | Warm cream-gold  |
| Coverage         | `rgb(242,245,249)` | **242**   | 249       | Cool blue-gray   |
| BusinessInquiry  | `rgb(245,247,251)` | **245**   | 251       | Light blue-white |
| CTA              | `rgb(232,241,252)` | **232**   | 252       | Sky blue         |

**Light mode warm/cool alternation**: R-channel oscillates 232–255, B-channel oscillates 244–255. The rhythm produces warm (amber/ivory) vs cool (sky/periwinkle) alternating sections every 1–2 sections. Dark mode has no equivalent — all sections are monochromatic blue-navy with B=40–74.

### Glass Count Per Section (Dark Mode, Desktop)

| Section          | Glass elements (backdrop-filter) | Best card surface                        |
| ---------------- | -------------------------------- | ---------------------------------------- |
| Hero             | 8                                | Trust badge `rgba(59,130,246,0.1)`       |
| HowItWorks       | 1                                | Cards: gradient only, no blur            |
| Benefits         | 4                                | Cards: gradient only, no blur            |
| WhoWeServe       | 1                                | Cards: gradient only, no blur            |
| AboutOpportunity | 5                                | Cards: `blur(8px)` but transparent bg    |
| TrustStats       | **9**                            | `blur(24px)` + gradient ← **BEST**       |
| Coverage         | **14**                           | Map controls                             |
| BusinessInquiry  | 2                                | Action rows: `white/5%`                  |
| CTA              | 1                                | `bd-glass-badge` only — card has NO blur |

---

## Section-by-Section Summary (Desktop v3)

### Header

- Light: `rgba(250,247,240,0.25)` + `blur(12px)` — warm parchment. Dark: `rgba(12,25,41,0.30)` + `blur(12px)` — deep navy.
- All buttons min-h-[44px] ✓. Appearance toggle is hidden (`display:none`) — not user-accessible.

### 1. Hero

- Light: `rgb(253,252,249)→rgb(248,248,245)→rgb(244,245,248)` — warm cream → neutral. Amber atmosphere ellipses + blur pools.
- Dark: `rgb(10,26,56)→rgb(13,34,68)→rgb(9,24,50)` — deep navy. Blue atmosphere ellipses + blur pools.
- Glass: 8 (light), 8 (dark). Three animated orbs visible on desktop (`animate-orb-drift`, `animate-orb-float`, `animate-orb-rotate`).
- Mode mismatch: warm amber (light) vs cold blue (dark) — feels like two different products.

### 2. HowItWorks

- Light: `rgb(238,245,255)→rgb(232,241,253)→rgb(227,237,252)` — cool sky. Cards: `linear-gradient(rgba(255,255,255,0.85)→rgba(248,250,253,0.75))` — white glass.
- Dark: `rgb(7,26,52)→rgb(10,40,66)→rgb(8,30,56)` — deep navy. Cards: `linear-gradient(rgba(15,30,60,0.30)→rgba(10,18,40,0.75))` — dark navy gradient.
- **No backdrop-blur on cards in dark mode.** 0.625px sky-200/28 border in light, sky-200/22 in dark.
- Glass: 1 (light), 1 (dark). Decoration: horizontal line grid `rgba(59,130,246,0.04)` × ~0.5 = 2% effective.
- **P1: Cards have gradient but zero blur — they read as flat on the dark navy background.**

### 3. Benefits

- Light: `rgb(250,249,246)→rgb(245,244,240)→rgb(240,238,234)` — warm ivory. Cards: `rgba(255,255,255,0.85)→rgba(248,250,253,0.75)` white glass.
- Dark: `rgb(14,24,56)→rgb(20,32,76)→rgb(12,22,52)` — deep indigo. Cards: `linear-gradient(rgba(30,27,75,0.30)→rgba(15,14,40,0.75))` — indigo gradient.
- Photo cards 389px tall each. Badges: "Guided Intake", "Repair Network", "Transparent Bids".
- Glass: 4 (light), 4 (dark). **No blur on cards.**

### 4. WhoWeServe

- Light: `rgb(242,248,255)→rgb(234,243,255)→rgb(221,233,255)` — deepest periwinkle. Cards: `rgba(255,255,255,0.85)→rgba(248,250,253,0.75)` white glass.
- Dark: `rgb(12,28,52)→rgb(16,36,62)→rgb(10,26,48)` — medium navy. Cards: `linear-gradient(rgba(15,30,60,0.35)→rgba(14,22,38,0.75))` — dark navy gradient.
- Glass: 1 (light), 1 (dark). **No blur on cards.** B=52 — visually same as HowItWorks (B=52) and AboutOpportunity (B=52).

### 5. AboutOpportunity

- Light: `rgb(255,255,255)→rgb(253,252,251)→rgb(249,248,247)` — clean white. Section adds explicit `dark` CSS class in dark mode.
- Dark: `rgb(8,24,52)→rgb(12,32,64)→rgb(7,22,48)` — deep navy. Cards: transparent bg + `blur(8px)` — glass effect nearly invisible without a backing surface.
- **"Learn more" buttons: 20×98px — FAILS 44px minimum touch target.** (× 3 buttons)
- Glass: 5 (light), 5 (dark).

### 6. TrustStats ("Built on Transparency")

- Light: `rgb(250,248,244)→rgb(247,245,239)→rgb(236,232,223)` — warmest cream-gold.
- Dark: `rgb(14,36,72)→rgb(21,46,88)→rgb(16,40,80)` — **B=72 — most visually distinct section in dark mode.**
- Cards: `linear-gradient(rgba(10,22,44,0.78)→rgba(8,18,36,0.68))` + **`blur(24px)`** — ONLY section with proper full glass on all 4 cards.
- Glass: 9 — highest non-map section. Icon colors: amber (light) → blue-300 (dark).

### 7. Coverage

- Desktop height: 1810px — dominates the page (24% of total scroll).
- Map tiles: road map (light) / night map (dark) — auto-switch. Glass: 14 (map controls).
- B=48 — one of the darker sections, good anchor.

### 8. BusinessInquiry

- Dark: `rgb(7,24,40)→rgb(10,32,54)→rgb(8,26,48)` — B=40 — darkest content section.
- Action rows: `oklab(0.999.../0.05)` = white/5% — barely distinguishable from dark background.
- Glass: 2 (dark). Lowest decoration opacity: ~0.75% effective — "dead zone" of the page.

### 9. CTA

- Dark: `rgb(12,30,74)→rgb(20,42,92)→rgb(16,36,80)` — B=74 — second most distinct in dark.
- CTA card: `linear-gradient(rgba(20,42,92,0.92)→rgba(12,30,68,0.9))` — **no backdrop-blur on the most important card.**
- Glass: 1 (dark, `bd-glass-badge` only). Separators: all `via-blue-400` 1px.

### 10. Footer

- Dark: `rgb(6,20,40)→rgb(4,14,30)` — near-black. No glass elements.
- No social links. Footer separator `via-blue-400` — consistent with rest of page (all identical in dark mode).

---

## Top 10 Problems (Desktop v3 — Verified by Live DOM)

### P0-1 | Dark mode is a single-temperature cold-blue system

**Severity:** P0 — blocks the product from feeling premium in dark mode  
**Evidence:** Middle cluster of 4 sections (HowItWorks/Benefits/WhoWeServe/AboutOpportunity) = B=52–56, spread = 4 points across 2,763px of content. Light mode alternates warm (R=250) and cool (R=238) every 1–2 sections. Dark mode has no warm register — all amber atmospherics replaced 1:1 with blue.  
**Impact:** Scrolling dark mode = scrolling a single dark blue wall with no chapter breaks. Page feels longer and flatter than it is.  
**Fix:** Introduce warm dark amber for Benefits and TrustStats: `#1a0c06→#231408`. Restore amber blur pools at 22% opacity in those sections.

---

### P1-2 | HowItWorks and WhoWeServe cards have low contrast — 30% navy gradient on 100% navy section, no blur

**Severity:** P1 — high-signal product content is difficult to read in dark mode  
**Evidence (v3 corrected):** Cards DO have gradient backgrounds (`rgba(15,30,60,0.30)→rgba(10,18,40,0.75)`) — NOT transparent ghost boxes as v2 stated. However, zero `backdrop-blur` is applied. Card opacity is 30% navy on 100% navy background — the card barely lifts from the section surface.  
**Compare to TrustStats:** TrustStats cards use `rgba(10,22,44,0.78)` + `blur(24px)` — the 78% opacity + blur creates a clear glass panel. HowItWorks/WhoWeServe at 30% opacity + no blur reads as a shadow outline, not a card surface.  
**Fix:** Add `backdrop-blur-sm` to step/role cards. Raise dark gradient opacity from 30% to 60%: `rgba(10,22,44,0.60)→rgba(6,14,30,0.80)`.

---

### P1-3 | All decorative textures are below the human perception threshold (0.75–2.1% effective)

**Severity:** P1 — the texture system is a no-op, consuming paint budget with no visual output  
**Evidence:** Hero dark dot grid: `rgba(59,130,246,0.035)` × 0.35 = **1.2%**. HowItWorks line grid: `rgba(59,130,246,0.04)` × 0.5 = **2.0%**. BusinessInquiry dot grid: `rgba(59,130,246,0.025)` × 0.30 = **0.75%**. The eye requires ~4–5% luminance difference to perceive texture.  
**Fix:** Raise all decoration opacities. Target: 8–12% effective for dot grids, 10–16% for ellipses, 22–28% for large blur pools. For dot grids: `rgba(59,130,246,0.07)` × opacity-80 = **5.6%** minimum.

---

### P1-4 | AboutOpportunity "Learn more" buttons: 20×98px — fails 44px minimum touch target

**Severity:** P1 (P0 for mobile accessibility)  
**Evidence:** DOM measurement: `height: 20, width: 98`. WCAG 2.5.5 minimum: 44×44px. Design system standard confirmed at 44px (all header buttons). Three buttons (×3 accordion items).  
**Fix:** Add `min-h-[44px] py-3` to the button. Or make the full lower card bar tappable.

---

### P2-5 | All 8 page separators are identical — provide no visual boundary in dark mode

**Severity:** P2 — section transitions are invisible  
**Evidence:** All separators in dark mode: `via-blue-400/x` 1px horizontal gradient line. Light mode uses `via-amber-300/25` for warm sections and `via-sky-300/30` for cool sections — dark mode has no equivalent temperature variation. Between sections where B-channel gap is only 4 points, the separator and the adjacent section backgrounds are visually indistinguishable.  
**Fix:** Major transitions (Hero→HowItWorks, TrustStats→Coverage, Coverage→BusinessInquiry): use 3px separator at 45%. Minor transitions: 1px/30% as-is. Temperature-match the separator color to the source section.

---

### P2-6 | CTA card has zero backdrop-blur — the conversion moment has no material depth

**Severity:** P2 — most important card on the page has no glass treatment  
**Evidence:** `glass count: 1` in CTA section (only the `bd-glass-badge` eyebrow). Main card: `linear-gradient(rgba(20,42,92,0.92)→rgba(12,30,68,0.9))` — opacity-based glass, no `backdrop-filter`. Section B=74, card B≈92 — only 18-point gap.  
**Fix:** Add `backdrop-filter: blur(24px) saturate(1.6)` to CTA card in dark mode. Add a radial lamp bloom behind the card at `rgba(37,99,235,0.15)` 600px blur to give the blur filter something to work through.

---

### P2-7 | BusinessInquiry atmosphere: 0.75% effective opacity — "dead zone" before final conversion

**Severity:** P2 — lowest atmosphere quality section on the page, positioned before CTA  
**Evidence:** Dot grid at `rgba(59,130,246,0.025)` × opacity-30 = 0.75%. Action rows: `white/5%` barely distinguishable from background. B=40 — darkest content section — creates an abrupt flat drop after TrustStats (B=72).  
**Fix:** Raise dot grid to `rgba(59,130,246,0.06)` × opacity-70 = 4.2%. Add a warm-accent orb at sm breakpoint. Raise action row surface to `white/12%` + `blur(8px)`.

---

### P2-8 | Coverage section is 1810px / 24% of total page height — dominates the scroll

**Severity:** P2 — largest section by height creates commitment risk  
**Evidence:** Total page: 7507px. Coverage: 1810px (24.1%). Next largest: Benefits 780px, WhoWeServe 674px. Coverage is not the conversion section but sits in the middle of the page.  
**Fix:** Not a code change — content/UX decision. Coverage map should either (a) have a fixed max-height with "expand" affordance, or (b) confirm the long scroll is intentional as a product demo moment.

---

### P2-9 | No automotive brand identity elements on the page

**Severity:** P2 — the page could be any marketplace  
**Evidence:** Single `<Car>` icon in Hero, hidden at most viewports. No car silhouettes, road line patterns, tread textures, or body shop visual language anywhere else on the page.  
**Fix:** Add a large low-opacity car silhouette SVG (7–9%) as hero background watermark. Add road-dash separator treatment between HowItWorks and Benefits sections.

---

### P3-10 | LandingPageLayout wrapper cool tint bleeds above Hero warm cream in light mode

**Severity:** P3 — minor visual inconsistency at page top  
**Evidence:** Wrapper: `#f7f9fc` (cool blue-gray) vs Hero: `#fdfcf9` (warm cream). Visible before Hero renders on slow connections.  
**Fix:** Change wrapper light-mode start to `#fdfcf9` to match Hero.

---

## Top 10 Opportunities

### OPP-1 | Add warm dark amber sections to mirror light-mode temperature rhythm

**Impact:** Transforms the single biggest problem (P0-1) with high confidence and low risk.  
**How:** Benefits background changes to `#1a0c06→#231408→#1a0a04` in dark mode. BuiltOnTransparency changes to `#1c1004→#2a1808→#1c1002`. Both sections then alternate against cold navy sections (Hero, HowItWorks, WhoWeServe, Coverage) — recreating the warm/cool rhythm in the dark register. Amber blur pools in those sections increase to 20–28% opacity.  
**References:** Light mode amber atmosphere already proven: `bg-amber-200/[0.18]`, `bg-amber-400/30` — convert to dark amber: `rgba(200,130,40,0.18)` at 20%.

---

### OPP-2 | Increase decoration opacity from 1–3% to 8–14% across all sections

**Impact:** Makes the existing texture/depth system actually visible. Zero risk — textures are already in the DOM.  
**How:** Audit every `opacity-X` multiplied by `rgba(...)` value. For anything under 5% effective: triple the opacity value. Target: 8–14% effective for dot grids, 10–16% effective for ellipses, 20–28% for large blur pools.  
**Expected visual result:** Textures provide visible section-character without overwhelming content. Dark mode sections gain individual "fingerprint" from their unique texture patterns.

---

### OPP-3 | Add section-entry atmosphere bloom animation on scroll

**Impact:** The single biggest gain for "feels alive while scrolling."  
**How:** When `useScrollAnimation.isVisible` fires, trigger a CSS animation on the section's primary atmosphere layer: scale from 0.8 to 1.0 at opacity 0→full over 1.4s ease-out. For radial ellipses: `@keyframes atmosphericBloom { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: var(--target-opacity); } }`. This makes the atmospheric depth "materialize" as the user scrolls — each section blooms into existence.  
**Already built:** `useScrollAnimation` already fires `isVisible`. The bloom just needs to be connected to the atmosphere layers.

---

### OPP-4 | Add backdrop-blur to HowItWorks and WhoWeServe cards — already have gradient, just need blur

**Impact:** P1-2 fix — highest-signal product content gets proper glass surface.  
**How:** Cards already have `linear-gradient(rgba(15,30,60,0.30)→rgba(10,18,40,0.75))` applied in dark mode. They just need (a) `backdrop-filter: blur(12px)` added and (b) the gradient first-stop raised from 30% to ~60% opacity. One CSS addition per card per section. Matches TrustStats card pattern (`blur(24px)`) already proven in the codebase.

---

### OPP-5 | Add automotive micro-elements at hero and between sections

**Impact:** Addresses P2-9 (brand identity) + contributes to "car-themed depth."  
**How:**

- Hero: Add a large car silhouette SVG path (`opacity: 7-9%`, positioned top-right, behind the hero image, `pointer-events-none`) — a simplified sedan outline in navy-on-cream (light) or white-on-navy (dark) at 200×80px.
- Hero→HowItWorks transition: Add a road-line separator — three horizontal dashes (`---`) in the exact colors of the section separator but at 3× scale, evoking dashed road lane markings.
- Coverage section header badge: Change "Live Coverage" badge to include a tiny road-pin icon (already using `<MapPin>` ✓) + add concentric ring decoration at 6% opacity (topographic feel) behind the map container.
- Benefits section badge orb: Change from generic `rounded-full` to `rounded-[0.4rem]` (wheel bolt pattern reference) at 3px size.

---

### OPP-6 | Parallax atmospheric orbs on scroll

**Impact:** High "alive" quality on scroll — premium product signal.  
**How:** Attach a `requestAnimationFrame` scroll listener to the large blur pools (`w-[28rem] h-[28rem] blur-[140px]`). At scroll position `y`, apply `transform: translateY(${y * 0.12}px)` — the pool drifts at 12% of scroll speed. On mobile, reduce to `transform: translateY(${y * 0.06}px)`. This creates depth layering even when no orbs are visible.  
**Risk:** Medium — `requestAnimationFrame` on scroll should be throttled via `startTransition` or `useRef` debounce to avoid jank.

---

### OPP-7 | Mobile atmospheric alternative: section edge-strip separation

**Impact:** Fixes P1-4 (mobile flatness) without breaking desktop.  
**How:** Since orbs must be hidden on mobile (clip risk), add a mobile-only (`md:hidden`) component at the bottom of each dark section: a 6px `div` with a horizontal gradient from the current section's primary atmosphere color to the next section's primary color at 18% opacity. This creates a visible chromatic separation that functions as a section "hinge" on mobile.  
**Example:** Between Hero (navy) and HowItWorks (also navy but slightly lighter): gradient strip of `from-blue-700/18 via-sky-400/25 to-blue-600/15` — a subtle sky-blue flash.

---

### OPP-8 | CTA dark mode glass treatment — blur card on lit background

**Impact:** P2-6 fix — closes the conversion moment with premium material depth.  
**How:** Behind the CTA card (inside the section, below the card's z-index): add a large radial "lamp" bloom at 600px blur, `rgba(59,130,246,0.15)`, centered on the card footprint. With a bright element behind the card, `backdrop-blur` on the card will be visually effective — it will blur through the blue lamp. Add `backdrop-filter: blur(28px) saturate(1.8)` to the card in dark mode.  
**Result:** The CTA card in dark mode reads as a lit glass plate — the premium conversion surface the product deserves.

---

### OPP-9 | "Learn more" accordion tap-target fix + expand-on-tap UX improvement

**Impact:** P2-7 fix + mobile UX improvement.  
**How:** Replace the `inline-flex text-sm` "Learn more" button with a full-width tap target: `w-full py-3 text-left flex items-center justify-between text-sm`. The whole card bottom bar becomes the expansion trigger, not just the text link. This also makes the expand/collapse interaction clearer — tapping anywhere on the lower portion expands the card.

---

### OPP-10 | Footer social proof and trust anchors

**Impact:** Early-stage marketplace trust building at the very bottom of the funnel.  
**How:** Add 3 elements to the footer Brand column below the contact row:

1. LinkedIn icon link (`linkedin.com/company/bidondent`) — `w-8 h-8 rounded-full`, glass treatment
2. Instagram link (if exists) — same
3. A "Trusted by beta users" stat line: `text-xs text-blue-200/40` — even if only 10 users, it's social proof
   **Risk:** Only add social links if the accounts exist. Do not link to empty profiles.

---

## 3 Dark Mode Direction Concepts

### Direction A — "Two-Register Elevation" (Lowest risk, highest immediate gain)

**Concept:** Split the dark sections into two alternating registers — a "ground floor" (very dark, near-black navy) and a "mid floor" (elevated navy). No hue change. Same blue system, just tonal separation.

**Ground Floor** (`rgb(6,14,28)→rgb(9,18,36)` | B max ~36): Hero, WhoWeServe, Coverage, Footer  
**Mid Floor** (`rgb(18,38,76)→rgb(14,30,62)` | B max ~76): HowItWorks, Benefits, AboutOpportunity, BuiltOnTransparency, CTA

**Adjacent gap:** Current ~17 points → New ~40 points. Two sections next to each other will always be in different registers.

**Atmosphere change:** Increase blur pool opacity in Mid Floor sections to 20%. Keep Ground Floor sections at current blur opacity. Dot grids raised to 8% effective across all.

**Separator change:** At Ground→Mid transitions, use 2px separator at 40% opacity. At Mid→Ground, use 1.5px at 35%.

**Mood:** Night skyline stratification. Feels like Notion/Vercel/Linear dark mode — architecturally clear, not colorfully warm. Fastest to implement.

**Risk:** Low. Only changes background gradient values in the `isLightAppearance` branches.

---

### Direction B — "Amber-Lit Garage" (Highest differentiation, most on-brand)

**Concept:** Mirror the light mode warm/cool rhythm in the dark register. Warm sections become warm-dark amber. Cold sections stay cold navy.

**Warm dark sections** (amber-black): Benefits → `#1a0c06→#231408→#1a0a04`; BuiltOnTransparency → `#221006→#2e1608→#1e0c04`; Hero secondary atmosphere: existing amber blur pools boosted to 25%
**Cold dark sections** (navy): Hero primary, HowItWorks, WhoWeServe, Coverage, BusinessInquiry, Footer — stay as-is but with B-register elevated slightly

**Atmosphere change:**

- Warm sections: Replace blue ellipses with amber: `rgba(200,120,30,0.20)` top ellipse + `rgba(180,100,20,0.15)` bottom + `bg-amber-900/[0.35] blur-[140px]` pools
- Cold sections: Blue ellipses raised to 12–16% from current 8–12%

**Separator change:** Warm→Cold transition uses a dual-tone separator: amber-to-blue gradient via `from-amber-400/20 to-blue-400/20`

**Mood:** Auto body shop at night, sodium-vapor lit garage, warm work-light vs cool night-sky contrast. Directly mirrors how light mode feels. Highest automotive identity.

**Risk:** Medium. New color tokens needed. Amber dark surfaces need QA for text contrast (WCAG AA).

---

### Direction C — "Point-Source Luminance Journey" (Most cinematic, highest engineering effort)

**Concept:** Keep all section background gradients as-is but add a large unique radial luminance element (650–900px radial glow, unique color, unique corner) to each section. The page becomes a luminance journey — the user "moves through" a sequence of differently-lit rooms.

**Section glow map:**

| Section             | Glow color                            | Corner        | Blur  | Opacity                  |
| ------------------- | ------------------------------------- | ------------- | ----- | ------------------------ |
| Hero                | Electric blue `rgba(37,99,235,0.22)`  | Top-left      | 800px | 22%                      |
| HowItWorks          | Sky teal `rgba(14,165,233,0.18)`      | Top-right     | 700px | 18%                      |
| Benefits            | Indigo-violet `rgba(99,102,241,0.20)` | Bottom-left   | 750px | 20%                      |
| WhoWeServe          | Royal blue `rgba(37,99,235,0.16)`     | Top-center    | 800px | 16%                      |
| AboutOpportunity    | Cobalt `rgba(30,58,138,0.18)`         | Bottom-right  | 700px | 18%                      |
| BuiltOnTransparency | Powder blue `rgba(96,165,250,0.22)`   | Top-left      | 800px | 22%                      |
| Coverage            | Natural — map IS the atmosphere       | —             | —     | —                        |
| BusinessInquiry     | Slate-blue `rgba(71,85,105,0.15)`     | Bottom-center | 600px | 15%                      |
| CTA                 | White-cream `rgba(248,250,252,0.18)`  | Center        | 700px | 18% — "lamp under glass" |
| Footer              | Absent — near-black close             | —             | —     | —                        |

**Scroll animation:** Each glow element starts at 40% opacity and blooms to 100% as the section enters viewport (atmosphere bloom, see OPP-3).

**Mood:** Architectural spotlight photography. Studio lighting on products. Premium editorial magazine feel. Apple event aesthetic.

**Risk:** High — opacity values require careful per-section QA. The CTA's white-cream center glow needs WCAG contrast check. Engineering effort: 1–2 days. Visual payoff: highest.

---

## Mobile-Specific Findings

### Viewport: 375–485px (confirmed breakpoints — hamburger visible, `md:hidden` menu visible)

**H1 Scaling:**

- Mobile: 28px (`text-[1.75rem]`)
- Tablet sm: 36px (`sm:text-4xl`)
- Desktop lg: 44px (`lg:text-[2.75rem]`)
- Desktop xl: 48px (`xl:text-5xl`)
- The title "Get the Best Price on Your Auto Body Repair" wraps to 3 lines at mobile 375px. Acceptable. Strong.

**Section Heights (mobile):**
| Section | Height |
|---------|--------|
| Header | 70px |
| Hero | 991px |
| HowItWorks | 910px |
| Benefits | 1459px |
| WhoWeServe | 1159px |
| AboutOpportunity | 1171px |
| BuiltOnTransparency | 997px |
| Coverage | 2125px ← very long |
| BusinessInquiry | 631px |
| CTA | 465px |
| Footer | 731px |

**Total page height (mobile):** ~12,109px. The Coverage section at 2125px represents 17.5% of total page height on mobile — the map + shop list stack creates a long scroll commitment.

**Critical Touch Target Failures:**
| Element | Height | Minimum | Status |
|---------|--------|---------|--------|
| "Learn more" accordion buttons (×3) | 20px | 44px | ❌ FAIL |
| All header buttons | 44px | 44px | ✅ PASS |
| Coverage "Find Shops" button | 41px | 44px | ⚠️ 3px short |
| Coverage "My Location", "Center Map" | 42px | 44px | ⚠️ 2px short |
| BusinessInquiry action rows | 91px | 44px | ✅ PASS |
| CTA button | 48px | 44px | ✅ PASS |

**Horizontal Overflow at Mobile:**

- Hero: scrollWidth 489px vs offsetWidth 485px — **4px overflow** (likely animated callout chip clipping)
- Benefits: `hasHorizOverflow: true` — absolutely-positioned blur orb likely extends outside `overflow-hidden`
- AboutOpportunity: `hasHorizOverflow: true` — same pattern

**Decorative Elements Hidden on Mobile (23+ total):**
All `hidden sm:`, `hidden md:`, `hidden lg:` floating orbs. Only the large `blur-[110px-160px]` pools remain, but at 3–12% opacity they provide minimal visual depth. **Mobile dark mode is critically flat.**

**Mobile vs Desktop Atmosphere Quality:**
| Mode | Desktop (1440px) | Mobile (375px) |
|------|-----------------|----------------|
| Light | Good — warm/cool rhythm, amber/sky alternation | Acceptable — rhythm persists via section backgrounds |
| Dark | Poor — flat navy, 1–3% textures | Critical — all orbs gone, only section backgrounds remain |

**Bottom navigation / CTA accessibility:**

- No sticky CTA button on mobile. Users scrolling down cannot start a report without scrolling back to the hero or reaching the CTA section at the bottom.
- The Coverage section's 2125px mobile height creates a commitment — users may not scroll past it to reach the Business Inquiry or CTA sections.
- Recommendation: Add a floating mobile "Start Repair" button after 300px scroll, visible only on mobile and only when the hero primary CTA is off-screen.

---

## Open Questions

1. **Should dark mode amber warmth be activated?** Light mode uses amber atmosphere (`rgba(200,165,100,0.12)` ellipses, `bg-amber-200/[0.18]` blur pools) in the hero and content sections. Dark mode replaces all amber with blue. Direction B proposes restoring the warm register in dark mode. Question for owner: is the product identity "cool tech navy" or "warm garage amber at night"? The answer defines Direction A vs B.

2. **Is the appearance mode toggle intentionally hidden from users?** The `button[title="Toggle appearance mode"]` is set to `display:none` and is only accessible via developer tools. Is dark mode an internal development feature, or is it intended for users? If user-facing, the toggle needs to be exposed (header right-side, Settings modal, or profile menu). If internal-only, the toggle can stay hidden but should be documented.

3. **What animation constraints apply?** `prefersReducedMotion` is implemented in the hero value carousel. Are there performance constraints on the CTA card glass blur, the atmosphere bloom animation (OPP-3), or the parallax orbs (OPP-6)? Heavy `backdrop-filter` and `requestAnimationFrame` scroll handlers can degrade on lower-end mobile devices.

4. **Should the landing page have a floating mobile CTA?** After 300px scroll, the hero "Start New Report" button is off-screen. Competitive analysis: most marketplace landing pages add a mobile-sticky "Get Started" button below the fold. This is a direct conversion opportunity. Would the owner accept a mobile-floating action button, or does it conflict with the calm/premium identity?

5. **Are there plans for automotive photography in the hero?** The current hero image is a realistic damaged car photo. Opportunity: use a professional-grade dark-mode hero image with dramatic automotive lighting (body shop at night, blue work-lights on a dark metallic car body) that would serve as de facto atmosphere for the dark mode hero section. No code change needed — just a stronger hero image for dark mode.

---

## Validation Notes (v3)

**Dark mode confirmed real (v3):** Hero background in dark mode = `rgb(10,26,56)`. Toggle button text confirmed "🌙 Dark". Section backgrounds collected via `getComputedStyle(el).backgroundImage` (gradient parsing), not `.backgroundColor` (which returns transparent for gradient-based backgrounds).

**v3 key correction vs v2:** v2 reported HowItWorks and WhoWeServe cards as "transparent ghost boxes" — incorrect. v3 DOM confirms both have `backgroundImage` gradient applied. The correct issue is low contrast (30% opacity navy gradient on 100% navy section, no blur).

**Desktop-only data:** All B-channel values, glass counts, touch targets, and section heights are from 1440px Playwright viewport. Mobile measurements from v2 (375px) remain in the "Mobile-Specific Findings" section for reference — they were captured in a prior session but have not been re-verified in this v3 pass.

**Screenshots:** `docs/audit-assets/landing-2026-05-02/desktop-1440-{light,dark}-{full,hero}.png`

---

_Landing Page Design Audit v3 — BidOnDent (2026-05-02, Desktop 1440px). Auditor: GitHub Copilot (Mola's Coder mode). v3 supersedes v2 (incorrect transparent-card finding) and v1 (wrong dark mode mechanism)._
