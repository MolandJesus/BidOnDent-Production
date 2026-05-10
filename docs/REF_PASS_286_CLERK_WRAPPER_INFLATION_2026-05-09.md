---
status: ACTIVE
authority: REF
scope: pass-286-source-change-evidence
canonical_source_of_truth: REF_PASS_286_CLERK_WRAPPER_INFLATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 286 source-change evidence under owner relay 2026-05-09 #15 priority Item D (Clerk wrapper inflation; identity-authority localization). Continuity-preserving membrane work — NOT abstraction rewrite. Three changes: (1) inflate src/app/hooks/useAuth.tsx wrapper to expose `getToken` method (thin re-export of Clerk useAuth().getToken; preserves exact semantics); (2) update src/app/components/admin/AdminIntakeOperationsPanel.tsx import to use the wrapper instead of direct @clerk/clerk-react; (3) replace `useClerkAuth()` call with `useAuth()` in same file. Net: 6→5 files with direct @clerk/clerk-react imports. Provider mount order untouched per Pass 281 §3 invariant. Auth-boundary timing untouched. Sign-out teardown ordering untouched. Hydration sequencing untouched. Pass 286 explicitly DEFERRED per relay #15 strict-construction: ClerkAccountTypeSelector.tsx (passes raw Clerk user to updateUserMetadata; redirect would require updateUserMetadata signature refactor — abstraction rewrite, out of scope); CTASection.tsx + LandingPageHeader.tsx (have <SignInButton>/<SignUpButton> JSX components — Pass 278 §10 step 5 owner-decision territory); App.tsx ClerkProvider mount (Pass 281 §3 invariant — must stay outermost); hooks/useAuth.tsx import from @clerk/clerk-react (the wrapper itself — by design). Companion evidence doc; NO LAW touched. ZERO new owner-decision points (cumulative remains 31).
last_updated: 2026-05-09
---

# Pass 286 — Clerk Wrapper Inflation (Evidence)

