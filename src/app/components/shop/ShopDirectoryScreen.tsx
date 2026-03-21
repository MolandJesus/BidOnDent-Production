import { useDeferredValue, useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building2,
  Car,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  MapPin,
  Plus,
  Search,
  Shield,
  Sparkles,
  Star,
  SunMoon,
  TrendingUp,
} from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import ShopDirectoryMapPane from "./ShopDirectoryMapPane";
import type {
  ShopSortOption,
  WebsiteIdentity,
} from "../../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import {
  buildShopIntelligenceSummary,
  getInsuranceDirectory,
  type MarketUserType,
} from "../../services/intelligence/marketIntelligence";
import {
  buildRoleAwareMapHighlights,
  buildRoleAwareRouteSummary,
  buildShopMapListings,
  buildShopRouteOptions,
  getDefaultMapCenter,
  getRoleCollectionActionLabels,
  getRoleCollectionKey,
  getRoleCollectionTitle,
  getSuggestedSearchOrigins,
  toggleRoleCollectionShopId,
  type ShopMapListing,
} from "../../services/intelligence/shopMapExperience";
import type {
  Coordinates,
  MapTheme,
  MapViewMode,
  Place,
  RecentSearch,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";

type ShopDirectoryScreenProps = {
  onBack: () => void;
  onOpenRelatedScreen?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  userType?: MarketUserType;
  userInfo?: {
    name?: string;
    email?: string;
  };
  vehicles?: Array<{ make?: string; model?: string; year?: string | number }>;
  reports?: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
};

const SORT_OPTIONS: Array<{ value: ShopSortOption; label: string }> = [
  { value: "smart-match", label: "Smart Match" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "distance", label: "Nearest" },
];

const VIEW_MODE_OPTIONS: Array<{ value: MapViewMode; label: string }> = [
  { value: "hybrid", label: "Hybrid" },
  { value: "map", label: "Map" },
  { value: "list", label: "List" },
];

const MAX_RECENT_SEARCHES = 6;

function getContextChips(
  vehicles: ShopDirectoryScreenProps["vehicles"] = [],
  reports: ShopDirectoryScreenProps["reports"] = []
) {
  const vehicleMakes = [...new Set(vehicles.map((vehicle) => vehicle.make).filter(Boolean))].slice(0, 3);
  const damageSignals = [
    ...new Set(
      reports
        .flatMap((report) => [
          report.damageArea,
          report.damageType,
          ...(Array.isArray(report.damageAreas) ? report.damageAreas : []),
        ])
        .filter(Boolean)
    ),
  ].slice(0, 3);

  return [...vehicleMakes, ...damageSignals].filter(Boolean) as string[];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildSavedPlace(origin: Place): SavedPlace {
  const timestamp = new Date().toISOString();

  return {
    ...origin,
    id: `saved-place-${origin.placeId || slugify(origin.name)}`,
    label: origin.name,
    isFavorite: true,
    createdAt: timestamp,
    lastUsedAt: timestamp,
    metadata: {
      category: "custom",
      icon: "map-pin",
    },
  };
}

function buildRecentSearches(
  currentSearches: RecentSearch[],
  query: string,
  origin: Place | null,
  resultCount: number
) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return currentSearches;
  }

  const nextSearch: RecentSearch = {
    query: trimmedQuery,
    origin: origin || undefined,
    resultCount,
    timestamp: new Date().toISOString(),
  };

  const filteredSearches = currentSearches.filter((search) => {
    const sameOrigin =
      (search.origin?.placeId || search.origin?.name) === (origin?.placeId || origin?.name);

    return !(search.query.toLowerCase() === trimmedQuery.toLowerCase() && sameOrigin);
  });

  return [nextSearch, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
}

function getRoleIcon(userType: MarketUserType) {
  if (userType === "shop") {
    return Briefcase;
  }

  if (userType === "insurer") {
    return Shield;
  }

  return Car;
}

function getRoleAccent(userType: MarketUserType) {
  if (userType === "shop") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  if (userType === "insurer") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }

  return "bg-blue-50 text-blue-800 border-blue-200";
}

