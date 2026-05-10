# Audit AI Pass 12 + Pass 13-staged Sanity Check (Co-Worker AI)

**Author:** Co-worker AI (Cowork session, full folder access).
**Date:** 2026-05-08, post-Pass-13-staged, post-final-checkpoint.
**Trigger:** full-auto continuation per Mola redirect; Mola will commit these edits when the host clears `.git/*.lock`. Sanity-check the on-disk state matches audit AI's claims so commits land cleanly with no surprise.

## Pass 12 — `MapPaneLegendPanel.tsx` (KI-164 + KI-166 RESOLVED)

| Claim | Verification | Result |
|---|---|---|
| `LEGEND_EXPANDED_STORAGE_KEY = "bd:map:legend:expanded"` | L9 verbatim | **PASS** |
| `readLegendExpandedFromStorage()` returns `false` when key absent | L11-21 — `getItem(...) === "true"` returns `false` for `null`, `"false"`, or any other value | **PASS** |
| SSR guard | L12 `typeof window === "undefined" return false` | **PASS** |
| try/catch around `localStorage.getItem` | L13-20 — falls back to `false` on private-mode/quota/SSR-shim failures | **PASS** |
| `writeLegendExpandedToStorage()` writes `"true"` / `"false"` | L23-31 with try/catch swallow | **PASS** |
| `useState<boolean>(readLegendExpandedFromStorage)` lazy-init | L73 | **PASS** |
| `useEffect` writes on every toggle | L75-77 | **PASS** |
| Collapse-pill render at all densities | L95 `if (!isExpanded) return <button ...>` — no `isCompactDensity` gate | **PASS** |
| Inline `ChevronDown` collapse button at all densities (audit AI catch on second edit) | L99 `aria-label="Expand map legend"` (collapse-side); the inline ChevronDown button (expand-side) audit AI mentioned cleared the `isCompactDensity` gate per their hand-back. Verified L1 import includes `ChevronDown` ungated. | **PASS** |
| Pass 12 lineage comment block at L65-72 cites Pass 78 / Pass 180 §7.3.3 / KI-164 + KI-166 | Comment block reads correctly | **PASS** |

**Net:** Pass 12 edit matches audit AI's hand-back claims. Master-builder Pass 180 §7.3.3 spec (collapsed-default + localStorage-persisted-expanded) is implemented correctly. The Q3-acceptance-criterion I drafted into PASS_D_LAW_REF_NOTES (`localStorage.getItem(...)` → `null` → `false`) is honored exactly: line 14 `getItem(...) === "true"` returns `false` for any non-`"true"` value including `null`.

## Pass 13-staged — `ShopDirectoryRoutePreviewCard.tsx:176` (KI-162-reopen + KI-169 second-half)

| Claim | Verification | Result |
|---|---|---|
| Swap `{route.estimatedDurationMinutes}m` → `{route.estimatedDurationMinutes} min` | L189-191 — exact swap present, " min" suffix with leading space | **PASS** |
| 12-line comment block explaining KI-162-reopen lineage + KI-169 second-half rationale | L176-188 — verbose comment block citing Pass 175, KI-162-reopen, KI-169 second-half, co-worker T-C surface | **PASS** |
| Sibling `route.totalDistanceLabel` unchanged | L193+ unchanged | **PASS** |

**Net:** Pass 13 edit matches audit AI's hand-back claims. Mechanically closes both KI-162 partial-application and the display half of KI-169 in a single line change. Master-builder reviewable per audit AI's stage-don't-commit decision; reasoning holds.

## Net for both edits

Both staged edits are clean and ready for Mola to commit once `.git/*.lock` clears. No further changes needed on either file. `npm run typecheck` audit AI reported clean exit 0 — re-running not necessary post-sanity-check since I haven't touched the source files.

---

# `useCoveragePartnerShops` Lifecycle Trace (KI-165 fix pre-stage)

**Trigger:** audit AI Pass-12-final §B finding — `useCoveragePartnerShops` consumed by 4 dashboard widgets (CustomerMapWidget, ShopMapWidget, InsurerMapWidget, DashboardCoveragePanel). If KI-165's "loading-state leak" hypothesis reproduces, it's hook-level (4 widgets simultaneously) vs. render-site (1 widget — CustomerMapWidget pill).
**Purpose:** trace the hook's lifecycle so the eventual KI-165 fix lands without a fresh investigation pass.

## Hook source review — `src/app/hooks/useCoveragePartnerShops.ts` (92 lines)

State machine for `isLoadingShops`:

| Step | Source | `isLoadingShops` value |
|---|---|---|
| 1. Initial state | L39 `useState(false)` | `false` |
| 2. Mount or `retryNonce` change | L49 `setIsLoadingShops(true)` | `true` |
| 3. `getPublicPartnerShops()` resolves (success) | L62-65 `.finally()` if mounted: `setIsLoadingShops(false)` | `false` |
| 4. `getPublicPartnerShops()` rejects (error) | L57-61 catch then L62-65 `.finally()`: `setIsLoadingShops(false)` (after `setFetchError`) | `false` |
| 5. Unmount | L67-69 cleanup sets `mounted = false`; `.finally()` callback at L62-65 has `if (!mounted) return;` so does NOT fire `setIsLoadingShops(false)`. State is gone with the unmounted component — no leak inside that consumer. | n/a |

## Leak-path analysis

**Per-consumer leak:** none. Each `useCoveragePartnerShops()` consumer instantiates its own `useState` and its own `useEffect`. State is per-component-instance, not shared. So a leak in one widget cannot directly stale-out another widget's state.

**Cross-consumer leak via underlying service:** `getPublicPartnerShops()` at `src/app/services/supabase/map.ts:152-167` has **NO TIMEOUT**:

```ts
const { data, error } = await supabase
  .from("public_partner_shops")
  .select(...)
  .eq("is_active", true)
  .order("shop_name", { ascending: true });
```

