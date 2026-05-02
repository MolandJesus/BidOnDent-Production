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
    <div className="bd-report-step px-4 sm:px-5 md:px-6 py-5 md:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 md:mb-7">
          <span className="bd-report-eyebrow mb-3">
            <MapPin className="w-3.5 h-3.5" />
            Service radius
          </span>
          <h2
            className={`mb-1.5 text-[1.95rem] font-bold tracking-[-0.02em] ${
              isLightAppearance ? "text-slate-800" : "text-white/95"
            }`}
          >
            Set where shops should see this report
          </h2>
          <p className={`max-w-2xl ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}>
            Your ZIP places the report on the map so nearby shops know this request is in range.
          </p>
        </div>

        <div
          className={`grid gap-5 ${
            pinCoords ? "xl:grid-cols-[minmax(0,0.94fr)_minmax(340px,0.96fr)] xl:items-start" : ""
          }`}
        >
          <div className="bd-report-section p-4 sm:p-5 md:p-6">
            <div className="mb-4">
              <h3
                className={`text-base font-semibold ${isLightAppearance ? "text-slate-700" : "text-blue-100/85"}`}
              >
                Location details
              </h3>
              <p
                className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
              >
                Add the ZIP first. A more specific address helps refine the pin, but it is optional.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="report-zip-code"
                  className={`block text-sm font-medium mb-1.5 ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
                >
                  ZIP Code
                </label>
                <input
                  id="report-zip-code"
                  type="text"
                  inputMode="numeric"
                  value={zipCode}
                  onChange={(e) => onZipChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 focus:outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-white"
                  }`}
                  placeholder="e.g. 11201"
                  maxLength={5}
                />
              </div>

              <div>
                <label
                  htmlFor="report-address"
                  className={`block text-sm font-medium mb-1.5 ${isLightAppearance ? "text-slate-700" : "text-blue-100/80"}`}
                >
                  City or Address{" "}
                  <span
                    className={
                      isLightAppearance
                        ? "text-slate-400 font-normal"
                        : "text-blue-200/50 font-normal"
                    }
                  >
                    (optional)
                  </span>
                </label>
                <input
                  id="report-address"
                  type="text"
                  value={address}
                  onChange={(e) => onAddressChange(e.target.value)}
                  className={`bd-report-input w-full rounded-2xl px-4 py-3 focus:outline-none ${
                    isLightAppearance ? "text-slate-800" : "text-white"
                  }`}
                  placeholder="e.g. Brooklyn, NY"
                />
              </div>
            </div>

            <div className="bd-report-note mt-5 flex items-start gap-2.5 rounded-[1.5rem] px-4 py-3.5">
              <MapPin
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                  isLightAppearance ? "text-blue-700" : "text-blue-400"
                }`}
              />
              <p
                className={`text-sm leading-relaxed ${
                  isLightAppearance ? "text-slate-500" : "text-blue-100/70"
                }`}
              >
                Your exact location is only shared with shops you decide to work with. This step is
                mainly about discovery on the map.
              </p>
            </div>

            {!zipCode && (
              <p
                className={`mt-3 text-xs leading-relaxed ${
                  isLightAppearance ? "text-amber-700" : "text-amber-300/80"
                }`}
              >
                Without a ZIP code, your report will not appear on the map and nearby shops may
                never see it.
              </p>
            )}
          </div>

          <div className="bd-report-section p-3 sm:p-4">
            {previewPin.length > 0 ? (
              <div className="bd-report-map-frame overflow-hidden rounded-[1.6rem]">
                <div className="h-[240px] md:h-[280px]">
                  <DashboardMapPreview
                    shops={[]}
                    reportPins={previewPin}
                    center={mapCenter}
                    zoom={11}
                    isLight={isLightAppearance}
                  />
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-3 text-sm ${
                    isLightAppearance
                      ? "bg-slate-50/85 text-slate-600"
                      : "bg-white/5 text-blue-100/70"
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                  Shops will see your request anchored at this location on the map.
                </div>
              </div>
            ) : (
              <div
                className={`flex min-h-[240px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-6 text-center ${
                  isLightAppearance
                    ? "border-slate-300/75 bg-white/35 text-slate-500"
                    : "border-white/12 bg-white/[0.03] text-blue-100/70"
                }`}
              >
                <MapPin
                  className={`mb-3 h-8 w-8 ${isLightAppearance ? "text-blue-500/80" : "text-blue-300"}`}
                />
                <p
                  className={`text-base font-semibold ${isLightAppearance ? "text-slate-700" : "text-slate-100"}`}
                >
                  Map preview appears as soon as a ZIP code is entered
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed">
                  This is the view nearby shops use to discover requests in their service area.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onContinue}
            className={`text-left text-sm transition-colors ${
              isLightAppearance
                ? "text-slate-500 hover:text-slate-700"
                : "text-blue-200/55 hover:text-blue-100/75"
            }`}
          >
            Skip for now — I&apos;ll add location later
          </button>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:min-w-[20rem]">
            <button
              type="button"
              onClick={onBack}
              className="bd-report-secondary-button min-h-[48px] flex-1 rounded-2xl px-4 py-3 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="bd-report-primary-button inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl px-4 py-3 text-white font-semibold"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
