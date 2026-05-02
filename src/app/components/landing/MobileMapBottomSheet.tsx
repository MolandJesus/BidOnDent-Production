/**
 * MobileMapBottomSheet — Mobile-only bottom sheet for map browse content.
 *
 * Interaction model (per owner direction, 2026-05-02):
 *
 *   • Single fixed height (no snap points). The sheet appears at ~92dvh tall
 *     when the user opens the full map experience.
 *   • Drag the handle DOWN → the sheet follows the touch → past the close
 *     threshold the sheet dismisses, which closes the parent dialog and
 *     returns the user to the landing page with the map underneath.
 *   • An always-present X button sits in the same header row as the drag
 *     handle, on the right with comfortable padding so it never feels
 *     clipped. One tap = exit.
 *
 * Why no snap points: vaul's snap-point dismissal requires the user to drag
 * BELOW the lowest snap with velocity. Slow drags get "caught" at the
 * COLLAPSED snap and the user feels stuck. Without snap points, drag-down
 * is a single continuous gesture that dismisses cleanly.
 *
 * Scroll: when content overflows the sheet, the inner content area scrolls
 * naturally on touch. The `data-vaul-no-drag` attribute keeps the drawer
 * from intercepting scroll touchmoves; explicit `touch-action: pan-y` and
 * `WebkitOverflowScrolling: touch` give iOS Safari native momentum.
 */

import { type ReactNode, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import { cn } from "../ui/utils";

type MobileMapBottomSheetProps = {
  tone: MapSurfaceTone;
  children: ReactNode;
  /** Closes the parent map dialog. Called when the user dismisses the sheet
   *  by swiping down OR taps the always-present X button. */
  onCloseMap?: () => void;
};

export default function MobileMapBottomSheet({
  tone,
  children,
  onCloseMap,
}: MobileMapBottomSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const [open, setOpen] = useState(true);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Drag-down past close threshold → vaul fires onOpenChange(false).
      // Forward up so the parent dialog closes and the user returns to
      // the landing page.
      onCloseMap?.();
    }
  }

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      dismissible
      fixed
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[610] flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden",
            "rounded-t-[1.6rem] border-t backdrop-blur-2xl shadow-[0_-24px_64px_rgba(15,23,42,0.22)]",
            "map-liquid-card map-ui-enter pointer-events-auto",
            theme.panelStrongClassName
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Decorative top sheen — purely visual, no touch capture. */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-16",
              tone === "light"
                ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]"
                : "bg-[linear-gradient(180deg,rgba(147,197,253,0.10),transparent)]"
            )}
          />

          {/* Header row — drag handle centered, X close on the right.
              Both share the same row with deliberate padding so the X has
              clear visual room and never reads as cramped or clipped. */}
          <div className="relative flex shrink-0 items-center justify-center px-4 pt-3 pb-2">
            <DrawerPrimitive.Handle
              aria-label="Swipe down to close map"
              className="cursor-grab active:cursor-grabbing"
            >
              <div
                className={cn(
                  "h-1.5 w-12 rounded-full",
                  tone === "light" ? "bg-slate-300/90" : "bg-sky-400/45"
                )}
              />
            </DrawerPrimitive.Handle>

            {onCloseMap ? (
              <button
                type="button"
                onClick={onCloseMap}
                aria-label="Close map"
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all hover:scale-105 active:scale-95",
                  tone === "light"
                    ? "border-white/80 bg-white/95 text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
                    : "border-white/15 bg-slate-950/85 text-white shadow-[0_6px_18px_rgba(2,6,23,0.42)]"
                )}
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            ) : null}
          </div>

          {/* Scrollable content area. `data-vaul-no-drag` prevents the drawer
              from intercepting touchmove inside the content, so the inner
              scroll is unaffected by the drawer's drag-to-dismiss gesture. */}
          <div
            data-vaul-no-drag
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-4"
            style={{
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
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
