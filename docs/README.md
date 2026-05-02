# BidOnDent Docs Operating Index

**Last updated:** 2026-05-02
**Status:** Active documentation operating index
**Current phase:** Soft Launch Hardening (edge functions v50, `verify_jwt: false`, storage pointer pattern)

BidOnDent is a **geo-native, map-first automotive repair marketplace**. Three user types (customer, shop, insurer) interact through a spatial bidding loop backed by Supabase and PostGIS.

**AI agents:** start at [`../AGENTS.md`](../AGENTS.md) (or [`../CLAUDE.md`](../CLAUDE.md) — identical content). They are the lean entry point that pulls the right docs from this index based on the task.

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
| [`REF_MODULE_STATUS.md`](REF_MODULE_STATUS.md)                     | Module completion status (3 roles × 7 modules).                                                                                      |
| [`REF_CODE_ORGANIZATION.md`](REF_CODE_ORGANIZATION.md)             | Codebase structure, safe seams, extraction boundaries.                                                                               |

### PLAN (future direction — not current truth)

| Document                                                       | Purpose                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`PLAN_POST_LAUNCH_ROADMAP.md`](PLAN_POST_LAUNCH_ROADMAP.md)   | Deliberately deferred work with priority bands and triggers. Not a backlog.          |
| [`PLAN_PRODUCT_BRAIN.md`](PLAN_PRODUCT_BRAIN.md)               | Strategic product vision. Paused during hardening.                                   |
| [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md)                     | Map strategy and product law. Feature-level map work paused; strategic vision intact. |
| [`PLAN_PAYMENT_MODEL.md`](PLAN_PAYMENT_MODEL.md)               | Payment model. **Deferred** per Post-Launch Roadmap F1. Do not implement without a fired trigger. |

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

### Design

- **[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md)** — design philosophy and visual hierarchy. Aesthetic work frozen during hardening except where required by Phase 4 trust surfaces.

### Phase / Audit Docs (open-ended)

- **[`PHASE_6_SMOKE_TEST_CHECKLIST.md`](PHASE_6_SMOKE_TEST_CHECKLIST.md)** — three-environment smoke test (Local Docker / Hosted Staging / Production). Hosted columns still partial.
- **[`SHOP_AUDIT_REPORT_2026-04-29.md`](SHOP_AUDIT_REPORT_2026-04-29.md)** — Shop role audit. "Best Next Passes" outstanding.

### Setup & Operations

- **[`GETTING_STARTED.md`](GETTING_STARTED.md)** — local setup and first run. `.env` configuration is the canonical approach.
- **[`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md)** — backend, storage, and edge-function setup. **§16 Storage Pointer Pattern** + **§17 verify_jwt = false** are load-bearing.
- **[`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)** — Clerk + Google OAuth setup.

### Optional References

- **[`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)** — licenses and external asset attribution.

### AI Agent Skills (reusable across projects)

Project-specific patterns that future projects can reuse live under `~/.claude/skills/`. Reference them by name in commits and pass logs:

- `supabase-clerk-edge-function` — verify_jwt:false + requireClerkSession pattern (covers KI-059)
- `supabase-storage-signed-urls` — pointer-on-write, sign-on-read; backfill template (covers KI-058)
- `supabase-pro-cost-control` — per-project compute cost model (covers KI-061)
- `bd-design-identity` — calm/premium/map-first / blue-system rules (companion to `MOLANDJESUS_DESIGN_DECISIONS.md`)

### Archive

Everything under [`docs/archive/`](archive/) is historical reference, retained for traceability. Not active operating surface.

Most recent archive moves (2026-05-02):

- `BIDONDENT_MAP_TRACKER_2026-03-21.md` → archive — 2127-line pass log, superseded by `REF_MODULE_STATUS.md`. Preserved as audit trail.
- `AUDIT_FIX_PLAN_2026-04-27.md` → archive — Pass A-O completed (commits b860062f, 4f077536); residual items moved to `REF_KNOWN_ISSUES.md` if any.

Earlier moves (2026-04-16):

- `CLAUDE_AI_MASTER_CONTEXT.md` — superseded by `REF_SYSTEM_STATE.md`
- `BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14.md` — superseded by `LAW_HARDENING_PLAN.md`
- `BIDONDENT_FINISHING_MASTER_PLAN.md` — superseded by hardening plan
- `DUAL_AI_COORDINATION.md` — superseded by Group 2a execution model
- Various `GREEN_PATH_*`, `PASS_*_STATUS_REPORT`, `LIGHT_DARK_MODE_AUDIT`, `SHOP_AUDIT_PASS_26`, `SESSION_AUDIT_2026-04-06` — point-in-time, superseded

---

## Read This, Not Everything

Use the smallest doc set that answers the task. `REF_SYSTEM_STATE.md` contains a detailed reading order by task type. Quick version:

- **Any execution work:** `LAW_PROJECT_RULES.md` + `LAW_HARDENING_PLAN.md` → then `REF_SYSTEM_STATE.md`.
- **Bug fix:** add `REF_KNOWN_ISSUES.md` (check if it's already known).
- **Refactor or extraction:** add `REF_CODE_ORGANIZATION.md`.
- **Map strategy (strategic, not feature-level):** add `PLAN_MAP_MASTER.md`.
- **Setup / auth / storage work:** add `SUPABASE_SETUP_GUIDE.md` (esp. §16 + §17) — and confirm the change respects Launch Scope Guardrails. Use the relevant skill (`supabase-clerk-edge-function`, `supabase-storage-signed-urls`).
- **Cost / billing question:** `SUPABASE_SETUP_GUIDE.md` §1 + the `supabase-pro-cost-control` skill.
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
