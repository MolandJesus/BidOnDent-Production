/**
 * Smoke test for the map test harness — Block D / Pass 231e.
 *
 * Validates that the test-only utilities in
 * `src/app/test-utils/mapTestHarness.ts` work as documented. These
 * utilities are foundation for Phase 1+ engine + orchestration-host
 * + surface-level test passes (KI-187, KI-188, KI-189) and the
 * KI-190 / KI-191 invariant CI tests.
 *
 * NOT a production runtime test. NOT a regression test for any
 * existing component. Pure test-infrastructure smoke.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  installPrefersReducedMotion,
  viewportFixtures,
  assertResizePatchSideEffectObserved,
  resetResizePatchMarker,
  setResizePatchMarkerForTest,
  createReactMapGlMaplibreStub,
} from "./mapTestHarness";

describe("mapTestHarness — installPrefersReducedMotion", () => {
  let teardown: (() => void) | null = null;

  afterEach(() => {
    teardown?.();
    teardown = null;
  });

  it("returns matches:true for the reduce query when reduce=true", () => {
    teardown = installPrefersReducedMotion(true);
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  });

  it("returns matches:false for the reduce query when reduce=false", () => {
    teardown = installPrefersReducedMotion(false);
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(false);
  });

  it("returns matches:false for unrelated queries regardless of reduce flag", () => {
    teardown = installPrefersReducedMotion(true);
    expect(window.matchMedia("(min-width: 1200px)").matches).toBe(false);
  });

  it("teardown restores the previous matchMedia", () => {
    const original = window.matchMedia;
    teardown = installPrefersReducedMotion(true);
    expect(window.matchMedia).not.toBe(original);
    teardown();
    teardown = null;
    expect(window.matchMedia).toBe(original);
  });
});

describe("mapTestHarness — viewportFixtures", () => {
  it("exposes the canonical fixture set", () => {
    expect(viewportFixtures).toMatchObject({
      continentalUS: { longitude: -98.5, latitude: 39.5, zoom: 4 },
      bayArea: { longitude: -122.4, latitude: 37.78, zoom: 11 },
      singlePinTight: { longitude: -122.4, latitude: 37.78, zoom: 14 },
      metroFit: { longitude: -122.4, latitude: 37.78, zoom: 9 },
    });
  });
});

describe("mapTestHarness — resize-patch assertion", () => {
  beforeEach(() => {
    resetResizePatchMarker();
  });

  afterEach(() => {
    resetResizePatchMarker();
  });

  it("throws when the patch marker is absent", () => {
    expect(() => assertResizePatchSideEffectObserved()).toThrowError(
      /maplibreResizePatch side-effect not observed/
    );
  });

  it("passes when the patch marker is present", () => {
    setResizePatchMarkerForTest();
    expect(() => assertResizePatchSideEffectObserved()).not.toThrow();
  });

  it("throws when the marker is set to a non-true value", () => {
    (globalThis as Record<string, unknown>).__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__ = "yes";
    expect(() => assertResizePatchSideEffectObserved()).toThrowError();
  });
});

describe("mapTestHarness — createReactMapGlMaplibreStub", () => {
  it("returns a module shape with the expected named exports", () => {
    const stub = createReactMapGlMaplibreStub();
    expect(stub.__esModule).toBe(true);
    expect(typeof stub.default).toBe("function");
    expect(typeof stub.AttributionControl).toBe("function");
    expect(typeof stub.NavigationControl).toBe("function");
    expect(typeof stub.Source).toBe("function");
    expect(typeof stub.Layer).toBe("function");
    expect(typeof stub.Marker).toBe("function");
    expect(typeof stub.Popup).toBe("function");
    expect(typeof stub.useMap).toBe("function");
    expect(stub.useMap()).toEqual({ current: null });
  });
});
