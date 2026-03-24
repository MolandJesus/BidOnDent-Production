import { CheckCircle2, Clock3, ShieldCheck, Workflow } from "lucide-react";

export default function TrustStatsSection() {
  const commitments = [
    {
      value: "Structured Intake",
      label: "Every request captured with required details",
      icon: Workflow,
    },
    {
      value: "Transparent Bids",
      label: "Comparable scope, cost, and estimated timeline",
      icon: CheckCircle2,
    },
    {
      value: "Operational Tracking",
      label: "Submission, bid, and status activity logged",
      icon: Clock3,
    },
    {
      value: "Review Controls",
      label: "Shop and partnership requests are confirmed by team",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-[#0c1929] to-[#1e3a5f] text-white relative overflow-hidden">
      {/* Soft top-edge transition from light sections above */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-100/10 to-transparent" />
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:26px_26px] opacity-25" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {commitments.map((item, index) => (
            <div
              key={item.label}
              className="group transition-all duration-300"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                <item.icon className="w-8 h-8 text-blue-300" />
              </div>
              <div className="text-2xl font-bold mb-2 tabular-nums flex items-center justify-center gap-2">
                {item.value}
              </div>
              <div className="text-blue-200 text-base">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
