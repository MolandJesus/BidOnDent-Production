/**
 * Generates a GeoJSON polygon approximating a circle on the map.
 * Used for search radius visualization and GPS accuracy rings.
 */
export function circlePolygon(
  lat: number,
  lng: number,
  radiusMeters: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const km = radiusMeters / 1000;
  const distX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distY = km / 110.574;
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    coords.push([lng + distX * Math.cos(theta), lat + distY * Math.sin(theta)]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
    properties: {},
  };
}
