# BidOnDent — Visual System (REFERENCE)

**Authority level:** REFERENCE — single source of truth for the current visual system.
**Last updated:** 2026-05-03
**Supersedes:** `PLAN_LANDING_REDESIGN.md`, `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md`, `PLAN_LANDING_BUTTON_SYSTEM_ADOPTION.md`, `PLAN_LANDING_DARK_MODE_PARITY.md` (all archived 2026-05-03 under `docs/archive/`).

> Read this doc for any visual/design work. The long-form _philosophy_ still lives in `MOLANDJESUS_DESIGN_DECISIONS.md` — this doc is the operating snapshot of what's actually in the code.

---

## 1. Identity

**One sentence:** Cool blue glass surfaces lit by premium bronze/champagne gold studio-lamp atmosphere, on a map-first product world.

| Element                     | Role                                                                                                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blue**                    | Product / action / route / selection. Royal blue for primary CTAs, soft blue for atmosphere, navy depth, gray-blue subdued.                                                                                                         |
| **Gold (bronze/champagne)** | Lighting / halo / trim / marketplace energy. Glow, rim trim, lamp wash, warm light. **Never primary button infill, never yellow paint, never whitewash.** Canonical palette lives in `LAW_PROJECT_RULES.md` § Premium Gold Palette. |
| **Glass**                   | Trust / structure. Use the `bd-glass-*` family — never hand-roll inline `backdrop-blur`.                                                                                                                                            |
| **Map lines / pins**        | Discovery / local network / spatial intelligence. The product is map-first; visual identity reinforces that.                                                                                                                        |

### Light vs dark mode

|                       | Light                                                        | Dark                                                                 |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Body**              | Frosted daylight glass with controlled champagne/gold warmth | Navy map/intelligence world with gold-lamp top-light                 |
| **Hero atmosphere**   | Deeper amber radial pools (warm-lit)                         | Cool blue pools + warm gold lamp wash from above (Pass G 2026-05-03) |
| **Header (scrolled)** | Cream-tinted glass, no gold trim                             | Navy glass + inset gold trim line + ambient gold glow halo           |
| **Cards**             | `bd-glass-card--landing` with gold rim trim at low alpha     | Same shell, slightly stronger gold rim                               |

Dark mode is the more cinematic register. Light mode is the daylight twin — same identity, less amber dominance.

### Hard Light-Mode Guardrail

Light mode is **not** a white SaaS palette. Per LAW, premium surfaces in light mode must remain cool blue-gray / ivory / cream / champagne liquid glass with bronze trim and navy-warm shadow depth. Do not introduce `#fff` or `rgba(255,255,255,*)` as a panel, section, card, shell, dropdown, modal, or bottom-nav body color. Tiny icon backgrounds can be audited case-by-case, but any load-bearing surface that turns pure white is a regression.

The owner-approved warm palette is bronze/champagne leaning:

- Top/corner lamp halo: `rgba(196, 144, 65, ...)`
- Deeper outer/far warm halo: `rgba(196, 130, 45, ...)`
- Bronze trim: `rgba(140, 82, 22, ...)`
- Cream/champagne inset light: `rgba(252, 238-240, 204-208, ...)`
- Warm-tile inner depth: `rgba(110, 70, 18, ...)`

Avoid the older yellow-amber register (`rgba(220,165,90,*)`, `rgba(220,140,50,*)`, `rgba(254,248,220,*)`, `rgba(160,95,25,*)`) unless reading it as historical code that is being replaced.

### Landing vs Dashboard Gold

Landing is allowed to be more eye-catching. Stronger solid warm/gold story areas can exist where they act as product narrative bands, especially in the hero, benefits/trust, CTA, and transition sections.

Dashboard must be more professional. Gold lives as lamp-light, edge trim, focus halo, sheen, and shadow warmth on cool blue glass. Do not paint dashboard cards gold just because the landing can carry stronger warm sections.

### Current Baseline After 2026-05-03 Passes

The current premium baseline includes:

