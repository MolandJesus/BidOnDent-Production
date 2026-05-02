## Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

### Future Design Articulation: Atmosphere, Depth, Glass, and Control Feel

- The future BidOnDent map and platform should feel like a **living, product-owned world** — not a macOS clone, not generic SaaS, not pasted Apple UI.
- Blue is a system: deep royal blue for identity/controls, sky/baby blue for atmosphere/guidance, ocean/navy blue for depth/night, gray-blue for subdued/low-noise. Blue should behave like **light through glass**.
- The design target is more depth, atmosphere, layered transparency, liquid glass overlays, and “surface floating above geography.”
- Glass/material direction: breathable, warm, softly illuminated, transparent/translucent — not over-solidified, painted, cold, or aggressively glossy.
- Controls should be tactile, soft, layered, calm, and premium — not loud, harsh, over-glossed, or like desktop window chrome. Controls should float above the world, not feel like toolbar buttons.
- The emotional target: calm, guided, breathable, confident, premium, friendly, trustworthy — not cold, flat, generic, or overly technical.
- **Day/night guidance mode switching** is a future direction, not implemented. Any implementation must respect provider stack, real capability boundaries, and user override/settings.
- 3D/world rendering is **aspirational only** and depends on future provider/platform decisions.

All of the above is **future planning** and not yet implemented unless otherwise stated in the tracker.

# MolandJesus — Design Decisions & Vision

> ### ⚡ HARDENING PHASE NOTICE (2026-04-14)
>
> Strategic design reference. **Not** current execution law.
>
> During the Soft Launch Hardening phase, aesthetic work is paused except where required to close Phase 4 trust surfaces (demo banner, honest empty states, Coming Soon → waitlist conversion, market status layer). All other design refinements defer until soft launch stabilizes. See [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) Phase 4 for exact scope.

**Collaborative design document for Mola and Jesus**
Last updated: April 14, 2026 (Hardening phase began — design work paused except for Phase 4 trust surfaces)
Status: Strategic design reference (paused during hardening)

## Living Design Alignment (2026-03-22)

This document has been updated to reflect the current **glass-system expansion, navigation productization, and dashboard unification work**.

The BidOnDent design is no longer “map vs rest of app.”

It is now:

- **One system**
- **One visual language**
- **One philosophy of clarity and calm**

The goal is not just to look modern —  
The goal is to feel **trustworthy, breathable, and guided**.

Every future design decision must pass this test:

> “Does this reduce confusion and increase trust?”

If not — we do not ship it.

### Future End-State Vision (Maps Product) — Pass 17 Alignment

The long-term goal is for the BidOnDent map product to feel like a **royal-blue-native, product-owned navigation world** — not a generic map with blue accents or a desktop window clone.

The final visual identity is **royal-blue-first**: royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode.

Map surfaces, overlays, and controls must use these blue tones intentionally for meaning, not just as decoration. The map should feel like a branded geographic world, not a generic tile with overlays. The sky, water, route, and overlays all belong to BidOnDent.

**Day/night guidance mode:** The future map experience will support automatic day/night visual switching based on local time or route context, similar to premium navigation products. This is a planned feature, not yet implemented. Day mode is lighter, breathable, and sky-driven; night mode is calm, navy, low-glare, and guidance-first.

All map and design decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI patterns.

---

## 1. The Core Design Philosophy

### One Rule: Breathing Room First

This rule now applies **especially to the dashboard and map overlays**, not just landing pages.

The current risk in the product is not lack of features —  
It is **too much visible at once**.

The fix is not removing capability —  
It is **layering it correctly**.

Every page should have negative space as a design element, not an afterthought.
Text should earn its place. If content needs to explain itself with more content, that extra
content lives behind a tap or a transition — not inline crowding everything together.

### Three Layers of Information

Instead of dumping everything on a single screen, every surface follows three layers:

