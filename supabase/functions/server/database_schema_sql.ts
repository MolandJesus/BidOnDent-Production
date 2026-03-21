import { bidFlowDatabaseSchemaSql } from "./database_schema_sql_bid_flow.ts";
import { coreDatabaseSchemaSql } from "./database_schema_sql_core.ts";
import { intakeDatabaseSchemaSql } from "./database_schema_sql_intake.ts";

export const databaseInitializationSql = [
  coreDatabaseSchemaSql,
  bidFlowDatabaseSchemaSql,
  intakeDatabaseSchemaSql,
].join("\n");
