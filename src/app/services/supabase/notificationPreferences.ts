/**
 * Client service for notification preferences edge endpoints.
 */
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

export interface NotificationPreferences {
  id: string;
  clerk_user_id: string;
  in_app_bid_updates: boolean;
  in_app_report_updates: boolean;
  in_app_nearby_reports: boolean;
  in_app_estimate_updates: boolean;
  email_bid_updates: boolean;
  email_report_updates: boolean;
  email_nearby_reports: boolean;
  email_estimate_updates: boolean;
  sms_bid_updates: boolean;
  sms_report_updates: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  share_data_with_shops: boolean;
  show_profile_to_insurers: boolean;
}

/**
 * Fetch the current user's notification preferences.
 * Auto-creates defaults on the server if none exist.
 */
let cachedFailure: { until: number } | null = null;
const FAILURE_BACKOFF_MS = 60_000;

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  if (cachedFailure && Date.now() < cachedFailure.until) {
    throw new Error("notification-preferences temporarily unavailable");
  }
  try {
    const result = await requestSupabaseEdge<{
      preferences: NotificationPreferences;
    }>(SUPABASE_EDGE_ROUTES.notificationPreferences, { method: "GET" });
    cachedFailure = null;
    return result.preferences;
  } catch (err) {
    cachedFailure = { until: Date.now() + FAILURE_BACKOFF_MS };
    throw err;
  }
}

/**
 * Update the current user's notification preferences.
 * Only send the fields that changed.
 */
export async function updateNotificationPreferences(
  updates: Partial<Omit<NotificationPreferences, "id" | "clerk_user_id">>
): Promise<NotificationPreferences> {
  const result = await requestSupabaseEdge<{
    preferences: NotificationPreferences;
  }>(SUPABASE_EDGE_ROUTES.notificationPreferences, {
    method: "PUT",
    body: JSON.stringify({ preferences: updates }),
  });
  return result.preferences;
}
