/**
 * Reroute — Decision Helper
 *
 * Pure, deterministic function that decides whether a deviation event
 * qualifies for reroute given the current reroute lifecycle state.
 *
 * No side-effects, no timers, no UI — just a yes/no decision with a reason.
 */

import type { DeviationEvent } from "./deviationTypes";
import type { RerouteState } from "./rerouteTypes";
import { REROUTE_COOLDOWN_MS, REROUTE_MIN_SEVERITY } from "./rerouteTypes";

/* ------------------------------------------------------------------ */
/*  Decision result                                                    */
/* ------------------------------------------------------------------ */

export interface RerouteDecision {
  /** Whether reroute should be offered or triggered. */
  eligible: boolean;
  /** Human-readable reason for the decision (useful for diagnostics). */
  reason: string;
}

/* ------------------------------------------------------------------ */
/*  Severity ranking (used for threshold comparison)                   */
/* ------------------------------------------------------------------ */

const SEVERITY_RANK: Record<DeviationEvent["severity"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

/* ------------------------------------------------------------------ */
/*  Decision function                                                  */
/* ------------------------------------------------------------------ */

/**
 * Determine whether a deviation event qualifies for reroute.
 *
 * @param event    - The deviation event to evaluate.
 * @param state    - Current reroute lifecycle state.
 * @param nowMs    - Current time in epoch ms (injectable for testing).
 * @returns Decision with eligibility and human-readable reason.
 */
export function shouldTriggerReroute(
  event: DeviationEvent | null,
  state: RerouteState,
  nowMs: number = Date.now()
): RerouteDecision {
  // No event → nothing to evaluate
  if (!event) {
    return { eligible: false, reason: "No deviation event." };
  }

  // Only off-route events qualify for reroute
  if (event.type !== "off_route") {
    return { eligible: false, reason: `Event type "${event.type}" does not qualify for reroute.` };
  }

  // Severity must meet minimum threshold
  if (SEVERITY_RANK[event.severity] < SEVERITY_RANK[REROUTE_MIN_SEVERITY]) {
    return {
      eligible: false,
      reason: `Severity "${event.severity}" is below reroute threshold "${REROUTE_MIN_SEVERITY}".`,
    };
  }

  // Already in a non-idle lifecycle state → don't re-trigger
  if (state.status === "pending") {
    return { eligible: false, reason: "Reroute is already pending." };
  }

  if (state.status === "completed") {
    return { eligible: false, reason: "Reroute was just completed." };
  }

  // Cooldown check
  if (state.status === "cooldown" && state.lastCompletedAt) {
    const completedAtMs = new Date(state.lastCompletedAt).getTime();
    const elapsed = nowMs - completedAtMs;

    if (elapsed < REROUTE_COOLDOWN_MS) {
      const remainingSec = Math.ceil((REROUTE_COOLDOWN_MS - elapsed) / 1000);
      return {
        eligible: false,
        reason: `Cooldown active — ${remainingSec}s remaining.`,
      };
    }
  }

  // All checks passed
  return { eligible: true, reason: "Off-route deviation qualifies for reroute." };
}
