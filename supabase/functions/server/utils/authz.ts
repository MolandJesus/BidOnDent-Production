import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { config } from "../config/constants.ts";
import {
  type VerifiedClerkSession,
  verifyClerkSessionRequest,
} from "./clerk.ts";

export type AuthenticatedProfile = {
  account_type?: string | null;
  clerk_user_id?: string | null;
  email?: string | null;
  id?: string;
  is_admin?: boolean | null;
  name?: string | null;
  profile_image_url?: string | null;
  setup_completed?: boolean | null;
  user_id?: string | null;
  website_user_key?: string | null;
};

export function normalizeEmail(value?: string | null) {
  const normalized = value?.trim().toLowerCase() || "";
  return normalized || null;
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

export function buildWebsiteUserKey(params: {
  clerkUserId?: string | null;
  email?: string | null;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  const stableAccountSeed = normalizedEmail || `clerk:${params.clerkUserId || "guest"}`;
  return `website-user-${hashValue(stableAccountSeed)}`;
}

export async function requireClerkSession(
  req: Request,
  options: { requireEmail?: boolean } = { requireEmail: true }
): Promise<VerifiedClerkSession> {
  return verifyClerkSessionRequest(req, options);
}

export function ensureClerkUserMatchesSession(
  session: VerifiedClerkSession,
  requestedClerkUserId?: string | null
) {
  if (requestedClerkUserId && requestedClerkUserId !== session.clerkUserId) {
    throw new Error("Authenticated user mismatch");
  }

  return session.clerkUserId;
}

export function ensureWebsiteUserKeyMatchesSession(
  session: VerifiedClerkSession,
  requestedWebsiteUserKey?: string | null
) {
  const expectedWebsiteUserKey = buildWebsiteUserKey({
    clerkUserId: session.clerkUserId,
    email: session.email,
  });

  if (requestedWebsiteUserKey && requestedWebsiteUserKey !== expectedWebsiteUserKey) {
    throw new Error("Authenticated website identity mismatch");
  }

  return expectedWebsiteUserKey;
}

export async function getAuthenticatedProfile(
  supabase: SupabaseClient,
  session: VerifiedClerkSession
): Promise<AuthenticatedProfile | null> {
  const normalizedEmail = normalizeEmail(session.email);

  const { data: byClerkUserId, error: byClerkUserIdError } = await supabase
    .from("profiles")
    .select(
      "id, user_id, clerk_user_id, website_user_key, email, name, profile_image_url, account_type, setup_completed, is_admin"
    )
    .eq("clerk_user_id", session.clerkUserId)
    .maybeSingle();

  if (byClerkUserIdError) {
    throw byClerkUserIdError;
  }

  if (byClerkUserId) {
    return byClerkUserId as AuthenticatedProfile;
  }

  if (!normalizedEmail) {
    return null;
  }

  const { data: byEmail, error: byEmailError } = await supabase
    .from("profiles")
    .select(
      "id, user_id, clerk_user_id, website_user_key, email, name, profile_image_url, account_type, setup_completed, is_admin"
    )
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (byEmailError) {
    throw byEmailError;
  }

  return (byEmail as AuthenticatedProfile | null) || null;
}

export async function requireAuthenticatedProfile(
  req: Request,
  supabase: SupabaseClient,
  options: { requireEmail?: boolean } = { requireEmail: true }
) {
  const session = await requireClerkSession(req, options);
  const profile = await getAuthenticatedProfile(supabase, session);

  return {
    profile,
    session,
  };
}

export async function requireAdminContext(req: Request, supabase: SupabaseClient) {
  const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
    requireEmail: true,
  });
  const adminEmail = normalizeEmail(session.email);

  const hasAdminAccess =
    Boolean(profile?.is_admin) || adminEmail === config.ADMIN_EMAIL.toLowerCase();

  if (!hasAdminAccess) {
    throw new Error("Admin access required");
  }

  return {
    adminEmail,
    profile,
    session,
  };
}

export async function requireMarketplaceContext(req: Request, supabase: SupabaseClient) {
  const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
    requireEmail: true,
  });

  const isMarketplaceActor =
    Boolean(profile?.is_admin) ||
    profile?.account_type === "shop" ||
    profile?.account_type === "insurer";

  if (!isMarketplaceActor) {
    throw new Error("Marketplace access required");
  }

  return {
    profile,
    session,
  };
}
