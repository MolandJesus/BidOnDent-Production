/**
 * Force Reload Utility
 * 
 * Helps clear browser cache and force reload when dynamic imports fail
 */

export const APP_VERSION = '2026-01-03-v1';

export function checkAndReload() {
  const storedVersion = localStorage.getItem('bidondent_app_version');
  
  if (storedVersion !== APP_VERSION) {
    console.log(`🔄 App version changed: ${storedVersion} -> ${APP_VERSION}`);
    console.log('🔄 Clearing cache and reloading...');
    
    // Clear localStorage (except for important user data)
    const keysToKeep = ['supabase.auth.token', 'bidondent_last_email'];
    const oldData: Record<string, string> = {};
    
    keysToKeep.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) oldData[key] = val;
    });
    
    // Clear everything
    localStorage.clear();
    
    // Restore important keys
    Object.entries(oldData).forEach(([key, val]) => {
      localStorage.setItem(key, val);
    });
    
    // Set new version
    localStorage.setItem('bidondent_app_version', APP_VERSION);
    
    // Hard reload (bypass cache)
    window.location.reload();
  }
}

// Auto-check on import
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem('bidondent_app_version');
  if (!storedVersion) {
    localStorage.setItem('bidondent_app_version', APP_VERSION);
  }
}
