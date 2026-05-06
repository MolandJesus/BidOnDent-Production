# Atmosphere Coherence Audit — Pass 18

**Date:** 2026-05-06
**Author:** Claude Opus 4.7 (1M context)
**Scope:** Read-only sweep of all atmosphere/glow/flow surfaces in [src/styles/theme.css](../../../src/styles/theme.css) to determine whether any additional surface should join the living-lava ledger established by Passes 15 + 16a + 16b + 17 + 17b.
**Authority:** Owner standing directive 2026-05-06 — "make gold lighting [...] act more like living premium gold liquid glass lava as you do visual work and audit work."
**Output:** No code changes. Branch-only doc commit. Each candidate requires explicit per-surface owner approval before any implementation pass.

---

## Living-lava ledger as of Pass 17b (main HEAD `2c6e7a75`)

| Surface                         | `::before` period | `::after` period | Phase offset | Pass                                |
| ------------------------------- | ----------------- | ---------------- | ------------ | ----------------------------------- |
| `bd-dashboard-atmosphere`       | 28s               | 36s reverse      | −9s          | 15                                  |
| `bd-landing-section-toplamp`    | 32s               | 44s reverse      | −11s         | 16a                                 |
| `bd-landing-section-bottomwash` | 24s               | 38s reverse      | −7s          | 16b                                 |
| `bd-bloom-atmosphere`           | n/a               | n/a              | n/a          | 17b — documented no-drift exception |

`orbDrift` declarations in `theme.css` total **6** — exactly two per ledger surface. No undocumented usage. Period-spread invariant holds.

---

## Candidate inventory

Every other surface in `theme.css` matching `atmosphere | lamp | wash | glow | halo | bloom | aura | sheen | flow | pulse` was inspected. Results below.

### 1. `.bd-landing-cta-glow::before` (theme.css:4480–4509)

- **Current state:** Static `radial-gradient` champagne aura behind landing-section CTA pills (`inset: -36px -56px`, blur 14px, alpha 0.16/0.06 light, 0.22/0.10 dark).
- **Existing motion:** None.
- **Geometric fit for `orbDrift`:** **Poor.** `orbDrift` translates ±10px and scales ±0.03 at full canvas. On a glow inset only −36×−56px, ±10px drift would push the aura visibly off-axis from the pill it's lighting. The viewer reads a moving aura behind a static button as broken alignment, not as living atmosphere.
- **Verdict: EXCEPTION (geometric mismatch).** Document as "purpose-built micro-aura — not part of the ambient-drift system." Recommend leaving static.

### 2. `.bd-glow` / `.bd-glow-strong` / `.bd-glow-pool` (theme.css:1999–2034+)

- **Current state:** `box-shadow` utilities (luminous halos for cards floating over map). Cool-blue family in dark mode, warm gold variants in light.
- **Existing motion:** None.
- **Geometric fit for `orbDrift`:** **Structurally impossible.** `orbDrift` keyframes animate `transform: translate + scale`. `box-shadow` is not transformable — only the element it's applied to would move, dragging the host card with the shadow. That would be motion on the _host_, not the atmosphere.
- **Verdict: EXCEPTION (structurally unsuitable — utility, not pseudo-layer).** Cannot join the ledger without a complete refactor into pseudo-element gradients, which would change every consumer of the utility. Owner taste call required for that scope of change; not recommended as it would lose the box-shadow's premium "thrown light" feel.

### 3. `.bd-liquid-gold-flow` (theme.css:~3995–4030)

- **Current state:** Two stacked radial gradients drifting in opposite directions via `bdLiquidGoldFlow` keyframe (var-driven `--bd-flow-loop-slow`).
- **Existing motion:** **Yes — already animates** on its own canonical loop.
- **Geometric fit for `orbDrift`:** Would double-stack with `bdLiquidGoldFlow`.
- **Verdict: EXCEPTION (already in canonical motion).** This is the Liquid Map Intelligence layer's purpose-built ambient flow; it pre-dates the living-lava system. Bringing it into the period-spread ledger means swapping its keyframe — that's a hero-scene visual decision, owner taste call. Recommend documenting alongside `.bd-bloom-atmosphere` as a "uses its own canonical keyframe — period-spread rule applies via `bdLiquidGoldFlow` loop length, not `orbDrift`."

