import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureException } from "../services/errorReporting";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  isChunkError: boolean;
}

/**
 * Screen-level error boundary for lazy-loaded dashboard views.
 * Keeps the shell (header, sidebar, nav) intact while showing
 * a retry affordance inside the content area.
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: "", isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    const msg = error?.message || "";
    const isChunkError =
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Loading chunk") ||
      msg.includes("Loading CSS chunk");
    return { hasError: true, errorMessage: msg || "Something went wrong.", isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, {
      boundary: "ScreenErrorBoundary",
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  private handleRetry = () => {
    if (this.state.isChunkError) {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false, errorMessage: "", isChunkError: false });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-100">
          {this.state.isChunkError ? "Update available" : "This screen couldn't load"}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-sm">
          {this.state.isChunkError
            ? "A newer version of BidOnDent is available. Reload to get the latest."
            : "Something went wrong loading this view. Your data is safe."}
        </p>
        {import.meta.env.DEV && this.state.errorMessage && (
          <p className="mt-3 rounded-lg bg-slate-800/50 p-3 text-left font-mono text-xs text-slate-400 max-w-md break-words">
            {this.state.errorMessage}
          </p>
        )}
        <button
          type="button"
          onClick={this.handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          style={{ background: "linear-gradient(135deg, #003d82 0%, #00a0e9 100%)" }}
        >
          {this.state.isChunkError ? "Reload Page" : "Try Again"}
        </button>
      </div>
    );
  }
}
