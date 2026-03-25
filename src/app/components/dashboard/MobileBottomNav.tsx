interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface MobileBottomNavProps {
  tabs: NavTab[];
  currentTab: string;
  viewMode: string;
  primaryColor: string;
  onTabClick: (tabId: string) => void;
}

export default function MobileBottomNav({
  tabs,
  currentTab,
  viewMode,
  primaryColor,
  onTabClick,
}: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bd-glass-panel !rounded-none border-t border-blue-200/30 z-50"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "linear-gradient(180deg, rgba(240, 248, 255, 0.88) 0%, rgba(235, 245, 255, 0.82) 100%)",
        boxShadow: "0 -4px 24px rgba(59, 130, 246, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
      }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 min-w-[4rem] rounded-xl transition-all duration-200 ${
                isActive ? "text-white shadow-md" : "text-slate-500 hover:text-blue-600"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${primaryColor} 0%, #0c8ed8 100%)`,
                      boxShadow: "0 2px 12px rgba(37, 99, 235, 0.25), 0 0 20px rgba(59, 130, 246, 0.10)",
                    }
                  : {}
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
