import { Camera, FileCheck, Wrench } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface HowItWorksSectionProps {
  vehicleInspectionImage: string;
  primaryColor: string;
  isLightAppearance?: boolean;
}

export default function HowItWorksSection({
  vehicleInspectionImage,
  primaryColor,
  isLightAppearance = false,
}: HowItWorksSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  const steps = [
    {
      icon: Camera,
      number: 1,
      title: "Report Damage",
      description:
        "Take photos of your vehicle's damage and submit a repair request in minutes with our easy-to-use guided process.",
    },
    {
      icon: FileCheck,
      number: 2,
      title: "Receive Bids",
      description:
        "Shops near you on the BidOnDent network review your request and submit competitive quotes with scope, timeline, and pricing.",
    },
    {
      icon: Wrench,
      number: 3,
      title: "Choose and Repair",
      description:
        "Compare bids side by side, select the best option for you, and move into scheduling with tracked status updates.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="pt-12 md:pt-16 pb-10 md:pb-14 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(176deg, #e6edfb 0%, #eeebfc 30%, #e9f0fb 65%, #edf2fa 100%)"
          : "linear-gradient(175deg, #071a34 0%, #0a2842 45%, #081e38 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-indigo-300/20" : "via-blue-400/30"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_-10%,rgba(139,92,246,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(59,130,246,0.06),transparent_55%)]" />
          <div className="absolute top-10 left-[20%] w-48 h-48 bg-indigo-300/[0.06] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(59,130,246,0.03)_39px,rgba(59,130,246,0.03)_40px)] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_-5%,rgba(59,130,246,0.08),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_85%,rgba(37,99,235,0.06),transparent_55%)]" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/[0.06] rounded-full blur-[100px]" />
          <div className="absolute -bottom-10 left-[15%] w-56 h-56 bg-blue-400/[0.04] rounded-full blur-[100px]" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-20 left-[6%] animate-orb-float"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-indigo-400/25" : "bg-blue-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 18px 5px rgba(99,102,241,0.12)"
              : "0 0 22px 7px rgba(59,130,246,0.2)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-16 right-[7%] animate-orb-drift"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-3 h-3 rounded-full ${isLightAppearance ? "bg-blue-400/30" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 14px 4px rgba(59,130,246,0.1)"
              : "0 0 18px 5px rgba(37,99,235,0.18)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute top-36 right-[4%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLightAppearance ? "bg-indigo-100/60 border border-indigo-200/40" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 14px rgba(99,102,241,0.1)"
              : "0 0 18px rgba(59,130,246,0.15)",
          }}
        >
          <Wrench
            className={`w-3.5 h-3.5 ${isLightAppearance ? "text-indigo-500/60" : "text-blue-400/50"}`}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full border backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border-blue-200/50 bg-white/70 text-blue-700" : "border-blue-400/25 bg-blue-500/10 text-blue-200"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isLightAppearance ? "bg-blue-500" : "bg-blue-400"}`}
            />
            Three Steps
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3
            className={`text-3xl sm:text-4xl font-bold mb-4 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
          >
            How It Works
          </h3>
          <p
            className={`text-base sm:text-xl leading-relaxed ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"}`}
          >
            Get your car repaired in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Dashed connectors between cards (desktop only) */}
          <div
            className="hidden md:block absolute top-16 left-[33%] w-[10%] border-t-2 border-dashed"
            style={{
              transform: "translateX(-50%)",
              borderColor: isLightAppearance ? "rgba(59,130,246,0.15)" : "rgba(96,165,250,0.2)",
            }}
          />
          <div
            className="hidden md:block absolute top-16 left-[67%] w-[10%] border-t-2 border-dashed"
            style={{
              transform: "translateX(-50%)",
              borderColor: isLightAppearance ? "rgba(59,130,246,0.15)" : "rgba(96,165,250,0.2)",
            }}
          />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`rounded-2xl border p-5 sm:p-6 hover:shadow-xl transition-all duration-500 group relative ${isLightAppearance ? "border-blue-100/50 hover:border-blue-200/60" : "border-blue-300/22 hover:border-blue-400/38"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 251, 255, 0.98) 100%)"
                  : "linear-gradient(180deg, rgba(15, 30, 60, 0.30) 0%, rgba(10, 18, 40, 0.75) 100%)",
                boxShadow: isLightAppearance
                  ? "0 4px 16px rgba(30, 58, 138, 0.06)"
                  : "0 8px 32px rgba(2, 6, 23, 0.50), inset 0 1px 0 rgba(96, 165, 250, 0.14), 0 0 0 1px rgba(96, 165, 250, 0.06)",
              }}
            >
              {/* Icon with overlaid step number */}
              <div className="relative inline-block mb-5">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-sm"
                  style={{
                    backgroundColor: isLightAppearance
                      ? "rgba(59, 130, 246, 0.08)"
                      : "rgba(59, 130, 246, 0.15)",
                    border: isLightAppearance
                      ? "1px solid rgba(59, 130, 246, 0.15)"
                      : "1px solid rgba(96, 165, 250, 0.22)",
                    boxShadow: isLightAppearance
                      ? "0 0 12px rgba(59, 130, 246, 0.04)"
                      : "0 0 16px rgba(59, 130, 246, 0.08)",
                  }}
                >
                  <step.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
                  />
                </div>
                <span
                  className="absolute -bottom-1.5 -left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h4
                className={`font-bold text-lg sm:text-xl mb-2 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm sm:text-base leading-relaxed ${isLightAppearance ? "text-slate-600" : "text-blue-100/65"}`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