| Layer           | What it shows                               | How user gets more                |
| --------------- | ------------------------------------------- | --------------------------------- |
| **Surface**     | Essential signal — one headline, one action | Visible immediately               |
| **Next step**   | Summary, context, options                   | Tap/click a well-designed button  |
| **Deep detail** | Full content, forms, data                   | New page, sheet, or smooth expand |

### Animations Are Not Decoration

Every animation serves a purpose:

- **Entry animations** say "this just arrived — notice it"
- **Exit animations** say "this is going away — not a crash"
- **Expand/collapse transitions** say "more is here if you want it"
- **Hover feedback** says "this is interactive"
  Never add animation just to look fancy. Users tune out animations that don't teach them anything.

---

## 2. Current BidOnDent Page Audit (Updated 2026-03-25)

### Landing Page — Screenshot-Verified State

#### HeroSection ✅ Strong

Premium hero with “Get the **Best Price** on Your **Auto Body Repair**” headline. Map image with “NY Active Service Region” badge and “Shops Near You” / “Repair Completed!” overlays. Animated value carousel cycles through trust points. “Start New Report” primary CTA (pill shape, blue gradient) + “Learn More” secondary. Bottom badges: “Now available in NY”, “Transparent bids”, “Free for customers”. **This is the strongest non-map section.**

#### HowItWorksSection ✅ Clean

Three numbered step cards (Report Damage → Receive Bids → Choose and Repair) with icons and descriptions. Clean layout, good breathing room. No issues.

#### BenefitsSection (“Why Choose BidOnDent”) ✅ Strong

Three photo cards with badge overlays (Guided Intake, Repair Network, Transparent Bids). Real photos, professional composition. This section breathes well and feels premium.

#### WhoWeServeSection ✅ Clean

Three role cards (For Customers / For Repair Shops / For Insurers) with icon headers and 4-bullet feature lists. Green checkmark icons. Bottom badges: “$0 for Customers”, “NY Service Area”, “Transparent Bidding”. Structured and honest.

#### AboutOpportunitySection ✅ Delivered

Three expandable cards (Clear Decision-Making, Shared Process, Accountability) with “Learn more” chevron buttons. Expanding disclosure pattern is working. “Read Full About Overview” CTA button below. **Previously marked for improvement — now done.**

#### TrustStatsSection ✅ Clean

4-column dark gradient band with icons: Structured Intake, Transparent Bids, Operational Tracking, Review Controls. Minimal and effective.

#### OperatingRegionsSection ✅ Standout

The strongest section on the entire site. Dark navy background with interactive map, ZIP search, radius selector, map mode buttons (Map/Night/Satellite/Focus/Overview/Expand), county grid (Rockland, Dutchess, Westchester, Nassau, Orange, Putnam), partner shop list with navigation handoff (Apple Maps/Google Maps/Waze), performance metrics overlay. **This is the product's visual identity anchor.**

#### BusinessInquirySection ✅ Delivered

Progressive disclosure gateway working: clean card with “Join as a Shop” / “Partner as Insurer” action rows. No wall-of-inputs. “Every request is reviewed and confirmed by our team” disclaimer. **Previously marked for improvement — now done.**

#### CTASection ✅ Good

Glass card with gradient orbs (amber/blue). “Ready to Get Started?” with “Go to Dashboard” CTA (pill shape, blue gradient). Sub-text: “Free to use • No obligation • Get quotes in minutes”. Proportional sizing matches hero.

#### FooterSection ✅ Clean

Three-column layout (For Customers / For Businesses / Company). Contact info, social links, copyright. Clean and honest.

### Landing Page — Remaining Opportunities

1. **Light sections feel disconnected from map identity** — The lighter sections (Hero, How It Works, Who We Serve) are clean but don't feel like they belong to the same product as the dark map sections. The identity lives in the map/dark areas; lighter areas need subtle connection.
2. **Section stacking** — Some transitions between light sections feel like generic marketing site rather than a spatial product experience.
3. **Not every section needs to be dark** — but every section should feel like it belongs to BidOnDent's blue identity.

### Dashboard — Screenshot-Verified State (Pass 185)

#### What Is Working

