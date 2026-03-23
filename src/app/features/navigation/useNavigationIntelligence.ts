/**
 * Navigation Intelligence — State Hook
 *
 * Lightweight React hook that stores recent deviation events,
 * exposes the latest event, and provides a push function for
 * consumers that run detection elsewhere.
 *
 * Sits alongside existing navigation state — does not replace anything.
 */

import { useCallback, useRef, useState } from "react";
import type { DeviationEvent, NavigationSnapshot } from "./deviationTypes";
import { MAX_DEVIATION_HISTORY } from "./deviationTypes";
import { detectDeviations } from "./detectDeviation";

export interface NavigationIntelligence {
  /** All recent deviation events, newest first. */
  events: DeviationEvent[];
  /** The most recently detected event, or null if none. */
  latestEvent: DeviationEvent | null;
  /** Push one or more deviation events into history. */
  pushEvent: (...newEvents: DeviationEvent[]) => void;
  /**
   * Evaluate a new navigation snapshot against the previous one.
   * Automatically runs detection and pushes any events found.
   * Returns the events detected in this evaluation.
   */
  evaluate: (snapshot: NavigationSnapshot) => DeviationEvent[];
  /** Clear all stored events. */
  clear: () => void;
}

/**
 * Hook that manages deviation detection state.
 *
 * Usage:
 * ```ts
 * const intelligence = useNavigationIntelligence();
 *
 * // Option A — manual push
 * intelligence.pushEvent(myEvent);
 *
 * // Option B — auto-detect from snapshots
 * const detected = intelligence.evaluate(currentSnapshot);
 * ```
 */
/** Minimum interval (ms) between events of the same type to avoid duplicates. */
const DUPLICATE_INTERVAL_MS = 5_000;

export function useNavigationIntelligence(): NavigationIntelligence {
  const [events, setEvents] = useState<DeviationEvent[]>([]);
  const previousSnapshotRef = useRef<NavigationSnapshot | null>(null);

  const pushEvent = useCallback((...newEvents: DeviationEvent[]) => {
    if (newEvents.length === 0) return;

    setEvents((current) => {
      // Deduplicate: skip events of the same type within the duplicate interval
      const filtered = newEvents.filter((incoming) => {
        const latest = current.find((e) => e.type === incoming.type);
        if (!latest) return true;
        const gap = Date.parse(incoming.timestamp) - Date.parse(latest.timestamp);
        return gap >= DUPLICATE_INTERVAL_MS;
      });
      if (filtered.length === 0) return current;
      return [...filtered, ...current].slice(0, MAX_DEVIATION_HISTORY);
    });
  }, []);

  const evaluate = useCallback(
    (snapshot: NavigationSnapshot): DeviationEvent[] => {
      const detected = detectDeviations(previousSnapshotRef.current, snapshot);
      previousSnapshotRef.current = snapshot;

      if (detected.length > 0) {
        pushEvent(...detected);
      }

      return detected;
    },
    [pushEvent]
  );

  const clear = useCallback(() => {
    setEvents([]);
    previousSnapshotRef.current = null;
  }, []);

  const latestEvent = events[0] ?? null;

  return { events, latestEvent, pushEvent, evaluate, clear };
}
