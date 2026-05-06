# BidOnDent — Animation & Atmosphere (LAW)

**Authority level:** LAW — governs all motion, animation, and atmosphere work in BidOnDent. Cannot be violated without explicit per-session override from the project owner.

**Last updated:** 2026-05-04

**Phase context:** [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) Phase 4.5 row. Charter for Phases 4.5, 6.5, 7.5, 8.5 (the `.5` atmosphere phases of v3.3 master plan).

**Companion docs:**

- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED, structural). This charter cross-refs MOLANDJESUS as authority for motion _vibe_ (calm, premium, map-first); never overrides it.
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — atmosphere primitives live in L1; this charter reserves `src/app/components/atmosphere/` for them.
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — Premium Glass / Premium Gold canon that motion must respect.

---

## 1. What motion is for in BidOnDent

Motion serves **two purposes** and only two:

1. **Trust signal.** Status changes (bid received, claim approved, route active, photo upload progress) get motion that makes the change _feel real_. The user should never wonder "did that happen?" Motion answers that question.
2. **Spatial continuity.** Map redraws, route plotting, dashboard reveals on scroll — motion makes spatial relationships legible. The user should always understand "I came from there, this is here, that thing relates."

Motion is **never** for decoration. If a motion doesn't serve trust or spatial continuity, it does not ship. This is the discriminating filter every animation passes through before being added.

**Rejected on sight:**

- Decorative bounces, jiggles, jitters, "playful" effects
- Loading spinners that exist just to fill time (use static skeleton states or genuine progress)
- Hover effects that don't communicate state
- Page-load animations that delay first interaction
- Any animation that competes with active user input (e.g. drift effects during scroll)
- Any animation that defeats `prefers-reduced-motion: reduce`

**Authority for motion vibe:** [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md). Calm, premium, map-first — atmospheres breathe; objects don't perform. When in doubt, the doc you're reading defers to MOLANDJESUS.

---

## 2. Canonical keyframe inventory (current state, 2026-05-04)

The codebase has **29 unique CSS keyframes** across two files. They are the canonical foundation. New atmosphere/animation work in Phases 6.5 / 7.5 / 8.5 should compose from this set FIRST; only add new keyframes when the existing set genuinely cannot express the intent.

### A. Atmosphere / orb (6) — `src/styles/animations.css`

| Keyframe         | Purpose                                  | Used by                                                                                                                                 |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `blobFloat`      | Slow large-radius drift for ambient orbs | Landing hero atmosphere                                                                                                                 |
| `orbDrift`       | Ambient orb horizontal drift             | Landing background atmosphere; dashboard `.bd-dashboard-atmosphere` living gold-lava layers (28s + 36s, crossing-phase, in `theme.css`); landing `.bd-landing-section-toplamp` (32s + 44s) and `.bd-landing-section-bottomwash` (24s + 38s) living-lava extensions |
| `orbGlow`        | Slow opacity oscillation (light pulsing) | Landing + dashboard ambient orbs                                                                                                        |
| `orbBreathe`     | Slow scale oscillation (breathing)       | Landing + dashboard ambient orbs                                                                                                        |
| `orbFloat`       | Vertical float for ambient orbs          | Landing background atmosphere                                                                                                           |
| `orbRotateDrift` | Combined slow rotation + drift           | Landing background atmosphere                                                                                                           |

### B. Float / parallax (3) — `src/styles/animations.css`

| Keyframe        | Purpose                                  |
| --------------- | ---------------------------------------- |
| `float`         | Standard slow vertical float             |
| `float-slow`    | Very slow vertical float (longer cycle)  |
| `float-delayed` | Float with negative delay (offset start) |

### C. Reveal / fade (6) — `src/styles/animations.css`

| Keyframe      | Purpose                              |
| ------------- | ------------------------------------ |
| `fadeIn`      | Opacity 0 → 1                        |
| `fadeInUp`    | Slide up + fade (8–12px translate-Y) |
| `fadeInDown`  | Slide down + fade                    |
| `fadeInLeft`  | Slide right + fade                   |
| `fadeInRight` | Slide left + fade                    |
| `scaleIn`     | Scale 0.95 → 1 + fade                |

### D. Status pulse (5) — `src/styles/animations.css`

