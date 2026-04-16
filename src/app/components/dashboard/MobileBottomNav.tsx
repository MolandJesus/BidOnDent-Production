import { motion } from "motion/react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

import type { ViewMode } from "../../types";

interface MobileBottomNavProps {
  tabs: NavTab[];
  currentTab: string;
  viewMode: ViewMode;
  badgeCounts?: Record<string, number>;
  onTabClick: (tabId: string) => void;
}

export default function MobileBottomNav({
  tabs,
  currentTab,
  viewMode,
  badgeCounts,
  onTabClick,
}: MobileBottomNavProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLightAppearance = appearanceMode === "light";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 249, 255, 0.94) 100%)"
          : "linear-gradient(180deg, rgba(8, 18, 38, 0.94) 0%, rgba(6, 13, 28, 0.92) 100%)",
        backdropFilter: "blur(24px) saturate(1.3)",
        WebkitBackdropFilter: "blur(24px) saturate(1.3)",
        borderTop: isLightAppearance
          ? "1px solid rgba(148, 163, 184, 0.20)"
          : "1px solid rgba(96, 165, 250, 0.18)",
        boxShadow: isLightAppearance
          ? "0 -6px 20px rgba(37, 99, 235, 0.08)"
          : "0 -8px 28px rgba(3, 10, 24, 0.55), inset 0 1px 0 rgba(96, 165, 250, 0.14)",
      }}
    >
      <div className="flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";

          return (
            <motion.button
              type="button"
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 min-w-[3.5rem] rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? ""
                  : isLightAppearance
                    ? "text-slate-400 hover:text-blue-600"
                    : "text-blue-100/50 hover:text-blue-100/80"
              }`}
              style={
                isActive
                  ? {
                      background: isLightAppearance
                        ? "linear-gradient(135deg, rgba(37, 99, 235, 0.10) 0%, rgba(59, 130, 246, 0.06) 100%)"
                        : "linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.14) 100%)",
                      boxShadow: isLightAppearance
                        ? "inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                        : "inset 0 1px 0 rgba(148, 197, 255, 0.10)",
                      border: isLightAppearance
                        ? "1px solid rgba(37, 99, 235, 0.12)"
                        : "1px solid rgba(96, 165, 250, 0.18)",
                    }
                  : {}
              }
            >
              {/* Active top bar indicator */}
              {isActive && (
                <span
                  className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full"
                  style={{
                    background: isLightAppearance
                      ? "linear-gradient(90deg, #2563eb, #0ea5e9)"
                      : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                  }}
                />
              )}
              <Icon
                className={`w-5 h-5 ${isActive ? (isLightAppearance ? "text-blue-600" : "text-blue-100") : ""}`}
              />
              {(badgeCounts?.[tab.id] ?? 0) > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 shadow-sm">
                  {badgeCounts![tab.id] > 9 ? "9+" : badgeCounts![tab.id]}
                </span>
              )}
              <span
                className={`text-[0.7rem] font-medium leading-none ${
                  isActive ? (isLightAppearance ? "text-blue-700" : "text-blue-50") : ""
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
