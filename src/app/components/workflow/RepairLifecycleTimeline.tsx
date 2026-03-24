import { CheckCircle2, Clock3 } from "lucide-react";

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
};

export default function RepairLifecycleTimeline({
  title = "Repair Lifecycle",
  subtitle,
  steps,
  compact = false,
}: RepairLifecycleTimelineProps) {
  return (
    <section className="bd-glass-card p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-slate-600 text-sm mt-1">{subtitle}</p>}
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
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isCurrent
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-slate-100 border-slate-300 text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock3 className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && <div className="w-px h-8 bg-slate-200 mt-1" />}
              </div>

              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{step.label}</p>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      In progress
                    </span>
                  )}
                </div>
                {!compact && <p className="text-sm text-slate-600 mt-1">{step.description}</p>}
                {step.timestamp && <p className="text-xs text-slate-500 mt-1">{step.timestamp}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
