type StepDescriptionProps = {
  primaryColor: string;
  description: string;
  incident: string;
  onDescriptionChange: (value: string) => void;
  onIncidentChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepDescription({
  primaryColor,
  description,
  incident,
  onDescriptionChange,
  onIncidentChange,
  onBack,
  onContinue
}: StepDescriptionProps) {
  return (
    <div className="px-4 py-5">
      <h2 className="text-xl font-bold mb-6">Damage Description</h2>
      <p className="text-gray-600 mb-6">
        Please describe the damage to your vehicle. Provide as much detail as possible.
      </p>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Front bumper has a dent on the passenger side and the paint is scratched..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-8">
        <label htmlFor="incident" className="block text-sm font-medium text-gray-700 mb-1">
          What happened? (Optional)
        </label>
        <textarea
          id="incident"
          name="incident"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="I was in a parking lot and..."
          value={incident}
          onChange={(e) => onIncidentChange(e.target.value)}
        ></textarea>
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
