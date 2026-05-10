---
status: ACTIVE
authority: REF
scope: runtime-continuity-regression-harness-spec
canonical_source_of_truth: REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 285 specification for a runtime continuity regression harness under owner relay 2026-05-09 #14 priority Item G. SPEC-only (per CLAUDE.md "no half-finished implementations" — Pass 285 does NOT create stub tests; it specifies what tests SHOULD exist for a future authorized implementation pass to build). Bridges Pass 281 doctrine (provider-order invariants) + Pass 280 dependency chains (5 preservation-critical chains) + Pass 284 audit script (mechanical structural coverage) + runtime-audit lane findings (overlay desync, persistence entropy, stagger interpolation freeze, hydration timing). Defines 6 invariant categories the harness should verify: (1) provider mount order; (2) reduce-motion guard coverage [DELEGATES to existing scripts/audit-reduced-motion.mjs]; (3) hydration timing (no flash of default appearance during boot); (4) atmospheric-layer continuity (DashboardAtmosphere 10-layer composition stable); (5) persistence-key namespace consistency; (6) provider-order teardown semantics (sign-out cascade). Per category: lists invariants, specifies observable signals, recommends tooling (Playwright for browser-side; vitest for unit-side; Node/jsdom for snapshot-style structural checks). Recommends phased implementation: Phase 1 structural snapshot tests (vitest, low cost); Phase 2 visual continuity baselines (Playwright screenshots); Phase 3 timing-sensitive runtime checks (PerformanceObserver hooks). Surfaces ZERO new tests; identifies WHERE in the existing test infrastructure tests would land (src/app/__tests__/ has the pattern; tierBPreviewLifecycle.test.tsx is precedent). Doc-only. NO source / LAW / MOLANDJESUS touched. ZERO new owner-decision points (cumulative remains 31). Forward trigger: owner authorizes Phase 1 implementation.
last_updated: 2026-05-09
---

# Pass 285 — Runtime Continuity Regression Harness Spec

