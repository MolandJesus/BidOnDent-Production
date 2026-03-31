/**
 * Small inline UI components used inside the ShopDirectoryMapPane,
 * extracted for file-size governance.
 */
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";

/* ── Map loading skeleton with timeout fallback ── */
export function MapLoadingSkeleton({
  mapLoaded,
  mapLoadFailed,
}: {
  mapLoaded: boolean;
  mapLoadFailed: boolean;
}) {
  if (mapLoaded) return null;
  return (
    <div className="absolute inset-0 z-[600] flex items-center justify-center bg-slate-950 transition-opacity">
      <div className="flex flex-col items-center gap-3">
        {!mapLoadFailed ? (
          <>
            <svg className="h-8 w-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-20"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-xs font-medium text-white/60">Loading map…</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white/80">Map failed to load</p>
            <p className="text-xs text-white/50">Check your connection and try again</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Reload
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Map tile mode picker (roadmap / dark / satellite) ── */
export function MapTilePicker({
  isDark,
  tileMode,
  setTileMode,
}: {
  isDark: boolean;
  tileMode: MapTileMode;
  setTileMode: (mode: MapTileMode) => void;
}) {
  return (
    <div className="pointer-events-none absolute left-2 top-16 z-[520] sm:left-3 sm:top-20">
      <div
        className={`pointer-events-auto flex rounded-lg border shadow-lg backdrop-blur-md ${
          isDark ? "border-white/20 bg-slate-950/80" : "border-black/8 bg-white/90"
        }`}
      >
        {(["roadmap", "night", "satellite"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTileMode(mode)}
            className={`px-2.5 py-1.5 text-[10px] font-semibold transition-colors first:rounded-l-lg last:rounded-r-lg ${
              tileMode === mode
                ? isDark
                  ? "bg-blue-600/50 text-white"
                  : "bg-blue-100 text-blue-700"
                : isDark
                  ? "text-white/60 hover:text-white/90"
                  : "text-slate-500 hover:text-slate-800"
            }`}
            aria-label={`${mode === "roadmap" ? "Map" : mode === "night" ? "Dark" : "Satellite"} view`}
            aria-pressed={tileMode === mode}
          >
            {mode === "roadmap" ? "Map" : mode === "night" ? "Dark" : "Satellite"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Empty state overlay ── */
export function MapEmptyState({ isDark, shopCount }: { isDark: boolean; shopCount: number }) {
  if (shopCount > 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center">
      <div
        className={`pointer-events-auto rounded-2xl border px-5 py-4 text-center shadow-xl backdrop-blur-md ${
          isDark
            ? "border-white/20 bg-slate-950/80 text-white"
            : "border-black/8 bg-white/88 text-slate-700"
        }`}
      >
        <p className="text-sm font-semibold">No shops in this area</p>
        <p className={`mt-1 text-xs ${isDark ? "text-white/60" : "text-slate-400"}`}>
          Try a different location or broaden your filters
        </p>
      </div>
    </div>
  );
}

/* ── Geolocation error toast ── */
export function GeoErrorToast({ geoError }: { geoError: string | null }) {
  if (!geoError) return null;
  return (
    <div className="pointer-events-none absolute right-3 top-14 z-[550] sm:top-16">
      <div className="pointer-events-auto rounded-lg border border-amber-400/30 bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur-md">
        <p className="text-xs font-medium text-amber-300">{geoError}</p>
      </div>
    </div>
  );
}
