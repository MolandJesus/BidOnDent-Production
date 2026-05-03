---
title: Landing visual audit — Liquid Map Intelligence verification
date: 2026-05-03
auditor: Sonnet (GitHub Copilot — Claude Sonnet 4.6)
target_url: http://localhost:5173/ (dev server — Vercel target URL returned 404 DEPLOYMENT_NOT_FOUND; see Deployment note below)
target_build: BidOnDent-Horizon-Beta branch; git SHA could not be determined from page source
viewports_walked: 375px (simulated), 680px (VS Code browser pane limit), 1440px (first session segment only — pane constrained after resize)
modes_walked: light, dark
reduced_motion_walked: CSS rule audit only (no OS-level emulation possible in VS Code integrated browser)
---

## Deployment Note

Target URL `https://bid-on-dent-horizon-git-bidondent-bee1f4-molalign1236s-projects.vercel.app` returned `404 DEPLOYMENT_NOT_FOUND` (`DEPLOYMENT_NOT_FOUND`, Vercel ID `iad1::jv699-1777797459154-b7675de85919`). Deployment has not propagated or URL is stale. Audit was performed against `http://localhost:5173/` (dev server on current branch `BidOnDent-Horizon-Beta`). All pass outcomes from the Outcome Notes in `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md` apply to this local build.

**Viewport constraint:** The VS Code integrated browser pane limits `setViewportSize` to the physical pane width (~680px). The 1440px wide screenshots were captured in the initial session segment before the pane was resized. After resize, viewport was fixed at 680px. "Desktop" screenshots labelled 1440px are from that initial segment; all subsequent screenshots are at 680px.

---

## Findings by Pass

### Pass C — Hero scene

- ✅ **Right column shows map-style mock (not static car photo).** SVG-based dark (`#0d1d3a`) map frame with curved contour lines confirmed. No static car photo in DOM.
- ✅ **Report pin has TWO concentric ring pulses.** `bd-pin-pulse` element has `::before` (`bdPinPulse`, 4.2s, delay 0s) and `::after` (`bdPinPulse`, 4.2s, delay 2.1s). Delay is exactly half of 4.2s — correct half-cycle stagger.
- ⚠️ **Three bid card chips present, not two. Card labels imply real operational data.** DOM contains 3 `bd-bid-card-float` elements: "3 Bids Received / Avg. response < 48 hrs", "NY Active Service Region", "Repair Completed! / Bid selected and scheduled through platform". Plan specifies 2 chips with labels "Quote • $1,240" and "ETA 4 days". "Avg. response < 48 hrs" reads as a live operational claim. Anti-Goal #9: "text inside the floating bid cards must be obviously sample/illustrative or use generic labels."
- ✅ **Bid cards drift at 6s loop, not jittery.** `animationName: mapGlassFloat`, `animationDuration: 6s`, `animationIterationCount: infinite`. Stagger delays: 0s / 1.5s / 2.5s.
- ✅ **Gold radial flow present behind scene.** `bd-liquid-gold-flow` + `bd-liquid-gold-flow--dark` classes confirmed; `animationName: bdLiquidGoldFlow`.
- ✅ **Gold sheen sweep at ~28s.** `bd-liquid-gold-sheen` element confirmed with `animationDuration: 28s`.
- ✅ **SVG route line confirmed.** 3 `bd-route-line` SVG paths in a dedicated SVG layer, each with `bdRouteShimmer` animation at 6s and stagger delays (0s, 0.7s, 1.5s). Paths drawn from pin coordinate (220,240) to bid card positions.
- ❌ **Hero scene NOT hidden on mobile (≤767px) — layout overflow regression.** At 375px and 680px viewports, all 3 `bd-bid-card-float` elements remain visible and rendered. Their bounding rects at 375px: x values of 331–402 on a 375px-wide viewport (outside the viewport) and y values of 466–649. The "Repair Completed!" card physically overlaps the "Learn More" button and the trust chip row at the bottom of the hero. "NY Active Service Region" and "Bids Received" cards render below the hero CTA area. Plan Decision #4 and mobile rule in Pass C spec: "Hide the entire right-side scene on mobile (<768px)." This is not implemented.

---

### Pass D — Coverage section

- ✅ **"Live Coverage" eyebrow badge has `bd-pin-pulse--soft` modifier.** Confirmed: class `bd-pin-pulse bd-pin-pulse--soft inline-flex h-3 w-3 items-center justify-center` on the badge's icon element.
- ✅ **`bd-liquid-gold-flow--dark` ambient layer present in Coverage section.** Confirmed: `bd-liquid-gold-flow bd-liquid-gold-flow--dark pointer-events-none` element exists within the Coverage/OperatingRegions section.
- ✅ **MapLibre canvas unchanged.** 1 canvas (`canvas.maplibregl-canvas`), WebGL context confirmed. No new MapLibre layers/sources added. Map style switches correctly between "Roadmap" (light) and "Night map" (dark). No new console warnings from MapLibre observed during session.

---

### Pass E — Section continuity

