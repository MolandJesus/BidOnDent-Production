import { Compass, ShieldCheck, Workflow } from "lucide-react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

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
  return (
    <main
      className={`min-h-screen bg-gradient-to-b py-14 px-4 ${isLight ? "from-slate-50 to-slate-100/80" : "from-slate-900 to-slate-800/90"}`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="bd-glass-card p-8 md:p-10 mb-6">
          <p
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isLight ? "bg-blue-50 border border-blue-200 text-blue-700" : "bg-blue-900/30 border border-blue-700/50 text-blue-300"}`}
          >
            About BidOnDent
          </p>
          <h1
            className={`text-2xl sm:text-4xl font-bold mt-4 mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Opportunity Through Transparency
          </h1>
          <p className={`text-lg leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            BidOnDent is designed to remove friction from auto repair coordination by connecting
            customers, repair shops, and insurers in one structured workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((item) => (
            <article key={item.title} className="bd-glass-card p-6">
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-slate-700 bg-slate-800"}`}
              >
                <item.icon className={`w-5 h-5 ${isLight ? "text-slate-700" : "text-blue-400"}`} />
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

        <div className="mt-8 bd-glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className={isLight ? "text-slate-700" : "text-slate-300"}>
            Questions about platform operations or rollout planning?
            <a
              href="mailto:bidondent@gmail.com"
              className={`ml-2 font-semibold ${isLight ? "text-blue-700 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"}`}
            >
              bidondent@gmail.com
            </a>
          </p>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #003d82 0%, #0ea5e9 100%)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
