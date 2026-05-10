---
status: ACTIVE
authority: REF
scope: platform-tier-provider-pattern-philosophy
canonical_source_of_truth: REF_PROVIDER_SEAM_PATTERN_2026-05-10.md
companion_to: REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Provider-Seam-Pattern Doctrine (Pass 302, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #25 (Phase G Priority B; Pass 296 §3.7 nominated this artifact; relay #25 endorses as "one of the highest-value architecture artifacts in the repo").

**Tier:** REF (philosophy + skeleton + failure cases). **Not LAW** per relay #25 explicit instruction.

**Relationship to existing docs:**
- [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) — BidOnDent-INSTANCE-specific provider stack (Clerk → MapSession → Appearance → Notification). This doc is the GENERIC philosophy any consumer adopts.
- [`REF_PASS_287_PROVIDER_MOUNT_ORDER_TEST_2026-05-09.md`](REF_PASS_287_PROVIDER_MOUNT_ORDER_TEST_2026-05-09.md) — mechanical enforcement of mount order for BidOnDent's instance.
- Pass 296 §3.7 — established that the provider PATTERN extracts as DOCTRINE-not-as-code.

---

## §1. Premise

Across passes 281, 287, 293, 296, 299, 300, 301, the repo has accumulated a coherent stance: **providers are not reusable infrastructure primitives. They are orchestration boundaries with hidden continuity doctrine.**

The natural temptation when extracting a platform-core is to ALSO extract a generic `createSeamProvider(...)` helper, a `ProviderRegistry`, or a centralized mount-order coordinator. Pass 296 §3.7 surfaced this as a false-universal: the pattern's value lives in its doctrine, not in code reuse.

This doc codifies that distinction and provides a skeleton for consumer apps (BidOnDent today; Stacey's site tomorrow; future branded consumers later) to **copy and adapt**, not to import and share.

**Critical framing:** this is a **negative-space artifact** as much as a positive one. Failure cases (§5) are part of the doctrine — what would BREAK if these rules were violated.

---

## §2. Why providers are categorically different

Utilities (e.g. `cn`) and hooks (e.g. `useOnlineStatus`) are **leaf primitives**: they accept inputs, return outputs, and have minimal side effects. They are safely extractable as functions because their authority is local and their behavior is composable.

Providers are **NOT** leaf primitives. They are:

1. **Orchestration boundaries.** Provider mount order encodes a hierarchy of responsibilities. `<ClerkProvider><AppShell>...</AppShell></ClerkProvider>` says: "auth wraps everything." Reordering changes meaning.

2. **Lifecycle anchors.** Providers carry mount/unmount semantics that other code depends on. A teardown ordering mistake (e.g. unmounting auth before unmounting auth-dependent state) corrupts state in subtle ways.

3. **Hidden side-effect surfaces.** Provider files often perform module-load-time side effects (e.g. the resize-patch first-import-line per Pass 281 §11 invariant #3). These cannot survive abstraction without breaking.

4. **Authority declarators.** A provider IS a statement: "I own this concern for everything inside me." Centralizing that ownership across multiple providers via a registry erases the declaration.

A utility describes BEHAVIOR. A provider describes AUTHORITY. Authority is harder to share.

---

## §3. The pattern (positive space)

A platform-tier provider pattern, distilled from BidOnDent's instance:

### 3.1 Mount-order asymmetry is doctrine, not implementation detail

The OUTERMOST provider has the LARGEST scope. The INNERMOST has the smallest. This is asymmetric by design.

**For BidOnDent:** Clerk wraps everything (auth is the largest scope). Notification is innermost (it's the most app-specific concern).

**Generic principle:** identify the concern with the LARGEST scope of dependents — that goes outermost. Each subsequent provider should depend ONLY on outer providers, never on inner ones.

**Anti-pattern:** alphabetizing providers, grouping by "type," or sorting by file path. The order is semantic, not aesthetic.

### 3.2 First-import-line side-effects are mandatory protection

Some providers depend on module-level side effects that MUST execute before any consumer code touches the underlying library. The canonical example: `MapSessionProvider` imports `maplibreResizePatch` as its first non-comment line.

**Generic principle:** if a provider needs a runtime patch / monkey-patch / global registration, the side-effect import MUST be the first import in the provider file. The provider file becomes the load-order anchor.

**Why this matters:** ES module load order is determined by the import graph. The first file to import a side-effect import IS the file that establishes it. A provider that needs the patch becomes the de-facto first-importer, ensuring the patch runs before any consumer touches the patched library.

**See Pass 281 §11 invariant #3 + Pass 293 §4 for BidOnDent's specific resize-patch case.**

### 3.3 Inert-by-default lifecycle posture

A new provider should mount with NO state, NO side effects (beyond mandated patches), and a no-op default context value. Behavior is added in subsequent phases.

**Why:** this preserves blast-radius. Phase 1 of any new provider should be reversible by deleting one file. Phase 2 adds state. Phase 3 adds engine. Etc.

**For BidOnDent:** see `MapSessionProvider`'s file-header docstring — "Phase 1 is intentionally inert."

**Generic principle:** providers should grow capability incrementally. Reaching "fully behavioral" in a single phase is an extraction-recovery hazard.

### 3.4 Local authority ownership

The provider OWNS its concern for the duration of its mount. Other code consumes via context, but does NOT reach around to mutate provider-owned state.

**Anti-pattern:** "decorator providers" that wrap other providers and modify their behavior. This obscures authority flow and creates extraction-recovery hazards.

**Generic principle:** if you find yourself writing `<EnhancedProvider><BaseProvider>...</BaseProvider></EnhancedProvider>`, consider whether the enhancement should be a separate sibling provider or a hook consuming the base provider's context.

### 3.5 Shallow nesting

The full provider chain should be readable in 30 seconds. BidOnDent's chain is 4 layers. Adding a 5th requires explicit justification.

**Generic principle:** every additional provider increases orchestration depth (Pass 281 §12 anti-pattern). Each additional layer increases the test burden, the unmount-order risk, and the cognitive cost of reading the app's startup.

**Defer adding a provider** until the concern genuinely cannot be served by a hook + state + a nearby useEffect.

---

## §4. The skeleton (copy-adapt, don't import-share)

Per Pass 296 §3.7 and relay #25's "copy-adapt vs import-share" framing: each consumer copies and adapts this skeleton. The platform does NOT export a `createSeamProvider()` helper that would centralize the pattern.

### 4.1 The provider file (skeleton)

```tsx
/**
 * <ProviderName>Provider — <ONE-LINE PURPOSE>.
 *
 * <CONCERN STATEMENT — what authority does this provider own?
 *  Be explicit. "Owns map-session lifecycle" is good.
 *  "Provides utility" is too vague.>
 *
 * Phase 1 (current): inert. Mounts a no-op context value. Behavior
 * added in subsequent authorized phases.
 *
 * Mount-order rationale:
 *   - This provider mounts at <Nth layer> because <SCOPE EXPLANATION>.
 *   - It depends on the providers OUTSIDE it: <OUTER PROVIDER LIST>.
 *   - It MUST mount BEFORE the providers INSIDE it: <INNER PROVIDER LIST>.
 *
 * Side-effect imports (if any):
 *   - <SIDE EFFECT IMPORT> — must run before any consumer code touches
 *     <UNDERLYING LIBRARY>. This is the load-order anchor.
 *
 * Rollback: deleting this file removes the seam. Consumers reading
 * the context will receive the no-op default value, which is
 * intentionally a tolerable degradation rather than a crash.
 */

// SIDE-EFFECT IMPORT (MUST BE FIRST when applicable):
// import "../utils/<patch>";

import { type ReactNode } from "react";
import { <CONTEXT_DEFAULT_VALUE>, <ContextName> } from "./<ContextFile>";

export type <ProviderName>ProviderProps = {
  children: ReactNode;
};

export function <ProviderName>Provider({ children }: <ProviderName>ProviderProps) {
  // Phase 1: inert. The default value is a no-op shape that consumers
  // can call safely (e.g. functions return null/undefined; flags are
  // false; arrays are empty). Subsequent phases replace this with a
  // useState/useRef bundle.
  return (
    <<ContextName>.Provider value={<CONTEXT_DEFAULT_VALUE>}>
      {children}
    </<ContextName>.Provider>
  );
}
```

### 4.2 The context file (skeleton)

```tsx
/**
 * <ContextName> — context for <ProviderName>Provider.
 *
 * The default value is intentionally a no-op shape. Consumers reading
 * the context outside the provider OR during the inert Phase 1 receive
 * this default and can call its members safely. This preserves
 * "tolerable degradation" — missing provider does not crash consumers.
 */

import { createContext } from "react";

export type <ContextValue> = {
  // <FIELDS> — typed shapes only. NO methods that perform mutation
  // here at the type level — those should resolve to no-ops in the
  // default value below.
};

export const <CONTEXT_DEFAULT_VALUE>: <ContextValue> = {
  // <FIELD NO-OP DEFAULTS>
};

export const <ContextName> = createContext<<ContextValue>>(<CONTEXT_DEFAULT_VALUE>);
```

### 4.3 The consumer pattern (skeleton)

```tsx
import { useContext } from "react";
import { <ContextName>, type <ContextValue> } from "./<ContextFile>";

export function use<ContextName>(): <ContextValue> {
  return useContext(<ContextName>);
}

// Consumer code:
//   const { someField, someAction } = use<ContextName>();
//   // someAction is safely callable even during Phase 1 inert mount
//   //   — it resolves to the no-op default
```

---

## §5. Failure cases (negative space)

Per relay #25: *"include explicit FAILURE CASES."*

### 5.1 What breaks if providers centralize?

**Symptom:** introducing a generic `createSeamProvider({ name, contextValue, requiresPatches: [...] })` helper that registers providers into a central registry.

**What breaks:**
- Each provider's file-header doctrine (mount-order rationale, side-effect rationale, rollback notes) becomes invisible — buried inside helper config.
- The `import "<patch>"` first-import-line discipline becomes harder to enforce: the patch import lives where the helper lives, not where the provider lives. Pass 281 §11 invariant #3 becomes mechanically unprotected.
- Pass 287's structural test (provider mount order via App.tsx string-snapshot) no longer applies — the order is now data inside the registry, not JSX in App.tsx.
- A future contributor adding a provider goes through registry config rather than App.tsx, losing the "I'm wrapping the whole app" mental signal.
- Reordering providers requires editing registry config, often without re-reading the rationale comments.

**Why it appears tempting:** a helper "removes boilerplate." But the boilerplate IS the doctrine.

### 5.2 What breaks if a provider registry emerges?

**Symptom:** introducing `<ProviderRegistry providers={[ClerkProvider, MapSessionProvider, ...]}>...children...</ProviderRegistry>`.

**What breaks:**
- The ORDER of the array becomes the contract. Reordering the array silently changes mount semantics. Eslint/TypeScript will not catch reorder mistakes.
- React-DevTools tree visibility changes: instead of seeing 4 named provider boundaries in the component tree, you see one `<ProviderRegistry>` with opaque internals.
- Provider-specific props (e.g. `ClerkProvider`'s `publishableKey`) need a generic prop-passing mechanism, which expands the registry's API surface and pulls more provider-specific knowledge into platform-tier code.
- Each provider becomes harder to mock independently in tests.

**Why it appears tempting:** "DRY" — the registry "factors out" the wrapping pattern. But the wrapping pattern is not DRY-able; it's compositional by design.

### 5.3 What breaks if mount order normalizes?

**Symptom:** alphabetizing providers, sorting by file path, or grouping by "type" (data providers, ui providers, etc.).

**What breaks:**
- The semantic asymmetry (auth-outermost, app-innermost) is lost. Code that depends on auth being established before any other state runs may now fail because Auth was alphabetized to the middle of the chain.
- Hydration-timing invariants (Pass 281 §6) silently break. Appearance hydration may run before auth establishment, causing flicker or wrong-mode rendering.
- Teardown-order invariants (Pass 281 §10) silently break. Auth-scoped state may persist after auth tear-down because the unmount order reversed.

**Why it appears tempting:** alphabetical order is "obviously fair" or "code-review-friendly." But the order is semantic.

### 5.4 What breaks if orchestration ownership becomes shared?

**Symptom:** introducing a `useGlobalLifecycle()` hook that "any provider can register cleanup with."

**What breaks:**
- Authority becomes diffuse. When sign-out happens, the cleanup sequence is no longer determined by provider mount order — it's determined by registration order, which is invisible.
- Debugging "why didn't this clean up properly?" requires tracing registration calls scattered across providers.
- The "this provider OWNS its concern" property (§3.4) is lost. Multiple providers can register cleanup on the same key, and the last writer wins silently.

**Why it appears tempting:** centralized cleanup orchestration "feels enterprise." But each provider's cleanup logic IS its identity.

### 5.5 What breaks if provider abstraction hides authority flow?

**Symptom:** wrapping the entire provider chain in an `<AppShellProvider>` that hides the chain.

**What breaks:**
- Reading `App.tsx` no longer reveals what authority chain governs the app. A new contributor sees `<AppShellProvider><AppContent /></AppShellProvider>` and must drill into the helper to discover that auth is involved.
- The Pass 287 mount-order test (string-snapshot of App.tsx) no longer applies; the order is now hidden inside the helper.
- Adding a 5th provider requires editing the helper, which requires understanding the helper's order semantics, which requires reading the same rationale that would have been in App.tsx anyway.

**Why it appears tempting:** "App.tsx is too cluttered." But the clutter IS the architecture diagram.

### 5.6 The compounding failure

Each individual failure mode (§5.1-§5.5) looks recoverable in isolation. The danger is COMPOUNDING:
- Once a `<ProviderRegistry>` exists, alphabetizing the array seems harmless.
- Once mount order is data, registering cleanup centrally seems harmless.
- Once cleanup is centralized, hiding the registry behind an AppShellProvider seems harmless.

By the time a contributor realizes the architecture has lost its authority-flow visibility, recovery requires reverting MULTIPLE changes — and each change had its own justification at the time.

**Anti-pattern detection rule:** if a refactor of provider code claims to "reduce boilerplate" or "improve DRY" or "modernize the pattern," apply Pass 300 §2's anti-extraction lenses BEFORE accepting the change.

---

## §6. The doc-as-extraction philosophy

This doc IS the extraction. There is no `provider-seam.ts` helper. There is no shared `ProviderRegistry`. The skeleton in §4 is meant to be COPIED into each consumer's repo and ADAPTED, not imported.

**Why this is the correct shape:**

- A doc travels well across repos. A helper requires a publishing pipeline, version-pinning, and dependency management.
- A doc cannot accidentally centralize authority. A helper inevitably accretes "while we're here" features.
- A doc forces each consumer to read the rationale before adapting. A helper invites blind import.
- A doc is reversible. Adoption is a reading exercise; non-adoption is a non-event. A helper creates dependency lock-in.

**For BidOnDent:** the existing provider chain (Clerk → MapSession → Appearance → Notification) is its INSTANCE. This doc explains WHY that instance has the shape it has, and what would break if the shape were normalized.

**For Stacey's future site:** copy this skeleton (§4) and adapt it for Stacey's actual needs. Likely much simpler than BidOnDent (no map session, possibly no notification system at v1, possibly different auth choice). The skeleton's INERT-BY-DEFAULT posture means Stacey's v1 can have a 1-provider chain (e.g. `ThemeProvider`) without violating any doctrine.

**For future branded consumers:** same — copy + adapt. Each instance grows according to its own needs. The platform never owns the orchestration.

---

## §7. Connection to existing doctrine

| Existing artifact | Pass 302 relationship |
|---|---|
| `REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md` | BidOnDent INSTANCE; Pass 302 generalizes its philosophy |
| Pass 281 §11 invariants #1 + #3 | Mount-order + first-import-line are the two BidOnDent-INSTANCE invariants this doc generalizes |
| Pass 287 mount-order test | Mechanical enforcement of §3.1 for BidOnDent's instance |
| Pass 293 resize-patch verification | Mechanical evidence that §3.2's first-import-line discipline holds |
| Pass 296 §3.7 | Nominated this artifact as doc-as-extraction (not helper-as-extraction) |
| Pass 299 + Pass 301 | Live extractions that DID NOT touch providers — confirms the doctrine that providers are categorically separate from leaf-primitive extraction |
| Pass 300 anti-extraction discipline | Apply this doc's failure cases (§5) to ANY future "provider-improvement" refactor |
| `LAW_LAYERED_ARCHITECTURE.md` | Providers sit at L4-in-spirit per its model; this doc adds the orchestration-vs-primitive distinction |

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 / #21 / #22 / #23 / #24 / #25 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| Source code | UNTOUCHED (this is a pure-doc pass) |
| `src/platform-core/` folder | UNTOUCHED (still cn.ts + useOnlineStatus.ts + README.md per Pass 301) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |

ZERO new owner-decision points (cumulative remains 31).
ZERO new live extractions (per relay #25 Priority A "STOP live extractions temporarily").

---

## §9. What this pass does NOT do

- No third live extraction (relay #25 Priority A explicit prohibition)
- No source code modification
- No new platform-core files
- No `createSeamProvider()` helper added anywhere
- No `ProviderRegistry` or similar abstraction
- No modification of existing `REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md` (it's the BidOnDent INSTANCE artifact; this doc is its generic philosophical companion)
- No LAW edit (relay #25: REF-tier only)
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §10. Forward triggers

1. **Owner authorizes anti-sprawl REF artifact** → Pass 303 = `REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE.md` per relay #25 Priority C. Concepts already in Pass 300 §2/§6/§7/§9; this artifact would consolidate them as standalone doctrine.
2. **Owner authorizes PMS continuity reconnaissance** → Pass 303+ Priority D (observation only; no extraction; no normalization).
3. **Owner provides Stacey business context** → Pass 303+ Priority E Stacey atmosphere portability reconnaissance (lightweight only).
4. **Owner authorizes hidden-survivability-pressure detection deep-dive** → Pass 303+ Priority F (second-order drift detection).
5. **Future provider-related refactor proposed by ANY agent** → MUST first answer this doc's §5 failure cases. If any failure case applies, the refactor goes to owner-decision territory before execution.

---

## §11. Status

REF doc shipped Pass 302. Audit/doctrine only — no source modification. The provider-seam pattern philosophy is now codified as a platform-tier artifact. The doc-as-extraction approach is operational: future consumers (Stacey, etc.) copy the §4 skeleton and adapt; no shared helper exists or will exist.

**End of doc.**
