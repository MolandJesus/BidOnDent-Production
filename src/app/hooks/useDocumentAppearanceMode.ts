import { useEffect, useState } from "react";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";

const DEFAULT_APPEARANCE_MODE: DashboardAppearanceMode = "map-dark";

function readDocumentAppearanceMode(): DashboardAppearanceMode {
  if (typeof document === "undefined") {
    return DEFAULT_APPEARANCE_MODE;
  }

  return document.documentElement.getAttribute("data-appearance-mode") === "light"
    ? "light"
    : DEFAULT_APPEARANCE_MODE;
}

export function useDocumentAppearanceMode() {
  const [appearanceMode, setAppearanceMode] = useState<DashboardAppearanceMode>(
    readDocumentAppearanceMode
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const documentElement = document.documentElement;
    const observer = new MutationObserver(() => {
      setAppearanceMode(readDocumentAppearanceMode());
    });

    observer.observe(documentElement, {
      attributeFilter: ["data-appearance-mode"],
      attributes: true,
    });

    setAppearanceMode(readDocumentAppearanceMode());

    return () => observer.disconnect();
  }, []);

  return appearanceMode;
}
