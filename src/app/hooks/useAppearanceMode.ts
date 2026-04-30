import { useEffect, useState } from "react";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";

const APPEARANCE_STORAGE_KEY = "bidondent.appearance-mode";
const APPEARANCE_MODES = [
  "light",
  "map-dark",
] as const satisfies readonly DashboardAppearanceMode[];

function isAppearanceMode(value: unknown): value is DashboardAppearanceMode {
  return typeof value === "string" && (APPEARANCE_MODES as readonly string[]).includes(value);
}

function clearSavedAppearanceMode() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(APPEARANCE_STORAGE_KEY);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error clearing appearance mode:", error);
  }
}

function readSavedAppearanceMode(): DashboardAppearanceMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (isAppearanceMode(saved)) return saved;
    if (saved !== null) clearSavedAppearanceMode();
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error reading appearance mode:", error);
  }
  return "light";
}

function persistAppearanceMode(mode: DashboardAppearanceMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving appearance mode:", error);
  }
}

export function useAppearanceMode(): [
  DashboardAppearanceMode,
  React.Dispatch<React.SetStateAction<DashboardAppearanceMode>>,
] {
  const [appearanceMode, setAppearanceMode] =
    useState<DashboardAppearanceMode>(readSavedAppearanceMode);

  useEffect(() => {
    persistAppearanceMode(appearanceMode);
    document.documentElement.setAttribute("data-appearance-mode", appearanceMode);
    document.documentElement.style.colorScheme = appearanceMode === "light" ? "light" : "dark";
  }, [appearanceMode]);

  // Sync across browser tabs via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === APPEARANCE_STORAGE_KEY) {
        setAppearanceMode(isAppearanceMode(e.newValue) ? e.newValue : readSavedAppearanceMode());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [appearanceMode, setAppearanceMode];
}
