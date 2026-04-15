import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  requireAuthenticatedProfile,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

export async function createEstimateRequest(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const { clerkUserId, request } = body;

    if (!clerkUserId || !request?.description) {
      return respond({ error: "Missing clerkUserId or description" }, 400);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    // Validate the target shop exists
    if (request.shop_id) {
      const { data: shopExists } = await supabase
        .from("shop_profiles")
        .select("id")
        .eq("id", request.shop_id)
        .single();
      if (!shopExists) {
        return respond({ error: "Shop not found" }, 404);
      }
    }

    const { data, error } = await supabase
      .from("estimate_requests")
      .insert({
        clerk_customer_user_id: authenticatedClerkUserId,
        customer_name: profile?.name ?? null,
        customer_email: profile?.email ?? null,
        shop_id: request.shop_id ?? null,
        shop_name: request.shop_name ?? null,
        description: request.description,
        timeline: request.timeline ?? "flexible",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating estimate request:", error);
      return respond({ error: sanitizeErrorMessage(error.message) }, 500);
    }

    return respond({ estimateRequest: data }, 201);
  } catch (error: any) {
    console.error("createEstimateRequest failed:", error);
    return respond({ error: sanitizeErrorMessage(error.message) }, 500);
  }
}

export async function getEstimateRequests(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    }).then((result) => result.session);

    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get("clerkUserId");
    const shopId = url.searchParams.get("shopId");
    const shopClerkUserId = url.searchParams.get("shopClerkUserId");

    if (!clerkUserId && !shopId && !shopClerkUserId) {
      return respond({ error: "Missing clerkUserId, shopId, or shopClerkUserId" }, 400);
    }

    // Validate that the requesting user matches the query identity
    if (clerkUserId) {
      ensureClerkUserMatchesSession(session, clerkUserId);
    }
    if (shopClerkUserId) {
      ensureClerkUserMatchesSession(session, shopClerkUserId);
    }

    let resolvedShopId: number | null = shopId ? parseInt(shopId, 10) : null;

    // Resolve shop_id from clerk user id if needed
    if (!resolvedShopId && shopClerkUserId) {
      const { data: shopProfile } = await supabase
        .from("shop_profiles")
        .select("id")
        .eq("clerk_user_id", shopClerkUserId)
        .single();
      if (shopProfile?.id) {
        resolvedShopId = shopProfile.id;
      } else {
        return respond({ estimateRequests: [] });
      }
    }

    let query = supabase
      .from("estimate_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (resolvedShopId) {
      query = query.eq("shop_id", resolvedShopId);
    } else if (clerkUserId) {
      query = query.eq("clerk_customer_user_id", clerkUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching estimate requests:", error);
      return respond({ error: sanitizeErrorMessage(error.message) }, 500);
    }

    return respond({ estimateRequests: data ?? [] });
  } catch (error: any) {
    console.error("getEstimateRequests failed:", error);
    return respond({ error: sanitizeErrorMessage(error.message) }, 500);
  }
}

export async function updateEstimateRequest(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const { clerkUserId, requestId, status, responseMessage } = body;

    if (!clerkUserId || !requestId || !status) {
      return respond({ error: "Missing clerkUserId, requestId, or status" }, 400);
    }

    // Bind body-supplied clerkUserId to authenticated JWT identity
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const validStatuses = ["pending", "viewed", "responded", "declined"];
    if (!validStatuses.includes(status)) {
      return respond({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, 400);
    }

    // Verify the shop owns this request using JWT-validated identity
    const { data: shopProfile } = await supabase
      .from("shop_profiles")
      .select("id")
      .eq("clerk_user_id", authenticatedClerkUserId)
      .single();

    if (!shopProfile?.id) {
      return respond({ error: "Shop profile not found" }, 403);
    }

    const { data: existing } = await supabase
      .from("estimate_requests")
      .select("shop_id, status")
      .eq("id", requestId)
      .single();

    if (!existing || existing.shop_id !== shopProfile.id) {
      return respond({ error: "Estimate request not found or not owned by this shop" }, 403);
    }

    // Enforce forward-only status transitions
    const allowedTransitions: Record<string, string[]> = {
      pending: ["viewed", "responded", "declined"],
      viewed: ["responded", "declined"],
      responded: [],
      declined: [],
    };
    const currentStatus = existing.status as string;
    const allowed = allowedTransitions[currentStatus] ?? [];
    if (!allowed.includes(status)) {
      return respond(
        { error: `Cannot transition from '${currentStatus}' to '${status}'` },
        400
      );
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (responseMessage !== undefined) {
      updatePayload.response_message = responseMessage;
    }

    const { data, error } = await supabase
      .from("estimate_requests")
      .update(updatePayload)
      .eq("id", requestId)
      .eq("status", currentStatus)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating estimate request:", error);
      return respond({ error: sanitizeErrorMessage(error.message) }, 500);
    }

    if (!data) {
      const { data: current, error: currentError } = await supabase
        .from("estimate_requests")
        .select("status")
        .eq("id", requestId)
        .maybeSingle();
      if (currentError) {
        console.error("Error fetching current estimate request after atomic update miss:", currentError);
        return respond({ error: sanitizeErrorMessage(currentError.message) }, 500);
      }
      if (!current) {
        return respond({ error: "Estimate request not found" }, 404);
      }
      return respond({ error: `Estimate request is already '${current.status}'` }, 409);
    }

    return respond({ estimateRequest: data });
  } catch (error: any) {
    console.error("updateEstimateRequest failed:", error);
    return respond({ error: sanitizeErrorMessage(error.message) }, 500);
  }
}

/** Customer accepts or declines a shop's estimate response */
export async function customerRespondToEstimate(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { profile, session } = await requireAuthenticatedProfile(req, supabase, {
      requireEmail: false,
    });
    const { clerkUserId, requestId, status } = body;

    if (!clerkUserId || !requestId || !status) {
      return respond({ error: "Missing clerkUserId, requestId, or status" }, 400);
    }

    // Bind body-supplied clerkUserId to authenticated JWT identity
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const validStatuses = ["accepted", "declined"];
    if (!validStatuses.includes(status)) {
      return respond({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, 400);
    }

    // Verify the customer owns this estimate request using JWT-validated identity
    const { data: existing } = await supabase
      .from("estimate_requests")
      .select("clerk_customer_user_id, status")
      .eq("id", requestId)
      .single();

    if (!existing || existing.clerk_customer_user_id !== authenticatedClerkUserId) {
      return respond({ error: "Estimate request not found or not owned by this customer" }, 403);
    }

    // Only allow acceptance/decline of responded estimates
    if (existing.status !== "responded") {
      return respond({ error: "Can only accept or decline estimates that have been responded to" }, 400);
    }

    const { data, error } = await supabase
      .from("estimate_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "responded")
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error in customerRespondToEstimate:", error);
      return respond({ error: sanitizeErrorMessage(error.message) }, 500);
    }

    if (!data) {
      const { data: current, error: currentError } = await supabase
        .from("estimate_requests")
        .select("status")
        .eq("id", requestId)
        .maybeSingle();
      if (currentError) {
        console.error("Error fetching current estimate request after atomic update miss:", currentError);
        return respond({ error: sanitizeErrorMessage(currentError.message) }, 500);
      }
      if (!current) {
        return respond({ error: "Estimate request not found" }, 404);
      }
      return respond({ error: `Estimate request is already '${current.status}'` }, 409);
    }

    return respond({ estimateRequest: data });
  } catch (error: any) {
    console.error("customerRespondToEstimate failed:", error);
    return respond({ error: sanitizeErrorMessage(error.message) }, 500);
  }
}
