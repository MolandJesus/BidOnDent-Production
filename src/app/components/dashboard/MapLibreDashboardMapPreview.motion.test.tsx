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

import MapLibreDashboardMapPreview, { type ReportPin } from "./MapLibreDashboardMapPreview";
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
      <MapLibreDashboardMapPreview shops={[]} center={CALLER_CENTER} zoom={CALLER_ZOOM} isLight />
    );
    const props = lastMapPropsOrThrow();
    expect(typeof props.onMove).toBe("function");
  });

  it("re-renders snap (not animated) when caller props change — viewport mutation is synchronous", () => {
    // Class A would interpolate over 200–400ms. Engine 3 has no
    // Class A: a prop change must produce an immediate viewport
    // update on the next render frame, with no intermediate values.
    const { rerender } = render(
      <MapLibreDashboardMapPreview shops={[]} center={CALLER_CENTER} zoom={CALLER_ZOOM} isLight />
    );
    const initialZoom = lastMapPropsOrThrow().zoom;
    expect(initialZoom).toBe(CALLER_ZOOM);

    const NEXT_CENTER: [number, number] = [40.71, -74.01];
    const NEXT_ZOOM = 13;
    rerender(
      <MapLibreDashboardMapPreview shops={[]} center={NEXT_CENTER} zoom={NEXT_ZOOM} isLight />
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

// ---------------------------------------------------------------
// §5. Dynamic auto-fit recomputation — Pass 237 extension to the
// KI-181 hidden-authority characterization. Pass 231g pinned the
// MOUNT-time half (caller vs fittedView at first render). This
// section pins the DYNAMIC half: when the shops collection changes
// such that fittedView recomputes, the resolved viewport snaps to
// the new fit (not the prior one, not the caller `center`).
//
// This is the second of two halves the future declarative
// `autoFit` migration must control. See
// `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §6.1.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 237 § dynamic auto-fit recomputation (KI-181 extension)", () => {
  it("when shops change from one cluster to another, viewport snaps to the new fittedView", () => {
    // Initial: 2 NY shops. fittedView wins (NY midpoint).
    const NY_A = makeShop("nyA", 40.7, -74.0);
    const NY_B = makeShop("nyB", 40.8, -73.9);
    const { rerender } = render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const ny = lastMapPropsOrThrow();
    expect(ny.latitude).toBeCloseTo((40.7 + 40.8) / 2, 5);
    expect(ny.longitude).toBeCloseTo((-74.0 + -73.9) / 2, 5);

    // Re-render with a completely different cluster: 2 LA shops.
    // Caller `center` (SF) is unchanged. The renderer MUST snap to
    // the new LA midpoint, NOT stay on the prior NY frame and NOT
    // fall back to the caller's SF center.
    const LA_A = makeShop("laA", 34.05, -118.25);
    const LA_B = makeShop("laB", 34.15, -118.35);
    rerender(
      <MapLibreDashboardMapPreview
        shops={[LA_A, LA_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const la = lastMapPropsOrThrow();
    expect(la.latitude).toBeCloseTo((34.05 + 34.15) / 2, 5);
    expect(la.longitude).toBeCloseTo((-118.25 + -118.35) / 2, 5);

    // Cross-check: the new viewport is NOT the prior NY frame.
    expect(la.latitude).not.toBeCloseTo(ny.latitude as number, 1);
  });
});

// ---------------------------------------------------------------
// §6. Pass 241 (Phase 3A sub-pass A) — explicit `autoFit`
// authority surface. Locks all four behavior branches enumerated
// in `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §6.2.
//
// Sub-pass A discipline: behavior IDENTICAL when the prop is at
// its default. The new prop is purely an explicitization of the
// existing implicit authority, not a behavior change.
//
//   default (autoFit undefined)            → identical to "always"
//   autoFit="always"                       → fittedView wins (today)
//   autoFit="never"                        → caller wins (NEW opt-out)
//   autoFit="when-no-caller-bounds"
//     + callerBoundsExplicit=false (default) → fittedView wins
//     + callerBoundsExplicit=true            → caller wins
//
// "Preview owns no camera" remains intact: this surface selects
// between caller props and the existing pure-derivation fittedView
// memo. No imperative camera APIs introduced (the §1 source-level
// guards above continue to enforce that).
// ---------------------------------------------------------------

describe("Engine 3 — Pass 241 § explicit autoFit authority (KI-181 migration sub-pass A)", () => {
  const NY_A = makeShop("nyA", 40.7, -74.0);
  const NY_B = makeShop("nyB", 40.8, -73.9);
  const NY_MID_LAT = (40.7 + 40.8) / 2;
  const NY_MID_LNG = (-74.0 + -73.9) / 2;

  // NOTE: every render in this section passes `reportPins={[]}`
  // explicitly. The component's default param `reportPins = []`
  // creates a fresh array ref each call, which (combined with the
  // useMemo/useEffect chain inside the renderer) can compound under
  // some test harness conditions. Mirrors the Pass 237 dynamic-fit
  // test pattern.

  it("default (autoFit undefined) matches the pre-Pass-241 implicit-fit behavior exactly", () => {
    // Compatibility lock: omitting the prop must produce the same
    // resolved viewport as autoFit="always" — i.e. fittedView wins
    // over caller center when ≥2 shops exist. Any regression here
    // would silently change the behavior of every Phase 1 surface.
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(NY_MID_LAT, 5);
    expect(props.longitude).toBeCloseTo(NY_MID_LNG, 5);
    // Cross-check: the resolved viewport is NOT the caller center.
    expect(props.latitude).not.toBeCloseTo(CALLER_CENTER[0], 1);
  });

  it('autoFit="always" + 2 shops → fittedView wins (re-pinned under explicit prop)', () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(NY_MID_LAT, 5);
    expect(props.longitude).toBeCloseTo(NY_MID_LNG, 5);
  });

  it('autoFit="never" + 2 shops → caller wins (auto-fit opt-out)', () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it('autoFit="never" + 0 shops → caller wins (consistent with "always" no-fit branch)', () => {
    // With < 2 fit-points there is no fittedView to override, so
    // both autoFit modes resolve to caller props. This locks the
    // semantic that "never" is the strict superset of the no-fit
    // branch (caller-always-wins), not a new shape.
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it('autoFit="when-no-caller-bounds" + callerBoundsExplicit=false (default) → fittedView wins', () => {
    // This branch documents the "deferred" half of the doctrinal
    // target default. Until call sites are audited (sub-pass B) and
    // declare `callerBoundsExplicit`, the renderer must continue to
    // fit so the existing surfaces remain visually unchanged.
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(NY_MID_LAT, 5);
    expect(props.longitude).toBeCloseTo(NY_MID_LNG, 5);
  });

  it('autoFit="when-no-caller-bounds" + callerBoundsExplicit=true → caller wins', () => {
    // The "intentional bounds" branch: caller asserts that
    // `center`/`zoom` are deliberate framing, and the renderer
    // suppresses the fittedView override. This is what sub-pass B
    // call-site audit will opt into for surfaces like
    // `ReportDetailScreen` (single-report tight-zoom focus).
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
        callerBoundsExplicit
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it('callerBoundsExplicit is ignored under autoFit="always" (no hidden cross-mode coupling)', () => {
    // Discipline lock: the companion prop must be inert outside
    // its declared mode. Setting it under "always" must NOT
    // suppress the fit — that would be hidden cross-mode coupling.
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
        callerBoundsExplicit
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(NY_MID_LAT, 5);
    expect(props.longitude).toBeCloseTo(NY_MID_LNG, 5);
  });

  it('callerBoundsExplicit is ignored under autoFit="never" (no hidden cross-mode coupling)', () => {
    // Symmetric inertness check for the opposite mode.
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="never"
        callerBoundsExplicit
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
  });

  it('dynamic auto-fit recomputation still fires under autoFit="always" (Pass 237 invariant preserved)', () => {
    // Cross-pass invariant: the Pass 237 dynamic-fit guarantee
    // must still hold under the explicit prop. Re-pinning here
    // ensures sub-pass A did not silently disable recomputation.
    const { rerender } = render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    expect(lastMapPropsOrThrow().latitude).toBeCloseTo(NY_MID_LAT, 5);

    const LA_A = makeShop("laA", 34.05, -118.25);
    const LA_B = makeShop("laB", 34.15, -118.35);
    rerender(
      <MapLibreDashboardMapPreview
        shops={[LA_A, LA_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const after = lastMapPropsOrThrow();
    expect(after.latitude).toBeCloseTo((34.05 + 34.15) / 2, 5);
    expect(after.longitude).toBeCloseTo((-118.25 + -118.35) / 2, 5);
  });

  it("autoFit prop appears in source as a typed surface (no dynamic shape)", () => {
    // Source-level lock: the prop must be present as a literal
    // `autoFit` token in the renderer. Guards against accidental
    // removal by future refactors and against dynamic-string
    // workarounds that would re-hide the authority.
    expect(ENGINE3_SOURCE).toMatch(/\bautoFit\b/);
    expect(ENGINE3_SOURCE).toMatch(/\bcallerBoundsExplicit\b/);
    expect(ENGINE3_SOURCE).toMatch(/AutoFitMode/);
  });
});
