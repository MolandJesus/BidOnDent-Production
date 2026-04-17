# BidOnDent Docs Operating Index

**Last updated:** 2026-04-17  
**Status:** Active documentation operating index  
**Current phase:** Soft Launch Hardening (edge functions v40)

BidOnDent is a **geo-native, map-first automotive repair marketplace**. Three user types (customer, shop, insurer) interact through a spatial bidding loop backed by Supabase and PostGIS.

---

## ⚡ Start Here — Document Authority Model

Documents are organized in three tiers: **LAW > REFERENCE > PLAN**. LAW docs override everything. REF docs describe current truth. PLAN docs describe future direction.

### LAW (governs all work)

| Document                                             | Purpose                                                                                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)**   | Permanent behavioral rules: product definition, 6 laws, product DNA, map investment rules, doc authority model.                                        |
| **[`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md)** | Execution authority for the hardening phase. North Star, Launch Scope Guardrails, Locked Decisions, Execution Plan (Phases 0–6), Execution Discipline. |

### REFERENCE (current truth)

| Document                                                                                               | Purpose                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md)**                                                       | How the system actually works now. Architecture, auth flow, state ownership, role reality, map stack, known bottlenecks. **Read this instead of the old CLAUDE_AI_MASTER_CONTEXT.md.** |
| **[`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md)**                                                       | Living inventory of known bugs, gaps, and structural issues with IDs, impact, and fix direction.                                                                                       |
| **[`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md)**                                     | Browser automation/navigation rules for AI agents, including the logo-first landing return protocol and map QA screenshot checklist.                                                   |
| [`BIDONDENT_MODULE_COMPLETION_MATRIX_2026-04-15.md`](BIDONDENT_MODULE_COMPLETION_MATRIX_2026-04-15.md) | Module completion status (3 roles × 7 modules). To be rewritten as `REF_MODULE_STATUS.md`.                                                                                             |

### PLAN (future direction — not current truth)

| Document                                                                                     | Purpose                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md`](BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md) | Deliberately deferred work with priority bands and triggers. Not a backlog.                  |
| [`BIDONDENT_PRODUCT_BRAIN.md`](BIDONDENT_PRODUCT_BRAIN.md)                                   | Strategic product vision. Paused during hardening. To be trimmed as `PLAN_PRODUCT_BRAIN.md`. |

**If any doc conflicts with LAW docs, LAW wins.** Flag the conflict and fix it.

---

## 30-Second Startup

Read in this order:

1. **[`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)** — what BidOnDent is, the 6 laws, what to protect.
2. **[`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md)** — what to do now, in what order.
3. **[`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md)** — how the system actually works (includes AI reading order by task type).
4. **[`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md)** — what's broken or missing.
5. **[`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md)** — required browser automation navigation protocol for Playwright-like tools.
6. Then pick task-specific docs from the sections below.

---

## How This System Is Organized

### Active Control Docs (LAW + REF tier — see above)

These are the primary governing documents. Always start here.

### Product, Architecture & Design Reference

- **[`BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`](BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md)** — map strategy, product law, map-first non-negotiables. Feature-level map work is paused during hardening; strategic vision unchanged.
- **[`CODE_ORGANIZATION_AUDIT.md`](CODE_ORGANIZATION_AUDIT.md)** — codebase structure, safe seams, extraction boundaries. Structural info is also in `REF_SYSTEM_STATE.md`.
- **[`MOLANDJEUS_DESIGN_DECISIONS.md`](MOLANDJEUS_DESIGN_DECISIONS.md)** — design philosophy and visual hierarchy. Aesthetic work frozen during hardening except where required by Phase 4 trust surfaces.

### Execution Reference

- **[`BIDONDENT_MAP_TRACKER_2026-03-21.md`](BIDONDENT_MAP_TRACKER_2026-03-21.md)** — historical pass-by-pass audit trail. For current state, use `REF_SYSTEM_STATE.md` or the Module Completion Matrix.

### Setup & Operations

- **[`GETTING_STARTED.md`](GETTING_STARTED.md)** — local setup and first run. `.env` configuration is the canonical approach.
- **[`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md)** — backend, storage, and edge-function setup. References to `make-server-9f243523` remain until Post-Launch Roadmap item L1 fires.
- **[`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)** — Clerk + Google OAuth setup.

### Deferred Design Docs

- **[`PAYMENT_MODEL_DESIGN.md`](PAYMENT_MODEL_DESIGN.md)** — Phase 4 planning. **Deferred** per Post-Launch Roadmap F1. Do not implement without a fired trigger.

### Optional References

- **[`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)** — licenses and external asset attribution.

