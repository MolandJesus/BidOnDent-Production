# PLAN — Landing Page Redesign (2026-05-02) — ARCHIVED 2026-05-03

> **ARCHIVED 2026-05-03.** This is the historical execution record of the original 16-pass landing redesign. After sign-off, follow-up work expanded into the Liquid Map Intelligence layer (Passes A–G), the cross-app button-system adoption, and the form-input unification — all now also archived. **For current visual system state, read `docs/REF_VISUAL_SYSTEM.md`.** For dashboard plans, see `docs/PLAN_DASHBOARD_REDESIGN.md`.

**Authority:** PLAN-tier — historical execution record. Redesign is complete and signed off.
**Last updated:** 2026-05-02
**Status:** **STATUS COMPLETE** — Passes 1 through 16 shipped (Passes 12–15 added editorial flanking accents to section H3s; Pass 16 lifted the two sub-pages, AboutPage + InsurerPartnershipPage, to the landing-tier glass system). Both audit docs archived under `docs/archive/`. Owner authorized full-autopilot completion 2026-05-02.
**Scope:** Landing page surfaces only — 10 sections + header + footer + appearance toggle. No dashboard, no auth, no backend.
**Companion docs:** [`../MOLANDJESUS_DESIGN_DECISIONS.md`](../MOLANDJESUS_DESIGN_DECISIONS.md) §7 (locked design system), [`../LAW_PROJECT_RULES.md`](../LAW_PROJECT_RULES.md), [`bd-design-identity` skill](~/.claude/skills/bd-design-identity/SKILL.md). Source audits also archived in this folder.

---

## Hardening Phase Context

Per [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) (2026-04-14), aesthetic work is paused except for Phase 4 trust surfaces. **The owner has explicitly authorized this redesign on 2026-05-02 as a scoped exception.** Justification:

- The landing page is the first-impression trust surface for soft launch.
- v3 audit P0-1: dark mode "blocks the product from feeling premium."
- v3 audit P1-2: HowItWorks/WhoWeServe/Benefits cards are low-contrast in dark mode — high-signal product content fails to read.
- These are launch-blocking trust issues, consistent with the hardening phase's Phase 4 focus on trust surfaces.

If at any point during execution the work drifts beyond visual polish into feature additions or refactors, that pass must stop and re-confirm with the owner.

---

## Operating Principle

**Premium-system consolidation, not redesign.**

The landing page already has its premium pattern. TrustStats commitment cards, the Shop Signup "Join as a Shop / Partner as Insurer" cards, and the Coverage Map Dialog all show the design system at full quality. The marketing sections (HowItWorks, WhoWeServe, Benefits, AboutOpportunity, CTA) hand-roll inline approximations of that pattern instead of using the canonical [`bd-glass-*`](../src/styles/theme.css) utility classes.

Pass 4 (the largest pass) is principally about **deleting inline glass styles and applying `bd-glass-card`**. The design system already exists; the marketing page just hasn't been migrated to it. This is consolidation work, not new design.

**Animate the system, never the flatness.** Motion (Pass 5) only runs after material consolidation (Pass 4). Adding parallax + bloom to a flat page just decorates the flatness. Material first, motion second.

**Direction B is the dark-mode foundation; Direction C accents are the cinematic layer on top.** Confirmed by owner 2026-05-02. Warm garage lighting + cold map/nav tech + subtle Apple-event-style light blooms. NOT cyber/neon.

---

## Anti-Goals (binding every pass)

These are explicit "do not" rules to keep us from drifting:

1. No new sections — work within the existing 10.
2. No copy changes — voice and content are owner-owned.
3. No structural component refactors — visual changes only, same JSX skeletons.
4. No new features — polish only.
5. No big-bang refactor — one pass at a time, owner-reviewed.
6. No `backdrop-blur-*` or hand-rolled inline glass on new code — use `bd-glass-*` per the design law (`MOLANDJESUS_DESIGN_DECISIONS.md` § Design System).
7. No Apple Maps homage — this is BidOnDent, not Apple.
8. No racing/mechanic-shop kitsch — subtle automotive cues only.
9. No Storage / Auth / Backend changes — this redesign does not touch any load-bearing facts in `LAW_PROJECT_RULES.md` § Storage + Auth Invariants.
10. No animation on `prefers-reduced-motion: reduce` — every motion pass is guarded.

---

## Owner Decisions (locked 2026-05-02)

| # | Decision | Owner answer |
|---|---|---|
| 1 | Direction | **Direction B + selective Direction C accents.** Amber-Lit Garage as identity foundation; subtle Apple-event-style light blooms for premium depth. NOT full cyber/neon. |
| 2 | Coverage section height | **Keep long as flagship product demo.** Map IS the product. **Audit scroll fatigue post-redesign as a separate review.** |
| 3 | Appearance toggle | **Expose to users, premium feel.** Header right-side or polished compact control via `bd-glass-control`. Done as **Pass 1.5** (small dedicated pass after Pass 1) to keep Pass 1 cleanly scoped to bug fixes. |
| 4 | Hero photography | **Keep current image for now.** Pass 6 carries a TODO for a better/dark-mode-specific hero image. Do not block foundation work. |
| 5 | Mobile sticky "Start Repair" CTA | **Defer entirely.** Decide later as a separate conversion/UX pass after the visual system feels right. |

---

## v3 Audit Findings → Pass Mapping

Full audit archived at [`docs/archive/landing_design_audit_2026-05-02_archived_2026-05-02.md`](archive/landing_design_audit_2026-05-02_archived_2026-05-02.md). Post-Pass-6 audit also archived at [`docs/archive/landing_design_audit_post_pass_6_2026-05-02_archived_2026-05-02.md`](archive/landing_design_audit_post_pass_6_2026-05-02_archived_2026-05-02.md).

| ID | Severity | Finding | Pass |
|---|---|---|---|
| P0-1 | P0 | Dark mode = single-temperature cold-blue. 4-section cluster at B=52–56. | Pass 3 |
| P1-2 | P1 | HowItWorks/WhoWeServe/Benefits cards have inline gradient but no `backdrop-blur` (v3 corrected from v2). | Pass 1 |
| P1-3 | P1 | All decorations 1–3% effective opacity (sub-perception threshold). | Pass 2 |
| P1-4 | P1 | "Learn more" buttons 20px height — fails 44px WCAG 2.5.5. | Pass 1 |
| P2-5 | P2 | All 8 separators identical 1px blue lines, invisible in dark. | Pass 3 |
| P2-6 | P2 | CTA card has zero backdrop-blur on the conversion card. | Pass 4 |
| P2-7 | P2 | BusinessInquiry atmosphere 0.75% effective ("dead zone"). | Pass 2 |
| P2-8 | P2 | Coverage section 24% of total page height. | **Owner decision: keep long; audit fatigue post-redesign.** Not in plan passes. |
| P2-9 | P2 | No automotive identity elements anywhere. | Pass 6 |
| P3-10 | P3 | Wrapper light gradient `#f7f9fc` mismatches hero `#fdfcf9`. | Pass 1 |
| — | — | Footer separator dimmer than rest (`/10` vs `/25`). | Pass 1 |
| — | — | Header appearance toggle is `display: none`. | **Pass 1.5** |

---

## The Passes

### Pass 1 — Foundation Fixes (v3 Corrected)

**Goal:** Resolve every P1 and P3 audit finding that is a pure bug fix, without making any direction calls.

**Authorized to start:** 2026-05-02 (concurrent with this plan being written).

**Changes:**

1. **HowItWorks step cards (3)** — migrate to `bd-glass-card`. Delete inline `style={{ background: linear-gradient(...), boxShadow: ... }}` and the hand-rolled border classes. Keep transition delay, hover lift, and `useScrollAnimation` opacity reveal.
2. **WhoWeServe role cards (3)** — same migration pattern.
3. **Benefits photo cards (3)** — same migration pattern. Photo + badge layering preserved.
4. **AboutOpportunity "Learn more" buttons (×3)** — current 20×98px fails 44px touch target. Either (a) add `min-h-[44px] py-3` to the button, or (b) make the full lower card bar tappable. Owner preference: pick (b) if it cleanly fits; otherwise (a).
5. **LandingPageLayout wrapper light gradient** — change `linear-gradient(180deg, #f7f9fc 0%, #f2f5f9 100%)` → `linear-gradient(180deg, #fdfcf9 0%, #f8f8f5 100%)` to match hero start. Dark mode wrapper unchanged.
6. **Hero 4px mobile horizontal overflow** — `scrollWidth: 489 vs offsetWidth: 485`. Likely a callout chip extending beyond `overflow-hidden`. Investigate and add `overflow-x: hidden` at the appropriate boundary, or clip the offending chip.
7. **Footer separator opacity** — current `via-blue-400/10` 1px in dark mode is dimmer than other section separators (`/25–30`). Bump to `via-blue-400/25` to match.

