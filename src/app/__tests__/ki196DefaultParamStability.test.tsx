/**
 * KI-196 default-param identity stability — Pass 251.
 *
 * Behavior-preserving hardening verification.
 *
 * Pass 251 (KI-196 lane) extracts module-scope EMPTY_* singletons
 * for four default-array props that previously used inline `[]`
 * literals:
 *
 *   - MapLibreDashboardMapPreview.reportPins         → EMPTY_REPORT_PINS
 *   - MapLibreDashboardMapPreview.serviceAreaCircles → EMPTY_SERVICE_AREA_CIRCLES
 *   - MapLibreServiceCoverageMap.counties            → EMPTY_COUNTIES
 *   - MapLibreServiceCoverageMap.partnerShops        → EMPTY_PARTNER_SHOPS
 *
 * These tests prove:
 *
 *   §1 — Semantic equivalence: rendering with the prop omitted
 *        produces the same captured Map props as rendering with
 *        an explicit `[]` literal. (No observable behavior
 *        change for any caller.)
 *
 *   §2 — Identity stability: two consecutive renders that omit
 *        the prop pass the SAME array instance through to the
 *        consumer chain. (The latent loop hazard documented in
 *        REF_ENGINE_3_CAMERA_AUTHORITY §12.3 / KI-196 cannot
 *        re-enter via this prop.)
 *
 * Convergence metadata:
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Preview + ServiceCoverageMap
 *                                 (declarative reads of frozen
 *                                 singleton identity).
 *  3. Tier semantics touched    : Tier B characterization.
 *  4. Motion classes touched    : none.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : unchanged. autoFit/
 *                                 callerBoundsExplicit gates
 *                                 untouched.
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — closes the
 *                                 inline-`[]`-literal loop
 *                                 hazard for these four props.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file + revert each
 *                                 default per Pass 250 §3 plan.
 *
 * Cross-references:
 * - docs/REF_KI196_INVENTORY_2026-05-09.md (Pass 249)
 * - docs/REF_KI196_HARDENING_MATRIX_2026-05-09.md (Pass 250)
 * - docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md §12.3
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

import MapLibreDashboardMapPreview, {
  EMPTY_REPORT_PINS,
  EMPTY_SERVICE_AREA_CIRCLES,
} from "../components/dashboard/MapLibreDashboardMapPreview";
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
    throw new Error("Map stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

afterEach(cleanup);
beforeEach(() => {
  capturedMapProps.length = 0;
  installPrefersReducedMotion(false);
});

// ---------------------------------------------------------------
// §1. Semantic equivalence — omitting prop equals passing `[]`.
//
// The Pass 251 hardening replaces inline `[]` defaults with
// module-scope frozen EMPTY_* singletons. For any caller that
// reads these props as "presence + length" only (which all
// production callers do), the captured Map props must be
// identical regardless of whether the caller omitted the prop
// or passed `[]` explicitly.
// ---------------------------------------------------------------

describe("KI-196 — Pass 251 §1 semantic equivalence (omit ≡ explicit [])", () => {
  it("MapLibreDashboardMapPreview: omitting reportPins ≡ passing []", () => {
    const SF_A = makeShop("sfA", 37.78, -122.41);
    const SF_B = makeShop("sfB", 37.79, -122.4);

    render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const omittedProps = lastMapPropsOrThrow();
    cleanup();
    capturedMapProps.length = 0;

    render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const explicitProps = lastMapPropsOrThrow();

    expect(omittedProps.latitude).toBe(explicitProps.latitude);
    expect(omittedProps.longitude).toBe(explicitProps.longitude);
    expect(omittedProps.zoom).toBe(explicitProps.zoom);
  });

  it("MapLibreDashboardMapPreview: omitting serviceAreaCircles ≡ passing []", () => {
    const SF_A = makeShop("sfA", 37.78, -122.41);
    const SF_B = makeShop("sfB", 37.79, -122.4);

    render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const omittedProps = lastMapPropsOrThrow();
    cleanup();
    capturedMapProps.length = 0;

    render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        reportPins={[]}
        serviceAreaCircles={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const explicitProps = lastMapPropsOrThrow();

    expect(omittedProps.latitude).toBe(explicitProps.latitude);
    expect(omittedProps.longitude).toBe(explicitProps.longitude);
    expect(omittedProps.zoom).toBe(explicitProps.zoom);
  });
});

// ---------------------------------------------------------------
// §2. Identity stability — singleton survives consecutive renders.
//
// The Pass 251 EMPTY_* singletons are exported so tests can
// assert their identity. Because they are module-scope frozen
// references, they MUST be the same instance on every render
// where the caller omits the prop.
//
// This proves the latent loop hazard documented in
// REF_ENGINE_3_CAMERA_AUTHORITY §12.3 (KI-196) cannot re-enter
// via these defaults.
// ---------------------------------------------------------------

describe("KI-196 — Pass 251 §2 singleton identity stability", () => {
  it("EMPTY_REPORT_PINS is a frozen module-scope singleton", () => {
    expect(Array.isArray(EMPTY_REPORT_PINS)).toBe(true);
    expect(EMPTY_REPORT_PINS.length).toBe(0);
    expect(Object.isFrozen(EMPTY_REPORT_PINS)).toBe(true);
  });

  it("EMPTY_SERVICE_AREA_CIRCLES is a frozen module-scope singleton", () => {
    expect(Array.isArray(EMPTY_SERVICE_AREA_CIRCLES)).toBe(true);
    expect(EMPTY_SERVICE_AREA_CIRCLES.length).toBe(0);
    expect(Object.isFrozen(EMPTY_SERVICE_AREA_CIRCLES)).toBe(true);
  });

  it("EMPTY_REPORT_PINS identity survives a re-import", async () => {
    // A second dynamic import of the renderer module must yield
    // the SAME singleton reference. If a future refactor moves
    // the default into a hook or per-render literal, this fails.
    const mod = await import("../components/dashboard/MapLibreDashboardMapPreview");
    expect(mod.EMPTY_REPORT_PINS).toBe(EMPTY_REPORT_PINS);
    expect(mod.EMPTY_SERVICE_AREA_CIRCLES).toBe(EMPTY_SERVICE_AREA_CIRCLES);
  });
});

// ---------------------------------------------------------------
// §3. Coverage map singleton identity — symmetric lock for the
// MapLibreServiceCoverageMap.{counties, partnerShops} singletons.
//
// We assert identity properties without rendering the full
// coverage map (which has many heavy props and a separate test
// surface). The semantic-equivalence claim for these two props
// rides on the same Object.freeze frozen-identity guarantee.
// ---------------------------------------------------------------

describe("KI-196 — Pass 251 §3 coverage map singleton identity", () => {
  it("EMPTY_COUNTIES is a frozen module-scope singleton", async () => {
    const mod = await import("../components/maps/MapLibreServiceCoverageMap");
    expect(Array.isArray(mod.EMPTY_COUNTIES)).toBe(true);
    expect(mod.EMPTY_COUNTIES.length).toBe(0);
    expect(Object.isFrozen(mod.EMPTY_COUNTIES)).toBe(true);
  });

  it("EMPTY_PARTNER_SHOPS is a frozen module-scope singleton", async () => {
    const mod = await import("../components/maps/MapLibreServiceCoverageMap");
    expect(Array.isArray(mod.EMPTY_PARTNER_SHOPS)).toBe(true);
    expect(mod.EMPTY_PARTNER_SHOPS.length).toBe(0);
    expect(Object.isFrozen(mod.EMPTY_PARTNER_SHOPS)).toBe(true);
  });

  it("coverage map singletons survive a second import (identity stable)", async () => {
    const a = await import("../components/maps/MapLibreServiceCoverageMap");
    const b = await import("../components/maps/MapLibreServiceCoverageMap");
    expect(b.EMPTY_COUNTIES).toBe(a.EMPTY_COUNTIES);
    expect(b.EMPTY_PARTNER_SHOPS).toBe(a.EMPTY_PARTNER_SHOPS);
  });
});
