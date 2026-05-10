import { useEffect, useCallback } from "react";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";
import type {
  NotificationToast as ToastData,
  ToastVariant,
  NotificationDeepLink,
} from "../../features/notifications";

interface NotificationToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
  onDeepLinkClick?: (deepLink: NotificationDeepLink) => void;
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: typeof Info; accent: string }> = {
  info: { icon: Info, accent: "text-blue-400" },
  success: { icon: CheckCircle, accent: "text-emerald-400" },
  warning: { icon: AlertTriangle, accent: "text-amber-400" },
  error: { icon: AlertCircle, accent: "text-rose-400" },
};

export default function NotificationToast({
  toast,
  onDismiss,
  onDeepLinkClick,
}: NotificationToastProps) {
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

  const handleToastClick = useCallback(() => {
    if (toast?.deepLink && onDeepLinkClick) {
      onDeepLinkClick(toast.deepLink);
      onDismiss();
    }
  }, [toast, onDeepLinkClick, onDismiss]);

  if (!toast) return null;

  const { icon: Icon, accent } = VARIANT_CONFIG[toast.variant];
  const isClickable = !!toast.deepLink && !!onDeepLinkClick;

  return (
    <div
      role="status"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      className="fixed top-4 right-4 z-[9999] max-w-sm animate-slide-in-right motion-reduce:animate-none"
    >
      <div
        onClick={isClickable ? handleToastClick : undefined}
        className={`bd-glass-card flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg ${
          isClickable ? "cursor-pointer transition-transform active:scale-[0.98]" : ""
        }`}
      >
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
        <p className="flex-1 text-sm font-medium text-slate-200">{toast.message}</p>
        {isClickable && <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
