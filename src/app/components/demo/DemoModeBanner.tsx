/**
 * Demo Mode Banner Component
 * Displays at top of app when in demo mode to inform users
 */

import { Info, X } from "lucide-react";
import { useState } from "react";

interface DemoModeBannerProps {
  showDismiss?: boolean;
}

export default function DemoModeBanner({ showDismiss = true }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="bg-gradient-to-r from-[#003d82] to-[#00a0e9] text-white py-3 px-4 shadow-md"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Info className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base">🎭 Demo Mode Active</p>
            <p className="text-xs md:text-sm opacity-90">
              All data is stored locally in your browser. Try:{" "}
              <code className="bg-white/20 px-1 rounded">customer@demo.com</code> /{" "}
              <code className="bg-white/20 px-1 rounded">demo123</code>
            </p>
          </div>
        </div>

        {showDismiss && (
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
