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

/**
 * Snap points mix pixel values (24, 88) with viewport fractions (0.48, 0.92).
 * This helper converts the active snap to an ordinal rank so comparison logic
 * works correctly regardless of unit type.
 *
 *   0 = collapsed (24 px)
 *   1 = peek      (88 px)
 *   2 = half      (48 %)
 *   3 = full      (92 %)
 */
function snapLevel(value: number | string | null): number {
  const v = typeof value === "string" ? Number.parseFloat(value) : value;
  if (v === null || v === undefined || !Number.isFinite(v)) return 0;
  if (v === FULL) return 3;
  if (v === HALF) return 2;
  if (v === PEEK) return 1;
  if (v === COLLAPSED) return 0;
  // Intermediate drag values: fractions (0–1) are viewport-% → always above pixel snaps
  if (v > 0 && v <= 1) return v >= FULL - 0.01 ? 3 : v >= HALF - 0.01 ? 2 : 1;
  // Pixel values
  if (v >= PEEK - 1) return 1;
  return 0;
}

export default function MobileMapBottomSheet({ tone, children }: MobileMapBottomSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);
  // Start collapsed so the fullscreen map stays the primary surface on phones.
  const [snap, setSnap] = useState<number | string | null>(COLLAPSED);
  const level = snapLevel(snap);
  const isCollapsed = level === 0;
  const isScrollable = level >= 1;
  const showBackToMap = level >= 2;

  const collapseToMap = useCallback(() => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setSnap(COLLAPSED);
  }, []);

  return (
    <DrawerPrimitive.Root
      open
      modal={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      dismissible={false}
      fixed
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[610] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden",
            "rounded-t-[1.6rem] border-t backdrop-blur-2xl shadow-[0_-24px_64px_rgba(15,23,42,0.22)]",
            "map-liquid-card map-ui-enter",
            // pointer-events-none when collapsed so the map behind stays interactive;
            // auto when the sheet is raised so all sheet content receives touches.
            isCollapsed ? "pointer-events-none" : "pointer-events-auto",
            theme.panelStrongClassName
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-16",
              tone === "light"
                ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]"
                : "bg-[linear-gradient(180deg,rgba(147,197,253,0.10),transparent)]"
            )}
          />
          {/* Drag handle — always interactive so the user can swipe up even when collapsed */}
          <DrawerPrimitive.Handle className="pointer-events-auto flex shrink-0 cursor-grab items-center justify-center py-3 active:cursor-grabbing">
            <div
              className={cn(
                "h-1.5 w-12 rounded-full",
                tone === "light" ? "bg-slate-300/90" : "bg-sky-400/45"
              )}
            />
          </DrawerPrimitive.Handle>

          {/* Header strip — "Back to Map" affordance when sheet covers the map */}
          {showBackToMap && (
            <div className="flex shrink-0 items-center justify-between px-4 pb-2">
              <button
                type="button"
                onClick={collapseToMap}
                className={cn(
                  "flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold",
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
              "flex-1 min-h-0 touch-auto overscroll-y-contain px-3 pb-4 [-webkit-overflow-scrolling:touch]",
              isScrollable ? "overflow-y-auto" : "overflow-hidden"
            )}
          >
            <div className="space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
              {children}
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
