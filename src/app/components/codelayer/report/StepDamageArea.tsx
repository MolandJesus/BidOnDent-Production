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
    <div className="bd-report-step px-4 md:px-6 py-5 md:py-6">
      <span className="bd-report-eyebrow mb-3">
        <MapPin className="w-3.5 h-3.5" />
        Damage zone
      </span>
      <h2
        className={`text-2xl font-bold mb-1 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
      >
        Where is the damage?
      </h2>
      <p className={`mb-6 ${isLightAppearance ? "text-slate-500" : "text-blue-100/80"}`}>
        Choose the area that best matches what you see.
      </p>

      <div className="bd-report-section relative mb-8 overflow-hidden max-w-md mx-auto md:max-w-sm">
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
            className={`bd-report-choice py-3 px-3 min-h-[44px] text-sm rounded-xl font-medium transition-all duration-200 ${
              damageArea === area.id
                ? `bd-report-choice--active ${isLightAppearance ? "text-blue-700" : "text-blue-100"}`
                : isLightAppearance
                  ? "text-slate-700"
                  : "text-blue-100/85"
            }`}
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
          className="bd-report-secondary-button flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="bd-report-primary-button flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold inline-flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
          }}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
