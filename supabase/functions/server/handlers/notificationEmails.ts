/**
 * Notification email dispatcher.
 *
 * Checks user notification preferences before sending.
 * Always graceful — never throws, never blocks the calling handler.
 */
import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sendEmail } from "../utils/email.ts";
import * as templates from "../utils/emailTemplates.ts";

type PreferenceField =
  | "email_bid_updates"
  | "email_report_updates"
  | "email_nearby_reports"
  | "email_estimate_updates";

/**
 * Check if a user has email enabled for a specific category.
 * Returns false if preferences don't exist or email is globally disabled.
 */
async function isEmailEnabled(
  supabase: SupabaseClient,
  clerkUserId: string,
  field: PreferenceField
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("notification_preferences")
      .select(`email_enabled, ${field}`)
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (!data) return true; // Default: enabled (no preferences row = all on)
    if (!data.email_enabled) return false; // Master toggle off
    return data[field] !== false; // Field-level toggle
  } catch {
    return true; // On error, default to sending
  }
}

/**
 * Look up a user's email from profiles table.
 */
async function getUserEmail(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    return data?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Look up a user's display name from profiles table.
 */
async function getUserName(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    return data?.full_name || data?.email || "User";
  } catch {
    return "User";
  }
}

/**
 * Look up a shop's business name from shop_profiles table.
 */
async function getShopName(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string> {
  try {
    const { data } = await supabase
      .from("shop_profiles")
      .select("business_name")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();
    return data?.business_name || "Shop";
  } catch {
    return "Shop";
  }
}

// ── Public dispatch functions ────────────────────────────────────

/**
 * Notify customer that a new bid was received on their report.
 * Called after a bid is created in bids handler.
 */
export async function notifyCustomerNewBid(
  supabase: SupabaseClient,
  customerClerkUserId: string,
  shopClerkUserId: string,
  bidAmount: number,
  reportId: string
): Promise<void> {
  try {
    if (!(await isEmailEnabled(supabase, customerClerkUserId, "email_bid_updates"))) return;
    const email = await getUserEmail(supabase, customerClerkUserId);
    if (!email) return;

    const [customerName, shopName] = await Promise.all([
      getUserName(supabase, customerClerkUserId),
      getShopName(supabase, shopClerkUserId),
    ]);

    const template = templates.newBidReceived({
      customerName,
      shopName,
      amount: bidAmount,
      reportId,
    });

    const result = await sendEmail({ to: email, ...template });
    if (!result.success) {
      console.warn("notifyCustomerNewBid: email failed:", result.error);
    }
  } catch (err) {
    console.error("notifyCustomerNewBid:", err instanceof Error ? err.message : err);
  }
}

/**
 * Notify customer about a claim decision (approved/denied).
 * Called after updateClaimDecision in workflow handler.
 */
export async function notifyCustomerClaimDecision(
  supabase: SupabaseClient,
  customerClerkUserId: string,
  decision: "approved" | "denied",
  amount: number | null,
  reason: string | null,
  reportId: string
): Promise<void> {
  try {
    if (!(await isEmailEnabled(supabase, customerClerkUserId, "email_report_updates"))) return;
    const email = await getUserEmail(supabase, customerClerkUserId);
    if (!email) return;

    const customerName = await getUserName(supabase, customerClerkUserId);
    const template = templates.claimDecisionNotification({
      customerName,
      decision,
      amount,
      reason,
      reportId,
    });

    const result = await sendEmail({ to: email, ...template });
    if (!result.success) {
      console.warn("notifyCustomerClaimDecision: email failed:", result.error);
    }
  } catch (err) {
    console.error("notifyCustomerClaimDecision:", err instanceof Error ? err.message : err);
  }
}

/**
 * Notify shop about bid acceptance/rejection.
 * Called after bid status update in bids handler.
 */
export async function notifyShopBidStatus(
  supabase: SupabaseClient,
  shopClerkUserId: string,
  customerClerkUserId: string,
  status: "accepted" | "rejected",
  bidAmount: number
): Promise<void> {
  try {
    if (!(await isEmailEnabled(supabase, shopClerkUserId, "email_bid_updates"))) return;
    const email = await getUserEmail(supabase, shopClerkUserId);
    if (!email) return;

    const [shopName, customerName] = await Promise.all([
      getShopName(supabase, shopClerkUserId),
      getUserName(supabase, customerClerkUserId),
    ]);

    const template = templates.bidStatusNotification({
      shopName,
      customerName,
      status,
      amount: bidAmount,
    });

    const result = await sendEmail({ to: email, ...template });
    if (!result.success) {
      console.warn("notifyShopBidStatus: email failed:", result.error);
    }
  } catch (err) {
    console.error("notifyShopBidStatus:", err instanceof Error ? err.message : err);
  }
}


