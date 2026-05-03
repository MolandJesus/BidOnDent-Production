---
title: Landing Signature Audit (Pass A — Liquid Map Intelligence)
date: 2026-05-03
plan: docs/PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md
status: COMPLETE — feeds Pass B
---

# Pass A — Landing Signature Audit

Inventory of the current landing surface before introducing the Liquid Map Intelligence motion layer. No code changes in this pass — output feeds Pass B (tokens) and Pass C (hero scene).

---

## 1. Section inventory

31 files in [`src/app/components/landing/`](../src/app/components/landing/). The 7 that compose the public landing page (in render order):

| Section          | File                                      | Existing motion                                                                                                                                                              | Pass-C-onward budget                                                             |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Hero             | `HeroSection.tsx` (549 lines)             | `useParallaxOffset` (3 amber pools), value carousel (3.8s), 3 floating glass badges with `animate-float-slow`, `animate-orb-drift/float/rotate`, `bd-bloom-atmosphere` entry | **High** — primary signature scene target. Right column to be replaced (Pass C). |
| HowItWorks       | `HowItWorksSection.tsx` (273 lines)       | `useScrollAnimation(0.1)` entry only                                                                                                                                         | Low — keep calm. Optional connector line (Pass E, deferred).                     |
| Benefits         | `BenefitsSection.tsx` (331 lines)         | `useScrollAnimation(0.1)` entry                                                                                                                                              | Low — hover sheen (Pass E, deferred).                                            |
| WhoWeServe       | `WhoWeServeSection.tsx` (339 lines)       | none surfaced                                                                                                                                                                | Low — role-color rim accent (Pass E, deferred).                                  |
| AboutOpportunity | `AboutOpportunitySection.tsx`             | `useScrollAnimation(0.1)` entry                                                                                                                                              | None — already correct (Pass 9).                                                 |
| OperatingRegions | `OperatingRegionsSection.tsx` (497 lines) | hosts MapLibre via `ServiceCoverageMap`                                                                                                                                      | **Subtle only** (Decision #6) — pin pulse only, deferred.                        |
| CTA              | `CTASection.tsx` (230 lines)              | `useScrollAnimation(0.15)` entry                                                                                                                                             | Low — subtle gold sheen sweep (Pass E, deferred).                                |

`isLightAppearance` propagation: 344 references across landing files — every section already branches light/dark. New tokens must follow the same prop-drilled pattern.

---

## 2. Existing keyframes inventory (DO NOT duplicate)

From `src/styles/theme.css`:

| Keyframe                         | Line     | What it does                      | Reuse for Pass B/C?                                                                          |
| -------------------------------- | -------- | --------------------------------- | -------------------------------------------------------------------------------------------- |
| `slide-in-right`                 | 311      | Generic slide entry               | No — purpose mismatch                                                                        |
| `mapLiquidSheenDrift`            | 603      | Diagonal sheen sweep across glass | **YES** — alias as `bd-liquid-gold-sheen`; same shape, light/dark token swap                 |
| `mapUiEnter`                     | 615      | Map UI panel entrance             | No — already used by maps                                                                    |
| `mapNavIconPulse`                | 626      | Nav-icon pulse                    | **Reference only** — copy timing for `bd-pin-pulse` but new keyframe (different scale curve) |
| `mapGlassFloat`                  | 640      | Glass card subtle Y drift         | **YES** — alias as `bd-bid-card-float`; reuse keyframe directly                              |
| `mapPopupEnter`                  | 713      | Map popup entrance                | No                                                                                           |
| `animate-orb-drift/float/rotate` | tailwind | Floating orbs in hero             | Keep — already in production                                                                 |
| `animate-float-slow`             | tailwind | Hero badge float                  | Keep — Pass C bid cards reuse                                                                |
| `animate-pulse`                  | tailwind | Trust badge dot                   | Keep                                                                                         |

**Net new keyframes needed in Pass B:** 2 (`bd-liquid-gold-flow` background-position drift, `bd-pin-pulse` ring expansion). All other Pass B classes alias existing keyframes.

---

## 3. Token system inventory

`theme.css` already has:

- `--bd-warm-dark-amber-*` (lines 854–861) — dark mode amber-lit register
- `--bd-glass-bg-light/dark` (lines 824–826) — glass surface tokens
- `bd-glass-card--landing` / `bd-glass-card--landing-warm` (lines ~879, 933) — landing card systems
- `bd-bloom-atmosphere` (line 1052) — entry-fade wrapper for atmosphere layers

**Pass B will add:**

- `--bd-liquid-gold-light/-soft/-edge` (3 tokens)
- `--bd-liquid-gold-dark/-soft/-edge` (3 tokens)
- `--bd-route-blue/-soft/-glow` (3 tokens)
- `--bd-map-contour-light/-dark` (2 tokens)
- `--bd-flow-loop-slow/-med/-fast` + `--bd-flow-ease` (4 timing tokens)
- 6 utility classes: `bd-liquid-gold-flow`, `bd-liquid-gold-sheen`, `bd-route-line`, `bd-pin-pulse`, `bd-bid-card-float`, `bd-map-contour`

All gated by `prefers-reduced-motion: reduce` block at the bottom (mandatory per plan Engineering Constraints).

---

## 4. Conflicts and overlaps

| Concern                                             | Existing                                                           | Proposed                                                               | Resolution                                                                                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero amber atmosphere                               | 3 amber blur pools at 0.42 / 0.26 / 0.32 alpha (Pass 11)           | `bd-liquid-gold-flow` adds another gold layer                          | **Don't stack.** Pass C scene contains its own gold layer; the existing amber pools sit BEHIND the right-column scene, not inside it. Verify in Pass C: scene's gold tokens at lower alpha than existing pools (0.16 vs 0.42) so it doesn't dominate. |
| Hero badges (NY / Bids Received / Repair Completed) | Currently sit on top of hero photo                                 | Pass C removes the photo per Decision #2                               | **Reuse the badges.** Badges are the existing "bid cards" — Pass C re-poses them as the floating bid cards in the new map scene. No content invention needed.                                                                                         |
| Glass card system                                   | `bd-glass-card--landing` already provides depth + shadow           | Bid cards in scene need `bd-glass-card--landing` + `bd-bid-card-float` | Compose, don't replace.                                                                                                                                                                                                                               |
| MapLibre GPU cost                                   | Coverage section initializes WebGL canvas                          | Decision #1 LOCKED to mock; no 2nd WebGL context                       | No conflict. SVG/CSS only in hero scene.                                                                                                                                                                                                              |
| Reduced-motion                                      | `bd-bloom-atmosphere` already disables on `prefers-reduced-motion` | New keyframes need same guard                                          | Pass B reduced-motion block at end of Pass B CSS section is mandatory.                                                                                                                                                                                |
| Cascade precedence                                  | Tailwind utilities at `@layer utilities`                           | New classes must override Tailwind `rounded-*`, `opacity-*`            | Place new classes UN-LAYERED (per `theme.css:1547` comment). Same pattern D10 used for button radius.                                                                                                                                                 |

---

## 5. Per-section risk notes

- **Hero** — biggest risk. First paint, LCP-critical. Replacing the photo means losing 1 well-tested accessibility-labeled asset; the new scene must not regress contrast on left-column text. **Mitigation:** scene sits in right column with its own glass backdrop; left-column text contrast unchanged.
- **HowItWorks** — none. Pass deferred.
- **Benefits** — photo cards are the visual anchor; do not animate the photos themselves. Sheen sweep only on hover, only on hover-capable devices.
- **WhoWeServe** — role colors must stay subtle (alpha ≤ 0.15) or insurer card reads as "premium tier" which we do NOT want to imply.
- **AboutOpportunity** — leave alone. Already correct.
- **OperatingRegions** — every motion overlay sits on top of an active MapLibre canvas. Even subtle CSS-only pulses cost paint cycles. Single-pin pulse only this round; defer service-radius halos to a later authorized pass.
- **CTA** — final-screen impression. Subtle gold sheen on hover only. Defer to Pass E.

---

## 6. Mobile considerations

- Hero scene right column: hide entirely on `< 768px` per Decision #4. Left column already fills the column at that breakpoint (existing layout).
- All Pass B keyframes must respect `prefers-reduced-motion`.
- No `backdrop-filter: blur` on layers that themselves animate (Safari iOS regression).
- No new fonts, no new JS hooks, no new MapLibre instances.

---

## 7. Decision status

All 7 decisions LOCKED in plan (see decisions table at top of `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md`). No open questions.

---

## 8. What Pass B will deliver

- Single commit, `theme.css` only.
- ~140 net lines added: 12 tokens, 6 utility classes, 2 new keyframes, 1 reduced-motion guard block.
- Visual diff before / after Pass B: **zero** (no consumer applied yet).
- Build verifies clean.

## 9. What Pass C will deliver (after Pass B lands)

- `HeroSection.tsx` right column re-authored.
- Composition: stylized SVG map base → `bd-map-contour` → `bd-liquid-gold-flow` → blue report pin with `bd-pin-pulse` → SVG `bd-route-line` → 2 reposed bid badges (existing "Bids Received" + "Repair Completed!") with `bd-bid-card-float` → `bd-liquid-gold-sheen` overlay.
- Photo (`heroImage`) removed from hero right column. Prop deprecated; passing through unused for now (cleanup in a future pass).
- All glass cards reuse existing `bd-glass-card--landing` system.
- Mobile (< 768px): right column hidden entirely.

---

**End audit. Greenlight Pass B.**
