import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import {
  buildShopRouteOptions,
  formatDistanceLabel,
} from "../services/intelligence/shopMapRouting";
import { fetchNavigationRouteOptions } from "../services/navigation/routeEngine";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";
import type { Place, RouteInstruction, RouteOption } from "../types/mapDomain";
import type { NavigationRoutePreview, NavigationRouteStep } from "../types/navigation";

const LIVE_ROUTE_PRESENTATION = [
  { id: "fastest", label: "Fastest", accentColor: "#2563eb" },
  { id: "balanced", label: "Balanced", accentColor: "#0f766e" },
  { id: "local", label: "Alternate", accentColor: "#c2410c" },
] as const;

type LiveRoutePresentation = {
  id: string;
  label: string;
  accentColor: string;
};

type UseShopDirectoryRoutePreviewArgs = {
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
};

type UseShopDirectoryRoutePreviewResult = {
  routeOptions: RouteOption[];
  isLoadingRoutes: boolean;
  routeError: string;
  usingLiveRoutes: boolean;
  refreshRoutePreview: () => void;
};

function toCoveragePartnerShop(shop: ShopMapListing): CoveragePartnerShop {
  return {
    id: String(shop.id),
    name: shop.name,
    countyLabel: [shop.mapResult.city, shop.mapResult.state].filter(Boolean).join(", "),
    lat: shop.mapResult.coordinates.latitude,
    lng: shop.mapResult.coordinates.longitude,
    label: shop.name,
    addressLine: [
      shop.mapResult.address,
      shop.mapResult.city,
      shop.mapResult.state,
      shop.mapResult.zipCode,
    ]
      .filter(Boolean)
      .join(", "),
    specialties: shop.specialties,
    rating: shop.rating,
    distanceMiles: shop.mapDistanceMiles,
  };
}

function buildInstructionTitle(step: NavigationRouteStep, destinationName: string) {
  if (step.maneuverType === "arrive") {
    return `Arrive at ${destinationName}`;
  }

  if (step.roadName?.trim()) {
    return step.roadName.trim();
  }

  const normalized = step.instruction.replace(/[.!?]+$/, "").trim();
  if (normalized.length <= 48) {
    return normalized;
  }

  return `${normalized.slice(0, 45).trimEnd()}...`;
}

function toRouteInstruction(step: NavigationRouteStep, destinationName: string): RouteInstruction {
  return {
    id: step.id,
    title: buildInstructionTitle(step, destinationName),
    detail: step.instruction,
    distanceLabel: formatDistanceLabel(step.distanceMeters / 1609.34),
    durationMinutes: Math.max(0, Math.round(step.durationSeconds / 60)),
  };
}

function buildTrafficLabel(
  preview: NavigationRoutePreview,
  index: number,
  primaryDurationSeconds: number
) {
  if (index === 0) {
    return "Live route";
  }

  const deltaMinutes = Math.round((preview.durationSeconds - primaryDurationSeconds) / 60);
  if (deltaMinutes <= 1) {
    return "Live alternate";
  }

  return `${deltaMinutes} min slower`;
}

function toRouteOption(
  preview: NavigationRoutePreview,
  index: number,
  destinationName: string,
  primaryDurationSeconds: number
): RouteOption {
  const presentation: LiveRoutePresentation = LIVE_ROUTE_PRESENTATION[index] || {
    id: `alternate-${index}`,
    label: `Alternate ${index}`,
    accentColor: LIVE_ROUTE_PRESENTATION[index % LIVE_ROUTE_PRESENTATION.length].accentColor,
  };
  const totalDistanceMiles = Number((preview.distanceMeters / 1609.34).toFixed(1));

  return {
    id: presentation.id,
    label: presentation.label,
    trafficLabel: buildTrafficLabel(preview, index, primaryDurationSeconds),
    totalDistanceMiles,
    totalDistanceLabel: formatDistanceLabel(totalDistanceMiles),
    estimatedDurationMinutes: Math.max(1, Math.round(preview.durationSeconds / 60)),
    accentColor: presentation.accentColor,
    polyline: preview.geometry.map((coordinate) => ({
      latitude: coordinate.lat,
      longitude: coordinate.lng,
    })),
    instructions: preview.steps.map((step) => toRouteInstruction(step, destinationName)),
  };
}

