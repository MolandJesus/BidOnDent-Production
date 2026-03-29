/**
 * MobileMapBottomSheet — Mobile-only bottom-sheet for map browse content.
 *
 * Uses vaul Drawer in non-modal mode with snap points so the map
 * stays fully interactive while users can swipe up to browse shops,
 * explore places, or manage saved locations.
 *
 * Snap points:
 *   24 px  — collapsed (handle-only, map fully visible)
 *   90 px  — peek (handle + tab bar visible)
 *   40 %   — half  (shop list / panel content)
 *   88 %   — full  (all sidebar content scrollable)
 *
 * "Never trapped" principle: user can always collapse the sheet to see
 * the full map, and always swipe back up. The sheet is never dismissed
 * or unmounted — only collapsed to its smallest snap point.
 */

import { type ReactNode, useCallback, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { Map } from "lucide-react";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import { cn } from "../ui/utils";

type MobileMapBottomSheetProps = {
  tone: MapSurfaceTone;
  children: ReactNode;
};

const COLLAPSED = 24;
const PEEK = 88;
const HALF = 0.48;
const FULL = 0.92;
const SNAP_POINTS = [COLLAPSED, PEEK, HALF, FULL] as const;

function normalizeSnapValue(value: number | string | null) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : PEEK;
  }

  return PEEK;
}

export default function MobileMapBottomSheet({ tone, children }: MobileMapBottomSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);
  // Start at HALF so map sections are immediately reachable and scrollable on mobile.
  const [snap, setSnap] = useState<number | string | null>(HALF);
  const snapValue = normalizeSnapValue(snap);
  const isCollapsed = snapValue <= COLLAPSED + 1;
  const isScrollable = snapValue >= PEEK - 0.01;
  const showBackToMap = snapValue >= HALF - 0.01;

  const collapseToMap = useCallback(() => setSnap(COLLAPSED), []);

  return (
    <DrawerPrimitive.Root
      open
      modal={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      dismissible={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[610] flex h-full max-h-[92vh] touch-pan-y flex-col",
            "rounded-t-[1.35rem] border-t backdrop-blur-2xl",
            "map-liquid-card map-ui-enter pointer-events-auto",
            theme.panelStrongClassName
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Drag handle — enlarged hit area for reliable gesture capture */}
          <div className="flex shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing">
            <div className="h-1 w-10 rounded-full bg-sky-400/45" />
          </div>

          {/* Header strip — "Back to Map" affordance when sheet covers the map */}
          {showBackToMap && (
            <div className="flex shrink-0 items-center justify-between px-4 pb-2">
              <button
                type="button"
                onClick={collapseToMap}
                className={cn(
                  "flex min-h-[42px] items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold",
                  "bg-sky-500/12 text-sky-300 active:bg-sky-500/20",
                  "border border-sky-400/15",
                  "transition-colors duration-150"
                )}
              >
                <Map className="h-3.5 w-3.5" />
                Back to Map
              </button>
            </div>
          )}

          {/* Scrollable content area */}
          <div
            data-vaul-no-drag
            className={cn(
              "flex-1 min-h-0 touch-pan-y overscroll-y-contain px-3 pb-4 [-webkit-overflow-scrolling:touch]",
              isScrollable ? "overflow-y-auto" : "overflow-hidden"
            )}
          >
            <div className="space-y-3">{children}</div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
