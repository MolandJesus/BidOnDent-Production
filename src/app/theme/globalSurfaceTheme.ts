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
      "radial-gradient(130% 85% at 30% 10%, rgba(16, 32, 62, 0.99) 0%, rgba(10, 22, 44, 0.99) 55%, #060e20 100%)",
    glassBg: "rgba(180, 210, 255, 0.07)",
    glassBorder: "rgba(150, 190, 240, 0.14)",
    text: "#e8edf4",
    textSecondary: "#94a3b8",
    shadow: "0 16px 40px rgba(4, 10, 24, 0.28)",
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
