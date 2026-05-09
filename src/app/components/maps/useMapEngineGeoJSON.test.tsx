import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useMapEngineGeoJSON } from "./useMapEngineGeoJSON";

afterEach(cleanup);

function Harness({ output }: { output: (out: ReturnType<typeof useMapEngineGeoJSON>) => void }) {
  const result = useMapEngineGeoJSON({
    routeGeometry: [
      [40.7128, -74.006],
      [40.758, -73.9855],
    ],
    counties: [],
    currentPosition: [40.7128, -74.006],
    guidanceMode: false,
    currentHeadingDegrees: null,
    gpsAccuracyMeters: 12,
    activeSearchTarget: {
      label: "Test focus",
      lat: 40.7128,
      lng: -74.006,
      source: "geolocation",
    },
    radiusMeters: 5000,
    radiusMiles: "3.1 mi",
  });
  output(result);
  return null;
}

describe("useMapEngineGeoJSON (Pass 186 contract lock)", () => {
  it("returns all 8 GeoJSON outputs as a stable shape", () => {
    let result: ReturnType<typeof useMapEngineGeoJSON> | null = null;
    render(<Harness output={(out) => (result = out)} />);
    expect(result).not.toBeNull();
    const keys = Object.keys(result!).sort();
    expect(keys).toEqual([
      "countyGeoJSON",
      "gpsAccuracyGeoJSON",
      "gpsHeadingGeoJSON",
      "gpsPointGeoJSON",
      "radiusLabelGeoJSON",
      "routeGeoJSON",
      "searchTargetPointGeoJSON",
      "searchTargetRadiusGeoJSON",
    ]);
  });

  it("produces a route LineString Feature from routeGeometry", () => {
    let result: ReturnType<typeof useMapEngineGeoJSON> | null = null;
    render(<Harness output={(out) => (result = out)} />);
    const route = result!.routeGeoJSON as unknown as {
      type: string;
      geometry: { type: string; coordinates: number[][] };
    };
    expect(route.type).toBe("Feature");
    expect(route.geometry.type).toBe("LineString");
    // Builder swaps [lat, lng] input → [lng, lat] GeoJSON output
    expect(route.geometry.coordinates[0]).toEqual([-74.006, 40.7128]);
  });

  it("produces a search-target point matching the activeSearchTarget coords", () => {
    let result: ReturnType<typeof useMapEngineGeoJSON> | null = null;
    render(<Harness output={(out) => (result = out)} />);
    const point = result!.searchTargetPointGeoJSON as unknown as {
      type: string;
      features: Array<{ geometry: { coordinates: number[] } }>;
    };
    expect(point.type).toBe("FeatureCollection");
    // Builder emits two features (outer + inner halo) at the same coords.
    expect(point.features.length).toBe(2);
    expect(point.features[0].geometry.coordinates).toEqual([-74.006, 40.7128]);
    expect(point.features[1].geometry.coordinates).toEqual([-74.006, 40.7128]);
  });
});
