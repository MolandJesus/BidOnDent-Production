import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { ChevronRight, MapPin } from "lucide-react";

type DamageArea = {
  id: string;
  label: string;
};

type StepDamageAreaProps = {
  primaryColor: string;
  damageAreas: DamageArea[];
  damageArea: string;
  onSelectDamageArea: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepDamageArea({
  primaryColor,
  damageAreas,
  damageArea,
  onSelectDamageArea,
  onBack,
  onContinue,
}: StepDamageAreaProps) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Where is the damage?</h2>
      <p className="text-slate-600 mb-6">Choose the area that best matches what you see.</p>

      <div className="relative mb-6 bd-glass-card overflow-hidden max-w-md mx-auto md:max-w-sm">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          alt="Car diagram"
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Select one area
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {damageAreas.map((area) => (
          <button
            key={area.id}
            className={`py-2.5 px-3 text-sm border rounded-xl font-medium transition-all duration-200 ${
              damageArea === area.id
                ? "bg-blue-50 border-blue-400 text-blue-700 shadow-md ring-1 ring-blue-200"
                : "bg-white/80 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30"
            }`}
            onClick={() => onSelectDamageArea(area.id)}
          >
            {area.label}
          </button>
        ))}
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