- ⚠️ **HowItWorks connector SVGs report non-zero dimensions at 680px (below md threshold).** The two connector SVGs (`hidden md:block absolute top-[3.5rem]…`) returned `getBoundingClientRect` width=77.29, height=1.99 at 680px viewport — indicating they are NOT `display: none`. At 768px+ they correctly display; at <768px they should be hidden. Visually they are not prominent in the mobile screenshot (likely positioned behind the stacked cards due to absolute layout), but technically they are rendered. This is a CSS rule application anomaly — `hidden md:block` appears not to suppress display at 680px on this build.
- ✅ **WhoWeServe: 3 role-tinted rim glow overlay spans confirmed, all at correct alphas.** Customer: `rgba(96, 165, 250, 0.14)` blue inset + `rgba(59, 130, 246, 0.1)` outer. Shops: `rgba(34, 211, 238, 0.14)` teal inset + outer. Insurer: `rgba(220, 150, 60, 0.15)` gold inset + outer. All implemented as `pointer-events-none absolute inset-0 rounded-[inherit]` overlay spans — NOT replacing existing `bd-glass-card` box-shadow. ✅
- ✅ **Benefits photo cards have `bd-gold-sheen-hover` class on 3 containers.** `animationName: none` in idle state (correctly waits for hover). Hover trigger not testable in current browser automation context (no pointer hover events), but CSS structure is correct: `bd-gold-sheen-hover` is inside `.group` and activates on `.group:hover`. Reduced-motion guard present: `animation: none !important; opacity: 0 !important` under `prefers-reduced-motion: reduce`.

---

### Pass F — Light-mode contrast

- ✅ **HowItWorks "Get your car repaired in three simple steps" — readable in light mode.** Subtitle visible and not washed out in the 1440px light screenshot. Text-color computed as `oklab(0.932 -0.00796618 -0.0309926 / 0.7)` — approximates to a medium blue-gray at 0.7 opacity; visually reads clearly against the cool blue-white section background.
- ✅ **HowItWorks per-step descriptions — readable.** Card body copy visible against near-white card backgrounds in light mode. No washiness observed.
- ✅ **WhoWeServe "Solutions for everyone in the auto repair ecosystem" — readable.** Visible and clear in screenshots at 680px and 1440px.
- ✅ **Benefits per-card descriptions — readable.** Description text below card photos is visible in light mode; no contrast collapse observed.

---

### Cross-cutting (motion guards, console, modes, viewports)

- ✅ **Reduced-motion CSS guard confirmed present and complete.** `@media (prefers-reduced-motion: reduce)` block confirmed in stylesheet with the following rules:
  - `bd-liquid-gold-flow`, `bd-liquid-gold-sheen`, `bd-bid-card-float`: `animation: none !important; transition: none !important`
  - `bd-route-line`: `animation: none !important; stroke-dashoffset: 0 !important`
  - `bd-pin-pulse::before`, `bd-pin-pulse::after`: `animation: none !important; opacity: 0 !important`
  - `bd-gold-sheen-hover` (group hover): `animation: none !important; opacity: 0 !important`
  - Covers every new motion class introduced in Passes B–E. ✅ OS-level media query emulation was not possible in this browser context; the rules are present and correctly authored.
- ✅ **Mobile motion budget CSS guard confirmed.** `@media (max-width: 767px)` block confirmed:
  - `bd-bid-card-float`: `animation: none !important; transform: none !important`
  - `bd-route-line`: `animation: none !important; stroke-dashoffset: 0 !important`
  - `bd-pin-pulse::before`, `bd-pin-pulse::after`: `animation: none !important; opacity: 0 !important`
  - `bd-liquid-gold-flow` is NOT in this block — correctly allowed to continue on mobile per Decision #4 ("Gold drift CAN continue").
  - ⚠️ **However:** the mobile motion budget disables _animations_ on the bid cards and route lines, but the bid card _elements themselves_ remain visible on mobile (they are not hidden). The CSS guard only prevents them from floating — it does not hide the layout. Combined with the Pass C finding above, the cards render statically on mobile and overflow the hero. This confirms the mobile overflow is a layout/visibility bug, not a motion bug.
- ✅ **Dark mode walked.** Light → dark toggle functional via mobile nav. Coverage section shows "Night map" MapLibre tile in dark mode. Hero scene renders with dark navy bg and visible route lines in dark mode. No visual regressions observed between light/dark in the hero scene.
- ⚠️ **768px breakpoint not directly tested.** VS Code browser pane constrained to 680px maximum after resize. The md (768px) breakpoint was not verifiable in this session. All mobile findings are at 680px (below md), not at exactly 375px physical iPhone width.
- ✅ **No new MapLibre errors observed.** Canvas present, WebGL context confirmed. Map renders correctly in both light and dark.
- ⚠️ **Console had pre-existing warnings/errors.** See Console section below.

---

## Issues for Opus to action

### Issue 1 — ❌ Hero bid card scene not hidden on mobile (layout overflow regression)

