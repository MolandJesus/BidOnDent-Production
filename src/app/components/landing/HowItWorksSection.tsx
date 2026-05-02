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
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(175deg, #eef5ff 0%, #e8f1fd 45%, #e3edfc 100%)"
          : "linear-gradient(175deg, #071a34 0%, #0a2842 45%, #081e38 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-sky-300/30" : "via-blue-400/30"} to-transparent`}
      />
      {/* Atmospheric depth — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Direction C luminance accent: sky teal, top-right corner */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "700px",
            height: "700px",
            top: "-180px",
            right: "-180px",
            background: "radial-gradient(circle, rgba(14,165,233,0.18), transparent 65%)",
          }}
        />
        {isLightAppearance ? (
          <>
            {/* Subtle mesh texture */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(200,170,110,0.05)_39px,rgba(200,170,110,0.05)_40px)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_-10%,rgba(210,180,130,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_80%,rgba(200,165,100,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_40%_90%,rgba(220,185,115,0.14),transparent_50%)]" />
            <div className="absolute top-10 left-[20%] w-64 h-64 bg-amber-200/[0.22] rounded-full blur-[110px]" />
            <div className="absolute bottom-0 right-[20%] w-48 h-48 bg-amber-100/[0.18] rounded-full blur-[120px]" />
            <div className="absolute -top-10 right-[8%] w-[28rem] h-[28rem] bg-sky-400/[0.18] rounded-full blur-[130px]" />
            <div className="absolute bottom-0 left-[5%] w-72 h-72 bg-blue-300/[0.14] rounded-full blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(59,130,246,0.07)_39px,rgba(59,130,246,0.07)_40px)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_75%_-5%,rgba(59,130,246,0.20),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_20%_85%,rgba(37,99,235,0.16),transparent_55%)]" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/[0.18] rounded-full blur-[120px]" />
            <div className="absolute -bottom-10 left-[15%] w-72 h-72 bg-indigo-400/[0.14] rounded-full blur-[110px]" />
          </>
        )}
      </div>

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-20 left-[6%] animate-orb-float"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-sky-400/[0.14]" : "bg-blue-400/50"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 30px 10px rgba(56,189,248,0.18)"
              : "0 0 30px 10px rgba(59,130,246,0.26)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-16 right-[7%] animate-orb-drift"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-sky-300/[0.12]" : "bg-blue-400/55"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 26px 9px rgba(56,189,248,0.14)"
              : "0 0 26px 8px rgba(37,99,235,0.24)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute top-36 right-[4%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-9 h-9 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-[rgba(225,240,255,0.50)] border border-[rgba(100,160,230,0.32)] backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 20px rgba(56,189,248,0.14), inset 0 1px 0 rgba(220,240,255,0.80)"
              : "0 0 18px rgba(59,130,246,0.15)",
          }}
        >
          <Wrench
            className={`w-3.5 h-3.5 ${isLightAppearance ? "text-blue-500/60" : "text-blue-400/50"}`}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full border backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border-[rgba(100,160,230,0.30)] bg-[rgba(230,244,255,0.60)] text-sky-700 shadow-[inset_0_1px_0_rgba(220,240,255,0.8)]" : "border-blue-400/25 bg-blue-500/10 text-blue-200"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
            Three Steps
          </span>
        </div>

        <div
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          {/* Pass 14 — Direction C flanking accent: sky teal (HowItWorks's
              assigned color in the locked palette). Same editorial-typography
              treatment as Pass 12/13 gold accents on warm sections; here the
              color matches each section's own Direction C luminance hue. */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.10) 25%, rgba(14,165,233,0.85) 60%, rgba(14,165,233,0.55) 85%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.20) 25%, rgba(56,189,248,0.90) 60%, rgba(56,189,248,0.55) 85%, transparent 100%)",
              }}
            />
            <h3
              className={`text-3xl sm:text-4xl font-bold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              style={{
                textShadow: isLightAppearance
                  ? "0 1px 2px rgba(0,0,0,0.05)"
                  : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              How It Works
            </h3>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.55) 15%, rgba(14,165,233,0.85) 40%, rgba(14,165,233,0.10) 75%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.55) 15%, rgba(56,189,248,0.90) 40%, rgba(56,189,248,0.20) 75%, transparent 100%)",
              }}
            />
          </div>
          <p
            className={`text-base sm:text-xl leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
          >
            Get your car repaired in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Dashed connectors between cards (desktop only) */}
          <div
            className="hidden md:block absolute top-[3.5rem] left-[33%] w-[10%] border-t-2"
            style={{
              borderStyle: "dashed",
              transform: "translateX(-50%)",
              borderColor: isLightAppearance ? "rgba(100,160,230,0.40)" : "rgba(96,165,250,0.28)",
            }}
          />
          <div
            className="hidden md:block absolute top-[3.5rem] left-[67%] w-[10%] border-t-2"
            style={{
              borderStyle: "dashed",
              transform: "translateX(-50%)",
              borderColor: isLightAppearance ? "rgba(100,160,230,0.40)" : "rgba(96,165,250,0.28)",
            }}
          />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bd-glass-card bd-glass-card--landing p-5 sm:p-6 transition-all duration-500 group relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
              }}
            >
              {/* Icon with overlaid step number */}
              <div className="relative inline-block mb-5">
                {/* Large background step number */}
                <div
                  className={`absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold z-10`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
                    boxShadow:
                      "0 4px 18px rgba(59, 130, 246, 0.58), 0 2px 6px rgba(37, 99, 235, 0.28), 0 0 0 2px rgba(255,255,255,0.22)",
                  }}
                >
                  {step.number}
                </div>
                <div
                  className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-sm"
                  style={{
                    backgroundColor: isLightAppearance
                      ? "rgba(59, 130, 246, 0.07)"
                      : "rgba(59, 130, 246, 0.14)",
                    border: isLightAppearance
                      ? "1.5px solid rgba(59, 130, 246, 0.14)"
                      : "1.5px solid rgba(96, 165, 250, 0.22)",
                    boxShadow: isLightAppearance
                      ? "0 4px 18px rgba(59, 130, 246, 0.16), 0 0 28px rgba(59, 130, 246, 0.10)"
                      : "0 0 20px rgba(59, 130, 246, 0.10)",
                  }}
                >
                  <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                </div>
              </div>

              <h4
                className={`font-bold text-lg sm:text-xl mb-2 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {step.title}
              </h4>
              <p
                className={`text-sm sm:text-base leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom transition — blends into Benefits warm-gray */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#faf9f6]" : "bg-gradient-to-b from-transparent to-[#0e1838]"}`}
      />
    </section>
  );
}
