# BidOnDent — Visual System (REFERENCE)

**Authority level:** REFERENCE — single source of truth for the current visual system.
**Last updated:** 2026-05-03
**Supersedes:** `PLAN_LANDING_REDESIGN.md`, `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md`, `PLAN_LANDING_BUTTON_SYSTEM_ADOPTION.md`, `PLAN_LANDING_DARK_MODE_PARITY.md` (all archived 2026-05-03 under `docs/archive/`).

> Read this doc for any visual/design work. The long-form *philosophy* still lives in `MOLANDJESUS_DESIGN_DECISIONS.md` — this doc is the operating snapshot of what's actually in the code.

---

## 1. Identity

**One sentence:** Cool blue glass surfaces lit by warm gold studio-lamp atmosphere, on a map-first product world.

| Element | Role |
|---|---|
| **Blue** | Product / action / route / selection. Royal blue for primary CTAs, soft blue for atmosphere, navy depth, gray-blue subdued. |
| **Gold (amber)** | Lighting / halo / trim / marketplace energy. Glow, rim trim, lamp wash, warm light. **Never primary button infill.** Alpha 0.10–0.25. |
| **Glass** | Trust / structure. Use the `bd-glass-*` family — never hand-roll inline `backdrop-blur`. |
| **Map lines / pins** | Discovery / local network / spatial intelligence. The product is map-first; visual identity reinforces that. |

### Light vs dark mode

| | Light | Dark |
|---|---|---|
| **Body** | Frosted daylight glass with controlled champagne/gold warmth | Navy map/intelligence world with gold-lamp top-light |
| **Hero atmosphere** | Deeper amber radial pools (warm-lit) | Cool blue pools + warm gold lamp wash from above (Pass G 2026-05-03) |
| **Header (scrolled)** | Cream-tinted glass, no gold trim | Navy glass + inset gold trim line + ambient gold glow halo |
| **Cards** | `bd-glass-card--landing` with gold rim trim at low alpha | Same shell, slightly stronger gold rim |

Dark mode is the more cinematic register. Light mode is the daylight twin — same identity, less amber dominance.

---

## 2. The `bd-*` utility inventory

What each system class is for. Defined in [`src/styles/theme.css`](../src/styles/theme.css).

### Buttons

| Class | Purpose | Notes |
|---|---|---|
| `bd-dashboard-primary-button` | Canonical primary CTA shell. rounded-2xl, gold-lamp trim, premium hover/active/focus. | Adopted across landing CTAs, dashboard quick actions, auth submits, onboarding, modals, legal pages, and the root error boundary. Consumer supplies `style={{ background }}` for the gradient. |
| `bd-report-primary-button` | Report-flow primary CTA. Sibling to dashboard primary; tuned for the report wizard's warmer surface. | Used inside report wizard steps. |
| `bd-glass-control--*` | Glass control buttons (`primary`, `secondary`, `utility`, `destructive`). | Hierarchical button family below CTA. |

### Inputs

| Class | Purpose |
|---|---|
| `bd-report-input` | Canonical text/email/tel/textarea field. Warm cream bg in light, navy in dark, gold focus ring + translateY lift. |

Adopted: report flow (StepDescription etc.), shop+insurer onboarding, auth (Login/Signup), landing inquiry forms (Shop/Insurer), account modals (EditProfile name/phone, ShopProfile name).

### Cards & glass

| Class | Purpose |
|---|---|
| `bd-glass-panel` | Base glass surface. |
| `bd-glass-card` | Generic premium card. |
| `bd-glass-card--landing` | Landing premium-marketing anchor cards (cool register). |
| `bd-glass-card--landing-warm` | Landing Direction B warm-amber sections only (TrustStats, Benefits). |
| `bd-glass-card--dashboard` | Dashboard tier card (calmer than landing). |
| `bd-glass-floating` | Floating glass element (e.g. nav drawers, popovers). |
| `bd-glass-badge` | Pill / chip surface. |

### Map controls (intentional sibling system)

| Class | Purpose |
|---|---|
| `bd-map-control-pill` | Map control buttons (zoom/recenter/etc.). Stronger contrast than `bd-glass-control` because it must read against MapLibre tiles. |
| `bd-map-overlay-card` | Overlay panels on top of MapLibre. Same rationale. |

### Atmosphere & motion

