import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureWebsiteUserKeyMatchesSession,
  getAuthenticatedProfile,
  requireClerkSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { hydrateSignedStorageUrl } from "../utils/storage.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

export type ProfileIdentity = {
  clerkUserId?: string | null;
  email?: string | null;
  websiteUserKey?: string | null;
};

export function normalizeEmail(email?: string | null) {
  const normalized = email?.trim().toLowerCase() || "";
  return normalized || null;
}

export async function findExistingProfile(
  supabase: SupabaseClient,
  identity: ProfileIdentity
) {
  if (identity.clerkUserId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_user_id", identity.clerkUserId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  if (identity.websiteUserKey) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("website_user_key", identity.websiteUserKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  const normalizedEmail = normalizeEmail(identity.email);
  if (normalizedEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  return null;
}

export async function getUserProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const session = await requireClerkSession(req, { requireEmail: true });
    const requestedClerkUserId = url.searchParams.get("clerkUserId");
    const requestedEmail = normalizeEmail(url.searchParams.get("email"));

    if (requestedClerkUserId && requestedClerkUserId !== session.clerkUserId) {
      return respond({ error: "Forbidden" }, 403);
    }

    if (requestedEmail && requestedEmail !== normalizeEmail(session.email)) {
      return respond({ error: "Forbidden" }, 403);
    }

    ensureWebsiteUserKeyMatchesSession(session, url.searchParams.get("websiteUserKey"));

    const profile = await getAuthenticatedProfile(supabase, session);
    const hydratedProfile = profile
      ? {
          ...profile,
          profile_image_url: await hydrateSignedStorageUrl(
            supabase,
            typeof profile.profile_image_url === "string" ? profile.profile_image_url : null
          ),
        }
      : null;

    return respond({
      profile: hydratedProfile,
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function saveUserProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: true });
    const identity: ProfileIdentity = body?.identity || {};
    const profile = body?.profile || {};
    const normalizedSessionEmail = normalizeEmail(session.email);

    if (!normalizedSessionEmail || !profile?.name || !profile?.account_type) {
      return respond({ error: "Missing profile email, name, or account type" }, 400);
    }

    if (identity.clerkUserId && identity.clerkUserId !== session.clerkUserId) {
      return respond({ error: "Forbidden" }, 403);
    }

    const websiteUserKey = ensureWebsiteUserKeyMatchesSession(
      session,
      identity.websiteUserKey || null
    );

    const existingProfile = await findExistingProfile(supabase, {
      clerkUserId: session.clerkUserId,
      email: normalizedSessionEmail,
      websiteUserKey,
    });

    const payload = {
      account_type: profile.account_type,
      clerk_user_id: session.clerkUserId,
      email: normalizedSessionEmail,
      is_admin:
        normalizedSessionEmail === "figmaadmin@bidondent.com" ||
        normalizedSessionEmail === "bidondent@gmail.com" ||
        !!existingProfile?.is_admin,
      last_login: profile.last_login || existingProfile?.last_login || null,
      name: profile.name,
      phone: profile.phone || null,
      profile_image_url: profile.profile_image_url || null,
      setup_completed: profile.setup_completed ?? existingProfile?.setup_completed ?? false,
      website_user_key: websiteUserKey,
    };

    const query = existingProfile
      ? supabase.from("profiles").update(payload).eq("id", existingProfile.id)
      : supabase.from("profiles").insert(payload);

    const { data, error } = await query.select().single();

    if (error) {
      console.error("Error saving user profile:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      profile: {
        ...data,
        profile_image_url: await hydrateSignedStorageUrl(
          supabase,
          typeof data?.profile_image_url === "string" ? data.profile_image_url : null
        ),
      },
      success: true,
    });
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
