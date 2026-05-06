import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./app/App.tsx";
import { initSentry } from "./app/services/sentryInit.ts";
import { captureException } from "./app/services/errorReporting.ts";
import { validateAppConfig } from "./app/utils/validateAppConfig.ts";
import "./styles/index.css";

// Initialize Sentry before React renders (no-op without VITE_SENTRY_DSN)
initSentry();

// Validate critical configuration at startup
validateAppConfig();

type GlobalErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class GlobalErrorBoundary extends Component<{ children: ReactNode }, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, {
      boundary: "GlobalErrorBoundary",
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center px-5 py-12">
          {/* F-18 (KI-098): canon-aligned error boundary panel.
              Pre-fix used rgba(255,255,255,0.82) body + bg-white button +
              rgba(255,255,255,0.42) inset highlight — three LAW Light-Mode
              Surface Rule violations. Replaced with cool ice body in canon
              opacity range, canon cream highlight inset, and canon bronze
              trim border. Kept backdrop-filter (the crash card stays a
              premium glass surface even on catastrophic failure). */}
          <div
            className="mx-auto w-full max-w-md rounded-2xl border p-8 text-center"
            style={{
              borderColor: "rgba(140,82,22,0.22)",
              background: "linear-gradient(180deg, rgba(248,250,255,0.84), rgba(229,238,250,0.76))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 16px 44px rgba(15,23,42,0.12), inset 0 1px 0 rgba(252,240,208,0.42)",
            }}
          >
            {/* Logo mark */}
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{
                background: "linear-gradient(135deg, #003d82 0%, #00a0e9 100%)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              BidOnDent ran into an unexpected problem. Your data is safe — try reloading or come
              back in a moment.
            </p>

            {import.meta.env.DEV && this.state.errorMessage && (
              <p className="mt-4 rounded-lg bg-slate-100 p-3 text-left font-mono text-xs text-slate-600 break-words">
                {this.state.errorMessage}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="bd-dashboard-primary-button inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #003d82 0%, #00a0e9 100%)",
                }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[rgba(248,250,255,0.92)] px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[rgba(238,247,255,0.95)]"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </GlobalErrorBoundary>
);

// ── Global unhandled error capture ──
// Catches errors outside React's tree (async, event handlers, third-party scripts).
// Funnels through the same reporting service for future Sentry integration.

window.addEventListener("error", (event) => {
  if (event.error instanceof Error) {
    captureException(event.error, { boundary: "window.onerror" });
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const error =
    reason instanceof Error ? reason : new Error(String(reason ?? "Unhandled promise rejection"));
  captureException(error, { boundary: "unhandledrejection" });
});
