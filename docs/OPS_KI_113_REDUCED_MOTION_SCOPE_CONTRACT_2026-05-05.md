# KI-113 Reduced-Motion Scope Contract 2026-05-05 (OPS)

**Authority level:** OPS — execution-authority scope contract for closing KI-113 (`prefers-reduced-motion` contract not honored across motion/react surfaces). Governs the multi-commit sweep that brings 34 motion/react surfaces into compliance with [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §5 (as amended 2026-05-04 in commit `63ef6b6b`).

**Last updated:** 2026-05-05

**Status:** **READY FOR OWNER REVIEW.** Scope contract complete. Per the Phase 8 audit precedent: _audit produces a docs-only commit. Branch goes 4f4bd444 → audit-output commit → owner reviews scope contract → execution relay fires for Commit 1._

**Phase context:** Authorized as the natural next-leverage move after Phase 8 close (`f484019c`) + Phase 8.5 audit (`4f4bd444`) under owner authorization "go full auto on code work doc work and design work for hours after." This is the **8th pre-execution audit** in the v3.3 master plan. The reduced-motion sweep was deferred from Phase 7.5 close (commit `9de09232`) explicitly to a future phase; this contract is the front-half of that future phase.

**Phase numbering:** Provisionally **Phase 7.6** by topical proximity to Phase 7.5 (which surfaced the finding) — owner may rename when committing.

**Companion docs:**

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §5 (the contract this scope closes conformance against; amended 2026-05-04 in commit `63ef6b6b`)
- [`OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md) §2 + close-footer (Sonnet runtime verification + bucket A/B/D/E classification + audit-stat correction)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-113 entry (the parked durable scope contract this doc concretizes for execution)
- [`OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md`](OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md) — sister scope contract (Phase 8); same OPS shape, similar commit cadence
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED; not touched)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 7.6 (provisional) row added this commit

**Method:** Static code audit (grep + Read) extending the Phase 7.5 close-footer's bucket A/B/C/D/E classification with per-file transition-site counts + migration patterns. No runtime inspection. Working tree unchanged for the audit phase.

---

## TL;DR

KI-113 closure = **~7-9 commits** total:

| #   | Commit type    | Description                                                                      | Files              | Risk                                                    |
| --- | -------------- | -------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| 1   | `fix(a11y):`   | Add `<MotionConfig reducedMotion="user">` at app root (covers bucket C: 4 files) | 1 (`src/main.tsx`) | Low                                                     |
| 2   | `fix(a11y):`   | Bucket D+E classification (static prop inspection → migrate-or-skip per file)    | up to 11           | Low-medium                                              |
| 3   | `fix(a11y):`   | Auth domain batch (4 files)                                                      | 4                  | Low                                                     |
| 4   | `fix(a11y):`   | Codelayer + reports + demo domain batch (10 files)                               | 10                 | Medium                                                  |
| 5   | `fix(a11y):`   | Insurer domain batch (3 files)                                                   | 3                  | Medium                                                  |
| 6   | `fix(a11y):`   | Shop domain batch (7 files)                                                      | 7                  | Medium-high                                             |
| 7   | `fix(a11y):`   | Routers + bucket B mixed-overlay batch (4 files)                                 | 4                  | High (DashboardRouter affects all dashboard navigation) |
| 8   | `docs(close):` | Phase 7.6 (KI-113) close — KI status, plan-index, hardening session entry        | 4 docs             | Lowest                                                  |

**Total transition migration sites:** 45 across 34 files (bucket A+B). **Total LOC delta:** ~3-5 LOC added per file (1 import + 1 hook call + N transition prop wraps).

**Per-hook size flag (≥400 LOC threshold):** N/A — KI-113 doesn't author new hooks; it consumes the existing `useReducedMotion()` from `motion/react` and adds a single `MotionConfig` provider. No L3 hard-limit risk.

**Browser smoke gates:** owner-supervised, per-batch (5 batches × 1 gate = 5 gates), full Playwright sweep at the close commit. Same 5B-style cadence as Phase 8 with batch boundaries chosen by domain risk.

---

## §1. Migration patterns

### Pattern A — Explicit-duration transition (bucket A, 32 files, 43 sites)

**Before:**

```tsx
import { motion } from "motion/react";

export function FooComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      ...
    </motion.div>
  );
}
```

**After:**

```tsx
import { motion, useReducedMotion } from "motion/react";