| Keyframe              | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `pulseGlow`           | Glow opacity oscillation (status emphasis)    |
| `shimmer`             | Horizontal gradient sweep (loading skeletons) |
| `slideInNotification` | Notification toast entrance                   |
| `countGrow`           | Number-counter scale-up                       |
| `speedWarningPulse`   | Speed warning emphasis (navigation)           |

### E. Map-specific (7) — split across both files

| Keyframe             | Purpose                            | Source           |
| -------------------- | ---------------------------------- | ---------------- |
| `mapPopupEnter`      | Map popup entrance                 | `theme.css`      |
| `bdLiquidGoldFlow`   | Map premium liquid gold sheen      | `theme.css`      |
| `bdPinPulse`         | Active map pin breathing           | `theme.css`      |
| `bdRouteShimmer`     | Route line draw-on shimmer         | `theme.css`      |
| `bdGoldSheenOneShot` | One-shot gold sheen sweep          | `theme.css`      |
| `dashMove`           | Dashed-line motion (route preview) | `animations.css` |
| `arrival-scale-in`   | Arrival callout entrance           | `animations.css` |

### F. Misc effects (2) — `src/styles/animations.css`

| Keyframe     | Purpose                                 |
| ------------ | --------------------------------------- |
| `spinSlow`   | Slow rotation (loading indicators)      |
| `bounceSoft` | Soft bounce (subtle, single-cycle only) |

**Inventory total: 29 unique keyframes.**

---

## 3. `prefers-reduced-motion` contract — REQUIRED

Every named animation in BidOnDent **MUST** be wrapped in or accompanied by a `prefers-reduced-motion: reduce` guard. No exceptions.

### Current guards (2026-05-04 baseline)

The codebase has 9 reduced-motion guards already in place:

- 6 CSS `@media (prefers-reduced-motion: reduce) { ... }` blocks in `src/styles/theme.css` (lines 681, 755, 1091, 1152, 1237, 1814)
- 3 JS-based `window.matchMedia("(prefers-reduced-motion: reduce)").matches` checks:
  - [`src/app/components/landing/HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx) (parallax + value carousel)
  - [`src/app/components/codelayer/ReportScreen.tsx`](../src/app/components/codelayer/ReportScreen.tsx) (step transition)
  - [`src/app/hooks/useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts) (global parallax hook)

### Mandatory pattern for new animations

When a Phase 6.5 / 7.5 / 8.5 commit adds a new animation, it MUST do one of the following:

