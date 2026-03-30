import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";
import type { Bid } from "./types";

export async function getBidsForReport(reportId: string): Promise<Bid[]> {
  try {
    const data = await requestSupabaseEdge<{ bids: Bid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?reportId=${encodeURIComponent(reportId)}`,
      { method: "GET" }
    );
    return data.bids ?? [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getBidsForReport:", error);
    return [];
  }
}

export async function submitBid(bid: Bid, clerkUserId?: string): Promise<Bid | null> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) console.error("submitBid: No clerkUserId provided");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ bid: Bid }>(SUPABASE_EDGE_ROUTES.bids, {
      method: "POST",
      body: JSON.stringify({ clerkUserId, bid }),
    });

    if (import.meta.env.DEV) console.log("✅ Bid submitted successfully");
    return data.bid ?? null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in submitBid:", error);
    return null;
  }
}

export async function updateBidStatus(
  bidId: string,
  status: "accepted" | "rejected",
  clerkUserId?: string
): Promise<Bid | null> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) console.error("updateBidStatus: No clerkUserId provided");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ bid: Bid }>(
      `${SUPABASE_EDGE_ROUTES.bids}/${encodeURIComponent(bidId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ status, clerkUserId }),
      }
    );

    if (import.meta.env.DEV) console.log(`✅ Bid status updated to ${status}`);
    return data.bid ?? null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in updateBidStatus:", error);
    return null;
  }
}

export async function getMyBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) {
    return [];
  }

  try {
    const data = await requestSupabaseEdge<{ bids: Bid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?customerClerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "GET" }
    );
    return data.bids ?? [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getMyBids:", error);
    return [];
  }
}

export async function getShopSubmittedBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) return [];

  try {
    const data = await requestSupabaseEdge<{ bids: Bid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "GET" }
    );
    return data.bids ?? [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getShopSubmittedBids:", error);
    return [];
  }
}

export async function deleteBid(bidId: string, clerkUserId?: string): Promise<boolean> {
  if (!clerkUserId) {
    return false;
  }

  try {
    await requestSupabaseEdge<{ success: boolean }>(
      `${SUPABASE_EDGE_ROUTES.bids}/${encodeURIComponent(bidId)}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "DELETE" }
    );

    if (import.meta.env.DEV) console.log("✅ Bid deleted successfully");
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in deleteBid:", error);
    return false;
  }
}
