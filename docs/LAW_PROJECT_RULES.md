# BidOnDent — Project Rules (LAW)

**Authority level:** LAW — governs all work. Cannot be violated without explicit per-session override from the project owner.

**Last updated:** 2026-05-02

---

## Organizing Principle

> **"Does this serve the core transaction OR protect the product DNA that makes BidOnDent worth choosing over alternatives?"**

If neither — defer. This filter applies to every feature, refactor, and fix.

---

## Product Definition

BidOnDent is a **geo-native automotive repair marketplace** connecting vehicle owners with body shops through competitive bidding on damage reports, rendered in a map-first interface.

Three defining properties (all three must survive every decision):

1. **Spatial-first.** The map is the product's primary interface metaphor. Every core screen has a spatial dimension.
2. **Bid-competitive.** Customers describe damage; shops compete on price and timeframe. This is the economic engine.
3. **Trust-layered.** The product progressively builds trust: verified profiles, reviews, photo verification, transparent pricing.

---

## Role Hierarchy

| Role         | Priority              | Description                                                                                               |
| ------------ | --------------------- | --------------------------------------------------------------------------------------------------------- |
| **Customer** | Primary user          | Has the dented car. Submits reports, receives bids, accepts bids. Product is built for this person first. |
| **Shop**     | Primary supply        | Does the repair. Views reports in service area, bids competitively, manages jobs.                         |
| **Insurer**  | Secondary participant | Participates in transactions they don't initiate. Always subordinate to customer-shop transaction.        |
| **Admin**    | Internal only         | User management, moderation, marketplace health. API-only until >100 active users.                        |

**Rule:** Never build insurer features that don't connect to a customer-shop transaction.

---

## BidOnDent Must Never Become

| Anti-pattern                            | Boundary                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| A Yelp-style directory without bidding  | If shops set prices unilaterally, the product has failed              |
| A fleet management / dispatch tool      | Navigation sessions serve this future — freeze, don't build toward it |
| An insurance claims processing platform | Insurers participate; they are not the customer                       |
| A SaaS tool for shops                   | BidOnDent gives shops customers, not operational software             |
| A white-label marketplace engine        | One brand, one marketplace, one set of rules                          |

---

## The Six Laws

### Law 1: Transaction-First Development

No feature is added unless it directly enables or protects a completed customer-shop transaction, or protects the product DNA defined above. "Directly" means: remove this feature and either a real transaction breaks, or the product becomes indistinguishable from a generic marketplace.

### Law 2: Test Before Check

No module is marked "complete" without a manual or automated test proving the happy path works end-to-end. "Works" means: data flows from UI to database and back, errors are surfaced to the user, and state is consistent after the action.

### Law 3: Document What Is, Not What Should Be

Every reference document describes the current system state, including flaws. Aspirational state is explicitly marked `(PLANNED)` or `(NOT YET IMPLEMENTED)`. An AI reading the docs must distinguish working features from planned features without reading code.

### Law 4: One Adapter Layer

Database fields (snake_case) are translated to domain fields (camelCase) in exactly one place per entity type. That adapter function is the single source of truth for the mapping. No component, hook, or handler may do its own field translation.

**Current reality:** This law is aspirational — the codebase has multiple mapping locations (adapters in services, `mapBid` in hooks, inline mapping in components). Enforce on all new code. Consolidation is a post-launch refactor tracked in the roadmap.

### Law 5: Errors Are User-Visible

Every mutation that can fail (API call, database write, file upload) must surface failure to the user via toast, inline error, or modal. `console.error` alone is not error handling.

**Current reality:** Many handlers only `console.error` on failure. New code must follow this law. Existing violations are tracked in `REF_KNOWN_ISSUES.md`.

### Law 6: Security by Default

Auth checking is mandatory for every non-public endpoint. Rate limiting uses verified identity (from JWT), not client-provided parameters. New endpoints must call `requireClerkSession` or `requireAdminContext` — no exceptions.

---

## Foundational Product DNA (Protect Always)

These investments are not premature — they are the product identity:

| Element                                     | Why                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Map-first UI paradigm                       | BidOnDent IS a spatial product. The map is the product frame, not a feature.                |
| Premium glass design system (`bd-*` tokens) | Visual trust signal. A cheap-looking marketplace gets cheap engagement.                     |
| PostGIS spatial infrastructure              | Technical moat. No dent repair competitor has geographic service areas and spatial queries. |
| Three-role architecture                     | Marketplace topology. Keep the schema even when insurer UI is stubbed.                      |
| PWA-first mobile strategy                   | Real customers are standing next to their dented car. Mobile is the primary device.         |

