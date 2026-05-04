# Cloud Master Autopilot Handoff — Design + Map Premium Pass

**Date**: 2026-05-03
**Author**: Planner AI (Copilot/Claude Opus 4.7) — composed from owner directives + multi-AI synthesis (Codex tightened prompt + planner extensions)
**Branch**: `BidOnDent-Horizon-Beta` (DO NOT merge to main)
**Audience**: Cloud (design execution AI), running unattended autopilot for hours
**Predecessor work**: 9 commits ed38beea→5adee9d6 — KI-066 / KI-068 / KI-069 RESOLVED, KI-067 partial

---

## How To Use This Doc

The block below the `─── BEGIN MASTER PROMPT ───` divider is the prompt body. Paste it into Cloud verbatim. Everything above the divider is operator briefing for the human handing off.

---

## Operator Briefing (do not paste to Cloud)

### What just shipped (so Cloud doesn't repeat it)

| Commit       | What                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ed38beea     | Dark depth bar baseline (KI-069)                                                                                                                     |
| (chain of 7) | Map dark depth, Coverage Command Center emphasis, mode badges spine, shop family (KI-068), popovers (KI-067 partial), code paths converted to tokens |
| 5adee9d6     | theme.css forbidden-register sweep (KI-066c) — CLAIMED 100%; AUDIT FOUND 4 MISSES                                                                    |

### What this prompt covers (Cloud's runway)

1. **Bucket 1.1** — Forbidden register final closure (HeroSection L593 + L984 + mapSurfaceTheme.ts comment + 4 NEW theme.css misses)
2. **Bucket 1.2** — SKIP (verified no-op below)
3. **Bucket 1.3** — Map widget inner-glass seam wrappers
4. **Bucket 6** — Gagged dashboard shadow fix (HomeScreen gap + token softening + asymmetric bronze halo bias)
5. **Bucket 7** — Atmospheric gold glow amplification (Dashboard + Landing)
6. **Bucket 2.1** — Hover/focus catchlight on interactives
7. **Bucket 2.3** — Edge catchlights theme.css
8. **Bucket 4** — Landing dark depth audit + light slight polish + CTA catchlight
9. **Bucket 5** — Functional polish (5.1–5.5) + Map premium redesign (5.6–5.9)
10. **Bucket 9** — Doc-only future nav + map functional buildout plan
11. **Final master-cook commit** — optional unified verification

### Hard structural facts Cloud needs

- `DashboardSidebar.tsx` does NOT exist. Real nav: `src/app/components/app/MobileBottomNav.tsx` + `src/app/components/app/DesktopNavTabs.tsx` (both already forbidden-clean).
- `DashboardAtmosphere.tsx` (130 lines) at `src/app/components/app/DashboardAtmosphere.tsx`. Mounted by `DashboardLayout.tsx:132`. Already has gold radials at L99–127 (D5/D6/D7 gutter + bottom washes, dark alpha 0.13–0.18). Bucket 7 = AMPLIFY existing layers, not rewrite structure.
- `LandingPageLayout.tsx` (155 lines) has a single dark radial at L68–70. NO gold layers. Bucket 7 must add a parallel gold lamp stack (mirror DashboardAtmosphere D5/D6/D7 pattern, slightly more restrained for landing).
- `MapSurfaceControls.tsx` exists at `src/app/components/maps/MapSurfaceControls.tsx` — Bucket 5.8 target.
- Map widgets verified: `CustomerMapWidget.tsx` (L112: `<section className="overflow-hidden">` wrapping a `bd-dashboard-panel--deep` map canvas at L115), `ShopMapWidget.tsx` (L116 + bare relative div L118), `InsurerMapWidget.tsx` (L70 + bare relative div L72). The bare `<section>` / `<div>` wrappers are the inner-glass seam in 1.3.
- `HomeScreen.tsx:137` — gap is currently `gap-3.5 md:gap-5`. This is the gagged-shadow root cause.
- 8-criteria depth bar binds **after** Bucket 2.1 + 2.3 ship.

### Locked palette (LAW — never violate)

- Top/corner gold lamp: `rgba(196, 144, 65, *)`
- Atmospheric / outer halo: `rgba(196, 130, 45, *)`
- Bronze trim: `rgba(140, 82, 22, *)`
- Cream inset highlight: `rgba(252, 240, 208, *)` (and `rgba(252, 238, 204, *)`)
- Cool blue ring/border: `rgba(96, 165, 250, *)`
- Cool blue underlayer: `rgba(2, 6, 23, *)` (used for shadows in dark)

