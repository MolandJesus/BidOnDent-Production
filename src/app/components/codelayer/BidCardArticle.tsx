import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  ThumbsUp,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export type LiveBid = {
  id: string | number;
  reportId: string;
  shopName: string;
  rating: number;
  reviews: number;
  price: number;
  estimatedDays: number;
  timeframe: string;
  distance: string;
  warranty: string;
  description: string;
  image: string;
  shopLatitude?: number | null;
  shopLongitude?: number | null;
};

type BidCardArticleProps = {
  bid: LiveBid;
  isActive: boolean;
  isAccepted: boolean;
  isRecommended: boolean;
  lowestPrice: number;
  primaryColor: string;
  userType: "customer" | "shop" | "insurer";
  appearanceMode?: DashboardAppearanceMode;
  userRating?: { rating: number; review: string };
  onToggle: () => void;
  onAccept: () => void;
  onReject?: () => void;
  onRate: () => void;
};

export default function BidCardArticle({
  bid,
  isActive,
  isAccepted,
  isRecommended,
  lowestPrice,
  primaryColor,
  userType,
  appearanceMode = "map-dark",
  userRating,
  onToggle,
  onAccept,
  onReject,
  onRate,
}: BidCardArticleProps) {
  const isLight = appearanceMode === "light";
  const savings = bid.price - lowestPrice;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3, scale: 1.003 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={`bd-dashboard-section group relative overflow-hidden transition-all ${
        isActive ? "bd-dashboard-section--selected" : "bd-dashboard-section--interactive"
      }`}
    >
      {isRecommended && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 40%, #0f8fd7 60%, transparent 100%)`,
          }}
        />
      )}
      <button
        onClick={onToggle}
        aria-expanded={isActive}
        className="w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 ${isLight ? "bg-slate-100" : "bg-white/[0.08]"}`}
          >
            <ImageWithFallback
              src={bid.image}
              alt={bid.shopName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                className={`font-semibold text-[1.2rem] truncate ${isLight ? "text-slate-800" : "text-slate-100"}`}
              >
                {bid.shopName}
              </h3>
              {isRecommended && (
                <span
                  className="bd-dashboard-chip hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold sm:inline-flex"
                  title="Top shop by customer rating × review volume — does not factor price or timeline"
                >
                  <BadgeCheck className="w-3 h-3" />
                  Highest rated
                </span>
              )}
            </div>
            <div
              className={`flex items-center text-sm gap-2 ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
            >
              {bid.rating > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" fill="#FBBF24" />
                    {bid.rating}
                  </span>
                  <span>({bid.reviews} reviews)</span>
                </>
              ) : (
                <span className={isLight ? "text-slate-400" : "text-slate-400/70"}>New shop</span>
              )}
              {userRating && (
                <span className="text-emerald-400 font-medium">
                  • You rated {userRating.rating}/5
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div
              className={`font-bold text-3xl leading-none tabular-nums ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              ${bid.price.toLocaleString()}
            </div>
            <div className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-slate-300/80"}`}>
              {bid.timeframe}
            </div>
            {savings === 0 ? (
              <div className="text-xs text-emerald-400 mt-1 font-medium">Lowest bid</div>
            ) : (
              <div className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-slate-400/80"}`}>
                +${savings.toLocaleString()} vs lowest
              </div>
            )}
          </div>
          <div
            className={`ml-2 transition-colors ${isLight ? "text-blue-500/70 group-hover:text-blue-600" : "text-blue-200/70 group-hover:text-blue-100"}`}
          >
            {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={`px-4 pb-4 border-t ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
            >
              <div className="flex flex-wrap gap-3 text-sm mt-3 mb-3">
                <div className="bd-dashboard-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-sm">
                  <DollarSign className="w-4 h-4" />${bid.price}
                </div>
                <div className="bd-dashboard-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-sm">
                  <Clock className="w-4 h-4" />
                  {bid.timeframe}
                </div>
                <div className="bd-dashboard-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  {bid.distance}
                </div>
                <div className="bd-dashboard-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  {bid.warranty}
                </div>
              </div>

              {bid.shopLatitude && bid.shopLongitude && (
                <div className="bd-dashboard-note mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Shop location available — compare on map</span>
                </div>
              )}

              <p className={`mb-4 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
                {bid.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {isAccepted ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      isLight
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                    }`}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Accepted
                  </span>
                ) : (
                  <>
                    <button
                      onClick={onAccept}
                      className="bd-dashboard-primary-button rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                      }}
                    >
                      Accept Bid
                    </button>
                    {onReject && (
                      <button
                        onClick={onReject}
                        className={`bd-dashboard-secondary-button rounded-xl px-4 py-2.5 font-medium ${
                          isLight
                            ? "text-rose-600 hover:text-rose-700"
                            : "text-rose-300 hover:text-rose-200"
                        }`}
                      >
                        Decline
                      </button>
                    )}
                  </>
                )}
                <button
                  aria-label="Call shop"
                  className="bd-dashboard-secondary-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  aria-label="Message shop"
                  className="bd-dashboard-secondary-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  aria-label="Visit shop website"
                  className="bd-dashboard-secondary-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                {userType === "customer" && (
                  <button
                    aria-label="Rate this shop"
                    className="bd-dashboard-secondary-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={onRate}
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
}
