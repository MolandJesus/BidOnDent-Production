/**
 * Real-Time Estimate Request Service
 *
 * Subscribes to Supabase Realtime for `estimate_requests` table changes.
 * Notifies shop users when customers submit new estimate requests.
 */

import { supabase } from "../supabaseService";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeEstimatePayload {
  id: string;
  shopName?: string;
  description?: string;
  timeline?: string;
  status?: string;
}

type EstimateCallback = (estimate: RealtimeEstimatePayload) => void;

class RealtimeEstimateService {
  private channel: RealtimeChannel | null = null;
  private callback: EstimateCallback | undefined;

  subscribe(onNewEstimate?: EstimateCallback): () => void {
    if (this.channel) {
      return () => this.unsubscribe();
    }

    this.callback = onNewEstimate;

    this.channel = supabase
      .channel("new-estimate-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "estimate_requests",
        },
        (payload) => {
          if (import.meta.env.DEV) console.log("📩 NEW ESTIMATE REQUEST received:", payload);
          const record = payload.new as Record<string, unknown>;
          const estimate: RealtimeEstimatePayload = {
            id: String(record.id ?? ""),
            shopName: record.shop_name ? String(record.shop_name) : undefined,
            description: record.description ? String(record.description) : undefined,
            timeline: record.timeline ? String(record.timeline) : undefined,
            status: record.status ? String(record.status) : undefined,
          };
          this.callback?.(estimate);
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) console.log("📩 Estimate subscription status:", status);
      });

    return () => this.unsubscribe();
  }

  private unsubscribe(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.callback = undefined;
    }
  }

  // ─── Estimate Update Subscriptions (status changes) ─────────

  private updateChannel: RealtimeChannel | null = null;
  private updateCallbacks: Set<EstimateCallback> = new Set();

  /**
   * Subscribe to estimate_requests UPDATE events (e.g. shop responds, customer accepts/declines).
   * Supports multiple concurrent subscribers. Returns an unsubscribe function.
   */
  subscribeToUpdates(onEstimateUpdate?: EstimateCallback): () => void {
    if (onEstimateUpdate) {
      this.updateCallbacks.add(onEstimateUpdate);
    }

    // Create the channel only once; subsequent callers just add their callback
    if (!this.updateChannel) {
      this.updateChannel = supabase
        .channel("estimate-request-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "estimate_requests",
          },
          (payload) => {
            if (import.meta.env.DEV) console.log("📩 ESTIMATE REQUEST UPDATED:", payload);
            const record = payload.new as Record<string, unknown>;
            const estimate: RealtimeEstimatePayload = {
              id: String(record.id ?? ""),
              shopName: record.shop_name ? String(record.shop_name) : undefined,
              description: record.description ? String(record.description) : undefined,
              timeline: record.timeline ? String(record.timeline) : undefined,
              status: record.status ? String(record.status) : undefined,
            };
            for (const cb of this.updateCallbacks) {
              cb(estimate);
            }
          }
        )
        .subscribe((status) => {
          if (import.meta.env.DEV) console.log("📩 Estimate update subscription status:", status);
        });
    }

    return () => {
      if (onEstimateUpdate) {
        this.updateCallbacks.delete(onEstimateUpdate);
      }
      // Tear down channel only when no subscribers remain
      if (this.updateCallbacks.size === 0) {
        this.unsubscribeFromUpdates();
      }
    };
  }

  private unsubscribeFromUpdates(): void {
    if (this.updateChannel) {
      supabase.removeChannel(this.updateChannel);
      this.updateChannel = null;
      this.updateCallbacks.clear();
    }
  }
}

export const realtimeEstimateService = new RealtimeEstimateService();
