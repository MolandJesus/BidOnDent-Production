import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

/** Floating dev-only button to toggle light/dark appearance mode. */
export default function AppearanceToggle() {
  const [mode, setMode] = useAppearanceModeCtx();
  const isLight = mode === "light";

  const toggle = () => {
    setMode(isLight ? "map-dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[99999] px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-colors select-none"
      style={{
        background: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.15)",
        color: isLight ? "#fff" : "#e2e8f0",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
      title="Toggle appearance mode"
    >
      {isLight ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
