import { Car, ChevronRight } from "lucide-react";

type Vehicle = {
  make: string;
  model: string;
  year: string;
  vin: string;
};

type StepVehicleInfoProps = {
  primaryColor: string;
  vehicles: any[];
  vehicle: Vehicle;
  onVehicleChange: (vehicle: Vehicle) => void;
  onContinue: () => void;
};

export default function StepVehicleInfo({
  primaryColor,
  vehicles,
  vehicle,
  onVehicleChange,
  onContinue,
}: StepVehicleInfoProps) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Tell us about your vehicle</h2>
        <p className="text-slate-600">This helps local shops prepare accurate bids quickly.</p>
      </div>

      {vehicles && vehicles.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Pick a saved vehicle</h3>
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
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-medium text-slate-900 inline-flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                </div>
                {savedVehicle.licensePlate && (
                  <div className="text-sm text-slate-500">Plate: {savedVehicle.licensePlate}</div>
                )}
              </button>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-500">Or enter details manually</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-slate-700 mb-1.5">
            Make
          </label>
          <input
            id="make"
            name="make"
            type="text"
            value={vehicle.make}
            onChange={(e) => onVehicleChange({ ...vehicle, make: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="Toyota"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-1.5">
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            value={vehicle.model}
            onChange={(e) => onVehicleChange({ ...vehicle, model: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="Camry"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1.5">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="text"
            value={vehicle.year}
            onChange={(e) => onVehicleChange({ ...vehicle, year: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="2021"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="vin" className="block text-sm font-medium text-slate-700 mb-1.5">
            VIN (Optional)
          </label>
          <input
            id="vin"
            name="vin"
            type="text"
            value={vehicle.vin}
            onChange={(e) => onVehicleChange({ ...vehicle, vin: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="1HGBH41JXMN109186"
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 px-4 rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
        disabled={!vehicle.make || !vehicle.model || !vehicle.year}
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
