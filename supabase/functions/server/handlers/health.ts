/**
 * Health Check and Database Management Handlers
 * Handles health checks and database initialization/migration logic
 */

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

/**
 * GET /health - Health check endpoint
 * Returns server status and version information
 */
export function healthCheck(respond: RespondFunction): Response {
  return respond({
    status: 'ok',
    version: '2026-03-21-v10',
    adminEmail: 'figmaadmin@bidondent.com'
  });
}

/**
 * POST /migrate-database - Database migration endpoint
 * Initializes database tables and adds necessary columns if missing
 */
export async function migrateDatabase(
  initializeDatabaseTables: () => Promise<void>,
  respond: RespondFunction
): Promise<Response> {
  try {
    await initializeDatabaseTables();

    // Step 2: Manually add clerk_user_id column if it still doesn't exist
    try {
      const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
      const dbUrl = Deno.env.get('SUPABASE_DB_URL') ?? '';
      if (dbUrl) {
        const client = new Client(dbUrl);
        await client.connect();

        try {
          // Check if column exists in vehicles table
          const checkResult = await client.queryArray(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'clerk_user_id'`
          );

          if (checkResult.rows.length === 0) {
            await client.queryArray(`ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;`);
          }

          // Do the same for damage_reports table
          const checkReportsResult = await client.queryArray(
            `SELECT column_name FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'damage_reports' AND column_name = 'clerk_user_id'`
          );

          if (checkReportsResult.rows.length === 0) {
            await client.queryArray(`ALTER TABLE public.damage_reports ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;`);
          }

        } finally {
          await client.end();
        }
      }
    } catch (postgresError: any) {
      console.warn('Could not verify columns via direct DB connection:', postgresError.message);
    }

    // Force PostgREST to reload schema cache via HTTP
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && serviceKey) {
        // PostgREST admin endpoint for schema cache reload
        const postgrestAdminUrl = supabaseUrl.replace('https://', 'https://') + '/rest/v1/';
        await fetch(postgrestAdminUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Prefer': 'schema-reload'
          }
        });
      }
    } catch (reloadError) {
      console.log('PostgREST schema reload attempted');
    }

    return respond({ success: true, message: 'Database migration completed' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return respond({ error: 'Migration failed', details: error.message }, 500);
  }
}
