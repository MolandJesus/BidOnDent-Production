import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";
import type { Bid as DbBid } from "./types";
import type { Bid } from "../../types";
import { bidFromDb } from "./adapters";

export async function getBidsForReport(reportId: string): Promise<Bid[]> {
  try {
    const data = await requestSupabaseEdge<{ bids: DbBid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?reportId=${encodeURIComponent(reportId)}`,
      { method: "GET" }
    );
    return (data?.bids ?? []).map(bidFromDb);
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] getBidsForReport failed:", error);
    return [];
  }
}

export async function submitBid(bid: DbBid, clerkUserId?: string): Promise<Bid | null> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) console.warn("[DEV] submitBid: missing Clerk user ID");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ bid: DbBid }>(SUPABASE_EDGE_ROUTES.bids, {
      method: "POST",
      body: JSON.stringify({ clerkUserId, bid }),
    });
    if (import.meta.env.DEV) console.log("✅ Bid submitted successfully");
    return data?.bid ? bidFromDb(data.bid) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] submitBid failed:", error);
    return null;
  }
}

export async function updateBidStatus(
  bidId: string,
  status: "accepted" | "rejected",
  clerkUserId?: string
): Promise<Bid | null> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) console.warn("[DEV] updateBidStatus: missing Clerk user ID");
    return null;
  }

  try {
    const data = await requestSupabaseEdge<{ bid: DbBid }>(
      `${SUPABASE_EDGE_ROUTES.bids}/${encodeURIComponent(bidId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ status, clerkUserId }),
      }
    );
    if (import.meta.env.DEV) console.log(`✅ Bid status updated to ${status}`);
    return data?.bid ? bidFromDb(data.bid) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] updateBidStatus failed:", error);
    return null;
  }
}

export async function getMyBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) {
    return [];
  }

  try {
    const data = await requestSupabaseEdge<{ bids: DbBid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?customerClerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "GET" }
    );
    return (data?.bids ?? []).map(bidFromDb);
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] getMyBids failed:", error);
    return [];
  }
}

export async function getShopSubmittedBids(clerkUserId?: string): Promise<Bid[]> {
  if (!clerkUserId) return [];

  try {
    const data = await requestSupabaseEdge<{ bids: DbBid[] }>(
      `${SUPABASE_EDGE_ROUTES.bids}?clerkUserId=${encodeURIComponent(clerkUserId)}`,
      { method: "GET" }
    );
    return (data?.bids ?? []).map(bidFromDb);
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] getShopSubmittedBids failed:", error);
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
    if (import.meta.env.DEV) console.error("[DEV] deleteBid failed:", error);
    return false;
  }
}
