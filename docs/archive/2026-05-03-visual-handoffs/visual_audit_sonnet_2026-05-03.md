---
title: Sonnet Deep Visual Audit
date: 2026-05-03
auditor: Claude Sonnet 4.6
target_url: https://bid-on-dent-production.vercel.app + http://localhost:5173
viewports: |
  Desktop: 1396×1127px (production) / 1625×1127px (localhost).
  Mobile: 487×896px — user manually set VS Code browser to mobile view for a second pass. Confirmed via window.innerWidth=487.
modes: light, dark
---

## Overall verdict

The visual identity is **coherent and directionally correct** in dark mode on desktop. The gold-lamp atmosphere, navy infill, blue glass surfaces, and eyebrow typography system all land. Light mode is functional but is not a true daylight twin. However, **mobile reveals a deeper product-identity gap**: the landing hero entirely removes the map on mobile — the product's core differentiator is invisible on the primary device. The dashboard recovers well on mobile with a clean bottom tab navigation and an excellent dark mode Account page, but several surfaces (quick action tiles missing, hero dead space, decorative orb overflow) leave the mobile experience feeling unfinished.

Five issues are now P1: broken report thumbnail, "Live Coverage" claim at 0 shops, boxed hero map frame (desktop), hero map absence on mobile, and the CTA bloom overflow. These must be resolved before any real user reaches soft launch.

---

## What is working (do not dismantle)

### Desktop

- **Dark mode gold-lamp atmosphere** (`bd-dashboard-atmosphere`): The subtle warm amber bloom in the lower-right of the dashboard content area is correctly present and premium-feeling. Do not remove or strengthen it — it is perfectly calibrated.
- **Dark mode scrolled header gold trim**: Confirmed live via class inspection — `shadow-[0_4px_24px_rgba(2,6,23,0.3),inset_0_-1px_0_rgba(220,165,90,0.20),0_0_28px_rgba(220,140,50,0.16)]`. The inset gold trim is exactly as documented.
- **`bd-dashboard-primary-button` ("New Repair Request" CTA)**: Outstanding in both modes. The navy border + white arrow in dark mode is particularly premium. Full-width on mobile, centred pill on desktop — consistent.
- **Dark mode landing identity — section registers**: HowItWorks (cool navy), Benefits/TrustStats (warm amber-black, Direction B), AboutOpportunity (deep navy transparencies) all carry distinct registers that create vertical rhythm through the page. This is intentional design per `MOLANDJESUS_DESIGN_DECISIONS.md` and should not be dismantled.
- **Eyebrow typography system** (`bd-section-eyebrow`): Consistent throughout landing and dashboard — uppercase tracking, blue colour, correct visual weight. The strongest typographic system element on the page.
- **Dashboard sidebar + main layout hierarchy**: Clean, functional, correctly responsive at desktop. Active state (blue highlight + `›` indicator) is clear. Sidebar profile mini-card at bottom reads well.
- **Report cards in dark mode (desktop + mobile)**: The glass treatment with navy infill, status badges ("In Repair" green, "Pending Bids" amber), map/delete actions, and chevron are visually polished and functional on both viewports.
- **Account page structure (desktop + mobile)**: IDENTITY / SETTINGS section layout with eyebrows, profile completion bar, and preferences organization is well-designed. The dark mode mobile Account page is the most polished surface in the product.
- **Profile role badge** ("Profile", "Car Owner") in Account hub: Renders correctly in both modes and both viewports.
- **Profile completion progress bar**: The cream→blue gradient is clear and reads "full" instantly at 100%.
- **Appearance Settings guard**: `Smoke Test Checklist` correctly gated behind `import.meta.env.DEV` — not visible in production.

### Mobile-specific working surfaces

