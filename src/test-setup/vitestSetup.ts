/**
 * Vitest global setup — Pass 253 (Tier B Surface Confidence Expansion).
 *
 * Single responsibility: mock `src/app/services/supabase/client` so
 * test imports that transitively reach the eager Supabase singleton
 * do not bootstrap the real auth-js client under jsdom (which
 * cannot satisfy the auth-js storage contract at the
 * `_emitInitialSession` microtask boundary).
 *
 * Why this is safe (per Pass 252 characterization):
 *   - Production runtime is untouched. The mock applies only to
 *     vitest module resolution.
 *   - Suite has zero direct tests on `services/supabase/client.ts`
 *     internals. Tests that use `supabase` go through service
 *     wrappers (which already mock those wrappers) or do not
 *     exercise auth/realtime at all.
 *   - The Pass 252 §1 reproduction tests assert *singleton
 *     contract* (non-null + stable across re-imports + config
 *     present), which the mock satisfies. The contract is
 *     preserved; only the side-effecting bootstrap is suppressed.
 *
 * Rollback simplicity: trivial.
 *   - Remove this file from `vite.config.ts` test.setupFiles.
 *   - Or delete the `vi.mock(...)` block below.
 *   - The Pass 252 reproduction tests will start emitting the
 *     stderr warning again, which is the rollback signal.
 *
 * Cross-references:
 *   - docs/REF_KNOWN_ISSUES.md (test-env hardening note)
 *   - src/app/__tests__/asyncWarningCharacterization.test.ts
 *     (Pass 252 trigger-chain lock)
 *   - src/app/services/supabase/client.ts (real module)
 */

import { vi } from "vitest";

vi.mock("../app/services/supabase/client", () => {
  // Minimal stub satisfying every consumer surface that tests
  // transitively touch. We deliberately do NOT import the real
  // module — the entire purpose is to short-circuit the eager
  // `getSupabaseClient()` call at module evaluation.
  //
  // Methods return chain-able no-op objects so that any
  // accidental `.from(...).select(...)` style call in a test
  // path does not crash the test runner. Tests that actually
  // need supabase behavior should mock at the *service wrapper*
  // layer (e.g. `services/supabase/reports`), not here.
  const noopThen = () => Promise.resolve({ data: null, error: null });
  const queryBuilder: Record<string, unknown> = {};
  const queryBuilderProxy: unknown = new Proxy(queryBuilder, {
    get: (_target, prop) => {
      if (prop === "then") return noopThen;
      return () => queryBuilderProxy;
    },
  });

  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: () => Promise.resolve("ok" as const),
    send: () => Promise.resolve("ok" as const),
  };

  const stubClient = {
    from: () => queryBuilderProxy,
    rpc: () => queryBuilderProxy,
    channel: () => channel,
    removeChannel: () => Promise.resolve("ok" as const),
    removeAllChannels: () => Promise.resolve("ok" as const),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    realtime: {
      setAuth: () => undefined,
      channels: [] as unknown[],
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
        createSignedUrl: () => Promise.resolve({ data: null, error: null }),
      }),
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  };

  return {
    supabase: stubClient,
    hasMissingSupabaseConfig: false,
    setSupabaseRealtimeAuth: (_token: string | null) => undefined,
    refreshRealtimeAuth: async () => undefined,
  };
});
