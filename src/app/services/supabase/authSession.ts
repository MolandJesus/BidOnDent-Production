export type ClerkTokenGetter = () => Promise<string | null>;

let clerkTokenGetter: ClerkTokenGetter | null = null;

export function setClerkTokenGetter(nextGetter: ClerkTokenGetter | null) {
  clerkTokenGetter = nextGetter;
}

export function hasClerkTokenGetter() {
  return clerkTokenGetter !== null;
}

export async function waitForClerkTokenGetter(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}) {
  if (clerkTokenGetter) {
    return;
  }

  const timeoutMs = options?.timeoutMs ?? 800;
  const intervalMs = options?.intervalMs ?? 50;
  const deadline = Date.now() + timeoutMs;

  while (!clerkTokenGetter && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

export async function getClerkTokenForEdgeRequests() {
  if (!clerkTokenGetter) {
    return null;
  }

  try {
    return await clerkTokenGetter();
  } catch (error) {
    // Pass 19 (cowork-A) — security sweep. The error object from
    // clerkTokenGetter() can carry JWT fragments / expired-token hints /
    // other auth-session detail that should not surface in production
    // browser consoles or downstream log-aggregator pipelines. Gate to
    // DEV-only per the LAW_PROJECT_RULES.md "PII exfiltration defense"
    // posture; production observability for this failure mode lives in
    // the edge-function logs, not the browser console.
    if (import.meta.env.DEV) {
      console.warn("[Auth] Failed to resolve Clerk token for edge request:", error);
    }
    return null;
  }
}
