import { Save, X } from "lucide-react";

type ShopProfileModalProps = {
  isOpen: boolean;
  primaryColor: string;
  shopName: string;
  editablePhone: string;
  onShopNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onClose: () => void;
};

export default function ShopProfileModal({
  isOpen,
  primaryColor,
  shopName,
  editablePhone,
  onShopNameChange,
  onPhoneChange,
  onClose
}: ShopProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Shop Profile</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => onShopNameChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <input
              type="text"
              defaultValue="123 Main St, City, State 12345"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={editablePhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <input
              type="text"
              defaultValue="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <textarea
              defaultValue="ASE Certified, I-CAR Gold Class"
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white rounded flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              onClose();
              alert("Shop profile updated!");
            }}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
