# BidOnDent Docs Operating Index

**Last updated:** 2026-05-04
**Status:** Active documentation operating index
**Current phase:** Soft Launch Hardening (edge functions v50, `verify_jwt: false`, storage pointer pattern)
**Current handoff:** see git log + active relay prompt context (per relay discipline: do NOT create new session-report docs — the git log + commit messages are the durable record)

BidOnDent is a **geo-native, map-first automotive repair marketplace**. Three user types (customer, shop, insurer) interact through a spatial bidding loop backed by Supabase and PostGIS.

**AI agents:** start at [`../AGENTS.md`](../AGENTS.md) (or [`../CLAUDE.md`](../CLAUDE.md) — identical content). They are the lean entry point that pulls the right docs from this index based on the task.

---

## ⚡ Start Here — Document Authority Model

Documents are organized in four tiers: **LAW > REFERENCE > PLAN > OPS** (OPS added 2026-05-04). LAW docs override everything. REF docs describe current truth. PLAN docs describe future direction. OPS docs describe procedures, runbooks, audit logs, and phase execution logs.

**Apex design canon:** [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) is treated as effectively LAW-tier despite the filename — it is the locked apex design authority. Per owner directive 2026-05-04: do not merge, split, restructure, rename, archive, or edit it. Cross-refs always point INTO it.

### LAW (governs all work)

| Document                                                                 | Purpose                                                                                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)**                       | Permanent behavioral rules: product definition, 6 laws, product DNA, map investment rules, doc authority model, palette canon, glass canon.            |
| **[`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md)**         | Four-layer model (L1/L2/L3/L4), file-size budgets, forbidden cross-layer flows, grandfathering policy, multi-AI coordination via `AI_LOCK.md`.         |
| **[`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md)**                     | Execution authority for the hardening phase. North Star, Launch Scope Guardrails, Locked Decisions, Execution Plan (Phases 0–6), Execution Discipline. |
| **[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md)** | **LOCKED apex design canon.** Effectively LAW-tier. Required read for any design-touching task. Do NOT propose merges/splits/edits.                    |

### REFERENCE (current truth)

| Document                                                                   | Purpose                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md)**                           | How the system actually works now. Architecture, auth flow, state ownership, role reality, map stack, known bottlenecks. **Read this instead of the old CLAUDE_AI_MASTER_CONTEXT.md.**                           |
| **[`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md)**                           | Living inventory of known bugs, gaps, and structural issues with IDs, impact, and fix direction.                                                                                                                 |
| **[`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md)**         | Browser automation/navigation rules for AI agents, including the logo-first landing return protocol and map QA screenshot checklist.                                                                             |
| **[`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md)** | Multi-AI collaboration rules: how to parse Mola's pasted AI transcripts, embedded owner directives, relay prompts, planning-only cues, and autopilot permissions.                                                |
| **[`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md)**                         | Current visual system: identity, `bd-*` utility inventory, cross-app adoption status, intentionally separate sibling systems. Single source of truth for design state across landing + dashboard + app surfaces. |
| [`REF_MODULE_STATUS.md`](REF_MODULE_STATUS.md)                             | Module completion status (3 roles × 7 modules).                                                                                                                                                                  |
| [`REF_CODE_ORGANIZATION.md`](REF_CODE_ORGANIZATION.md)                     | Codebase structure, safe seams, extraction boundaries.                                                                                                                                                           |

### PLAN (future direction — not current truth)

