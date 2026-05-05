# Phase 4 — Mobile Sweep Scope (PLAN)

**Authority level:** PLAN — execution scope for Phase 4 of the v3.3 master plan.

**Last updated:** 2026-05-04

**Status:** Active. Phase 4 fix commits execute against this scope. Phase 4 close updates [`OPS_MOBILE_AUDIT_2026-05-04.md`](OPS_MOBILE_AUDIT_2026-05-04.md) and may flag a conditional [`LAW_MOBILE_VIEWPORT_DOCTRINE.md`](LAW_MOBILE_VIEWPORT_DOCTRINE.md) candidate per [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md).

**Companion docs:**

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — code organization charter (this sweep targets L2 screens)
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — palette canon + glass canon + Light-Mode Surface Rule (untouched by this sweep)
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon (not touched; structural lock in force)
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination state

---

## 1. Viewport targets

Phase 4 audits and fixes for the following viewport widths:

| Width     | Device class                   | Notes                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------- |
| **375px** | iPhone SE / iPhone 13 mini     | Tightest baseline. If it works at 375, it works at 390 / 414. |
| **390px** | iPhone 14 / 15 standard        | Most common production viewport.                              |
| **414px** | iPhone Pro Max / large Android | Loosest baseline within scope.                                |

**Method:** Static code audit + Chrome DevTools emulation. **No real-device QA in scope.** No Playwright run-through unless a specific bug requires it. The audit is grep-and-read on touch targets, viewport overflow, modal traps, safe-area insets, gesture conflicts.

**Out of scope:** Tablet (≥768px) and desktop. Existing desktop layout is untouched.

## 2. Touch-target floor

**44×44 logical pixels minimum** for any element with a click/tap handler. Per the existing LAW (Tailwind `h-10 w-10` = 40×40 was the prior canonical "compact" floor on desktop; mobile gets the iOS HIG 44×44 floor).

**Audit mode only.** No redesign. No visual change beyond enlarging hit areas to comply.

## 3. In-scope screens

Phase 4 sweeps the following screen clusters. Cluster-by-cluster execution (one commit per cluster, each owner-interruptible at the seam):

| Cluster                               | Screens / surfaces                                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Landing**                       | Hero, How It Works, Why Choose, Who We Serve, Coverage Map block, Shop/Insurer Signup, Ready to Get Started, Footer, mobile menu (hamburger + sheet) |
| **B — Customer Dashboard**            | HomeScreen, BidsScreen, AccountScreen, Profile dropdown trigger, Notifications dropdown trigger, BottomNav                                           |
| **C — Customer New Report flow**      | Step1 Vehicle, Step2 Damage Type, Step3 Photos, Step4 Service Location, Step5 Review/Submit                                                          |
| **D — Shop Dashboard + Bid flow**     | Shop HomeScreen, Shop bid intake, Active jobs list                                                                                                   |
| **E — Insurer Dashboard + New Claim** | Insurer HomeScreen, ClaimsScreen, NewClaimScreen, NewClaimForm, partner shops directory                                                              |

**Out of scope:**

- Map command center (`MapLibreReportLayer`, `MapLibreServiceCoverageMap`, planner / navigation / command-center subtrees) — Phase 5/6/7/8 territory
- Settings, Auth screens, Admin screens
- Any `MOLANDJESUS`-canon design changes
- The 21 owner-judgment palette sites (per existing LAW)
- HeroSection.tsx structural refactor (KI-107 P3, owner-named only)

## 4. Allowed fixes

The sweep may make the following changes:

- **Touch-target enlargement** — `h-7/h-8/h-9 → h-10` (or larger via `min-h-[44px]`) for buttons/icon-buttons with click handlers
- **No-horizontal-scroll fixes** — replace `min-w-…` with `max-w-…` or `overflow-x-auto` containers where appropriate
- **Bottom-sheet over modal** — where a centered modal traps content above the keyboard or overflows the viewport on mobile, swap to a bottom-sheet pattern (`max-md:fixed max-md:bottom-0`)
- **Safe-area inset respect** — add `env(safe-area-inset-bottom)` / `env(safe-area-inset-top)` where currently missing on bottom nav, headers, fixed footers
- **Modal close button accessibility** — ensure close buttons meet 44×44 floor

