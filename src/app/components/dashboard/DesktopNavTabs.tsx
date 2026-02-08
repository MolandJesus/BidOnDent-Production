import React from "react";

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface DesktopNavTabsProps {
  tabs: NavTab[];
  currentTab: string;
  viewMode: string;
  primaryColor: string;
  onTabClick: (tabId: string) => void;
}

export default function DesktopNavTabs({
  tabs,
  currentTab,
  viewMode,
  primaryColor,
  onTabClick
}: DesktopNavTabsProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id && viewMode === "dashboard";
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? "text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            style={isActive ? { backgroundColor: primaryColor } : {}}
          >
            <div className="flex items-center space-x-2">
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