| Document                                                                                                                                            | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`PLAN_POST_LAUNCH_ROADMAP.md`](PLAN_POST_LAUNCH_ROADMAP.md)                                                                                        | Deliberately deferred work with priority bands and triggers. Not a backlog.                                                                                                                                                                                                                                                                                                                                                      |
| [`PLAN_PRODUCT_BRAIN.md`](PLAN_PRODUCT_BRAIN.md)                                                                                                    | **STUB (2026-05-04).** Original 1,444-line content split per Phase 1.5c. Forward-looking CARDS moved to `PLAN_PRODUCT_FUTURE_CARDS.md`. Full original at `docs/archive/PLAN_PRODUCT_BRAIN_archived_2026-05-04.md`.                                                                                                                                                                                                               |
| [`PLAN_PRODUCT_FUTURE_CARDS.md`](PLAN_PRODUCT_FUTURE_CARDS.md)                                                                                      | **NEW (2026-05-04).** Forward-looking work cards (one-card-per-system pattern) extracted from `PLAN_PRODUCT_BRAIN`. Future direction; no current truth.                                                                                                                                                                                                                                                                          |
| [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md)                                                                                                          | Map strategy and product law. Feature-level map work paused; strategic vision intact.                                                                                                                                                                                                                                                                                                                                            |
| [`PLAN_PAYMENT_MODEL.md`](PLAN_PAYMENT_MODEL.md)                                                                                                    | Payment model. **Deferred** per Post-Launch Roadmap F1. Do not implement without a fired trigger.                                                                                                                                                                                                                                                                                                                                |
| [`PLAN_DASHBOARD_REDESIGN.md`](PLAN_DASHBOARD_REDESIGN.md)                                                                                          | Dashboard premium-lift plan (2026-05-02) — **PRE-EXECUTION**. Brings landing's _quality_ bar to all 4 roles' dashboard surfaces (~139 component files across customer/shop/insurer/admin) without violating the §9 inheritance rule (no automotive register, no warm amber atmosphere, no Direction C accents on dashboard). 12 owner-gated passes proposed (D1–D12). 6 open questions to answer before D1. Awaiting greenlight. |
| [`PLAN_VISUAL_MASTER_2026-05-03.md`](archive/2026-05-03-visual-handoffs/PLAN_VISUAL_MASTER_2026-05-03_archived_2026-05-04.md)                       | **ARCHIVED 2026-05-04** — visual master ledger from 2026-05-03 session. KI-062 RESOLVED; subsequent visual work (Pass G/H/I/J/K/L/M/N/O) supersedes this ledger. Kept for pass-history context.                                                                                                                                                                                                                                  |
| [`PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md`](archive/2026-05-03-visual-handoffs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03_archived_2026-05-04.md) | **ARCHIVED 2026-05-04** — surgical polish queue from 2026-05-03 session. P0 LAW palette drift fully RESOLVED across Pass H1.1/H1.6/H2 + KI-090; remaining queue items consumed by Pass H/I/J/K/L/M/N/O. Kept for pass-history context.                                                                                                                                                                                           |
| [`PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md`](archive/PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY_archived_2026-05-04.md)                                  | **ARCHIVED 2026-05-04** (Phase 1.5d, Cluster C). Substantively subsumed by [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md). Content preserved at archive path; KI-075 reference still valid (DEFERRED).                                                                                                                                                                                                                               |
| [`PLAN_CHAT_SYSTEM_IMESSAGE_IOS26.md`](PLAN_CHAT_SYSTEM_IMESSAGE_IOS26.md)                                                                          | DEFERRED future-pass scope — in-app chat system anchored to transaction surfaces (damage report / bid / claim / job_assignment), iOS 26 iMessage design language adapted to BidOnDent's locked Premium Gold + cool blue canon. Four trigger conditions must ALL fire before activation (soft launch shipped, KI-002 RESOLVED, owner authorization, ≥5–10 production transaction loops). Created 2026-05-04 per owner directive.  |

> **Landing-page plans archived 2026-05-03.** The original 16-pass landing redesign and the follow-up Liquid Map Intelligence / dark-mode parity / button-system passes all shipped. They live under `docs/archive/` for historical decision context. Current landing visual state lives in **[`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md)**.

**If any doc conflicts with LAW docs, LAW wins.** Flag the conflict and fix it.

---

## 30-Second Startup

Read in this order:

1. **[`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)** — what BidOnDent is, the 6 laws, what to protect.
2. **[`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md)** — the four-layer code model and file-size budgets.
3. **[`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md)** — what to do now, in what order.
4. **[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md)** — apex design canon (locked).
5. **[`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md)** — how the system actually works (includes AI reading order by task type).
6. **[`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md)** — what's broken or missing.
7. **[`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md)** — required browser automation navigation protocol for Playwright-like tools.
8. **[`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md)** — required when Mola pastes multi-AI transcripts, relay prompts, or live add-on directives.
9. **[`AI_LOCK.md`](../AI_LOCK.md)** — multi-AI session coordination (read before editing on a shared branch).
10. Then pick task-specific docs from the sections below.

---

## How This System Is Organized

### Active Control Docs (LAW + REF tier — see above)