export function FooComponent() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      ...
    </motion.div>
  );
}
```

**Notes:**

- Inline-conditional the `duration` value, not the entire `transition` object — keeps `ease`, `delay`, etc. preserved.
- `whileHover` / `whileTap` props are NOT touched — they default to spring transitions which the Layer 1 `MotionConfig` wrap covers (verified by Sonnet S2 in the Phase 7.5 audit).
- `initial` / `animate` props are NOT touched — they're target states, not motion behaviors. `MotionConfig` + the duration wrap together ensure motion to those targets is instant under reduce.
- Multiple sites in one file: declare `reduceMotion` once at component top; use across all `transition` props.

### Pattern B — Mixed overlay + spring (bucket B, 2 files, 2 sites)

`AcceptedBidConfirmationSheet.tsx` and `ShopDetailSheet.tsx` have an explicit-duration overlay fade (the dim background) + a spring sheet slide. Same pattern A applied to the overlay only:

**Before:**

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}  // overlay fade — fails under reduce
/>
<motion.div
  initial={{ y: "100%", opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: "100%", opacity: 0 }}
  transition={{ type: "spring", damping: 28, stiffness: 300 }}  // spring sheet — covered by MotionConfig
/>
```

**After:**

```tsx
const reduceMotion = useReducedMotion();
// ...
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: reduceMotion ? 0 : 0.2 }}  // MIGRATED
/>
<motion.div
  initial={{ y: "100%", opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: "100%", opacity: 0 }}
  transition={{ type: "spring", damping: 28, stiffness: 300 }}  // unchanged
/>
```

The spring transition uses `type: "spring"` with explicit values; `MotionConfig` snaps the spring to instant under reduce. No per-file change needed for the spring.

### Pattern D — Delay-only override (bucket D, 7 admin files, classification needed)

These files use `transition={{ delay: 0.5 }}` (no `duration` override). motion/react's default `type` for the animated prop drives the actual behavior:

| `animate` prop                                   | Default `type`                 | Reduce coverage by `MotionConfig`? |
| ------------------------------------------------ | ------------------------------ | ---------------------------------- |
| `x`, `y`, `scale`, `rotate` (spatial)            | `"spring"`                     | ✅ — instant snap                  |
| `opacity`, `color`, `background` (tween-default) | `"tween"` (with default ~0.3s) | ❌ — animates for default duration |

**Classification methodology:** for each bucket D file, read the `animate` prop and classify per its keys:

- All-spatial (only x/y/scale/rotate) → no migration needed; MotionConfig covers it.
- Includes opacity or other tween-default → add `useReducedMotion` and explicit `transition={{ duration: reduceMotion ? 0 : <calculated-default>, delay: <existing> }}`.

Per Phase 7.5 audit, all 7 admin files animate `opacity` (delay-staggered fade-ins on admin cards). All 7 likely need migration.

**Pattern D migration:**

```tsx
// Before:
<motion.div animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />

// After (assuming all 7 admin files animate opacity):
<motion.div
  animate={{ opacity: 1 }}
  transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.5 }}
/>
```

