/**
 * Provider-agnostic website preferences handlers
 * Stores app-level memory keyed by website_user_key instead of auth-provider-only identifiers.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

export async function getWebsitePreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const websiteUserKey = url.searchParams.get("websiteUserKey");

    if (!websiteUserKey) {
      return respond({ error: "Missing websiteUserKey" }, 400);
    }

    const { data, error } = await supabase
      .from("website_preferences")
      .select("*")
      .eq("website_user_key", websiteUserKey)
      .maybeSingle();

    if (error) {
      console.error("Error fetching website preferences:", error);
      return respond({ error: error.message }, 500);
    }

    return respond({
      preferences: data || null,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in get website preferences endpoint:", error);
    return respond({ error: error.message }, 500);
  }
}

export async function saveWebsitePreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { accountType, identity, sessionMemory } = body || {};

    if (!identity?.websiteUserKey || !sessionMemory) {
      return respond({ error: "Missing identity or sessionMemory" }, 400);
    }

    const payload = {
      account_type: accountType || null,
      clerk_user_id: identity.provider === "clerk" ? identity.providerUserId || null : null,
      display_name: identity.displayName || null,
      normalized_email: identity.normalizedEmail || null,
      provider: identity.provider || null,
      provider_user_id: identity.providerUserId || null,
      session_memory: sessionMemory,
      website_user_key: identity.websiteUserKey,
    };

    const { data, error } = await supabase
      .from("website_preferences")
      .upsert(payload, {
        onConflict: "website_user_key",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving website preferences:", error);
      return respond({ error: error.message }, 500);
    }

    return respond({
      preferences: data,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in save website preferences endpoint:", error);
    return respond({ error: error.message }, 500);
  }
}
