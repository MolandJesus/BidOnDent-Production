---
title: HANDOFF — Visual Master Prompt for Claude Opus 4.7
date: 2026-05-03
target_model: Claude Opus 4.7
authority: HANDOFF / execution prompt; obey LAW and REF first
status: ACTIVE — paste into a fresh Opus design/build chat
supersedes:
  - docs/archive/2026-05-03-visual-handoffs/HANDOFF_VISUAL_AUDIT_PROMPT_SONNET_2026-05-03.md
  - docs/archive/2026-05-03-visual-handoffs/HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03.md
  - docs/archive/2026-05-03-visual-handoffs/HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03_V1V2V3_SHIPPED.md
companion_docs:
  - docs/REF_VISUAL_SYSTEM.md
  - docs/PLAN_VISUAL_MASTER_2026-05-03.md
  - docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md
  - docs/REF_AI_COLLABORATION_PROTOCOL.md
  - docs/REF_AI_BROWSER_NAVIGATION.md
---

# Opus 4.7 Visual Master Prompt — 2026-05-03

This is the current clean handoff for a fresh Claude Opus 4.7 chat. It folds in:

- the owner directives from the latest multi-AI thread
- the shipped V1/V2/V3 visual hardening work
- the later shell/shadow/map-dialog pass
- the mobile screenshot audit
- the newly discovered LAW-vs-CSS palette drift
- the “improve only, do not whitewash” anti-regression doctrine

Do not use the archived Sonnet/Opus one-off handoffs as active prompts. They are historical evidence only.

---

## Prompt To Paste Into Opus

You are Claude Opus 4.7 working in:

`/Users/molalignmeagher/BidOnDent GitHub Repository/BidOnDent-Production`

## Mission

Do a controlled premium visual polish pass on BidOnDent’s landing page, dashboard, mobile viewport experience, and fullscreen coverage map. This is **not** a redesign. This is **improve only**.

The current design is already owner-approved and premium. Your job is to make it look even better while preserving what works:

- richer premium gold liquid-glass lighting
- deeper but softer 3D shadow hierarchy
- better mobile viewport ergonomics
- stronger mobile map-first focus
- cleaner material consistency across light and dark mode
- no whitening, no flattening, no generic SaaS reset

Think like a careful senior product designer implementing production CSS/TSX: keep the existing premium identity, then refine the parts that are slightly inconsistent, crowded, sheet-first, or not yet as rich as the strongest surfaces.

## Required Reading

Read these in order before editing:

1. `docs/LAW_PROJECT_RULES.md`
2. `docs/LAW_HARDENING_PLAN.md`
3. `docs/REF_AI_COLLABORATION_PROTOCOL.md`
4. `docs/REF_SYSTEM_STATE.md`
5. `docs/REF_VISUAL_SYSTEM.md`
6. `docs/REF_KNOWN_ISSUES.md`
7. `docs/REF_AI_BROWSER_NAVIGATION.md`
8. `docs/MOLANDJESUS_DESIGN_DECISIONS.md`
9. `docs/PLAN_VISUAL_MASTER_2026-05-03.md`
10. `docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md`
11. `docs/PLAN_MAP_MASTER.md`
12. Skill: `~/.claude/skills/bd-design-identity/SKILL.md`
13. Skill: `~/.claude/skills/mola-ai-relay-protocol/SKILL.md`

Archived docs under `docs/archive/2026-05-03-visual-handoffs/` are historical evidence only. Do not treat their older recommendations as active if they conflict with LAW/REF/current screenshots.

## Current Shipped State

Recent visual work already shipped:

- `7dfd5cef` — V1 trust + mobile landing critical fixes.
- `e9fb687a` — V2 hero signature: mobile map presence + desktop hero map immersion.
- `366e8442` — V3 landing + dashboard liquid-glass premium lift.
- `02e5668b` — sidebar/header/search shell brought into locked premium gold language.
- `740c4e0c` — LAW locks the premium bronze/champagne gold palette.
- `ea0c796a` — atmospheric shadow falloff, hero-map double-tap full-map gate, CoverageMapDialog premium gold/cool-blue pass.
- `c7cd744e` — backend storage hydrateReport fail-closed fix. Do not touch backend for this visual pass.
- `d574fdc6` — design polish queue for this Opus pass.

The important behavioral win: the hero map should open the fullscreen landing coverage map **only** on mouse double-click or finger double-tap, not on single tap. Preserve this.

