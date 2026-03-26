import { motion } from "motion/react";

type SwitchBackPanelProps = {
  adminEmail: string;
};

export default function SwitchBackPanel({ adminEmail }: SwitchBackPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.55 }}
      className="mt-4 bg-green-400/10 border-2 border-green-400/40 rounded-lg p-4 mb-6"
    >
      <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
        ✅ "Go Back to Admin Account" Feature
      </h3>
      <div className="text-sm text-green-800 space-y-2">
        <p>
          <strong>How test accounts switch back to this admin account:</strong>
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Click the "Go to Admin Account" button in the test account dashboard</li>
          <li>Confirm the switch in the dialog</li>
          <li>
            Enter your admin password for
            <code className="bg-green-100 px-2 py-0.5 rounded font-mono font-semibold">{adminEmail}</code>
          </li>
          <li>You'll be automatically signed in and redirected to the admin dashboard</li>
        </ol>
        <p className="mt-3 pt-3 border-t border-green-300">
          <strong>✨ Security:</strong> Your actual admin password is required each time you switch back. No hardcoded
          passwords are used. Works with any auth method (email/password, Google, Apple, etc.)
        </p>
      </div>
    </motion.div>
  );
}
