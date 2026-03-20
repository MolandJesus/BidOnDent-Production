import { Compass, ShieldCheck, Workflow } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function AboutOpportunitySection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section id="about-opportunity" className="py-20 bg-white" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            About BidOnDent
          </span>
          <h3 className="text-4xl font-bold mt-5 mb-4">Opportunity Through Transparency</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We remove friction from the repair process by giving customers, shops, and insurers one
            structured workflow from intake to completed repair.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Compass,
              title: "Clear Decision-Making",
              text: "Customers can review structured bids, timing, and scope details before selecting a shop.",
            },
            {
              icon: Workflow,
              title: "Shared Process",
              text: "Every request follows a consistent process so all parties understand what happens next.",
            },
            {
              icon: ShieldCheck,
              title: "Accountability",
              text: "Submission and status events are captured to support operations, reporting, and quality control.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-slate-700" />
              </div>
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
