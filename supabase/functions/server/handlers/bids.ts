import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  requireAuthenticatedProfile,
  requireClerkSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { notifyCustomerNewBid, notifyShopBidStatus } from "./notificationEmails.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

/** Enrich bids with shop geo coordinates from shop_profiles table */
async function enrichBidsWithGeo(
  bids: any[],
  supabase: SupabaseClient
): Promise<any[]> {
  if (!bids || bids.length === 0) return bids;

  // Collect unique clerk_shop_user_ids
  const clerkIds = [
    ...new Set(bids.map((b) => b.clerk_shop_user_id).filter(Boolean)),
  ];
  if (clerkIds.length === 0) return bids;

  const { data: shops } = await supabase
    .from("shop_profiles")
    .select("clerk_user_id, geo_latitude, geo_longitude, business_phone, business_address, business_city, business_state")
    .in("clerk_user_id", clerkIds);

  if (!shops || shops.length === 0) return bids;

  const shopMap = new Map(
    shops.map((s: any) => [s.clerk_user_id, s])
  );

  return bids.map((bid) => {
    const shop = shopMap.get(bid.clerk_shop_user_id);
    return {
      ...bid,
      shop_latitude: shop?.geo_latitude ?? null,
      shop_longitude: shop?.geo_longitude ?? null,
      shop_phone: shop?.business_phone ?? null,
      shop_address: shop?.business_address
        ? `${shop.business_address}${shop.business_city ? `, ${shop.business_city}` : ''}${shop.business_state ? `, ${shop.business_state}` : ''}`
        : null,
    };
  });
}