---

## Map Investment Rules

| Layer                                                                   | Status           | Rule                                                                   |
| ----------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| Map-as-frame (dashboard widgets, shop directory)                        | **Foundational** | Never degrade to secondary view. Maintain and polish.                  |
| PostGIS spatial queries (getNearbyShops, getReportsInServiceArea)       | **Foundational** | Wire to product flows. This is both identity and transaction-critical. |
| Service area management                                                 | **Foundational** | Ensure CRUD UI works. Feeds spatial filtering.                         |
| Tile infrastructure (MapLibre + caching)                                | **Foundational** | Maintain. Don't change providers without cause.                        |
| Turn-by-turn navigation + voice (OSRM, Web Speech, navigation sessions) | **Frozen**       | Don't delete. Don't invest further. Not needed for marketplace proof.  |

---

## Document Authority Model

```
LAW docs override REFERENCE docs override PLAN docs.

If a REF doc and a PLAN doc conflict → current reality (REF) governs.
If a user requests work that conflicts with LAW → AI must flag the conflict
  and require explicit override. Override is valid for one session only
  unless written into the LAW doc as an amendment.
```

**Active doc tiers:**

- `LAW_*` — Permanent behavioral rules and execution authority
- `REF_*` — Current truth. Authoritative for "what is"
- `PLAN_*` — Future direction. Not current truth

---

## Co-Update Rules

| Trigger                              | Must update together                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| New migration applied                | `REF_SYSTEM_STATE.md` (if architecture-affecting)                                                     |
| New endpoint added                   | `REF_SYSTEM_STATE.md`                                                                                 |
| Module completed                     | `REF_MODULE_STATUS.md`                                                                                |
| Bug found                            | `REF_KNOWN_ISSUES.md`                                                                                 |
| Bug fixed                            | `REF_KNOWN_ISSUES.md` (mark resolved)                                                                 |
| Architecture changed                 | `REF_SYSTEM_STATE.md` + `LAW_PROJECT_RULES.md` (if a rule changes)                                    |
| Design system changed                | `REF_SYSTEM_STATE.md` § Design System                                                                 |
| New persisted media URL column added | Hydrate via `hydrateSignedStorageUrl()` and document in `SUPABASE_SETUP_GUIDE.md` §16                 |
| Edge function deploy                 | Verify `verify_jwt: false` is preserved (see `SUPABASE_SETUP_GUIDE.md` §17). Never use `--verify-jwt` |
| New reusable AI pattern surfaced     | Add as a skill in `~/.claude/skills/` and reference from `AGENTS.md` / `CLAUDE.md`                    |
| Document superseded                  | Move old doc to `docs/archive/` with date suffix                                                      |

---

## Storage + Auth Invariants (added 2026-05-02 — non-negotiable)

These are durable architectural rules. Violating them silently breaks production.

1. **Never persist a Supabase signed URL.** Signed URLs expire after 24h. Always store the `storage://<bucket>/<path>` pointer (returned by `handleUploadPhoto`) and re-sign at read time via `hydrateSignedStorageUrl()`. See `SUPABASE_SETUP_GUIDE.md` §16. Skill: `supabase-storage-signed-urls`.
2. **Never set `verify_jwt: true` on the `server` edge function.** The Supabase gateway only validates Supabase-signed JWTs and would 401 every Clerk-authed request. The function does its own Clerk verification via `requireClerkSession()`. The flag is pinned in `supabase/config.toml` `[functions.server]`. See `SUPABASE_SETUP_GUIDE.md` §17. Skill: `supabase-clerk-edge-function`.
3. **Never add new Supabase projects to the org without considering compute cost.** Each Pro project bills compute (~$10/mo Micro, ~$60/mo Medium). Pause is unavailable on Pro — only deletion drops cost. Skill: `supabase-pro-cost-control`.
4. **Never return raw `select('*')` `damage_reports` rows from a new edge handler.** Always pass through `hydrateReport()` (or at minimum `hydrateSignedStorageUrls()` on the `photo_urls` column) before responding. The bypass at `getJobAssignments` was the canonical example of this trap.

---

## Light-Mode Surface Rule (added 2026-05-03 — non-negotiable)

**Mantra: variation, not whitening.** Cream/gold is the material language. Cool blue/cyan keeps the app from turning into one beige sheet. Repeated regressions confirmed this needs to be a LAW, not a preference.

Light mode is **a cool blue-gray canvas + a layered hierarchy of warm cream/champagne panels with bronze trim + selective cool blue/cyan/indigo supporting panels and chips**. It is NOT "all white", NOT "white + gold only", and NOT "every surface painted the same cream wash".

