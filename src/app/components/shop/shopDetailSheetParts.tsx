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
      ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,16,33,0.94))] border-[rgba(96,165,250,0.20)] text-slate-100 shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_-22px_56px_rgba(2,6,23,0.46),0_0_56px_rgba(196,130,45,0.14)]"
      : "bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.92))] border-[rgba(140,82,22,0.30)] text-slate-800 shadow-[inset_0_1px_0_rgba(252,240,208,0.85),0_-18px_46px_rgba(15,23,42,0.14),0_0_0_1px_rgba(140,82,22,0.18)]",
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
