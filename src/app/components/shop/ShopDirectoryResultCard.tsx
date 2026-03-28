import { ChevronRight, Clock3, Compass, MapPin, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export interface ShopDirectoryResultCardProps {
  shop: ShopMapListing;
  isSelected: boolean;
  compact: boolean;
  primaryColor: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  directionsActionLabel: string;
  appearanceMode?: DashboardAppearanceMode;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onDirectionsAction: () => void;
}

export default function ShopDirectoryResultCard({
  shop,
  isSelected,
  compact,
  primaryColor,
  primaryActionLabel,
  secondaryActionLabel,
  directionsActionLabel,
  appearanceMode = "map-dark",
  onPrimaryAction,
  onSecondaryAction,
  onDirectionsAction,
}: ShopDirectoryResultCardProps) {
  const isLight = appearanceMode === "light";
  return (
    <article
      className={`overflow-hidden transition-all ${
        isLight
          ? isSelected
            ? "bg-white border border-blue-300 shadow-md rounded-2xl ring-2 ring-blue-200/60"
            : "bg-white/80 border border-slate-200/60 shadow-sm rounded-2xl hover:border-blue-200"
          : isSelected
            ? "bd-glass-card border-blue-400/60 ring-2 ring-blue-400/20"
            : "bd-glass-card border-white/[0.10] hover:border-white/[0.20]"
      }`}
    >
      <div className={`flex ${compact ? "gap-4 p-4" : "flex-col"}`}>
        <div
          className={
            compact
              ? "h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl"
              : "h-44 w-full overflow-hidden"
          }
        >
          <ImageWithFallback
            alt={shop.name}
            className="h-full w-full object-cover"
            src={shop.image}
          />
        </div>

        <div className={`${compact ? "min-w-0 flex-1" : "p-4 md:p-5"} space-y-3`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-lg font-semibold ${
                    isLight ? "text-slate-900" : "text-slate-100"
                  }`}
                >
                  {shop.name}
                </h3>
                {shop.topPick && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      isLight
                        ? "border-blue-200 bg-blue-100 text-blue-700"
                        : "border-blue-400/30 bg-blue-400/15 text-blue-200"
                    }`}
                  >
                    Best fit
                  </span>
                )}
                {isSelected && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"
                    }`}
                  >
                    Selected
                  </span>
                )}
              </div>

              <div
                className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${
                  isLight ? "text-slate-500" : "text-slate-300/70"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                  <span
                    className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    {shop.rating}
                  </span>
                  <span>({shop.reviews})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className={`h-4 w-4 ${isLight ? "text-blue-400" : "text-blue-200/50"}`} />
                  {shop.mapDistanceLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className={`h-4 w-4 ${isLight ? "text-blue-400" : "text-blue-200/50"}`} />
                  {shop.responseTimeLabel}
                </span>
              </div>
            </div>

            <div className="grid min-w-[150px] grid-cols-2 gap-2">
              <div
                className={`rounded-2xl border px-3 py-2 ${
                  isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-[0.16em] ${
                    isLight ? "text-blue-600/70" : "text-blue-200/60"
                  }`}
                >
                  AI Fit
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isLight ? "text-blue-800" : "text-slate-100"
                  }`}
                >
                  {shop.recommendationScore}%
                </p>
              </div>
              <div
                className={`rounded-2xl border px-3 py-2 ${
                  isLight
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-emerald-400/30 bg-emerald-400/10"
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-[0.16em] ${
                    isLight ? "text-emerald-600/80" : "text-emerald-300/80"
                  }`}
                >
                  Carrier
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isLight ? "text-emerald-700" : "text-emerald-200"
                  }`}
                >
                  {shop.insuranceCompatibilityScore}%
                </p>
              </div>
            </div>
          </div>

          {!compact && (
            <p className={`text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
              {shop.aiSummary}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div
              className={`rounded-2xl border px-3 py-2 ${
                isLight ? "border-slate-200/80 bg-slate-50" : "border-white/[0.06] bg-white/[0.05]"
              }`}
            >
              <p className={isLight ? "text-slate-500" : "text-blue-200/50"}>Completion</p>
              <p className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                {shop.completionRate}%
              </p>
            </div>
            <div
              className={`rounded-2xl border px-3 py-2 ${
                isLight ? "border-slate-200/80 bg-slate-50" : "border-white/[0.06] bg-white/[0.05]"
              }`}
            >
              <p className={isLight ? "text-slate-500" : "text-blue-200/50"}>Avg ticket</p>
              <p className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                {shop.averagePriceLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {shop.matchReasons.map((reason) => (
              <span
                key={reason}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"
                }`}
              >
                {reason}
              </span>
            ))}
          </div>

          {!compact && (
            <div className="flex flex-wrap gap-2">
              {shop.certifications.slice(0, 3).map((certification) => (
                <span
                  key={certification}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    isLight ? "bg-amber-100 text-amber-700" : "bg-amber-400/15 text-amber-300"
                  }`}
                >
                  {certification}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className={`flex-1 min-h-[44px] rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                  : "bd-glass-control text-slate-100"
              }`}
              onClick={onPrimaryAction}
              type="button"
            >
              {primaryActionLabel}
            </button>
            <button
              className="flex-1 min-h-[44px] rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg"
              onClick={onSecondaryAction}
              style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, #147dd6 100%)` }}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                {secondaryActionLabel}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <button
              className={`flex-1 min-h-[44px] rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                  : "bd-glass-control text-slate-100"
              }`}
              onClick={onDirectionsAction}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4" />
                {directionsActionLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
