/**
 * Client service — shop_availability (Pass 59, F4 scaffolding)
 *
 * Two surfaces:
 *
 *   1. updateOwnAvailability(payload) — fire-and-forget mutation used by the
 *      shop role to toggle is_available / availability_note. Mirrors the
 *      circuit-breaker pattern from notificationPreferences.ts and Pass 58's
 *      navigationSavedPlaces.ts: any failure (including KI-095 fallback:true
 *      responses) trips a 60s backoff so the hook doesn't hammer the edge
 *      function while the migration is unapplied.
 *
 *   2. subscribeToShopAvailability(callback) — opens a realtime channel on
 *      shop_profiles.UPDATE filtered to availability columns. Used by the
 *      customer role to keep the marker dot live. Applies the canonical
 *      KI-056/057 realtime auth fix pattern at the call-site (mounted guard
 *      + queueMicrotask + retry-once on CHANNEL_ERROR), since the supabase
 *      client already wires the accessToken callback globally
 *      (src/app/services/supabase/client.ts) and refreshRealtimeAuth is
 *      called every 50s from App.tsx.
 *
 * Realtime publication membership for shop_profiles is added by the same
 * migration that adds the columns
 * (supabase/migrations/20260507000002_add_shop_availability_columns.sql) —
 * before the migration is applied, the realtime channel will simply never
 * receive events. The hook must tolerate that (no errors thrown, no UI
 * regression).
 *
 * KI-115 tracks the unapplied state with apply steps + verification curl.
 */
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabaseService";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

export type ShopAvailabilityState = {
  shopId: string;
  isAvailable: boolean;
  availableUntil: string | null;
  availabilityUpdatedAt: string | null;
  availabilityNote: string | null;
};

export type ShopAvailabilityUpdatePayload = {
  isAvailable: boolean;
  availableUntil?: string | null;
  note?: string | null;
};

export type ShopAvailabilityRealtimeCallback = (state: ShopAvailabilityState) => void;
export type ShopAvailabilityConnectionStatus = "connected" | "error" | "disconnected" | "idle";
export type ShopAvailabilityConnectionCallback = (
  status: ShopAvailabilityConnectionStatus
) => void;

let cachedFailure: { until: number } | null = null;
const FAILURE_BACKOFF_MS = 60_000;

function tripFailureBackoff() {
  cachedFailure = { until: Date.now() + FAILURE_BACKOFF_MS };
}

function backoffActive(): boolean {
  return Boolean(cachedFailure && Date.now() < cachedFailure.until);
}

function clearBackoff() {
  cachedFailure = null;
}

function shapeRow(row: Record<string, unknown>): ShopAvailabilityState | null {
  const shopId = row.id;
  if (typeof shopId !== "string") return null;
  return {
    shopId,
    isAvailable: Boolean(row.is_available),
    availableUntil: (row.available_until as string | null | undefined) ?? null,
    availabilityUpdatedAt: (row.availability_updated_at as string | null | undefined) ?? null,
    availabilityNote: (row.availability_note as string | null | undefined) ?? null,
  };
}

/**
 * Update the signed-in shop's availability. Fire-and-forget from the hook's
 * perspective — `false` return means the breaker is tripped or the cloud
 * call failed; localStorage / optimistic UI state is the authoritative
 * source until the next successful round-trip.
 */
export async function updateOwnShopAvailability(
  payload: ShopAvailabilityUpdatePayload
): Promise<{ success: boolean; availability: ShopAvailabilityState | null }> {
  if (backoffActive()) return { success: false, availability: null };
  try {
    const result = await requestSupabaseEdge<{
      availability?: ShopAvailabilityState | null;
      success?: boolean;
      fallback?: boolean;
    }>(SUPABASE_EDGE_ROUTES.shopAvailability, {
      method: "PUT",
      body: JSON.stringify({
        isAvailable: payload.isAvailable,
        availableUntil: payload.availableUntil ?? null,
        note: payload.note ?? null,
      }),
    });
    if (result.fallback) {
      tripFailureBackoff();
      return { success: false, availability: null };
    }
    clearBackoff();
    return {
      success: Boolean(result.success ?? result.availability),
      availability: result.availability ?? null,
    };
  } catch (err) {
    tripFailureBackoff();
    return { success: false, availability: null };
  }
}

/**
 * One-shot read of a single shop's availability snapshot. Useful for marker
 * rehydration when the realtime subscription hasn't filled the cache yet.
 */
export async function fetchShopAvailability(
  shopId: string
): Promise<ShopAvailabilityState | null> {
  if (!shopId || backoffActive()) return null;
  try {
    const result = await requestSupabaseEdge<{
      availability?: ShopAvailabilityState | null;
      fallback?: boolean;
    }>(`${SUPABASE_EDGE_ROUTES.shopAvailability}/${encodeURIComponent(shopId)}`, {
      method: "GET",
    });
    if (result.fallback) {
      tripFailureBackoff();
      return null;
    }
    clearBackoff();
    return result.availability ?? null;
  } catch (err) {
    tripFailureBackoff();
    return null;
  }
}

/**
 * Subscribe to live availability changes across the shop_profiles table.
 *
 * Caller MUST apply the canonical KI-056/057 realtime auth fix pattern:
 *
 *   useEffect(() => {
 *     let mounted = true;
 *     let unsub: (() => void) | null = null;
 *     function doSubscribe() {
 *       if (!mounted) return;
 *       unsub = subscribeToShopAvailability(callback, statusCallback);
 *     }
 *     queueMicrotask(doSubscribe);
 *     return () => { mounted = false; if (unsub) unsub(); };
 *   }, [...]);
 *
 * Returns an unsubscribe function. Channel handle uses a stable id so a
 * second subscribe call from the same render does not double-open.
 */
export function subscribeToShopAvailability(
  onChange: ShopAvailabilityRealtimeCallback,
  onStatus?: ShopAvailabilityConnectionCallback
): () => void {
  const channelId = "shop-availability-global";
  let channel: RealtimeChannel | null = null;

  try {
    channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shop_profiles",
        },
        (payload) => {
          const state = shapeRow(payload.new as Record<string, unknown>);
          if (state) onChange(state);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          onStatus?.("connected");
        } else if (status === "CHANNEL_ERROR") {
          onStatus?.("error");
        } else if (status === "CLOSED") {
          onStatus?.("disconnected");
        }
      });
  } catch (err) {
    onStatus?.("error");
  }

  return () => {
    try {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      onStatus?.("idle");
    } catch (err) {
      // best-effort cleanup
    }
  };
}
