export type ClerkTokenGetter = () => Promise<string | null>;

let clerkTokenGetter: ClerkTokenGetter | null = null;

export function setClerkTokenGetter(nextGetter: ClerkTokenGetter | null) {
  clerkTokenGetter = nextGetter;
}

export async function getClerkTokenForEdgeRequests() {
  if (!clerkTokenGetter) {
    return null;
  }

  try {
    return await clerkTokenGetter();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to resolve Clerk token for edge request:", error);
    }
    return null;
  }
}
