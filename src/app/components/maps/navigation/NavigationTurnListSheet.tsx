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
    <div className="pointer-events-none absolute inset-x-4 top-24 z-[565] flex justify-end">
      <div className={cn("pointer-events-auto w-full max-w-[420px] p-4", theme.panelStrongClassName)}>
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

        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={index === currentStepIndex ? theme.selectedListCardClassName : theme.listCardClassName}
            >
              <div className={theme.metricLabelClassName}>
                {index === currentStepIndex ? "Active step" : `Step ${index + 1}`}
              </div>
              <div className={cn("mt-2 text-base font-semibold leading-6", theme.titleClassName)}>
                {step.instruction}
              </div>
              <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                {[formatTurnDistance(step.distanceMeters), formatDurationMinutes(step.durationSeconds)]
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
