import { AlertCircle, CheckCircle, Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";
import { unformatPhoneNumber } from "../../../utils/formatters";
import { friendlyEdgeError } from "../../../utils/edgeErrorMessage";

export type ShopProfileFormData = {
  shopName: string;
  phone: string;
  businessAddress: string;
  businessHours: string;
  certifications: string;
};

type ShopProfileModalProps = {
  isOpen: boolean;
  primaryColor: string;
  shopName: string;
  editablePhone: string;
  initialAddress?: string;
  initialHours?: string;
  initialCertifications?: string;
  onShopNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSave?: (data: ShopProfileFormData) => Promise<void>;
  onClose: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopProfileModal({
  isOpen,
  primaryColor,
  shopName,
  editablePhone,
  initialAddress = "",
  initialHours = "",
  initialCertifications = "",
  onShopNameChange,
  onPhoneChange,
  onSave,
  onClose,
  appearanceMode = "map-dark",
}: ShopProfileModalProps) {
  const isLight = appearanceMode === "light";
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [businessAddress, setBusinessAddress] = useState(initialAddress);
  const [businessHours, setBusinessHours] = useState(initialHours);
  const [certifications, setCertifications] = useState(initialCertifications);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const phoneDigits = unformatPhoneNumber(editablePhone);
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!shopName.trim()) errors.shopName = "Shop name is required";
    if (phoneDigits.length > 0 && phoneDigits.length < 10)
      errors.phone = "Phone number must be at least 10 digits";
    return errors;
  }, [shopName, phoneDigits]);

  const isFormValid = !validation.shopName;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSaved(false);
    setSaving(false);
    setSaveError(null);
    setBusinessAddress(initialAddress);
    setBusinessHours(initialHours);
    setCertifications(initialCertifications);
    setTouched({});
  }, [isOpen, initialAddress, initialHours, initialCertifications]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4${!isLight ? " dark" : ""}`}
      onMouseDown={(event) => {
        if (!saving && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby="shop-profile-modal-title"
        aria-modal="true"
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            id="shop-profile-modal-title"
          >
            Shop Profile
          </h2>
          <button
            aria-label="Close shop profile"
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-300"}`}
            onClick={onClose}
            type="button"
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
              onBlur={() => setTouched((p) => ({ ...p, shopName: true }))}
              className={`bd-report-input w-full px-3 py-2.5 rounded-xl outline-none ${touched.shopName && validation.shopName ? "border-rose-400" : ""}`}
            />
            {touched.shopName && validation.shopName && (
              <p className="mt-1 text-xs text-rose-400">{validation.shopName}</p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Business Address
            </label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-[#fffefa] text-slate-800" : "border-white/[0.12]"}`}
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
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              maxLength={14}
              placeholder="(555) 123-4567"
              className={`w-full p-2 border rounded ${touched.phone && validation.phone ? "border-rose-400" : isLight ? "border-slate-200 bg-[#fffefa] text-slate-800" : "border-white/[0.12]"}`}
            />
            {touched.phone && validation.phone && (
              <p className="mt-1 text-xs text-rose-400">{validation.phone}</p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Business Hours
            </label>
            <input
              type="text"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-[#fffefa] text-slate-800" : "border-white/[0.12]"}`}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Certifications
            </label>
            <textarea
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g. ASE Certified, I-CAR Gold Class"
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-[#fffefa] text-slate-800" : "border-white/[0.12]"}`}
              rows={3}
            />
          </div>
        </div>
        {saveError && (
          <p className="mt-4 text-sm text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className={`px-4 py-2 border rounded transition-colors ${isLight ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-white/[0.12] hover:bg-white/[0.04]"}`}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-white rounded flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
            onClick={async () => {
              if (onSave) {
                setSaving(true);
                setSaveError(null);
                try {
                  await onSave({
                    shopName,
                    phone: editablePhone,
                    businessAddress,
                    businessHours,
                    certifications,
                  });
                  setSaved(true);
                  setTimeout(() => {
                    setSaved(false);
                    onClose();
                  }, 1500);
                } catch (err) {
                  setSaveError(friendlyEdgeError(err, "Failed to save profile"));
                } finally {
                  setSaving(false);
                }
              } else {
                setSaved(true);
                setTimeout(() => {
                  setSaved(false);
                  onClose();
                }, 1500);
              }
            }}
            disabled={saved || saving || !isFormValid}
            type="button"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Saved!
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
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
