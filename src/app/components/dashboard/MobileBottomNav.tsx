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
          ? // Pass H4 (KI-091): canon adoption — body opacity to canon
            // range (0.84/0.76 per LAW Premium Glass Body Opacity), cool
            // ice gradient preserved, bronze trim + cream highlight + canon
            // micro top-cast appended below.
            "linear-gradient(180deg, rgba(232, 242, 254, 0.84) 0%, rgba(214, 230, 248, 0.76) 100%)"
          : "linear-gradient(180deg, rgba(8, 18, 38, 0.94) 0%, rgba(6, 13, 28, 0.92) 100%)",
        backdropFilter: "blur(24px) saturate(1.3)",
        WebkitBackdropFilter: "blur(24px) saturate(1.3)",
        borderTop: isLightAppearance
          ? // Pass H4: cool slate -> canon bronze trim per LAW
            "1px solid rgba(140, 82, 22, 0.22)"
          : "1px solid rgba(96, 165, 250, 0.18)",
        boxShadow: isLightAppearance
          ? // Pass H4: scaled micro top-cast champagne lamp (lamp from
            // ABOVE the nav since the nav sits at viewport bottom — gold
            // appears to wash UPWARD onto the nav from off-screen "above"),
            // plus close cool drop, plus cream highlight inset for
            // canonical premium glass feel.
            "0 -16px 40px -10px rgba(196, 144, 65, 0.12), 0 -6px 20px rgba(15, 30, 60, 0.10), inset 0 1px 0 rgba(252, 240, 208, 0.78)"
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
                    ? "text-slate-400 hover:text-blue-600 hover:bg-blue-500/[0.04]"
                    : "text-slate-300 hover:text-slate-100 hover:bg-blue-400/[0.06]"
              }`}
              style={
                isActive
                  ? {
                      background: isLightAppearance
                        ? "linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(96, 165, 250, 0.09) 100%)"
                        : "linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.14) 100%)",
                      boxShadow: isLightAppearance
                        ? // Cream inset replaces white inset (KI-066).
                          "inset 0 1px 0 rgba(252, 240, 208, 0.78), inset 0 -1px 0 rgba(147, 197, 253, 0.16), 0 4px 12px rgba(59, 130, 246, 0.10)"
                        : "inset 0 1px 0 rgba(147, 197, 253, 0.14), 0 4px 14px rgba(37, 99, 235, 0.16)",
                      border: isLightAppearance
                        ? "1px solid rgba(147, 197, 253, 0.32)"
                        : "1px solid rgba(96, 165, 250, 0.22)",
                    }
                  : {}
              }
            >
              {/* Active top bar indicator + V3e gold-as-light underline.
                  Active tab gets the existing blue top bar (product/action
                  signal preserved) and a thin champagne underline beneath
                  the label that catches the dashboard's gold-lamp wash. */}
              {isActive && (
                <>
                  <span
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full"
                    style={{
                      background: isLightAppearance
                        ? "linear-gradient(90deg, #2563eb, #0ea5e9)"
                        : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px"
                    style={{
                      width: "40%",
                      background: isLightAppearance
                        ? // Top/corner lamp halo per locked palette (KI-066).
                          "linear-gradient(90deg, transparent, rgba(196,144,65,0.55) 50%, transparent)"
                        : // Dark active gold underline aligned to locked palette (KI-066).
                          "linear-gradient(90deg, transparent, rgba(196,144,65,0.65) 50%, transparent)",
                    }}
                  />
                </>
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
