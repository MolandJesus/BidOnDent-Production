import { ArrowLeft, ExternalLink, Globe, Phone, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import { INSURANCE_DIRECTORY } from "../../constants/insuranceDirectory";

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

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return INSURANCE_DIRECTORY;
    return INSURANCE_DIRECTORY.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.repairPrograms.some((p) => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

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
            aria-label="Back"
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

      {/* Insurance company cards */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Search
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-slate-300" : "text-slate-500"}`}
            />
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              No companies match &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        ) : (
          filtered.map((company) => (
            <div
              key={company.id}
              className={`rounded-2xl border p-4 transition-colors ${
                isLight
                  ? "border-slate-200/60 bg-white hover:bg-slate-50/80"
                  : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                    <h3
                      className={`font-semibold truncate ${isLight ? "text-slate-800" : "text-slate-100"}`}
                    >
                      {company.name}
                    </h3>
                    {company.digitalClaims && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isLight
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        Digital claims
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${isLight ? "text-slate-600" : "text-blue-100/70"}`}>
                    {company.description}
                  </p>
                  {company.repairPrograms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {company.repairPrograms.map((program) => (
                        <span
                          key={program}
                          className={`rounded-lg px-2 py-0.5 text-xs ${
                            isLight ? "bg-blue-50 text-blue-700" : "bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {program}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap items-center gap-4 text-xs ${isLight ? "text-slate-500" : "text-blue-100/55"}`}
                  >
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {company.claimsPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      {company.website}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <p
          className={`text-center text-xs pt-2 ${isLight ? "text-slate-400" : "text-blue-100/40"}`}
        >
          {filtered.length} of {INSURANCE_DIRECTORY.length} companies &middot; More carriers added
          as they join BidOnDent
        </p>
      </div>
    </div>
  );
}