export async function createBid(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const { clerkUserId, bid } = body;
    const damageReportId = bid?.damage_report_id ?? bid?.report_id;

    if (!clerkUserId || !damageReportId) {
      return respond({ error: "Missing clerkUserId or damage report ID" }, 400);
    }

    if (!profile?.is_admin && profile?.account_type !== "shop") {
      return respond({ error: "Forbidden" }, 403);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const bidAmount = Number(bid?.amount ?? 0);
    if (bidAmount < 0) {
      return respond({ error: "Bid amount cannot be negative" }, 400);
    }

    // Validate the damage report exists
    const { data: reportExists } = await supabase
      .from("damage_reports")
      .select("id")
      .eq("id", damageReportId)
      .maybeSingle();
    if (!reportExists) {
      return respond({ error: "Damage report not found" }, 404);
    }

    const { data, error } = await supabase
      .from("bids")
      .insert({
        damage_report_id: damageReportId,
        shop_user_id: bid?.shop_user_id ?? null,
        clerk_shop_user_id: authenticatedClerkUserId,
        shop_name: bid?.shop_name ?? null,
        shop_email: bid?.shop_email ?? null,
        amount: bidAmount,
        estimated_days: Number(bid?.estimated_days ?? bid?.estimatedDays ?? 0),
        description: bid?.description ?? "",
        notes: bid?.notes ?? null,
        status: "pending",
        shop_rating: bid?.shop_rating ?? null,
        shop_reviews: bid?.shop_reviews ?? null,
        shop_distance: bid?.shop_distance ?? null,
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation → shop already has an active bid on this report
      if (error.code === "23505") {
        return respond({ error: "You already have an active bid on this report" }, 409);
      }
      console.error("Error saving bid:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    // Fire-and-forget: log activity event
    supabase.from("platform_activity_events").insert({
      event_type: "bid_submitted",
      source: "api",
      actor_id: authenticatedClerkUserId,
      object_id: data?.id || null,
      outcome: "success",
      payload: {
        damage_report_id: damageReportId,
        amount: bidAmount,
      },
    }).then(null, () => {});

    // Fire-and-forget: email customer about the new bid
    if (data?.damage_report_id) {
      supabase
        .from("damage_reports")
        .select("clerk_user_id")
        .eq("id", data.damage_report_id)
        .maybeSingle()
        .then(({ data: report }) => {
          if (report?.clerk_user_id) {
            notifyCustomerNewBid(
              supabase,
              report.clerk_user_id,
              authenticatedClerkUserId,
              bidAmount,
              data.damage_report_id
            ).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in create bid endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function getBids(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const reportId = url.searchParams.get("reportId");
    const clerkUserId = url.searchParams.get("clerkUserId");
    const customerClerkUserId = url.searchParams.get("customerClerkUserId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    if (reportId) {
      const { data: report, error: reportError } = await supabase
        .from("damage_reports")
        .select("id, clerk_user_id")
        .eq("id", reportId)
        .maybeSingle();

      if (reportError) {
        console.error("Error fetching report for bid access:", reportError);
        return respond({ error: sanitizeErrorMessage(reportError) }, 500);
      }

      if (!report) {
        return respond({ bids: [] });
      }

      if (!profile?.is_admin && report.clerk_user_id !== session.clerkUserId) {
        return respond({ error: "Forbidden" }, 403);
      }

      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("damage_report_id", reportId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bids by reportId:", error);
        return respond({ error: sanitizeErrorMessage(error) }, 500);
      }
      return respond({ bids: await enrichBidsWithGeo(data, supabase) });
    }

    if (customerClerkUserId) {
      ensureClerkUserMatchesSession(session, customerClerkUserId);

      const { data: reports, error: reportsError } = await supabase
        .from("damage_reports")
        .select("id")
        .eq("clerk_user_id", customerClerkUserId);

      if (reportsError) {
        console.error("Error fetching customer reports for bids:", reportsError);
        return respond({ error: sanitizeErrorMessage(reportsError) }, 500);
      }

      if (!reports || reports.length === 0) {
        return respond({ bids: [] });
      }

      const reportIds = reports.map((r: any) => r.id);
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .in("damage_report_id", reportIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bids for customer:", error);
        return respond({ error: sanitizeErrorMessage(error) }, 500);
      }
      return respond({ bids: await enrichBidsWithGeo(data, supabase) });
    }

    if (clerkUserId) {
      ensureClerkUserMatchesSession(session, clerkUserId);

      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("clerk_shop_user_id", clerkUserId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bids by shop user:", error);
        return respond({ error: sanitizeErrorMessage(error) }, 500);
      }
      return respond({ bids: await enrichBidsWithGeo(data, supabase) });
    }

    return respond({ error: "Missing reportId, clerkUserId, or customerClerkUserId" }, 400);
  } catch (error: any) {
    console.error("Error in get bids endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function updateBidStatus(
  req: Request,
  bidId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    if (!bidId) {
      return respond({ error: "Missing bid ID" }, 400);
    }

    const body = await req.json();
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const { status, clerkUserId } = body;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return respond({ error: "Invalid status. Must be 'accepted' or 'rejected'" }, 400);
    }

    if (!clerkUserId) {
      return respond({ error: "Missing clerkUserId" }, 400);
    }

    ensureClerkUserMatchesSession(session, clerkUserId);

    const { data: existingBid, error: existingBidError } = await supabase
      .from("bids")
      .select("id, damage_report_id, status")
      .eq("id", bidId)
      .maybeSingle();

    if (existingBidError) {
      console.error("Error fetching bid for status update:", existingBidError);
      return respond({ error: sanitizeErrorMessage(existingBidError) }, 500);
    }

    if (!existingBid?.damage_report_id) {
      return respond({ error: "Bid not found" }, 404);
    }

    // State-machine guard: only pending bids can be accepted/rejected
    if (existingBid.status !== "pending") {
      return respond({ error: `Bid is already ${existingBid.status}` }, 409);
    }

    const { data: reportOwner, error: reportOwnerError } = await supabase
      .from("damage_reports")
      .select("id, clerk_user_id")
      .eq("id", existingBid.damage_report_id)
      .maybeSingle();

    if (reportOwnerError) {
      console.error("Error fetching report owner for bid update:", reportOwnerError);
      return respond({ error: sanitizeErrorMessage(reportOwnerError) }, 500);
    }

    if (!profile?.is_admin && reportOwner?.clerk_user_id !== session.clerkUserId) {
      return respond({ error: "Forbidden" }, 403);
    }

    const updatedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("bids")
      .update({ status, updated_at: updatedAt })
      .eq("id", bidId)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating bid status:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    if (!data) {
      const { data: currentBid, error: currentBidError } = await supabase
        .from("bids")
        .select("status")
        .eq("id", bidId)
        .maybeSingle();

      if (currentBidError) {
        console.error("Error fetching current bid after atomic status update miss:", currentBidError);
        return respond({ error: sanitizeErrorMessage(currentBidError) }, 500);
      }

      if (!currentBid) {
        return respond({ error: "Bid not found" }, 404);
      }

      return respond({ error: `Bid is already ${currentBid.status}` }, 409);
    }

    // Business rule: accepting a bid auto-rejects all other pending bids on the same report
    if (status === "accepted" && data?.damage_report_id) {
      const { error: rejectError } = await supabase
        .from("bids")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("damage_report_id", data.damage_report_id)
        .eq("status", "pending")
        .neq("id", bidId);

      if (rejectError) {
        // Non-fatal: bid acceptance succeeded; log for monitoring
        console.error("Error auto-rejecting competing bids:", rejectError);
      }
    }

    // Fire-and-forget: log activity event
    supabase.from("platform_activity_events").insert({
      event_type: status === "accepted" ? "bid_accepted" : "bid_rejected",
      source: "api",
      actor_id: clerkUserId,
      object_id: bidId,
      outcome: "success",
      payload: {
        damage_report_id: data?.damage_report_id || null,
        amount: Number(data?.amount ?? 0),
      },
    }).then(null, () => {});

    // Fire-and-forget: email shop about bid acceptance/rejection
    if (data?.clerk_shop_user_id && (status === "accepted" || status === "rejected")) {
      notifyShopBidStatus(
        supabase,
        data.clerk_shop_user_id,
        clerkUserId,
        status,
        Number(data.amount ?? 0)
      ).catch(() => {});
    }

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in update bid status endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function deleteBid(
  req: Request,
  bidId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    if (!bidId) {
      return respond({ error: "Missing bid ID" }, 400);
    }

    const session = await requireClerkSession(req, { requireEmail: false });
    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get("clerkUserId");

    if (!clerkUserId) {
      return respond({ error: "Missing clerkUserId" }, 400);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const { error } = await supabase
      .from("bids")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", bidId)
      .eq("clerk_shop_user_id", authenticatedClerkUserId)
      .is("deleted_at", null);

    if (error) {
      console.error("Error soft-deleting bid:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true });
  } catch (error: any) {
    console.error("Error in delete bid endpoint:", error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
