---
title: Landing Dark-Mode Audit — Pass G pre-work
date: 2026-05-03
status: COMPLETE — recommends Pass G1 NOT be authorized this round
parent: docs/PLAN_LANDING_DARK_MODE_PARITY.md
---

# Landing Dark-Mode Audit (Pass G pre-work item #1)

Walked every landing surface in dark mode. Compared against the dashboard's gold-lamp identity from D5–D10. Flagged each as **at parity** / **intentionally tiered** / **action-worthy gap**.

## Surfaces

### 1. `.bd-glass-card--landing` (dark)

**State:** At parity (intentionally lighter than dashboard).

D5/D7 already added gold-lamp trim:
- Inset bottom warm: `rgba(220, 165, 90, 0.18)`
- Warm ring: `rgba(220, 165, 90, 0.13)`
- Warm outer halo: `rgba(220, 140, 50, 0.20)`

Compare dashboard variant: ring `0.26`, outer `0.22`, inset `0.10`. Landing's ring is **deliberately** lighter (0.13 vs 0.26) — landing is busier than the dashboard, gold competing with marketing copy would push warm dominance over cool-action identity.

**Recommendation:** No change. The "asymmetry" is the design.

### 2. `.bd-glass-card--landing-warm` (dark)

**State:** At parity (Direction B amber-lit register, owner-locked).

Border `0.36`, ring `0.20`, outer `0.20`, warm inset top `0.20`. Reads as native member of the gold-lit family.

**Recommendation:** No change. Owner-locked per `feedback_external_audit_handling.md`.

### 3. Hero "Liquid Map Intelligence" scene (Pass C, dark)

**State:** At parity. Tokens `--bd-liquid-gold-dark/-soft/-edge` (0.22 / 0.12 / 0.06) read as native to the dashboard's gold-lamp register at 0.20–0.26 alpha range. Map contour uses `--bd-map-contour-dark` (0.10) — appropriately faint over deep navy.

**Recommendation:** No change.

### 4. HowItWorks section atmosphere (dark)

**State:** Intentionally tiered — cool blue, no warm gold pools.

The light mode has amber radials (`rgba(220,185,115,0.14)` etc.). Dark mode has only blue/indigo radials. This is **NOT** a parity gap — it's the cool/warm section rhythm locked in by Passes 6–11 + Direction B. HowItWorks is a cool section in both modes.

The card-level gold trim still arrives via `bd-glass-card--landing` so the cards themselves read as part of the gold-lit family even in a cool section.

**Recommendation:** No change. Touching this would violate the locked rhythm.

### 5. WhoWeServe section atmosphere (dark)

**State:** Intentionally tiered — same as HowItWorks. Pass E added per-role rim glow (Customer blue / Shops teal / Insurer gold) — Insurer's 0.14 alpha gold rim already carries warm identity even in this cool section.

**Recommendation:** No change.

### 6. OperatingRegions / Coverage section (dark)

**State:** At parity after Pass D. The new `bd-liquid-gold-flow` ambient layer drifts at 0.70 alpha behind the bloom atmosphere — visible behind the topographic rings + parallax pools without competing with the MapLibre canvas. `bd-pin-pulse--soft` on Live Coverage badge inherits blue from `--bd-route-blue`, not gold — that's correct (the pulse is a product/action color, not atmosphere).

**Recommendation:** No change.

### 7. Hero CTAs (`<button>` blocks at HeroSection.tsx:370 + 383)

**State:** **Action-worthy gap** — but NOT a token-swap fix.

Primary CTA (line 370–382) hand-rolls `rounded-[1.75rem]` + 3-stop gradient + boxShadow inline. Does NOT consume `bd-dashboard-primary-button` or `bd-glass-control`. So D10's rounded-2xl system + warm-trim hover/active states **do not apply here**.

Secondary CTA (line 383–390) likewise hand-rolls.

The gap is real. The fix is not. To pick up the system would require either:
- Replacing the entire className with `bd-dashboard-primary-button`, which would lose the 3-stop hero gradient (visible regression risk on a marketing-anchor CTA).
- Forking the `bd-dashboard-primary-button` system to add a hero-gradient variant (defeats D10's "system-level discipline, no per-component overrides" rule from `feedback_autopilot_rules.md`-adjacent prior decisions).

Either path is a refactor, not a parity tightening.

**Recommendation:** **Defer** to a dedicated future pass. Not in scope for "small, low-risk diff."

### 8. CTASection / WaitlistCapture / FooterSection / BusinessInquirySection CTAs (dark)

**State:** Same gap as #7 — hand-rolled button styles, no consumption of the D10 system. Same defer recommendation.

## Audit conclusion

Of 8 surface categories, 6 are at parity or intentionally tiered, 2 share a single deferred refactor (button-system consumption).

**No code is authorized this round.** The parity-gap "feel" the parent plan worried about is mostly already closed by D5/D7/Pass B/C/D/E work. The remaining gap is the landing CTA refactor, which is a separate scope item that needs its own plan + visual diff review.

## What this means for the parent plan

`docs/PLAN_LANDING_DARK_MODE_PARITY.md` should be updated to reflect:

- Pass G "surfaces" phase (G1) is **no-op** based on this audit.
- The button-system consumption refactor is the ONLY material remaining work for landing/dashboard parity, and it is its own initiative — not a sub-pass of G.
- Future scope: when authorized, that work could be called something like "Landing button-system adoption" rather than Pass G1, since the original Pass G1 scope (token-swap surfaces) found nothing to swap.

## Outcome

Closing Pass G pre-work item #1 (the walk). Items #2 (token inventory diff) and #3 (hero composition decision) are subsumed by this audit's per-surface findings. Pass G plan-doc lives on as the kickoff brief if/when the button-system refactor is initiated.
