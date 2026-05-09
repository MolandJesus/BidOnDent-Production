/**
 * Map test utilities — Block D / Pass 231e.
 *
 * Reusable test infrastructure for the BidOnDent map runtime.
 * Test-only support — no production runtime imports here.
 *
 * IMPORTANT: `vi.mock()` is auto-hoisted by vitest and CANNOT be
 * wrapped inside helper functions. Tests must invoke `vi.mock()`
 * directly at the top of the test file. This module provides
 * factory functions whose return values can be USED inside such
 * `vi.mock` calls, plus non-mock helpers that may be called freely.
 *
 * Surface:
 * - `createReactMapGlMaplibreStub()` — returns the stub module
 *   shape for `react-map-gl/maplibre`. Use inside the test's own
 *   `vi.mock('react-map-gl/maplibre', () => createReactMapGlMaplibreStub())`.
 * - `installPrefersReducedMotion(reduce)` — install a matchMedia
 *   stub honoring a chosen `prefers-reduced-motion` value, returning
 *   a teardown function for `afterEach`.
 * - `viewportFixtures` — canonical viewport data used across tests.
 * - `assertResizePatchSideEffectObserved()` — assertion for KI-190
 *   future CI test.
 * - `resetResizePatchMarker()` — reset the patch marker for clean
 *   beforeEach state.
 * - `setResizePatchMarkerForTest()` — set the marker manually in
 *   tests that simulate the patch's effect.
 *
 * References:
 * - LAW_MAP_RENDERER_CONTRACT.md §3 lifecycle obligations.
 * - REF_MAP_MOTION_CONTRACT_2026-05-09.md §4 reduced-motion
 *   inheritance rule.
 * - REF_MAP_TEST_COVERAGE_GAPS_2026-05-09.md §3 per-phase test
 *   requirements.
 *
 * Authorized test-only source under Block D Pass 231e.
 */

import { createElement } from "react";
import type React from "react";
import type { Mock } from "vitest";

// ---------------------------------------------------------------
// react-map-gl/maplibre stub factory
// ---------------------------------------------------------------

type StubMapProps = {
  children?: React.ReactNode;
  onLoad?: () => void;
  onError?: (err: unknown) => void;
};

/**
 * Shape of the spy-backed map instance used by controller tests.
 *
 * Pass 231i extension. Tests construct one of these via `vi.hoisted`
 * (so the spies exist before vi.mock factories fire), then pass it
 * into `createReactMapGlMaplibreStub({ mapInstance })`. The harness
 * routes `useMap().current` to the supplied instance, which lets
 * controllers (`mapLibreControllers.tsx`,
 * `MapLibreShopDirectoryViewportManager.tsx`, etc.) drive their
 * imperative `flyTo` / `fitBounds` / `jumpTo` calls into spy assertions.
 *
 * Each field is a `vi.fn()` Mock — tests own creation + reset, the
 * harness only consumes. Getters return harmless defaults so any
 * controller that reads zoom/bearing/pitch in its decision path
 * proceeds along a defined branch.
 */
export type StubMapInstance = {
  flyTo: Mock;
  fitBounds: Mock;
  jumpTo: Mock;
  easeTo: Mock;
  panTo: Mock;
  getZoom: Mock;
  getCenter: Mock;
  getBearing: Mock;
  getPitch: Mock;
  resize: Mock;
};

type StubModuleShape = {
  __esModule: true;
  default: (props: StubMapProps) => React.ReactElement;
  AttributionControl: () => React.ReactElement;
  NavigationControl: () => React.ReactElement;
  Source: (props: { children?: React.ReactNode }) => React.ReactElement;
  Layer: () => React.ReactElement;
  Marker: (props: { children?: React.ReactNode }) => React.ReactElement;
  Popup: (props: { children?: React.ReactNode }) => React.ReactElement;
  useMap: () => { current: StubMapInstance | null };
};

/**
 * Returns a stub module shape for `react-map-gl/maplibre`.
 *
 * Renders simple div trees so tests can assert on the surrounding
 * map shell without booting MapLibre / WebGL. The default export
 * fires `onLoad` on the next microtask so consumers can observe
 * lifecycle wiring without async harness work.
 *
 * Use inside the test file:
 *
 *   vi.mock('react-map-gl/maplibre', () => createReactMapGlMaplibreStub());
 *
 * Pass 231i — to drive `useMap().current` to a spy-backed instance
 * (controller tests need this), pass `{ mapInstance }`:
 *
 *   const { mapInstance } = vi.hoisted(() => ({
 *     mapInstance: { flyTo: vi.fn(), jumpTo: vi.fn(), ... },
 *   }));
 *   vi.mock("react-map-gl/maplibre", async () => {
 *     const { createReactMapGlMaplibreStub } = await import(".../mapTestHarness");
 *     return createReactMapGlMaplibreStub({ mapInstance });
 *   });
 *
 * Default behavior (no `mapInstance`) keeps `useMap().current === null`,
 * which is the contract the early controller tests (Pass 192/193 era)
 * relied on.
 */
