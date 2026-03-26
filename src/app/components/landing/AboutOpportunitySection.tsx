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
          ? "linear-gradient(180deg, #0c1a38 0%, #0e2046 40%, #0c1a3a 70%, #0a1836 100%)"
          : "linear-gradient(180deg, #081834 0%, #0c2040 50%, #071630 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-400/22" : "via-blue-400/25"} to-transparent`}
      />
      {/* Decorative depth elements */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_-10%,rgba(99,102,241,0.10),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_75%_90%,rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_55%_40%,rgba(255,191,105,0.03),transparent_50%)]" />
          <div className="absolute top-0 left-[25%] w-48 h-48 bg-indigo-400/[0.06] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_49px,rgba(59,130,246,0.02)_49px,rgba(59,130,246,0.02)_50px)] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_30%_-10%,rgba(59,130,246,0.06),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_75%_90%,rgba(37,99,235,0.07),transparent_55%)]" />
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-blue-500/[0.05] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-blue-400/[0.03] rounded-full blur-3xl" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-16 right-[6%] animate-orb-glow"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-blue-400/32" : "bg-blue-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 20px 6px rgba(59,130,246,0.15)"
              : "0 0 22px 7px rgba(59,130,246,0.18)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-24 left-[4%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLightAppearance ? "bg-indigo-500/12 border border-indigo-400/18" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 16px rgba(99,102,241,0.10)"
              : "0 0 18px rgba(59,130,246,0.12)",
          }}
        >
          <Compass
            className={`w-3.5 h-3.5 ${isLightAppearance ? "text-indigo-400/55" : "text-blue-400/50"}`}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${isLightAppearance ? "border border-blue-400/22 bg-blue-500/8 text-blue-200 backdrop-blur-sm" : "border border-blue-400/20 bg-blue-500/10 text-blue-200 backdrop-blur-sm"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isLightAppearance ? "bg-blue-400" : "bg-blue-400"}`}
            />
            About BidOnDent
          </span>
          <h3
            className={`text-3xl sm:text-4xl font-bold mt-5 mb-4 ${isLightAppearance ? "text-slate-100" : "text-white"}`}
          >
            Opportunity Through Transparency
          </h3>
          <p
            className={`text-base sm:text-xl leading-relaxed max-w-3xl mx-auto ${isLightAppearance ? "text-blue-100/75" : "text-blue-100/70"}`}
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
                className={`rounded-2xl p-5 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                  isLightAppearance
                    ? "border border-blue-300/20 backdrop-blur-sm"
                    : "border border-blue-400/22 backdrop-blur-sm"
                } ${isExpanded ? "shadow-md" : ""} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${0.2 + index * 0.1}s`,
                  background: isLightAppearance
                    ? "linear-gradient(180deg, rgba(15, 25, 50, 0.28) 0%, rgba(10, 14, 30, 0.70) 100%)"
                    : "linear-gradient(180deg, rgba(15, 25, 50, 0.30) 0%, rgba(10, 14, 30, 0.75) 100%)",
                  boxShadow: isLightAppearance
                    ? "0 8px 32px rgba(4, 10, 24, 0.45), inset 0 1px 0 rgba(96, 165, 250, 0.12), 0 0 0 1px rgba(96, 165, 250, 0.05)"
                    : "0 8px 32px rgba(2, 6, 23, 0.50), inset 0 1px 0 rgba(96, 165, 250, 0.13), 0 0 0 1px rgba(96, 165, 250, 0.06)",
                }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm ${isLightAppearance ? "bg-blue-500/[0.10] border border-blue-400/[0.18]" : "bg-blue-500/[0.08] border border-blue-400/[0.15]"}`}
                >
                  <item.icon
                    className={`w-6 h-6 ${isLightAppearance ? "text-blue-400" : "text-blue-300"}`}
                  />
                </div>
                <h4
                  className={`text-xl font-bold mb-2 ${isLightAppearance ? "text-slate-100" : "text-white"}`}
                >
                  {item.title}
                </h4>
                <p
                  className={`leading-relaxed ${isLightAppearance ? "text-blue-100/70" : "text-slate-300/80"}`}
                >
                  {item.text}
                </p>

                {/* Expanded detail */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed border-t pt-4 ${isLightAppearance ? "text-blue-100/65 border-white/[0.08]" : "text-slate-300/75 border-white/[0.1]"}`}
                  >
                    {item.expandedText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${isLightAppearance ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
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
            className={`inline-flex items-center justify-center font-semibold px-6 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base ${isLightAppearance ? "border border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/40 backdrop-blur-sm" : "border border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/40 backdrop-blur-sm"}`}
          >
            Read Full About Overview
          </a>
        </div>
      </div>
    </section>
  );
}
