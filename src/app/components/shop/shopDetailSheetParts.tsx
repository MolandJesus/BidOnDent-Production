import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

export type ShopDetailSheetProps = {
  shop: ShopMapListing | null;
  onClose: () => void;
  onGetDirections?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  isSaved?: boolean;
  onToggleSave?: (shop: ShopMapListing) => void;
  isDark?: boolean;
};

export function RatingBar({
  label,
  value,
  isDark = true,
}: {
  label: string;
  value: number;
  isDark?: boolean;
}) {
  const pct = Math.round(value * 20);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 opacity-70">{label}</span>
      <div
        className={`h-1.5 flex-1 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}
      >
        <div className="h-full rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right font-medium">{value.toFixed(1)}</span>
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function buildSheetTheme(isDark: boolean) {
  return {
    bg: isDark
      ? "bg-slate-900/95 border-white/10 text-slate-100"
      : "bg-white/95 border-slate-200 text-slate-800",
    cardBg: isDark ? "border-white/8 bg-white/[0.04]" : "border-slate-200/60 bg-slate-50",
    mutedText: isDark ? "text-slate-400" : "text-slate-500",
    accentText: isDark ? "text-blue-300" : "text-blue-600",
    ctaPrimary: isDark
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white",
    ctaSecondary: isDark
      ? "bg-white/10 hover:bg-white/20 text-white"
      : "bg-slate-100 hover:bg-slate-200 text-slate-700",
  };
}