## Owner Directives

Treat these as live owner constraints:

- “Improve and only improve.”
- “Do not take away from the already very premium design in both light and dark mode.”
- “I want this looking even better than it is now.”
- Landing page should stay more eye-catching, with stronger solid gold / warm narrative areas where appropriate.
- Dashboard should stay professional: cool blue liquid glass, premium gold lighting, rim, trim, shadow, and sheen. Do **not** turn the dashboard into a theatrical marketing page.
- Mobile view needs serious visual audit and layout polish for user-friendliness.
- Mobile map focus matters. The map should feel central, not buried.
- Fullscreen map should be gated by double-tap/double-click.
- Background polish should add premium gold liquid-glass lighting and spatial texture **without whitening** the app.
- If another AI says “add polish,” do not bolt more glow on top of stale values. First align with LAW.

## Non-Negotiable Visual Law

### Light Mode

Light mode is **not** white SaaS. It is:

- cool misty blue-gray canvas
- layered cool blue/cyan/indigo glass
- cream/champagne premium panels
- bronze/champagne gold lamp-light from above
- warm hero/card accents where the screen calls for hierarchy

Do **not** introduce pure white load-bearing surfaces:

- no pure white panel bodies
- no pure white card bodies
- no pure white dropdowns/popovers
- no pure white modal/sheet bodies
- no pure white bottom nav bodies
- no pure white inset highlights on premium surfaces

Tiny icon plates may be audited case-by-case, but anything structural must use the LAW palette.

### Locked Gold Palette

Use the owner-approved bronze/champagne palette from `LAW_PROJECT_RULES.md`:

- top/corner lamp halo: `rgba(196, 144, 65, ...)`
- deeper outer/far warm halo: `rgba(196, 130, 45, ...)`
- bronze trim: `rgba(140, 82, 22, ...)`
- cream/champagne inset light: `rgba(252, 238-240, 204-208, ...)`
- warm inner depth: `rgba(110, 70, 18, ...)`

The previous yellow-amber register is forbidden for new work and should be replaced where found:

- `rgba(220,165,90,*)`
- `rgba(220,140,50,*)`
- `rgba(254,248,220,*)`
- `rgba(160,95,25,*)`

### Gold Means Light, Not Paint

Use gold as:

- top bevel
- bottom warm rim
- edge catchlight
- focus halo
- hover sheen
- corner lamp bloom
- atmospheric falloff
- section transition warmth

Do not use gold as:

- primary CTA fill
- full dashboard card paint
- body text
- noisy wallpaper
- semantic replacement for blue action/route color

Blue remains product/action/route/selection. Gold is premium light and marketplace warmth.

## Preserve List

Do not dismantle:

- dark dashboard navy-lit-by-gold-lamp identity
- light dashboard cool blue-gray + champagne/bronze liquid-glass identity
- landing dark gold/blue cinematic bands
- landing hero map strip and double-tap full-map hint
- full-map dialog premium gold/cool-blue shell
- dashboard sidebar/header/search premium shell
- mobile bottom tab navigation
- `bd-*` utility system and intentional sibling systems
- report wizard core flow
- MapLibre provider and map data model
- auth/storage/backend invariants
- current role hierarchy and hardening guardrails

## Known P0 Before Adding New Polish

Read `docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md` P0 and `docs/REF_KNOWN_ISSUES.md` KI-066.

Before adding new visual layers, sweep and correct remaining old palette drift in active UI code:

- `ProfileDropdown.tsx` inline shadow stacks
- `NotificationCenter.tsx` icon plate shadow stacks
- `theme.css` light-mode dashboard panel/section top trim and corner lamp rules
- repository-wide stale values matching:
  - `rgba(220, *165, *90`
  - `rgba(220, *140, *50`
  - `rgba(160, *95, *25`
  - `rgba(254, *248, *220`
  - load-bearing `rgba(255, *255, *255, *0.[789]` insets/surfaces

Treat this as LAW alignment, not redesign. Use before/after screenshots so the app remains visually equivalent or better, just more compliant with the locked palette.

## Desktop Visual Audit Synthesis

What is working:

- Dark dashboard is very strong. Preserve the navy/gold material.
- Light dashboard now has premium depth and warmth. Do not flatten it.
- Account, Bids, Report, and Dashboard pages have a clear visual identity.
- Landing dark mode solid gold/warm narrative bands are eye-catching and should remain.
- Fullscreen map dialog is much more aligned with product identity after the premium gold/cool-blue pass.

