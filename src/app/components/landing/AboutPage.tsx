import { Compass, ShieldCheck, Workflow } from "lucide-react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

type AboutPageProps = {
  onBackToHome: () => void;
};

const pillars = [
  {
    icon: Compass,
    title: "Clear Decision-Making",
    text: "Customers can review structured estimates, timing, and scope details before choosing a repair path.",
  },
  {
    icon: Workflow,
    title: "Shared Process",
    text: "Each report follows a consistent lifecycle so customers, shops, and insurers can coordinate work.",
  },
  {
    icon: ShieldCheck,
    title: "Operational Accountability",
    text: "Workflow events are logged to support service quality, partner operations, and follow-through.",
  },
];

export default function AboutPage({ onBackToHome }: AboutPageProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";
  const { ref: heroRef, isVisible } = useScrollAnimation(0.05);

  return (
    <main
      className={`relative min-h-screen overflow-hidden py-14 px-4 ${isLight ? "bg-gradient-to-b from-[#eef4fb] via-[#e6eef9] to-[#dde6f5]" : "dark bg-gradient-to-b from-[#08142b] via-[#0a1626] to-[#060d1c]"}`}
    >
      {/* Atmospheric depth — cool-blue calm-workspace tier (these pages are about, not marketing-cinema) */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`} aria-hidden>
        {isLight ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(96,165,250,0.10),transparent_70%)]" />
            <div className="absolute -top-10 right-[12%] w-80 h-80 bg-blue-300/[0.16] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-[8%] w-72 h-72 bg-sky-300/[0.14] rounded-full blur-[110px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(59,130,246,0.16),transparent_70%)]" />
            <div className="absolute -top-10 right-[12%] w-80 h-80 bg-blue-500/[0.14] rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-[8%] w-72 h-72 bg-indigo-500/[0.12] rounded-full blur-[110px]" />
          </>
        )}
      </div>

      <div className="max-w-5xl mx-auto relative" ref={heroRef}>
        <section
          className={`bd-glass-card bd-glass-card--landing p-8 md:p-10 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-md ${isLight ? "bg-blue-50/80 border-blue-200/60 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_0_0_1px_rgba(191,219,254,0.30)]" : "bg-blue-500/15 border-blue-400/30 text-blue-300 shadow-[inset_0_1px_0_rgba(147,197,253,0.18),0_0_0_1px_rgba(96,165,250,0.20)]"}`}
          >
            About BidOnDent
          </p>

          {/* Editorial flanking accent on H1 — cool-blue family (matches About page register) */}
          <div className="flex items-center gap-3 sm:gap-5 mt-5 mb-4">
            <h1
              className={`text-2xl sm:text-4xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              style={{
                textShadow: isLight
                  ? "0 1px 2px rgba(0,0,0,0.04)"
                  : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              Opportunity Through Transparency
            </h1>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] flex-1 max-w-[10rem] rounded-full"
              style={{
                background: isLight
                  ? "linear-gradient(90deg, rgba(37,99,235,0.85) 0%, rgba(96,165,250,0.45) 60%, transparent 100%)"
                  : "linear-gradient(90deg, rgba(96,165,250,0.90) 0%, rgba(59,130,246,0.50) 60%, transparent 100%)",
              }}
            />
          </div>

          <p className={`text-lg leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            BidOnDent is designed to remove friction from auto repair coordination by connecting
            customers, repair shops, and insurers in one structured workflow.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((item, idx) => (
            <article
              key={item.title}
              className={`bd-glass-card bd-glass-card--landing p-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${0.15 + idx * 0.08}s` }}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isLight
                    ? "bg-[linear-gradient(135deg,rgba(219,234,254,0.85)_0%,rgba(191,219,254,0.55)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_0_0_1px_rgba(147,197,253,0.30),0_4px_14px_rgba(59,130,246,0.10)]"
                    : "bg-[linear-gradient(135deg,rgba(37,99,235,0.18)_0%,rgba(59,130,246,0.10)_100%)] shadow-[inset_0_1px_0_rgba(147,197,253,0.18),0_0_0_1px_rgba(96,165,250,0.22),0_4px_18px_rgba(37,99,235,0.18)]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
              </div>
              <h2
                className={`text-xl font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                {item.title}
              </h2>
              <p className={`leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <section
          className={`mt-8 bd-glass-card bd-glass-card--landing p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.45s" }}
        >
          <p className={isLight ? "text-slate-700" : "text-slate-300"}>
            Questions about platform operations or rollout planning?
            <a
              href="mailto:bidondent@gmail.com"
              className={`ml-2 font-semibold transition-colors ${isLight ? "text-blue-700 hover:text-blue-800" : "text-blue-300 hover:text-blue-200"}`}
            >
              bidondent@gmail.com
            </a>
          </p>
          <button
            onClick={onBackToHome}
            type="button"
            className="bd-dashboard-primary-button inline-flex items-center justify-center px-5 py-2.5 text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60 min-h-[44px]"
            style={{
              background: "linear-gradient(135deg, #003d82 0%, #0ea5e9 100%)",
            }}
          >
            Back to Home
          </button>
        </section>
      </div>
    </main>
  );
}
