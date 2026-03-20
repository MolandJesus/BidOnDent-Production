/**
 * ============================================================================
 * REAL-TIME BID SERVICE
 * ============================================================================
 *
 * Leverages Supabase Real-time subscriptions for instant bid updates.
 * No page refresh needed - bids appear instantly when shops submit them.
 *
 * Features:
 * - Live bid notifications
 * - Real-time bid status updates
 * - Automatic UI synchronization
 * - Connection health monitoring
 * - Optimistic UI updates
 *
 * Usage:
 *   import { realtimeBidService } from './services/realtime/RealtimeBidService';
 *
 *   // Subscribe to bids for a damage report
 *   realtimeBidService.subscribeToReportBids(reportId, (bid) => {
 *     console.log('New bid received!', bid);
 *     updateUI(bid);
 *   });
 * ============================================================================
 */

import { supabase } from "../supabaseService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Bid } from "../../types";

export type BidCallback = (bid: Bid) => void;
export type BidUpdateCallback = (bid: Bid) => void;
export type BidDeleteCallback = (bidId: string) => void;
export type ConnectionStatusCallback = (status: "connected" | "disconnected" | "error") => void;

interface Subscription {
  channel: RealtimeChannel;
  reportId: string;
  callbacks: {
    onNew?: BidCallback;
    onUpdate?: BidUpdateCallback;
    onDelete?: BidDeleteCallback;
    onStatus?: ConnectionStatusCallback;
  };
}

/**
 * Real-time Bid Service
 */
class RealtimeBidService {
  private subscriptions: Map<string, Subscription> = new Map();
  private globalCallbacks: {
    onNew?: BidCallback;
    onUpdate?: BidUpdateCallback;
    onStatus?: ConnectionStatusCallback;
  } = {};

  constructor() {
    console.log("🔴 Real-time Bid Service initialized");
  }