What still needs polish:

- Some dashboard overlays and inline shadows still use the older yellow-amber/white register.
- Some light-mode dashboard cards feel slightly heavy in border/shadow, especially dense operational pages. Refine contrast; do not reduce richness.
- Hierarchy between hero panels, ordinary panels, list rows, empty states, and CTAs can be tightened.
- The profile dropdown and notification center need final material consistency after palette correction.
- Dashboard gold should read as professional lighting, not a marketing wash.
- Landing section transitions can become more cinematic without adding clutter.
- Coverage map empty/out-of-region states should feel intentionally premium, not just empty.

## Mobile Visual Audit Synthesis

Mobile is the primary real-world surface. Users may be standing near a damaged car, in a browser, with system chrome eating vertical space.

What is working:

- Mobile dashboard header brand + notification + avatar is compact and recognizable.
- Bottom tab nav is the correct pattern. Keep it.
- Welcome repair overview card is strong.
- Smart Map Tools + Nearby Matches card system is promising and premium.
- Account mobile page styling is strong.
- Mobile landing hero, CTA, and map strip are directionally good.
- Fullscreen map light and dark shells now match the premium identity.

What needs polish:

- Mobile viewport economy: header + bottom nav + Safari toolbar leave little room. Add safe-area-aware spacing and avoid hidden CTAs.
- Mobile dashboard should become more map-first. The map/Smart Map Tools should appear earlier or have a compact top presence after the welcome card.
- Quick Actions mobile carousel needs stronger affordance or a cleaner 2-card visible layout while preserving the existing premium treatment.
- Report flow mobile header/progress is too tall. The active input should appear sooner.
- Bids empty state is beautiful but has dead space. Tighten rhythm or add subtle truthful map/trust context without fake data.
- Account lower settings need scan rhythm and bottom-safe padding.
- Notifications/profile overlays should fit mobile comfortably; consider mobile-only top sheets/bottom sheets if popovers feel cramped.
- Landing mobile needs section bottom spacing so browser UI does not cover content.
- Fullscreen map on mobile is too sheet-first. The map must remain visible on open.

## Mobile Fullscreen Coverage Map Directive

Read `REF_KNOWN_ISSUES.md` KI-067.

Current risk: the command sheet can cover most of the map on mobile open. This makes the fullscreen map feel like a form panel rather than a map-first browser.

Target:

- Default mobile fullscreen map opens with the map visible.
- Command Center starts in compact/peek state, not 90% height.
- User can deliberately expand the sheet.
- One clear close control, not duplicated X confusion.
- Search / Explore / Saved / Shops tabs remain discoverable.
- Bottom safe-area protected.
- Double-tap/double-click gate preserved from the hero map.

Do not turn the mobile map into a pure drawer. The map is the product surface.

## Background Polish Direction — Without Whitening

When improving backgrounds, do **not** use blank white fields to create cleanliness. Use richer spatial atmosphere:

- faint map contours
- soft coordinate-grid hints
- subtle route-line geometry
- low-opacity county/region silhouette suggestions
- champagne lamp pools anchored to sections
- cool blue haze behind glass
- bronze rim light at section seams
- layered navy/cyan depth fields in dark mode
- cream/champagne glow fields in light mode
- soft atmospheric shadow falloff that dissolves into the canvas

Avoid:

- decorative floating orbs as the main background idea
- bokeh blobs
- generic gradients unrelated to map/spatial product identity
- oversized noise textures
- pure white blank zones
- beige/sand/tan wash
- purple-blue one-note gradient themes
- brown/orange/espresso domination outside intentionally warm landing bands

The right feeling: a premium spatial control room with a gold lamp reflecting on cool liquid glass.

## Landing Page Polish Suggestions

Landing can be more theatrical than dashboard. It is allowed to carry stronger warm/gold narrative bands.

### Hero

- Preserve the current headline/CTA/map strip.
- Make the mobile map strip feel intentionally interactive with the double-tap hint, but keep single tap non-fullscreen.
- If copy or ARIA still implies single-tap scroll/open behavior, align it with double-tap reality.
- Add richer top-lamp atmosphere and route-line depth if it does not clutter.
- Keep the H1 and CTAs dominant; do not let decorative lighting compete.

### How It Works