- V1/V2/V3 visual hardening (trust copy, mobile hero map presence, hero immersion, card sheen/depth).
- Sidebar/header/search shell retuned to locked bronze/champagne gold language.
- Atmospheric shadow falloff on dashboard panels and sections in both modes.
- Hero map opens the full landing coverage map only through a double-tap / mouse double-click gate.
- Full landing `CoverageMapDialog` shells retuned to premium gold + cool blue in both light and dark.
- **8-criteria dark depth bar** (KI-069 + Bucket 2.3 RESOLVED 2026-05-03) — see subsection below.
- **Asymmetric downward bronze halo** on `.bd-dashboard-panel` so stacked panels breathe and shadows bias below per "lamp from above" convention (KI-072).
- **Premium gold lamp atmosphere** on dashboard + landing — top corners, gutters, bronze floor wash on dark dashboard; restrained parallel stack on landing (KI-073).

Future agents should treat these as shipped wins. Improve them only by adding depth, polish, viewport correctness, and material consistency.

### 8-Criteria Dark Depth Bar (binding contract for new dark surfaces)

Every dark `.bd-dashboard-panel`, `.bd-dashboard-section`, premium card, popover, sheet, modal, or map shell in this codebase must satisfy all 8 criteria below or have an explicit reason documented in `REF_KNOWN_ISSUES.md`. Light mode follows a parallel cool-shadow-on-cream grammar (cream inset highlight + bronze trim + cool blue ring + cool blue navy-cool shadow).

| # | Criterion | Spec |
|---|---|---|
| 1 | Top inset bevel | `inset 0 1px 0 rgba(196, 144, 65, 0.16-0.24)` — gold lamp from above (panel ~0.22, section ~0.18) |
| 2 | 2-layer black drop | close `0 8-12px rgba(2,6,23,0.35-0.50)` + far `0 16-22px rgba(2,6,23,0.18-0.36)` — softened per Bucket 6 to prevent stacking shadow collision |
| 3 | Bronze atmospheric halo | `0 0 60-110px rgba(196,130,45,0.06-0.14)` — premium gold "the room is lit" feel |
| 4 | Bottom rim | `inset 0 -1px 0 rgba(140, 82, 22, 0.18-0.22)` — bronze depth seam |
| 5 | Cool blue 1px ring | `0 0 0 1px rgba(96, 165, 250, 0.14-0.24)` + `border: 1px solid rgba(96, 165, 250, 0.20-0.26)` |
| 6 | Body | navy gradient `linear-gradient(180deg, rgba(10,22,45,0.88-0.92), rgba(7,16,33,0.84-0.88))` — no white ≥70% alpha on any panel surface |
| 7 | Edge catchlights (Bucket 2.3) | `inset 1px 0 0 rgba(252,240,208,0.10), inset -1px 0 0 rgba(252,240,208,0.06)` — left brighter than right (lamp from upper-left convention). Section uses 0.08/0.05 (lower than panel since sections nest inside) |
| 8 | Hover/focus catchlight (Bucket 2.1) | hover gold halo `0 0 24-32px rgba(196,130,45,0.18-0.22)` + cool blue ring brightens to 0.32 + inset bevel brightens to 0.28; focus-visible adds an outer accessibility ring |

**Where the depth bar lives in code:** `src/styles/theme.css` `--bd-dashboard-panel-shadow` (dark) + `--bd-dashboard-section-shadow` (dark). Variants (`.bd-dashboard-panel--deep`, `--accent-blue`, `--accent-cyan`, `--accent-indigo`) inherit and override only what they need.

**Asymmetric bias rule (KI-072):** the asymmetric downward bronze halo `0 24px 60px rgba(196,130,45,0.10)` is applied ONLY to `.bd-dashboard-panel` (dark) — sections, popovers, landing cards, and map shells use symmetric atmospheric halos because they don't sit in a vertical stacking grid where shadows would collide.

**Light mode parallel:** light follows a different grammar (cool-shadow-on-cream) and SKIPS criterion 7 (cream-on-cream catchlight is invisible) and criterion 3's atmospheric bronze (light atmospheric halo lives at lower alpha 0.06-0.14 instead of dark's 0.10-0.16). Light mode polish is held to "slight only" per owner directive — no over-cream regressions.

The active next-pass docs are `PLAN_VISUAL_MASTER_2026-05-03.md`, `PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md`, and `HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03.md`. Earlier Sonnet/Opus visual audit handoffs are archived under `docs/archive/2026-05-03-visual-handoffs/` and should not be treated as current instructions.

### Mobile Viewport Doctrine

Mobile is not a squeezed desktop. It is the primary real-world surface for a customer standing near a damaged vehicle.

