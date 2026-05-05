import { AlertCircle, ArrowLeft, Camera } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
  const reduceMotion = useReducedMotion();

  return (
    <div className="pb-20 px-4 md:px-6 py-4 md:py-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        className="bd-dashboard-panel overflow-hidden rounded-3xl"
      >
        <div className="border-b border-white/[0.08] px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            className="bd-dashboard-secondary-button inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="px-5 py-10 text-center">
          <motion.div
            animate={{ x: [0, -7, 7, -5, 5, 0] }}
            transition={{ duration: reduceMotion ? 0 : 0.7, repeat: Infinity, repeatDelay: 3.6 }}
            className="bd-dashboard-note mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-blue-600 shadow-sm"
          >
            <AlertCircle className="h-7 w-7" />
          </motion.div>

          <h2 className="mt-5 text-2xl font-semibold text-slate-100">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAction}
              className="bd-dashboard-primary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white"
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
              className="bd-dashboard-secondary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