export function createReactMapGlMaplibreStub(
  options: { mapInstance?: StubMapInstance } = {},
): StubModuleShape {
  // Pass 231g — first real consumer of the stub uncovered that the prior
  // raw-object literal returned by `h()` was not a valid React element under
  // React 18, so any host that rendered `<Map>...</Map>` produced
  // "Objects are not valid as a React child". Using `React.createElement`
  // produces a real element while keeping the same call shape used in
  // every named export below.
  const h = (
    type: string,
    props: Record<string, unknown>,
    children?: React.ReactNode,
  ): React.ReactElement => createElement(type, props, children);
  return {
    __esModule: true,
    default: ({ children, onLoad }: StubMapProps) => {
      if (onLoad) {
        queueMicrotask(() => {
          try {
            onLoad();
          } catch {
            // production code's onLoad must not throw — swallow defensively.
          }
        });
      }
      return h("div", { "data-testid": "stub-map" }, children);
    },
    AttributionControl: () => h("div", { "data-testid": "stub-attribution" }),
    NavigationControl: () => h("div", { "data-testid": "stub-navigation-control" }),
    Source: ({ children }) => h("div", { "data-testid": "stub-source" }, children),
    Layer: () => h("div", { "data-testid": "stub-layer" }),
    Marker: ({ children }) => h("div", { "data-testid": "stub-marker" }, children),
    Popup: ({ children }) => h("div", { "data-testid": "stub-popup" }, children),
    useMap: () => ({ current: options.mapInstance ?? null }),
  };
}

// ---------------------------------------------------------------
// Reduced-motion helper
// ---------------------------------------------------------------

/**
 * Install a matchMedia stub returning a chosen `reduce` value for
 * the `prefers-reduced-motion: reduce` query. All other queries
 * receive `matches: false`.
 *
 * Returns a teardown function — call from `afterEach`.
 *
 * Used by Phase 2 reduced-motion conformance tests
 * (KI-180, KI-191).
 */
export function installPrefersReducedMotion(reduce: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const isReducedMotion = query.includes("prefers-reduced-motion") && query.includes("reduce");
    return {
      matches: isReducedMotion ? reduce : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  }) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

// ---------------------------------------------------------------
// Viewport fixtures
// ---------------------------------------------------------------

/**
 * Canonical viewport fixtures used across map tests. Matches
 * REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md §11 surface set.
 */
export const viewportFixtures = {
  /** Continental US fit. */
  continentalUS: { longitude: -98.5, latitude: 39.5, zoom: 4 },
  /** SF Bay Area fit (typical preview default). */
  bayArea: { longitude: -122.4, latitude: 37.78, zoom: 11 },
  /** Single-pin tight zoom (typical ReportDetailScreen default). */
  singlePinTight: { longitude: -122.4, latitude: 37.78, zoom: 14 },
  /** Multi-pin metro-area fit (autoFit target). */
  metroFit: { longitude: -122.4, latitude: 37.78, zoom: 9 },
} as const;

// ---------------------------------------------------------------
// Resize-patch assertion helper (KI-190)
// ---------------------------------------------------------------

const PATCH_MARKER_KEY = "__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__";

/**
 * Assertion helper for the future KI-190 CI test. The test must
 * ensure that any module mounting a maplibre map has imported
 * `src/app/utils/maplibreResizePatch` first (as a side-effect
 * import).
 *
 * Detail: the patch is expected to set
 * `globalThis.__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__ = true` when it
 * loads. The patch source does not currently set this marker —
 * wiring it in is a separate KI-190 fix pass. This helper exists
 * now so the assertion contract is locked test-side first.
 */
export function assertResizePatchSideEffectObserved(): void {
  const marker = (globalThis as Record<string, unknown>)[PATCH_MARKER_KEY];
  if (marker !== true) {
    throw new Error(
      "maplibreResizePatch side-effect not observed before this assertion. " +
        "The SUT module must import the patch as a side-effect import before any " +
        "maplibre-gl module is touched. See LAW_MAP_RENDERER_CONTRACT.md §3.1 + KI-190.",
    );
  }
}

/**
 * Reset the resize-patch marker. Use in `beforeEach` for tests that
 * need a clean slate.
 */
export function resetResizePatchMarker(): void {
  delete (globalThis as Record<string, unknown>)[PATCH_MARKER_KEY];
}

/**
 * Set the resize-patch marker for tests that simulate the patch's
 * effect. Test-only — production code should never call this. The
 * actual patch will set the marker via its own side-effect import
 * once KI-190 is closed.
 */
export function setResizePatchMarkerForTest(): void {
  (globalThis as Record<string, unknown>)[PATCH_MARKER_KEY] = true;
}
