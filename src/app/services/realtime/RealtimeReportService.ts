/**
 * ============================================================================
 * REAL-TIME REPORT SERVICE
 * ============================================================================
 *
 * Leverages Supabase Realtime subscriptions for instant damage report updates.
 * Shops are notified the moment a new repair request is submitted —
 * no manual refresh needed.
 *
 * Follows the same pattern as RealtimeBidService.
 *
 * Usage:
 *   import { realtimeReportService } from './services/realtime/RealtimeReportService';
 *
 *   realtimeReportService.subscribeToNewReports((report) => {
 *     console.log('New report!', report);
 *   });
 * ============================================================================
 */

import { supabase } from "../supabaseService";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Callback types ─────────────────────────────────────────────

export interface RealtimeReportPayload {
  id: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  damageArea?: string;
  damageType?: string;
  description?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  createdAt: string;
}

export type ReportCallback = (report: RealtimeReportPayload) => void;
export type ReportConnectionCallback = (
  status: "connected" | "disconnected" | "error"
) => void;

// ─── Service ────────────────────────────────────────────────────

class RealtimeReportService {
  private channel: RealtimeChannel | null = null;
  private callbacks: {
    onNew?: ReportCallback;
    onStatus?: ReportConnectionCallback;
  } = {};

  constructor() {
    if (import.meta.env.DEV) console.log("📋 Real-time Report Service initialized");
  }

  /**
   * Subscribe to new damage report INSERT events.
   * Returns an unsubscribe function.
   */
  subscribe(
    onNewReport?: ReportCallback,
    onConnectionStatus?: ReportConnectionCallback
  ): () => void {
    if (this.channel) {
      if (import.meta.env.DEV)
        console.log("⚠️ Already subscribed to new reports — skipping");
      return () => this.unsubscribe();
    }

    if (import.meta.env.DEV) console.log("📋 Subscribing to new damage reports");

    this.callbacks = { onNew: onNewReport, onStatus: onConnectionStatus };

    this.channel = supabase
      .channel("new-damage-reports")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "damage_reports",
        },
        (payload) => {
          if (import.meta.env.DEV) console.log("📋 NEW REPORT received:", payload);
          const report = this.transformFromDb(payload.new);
          if (this.callbacks.onNew) this.callbacks.onNew(report);
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV)
          console.log("📋 Report subscription status:", status);

        if (status === "SUBSCRIBED") {
          this.callbacks.onStatus?.("connected");
        } else if (status === "CHANNEL_ERROR") {
          this.callbacks.onStatus?.("error");
        } else if (status === "CLOSED") {
          this.callbacks.onStatus?.("disconnected");
        }
      });

    return () => this.unsubscribe();
  }

  /**
   * Tear down the subscription and release the channel.
   */
  unsubscribe(): void {
    if (this.channel) {
      if (import.meta.env.DEV)
        console.log("📋 Unsubscribing from damage reports");
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.callbacks = {};
    }
  }

  /** Whether a subscription is currently active. */
  isSubscribed(): boolean {
    return this.channel !== null;
  }

  // ─── Internal ───────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase realtime payload shape varies
  private transformFromDb(row: Record<string, any>): RealtimeReportPayload {
    return {
      id: row.id,
      vehicleYear: row.vehicle_year ?? undefined,
      vehicleMake: row.vehicle_make ?? undefined,
      vehicleModel: row.vehicle_model ?? undefined,
      damageArea: row.damage_area ?? row.damage_areas ?? undefined,
      damageType: row.damage_type ?? undefined,
      description: row.description ?? undefined,
      zipCode: row.zip_code ?? undefined,
      city: row.city ?? undefined,
      state: row.state ?? undefined,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      status: row.status ?? "pending",
      createdAt: row.created_at ?? new Date().toISOString(),
    };
  }
}

// ─── Singleton export ───────────────────────────────────────────

export const realtimeReportService = new RealtimeReportService();
