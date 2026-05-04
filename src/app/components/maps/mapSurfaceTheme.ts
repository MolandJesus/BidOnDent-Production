import { cn } from "../ui/utils";
import type {
  MapSurfaceTheme,
  MapSurfaceTone,
  MapSurfaceToneVariant,
  MapTileMode,
} from "./serviceCoverageMapTypes";

const baseTheme = {
  shellClassName:
    "ring-1 ring-inset backdrop-blur-2xl transition-[background,border-color,box-shadow] duration-300",
  panelClassName:
    "rounded-[1.5rem] border backdrop-blur-2xl shadow-[0_22px_52px_rgba(15,23,42,0.14)] transition-[background,border-color,color,box-shadow] duration-300",
  panelStrongClassName:
    "rounded-[1.5rem] border backdrop-blur-3xl shadow-[0_30px_72px_rgba(15,23,42,0.18)] transition-[background,border-color,color,box-shadow] duration-300",
  accentPanelClassName:
    "rounded-[1.5rem] border backdrop-blur-3xl shadow-[0_28px_64px_rgba(59,130,246,0.18)] transition-[background,border-color,color,box-shadow] duration-300",
  segmentedClassName:
    "inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-2xl shadow-[0_18px_42px_rgba(15,23,42,0.14)] transition-[background,border-color,box-shadow] duration-300",
  buttonBaseClassName:
    "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 min-h-[44px] text-sm font-semibold backdrop-blur-xl transition-all duration-200 active:scale-[0.97]",
  compactButtonBaseClassName:
    "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 min-h-[36px] text-xs font-semibold backdrop-blur-xl transition-all duration-200 active:scale-[0.97]",
  iconButtonBaseClassName:
    "inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-200 active:scale-[0.94]",
  compactIconButtonBaseClassName:
    "inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-200 active:scale-[0.94]",
  eyebrowClassName:
    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
  metricLabelClassName: "text-[11px] font-semibold uppercase tracking-[0.22em]",
};