These are the primary governing documents. Always start here.

### Design

- **[`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md)** — current visual system state. Read first for any design work.
- **[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md)** — long-form design philosophy and historical decisions. The "why behind the system."
- **[`PLAN_VISUAL_MASTER_2026-05-03.md`](archive/2026-05-03-visual-handoffs/PLAN_VISUAL_MASTER_2026-05-03_archived_2026-05-04.md)** — ARCHIVED 2026-05-04. Visual master ledger from 2026-05-03 session, superseded by Pass G/H/I/J/K/L/M/N/O.
- **[`PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03.md`](archive/2026-05-03-visual-handoffs/PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03_archived_2026-05-04.md)** — ARCHIVED 2026-05-04. Surgical polish queue from 2026-05-03 session; P0/P1/P2 items consumed by Pass H1/H1.6/H2 + KI-090 + Pass G/H/I.
- **[`HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03.md`](archive/2026-05-03-visual-handoffs/HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03_archived_2026-05-04.md)** — ARCHIVED 2026-05-04. Was the 2026-05-03 visual session master prompt; consumed across the 2026-05-04 / 2026-05-05 autopilot work. Kept for KI-067 (owner HOLD) historical reference.

### AI Collaboration / Handoffs

- **[`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md)** — canonical rules for Mola's multi-AI workflow. Read when a message includes pasted AI output, screenshots/logs from another tool, live owner add-ons, or instructions to plan-only vs go full autopilot.
- **[`REF_AI_BROWSER_NAVIGATION.md`](REF_AI_BROWSER_NAVIGATION.md)** — canonical rules for browser automation and route recovery.

### OPS (procedures, runbooks, audit logs — added as 4th tier 2026-05-04)

- **[`OPS_DEVELOPER_SETUP.md`](OPS_DEVELOPER_SETUP.md)** — local setup, first run, Google OAuth provider configuration. Supersedes `GETTING_STARTED.md` + `GOOGLE_OAUTH_SETUP.md` (both archived 2026-05-04 under `docs/archive/`).
- **[`OPS_PHASE_6_SMOKE_TEST.md`](OPS_PHASE_6_SMOKE_TEST.md)** — three-environment smoke test (Local Docker / Hosted Staging / Production). Renamed 2026-05-04 from `PHASE_6_SMOKE_TEST_CHECKLIST.md` for tier consistency.

### Setup & Operations (Supabase platform contract)

