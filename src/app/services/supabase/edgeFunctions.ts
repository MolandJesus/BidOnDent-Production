import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
} from "./runtime";
import { createTimeoutAbortController } from "../navigation/requestTimeout";

export function buildEdgeFunctionUrl(path: string): string {
  return buildSupabaseFunctionUrl(path);
}

/**
 * Pass 14 Step 3 (audit AI) — KI-165 root-cause class extension. Adds a
 * 10s timeout via `createTimeoutAbortController` when the caller has not
 * already supplied an `init.signal`. Every consumer of `edgeFunctionFetch`
 * (and `edgeFunctionJson` below) inherits the protection without per-call
 * edits. Matches the pattern shipped to `services/supabase/map.ts:152` +
 * `services/supabase/runtime.ts:requestSupabaseEdge` in the same pass.
 */
export async function edgeFunctionFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const bodyIsFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers = await buildSupabaseEdgeHeadersAsync({
    headers: init.headers,
    json: !bodyIsFormData,
  });

  const internalRequest = init.signal ? null : createTimeoutAbortController(10000);

  try {
    return await fetch(buildEdgeFunctionUrl(path), {
      ...init,
      headers,
      signal: init.signal ?? internalRequest?.controller.signal,
    });
  } finally {
    internalRequest?.clear();
  }
}

export async function edgeFunctionJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await edgeFunctionFetch(path, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Edge function request failed");
  }

  return data as T;
}
