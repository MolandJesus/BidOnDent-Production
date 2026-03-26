import { AlertCircle, ArrowLeft, Camera } from "lucide-react";
import { motion } from "motion/react";

type MissingReportStateProps = {
  primaryColor: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onBack: () => void;
};

export default function MissingReportState({
  primaryColor,
  title,
  description,
  actionLabel,
  onAction,
  onBack,
}: MissingReportStateProps) {
  return (
    <div className="pb-20 px-4 md:px-6 py-4 md:py-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bd-glass-card overflow-hidden rounded-3xl"
      >
        <div className="border-b border-white/[0.08] px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.10]/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="px-5 py-10 text-center">
          <motion.div
            animate={{ x: [0, -7, 7, -5, 5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 3.6 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/100/10 text-blue-600 shadow-sm"
          >
            <AlertCircle className="h-7 w-7" />
          </motion.div>

          <h2 className="mt-5 text-2xl font-semibold text-slate-100">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
              }}
            >
              <Camera className="h-4 w-4" />
              {actionLabel}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.10]/60 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/40"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
