import { cn } from "../ui/utils";
import type { MapSurfaceTheme, MapSurfaceTone, MapSurfaceToneVariant, MapTileMode } from "./serviceCoverageMapTypes";

const baseTheme = {
  shellClassName:
    "ring-1 ring-inset backdrop-blur-2xl transition-[background,border-color,box-shadow] duration-300",
  panelClassName:
    "rounded-[1.5rem] border backdrop-blur-2xl shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition-[background,border-color,color,box-shadow] duration-300",
  panelStrongClassName:
    "rounded-[1.7rem] border backdrop-blur-3xl shadow-[0_26px_64px_rgba(15,23,42,0.18)] transition-[background,border-color,color,box-shadow] duration-300",
  accentPanelClassName:
    "rounded-[1.7rem] border backdrop-blur-3xl shadow-[0_24px_56px_rgba(59,130,246,0.18)] transition-[background,border-color,color,box-shadow] duration-300",
  segmentedClassName:
    "inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-2xl shadow-[0_16px_36px_rgba(15,23,42,0.14)] transition-[background,border-color,box-shadow] duration-300",
  buttonBaseClassName:
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 min-h-[44px] text-sm font-semibold backdrop-blur-xl transition-all duration-200 active:scale-[0.97]",
  iconButtonBaseClassName:
    "inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-200 active:scale-[0.94]",
  eyebrowClassName:
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
  metricLabelClassName: "text-[11px] font-semibold uppercase tracking-[0.22em]",
};

const toneThemes: Record<MapSurfaceTone, MapSurfaceToneVariant> = {
  light: {
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_36%),radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.2),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(191,219,254,0.16))]",
    shellToneClassName:
      "border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(219,234,254,0.66))] shadow-[0_34px_90px_rgba(30,58,138,0.16)]",
    immersiveShellToneClassName:
      "border-blue-100/60 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.62),rgba(239,246,255,0.86)_36%,rgba(219,234,254,0.78)_100%)] shadow-[0_44px_120px_rgba(30,58,138,0.2)]",
    mapCanvasClassName: "bg-[#dce8f7]",
    panelToneClassName: "border-white/40 bg-white/36",
    panelStrongToneClassName:
      "border-blue-100/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(219,234,254,0.42))]",
    accentPanelToneClassName:
      "border-blue-300/40 bg-[linear-gradient(180deg,rgba(239,246,255,0.64),rgba(191,219,254,0.48))]",
    segmentedToneClassName: "border-white/40 bg-white/30",
    activeSegmentClassName: "bg-sky-500/80 text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)]",
    inactiveSegmentClassName: "text-slate-600 hover:bg-white/35 hover:text-slate-900",
    primaryButtonToneClassName:
      "border-blue-300/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.82),rgba(29,78,216,0.88))] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.28)] hover:brightness-110",
    secondaryButtonToneClassName:
      "border-white/40 bg-white/30 text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:bg-white/45 hover:text-slate-900",
    destructiveButtonToneClassName:
      "border-rose-200/50 bg-[linear-gradient(180deg,#fb7185,#e11d48)] text-white shadow-[0_14px_26px_rgba(244,63,94,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(244,63,94,0.28)]",
    tertiaryButtonToneClassName:
      "border-white/30 bg-white/20 text-slate-600 hover:bg-white/35 hover:text-slate-800",
    iconButtonToneClassName:
      "border-white/40 bg-white/30 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-white/45 hover:text-slate-900",
    titleClassName: "text-slate-950",
    bodyClassName: "text-slate-700",
    secondaryTextClassName: "text-slate-500",
    badgeClassName: "border-blue-200/80 bg-blue-100/80 text-blue-900",
    softBadgeClassName: "border-white/40 bg-white/30 text-slate-600",
    listCardToneClassName: "border-white/35 bg-white/30 hover:-translate-y-0.5 hover:bg-white/42",
    selectedListCardToneClassName:
      "border-blue-300/40 bg-[linear-gradient(180deg,rgba(239,246,255,0.72),rgba(191,219,254,0.52))] shadow-[0_16px_36px_rgba(37,99,235,0.14)]",
  },
  dark: {
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(37,99,235,0.22),transparent_24%),linear-gradient(180deg,rgba(30,58,138,0.2),rgba(2,6,23,0.38))]",
    shellToneClassName:
      "border-blue-300/15 bg-[linear-gradient(180deg,rgba(30,58,138,0.44),rgba(2,6,23,0.92))] shadow-[0_32px_88px_rgba(2,6,23,0.46)]",
    immersiveShellToneClassName:
      "border-blue-200/12 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),rgba(15,23,42,0.92)_36%,rgba(2,6,23,0.96)_100%)] shadow-[0_40px_110px_rgba(2,6,23,0.52)]",
    mapCanvasClassName: "bg-slate-950",
    panelToneClassName: "border-white/12 bg-slate-900/70",
    panelStrongToneClassName:
      "border-blue-200/15 bg-[linear-gradient(180deg,rgba(30,58,138,0.28),rgba(15,23,42,0.74))]",
    accentPanelToneClassName:
      "border-blue-300/25 bg-[linear-gradient(180deg,rgba(37,99,235,0.3),rgba(15,23,42,0.9))]",
    segmentedToneClassName: "border-white/12 bg-slate-900/78",
    activeSegmentClassName: "bg-blue-300 text-slate-950 shadow-[0_12px_22px_rgba(59,130,246,0.3)]",
    inactiveSegmentClassName: "text-slate-100 hover:bg-white/8 hover:text-white",
    primaryButtonToneClassName:
      "border-blue-300/30 bg-blue-300 text-slate-950 shadow-[0_14px_26px_rgba(59,130,246,0.24)] hover:-translate-y-0.5 hover:bg-blue-200",
    secondaryButtonToneClassName:
      "border-white/12 bg-slate-900/78 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800/88 hover:text-white",
    destructiveButtonToneClassName:
      "border-rose-400/25 bg-[linear-gradient(180deg,#fb7185,#e11d48)] text-white shadow-[0_14px_26px_rgba(244,63,94,0.2)] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(244,63,94,0.26)]",
    tertiaryButtonToneClassName:
      "border-white/10 bg-white/6 text-slate-300 hover:bg-white/12 hover:text-slate-100",
    iconButtonToneClassName:
      "border-white/12 bg-slate-900/78 text-slate-100 shadow-[0_14px_28px_rgba(2,6,23,0.24)] hover:-translate-y-0.5 hover:bg-slate-800/88 hover:text-white",
    titleClassName: "text-white",
    bodyClassName: "text-slate-200",
    secondaryTextClassName: "text-slate-400",
    badgeClassName: "border-blue-300/30 bg-blue-400/16 text-blue-50",
    softBadgeClassName: "border-white/12 bg-white/8 text-slate-300",
    listCardToneClassName:
      "border-white/10 bg-slate-900/76 hover:-translate-y-0.5 hover:bg-slate-900/88",
    selectedListCardToneClassName:
      "border-blue-300/30 bg-[linear-gradient(180deg,rgba(59,130,246,0.2),rgba(15,23,42,0.78))] shadow-[0_22px_44px_rgba(59,130,246,0.18)]",
  },
};

