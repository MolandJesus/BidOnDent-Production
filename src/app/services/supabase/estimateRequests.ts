import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

export interface EstimateRequest {
  id?: string;
  shop_id: number;
  shop_name: string;
  clerk_customer_user_id?: string;
  customer_name?: string | null;
  customer_email?: string | null;
  description: string;
  timeline: string;
  status?: "pending" | "viewed" | "responded" | "declined" | "accepted";
  response_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function submitEstimateRequest(
  request: Omit<EstimateRequest, "id" | "created_at" | "updated_at">,
  clerkUserId?: string
): Promise<EstimateRequest | null> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) console.error("submitEstimateRequest: No clerkUserId provided");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ estimateRequest: EstimateRequest }>(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      {
        method: "POST",
        body: JSON.stringify({ clerkUserId, request }),
      }
    );

    if (import.meta.env.DEV) console.log("✅ Estimate request submitted successfully");
    return data.estimateRequest ?? null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in submitEstimateRequest:", error);
    return null;
  }
}

export async function getMyEstimateRequests(clerkUserId?: string): Promise<EstimateRequest[]> {
  if (!clerkUserId) return [];

  try {
    const data = await requestSupabaseEdge<{ estimateRequests: EstimateRequest[] }>(
      `${SUPABASE_EDGE_ROUTES.estimateRequests}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "GET" }
    );
    return data.estimateRequests ?? [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getMyEstimateRequests:", error);
    return [];
  }
}

export async function updateEstimateRequest(
  requestId: string,
  status: EstimateRequest["status"],
  clerkUserId: string,
  responseMessage?: string
): Promise<EstimateRequest | null> {
  if (!clerkUserId || !requestId) {
    if (import.meta.env.DEV) console.error("updateEstimateRequest: Missing required params");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ estimateRequest: EstimateRequest }>(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      {
        method: "PATCH",
        body: JSON.stringify({ clerkUserId, requestId, status, responseMessage }),
      }
    );
    return data.estimateRequest ?? null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in updateEstimateRequest:", error);
    return null;
  }
}

export async function getShopEstimateRequests(shopClerkUserId: string): Promise<EstimateRequest[]> {
  if (!shopClerkUserId) return [];

  try {
    const data = await requestSupabaseEdge<{ estimateRequests: EstimateRequest[] }>(
      `${SUPABASE_EDGE_ROUTES.estimateRequests}?shopClerkUserId=${encodeURIComponent(shopClerkUserId)}`,
      { method: "GET" }
    );
    return data.estimateRequests ?? [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getShopEstimateRequests:", error);
    return [];
  }
}

/** Customer accepts or declines an estimate response from a shop */
export async function customerRespondToEstimate(
  requestId: string,
  status: "accepted" | "declined",
  clerkUserId: string
): Promise<EstimateRequest | null> {
  if (!clerkUserId || !requestId) {
    if (import.meta.env.DEV) console.error("customerRespondToEstimate: Missing required params");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ estimateRequest: EstimateRequest }>(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      {
        method: "PUT",
        body: JSON.stringify({ clerkUserId, requestId, status }),
      }
    );
    return data.estimateRequest ?? null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in customerRespondToEstimate:", error);
    return null;
  }
}
