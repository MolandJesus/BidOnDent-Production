import { ChevronDown, Layers3 } from "lucide-react";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";

export interface ShopDirectoryIntelligencePanelProps {
  summary: IntelligenceSummary;
  contextChips: string[];
  connectedCarrierNames: string[];
  identity: WebsiteIdentity | null | undefined;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ShopDirectoryIntelligencePanel({
  summary,
  contextChips,
  connectedCarrierNames,
  identity,
  isOpen,
  onToggle,
}: ShopDirectoryIntelligencePanelProps) {
  return (
    <div className="mt-4 bd-glass-panel">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
        aria-expanded={isOpen}
        aria-controls="shop-directory-session-intelligence"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
            <Layers3 className="h-4 w-4" />
            Session intelligence
          </div>
          <p className="mt-2 text-base font-semibold text-slate-100 sm:text-lg">{summary.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300/80">
            See the live ranking context, connected carriers, and current map signals that are
            shaping which shops appear and in what order.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden rounded-2xl border border-blue-400/30 bg-blue-500/20 px-3 py-2 text-right sm:block">
            <p className="text-[11px] uppercase tracking-[0.16em] text-blue-200/60">Session</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{identity?.sessionId.slice(-6) || "guest"}</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bd-glass-control text-slate-300">
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </span>
        </div>
      </button>

      <div
        id="shop-directory-session-intelligence"
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[36rem] border-t border-white/[0.08] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-blue-400/30 bg-blue-500/20 px-4 py-3.5 sm:hidden">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/60">Session</p>
              <p className="mt-2 text-xl font-semibold text-slate-100">
                {identity?.sessionId.slice(-6) || "guest"}
              </p>
            </div>
            <div className="rounded-[22px] bd-glass-card px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/50">Top match</p>
              <p className="mt-2 text-base font-semibold text-slate-100">{summary.title}</p>
            </div>
            <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.05] px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/50">Summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-300/80">{summary.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {summary.callouts.map((callout) => (
              <span
                key={callout}
                className="rounded-full bg-white/[0.08] border border-white/[0.10] px-3 py-1.5 text-sm font-medium text-slate-200"
              >
                {callout}
              </span>
            ))}
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1.5 text-sm text-slate-300"
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