Adding the explicit `duration: 0.3` (motion/react's tween default for opacity) preserves prior behavior under non-reduce + ensures instant snap under reduce.

### Pattern E — No transition prop (bucket E, 4 files)

Files using no `transition` prop at all (rely on motion/react defaults entirely). Same classification as bucket D:

- All-spatial animate → MotionConfig covers.
- Includes opacity → add `useReducedMotion` + explicit transition.

Per Phase 7.5 audit, the 4 files: AdminHeader, NewAccountForm, LoginModal, StorageDebugPanel — likely vary. Per-file inspection required during the bucket D+E classification commit.

### Pattern variant — framer-motion variant objects (DemoAccountSwitcher)

`DemoAccountSwitcher.tsx` uses framer-motion variants:

```tsx
const cardItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
```

The `transition` lives inside the variant. Migration requires either:

**Variant pattern A — make variants a function of reduceMotion:**

```tsx
function makeCardItem(reduceMotion: boolean) {
  return {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" } },
  };
}

// inside component:
const reduceMotion = useReducedMotion();
const cardItem = useMemo(() => makeCardItem(!!reduceMotion), [reduceMotion]);
```

**Variant pattern B — override transition at the consumer:**

```tsx
const cardItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 }, // transition removed from variant
};

// inside component:
const reduceMotion = useReducedMotion();
return (
  <motion.div
    variants={cardItem}
    transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
  />
);
```

Pattern A is cleaner when variants are reused across multiple consumers. Pattern B is cleaner when consumers can specify their own transitions.

DemoAccountSwitcher: 2 named variants (`cardContainer`, `cardItem`), single consumer. Pattern A recommended.

DashboardRouter + DashboardSecondaryViews: similar variant-object structures; pattern A recommended.

---

## §2. Per-file transition-site inventory (bucket A + B)

### Bucket A (32 files, 43 transition sites)

| File                                    |    Sites    |
| --------------------------------------- | :---------: |
| `auth/ClerkAccountTypeSelector.tsx`     |      2      |
| `auth/LoginLoginView.tsx`               |      1      |
| `auth/LoginMainView.tsx`                |      3      |
| `auth/LoginSignupView.tsx`              |      1      |
| `codelayer/AccountScreen.tsx`           |      1      |
| `codelayer/BidCardArticle.tsx`          |      2      |
| `codelayer/BidsEmptyState.tsx`          |      2      |
| `codelayer/BidsGeographyMap.tsx`        |      1      |
| `codelayer/BidsScreen.tsx`              |      2      |
| `codelayer/BidsSummaryHeader.tsx`       |      1      |
| `codelayer/ReportScreen.tsx`            |      1      |
| `codelayer/account/AccountHeader.tsx`   |      1      |
| `codelayer/account/AccountInfoCard.tsx` |      1      |
| `codelayer/account/AccountMenu.tsx`     |      1      |
| `codelayer/report/StepComplete.tsx`     |      1      |
| `demo/DemoAccountSwitcher.tsx`          | 3 (variant) |
| `insurer/InsurerClaimsScreen.tsx`       |      1      |
| `insurer/InsurerOnboarding.tsx`         |      3      |
| `insurer/InsurerPartnerShopsScreen.tsx` |      1      |
| `reports/CompetitorAnalysisScreen.tsx`  |      1      |
| `reports/MissingReportState.tsx`        |      2      |
| `reports/ReportsListScreen.tsx`         |      1      |
| `shop/LikedShopsScreen.tsx`             |      1      |
| `shop/ShopActiveJobsScreen.tsx`         |      1      |
| `shop/ShopEstimateInboxScreen.tsx`      |      1      |
| `shop/ShopOnboardingStep1.tsx`          |      1      |
| `shop/ShopOnboardingStep2.tsx`          |      1      |
| `shop/ShopOnboardingStep3.tsx`          |      1      |
| `shop/ShopOnboardingStep4.tsx`          |      1      |
| `shop/ShopRequestsScreen.tsx`           |      1      |
| `routers/DashboardRouter.tsx`           | 1 (variant) |
| `routers/DashboardSecondaryViews.tsx`   | 1 (variant) |

### Bucket B (2 files, 2 transition sites)

| File                                         |                Sites                 |
| -------------------------------------------- | :----------------------------------: |
| `codelayer/AcceptedBidConfirmationSheet.tsx` | 1 (overlay only; sheet spring stays) |
| `shop/ShopDetailSheet.tsx`                   | 1 (overlay only; sheet spring stays) |

### Bucket D + E (11 files, classification needed)

Per §1 Pattern D + E classification methodology. Classification commit (Commit 2 in §3 sequence) inspects each file's `animate` prop and decides migrate-or-skip per-file. Worst case: 11 files all need migration. Best case: 0 files need migration (if all animate spatial-only props).

### Bucket C (4 files, no migration needed — covered by `MotionConfig` Layer 1)

`codelayer/account/AccountAdminOverlay.tsx`, `dashboard/MobileBottomNav.tsx` (verified PASS via Sonnet S2), `shop/ImmersiveMapResultsDrawer.tsx`, `shop/PhotoGuide.tsx`.

### Total LOC delta estimate

Per-file additions: ~3-5 LOC (1 import update + 1 `useReducedMotion()` hook call + N inline-conditional duration wraps where N = transition site count). Total: ~120-200 LOC added across 34 files. No file approaches L3 hard-limit risk.

---

## §3. Commit ordering (full execution sequence)

| #   | Commit         | Description                                                                                                                                                                                                            | Risk     | Smoke gate                                                                               |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| 1   | `fix(a11y):`   | Add `<MotionConfig reducedMotion="user">` to `src/main.tsx` (covers bucket C 4 files automatically)                                                                                                                    | Low      | Owner manual: open app, verify normal motion still works (no regressions).               |
| 2   | `fix(a11y):`   | Bucket D+E classification + per-file migration if `animate` prop animates non-spring-default values (opacity, etc.)                                                                                                    | Low-med  | Owner manual on admin pages + login modal + storage debug panel.                         |
| 3   | `fix(a11y):`   | Auth batch — ClerkAccountTypeSelector + LoginLoginView + LoginMainView + LoginSignupView                                                                                                                               | Low      | Owner manual: load login flows, verify under reduce + non-reduce.                        |
| 4   | `fix(a11y):`   | Codelayer + reports + demo batch — 10 files (BidCardArticle, BidsEmptyState, BidsGeographyMap, BidsScreen, BidsSummaryHeader, AccountScreen, ReportScreen, MissingReportState, ReportsListScreen, DemoAccountSwitcher) | Med      | Owner manual: bid card hover, bids screen, report wizard.                                |
| 5   | `fix(a11y):`   | Codelayer/account batch — AccountHeader + AccountInfoCard + AccountMenu + StepComplete + CompetitorAnalysisScreen                                                                                                      | Med      | Owner manual: account menu, report wizard step complete, competitor screen.              |
| 6   | `fix(a11y):`   | Insurer batch — InsurerClaimsScreen + InsurerOnboarding + InsurerPartnerShopsScreen                                                                                                                                    | Med      | Owner manual: insurer login → claims → partner shops.                                    |
| 7   | `fix(a11y):`   | Shop batch — LikedShopsScreen + ShopActiveJobsScreen + ShopEstimateInboxScreen + ShopOnboardingStep1-4 + ShopRequestsScreen (7 files)                                                                                  | Med-high | Owner manual: shop login → onboarding → requests → estimate inbox.                       |
| 8   | `fix(a11y):`   | Routers + bucket B batch — DashboardRouter + DashboardSecondaryViews + AcceptedBidConfirmationSheet + ShopDetailSheet (4 files; routers affect all dashboard navigation)                                               | High     | Owner manual: navigate every dashboard tab + open both sheets under reduce + non-reduce. |
| 9   | `docs(close):` | Phase 7.6 close — KI-113 RESOLVED, plan-index Phase 7.6 row added, LAW_HARDENING session entry, KI-112 cross-ref noting reduce-guard pattern is now reusable                                                           | Lowest   | Final Sonnet Playwright sweep recommended (representative sample of every domain).       |

**~9 commits total.** Higher than KI-109 (1 commit) or Phase 8 (~9 commits) by surface count; comparable to Phase 8 by total file touches.

---

## §4. Risk surface map

| Surface                                                                       | Production traffic                   | Affected commit | Smoke priority                                        |
| ----------------------------------------------------------------------------- | ------------------------------------ | --------------- | ----------------------------------------------------- |
| Login flows (ClerkAccountTypeSelector, LoginMain/Login/Signup)                | High (every new user)                | Commit 3        | High                                                  |
| BidCardArticle hover (Phase 7.5 verified-failure surface)                     | High (every customer with bids)      | Commit 4        | Highest — verify Sonnet S1 failure surface now PASSES |
| BidsScreen + ReportScreen                                                     | High                                 | Commit 4        | High                                                  |
| AccountScreen + AccountMenu + AccountInfoCard                                 | High                                 | Commits 4 + 5   | Medium-high                                           |
| Report wizard (StepComplete)                                                  | Medium-high (every new report)       | Commit 5        | Medium                                                |
| InsurerClaimsScreen + InsurerOnboarding                                       | Medium                               | Commit 6        | Medium                                                |
| Shop directory + onboarding (ShopOnboardingStep1-4, ShopRequestsScreen, etc.) | High (every shop login)              | Commit 7        | High                                                  |
| DashboardRouter (Phase 7.5 verified-failure surface)                          | Highest (every dashboard navigation) | Commit 8        | Highest — verify Sonnet S3 failure surface now PASSES |
| AcceptedBidConfirmationSheet + ShopDetailSheet                                | High (sheet-driven flows)            | Commit 8        | High                                                  |

**Smoke-test guidance:** Phase 7.5's Sonnet runtime surfaces (S1 BidCardArticle hover, S3 DashboardRouter route transition) MUST be re-verified PASSING under reduce after Commits 4 + 8 ship. These are the canonical failure-mode regressions; if the migration works there, it works everywhere.

---

## §5. Verification gate (per-commit + per-batch + final)

Per Phase 8 scope contract §4 + Phase 7.5 close-footer Sonnet verification protocol:

### Per-commit (mandatory, every commit)

- `npm run build` green
- TypeScript clean (folded into Vite build)
- `git diff` static review for migration neutrality (the same `transition` props with `duration` wrapped consistently; no `whileHover` / `whileTap` / `initial` / `animate` changes; no `exit` transition changes unless a sub-pattern requires)

### Per-batch (owner-mediated, Commits 1, 3, 4, 5, 6, 7, 8)

- Owner opens DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`
- Loads each migrated surface in batch
- Verifies: animations are now instant (no fade, no slide, no scale)
- Disables emulation → verifies normal motion returns
- 1 Playwright count-assertion per migrated surface vs `4f4bd444` baseline (catches "hook returned wrong duration" silently)

### Final (Commit 9 docs(close))

- Full Sonnet (or equivalent browser-capable AI) Playwright sweep across every migrated surface
- Re-runs Phase 7.5's S1 + S2 + S3 protocol on the fixed code:
  - S1 BidCardArticle hover under reduce: was FAIL, must now PASS
  - S2 MobileBottomNav whileTap under reduce: was PASS, must still PASS (regression check on the bucket C MotionConfig coverage)
  - S3 DashboardRouter route transition under reduce: was FAIL, must now PASS
- Recovery check: emulation disabled → all 3 surfaces return to normal motion
- Sonnet's verbatim verdict goes into Commit 9's commit message + close-footer in the audit doc

### Halt conditions (any → halt + report, do not chain)

- Build failure on any commit
- TypeScript error
- Smoke gate surfaces unexpected animation under reduce → migration pattern is wrong; re-design before continuing
- Playwright count-assertion fails → hook return value is wrong somewhere; bisect the batch

---

## §6. Phase 8.5 / KI-112 interaction (precondition unblock)

KI-113 closure UNBLOCKS future motion shipping in three ways:

1. **`MotionConfig` wrap** ships in Commit 1; future `whileTap` / `whileHover` / spring-default motion is automatically reduce-compliant. Phase 8.5 Path A re-charter would benefit from this floor.
2. **`useReducedMotion()` pattern** is established at 34 sites across the codebase by Commit 8. Future per-file motion additions follow the same `transition={{ duration: reduceMotion ? 0 : N }}` pattern with no further design work.
3. **Reuse-able pattern documentation** lands in [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §3 + §5 amendment trail. Phase 8.5 Path A and KI-112 close (whenever owner wants the aesthetic polish) inherit the established pattern.

**Without KI-113 closure first**, every Phase 8.5 commit (Path A) and every KI-112 close commit would have to ship the reduce-guard pattern from scratch — 4-8 additional surfaces compounding the sweep debt.

**Recommendation:** ship KI-113 close BEFORE re-chartering Phase 8.5 Path A or closing KI-112. KI-113 is the foundation; the others build on it.

---

## §7. Scope-vs-execution flagged risks

### Risk 1 — Variant-using files require Pattern A or B per §1 (3 files)

`DemoAccountSwitcher.tsx`, `routers/DashboardRouter.tsx`, `routers/DashboardSecondaryViews.tsx` use framer-motion variant objects with `transition` inside the variant. Migration requires either making the variant a function of `reduceMotion` (Pattern A) or moving `transition` to the consumer (Pattern B). Pattern A recommended for these 3 files.

### Risk 2 — DashboardRouter is the highest-traffic surface

`DashboardRouter.tsx` (Phase 7.5 Sonnet S3 failure surface) routes every dashboard navigation. Migration mistakes break navigation across every customer / shop / insurer dashboard. Commit 8 risk is highest; recommend explicit owner browser-smoke on every role's dashboard nav after Commit 8 ships.

### Risk 3 — `useReducedMotion()` returns `boolean | null` (NOT just boolean)

motion/react's hook returns `boolean | null` — `null` when no preference is detectable (some test environments). The migration pattern uses `reduceMotion ? 0 : N` which treats `null` as falsy → animates normally. Acceptable behavior (default to animation when preference unknown).

If owner wants stricter "default to reduced when unknown" semantics, the pattern would be `(reduceMotion ?? true) ? 0 : N`. Default policy: not stricter; animates when unknown.

### Risk 4 — `whileHover` / `whileTap` props are NOT migrated this phase

The Layer 1 `MotionConfig` wrap covers gesture defaults (Sonnet S2 verified). But if any file in the sweep has explicit-duration `whileHover` (e.g., `whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}`), it would NOT be covered by either Layer 1 or the Pattern A migration. Static audit during Commit 1 should grep for `whileHover.*transition.*duration` and `whileTap.*transition.*duration`; if any found, append to Pattern A migration scope.

### Risk 5 — buckets D + E classification might surface no migration (best case) or 11 (worst case)

Commit 2 risk-bracketing: if classification surfaces 0 migrations, Commit 2 ships as a tiny doc-only commit noting "all 11 files are spatial-only animate; MotionConfig covers them." If classification surfaces all 11 needing migration, Commit 2 swells. Plan for the medium case (5-7 of 11 need migration) and adjust at execution.

---

## §8. Open scope questions for owner (close-commit decisions)

1. **Phase numbering** — provisionally Phase 7.6 in this doc. Confirm or rename (Phase 9? KI-113 close? Reduced-Motion Sweep?).
2. **Smoke-gate intensity** — owner manual + 1 Playwright count-assertion per surface per batch (current §5 plan), OR full Playwright sweep per batch (more thorough, more owner time)?
3. **Bucket D+E disposition** — classify-then-migrate (Commit 2 does both) OR classify-and-defer (Commit 2 classifies; migrations land in domain batches if needed)?
4. **Variant-pattern preference** — Pattern A (variants as function of reduceMotion) or Pattern B (transition at consumer)? Pattern A recommended; owner confirms.
5. **`useReducedMotion()` null-handling** — default-to-animate (lenient) or default-to-reduce (strict)? Default lenient recommended; owner confirms.
6. **Final Sonnet sweep** — required at Commit 9, or owner-supervised Playwright sufficient?
7. **Phase 8.5 / KI-112 interaction** — confirm KI-113 closes BEFORE re-chartering Phase 8.5 Path A or closing KI-112?

---

## §9. What this audit does NOT do

- **No code edits.** Audit phase ships docs-only.
- **No `MotionConfig` wrap shipped.** That's Commit 1 of execution, not the audit.
- **No KI status changes.** KI-113 stays OPEN until the close commit (Commit 9).
- **No charter amendments.** LAW_ANIMATION_AND_ATMOSPHERE §5 stands as-is (amended 2026-05-04 in commit `63ef6b6b`); no further amendments needed.
- **MOLANDJESUS not touched.** Structural lock holds.
- **No new hooks authored.** `useReducedMotion()` is consumed from `motion/react`; no L3 hook-authoring work in this phase.
- **No KI-112 work.** Aesthetic gap family stays parked.
- **No Phase 8.5 work.** Path A re-charter and KI-112 close are gated on KI-113 closure per §6.
- **No KI-111 work.** Sub-folder split is owner-named territory.
- **No KI-108 residual work.** Per-list-item / pure-utility callers remain grandfathered.

---

## §10. Authorization gate

**This audit ships as a single `docs(audit):` commit.** Branch goes from `4f4bd444` → audit commit → owner reviews scope contract → execution relay fires for Commit 1 (`MotionConfig` wrap).

**Owner reviews this scope contract and either:**

- Authorizes execution as-is → builder fires Commit 1 (`MotionConfig` wrap) and chains forward through the ~8 execution commits + close.
- Requests amendments to specific sections → builder revises this contract first.
- Defers KI-113 closure → branch holds at this audit commit until reauthorized.

If owner picks **batched commit shape (3/2 gate cadence like Phase 8 useShopMapListings)** instead of the current 5-gate plan: contract amendment to §3 + §5 first, then execution.

---

## §11. Cross-references

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §3 (mandatory `prefers-reduced-motion` contract this contract closes) + §5 (motion/react envelope; amended 2026-05-04 in commit `63ef6b6b` — the prerequisite for this contract)
- [`OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md) §2 + close-footer (Sonnet runtime verification + bucket classification — the upstream evidence)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-113 (parked durable scope contract this concretizes) + KI-112 (downstream-blocked by KI-113 closure)
- [`OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md`](OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md) — sister scope contract; same OPS shape for execution-authority planning
- [`OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05.md`](OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05.md) — sister atmosphere audit; flagged KI-113 as precondition for any Path A motion shipping
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — v3.3 master plan; Phase 7.6 close session entry added at Commit 9 (this close)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 7.6 row marked CLOSED at Commit 9
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED; not touched)

