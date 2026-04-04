/**
 * geoCircle.ts — Geographic circle to GeoJSON polygon utility.
 * Shared between MapLibreDashboardMapPreview and MapLibreShopDirectoryMapPane.
 */

/** Approximate a geographic radius circle as a 64-point GeoJSON polygon. */
export function circleToPolygon(lat: number, lng: number, radiusMiles: number): GeoJSON.Feature {
  const EARTH_RADIUS_MILES = 3958.8;
  const points = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusMiles / EARTH_RADIUS_MILES) * (180 / Math.PI) * Math.cos(angle);
    const dLng =
      ((radiusMiles / EARTH_RADIUS_MILES) * (180 / Math.PI) * Math.sin(angle)) /
      Math.cos(lat * (Math.PI / 180));
    coords.push([lng + dLng, lat + dLat]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}
