/**
 * Pass 23 / Step A (cowork-A) — Map Program Top Bar shell component.
 *
 * Created per master-builder Pass 180 §7.5 authorization. Canonical location
 * for the unified map-program top bar at `src/app/components/maps/shell/`
 * (matches Pass 180 §7.1 layer-placement directive: L2 composed UI, NOT
 * services/ since this renders JSX).
 *
 * ## Scope of this initial Step A lift (NOT a unification yet)
 *
 * The plan doc §4 Step A originally framed this as "lift the union of"
 * top-bar fragments from CoverageBrowseExperience, dashboard Smart Shop
 * Map host, and ImmersiveMapTopBar. Investigation during Pass 11/12
 * surfaced the 3-engine reality (audit AI's §1.4/§1.5 correction): the
 * "dashboard Smart Shop Map host" consumer is the SAME shop-directory
 * infrastructure that ImmersiveMapTopBar serves (collapsing the
 * 3-consumer set to 2). Engine A consumers (CoverageBrowseExperience +
 * OperatingRegionsSection + CoverageActiveNavigationLayout) use
 * MapSurfaceControls, which is a DIFFERENT UX shape — segmented tile-mode
 * toggle + Focus + Overview + Expand — not the immersive-fullscreen
 * top-bar shape (Back + Search + Drawer + Split + tile-cycle).
 *
 * To stay inside master-builder's Pass 180 §7.5 directive ("Pure
 * presentational lift — no behavior change, no new callbacks. Same
 * handlers in, same handlers out"), this initial extraction lifts the
 * immersive-fullscreen top-bar shape ONLY. The inline-embedded
 * MapSurfaceControls UX stays where it is until master-builder reviews
 * the §1.4/§1.5 fork resolution and authorizes a true cross-engine union
 * (or accepts that the two engines retain divergent top-bar shapes and
 * MapProgramTopBar grows host-discriminator props in a follow-on pass).
 *
 * ## Migration status
 *
 * - `ImmersiveMapTopBar` (src/app/components/shop/ImmersiveMapTopBar.tsx)
 *   becomes a thin re-export shim that imports from this file. Existing
 *   consumers (`ShopDirectoryImmersiveMap`, `ShopDirectoryHybridStage`)
 *   continue to work without changes.
 * - `CoverageBrowseExperience` continues to use MapSurfaceControls
 *   directly. No migration this pass.
 * - Future Step A.2 (post-fork resolution): extend MapProgramTopBar with
 *   host="landing-dialog" / host="dashboard-fullscreen" discriminators
 *   that select the appropriate UX shape.
 *
 * ## API contract
 *
 * Same as the previous ImmersiveMapTopBar default export. Same prop
 * shape, same handler semantics, same DOM output. This is a file-rename
 * + canonical-location lift, NOT a redesign.
 *
 * ## Refs
 *
 * - PLAN_MAP_UNIFICATION_2026-05-08.md §2.1, §4 Step A, §7.5
 * - LAW_LAYERED_ARCHITECTURE.md "Folder-to-Layer Mapping" — L2 composed UI
 * - docs/evidence/pass-11-2026-05-08/ENGINE_SURFACES_MATRIX.md (3-engine reality)
 * - docs/evidence/pass-11-2026-05-08/PASS_D_LAW_REF_NOTES.md (LAW guardrails)
 */

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
import type { MapTileMode } from "../serviceCoverageMapTypes";

export type MapProgramTopBarProps = {
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

export default function MapProgramTopBar({
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
}: MapProgramTopBarProps) {
  const topGradient = isDark
    ? "bg-gradient-to-b from-[#0a1a38]/80 via-[#0d2244]/30 to-transparent"
    : "bg-gradient-to-b from-black/20 via-black/6 to-transparent";
  const controlShell = isDark
    ? "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(9,18,36,0.86),rgba(12,25,41,0.72))] shadow-[inset_0_1px_0_rgba(196,144,65,0.20),inset_0_-1px_0_rgba(140,82,22,0.18),0_0_0_1px_rgba(96,165,250,0.16),0_18px_44px_rgba(2,6,23,0.40),0_0_44px_rgba(196,130,45,0.12)]"
    : "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.78))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_14px_28px_rgba(15,23,42,0.10)]";
  const iconBtn = isDark
    ? "border-[rgba(96,165,250,0.22)] bg-[linear-gradient(180deg,rgba(12,25,41,0.86),rgba(8,16,33,0.78))] text-white shadow-[inset_0_1px_0_rgba(196,144,65,0.20),inset_0_-1px_0_rgba(140,82,22,0.18),0_4px_20px_rgba(2,6,23,0.46),0_0_18px_rgba(196,130,45,0.10)] backdrop-blur-xl hover:bg-[linear-gradient(180deg,rgba(12,25,41,0.94),rgba(8,16,33,0.86))]"
    : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-800 shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_4px_18px_rgba(15,23,42,0.10)] backdrop-blur-md hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]";
  const searchInputCls = isDark
    ? "border-[rgba(96,165,250,0.22)] bg-[linear-gradient(180deg,rgba(12,25,41,0.86),rgba(8,16,33,0.78))] text-white placeholder:text-white/45 shadow-[inset_0_1px_0_rgba(196,144,65,0.18),inset_0_-1px_0_rgba(140,82,22,0.16),0_4px_20px_rgba(2,6,23,0.46)] focus:border-blue-400/50 focus:bg-[linear-gradient(180deg,rgba(12,25,41,0.94),rgba(8,16,33,0.86))] backdrop-blur-xl"
    : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-800 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] focus:border-blue-500/50 focus:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]";
  const listBtnActive = isDark
    ? "border-blue-400/45 bg-blue-600/30 text-white"
    : "border-blue-400/45 bg-blue-100 text-blue-700";
  const listBtnInactive = isDark
    ? "border-[rgba(96,165,250,0.22)] bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(8,16,33,0.70))] text-white/80 shadow-[inset_0_1px_0_rgba(196,144,65,0.16),inset_0_-1px_0_rgba(140,82,22,0.14)] hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.90),rgba(8,16,33,0.82))] hover:text-white"
    : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-600 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))] hover:text-slate-800";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-[550] ${topGradient} px-3 pb-8 sm:px-4 animate-in fade-in slide-in-from-top-2 duration-400 motion-reduce:animate-none`}
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

        <div
          className={`pointer-events-auto ml-auto inline-flex items-center gap-1 rounded-[1.35rem] border p-1 backdrop-blur-2xl ${controlShell}`}
        >
          <button
            className={`flex h-11 items-center gap-1.5 rounded-full border px-2.5 text-sm font-medium shadow-none backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:gap-2 sm:px-3 ${drawerOpen ? listBtnActive : listBtnInactive}`}
            onClick={onToggleDrawer}
            type="button"
            aria-expanded={drawerOpen}
            aria-label="Toggle results drawer"
          >
            <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{shopCount}</span>
          </button>

          {!isGuidanceMode && (
            <button
              className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-none backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:w-auto sm:gap-2 sm:px-3 sm:text-sm sm:font-medium ${iconBtn}`}
              onClick={onSwitchToSplit}
              type="button"
              aria-label="Switch to split view"
            >
              <Layers3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Split</span>
            </button>
          )}

          <button
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-none backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
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
    </div>
  );
}
