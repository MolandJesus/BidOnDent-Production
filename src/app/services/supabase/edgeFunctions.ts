import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
} from "./runtime";

export function buildEdgeFunctionUrl(path: string): string {
  return buildSupabaseFunctionUrl(path);
}

export async function edgeFunctionFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const bodyIsFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers = await buildSupabaseEdgeHeadersAsync({
    headers: init.headers,
    json: !bodyIsFormData,
  });

  return fetch(buildEdgeFunctionUrl(path), {
    ...init,
    headers,
  });
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
