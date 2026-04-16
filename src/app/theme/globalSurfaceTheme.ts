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
    background: "radial-gradient(130% 90% at 30% 8%, #1b3158 0%, #15264a 52%, #0f1d3a 100%)",
    glassBg: "rgba(255, 251, 245, 0.74)",
    glassBorder: "rgba(180, 160, 130, 0.28)",
    text: "#1a1008",
    textSecondary: "#5c4b34",
    shadow:
      "0 22px 56px rgba(2, 6, 23, 0.38), 0 0 0 1px rgba(255, 220, 170, 0.18), inset 0 1px 0 rgba(255, 255, 250, 0.96), 0 0 40px rgba(255, 191, 105, 0.06)",
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
