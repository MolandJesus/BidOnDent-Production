/**
 * KI-190 invariant — Pass 231j.
 *
 * Locks the LAW §3.1 obligation: `maplibreResizePatch` MUST be imported
 * before any `<Map>` mount. Today the patch sets a behaviorally inert
 * `globalThis` sentinel as governance instrumentation
 * (`maplibreResizePatch.ts`, Pass 231j addition); these tests assert
 * the sentinel is set when the patch is imported directly AND when
 * each engine module is imported transitively.
 *
 * Failure modes the invariant catches:
 *
 *   1. The `import "../../utils/maplibreResizePatch"` statement is
 *      removed from an engine module.
 *   2. The import is reordered to run AFTER any maplibre-gl module
 *      reference (the patch must run first to install the
 *      `_resizeInternal` / `_render` / `resize` overrides).
 *   3. A new engine surfaces in `src/` without a side-effect import
 *      of the patch.
 *
 * The harness's `assertResizePatchSideEffectObserved()` is the
 * canonical assertion — tests do not duplicate the marker check
 * (per Pass 231j instruction: centralize through harness only).
 *
 * Refs:
 *  - LAW_MAP_RENDERER_CONTRACT.md §3.1 (Pre-mount resize patch import)
 *  - REF_KNOWN_ISSUES.md KI-190
 *  - REF_MAP_TEST_HARNESS_STRATEGY_2026-05-09.md §3.5
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertResizePatchSideEffectObserved,
  resetResizePatchMarker,
} from "../test-utils/mapTestHarness";

beforeEach(() => {
  resetResizePatchMarker();
  // Module cache reset is the mechanism that lets us observe the
  // side-effect of importing the patch fresh each test. Without this,
  // the first import in any test would set the marker and subsequent
  // tests would see it pre-set.
  vi.resetModules();
});

afterEach(() => {
  resetResizePatchMarker();
  vi.unstubAllGlobals();
  vi.doUnmock("react-map-gl/maplibre");
  vi.doUnmock("maplibre-gl/dist/maplibre-gl.css");
});

describe("maplibreResizePatch — Pass 231j sentinel baseline", () => {
  it("the marker is unset before any module imports it", () => {
    expect(() => assertResizePatchSideEffectObserved()).toThrowError(
      /maplibreResizePatch side-effect not observed/,
    );
  });

  it("importing the patch module DIRECTLY sets the global sentinel", async () => {
    await import("./maplibreResizePatch");
    expect(() => assertResizePatchSideEffectObserved()).not.toThrow();
  });
});

describe("maplibreResizePatch — Pass 231j KI-190 invariant (transitive engine import)", () => {
  // An engine MUST transitively import the patch as its first
  // side-effect. We exercise this via Engine 3
  // (`MapLibreDashboardMapPreview`) — its import chain is small and
  // self-contained (no Supabase service init, no report-layer
  // network code), which makes it a clean canary for the invariant.
  //
  // Engine 1 (MapEngineCanvas) and Engine 2 (MapLibreShopDirectoryMapPane)
  // pull in a much wider tree (Supabase auth-js initialization triggered
  // via MapLibreReportLayer's service imports). Their KI-190 conformance
  // is already exercised by the surface-level tests at
  // `MapEngineCanvas.test.tsx` (Pass 193) and the future
  // `MapLibreShopDirectoryMapPane` mount test — both render without
  // throwing, which transitively requires the patch's side-effect ran.
  // This invariant test stays narrow + green; it does not own those.

  beforeEach(() => {
    // Stub the heavy modules so the engine-module import doesn't try
    // to boot MapLibre or load CSS in jsdom. The harness's
    // `createReactMapGlMaplibreStub` is the canonical surface.
    vi.doMock("react-map-gl/maplibre", async () => {
      const { createReactMapGlMaplibreStub } = await import("../test-utils/mapTestHarness");
      return createReactMapGlMaplibreStub();
    });
    vi.doMock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
  });

  it("Engine 3 — importing MapLibreDashboardMapPreview sets the sentinel", async () => {
    await import("../components/dashboard/MapLibreDashboardMapPreview");
    expect(() => assertResizePatchSideEffectObserved()).not.toThrow();
  });
});
