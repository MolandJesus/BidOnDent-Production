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
      iconBgDark: "#60a5fa",
      title: "For Customers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: primaryColor,
      borderColor: `${primaryColor}30`,
      checkColor: primaryColor,
      checkColorDark: "#60a5fa",
      // Pass E — role accent rim glow (alpha ≤ 0.15 per plan).
      // Customer = blue (matches user/action identity).
      accentRimLight: "inset 0 0 0 1px rgba(37,99,235,0.12), 0 8px 24px rgba(37,99,235,0.08)",
      accentRimDark: "inset 0 0 0 1px rgba(96,165,250,0.14), 0 10px 28px rgba(59,130,246,0.10)",
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
      iconBgDark: "#22d3ee",
      title: "For Repair Shops",
      borderHover: "hover:border-sky-300",
      gradientFrom: "from-sky-50",
      hoverBg: secondaryColor,
      borderColor: `${secondaryColor}30`,
      checkColor: secondaryColor,
      checkColorDark: "#22d3ee",
      // Shops = teal (matches service/skill identity).
      accentRimLight: "inset 0 0 0 1px rgba(0,160,233,0.12), 0 8px 24px rgba(0,160,233,0.08)",
      accentRimDark: "inset 0 0 0 1px rgba(34,211,238,0.14), 0 10px 28px rgba(34,211,238,0.10)",
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
      iconBgDark: "#93c5fd",
      title: "For Insurers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: "#1e3a5f",
      borderColor: "#bfdbfe",
      checkColor: "#1e3a5f",
      checkColorDark: "#93c5fd",
      // Insurer = subtle gold (trust/oversight, but restrained per plan).
      accentRimLight: "inset 0 0 0 1px rgba(220,150,60,0.13), 0 8px 24px rgba(220,150,60,0.08)",
      accentRimDark: "inset 0 0 0 1px rgba(220,150,60,0.15), 0 10px 28px rgba(220,150,60,0.10)",
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
      className="py-4 sm:py-8 md:py-10 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(178deg, #f2f8ff 0%, #eaf3ff 35%, #e4efff 70%, #dde9ff 100%)"
          : "linear-gradient(177deg, #0c1c34 0%, #10243e 45%, #0a1a30 100%)",
      }}
      ref={sectionRef}
    >
      {/* Pass G (KI-090) — section-level directional top-cast champagne
          lamp. LAW canon extension from cards to section backgrounds. */}
      <div className="bd-landing-section-toplamp" aria-hidden="true" />
      {/* Pass H9 — companion cool-blue bottom depth wash. */}
      <div className="bd-landing-section-bottomwash" aria-hidden="true" />
      {/* Edge blend */}
      <div
        className="absolute -top-px left-0 right-0 h-px"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to right, transparent, rgba(220, 150, 60, 0.28) 22%, rgba(56, 189, 248, 0.30) 50%, rgba(220, 150, 60, 0.28) 78%, transparent)"
            : "linear-gradient(to right, transparent, rgba(220, 150, 60, 0.28) 22%, rgba(96, 165, 250, 0.30) 50%, rgba(220, 150, 60, 0.28) 78%, transparent)",
        }}
      />
      {/* Pass 10 — atmospheric bloom-bridge at Benefits→WhoWeServe cool transition.
          Subtle sky-blue luminance at the top edge so the warm→cool register shift
          reads as a lighting change, not a hard cut. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(56,189,248,0.12), transparent 70%)"
            : "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(96,165,250,0.14), transparent 70%)",
        }}
      />
      {/* Atmospheric depth — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Direction C luminance accent: royal blue, top-center */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "800px",
            height: "800px",
            top: "-220px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, rgba(37,99,235,0.16), transparent 65%)",
          }}
        />
        {isLightAppearance ? (
          <>
            {/* Pass I — atmospheric dot-grid + radials canon-swapped at
                SAME alpha. Pre-canon goldenrod -> canon champagne. */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(196,144,65,0.05)_1px,transparent_1px)] [background-size:36px_36px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(196,144,65,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_15%_70%,rgba(196,144,65,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_35%_at_70%_60%,rgba(196,144,65,0.14),transparent_50%)]" />
            <div className="absolute bottom-0 right-[20%] w-64 h-64 bg-[rgba(196,144,65,0.18)] rounded-full blur-[110px]" />
            <div className="absolute top-10 left-[15%] w-48 h-48 bg-[rgba(196,144,65,0.14)] rounded-full blur-[120px]" />
            <div className="absolute -top-10 right-[0%] w-[30rem] h-[30rem] bg-sky-400/[0.18] rounded-full blur-[130px]" />
            <div className="absolute bottom-0 left-[10%] w-80 h-80 bg-blue-300/[0.14] rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.07)_1px,transparent_1px)] [background-size:36px_36px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_-5%,rgba(59,130,246,0.20),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_15%_75%,rgba(99,102,241,0.14),transparent_55%)]" />
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400/[0.16] rounded-full blur-[120px]" />
            <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-indigo-400/[0.12] rounded-full blur-[110px]" />
            {/* Subtle gold lamp accent — single warm light source threading
                gold identity through the cool register. */}
            <div
              className="absolute top-1/3 left-[10%] w-72 h-72 rounded-full blur-[130px] pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(220,150,60,0.13), transparent 65%)",
              }}
            />
          </>
        )}
      </div>

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-28 left-[8%] animate-orb-drift"
        style={{ animationDelay: "0s" }}
      >
        <div
          className={`w-7 h-7 rounded-full ${isLightAppearance ? "bg-sky-400/[0.14]" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 34px 12px rgba(56,189,248,0.18)"
              : "0 0 36px 12px rgba(59,130,246,0.25)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-20 right-[5%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-10 h-10 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-[rgba(225,240,255,0.50)] border border-[rgba(100,160,230,0.32)] backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 22px rgba(56,189,248,0.14), inset 0 1px 0 rgba(220,240,255,0.80)"
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
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-[rgba(196,144,65,0.10)]" : "bg-indigo-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 26px 9px rgba(196,144,65,0.12)"
              : "0 0 24px 8px rgba(99,102,241,0.22)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section badge */}
        <div
          className={`text-center mb-4 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium ${isLightAppearance ? "border border-[rgba(100,160,230,0.30)] bg-[rgba(230,244,255,0.60)] text-sky-700 shadow-[inset_0_1px_0_rgba(220,240,255,0.8)]" : "border border-blue-400/20 bg-blue-500/10 text-blue-200"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
            Everyone Wins
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          {/* Pass 14 — Direction C flanking accent: royal blue (WhoWeServe's
              assigned color in the locked palette). */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.10) 25%, rgba(37,99,235,0.85) 60%, rgba(37,99,235,0.55) 85%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.20) 25%, rgba(96,165,250,0.90) 60%, rgba(96,165,250,0.55) 85%, transparent 100%)",
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
              Who We Serve
            </h3>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.55) 15%, rgba(37,99,235,0.85) 40%, rgba(37,99,235,0.10) 75%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.55) 15%, rgba(96,165,250,0.90) 40%, rgba(96,165,250,0.20) 75%, transparent 100%)",
              }}
            />
          </div>
          <p
            className={`text-base sm:text-xl leading-relaxed ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"}`}
          >
            Solutions for everyone in the auto repair ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`bd-glass-card bd-glass-card--landing p-5 sm:p-6 transition-all duration-500 group relative ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                transitionDelay: `${0.3 + index * 0.15}s`,
              }}
            >
              {/* Pass E — role accent rim. Non-destructive overlay so the
                  bd-glass-card boxShadow stays intact. Inherits parent radius. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                  boxShadow: isLightAppearance ? card.accentRimLight : card.accentRimDark,
                }}
              />
              <div className="mb-4">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                  style={{
                    backgroundColor: isLightAppearance
                      ? `${card.iconBg}1A`
                      : `${card.iconBgDark}33`,
                    border: isLightAppearance
                      ? `1.5px solid ${card.iconBg}3D`
                      : `1.5px solid ${card.iconBgDark}66`,
                    boxShadow: isLightAppearance
                      ? `0 6px 22px ${card.iconBg}30, 0 0 30px ${card.iconBg}1A, inset 0 1px 0 rgba(255,255,255,0.65)`
                      : `0 0 24px ${card.iconBgDark}55, inset 0 1px 0 ${card.iconBgDark}33, inset 0 -1px 0 rgba(2,6,23,0.30)`,
                  }}
                >
                  <card.icon
                    className="w-7 h-7"
                    style={{ color: isLightAppearance ? card.iconBg : card.iconBgDark }}
                  />
                </div>
              </div>
              <h4
                className={`font-bold text-xl mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {card.title}
              </h4>
              <ul className="space-y-2">
                {card.items.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-200 ${isLightAppearance ? "hover:bg-[rgba(56,189,248,0.06)]" : "hover:bg-[rgba(96,165,250,0.06)]"}`}
                  >
                    <span
                      className="flex-shrink-0 mt-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isLightAppearance ? card.checkColor : card.checkColorDark,
                        boxShadow: isLightAppearance
                          ? `0 0 8px ${card.checkColor}66, 0 0 14px rgba(196, 144, 65, 0.18)`
                          : `0 0 10px ${card.checkColorDark}88, 0 0 16px rgba(196, 144, 65, 0.22)`,
                      }}
                    />
                    <span
                      className={`text-sm leading-snug ${isLightAppearance ? "text-slate-600" : "text-blue-100/75"}`}
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
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 ${isLightAppearance ? "border border-[rgba(100,160,230,0.30)] bg-[rgba(230,244,255,0.60)] shadow-[inset_0_1px_0_rgba(220,240,255,0.8)]" : "border border-blue-400/25 bg-blue-500/10"}`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isLightAppearance ? "text-sky-500" : "text-blue-400"}`}
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
      {/* Bottom transition — blends into adjacent cool section.
          Pass G (KI-090): #ffffff target replaced with cool blue-gray
          per LAW Light-Mode Surface Rule (no pure-white fades). */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#dde9ff]" : "bg-gradient-to-b from-transparent to-[#081834]"}`}
      />
    </section>
  );
}
