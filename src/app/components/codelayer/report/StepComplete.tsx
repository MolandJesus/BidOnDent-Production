import { ArrowRight, Check, ListChecks } from "lucide-react";

type StepCompleteProps = {
  primaryColor: string;
  onViewReports: () => void;
  onBackToDashboard: () => void;
};

export default function StepComplete({
  primaryColor,
  onViewReports,
  onBackToDashboard,
}: StepCompleteProps) {
  return (
    <div className="px-4 md:px-6 py-6 md:py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-emerald-500 shadow-sm">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Report submitted</h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Nice work. Shops in your area can now review your details and send bids.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3 inline-flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          What happens next
        </h3>
        <ul className="text-sm text-blue-900 space-y-2">
          <li>1. Local body shops review your report.</li>
          <li>2. You receive notifications as bids arrive.</li>
          <li>3. Compare bids and pick the best fit.</li>
          <li>4. Schedule your repair directly with the shop.</li>
        </ul>
      </div>

      <button
        onClick={onViewReports}
        className="w-full py-2.5 px-4 rounded-xl text-white font-medium mb-3 inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
      >
        View My Reports
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        onClick={onBackToDashboard}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-200/60 font-medium hover:bg-white/40 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
