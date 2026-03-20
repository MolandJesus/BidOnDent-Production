import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

const EDGE_FUNCTION_PREFIX = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523`;

export function buildEdgeFunctionUrl(path: string): string {
  return `${EDGE_FUNCTION_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function edgeFunctionFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${publicAnonKey}`);
  headers.set("apikey", publicAnonKey);

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