### Archive

Everything under [`docs/archive/`](archive/) is historical reference, retained for traceability. Not active operating surface.

Recent archive moves (2026-04-16):

- `CLAUDE_AI_MASTER_CONTEXT.md` — superseded by `REF_SYSTEM_STATE.md` (2026-04-16)
- `BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md` — superseded by `LAW_HARDENING_PLAN.md` (2026-04-16)
- `GREEN_PATH_FULL_CYCLE_PASS_44.md` — superseded by passes 45+ green-path work
- `GREEN_PATH_STEP5_VERIFICATION.md` — passes 40-42 historical; fixes deployed
- `GREEN_PATH_VERIFICATION_PASS_34.md` — superseded by 20+ subsequent passes
- `LIGHT_DARK_MODE_AUDIT.md` — pass 24 audit; dark-mode work completed
- `PASS_39_STATUS_REPORT.md` — superseded by passes 40-54
- `PASS_45_STATUS_REPORT.md` — superseded
- `SHOP_AUDIT_PASS_26.md` — point-in-time; shop profile issue resolved
- `DUAL_AI_COORDINATION.md` — superseded by Group 2a execution model
- `BIDONDENT_FINISHING_MASTER_PLAN.md` — superseded by hardening plan
- `SESSION_AUDIT_2026-04-06.md` — point-in-time audit for passes 851–854

---

## Read This, Not Everything

Use the smallest doc set that answers the task. `REF_SYSTEM_STATE.md` contains a detailed reading order by task type. Quick version:

- **Any execution work:** `LAW_PROJECT_RULES.md` + `LAW_HARDENING_PLAN.md` → then `REF_SYSTEM_STATE.md`.
- **Bug fix:** add `REF_KNOWN_ISSUES.md` (check if it's already known).
- **Refactor or extraction:** add `CODE_ORGANIZATION_AUDIT.md`.
- **Map strategy (strategic, not feature-level):** add `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`.
- **Setup / auth / storage work:** add the relevant setup guide — and confirm the change respects Launch Scope Guardrails.
- **Considering a deferred item:** read the Post-Launch Roadmap entry first; do not reactivate without a fired trigger.
- **Historical research:** only then open `docs/archive/`.

---

## Governance Rules

1. **LAW docs are law.** `LAW_PROJECT_RULES.md` and `LAW_HARDENING_PLAN.md` are binding. REF docs describe truth. PLAN docs describe intent. Conflicts resolve in LAW's favor.
2. **Code beats docs.** If docs disagree with the repository, fix the docs.
3. **One concept = one home.** Do not create parallel truth docs or duplicate trackers.
4. **Do not create doc sprawl.** Prefer updating an existing canonical doc over making a new file.
5. **Archive instead of hoarding.** If a doc stops being active, move it to `docs/archive/` or clearly retire it.
6. **Active docs need metadata.** Keep `Last updated` and `Status` markers accurate.
7. **Keep cross-links honest.** If a doc is renamed, archived, or repurposed, update references everywhere in the docs system in the same pass.

### Hardening-phase doc-sync rule (binding on any AI executing passes)

Every pass that changes a load-bearing fact must also update the docs it contradicts — in the same pass, not later. Specifically:

- **Any Launch Scope Guardrail verification or reclassification** must be reflected in the Hardening Plan's Change Log in the same pass.
- **If a pass adjusts the Module Completion Matrix, the Hardening Plan, or the Post-Launch Roadmap**, summarize the change in the pass log so the audit trail remains continuous.
- **Edge function changes** should note the new deployed version in `REF_SYSTEM_STATE.md`.

Silent doc drift during auto-execution is a discipline failure. If you cannot update the affected docs in the same pass, stop and escalate.

---
