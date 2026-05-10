/**
 * EmbeddedBrowserBanner
 *
 * Pass 170 (2026-05-07) — Google OAuth `disallowed_useragent` mitigation.
 *
 * Dev-mode-only banner that appears when the app is being loaded inside
 * an embedded browser (VS Code Simple Browser, Electron shell, Android
 * WebView). Tells the developer that "Sign in with Google" will fail
 * with Google's `disallowed_useragent` 403 + offers two workarounds:
 *
 *   1. Open `localhost:5173` in a real Chrome/Firefox/Safari window.
 *   2. Append `?demo=customer` or `?demo=shop` to the URL to bypass
 *      Clerk auth entirely (synthesized data; gated on import.meta.env.DEV).
 *
 * Production users never see this — the entire component is short-
 * circuited when `import.meta.env.DEV` is false. No bundle cost in
 * production builds (Vite tree-shakes the import).
 *
 * No KI dependency — this is a pure dev-experience improvement.
 */

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { describeEmbeddedBrowser, isEmbeddedBrowser } from "../../utils/embeddedBrowserCheck";

const DISMISS_KEY = "bidondent.dev.embedded-browser-banner.dismissed";

export default function EmbeddedBrowserBanner() {
  // Production short-circuit — Vite eliminates this whole component when
  // import.meta.env.DEV is false (string-replaced at build time).
  if (!import.meta.env.DEV) return null;
  if (!isEmbeddedBrowser()) return null;

  // Hydration-safe localStorage read with try/catch (some embedded contexts
  // throw on localStorage access).
  const initialDismissed = (() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  })();

  const [dismissed, setDismissed] = useState(initialDismissed);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore — banner just won't persist dismissal.
    }
  };

  if (dismissed) return null;

  const detectedKind = describeEmbeddedBrowser() ?? "an embedded browser";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[10000] bg-amber-100 border-b-2 border-amber-300 text-amber-900 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-2.5 text-sm">
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            DEV: Detected {detectedKind}. "Sign in with Google" will fail (Google policy).
          </div>
          <div className="mt-0.5 text-xs leading-relaxed">
            Two workarounds:{" "}
            <a
              href={typeof window !== "undefined" ? window.location.href : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium underline decoration-amber-600 underline-offset-2 hover:decoration-amber-800"
            >
              open in real Chrome
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>{" "}
            (full OAuth works) — or append{" "}
            <code className="rounded bg-amber-200 px-1 py-0.5 text-[11px] font-mono">
              ?demo=customer
            </code>{" "}
            /{" "}
            <code className="rounded bg-amber-200 px-1 py-0.5 text-[11px] font-mono">
              ?demo=shop
            </code>{" "}
            to bypass Clerk entirely.
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss embedded browser banner"
          className="shrink-0 rounded-full p-1 hover:bg-amber-200 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
