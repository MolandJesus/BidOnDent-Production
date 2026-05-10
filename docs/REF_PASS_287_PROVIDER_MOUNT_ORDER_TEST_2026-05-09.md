---
status: ACTIVE
authority: REF
scope: pass-287-source-change-evidence
canonical_source_of_truth: REF_PASS_287_PROVIDER_MOUNT_ORDER_TEST_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 287 source-change evidence under owner relay 2026-05-09 #15 priority Phase 1 of Pass 285 harness implementation (lower-blast surface than Item E notification parameterization). New test file src/app/__tests__/providerMountOrder.test.ts (~120 lines) implements Pass 285 §3.1 — pins canonical 4-layer App.tsx provider mount hierarchy with structural snapshot verification: 3 vitest tests covering (1) all 6 canonical tags present (ClerkProvider / EmbeddedBrowserBanner / MapSessionProvider / AppWithToast / AppearanceModeProvider / NotificationProvider); (2) appearance order strictly increasing (positional regex search); (3) AppWithToast subcomponent boundary preserved (function/const definition exists). All 3 tests PASS against current App.tsx. Test runtime: ~2ms (negligible). Major discovery: Pass 285 §3.2 (reduce-motion guard coverage delegation) was already implemented by Pass 238 (`src/app/__tests__/reducedMotionContract.test.ts`) which integrates the audit script via `execFileSync` into vitest. Phase 1 work remaining after Pass 287: §3.5 persistence-key namespace test (one more vitest file). NO production source touched — test-only file. Pass 281 §11 invariants ALL preserved + this test now PROTECTS invariant #1 mechanically. NO LAW touched. ZERO new owner-decision points (cumulative remains 31). Forward triggers: Pass 285 §3.5 persistence-key test, Item E notification parameterization, owner ratification of any of 31 cumulative decision points.
last_updated: 2026-05-09
---

# Pass 287 — Provider Mount Order Snapshot Test (Evidence)

> **Tier:** REF. Source-change evidence document.
> **Authority:** Owner relay 2026-05-09 #15 — autonomous continuation
> authorization permitted Phase 1 of Pass 285 harness implementation
> "depending on which surface appears lower-risk during execution."
> Phase 1 chosen over Item E (notification type parameterization)
> due to lower blast (test-only; no production source).

---

## §1 — Mission

Per Pass 285 §3.1 specification:
> "Provider mount order. Invariant: App.tsx renders providers in
> canonical 4-layer order (ClerkProvider > MapSessionProvider >
> AppearanceModeProvider > NotificationProvider). Tooling: vitest
> + AST parse (or simple regex on source string)."

Pass 287 implements this single check. ONE vitest file covering
3 structural assertions; runtime ~2ms.

---

## §2 — Major discovery: Pass 285 §3.2 was already done

While preparing Pass 287, I discovered that **Pass 285 §3.2
(reduced-motion guard coverage delegation) was ALREADY
IMPLEMENTED** by Pass 238.

**Existing file:** `src/app/__tests__/reducedMotionContract.test.ts`
**File header (line 1-3):** "Pass 238 — Reduced-motion contract
CI promotion. Promotes the CSS-keyframe reduce-motion audit
(`scripts/audit-reduced-motion.mjs`) from manually invoked
(Pass 71 baseline) to vitest-integrated, so it runs on every
`npm test`."

**What the existing test does (Pass 285 §3.2 specification):**
- Spawns `scripts/audit-reduced-motion.mjs` via `execFileSync`
- Asserts exit code 0
- ALSO adds JSX-side audit (Tailwind `animate-in`/`animate-out`
  paired with `motion-reduce:`) — bonus beyond Pass 285 §3.2 spec

**Implication for Pass 285 Phase 1:**
- §3.1 Provider mount order — Pass 287 (this pass)
- §3.2 Reduce-motion guard coverage — ALREADY DONE by Pass 238
- §3.5 Persistence-key namespace consistency — REMAINING

Phase 1 effort estimate revised: 2 new test files needed (not 3
as Pass 285 §4.1 estimated). Pass 287 ships one; one remaining.

---

## §3 — Edits applied

### §3.1 New file: `src/app/__tests__/providerMountOrder.test.ts`

**Size:** ~120 lines.
**Imports:** `node:fs`, `node:path`, `vitest`.
**Structure:** one `describe()` block + three `it()` tests.

**Test 1 — all canonical tags present:**
Verifies every entry in `CANONICAL_SEQUENCE` (ClerkProvider,
EmbeddedBrowserBanner, MapSessionProvider, AppWithToast,
AppearanceModeProvider, NotificationProvider) appears as a JSX
tag opening in `src/app/App.tsx`.

**Test 2 — strictly increasing appearance order:**
Locates each canonical tag's first occurrence position; asserts
positions are strictly increasing. Catches reorder regression.

**Test 3 — AppWithToast subcomponent boundary preserved:**
Verifies `function AppWithToast` or `const AppWithToast` exists
in App.tsx. Catches Pass 281 §12 anti-pattern #2 (collapsing the
AppWithToast subcomponent boundary).

**Failure messages:** each assertion's failure message cites the
relevant Pass 281 invariant or anti-pattern, so future agents
debugging a failure see the doctrine context immediately.

### §3.2 Test execution

