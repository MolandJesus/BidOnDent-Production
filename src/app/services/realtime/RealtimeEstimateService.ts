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
}

export const realtimeEstimateService = new RealtimeEstimateService();
