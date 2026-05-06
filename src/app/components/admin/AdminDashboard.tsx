import { motion, useReducedMotion } from "motion/react";
import StorageDebugPanel from "../devtools/StorageDebugPanel";
import EdgeFunctionStatus from "../devtools/EdgeFunctionStatus";
import RealtimeStatusIndicator from "../devtools/RealtimeStatusIndicator";
import { StorageMonitor } from "../devtools/StorageMonitor";
import AdminAccountManager from "./AdminAccountManager";
import AdminHeader from "./AdminHeader";
import QuickActions from "./QuickActions";
import AdminManagementPanel from "./AdminManagementPanel";
import NewAccountForm from "./NewAccountForm";
import LinkedTestAccounts from "./LinkedTestAccounts";
import AdminInfoPanel from "./AdminInfoPanel";
import SwitchBackPanel from "./SwitchBackPanel";
import { useAdminActions } from "./useAdminActions";
import { realtimeBidService } from "../../services/realtime/RealtimeBidService";

/**
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

interface AdminDashboardProps {
  primaryColor: string;
  adminEmail: string;
}

export default function AdminDashboard({ primaryColor, adminEmail }: AdminDashboardProps) {
  const {
    accountStatuses,
    operationStatus,
    isLoading,
    showNewAccountForm,
    newAccountEmail,
    newAccountName,
    newAccountType,
    newAccountPassword,
    targetAdminEmail,
    adminManagementStatus,
    isManagingAdmin,
    setShowNewAccountForm,
    setNewAccountEmail,
    setNewAccountName,
    setNewAccountType,
    setNewAccountPassword,
    setTargetAdminEmail,
    checkEdgeFunctionHealth,
    verifyDatabase,
    checkAllAccounts,
    checkAccountStatus,
    deleteAccount,
    createAccount,
    createCustomAccount,
    switchToAccount,
    handleManageAdmin,
  } = useAdminActions(adminEmail);
  const reduceMotion = useReducedMotion();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Edge Function health check overlay */}
      <EdgeFunctionStatus />

      <AdminHeader primaryColor={primaryColor} adminEmail={adminEmail} />

      <QuickActions
        primaryColor={primaryColor}
        isLoading={isLoading}
        showNewAccountForm={showNewAccountForm}
        operationStatus={operationStatus}
        onCheckAllAccounts={checkAllAccounts}
        onToggleNewAccountForm={() => setShowNewAccountForm(!showNewAccountForm)}
        onCheckEdgeFunctionHealth={checkEdgeFunctionHealth}
        onVerifyDatabase={verifyDatabase}
      />

      {/* Admin Management Section - Only for Super Admin */}
      {adminEmail === "molalign5@gmail.com" && (
        <AdminManagementPanel
          primaryColor={primaryColor}
          targetAdminEmail={targetAdminEmail}
          isManagingAdmin={isManagingAdmin}
          adminManagementStatus={adminManagementStatus}
          onTargetAdminEmailChange={setTargetAdminEmail}
          onPromote={() => handleManageAdmin(true)}
          onRevoke={() => handleManageAdmin(false)}
        />
      )}

      {/* New Test Account Form */}
      {showNewAccountForm && (
        <NewAccountForm
          primaryColor={primaryColor}
          isLoading={isLoading}
          newAccountEmail={newAccountEmail}
          newAccountName={newAccountName}
          newAccountPassword={newAccountPassword}
          newAccountType={newAccountType}
          onEmailChange={setNewAccountEmail}
          onNameChange={setNewAccountName}
          onPasswordChange={setNewAccountPassword}
          onTypeChange={setNewAccountType}
          onCreate={createCustomAccount}
          onCancel={() => {
            setShowNewAccountForm(false);
            setNewAccountEmail("");
            setNewAccountName("");
            setNewAccountPassword("");
          }}
        />
      )}

      {/* Linked Test Accounts */}
      <LinkedTestAccounts
        primaryColor={primaryColor}
        accountStatuses={accountStatuses}
        isLoading={isLoading}
        onSwitchToAccount={switchToAccount}
        onDeleteAccount={deleteAccount}
        onCreateAccount={createAccount}
        onCheckAccount={checkAccountStatus}
      />

      {/* Manage Custom Test Accounts - Account Manager Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.25 }}
        className="mb-6"
      >
        <AdminAccountManager />
      </motion.div>

      <AdminInfoPanel adminEmail={adminEmail} />

      <SwitchBackPanel adminEmail={adminEmail} />

      {/* System Health: Realtime + Storage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.5 }}
        className="mb-6 space-y-4"
      >
        <div className="flex items-center gap-4 px-1">
          <span className="text-sm font-medium text-slate-300">Realtime Status:</span>
          <RealtimeStatusIndicator
            isConnected={realtimeBidService.getHealthStatus().activeSubscriptions > 0}
          />
        </div>
        <StorageMonitor />
      </motion.div>

      {/* Storage Debug Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.6 }}
      >
        <StorageDebugPanel />
      </motion.div>
    </div>
  );
}
