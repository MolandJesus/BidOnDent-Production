import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import ShopRatingModal from "../shop/ShopRatingModal";
import BidCardArticle from "./BidCardArticle";

type BidsScreenProps = {
  primaryColor?: string;
  onBack?: () => void;
  userType?: "customer" | "shop" | "insurer";
  bids?: any[];
  reports?: any[];
  onAcceptBid?: (details: {
    bidId: string;
    shopName: string;
    price: number;
    timeframe: string;
  }) => void;
  onRejectBid?: (details: { bidId: string; shopName: string }) => void;
};

type FilterType = "all" | "lowest" | "fastest" | "rating";

export default function BidsScreen({
  primaryColor = "#0056b3",
  onBack,
  userType = "customer",
  bids: incomingBids = [],
  reports = [],
  onAcceptBid,
  onRejectBid,
}: BidsScreenProps) {
  const [activeBid, setActiveBid] = useState<string | number | null>(null);
  const [acceptedBidId, setAcceptedBidId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopRatings, setShopRatings] = useState<{
    [key: string]: { rating: number; review: string; categoryRatings?: any };
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
    }));
  }, [incomingBids]);

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
        >
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                className="p-2 rounded-xl hover:bg-white/40 transition-colors"
                onClick={onBack}
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="font-semibold text-2xl text-slate-900">Repair Bids</h1>
              <p className="text-slate-600">
                No live bids have been submitted for your reports yet.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="rounded-2xl border border-dashed border-slate-300/60 bg-slate-50/50 p-5 sm:p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Clock className="h-6 w-6 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Waiting for shop responses</h2>
          <p className="mt-2 text-sm text-slate-600">
            Shops will appear here as soon as they submit live bids against your report.
          </p>
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
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-cyan-200/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-200/35 blur-2xl" />
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className="p-2 rounded-xl hover:bg-white/40 transition-colors"
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-2xl text-slate-900">Repair Bids</h1>
            <p className="text-slate-600">
              {liveBids.length} bid{liveBids.length === 1 ? "" : "s"} for {vehicleLabel}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Compare before accepting
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bd-glass-card rounded-xl px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Lowest Bid</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">${lowestPrice}</p>
          </div>
          <div className="bd-glass-card rounded-xl px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average Quote</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">${averagePrice}</p>
          </div>
          <div className="bd-glass-card rounded-xl px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fastest Timeline</p>
            <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
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
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === item.id ? "text-white shadow-sm" : "bd-glass-control text-slate-700"
              }`}
              style={
                filter === item.id
                  ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }
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
              userRating={userRated}
              onToggle={() => setActiveBid((prev) => (prev === bid.id ? null : bid.id))}
              onAccept={() => {
                setAcceptedBidId(bid.id);
                onAcceptBid?.({
                  bidId: String(bid.id),
                  shopName: bid.shopName,
                  price: bid.price,
                  timeframe: bid.timeframe,
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