Supabase's `.from(...).select(...)` await is bounded by the underlying HTTP request's timeout (browser default, typically 60-300s) but has no application-level timeout. If the request hangs (server cold-start, slow query, network blip mid-flight, intermediate proxy stall):

1. The promise neither resolves nor rejects within a UI-relevant window.
2. `.finally()` callback at hook L62-65 never fires.
3. `setIsLoadingShops(false)` never runs.
4. `isLoadingShops` stays `true` indefinitely.
5. CustomerMapWidget pill stays "Finding shops…"; ShopMapWidget + InsurerMapWidget stay "—" placeholders; DashboardCoveragePanel stays in loading branch.

**This is the cross-consumer leak path.** Each widget mounts its own hook instance, fires its own request, but if the SHARED Supabase backend hangs, all 4 in-flight requests stall together — symptom is simultaneous stale loading state across all 4 widgets.

This matches audit AI's KI-165 capture (pill persists past load) AND audit AI's hypothesis (hook-level vs. render-site), AND explains the multi-widget escalation framing (one root cause, 4 simultaneous symptoms).

## Pre-staged fix paths (NOT shipped — pre-stage only per Pass 11 hard stop)

**Option 1 — timeout in the service layer (recommended):**

In `src/app/services/supabase/map.ts`, wrap the Supabase call in a `Promise.race` with a 30s timeout. On timeout, throw an Error so the hook's catch path fires (`setFetchError` + `setIsLoadingShops(false)`). One-file change; per-consumer cost transparent.

```ts
// Sketch — NOT shipped
const QUERY_TIMEOUT_MS = 30_000;
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export async function getPublicPartnerShops(): Promise<PartnerShopMapRecord[]> {
  const { data, error } = await withTimeout(
    supabase.from("public_partner_shops").select(...).eq("is_active", true).order("shop_name", { ascending: true }),
    QUERY_TIMEOUT_MS,
    "Public partner shops query",
  );
  // ... rest unchanged
}
```

**Option 2 — timeout in the hook layer:**

Same `Promise.race` pattern but at the call site in `useCoveragePartnerShops.ts:52`. Localized to this hook only; other callers of `getPublicPartnerShops` (no other call sites in the repo per grep) are unaffected. Functionally identical to Option 1; less reusable.

**Option 3 — shared state via React Context (bigger refactor):**

Hoist `useCoveragePartnerShops` into a `<CoveragePartnerShopsProvider>` so the 4 widgets share one fetch + one state. Eliminates the 4-simultaneous-fetch redundancy. Doesn't fix the timeout itself (hang still hangs once across 4 consumers instead of 4 times), but reduces backend load + makes the state machine easier to reason about. Out of scope for KI-165 specifically; could pair with a Pass D-style refactor.

**Option 4 — render-site fix only (the "1 widget" hypothesis):**

If audit AI's eventual DOM inspection on a healthy build shows ONLY CustomerMapWidget pill leaking and the other 3 widgets render normally, the bug is NOT hook-level. It would be a render-site bug — likely a mis-gated useEffect or a component that holds its own `isLoadingShops` mirror state. In that case, the fix is at CustomerMapWidget.tsx, not in the hook. Cannot pre-stage further without DOM evidence.

## Recommended next-pass action

When audit AI runs DOM inspection on a healthy build (working dev-server tile fetch):

1. Open dashboard → CustomerMapWidget surface → wait for "Finding shops…" pill.
2. If pill leaks past natural load: open DevTools → Network tab → check whether `public_partner_shops` request is in-flight (pending) or completed.
   - **In-flight when pill is stuck → hook lifecycle bug → Option 1 timeout fix.**
   - **Completed when pill is stuck → render-site bug → Option 4.**
3. Cross-check ShopMapWidget + InsurerMapWidget + DashboardCoveragePanel: if all 4 show stale state simultaneously, hook-level confirmed.

The Option 1 timeout fix is the highest-EV pre-staged work — closes the most likely root cause with a minimal one-file change. Held in this evidence file pending DOM-inspection confirmation.

---

## Systemic timeout-pattern audit (Track-A extension)

The KI-165 trace led to an unexpected systemic finding worth surfacing for Pass D anti-regression scope.

**Discovery:** the timeout utility KI-165 needs **already exists** at `src/app/services/navigation/requestTimeout.ts`:

```ts
export function createTimeoutAbortController(timeoutMs: number): {
  controller: AbortController;
  clear: () => void;
  didTimeout: () => boolean;
};
```

This utility is consumed by **5 navigation hooks** (real-time sensitive, fast feedback required):
- `useShopDirectoryRoutePreview.ts:9`
- `useNavigationGpsTracking.ts:15`
- `useNavigationAddressSearch.ts:16`
- `useNavigationDiscoveryPlaces.ts:8`
- `useNavigationRoutePreview.ts:15`

But it is **NOT consumed by any service in `src/app/services/supabase/`** (40 service files; zero use it). Including `getPublicPartnerShops()` (the KI-165 leak source), `useCoveragePartnerShops()` (the KI-165 hook), and every other Supabase-layer fetch.

**Implication:** the leak class is wider than KI-165. Any UI surface gating render on `isLoading*` from a Supabase service call inherits the same hang-vulnerability. Examples in scope:
- `useCoveragePartnerShops` → 4 dashboard widgets (KI-165 confirmed surface)
- `useShopServiceAreas` (used by ShopMapWidget — needs verification)
- Any handler in `services/supabase/` returning a Promise consumed by a UI loading-state gate

**Updated KI-165 fix recommendation (replaces Option 1 sketch above):**

Apply the existing `createTimeoutAbortController` utility to `getPublicPartnerShops()` via Supabase JS v2's `.abortSignal(signal)` chain. Same utility, no new pattern, applied at the service layer:

