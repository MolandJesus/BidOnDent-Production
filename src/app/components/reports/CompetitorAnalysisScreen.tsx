import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import CompetitorShopCard from "./CompetitorShopCard";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../../services/auth/websiteIdentity";
import { toggleRoleCollectionShopId } from "../../services/intelligence/shopMapExperience";
import { useShopMapListings } from "../../hooks/useShopMapListings";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import { defaultCoverageCenter } from "../landing/coverageData";

interface CompetitorAnalysisScreenProps {
  onBack: () => void;
  onOpenMap?: () => void;
  primaryColor: string;
  secondaryColor: string;
  identity?: WebsiteIdentity | null;
  appearanceMode?: DashboardAppearanceMode;
}

type SortMode = "rating" | "jobs" | "distance";

function deriveMonthlyJobs(reviewCount: number, completionRate: number, capacityBand: string) {
  const safeReviews = reviewCount || 0;
  const safeRate = completionRate || 90;
  const capacityBoost =
    capacityBand === "high-capacity" ? 34 : capacityBand === "balanced" ? 18 : 8;

  return Math.max(24, Math.round(safeReviews * 0.42 + safeRate * 0.38 + capacityBoost));
}

function deriveAverageRepairDays(
  completionRate: number,
  responseTimeHours: number,
  capacityBand: string
) {
  const safeRate = completionRate || 90;
  const safeHours = responseTimeHours || 4;
  const capacityDelta =
    capacityBand === "boutique" ? 0.8 : capacityBand === "high-capacity" ? -0.5 : 0;
  const days = 4.2 - (safeRate - 90) * 0.05 + safeHours * 0.08 + capacityDelta;
  return `${Math.max(2.2, Math.round(days * 10) / 10).toFixed(1)} days`;
}

function deriveTrendingState(recommendationScore: number, completionRate: number) {
  const safeScore = recommendationScore || 0;
  const safeRate = completionRate || 90;
  if (safeScore >= 90 || safeRate >= 98) {
    return "up";
  }

  if (safeRate <= 93) {
    return "down";
  }

  return "stable";
}

