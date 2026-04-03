import type { NavigationCoordinate } from "../../types/navigation";
import type {
  NavigationDiscoveryCategory,
  NavigationDiscoveryPlace,
  NavigationDiscoveryRole,
} from "./placeDiscovery";

type DiscoveryTagRule = {
  category: NavigationDiscoveryCategory;
  key: string;
  value: string;
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

export type { OverpassElement };

export const MAX_DISCOVERY_RESULTS = 15;

export const discoveryRulesByRole: Record<NavigationDiscoveryRole, DiscoveryTagRule[]> = {
  customer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "body-shop", key: "shop", value: "vehicle_inspection" },
    { category: "fuel", key: "amenity", value: "fuel" },
    { category: "rental", key: "amenity", value: "car_rental" },
    { category: "rental", key: "shop", value: "car_rental" },
  ],
  insurer: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "insurance", key: "office", value: "insurance" },
    { category: "insurance", key: "office", value: "financial" },
    { category: "rental", key: "amenity", value: "car_rental" },
    { category: "rental", key: "shop", value: "car_rental" },
  ],
  shop: [
    { category: "body-shop", key: "shop", value: "car_repair" },
    { category: "body-shop", key: "amenity", value: "car_repair" },
    { category: "body-shop", key: "craft", value: "car_painter" },
    { category: "body-shop", key: "shop", value: "car_body_repair" },
    { category: "body-shop", key: "amenity", value: "car_service" },
    { category: "body-shop", key: "craft", value: "metalconstruction" },
    { category: "supplier", key: "shop", value: "car_parts" },
    { category: "supplier", key: "shop", value: "tyres" },
    { category: "supplier", key: "shop", value: "automotive" },
    { category: "fuel", key: "amenity", value: "fuel" },
  ],
};

export function getCategoryLabel(category: NavigationDiscoveryCategory) {
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

export function buildOverpassQuery(
  center: NavigationCoordinate,
  radiusMeters: number,
  role: NavigationDiscoveryRole
) {
  const rules = discoveryRulesByRole[role];
  const selectors = rules
    .map(
      (rule) =>
        `node["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});way["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});relation["${rule.key}"="${rule.value}"](around:${radiusMeters},${center.lat},${center.lng});`
    )
    .join("");

  return `[out:json][timeout:18];(${selectors});out center 18;`;
}

export function getCategoryResultLimits(role: NavigationDiscoveryRole) {
  if (role === "shop") {
    return {
      "body-shop": 8,
      supplier: 5,
      fuel: 2,
    } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
  }

  if (role === "insurer") {
    return {
      "body-shop": 8,
      insurance: 4,
      rental: 3,
    } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
  }

  return {
    "body-shop": 8,
    rental: 3,
    fuel: 3,
  } satisfies Partial<Record<NavigationDiscoveryCategory, number>>;
}

export function resolveCoordinate(element: OverpassElement): NavigationCoordinate | null {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return {
      lat: element.lat,
      lng: element.lon,
    };
  }

  if (
    element.center &&
    typeof element.center.lat === "number" &&
    typeof element.center.lon === "number"
  ) {
    return {
      lat: element.center.lat,
      lng: element.center.lon,
    };
  }

  return null;
}

export function resolveCategory(
  tags: Record<string, string> | undefined,
  role: NavigationDiscoveryRole
) {
  if (!tags) {
    return null;
  }

  const matchingRule = discoveryRulesByRole[role].find((rule) => tags[rule.key] === rule.value);
  return matchingRule?.category || null;
}

export function buildSubtitle(
  tags: Record<string, string> | undefined,
  category: NavigationDiscoveryCategory
) {
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

  const phone = tags.phone || tags["contact:phone"];
  if (phone) {
    return `${getCategoryLabel(category)} • ${phone}`;
  }

  return getCategoryLabel(category);
}

export function dedupePlaces(places: NavigationDiscoveryPlace[]) {
  const seen = new Set<string>();
  let dedupedCount = 0;

  const dedupedPlaces = places.filter((place) => {
    const key = `${place.label.toLowerCase()}|${place.coordinate.lat.toFixed(6)}|${place.coordinate.lng.toFixed(6)}`;

    if (seen.has(key)) {
      dedupedCount += 1;
      return false;
    }

    seen.add(key);
    return true;
  });

  return {
    places: dedupedPlaces,
    dedupedCount,
  };
}

export function applyCategoryDiversity(
  places: NavigationDiscoveryPlace[],
  role: NavigationDiscoveryRole
) {
  const categoryLimits = getCategoryResultLimits(role);
  const selected: NavigationDiscoveryPlace[] = [];
  const overflow: NavigationDiscoveryPlace[] = [];
  const counts = new Map<NavigationDiscoveryCategory, number>();

  for (const place of places) {
    const currentCount = counts.get(place.category) || 0;
    const categoryLimit = categoryLimits[place.category] ?? MAX_DISCOVERY_RESULTS;

    if (currentCount < categoryLimit) {
      counts.set(place.category, currentCount + 1);
      selected.push(place);
      continue;
    }

    overflow.push(place);
  }

  const finalPlaces = [...selected, ...overflow].slice(0, MAX_DISCOVERY_RESULTS);

  return {
    places: finalPlaces,
    trimmedCount: Math.max(0, places.length - finalPlaces.length),
  };
}
