// Session Manager - Handles proactive token refresh and session monitoring
import { supabase } from "../services/supabaseService";
import { STORAGE_KEYS } from "../constants";

/**
 * Session Manager Configuration
 */
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const REFRESH_BEFORE_EXPIRY = 10 * 60; // Refresh 10 minutes before expiry

/**
 * Check if session is valid and refresh if needed
 * @returns true if session is valid, false if user needs to sign in
 */
export async function checkAndRefreshSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️ Session check error:', error.message);
      return false;
    }
    
    if (!session) {
      console.log('ℹ️ No active session');
      return false;
    }
    
    // Check if token is about to expire
    const expiresAt = session.expires_at;
    if (!expiresAt) {
      console.log('⚠️ Session has no expiration time');
      return true; // Assume valid if no expiration
    }
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    console.log('🔍 Session check:', {
      user: session.user.email,
      expiresIn: `${Math.floor(timeUntilExpiry / 60)} minutes`,
      willRefresh: timeUntilExpiry < REFRESH_BEFORE_EXPIRY
    });
    
    // Refresh if expiring soon
    if (timeUntilExpiry < REFRESH_BEFORE_EXPIRY) {
      console.log('🔄 Token expiring soon, refreshing...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('❌ Failed to refresh session:', refreshError?.message);
        return false;
      }
      
      console.log('✅ Session refreshed successfully');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking session:', error);
    return false;
  }
}

/**
 * Start monitoring session and auto-refresh
 * @returns cleanup function to stop monitoring
 */
export function startSessionMonitoring(): () => void {
  console.log('🔐 Starting session monitoring (checks every 5 minutes)');
  
  // Initial check
  checkAndRefreshSession();
  
  // Set up interval
  const intervalId = setInterval(() => {
    checkAndRefreshSession();
  }, SESSION_CHECK_INTERVAL);
  
  // Return cleanup function
  return () => {
    console.log('🔐 Stopping session monitoring');
    clearInterval(intervalId);
  };
}

/**
 * Validate session on startup - less aggressive than before
 * @returns true if session is valid, false if needs cleanup
 */
export async function validateSessionOnStartup(): Promise<{
  isValid: boolean;
  needsCleanup: boolean;
  message?: string;
}> {
  try {
    console.log('🔐 Startup: Validating session...');
    
    // Check if we have localStorage data
    const hasLocalData = Object.keys(localStorage).some((key) =>
      key.startsWith(STORAGE_KEYS.USER_DATA)
    );
    
    if (!hasLocalData) {
      console.log('ℹ️ No local data - user not signed in (normal on first visit)');
      return { isValid: false, needsCleanup: false };
    }
    
    // Try to get session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️ Session error:', error.message);
      // Only cleanup if it's a critical error
      if (error.message.includes('invalid') || error.message.includes('malformed')) {
        return { 
          isValid: false, 
          needsCleanup: true,
          message: 'Session data is corrupted. Please sign in again.'
        };
      }
      // For other errors, try to recover
      return { isValid: false, needsCleanup: false };
    }
    
    if (!session) {
      console.log('ℹ️ Session expired - needs fresh sign in');
      return { 
        isValid: false, 
        needsCleanup: true,
        message: 'Your session has expired. Please sign in again.'
      };
    }
    
    // Validate the token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️ Token validation failed:', userError?.message);
      
      // Try to refresh before giving up
      console.log('🔄 Attempting to refresh session...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.log('❌ Refresh failed - session is truly invalid');
        return { 
          isValid: false, 
          needsCleanup: true,
          message: 'Unable to restore your session. Please sign in again.'
        };
      }
      
      console.log('✅ Session recovered via refresh!');
      return { isValid: true, needsCleanup: false };
    }
    
    // All checks passed
    console.log('✅ Valid session found for:', user.email);
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = Math.floor((expiresAt * 1000 - Date.now()) / 1000 / 60);
      console.log(`📊 Session expires in ${expiresIn} minutes`);
    }
    
    return { isValid: true, needsCleanup: false };
  } catch (error) {
    console.error('❌ Unexpected error validating session:', error);
    // Don't cleanup on unexpected errors - let user try to continue
    return { isValid: false, needsCleanup: false };
  }
}

/**
 * Clear all session data (use this for logout only)
 */
export async function clearAllSessionData(): Promise<void> {
  console.log('🧹 Clearing all session data...');
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear ALL storage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('bidondent')) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ All session data cleared');
}
