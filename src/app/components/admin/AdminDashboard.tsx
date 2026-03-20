import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TEST_ACCOUNTS } from "../../config/adminConfig";
import StorageDebugPanel from "../devtools/StorageDebugPanel";
import AdminAccountManager from "./AdminAccountManager";
import AdminHeader from "./AdminHeader";
import QuickActions from "./QuickActions";
import AdminManagementPanel from "./AdminManagementPanel";
import NewAccountForm from "./NewAccountForm";
import LinkedTestAccounts from "./LinkedTestAccounts";
import AdminInfoPanel from "./AdminInfoPanel";
import SwitchBackPanel from "./SwitchBackPanel";
import AdminIntakeOperationsPanel from "./AdminIntakeOperationsPanel";
import {
  AccountStatus,
  CustomAccount,
  checkAccountStatusAction,
  checkEdgeFunctionHealthAction,
  createAccountAction,
  createCustomAccountAction,
  deleteAccountAction,
  loadCustomAccountsAction,
  manageAdminStatusAction,
  switchToAccountAction,
  verifyDatabaseAction,
} from "./admin-dashboard-actions";

/**
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

interface AdminDashboardProps {
  primaryColor: string;
  adminEmail: string;
}

export default function AdminDashboard({ primaryColor, adminEmail }: AdminDashboardProps) {
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>({});
  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);
  const [operationStatus, setOperationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // New test account form state
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"customer" | "shop" | "insurer">(
    "customer"
  );
  const [newAccountPassword, setNewAccountPassword] = useState("");

  // Admin management state
  const [targetAdminEmail, setTargetAdminEmail] = useState("");
  const [adminManagementStatus, setAdminManagementStatus] = useState("");
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  const checkEdgeFunctionHealth = async () => {
    await checkEdgeFunctionHealthAction({
      setIsLoading,
      setOperationStatus,
    });
  };

  const verifyDatabase = async () => {
    await verifyDatabaseAction({
      setIsLoading,
      setOperationStatus,
    });
  };

  const loadCustomAccounts = async () => {
    await loadCustomAccountsAction({
      adminEmail,
      setIsLoading,
      setOperationStatus,
      setCustomAccounts,
      setAccountStatuses,
    });
  };

  const checkAccountStatus = async (email: string) => {
    await checkAccountStatusAction({
      email,
      setAccountStatuses,
    });
  };

  // Check all accounts
  const checkAllAccounts = async () => {
    setIsLoading(true);
    for (const account of TEST_ACCOUNTS) {
      await checkAccountStatus(account.email);
    }
    setIsLoading(false);
  };

  // Delete account
  const deleteAccount = async (email: string) => {
    await deleteAccountAction({
      email,
      adminEmail,
      setIsLoading,
      setOperationStatus,
      checkAccountStatus,
      loadCustomAccounts,
    });
  };

  // Create account
  const createAccount = async (email: string, accountType: string) => {
    await createAccountAction({
      email,
      accountType,
      adminEmail,
      setIsLoading,
      setOperationStatus,
      checkAccountStatus,
    });
  };

  // Create custom test account (for any email)
  const createCustomAccount = async () => {
    await createCustomAccountAction({
      adminEmail,
      newAccountEmail,
      newAccountName,
      newAccountType,
      newAccountPassword,
      setIsLoading,
      setOperationStatus,
      setNewAccountEmail,
      setNewAccountName,
      setNewAccountPassword,
      setShowNewAccountForm,
      loadCustomAccounts,
    });
  };

  // Switch to account (login as that account)
  const switchToAccount = async (email: string) => {
    await switchToAccountAction({
      email,
      setIsLoading,
      setOperationStatus,
    });
  };

  // Load custom accounts on component mount
  useEffect(() => {
    loadCustomAccounts();
  }, []);

  // Admin management functions
  const handleManageAdmin = async (promote: boolean) => {
    await manageAdminStatusAction({
      targetAdminEmail,
      promote,
      adminEmail,
      setIsManagingAdmin,
      setAdminManagementStatus,
      setTargetAdminEmail,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <AdminAccountManager />
      </motion.div>

      <AdminIntakeOperationsPanel primaryColor={primaryColor} />

      <AdminInfoPanel adminEmail={adminEmail} />

      <SwitchBackPanel adminEmail={adminEmail} />

      {/* Storage Debug Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <StorageDebugPanel />
      </motion.div>
    </div>
  );
}
