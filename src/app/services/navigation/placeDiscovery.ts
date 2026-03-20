import { haversineMiles } from "../supabase/map";
import type { NavigationCoordinate } from "../../types/navigation";

export type NavigationDiscoveryRole = "customer" | "insurer" | "shop";
export type NavigationDiscoveryCategory =
  | "body-shop"
  | "insurance"
  | "fuel"
  | "rental"
  | "supplier";

export type NavigationDiscoveryPlace = {
  id: string;
  label: string;
  subtitle: string;
  category: NavigationDiscoveryCategory;
  coordinate: NavigationCoordinate;
  distanceMiles: number;
  source: "overpass";
  phoneNumber?: string;
  website?: string;
};

type DiscoveryTagRule = {
  category: NavigationDiscoveryCategory;
  key: string;
  value: string;
};

type FetchNearbyDiscoveryPlacesArgs = {
  center: NavigationCoordinate;
  role: NavigationDiscoveryRole;
  radiusMiles: number;
  signal?: AbortSignal;
};

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

const discoveryRulesByRole: Record<NavigationDiscoveryRole, DiscoveryTagRule[]> = {
  customer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "fuel", key: "amenity", value: "fuel" },
    { category: "rental", key: "amenity", value: "car_rental" },
  ],
  insurer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "insurance", key: "office", value: "insurance" },
    { category: "rental", key: "amenity", value: "car_rental" },
  ],
  shop: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "supplier", key: "shop", value: "car_parts" },
    { category: "supplier", key: "shop", value: "tyres" },
    { category: "fuel", key: "amenity", value: "fuel" },
  ],
};

function getCategoryLabel(category: NavigationDiscoveryCategory) {
  if (category === "insurance") {
    return "Insurance office";
  }

  if (category === "fuel") {
    return "Fuel stop";
  }

  if (category === "rental") {
    return "Rental car";
  }

  if (category === "supplier") {
    return "Supplier";
  }

  return "Body shop";
}

function buildOverpassQuery(center: NavigationCoordinate, radiusMeters: number, role: NavigationDiscoveryRole) {
  const rules = discoveryRulesByRole[role];
  const selectors = rules
    .map(
      (rule) =>
        `node["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});way["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});`
    )
    .join("");

  return `[out:json][timeout:18];(${selectors});out center 18;`;
}

function resolveCoordinate(element: OverpassElement): NavigationCoordinate | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return {
      lat: element.lat,
      lng: element.lon,
    };
  }

  if (element.center && typeof element.center.lat === "number" && typeof element.center.lon === "number") {
    return {
      lat: element.center.lat,
      lng: element.center.lon,
    };
  }

  return null;
}

function resolveCategory(tags: Record<string, string> | undefined, role: NavigationDiscoveryRole) {
  if (!tags) {
    return null;
  }

  const matchingRule = discoveryRulesByRole[role].find((rule) => tags[rule.key] === rule.value);
  return matchingRule?.category || null;
}

function buildSubtitle(tags: Record<string, string> | undefined, category: NavigationDiscoveryCategory) {
  if (!tags) {
    return getCategoryLabel(category);
  }

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);

  if (addressParts.length > 0) {
    return addressParts.join(" ");
  }

  return getCategoryLabel(category);
}

function dedupePlaces(places: NavigationDiscoveryPlace[]) {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.label.toLowerCase()}|${place.coordinate.lat.toFixed(4)}|${place.coordinate.lng.toFixed(4)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function fetchNearbyDiscoveryPlaces({
  center,
  role,
  radiusMiles,
  signal,
}: FetchNearbyDiscoveryPlacesArgs): Promise<NavigationDiscoveryPlace[]> {
  const radiusMeters = Math.max(1500, Math.min(Math.round(radiusMiles * 1609.34), 16000));
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `data=${encodeURIComponent(buildOverpassQuery(center, radiusMeters, role))}`,
    signal,
  });

  if (!response.ok) {
    throw new Error("Live place discovery is temporarily unavailable.");
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] };
  const elements = payload.elements || [];
  const places = elements
    .map((element) => {
      const coordinate = resolveCoordinate(element);
      const category = resolveCategory(element.tags, role);
      const label = element.tags?.name || element.tags?.brand;

      if (!coordinate || !category || !label) {
        return null;
      }

      return {
        id: `${element.type}-${element.id}`,
        label,
        subtitle: buildSubtitle(element.tags, category),
        category,
        coordinate,
        distanceMiles: haversineMiles(center, coordinate),
        source: "overpass" as const,
        phoneNumber: element.tags?.phone || element.tags?.["contact:phone"],
        website: element.tags?.website || element.tags?.["contact:website"],
      };
    })
    .filter((place): place is NavigationDiscoveryPlace => Boolean(place))
    .sort((left, right) => left.distanceMiles - right.distanceMiles);

  return dedupePlaces(places).slice(0, 10);
}
