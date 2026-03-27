import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type SettingsModalProps = {
  isOpen: boolean;
  primaryColor: string;
  appearanceMode: DashboardAppearanceMode;
  onAppearanceModeChange: (mode: DashboardAppearanceMode) => void;
  onClose: () => void;
};

export default function SettingsModal({
  isOpen,
  primaryColor,
  appearanceMode,
  onAppearanceModeChange,
  onClose,
}: SettingsModalProps) {
  const [selectedAppearanceMode, setSelectedAppearanceMode] =
    useState<DashboardAppearanceMode>(appearanceMode);

  useEffect(() => {
    if (isOpen) {
      setSelectedAppearanceMode(appearanceMode);
    }
  }, [appearanceMode, isOpen]);

  if (!isOpen) return null;

  const isLight = appearanceMode === "light";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bd-glass-floating p-5 sm:p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isLight ? "bg-white shadow-xl" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>Settings</h2>
          <button
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-blue-200/60 hover:text-blue-100"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Notifications</h3>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>Email notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
            <label className="flex items-center justify-between mt-2">
              <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>SMS notifications</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
          </div>

          <div className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Privacy</h3>
            <label className="flex items-center justify-between">
              <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>Share data with shops</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5"
                style={{ accentColor: primaryColor }}
              />
            </label>
            <label className="flex items-center justify-between mt-2">
              <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>Show profile to insurers</span>
              <input type="checkbox" className="w-5 h-5" style={{ accentColor: primaryColor }} />
            </label>
          </div>

          <div className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Appearance</h3>
            <p className={`text-sm mb-3 ${isLight ? "text-slate-600" : "text-blue-100/55"}`}>
              Choose how BidOnDent surfaces render across landing and dashboard.
            </p>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  selectedAppearanceMode === "map-dark"
                    ? "border-blue-400/30 bg-blue-500/10"
                    : isLight ? "border-slate-200 hover:border-slate-300" : "border-white/[0.1] hover:border-white/[0.15]"
                }`}
              >
                <input
                  type="radio"
                  name="appearance-mode"
                  value="map-dark"
                  checked={selectedAppearanceMode === "map-dark"}
                  onChange={() => setSelectedAppearanceMode("map-dark")}
                  className="mt-1 w-4 h-4"
                  style={{ accentColor: primaryColor }}
                />
                <div>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>Map Dark</p>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/55"}`}>
                    Default immersive shell for map-first workflows.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  selectedAppearanceMode === "light"
                    ? "border-blue-400/30 bg-blue-500/10"
                    : isLight ? "border-slate-200 hover:border-slate-300" : "border-white/[0.1] hover:border-white/[0.15]"
                }`}
              >
                <input
                  type="radio"
                  name="appearance-mode"
                  value="light"
                  checked={selectedAppearanceMode === "light"}
                  onChange={() => setSelectedAppearanceMode("light")}
                  className="mt-1 w-4 h-4"
                  style={{ accentColor: primaryColor }}
                />
                <div>
                  <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>Light</p>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/55"}`}>
                    Warmer frosted shell with amber glow accents.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Language</h3>
            <select className={`w-full p-2 border rounded-lg ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.1] bg-white/[0.05] text-slate-100"}`}>
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
            className="px-4 py-2 text-white rounded-lg flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              onAppearanceModeChange(selectedAppearanceMode);
              onClose();
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
