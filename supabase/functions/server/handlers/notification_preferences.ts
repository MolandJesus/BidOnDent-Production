import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { respondFromError, sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: unknown,
  status?: number,
  headers?: Record<string, string>
) => Response;

/**
 * Default preferences returned to the client when the persistence layer is
 * unavailable (table missing, RLS misconfig, etc.). Mirrors the DEFAULT clauses
 * in migration 20251230000001_full_schema.sql §3.17. Returning these with
 * fallback:true keeps Appearance Settings usable in degraded mode while
 * surfacing the failure mode for diagnostics — instead of a hard 500 that the
 * client circuit-breaker silences for 60s.
 */
const FALLBACK_PREFERENCES = {
  id: "",
  clerk_user_id: "",
  in_app_bid_updates: true,
  in_app_report_updates: true,
  in_app_nearby_reports: true,
  in_app_estimate_updates: true,
  email_bid_updates: true,
  email_report_updates: true,
  email_nearby_reports: true,
  email_estimate_updates: true,
  sms_bid_updates: false,
  sms_report_updates: false,
  email_enabled: true,
  sms_enabled: false,
  share_data_with_shops: true,
  show_profile_to_insurers: false,
} as const;

/**
 * Log the full Postgres error (code + message + details + hint) so prod logs
 * are diagnostic. Client-facing messages stay sanitized via sanitizeErrorMessage.
 */
function logPostgrestError(context: string, error: unknown): void {
  const e = error as { code?: string; message?: string; details?: string; hint?: string } | null;
  console.error(`${context}:`, {
    code: e?.code,
    message: e?.message,
    details: e?.details,
    hint: e?.hint,
  });
}

/**
 * Detect Postgres errors that indicate the persistence layer itself is
 * unavailable (table missing, schema not applied, RLS denying service role).
 * These are infrastructure-level failures the user can't recover from — and
 * they should degrade to defaults rather than 500 the UI.
 *   42P01 — undefined_table (relation does not exist)
 *   42501 — insufficient_privilege (RLS or grant)
 *   0LP01 — invalid_grant_operation
 */
const PERSISTENCE_UNAVAILABLE_CODES = ["42P01", "42501", "0LP01"];

function isPersistenceUnavailable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code !== undefined && PERSISTENCE_UNAVAILABLE_CODES.includes(code);
}

/**
 * GET /notification-preferences
 * Returns the authenticated user's notification preferences.
 * Creates a default row if none exists.
 * Falls back to defaults with fallback:true if the table is missing or RLS
 * denies access — keeps Appearance Settings usable while the data layer is
 * being diagnosed.
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
      logPostgrestError("getNotificationPreferences select", error);
      if (isPersistenceUnavailable(error)) {
        return respond(
          { preferences: { ...FALLBACK_PREFERENCES, clerk_user_id: clerkUserId }, fallback: true },
          200
        );
      }
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
        logPostgrestError("getNotificationPreferences insert default", createError);
        if (isPersistenceUnavailable(createError)) {
          return respond(
            { preferences: { ...FALLBACK_PREFERENCES, clerk_user_id: clerkUserId }, fallback: true },
            200
          );
        }
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