```
npx vitest run src/app/__tests__/providerMountOrder.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  648ms
```

3/3 PASS against current App.tsx.

---

## §4 — What was preserved

### §4.1 Production source — UNTOUCHED

Pass 287 is purely additive. Single new file under `src/app/__tests__/`.
Zero production source touched.

### §4.2 Per Pass 281 §11 invariants

| Invariant | Status |
| --- | --- |
| 4-layer provider mount order | UNTOUCHED — and now PROTECTED by Pass 287 test |
| AppWithToast subcomponent boundary | UNTOUCHED — and now PROTECTED |
| First-import-line resize-patch | UNTOUCHED |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards | UNTOUCHED — protected by Pass 238 test |
| Two intentional :root blocks | UNTOUCHED |
| Pass 282 cadence/easing tokenization | UNTOUCHED |
| Pass 283 blur tokenization | UNTOUCHED |
| Pass 286 Clerk wrapper inflation | UNTOUCHED |

### §4.3 Per Pass 281 §12 anti-patterns

Zero violations. The new test ENFORCES §12 anti-pattern #1
(provider reorder without re-test) + §12 anti-pattern #2
(collapsing AppWithToast boundary) by failing the build if
future code violates them.

---

## §5 — Verification

### §5.1 Test runs in current state

All 3 tests PASS. Current App.tsx structure is verified canonical.

### §5.2 Negative test (manual verification of failure mode)

Not performed in Pass 287 (would require modifying App.tsx
temporarily). Future regression: the test fails clearly when:
- Any provider tag is removed (Test 1 fails)
- Any provider is moved to a different relative position (Test 2 fails)
- AppWithToast subcomponent is inlined (Test 3 fails)

### §5.3 Reverse-revertibility

Pass 287 is fully reversible via `git revert <commit-sha>`.
Reverting deletes the test file. No production code affected.

---

## §6 — Phase 1 status after Pass 287

| Pass 285 §3 invariant | Status | Implementation |
| --- | --- | --- |
| §3.1 Provider mount order | ✓ DONE | Pass 287 (this pass) |
| §3.2 Reduce-motion guard coverage | ✓ DONE | Pass 238 (already existed; discovered during Pass 287) |
| §3.5 Persistence-key namespace | PENDING | Future Phase 1 pass |
| §3.3 Hydration timing | PENDING | Phase 2 (Playwright) |
| §3.4 Atmospheric-layer continuity | PENDING | Phase 2 (Playwright) |
| §3.6 Provider teardown sequencing | PENDING | Phase 3 (instrumented runtime) |

**Phase 1 is 2/3 complete.** One remaining test (persistence-key
namespace) would close Phase 1 entirely.

---

## §7 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT modify any existing test file.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT implement Pass 285 §3.3 / §3.4 / §3.6 (Phase 2 + 3).
- Does NOT implement Pass 285 §3.5 (persistence-key namespace test) — defer to next Phase 1 pass.
- Does NOT modify the existing reducedMotionContract.test.ts (Pass 238 work; already complete).
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT introduce any orchestration depth (relay #15 prohibition).

---

## §8 — Forward triggers

1. **Pass 288 — Pass 285 §3.5 persistence-key namespace test** would close Phase 1.
2. **Pass 288 — Item E notification parameterization prep** (alternative; medium-blast type-design work).
3. **Pass 288 — Item A extension** (39-site cubic-bezier mass replace; needs owner decision on unify vs separate).
4. **Phase 2 of Pass 285 harness** (Playwright tests; requires installing Playwright + visual baseline setup; medium-cost).
5. **Owner ratifies any of 31 cumulative decision points**.
6. **Real runtime defect surfaces** (independent lane).
7. **Stacey answers** (Pass 268 §8).

---

## §9 — Cross-references

- Pass 286 [`REF_PASS_286_CLERK_WRAPPER_INFLATION_2026-05-09.md`](REF_PASS_286_CLERK_WRAPPER_INFLATION_2026-05-09.md) — verified by Pass 287 (Clerk wrapper inflation did NOT change provider mount order).
- Pass 285 [`REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md`](REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md) §3.1 — specification Pass 287 implements.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) §3 + §11 + §12 — doctrine Pass 287 mechanically enforces.
- Pass 238 — `reducedMotionContract.test.ts` (already-existing test that satisfies Pass 285 §3.2; discovered during Pass 287 prep).
- Pass 71 — `scripts/audit-reduced-motion.mjs` (audit script Pass 238 wraps).
- `src/app/App.tsx` — the file Pass 287 verifies.
- `src/app/__tests__/tierBPreviewLifecycle.test.tsx` — existing test pattern Pass 287 follows.
- Owner relay 2026-05-09 #15.

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 287, Phase 1 §3.1 implementation).
- **Status:** ACTIVE. New test file added; 3/3 tests pass against current App.tsx. Companion to commit.
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc. Pass 287 source change executed under relay #15 autonomous continuation authorization for Phase 1 implementation.
- **Refines:** Pass 285 §3.1 by implementing the first-of-three Phase 1 invariant tests; surfaces Pass 238 as already-satisfying §3.2.

The provider mount order is now mechanically protected against
future drift. Pass 287 + the existing Pass 238 test cover 2 of 3
Pass 285 Phase 1 invariants. One persistence-key namespace test
would close Phase 1 entirely.
