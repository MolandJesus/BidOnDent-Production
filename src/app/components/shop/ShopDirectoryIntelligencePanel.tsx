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
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-white/40 sm:px-5"
        aria-expanded={isOpen}
        aria-controls="shop-directory-session-intelligence"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Layers3 className="h-4 w-4" />
            Session intelligence
          </div>
          <p className="mt-2 text-base font-semibold text-slate-950 sm:text-lg">{summary.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Open the live ranking context, session fingerprint, connected carriers, and current map
            signals only when you need the extra detail.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden rounded-2xl bg-slate-950 px-3 py-2 text-right text-white sm:block">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Session</p>
            <p className="mt-1 text-lg font-semibold">{identity?.sessionId.slice(-6) || "guest"}</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </span>
        </div>
      </button>

      <div
        id="shop-directory-session-intelligence"
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[36rem] border-t border-slate-200 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-950 px-4 py-3.5 text-white sm:hidden">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">Session</p>
              <p className="mt-2 text-xl font-semibold">
                {identity?.sessionId.slice(-6) || "guest"}
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Top match</p>
              <p className="mt-2 text-base font-semibold text-slate-950">{summary.title}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3.5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{summary.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {summary.callouts.map((callout) => (
              <span
                key={callout}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
              >
                {callout}
              </span>
            ))}
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
              >
                {chip}
              </span>
            ))}
            {connectedCarrierNames.map((carrierName) => (
              <span
                key={carrierName}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
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
