# Design Polish — Landing Surface (2026-05-05)

> Operating manual: [`OPS_BUILDER_VISUAL_AUDIT_PROMPT.md`](OPS_BUILDER_VISUAL_AUDIT_PROMPT.md). Brief: owner directive 2026-05-05 (Pass 9, full-auto site-wide).
> Apex canon: [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — structural lock honored.
> Palette: [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) § Premium Gold Palette — locked.
> Motion: [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — `prefers-reduced-motion` contract honored.

---

## Pass 9 Polish #1 — Hero trust pills demoted to footnote tier (2026-05-05)

**HEAD at start:** `77ce5be6`

**Polish target (one sentence):** The three trust pills under the primary CTA pair ("Now available in NY" / "Transparent bids" / "Free for customers") read at the same visual weight as the "Start New Report" CTA itself, so the eye that should land on the action stalls on supporting evidence treated as a peer.

**Baseline screenshot:** captured in chat session pre-edit (full hero with peer-weight pills).

**Change applied:** [`src/app/components/landing/HeroSection.tsx:559-573`](../src/app/components/landing/HeroSection.tsx)

| Property         | Before                                                                                                            | After                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Pill `min-h`     | `min-h-[40px]` (decorative, not interactive)                                                                      | removed (not a button — span only)                                                                |
| Pill text        | `text-xs` mobile / `sm:text-sm` desktop                                                                           | `text-[11px]` both breakpoints                                                                    |
| Pill padding     | `px-3 py-1.5 sm:px-2.5 sm:py-1`                                                                                   | `px-2.5 py-1` uniform                                                                             |
| Pill gap         | `gap-1.5`                                                                                                         | `gap-1`                                                                                           |
| Light bg         | `linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.74))` (warm cream-gold gradient elevated glass) | `rgba(232,238,248,0.55)` (flat cool-blue tint)                                                    |
| Light border     | `rgba(140,82,22,0.28)` (bronze, prominent)                                                                        | `rgba(140,82,22,0.16)` (bronze, softer)                                                           |
| Light shadow     | `inset 0 1px 0 rgba(252,240,208,0.85)` (cream-gold inset highlight)                                               | removed (de-elevated)                                                                             |
| Light text       | `text-slate-700`                                                                                                  | `text-slate-600`                                                                                  |
| Dark bg          | `bg-blue-500/10`                                                                                                  | `bg-blue-500/[0.06]`                                                                              |
| Dark border      | `border-blue-400/20`                                                                                              | `border-blue-400/12`                                                                              |
| Dark text        | `text-blue-100/80`                                                                                                | `text-blue-100/65`                                                                                |
| Check icon size  | `w-3.5 h-3.5`                                                                                                     | `h-3 w-3`                                                                                         |
| Check icon color | `text-emerald-400` (saturated bright green — competing with CTA)                                                  | light: `text-slate-500/60`, dark: `text-blue-200/50` (muted, semiotic preserved per owner nuance) |

**Owner-mandated nuance:** Check icons MUTED, not removed. Stripping icons would change meaning (verified-trust signal lost), not just weight. Muted blue-gray preserves the "verified" semiotic without competing with the primary CTA.

**Post-change screenshots:**

- Light: `docs/audit-assets/design-polish-2026-05-05/polish1-hero-light-after.png`
- Dark: `docs/audit-assets/design-polish-2026-05-05/polish1-hero-dark-after.png`

**Subjective assessment (one sentence):** **KEPT.** Eye flow now resolves correctly: hero copy → "Get Started" CTA pair → trust pills as supporting context immediately below. Pills no longer compete; they substantiate.

**Validation:**

- Build: ✓ 3.77s clean.
- Diagnostics on `HeroSection.tsx`: 0.
- §9.1 forbidden-color sweep on hero region (162 elements scanned, viewport top 1200px): **0 white panels, 0 forbidden-gold hits.**
- §9.3 reduced-motion: no motion added or changed (existing `transition-all duration-700` retained as-is). No regression possible.
- Touch-target regression: pills are `<span>`, not interactive — no §9.2 concern.
- Apex canon (`MOLANDJESUS_DESIGN_DECISIONS.md`): unmodified.

**Files touched:** 1 (`HeroSection.tsx` — edit-in-place, no line-count growth; `wc -l` before vs after to be reflected in commit body).

**Out-of-scope items observed but deferred:**

- Carousel sub-headline above CTAs ("Choose the solution that works best for you") rotates through 3 messages — currently large body-text weight; could potentially be lighter to make CTAs land harder. **Deferred to Polish #2.**
- Hero map preview card weight balance vs left column copy — feels visually balanced but could be tested with a slight scale-down.
- Hero → How-It-Works section seam (visible band of color shift around y≈900px in light mode).
- "Now serving New York · Free for customers" pill at top of hero — slightly redundant with bottom trust pills. Possible consolidation candidate but copy-touch risk; surface to owner before acting.
