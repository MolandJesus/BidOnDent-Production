import { motion, useReducedMotion } from "motion/react";

type AdminInfoPanelProps = {
  adminEmail: string;
};

export default function AdminInfoPanel({ adminEmail }: AdminInfoPanelProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.5 }}
      className="mt-6 bg-blue-400/10 border border-blue-400/30 rounded-lg p-4 mb-6"
    >
      <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Admin System Info</h3>
      <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
        <li>All test accounts are linked to your admin account ({adminEmail})</li>
        <li>You can create, delete, and switch between test accounts</li>
        <li>Use "Create Custom Test Account" to create accounts for other people</li>
        <li>Each account type has its own dashboard and features</li>
        <li>Account data is isolated between different account types</li>
        <li>Use "Switch To" to test features as different user types</li>
      </ul>
    </motion.div>
  );
}