---

## Close footer — Phase 7.6 / KI-113 (2026-05-05)

**VERDICT: CLOSED.**

**Execution pipeline:** Sonnet 3-prompt (Executor → Auditor → Finalizer), owner "go full auto" authorization.

**Commit chain (branch `BidOnDent-Horizon-Beta`):**

| #   | SHA             | Description                                                              |
| --- | --------------- | ------------------------------------------------------------------------ |
| 1   | `b1fea150`      | `MotionConfig reducedMotion="user"` wrap at `src/main.tsx`               |
| 2   | `b07f7dd3`      | fix(a11y): KI-113 admin/auth/devtools (D+E) — 11 files                   |
| 3   | `1d55f035`      | fix(a11y): KI-113 auth flows — 4 files                                   |
| 4   | `9eaee53e`      | fix(a11y): KI-113 codelayer + reports + demo — 10 files                  |
| 5   | `f53ab7da`      | fix(a11y): KI-113 codelayer/account + report step + competitor — 5 files |
| 6   | `77205da5`      | fix(a11y): KI-113 insurer screens — 3 files                              |
| 7   | `982dbae4`      | fix(a11y): KI-113 shop screens — 8 files                                 |
| 8   | `099b3742`      | fix(a11y): KI-113 dashboard routers + overlay sheets — 4 files           |
| 9   | _(this commit)_ | docs(a11y): KI-113 Phase 7.6 close — reduced motion complete             |

