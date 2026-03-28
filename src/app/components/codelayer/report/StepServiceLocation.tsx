import { ArrowRight, MapPin } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type StepServiceLocationProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  zipCode: string;
  address: string;
  onZipChange: (zip: string) => void;
  onAddressChange: (address: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepServiceLocation({
  primaryColor,
  appearanceMode = "map-dark",
  zipCode,
  address,
  onZipChange,
  onAddressChange,
  onBack,
  onContinue,
}: StepServiceLocationProps) {
  const isLightAppearance = appearanceMode === "light";
  return (
    <div
      className={`p-4 sm:p-6 space-y-5 bd-glass-card rounded-2xl${isLightAppearance ? " bd-light-surface" : ""}`}
    >
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
        >
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <h2
          className={`text-xl font-bold mb-1 ${isLightAppearance ? "text-slate-800" : "text-white/95"}`}
        >
          Service Location
        </h2>
        <p
          className={`text-sm leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
        >
          Shops near you will see this request first on the BidOnDent network
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label
            className={`block text-sm font-medium mb-1.5 ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
          >
            ZIP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={zipCode}
            onChange={(e) => onZipChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${isLightAppearance ? "border-slate-200 text-slate-800 bg-white focus:ring-blue-400/30 focus:border-blue-400" : "border-white/15 text-white bg-white/8 focus:ring-blue-500/30 focus:border-blue-400/50 placeholder:text-blue-200/40"}`}
            placeholder="e.g. 11201"
            maxLength={5}
          />
        </div>
        <div>
          <label
            className={`block text-sm font-medium mb-1.5 ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
          >
            City or Address{" "}
            <span
              className={
                isLightAppearance ? "text-slate-400 font-normal" : "text-blue-200/50 font-normal"
              }
            >
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${isLightAppearance ? "border-slate-200 text-slate-800 bg-white focus:ring-blue-400/30 focus:border-blue-400" : "border-white/15 text-white bg-white/8 focus:ring-blue-500/30 focus:border-blue-400/50 placeholder:text-blue-200/40"}`}
            placeholder="e.g. Brooklyn, NY"
          />
        </div>
      </div>

      <div
        className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${isLightAppearance ? "bg-blue-900/15 border-blue-400/12" : "bg-blue-900/20 border-blue-400/15"}`}
      >
        <MapPin
          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLightAppearance ? "text-blue-500" : "text-blue-400"}`}
        />
        <p
          className={`text-xs leading-relaxed ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
        >
          Your location is only shared with shops you choose. It helps nearby shops on the map find
          and respond to your request faster.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className={`w-full text-center text-sm transition-colors py-1.5 ${isLightAppearance ? "text-slate-400 hover:text-slate-600" : "text-blue-200/50 hover:text-blue-100/70"}`}
      >
        Skip — I&apos;ll add location later
      </button>
    </div>
  );
}
