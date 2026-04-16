import { createContext, useContext, type ReactNode } from "react";
import { useAppearanceMode } from "./useAppearanceMode";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";

type AppearanceModeContextValue = [
  DashboardAppearanceMode,
  React.Dispatch<React.SetStateAction<DashboardAppearanceMode>>,
];

const AppearanceModeContext = createContext<AppearanceModeContextValue | null>(null);

export function AppearanceModeProvider({ children }: { children: ReactNode }) {
  const value = useAppearanceMode();
  return <AppearanceModeContext.Provider value={value}>{children}</AppearanceModeContext.Provider>;
}

export function useAppearanceModeCtx(): AppearanceModeContextValue {
  const ctx = useContext(AppearanceModeContext);
  if (!ctx) {
    throw new Error("useAppearanceModeCtx must be used within AppearanceModeProvider");
  }
  return ctx;
}
