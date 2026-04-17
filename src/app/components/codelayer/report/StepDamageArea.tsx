import CarDiagram from "./CarDiagram";
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
    <div className="bd-report-step px-4 sm:px-5 md:px-6 py-5 md:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 md:mb-7">
          <span className="bd-report-eyebrow mb-3">
            <MapPin className="w-3.5 h-3.5" />
            Damage zone
          </span>
          <h2
            className={`mb-1.5 text-[1.95rem] font-bold tracking-[-0.02em] ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
          >
            Where is the damage?
          </h2>
          <p className={`max-w-2xl ${isLightAppearance ? "text-slate-500" : "text-blue-100/80"}`}>
            Pick the strongest match so shops immediately understand where repair work starts.
          </p>
        </div>

        <div className="bd-report-section p-4 sm:p-5 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center">
            <div>
              <div
                className={`relative mx-auto max-w-md overflow-hidden rounded-[1.75rem] border p-4 sm:p-5 ${
                  isLightAppearance
                    ? "border-white/70 bg-white/45 shadow-[0_18px_38px_rgba(15,23,42,0.10)]"
                    : "border-white/10 bg-white/[0.03] shadow-[0_20px_40px_rgba(2,6,23,0.18)]"
                }`}
              >
                <CarDiagram
                  className="w-full"
                  selectedArea={damageArea}
                  appearanceMode={appearanceMode}
                />
                <div
                  className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${
                    isLightAppearance
                      ? "bg-white/88 text-slate-700 ring-1 ring-slate-200/80 shadow-sm"
                      : "bg-black/55 text-white"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Select one area
                </div>
              </div>
            </div>

            <div>
              <h3
                className={`text-base font-semibold ${isLightAppearance ? "text-slate-700" : "text-blue-100/85"}`}
              >
                Pick the closest match
              </h3>
              <p
                className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
              >
                You can explain exact panel damage later. For now, use the area that best anchors
                the estimate.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
                {damageAreas.map((area) => (
                  <button
                    type="button"
                    key={area.id}
                    className={`bd-report-choice min-h-[48px] rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onBack}
                  className="bd-report-secondary-button min-h-[48px] flex-1 rounded-2xl px-4 py-3 font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="bd-report-primary-button inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                  }}
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
