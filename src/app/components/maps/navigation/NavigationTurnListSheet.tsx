import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../ui/utils";
import { formatDurationMinutes, formatTurnDistance } from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationRouteStep } from "../../../types/navigation";

type NavigationTurnListSheetProps = {
  tone: MapSurfaceTone;
  open: boolean;
  steps: NavigationRouteStep[];
  currentStepIndex: number;
  onClose: () => void;
};

export default function NavigationTurnListSheet({
  tone,
  open,
  steps,
  currentStepIndex,
  onClose,
}: NavigationTurnListSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[9.75rem] z-[565] flex justify-center sm:inset-x-4 sm:top-24 sm:bottom-auto sm:justify-end">
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[420px] overflow-hidden p-4",
          theme.panelStrongClassName
        )}
      >
        <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-70" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={theme.eyebrowClassName}>Turn List</div>
            <div className={cn("mt-3 text-lg font-semibold", theme.titleClassName)}>
              Upcoming guidance
            </div>
          </div>
          <button type="button" onClick={onClose} className={theme.iconButtonClassName}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 max-h-[44vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[56vh]">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "map-liquid-card",
                index === currentStepIndex
                  ? theme.selectedListCardClassName
                  : theme.listCardClassName
              )}
            >
              <div className={theme.metricLabelClassName}>
                {index === currentStepIndex ? "Active step" : `Step ${index + 1}`}
              </div>
              <div className={cn("mt-2 text-base font-semibold leading-6", theme.titleClassName)}>
                {step.instruction}
              </div>
              <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                {[
                  formatTurnDistance(step.distanceMeters),
                  formatDurationMinutes(step.durationSeconds),
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
