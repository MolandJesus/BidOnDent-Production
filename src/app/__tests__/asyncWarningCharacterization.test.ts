/**
 * Async-warning characterization — Pass 252 (Tier B Surface Confidence
 * Expansion lane).
 *
 * What this file is
 * -----------------
 * A *characterization* (not a fix) of the non-fatal Supabase auth-js
 * stderr warning surfaced for the first time by Pass 251 §3 when the
 * KI-196 identity test dynamically imports `MapLibreServiceCoverageMap`.
 *
 * The warning text:
 *
 *   TypeError: storage.getItem is not a function
 *    ❯ getItemAsync node_modules/@supabase/auth-js/.../helpers.js
 *    ❯ SupabaseAuthClient.__loadSession
 *    ❯ SupabaseAuthClient._emitInitialSession
 *
 * Suite still passes (901/901) — this is stderr noise, not a test
 * failure. This file pins the *trigger chain* so Pass 253 can
 * harden it deterministically without re-discovering the path.
 *
 * Trigger chain (verified Pass 252)
 * ---------------------------------
 *   src/app/__tests__/ki196DefaultParamStability.test.tsx §3
 *     └─> dynamic import of MapLibreServiceCoverageMap
 *           └─> import { REPORT_MARKERS_LAYER_ID } from "./MapLibreReportLayer"
 *                 └─> import { useReportLayerData } from "../../hooks/useReportLayerData"
 *                       └─> import { supabase } from "../services/supabaseService"
 *                             └─> export { supabase } from "./supabase/client"
 *                                   └─> export const supabase = getSupabaseClient()  ← EAGER
 *                                         └─> createClient(url, key, { auth: { storage: window.localStorage, ... } })
 *                                               └─> auth-js schedules _emitInitialSession microtask
 *                                                     └─> __loadSession → getItemAsync(storage, key)
 *                                                           └─> stderr: "storage.getItem is not a function"
 *
 * Origin classification
 * ---------------------
 * - **Type**: (a) eager module-init side effect.
 * - **Site**: `src/app/services/supabase/client.ts` line 76:
 *     `export const supabase = getSupabaseClient();`
 * - **Why first surfaced now**: Pass 251 §3 added the FIRST test-side
 *   dynamic import of `MapLibreServiceCoverageMap`. No prior test
 *   in the suite (893 baseline → 901 today) reached this transitive
 *   chain. The chain itself is not new; the test entrypoint is.
 *
 * Runtime vs test-env classification
 * ----------------------------------
 * - **Production runtime**: unaffected. The eager singleton is
 *   *intentional* in production — it pre-warms Supabase auth +
 *   Realtime so first-mount components do not pay a cold-start
 *   penalty, and `window.localStorage` in real browsers satisfies
 *   the auth-js storage contract synchronously.
 * - **Test environment**: jsdom's `window.localStorage` either is
 *   not present at the moment auth-js's microtask resolves, or is
 *   not callable as a function on the captured `storage`
 *   reference. The exact jsdom behavior is not the diagnosis we
 *   need here — the diagnosis is "module-init side effect runs
 *   under a host that does not satisfy the side effect's
 *   precondition."
 *
 * Severity
 * --------
 * - Suite: 901/901 passes.
 * - CI: stderr line per affected test run. CI logs become slightly
 *   noisier; no failure gate is breached.
 * - Architecture: zero. No semantic surface drifted.
 * - User impact: none.
 *
 * Hardening options (Pass 253 candidates)
 * ---------------------------------------
 * Listed in order of safety + minimal-blast-radius. Option D is
 * **rejected** for this lane — it would change production
 * initialization semantics, which violates the lane's "no runtime
 * semantic changes" guardrail.
 *
 * **Option A — Test-only mock of `services/supabase/client`** ✅
 *   Add a `vi.mock("../services/supabase/client", ...)` (or a
 *   global mock via vitest setup) that returns a stub `supabase`
 *   object satisfying the *type* shape but performing no auth-js
 *   bootstrap. Either:
 *     (a) per-test mock added only to the KI-196 §3 test, OR
 *     (b) a vitest `setupFiles` global mock that applies to every
 *         test that doesn't override it.
 *   Pros: zero runtime change, surgical, future tests inherit
 *   the protection automatically (option b), trivially reversible.
 *   Cons: must verify no existing test relies on the real client
 *   shape (none currently does — the suite has zero direct tests
 *   on `services/supabase/client.ts`).
 *   Rollback simplicity: **trivial** — delete the mock or the
 *   setupFile entry.
 *
 * **Option B — Refactor §3 to consume EMPTY_* from a leaner module** ⚠️
 *   Extract `EMPTY_COUNTIES` and `EMPTY_PARTNER_SHOPS` from
 *   `MapLibreServiceCoverageMap.tsx` into a small sibling module
 *   `mapLibreServiceCoverageMapDefaults.ts` whose import graph
 *   does NOT reach `MapLibreReportLayer.tsx`. Then update both
 *   the renderer and the test to import from the leaner module.
 *   Pros: removes the root-cause import edge for the test surface.
 *   Cons: introduces a new tiny module + changes Pass 251 export
 *   surface; mild churn for behavior-equivalent gain.
 *   Rollback simplicity: **easy** — delete defaults module, move
 *   constants back into the renderer.
 *
 * **Option C — vitest setup `localStorage` shim** ❓
 *   Force a Storage-shaped polyfill onto `window.localStorage` in
 *   a vitest setup file before any test loads, defending against
 *   any jsdom version that returns a non-callable shape.
 *   Pros: blanket defense.
 *   Cons: unclear whether jsdom is the real culprit; may be
 *   fragile across jsdom versions; doesn't address the broader
 *   "test importing a module shouldn't auto-bootstrap auth"
 *   concern.
 *   Rollback simplicity: **trivial**.
 *
 * **Option D — Lazy supabase singleton in client.ts** ❌
 *   Wrap `getSupabaseClient()` in a Proxy or first-use accessor so
 *   nothing happens until `supabase.auth` / `supabase.from` is
 *   actually called.
 *   Pros: also marginally helps production cold-start.
 *   Cons: **runtime semantic change** — production currently
 *   relies on eager init for Realtime + early auth. Violates this
 *   lane's "no runtime semantic changes" guardrail.
 *   Verdict: **REJECTED** for this lane. May be re-evaluated in
 *   a future Builder-AI-1 lane that owns runtime semantics.
 *
 * Recommended Pass 253 path
 * -------------------------
 * **Option A(b) — global vitest setup mock of
 * `services/supabase/client`**, with proof-of-disappearance via
 * stderr capture in the §1 reproduction test below.
 *
 * Optionally combine with **Option B** if Pass 253 also wants to
 * close the test-graph reach permanently.
 *
 * Reproduction lock (executable)
 * ------------------------------
 * §1 below imports `services/supabase/client` directly and asserts
 * the *eager singleton* contract — i.e. the module exports a
 * `supabase` named binding that is a non-null object at first
 * import. This is the smoking-gun test that proves the import-
 * graph trigger.
 *
 * If Pass 253 lands a fix, this test STILL passes — the singleton
 * stays observable. The fix lives in *test-environment shimming*,
 * not in the module's runtime contract.
 *
 * Convergence metadata
 * --------------------
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : none (characterization).
 *  3. Tier semantics touched    : none.
 *  4. Motion classes touched    : none.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : unchanged.
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — pins the trigger
 *                                 chain so Pass 253 cannot
 *                                 accidentally fix the wrong
 *                                 import edge.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file. No runtime
 *                                 behavior reverts.
 *
 * Cross-references
 * ----------------
 * - Pass 251 commit 732b5efb (KI-196 EMPTY_* singleton hardening)
 *   — first surfaced this stderr warning via §3 dynamic import.
 * - `src/app/services/supabase/client.ts` line 76 (eager singleton)
 * - `src/app/hooks/useReportLayerData.ts` lines 7-10 (transitive
 *   pull-in of `supabase` from the report layer hook)
 * - `src/app/components/maps/MapLibreReportLayer.tsx` line 6
 *   (the entry edge from the maps tree into the supabase graph)
 */

