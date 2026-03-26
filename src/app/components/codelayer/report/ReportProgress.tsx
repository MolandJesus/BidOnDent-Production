import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type ReportProgressProps = {
  progress: number;
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ReportProgress({
  progress,
  primaryColor,
  appearanceMode = "map-dark",
}: ReportProgressProps) {
  const isLightAppearance = appearanceMode === "light";
  const steps = [1, 2, 3, 4, 5];
  const activeStep = Math.max(1, Math.min(5, Math.ceil(progress / 20)));

  return (
    <div
      className={`bd-glass-panel !rounded-none px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3 ${
        isLightAppearance ? "border-b border-blue-200/35" : "border-b border-blue-300/15"
      }`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 247, 255, 0.90) 100%)"
          : "linear-gradient(180deg, rgba(10, 20, 42, 0.86) 0%, rgba(8, 16, 34, 0.82) 100%)",
      }}
    >
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 md:gap-3 min-w-[320px] sm:min-w-0">
          {steps.map((step) => (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                  step <= activeStep
                    ? "text-white"
                    : isLightAppearance
                      ? "bg-blue-100/80 border border-blue-200 text-blue-700"
                      : "bg-blue-400/10 border border-blue-300/20 text-blue-100/70"
                }`}
                style={
                  step <= activeStep
                    ? {
                        backgroundColor: primaryColor,
                        boxShadow:
                          "0 2px 12px rgba(37, 99, 235, 0.4), 0 0 6px rgba(56, 189, 248, 0.2)",
                      }
                    : {}
                }
              >
                {step}
              </div>
              {step < steps.length && (
                <div
                  className={`h-1.5 flex-1 mx-1.5 sm:mx-2 rounded-full overflow-hidden ${
                    isLightAppearance
                      ? "bg-blue-100/80 border border-blue-200"
                      : "bg-blue-400/10 border border-blue-300/10"
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        step < activeStep
                          ? "100%"
                          : step === activeStep
                            ? `${progress % 20 === 0 ? 100 : (progress % 20) * 5}%`
                            : "0%",
                      backgroundColor: primaryColor,
                      boxShadow: step <= activeStep ? "0 0 8px rgba(37,99,235,0.35)" : "none",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