### Page hierarchy (top to bottom)

The page is **cool blue dominant with a single warm hero panel and warm pop tiles**. Cool panels balance the warm hero so the eye lands there. NEVER paint every panel cream — that flattens the hierarchy.

| Layer                                                                        | Tone                                                         | Where it lives                                                       | Why                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Canvas / page background**                                                 | Cool misty blue-gray (`#c8d8ec → #b4c8e2`)                   | `globalSurfaceTheme.ts` `light` background                           | App stays a workspace/map product, not a beige sheet                                       |
| **Hero panel** (welcome banner — ONE per screen)                             | Richest cream-gold liquid glass with radial gold halo at top | `.bd-dashboard-panel--accent-blue` (light)                           | The only warm-dominant panel; pulls focus                                                  |
| **Main panel** (Quick Actions wrapper, Account Identity, primary content)    | Lighter cool blue/ivory liquid glass with bronze hairline    | `.bd-dashboard-panel--deep` (light)                                  | Calm cool canvas — balances the warm hero so it pops                                       |
| **Supporting panel — depth** (Repair Activity, Help & Support, list-holding) | Darker cool indigo liquid glass with bronze hairline         | `.bd-dashboard-panel--accent-indigo` (light)                         | Provides darker-blue depth in the hierarchy                                                |
| **Supporting panel — teal** (map widgets, geo cards)                         | Medium cool cyan liquid glass with bronze hairline           | `.bd-dashboard-panel--accent-cyan` (light)                           | Teal identity for map-adjacent surfaces                                                    |
| **Action tiles row** (Quick Actions)                                         | Alternating blue → deep gold → cyan → champagne              | `bd-dashboard-section--accent-{blue,gold,cyan,champagne}`            | Visible cool/warm/cool/warm rhythm — gold + champagne are the only warm pops at this scale |
| **Inner sections / list rows**                                               | Cool ivory / blue / cyan / indigo liquid glass               | `bd-dashboard-section--{deep,accent-blue,accent-cyan,accent-indigo}` | Cool family for everyday content; gold + champagne reserved for emphasis                   |
| **Chips / active states / pills**                                            | Cool frosted blue (`bg-blue-50/85` + `border-blue-200/55`)   | Inline in components — never `bg-white/*`                            | Blue is action; cool chip = clear hierarchy                                                |

### 3D liquid glass shadow stack (panels + sections, light mode)

Premium liquid glass requires **stacked multi-depth shadows + bright inner highlight + subtle inner thickness shadow + dual ring (bronze + accent)**. A single shadow reads flat. The pattern:

```
box-shadow:
  0 1-2px 2-4px  rgba(<navy>, 0.06-0.12),   /* close drop — immediate lift */
  0 4-8px 10-18px rgba(<navy>, 0.10-0.16),  /* mid drop — object on surface */
  0 18-30px 38-60px rgba(<navy>, 0.14-0.22),/* far ambient — atmospheric ground */
  inset 0 1px 0 rgba(<bright cream/ice>, 0.92-0.96),  /* top highlight — reflected light */
  inset 0 -1-2px 2-4px rgba(<navy>, 0.05-0.10),       /* bottom shadow — glass thickness */
  inset 0 -1px 0 rgba(140, 82, 22, 0.18-0.46),         /* bronze inset rim */
  0 0 0 1px rgba(<accent color>, 0.18-0.40),          /* accent ring (cool action identity) */
  0 0 0 1px rgba(140, 82, 22, 0.12-0.40),             /* bronze ring (warm material trim) */
  0 0 14-22px rgba(<accent or warm>, 0.08-0.22);      /* tight outer halo */
```

`<navy>` = `15, 30, 60` for cool panels, `28, 25, 80` for indigo, `120, 78, 18` for warm gold panels.

Backdrop filter on `.bd-dashboard-panel` and `.bd-dashboard-section` must be `blur(20px) saturate(1.4) brightness(1.02)` — blur for translucency, saturate for shimmer, brightness boost to feel illuminated.

**Forbidden in light mode:**

