import { CheckCircle2, Clock3, ShieldCheck, Workflow } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function TrustStatsSection({
  isLightAppearance = false,
}: {
  isLightAppearance?: boolean;
}) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
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
      ref={sectionRef}
      className={`py-12 sm:py-16 md:py-20 relative overflow-hidden ${isLightAppearance ? "" : "text-white"}`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(176deg, #faf8f4 0%, #f7f5ef 40%, #f2efe8 70%, #ece8df 100%)"
          : "linear-gradient(176deg, #0e2448 0%, #152e58 50%, #102850 100%)",
      }}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-amber-300/25" : "via-blue-400/25"} to-transparent`}
      />
      {/* Decorative background elements — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {isLightAppearance ? (
          <>
            {/* Subtle dot grid texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(180,150,100,0.05)_1px,transparent_1px)] [background-size:20px_20px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_20%,rgba(210,175,120,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(200,160,80,0.14),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_50%,rgba(220,185,115,0.16),transparent_50%)]" />
            <div className="absolute top-0 right-[30%] w-64 h-64 bg-amber-200/[0.28] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[20%] w-48 h-48 bg-amber-100/[0.22] rounded-full blur-[120px]" />
            <div className="absolute top-0 left-[8%] w-80 h-80 bg-amber-300/[0.18] rounded-full blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:20px_20px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(59,130,246,0.26),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_20%_20%,rgba(99,102,241,0.22),transparent_50%)]" />
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-500/[0.22] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-400/[0.18] rounded-full blur-3xl" />
          </>
        )}
      </div>

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-12 left-[7%] animate-orb-breathe"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-amber-400/[0.12]" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 28px 10px rgba(200,160,80,0.14)"
              : "0 0 28px 10px rgba(59,130,246,0.24)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-10 right-[8%] animate-orb-float"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-amber-300/[0.10]" : "bg-indigo-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 24px 8px rgba(200,160,80,0.12)"
              : "0 0 22px 7px rgba(99,102,241,0.20)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-10">
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium mb-5 ${
              isLightAppearance
                ? "border border-[rgba(200,165,80,0.30)] bg-[rgba(255,248,235,0.55)] text-amber-700 shadow-[inset_0_1px_0_rgba(255,250,235,0.7)]"
                : "border border-blue-400/25 bg-blue-500/10 text-blue-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-amber-400" />
            Our Commitments
          </span>
          <h3
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            style={{
              textShadow: isLightAppearance
                ? "0 1px 2px rgba(0,0,0,0.05)"
                : "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            Built on Transparency
          </h3>
          <p
            className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
              isLightAppearance ? "text-slate-500" : "text-blue-100/70"
            }`}
          >
            Every interaction on BidOnDent follows the same structured process &mdash; no surprises,
            no hidden steps.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {commitments.map((item, index) => (
            <div
              key={item.label}
              className={`group h-full rounded-[1.75rem] border px-5 py-6 text-left backdrop-blur-xl transition-all duration-300 sm:px-6 sm:py-7 md:text-center ${isLightAppearance ? "border-[rgba(220,205,180,0.65)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,254,0.72))] shadow-[0_20px_48px_rgba(15,23,42,0.13)] hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(15,23,42,0.18)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,253,248,0.85))]" : "border-blue-300/16 bg-[linear-gradient(180deg,rgba(10,22,44,0.78),rgba(8,18,36,0.68))] shadow-[0_18px_38px_rgba(2,8,24,0.26)] hover:-translate-y-1 hover:border-blue-300/24 hover:bg-[linear-gradient(180deg,rgba(15,30,58,0.84),rgba(9,20,40,0.74))]"}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 ${isLightAppearance ? "bg-[rgba(251,242,222,0.72)] border-[rgba(200,155,70,0.30)] group-hover:bg-[rgba(253,246,228,0.88)]" : "bg-white/10 border-white/[0.07] group-hover:bg-white/15"}`}
                style={
                  isLightAppearance
                    ? {
                        boxShadow:
                          "0 4px 22px rgba(200, 155, 70, 0.22), 0 2px 8px rgba(200, 155, 70, 0.12), inset 0 1px 0 rgba(255, 252, 238, 0.80)",
                      }
                    : {
                        boxShadow:
                          "0 0 16px rgba(59, 130, 246, 0.07), inset 0 1px 0 rgba(96, 165, 250, 0.08)",
                      }
                }
              >
                <item.icon
                  className={`w-6 h-6 ${isLightAppearance ? "text-amber-600" : "text-blue-300"}`}
                />
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold mb-1.5 leading-tight ${isLightAppearance ? "text-slate-800" : ""}`}
              >
                {item.value}
              </div>
              <div
                className={`text-sm leading-relaxed md:mx-auto md:max-w-[180px] ${isLightAppearance ? "text-slate-500" : "text-slate-300/80"}`}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom transition — blends into Coverage Map cool blue-gray */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-28 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#f2f5f9]" : "bg-gradient-to-b from-transparent to-[#071830]"}`}
      />
    </section>
  );
}
