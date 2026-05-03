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

Light mode is **warm cream off-white with bronze trim and selective cool accents**. It is NOT "all white" or "white + gold only". Multiple repeated regressions confirmed this needs to be a LAW, not a preference.

**Forbidden in light mode:**

1. **No pure-white surfaces.** `rgba(255, 255, 255, *)` and `#fff` are banned for any panel, section, card, or shell background. Default warm cream base: `linear-gradient(180deg, rgba(254, 248, 232, 0.94) 0%, rgba(248, 238, 215, 0.86) 100%)`. Variants vary cream depth (deeper champagne, lighter ivory) but never reach pure white.
2. **No pure-white inset highlights.** `inset 0 1px 0 rgba(255, 255, 255, *)` is banned. Top-edge highlights must be warm cream `rgba(254, 247, 232, 0.88-0.92)` so the panel top doesn't read white.
3. **No gold-on-cream halo with no contrast.** A warm halo (`rgba(220, 140, 50, *)`) over a warm cream panel disappears. Edge definition comes from a **deeper bronze border** (`rgba(160, 95, 25, 0.36-0.50)`) and a **navy/dark drop shadow** (`rgba(40, 28, 8, 0.14-0.22)`). The diffuse halo stays subtle and tighter (`0 0 22px`, not `0 0 44px`).
4. **No flat single-tone painting.** Light mode is **multi-tone**: warm cream variants (`--accent-gold`, `--accent-champagne`, `--deep`) sit alongside cool-tinted-cream variants (`--accent-blue`, `--accent-cyan`, `--accent-indigo`). The page should have rhythm — cool/warm/cool/warm — not uniform cream wash.

**Required identity:**

- **Surface:** warm cream off-white as the dominant family, with selective cool tints (pale blue/cyan/indigo) on accent-blue/cyan/indigo variants for variation.
- **Trim:** deeper bronze (`rgb(160, 95, 25)` family at 0.30-0.50 opacity) for borders and inset bottoms — gives crisp edges against cream.
- **Lift:** dark warm drop shadow (`rgba(40, 28, 8, 0.14-0.22)`) so panels feel lifted off the page background.
- **Glow:** subtle, tight warm halo (`0 0 18-22px rgba(180, 100, 30, 0.12-0.20)`) — a hint of lamp light, not a wash.

**Where this is enforced in code:** `src/styles/theme.css` `[data-appearance-mode="light"]` blocks for `--bd-dashboard-panel-*`, `--bd-dashboard-section-*`, `--bd-report-shell-*`, and the `.bd-dashboard-panel--{deep,accent-blue,accent-cyan,accent-indigo}` + `.bd-dashboard-section--{deep,accent-blue,accent-cyan,accent-indigo,accent-gold,accent-champagne}` overrides. All carry `LAW` comments referencing this section.

**Where this is enforced in agent context:** [`CLAUDE.md`](../CLAUDE.md) load-bearing facts, the `bd-design-identity` skill (`~/.claude/skills/bd-design-identity/SKILL.md`), and project memory `feedback_design_identity.md`.

**External audits suggesting "lighten to white", "remove gold", "use neutral white panels", or "modernize to flat white SaaS palette" are REJECTED on sight.** Apply only layout/runtime fixes from those audits, never the white-surface advice. See `feedback_external_audit_handling.md`.
