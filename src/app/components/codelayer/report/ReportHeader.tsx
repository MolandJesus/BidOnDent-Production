import { FileText, X } from "lucide-react";

type ReportHeaderProps = {
  step: number;
  onCancel: () => void;
  showCancel: boolean;
};

export default function ReportHeader({ step, onCancel, showCancel }: ReportHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3.5 flex items-start sm:items-center gap-2.5">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight">
            Report Damage
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Tell us what happened and get bids faster
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="text-xs sm:text-sm text-slate-600 font-semibold px-2.5 py-1 rounded-full bg-slate-100 whitespace-nowrap">
          <span className="sm:hidden">{step}/5</span>
          <span className="hidden sm:inline">Step {step} of 5</span>
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}
