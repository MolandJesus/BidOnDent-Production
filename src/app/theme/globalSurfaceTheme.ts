/**
 * Global surface theme — unified tone system for the entire app.
 *
 * Extends the map-specific `mapSurfaceTheme.ts` concept to cover
 * dashboard, shell, and non-map surfaces with a consistent palette.
 *
 * Product Brain Stage 3d — extracted from mapSurfaceTheme.ts pattern.
 */

export type SurfaceTone = "light" | "soft-dark" | "map-dark";

export type GlobalSurfaceTokens = {
  background: string;
  glassBg: string;
  glassBorder: string;
  text: string;
  textSecondary: string;
  shadow: string;
};

const toneTokens: Record<SurfaceTone, GlobalSurfaceTokens> = {
  light: {
    background:
      "linear-gradient(180deg, rgba(245, 247, 251, 1) 0%, rgba(238, 242, 249, 1) 54%, rgba(232, 237, 245, 1) 100%)",
    glassBg: "rgba(255, 255, 255, 0.72)",
    glassBorder: "rgba(148, 163, 184, 0.18)",
    text: "#0f172a",
    textSecondary: "#475569",
    shadow: "0 18px 48px rgba(148, 163, 184, 0.16)",
  },
  "soft-dark": {
    background: "#0c1929",
    glassBg: "rgba(96, 165, 250, 0.08)",
    glassBorder: "rgba(147, 197, 253, 0.12)",
    text: "#e2e8f0",
    textSecondary: "#94a3b8",
    shadow: "0 16px 40px rgba(2, 6, 23, 0.34)",
  },
  "map-dark": {
    background: "#0b1220",
    glassBg: "rgba(15, 23, 42, 0.6)",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    text: "#e5e7eb",
    textSecondary: "#94a3b8",
    shadow: "0 16px 40px rgba(2, 6, 23, 0.46)",
  },
};

export function getGlobalSurfaceTheme(tone: SurfaceTone): GlobalSurfaceTokens {
  return toneTokens[tone];
}
