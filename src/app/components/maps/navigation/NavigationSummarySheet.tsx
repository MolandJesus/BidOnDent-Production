import { ExternalLink, Phone, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../../ui/utils";
import {
  getNavigationProviderLabel,
  navigationProviderOptions,
  type NavigationProvider,
} from "../../../services/navigation/externalNavigation";
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
  preferredNavigationProvider: NavigationProvider;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
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
  preferredNavigationProvider,
  onPreferredNavigationProviderChange,
  onShareEta,
  onOpenDirections,
  onEndRoute,
}: NavigationSummarySheetProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const theme = getMapSurfaceTheme(tone, true);
  const arrivalLabel = formatArrivalTimeFromNow(remainingDurationSeconds);
  const durationLabel = formatDurationMinutes(remainingDurationSeconds);
  const distanceLabel = formatTurnDistance(remainingDistanceMeters);
  const exportProviderLabel = getNavigationProviderLabel(preferredNavigationProvider);

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-[560] flex justify-center sm:inset-x-4 sm:bottom-[max(env(safe-area-inset-bottom),1rem)]">
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[720px] overflow-hidden p-2.5 sm:p-3.5",
          theme.panelStrongClassName
        )}
      >
        <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-70" />

        {/* ── Compact metric bar ─────────────────────────────────── */}
        <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2 sm:pb-2.5">
          <div className="flex items-baseline gap-4 sm:gap-6">
            <div className="text-center">
              <span
                className={cn(
                  "text-xl font-semibold tracking-[-0.02em] sm:text-2xl",
                  theme.titleClassName
                )}
              >
                {arrivalLabel || "--"}
              </span>
              <span
                className={cn(
                  "ml-1 text-[10px] font-medium sm:text-xs",
                  theme.secondaryTextClassName
                )}
              >
                arrival
              </span>
            </div>
            <div className="text-center">
              <span
                className={cn(
                  "text-xl font-semibold tracking-[-0.02em] sm:text-2xl",
                  theme.titleClassName
                )}
              >
                {durationLabel ? durationLabel.replace(" min", "") : "--"}
              </span>
              <span
                className={cn(
                  "ml-1 text-[10px] font-medium sm:text-xs",
                  theme.secondaryTextClassName
                )}
              >
                min
              </span>
            </div>
            <div className="text-center">
              <span
                className={cn(
                  "text-xl font-semibold tracking-[-0.02em] sm:text-2xl",
                  theme.titleClassName
                )}
              >
                {distanceLabel ? distanceLabel.replace(" mi", "") : "--"}
              </span>
              <span
                className={cn(
                  "ml-1 text-[10px] font-medium sm:text-xs",
                  theme.secondaryTextClassName
                )}
              >
                {distanceLabel?.includes("ft") ? "ft" : "mi"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Destination row ────────────────────────────────────── */}
        <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2">
          <div className="min-w-0">
            <div
              className={cn(
                "truncate text-sm font-semibold leading-snug sm:text-base",
                theme.titleClassName
              )}
            >
              {selectedShop.name}
            </div>
            <div className={cn("truncate text-[11px] sm:text-xs", theme.secondaryTextClassName)}>
              {selectedShop.addressLine || selectedShop.countyLabel}
            </div>
          </div>
          {selectedShop.phoneNumber ? (
            <a
              href={`tel:${selectedShop.phoneNumber}`}
              className={cn(theme.iconButtonClassName, "shrink-0")}
            >
              <Phone className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {/* ── Action row: Share · Export · End ────────────────────── */}
        <div className="mt-2 flex items-center gap-2 sm:mt-2.5">
          <button
            type="button"
            onClick={onShareEta}
            className={cn(theme.secondaryButtonClassName, "flex-1 py-2 text-xs sm:text-sm")}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share ETA
          </button>
          <button
            type="button"
            onClick={() => {
              if (showExportOptions) {
                onOpenDirections();
              } else {
                setShowExportOptions(true);
              }
            }}
            className={cn(theme.secondaryButtonClassName, "flex-1 py-2 text-xs sm:text-sm")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {showExportOptions ? `Export to ${exportProviderLabel}` : "Export"}
          </button>
          <button
            type="button"
            onClick={onEndRoute}
            className={cn(theme.destructiveButtonClassName, "flex-1 py-2 text-xs sm:text-sm")}
          >
            End Route
          </button>
        </div>

        {/* ── Export provider picker (expandable) ────────────────── */}
        {showExportOptions ? (
          <div className="mt-2">
            <div className={theme.segmentedClassName}>
              {navigationProviderOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPreferredNavigationProviderChange(option.id)}
                  className={cn(
                    "flex min-h-[44px] flex-1 items-center justify-center rounded-full px-2 py-1.5 text-xs font-semibold transition-all duration-200 sm:text-sm",
                    preferredNavigationProvider === option.id
                      ? theme.activeSegmentClassName
                      : theme.inactiveSegmentClassName
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {shareFeedback ? (
          <div className={cn("mt-2 text-center text-xs", theme.secondaryTextClassName)}>
            {shareFeedback}
          </div>
        ) : null}
      </div>
    </div>
  );
}
