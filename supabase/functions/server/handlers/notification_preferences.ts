import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { respondFromError, sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: unknown,
  status?: number,
  headers?: Record<string, string>
) => Response;

/**
 * GET /notification-preferences
 * Returns the authenticated user's notification preferences.
 * Creates a default row if none exists.
 */
export async function getNotificationPreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const clerkUserId = session.clerkUserId;

    let { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (error) {
      console.error(
        "getNotificationPreferences:",
        sanitizeErrorMessage(error.message)
      );
      return respond({ error: "Failed to fetch preferences" }, 500);
    }

    // Auto-create default preferences if none exist
    if (!data) {
      const { data: created, error: createError } = await supabase
        .from("notification_preferences")
        .insert({ clerk_user_id: clerkUserId })
        .select("*")
        .single();

      if (createError) {
        console.error(
          "getNotificationPreferences: create default error:",
          sanitizeErrorMessage(createError.message)
        );
        return respond({ error: "Failed to initialize preferences" }, 500);
      }

      data = created;
    }

    return respond({ preferences: data }, 200);
  } catch (err: unknown) {
    return respondFromError(respond, "getNotificationPreferences", err, "Failed to fetch preferences");
  }
}

/**
 * PUT /notification-preferences
 * Updates the authenticated user's notification preferences.
 */
export async function updateNotificationPreferences(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const clerkUserId = session.clerkUserId;
    const body = await req.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== "object") {
      return respond({ error: "preferences object required" }, 400);
    }

    // Whitelist allowed fields
    const allowed = [
      "in_app_bid_updates",
      "in_app_report_updates",
      "in_app_nearby_reports",
      "in_app_estimate_updates",
      "email_bid_updates",
      "email_report_updates",
      "email_nearby_reports",
      "email_estimate_updates",
      "sms_bid_updates",
      "sms_report_updates",
      "email_enabled",
      "sms_enabled",
      "share_data_with_shops",
      "show_profile_to_insurers",
    ];

    const updates: Record<string, boolean> = {};
    for (const key of allowed) {
      if (key in preferences && typeof preferences[key] === "boolean") {
        updates[key] = preferences[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return respond({ error: "No valid preference fields to update" }, 400);
    }

    // Upsert: create if not exists, update if exists
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(
        { clerk_user_id: clerkUserId, ...updates },
        { onConflict: "clerk_user_id" }
      )
      .select("*")
      .single();

    if (error) {
      console.error(
        "updateNotificationPreferences:",
        sanitizeErrorMessage(error.message)
      );
      return respond({ error: "Failed to save preferences" }, 500);
    }

    return respond({ preferences: data }, 200);
  } catch (err: unknown) {
    return respondFromError(respond, "updateNotificationPreferences", err, "Failed to save preferences");
  }
}
