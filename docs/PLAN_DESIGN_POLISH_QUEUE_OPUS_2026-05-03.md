---
title: PLAN — Design Polish Queue for Next Opus Pass
date: 2026-05-03
authority: PLAN (future direction; no code changes until owner approves a specific bucket)
status: READY — companion to Codex's master handoff prompt
preserves:
  - LAW_PROJECT_RULES.md § Premium Gold Palette (locked 2026-05-03)
  - REF_VISUAL_SYSTEM.md current baseline
  - All shipped passes: V1/V2/V3 visual hardening, sidebar/header/search gold-language, atmospheric shadow falloff, hero-map double-tap, full-map dialog premium gold treatment, hydrateReport fail-closed
companion:
  - HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03.md (Codex's mission + reading list)
  - This doc — the itemized polish queue with file:line targets
---

# Design Polish Queue — what the next Opus pass should attack

This is a polish *queue*, not a redesign brief. Every item is additive or corrective-toward-LAW. Nothing here removes premium identity. Nothing here whitens, flattens, or pulls toward generic SaaS.

Codex's master prompt covers mission + reading list + preserve list. This doc gives the next Opus a concrete checklist with file pointers, current-state evidence, and proposed polish — so the pass can be surgical instead of exploratory.

---

## Absolute preserve list (mirrors the master prompt)

- Locked bronze/champagne premium gold palette: top halo `rgba(196, 144, 65, *)`, bronze trim `rgba(140, 82, 22, *)`, cream insets `rgba(252, 238–240, 204–208, *)`.
- Cool blue-gray canvas + warm gold lamp lighting in light mode.
- Navy-lit-by-gold-lamp identity in dark mode.
- Landing solid gold story bands (theatrical).
- Dashboard liquid-glass register (professional, restrained).
- Double-tap gate on hero map → full coverage dialog.
- `bd-*` utility system; no hand-rolled `backdrop-blur`.
- No backend, no auth, no storage, no map provider changes.

---

## P0 — LAW-vs-CSS drift correction (do these first; everything else compounds on top)

The locked LAW palette is bronze/champagne. Several load-bearing files still ship the **forbidden** older yellow-amber register inline. The next Opus must align these to the locked palette before adding new polish, or further additions will inherit the drift.

### P0.1 — `src/app/components/dashboard/ProfileDropdown.tsx` lines 167–168

Inline `boxShadow` for both light and dark mode uses:
- `rgba(220, 165, 90, 0.22)` inset bottom rim — **forbidden**, replace with `rgba(140, 82, 22, 0.30)` (bronze) or `rgba(196, 144, 65, 0.22)` (gold halo).
- `rgba(220, 165, 90, 0.14)` ring — replace with `rgba(140, 82, 22, 0.20)`.
- `rgba(220, 140, 50, 0.16)` outer halo — replace with `rgba(196, 144, 65, 0.18)`.
- Light mode: `inset 0 1px 0 rgba(255, 255, 255, 0.92)` — **forbidden white inset**, replace with `rgba(252, 240, 208, 0.88)`.

### P0.2 — `src/app/components/dashboard/NotificationCenter.tsx` lines 284–285

Empty-state icon plate ships:
- `rgba(220, 165, 90, 0.18)` inset rim — **forbidden**, swap to `rgba(140, 82, 22, 0.26)`.
- `rgba(220, 140, 50, 0.14–0.18)` halo — swap to `rgba(196, 144, 65, 0.16–0.20)`.
- Light mode: `rgba(255, 255, 255, 0.85)` inset — **forbidden**, swap to `rgba(252, 240, 208, 0.82)`.

### P0.3 — `src/styles/theme.css` line 2612

`[data-appearance-mode="light"] .bd-dashboard-panel::before` and `::section::before` use `rgba(220, 165, 90, 0.62)` for the top trim line — **forbidden**. Replace with `rgba(196, 144, 65, 0.62)`.

### P0.4 — `src/styles/theme.css` line 2616

Light-mode `.bd-dashboard-panel::after` corner lamp uses `rgba(220, 140, 50, 0.3)` — **forbidden**. Replace with `rgba(196, 144, 65, 0.32)`.

### P0.5 — Repository-wide audit

Run a grep and align all hits, not just the ones I caught:

```bash
grep -rn "rgba(220, *165, *90" src/ supabase/
grep -rn "rgba(220, *140, *50" src/ supabase/
grep -rn "rgba(160, *95, *25" src/ supabase/
grep -rn "rgba(254, *248, *220" src/ supabase/
grep -rn "rgba(255, *255, *255, *0\.[789]" src/  # white-ish insets
```

Treat each hit as a P0 LAW item. Do this **before** P1.

---

## P1 — Mobile viewport ergonomics (highest user impact)

### P1.1 — Mobile fullscreen coverage map: map-first, sheet-peek

Current behavior: command sheet covers ~92dvh on mobile open, hiding the map. Fix per `REF_VISUAL_SYSTEM.md § Mobile Viewport Doctrine`.

Files: `src/app/components/landing/CoverageMapDialog.tsx`, `MobileMapBottomSheet.tsx`, `CoverageBrowseSidebarContent.tsx`.

Target: peek state ~32–38dvh by default with map visible behind; pull-handle drag-up expands to full sheet. Single close X. Bottom safe-area respected.

### P1.2 — Mobile report flow: compact 5-step strip

Current: 5 numbered circles + connectors + giant title before any field. On phones the active step input is below the fold.

File: `src/app/components/codelayer/ReportScreen.tsx` and `report/*` step components.

Target: ≤ md viewport collapses to a thin progress strip (compact dots or `1/5` text) plus the step title only. Numbered-circle row stays for ≥ md.

### P1.3 — Mobile dashboard: lift map widget priority

Current: customer map widget sits below Quick Actions and Repair Activity. The product is map-first; map should appear after the welcome card on mobile.

File: `src/app/components/codelayer/HomeScreen.tsx`, `HomeScreenSections.tsx`, `dashboard/CustomerMapWidget.tsx`.

Target: ≤ md re-orders the section flow. Desktop unchanged.

### P1.4 — Bottom safe-area discipline

Multiple screens have CTAs near `env(safe-area-inset-bottom)` that risk being eaten by Safari toolbar.

Files: `DashboardLayout.tsx`, `MobileBottomNav.tsx`, `LandingPageLayout.tsx`, last-card scroll padding across `HomeScreen`, `BidsScreen`, `account/*`.

Target: `padding-bottom: max(1rem, env(safe-area-inset-bottom) + 1rem)` on scroll containers, fixed bottom nav uses `bottom: env(safe-area-inset-bottom)`.

---

## P2 — Dashboard liquid-glass refinement (professional, not louder)

### P2.1 — Notifications popover + ProfileDropdown top rim warmth

After P0.1 swaps the colors to LAW, the popovers will feel materially better but still slightly disconnected from the dashboard lamp. Add (additive) a top inset highlight that picks up faint warm rim light to integrate.

Proposed add: `inset 0 1px 0 rgba(252, 240, 208, 0.55)` light mode, `inset 0 1px 0 rgba(196, 144, 65, 0.20)` dark mode — alongside existing shadow stack, not replacing.

### P2.2 — Quick Actions tile glass-with-light signature

Current: tiles have a `::before` top trim line via `bd-dashboard-section`. Good. Could add a tighter inset highlight + hover-only sheen sweep so they read as glass-under-light, not just colored tints.

File: `src/styles/theme.css` `.bd-dashboard-section--interactive` at line 3005 — add a `:hover::after` sheen sweep using locked palette only.

### P2.3 — Repair Overview hero panel inner sheen

The hero panel reads as gold paint in some light-mode views. Adding a subtle inner-edge highlight on the gold-lamp side (top-right) gives "glass under lamp" feel. Use `rgba(252, 240, 208, 0.40)` cream only.

### P2.4 — Sidebar inactive items + bottom nav non-active states

Currently flat. Add a faint hover lamp wash so inactive items feel the lamp metaphor. `background: linear-gradient(180deg, rgba(196, 144, 65, 0.06), transparent)` on hover.

---

## P3 — Landing cinematic polish (allowed to be more eye-catching)

### P3.1 — Who We Serve trio gets a champagne band

Currently flatter than Why Choose. Landing rule allows stronger gold here — wrap in a champagne section (`bd-dashboard-section--accent-champagne` equivalent on landing) so it reads as a story beat between the cooler sections above and below.

File: landing components for the Customers / Repair Shops / Insurers card row.

### P3.2 — Final CTA "Ready to Get Started?" atmospheric pool

The dark blue gradient card sits on a cream/blue mist field. Could carry more atmospheric particles / a faint lamp pool below the card to anchor the bottom of the page.

### P3.3 — Coverage map "Outside our current NY service region" empty state

Currently a flat rectangle with an icon. Empty states are first-class premium surfaces per the `bd-design-identity` skill update. Add a faint regional contour glow (radial gradient) behind the icon so the empty state has the same atmosphere as a populated state.

---

## P4 — Full-map dialog premium polish

### P4.1 — Right-side floating action rail

4 stacked buttons (search / theme / GPS / refresh) currently read as 4 disconnected pills. Add a subtle vertical glass rail behind them — a single `bd-glass-*` element they share — so they read as one control unit.

File: `CoverageBrowseExperience.tsx` (the floating action button group).

### P4.2 — COVERAGE COMMAND CENTER header card

Primary control surface; should carry the strongest top lamp halo in the dialog. Currently has the same treatment as ordinary panels.

File: `CoverageBrowseSidebarContent.tsx` — add a stronger `::before` top halo gradient and slightly stronger corner lamp `::after` for this one card.

### P4.3 — Mode badges row spine

Mode Roadmap / 6 regions / 6 live shops chips at the very top read as 3 separate items. Could share a thin glass spine behind them to read as one strip.

---

## Verification checklist (every commit)

- `npm run typecheck`
- `npm run build`
- Browser screenshots, **light + dark, mobile (~390 px) + desktop**:
  - Dashboard home, account, bids, report flow steps 1 + 3
  - Landing hero, How It Works, Who We Serve, Coverage map, final CTA
  - Full coverage dialog: Search / Explore / Saved / Shops modes
  - Profile dropdown + notifications popover overlays
- Console clean, no layout warnings.
- Hero map: single tap silent, double-tap opens dialog.
- No mobile CTA hidden behind bottom nav or browser chrome.
- Grep verifies forbidden palette values are gone:
  - `grep -rn "rgba(220, *165, *90\|rgba(220, *140, *50\|rgba(160, *95, *25\|rgba(254, *248, *220" src/` returns no hits.

---

## Out of scope (do not touch)

- Backend / edge functions (just shipped, leave alone).
- Auth / Clerk / Supabase / storage invariants.
- Map provider, geocoder, or routing engine.
- Schema migrations.
- New product features.
- Deletion of legacy `bd-*` utilities even if unused — leave for a separate cleanup pass.
- `MapTrackerPasses1_499` and similar archived history files.

---

## Owner approval gate

The next Opus should not start P1+ until owner names which buckets to attack. P0 (LAW drift) is auto-authorized because it's a LAW correction, not new polish — the locked palette in `LAW_PROJECT_RULES.md` already approves these values.

Suggested order if owner gives a generic "go":
1. P0 in full (LAW drift sweep + corrections).
2. P1.1 + P1.4 (mobile map-first + safe-area). Highest user impact.
3. P4.1 + P4.2 (full-map dialog premium chrome). Highest "wow" return.
4. P2 + P3 in whatever order owner steers.