const toneThemes: Record<MapSurfaceTone, MapSurfaceToneVariant> = {
  light: {
    /* Premium gold lamp + cool blue dominant, locked 2026-05-03. The
       immersive shell is the fullscreen coverage map dialog — it now reads
       as the same liquid-glass family as the dashboard panels: cool blue
       canvas, bronze trim, gold lamp halo from the top, soft atmospheric
       falloff via wide low-opacity drops. NOT pure white. */
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(196,144,65,0.22),transparent_42%),radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.20),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.18),transparent_24%),linear-gradient(180deg,rgba(232,242,254,0.22),rgba(204,222,246,0.18))]",
    shellToneClassName:
      "border-[rgba(140,82,22,0.30)] bg-[radial-gradient(circle_at_top,rgba(196,144,65,0.20),rgba(232,242,254,0.92)_30%,rgba(214,230,248,0.86)_100%)] shadow-[0_40px_110px_rgba(15,30,60,0.18),0_70px_160px_rgba(15,30,60,0.10),0_0_0_1px_rgba(140,82,22,0.26),inset_0_1px_0_rgba(252,238,204,0.78),inset_0_-1px_0_rgba(140,82,22,0.30),0_0_80px_rgba(196,130,45,0.10)]",
    immersiveShellToneClassName:
      "border-[rgba(140,82,22,0.30)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,144,65,0.22),transparent_60%),radial-gradient(circle_at_top,rgba(96,165,250,0.18),rgba(232,242,254,0.92)_28%,rgba(204,222,246,0.86)_100%)] shadow-[0_50px_140px_rgba(15,30,60,0.18),0_80px_180px_rgba(15,30,60,0.10),0_0_0_1px_rgba(140,82,22,0.24),inset_0_1px_0_rgba(252,238,204,0.74),inset_0_-1px_0_rgba(140,82,22,0.28),0_0_100px_rgba(196,130,45,0.10)]",
    mapCanvasClassName: "bg-[#dce8f7]",
    /* Side/floating panels inside the map dialog — cool frosted blue with
       gold lamp halo + bronze trim; pure white surfaces are forbidden per
       LAW. Strong + accent variants increase the trim weight. */
    panelToneClassName:
      "border-[rgba(140,82,22,0.26)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,144,65,0.16),transparent_70%),linear-gradient(180deg,rgba(232,242,254,0.86),rgba(214,230,248,0.78))]",
    panelStrongToneClassName:
      "border-[rgba(140,82,22,0.32)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,144,65,0.20),transparent_70%),linear-gradient(180deg,rgba(232,242,254,0.92),rgba(204,222,246,0.86))]",
    accentPanelToneClassName:
      "border-[rgba(140,82,22,0.36)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,144,65,0.22),transparent_70%),linear-gradient(180deg,rgba(244,222,178,0.92),rgba(228,198,144,0.84))]",
    /* LAW correction (KI-066): map control bodies in light mode now use
       the cool blue-cream glass family instead of forbidden near-white.
       Cream insets replace white insets per locked palette. Legibility
       over map tiles is preserved by keeping alphas ≥ 0.78. */
    segmentedToneClassName:
      "border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(238,247,255,0.86),rgba(219,234,254,0.78))]",
    activeSegmentClassName:
      "bg-[linear-gradient(180deg,rgba(56,189,248,0.95),rgba(37,99,235,0.95))] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]",
    inactiveSegmentClassName:
      "text-slate-600 hover:bg-[rgba(232,242,254,0.65)] hover:text-slate-900",
    primaryButtonToneClassName:
      "border-blue-300/42 bg-[linear-gradient(180deg,rgba(59,130,246,0.86),rgba(29,78,216,0.92))] text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(37,99,235,0.28)] hover:brightness-110",
    secondaryButtonToneClassName:
      "border-[rgba(140,82,22,0.32)] bg-[linear-gradient(180deg,rgba(238,247,255,0.92),rgba(219,234,254,0.84))] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96),rgba(219,234,254,0.90))] hover:text-slate-950",
    destructiveButtonToneClassName:
      "border-rose-200/50 bg-[linear-gradient(180deg,#fb7185,#e11d48)] text-white shadow-[0_14px_26px_rgba(244,63,94,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(244,63,94,0.28)]",
    tertiaryButtonToneClassName:
      "border-[rgba(147,197,253,0.40)] bg-[rgba(232,242,254,0.55)] text-slate-600 hover:bg-[rgba(232,242,254,0.78)] hover:text-slate-800",
    compactButtonToneClassName:
      "border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(238,247,255,0.88),rgba(219,234,254,0.80))] text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.08)] hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96),rgba(219,234,254,0.88))] hover:text-slate-950",
    compactActiveButtonToneClassName:
      "border-sky-300/50 bg-sky-500/80 text-white shadow-[0_4px_14px_rgba(14,165,233,0.25)]",
    iconButtonToneClassName:
      "border-[rgba(140,82,22,0.32)] bg-[linear-gradient(180deg,rgba(238,247,255,0.92),rgba(219,234,254,0.86))] text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96),rgba(219,234,254,0.92))] hover:text-slate-950",
    compactIconButtonToneClassName:
      "border-[rgba(140,82,22,0.32)] bg-[linear-gradient(180deg,rgba(238,247,255,0.92),rgba(219,234,254,0.86))] text-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.08)] hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96),rgba(219,234,254,0.92))] hover:text-slate-950",
    titleClassName: "text-slate-950",
    bodyClassName: "text-slate-700",
    secondaryTextClassName: "text-slate-500",
    badgeClassName: "border-blue-200/80 bg-blue-100/80 text-blue-900",
    softBadgeClassName:
      "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(238,247,255,0.86),rgba(219,234,254,0.78))] text-slate-600 shadow-[inset_0_1px_0_rgba(252,240,208,0.75)]",
    listCardToneClassName:
      "border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(238,247,255,0.86),rgba(219,234,254,0.78))] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96),rgba(219,234,254,0.90))]",
    selectedListCardToneClassName:
      "border-sky-300/60 bg-[linear-gradient(180deg,rgba(239,246,255,0.92),rgba(219,234,254,0.82))] shadow-[0_20px_44px_rgba(37,99,235,0.12)]",
  },
  dark: {
    /* Premium gold lamp + navy dominant, locked 2026-05-03 (KI-066/069).
       Dark dialog shell matches the dashboard's navy-lit-by-gold-lamp
       identity. Depth bar applied: gold lamp top bevel rgba(196,144,65),
       bronze rim rgba(140,82,22), cool blue 1px structural ring
       rgba(96,165,250), bronze atmospheric halo rgba(196,130,45). The
       legacy warm-yellow register (rgba(228,140,55), rgba(228,175,100),
       rgba(255,228,175)) is forbidden. */
    ambientOverlayClassName:
      "bg-[radial-gradient(circle_at_top,rgba(196,130,45,0.22),transparent_36%),radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.26),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(37,99,235,0.22),transparent_24%),linear-gradient(180deg,rgba(30,58,138,0.18),rgba(2,6,23,0.42))]",
    shellToneClassName:
      "border-[rgba(96,165,250,0.22)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,130,45,0.20),transparent_60%),linear-gradient(180deg,rgba(16,32,62,0.92),rgba(6,14,32,0.96))] shadow-[0_36px_96px_rgba(2,6,23,0.48),0_70px_180px_rgba(2,6,23,0.20),inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.22),0_0_0_1px_rgba(96,165,250,0.18),0_0_64px_rgba(196,130,45,0.16),0_0_140px_rgba(196,130,45,0.08)]",
    immersiveShellToneClassName:
      "border-[rgba(96,165,250,0.22)] bg-[radial-gradient(ellipse_95%_55%_at_50%_0%,rgba(196,130,45,0.22),transparent_60%),radial-gradient(circle_at_top,rgba(59,130,246,0.20),rgba(15,23,42,0.92)_30%,rgba(2,6,23,0.96)_100%)] shadow-[0_44px_116px_rgba(2,6,23,0.54),0_80px_200px_rgba(2,6,23,0.22),inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.22),0_0_0_1px_rgba(96,165,250,0.18),0_0_80px_rgba(196,130,45,0.16),0_0_160px_rgba(196,130,45,0.08)]",
    mapCanvasClassName: "bg-slate-950",
    /* Side panels inside the dark map dialog — navy glass with gold lamp
       halo + bronze trim, depth-bar compliant. */
    panelToneClassName:
      "border-[rgba(96,165,250,0.20)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,130,45,0.16),transparent_70%),linear-gradient(180deg,rgba(15,23,42,0.84),rgba(8,16,33,0.80))] shadow-[inset_0_1px_0_rgba(196,144,65,0.20),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_22px_56px_rgba(2,6,23,0.36),0_0_44px_rgba(196,130,45,0.10)]",
    /* A2 — Coverage Command Center sticky header card emphasis. Stronger
       top lamp halo (radial pulled up + intensified) + deeper corner lamp
       reads as the primary container of the immersive shell. */
    panelStrongToneClassName:
      "border-[rgba(96,165,250,0.30)] bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(196,144,65,0.30),transparent_72%),radial-gradient(circle_at_88%_-12%,rgba(196,130,45,0.32),transparent_44%),linear-gradient(180deg,rgba(20,38,72,0.86),rgba(10,22,45,0.88))] shadow-[inset_0_1px_0_rgba(196,144,65,0.28),inset_0_-1px_0_rgba(140,82,22,0.24),0_0_0_1px_rgba(96,165,250,0.22),0_28px_64px_rgba(2,6,23,0.42),0_0_72px_rgba(196,130,45,0.18)]",
    accentPanelToneClassName:
      "border-[rgba(96,165,250,0.32)] bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(196,130,45,0.26),transparent_70%),linear-gradient(180deg,rgba(34,58,118,0.50),rgba(15,30,60,0.84))] shadow-[inset_0_1px_0_rgba(196,144,65,0.26),inset_0_-1px_0_rgba(140,82,22,0.24),0_0_0_1px_rgba(96,165,250,0.22),0_24px_60px_rgba(2,6,23,0.40),0_0_60px_rgba(196,130,45,0.16)]",
    segmentedToneClassName:
      "border-blue-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(15,23,42,0.8))]",
    activeSegmentClassName:
      "bg-[linear-gradient(180deg,#93c5fd,#60a5fa)] text-slate-950 shadow-[0_12px_24px_rgba(59,130,246,0.34)]",
    inactiveSegmentClassName: "text-slate-200 hover:bg-blue-500/15 hover:text-white",
    primaryButtonToneClassName:
      "border-blue-300/30 bg-blue-300 text-slate-950 shadow-[0_14px_26px_rgba(59,130,246,0.24)] hover:-translate-y-0.5 hover:bg-blue-200",
    secondaryButtonToneClassName:
      "border-blue-200/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.74))] text-slate-100 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.38),rgba(30,41,59,0.82))] hover:text-white",
    destructiveButtonToneClassName:
      "border-rose-400/25 bg-[linear-gradient(180deg,#fb7185,#e11d48)] text-white shadow-[0_14px_26px_rgba(244,63,94,0.2)] hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(244,63,94,0.26)]",
    tertiaryButtonToneClassName:
      "border-white/10 bg-white/6 text-slate-300 hover:bg-white/12 hover:text-slate-100",
    compactButtonToneClassName:
      "border-blue-200/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(30,41,59,0.72))] text-slate-200 shadow-[0_2px_8px_rgba(2,6,23,0.18)] hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.35),rgba(30,41,59,0.8))] hover:text-white",
    compactActiveButtonToneClassName:
      "border-blue-300/40 bg-blue-300 text-slate-950 shadow-[0_4px_14px_rgba(59,130,246,0.3)]",
    iconButtonToneClassName:
      "border-blue-200/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(30,41,59,0.78))] text-slate-100 shadow-[0_14px_28px_rgba(2,6,23,0.24)] hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.42),rgba(30,41,59,0.84))] hover:text-white",
    compactIconButtonToneClassName:
      "border-blue-200/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(30,41,59,0.72))] text-slate-200 shadow-[0_4px_12px_rgba(2,6,23,0.18)] hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.35),rgba(30,41,59,0.8))] hover:text-white",
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
    compactButtonClassName: cn(
      baseTheme.compactButtonBaseClassName,
      toneTheme.compactButtonToneClassName
    ),
    compactActiveButtonClassName: cn(
      baseTheme.compactButtonBaseClassName,
      toneTheme.compactActiveButtonToneClassName
    ),
    iconButtonClassName: cn(baseTheme.iconButtonBaseClassName, toneTheme.iconButtonToneClassName),
    compactIconButtonClassName: cn(
      baseTheme.compactIconButtonBaseClassName,
      toneTheme.compactIconButtonToneClassName
    ),
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
