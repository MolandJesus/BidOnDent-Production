import { ArrowLeft, Search, Shield } from "lucide-react";
import { useState } from "react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

interface InsuranceCompaniesScreenProps {
  onBack: () => void;
  primaryColor: string;
  secondaryColor: string;
  userType?: "customer" | "shop" | "insurer";
  appearanceMode?: DashboardAppearanceMode;
}

export default function InsuranceCompaniesScreen({
  onBack,
  primaryColor,
  secondaryColor,
  userType = "customer",
  appearanceMode = "map-dark",
}: InsuranceCompaniesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isLight = appearanceMode === "light";

  return (
    <div className={`min-h-screen pb-20 ${isLight ? "" : "bd-glass-panel"}`}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-4 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Insurance Companies</h1>
            <p className="text-sm text-white/80">
              {userType === "shop"
                ? "Partner with insurance providers"
                : "Find your insurance provider"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search insurance companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Empty State — No insurance companies registered yet */}
      <div className="px-4 py-16 text-center">
        <Shield
          className={`w-16 h-16 mx-auto mb-4 ${isLight ? "text-slate-300" : "text-gray-300"}`}
        />
        <h2
          className={`text-lg font-semibold mb-2 ${isLight ? "text-slate-700" : "text-slate-200"}`}
        >
          Insurance Directory Coming Soon
        </h2>
        <p className={`text-sm max-w-md mx-auto ${isLight ? "text-slate-500" : "text-gray-500"}`}>
          {userType === "shop"
            ? "Insurance company partnerships will be available here once carriers join the BidOnDent network."
            : "Insurance companies will appear here as they join the BidOnDent platform. Check back soon."}
        </p>
      </div>
    </div>
  );
}
