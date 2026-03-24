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
      className="pt-10 pb-16 md:pt-16 md:pb-24 bg-gradient-to-br from-[#fafbff] via-[#f4f3ff] to-[#eeeeff]"
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
          className={`text-center mb-8 md:mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-2xl sm:text-4xl font-bold mb-4">
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
            <span style={{ color: "#70c0ee" }}>On</span>
            <span className="text-gray-800">Dent</span>?
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`bd-glass-card p-6 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${0.3 + index * 0.15}s` }}
            >
              <div className="mb-4 overflow-hidden rounded-lg relative h-48 flex items-center justify-center">
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
              <p className="text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div
          className={`flex flex-wrap justify-center gap-5 md:gap-8 mt-10 md:mt-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          <div className="flex items-center gap-2 bd-glass-card px-5 py-3 rounded-full">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              $0
            </span>
            <span className="text-sm text-gray-600">Free for Customers</span>
          </div>
          <div className="flex items-center gap-2 bd-glass-card px-5 py-3 rounded-full">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              3+
            </span>
            <span className="text-sm text-gray-600">Bids Per Request</span>
          </div>
          <div className="flex items-center gap-2 bd-glass-card px-5 py-3 rounded-full">
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              NY
            </span>
            <span className="text-sm text-gray-600">Service Area</span>
          </div>
        </div>
      </div>
    </section>
  );
}
