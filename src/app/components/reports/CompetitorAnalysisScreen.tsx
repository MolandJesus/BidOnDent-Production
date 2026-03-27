import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bookmark,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Wrench,
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
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

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
  const capacityBoost =
    capacityBand === "high-capacity" ? 34 : capacityBand === "balanced" ? 18 : 8;

  return Math.max(24, Math.round(reviewCount * 0.42 + completionRate * 0.38 + capacityBoost));
}

function deriveAverageRepairDays(
  completionRate: number,
  responseTimeHours: number,
  capacityBand: string
) {
  const capacityDelta =
    capacityBand === "boutique" ? 0.8 : capacityBand === "high-capacity" ? -0.5 : 0;
  const days = 4.2 - (completionRate - 90) * 0.05 + responseTimeHours * 0.08 + capacityDelta;
  return `${Math.max(2.2, Math.round(days * 10) / 10).toFixed(1)} days`;
}

function deriveTrendingState(recommendationScore: number, completionRate: number) {
  if (recommendationScore >= 90 || completionRate >= 98) {
    return "up";
  }

  if (completionRate <= 93) {
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

  const marketListings = buildShopMapListings({
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

  return (
    <div className="min-h-screen pb-20">
      <div
        className="sticky top-0 z-10 px-4 py-4 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Competitor Analysis</h1>
            <p className="text-sm text-white/80">
              Watchlist synced from the Smart Shop Map for your shop account
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Search competitors, neighborhoods, or specialties..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-white/30 bg-white/20 py-2.5 pl-11 pr-4 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      <div className={`border-b bd-glass-panel px-4 py-4 ${isLight ? "border-slate-200/60" : "border-white/30"}`}>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {marketListings.length}
            </p>
            <p className="text-xs text-slate-500">Competitors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {watchedListings.length}
            </p>
            <p className="text-xs text-slate-500">Watched</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500">Avg Rating</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-blue-500/100/10 p-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>Estimated Market Share</span>
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
              className="mt-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              Open Competitor Map
            </button>
          )}
        </div>
      </div>

      <div className={`border-b bd-glass-panel px-4 py-3 ${isLight ? "border-slate-200/60" : "border-white/30"}`}>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSortBy("rating")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              sortBy === "rating" ? "text-white shadow-md" : "bd-glass-control--utility"
            }`}
            style={sortBy === "rating" ? { backgroundColor: primaryColor } : {}}
          >
            By Rating
          </button>
          <button
            onClick={() => setSortBy("jobs")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              sortBy === "jobs" ? "text-white shadow-md" : "bd-glass-control--utility"
            }`}
            style={sortBy === "jobs" ? { backgroundColor: primaryColor } : {}}
          >
            By Jobs
          </button>
          <button
            onClick={() => setSortBy("distance")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              sortBy === "distance" ? "text-white shadow-md" : "bd-glass-control--utility"
            }`}
            style={sortBy === "distance" ? { backgroundColor: primaryColor } : {}}
          >
            By Distance
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {marketListings.map((shop, index) => (
          <article
            key={shop.id}
            className="bd-glass-card overflow-hidden rounded-[26px] transition-shadow hover:shadow-md"
          >
            <div className={`border-b p-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                    <h3 className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{shop.name}</h3>
                    {shop.topPick && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    {shop.watched && (
                      <span className="rounded-full bg-blue-500/100/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Watched
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating}</span>
                      <span className="text-sm text-slate-400">({shop.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-400">{shop.mapDistanceLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {shop.trending === "up" && (
                    <>
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600">Rising</span>
                    </>
                  )}
                  {shop.trending === "down" && (
                    <>
                      <TrendingDown className="h-5 w-5 text-rose-500" />
                      <span className="text-xs font-medium text-rose-600">Cooling</span>
                    </>
                  )}
                  {shop.trending === "stable" && (
                    <span className="text-xs font-medium text-slate-500">Stable</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Monthly Jobs</p>
                    <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{shop.monthlyJobs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Avg Cost</p>
                    <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{shop.averagePriceLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Avg Time</p>
                    <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{shop.averageRepairTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{shop.location}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {shop.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded bg-blue-500/100/10 px-2 py-1 text-xs font-medium text-blue-400"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {shop.certifications.map((certification) => (
                    <span
                      key={certification}
                      className="flex items-center gap-1 rounded bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700"
                    >
                      <Award className="h-3 w-3" />
                      {certification}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setWatchlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shop.id))
                  }
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    shop.watched
                      ? "border border-blue-400/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      : isLight
                        ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        : "border border-white/[0.10] bg-white/[0.06] text-slate-300 hover:bg-white/[0.10]"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  {shop.watched ? "Remove From Watchlist" : "Watch Competitor"}
                </button>
                {onOpenMap && (
                  <button
                    onClick={onOpenMap}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Review In Map
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
