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
      badgeColor:
        "bg-[rgba(255,251,245,0.85)] text-[#003d82] backdrop-blur-sm border border-[rgba(200,180,150,0.3)]",
      title: "Get Your Car Fixed Right",
      description:
        "From minor dents to major collision damage, connect with shops that specialize in your repair needs.",
    },
    {
      image: repairToolImage,
      alt: "Professional auto body painter in spray booth ensuring quality repairs",
      badge: "Repair Network",
      badgeColor:
        "bg-[rgba(255,251,245,0.85)] text-[#003d82] backdrop-blur-sm border border-[rgba(200,180,150,0.3)]",
      title: "Experienced Professionals",
      description:
        "Connect with auto repair specialists who compete for your business with transparent quotes.",
    },
    {
      image: dentRepairImage,
      alt: "Professional dent repair and paintless dent removal service",
      badge: "Transparent Bids",
      badgeColor:
        "bg-[rgba(255,251,245,0.85)] text-[#003d82] backdrop-blur-sm border border-[rgba(200,180,150,0.3)]",
      title: "Transparent Estimates",
      description: "Review side-by-side estimates and timelines before selecting a repair plan.",
    },
  ];

  return (
    <section
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(182deg, #faf9f6 0%, #f5f4f0 42%, #f0eeea 100%)"
          : "linear-gradient(182deg, #0e1838 0%, #14204c 42%, #0c1634 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-amber-300/25" : "via-indigo-400/30"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          {/* Subtle cross-hatch texture */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_34px,rgba(99,102,241,0.02)_34px,rgba(99,102,241,0.02)_35px),repeating-linear-gradient(-45deg,transparent,transparent_34px,rgba(99,102,241,0.02)_34px,rgba(99,102,241,0.02)_35px)] opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_25%_80%,rgba(220,185,115,0.09),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_80%_20%,rgba(200,170,110,0.10),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_50%,rgba(200,165,100,0.06),transparent_55%)]" />
          <div className="absolute -top-10 right-[15%] w-72 h-72 bg-amber-200/[0.16] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[10%] w-56 h-56 bg-amber-100/[0.12] rounded-full blur-[130px]" />
          <div className="absolute top-1/2 right-[30%] w-80 h-80 bg-amber-300/[0.08] rounded-full blur-[140px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_34px,rgba(99,102,241,0.035)_34px,rgba(99,102,241,0.035)_35px),repeating-linear-gradient(-45deg,transparent,transparent_34px,rgba(99,102,241,0.035)_34px,rgba(99,102,241,0.035)_35px)] opacity-60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_30%_-10%,rgba(99,102,241,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_75%_85%,rgba(79,70,229,0.09),transparent_55%)]" />
          <div className="absolute -top-10 left-1/3 w-[26rem] h-[26rem] bg-indigo-500/[0.09] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-[10%] w-80 h-80 bg-indigo-400/[0.06] rounded-full blur-[120px]" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-24 right-[10%] animate-orb-breathe"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-6 h-6 rounded-full ${isLightAppearance ? "bg-amber-400/[0.12]" : "bg-indigo-400/55"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 32px 12px rgba(200,160,80,0.16)"
              : "0 0 32px 12px rgba(99,102,241,0.28)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-20 left-[4%] animate-orb-glow"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-amber-300/[0.10]" : "bg-indigo-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 28px 9px rgba(200,160,80,0.12)"
              : "0 0 26px 8px rgba(99,102,241,0.24)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border border-[rgba(200,165,80,0.30)] bg-[rgba(255,248,235,0.55)] text-amber-700 shadow-[inset_0_1px_0_rgba(255,250,235,0.7)]" : "border border-indigo-400/25 bg-indigo-500/10 text-indigo-200"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-amber-400" />
            Built for Real Repairs
          </span>
        </div>

        <div
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            style={{
              textShadow: isLightAppearance
                ? "0 1px 2px rgba(0,0,0,0.05)"
                : "0 2px 8px rgba(0,0,0,0.3)",
            }}
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
            <span className="text-blue-500">On</span>
            <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>Dent</span>?
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`rounded-2xl p-4 sm:p-5 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 ${isLightAppearance ? "border border-[rgba(200,180,150,0.3)]" : "border border-indigo-300/22"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 253, 0.75) 100%)"
                  : "linear-gradient(180deg, rgba(30, 27, 75, 0.30) 0%, rgba(15, 14, 40, 0.75) 100%)",
                boxShadow: isLightAppearance
                  ? "0 10px 38px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(200, 180, 150, 0.14), inset 0 1px 0 rgba(255, 250, 240, 0.90), 0 0 0 1px rgba(200, 180, 150, 0.16)"
                  : "0 8px 32px rgba(2, 6, 23, 0.50), inset 0 1px 0 rgba(129, 140, 248, 0.14), 0 0 0 1px rgba(129, 140, 248, 0.06)",
              }}
            >
              <div className="mb-3 overflow-hidden rounded-lg relative h-56 flex items-center justify-center">
                <ImageErrorBoundary>
                  <ImageWithFallback
                    src={benefit.image}
                    alt={benefit.alt}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                  />
                </ImageErrorBoundary>
                {/* Bottom gradient fade on image */}
                <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                {/* Floating badge on image */}
                <span className="absolute top-3 right-3 backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full shadow-md animate-float-slow border bg-blue-600/80 text-white border-blue-500/50">
                  {benefit.badge}
                </span>
              </div>
              <h4
                className={`font-bold text-xl mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {benefit.title}
              </h4>
              <p className={isLightAppearance ? "text-slate-500" : "text-blue-100/65"}>
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
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-[rgba(200,180,150,0.3)] bg-[rgba(255,251,245,0.5)]" : "border border-blue-400/25 bg-blue-500/10"}`}
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
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-[rgba(200,180,150,0.3)] bg-[rgba(255,251,245,0.5)]" : "border border-blue-400/25 bg-blue-500/10"}`}
          >
            <span
              className={`text-lg font-bold ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
            >
              Multiple
            </span>
            <span
              className={`text-xs font-medium ${isLightAppearance ? "text-slate-600" : "text-blue-200/70"}`}
            >
              Competing Bids
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 ${isLightAppearance ? "border border-[rgba(200,180,150,0.3)] bg-[rgba(255,251,245,0.5)]" : "border border-blue-400/25 bg-blue-500/10"}`}
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
      {/* Bottom transition — blends into WhoWeServe periwinkle */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#f2f8ff]" : "bg-gradient-to-b from-transparent to-[#0c1c34]"}`}
      />
    </section>
  );
}
