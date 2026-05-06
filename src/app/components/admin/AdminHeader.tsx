import { motion, useReducedMotion } from "motion/react";
import { Shield } from "lucide-react";

type AdminHeaderProps = {
  primaryColor: string;
  adminEmail: string;
};

export default function AdminHeader({ primaryColor, adminEmail }: AdminHeaderProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-8 h-8" style={{ color: primaryColor }} />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <p className="text-slate-300/80">Manage test accounts and system administration</p>
      <div className="mt-2 inline-flex items-center gap-2 bg-blue-400/15 px-3 py-1 rounded-full">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-600 font-medium">Logged in as: {adminEmail}</span>
      </div>
    </motion.div>
  );
}
