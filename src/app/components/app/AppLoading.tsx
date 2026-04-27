import { useEffect, useState } from "react";

type AppLoadingProps = {
  message?: string;
};

function readAppearanceMode(): "light" | "map-dark" {
  if (typeof document === "undefined") return "map-dark";
  const attr = document.documentElement.getAttribute("data-appearance-mode");
  return attr === "light" ? "light" : "map-dark";
}

export default function AppLoading({ message = "Loading..." }: AppLoadingProps) {
  const [showRecovery, setShowRecovery] = useState(false);
  const [mode, setMode] = useState<"light" | "map-dark">(readAppearanceMode);

  useEffect(() => {
    const timer = setTimeout(() => setShowRecovery(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(readAppearanceMode()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-appearance-mode"],
    });
    return () => observer.disconnect();
  }, []);

  const isLight = mode === "light";

  const containerStyle: React.CSSProperties = isLight
    ? {
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 248, 235, 0.55), transparent 70%), linear-gradient(180deg, #eaf2ff 0%, #dce8fb 60%, #cfdef7 100%)",
      }
    : { backgroundColor: "#0b172f" };

  const spinnerStyle: React.CSSProperties = isLight
    ? {
        borderColor: "rgba(212, 175, 55, 0.22)",
        borderBottomColor: "#d4af37",
        boxShadow:
          "0 0 18px rgba(212, 175, 55, 0.28), 0 0 6px rgba(212, 175, 55, 0.18)",
      }
    : {
        borderColor: "rgba(96, 165, 250, 0.24)",
        borderBottomColor: "#60a5fa",
      };

  const labelStyle: React.CSSProperties = isLight
    ? { color: "#1e293b" }
    : { color: "rgba(191, 219, 254, 0.7)" };

  const recoveryTextStyle: React.CSSProperties = isLight
    ? { color: "rgba(30, 41, 59, 0.6)" }
    : { color: "rgba(191, 219, 254, 0.5)" };

  const recoveryLinkStyle: React.CSSProperties = isLight
    ? { color: "#1e40af" }
    : { color: "#60a5fa" };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={containerStyle}
    >
      <div className="text-center" aria-busy="true" aria-live="polite" role="status">
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-12 w-12 border-2 mx-auto mb-4"
          style={spinnerStyle}
        ></div>
        <p style={labelStyle}>{message}</p>
        {showRecovery && (
          <div className="mt-6 space-y-2">
            <p className="text-sm" style={recoveryTextStyle}>
              Taking longer than expected.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline"
              style={recoveryLinkStyle}
              type="button"
            >
              Tap to reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
