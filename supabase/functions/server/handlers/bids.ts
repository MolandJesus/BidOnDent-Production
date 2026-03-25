import { SupabaseClient } from "npm:@supabase/supabase-js@2";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

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

    const { data, error } = await supabase
      .from("bids")
      .insert({
        damage_report_id: damageReportId,
        shop_user_id: bid?.shop_user_id ?? null,
        clerk_shop_user_id: clerkUserId,
        shop_name: bid?.shop_name ?? null,
        shop_email: bid?.shop_email ?? null,
        amount: Number(bid?.amount ?? 0),
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
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in create bid endpoint:", error);
    return respond({ error: error.message }, 500);
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

    let query = supabase.from("bids").select("*").order("created_at", { ascending: false });

    if (reportId) {
      query = query.eq("damage_report_id", reportId);
    } else if (clerkUserId) {
      query = query.eq("clerk_shop_user_id", clerkUserId);
    } else {
      return respond({ error: "Missing reportId or clerkUserId" }, 400);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching bids:", error);
      return respond({ error: error.message }, 500);
    }

    return respond({ bids: data });
  } catch (error: any) {
    console.error("Error in get bids endpoint:", error);
    return respond({ error: error.message }, 500);
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

    const { data, error } = await supabase
      .from("bids")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bidId)
      .select()
      .single();

    if (error) {
      console.error("Error updating bid status:", error);
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true, bid: data });
  } catch (error: any) {
    console.error("Error in update bid status endpoint:", error);
    return respond({ error: error.message }, 500);
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
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true });
  } catch (error: any) {
    console.error("Error in delete bid endpoint:", error);
    return respond({ error: error.message }, 500);
  }
}
