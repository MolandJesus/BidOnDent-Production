import { Building2, FileCheck, Shield } from "lucide-react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

type InsurerPartnershipPageProps = {
  onBackToHome: () => void;
};

const focusAreas = [
  {
    icon: Shield,
    title: "Network Governance",
    text: "Coordinate approved repair partners with transparent lifecycle visibility and operational controls.",
  },
  {
    icon: FileCheck,
    title: "Claim Workflow Clarity",
    text: "Track report intake, bid activity, and selected repair outcomes through a single workflow model.",
  },
  {
    icon: Building2,
    title: "Partnership Onboarding",
    text: "Use structured intake and review workflows to onboard insurer relationships with confidence.",
  },
];

export default function InsurerPartnershipPage({ onBackToHome }: InsurerPartnershipPageProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";
  return (
    <main
      className={`min-h-screen py-14 px-4 ${isLight ? "bg-gradient-to-b from-[#eef4fb] via-[#e6eef9] to-[#dde6f5]" : "bg-gradient-to-b from-[#08142b] via-[#0a1626] to-[#060d1c]"}`}
    >
      <div className="max-w-5xl mx-auto">
        <section className="bd-glass-card p-8 md:p-10 mb-6">
          <p
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isLight ? "bg-blue-50 border border-blue-200 text-blue-700" : "bg-blue-900/30 border border-blue-700/50 text-blue-300"}`}
          >
            Insurer Partnership
          </p>
          <h1
            className={`text-2xl sm:text-4xl font-bold mt-4 mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Partner With BidOnDent
          </h1>
          <p className={`text-lg leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            We help insurers collaborate with repair shops and customers through a standardized,
            trackable process that improves coordination and decision quality.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-5 mb-6">
          {focusAreas.map((item) => (
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
        </section>

        <section className="bd-glass-card p-6 md:p-8">
          <h2
            className={`text-xl font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Start a Partnership Conversation
          </h2>
          <p className={`mb-3 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Contact us and our team will coordinate next steps for operational fit and onboarding.
          </p>
          <a
            href="mailto:bidondent@gmail.com"
            className={`font-semibold ${isLight ? "text-blue-700 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"}`}
          >
            bidondent@gmail.com
          </a>
          <div className="mt-5">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg"
              style={{ background: "linear-gradient(135deg, #003d82 0%, #0ea5e9 100%)" }}
            >
              Back to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