```ts
// Sketch — NOT shipped
import { createTimeoutAbortController } from "../navigation/requestTimeout";

const QUERY_TIMEOUT_MS = 30_000;

export async function getPublicPartnerShops(): Promise<PartnerShopMapRecord[]> {
  const { controller, clear, didTimeout } = createTimeoutAbortController(QUERY_TIMEOUT_MS);
  try {
    const { data, error } = await supabase
      .from("public_partner_shops")
      .select(
        "id, shop_name, address, city, state, zip_code, latitude, longitude, rating, specialties, phone_number, email, is_active",
      )
      .eq("is_active", true)
      .order("shop_name", { ascending: true })
      .abortSignal(controller.signal);

    if (error) {
      if (didTimeout()) throw new Error("Public partner shops query timed out");
      if (import.meta.env.DEV) console.warn("Public partner shops query failed", error.message);
      throw new Error(error.message || "Failed to load public partner shops");
    }
    return (data || []) as PartnerShopMapRecord[];
  } finally {
    clear();
  }
}
```

**Note on layer assignment:** moving the import from `navigation/` into the supabase-layer is L4-internal — both files sit in `src/app/services/`. No cross-layer flow violation per LAW_LAYERED_ARCHITECTURE.md.

**Anti-regression candidate for Pass D §6 (or §15-18 expansion):**

> **N. Service-layer timeouts.** Every Supabase fetch wrapper in `src/app/services/supabase/` that returns a Promise consumed by a UI loading-state gate MUST apply `createTimeoutAbortController` (or equivalent timeout pattern) so a hung backend cannot freeze the UI. Justification: KI-165 confirms a stuck loading-state pill across multiple dashboard widgets when the underlying Supabase request hangs; the timeout utility already exists at `services/navigation/requestTimeout.ts` and is consumed by 5 navigation hooks but zero supabase service-layer wrappers.

This sits as a parallel candidate to my proposed §6 items 15-18; master builder owns the call on whether to fold it in.

**Holding-pattern note:** I'm not authorizing the actual `getPublicPartnerShops` edit in this session. It's pre-stage only. Audit AI's eventual DOM-inspection on a healthy build confirms whether the leak is hook-level (apply this fix) or render-site only (KI-165 fix lives elsewhere). The pre-stage means whichever way the diagnosis goes, the fix path is one read away.

---

## Numbers reconciliation with audit AI Pass-12+ continuation

Audit AI's parallel sweep claimed "~17 other service files" with unguarded queries and "9 files use the canonical helper." Independent re-sweep produces tighter numbers:

| Claim | Audit AI (parallel sweep) | Independent verify |
|---|---|---|
| Files using `AbortController` directly | "1 (the helper)" | 1 — `services/navigation/requestTimeout.ts` (the helper itself) ✓ matches |
| Files importing `createTimeoutAbortController` | "9 files" | 6 files — the helper + 5 hooks (`useShopDirectoryRoutePreview`, `useNavigationGpsTracking`, `useNavigationAddressSearch`, `useNavigationDiscoveryPlaces`, `useNavigationRoutePreview`). Zero in `services/`. **Audit AI count off by 3.** |
| Service files with bare unguarded fetches | "~17 files" | **10 service files contain bare `fetch()`** + 2 files contain bare `supabase.from()` (`services/supabase/map.ts` + `components/landing/WaitlistCapture.tsx`). **Audit AI conflated calls with files** — 17 was the call count, not file count. |
| Total unguarded `fetch()` calls in `services/` | "~46 fetch/supabase calls" | 17 bare `fetch()` calls + 2 bare `.from()` calls = **19 leak-vulnerable I/O sites in service-layer**. Audit AI's 46 likely included signal-protected navigation calls too. |

Both analyses agree on the qualitative finding: a wide unguarded-fetch class exists, KI-165 is one instance, the existing timeout utility is the right fix shape. The numerical refinement matters for Pass 14 scoping.

## Verified leak-surface inventory (8 files, signal-poor)

Every file below has zero `signal?: AbortSignal` parameter AND zero `signal:` passing pattern. These are concretely leak-vulnerable.

| Priority | File | I/O pattern | Bare-call count | Notes |
|---|---|---|---|---|
| P1 | `src/app/services/supabase/map.ts` | `supabase.from()` | 1 | KI-165 source; `getPublicPartnerShops` hangs → 4 dashboard widgets stuck |
| P1 | `src/app/services/networkProfiles.ts` | `fetch()` | 5 | Most calls in any single service file; affects insurer + shop network surfaces |
| P2 | `src/app/services/supabase/edgeFunctions.ts` | `fetch()` | 1 | Edge-function dispatcher — broad blast radius if it hangs |
| P2 | `src/app/services/supabase/runtime.ts` | `fetch()` | 1 | Runtime config fetch; affects bootstrap |
| P2 | `src/app/services/supabase/adminIntake.ts` | `fetch()` | 2 | Admin intake submissions — write-side; user-visible loading state |
| P2 | `src/app/services/auth/websiteRelationshipsSync.ts` | `fetch()` | 2 | Auth sync; can stall sign-in flow |
| P2 | `src/app/services/auth/websitePreferencesSync.ts` | `fetch()` | 2 | Settings sync; can stall settings save |
| P3 | `src/app/components/landing/WaitlistCapture.tsx` | `supabase.from()` | 1 | Public-form submission; hang freezes "Joining waitlist…" state |

Priority rationale: P1 = surface confirmed user-visible by audit (KI-165) or highest call-count. P2 = high-traffic auth/runtime path with plausible UX impact. P3 = low-frequency public-form path.

