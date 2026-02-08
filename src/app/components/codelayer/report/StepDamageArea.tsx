import { ImageWithFallback } from "../../figma/ImageWithFallback";

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
  onContinue
}: StepDamageAreaProps) {
  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-6">Select Damaged Areas</h2>
      <p className="text-gray-600 mb-6">Tap the areas of your vehicle that are damaged.</p>

      <div className="relative mb-8 bg-gray-100 rounded-lg overflow-hidden max-w-md mx-auto md:max-w-sm">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          alt="Car diagram"
          className="w-full aspect-[4/3] object-cover"
        />

        <div className="grid grid-cols-3 gap-2 mt-4">
          {damageAreas.map((area) => (
            <button
              key={area.id}
              className={`py-2 px-3 text-sm border rounded-md ${
                damageArea === area.id
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
              onClick={() => onSelectDamageArea(area.id)}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-2 px-4 rounded-md text-white font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
