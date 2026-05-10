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

// ---------------------------------------------------------------
// Pass 255 (extension of Pass 253) — jsdom localStorage shim.
//
// This vitest+jsdom configuration ships a `window.localStorage`
// object whose prototype methods (`getItem`, `setItem`,
// `removeItem`, `clear`, `key`) are unbound (`typeof
// localStorage.getItem === "undefined"`). The accompanying
// `--localstorage-file was provided without a valid path` Node
// warning confirms the half-initialized state.
//
// Production browsers expose the full Storage API; this is
// strictly a test-env gap. Same class as Pass 253's auth-js
// shim — production runtime is UNTOUCHED, only vitest's
// `globalThis.window.localStorage` gets a complete in-memory
// implementation that satisfies the Web Storage contract.
//
// Without this shim, `MapLibreServiceCoverageMap` cannot be
// rendered in jsdom because `useMapPerformanceTracking` reads
// persisted samples on mount via `readPersistedState` →
// `storage.getItem(...)` → throws.
//
// Rollback: trivial — delete this block. Tests that mount the
// coverage map host will start throwing again, which is the
// rollback signal.
// ---------------------------------------------------------------
if (typeof window !== "undefined") {
  const inMemoryStore = new Map<string, string>();
  const inMemoryStorage: Storage = {
    get length() {
      return inMemoryStore.size;
    },
    clear: () => {
      inMemoryStore.clear();
    },
    getItem: (key: string) => {
      return inMemoryStore.has(key) ? inMemoryStore.get(key)! : null;
    },
    key: (index: number) => {
      return Array.from(inMemoryStore.keys())[index] ?? null;
    },
    removeItem: (key: string) => {
      inMemoryStore.delete(key);
    },
    setItem: (key: string, value: string) => {
      inMemoryStore.set(key, String(value));
    },
  };
  // Replace whatever jsdom installed with a fully-functional
  // in-memory Storage. `defineProperty` is required because the
  // jsdom-installed property is non-writable in some configs.
  try {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: inMemoryStorage,
    });
  } catch {
    // Fall back to direct assignment if defineProperty is not
    // permitted. Either way ensures `getItem` is a function.
    (window as unknown as { localStorage: Storage }).localStorage = inMemoryStorage;
  }
  // Also patch sessionStorage for symmetry — same jsdom quirk.
  const sessionStore = new Map<string, string>();
  const inMemorySession: Storage = {
    get length() {
      return sessionStore.size;
    },
    clear: () => {
      sessionStore.clear();
    },
    getItem: (key: string) => (sessionStore.has(key) ? sessionStore.get(key)! : null),
    key: (index: number) => Array.from(sessionStore.keys())[index] ?? null,
    removeItem: (key: string) => {
      sessionStore.delete(key);
    },
    setItem: (key: string, value: string) => {
      sessionStore.set(key, String(value));
    },
  };
  try {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: inMemorySession,
    });
  } catch {
    (window as unknown as { sessionStorage: Storage }).sessionStorage = inMemorySession;
  }
}

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