export function buildLiveRouteOptionsFromPreviews(
  previews: NavigationRoutePreview[],
  destinationName: string
) {
  if (previews.length === 0) {
    return [];
  }

  const primaryDurationSeconds = previews[0].durationSeconds;
  return previews.map((preview, index) =>
    toRouteOption(preview, index, destinationName, primaryDurationSeconds)
  );
}

export function useShopDirectoryRoutePreview({
  selectedOrigin,
  selectedShop,
}: UseShopDirectoryRoutePreviewArgs): UseShopDirectoryRoutePreviewResult {
  const [liveRouteOptions, setLiveRouteOptions] = useState<RouteOption[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");

  const fallbackRouteOptions = useMemo(
    () =>
      buildShopRouteOptions({
        origin: selectedOrigin,
        shop: selectedShop,
      }),
    [selectedOrigin, selectedShop]
  );

  const [retryCounter, setRetryCounter] = useState(0);
  const lastRouteKeyRef = useRef("");

  const refreshRoutePreview = useCallback(() => {
    lastRouteKeyRef.current = "";
    setLiveRouteOptions([]);
    setRouteError("");
    setRetryCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!selectedOrigin || !selectedShop) {
      setLiveRouteOptions([]);
      setIsLoadingRoutes(false);
      setRouteError("");
      lastRouteKeyRef.current = "";
      return;
    }

    const routeKey = `${selectedOrigin.latitude},${selectedOrigin.longitude}-${selectedShop.id}`;

    // Skip refetch if this exact route was already fetched successfully
    if (routeKey === lastRouteKeyRef.current) {
      return;
    }

    const routeRequest = createTimeoutAbortController(15000);
    setIsLoadingRoutes(true);
    setRouteError("");

    fetchNavigationRouteOptions({
      origin: {
        lat: selectedOrigin.latitude,
        lng: selectedOrigin.longitude,
      },
      destination: toCoveragePartnerShop(selectedShop),
      signal: routeRequest.controller.signal,
    })
      .then((nextRoutes) => {
        const routePreviews = nextRoutes.alternatives.length
          ? nextRoutes.alternatives
          : [nextRoutes.primary];
        lastRouteKeyRef.current = routeKey;
        setLiveRouteOptions(buildLiveRouteOptionsFromPreviews(routePreviews, selectedShop.name));
      })
      .catch((error) => {
        if (routeRequest.controller.signal.aborted && !routeRequest.didTimeout()) {
          return;
        }

        setLiveRouteOptions([]);
        setRouteError(
          routeRequest.didTimeout()
            ? "Live route lookup timed out. Showing local preview."
            : error instanceof Error
              ? error.message
              : "Live route lookup failed. Showing local preview."
        );
      })
      .finally(() => {
        routeRequest.clear();

        if (!routeRequest.controller.signal.aborted || routeRequest.didTimeout()) {
          setIsLoadingRoutes(false);
        }
      });

    return () => {
      routeRequest.clear();
      routeRequest.controller.abort();
    };
  }, [
    selectedOrigin?.latitude,
    selectedOrigin?.longitude,
    selectedOrigin?.placeId,
    selectedShop?.id,
    selectedShop?.mapResult.coordinates.latitude,
    selectedShop?.mapResult.coordinates.longitude,
    retryCounter,
  ]);

  return {
    routeOptions: liveRouteOptions.length > 0 ? liveRouteOptions : fallbackRouteOptions,
    isLoadingRoutes,
    routeError,
    usingLiveRoutes: liveRouteOptions.length > 0,
    refreshRoutePreview,
  };
}
