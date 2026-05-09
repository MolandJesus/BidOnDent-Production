---
status: CANONICAL
authority: LAW
scope: layered-architecture
canonical_source_of_truth: LAW_LAYERED_ARCHITECTURE.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: critical
ai_summary: Four-layer model (L1 design / L2 interface / L3 orchestration / L4 backend); file-size budgets; forbidden flows.
last_updated: 2026-05-09
---

# BidOnDent — Layered Architecture (LAW)

**Authority level:** LAW — governs all new and migrated code organization. Cannot be violated without explicit per-session override from the project owner.

**Last updated:** 2026-05-04

**Status:** ACTIVE — charter for the v3.3 master plan (Phases 1.5 through 8.5). Existing files are grandfathered; new files must comply.

---

## Why this exists

The codebase grew organically. Some files do too many jobs (mix data fetching, business rules, JSX, formatting). Without a layer contract, every refactor or scope expansion risks importing JSX into services or fetch calls into screens.

This charter establishes four layers with explicit responsibilities and forbidden cross-layer flows. It also enables coherent multi-AI work — each AI can be scoped to a layer without colliding.

---

## The Four Layers

```
┌─────────────────────────────────────────────────────────┐
│  L1 — DESIGN LAYER (visual primitives)                  │
│  src/styles/                                            │
│  src/app/theme/        ← tokens, palettes, motion       │
│  src/app/components/ui/  ← bd-* primitives, glass       │
│  src/app/components/atmosphere/  ← reserved, empty,     │
│         atmosphere/animation primitives (Phase 4.5+)    │
│                                                         │
│  Allowed: visual primitives, design tokens, motion      │
│           primitives, glass utilities, ui components    │
│           that don't know about routes or domain        │
│  Forbidden: data fetching, domain logic, routing,       │
│             knowing which screen consumed them          │
├─────────────────────────────────────────────────────────┤
│  L2 — INTERFACE LAYER (screens + composed UI)           │
│  src/app/components/{landing,dashboard,maps,shop,       │
│                      insurer,codelayer,reports,admin}/  │
│  src/app/pages/                                         │
│                                                         │
│  Allowed: render JSX, handle local interaction,         │
│           call L3 hooks/features, compose L1 ui         │
│           primitives                                    │
│  Forbidden: direct fetch, direct Supabase calls,        │
│             business rules, persistence decisions,      │
│             field-shape translation                     │
├─────────────────────────────────────────────────────────┤
│  L3 — ORCHESTRATION LAYER                               │
│  src/app/features/   ← multi-screen state machines,     │
│                        feature-level workflows          │
│  src/app/hooks/      ← single-screen lifecycle,         │
│                        single-feature local state       │
│                                                         │
│  Allowed: compose L4 services, manage state, format     │
│           data for L2, side-effect orchestration        │
│  Forbidden: rendering JSX, importing Tailwind classes,  │
│             knowing about visual identity               │
├─────────────────────────────────────────────────────────┤
│  L4 — BACKEND LAYER (data + domain)                     │
│  src/app/services/   ← Supabase clients, edge function  │
│                        wrappers, domain types,          │
│                        Clerk integration                │
│  supabase/functions/ ← Deno edge functions (server)     │
│  supabase/migrations/← schema source of truth           │
│                                                         │
│  Allowed: I/O, domain types, schema mappers, auth,      │
│           storage hydration, edge function logic        │
│  Forbidden: JSX, Tailwind, route knowledge, screen      │
│             names, design tokens                        │
└─────────────────────────────────────────────────────────┘
```

### Cross-cutting (no layer assignment)

These directories sit outside the four-layer model because they are pure data or pure transforms:

