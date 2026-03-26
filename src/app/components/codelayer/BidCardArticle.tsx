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
      className={`group relative bd-glass-card overflow-hidden transition-all ${
        isActive ? "border-blue-400/50 shadow-md" : "hover:border-blue-400/30"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
        borderColor: isActive ? undefined : "rgba(96, 165, 250, 0.18)",
      }}
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
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/[0.08] shrink-0">
            <ImageWithFallback
              src={bid.image}
              alt={bid.shopName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-slate-100 text-[1.2rem] truncate">
                {bid.shopName}
              </h3>
              {isRecommended && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-200 border border-blue-300/20 font-semibold">
                  <BadgeCheck className="w-3 h-3" />
                  Recommended
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-slate-300/80 gap-2">
              {bid.rating > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" fill="#FBBF24" />
                    {bid.rating}
                  </span>
                  <span>({bid.reviews} reviews)</span>
                </>
              ) : (
                <span className="text-slate-400/70">New shop</span>
              )}
              {userRating && (
                <span className="text-emerald-400 font-medium">
                  • You rated {userRating.rating}/5
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-3xl text-slate-100 leading-none tabular-nums">
              ${bid.price}
            </div>
            <div className="text-sm text-slate-300/80 mt-1">{bid.timeframe}</div>
            {savings === 0 ? (
              <div className="text-xs text-emerald-400 mt-1 font-medium">Lowest bid</div>
            ) : (
              <div className="text-xs text-slate-400/80 mt-1">+${savings} vs lowest</div>
            )}
          </div>
          <div className="ml-2 text-blue-200/70 group-hover:text-blue-100 transition-colors">
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
            <div className="px-4 pb-4 border-t border-white/[0.08]">
              <div className="flex flex-wrap gap-3 text-sm mt-3 mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] text-slate-200 border border-white/[0.1]">
                  <DollarSign className="w-4 h-4" />${bid.price}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] text-slate-200 border border-white/[0.1]">
                  <Clock className="w-4 h-4" />
                  {bid.timeframe}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] text-slate-200 border border-white/[0.1]">
                  <MapPin className="w-4 h-4" />
                  {bid.distance}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-400/15 text-blue-300 border border-blue-300/20">
                  <BadgeCheck className="w-4 h-4" />
                  {bid.warranty}
                </div>
              </div>

              <p className="text-slate-300/80 mb-4">{bid.description}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onAccept}
                  disabled={isAccepted}
                  className="px-4 py-2.5 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                  }}
                >
                  {isAccepted ? "Accepted" : "Accept Bid"}
                </button>
                {!isAccepted && onReject && (
                  <button
                    onClick={onReject}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.12] text-slate-400 font-medium hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all"
                  >
                    Decline
                  </button>
                )}
                <button className="px-3 py-2.5 rounded-xl border border-white/[0.12] text-slate-300 hover:bg-white/[0.1] transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-white/[0.12] text-slate-300 hover:bg-white/[0.1] transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="px-3 py-2.5 rounded-xl border border-white/[0.12] text-slate-300 hover:bg-white/[0.1] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                {userType === "customer" && (
                  <button
                    className="px-3 py-2.5 rounded-xl border border-white/[0.12] text-slate-300 hover:bg-white/[0.1] transition-colors"
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