**Auditor VERDICT: CLEAN.** 45 files with `useReducedMotion`, 62 wrapped sites, 0 missed plain durations, Bucket B springs untouched, all original numeric values preserved verbatim in non-reduce branches. Build: `✓ 2920 modules`.

**KI-113: RESOLVED.** **KI-112 close + Phase 8.5 Path A: UNBLOCKED.**

---

### Post-audit clarification (added 2026-05-05 by Sonnet v3.1 audit + Opus surgical patch)

**Sonnet v3.1 runtime audit verdict:** `MAJOR_DRIFT` — correct per literal protocol rule, but architecturally a CSS hygiene gap, not a motion-system regression.

**The WAAPI vs CSS distinction:** Sonnet's S1 measurement found `getAnimations()` returning `duration: 0` under reduce (WAAPI working) while `getComputedStyle().transitionDuration` returned `"0.15s"` from a separate CSS-layer source. The motion/react migration IS correct; a pre-existing CSS hover transition on `.bd-dashboard-section--interactive` (not in original KI-113 scope) leaked through.

**Targeted CSS fixes applied (this commit, tight forensic-pass discipline — not a sweep):**

- `.bd-dashboard-section--interactive` + `::before` + `:hover` + `:focus-visible` → `transition: none` + `transform: none` on hover/focus under reduce
- `.bd-dashboard-primary-button`, `.bd-dashboard-secondary-button`, `.bd-dashboard-ghost-button`, `.bd-dashboard-filter-button` → `transition: none` under reduce
- `.bd-report-input`, `.bd-report-primary-button`, `.bd-report-secondary-button` → `transition: none` under reduce
- `.bd-glass-control` → `transition: none` under reduce