- **[`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md)** — backend, storage, and edge-function setup. **§16 Storage Pointer Pattern** + **§17 verify_jwt = false** are load-bearing.

### Optional References

- **[`ATTRIBUTIONS.md`](ATTRIBUTIONS.md)** — licenses and external asset attribution.

### AI Agent Skills (reusable across projects)

Project-specific patterns that future projects can reuse live under `~/.claude/skills/`. Reference them by name in commits and pass logs:

- `supabase-clerk-edge-function` — verify_jwt:false + requireClerkSession pattern (covers KI-059)
- `supabase-storage-signed-urls` — pointer-on-write, sign-on-read; backfill template (covers KI-058)
- `supabase-pro-cost-control` — per-project compute cost model (covers KI-061)
- `bd-design-identity` — calm/premium/map-first / blue-system rules (companion to `MOLANDJESUS_DESIGN_DECISIONS.md`)
- `mola-ai-relay-protocol` — directive extraction and safe multi-AI relay/autopilot handling for Mola's pasted transcripts and handoffs

### Archive

Everything under [`docs/archive/`](archive/) is historical reference, retained for traceability. Not active operating surface.

Most recent archive moves (2026-05-04):

- `AUDIT_FULL_AUTOPILOT_2026-05-05.md` → archive — Phase 0 audit baseline for the 2026-05-05 long-run autopilot session; findings consumed (KI-086-090 all RESOLVED across that pass). Captured at HEAD `23f4a2cd`; stale at this writing.
- `AUTOPILOT_2026-05-05_FUNCTIONALITY_SWEEP_REPORT.md` (parts 1-4) → archive — 4-part sustained functionality sweep report; all referenced commits + KIs (F-04 / F-16 / F-18 / F-24 / KI-095-103) shipped or marked owner-action per current REF_KNOWN_ISSUES.md.
- `HANDOFF_MASTER_PROMPT_2026-05-04_CODEBASE_CLEAN_AND_POLISH.md` → archive — was the inherited handoff into the 2026-05-04 codebase-cleanup-and-polish runway; consumed across the prior block + this relay supersedes it. Per relay discipline: handoff prompts no longer get persisted as docs (git log + relay context = durable record).
- `PASS_AUTOPILOT_2026-05-04_MASTER_PROMPT_AND_POLISH_REPORT.md` → archive — past pass report (range `e5937a27 → 34c96526`).
- `PASS_AUTOPILOT_2026-05-04_MASTER_PROMPT_FOLLOWUP_REPORT.md` → archive — past pass followup report.
- `PASS_AUTOPILOT_2026-05-03_MASTER_REPORT.md` → archive — Cloud master pass (Buckets 1-7) all KIs RESOLVED or owner-gated (KI-067 HOLD, KI-075 DEFERRED).
- `PASS_AUTOPILOT_2026-05-04_MOBILE_DARK_REPORT.md` → archive — mobile/dark visual pass; KI-076-080 all RESOLVED, KI-067/068/075 owner-gated.
- `PASS_AUTOPILOT_2026-05-05_LONGRUN_REPORT.md` → archive — long-run pass; KI-086-090 all RESOLVED, KI-067/075/089 owner-gated.
- `HANDOFF_CLOUD_MASTER_AUTOPILOT_2026-05-03.md` → archive — Cloud master autopilot handoff brief, superseded by 2026-05-04 work (now also archived).
- `AUDIT_VISUAL_MOBILE_DARK_LIGHT_2026-05-04.md` → archive — visual mobile audit; bucket findings all RESOLVED across Pass H/I/J/K/L/M/N/O.
- `AUDIT_FULL_2026-05-04_SONNET.md` → archive — F-01..F-24 audit findings; all RESOLVED or owner-gated (per Part 3 report scorecard).
- `PASS_H_2026-05-05_REPORT.md` → archive — KI-091/092 RESOLVED.
- `PASS_I_J_2026-05-05_REPORT.md` → archive — KI-091/092/093/094 RESOLVED.
- `SHOP_AUDIT_REPORT_2026-04-29.md` → archive — pre-Pass-A era; findings folded into KI ledger.
- 14 obsolete archived prompts + sprint reports DELETED (old AI prompts superseded by REF_AI_COLLABORATION_PROTOCOL.md + HANDOFF system; old GREEN_PATH/PASS_3X verification reports superseded by KI ledger). DUAL_AI_COORDINATION.md kept per LAW_HARDENING_PLAN.md L89.

Earlier archive moves (2026-05-03):

- `2026-05-03-visual-handoffs/` — superseded Sonnet audit prep/prompt/report, earlier Opus visual handoff docs, AND (added 2026-05-04) the full 2026-05-03 visual session trio: `PLAN_VISUAL_MASTER_2026-05-03_archived_2026-05-04.md`, `PLAN_DESIGN_POLISH_QUEUE_OPUS_2026-05-03_archived_2026-05-04.md`, `HANDOFF_VISUAL_MASTER_PROMPT_OPUS_4_7_2026-05-03_archived_2026-05-04.md`. All visual handoff prompts now consumed; current handoff is the active relay prompt context, not a doc.
- `PLAN_LANDING_REDESIGN.md` → archive — 16-pass landing redesign, STATUS COMPLETE 2026-05-02.
- `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md` → archive — Passes A–G shipped; Pass H verification completed through the archived Sonnet audit handoff in `archive/2026-05-03-visual-handoffs/`.
- `PLAN_LANDING_BUTTON_SYSTEM_ADOPTION.md` → archive — cross-app primary-CTA shell adoption, SHIPPED 2026-05-03.
- `PLAN_LANDING_DARK_MODE_PARITY.md` → archive — superseded twice, then absorbed into the gold-lamp landing pass shipped 2026-05-03.
- `landing_dark_audit_2026-05-03.md`, `landing_signature_audit_2026-05-03.md`, `landing_visual_audit_2026-05-03.md` → archive — pre-fix audit snapshots; issues addressed by subsequent hero polish + gold-lamp passes.

Earlier archive moves (2026-05-02):

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
- **Multi-AI transcript / handoff prompt:** add `REF_AI_COLLABORATION_PROTOCOL.md`.
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
