import { Sparkles } from "lucide-react";

import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

interface PreviewDirectoryNoticeProps {
  /** Optional override copy; defaults to the soft-launch standard message. */
  message?: string;
  /** Compact variant for tight surfaces (no icon, single-line). */
  compact?: boolean;
}

/**
 * F-24 (KI-099): honest "preview directory" notice for surfaces that source
 * shop data from `marketSeedShops.ts` instead of real Supabase rows. Shows
 * users that what they see is illustrative until partner shops are onboarded.
 *
 * Visibility is gated externally via `SHOP_DIRECTORY_IS_PREVIEW` from
 * `services/intelligence/marketIntelligence.ts`. Consumers should read that
 * flag and conditionally render this component.
 *
 * Canon-aligned: cool blue body with canon champagne trim. Per LAW canon
 * (rgba(196,144,65) champagne, rgba(140,82,22) bronze, body opacity in canon
 * range). No pure-white surfaces.
 */
export default function PreviewDirectoryNotice({
  message = "Preview directory — example shops shown while we onboard real partners. Saved bids and estimate requests will activate once shops join your area.",
  compact = false,
}: PreviewDirectoryNoticeProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-xl border ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-[13px]"
      } ${
        isLight
          ? "border-[rgba(140,82,22,0.22)] bg-[linear-gradient(180deg,rgba(248,250,255,0.84),rgba(238,247,255,0.78))] text-slate-700"
          : "border-blue-400/22 bg-[linear-gradient(180deg,rgba(20,42,92,0.74),rgba(12,30,68,0.68))] text-blue-100/85"
      }`}
      style={{
        boxShadow: isLight
          ? "0 6px 18px rgba(15,23,42,0.08), inset 0 1px 0 rgba(252,240,208,0.42)"
          : "0 8px 22px rgba(2,6,23,0.30), inset 0 1px 0 rgba(196,144,65,0.18)",
      }}
    >
      {!compact && (
        <Sparkles
          aria-hidden="true"
          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isLight ? "text-amber-700/75" : "text-amber-300/85"}`}
        />
      )}
      <p className="leading-snug">{message}</p>
    </div>
  );
}
