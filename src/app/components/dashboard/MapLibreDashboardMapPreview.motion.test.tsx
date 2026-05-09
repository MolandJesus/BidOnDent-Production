/**
 * Engine 3 — Pass 236 motion + reduced-motion characterization tests.
 *
 * Phase 2 / Pass 236. Test-only — no production source touched.
 *
 * Locks the motion-side of the Engine 3 contract per
 * [`docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md`](../../../../docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md)
 * §3 Per-engine motion authority + §4 Reduced-motion contract:
 *
 *   | Engine 3 (preview, Tier B, Preview) | Class P: none (suppressed)
 *   |                                     | Class A: none
 *   |                                     | Class O: none
 *   |                                     | Camera authority: controlled
 *   |                                     |   `{...viewState}` per caller
 *
 * "Preview owns no camera." This file pins that contract so any
 * future pass that introduces an imperative `useMap()` handle, a
 * `flyTo`/`easeTo`/`jumpTo` invocation, or any animated viewport
 * transition produces a visible CI diff.
 *
 * Convergence metadata (per Block D / Phase 1 ratification):
 *  1. Runtime paths touched     : test-only (P3 preview consumer
 *                                 surface). No production runtime
 *                                 path touched.
 *  2. Runtime classes touched   : Preview (declarative test).
 *  3. Tier semantics touched    : Tier B (Engine 3 contract).
 *  4. Motion classes touched    : characterization of Class P/A/O
 *                                 absence on Engine 3. No motion
 *                                 introduced.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : characterization (locks
 *                                 "controlled viewState only").
 *  7. Reduced-motion inheritance: characterization (locks the
 *                                 invariant that Engine 3's
 *                                 reduced-motion behavior is
 *                                 trivially conformant by
 *                                 motion-absence).
 *  8. Hidden-authority risk     : zero — additive tests only.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file; no production
 *                                 behavior reverts.
 *
 * Coexists with the Pass 231g lifecycle/auto-fit characterization
 * test file (`MapLibreDashboardMapPreview.test.tsx`). That file
 * remains owner-dirty / untracked per the Phase 2 hard-stop list
 * and is NOT modified by this pass.
 *
 * Refs:
 *  - REF_MAP_MOTION_CONTRACT_2026-05-09.md §3, §4 (engine motion
 *    authority + reduced-motion inheritance rule).
 *  - REF_RUNTIME_PHILOSOPHY_2026-05-09.md (preview owns no camera).
 *  - LAW_ANIMATION_AND_ATMOSPHERE.md (application motion canon +
 *    `prefers-reduced-motion` contract).
 *  - src/app/test-utils/mapTestHarness.ts
 *    (`createReactMapGlMaplibreStub`,
 *    `installPrefersReducedMotion`).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  createReactMapGlMaplibreStub,
  installPrefersReducedMotion,
} from "../../test-utils/mapTestHarness";

// ---------------------------------------------------------------
// Stub setup — capture every render's props on the Map default
// export so we can assert on resolved viewport without booting
// MapLibre / WebGL. Mirrors the Pass 231g pattern for parity.
// ---------------------------------------------------------------

const capturedMapProps: Array<Record<string, unknown>> = [];

vi.mock("react-map-gl/maplibre", async () => {
  const stub = createReactMapGlMaplibreStub();
  return {
    ...stub,
    default: (props: Record<string, unknown>) => {
      capturedMapProps.push({ ...props });
      return stub.default(props as never);
    },
  };
});
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("../../utils/maplibreResizePatch", () => ({}));

import MapLibreDashboardMapPreview, {
  type ReportPin,
} from "./MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 11;

function makeShop(id: string, lat: number, lng: number): CoveragePartnerShop {
  return {
    id,
    name: `Shop ${id}`,
    countyLabel: "San Francisco",
    lat,
    lng,
    label: `Shop ${id}`,
    specialties: ["paint"],
    rating: 4.5,
  };
}

function makePin(id: string, lat: number, lng: number): ReportPin {
  return { id, lat, lng, label: `Pin ${id}` };
}

function lastMapPropsOrThrow(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Engine 3 stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

// ---------------------------------------------------------------
// Engine 3 source content — characterization assertions in §1
// inspect the source file directly to lock the absence of
// imperative camera APIs. This is the strongest available
// characterization for "preview owns no camera": the renderer
// CANNOT call flyTo/easeTo/jumpTo/panTo/zoomTo if the strings
// are not in the source, and CANNOT acquire an imperative
// MapLibre handle without importing useMap().
// ---------------------------------------------------------------

const ENGINE3_SOURCE_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "MapLibreDashboardMapPreview.tsx"
);
const ENGINE3_SOURCE = readFileSync(ENGINE3_SOURCE_PATH, "utf8");

afterEach(cleanup);
beforeEach(() => {
  capturedMapProps.length = 0;
});

// ---------------------------------------------------------------
// §1. Imperative camera authority absence — the "preview owns no
// camera" invariant at the source level.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 236 § preview owns no camera (source-level)", () => {
  it("does not import useMap() from react-map-gl/maplibre", () => {
    // useMap() is the only sanctioned way to obtain an imperative
    // MapLibre handle inside react-map-gl. Engine 3 must not import
    // it. (Engine 2 does, by design — that is the Pass 237 audit
    // surface.)
    expect(ENGINE3_SOURCE).not.toMatch(/\buseMap\b/);
  });

  it("does not invoke flyTo / easeTo / jumpTo / panTo / zoomTo / fitBounds", () => {
    // Class A/O motion APIs. Their absence is the structural proof
    // that Engine 3 issues no programmatic camera motion.
    const forbidden = [
      "flyTo",
      "easeTo",
      "jumpTo",
      "panTo",
      "zoomTo",
      "fitBounds",
      "panBy",
      "zoomBy",
      "rotateTo",
    ];
    for (const api of forbidden) {
      expect(ENGINE3_SOURCE).not.toMatch(new RegExp(`\\.${api}\\s*\\(`));
    }
  });

  it("does not import the imperative maplibre-gl Map type for camera control", () => {
    // The renderer imports `maplibre-gl/dist/maplibre-gl.css` only.
    // Importing `maplibre-gl` symbols (Map, LngLatBounds, etc.) would
    // be a sign of imperative camera ownership creeping in.
    expect(ENGINE3_SOURCE).not.toMatch(/from\s+["']maplibre-gl["']/);
  });
});

// ---------------------------------------------------------------
// §2. Camera authority shape — controlled `{...viewState}` per
// caller. Locks that the renderer flows the props through to
// react-map-gl rather than synthesizing its own animated state.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 236 § camera authority is controlled viewState", () => {
  it("renders with the exact caller-supplied longitude/latitude/zoom when no fit override applies", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("forwards onMove so caller-driven viewport sync stays a controlled-component pattern", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(typeof props.onMove).toBe("function");
  });

  it("re-renders snap (not animated) when caller props change — viewport mutation is synchronous", () => {
    // Class A would interpolate over 200–400ms. Engine 3 has no
    // Class A: a prop change must produce an immediate viewport
    // update on the next render frame, with no intermediate values.
    const { rerender } = render(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const initialZoom = lastMapPropsOrThrow().zoom;
    expect(initialZoom).toBe(CALLER_ZOOM);

    const NEXT_CENTER: [number, number] = [40.71, -74.01];
    const NEXT_ZOOM = 13;
    rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={NEXT_CENTER}
        zoom={NEXT_ZOOM}
        isLight
      />
    );

    // The very next captured props must reflect the new caller state
    // exactly — no easing curve, no intermediate frame.
    const after = lastMapPropsOrThrow();
    expect(after.longitude).toBeCloseTo(NEXT_CENTER[1], 5);
    expect(after.latitude).toBeCloseTo(NEXT_CENTER[0], 5);
    expect(after.zoom).toBe(NEXT_ZOOM);
  });
});

// ---------------------------------------------------------------
// §3. Reduced-motion inheritance — Engine 3 is trivially
// conformant by motion-absence. Re-mounting under
// `prefers-reduced-motion: reduce` MUST produce identical
// captured props to the unreduced case (no motion to suppress
// means no behavior to change).
// ---------------------------------------------------------------

describe("Engine 3 — Pass 236 § reduced-motion conformance (trivial-by-absence)", () => {
  it("renders identically under prefers-reduced-motion: reduce — no motion path to suppress", () => {
    const teardownReduce = installPrefersReducedMotion(true);
    try {
      render(
        <MapLibreDashboardMapPreview
          shops={[makeShop("A", 40.7, -74.0), makeShop("B", 40.8, -73.9)]}
          reportPins={[makePin("p1", 40.75, -73.95)]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
        />
      );
      const reduced = lastMapPropsOrThrow();

      cleanup();
      capturedMapProps.length = 0;

      teardownReduce();
      const teardownNoReduce = installPrefersReducedMotion(false);
      try {
        render(
          <MapLibreDashboardMapPreview
            shops={[makeShop("A", 40.7, -74.0), makeShop("B", 40.8, -73.9)]}
            reportPins={[makePin("p1", 40.75, -73.95)]}
            center={CALLER_CENTER}
            zoom={CALLER_ZOOM}
            isLight
          />
        );
      } finally {
        teardownNoReduce();
      }
      const unreduced = lastMapPropsOrThrow();

      // Engine 3 has no Class A / Class O / Class P motion. Therefore
      // the resolved viewport (longitude/latitude/zoom) and gesture
      // suppression flags MUST be identical regardless of reduce
      // preference. This is the structural conformance proof.
      expect(reduced.longitude).toBeCloseTo(unreduced.longitude as number, 5);
      expect(reduced.latitude).toBeCloseTo(unreduced.latitude as number, 5);
      expect(reduced.zoom).toBe(unreduced.zoom);
      expect(reduced.scrollZoom).toBe(unreduced.scrollZoom);
      expect(reduced.dragPan).toBe(unreduced.dragPan);
      expect(reduced.dragRotate).toBe(unreduced.dragRotate);
      expect(reduced.doubleClickZoom).toBe(unreduced.doubleClickZoom);
      expect(reduced.touchZoomRotate).toBe(unreduced.touchZoomRotate);
      expect(reduced.keyboard).toBe(unreduced.keyboard);
    } finally {
      // Teardown is idempotent if either branch has already restored
      // window.matchMedia.
    }
  });
});

// ---------------------------------------------------------------
// §4. Tooltip motion contract — the only animated element inside
// Engine 3 is the tooltip Popup span (`animate-in fade-in
// zoom-in-95 duration-200`). It MUST carry the
// `motion-reduce:animate-none` opt-out so users with reduce set
// see no animation. This is a source-level lock.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 236 § tooltip honors prefers-reduced-motion", () => {
  it("tooltip animation classes include motion-reduce:animate-none", () => {
    expect(ENGINE3_SOURCE).toMatch(/animate-in[^"]*motion-reduce:animate-none/);
  });

  it("tooltip animation classes are the only animate-in usage in the renderer", () => {
    // If a future pass introduces a second animate-in usage without
    // the motion-reduce opt-out, this guard surfaces it.
    const matches = ENGINE3_SOURCE.match(/animate-in/g) ?? [];
    expect(matches.length).toBe(1);
  });
});