- Preserve dashboard bottom tabs; they are the correct mobile navigation pattern.
- Keep core content above the bottom browser toolbar and `env(safe-area-inset-bottom)`.
- Keep report-flow headers/progress compact enough that the active form step is visible without excessive first-scroll.
- Keep map surfaces map-first. A full-screen mobile map should not default to a huge sheet that hides the map; start with a compact sheet/peek state, then let the user expand it.
- Avoid duplicated close controls in mobile map/dialog stacks.
- Single taps may scroll, focus, or reveal context; fullscreen map should stay gated by the owner-approved double-tap behavior.

---

## 2. The `bd-*` utility inventory

What each system class is for. Defined in [`src/styles/theme.css`](../src/styles/theme.css).

### Buttons

| Class                         | Purpose                                                                                              | Notes                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bd-dashboard-primary-button` | Canonical primary CTA shell. rounded-2xl, gold-lamp trim, premium hover/active/focus.                | Adopted across landing CTAs, dashboard quick actions, auth submits, onboarding, modals, legal pages, and the root error boundary. Consumer supplies `style={{ background }}` for the gradient. |
| `bd-report-primary-button`    | Report-flow primary CTA. Sibling to dashboard primary; tuned for the report wizard's warmer surface. | Used inside report wizard steps.                                                                                                                                                               |
| `bd-glass-control--*`         | Glass control buttons (`primary`, `secondary`, `utility`, `destructive`).                            | Hierarchical button family below CTA.                                                                                                                                                          |

### Inputs

| Class             | Purpose                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bd-report-input` | Canonical text/email/tel/textarea field. Warm cream bg in light, navy in dark, gold focus ring + translateY lift. |

Adopted: report flow (StepDescription etc.), shop+insurer onboarding, auth (Login/Signup), landing inquiry forms (Shop/Insurer), account modals (EditProfile name/phone, ShopProfile name).

### Cards & glass

| Class                         | Purpose                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| `bd-glass-panel`              | Base glass surface.                                                  |
| `bd-glass-card`               | Generic premium card.                                                |
| `bd-glass-card--landing`      | Landing premium-marketing anchor cards (cool register).              |
| `bd-glass-card--landing-warm` | Landing Direction B warm-amber sections only (TrustStats, Benefits). |
| `bd-glass-card--dashboard`    | Dashboard tier card (calmer than landing).                           |
| `bd-glass-floating`           | Floating glass element (e.g. nav drawers, popovers).                 |
| `bd-glass-badge`              | Pill / chip surface.                                                 |

### Map controls (intentional sibling system)

| Class                 | Purpose                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `bd-map-control-pill` | Map control buttons (zoom/recenter/etc.). Stronger contrast than `bd-glass-control` because it must read against MapLibre tiles. |
| `bd-map-overlay-card` | Overlay panels on top of MapLibre. Same rationale.                                                                               |

### Atmosphere & motion

| Class                                      | Purpose                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `bd-bloom-atmosphere`                      | Hero entry-bloom container. Renders atmosphere with a 700-ish ms ease-in. `is-hidden` / `is-visible` toggles. |
| `bd-dashboard-atmosphere`                  | Dashboard root atmosphere. Top-anchored radial glow, cool-blue family, no animation.                          |
| `bd-shell-header` (+ `--light` / `--dark`) | App shell header glass with gold-lamp trim.                                                                   |
| `bd-section-eyebrow`                       | Section eyebrow badge styling.                                                                                |

### Liquid Map Intelligence layer (hero scene)