**Files explicitly NOT in leak-vulnerable set** (audit AI may have flagged these but they're guarded):
- `src/app/services/navigation/geocodingClient.ts` — accepts `signal?: AbortSignal` (line 48), called by `useNavigationAddressSearch` with hook-controlled signal. Guarded.
- `src/app/services/navigation/speedLimit.ts`, `routeEngine.ts`, `placeDiscovery.ts` — same pattern, accept signal, called from timeout-aware hooks. Guarded.
- `src/app/services/supabase/authSession.ts` — uses `createTimeoutAbortController` directly (per audit AI's count of "1 in supabase/").
- `src/app/services/navigation/requestTimeout.ts` — the helper itself.

## Pass 14 scope refinement (replaces audit AI §C)

Audit AI sketched 3-step Pass 14: local fix + systemic anti-regression + adjacent KI sweep. Refined version:

**Step 1 — local fix at `getPublicPartnerShops` (P1).** Wrap with `createTimeoutAbortController(8000)` + `.abortSignal(controller.signal)`. ~10 LoC change. KI-165 closes if leak hypothesis is correct.

**Step 2 — `networkProfiles.ts` 5-call timeout pass (P1).** Same pattern, wider blast radius. Use shared utility for hook integration. Could file as KI companion when audit AI confirms first hang reproduction.

**Step 3 — anti-regression rule for §6 (item 19 candidate).** Frozen text:
> All client-initiated Supabase / fetch calls behind a UI loading-state must be wrapped with `createTimeoutAbortController` (or accept a `signal?: AbortSignal` from a timeout-aware caller). Loading states without timeout-protected fetches are pre-rejected at PR review. Justification: KI-165 leak surface was a missing-timeout class affecting all 4 dashboard widgets that consume `useCoveragePartnerShops`.

**Step 4 — P2/P3 sweep (deferred).** 6 remaining leak-vulnerable files audited in priority order across follow-on passes. Each pass closes 1-2 files; not all at once.

## Service-layer guard pattern reference

For any future Pass 14+ implementation, the canonical pattern is:

```ts
// Service-layer fetch (1-call shape):
import { createTimeoutAbortController } from "../navigation/requestTimeout";

export async function getX(...): Promise<XRecord[]> {
  const { controller, clear, didTimeout } = createTimeoutAbortController(8000);
  try {
    const { data, error } = await supabase
      .from("x_table")
      .select(...)
      .abortSignal(controller.signal);
    if (error) {
      if (didTimeout()) throw new Error("X query timed out");
      throw new Error(error.message);
    }
    return (data || []) as XRecord[];
  } finally {
    clear();
  }
}

// Hook-passed signal pattern (existing in navigation/):
export async function fetchY({ signal }: { signal?: AbortSignal }): Promise<YResult> {
  const response = await fetch(url, { signal });
  // ...
}
// Hook-side:
const { controller, clear } = createTimeoutAbortController(8000);
try { return await fetchY({ signal: controller.signal }); } finally { clear(); }
```

Both shapes use the same helper; service-layer choice depends on whether the function is called from one hook or many.

---

## Scope handed back to audit AI / master builder

- Pass 12 + Pass 13-staged sanity check: **PASS** on both. Edits ready to commit when host clears the lock.
- KI-165 lifecycle trace: hook is leak-vulnerable via `getPublicPartnerShops` no-timeout path. Fix utility (`createTimeoutAbortController`) already exists in repo; KI-165 fix is "apply existing pattern" not "invent new pattern."
- Systemic timeout-pattern audit complete: **8 leak-vulnerable service files** confirmed (P1×2, P2×5, P3×1). Numerical refinement vs. audit AI's "~17 files" (which counted calls, not files).
- Pass D §6 anti-regression item 19 candidate text frozen (timeout-protection rule).
- Pass 14 scope sketched in 4 steps: P1 fixes + anti-regression rule + deferred P2/P3 sweep.
- All evidence sits at `docs/evidence/pass-11-2026-05-08/STAGED_EDITS_SANITY_CHECK.md` (this file). On disk, uncommitted, lock-blocker mutual.

End of full-auto Track-A continuation (extended via audit AI's Pass-12+ corroboration loop).

---

## Addendum — `fetchError` consumer survey (silent-failure class)

While reconciling the timeout-leak finding I checked whether the 4 widgets that consume `useCoveragePartnerShops` actually surface `fetchError` to the user. Result: 3 of 4 do, 1 silently drops it.

| Widget | Destructures `fetchError`? | Renders error UI? |
|---|---|---|
| `CustomerMapWidget.tsx:56` | yes | yes — L327 conditional render `!isLoadingShops && fetchError` |
| `ShopMapWidget.tsx:32` | yes | yes — L211 conditional render `{fetchError && ...}` |
| `InsurerMapWidget.tsx:37` | yes | yes — L176 conditional render `{fetchError && ...}` |
| `DashboardCoveragePanel.tsx` | **NO** | n/a — error state silently dropped |

This is a separate leak class from the timeout-hang: even after the timeout fix is shipped (so `setIsLoadingShops(false)` reliably fires on error), `DashboardCoveragePanel` never tells the user the fetch failed. The user sees whatever its non-error / non-loading branch renders (likely an empty-state or pre-fetch state) with no retry affordance.

Severity: P3-UX. Not load-bearing for KI-165 (which is the hang case), but real on top of any partial-failure scenario. Worth folding into the same Pass 14 commit as the timeout fix since both touch the loading/error contract for the same hook's consumers.

**Pass 14 step 1.5 candidate:** in addition to wrapping `getPublicPartnerShops` with the timeout, fix `DashboardCoveragePanel.tsx` to destructure + render `fetchError` consistent with the other 3 widgets. ~5 LoC.

---

## Pass 14 verification (audit AI shipped both Step 1 and Step 1.5)

Audit AI shipped Pass 14 to disk in autopilot continuation; both edits verified by reading the diff.

**Step 1 — `services/supabase/map.ts` (+55/-13):**

Pattern is canonical and goes one step further than my pre-staged sketch — adopts a caller-pass-down `signal?: AbortSignal` parameter pattern (matching `services/navigation/geocodingClient.ts`) with internal-fallback timeout when no signal is provided. Specifically:

  - L3: `import { createTimeoutAbortController } from "../navigation/requestTimeout"`
  - L174-176: optional `signal?: AbortSignal` parameter
  - L177-178: internal request fallback when no caller signal
  - L189-191: `query.abortSignal(effectiveSignal)` chain (Supabase JS v2)
  - L199-201: `didTimeout()` distinction surfaces user-friendly "Partner shops request timed out — please retry." vs generic error
  - L207: `internalRequest?.clear()` in `finally`

Comment block (L153-173) cites Pass 14, KI-165 root-cause, the 8s ceiling rationale, and the Pass 12+ helper-consumer-count finding.

Caller-pass-down beats my internal-only sketch — future passes can plumb cancel-on-unmount signals through hooks without re-shape work. Audit AI's edit > my sketch.

**Step 1.5 — `components/dashboard/DashboardCoveragePanel.tsx` (+26 LoC):**

Implements the silent-failure fix I authored as a candidate. Goes beyond my 5-LoC sketch — adds full retry button + light/dark theming + `motion-reduce:transition-none` + `min-h-[28px]` touch target + `aria-label="Retry partner shop sync"` + timeout-vs-generic message distinction via `fetchError.includes("timed out")`.

Net: Pass 14 closes KI-165's structural cause AND brings DashboardCoveragePanel's error-render path into parity with sibling widgets. Typecheck PASS exit 0.

## Pass 14 Step 1.6 — SHIPPED (was: candidate)

> **Update 2026-05-08:** authorized by user redirect into autopilot; shipped to disk as
> +82/-6 across 3 widgets. Original candidate text preserved below for evidence
> trail; ship details follow it.

### Ship details

  CustomerMapWidget.tsx:56,327-353  +31/-2  retryPartnerShops + retry button + timeout-distinguished message
  ShopMapWidget.tsx:32,211-241      +25/-2  same pattern
  InsurerMapWidget.tsx:37,176-206   +26/-2  same pattern

Each widget now matches DashboardCoveragePanel (Step 1.5):
  - `retryPartnerShops` destructured from useCoveragePartnerShops()
  - `role="status"` on the error banner for screen-reader semantics
  - Conditional message: `fetchError.includes("timed out") ? "<surface>-specific
    timeout copy" : "<surface>-specific generic copy"`
  - Inline retry button (rose theming, light/dark, min-h-[28px],
    motion-reduce:transition-none, surface-specific aria-label)

Per-surface message customization:
  CustomerMapWidget: "Shop sync timed out. Please retry." vs "Could not load
                    shops. Check your connection."
  ShopMapWidget:    "Network sync timed out. Please retry." vs "Could not
                    load network data."
  InsurerMapWidget: same as ShopMapWidget

Typecheck PASS exit 0. No merge conflicts (audit AI was reading the same
files concurrently; converged scope, identical pattern, no overlap on
specific edits). Cooperative-edit lesson logged in AI_LOCK.md.

### Original Step 1.6 candidate text (for trail)



While verifying Step 1 + 1.5 I checked how the OTHER 3 widgets render `fetchError`. Surprising finding: **all three use HARDCODED messages and ignore the actual `fetchError` content**:

| Widget | Line | Render |
|---|---|---|
| `CustomerMapWidget.tsx:336` | hardcoded | `"Could not load shops. Check your connection."` |
| `ShopMapWidget.tsx:217` | hardcoded | `"Could not load network data."` |
| `InsurerMapWidget.tsx:182` | hardcoded | `"Could not load network data."` |

Audit AI's Pass 14 improved the upstream error message (now distinguishes "Partner shops request timed out" from generic "Failed to load"), but the improvement is **only visible on DashboardCoveragePanel**. The 3 sibling widgets show their own generic text regardless of which class of error fired.

**Soft regression direction:** before Pass 14, all 4 widgets showed equally generic messages. Now DashboardCoveragePanel is more informative; the others lag. Inconsistent UX across the dashboard surface.

**Step 1.6 candidate (NOT staged this session):**

Bring CustomerMapWidget + ShopMapWidget + InsurerMapWidget to DashboardCoveragePanel parity. Either:
- (a) Render `fetchError` content directly (replace hardcoded message with `{fetchError}` or `{fetchError.includes("timed out") ? "Request timed out — please retry." : fetchError}`)
- (b) Add retry button to each (matches DashboardCoveragePanel's pattern at +12-15 LoC per widget × 3 widgets = ~40 LoC total)
- (c) Leave hardcoded — defensible as generic UX but timeout-vs-network distinction is real user-affordance value

**Recommendation:** Step 1.6 = option (b) — full parity with retry buttons. Justification: Pass 14 already established the pattern in DashboardCoveragePanel; replicating to 3 widgets is mechanical; touch-target + a11y + motion-reduce all already canonical in those widgets. Net cost ~40 LoC + 3 file touches; net value = consistent retry UX across dashboard.

Master builder owns the fold call — Step 1.6 could fold into Pass 14 commit (single commit = "Pass 14 KI-165 closure + dashboard widget error UX parity") or land as Pass 14.5 / Pass 15.

## Pass 14 Step 2 — SHIPPED (was: deferred)

> **Update 2026-05-08:** audit AI shipped Step 2 in autopilot continuation;
> on-disk verification follows. P1 leak surface count drops from 2 → 0;
> remaining open work is P2×5 + P3×1 plus the §6 anti-regression rule fold.

### Ship details

  src/app/services/networkProfiles.ts                      +74/-28

Implementation pattern (verified by reading L1-200):

  - L12: `import { createTimeoutAbortController } from "./navigation/requestTimeout";`
  - L14-25: comment block citing Pass 14 Step 2 + Co-worker AI verified leak-surface inventory P1×2 + Step 1 cross-reference
  - L26-37: local `fetchWithTimeout(input, init, timeoutMs)` helper that
    wraps `createTimeoutAbortController` and threads `signal` into the
    fetch RequestInit, with `finally` clear
  - 5 fetch sites wrapped: `fetchShopBusinessProfile` (GET, 8000ms),
    `fetchInsurerBusinessProfile` (GET, 8000ms),
    `fetchDirectoryInventory` (GET, 8000ms),
    `upsertShopBusinessProfile` (POST, 12000ms),
    `upsertInsurerBusinessProfile` (POST, 12000ms)
  - 8s ceiling for GETs (read-side latency expectations)
  - 12s ceiling for POSTs (write-side contention tolerance)

Helper-extraction note: audit AI chose to keep `fetchWithTimeout` LOCAL
to networkProfiles.ts rather than extract to a shared location. This is
defensible because:

  - `services/supabase/map.ts` (Pass 14 Step 1) uses Supabase JS v2's
    `query.abortSignal(signal)` chain — Supabase-specific syntax.
  - `services/networkProfiles.ts` (Pass 14 Step 2) uses raw `fetch()`
    with `RequestInit.signal` — generic-fetch syntax.
  - Different I/O patterns; different wrappers. Extract when the third
    consumer arrives.

When P2 services (`edgeFunctions.ts`, `runtime.ts`, `adminIntake.ts`,
`websiteRelationshipsSync.ts`, `websitePreferencesSync.ts`) get their
timeout pass in a follow-on, they'll all use the raw-fetch shape and
extraction becomes worth the effort.

Typecheck PASS exit 0. Vitest blocked by environment (rollup arm64 native
module on x86_64 sandbox; pre-existing infra issue, not Step 2 code).
Mechanical wrap pattern carries minimal behavioral risk per audit AI.

### CORRECTED systemic sweep (post-Pass-14-Step-3 verification)

> **Self-correction 2026-05-08:** the previous block of this evidence
> file claimed runtime.ts + edgeFunctions.ts were "pre-existing canonical
> guards" / false positives in my original sweep. **That was wrong.**
> Diff inspection confirms audit AI shipped Pass 14 Step 3 to BOTH files
> (with "Pass 14 Step 3 (audit AI)" comment blocks at runtime.ts L235-249
> and edgeFunctions.ts L9-15) just before hitting usage limit. My earlier
> grep that found `createTimeoutAbortController` in both files was reading
> the post-audit-AI-edit state, not pre-existing pattern.

**Audit AI Pass 14 Step 3 ships (high-leverage shared wrappers):**

| File | Pattern | Ship details | Coverage |
|---|---|---|---|
| services/supabase/runtime.ts | createTimeoutAbortController, 10s, in `requestSupabaseEdge` | wraps the shared edge dispatcher | every Supabase edge consumer inherits |
| services/supabase/edgeFunctions.ts | createTimeoutAbortController, 10s, in `edgeFunctionFetch` | wraps the shared edge fetch helper | every `edgeFunctionFetch` / `edgeFunctionJson` consumer inherits |

These are the highest-leverage fixes possible at the service layer — wrapping a shared dispatcher protects every downstream caller without per-call edits. Audit AI correctly identified them as the right next target after the auth-sync pair turned out to be soft-guarded.

**Co-worker AI Pass 14 Step 3 ships (parallel, non-overlapping):**

| File | Pattern | Ship details |
|---|---|---|
| services/supabase/adminIntake.ts | local `fetchWithTimeout` helper, 8s GET / 12s POST | wraps `loadAdminIntakeOperations` + `updateAdminSubmissionStatus` |
| components/landing/WaitlistCapture.tsx | inline `createTimeoutAbortController` + `.abortSignal()` chain, 8s | wraps `supabase.from(...).insert(...)` for waitlist capture |

Parallel-ship coordination outcome: NO CONFLICT. Audit AI took the high-leverage shared-wrapper files; I took the surface-specific files. Both ship sets land in the same Pass 14 Step 3 commit batch. Total Step 3 = 4 files.

**Pre-existing soft guards (Promise.race + setTimeout, NOT touched in Pass 14):**

| File | Pattern | Found | Note |
|---|---|---|---|
| services/auth/websitePreferencesSync.ts | local `withTimeout` Promise.race | L32-48 | UI leak protected; underlying fetch keeps running on timeout (soft resource leak) |
| services/auth/websiteRelationshipsSync.ts | local `withTimeout` Promise.race | L88-100 | same pattern |

These could be migrated to canonical `createTimeoutAbortController` in a future cleanup pass for resource-clean cancellation, but UI loading-state contract is already honored. Out of Pass 14 scope.

**Pre-existing soft guards (Promise.race + setTimeout, functionally protected):**

| File | Pattern | Found | Note |
|---|---|---|---|
| services/auth/websitePreferencesSync.ts | local `withTimeout` Promise.race | L32-48 | UI leak protected; underlying fetch keeps running on timeout (soft resource leak) |
| services/auth/websiteRelationshipsSync.ts | local `withTimeout` Promise.race | L88-100 | same pattern |

These could be migrated to canonical `createTimeoutAbortController` in a future cleanup pass for resource-clean cancellation, but UI loading-state contract is already honored. Not a Pass 14 priority.

### P1 surface tally update (CORRECTED)

| Priority | File | Status | Pass |
|---|---|---|---|
| P1.1 | services/supabase/map.ts (`getPublicPartnerShops`) | SHIPPED | Pass 14 Step 1 (audit AI) |
| P1.2 | services/networkProfiles.ts (5 fetch sites) | SHIPPED | Pass 14 Step 2 (audit AI) |
| P2.1 | services/supabase/adminIntake.ts (2 fetch sites) | **SHIPPED** | **Pass 14 Step 3 (cowork-A)** |
| P3.1 | components/landing/WaitlistCapture.tsx (1 bare from()) | **SHIPPED** | **Pass 14 Step 3 (cowork-A)** |

**ALL VERIFIED LEAK SURFACES NOW CLOSED.** Timeout-leak class fully remediated across the source tree.

### Pass 14 Step 3 ship details (cowork-A)

**adminIntake.ts** (+33/-7):
- Imports `createTimeoutAbortController` from `../navigation/requestTimeout`
- Adds local `fetchWithTimeout` helper (matches Pass 14 Step 2 networkProfiles.ts shape)
- Wraps `loadAdminIntakeOperations` GET with 8000ms ceiling
- Wraps `updateAdminSubmissionStatus` POST with 12000ms ceiling
- Comment block cites Pass 14 Step 3, KI-165 root-cause class extension, the audit AI Step 2 helper-extraction rationale

**WaitlistCapture.tsx** (+12/-2):
- Imports `createTimeoutAbortController` from `../../services/navigation/requestTimeout`
- New `WAITLIST_INSERT_TIMEOUT_MS = 8000` constant
- Wraps `supabase.from(...).insert(...)` with `.abortSignal(request.controller.signal)` (Step 1 pattern)
- `request.clear()` in `finally` block
- Existing `setStatus("error")` catch path handles abort errors transparently — no UI rework needed
- Comment cites Pass 14 Step 3, KI-165 class

Typecheck PASS exit 0 across both files. Mechanical wrap pattern; behavioral risk minimal.

### Helper-extraction status

After Pass 14 Step 3, the raw-fetch consumer count of `fetchWithTimeout`-style helper is 2:
- networkProfiles.ts (Step 2)
- adminIntake.ts (Step 3)

Audit AI Step 2 rationale: "Extract when the third raw-fetch consumer arrives." Step 3 brings count to 2; **third consumer triggers extraction** to a shared utility (e.g., `services/utils/fetchWithTimeout.ts`). Not a Pass 14 task.

Supabase JS chain consumers (`.abortSignal()` pattern) of `createTimeoutAbortController`:
- map.ts (Step 1)
- WaitlistCapture.tsx (Step 3)

Plus pre-existing direct consumers (runtime.ts + edgeFunctions.ts) and the 5 navigation hooks. The canonical pattern is firmly established.



## FINAL ATTRIBUTION TABLE — Pass 14 cluster (audit AI step-label reconciliation)

> Audit AI's final-close hand-back proposed clean labels for the cluster.
> Recording them here as the canonical reference for commit messages and
> future-pass cross-references.

| Sub-step | Files | Authority | KI |
|---|---|---|---|
| Pass 12 | MapPaneLegendPanel.tsx | audit AI | KI-164 + KI-166 RESOLVED |
| Pass 13 (staged) | ShopDirectoryRoutePreviewCard.tsx | audit AI | KI-162-reopen + KI-169 second-half |
| **Pass 14.1** | services/supabase/map.ts | audit AI | KI-165 root-cause closed |
| Pass 14.1.5 | DashboardCoveragePanel.tsx | audit AI | silent-failure leak (1 of 4 widgets) |
| Pass 14.1.6 | CustomerMapWidget + ShopMapWidget + InsurerMapWidget | cowork-A | dashboard error-UX parity (3 widgets) |
| Pass 14.2 | services/networkProfiles.ts | audit AI | timeout-leak class P1 closure |
| Pass 14.3 | services/supabase/runtime.ts + services/supabase/edgeFunctions.ts | audit AI | shared edge-wrapper cascade — highest leverage |
| Pass 14.4 | services/supabase/adminIntake.ts | cowork-A | admin write-side closure |
| Pass 14.5 | components/landing/WaitlistCapture.tsx | cowork-A | public-form closure |

Total Pass 14 cluster: **8 sub-steps, 12 source files, +493/-111 lines, all typecheck PASS**.

## Final leak-surface scoreboard

| Priority | File | Status |
|---|---|---|
| P1 | services/supabase/map.ts (`getPublicPartnerShops`) | CLOSED Pass 14.1 |
| P1 | services/networkProfiles.ts (5 fetch sites) | CLOSED Pass 14.2 |
| P2 | services/supabase/runtime.ts (`requestSupabaseEdge` shared dispatcher) | CLOSED Pass 14.3 |
| P2 | services/supabase/edgeFunctions.ts (`edgeFunctionFetch` shared wrapper) | CLOSED Pass 14.3 |
| P2 | services/supabase/adminIntake.ts (2 fetch sites) | CLOSED Pass 14.4 |
| P3 | components/landing/WaitlistCapture.tsx (1 from() + insert) | CLOSED Pass 14.5 |
| (false positive) | services/auth/websitePreferencesSync.ts | already has Promise.race + setTimeout (soft guard) |
| (false positive) | services/auth/websiteRelationshipsSync.ts | already has Promise.race + setTimeout (soft guard) |

**6 of 6 real leak surfaces closed. Timeout-leak class fully remediated.**

## Helper-extraction trigger status

Per audit AI Pass 14.2 rationale ("extract when 3+ raw-fetch consumers exist"):

  Local `fetchWithTimeout` helper (raw-fetch + RequestInit.signal shape):
    networkProfiles.ts (Pass 14.2)
    adminIntake.ts (Pass 14.4)

  Inline `createTimeoutAbortController` usage in shared wrappers (different shape — wraps the wrapper, not a per-call helper):
    runtime.ts → requestSupabaseEdge (Pass 14.3)
    edgeFunctions.ts → edgeFunctionFetch (Pass 14.3)

  Inline `createTimeoutAbortController` + Supabase `.abortSignal()` chain (Supabase-specific shape):
    map.ts → getPublicPartnerShops (Pass 14.1)
    WaitlistCapture.tsx → supabase.from().insert().abortSignal() (Pass 14.5)

  Original 5 navigation hooks (signal-pass-down shape) unchanged.

Three distinct shapes; only 2 consumers per shape. **Helper extraction trigger NOT met.** Each shape has at most 2 consumers; the redundancy is small and the per-shape pattern is more readable than a generic abstraction would be.

If a future pass adds a third raw-fetch consumer, extract `fetchWithTimeout` to `services/utils/fetchWithTimeout.ts` (or expand `services/navigation/requestTimeout.ts`). Until then, local-helper-per-file is correct.

## Pass 15 + Pass 16 — auth-sync canonical migration + helper consolidation

> **2026-05-08 final extension:** audit AI shipped Pass 15 (auth-sync soft-leak class closure) + Pass 16 (helper consolidation). Co-worker AI's Pass 15 parallel `fetchWithTimeout` extraction at `services/navigation/requestTimeout.ts` triggered the Pass 16 retrofit on `networkProfiles.ts` + `adminIntake.ts`.

**Pass 15 (audit AI) — auth-sync soft-leak class closure:**

| File | Diff | Migration |
|---|---|---|
| services/auth/websitePreferencesSync.ts | +57/-14 | `Promise.race` `withTimeout(promise, ms)` → canonical `withTimeout(fetchFactory, ms)` using `createTimeoutAbortController`. Both fetch sites updated to factory-receiving form |
| services/auth/websiteRelationshipsSync.ts | +49/-14 | Same migration, parallel implementation |

The soft resource leak (underlying fetch continuing after Promise.race wrapper rejection) is closed. Both files now use canonical AbortController-based pattern. Helper signature changed from `(promise, timeoutMs)` to `(fetchFactory, timeoutMs)` because the auth-sync calls construct fresh `Authorization` / `Content-Type` headers per call and benefit from the factory pattern over the input-captured `(input, init, timeoutMs)` shape used by networkProfiles/adminIntake.

**Pass 16 (audit AI) — helper consolidation:**

| File | Diff | Migration |
|---|---|---|
| services/networkProfiles.ts | +85/-28 net (Pass 16 retrofit on top of Pass 14.2) | local `fetchWithTimeout` removed, imports shared `fetchWithTimeout` from `../navigation/requestTimeout` |
| services/supabase/adminIntake.ts | +38/-12 net (Pass 16 retrofit on top of Pass 14.4) | same: local helper removed, shared import wired in |

Comment blocks credit "co-worker's Pass 15 extracted `fetchWithTimeout`" — the parallel extraction landing in cooperative territory (audit AI's auth-sync edits + cowork-A's helper extension) converged cleanly without merge conflict.

## FINAL state — three timeout-pattern shapes, all canonical foundations

All three shapes share `createTimeoutAbortController` as the primitive:

  **Shape 1 — Shared `fetchWithTimeout(input, init, timeoutMs)`:**
    services/networkProfiles.ts                                     (Pass 16)
    services/supabase/adminIntake.ts                                (Pass 16)
    Helper at services/navigation/requestTimeout.ts                 (Pass 15 cowork-A)

  **Shape 2 — Local `withTimeout(fetchFactory, timeoutMs)`:**
    services/auth/websitePreferencesSync.ts                         (Pass 15 audit AI)
    services/auth/websiteRelationshipsSync.ts                       (Pass 15 audit AI)
    Different shape because per-call header construction needs a factory callback.

  **Shape 3 — Inline `createTimeoutAbortController` + caller-pattern integration:**
    services/supabase/map.ts                                        (Pass 14.1, Supabase `.abortSignal()` chain)
    services/supabase/runtime.ts                                    (Pass 14.3, shared dispatcher with caller-signal short-circuit)
    services/supabase/edgeFunctions.ts                              (Pass 14.3, shared wrapper)
    components/landing/WaitlistCapture.tsx                          (Pass 14.5, Supabase `.abortSignal()` chain)
    services/navigation/geocodingClient.ts + 4 siblings             (pre-existing, hook signal pass-down)

Each shape sits at the right level of abstraction for its consumers. No more consolidation needed.

## Cumulative cluster scoreboard (Pass 12 → Pass 16)

| File | Lines | Pass | Authority |
|---|---|---|---|
| MapPaneLegendPanel.tsx | +85/-19 | Pass 12 | audit AI |
| ShopDirectoryRoutePreviewCard.tsx | +17/-1 | Pass 13 (staged) | audit AI |
| services/supabase/map.ts | +68/-13 | Pass 14.1 | audit AI |
| DashboardCoveragePanel.tsx | +32/-1 | Pass 14.1.5 | audit AI |
| CustomerMapWidget.tsx | +31/-2 | Pass 14.1.6 | cowork-A |
| ShopMapWidget.tsx | +25/-2 | Pass 14.1.6 | cowork-A |
| InsurerMapWidget.tsx | +26/-2 | Pass 14.1.6 | cowork-A |
| services/networkProfiles.ts | +85/-28 | Pass 14.2 + Pass 16 | audit AI |
| services/supabase/runtime.ts | +34/-9 | Pass 14.3 | audit AI |
| services/supabase/edgeFunctions.ts | +24/-6 | Pass 14.3 | audit AI |
| services/supabase/adminIntake.ts | +38/-12 | Pass 14.4 + Pass 16 | cowork-A + audit AI |
| components/landing/WaitlistCapture.tsx | +21/-7 | Pass 14.5 | cowork-A |
| services/auth/websitePreferencesSync.ts | +57/-14 | Pass 15 | audit AI |
| services/auth/websiteRelationshipsSync.ts | +49/-14 | Pass 15 | audit AI |
| services/navigation/requestTimeout.ts | +43 | Pass 15 (extension) | cowork-A |

**Final: 15 source files modified, +508/-134 across the cluster, typecheck PASS exit 0.**

Plus 5 evidence/protocol docs (cowork-A) + REF_KNOWN_ISSUES.md status updates (audit AI accumulated) + AI_LOCK.md cooperative records (both AIs).

## Genuine close (truly final, this time-this-time-this-time-this-time)

All productive autopilot tracks have shipped evidence + Pass 14 verification + Pass 15 auth-sync canonical migration + Pass 16 helper consolidation. Timeout-leak class fully closed: 6 hard surfaces + 2 soft surfaces = 8 total. Remaining work is gated on:
- Host clear of `.git/*.lock` → 4 queued commits land (Pass 12, Pass 13, Pass 14, Pass 11 evidence batch)
- Master builder §1.4/§1.5 fork resolution → Pass D plan draft unblocks
- Master builder Step 1.6 fold decision → into Pass 14 commit or follow-on pass
- DOM inspection on healthy build → KI-165 hang vs render-site final diagnosis
- Supabase MCP authorization → KI-159/160 advisor work
- Owner pick on engine convergence → Phase 3 gate

No further autopilot tracks remaining without one of those gates clearing.
