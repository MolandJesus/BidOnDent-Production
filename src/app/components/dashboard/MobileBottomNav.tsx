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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";

          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 min-w-[4rem] rounded-xl transition-all ${
                isActive ? "text-white shadow-sm" : "text-slate-500"
              }`}
              style={
                isActive
                  ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0c8ed8 100%)` }
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
