import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";
import type { Bid } from "./types";

export async function getBidsForReport(reportId: string): Promise<Bid[]> {
  const data = await requestSupabaseEdge<{ bids: Bid[] }>(
    `${SUPABASE_EDGE_ROUTES.bids}?reportId=${encodeURIComponent(reportId)}`,
    { method: "GET" }
  );
  return data.bids ?? [];
}

export async function submitBid(bid: Bid, clerkUserId?: string): Promise<Bid | null> {
  if (!clerkUserId) {
    throw new Error("Sign in required to submit a bid.");
  }

  const data = await requestSupabaseEdge<{ bid: Bid }>(SUPABASE_EDGE_ROUTES.bids, {
    method: "POST",
    body: JSON.stringify({ clerkUserId, bid }),
  });

  if (import.meta.env.DEV) console.log("✅ Bid submitted successfully");
  return data.bid ?? null;
}

export async function updateBidStatus(
  bidId: string,
  status: "accepted" | "rejected",
  clerkUserId?: string
): Promise<Bid | null> {
  if (!clerkUserId) {
    throw new Error("Sign in required to update bid status.");
  }

  const data = await requestSupabaseEdge<{ bid: Bid }>(
    `${SUPABASE_EDGE_ROUTES.bids}/${encodeURIComponent(bidId)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status, clerkUserId }),
    }
  );

  if (import.meta.env.DEV) console.log(`✅ Bid status updated to ${status}`);
  return data.bid ?? null;
}

export async function getMyBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) {
    return [];
  }

  const data = await requestSupabaseEdge<{ bids: Bid[] }>(
    `${SUPABASE_EDGE_ROUTES.bids}?customerClerkUserId=${encodeURIComponent(clerkUserId)}`,
    { method: "GET" }
  );
  return data.bids ?? [];
}

export async function getShopSubmittedBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) return [];

  const data = await requestSupabaseEdge<{ bids: Bid[] }>(
    `${SUPABASE_EDGE_ROUTES.bids}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
    { method: "GET" }
  );
  return data.bids ?? [];
}

export async function deleteBid(bidId: string, clerkUserId?: string): Promise<boolean> {
  if (!clerkUserId) {
    return false;
  }

  await requestSupabaseEdge<{ success: boolean }>(
    `${SUPABASE_EDGE_ROUTES.bids}/${encodeURIComponent(bidId)}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
    { method: "DELETE" }
  );

  if (import.meta.env.DEV) console.log("✅ Bid deleted successfully");
  return true;
}
