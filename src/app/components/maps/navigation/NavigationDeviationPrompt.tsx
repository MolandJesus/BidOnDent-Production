/**
 * NavigationDeviationPrompt
 *
 * Calm, compact off-route notification banner.
 * Appears when the deviation intelligence layer detects an off-route condition.
 * Apple Maps–inspired: gentle, non-punitive, actionable in 1–2 seconds.
 *
 * Architecture note:
 *   No deviation logic lives here — event data flows in via props.
 *   Reroute / voice behaviors will extend from this seam later.
 */

import { useEffect, useState } from "react";
import { Navigation, X } from "lucide-react";
import type { DeviationEvent } from "../../../features/navigation";
import type { MapTheme } from "../../../types/mapDomain";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface NavigationDeviationPromptProps {
  /** The most recent deviation event — show prompt only when type is relevant. */
  event: DeviationEvent | null;
  /** Called when the user taps the primary action (e.g. "Review route"). */
  onReviewRoute?: () => void;
  /** Called when the user dismisses the prompt. */
  onDismiss?: () => void;
  /** Map theme for consistent appearance-mode styling. */
  mapTheme?: MapTheme;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Return a human-friendly supporting line from event metadata. */
function supportingLine(event: DeviationEvent): string {
  const miles = (event.metadata as Record<string, unknown>)?.distanceMiles;
  if (typeof miles === "number") {
    const rounded = Math.round(miles * 10) / 10;
    return `You're about ${rounded} mi from the planned route.`;
  }
  return event.description;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NavigationDeviationPrompt({
  event,
  onReviewRoute,
  onDismiss,
  mapTheme = "dark",
}: NavigationDeviationPromptProps) {
  const isDark = mapTheme === "dark";
  /* ------ visibility state ------ */
  const [dismissed, setDismissed] = useState(false);

  // Reset dismiss state when a *new* event arrives
  useEffect(() => {
    if (event) setDismissed(false);
  }, [event?.id]);

  /* ------ decide whether to render ------ */
  const isOffRoute = event?.type === "off_route";
  if (!isOffRoute || dismissed) return null;

  /* ------ handlers ------ */
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  /* ------ render ------ */
  return (
    <div
      className={`animate-in fade-in slide-in-from-top-2 mx-auto flex max-w-2xl items-center gap-4 rounded-2xl border px-5 py-3.5 shadow-xl backdrop-blur-xl duration-300 ${
        isDark
          ? "border-white/[0.12] bg-slate-950/80 text-white"
          : "border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-900 shadow-[0_14px_34px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(252,240,208,0.85),0_0_0_1px_rgba(196,144,65,0.20)]"
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-600"
        }`}
      >
        <Navigation className="h-4.5 w-4.5" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold leading-5 ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          You&rsquo;re off route
        </p>
        <p className={`mt-0.5 text-xs leading-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {supportingLine(event)}
        </p>
      </div>

      {/* Primary action */}
      {onReviewRoute && (
        <button
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            isDark
              ? "border-white/[0.12] bg-white/[0.06] text-blue-300 hover:bg-white/[0.10]"
              : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
          onClick={onReviewRoute}
          type="button"
        >
          Review route
        </button>
      )}

      {/* Dismiss */}
      <button
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
          isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
        }`}
        onClick={handleDismiss}
        type="button"
        aria-label="Dismiss off-route notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
