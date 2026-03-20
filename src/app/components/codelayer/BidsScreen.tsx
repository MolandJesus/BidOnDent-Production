import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Star,
  ThumbsUp,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import ShopRatingModal from "../shop/ShopRatingModal";

type BidsScreenProps = {
  primaryColor?: string;
  onBack?: () => void;
  userType?: "customer" | "shop" | "insurer";
  onAcceptBid?: (details: { shopName: string; price: number; timeframe: string }) => void;
};

type FilterType = "all" | "lowest" | "fastest" | "rating";

export default function BidsScreen({
  primaryColor = "#0056b3",
  onBack,
  userType = "customer",
  onAcceptBid,
}: BidsScreenProps) {
  const [activeBid, setActiveBid] = useState<number | null>(1);
  const [acceptedBidId, setAcceptedBidId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopRatings, setShopRatings] = useState<{
    [key: string]: { rating: number; review: string; categoryRatings?: any };
  }>({});

  const bids = [
    {
      id: 1,
      shopName: "Express Auto Body",
      rating: 4.8,
      reviews: 124,
      price: 850,
      timeframe: "3-4 days",
      distance: "2.4 miles",
      warranty: "Lifetime warranty",
      description:
        "Complete bumper repair and paint matching using OEM-grade materials. Includes quality inspection before delivery.",
      image:
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      shopName: "Premium Collision Center",
      rating: 4.6,
      reviews: 86,
      price: 925,
      timeframe: "2-3 days",
      distance: "3.8 miles",
      warranty: "5-year warranty",
      description:
        "Full bumper replacement with factory paint match. Includes rental support and daily progress updates.",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      shopName: "Value Auto Repair",
      rating: 4.2,
      reviews: 56,
      price: 675,
      timeframe: "5-7 days",
      distance: "1.5 miles",
      warranty: "3-year warranty",
      description:
        "Budget-friendly bumper repair and repainting with free pickup and delivery within 5 miles.",
      image:
        "https://images.unsplash.com/photo-1666919643134-d97687c1826c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const lowestPrice = Math.min(...bids.map((bid) => bid.price));
  const averagePrice = Math.round(
    bids.reduce((sum, bid) => sum + bid.price, 0) / Math.max(1, bids.length)
  );
  const fastestBidDays = Math.min(...bids.map((bid) => parseInt(bid.timeframe.split("-")[0], 10)));
  const recommendedId = useMemo(() => {
    return [...bids].sort((a, b) => b.rating - a.rating + (b.reviews - a.reviews) / 200)[0].id;
  }, []);

  const filteredBids = useMemo(() => {
    return [...bids].sort((a, b) => {
      if (filter === "lowest") return a.price - b.price;
      if (filter === "fastest") {
        const aDays = parseInt(a.timeframe.split("-")[0], 10);
        const bDays = parseInt(b.timeframe.split("-")[0], 10);
        return aDays - bDays;
      }
      if (filter === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [filter]);

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
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-cyan-200/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-200/35 blur-2xl" />
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-2xl text-slate-900">Repair Bids</h1>
            <p className="text-slate-600">3 bids for your 2021 Toyota Camry</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Compare before accepting
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Lowest Bid</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${lowestPrice}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average Quote</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">${averagePrice}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/75 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fastest Timeline</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {fastestBidDays}-{fastestBidDays + 1} days
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === item.id
                  ? "text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400"
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
          const isActive = activeBid === bid.id;
          const savings = bid.price - lowestPrice;
          const userRated = shopRatings[bid.shopName];

          return (
            <motion.article
              key={bid.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3, scale: 1.003 }}
              transition={{ duration: 0.2 }}
              className={`group relative rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
                isActive ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {bid.id === recommendedId && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 40%, #0f8fd7 60%, transparent 100%)`,
                  }}
                />
              )}
              <button
                onClick={() => setActiveBid((prev) => (prev === bid.id ? null : bid.id))}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <ImageWithFallback
                      src={bid.image}
                      alt={bid.shopName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-slate-900 text-[1.2rem] truncate">
                        {bid.shopName}
                      </h3>
                      {bid.id === recommendedId && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                          <BadgeCheck className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400" fill="#FBBF24" />
                        {bid.rating}
                      </span>
                      <span>({bid.reviews} reviews)</span>
                      {userRated && (
                        <span className="text-emerald-700 font-medium">
                          • You rated {userRated.rating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-3xl text-slate-900 leading-none">
                      ${bid.price}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{bid.timeframe}</div>
                    {savings === 0 ? (
                      <div className="text-xs text-emerald-700 mt-1 font-medium">Lowest bid</div>
                    ) : (
                      <div className="text-xs text-slate-500 mt-1">+${savings} vs lowest</div>
                    )}
                  </div>
                  <div className="ml-2 text-slate-500 group-hover:text-slate-700 transition-colors">
                    {isActive ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-slate-100">
                      <div className="flex flex-wrap gap-3 text-sm mt-3 mb-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          <DollarSign className="w-4 h-4" />${bid.price}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          <Clock className="w-4 h-4" />
                          {bid.timeframe}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          <MapPin className="w-4 h-4" />
                          {bid.distance}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                          <BadgeCheck className="w-4 h-4" />
                          {bid.warranty}
                        </div>
                      </div>

                      <p className="text-slate-600 mb-4">{bid.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setAcceptedBidId(bid.id);
                            onAcceptBid?.({
                              shopName: bid.shopName,
                              price: bid.price,
                              timeframe: bid.timeframe,
                            });
                          }}
                          className="px-4 py-2.5 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                          }}
                        >
                          {acceptedBidId === bid.id ? "Accepted" : "Accept Bid"}
                        </button>
                        <button className="px-3 py-2.5 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2.5 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-2.5 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {userType === "customer" && (
                          <button
                            className="px-3 py-2.5 rounded-xl border border-slate-300 font-medium hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              setSelectedShop(bid.shopName);
                              setShowRatingModal(true);
                            }}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
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