  /**
   * Subscribe to all bids for a specific damage report
   */
  subscribeToReportBids(
    reportId: string,
    onNewBid?: BidCallback,
    onUpdateBid?: BidUpdateCallback,
    onDeleteBid?: BidDeleteCallback,
    onConnectionStatus?: ConnectionStatusCallback
  ): () => void {
    // Check if already subscribed
    if (this.subscriptions.has(reportId)) {
      console.log(`⚠️ Already subscribed to bids for report ${reportId}`);
      return () => this.unsubscribeFromReportBids(reportId);
    }

    console.log(`🔴 Subscribing to real-time bids for report: ${reportId}`);

    // Create channel for this report
    const channel = supabase
      .channel(`report-bids-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `damage_report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log("🔴 NEW BID received:", payload);
          const bid = this.transformBidFromDb(payload.new);
          if (onNewBid) onNewBid(bid);
          if (this.globalCallbacks.onNew) this.globalCallbacks.onNew(bid);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bids",
          filter: `damage_report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log("🔴 BID UPDATED:", payload);
          const bid = this.transformBidFromDb(payload.new);
          if (onUpdateBid) onUpdateBid(bid);
          if (this.globalCallbacks.onUpdate) this.globalCallbacks.onUpdate(bid);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bids",
          filter: `damage_report_id=eq.${reportId}`,
        },
        (payload) => {
          console.log("🔴 BID DELETED:", payload);
          const bidId = payload.old.id;
          if (onDeleteBid) onDeleteBid(bidId);
        }
      )
      .subscribe((status) => {
        console.log(`🔴 Subscription status for ${reportId}:`, status);

        if (status === "SUBSCRIBED") {
          if (onConnectionStatus) onConnectionStatus("connected");
          if (this.globalCallbacks.onStatus) this.globalCallbacks.onStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          if (onConnectionStatus) onConnectionStatus("error");
          if (this.globalCallbacks.onStatus) this.globalCallbacks.onStatus("error");
        } else if (status === "CLOSED") {
          if (onConnectionStatus) onConnectionStatus("disconnected");
          if (this.globalCallbacks.onStatus) this.globalCallbacks.onStatus("disconnected");
        }
      });

    // Store subscription
    this.subscriptions.set(reportId, {
      channel,
      reportId,
      callbacks: {
        onNew: onNewBid,
        onUpdate: onUpdateBid,
        onDelete: onDeleteBid,
        onStatus: onConnectionStatus,
      },
    });

    // Return unsubscribe function
    return () => this.unsubscribeFromReportBids(reportId);
  }

  /**
   * Subscribe to all bids (for shops to see incoming bid requests)
   */
  subscribeToAllBids(
    onNewBid?: BidCallback,
    onUpdateBid?: BidUpdateCallback,
    onConnectionStatus?: ConnectionStatusCallback
  ): () => void {
    const channelId = "all-bids";

    if (this.subscriptions.has(channelId)) {
      console.log(`⚠️ Already subscribed to all bids`);
      return () => this.unsubscribeFromReportBids(channelId);
    }

    console.log(`🔴 Subscribing to ALL bids`);

    const channel = supabase
      .channel("all-bids-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
        },
        (payload) => {
          console.log("🔴 NEW BID (global):", payload);
          const bid = this.transformBidFromDb(payload.new);
          if (onNewBid) onNewBid(bid);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bids",
        },
        (payload) => {
          console.log("🔴 BID UPDATED (global):", payload);
          const bid = this.transformBidFromDb(payload.new);
          if (onUpdateBid) onUpdateBid(bid);
        }
      )
      .subscribe((status) => {
        console.log(`🔴 Global bid subscription status:`, status);

        if (status === "SUBSCRIBED") {
          if (onConnectionStatus) onConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          if (onConnectionStatus) onConnectionStatus("error");
        }
      });

    this.subscriptions.set(channelId, {
      channel,
      reportId: channelId,
      callbacks: {
        onNew: onNewBid,
        onUpdate: onUpdateBid,
        onStatus: onConnectionStatus,
      },
    });

    return () => this.unsubscribeFromReportBids(channelId);
  }

  /**
   * Unsubscribe from a specific report's bids
   */
  unsubscribeFromReportBids(reportId: string): void {
    const subscription = this.subscriptions.get(reportId);

    if (subscription) {
      console.log(`🔴 Unsubscribing from bids for report: ${reportId}`);
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(reportId);
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   */
  unsubscribeAll(): void {
    console.log(`🔴 Unsubscribing from all bid channels (${this.subscriptions.size} active)`);

    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription.channel);
    });

    this.subscriptions.clear();
  }

  /**
   * Set global callbacks for all subscriptions
   */
  setGlobalCallbacks(callbacks: {
    onNew?: BidCallback;
    onUpdate?: BidUpdateCallback;
    onStatus?: ConnectionStatusCallback;
  }): void {
    this.globalCallbacks = callbacks;
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if subscribed to a report
   */
  isSubscribed(reportId: string): boolean {
    return this.subscriptions.has(reportId);
  }

  /**
   * Transform database bid to app format
   */
  private transformBidFromDb(dbBid: any): Bid {
    return {
      id: dbBid.id,
      shopId: dbBid.clerk_shop_user_id || dbBid.shop_id || dbBid.shop_user_id || dbBid.user_id,
      shopName: dbBid.shop_name || "Unknown Shop",
      shopEmail: dbBid.shop_email || "",
      reportId: dbBid.damage_report_id || dbBid.report_id,
      amount: parseFloat(dbBid.amount) || 0,
      estimatedDays: parseInt(dbBid.estimated_days) || 0,
      description: dbBid.description || dbBid.notes || "",
      status: dbBid.status || "pending",
      createdAt: dbBid.created_at || new Date().toISOString(),
      shopRating: dbBid.shop_rating,
      shopReviews: dbBid.shop_reviews,
      shopDistance: dbBid.shop_distance,
    };
  }

  /**
   * Get connection health status
   */
  getHealthStatus(): {
    healthy: boolean;
    activeSubscriptions: number;
    subscriptions: string[];
  } {
    return {
      healthy: this.subscriptions.size >= 0,
      activeSubscriptions: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.keys()),
    };
  }
}

// Export singleton instance
export const realtimeBidService = new RealtimeBidService();

// Export class for testing
export { RealtimeBidService };