- **Bottom tab navigation** (Dashboard / Report / Bids / Account): Clean, well-proportioned, well above 44px touch targets. Active state (blue fill + indicator line) is unambiguous. This pattern is correct — do not replace with a hamburger drawer.
- **Dashboard mobile map preview**: A mobile-specific card showing a dark-tile map with "3 reports" badge and "Tap to explore full map experience" overlay. This is the strongest mobile-specific surface. It puts the map into the user's hands at dashboard without being a full-page experience. Do not remove.
- **Smart Map Tools 3-column row**: AI Matching / Directions / Compare tiles at mobile renders in a clean 3-column grid that fits the 487px viewport well.
- **Sample chips correctly hidden at mobile** (KI-062 confirmed): `bd-bid-card-float` chips are not rendering on mobile hero. The breakpoint hide is working.
- **Mobile hamburger menu with dark mode toggle**: The landing nav hamburger opens a transparent overlay showing links, mode toggle (sun icon + "LIGHT" / "DARK" amber label), and auth buttons. Mode switch works instantly. Touch targets are adequate.
- **Dark mode mobile hero gold gradient**: The word "Auto Body Repair" in the mobile hero renders in amber→blue gradient in dark mode. This is the clearest expression of the gold identity on mobile and should be preserved.
- **Mobile HowItWorks cards**: Single-column, generous spacing, readable type, good touch areas. Clean execution.
- **Mobile Benefits photo cards**: Full-width single column. The "Repair Network" / "Transparent Bids" category badges on the photo thumbnails are well-positioned.
- **Mobile Account page dark mode**: The cleanest overall surface in the product at mobile. Profile header card, identity data fields, completion bar, bottom tab active state all work together. A strong reference implementation.

---

## Issues — prioritized (P0 / P1 / P2)

> Issues marked **[MOBILE]** are new findings from the mobile pass. Issues marked **[DESKTOP]** were found in the original desktop pass. Issues marked **[BOTH]** appear on both viewports.

---

### P1-TRUST-01 — Dashboard report thumbnail broken — 2023 Honda Accord [BOTH]

**Surface**: Dashboard → Repair Activity → first report card (both light and dark mode, both viewports)
**Symptom**: The 2023 Honda Accord thumbnail shows a blurred red-to-transparent gradient rectangle, not an actual photo. The 2021 Toyota Camry and 2014 Mazda Mazda6 entries show real photo thumbnails. The Accord is the only broken one. The red blur gradient is prominent on mobile where the thumbnail occupies a large left-column slot.
**Impact**: The user's most prominent repair record (the one marked "In Repair") displays as a visual error on every device. This creates immediate trust failure — if the user's own photo isn't loading, why would they trust their repair is being tracked?
**Likely cause**: `storage://` pointer not being resolved to a signed URL by `hydrateSignedStorageUrl()` for this specific record. The red gradient is almost certainly a CSS blur-filter applied on an `<img>` `onerror` fallback, or the `src` is still a raw `storage://` literal. Per `supabase-storage-signed-urls` skill: signed URLs expire and storage:// literals must be hydrated on every read.
**Next action**: Trace the Honda Accord `photo_urls` hydration path. Fix the hydration failure or add a graceful no-photo placeholder (grey/navy rectangle with car icon — NOT a blurry red gradient).

---

### P1-TRUST-02 — "Live Coverage" eyebrow + pulsing animation at 0 active partner shops [BOTH]

**Surface**: Landing → OperatingRegions section eyebrow (desktop + mobile)
**Symptom**: The section heading carries a pulsing animated map-pin badge labelled "Live Coverage" (`bd-pin-pulse--soft`). The shop search empty state reads "Search an area to unlock shop recommendations" — 0 shops are returned for any search.
**Impact**: "Live Coverage" is an operational claim. A pulsing animation amplifies it. Users who reach the coverage section expecting to find shops will find nothing, creating a trust collapse at the moment of intent.
**Source**: `src/app/components/landing/OperatingRegionsSection.tsx` line 164
**Next action**: Change eyebrow to "Coverage Map" until real partner shops are enrolled. Replace the pulsing pin with a static `MapPin`. Soften copy to "Expanding to your area" register.

---

### P1-UX-03 — Hero map frame reads as boxed image, not immersive map window [DESKTOP]

