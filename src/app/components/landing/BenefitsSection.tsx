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
      badgeColor: "bg-gray-200 text-gray-700",
      title: "Get Your Car Fixed Right",
      description:
        "From minor dents to major collision damage, connect with shops that specialize in your repair needs.",
    },
    {
      image: repairToolImage,
      alt: "Professional auto body painter in spray booth ensuring quality repairs",
      badge: "Certified Network",
      badgeColor: "bg-gray-200 text-gray-700",
      title: "Certified Professionals",
      description:
        "Work with vetted, experienced auto repair specialists who deliver quality results.",
    },
    {
      image: dentRepairImage,
      alt: "Professional dent repair and paintless dent removal service",
      badge: "Transparent Bids",
      badgeColor: "bg-gray-200 text-gray-700",
      title: "Competitive Pricing",
      description: "Compare multiple quotes to ensure you get the best value for your money.",
    },
  ];

  return (
    <section
      className="pt-8 pb-20 md:pt-12 bg-gradient-to-br from-gray-50 to-blue-50"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Why Choose Us
          </span>
        </div>

        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-4xl font-bold mb-4">
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
              className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div
          className={`flex flex-wrap justify-center gap-8 mt-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              24/7
            </span>
            <span className="text-sm text-gray-600">Support Available</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              100%
            </span>
            <span className="text-sm text-gray-600">Satisfaction Guarantee</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-sm border border-gray-100">
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              $0
            </span>
            <span className="text-sm text-gray-600">Free to Use</span>
          </div>
        </div>
      </div>
    </section>
  );
}
