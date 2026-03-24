import { ArrowRight, Check, Clock, ListChecks, MessageSquare, Wrench } from "lucide-react";

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
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Report submitted</h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Nice work. Shops in your area can now review your details and send bids.
        </p>
      </div>

      <div className="bd-glass-card p-5 mb-8">
        <h3 className="font-bold text-slate-900 mb-4 inline-flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-600" />
          What happens next
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Shops review your report</p>
              <p className="text-xs text-slate-500">
                Local body shops see your damage details and photos
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Bids start arriving</p>
              <p className="text-xs text-slate-500">
                You receive notifications as shops send their estimates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Compare and choose</p>
              <p className="text-xs text-slate-500">
                Pick the best price, timeline, and shop — then schedule your repair
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewReports}
        className="w-full py-3 px-4 rounded-xl text-white font-semibold mb-3 inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
      >
        View My Reports
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        onClick={onBackToDashboard}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-200/60 font-medium hover:bg-slate-50/60 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
