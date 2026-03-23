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
    <div className="pointer-events-none absolute inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-[560] flex justify-center sm:inset-x-4 sm:bottom-[max(env(safe-area-inset-bottom),1rem)]">
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[760px] overflow-hidden p-3.5 sm:p-5",
          theme.panelStrongClassName
        )}
      >
        <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-70" />

        <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-2 text-center sm:gap-3 sm:pb-4">
          <div>
            <div
              className={cn(
                "text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.04em]",
                theme.titleClassName
              )}
            >
              {arrivalLabel || "--"}
            </div>
            <div className={cn("text-xs font-medium sm:text-sm", theme.secondaryTextClassName)}>
              arrival
            </div>
          </div>
          <div>
            <div
              className={cn(
                "text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.04em]",
                theme.titleClassName
              )}
            >
              {durationLabel ? durationLabel.replace(" min", "") : "--"}
            </div>
            <div className={cn("text-xs font-medium sm:text-sm", theme.secondaryTextClassName)}>
              min
            </div>
          </div>
          <div>
            <div
              className={cn(
                "text-2xl font-semibold tracking-[-0.03em] sm:text-4xl sm:tracking-[-0.04em]",
                theme.titleClassName
              )}
            >
              {distanceLabel ? distanceLabel.replace(" mi", "") : "--"}
            </div>
            <div className={cn("text-xs font-medium sm:text-sm", theme.secondaryTextClassName)}>
              {distanceLabel?.includes("ft") ? "ft" : "mi"}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-2 hidden items-center justify-between gap-3 rounded-[1.8rem] border border-white/16 px-4 py-4 sm:mt-4 sm:flex",
            tone === "light"
              ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(241,245,249,0.56))]"
              : "bg-[linear-gradient(180deg,rgba(15,23,42,0.66),rgba(30,41,59,0.5))]"
          )}
        >
          <div className="min-w-0">
            <div
              className={cn(
                "truncate text-2xl font-semibold tracking-[-0.03em]",
                theme.titleClassName
              )}
            >
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

        <div className="mt-2 flex gap-2 sm:mt-4 sm:grid sm:grid-cols-2 sm:gap-3">
          <button type="button" onClick={onShareEta} className={theme.secondaryButtonClassName}>
            <Share2 className="h-4 w-4" />
            Share ETA
          </button>
          <button
            type="button"
            onClick={onOpenDirections}
            className={theme.secondaryButtonClassName}
          >
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
          className={cn(
            theme.destructiveButtonClassName,
            "mt-2 w-full py-2.5 text-sm sm:mt-4 sm:py-4 sm:text-base"
          )}
        >
          End Route
        </button>
      </div>
    </div>
  );
}
