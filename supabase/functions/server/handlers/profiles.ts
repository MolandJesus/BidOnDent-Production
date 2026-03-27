import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

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
    const identity: ProfileIdentity = {
      clerkUserId: url.searchParams.get("clerkUserId"),
      email: url.searchParams.get("email"),
      websiteUserKey: url.searchParams.get("websiteUserKey"),
    };

    if (!identity.clerkUserId && !identity.email && !identity.websiteUserKey) {
      return respond({ error: "Missing profile identity" }, 400);
    }

    const profile = await findExistingProfile(supabase, identity);
    return respond({
      profile: profile || null,
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function saveUserProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const identity: ProfileIdentity = body?.identity || {};
    const profile = body?.profile || {};

    const normalizedEmail = normalizeEmail(profile.email || identity.email);
    if (!normalizedEmail || !profile?.name || !profile?.account_type) {
      return respond({ error: "Missing profile email, name, or account type" }, 400);
    }

    const existingProfile = await findExistingProfile(supabase, {
      clerkUserId: identity.clerkUserId || null,
      email: normalizedEmail,
      websiteUserKey: identity.websiteUserKey || null,
    });

    const payload = {
      account_type: profile.account_type,
      clerk_user_id: identity.clerkUserId || existingProfile?.clerk_user_id || null,
      email: normalizedEmail,
      is_admin:
        normalizedEmail === "figmaadmin@bidondent.com" ||
        normalizedEmail === "bidondent@gmail.com" ||
        !!existingProfile?.is_admin,
      last_login: profile.last_login || existingProfile?.last_login || null,
      name: profile.name,
      phone: profile.phone || null,
      profile_image_url: profile.profile_image_url || null,
      setup_completed: profile.setup_completed ?? existingProfile?.setup_completed ?? false,
      website_user_key: identity.websiteUserKey || existingProfile?.website_user_key || null,
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
      profile: data,
      success: true,
    });
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
