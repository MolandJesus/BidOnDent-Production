import { Heart, MapPin, Phone, Send, Shield, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

type LikedShopCardProps = {
  shop: ShopMapListing;
  isLight: boolean;
  primaryColor: string;
  focused: boolean;
  onUnlike: (shopId: number) => void;
  onRequestEstimate: (shop: ShopMapListing) => void;
  onOpenMap?: () => void;
};

export default function LikedShopCard({
  shop,
  isLight,
  primaryColor,
  focused,
  onUnlike,
  onRequestEstimate,
  onOpenMap,
}: LikedShopCardProps) {
  return (
    <article
      className={`overflow-hidden rounded-[28px] transition-shadow ${
        focused ? "ring-2 ring-blue-400/60 shadow-lg" : ""
      } ${isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.80),rgba(232,238,248,0.74))] border border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_8px_22px_rgba(15,23,42,0.10)]" : "bd-glass-card"}`}
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:p-5">
        <div
          className={`h-36 w-full overflow-hidden rounded-[22px] md:h-auto md:w-44 md:flex-shrink-0 ${isLight ? "bg-slate-100/80" : "bg-white/[0.08]"}`}
        >
          <ImageWithFallback
            src={shop.image}
            alt={shop.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                >
                  {shop.name}
                </h3>
                {shop.topPick && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${isLight ? "border-blue-400/40 bg-blue-100 text-blue-700" : "border-blue-400/30 bg-blue-400/15 text-blue-200"}`}
                  >
                    Top fit
                  </span>
                )}
              </div>
              <div
                className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${isLight ? "text-slate-500" : "text-slate-300/70"}`}
              >
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                  <span
                    className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    {shop.rating}
                  </span>
                  <span>({shop.reviews})</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin
                    className={`h-4 w-4 ${isLight ? "text-blue-500/60" : "text-blue-200/50"}`}
                  />
                  {shop.mapDistanceLabel}
                </span>
                {shop.insuranceCompatibilityScore > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Shield
                      className={`h-4 w-4 ${isLight ? "text-blue-500/60" : "text-blue-200/50"}`}
                    />
                    {shop.insuranceCompatibilityScore}% carrier fit
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onUnlike(shop.id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
                isLight
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              <Heart className="h-4 w-4" fill="currentColor" />
              Remove
            </button>
          </div>

          <p
            className={`mt-3 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
          >
            {shop.aiSummary}
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div
              className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
              >
                AI Fit
              </p>
              <p
                className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                {shop.recommendationScore}%
              </p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
              >
                Avg ticket
              </p>
              <p
                className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                {shop.averagePriceLabel}
              </p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-2 ${isLight ? "border-blue-200 bg-blue-50" : "border-white/[0.06] bg-white/[0.05]"}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.16em] ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}
              >
                Response
              </p>
              <p
                className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                {shop.responseTimeLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {shop.specialties.slice(0, 4).map((specialty) => (
              <span
                key={specialty}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"}`}
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {shop.insurerPrograms.slice(0, 3).map((program) => (
              <span
                key={program}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-400/15 text-emerald-300"
                }`}
              >
                {program}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
              onClick={() => onRequestEstimate(shop)}
            >
              <Send className="h-4 w-4" />
              Request Estimate
            </button>
            <button
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isLight
                  ? "border border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]"
                  : "bd-glass-control--utility"
              }`}
              onClick={onOpenMap}
            >
              Review In Map
            </button>
            {shop.mapResult?.phone && (
              <a
                href={`tel:${shop.mapResult.phone}`}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  isLight
                    ? "border border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]"
                    : "bd-glass-control--utility"
                }`}
              >
                <Phone className="h-4 w-4" />
                Contact Shop
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
