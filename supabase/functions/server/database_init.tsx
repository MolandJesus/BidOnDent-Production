/**
 * Database Validation (cold-start safety net)
 *
 * Verifies that the canonical frozen migration has been applied.
 * Does NOT create tables, columns, or policies — all DDL lives in
 * supabase/migrations/20251230000001_full_schema.sql.
 *
 * The only DDL retained is CREATE OR REPLACE for the handle_updated_at()
 * trigger function, which is idempotent and harmless.
 */

const DB_URL = Deno.env.get('SUPABASE_DB_URL') ?? '';

/** Tables the frozen migration must have created. */
const REQUIRED_TABLES = [
  'profiles',
  'vehicles',
  'damage_reports',
  'bids',
  'job_assignments',
  'shop_profiles',
  'insurer_profiles',
  'website_preferences',
  'website_relationships',
  'platform_activity_events',
] as const;

/**
 * Validate database schema on cold start.
 * Ensures the frozen migration has run and critical tables + functions exist.
 */
export async function initializeDatabaseTables() {
  console.log('🔧 Validating database schema...');

  if (!DB_URL) {
    console.warn('⚠️ SUPABASE_DB_URL is not set. Skipping DB validation.');
    return;
  }

  let client: InstanceType<typeof (await import('https://deno.land/x/postgres@v0.17.0/mod.ts')).Client> | null = null;

  try {
    const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
    client = new Client(DB_URL);
    await client.connect();

    // Ensure handle_updated_at() exists (idempotent, harmless)
    await client.queryArray(`
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Verify required tables exist
    const result = await client.queryArray(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
       AND table_name = ANY($1)`,
      [REQUIRED_TABLES as unknown as string[]],
    );

    const found = new Set((result.rows as string[][]).map((r) => r[0]));
    const missing = REQUIRED_TABLES.filter((t) => !found.has(t));

    if (missing.length === 0) {
      console.log(`✅ All ${REQUIRED_TABLES.length} required tables verified`);
    } else {
      console.error(`❌ Missing tables: ${missing.join(', ')}. Run the frozen migration.`);
    }

    // Verify requesting_clerk_user_id() function exists (critical for RLS)
    const fnResult = await client.queryArray(
      `SELECT 1 FROM pg_proc
       WHERE proname = 'requesting_clerk_user_id'
       AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`,
    );
    if ((fnResult.rows?.length ?? 0) > 0) {
      console.log('✅ requesting_clerk_user_id() function verified');
    } else {
      console.error('❌ requesting_clerk_user_id() function missing — RLS will fail');
    }

    console.log('✅ Database validation complete');
  } catch (error) {
    console.error('❌ Database validation error:', error);
  } finally {
    if (client) {
      try { await client.end(); } catch { /* ignore */ }
    }
  }
}
