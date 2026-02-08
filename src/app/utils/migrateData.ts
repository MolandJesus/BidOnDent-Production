/**
 * Data Migration Utility
 * Migrates profile data from KV store to database
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

export async function migrateDataToDatabase(): Promise<{
  success: boolean;
  message: string;
  result?: any;
}> {
  try {
    console.log('🔄 Starting data migration to database...');
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c3ef122f/migrate-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Migration failed:', data.error);
      return {
        success: false,
        message: data.error || 'Migration failed'
      };
    }

    console.log('✅ Migration completed:', data.result);
    
    return {
      success: true,
      message: `Migration completed: ${data.result.migrated} profiles migrated, ${data.result.skipped} skipped`,
      result: data.result
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      message: `Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
