import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import {
  buildShopMapListings,
  toggleRoleCollectionShopId,
} from "../../services/intelligence/shopMapExperience";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";
import {
  navigationProviderOptions,
  openDirections,
  type NavigationProvider,
} from "../../services/navigation/externalNavigation";
import {
  buildManualProspectCoordinate,
  buildPartnerStatus,
  buildProspectPhone,
  slugify,
  type CustomProspect,
  type FilterStatus,
} from "./insurerPartnerShopsUtils";
import AddProspectModal from "./AddProspectModal";
import InsurerPartnerShopCard from "./InsurerPartnerShopCard";
import ManualProspectCard from "./ManualProspectCard";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerPartnerShopsScreenProps = {
  primaryColor?: string;
  identity?: WebsiteIdentity | null;
  onAddShop?: (shopData: any) => void;
  onOpenMap?: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function InsurerPartnerShopsScreen({
  primaryColor = "#003d82",
  identity,
  onAddShop,
  onOpenMap,
  appearanceMode = "map-dark",
}: InsurerPartnerShopsScreenProps) {
  const isLight = appearanceMode === "light";
  const { inventory } = useNetworkDirectory();
  const memory = loadWebsiteSessionMemory(identity);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [directionsProvider, setDirectionsProvider] = useState<NavigationProvider>("google");
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    memory.insuranceConnection.connectedInsurerIds
  );
  const [shortlistIds, setShortlistIds] = useState<number[]>(
    memory.mapSession?.insurerShortlistIds || []
  );
  const [customProspects, setCustomProspects] = useState<CustomProspect[]>([]);

  useEffect(() => {
    const nextMemory = loadWebsiteSessionMemory(identity);
    setConnectedInsurerIds(nextMemory.insuranceConnection.connectedInsurerIds);
    setShortlistIds(nextMemory.mapSession?.insurerShortlistIds || []);
  }, [identity?.websiteUserKey]);

  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        mapSession: {
          insurerShortlistIds: shortlistIds,
        },
      },
      { accountType: "insurer" }
    );
  }, [identity, shortlistIds]);

  const mappedShops = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    searchQuery: "",
    sortBy: "smart-match",
    userType: "insurer",
  }).map((shop) => {
    const shortlisted = shortlistIds.includes(shop.id);
    const status = buildPartnerStatus(shortlisted, shop.insuranceCompatibilityScore);

    return {
      ...shop,
      activeJobs:
        shop.capacityBand === "high-capacity" ? 12 : shop.capacityBand === "balanced" ? 8 : 5,
      avgCompletionDays:
        shop.capacityBand === "high-capacity" ? 2.9 : shop.capacityBand === "balanced" ? 3.6 : 4.4,
      certified: shop.certifications.length >= 2,
      completedJobs: Math.max(18, Math.round(shop.reviews * 0.72)),
      email: `partners@${slugify(shop.name)}.com`,
      phone: buildProspectPhone(shop.id),
      shortlisted,
      status,
    };
  });

  const manualProspects = customProspects.filter((prospect) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !normalizedQuery ||
      prospect.name.toLowerCase().includes(normalizedQuery) ||
      `${prospect.city} ${prospect.state}`.toLowerCase().includes(normalizedQuery) ||
      prospect.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery));
    const matchesFilter = filterStatus === "all" || prospect.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const filteredShops = mappedShops.filter((shop) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !normalizedQuery ||
      shop.name.toLowerCase().includes(normalizedQuery) ||
      `${shop.mapResult.city} ${shop.mapResult.state}`.toLowerCase().includes(normalizedQuery) ||
      shop.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery));
    const matchesFilter = filterStatus === "all" || shop.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const allVisibleEntries = [...filteredShops, ...manualProspects];
  const shortlistCount = mappedShops.filter((shop) => shop.shortlisted).length;

  const handleProspectSubmit = (prospect: CustomProspect) => {
    setCustomProspects((currentProspects) => [prospect, ...currentProspects]);
    onAddShop?.(prospect);
    setShowAddShopModal(false);
  };

  const openMappedShopDirections = (entry: {
    id: number;
    name: string;
    mapResult: {
      coordinates: { latitude: number; longitude: number };
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }) => {
    openDirections({
      provider: directionsProvider,
      destination: {
        id: String(entry.id),
        name: entry.name,
        lat: entry.mapResult.coordinates.latitude,
        lng: entry.mapResult.coordinates.longitude,
        addressLine: `${entry.mapResult.address}, ${entry.mapResult.city}, ${entry.mapResult.state} ${entry.mapResult.zipCode}`,
      },
    });
  };

  const openManualProspectDirections = (entry: CustomProspect) => {
    const coordinate = buildManualProspectCoordinate(entry);

    openDirections({
      provider: directionsProvider,
      destination: {
        id: entry.id,
        name: entry.name,
        lat: coordinate.lat,
        lng: coordinate.lng,
        addressLine: `${entry.address}, ${entry.city}, ${entry.state} ${entry.zip}`,
      },
    });
  };

  return (
    <div className="min-h-screen">
      <div
        className="sticky top-0 z-10 border-b border-blue-400/20 bd-glass-panel !rounded-none"
        style={{ boxShadow: "0 4px 24px rgba(59, 130, 246, 0.04)" }}
      >
        <div className="px-4 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.02em]" style={{ color: primaryColor }}>
                Partner Shops
              </h1>
              <p className="text-sm text-slate-500">
                {shortlistCount} shortlisted from the Smart Shop Map and {customProspects.length}{" "}
                manual lead
                {customProspects.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {onOpenMap && (
                <button
                  onClick={onOpenMap}
                  className="rounded-2xl px-4 py-2 text-sm font-medium shadow-sm transition-colors bd-glass-control--utility"
                >
                  Open Recruitment Map
                </button>
              )}
              <button
                onClick={() => setShowAddShopModal(true)}
                className="flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="h-5 w-5" />
                Add Manual Prospect
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shops by name, location, or specialty..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className={`w-full rounded-2xl border border-blue-400/20 backdrop-blur-sm py-2.5 pl-10 pr-4 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${isLight ? "bg-white text-slate-800 placeholder:text-slate-400" : "bg-white/10 text-slate-100 placeholder:text-slate-400/60"}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue-400/20 bg-white/10 backdrop-blur-sm p-2">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Directions Provider
              </span>
              {navigationProviderOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDirectionsProvider(option.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    directionsProvider === option.id ? "text-white" : "bd-glass-control--utility"
                  }`}
                  style={
                    directionsProvider === option.id ? { backgroundColor: primaryColor } : undefined
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Shops" },
                { id: "active", label: "Shortlisted" },
                { id: "pending", label: "Promising" },
                { id: "inactive", label: "Lower Fit" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as FilterStatus)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 font-medium transition-colors ${
                    filterStatus === filter.id ? "text-white" : "bd-glass-control--utility"
                  }`}
                  style={filterStatus === filter.id ? { backgroundColor: primaryColor } : {}}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {allVisibleEntries.map((entry) => {
          const isManualProspect = "address" in entry && !("mapResult" in entry);

          if (isManualProspect) {
            return (
              <ManualProspectCard
                key={entry.id}
                prospect={entry}
                appearanceMode={appearanceMode}
                onDirections={openManualProspectDirections}
              />
            );
          }

          return (
            <InsurerPartnerShopCard
              key={entry.id}
              entry={entry}
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
              onDirections={openMappedShopDirections}
              onToggleShortlist={setShortlistIds}
            />
          );
        })}
      </div>

      {showAddShopModal && (
        <AddProspectModal
          primaryColor={primaryColor}
          onClose={() => setShowAddShopModal(false)}
          onSubmit={handleProspectSubmit}
        />
      )}
    </div>
  );
}
