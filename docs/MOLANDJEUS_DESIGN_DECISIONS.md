# MolandJesus — Design Decisions & Vision

**Collaborative design document for Mola and Jesus**
Last updated: March 21, 2026
Status: Active design reference

This document belongs to the MolandJesus project collaboration — NOT the Jeffrey document.
It covers current BidOnDent design decisions, the design system principles we are building toward,
and the long-range vision for reusing the BidOnDent map platform across future MolandJesus ventures.

---

## 1. The Core Design Philosophy

### One Rule: Breathing Room First

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

## 2. Current BidOnDent Page Audit

### Landing Page — What's Cramped and Why

#### HeroSection ✓ Mostly Good

The hero is clean. The 3 bullet points under the headline work but feel a bit stacked and
inventory-list-like. **Improvement decision**: Convert to an animated 3-step value carousel
that cycles through the three points with a smooth fade — one at a time — so the hero breathes.

#### HowItWorksSection ✓ Clean

Three step cards with dashed connectors. Already good. No cramming. Keep as-is.

#### WhoWeServeSection ✓ Clean but list-heavy

The 3 cards with 4 bullet points each work well for structured comparison. The hover color-fill
effect is great. **Improvement decision**: The cards are fine as-is. Do not over-engineer these.

#### BenefitsSection ✓ Clean

Image cards with badge overlays. These breathe. Keep as-is.

#### TrustStatsSection ✓ Clean

4-column dark gradient band. Each item is just an icon + value + label. Already minimal.
Keep as-is.

#### AboutOpportunitySection ⚠️ Improve

Three cards with short 1-2 sentence descriptions. They look fine but the information is too
terse — not enough to understand what BidOnDent actually delivers. **Decision**: make each card
expand with a "Learn more" click, revealing a deeper explanation in a smooth slide-down.

#### BusinessInquirySection ⚠️ Improve

This is the most cramped section on the entire landing page. The shop form has **10 fields** all
rendered in a 2-column grid at once. This reads like a government form thrown onto a webpage.

**Decision**: Progressive disclosure gateway:

- Initially show: a clean card with short description + two large action buttons ("Join as a Shop"
  and "Partner as Insurer"), each with the role icon and a one-sentence value prop.
- When user clicks their role, the form slides open with a close/back button.
- The field count stays the same but the user arrives with intent and context — not a wall of inputs.

#### CTASection ✓ Good

Clean card with gradient background shapes. The button is large and well-proportioned.

#### OperatingRegionsSection ✓ Mostly Good

The map + shops list + search panel together are dense, but they are functional map surfaces —
density is expected and appropriate here. The dark background helps the map breathe.

### Dashboard — What's Cramped and Why

#### DashboardCoveragePanel ✓ Clean

The 3 stat cards (Live Regions, Partner Markers, View Mode) + region pills + 2 buttons is
actually clean and purposeful. Keep as-is.

#### ShopDirectoryScreen — Smart Shop Map ⚠️ Dense but functional

The intelligence summary band (Connected Carriers, Damage Signals, Session ID, Top Match) +
3 chips + vehicle context tags + search controls + map = a LOT of information in one viewport.

**Decision for a future pass**: Break this into two states:

1. **Ready state** — just shows the search bar + map + compact "Intelligence" badge chip
2. **Active state** — clicking the badge chip reveals the full intelligence summary in a slide-down panel

This is a Phase 2 design improvement, not an immediate fix. Do it after the landing page work lands.

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

- Primary: `#003d82` (deep navy)
- Secondary / accent: `#00a0e9` (clear sky blue)
- Surface light: `bg-slate-50` / `bg-white`
- Surface dark: `bg-slate-900` / map glass: `rgba(15,23,42,0.82)`
- Positive: emerald-600 / green-500
- Destructive: rose-500 / `#e11d48`

### Map glass palette (light tone)

- Panel bg: `linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,245,249,0.72))`
- Panel border: `rgba(255,255,255,0.80)`

### Map glass palette (dark / night tone)

- Panel bg: `linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.76))`
- Panel border: `rgba(255,255,255,0.12)`

---

## 8. Roadmap for Design Improvement Passes

### Pass 1 — Landing page text cramming (current pass)

- [x] `AboutOpportunitySection` — expandable card detail with chevron toggle
- [x] `BusinessInquirySection` — role-split gateway before form reveal
- [ ] `HeroSection` — animated value carousel for bullet points

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

---

_This document lives in `/docs/MOLANDJEUS_DESIGN_DECISIONS.md` and should be updated whenever
a significant design decision is made — agreed upon by both Mola and Jesus._
