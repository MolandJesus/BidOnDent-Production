import { Building2, FileCheck, Shield } from "lucide-react";

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
  return (
    <main className="min-h-screen bg-slate-50 py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm mb-6">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-sm text-blue-700 font-medium">
            Insurer Partnership
          </p>
          <h1 className="text-4xl font-bold text-slate-900 mt-4 mb-4">Partner With BidOnDent</h1>
          <p className="text-slate-700 text-lg leading-relaxed">
            We help insurers collaborate with repair shops and customers through a standardized,
            trackable process that improves coordination and decision quality.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-5 mb-6">
          {focusAreas.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Start a Partnership Conversation</h2>
          <p className="text-slate-600 mb-3">
            Contact us and our team will coordinate next steps for operational fit and onboarding.
          </p>
          <a href="mailto:bidondent@gmail.com" className="text-blue-700 font-semibold hover:text-blue-800">
            bidondent@gmail.com
          </a>
          <div className="mt-5">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2.5 font-medium hover:bg-slate-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