- Add a refined section seam: cool blue glass field with faint route-line spine between the three cards.
- Card shadows should feel like stacked glass, not paper cards.
- Keep the three-step simplicity; no new text explaining the UI.

### Why Choose / Benefits

- Strong warm/gold bands are allowed here.
- Keep real automotive imagery visible and crisp.
- Add bronze edge lighting and photo-card sheen, not cloudy overlays that obscure the images.
- Make section transitions feel intentional: warm band into cool band via a controlled champagne-to-blue bridge.

### Who We Serve

- Consider a champagne/gold story band behind the three audience cards.
- Keep the cards clean and scannable.
- Use map/grid/route hints in the background so the section still belongs to the product world.

### Transparency / Trust

- Preserve trust-oriented copy.
- Add subtle ledger/process-line motifs or coordinate ticks as background texture.
- Do not add fake claims, fake shop counts, or fake live operational metrics.

### Coverage

- Map should remain a major visual anchor.
- Empty/out-of-region states should get premium spatial treatment: faint region contour glow, bronze rim, cool glass empty-state plate.
- Keep copy truthful about NY counties and partner-shop availability.
- The full-map CTA/hint should be clear but not force single-tap fullscreen.

### Business Inquiry / Shop Signup / Insurer Partnerships

- Maintain premium forms and clear CTAs.
- Stronger solid-gold landing sections are acceptable around business conversion, but the form controls should stay legible and calm.

### Final CTA / Footer

- Add a controlled atmospheric pool under the CTA card so it feels grounded.
- Footer should feel premium, not an afterthought. Use subtle cool glass and bronze/champagne divider lines rather than white emptiness.

## Dashboard Polish Suggestions

Dashboard is professional. It should feel expensive, trustworthy, and operational.

### Shared Dashboard Shell

- Header/search/avatar/notification surfaces should share the same material language.
- Sidebar active state stays blue; gold enhances edge light only.
- Bottom nav active state stays blue; gold can be a thin underline/catchlight.
- Protect mobile safe areas and scroll padding.

### Dashboard Home

- Repair Overview hero panel can carry warm lamp glow; Quick Actions should be cooler glass with light-catching edges.
- Move or emphasize map/Smart Map Tools earlier on mobile.
- Quick Actions should feel like touchable glass tiles: top bevel, bottom rim, hover sheen, contact shadow.
- Do not make all tiles gold; preserve cool/warm rhythm.

### Report Wizard

- Mobile: compact the step header/progress so fields appear sooner.
- Keep desktop progress richer.
- Inputs must stay `bd-report-input` or equivalent; no plain white fields.
- Photo step should keep real image previews crisp with premium fallback.
- The report flow should feel guided and trustworthy, not decorative.

### Bids

- Empty state can be tighter and more useful.
- Bid comparison cards should keep money/timeline hierarchy clear.
- Accepted/recommended badges should stay semantic.
- Add gold lighting only to card chrome/focus, not prices or semantic labels.

### Account

- Account top card is strong; preserve it.
- Long mobile settings stack needs slightly clearer scan rhythm.
- Sensitive actions should remain visually separate and readable.
- Profile/notification overlays need final LAW-palette material correction.

### Reports List / Report Detail

- Map strips and report-location panels should be premium map surfaces, not generic embedded maps.
- Image galleries should keep real photos primary and fallback placeholders subdued.
- Timeline/progress surfaces should be cool glass with clear semantic markers.

### Smart Map Tools / Nearby Matches

- Keep this map-first. It is a signature dashboard area.
- On mobile, give it priority and breathing room.
- AI Matching / Directions / Compare tiles should read as one tool cluster.
- If no shops exist, empty state should be truthful and premium, not sad.

## Suggested Implementation Order

### Pass 0 — Read + Diff + Screenshot Baseline

- Confirm branch and dirty files.
- Read all required docs.
- Run a quick stale palette grep.
- Capture baseline screenshots for the surfaces you will touch.

### Pass 1 — LAW Palette Drift Correction

- Execute `PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md` P0.
- Replace old yellow-amber and pure-white insets on premium surfaces.
- Keep visual intent the same or better.
- Verify light/dark dashboard overlays and panels.

### Pass 2 — Mobile Viewport / Safe Area / Report Compactness

- Add safe bottom spacing where CTAs/content get hidden by browser chrome.
- Compact mobile report wizard header/progress.
- Improve mobile Quick Actions discoverability.
- Preserve bottom tabs.