> **Tier:** REF. Specification-only document.
> **Authority:** Owner relay 2026-05-09 #14 priority Item G
> ("runtime continuity regression harness preparation;
> observational governance infrastructure").
>
> **Pass type:** Doc-only specification. **NOT implementing the
> harness** — per CLAUDE.md "Don't add features, refactor, or
> introduce abstractions beyond what the task requires. ... No
> half-finished implementations either." A future authorized pass
> would build the harness from this spec.
>
> **What this doc is:** the specification for what runtime
> continuity invariants need observation, how to check them, and
> what tooling fits each category.
>
> **What this doc is NOT:**
> - LAW. Spec-level reference.
> - An implementation. No code authored.
> - A test runner. No new test files created.
> - A new decision-point generator. Pass 285 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #14 priority Item G + relay #6:

> "Future implementation passes must continuously validate against
> continuity baselines, emotional-layer invariants, provider-order
> doctrine, reduced-motion contracts, runtime authority sequencing,
> and persistence continuity behavior. The runtime lane is no
> longer secondary validation. It is now execution-governance
> infrastructure."

The questions this pass answers:
1. What are the runtime continuity invariants the harness must observe?
2. What observable signals indicate each invariant is intact?
3. What tooling fits each invariant category?
4. Where in the codebase should new tests land?
5. What is the recommended phased implementation order?

---

## §2 — Existing test infrastructure (precedent)

**Test framework:** vitest (per `package.json` and existing test files).

**Test file patterns observed in repo:**
- `src/app/__tests__/*.test.{ts,tsx}` — app-level tests
- `src/app/services/**/*.test.ts` — service-layer tests
- `src/app/hooks/*.test.{ts,tsx}` — hook tests
- `src/app/utils/*.test.ts` — utility tests

**Existing precedent for runtime-flavored tests:**
- `src/app/__tests__/tierBPreviewLifecycle.test.tsx` — lifecycle behavior
- `src/app/services/storage/StorageService.test.ts` — service behavior
- `src/app/utils/clearStaleNavSessions.test.ts` — persistence behavior

**Audit script precedent (mechanical, not runtime):**
- `scripts/audit-reduced-motion.mjs` (Pass 71, KI-139) — Node.js mjs script that audits CSS structure

**The harness should integrate with these patterns**, not introduce a parallel framework.

---

## §3 — Six invariant categories

### §3.1 Category 1 — Provider mount order

**Invariant (Pass 281 §3):** App.tsx renders providers in canonical
4-layer order:
```
ClerkProvider > MapSessionProvider > AppearanceModeProvider > NotificationProvider
```
With AppWithToast subcomponent boundary preserving notificationActions
lift point (Pass 281 §4.4).

**Observable signal:** the JSX nesting order in `src/app/App.tsx`.

**Recommended check (Phase 1, vitest):**
- Static parse of App.tsx returning provider mount sequence.
- Verify exact match against canonical hierarchy.
- Verify EmbeddedBrowserBanner sits between ClerkProvider and MapSessionProvider.
- Verify AppWithToast subcomponent exists.

**Tooling:** TypeScript compiler API (already a dev dependency) or simple AST regex on the source string.

**Failure mode caught:** any "cleanup refactor" that reorders providers (Pass 281 §12 anti-pattern #1).

### §3.2 Category 2 — Reduce-motion guard coverage

**Invariant (LAW_ANIMATION_AND_ATMOSPHERE.md §3):** every keyframe
consumer has a guard inside `@media (prefers-reduced-motion: reduce)`.

**Observable signal:** structural CSS analysis of `src/styles/*.css`.

**Existing infrastructure:** `scripts/audit-reduced-motion.mjs` (Pass 71).
Pass 284 baseline: 35/35 keyframes covered.

**Recommended check (Phase 1):** harness DELEGATES to existing audit script.
- Run `node scripts/audit-reduced-motion.mjs`
- Pass if exit code 0; fail if exit code 1.
- Wrap in vitest test or pre-commit hook.

**Failure mode caught:** any keyframe added without a corresponding reduce-motion guard.

### §3.3 Category 3 — Hydration timing

**Invariant (Pass 281 §6 + Pass 280 §11.3):** AppearanceModeProvider
hydrates from `bidondent.appearance-mode` localStorage on first
render. DashboardAtmosphere should NOT flash with default
appearance during boot.

**Observable signal:** browser-side render-frame inspection during
boot. Specifically: the first painted frame should already have
the correct `isLightAppearance` flag if a preference is stored.

**Recommended check (Phase 2, Playwright):**
- Pre-set `localStorage["bidondent.appearance-mode"] = "light"` (or "dark", "map-dark")
- Boot the app; capture first 5 paint frames
- Verify DashboardAtmosphere root div's `style="background: ..."` value matches the expected appearance mode in frame 1
- No flash to default → invariant holds

**Tooling:** Playwright `page.evaluate` + `page.screenshot` + DOM inspection.

**Failure mode caught:** any change to provider order or hydration timing that introduces a flash (e.g., moving AppearanceModeProvider above MapSessionProvider, breaking Pass 281 §12 anti-pattern #4).

### §3.4 Category 4 — Atmospheric-layer continuity

**Invariant (Pass 280 §5 + Pass 277 §4.8):** DashboardAtmosphere
renders 10 stacked atmospheric layers (z-0 fixed inset-0 with
pointer-events-none except base). Opacity hierarchy: 20+ distinct
alpha values from 0.04 → 0.99. Layer composition encodes light-vs-dark
emotional contrast.

**Observable signal:** rendered DOM structure of DashboardAtmosphere.

**Recommended check (Phase 2, Playwright + DOM snapshot):**
- Mount a route that includes DashboardAtmosphere (dashboard or landing)
- Capture all child divs of `#dashboard-map-bg` ancestor
- Verify count = 10 layers
- For each layer, verify opacity / background patterns are stable across runs (snapshot)
- Verify only layer 1 is interactive; layers 2-10 are pointer-events-none

**Tooling:** Playwright + structural snapshot diff. Visual screenshot diff is NOT recommended (false positives on antialiasing).

**Failure mode caught:** any cleanup that flattens or simplifies DashboardAtmosphere layer composition (Pass 281 §12 anti-pattern #2 + relay #14 prohibition on continuity flattening).

### §3.5 Category 5 — Persistence-key namespace consistency

**Invariant (Pass 274 §3 + Pass 281 §9):** localStorage keys are
namespace-prefixed (`bidondent.*`, `bidondent_*`, `bd-*`/`bd:*`)
with a small known set of un-namespaced exceptions (3 keys
documented in Pass 274 §3.2 RISK 1).

**Observable signal:** static scan of `src/**/*.ts{x}` for
localStorage / sessionStorage usage patterns.

**Recommended check (Phase 1, vitest):**
- Walk source files; collect all string literals passed to
  `localStorage.setItem` / `getItem` / `removeItem`
- Categorize by namespace prefix
- Fail if any new un-namespaced key is introduced beyond the
  3 documented exceptions
- Fail if any new namespace convention is introduced (i.e., not
  one of the existing 4)

**Tooling:** TypeScript compiler API or AST traversal.

**Failure mode caught:** persistence drift — new code introducing
storage keys that bypass the namespace doctrine.

### §3.6 Category 6 — Provider teardown sequencing

**Invariant (Pass 281 §7 + §10):** sign-out triggers React natural
inside-out unmount cascade:
```
NotificationProvider → AppearanceModeProvider → MapSessionProvider → ClerkProvider redirect
```
Notification stream cleanup MUST run before Clerk's redirect.

**Observable signal:** unmount lifecycle order observable via
React's `useEffect` cleanup callbacks.

**Recommended check (Phase 3, runtime instrumentation):**
- In dev/test mode, instrument each provider's unmount with a
  timestamped log entry
- Trigger sign-out
- Verify log order: NotificationProvider unmount → AppearanceModeProvider
  unmount → MapSessionProvider unmount → ClerkProvider redirect
- Phase 3 because this requires runtime hooks that don't exist
  in production code paths

**Tooling:** vitest with React Testing Library + custom
teardown-order assertion utility.

**Failure mode caught:** any change that reorders providers or
breaks the AppWithToast subcomponent boundary (Pass 281 §12
anti-patterns #1 + #2).

---

## §4 — Phased implementation order

### §4.1 Phase 1 — Structural snapshot tests (low cost)

Phase 1 invariants:
- §3.1 Provider mount order (vitest + AST parse)
- §3.2 Reduce-motion guard coverage (delegates to existing audit)
- §3.5 Persistence-key namespace consistency (vitest + AST traversal)

**Why Phase 1 first:** all three are static-source-analysis
checks. No browser. No timing. No flakiness. Easy to run in CI
or pre-commit. Catches the highest-frequency drift surfaces.

**Approximate effort:** ~3-5 small test files; 1-2 day implementation
when authorized.

### §4.2 Phase 2 — Visual continuity baselines (medium cost)

Phase 2 invariants:
- §3.3 Hydration timing (Playwright)
- §3.4 Atmospheric-layer continuity (Playwright + DOM snapshot)

**Why Phase 2 second:** requires browser environment + Playwright
setup. Higher infrastructure cost but higher continuity-preservation
value. Visual continuity is the most preservation-sensitive
surface per relay #14.

**Approximate effort:** ~1 week including Playwright config + 2-3
test files.

### §4.3 Phase 3 — Timing-sensitive runtime checks (higher cost)

Phase 3 invariants:
- §3.6 Provider teardown sequencing (instrumented runtime)

**Why Phase 3 last:** requires production-code instrumentation
hooks (or test-only build flags). Higher complexity. Lower
frequency of failure (teardown order is React-enforced).

**Approximate effort:** ~1 week including instrumentation hooks
+ test scaffolding.

---

## §5 — Where tests should land

| Category | Recommended location |
| --- | --- |
| §3.1 Provider mount order | `src/app/__tests__/providerMountOrder.test.ts` (new) |
| §3.2 Reduce-motion guard coverage | `src/app/__tests__/reduceMotionAudit.test.ts` (new; delegates to scripts/audit-reduced-motion.mjs) |
| §3.3 Hydration timing | `tests/e2e/hydrationTiming.spec.ts` (new; Playwright) |
| §3.4 Atmospheric-layer continuity | `tests/e2e/atmosphereContinuity.spec.ts` (new; Playwright) |
| §3.5 Persistence-key namespace | `src/app/__tests__/persistenceNamespace.test.ts` (new) |
| §3.6 Provider teardown | `src/app/__tests__/providerTeardown.test.tsx` (new) |

**Pattern note:** existing precedent `src/app/__tests__/tierBPreviewLifecycle.test.tsx`
demonstrates the lifecycle-flavored test pattern. New harness tests follow
that pattern.

---

## §6 — Connection to runtime-audit lane findings

Per relay #14 + parallel runtime-audit lane:

| Runtime-audit finding | Harness category that catches regression |
| --- | --- |
| Map-state overlay desync | §3.4 atmospheric-layer continuity (extended check) OR future map-specific category |
| 22 nav-session keys w/o LRU | §3.5 persistence-key namespace consistency (extended w/ key-count threshold) |
| Stagger interpolation freeze (Pass 5 framer-motion finding) | Future Phase 4 — orchestration-commitment harness (out of Pass 285 spec scope) |
| Hydration timing | §3.3 hydration timing |
| Reduced-motion + focus invariants | §3.2 reduce-motion + future a11y harness extension |

The harness extends the runtime-audit lane's continuity findings
into automated regression detection.

---

## §7 — What this pass DOES NOT do

- **Does NOT implement any test.** Per CLAUDE.md "no half-finished implementations." Pass 285 is spec-only.
- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT install Playwright or any new dev dependencies (Phase 2 implementation pass would).
- Does NOT modify the existing `scripts/audit-reduced-motion.mjs` script.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT prescribe runtime-validation behavior beyond observability — the harness OBSERVES; it does not enforce visual correctness (that remains runtime-audit lane responsibility).

---

## §8 — Forward triggers

1. **Owner authorizes Phase 1 implementation** — single pass that creates 3 vitest test files (§3.1 + §3.2 delegation + §3.5).
2. **Owner authorizes Phase 2 implementation** — Playwright setup + visual continuity tests.
3. **Owner authorizes Phase 3 implementation** — runtime instrumentation + teardown-order tests.
4. **Owner authorizes audit-script automation wiring** (Pass 284 §4.2 forward trigger) — combine with Phase 1 implementation.
5. **Pass 286+ — remaining relay #14 menu items** (Item A extension, Item D Clerk wrapper, Item E notification parameterization).
6. **Real runtime defect surfaces** (independent lane).
7. **Stacey answers** (Pass 268 §8).

---

## §9 — Cross-references

- Pass 284 [`REF_PASS_284_REDUCE_MOTION_AUDIT_2026-05-09.md`](REF_PASS_284_REDUCE_MOTION_AUDIT_2026-05-09.md) — existing audit-reduced-motion.mjs script that §3.2 delegates to.
- Pass 283 [`REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md`](REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md) — preserved invariants validated by §3.2.
- Pass 282 [`REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md`](REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md) — preserved invariants validated by §3.2.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) — §3 + §4 + §6 + §7 invariants Pass 285 specifies harness checks for.
- Pass 280 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) — §11 five preservation-critical dependency chains; §3.3 + §3.4 + §3.6 protect against violations.
- Pass 277 [`REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md`](REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md) — §4.8 DashboardAtmosphere classification informs §3.4 check.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — §3 storage-key registry informs §3.5 check.
- `scripts/audit-reduced-motion.mjs` — Pass 71 audit script; §3.2 delegates.
- `src/app/__tests__/tierBPreviewLifecycle.test.tsx` — existing test precedent for lifecycle-flavored runtime tests.
- `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` §3 — mandatory reduce-motion contract; §3.2 enforces.
- Owner relay 2026-05-09 #14 priority Item G.

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 285, runtime continuity regression harness spec).
- **Status:** ACTIVE specification. No source authored; no tests created.
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the 3 implementation phases (each is its own future authorized pass).
- **Refines:** Pass 281 invariants + Pass 280 dependency chains by specifying observable-check shape per invariant.

The harness specification provides a complete map of what runtime
continuity invariants need automated regression detection, what
observable signals indicate each, what tooling fits each, and
where in the existing test infrastructure new tests would land.

A future authorized pass can take this spec and implement Phase
1 (structural snapshot tests; ~3-5 files; 1-2 day effort) without
needing further design work.

The execution-readiness lane (Pass 274-280) + execution-phase
work to date (Pass 281-285) now spans inventory → doctrine →
mechanical normalization → audit infrastructure → harness
specification. The next implementation pass either:
(a) extends mechanical normalization (relay #14 Item A extension,
    Item D Clerk wrapper, Item E notification parameterization), or
(b) builds the harness Phase 1 from this spec.

Both are authorized-on-owner-instruction; Pass 285 surfaces the
options and stands down.
