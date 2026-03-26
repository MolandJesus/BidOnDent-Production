interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface MobileBottomNavProps {
  appearanceMode: "map-dark" | "light";
  tabs: NavTab[];
  currentTab: string;
  viewMode: string;
  primaryColor: string;
  onTabClick: (tabId: string) => void;
}

export default function MobileBottomNav({
  appearanceMode,
  tabs,
  currentTab,
  viewMode,
  primaryColor,
  onTabClick,
}: MobileBottomNavProps) {
  const isLightAppearance = appearanceMode === "light";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 249, 255, 0.94) 100%)"
          : "linear-gradient(180deg, rgba(8, 18, 38, 0.92) 0%, rgba(6, 13, 28, 0.88) 100%)",
        backdropFilter: "blur(20px) saturate(1.2)",
        WebkitBackdropFilter: "blur(20px) saturate(1.2)",
        borderTop: isLightAppearance
          ? "1px solid rgba(148, 163, 184, 0.20)"
          : "1px solid rgba(96, 165, 250, 0.15)",
        boxShadow: isLightAppearance
          ? "0 -6px 20px rgba(37, 99, 235, 0.08)"
          : "0 -6px 24px rgba(3, 10, 24, 0.50), inset 0 1px 0 rgba(96, 165, 250, 0.12)",
      }}
    >
      <div className="flex items-center justify-around py-1.5 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 min-w-[3.5rem] rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-white -translate-y-0.5"
                  : isLightAppearance
                    ? "text-slate-400 hover:text-blue-600"
                    : "text-blue-200/50 hover:text-blue-100/80"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${primaryColor} 0%, #0c8ed8 100%)`,
                      boxShadow:
                        "0 4px 16px rgba(37, 99, 235, 0.35), 0 0 24px rgba(59, 130, 246, 0.12)",
                    }
                  : {}
              }
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[0.65rem] font-medium leading-none ${isActive ? "" : "opacity-80"}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
