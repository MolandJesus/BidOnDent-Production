---
title: PLAN — Landing Dark-Mode Parity (Liquid Map Intelligence Pass G)
status: SUPERSEDED by audit — see Outcome notes
last_updated: 2026-05-03
parent: docs/PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md
audit: docs/landing_dark_audit_2026-05-03.md
authority: PLAN tier (under LAW_PROJECT_RULES + LAW_HARDENING_PLAN)
owner: MolandJesus
---

> **Update 2026-05-03:** the audit walk (pre-work item #1) found landing dark mode is already at parity with the dashboard's gold-lamp identity via D5/D7/Pass B-C-D-E work. Original Pass G1 surfaces token-swap scope is **no-op**. The only remaining material gap is landing CTAs hand-rolling button styles instead of consuming the D10 system — but that's a refactor, not a token-swap, and is its own future initiative. Sections below are kept for historical context only.

# PLAN — Landing Dark-Mode Parity

> Decision #5 lock from `PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md` — Pass G is **plan-only** this round. No implementation, no token additions, no component edits. This doc exists so a future authorized pass can pick up cold.

## Why this plan exists

The dashboard dark mode (Passes D6–D10) reached a calm/premium register: navy ground lit by warm gold lamp light, rounded button system, micro-depth refinement, gold-lit shell continuity. The landing dark mode was last walked thoroughly in Passes 8–11 — before the dashboard's gold-lamp identity was established and before the D10 rounded button system shipped.

The result: today the landing dark mode is internally coherent (Passes 8–11 made sure of that) but it does **not** carry the same identity as the dashboard dark mode. A user navigating Landing → Dashboard in dark mode currently sees two related-but-distinct premium aesthetics. The goal of this pass, when authorized, is to close that gap **without flattening landing's marketing-anchor character into dashboard calm**.

## What "parity" means here (and what it does NOT mean)

**Parity does mean:**
- Same gold-lamp atmosphere identity (warm rim trims at 0.10–0.22 alpha, not infill).
- Same rounded button system (D10's rounded-2xl on `bd-dashboard-primary-button` + the warm-trim hover/active states).
- Same secondary-button visual hierarchy (calmer than primary, same active sink).
- Same focus-ring family (blue product ring + warm outer wash on keyboard focus).

**Parity does NOT mean:**
- Landing dark = a copy of dashboard dark. Marketing surfaces breathe more, have larger atmosphere pools, and use Direction B amber-lit-garage register on warm sections (TrustStats, Benefits) per the Pass 11 lock. The dashboard does not.
- Stripping landing's signature motion. The Liquid Map Intelligence layer (Passes B–E) already carries identity — it should pick up dark-mode parity, not be replaced.
- Reverting to the cold-navy-only register that Direction A flirted with. The owner explicitly approved Direction B (warm-amber dark register on TrustStats + Benefits) per `feedback_external_audit_handling.md`.

## Required pre-work before Pass G is authorized

These must happen **before** any code lands. They are diagnostic, not prescriptive.

### 1. Fresh dark-mode walk (mandatory)

Walk every landing surface in dark mode at 1440px and 375px. For each, capture in a sibling audit doc (`docs/landing_dark_audit_<date>.md`):

- Surface name + file path
- Current dark-mode register (cool navy / warm Direction B amber)
- Whether the gold-lamp trim is present, partial, or absent
- Whether the rounded button system from D10 is fully picked up
- Whether the Liquid Map Intelligence motion (Pass B–E) renders correctly in dark
- Subjective note: does it feel native to the dashboard family, sibling to it, or distinct from it?

The walk is a prerequisite. Don't skip it — Passes 8–11 walked dark mode before D6–D10 existed, so we have stale information.

### 2. Token inventory diff

Compare the tokens currently consumed in landing dark surfaces vs the tokens consumed in the dashboard's gold-lit shell. The diff list is the parity-gap list.

Likely candidates (to be confirmed by the walk, not assumed):

| Surface | Likely gap |
|---|---|
| `bd-glass-card--landing` dark variant | Already has gold rim from D5 — verify alpha range matches D7/D8 dashboard cards |
| `bd-glass-card--landing-warm` dark variant | Direction B amber-lit; verify warm rim alpha matches dashboard's 0.20–0.26 |
| `HowItWorksSection` step cards in dark | Last touched Pass 9 — likely cool blue without gold-lamp warmth |
| `WhoWeServeSection` role cards in dark | Pass E added role-rim glow; works in both modes — verify alpha balance feels native to dashboard |
| `OperatingRegionsSection` map shell in dark | Cool navy + WebGL — verify the new gold-flow ambient layer reads correctly behind the canvas |
| Hero right-side scene in dark | Pass C built it light + dark aware via `--bd-liquid-gold-dark/-soft/-edge`; verify the bid card chips feel native to dark dashboard panels |
| All landing CTAs (`bd-dashboard-primary-button` consumers in landing) | D10 was system-level so should be picked up — verify in walk |

### 3. Hero scene dedicated dark variant decision

Open question for the owner before this pass starts:

> Should the hero right-side "Liquid Map Intelligence" scene have a **dedicated dark composition** (e.g., the map contour layer reads differently against dark navy than against light) — or should it inherit the same composition with token-swapped colors?

Default recommendation: token-swap, no dedicated composition. The motion/structure carries the identity; the colors carry the mode. Adds maintenance burden if we fork the composition. Owner can override.

## Likely Pass G phases (when authorized)

Each phase is its own merge per the autopilot pass-discipline rule. Don't bundle.

- **G1 — Surfaces.** Token consumption fixes only. No motion changes, no new utilities. Targets: any dark surface flagged in the walk for missing gold-lamp trim or wrong alpha range. Mostly a `theme.css` pass with consumption verification in the components.
- **G2 — Motion.** Dark-mode-only token tuning of the Pass B Liquid Map Intelligence layer if the walk shows the gold flow / route shimmer / pin pulse don't read at parity with the dashboard's gold-lit atmosphere. Most of this should already work via the existing `--bd-liquid-gold-dark` variant — only retune if the walk shows it.
- **G3 — Verification.** Same Pass H verification matrix as the parent plan. Add: side-by-side screenshots of Landing dark + Dashboard dark to confirm sibling identity.

## Risks (read before authorizing)

- **Passes 8–11 atmosphere is heavy.** The amber pools and gold rim layers in Pass 11 + Direction B were tuned before D6–D8 changed dashboard. Stacking new gold-lamp identity on top of them risks pushing warm dominance over cool-action identity. Mitigation: token swap, don't add new layers.
- **Direction B is owner-locked** (per `feedback_external_audit_handling.md`). Any external audit suggesting "strip the amber" is rejected. Pass G honors that lock.
- **Dark mode hasn't been heavily walked.** The walk in pre-work item #1 is mandatory. Skipping it risks shipping parity changes that break a surface no one tested.
- **D10 button system is global.** Any Pass G consumption fix must NOT introduce per-component button overrides — that defeats D10's system-level discipline.

## What this plan deliberately does NOT do

- **Implement anything.** Plan-only, locked behind Decision #5.
- **Promise dates.** This pass runs after the parent Liquid Map Intelligence pass merges and after the owner walks dark mode personally.
- **Rebuild Direction B.** Owner-locked.
- **Touch the dashboard.** This is landing parity to the dashboard, not the reverse.

## Kickoff prompt for the new chat (when authorized)

```
You are picking up Pass G of the Liquid Map Intelligence landing pass.
Read in this order:

  1. docs/LAW_PROJECT_RULES.md
  2. docs/LAW_HARDENING_PLAN.md
  3. docs/PLAN_LANDING_LIQUID_MAP_INTELLIGENCE.md  ← parent plan
  4. docs/PLAN_LANDING_DARK_MODE_PARITY.md          ← this plan
  5. docs/MOLANDJESUS_DESIGN_DECISIONS.md
  6. The most recent dark-mode audit doc at docs/landing_dark_audit_<date>.md
     (if none exists, the audit walk is your first task — do it before
     touching code).

Decision #5 has been flipped to "implement" by the owner.
Execute G1, then G2, then G3 — each as its own merge.
Do not bundle. Do not auto-approve external audits suggesting amber removal.
```

## Outcome notes

_Empty until authorized + executed._
