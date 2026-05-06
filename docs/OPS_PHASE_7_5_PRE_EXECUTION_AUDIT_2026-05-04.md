# Phase 7.5 Pre-Execution Audit 2026-05-04 (OPS)

**Authority level:** OPS — read-only audit of Phase 7.5 (dashboard atmosphere + interior animations) surfaces against [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) (as amended 2026-05-04, §5 motion/react envelope) before any code commits.

**Last updated:** 2026-05-04

**Status:** **COMPLETE.** Phase 7.5 dashboard-atmosphere + interior-animation surfaces are a mix of: (a) atmosphere infrastructure NOT shipped on the dashboard (mini-map idle drift, sidebar/header animation, dropdown entrance/exit are absent — aesthetic-addition territory), (b) interior card-stack + sheet animations already shipped via `motion/react` envelope (compliant with §5 amendment), and (c) **one P3 finding**: reduced-motion contract is honored on only 1 of 49 motion/react files. Remaining 48 files animate regardless of `prefers-reduced-motion` user preference. KI parking deferred to next reply per relay convention.

**Phase context:** Authorized as the second commit of the Phase 7 close sequence (relay 2026-05-04), running in the same auto session. Mirrors `OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md` + `OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md` + `OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md` shape and applies the standing rule formalized in [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) "v3.3 master-plan Phase 6 close (2026-05-04)" session entry: **every remaining v3.3 master-plan phase gets a read-only pre-execution audit before charter execution.**

**Pre-audit charter alignment:** This audit was originally halted pre-output when surface inventory revealed `motion@12.23.24` (the framer-motion rebrand from Nov 2024) installed and consumed by 49 files in `src/app/`, contradicting the prior §5 wording. Owner adjudicated as P2 LAW-vs-reality drift, picked Path B, and shipped commit `63ef6b6b` (`docs(canon):` LAW_ANIMATION_AND_ATMOSPHERE §5 amendment) before this audit could honestly proceed. This audit is now conducted against the amended §5: CSS-first default + `motion/react` permitted envelope (AnimatePresence enter/exit + whileTap/whileHover gestures + drag/swipe sheets) + extended reduced-motion contract requiring `useReducedMotion()` on motion/react surfaces.

