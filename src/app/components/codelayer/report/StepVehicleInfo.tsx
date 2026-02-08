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
  onContinue
}: StepVehicleInfoProps) {
  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-6">Report Vehicle Damage</h2>
      <p className="text-gray-600 mb-6">First, let's get information about your vehicle.</p>

      {vehicles && vehicles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select a saved vehicle</h3>
          <div className="space-y-2">
            {vehicles.map((savedVehicle: any) => (
              <button
                key={savedVehicle.id}
                onClick={() =>
                  onVehicleChange({
                    make: savedVehicle.make,
                    model: savedVehicle.model,
                    year: savedVehicle.year,
                    vin: savedVehicle.vin || ""
                  })
                }
                className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                  vehicle.make === savedVehicle.make &&
                  vehicle.model === savedVehicle.model &&
                  vehicle.year === savedVehicle.year
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium">
                  {savedVehicle.year} {savedVehicle.make} {savedVehicle.model}
                </div>
                {savedVehicle.licensePlate && (
                  <div className="text-sm text-gray-500">Plate: {savedVehicle.licensePlate}</div>
                )}
              </button>
            ))}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or enter vehicle manually</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            id="make"
            name="make"
            type="text"
            value={vehicle.make}
            onChange={(e) => onVehicleChange({ ...vehicle, make: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Toyota"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            value={vehicle.model}
            onChange={(e) => onVehicleChange({ ...vehicle, model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Camry"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="text"
            value={vehicle.year}
            onChange={(e) => onVehicleChange({ ...vehicle, year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="2021"
          />
        </div>

        <div className="mb-8">
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
            VIN (Optional)
          </label>
          <input
            id="vin"
            name="vin"
            type="text"
            value={vehicle.vin}
            onChange={(e) => onVehicleChange({ ...vehicle, vin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="1HGBH41JXMN109186"
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 px-4 rounded-md text-white font-medium"
        style={{ backgroundColor: primaryColor }}
        disabled={!vehicle.make || !vehicle.model || !vehicle.year}
      >
        Continue
      </button>
    </div>
  );
}
