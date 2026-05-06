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
      className="py-4 sm:py-8 md:py-10 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(182deg, #faf9f6 0%, #f5f4f0 42%, #f0eeea 100%)"
          : "linear-gradient(182deg, var(--bd-warm-dark-amber-start) 0%, var(--bd-warm-dark-amber-mid) 42%, var(--bd-warm-dark-amber-end) 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className="absolute -top-px left-0 right-0 h-px"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to right, transparent, rgba(217, 119, 6, 0.25) 50%, transparent)"
            : "linear-gradient(to right, transparent, rgba(96, 165, 250, 0.22) 22%, rgba(220, 150, 60, 0.32) 50%, rgba(96, 165, 250, 0.22) 78%, transparent)",
        }}
      />
      {/* Pass 10 — atmospheric bloom-bridge at HowItWorks→Benefits warm transition.
          Subtle warm-amber luminance at the top edge so the cool→warm register shift
          reads as a lighting change, not a hard cut. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(196, 130, 45,0.16), transparent 70%)"
            : "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(180,90,30,0.20), transparent 70%)",
        }}
      />
      {/* Atmospheric depth — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Direction C luminance accent: warm amber, bottom-left corner (warm Direction B section) */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "750px",
            height: "750px",
            bottom: "-200px",
            left: "-200px",
            background: "radial-gradient(circle, rgba(200,120,30,0.20), transparent 65%)",
          }}
        />
        {isLightAppearance ? (
          <>
            {/* Cross-hatch (Branch A: deeper indigo) */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_34px,rgba(99,102,241,0.06)_34px,rgba(99,102,241,0.06)_35px),repeating-linear-gradient(-45deg,transparent,transparent_34px,rgba(99,102,241,0.06)_34px,rgba(99,102,241,0.06)_35px)] opacity-90" />
            {/* Color atmosphere — deeper warm amber */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_25%_80%,rgba(230,180,100,0.26),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_80%_20%,rgba(220,160,80,0.28),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_50%,rgba(196, 144, 65,0.18),transparent_55%)]" />
            {/* Larger amber pools, deeper saturation */}
            <div className="absolute -top-10 right-[15%] w-72 h-72 bg-amber-300/[0.38] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-[10%] w-56 h-56 bg-amber-200/[0.30] rounded-full blur-[130px]" />
            <div className="absolute top-1/2 right-[30%] w-80 h-80 bg-amber-300/[0.24] rounded-full blur-[140px]" />
          </>
        ) : (
          <>
            {/* Direction B — Amber-Lit Garage: warm-dark amber atmosphere replaces indigo */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_34px,rgba(200,130,40,0.07)_34px,rgba(200,130,40,0.07)_35px),repeating-linear-gradient(-45deg,transparent,transparent_34px,rgba(200,130,40,0.07)_34px,rgba(200,130,40,0.07)_35px)] opacity-90" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 55% at 30% -10%, var(--bd-warm-dark-amber-ellipse-top), transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 75% 85%, var(--bd-warm-dark-amber-ellipse-bottom), transparent 55%)",
              }}
            />
            <div
              className="absolute -top-10 left-1/3 w-[26rem] h-[26rem] rounded-full blur-[140px]"
              style={{ background: "var(--bd-warm-dark-amber-pool)" }}
            />
            <div
              className="absolute bottom-0 right-[10%] w-80 h-80 rounded-full blur-[120px]"
              style={{ background: "var(--bd-warm-dark-amber-pool-soft)" }}
            />
          </>
        )}
      </div>

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
          className={`text-center mb-4 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border border-[rgba(200,165,80,0.30)] bg-[rgba(255,248,235,0.55)] text-amber-700 shadow-[inset_0_1px_0_rgba(255,250,235,0.7)]" : "border border-amber-400/45 bg-amber-500/[0.16] text-amber-100 shadow-[inset_0_1px_0_rgba(255,232,180,0.18),0_0_24px_rgba(240,170,70,0.18)]"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-[rgb(252,240,208)] shadow-[0_0_10px_rgba(196,144,65,0.75)]" />
            Built for Real Repairs
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          {/* Pass 13 — metallic-gold flanking accent extended to Benefits H3.
              Benefits is the second warm Direction B section in the locked
              palette (TrustStats got the same treatment in Pass 12). Cool
              sections do not get gold per the locked Direction C palette
              (gold belongs only to warm-register sections).
              Hidden below sm: to avoid clutter on mobile. */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(140,82,22,0.10) 25%, rgba(196,144,65,0.85) 60%, rgba(140,82,22,0.55) 85%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(196,130,45,0.20) 25%, rgba(252,240,208,0.90) 60%, rgba(196,144,65,0.55) 85%, transparent 100%)",
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
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(140,82,22,0.55) 15%, rgba(196,144,65,0.85) 40%, rgba(140,82,22,0.10) 75%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(196,144,65,0.55) 15%, rgba(252,240,208,0.90) 40%, rgba(196,130,45,0.20) 75%, transparent 100%)",
              }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`bd-glass-card bd-glass-card--landing-warm p-4 sm:p-5 transition-all duration-500 group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
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
                {/* Pass E — one-shot gold sheen on hover. Sweeps once per
                    hover then resets; reduced-motion-safe via theme.css guard. */}
                <span aria-hidden="true" className="bd-gold-sheen-hover rounded-lg" />
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
      {/* V3a — Section seam gradient bridge (Benefits → WhoWeServe).
          The warm Direction B floor fades through a desaturated mid-stop
          before resolving into the cool periwinkle/navy of WhoWeServe so
          the temperature shift reads as a lighting change, not a hard cut.
          A faint champagne hairline at the very edge catches light against
          the lower bezel of the section. */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to bottom, transparent 0%, rgba(232,228,220,0.55) 35%, rgba(228,232,242,0.85) 70%, #f2f8ff 100%)"
            : "linear-gradient(to bottom, transparent 0%, rgba(28,30,42,0.55) 32%, rgba(15,24,46,0.85) 70%, #0c1c34 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to right, transparent, rgba(196, 144, 65,0.22) 50%, transparent)"
            : "linear-gradient(to right, transparent, rgba(196, 144, 65,0.28) 50%, transparent)",
        }}
      />
    </section>
  );
}