- Glass system (`bd-glass-panel`, `bd-glass-card`, `bd-glass-control`, `bd-glass-badge`) deployed across all surfaces
- Sidebar nav: Dashboard, Report (active with arrow), Bids, Account, Demo Mode
- Report creation wizard: 5-step flow (Vehicle Info → Damage Area → [Location] → Photos → Description → Complete)
- Saved vehicles picker with quick-select
- Photo upload with camera/upload options, cloud storage indicator
- Report success screen with “What happens next” timeline
- Blue system tokens unified (glass backgrounds blue-tinted, shadows refined)
- All buttons meet WCAG AA 44px touch targets
- Empty states use `bd-glass-card` — visible on dark dashboard
- Header: BidOnDent logo (blue glass icon), search, notifications (badge), profile dropdown

#### What Still Needs Work

1. **”Can't find variable: props” crash** on certain navigation paths (P1 bug)
2. **Map dominance** — dashboard still feels like “UI with a map widget” rather than “map with floating panels”
3. **Interaction flow continuity** — transitions between report/bids/shop could be smoother
4. **Mobile bottom sheet behavior** — could be more map-native (less blocking, more overlay)

### Design System — Current State (Locked)

The glass system is standardized. Zero ad-hoc blur implementations going forward:

- Panels = `bd-glass-panel`
- Cards = `bd-glass-card`
- Controls = `bd-glass-control`
- Badges = `bd-glass-badge`
- Floating = `bd-glass-floating`

Blue tokens are unified in `theme.css`: glass blur 14px, blue-tinted backgrounds, blue shadow system, hover accents.

---

## 3. Design Patterns We Use

### The Disclosure Button Pattern

For any section where important content exists but would crowd the page, we use a stylish button
that reveals the content. Rules for these buttons:

- **Match the section aesthetic** — light section gets a white/slate button, dark section gets
  a glass-style button
- **Name the content, not the action** — "Explore Clear Decision-Making" not just "Read More"
- **Use motion**: the content should slide open with `max-h` + `opacity` transition (~400ms ease-in-out)
- **Closable**: there must always be a clear way to collapse back

### The Role-Split Gateway Pattern

Used in `BusinessInquirySection`. Any form or flow that serves multiple distinct audiences
(customers, shops, insurers, etc.) should:

1. First show a card with role-choice buttons — large, icon-heavy, clear
2. Only reveal the actual form/flow after the user chooses their role
3. Include a "← Back" or "× Close" to return to the gateway

This prevents audience mismatch (shop owners seeing customer fields) and removes the
"wall of inputs" first impression.

### Expandable Card Pattern

Used in `AboutOpportunitySection`. Rules:

- Card shows the minimum useful content by default (icon + title + 1-2 sentence summary)
- A "Learn more" / "Show less" chevron button sits at the bottom of the card
- Expanded content slides down inside the card using `max-h` + `opacity` transition
- Only one card can be expanded at a time (accordion mode) OR all can be independent — decide per context

### Animated Value Carousel (Future)

For hero sections and marketing landing pages:

- Rotate through 2-4 key value statements
- Each statement enters from bottom and exits to top with a 3-4 second dwell
- Should respect `prefers-reduced-motion` (static display if motion is off)
- Good for hero checklist items in `HeroSection`

### The Glass Control Pattern (NEW — 2026-03-22)

This is now the **most important pattern for dashboard + map UI.**

Applies to:

- Buttons
- Zoom controls
- Floating map controls
- Icon buttons

Rules:

- Shape: circular or pill (never square)
- Background: semi-transparent (light or dark tone-aware)
- Blur: consistent via token (NOT per-component)
- Border: subtle, never harsh
- Shadow: soft elevation, not heavy drop-shadow
- Hover: gentle brightness increase, not color swap

Example feel:

- Apple Maps controls
- iOS Control Center toggles

Anti-patterns:

- Flat `bg-white`
- Hard `border-slate-200`
- Sharp corners
- Sudden hover color jumps

This pattern replaces all one-off control styling.

---

