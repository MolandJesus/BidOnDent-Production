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

function normalizeWebsiteUserKey(value?: string | null) {
  const normalized = value?.trim() || "";
  return normalized || null;
}

async function getStoredWebsiteUserKeyForSession(
  supabase: SupabaseClient,
  session: VerifiedClerkSession
) {
  const { data: websitePreferences, error: websitePreferencesError } = await supabase
    .from("website_preferences")
    .select("website_user_key")
    .eq("clerk_user_id", session.clerkUserId)
    .maybeSingle();

  if (websitePreferencesError) {
    throw websitePreferencesError;
  }

  const websitePreferencesKey = normalizeWebsiteUserKey(
    typeof websitePreferences?.website_user_key === "string"
      ? websitePreferences.website_user_key
      : null
  );

  if (websitePreferencesKey) {
    return websitePreferencesKey;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("website_user_key")
    .eq("clerk_user_id", session.clerkUserId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  return normalizeWebsiteUserKey(
    typeof profile?.website_user_key === "string" ? profile.website_user_key : null
  );
}

export async function resolveWebsiteUserKeyForSession(
  supabase: SupabaseClient,
  session: VerifiedClerkSession,
  requestedWebsiteUserKey?: string | null
) {
  const normalizedRequestedWebsiteUserKey = normalizeWebsiteUserKey(requestedWebsiteUserKey);
  const storedWebsiteUserKey = await getStoredWebsiteUserKeyForSession(supabase, session);
  const emailBasedKey = buildWebsiteUserKey({
    clerkUserId: session.clerkUserId,
    email: session.email,
  });
  // Clerk-id-only seed acts as a fallback when the edge runtime can't resolve
  // the user's email (e.g. CLERK_SECRET_KEY isn't configured for fetchClerkEmail).
  // The frontend may have computed its key with EITHER seed depending on whether
  // email was available client-side at request time, so accept either as a match.
  const clerkIdBasedKey = buildWebsiteUserKey({
    clerkUserId: session.clerkUserId,
    email: null,
  });

  if (normalizedRequestedWebsiteUserKey) {
    const allowedWebsiteUserKeys = new Set<string>();

    if (storedWebsiteUserKey) {
      allowedWebsiteUserKeys.add(storedWebsiteUserKey);
    }
    allowedWebsiteUserKeys.add(clerkIdBasedKey);
    if (normalizeEmail(session.email)) {
      allowedWebsiteUserKeys.add(emailBasedKey);
    }

    if (!allowedWebsiteUserKeys.has(normalizedRequestedWebsiteUserKey)) {
      throw new Error("Authenticated website identity mismatch");
    }
  }

  return storedWebsiteUserKey || emailBasedKey;
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
  const session = await requireClerkSession(req, { requireEmail: false });
  const profile = await getAuthenticatedProfile(supabase, session);

  const resolvedEmail = normalizeEmail(session.email) || normalizeEmail(profile?.email);

  if (options.requireEmail && !resolvedEmail) {
    throw new Error(
      "Unable to resolve authenticated Clerk email. Configure CLERK_SECRET_KEY or link a profile email."
    );
  }

  return {
    profile,
    session:
      resolvedEmail === session.email
        ? session
        : {
            ...session,
            email: resolvedEmail,
          },
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
    requireEmail: false,
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

export async function requireInsurerContext(req: Request, supabase: SupabaseClient) {
  const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
    requireEmail: false,
  });

  const isInsurerOrAdmin =
    Boolean(profile?.is_admin) || profile?.account_type === "insurer";

  if (!isInsurerOrAdmin) {
    throw new Error("Insurer access required");
  }

  return {
    profile,
    session,
  };
}
