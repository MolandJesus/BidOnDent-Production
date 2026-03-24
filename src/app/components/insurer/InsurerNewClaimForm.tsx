import type { ClaimShop, Policyholder } from "./newClaimData";

export type ClaimFormData = {
  policyNumber: string;
  incidentDate: string;
  damageDescription: string;
  estimatedAmount: string;
  priority: string;
};

type InsurerNewClaimFormProps = {
  selectedCustomer: Policyholder;
  selectedShop: ClaimShop | null;
  claimFormData: ClaimFormData;
  primaryColor: string;
  onUpdate: (data: ClaimFormData) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function InsurerNewClaimForm({
  selectedCustomer,
  selectedShop,
  claimFormData,
  primaryColor,
  onUpdate,
  onCancel,
  onSubmit,
}: InsurerNewClaimFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-2xl font-bold mb-4">New Claim Details</h2>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Policyholder</p>
            <p className="font-bold">{selectedCustomer.name}</p>
            <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
            <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
          </div>

          {selectedShop && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-1">Assigned Shop</p>
              <p className="font-bold">{selectedShop.name}</p>
              <p className="text-sm text-green-700">{selectedShop.location}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
              <input
                type="text"
                value={claimFormData.policyNumber}
                onChange={(e) => onUpdate({ ...claimFormData, policyNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., POL-2024-0518"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date</label>
              <input
                type="date"
                value={claimFormData.incidentDate}
                onChange={(e) => onUpdate({ ...claimFormData, incidentDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Damage Description
              </label>
              <textarea
                value={claimFormData.damageDescription}
                onChange={(e) => onUpdate({ ...claimFormData, damageDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Describe the damage and incident details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  $
                </span>
                <input
                  type="number"
                  value={claimFormData.estimatedAmount}
                  onChange={(e) => onUpdate({ ...claimFormData, estimatedAmount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
              <select
                value={claimFormData.priority}
                onChange={(e) => onUpdate({ ...claimFormData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-medium bd-glass-control--secondary"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!claimFormData.policyNumber || !claimFormData.incidentDate}
              className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
              type="button"
            >
              Create Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
