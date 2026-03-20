import { ExternalLink, Phone, Share2 } from "lucide-react";
import { cn } from "../../ui/utils";
import {
  formatArrivalTimeFromNow,
  formatDurationMinutes,
  formatTurnDistance,
} from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { CoveragePartnerShop, MapSurfaceTone } from "../serviceCoverageMapTypes";

type NavigationSummarySheetProps = {
  tone: MapSurfaceTone;
  selectedShop: CoveragePartnerShop;
  remainingDurationSeconds: number;
  remainingDistanceMeters: number;
  shareFeedback: string;
  onShareEta: () => void;
  onOpenDirections: () => void;
  onEndRoute: () => void;
};

export default function NavigationSummarySheet({
  tone,
  selectedShop,
  remainingDurationSeconds,
  remainingDistanceMeters,
  shareFeedback,
  onShareEta,
  onOpenDirections,
  onEndRoute,
}: NavigationSummarySheetProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const arrivalLabel = formatArrivalTimeFromNow(remainingDurationSeconds);
  const durationLabel = formatDurationMinutes(remainingDurationSeconds);
  const distanceLabel = formatTurnDistance(remainingDistanceMeters);

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[560] flex justify-center">
      <div className={cn("pointer-events-auto w-full max-w-[760px] p-4 sm:p-5", theme.panelStrongClassName)}>
        <div className="grid grid-cols-3 gap-3 border-b border-white/10 pb-4 text-center">
          <div>
            <div className={cn("text-4xl font-semibold tracking-[-0.04em]", theme.titleClassName)}>
              {arrivalLabel || "--"}
            </div>
            <div className={cn("text-sm font-medium", theme.secondaryTextClassName)}>arrival</div>
          </div>
          <div>
            <div className={cn("text-4xl font-semibold tracking-[-0.04em]", theme.titleClassName)}>
              {durationLabel ? durationLabel.replace(" min", "") : "--"}
            </div>
            <div className={cn("text-sm font-medium", theme.secondaryTextClassName)}>min</div>
          </div>
          <div>
            <div className={cn("text-4xl font-semibold tracking-[-0.04em]", theme.titleClassName)}>
              {distanceLabel ? distanceLabel.replace(" mi", "") : "--"}
            </div>
            <div className={cn("text-sm font-medium", theme.secondaryTextClassName)}>
              {distanceLabel?.includes("ft") ? "ft" : "mi"}
            </div>
          </div>
        </div>

        <div className={cn("mt-4 flex items-center justify-between gap-3 rounded-[1.6rem] px-4 py-4", theme.panelClassName)}>
          <div className="min-w-0">
            <div className={cn("truncate text-2xl font-semibold tracking-[-0.03em]", theme.titleClassName)}>
              {selectedShop.name}
            </div>
            <div className={cn("mt-1 truncate text-sm", theme.secondaryTextClassName)}>
              {selectedShop.addressLine || selectedShop.countyLabel}
            </div>
          </div>
          {selectedShop.phoneNumber ? (
            <a href={`tel:${selectedShop.phoneNumber}`} className={theme.iconButtonClassName}>
              <Phone className="h-5 w-5" />
            </a>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onShareEta} className={theme.secondaryButtonClassName}>
            <Share2 className="h-4 w-4" />
            Share ETA
          </button>
          <button type="button" onClick={onOpenDirections} className={theme.secondaryButtonClassName}>
            <ExternalLink className="h-4 w-4" />
            Open external maps
          </button>
        </div>

        {shareFeedback ? (
          <div className={cn("mt-3 text-center text-xs", theme.secondaryTextClassName)}>
            {shareFeedback}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onEndRoute}
          className="mt-4 inline-flex w-full items-center justify-center rounded-[1.35rem] bg-rose-500 px-4 py-4 text-base font-semibold text-white shadow-[0_22px_40px_rgba(244,63,94,0.28)] transition hover:bg-rose-400"
        >
          End Route
        </button>
      </div>
    </div>
  );
}
