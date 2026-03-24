import { Compass, ShieldCheck, Workflow } from "lucide-react";

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
  return (
    <main className="min-h-screen bg-slate-50 py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm mb-6">
          <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-sm text-blue-700 font-medium">
            About BidOnDent
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mt-4 mb-4">
            Opportunity Through Transparency
          </h1>
          <p className="text-slate-700 text-lg leading-relaxed">
            BidOnDent is designed to remove friction from auto repair coordination by connecting
            customers, repair shops, and insurers in one structured workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-slate-700">
            Questions about platform operations or rollout planning?
            <a
              href="mailto:bidondent@gmail.com"
              className="ml-2 text-blue-700 font-semibold hover:text-blue-800"
            >
              bidondent@gmail.com
            </a>
          </p>
          <button
            onClick={onBackToHome}
            className="bd-glass-control inline-flex items-center justify-center px-4 py-2.5"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
