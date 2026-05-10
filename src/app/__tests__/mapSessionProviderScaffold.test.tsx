/**
 * Pass 266 — MapSessionProvider Phase 1 scaffold contract test.
 *
 * Pins the engine-less scaffold's behavior:
 *   - Provider renders children.
 *   - Default context value is the no-op shape (immutable, frozen).
 *   - Context default works with or without a provider wrapper.
 *   - registerSlot / unregisterSlot are callable but no-op.
 *
 * Phase 1 ships an inert architectural seam. These tests prove
 * the seam exists and behaves identically with or without a
 * provider wrapper, so consumers written today won't change
 * behavior when later phases swap in a stateful provider value.
 *
 * Refs:
 *   - src/app/components/maps/MapSessionProvider.tsx
 *   - src/app/components/maps/mapSessionContext.ts
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §4
 */

import { useContext } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("../utils/maplibreResizePatch", () => ({}));

import { MapSessionProvider } from "../components/maps/MapSessionProvider";
import {
  MAP_SESSION_DEFAULT_VALUE,
  MapSessionContext,
  type MapSessionContextValue,
} from "../components/maps/mapSessionContext";

function ContextProbe({ onValue }: { onValue: (value: MapSessionContextValue) => void }) {
  const value = useContext(MapSessionContext);
  onValue(value);
  return null;
}

describe("Pass 266 — MapSessionProvider scaffold (Phase 1)", () => {
  it("renders children verbatim", () => {
    const { getByText } = render(
      <MapSessionProvider>
        <span>scaffold-child</span>
      </MapSessionProvider>
    );
    expect(getByText("scaffold-child")).toBeTruthy();
    cleanup();
  });

  it("default context value matches the documented no-op shape", () => {
    expect(MAP_SESSION_DEFAULT_VALUE.mapInstance).toBeNull();
    expect(MAP_SESSION_DEFAULT_VALUE.routeActiveAt).toBe(0);
    expect(typeof MAP_SESSION_DEFAULT_VALUE.registerSlot).toBe("function");
    expect(typeof MAP_SESSION_DEFAULT_VALUE.unregisterSlot).toBe("function");
  });

  it("default context value is frozen (cannot be mutated by accident)", () => {
    expect(Object.isFrozen(MAP_SESSION_DEFAULT_VALUE)).toBe(true);
  });

  it("registerSlot and unregisterSlot are callable but return undefined", () => {
    const r = MAP_SESSION_DEFAULT_VALUE.registerSlot("test-slot-A");
    const u = MAP_SESSION_DEFAULT_VALUE.unregisterSlot("test-slot-A");
    expect(r).toBeUndefined();
    expect(u).toBeUndefined();
  });

  it("nested consumer reads the no-op default when wrapped by provider (Phase 1: provider value === default)", () => {
    let observed: MapSessionContextValue | null = null;
    render(
      <MapSessionProvider>
        <ContextProbe onValue={(v) => (observed = v)} />
      </MapSessionProvider>
    );
    expect(observed).toBe(MAP_SESSION_DEFAULT_VALUE);
    cleanup();
  });

  it("nested consumer reads the no-op default when NO provider wraps it (React context fallback)", () => {
    let observed: MapSessionContextValue | null = null;
    render(<ContextProbe onValue={(v) => (observed = v)} />);
    // Without a provider, useContext returns the createContext() default,
    // which IS MAP_SESSION_DEFAULT_VALUE (passed as the second argument
    // to createContext). This is the key Phase 1 invariant: behavior is
    // identical with or without a provider, so consumers written today
    // won't break when later phases swap in a stateful value.
    expect(observed).toBe(MAP_SESSION_DEFAULT_VALUE);
    cleanup();
  });

  it("provider mounts then unmounts cleanly without throwing", () => {
    const { unmount } = render(
      <MapSessionProvider>
        <span>scaffold-test</span>
      </MapSessionProvider>
    );
    expect(() => unmount()).not.toThrow();
  });

  it("provider can be nested without crashing (defensive against future composition patterns)", () => {
    // Multiple providers in a single tree should not be an error
    // — the inner provider's value wins for descendants per React
    // context semantics. Phase 1 has only one value (the default),
    // so this is a no-op shape test.
    expect(() =>
      render(
        <MapSessionProvider>
          <MapSessionProvider>
            <span>nested-child</span>
          </MapSessionProvider>
        </MapSessionProvider>
      )
    ).not.toThrow();
    cleanup();
  });
});