**Surface**: Landing → Hero section — desktop, both light and dark mode
**Symptom**: The hero map stage renders with a hard rectangular frame: white/light border in light mode, dark-stroke frame in dark mode. The map is a clearly bounded rectangle sitting inside the hero layout. It does not bleed, does not have ambient bloom, and feels like "an embedded image" rather than "the world you are entering."
**Impact**: The map is the primary product surface per `LAW_PROJECT_RULES.md`. A boxed map communicates "a feature we are showing you" rather than "the product is the map." This is the largest single gap between design intent (`PLAN_MAP_MASTER.md`: "Map must feel immersive, not boxed in cards.") and current rendering.
**Note**: On mobile the map is absent from the hero entirely — see P1-MOBILE-04.
**Source**: `src/app/components/landing/HeroSection.tsx` — map container div border/ring treatment
**Next action**: Remove or soften the hard rectangular border. Add ambient blue bloom (`box-shadow: 0 0 60px rgba(59,130,246,0.25)`) that bleeds the map into the hero.

---

### P1-MOBILE-04 — Hero map is entirely absent on mobile [MOBILE]

**Surface**: Landing → Hero section — mobile (both light and dark mode)
**Symptom**: At mobile viewport (487px confirmed), the hero shows no map whatsoever. The layout is: headline text → tagline carousel → "Get Started" button → "Learn More" button → trust chips. The map is hidden at a breakpoint below the desktop. The product is described as a "map-first bidding marketplace" but on mobile — the primary device for most users — the entry experience communicates none of that.
**Impact**: Mobile users arrive to a generic text+CTA hero identical to any SaaS product. There is no spatial context, no geographic sense of "your repair area," no differentiation from competitor quote tools. The product's core value proposition is invisible at the most common touchpoint.
**Note on KI-062**: The `bd-bid-card-float` sample chips are correctly hidden on mobile (working). But hiding the chips AND hiding the map results in the hero having no spatial identity at all.
**Next action**: Add a map presence to the mobile hero. Options: (a) a full-bleed map thumbnail with the hero text overlaid as a glass card on top, (b) a simplified static map preview at reduced height (~220px), or (c) a dark navy atmospheric gradient that uses the map colour palette to imply spatial context even without live tiles. Option (c) is lowest risk. Option (a) is highest product impact.

---

### P1-MOBILE-05 — CTA section decorative orb overflows container at mobile [MOBILE]

**Surface**: Landing → CTA / GetStarted section — mobile, both light and dark mode
**Symptom**: A large blue/purple decorative orb (likely `bd-bloom-atmosphere`) bleeds visibly outside the right edge of the CTA card at mobile. The orb is approximately 120px in diameter and appears as a large circle half-visible at the bottom-right corner of the section card, completely breaking the card boundary.
**Impact**: On mobile where the viewport is narrow, the overflow is glaring — it looks like a layout crash rather than an intentional atmosphere effect. This is the most visually alarming issue found on mobile.
**Affected modes**: Both light and dark (confirmed in both).
**Next action**: Add `overflow-hidden` to the CTA section wrapper, or constrain the orb's `width`/`height` to fit within the mobile container. The orb at desktop is presumably not visible because the section is wide enough to absorb it.

---

### P2-UX-06 — Benefits → WhoWeServe section seam is abrupt [BOTH]

**Surface**: Landing, dark mode — seam between Benefits (warm amber-black) and WhoWeServe (cool deep navy) — confirmed on both desktop and mobile
**Symptom**: Hard horizontal colour-temperature cut between Direction B amber-black and cool navy registers. No gradient bridge, no transition zone. Reads as a print-registration error on both viewports.
**Design intent**: The Direction B warm sections are intentional and owner-authorised per `MOLANDJESUS_DESIGN_DECISIONS.md`. The issue is the transition, not the sections themselves.
**Next action**: Add a 64–120px gradient bridge fading from `#231408` (amber-black) to `#0a0f1e` (cool navy) between Benefits and WhoWeServe.

---

### P2-UX-07 — Quick action tiles: only 2 of 4 visible on mobile + no gold-rim treatment on either viewport [BOTH]

