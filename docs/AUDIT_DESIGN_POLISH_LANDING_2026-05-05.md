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

---

## Pass 9 Polish #2 — Hero map "Double-tap for full map" badge: dark text into locked palette range (2026-05-05)

**HEAD at start:** `e6fbe25e`

**Polish target (one sentence):** The "DOUBLE-TAP FOR FULL MAP" hint pill at the top-right of the hero's map preview rendered its dark-mode label as `rgb(253, 230, 192)` (`#fde6c0`) — outside the locked Premium Gold cream-inset range (`rgba(252, 238–240, 204–208)`) on both green and blue channels — a quiet palette drift that needs to come back into family without changing the badge's role.

**Discovery:** Runtime DOM inspection of all elements containing "DOUBLE-TAP" found the actual hint pill (uppercase, top-3 right-3) using `color: rgb(253, 230, 192)`. Source grep (`fde6c0`) located a single hit at [`HeroSection.tsx:1018`](../src/app/components/landing/HeroSection.tsx). No other instances of `#fde6c0` anywhere in `src/`.

**Change applied:** [`src/app/components/landing/HeroSection.tsx:1018`](../src/app/components/landing/HeroSection.tsx)

| Property                | Before                | After                                                          |
| ----------------------- | --------------------- | -------------------------------------------------------------- |
| Dark-mode text color    | `#fde6c0` (253,230,192) — outside locked range | `#fcefd0` (252,239,208) — inside locked `252,238–240,204–208`  |

Light-mode text (`#7c4a16`), backgrounds, border, and inset/halo shadow stack: unchanged. Border was already `rgba(196,144,65,0.36)` (locked top/corner-lamp value). Inset/outer shadows were already in-family (`rgba(196, 144, 65, 0.22)` / `rgba(140, 82, 22, 0.22)` / `rgba(196, 130, 45, 0.12)`).

**Validation:**

- Build: ✓ 3.66s clean.
- Diagnostics on `HeroSection.tsx`: 0.
- Runtime re-check post-edit: badge color now `rgb(252, 239, 208)` ✓ in-range.
- Cross-file sweep for `fde6c0`: 0 remaining hits.
- §9.3 reduced-motion: no motion changed.
- Apex canon: unmodified.

**Files touched:** 1 (`HeroSection.tsx` — single-character-class swap, no line-count change).

**Out-of-scope items observed but deferred:**

- Same badge's light-mode text color `#7c4a16` (124,74,22) is darker than locked bronze-trim baseline `rgba(140, 82, 22)`. Locked palette doesn't define a "text-on-cream" tier; this is plausibly intentional for AA contrast. **Not regressed in this polish.** If a "text-on-cream" tier gets added to the locked palette, revisit then.

---

## Pass 9 Polish #3 — Site-wide dark-mode liquid gold lift on base `.bd-glass-card` (2026-05-05)

**HEAD at start:** `2bd8e2e9`

**Polish target (one sentence):** The base `.dark .bd-glass-card` (catch-all variant used by 56 instances across 46 files — `WhoWeServe` audience cards, dashboard utility panels, role-promo cards, etc.) had ZERO gold trim — pure cool-blue rim + faint blue glow only — making it read as flat and disconnected from the gold-lit landing/dashboard headline-tier cards. Owner directive 2026-05-05: "more colors and gold in dark mode... metallic gold for trims and liquid gold glass cards everywhere."

**Change applied:** [`src/styles/theme.css:1769-1814`](../src/styles/theme.css)

| Property | Before | After |
| --- | --- | --- |
| `border-color` | `rgba(96, 165, 250, 0.20)` (cool blue only) | `rgba(196, 144, 65, 0.32)` (locked top-lamp gold) |
| Background gradient | `rgba(30,58,138,0.22) → rgba(12,25,41,0.68)` | `rgba(30,58,138,0.26) → rgba(12,25,41,0.74)` (slight depth bump, cool-blue body preserved per landing identity rule) |
| Top inset highlight | `rgba(147, 197, 253, 0.09)` (sky-blue, faint) | `rgba(252, 240, 208, 0.22)` (locked cream-gold lamp) |
| Bottom inset rim | `rgba(59, 130, 246, 0.04)` (cool blue, faint) | `rgba(140, 82, 22, 0.28)` (locked bronze trim) |
| Gold ring | none | `0 0 0 1px rgba(196, 144, 65, 0.20)` (locked top-lamp) |
| Cool ring | `0 0 1px rgba(96, 165, 250, 0.25)` | `0 0 0 1px rgba(96, 165, 250, 0.18)` (preserved at lower alpha) |
| Cool glow | `0 0 20px rgba(37, 99, 235, 0.05)` | `0 0 28px rgba(37, 99, 235, 0.10)` |
| Gold halo (outer) | none | `0 0 44px rgba(196, 130, 45, 0.22)` (locked deeper outer halo at single-layer cap) |
| Top-cast lamp | none | `0 -28px 80px -16px rgba(196, 144, 65, 0.14)` (mirrors landing/dashboard "lamp from above" grammar) |
| Side cream catchlights | none | `inset 1px 0 0 rgba(252,240,208,0.10)` + `inset -1px 0 0 rgba(252,240,208,0.06)` (mirrors `--landing` depth-bar criterion 7 — cards now in same metallic-glass family) |
| Drop shadow depth | `0 10px 24px rgba(2,6,23,0.28)` | `0 18px 40px rgba(2,6,23,0.48)` + `0 6px 14px rgba(2,6,23,0.26)` (cards now sit ON the page, not flat against it) |

**New `.dark .bd-glass-card:hover` rule added:** previously absent. Hover deepens the lamp, brightens cream rim, expands gold halo to `0 0 56px rgba(196,130,45,0.32)`. No transform added (no motion regression — reduced-motion contract honored automatically since shadow-only changes are not motion).

**Files touched:** 1 (`src/styles/theme.css` — single block replacement + new hover block).

**Surface area:** 46 files × 56 base-card instances now read as gold-lit liquid glass in dark mode without any component changes. Light mode unaffected (untouched). `--landing`, `--landing-warm`, `--dashboard`, `--floating` variants unchanged (already gold-rich).

**Validation:**

- Build: ✓ clean.
- Diagnostics on `theme.css`: 0.
- Runtime computed-style re-check on landing base card: `border: rgba(196, 144, 65, 0.32)` ✓ + full new shadow stack present ✓.
- §9.1 forbidden-color sweep: 0 hits — every value used is from the LOCKED Premium Gold Palette baseline (196,144,65 / 196,130,45 / 140,82,22 / 252,240,208) or pre-existing cool-blue values held at lower alpha.
- §9.3 reduced-motion: no transform/animation added — hover changes shadow only. Existing `.bd-glass-card:hover` reduced-motion contract block unchanged and still applies.
- Apex canon (`MOLANDJESUS_DESIGN_DECISIONS.md`): unmodified.
- Light mode: untouched (selectors are `.dark` / `[data-theme="dark"]` scoped).

**Risk:** Low. Locked palette only. Cool-blue body identity preserved (landing rule). Halo intensities at or below the established `--landing` precedent. Single CSS file.

