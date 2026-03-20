/**
 * Database Initialization
 * Creates all required tables if they don't exist using direct SQL execution
 */

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

import { databaseInitializationSql } from "./database_schema_sql.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DB_URL = Deno.env.get("SUPABASE_DB_URL") ?? "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/**
 * Initialize all database tables
 */
export async function initializeDatabaseTables() {
  console.log("🔧 Initializing database tables...");

  if (!DB_URL) {
    console.warn("⚠️ SUPABASE_DB_URL is not set. Skipping DB init.");
    return;
  }

  try {
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    const client = new Client(DB_URL);

    await client.connect();
    console.log("✅ Connected to database");

    try {
      await client.queryArray("SET client_min_messages TO WARNING;");
      await client.queryArray(databaseInitializationSql);
      console.log("✅ Database tables and policies initialized successfully");

      try {
        await client.queryArray("NOTIFY pgrst, 'reload schema';");
        console.log("✅ PostgREST schema cache reload notification sent");
      } catch {
        console.log("⚠️ Could not notify PostgREST (this is okay)");
      }
    } catch (error) {
      if (
        !error.message.includes("already exists") &&
        !error.message.includes("does not exist, skipping")
      ) {
        console.error("❌ Database initialization error:", error);
      }
      console.log(
        "⚠️ Database initialization completed with notices (this is normal if tables already exist)"
      );
    } finally {
      try {
        await client.end();
      } catch {
        // Ignore close errors.
      }
    }

    try {
      const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
      const verifyClient = new Client(DB_URL);
      await verifyClient.connect();

      const result = await verifyClient.queryArray(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('profiles', 'vehicles', 'damage_reports', 'bids', 'public_partner_shops', 'shop_interest_submissions', 'insurer_interest_submissions', 'platform_activity_events', 'job_assignments')"
      );

      await verifyClient.end();

      if (result.rows.length === 9) {
        console.log("✅ All 9 core tables verified");
        console.log("✅ Database is ready for use!");
      } else {
        console.log(`⚠️ Found ${result.rows.length}/9 expected tables`);
      }
    } catch {
      console.log("⚠️ Could not verify tables, but initialization completed");
    }
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
  }
}