export function resolveMapSurfaceTone(tileMode: MapTileMode): MapSurfaceTone {
  return tileMode === "night" ? "dark" : "light";
}

export function getMapSurfaceTheme(
  tone: MapSurfaceTone,
  immersiveFullscreen = false
): MapSurfaceTheme {
  const toneTheme = toneThemes[tone];

  return {
    ...baseTheme,
    ...toneTheme,
    shellClassName: cn(
      baseTheme.shellClassName,
      immersiveFullscreen ? toneTheme.immersiveShellToneClassName : toneTheme.shellToneClassName
    ),
    panelClassName: cn(baseTheme.panelClassName, toneTheme.panelToneClassName),
    panelStrongClassName: cn(baseTheme.panelStrongClassName, toneTheme.panelStrongToneClassName),
    accentPanelClassName: cn(baseTheme.accentPanelClassName, toneTheme.accentPanelToneClassName),
    segmentedClassName: cn(baseTheme.segmentedClassName, toneTheme.segmentedToneClassName),
    primaryButtonClassName: cn(baseTheme.buttonBaseClassName, toneTheme.primaryButtonToneClassName),
    secondaryButtonClassName: cn(
      baseTheme.buttonBaseClassName,
      toneTheme.secondaryButtonToneClassName
    ),
    destructiveButtonClassName: cn(
      baseTheme.buttonBaseClassName,
      toneTheme.destructiveButtonToneClassName
    ),
    tertiaryButtonClassName: cn(
      baseTheme.buttonBaseClassName,
      toneTheme.tertiaryButtonToneClassName
    ),
    iconButtonClassName: cn(baseTheme.iconButtonBaseClassName, toneTheme.iconButtonToneClassName),
    eyebrowClassName: cn(baseTheme.eyebrowClassName, toneTheme.badgeClassName),
    metricLabelClassName: cn(baseTheme.metricLabelClassName, toneTheme.secondaryTextClassName),
    listCardClassName: cn(
      "rounded-[1.5rem] border p-4 backdrop-blur-2xl shadow-[0_18px_36px_rgba(15,23,42,0.12)] transition-all duration-200",
      toneTheme.listCardToneClassName
    ),
    selectedListCardClassName: cn(
      "rounded-[1.5rem] border p-4 backdrop-blur-2xl shadow-[0_18px_36px_rgba(15,23,42,0.14)] transition-all duration-200",
      toneTheme.selectedListCardToneClassName
    ),
  };
}