function DirectoryResultCard({
  shop,
  isSelected,
  compact,
  primaryColor,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
}: {
  shop: ShopMapListing;
  isSelected: boolean;
  compact: boolean;
  primaryColor: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[26px] border bg-white shadow-sm transition-all ${
        isSelected ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className={`flex ${compact ? "gap-4 p-4" : "flex-col"}`}>
        <div className={compact ? "h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl" : "h-44 w-full overflow-hidden"}>
          <ImageWithFallback
            alt={shop.name}
            className="h-full w-full object-cover"
            src={shop.image}
          />
        </div>

        <div className={`${compact ? "min-w-0 flex-1" : "p-4 md:p-5"} space-y-3`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">{shop.name}</h3>
                {shop.topPick && (
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    Best fit
                  </span>
                )}
                {isSelected && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                  <span className="font-semibold text-slate-900">{shop.rating}</span>
                  <span>({shop.reviews})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {shop.mapDistanceLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {shop.responseTimeLabel}
                </span>
              </div>
            </div>

            <div className="grid min-w-[150px] grid-cols-2 gap-2">
              <div className="rounded-2xl bg-slate-950 px-3 py-2 text-white">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">AI Fit</p>
                <p className="text-lg font-semibold">{shop.recommendationScore}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-900">
                <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700/80">
                  Carrier
                </p>
                <p className="text-lg font-semibold">{shop.insuranceCompatibilityScore}%</p>
              </div>
            </div>
          </div>

          {!compact && <p className="text-sm leading-6 text-slate-600">{shop.aiSummary}</p>}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Completion</p>
              <p className="font-semibold text-slate-900">{shop.completionRate}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Avg ticket</p>
              <p className="font-semibold text-slate-900">{shop.averagePriceLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {shop.matchReasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
              >
                {reason}
              </span>
            ))}
          </div>

          {!compact && (
            <div className="flex flex-wrap gap-2">
              {shop.certifications.slice(0, 3).map((certification) => (
                <span
                  key={certification}
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                >
                  {certification}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </button>
            <button
              className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium text-white"
              onClick={onSecondaryAction}
              style={{ backgroundColor: primaryColor }}
            >
              <span className="inline-flex items-center gap-2">
                {secondaryActionLabel}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ShopDirectoryScreen({
  onBack,
  onOpenRelatedScreen,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  userType = "customer",
  userInfo,
  vehicles = [],
  reports = [],
}: ShopDirectoryScreenProps) {
  const { inventory } = useNetworkDirectory();
  const savedMemory = loadWebsiteSessionMemory(identity);
  const suggestedOrigins = getSuggestedSearchOrigins();
  const [searchQuery, setSearchQuery] = useState(savedMemory.shopDirectory.searchQuery);
  const [filterRating, setFilterRating] = useState(savedMemory.shopDirectory.filterRating);
  const [sortBy, setSortBy] = useState<ShopSortOption>(savedMemory.shopDirectory.sortBy);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(
    savedMemory.mapSession?.lastViewedShopId ?? savedMemory.shopDirectory.lastViewedShopId
  );
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    savedMemory.insuranceConnection.connectedInsurerIds
  );
  const [selectedOrigin, setSelectedOrigin] = useState<Place | null>(
    savedMemory.mapSession?.lastSearchOrigin || null
  );
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(
    savedMemory.mapSession?.savedPlaces || []
  );
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    savedMemory.mapSession?.recentSearches || []
  );
  const [customerSavedShopIds, setCustomerSavedShopIds] = useState<number[]>(
    savedMemory.mapSession?.customerSavedShopIds || []
  );
  const [shopWatchlistIds, setShopWatchlistIds] = useState<number[]>(
    savedMemory.mapSession?.shopWatchlistIds || []
  );
  const [insurerShortlistIds, setInsurerShortlistIds] = useState<number[]>(
    savedMemory.mapSession?.insurerShortlistIds || []
  );
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>(
    savedMemory.mapSession?.mapViewMode || "hybrid"
  );
  const [mapTheme, setMapTheme] = useState<MapTheme>(savedMemory.mapSession?.mapTheme || "light");
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    savedMemory.mapSession?.selectedRouteId || "fastest"
  );
  const [mapCenter, setMapCenter] = useState<Coordinates | undefined>(
    savedMemory.mapSession?.lastMapCenter
  );
  const [mapZoom, setMapZoom] = useState<number | undefined>(savedMemory.mapSession?.lastMapZoom);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const memory = loadWebsiteSessionMemory(identity);
    setSearchQuery(memory.shopDirectory.searchQuery);
    setFilterRating(memory.shopDirectory.filterRating);
    setSortBy(memory.shopDirectory.sortBy);
    setSelectedShopId(memory.mapSession?.lastViewedShopId ?? memory.shopDirectory.lastViewedShopId);
    setConnectedInsurerIds(memory.insuranceConnection.connectedInsurerIds);
    setSelectedOrigin(memory.mapSession?.lastSearchOrigin || null);
    setSavedPlaces(memory.mapSession?.savedPlaces || []);
    setRecentSearches(memory.mapSession?.recentSearches || []);
    setCustomerSavedShopIds(memory.mapSession?.customerSavedShopIds || []);
    setShopWatchlistIds(memory.mapSession?.shopWatchlistIds || []);
    setInsurerShortlistIds(memory.mapSession?.insurerShortlistIds || []);
    setMapViewMode(memory.mapSession?.mapViewMode || "hybrid");
    setMapTheme(memory.mapSession?.mapTheme || "light");
    setSelectedRouteId(memory.mapSession?.selectedRouteId || "fastest");
    setMapCenter(memory.mapSession?.lastMapCenter);
    setMapZoom(memory.mapSession?.lastMapZoom);
  }, [identity?.websiteUserKey]);

  const mapListings = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    filterRating,
    origin: selectedOrigin,
    reports,
    searchQuery: deferredSearchQuery,
    sortBy,
    userType,
    vehicles,
  });
  const summary = buildShopIntelligenceSummary(mapListings, {
    connectedInsurerIds,
    reports,
    searchQuery: deferredSearchQuery,
    userType,
    vehicles,
  });
  const connectedCarrierNames = getInsuranceDirectory(inventory.insurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);
  const contextChips = getContextChips(vehicles, reports);
  const roleHighlights = buildRoleAwareMapHighlights({
    connectedCarrierCount: connectedCarrierNames.length,
    recommendations: mapListings,
    reports,
    userType,
  });
  const collectionUniverse = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    origin: selectedOrigin,
    reports,
    searchQuery: "",
    sortBy: "smart-match",
    userType,
    vehicles,
  });
  const selectedShop = mapListings.find((shop) => shop.id === selectedShopId) || mapListings[0] || null;
  const RoleIcon = getRoleIcon(userType);
  const accentClasses = getRoleAccent(userType);
  const roleCollectionKey = getRoleCollectionKey(userType);
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const roleCollectionIds =
    roleCollectionKey === "shopWatchlistIds"
      ? shopWatchlistIds
      : roleCollectionKey === "insurerShortlistIds"
        ? insurerShortlistIds
        : customerSavedShopIds;
  const roleCollectionListings = collectionUniverse.filter((shop) => roleCollectionIds.includes(shop.id));
  const relatedScreenLabel =
    userType === "shop"
      ? "Competitor Analysis"
      : userType === "insurer"
        ? "Partner Shops"
        : "Saved Shops";
  const showMapPane = mapViewMode !== "list";
  const compactCards = mapViewMode === "map";
  const routeOptions = buildShopRouteOptions({
    origin: selectedOrigin,
    shop: selectedShop,
  });
  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null;
  const routeSummary = buildRoleAwareRouteSummary({
    selectedRoute,
    shop: selectedShop,
    userType,
  });
  const mapShellLayoutClass = showMapPane
    ? mapViewMode === "map"
      ? "lg:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]"
      : "lg:grid-cols-[clamp(340px,31vw,420px)_minmax(0,1fr)]"
    : "";

  useEffect(() => {
    if (!selectedShopId && mapListings[0]) {
      setSelectedShopId(mapListings[0].id);
      return;
    }

    if (selectedShopId && !mapListings.some((shop) => shop.id === selectedShopId)) {
      setSelectedShopId(mapListings[0]?.id ?? null);
    }
  }, [mapListings, selectedShopId]);

  useEffect(() => {
    if (routeOptions.length === 0) {
      return;
    }

    if (!routeOptions.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(routeOptions[0].id);
    }
  }, [routeOptions, selectedRouteId]);

  useEffect(() => {
    updateWebsiteSessionMemory(identity, {
      insuranceConnection: {
        connectedInsurerIds,
      },
      mapSession: {
        lastMapCenter: mapCenter,
        lastMapZoom: mapZoom,
        lastSearchFilters: {
          minRating: filterRating,
        },
        lastSearchOrigin: selectedOrigin || undefined,
        lastSearchQuery: searchQuery,
        lastViewedShopId: selectedShopId ?? undefined,
        mapTheme,
        mapViewMode,
        selectedRouteId,
        customerSavedShopIds,
        insurerShortlistIds,
        recentSearches,
        savedPlaces,
        shopWatchlistIds,
      },
      shopDirectory: {
        filterRating,
        lastViewedShopId: selectedShopId,
        searchQuery,
        sortBy,
      },
    }, { accountType: userType });
  }, [
    connectedInsurerIds,
    customerSavedShopIds,
    filterRating,
    identity,
    insurerShortlistIds,
    mapCenter,
    mapTheme,
    mapViewMode,
    mapZoom,
    recentSearches,
    savedPlaces,
    searchQuery,
    selectedOrigin,
    selectedRouteId,
    selectedShopId,
    shopWatchlistIds,
    sortBy,
  ]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecentSearches((currentSearches) =>
      buildRecentSearches(currentSearches, searchQuery, selectedOrigin, mapListings.length)
    );
  };

  const handleSelectOrigin = (origin: Place) => {
    setSelectedOrigin(origin);
    setSavedPlaces((currentPlaces) =>
      currentPlaces.map((place) =>
        place.id === `saved-place-${origin.placeId || slugify(origin.name)}`
          ? { ...place, lastUsedAt: new Date().toISOString() }
          : place
      )
    );
  };

  const handleSaveOrigin = () => {
    if (!selectedOrigin) {
      return;
    }

    const nextPlace = buildSavedPlace(selectedOrigin);
    setSavedPlaces((currentPlaces) => {
      const existingPlace = currentPlaces.find((place) => place.id === nextPlace.id);
      if (existingPlace) {
        return currentPlaces.map((place) =>
          place.id === nextPlace.id
            ? { ...place, lastUsedAt: new Date().toISOString(), isFavorite: true }
            : place
        );
      }

      return [nextPlace, ...currentPlaces].slice(0, 6);
    });
  };

  const currentOriginIsSaved = selectedOrigin
    ? savedPlaces.some(
        (place) => place.id === `saved-place-${selectedOrigin.placeId || slugify(selectedOrigin.name)}`
      )
    : false;

  const handleToggleRoleCollection = (shopId: number) => {
    setSelectedShopId(shopId);

    if (roleCollectionKey === "shopWatchlistIds") {
      setShopWatchlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    if (roleCollectionKey === "insurerShortlistIds") {
      setInsurerShortlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    setCustomerSavedShopIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
  };

  return (
    <div className="space-y-6 pb-20">
      <section className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,_#ffffff,_#f8fbff)] p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                onClick={onBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClasses}`}
              >
                <RoleIcon className="h-4 w-4" />
                {roleHighlights.badge}
              </span>
            </div>

            <div className="mt-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-[2.35rem]">
                Smart Shop Map
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
                {roleHighlights.description} This is now a dedicated map-first shell for the signed-in{" "}
                {userType} experience, while the recommendation intelligence and identity/session
                plumbing stay intact underneath it.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {roleHighlights.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-slate-200 bg-white/85 px-4 py-4 shadow-sm backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                </div>
              ))}
              <div className="rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-4 text-white shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-white/65">Session</p>
                <p className="mt-2 text-2xl font-semibold">
                  {identity?.sessionId.slice(-6) || "guest"}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white/85 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Top match</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{summary.title}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:w-[420px]">
            <div className="rounded-[26px] border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                <Sparkles className="h-4 w-4" />
                Map intelligence active
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-950">{roleHighlights.title}</p>
              <div className="mt-3 space-y-2">
                {roleHighlights.callouts.map((callout) => (
                  <div
                    key={callout}
                    className="rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
                  >
                    {callout}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <TrendingUp className="h-4 w-4" />
                Current ranking explanation
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{summary.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {summary.callouts.map((callout) => (
            <span
              key={callout}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              {callout}
            </span>
          ))}
          {contextChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
            >
              {chip}
            </span>
          ))}
          {connectedCarrierNames.map((carrierName) => (
            <span
              key={carrierName}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
            >
              Connected: {carrierName}
            </span>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className={`min-w-0 ${showMapPane ? `lg:grid ${mapShellLayoutClass}` : ""}`}>
          <aside className={`${showMapPane ? "lg:border-r" : ""} min-h-0 border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)]`}>
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 p-5">
                <form className="space-y-4" onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full rounded-[22px] border border-slate-200 bg-white py-3 pl-10 pr-28 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search shop, insurer program, hail, EV, ADAS, luxury..."
                      type="text"
                      value={searchQuery}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl px-4 py-2 text-sm font-medium text-white"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                      type="submit"
                    >
                      Update
                    </button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          <MapPin className="h-4 w-4" />
                          Origin
                        </div>
                        {selectedOrigin && (
                          <button
                            className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                            onClick={() => setSelectedOrigin(null)}
                            type="button"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {suggestedOrigins.map((origin) => {
                          const isActive =
                            (selectedOrigin?.placeId || selectedOrigin?.name) ===
                            (origin.placeId || origin.name);

                          return (
                            <button
                              key={origin.placeId || origin.name}
                              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                isActive
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                              onClick={() => handleSelectOrigin(origin)}
                              type="button"
                            >
                              {origin.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                            selectedOrigin
                              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                          disabled={!selectedOrigin}
                          onClick={handleSaveOrigin}
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                          {currentOriginIsSaved ? "Origin saved" : "Save origin"}
                        </button>
                        {selectedOrigin && (
                          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
                            {selectedOrigin.address}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <Layers3 className="h-4 w-4" />
                        View & Sort
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {VIEW_MODE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                              mapViewMode === option.value
                                ? "bg-slate-950 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                            onClick={() => setMapViewMode(option.value)}
                            type="button"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                          onChange={(event) => setSortBy(event.target.value as ShopSortOption)}
                          value={sortBy}
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          className={`rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                            filterRating === 4.5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                          onClick={() => setFilterRating(filterRating === 4.5 ? 0 : 4.5)}
                          type="button"
                        >
                          4.5+ only
                        </button>

                        <button
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                          onClick={() => setMapTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))}
                          type="button"
                        >
                          <SunMoon className="h-4 w-4" />
                          {mapTheme === "light" ? "Dark tiles" : "Light tiles"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <RoleIcon className="h-4 w-4" />
                    Role-specific panel
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{roleHighlights.title}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    <Bookmark className="h-3.5 w-3.5" />
                    {roleCollectionListings.length} in {roleCollectionTitle.toLowerCase()}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {roleHighlights.callouts.map((callout) => (
                      <div
                        key={callout}
                        className="rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
                      >
                        {callout}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    This collection also feeds the related role screen outside the map shell so saved
                    state carries through the broader dashboard.
                  </p>
                  {onOpenRelatedScreen && (
                    <button
                      className="mt-4 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={onOpenRelatedScreen}
                      type="button"
                    >
                      Open {relatedScreenLabel}
                    </button>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 p-5 lg:overflow-y-auto">
                <div className="mb-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <MapPin className="h-4 w-4" />
                    Route preview
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{routeSummary.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{routeSummary.description}</p>

                  {selectedOrigin && selectedShop && selectedRoute ? (
                    <>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {routeOptions.map((route) => {
                          const isActiveRoute = route.id === selectedRoute.id;

                          return (
                            <button
                              key={route.id}
                              className={`rounded-[22px] border px-3 py-3 text-left transition-colors ${
                                isActiveRoute
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                              }`}
                              onClick={() => setSelectedRouteId(route.id)}
                              type="button"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-semibold">{route.label}</span>
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: route.accentColor }}
                                />
                              </div>
                              <p
                                className={`mt-2 text-xl font-semibold ${
                                  isActiveRoute ? "text-white" : "text-slate-950"
                                }`}
                              >
                                {route.estimatedDurationMinutes} min
                              </p>
                              <p
                                className={`mt-1 text-xs ${
                                  isActiveRoute ? "text-white/70" : "text-slate-500"
                                }`}
                              >
                                {route.totalDistanceLabel} • {route.trafficLabel}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Active route
                            </p>
                            <p className="mt-1 text-base font-semibold text-slate-950">
                              {selectedOrigin.name} to {selectedShop.name}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              ETA
                            </p>
                            <p className="text-lg font-semibold text-slate-950">
                              {selectedRoute.estimatedDurationMinutes} min
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {selectedRoute.instructions.map((instruction, index) => (
                            <div
                              key={instruction.id}
                              className="flex gap-3 rounded-[20px] border border-slate-200 bg-white px-3 py-3"
                            >
                              <div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                style={{ backgroundColor: selectedRoute.accentColor }}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-semibold text-slate-950">{instruction.title}</p>
                                  <p className="text-sm text-slate-500">
                                    {instruction.durationMinutes > 0
                                      ? `${instruction.durationMinutes} min`
                                      : instruction.distanceLabel}
                                  </p>
                                </div>
                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                  {instruction.detail}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                      Pick a search origin and focus a shop to unlock live-looking route choices,
                      map path drawing, ETA comparison, and turn guidance.
                    </div>
                  )}
                </div>

                {roleCollectionListings.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <Bookmark className="h-4 w-4" />
                      {roleCollectionTitle}
                    </div>
                    <div className="mt-3 space-y-3">
                      {roleCollectionListings.map((shop) => (
                        <button
                          key={`collection-${shop.id}`}
                          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-slate-300"
                          onClick={() => setSelectedShopId(shop.id)}
                          type="button"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{shop.name}</p>
                              <p className="mt-1 text-sm text-slate-500">
                                {shop.mapDistanceLabel} • {shop.averagePriceLabel} avg ticket
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">
                                Fit
                              </p>
                              <p className="text-sm font-semibold">{shop.recommendationScore}%</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {savedPlaces.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <Bookmark className="h-4 w-4" />
                      Saved places
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {savedPlaces.map((place) => (
                        <button
                          key={place.id}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                          onClick={() => handleSelectOrigin(place)}
                          type="button"
                        >
                          <span className="block font-medium text-slate-900">{place.label}</span>
                          <span className="block text-xs text-slate-500">{place.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <Search className="h-4 w-4" />
                      Recent searches
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={`${search.query}-${search.timestamp}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                          onClick={() => {
                            setSearchQuery(search.query);
                            setSelectedOrigin(search.origin || null);
                          }}
                          type="button"
                        >
                          <span className="font-medium text-slate-900">{search.query}</span>
                          {search.origin && (
                            <span className="ml-2 text-xs text-slate-500">@ {search.origin.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Recommended shops
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">
                      {mapListings.length} result{mapListings.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {selectedShop && (
                    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">Focused shop</p>
                      <p className="text-sm font-semibold">{selectedShop.name}</p>
                    </div>
                  )}
                </div>

                {mapListings.length === 0 && (
                  <div className="mt-4 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-6">
                    <p className="text-lg font-semibold text-slate-900">No shops matched that filter</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Try broadening the search, switching back to Smart Match, or removing the 4.5+
                      filter to reopen the full recommendation set.
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  {mapListings.map((shop) => (
                    (() => {
                      const roleCollectionAction = getRoleCollectionActionLabels(
                        userType,
                        roleCollectionIds.includes(shop.id)
                      );

                      return (
                        <DirectoryResultCard
                          compact={compactCards}
                          isSelected={selectedShopId === shop.id}
                          key={shop.id}
                          onPrimaryAction={() => handleToggleRoleCollection(shop.id)}
                          onSecondaryAction={() => setSelectedShopId(shop.id)}
                          primaryActionLabel={roleCollectionAction.primary}
                          primaryColor={primaryColor}
                          secondaryActionLabel={roleHighlights.secondaryActionLabel}
                          shop={shop}
                        />
                      );
                    })()
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {showMapPane && (
            <div className="min-h-[460px] border-t border-slate-200 lg:min-h-[820px] lg:border-t-0">
              <ShopDirectoryMapPane
                initialCenter={mapCenter || getDefaultMapCenter()}
                initialZoom={mapZoom}
                mapTheme={mapTheme}
                onSelectShop={setSelectedShopId}
                onViewportChange={(center, zoom) => {
                  setMapCenter(center);
                  setMapZoom(zoom);
                }}
                routeOptions={routeOptions}
                savedPlaces={savedPlaces}
                selectedOrigin={selectedOrigin}
                selectedRouteId={selectedRoute?.id}
                selectedShopId={selectedShopId}
                shops={mapListings}
                userType={userType}
              />
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Building2 className="h-4 w-4" />
            Signed-in context
          </div>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            {userInfo?.name?.split(" ")[0] || "This user"} is browsing as a {userType} account
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The map is reading persisted website identity memory, insurer connections, and repair
            context instead of relying on a single auth-provider model.
          </p>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Shield className="h-4 w-4" />
            Carrier influence
          </div>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            {connectedCarrierNames.length > 0
              ? `${connectedCarrierNames.length} carrier preference${connectedCarrierNames.length > 1 ? "s" : ""} are active`
              : "No insurer preferences are active yet"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {connectedCarrierNames.length > 0
              ? `Connected carriers currently shaping the ranking: ${connectedCarrierNames.join(", ")}.`
              : "Connect an insurer to see compatibility-aware ranking shifts across shops and claims routing."}
          </p>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <FileText className="h-4 w-4" />
            Repair signals
          </div>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            {reports.length > 0
              ? `${reports.length} report${reports.length > 1 ? "s" : ""} are contributing context`
              : "No report context has been added yet"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {reports.length > 0
              ? "Damage areas, descriptions, and linked vehicle information are already feeding the recommendation stack."
              : "The map is ready now, and it will become more precise as claims and vehicle history grow."}
          </p>
        </div>
      </section>
    </div>
  );
}
