import React from "react";
import { useState } from "react";
import { Home, Camera, FileText, User, Menu, X, Bell } from "lucide-react";

type AppLayoutProps = {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userType?: string;
  notifications?: number;
};

export default function AppLayout({ 
  children, 
  currentTab, 
  setCurrentTab, 
  userType = "customer", 
  notifications = 0
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "home", icon: <Home className="w-6 h-6" />, label: "Home" },
    { id: "report", icon: <Camera className="w-6 h-6" />, label: "Report" },
    { id: "bids", icon: <FileText className="w-6 h-6" />, label: "Bids" },
    { id: "account", icon: <User className="w-6 h-6" />, label: "Account" }
  ];

  // Customize tabs based on user type
  if (userType === "shop") {
    tabs[1] = { id: "requests", icon: <FileText className="w-6 h-6" />, label: "Requests" };
    tabs[2] = { id: "jobs", icon: <FileText className="w-6 h-6" />, label: "Jobs" };
  } else if (userType === "insurer") {
    tabs[1] = { id: "claims", icon: <FileText className="w-6 h-6" />, label: "Claims" };
    tabs[2] = { id: "shops", icon: <FileText className="w-6 h-6" />, label: "Shops" };
  }

  return (
    <div className="flex flex-col h-full">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 -ml-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="font-bold text-xl text-blue-900 flex items-center">
            Bid<span className="text-blue-600">on</span>dent
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Bell className="w-6 h-6 text-gray-600" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-white text-xs">{notifications > 9 ? '9+' : notifications}</span>
              </div>
            )}
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            U
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold text-2xl mb-6 text-blue-900 flex items-center">
              Bid<span className="text-blue-600">on</span>dent
            </div>
            <nav className="space-y-4">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  className={`flex items-center w-full p-3 rounded-lg ${
                    currentTab === tab.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setMenuOpen(false);
                  }}
                >
                  <div className="mr-3">{tab.icon}</div>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
              <hr className="my-4" />
              <button 
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <div className="mr-3"><Bell className="w-5 h-5" /></div>
                <span className="font-medium">Notifications</span>
                {notifications > 0 && (
                  <div className="ml-auto bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <span className="text-white text-xs">{notifications}</span>
                  </div>
                )}
              </button>
              <button 
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <div className="mr-3"><User className="w-5 h-5" /></div>
                <span className="font-medium">Profile</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>

      {/* Bottom Tabs (Mobile Navigation) */}
      <nav className="bg-white border-t border-gray-200 flex">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`flex-1 py-2 flex flex-col items-center justify-center ${
              currentTab === tab.id 
                ? "text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}