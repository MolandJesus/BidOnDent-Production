import { Camera, Check, X, Sun, Move, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type PhotoGuideProps = {
  onClose: () => void;
  onComplete: () => void;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
};

const TIPS = [
  {
    icon: <Sun className="w-4 h-4" />,
    label: "Natural light",
    detail: "Shoot outdoors or in a well-lit area",
  },
  {
    icon: <Move className="w-4 h-4" />,
    label: "4+ angles",
    detail: "Wide, medium, close-up, and side",
  },
  {
    icon: <Camera className="w-4 h-4" />,
    label: "Hold steady",
    detail: "Tap to focus on damage, then shoot",
  },
];

export default function PhotoGuide({
  onClose,
  onComplete,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
}: PhotoGuideProps) {
  const isLight = appearanceMode === "light";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className={`relative w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[80dvh] sm:max-h-[85vh] ${
          isLight
            ? "bg-white shadow-xl shadow-slate-300/40"
            : "bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/60 border border-white/[0.08]"
        }`}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className={`w-10 h-1 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5 sm:pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0ea5e9 100%)` }}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-lg font-bold leading-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                Photo tips
              </h2>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Better photos = better estimates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors min-w-[44px] min-h-[44px] ${
              isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-white/10 text-slate-400"
            }`}
            aria-label="Close photo guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
          {/* Tip cards */}
          <div className="space-y-2.5 mt-2">
            {TIPS.map((tip) => (
              <div
                key={tip.label}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  isLight
                    ? "border-slate-200/80 bg-slate-50/70"
                    : "border-white/[0.06] bg-white/[0.04]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/15 text-blue-300"
                  }`}
                >
                  {tip.icon}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    {tip.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {tip.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Angle shots grid */}
          <div className="mt-4">
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-2.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}
            >
              Capture these angles
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: "🚗", label: "Wide" },
                { emoji: "📷", label: "Medium" },
                { emoji: "🔍", label: "Close" },
                { emoji: "📐", label: "Side" },
              ].map((shot) => (
                <div
                  key={shot.label}
                  className={`text-center py-3 px-1 rounded-xl border ${
                    isLight ? "border-slate-200/80 bg-white" : "border-white/[0.06] bg-white/[0.03]"
                  }`}
                >
                  <div className="text-xl mb-1">{shot.emoji}</div>
                  <p
                    className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}
                  >
                    {shot.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick do/don't */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <div
              className={`rounded-xl p-3 border ${isLight ? "border-emerald-200 bg-emerald-50/50" : "border-emerald-500/20 bg-emerald-500/[0.06]"}`}
            >
              <p
                className={`text-xs font-bold mb-1.5 flex items-center gap-1 ${isLight ? "text-emerald-700" : "text-emerald-300"}`}
              >
                <Check className="w-3.5 h-3.5" /> Do
              </p>
              <ul
                className={`text-xs space-y-1 ${isLight ? "text-emerald-600" : "text-emerald-300/80"}`}
              >
                <li>Daylight / overcast</li>
                <li>Clean damage area</li>
                <li>Steady hands</li>
              </ul>
            </div>
            <div
              className={`rounded-xl p-3 border ${isLight ? "border-red-200 bg-red-50/50" : "border-red-500/20 bg-red-500/[0.06]"}`}
            >
              <p
                className={`text-xs font-bold mb-1.5 flex items-center gap-1 ${isLight ? "text-red-700" : "text-red-300"}`}
              >
                <X className="w-3.5 h-3.5" /> Avoid
              </p>
              <ul className={`text-xs space-y-1 ${isLight ? "text-red-600" : "text-red-300/80"}`}>
                <li>Camera flash</li>
                <li>Dark garages</li>
                <li>Harsh direct sun</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className={`shrink-0 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] border-t ${isLight ? "border-slate-200/60 bg-slate-50/50" : "border-white/[0.06] bg-white/[0.02]"}`}
        >
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98] min-h-[48px] shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0ea5e9 100%)` }}
          >
            <Camera className="w-4.5 h-4.5" />
            <span>Got it — start taking photos</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
          <button
            onClick={onClose}
            className={`w-full mt-2 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] ${
              isLight
                ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
            }`}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
