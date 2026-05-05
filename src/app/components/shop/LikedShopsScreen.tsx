import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MapPin, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { useShopMapListings } from "../../hooks/useShopMapListings";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";
import { useNotifications } from "../../features/notifications";
import { defaultCoverageCenter } from "../landing/coverageData";
import LikedShopCard from "./LikedShopCard";
import type { LikedShopsScreenProps } from "./likedShopsScreenHelpers";

export default function LikedShopsScreen({
  onBack,
  onOpenMap,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  identity,
  appearanceMode = "map-dark",
}: LikedShopsScreenProps) {
  const isLight = appearanceMode === "light";
  const reduceMotion = useReducedMotion();
  const { inventory } = useNetworkDirectory();
  const notifications = useNotifications();
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

  const savedListings = useShopMapListings({
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
        className={`border-b ${isLight ? "border-[rgba(140,82,22,0.24)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "border-white/10"}`}
        style={
          isLight
            ? { backdropFilter: "blur(12px)" }
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <ArrowLeft className={`h-5 w-5 ${isLight ? "text-slate-700" : "text-slate-200"}`} />
            </button>
            <div>
              <p
                className={`mb-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-cyan-600" : "text-cyan-300/80"}`}
              >
                Shop shortlist
              </p>
              <h1 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Saved Shops
              </h1>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
                {savedListings.length} customer shortlist{savedListings.length === 1 ? "" : "s"}{" "}
                synced from the map
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <Search
              className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                isLight ? "text-slate-400" : "text-slate-400/60"
              }`}
            />
            <input
              type="text"
              placeholder="Search saved shops, specialties, or carrier programs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full rounded-2xl border py-3 pl-10 pr-4 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                isLight
                  ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(232,238,248,0.88),rgba(247,232,194,0.82))] text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] focus:ring-blue-400"
                  : "border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400/60 focus:ring-blue-400/20"
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
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
            className={`mb-4 overflow-hidden rounded-[28px] ${isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.80),rgba(232,238,248,0.74))] border border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_8px_22px_rgba(15,23,42,0.10)]" : "bd-glass-card"}`}
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
            className={`rounded-[28px] p-5 sm:p-8 text-center ${isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.80),rgba(232,238,248,0.74))] border border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_8px_22px_rgba(15,23,42,0.10)]" : "bd-glass-card"}`}
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
              <LikedShopCard
                key={shop.id}
                shop={shop}
                isLight={isLight}
                primaryColor={primaryColor}
                focused={focusedShopId === String(shop.id)}
                onUnlike={handleUnlike}
                onRequestEstimate={(s) => {
                  notifications.push({
                    title: "Estimate Requested",
                    body: `Your request has been sent to ${s.name}. They'll respond with a quote soon.`,
                    category: "bid",
                    payload: { shopId: s.id, shopName: s.name },
                    priority: "normal",
                    userId: identity?.providerUserId || "",
                    deepLink: { screen: "bid", bidId: String(s.id) },
                  });
                }}
                onOpenMap={onOpenMap}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