**Forbidden register (instant-revert)**: `rgba(228,140,55)`, `rgba(228,175,100)`, `rgba(255,228,175)`, `rgba(220,165,90)`, `rgba(220,140,50)`, `rgba(220,140,40)`, `rgba(220,165,80)`, `rgba(160,95,25)`, `rgba(255,215,150)`, `rgba(180,100,30)`, `rgba(170,95,28)`, `rgba(253,200,*)`, `rgba(253,220,*)`, `rgba(255,230,*)`. Plus near-matches.

### Bucket 1.2 evaporation table (proof of skip)

| File                                                 | Lines audited          | Found inline forbidden? |
| ---------------------------------------------------- | ---------------------- | ----------------------- |
| ProfileDropdown.tsx                                  | L168, L286             | NO — class-based        |
| NotificationCenter.tsx                               | L101, L179, L308, L310 | NO — class-based        |
| DashboardHeader.tsx                                  | full file              | NO — 0 inline shadows   |
| CustomerMapWidget / ShopMapWidget / InsurerMapWidget | full file              | NO — fully class-based  |

### Bucket 1.1 — 4 NEW theme.css misses Cloud must close

Cloud's commit 5adee9d6 claimed 100%. Audit found 4 active forbidden values:

| Line | Class                                                      | Bad value                   | Replacement                 |
| ---- | ---------------------------------------------------------- | --------------------------- | --------------------------- |
| 857  | `.bd-map-tooltip` (var `--bd-warm-dark-amber-ellipse-top`) | `rgba(220, 140, 40, 0.3)`   | `rgba(196, 130, 45, 0.30)`  |
| 1529 | `.bd-shell-header--dark::after` (inset highlight)          | `rgba(255, 230, 175, 0.32)` | `rgba(252, 240, 208, 0.32)` |
| 1589 | `.bd-shell-header--dark::after` (top radial)               | `rgba(220, 140, 40, 0.26)`  | `rgba(196, 130, 45, 0.26)`  |
| 3447 | `.bd-gold-sheen-hover` (sweep midpoint)                    | `rgba(220, 165, 80, 0.3)`   | `rgba(196, 144, 65, 0.30)`  |

All four preserve original alpha. All four replace forbidden register with locked-palette equivalent. No visual regression — same hue family, slightly more refined.

### What Cloud must NOT do (hard stops)

