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
    console.warn("[Auth] Failed to resolve Clerk token for edge request:", error);
    return null;
  }
}
