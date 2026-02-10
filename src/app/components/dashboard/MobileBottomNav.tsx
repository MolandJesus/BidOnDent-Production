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
  onTabClick
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`flex flex-col items-center space-y-1 px-4 py-2 min-w-[4rem] transition-colors ${
                isActive ? "" : "text-gray-500"
              }`}
              style={isActive ? { color: primaryColor } : {}}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
