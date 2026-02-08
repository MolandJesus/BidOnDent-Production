/**
 * Account Type Fix Utility
 * Manually updates account type in the database
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

export async function fixAccountType(
  email: string, 
  account_type: 'customer' | 'shop' | 'insurer'
): Promise<{
  success: boolean;
  message: string;
  profile?: any;
}> {
  try {
    console.log(`🔧 Fixing account type for ${email} to ${account_type}...`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c3ef122f/fix-account-type`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: email,
          account_type: account_type
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Fix failed:', data.error);
      return {
        success: false,
        message: data.error || 'Failed to fix account type'
      };
    }

    console.log('✅ Account type fixed:', data.profile);
    
    return {
      success: true,
      message: data.message,
      profile: data.profile
    };

  } catch (error) {
    console.error('❌ Fix error:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Example usage in console:
// import { fixAccountType } from './app/utils/fixAccountType';
// const result = await fixAccountType('molalign5+shop@gmail.com', 'shop');
// console.log(result);
