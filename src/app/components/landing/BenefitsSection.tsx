import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageErrorBoundary } from "../ImageErrorBoundary";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface BenefitsSectionProps {
  primaryColor: string;
  secondaryColor: string;
  mechanicImage: string;
  repairToolImage: string;
  dentRepairImage: string;
  precisionRepairImage: string;
}

export default function BenefitsSection({
  primaryColor,
  secondaryColor,
  mechanicImage,
  repairToolImage,
  dentRepairImage,
  precisionRepairImage,
}: BenefitsSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  const benefits = [
    {
      image: mechanicImage,
      alt: "Close-up of car damage showing dents and scratches needing professional repair",
      badge: "Guided Intake",
      badgeColor: "bg-white/85 text-[#003d82] backdrop-blur-sm border border-blue-100/40",
      title: "Get Your Car Fixed Right",
      description:
        "From minor dents to major collision damage, connect with shops that specialize in your repair needs.",
    },
    {
      image: repairToolImage,
      alt: "Professional auto body painter in spray booth ensuring quality repairs",
      badge: "Repair Network",
      badgeColor: "bg-white/85 text-[#003d82] backdrop-blur-sm border border-blue-100/40",
      title: "Experienced Professionals",
      description:
        "Connect with auto repair specialists who compete for your business with transparent quotes.",
    },
    {
      image: dentRepairImage,
      alt: "Professional dent repair and paintless dent removal service",
      badge: "Transparent Bids",
      badgeColor: "bg-white/85 text-[#003d82] backdrop-blur-sm border border-blue-100/40",
      title: "Transparent Estimates",
      description: "Review side-by-side estimates and timelines before selecting a repair plan.",
    },
  ];

  return (
    <section
      className="pt-10 pb-12 md:pt-14 md:pb-18"
      style={{ background: "linear-gradient(180deg, #edf3fa 0%, #f5f8fd 40%, #eef4fb 100%)" }}
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Built for Real Repairs
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-2xl sm:text-4xl font-bold mb-4 text-slate-900">
            Why Choose{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bid
            </span>
            <span style={{ color: "#1e40af" }}>On</span>
            <span className="text-gray-800">Dent</span>?
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`bd-glass-card p-4 sm:p-5 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 251, 255, 0.98) 100%)",
              }}
            >
              <div className="mb-3 overflow-hidden rounded-lg relative h-44 flex items-center justify-center">
                <ImageErrorBoundary>
                  <ImageWithFallback
                    src={benefit.image}
                    alt={benefit.alt}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                  />
                </ImageErrorBoundary>
                {/* Floating badge on image */}
                <span
                  className={`absolute top-3 right-3 ${benefit.badgeColor} text-xs font-semibold px-3 py-1.5 rounded-full shadow-md animate-float-slow`}
                >
                  {benefit.badge}
                </span>
              </div>
              <h4 className="font-bold text-xl mb-3">{benefit.title}</h4>
              <p className="text-slate-700">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-8 md:mt-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2">
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              $0
            </span>
            <span className="text-xs text-slate-600 font-medium">Free for Customers</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2">
            <span className="text-lg font-bold" style={{ color: primaryColor }}>
              3+
            </span>
            <span className="text-xs text-slate-600 font-medium">Bids Per Request</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-white/80 px-4 py-2">
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              NY
            </span>
            <span className="text-xs text-slate-600 font-medium">Service Area</span>
          </div>
        </div>
      </div>
    </section>
  );
}
