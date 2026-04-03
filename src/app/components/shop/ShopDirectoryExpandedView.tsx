import { ChevronRight, Clock3, Compass, MapPin, Send, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

interface ShopDirectoryExpandedViewProps {
  shop: ShopMapListing;
  isSelected: boolean;
  isLight: boolean;
  primaryColor: string;
  routeStatusLabel: string | null;
  routeStatusClass: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  directionsActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onDirectionsAction: () => void;
  onRequestEstimate?: () => void;
}

export default function ShopDirectoryExpandedView({
  shop,
  isSelected,
  isLight,
  primaryColor,
  routeStatusLabel,
  routeStatusClass,
  primaryActionLabel,
  secondaryActionLabel,
  directionsActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  onDirectionsAction,
  onRequestEstimate,
}: ShopDirectoryExpandedViewProps) {
  return (
    <div className="flex flex-col">
      <div className="h-44 w-full overflow-hidden">
        <ImageWithFallback
          alt={shop.name}
          className="h-full w-full object-cover"
          src={shop.image}
        />
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
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
              {routeStatusLabel ? (
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${routeStatusClass}`}
                >
                  {routeStatusLabel}
                </span>
              ) : null}
            </div>

            {shop.mapResult.city ? (
              <p
                className={`mt-1 truncate text-sm ${
                  isLight ? "text-slate-400" : "text-slate-400/70"
                }`}
              >
                {[shop.mapResult.city, shop.mapResult.state].filter(Boolean).join(", ")}
              </p>
            ) : null}

            <div
              className={`mt-2 flex flex-wrap items-center gap-3 text-sm ${
                isLight ? "text-slate-500" : "text-slate-300/70"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
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

          <div className="grid min-w-[140px] grid-cols-2 gap-2">
            <div className="bd-dashboard-section bd-dashboard-section--accent-blue rounded-2xl px-3 py-2">
              <p
                className={`text-[11px] uppercase tracking-[0.16em] ${
                  isLight ? "text-blue-600/70" : "text-blue-200/60"
                }`}
              >
                AI Fit
              </p>
              <p
                className={`text-lg font-semibold ${isLight ? "text-blue-800" : "text-slate-100"}`}
              >
                {shop.recommendationScore}%
              </p>
            </div>
            {shop.insuranceCompatibilityScore > 0 && (
              <div className="bd-dashboard-section bd-dashboard-section--accent-cyan rounded-2xl px-3 py-2">
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
            )}
          </div>
        </div>

        <div className="bd-dashboard-note bd-dashboard-note--deep rounded-2xl px-3.5 py-3">
          <p className={`text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
            {shop.aiSummary}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bd-dashboard-section bd-dashboard-section--deep rounded-2xl px-3 py-2">
            <p className={isLight ? "text-slate-500" : "text-blue-200/50"}>Completion</p>
            <p className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {Math.round(shop.completionRate)}%
            </p>
          </div>
          <div className="bd-dashboard-section bd-dashboard-section--accent-indigo rounded-2xl px-3 py-2">
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

        <div className="flex flex-col gap-2">
          <button
            className="bd-dashboard-primary-button min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-medium text-white"
            onClick={onSecondaryAction}
            style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, #147dd6 100%)` }}
            type="button"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {secondaryActionLabel}
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
          {onRequestEstimate && (
            <button
              className={`bd-dashboard-secondary-button min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isLight
                  ? "border-blue-200/70 bg-blue-50/90 text-blue-700 hover:bg-blue-100"
                  : "border-blue-400/22 bg-blue-600/18 text-blue-200 hover:bg-blue-600/28"
              }`}
              onClick={onRequestEstimate}
              type="button"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Send className="h-4 w-4" />
                Request Estimate
              </span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`bd-dashboard-secondary-button min-h-[44px] rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                isLight ? "text-slate-700 hover:bg-slate-50" : "text-slate-100"
              }`}
              onClick={onPrimaryAction}
              type="button"
            >
              {primaryActionLabel}
            </button>
            <button
              className={`bd-dashboard-secondary-button min-h-[44px] rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                isLight ? "text-slate-700 hover:bg-slate-50" : "text-slate-100"
              }`}
              onClick={onDirectionsAction}
              type="button"
              aria-label={`${directionsActionLabel} to ${shop.name}`}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Compass className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{directionsActionLabel}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
