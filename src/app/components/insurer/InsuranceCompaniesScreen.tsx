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
    <div className={`min-h-screen pb-20 ${isLight ? "bg-slate-50/80" : ""}`}>
      {/* Header */}
      <div
        className={`border-b px-4 py-4 ${isLight ? "border-slate-200/60 bg-white/90" : "border-white/10"}`}
        style={
          isLight
            ? { backdropFilter: "blur(12px)" }
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
              isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <ArrowLeft className={`w-5 h-5 ${isLight ? "text-slate-700" : "text-slate-200"}`} />
          </button>
          <div>
            <p
              className={`mb-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-cyan-600" : "text-cyan-300/80"}`}
            >
              Insurance directory
            </p>
            <h1 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Insurance Companies
            </h1>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              {userType === "shop"
                ? "Partner with insurance providers"
                : "Find your insurance provider"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-slate-400/60"}`}
          />
          <input
            type="text"
            placeholder="Search insurance companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border backdrop-blur-sm focus:outline-none focus:ring-2 ${
              isLight
                ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-blue-300"
                : "border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400/60 focus:ring-blue-400/20"
            }`}
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
