import type {
  NavigationCoordinate,
  NavigationSpeedLimitConfidence,
  NavigationSpeedLimitSnapshot,
} from "../../types/navigation";
import { runWithProviderHealth } from "./providerHealth";

type OverpassResult = {
  elements?: Array<{
    id: number;
    lat?: number;
    lon?: number;
    center?: {
      lat: number;
      lon: number;
    };
    tags?: {
      name?: string;
      maxspeed?: string;
    };
  }>;
};

function haversineDistanceMeters(a: NavigationCoordinate, b: NavigationCoordinate) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseSpeedLimitMph(maxspeed: string | undefined) {
  if (!maxspeed) {
    return null;
  }

  const match = maxspeed.match(/(\d+(\.\d+)?)/);

  if (!match) {
    return null;
  }

  const numericValue = Number(match[1]);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  if (maxspeed.toLowerCase().includes("km")) {
    return Math.round(numericValue * 0.621371);
  }

  return Math.round(numericValue);
}

function isSimpleSpeedLimitTag(maxspeed: string | undefined) {
  if (!maxspeed) {
    return false;
  }

  return /^\s*\d+(?:\.\d+)?\s*(?:mph|mi\/h|km\/h|kph)?\s*$/i.test(maxspeed);
}

function resolveSpeedLimitConfidence(
  distanceMeters: number,
  maxspeed: string | undefined
): NavigationSpeedLimitConfidence {
  const hasSimpleTag = isSimpleSpeedLimitTag(maxspeed);

  if (distanceMeters <= 30 && hasSimpleTag) {
    return "high";
  }

  if (distanceMeters <= 80) {
    return hasSimpleTag ? "medium" : "low";
  }

  return "low";
}

export async function fetchNearestSpeedLimit(
  coordinate: NavigationCoordinate,
  signal?: AbortSignal
): Promise<NavigationSpeedLimitSnapshot | null> {
  const query = `
[out:json][timeout:12];
way(around:50,${coordinate.lat},${coordinate.lng})["highway"]["maxspeed"];
out tags center 6;
  `.trim();

  const response = await runWithProviderHealth("overpass-speed-limit", () =>
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: query,
      signal,
    })
  );

  if (!response.ok) {
    throw new Error("Road speed limit lookup is temporarily unavailable.");
  }

  const data = (await response.json()) as OverpassResult;

  const bestMatch = (data.elements || [])
    .map((element) => {
      const point =
        element.center ||
        (element.lat && element.lon ? { lat: element.lat, lon: element.lon } : null);
      const speedLimitMph = parseSpeedLimitMph(element.tags?.maxspeed);

      if (!point || !speedLimitMph) {
        return null;
      }

      return {
        distanceMeters: haversineDistanceMeters(coordinate, {
          lat: point.lat,
          lng: point.lon,
        }),
        roadName: element.tags?.name,
        speedLimitMph,
        maxspeedTag: element.tags?.maxspeed,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.distanceMeters || 0) - (b?.distanceMeters || 0))[0];

  if (!bestMatch) {
    return null;
  }

  return {
    provider: "overpass",
    speedLimitMph: bestMatch.speedLimitMph,
    confidence: resolveSpeedLimitConfidence(bestMatch.distanceMeters, bestMatch.maxspeedTag),
    roadName: bestMatch.roadName,
    sourceMaxspeedTag: bestMatch.maxspeedTag,
    matchDistanceMeters: Math.round(bestMatch.distanceMeters),
    fetchedAt: new Date().toISOString(),
  };
}
