import { ChevronRight, Clock3, Compass, MapPin, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

export interface ShopDirectoryResultCardProps {
  shop: ShopMapListing;
  isSelected: boolean;
  compact: boolean;
  primaryColor: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  directionsActionLabel: string;
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
  onPrimaryAction,
  onSecondaryAction,
  onDirectionsAction,
}: ShopDirectoryResultCardProps) {
  return (
    <article
      className={`overflow-hidden bd-glass-card transition-all ${
        isSelected
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-slate-300"
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
                <h3 className="text-lg font-semibold text-slate-950">{shop.name}</h3>
                {shop.topPick && (
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    Best fit
                  </span>
                )}
                {isSelected && (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400" fill="#fbbf24" />
                  <span className="font-semibold text-slate-900">{shop.rating}</span>
                  <span>({shop.reviews})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {shop.mapDistanceLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {shop.responseTimeLabel}
                </span>
              </div>
            </div>

            <div className="grid min-w-[150px] grid-cols-2 gap-2">
              <div className="rounded-2xl bg-slate-950 px-3 py-2 text-white">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">AI Fit</p>
                <p className="text-lg font-semibold">{shop.recommendationScore}%</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-900">
                <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700/80">
                  Carrier
                </p>
                <p className="text-lg font-semibold">{shop.insuranceCompatibilityScore}%</p>
              </div>
            </div>
          </div>

          {!compact && <p className="text-sm leading-6 text-slate-600">{shop.aiSummary}</p>}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Completion</p>
              <p className="font-semibold text-slate-900">{shop.completionRate}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Avg ticket</p>
              <p className="font-semibold text-slate-900">{shop.averagePriceLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {shop.matchReasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
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
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
                >
                  {certification}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="flex-1 bd-glass-control text-slate-800 font-medium text-sm px-4 py-3"
              onClick={onPrimaryAction}
              type="button"
            >
              {primaryActionLabel}
            </button>
            <button
              className="flex-1 bd-glass-control text-white font-medium text-sm px-4 py-3"
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
              className="flex-1 bd-glass-control text-slate-800 font-medium text-sm px-4 py-3"
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
