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
          ? "linear-gradient(176deg, #edf1f8 0%, #f0f4fa 40%, #eaeff7 70%, #e8ecf4 100%)"
          : "linear-gradient(176deg, #0e2448 0%, #152e58 50%, #102850 100%)",
      }}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-indigo-300/30" : "via-blue-400/25"} to-transparent`}
      />
      {/* Decorative background elements */}
      {isLightAppearance ? (
        <>
          {/* Subtle dot grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.03)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_20%,rgba(99,102,241,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(59,130,246,0.10),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_50%,rgba(255,191,105,0.07),transparent_50%)]" />
          <div className="absolute top-0 right-[30%] w-64 h-64 bg-blue-300/[0.13] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-[20%] w-48 h-48 bg-indigo-300/[0.08] rounded-full blur-[120px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(59,130,246,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_20%_20%,rgba(99,102,241,0.14),transparent_50%)]" />
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-500/[0.14] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-400/[0.10] rounded-full blur-3xl" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-12 left-[7%] animate-orb-breathe"
        style={{ animationDelay: "2s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-blue-400/30" : "bg-blue-400/45"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 28px 10px rgba(59,130,246,0.16)"
              : "0 0 28px 10px rgba(59,130,246,0.24)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-10 right-[8%] animate-orb-float"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-indigo-400/28" : "bg-indigo-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 24px 8px rgba(99,102,241,0.14)"
              : "0 0 22px 7px rgba(99,102,241,0.20)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {commitments.map((item, index) => (
            <div
              key={item.label}
              className={`group h-full rounded-[1.75rem] border px-5 py-6 text-left backdrop-blur-xl transition-all duration-300 sm:px-6 sm:py-7 md:text-center ${isLightAppearance ? "border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(241,245,249,0.48))] shadow-[0_18px_38px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(241,245,249,0.58))]" : "border-blue-300/16 bg-[linear-gradient(180deg,rgba(10,22,44,0.78),rgba(8,18,36,0.68))] shadow-[0_18px_38px_rgba(2,8,24,0.26)] hover:-translate-y-1 hover:border-blue-300/24 hover:bg-[linear-gradient(180deg,rgba(15,30,58,0.84),rgba(9,20,40,0.74))]"}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 ${isLightAppearance ? "bg-white/50 border-blue-200/25 group-hover:bg-white/65" : "bg-white/10 border-white/[0.07] group-hover:bg-white/15"}`}
                style={
                  isLightAppearance
                    ? {
                        boxShadow:
                          "0 2px 12px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                      }
                    : {
                        boxShadow:
                          "0 0 16px rgba(59, 130, 246, 0.07), inset 0 1px 0 rgba(96, 165, 250, 0.08)",
                      }
                }
              >
                <item.icon
                  className={`w-6 h-6 ${isLightAppearance ? "text-blue-500" : "text-blue-300"}`}
                />
              </div>
              <div
                className={`text-lg sm:text-xl font-bold mb-1.5 leading-tight ${isLightAppearance ? "text-slate-800" : ""}`}
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
    </section>
  );
}
