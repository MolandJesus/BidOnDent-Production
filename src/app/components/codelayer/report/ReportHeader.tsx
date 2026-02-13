import { FileText, X } from "lucide-react";

type ReportHeaderProps = {
  step: number;
  onCancel: () => void;
  showCancel: boolean;
};

export default function ReportHeader({ step, onCancel, showCancel }: ReportHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 text-lg leading-none">Report Damage</h1>
          <p className="text-xs text-slate-500 mt-1">Tell us what happened and get bids faster</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-sm text-slate-600 font-medium px-2.5 py-1 rounded-full bg-slate-100">
          Step {step} of 5
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
