import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TEST_ACCOUNTS } from "../../config/adminConfig";
import { supabase } from "../../services/supabaseService";
import {
  createAdminUser,
  deleteAdminUser,
  getEdgeFunctionHealth,
  listAdminProfiles,
  manageAdminAccount,
  type AdminProfileSummary,
} from "../../services/supabase/admin";
import StorageDebugPanel from "../devtools/StorageDebugPanel";
import AdminAccountManager from "./AdminAccountManager";
import AdminHeader from "./AdminHeader";
import QuickActions from "./QuickActions";
import AdminManagementPanel from "./AdminManagementPanel";
import NewAccountForm from "./NewAccountForm";
import LinkedTestAccounts from "./LinkedTestAccounts";
import AdminInfoPanel from "./AdminInfoPanel";
import SwitchBackPanel from "./SwitchBackPanel";

/**
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

interface AdminDashboardProps {
  primaryColor: string;
  adminEmail: string;
}

interface AccountStatus {
  email: string;
  exists: boolean;
  accountType?: string;
  userId?: string;
  name?: string;
  loading: boolean;
  error?: string;
}

interface CustomAccount {
  email: string;
  name: string;
  accountType: 'customer' | 'shop' | 'insurer';
  createdAt: string;
  userId?: string;
  setupCompleted?: boolean;
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
  const [newAccountType, setNewAccountType] = useState<'customer' | 'shop' | 'insurer'>('customer');
  const [newAccountPassword, setNewAccountPassword] = useState("");

  // Admin management state
  const [targetAdminEmail, setTargetAdminEmail] = useState("");
  const [adminManagementStatus, setAdminManagementStatus] = useState("");
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  // Health check for Edge Function
  const checkEdgeFunctionHealth = async () => {
    setIsLoading(true);
    setOperationStatus("Checking Edge Function health...");

    try {
      const data = await getEdgeFunctionHealth();
      console.log('📡 Health check data:', data);

      if (data.status === 'ok') {
        setOperationStatus(`✅ Edge Function is healthy!\n\nStatus: ${data.status}\nTimestamp: ${data.timestamp}\n\nYour Edge Function is deployed and responding correctly.`);
      } else {
        setOperationStatus(`⚠️ Edge Function responded but with unexpected data:\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error("❌ Health check error:", error);
      setOperationStatus(`❌ Edge Function is NOT responding!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the Edge Function is deployed in Supabase Dashboard.`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Verify database and show all profiles with setup_completed status
  const verifyDatabase = async () => {
    setIsLoading(true);
    setOperationStatus("Querying profiles table...");

    try {
      const profiles = await listAdminProfiles();

      if (!profiles || profiles.length === 0) {
        setOperationStatus(`⚠️ No profiles found in database.\\n\\nThe profiles table exists but is empty.`);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

      // Format the results
      let statusMessage = `✅ Found ${profiles.length} profiles in database:\\n\\n`;
      
      profiles.forEach((profile, index) => {
        statusMessage += `${index + 1}. ${profile.email}\\n`;
        statusMessage += `   Name: ${profile.name || 'N/A'}\\n`;
        statusMessage += `   Type: ${profile.account_type}\\n`;
        statusMessage += `   Created: ${new Date(profile.created_at).toLocaleString()}\\n\\n`;
      });

      console.log('✅ Database verification successful:', profiles);
      setOperationStatus(statusMessage);
      
    } catch (error) {
      console.error("❌ Verify database error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\\n\\nStack: ${error instanceof Error ? error.stack : 'N/A'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 30000); // Show for 30 seconds
    }
  };

  // Load custom accounts from database (accounts not in TEST_ACCOUNTS)
  const loadCustomAccounts = async () => {
    setIsLoading(true);
    setOperationStatus("Loading custom accounts...");

    try {
      const profiles = await listAdminProfiles();
      if (!profiles) {
        console.log('⚠️ No profiles found');
        setOperationStatus(`⚠️ No profiles found`);
        setCustomAccounts([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 3000);
        return;
      }

      console.log('✅ Profiles retrieved:', profiles);

      // Filter out TEST_ACCOUNTS and admin email
      const testAccountEmails = TEST_ACCOUNTS.map(a => a.email);
      const customProfiles = profiles.filter(
        p => !testAccountEmails.includes(p.email) && p.email !== adminEmail
      );

      console.log('✅ Found custom accounts:', customProfiles);

      // Convert to CustomAccount format and update accountStatuses
      const customAccs: CustomAccount[] = customProfiles.map((p: AdminProfileSummary) => ({
        email: p.email,
        name: p.name || 'Unknown',
        accountType: p.account_type as 'customer' | 'shop' | 'insurer',
        createdAt: p.created_at,
        userId: p.user_id,
        setupCompleted: p.setup_completed
      }));

      setCustomAccounts(customAccs);

      // Update account statuses for custom accounts
      const newStatuses: Record<string, AccountStatus> = {};
      customProfiles.forEach((p: AdminProfileSummary) => {
        newStatuses[p.email] = {
          email: p.email,
          exists: true,
          accountType: p.account_type,
          userId: p.user_id,
          name: p.name || 'Unknown',
          loading: false
        };
      });
      
      setAccountStatuses(prev => ({ ...prev, ...newStatuses }));

      if (customAccs.length > 0) {
        setOperationStatus(`✅ Loaded ${customAccs.length} custom account(s)`);
      } else {
        setOperationStatus(`✅ No custom accounts yet`);
      }
      setTimeout(() => setOperationStatus(""), 3000);
      
    } catch (error) {
      console.error("❌ Load custom accounts error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCustomAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check account status
  const checkAccountStatus = async (email: string) => {
    setAccountStatuses(prev => ({
      ...prev,
      [email]: { email, exists: false, loading: true }
    }));

    try {
      console.log('🔍 Checking account for:', email);
      const [profile] = await listAdminProfiles(email);

      if (profile) {
        console.log('✅ Account exists:', profile);
        setAccountStatuses(prev => ({
          ...prev,
          [email]: {
            email,
            exists: true,
            accountType: profile.account_type,
            userId: profile.user_id,
            name: profile.name,
            loading: false
          }
        }));
      } else {
        console.log('❌ Account does not exist');
        setAccountStatuses(prev => ({
          ...prev,
          [email]: { email, exists: false, loading: false }
        }));
      }
    } catch (error) {
      console.error("Error checking account:", error);
      setAccountStatuses(prev => ({
        ...prev,
        [email]: { email, exists: false, loading: false, error: String(error) }
      }));
    }
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
    if (!confirm(`⚠️ Are you sure you want to delete ${email}?\n\nThis will permanently delete:\n- Auth user account\n- Database profile\n- All associated data\n\nThis action cannot be undone!\n\nContinue?`)) {
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Deleting ${email}...`);

    try {
      const result = await deleteAdminUser(email, { adminEmail });

      if (!result.success) {
        console.error('Delete error:', result.error);
        setOperationStatus(`❌ Error: ${result.error || 'Unknown error'}`);
      } else {
        console.log('✅ Account deleted successfully');
        setOperationStatus(`✅ Successfully deleted ${email}\n\nBoth auth and profile have been removed.`);
        
        // Refresh account status
        await checkAccountStatus(email);
        
        // Reload custom accounts list
        await loadCustomAccounts();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 5000);
    }
  };

  // Create account
  const createAccount = async (email: string, accountType: string) => {
    const password = prompt(`Create password for ${email}:\n\n(Use a test password like "test123" for testing)`);
    
    if (!password) {
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Creating ${email}...`);

    try {
      const accountInfo = TEST_ACCOUNTS.find(a => a.email === email);
      const result = await createAdminUser(
        {
          email,
          password,
          name: accountInfo?.label || 'Test Account',
          account_type: accountType,
        },
        { adminEmail }
      );
      console.log('📡 Response data:', result);

      // Check for error first
      if (!result.success && !result.created) {
        const errorMsg = `❌ Error: ${result.error || 'Unknown error'}\\n\\nResponse: ${JSON.stringify(result, null, 2)}`;
        console.error('Account creation failed:', result);
        setOperationStatus(errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log('✅ Account created successfully:', result);
      setOperationStatus(`✅ Successfully created ${email}\n\nPassword: ${password}\nUser ID: ${result.userId}\nAccount Type: ${result.accountType}\n\n(Save this password for testing)`);
      
      // Refresh account status
      await checkAccountStatus(email);
      
      setTimeout(() => {
        alert(`Account created!\n\nEmail: ${email}\nPassword: ${password}\nUser ID: ${result.userId}\n\nSave this password for testing.`);
      }, 500);
      
    } catch (error) {
      console.error("❌ Create error:", error);
      const errorMsg = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setOperationStatus(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Create custom test account (for any email)
  const createCustomAccount = async () => {
    if (!newAccountEmail) {
      alert("Please enter an email address");
      return;
    }

    if (!newAccountPassword) {
      alert("Please enter a password");
      return;
    }

    if (newAccountPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Creating ${newAccountEmail}...`);

    try {
      // Store values before resetting
      const email = newAccountEmail;
      const password = newAccountPassword;
      const accountType = newAccountType;
      const name = newAccountName || 'Test Account';

      const result = await createAdminUser(
        {
          email,
          password,
          name,
          account_type: accountType,
        },
        {
          adminEmail,
        }
      );

      if (!result.success) {
        setOperationStatus(`❌ Error: ${result.error || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      console.log('✅ Custom account created successfully:', result);
      setOperationStatus(`✅ Successfully created ${email}\n\nPassword: ${password}\n\n(Save this password for testing)`);
      
      // Reset form
      setNewAccountEmail("");
      setNewAccountName("");
      setNewAccountPassword("");
      setShowNewAccountForm(false);
      
      // Reload custom accounts list
      await loadCustomAccounts();
      
      setTimeout(() => {
        alert(`Test Account Created!\n\nEmail: ${email}\nPassword: ${password}\nType: ${accountType}\n\nSave this information for testing.`);
      }, 500);
      
    } catch (error) {
      console.error("Create error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Switch to account (login as that account)
  const switchToAccount = async (email: string) => {
    const password = prompt(`Enter password for ${email} to switch accounts:`);
    
    if (!password) {
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Switching to ${email}...`);

    try {
      // Sign out current user
      await supabase.auth.signOut();
      
      // Sign in as the test account
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        setOperationStatus(`❌ Error: ${signInError.message}`);
        setIsLoading(false);
        return;
      }

      if (!signInData.session) {
        setOperationStatus(`❌ Error: Login failed`);
        setIsLoading(false);
        return;
      }

      // Reload the page to trigger login flow
      setOperationStatus(`✅ Switching to ${email}... Reloading...`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Switch account error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  // Load custom accounts on component mount
  useEffect(() => {
    loadCustomAccounts();
  }, []);

  // Admin management functions
  const handleManageAdmin = async (promote: boolean) => {
    if (!targetAdminEmail) {
      alert("Please enter an email address");
      return;
    }

    setIsManagingAdmin(true);
    setAdminManagementStatus(`Managing admin status for ${targetAdminEmail}...`);

    try {
      const result = await manageAdminAccount(
        {
          email: targetAdminEmail,
          promote,
        },
        {
          adminEmail,
        }
      );

      if (!result.success) {
        setAdminManagementStatus(`❌ Error: ${result.error || 'Unknown error'}`);
        setIsManagingAdmin(false);
        return;
      }

      console.log('✅ Admin status managed successfully:', result);
      setAdminManagementStatus(`✅ Successfully ${promote ? 'promoted' : 'revoked'} admin status for ${targetAdminEmail}`);
      
      // Reset form
      setTargetAdminEmail("");
      setIsManagingAdmin(false);
      
    } catch (error) {
      console.error("Admin management error:", error);
      setAdminManagementStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsManagingAdmin(false);
    } finally {
      setIsManagingAdmin(false);
      setTimeout(() => setAdminManagementStatus(""), 10000);
    }
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
