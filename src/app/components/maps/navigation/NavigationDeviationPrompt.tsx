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
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Return a human-friendly supporting line from event metadata. */
function supportingLine(event: DeviationEvent): string {
  const miles = event.metadata?.distanceMiles;
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
}: NavigationDeviationPromptProps) {
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
      className="bd-glass-floating animate-in fade-in slide-in-from-top-2 mx-auto flex max-w-2xl items-center gap-4 px-5 py-3.5 duration-300"
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
        <Navigation className="h-4.5 w-4.5" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
          You&rsquo;re off route
        </p>
        <p className="mt-0.5 text-xs leading-4 text-slate-500 dark:text-slate-400">
          {supportingLine(event)}
        </p>
      </div>

      {/* Primary action */}
      {onReviewRoute && (
        <button
          className="bd-glass-control shrink-0 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
          onClick={onReviewRoute}
          type="button"
        >
          Review route
        </button>
      )}

      {/* Dismiss */}
      <button
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        onClick={handleDismiss}
        type="button"
        aria-label="Dismiss off-route notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
