---
title: PLAN — Landing Page Signature Polish (Liquid Map Intelligence)
authority: PLAN
status: DRAFT — awaiting owner sign-off on decisions before Pass A
last_updated: 2026-05-03
supersedes: none — additive on top of completed PLAN_LANDING_REDESIGN.md
companion_docs:
  - docs/LAW_PROJECT_RULES.md
  - docs/LAW_HARDENING_PLAN.md
  - docs/MOLANDJESUS_DESIGN_DECISIONS.md
  - docs/PLAN_LANDING_REDESIGN.md (historical execution record, STATUS COMPLETE)
  - skill: bd-design-identity
---

# PLAN — Landing Page Signature Polish (Liquid Map Intelligence)

> **Read this first.** [`PLAN_LANDING_REDESIGN.md`](PLAN_LANDING_REDESIGN.md) is the completed structural pass (Passes 1–16, sign-off 2026-05-02). It established the calm/premium foundation, the warm/cool register rhythm, the bd-glass system migration, and the gold-lamp atmosphere. **This plan is the next layer on top: signature motion + product storytelling, not redesign.**

---

## Why this plan exists

After 16 passes, the landing page is professional, calm, and structurally sound. The dashboard shell (post-D5–D10 polish) now has a stronger premium identity than the landing page does — gold-lit cool glass, royal blue actions, premium rounded buttons with warm rim trim. **The landing page reads as polished SaaS; the dashboard reads as a premium product.** The owner wants the landing to be the front door to the same premium world, with a "holy wow" signature moment that explains the product loop in one glance.

The leap isn't more polish on the existing surfaces. It's two specific things:

1. **Living motion that has product meaning** — the page should feel alive in a way that visualizes the marketplace loop (report → map → bids → compare → choose), not in a way that decorates flatness with random animated blobs.
2. **A signature hero moment** — the right side of the hero should become a layered "living repair marketplace" scene that tells the story without needing copy.

The owner's concept name: **Liquid Map Intelligence**. Gold = marketplace activity / opportunity / attention. Blue = user action / route / control. Glass = trust / structure. Map lines = discovery / local network. The motion expresses the product, not decoration.

---

## Locked identity (carried forward — do not relitigate)

These were settled across the prior 16 passes and the `bd-design-identity` skill. They are inputs to this plan, not subject to re-debate:

- **Cool blue is the dominant action color.** Royal blue identity, soft blue atmosphere, navy depth, gray-blue subdued.
- **Gold is atmosphere only.** Glow, rim trim, halo, warm light wash. **Never primary button infill.** Alpha range 0.10–0.25.
- **Glass surfaces communicate structure.** Use `bd-glass-panel` / `bd-glass-card` / `bd-glass-card--landing` / `bd-glass-card--landing-warm` / `bd-glass-control`. Never hand-roll inline `backdrop-blur`.
- **Warm/cool register rhythm is locked** — Hero (cool) → HowItWorks (cool) → Benefits (warm) → WhoWeServe (cool) → AboutOpportunity (cool) → TrustStats (warm) → Coverage (cool) → BusinessInquiry (cool) → CTA (warm). Bloom-bridges (Pass 10) sit at every register transition. Don't reshuffle.
- **Auth / Storage / Backend invariants** — this is a pure visual+motion pass. Touches zero load-bearing facts in [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md). No edge function changes. No DB changes. No new persisted media columns.

---

## Anti-goals (binding every pass)

