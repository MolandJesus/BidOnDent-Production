import { ChevronRight, Clock3, Compass, MapPin, Send, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import ShopDirectoryExpandedView from "./ShopDirectoryExpandedView";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export interface ShopDirectoryResultCardProps {
  shop: ShopMapListing;
  isSelected: boolean;
  compact: boolean;
  primaryColor: string;
  routeStatusLabel?: string | null;
  routeStatusTone?: "live" | "paused" | "arrived";
  primaryActionLabel: string;
  secondaryActionLabel: string;
  directionsActionLabel: string;
  appearanceMode?: DashboardAppearanceMode;
  onCardClick?: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onDirectionsAction: () => void;
  onRequestEstimate?: () => void;
}

export default function ShopDirectoryResultCard({
  shop,
  isSelected,
  compact,
  primaryColor,
  routeStatusLabel = null,
  routeStatusTone = "live",
  primaryActionLabel,
  secondaryActionLabel,
  directionsActionLabel,
  appearanceMode = "map-dark",
  onCardClick,
  onPrimaryAction,
  onSecondaryAction,
  onDirectionsAction,
  onRequestEstimate,
}: ShopDirectoryResultCardProps) {
  const isLight = appearanceMode === "light";
  const visibleMatchReasons = compact ? shop.matchReasons.slice(0, 1) : shop.matchReasons;
  const shellToneClass = isSelected
    ? "bd-dashboard-section bd-dashboard-section--accent-blue border-blue-300/40 ring-1 ring-blue-300/20"
    : shop.topPick
      ? "bd-dashboard-section bd-dashboard-section--accent-cyan bd-dashboard-section--interactive"
      : "bd-dashboard-section bd-dashboard-section--deep bd-dashboard-section--interactive";
  const routeStatusClass =
    routeStatusTone === "arrived"
      ? isLight
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-emerald-400/30 bg-emerald-400/14 text-emerald-200"
      : routeStatusTone === "paused"
        ? isLight
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-amber-400/30 bg-amber-400/14 text-amber-200"
        : isLight
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-blue-400/30 bg-blue-400/14 text-blue-200";
  return (
    <article
      className={`overflow-hidden transition-all ${onCardClick ? "cursor-pointer" : ""} ${shellToneClass}`}
      onClick={(e) => {
        if (onCardClick && !(e.target as HTMLElement).closest("button")) {
          onCardClick();
        }
      }}
    >
      {compact ? (
        <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
            <ImageWithFallback
              alt={shop.name}
              className="h-full w-full object-cover"
              src={shop.image}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3
                  className={`text-base font-semibold ${
                    isLight ? "text-slate-900" : "text-slate-100"
                  }`}
                >
                  {shop.name}
                </h3>
                {shop.topPick && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
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
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"
                    }`}
                  >
                    Selected
                  </span>
                )}
                {routeStatusLabel ? (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${routeStatusClass}`}
                  >
                    {routeStatusLabel}
                  </span>
                ) : null}
              </div>

              {shop.mapResult.city ? (
                <p
                  className={`mt-0.5 truncate text-xs ${
                    isLight ? "text-slate-400" : "text-slate-400/70"
                  }`}
                >
                  {[shop.mapResult.city, shop.mapResult.state].filter(Boolean).join(", ")}
                </p>
              ) : null}

              <div
                className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                  isLight ? "text-slate-500" : "text-slate-300/70"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400" fill="#fbbf24" />
                  <span
                    className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    {shop.rating}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin
                    className={`h-3.5 w-3.5 ${isLight ? "text-blue-400" : "text-blue-200/50"}`}
                  />
                  {shop.mapDistanceLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3
                    className={`h-3.5 w-3.5 ${isLight ? "text-blue-400" : "text-blue-200/50"}`}
                  />
                  {shop.responseTimeLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              <span
                className={`rounded-full border px-2.5 py-1 font-semibold ${
                  isLight
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-blue-400/30 bg-blue-500/20 text-slate-100"
                }`}
              >
                AI {shop.recommendationScore}%
              </span>
              {shop.insuranceCompatibilityScore > 0 && (
                <span
                  className={`rounded-full border px-2.5 py-1 font-semibold ${
                    isLight
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  }`}
                >
                  Carrier {shop.insuranceCompatibilityScore}%
                </span>
              )}
              <span
                className={`rounded-full border px-2.5 py-1 ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : "border-white/[0.08] bg-white/[0.05] text-slate-300"
                }`}
              >
                {shop.averagePriceLabel}
              </span>
            </div>

            {visibleMatchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {visibleMatchReasons.map((reason) => (
                  <span
                    key={reason}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      isLight ? "bg-blue-100 text-blue-700" : "bg-blue-400/15 text-blue-200"
                    }`}
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <button
                className="bd-dashboard-primary-button min-h-[44px] w-full rounded-lg px-3 py-2 text-xs font-semibold text-white"
                onClick={onDirectionsAction}
                style={{ background: `linear-gradient(90deg, ${primaryColor} 0%, #147dd6 100%)` }}
                type="button"
                aria-label={`${directionsActionLabel} to ${shop.name}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  {directionsActionLabel}
                </span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  className={`bd-dashboard-secondary-button min-h-[44px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isLight ? "text-slate-700 hover:bg-slate-50" : "text-slate-100"
                  }`}
                  onClick={onSecondaryAction}
                  type="button"
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    {secondaryActionLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </button>
                {onRequestEstimate ? (
                  <button
                    className={`bd-dashboard-secondary-button min-h-[44px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isLight
                        ? "border-blue-200/70 bg-blue-50/90 text-blue-700 hover:bg-blue-100"
                        : "border-blue-400/22 bg-blue-600/18 text-blue-200 hover:bg-blue-600/26"
                    }`}
                    onClick={onRequestEstimate}
                    type="button"
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      <Send className="h-3 w-3" />
                      Estimate
                    </span>
                  </button>
                ) : (
                  <button
                    className={`bd-dashboard-secondary-button min-h-[44px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isLight ? "text-slate-700 hover:bg-slate-50" : "text-slate-100"
                    }`}
                    onClick={onPrimaryAction}
                    type="button"
                  >
                    {primaryActionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ShopDirectoryExpandedView
          shop={shop}
          isSelected={isSelected}
          isLight={isLight}
          primaryColor={primaryColor}
          routeStatusLabel={routeStatusLabel}
          routeStatusClass={routeStatusClass}
          primaryActionLabel={primaryActionLabel}
          secondaryActionLabel={secondaryActionLabel}
          directionsActionLabel={directionsActionLabel}
          onPrimaryAction={onPrimaryAction}
          onSecondaryAction={onSecondaryAction}
          onDirectionsAction={onDirectionsAction}
          onRequestEstimate={onRequestEstimate}
        />
      )}
    </article>
  );
}
