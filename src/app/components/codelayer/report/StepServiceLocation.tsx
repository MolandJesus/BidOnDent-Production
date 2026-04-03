import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { zipToCoordinates, geocodeAddress } from "../../../services/supabase/map";
import DashboardMapPreview from "../../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../../dashboard/MapLibreDashboardMapPreview";
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
  onCoordsChange?: (coords: { lat: number; lng: number } | null) => void;
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
  onCoordsChange,
}: StepServiceLocationProps) {
  const isLightAppearance = appearanceMode === "light";

  const resolvedCoords = useMemo(() => {
    if (zipCode.length !== 5) return null;
    return zipToCoordinates(zipCode);
  }, [zipCode]);

  // Refine with geocoded address when available
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (zipCode.length !== 5) {
      setGeocodedCoords(null);
      return;
    }
    // Only geocode if there's meaningful address text
    const trimmed = address.trim();
    if (trimmed.length < 3) {
      setGeocodedCoords(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      geocodeAddress({ address: trimmed, zip: zipCode }).then((coords) => {
        if (!cancelled) setGeocodedCoords(coords);
      });
    }, 600); // debounce to avoid hammering Nominatim on each keystroke
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, zipCode]);

  const pinCoords = geocodedCoords ?? resolvedCoords;

  // Propagate resolved coordinates to parent
  useEffect(() => {
    onCoordsChange?.(pinCoords);
  }, [pinCoords, onCoordsChange]);

  const previewPin = useMemo<ReportPin[]>(() => {
    if (!pinCoords) return [];
    return [
      {
        id: "report-preview",
        lat: pinCoords.lat,
        lng: pinCoords.lng,
        label: "Your report location",
      },
    ];
  }, [pinCoords]);

  const mapCenter = useMemo<[number, number]>(
    () => (pinCoords ? [pinCoords.lat, pinCoords.lng] : [41.05, -73.87]),
    [pinCoords]
  );

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

      {/* Map preview — shows resolved location when ZIP is valid */}
      {previewPin.length > 0 && (
        <div
          className={`rounded-xl overflow-hidden border ${
            isLightAppearance ? "border-slate-200/60" : "border-blue-300/15"
          }`}
        >
          <div className="h-[140px] md:h-[160px]">
            <DashboardMapPreview
              shops={[]}
              reportPins={previewPin}
              center={mapCenter}
              zoom={11}
              isLight={isLightAppearance}
            />
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 text-xs ${
              isLightAppearance ? "bg-slate-50 text-slate-600" : "bg-white/5 text-blue-100/70"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            Shops will see your request at this location on the map.
          </div>
        </div>
      )}

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

      {!zipCode && (
        <p
          className={`text-center text-xs leading-relaxed ${isLightAppearance ? "text-amber-600" : "text-amber-300/80"}`}
        >
          Without a ZIP code, your report won&apos;t appear on the map and shops may not find it.
        </p>
      )}
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
