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
        "Local certified shops review your request and submit competitive repair quotes.",
    },
    {
      icon: Wrench,
      number: 3,
      title: "Choose and Repair",
      description:
        "Compare bids side by side, select the best option for you, and schedule your repair with confidence.",
    },
  ];

  return (
    <section id="how-it-works" className="pt-20 pb-8 md:pb-12 bg-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Simple Process
          </span>
        </div>

        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-4xl font-bold mb-4">How It Works</h3>
          <p className="text-xl text-gray-600">Get your car repaired in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Dashed connectors between cards (desktop only) */}
          <div
            className="hidden md:block absolute top-24 left-[33%] w-[12%] border-t-2 border-dashed border-blue-300"
            style={{ transform: "translateX(-50%)" }}
          />
          <div
            className="hidden md:block absolute top-24 left-[67%] w-[12%] border-t-2 border-dashed border-blue-300"
            style={{ transform: "translateX(-50%)" }}
          />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 group relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${0.3 + index * 0.15}s` }}
            >
              {/* Icon */}
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{ backgroundColor: `${primaryColor}12` }}
              >
                <step.icon className="w-8 h-8 text-gray-400" />
              </div>

              {/* Step number badge - below icon */}
              <div className="mb-4">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: "#22c55e" }}
                >
                  {step.number}
                </span>
              </div>

              <h4 className="font-bold text-xl mb-3">{step.title}</h4>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
