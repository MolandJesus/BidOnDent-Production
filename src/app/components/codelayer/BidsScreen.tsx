import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import ShopRatingModal from "../shop/ShopRatingModal";
import BidCardArticle from "./BidCardArticle";
import type { Bid, DamageReport } from "../../types";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type BidsScreenProps = {
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onBack?: () => void;
  onStartReport?: () => void;
  userType?: "customer" | "shop" | "insurer";
  bids?: Bid[];
  reports?: DamageReport[];
  onAcceptBid?: (details: {
    bidId: string;
    shopName: string;
    price: number;
    timeframe: string;
    reportId?: string;
  }) => void;
  onRejectBid?: (details: { bidId: string; shopName: string }) => void;
};

type FilterType = "all" | "lowest" | "fastest" | "rating";

export default function BidsScreen({
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  onBack,
  onStartReport,
  userType = "customer",
  bids: incomingBids = [],
  reports = [],
  onAcceptBid,
  onRejectBid,
}: BidsScreenProps) {
  const isLight = appearanceMode === "light";
  const [activeBid, setActiveBid] = useState<string | number | null>(null);
  const [acceptedBidId, setAcceptedBidId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopRatings, setShopRatings] = useState<{
    [key: string]: { rating: number; review: string; categoryRatings?: Record<string, number> };
  }>({});

  const liveBids = useMemo(() => {
    return (incomingBids || []).map((bid, index) => ({
      id: bid.id || `bid-${index}`,
      reportId: bid.reportId,
      shopName: bid.shopName || "Auto Shop",
      rating: Number(bid.shopRating || 0),
      reviews: Number(bid.shopReviews || 0),
      price: Number(bid.amount || 0),
      estimatedDays: Number(bid.estimatedDays || 0),
      timeframe: bid.estimatedDays
        ? `${bid.estimatedDays}-${bid.estimatedDays + 1} days`
        : "Timeline pending",
      distance: bid.shopDistance || "Within service area",
      warranty: "Scope shared after acceptance",
      description:
        bid.description || "Bid details will be confirmed with the shop after selection.",
      image: "",
      status: bid.status || "pending",
    }));
  }, [incomingBids]);

  // Restore acceptedBidId from bid data on mount/update
  useEffect(() => {
    const alreadyAccepted = liveBids.find((b) => b.status === "accepted");
    if (alreadyAccepted && acceptedBidId !== alreadyAccepted.id) {
      setAcceptedBidId(alreadyAccepted.id);
    }
  }, [liveBids]);

  const selectedReport = useMemo(() => {
    if (liveBids.length === 0) {
      return null;
    }

    return reports.find((report) => report.id === liveBids[0].reportId) || null;
  }, [liveBids, reports]);

  const vehicleLabel = selectedReport
    ? [
        selectedReport?.vehicle?.year || selectedReport?.vehicleInfo?.year,
        selectedReport?.vehicle?.make || selectedReport?.vehicleInfo?.make,
        selectedReport?.vehicle?.model || selectedReport?.vehicleInfo?.model,
      ]
        .filter(Boolean)
        .join(" ")
    : "your report";

  const hasLiveBids = liveBids.length > 0;

  useEffect(() => {
    if (hasLiveBids && activeBid === null) {
      setActiveBid(liveBids[0]?.id ?? null);
    }
  }, [activeBid, hasLiveBids, liveBids]);

  if (!hasLiveBids) {
    return (
      <div className="pb-20 px-4 md:px-6 py-4 md:py-5 space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden bd-glass-card p-5"
          style={{
            background: isLight
              ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.88) 100%)"
              : "linear-gradient(180deg, rgba(11, 23, 47, 0.86) 0%, rgba(8, 18, 38, 0.82) 100%)",
            borderColor: isLight ? "rgba(148,163,184,0.30)" : "rgba(96, 165, 250, 0.24)",
          }}
        >
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                className={`p-2 rounded-xl transition-colors ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
                onClick={onBack}
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-blue-100"}`} />
              </button>
            )}
            <div className="flex-1">
              <h1
                className={`font-semibold text-2xl ${isLight ? "text-slate-800" : "text-slate-100"}`}
              >
                Repair Bids
              </h1>
              <p className={isLight ? "text-slate-500" : "text-blue-100/80"}>
                No live bids have been submitted for your reports yet.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="bd-glass-card p-5 sm:p-6 text-center"
          style={{
            background: isLight
              ? "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.84) 100%)"
              : "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
            borderColor: isLight ? "rgba(148,163,184,0.25)" : "rgba(96, 165, 250, 0.20)",
          }}
        >
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border ${
              isLight ? "bg-blue-50 border-blue-200/50" : "bg-blue-400/15 border-blue-300/20"
            }`}
          >
            <Clock className={`h-6 w-6 ${isLight ? "text-blue-500" : "text-blue-200"}`} />
          </div>
          <h2 className={`text-lg font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
            Waiting for shop responses
          </h2>
          <p
            className={`mt-2 text-sm leading-relaxed max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-blue-100/80"}`}
          >
            Once you submit a damage report, nearby shops will review it and send competitive bids.
            Compare pricing, timelines, and ratings right here.
          </p>
          {onStartReport && (
            <button
              onClick={onStartReport}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
              }}
            >
              Submit a Report
            </button>
          )}
        </motion.section>
      </div>
    );
  }

  const lowestPrice = Math.min(...liveBids.map((bid) => bid.price));
  const averagePrice = Math.round(
    liveBids.reduce((sum, bid) => sum + bid.price, 0) / Math.max(1, liveBids.length)
  );
  const fastestBidDays = Math.min(
    ...liveBids.map((bid) => Math.max(1, Number(bid.estimatedDays || 0)))
  );
  const recommendedId = useMemo(() => {
    return [...liveBids].sort((a, b) => b.rating - a.rating + (b.reviews - a.reviews) / 200)[0].id;
  }, [liveBids]);

  const filteredBids = useMemo(() => {
    return [...liveBids].sort((a, b) => {
      if (filter === "lowest") return a.price - b.price;
      if (filter === "fastest") {
        const aDays = Math.max(1, Number(a.estimatedDays || 0));
        const bDays = Math.max(1, Number(b.estimatedDays || 0));
        return aDays - bDays;
      }
      if (filter === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [filter, liveBids]);

  const handleRating = (
    shopName: string,
    rating: number,
    review: string,
    categoryRatings: { quality: number; service: number; timeliness: number; value: number }
  ) => {
    setShopRatings((prevRatings) => ({
      ...prevRatings,
      [shopName]: { rating, review, categoryRatings },
    }));
    setShowRatingModal(false);
  };

  const filters: Array<{ id: FilterType; label: string }> = [
    { id: "all", label: "All Bids" },
    { id: "lowest", label: "Lowest Price" },
    { id: "fastest", label: "Fastest" },
    { id: "rating", label: "Highest Rated" },
  ];

  return (
    <div className="pb-20 px-4 md:px-6 py-4 md:py-5 space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bd-glass-card p-4 md:p-5"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.88) 100%)"
            : "linear-gradient(180deg, rgba(11, 23, 47, 0.84) 0%, rgba(8, 18, 38, 0.80) 100%)",
          borderColor: isLight ? "rgba(148,163,184,0.30)" : "rgba(96, 165, 250, 0.24)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full"
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full"
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className={`p-2 rounded-xl transition-colors ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-blue-100"}`} />
            </button>
          )}
          <div className="flex-1">
            <h1
              className={`font-semibold text-2xl ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              Repair Bids
            </h1>
            <p className={isLight ? "text-slate-500" : "text-blue-100/80"}>
              {liveBids.length} bid{liveBids.length === 1 ? "" : "s"} for {vehicleLabel}
            </p>
          </div>
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
              isLight
                ? "bg-blue-50 text-blue-700 border-blue-200/50"
                : "bg-blue-400/12 text-blue-100 border-blue-300/20"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Compare before accepting
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div
            className={`rounded-xl px-3 py-2.5 border ${
              isLight ? "bg-white/70 border-slate-200/50" : "bg-slate-900/25 border-blue-300/18"
            }`}
            style={isLight ? {} : { boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Lowest Bid
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              ${lowestPrice}
            </p>
          </div>
          <div
            className={`rounded-xl px-3 py-2.5 border ${
              isLight ? "bg-white/70 border-slate-200/50" : "bg-slate-900/25 border-blue-300/18"
            }`}
            style={isLight ? {} : { boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Average Quote
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              ${averagePrice}
            </p>
          </div>
          <div
            className={`rounded-xl px-3 py-2.5 border ${
              isLight ? "bg-white/70 border-slate-200/50" : "bg-slate-900/25 border-blue-300/18"
            }`}
            style={isLight ? {} : { boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Fastest Timeline
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              {fastestBidDays}-{fastestBidDays + 1} days
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="bd-glass-card p-3"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.84) 100%)"
            : "linear-gradient(180deg, rgba(11, 23, 47, 0.78) 0%, rgba(8, 18, 38, 0.74) 100%)",
          borderColor: isLight ? "rgba(148,163,184,0.25)" : "rgba(96, 165, 250, 0.18)",
        }}
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === item.id
                  ? "text-white border border-blue-400/40 shadow-sm"
                  : isLight
                    ? "text-slate-600 bg-slate-100/80 border border-slate-200/60 hover:bg-slate-200/60"
                    : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"
              }`}
              style={
                filter === item.id
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.45) 0%, rgba(56,189,248,0.3) 100%)",
                      boxShadow: "inset 0 1px 0 rgba(148,163,184,0.1)",
                    }
                  : {}
              }
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredBids.map((bid) => {
          const userRated = shopRatings[bid.shopName];

          return (
            <BidCardArticle
              key={bid.id}
              bid={bid}
              isActive={activeBid === bid.id}
              isAccepted={acceptedBidId === bid.id}
              isRecommended={bid.id === recommendedId}
              lowestPrice={lowestPrice}
              primaryColor={primaryColor}
              userType={userType}
              appearanceMode={appearanceMode}
              userRating={userRated}
              onToggle={() => setActiveBid((prev) => (prev === bid.id ? null : bid.id))}
              onAccept={() => {
                setAcceptedBidId(bid.id);
                onAcceptBid?.({
                  bidId: String(bid.id),
                  shopName: bid.shopName,
                  price: bid.price,
                  timeframe: bid.timeframe,
                  reportId: bid.reportId,
                });
              }}
              onReject={() => {
                onRejectBid?.({
                  bidId: String(bid.id),
                  shopName: bid.shopName,
                });
              }}
              onRate={() => {
                setSelectedShop(bid.shopName);
                setShowRatingModal(true);
              }}
            />
          );
        })}
      </motion.section>

      {showRatingModal && (
        <ShopRatingModal
          shopName={selectedShop}
          onClose={() => setShowRatingModal(false)}
          onSubmit={(rating, review, categoryRatings) =>
            handleRating(selectedShop, rating, review, categoryRatings)
          }
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
