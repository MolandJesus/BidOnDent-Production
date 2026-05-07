import { Car, ChevronRight } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type Vehicle = {
  make: string;
  model: string;
  year: string;
  vin?: string;
};

type SavedVehicle = Omit<Vehicle, "year"> & {
  id: string;
  year: number | string;
  licensePlate?: string;
};

type StepVehicleInfoProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  vehicles: SavedVehicle[];
  vehicle: Vehicle;
  onVehicleChange: (vehicle: Vehicle) => void;
  onContinue: () => void;
};

export default function StepVehicleInfo({
  primaryColor,
  appearanceMode = "map-dark",
  vehicles,
  vehicle,
  onVehicleChange,
  onContinue,
}: StepVehicleInfoProps) {
  const isLightAppearance = appearanceMode === "light";
  const normalizedMake = vehicle.make.trim();
  const normalizedModel = vehicle.model.trim();
  const normalizedYear = vehicle.year.trim();
  const parsedYear = Number(normalizedYear);
  const currentYear = new Date().getFullYear();
  const isValidYear =
    /^\d{4}$/.test(normalizedYear) && parsedYear >= 1980 && parsedYear <= currentYear + 1;
  const canContinue = Boolean(normalizedMake && normalizedModel && isValidYear);
  const hasSavedVehicles = vehicles.length > 0;

  return (
    <div className="bd-report-step px-4 sm:px-5 md:px-6 py-5 md:py-6">
      <div className="mx-auto max-w-[58rem]">
        <div className="mb-6 md:mb-7">
          <span className="bd-report-eyebrow mb-3">
            <Car className="w-3.5 h-3.5" />
            Vehicle profile
          </span>
          <h2
            className={`mb-1.5 text-[1.95rem] font-bold tracking-[-0.02em] ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
          >
            Tell us about your vehicle
          </h2>
          <p className={`max-w-2xl ${isLightAppearance ? "text-slate-500" : "text-blue-100/80"}`}>
            Use a saved vehicle or confirm the details you want shops to quote against.
          </p>
        </div>

        <div
          className={`grid gap-5 ${
            hasSavedVehicles
              ? "xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start"
              : ""
          }`}
        >
          {hasSavedVehicles && (
            <div className="bd-report-section p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3
                    className={`text-base font-semibold ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
                  >
                    Choose a saved vehicle
                  </h3>
                  <p
                    className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    Start with an existing vehicle, then adjust any field before you continue.
                  </p>
                </div>
                <span className="bd-report-eyebrow !px-3 !py-1.5 !text-[11px]">
                  {vehicles.length} saved
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {vehicles.map((savedVehicle) => (
                  <button
                    key={savedVehicle.id}
                    onClick={() =>
                      onVehicleChange({
                        make: savedVehicle.make,
                        model: savedVehicle.model,
                        year: String(savedVehicle.year),
                        vin: savedVehicle.vin ?? "",
                      })
                    }
                    className={`bd-report-choice w-full rounded-2xl p-4 text-left transition-all ${
                      vehicle.make === savedVehicle.make &&
                      vehicle.model === savedVehicle.model &&
                      vehicle.year === String(savedVehicle.year)
                        ? "bd-report-choice--active"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`inline-flex items-center gap-2 font-medium ${
                            isLightAppearance ? "text-slate-800" : "text-slate-100"
                          }`}
                        >
                          <Car
                            className={`w-4 h-4 ${isLightAppearance ? "text-blue-500" : "text-blue-300"}`}
                          />
                          {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                        </div>
                        {savedVehicle.licensePlate && (
                          <p
                            className={`mt-1 text-sm ${
                              isLightAppearance ? "text-slate-500" : "text-blue-100/70"
                            }`}
                          >
                            Plate: {savedVehicle.licensePlate}
                          </p>
                        )}
                      </div>
                      <span
                        className={`mt-0.5 text-xs font-semibold ${
                          isLightAppearance ? "text-slate-400" : "text-blue-200/60"
                        }`}
                      >
                        Use
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative mt-5 pt-5">
                <div className="absolute inset-x-0 top-0 flex items-center">
                  <div className="bd-report-divider-line w-full border-t"></div>
                </div>
                <div className="relative">
                  <span className="bd-report-divider-label inline-flex rounded-full px-3 py-1 text-xs backdrop-blur-sm">
                    Manual entry stays editable
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bd-report-section p-4 sm:p-5 md:p-6">
            <div className="mb-4">
              <h3
                className={`text-base font-semibold ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
              >
                {hasSavedVehicles ? "Confirm the details" : "Vehicle details"}
              </h3>
              <p
                className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
              >
                {hasSavedVehicles
                  ? "Selected details appear here and can be adjusted before shops see them."
                  : "Enter the vehicle information shops should use when they price the repair."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="make"
                  className={`block text-sm font-medium mb-1.5 ${
                    isLightAppearance ? "text-slate-700" : "text-blue-100/85"
                  }`}
                >
                  Make <span className="text-rose-500">*</span>
                </label>
                <input
                  id="make"
                  name="make"
                  type="text"
                  value={vehicle.make}
                  onChange={(e) => onVehicleChange({ ...vehicle, make: e.target.value })}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-slate-100"
                  }`}
                  placeholder="e.g. Toyota"
                />
              </div>

              <div>
                <label
                  htmlFor="model"
                  className={`block text-sm font-medium mb-1.5 ${
                    isLightAppearance ? "text-slate-700" : "text-blue-100/85"
                  }`}
                >
                  Model <span className="text-rose-500">*</span>
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  value={vehicle.model}
                  onChange={(e) => onVehicleChange({ ...vehicle, model: e.target.value })}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-slate-100"
                  }`}
                  placeholder="e.g. Camry"
                />
              </div>

              <div>
                <label
                  htmlFor="year"
                  className={`block text-sm font-medium mb-1.5 ${
                    isLightAppearance ? "text-slate-700" : "text-blue-100/85"
                  }`}
                >
                  Year <span className="text-rose-500">*</span>
                </label>
                <input
                  id="year"
                  name="year"
                  type="text"
                  value={vehicle.year}
                  onChange={(e) => onVehicleChange({ ...vehicle, year: e.target.value })}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-slate-100"
                  }`}
                  placeholder="e.g. 2021"
                  inputMode="numeric"
                  maxLength={4}
                />
                {normalizedYear.length > 0 && !isValidYear && (
                  <p className="mt-1 text-xs text-rose-600">
                    Enter a valid 4-digit year between 1980 and {currentYear + 1}.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vin"
                  className={`block text-sm font-medium mb-1.5 ${
                    isLightAppearance ? "text-slate-700" : "text-blue-100/85"
                  }`}
                >
                  VIN (Optional)
                </label>
                <input
                  id="vin"
                  name="vin"
                  type="text"
                  value={vehicle.vin ?? ""}
                  onChange={(e) =>
                    onVehicleChange({
                      ...vehicle,
                      vin: e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""),
                    })
                  }
                  maxLength={17}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-slate-100"
                  }`}
                  placeholder="1HGBH41JXMN109186"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onContinue}
            className="bd-report-primary-button inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[220px] sm:w-auto"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            }}
            disabled={!canContinue}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