1. **No pure-white surfaces.** `rgba(255, 255, 255, *)` and `#fff` are banned for any panel, section, card, or shell background. Default warm cream base: `linear-gradient(180deg, rgba(254, 248, 232, 0.94) 0%, rgba(248, 238, 215, 0.86) 100%)`. Variants vary cream depth (deeper champagne, lighter ivory) but never reach pure white.
2. **No pure-white inset highlights.** `inset 0 1px 0 rgba(255, 255, 255, *)` is banned. Top-edge highlights must be warm cream `rgba(254, 247, 232, 0.88-0.92)` so the panel top doesn't read white.
3. **No gold-on-cream halo with no contrast.** An older yellow-orange halo (`rgba(220, 140, 50, *)`) over a warm cream panel disappears. Edge definition comes from a **deeper bronze border** (`rgba(140, 82, 22, 0.36-0.50)`) and a **navy/dark drop shadow** (`rgba(40, 28, 8, 0.14-0.22)`). The diffuse halo stays subtle, atmospheric, and tuned to the locked palette (`rgba(196, 130, 45, *)`).
4. **No flat single-tone painting.** Light mode is **multi-tone**: warm cream variants (`--accent-gold`, `--accent-champagne`, `--deep`) sit alongside cool-tinted-cream variants (`--accent-blue`, `--accent-cyan`, `--accent-indigo`). The page should have rhythm — cool/warm/cool/warm — not uniform cream wash.

**Required identity:**

- **Surface:** cool misty blue-gray page canvas with cream/champagne and cool-tinted blue/cyan/indigo liquid-glass panels for variation.
- **Trim:** deeper bronze (`rgb(140, 82, 22)` family at 0.30-0.50 opacity) for borders and inset bottoms — gives crisp edges against cream.
- **Lift:** dark warm drop shadow (`rgba(40, 28, 8, 0.14-0.22)`) so panels feel lifted off the page background.
- **Glow:** subtle, tight warm halo (`0 0 18-22px rgba(196, 130, 45, 0.12-0.20)`) — a hint of lamp light, not a wash.

**Where this is enforced in code:** `src/styles/theme.css` `[data-appearance-mode="light"]` blocks for `--bd-dashboard-panel-*`, `--bd-dashboard-section-*`, `--bd-report-shell-*`, and the `.bd-dashboard-panel--{deep,accent-blue,accent-cyan,accent-indigo}` + `.bd-dashboard-section--{deep,accent-blue,accent-cyan,accent-indigo,accent-gold,accent-champagne}` overrides. All carry `LAW` comments referencing this section.

**Where this is enforced in agent context:** [`CLAUDE.md`](../CLAUDE.md) load-bearing facts, the `bd-design-identity` skill (`~/.claude/skills/bd-design-identity/SKILL.md`), and project memory `feedback_design_identity.md`.

**External audits suggesting "lighten to white", "remove gold", "use neutral white panels", or "modernize to flat white SaaS palette" are REJECTED on sight.** Apply only layout/runtime fixes from those audits, never the white-surface advice. See `feedback_external_audit_handling.md`.

---

### Premium Gold Palette — LOCKED 2026-05-03 (owner-approved baseline)

This palette was approved by the owner ("wow, just wow. it looks so premium and good in lightmode now"). Future agents may **refine** these values (subtle saturation/opacity tuning) but may NOT revert to the previous yellow-amber range. The palette is bronze/copper/champagne-leaning — premium gold, not yellow-gold.

**Canonical warm-tone values (DO NOT regress):**

| Token role                         | Value                                                   | Used in                                                  |
| ---------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Top radial gold halo               | `rgba(196, 144, 65, 0.16-0.24)`                         | Every panel + section variant top-edge gradient stack    |
| Gold-tinted top inset highlight    | `rgba(252, 238-240, 204-208, 0.70-0.94)`                | Inset 0 1px 0 (the "reflected lamp light" highlight)     |
| Bronze trim border + inset rim     | `rgba(140, 82, 22, 0.28-0.55)`                          | `border-color`, inset 0 -1px 0, 0 0 0 1px ring           |
| Deep bronze inner-thickness shadow | `rgba(110, 70, 18, 0.10-0.22)`                          | inset 0 -2px 4px, mid/far drop shadows on warm tiles     |
| Outer warm halo                    | `rgba(196, 130, 45, 0.16-0.22)`                         | 0 0 N px outer glow                                      |
| Hero panel surface                 | `rgba(244, 222, 178, 0.94) → rgba(228, 198, 144, 0.86)` | `.bd-dashboard-panel--accent-blue` light gradient        |
| Action gold tile                   | `rgba(244, 222, 178, 0.96) → rgba(228, 198, 144, 0.86)` | `.bd-dashboard-section--accent-gold` light gradient      |
| Action champagne tile              | `rgba(250, 234, 198, 0.96) → rgba(240, 220, 178, 0.86)` | `.bd-dashboard-section--accent-champagne` light gradient |

**Forbidden warm-tone values (the previous yellow-amber palette — do NOT bring these back):**