1. **CSS-only path:** Add the animation behind an existing reduced-motion media query block in `theme.css` or `animations.css`. The block disables the animation via `animation: none` or `animation-duration: 0.001ms`.
2. **JS-driven path:** Use the existing `useParallaxOffset` hook pattern (or equivalent) to read `prefers-reduced-motion` and short-circuit the animation logic. Never animate when reduced-motion is set.
3. **New media query path:** If the animation needs its own reduce-block (e.g. it's complex or specific to a component), the same commit that adds the animation MUST add the reduce-guard. No "we'll add the guard in a follow-up" — they ship together or neither ships.

**Verification:** Reviewer (or AI) opens DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce, confirms the new animation is suppressed.

**Forbidden patterns:**

- Hardcoded `animation: name 5s infinite` without an accompanying reduce-block — REJECTED on sight.
- JS animation libraries (framer-motion, etc.) without their own reduce-motion handling — see Section 5.
- "We'll skip the guard for the hero — it's important" — REJECTED. The hero is exactly where reduced-motion users need the guard most.
- **CSS `transition:` declarations on interactive states (hover, focus, focus-visible, active) that produce visible motion (transform, opacity-via-transform-overlap) without a `@media (prefers-reduced-motion: reduce)` override** — REJECTED. The reduce-motion contract applies to ALL named motion sources, not just `motion/react` runtime systems. WAAPI overrides (from `motion/react`) and CSS transitions are independent layers; both must respect reduce. _Discovered 2026-05-05 during Phase 7.6 / KI-113 closure-proof audit: WAAPI was correctly reduced, but a CSS-level `.bd-dashboard-section--interactive` hover transition leaked through. See `OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md` close footer for the WAAPI-vs-CSS layering discussion._

---

## 4. Atmosphere folder reservation

[`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) reserves `src/app/components/atmosphere/` as the future home for L1 atmosphere primitives. **It remains empty until Phase 8.5.**

This charter reaffirms:

1. The folder exists conceptually but has **no files** at the time of this charter (verify: `ls src/app/components/atmosphere/` returns nothing).
2. **No agent may create files in `atmosphere/` during Phases 4.5, 6.5, or 7.5.** The folder is reserved for the Phase 8.5 ambient/idle motion primitives only.
3. Phases 6.5 / 7.5 must compose atmosphere using **inline component files** at their existing L2 locations (e.g. `landing/HeroAtmosphere.tsx` if extracted from `HeroSection.tsx`, NOT `atmosphere/HeroAtmosphere.tsx`).
4. **Phase 8.5 execution unlocks `atmosphere/`** for L1 ambient primitives (route draw-on, pin pulse, camera idle drift extraction). That phase will write the first `atmosphere/*.tsx` files.

**Why the reservation:** keeps the L1 layer clean. Atmosphere primitives are the most likely surface for future agent scope-creep ("while we're here, let's add an animation library, a particle system…"). Reserving the folder + locking timing prevents that creep.

---

## 5. CSS-first default + `motion/react` envelope + remaining-libs escape clause

> **Amended 2026-05-04 (`docs(canon):`)** during Phase 7.5 pre-execution audit, which surfaced a charter-vs-reality drift: `motion@12.23.24` (the framer-motion rebrand from Nov 2024) IS installed and consumed by 49 files via `motion/react` imports. The original §5 text claimed `framer-motion` was not installed, which was technically true (the package was renamed upstream) but materially false in spirit. This amendment aligns the charter with shipped reality while preserving the CSS-first default, the 29-keyframe primary vocabulary, and the mandatory reduced-motion contract. Additive correction only — §1, §2, §3, §4 untouched; no existing canon weakened.

### Current state: CSS-first default, `motion/react` permitted within a defined envelope

As of this amendment:

- `motion@12.23.24` IS installed (`package.json` → `"motion": "12.23.24"`). This is the rebranded **framer-motion** package — upstream renamed it from `framer-motion` to `motion` in November 2024. Same library, same `motion`, `AnimatePresence`, `useReducedMotion`, gesture, and drag APIs, imported via `motion/react`.
- `motion/react` is currently consumed by 49 files in `src/app/`. It is canon, not contraband.
- `gsap` is **NOT installed.**
- `lottie` / `lottie-react` is **NOT installed.**
- `@react-spring/*` is **NOT installed.**
- `three` / `@react-three/*` is **NOT installed.**

The motion infrastructure is therefore:

1. **CSS keyframes + Tailwind transitions** — the primary vocabulary (Section 2's 29 canonical keyframes).
2. **`useParallaxOffset`** — vanilla React hook, canonical reduced-motion-aware JS pattern (Section 3).
3. **`motion/react`** — permitted within the envelope defined below; not a free-fire license.

### CSS-first default (unchanged in spirit)

The 29 canonical keyframes catalogued in Section 2 remain the **primary motion vocabulary**. New ambient / atmosphere / idle / scroll-trigger motion composes from keyframes first. Phases 4.5 / 6.5 / 7.5 / 8.5 default to:

1. The 29 canonical keyframes
2. New CSS keyframes added to `animations.css` or `theme.css` (with mandatory reduce-guard per Section 3)
3. Tailwind `transition-*` utilities for state transitions
4. `useParallaxOffset` (or equivalent vanilla hook) for orchestration CSS cannot express

This default holds. `motion/react` does not displace it — it complements it for a specific, narrow envelope of interactions.

### `motion/react` permitted envelope

The following patterns are canon (already established across the 49 shipped files), and may be reused or extended in additional surfaces without further authorization:

1. **Stateful enter/exit transitions via `AnimatePresence`** — components that mount/unmount based on application state and need entrance + exit animations the DOM lifecycle alone cannot express. Canonical examples already shipped: [`AcceptedBidConfirmationSheet`](../src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx), [`BidCardArticle`](../src/app/components/codelayer/BidCardArticle.tsx).
2. **Gesture-driven micro-interactions** — `whileTap`, `whileHover`, `whileFocus` on buttons, cards, nav items, and other interactive surfaces where the gesture provides trust feedback. Canonical example already shipped: [`MobileBottomNav`](../src/app/components/dashboard/MobileBottomNav.tsx).
3. **Drag / swipe interactions on bottom sheets and similar gesture surfaces** — where touch-driven dismissal, snapping, and momentum are part of the interaction model.

This list **describes the established pattern**. It does not expand it. New `motion/react` patterns outside this envelope require justification (see guardrail below).

### Mandatory reduced-motion contract — extended

Section 3's reduced-motion contract is **extended**, not replaced. Both motion infrastructures must honor it:

- **CSS-keyframe motion** — `@media (prefers-reduced-motion: reduce) { ... }` (existing rule, Section 3).
- **`motion/react` motion** — `useReducedMotion()` from `motion/react` MUST be honored. Components using `motion.*`, `AnimatePresence`, `whileTap`/`whileHover`, or drag MUST short-circuit to a static / instant-state render when `useReducedMotion()` returns `true`. Same trust contract, same enforcement.

**Verification stays the same** (Section 3 §Verification): reviewer opens DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce, confirms the animation is suppressed. This now applies to both CSS and `motion/react` surfaces.

**Forbidden patterns (extends Section 3):**

- A `motion/react` component that animates regardless of reduced-motion preference — REJECTED.
- "Reduced-motion is a CSS-only concern" — REJECTED. The trust contract is library-agnostic.

### New-component guardrail (LAW tier)

Any **NEW component file** that introduces `motion/react` imports (vs. editing an existing file that already imports it) MUST justify in its commit message why CSS keyframes + Tailwind transitions cannot express the intent. The justification cites the specific gesture, enter/exit lifecycle, or drag interaction the new file requires.

Editing existing `motion/react` files (the 49 already shipped) requires no such justification — they are canon.

**Forbidden:**

- A new component file silently importing `motion/react` for ambient / idle / atmosphere motion (CSS keyframes can express that and must be preferred) — REJECTED.
- Replacing CSS-keyframe motion in an existing file with `motion/react` for stylistic reasons — REJECTED. CSS-first default holds.

### Remaining-libs escape clause (was Phase 4.6)

This clause now applies to **additional JS animation libraries** beyond `motion/react`: `gsap`, `lottie` / `lottie-react`, `@react-spring/*`, `three` / `@react-three/*`. None of these are installed. Adding any of them follows the same dep-add discipline:

If, during any phase's execution, a specific commit hits a genuine wall that neither CSS keyframes nor `motion/react` can express, that commit **stops** and triggers a dep-add proposal:

1. The blocked commit halts. The work is parked, NOT shipped with a workaround.
2. A separate planning commit is proposed: a one-paragraph rationale + the specific limitation hit + the library API that would resolve it.
3. **Owner must explicitly authorize the dep-add.** Without explicit owner go, the new library does not get installed.
4. If authorized, the library is added in a single, focused commit (one dep + minimum-scope usage in the blocked commit's surface). The dep-add commit message names the wall it overcame.
5. After authorization, the library may be used in subsequent commits — but each new use must still respect the reduced-motion contract (Section 3 + this section).

**Forbidden:**

- "Just install gsap preemptively, we might need it" — REJECTED.
- Installing any additional JS animation library without an active blocked commit demonstrating the wall — REJECTED.
- Bundling the dep-add into a feature commit instead of a separate dep-add commit — REJECTED.

The original "Phase 4.6" framing is retired (`motion/react` is already canon, so there is no framer-motion-specific dep-add cycle to track). Any future JS motion library follows this generalized clause.

---

## Cross-references

- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon; motion vibe authority. **NOT touched** by this charter (structural lock holds; controlled-edit clause not invoked because this charter cross-refs MOLANDJESUS rather than amending it).
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — reserves atmosphere folder for L1 use; this charter formalizes the reservation timing
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — Premium Glass canon, Premium Gold palette canon, Light-Mode Surface Rule (motion respects all three)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 4.5 row updated this commit
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination during atmosphere phases
- `src/styles/animations.css` — primary keyframe catalog
- `src/styles/theme.css` — map-specific keyframes + reduce-motion media queries
- [`src/app/hooks/useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts) — canonical reduced-motion-aware JS animation hook
