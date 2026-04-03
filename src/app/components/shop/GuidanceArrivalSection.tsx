import { CheckCircle2, Info, Phone, Send, Square } from "lucide-react";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { RouteOption } from "../../types/mapDomain";
import { formatActiveDuration, formatEtaComparison } from "./shopDirectoryGuidanceUtils";

/* ── Arrival celebration + trip stats ───────────────────────────────── */

type GuidanceArrivalCelebrationProps = {
  shopName: string;
  selectedRoute: RouteOption;
  sessionActiveSeconds: number;
  isDark: boolean;
};

export function GuidanceArrivalCelebration({
  shopName,
  selectedRoute,
  sessionActiveSeconds,
  isDark,
}: GuidanceArrivalCelebrationProps) {
  const glassChip = isDark
    ? "border-blue-400/30 bg-slate-950/75 text-white backdrop-blur-md hover:bg-slate-950/85 shadow-[0_0_16px_rgba(59,130,246,0.06)]"
    : "border-black/8 bg-white/85 text-slate-700 backdrop-blur-md hover:bg-white/95";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-black/8";

  return (
    <div
      className={`mt-2 animate-[arrival-scale-in_0.5s_ease-out] rounded-xl border px-3 py-2.5 ${
        isDark ? "border-emerald-400/25 bg-emerald-400/10" : "border-emerald-200 bg-emerald-50"
      }`}
      style={{ animation: "arrival-scale-in 0.5s ease-out" }}
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle2
          className={`mt-0.5 h-5 w-5 shrink-0 ${isDark ? "text-emerald-300" : "text-emerald-600"}`}
        />
        <div>
          <p
            className={`text-sm font-bold leading-5 ${isDark ? "text-emerald-100" : "text-emerald-800"}`}
          >
            You've arrived!
          </p>
          <p
            className={`text-xs leading-5 ${isDark ? "text-emerald-200/70" : "text-emerald-700/80"}`}
          >
            {shopName}
          </p>
        </div>
      </div>
      <div className={`mt-2.5 grid grid-cols-3 gap-1.5 border-t pt-2.5 ${divider}`}>
        <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
          <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>Duration</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatActiveDuration(sessionActiveSeconds)}
          </p>
        </div>
        <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
          <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>Distance</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
            {selectedRoute.totalDistanceLabel}
          </p>
        </div>
        <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
          <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>vs ETA</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
            {formatEtaComparison(sessionActiveSeconds, selectedRoute.estimatedDurationMinutes)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Post-arrival action buttons ────────────────────────────────────── */

type GuidanceArrivalActionsProps = {
  selectedShop: ShopMapListing;
  isDark: boolean;
  isCompactDensity: boolean;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onEndNavigation?: () => void;
};

export function GuidanceArrivalActions({
  selectedShop,
  isDark,
  isCompactDensity,
  onViewDetails,
  onRequestEstimate,
  onEndNavigation,
}: GuidanceArrivalActionsProps) {
  const divider = isDark ? "border-white/10" : "border-black/8";
  const btnSize = isCompactDensity
    ? "min-h-[38px] px-3 py-2 text-xs"
    : "min-h-[44px] px-4 py-2.5 text-sm";

  return (
    <div className={`mt-3 border-t pt-3 ${divider}`}>
      <div className="grid grid-cols-2 gap-2">
        {selectedShop.mapResult?.phone ? (
          <a
            className={`flex items-center justify-center gap-2 rounded-[1rem] bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 ${btnSize}`}
            href={`tel:${selectedShop.mapResult.phone}`}
          >
            <Phone className="h-4 w-4" />
            Call Shop
          </a>
        ) : null}
        {onViewDetails ? (
          <button
            className={`flex items-center justify-center gap-2 rounded-[1rem] bg-blue-600/80 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 ${btnSize}`}
            onClick={() => onViewDetails(selectedShop)}
            type="button"
          >
            <Info className="h-4 w-4" />
            View Details
          </button>
        ) : null}
        {onRequestEstimate ? (
          <button
            className={`flex items-center justify-center gap-2 rounded-[1rem] bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 ${btnSize}`}
            onClick={() => onRequestEstimate(selectedShop)}
            type="button"
          >
            <Send className="h-4 w-4" />
            Request Estimate
          </button>
        ) : null}
        <button
          className={`col-span-2 flex items-center justify-center gap-2 rounded-[1rem] bg-emerald-600 font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 ${btnSize}`}
          onClick={onEndNavigation}
          type="button"
        >
          <Square className="h-4 w-4" />
          Done
        </button>
      </div>
    </div>
  );
}