1. **No copy changes without explicit owner approval.** ChatGPT's brief proposes a hero subline rewrite ("Submit your damage report once. Nearby shops can review it…"). That violates the prior redesign's Anti-Goal #2. **Treat copy as a Decision Point — Decision #3 below — not a default.**
2. **No new sections.** Work within existing 10.
3. **No structural component refactors.** Same JSX skeletons; visual + atmospheric layer additions only.
4. **No big-bang refactor.** One pass at a time, owner-reviewed.
5. **No animation library.** Framer Motion / Lottie / GSAP are off-limits for this pass — bundle weight + perf cost don't justify the lift. CSS transforms, opacity, `background-position`, `clip-path`, `mask-image`, and pseudo-elements only.
6. **No motion behind important text without sufficient blur/contrast guard.** Headline readability stays paramount.
7. **`prefers-reduced-motion: reduce` MUST disable every new motion layer.** Not soften — disable.
8. **No real-product mutation.** The hero "living scene" is a presentational mock — not a live mini-bidding session. Trying to feed it real shop data turns this into a feature.
9. **No fake stats / fake partner counts / fake bidder activity.** Any text inside the floating bid cards must be obviously sample/illustrative or use generic labels ("Estimate", "Quote", "ETA").
10. **No degradation of existing identity.** The 16 prior passes' work — bd-glass migration, register rhythm, bloom bridges, automotive accents — stays intact. New layers sit on top, never replace.
11. **No gold decoration.** Add living marketplace energy. (Owner's framing — keep it as the filter for every new visual choice.)

---

## Decisions LOCKED — 2026-05-03 (autopilot max)

Owner directive: "go fully auto on max." Recommended set adopted verbatim.

| # | Decision | Locked answer |
|---|---|---|
| 1 | Hero right-side approach | **Mock** — layered HTML/CSS/SVG over a stylized map pattern. No 2nd MapLibre instance. |
| 2 | Hero scene content | **Map + report pin + 2 bid cards.** Photo demoted/removed from hero right side. |
| 3 | Hero subline copy | **No copy change.** Voice is owner-owned. |
| 4 | Mobile motion budget | **Reduced on mobile.** Gold drift only. No bid-card float, no route shimmer, no pulse. |
| 5 | Dark mode landing parity | **Plan only this round.** Pass G stays a doc deliverable. |
| 6 | Coverage section motion | **Subtle pulse on existing pins only.** No new route rings, no service-radius halo. |
| 7 | Hero data source | **Fully presentational.** Static labels. Coverage section keeps real seeded data. |

Subsequent passes treat these as binding. Don't relitigate without explicit owner override.

---

## Decision points (resolved — see locked table above)

The brief moves fast through several decisions that materially change scope. Lock these before the new chat begins implementation, otherwise it will drift.

| # | Decision | Default if owner doesn't decide | Why it matters |
|---|---|---|---|
| 1 | **Hero right-side approach: layered presentational mock, OR a real mini-MapLibre scene with seeded pins?** | Presentational mock (HTML/CSS/SVG layered cards over a static map image). | Real MapLibre = 2nd map instance on the page (Coverage already has one), GPU + memory cost, mobile risk. Mock = predictable perf, fewer moving parts, no race with Coverage map's WebGL context. |
| 2 | **Hero scene content: damage-report photo + bid cards, OR map + report pin + bid cards (no photo)?** | Map + report pin + 2 bid cards (matches "Liquid Map Intelligence" most directly). | Photo path keeps the existing hero asset relevant. Map path is more on-message but means the hero photo gets demoted or removed. |
| 3 | **Copy change in hero subline?** Brief proposes: *"Submit your damage report once. Nearby shops can review it, send bids, and help you compare price, timing, and repair fit before you choose."* | **No copy changes.** Voice is owner-owned per prior anti-goal. | Affects whether Pass C touches any text content or only visual layers. |
| 4 | **Mobile motion budget.** Full motion / reduced motion / disabled? | Reduced motion on mobile (gold drift only, no bid-card float, no route shimmer). | Mobile GPU + battery + thermals. Hero is the first paint — jank here costs more than anywhere else on the site. |
| 5 | **Dark mode landing parity scope: plan only, or implement?** | **Plan only in this round (Pass G as design doc).** | Dark mode landing was last touched in Passes 9–11. Doing motion + dark parity in the same round risks regressions on both. |
| 6 | **Coverage section motion ambition: subtle pulse on existing pins, OR add new "service-radius halo" + animated route rings?** | Subtle pulse on existing pins only. | Coverage map is already a live MapLibre instance. Heavy overlay motion stacks on existing GPU cost. Owner can upgrade later if subtle version reads "underdone." |
| 7 | **Reuse seeded shop data, or fully presentational?** | Fully presentational static labels in the hero scene. Coverage section keeps real seeded data. | Reusing real data leaks the "is this real coverage?" question into hero — the Pass 11 empty-state copy ("Coverage is expanding") was carefully tuned to handle that elsewhere. Hero shouldn't reopen it. |

**Recommended owner answers (my read of the brief, easy to override):** 1 = Mock, 2 = Map+pin+bids (no photo), 3 = No copy change, 4 = Reduced on mobile, 5 = Plan only, 6 = Subtle pulse only, 7 = Presentational.

If the recommended set is taken, this becomes a 1–2 week pass instead of 4–6 weeks. The bigger answers (real mini-map, copy rewrite, full dark parity) are all defensible, but they are separate scope decisions that should be taken with eyes open.

---

## Engineering constraints (binding)

These are the guardrails that any new motion / layer must respect. They exist because the landing page's first paint and Lighthouse score directly affect conversion.

### Performance budgets

- **No new layout / paint thrash.** Animate `transform` and `opacity` only. Forbidden: animating `width`, `height`, `top`, `left`, `background-color`, `box-shadow` size, `filter` blur radius. (`filter: blur` is OK as a static property on a layer that doesn't itself animate.)
- **`will-change` discipline.** Apply `will-change: transform` only on layers that are *currently* animating. Do not blanket-apply across the page — it forces extra GPU layers and tanks low-end devices.
- **GPU layer count.** Hero scene composite: aim for ≤6 promoted layers (1 background, 1 gold drift, 1 map base, 1 pin pulse, 2 bid cards). More than 8 starts to degrade scroll on mid-tier Android.
- **Bundle delta.** Net JS added by this pass: < 8 KB gzipped. CSS delta: < 12 KB. If a pass exceeds either, stop and re-scope.
- **No additional fonts.** Existing font stack stays.
- **No additional MapLibre instances** unless Decision #1 explicitly authorizes one.

### Motion safety

- **`prefers-reduced-motion: reduce` disables every new animation.** Not "slows" — `animation: none` and `transition: none` on every new keyframe, with all visual state pinned to a sensible static frame.
- **No flashing.** Nothing crosses 3 transitions per second (WCAG 2.3.1).
- **No motion under headline text** unless that motion layer has `filter: blur(20px)` or sits behind a glass card with `backdrop-filter: blur` ≥ 8px.
- **Hover motion only on `(hover: hover)` devices.** Touch devices skip hover transitions entirely (no fake-tap states).
- **Loop-cycle drift on background motion: ≥ 18 seconds.** Faster loops read as nervous. Gold sheen, route shimmer, pin pulse should each be slow and breathable.

### Accessibility

- **Contrast unchanged or improved.** Headline, CTA, body text contrast ratios stay ≥ existing baselines. Verify with axe in Pass H.
- **Focus visibility.** New atmospheric layers must not steal visual weight from focus rings on the CTAs.
- **Pause control if motion exceeds 5 seconds.** Per WCAG 2.2.2. The proposed gold drift + route shimmer are both indefinite; they MUST be disabled by `prefers-reduced-motion`. If owner pushes for a visible Pause control in the UI, that's a separate scope item.
- **Screen reader noise.** All new visual layers are `aria-hidden="true"` and `pointer-events: none`. Floating bid cards are presentational only — no real labels for assistive tech.

### Mobile

- **Hero living scene collapses gracefully on `< 768px`.** Either hide the right-side scene entirely (default), or render a static, single-card version (no float, no shimmer, no pulse).
- **No background animation on mobile by default.** Per Decision #4.
- **No `backdrop-filter: blur` on layers that are themselves animating** — Safari iOS regresses.

---

## The Passes

Order is intentional. **Don't run Pass C before Pass B is in place** — building the hero scene without the token system means hard-coding values that will be re-touched. Same for Pass D.

### Pass A — Audit + visual map (no code changes)

**Goal:** Build a current-state inventory before adding new layers. Produces a short audit doc, not commits.

**Inspect:**

- All landing components in [`src/app/components/landing/`](../src/app/components/landing/).
- Theme tokens in [`src/styles/theme.css`](../src/styles/theme.css) — specifically the warm/cool variable sets at lines ~849–870, the `bd-glass-*` system at lines ~870–933, existing `@keyframes` at lines ~603–650 + ~713.
- Animation utilities: [`src/app/hooks/useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts), [`src/app/hooks/useMediaQuery.ts`](../src/app/hooks/useMediaQuery.ts), `useScrollAnimation` (find with grep).
- The Coverage section's MapLibre instance: [`OperatingRegionsSection.tsx`](../src/app/components/landing/OperatingRegionsSection.tsx) — note GPU/init cost so Pass D can reason about overlay budget.
- Light/dark mode appearance handling: [`renderLandingPage.tsx`](../src/app/utils/renderLandingPage.tsx), `LandingPageHeader.tsx`, the `isLightAppearance` prop drilling pattern.

**Deliverable:** Short audit (≤ 200 lines) committed as `docs/landing_signature_audit_2026-05-XX.md` listing:
- Where each new motion type can safely live.
- Which existing layers conflict with proposed additions (so we extend, not duplicate).
- One-line risk note per landing section.
- Confirmation of which decisions from the table above remain unresolved.

**Don't do in Pass A:** Any code changes. Any new tokens. Any motion experiments.

---

### Pass B — Tokenized motion + gold-flow system (CSS only)

**Goal:** Introduce reusable, reduced-motion-safe primitives that all subsequent passes consume. Lives in [`src/styles/theme.css`](../src/styles/theme.css), un-layered (per the cascade-precedence note at theme.css line 1547) so Tailwind utilities can still override at the class level.

**New tokens (CSS custom properties):**

```css
:root {
  /* Liquid gold — light mode marketplace energy */
  --bd-liquid-gold-light:        rgba(220, 165, 90, 0.16);
  --bd-liquid-gold-light-soft:   rgba(220, 165, 90, 0.08);
  --bd-liquid-gold-light-edge:   rgba(220, 165, 90, 0.04);

  /* Liquid gold — dark mode marketplace energy (warmer + slightly more saturated for navy backdrop) */
  --bd-liquid-gold-dark:         rgba(200, 140, 50, 0.22);
  --bd-liquid-gold-dark-soft:    rgba(200, 140, 50, 0.12);
  --bd-liquid-gold-dark-edge:    rgba(200, 140, 50, 0.06);

  /* Blue route energy */
  --bd-route-blue:               rgba(96, 165, 250, 0.55);
  --bd-route-blue-soft:          rgba(96, 165, 250, 0.20);
  --bd-route-blue-glow:          rgba(59, 130, 246, 0.35);

  /* Map contour line */
  --bd-map-contour-light:        rgba(80, 120, 180, 0.10);
  --bd-map-contour-dark:         rgba(150, 180, 220, 0.10);

  /* Motion timing */
  --bd-flow-loop-slow:           28s;   /* gold drift, sheen */
  --bd-flow-loop-med:            18s;   /* contour drift */
  --bd-flow-loop-fast:           4.2s;  /* pin pulse */
  --bd-flow-ease:                cubic-bezier(0.4, 0, 0.2, 1);
}
```

**New classes (proposed names — finalize in Pass A audit):**

| Class | Purpose | Where used |
|---|---|---|
| `bd-liquid-gold-flow` | Slow-drifting radial gold gradient using `background-position` animation. Light/dark aware via tokens. | Hero background, optional Benefits/TrustStats backdrop |
| `bd-liquid-gold-sheen` | Diagonal sheen sweep across a glass surface (similar to `mapLiquidSheenDrift` at theme.css line 603 — **reuse existing keyframe if compatible**, don't duplicate). | Hero scene glass card, CTA card |
| `bd-route-line` | SVG-friendly stroke utility with `stroke-dasharray` + animated `stroke-dashoffset` for "draw-on" effect. | Hero scene route between pin and bid card; HowItWorks step connector (optional, Pass E) |
| `bd-pin-pulse` | Concentric ring pulse around a fixed point. Pure CSS (transform: scale + opacity fade). | Hero scene report pin; Coverage map pins (Pass D, optional per Decision #6) |
| `bd-bid-card-float` | Subtle Y-axis drift (±4px) + opacity 0.92 ↔ 1.0 over 6s loop. **Pinned to hero scene context only**, not exposed as a global utility. | Hero scene bid cards |
| `bd-section-glow-divider` | Already exists as bloom-bridges from Pass 10 — extend only if needed. | (no new use unless audit identifies a gap) |
| `bd-map-contour` | Faint repeating-linear-gradient or SVG pattern for "topographic" feel. **Reuse Pass 6's Coverage topographic rings pattern if shape-compatible.** | Hero scene background; HowItWorks subtle backdrop (optional) |

**Reduced-motion guard (mandatory at end of every keyframe block):**

```css
@media (prefers-reduced-motion: reduce) {
  .bd-liquid-gold-flow,
  .bd-liquid-gold-sheen,
  .bd-route-line,
  .bd-pin-pulse,
  .bd-bid-card-float {
    animation: none !important;
    transition: none !important;
  }
  /* Pin each layer to a sensible static frame */
  .bd-pin-pulse::before,
  .bd-pin-pulse::after { opacity: 0; }
  .bd-bid-card-float { transform: none; opacity: 1; }
}
```

**Deliverable:** Single commit, `theme.css` only, no component touches yet. Build verifies clean. Visual diff: zero (no class is consumed yet).

**Don't do in Pass B:** Apply the classes anywhere. Touch any component file. Add JS hooks.

---

### Pass C — Hero signature scene

**Goal:** Replace the current right-side hero (image + ImageWithFallback) with a layered "living marketplace" scene. **Presentational mock per Decision #1 default.**

**File:** [`src/app/components/landing/HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx).

**Structure (right side, desktop ≥ 768px):**

1. **Base layer:** Static map tile image (low-res, optimized PNG/WebP, ≤ 60 KB) OR an SVG stylized "map shapes" pattern. Decide in Pass A. Sits inside a `bd-glass-card--landing` rounded-2xl frame.
2. **Map contour overlay:** `bd-map-contour` SVG paths, opacity 0.10 / 0.14, behind pins.
3. **Liquid gold flow:** `bd-liquid-gold-flow` radial-gradient layer, behind everything inside the card. Picks up `--bd-liquid-gold-light/dark` based on `isLightAppearance`.
4. **Report pin:** Centered or off-center, blue product color. Has `bd-pin-pulse` rings — 2 concentric rings at 0.45/0.20 opacity, 4.2s cubic-bezier loop, scale 1 → 1.8 → fade.
5. **Route line:** SVG path from pin to first bid card. `bd-route-line` draws on over 1.8s on hero load, then idles. Subtle blue with soft glow.
6. **Floating bid cards (2):** Small `bd-glass-card--landing` chips, presentational labels ("Quote • $1,240", "ETA 4 days"). `bd-bid-card-float` drift. Stagger-delayed entrance (200ms / 600ms after hero load).
7. **Gold activity sweep:** `bd-liquid-gold-sheen` diagonal sweep crossing the glass card every 28s. Subtle — should read as "ambient" not "highlighted."

**Mobile (< 768px):** Hide the entire right-side scene OR render a single static glass chip with the report pin (no animation). Per Decision #4 default. Hero left side fills the column.

**Left side (text):** Untouched per Decision #3 default. If Decision #3 flips: update `VALUE_STATEMENTS` array at [HeroSection.tsx:8](../src/app/components/landing/HeroSection.tsx#L8) and the visible subline. **Do not touch the carousel rotation logic.**

**What this preserves:**
- Existing `useParallaxOffset` parallax on background pools.
- Existing atmospheric radiance ([HeroSection.tsx:79-119](../src/app/components/landing/HeroSection.tsx#L79-L119)).
- The `bd-bloom-atmosphere` entrance animation.
- All CTA hierarchy (primary blue glass-control, secondary calm).

**Risks:**
- The current hero already has 3 amber blur pools at deepened opacity (Pass 11). Adding `bd-liquid-gold-flow` on top could push warm dominance over the cool-action identity. **Mitigation:** consume the same gold tokens; don't stack new amber on existing amber.
- The right-side glass card with backdrop-blur will need careful positioning so the parallax pools behind it remain visible (otherwise the card just becomes a flat panel).

---

### Pass D — Map-first anchor section upgrade

**Goal:** Make [`OperatingRegionsSection.tsx`](../src/app/components/landing/OperatingRegionsSection.tsx) feel like a product proof moment, not a screenshot.

**Subtle additions (Decision #6 default):**

- Existing pins gain `bd-pin-pulse` (single ring, slower 6s loop, lower opacity than hero version).
- Service-radius halo: a single faint expanding circle around the user-location point (if present), 12s loop, opacity 0.08 → 0.
- Caption microcopy strengthening: review current label/caption; add a one-line "why map-first matters" line **only if owner approves a copy change** (Decision #3-adjacent).

**Aggressive additions (Decision #6 upgrade — defer unless owner explicitly opts in):**

- Animated route rings between pin and viewport edge (radar sweep).
- Dynamic blue route lines drawn between the user-location pin and 2–3 nearest shop pins.
- These are GPU-expensive on top of an active MapLibre canvas; defer to a separate post-launch pass.

**Don't:**
- Add new MapLibre layers/sources without verifying memory + paint cost.
- Touch the WebGL fallback `backgroundColor` — that was Pass 7's fix.
- Redesign the section structure.

---

### Pass E — Section continuity polish

**Goal:** Tie HowItWorks / WhoWeServe / Benefits / AboutOpportunity to the marketplace-loop story without redesigning them.

**Per section:**

- **HowItWorks:** Optional thin animated connector line between the 3 step cards — `bd-route-line` style, draws on once when section enters viewport, then static. **Skip if it reads decorative.** Cards themselves stay calm.
- **WhoWeServe:** Lean into the role-color hint: Customer card subtle blue inner-glow accent, Shops subtle teal accent, Insurer subtle gold accent (rim only, alpha ≤ 0.15). No new content.
- **Benefits:** Hover state on photo cards — subtle gold sheen sweep using `bd-liquid-gold-sheen`. Single sweep per hover, then static. Reduced-motion: skip.
- **AboutOpportunity:** No motion. Glass + spacing already correct from Pass 9.

**Don't:**
- Rebuild any card.
- Add motion to text-heavy areas without contrast guard.
- Touch the bloom-bridges between sections (Pass 10 work).

---

### Pass F — Light-mode depth correction

**Goal:** Push light mode from "polished" to "premium" without making it beige or yellow.

**Targeted lifts:**

- **Card border definition:** Audit `bd-glass-card--landing` light-mode border — currently `rgba(191, 219, 254, 0.55)`. Test bumping to 0.65 OR adding a 1px inner highlight `rgba(255, 255, 255, 0.5)` for crisper definition without darker borders.
- **Section-edge separation:** Current bloom-bridges work in dark mode. Light mode versions audit for sufficient contrast — Pass 11 only deepened Hero + AboutOpportunity. WhoWeServe and Benefits light cards may still read flat.
- **Secondary text contrast:** Audit body copy in light mode against atmosphere layers. If any drops below 4.5:1 against the warm wash, lift the body color or dim the wash under text.
- **Champagne wash control:** Hero already has deepened amber (Pass 11). Don't add more there. Apply gentle champagne radial only to TrustStats (warm) and CTA (warm) light mode if the audit shows them flat.

**Don't:**
- Make light mode beige.
- Make all cards yellow / amber-tinted.
- Reduce blue contrast.
- Touch dark mode in this pass (Pass G).

---

### Pass G — Dark-mode landing parity (PLAN ONLY per Decision #5 default)

**Goal:** Document how dark-mode landing inherits the dashboard's premium identity. Implementation is a separate future pass.

**Doc deliverable:** A subsection in this plan (or a sibling doc if it grows) capturing:

- Which dashboard tokens / classes the landing dark mode should adopt (specifically the gold-lamp shell from D6–D8 and the rounded button system from D10).
- Which landing dark surfaces currently have parity gaps (likely: HowItWorks step cards, WhoWeServe role cards in dark — confirm in Pass A audit).
- Whether the hero's right-side scene needs a dedicated dark variant (probably yes — gold tokens already split light/dark).
- Risk: dark mode hasn't been heavily walked since Passes 8–11. Do a fresh dark walk before authorizing implementation.

**If owner flips Decision #5 to "implement":** Add as Pass G+ phases (G1 surfaces, G2 motion, G3 verification). Each owner-reviewed. Don't bundle.

---

### Pass H — Verification

**Goal:** Prove the work is shippable.

**Run:**

- `npx vite build` — clean.
- `npx tsc --noEmit` — clean (run if available; otherwise skip and rely on vite's build-time TS check).
- Lint if configured.
- Manual viewport walk: 375px / 768px / 1024px / 1440px / 2560px, light + dark.
- Reduced-motion walk: System Preferences → Accessibility → Reduce motion ON. Every new motion layer must be visually pinned to a sensible static frame, no movement anywhere.
- Lighthouse (mobile, throttled): Performance score should not drop > 3 points vs pre-Pass-A baseline. LCP must not regress > 200ms. CLS must remain 0.
- DevTools Performance panel: scroll the page top-to-bottom in dark mode. Frame rate should stay ≥ 50 fps on mid-tier hardware.
- axe accessibility scan: 0 new violations.
- Coverage section: confirm MapLibre still initializes cleanly with overlay additions; no new console warnings.
- Hover/focus walk on every CTA — premium press states from D10 still intact.

**Report format:** Single commit message + a brief in the plan's "Outcome notes" section (mirror the pattern from PLAN_LANDING_REDESIGN.md Pass 11 outcome notes).

---

## Risks (read before starting)

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Motion stacked on existing motion = jank.** Hero already has parallax pools, bloom-atmosphere entrance, value-statement carousel. Adding 5+ new motion layers compounds. | Pass A audits motion layer count before Pass C designs any addition. Hard cap: ≤ 8 simultaneous animated layers in viewport at any scroll position. |
| R2 | **Gold over-saturation.** Three amber pools (Pass 11) + new `bd-liquid-gold-flow` + `bd-liquid-gold-sheen` could push hero from "warm-lit" to "yellow." | Tokens centralize gold values. If hero reads too warm post-Pass C, dial token alpha down — don't add more layers. |
| R3 | **Mobile thermal / battery cost.** Persistent motion on a phone tab in background drains battery. | `prefers-reduced-motion` + viewport-pause hook (only animate when section is in viewport). Use `IntersectionObserver` to gate animation play state. |
| R4 | **Coverage section second-MapLibre temptation.** If Decision #1 flips to "real mini-map," we'll have two MapLibre instances on first paint. | Hard rule: if Decision #1 = real map, hero map must `lazy-init` after first interaction or after hero scrolls into viewport (not on page load). |
| R5 | **Cascade conflicts with prior un-layered overrides.** Theme.css has multiple un-layered sections (lines 1547+). New tokens at the bottom should not collide. | Add new tokens / classes as a clearly-marked block at the end of theme.css with a header comment. Don't insert mid-file. |
| R6 | **Copy change creep.** ChatGPT brief proposes hero subline rewrite. Once that's on the table, scope expands to other section copy. | Decision #3 must be answered explicitly. Default = no copy change. |
| R7 | **Dashboard / app-shell collateral damage.** New utility classes added to theme.css affect all consumers, not just landing. | Pass B classes use the `bd-liquid-*` and `bd-route-*` prefixes — no overlap with existing `bd-glass-*` / `bd-dashboard-*`. Verify no name collision before commit. |
| R8 | **"Living marketplace" reads as "fake activity" / dishonest.** Floating bid cards with prices could read as misrepresenting actual marketplace state during soft launch. | Use clearly illustrative labels ("Sample quote", "Example ETA") OR icon-only cards with no numbers. Owner sign-off on copy required. |
| R9 | **Over-promising on map-first identity.** Coverage section is a real map but limited to seeded NY data. Aggressive marketing language risks the same "no shops within 20 miles" empty-state issue Pass 11 fixed. | Don't add new copy that implies broader real coverage. Keep Pass 11's "expanding network" framing. |

---

## What this plan deliberately does NOT do

- Does NOT propose Framer Motion / Lottie / GSAP. Pure CSS + tiny SVG only.
- Does NOT propose a full hero replacement — the existing hero (image, headline, value statements, CTAs, parallax atmosphere) stays. The right side gains a scene; the left side stays the same.
- Does NOT propose dark-mode implementation in this round (per Decision #5 default).
- Does NOT touch dashboard, auth, storage, edge functions, or any backend.
- Does NOT add real-time data, WebSocket connections, or any server-driven motion.
- Does NOT add new sections, change navigation, or restructure routing.
- Does NOT add a sticky mobile CTA (deferred per prior plan Decision #5).

---

## Kickoff prompt for the new chat

When starting fresh, paste this into the new conversation. It loads the new agent with everything they need without bloating their context with the full ChatGPT brief.

> I'm starting the Liquid Map Intelligence pass on the BidOnDent landing page. The plan is at [`docs/PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md`](docs/PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md). Read that, the LAW docs ([`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md), [`docs/LAW_HARDENING_PLAN.md`](docs/LAW_HARDENING_PLAN.md)), and the prior STATUS-COMPLETE redesign ([`docs/PLAN_LANDING_REDESIGN.md`](docs/PLAN_LANDING_REDESIGN.md)) before proposing any code change. The 7 Decision Points at the top of the new plan need owner answers before Pass A starts — surface them to me first. Default recommendations are listed; ask me to confirm or override each one. Don't begin Pass A until decisions are locked.

---

## Outcome notes

(Empty — populated as each pass completes.)

### Pass A outcome notes

_Pending._

### Pass B outcome notes

_Pending._

### Pass C outcome notes

_Pending._

### Pass D outcome notes

_Pending._

### Pass E outcome notes

_Pending._

### Pass F outcome notes

_Pending._

### Pass G outcome notes (plan only)

_Pending._

### Pass H outcome notes

_Pending._
