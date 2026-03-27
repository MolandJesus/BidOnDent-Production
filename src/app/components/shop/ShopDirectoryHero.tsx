import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import ShopDirectoryIntelligencePanel from "./ShopDirectoryIntelligencePanel";

type ShopDirectoryHeroProps = {
  showMapPane: boolean;
  accentClasses: string;
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
  if (showMapPane) {
    return (
      <div className="bd-glass-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="bd-glass-control inline-flex h-10 w-10 items-center justify-center"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span
            className={`bd-glass-card inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClasses}`}
          >
            <RoleIcon className="h-4 w-4" />
            {roleHighlights.badge}
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-bd-blue-900">Smart Shop Map</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-bd-blue-300">
            {mapListingsCount} shop{mapListingsCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="bd-glass-panel p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="bd-glass-control inline-flex h-11 w-11 items-center justify-center"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span
              className={`bd-glass-card inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentClasses}`}
            >
              <RoleIcon className="h-4 w-4" />
              {roleHighlights.badge}
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-semibold tracking-tight text-bd-blue-900 md:text-[2.35rem]">
              Smart Shop Map
            </h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-bd-blue-200">
              {roleHighlights.description}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {roleHighlights.metrics.map((metric) => (
              <div key={metric.label} className="bd-glass-card px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-bd-blue-300">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-bd-blue-900">{metric.value}</p>
              </div>
            ))}
          </div>

          <ShopDirectoryIntelligencePanel
            connectedCarrierNames={connectedCarrierNames}
            contextChips={contextChips}
            identity={identity}
            isOpen={sessionIntelligenceOpen}
            onToggle={onToggleIntelligence}
            summary={summary}
          />
        </div>

        <div className="grid gap-3 xl:w-[420px]">
          <div className="bd-glass-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bd-blue-400">
              <Sparkles className="h-4 w-4" />
              Map intelligence active
            </div>
            <p className="mt-3 text-lg font-semibold text-bd-blue-900">{roleHighlights.title}</p>
            <div className="mt-3 space-y-2">
              {roleHighlights.callouts.map((callout) => (
                <div
                  key={callout}
                  className="bd-glass-panel px-3 py-2 text-sm leading-6 text-bd-blue-200"
                >
                  {callout}
                </div>
              ))}
            </div>
          </div>

          <div className="bd-glass-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-bd-blue-300">
              <TrendingUp className="h-4 w-4" />
              Current ranking explanation
            </div>
            <p className="mt-3 text-sm leading-6 text-bd-blue-200">{summary.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
