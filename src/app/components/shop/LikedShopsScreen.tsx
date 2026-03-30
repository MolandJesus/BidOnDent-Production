import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MapPin, Phone, Search, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { buildShopMapListings } from "../../services/intelligence/shopMapExperience";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";
import { defaultCoverageCenter } from "../landing/coverageData";

type LikedShopsScreenProps = {
  onBack: () => void;
  onOpenMap?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  appearanceMode?: DashboardAppearanceMode;
};

export default function LikedShopsScreen({
  onBack,
  onOpenMap,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  appearanceMode = "map-dark",
}: LikedShopsScreenProps) {
  const isLight = appearanceMode === "light";
  const { inventory } = useNetworkDirectory();
  const memory = loadWebsiteSessionMemory(identity);
  const [savedShopIds, setSavedShopIds] = useState<number[]>(
    memory.mapSession?.customerSavedShopIds || []
  );
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    memory.insuranceConnection.connectedInsurerIds
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const nextMemory = loadWebsiteSessionMemory(identity);
    setSavedShopIds(nextMemory.mapSession?.customerSavedShopIds || []);
    setConnectedInsurerIds(nextMemory.insuranceConnection.connectedInsurerIds);
  }, [identity?.websiteUserKey]);

  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        mapSession: {
          customerSavedShopIds: savedShopIds,
        },
      },
      { accountType: "customer" }
    );
  }, [identity, savedShopIds]);

  const savedListings = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    searchQuery: "",
    sortBy: "smart-match",
    userType: "customer",
  }).filter((shop) => savedShopIds.includes(shop.id));

  const filteredListings = savedListings.filter((shop) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) {
      return true;
    }

    return (
      shop.name.toLowerCase().includes(normalizedQuery) ||
      shop.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery)) ||
      shop.insurerPrograms.some((program) => program.toLowerCase().includes(normalizedQuery))
    );
  });

  const shopPins: CoveragePartnerShop[] = useMemo(
    () =>
      filteredListings
        .filter((s) => s.mapResult?.coordinates?.latitude && s.mapResult?.coordinates?.longitude)
        .map((s) => ({
          id: String(s.id),
          name: s.name,
          countyLabel: s.serviceArea || "",
          lat: s.mapResult.coordinates.latitude,
          lng: s.mapResult.coordinates.longitude,
          label: s.name,
          specialties: s.specialties.slice(0, 3),
          rating: s.rating,
        })),
    [filteredListings]
  );

  const shopMapCenter: [number, number] = useMemo(() => {
    if (shopPins.length > 0) return [shopPins[0].lat, shopPins[0].lng];
    return defaultCoverageCenter;
  }, [shopPins]);

  const [focusedShopId, setFocusedShopId] = useState<string | null>(null);

  const handleUnlike = (shopId: number) => {
    setSavedShopIds((currentIds) => currentIds.filter((id) => id !== shopId));
  };

  return (
    <div className={`min-h-screen pb-20 ${isLight ? "bg-slate-50/80" : ""}`}>
      <div
        className={`sticky top-0 z-10 border-b shadow-md ${
          isLight ? "border-slate-200/70 text-slate-900" : "border-white/10 text-white"
        }`}
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.94) 100%)"
            : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="px-4 py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <ArrowLeft className={`h-5 w-5 ${isLight ? "text-slate-700" : "text-white"}`} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Saved Shops</h1>
              <p className={`text-sm ${isLight ? "text-slate-600" : "text-white/80"}`}>
                {savedListings.length} customer shortlist{savedListings.length === 1 ? "" : "s"}{" "}
                synced from the map
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <Search
              className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                isLight ? "text-slate-500" : "text-white/60"
              }`}
            />
            <input
              type="text"
              placeholder="Search saved shops, specialties, or carrier programs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full rounded-2xl border py-3 pl-10 pr-4 focus:outline-none focus:ring-2 ${
                isLight
                  ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:ring-blue-300"
                  : "border-white/20 bg-white/15 text-white placeholder:text-white/60 focus:ring-white/35"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* ── Saved shops geography map ── */}
        {savedListings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`mb-4 overflow-hidden rounded-[28px] ${isLight ? "bg-white/80 border border-slate-200/60 shadow-sm" : "bd-glass-card"}`}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <h3
                className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}
              >
                <MapPin className="mr-1.5 inline-block h-4 w-4 align-[-2px] text-blue-400" />
                Saved shop locations
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"}`}
              >
                {shopPins.length} / {savedListings.length} mapped
              </span>
            </div>

            <div className="px-3 pb-3 pt-1">
              {shopPins.length > 0 ? (
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ height: window.innerWidth < 640 ? 200 : 220 }}
                >
                  <DashboardMapPreview
                    shops={shopPins}
                    reportPins={[]}
                    center={shopMapCenter}
                    zoom={9}
                    isLight={isLight}
                    onShopClick={(shop) => setFocusedShopId(shop.id ?? null)}
                  />
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-6 ${isLight ? "border-slate-200 text-slate-400" : "border-white/10 text-slate-400/60"}`}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">No saved shops with resolvable coordinates</span>
                </div>
              )}
            </div>

            {shopPins.length > 0 && (
              <div
                className={`flex items-center gap-3 border-t px-4 py-2 text-xs ${isLight ? "border-slate-100 text-slate-500" : "border-white/5 text-slate-400/60"}`}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Saved shops
                </span>
                <span className={isLight ? "text-slate-400" : "text-slate-500"}>
                  Tap a pin to highlight below
                </span>
              </div>
            )}
          </motion.section>
        )}
        {savedListings.length === 0 ? (
          <div
            className={`rounded-[28px] p-5 sm:p-8 text-center ${isLight ? "bg-white/80 border border-slate-200/60 shadow-sm" : "bd-glass-card"}`}
          >
            <Heart
              className={`mx-auto mb-4 h-16 w-16 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <h3
              className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              No saved shops yet
            </h3>
            <p
              className={`mx-auto mt-2 max-w-xl text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
            >
              Save shops from the Smart Shop Map to keep a customer shortlist for bids, follow-up,
              and future repair decisions.
            </p>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="mt-5 rounded-2xl px-4 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Open Smart Shop Map
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((shop) => (
              <article
                key={shop.id}
                className={`overflow-hidden rounded-[28px] transition-shadow ${
                  focusedShopId === String(shop.id) ? "ring-2 ring-blue-400/60 shadow-lg" : ""
                } ${isLight ? "bg-white/80 border border-slate-200/60 shadow-sm" : "bd-glass-card"}`}
              >
                <div className="flex flex-col gap-4 p-4 md:flex-row md:p-5">
                  <div
                    className={`h-36 w-full overflow-hidden rounded-[22px] md:h-auto md:w-44 md:flex-shrink-0 ${isLight ? "bg-slate-100/80" : "bg-white/[0.08]"}`}
                  >
                    <ImageWithFallback
                      src={shop.image}
                      alt={shop.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                          >
                            {shop.name}
                          </h3>
                          {shop.topPick && (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${isLight ? "border-blue-400/40 bg-blue-100 text-blue-700" : "border-blue-400/30 bg-blue-400/15 text-blue-200"}`}
                            >
                              Top fit
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${isLight ? "text-slate-500" : "text-slate-300/70"}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                            <span
                              className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                            >
                              {shop.rating}
                            </span>
                            <span>({shop.reviews})</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin
                              className={`h-4 w-4 ${isLight ? "text-blue-500/60" : "text-blue-200/50"}`}
                            />
                            {shop.mapDistanceLabel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Shield
                              className={`h-4 w-4 ${isLight ? "text-blue-500/60" : "text-blue-200/50"}`}
                            />
                            {shop.insuranceCompatibilityScore}% carrier fit
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnlike(shop.id)}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                          isLight
                            ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill="currentColor" />
                        Remove
                      </button>
                    </div>

                    <p
                      className={`mt-3 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
                    >
                      {shop.aiSummary}
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div
                        className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
                        >
                          AI Fit
                        </p>
                        <p
                          className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                        >
                          {shop.recommendationScore}%
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
                        >
                          Avg ticket
                        </p>
                        <p
                          className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                        >
                          {shop.averagePriceLabel}
                        </p>
                      </div>
                      <div
                        className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
                        >
                          Response
                        </p>
                        <p
                          className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                        >
                          {shop.responseTimeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {shop.specialties.slice(0, 4).map((specialty) => (
                        <span
                          key={specialty}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"}`}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {shop.insurerPrograms.slice(0, 3).map((program) => (
                        <span
                          key={program}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            isLight
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-emerald-400/15 text-emerald-300"
                          }`}
                        >
                          {program}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="rounded-2xl px-4 py-3 text-sm font-medium text-white"
                        style={{ backgroundColor: primaryColor }}
                        onClick={onOpenMap}
                      >
                        Review In Map
                      </button>
                      <button
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                          isLight
                            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            : "bd-glass-control--utility"
                        }`}
                      >
                        <Phone className="h-4 w-4" />
                        Contact Shop
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
