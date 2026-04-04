import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type ReportProgressProps = {
  step: number;
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ReportProgress({
  step,
  primaryColor,
  appearanceMode = "map-dark",
}: ReportProgressProps) {
  const isLightAppearance = appearanceMode === "light";
  const steps = [1, 2, 3, 4, 5];
  const activeStep = Math.max(1, Math.min(5, step));

  return (
    <div className="bd-report-progress !rounded-none px-2.5 sm:px-4 md:px-6 py-3 sm:py-3.5">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex min-w-max items-center justify-center px-1">
          {steps.map((progressStep) => {
            const isCompleted = progressStep < activeStep;
            const isCurrent = progressStep === activeStep;
            const isActive = isCompleted || isCurrent;

            return (
              <div key={progressStep} className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
                <div
                  className={`bd-report-progress-node relative isolate flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? "text-white"
                      : isLightAppearance
                        ? "text-slate-600"
                        : "text-blue-100/70"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                          borderColor: "rgba(125, 211, 252, 0.55)",
                          boxShadow: isLightAppearance
                            ? "0 12px 22px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255,255,255,0.18)"
                            : "0 12px 22px rgba(2, 6, 23, 0.24), inset 0 1px 0 rgba(255,255,255,0.14)",
                        }
                      : {}
                  }
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-[-6px] rounded-full"
                      style={{
                        background: isLightAppearance
                          ? "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(37, 99, 235, 0.08) 48%, transparent 74%)"
                          : "radial-gradient(circle, rgba(56, 189, 248, 0.34) 0%, rgba(37, 99, 235, 0.16) 48%, transparent 74%)",
                        filter: "blur(8px)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{progressStep}</span>
                </div>
                {progressStep < steps.length && (
                  <div className="bd-report-progress-rail h-1.5 w-10 sm:w-16 md:w-24 lg:w-32 shrink-0 rounded-full overflow-hidden">
                    <div
                      className="bd-report-progress-rail-fill h-full rounded-full transition-all duration-300"
                      style={{
                        width: isCompleted ? "100%" : "0%",
                        background: `linear-gradient(90deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
