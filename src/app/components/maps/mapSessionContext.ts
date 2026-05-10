/**
 * MapSessionContext — interface contract for the Persistent Map
 * Session (PMS) provider.
 *
 * Pass 266 (Phase 1 scaffold per Pass 260 §4) — interface defined,
 * no-op default value. The engine handle, slot registration, and
 * routeActiveAt timestamp are placeholders for later phases:
 *
 *   - Phase 2: engine handle becomes a real `MapLibreMap` ref when
 *     the engine is lifted into the provider.
 *   - Phase 3: registerSlot / unregisterSlot become functional
 *     when slot consumers (`<CoverageMapSlot>`) are introduced.
 *   - Phase 4: routeActiveAt becomes the canonical route-keying
 *     signal for the four imperative camera controllers
 *     (per Pass 258 §9, Pass 260 §6 #4).
 *
 * Phase 1 ships the type + default ONLY — runtime is pure no-op.
 *
 * Refs:
 *   - docs/PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md §5 (O6/O1
 *     recommendation, location (d) MapSessionProvider)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §4 (Phase 1
 *     scaffold spec)
 */

import { createContext } from "react";

export type MapSessionContextValue = {
  /**
   * The persistent MapLibre engine handle. `null` in Phase 1
   * (scaffold; no engine mounted yet). Becomes a real handle in
   * Phase 2 when the engine is lifted.
   */
  readonly mapInstance: null;

  /**
   * Timestamp (epoch ms) of the most recent route-active transition.
   * `0` in Phase 1 (no route-active tracking yet). Used by imperative
   * camera controllers to re-key "first-mount" semantics to
   * "first-active-route" when the engine becomes persistent.
   */
  readonly routeActiveAt: number;

  /**
   * Register a slot consumer that wants to display the persistent
   * engine. No-op in Phase 1 (scaffold). Becomes functional in
   * Phase 3 when `<CoverageMapSlot>` lands.
   */
  readonly registerSlot: (slotId: string) => void;

  /**
   * Unregister a slot consumer. No-op in Phase 1 (scaffold).
   */
  readonly unregisterSlot: (slotId: string) => void;
};

const NOOP = (_slotId: string): void => {
  /* Phase 1 scaffold no-op. */
  void _slotId;
};

/**
 * Default value used both as the React context fallback (when no
 * provider wraps a consumer) AND as the Phase 1 provider's actual
 * value. Phase 2+ replaces the provider's value with a stateful
 * one; the fallback default stays no-op forever.
 */
export const MAP_SESSION_DEFAULT_VALUE: MapSessionContextValue = Object.freeze({
  mapInstance: null,
  routeActiveAt: 0,
  registerSlot: NOOP,
  unregisterSlot: NOOP,
});

export const MapSessionContext = createContext<MapSessionContextValue>(MAP_SESSION_DEFAULT_VALUE);
