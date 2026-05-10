type TimeoutAbortController = {
  controller: AbortController;
  clear: () => void;
  didTimeout: () => boolean;
};

export function createTimeoutAbortController(timeoutMs: number): TimeoutAbortController {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    clear: () => clearTimeout(timeoutId),
    didTimeout: () => timedOut,
  };
}

/**
 * Pass 15 (cowork-A) — shared `fetchWithTimeout` extracted alongside
 * `createTimeoutAbortController`. Per audit AI Pass 14.2 rationale
 * "extract when 3+ raw-fetch consumers exist," the post-Pass-14-cluster
 * count reached threshold (networkProfiles + adminIntake; Pass 15
 * auth-sync migration brings the count to 4).
 *
 * Wraps the canonical `createTimeoutAbortController` and threads its
 * signal into the standard `fetch()` RequestInit, so any service can
 * adopt the timeout-leak-class fix in one import + one call without
 * duplicating the helper definition. If the caller supplies their own
 * `init.signal`, that signal short-circuits the internal timeout
 * (matches the pattern used by `services/supabase/runtime.ts:requestSupabaseEdge`
 * and `services/supabase/edgeFunctions.ts:edgeFunctionFetch` shipped in
 * Pass 14.3).
 *
 * Three timeout shapes still coexist intentionally:
 *   1. This `fetchWithTimeout` for raw `fetch()` consumers.
 *   2. Inline `createTimeoutAbortController` + Supabase `.abortSignal()`
 *      chain for Supabase JS v2 query consumers (e.g. map.ts, WaitlistCapture).
 *   3. Hook-side signal pass-down for navigation services that accept
 *      `signal?: AbortSignal` (e.g. geocodingClient).
 *
 * One helper per shape; consumers pick the appropriate one.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  // Caller-supplied signal short-circuits the internal timeout (preserves
  // explicit cancel-on-unmount or other caller cancellation contracts).
  if (init.signal) {
    return fetch(input, init);
  }
  const request = createTimeoutAbortController(timeoutMs);
  try {
    return await fetch(input, { ...init, signal: request.controller.signal });
  } finally {
    request.clear();
  }
}
