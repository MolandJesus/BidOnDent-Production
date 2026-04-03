import { lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

const AdminDashboard = lazy(() => import("../../admin/AdminDashboard"));

type AccountAdminOverlayProps = {
  isOpen: boolean;
  isAdmin: boolean;
  primaryColor: string;
  adminEmail: string;
  onClose: () => void;
};

export default function AccountAdminOverlay({
  isOpen,
  isAdmin,
  primaryColor,
  adminEmail,
  onClose,
}: AccountAdminOverlayProps) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && isAdmin && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Admin panel"
          style={{
            background: "linear-gradient(180deg, #0b1220 0%, #0a1328 50%, #091020 100%)",
          }}
        >
          <div
            className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-blue-400/15 backdrop-blur-xl"
            style={{ background: "rgba(11, 18, 32, 0.92)" }}
          >
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-400/10 hover:bg-blue-400/20 transition-colors border border-blue-300/15"
              type="button"
              aria-label="Close admin panel"
            >
              <ArrowLeft className="w-5 h-5 text-blue-100" />
            </button>
            <h2 className="text-lg font-semibold text-slate-100">Admin Panel</h2>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400" />
              </div>
            }
          >
            <AdminDashboard primaryColor={primaryColor} adminEmail={adminEmail} />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
