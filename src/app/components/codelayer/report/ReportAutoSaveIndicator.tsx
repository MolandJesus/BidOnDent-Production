import { CheckCircle2 } from "lucide-react";

export default function ReportAutoSaveIndicator() {
  return (
    <div className="fixed bottom-24 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in z-50">
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-sm font-medium">Report Auto-Saved ✓</span>
    </div>
  );
}
