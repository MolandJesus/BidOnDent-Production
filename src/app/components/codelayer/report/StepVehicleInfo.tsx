import { Car, ChevronRight } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type Vehicle = {
  make: string;
  model: string;
  year: string;
  vin: string;
};

type StepVehicleInfoProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  vehicles: any[];
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
    <div
      className="px-4 md:px-6 py-4 md:py-4 bd-glass-card rounded-2xl"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(242, 248, 255, 0.94) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
        borderColor: isLightAppearance ? "rgba(191, 219, 254, 0.8)" : "rgba(96, 165, 250, 0.22)",
      }}
    >
      <div className="mb-6">
        <h2
          className={`text-2xl font-bold mb-1 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
        >
          Tell us about your vehicle
        </h2>
        <p className={isLightAppearance ? "text-slate-600" : "text-blue-100/80"}>
          This helps local shops prepare accurate bids quickly.
        </p>
      </div>

      {vehicles && vehicles.length > 0 && (
        <div
          className={`mb-6 bd-glass-card p-4 ${
            isLightAppearance
              ? "bg-white/80 border-blue-200/70"
              : "bg-slate-900/40 border-blue-200/20"
          }`}
        >
          <h3
            className={`text-sm font-medium mb-3 ${
              isLightAppearance ? "text-slate-700" : "text-blue-100/80"
            }`}
          >
            Pick a saved vehicle
          </h3>
          <div className="space-y-2.5">
            {vehicles.map((savedVehicle: any) => (
              <button
                key={savedVehicle.id}
                onClick={() =>
                  onVehicleChange({
                    make: savedVehicle.make,
                    model: savedVehicle.model,
                    year: savedVehicle.year,
                    vin: savedVehicle.vin || "",
                  })
                }
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  vehicle.make === savedVehicle.make &&
                  vehicle.model === savedVehicle.model &&
                  vehicle.year === savedVehicle.year
                    ? isLightAppearance
                      ? "border-blue-400 bg-blue-50"
                      : "border-blue-400 bg-blue-400/12"
                    : isLightAppearance
                      ? "border-blue-200/70 bg-white hover:border-blue-300"
                      : "border-blue-300/25 bg-slate-800/35 hover:border-blue-300/50"
                }`}
              >
                <div
                  className={`font-medium inline-flex items-center gap-2 ${
                    isLightAppearance ? "text-slate-900" : "text-slate-100"
                  }`}
                >
                  <Car className="w-4 h-4 text-blue-600" />
                  {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                </div>
                {savedVehicle.licensePlate && (
                  <div
                    className={`text-sm ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"}`}
                  >
                    Plate: {savedVehicle.licensePlate}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${isLightAppearance ? "border-blue-200" : "border-gray-300"}`}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-2 backdrop-blur-sm rounded ${
                  isLightAppearance
                    ? "bg-white/80 text-slate-500"
                    : "bg-slate-900/50 text-blue-100/70"
                }`}
              >
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
            className={`w-full px-3.5 py-2.5 border rounded-lg outline-none transition-all ${
              isLightAppearance
                ? "border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                : "border-blue-300/25 bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
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
            className={`w-full px-3.5 py-2.5 border rounded-lg outline-none transition-all ${
              isLightAppearance
                ? "border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                : "border-blue-300/25 bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
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
            className={`w-full px-3.5 py-2.5 border rounded-lg outline-none transition-all ${
              isLightAppearance
                ? "border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                : "border-blue-300/25 bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
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
            value={vehicle.vin}
            onChange={(e) => onVehicleChange({ ...vehicle, vin: e.target.value })}
            className={`w-full px-3.5 py-2.5 border rounded-lg outline-none transition-all ${
              isLightAppearance
                ? "border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                : "border-blue-300/25 bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
            }`}
            placeholder="1HGBH41JXMN109186"
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 px-4 rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
          boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25), 0 0 28px rgba(59, 130, 246, 0.08)",
        }}
        disabled={!canContinue}
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
