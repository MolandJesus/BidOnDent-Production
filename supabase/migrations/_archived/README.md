# ⚠️ ARCHIVED — DO NOT APPLY

These 27 files are the **historical** incremental migrations that built the production database incrementally through 2026-04-15. They are kept for audit / forensic reference only.

## Do not run these files

- **Fresh environment bootstrap** (local Docker, new staging project, new prod project): use the consolidated single-pass migration at [`../20251230000001_full_schema.sql`](../20251230000001_full_schema.sql). That file represents the final intended schema state with every fix, dedupe, and RLS policy already applied.
- **Existing production** (`wmdcnjgtsppftrofaqqa`): already has every one of these applied in its `supabase_migrations.schema_migrations` history. Re-running would fail with "already exists" errors.
- **Existing staging** (`lhhdqycnhweaxqviwdqt`): bootstrapped from the consolidated migration. Same caveat.

## Why they were archived (2026-04-15)

Applying them sequentially against a fresh database reproducibly failed due to:

- Duplicate `CREATE TABLE` definitions for `profiles`, `vehicles`, `damage_reports` across early migrations with conflicting `CHECK` constraints.
- Orphaned RLS policies from early migrations that later migrations never dropped, leaving dead policies alongside their replacements.
- Duplicate `updated_at` triggers firing twice per row update (two trigger functions: `handle_updated_at()` and `update_updated_at_column()`).
- Storage bucket privatization in migration 013 undone by the later `20231223000001_create_storage_buckets.sql` recreating them as public.
- Cross-dependency on tables created only by `database_init.tsx` (runtime cold-start SQL) or ad-hoc dashboard pastes — migration 012 dropped policies on tables that had never existed in the migrations folder.

Migration `011b_canonical_catchup.sql` (Pass 871) tried to close the drift gap but the underlying fragmentation was inherent. Pass (2026-04-15) replaced the fragmented set with the single consolidated file.

## Production migration history note

Production's `supabase_migrations.schema_migrations` still contains entries under the old filenames (e.g. `024_clerk_jwt_rls_policies`). The consolidated migration was NOT applied to production — production's schema is the cumulative result of these 27 files already. If `supabase db push` is ever run against production, it will see `20251230000001_full_schema.sql` as a new migration and attempt to re-apply it (which will fail). Always use dashboard paste for prod schema changes until this is resolved.
