import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-sm p-3 sm:p-4"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      <div
        className={`bd-glass-floating mx-auto my-3 sm:my-6 w-full max-w-md rounded-2xl border shadow-2xl sm:my-10 max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden flex flex-col ${isLight ? "bd-light-surface border-slate-200/70 bg-white/98" : "border-blue-300/20 bg-slate-950/96"}`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4 mb-0">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Settings
          </h2>
          <button
            className={`rounded-lg p-1 transition-colors ${isLight ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "text-blue-200/60 hover:bg-white/10 hover:text-blue-100"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          <div className="space-y-4">
            <div
              className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
            >
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Notifications
              </h3>
              <label className="flex items-center justify-between">
                <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
                  Email notifications
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>
              <label className="flex items-center justify-between mt-2">
                <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
                  SMS notifications
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>
            </div>

            <div
              className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
            >
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Privacy
              </h3>
              <label className="flex items-center justify-between">
                <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
                  Share data with shops
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>
              <label className="flex items-center justify-between mt-2">
                <span className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
                  Show profile to insurers
                </span>
                <input type="checkbox" className="w-5 h-5" style={{ accentColor: primaryColor }} />
              </label>
            </div>

            <div
              className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
            >
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Appearance
              </h3>
              <p className={`text-sm mb-3 ${isLight ? "text-slate-600" : "text-blue-100/55"}`}>
                Choose how BidOnDent surfaces render across landing and dashboard.
              </p>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    selectedAppearanceMode === "map-dark"
                      ? "border-blue-400/30 bg-blue-500/10"
                      : isLight
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-white/[0.1] hover:border-white/[0.15]"
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
                    <p
                      className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}
                    >
                      Map Dark
                    </p>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/55"}`}>
                      Default immersive shell for map-first workflows.
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    selectedAppearanceMode === "light"
                      ? "border-blue-400/30 bg-blue-500/10"
                      : isLight
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-white/[0.1] hover:border-white/[0.15]"
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
                    <p
                      className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}
                    >
                      Light
                    </p>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/55"}`}>
                      Warmer frosted shell with amber glow accents.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Language
              </h3>
              <select
                className={`w-full h-10 px-3 border rounded-lg ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/[0.1] bg-white/[0.05] text-slate-100"}`}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
        <div
          className={`flex justify-end gap-2 border-t px-4 py-3 sm:px-5 sm:py-4 ${isLight ? "border-slate-200/60 bg-white/85" : "border-white/[0.08] bg-slate-950/75"}`}
        >
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-800" : "text-blue-200/80 hover:bg-white/10 hover:text-blue-100"}`}
            onClick={onClose}
          >
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

  return createPortal(modalContent, document.body);
}