**Companion docs:**

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon Phase 7.5 was scoped against (29 keyframes catalogued, prefers-reduced-motion contract extended 2026-05-04, atmosphere folder reservation, motion/react envelope, remaining-libs escape clause)
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED, structural; NOT touched by this audit)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 7.5 row updated this commit
- [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (landing, not dashboard); same method, similar shape
- [`OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister visual+functional audit; same method

**Method:** Static code audit (grep + Read) against the 49 motion/react files + the 5 Phase-7.5-scoped surface families (dropdowns, mini-map, Smart Map Tools hover, card-stack reveal, sidebar timing). Same method as Phases 5 / 6 / 6.5 / 7 audits. No runtime inspection. Working tree never modified.

---

## TL;DR

Phase 7.5 was scoped to deliver: **dropdown entrance/exit animations, mini-map idle drift, Smart Map Tools hover, card-stack reveal, sidebar timing** for dashboard surfaces. The audit finds:

| Item                      | Status                                                                                                                                                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dropdown entrance/exit    | **NOT SHIPPED on dashboard surfaces.** `NotificationCenter.tsx` + `ProfileDropdown.tsx` use only CSS `transition-colors` for hover; no entrance/exit animations. Aesthetic-addition territory (the dropdowns function correctly without).                                                                                          |
| Mini-map idle drift       | **NOT SHIPPED.** `MapLibreDashboardMapPreview.tsx` + `DashboardAtmosphere.tsx` have zero animation classes. Static gradient layers only. Aesthetic-addition territory.                                                                                                                                                             |
| Smart Map Tools hover     | **N/A on dashboard.** "Smart Map Tools" lives in `shop/MapPane*` files (shop directory, Phase 7 surface). Dashboard mini-maps don't expose tool overlays. No work owed here at the dashboard scope.                                                                                                                                |
| Card-stack reveal         | **SHIPPED via motion/react envelope.** `BidCardArticle` uses `motion.article` + `whileHover` (gesture canonical pattern) + `AnimatePresence` for expand/collapse (stateful enter/exit canonical pattern). Compliant with §5 amendment envelope.                                                                                    |
| Sidebar / header timing   | **CSS-only (compliant default).** `DashboardHeader` (dashboard subdir, 103 LOC) uses `transition-opacity` + `transition-colors` — composes from CSS-first default per §5. No motion/react use here. Compliant.                                                                                                                     |
| Reduced-motion compliance | **P3 FINDING.** 49 files import `motion/react`. 1 file (`ReportScreen.tsx`) honors reduced-motion via alt `matchMedia("prefers-reduced-motion")` path. 0 files use the canonical `useReducedMotion()` hook. **48 files animate regardless of user `prefers-reduced-motion` preference** — violates §5 amendment extended contract. |

Phase 7.5 revised commit total: **0 defensive commits warranted** at this scope. The mini-map idle drift + dropdown entrance/exit + sidebar timing items are aesthetic-addition territory analogous to KI-112 (gold-lamp-breathe). The reduced-motion P3 finding is a real coverage gap but should be parked as a post-audit KI per relay convention, not invented during this audit.

---

## 1. Phase 7.5 in-scope surface inventory

### 1.1 Dashboard atmosphere (~2 files, ~245 LOC)

| File                                                                                                                              | LOC | motion/react? | CSS keyframes used                     | Status                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------- | --- | ------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| [`src/app/components/app/DashboardAtmosphere.tsx`](../src/app/components/app/DashboardAtmosphere.tsx)                             | 184 | No            | None (static gradients + radials only) | Phase 7.5 scope item "mini-map idle drift" NOT shipped. Aesthetic-addition. |
| [`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx) | ~60 | No            | None                                   | Static map preview. No idle camera drift. Aesthetic-addition.               |

### 1.2 Dashboard dropdowns (~2 files, ~857 LOC)

| File                                                                                                            | LOC | motion/react? | Animation pattern                                                                                     | Status                                                                |
| --------------------------------------------------------------------------------------------------------------- | --- | ------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`src/app/components/dashboard/NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx) | 406 | No            | CSS `transition-colors` (3 sites) + 1 `animate-pulse` (Radio icon). No entrance/exit on the dropdown. | Phase 7.5 scope item "dropdown entrance/exit" NOT shipped. Aesthetic. |
| [`src/app/components/dashboard/ProfileDropdown.tsx`](../src/app/components/dashboard/ProfileDropdown.tsx)       | 451 | No            | CSS `transition-colors` (12 sites) + 1 `animate-pulse`. No entrance/exit on the dropdown.             | Phase 7.5 scope item "dropdown entrance/exit" NOT shipped. Aesthetic. |

### 1.3 Dashboard sidebar / header (~1 file, ~103 LOC)

| File                                                                                                      | LOC | motion/react? | Animation pattern                                              | Status                                                            |
| --------------------------------------------------------------------------------------------------------- | --- | ------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`src/app/components/dashboard/DashboardHeader.tsx`](../src/app/components/dashboard/DashboardHeader.tsx) | 103 | No            | CSS `transition-opacity` + `transition-colors` (2 sites total) | Compliant — composes from §5 CSS-first default. No defensive fix. |

(Note: a separate `src/app/components/app/DashboardHeader.tsx` exists at 538 LOC and is part of the `app/` shell, not the dashboard subtree. Out of Phase 7.5 scope.)

### 1.4 Dashboard mobile bottom nav (~1 file, 146 LOC)

| File                                                                                                      | LOC | motion/react? | Animation pattern                                                           | Status                                                                                                       |
| --------------------------------------------------------------------------------------------------------- | --- | ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`src/app/components/dashboard/MobileBottomNav.tsx`](../src/app/components/dashboard/MobileBottomNav.tsx) | 146 | Yes           | `motion.button` + `whileTap={{ scale: 0.92 }}` (gesture canonical envelope) | Compliant with §5 amendment envelope (gesture micro-interaction). **Reduced-motion guard NOT honored** (P3). |

### 1.5 Card-stack reveal — bid cards + sheets (~3 files, ~700 LOC)

| File                                                                                                                                            | motion/react pattern                                                                                                                        | Envelope?                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`src/app/components/codelayer/BidCardArticle.tsx`](../src/app/components/codelayer/BidCardArticle.tsx)                                         | `motion.article` + `whileHover={{ y: -3, scale: 1.003 }}` + `AnimatePresence` for height/opacity expand/collapse (initial / animate / exit) | YES — gesture (whileHover) + stateful enter/exit (AnimatePresence). Both envelope items. |
| [`src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx`](../src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx)             | `AnimatePresence` + `motion.div` overlay fade (initial / animate / exit) + `motion.div` sheet slide-from-bottom (y: "100%" → 0)             | YES — stateful enter/exit canonical pattern.                                             |
| [`src/app/components/codelayer/account/AccountMenu.tsx`](../src/app/components/codelayer/account/AccountMenu.tsx) (sample of `account/` family) | `motion.section` initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}                                                              | YES — stateful enter (sub-pattern of envelope).                                          |

### 1.6 Drag/swipe sheets

| File                                                                                                                | Pattern                            | Envelope?                                   |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------- |
| [`src/app/components/shop/ImmersiveMapResultsDrawer.tsx`](../src/app/components/shop/ImmersiveMapResultsDrawer.tsx) | drag / onDragEnd / dragConstraints | YES — drag/swipe sheets canonical envelope. |
| [`src/app/components/shop/ShopDetailSheet.tsx`](../src/app/components/shop/ShopDetailSheet.tsx)                     | drag / onDragEnd / dragConstraints | YES — drag/swipe sheets canonical envelope. |

---

## 2. Reduced-motion compliance verification (added Phase 7.5 scope item per relay)

Per relay: "verify motion/react reduced-motion contract honored across the 49 files. For each file importing from motion/react, check whether `useReducedMotion()` is consumed and whether the component short-circuits to static state when true."

### 2.1 Compliance buckets

| Bucket                                  | Count | Files                                                                                                                                                                                                                        |
| --------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Compliant (alt matchMedia path)**  |     1 | `codelayer/ReportScreen.tsx` — uses `window.matchMedia("(prefers-reduced-motion: reduce)").matches` to gate step transition.                                                                                                 |
| **B. Compliant (`useReducedMotion()`)** |     0 | (none)                                                                                                                                                                                                                       |
| **C. Compliant (`MotionConfig`)**       |     0 | (none — no global `MotionConfig reducedMotion="user"` wrapper anywhere in the tree)                                                                                                                                          |
| **D. Non-compliant**                    |    48 | All other 48 files import motion/react and use one or more of `whileTap` / `whileHover` / `animate=` / `initial=` / `exit=` / `AnimatePresence` / `drag` without any reduced-motion guard.                                   |
| **E. N/A (motion/react import unused)** |     0 | All 49 importers also use animation-style props (verified: grep "whileTap\|whileHover\|animate=\|initial=\|exit=\|AnimatePresence" across the 49 files matched all 49). No file imports motion/react for static layout only. |

**Compliance ratio:** 1 / 49 = **2.0%**.

### 2.2 Non-compliant file list (full enumeration of bucket D)

`admin/AdminDashboard.tsx`, `admin/AdminHeader.tsx`, `admin/AdminInfoPanel.tsx`, `admin/AdminIntakeOperationsPanel.tsx`, `admin/AdminManagementPanel.tsx`, `admin/LinkedTestAccounts.tsx`, `admin/NewAccountForm.tsx`, `admin/QuickActions.tsx`, `admin/SwitchBackPanel.tsx`, `auth/ClerkAccountTypeSelector.tsx`, `auth/LoginLoginView.tsx`, `auth/LoginMainView.tsx`, `auth/LoginModal.tsx`, `auth/LoginSignupView.tsx`, `codelayer/AcceptedBidConfirmationSheet.tsx`, `codelayer/AccountScreen.tsx`, `codelayer/BidCardArticle.tsx`, `codelayer/BidsEmptyState.tsx`, `codelayer/BidsGeographyMap.tsx`, `codelayer/BidsScreen.tsx`, `codelayer/BidsSummaryHeader.tsx`, `codelayer/account/AccountAdminOverlay.tsx`, `codelayer/account/AccountHeader.tsx`, `codelayer/account/AccountInfoCard.tsx`, `codelayer/account/AccountMenu.tsx`, `codelayer/report/StepComplete.tsx`, `dashboard/MobileBottomNav.tsx`, `demo/DemoAccountSwitcher.tsx`, `devtools/StorageDebugPanel.tsx`, `insurer/InsurerClaimsScreen.tsx`, `insurer/InsurerOnboarding.tsx`, `insurer/InsurerPartnerShopsScreen.tsx`, `reports/CompetitorAnalysisScreen.tsx`, `reports/MissingReportState.tsx`, `reports/ReportsListScreen.tsx`, `shop/ImmersiveMapResultsDrawer.tsx`, `shop/LikedShopsScreen.tsx`, `shop/PhotoGuide.tsx`, `shop/ShopActiveJobsScreen.tsx`, `shop/ShopDetailSheet.tsx`, `shop/ShopEstimateInboxScreen.tsx`, `shop/ShopOnboardingStep1.tsx`, `shop/ShopOnboardingStep2.tsx`, `shop/ShopOnboardingStep3.tsx`, `shop/ShopOnboardingStep4.tsx`, `shop/ShopRequestsScreen.tsx`, `routers/DashboardRouter.tsx`, `routers/DashboardSecondaryViews.tsx`.

### 2.3 Severity classification

**P3 — accessibility-canon coverage gap.**

- Not P0 (no production breakage; reduced-motion users still see content, just animated).
- Not P1 (no user-visible feature break).
- Not P2 (LAW-vs-reality drift was already resolved in commit `63ef6b6b`; this is now a code-vs-LAW conformance gap, which is the narrower P3 class).
- P3 because it violates the §5 amendment's extended reduced-motion contract for 48 files. The contract is mandatory ("MUST be honored"), so this is a real coverage gap, not a stylistic preference.

### 2.4 Mitigation classes (informational; not actioned in this audit)

Three viable fix paths exist for the 48 files. Listed for owner reference at the close commit:

1. **Single global `MotionConfig`** wrap at the app root with `reducedMotion="user"`. One-line change at `src/app/App.tsx` (or wherever the root mounts), causes motion/react to globally honor user preference. Lowest-risk, highest-coverage mitigation. Caveat: behavior change for all 49 files at once; needs runtime QA to verify each surface degrades gracefully.
2. **Per-file `useReducedMotion()` audit + short-circuit** — touch all 48 files individually, add `const reduce = useReducedMotion();` and gate animation props. High-touch, high-coverage, but slow; matches the §5 amendment language most literally.
3. **Hybrid** — global `MotionConfig` for the gesture envelope (whileTap/whileHover) and AnimatePresence + per-file useReducedMotion for the drag/swipe sheets (where `MotionConfig` may not fully suppress drag interaction). 2 + 1 = 3 fix commits.

---

## 3. Coverage already delivered by prior sweeps

| Phase 7.5 scope item       | Original delivery target                                | Already-shipped coverage                                                                                                                     | Status                                                               |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Card-stack reveal          | Bid cards expand/collapse + reveal-on-mount             | `BidCardArticle` (motion.article + whileHover + AnimatePresence height/opacity) — Phase 7 visual sweep                                       | **SHIPPED via §5 envelope.** Compliant.                              |
| Sheet enter/exit           | Bottom-sheet animations on bid acceptance + shop detail | `AcceptedBidConfirmationSheet` + `ShopDetailSheet` + `ImmersiveMapResultsDrawer` — drag-aware AnimatePresence                                | **SHIPPED via §5 envelope** (drag + enter/exit). Compliant.          |
| Sidebar / header timing    | Smooth header tab transitions, hover affordances        | `dashboard/DashboardHeader.tsx` CSS `transition-opacity` + `transition-colors`                                                               | **SHIPPED via §5 CSS-first default.** Compliant.                     |
| Mobile-bottom-nav gesture  | Tactile press feedback on tab buttons                   | `MobileBottomNav` `motion.button whileTap={{ scale: 0.92 }}`                                                                                 | **SHIPPED via §5 gesture envelope.** P3 reduced-motion gap (see §2). |
| Account menu + info reveal | Account submenus animate in                             | `account/AccountMenu` + `account/AccountInfoCard` + `account/AccountHeader` + `account/AccountAdminOverlay` (motion.section initial→animate) | **SHIPPED via §5 envelope.** P3 reduced-motion gap (see §2).         |

---

## 4. Genuine remaining lift opportunities

### 4.1 Aesthetic-addition territory (analogous to KI-112 gold-lamp-breathe)

These items were named in the Phase 7.5 charter but are not shipped. None are defensive fixes. All require owner taste decisions about whether the current static state is acceptable or whether motion would add value:

- **Mini-map idle drift** — `DashboardAtmosphere.tsx` is 100% static gradients + radials; `MapLibreDashboardMapPreview.tsx` has zero animation. The dashboard's blue atmosphere panel does not breathe or drift. Same family as KI-112 (gold-lamp-breathe is also a static-radial-where-keyframe-could-apply gap on landing). Candidate trigger: post-launch aesthetic pass OR Phase 8.5 ambient/idle motion work, whichever comes first.
- **Dropdown entrance/exit** — `NotificationCenter.tsx` and `ProfileDropdown.tsx` open instantly via plain conditional render; no fade/scale/slide. Motion/react envelope item §5 (stateful enter/exit) is available; CSS-first default could also express this with keyframes. Same KI-112 family.
- **Smart Map Tools hover** — N/A on dashboard surface (this is a shop/MapPane surface, Phase 7 territory; no work owed at the dashboard scope).

### 4.2 Defensive territory (P3 reduced-motion compliance)

The §2 finding is the only defensive lift identified. Treatment guidance:

- KI parking deferred to next reply per relay convention ("no KI invention without evidence; halt and report immediately if any surface shows P0/P1/P2"; this is P3, so no halt; KI gets parked at the close commit, not invented in the audit).
- Owner picks mitigation class (§2.4) at the close commit.
- Severity P3 means the work is real but does not block launch. Mitigation can be scheduled into a discrete commit during Phase 7.5 close OR deferred to Phase 8 / 8.5 / post-launch a11y pass.

---

## 5. Findings table (severity-ranked)

| ID  | Severity        | Surface                                                  | Finding                                                                                                                                                          | Recommendation                                                                                  |
| --- | --------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| F1  | **P3**          | All 48 non-compliant motion/react files (see §2.2)       | Reduced-motion contract not honored. 1/49 files compliant. §5 amendment requires `useReducedMotion()` (or equivalent) on all motion/react surfaces.              | Park as KI at close commit. Owner picks mitigation §2.4 (single MotionConfig vs per-file).      |
| F2  | **P7-TECHDEBT** | `DashboardAtmosphere.tsx`, `MapLibreDashboardMapPreview` | Mini-map idle drift NOT shipped. Static gradient layers only. Aesthetic-addition territory.                                                                      | Same KI-112 pattern — park at close commit if owner wants. Trigger: post-launch aesthetic pass. |
| F3  | **P7-TECHDEBT** | `NotificationCenter.tsx`, `ProfileDropdown.tsx`          | Dropdown entrance/exit NOT shipped. CSS `transition-colors` only. Aesthetic-addition territory.                                                                  | Same KI-112 pattern — park at close commit if owner wants. Trigger: post-launch aesthetic pass. |
| —   | **0 P0/P1/P2**  | —                                                        | No production breakage, no user-visible feature break, no LAW-vs-reality drift. (The original P2 LAW drift was resolved in commit `63ef6b6b` before this audit.) | —                                                                                               |

---

## 6. Phase 7.5 revised total estimate

| Original v3.3 estimate                                                     | Audit-revised estimate                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 7.5: dashboard atmosphere + interior animations — multi-commit scope | **0 defensive commits required.** Card-stack + sheets + sidebar already compliant. Aesthetic gaps (F2, F3) are KI-park territory. F1 (reduced-motion) is owner-decision-gated. |

Same outcome shape as Phases 6 / 6.5 / 7: pre-execution audit reveals prior sweeps already shipped the load-bearing work. **Pre-execution audit pattern is now 5-for-5** (Phases 4 / 6 / 6.5 / 7 / 7.5).

If owner picks F1 mitigation class 1 (single global MotionConfig): +1 commit for the App-root wrap, +1 commit for runtime QA write-up. If class 2 (per-file): +48 file touches, likely 4–6 commits. If class 3 (hybrid): +3 commits.

---

## 7. Recommended path

**Path B — close-only with deferred-aesthetic + deferred-a11y notes** (same shape as Phase 6.5 + Phase 7 closes).

Rationale:

1. The pre-execution audit pattern is now 5-for-5. Hardening-phase scope says "no new features"; the F2/F3 aesthetic gaps are additions, not fixes.
2. F1 (reduced-motion) is real but P3 (not launch-blocking). Mitigation class needs owner taste decision (global MotionConfig vs per-file) — that is exactly the kind of call that should be made at the close commit, not in the audit.
3. Path A (start charter execution) would consume the rest of this auto session on subjective aesthetic adds; that violates Launch Scope Guardrails.
4. Path C (re-scope as charter-write-up) is the wrong frame — the audit already inventoried the surfaces; no separate charter needed.

**Close commit (next reply) would:**

- Park F1 as a new KI (next free KI-### id; severity P3) cross-ref'd to the §5 amendment, with owner-picked mitigation class noted in the KI body.
- Park F2 as a KI extension or amendment to KI-112 (same family: aesthetic-keyframe-where-static-radial-shipped). Possibly: "KI-112 expanded to cover dashboard atmosphere + landing gold-lamp halos under the same trigger."
- Park F3 as a separate KI (dropdown entrance/exit on dashboard). Severity P7-TECHDEBT.
- Update PLAN_DOC_INDEX_BY_PHASE Phase 7.5 row → status CLOSED with Path B annotation; OPS_DASHBOARD_ATMOSPHERE_LOG.md → NOT WRITTEN (audit + KIs are durable record).
- Append session-log entry to LAW_HARDENING_PLAN.md.

---

## 8. Open scope questions for owner (close-commit decisions)

1. **F1 (reduced-motion compliance) mitigation class** — global MotionConfig vs per-file useReducedMotion vs hybrid? See §2.4.
2. **F1 timing** — fix during Phase 7.5 close (1–6 commits depending on class) OR defer to Phase 8 / 8.5 / post-launch a11y pass?
3. **F2 (mini-map idle drift) parking** — extend KI-112 to cover dashboard atmosphere too, OR new KI entry?
4. **F3 (dropdown entrance/exit) parking** — confirm P7-TECHDEBT severity and trigger ("post-launch aesthetic pass").

---

## What this audit does NOT do

- **No code edits.** Working tree is clean.
- **No KI invention.** Findings F1/F2/F3 are surfaced for owner adjudication at the close commit, not parked here, per relay convention "Aesthetic-only gaps follow the KI-112 pattern: noted in audit, parked in REF_KNOWN_ISSUES.md only at the close commit, not invented during the audit itself."
- **No PLAN_PHASE_7_5\* writes.** No scope contract was opened; this audit substitutes.
- **No MOLANDJESUS touch.** Structural lock holds.
- **No charter amendment.** The §5 amendment shipped in commit `63ef6b6b` (the prerequisite for this audit) is not extended here.
- **No runtime QA.** Static audit only. Runtime verification of the 48 reduced-motion files (DevTools → Rendering → Emulate prefers-reduced-motion: reduce) is owner / close-commit territory.

---

## Cross-references

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon (§5 amended 2026-05-04 in commit `63ef6b6b`)
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — v3.3 master-plan session log; Phase 7.5 audit-blocked entry added in commit `63ef6b6b`
- [`OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audit; same method
- [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (landing); F2 close-pattern parallel (KI-112)
- [`OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audit; same method
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 7.5 row updated this commit
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED; not touched by this audit)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108/109/110/111/112 (extended 2026-05-05 to subsume F2 + F3) and KI-113 (created 2026-05-05 for F1 reduced-motion compliance gap)

---

## Close Footer (added 2026-05-05)

**Status:** **PHASE 7.5 CLOSED 2026-05-05 via Path Y** (docs-only close per X+ bounded-sweep safety valve trip). Single `docs(close):` commit with no code changes. F1 reclassified P3 → KI-113 with full bucket-A 32-file scope contract. F2 + F3 folded into KI-112 extension (atmosphere/idle motion gap family). `MotionConfig` wrap deferred to future phase that closes the reduced-motion sweep.

### Audit-stat correction

The original audit (above, §2.1) reported **"1/49 compliant"** based on [`ReportScreen.tsx:200`](../src/app/components/codelayer/ReportScreen.tsx#L200) using `window.matchMedia("(prefers-reduced-motion: reduce)")`. The bounded sweep revealed that gate applies to **`scrollIntoView` behavior** (smooth vs auto), NOT to the `motion.div` step transition at [`ReportScreen.tsx:290`](../src/app/components/codelayer/ReportScreen.tsx#L290). The step transition uses explicit `transition={{ duration: 0.22 }}` and is ungated.

**Corrected compliance ratio on motion/react component-level transition behavior: 0/49 = 0.0%.**

The matchMedia adaptation in ReportScreen is correct for its `scrollIntoView` purpose and remains; it does not constitute reduced-motion compliance for the file's `motion.div`.

### Sonnet runtime verification (2026-05-05, owner-supervised)

Verification was executed by Sonnet (browser-automated) under owner supervision after this audit shipped. Sonnet applied a candidate `<MotionConfig reducedMotion="user">` wrap to `src/main.tsx`, ran the §3 verification protocol (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`), sampled three surfaces, and reverted the wrap before reporting. Verbatim verdict:

| Surface                     | Component         | Transition type         | Under reduce                   | Recovery |
| --------------------------- | ----------------- | ----------------------- | ------------------------------ | -------- |
| S1 — BidCard hover          | `BidCardArticle`  | `duration: 0.2` (tween) | **FAIL** — animates over 200ms | PASS     |
| S2 — MobileBottomNav tap    | `MobileBottomNav` | `type: "spring"`        | **PASS** — instant snap        | PASS     |
| S3 — Route transition (sub) | `DashboardRouter` | `duration: 0.2` (tween) | **FAIL** (inferred)            | N/A      |

> `MotionConfig reducedMotion="user"` in motion/react v11 makes **spring** animations instant (no explicit duration → MotionConfig can override). It does **NOT** override animations with explicit `transition={{ duration: N }}` props — the component-level transition takes precedence over the `MotionConfig` context value.

This finding **falsified the Class 1 single-line-fix assumption** that drove the original Phase 7.5 close relay. F1 cannot be closed by a `MotionConfig` wrap alone — the wrap covers spring/whileTap surfaces (bucket C, 4 files) but explicit-duration tweens require per-component `useReducedMotion()`.

### Builder bounded sweep (X+ Step 2A, 2026-05-05)

After the Class 1 falsification, the relay split into Path X / X+ / Y / Z and the builder ran a read-only classification sweep across all 49 motion/react files. Sweep classifier: `transition={{ duration: ... }}` lines without an adjacent `type: "spring"` are explicit-duration tweens (definite fail under reduce). Bucket counts:

| Bucket                                                                | Count  | Behavior under emulated `prefers-reduced-motion: reduce`                            |
| --------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| A — explicit-duration tween in `transition` prop                      | **32** | Definite FAIL — animate over their declared duration                                |
| B — mixed (explicit-duration overlay + spring sheet)                  | **2**  | Partial FAIL — overlay/duration animates, spring snaps                              |
| C — pure spring (already covered by `MotionConfig`)                   | **4**  | PASS via `MotionConfig` wrap (verified Surface 2)                                   |
| D — delay-only override (no duration; relies on motion/react default) | **7**  | UNCERTAIN — depends on default-transition resolution per prop type; no runtime test |
| E — no transition prop at all (relies on motion/react default)        | **4**  | UNCERTAIN — same as D                                                               |
| **Total**                                                             | **49** | —                                                                                   |

Definite-fail set: 32 (bucket A) + 2 (bucket B) = **34 files**. Including uncertain (D + E): up to **45 files**.

Full file-level scope (bucket A 32 files, bucket B 2 files, buckets C/D/E enumerated) is parked in [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) under **KI-113** as the durable scope contract for the future fix phase.

### Scope-valve outcome (X+ → Y collapse)

The advisor's bounded-sweep rule:

- ≤ 8 files: fix all in this commit (Path X+)
- 9–14 files: judgment call
- **≥ 15 files: stop, retreat to Path Y** (docs-only close; full sweep deferred)

Bucket A alone returned **32 files** — well past the 15-file safety valve. Including bucket B brings the definite-fail count to 34. Even the strictest read trips the valve. Bounded-X+ collapses to **Path Y**.

**Phase 7.5 closes docs-only.** No `MotionConfig` wrap shipped this commit (intentionally deferred to avoid mixed messaging — partial fix adjacent to "32 files broken" acknowledgment would read poorly in `git log`). No `fix(a11y):` headline this commit. Full reduced-motion sweep + `MotionConfig` wrap = future-phase scope (per `LAW_HARDENING_PLAN.md` Phase 7.5 close session entry).

### What ships in the close commit

- This audit close footer (Sonnet verdict + sweep + valve trip + stat correction).
- KI-112 extended to subsume F2 (dashboard atmosphere mini-map idle drift) + F3 (dashboard dropdown enter/exit) under the "static where atmosphere/canon supports motion" family.
- KI-113 created (P3, 32-file bucket A scope + 2-file bucket B + 11-file bucket D+E "audit needed" note).
- `PLAN_DOC_INDEX_BY_PHASE.md` Phase 7.5 row → CLOSED with Path Y annotation, scope-valve note, KI-113 link.
- `LAW_HARDENING_PLAN.md` Phase 7.5 close session entry (verification chain: audit → Sonnet runtime → builder sweep → docs-only close).

### What does NOT ship in the close commit

- `<MotionConfig reducedMotion="user">` wrap in `src/main.tsx` (deferred — covers only bucket C; partial fix would mix messaging).
- Per-file `useReducedMotion()` edits (deferred — 34-file mechanical sweep is its own phase).
- No `fix(a11y):` commit (deferred to future phase that closes KI-113).
- No `PLAN_PHASE_7_5*` writes (audit + close footer + KI-113 are the durable record).
- MOLANDJESUS not touched (structural lock holds).
- LAW_ANIMATION_AND_ATMOSPHERE §5 not amended further (the 2026-05-04 amendment in commit `63ef6b6b` stands as-is).