- Touch backend/auth/storage/schema/migrations/edge functions/map provider (MapLibre)/geocoder/routing
- Modify `supabase/config.toml` (verify_jwt: false is load-bearing)
- Fix Coverage Command Center mobile sheet height (KI-067 sheet height: HOLD per owner)
- Wire functional navigation logic (Bucket 9 is design + doc only)
- Restructure DashboardAtmosphere.tsx (amplify existing D-layer pattern, don't refactor)
- Push single-layer halos above 0.22 alpha
- Apply asymmetric bronze halo bias to landing cards or popovers (dashboard `.bd-dashboard-panel` only)
- Reduce HomeScreen gap below `gap-5 md:gap-7`
- Merge to main
- Use destructive git ops (force-push, branch delete, etc.) without owner confirmation
- Run `--no-verify` git hooks
- Touch `mapSurfaceTheme.ts` beyond the L99 comment-block rephrase

---

─── BEGIN MASTER PROMPT — paste from here to Cloud ───

# Cloud — Master Autopilot Pass: Premium Gold Lighting + Map Redesign + Gagged-Shadow Fix

You are continuing a multi-pass design hardening on `BidOnDent-Horizon-Beta`. This prompt is your full runway for an unattended autopilot session. Execute all buckets in the order specified. Stop only on hard-stop conditions defined below.

## Owner directive overlay (binding)

1. **Mobile + dark first.** Every commit verified at 375px in dark mode before light.
2. **Premium gold is light, not paint.** Gold appears as lamp halo, inset bevel, atmospheric wash, edge catchlight, hover sheen — never as fill color or surface tint.
3. **Light mode: slight polish only.** Do NOT over-cream, do NOT whiten. Light mode work is consistency-only this pass.
4. **Map = the future product.** Bucket 5.6–5.9 redesigns map presentation surfaces only. Functional map logic stays untouched.
5. **No functional nav work.** Bucket 9 is doc-only. Wiring deferred.
6. **Verify before claiming.** Every "100%" claim must come with a fresh grep.

## Read these first (cannot skip)

- `docs/LAW_PROJECT_RULES.md` (Light-Mode Surface Rule + Premium Gold Palette — palette is LAW)
- `docs/LAW_HARDENING_PLAN.md` (current execution authority)
- `docs/REF_KNOWN_ISSUES.md` (KI-066 / KI-067 / KI-068 / KI-069 status; KI-070+ are yours to claim)
- `docs/REF_VISUAL_SYSTEM.md` (depth bar tokens)
- `docs/MOLANDJESUS_DESIGN_DECISIONS.md`
- Skill: `bd-design-identity` at `~/.claude/skills/bd-design-identity/SKILL.md`

## Locked palette (LAW)

- Lamp gold: `rgba(196, 144, 65, *)`
- Atmospheric bronze: `rgba(196, 130, 45, *)`
- Bronze trim: `rgba(140, 82, 22, *)`
- Cream inset: `rgba(252, 240, 208, *)`
- Cool blue ring: `rgba(96, 165, 250, *)`
- Shadow underlayer: `rgba(2, 6, 23, *)`

**Forbidden register** (instant-revert if introduced): `rgba(228,140,55)`, `rgba(228,175,100)`, `rgba(255,228,175)`, `rgba(220,165,90)`, `rgba(220,140,50)`, `rgba(220,140,40)`, `rgba(220,165,80)`, `rgba(160,95,25)`, `rgba(255,215,150)`, `rgba(180,100,30)`, `rgba(170,95,28)`, `rgba(253,200,*)`, `rgba(253,220,*)`, `rgba(255,230,*)`.

## 8-criteria dark depth bar (binds after Bucket 2.1 + 2.3)

1. **Top inset bevel**: `inset 0 1px 0 rgba(196, 144, 65, 0.16-0.24)` (panel 0.22, section 0.18)
2. **Drop shadow**: 2-layer black `rgba(2, 6, 23, *)` — _softened_ per Bucket 6 (panel `0 16-22px` not 22-32px when stacked)
3. **Bronze atmospheric halo**: `0 0 60-110px rgba(196, 130, 45, 0.06-0.14)`
4. **Bottom rim**: `inset 0 -1px 0 rgba(140, 82, 22, 0.18-0.22)`
5. **Cool blue 1px ring**: `0 0 0 1px rgba(96, 165, 250, 0.14-0.24)` + `border: 1px solid rgba(96, 165, 250, 0.20-0.24)`
6. **Navy gradient body**: `linear-gradient(180deg, rgba(10, 22, 45, 0.88-0.92) 0%, rgba(7, 16, 33, 0.84-0.88) 100%)` — no white ≥70% alpha anywhere
7. **(2.3 NEW) Edge catchlights**: `inset 1px 0 0 rgba(252, 240, 208, 0.10), inset -1px 0 0 rgba(252, 240, 208, 0.06)` — left brighter than right (lamp from upper-left convention)
8. **(2.1 NEW) Hover/focus state**: gold halo `0 0 24px rgba(196, 130, 45, 0.22)` + cool blue ring brightens to 0.32 + inset bevel brightens to 0.28

---

## Branch

`BidOnDent-Horizon-Beta`. NO main merge. Push commits one bucket at a time.

## Per-commit verification (mandatory, every commit)

```bash
npx tsc --noEmit
npm run build
npx cspell lint <touched files> --no-progress
# Branch-aware forbidden grep:
grep -nE "rgba\(228, ?(140|175)|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" \
  src/styles/theme.css src/app/components/ src/app/
# Mobile dark screenshot at 375px (Playwright or equivalent) — attach to commit body
```

If grep returns hits introduced by your commit → revert that commit, fix, re-verify.

---

## Bucket execution order (DO NOT REORDER)

### Bucket 1.1 — Forbidden register final closure (one commit)

Touch:

- `src/app/components/landing/HeroSection.tsx`
  - L593: replace `rgba(228, 140, 55, 0.08)` → `rgba(196, 130, 45, 0.08)`. **One token only.** Do not rewrite the surrounding stack — the rest is depth-bar compliant.
  - L984: replace the existing `boxShadow: "inset 0 1px 0 rgba(228, 175, 100, 0.22), 0 2px 12px rgba(2, 6, 23, 0.34)"` with the full 6-criteria depth bar stack:
    ```
    "inset 0 1px 0 rgba(196, 144, 65, 0.22), inset 0 -1px 0 rgba(140, 82, 22, 0.22), 0 0 0 1px rgba(96, 165, 250, 0.18), 0 16px 32px rgba(2, 6, 23, 0.30), 0 4px 12px rgba(2, 6, 23, 0.22), 0 0 60px rgba(196, 130, 45, 0.12)"
    ```
  - Verify L63–71 hero double-tap gate (`lastHeroMapTapRef`, `handleHeroMapTap`) — read only, do not modify.

- `src/app/components/maps/mapSurfaceTheme.ts`
  - L99 comment block: rephrase the legacy color reference so an audit grep doesn't flag it. Keep meaning intact. Suggested: replace any `rgba(228, …)` literal in the comment with the words `(legacy register, replaced by KI-066)`.

- `src/styles/theme.css` — 4 misses Cloud's last sweep didn't catch:
  | Line | Class | Replace |
  |---|---|---|
  | 857 | `.bd-map-tooltip` var `--bd-warm-dark-amber-ellipse-top` | `rgba(220, 140, 40, 0.3)` → `rgba(196, 130, 45, 0.30)` |
  | 1529 | `.bd-shell-header--dark::after` inset | `rgba(255, 230, 175, 0.32)` → `rgba(252, 240, 208, 0.32)` |
  | 1589 | `.bd-shell-header--dark::after` top radial | `rgba(220, 140, 40, 0.26)` → `rgba(196, 130, 45, 0.26)` |
  | 3447 | `.bd-gold-sheen-hover` sweep midpoint | `rgba(220, 165, 80, 0.3)` → `rgba(196, 144, 65, 0.30)` |

Commit message: `style(palette): close forbidden-register gaps in HeroSection + theme.css (KI-066c final, KI-071 RESOLVED)`

After commit: run the branch-aware grep above. Must return ZERO hits.

Update `docs/REF_KNOWN_ISSUES.md`:

- Add KI-071 (HeroSection forbidden register residuals) → mark RESOLVED 2026-05-03 in same commit.
- Append a one-line note to KI-066 confirming theme.css now passes branch-aware grep.

---

### Bucket 6 — Gagged dashboard shadow fix (one commit, three coordinated edits)

Root cause confirmed: `src/app/components/codelayer/HomeScreen.tsx:137` stacks panels with `gap-3.5 md:gap-5` (14px / 20px) while each panel ships full depth-bar shadows including `0 22-32px far-drop` + `0 0 60-110px` bronze atmospheric halo. Adjacent shadows visually collide → "gagged" look.

Fix in three coordinated edits, single commit:

#### 6.1 Gap bump

- `src/app/components/codelayer/HomeScreen.tsx:137`: `gap-3.5 md:gap-5` → `gap-5 md:gap-7`
- Search for any sibling stacking grids in `src/app/components/dashboard/` and apply same minimum (`gap-5 md:gap-7`). Do NOT change non-stacking layouts (popovers, sidebars, grids of small cards).

#### 6.2 Far-drop softening + asymmetric bias on `.bd-dashboard-panel` only

In `src/styles/theme.css` dark token block at L2462–2515 (the block Cloud just shipped in A1):

- `--bd-dashboard-panel-shadow`: change far-drop layer 1 from `0 32px 80px rgba(2, 6, 23, 0.46)` → `0 22px 56px rgba(2, 6, 23, 0.36)`
- `--bd-dashboard-panel-shadow`: change far-drop layer 2 from `0 12px 24px rgba(2, 6, 23, 0.30)` → `0 8px 18px rgba(2, 6, 23, 0.24)`
- `--bd-dashboard-panel-shadow`: append asymmetric downward bronze halo `, 0 24px 60px rgba(196, 130, 45, 0.10)` so glow biases below the panel (matches lamp-from-above lighting). Do NOT change the existing `0 0 60px` and `0 0 110px` halos — they stay symmetric for ambient lift.
- `--bd-dashboard-section-shadow`: same direction, smaller — far-drop `0 22px 56px → 0 16px 40px`, layer 2 `0 8px 18px → 0 6px 14px`. NO new asymmetric halo on sections (only top-level panels).

Light token block at L2493+ (`--bd-dashboard-panel-shadow`): apply same direction softening (`0 26px 56px → 0 18px 42px`, second layer `0 56px 110px → 0 36px 80px`). NO bias addition in light — light mode is cool-shadow-on-cream and bias would disturb the cool blue grounding.

#### 6.3 Optional micro-divider (only if visual diff still feels stacked)

If after 6.1+6.2 the panel stack still feels visually contiguous on mobile dark, add a 1px wide hairline divider between stacked panels using a parent `divide-y divide-[rgba(96,165,250,0.06)]` on the HomeScreen stack container. **Skip this step if the stack already breathes.**

Commit message: `fix(dashboard): resolve gagged panel shadows via gap + softened far-drop + asymmetric bronze halo bias (KI-072 RESOLVED)`

Add KI-072 entry in `docs/REF_KNOWN_ISSUES.md` and mark RESOLVED in same commit. Include before/after mobile dark screenshot in commit body.

---

### Bucket 7 — Atmospheric gold glow amplification (one commit, two files)

Owner directive: "amplify dark atmospheric gold glow." Current state in `DashboardAtmosphere.tsx`: gold gutters at D5 (left, 0.18α) / D6 (right, 0.15α) / D7 (bottom, 0.13α). No top corners. No room ceiling lamp.

#### 7.1 DashboardAtmosphere.tsx amplification

Add three new layers BEFORE the existing D5 (so they sit deeper under the panel stack):

- **Top-left corner gold lamp** (dark only — light gets a ghost):
  ```jsx
  background: isLightAppearance
    ? "radial-gradient(ellipse 38% 28% at 8% 0%, rgba(196, 144, 65, 0.06) 0%, transparent 65%)"
    : "radial-gradient(ellipse 42% 32% at 8% 0%, rgba(196, 144, 65, 0.22) 0%, transparent 60%)",
  ```
- **Top-right corner gold lamp** (slightly weaker — asymmetric premium feel):
  ```jsx
  background: isLightAppearance
    ? "radial-gradient(ellipse 32% 24% at 92% 0%, rgba(196, 144, 65, 0.04) 0%, transparent 65%)"
    : "radial-gradient(ellipse 36% 28% at 92% 0%, rgba(196, 144, 65, 0.16) 0%, transparent 60%)",
  ```
- **Bronze floor wash** (full-width, low, dark only):
  ```jsx
  background: isLightAppearance
    ? "transparent"
    : "linear-gradient(180deg, transparent 70%, rgba(196, 130, 45, 0.10) 100%)",
  ```

Existing D5/D6/D7 gutter washes: increase dark alpha by +0.04 (D5: 0.18→0.22, D6: 0.15→0.19, D7: 0.13→0.17). Do NOT touch light alphas.

Do NOT restructure the file. Add the three new `<div className="fixed inset-0 z-0 pointer-events-none">` blocks in the same pattern as D5/D6/D7.

#### 7.2 LandingPageLayout atmosphere

`src/app/components/app/LandingPageLayout.tsx` currently has only a single dark base radial at L68–70. Add a parallel-but-restrained gold lamp stack matching DashboardAtmosphere's D5/D6/D7 pattern (slightly lower alpha — landing breathes more):

- Top-left corner lamp: `rgba(196, 144, 65, 0.18)` dark / `0.05` light
- Top-right corner lamp: `rgba(196, 144, 65, 0.13)` dark / `0.04` light
- Left gutter wash (D5 mirror): `rgba(196, 130, 45, 0.15)` dark / `0.08` light
- Right gutter wash (D6 mirror): `rgba(196, 130, 45, 0.12)` dark / `0.07` light
- Bottom wash (D7 mirror): `rgba(196, 130, 45, 0.10)` dark / `0.06` light

Mount these as fixed full-screen layers in the same JSX region as the existing radial. Order: dark base radial first (existing), then your new gold layers above.

Commit message: `style(atmosphere): amplify premium gold lamp lighting on dashboard + extend to landing (KI-073 RESOLVED)`

Add KI-073 to `docs/REF_KNOWN_ISSUES.md`. Include before/after dark mobile screenshots of dashboard AND landing in commit body.

---

### Bucket 1.3 — Map widget inner-glass seam (one commit)

Three files, same pattern. The bare wrapper around `<DashboardMapPreview>` causes a flat seam between the panel border and the map canvas. Add an inner-glass bezel ring.

- `src/app/components/dashboard/CustomerMapWidget.tsx` L112–115: the outer `<section className="overflow-hidden">` wraps a `bd-dashboard-panel--deep` map div. Add an inner bezel: replace the outer `<section className="overflow-hidden">` with `<section className="overflow-hidden rounded-2xl ring-1 ring-[rgba(96,165,250,0.18)] ring-inset">`.
- `src/app/components/dashboard/ShopMapWidget.tsx` L116–118: the bare `<div className="relative h-[180px] md:h-[200px]">` at L118 wraps the map. Wrap it: `<div className="relative h-[180px] md:h-[200px] rounded-xl ring-1 ring-[rgba(96,165,250,0.16)] ring-inset overflow-hidden">`.
- `src/app/components/dashboard/InsurerMapWidget.tsx` L70–72: identical pattern to ShopMapWidget. Apply same wrapper change.

Commit message: `style(map-widgets): add inner-glass bezel ring to map preview surfaces (KI-074 partial)`

---

### Bucket 2.1 — Hover/focus catchlight on interactives (one commit)

Apply criterion 8 (hover/focus state) to the following surfaces. Theme.css edits only — do NOT touch component files.

#### 2.1a Dashboard primary buttons

In `src/styles/theme.css`, locate `.bd-dashboard-primary-button` and `.bd-dashboard-primary-button:hover` / `:focus-visible`:

- Add to hover/focus: gold halo `0 0 24px rgba(196, 130, 45, 0.22)` + cool blue ring brightens to `0 0 0 1px rgba(96, 165, 250, 0.32)`
- Add to focus-visible: outer ring `0 0 0 3px rgba(96, 165, 250, 0.20)` for accessibility

#### 2.1b Quick Actions tiles

`.bd-dashboard-section--interactive:hover` already has `--bd-dashboard-section-hover-shadow` (Cloud just shipped this). Verify it includes a brightened gold halo (current `0 0 52px rgba(196, 130, 45, 0.18)` is good — already ships). If not, add. Add `:focus-visible` ring `0 0 0 3px rgba(96, 165, 250, 0.18)`.

#### 2.1c MobileBottomNav + DesktopNavTabs active state

Locate the active-tab class (likely `.bd-nav-tab--active` or similar in theme.css). Add gold halo `0 0 18px rgba(196, 130, 45, 0.20)` to active state. Hover state: cool blue ring `0 0 0 1px rgba(96, 165, 250, 0.24)`.

#### 2.1d Profile/notification triggers + DashboardHeader search

Find `.bd-shell-header--dark` button children and the search input class. Add `:hover` cool blue ring + gold inset bevel brightening. `:focus-visible` gets the 3px outer ring.

Commit message: `style(interactive): hover + focus catchlight on dashboard buttons, nav tabs, header controls (depth-bar criterion 8)`

---

### Bucket 2.3 — Edge catchlights theme.css (one commit)

Add criterion 7 (edge catchlights) to dark token blocks in theme.css:

- `--bd-dashboard-panel-shadow` (dark): append `, inset 1px 0 0 rgba(252, 240, 208, 0.10), inset -1px 0 0 rgba(252, 240, 208, 0.06)`
- `--bd-dashboard-section-shadow` (dark): append `, inset 1px 0 0 rgba(252, 240, 208, 0.08), inset -1px 0 0 rgba(252, 240, 208, 0.05)`
- Light mode: SKIP (cream-on-cream catchlight invisible — would only add render cost)

After this commit, all 8 criteria of the depth bar bind. Update `docs/REF_VISUAL_SYSTEM.md` to document the upgrade from 6 → 8 criteria.

Commit message: `style(depth-bar): add criterion 7 edge catchlights — depth bar now 8/8 (KI-069 upgrade)`

---

### Bucket 4 — Landing surfaces (one commit per sub-bucket, three commits)

#### 4.1 Landing dark depth audit

Audit `src/app/components/landing/HeroSection.tsx`, `OperatingRegionsSection.tsx`, `CoverageBrowseExperience.tsx` for any panel/card without the 8-criteria depth bar. Apply via class swap to `bd-glass-card--landing` (create or extend variant in theme.css if needed). Do NOT hand-roll inline shadows. Document any new variant in `docs/REF_VISUAL_SYSTEM.md`.

If audit finds nothing missing, commit a one-line empty addendum to `docs/REF_VISUAL_SYSTEM.md` confirming landing is depth-bar compliant.

Add KI-070 to `docs/REF_KNOWN_ISSUES.md` only if real gaps found. Otherwise skip the KI.

Commit message: `style(landing): audit + apply 8-criteria depth bar to landing panels` (or `docs(landing): confirm depth-bar compliance via audit` if no edits)

#### 4.2 Landing light slight polish

Light mode only. Touch only spacing rhythm + inset bevel alphas. Do NOT change colors, do NOT add gold paint, do NOT whiten. If you find any panel using `rgba(254, 248, 220, *)` or any cream above 0.94 alpha, it's likely fine — leave it.

Commit only if real adjustments needed. Otherwise skip.

#### 4.3 Landing CTA catchlight

Hero CTA buttons get the same hover/focus catchlight stack from Bucket 2.1a. Apply to `.bd-cta-primary` / `.bd-hero-cta` classes (whichever exists). Theme.css edit only.

Commit message: `style(landing): hero CTA hover/focus catchlight (depth-bar criterion 8 extension)`

---

### Bucket 5 — Functional polish + Map premium redesign (multiple commits)

#### 5.1–5.5 Existing functional polish

These are smaller items already in your queue from prior sessions:

- 5.1 Coverage Command Center popover scrim consistency (light mode parity with dark)
- 5.2 Mode badges spine alignment when stacked vertically
- 5.3 Notification center empty-state illustration depth
- 5.4 Profile dropdown trailing chevron weight
- 5.5 Dashboard header action button min-touch-target audit (44×44 mobile)

One commit per sub-bucket. Skip any that audit shows already correct.

#### 5.6 CustomerMapWidget glass bezel premium pass

- File: `src/app/components/dashboard/CustomerMapWidget.tsx` L112–186
- After Bucket 1.3 wrapper ring is in place, add a subtle gold-tinted gradient overlay at the top 12% of the map preview to simulate ambient lamp light hitting the map surface. Use `bg-gradient-to-b from-[rgba(196,144,65,0.06)] via-transparent to-transparent pointer-events-none absolute inset-x-0 top-0 h-12 z-[1]` as a sibling div above the map preview.
- The "View Full Map" button at L175 already has good treatment — verify only.

#### 5.7 Hero map dual-source counter-glow

- File: `src/app/components/landing/HeroSection.tsx` around L584 + L964 (the two hero map invocations)
- Add a counter-glow layer beneath the map: a fixed-position absolute div with `bg-radial-gradient` from `rgba(96, 165, 250, 0.12)` (cool blue grounding) at top-left, paired with a `rgba(196, 130, 45, 0.10)` (warm bronze) at bottom-right. This dual-source matches the lamp-from-above + cool-floor convention.

#### 5.8 MapSurfaceControls capsule rail

- File: `src/app/components/maps/MapSurfaceControls.tsx`
- Wrap the existing button group in a capsule rail: `<div className="inline-flex items-center gap-1 rounded-full bg-[rgba(10,22,45,0.78)] backdrop-blur-md ring-1 ring-[rgba(96,165,250,0.20)] shadow-[0_8px_24px_rgba(2,6,23,0.40),0_0_30px_rgba(196,130,45,0.12)] px-1.5 py-1.5">`. Each button inside gets `rounded-full` and `min-w-11 min-h-11` for touch.
- Light mode counterpart: cream bg + bronze ring.

#### 5.9 Map canvas edge sheen

- File: `src/styles/theme.css` — new utility `.bd-map-canvas-sheen`
- Definition: `position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 1px 0 rgba(252, 240, 208, 0.14), inset 0 -1px 0 rgba(140, 82, 22, 0.16); border-radius: inherit;`
- Apply to all three map widgets as a sibling div inside the bezel ring wrapper.

Commit messages:

- `style(maps): premium glass bezel + ambient lamp overlay on customer map widget (KI-074 partial)`
- `style(landing): dual-source counter-glow beneath hero map (KI-074 partial)`
- `style(map-controls): capsule rail premium treatment for MapSurfaceControls (KI-074 partial)`
- `style(maps): canvas edge sheen utility + apply to dashboard map widgets (KI-074 RESOLVED)`

The final 5.9 commit closes KI-074. Update `docs/REF_KNOWN_ISSUES.md`.

---

### Bucket 9 — Doc-only future nav + map functional buildout plan (one commit)

Create `docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` with:

- **Section 1**: Future nav engine (live turn-by-turn, voice prompts, deviation handling, saved places, route preview). List existing scaffolding files (`useCoverageNavigationExperience.ts`, `NavigationDeviationPrompt.tsx`, `NavigationVoiceControlsSheet.tsx`, etc.) and what's wired vs stub.
- **Section 2**: Map functional buildout — real provider integration tiers, geocoder hardening, routing fallback, place search with Supabase-backed favorites, per-role map layer activation rules.
- **Section 3**: Sequencing — what blocks what, and which load-bearing skills (`supabase-clerk-edge-function`, `supabase-storage-signed-urls`) apply.
- **Section 4**: Trigger conditions — when this plan moves from PLAN\_ to LAW_HARDENING_PLAN scope.

This is a PLAN doc. No code edits. Add to `docs/README.md` index.

Add KI-075 (deferred future-nav buildout) to `docs/REF_KNOWN_ISSUES.md` with explicit DEFERRED status pointing at this plan doc.

Commit message: `docs(plan): future navigation engine + map functional buildout deferred plan (KI-075 DEFERRED)`

---

### Final master-cook commit (optional, only if all above succeeded)

Run full repo verification:

```bash
npx tsc --noEmit
npm run build
npx cspell lint "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress
grep -nE "rgba\(228, ?(140|175)|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" src/ | grep -v "// legacy" | grep -v "(legacy register"
```

If everything passes, write a final report doc `docs/PASS_AUTOPILOT_2026-05-03_MASTER_REPORT.md` containing:

1. **Commit chain** — list every commit with hash, message, KI delta
2. **8-criteria depth bar compliance table** — surface × criterion grid (panel, section, button, nav-tab, header, popover, map widget × 8 criteria)
3. **Atmospheric before/after** — embed dark dashboard + landing screenshots
4. **Panel stack visual diff** — gagged-vs-fixed mobile dark
5. **Map redesign visual summary** — bezel + counter-glow + capsule rail + sheen
6. **IP / legal claimant gate** — list any third-party assets, libraries, or design references touched. Confirm none added without prior approval.
7. **Outstanding KIs** — KI-067 sheet height (HOLD), KI-075 (DEFERRED). Anything else discovered.
8. **Best next pass** — your single recommendation.

Commit message: `docs(report): autopilot 2026-05-03 master pass report`

---

## Hard stops (interrupt autopilot, escalate to owner)

- Build failure persisting after 2 fix attempts on the same error
- Branch-aware grep returns hits AFTER your commit that you cannot reconcile
- Any structural change to `DashboardAtmosphere.tsx` beyond adding the 3 new layers
- Any touch to backend/auth/storage/schema/migrations/edge functions/MapLibre provider/geocoder/routing
- Any change to `supabase/config.toml`
- Any KI-067 sheet height edit
- Any single-layer halo above 0.22 alpha
- Asymmetric bronze halo bias accidentally applied to landing or popovers
- HomeScreen gap below `gap-5 md:gap-7`
- Any prompt to merge to main
- Any destructive git op (`--force`, branch delete, `reset --hard`) — owner confirmation required even if you believe it's safe
- Discovery of an unrelated agent's edits in your worktree — read first, do NOT revert, narrow your patch to avoid collision

## Autonomy contract

- Plan only when blocked. Otherwise execute.
- Commit after each bucket. Push to `BidOnDent-Horizon-Beta`. NO main merge.
- Cite skills in commit messages where applicable: `bd-design-identity`, `mola-ai-relay-protocol`.
- Update KI doc in same commit as the fix.
- If a bucket evaporates on audit (like 1.2 did), commit a one-line note to `docs/REF_KNOWN_ISSUES.md` saying so. Do NOT leave silent skips.
- Mobile dark screenshot in every UI commit body.

## Reference: bucket → commit → KI map

| Bucket  | Commits      | KI delta                            |
| ------- | ------------ | ----------------------------------- |
| 1.1     | 1            | KI-066 final note + KI-071 RESOLVED |
| 1.2     | 0 (skip)     | none                                |
| 1.3     | 1            | KI-074 partial                      |
| 6       | 1            | KI-072 RESOLVED                     |
| 7       | 1            | KI-073 RESOLVED                     |
| 2.1     | 1            | (depth-bar criterion 8 — no KI)     |
| 2.3     | 1            | KI-069 upgrade (6→8 criteria)       |
| 4.1–4.3 | 0–3          | KI-070 only if gaps                 |
| 5.1–5.5 | 0–5          | none                                |
| 5.6–5.9 | 4            | KI-074 RESOLVED on 5.9              |
| 9       | 1            | KI-075 DEFERRED                     |
| Final   | 1 (optional) | none                                |

Total: 11–17 commits depending on what evaporates on audit.

## Begin

Start with Bucket 1.1. Verify each commit before moving to the next. Stop at hard stops. Otherwise run all the way through the final master-cook commit. Report at the end.

─── END MASTER PROMPT ───

---

## Operator notes (do not paste to Cloud)

- **Why bucket 6 is upstream of 7**: gagged-shadow fix changes panel shadow tokens. If 7 ships first, the amplified atmospheric layers will pile onto un-softened far-drops and look worse before better.
- **Why 2.1 is downstream of 6**: hover-state halos brighten the same shadow tokens being softened. Order matters for visual coherence.
- **Why 5.9 closes KI-074**: it's the last visual-finish utility on the map redesign track. After 5.9 the map widget surface family is complete.
- **If Cloud asks for clarification**: it shouldn't. The prompt is comprehensive. If it does, the only acceptable clarification is on hard-stop boundaries — never on creative direction.
- **If Cloud's first commit grep still shows hits**: the four NEW theme.css misses I documented may have already been touched by some non-obvious sweep before this prompt reaches Cloud. In that case grep returns 0 — the bucket evaporates and Cloud commits a one-line note instead.
- **Branch hygiene**: Cloud should not rebase. Linear forward commits only. Owner can squash/rebase later if desired.

---

**End of handoff doc.**
