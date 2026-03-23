import { useEffect, useCallback } from "react";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import type { NotificationToast as ToastData, ToastVariant } from "../../features/notifications";

interface NotificationToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof Info; accent: string }> = {
  info: { icon: Info, accent: "text-blue-400" },
  success: { icon: CheckCircle, accent: "text-emerald-400" },
  warning: { icon: AlertTriangle, accent: "text-amber-400" },
  error: { icon: AlertCircle, accent: "text-rose-400" },
};

export default function NotificationToast({ toast, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (!toast || toast.durationMs <= 0) return;
    const timer = setTimeout(onDismiss, toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  if (!toast) return null;

  const { icon: Icon, accent } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      className="fixed top-4 right-4 z-[9999] max-w-sm animate-slide-in-right"
    >
      <div className="bd-glass-card flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
        <p className="flex-1 text-sm font-medium text-slate-200">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
