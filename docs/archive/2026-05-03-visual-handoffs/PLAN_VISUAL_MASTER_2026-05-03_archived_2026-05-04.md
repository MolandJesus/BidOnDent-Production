---
title: PLAN — Visual Master Polish Plan
date: 2026-05-03
authority: PLAN (future direction; execution only after owner approves a specific pass or bundle)
status: ACTIVE REVISED — V1/V2/V3 shipped; use the new Opus master handoff for the next design pass
dependencies:
  - docs/REF_VISUAL_SYSTEM.md (single source of truth — must not be violated)
  - docs/LAW_PROJECT_RULES.md
  - docs/LAW_HARDENING_PLAN.md
  - docs/MOLANDJESUS_DESIGN_DECISIONS.md §7 + §9
  - docs/archive/2026-05-03-visual-handoffs/visual_audit_sonnet_2026-05-03.md (Sonnet's final audit, integrated below)
  - docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md (surgical next-pass queue)
  - docs/HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03.md (current fresh-chat master prompt)
supersedes: nothing — this is additive planning, not a re-architecture
---

# BidOnDent — Visual Master Polish Plan (Opus 4.7, 2026-05-03)

> **2026-05-03 controlled revision:** V1/V2/V3 shipped, followed by additional premium shell/shadow/map-dialog work. This plan remains useful as the issue ledger and pass history, but the next active handoff is `docs/HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03.md` and the next implementation queue is `docs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md`. Any old examples in this doc that mention pure-white highlights or the previous yellow-amber values are superseded by `LAW_PROJECT_RULES.md` § Light-Mode Surface Rule and § Premium Gold Palette.

> Multi-phase plan to deepen the existing visual identity without dismantling it. Each phase contains scoped passes. **No implementation begins until the owner approves a specific pass by name.**

---

## 0. North star

The product is in a strong, signature place. The mandate is **enhance, not redesign**:

- Add depth, lamp layers, atmosphere, edge sheen, breathing glow, premium chrome.
- Land mobile to the same standard the desktop dark register has reached.
- Close the light/dark twin parity gap by giving light mode its own champagne-gold lamp register (not by repainting in dark colors).
- Lock all current wins — see §3 Preserve list — and verify no existing surface is white-washed or stripped during any pass.
- Resolve the trust gaps Sonnet flagged before any further polish — see Phase A.

What success looks like at the end of Phases A–G (BidOnDent core):

1. Every surface has a gold register that reads at every viewport. No "generic SaaS" zones.
2. Light mode is a credible daylight twin — same identity, less amber, equal premium.
3. Mobile carries the map, not just the copy. Hero communicates spatial product DNA on every device.
4. No fake operational claims. Trust signals are honest at 0 partner shops; out-of-region users see clean state.
5. Dashboard cards, dropdowns, notifications, and tiles share one material system.

Phase H is forward-looking: the Smart Shop Map flagship arc. Separate multi-session track, starts only after Phases A–G are landed.

---

## 1. Gold restraint reconciliation (binding for every pass)

The owner directive ("amazing gold glow / amber hue / beautiful gold cards / premium everywhere / more popping") and the LAW ("gold = lighting/halo/trim, alpha 0.10–0.25, never wallpaper, never primary infill") are both binding. Reconciliation rules every pass must follow:

| Want                                 | Resolution                                                                                                                 | Forbidden                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| "More gold glow in dark mode"        | Add **multi-layer** lamp washes (e.g. existing single layer becomes 2–3 stacked layers at 0.06/0.10/0.14 alpha)            | Raise any single layer above 0.25 alpha or fill a section background gold |
| "Beautiful gold cards in light mode" | **Card chrome** gets champagne/gold — rim, edge highlight, inner sheen, hover halo. Card body stays cool blue/cream glass. | Gold card backgrounds. Gold primary buttons.                              |
| "Amber hue everywhere in dark mode"  | Anchored **lamp lights** on section corners (not full section baths). Edge gradients, top/bottom hairlines.                | More full-section amber baths. Already at the limit with Direction B.     |
| "Premium look on dashboard"          | Gold rim + breathing glow on hover; sheen sweep at very low alpha; ambient particles at <0.08 alpha.                       | Gold infill, gold borders >1px, anything that competes with content.      |
| "Polished mobile"                    | Mobile map presence + chip system + section rhythm + gold accents on bottom tab active state.                              | Adding decorative orbs that overflow narrow viewports.                    |
| "Popping landing"                    | Hero map immersion (remove box), result chip gold edge sheen on hover, section seam gradient bridges.                      | More section colors. More CTA variants. New typography.                   |

**Rule of thumb**: if a change would push a single layer's gold above 0.25 alpha, or would paint a card body gold, or would replace blue with gold for any product/action signal — stop and re-design that change as a multi-layer/chrome/edge effect instead.

---

## 1.5. Cross-cutting depth treatments (binding for every card/panel/dropdown pass)

Owner-confirmed direction (2026-05-03): **more shadow, more 3D effect, more liquid glass.** Plus: **gold richer where it behaves like light, light mode feel more expensive, mobile map-first, trust/copy contradictions before decorative polish.**

**Headline principle (binding for the whole plan):**

> Make the product feel more expensive through glass thickness, shadow hierarchy, luminous edge-light, and spatial depth — not by making everything more gold. Gold should feel like expensive light hitting glass, not gold paint on the UI.

Concretely, this means every pass should aim for:

- **Richer shadows** — multi-layer stack, navy-tinted in light, black with warm inner highlight in dark
- **Stronger inset highlights** — top bezel + bottom shadow inset on every glass surface
- **More layered rim light** — outer rim 0.10 alpha + inner rim 0.04 alpha (refraction edge)
- **Champagne/gold edge glow in light mode** — specular highlights that read as warm sun catching glass
- **Amber lamp bloom in dark mode** — multi-layer lamp atmosphere falloff
- **Clearer glass thickness** — backdrop-blur with saturate boost so atmosphere reads through richer
- **Better separation between cards and background** — outward halo + 3D hover lift
- **Map surfaces feeling embedded and alive** — bloom bleed, ambient glow, no hard frames
- **Mobile getting a real map-first first impression** — Phase B (re-sequenced) addresses this

These are not their own passes — they are _treatments_ that every relevant pass in §5 must apply.

### Liquid glass treatment (applies to every glass surface)

Currently the `bd-glass-*` family reads as flat frosted glass. Upgrade target across all passes:

- **Layered transparency**: each glass card gets two surface layers — outer rim (more opaque, ~0.10 alpha border highlight) + inner body (more translucent, ~0.04 alpha tint). The two layers create a refraction-like edge.
- **Specular highlight**: a 1px linear gradient across the top edge of the card simulating light catching the bezel — `linear-gradient(180deg, rgba(252,240,208,0.16) 0%, transparent 1.5px)` in light mode, slightly warmer/deeper (`rgba(196,144,65,0.12)`) in dark mode. This is the gold-where-it-behaves-like-light principle.
- **Refraction blur**: keep `backdrop-blur-xl` (24px) on glass, but add a saturate boost (`backdrop-filter: blur(24px) saturate(1.4)`) so the underlying atmosphere reads through richer.
- **Edge bleed**: card shadow extends slightly beyond the card boundary as a soft outward halo, creating the impression the card is floating above a lit surface.

### Multi-layer shadow stack (applies to every card/panel/dropdown/tile)

Replace single-shadow treatments with a 3-layer stack to create real 3D weight:

```
box-shadow:
  0 1px 0 rgba(252,240,208,0.10) inset,        /* top inner champagne highlight */
  0 -1px 0 rgba(0,0,0,0.10) inset,             /* bottom inner shadow */
  0 1px 2px rgba(2,6,23,0.04),                 /* contact shadow */
  0 8px 24px rgba(2,6,23,0.08),                /* mid lift */
  0 24px 64px rgba(2,6,23,0.12);               /* ambient depth */
```

Light mode uses cooler navy-tinted shadow channels. Dark mode uses pure black with the inner-highlight warmed slightly (gold-tinted). On hover, the stack deepens — `0 32px 96px` on the ambient layer + brighter inner highlight — simulating the card lifting toward the viewer.

### 3D weight (applies to landing cards, dashboard tiles, all CTAs)

- Hover transform: `translateY(-2px)` on landing cards, `-1px` on dashboard tiles, `-1px` on CTAs. Combined with the deepened shadow stack, creates a clear physical lift.
- Subtle perspective on Quick Action tiles: `transform: perspective(800px) rotateX(0.5deg)` at rest, `rotateX(0deg)` on hover — micro-tilt that reads as depth without animation cost.
- Press state (`:active`): `translateY(0)` + reduced shadow ambient — card returns to the surface with a subtle "press" feel.

### "Gold where it behaves like light" expansion

This is the single most useful framing for the gold restraint reconciliation in §1:

- **Specular highlights** (top bezel, edge sheens, sweep animations) — gold reads as light catching a surface
- **Lamp glows** (atmosphere bloom, anchored radial pools) — gold reads as light source
- **Halos** (focus rings, hover rims, active indicators) — gold reads as light reflecting off an active element
- **Forbidden** (because gold there does NOT behave like light): card backgrounds, button infills, full section baths, body text, semantic chip fills, shadow base color (use navy not gold for shadow)

Every gold use in every pass must be auditable against this filter. If gold isn't behaving like light, it shouldn't be gold.

### Apply-to mapping

| Pass            | Liquid glass | Multi-layer shadow | 3D hover lift | Gold-as-light |
| --------------- | ------------ | ------------------ | ------------- | ------------- |
| B-1 hero map    | ✓            | ✓ (ambient layer)  | —             | ✓ (lamp)      |
| B-4 hero chips  | ✓            | ✓                  | (drift only)  | ✓ (sheen)     |
| B-5 lamp anchor | —            | —                  | —             | ✓ (lamp)      |
| C-1 card rim    | ✓            | ✓                  | ✓             | ✓ (specular)  |
| C-2 card sheen  | ✓            | (preserve C-1)     | ✓             | ✓ (sheen)     |
| D-1 mobile map  | ✓            | ✓                  | —             | ✓ (lamp)      |
| E-2 tile rim    | ✓            | ✓                  | ✓             | ✓ (halo)      |
| E-3 dropdowns   | ✓            | ✓                  | (no hover)    | ✓ (specular)  |
| E-4 dash cards  | ✓            | ✓                  | ✓             | ✓ (specular)  |
| F-1 atmosphere  | —            | —                  | —             | ✓ (lamp)      |
| H-1 status pill | ✓            | ✓                  | ✓             | ✓ (halo)      |
| H-4 empty state | ✓            | ✓                  | —             | ✓ (specular)  |

A pass not in this table either doesn't touch glass surfaces (e.g. A-1 Honda data fix, A-2 copy fix, F-3 conditional pill) or applies a treatment so light it doesn't warrant a row (e.g. D-3 button border).

---

## 2. Sources synthesized

This plan integrates:

1. **Sonnet's final audit** — 13 issues across desktop + mobile, 5 P1, full do-not-fix list, parity table.
2. **Codex's handoff prompt** — the conservative planning rubric (Overall Read / Preserve / P0/P1/P2 / Recommended Passes / Implementation Gate).
3. **My direct reads of the screenshots** — landing dark + light desktop, Coverage Command Center (Mode Midnight + Roadmap), Smart Shop Map (light + dark, panel + full-screen), dashboard light + dark, Account light + dark, mobile dashboard + landing.
4. **Owner directive** — max-detail planning, depth-not-saturation, mobile parity, no white-washing.
5. **Live system law** — `REF_VISUAL_SYSTEM.md` (gold alpha range, sibling utilities, do-not-flatten list).

Where my read differed from Sonnet's (corrections cross-confirmed by independent planning input 2026-05-03):

- **Honda Accord thumbnail**: Sonnet diagnosed as `hydrateSignedStorageUrl` failure. My read of the screenshots is that it's a **flat red rectangle** (not a blur), and other reports on the same code path hydrate fine — so it's a single-record data problem or fallback state, not architecture. Phase A-1 reflects this re-tagging.
- **Hero "still boxed" finding**: I initially suspected a Vercel/main staleness; the desktop dark + light screenshots confirm it's still boxed on the current build. Sonnet was right. Kept as P1.
- **Notification center identity**: Sonnet's "no glass identity" was largely a light-mode read; the dark mode screenshot shows visible gold/amber edge gradient + blue border glow. The pass should focus on the **light mode** dropdown/notification surfaces, not dark.
- **Quick Actions on mobile**: Sonnet flagged "only 2 of 4 tiles visible." Independent re-read suggests the tiles likely **horizontal scroll** rather than being hidden by breakpoint — meaning the issue is **discoverability, not absence**. Pass G-1 should verify scroll behavior first; if scrolling works, the fix is a scroll affordance hint (right-edge gold fade like D-4) rather than a layout rebuild.
- **True P1 design issues** (cross-confirmed): mobile hero no map, "Live Coverage" with empty/out-of-region, CTA orb overflow, desktop hero too boxed. Honda thumbnail and live-activity badge are real but more bounded.

---

## 3. Preserve list (the lock list — do not touch in any pass without owner re-approval)

Every implementation pass must verify NONE of the following are altered:

### Identity & atmosphere

- Dark dashboard navy-lit-by-gold-lamp identity (`bd-dashboard-atmosphere` lower-right amber bloom)
- Dark scrolled header gold-lamp shadow stack: bronze/champagne inset rim + soft warm halo (target palette: `rgba(196,144,65,...)` / `rgba(196,130,45,...)`; avoid the older yellow-amber values)
- Light scrolled header cream-glass-no-gold-trim treatment (intentionally different — REF_VISUAL_SYSTEM.md §1 light/dark table)
- Direction B amber-black sections (Benefits, TrustStats) — owner-authorized warm garage register per MOLANDJESUS_DESIGN_DECISIONS.md §7
- Coverage Command Center "Mode Midnight" treatment (the full-screen landing map experience)
- "Now serving New York · Free for customers" eyebrow + green pulse dot

### bd-\* utility system

- Every `bd-*` class semantic — additions only, no breaking edits
- The intentional sibling carve-outs: `bd-map-control-pill` vs `bd-glass-control`; `bd-bid-card-float` not generic; `bd-report-input` warm cream in light; disabled-chip styling kept separate; role-tinted card rims (blue customer / teal shop / gold insurer); search inputs separate from text inputs

### Landing components

- Hero result chips (`bd-bid-card-float` Sample quote $1,240 / Estimated ETA ~4 days) — drift, animation, glow, mobile-hide
- Hero "Auto Body Repair" amber→blue gradient on dark mobile (Sonnet flagged as the clearest gold expression on mobile)
- HowItWorks 3-card layout, eyebrow, copy
- WhoWeServe 3-role glass cards
- About cards "Learn more" expand affordance
- Coverage section live map + region county outlines (PostGIS data-driven, do not stylize)
- Footer structure, links, legal pages

### Dashboard components

- Sidebar layout, active state pattern (blue highlight + `›` indicator)
- Profile mini-card at sidebar bottom
- "REPAIR OVERVIEW" header card with "New Repair Request" CTA
- Quick Actions tile structure (4 tiles desktop, mobile pass restores 2 missing)
- Report cards: glass treatment, status badges (In Repair green, Pending Bids amber), map/delete actions, chevron
- Account page IDENTITY/SETTINGS structure, profile completion bar, role badge
- `Smoke Test Checklist` dev-gate (`import.meta.env.DEV`)
- Bottom tab bar pattern at mobile (Dashboard/Report/Bids/Account)
- Dashboard mobile map preview card with "Tap to explore full map experience"

### Smart Shop Map (will be polished in Phase H, locked until then)

- Smart Match dropdown + Hybrid/Map/List toggle
- Origin search + location chips (Yonkers / White Plains / New Rochelle / Spring Valley / My Location)
- Full-screen split / list / map toggles
- Status pill bar (ALL / PENDING / APPROVED / IN REPAIR / RESOLVED / DONE) — colors will be polished in H, semantics locked
- Legend: Origin / Selected / Top pick / Reports / Saved / Routes

### Out-of-scope for visual passes

- Auth (Clerk JWT pattern), storage hydration, edge function patterns, map provider (MapLibre + OSM/CARTO), PostGIS coverage queries, schema migrations
- Long-form copy in About cards, legal pages, FAQ — content edits separate from visual passes
- Notification semantics (when to fire, what to log) — separate product-logic work

---

## 4. Issue inventory — synthesized

Sonnet's 13 issues + my 4 additional reads, prioritized by trust + launch criticality.

### P0 — Block soft launch (none currently)

No P0 issues. The trust issues below are P1, but no broken-page-or-crash-class problems found.

### P1 — Must fix before more polish (5 from Sonnet + 1 from my read)

| ID           | Surface                                    | Issue                                                                                  | Source             |
| ------------ | ------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------ |
| P1-TRUST-01  | Dashboard report card                      | Honda Accord red rectangle thumbnail (data, not architecture)                          | Sonnet, my re-read |
| P1-TRUST-02  | Landing OperatingRegions eyebrow           | "Live Coverage" pulse animation + 0 partner shops = false operational claim            | Sonnet             |
| P1-TRUST-NEW | Coverage section + Coverage Command Center | NY service chips visible while live map centers on user GPS far from NY (e.g. Atlanta) | My read            |
| P1-UX-03     | Landing hero (desktop, both modes)         | Map frame still reads as boxed image, not immersive product window                     | Sonnet             |
| P1-MOBILE-04 | Landing hero (mobile, both modes)          | Map entirely absent on mobile — product DNA invisible on primary device                | Sonnet             |
| P1-MOBILE-05 | Landing CTA section (mobile, both modes)   | Decorative orb overflows container — looks like a layout crash                         | Sonnet             |

### P2 — Watchlist (8 from Sonnet + my reads)

| ID         | Surface                                      | Issue                                                                                           |
| ---------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| P2-UX-06   | Benefits → WhoWeServe seam (dark)            | Hard temperature cut between amber-black and cool navy — needs gradient bridge                  |
| P2-UX-07   | Quick Actions (desktop + mobile)             | No gold rim treatment; mobile only renders 2 of 4 tiles                                         |
| P2-UX-08   | Mobile hero (both modes)                     | ~200px dead space between trust chips and HowItWorks                                            |
| P2-UX-09   | Mobile hero "Learn More" dark                | Dark navy on dark navy — near-invisible                                                         |
| P2-UX-10   | Coverage region pills (mobile)               | Pills clip at right edge — third pill truncated to "V"                                          |
| P2-UX-11   | Profile dropdown + notification (light only) | Plain white panels — no glass identity                                                          |
| P2-UX-12   | Light mode dashboard overall gestalt         | Not a true daylight twin of dark — needs champagne-gold register                                |
| P2-COPY-13 | Repair Overview "Live activity" pill         | Always-visible pill implies live state regardless of actual activity                            |
| P2-NEW-14  | Account tile hover tints                     | Help & Support purple, My Vehicles teal — off-system colors leaking through                     |
| P2-NEW-15  | Two amber-bath sections                      | "Why Choose BidOnDent" + "Built on Transparency" both bathe full section in warm — at LAW limit |
| P2-NEW-16  | Hero result chip hover state                 | Chips drift but no premium hover affordance — opportunity for gold edge sheen on hover          |
| P2-NEW-17  | Section seam alternation overall             | Landing alternates cool/warm 4-5x — banded rhythm, not flowing                                  |

---

## 5. Master pass plan — Phases A through G (BidOnDent core)

Each pass is sized to land in a single owner-approved session. Estimated session length is conservative.

### Phase A — Trust & Safety (must ship first)

#### Pass A-1: Honda Accord thumbnail data fix

- **Goal**: Replace the broken thumbnail with either a working photo or a graceful navy/grey placeholder + car icon.
- **Surfaces**: Dashboard → Repair Activity → Honda Accord card (light + dark, desktop + mobile).
- **Approach**: Read the record's `photo_urls`. Either re-upload, drop the bad pointer, or add a render-time guard: if signed URL fails or returns non-image content type, fall back to `<div class="bd-glass-card--dashboard">` with a `<Car>` lucide icon at 50% opacity navy. The fallback styling becomes a permanent guard for future broken photos.
- **Files likely touched**: Dashboard report card component (need to grep `Honda` or `report card`); possibly a small utility for image-load fallback.
- **Classes involved**: Adds nothing new — uses `bd-glass-card--dashboard` + lucide icon system.
- **What must not change**: Other report card visuals; status badge colors; map/delete/chevron actions; the actual `photo_urls` of working records.
- **Verification**: Honda Accord card renders the placeholder (or fixed photo) on dashboard desktop light + dark + mobile. Camry + Mazda thumbnails unchanged. Console clean.
- **Risk**: Low. Single component edit + data check.
- **Session estimate**: 30–45 min.

#### Pass A-2: "Live Coverage" honesty pass

- **Goal**: Stop claiming live operational coverage when 0 partner shops exist.
- **Surfaces**: Landing OperatingRegions eyebrow + section context; Coverage Command Center eyebrow.
- **Approach**: Change `Live Coverage` → `Coverage Map` everywhere it currently reads as operational. Replace `bd-pin-pulse--soft` with a static `MapPin` icon. Soften body copy: "Expanding to your area" or "Building partner coverage across NY" instead of "Find shops near you, right on the map" implying live shops exist.
- **Files likely touched**: `OperatingRegionsSection.tsx` line 164 (per Sonnet); Coverage Command Center eyebrow component.
- **Classes involved**: Removes `bd-pin-pulse--soft` usage in this surface only — keep the utility class; other surfaces may legitimately use it later.
- **What must not change**: The map itself, the county outlines, the live GPS/search functionality, the empty state ("Coverage is expanding · No partner shops within 35 miles yet... as our network grows across NY") which is already honest.
- **Verification**: Eyebrow no longer pulses on landing. Word "Live" gone from coverage chrome. Empty state still shows when 0 shops returned. Pulse utility class still defined and unused (other surfaces can adopt later).
- **Risk**: Low. Copy + class swap.
- **Session estimate**: 30 min.

#### Pass A-3: Out-of-region coverage trust state

- **Goal**: When user GPS is far outside NY service area, the visible map + chips should make that explicit instead of contradicting itself.
- **Surfaces**: Landing OperatingRegions; Coverage Command Center "Shops view" empty state.
- **Approach**: Detect distance from any NY county polygon. If user is >50mi outside any served county, render an "Outside service area" overlay state: dim the live GPS map slightly (50% atmosphere), show a clear card "We're currently NY-only — your area: Atlanta, GA. Join the waitlist for [region]" with a single email-capture input. Coverage region chips become disabled/secondary visual weight until the user clicks one (which then re-centers the map on that NY county for browsing). Honest, helpful, no fake operational claim.
- **Files likely touched**: OperatingRegions section + Coverage Command Center search/shops views; new tiny waitlist input (can reuse `bd-report-input` + existing landing inquiry submission pattern).
- **Classes involved**: Reuses `bd-report-input`, `bd-glass-card--landing`, eyebrow system. Possibly one new state-flag class like `bd-coverage-out-of-region` for the dim atmosphere.
- **What must not change**: Coverage map data layer; PostGIS county polygons; live GPS detection; existing in-region experience (which works fine).
- **Verification**: User in Atlanta sees the out-of-region overlay; user in Yonkers sees the normal in-region map; switching modes preserves state. No new operational claim added. Empty state text reads honestly.
- **Risk**: Medium. Touches a load-bearing landing surface and adds state logic. Requires careful test of in-region path.
- **Session estimate**: 90–120 min.

---

### Phase B — Landing dark mode gold-glow upgrade

These passes deepen the dark register without violating §1 reconciliation rules.

#### Pass B-1: Hero map immersion (desktop dark + light)

- **Goal**: Convert the hero map from "boxed image" to "embedded product window."
- **Approach**: Remove the hard rectangular border on the map container. Replace with a soft glassy inset highlight (champagne/ice-blue top edge, navy at low alpha outside) + ambient bloom: `box-shadow: 0 0 60px rgba(59,130,246,0.20), 0 0 120px rgba(196,144,65,0.06)`. The ambient bloom bleeds the map into the hero atmosphere (blue product signal + faint gold lamp signal). On dark, the gold layer reads as the lamp lighting the scene from above. On light, replace navy bloom with cream/blue-tinted bloom + same faint champagne sheen.
- **Surfaces**: HeroSection map container, both modes.
- **Files likely touched**: `HeroSection.tsx` map container div.
- **Classes involved**: Possibly add a new `bd-hero-map-stage` or extend an existing `bd-map-overlay-card` variant. Lean toward adding rather than mutating.
- **What must not change**: The map content itself, contour layer, route lines, pin pulse, drift animations, result chips, the hero atmosphere bloom that exists outside the map.
- **Verification**: Map no longer reads as a discrete card. The chips still float over it cleanly. Bloom bleeds outward without making the layout shift. Both modes verified at 1440px and 1920px desktop widths.
- **Risk**: Medium. Hero is the first impression — touch with care.
- **Session estimate**: 60–90 min.

#### Pass B-2: Hero amber lamp halo expansion (dark mode)

- **Goal**: Deepen the existing Pass G "lamp from above" pattern with a second softer layer for cinematic depth.
- **Approach**: Currently dark hero has a single amber lamp orb + gold-lamp wash from above. Add a second concentric outer halo layer at lower alpha (0.06) and larger radius — creates a true studio-lamp falloff. Position it slightly off-center to add asymmetric premium feel. Pure CSS additive — no touched markup. Add `prefers-reduced-motion: reduce` guard.
- **Surfaces**: Hero atmosphere only, dark mode only.
- **Files likely touched**: `theme.css` `bd-bloom-atmosphere` (or a sibling `bd-bloom-atmosphere--lamp-outer`).
- **Classes involved**: Possibly one new sibling class.
- **What must not change**: Existing inner amber orb + lamp wash (which is correctly calibrated per Sonnet); light mode hero atmosphere; mobile (no atmosphere on mobile).
- **Verification**: Outer halo visible but does not draw the eye away from the chips or CTA. Total gold alpha load on the hero remains under 0.30 cumulative.
- **Risk**: Low. Pure additive CSS.
- **Session estimate**: 30–45 min.

#### Pass B-3: Dark hero "Best Price" / "Auto Body Repair" contrast nudge

- **Goal**: Improve readability of the blue gradient lines on the deep navy without flattening the gradient itself.
- **Approach**: Two options — (a) raise the lower-end blue stop on the gradient by ~10% lightness (deeper than the current high-end but still vivid); (b) add a subtle 1px text shadow at navy 0.4 to lift the letterforms off the background. Lean toward (a) — keeps the visual signature, just punchier.
- **Surfaces**: HeroSection headline, dark mode only.
- **Files likely touched**: `HeroSection.tsx` headline gradient classes, or the underlying gradient utility.
- **Classes involved**: Possibly extend an existing gradient-text utility.
- **What must not change**: Light mode headline; the amber→blue mobile gradient ("Auto Body Repair" on mobile dark — Sonnet flagged as the strongest mobile gold expression); typography weight, size, line-height.
- **Verification**: WCAG AA contrast for the headline against navy passes. Visual gradient signature still reads.
- **Risk**: Low. Color stop tweak only.
- **Session estimate**: 20 min.

#### Pass B-4: Hero result chip premium hover state (`bd-bid-card-float`)

- **Goal**: Add a premium hover affordance to the Sample quote / Estimated ETA chips without breaking the drift animation.
- **Approach**: On hover, fire a one-shot 600ms gold sheen sweep across the chip face (alpha 0.18 → 0 left-to-right). Add a subtle 1.5px gold edge halo at 0.12 alpha. Drift animation pauses on hover, resumes on hover-out. Mobile unchanged (chips already hidden).
- **Surfaces**: Hero chips (desktop only — mobile hidden).
- **Files likely touched**: `theme.css` — `bd-bid-card-float` :hover state.
- **Classes involved**: Extend `bd-bid-card-float` only. Reuse `bd-liquid-gold-sheen` timing if applicable.
- **What must not change**: Default drift animation, glow direction, chip content/copy, mobile-hide breakpoint.
- **Verification**: Chips drift normally. On hover, sheen sweeps once + edge glow appears + drift pauses. On hover-out, drift resumes from current position.
- **Risk**: Low. Pure CSS hover state on an existing utility.
- **Session estimate**: 30–45 min.

#### Pass B-5: Anchored gold-lamp lighting for amber-bath sections

- **Goal**: Convert the two full amber-bath sections (Why Choose BidOnDent, Built on Transparency) from full-section warmth to **anchored lamp-lit** treatments. Same warm energy, less wallpaper.
- **Approach**: Each amber-bath section gets a single warm radial lamp anchored to one corner (e.g. top-right for Why Choose, bottom-left for Built on Transparency). The lamp falls off across the section so the opposite edge fades back to cool navy/cream. The amber-black floor stays — but only the lit portion reads as warm. Simulates a single hanging studio lamp lighting a workspace.
- **Surfaces**: Why Choose BidOnDent section, Built on Transparency section, both modes.
- **Files likely touched**: Section components or their wrapper backgrounds; possibly `theme.css` for a new `bd-section-lamp-anchor` utility.
- **Classes involved**: New small utility for the anchored radial lamp; reuses existing amber-black palette tokens.
- **What must not change**: The card content, copy, eyebrow system, badges. Direction B is preserved as the floor — only the bath becomes a lamp.
- **Verification**: Each section reads as "a workspace lit by a lamp," not "a sheet of amber paper." Total page gold alpha load drops measurably.
- **Risk**: Medium. Two prominent sections; needs careful taste calibration with the owner.
- **Session estimate**: 90 min.

#### Pass B-6: Section seam gradient bridges

- **Goal**: Soften the cool→warm and warm→cool transitions across the landing.
- **Approach**: Insert a 64–120px gradient bridge between adjacent register-different sections. Bridge fades from prior section's bottom color to next section's top color over the bridge height. Implemented as a thin extra `<div>` between sections with a single linear-gradient background, pointer-events: none. No new components needed.
- **Surfaces**: Specifically Benefits → WhoWeServe (P2-UX-06) and any other warm→cool seam.
- **Files likely touched**: Landing page composition; possibly `theme.css` for a `bd-section-bridge` utility.
- **Classes involved**: New `bd-section-bridge` (small, pure styling).
- **What must not change**: Section internals; the alternating register intent (cool → warm → cool is correct); Direction B sections themselves.
- **Verification**: No more print-registration-error look at section boundaries. Each section still reads as its own register.
- **Risk**: Low. Pure additive markup + CSS.
- **Session estimate**: 45–60 min.

---

### Phase C — Landing light mode champagne-gold cards

The "beautiful gold cards in light mode" directive resolved as **card chrome gold** — not gold card bodies.

#### Pass C-1: Card rim gold trim (light mode landing)

- **Goal**: Give every `bd-glass-card--landing` and `bd-glass-card--landing-warm` a champagne edge highlight in light mode that reads as a lit picture frame.
- **Approach**: Add `box-shadow: inset 0 1px 0 rgba(252,240,208,0.22), inset 0 -1px 0 rgba(140,82,22,0.16), 0 1px 2px rgba(196,144,65,0.06)` (or similar) to the card classes in light mode only. Dark mode keeps current treatment. Effect: a single hairline of warm light along the top of every card, plus a soft outward warm glow at the bottom — like sunlight hitting an upper edge.
- **Surfaces**: All landing cards in light mode (HowItWorks, WhoWeServe, About, Built on Transparency, Coverage panels).
- **Files likely touched**: `theme.css` — extend the `--landing` and `--landing-warm` light-mode rules.
- **Classes involved**: Extend, don't replace.
- **What must not change**: Dark mode card chrome; the card body color; card content.
- **Verification**: Light landing now has consistent champagne edge accent across every card. No card looks unstyled.
- **Risk**: Low. Pure additive shadow.
- **Session estimate**: 30 min.

#### Pass C-2: Card hover gold sheen (light mode landing)

- **Goal**: On hover, run a slow champagne sheen from top-left to bottom-right across the card surface.
- **Approach**: Reuse `bd-liquid-gold-sheen` timing/curve. Gate to `:hover` only. Alpha ceiling 0.10. Light mode gets a clearly visible sheen; dark mode gets a more restrained version (since the card already has stronger gold register).
- **Surfaces**: Same as C-1.
- **Files likely touched**: `theme.css`.
- **Classes involved**: Extend existing card classes; possibly reuse `bd-liquid-gold-sheen`.
- **What must not change**: Default (non-hover) state from C-1.
- **Verification**: Sheen visible on hover at desktop pointer, suppressed on touch via `@media (hover: hover)`.
- **Risk**: Low.
- **Session estimate**: 30–45 min.

#### Pass C-3: Light hero atmosphere depth

- **Goal**: Light hero currently has soft champagne wash. Add a second deeper champagne radial pool for daylight depth.
- **Approach**: Sibling to B-2 but for light: outer champagne radial at 0.08 alpha, larger radius, slightly off-center. Reads as a sun-lit room with bounce light. Add `prefers-reduced-motion` guard.
- **Surfaces**: Light hero atmosphere only.
- **Files likely touched**: `theme.css` `bd-bloom-atmosphere` light-mode variant.
- **Classes involved**: Extend or add sibling.
- **What must not change**: Dark hero; mobile.
- **Verification**: Light hero reads as warm-lit daylight, not flat cream.
- **Risk**: Low.
- **Session estimate**: 30 min.

---

### Phase D — Mobile landing premium

The largest perception-quality phase. Mobile is the primary device.

#### Pass D-1: Mobile hero map presence (P1-MOBILE-04)

- **Goal**: Restore the product's spatial DNA at mobile.
- **Approach**: Add a static 220px-tall map preview below the hero copy (above CTA buttons). Uses the same MapLibre tile layer as desktop but at lower zoom centered on a representative NY area. No interaction — taps anywhere route to `/coverage` or the report flow start. A small `bd-glass-badge` at top of map reads "Coverage map · NY". Lower zoom + fixed center + no interaction keeps tile cost flat.
- **Surfaces**: Landing hero, mobile both modes.
- **Files likely touched**: `HeroSection.tsx` mobile branch; possibly a new `MobileHeroMapPreview` component.
- **Classes involved**: Reuse `bd-map-overlay-card`, `bd-glass-badge`, `bd-section-eyebrow`. New small `bd-mobile-hero-map` for sizing.
- **What must not change**: Desktop hero; the headline + tagline carousel; the CTA buttons; the trust chip row.
- **Verification**: Mobile hero communicates spatial product DNA. No tile loading regression. Tap routes correctly.
- **Risk**: Medium. New mobile-specific component on the landing's most important surface.
- **Session estimate**: 90 min.

#### Pass D-2: Mobile CTA orb overflow fix (P1-MOBILE-05)

- **Goal**: Stop the decorative orb from bleeding outside the CTA card on mobile.
- **Approach**: Add `overflow: hidden` to the CTA section wrapper at mobile breakpoints. Keep desktop's spillover (where the section is wide enough to absorb the orb).
- **Surfaces**: Landing CTA section, mobile only, both modes.
- **Files likely touched**: CTA section component or its wrapper; possibly `theme.css`.
- **Classes involved**: One small mobile media query addition.
- **What must not change**: Desktop orb behavior; orb size, color, animation.
- **Verification**: Orb contained within section on mobile. No visual change at desktop.
- **Risk**: Low.
- **Session estimate**: 15–20 min.

#### Pass D-3: Mobile dark "Learn More" contrast (P2-UX-09)

- **Goal**: Make "Learn More" visible against the dark hero on mobile.
- **Approach**: Add a visible dark-mode mobile border using cool blue/champagne glass (`border-blue-300/30` plus a faint `rgba(252,240,208,0.14)` inset). Text color stays readable. Light mode unchanged.
- **Surfaces**: Hero secondary button, mobile dark only.
- **Files likely touched**: HeroSection secondary CTA component.
- **What must not change**: Light mode appearance; primary "Get Started" button.
- **Verification**: Button has visible boundary at mobile dark. Light mode unchanged.
- **Risk**: Low.
- **Session estimate**: 15 min.

#### Pass D-4: Coverage region pills mobile horizontal scroll (P2-UX-10)

- **Goal**: All region pills accessible on mobile.
- **Approach**: Wrap the row in `overflow-x: auto` with `scroll-snap-type: x proximity` and apply a gold edge fade gradient on the right side to indicate more pills exist. (Alternative: `flex-wrap: wrap`. Horizontal scroll preferred — keeps the row visually compact and signals "more available" via the fade.)
- **Surfaces**: OperatingRegions pill row, mobile.
- **Files likely touched**: OperatingRegions section pill row component.
- **Classes involved**: Possibly one small `bd-pill-row-scroll` utility.
- **What must not change**: Pill content, count, order.
- **Verification**: User can scroll horizontally to see all pills. Right-edge fade visible. No layout shift on first pill.
- **Risk**: Low.
- **Session estimate**: 30 min.

#### Pass D-5: Mobile hero dead space fix (P2-UX-08)

- **Goal**: Eliminate the ~200px blank space between trust chips and HowItWorks.
- **Approach**: Reduce hero section bottom padding at mobile breakpoints. Target ≤48px gap. Verify that D-1 (map preview added) reduces this naturally — if so, this pass becomes a verification + small tightening rather than a separate edit.
- **Surfaces**: Landing hero bottom margin, mobile.
- **Files likely touched**: HeroSection wrapper class or the hero→howitworks transition.
- **What must not change**: Desktop hero spacing.
- **Verification**: Mobile first scroll lands directly into HowItWorks eyebrow.
- **Risk**: Low.
- **Session estimate**: 20–30 min.

#### Pass D-6: Mobile section spacing rhythm

- **Goal**: Quiet polish — verify all section vertical paddings at mobile follow a consistent rhythm (e.g. 64/96/128px).
- **Approach**: Audit current paddings, normalize to a small token set in `theme.css`. No section-by-section custom values.
- **Files likely touched**: `theme.css` spacing scale; section wrappers.
- **What must not change**: Desktop spacing; section content.
- **Verification**: Mobile scroll feels rhythmic, not arrhythmic.
- **Risk**: Low.
- **Session estimate**: 45 min.

---

### Phase E — Dashboard light mode gold-lamp twin

The biggest gestalt gap. Per memory `project_dashboard_d4_gold_reversal.md`, light v3.2 polish is uncommitted — this phase formalizes it.

#### Pass E-1: Light dashboard atmosphere bloom (champagne)

- **Goal**: Give light dashboard the daylight twin of dark's amber bloom.
- **Approach**: Add a second light-mode-only atmosphere layer to `bd-dashboard-atmosphere`: champagne radial pool anchored top-right (or wherever pairs with the dark mode's lower-right amber). Alpha 0.08 max. Reads as morning sun through a window.
- **Surfaces**: Dashboard root, light mode.
- **Files likely touched**: `theme.css` `bd-dashboard-atmosphere` light-mode rule.
- **What must not change**: Dark mode atmosphere (Sonnet: "perfectly calibrated, do not increase intensity").
- **Verification**: Light dashboard has a visible warm anchor that mirrors dark's. Both modes feel like the same identity, different time of day.
- **Risk**: Low.
- **Session estimate**: 30 min.

#### Pass E-2: Quick action tile gold-rim hover (both modes)

- **Goal**: Tiles get clear gold-rim affordance + breathing glow on hover.
- **Approach**: Apply `bd-glass-card--dashboard` gold-rim trim to all 4 quick action tiles. On hover, the rim brightens (alpha 0.18 → 0.28) and a soft breathing glow (3s ease-in-out infinite) cycles. Active state keeps the brighter rim. Light mode rim is champagne, dark mode is amber.
- **Surfaces**: Dashboard Quick Actions tiles, both modes.
- **Files likely touched**: Quick action tile component; possibly `theme.css`.
- **What must not change**: Tile content, icons, copy, click targets.
- **Verification**: Tiles read as premium affordances, not flat cards. Hover + active states both visually clear. Find Shops tile no longer has the off-system warm purple tint.
- **Risk**: Low.
- **Session estimate**: 60 min.

#### Pass E-3: Light mode profile dropdown + notification glass identity

- **Goal**: Both overlays carry the same glass material as the rest of the light dashboard.
- **Approach**: Apply `backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(2,6,23,0.08)]` to both panels in light mode. Add a subtle champagne edge accent (similar to C-1). Dark mode keeps current treatment — Sonnet's flag was light-mode-specific.
- **Surfaces**: Profile dropdown, notification center, light mode only.
- **Files likely touched**: ProfileDropdown component, NotificationCenter component.
- **What must not change**: Dark mode treatments; menu/notification content; semantics.
- **Verification**: Both overlays read as part of the dashboard material system in light mode.
- **Risk**: Low.
- **Session estimate**: 45 min.

#### Pass E-4: Light dashboard card chrome champagne treatment

- **Goal**: Mirror C-1 for dashboard cards.
- **Approach**: Same edge highlight + outward warm glow pattern applied to `bd-glass-card--dashboard`. Tuned slightly cooler than landing (dashboard is a calmer register).
- **Surfaces**: All dashboard cards in light mode.
- **Files likely touched**: `theme.css`.
- **What must not change**: Dark mode dashboard cards; card content.
- **Verification**: Light dashboard cards have consistent edge highlight matching landing.
- **Risk**: Low.
- **Session estimate**: 30 min.

---

### Phase F — Dashboard dark mode amber atmosphere refinement

Already strong — these passes deepen, not redo.

#### Pass F-1: Multi-layer ambient atmosphere

- **Goal**: Add a second outer halo to the existing amber bloom for cinematic depth.
- **Approach**: Sibling layer to `bd-dashboard-atmosphere` dark amber, larger radius, alpha 0.05. Adds depth without raising peak gold.
- **Surfaces**: Dashboard root, dark mode.
- **Files likely touched**: `theme.css`.
- **What must not change**: Existing inner bloom (Sonnet locked).
- **Verification**: Dashboard has visible falloff depth. Total cumulative gold alpha across the surface still reads as restrained.
- **Risk**: Low.
- **Session estimate**: 30 min.

#### Pass F-2: Account tile color tint cleanup (P2-NEW-14)

- **Goal**: Replace off-system purple/teal tints with bd-\* gold-rim hover.
- **Approach**: Identify the source of Help & Support purple and My Vehicles teal (likely Tailwind defaults or stale per-tile overrides). Replace with the same E-2 gold-rim hover treatment.
- **Surfaces**: Account page Profile Tools tiles.
- **Files likely touched**: Account page tile components.
- **What must not change**: Tile labels, icons, navigation.
- **Verification**: All Account tiles use unified gold-rim hover; no off-system colors.
- **Risk**: Low.
- **Session estimate**: 30 min.

#### Pass F-3: "Live activity" pill conditional (P2-COPY-13)

- **Goal**: Pill only shows when the user has at least one report in "In Repair" status.
- **Approach**: Add a conditional render: `if (reports.some(r => r.status === 'In Repair')) <LiveActivityPill />`. Otherwise omit. No new copy.
- **Surfaces**: Dashboard Repair Overview header card.
- **Files likely touched**: Repair Overview header card component.
- **What must not change**: Pill styling when shown; other header card content.
- **Verification**: Pill present for users with In Repair work, absent otherwise.
- **Risk**: Low.
- **Session estimate**: 20 min.

---

### Phase G — Mobile dashboard polish

#### Pass G-1: Mobile Quick Actions restore (P2-UX-07 mobile half)

- **Goal**: All 4 tiles accessible on mobile.
- **Approach**: Verify whether tiles 3+4 are hidden by breakpoint or below the fold. If hidden: restore as 2×2 grid at mobile. If below fold: move them above the report cards or add scroll affordance. Recommendation: 2×2 grid — keeps all actions visible without scroll.
- **Surfaces**: Dashboard Quick Actions, mobile.
- **Files likely touched**: Quick Actions component grid layout at mobile breakpoint.
- **What must not change**: Desktop 4-column layout; tile content.
- **Verification**: All 4 tiles visible on mobile dashboard above the fold. No horizontal overflow.
- **Risk**: Low–Medium.
- **Session estimate**: 30–45 min.

#### Pass G-2: Mobile dashboard report card touch state polish

- **Goal**: Add a clear pressed-state visual on tap.
- **Approach**: On `:active`, the card gets a brief sheen + 1px gold rim flash. Reuses C-2 sheen tooling.
- **Surfaces**: Mobile dashboard report cards.
- **Files likely touched**: Report card component or `theme.css` `bd-glass-card--dashboard`.
- **What must not change**: Default state; map/delete actions; status badges.
- **Verification**: Tap feels premium and responsive.
- **Risk**: Low.
- **Session estimate**: 30 min.

#### Pass G-3: Bottom tab bar gold accent on active

- **Goal**: Active tab gets a subtle gold underline accent in addition to the current blue fill.
- **Approach**: Add a 2px gold gradient line under the active tab icon, alpha 0.25. Light + dark.
- **Surfaces**: Bottom tab bar, mobile.
- **Files likely touched**: BottomTabBar component or `theme.css`.
- **What must not change**: Tab icons, labels, active blue fill, touch targets.
- **Verification**: Active tab has clearer signal without competing with the blue fill.
- **Risk**: Low.
- **Session estimate**: 20 min.

---

## 6. Phase H — FUTURE: Smart Shop Map flagship arc (separate multi-session track)

> Owner: this phase is the future flagship product you mentioned (the second full-screen map — slightly apart from BidOnDent). **Do not start until Phases A–G are fully landed and stable.** This is a strategic forward-look, not a polish pass.

### H-0 — Strategic framing (no code)

The Smart Shop Map (dashboard `/shops` full-screen experience) is the most premium-feeling surface in the screenshots. It already has a real product identity:

- Smart Match dropdown + 4.5+ rating filter + Hybrid/Map/List view modes
- Dark "Auto" / Light "Dark" theme toggles per-experience
- Status pill bar (ALL / PENDING / APPROVED / IN REPAIR / RESOLVED / DONE)
- Origin pin + clustered shop pins with color semantics (Origin / Selected / Top pick / Reports / Saved / Routes)
- Split / List / Map full-screen toggles
- "Search this area" pill
- Empty state ("No shop selected · Tap a shop on the map to see details")

Direction for the flagship arc: **deepen what's there, don't reinvent**. Treat the Coverage Command Center on landing as the consumer-facing entry point and Smart Shop Map as the operator/dashboard depth product. They share visual language but have different intensities — landing CCC is "premium showcase," Smart Shop Map is "operational tool with premium feel."

### H-1 — Status pill bar gold-trim active

- Active pill gets a gold rim + breathing glow (sibling to E-2). Inactive pills stay quiet.
- Status semantic colors (orange pending, green approved, blue in repair, slate resolved, dark done) preserved.

### H-2 — Pin glow upgrade

- Origin pin: blue concentric pulse (current) + outer gold ring at 0.10 alpha
- Selected shop pin: gold center + amber outer halo (currently just a ring — upgrade to lit lamp)
- Top pick: existing ice-blue/cream center + add a subtle gold star micro-affordance on hover
- Cluster pins: deeper navy + amber rim count badge

### H-3 — "Search this area" interaction

- On press, gold sheen sweeps across the pill, fades into a brief glow, then returns to default
- Reuses C-2 sheen tooling

### H-4 — Empty state card identity

- "No shop selected" card gets `bd-glass-card--dashboard` glass treatment + champagne edge in light + amber lamp in dark
- Adds personality to the most-seen state

### H-5 — Layer toggle + theme toggle gold ring on active

- Active layer/theme button gets a gold rim halo

### H-6 — Split mode polish

- Split divider becomes a subtle vertical gradient (cool blue at top → warm gold at bottom) — visual signal that the two halves complement
- Drag affordance on the divider is a champagne-edged grab handle

### H-7 — Performance + tile loading

- Skeleton state for the map while tiles load — uses the gold-flow utility (`bd-liquid-gold-flow`) at low alpha as the placeholder
- Stops the brief blank-tile flash at first load

### H-8 onwards — TBD with owner

- Multi-stop routing visual polish
- Saved shops collection card surface
- Compare bids inline overlay polish
- Operator-mode (insurer/shop) variants of the map experience

---

## 7. Pass sequencing rationale (UPDATED 2026-05-03 per owner direction)

**Phase letters in §5 are kept for traceability.** Execution order overrides the alphabetical sequence — the new ordering reflects "trust → mobile map-first → liquid glass depth → gold light → flagship" priority confirmed by the owner.

### Execution order

| Order | Phase / Passes                         | Why now                                                                                                                                                                                                                           |
| ----- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **A-1, A-2, A-3**                      | Trust before polish. No amount of glow fixes a "Live Coverage" + 0-shops contradiction or a broken thumbnail.                                                                                                                     |
| 2     | **D-1, D-2** (then D-3, D-4, D-5, D-6) | Mobile map-first: D-1 restores core product DNA on the primary device. D-2 fixes the orb overflow that reads as a layout crash. The other D passes follow.                                                                        |
| 3     | **B-1** (then B-2, B-3, B-4)           | Hero map immersion + ambient lamp + chip premium hover. The "embedded and alive" map surface principle landed first on the highest-traffic surface.                                                                               |
| 4     | **C-1, C-2, C-3** + **B-5, B-6**       | Liquid glass depth + gold-as-light treatment landing-wide: card rim/sheen for both modes (C-1, C-2), light hero atmosphere depth (C-3), anchored lamp lighting for the two amber-bath sections (B-5), section seam bridges (B-6). |
| 5     | **E-1, E-2, E-3, E-4**                 | Dashboard light gold-lamp twin: atmosphere, tile rim, dropdown/notification glass, card chrome. Closes the biggest light/dark parity gap.                                                                                         |
| 6     | **F-1, F-2, F-3**                      | Dashboard dark depth refinement + Account tile cleanup + Live activity conditional.                                                                                                                                               |
| 7     | **G-1, G-2, G-3**                      | Mobile dashboard polish — applies the system that B/C/E built, on the dashboard's mobile surfaces.                                                                                                                                |
| 8     | **H-0 onwards (DEFERRED)**             | Smart Shop Map flagship — its own multi-session arc. Do not start until 1–7 are landed and stable.                                                                                                                                |

### Why this ordering vs. the original alphabetical

- **D-1 moves to #2** because mobile hero map absence is core-product-DNA-broken. Any decorative depth landed before it would look strange on a mobile hero that has no map.
- **B-1 follows D-1** so the same map-immersion principle (no boxed frames, ambient bloom, embedded into atmosphere) is consistent across desktop + mobile from the start.
- **C and B-5/B-6 collapse into one block** because they're all "liquid glass + gold-as-light" treatments at landing scope. Landing them together means one consistent visual sweep across the page rather than three separate sweeps.
- **E + F + G stay together as the dashboard sweep** for the same reason: one consistent dashboard treatment pass is cleaner than fragmented work.
- **H stays deferred** — it's the future flagship, not soft-launch scope.

### Why NOT to interleave

The temptation to bundle "all mobile" or "all dark" or "all light" into single passes is real but counterproductive:

- **Trust fixes are scoped narrowly on purpose** — a wide pass risks bleeding scope into polish.
- **Mobile and desktop share the same components** in most cases, so a "mobile-only" pass that isn't D-1 quickly becomes a "responsive everything" pass.
- **Light and dark share the same `bd-*` utilities**, so mode-specific passes risk forking the system. Better to pass per surface (cards, dropdowns, atmosphere) and let each touch both modes.

---

## 7.5. Recommended build pass bundles (V1 / V2 / V3 — RECOMMENDED EXECUTION SHAPE)

The §7 phase ordering is the canonical sequence. For practical execution, those 7 phases collapse into **3 build pass bundles** that align with soft-launch hardening cadence:

### V1 — Coverage Trust + Mobile Landing Critical Fixes (highest launch value)

**Bundles**: A-1, A-2, A-3, D-2, D-3, D-4, D-5

**Scope**:

- Honda Accord thumbnail → premium no-photo state
- "Live Coverage" → "Coverage Map" / static pin / honest empty state
- Out-of-region GPS overlay ("You're outside our current NY service region")
- "Live activity" dashboard badge → conditional or renamed (F-3 pulled forward into V1)
- Mobile CTA orb overflow → `overflow-hidden`
- Mobile hero ~200px dead space → padding tightening
- Mobile dark "Learn More" → visible border
- Coverage region pills → wrap or horizontal scroll with fade

**Why this bundle first**: Trust + mobile critical breakage. No amount of premium polish fixes a broken trust signal or a layout-crash-looking orb.

**Estimated**: 1–2 sessions. Low–Medium risk.

---

### V2 — Mobile Hero Map Presence + Desktop Hero Integration

**Bundles**: D-1, B-1, B-3, B-4

**Scope**:

- Mobile hero gets a 180–240px map intelligence strip (D-1) — core product DNA on the primary device
- Desktop hero map immersion (B-1) — soften frame, ambient bloom, embedded into atmosphere
- Dark hero headline contrast nudge (B-3) — brighten "Auto Body Repair" gradient
- Hero result chip premium hover state (B-4) — gold sheen + edge halo

**Why this bundle second**: Hero is the product's first impression on every device. Once trust is honest (V1) and the hero communicates the map-first product DNA on mobile + desktop, the rest of the polish lands on a credible foundation.

**Estimated**: 2 sessions. Medium risk (touching the most-seen surface).

---

### V3 — Landing/Dashboard Gold-Light Premium Lift (the full sweep)

**Bundles**: B-2, B-5, B-6, C-1, C-2, C-3, E-1, E-2, E-3, E-4, F-1, F-2, G-1, G-2, G-3

**Scope**: The full liquid-glass + gold-as-light sweep across landing and dashboard, both modes, both viewports. Applies the §1.5 cross-cutting treatments (multi-layer shadow, liquid glass, 3D lift, gold-as-light specular highlights) to every relevant surface.

**Why this bundle third**: The premium polish is real and load-bearing for the brand, but it lands best on top of an already-trustworthy and already-mobile-correct product. Sweeping in this order avoids polishing surfaces that still need restructuring.

**Sub-bundles within V3** (to keep individual sessions reviewable):

- V3a: Landing dark depth (B-2, B-5, B-6) — anchored lamps, section bridges, hero atmosphere depth
- V3b: Landing card chrome (C-1, C-2, C-3) — champagne rim, hover sheen, light hero atmosphere
- V3c: Dashboard light twin (E-1, E-2, E-3, E-4) — atmosphere, tile rim, dropdowns, card chrome
- V3d: Dashboard dark depth + cleanup (F-1, F-2) — multi-layer atmosphere, account tile cleanup
- V3e: Mobile dashboard polish (G-1, G-2, G-3) — quick actions affordance, touch state, tab bar accent

**Estimated**: 5–6 sessions across the V3 sub-bundles. Low–Medium risk (each sub-bundle is constrained).

---

## 7.6. The two-track map strategy (BidOnDent Map vs. Future Full Map Program)

There are now **two distinct map product tracks**. They share visual language and code where appropriate, but they have different scopes, intensities, and timelines.

### Track 1 — BidOnDent Map (current product, soft-launch scope)

**Surfaces**:

- Landing hero map (Liquid Map Intelligence scene)
- Landing OperatingRegions live coverage map
- Landing Coverage Command Center (Mode Midnight / Roadmap full-screen)
- Dashboard mobile map preview card
- Dashboard report-card map link

**Scope discipline**:

- Coverage trust (V1) is the load-bearing requirement
- Service-region clarity (in-region vs. out-of-region states)
- Map controls — keep `bd-map-control-pill` family
- Empty/out-of-region honesty — no fake operational claims
- Mobile preview quality (V2)
- Visual polish via §1.5 treatments where map surfaces appear

**Hard rule**: BidOnDent Map must not carry feature complexity from the future map program during hardening. If a Smart Shop Map feature is tempting to backport, defer.

### Track 2 — Future Full Map Program (Phase H, deferred multi-session arc)

**Surfaces** (existing scaffolding):

- Dashboard `/shops` Smart Shop Map (panel + full-screen split + list / map / hybrid)
- Status pill bar (ALL / PENDING / APPROVED / IN REPAIR / RESOLVED / DONE)
- Smart Match dropdown + 4.5+ filter + theme toggle
- Origin pin + clustered shop pins + legend
- "Search this area" pill
- Empty state ("No shop selected · Tap a shop on the map to see details")

**Scope direction**:

- Separate product language — more cinematic, more immersive, fewer marketing constraints than landing
- Bigger map shells, deeper command center panels, more sophisticated layer/search/navigation
- Borrow `bd-*` utilities from BidOnDent but allowed to extend with map-program-specific siblings
- Premium operational tool feel — for shops, insurers, operators

**Hard rule**: Do not start Phase H until V1, V2, V3 are landed and stable on BidOnDent core. The future map program planning track is its own brief, not a soft-launch deliverable.

---

## 8. Verification per pass (universal checklist)

Every pass implementation must:

1. **Run build** before declaring done.
2. **Walk both modes** of the affected surface — light + dark — at desktop AND mobile breakpoints (375px / 487px / 768px / 1440px / 1920px where applicable).
3. **Verify Preserve list intact** — explicitly check that nothing in §3 has changed.
4. **Verify gold alpha ceiling** — no single layer above 0.25 alpha, no card body painted gold, no primary button infill gold.
5. **Verify `prefers-reduced-motion`** guards on any new animation.
6. **Verify mobile motion budget** — no new animation that violates KI-062 mobile-disabled pattern.
7. **Update REF_VISUAL_SYSTEM.md** in the same pass if a new utility or system fact is added.
8. **Update REF_KNOWN_ISSUES.md** if a bug was fixed (with KI-### number per LAW co-update rules).
9. **Note the pass + skill in commit message** so future agents can find it.

---

## 9. Implementation gate

**Status**: PLAN ONLY. No code changes.

The following are required from the owner before implementation begins on any pass:

1. **Approve the bundle by ID** — recommended: approve V1 to begin (covers A-1, A-2, A-3, D-2, D-3, D-4, D-5, plus F-3 pulled forward). Then V2, then V3 sub-bundles.
2. **Confirm scope** — anything in the Preserve list (§3) that the owner wants to specifically authorize touching for that pass should be called out.
3. **Confirm session shape** — bundles can run as one session each, or sub-bundles can be split across sessions. Recommendation: V1 in one session, V2 in two sessions (D-1 + B-1 the heavy ones), V3 sub-bundles one per session.
4. **Confirm the branch parity question** — current work is on `BidOnDent-Horizon-Beta`, Vercel pulls from `main`. Each pass should declare which branch it lands on and whether main needs syncing for owner verification.

After each approved pass:

- Owner reviews the result (build + walk).
- If accepted, the pass commit lands. Plan moves to next pass.
- If rejected, pass is rolled back. Plan updated with the lesson.

The plan does NOT pre-authorize any sequence. Each pass is its own approval gate.

---

## 10. Open questions for the owner

Before Phase A starts, please confirm or redirect on:

1. **Honda Accord placeholder vs photo recovery**: If the photo is recoverable, do we re-upload, or do we land the placeholder pattern as a permanent broken-photo guard (safer for future)?
2. **"Live Coverage" copy alternative**: Acceptable replacements: "Coverage Map" / "NY Coverage" / "Service Coverage" / something else?
3. **Out-of-region waitlist (A-3)**: Is collecting an email + region acceptable as a Phase A scope addition, or should the out-of-region state just dim the map + show "NY-only currently" with no email capture (smaller scope, ships faster)?
4. **Phase B-5 lamp anchor direction**: Top-right + bottom-left for the two amber-bath sections, or do you have a directional preference (e.g. both anchored from top to imply ceiling-mounted lamps)?
5. **Phase D-1 mobile map preview**: Static fixed center on a NY area (low cost, no live tile load), or live GPS-aware (higher cost, more product-true)? Static is recommended for Phase D; live GPS can be a follow-up.
6. **Phase H gating**: What's the owner's expected window for starting the Smart Shop Map flagship arc — immediately after Phase G, or a deliberate pause to gather user signal first?

---

_End of plan. Awaiting owner approval to begin Phase A._
