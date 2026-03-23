import { Save, X } from "lucide-react";

type SettingsModalProps = {
  isOpen: boolean;
  primaryColor: string;
  onClose: () => void;
};

export default function SettingsModal({ isOpen, primaryColor, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Notifications</h3>
            <label className="flex items-center justify-between">
              <span className="text-sm">Email notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
            <label className="flex items-center justify-between mt-2">
              <span className="text-sm">SMS notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Privacy</h3>
            <label className="flex items-center justify-between">
              <span className="text-sm">Share data with shops</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
            <label className="flex items-center justify-between mt-2">
              <span className="text-sm">Show profile to insurers</span>
              <input type="checkbox" className="w-5 h-5" style={{ accentColor: primaryColor }} />
            </label>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Language</h3>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white rounded flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              onClose();
              alert("Settings saved!");
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
