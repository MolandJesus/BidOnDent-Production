/**
 * Demo Mode Banner — persistent status bar when viewing a demo account.
 * Keyboard-dismissible only (Escape key). Not confusable with a toast.
 * Rendered at the dashboard layout level so it survives route changes.
 */

import { Info } from "lucide-react";
import { useEffect, useState } from "react";

interface DemoModeBannerProps {
  /** The demo account type currently being previewed */
  demoAccountType?: "customer" | "shop" | "insurer" | null;
}

export default function DemoModeBanner({ demoAccountType }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismiss when the demo account type changes
  useEffect(() => {
    setDismissed(false);
  }, [demoAccountType]);

  // Keyboard dismiss: Escape key only
  useEffect(() => {
    if (dismissed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dismissed]);

  if (dismissed) return null;

  const roleLabel = demoAccountType
    ? demoAccountType.charAt(0).toUpperCase() + demoAccountType.slice(1)
    : "Demo";

  return (
    <div
      role="status"
      aria-live="polite"
      className="bd-banner--warn-prominent py-1.5 px-4 text-center text-xs font-semibold tracking-wide select-none shrink-0"
    >
      <span className="inline-flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Demo Mode — Viewing as {roleLabel}
        <span className="hidden sm:inline opacity-70">· Press Esc to dismiss</span>
      </span>
    </div>
  );
}
