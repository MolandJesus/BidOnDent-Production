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
        <div className="flex items-center gap-2 md:gap-3 min-w-[320px] sm:min-w-0">
          {steps.map((progressStep) => {
            const isCompleted = progressStep < activeStep;
            const isCurrent = progressStep === activeStep;

            return (
              <div key={progressStep} className="flex items-center flex-1 min-w-0">
                <div
                  className={`bd-report-progress-node w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                    isCompleted || isCurrent
                      ? "text-white"
                      : isLightAppearance
                        ? "text-slate-600"
                        : "text-blue-100/70"
                  }`}
                  style={
                    isCompleted || isCurrent
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                          borderColor: "rgba(125, 211, 252, 0.55)",
                          boxShadow:
                            "0 2px 12px rgba(37, 99, 235, 0.4), 0 0 6px rgba(56, 189, 248, 0.2)",
                        }
                      : {}
                  }
                >
                  {progressStep}
                </div>
                {progressStep < steps.length && (
                  <div className="bd-report-progress-rail h-1.5 flex-1 mx-1.5 sm:mx-2 rounded-full overflow-hidden">
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
