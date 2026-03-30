import { Car, Wrench, Shield, CheckCircle2 } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface WhoWeServeSectionProps {
  primaryColor: string;
  isLightAppearance?: boolean;
}

export default function WhoWeServeSection({
  primaryColor,
  isLightAppearance = false,
}: WhoWeServeSectionProps) {
  const secondaryColor = "#00a0e9";
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  const cards = [
    {
      icon: Car,
      iconBg: primaryColor,
      title: "For Customers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: primaryColor,
      borderColor: `${primaryColor}30`,
      checkColor: primaryColor,
      items: [
        "Submit damage reports with photos",
        "Compare multiple repair quotes",
        "Choose the best shop for you",
        "Track repair progress",
      ],
    },
    {
      icon: Wrench,
      iconBg: secondaryColor,
      title: "For Repair Shops",
      borderHover: "hover:border-sky-300",
      gradientFrom: "from-sky-50",
      hoverBg: secondaryColor,
      borderColor: `${secondaryColor}30`,
      checkColor: secondaryColor,
      items: [
        "Access new customer leads",
        "Submit competitive bids",
        "Manage jobs efficiently",
        "Grow your business",
      ],
    },
    {
      icon: Shield,
      iconBg: "#1e3a5f",
      title: "For Insurers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: "#1e3a5f",
      borderColor: "#bfdbfe",
      checkColor: "#1e3a5f",
      items: [
        "Streamline claims processing",
        "Access network of shops",
        "Receive multiple claim estimates",
        "Pay less for collision repair",
      ],
    },
  ];

  return (
    <section
      id="who-we-serve"
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(178deg, #edf1f7 0%, #f0f4fa 35%, #eaeff6 70%, #e8edf5 100%)"
          : "linear-gradient(177deg, #0c1c34 0%, #10243e 45%, #0a1a30 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-300/30" : "via-blue-400/25"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          {/* Subtle dot grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.03)_1px,transparent_1px)] [background-size:36px_36px] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(59,130,246,0.11),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_15%_70%,rgba(99,102,241,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_35%_at_70%_60%,rgba(255,191,105,0.07),transparent_50%)]" />
          <div className="absolute bottom-0 right-[20%] w-64 h-64 bg-blue-300/[0.12] rounded-full blur-[110px]" />
          <div className="absolute top-10 left-[15%] w-48 h-48 bg-indigo-300/[0.08] rounded-full blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.04)_1px,transparent_1px)] [background-size:36px_36px] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_-5%,rgba(59,130,246,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_15%_75%,rgba(99,102,241,0.08),transparent_55%)]" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400/[0.07] rounded-full blur-[120px]" />
          <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-indigo-400/[0.05] rounded-full blur-[110px]" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-28 left-[8%] animate-orb-drift"
        style={{ animationDelay: "0s" }}
      >
        <div
          className={`w-7 h-7 rounded-full ${isLightAppearance ? "bg-blue-400/30" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 34px 12px rgba(59,130,246,0.16)"
              : "0 0 36px 12px rgba(59,130,246,0.25)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-20 right-[5%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-10 h-10 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-white/45 border border-blue-300/25 backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 22px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.6)"
              : "0 0 20px rgba(59,130,246,0.12)",
          }}
        >
          <Shield
            className={`w-4 h-4 ${isLightAppearance ? "text-blue-500/60" : "text-blue-400/50"}`}
          />
        </div>
      </div>
      <div
        className="hidden md:block absolute top-48 right-[9%] animate-orb-float"
        style={{ animationDelay: "5s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-indigo-400/30" : "bg-indigo-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 26px 9px rgba(99,102,241,0.15)"
              : "0 0 24px 8px rgba(99,102,241,0.22)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border border-blue-200/30 bg-white/40 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" : "border border-blue-400/20 bg-blue-500/10 text-blue-200"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
            Everyone Wins
          </span>
        </div>

        <div
          className={`text-center mb-8 md:mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            Who We Serve
          </h3>
          <p
            className={`text-base sm:text-xl leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
          >
            Solutions for everyone in the auto repair ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`rounded-2xl p-5 sm:p-6 hover:shadow-xl transition-all duration-500 group hover:-translate-y-1 ${isLightAppearance ? "border border-slate-200/60 hover:border-blue-200/50" : "border border-blue-400/22 hover:border-blue-300/32"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(248, 250, 255, 0.55) 100%)"
                  : "linear-gradient(180deg, rgba(15, 30, 60, 0.35) 0%, rgba(14, 22, 38, 0.75) 100%)",
                boxShadow: isLightAppearance
                  ? "0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.08)"
                  : "0 8px 32px rgba(2, 6, 23, 0.50), inset 0 1px 0 rgba(96, 165, 250, 0.14), 0 0 0 1px rgba(96, 165, 250, 0.06)",
              }}
            >
              <div className="mb-4">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg shadow-sm"
                  style={{
                    backgroundColor: isLightAppearance
                      ? "rgba(59, 130, 246, 0.08)"
                      : "rgba(59, 130, 246, 0.15)",
                    border: isLightAppearance
                      ? "1px solid rgba(59, 130, 246, 0.15)"
                      : "1px solid rgba(96, 165, 250, 0.25)",
                    boxShadow: isLightAppearance
                      ? "0 0 10px rgba(59, 130, 246, 0.04)"
                      : "0 0 12px rgba(59, 130, 246, 0.1)",
                  }}
                >
                  <card.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h4
                className={`font-bold text-xl mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {card.title}
              </h4>
              <ul className="space-y-2.5">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                    <span
                      className={`text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Product truth badges */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          {[
            { text: "$0 for Customers" },
            { text: "NY Service Area" },
            { text: "Transparent Bidding" },
          ].map((badge) => (
            <div
              key={badge.text}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ${isLightAppearance ? "border border-blue-200/30 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" : "border border-blue-400/25 bg-blue-500/10"}`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isLightAppearance ? "text-blue-500" : "text-blue-400"}`}
              />
              <span
                className={`text-xs font-semibold ${isLightAppearance ? "text-slate-600" : "text-blue-200/70"}`}
              >
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