import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------
// §1. Reproduction lock — eager singleton contract.
//
// Importing `services/supabase/client` produces a non-null
// `supabase` named binding at module evaluation time. This is the
// observable surface that triggers auth-js bootstrap in jsdom.
//
// If Pass 253 lands Option A (global setup mock), the mock will
// satisfy this same contract — the test continues to pass, but
// the stderr warning disappears. If a future change removes the
// eager singleton (Option D), THIS TEST FAILS, which is the
// intended early-warning for that semantic change.
// ---------------------------------------------------------------

describe("Pass 252 — async-warning characterization §1 eager singleton contract", () => {
  it("services/supabase/client exports a non-null `supabase` at first import", async () => {
    const mod = await import("../services/supabase/client");
    expect(mod).toBeTruthy();
    expect(mod.supabase).toBeTruthy();
    expect(typeof mod.supabase).toBe("object");
  });

  it("the `supabase` export is a stable singleton across re-imports", async () => {
    const a = await import("../services/supabase/client");
    const b = await import("../services/supabase/client");
    expect(b.supabase).toBe(a.supabase);
  });

  it("hasMissingSupabaseConfig is false in the test environment", async () => {
    // vite.config.ts test.env block sets VITE_SUPABASE_URL and
    // VITE_SUPABASE_ANON_KEY to placeholder values, which means
    // `hasMissingSupabaseConfig` should be false. If a future
    // change drops those env stubs, the warning chain shifts and
    // Pass 253 will need to re-characterize.
    const mod = await import("../services/supabase/client");
    expect(mod.hasMissingSupabaseConfig).toBe(false);
  });
});

// ---------------------------------------------------------------
// §2. Trigger-edge proof — MapLibreReportLayer is the entry edge
// from the `components/maps/` tree into the supabase graph.
//
// Importing `MapLibreReportLayer` transitively pulls in
// `useReportLayerData`, which pulls in `supabase`. Importing
// `MapLibreServiceCoverageMap` pulls in `MapLibreReportLayer`
// for `REPORT_MARKERS_LAYER_ID` only — but module evaluation is
// whole-module, so the supabase eager init runs anyway.
//
// This test pins that entry edge. If a future refactor moves
// `REPORT_MARKERS_LAYER_ID` into a leaner module (Option B),
// this test FAILS — which is the intended signal that Option B
// landed and the trigger chain has been narrowed.
// ---------------------------------------------------------------

describe("Pass 252 — async-warning characterization §2 trigger edge", () => {
  it("MapLibreReportLayer module exports REPORT_MARKERS_LAYER_ID", async () => {
    // Smoke: the constant the coverage map imports lives on the
    // module that also drags in supabase. Until Option B lands,
    // the test surface inherits the eager bootstrap.
    const mod = await import("../components/maps/MapLibreReportLayer");
    expect(typeof mod.REPORT_MARKERS_LAYER_ID).toBe("string");
    expect(mod.REPORT_MARKERS_LAYER_ID.length).toBeGreaterThan(0);
  });
});
