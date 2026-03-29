import { CheckCircle, Save, X } from "lucide-react";
import { useState } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type ShopProfileModalProps = {
  isOpen: boolean;
  primaryColor: string;
  shopName: string;
  editablePhone: string;
  onShopNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onClose: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopProfileModal({
  isOpen,
  primaryColor,
  shopName,
  editablePhone,
  onShopNameChange,
  onPhoneChange,
  onClose,
  appearanceMode = "map-dark",
}: ShopProfileModalProps) {
  const isLight = appearanceMode === "light";
  const [saved, setSaved] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Shop Profile
          </h2>
          <button
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-300"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => onShopNameChange(e.target.value)}
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Business Address
            </label>
            <input
              type="text"
              placeholder="123 Main St, City, State 12345"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={editablePhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Business Hours
            </label>
            <input
              type="text"
              placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Certifications
            </label>
            <textarea
              placeholder="e.g. ASE Certified, I-CAR Gold Class"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.12]"}`}
              rows={3}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className={`px-4 py-2 border rounded transition-colors ${isLight ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-white/[0.12] hover:bg-white/[0.04]"}`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white rounded flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              setSaved(true);
              setTimeout(() => {
                setSaved(false);
                onClose();
              }, 1500);
            }}
            disabled={saved}
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
