import { bidFlowDatabaseSchemaSql } from "./database_schema_sql_bid_flow.ts";
import { coreDatabaseSchemaSql } from "./database_schema_sql_core.ts";
import { estimateRequestsDatabaseSchemaSql } from "./database_schema_sql_estimate_requests.ts";
import { intakeDatabaseSchemaSql } from "./database_schema_sql_intake.ts";

export const databaseInitializationSql = [
  coreDatabaseSchemaSql,
  bidFlowDatabaseSchemaSql,
  estimateRequestsDatabaseSchemaSql,
  intakeDatabaseSchemaSql,
].join("\n");