## 5. Forbidden changes (hard stops)

The sweep MUST NOT make the following changes — hitting any of these halts the sweep and asks owner:

- **No restyling.** Color, glass, gradient, shadow values stay exactly as-is. Visual identity is untouched.
- **No animation additions.** Phase 4.5 territory.
- **No palette / font changes.** Even when a touch-target fix could "incidentally" introduce a new color.
- **No copy edits.** Text content stays exactly as-is.
- **No deletions of components, screens, or working features.**
- **No Phase 5+ map surface touches.** If a screen has both a non-map surface (in scope) and a map surface (out of scope), the fix targets the non-map surface only.
- **No MOLANDJESUS edits.** Structural lock in force; controlled-edit clause does not apply to this phase.
- **No file >600 LOC creations.** Existing grandfathered files (HeroSection.tsx 1,110, etc.) stay grandfathered — touch-target fixes inside them are allowed but no extraction.

## 6. Output cadence

| Step        | Output                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Audit       | [`docs/OPS_MOBILE_AUDIT_2026-05-04.md`](OPS_MOBILE_AUDIT_2026-05-04.md) — findings doc, populated upfront and updated per cluster as fixes ship. ≤300 lines. |
| Fix commits | One commit per cluster (5 clusters → ~5 commits). Each commit references the audit doc section it addresses + lists the specific files touched.              |
| Final       | [`OPS_MOBILE_AUDIT_2026-05-04.md`](OPS_MOBILE_AUDIT_2026-05-04.md) marked complete; LAW promotion flag if warranted.                                         |

**Each cluster commit's discipline:**

- One coherent change set. No bundled "while I'm here" fixes.
- Build clean, prettier clean before commit.
- Commit message names the cluster + lists touched files.
- AI_LOCK.md updates ride along (claim during the cluster, release at the end).

## 7. Conditional LAW promotion

If the audit reveals a **systemic pattern** (e.g. "every dashboard uses `h-9 w-9` for icon-buttons across 20+ instances") worth elevating from "audit observation" to "LAW canon," the audit doc flags that pattern and **the candidate `LAW_MOBILE_VIEWPORT_DOCTRINE.md` write is gated on owner explicit go**. Phase 4 does NOT auto-write LAW.

**LAW write trigger:** owner reads the audit summary, says "promote pattern X to LAW." Then the LAW doc lands as a separate `docs(canon):` commit.

## 8. Re-authorization gate

After Phase 4 ships clean (all clusters + audit close), parallel-AI work becomes eligible per [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md). Phase 4.5 (animation pillar) requires separate explicit owner authorization — Phase 4 success does NOT auto-advance into Phase 4.5.

---

## Pre-sweep context

This phase runs against the codebase state at commit `de9c5c38` (foundation block complete). Recent prior work that informs the sweep:

- `865dedf4` — NavigationSavedPlacesPanel pinned-place delete button h-9 w-9 → h-10 w-10 (the canonical pattern this sweep generalizes)
- `e3839083` — NavigationDeviationPrompt off-route dismiss button h-7 w-7 → h-10 w-10 (same pattern)
- `8d151083` — MapSurfaceControls 6 buttons h-8 → h-10 (same pattern)

These set the precedent: `h-9 w-9` and below = audit candidate; `h-10 w-10` (40×40) is the established compact floor; mobile may need to push some to 44×44 via `min-h-[44px] min-w-[44px]` where ergonomics demand it.

---

## Cross-references

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — Phase 4 targets L2 screens; budgets apply
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 4 doc tree pre-declared
- [`OPS_MOBILE_AUDIT_2026-05-04.md`](OPS_MOBILE_AUDIT_2026-05-04.md) — findings doc (created during audit step)
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI coordination during sweep
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-107 (HeroSection grandfathered, not in scope)
