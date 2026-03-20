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
    authorizedParties.length > 0 ? { authorizedParties } : {}
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
