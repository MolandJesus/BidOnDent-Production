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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">System Preferences</h3>
            <p className="text-sm text-slate-600 mb-3">
              Choose how BidOnDent surfaces render across landing and dashboard shells.
            </p>
            <div className="space-y-2">
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer">
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
                  <p className="text-sm font-medium text-slate-900">Map Dark</p>
                  <p className="text-xs text-slate-600">
                    Default immersive shell for map-first workflows.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer">
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
                  <p className="text-sm font-medium text-slate-900">Light</p>
                  <p className="text-xs text-slate-600">
                    Brighter shell for daytime readability and reduced contrast.
                  </p>
                </div>
              </label>
            </div>
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
