# BidOnDent — Project Rules (LAW)

**Authority level:** LAW — governs all work. Cannot be violated without explicit per-session override from the project owner.

**Last updated:** 2026-04-16

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

| Role | Priority | Description |
|------|----------|-------------|
| **Customer** | Primary user | Has the dented car. Submits reports, receives bids, accepts bids. Product is built for this person first. |
| **Shop** | Primary supply | Does the repair. Views reports in service area, bids competitively, manages jobs. |
| **Insurer** | Secondary participant | Participates in transactions they don't initiate. Always subordinate to customer-shop transaction. |
| **Admin** | Internal only | User management, moderation, marketplace health. API-only until >100 active users. |

**Rule:** Never build insurer features that don't connect to a customer-shop transaction.

---

## BidOnDent Must Never Become

| Anti-pattern | Boundary |
|---|---|
| A Yelp-style directory without bidding | If shops set prices unilaterally, the product has failed |
| A fleet management / dispatch tool | Navigation sessions serve this future — freeze, don't build toward it |
| An insurance claims processing platform | Insurers participate; they are not the customer |
| A SaaS tool for shops | BidOnDent gives shops customers, not operational software |
| A white-label marketplace engine | One brand, one marketplace, one set of rules |

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

| Element | Why |
|---|---|
| Map-first UI paradigm | BidOnDent IS a spatial product. The map is the product frame, not a feature. |
| Premium glass design system (`bd-*` tokens) | Visual trust signal. A cheap-looking marketplace gets cheap engagement. |
| PostGIS spatial infrastructure | Technical moat. No dent repair competitor has geographic service areas and spatial queries. |
| Three-role architecture | Marketplace topology. Keep the schema even when insurer UI is stubbed. |
| PWA-first mobile strategy | Real customers are standing next to their dented car. Mobile is the primary device. |

---

## Map Investment Rules

| Layer | Status | Rule |
|---|---|---|
| Map-as-frame (dashboard widgets, shop directory) | **Foundational** | Never degrade to secondary view. Maintain and polish. |
| PostGIS spatial queries (getNearbyShops, getReportsInServiceArea) | **Foundational** | Wire to product flows. This is both identity and transaction-critical. |
| Service area management | **Foundational** | Ensure CRUD UI works. Feeds spatial filtering. |
| Tile infrastructure (MapLibre + caching) | **Foundational** | Maintain. Don't change providers without cause. |
| Turn-by-turn navigation + voice (OSRM, Web Speech, navigation sessions) | **Frozen** | Don't delete. Don't invest further. Not needed for marketplace proof. |

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

| Trigger | Must update together |
|---|---|
| New migration applied | `REF_SYSTEM_STATE.md` (if architecture-affecting) |
| New endpoint added | `REF_SYSTEM_STATE.md` |
| Module completed | Module Completion Matrix (currently `BIDONDENT_MODULE_COMPLETION_MATRIX_2026-04-15.md`) |
| Bug found | `REF_KNOWN_ISSUES.md` |
| Bug fixed | `REF_KNOWN_ISSUES.md` (mark resolved) |
| Architecture changed | `REF_SYSTEM_STATE.md` + `LAW_PROJECT_RULES.md` (if a rule changes) |
| Design system changed | `REF_SYSTEM_STATE.md` § Design System |
| Document superseded | Move old doc to `docs/archive/` with date suffix |