**Files expected to change:**

- [src/app/components/landing/HowItWorksSection.tsx](../src/app/components/landing/HowItWorksSection.tsx)
- [src/app/components/landing/WhoWeServeSection.tsx](../src/app/components/landing/WhoWeServeSection.tsx)
- [src/app/components/landing/BenefitsSection.tsx](../src/app/components/landing/BenefitsSection.tsx)
- [src/app/components/landing/AboutOpportunitySection.tsx](../src/app/components/landing/AboutOpportunitySection.tsx)
- [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) (mobile overflow only)
- [src/app/components/landing/FooterSection.tsx](../src/app/components/landing/FooterSection.tsx)
- [src/app/components/app/LandingPageLayout.tsx](../src/app/components/app/LandingPageLayout.tsx) (wrapper gradient)

**NOT in Pass 1:**

- TrustStats cards (already use proper glass — confirm only)
- CTA card glass migration (Pass 4)
- AboutOpportunity card surface treatment (Pass 4 — needs design call about expand-on-tap UX)
- BusinessInquiry action rows (Pass 4)
- Direction colors / atmosphere opacities / animations / car identity (Passes 2–6)
- Appearance toggle exposure (Pass 1.5)

**Validation:**

- TypeScript passes (`npm run typecheck` or equivalent)
- Light mode visual regression at 375 / 768 / 1440 px — must read identical or improved
- Dark mode visual regression at 375 / 768 / 1440 px — cards must now have visible glass material
- All interactive elements ≥ 44 px touch target
- No new content layout shift
- Vercel preview deployed and reviewed by owner

**Co-update:** Mark P1-2, P1-4, P3-10 RESOLVED in [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) with the commit hash. Note in [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) § Design System that landing marketing cards now use `bd-glass-card`.

**Risk:** Low. Pure consolidation to existing utility class. Reversible via `git revert`.

**Skill applied:** `bd-design-identity`. Mention by name in the commit message.

---

### Pass 1R — Visible Landing Presence (correction sprint, 2026-05-02)

**Why this exists:** Pass 1 alone (card migration to `bd-glass-card`) produced architectural correctness but minimal visible change because the dashboard's calm-tuned glass defaults are too subtle for a marketing landing surface. Owner reviewed and rightly called it: "I don't see any difference. I need more animation, more eye-catching visuals when scrolling. You went all in on premium look only while I said I wanted both."

**Pass 1R upgrades Pass 1 in three dimensions without rolling back the consolidation work:**

