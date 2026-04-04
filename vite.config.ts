import { defineConfig } from "vitest/config";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "BidOnDent — Compare Auto Body Repair Bids",
        short_name: "BidOnDent",
        description:
          "Submit vehicle damage photos, receive competitive bids from local auto body shops, and navigate to the best repair option.",
        theme_color: "#0056b3",
        background_color: "#071224",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        categories: ["auto", "business", "utilities"],
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern:
              /^https:\/\/(basemaps|tiles).*\.(carto|arcgisonline|esri)\..*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // Bind to 0.0.0.0 — allows LAN access from iPhone Safari
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          if (
            id.includes("/node_modules/maplibre-gl/") ||
            id.includes("/node_modules/react-map-gl/")
          ) {
            return "vendor-map";
          }

          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }

          if (id.includes("@clerk")) {
            return "vendor-clerk";
          }

          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }

          if (id.includes("/node_modules/motion/") || id.includes("/node_modules/framer-motion/")) {
            return "vendor-motion";
          }

          if (id.includes("lucide-react") || id.includes("recharts") || id.includes("date-fns")) {
            return "vendor-ui";
          }

          if (id.includes("@sentry")) {
            return "vendor-sentry";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["src/app/services/__tests__/**"],
  },
});
