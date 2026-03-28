import { CheckCircle2, Clock3 } from "lucide-react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export type LifecycleStep = {
  id: string;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
};

type RepairLifecycleTimelineProps = {
  title?: string;
  subtitle?: string;
  steps: LifecycleStep[];
  compact?: boolean;
  appearanceMode?: DashboardAppearanceMode;
};

export default function RepairLifecycleTimeline({
  title = "Repair Lifecycle",
  subtitle,
  steps,
  compact = false,
  appearanceMode = "map-dark",
}: RepairLifecycleTimelineProps) {
  const isLight = appearanceMode === "light";
  return (
    <section className="bd-glass-card p-4 md:p-5">
      <div className="mb-4">
        <h3 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>{title}</h3>
        {subtitle && <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isCurrent
                        ? "bg-blue-400/15 border-blue-400/40 text-blue-200"
                        : isLight ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-white/[0.06] border-white/[0.12] text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock3 className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && <div className={`w-px h-8 mt-1 ${isLight ? "bg-slate-200" : "bg-white/[0.10]"}`} />}
              </div>

              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>{step.label}</p>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/15 text-blue-200 font-medium">
                      In progress
                    </span>
                  )}
                </div>
                {!compact && <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>{step.description}</p>}
                {step.timestamp && <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>{step.timestamp}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
