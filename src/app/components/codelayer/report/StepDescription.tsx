import { ChevronRight, FileText, MessageSquareQuote } from "lucide-react";

type StepDescriptionProps = {
  primaryColor: string;
  description: string;
  incident: string;
  onDescriptionChange: (value: string) => void;
  onIncidentChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepDescription({
  primaryColor,
  description,
  incident,
  onDescriptionChange,
  onIncidentChange,
  onBack,
  onContinue,
}: StepDescriptionProps) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-4">
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">Describe the damage</h2>
      <p className="text-slate-600 mb-6">The better your details, the better your bids will be.</p>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700 mb-1.5 inline-flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          Damage details
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          placeholder="Front bumper has a dent on the passenger side and paint scratches near the corner..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-8">
        <label
          htmlFor="incident"
          className="text-sm font-medium text-slate-700 mb-1.5 inline-flex items-center gap-1.5"
        >
          <MessageSquareQuote className="w-4 h-4" />
          What happened? (Optional)
        </label>
        <textarea
          id="incident"
          name="incident"
          rows={3}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          placeholder="I was backing out in a parking lot and clipped a pole..."
          value={incident}
          onChange={(e) => onIncidentChange(e.target.value)}
        ></textarea>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 px-4 border border-slate-200/60 rounded-xl font-medium hover:bg-white/40 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-2.5 px-4 rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