**Surface**: Dashboard → Quick Actions section
**Desktop symptom**: All 4 tiles visible but no gold-rim treatment. The 4th tile ("Find Shops") has a warm purplish tint that doesn't match the other 3. Near-invisible card boundaries in light mode.
**Mobile symptom** (new finding): Only 2 of 4 tiles render ("New Repair Request" and "View Bids"). "Connect Insurance" and "Find Shops" are completely absent from the visible dashboard at mobile. Whether they are hidden by a breakpoint rule or simply not scrolled into view is unverified — but they are not visible above the fold, and no scroll affordance indicates more tiles below.
**Impact**: On mobile, users cannot access the Connect Insurance or Find Shops actions from the Quick Actions section. If these actions are only reachable via deep navigation, this is a meaningful UX gap.
**Next action (mobile)**: Verify whether the other 2 tiles are rendered below the visible area or hidden by breakpoint. If hidden, restore them — either in a 2×2 grid or a scrollable horizontal row. If below the fold, add a visual indicator that more tiles exist.
**Next action (desktop)**: Apply `bd-glass-card--dashboard` gold-rim treatment to all 4 tiles. Clip the 4th tile's atmosphere leak.

---

### P2-UX-08 — Mobile hero: large dead space between trust chips and HowItWorks section [MOBILE]

**Surface**: Landing → Hero section bottom margin — mobile, both light and dark mode
**Symptom**: A blank space of approximately 180–220px sits between the bottom trust chip row ("Free for customers") and the start of the HowItWorks section eyebrow. Both modes. On mobile this forces scrolling through empty content-free space, creating a perception that the page is unfinished or broken.
**Impact**: First scroll on mobile produces no new information — just blank background. This is the moment when users are most likely to bounce.
**Next action**: Reduce the hero section bottom padding at mobile breakpoints. Target ≤48px gap between the last trust chip and the next section start. Check if the dead space is caused by the absent map element leaving its reserved layout slot empty.

---

### P2-UX-09 — "Learn More" secondary button invisible in dark mode mobile hero [MOBILE]

**Surface**: Landing → Hero → "Learn More" secondary button — mobile dark mode
**Symptom**: The "Learn More" button in dark mode renders as dark navy text/border on a dark navy hero background. The button is almost completely invisible — it blends into the background. In light mode the same button is rendered as a frosted white pill, which is visible.
**Impact**: Users in dark mode on mobile cannot easily see the secondary CTA. If "Learn More" is intended to scroll to content, its invisibility routes all users through "Get Started" regardless of intent.
**Next action**: In dark mode mobile, give "Learn More" a visible border treatment — `border border-white/20` or `border border-blue-400/30` — to establish the button as a distinct interactive element.

---

### P2-UX-10 — Coverage region pills row clips at mobile right edge [MOBILE]

**Surface**: Landing → OperatingRegions section → "COVERAGE REGIONS" pill row
**Symptom**: The region pills (Rockland, Dutchess, and at least one more starting with "V…") display in a horizontal row that overflows and clips on the right side at 487px viewport. The third pill is truncated — only the "V" character is visible before the viewport edge.
**Impact**: Users cannot see or tap all region options. The clipped pill looks like broken layout.
**Next action**: Wrap the region pills in `flex-wrap` so they wrap to a second line at mobile, or use `overflow-x: auto` with a scroll affordance if scrolling is intentional. If "V" is "Westchester County," this is the most important coverage region listed and should not be hidden.

---

### P2-UX-11 — Profile dropdown and notification center are identity-less [DESKTOP]

**Surface**: Dashboard → header profile button → dropdown; header bell → notification center panel
**Symptom**: Both overlays are plain white panels in light mode. No glass treatment, no blur backdrop, no gold trim. The profile dropdown background is nearly identical to the header — effectively invisible without its subtle shadow. In dark mode, slightly better contrast but still no glass identity.
**Next action**: Apply `bd-glass-card--dashboard` or equivalent glass container. In light mode: add `backdrop-blur-xl border border-blue-100/50`. In dark mode: use `bg-[#0e1628]/90 backdrop-blur-xl border-white/[0.06]` pattern.

---

### P2-UX-12 — Light mode dashboard is not a true gold-lamp twin [DESKTOP]

**Surface**: Dashboard, light mode — overall gestalt
**Symptom**: Dark mode has a clear "navy-lit-by-gold-lamp" identity. Light mode is clean but generic — "frosted glass on a gray background." The two modes feel like different products to a mode-switching user.
**Expected direction**: "Frosted daylight glass with controlled champagne/gold warmth" (REF_VISUAL_SYSTEM.md §Light mode identity).
**Next action**: Systemic light-mode pass after P1 fixes. Levers: (a) stronger warm bloom in light dashboard content area, (b) gold-rim trim on quick action tiles, (c) glass treatment on overlays.

