import { supabase } from "./client";
import type { Bid } from "./types";

export async function getBidsForReport(reportId: string): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("damage_report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bids:", error);
      return [];
    }

    return data as Bid[];
  } catch (error) {
    console.error("Error in getBidsForReport:", error);
    return [];
  }
}

export async function submitBid(bid: Bid): Promise<Bid | null> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("bids")
      .insert({
        shop_user_id: user.id,
        clerk_shop_user_id: user.id,
        damage_report_id: bid.damage_report_id || bid.report_id,
        shop_name: bid.shop_name,
        shop_email: bid.shop_email,
        amount: bid.amount,
        estimated_days: bid.estimated_days,
        description: bid.description,
        notes: bid.notes,
        status: "pending",
        shop_rating: bid.shop_rating,
        shop_reviews: bid.shop_reviews,
        shop_distance: bid.shop_distance
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting bid:", error);
      return null;
    }

    console.log("✅ Bid submitted successfully");
    return data as Bid;
  } catch (error) {
    console.error("Error in submitBid:", error);
    return null;
  }
}

export async function updateBidStatus(
  bidId: string,
  status: "accepted" | "rejected"
): Promise<Bid | null> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from("bids")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bidId)
      .select()
      .single();

    if (error) {
      console.error("Error updating bid status:", error);
      return null;
    }

    console.log(`✅ Bid status updated to ${status}`);
    return data as Bid;
  } catch (error) {
    console.error("Error in updateBidStatus:", error);
    return null;
  }
}

export async function getMyBids(): Promise<Bid[]> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("shop_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching my bids:", error);
      return [];
    }

    return data as Bid[];
  } catch (error) {
    console.error("Error in getMyBids:", error);
    return [];
  }
}

export async function deleteBid(bidId: string): Promise<boolean> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from("bids")
      .delete()
      .eq("id", bidId)
      .eq("shop_user_id", user.id);

    if (error) {
      console.error("Error deleting bid:", error);
      return false;
    }

    console.log("✅ Bid deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteBid:", error);
    return false;
  }
}