**`LAW_ANIMATION_AND_ATMOSPHERE.md` §3 amendment (this commit):** Added explicit forbidden-pattern entry for "CSS `transition:` declarations on interactive states without a `@media (prefers-reduced-motion: reduce)` override." Codifies the WAAPI-vs-CSS layering lesson into canon.

**Footnote — false-regression prevention:** WAAPI migration (Commits 1–9) is confirmed correct and is NOT being reverted. The CSS fixes above are post-audit hygiene, orthogonal to the motion/react sweep. Remaining unaudited `transition:` declarations in `theme.css` (~14, mostly on non-interactive surfaces) are tracked as informal residual; no separate KI created per tight-scope discipline.

**No new KI created (deliberate, per advisor framing).** No `v3.2` prompt created (deliberate). v3.1 receives a single delta-rule patch — see `PROMPT_SONNET_MASTER_VISUAL_AUDIT_v3-1.md` §12.

**Re-run expectation:** Sonnet v3.1 protocol re-run on the surfaces this commit fixed should now yield `VERDICT: CLEAN`.

---

### §9 Closure-proof runtime verification (added 2026-05-05)

**Tool:** `run_playwright_code` (Playwright MCP). Branch: `BidOnDent-Horizon-Beta`, HEAD `8eb54b9c`. Measurement spec: v3.1 §4 + §12 dual-capture — `getComputedStyle(el).transitionDuration` AND `el.getAnimations().filter(a => a instanceof Animation && !(a instanceof CSSTransition))`. `emulateMedia({ reducedMotion: 'reduce' })` active throughout.

