/**
 * Small inline UI components used inside the ShopDirectoryMapPane,
 * extracted for file-size governance.
 */
import { Map as MapIcon, MoonStar, Satellite } from "lucide-react";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";

/* ── Map loading skeleton with timeout fallback ── */
export function MapLoadingSkeleton({
  mapLoaded,
  mapLoadFailed,
  isDark,
  onRetryMap,
  onSwitchToListMode,
}: {
  mapLoaded: boolean;
  mapLoadFailed: boolean;
  isDark: boolean;
  onRetryMap: () => void;
  onSwitchToListMode?: () => void;
}) {
  if (mapLoaded) return null;
  return (
    <div
      className={`absolute inset-0 z-[600] flex items-center justify-center transition-opacity ${
        isDark
          ? "bg-[radial-gradient(circle_at_70%_15%,rgba(59,130,246,0.16),rgba(2,6,23,0.95)_40%,rgba(2,6,23,0.98)_100%)]"
          : "bg-[radial-gradient(circle_at_70%_15%,rgba(59,130,246,0.14),rgba(226,232,240,0.92)_42%,rgba(241,245,249,0.96)_100%)]"
      }`}
    >
      <div
        className={`mx-4 flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border px-5 py-5 text-center backdrop-blur-2xl ${
          isDark
            ? "border-blue-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.76))]"
            : "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.86),rgba(226,232,240,0.76))]"
        }`}
      >
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
            <p className={`text-xs font-medium ${isDark ? "text-white/65" : "text-slate-500"}`}>
              Loading map...
            </p>
          </>
        ) : (
          <>
            <p className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-slate-800"}`}>
              Map failed to load
            </p>
            <p className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-slate-500"}`}>
              Your shop list is still available. Retry the map or continue in list mode.
            </p>
            <div className="mt-1.5 flex w-full flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onRetryMap}
                className="min-h-[40px] rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Retry map
              </button>
              {onSwitchToListMode ? (
                <button
                  type="button"
                  onClick={onSwitchToListMode}
                  className={`min-h-[40px] rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    isDark
                      ? "border-white/20 bg-slate-800/80 text-white/85 hover:bg-slate-700/90"
                      : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]"
                  }`}
                >
                  Use list mode
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Map tile mode picker (premium segmented, matches landing page) ── */
export function MapTilePicker({
  compact = false,
  isDark,
  tileMode,
  setTileMode,
}: {
  compact?: boolean;
  isDark: boolean;
  tileMode: MapTileMode;
  setTileMode: (mode: MapTileMode) => void;
}) {
  const modes: Array<{ key: MapTileMode; label: string; Icon: typeof MapIcon }> = [
    { key: "roadmap", label: "Map", Icon: MapIcon },
    { key: "night", label: "Night", Icon: MoonStar },
    { key: "satellite", label: "Satellite", Icon: Satellite },
  ];

  return (
    <div
      className={`pointer-events-none absolute z-[520] ${
        compact ? "left-2 top-10 sm:left-3 sm:top-12" : "left-2 top-16 sm:left-3 sm:top-20"
      }`}
    >
      <div
        className={`map-liquid-rail pointer-events-auto inline-flex items-center rounded-[1.35rem] border transition-[background,border-color,box-shadow] duration-300 ${
          compact ? "gap-0.5 p-[3px]" : "gap-1 p-1"
        } ${
          isDark
            ? "border-blue-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(15,23,42,0.8))]"
            : "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.72))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]"
        }`}
      >
        {modes.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTileMode(key)}
            className={`inline-flex items-center rounded-full font-semibold transition-all duration-200 active:scale-[0.97] ${
              compact ? "h-6.5 gap-1 px-2 text-[10px]" : "h-8 gap-1.5 px-3 text-xs"
            } ${
              tileMode === key
                ? isDark
                  ? "bg-[linear-gradient(180deg,#93c5fd,#60a5fa)] text-slate-950 shadow-[0_12px_24px_rgba(59,130,246,0.34)]"
                  : "bg-[linear-gradient(180deg,rgba(59,130,246,0.9),rgba(37,99,235,0.96))] text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]"
                : isDark
                  ? "text-slate-200 hover:bg-blue-500/15 hover:text-white"
                  : "text-slate-600 hover:bg-white/35 hover:text-slate-900"
            }`}
            aria-label={`${label} view`}
            aria-pressed={tileMode === key}
          >
            <Icon className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
            <span className={compact ? "hidden xl:inline" : "hidden sm:inline"}>{label}</span>
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
    <div className="pointer-events-none absolute inset-x-0 bottom-14 z-[450] flex justify-center px-3 sm:bottom-20">
      <div
        className={`map-liquid-panel pointer-events-auto max-w-[320px] rounded-[1.35rem] border px-4 py-3 text-center shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur-2xl ${
          isDark
            ? "border-blue-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.76))] text-white"
            : "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.84),rgba(226,232,240,0.76))] text-slate-700"
        }`}
      >
        {/* Phase 7 honesty (2026-05-03 P7): default empty-state copy now
            calls out the NY service region directly so out-of-state GPS
            users see the soft-launch boundary instead of the prior generic
            "broaden your filters" line that implied shops would appear if
            the user adjusted the radius. */}
        <p className="text-sm font-semibold">No partner shops in this area</p>
        <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          We're live across NY — try a NY ZIP, address, or one of the region quick-pick chips above.
        </p>
      </div>
    </div>
  );
}

/* ── Geolocation error toast ── */
export function GeoErrorToast({
  geoError,
  isDark = true,
}: {
  geoError: string | null;
  isDark?: boolean;
}) {
  if (!geoError) return null;
  return (
    <div className="pointer-events-none absolute right-3 top-14 z-[550] sm:top-16 animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none">
      <div
        className={`pointer-events-auto rounded-xl border px-3 py-2 shadow-lg backdrop-blur-2xl ${
          isDark
            ? "border-amber-400/30 bg-slate-900/90"
            : "border-amber-300/60 bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.84))] shadow-[inset_0_1px_0_rgba(252,240,208,0.82),0_8px_20px_rgba(15,23,42,0.10)]"
        }`}
      >
        <p className={`text-xs font-medium ${isDark ? "text-amber-300" : "text-amber-700"}`}>
          {geoError}
        </p>
      </div>
    </div>
  );
}