### Pass 3 — Mobile Map-First Coverage Dialog

- Make mobile fullscreen map open map-first with compact/peek sheet.
- Remove duplicate close confusion if present.
- Verify Search/Explore/Saved/Shops in both modes.

### Pass 4 — Dashboard Liquid-Glass Refinement

- Profile dropdown + notifications material polish after Pass 1.
- Quick Actions tile top rim/sheens.
- Hero panel inner sheen.
- Sidebar/header hover lamp wash if subtle.

### Pass 5 — Landing Cinematic Background Polish

- Stronger gold story bands where landing benefits from them.
- Better warm/cool section bridges.
- More spatial background texture without whitening.
- Coverage empty states and final CTA atmospheric grounding.

Do not do all passes if a smaller scoped pass is wiser. But if the owner says “go full auto,” execute the sequence carefully with commits/checkpoints.

## Likely Files

- `src/styles/theme.css`
- `src/app/components/dashboard/ProfileDropdown.tsx`
- `src/app/components/dashboard/NotificationCenter.tsx`
- `src/app/components/dashboard/MobileBottomNav.tsx`
- `src/app/components/app/DashboardLayout.tsx`
- `src/app/components/app/DashboardHeader.tsx`
- `src/app/components/codelayer/HomeScreen.tsx`
- `src/app/components/codelayer/HomeScreenSections.tsx`
- `src/app/components/dashboard/CustomerMapWidget.tsx`
- `src/app/components/codelayer/ReportScreen.tsx`
- `src/app/components/codelayer/report/*`
- `src/app/components/codelayer/BidsScreen.tsx`
- `src/app/components/codelayer/BidsEmptyState.tsx`
- `src/app/components/reports/ReportsListScreen.tsx`
- `src/app/components/reports/ReportDetailScreen.tsx`
- `src/app/components/codelayer/account/*`
- `src/app/components/landing/HeroSection.tsx`
- `src/app/components/landing/CoverageMapDialog.tsx`
- `src/app/components/landing/CoverageBrowseExperience.tsx`
- `src/app/components/landing/CoverageBrowseSidebarContent.tsx`
- `src/app/components/landing/MobileMapBottomSheet.tsx`
- `src/app/components/maps/mapSurfaceTheme.ts`
- `docs/REF_VISUAL_SYSTEM.md` if visual truth changes
- `docs/REF_KNOWN_ISSUES.md` if you discover a real bug and do not fix it

## Hard Stops

Stop and ask before:

- backend/edge/auth/storage changes
- schema migrations
- map provider changes
- production data mutation
- secret/deploy/cloud-resource actions
- destructive git operations
- removing approved design identity
- making product claims that are not true
- replacing mobile bottom tabs
- changing double-tap fullscreen behavior
- broad refactors unrelated to visual polish

## Verification Required

Run:

- `npm run typecheck`
- `npm run build`

Capture screenshots and review console errors:

Desktop light + dark:

- landing hero
- landing How It Works / Benefits / Who We Serve
- landing Coverage section
- landing fullscreen CoverageMapDialog
- dashboard home
- dashboard account
- dashboard bids
- dashboard report wizard
- profile dropdown
- notification center

Mobile light + dark:

- landing hero
- landing hero map strip and double-tap behavior
- landing How It Works
- landing benefits/trust/coverage
- landing fullscreen CoverageMapDialog Search/Explore/Saved/Shops
- dashboard home top
- dashboard Smart Map Tools / Nearby Matches
- report wizard step 1 and step 3/4
- bids empty state
- account top and lower settings
- notification overlay
- profile menu overlay

Explicit interaction checks:

- hero map single tap does not fullscreen
- hero map double-tap / double-click opens fullscreen map
- mobile fullscreen map opens with map visible
- bottom nav does not cover CTAs
- no important text overlaps browser chrome
- no pure-white premium surfaces introduced
- stale forbidden palette grep is clean or documented if a tiny exception is intentional

## Expected Output

Implement the scoped visual polish pass.

Keep changes scoped and commit intentionally. Mention `bd-design-identity` and `mola-ai-relay-protocol` in the pass log or commit message if relevant.

Final report should include:

- what improved
- what was preserved
- files changed
- tests/build run
- screenshot surfaces captured
- whether stale palette grep passed
- whether double-tap map behavior still works
- any remaining visual risks or deferred buckets

Tone for the pass: surgical confidence. The current design is premium; your job is to make it feel inevitable.
