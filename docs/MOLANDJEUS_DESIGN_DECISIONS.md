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

**Collaborative design document for Mola and Jesus**
Last updated: March 22, 2026
Status: Active design reference

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

The dashboard has undergone glass-system adoption, but still has issues:

#### What Improved

- Glass panels (`bd-glass-panel`, `bd-glass-card`) are now applied across:
  - HomeScreen
  - DashboardLayout
  - ProfileDropdown
- Visual cohesion with the map system has begun

#### What Is Still Wrong

1. **Dark mode is too dark**
   - Feels closer to “developer dark mode” than Apple Maps
   - Needs softer navy/blue tones, not near-black

2. **Interactive controls feel inconsistent**
   - Some use proper glass tokens
   - Others still use ad-hoc `bg-white/XX backdrop-blur` styles

3. **Map controls are not premium**
   - Zoom buttons feel default/Leaflet
   - Not circular, not floating, not tactile

4. **Too many surfaces still feel “flat Tailwind”**
   - Especially hover states and small controls

#### Design Decision (CRITICAL)

We are not “adding glass.”

We are **standardizing interaction language**:

- Panels = `bd-glass-panel`
- Cards = `bd-glass-card`
- Controls = `bd-glass-control` (NEW PRIMARY CLASS)
- Badges = `bd-glass-badge`

There should be **zero ad-hoc blur implementations** going forward.

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

---

_This document lives in `/docs/MOLANDJEUS_DESIGN_DECISIONS.md` and should be updated whenever
a significant design decision is made — agreed upon by both Mola and Jesus._

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
