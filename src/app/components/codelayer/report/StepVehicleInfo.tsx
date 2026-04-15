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

  return (
    <div className="bd-report-step px-4 md:px-6 py-5 md:py-6">
      <div className="mb-8">
        <span className="bd-report-eyebrow mb-3">
          <Car className="w-3.5 h-3.5" />
          Vehicle profile
        </span>
        <h2
          className={`text-2xl font-bold mb-1 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
        >
          Tell us about your vehicle
        </h2>
        <p className={isLightAppearance ? "text-slate-500" : "text-blue-100/80"}>
          This helps local shops prepare accurate bids quickly.
        </p>
      </div>

      {vehicles && vehicles.length > 0 && (
        <div className="bd-report-section mb-6 p-4 sm:p-5">
          <h3
            className={`text-base font-semibold mb-3 ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
          >
            Pick a saved vehicle
          </h3>
          <div className="space-y-2.5">
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
                className={`bd-report-choice w-full p-3.5 rounded-2xl text-left transition-all ${
                  vehicle.make === savedVehicle.make &&
                  vehicle.model === savedVehicle.model &&
                  vehicle.year === String(savedVehicle.year)
                    ? "bd-report-choice--active"
                    : ""
                }`}
              >
                <div
                  className={`font-medium inline-flex items-center gap-2 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                >
                  <Car
                    className={`w-4 h-4 ${isLightAppearance ? "text-blue-500" : "text-blue-300"}`}
                  />
                  {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                </div>
                {savedVehicle.licensePlate && (
                  <div
                    className={`text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    Plate: {savedVehicle.licensePlate}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="bd-report-divider-line w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bd-report-divider-label px-3 py-1 rounded-full backdrop-blur-sm">
                Or enter details manually
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
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
            className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
            placeholder="Toyota"
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
            className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
            placeholder="Camry"
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
            className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
            placeholder="2021"
            inputMode="numeric"
            maxLength={4}
          />
          {normalizedYear.length > 0 && !isValidYear && (
            <p className="mt-1 text-xs text-rose-600">
              Enter a valid 4-digit year between 1980 and {currentYear + 1}.
            </p>
          )}
        </div>

        <div className="mb-8">
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
            className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
            placeholder="1HGBH41JXMN109186"
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="bd-report-primary-button w-full py-3 px-4 rounded-xl text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
        }}
        disabled={!canContinue}
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