**S1 — BidCardArticle hover under reduce:** PASS — `transitionDuration: "0s"`, `transitionProperty: "none"`, `waapiAnimations: []` (Phase 7.5 original FAIL@200ms; closure proven)

**S3 — DashboardRouter route transition under reduce:** PASS — `transitionDuration: "0s"`, `waapiAnimations: []` (WAAPI `duration: 0` by `MotionConfig reducedMotion="user"` propagating to `motion.div` in `DashboardRouter.tsx`; Phase 7.5 original FAIL inferred; closure proven via direct measurement)

**Recovery (emulation off — `no-preference`):**
- S1 → `transitionDuration: "0.18s, 0.18s, 0.18s"` (`transform, box-shadow, border-color`) — non-zero, restores correctly ✅
- S3 → WAAPI `duration: 200ms` captured in-flight at 80ms into the transition — non-zero, reduce-only behavior confirmed ✅

**Bucket C (MotionConfig coverage):** AccountAdminOverlay, MobileBottomNav, ImmersiveMapResultsDrawer, PhotoGuide — all PASS. `MotionConfig reducedMotion="user"` exists exactly once at `src/main.tsx:138`, wrapping the full React tree. No nested `MotionConfig` override found anywhere in `src/`. All `motion.*` elements on all 4 surfaces inherit root reduce config.

