import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import ShopDirectoryIntelligencePanel from "./ShopDirectoryIntelligencePanel";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopDirectoryHeroProps = {
  showMapPane: boolean;
  accentClasses: string;
  appearanceMode?: DashboardAppearanceMode;
  roleHighlights: {
    badge: string;
    title: string;
    description: string;
    callouts: string[];
    metrics: Array<{ label: string; value: string }>;
  };
  mapListingsCount: number;
  summary: IntelligenceSummary;
  connectedCarrierNames: string[];
  contextChips: string[];
  identity?: WebsiteIdentity | null;
  sessionIntelligenceOpen: boolean;
  onBack: () => void;
  onToggleIntelligence: () => void;
  RoleIcon: React.ElementType;
};

export default function ShopDirectoryHero({
  showMapPane,
  accentClasses,
  appearanceMode = "map-dark",
  roleHighlights,
  mapListingsCount,
  summary,
  connectedCarrierNames,
  contextChips,
  identity,
  sessionIntelligenceOpen,
  onBack,
  onToggleIntelligence,
  RoleIcon,
}: ShopDirectoryHeroProps) {
  const isLight = appearanceMode === "light";
  if (showMapPane) {
    return (
      <div
        className={`${
          isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.86))] border-b border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "bd-glass-panel"
        } flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3`}
      >
        <div className="flex items-center gap-2">
          <button
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 transition-colors ${
              isLight
                ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-600 hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_4px_10px_rgba(15,23,42,0.08)]"
                : "bd-glass-control text-slate-100"
            }`}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </button>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${accentClasses}`}
          >
            <RoleIcon className="h-3 w-3" />
            {roleHighlights.badge}
          </span>
          <h1
            className={`text-sm font-semibold tracking-tight ${
              isLight ? "text-slate-800" : "text-slate-100"
            }`}
          >
            Smart Shop Map
          </h1>
        </div>
        <span className={`text-xs ${isLight ? "text-blue-600/70" : "text-blue-200/50"}`}>
          {mapListingsCount} shop{mapListingsCount === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  return (
    <section
      className={`${
        isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.86))] border-b border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "bd-glass-panel"
      } p-5 md:p-6`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                isLight
                  ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] text-slate-600 hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_4px_10px_rgba(15,23,42,0.08)]"
                  : "bd-glass-control"
              }`}
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClasses}`}
            >
              <RoleIcon className="h-4 w-4" />
              {roleHighlights.badge}
            </span>
          </div>

          <div className="mt-4">
            <h1
              className={`text-3xl font-semibold tracking-tight md:text-[2.35rem] ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}
            >
              Smart Shop Map
            </h1>
            <p
              className={`mt-2 max-w-3xl text-base leading-7 ${
                isLight ? "text-slate-600" : "text-slate-300/80"
              }`}
            >
              {roleHighlights.description}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {roleHighlights.metrics.map((metric) => (
              <div
                key={metric.label}
                className={`${
                  isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.72))] border border-[rgba(140,82,22,0.24)] rounded-2xl shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "bd-glass-card"
                } px-4 py-4`}
              >
                <p
                  className={`text-xs uppercase tracking-[0.18em] ${
                    isLight ? "text-blue-600/70" : "text-blue-200/50"
                  }`}
                >
                  {metric.label}
                </p>
                <p
                  className={`mt-2 text-2xl font-semibold ${
                    isLight ? "text-slate-900" : "text-slate-100"
                  }`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <ShopDirectoryIntelligencePanel
            appearanceMode={appearanceMode}
            connectedCarrierNames={connectedCarrierNames}
            contextChips={contextChips}
            identity={identity}
            isOpen={sessionIntelligenceOpen}
            onToggle={onToggleIntelligence}
            summary={summary}
          />
        </div>

        <div className="grid gap-3 xl:w-[420px]">
          <div
            className={`${
              isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.72))] border border-[rgba(140,82,22,0.24)] rounded-2xl shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "bd-glass-card"
            } p-4`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/50"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Map intelligence active
            </div>
            <p
              className={`mt-3 text-lg font-semibold ${
                isLight ? "text-slate-900" : "text-slate-100"
              }`}
            >
              {roleHighlights.title}
            </p>
            <div className="mt-3 space-y-2">
              {roleHighlights.callouts.map((callout) => (
                <div
                  key={callout}
                  className={`${
                    isLight
                      ? "bg-slate-50 border border-slate-200/60 rounded-2xl"
                      : "bd-glass-panel"
                  } px-3 py-2 text-sm leading-6 ${
                    isLight ? "text-slate-600" : "text-slate-300/80"
                  }`}
                >
                  {callout}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`${
              isLight ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.72))] border border-[rgba(140,82,22,0.24)] rounded-2xl shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "bd-glass-card"
            } p-4`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/50"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Current ranking explanation
            </div>
            <p
              className={`mt-3 text-sm leading-6 ${
                isLight ? "text-slate-600" : "text-slate-300/80"
              }`}
            >
              {summary.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
