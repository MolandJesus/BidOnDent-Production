import { ChevronDown, Compass, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const cards = [
  {
    icon: Compass,
    title: "Clear Decision-Making",
    text: "Customers can review structured bids, timing, and scope details before selecting a shop.",
    expandedText:
      "Every bid is formatted the same way — scope description, estimated labor hours, parts cost, and projected completion time. You see all options side by side so the comparison is straightforward, not a guessing game.",
  },
  {
    icon: Workflow,
    title: "Shared Process",
    text: "Every request follows a consistent process so all parties understand what happens next.",
    expandedText:
      "From intake submission to bid review to accepted repair, each transition is structured and logged. Shops know exactly when to respond. Customers know when to expect bids. There is no phone tag, no dropped context, no silent limbo.",
  },
  {
    icon: ShieldCheck,
    title: "Accountability",
    text: "Every submission and status update is recorded to support operations, reporting, and quality control.",
    expandedText:
      "Every intake form, accepted bid, and status change is timestamped and tied to a unique request ID. This creates a complete audit trail that supports insurance reconciliation, shop performance tracking, and customer follow-up programs.",
  },
];

export default function AboutOpportunitySection({
  isLightAppearance = false,
}: {
  isLightAppearance?: boolean;
}) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section
      id="about-opportunity"
      className={`py-12 sm:py-16 md:py-20 relative overflow-hidden ${isLightAppearance ? "" : "dark"}`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #ffffff 0%, #fdfcfb 40%, #f9f8f7 70%, #f5f4f2 100%)"
          : "linear-gradient(180deg, #081834 0%, #0c2040 50%, #071630 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-amber-300/25" : "via-blue-400/25"} to-transparent`}
      />
      {/* Decorative depth elements — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Direction C luminance accent: cobalt, bottom-right corner */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "700px",
            height: "700px",
            bottom: "-180px",
            right: "-180px",
            background: "radial-gradient(circle, rgba(30,58,138,0.18), transparent 65%)",
          }}
        />
        {isLightAppearance ? (
          <>
            {/* Subtle diagonal stripe texture */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_49px,rgba(200,170,110,0.05)_49px,rgba(200,170,110,0.05)_50px)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-10%,rgba(210,180,130,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_75%_90%,rgba(200,165,100,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_55%_40%,rgba(220,185,115,0.14),transparent_50%)]" />
            <div className="absolute top-0 left-[25%] w-64 h-64 bg-amber-200/[0.18] rounded-full blur-[110px]" />
            <div className="absolute bottom-0 right-[15%] w-48 h-48 bg-amber-100/[0.14] rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_49px,rgba(59,130,246,0.06)_49px,rgba(59,130,246,0.06)_50px)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-10%,rgba(59,130,246,0.20),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_75%_90%,rgba(37,99,235,0.18),transparent_55%)]" />
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/[0.18] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400/[0.14] rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-16 right-[6%] animate-orb-glow"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-amber-400/[0.12]" : "bg-blue-400/50"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 30px 10px rgba(200,165,100,0.14)"
              : "0 0 30px 10px rgba(59,130,246,0.26)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-24 left-[4%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-9 h-9 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-[rgba(255,251,245,0.45)] border border-[rgba(200,180,150,0.22)] backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 20px rgba(200,165,100,0.10), inset 0 1px 0 rgba(255,250,240,0.7)"
              : "0 0 18px rgba(59,130,246,0.12)",
          }}
        >
          <Compass
            className={`w-3.5 h-3.5 ${isLightAppearance ? "text-amber-600/50" : "text-blue-400/50"}`}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${isLightAppearance ? "border border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.4)] text-blue-700 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,250,240,0.6)]" : "border border-blue-400/20 bg-blue-500/10 text-blue-200 backdrop-blur-sm"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
            About BidOnDent
          </span>
          {/* Pass 14/15 — Direction C flanking accent: cobalt-family for
              AboutOpportunity. Pass 15 light-mode tuning: swapped from cobalt
              rgba(30,58,138) (too dark to register on white) to royal blue
              rgba(37,99,235) — same cool family, brighter saturation,
              actually visible on cream/white bg. Dark mode unchanged. */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mt-5 mb-4">
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.10) 25%, rgba(37,99,235,0.85) 60%, rgba(37,99,235,0.55) 85%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.20) 25%, rgba(96,165,250,0.85) 60%, rgba(96,165,250,0.50) 85%, transparent 100%)",
              }}
            />
            <h3
              className={`text-3xl sm:text-4xl font-bold ${isLightAppearance ? "text-slate-800" : "text-white"}`}
              style={{
                textShadow: isLightAppearance
                  ? "0 1px 2px rgba(0,0,0,0.05)"
                  : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              Opportunity Through Transparency
            </h3>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background: isLightAppearance
                  ? "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.55) 15%, rgba(37,99,235,0.85) 40%, rgba(37,99,235,0.10) 75%, transparent 100%)"
                  : "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.50) 15%, rgba(96,165,250,0.85) 40%, rgba(96,165,250,0.20) 75%, transparent 100%)",
              }}
            />
          </div>
          <p
            className={`text-base sm:text-xl leading-relaxed max-w-3xl mx-auto ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
          >
            We remove friction from the repair process by giving customers, shops, and insurers one
            structured workflow from intake to completed repair.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {cards.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={item.title}
                className={`bd-glass-card bd-glass-card--landing p-5 transition-all duration-700 group relative overflow-hidden ${isExpanded ? "shadow-md" : ""} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
              >
                {/* Pass 9 — inner lit highlight: gives card surface a subtle "lit from within"
                    feel so it reads as glass plate, not outlined panel.
                    Pass 11 — bumped light-mode highlight from 0.06 to 0.10 for richer
                    dimensional feel without becoming loud. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none rounded-[inherit]"
                  style={{
                    background: isLightAppearance
                      ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(96,165,250,0.10), transparent 70%)"
                      : "radial-gradient(ellipse 90% 65% at 50% 0%, rgba(96,165,250,0.10), transparent 70%)",
                  }}
                />
                <div
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLightAppearance ? "bg-blue-500/[0.10] border border-blue-300/[0.22]" : "bg-blue-500/[0.14] border border-blue-400/[0.28]"}`}
                  style={{
                    /* D8: subtle warm gold inset bottom + warm halo so the icon
                       plate joins the gold-lamp family. Cool blue dominance
                       preserved (cool drop + cool halo unchanged). */
                    boxShadow: isLightAppearance
                      ? "0 6px 22px rgba(59,130,246,0.16), 0 0 30px rgba(59,130,246,0.10), inset 0 1px 0 rgba(255,255,255,0.60), inset 0 -1px 0 rgba(220,165,90,0.16), 0 0 22px rgba(220,140,50,0.12)"
                      : "0 6px 22px rgba(59,130,246,0.26), 0 0 32px rgba(59,130,246,0.18), inset 0 1px 0 rgba(147,197,253,0.28), inset 0 -1px 0 rgba(220,165,90,0.18), 0 0 26px rgba(220,140,50,0.16)",
                  }}
                >
                  <item.icon
                    className={`w-7 h-7 ${isLightAppearance ? "text-blue-500" : "text-blue-300"}`}
                  />
                </div>
                <h4
                  className={`relative text-xl font-bold mb-2 ${isLightAppearance ? "text-slate-800" : "text-white"}`}
                >
                  {item.title}
                </h4>
                <p
                  className={`relative leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-slate-300/80"}`}
                >
                  {item.text}
                </p>

                {/* Expanded detail */}
                <div
                  className={`relative overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed border-t pt-4 ${isLightAppearance ? "text-slate-400 border-[rgba(200,180,150,0.25)]" : "text-slate-300/75 border-white/[0.1]"}`}
                  >
                    {item.expandedText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className={`relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold min-h-[44px] py-2 transition-colors ${isLightAppearance ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
                >
                  {isExpanded ? "Show less" : "Learn more"}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#/about"
            className={`inline-flex items-center justify-center font-semibold px-6 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base border backdrop-blur-sm ${isLightAppearance ? "border-[rgba(200,180,150,0.3)] bg-[rgba(255,251,245,0.5)] text-blue-700 hover:bg-[rgba(255,251,245,0.7)] hover:border-[rgba(200,180,150,0.35)]" : "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/40"}`}
          >
            Read Full About Overview
          </a>
        </div>
      </div>
      {/* Bottom transition — blends into TrustStats warm off-white */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-28 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#faf8f4]" : "bg-gradient-to-b from-transparent to-[#0e2448]"}`}
      />
    </section>
  );
}