1. **Landing-specific glass variant.** Added `.bd-glass-card--landing` to [`theme.css`](../src/styles/theme.css):
   - Light mode: heavier shadow (`0 18px 48px rgba(15,23,42,0.13) + 0 6px 16px rgba(30,58,138,0.08)`), stronger top inset highlight (`rgba(255,255,255,0.95)`), slightly more saturated background (`rgba(252,253,255,0.9)→rgba(241,247,255,0.74)`).
   - Dark mode: stronger royal-blue lit-glass treatment — `linear-gradient(rgba(37,99,235,0.22)→rgba(12,25,41,0.78))` with a 36px blue glow + heavier shadow + visible inset highlight.
   - Hover lift: dramatic `translateY(-6px)` (vs `bd-glass-card`'s subtle default).
   - Applied to: HowItWorks (3 step cards), WhoWeServe (3 role cards), Benefits (3 photo cards).
   - **Critically:** still a system class, not inline — preserves the consolidation value of Pass 1.

2. **Atmosphere visibility bumped to perception threshold.** Existing decorative DOM in 5 sections (Hero, HowItWorks, WhoWeServe, Benefits, BusinessInquiry) — opacity values raised from 1–3% effective to 5–14% effective:
   - Dot grids / line textures: ~5% → ~5–6% effective via doubled rgba alpha + opacity-80 multiplier.
   - Atmospheric ellipses: 8–12% → 16–20%.
   - Large blur pools: 4–18% → 14–28%.
   - **BusinessInquiry "dead zone" specifically:** dot grid `rgba(59,130,246,0.025) × opacity-30 = 0.75%` → `rgba(59,130,246,0.06) × opacity-80 = 4.8%` effective. Blur pools 3–5% → 12–15%.
   - No new decorative layers added. Same DOM, opacity values only.

3. **Scroll-entry atmosphere bloom.** Added `.bd-bloom-atmosphere` class to `theme.css` (1.4s scale 0.94→1.0 + opacity 0→1, ease-out, `prefers-reduced-motion` guarded). Each of the 5 sections wraps its atmospheric block in `<div class="bd-bloom-atmosphere is-visible|is-hidden">`, gated on `useScrollAnimation.isVisible` (or `loaded` for Hero). Sections materialize as the user scrolls into them.

**What Pass 1R deliberately does NOT touch (deferred):**
- Direction B amber color rhythm — locked for Pass 3
- Premium glass for AboutOpportunity / CTA / BusinessInquiry rows — Pass 4
- Parallax orbs — Pass 5b
- Car identity / Direction C luminance accents — Pass 6
- Appearance toggle exposure — Pass 1.5 (now AFTER Pass 1R-extension)
- AboutOpportunity / TrustStats / Coverage / CTA / Footer atmosphere bumps — Pass 1R-extension (the immediate next pass)

**Regression risk to watch during visual review:** Benefits light-mode cards used a neutral white gradient (`rgba(255,255,255,...)`); the new `bd-glass-card--landing` is slightly cool-blue tinted at top (`rgba(252,253,255,0.9)`). On Benefits' warm-ivory section background (`#faf9f6`), this could read as slightly cooler than before. If Benefits light feels colder or less premium than the original screenshot, the fix is a `bd-glass-card--landing-warm` variant in `theme.css` that swaps the cool-blue tint for warm-cream — NOT a hand-rolled inline override.

**Files touched in Pass 1R:**
- [src/styles/theme.css](../src/styles/theme.css) — `.bd-glass-card--landing` (light + dark variants + hover) + `.bd-bloom-atmosphere`
- [HowItWorksSection.tsx](../src/app/components/landing/HowItWorksSection.tsx) — variant + atmosphere bumps + bloom wrap
- [WhoWeServeSection.tsx](../src/app/components/landing/WhoWeServeSection.tsx) — same
- [BenefitsSection.tsx](../src/app/components/landing/BenefitsSection.tsx) — same
- [HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) — atmosphere bumps + bloom wrap (gated on `loaded`)
- [BusinessInquirySection.tsx](../src/app/components/landing/BusinessInquirySection.tsx) — atmosphere bumps + bloom wrap

**Validation standard (revised, owner-mandated):**
Pass 1R is NOT complete on TypeScript/build pass alone. It's complete only when **owner can visibly see the difference in both modes:**
- Cards feel more dimensional
- Sections feel less washed out
- Scrolling feels more alive
- No performance jank
- Reduced-motion still works
- Mobile does not feel cluttered

Code-pass alone is no longer sufficient. Visual proof required before commit.

**Risk:** Low–Medium. Same DOM, additive CSS class + opacity tweaks + a single scroll-driven CSS transition. All `prefers-reduced-motion` guarded. Reversible per-file via `git revert`.

**Co-update on commit:** Mark P1-3 (atmosphere visibility) partially RESOLVED in [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) for the 5 sections touched. Document `bd-glass-card--landing` and `bd-bloom-atmosphere` in [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § Design System.

#### Pass 1R Visual Outcome Notes (2026-05-02, owner-reviewed)

Pass 1R is **an improvement, not a finish line.** It moved the page in the right direction — especially in dark mode — but light mode is still too subtle and warm sections may need warmer card treatment. Do NOT roll back; do continue with Pass 1R-extension.

**What landed:**

- Dark mode is meaningfully better. HowItWorks / WhoWeServe / Benefits cards now read as real lit-glass surfaces with visible royal-blue gradient + inset highlight + shadow.
- Dark mode atmosphere is finally perceivable — Hero shows blue dot-grid striations and ambient ellipses; BusinessInquiry no longer feels like a dead zone.
- Touch target fix preserved (AboutOpportunity "Learn more" 20→44 px).
- Footer separator visible in dark.
- Hover lift on cards is dramatic (6 px) with strong shadow + blue ring border in dark.
- Bloom on scroll-entry works without jank.

**What still needs work:**

- **Light mode is still too subtle compared to dark mode.** Same opacity bumps that landed dramatically against navy (high contrast) are quiet against cream/sky (low contrast). Hero light mode looks close to the old version.
- **Some light sections still feel washed out.** The atmosphere is technically present but doesn't read as "chapter break" material yet.
- **Warm sections may need warmer card treatment.** The cool-tinted `bd-glass-card--landing` background reads slightly off on Benefits' warm-ivory section background. Possible `bd-glass-card--landing-warm` variant in Pass 1R-extension.
- **Page still needs more motion, more visual identity, and more section-by-section character.** Bloom alone is not enough to feel "alive while scrolling" — that's later passes (Direction B color rhythm, parallax, car identity).

**Reference quality bar (do not lose sight of):** the Coverage Map Dialog full-map view (`CoverageMapDialog.tsx`) is already at top-tier dark-mode quality — "Mode Midnight" pill, glass command center panel, soft-glow control rail, night-map tiles. **The marketing landing dark mode should ultimately move toward that same level of glass + control finish.** Pass 1R closed part of the gap; Direction B + premium glass + motion + car identity will close the rest.

---

### Lessons from Pass 1R (durable — apply to every future pass)

These are the load-bearing realizations from the Pass 1R correction sprint. Future agents picking this up cold should read these before starting any visual pass:

1. **Light and dark mode need separate tuning.** Equal opacity bumps do not produce equal visible effect. A `0.05 × opacity-80` dot grid that lands as visible-but-subtle in dark mode (against navy) reads as nearly invisible in light mode (against cream). Light mode usually needs ~1.5× the bump dark mode does, and often benefits from stronger warm-tone contrasts rather than blue.

2. **Warm sections need warm glass.** A cool-tinted card variant (`rgba(252, 253, 255, ...)`) on a warm-cream section background creates micro-color-tension. Warm sections (Benefits, TrustStats) want a warm-tinted card variant — `bd-glass-card--landing-warm` with `rgba(255, 252, 245, ...)` cream-amber tint. The blue tint stays for cool sections (HowItWorks, WhoWeServe, BusinessInquiry).

3. **The Coverage Map Dialog is the dark-mode quality bar.** It already has the premium spatial look the landing should aspire to: glass command-center panels, soft glowing controls, night-map tiles, royal-blue identity, depth and atmosphere. Marketing landing dark mode should aim for the same tier.

4. **Visible payoff matters more than system correctness.** Pass 1's pure consolidation (architecturally correct migration to `bd-glass-card`) produced near-zero visible change and was rightly flagged. Each pass must produce visible improvement the owner can see in screenshots or while scrolling — not just compile-pass + clean git diff. Validation now means: owner-eye, not TypeScript-eye.

---

### Pass 1R-extension — Carry Visible-Presence Logic Through Remaining Sections

**Why this exists:** Pass 1R only touched 5 sections (Hero, HowItWorks, Benefits, WhoWeServe, BusinessInquiry). The other 5 (AboutOpportunity, TrustStats, Coverage, CTA, Footer) still have sub-perception atmosphere opacities and no scroll bloom. If we move to Pass 1.5 (toggle) or Pass 3 (amber) before consistency is achieved, the page will feel uneven — the first half visibly polished, the second half still flat. Pass 1R-extension also addresses the two known gaps from Pass 1R outcome notes: light-mode subtlety and warm-section card tint.

**This pass runs only after Pass 1 + Pass 1R is owner-approved and committed.** ✓ Approved 2026-05-02.

**Core changes (always apply):**

1. **AboutOpportunity** — atmosphere bumps (dot grid, ellipses, blur pools to perception-threshold values matching the Pass 1R targets). Wrap atmosphere block in `bd-bloom-atmosphere`. Note: AboutOpportunity uses `.dark` class propagation already — keep, don't change structure.

2. **TrustStats ("Built on Transparency")** — already the highest-glass section in dark mode (B=72), but its decorative texture is sub-threshold. Bump dot grid + amber/blue ellipses. Wrap in bloom. Do NOT change card material — TrustStats commitment cards are reference quality and stay as-is until Pass 4 consolidation.

3. **Coverage (OperatingRegions)** — atmosphere outside the map container only (the map IS the atmosphere inside it). Bump topographic line texture + ambient ellipses. Wrap in bloom.

4. **CTA** — atmosphere bumps for the section's existing decorative elements (the small squares + circle decorations + inset glow). Wrap in bloom. Do NOT touch the CTA card itself — that's Pass 4.

5. **Footer** — gentle atmosphere bump (the section is intentionally a near-black close, but the dot texture should be at least perceivable). Wrap in bloom.

**Conditional branch A — Light-mode second-tier atmosphere tuning:**

Per Pass 1R Lesson #1 (light/dark contrast asymmetry), if after the core changes light mode still reads too subtle in owner review, apply a second tier of bumps **light-mode only**:
- Light dot grids: another ~1.5× rgba alpha (e.g., `0.05` → `0.07–0.08`)
- Light atmospheric ellipses: shift toward stronger warm tones (deeper amber, deeper sky) rather than just higher opacity
- Light blur pools: increase warm-pool saturation, not just opacity

This branch is OWNER-DECISION GATED — apply only if Pass 1R-extension's first round still leaves light mode subtle.

**Conditional branch B — `bd-glass-card--landing-warm` variant:**

Per Pass 1R Lesson #2 (warm sections need warm glass), if Benefits / TrustStats card material still reads with cool-blue tint mismatch on warm section backgrounds, add a warm variant to [`theme.css`](../src/styles/theme.css):

- Light mode: `linear-gradient(180deg, rgba(255, 252, 245, 0.9) 0%, rgba(252, 248, 240, 0.74) 100%)` — cream-amber tint at top, warm ivory at bottom
- Dark mode: `linear-gradient(180deg, rgba(180, 130, 60, 0.16) 0%, rgba(35, 24, 14, 0.78) 100%)` — warm amber-black tint, anticipates Pass 3 Direction B
- Same heavier shadow + premium hover as `--landing`
- Apply to Benefits photo cards (always — they're on warm-ivory section). TrustStats card migration is Pass 4 territory; warm variant is the right target when that lands.

This branch is OWNER-DECISION GATED — apply only if Benefits cards still read with cool tension after Pass 1R-extension's core changes.

**Files (core changes):**

- [src/app/components/landing/AboutOpportunitySection.tsx](../src/app/components/landing/AboutOpportunitySection.tsx)
- [src/app/components/landing/TrustStatsSection.tsx](../src/app/components/landing/TrustStatsSection.tsx)
- [src/app/components/landing/OperatingRegionsSection.tsx](../src/app/components/landing/OperatingRegionsSection.tsx)
- [src/app/components/landing/CTASection.tsx](../src/app/components/landing/CTASection.tsx)
- [src/app/components/landing/FooterSection.tsx](../src/app/components/landing/FooterSection.tsx)

**Additional files if branches activate:**

- [src/styles/theme.css](../src/styles/theme.css) — `bd-glass-card--landing-warm` variant (Branch B)
- [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) + already-touched sections — light-mode atmosphere second tier (Branch A)
- [src/app/components/landing/BenefitsSection.tsx](../src/app/components/landing/BenefitsSection.tsx) — apply warm variant (Branch B)

**NOT in Pass 1R-extension (deferred to later passes):**

- Direction B amber color rhythm in dark mode (Pass 3) — the Branch B warm variant anticipates this but does not implement it
- CTA card glass / AboutOpportunity card glass migration (Pass 4)
- Parallax orbs (Pass 5b)
- Car silhouette / Direction C luminance accents (Pass 6)
- Appearance toggle exposure (Pass 1.5)

**Validation:** Same standard as Pass 1R — owner visual review required, not just compile-pass. Specifically: scrolling end-to-end on the page should now feel **consistently atmospheric and alive** across all 10 sections, with no abrupt drop in quality after section 5. Light mode no longer reads as significantly subtler than dark.

**Risk:** Low for core changes (same DOM, opacity values + bloom wrap, no new design decisions). Medium for Branch B (new variant — needs WCAG verification on warm-amber dark backgrounds).

---

### Pass 1.5 — Appearance Toggle Exposure (small dedicated pass)

**Goal:** Replace the `display: none` debug-style appearance toggle with a premium, intentional, user-facing control.

**Why a separate pass:** Toggle exposure involves real design decisions (placement on desktop vs mobile, visual treatment, persistence semantics) that should not contaminate the bug-fix-only scope of Pass 1.

**Changes:**

1. Remove `display: none` from the existing toggle button.
2. Replace its hand-rolled styling with `bd-glass-control` (the canonical interactive utility — pill shape, blue gradient, premium hover).
3. Place it in the [`LandingPageHeader`](../src/app/components/landing/LandingPageHeader.tsx) right-side cluster, between the nav and the Login/Dashboard buttons. Compact icon + label form (sun / moon icon + current mode word).
4. On mobile, place inside the existing hamburger drawer at the top of the menu. Always visible when the drawer is open.
5. Persistence: use the existing `useAppearanceModeCtx` hook — no new state.
6. Accessibility: `aria-label`, `aria-pressed` on the button, full keyboard navigation.

**NOT in Pass 1.5:**

- Settings modal / profile menu integration (overengineered — header is enough)
- System-mode auto-detect (would be a separate UX call)
- Per-section appearance overrides

**Validation:**

- Toggle works on desktop and mobile
- State persists across page navigation
- Dark/light visual on toggle button itself reads premium (matches dashboard `bd-glass-control` pattern)
- Toggle does not compete with the primary CTA visually

**Risk:** Low. Surfaces an existing working feature with a polished control.

---

### Pass 2 — Atmosphere Visibility (Both Modes)

**Goal:** Resolve audit P1-3 and P2-7 — make the existing decoration system actually visible.

**Changes:**

- Audit every `opacity-*` × `rgba()` decoration value in landing sections.
- Triple effective opacities below 5% to reach the perception threshold:
  - Dot grids: target 5–8% effective
  - Diagonal/horizontal line textures: 6–10%
  - Atmospheric ellipses: 10–16%
  - Large blur pools: 18–28%
- Apply to **both light and dark mode** (light mode is also too washed-out per consolidated planner critique — section "chapter breaks" need to be perceivable).
- BusinessInquiry's "dead zone" (current 0.75% effective) gets the largest correction.

**Constraint:** Same DOM. No new decoration layers. Opacity values only. No color or position changes.

**Files:** All section files in `src/app/components/landing/`.

**NOT in Pass 2:**

- New decorations
- Animation
- Direction colors (Pass 3)
- Premium glass migration (Pass 4)

**Validation:**

- Per-section visual regression in light + dark
- Texture is visible at 100% browser zoom but does not compete with content
- Eye-test: scrolling through dark mode now reveals visible section character per section
- No content layout shift

**Risk:** Low. Same DOM, opacity values only.

**Co-update:** None required (same design system, just opacity tuning).

---

### Pass 3 — Direction B (Amber-Lit Garage)

**Goal:** Resolve audit P0-1 by introducing a warm/cool register split in dark mode, mirroring the warm/cool rhythm that already works in light mode.

**Changes:**

1. **Add new CSS custom properties to [theme.css](../src/styles/theme.css)** for warm dark amber:
   ```css
   --bd-warm-dark-amber-start: #1a0c06;
   --bd-warm-dark-amber-mid: #231408;
   --bd-warm-dark-amber-end: #1a0a04;
   --bd-warm-dark-amber-ellipse-top: rgba(200, 120, 30, 0.20);
   --bd-warm-dark-amber-ellipse-bottom: rgba(180, 100, 20, 0.15);
   --bd-warm-dark-amber-pool: rgba(200, 120, 30, 0.22);
   ```
   **Critical:** All warm amber values MUST be defined as CSS custom properties, not hardcoded in component files. This is so we can roll back to cold navy by changing 6 variable values, not by touching 10 component files.

2. **Apply warm dark amber to two sections in dark mode only:**
   - **Benefits** — section background uses the new warm amber gradient. Atmosphere ellipses replaced with warm amber. Existing indigo blur pools replaced with amber pools.
   - **TrustStats** — same treatment. Its current dark gradient (B=72, the most distinct dark section already) becomes warm amber.

3. **Cold sections — slight elevation:**
   - Hero, HowItWorks, WhoWeServe, AboutOpportunity, Coverage, BusinessInquiry, Footer stay cold navy.
   - B-channel raised slightly in the cluster (currently B=52–56) to give a 6–8 point spread between adjacent cold sections.

4. **Separators at warm/cool transitions** — replace the current uniform 1px blue separator with a dual-tone gradient at major transitions:
   ```
   from-blue-400/22 via-amber-400/22 to-blue-400/22
   ```
   Applied at: Hero→HowItWorks, HowItWorks→Benefits, Benefits→WhoWeServe, AboutOpportunity→TrustStats, TrustStats→Coverage. Minor transitions (1px / 25%) remain as in Pass 1.

5. **WCAG QA on all text in warm amber sections** — the warm amber backgrounds change the contrast equation. Every text element in Benefits + TrustStats must verify AA (4.5:1) against the new background. Run axe-core via Playwright.

**Light mode:** UNCHANGED in Pass 3. Direction B is dark-mode-only.

**Files:**

- [src/styles/theme.css](../src/styles/theme.css) — add `--bd-warm-dark-amber-*` variables
- [src/app/components/landing/BenefitsSection.tsx](../src/app/components/landing/BenefitsSection.tsx) — apply variables in dark branch
- [src/app/components/landing/TrustStatsSection.tsx](../src/app/components/landing/TrustStatsSection.tsx) — same
- [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) — B-channel adjustment + amber blur pool restore in hero atmosphere
- All section files for B-channel adjustments + warm/cool separator updates

**NOT in Pass 3:**

- Light mode changes
- Premium glass migration (Pass 4)
- Animation (Pass 5)
- Car identity decorations (Pass 6)
- Direction C luminance accents (Pass 6)

**Validation:**

- WCAG AA contrast on all text in Benefits + TrustStats (axe-core)
- Visual regression light mode — must be UNCHANGED
- Visual regression dark mode — Benefits + TrustStats read warm amber-black; other sections unchanged but slightly lifted
- Re-measure B-channel cluster: cold sections should now span 8+ points instead of 4
- No new content layout shift

**Risk:** Medium. Color decisions are subjective; the warm amber may need 1–2 owner-review iterations before locking. Reversibility depends on CSS variable isolation (which is why variables are mandatory).

**Co-update:** Update [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § 7 Color Decisions to document the warm dark amber register and when to use it. Add to [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) § Design System.

---

### Pass 4 — Premium Glass Consolidation (the headline pass)

**Goal:** Resolve audit P2-6 plus the owner's "premium with rounded design" requirement. Apply the canonical glass pattern (`bd-glass-card` / `bd-glass-floating`) to every marketing card that doesn't have it.

**Changes:**

1. **AboutOpportunity accordion cards (3)** — migrate to `bd-glass-card`. Currently transparent + 8 px blur (invisible in dark mode). Card content (icon, title, body, expansion) preserved unchanged. The expand-on-tap UX from Pass 1 carries forward.

2. **CTA card (1) — the conversion moment** — migrate to `bd-glass-floating` (heaviest glass utility, 28 px blur, premium elevation). This is the most important card on the page.

3. **Lamp bloom behind CTA card** — add a radial bloom div as the section's z=0 layer so `backdrop-blur` has something to blur THROUGH:
   ```css
   .cta-lamp-bloom {
     position: absolute;
     inset: -100px;
     background: radial-gradient(ellipse at center, rgba(37, 99, 235, 0.15), transparent 70%);
     filter: blur(80px);
     pointer-events: none;
     z-index: 0;
   }
   ```
   In dark mode, increase the bloom to `rgba(37, 99, 235, 0.20)` for stronger lit-glass effect. CTA card sits at z=1.

4. **BusinessInquiry action rows (×2)** — current `white/5%` flat background is barely visible in dark. Migrate to `bd-glass-card` lite styling: increase background opacity to `white/12%` and add `backdrop-blur(8px)`. Or use a new `bd-glass-card--lite` variant if the canonical `bd-glass-card` is too heavy for action rows.

5. **TrustStats cards (4) — consolidation check** — currently hand-rolled with custom `blur(24px)` + 78% gradient + multi-layer shadow. Two options:
   - (a) Migrate to `bd-glass-card` (16 px blur). Loses 8 px of blur but gains consistency.
   - (b) Add a `bd-glass-card--heavy` variant (24 px blur) to theme.css, migrate TrustStats to it. Also makes the variant available for any future "extra premium" surface.
   - **Recommendation:** Option (b) — preserve TrustStats's current visual weight, but as a system variant rather than a snowflake.

6. **No new inline glass values anywhere.** Per the [`bd-design-identity`](~/.claude/skills/bd-design-identity/SKILL.md) skill: "One-off `backdrop-blur-xl` is an anti-pattern." If a surface needs a different blur strength, add a system variant; do not hardcode it.

**Files:**

- [src/app/components/landing/AboutOpportunitySection.tsx](../src/app/components/landing/AboutOpportunitySection.tsx)
- [src/app/components/landing/CTASection.tsx](../src/app/components/landing/CTASection.tsx)
- [src/app/components/landing/BusinessInquirySection.tsx](../src/app/components/landing/BusinessInquirySection.tsx)
- [src/app/components/landing/TrustStatsSection.tsx](../src/app/components/landing/TrustStatsSection.tsx)
- [src/styles/theme.css](../src/styles/theme.css) — add `bd-glass-card--heavy` variant if Option (b) chosen

**NOT in Pass 4:**

- Card structure changes (still 3 accordion cards, same hierarchy)
- Direction colors (Pass 3)
- Animation (Pass 5)
- New card content

**Validation:**

- All 13 marketing cards on the landing page render with consistent material depth
- Dark mode AboutOpportunity / CTA / BusinessInquiry cards are clearly visible and readable
- CTA card reads as "lit glass plate" with the lamp bloom behind it
- Glass count per section in dark mode at least matches TrustStats's 9 in the migrated sections
- Hover states feel consistent across all cards (lift via `bd-glass-card` transition; no per-card custom hover)

**Risk:** Low. Migrating to existing utility classes; one new variant added with clear scope.

**Co-update:** Update [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § Design System to document the new `bd-glass-card--heavy` variant if added. Update [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md).

---

### Pass 5 — Restrained Premium Motion

**Goal:** Animate the consolidated visual system. Address audit's "no scroll-driven atmosphere reveals." Reinforce the owner's "smoothly animated, but not gimmicky" requirement.

**Changes:**

1. **Atmosphere bloom on scroll entry** — when a section's `useScrollAnimation.isVisible` fires, animate the section's primary atmosphere layer (the largest blur pool / ellipse div) from `transform: scale(0.92); opacity: 0` to `transform: scale(1); opacity: var(--target-opacity)` over 1.4s ease-out. Triggers once per section, then static. All entries `prefers-reduced-motion: reduce` guarded.

2. **Parallax on large blur pools** — for the `w-[28rem] h-[28rem] blur-[140px]` style atmosphere pools:
   - Use `requestAnimationFrame` + scroll position
   - Translate Y by 12% of scroll on desktop, 6% on mobile
   - Throttle via `useRef` debounce
   - Pause when section is offscreen (Intersection Observer gate)
   - All pools `prefers-reduced-motion` guarded

3. **Card stagger reveal** — already exists via `useScrollAnimation`. Verify timing is consistent across sections; tune only if jarring. **Do not extend to new elements** per [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) Things We Will Not Do #3.

4. **Mobile-only edge-strip separators** — 6 px gradient strip between sections matching the temperature transition (warm → cool gets `from-amber-400/22 via-blue-400/12 to-blue-400/22`). `md:hidden` only — desktop uses orbs which are already visible per Pass 2.

**Files:**

- New: `src/hooks/useAtmosphereBloom.ts` (or inline if simpler)
- New: `src/hooks/useParallaxOrb.ts` (or inline)
- All section files (apply hooks to atmosphere layers)

**Strict scope — what motion will NOT do:**

- No new animations on existing card content (`useScrollAnimation` stagger is already correct)
- No animated text headers (per `MOLANDJESUS_DESIGN_DECISIONS.md` Things We Will Not Do #3)
- No bouncy / spring physics — calm > lively
- No autoplay video / Lottie / Rive
- No motion on `prefers-reduced-motion: reduce`

**Validation:**

- Reduced-motion query test: animation suppressed, no scroll listener active, no `requestAnimationFrame` running
- Performance: scroll listener < 0.5 ms per frame on a mid-tier mobile (Pixel 5 / iPhone 12 baseline)
- Visual: scrolling through dark mode landing feels alive but calm
- No new layout shift (CLS = 0)
- No jank on scroll

**Risk:** Medium. `requestAnimationFrame` scroll handlers historically cause jank if not carefully throttled. Pass 5 commit must include a perf measurement note.

**Co-update:** Add atmosphere-bloom and parallax-orb patterns to [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § 5 CSS / Motion System Reference if the hooks are kept reusable.

---

### Pass 6 — Automotive Identity Layer + Direction C Luminance Accents

**Goal:** Resolve audit P2-9 (no automotive identity). Add the Direction C cinematic luminance layer the owner asked for ("subtle Apple-event style light blooms, not cyber/neon").

**Changes:**

1. **Hero car silhouette SVG** — low-opacity sedan outline (8% opacity, top-right of hero, behind the hero image, `pointer-events-none`). Source: simple sedan path. Warm amber stroke in light mode, cool blue stroke in dark.

2. **Hero → HowItWorks transition** — road-line separator pattern (3 horizontal dashes, 3× scale of the section separator gradient color). Reads as dashed road lane markings.

3. **Coverage map: concentric topographic rings** — behind the map container at 6% opacity. Reads as topographic / radar / map character.

4. **Per-section corner radial luminance glows (Direction C light)** — 16–22% opacity, behind the content via CSS pseudo-element. Each section gets one unique glow:

   | Section | Color | Corner | Blur | Opacity |
   |---|---|---|---|---|
   | Hero | Electric blue `rgba(37,99,235,0.22)` | Top-left | 800px | 22% |
   | HowItWorks | Sky teal `rgba(14,165,233,0.18)` | Top-right | 700px | 18% |
   | Benefits (warm) | Warm amber `rgba(200,120,30,0.20)` | Bottom-left | 750px | 20% |
   | WhoWeServe | Royal blue `rgba(37,99,235,0.16)` | Top-center | 800px | 16% |
   | AboutOpportunity | Cobalt `rgba(30,58,138,0.18)` | Bottom-right | 700px | 18% |
   | TrustStats (warm) | Warm gold `rgba(180,140,40,0.22)` | Top-left | 800px | 22% |
   | Coverage | (skip — map IS the atmosphere) | — | — | — |
   | BusinessInquiry | Slate-blue `rgba(71,85,105,0.15)` | Bottom-center | 600px | 15% |
   | CTA | White-cream `rgba(248,250,252,0.18)` "lamp" | Center (already added in Pass 4) | 700px | 18% |
   | Footer | (skip — near-black close) | — | — | — |

5. **Footer trust anchors (only if real data exists)** — add LinkedIn / social link in the brand column of the footer ONLY if the account exists. Do not link to nonexistent profiles. If beta-user count is meaningful, add a "Trusted by N early users" line at `text-xs text-blue-200/40`. Skip both if unverifiable.

6. **TODO carried forward (NOT in Pass 6 code):** "Plan a future art-direction pass for premium dark-mode-specific hero photography. Current Toyota damage shot acceptable for launch."

**Files:**

- All section files (luminance pseudo-element)
- [src/app/components/landing/HeroSection.tsx](../src/app/components/landing/HeroSection.tsx) (car silhouette SVG)
- [src/app/components/landing/OperatingRegionsSection.tsx](../src/app/components/landing/OperatingRegionsSection.tsx) (topographic rings)
- [src/app/components/landing/FooterSection.tsx](../src/app/components/landing/FooterSection.tsx) (trust anchors if applicable)
- New: `src/assets/landing/car-silhouette.svg` (or inline path in HeroSection)

**Strict scope — what Pass 6 will NOT do:**

- No racing decorations
- No tire tracks
- No spark / explosion graphics
- No mechanic-shop emoji icons
- No Apple Maps homage
- The luminance accents are SUBTLE — 16–22% opacity, behind the content, not competing with it

**Validation:**

- Each section reads with its unique light personality but stays calm (Direction C light, not full)
- Car silhouette is visible but does not compete with hero image
- Topographic rings are visible behind Coverage map but don't read as map data
- WCAG AA contrast preserved (luminance is behind content, not on it)
- Light mode subtle automotive cues (amber stroke car, road dashes) feel premium

**Risk:** Low. Decorative additions; reversible per-section.

**Co-update:** Add automotive-identity guidelines to [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § 7 Color Decisions and § 9 Things We Will Not Do (so the racing/kitsch boundary is documented).

---

## Identity Guardrails (binding every pass)

From [`bd-design-identity` skill](~/.claude/skills/bd-design-identity/SKILL.md), [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md), and [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md):

- **Calm > lively.** Calm, premium, breathable, trustworthy, product-owned.
- **Map is the base layer; glass floats above.** Never weaken the map for chrome.
- **Blue system has 4 roles** — royal (identity/action), sky (atmosphere/guidance), navy (depth/night), gray-blue (subdued). Don't bleed roles into each other.
- **Glass is breathable + warm + translucent**, not over-solidified, painted, cold, or aggressively glossy.
- **`bd-*` utilities** (`bd-glass-panel`, `bd-glass-card`, `bd-glass-floating`, `bd-glass-badge`, `bd-glass-control`) — prefer over hand-rolled Tailwind. New variants land in `theme.css`, not in component files.
- **Subtle car cues only.** Headlight bokeh / route lines / topographic rings / painted-metal sheen = yes. Racing stripes / chrome wheels / spark explosions / Apple Maps homage = NO.
- **The discipline filter, run on every change:** "Does this make the page feel more central, more premium, more breathable, and more distinctly BidOnDent?" AND "Does this reduce confusion and increase trust?" If NO to either: skip.

---

## Co-Update Commitments

Per [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) § Co-Update Rules:

| Trigger | Doc to update | Pass |
|---|---|---|
| Audit issue resolved | [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) (mark RESOLVED with commit hash) | 1, 2, 3, 4 |
| Design system changed | [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) § Design System + [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) | 3, 4, 5, 6 |
| New variant added to `theme.css` | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § Design System | 3, 4 |
| New reusable hook (atmosphere bloom, parallax) | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) § 5 | 5 |
| Audit doc fully resolved | Move [`landing_design_audit_2026-05-02.md`](landing_design_audit_2026-05-02.md) to `docs/archive/` after Pass 6 sign-off; update this PLAN doc to STATUS COMPLETE | After Pass 6 |

Each pass's commit message must reference the relevant `bd-design-identity` skill and the audit issue IDs being resolved.

---

## Deferred Items (Not in this Plan)

These came up during planning but are explicitly out of scope:

- **Coverage section height reduction.** Owner decision: keep long. Audit fatigue post-redesign.
- **Mobile sticky "Start Repair" CTA after 300px scroll.** Owner decision: defer; separate conversion pass.
- **Dark-mode-specific hero photography.** Carries forward as Pass 6 TODO; cosmetic, not code.
- **Settings modal / profile menu integration of appearance toggle.** Pass 1.5 puts it in the header; deeper integration is overengineered for this phase.
- **System-mode auto-detect for appearance toggle.** Separate UX call; not in this plan.
- **Footer social links.** Pass 6 only if real accounts exist.

---

## Execution Notes

- **One pass at a time.** Each pass: code → typecheck → tests → light/dark/3 viewports verified → commit referencing `bd-design-identity` and audit IDs → owner reviews on Vercel preview → next pass.
- **No mixing passes.** If Pass 1 surfaces a need for atmosphere or animation work, write it down as a follow-up to the right pass; don't carry it into Pass 1.
- **No "while-I'm-here" cleanup.** Per autopilot discipline rules. Touch only what each pass authorizes.
- **Commit messages**: include skill name + audit IDs. Example for Pass 1:
  ```
  polish(landing): consolidate marketing cards to bd-glass-card per bd-design-identity skill

  - Migrate HowItWorks/WhoWeServe/Benefits step/role/photo cards to bd-glass-card utility
    (deletes inline gradient + boxShadow approximations of the canonical class)
  - Fix AboutOpportunity "Learn more" tap target 20px → 44px (WCAG 2.5.5)
  - Align LandingPageLayout wrapper start to hero warm cream
  - Fix Hero 4px mobile horizontal overflow
  - Restore Footer separator opacity to match other section separators

  Resolves audit P1-2, P1-4, P3-10. See docs/PLAN_LANDING_REDESIGN.md Pass 1.
  ```

---

## Pass Order (locked rationale, 2026-05-02)

The order below is binding. Atmosphere consistency comes before color identity comes before motion comes before car identity. Each pass produces a visible-to-owner improvement; system correctness alone is never sufficient.

| Order | Pass | Why this position |
|---|---|---|
| 1 ✓ | Pass 1 + Pass 1R | Foundation + visible-presence baseline. Committed 2026-05-02 as a checkpoint. |
| 2 | **Pass 1R-extension** | Atmosphere consistency across the remaining 5 sections. Without this, the page feels uneven (polished first half, flat second half). Most important next step. |
| 3 | Pass 1.5 — Appearance toggle | Surfaces an existing feature once the visible baseline is solid. Toggle doesn't improve emotional feel; defer until the page IS visibly improved. |
| 4 | Pass 3 — Direction B (Amber-Lit Garage) | Warm/cool register split needs an atmospheric base to layer onto. Doing this before atmosphere consistency wastes the warm amber on a still-flat page. |
| 5 | Pass 4 — Premium glass consolidation | CTA + AboutOpportunity + BusinessInquiry rows. Direction B sets the temperature; Pass 4 propagates the canonical glass to the remaining surfaces. |
| 6 | Pass 5 — Restrained premium motion | Parallax orbs + mobile edge-strip separators. The system must be visually consolidated first; animating a flat page just decorates the flatness. (Atmosphere bloom is already in Pass 1R.) |
| 7 | Pass 6 — Automotive identity + Direction C luminance accents | Cinematic top-coat — car silhouette, road-line separators, per-section luminance glows. Needs everything underneath to land properly. |

**Never run out of order.** If a pass surfaces work that belongs in a later pass, write it down as a follow-up — don't carry it forward into the current pass.

---

## Status / First Action

- [x] Plan written and owner-approved (2026-05-02)
- [x] Pass 1 — Foundation Fixes (committed `084ca27f`, jointly with Pass 1R)
- [x] Pass 1R — Visible Landing Presence (committed `084ca27f`, owner-reviewed checkpoint)
- [x] Pass 1R-extension Core — atmosphere + bloom across remaining 5 sections (committed `548e2ab7`)
- [x] Pass 1R-extension Branch A — light-mode second tier deeper amber + glow halos (committed `a37f3e61`)
- [x] Pass 1R-extension Branch B — activated and folded into Pass 8 below (visual review on Vercel 2026-05-02 confirmed warm-section card mismatch)
- [x] Pass 1.5 — Appearance Toggle Exposure (committed `086cc27e`, Sun/Moon glass-control in header)
- [x] Pass 2 — folded into Pass 1R + Pass 1R-extension (atmosphere visibility delivered earlier than planned)
- [x] Pass 3 — Direction B Amber-Lit Garage (committed `bf0ffbfe`, warm/cool register split in dark mode)
- [x] Pass 4 — Premium Glass Consolidation (committed `2c77be58`, AboutOpportunity / CTA / BusinessInquiry rows + CTA lamp bloom)
- [x] Pass 5 — Restrained Premium Motion (committed `4e58a929`, scroll-driven parallax on large blur pools)
- [x] Pass 6 — Automotive Identity + Direction C Luminance Accents (committed `79b5441a`)
- [x] Pass 7 — Polish-then-sign-off cleanup (committed `28ae7a52`, merged to main `79ad21b7`)
- [x] Pass 8 — Branch B activation + hero carousel polish (committed `9b9477d0`, merged to main `be2d78d9`)
- [x] Pass 9 — Section card material strength (committed `0263f008`, merged to main `1bc86af4`)
- [x] Pass 10 — Section transition atmospheric bloom-bridges (committed `c313e3eb`, merged to main `021e4987`)
- [x] Pass 11 — Marketing density polish + light mode richness (committed `26b4dc8b`, merged to main `b6e4733c`)
- [x] **STATUS COMPLETE — initial redesign signed off 2026-05-02** (commit `e1cd4ebf`); both audit docs archived under [`docs/archive/`](archive/).

### Post-signoff visual refinement passes (2026-05-02)

After STATUS COMPLETE was committed, the owner authorized a small editorial-typography refinement layer. These passes are **post-signoff visual refinement, not a reopened redesign plan** — the redesign itself remains closed at Pass 11. The locked Direction C palette in [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §7 was extended with editorial flanking-stroke accents per section, using each section's already-assigned palette color. No new direction, no scope creep — system completion via the existing palette.

- [x] Pass 12 — TrustStats H3 metallic-gold flanking accent (committed `4ea8b028`, merged to main `5e63f572`)
- [x] Pass 13 — Benefits H3 gold flanking accent (committed `ef3a5a0c`, merged to main `0ad778d5`)
- [x] Pass 14 — Cool-section H3 flanking accents — sky teal (HowItWorks), royal blue (WhoWeServe), cobalt (AboutOpportunity), slate-blue (BusinessInquiry) (committed `7487da59`, merged to main `9de520d9`)
- [x] Pass 15 — Visibility tuning (AboutOpportunity light cobalt → royal blue for visibility, BusinessInquiry slate-blue peak bumped) + CTA white-cream flanking accent for system completion (committed `80cde776`, merged to main **`fdcff97f`**)

Final accent map across the 10 landing sections (post Pass 12–15):

| Section | Editorial flanking accent | Notes |
| --- | --- | --- |
| Hero | — | Skipped: H2 is multi-line + left-aligned; gradient text already does the heading-anchor work |
| HowItWorks | sky teal | Pass 14 |
| Benefits (warm Direction B) | warm gold | Pass 13 |
| WhoWeServe | royal blue | Pass 14 |
| AboutOpportunity | royal blue (light) / lighter blue (dark) | Pass 14 + Pass 15 light-visibility tune |
| TrustStats (warm Direction B) | warm gold | Pass 12 |
| Coverage | — | Skipped: locked palette excludes — map IS the atmosphere |
| BusinessInquiry | slate-blue | Pass 14 + Pass 15 visibility bump |
| CTA | white-cream lamp | Pass 15 (completes the system) |
| Footer | — | Skipped: locked palette excludes — near-black close |

7 of 10 sections accented; 3 skipped on principle (composition, locked palette). The skips are deliberate — forcing accents onto Hero / Coverage / Footer for symmetry would violate the design system's restraint rules.

### Open / not-design items

- [ ] Bug investigation (separate from any design pass): "Real nearby places: Load failed" in CoverageMapDialog Explore view — provider-reliability issue (Overpass rate-limit / outage / Safari native error), CSP already fixed (KI-051 RESOLVED). File a new KI scoped to provider-reliability if persistent.
- [ ] Mobile X-button tap targets (40×40 below WCAG 44×44 on mobile) — pre-existing pattern across DialogClose + bottom sheet X. One-line `h-11 w-11` fix in two files. Not bundled with anything.
- [ ] Owner phone walk on real iOS Safari to validate runtime behavior (drag-down dismiss, scroll trapping, appearance toggle persistence, BusinessInquiry forms).

### Owner visual review notes (2026-05-02, post-Pass-7 deploy)

Owner walked the live Vercel site in light + dark on desktop. Verdict: **major progress visible, but several real design issues surfaced that block STATUS COMPLETE**. Audit doc archival deferred until Pass 8–11 ships.

**Strong (don't break):**

- Direction B amber-black register on Benefits + TrustStats (dark) reads beautifully — strongest visual deliverable of the redesign so far.
- Hero composition (photo + 3 floating chips) is premium in both modes.
- Coverage Map Dialog "Mode Midnight" command center is the highest-craft surface on the page. Becomes the explicit quality bar for future polish.
- Light-mode TrustStats cards (with Pass 7 inline preserve) read as magazine-clean.
- CTA in dark with Pass 4 lamp bloom + decorative geometry feels finished.

**Weak (Pass 8–11 scope):**

| Issue | Mode | Pass |
|---|---|---|
| Benefits photo cards in LIGHT mode read as nearly invisible against warm-ivory section. Cool-blue `bd-glass-card--landing` variant clashes/recedes on warm bg. **Branch B problem now visually confirmed.** | light | 8 |
| Hero carousel dots are tiny (7×7px inactive) — hard to perceive as navigation | both | 8 |
| WhoWeServe role cards lack visual weight in both modes — no images, undersized icons, faint borders | both | 9 |
| AboutOpportunity accordion cards in dark feel outlined, not lit — borders dominate, surface recedes | dark | 9 |
| TrustStats migration to warm variant (currently uses cool `--landing` + inline overrides; should use `--landing-warm` natively) | both | 9 |
| Section transitions at warm/cool boundaries still abrupt despite Pass 7 amber separator | dark | 10 |
| BusinessInquiry section feels empty — just two action rows in a wide section | both | 11 |
| Coverage section is dense / dashboard-y as a marketing surface | both | 11 |
| Empty state ("No shops within 20 miles") functional but bare — could feel "ready" not "broken" | both | 11 |

### Pass 8 outcome notes (this commit)

Activates the deferred Branch B and polishes the hero carousel.

- **`bd-glass-card--landing-warm` variant added to theme.css.** Light: warm cream-ivory tint (`rgba(255, 252, 245, 0.92) → rgba(252, 246, 235, 0.78)`) with amber-tinted border + warm-amber glow. Dark: warm-amber tinted glass (`rgba(180, 100, 30, 0.18) → rgba(20, 14, 8, 0.78)`) for native fit on Direction B amber-black sections. Heavy shadow + 6px hover lift parity with `--landing`.
- **Benefits photo cards swapped to `--landing-warm`.** Now read as warm-cream lit-glass on warm-ivory section in light mode, and warm-amber lit-glass on the warm Direction B register in dark mode. Resolves the most visible weak spot in light mode.
- **Hero carousel dot polish.** Active dot expands to 24×8px pill with subtle royal-blue glow shadow. Inactive dots: 8×8px circle at 40% opacity (was 7×7px at 22-28%). Larger touch target preserved. Visible navigation affordance restored.

### Pass 9 outcome notes (this commit)

Triggered by post-Pass-8 owner walk endorsement ("Pass 9 go") via two-pass ChatGPT review. Tightly scoped to **section card material strength** without adding content or imagery. Three changes:

- **WhoWeServe role cards** — strengthened the icon plates and made the checklist rows feel intentional:
  - Icon plate `w-12 h-12 rounded-xl` → `w-14 h-14 rounded-2xl`; icon `w-6` → `w-7`. Stronger box-shadow (light: `0 6px 22px / 0 0 30px` glow, was `0 4px 16px / 0 0 22px`; dark: `0 0 24px` glow up from `0 0 16px`). Added inset highlight `inset 0 1px 0 rgba(255,255,255,0.65)` (light) / `inset 0 1px 0 ${iconBgDark}33, inset 0 -1px 0 rgba(2,6,23,0.30)` (dark) so plates read as lit-glass tiles, not flat fills.
  - Checklist rows now use a 2px filled circle bullet with brand-color glow (`box-shadow 0 0 8-10px ${color}66-88`) instead of the outlined `CheckCircle2` icon. Rows have subtle hover backdrop `rgba(56,189,248,0.06)` (light) / `rgba(96,165,250,0.06)` (dark) to reinforce that they're a structured list, not plain text. Tighter `gap-2` + `rounded-lg` row chrome.
  - Stronger text: row text `text-slate-500` → `text-slate-600` (light), `text-blue-100/65` → `text-blue-100/75` (dark) for legibility.
- **AboutOpportunity accordion cards** — added a dark-mode "lit from within" treatment:
  - New inset radial highlight div as first child of each card: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(96,165,250,0.06-0.10), transparent 70%)`. Visible behind content via `relative z-` + `pointer-events-none`. Reads as a soft top-down lit-glass surface in dark mode (and gentle on light).
  - Icon plate scaled up: `w-12 h-12 rounded-[1rem]` → `w-14 h-14 rounded-2xl`; icon `w-6` → `w-7`. Stronger glow + inset highlight matching WhoWeServe pattern (so the two sections share the same icon-plate confidence).
  - Existing cards already used `bd-glass-card bd-glass-card--landing`; this pass strengthens the inner surface so the `--landing` glass plate is fully expressed instead of feeling outlined.
- **TrustStats class migration to `bd-glass-card--landing-warm`** — architectural cleanup. Inline gradient/shadow/hover preserve from Pass 7 still wins (no visual change), but the class marker now correctly indicates the warm Direction B register. Future agents grepping for `bd-glass-card--landing-warm` will find both Benefits and TrustStats — the two warm-register sections — together. Per ChatGPT guardrail "if migration weakens it, do not force the migration": no visual weakening, just marker accuracy.

What Pass 9 deliberately did NOT do (per ChatGPT scope discipline):

- No imagery, no new content, no structural refactors
- Coverage section untouched (separate UX pass per Pass 11)
- Benefits cards untouched (Pass 8 already landed warm variant)
- HowItWorks untouched (already strong)
- No new global CSS variants (Pass 8's `--landing-warm` is enough; resisted creating `--landing-rich` etc.)

Build verified clean: vite production build, no errors. Pre-existing CSS warnings on duplicate `[data-appearance-mode="light"]` selectors remain unchanged tech debt.

### Pass 10 outcome notes (this commit)

Triggered by post-Pass-9 owner walk endorsement ("Pass 10 go") via ChatGPT review with the explicit guardrail "subtle, like lighting changes, not section dividers." Pass 10 adds **atmospheric bloom-bridges** at all four warm/cool register transitions on the page.

Before Pass 10: each section had a 1px gradient separator at its top edge. In dark mode these were already dual-tone amber↔blue (audit's "cool only" finding was incorrect). In light mode the separators were single-tone except at WhoWeServe top (Pass 7 fix). The audible problem wasn't the line — it was the absence of a soft luminance bridge between two tonally different sections.

What Pass 10 added — a single absolute-positioned div per transitional section, immediately after the existing 1px separator, holding a low-opacity radial gradient bloom centered at the top edge:

| Transition | Section top | Bloom color (light / dark) | Height |
|---|---|---|---|
| HowItWorks → Benefits (cool→warm) | Benefits | amber `rgba(220,140,50,0.16)` / `rgba(180,90,30,0.20)` | 128px |
| Benefits → WhoWeServe (warm→cool) | WhoWeServe | sky `rgba(56,189,248,0.12)` / `rgba(96,165,250,0.14)` | 96px |
| AboutOpportunity → TrustStats (cool→warm) | TrustStats | gold `rgba(220,160,80,0.18)` / `rgba(200,140,50,0.22)` | 128px |
| TrustStats → Coverage (warm→cool) | Coverage (replaced placeholder strip) | blue `rgba(96,165,250,0.10)` / `rgba(59,130,246,0.14)` | 128px |

Each bloom is `radial-gradient(ellipse 90% 100% at 50% 0%, [color], transparent 70%)` with `pointer-events: none` and z-index that sits behind content but above section bg. Coverage's existing `bg-gradient-to-b from-[#f0f4f8]/0 to-transparent` placeholder (which was rendering as transparent-to-transparent — i.e., invisible) was replaced with the tinted bloom.

What Pass 10 deliberately did NOT do (per ChatGPT scope discipline):

- No new "fade strips" or hard dividers
- No reinforced 1px separator changes (existing dual-tone in dark / amber-fix in light from Pass 7 are correct)
- No transitions added at cool→cool or warm→warm boundaries (Hero→HowItWorks, WhoWeServe→AboutOpportunity, Coverage→BusinessInquiry, etc. — those don't need register-shift treatment)
- No content, copy, or layout changes
- Light mode richness pass deferred to Pass 11

Build verified clean: vite production build, no errors.

### Pass 11 outcome notes (this commit) — final design pass before sign-off

Triggered by owner's "go fully auto on everything now" instruction. Tightly scoped to four changes covering marketing density + light mode richness, with one originally planned change deliberately skipped to avoid decoration noise.

- **BusinessInquiry trust pills above gateway card.** Three honest process-truth pills (`Verified team review`, `No fee to apply`, `Direct human follow-up`) below the section intro paragraph, above the role-split gateway. Glow-dotted, mode-aware. No fake stats, no fake partner numbers — just process truth that adds visual weight to the section. File: [`src/app/components/landing/BusinessInquirySection.tsx`](../src/app/components/landing/BusinessInquirySection.tsx).
- **"No shops within 20 miles" empty state upgrade.** Replaced the gray pin + literal copy with a friendlier framing: "Coverage is expanding" headline + softer body copy ("No partner shops within {N} miles yet. Try a wider radius, a different ZIP, or check back as our network grows across NY"). Pin icon now sits in a 48×48px lit-glass plate (blue-tinted with inset highlight + glow shadow), matching the icon-plate language established by WhoWeServe and AboutOpportunity in Pass 9. Reads as "ready and growing," not "broken." File: [`src/app/components/landing/CoverageNearestShops.tsx`](../src/app/components/landing/CoverageNearestShops.tsx).
- **Hero light-mode atmosphere depth bump.** Increased amber blur pool opacities (0.18→0.22→0.42 / 0.22→0.26 / 0.36→0.42) and color-atmosphere ellipse opacities (0.32→0.38, 0.28→0.34, 0.24→0.28). Mesh dot grid bumped 0.08→0.10 with opacity-95. Subtle but the hero now reads warmer and more dimensional in light mode without becoming loud. File: [`src/app/components/landing/HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx).
- **AboutOpportunity card inner-highlight bump (light mode).** From `rgba(96,165,250,0.06)` to `rgba(96,165,250,0.10)`. Same lit-from-within radial that Pass 9 added; now also expressive enough in light mode to give cards proper material weight. File: [`src/app/components/landing/AboutOpportunitySection.tsx`](../src/app/components/landing/AboutOpportunitySection.tsx).

What Pass 11 deliberately did NOT do:

- **Coverage trust strip** (originally planned 5th fix) — skipped. The map already has `BIDONDENT MAPS` label + OpenStreetMap attribution; adding another caption would create the "decoration noise" ChatGPT explicitly warned against in Pass 10 review.
- **Coverage section structural changes** — out of scope; that's a future UX pass on the map product itself, not the landing wrapper.
- **Light-mode richness on every section** — restricted to the two highest-impact light-mode surfaces (Hero atmosphere + AboutOpportunity inner highlight). WhoWeServe + Benefits + TrustStats light mode already shipped strong material in Passes 8 and 9.
- **No new content, copy refactors, or layout changes** beyond the empty-state copy upgrade.

Build verified clean: vite production build, no errors.

### Sign-off (this commit + next)

Per owner authorization to "go fully auto on everything," sign-off is taken in the same session:

- Both audit docs archived to [`docs/archive/`](archive/) with date suffix in their filenames per `LAW_PROJECT_RULES.md` co-update rules.
- This plan doc marked **STATUS COMPLETE** in the header and Status / First Action section.
- All redesign-related KIs in `REF_KNOWN_ISSUES.md` flipped to RESOLVED with commit hashes (where applicable).

### Tracked but separate from this plan

- Investigation — "Real nearby places: Load failed" in CoverageMapDialog Explore view. Reliability bug, not landing-redesign scope. Should be triaged separately under `placeDiscovery` service / edge function audit.


### Pass 7 outcome notes (code-complete, awaiting owner walk)

Triggered by the post-Pass-6 visual audit (`docs/landing_design_audit_post_pass_6_2026-05-02.md`). Four narrowly-scoped polish items, none introducing new direction.

- **Coverage map WebGL fallback** — added `backgroundColor: "#071830"` (dark) / `"#e8eef7"` (light) to the map shell so a failed/loading WebGL canvas blends with the page rather than rendering as a 1810px black void in low-GPU contexts. File: [`src/app/components/landing/OperatingRegionsSection.tsx`](../src/app/components/landing/OperatingRegionsSection.tsx).
- **Dual-tone amber→blue separator at Benefits↔WhoWeServe (light mode only)** — dark mode was already correct (audit was wrong about it). Light mode now mirrors the dark pattern: amber at 22%/78%, sky blue at 50%. File: [`src/app/components/landing/WhoWeServeSection.tsx`](../src/app/components/landing/WhoWeServeSection.tsx).
- **TrustStats commitment cards** — added `bd-glass-card bd-glass-card--landing` class markers. Inline gradient/shadow/hover left in place to preserve the deliberate cool-glass-on-warm-section visual; class markers exist now for design-system enforcement and future-agent grepability. File: [`src/app/components/landing/TrustStatsSection.tsx`](../src/app/components/landing/TrustStatsSection.tsx).
- **BusinessInquiry action rows** — added `bd-glass-card` class marker on both Shop and Insurer action rows. Same minimal-scope philosophy. File: [`src/app/components/landing/BusinessInquirySection.tsx`](../src/app/components/landing/BusinessInquirySection.tsx).

### Audit-flagged questions resolved during Pass 7

- **Q1 (TrustStats commitment card count):** verified — exactly 4 commitments in source. Audit's "8 card-sized elements" was a Copilot DOM-counting artifact (counted wrappers + cards).
- **Q3 (Coverage sticky heading):** non-issue. No `sticky` in Coverage source. Was a Playwright capture artifact.
- **Q2 (Branch B / Benefits warm-card variant in light mode):** deferred — accepted as known gap. Trigger to revisit: if owner reports Benefits photo cards reading cold/wrong on warm-ivory section in production.
- **Q4 (Topographic ring visibility in Coverage light mode):** deferred to live verification. If rings are sub-perceptual on light map tiles, fix is a single opacity bump; not pursued in Pass 7.

### Outstanding before STATUS COMPLETE

- Owner walks the live Vercel site (post-merge) in light + dark, end-to-end on desktop + mobile.
- On owner sign-off:
  - Move [`landing_design_audit_2026-05-02.md`](landing_design_audit_2026-05-02.md) → `docs/archive/` with date suffix.
  - Move [`landing_design_audit_post_pass_6_2026-05-02.md`](landing_design_audit_post_pass_6_2026-05-02.md) → `docs/archive/` with date suffix.
  - Mark this doc STATUS COMPLETE.
  - Update [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) for any redesign-related KIs flipped to RESOLVED with commit hashes.

### Pass 6 outcome notes (code-complete, awaiting owner sign-off)

- **Hero car silhouette** — sedan SVG path (body + windows + wheels + spoke detail) at 7% (light) / 10% (dark) opacity, top-right of hero, behind hero image, hidden below `md:`. Warm navy-blue stroke in light mode; cool sky-blue in dark.
- **Hero → HowItWorks road dashes** — three horizontal dashed segments at hero bottom, evoking lane markings. Amber gradient in light, blue gradient in dark. `sm:` and up.
- **Coverage topographic rings** — five concentric SVG circles centered on the section, two outer rings dashed (radar / topographic feel). 6% (light) / 8% (dark). Behind atmosphere, behind map.
- **Per-section corner luminance glows (Direction C light)** — applied to Hero / HowItWorks / Benefits / WhoWeServe / AboutOpportunity / TrustStats / BusinessInquiry. Coverage skipped (map IS the atmosphere). CTA already has its lamp from Pass 4. Footer skipped (near-black close). Sizes 600–800px, opacity 15–22% per the spec table. Each glow positioned at its unique corner per section identity.

### Outstanding items / not in this pass

- Footer social links — skipped per spec ("only if real accounts exist"). Not pursued.
- Premium dark-mode-specific hero photography — TODO carried forward (cosmetic, not code).
- WCAG AA contrast verification — luminance is behind content so unlikely affected, but owner should spot-check Benefits / TrustStats text on warm-section luminance.
- Audit doc resolution — after owner sign-off on Pass 6, archive [`landing_design_audit_2026-05-02.md`](landing_design_audit_2026-05-02.md) to `docs/archive/` and mark this doc STATUS COMPLETE.

When the owner approves Pass 6, mark this doc STATUS COMPLETE and archive the audit.
