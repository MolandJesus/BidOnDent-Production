import { CheckCircle2, Clock3, ShieldCheck, Workflow } from "lucide-react";

export default function TrustStatsSection({
  isLightAppearance = false,
}: {
  isLightAppearance?: boolean;
}) {
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
      className={`py-12 sm:py-16 md:py-20 relative overflow-hidden ${isLightAppearance ? "" : "text-white"}`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(176deg, #0c1e3e 0%, #10244a 40%, #0e2044 70%, #0c1a38 100%)"
          : "linear-gradient(176deg, #0e2448 0%, #152e58 50%, #102850 100%)",
      }}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-indigo-400/22" : "via-blue-400/25"} to-transparent`}
      />
      {/* Decorative background elements */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_20%,rgba(99,102,241,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_50%,rgba(255,191,105,0.03),transparent_50%)]" />
          <div className="absolute top-0 right-[30%] w-56 h-56 bg-blue-400/[0.05] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,130,246,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_20%,rgba(99,102,241,0.10),transparent_50%)]" />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/[0.10] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-400/[0.08] rounded-full blur-3xl" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-12 left-[7%] animate-orb-breathe"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full ${isLightAppearance ? "bg-blue-400/28" : "bg-blue-400/35"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 18px 5px rgba(59,130,246,0.14)"
              : "0 0 20px 6px rgba(59,130,246,0.18)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-10 right-[8%] animate-orb-float"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-3 h-3 rounded-full ${isLightAppearance ? "bg-indigo-400/25" : "bg-indigo-400/30"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 16px 4px rgba(99,102,241,0.11)"
              : "0 0 16px 4px rgba(99,102,241,0.15)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {commitments.map((item, index) => (
            <div
              key={item.label}
              className="group transition-all duration-300"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-sm mb-3 group-hover:scale-105 transition-all duration-300 border ${isLightAppearance ? "bg-white/10 border-white/[0.08] group-hover:bg-white/15" : "bg-white/10 border-white/[0.07] group-hover:bg-white/15"}`}
                style={
                  isLightAppearance
                    ? {
                        boxShadow:
                          "0 0 14px rgba(59, 130, 246, 0.06), inset 0 1px 0 rgba(96, 165, 250, 0.07)",
                      }
                    : {
                        boxShadow:
                          "0 0 16px rgba(59, 130, 246, 0.07), inset 0 1px 0 rgba(96, 165, 250, 0.08)",
                      }
                }
              >
                <item.icon
                  className={`w-6 h-6 ${isLightAppearance ? "text-blue-400" : "text-blue-300"}`}
                />
              </div>
              <div
                className={`text-lg sm:text-xl font-bold mb-1.5 leading-tight ${isLightAppearance ? "text-slate-100" : ""}`}
              >
                {item.value}
              </div>
              <div
                className={`text-sm leading-relaxed max-w-[180px] mx-auto ${isLightAppearance ? "text-blue-100/70" : "text-slate-300/80"}`}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
