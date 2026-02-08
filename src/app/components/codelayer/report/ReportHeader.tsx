type ReportHeaderProps = {
  step: number;
  onCancel: () => void;
  showCancel: boolean;
};

export default function ReportHeader({ step, onCancel, showCancel }: ReportHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center">
      <h1 className="font-bold">Report Damage</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-sm text-gray-500">Step {step} of 5</div>
        {showCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
