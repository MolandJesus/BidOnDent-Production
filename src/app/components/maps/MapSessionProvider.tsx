/**
 * MapSessionProvider — architectural seam for the Persistent Map
 * Session (PMS).
 *
 * Pass 266 (Phase 1 scaffold per Pass 260 §4) — engine-less. The
 * provider currently:
 *   - Establishes the React context boundary at the post-Clerk
 *     app shell location (Pass 259 §5 recommended location (d)).
 *   - Imports `maplibreResizePatch` as its first side-effect line
 *     so the resize-crash patch is in place before any future
 *     engine construction (Pass 260 §6 #1).
 *   - Provides the no-op `MAP_SESSION_DEFAULT_VALUE` so consumers
 *     written today won't change behavior when later phases swap
 *     in a stateful provider value.
 *
 * Phase 1 is intentionally inert — provider returns
 * `<MapSessionContext.Provider value={MAP_SESSION_DEFAULT_VALUE}>
 *  {children}</MapSessionContext.Provider>`. No engine mount, no
 * state, no side effects beyond the resize-patch import.
 *
 * Future phases:
 *   - Phase 2: engine lift. Provider mounts `<MapEngineCanvas>`
 *     in an off-screen container; context value becomes stateful
 *     with a real `mapInstance`.
 *   - Phase 3: slot consumers. `<CoverageMapSlot>` reads the
 *     provider context to display the persistent engine at the
 *     active route's location.
 *   - Phase 5: auth-flip cleanup. Provider listens to Clerk
 *     session signal and disposes the engine on sign-out.
 *
 * The first-import-line resize-patch convention matches the
 * existing engines (`MapEngineCanvas`, `MapLibreShopDirectoryMapPane`,
 * `MapLibreDashboardMapPreview`). Module-load is cached — if any
 * engine has already imported the patch, this re-import is a
 * no-op, preserving the patch-once semantics.
 *
 * Rollback (Pass 260 §4.7): TRIVIAL. Delete this file +
 * `mapSessionContext.ts` + the corresponding test +
 * the wrapper line in `App.tsx`.
 *
 * Refs:
 *   - docs/PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md §5 (O6/O1
 *     recommendation)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §4 (Phase 1
 *     scaffold spec)
 *   - src/app/utils/maplibreResizePatch.ts
 */

// Must run before any future Map instantiation — preserves the
// engine-side ordering convention even though Phase 1 mounts no
// engine yet.
import "../../utils/maplibreResizePatch";

import { type ReactNode } from "react";
import { MAP_SESSION_DEFAULT_VALUE, MapSessionContext } from "./mapSessionContext";

export type MapSessionProviderProps = {
  children: ReactNode;
};

export function MapSessionProvider({ children }: MapSessionProviderProps) {
  // Phase 1 — provider is a thin context wrapper around the no-op
  // default. Phase 2 will replace this value with a useState/useRef
  // bundle holding the persistent engine handle + slot registry.
  return (
    <MapSessionContext.Provider value={MAP_SESSION_DEFAULT_VALUE}>
      {children}
    </MapSessionContext.Provider>
  );
}
