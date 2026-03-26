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
    <section
      className="py-10 md:py-16 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f1f3d 50%, #0c1a30 100%)" }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px] opacity-20" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/12 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {commitments.map((item, index) => (
            <div
              key={item.label}
              className="group transition-all duration-300"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-3 group-hover:bg-white/15 transition-all duration-300 group-hover:scale-105 border border-white/[0.07]"
                style={{
                  boxShadow:
                    "0 0 16px rgba(59, 130, 246, 0.07), inset 0 1px 0 rgba(96, 165, 250, 0.08)",
                }}
              >
                <item.icon className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-lg sm:text-xl font-bold mb-1.5 leading-tight">{item.value}</div>
              <div className="text-slate-300/80 text-sm leading-relaxed max-w-[180px] mx-auto">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