| Class | Purpose |
|---|---|
| `bd-bloom-atmosphere` | Hero entry-bloom container. Renders atmosphere with a 700-ish ms ease-in. `is-hidden` / `is-visible` toggles. |
| `bd-dashboard-atmosphere` | Dashboard root atmosphere. Top-anchored radial glow, cool-blue family, no animation. |
| `bd-shell-header` (+ `--light` / `--dark`) | App shell header glass with gold-lamp trim. |
| `bd-section-eyebrow` | Section eyebrow badge styling. |

### Liquid Map Intelligence layer (hero scene)

| Class | Purpose |
|---|---|
| `bd-map-contour` (+ `--dark`) | Static topographic-style line pattern background. |
| `bd-liquid-gold-flow` (+ `--light` / `--dark`) | Drifting liquid gold marketplace-energy ambient. |
| `bd-liquid-gold-sheen` | Slow gold sheen sweep across glass (~28s loop). |
| `bd-route-line` | SVG route line with shimmer animation. |
| `bd-pin-pulse` (+ `--soft`) | Concentric ring pulse for the report pin. |
| `bd-bid-card-float` | Hero result chips: drift animation + directional glow. **Purpose-built for the hero scene** — not a generic chip. |
| `bd-gold-sheen-hover` | Hover-only gold sheen sweep on benefit photo cards. |

All Liquid Map Intelligence classes have:
- `prefers-reduced-motion: reduce` guards (animation:none, opacity:0 where applicable)
- `max-width: 767px` mobile motion budget (drift/route/pulse animations disabled; gold drift continues)
- `.bd-bid-card-float` additionally has `display: none !important` on mobile (KI-062 fix)

---

## 3. Cross-app system adoption status

What's unified, what's intentionally separate, what's not touched.

### Unified now

| Surface | System | Notes |
|---|---|---|
| Primary CTAs | `bd-dashboard-primary-button` | Hero CTAs, dashboard quick actions, auth (LoginMain/Signup/Login), onboarding (shop steps 1–4 + insurer), report flow recovery, save-vehicle, create-claim, shop bid submit + active job, insurer claim approval/denial, legal pages, root error boundary, landing inquiry submits. ~25+ CTAs total. |
| Inputs | `bd-report-input` | Report wizard, shop onboarding 1–4, insurer onboarding, auth (Login + Signup, 7 fields), landing inquiry forms (Shop + Insurer), account modals (EditProfile name/phone, ShopProfile name). |
| Cards / glass | `bd-glass-card` family | Dashboard tiles, who-we-serve cards, about page, coverage panels, business inquiry cards. |
| Identity | Dashboard navy-lit-by-gold-lamp shadow stack | Mirrored at top of landing in dark mode (Pass G shipped 2026-05-03): scrolled header inset gold trim line + lamp wash + amber lamp orb on hero atmosphere. |

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

| Surface | State |
|---|---|
| **Landing hero** | Liquid Map Intelligence scene: stylized map base + topographic contour + gold flow + route lines + report pin pulse + 2 sample chips (Sample quote $1,240, Estimated ETA ~4 days). Frame softened from "card" to "embedded window" 2026-05-03 (no hard border, glassy inset highlight + ambient bloom). Chips hidden < md to fix prior overflow. Dark mode also gets the gold lamp-from-above wash + amber lamp orb. |
| **Landing header** | Glass header, scrolled state in dark mode now carries the gold-lamp shadow stack (inset trim + ambient glow). |
| **HowItWorks / Benefits / WhoWeServe / AboutOpportunity / TrustStats / OperatingRegions / BusinessInquiry / CTA / Footer** | Migrated to `bd-glass-card--landing` / `--landing-warm`. Eyebrow/H3 typography uses Direction C accents per locked landing register. |
| **Dashboard (overview, account, settings)** | navy-lit-by-gold-lamp identity. Quick-action tiles, profile dropdown, notification center, role-stat strip all carry the inset gold trim + ambient glow pattern. |
| **Auth (Login/Signup/UserType select)** | CTAs on `bd-dashboard-primary-button`; inputs on `bd-report-input`. |
| **Onboarding (shop + insurer)** | Inputs on `bd-report-input`; CTAs on `bd-dashboard-primary-button`. |
| **Report flow** | `bd-report-input` + `bd-report-primary-button`. Long-established sibling system. |
| **Shop bidding / insurer claims** | Submit/Approve/Deny CTAs on `bd-dashboard-primary-button`. |
| **Legal pages, error boundaries** | Back/Try-Again CTAs on `bd-dashboard-primary-button`. |

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
