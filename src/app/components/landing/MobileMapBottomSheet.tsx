/**
 * MobileMapBottomSheet — Mobile-only bottom-sheet for map browse content.
 *
 * Uses vaul Drawer in non-modal mode with snap points so the map
 * stays fully interactive while users can swipe up to browse shops,
 * explore places, or manage saved locations.
 *
 * Snap points:
 *   90 px  — peek (handle + tab bar visible)
 *   40 %   — half  (shop list / panel content)
 *   88 %   — full  (all sidebar content scrollable)
 */

import { type ReactNode, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import { cn } from "../ui/utils";

type MobileMapBottomSheetProps = {
  tone: MapSurfaceTone;
  children: ReactNode;
};

const SNAP_POINTS = [90, 0.4, 0.88] as const;

export default function MobileMapBottomSheet({ tone, children }: MobileMapBottomSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const isScrollable = snap !== SNAP_POINTS[0];

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
            "fixed inset-x-0 bottom-0 z-[610] flex h-full max-h-[88vh] flex-col",
            "rounded-t-[1.5rem] border-t backdrop-blur-2xl",
            "map-liquid-card map-ui-enter pointer-events-auto",
            theme.panelStrongClassName
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing">
            <div className="h-1.5 w-12 rounded-full bg-sky-400/60" />
          </div>

          {/* Scrollable content area */}
          <div
            className={cn(
              "flex-1 overscroll-contain px-3 pb-4",
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