| Class                                          | Purpose                                                                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bd-map-contour` (+ `--dark`)                  | Static topographic-style line pattern background.                                                                 |
| `bd-liquid-gold-flow` (+ `--light` / `--dark`) | Drifting liquid gold marketplace-energy ambient.                                                                  |
| `bd-liquid-gold-sheen`                         | Slow gold sheen sweep across glass (~28s loop).                                                                   |
| `bd-route-line`                                | SVG route line with shimmer animation.                                                                            |
| `bd-pin-pulse` (+ `--soft`)                    | Concentric ring pulse for the report pin.                                                                         |
| `bd-bid-card-float`                            | Hero result chips: drift animation + directional glow. **Purpose-built for the hero scene** — not a generic chip. |
| `bd-gold-sheen-hover`                          | Hover-only gold sheen sweep on benefit photo cards.                                                               |

All Liquid Map Intelligence classes have:

- `prefers-reduced-motion: reduce` guards (animation:none, opacity:0 where applicable)
- `max-width: 767px` mobile motion budget (drift/route/pulse animations disabled; gold drift continues)
- `.bd-bid-card-float` additionally has `display: none !important` on mobile (KI-062 fix)

---

## 3. Cross-app system adoption status

What's unified, what's intentionally separate, what's not touched.

### Unified now

| Surface       | System                                       | Notes                                                                                                                                                                                                                                                                                                |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary CTAs  | `bd-dashboard-primary-button`                | Hero CTAs, dashboard quick actions, auth (LoginMain/Signup/Login), onboarding (shop steps 1–4 + insurer), report flow recovery, save-vehicle, create-claim, shop bid submit + active job, insurer claim approval/denial, legal pages, root error boundary, landing inquiry submits. ~25+ CTAs total. |
| Inputs        | `bd-report-input`                            | Report wizard, shop onboarding 1–4, insurer onboarding, auth (Login + Signup, 7 fields), landing inquiry forms (Shop + Insurer), account modals (EditProfile name/phone, ShopProfile name).                                                                                                          |
| Cards / glass | `bd-glass-card` family                       | Dashboard tiles, who-we-serve cards, about page, coverage panels, business inquiry cards.                                                                                                                                                                                                            |
| Identity      | Dashboard navy-lit-by-gold-lamp shadow stack | Mirrored at top of landing in dark mode (Pass G shipped 2026-05-03): scrolled header inset gold trim line + lamp wash + amber lamp orb on hero atmosphere.                                                                                                                                           |

### Intentionally separate sibling systems

These should **not** be flattened.

- **Map controls** (`bd-map-control-pill`, `bd-map-overlay-card`) — distinct from generic `bd-glass-control` because map context demands stronger contrast against MapLibre tiles.
- **Hero result chips** (`bd-bid-card-float`) — purpose-built scene element with drift + directional glow. Not a generic badge.
- **`bd-report-input`** light-mode bg is warm cream — register-aligned to the warm hero/CTA family. Auth flow inherits this intentionally rather than getting its own variant.
- **Disabled / read-only fields** (e.g. EditProfile email) — kept as separate disabled-chip styling, not run through `bd-report-input`.
- **Dashboard role-tinted card rims** (blue customer / teal shop / gold insurer) — preserved on top of `bd-glass-card`, not flattened into a single rim.
- **Search / address-picker inputs** (e.g. `PlannerAddressSearch`, `ShopDirectoryOriginSearch`, `CoverageSearchPanel`, `ImmersiveOriginPicker`) — different intent (autocomplete trigger), use map-tier styling so they read on map surfaces.

### Not touched (low-ROI deeper-flow surfaces)

`LikedShopCard`, `LikedShopsScreen`, `ShopRatingModal`, `ServiceAreaEditorModal`, `HelpModal`, `SmokeTestScreen`, `NewAccountForm`, `StepPhotos` (camera-specific input). Bottom of usage curve; broad sweeps yield diminishing returns.

---

## 4. Surface-by-surface current state

| Surface                                                                                                                    | State                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing hero**                                                                                                           | Liquid Map Intelligence scene: stylized map base + topographic contour + gold flow + route lines + report pin pulse + 2 sample chips (Sample quote $1,240, Estimated ETA ~4 days). Frame softened from "card" to "embedded window" 2026-05-03 (no hard border, glassy inset highlight + ambient bloom). Chips hidden < md to fix prior overflow. Dark mode also gets the gold lamp-from-above wash + amber lamp orb. |
| **Landing header**                                                                                                         | Glass header, scrolled state in dark mode now carries the gold-lamp shadow stack (inset trim + ambient glow).                                                                                                                                                                                                                                                                                                        |
| **HowItWorks / Benefits / WhoWeServe / AboutOpportunity / TrustStats / OperatingRegions / BusinessInquiry / CTA / Footer** | Migrated to `bd-glass-card--landing` / `--landing-warm`. Eyebrow/H3 typography uses Direction C accents per locked landing register.                                                                                                                                                                                                                                                                                 |
| **Dashboard (overview, account, settings)**                                                                                | navy-lit-by-gold-lamp identity. Quick-action tiles, profile dropdown, notification center, role-stat strip all carry the inset gold trim + ambient glow pattern.                                                                                                                                                                                                                                                     |
| **Auth (Login/Signup/UserType select)**                                                                                    | CTAs on `bd-dashboard-primary-button`; inputs on `bd-report-input`.                                                                                                                                                                                                                                                                                                                                                  |
| **Onboarding (shop + insurer)**                                                                                            | Inputs on `bd-report-input`; CTAs on `bd-dashboard-primary-button`.                                                                                                                                                                                                                                                                                                                                                  |
| **Report flow**                                                                                                            | `bd-report-input` + `bd-report-primary-button`. Long-established sibling system.                                                                                                                                                                                                                                                                                                                                     |
| **Shop bidding / insurer claims**                                                                                          | Submit/Approve/Deny CTAs on `bd-dashboard-primary-button`.                                                                                                                                                                                                                                                                                                                                                           |
| **Legal pages, error boundaries**                                                                                          | Back/Try-Again CTAs on `bd-dashboard-primary-button`.                                                                                                                                                                                                                                                                                                                                                                |

---

## 4b. Premium glass shadow stack canon (KI-085 directional triad, 2026-05-04)

Every premium liquid-glass surface (`.bd-dashboard-panel`, `.bd-dashboard-section`, `.bd-glass-card--landing*`, `.bd-glass-card--dashboard`, future forms/sheets/dialogs) uses this shadow stack pattern:

```
close edge halo   0 0 32-60px       ≤ 0.18α    soft edge presence
mid spread        0 0 90-110px      ≤ 0.10α    atmosphere lift
DIRECTIONAL       0 -28 to -44px    blur 70-130px    spread -14 to -22px    ≤ 0.22α
                  champagne-gold rgba(196,144,65) — light from page atmosphere ABOVE