## 4. The Map Platform Strategy

The BidOnDent map is not just a feature — it's a platform. Here is what we have built:

### What Exists Today

- **Liquid-glass overlay system**: theme-aware panels, sidebars, action rails — production quality
- **OSRM routing**: real turn-by-turn directions with expressive voice instructions (15+ scenarios)
- **Overpass place discovery**: live nearby places by role (body shops, insurers, fuel, rental, supplier)
- **External navigation launch**: Apple Maps / Google Maps / Waze with session-persisted provider
- **Performance telemetry**: zoom/pan budget tracking, provider health (OSRM + Nominatim + Overpass)
- **Speed monitoring**: live GPS speed + posted speed limit confidence (high/medium/low)
- **Navigation session memory**: saved places, recent searches, provider preference, map view state

### How This Transfers to Other MolandJesus Projects

The map stack is self-contained in:

- `src/app/components/maps/` — all overlay UI
- `src/app/services/navigation/` — routing, discovery, external nav, session state
- `src/styles/theme.css` — the liquid-glass animation system (`.map-liquid-panel`, `.map-liquid-sheen`, etc.)
- `src/app/components/maps/mapSurfaceTheme.ts` — the typed glass theme system

**Any project needing a map can lift:**

- `ServiceCoverageMap.tsx` as the core leaflet surface
- `mapSurfaceTheme.ts` + `theme.css` glass system completely intact
- Navigation services (routing, discovery, external nav, telemetry)
- The `NavigationActiveManeuverCard`, `NavigationSummarySheet`, `NavigationActionRail` overlays

**Future MolandJesus map use-cases to explore:**

1. Real estate / neighborhood discovery — place discovery by POI type instead of repair shops
2. Event geographic routing — route planning for multi-stop event coverage
3. Field service management — routing + time-on-site tracking for small business field work
4. Any app needing live local business discovery + on-device routing + external nav handoff

---

## 5. CSS / Motion System Reference

All glass and motion classes live in `src/styles/theme.css`:

| Class                       | Effect                                            |
| --------------------------- | ------------------------------------------------- |
| `.map-liquid-panel`         | Elevated glass panel with inset top-lit highlight |
| `.map-liquid-card`          | Lighter frosted card for inset content            |
| `.map-liquid-rail`          | Pill-shaped action button container               |
| `.map-liquid-sheen`         | Animated light reflection overlay (screen blend)  |
| `.map-ui-enter`             | 420ms slide-up + fade-in mount animation          |
| `.map-ui-enter-delay-1/2/3` | 70ms/140ms/210ms staggered variations             |
| `.map-nav-icon-ring-pulse`  | 2.8s ring glow pulse for navigation icon circles  |

All animations are suppressed at `prefers-reduced-motion: reduce`.

### New Global Classes (2026-03-22)

| Class               | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `.bd-glass-panel`   | Main container surfaces                   |
| `.bd-glass-card`    | Secondary content cards                   |
| `.bd-glass-badge`   | Small highlight chips                     |
| `.bd-glass-control` | Interactive buttons (NEW PRIMARY CONTROL) |

RULE:
Do not recreate glass styles inline. Always use these classes.

---

## 6. Font & Type Scale Decisions

The site uses system UI fonts (`SF Pro Display / SF Pro Text` on Apple, `Segoe UI` on Windows).
The general type hierarchy on landing sections:

| Use                   | Size                    | Weight          | Tracking            |
| --------------------- | ----------------------- | --------------- | ------------------- |
| Section headline (h3) | `text-4xl`              | `font-bold`     | default             |
| Card title            | `text-xl` / `text-2xl`  | `font-bold`     | default             |
| Body / description    | `text-lg` / `text-base` | normal          | default             |
| Badge / eyebrow       | `text-sm` / `text-xs`   | `font-semibold` | `tracking-[0.24em]` |
| Micro-label           | `text-[11px]`           | `font-semibold` | `tracking-[0.22em]` |

