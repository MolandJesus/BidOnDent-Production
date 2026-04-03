/**
 * Provider-agnostic website preferences handlers
 * Stores app-level memory keyed by website_user_key instead of auth-provider-only identifiers.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  normalizeEmail,
  requireClerkSession,
  resolveWebsiteUserKeyForSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

export async function getWebsitePreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const session = await requireClerkSession(req, { requireEmail: false });
    const websiteUserKey = await resolveWebsiteUserKeyForSession(
      supabase,
      session,
      url.searchParams.get("websiteUserKey")
    );

    const { data, error } = await supabase
      .from("website_preferences")
      .select("*")
      .eq("website_user_key", websiteUserKey)
      .maybeSingle();

    if (error) {
      console.error("Error fetching website preferences:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      preferences: data || null,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in get website preferences endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("website identity mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function saveWebsitePreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: false });
    const { accountType, identity, sessionMemory } = body || {};

    if (!sessionMemory) {
      return respond({ error: "Missing identity or sessionMemory" }, 400);
    }

    const websiteUserKey = await resolveWebsiteUserKeyForSession(
      supabase,
      session,
      identity?.websiteUserKey || null
    );

    const payload = {
      account_type: accountType || null,
      clerk_user_id: session.clerkUserId,
      display_name: identity?.displayName || null,
      normalized_email: normalizeEmail(session.email),
      provider: "clerk",
      provider_user_id: session.clerkUserId,
      session_memory: sessionMemory,
      website_user_key: websiteUserKey,
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
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      preferences: data,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in save website preferences endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("website identity mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
