import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Trash2, 
  LogIn, 
  Shield, 
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
  Mail,
  Lock,
  User,
  Save,
  HardDrive,
  Trash,
  Settings
} from "lucide-react";
import { TEST_ACCOUNTS } from "../config/adminConfig";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { supabase } from "../services/supabaseService";
import StorageDebugPanel from "./StorageDebugPanel";
import AdminAccountManager from "./AdminAccountManager";

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
  const [activeTab, setActiveTab] = useState<'legacy' | 'accounts'>('accounts');
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>({});
  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // New test account form state
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<'customer' | 'shop' | 'insurer'>('customer');
  const [newAccountPassword, setNewAccountPassword] = useState("");

  // User activity tracking state
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [showActivity, setShowActivity] = useState(false);

  // Admin management state
  const [targetAdminEmail, setTargetAdminEmail] = useState("");
  const [adminManagementStatus, setAdminManagementStatus] = useState("");
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  // Health check for Edge Function
  const checkEdgeFunctionHealth = async () => {
    setIsLoading(true);
    setOperationStatus("Checking Edge Function health...");

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/health`;
      console.log('🏥 Health check URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      console.log('📡 Health check status:', response.status);
      const data = await response.json();
      console.log('📡 Health check data:', data);

      if (response.ok && data.status === 'ok') {
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
      console.log('🔍 Querying all profiles from database...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('⏱️ Database query timed out after 5 seconds');
          resolve(null);
        }, 5000);
      });
      
      // Query only core columns that should always exist
      const queryPromise = supabase
        .from('profiles')
        .select('email, name, account_type, created_at')
        .order('created_at', { ascending: false });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // If timeout occurred
      if (result === null) {
        console.log('⚠️ Database query timed out');
        setOperationStatus(`⚠️ Query timed out after 5 seconds.\\n\\nThis suggests a database connectivity issue.\\n\\nPlease check your Supabase dashboard.`);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

      const { data: profiles, error } = result as any;

      if (error) {
        console.error('❌ Database query error:', error);
        setOperationStatus(`❌ Database Error:\\n\\n${error.message}\\n\\nCode: ${error.code || 'N/A'}\\n\\nDetails: ${error.details || 'N/A'}`);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

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
      console.log('🔍 Querying custom accounts from database...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('⏱️ Custom accounts query timed out after 5 seconds');
          resolve(null);
        }, 5000);
      });
      
      const queryPromise = supabase
        .from('profiles')
        .select('email, name, account_type, user_id, created_at, setup_completed')
        .order('created_at', { ascending: false });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // If timeout occurred
      if (result === null) {
        console.log('⚠️ Custom accounts query timed out');
        setOperationStatus(`⚠️ Query timed out. Database may be slow or unavailable.`);
        setCustomAccounts([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 5000);
        return;
      }

      const { data: profiles, error } = result as any;

      if (error) {
        console.error('❌ Database query error:', error);
        setOperationStatus(`❌ Database Error: ${error.message}`);
        setCustomAccounts([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 5000);
        return;
      }

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
      const customAccs: CustomAccount[] = customProfiles.map(p => ({
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
      customProfiles.forEach(p => {
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
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('⏱️ Account check timed out after 5 seconds for:', email);
          resolve(null);
        }, 5000);
      });
      
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // If timeout occurred
      if (result === null) {
        console.log('⚠️ Account check timed out for:', email);
        setAccountStatuses(prev => ({
          ...prev,
          [email]: { email, exists: false, loading: false, error: 'Timeout' }
        }));
        return;
      }
      
      const { data: profile, error: profileError } = result as any;

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error querying profile:', profileError);
        setAccountStatuses(prev => ({
          ...prev,
          [email]: { email, exists: false, loading: false, error: profileError.message }
        }));
        return;
      }

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
      // Use server endpoint to delete user completely
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email,
            adminEmail: adminEmail
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
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
      
      const requestBody = {
        email: email,
        password: password,
        name: accountInfo?.label || 'Test Account',
        account_type: accountType,
        adminEmail: adminEmail
      };

      console.log('🚀 Creating account with request:', requestBody);
      
      // Use server endpoint to create user with admin privileges
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/create-user`;
      console.log('🌐 Calling URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const result = await response.json();
      console.log('📡 Response data:', result);

      // Check for error first
      if (!response.ok) {
        const errorMsg = `❌ Error: ${result.error || 'Unknown error'}\\n\\nResponse: ${JSON.stringify(result, null, 2)}`;
        console.error('Account creation failed:', result);
        setOperationStatus(errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      // Check for success - handle both 'success' and 'created' fields
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
      
      // Use server endpoint to create user with admin privileges
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email,
            password: password,
            name: name,
            account_type: accountType,
            adminEmail: adminEmail
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
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

  // Load user activity (all accounts with last_login info)
  const loadUserActivity = async () => {
    setIsLoading(true);
    setOperationStatus("Loading user activity...");

    try {
      console.log('📊 Querying user activity from database...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('⏱️ User activity query timed out after 5 seconds');
          resolve(null);
        }, 5000);
      });
      
      // Try to get all profiles with created_at and last_login
      // Note: last_login might not exist yet if migration hasn't run
      const queryPromise = supabase
        .from('profiles')
        .select('email, name, account_type, created_at, last_login, setup_completed')
        .order('created_at', { ascending: false }); // Order by created_at as fallback

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // If timeout occurred
      if (result === null) {
        console.log('⚠️ User activity query timed out');
        setOperationStatus(`⚠️ Query timed out. Please try refreshing the page.`);
        setUserActivity([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 5000);
        return;
      }

      const { data: profiles, error } = result as any;

      if (error) {
        console.error('❌ Database query error:', error);
        
        // Check if error is because last_login column doesn't exist
        if (error.message && error.message.includes('last_login')) {
          setOperationStatus(`❌ Database Error: The 'last_login' column hasn't been added yet.\\n\\nPlease refresh the page to trigger the database migration.`);
        } else {
          setOperationStatus(`❌ Database Error: ${error.message}`);
        }
        
        setUserActivity([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 5000);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setOperationStatus(`⚠️ No user activity found`);
        setUserActivity([]);
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 3000);
        return;
      }

      console.log('✅ Found user activity:', profiles);
      
      // Sort by last_login if it exists, otherwise by created_at
      const sortedProfiles = [...profiles].sort((a, b) => {
        if (a.last_login && b.last_login) {
          return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
        } else if (a.last_login) {
          return -1; // a has login, b doesn't - a comes first
        } else if (b.last_login) {
          return 1; // b has login, a doesn't - b comes first
        } else {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
      
      setUserActivity(sortedProfiles);
      setShowActivity(true);
      setOperationStatus(`✅ Loaded activity for ${profiles.length} user(s)`);
      setTimeout(() => setOperationStatus(""), 3000);
      
    } catch (error) {
      console.error("❌ Load user activity error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUserActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin management functions
  const handleManageAdmin = async (promote: boolean) => {
    if (!targetAdminEmail) {
      alert("Please enter an email address");
      return;
    }

    setIsManagingAdmin(true);
    setAdminManagementStatus(`Managing admin status for ${targetAdminEmail}...`);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/manage-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: targetAdminEmail,
            promote: promote,
            adminEmail: adminEmail
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" style={{ color: primaryColor }} />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Manage test accounts and system administration
        </p>
        <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">
            Logged in as: {adminEmail}
          </span>
        </div>
      </motion.div>

      {/* Admin Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" style={{ color: primaryColor }} />
          Quick Actions
        </h2>
        
        <div className="flex gap-3">
          <button
            onClick={checkAllAccounts}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Check All Accounts
          </button>
          
          <button
            onClick={() => setShowNewAccountForm(!showNewAccountForm)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {showNewAccountForm ? 'Cancel' : 'Create Custom Test Account'}
          </button>
          
          <button
            onClick={checkEdgeFunctionHealth}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <HardDrive className="w-4 h-4" />
            Check Edge Function Health
          </button>
          
          <button
            onClick={verifyDatabase}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Database className="w-4 h-4" />
            Verify Database
          </button>
        </div>

        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 p-4 rounded-lg whitespace-pre-wrap ${
              operationStatus.startsWith("✅") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {operationStatus}
          </motion.div>
        )}
      </motion.div>

      {/* Admin Management Section - Only for Super Admin */}
      {adminEmail === 'molalign5@gmail.com' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: primaryColor }} />
            Admin Management
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">Super Admin Only</span>
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Promote or demote users to grant/revoke admin dashboard access. Admin accounts can access the Admin Dashboard but cannot promote others (only you can).
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address to promote/demote"
                value={targetAdminEmail}
                onChange={(e) => setTargetAdminEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isManagingAdmin}
              />
              <button
                onClick={() => handleManageAdmin(true)}
                disabled={isManagingAdmin || !targetAdminEmail}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Promote to Admin
              </button>
              <button
                onClick={() => handleManageAdmin(false)}
                disabled={isManagingAdmin || !targetAdminEmail}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <UserMinus className="w-4 h-4" />
                Revoke Admin
              </button>
            </div>
            
            {adminManagementStatus && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-lg whitespace-pre-wrap ${
                  adminManagementStatus.startsWith("✅") 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {adminManagementStatus}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* New Test Account Form */}
      {showNewAccountForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-sm border-2 border-green-300 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" style={{ color: primaryColor }} />
            Create Custom Test Account
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Create a test account for other people or additional testing purposes. This account will be fully functional and can be used to test all features.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name (optional)
              </label>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="John Doe"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                  placeholder="test123 (min. 6 characters)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Tip: Use simple passwords like "test123" for testing accounts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as 'customer' | 'shop' | 'insurer')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="customer">Customer (Car Owner)</option>
                  <option value="shop">Shop (Auto Repair Shop)</option>
                  <option value="insurer">Insurer (Insurance Company)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={createCustomAccount}
                disabled={isLoading || !newAccountEmail || !newAccountPassword}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
              
              <button
                onClick={() => {
                  setShowNewAccountForm(false);
                  setNewAccountEmail("");
                  setNewAccountName("");
                  setNewAccountPassword("");
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Linked Test Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: primaryColor }} />
          Linked Test Accounts
        </h2>

        <div className="space-y-4">
          {TEST_ACCOUNTS.map((account, index) => {
            const status = accountStatuses[account.email];
            
            return (
              <motion.div
                key={account.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`border rounded-lg p-4 transition-all ${
                  selectedAccount === account.email
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{account.label}</h3>
                      
                      {/* Status Badge */}
                      {status?.loading ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Checking...
                        </span>
                      ) : status?.exists ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : status ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <XCircle className="w-3 h-3" />
                          Not Created
                        </span>
                      ) : null}
                      
                      {/* Account Type Badge */}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        account.type === 'customer' 
                          ? 'bg-blue-100 text-blue-700'
                          : account.type === 'shop'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                    <p className="text-sm text-gray-500 font-mono">{account.email}</p>
                    
                    {status?.userId && (
                      <p className="text-xs text-gray-400 mt-1">
                        User ID: {status.userId}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {status?.exists ? (
                      <>
                        <button
                          onClick={() => switchToAccount(account.email)}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          Switch To
                        </button>
                        <button
                          onClick={() => deleteAccount(account.email)}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </>
                    ) : status && !status.loading ? (
                      <button
                        onClick={() => createAccount(account.email, account.type)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create
                      </button>
                    ) : (
                      <button
                        onClick={() => checkAccountStatus(account.email)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Check
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Manage Custom Test Accounts - Account Manager Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <AdminAccountManager />
      </motion.div>

      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
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

      {/* Switch Back Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-4 bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6"
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
            <li>Enter your admin password for <code className="bg-green-100 px-2 py-0.5 rounded font-mono font-semibold">{adminEmail}</code></li>
            <li>You'll be automatically signed in and redirected to the admin dashboard</li>
          </ol>
          <p className="mt-3 pt-3 border-t border-green-300">
            <strong>✨ Security:</strong> Your actual admin password is required each time you switch back. 
            No hardcoded passwords are used. Works with any auth method (email/password, Google, Apple, etc.)
          </p>
        </div>
      </motion.div>

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