### 4. `.bd-liquid-gold-sheen` (theme.css:~4035–4050)

- **Current state:** Diagonal gradient sweep via `mapLiquidSheenDrift` keyframe.
- **Existing motion:** Yes.
- **Verdict: EXCEPTION (already animating, purpose-built sheen).** Same rationale as #3.

### 5. `.bd-route-line` (theme.css:~4054–4070)

- **Current state:** SVG stroke-dashoffset shimmer via `bdRouteShimmer` (6s linear infinite).
- **Existing motion:** Yes.
- **Geometric fit:** SVG `stroke-dashoffset` — `orbDrift` is a transform animation. Not applicable.
- **Verdict: EXCEPTION (different motion category — stroke shimmer, not transform drift).**

### 6. `.bd-pin-pulse` (theme.css:~4080–4115)

- **Current state:** Concentric ring expansion via `bdPinPulse` (var-driven fast loop).
- **Existing motion:** Yes.
- **Verdict: EXCEPTION (interaction landmark — pulses indicate pin liveness; not ambient atmosphere).**

### 7. `.bd-gold-sheen-hover` (theme.css:~4115–4135)

- **Current state:** One-shot diagonal sweep on `:hover` via `bdGoldSheenOneShot`.
- **Existing motion:** Hover-driven only.
- **Verdict: EXCEPTION (interaction-driven, not ambient).**

### 8. `.bd-map-canvas-sheen` (theme.css:~4045+)

- **Current state:** 1px cream + bronze edge catchlights on map canvas wrappers. Static.
- **Existing motion:** None.
- **Geometric fit:** Atomic 1px lines around a rounded canvas. `orbDrift` scale ±0.03 would visibly push the catchlight off the bezel edge — the eye reads a moving rim as a misaligned bezel.
- **Verdict: EXCEPTION (structural edge highlight, not atmospheric mass).**

### 9. `.bd-bloom-atmosphere`

- Already documented as EXCEPTION in Pass 17b. No change.

---

## Conclusion

**The living-lava ledger is COMPLETE for the dashboard + landing atmosphere system.** Every other atmosphere-adjacent surface in `theme.css` falls into one of four EXCEPTION categories:

1. **Already animates with its own canonical keyframe** (`.bd-liquid-gold-flow`, `.bd-liquid-gold-sheen`, `.bd-route-line`, `.bd-pin-pulse`)
2. **Interaction-driven, not ambient** (`.bd-gold-sheen-hover`, `.bd-pin-pulse`)
3. **Geometrically unsuitable** (`.bd-landing-cta-glow`, `.bd-map-canvas-sheen`) — drift would visibly misalign with the host element
4. **Structurally unsuitable** (`.bd-glow*` box-shadow utilities) — `orbDrift` only animates `transform`

**Zero new surfaces recommended for living-lava ledger inclusion.**

The system has reached its natural ceiling at three ambient-drift surfaces (dashboard + landing top + landing bottom). Further atmosphere coherence work should focus on:

- (a) Owner taste call on Pass 16c (`.bd-bloom-atmosphere` double-stack) — held back by Pass 17b decision, available if owner overrides.
- (b) Owner taste call on bringing the Liquid Map Intelligence layer (`.bd-liquid-gold-flow` + `.bd-liquid-gold-sheen`) into the period-spread ledger by swapping their keyframes for `orbDrift`. Risk: changes the hero scene's signature flow; not recommended without owner direction.
- (c) Post-launch: when new atmosphere surfaces are added (e.g., account workspace, insurer dashboard), apply the established recipe with new period pairs per the rule in [docs/REF_VISUAL_SYSTEM.md](../../REF_VISUAL_SYSTEM.md) "Living-lava period-spread rule".

---

## Hard-stop flags surfaced during audit

None. No LAW slips, no forbidden palette values, no missing `prefers-reduced-motion` blocks on the surfaces audited.

---

## Recommended next move

**No automatic next pass.** The audit's finding is "stop — system is complete." Standing by for owner direction on (a), (b), or pivot to a different work area.