**Rule**: Never put two `text-lg` paragraphs back to back without white space between them.
If two paragraphs appear in the same card, the second one should be `text-sm text-slate-500`
to create visual hierarchy without adding more whitespace.

---

## 7. Color Decisions

### Brand palette

- **Primary royal blue:** `#003d82` — core brand identity, active route emphasis, key controls
- **Bright sky blue:** `#00a0e9` — accent, guidance energy, bright daytime lift
- **Baby blue / soft atmospheric blue:** use for airy daylight surfaces, soft hero gradients, calm glass tinting
- **Deep ocean blue:** use for depth, premium contrast, route framing, stronger focus surfaces
- **Surface light:** `bg-slate-50` / `bg-white` with blue atmospheric influence where appropriate
- **Surface dark:** blue-led dark surfaces, not neutral gray-led dark surfaces
- **Positive:** emerald-600 / green-500
- **Destructive:** rose-500 / `#e11d48`

**Color rule:** BidOnDent should read as a **royal-blue-first product**, with multiple intentional blue families doing different jobs instead of one flat “brand blue.”

### Dark Mode Direction (UPDATED)

Dark mode should NOT be “black UI.”

It should feel like:

- Apple Maps night mode
- deep navy water + gray-blue road atmosphere
- calm, premium, low-glare guidance
- dark blue world, not gray world

Replace harsh tones with:

- Base: shift `#0f172a` toward **gray-blue navy** and **deep ocean blue**
- Mid surfaces: use subtle blue-tinted gradients instead of neutral charcoal
- Overlays: preserve glass softness while keeping contrast readable during guidance
- Avoid pure black backgrounds unless there is a specific contrast reason

Goal:
Dark mode should feel like **night sky over ocean**, not darkness.

Future aspiration:
The maps product should eventually support **automatic day/night mode switching** for active navigation when time-of-day calls for it, similar to iOS Maps. This is a future-direction design target and should be documented as part of the intended end-state experience.

### Automotive Identity Layer (Landing — Locked 2026-05-02, Pass 6)

The landing page introduces a deliberate automotive identity register that the dashboard does NOT inherit. It applies to landing surfaces only.

**Two-register dark mode (Direction B — Amber-Lit Garage):**

Light mode oscillates warm cream ↔ cool sky. Dark mode mirrors this with a warm amber-black register on **Benefits** and **TrustStats** sections, against the cold navy register on the rest. Mood: auto body shop at night under sodium-vapor work-lights, with cold map/nav tech surrounding it.

- Warm dark sections (Benefits, TrustStats): `#1a0c06 → #231408 → #1a0a04` with amber atmosphere ellipses (`rgba(200,120,30,0.18–0.28)`) and warm-amber blur pools
- Cold dark sections (everything else): the navy/indigo system already documented above

**Direction C luminance accents (per-section corner glows):**

A single radial luminance accent per section, 600–800px diameter, 15–22% opacity, positioned at the section's signature corner. Reads as architectural spotlight / Apple-event editorial lighting — NOT cyber/neon. Locked palette (any new section must pick from or extend this table):

| Color | Use case | Example sections |
|---|---|---|
| Electric blue `rgba(37,99,235,0.22)` | Hero anchor, brand identity | Hero |
| Sky teal `rgba(14,165,233,0.18)` | Guidance, freshness | HowItWorks |
| Royal blue `rgba(37,99,235,0.16)` | Action / centered emphasis | WhoWeServe |
| Cobalt `rgba(30,58,138,0.18)` | Depth, confidence | AboutOpportunity |
| Slate-blue `rgba(71,85,105,0.15)` | Quiet anchoring | BusinessInquiry |
| White-cream `rgba(248,250,252,0.18)` | "Lamp under glass" — conversion moment only | CTA |
| Warm amber `rgba(200,120,30,0.20)` | Reserved for warm Direction B sections | Benefits |
| Warm gold `rgba(180,140,40,0.22)` | Reserved for warm Direction B sections | TrustStats |

**Subtle car cues — what is allowed:**