export default function CompetitorAnalysisScreen({
  onBack,
  onOpenMap,
  primaryColor,
  secondaryColor,
  identity,
  appearanceMode = "map-dark",
}: CompetitorAnalysisScreenProps) {
  const isLight = appearanceMode === "light";
  const reduceMotion = useReducedMotion();
  const { inventory } = useNetworkDirectory();
  const memory = loadWebsiteSessionMemory(identity);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("rating");
  const [watchlistIds, setWatchlistIds] = useState<number[]>(
    memory.mapSession?.shopWatchlistIds || []
  );
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    memory.insuranceConnection.connectedInsurerIds
  );

  useEffect(() => {
    const nextMemory = loadWebsiteSessionMemory(identity);
    setWatchlistIds(nextMemory.mapSession?.shopWatchlistIds || []);
    setConnectedInsurerIds(nextMemory.insuranceConnection.connectedInsurerIds);
  }, [identity?.websiteUserKey]);

  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        mapSession: {
          shopWatchlistIds: watchlistIds,
        },
      },
      { accountType: "shop" }
    );
  }, [identity, watchlistIds]);

  const marketListings = useShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: inventory.shops,
    searchQuery: "",
    sortBy: "smart-match",
    userType: "shop",
  })
    .map((shop) => ({
      ...shop,
      averageRepairTime: deriveAverageRepairDays(
        shop.completionRate,
        shop.responseTimeHours,
        shop.capacityBand
      ),
      location: `${shop.mapResult.city}, ${shop.mapResult.state}`,
      monthlyJobs: deriveMonthlyJobs(shop.reviews, shop.completionRate, shop.capacityBand),
      trending: deriveTrendingState(shop.recommendationScore, shop.completionRate) as
        | "up"
        | "down"
        | "stable",
      watched: watchlistIds.includes(shop.id),
    }))
    .filter((shop) => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      if (!normalizedQuery) {
        return true;
      }

      return (
        shop.name.toLowerCase().includes(normalizedQuery) ||
        shop.location.toLowerCase().includes(normalizedQuery) ||
        shop.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedQuery))
      );
    })
    .sort((left, right) => {
      if (left.watched !== right.watched) {
        return left.watched ? -1 : 1;
      }

      if (sortBy === "jobs") {
        return right.monthlyJobs - left.monthlyJobs;
      }

      if (sortBy === "distance") {
        return left.mapDistanceMiles - right.mapDistanceMiles;
      }

      return right.rating - left.rating;
    });

  const totalJobs = marketListings.reduce((sum, shop) => sum + shop.monthlyJobs, 0);
  const avgRating =
    marketListings.reduce((sum, shop) => sum + shop.rating, 0) / Math.max(marketListings.length, 1);
  const watchedListings = marketListings.filter((shop) => shop.watched);
  const yourShopJobs = Math.max(96, Math.round(totalJobs * 0.18));

  const competitorPins: CoveragePartnerShop[] = useMemo(
    () =>
      marketListings
        .filter((s) => s.mapResult?.coordinates?.latitude && s.mapResult?.coordinates?.longitude)
        .map((s) => ({
          id: String(s.id),
          name: s.name,
          countyLabel: s.location,
          lat: s.mapResult.coordinates.latitude,
          lng: s.mapResult.coordinates.longitude,
          label: s.name,
          specialties: s.specialties.slice(0, 3),
          rating: s.rating,
        })),
    [marketListings]
  );

  const competitorMapCenter: [number, number] = useMemo(() => {
    if (competitorPins.length > 0) return [competitorPins[0].lat, competitorPins[0].lng];
    return defaultCoverageCenter;
  }, [competitorPins]);

  const [focusedCompetitorId, setFocusedCompetitorId] = useState<string | null>(null);

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 pt-4">
        <div
          className={`bd-dashboard-panel px-4 py-4 ${isLight ? "bg-white/90 border border-slate-200/60" : ""}`}
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
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <ArrowLeft className={`h-6 w-6 ${isLight ? "text-slate-700" : "text-slate-200"}`} />
            </button>
            <div>
              <p
                className={`mb-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-cyan-600" : "text-cyan-300/80"}`}
              >
                Market intelligence
              </p>
              <h1 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Competitor Analysis
              </h1>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
                Watchlist synced from the Smart Shop Map for your shop account
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-slate-400/60"}`}
            />
            <input
              type="text"
              placeholder="Search competitors, neighborhoods, or specialties..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full rounded-2xl border py-2.5 pl-11 pr-4 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                isLight
                  ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-blue-300"
                  : "border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400/60 focus:ring-blue-400/20"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="bd-dashboard-panel px-4 py-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bd-dashboard-section p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {marketListings.length}
              </p>
              <p className="text-xs text-slate-500">Competitors</p>
            </div>
            <div className="bd-dashboard-section p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {watchedListings.length}
              </p>
              <p className="text-xs text-slate-500">Watched</p>
            </div>
            <div className="bd-dashboard-section p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {avgRating.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">Avg Rating</p>
            </div>
          </div>

          <p className={`mt-3 text-[11px] italic ${isLight ? "text-slate-400" : "text-slate-500"}`}>
            Market data is estimated from directory metrics and may not reflect actual volumes.
          </p>

          <div className="bd-dashboard-note mt-3 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Estimated Market Share
              </span>
              <span className="text-sm font-bold" style={{ color: primaryColor }}>
                {((yourShopJobs / Math.max(totalJobs, 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (yourShopJobs / Math.max(totalJobs, 1)) * 100)}%`,
                  backgroundColor: primaryColor,
                }}
              />
            </div>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="bd-dashboard-secondary-button mt-3 rounded-2xl px-3 py-2 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                Open Competitor Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/*
       * Competitor density map — Tier B preview surface (Pass 235).
       *
       * Convergence metadata (per Block D execution doctrine):
       *  1. Runtime paths touched     : P3 (preview-surface exploration); P4 escalation via onOpenMap → shop directory in analysis mode (231b §5 carry-forward map).
       *  2. Runtime classes touched   : Preview only.
       *  3. Tier semantics touched    : Tier B preview (panel-embedded analysis surface).
       *  4. Motion classes touched    : none. The framer-motion section entry is the existing surface motion (Class A acknowledgement, already reduceMotion-aware).
       *  5. Shell hierarchy impact    : Panel-first archetype preserved (231c §6). Map block now satisfies 231c §4.2 tap-to-expand affordance via onMapClick={onOpenMap} when an escalation target exists.
       *  6. Authority semantics       : unchanged. Pin tap remains an in-screen analysis state mutation (setFocusedCompetitorId), not an escalation. Engine 3 owns no camera.
       *  7. Reduced-motion inheritance: unchanged.
       *  8. Hidden-authority risk     : zero. onMapClick wires to the existing onOpenMap callback prop. No new persistence, no imperative camera, no operational state.
       *  9. Continuity guarantees     : unaffected.
       * 10. Rollback semantics        : revert this hunk; behavior reverts to anonymous panel + non-tap-to-expand map.
       */}
      {marketListings.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
          className="bd-dashboard-panel mx-4 mt-4 overflow-hidden rounded-[28px]"
          data-runtime-class="preview"
          data-tier-semantic="B"
          data-expand-target="shop-directory-analysis-mode"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <h3
              className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-200"}`}
            >
              <MapPin className="mr-1.5 inline-block h-4 w-4 align-[-2px] text-blue-400" />
              Competitor density
            </h3>
            <span className="bd-dashboard-chip rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {competitorPins.length} / {marketListings.length} mapped
            </span>
          </div>

          <div className="px-3 pb-3 pt-1">
            {competitorPins.length > 0 ? (
              <div
                className="overflow-hidden rounded-2xl"
                style={{ height: window.innerWidth < 640 ? 200 : 220 }}
              >
                <DashboardMapPreview
                  shops={competitorPins}
                  reportPins={[]}
                  center={competitorMapCenter}
                  zoom={9}
                  isLight={isLight}
                  onShopClick={(shop) => setFocusedCompetitorId(shop.id ?? null)}
                  onMapClick={onOpenMap}
                  /* Pass 242 (KI-181 sub-pass B audit): autoFit="always".
                     Competitor-distribution view is fit-driven by design;
                     explicitization preserves current behavior. */
                  autoFit="always"
                />
              </div>
            ) : (
              <div
                className={`bd-dashboard-note flex items-center justify-center gap-2 rounded-2xl py-6 ${isLight ? "text-slate-400" : "text-slate-400/60"}`}
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm">No competitors with resolvable coordinates</span>
              </div>
            )}
          </div>

          {competitorPins.length > 0 && (
            <div
              className={`flex items-center gap-3 border-t px-4 py-2 text-xs ${isLight ? "border-slate-100 text-slate-500" : "border-white/5 text-slate-400/60"}`}
            >
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Competitors
              </span>
              <span className={isLight ? "text-slate-400" : "text-slate-500"}>
                Tap a pin to highlight below
              </span>
            </div>
          )}
        </motion.section>
      )}

      <div className="px-4 pt-4">
        <div className="bd-dashboard-panel px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSortBy("rating")}
              className={`bd-dashboard-filter-button whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                sortBy === "rating" ? "bd-dashboard-filter-button--active text-white" : ""
              }`}
              style={sortBy === "rating" ? { background: primaryColor } : {}}
            >
              By Rating
            </button>
            <button
              onClick={() => setSortBy("jobs")}
              className={`bd-dashboard-filter-button whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                sortBy === "jobs" ? "bd-dashboard-filter-button--active text-white" : ""
              }`}
              style={sortBy === "jobs" ? { background: primaryColor } : {}}
            >
              By Jobs
            </button>
            <button
              onClick={() => setSortBy("distance")}
              className={`bd-dashboard-filter-button whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                sortBy === "distance" ? "bd-dashboard-filter-button--active text-white" : ""
              }`}
              style={sortBy === "distance" ? { background: primaryColor } : {}}
            >
              By Distance
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {marketListings.map((shop, index) => (
          <CompetitorShopCard
            key={shop.id}
            shop={shop}
            index={index}
            isLight={isLight}
            isFocused={focusedCompetitorId === String(shop.id)}
            primaryColor={primaryColor}
            onToggleWatch={(shopId) =>
              setWatchlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId))
            }
            onOpenMap={onOpenMap}
          />
        ))}
      </div>
    </div>
  );
}
