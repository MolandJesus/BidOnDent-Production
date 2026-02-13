import { CheckCircle2 } from "lucide-react";

export default function ReportAutoSaveIndicator() {
  return (
    <div className="fixed bottom-24 right-4 bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in z-50 border border-emerald-400">
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-sm font-medium">Report Auto-Saved ✓</span>
    </div>
  );
}