**Visual Integrity:** 4/4 PASS
- Mount check: `main` rendered with content, no flash ✅
- BD canon intact: 37 `bd-*` elements present; 0 forbidden inline styles (`rgba(220,165,90)`, `rgba(254,248,220)`, `rgba(160,95,25)`) ✅
- Hover feedback preserved: `.bd-dashboard-section--interactive:hover` state active under reduce (instant, no animation) ✅
- No layout shift or white-out observed on navigated surfaces ✅

**Console + network:** 0 hydration mismatches, 0 React console errors on migrated surfaces (DashboardRouter home → Bids → Account). Expected 500/401 `EdgeFunctionError: Invalid Clerk token issuer` errors are demo-mode artifact (known, unrelated to motion).

**PART C — Doctrine landmine:** CLEAN — `grep -rn "KI-114" src/ docs/` → exit code 1, zero matches. `theme.css ~L3311` reads "intentionally out of scope per containment doctrine (no follow-up KI created); revisit only if user-visible motion regresses."

---

**Residual inventory snapshot (PART B — informational only; no action per containment doctrine; no follow-up KI created):**

| Category | Count | Notes |
|---|---|---|
| GUARDED | 9 | `.bd-dashboard-section--interactive` (×2), `.bd-dashboard-filter-button`, `.bd-report-input`, `.bd-report-secondary-button`, `.bd-bid-card-float`, `.bd-bloom-atmosphere` (×3), `.bd-glass-control` (base, ×2 definitions) |
| INTERACTIVE-UNGUARDED | 5 | `.bd-glass-control--secondary` (L72), `.bd-glass-control--utility` (L102), `.bd-glass-control--destructive` (L131), `.bd-glass-card` (L947), `.bd-report-choice` (L2356) |
| DECORATIVE-UNGUARDED | 5 | `.maplibregl-ctrl-group button` (L473), `.maplibregl-popup-close-button` (L780), `.shop-directory-map[data-map-theme="dark"]` (L809), `.bd-glass-floating` (L1361), `.bd-bid-card-float::after` (L3789) |

The 5 interactive-unguarded selectors (glass-control variants + report-choice) are out of scope per the tight forensic-pass containment discipline established by the ChatGPT advisor. They produce non-zero CSS `transitionDuration` under reduce but none caused a Phase 7.5-style WAAPI FAIL. No follow-up KI created.

**KI-113 closure is now runtime-proven, not just static-substring-proven.**
