import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle,
  Compass,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";
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

type InsurerPartnerShopsScreenProps = {
  primaryColor?: string;
  identity?: WebsiteIdentity | null;
  onAddShop?: (shopData: any) => void;
  onOpenMap?: () => void;
};

type FilterStatus = "all" | "active" | "pending" | "inactive";

type CustomProspect = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  specialties: string[];
  certifications: string[];
  status: "pending";
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProspectPhone(seed: number) {
  return `(555) 010-${String(1300 + seed).slice(-4)}`;
}

function buildPartnerStatus(isShortlisted: boolean, compatibilityScore: number): FilterStatus {
  if (isShortlisted) {
    return "active";
  }

  if (compatibilityScore >= 72) {
    return "pending";
  }

  return "inactive";
}

function getStatusColor(status: FilterStatus) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "inactive":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function buildManualProspectCoordinate(prospect: CustomProspect) {
  const hashSeed = hashString(
    `${prospect.name}|${prospect.zip}|${prospect.city}|${prospect.state}`
  );
  const latitudeOffset = ((hashSeed % 1400) - 700) / 10000;
  const longitudeOffset = (((hashSeed >> 8) % 1400) - 700) / 10000;

  return {
    lat: 32.7767 + latitudeOffset,
    lng: -96.797 + longitudeOffset,
  };
}