**What:** All 3 `bd-bid-card-float` elements remain visible and overflow the hero right column at ≤767px viewport. The "Repair Completed!" card covers the "Learn More" secondary CTA button and the trust chip row. "NY Active Service Region" and "Bids Received" chips render below the CTA block, still inside the hero container's overflow bounds but visible to the user as unexpected floating cards below the primary action area.

**Where:** `src/app/components/landing/HeroSection.tsx` — the hero scene right-column container. The bid card elements use absolute positioning (`absolute top-2 left-1 sm:top-4...`, `absolute -top-1 right-2...`, `absolute bottom-2 left-1...`) with no `hidden md:block` or equivalent wrapping that would hide the entire group on mobile.

**Repro:** `http://localhost:5173/` → click BidOnDent logo to reach landing → viewport ≤767px width → scroll to top → both light and dark modes show overflow. Visible at 375px and 680px.

**Severity:** Blocker (regression — plan Decision #4 explicitly requires mobile scene to be hidden or static single chip; current state violates both options).

---

### Issue 2 — ⚠️ Bid card count is 3 (spec: 2); card labels imply live operational data

**What:** The hero scene contains 3 floating badge chips, not 2 as specified in the Pass C plan section ("Two small floating bid card chips"). Labels are: "Bids Received / Avg. response < 48 hrs", "NY Active Service Region", "Repair Completed! / Bid selected and scheduled through platform". The labels "Avg. response < 48 hrs" and "Repair Completed!" read as live operational claims, not as "obviously sample/illustrative" labels required by Anti-Goal #9.

**Where:** `src/app/components/landing/HeroSection.tsx` — 3 elements with class `bd-bid-card-float` found in the hero right column.

**Repro:** `http://localhost:5173/` → landing page hero → right column at any desktop viewport. Both light and dark.

**Severity:** Cosmetic / Anti-Goal compliance. Anti-Goal #9 is binding per plan.

---

### Issue 3 — ⚠️ HowItWorks connector SVGs report non-zero size at 680px (below md threshold)

**What:** Two SVG connector elements with class `hidden md:block absolute top-[3.5rem]…` return `getBoundingClientRect` width=77.29, height=1.99 at 680px viewport width, indicating `display` is not `none`. They are visually masked by the stacked card layout but are technically rendered. Plan Pass E: "mobile should hide them."

**Where:** `src/app/components/landing/HowItWorksSection.tsx` (or equivalent) — the step connector SVG elements.

**Repro:** `http://localhost:5173/` → landing → viewport ≤767px → inspect `svg.hidden.md\:block` elements in HowItWorks section → `getBoundingClientRect()` returns non-zero dimensions.

**Severity:** Motion-only / CSS rule issue. Visually masked but incorrect behavior.

---

### Issue 4 — ⚠️ Vercel deployment URL is returning 404

**What:** `https://bid-on-dent-horizon-git-bidondent-bee1f4-molalign1236s-projects.vercel.app` → `DEPLOYMENT_NOT_FOUND`. The audit checklist specifies this URL as the verification target for the `412b6b4e` merge to `main`. The deploy has not propagated or the URL is stale/expired.

**Where:** Vercel dashboard — BidOnDent-Production project.

**Repro:** Visit the URL above.

**Severity:** Blocker for production verification. All findings in this report are from the dev server (`localhost:5173`) and cannot be treated as production-confirmed until the Vercel deployment is accessible.

---

## Console output captured

```
[error] Failed to load resource: the server responded with a status of 404 () — 2 occurrences (resource path not captured; likely a favicon or edge function probe)
[error] Failed to load resource: the server responded with a status of 500 () — 1 occurrence on the Vercel 404 page
[error] X-Frame-Options may only be set via an HTTP header sent along with a document. It may not be set inside <meta>. — 2 occurrences (pre-existing, not new)
[warning] WebSocket connection to 'wss://wmdcnjgtsppftrofaqqa.supabase.co/realtime/v1/websocket…' failed: WebSocket is closed before the connection is established. — 1 occurrence (pre-existing Supabase Realtime; not introduced by Liquid Map Intelligence passes)
[warning] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits… — 1 occurrence (pre-existing; not new)
```

No new MapLibre errors or warnings observed. No new errors attributable to Pass B–F changes.

---

## Out-of-scope notes

1. **`bd-liquid-gold-flow` gold ambient drift visibility is unconfirmed visually in light mode Coverage section.** The CSS class is present and the `bdLiquidGoldFlow` animation is authored, but at the alpha values used (`--bd-liquid-gold-light` = 0.16, light mode), the drift layer did not produce a visually distinguishable warm wash in the light-mode Coverage section screenshots. This may be intentional ("ambient, not highlighted") but Opus may want to verify at 1440px with a longer dwell time on that section. Not flagged as a bug — flagging for awareness only.

2. **Pre-existing `404` console error resource on dev server.** One 404 resource error appeared during initial page load on `localhost:5173`. Path not captured in the event listener timing. Worth identifying — may be a missing favicon variant or a dead edge function health probe. Not introduced by Liquid Map Intelligence passes.
