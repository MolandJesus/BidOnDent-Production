/**
 * Reroute — Orchestration Hook
 *
 * Lightweight React hook that manages the reroute lifecycle.
 * Sits between deviation detection (upstream) and route selection (downstream).
 *
 * Responsibilities:
 *   - Track reroute lifecycle state (idle → eligible → pending → completed → cooldown)
 *   - Expose typed actions: requestReroute, confirmReroute, cancelReroute
 *   - Manage cooldown timer so repeat triggers are suppressed after a reroute
 *   - Evaluate eligibility reactively when the latest deviation event changes
 *
 * Does NOT own:
 *   - Deviation detection (that's useNavigationIntelligence)
 *   - Route building (that's buildShopRouteOptions / future OSRM fetch)
 *   - UI rendering (that's NavigationDeviationPrompt and ShopDirectoryScreen)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { DeviationEvent } from "./deviationTypes";
import type { RerouteRequest, RerouteState } from "./rerouteTypes";
import { REROUTE_COOLDOWN_MS } from "./rerouteTypes";
import { shouldTriggerReroute } from "./shouldTriggerReroute";

/* ------------------------------------------------------------------ */
/*  Initial state                                                      */
/* ------------------------------------------------------------------ */

const INITIAL_STATE: RerouteState = {
  status: "idle",
  activeRequest: null,
  lastCompletedAt: null,
  completedCount: 0,
};

/* ------------------------------------------------------------------ */
/*  Hook return type                                                   */
/* ------------------------------------------------------------------ */

export interface NavigationReroute {
  /** Current reroute lifecycle state. */
  state: RerouteState;
  /** Whether the current deviation event qualifies for reroute. */
  isEligible: boolean;
  /** Human-readable reason for the current eligibility decision. */
  eligibilityReason: string;
  /**
   * Request a reroute (typically from the off-route prompt "Review route" button).
   * Transitions status from idle/eligible → pending.
   * Returns the created RerouteRequest, or null if not eligible.
   */
  requestReroute: (currentRouteId: string) => RerouteRequest | null;
  /**
   * Confirm the reroute was applied (route was actually changed).
   * Transitions status from pending → completed → cooldown.
   */
  confirmReroute: () => void;
  /**
   * Cancel a pending reroute request.
   * Transitions status from pending → idle.
   */
  cancelReroute: () => void;
  /** Reset all reroute state. */
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Orchestrate reroute lifecycle in response to deviation events.
 *
 * @param latestEvent - The most recent deviation event from useNavigationIntelligence.
 */
export function useNavigationReroute(latestEvent: DeviationEvent | null): NavigationReroute {
  const [state, setState] = useState<RerouteState>(INITIAL_STATE);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------ eligibility evaluation ------ */
  const decision = shouldTriggerReroute(latestEvent, state);

  // Auto-promote to "eligible" when conditions are met
  useEffect(() => {
    if (decision.eligible && state.status === "idle") {
      setState((prev) => ({ ...prev, status: "eligible" }));
    }
  }, [decision.eligible, state.status]);

  // When cooldown expires, return to idle
  useEffect(() => {
    if (state.status !== "cooldown") return;

    // Calculate remaining cooldown
    const completedAtMs = state.lastCompletedAt
      ? new Date(state.lastCompletedAt).getTime()
      : Date.now();
    const remaining = REROUTE_COOLDOWN_MS - (Date.now() - completedAtMs);

    if (remaining <= 0) {
      setState((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    cooldownTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, status: "idle" }));
    }, remaining);

    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, [state.status, state.lastCompletedAt]);

  /* ------ actions ------ */

  const requestReroute = useCallback(
    (currentRouteId: string): RerouteRequest | null => {
      if (!latestEvent) return null;

      // Re-check eligibility at call time
      const liveDecision = shouldTriggerReroute(latestEvent, state);
      if (!liveDecision.eligible && state.status !== "eligible") return null;

      const request: RerouteRequest = {
        id: new Date().toISOString(),
        origin: "user_requested",
        triggerEvent: latestEvent,
        previousRouteId: currentRouteId,
        requestedAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        status: "pending",
        activeRequest: request,
      }));

      return request;
    },
    [latestEvent, state]
  );

  const confirmReroute = useCallback(() => {
    const now = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      status: "cooldown",
      activeRequest: null,
      lastCompletedAt: now,
      completedCount: prev.completedCount + 1,
    }));
  }, []);

  const cancelReroute = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      activeRequest: null,
    }));
  }, []);

  const reset = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    setState(INITIAL_STATE);
  }, []);

  /* ------ cleanup ------ */
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  return {
    state,
    isEligible: decision.eligible,
    eligibilityReason: decision.reason,
    requestReroute,
    confirmReroute,
    cancelReroute,
    reset,
  };
}
