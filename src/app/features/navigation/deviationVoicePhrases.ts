/**
 * Deviation Voice Phrases
 *
 * Natural-language phrase templates for deviation alerts and
 * reroute announcements. Each pool is randomly sampled to keep
 * the voice experience varied and non-robotic.
 *
 * Phrase categories:
 *   - Off-route alerts (medium / high severity)
 *   - Delay increase warnings
 *   - Reroute lifecycle announcements (pending, confirmed)
 */

import type { DeviationSeverity, DeviationType } from "./deviationTypes";
import type { RerouteStatus } from "./rerouteTypes";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Pick a random phrase from an array. */
function pickRandom(phrases: readonly string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/* ------------------------------------------------------------------ */
/*  Off-route alert phrases                                            */
/* ------------------------------------------------------------------ */

const offRouteMediumPhrases = [
  "It looks like you've left the route. A new path may be available.",
  "You appear to be off the planned route.",
  "Route deviation detected. Consider reviewing your route.",
  "You've moved away from the expected path.",
  "Navigation notice — you're no longer on the active route.",
] as const;

const offRouteHighPhrases = [
  "You are significantly off route. Review your route now.",
  "Major route deviation. A reroute is recommended.",
  "You've moved far from the planned path. New route options may help.",
  "Significant off-route detected. Please check your navigation.",
  "Attention — you are well outside the active route.",
] as const;

/* ------------------------------------------------------------------ */
/*  Delay increase phrases                                             */
/* ------------------------------------------------------------------ */

const delayIncreasePhrases = [
  "Your estimated arrival time has increased.",
  "Travel time is now longer than expected.",
  "Delay detected on your current route.",
  "Your route is taking longer than planned.",
  "Arrival estimate has been adjusted — expect a delay.",
] as const;

/* ------------------------------------------------------------------ */
/*  Reroute lifecycle phrases                                          */
/* ------------------------------------------------------------------ */

const reroutePendingPhrases = [
  "Reroute in progress. Calculating a new path.",
  "Finding a better route for you.",
  "Working on a new route option.",
  "Searching for an alternate route.",
  "Reroute requested. Stand by for a new path.",
] as const;

const rerouteConfirmedPhrases = [
  "New route confirmed. Follow the updated path.",
  "Reroute complete. Your navigation has been updated.",
  "New route is active. Continue ahead.",
  "Route updated. Guidance is now on the new path.",
  "Reroute applied. Following the new route.",
] as const;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Get a spoken phrase for a deviation event.
 *
 * Returns null if the event type or severity does not warrant speech.
 * Only off-route (medium+) and delay-increase (medium+) produce phrases.
 */
export function getDeviationPhrase(
  type: DeviationType,
  severity: DeviationSeverity
): string | null {
  if (type === "off_route") {
    if (severity === "high") return pickRandom(offRouteHighPhrases);
    if (severity === "medium") return pickRandom(offRouteMediumPhrases);
    return null; // low severity — not worth announcing
  }

  if (type === "delay_increase") {
    if (severity === "low") return null;
    return pickRandom(delayIncreasePhrases);
  }

  // stopped, route_change, unknown → no voice announcement
  return null;
}

/**
 * Get a spoken phrase for a reroute lifecycle transition.
 *
 * Returns null for statuses that do not warrant speech.
 * Only "pending" and "cooldown" (= just completed) produce phrases.
 */
export function getReroutePhrase(status: RerouteStatus): string | null {
  if (status === "pending") return pickRandom(reroutePendingPhrases);
  if (status === "cooldown") return pickRandom(rerouteConfirmedPhrases);
  return null;
}