```

**Rationale:** the third layer is **directional top-cast** (negative offset-Y, negative spread). This reads as light coming FROM the DashboardAtmosphere ceiling lamps above the card, falling onto the card from above. The earlier (Pass E) attempt used `0 0 X-large` omnidirectional ambient bleed — but that surrounded cards evenly and read as edge halo / stamped trim, plus caused a peach blush in cool-cream light canvas. The directional top-cast is the canonical approach.

**Light register bias:** light cards keep ONLY the directional top-cast — all omnidirectional warm bleeds are removed. Warm halos that surround a cool-cream card create cosmetic blush; the cool canvas should read clean and cool, with gold only at the top edge.

**Body translucency invariant:** premium glass card bodies should sit between 0.62 and 0.78 opacity so the page DashboardAtmosphere lamps can show THROUGH the body. With `backdrop-filter: blur(20px) saturate(1.4) brightness(1.02)`, this creates real liquid-glass refraction. Bodies at 0.92+ are paint, not glass.

### Future: Gold-Trim Text Treatment (planned, not yet implemented)

Owner directive captured 2026-05-04: "future gold trimmed text." When this is built, follow the same directional principle as the shadow stack canon above:

- Gold-trim text uses **negative-Y `text-shadow`** so the gold appears ABOVE the text (light cascading down onto the glyph from above), not surrounding it.
- Use the locked palette: champagne `rgba(252, 240, 208, *)` cream-highlight on the upper edge, bronze `rgba(140, 82, 22, *)` deeper trim if a second layer is needed.
- Avoid `text-stroke` or surrounding outline — those read as sticker outline, not lit-from-above gold trim.
- Pattern: `text-shadow: 0 -1px 0 rgba(252, 240, 208, 0.8), 0 -2px 4px rgba(196, 144, 65, 0.5)`.
- Apply to brand-significant headings and CTAs only — gold-trim everywhere is the LAW yellow-amber regression risk.

This subsection is intentionally documented BEFORE the technique is built so when any future agent or owner request prompts gold-trim text, the principle is captured.

---

## 5. What this doc does NOT cover

- Dashboard premium-lift roadmap (D1–D12) — see `PLAN_DASHBOARD_REDESIGN.md`.
- Long-form design philosophy + historical decisions — see `MOLANDJESUS_DESIGN_DECISIONS.md`.
- Map-product strategy — see `PLAN_MAP_MASTER.md`.
- Rules about what BidOnDent must never become — see `LAW_PROJECT_RULES.md`.

---

## 6. When to update this doc

- New `bd-*` utility shipped → add to §2.
- New cross-app surface adopts a system → update §3 / §4.
- Sibling system newly carved out as intentional → add to §3.
- New visual identity decision (e.g. expanding gold-lamp register to a new surface) → add to §1 + relevant subsections.
- Existing entry no longer matches code → fix it.

If LAW (`LAW_PROJECT_RULES.md`, `LAW_HARDENING_PLAN.md`) and this doc disagree, LAW wins. Flag and fix.
