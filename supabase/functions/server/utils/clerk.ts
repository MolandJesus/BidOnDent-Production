import { createClerkClient, verifyToken } from "npm:@clerk/backend";
import { config } from "../config/constants.ts";

export type VerifiedClerkSession = {
  clerkUserId: string;
  email: string | null;
  claims: Record<string, unknown>;
};

function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function getEmailFromClaims(claims: Record<string, unknown>): string | null {
  if (typeof claims.email === "string") {
    return normalizeEmail(claims.email);
  }

  if (typeof claims.email_address === "string") {
    return normalizeEmail(claims.email_address);
  }

  return null;
}

function getPrimaryClerkEmail(user: any): string | null {
  const emailAddresses = Array.isArray(user?.emailAddresses) ? user.emailAddresses : [];
  const primaryEmailAddressId =
    typeof user?.primaryEmailAddressId === "string" ? user.primaryEmailAddressId : null;

  const primaryEmail = emailAddresses.find(
    (entry: any) => entry?.id === primaryEmailAddressId && typeof entry?.emailAddress === "string"
  );

  if (primaryEmail?.emailAddress) {
    return normalizeEmail(primaryEmail.emailAddress);
  }

  const fallbackEmail = emailAddresses.find((entry: any) => typeof entry?.emailAddress === "string");
  return normalizeEmail(fallbackEmail?.emailAddress);
}

const clerkClient = config.CLERK_SECRET_KEY
  ? createClerkClient({
      secretKey: config.CLERK_SECRET_KEY,
      publishableKey: config.CLERK_PUBLISHABLE_KEY || undefined,
    })
  : null;

async function fetchClerkEmail(clerkUserId: string): Promise<string | null> {
  if (!clerkClient) {
    return null;
  }

  const user = await clerkClient.users.getUser(clerkUserId);
  return getPrimaryClerkEmail(user);
}

export function getAuthorizedParties(req: Request): string[] {
  const parties = new Set<string>();
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    parties.add(origin);
  }

  if (referer) {
    try {
      parties.add(new URL(referer).origin);
    } catch {
      // Ignore malformed referer values.
    }
  }

  return Array.from(parties);
}

function getBearerToken(req: Request): string {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (!authHeader) {
    throw new Error("No Authorization header provided");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header must use Bearer token");
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Bearer token is empty");
  }

  return token;
}

export async function verifyClerkSessionRequest(
  req: Request,
  options: { requireEmail?: boolean } = {}
): Promise<VerifiedClerkSession> {
  const token = getBearerToken(req);
  const authorizedParties = getAuthorizedParties(req);

  const claims = (await verifyToken(
    token,
    authorizedParties.length > 0
      ? {
          authorizedParties,
          ...(config.CLERK_SECRET_KEY ? { secretKey: config.CLERK_SECRET_KEY } : {}),
        }
      : config.CLERK_SECRET_KEY
        ? { secretKey: config.CLERK_SECRET_KEY }
        : {}
  )) as Record<string, unknown>;

  const clerkUserId = typeof claims.sub === "string" ? claims.sub : null;

  if (!clerkUserId) {
    throw new Error("Missing Clerk user ID");
  }

  const email = getEmailFromClaims(claims) ?? (await fetchClerkEmail(clerkUserId));

  if (options.requireEmail && !email) {
    throw new Error(
      "Unable to resolve authenticated Clerk email. Configure CLERK_SECRET_KEY or include an email claim."
    );
  }

  return {
    clerkUserId,
    email,
    claims,
  };
}

/**
 * Soft verification for mutation endpoints.
 *
 * Strategy:
 * - If CLERK_SECRET_KEY is configured AND the Authorization header contains a Clerk JWT
 *   (detected by JWT shape), verify it and return the verified clerkUserId.
 * - If the JWT sub claim doesn't match the clerkUserId passed in the request body → reject (returns null + mismatch flag).
 * - If no CLERK_SECRET_KEY is configured, or the bearer token is the Supabase anon key → skip and trust the body param.
 *
 * This allows a safe rollout: existing anon-key flows continue to work while
 * Clerk-JWT requests are cryptographically verified.
 */
export async function softVerifyClerkMutation(
  req: Request,
  bodyClerkUserId: string
): Promise<{ verified: boolean; mismatch: boolean }> {
  if (!config.CLERK_SECRET_KEY) {
    // No secret configured — skip verification, trust body param
    return { verified: false, mismatch: false };
  }

  let token: string;
  try {
    token = getBearerToken(req);
  } catch {
    // No valid bearer header
    return { verified: false, mismatch: false };
  }

  // Detect if token is a JWT (three base64url parts separated by dots, starts with 'ey')
  const isJwt = token.startsWith("ey") && token.split(".").length === 3;
  if (!isJwt) {
    // Bearer is the Supabase anon key — skip verification
    return { verified: false, mismatch: false };
  }

  try {
    const authorizedParties = getAuthorizedParties(req);
    const claims = (await verifyToken(
      token,
      authorizedParties.length > 0 ? { authorizedParties, secretKey: config.CLERK_SECRET_KEY } : { secretKey: config.CLERK_SECRET_KEY }
    )) as Record<string, unknown>;

    const verifiedUserId = typeof claims.sub === "string" ? claims.sub : null;

    if (!verifiedUserId) {
      return { verified: false, mismatch: true };
    }

    if (verifiedUserId !== bodyClerkUserId) {
      return { verified: true, mismatch: true };
    }

    return { verified: true, mismatch: false };
  } catch {
    // Verification failed — treat as unverified but not an error (may be misconfigured)
    return { verified: false, mismatch: false };
  }
}