export default function InsurerPartnerShopsScreen({
  primaryColor = "#003d82",
  identity,
  onAddShop,
  onOpenMap,
}: InsurerPartnerShopsScreenProps) {
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
  const [newShopData, setNewShopData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    specialties: "",
    certifications: "",
  });

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

  const handleAddShop = () => {
    if (!newShopData.name || !newShopData.email || !newShopData.phone) {
      return;
    }

    const newProspect: CustomProspect = {
      id: `manual-${Date.now()}`,
      name: newShopData.name,
      email: newShopData.email,
      phone: newShopData.phone,
      address: newShopData.address,
      city: newShopData.city,
      state: newShopData.state,
      zip: newShopData.zip,
      specialties: newShopData.specialties
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      certifications: newShopData.certifications
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      status: "pending",
    };

    setCustomProspects((currentProspects) => [newProspect, ...currentProspects]);
    onAddShop?.(newProspect);
    setShowAddShopModal(false);
    setNewShopData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      specialties: "",
      certifications: "",
    });
  };

  const openMappedShopDirections = (entry: (typeof mappedShops)[number]) => {
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_36%,#f1f5f9_100%)]">
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
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
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
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
                className="w-full rounded-2xl border border-slate-300/80 bg-white py-2.5 pl-10 pr-4 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
              <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Directions Provider
              </span>
              {navigationProviderOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDirectionsProvider(option.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    directionsProvider === option.id
                      ? "text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
                    filterStatus === filter.id
                      ? "text-white"
                      : "border border-slate-300 bg-white text-slate-700"
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
              <article
                key={entry.id}
                className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{entry.name}</h3>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                      Manual lead
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {entry.address}, {entry.city}, {entry.state} {entry.zip}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <a
                      href={`tel:${entry.phone}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Phone className="h-4 w-4" />
                      {entry.phone}
                    </a>
                    <a
                      href={`mailto:${entry.email}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Mail className="h-4 w-4" />
                      {entry.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => openManualProspectDirections(entry)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Compass className="h-4 w-4" />
                      Directions
                    </button>
                  </div>

                  {entry.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          }

          return (
            <article
              key={entry.id}
              className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={entry.image}
                  alt={entry.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.35))]" />
                <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm">
                  {entry.mapDistanceLabel} away
                </div>
              </div>

              <div className="border-b border-slate-100 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-950">{entry.name}</h3>
                      {entry.certified && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Certified
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(entry.status)}`}
                      >
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <span className="mr-1 text-yellow-500">★</span>
                      <span className="font-medium">{entry.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{entry.reviews} reviews</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">
                      Carrier Fit
                    </p>
                    <p className="text-lg font-semibold">{entry.insuranceCompatibilityScore}%</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-slate-700">
                    <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                    <span>
                      {entry.mapResult.address}, {entry.mapResult.city}, {entry.mapResult.state}{" "}
                      <div className="ml-6 flex items-center text-slate-600">
                        Best route context ready
                      </div>
                    </span>
                  </div>
                  <div className="ml-6 flex items-center text-slate-600">
                    {entry.mapDistanceLabel} away
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4">
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Pipeline State</p>
                    <p className="text-sm font-medium text-slate-900">
                      {entry.shortlisted ? "Shortlisted partner" : "Evaluation candidate"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completed Jobs</p>
                    <p className="text-sm font-medium text-slate-900">{entry.completedJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Active Jobs</p>
                    <p className="text-sm font-medium" style={{ color: primaryColor }}>
                      {entry.activeJobs}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Avg Completion</p>
                    <p className="text-sm font-medium text-slate-900">
                      {entry.avgCompletionDays} days
                    </p>
                  </div>
                </div>

                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Average Cost</p>
                      <p className="text-lg font-bold" style={{ color: primaryColor }}>
                        ${entry.averagePriceValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Network Trend</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          +{Math.max(1, Math.round(entry.rating - 3.9))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  {entry.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  {entry.certifications.map((certification) => (
                    <span
                      key={certification}
                      className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-700"
                    >
                      <Award className="h-3 w-3" />
                      {certification}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <a
                    href={`tel:${entry.phone}`}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-xs">Call</span>
                  </a>
                  <a
                    href={`mailto:${entry.email}`}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => openMappedShopDirections(entry)}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-white"
                  >
                    <Compass className="h-4 w-4" />
                    <span className="text-xs">Directions</span>
                  </button>
                  <button
                    onClick={() =>
                      setShortlistIds((currentIds) =>
                        toggleRoleCollectionShopId(currentIds, entry.id)
                      )
                    }
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
                      entry.shortlisted
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">
                      {entry.shortlisted ? "Shortlisted" : "Shortlist"}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {showAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-slate-950">Add Manual Prospect</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newShopData.name}
                    onChange={(event) =>
                      setNewShopData({ ...newShopData, name: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                    placeholder="Metro Collision Group"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newShopData.email}
                      onChange={(event) =>
                        setNewShopData({ ...newShopData, email: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                      placeholder="partners@shop.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newShopData.phone}
                      onChange={(event) =>
                        setNewShopData({ ...newShopData, phone: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={newShopData.address}
                    onChange={(event) =>
                      setNewShopData({ ...newShopData, address: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                    placeholder="1234 Main St"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
                    <input
                      type="text"
                      value={newShopData.city}
                      onChange={(event) =>
                        setNewShopData({ ...newShopData, city: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                      placeholder="Dallas"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
                    <input
                      type="text"
                      value={newShopData.state}
                      onChange={(event) =>
                        setNewShopData({ ...newShopData, state: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                      placeholder="TX"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">ZIP</label>
                    <input
                      type="text"
                      value={newShopData.zip}
                      onChange={(event) =>
                        setNewShopData({ ...newShopData, zip: event.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                      placeholder="75201"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Specialties
                  </label>
                  <input
                    type="text"
                    value={newShopData.specialties}
                    onChange={(event) =>
                      setNewShopData({ ...newShopData, specialties: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                    placeholder="Collision Repair, ADAS, EV"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Certifications
                  </label>
                  <input
                    type="text"
                    value={newShopData.certifications}
                    onChange={(event) =>
                      setNewShopData({ ...newShopData, certifications: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-2"
                    placeholder="I-CAR Gold Class, ASE Certified"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddShopModal(false)}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShop}
                  disabled={!newShopData.name || !newShopData.email || !newShopData.phone}
                  className="flex-1 rounded-2xl py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add Prospect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