---

### P2-COPY-13 — "Live activity" badge in Repair Overview card has ambiguous semantics [BOTH]

**Surface**: Dashboard → "REPAIR OVERVIEW" header card — "Live activity" pill
**Symptom**: Blue pill always visible. Unclear whether it fires conditionally (only when "In Repair" status exists) or is always decorative.
**Impact**: If always shown, this is a static false-status claim.
**Next action**: Make conditional — show only when at least one report has "In Repair" status — or rename to "Summary" and remove the "live" implication.

---

## Light vs dark parity check

| Surface              | Light                                        | Dark                                    | Parity                                                                   |
| -------------------- | -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| Hero map frame       | White border, hard rectangle                 | Dark stroke, hard rectangle             | ⚠ Same structural problem in both modes — neither matches design intent |
| Hero layout (mobile) | No map — text+CTA+chips only                 | No map — text+CTA+chips only            | ✅ Consistent but P1 gap — map absence equally broken in both            |
| Scrolled header      | Cream glass, no gold trim (correct per spec) | Navy glass, gold inset trim (confirmed) | ✅ Intentionally different — correct                                     |
| Dashboard atmosphere | Faint cream warm tint in cards               | Amber gold lamp bloom (lower-right)     | ⚠ Light mode warmth noticeably weaker                                   |
| Quick action tiles   | Near-invisible, 2 of 4 on mobile             | More depth, still no gold rim           | ⚠ Neither mode has gold-rim treatment. Mobile only shows 2/4            |
| Profile dropdown     | Nearly invisible white panel                 | Dark panel, better contrast             | ⚠ Neither carries glass identity                                        |
| Notification center  | Plain white panel                            | Dark panel                              | ⚠ Neither carries glass identity                                        |
| Appearance modal     | Plain white (verified in light)              | Not verified in dark                    | Unknown dark mode parity                                                 |
| Dashboard CTA button | Navy blue pill, white text                   | Navy blue pill, white text              | ✅ Identical — correct                                                   |
| Benefits section     | Not walked in light mode                     | Amber-black Direction B                 | Unverified light mode                                                    |
| TrustStats section   | Not walked in light mode                     | Amber Direction B                       | Unverified light mode                                                    |
| Landing CTA section  | Light cream/blue                             | Deep navy + amber bloom                 | ✅ Both landed correctly; CTA orb overflow is a mobile-specific issue    |
| Footer               | Light (walked desktop + mobile)              | Dark (walked desktop + mobile)          | ✅ Clean in both                                                         |
| Account page         | Clean cream glass (desktop)                  | Deep navy glass (desktop + mobile)      | ✅ Dark mode mobile is the strongest surface in the product              |
| Hero "Learn More"    | Frosted pill — visible                       | Dark on dark — near invisible (mobile)  | ⚠ Dark mode mobile button has critical contrast failure                 |
| CTA orb              | Orb bleeds right (mobile)                    | Orb bleeds right (mobile)               | ⚠ Same layout failure in both modes at mobile                           |
| Coverage pills row   | Clips at 3rd pill (mobile)                   | Clips at 3rd pill (mobile)              | ⚠ Same overflow failure in both modes at mobile                         |

**Key parity insight**: Dark mode is the product's stronger mode by significant margin on desktop. On mobile, the Account page dark mode is the standout surface. The mobile hero in both modes suffers from the same core identity gap — no map, dead space, overflow issues — regardless of colour mode.

---

## Mobile audit findings (verified — 487×896px)

**Viewport**: 487×896px confirmed. User manually set VS Code browser to mobile view via browser DevTools. Note: `page.setViewportSize()` in VS Code integrated browser is ignored — manual override was the only working method.
**Surfaces walked**: Production landing (both light and dark, full scroll from hero to footer) + localhost dashboard dark mode (full scroll: header, overview, quick actions, report cards, map preview, smart map tools, nearby matches) + localhost Account page dark mode.