> **Tier:** REF. Source-change evidence document.
> **Authority:** Owner relay 2026-05-09 #15 priority Item D
> ("Clerk wrapper inflation; identity-authority localization;
> continuity-preserving membrane, not abstraction rewrite").
>
> **Pass type:** Multi-file source edit (3 changes across 2 files).
> Continues Pass 282-285 conservative-mechanical pattern.

---

## §1 — Mission

Per relay #15:

> "The objective is NOT 'abstract Clerk.' The objective is:
> localize vendor authority while preserving runtime semantics
> exactly. The wrapper layer must behave as a continuity-preserving
> membrane, not an abstraction rewrite."

Pass 286 inflates the existing `src/app/hooks/useAuth.tsx` wrapper
to expose `getToken`, then redirects ONE callsite that uses it.
Other Clerk import sites are explicitly deferred to preserve
continuity boundaries.

---

## §2 — Edits applied

### §2.1 Edit 1: Inflate useAuth.tsx wrapper

**File:** `src/app/hooks/useAuth.tsx`

**Changes:**
1. File-header doctrine documentation expanded to cover Pass 286
   wrapper-inflation rationale + explicit list of what is NOT
   wrapped (raw user, JSX components, ClerkProvider).
2. Added `useAuth as useClerkAuth` to imports from `@clerk/clerk-react`
   (this is the wrapper file — direct Clerk imports are by design here).
3. Extended `UseAuthReturn` interface with `getToken: () => Promise<string | null>`.
4. Implementation pulls `getToken: clerkGetToken` from `useClerkAuth()`
   and returns it from the wrapper.

**Resulting interface:**
```typescript
export interface UseAuthReturn {
  user: { /* sanitized profile */ } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;  // NEW (Pass 286)
}
```

**Why thin:** `getToken` is a direct re-export of Clerk's
`useAuth().getToken`. No additional retry / caching / error
handling wrapped — those would be abstraction rewrite per
relay #15. Future passes can wrap further if owner authorizes.

### §2.2 Edit 2: Update import in AdminIntakeOperationsPanel.tsx

**File:** `src/app/components/admin/AdminIntakeOperationsPanel.tsx`

**Before:**
```typescript
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
```

**After:**
```typescript
// Pass 286 (2026-05-09): redirected through useAuth wrapper per Pass 278 §10
// step 3-4 thin-wrapper retrofit. getToken() semantics preserved exactly.
import { useAuth } from "../../hooks/useAuth";
```

### §2.3 Edit 3: Update call site

**Before:**
```typescript
const { getToken } = useClerkAuth();
```

**After:**
```typescript
const { getToken } = useAuth();
```

The `getToken` callable is identical (Clerk's getToken passed through
unchanged). All downstream calls — `loadAdminIntakeOperations(getToken)`,
etc. — work with the wrapper-returned getToken identically.

---

## §3 — What was preserved

### §3.1 Vendor coupling reduction

| Metric | Before Pass 286 | After Pass 286 |
| --- | --- | --- |
| Files importing `@clerk/clerk-react` | 6 | 5 |
| Files going through `hooks/useAuth.tsx` wrapper | 2 | 3 |

(useAuth.tsx is itself in both pre- and post counts because its
own import from @clerk is by design.)

### §3.2 Per Pass 281 §11 invariants

| Invariant | Status |
| --- | --- |
| 4-layer provider mount order | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| First-import-line resize-patch (MapSessionProvider) | UNTOUCHED |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards (35/35 covered per Pass 284 baseline) | UNTOUCHED |
| Two intentional :root blocks | UNTOUCHED |
| Pass 282 cadence/easing tokenization | UNTOUCHED |
| Pass 283 blur tokenization | UNTOUCHED |

### §3.3 Per Pass 281 §12 anti-patterns

Zero violations. Specifically NOT done:
- Did NOT add new provider nesting (relay #15 prohibition: "no
  unnecessary provider nesting")
- Did NOT add new orchestration wrappers (relay #15 prohibition:
  "no new orchestration wrappers")
- Did NOT add hydration gates (relay #15 prohibition: "no
  duplicated hydration gates")
- Did NOT add suspense layers (relay #15 prohibition: "no extra
  suspense layers")
- Did NOT introduce a generalized lifecycle manager

The wrapper inflation adds ZERO orchestration depth — it's a
single function-level re-export.

### §3.4 Auth-boundary timing semantics

`getToken` returns the same Promise<string|null> as Clerk's
direct `useAuth().getToken`. Resolution timing identical. Token
refresh behavior identical. No additional async layer introduced.

### §3.5 Sign-out teardown ordering

Pass 281 §10 invariants preserved. AdminIntakeOperationsPanel.tsx
unmounts via React's natural cascade; no change to teardown order.

---

## §4 — What was DEFERRED (per relay #15 strict-construction)

### §4.1 ClerkAccountTypeSelector.tsx

**Why deferred:** the file calls `const { user } = useUser();` and
passes the raw Clerk `user` object to
`updateUserMetadata(user, ...)`. The Clerk user object has
specific Clerk-API methods (e.g., `update()`, `reload()`,
`unsafeMetadata`, etc.) that `updateUserMetadata` depends on.

Wrapping this through the existing useAuth would require either:
- (a) Exposing the raw Clerk user object through the wrapper (defeats
  the wrapper's localization purpose), OR
- (b) Refactoring `updateUserMetadata` to accept a different shape
  (abstraction rewrite — out of scope per relay #15).

Defer to a future pass that explicitly authorizes
`updateUserMetadata` signature refactor.

### §4.2 CTASection.tsx + LandingPageHeader.tsx

**Why deferred:** both files import `<SignInButton>` /
`<SignUpButton>` JSX components from `@clerk/clerk-react`. These
are vendor-bound UI components — different category from hooks.

Pass 278 §10 step 5 explicitly identifies this as owner-decision
territory:
- **Option 1:** wrap as platform-core slot components (e.g.,
  `<AuthSignInSlot>`)
- **Option 2:** accept Tier C app-private boundary (landing
  page is BD-Clerk-bound; do not wrap)

Until owner decides, the files retain direct `@clerk/clerk-react`
imports for the JSX components. Even if their `useUser()` /
`useClerk()` calls were redirected through the wrapper, the file
would still have a direct vendor import — partial redirect adds
inconsistency without reducing the import surface count.

Defer until Step 5 decision.

### §4.3 App.tsx

**Why deferred (intentional):** Pass 281 §3 + §4.1 invariants
require ClerkProvider to mount as the outermost provider. The
provider mount IS the wrapper boundary — no further wrapping
needed at this level.

App.tsx will continue to import `ClerkProvider` and the immediate
provider-mount-related hooks directly. The wrapper is for
component-level usage downstream of the provider.

---

## §5 — Verification

### §5.1 Mechanical verification

```
File: AdminIntakeOperationsPanel.tsx
  @clerk/clerk-react imports remaining: 0 (was 1)
  useAuth wrapper imports added: 1
  Behavioral semantics: getToken signature + return type identical

File: useAuth.tsx
  @clerk/clerk-react imports: 1 (was 1; expanded to include useClerkAuth)
  UseAuthReturn interface: extended with getToken property
  Wrapper function: returns clerkGetToken passthrough

Total @clerk/clerk-react direct imports across src/:
  Before: 6 files (App.tsx, useAuth.tsx, AdminIntakeOperationsPanel.tsx,
                   ClerkAccountTypeSelector.tsx, CTASection.tsx,
                   LandingPageHeader.tsx)
  After:  5 files (App.tsx, useAuth.tsx, ClerkAccountTypeSelector.tsx,
                   CTASection.tsx, LandingPageHeader.tsx)
```

### §5.2 Recommended runtime validation

Per relay #6 + §5 of Pass 281:

1. **Admin intake panel**: navigate to admin intake operations;
   verify data loads (calls `loadAdminIntakeOperations(getToken)`
   internally). If page renders + lists submissions, getToken
   behavior preserved.
2. **Sign-out cascade**: trigger sign-out from any admin page;
   verify React unmount cascade is identical to baseline (no
   new teardown order).
3. **Token refresh**: leave admin page open past Clerk token
   expiry; verify token refresh happens transparently (Clerk
   internals unchanged).

### §5.3 Reverse-revertibility

Pass 286 is fully reversible via `git revert <commit-sha>`.
Reverting:
- Restores AdminIntakeOperationsPanel.tsx direct `@clerk/clerk-react`
  import
- Restores `useClerkAuth()` call
- Removes `getToken` from UseAuthReturn interface
- Removes `useClerkAuth` import from useAuth.tsx

No data migration. No coordination required.

---

## §6 — Forward triggers

1. **Owner decides Step 5 (`<SignInButton>` / `<SignUpButton>` strategy)**
   → unblocks CTASection.tsx + LandingPageHeader.tsx redirect work.
2. **Owner authorizes updateUserMetadata signature refactor**
   → unblocks ClerkAccountTypeSelector.tsx redirect.
3. **Owner authorizes Item E (notification parameterization prep)**
   → next implementation pass per relay #14 menu.
4. **Owner authorizes Phase 1 of Pass 285 harness implementation**
   → vitest structural snapshot tests.
5. **Owner authorizes Item A extension** (39-site cubic-bezier
   mass replace).
6. **Real runtime defect surfaces** (independent lane).
7. **Stacey answers** (Pass 268 §8).

---

## §7 — What this pass DOES NOT do

- Does NOT touch any LAW doc.
- Does NOT touch MOLANDJESUS_DESIGN_DECISIONS.md or CLAUDE.md.
- Does NOT modify `App.tsx` (provider mount unchanged per Pass 281 §3).
- Does NOT modify `ClerkAccountTypeSelector.tsx` (deferred per §4.1).
- Does NOT modify `CTASection.tsx` (deferred per §4.2).
- Does NOT modify `LandingPageHeader.tsx` (deferred per §4.2).
- Does NOT introduce abstraction layers (no retry / caching / error
  wrapping around getToken — pure re-export).
- Does NOT add new provider nesting / orchestration wrappers /
  hydration gates / suspense layers (relay #15 prohibitions).
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT change provider mount order (Pass 281 §3 invariant
  preserved).
- Does NOT change sign-out teardown ordering (Pass 281 §10
  preserved).

---

## §8 — Cross-references

- Pass 285 [`REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md`](REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md) — Pass 286 changes are surface that future Phase 1 harness tests can verify.
- Pass 284 [`REF_PASS_284_REDUCE_MOTION_AUDIT_2026-05-09.md`](REF_PASS_284_REDUCE_MOTION_AUDIT_2026-05-09.md) — reduce-motion audit infrastructure unaffected.
- Pass 283 [`REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md`](REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md) — token surface unaffected.
- Pass 282 [`REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md`](REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md) — cadence/easing tokens unaffected.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) — provider-order invariants preserved.
- Pass 278 [`REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md`](REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md) — §10 step 3 thin-wrapper retrofit recommendation; §10 step 5 SignInButton/SignUpButton strategy deferred.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) §2.3 — original Clerk import inventory.
- Pass 269 §5 — original thin-wrapper recommendation.
- Owner relay 2026-05-09 #15 priority Item D.

---

## §9 — Status

- **Drafted:** 2026-05-09 (Pass 286, identity-authority wrapper inflation).
- **Status:** ACTIVE. Source change applied (3 edits across 2 files). Companion to commit.
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc. Pass 286 source change executed under relay #15 Item D authorization. Future redirect work for ClerkAccountTypeSelector / CTASection / LandingPageHeader requires explicit owner authorization on Step 5 + updateUserMetadata signature.
- **Refines:** Pass 278 §10 step 3-4 by executing the thin-wrapper retrofit on the cleanest callsite + extending UseAuthReturn with getToken.

The Clerk wrapper now exposes `getToken` for downstream callers
who need edge-function authorization tokens. One callsite redirected
(AdminIntakeOperationsPanel). Three callsites deferred per
strict-construction. The wrapper remains a thin continuity-preserving
membrane — no new orchestration depth introduced.
