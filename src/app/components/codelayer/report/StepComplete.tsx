import { ArrowRight, Check, Clock, ListChecks, Map, MessageSquare, Wrench } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type StepCompleteProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  onViewReports: () => void;
  onBackToDashboard: () => void;
  onFindShops?: () => void;
};

export default function StepComplete({
  primaryColor,
  appearanceMode = "map-dark",
  onViewReports,
  onBackToDashboard,
  onFindShops,
}: StepCompleteProps) {
  const isLightAppearance = appearanceMode === "light";
  return (
    <div className="px-4 md:px-6 py-6 md:py-8 bd-glass-card rounded-2xl">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-emerald-500"
          style={{
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.30), 0 0 40px rgba(16, 185, 129, 0.12)",
          }}
        >
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2
          className={`text-2xl font-bold mb-2 ${isLightAppearance ? "text-slate-100" : "text-white/95"}`}
        >
          Report submitted
        </h2>
        <p
          className={`max-w-xl mx-auto ${isLightAppearance ? "text-blue-100/60" : "text-blue-100/70"}`}
        >
          Nice work. Shops in your area can now review your details and send bids.
        </p>
      </div>

      <div className="bd-glass-card p-5 mb-8">
        <h3
          className={`font-bold mb-4 inline-flex items-center gap-2 ${isLightAppearance ? "text-slate-100" : "text-white/90"}`}
        >
          <ListChecks
            className={`w-4 h-4 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
          />
          What happens next
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isLightAppearance ? "bg-blue-500/15" : "bg-blue-500/15"}`}
              style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.08)" }}
            >
              <Wrench
                className={`w-4 h-4 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
              />
            </div>
            <div>
              <p
                className={`text-sm font-medium ${isLightAppearance ? "text-slate-100" : "text-white/85"}`}
              >
                Shops review your report
              </p>
              <p
                className={`text-xs ${isLightAppearance ? "text-blue-200/50" : "text-blue-200/60"}`}
              >
                Local body shops see your damage details and photos
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isLightAppearance ? "bg-blue-500/15" : "bg-blue-500/15"}`}
              style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.08)" }}
            >
              <MessageSquare
                className={`w-4 h-4 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
              />
            </div>
            <div>
              <p
                className={`text-sm font-medium ${isLightAppearance ? "text-slate-100" : "text-white/85"}`}
              >
                Bids start arriving
              </p>
              <p
                className={`text-xs ${isLightAppearance ? "text-blue-200/50" : "text-blue-200/60"}`}
              >
                You receive notifications as shops send their estimates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isLightAppearance ? "bg-blue-500/15" : "bg-blue-500/15"}`}
              style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.08)" }}
            >
              <Clock
                className={`w-4 h-4 ${isLightAppearance ? "text-blue-400" : "text-blue-400"}`}
              />
            </div>
            <div>
              <p
                className={`text-sm font-medium ${isLightAppearance ? "text-slate-100" : "text-white/85"}`}
              >
                Compare and choose
              </p>
              <p
                className={`text-xs ${isLightAppearance ? "text-blue-200/50" : "text-blue-200/60"}`}
              >
                Pick the best price, timeline, and shop — then schedule your repair
              </p>
            </div>
          </div>
        </div>
      </div>

      {onFindShops ? (
        <button
          type="button"
          onClick={onFindShops}
          className="w-full py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold mb-3 inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.28), 0 0 32px rgba(59, 130, 246, 0.10)",
          }}
        >
          <Map className="w-4 h-4" />
          Browse shops on the map
        </button>
      ) : (
        <button
          type="button"
          onClick={onViewReports}
          className="w-full py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold mb-3 inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.28), 0 0 32px rgba(59, 130, 246, 0.10)",
          }}
        >
          View My Reports
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {onFindShops && (
        <button
          type="button"
          onClick={onViewReports}
          className={`w-full py-3 px-4 min-h-[44px] rounded-xl border font-medium transition-colors mb-3 inline-flex items-center justify-center gap-2 ${isLightAppearance ? "border-blue-300/15 hover:bg-blue-500/10 text-slate-300" : "border-white/15 hover:bg-white/5 text-white/90"}`}
        >
          View My Reports
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={onBackToDashboard}
        className={`w-full py-3 px-4 min-h-[44px] rounded-xl border font-medium transition-colors ${isLightAppearance ? "border-blue-300/15 hover:bg-blue-500/10 text-slate-300" : "border-white/15 hover:bg-white/5 text-white/90"}`}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