### Mobile surfaces not walked

- New Repair intake flow (step-by-step form modal)
- Bids tab (empty state or live data)
- Modal flows (EditProfile, BidAccept, ServiceArea overlay)
- Shop-role surfaces (shop dashboard, bid submission flow)
- Light mode dashboard mobile
- NotificationCenter mobile behaviour

### Mobile positive findings (do not touch)

1. Bottom tab bar navigation — correct touch targets, clear active state, excellent pattern
2. Dashboard mobile map preview card — "Tap to explore full map experience" overlay is a strong mobile-first surface
3. Smart Map Tools 3-column row — fits 487px cleanly
4. Report cards single-column full-width — best readability of any surface
5. Dark mode Account page — cleanest surface in the product
6. `bd-bid-card-float` chips hidden at mobile ✅ (KI-062 confirmed working)
7. Hamburger menu with mode toggle — functional and correctly positioned

### Mobile issues confirmed (cross-reference Issues section above)

| ID           | Summary                                             | Severity |
| ------------ | --------------------------------------------------- | -------- |
| P1-MOBILE-04 | Hero map entirely absent on mobile                  | P1       |
| P1-MOBILE-05 | CTA orb overflows container at mobile               | P1       |
| P2-UX-07     | Quick Actions only 2 of 4 tiles visible on mobile   | P2       |
| P2-UX-08     | Hero dead space ~200px between chips + next section | P2       |
| P2-UX-09     | "Learn More" button invisible dark mode mobile hero | P2       |
| P2-UX-10     | Coverage region pills clip at right edge on mobile  | P2       |

---

## Do NOT fix

- **Direction B (amber-lit garage)**: Benefits and TrustStats sections in dark mode use warm amber-black backgrounds — this is intentional and owner-authorised per `MOLANDJESUS_DESIGN_DECISIONS.md` §7. Do not "fix" the warm register in these sections.
- **Dark mode gold trim on scrolled header**: The `inset_0_-1px_0_rgba(220,165,90,0.20)` + `0_0_28px_rgba(220,140,50,0.16)` shadow is correctly absent in light mode. The spec intentionally differentiates the two modes here.
- **Light mode has no gold trim on scrolled header**: Cream glass without gold trim is the correct light mode header treatment. Do not add gold trim to the light header.
- **Gold-lamp atmosphere bubble in dark mode**: The `bd-dashboard-atmosphere` warm amber glow in the lower-right of the dashboard content area is subtle and working correctly. Do not increase intensity.
- **"Toyota" data typo ("Toyoto Camry")**: This is a data entry error in the live user record, not a design issue. Appears in both Account and Dashboard views. Not in scope for a visual pass.
- **Coverage section map showing county regions**: The map in OperatingRegionsSection is real and live (PostGIS coverage query). The county region outlines are data-driven. Do not change the map treatment unless the Coverage section is fully redesigned.
- **Appearance Settings modal size and structure**: The settings options (Notifications, Privacy, Appearance, Language) are well-organized in a scrollable modal. Do not restructure the content or add new sections.
- **"Smoke Test Checklist" in Account dev mode**: Correctly guarded by `import.meta.env.DEV`. Not a production concern.

---

## Console / runtime observations

- **`Failed to load resource: 500`** (observed during Account page scroll): Likely a failed dashboard data fetch, probably for the broken Honda Accord photo record or a related edge function call. Non-blocking to layout but potentially the root cause of the P1 thumbnail failure.
- **`POST to clerk-telemetry.com/v1/event failed: net::ERR_ABORTED`**: Non-blocking. Clerk telemetry call being blocked by network/adblocker. Expected in dev environments.
- **`X-Frame-Options may only be set via an HTTP header sent along with a document`**: Meta tag is setting X-Frame-Options via HTML meta, which is ignored by browsers. Should be moved to HTTP response header in Vercel headers config. Non-blocking to visual quality but a mild security hardening gap.
- **No hydration errors** observed during the dashboard walk. The React 18 rendering is stable.
- **No layout shift** observed on any page. Fonts, layouts, and map tiles all load smoothly.

---

## Recommended next visual passes

