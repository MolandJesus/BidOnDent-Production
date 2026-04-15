/**
 * Health Check and Database Management Handlers
 * Handles health checks and database initialization/migration logic
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

/**
 * GET /health - Lightweight health check (no DB calls)
 */
export function healthCheck(respond: RespondFunction): Response {
  return respond({
    status: 'ok',
    version: '2026-03-21-v10'
  });
}

/**
 * GET /health/deep - Deep health check with real DB connectivity tests
 */
export async function deepHealthCheck(
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  const checks: Record<string, string> = {};

  const tables = ['damage_reports', 'bids', 'profiles', 'vehicles'] as const;

  await Promise.all(
    tables.map(async (table) => {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        checks[table] = error ? `error: ${error.message}` : 'ok';
      } catch (e: any) {
        checks[table] = `error: ${e.message}`;
      }
    })
  );

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return respond(
    { status: allOk ? 'ok' : 'degraded', version: '2026-03-21-v10', checks },
    allOk ? 200 : 503
  );
}


/**
 * POST /migrate-database - Database validation endpoint
 * Verifies the frozen migration has been applied (no runtime DDL).
 */
export async function migrateDatabase(
  initializeDatabaseTables: () => Promise<void>,
  respond: RespondFunction
): Promise<Response> {
  try {
    await initializeDatabaseTables();
    return respond({ success: true, message: 'Database validation completed' });
  } catch (error: any) {
    console.error('Validation error:', error);
    return respond({ error: 'Database validation failed' }, 500);
  }
}
