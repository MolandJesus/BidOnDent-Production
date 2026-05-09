# Pass 190 §6 follow-up — `map-ui-enter` reduce-motion guard verification

**Pass:** 200 (Mola's Coder, 2026-05-09)
**Source:** [`KI_163_NAV_CONTROL_INVENTORY.md`](KI_163_NAV_CONTROL_INVENTORY.md) §6.

---

## Question raised in Pass 190 §6

> "`NavigationActionRail` uses `map-ui-enter` for entrance animation but does **not** add the `motion-reduce:animate-none` paired class. Per `LAW_ANIMATION_AND_ATMOSPHERE.md` every entrance animation requires the reduced-motion guard. This is either:
> - (a) `map-ui-enter` already bakes the reduce-guard into its keyframe definition (CSS-first lock), making the explicit class redundant — verify by reading the keyframe definition in `src/styles/`; or
> - (b) a missed reduce-guard that should be added in a small follow-up sweep."

## Verification — option (a) confirmed

Read `src/styles/theme.css` lines 696-707:

```css
@media (prefers-reduced-motion: reduce) {
  .map-liquid-sheen,
  .map-nav-icon-ring-pulse,
  .map-glass-float,
  .map-ui-enter,
  .map-ui-enter-delay-1,
  .map-ui-enter-delay-2,
  .map-ui-enter-delay-3 {
    animation: none !important;
  }
}
```

The class set `map-ui-enter` (and its three delay variants) explicitly carries `animation: none !important` under `prefers-reduced-motion: reduce`. Per `LAW_ANIMATION_AND_ATMOSPHERE.md` "CSS-first lock" — the reduce-guard belongs at the keyframe-class definition, not at every consumer site. The Tailwind utility `motion-reduce:animate-none` is for one-off `animate-in fade-in` consumers that do not have a class-level lock.

`NavigationActionRail` consuming `map-ui-enter` without an additional `motion-reduce:animate-none` is therefore **correct**, not a missed guard. The same is true for every consumer of the `map-ui-enter` family.

## Action

- **No code change.** Option (a) is the design.
- **No new KI filed.** §6 was correctly flagged as "either (a) or (b)" pending verification; verification picks (a).
- **Note for future LAW_ANIMATION_AND_ATMOSPHERE audits:** the canonical map cross-fade family (`map-ui-enter`, `map-ui-enter-delay-*`) is reduce-guard self-contained at `src/styles/theme.css:696-707`. Consumers MUST NOT add `motion-reduce:animate-none` alongside these classes — it would be redundant and signal a phantom inconsistency to future auditors.

## Cross-references

- KI-163 (P2-DESIGN, OPEN) — unchanged. The §6 observation does NOT affect remediation scope; the rail's reduce-motion contract is intact.
- LAW_ANIMATION_AND_ATMOSPHERE.md "CSS-first lock" rule — this verification is an instance of the rule being correctly applied.
