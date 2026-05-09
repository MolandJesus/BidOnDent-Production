/**
 * Engine 3 — reduced-motion × autoFit interaction lock (Pass 246, Phase 3B PREP).
 *
 * What this file is
 * -----------------
 * Characterization tests pinning the interaction surface between
 * `prefers-reduced-motion: reduce` and the four `autoFit` modes
 * shipped in Pass 241. Engine 3 is *trivially* reduced-motion
 * conformant by motion-absence (no Class P / A / O motion is
 * issued anywhere — see Pass 236 source-level guards in
 * MapLibreDashboardMapPreview.motion.test.tsx §1). This file
 * locks that conformance is preserved across every
 * (autoFit, callerBoundsExplicit, prefersReducedMotion) tuple.
 *
 * Why this exists
 * ---------------
 * Per the Phase 3B PREP directive (relayed via owner from ChatGPT
 * meta-arbiter), the next architectural risk surface is the
 * default flip. A specific concern flagged in the dispatch:
 *
 *   "verify future semantic inversion cannot accidentally
 *    introduce: implicit motion, viewport snapping regressions,
 *    or hidden camera continuity drift"
 *
 * The reduced-motion contract (LAW_ANIMATION_AND_ATMOSPHERE.md)
 * says: when the user prefers reduced motion, no animated
 * camera transition fires. Engine 3 satisfies this by never
 * firing animated transitions in the first place — but if a
 * future pass introduces a motion-coupled fit transition
 * (e.g. animating from caller framing into fittedView framing
 * after a state change), the reduced-motion guarantee would
 * silently regress.
 *
 * These tests pin: the resolved viewport that lands on the
 * `<Map>` is identical regardless of the prefers-reduced-motion
 * setting, for every (autoFit, callerBoundsExplicit) tuple.
 *
 * What this file is NOT
 * ---------------------
 * - It does NOT change the renderer.
 * - It does NOT introduce new modes.
 * - It does NOT assert ON the reduced-motion strategy itself
 *   (that lives in `reducedMotionContract.test.ts`). It locks
 *   the *interaction* between reduced-motion and the
 *   explicitized-authority surface introduced in Pass 241.
 *
 * Convergence metadata:
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Preview.
 *  3. Tier semantics touched    : Tier B.
 *  4. Motion classes touched    : characterization of motion
 *                                 absence under all autoFit
 *                                 modes.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : characterization (locks
 *                                 reduced-motion × authority
 *                                 interaction).
 *  7. Reduced-motion inheritance: characterization (locks the
 *                                 cross-mode conformance claim).
 *  8. Hidden-authority risk     : decreased — closes the
 *                                 "future motion-coupled fit
 *                                 transition" regression vector
 *                                 BEFORE any sub-pass C work.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file.
 *
 * Cross-references
 * ----------------
 * - `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` (motion canon +
 *   `prefers-reduced-motion` contract).
 * - `docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md` §3, §4 (engine
 *   motion authority + reduced-motion inheritance rule).
 * - `src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx`
 *   §1 (Pass 236 source-level motion-absence lock).
 * - `src/app/__tests__/reducedMotionContract.test.ts` (cross-app
 *   reduced-motion contract).
 * - `src/app/__tests__/engine3DefaultFlipSimulation.test.tsx`
 *   (Pass 245 default-flip simulation, no-motion variant).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  createReactMapGlMaplibreStub,
  installPrefersReducedMotion,
} from "../test-utils/mapTestHarness";

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
vi.mock("../utils/maplibreResizePatch", () => ({}));

import MapLibreDashboardMapPreview from "../components/dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";

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

function lastMapPropsOrThrow(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Engine 3 stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

afterEach(cleanup);
beforeEach(() => {
  capturedMapProps.length = 0;
});

const NY_A = makeShop("nyA", 40.7, -74.0);
const NY_B = makeShop("nyB", 40.8, -73.9);
const NY_MID_LAT = (40.7 + 40.8) / 2;
const NY_MID_LNG = (-74.0 + -73.9) / 2;

// ---------------------------------------------------------------
// §1. Resolved viewport is invariant under prefers-reduced-motion
// for every (autoFit, callerBoundsExplicit) tuple.
//
// If a future pass introduces an animated transition between
// caller framing and fittedView framing (e.g. easeTo on shop-list
// change), reduced-motion would need to suppress it — and the
// resolved viewport in the reduced branch would diverge from the
// non-reduced branch unless the suppression is implemented
// correctly. These tests close that regression vector by
// asserting the resolved viewport is byte-identical across
// reduced-motion states.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 246 §1 reduced-motion × autoFit interaction", () => {
  type Case = {
    name: string;
    autoFit: "always" | "never" | "when-no-caller-bounds";
    callerBoundsExplicit?: boolean;
    shops: CoveragePartnerShop[];
    expected: { latitude: number; longitude: number; zoom?: number };
  };

  const CASES: Case[] = [
    {
      name: 'autoFit="always" + 2 shops → fittedView wins',
      autoFit: "always",
      shops: [NY_A, NY_B],
      expected: { latitude: NY_MID_LAT, longitude: NY_MID_LNG },
    },
    {
      name: 'autoFit="always" + 0 shops → caller wins (no-fit branch)',
      autoFit: "always",
      shops: [],
      expected: { latitude: CALLER_CENTER[0], longitude: CALLER_CENTER[1], zoom: CALLER_ZOOM },
    },
    {
      name: 'autoFit="never" + 2 shops → caller wins',
      autoFit: "never",
      shops: [NY_A, NY_B],
      expected: { latitude: CALLER_CENTER[0], longitude: CALLER_CENTER[1], zoom: CALLER_ZOOM },
    },
    {
      name: 'autoFit="when-no-caller-bounds" + opt-in + 2 shops → caller wins',
      autoFit: "when-no-caller-bounds",
      callerBoundsExplicit: true,
      shops: [NY_A, NY_B],
      expected: { latitude: CALLER_CENTER[0], longitude: CALLER_CENTER[1], zoom: CALLER_ZOOM },
    },
    {
      name: 'autoFit="when-no-caller-bounds" + un-opted + 2 shops → fittedView wins',
      autoFit: "when-no-caller-bounds",
      callerBoundsExplicit: false,
      shops: [NY_A, NY_B],
      expected: { latitude: NY_MID_LAT, longitude: NY_MID_LNG },
    },
  ];

  for (const c of CASES) {
    it(`reduced-motion=true: ${c.name}`, () => {
      installPrefersReducedMotion(true);
      render(
        <MapLibreDashboardMapPreview
          shops={c.shops}
          reportPins={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit={c.autoFit}
          callerBoundsExplicit={c.callerBoundsExplicit}
        />
      );
      const props = lastMapPropsOrThrow();
      expect(props.latitude).toBeCloseTo(c.expected.latitude, 5);
      expect(props.longitude).toBeCloseTo(c.expected.longitude, 5);
      if (c.expected.zoom !== undefined) {
        expect(props.zoom).toBe(c.expected.zoom);
      }
    });

    it(`reduced-motion=false: ${c.name}`, () => {
      installPrefersReducedMotion(false);
      render(
        <MapLibreDashboardMapPreview
          shops={c.shops}
          reportPins={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit={c.autoFit}
          callerBoundsExplicit={c.callerBoundsExplicit}
        />
      );
      const props = lastMapPropsOrThrow();
      expect(props.latitude).toBeCloseTo(c.expected.latitude, 5);
      expect(props.longitude).toBeCloseTo(c.expected.longitude, 5);
      if (c.expected.zoom !== undefined) {
        expect(props.zoom).toBe(c.expected.zoom);
      }
    });

    it(`reduced-motion is invariant: ${c.name}`, () => {
      // Strongest form of the lock: render twice (reduced + non-
      // reduced) and assert the captured Map props are
      // numerically identical. Any future motion-coupled fit
      // transition that suppresses differently under reduced
      // motion would diverge here.
      installPrefersReducedMotion(true);
      render(
        <MapLibreDashboardMapPreview
          shops={c.shops}
          reportPins={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit={c.autoFit}
          callerBoundsExplicit={c.callerBoundsExplicit}
        />
      );
      const reduced = lastMapPropsOrThrow();
      cleanup();
      capturedMapProps.length = 0;

      installPrefersReducedMotion(false);
      render(
        <MapLibreDashboardMapPreview
          shops={c.shops}
          reportPins={[]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit={c.autoFit}
          callerBoundsExplicit={c.callerBoundsExplicit}
        />
      );
      const full = lastMapPropsOrThrow();

      expect(full.latitude).toBeCloseTo(reduced.latitude as number, 8);
      expect(full.longitude).toBeCloseTo(reduced.longitude as number, 8);
      expect(full.zoom).toBe(reduced.zoom);
    });
  }
});

// ---------------------------------------------------------------
// §2. Reduced-motion × dynamic re-fit invariance.
//
// The Pass 237 dynamic-fit guarantee says: when shops change
// from one set to another under autoFit="always", the resolved
// viewport must follow. This test pins that the dynamic re-fit
// path produces identical resolved viewports under reduced-
// motion vs full-motion. Catches a future regression where a
// shop-list change triggers an animated transition that gets
// suppressed under reduced-motion (resulting in a stale
// viewport).
// ---------------------------------------------------------------

describe("Engine 3 — Pass 246 §2 reduced-motion × dynamic re-fit", () => {
  it("dynamic re-fit lands at the same viewport under reduced and full motion", () => {
    const LA_A = makeShop("laA", 34.05, -118.25);
    const LA_B = makeShop("laB", 34.15, -118.35);
    const LA_MID_LAT = (34.05 + 34.15) / 2;
    const LA_MID_LNG = (-118.25 + -118.35) / 2;

    // Full-motion baseline.
    installPrefersReducedMotion(false);
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
    const full = lastMapPropsOrThrow();
    expect(full.latitude).toBeCloseTo(LA_MID_LAT, 5);
    expect(full.longitude).toBeCloseTo(LA_MID_LNG, 5);

    cleanup();
    capturedMapProps.length = 0;

    // Reduced-motion repeat.
    installPrefersReducedMotion(true);
    const { rerender: rerender2 } = render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    rerender2(
      <MapLibreDashboardMapPreview
        shops={[LA_A, LA_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const reduced = lastMapPropsOrThrow();
    expect(reduced.latitude).toBeCloseTo(LA_MID_LAT, 5);
    expect(reduced.longitude).toBeCloseTo(LA_MID_LNG, 5);

    // Cross-check: full-motion and reduced-motion converge to the
    // same viewport. If a future pass introduces a motion-coupled
    // fit transition that ANY motion-mode suppresses differently,
    // this assertion fires.
    expect(reduced.latitude).toBeCloseTo(full.latitude as number, 8);
    expect(reduced.longitude).toBeCloseTo(full.longitude as number, 8);
    expect(reduced.zoom).toBe(full.zoom);
  });
});
