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

export default function AboutOpportunitySection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section
      id="about-opportunity"
      className="py-20 bg-gradient-to-b from-white via-blue-50/20 to-blue-50/40"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            About BidOnDent
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold mt-5 mb-4">
            Opportunity Through Transparency
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We remove friction from the repair process by giving customers, shops, and insurers one
            structured workflow from intake to completed repair.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={item.title}
                className={`rounded-2xl bd-glass-card p-6 transition-all duration-700 ${
                  isExpanded ? "border-blue-200 shadow-md" : ""
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center mb-4 shadow-sm">
                  <item.icon className="w-6 h-6 text-[#003d82]" />
                </div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.text}</p>

                {/* Expanded detail — smooth slide-down */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? "max-h-48 opacity-100 mt-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm text-slate-500 leading-relaxed border-t border-blue-100/60 pt-4">
                    {item.expandedText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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

        <div className="mt-8 text-center">
          <a
            href="#/about"
            className="bd-glass-control inline-flex items-center justify-center font-medium"
          >
            Read Full About Overview
          </a>
        </div>
      </div>
    </section>
  );
}
