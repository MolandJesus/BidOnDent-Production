import { AnimatePresence, motion } from "motion/react";
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
};

type BidCardArticleProps = {
  bid: LiveBid;
  isActive: boolean;
  isAccepted: boolean;
  isRecommended: boolean;
  lowestPrice: number;
  primaryColor: string;
  userType: "customer" | "shop" | "insurer";
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
  userRating,
  onToggle,
  onAccept,
  onReject,
  onRate,
}: BidCardArticleProps) {
  const savings = bid.price - lowestPrice;

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3, scale: 1.003 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
        isActive ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"
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
      <button onClick={onToggle} className="w-full p-4 text-left">
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
              {isRecommended && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                  <BadgeCheck className="w-3 h-3" />
                  Recommended
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-slate-600 gap-2">
              {bid.rating > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" fill="#FBBF24" />
                    {bid.rating}
                  </span>
                  <span>({bid.reviews} reviews)</span>
                </>
              ) : (
                <span className="text-slate-400">New shop</span>
              )}
              {userRating && (
                <span className="text-emerald-700 font-medium">
                  • You rated {userRating.rating}/5
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-3xl text-slate-900 leading-none">${bid.price}</div>
            <div className="text-sm text-slate-600 mt-1">{bid.timeframe}</div>
            {savings === 0 ? (
              <div className="text-xs text-emerald-700 mt-1 font-medium">Lowest bid</div>
            ) : (
              <div className="text-xs text-slate-500 mt-1">+${savings} vs lowest</div>
            )}
          </div>
          <div className="ml-2 text-slate-500 group-hover:text-slate-700 transition-colors">
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
                  onClick={onAccept}
                  className="px-4 py-2.5 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                  }}
                >
                  {isAccepted ? "Accepted" : "Accept Bid"}
                </button>
                {!isAccepted && onReject && (
                  <button
                    onClick={onReject}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-medium hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all"
                  >
                    Decline
                  </button>
                )}
                <button className="px-3 py-2.5 rounded-xl border border-slate-200/60 font-medium hover:bg-white/40 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-slate-200/60 font-medium hover:bg-white/40 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-slate-200/60 font-medium hover:bg-white/40 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                {userType === "customer" && (
                  <button
                    className="px-3 py-2.5 rounded-xl border border-slate-200/60 font-medium hover:bg-white/40 transition-colors"
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