- Sedan silhouette watermark (low opacity, behind hero image, never as a focal element)
- Topographic / radar-style concentric rings behind the map (≤ 8% opacity)
- Road-lane dashes at section transitions (gradient color matches separator)
- Headlight bokeh / route lines / topographic rings / painted-metal sheen (future)

These render as automotive **atmosphere**, not iconography. They support the product story without making the page look like a parts catalog or a mechanic shop website.

### Dashboard Material Tier (Calm Workspace — Locked 2026-05-02, Pass D1)

The dashboard inherits the cool-blue glass shell only. Per §9 item 9, no automotive register, no warm amber, no Direction C accents, no editorial flanking strokes. The dashboard has its own card material variant so it can read more premium without borrowing landing's identity.

**Three-tier glass card hierarchy (post-D1):**

| Class | Use case | Energy |
|---|---|---|
| `bd-glass-card` | Generic glass surfaces (modals on landing, default) | Quiet base |
| `bd-glass-card--dashboard` | All authenticated workspace surfaces (all 4 roles) | Calm-workspace |
| `bd-glass-card--landing` | Landing premium-marketing anchor cards | High-presence marketing |
| `bd-glass-card--landing-warm` | Landing Direction B warm-amber sections only | Warm Direction B |

`--dashboard` material spec (light): heavier shadow than base (`0 14px 32px` vs `0 10px 24px`), stronger inset top highlight (`rgba(255,255,255,0.85)` vs `0.65`), brighter border (`rgba(147,197,253,0.42)` vs `bd-glass-border-light`), subtle ambient blue glow (`0 0 28px rgba(59,130,246,0.06)`), 2px hover lift (vs `--landing`'s 6px). Workspace, not marketing.

`--dashboard` material spec (dark): follows the canonical Dark Shell pattern (`linear-gradient(180deg, rgba(11,23,47,0.84) 0%, rgba(8,18,38,0.78) 100%)`, `rgba(96,165,250,0.22–0.26)` borders) with stronger inset highlight + 28px ambient blue glow at `rgba(37,99,235,0.10)`. Calmer than `--landing` (no marketing-anchor glow tier).

**Dashboard ambient layer — `bd-dashboard-atmosphere`:**

Single absolute-positioned utility class. Top-anchored radial glow, 5% peak opacity (light) / 7% peak (dark), cool-blue family. No motion. No section alternation. No `bd-bloom-atmosphere` scroll-entry — workspace surfaces should not bloom on entry. Applied at `DashboardLayout` root behind content.

```css
background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(96,165,250,0.05) 0%, transparent 70%);
/* dark: rgba(59,130,246,0.07) */
```

This sits on top of the existing layered `<DashboardAtmosphere>` component which paints the deep navy / blue-bloom orb base. The new utility adds a light top-anchored content-area glow so working sections feel dimensional.

**Section eyebrow — `bd-section-eyebrow`:**

Editorial typography utility for dashboard section anchors ("REPAIR OVERVIEW", "YOUR DASHBOARD", "REPAIR ACTIVITY"). 11px, weight 600, `letter-spacing: 0.18em`, uppercase, blue-700 (light) / blue-300 (dark). **No flanking strokes** — those are landing-only (Pass 12-15). Refined typography only.

**Locked: dashboard does NOT use `--landing-warm`.** Warm glass is landing-only register. Mixing dilutes both identities.

---

## 8. Roadmap for Design Improvement Passes

### Pass 0 — Visual Correction (Delivered 2026-03-22)

- [x] Fix dark mode to Apple Maps style (soft navy `#0c1929`, not gray-900)
- [x] Blue-tint glass tokens (alice-blue light, blue-glow dark)
- [x] Add hover/active interaction to `.bd-glass-control` in CSS
- [x] Remove ad-hoc `hover:bg-white/70` from glass-control elements
- [x] Normalize hover states across dashboard and all screens (`hover:bg-white/40`)
- [x] Soften borders site-wide (`border-slate-200/60`, `border-gray-200/60`)
- [x] Map zoom controls premium (pill group, blue gradient, glass blur, navy dark variant)
- [x] Remove remaining flat-white hover surfaces in primary UI
- [x] Build passes clean (0 errors, 0 spellcheck issues)

Backdrop-blur exceptions (intentional, not violations): colored-surface inputs, image-overlay badges, modal overlays, photo guide cards, landing header scroll states.

### Pass 1 — Landing page text cramming (current pass)

- [x] `AboutOpportunitySection` — expandable card detail with chevron toggle
- [x] `BusinessInquirySection` — role-split gateway before form reveal
- [x] `HeroSection` — animated value carousel for bullet points

### Pass 2 — Dashboard breathing room

- [ ] `ShopDirectoryScreen` — collapse intelligence summary behind a badge chip
- [ ] `DashboardCoveragePanel` — optional: expand description text with disclosure

### Pass 3 — Map + navigation pass (already in progress — see MAP_TRACKER)

- [x] Navigation overlay glass polish (Phase 1 complete)
- [ ] Mobile Safari safe-area inset tuning

### Pass 4 — Type scale harmonization

- [ ] Audit every `text-lg text-gray-600` paragraph on the landing page
- [ ] Ensure no two body paragraphs sit back-to-back without hierarchy break
- [ ] Check that section subtitles are consistently `text-xl text-gray-600` not `text-lg`

### Pass 5 — Map platform extraction (future MolandJesus use)

- [ ] Document the extraction checklist: which files to copy, which configs to replace
- [ ] Write a minimal "blank map app" scaffold with just the glass theme + ServiceCoverageMap
- [ ] Identify the 3 most likely non-BidOnDent use-cases for a standalone pitch
- [ ] Define the full royal-blue map tone system for sky / water / route / overlay / night guidance states
- [ ] Document the future automatic day/night navigation visual switching behavior
- [ ] Create a visual reference spec for BidOnDent’s blue-first maps identity so future passes stay consistent

---

## 9. Things We Will Not Do

These temptations arise in every design project. Record them here to avoid rehashing:

1. **Do not add a loading spinner to every button**. Only add loading state to async actions that
   take > 300ms. BidOnDent forms already have `isSubmitting` – that is enough.
2. **Do not add a tooltip to every icon**. If the icon cannot stand on its own, add a text label
   next to it or choose a better icon.
3. **Do not animate section headers on scroll for every section**. The current `useScrollAnimation`
   pattern is good. Do not extend it to every single div.
4. **Do not create a new component for a one-time layout**. Inline the JSX. Components are for
   reusable patterns that appear 2+ times.
5. **Do not change the map glass system just to try something new**. The liquid-glass system is
   production-quality and consistent. Any change needs a design reason, not an experiment.
6. **Do not add racing/kitsch automotive decoration**. No racing stripes, chrome wheels,
   spark/explosion graphics, tire-track motifs, gear/wrench iconography as page chrome,
   speedometer dashboards as decoration, or "fast & furious" energy. Subtle automotive
   atmosphere only — silhouette watermarks, topographic rings, road-lane dashes. The product
   is a calm marketplace, not a tuner shop.
7. **Do not homage Apple Maps directly**. Inspiration from its calm/spatial language is
   welcome and documented above; literal reproduction of its tile palette, control shape,
   or marker styling is not. BidOnDent's blue-first identity must remain its own.
8. **Do not extend Direction C luminance accents past the locked palette**. New sections
   pick a color from the §7 Direction C table or extend it via owner-approved decision —
   not by sampling whichever blue feels right at the time. One luminance per section. No
   stacking. No rainbow gradient effects.
9. **Do not apply the landing-page automotive identity layer to dashboard surfaces**. The
   dashboard inherits the calm-map / glass-shell system documented under Dark Shell Design
   System; the automotive register (sedan silhouettes, lane dashes, warm amber atmosphere,
   Direction C luminance) is a landing-only signature. Mixing them dilutes both.

---

_This document lives in `/docs/MOLANDJESUS_DESIGN_DECISIONS.md` and should be updated whenever
a significant design decision is made — agreed upon by both Mola and Jesus._

---

## Dark Shell Design System — Completed (2026-03-25)

### Established Dark Glass Pattern (canonical across all dashboard screens)

Every non-landing screen and card that sits on a dark navy background now uses this pattern:

```
background: linear-gradient(180deg, rgba(11, 23, 47, 0.82–0.84) 0%, rgba(8, 18, 38, 0.78–0.80) 100%)
borderColor: rgba(96, 165, 250, 0.18–0.24)  [from rgba(96,165,250)]
```

**Text palette for dark-shell components:**

- Primary text: `text-slate-100` (headings, prices, names)
- Secondary text: `text-slate-300/80` (metadata, descriptions, labels)
- Muted text: `text-slate-400/70` or `text-blue-200/60` (tertiary info)
- Accent interactive: `text-blue-200/70` → hover `text-blue-100` (chevrons, navigation)
- Success/positive: `text-emerald-400` (lowest bid, ratings)
- Links/back-nav: `text-blue-300/80` → hover `text-blue-200`
- Section label uppercase: `text-blue-200/60`

**Interactive elements in dark-shell:**

- Info pills: `bg-white/[0.07–0.08] text-slate-200 border border-white/[0.1]`
- Action tint badge: `bg-blue-400/15 text-blue-200–300 border border-blue-300/20`
- Neutral button: `border border-white/[0.12] text-slate-300 hover:bg-white/[0.08–0.10]`
- Danger/decline: `hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10`
- "Currently Viewing" / active passive: `bg-blue-400/20 text-blue-200`
- "Switch to" / secondary action: `bg-white/[0.10] text-slate-100 hover:bg-white/[0.15]`

**Decorative/status banners (dark-shell):**

- Info/active: `border border-blue-400/30 bg-blue-400/10 text-blue-200`
- Image placeholder: `bg-white/[0.08]`

### Screens with confirmed dark-shell treatment (Pass 234-235 final sweep):

- `BidCardArticle.tsx` — full dark glass shell, all text/badge/button variants
- `DemoAccountSwitcher.tsx` — header card + feature cards + all CTAs
- `AccountHeader.tsx`, `AccountInfoCard.tsx`, `AccountMenu.tsx` — already compliant
- `BidsScreen.tsx` — header, stat cards, empty state — already compliant
- `HomeScreen.tsx` — welcome bar, map-dark mode — already compliant
- `ShopActiveJobsScreen.tsx`, `InsurerClaimsScreen.tsx`, `ShopRequestsScreen.tsx` — already compliant (Pass 224-225)

### Decision: Explicit inline style over `.dark` class propagation

We chose to apply dark glass backgrounds via explicit inline styles on each component rather than propagating a `.dark` class from parent screens. Rationale: bd-glass-card components are shared across multiple surface types (light landing page and dark dashboard). Adding `.dark` at a screen level would risk cascading into unintended contexts. The inline override is safer, more intentional, and makes each component's dark treatment self-documenting.

---

## Final Principle

The final end-state for the maps product is not just “good UI.”
It is a **distinct BidOnDent navigation identity** built around royal blue, calm guidance, breathable overlays, and a map world that feels owned by the product in both day and night conditions.

This is not just UI work.

This is stewardship.

> “Whatever you do, do it with excellence, as unto the Lord.” — Colossians 3:23

The goal is not perfection for pride —
but excellence for clarity, usefulness, and truth.

Every screen should help the user feel:

- Calm
- Clear
- Guided
- Confident

If it creates confusion, noise, or stress —
we refine it until it does not.

— MolandJesus

---

## Implementation Details (Archived)

> **Archived:** Atmospheric Depth System, Light Mode Gradient Enrichment, Floating Decorative Orb System, and Mobile Maps Section Optimization implementation details (per-section hex values, orb animation configs, gradient maps) moved to `docs/archive/DESIGN_DECISIONS_IMPL_DETAILS.md` (Pass 537). Core philosophy, patterns, and rules remain above.
