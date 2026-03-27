import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { softVerifyClerkMutation } from "../utils/clerk.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

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
    .select("clerk_user_id, geo_latitude, geo_longitude")
    .in("clerk_user_id", clerkIds);

  if (!shops || shops.length === 0) return bids;

  const geoMap = new Map(
    shops.map((s: any) => [s.clerk_user_id, { lat: s.geo_latitude, lng: s.geo_longitude }])
  );

  return bids.map((bid) => {
    const geo = geoMap.get(bid.clerk_shop_user_id);
    return {
      ...bid,
      shop_latitude: geo?.lat ?? null,
      shop_longitude: geo?.lng ?? null,
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
    const { clerkUserId, bid } = body;
    const damageReportId = bid?.damage_report_id ?? bid?.report_id;

    if (!clerkUserId || !damageReportId) {
      return respond({ error: "Missing clerkUserId or damage report ID" }, 400);
    }

    const { mismatch } = await softVerifyClerkMutation(req, clerkUserId);
    if (mismatch) {
      return respond({ error: "Unauthorized: clerkUserId does not match session" }, 401);
    }

    const bidAmount = Number(bid?.amount ?? 0);
    if (bidAmount < 0) {
      return respond({ error: "Bid amount cannot be negative" }, 400);
    }

    const { data, error } = await supabase
      .from("bids")
      .insert({
        damage_report_id: damageReportId,
        shop_user_id: bid?.shop_user_id ?? null,
        clerk_shop_user_id: clerkUserId,
        shop_name: bid?.shop_name ?? null,
        shop_email: bid?.shop_email ?? null,
        amount: bidAmount,
        estimated_days: Number(bid?.estimated_days ?? bid?.estimatedDays ?? 0),
        description: bid?.description ?? "",
        notes: bid?.notes ?? null,
        status: bid?.status ?? "pending",
        shop_rating: bid?.shop_rating ?? null,
        shop_reviews: bid?.shop_reviews ?? null,
        shop_distance: bid?.shop_distance ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving bid:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in create bid endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function getBids(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get("reportId");
    const clerkUserId = url.searchParams.get("clerkUserId");
    const customerClerkUserId = url.searchParams.get("customerClerkUserId");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    if (reportId) {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("damage_report_id", reportId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bids by reportId:", error);
        return respond({ error: sanitizeErrorMessage(error) }, 500);
      }
      return respond({ bids: await enrichBidsWithGeo(data, supabase) });
    }

    if (customerClerkUserId) {
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
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bids for customer:", error);
        return respond({ error: sanitizeErrorMessage(error) }, 500);
      }
      return respond({ bids: await enrichBidsWithGeo(data, supabase) });
    }

    if (clerkUserId) {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("clerk_shop_user_id", clerkUserId)
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
    return respond({ error: sanitizeErrorMessage(error) }, 500);
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
    const { status, clerkUserId } = body;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return respond({ error: "Invalid status. Must be 'accepted' or 'rejected'" }, 400);
    }

    if (!clerkUserId) {
      return respond({ error: "Missing clerkUserId" }, 400);
    }

    const { mismatch } = await softVerifyClerkMutation(req, clerkUserId);
    if (mismatch) {
      return respond({ error: "Unauthorized: clerkUserId does not match session" }, 401);
    }

    const { data, error } = await supabase
      .from("bids")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bidId)
      .select()
      .single();

    if (error) {
      console.error("Error updating bid status:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
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

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in update bid status endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
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

    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get("clerkUserId");

    if (!clerkUserId) {
      return respond({ error: "Missing clerkUserId" }, 400);
    }

    const { error } = await supabase
      .from("bids")
      .delete()
      .eq("id", bidId)
      .eq("clerk_shop_user_id", clerkUserId);

    if (error) {
      console.error("Error deleting bid:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true });
  } catch (error: any) {
    console.error("Error in delete bid endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