| Replaced value                                       | What it produced                               |
| ---------------------------------------------------- | ---------------------------------------------- |
| `rgba(220, 165, 90, *)` for halos                    | Read as yellow-amber instead of premium gold   |
| `rgba(254, 248, 220, *)` for insets                  | Pale yellow highlight, not warm reflected lamp |
| `rgba(160, 95, 25, *)` for trim                      | Slightly orange-brown, not refined bronze      |
| `rgba(220, 140, 50, *)` for outer halo               | Pumpkin-orange, not premium copper             |
| `rgba(250, 232, 192) → rgba(240, 218, 168)` for hero | Pale yellow cream, not deep premium champagne  |

**Improvement direction (allowed):** finer saturation tuning, micro-adjustments to opacity/spread, additional 3D depth refinements that respect the palette. Anything that **shifts the warm tone back toward yellow** or **makes the cool surfaces white** requires explicit owner override (per the rule above).

---

## Premium Glass Body Opacity + Directional Backlight Canon (added 2026-05-04 — non-negotiable)

Owner directive 2026-05-04 ("make needed law changes for better design") elevated the directional-triad pattern from REF tier to LAW tier after Pass A-F surfaced it as the canonical premium-glass treatment. These rules apply to every premium liquid-glass surface (`.bd-dashboard-panel`, `.bd-dashboard-section` and accent variants, `.bd-glass-card--landing*`, `.bd-glass-card--dashboard`, `.bd-glass-floating`, `MapBidSheet`, future forms/sheets/dialogs).

### Body opacity invariants (verified by Pass F + Pass F-fix owner verification)

Premium glass card bodies must sit in these opacity ranges so the page DashboardAtmosphere ceiling lamps show through the body via `backdrop-filter: blur + saturate`:

| Register | Range          | Verified balance for | Notes                                               |
| -------- | -------------- | -------------------- | --------------------------------------------------- |
| Light    | **0.76 – 0.84** | dashboard panel + section + glass-card-dashboard | Pass F's 0.74/0.62 was too aggressive (washed-out, lost panel containment per owner verification). 0.84/0.76 is the verified balance. |
| Dark     | **0.66 – 0.78** | dashboard panel + section                        | Pass F-verified working: page navy + gold lamps clearly bleed through, panel still contained. |

Bodies above 0.92 are paint, not glass — `backdrop-filter` has nothing to refract. Bodies below 0.62 lose panel containment and read washed-out.

### Directional Backlight Canon — REQUIRED

Premium glass cards use a 3-layer shadow stack:

```
close edge halo   0 0 32-60px       ≤ 0.18α    soft edge presence
mid spread        0 0 90-110px      ≤ 0.10α    atmosphere lift
DIRECTIONAL       0 -28 to -44px    blur 70-130px    spread -14 to -22px    ≤ 0.22α
                  champagne-gold rgba(196,144,65) — light cascading from page atmosphere ABOVE
```

Negative offset-Y on the third layer reads as "light coming FROM above" (the DashboardAtmosphere ceiling lamps), not "halo around card" (which omnidirectional `0 0 X-large` produces).

### Forbidden patterns

- **Omnidirectional `0 0 X-large` far-ambient bleeds (≥120px blur) on premium glass cards.** They read as stamped trim, not backlit glass. Use directional top-cast `0 -Y blur -spread` champagne-gold instead. (Pass E shipped this and was corrected in Pass F because cards still read as stamped.)
- **Internal radial gold paint at >0.05α in light-mode card bodies.** Stacks with cream body to cause peach/pink blush. Light register reserves the warm gold lamp for the directional top-cast shadow only — the body itself stays cool-cream, no warm radial overlay. (Pass F shipped this fix after owner reported "blushing.")
- **Pink/peach/red-leaning ambient anywhere on light-mode surfaces.** Cosmetic blush look forbidden going forward. (Symptom of stacking warm-bronze halos on cool-cream canvas.)
- **Pure-white inset highlights** `inset 0 1px 0 rgba(255,255,255,*)` are ALREADY forbidden by the Light-Mode Surface Rule above; reaffirming here because LAW-violation on `.bd-glass-card--dashboard` and `.bd-glass-floating` was caught and fixed in this 2026-05-04 pass.

### Improvement direction (allowed)

Per-surface alpha micro-tuning within the body opacity invariants, blur/spread micro-tuning within the directional triad ranges, addition of new premium glass surfaces using the canon. **Forbidden:** going back to omnidirectional `0 0 X-large`, going back to body opacity >0.92, going back to internal radial gold paint stacking on light cream bodies. These regressions cost owner trust to find and own to correct.
