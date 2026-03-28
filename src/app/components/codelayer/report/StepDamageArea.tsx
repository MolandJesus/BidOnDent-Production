import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { ChevronRight, MapPin } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type DamageArea = {
  id: string;
  label: string;
};

type StepDamageAreaProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  damageAreas: DamageArea[];
  damageArea: string;
  onSelectDamageArea: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepDamageArea({
  primaryColor,
  appearanceMode = "map-dark",
  damageAreas,
  damageArea,
  onSelectDamageArea,
  onBack,
  onContinue,
}: StepDamageAreaProps) {
  const isLightAppearance = appearanceMode === "light";

  return (
    <div
      className={`px-4 md:px-6 py-4 md:py-4 bd-glass-card rounded-2xl${isLightAppearance ? " bd-light-surface" : ""}`}
    >
      <h2 className="text-2xl font-bold mb-1 text-slate-100">Where is the damage?</h2>
      <p className={`mb-6 ${isLightAppearance ? "text-blue-100/70" : "text-blue-100/80"}`}>
        Choose the area that best matches what you see.
      </p>

      <div
        className={`relative mb-6 bd-glass-card overflow-hidden max-w-md mx-auto md:max-w-sm${isLightAppearance ? " bd-light-surface" : ""}`}
      >
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
            type="button"
            key={area.id}
            className={`py-3 px-3 min-h-[44px] text-sm border rounded-xl font-medium transition-all duration-200 ${
              damageArea === area.id
                ? isLightAppearance
                  ? "bg-blue-400/12 border-blue-400 text-blue-100 ring-1 ring-blue-300/30"
                  : "bg-blue-400/12 border-blue-400 text-blue-100 ring-1 ring-blue-300/30"
                : isLightAppearance
                  ? "bg-white/[0.06] border-blue-300/15 text-blue-100/85 hover:border-blue-300/30 hover:bg-blue-400/12"
                  : "bg-slate-900/20 border-blue-300/20 text-blue-100/85 hover:border-blue-300/40 hover:bg-blue-400/12"
            }`}
            style={
              damageArea === area.id ? { boxShadow: "0 2px 12px rgba(59, 130, 246, 0.15)" } : {}
            }
            onClick={() => onSelectDamageArea(area.id)}
          >
            {area.label}
          </button>
        ))}
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          className={`flex-1 py-3 px-4 min-h-[44px] border rounded-xl font-medium transition-colors ${
            isLightAppearance
              ? "border-blue-300/15 text-slate-300 hover:bg-blue-500/10"
              : "border-blue-300/25 text-blue-100 hover:bg-blue-400/12"
          }`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25), 0 0 28px rgba(59, 130, 246, 0.08)",
          }}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
