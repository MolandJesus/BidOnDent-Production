import type { FormEvent } from "react";
import {
  ArrowLeft,
  Layers3,
  List,
  Map as MapIcon,
  MoonStar,
  Satellite,
  Search,
} from "lucide-react";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";

type ImmersiveMapTopBarProps = {
  isDark: boolean;
  isGuidanceMode: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  shopCount: number;
  onSwitchToSplit: () => void;
  activeTileMode: MapTileMode;
  onCycleTileMode: () => void;
  onBack: () => void;
};

export default function ImmersiveMapTopBar({
  isDark,
  isGuidanceMode,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  drawerOpen,
  onToggleDrawer,
  shopCount,
  onSwitchToSplit,
  activeTileMode,
  onCycleTileMode,
  onBack,
}: ImmersiveMapTopBarProps) {
  const topGradient = isDark
    ? "bg-gradient-to-b from-[#0a1a38]/80 via-[#0d2244]/30 to-transparent"
    : "bg-gradient-to-b from-black/20 via-black/6 to-transparent";
  const iconBtn = isDark
    ? "border-blue-400/[0.18] bg-[rgba(12,25,41,0.82)] text-white shadow-[0_4px_20px_rgba(2,6,23,0.45),0_0_12px_rgba(37,99,235,0.06)] backdrop-blur-xl hover:bg-[rgba(12,25,41,0.92)]"
    : "border-black/10 bg-white/82 text-slate-800 shadow-xl backdrop-blur-md hover:bg-white/95";
  const searchInputCls = isDark
    ? "border-blue-400/[0.18] bg-[rgba(12,25,41,0.82)] text-white placeholder:text-white/45 shadow-[0_4px_20px_rgba(2,6,23,0.45)] focus:border-blue-400/40 focus:bg-[rgba(12,25,41,0.92)] backdrop-blur-xl"
    : "border-black/10 bg-white/82 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/40 focus:bg-white/95";
  const listBtnActive = isDark
    ? "border-blue-400/40 bg-blue-600/30 text-white"
    : "border-blue-400/40 bg-blue-100 text-blue-700";
  const listBtnInactive = isDark
    ? "border-white/20 bg-slate-950/70 text-white/80 hover:bg-slate-950/85 hover:text-white"
    : "border-black/10 bg-white/82 text-slate-600 hover:bg-white/95 hover:text-slate-800";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-[550] ${topGradient} px-3 pb-8 sm:px-4`}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))" }}
    >
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
        {/* Back */}
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
          onClick={onBack}
          type="button"
          aria-label="Back to shop directory"
        >
          <ArrowLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>

        {/* Map-owned search — hidden during guidance */}
        {!isGuidanceMode && (
          <form className="flex-1" onSubmit={onSearchSubmit}>
            <div className="relative max-w-lg">
              <Search
                className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isDark ? "text-white/60" : "text-slate-400"}`}
              />
              <input
                className={`w-full rounded-full border py-2.5 pl-9 pr-4 text-sm shadow-xl outline-none backdrop-blur-md transition-colors sm:py-2.5 ${searchInputCls}`}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search shops, programs, specialties..."
                type="text"
                value={searchQuery}
              />
            </div>
          </form>
        )}

        {/* Spacer during guidance when search is hidden */}
        {isGuidanceMode && <div className="flex-1" />}

        {/* Results drawer toggle */}
        <button
          className={`flex h-11 items-center gap-1.5 rounded-full border px-2.5 text-sm font-medium shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:gap-2 sm:px-3 ${drawerOpen ? listBtnActive : listBtnInactive}`}
          onClick={onToggleDrawer}
          type="button"
          aria-expanded={drawerOpen}
          aria-label="Toggle results drawer"
        >
          <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{shopCount}</span>
        </button>

        {/* Mode switch — hidden during guidance */}
        {!isGuidanceMode && (
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-auto sm:gap-2 sm:px-3 sm:text-sm sm:font-medium ${iconBtn}`}
            onClick={onSwitchToSplit}
            type="button"
            aria-label="Switch to split view"
          >
            <Layers3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Split</span>
          </button>
        )}

        {/* Tile mode cycle */}
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
          onClick={onCycleTileMode}
          type="button"
          aria-label={`${activeTileMode === "roadmap" ? "Map" : activeTileMode === "night" ? "Night" : "Satellite"} view — tap to change`}
        >
          {activeTileMode === "roadmap" ? (
            <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : activeTileMode === "night" ? (
            <MoonStar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Satellite className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
