/**
 * Hook — useShopAvailability (Pass 59, F4 scaffolding)
 *
 * Two distinct shapes depending on caller role:
 *
 *   useShopAvailability({ mode: "owner", shopId })
 *       → exposes setAvailable(payload) + the latest known state for THIS
 *         shop. Optimistic update is local-first; cloud failure does not
 *         roll back the UI (mirrors Pass 58 saved-places contract).
 *
 *   useShopAvailability({ mode: "viewer" })
 *       → opens a single realtime channel and exposes a Map<shopId, state>
 *         that updates as shop_profiles.UPDATE events stream in. UI
 *         consumers (markers, list cards) read from this map.
 *
 * Both modes are opt-in — the hook does NOT auto-mount anywhere this Pass.
 * UI integration (marker dot color, dashboard toggle) is Pass 62 scope.
 *
 * KI-056/057 realtime auth fix pattern is applied at the viewer subscribe
 * call: mounted guard, queueMicrotask, retry-once on CHANNEL_ERROR. Pattern
 * mirrors src/app/hooks/useBidsForReport.ts §90-170.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchShopAvailability,
  subscribeToShopAvailability,
  updateOwnShopAvailability,
  type ShopAvailabilityConnectionStatus,
  type ShopAvailabilityState,
  type ShopAvailabilityUpdatePayload,
} from "../services/supabase/shopAvailability";

export type UseShopAvailabilityOwnerArgs = {
  mode: "owner";
  /**
   * Optional — when provided, the hook hydrates initial state by issuing a
   * one-shot GET. Otherwise the owner just toggles and trusts the
   * optimistic local state.
   */
  shopId?: string;
};

export type UseShopAvailabilityViewerArgs = {
  mode: "viewer";
  /**
   * When false (default) the hook does not open the realtime channel — the
   * caller can lazily turn it on (e.g., only when the map is visible).
   */
  enabled?: boolean;
};

export type UseShopAvailabilityArgs =
  | UseShopAvailabilityOwnerArgs
  | UseShopAvailabilityViewerArgs;

export type UseShopAvailabilityOwnerReturn = {
  mode: "owner";
  state: ShopAvailabilityState | null;
  isUpdating: boolean;
  setAvailable: (payload: ShopAvailabilityUpdatePayload) => Promise<boolean>;
};

export type UseShopAvailabilityViewerReturn = {
  mode: "viewer";
  states: Map<string, ShopAvailabilityState>;
  connectionStatus: ShopAvailabilityConnectionStatus;
};

export type UseShopAvailabilityReturn =
  | UseShopAvailabilityOwnerReturn
  | UseShopAvailabilityViewerReturn;

const EMPTY_STATES: Map<string, ShopAvailabilityState> = new Map();

export function useShopAvailability(
  args: UseShopAvailabilityArgs
): UseShopAvailabilityReturn {
  // ── owner branch ────────────────────────────────────────────────────────
  const ownerShopId = args.mode === "owner" ? args.shopId : undefined;
  const [ownerState, setOwnerState] = useState<ShopAvailabilityState | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hydrate the owner's last-known state once if a shopId is provided.
  useEffect(() => {
    if (args.mode !== "owner" || !ownerShopId) return;
    let mounted = true;
    void (async () => {
      const snapshot = await fetchShopAvailability(ownerShopId);
      if (!mounted) return;
      if (snapshot) setOwnerState(snapshot);
    })();
    return () => {
      mounted = false;
    };
  }, [args.mode, ownerShopId]);

  const setAvailable = useCallback(
    async (payload: ShopAvailabilityUpdatePayload) => {
      // Optimistic local update — UI flips immediately. Cloud failure does
      // not roll back; the next successful round-trip rehydrates truth.
      setOwnerState((prev) => ({
        shopId: prev?.shopId ?? ownerShopId ?? "",
        isAvailable: payload.isAvailable,
        availableUntil: payload.availableUntil ?? null,
        availabilityNote: payload.note ?? null,
        availabilityUpdatedAt: new Date().toISOString(),
      }));
      setIsUpdating(true);
      try {
        const result = await updateOwnShopAvailability(payload);
        if (result.availability) setOwnerState(result.availability);
        return result.success;
      } finally {
        setIsUpdating(false);
      }
    },
    [ownerShopId]
  );

  // ── viewer branch ───────────────────────────────────────────────────────
  const viewerEnabled = args.mode === "viewer" ? args.enabled !== false : false;
  const [states, setStates] = useState<Map<string, ShopAvailabilityState>>(EMPTY_STATES);
  const [connectionStatus, setConnectionStatus] =
    useState<ShopAvailabilityConnectionStatus>("idle");
  const statesRef = useRef(states);
  statesRef.current = states;

  useEffect(() => {
    if (!viewerEnabled) {
      setConnectionStatus("idle");
      return;
    }

    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let currentUnsubscribe: (() => void) | null = null;

    const handleChange = (state: ShopAvailabilityState) => {
      if (!mounted) return;
      setStates((prev) => {
        const next = new Map(prev);
        next.set(state.shopId, state);
        return next;
      });
    };

    const handleStatus = (status: ShopAvailabilityConnectionStatus) => {
      if (!mounted) return;
      setConnectionStatus(status);
      if (status === "error" && !retryTimer) {
        // Mirrors KI-056/057 fix: retry once after 2s in case JWT was not
        // ready at first subscribe. After that, give up and let the next
        // mount try again.
        retryTimer = setTimeout(() => {
          retryTimer = null;
          if (!mounted) return;
          if (currentUnsubscribe) {
            currentUnsubscribe();
            currentUnsubscribe = null;
          }
          doSubscribe();
        }, 2000);
      }
    };

    function doSubscribe() {
      // StrictMode dev double-invoke guard: cleanup sets mounted=false before
      // any microtask fires, so the first invocation's deferred subscribe is
      // short-circuited here. Pattern matches useBidsForReport.ts.
      if (!mounted) return;
      currentUnsubscribe = subscribeToShopAvailability(handleChange, handleStatus);
    }

    queueMicrotask(doSubscribe);

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (currentUnsubscribe) currentUnsubscribe();
      setConnectionStatus("idle");
    };
  }, [viewerEnabled]);

  if (args.mode === "owner") {
    return {
      mode: "owner",
      state: ownerState,
      isUpdating,
      setAvailable,
    };
  }

  return {
    mode: "viewer",
    states,
    connectionStatus,
  };
}
