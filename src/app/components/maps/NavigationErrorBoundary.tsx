import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render / runtime errors inside the navigation experience
 * and shows a calm, trust-preserving recovery UI.
 */
export default class NavigationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for diagnostics — no silent swallow
    console.error("[NavigationErrorBoundary]", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="bd-glass-card flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Navigation hit an error
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your data is safe. Try reopening navigation.
        </p>

        <button
          type="button"
          onClick={this.handleReset}
          className="bd-glass-control mt-1 inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }
}
