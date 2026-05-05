/**
 * ShopDetailSheet — Mobile-first bottom sheet showing full shop details.
 *
 * Opens when user taps "View Details" in the map popup or route card.
 * Shows everything the popup can't fit: specialties, certifications,
 * match reasons, AI summary, category ratings, response time, pricing.
 */
import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "motion/react";
import {
  Award,
  Clock,
  Compass,
  DollarSign,
  Heart,
  MapPin,
  Send,
  Shield,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  Wrench,
  X,
} from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import {
  type ShopDetailSheetProps,
  RatingBar,
  Badge,
  buildSheetTheme,
} from "./shopDetailSheetParts";

export type { ShopDetailSheetProps };

export default function ShopDetailSheet({
  shop,
  onClose,
  onGetDirections,
  onRequestEstimate,
  isSaved = false,
  onToggleSave,
  isDark = true,
}: ShopDetailSheetProps) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll on shop change
  useEffect(() => {
    if (shop && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [shop?.id]);

  // Close on Escape
  useEffect(() => {
    if (!shop) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [shop, onClose]);

  // Drag-to-dismiss: close if swiped down > 100px
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) onClose();
    },
    [onClose]
  );

  const { bg, cardBg, mutedText, accentText, ctaPrimary, ctaSecondary } = buildSheetTheme(isDark);

  return (
    <AnimatePresence>
      {shop && (
        <>
          {/* Backdrop */}
          <motion.div
            key="shop-detail-backdrop"
            className="fixed inset-0 z-[700] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="shop-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-detail-title"
            className={`fixed inset-x-0 bottom-0 z-[701] flex max-h-[88dvh] flex-col rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl ${bg}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            {/* ── Drag handle + header ── */}
            <div className="flex shrink-0 cursor-grab items-center justify-between border-b border-inherit px-4 pb-3 pt-3 active:cursor-grabbing">
              <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-current opacity-30 transition-opacity hover:opacity-50" />
            </div>
            <div className="flex shrink-0 items-start gap-3 px-4 pb-3 pt-2">
              {shop.image ? (
                <ImageWithFallback
                  src={shop.image}
                  alt={shop.name}
                  className="h-14 w-14 shrink-0 rounded-xl border border-inherit object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-inherit bg-blue-600/20">
                  <Wrench className="h-6 w-6 text-blue-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 id="shop-detail-title" className="text-lg font-bold leading-tight">
                  {shop.name}
                </h2>
                <p className={`mt-0.5 flex items-center gap-1 text-sm ${mutedText}`}>
                  <MapPin className="h-3 w-3 shrink-0" />
                  {shop.mapResult.address}, {shop.mapResult.city}
                </p>
                {shop.rating > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    {shop.reviews > 0 && (
                      <span className={mutedText}>({shop.reviews} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
                aria-label="Close shop details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Scrollable content ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24">
              {/* Top badges */}
              <div className="flex flex-wrap gap-1.5 pb-4">
                {shop.topPick && (
                  <Badge
                    className={
                      isDark
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                        : "border-amber-300 bg-amber-50 text-amber-700"
                    }
                  >
                    <ThumbsUp className="h-3 w-3" /> Top Pick
                  </Badge>
                )}
                <Badge
                  className={
                    isDark
                      ? "border-blue-400/30 bg-blue-400/10 text-blue-200"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }
                >
                  <Sparkles className="h-3 w-3" /> {shop.recommendationScore}% AI fit
                </Badge>
                {shop.insuranceCompatibilityScore > 0 && (
                  <Badge
                    className={
                      isDark
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }
                  >
                    <Shield className="h-3 w-3" /> {shop.insuranceCompatibilityScore}% Carrier fit
                  </Badge>
                )}
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-2 pb-4">
                <div className={`rounded-xl border px-3 py-2 text-center ${cardBg}`}>
                  <Clock className={`mx-auto mb-1 h-4 w-4 ${accentText}`} />
                  <p className="text-xs font-semibold">{shop.responseTimeLabel}</p>
                  <p className={`text-[10px] ${mutedText}`}>Response</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-center ${cardBg}`}>
                  <DollarSign className={`mx-auto mb-1 h-4 w-4 ${accentText}`} />
                  <p className="text-xs font-semibold">{shop.averagePriceLabel}</p>
                  <p className={`text-[10px] ${mutedText}`}>Avg Price</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-center ${cardBg}`}>
                  <Award className={`mx-auto mb-1 h-4 w-4 ${accentText}`} />
                  <p className="text-xs font-semibold">{Math.round(shop.completionRate)}%</p>
                  <p className={`text-[10px] ${mutedText}`}>Completion</p>
                </div>
              </div>

              {/* AI Summary */}
              {shop.aiSummary && (
                <div className={`mb-4 rounded-xl border px-3 py-2.5 ${cardBg}`}>
                  <p
                    className={`mb-1 flex items-center gap-1.5 text-xs font-semibold ${accentText}`}
                  >
                    <Sparkles className="h-3 w-3" /> AI Summary
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {shop.aiSummary}
                  </p>
                </div>
              )}

              {/* Match reasons */}
              {shop.matchReasons.length > 0 && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Why this shop matches
                  </p>
                  <ul className="space-y-1.5">
                    {shop.matchReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ThumbsUp className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accentText}`} />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category ratings */}
              {shop.categoryRatings && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Ratings Breakdown
                  </p>
                  <div className={`rounded-xl border p-3 ${cardBg}`}>
                    <div className="space-y-2">
                      <RatingBar
                        label="Quality"
                        value={shop.categoryRatings.quality}
                        isDark={isDark}
                      />
                      <RatingBar
                        label="Service"
                        value={shop.categoryRatings.service}
                        isDark={isDark}
                      />
                      <RatingBar
                        label="Timeliness"
                        value={shop.categoryRatings.timeliness}
                        isDark={isDark}
                      />
                      <RatingBar label="Value" value={shop.categoryRatings.value} isDark={isDark} />
                    </div>
                  </div>
                </div>
              )}

              {/* Specialties */}
              {shop.specialties.length > 0 && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Specialties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.specialties.map((s) => (
                      <Badge
                        key={s}
                        className={
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-slate-300"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        <Wrench className="h-3 w-3" /> {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {shop.certifications.length > 0 && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.certifications.map((c) => (
                      <Badge
                        key={c}
                        className={
                          isDark
                            ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-200"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }
                      >
                        <Award className="h-3 w-3" /> {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Insurer programs */}
              {shop.insurerPrograms.length > 0 && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Insurance Programs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.insurerPrograms.map((p) => (
                      <Badge
                        key={p}
                        className={
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-slate-300"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        <Shield className="h-3 w-3" /> {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Supported vehicle makes */}
              {shop.supportedMakes.length > 0 && (
                <div className="mb-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Supported Makes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.supportedMakes.map((m) => (
                      <Badge
                        key={m}
                        className={
                          isDark
                            ? "border-white/10 bg-white/[0.04] text-slate-300"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        <Tag className="h-3 w-3" /> {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Capacity + service area */}
              <div className={`mb-4 grid grid-cols-2 gap-2`}>
                <div className={`rounded-xl border px-3 py-2 ${cardBg}`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Capacity</p>
                  <p className="text-sm font-semibold capitalize">{shop.capacityBand}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 ${cardBg}`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                    Service Area
                  </p>
                  <p className="text-sm font-semibold">{shop.serviceArea || "Local"}</p>
                </div>
              </div>

              {/* Distance */}
              <div className={`rounded-xl border px-3 py-2.5 ${cardBg}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={mutedText}>Distance from you</span>
                  <span className="font-semibold">{shop.mapDistanceLabel}</span>
                </div>
              </div>
            </div>

            {/* ── Fixed bottom CTA bar ── */}
            <div
              className={`shrink-0 border-t border-inherit px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl ${isDark ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(8,16,33,0.90))] shadow-[inset_0_1px_0_rgba(196,144,65,0.18)]" : "bg-[linear-gradient(180deg,rgba(232,238,248,0.86),rgba(247,232,194,0.82))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]"}`}
            >
              <div className="flex gap-2">
                {onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(shop)}
                    className={`flex min-h-[48px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${
                      isSaved
                        ? "bg-rose-500/20 text-rose-400"
                        : isDark
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    aria-label={isSaved ? "Unsave shop" : "Save shop"}
                  >
                    <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                )}
                {onRequestEstimate && (
                  <button
                    type="button"
                    onClick={() => {
                      onRequestEstimate(shop);
                      onClose();
                    }}
                    className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${ctaPrimary}`}
                  >
                    <Send className="h-4 w-4" />
                    Request Estimate
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onGetDirections) onGetDirections(shop);
                    onClose();
                  }}
                  className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${onRequestEstimate ? ctaSecondary : ctaPrimary}`}
                >
                  <Compass className="h-4 w-4" />
                  Get Directions
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
