# BidOnDent — Finishing Master Plan

**Last updated:** March 28, 2026

**Created:** 2026-03-25
**Status:** Active execution policy (legacy roadmap archived)
**Phase:** Pre-refactor stabilization and verification
**Context:** Use current verification artifacts instead of legacy pass-number sequencing.

This is the single source of truth for what remains to finish BidOnDent. It synthesizes insights from screenshots, all governing docs, ChatGPT analysis, and codebase audit.

Pre-refactor verification references:

- `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`
- `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`

---

## The Product Truth

BidOnDent is a **map-first auto body repair marketplace**. The map is not a feature — it is the product. Everything else (reports, bids, shop discovery, insurer workflows) supports the spatial experience.

The site is **109% past its original milestone** (185/160 passes). The design system is unified. The glass tokens are locked. The blue identity is established. What remains is not more polish — it is **product completion and coherence**.

### What the screenshots confirm is strong

- Hero section: premium, clean, honest
- Map/coverage section: the strongest, most product-owned surface on the entire site
- Report wizard: functional 5-step flow with cloud storage
- Glass system: unified across all surfaces
- Trust stats and copy: honest, no false claims
- Business inquiry gateway: progressive disclosure, no wall-of-inputs

### What the screenshots reveal as gaps

- Light landing sections feel disconnected from the stronger map/dark identity
- Dashboard feels like "UI with a map widget" not "map with floating panels"
- Some navigation transitions crash ("Can't find variable: props")
- Section stacking in lighter areas feels template-like
- Customer journey (landing → report → bids → decision) doesn't yet feel like one connected spatial experience

---

## Hard Rules

1. **NO new features** — finish what exists
2. **NO scope expansion** — log unrelated issues, don't fix them
3. **NO design experimentation** — the design system is locked
4. **NO touching unrelated files** — surgical passes only
5. **NO fantasy data or fake capabilities** — honesty is the product
6. **NO skipping doc updates** — every pass updates the build dashboard
7. **NO batching unrelated changes** — one pass, one goal

---

## Current Execution Policy

This document previously used strict pass numbers (`Pass 186+`) as if upcoming work were fixed and sequential.
That content is now **historical** and should not be treated as active sequencing guidance.

Active pre-refactor execution should use:

- `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`
- `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`
- `BIDONDENT_MAP_TRACKER_2026-03-21.md`
- `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`

### Practical Priority Order (Current)

1. Functional correctness across customer/shop/insurer routes and pages.
2. Map-first flow continuity (`report -> map -> shop -> action`) on mobile and desktop.
3. UI trust issues that block or confuse real users.
4. Documentation coherence across all active docs (including setup/auth docs).
5. Refactor readiness hardening only after verification artifacts are current.

### Legacy Roadmap Archive Note

The older phase-by-phase numbered roadmap remains in git history as context, but is intentionally retired from active execution policy to prevent stale pass numbering and false sequencing constraints.

---

## Validation Gate (Run After Every Pass)

Every pass must answer YES to all four:

1. **Does this make the map feel more central?**
2. **Does this reduce friction?**
3. **Does this feel more like an app than a website?**
4. **Would a premium map-first product do this?**

If any answer is NO → revise before continuing.

---

## Documentation Rule

After each completed pass:

1. Update `BIDONDENT_MAP_TRACKER_2026-03-21.md` — pass log entry for executed work
2. Update `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — when strategy/architecture implications change
3. Update this plan if execution policy or finishing priorities change
4. Update `docs/README.md` only when source-of-truth classification changes

---

## Stop Conditions

Pause and ask for direction if:

- Build breaks in a genuinely new way
- Required product behavior is unclear
- Scope expansion would be needed to continue
- Docs are contradictory enough to block safe execution

Otherwise: **keep going.**

---

## North Star

The user should feel like they are **navigating a system** — not using a website.

The map is alive. Location is context. Every action is spatial. Trust is earned through clarity, not claimed through marketing.

**Finish BidOnDent.**
