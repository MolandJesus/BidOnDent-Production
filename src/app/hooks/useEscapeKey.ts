import { useEffect } from "react";

/**
 * useEscapeKey — invoke a callback when the user presses the Escape key.
 *
 * Pass 63 (2026-05-07) — KI-118 fix surface. Bottom-sheet / floating-panel
 * style overlays in BidOnDent's map UI (NavigationVoiceControlsSheet,
 * NavigationSettingsSheet) are not rendered as native dialogs and therefore
 * do not get the browser's built-in ESC-to-close behavior. Without it,
 * keyboard-only users have no way to dismiss them — a WCAG 2.1 §2.1.2
 * keyboard-trap concern.
 *
 * Usage:
 *   useEscapeKey(open, onClose);
 *
 * The listener is only attached while `enabled` is true, so it's safe to
 * mount the hook in components that conditionally render overlays.
 */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [enabled, onEscape]);
}
