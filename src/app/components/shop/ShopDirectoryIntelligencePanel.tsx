import { ChevronDown, Layers3 } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export interface ShopDirectoryIntelligencePanelProps {
  summary: IntelligenceSummary;
  contextChips: string[];
  connectedCarrierNames: string[];
  identity: WebsiteIdentity | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
  appearanceMode?: DashboardAppearanceMode;
}

export default function ShopDirectoryIntelligencePanel({
  summary,
  contextChips,
  connectedCarrierNames,
  identity,
  isOpen,
  onToggle,
  appearanceMode = "map-dark",
}: ShopDirectoryIntelligencePanelProps) {
  const isLight = appearanceMode === "light";
  return (
    <div
      className={`mt-4 ${isLight ? "bg-white/90 border border-slate-200/60 rounded-2xl" : "bd-glass-panel"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
        aria-expanded={isOpen}
        aria-controls="shop-directory-session-intelligence"
      >
        <div className="min-w-0">
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              isLight ? "text-blue-600/70" : "text-blue-200/50"
            }`}
          >
            <Layers3 className="h-4 w-4" />
            Session intelligence
          </div>
          <p
            className={`mt-2 text-base font-semibold sm:text-lg ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            {summary.title}
          </p>
          <p
            className={`mt-1 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}
          >
            See the live ranking context, connected carriers, and current map signals that are
            shaping which shops appear and in what order.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            className={`hidden rounded-2xl border px-3 py-2 text-right sm:block ${
              isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
            }`}
          >
            <p
              className={`text-[11px] uppercase tracking-[0.16em] ${
                isLight ? "text-blue-600/70" : "text-blue-200/60"
              }`}
            >
              Session
            </p>
            <p
              className={`mt-1 text-lg font-semibold ${
                isLight ? "text-blue-800" : "text-slate-100"
              }`}
            >
              {identity?.sessionId.slice(-6) || "guest"}
            </p>
          </div>
          <span
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bd-glass-control ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </span>
        </div>
      </button>

      <div
        id="shop-directory-session-intelligence"
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[36rem] border-t opacity-100" : "max-h-0 opacity-0"} ${
          isLight ? "border-slate-200/60" : "border-white/[0.08]"
        }`}
      >
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-[22px] border px-4 py-3.5 sm:hidden ${
                isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-[0.18em] ${
                  isLight ? "text-blue-600/70" : "text-blue-200/60"
                }`}
              >
                Session
              </p>
              <p
                className={`mt-2 text-xl font-semibold ${
                  isLight ? "text-blue-800" : "text-slate-100"
                }`}
              >
                {identity?.sessionId.slice(-6) || "guest"}
              </p>
            </div>
            <div
              className={`rounded-[22px] px-4 py-3.5 ${
                isLight ? "bg-white/80 border border-slate-200/60" : "bd-glass-card"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-[0.18em] ${
                  isLight ? "text-blue-600/70" : "text-blue-200/50"
                }`}
              >
                Top match
              </p>
              <p
                className={`mt-2 text-base font-semibold ${
                  isLight ? "text-slate-900" : "text-slate-100"
                }`}
              >
                {summary.title}
              </p>
            </div>
            <div
              className={`rounded-[22px] border px-4 py-3.5 ${
                isLight ? "border-slate-200/60 bg-slate-50" : "border-white/[0.06] bg-white/[0.05]"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-[0.18em] ${
                  isLight ? "text-blue-600/70" : "text-blue-200/50"
                }`}
              >
                Summary
              </p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  isLight ? "text-slate-600" : "text-slate-300/80"
                }`}
              >
                {summary.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {summary.callouts.map((callout) => (
              <span
                key={callout}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  isLight
                    ? "border-slate-200 bg-slate-100 text-slate-700"
                    : "bg-white/[0.08] border-white/[0.10] text-slate-200"
                }`}
              >
                {callout}
              </span>
            ))}
            {contextChips.map((chip) => (
              <span
                key={chip}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-600"
                    : "border-white/[0.10] bg-white/[0.05] text-slate-300"
                }`}
              >
                {chip}
              </span>
            ))}
            {connectedCarrierNames.map((carrierName) => (
              <span
                key={carrierName}
                className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-300"
              >
                Connected: {carrierName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
