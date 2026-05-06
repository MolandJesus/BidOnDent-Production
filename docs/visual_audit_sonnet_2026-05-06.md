# Pass 8 Visual Audit — 2026-05-06

> **Scope:** Read-only audit. No `theme.css` or component edits. Audit feeds the next
> pass; owner approves which findings get acted on.
>
> **Author:** Claude Opus 4.7 (Mola's Coder, GitHub Copilot agent), executing the
> Pass 8 brief relayed by the owner from the prior Sonnet session.
>
> **Branch:** `BidOnDent-Horizon-Beta` (HEAD `b98ed748` — Pass 7 metallic chrome
> trim alignment on dark landing + dashboard cool cards). Already merged to `main`
> as `6b6a44e5`.
>
> **Build at audit time:** `npm run build` PASS in 3.34s on clean tree.
>
> **Hard-NO list honored:** No edits to warm-dominant surfaces, the report shell,
> shells/modals/dropdowns, or the locked Premium Gold Palette caps.

---

## Phase 1 — bronze-trim inventory

Pulled every `inset 0 -1px 0 rgba(140, 82, 22, *)`, `inset 0 -1px 0 rgba(196, 144, 65, *)`,
`inset 0 -1px 0 rgba(190, 105, 35, *)`, and `inset 0 -2px 0 rgba(252, 240, 208, *)` /
`rgba(252, 238, 204, *)` cream-sub-rim from [src/styles/theme.css](../src/styles/theme.css).
276 total matches across the bronze + cream-inset families. Selector enclosure
verified by walking up to the nearest top-level rule. Selectors classified by
Pass 8 surface taxonomy.

### Glass-card family (the metallic-trim grammar's primary home)

| Selector                                                                            | Mode  | Surface type       | Pass 7 cream sub-rim?      | Should it have one?                 | Notes                                                                        |
| ----------------------------------------------------------------------------------- | ----- | ------------------ | -------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- |
| `.bd-glass-card--landing` (idle, [L985](../src/styles/theme.css#L985))              | LIGHT | Cool-dominant      | ❌ No                      | ⚠️ **Candidate**                    | Light parity gap. See P3-A.                                                  |
| `.bd-glass-card--landing:hover` ([L1051](../src/styles/theme.css#L1051))            | LIGHT | Cool-dominant      | ❌ No                      | ⚠️ **Candidate**                    | Same.                                                                        |
| `.bd-glass-card--landing-warm` ([L1023](../src/styles/theme.css#L1023))             | LIGHT | Warm-dominant      | ❌ No                      | ✅ Correct — must stay sub-rim-free | LAW-honored.                                                                 |
| `.bd-glass-card--landing-warm:hover` ([L1037](../src/styles/theme.css#L1037))       | LIGHT | Warm-dominant      | ❌ No                      | ✅ Correct                          | LAW-honored.                                                                 |
| `.bd-glass-card--dashboard` ([L1121](../src/styles/theme.css#L1121))                | LIGHT | Cool-dominant      | ❌ No                      | ⚠️ **Candidate**                    | Light parity gap. See P3-A.                                                  |
| `.bd-glass-card--dashboard:hover` ([L1177](../src/styles/theme.css#L1177))          | LIGHT | Cool-dominant      | ❌ No                      | ⚠️ **Candidate**                    | Same.                                                                        |
| `.dark .bd-glass-card` ([L1590](../src/styles/theme.css#L1590))                     | DARK  | Cool-dominant base | ❌ No                      | ⚠️ **Candidate**                    | Pass 9 #3 site-wide gold-trim baseline; Pass 7 didn't extend here. See P3-B. |
| `.dark .bd-glass-card:hover` ([L1618](../src/styles/theme.css#L1618))               | DARK  | Cool-dominant base | ❌ No                      | ⚠️ **Candidate**                    | Same.                                                                        |
| `.dark .bd-glass-card--landing` ([L1635](../src/styles/theme.css#L1635))            | DARK  | Cool-dominant      | ✅ **Pass 7** (0.05 idle)  | ✅ Correct                          | Pass 7 shipped.                                                              |
| `.dark .bd-glass-card--landing:hover` ([L1681](../src/styles/theme.css#L1681))      | DARK  | Cool-dominant      | ✅ **Pass 7** (0.07 hover) | ✅ Correct                          | Pass 7 shipped.                                                              |
| `.dark .bd-glass-card--landing-warm` ([L1707](../src/styles/theme.css#L1707))       | DARK  | Warm-dominant      | ❌ No                      | ✅ Correct — must stay sub-rim-free | LAW-honored.                                                                 |
| `.dark .bd-glass-card--landing-warm:hover` ([L1723](../src/styles/theme.css#L1723)) | DARK  | Warm-dominant      | ❌ No                      | ✅ Correct                          | LAW-honored.                                                                 |
| `.dark .bd-glass-card--dashboard` ([L1742](../src/styles/theme.css#L1742))          | DARK  | Cool-dominant      | ✅ **Pass 7** (0.06 idle)  | ✅ Correct                          | Pass 7 shipped.                                                              |
| `.dark .bd-glass-card--dashboard:hover` ([L1761](../src/styles/theme.css#L1761))    | DARK  | Cool-dominant      | ✅ **Pass 7** (0.08 hover) | ✅ Correct                          | Pass 7 shipped.                                                              |

### Dashboard-panel family (Pass 6 home)

| Selector                                                                      | Mode | Surface type         | Pass 6 cream sub-rim? | Should it?                      | Notes                      |
| ----------------------------------------------------------------------------- | ---- | -------------------- | --------------------- | ------------------------------- | -------------------------- |
| `.bd-dashboard-panel--deep` ([L3007](../src/styles/theme.css#L3007))          | DARK | Cool-dominant base   | ❌ No                 | ⚠️ **Candidate (low-priority)** | Bronze rim only. See P3-C. |
| `.bd-dashboard-panel--accent-blue` ([L3029](../src/styles/theme.css#L3029))   | DARK | Cool-dominant accent | ✅ **Pass 6** (0.06)  | ✅ Correct                      | Pass 6.                    |
| `.bd-dashboard-panel--accent-cyan` ([L3043](../src/styles/theme.css#L3043))   | DARK | Cool-dominant accent | ✅ **Pass 6** (0.06)  | ✅ Correct                      | Pass 6.                    |
| `.bd-dashboard-panel--accent-indigo` ([L3057](../src/styles/theme.css#L3057)) | DARK | Cool-dominant accent | ✅ **Pass 6** (0.06)  | ✅ Correct                      | Pass 6.                    |

### Dashboard-section family (Pass 6 home)

| Selector                                                                           | Mode | Surface type       | Pass 6 cream sub-rim? | Should it?                           | Notes        |
| ---------------------------------------------------------------------------------- | ---- | ------------------ | --------------------- | ------------------------------------ | ------------ |
| `.bd-dashboard-section--deep` ([L3190](../src/styles/theme.css#L3190))             | DARK | Cool-dominant base | ✅ **Pass 6** (0.05)  | ✅ Correct                           | Pass 6.      |
| `.bd-dashboard-section--accent-blue` ([L3218](../src/styles/theme.css#L3218))      | DARK | Cool-dominant      | ✅ **Pass 6** (0.05)  | ✅ Correct                           | Pass 6.      |
| `.bd-dashboard-section--accent-cyan` ([L3232](../src/styles/theme.css#L3232))      | DARK | Cool-dominant      | ✅ **Pass 6** (0.05)  | ✅ Correct                           | Pass 6.      |
| `.bd-dashboard-section--accent-indigo` ([L3246](../src/styles/theme.css#L3246))    | DARK | Cool-dominant      | ✅ **Pass 6** (0.05)  | ✅ Correct                           | Pass 6.      |
| `.bd-dashboard-section--accent-rose` ([L3260](../src/styles/theme.css#L3260))      | DARK | Cool-dominant      | ✅ **Pass 6** (0.05)  | ✅ Correct                           | Pass 6.      |
| `.bd-dashboard-section--accent-gold` ([L3285](../src/styles/theme.css#L3285))      | DARK | **Warm-dominant**  | ❌ No                 | ✅ Correct — sub-rim would over-pale | LAW-honored. |
| `.bd-dashboard-section--accent-champagne` ([L3302](../src/styles/theme.css#L3302)) | DARK | **Warm-dominant**  | ❌ No                 | ✅ Correct — sub-rim would over-pale | LAW-honored. |

### Shells / utility / chips (Hard-NO scope — not eligible this pass)

| Selector                                                                                                                                 | Mode  | Surface type     | Decision                               |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------- | -------------------------------------- |
| `.bd-shell-header--light` ([L1414](../src/styles/theme.css#L1414))                                                                       | LIGHT | Shell            | ❌ Out of scope (Hard-NO list)         |
| `.bd-shell-header--dark` ([L1470](../src/styles/theme.css#L1470))                                                                        | DARK  | Shell            | ❌ Out of scope (Hard-NO list)         |
| `.bd-glass-badge` ([L1266](../src/styles/theme.css#L1266))                                                                               | both  | Utility chip     | ❌ Out of scope — different identity   |
| `.bd-glass-control` (idle/hover/active, [L1287/L1325/L1337](../src/styles/theme.css#L1287))                                              | both  | Utility chip     | ❌ Out of scope                        |
| `.bd-glass-floating` ([L1351](../src/styles/theme.css#L1351))                                                                            | both  | Utility          | ❌ Out of scope                        |
| `.bd-dashboard-primary-button` (idle/hover/active, [L3578/L3649/L3667](../src/styles/theme.css#L3578))                                   | both  | Button           | ❌ Out of scope — interactive identity |
| `.bd-dashboard-secondary-button` ([L3594](../src/styles/theme.css#L3594))                                                                | both  | Button           | ❌ Out of scope                        |
| `.bd-report-progress-rail-fill` ([L2697](../src/styles/theme.css#L2697)) and report shell ([L2200-L2400](../src/styles/theme.css#L2200)) | both  | **Report shell** | ❌ **Out of scope (Hard-NO list)**     |

**Phase 1 verdict:** Pass 6 (dashboard accent variants) and Pass 7 (`.dark .bd-glass-card--landing` + `--dashboard`) are both correctly bounded — every warm-dominant surface is sub-rim-free, and every cool-dominant surface they touched got the cream catchlight. **Three families remain as eligible Phase 3 candidates** (light-mode parity for the same selectors Pass 7 hit in dark, plus the `.dark .bd-glass-card` base and `.bd-dashboard-panel--deep`).

---

## Phase 2 — live visual signals (signed-in capture, desktop 1709×1207)

### Capture coverage

| Asset                         | What it captures                                                    | Status                               |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `21-dark-dashboard-full.png`  | Dark dashboard — Quick Actions, Repair Activity, Welcome-back hero  | ✅                                   |
| `11-light-dashboard-full.png` | Light dashboard — same surfaces, light register                     | ✅                                   |
| `22-dark-smart-shop-map.png`  | Dark Smart Shop Map (in-app) — search panel, demo banner, map shell | ✅                                   |
| `12-light-smart-shop-map.png` | Light Smart Shop Map — same, light register                         | ✅                                   |
| `20-dark-landing-full.png`    | Dark landing (signed-out)                                           | ❌ **Not captured** — see note below |
| `10-light-landing-full.png`   | Light landing (signed-out)                                          | ❌ **Not captured** — see note below |
| `*-coverage-map-dialog.png`   | CoverageMapDialog full-map shell                                    | ❌ **Not captured** — see note below |

**Why landing + CoverageMapDialog screenshots are missing:** The active browser
session is signed in to Mola's Clerk account. `page.goto('/')` redirects to the
dashboard for authenticated users. The in-app sidebar logo (`aria-label="Open
dashboard home"`) routes to dashboard home, not the landing page. Reaching the
true landing page required either (a) signing out of the owner's live Clerk
session — declined to avoid disrupting the owner's working state — or (b) using
an incognito context, which the current Playwright session doesn't support.
The CoverageMapDialog couldn't be reached without first being on landing
(its desktop entry path is "double-tap on landing centre map target"). The
in-app `Open Smart Map` route opens the **Smart Shop Map screen** (captured
above), which is a related but distinct surface.

**Recommendation for next pass:** owner-authorized sign-out (or a fresh
incognito Playwright context) to complete the landing + CoverageMapDialog
captures. Pass 7 metallic-trim work has already been live-probe verified at
the CSS-token level, so the missing screenshots do not block any Pass 6/7
verdict — they only block a finer-grained read on landing-card spacing /
hierarchy.

### Visual-signal table

For surfaces captured this pass:

| Signal                                                                               | Should be                                                                   | Observed (dark dashboard)                                                 | Observed (light dashboard)                                                                     | Verdict                                |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| Cool dashboard accent variants (Tile 1 New Repair Request, Tile 3 Connect Insurance) | Visible chrome doubled-edge — bronze line + faint cream catchlight under it | ✅ Doubled-edge present, cool-blue body, gold rim reads as trim not paint | ✅ Cool-blue body, soft cream cap, edge clearly defined                                        | ✅ **PASS — Pass 6 reads as intended** |
| Warm pop tiles (Tile 2 View Bids, Tile 4 Find Shops)                                 | Bronze rim only, no cream sub-rim                                           | ✅ Warm cream-gold body, bronze rim only, no over-paled second edge       | ✅ Warm cream-gold body, single bronze line, premium feel                                      | ✅ **PASS — warm identity preserved**  |
| Welcome-back hero panel (`.bd-dashboard-panel--accent-blue` warm hero)               | Cream-gold dominant with bronze trim, NOT pure white                        | n/a (in dark register reads as cool-deep with strong gold lamp)           | ✅ Strong cream-gold body, bronze trim, NOT white                                              | ✅ **PASS — LAW-compliant**            |
| Workspace canvas                                                                     | Cool misty blue-gray, NOT pure white                                        | ✅ Deep navy gradient with warm corner blooms                             | ✅ Cool misty blue-gray, NOT white                                                             | ✅ **PASS**                            |
| Sidebar                                                                              | Cool-tinted glass with bronze inset                                         | ✅ Deep navy + warm corner glow at top + bronze rim trim                  | ✅ Cool blue tint + bronze rim + warm corner                                                   | ✅ **PASS**                            |
| Shadow falloff                                                                       | Smooth atmospheric bleed into canvas, no hard edge ring                     | ✅ Smooth                                                                 | ✅ Smooth (atmospheric drop-shadow not banded)                                                 | ✅ **PASS**                            |
| Repair Activity report cards (`.bd-glass-card--landing` cool variant)                | Distinguished from canvas, doubled-edge in dark                             | ✅ Cool-blue body, gold rim reads, doubled-edge present (Pass 7)          | ⚠️ **PALE** — light-mode cards read very close to the canvas; no metallic doubled-edge present | ⚠️ **WEAK SIGNAL — Phase 3-A**         |

---

## Phase 3 — eligible-for-metallic candidates (report only, no edits)

Surfaces eligible for the metallic chrome doubled-edge treatment in a future
pass. None edited this pass — owner approves which to take.

### P3-A — Light-mode parity for `.bd-glass-card--landing` and `.bd-glass-card--dashboard`

- **Selectors:** [`.bd-glass-card--landing` L985, `:hover` L1051, `.bd-glass-card--dashboard` L1121, `:hover` L1177](../src/styles/theme.css#L985)
- **Rationale:** Pass 7 added the cream sub-rim only to the `.dark` variants
  of these selectors. The light variants currently use a heavy cream highlight
  cap (`inset 0 1px 0 rgba(252, 240, 208, 0.88)`) and bronze rim only —
  no doubled-edge below the rim. The Phase 2 light-dashboard screenshot
  shows the report cards reading very close to the cool blue-gray canvas;
  a faint cream sub-rim `inset 0 -2px 0 rgba(252, 240, 208, 0.06-0.08)`
  would lift them slightly without violating the locked palette caps
  (cream highlights ≤ 0.22 LAW; 0.06-0.08 is well below).
- **Why it's a candidate, not a recommendation:** Light mode already has
  champagne-cream surfaces and a strong gold-lamp story; adding a second
  cream-edge band could over-pale or compete with the warm hero. Owner
  judgment required.
- **Blast radius:** 4 selector blocks, ~4 lines of CSS each, no JSX touched.

### P3-B — Dark base `.bd-glass-card` (Pass 9 #3 site-wide variant)

- **Selectors:** [`.dark .bd-glass-card` L1590, `:hover` L1618](../src/styles/theme.css#L1590)
- **Rationale:** This is the cool-dominant catch-all variant (used wherever
  no `--landing` / `--landing-warm` / `--dashboard` modifier applies). It
  already has bronze rim 0.28→0.32 and cool ring + sky-blue cap. Adding
  a cream sub-rim 0.05 idle / 0.07 hover would bring it into the same
  metallic-chrome family as Pass 7's landing/dashboard variants.
- **Why it's a candidate, not a recommendation:** This selector is used
  across many surfaces (modals, dialogs, info cards, etc.). Adding a sub-rim
  here is closer to a "language change" than a tuning. May propagate to
  surfaces the owner hasn't audited.
- **Blast radius:** 2 selector blocks, ~4 lines of CSS each. Visual
  propagation: many cards across the app.

### P3-C — `.bd-dashboard-panel--deep` (low-priority)

- **Selector:** [`.bd-dashboard-panel--deep` L3007](../src/styles/theme.css#L3007)
- **Rationale:** Pass 6 added the cream sub-rim to all three accent variants
  (`--accent-blue/cyan/indigo`) but skipped `--deep` (the base panel that
  uses the same body grammar). For internal consistency, `--deep` should
  match.
- **Why it's a candidate, not a recommendation:** `--deep` is the most
  neutral of the four panels — its reason for being is to look "quiet."
  A doubled-edge might break that quietness. Probably should not happen
  unless the owner wants strict family parity.
- **Blast radius:** 1 selector block, ~1 line of CSS.

### P3-D — Inline `boxShadow` styles in landing-section TSX components (deferred to component sweep)

- **Files:** `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`,
  `AboutOpportunitySection.tsx`, etc. (per Sonnet's prior audit)
- **Rationale:** These sections set inline `boxShadow` instead of using
  `bd-glass-card--landing`. Any pre-Pass-7 trim values there will not be
  upgraded by editing `theme.css`. A separate component sweep is needed
  to either (a) align inline values to the new metallic baseline, or
  (b) migrate them onto the `.bd-glass-card--landing` class.
- **Why it's a candidate, not a recommendation:** This is a component-level
  refactor pass, not a CSS pass. Different blast radius profile. Skipped
  this audit (read-only scope) but worth a future Pass 9 brief.

---

## Hard-stop flags

### HSF-1 — Yellow-amber Tailwind palette in Smart Shop Map demo banner ⚠️ **LIKELY LAW VIOLATION**

- **Surface:** "Showing example shop locations. Verified partner shops will
  appear once your account is connected." banner on the Smart Shop Map screen
  (visible in [`12-light-smart-shop-map.png`](audit-assets/visual-2026-05-06/12-light-smart-shop-map.png) and
  [`22-dark-smart-shop-map.png`](audit-assets/visual-2026-05-06/22-dark-smart-shop-map.png)).
- **Computed style (sampled live via Playwright):**
  - Class set: `border-amber-300/60 bg-amber-50 text-amber-700`
  - Background: `oklch(0.987 0.022 95.277)` ≈ `rgb(255, 251, 235)`
  - Text: `oklch(0.555 0.163 48.998)` ≈ `rgb(180, 83, 9)` (yellow-amber)
- **LAW conflict:** [`docs/LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) §
  Light-Mode Surface Rule explicitly forbids the legacy yellow-amber register
  (`rgba(254, 248, 220)` cream and `rgb(180, 83, 9)`-family text). The locked
  Premium Gold Palette mandates `rgba(196, 144, 65)` halo, `rgba(140, 82, 22)`
  bronze trim, and `rgba(252, 238-240, 204-208)` cream insets only.
- **Severity:** **HIGH** — Tailwind `amber-*` tokens leak the forbidden
  yellow-amber register straight into a user-visible alert that appears in
  both light AND dark mode. Probably exists at multiple call sites
  (likely a shared "DemoNotice" / "ExampleDataBanner" component).
- **Recommended action (Phase 9):** Find every `amber-50`, `amber-100`,
  `amber-300`, `amber-500`, `amber-700` Tailwind class in `src/app/components/`
  and migrate to a `bd-notice--bronze` or `bd-notice--champagne` utility class
  defined in `theme.css` using only the locked palette. Owner approval
  required because this is a behavior change at every call site.

### HSF-2 — Map provider attribution / dark-map dimness (observation, not violation)

- **Surface:** Smart Shop Map dark-mode tile area (visible in `22-dark-smart-shop-map.png`).
- **Observation:** The map tile container reads as nearly-pure-dark with a
  faint bronze corner glow. This is intentional (Apple Maps dark style), but
  the dimness against the also-dark workspace canvas means the map and the
  surrounding shell visually merge into one slab. Pinned shop card
  ("Express Auto Body") reads correctly (cool-blue glass over the dark map).
- **Severity:** LOW — not a LAW violation. Map clarity is a separate concern
  and is governed by `PLAN_MAP_MASTER.md`, not this audit.
- **No action required this pass.**

### HSF-3 — Light-mode landing/dashboard cool cards under-lifted (observation)

- **Surface:** `.bd-glass-card--landing` and `.bd-glass-card--dashboard`
  light-mode variants (visible in `11-light-dashboard-full.png`, the three
  Repair Activity cards).
- **Observation:** Cards read very close to the cool blue-gray workspace
  canvas; the bronze rim trim reads but the upper edge is faint. Pass 7
  shipped cream sub-rims for the dark variants only.
- **Severity:** LOW-MEDIUM — not a LAW violation, but Pass 7 left a parity
  gap between dark and light registers.
- **Captured by:** P3-A above.

---

## Recommendation — ranked follow-up edits, smallest blast radius first

> Owner decides which (if any) of these to take in Pass 8b / Pass 9.

1. **P3-C (lowest risk, lowest reward):** Add cream sub-rim 0.05 to
   `.bd-dashboard-panel--deep` for family consistency with the three accent
   variants. ~1 line of CSS. Visual delta minor. Family completeness only.
2. **P3-A (medium risk, medium reward):** Add cream sub-rim 0.06-0.08 to
   light-mode `.bd-glass-card--landing` + `.bd-glass-card--dashboard` (idle
   - hover, 4 blocks total). Closes the dark/light parity gap from Pass 7.
     ~16 lines of CSS. Visual delta noticeable on light dashboard report cards.
3. **HSF-1 (high risk, high reward — LAW remediation):** Migrate Tailwind
   `amber-*` classes off any `DemoNotice`/`ExampleDataBanner` component to
   a locked-palette `bd-notice--bronze` utility. Multiple call sites.
   Component edits + new theme utility. Closes a LIVE LAW violation in
   user-visible UI. **Recommend owner-authorized scoped pass with full
   call-site grep before edits.**
4. **P3-B (high risk, high reward):** Extend Pass 7 metallic doubled-edge
   to `.dark .bd-glass-card` base catch-all variant. Brings every base-glass
   card on the dark site into the same metallic family. Wide visual
   propagation — owner should confirm scope before action.
5. **P3-D (deferred — separate component sweep):** Audit inline `boxShadow`
   styles in `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`, and
   `AboutOpportunitySection.tsx`. Out of scope for any pure-CSS pass.

**Suggested next pass:** Take **P3-A** alone (cleanest light/dark parity
win, narrow blast radius, owner-visible improvement on the most-used
dashboard surface). Defer HSF-1 until a dedicated audit-and-migrate pass
is authorized — fixing it inline mid-design-pass risks dropping a call
site.

---

## Validation

- **Build at audit time:** PASS, 3.34s, clean tree.
- **Diagnostics:** None introduced (audit doc only, no code edits).
- **Spellcheck:** Domain-specific terminology only; matches existing audit doc
  vocabulary.
- **Mobile check:** Not performed this pass (audit scope = desktop screenshots
  only). Mobile audit recommended as a separate pass if owner directs — the
  Pass 7 metallic doubled-edge does adapt to mobile (CSS, not JS), so the
  same five visual signals should hold at 375px viewport.

---

## Pass 8 verdict

**Pass 6 + Pass 7 metallic chrome trim work is correctly scoped and shipped.**
All four signals checked across captured surfaces in both light and dark mode
read as PASS for the surfaces those passes touched. Two parity gaps and one
LAW violation found, all classified above with explicit blast-radius and
owner-decision notes.

No theme.css edits made. No component edits made. Audit doc + 4 screenshots
saved under `docs/audit-assets/visual-2026-05-06/`. Ready for owner review.
