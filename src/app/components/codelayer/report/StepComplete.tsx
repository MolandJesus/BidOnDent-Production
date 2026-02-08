import { Check } from "lucide-react";

type StepCompleteProps = {
  primaryColor: string;
  onViewReports: () => void;
  onBackToDashboard: () => void;
};

export default function StepComplete({
  primaryColor,
  onViewReports,
  onBackToDashboard
}: StepCompleteProps) {
  return (
    <div className="px-4 py-5">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ backgroundColor: "#34D399" }}
        >
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Report Submitted!</h2>
        <p className="text-gray-600">
          Your damage report has been submitted. Body shops in your area will review your
          information and submit bids.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>Local body shops will review your damage report</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>You'll receive notifications as bids come in</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Compare bids and select the best option for you</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Schedule your repair with your chosen shop</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onViewReports}
        className="w-full py-2 px-4 rounded-md text-white font-medium mb-3"
        style={{ backgroundColor: primaryColor }}
      >
        View My Reports
      </button>

      <button
        onClick={onBackToDashboard}
        className="w-full py-2 px-4 rounded-md border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
