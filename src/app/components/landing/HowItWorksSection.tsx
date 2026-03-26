import { Camera, FileCheck, Wrench } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface HowItWorksSectionProps {
  vehicleInspectionImage: string;
  primaryColor: string;
}

export default function HowItWorksSection({
  vehicleInspectionImage,
  primaryColor,
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
      className="pt-12 md:pt-16 pb-10 md:pb-14"
      style={{ background: "linear-gradient(180deg, #e8f0f8 0%, #f0f5fb 30%, #edf3fa 100%)" }}
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Three Steps
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">How It Works</h3>
          <p className="text-base sm:text-xl leading-relaxed text-slate-700">
            Get your car repaired in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 relative">
          {/* Dashed connectors between cards (desktop only) */}
          <div
            className="hidden md:block absolute top-16 left-[33%] w-[10%] border-t-2 border-dashed border-blue-200/40"
            style={{ transform: "translateX(-50%)" }}
          />
          <div
            className="hidden md:block absolute top-16 left-[67%] w-[10%] border-t-2 border-dashed border-blue-200/40"
            style={{ transform: "translateX(-50%)" }}
          />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bd-glass-card p-5 sm:p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-500 group relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 255, 0.98) 100%)",
              }}
            >
              {/* Icon with overlaid step number */}
              <div className="relative inline-block mb-5">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-sm"
                  style={{
                    backgroundColor: `${primaryColor}14`,
                    border: `1px solid ${primaryColor}12`,
                    boxShadow: "0 0 12px rgba(59, 130, 246, 0.06)",
                  }}
                >
                  <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                </div>
                <span
                  className="absolute -bottom-1.5 -left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #147dd6)`,
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h4 className="font-bold text-lg sm:text-xl mb-2 text-slate-900">{step.title}</h4>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
