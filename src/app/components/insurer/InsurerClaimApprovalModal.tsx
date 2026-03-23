import { type ClaimData } from "./insurerClaimsUtils";

type InsurerClaimApprovalModalProps = {
  selectedClaim: ClaimData;
  approvalAmount: string;
  primaryColor: string;
  onApprovalAmountChange: (value: string) => void;
  onApprove: () => void;
  onCancel: () => void;
};

export default function InsurerClaimApprovalModal({
  selectedClaim,
  approvalAmount,
  primaryColor,
  onApprovalAmountChange,
  onApprove,
  onCancel,
}: InsurerClaimApprovalModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Review & Approve Claim</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedClaim.claimNumber} - {selectedClaim.customerName}
          </p>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Vehicle</p>
                <p className="font-medium">{selectedClaim.vehicle}</p>
              </div>
              <div>
                <p className="text-gray-600">Policy #</p>
                <p className="font-medium">{selectedClaim.policyNumber}</p>
              </div>
              <div>
                <p className="text-gray-600">Incident Date</p>
                <p className="font-medium">{selectedClaim.incidentDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Est. Damage</p>
                <p className="font-medium">${selectedClaim.estimatedDamage.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Approved Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                value={approvalAmount}
                onChange={(e) => onApprovalAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg"
                step="0.01"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Adjust the approved amount based on shop bids and policy coverage
            </p>
          </div>

          {selectedClaim.shopBids && selectedClaim.shopBids.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Recommended Shops:</p>
              <div className="space-y-1">
                {selectedClaim.shopBids.slice(0, 3).map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-blue-700">{bid.shopName}</span>
                    <span className="font-medium text-blue-900">
                      ${bid.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onCancel} className="bd-glass-control--secondary flex-1 py-3">
              Cancel
            </button>
            <button
              onClick={onApprove}
              disabled={!approvalAmount || parseFloat(approvalAmount) <= 0}
              className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              Approve Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
