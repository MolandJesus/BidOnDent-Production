import { cn } from "../ui/utils";
import type { MapSurfaceTheme, MapSurfaceTone, MapTileMode } from "./serviceCoverageMapTypes";

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
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
  iconButtonBaseClassName:
    "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200",
  eyebrowClassName: "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
  metricLabelClassName: "text-[11px] font-semibold uppercase tracking-[0.22em]",
};

const toneThemes: Record<MapSurfaceTone, Omit<MapSurfaceTheme, keyof typeof baseTheme>> = {
  light: {
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_36%),radial-gradient(circle_at_18%_20%,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(203,213,225,0.14))]",
    shellToneClassName:
      "border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(226,232,240,0.64))] shadow-[0_34px_90px_rgba(15,23,42,0.18)]",
    immersiveShellToneClassName:
      "border-white/60 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.62),rgba(241,245,249,0.84)_36%,rgba(226,232,240,0.74)_100%)] shadow-[0_44px_120px_rgba(15,23,42,0.22)]",
    mapCanvasClassName: "bg-[#dce8f7]",
    panelToneClassName: "border-white/75 bg-white/72",
    panelStrongToneClassName:
      "border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(241,245,249,0.72))]",
    accentPanelToneClassName:
      "border-sky-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(219,234,254,0.76))]",
    segmentedToneClassName: "border-white/80 bg-white/72",
    activeSegmentClassName:
      "bg-[linear-gradient(180deg,#0ea5e9,#0284c7)] text-white shadow-[0_12px_22px_rgba(14,165,233,0.28)]",
    inactiveSegmentClassName:
      "text-slate-600 hover:bg-white/80 hover:text-slate-900",
    primaryButtonToneClassName:
      "border-sky-300/80 bg-[linear-gradient(180deg,#38bdf8,#0ea5e9)] text-white shadow-[0_14px_26px_rgba(14,165,233,0.26)] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(14,165,233,0.28)]",
    secondaryButtonToneClassName:
      "border-white/80 bg-white/72 text-slate-700 hover:-translate-y-0.5 hover:bg-white/88 hover:text-slate-950",
    iconButtonToneClassName:
      "border-white/80 bg-white/72 text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:bg-white/88 hover:text-slate-950",
    titleClassName: "text-slate-950",
    bodyClassName: "text-slate-700",
    secondaryTextClassName: "text-slate-500",
    badgeClassName: "border-sky-200/80 bg-sky-100/80 text-sky-900",
    softBadgeClassName: "border-white/80 bg-white/72 text-slate-600",
    listCardToneClassName: "border-white/80 bg-white/78 hover:-translate-y-0.5 hover:bg-white/90",
    selectedListCardToneClassName:
      "border-sky-300/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.86))] shadow-[0_22px_44px_rgba(56,189,248,0.16)]",
  },
  dark: {
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_78%_12%,rgba(59,130,246,0.18),transparent_24%),linear-gradient(180deg,rgba(8,47,73,0.18),rgba(2,6,23,0.36))]",
    shellToneClassName:
      "border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.9))] shadow-[0_32px_88px_rgba(2,6,23,0.42)]",
    immersiveShellToneClassName:
      "border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),rgba(15,23,42,0.9)_36%,rgba(2,6,23,0.96)_100%)] shadow-[0_40px_110px_rgba(2,6,23,0.5)]",
    mapCanvasClassName: "bg-slate-950",
    panelToneClassName: "border-white/12 bg-slate-900/70",
    panelStrongToneClassName:
      "border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.72))]",
    accentPanelToneClassName:
      "border-cyan-400/25 bg-[linear-gradient(180deg,rgba(14,116,144,0.28),rgba(15,23,42,0.9))]",
    segmentedToneClassName: "border-white/12 bg-slate-900/78",
    activeSegmentClassName:
      "bg-cyan-400 text-slate-950 shadow-[0_12px_22px_rgba(34,211,238,0.25)]",
    inactiveSegmentClassName:
      "text-slate-100 hover:bg-white/8 hover:text-white",
    primaryButtonToneClassName:
      "border-cyan-400/25 bg-cyan-400 text-slate-950 shadow-[0_14px_26px_rgba(34,211,238,0.18)] hover:-translate-y-0.5 hover:bg-cyan-300",
    secondaryButtonToneClassName:
      "border-white/12 bg-slate-900/78 text-slate-100 hover:-translate-y-0.5 hover:bg-slate-800/88 hover:text-white",
    iconButtonToneClassName:
      "border-white/12 bg-slate-900/78 text-slate-100 shadow-[0_14px_28px_rgba(2,6,23,0.24)] hover:-translate-y-0.5 hover:bg-slate-800/88 hover:text-white",
    titleClassName: "text-white",
    bodyClassName: "text-slate-200",
    secondaryTextClassName: "text-slate-400",
    badgeClassName: "border-cyan-400/25 bg-cyan-400/12 text-cyan-50",
    softBadgeClassName: "border-white/12 bg-white/8 text-slate-300",
    listCardToneClassName:
      "border-white/10 bg-slate-900/76 hover:-translate-y-0.5 hover:bg-slate-900/88",
    selectedListCardToneClassName:
      "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.78))] shadow-[0_22px_44px_rgba(6,182,212,0.16)]",
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