| Path                                         | Role                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/app/utils/`                             | Pure transforms. No I/O. No JSX. No state.                                                                   |
| `src/app/constants/`                         | Static config — copy strings, URLs, magic numbers.                                                           |
| `src/app/types/`                             | Shared TypeScript types used by 2+ layers.                                                                   |
| `src/app/config/`                            | Env-driven config, provider setup.                                                                           |
| `src/app/routers/`                           | Route trees only. Thin.                                                                                      |
| `src/app/services/intelligence/` data tables | Often misclassified as L4; pure data belongs in `constants/` or `utils/`. Phase 1.5+ reclassifies on demand. |

---

## File-Size Budgets

Soft budgets are warnings during code review. Hard limits trigger required extraction (or a documented exception in the commit message). Existing files exceeding these budgets are **grandfathered** — only new files (post-2026-05-04) must comply at creation time.

| Layer                      | Soft | Hard | Exception protocol                                                 |
| -------------------------- | ---- | ---- | ------------------------------------------------------------------ |
| **L1** (design primitives) | 200  | 400  | Hard limit firm — primitives should not grow past 400.             |
| **L2** (screens)           | 400  | 600  | Above 600 requires owner-acknowledged exception in commit message. |
| **L3** (orchestration)     | 300  | 500  | Above 500 → split into multiple feature/hook files.                |
| **L4** (services)          | 300  | 500  | Above 500 → split by domain or extract pure logic to `utils/`.     |

**Anti-cascade rule:** discovering a grandfathered file exceeds its budget is **not** an obligation to refactor it. Refactoring requires owner naming or a phase that explicitly targets that file. Document the violation as a P3 entry in `REF_KNOWN_ISSUES.md` and move on.

**Known existing exceptions (grandfathered, P3-tier):**

- `src/app/components/landing/HeroSection.tsx` — 1,110 lines (L2). Tracked as KI-107.
- `src/app/components/landing/OperatingRegionsSection.tsx` — 556 lines (L2).
- `src/app/components/dashboard/DashboardHeader.tsx` — 538 lines (L2).
- `src/app/App.tsx` — 528 lines (L2).
- `src/app/hooks/useOperatingRegionsCoverage.ts` — 512 lines (L3).

Other 400–500 range files are below hard limits — soft watch only.

---

## Forbidden Cross-Layer Flows

| From → To | Forbidden?   | Reason                                             |
| --------- | ------------ | -------------------------------------------------- |
| L1 → L2   | ✅ Forbidden | Primitives don't know which screens use them       |
| L1 → L3   | ✅ Forbidden | Primitives don't know about state                  |
| L1 → L4   | ✅ Forbidden | Primitives don't fetch                             |
| L2 → L1   | Allowed      | Screens compose primitives                         |
| L2 → L3   | Allowed      | Screens call hooks/features                        |
| L2 → L4   | ✅ Forbidden | Screens never bypass orchestration                 |
| L3 → L1   | ✅ Forbidden | Hooks don't render                                 |
| L3 → L2   | ✅ Forbidden | Hooks don't know which screens consume them        |
| L3 → L4   | Allowed      | Hooks call services                                |
| L4 → L1   | ✅ Forbidden | Services don't know about visuals                  |
| L4 → L2   | ✅ Forbidden | Services don't know about screens                  |
| L4 → L3   | ✅ Forbidden | Services are leaves; orchestration depends on them |

**Practical translation:**

- A screen never imports from `services/` directly — it imports a hook from `hooks/` or a feature from `features/`, which imports from `services/`.
- A hook never imports from `components/` (no JSX upstream dependency).
- A service never imports from `components/` or `hooks/`.

When migrating an existing file that violates one of these flows, the migration is its own commit, not a side-effect of feature work.

---

## Folder-to-Layer Mapping (current state)

| Folder                           | Primary layer | Notes                                                                                                                                                                         |
| -------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/`                    | L1            | theme.css, design tokens                                                                                                                                                      |
| `src/app/theme/`                 | L1            | runtime theme objects                                                                                                                                                         |
| `src/app/components/ui/`         | L1            | bd-\* primitives, glass utilities                                                                                                                                             |
| `src/app/components/atmosphere/` | L1            | reserved, empty until Phase 4.5 charter approves contents                                                                                                                     |
| `src/app/components/landing/`    | L2            | landing screens + sections                                                                                                                                                    |
| `src/app/components/dashboard/`  | L2            | dashboard screens                                                                                                                                                             |
| `src/app/components/maps/`       | L2            | map composed UI (NOT MapLibre adapter — that's L4)                                                                                                                            |
| `src/app/components/shop/`       | L2            | shop screens (consider sub-folder split when Phase 7 hits — see PLAN_DOC_INDEX_BY_PHASE)                                                                                      |
| `src/app/components/insurer/`    | L2            | insurer screens                                                                                                                                                               |
| `src/app/components/codelayer/`  | L2            | **legacy holding pen** — explicitly NOT a permanent home. Files in this folder should migrate to a domain-named L2 folder when their owner phase touches them.                |
| `src/app/components/reports/`    | L2            | report wizard screens                                                                                                                                                         |
| `src/app/components/admin/`      | L2            | admin screens                                                                                                                                                                 |
| `src/app/pages/`                 | L2            | top-level page shells                                                                                                                                                         |
| `src/app/features/`              | L3            | multi-screen feature modules (currently under-used)                                                                                                                           |
| `src/app/hooks/`                 | L3            | single-screen lifecycle + state hooks. Currently 68 flat files. Sub-grouping (e.g. `hooks/navigation/`, `hooks/realtime/`, `hooks/forms/`) is a P3 reminder, not active work. |
| `src/app/services/`              | L4            | edge function wrappers, domain types, Supabase + Clerk clients                                                                                                                |
| `supabase/functions/`            | L4            | Deno edge functions — `supabase-clerk-edge-function` skill applies                                                                                                            |
| `supabase/migrations/`           | L4            | schema source of truth                                                                                                                                                        |

### Codelayer is a holding tank, not a layer

`src/app/components/codelayer/` (45 files, 9,215 LOC) is a legacy bucket from earlier phases. It does not represent a real architectural layer — it is **L2 awaiting domain reclassification**. When a phase targets a file currently in codelayer, the migration to its proper L2 home (e.g. `dashboard/`, `shop/`, `insurer/`) is part of that phase's work. No mass migration is required.

---

## Migration Policy

| Scenario                                                            | Action                                                                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Net-new file                                                        | Must comply with budgets and cross-layer flow rules at creation.                                                                        |
| Editing existing file under budget                                  | No migration required.                                                                                                                  |
| Editing existing file in 80–100% of soft budget range               | No migration required, but consider whether the edit pushes it over.                                                                    |
| Editing existing file over hard budget                              | Edit allowed if scope is contained; do not opportunistically refactor. Add P3 reminder to `REF_KNOWN_ISSUES.md` if not already tracked. |
| Phase explicitly targets the file                                   | Refactor scope is part of that phase's plan. Owner-gated.                                                                               |
| Layer violation discovered (e.g. screen importing service directly) | Document it. Fix only when an owner-named phase touches that area, or as its own one-bug-one-commit fix when caught.                    |

---

## Doc Tier Integration (LAW > REF > PLAN > OPS)

This charter formalizes the existing tier model with one addition:

- **LAW** — permanent behavioral rules and execution authority (this doc, `LAW_PROJECT_RULES.md`, `LAW_HARDENING_PLAN.md`, future `LAW_ANIMATION_AND_ATMOSPHERE.md`)
- **REF** — current truth (`REF_SYSTEM_STATE.md`, `REF_KNOWN_ISSUES.md`, `REF_VISUAL_SYSTEM.md`, etc.)
- **PLAN** — future direction (`PLAN_MAP_MASTER.md`, `PLAN_POST_LAUNCH_ROADMAP.md`, etc.)
- **OPS** — operational checklists, runbooks, audit logs, smoke tests (new tier — formalized in `LAW_PROJECT_RULES.md` simultaneously with this charter)

OPS-tier docs describe procedures and one-off operations; they do not establish behavioral rules (LAW) or describe ongoing system state (REF). Phase audit logs (`OPS_MOBILE_AUDIT_*`, `OPS_MAP_ARCHITECTURE_DIAGNOSE_*`, etc.) live here.

### Apex design canon: `MOLANDJESUS_DESIGN_DECISIONS.md`

[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) is treated as **effectively LAW-tier despite the filename**. It is the locked apex design authority for BidOnDent. Per owner directive 2026-05-04: do not merge, split, restructure, rename, archive, or edit it. Cross-refs always point INTO it; nothing is extracted from it. When other design canon (animation charter, atmosphere law, etc.) is generated, it cross-refs MOLANDJESUS as the authority — never as a target for consolidation.

This rule is also recorded in agent memory (`feedback_molandjesus_locked.md`) so multi-agent sessions cannot accidentally propose touching it.

---

## Multi-AI Coordination

Multiple AIs may work on this branch (Opus, Sonnet, Codex, ChatGPT, etc.). Coordination is enforced via [`AI_LOCK.md`](../AI_LOCK.md) at the repo root.

**Rules:**

1. Every AI session reads `AI_LOCK.md` before any file edit.
2. If `Active AI` is set and not the current AI, the current AI **does not edit** any file in `Locked files`.
3. Lock state changes ride along with the work commit they describe — no standalone "claim lock" or "release lock" commits.
4. On standdown, the AI clears `Active AI`, `Active layer`, and `Locked files` in its final commit.
5. If `git status` shows changes the AI did not make, the AI **stops** and asks the owner.

**Layer assignment for parallel work** (only after Phase 3 lock dry run + Phase 4 mobile sweep prove sequential discipline holds at scale):

- One AI per layer per session — never two AIs in L2 simultaneously.
- Charter changes (this doc, `LAW_*` tier) are Opus-only.
- High-risk L4 work (`supabase/functions/`, auth/storage invariants) is Opus-only.
- L1/L2 polish work is open to either AI.
- Doc archive/consolidation sweeps are open to either AI.

---

## Atmosphere/Animation Reservation

The folder `src/app/components/atmosphere/` is **reserved by this charter** as the future home for L1 atmosphere/animation primitives. It will not contain code until [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) ships in Phase 4.5 and approves the patterns that may live there.

Reserving the folder here prevents ambiguity: no agent should create an alternative location (e.g. `src/app/components/effects/`, `src/atmosphere/`) when the canon location already exists.

---

## Cross-References

- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — the 6 Laws, palette canon, storage + auth invariants
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — current execution authority
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED, do not edit)
- [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — how the system actually works right now
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — known bugs / gaps / structural issues (KI-107 logs HeroSection)
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination state
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) (Phase 1.5e) — doc tree pre-declared for v3.3 phases

---

## Co-Update Rules (additions to LAW_PROJECT_RULES § Co-Update Rules)

| Trigger                               | Must update                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| New top-level folder under `src/app/` | This doc — folder-to-layer mapping table                         |
| New layer-violating import detected   | This doc — forbidden flows table; add KI entry if structural     |
| File crosses hard budget              | `REF_KNOWN_ISSUES.md` (P3 entry) — refactor only on owner naming |
| Net-new doc generated by a phase      | `PLAN_DOC_INDEX_BY_PHASE.md`                                     |
| New AI joins multi-AI coordination    | `AI_LOCK.md` schema may need updating                            |

---

**This is a charter, not a TODO list.** It does not authorize any refactor by itself. Refactors happen inside owner-named phases that target specific files; this doc tells those phases where the targets belong.
