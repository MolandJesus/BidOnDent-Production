/**
 * Session Debugger Utility
 * 
 * Add this to your browser console for debugging session issues:
 * 
 * To clear all session data and force fresh sign-in:
 * ```
 * window.clearBidondentSession()
 * ```
 */

declare global {
  interface Window {
    clearBidondentSession: () => void;
    checkBidondentSession: () => Promise<void>;
    refreshBidondentSession: () => Promise<void>;
  }
}

// Clear all Bidondent session data
window.clearBidondentSession = () => {
  console.log('🧹 MANUAL SESSION CLEAR - Removing all auth data...');
  
  // First, sign out from Supabase to properly clear the session
  (async () => {
    try {
      // Import Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
      
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      );
      
      console.log('🚪 Signing out from Supabase...');
      await supabase.auth.signOut();
      console.log('✅ Supabase sign out complete');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
    
    // NUCLEAR OPTION: Clear ALL localStorage
    console.log('💣 NUCLEAR CLEAR: Wiping ALL localStorage...');
    const allKeys = Object.keys(localStorage);
    console.log('📦 Total keys to remove:', allKeys.length);
    allKeys.forEach(key => {
      console.log(`  ❌ Removing: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Also clear sessionStorage
    console.log('💣 Clearing sessionStorage...');
    sessionStorage.clear();
    
    console.log('✅ All session data cleared!');
    console.log('🔄 Reloading page in 2 seconds...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  })();
};

// Check current session status
window.checkBidondentSession = async () => {
  console.log('🔍 CHECKING SESSION STATUS...');
  
  // Import Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
  
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('📊 Session Status:');
  console.log('  Has Session:', !!session);
  console.log('  Has Error:', !!error);
  
  if (error) {
    console.error('  ❌ Error:', error.message);
  }
  
  if (session) {
    console.log('  ✅ User Email:', session.user?.email);
    console.log('  ✅ User ID:', session.user?.id);
    console.log('  📅 Expires At:', new Date(session.expires_at! * 1000).toLocaleString());
    console.log('  🔑 Token Preview:', session.access_token?.substring(0, 30) + '...');
    console.log('  📏 Token Length:', session.access_token?.length);
    
    // Check if token is expired
    const expiresAt = session.expires_at! * 1000;
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft < 0) {
      console.error('  ⚠️ TOKEN IS EXPIRED!');
      console.log('  Run: window.clearBidondentSession()');
    } else {
      const minutesLeft = Math.floor(timeLeft / 1000 / 60);
      console.log(`  ⏱️ Token expires in: ${minutesLeft} minutes`);
    }
  } else {
    console.log('  ℹ️ No active session - user needs to sign in');
  }
  
  // Check localStorage
  const allKeys = Object.keys(localStorage);
  const authKeys = allKeys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('bidondent') ||
    key.includes('sb-')
  );
  
  console.log('📦 LocalStorage:');
  console.log('  Total keys:', allKeys.length);
  console.log('  Auth keys:', authKeys.length);
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    const preview = value ? value.substring(0, 50) + '...' : 'null';
    console.log(`    ${key}: ${preview}`);
  });
};

// Refresh current session
window.refreshBidondentSession = async () => {
  console.log('🔄 REFRESHING SESSION...');
  
  // Import Supabase client
  const { createClient } = await import('@supabase/supabase-js');
  const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
  
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );
  
  const { data: { session }, error } = await supabase.auth.refreshSession();
  
  console.log('📊 Session Status:');
  console.log('  Has Session:', !!session);
  console.log('  Has Error:', !!error);
  
  if (error) {
    console.error('  ❌ Error:', error.message);
  }
  
  if (session) {
    console.log('  ✅ User Email:', session.user?.email);
    console.log('  ✅ User ID:', session.user?.id);
    console.log('  📅 Expires At:', new Date(session.expires_at! * 1000).toLocaleString());
    console.log('  🔑 Token Preview:', session.access_token?.substring(0, 30) + '...');
    console.log('  📏 Token Length:', session.access_token?.length);
    
    // Check if token is expired
    const expiresAt = session.expires_at! * 1000;
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft < 0) {
      console.error('  ⚠️ TOKEN IS EXPIRED!');
      console.log('  Run: window.clearBidondentSession()');
    } else {
      const minutesLeft = Math.floor(timeLeft / 1000 / 60);
      console.log(`  ⏱️ Token expires in: ${minutesLeft} minutes`);
    }
  } else {
    console.log('  ℹ️ No active session - user needs to sign in');
  }
  
  // Check localStorage
  const allKeys = Object.keys(localStorage);
  const authKeys = allKeys.filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('bidondent') ||
    key.includes('sb-')
  );
  
  console.log('📦 LocalStorage:');
  console.log('  Total keys:', allKeys.length);
  console.log('  Auth keys:', authKeys.length);
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    const preview = value ? value.substring(0, 50) + '...' : 'null';
    console.log(`    ${key}: ${preview}`);
  });
};

console.log('🔧 Session Debugger loaded!');
console.log('📝 Available commands:');
console.log('  - window.clearBidondentSession() : Clear all session data & reload');
console.log('  - window.checkBidondentSession() : Check current session status');
console.log('  - window.refreshBidondentSession() : Refresh current session');

export {};