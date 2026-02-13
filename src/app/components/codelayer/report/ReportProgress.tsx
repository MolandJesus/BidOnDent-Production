type ReportProgressProps = {
  progress: number;
  primaryColor: string;
};

export default function ReportProgress({ progress, primaryColor }: ReportProgressProps) {
  const steps = [1, 2, 3, 4, 5];
  const activeStep = Math.max(1, Math.min(5, Math.ceil(progress / 20)));

  return (
    <div className="bg-white border-b border-slate-200 px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 md:gap-3 min-w-[320px] sm:min-w-0">
          {steps.map((step) => (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                  step <= activeStep ? "text-white shadow-sm" : "bg-slate-100 text-slate-500"
                }`}
                style={step <= activeStep ? { backgroundColor: primaryColor } : {}}
              >
                {step}
              </div>
              {step < steps.length && (
                <div className="h-1.5 flex-1 mx-1.5 sm:mx-2 rounded-full bg-slate-100 overflow-hidden">
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
