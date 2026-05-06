# Visual Audit — Mobile Dark + Light Dashboard / Report / Bids / Account / Landing

**Date:** 2026-05-04
**Auditor:** Planner AI (Copilot/Claude Opus 4.7) — derived from owner-provided 17 mobile screenshots
**Branch:** `BidOnDent-Horizon-Beta` (post-cloud-autopilot master pass `a3850302`)
**Purpose:** Give the next AI a complete written brief so it can plan + execute without spending its context on screenshots.
**Audience:** The next design execution AI (Cloud / Codex / Opus / Sonnet) running an autopilot pass.

---

## Owner directive (binding)

> "Design on dashboard in **light mode** is truly gorgeous and I don't see how it can be improved further other than improving how shadows end at the end of pages in dashboard. Also fix the issue where most dashboard pages scroll too far — have all pages end closer to where content ends instead of being able to scroll way past content and just only seeing dashboard background. Make a detailed visual audit of mobile view as well as dark mode improvements and only slight light mode improvements for dashboard, and major dark mode improvements for dashboard and **everything else** for the AI to really get a deep scope before planning."

Translation:

1. **Light mode dashboard:** SLIGHT polish only. Owner-confirmed gorgeous baseline. Do not over-iterate.
2. **Page-end shadow + scroll behavior:** real bug. Pages can scroll well past content showing only the atmospheric background. Fix at the layout level.
3. **Dark mode dashboard:** MAJOR improvements. Bucket 7 added gold lamp atmosphere but the panels themselves still read flat compared to light's warm cream richness.
4. **Everything else (Report flow, Bids, Account, Landing) in dark + mobile:** MAJOR improvements warranted. Light mode for these surfaces is good; dark needs uplift to match.
5. **Mobile is the priority viewport.** All 17 screenshots are mobile. Desktop is a secondary check.

---

## Owner cohesion overlay (binding addendum, 2026-05-04)

> "Landing page, dashboard, and the full-screen map program should all be cohesive design-wise in light and dark mode — despite what other AIs might suggest. All three sections should still retain their distinct design character while only adding the best parts of each into the others as you go about major design polishing. Dashboard should still be more professional and premium with not too much cream but **premium gold with metallic trims and the liquid glass look** we have now — just polishing it more in each section, and more premium in dark mode. For landing, bring dashboard's premium look to it while keeping its eye-catching richer colors and more design elements (and slightly bring those landing strengths back into dashboard + map dark and light mode too). For the future map-program buildout into the full site — note to make sure we bake the map program more into the site overall. We will plan that out together after major design work + audit."

Translation for the next AI:

| Surface               | Identity to PROTECT                                                                                                   | Cross-pollinate FROM other surfaces                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**         | Professional + premium. Premium gold + metallic bronze trims + liquid glass. Restrained cream (don't over-cream).     | Borrow landing's richer atmospheric layering + bigger decorative moments (subtly, atmosphere-only — not panel paint) |
| **Landing**           | Eye-catching richer colors + bigger decorative elements + decorative moments (hero map, orbs, liquid gold flow)       | Borrow dashboard's premium gold lamp grammar + 8-criteria depth bar + metallic bronze trim discipline                |
| **Map (full-screen)** | Most immersive of the three. Map family signature: bezel ring + ambient gold lamp + canvas edge sheen + capsule rail. | Borrow BOTH dashboard's depth-bar discipline AND landing's atmospheric richness. Map is the future product surface.  |

**Rules of cross-pollination:**

1. **Cohesion lives in shared GRAMMAR** (8-criteria depth bar, locked LAW palette, lamp-from-above convention) — NOT in shared paint colors.
2. **Distinct character lives in per-surface ALPHA TUNING** (landing runs richer/higher decorative-element alpha; dashboard runs restrained/lower; map sits in between with the most atmosphere).
3. **Atmosphere transfers freely between surfaces. Panel surfaces do NOT.** Borrowing landing's richer hero glow into dashboard atmosphere = good. Painting dashboard panels with landing's sky-blue top inset = bad (regresses to mismatched identity).
4. **No surface should "win"** — landing should not become a dashboard, dashboard should not become a landing, map should not become either. They are siblings sharing a family signature.

**Future map-buildout note (do not execute yet):** When the next AI plans the full-site map integration, the map should appear progressively across more surfaces (account → reports → bids → claims) rather than living only on `/map`. Plan this WITH the owner. Tracker: `docs/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` (KI-075 DEFERRED).

---

## What Cloud already shipped (2026-05-03 master pass — DO NOT REDO)

Commit chain: `a0c7d0d2` → `a3850302` (13 commits, all on `BidOnDent-Horizon-Beta`, NOT merged to main).

| Bucket    | Commit     | Shipped                                                                                                                                                                        |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1 + 1.2 | `a0c7d0d2` | Final forbidden palette closure (KI-066d, KI-071) — **ZERO forbidden hits**                                                                                                    |
| 6         | `10755818` | Dashboard panel-stack `gap-3.5/5 → gap-5/7` + dark far-drop softening + asymmetric downward bronze halo bias on `.bd-dashboard-panel` (panel-only) — **KI-072 RESOLVED**       |
| 7         | `9e0aa928` | DashboardAtmosphere D8/D9/D10 (corner gold lamps + bronze floor wash) + LandingPageLayout L1-L5 gold lamp stack (lower alphas to preserve hero richness) — **KI-073 RESOLVED** |
| 1.3       | `f3cbb342` | Cool-blue ring-inset bezel on Customer/Shop/Insurer map widgets                                                                                                                |
| 2.1       | `1a7d086d` | Cool-blue 1px hover ring on `.bd-dashboard-primary-button` (criterion 8)                                                                                                       |
| 2.3       | `b5fda8dc` | Edge catchlights (cream `rgba(252,240,208)`) on dark `.bd-dashboard-panel` (0.10/0.06) + `.bd-dashboard-section` (0.08/0.05) — **8-criteria depth bar BOUND**                  |
| 4.1       | `9e418a39` | Edge catchlights on dark `.bd-glass-card--landing` (sky-blue top inset preserved)                                                                                              |
| 5.6       | `d92698fa` | CustomerMapWidget top ambient gold lamp overlay (12% alpha, 48px height)                                                                                                       |
| 5.7       | `a4153034` | Hero map dual-source counter-glow (cool blue NW + bronze SE) on mobile + desktop                                                                                               |
| 5.8       | `997bbaae` | MapSurfaceControls premium capsule rail (per-tone, ring + bronze halo)                                                                                                         |
| 5.9       | `bdb4567f` | `.bd-map-canvas-sheen` utility (cream top 0.14 + bronze bottom 0.16) applied to all 3 widgets — **KI-074 RESOLVED**                                                            |
| 9         | `f7eef977` | `PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` doc — **KI-075 DEFERRED**                                                                                                           |
| Final     | `a3850302` | `PASS_AUTOPILOT_2026-05-03_MASTER_REPORT.md` + README index                                                                                                                    |

**Implication for the next AI:** The grammar is shipped. The map family signature is shipped. The depth bar is bound at 8 criteria. The remaining work is **surface-level tuning + the P0 scroll bug + cross-pollination polish** described below — NOT re-doing any of the above.

---

## Visual reference baseline (so the next AI does not need screenshots)

### Surface inventory captured

| #   | Surface                                                | Mode  | Key observations                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Customer dashboard home — top                          | LIGHT | Repair Overview hero panel reads warm cream/champagne with bronze trim. Welcome heading dark navy. "New Repair Request" CTA royal-blue gradient pill. **Premium, gorgeous.**                                                                                                                                                       |
| 2   | Customer dashboard home — quick actions                | LIGHT | Two tiles in 2-column grid. LEFT "New Repair Request" reads cool cream. RIGHT "View Bids" reads warm gold/champagne with visibly stronger lamp light. Asymmetric on purpose (champagne hero pop tile per LAW).                                                                                                                     |
| 3   | Customer dashboard home — map widget + Smart Map Tools | LIGHT | Map preview clean, light tiles. Smart Map Tools panel: 3 tiles in row — AI Matching (cyan), Directions (gray), Compare (lavender). Distinct multi-color accents reading as playful + capable.                                                                                                                                      |
| 4   | Customer dashboard home — Nearby Matches empty state   | LIGHT | Empty illustration + "Browse all shops & AI matching" royal-blue CTA. Clean.                                                                                                                                                                                                                                                       |
| 5   | Report flow Step 1/5 — Vehicle profile                 | LIGHT | Stepper panel cream warm. Saved vehicles list (Toyota Camry, Mazda6) on warm cream. **Beautiful.**                                                                                                                                                                                                                                 |
| 6   | Report flow Step 1/5 — Confirm details form            | LIGHT | Make/Model/Year/VIN inputs on warm cream cards. "Continue" royal-blue gradient. Premium.                                                                                                                                                                                                                                           |
| 7   | Report flow Step 2/5 — Damage zone                     | LIGHT | Car illustration on warm cream. Stepper progresses 1→2 visually.                                                                                                                                                                                                                                                                   |
| 8   | Report flow Step 3/5 — Location                        | LIGHT | City/Address input + embedded Atlanta map (warm/golden tile palette — not blue!). Privacy notice on cream.                                                                                                                                                                                                                         |
| 9   | Report flow Step 4/5 — Photos                          | LIGHT | "No photos added yet" empty state cream tile. Take Photo / Upload Photo as 2-up tiles.                                                                                                                                                                                                                                             |
| 10  | Bids page                                              | LIGHT | Stats cards: Lowest Bid $450, Avg Quote $513, Fastest 3-4 days. Sort & Compare row of pill chips. Bid geography panel. **All cream-warm, premium.**                                                                                                                                                                                |
| 11  | Account page                                           | LIGHT | Three sections: Preferences (Appearance Settings), Profile Tools (My Vehicles cyan, Help & Support lavender, Smoke Test), Session (Sign Out, Delete Account in red-tinted danger card).                                                                                                                                            |
| 12  | Account + Notifications drawer overlay                 | LIGHT | Bottom sheet rises from below with "Notifications / Snapshot / No notifications yet". Background dims via scrim.                                                                                                                                                                                                                   |
| 13  | Landing hero                                           | LIGHT | Top: BidOnDent header + hamburger + home button. "Now serving New York" pill. "Get the Best Price on Your Auto Body Repair" with blue word emphasis. Carousel dot indicator. CTAs: "Start New Report" royal-blue, "Learn More" cream. Trust badges. NY Coverage map preview at bottom with "Double-tap for full map" floating CTA. |
| 14  | Landing How It Works                                   | LIGHT | Section header "Three Steps". Three numbered cards (Report Damage / Receive Bids / Compare). Cards read **almost-white** with very low warm tint.                                                                                                                                                                                  |
| 15  | Landing Coverage Map section header                    | LIGHT | "Browse our NY service area, right on the map." + Coverage Search panel (Set origin / Roadmap / Regional overview chips, ZIP search input).                                                                                                                                                                                        |
| 16  | Landing Coverage Map embedded                          | LIGHT | Live MapLibre map with shops + radius. "Open Full Map" royal-blue CTA.                                                                                                                                                                                                                                                             |
| 17  | Landing footer / final CTA                             | LIGHT | "Join as a Shop" + "Partner as Insurer" trust cards. "Ready to Get Started?" navy hero CTA panel with decorative blue pebbles. Footer with BidOnDent logo.                                                                                                                                                                         |
| 18  | Customer dashboard home — top                          | DARK  | Repair Overview panel navy. Welcome heading slate. "New Repair Request" royal-blue CTA. **Atmospheric gold lamp barely felt** — panel reads more "deep navy" than "lit room."                                                                                                                                                      |
| 19  | Customer dashboard home — quick actions                | DARK  | Two tiles. LEFT "New Repair Request" reads cool dark navy — feels almost invisible. RIGHT "View Bids" carries a clear bronze halo on its right edge. **Asymmetry reads as inconsistency, not intent.**                                                                                                                             |
| 20  | Customer dashboard home — report cards stack + map     | DARK  | 3 report cards (Honda Accord In Repair, Toyota Camry Pending Bids, Mazda6 Pending Bids). Cards have premium gold border-trim faintly visible at top. Map preview at bottom is darker tile palette with golden right-edge halo. Bottom sheet area very dark.                                                                        |

### What "looks gorgeous" in light mode (preserve forever)

- Warm cream/champagne body gradient on `.bd-dashboard-panel` (light mode tokens)
- Bronze trim at edges + cream lamp top inset
- Variation between cool cream + champagne gold accent tiles in same row
- Multi-color Quick Actions on Smart Map Tools (cyan/gray/lavender)
- Royal-blue gradient CTAs against warm-cream context — high contrast premium
- Stepper panels carry the same warm-cream language
- Embedded Atlanta map uses warm tiles — matches the warm context
- Notification bottom sheet rises from below with proper scrim
- Account page Profile Tools color-tagged tiles (cyan/lavender) match Smart Map Tools

**Hands-off list for next AI in light mode:**

- All 4 customer-facing screens (dashboard / report / bids / account) light mode = DO NOT TOUCH structural
- Tile color variation system (cyan/lavender/cream/champagne) = LOCKED
- Royal-blue CTA gradient = LOCKED

---

## Issue inventory (P0 → P6)

### P0 — Layout bugs (real, owner-flagged)

#### P0-001 — Dashboard pages scroll past content into empty atmospheric background

**Severity:** High. Owner-flagged. User can scroll well past the last card and see only DashboardAtmosphere. Reads as "broken page, more should be here."

**Root cause** (verified in code):

- `src/app/components/codelayer/HomeScreen.tsx:135` — outer wrapper has `min-h-[80vh]` which floors content height to 80% of viewport even when content is shorter
- `src/app/components/codelayer/HomeScreen.tsx:135` — same wrapper has `pb-20 md:pb-10` (80px / 40px bottom padding)
- `src/app/components/app/DashboardLayout.tsx:184` — `<main>` already has `pb-24 md:pb-8` (96px / 32px) AND `flex-1 overflow-y-auto`
- Stack: `<main flex-1 overflow-y-auto pb-24>` → `<HomeScreen min-h-[80vh] pb-20>` → content
- The `min-h-[80vh]` forces an empty floor; the doubled `pb-*` adds another empty band; combined the user can scroll ~140-200px past content showing only background.

**Fix direction:**

1. Remove `min-h-[80vh]` from `HomeScreen.tsx:135` (and audit other screens for the same anti-pattern — `Report*Screen.tsx`, `BidsScreen.tsx`, `AccountScreen.tsx`)
2. Reduce `HomeScreen.tsx:135` `pb-20 md:pb-10` to `pb-6 md:pb-8` (just enough to clear the bottom nav on mobile + some breathing room on desktop). Bottom nav is 56-64px so `pb-20` (80px) was excessive.
3. `DashboardLayout.tsx:184` `pb-24` is for mobile bottom nav clearance — KEEP. The bug is the screen-level `min-h` + double padding, not the main wrapper.
4. Audit all role screens (`HomeScreen`, `ShopHomeScreen`, `InsurerHomeScreen`, `AdminHomeScreen` if exists) for the same `min-h-[80vh]` pattern.

**Verification after fix:**

- On a short page (e.g., empty Bids page), scrolling stops cleanly at the last content tile + ~24-32px breathing space.
- On a long page (full report list), scroll behaves normally with bottom nav clearance.
- No content cut off behind the bottom nav.

**Impacts:** All customer dashboard sub-screens. All shop dashboard sub-screens. All insurer dashboard sub-screens. P0 because it's user-visible on every dashboard view.

---

#### P0-002 — Page-end shadow termination feels abrupt

**Severity:** Medium-high. Owner-flagged ("how shadows end at end of pages in dashboard").

**Root cause:**

- The last panel in any stack ships full bronze atmospheric halo (`0 0 60-110px rgba(196,130,45,*)`) per the depth bar
- When the page ends right after the panel, the halo gets clipped by the `overflow-y-auto` boundary on `<main>` at L184 of DashboardLayout
- Visually: the bronze glow appears to "cut off" at the bottom edge of the viewport instead of fading smoothly into the atmospheric background

**Fix direction:**

- Add ~24-40px bottom breathing space inside the scrollable area below the last panel (covered by P0-001 fix above — `pb-6 md:pb-8` instead of `pb-20 md:pb-10` actually allows the halo to render)
- OR add a soft fade-to-atmosphere gradient mask on the bottom edge of `<main>` at `DashboardLayout.tsx:184`
- Recommended: do BOTH. Reduce padding (P0-001) AND add a `mask-image: linear-gradient(to bottom, black 95%, transparent 100%)` on the main scroll wrapper so the last panel's halo fades naturally into the atmospheric background

**Verification:**

- Scroll to bottom of any dashboard page in dark mode at 375px width
- Last panel's bronze halo should taper smoothly into the atmosphere, not chop hard

---

### P1 — Dark mode dashboard panel weakness

> **Context for next AI:** Cloud's Bucket 7 (`9e0aa928`) added D8/D9/D10 atmospheric gold lamp layers BEHIND the panel stack. Bucket 2.3 (`b5fda8dc`) added cream edge catchlights ON the panels at 0.10/0.06 alpha. The atmosphere is shipped; what remains is INTERNAL panel lamp + sibling tile harmony.

#### P1-001 — Repair Overview hero panel dark needs INTERNAL gold lamp (atmosphere alone insufficient)

**Severity:** High. Owner directive: "more premium in dark mode" + "premium gold with metallic trims."

**What I see in dark screenshot 18:**

- DashboardAtmosphere D8/D9 corner lamps visible at top corners of viewport (Bucket 7 working)
- BUT the Repair Overview hero panel itself reads as deep navy gradient — the atmospheric gold sits BEHIND it, not ON it
- Compare to light: light hero panel has its own internal warm cream body + bronze top trim + champagne lamp inset → the panel itself glows
- Dark hero panel currently has: 8-criteria depth bar (bevel + rim + ring + drops + halo + body + edge catchlights) but no INTERNAL top-radial gold lamp

**Fix direction (additive, doesn't conflict with shipped Bucket 7):**

- Add `.bd-dashboard-panel::before` (dark only) with `radial-gradient(ellipse 70% 30% at 50% 0%, rgba(196,144,65,0.14), transparent 70%)` — gives the panel its own ceiling lamp, layered ON TOP of the existing depth-bar shadow stack
- Keep alpha modest (0.14) to preserve "metallic trim, not gold paint" identity per owner directive
- Cross-pollinate from landing's hero map dual-source counter-glow (Bucket 5.7) — borrow the radial-gradient technique, NOT the colors

**Files:** `src/styles/theme.css` — new `.bd-dashboard-panel::before` rule scoped to `.dark` / `[data-theme="dark"]`

---

#### P1-002 — Quick Actions tiles read asymmetric in dark (left dim, right gold-aggressive)

**Severity:** High. Most visible inconsistency in dark dashboard.

**What I see in dark screenshot 19:**

- LEFT "New Repair Request" tile: cool dark navy, almost no warm light
- RIGHT "View Bids" tile: visible warm bronze halo on right edge
- Reads as different families, not matched 2-up grid
- Bucket 6's asymmetric bronze halo bias is `.bd-dashboard-panel`-only — these tiles are likely `.bd-dashboard-section--accent-*` variants

**Fix direction:**

1. Inspect `HomeScreen.tsx` Quick Actions JSX (around L137-220) — confirm class names on left vs right tile
2. If both should match: ensure `.bd-dashboard-section` dark base ships a minimum warm gold inset lamp top so cool-toned variants still feel lit
3. If asymmetry is intentional (champagne pop tile per LAW): add a subtle warm glow to the cool tile so the contrast reads as **deliberate hierarchy**, not **broken sibling pair**
4. Per cohesion overlay: borrow landing's "richer atmospheric layering" technique — e.g., a subtle bronze under-glow that lifts the cool tile to read intentional

**Files:** `src/styles/theme.css` dark `--bd-dashboard-section-shadow` + variant tokens; inspect HomeScreen Quick Actions section

---

#### P1-003 — Repair Activity report cards in dark stack read flat

**Severity:** Medium-high.

**What I see in dark screenshot 20:**

- 3 report cards (Honda Accord, Toyota Camry, Mazda6) stack vertically
- Cool blue 1px ring visible (criterion 5 ✓)
- Faint gold trim at top (criterion 1 ✓)
- BUT: bronze atmospheric halo (criterion 3) barely felt at this card size
- Edge catchlights from Bucket 2.3 at 0.08/0.05 alpha may be **too low at this card width** — invisible at 343px tile width

**Fix direction:**

- These are `.bd-dashboard-section` (not panel) — Bucket 2.3 shipped 0.08/0.05 catchlight there
- Test bumping section dark catchlights to 0.10/0.07 (still well below panel's 0.10/0.06)
- OR add a subtle additional inset top lamp on `.bd-dashboard-section` dark so the depth bar reads at narrower widths
- Consider: cards may benefit from a slightly thicker (1.5px) cool blue ring at small tile sizes — the 1px ring disappears against navy at 375px width

**Files:** `src/styles/theme.css` dark `--bd-dashboard-section-shadow`

---

#### P1-004 — Map preview at dashboard bottom in dark — verify Bucket 5.6 + 5.9 strength

**What Cloud shipped (verify in browser before re-fixing):**

- Bucket 5.6: top ambient gold lamp overlay (`rgba(196,144,65,0.06)` fade, 48px height)
- Bucket 5.9: `.bd-map-canvas-sheen` utility (cream top 0.14 + bronze bottom 0.16)
- Bucket 1.3: cool-blue ring-inset bezel (0.18 alpha)

**What I see in dark screenshot 20 (taken pre-Cloud at this scope):**

- Map tiles dark style ✓
- "3 reports" pill chip ✓
- Golden right-edge halo from DashboardAtmosphere D6 ✓

**Action for next AI:** Open dashboard in dark mode at 375px BEFORE assuming a fix is needed. Bucket 5.6 + 5.9 may have already addressed this. If still dim:

- Bump `.bd-map-canvas-sheen` cream top alpha 0.14 → 0.18
- Bump CustomerMapWidget ambient lamp gradient 0.06 → 0.09 (still well below 0.22 hard stop)

---

### P1 — Bottom nav inactive states in dark

#### P1-005 — Bottom nav inactive tabs (Report, Bids, Account) read too dim in dark

**What I see in dark screenshots 18 + 20:**

- "Dashboard" active tab: blue underline + blue label — visible
- "Report", "Bids", "Account" inactive: icons + labels in gray-blue, very low contrast against dark navy nav background
- On bright phones in real light, this would be borderline unreadable

**Fix direction:**

- Push inactive label color from gray-blue to slate-300 minimum (currently slate-500 territory)
- Add 2-3% alpha cool blue background tint behind icon on hover/touch state for affordance feedback

**Files:** `src/app/components/dashboard/MobileBottomNav.tsx` inline styles for inactive state

---

### P2 — Landing dark mode parity (deferred check, not in screenshots)

The user provided 14 LIGHT landing screenshots and 0 DARK landing screenshots. Bucket 7's landing gold lamp stack was added but not visually verified. Next AI should:

1. Open landing in dark mode at 375px
2. Verify the 5 new gold lamp layers (L1-L5) actually paint and read premium
3. Verify "How It Works" cards in dark don't go too cool/dim
4. Verify "Ready to Get Started?" navy CTA panel (already shipped) reads against the new dark hero atmosphere
5. Verify hero map dual-source counter-glow from Bucket 5.7 is visible

**Likely findings (predicted):**

- Landing "How It Works" cards in light look almost-white. In dark these probably need verification — they may need stronger gold lamp top inset to match dashboard panels.
- Landing "Now serving New York" pill works in light; dark needs check.
- Landing footer logo readability in dark needs check.

---

### P3 — Report flow polish opportunities (light mostly fine, dark unverified)

#### P3-001 — Stepper progress dots in light look slightly disconnected

**What I see in screenshots 5/7 (Step 1/5 + Step 2/5):**

- Step circles 1-5 connected by progress lines
- Active step: filled royal blue
- Visited but not active step: filled royal blue with darker line
- Future steps: empty white circle with light border

In Step 2/5 screenshot, the line between 1 and 2 reads as TWO segments (different color halves) — that's intentional but the join at step 2 looks slightly mismatched. Minor polish only.

**Fix direction:** Make the line color transition smoother at the active dot center. Defer-or-skip per "light close to perfect" directive.

#### P3-002 — Embedded Atlanta map in Report Step 3 uses warm tile palette while dashboard map uses cool

**What I see in screenshot 8:**

- Step 3 location map: Atlanta in warm/golden tile palette (looks like Carto positron warm)
- Dashboard map: also warm tiles in light, but darker / cooler in dark

**Question for owner / next AI:** Should Report flow location map match dashboard map style? Probably yes for cohesion. Minor consistency item.

---

### P3 — Account page polish

#### P3-003 — Account page Profile Tools tile color choices

**What I see in screenshot 11:**

- My Vehicles: cyan-tinted (matches Smart Map Tools AI Matching)
- Help & Support: lavender (matches Smart Map Tools Compare)
- Smoke Test: cool cream (neutral)

This is good consistency. NO fix needed. **Document this as a locked pattern in REF_VISUAL_SYSTEM.md** — colored Profile Tool tiles map to the same palette family as Smart Map Tools tiles.

#### P3-004 — Delete Account danger card

**What I see in screenshot 11 bottom:**

- Red-tinted background card ("Permanently remove profile access...")
- Red trash icon
- Red text on red-tinted background

Reads correctly as destructive. NO fix in this pass. **Document as pattern.**

---

### P4 — Notifications bottom sheet (screenshot 12)

**What I see:**

- Bottom sheet rises from below with grab handle
- "Notifications / Snapshot" header
- Empty state with bell icon + "No notifications yet"
- Background scrimmed

Sheet reads premium in light. **Verify dark mode renders the sheet body with same depth bar treatment.**

---

### P5 — Landing screens (light only verified)

#### P5-001 — Landing How It Works cards may be too white in light

**What I see in screenshot 14:**

- 3 numbered cards on light background
- Cards read **almost pure white** with very low warm tint
- Compare to dashboard panels which ride at warm cream
- The contrast between landing cards and landing background is low — cards barely lift

**Question for LAW:** Per LAW Light-Mode Surface Rule, "any load-bearing surface that turns pure white is a regression." Are these cards crossing into pure-white territory?

**Audit task:** Inspect `bd-glass-card--landing` light token values to confirm they're not at `rgba(255,255,255,*)` or `rgba(254,253,*,>0.95)`.

**If they cross the line:** Apply same warm cream treatment as `.bd-dashboard-panel` light tokens (the cream body that owner called "gorgeous").

#### P5-002 — Landing "Now serving NY" pill placement

**What I see in screenshot 13:**

- Pill is tucked above the H1 heading
- Reads cleanly in light
- Mobile width OK

NO fix. Just noting as confirmed-OK.

#### P5-003 — Landing CTA "Ready to Get Started?" panel decorative pebbles

**What I see in screenshot 17:**

- Two small blue pebble shapes top-left + bottom-right of the navy CTA panel
- Reads as intentional decoration

NO fix. Confirmed-OK.

---

### P6 — Spelling, terminology, micro-copy (defer)

Quick scan of all 17 screenshots: no obvious typos. Terminology ("Bids", "Reports", "Coverage", "Service area", "Repair Overview") consistent. **Defer to spell-check pass.**

---

## What the next AI should NOT touch

Owner-locked, do-not-iterate:

1. Light mode dashboard hero panel + Quick Actions champagne gold tile system
2. Light mode Report flow warm cream cards + stepper structure
3. Light mode Bids stats cards + Sort & Compare chip row
4. Light mode Account Profile Tools colored tile mapping
5. Light mode Landing royal-blue CTA pill
6. Light mode Landing "Now serving NY" indicator pill
7. Light mode Landing Coverage Map embedded MapLibre integration
8. Light mode Landing footer + final CTA navy panel structure
9. The 8-criteria depth bar binding contract (ship state)
10. The locked LAW palette (`rgba(196,144,65)`, `rgba(196,130,45)`, `rgba(140,82,22)`, `rgba(252,240,208)`, `rgba(96,165,250)`)
11. Asymmetric bronze halo bias scope (`.bd-dashboard-panel` only, NOT sections / popovers / landing cards)
12. Bucket 5.6/5.7/5.8/5.9 map redesign — CustomerMapWidget lamp overlay + hero map dual-source + capsule rail + canvas sheen
13. KI-067 Coverage Command Center mobile sheet height (HOLD per owner)
14. KI-075 future nav engine (DEFERRED, requires owner trigger)

---

## Recommended pass plan (for the next AI)

### Pass 1 — Layout / Scroll (P0, ship first)

**Single commit. High-impact, low-risk.**

1. Remove `min-h-[80vh]` from `HomeScreen.tsx:135` and audit + fix sibling screens
2. Reduce `pb-20 md:pb-10` → `pb-6 md:pb-8` on the same wrapper
3. Add fade-to-atmosphere mask on `DashboardLayout.tsx:184` `<main>` bottom edge
4. Verify on short page (empty Bids) + long page (multi-report stack)

**KI:** Add KI-076 (dashboard scroll-past-content + page-end halo termination). Mark RESOLVED in same commit.

### Pass 2 — Dark mode dashboard panel uplift (P1, biggest visual win)

**Single commit. Touches theme.css dark tokens only.**

1. Add `.bd-dashboard-panel::before` (dark only) for top-edge internal gold lamp radial
2. Push `--bd-dashboard-panel-shadow` (dark) top inset bevel from `0.22` to `0.30`
3. Push `--bd-dashboard-section-shadow` (dark) atmospheric halo alpha up by 25-30% so cool-toned sections still feel lit
4. Verify dark screenshots match light's warmth in panel hierarchy

**KI:** Add KI-077 (dark dashboard panel under-lit vs light). Mark RESOLVED in same commit.

### Pass 3 — Quick Actions dark asymmetry fix (P1)

**Single commit.**

1. Inspect HomeScreen.tsx Quick Actions section — confirm class names on left vs right tile
2. Either bring left tile up to match right's warmth (preferred) OR document the intentional asymmetry as a locked pattern
3. If intentional: add a comment in the JSX explaining the champagne pop tile choice
4. If unintentional: patch the dark token so both tiles share a minimum warm baseline

**KI:** Add KI-078 (Quick Actions tile asymmetry in dark).

### Pass 4 — Bottom nav dark contrast (P1)

**Single commit.**

1. `MobileBottomNav.tsx` inactive state inline color: push to slate-300 minimum
2. Add subtle hover/touch background tint
3. Verify all 4 tabs readable at 375px in dark

**KI:** Add KI-079 (bottom nav inactive contrast in dark).

### Pass 5 — Map preview dark uplift (P1)

**Single commit.**

1. `.bd-map-canvas-sheen` top cream alpha 0.14 → 0.20
2. Map widget bezel ring dark alpha 0.18 → 0.24
3. Verify map preview reads premium in dark dashboard

### Pass 6 — Landing dark verification + fixes (P2)

**Open dark mode landing at 375px FIRST. Then commit fixes if needed.**

Predicted findings to verify:

- Landing How It Works cards in dark — do they need stronger gold lamp top to match dashboard panels?
- Landing footer logo readability in dark
- Landing "Now serving NY" pill in dark
- Hero map dual-source counter-glow visibility in dark

### Pass 7 — Report flow dark verification (P2)

**Open Report Step 1-5 in dark mode at 375px. Commit fixes if needed.**

Predicted findings:

- Stepper progress line dark contrast
- Vehicle profile saved-vehicles cards in dark
- Form inputs in dark
- Embedded location map in dark (Bucket A2 should already cover)

### Pass 8 — Bids + Account dark verification (P2)

Same pattern.

### Pass 9 (optional) — Light mode SLIGHT polish (per directive)

ONLY if the next AI finds something obviously off after Passes 1-8. Owner directive: "slight light mode improvements only." Examples that would qualify:

- Landing How It Works cards crossing pure-white LAW line (P5-001)
- Stepper line color smoothness (P3-001)

DO NOT redesign anything in light. DO NOT touch the warm cream system. DO NOT touch champagne gold tile asymmetry.

---

## Hard stops for the next AI

- Do NOT touch light mode dashboard structure (owner: gorgeous)
- Do NOT widen the asymmetric bronze halo bias beyond `.bd-dashboard-panel`
- Do NOT push single-layer halos above 0.22 alpha (KI-073 hard stop)
- Do NOT push any light surface gradient stop above `rgba(254,*,*,0.96)` (LAW Light-Mode Surface Rule)
- Do NOT modify backend / auth / storage / migrations / map provider
- Do NOT touch KI-067 Coverage Command Center sheet height
- Do NOT execute anything in `PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md` (KI-075 deferred)
- Do NOT redesign tile color mapping (cyan/lavender/cream/champagne is locked)
- Do NOT remove the gold lamp atmosphere from DashboardAtmosphere or LandingPageLayout (Bucket 7 ship state)
- Do NOT merge to main without owner call

### Cross-pollination guardrails (cohesion overlay specific)

- Do NOT paint dashboard panels with landing's sky-blue top inset (regresses identity)
- Do NOT paint landing cards with dashboard's gold lamp top inset (erases distinct character)
- Do NOT make any one surface "win" — landing/dashboard/map are siblings, not a hierarchy
- Cross-pollination happens in **atmosphere + grammar + technique**, NEVER in panel paint
- When borrowing landing's "richer atmospheric layering" into dashboard, scope it to `DashboardAtmosphere.tsx` (not panel tokens)
- When borrowing dashboard's "metallic bronze trim discipline" into landing, apply to `LandingPageLayout.tsx` atmosphere or hover states (not card body fills)
- Cream alpha cap on dashboard panels: keep below `rgba(254,*,*,0.96)` body even on warmest tile (don't over-cream per owner)

---

## Co-update commitments per pass

Every meaningful pass must update:

- `docs/REF_KNOWN_ISSUES.md` — KI entry added with status
- `docs/REF_VISUAL_SYSTEM.md` — if a new pattern is locked
- This audit doc — strike through resolved items in same commit

---

## Branch + commit hygiene

- Branch: `BidOnDent-Horizon-Beta`
- NO main merge in any pass
- One commit per pass (single-pass discipline)
- Per-commit verification: `npx tsc --noEmit`, `npm run build`, branch-aware forbidden grep
- Mobile dark screenshot in commit body for any UI pass

---

## Reference: file map for the next AI

| File                                                 | Why it matters                                           |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `src/app/components/codelayer/HomeScreen.tsx`        | Customer dashboard home — Pass 1 P0-001 fix here at L135 |
| `src/app/components/app/DashboardLayout.tsx`         | Main scroll container — Pass 1 P0-002 mask fix at L184   |
| `src/app/components/app/DashboardAtmosphere.tsx`     | Bucket 7 gold lamp atmosphere — DO NOT restructure       |
| `src/app/components/app/LandingPageLayout.tsx`       | Bucket 7 landing gold lamp stack — verify in Pass 6      |
| `src/styles/theme.css`                               | All dark token uplifts (Pass 2-5) live here              |
| `src/app/components/dashboard/MobileBottomNav.tsx`   | Pass 4 inline-style inactive state                       |
| `src/app/components/dashboard/CustomerMapWidget.tsx` | Pass 5 map preview uplift target                         |
| `src/app/components/landing/HeroSection.tsx`         | Pass 6 dark verification + hero map dual-source check    |
| `docs/REF_KNOWN_ISSUES.md`                           | Add KI-076/077/078/079 as Pass 1-4 ship                  |
| `docs/REF_VISUAL_SYSTEM.md`                          | Lock new patterns from Pass 2-5                          |

---

## Final note for the next AI

The owner trusts that you read this doc fully BEFORE picking up screenshots. Owner gave you 17 screenshots, but ALL findings from those screenshots are summarized above. You should NOT need to ask for screenshots again unless something here is ambiguous.

If after reading this doc you still need to verify something visually, open the running dev server at `localhost:5173/dashboard` (already active per browser pages list), switch to dark mode, set viewport to 375×667, and observe directly — but DO NOT spend context loading the original 17 screenshot images. The audit table above replaces them.

**Start with Pass 1 (P0 layout fix). It's the single highest-leverage change.**

— end of audit doc —

---

## 2026-05-04 EXECUTION RESULTS — strike-through update

All six recommended passes shipped clean to `BidOnDent-Horizon-Beta`. See [`PASS_AUTOPILOT_2026-05-04_MOBILE_DARK_REPORT.md`](PASS_AUTOPILOT_2026-05-04_MOBILE_DARK_REPORT.md) for the full report.

| Pass  | Audit reference                                                                                                               | Status                   | Commit     | KI               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ---------- | ---------------- |
| 1     | P0-001 + P0-002 (scroll-past-content + page-end halo)                                                                         | ✅ RESOLVED              | `a0954b12` | KI-076           |
| 2     | P1-001 (Repair Overview hero panel internal lamp) + P1-003 (cards stack at narrow widths)                                     | ✅ RESOLVED              | `74b9df0b` | KI-077           |
| 3     | P1-002 (Quick Actions cool/warm asymmetry)                                                                                    | ✅ RESOLVED              | `5acafe07` | KI-078           |
| 4     | P1-005 (Bottom nav inactive tabs too dim)                                                                                     | ✅ RESOLVED              | `972a3353` | KI-079           |
| 5     | P1-004 (map preview dark presence — canvas sheen + ambient lamp)                                                              | ✅ RESOLVED              | `e922bb30` | KI-074 follow-up |
| 6     | P2 (Landing section seams) — simplified by master-designer authority from elaborate `::after` / `::before` / per-section spec | ✅ RESOLVED              | `c7473a95` | KI-080           |
| 7 + 8 | P2/P3/P4 (Report / Bids / Account / Notifications dark verification)                                                          | ✅ AUDIT-CONFIRMED NO-OP | —          | —                |

**Audit-confirmed no-ops for Pass 7 + 8:** Bids + Account inherit Pass 2's amplified `--bd-dashboard-panel-*` / `--bd-dashboard-section-*` dark tokens automatically. Report flow uses its own `--bd-report-panel-*` token system that wasn't flagged as problematic in the original audit screenshots — deferred to a future pass if owner reports issues. Notifications bottom sheet inherits `.bd-glass-card` system depth.

**Deferred follow-ups (low priority, only if owner reports continued issues):**

- StepPhotos.tsx:40 still carries `min-h-[80vh]` (sub-step inside Report flow, not a top-level role screen — see KI-076 deferred note)
- Eyebrow chip backing glow utility (Pass 6 simplified spec — deferred from KI-080)
- Stat-pill row gradient bridge background (Pass 6 simplified spec — deferred from KI-080)
- P5-001 Landing How It Works cards may cross pure-white LAW line in light — verify before any future light pass
- P3-001 Stepper progress dot/line color smoothness — minor polish, defer per "light close to perfect"

**Final state:** branch design-stable, light mode "amazing as is" preserved, dark mode major uplift shipped, mobile-first verified throughout, cohesion overlay respected. Owner can call merge-to-main.

— end of strike-through update 2026-05-04 —