### Pass V-A: Broken Thumbnail Recovery + "Live Coverage" Copy Fix (P1 trust pair)

These two P1-trust issues share a "production credibility" theme and are safe to fix together.

- **Thumbnail**: Trace the Honda Accord `photo_urls` hydration path. Fix `hydrateSignedStorageUrl()` failure or add a graceful no-photo placeholder (grey/navy rectangle with car icon — not a red blur gradient).
- **Coverage eyebrow**: Change `Live Coverage` → `Coverage Map` in `OperatingRegionsSection.tsx` line 164. Replace `bd-pin-pulse--soft` with a static `MapPin`. Soften copy to "Expanding to your area."
- **Expected impact**: Removes the two most trust-damaging visible failures before a real user reaches soft launch.
- **Risk**: Low. Copy + data-layer change only.

---

### Pass V-B: Mobile Critical CSS Fixes (P1-MOBILE-05 + P2 cluster)

A focused mobile CSS pass covering the CTA orb, hero dead space, "Learn More" contrast, and pills overflow. These are all CSS-level fixes with low risk and high mobile UX impact.

- `overflow-hidden` on CTA section wrapper → fixes orb bleed (P1-MOBILE-05)
- Reduce hero bottom padding at mobile breakpoint → eliminates dead space (P2-UX-08)
- Add `border border-white/20` to "Learn More" in dark mode mobile → button becomes visible (P2-UX-09)
- Add `flex-wrap: wrap` or `overflow-x: auto` to coverage pills row → stops pill clipping (P2-UX-10)
- **Expected impact**: Mobile landing goes from "layout broken" to "polished" in one CSS pass.
- **Risk**: Low. All changes are scoped to media query / overflow / border rules.

---

### Pass V-C: Mobile Quick Actions Audit + Restore (P2-UX-07)

Investigate and fix why only 2 of 4 Quick Action tiles appear on mobile.

- Check whether tiles 3+4 are hidden by a breakpoint rule or simply off-screen
- If hidden: restore to 2×2 grid at mobile
- If off-screen: add `overflow-x: scroll` with scroll indicator, or use 2×2 grid
- Verify that "Connect Insurance" and "Find Shops" are reachable from mobile dashboard by some path
- **Expected impact**: Restores full dashboard navigation access on mobile.
- **Risk**: Low–Medium. Changing a grid layout at mobile breakpoint; must verify no horizontal overflow is introduced.

---

### Pass V-D: Hero Map Immersion + Mobile Map Presence (P1-UX-03 + P1-MOBILE-04)

The highest product-identity impact pass available.

- **Desktop**: Remove/soften hard border on hero map container. Add ambient blue bloom. Convert from "boxed image" to "product window."
- **Mobile**: Add a map presence to the mobile hero. Minimum viable: a static 180px map thumbnail with hero text overlaid as a glass card. This is the single largest perception improvement possible for mobile users.
- **Expected impact**: The product begins to feel like a map product on every device.
- **Risk**: Medium. Must validate at both 375px and desktop widths. Touch map container with care — hero is the product's first impression.

---

### Pass V-E: Dashboard Glass Identity (P2-UX-11 + P2-UX-12)

- Apply `bd-glass-card--dashboard` glass/blur treatment to profile dropdown and notification panel
- Strengthen light mode dashboard warm bloom slightly
- Gold-rim trim on quick action tiles (both modes)
- **Expected impact**: Light mode dashboard becomes a credible premium twin of dark mode. Interactive overlays feel intentional.
- **Risk**: Low. All CSS changes within existing design system token set.

---

_Audit coverage: Production landing — dark mode all sections (desktop + mobile full scroll), light mode hero + all sections (desktop + mobile full scroll). Localhost dashboard — light mode overview + account (desktop), dark mode overview + account + map preview + smart map tools (desktop + mobile). Profile dropdown (light mode, desktop). Notification center (light mode, desktop). Appearance Settings modal (light mode, desktop). Mobile viewport: 487×896px, user-set via browser DevTools (VS Code integrated browser ignores `page.setViewportSize()`). Mobile surfaces NOT walked: New Repair intake flow, Bids tab, modal flows, shop-role surfaces, light mode dashboard mobile._
