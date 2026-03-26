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
  isLightAppearance?: boolean;
}

export default function BenefitsSection({
  primaryColor,
  secondaryColor,
  mechanicImage,
  repairToolImage,
  dentRepairImage,
  precisionRepairImage,
  isLightAppearance = false,
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
      className="pt-10 pb-12 md:pt-14 md:pb-18 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(183deg, #eae8f6 0%, #f0eefc 28%, #ecf1fb 60%, #e8edfa 100%)"
          : "linear-gradient(182deg, #0b1d3c 0%, #0d2445 42%, #091a34 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-300/20" : "via-blue-400/15"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_25%_80%,rgba(251,191,36,0.04),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_80%_20%,rgba(99,102,241,0.07),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_50%,rgba(59,130,246,0.05),transparent_55%)]" />
          <div className="absolute -top-10 right-[15%] w-64 h-64 bg-blue-300/[0.05] rounded-full blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />
          <div className="absolute -top-10 left-1/3 w-80 h-80 bg-blue-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[10%] w-64 h-64 bg-indigo-400/[0.04] rounded-full blur-[100px]" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-24 right-[10%] animate-orb-breathe"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-[18px] h-[18px] rounded-full ${isLightAppearance ? "bg-blue-400/25" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 20px 6px rgba(59,130,246,0.12)"
              : "0 0 24px 8px rgba(59,130,246,0.22)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-20 left-[4%] animate-orb-glow"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-3 h-3 rounded-full ${isLightAppearance ? "bg-indigo-400/20" : "bg-indigo-400/35"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 16px 4px rgba(99,102,241,0.1)"
              : "0 0 20px 6px rgba(99,102,241,0.18)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border border-blue-200/50 bg-white/70 text-blue-700" : "border border-blue-400/25 bg-blue-500/10 text-blue-200"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isLightAppearance ? "bg-blue-500" : "bg-blue-400"}`}
            />
            Built for Real Repairs
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3
            className={`text-3xl sm:text-4xl font-bold mb-4 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
          >
            Why Choose{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #60a5fa 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bid
            </span>
            <span className={isLightAppearance ? "text-blue-600" : "text-blue-400"}>On</span>
            <span className={isLightAppearance ? "text-slate-900" : "text-slate-100"}>Dent</span>?
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`rounded-2xl p-4 sm:p-5 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 ${isLightAppearance ? "border border-blue-200/40" : "border border-blue-300/20"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 255, 0.9) 100%)"
                  : "linear-gradient(180deg, rgba(30, 58, 138, 0.30) 0%, rgba(14, 32, 56, 0.75) 100%)",
                boxShadow: isLightAppearance
                  ? "0 4px 16px rgba(0, 40, 100, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)"
                  : "0 8px 32px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(147, 197, 253, 0.14)",
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
                  className={`absolute top-3 right-3 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full shadow-md animate-float-slow ${isLightAppearance ? "bg-white/85 text-blue-700 border border-blue-200/50" : "bg-blue-500/20 text-blue-200 border border-blue-400/30"}`}
                >
                  {benefit.badge}
                </span>
              </div>
              <h4
                className={`font-bold text-xl mb-3 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
              >
                {benefit.title}
              </h4>
              <p className={isLightAppearance ? "text-slate-600" : "text-blue-100/65"}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-8 md:mt-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          <div
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-blue-200/50 bg-white/70" : "border border-blue-400/25 bg-blue-500/10"}`}
          >
            <span
              className={`text-lg font-bold ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
            >
              $0
            </span>
            <span
              className={`text-xs font-medium ${isLightAppearance ? "text-slate-600" : "text-blue-200/70"}`}
            >
              Free for Customers
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-blue-200/50 bg-white/70" : "border border-blue-400/25 bg-blue-500/10"}`}
          >
            <span
              className={`text-lg font-bold ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
            >
              3+
            </span>
            <span
              className={`text-xs font-medium ${isLightAppearance ? "text-slate-600" : "text-blue-200/70"}`}
            >
              Bids Per Request
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-blue-200/50 bg-white/70" : "border border-blue-400/25 bg-blue-500/10"}`}
          >
            <span
              className={`text-sm font-bold ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
            >
              NY
            </span>
            <span
              className={`text-xs font-medium ${isLightAppearance ? "text-slate-600" : "text-blue-200/70"}`}
            >
              Service Area
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
