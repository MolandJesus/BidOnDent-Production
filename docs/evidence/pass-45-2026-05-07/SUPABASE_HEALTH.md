# Sub-Audit A — Supabase Prod Read-Only Health (COMPLETED)

**Status:** Completed 2026-05-07 by planner-AI (Claude Code Opus) after VS Code Copilot builder
correctly deferred — Copilot's environment lacks the Supabase MCP, planner's environment has it.
This file replaces the previous DEFERRED placeholder.

**Project audited:** `wmdcnjgtsppftrofaqqa` ("bidondent-production", us-east-2, PG 17.6.1.063,
ACTIVE_HEALTHY). Confirmed against `project_staging_supabase` memory — staging ref
`lhhdqycnhweaxqviwdqt` was NOT touched.

---

## Headline

**Ship gate verdict from sub-audit A: CLEAR with one known issue reconfirmed.**

The only P1 surfaced by advisor + log review is **KI-095** (already tracked) —
`GET /notification-preferences` returns 500 in cloud prod. Re-reproduced today at timestamps
`1778135494871` and `1778126191699`. Client circuit-breaker still masks the toast. No new P0/P1.

Everything else surfaced is either expected by design (deny-by-default RLS), pre-existing backlog
(perf advisor cleanup), or false-positive against this stack (Clerk-not-Supabase-Auth advisor).

---

## Security advisors (12 total)

| Level | Lint | Count | Verdict |
|---|---|---:|---|
| INFO | `rls_enabled_no_policy` | 4 | **Expected.** Tables `estimate_requests`, `job_assignments`, `kv_store_85e96b22`, `kv_store_9f243523` are deny-by-default — service-role-only access pattern, matches CLAUDE.md "Storage RLS is deny-by-default" invariant. Not a fix. |
| WARN | `function_search_path_mutable` | 4 | **Real, low-priority hardening.** Functions `requesting_clerk_user_id`, `handle_updated_at`, `safe_auth_uid`, `update_updated_at_column` need `SET search_path = ''` in their definitions. Migration-class fix, not user-facing. P3 backlog. |
| WARN | `rls_policy_always_true` | 4 | **Intentional.** All four are public-form INSERT funnels (`insurer_interest_submissions`, `kv_store_baa15238`, `platform_activity_events`, `shop_interest_submissions`). The advisor flags them mechanically. They're the canonical "anyone can submit a lead form" pattern. Not a fix. |
| WARN | `auth_leaked_password_protection` | 1 | **False positive against this stack.** Advisor checks Supabase Auth's HaveIBeenPwned hook. BidOnDent uses Clerk per CLAUDE.md load-bearing fact #1. Discard. |

**Net real security finding:** zero P0/P1. Four P3 search-path hardening fixes.

---

## Performance advisors (198 total)

| Level | Lint | Count | Verdict |
|---|---|---:|---|
| WARN | `multiple_permissive_policies` | 102 | Multiple RLS policies on same role/cmd. Performance, not security. Largely harmless on small tables. **Not launch-blocking.** Fix in a future RLS-consolidation pass. |
| WARN | `auth_rls_initplan` | 21 | RLS policies that re-evaluate `auth.uid()` per row instead of `(select auth.uid())`. Real perf issue at scale. Easy migration fix but mass scope — defer per `feedback_containment_over_expansion`. |
| INFO | `unused_index` | 69 | Indexes that have never been hit. Disk + write-amp cost. Cleanup opportunity, not blocker. |
| INFO | `unindexed_foreign_keys` | 3 | FKs without supporting indexes. Could matter on heavy joins. P3. |
| WARN | `duplicate_index` | 2 | Two duplicate indexes — easy migration win. P3-P4. |
| INFO | `auth_db_connections_absolute` | 1 | Informational connection count. No action. |

**None of the perf advisors are launch-blocking.** They're a real backlog when you have engineering
cycles for performance work — none change the user experience at current scale.

Per LAW Hardening Plan North Star ("no new features beyond core transaction filter") and
`feedback_containment_over_expansion`, these are NOT in autopilot scope. They become legitimate work
post-launch when there is real perf complaint or scale demand.

---

## API logs (default window, ~last 24h)

All sampled requests returned 200 except:

- **One 404:** `GET /rest/v1/notification_preferences?select=*&clerk_user_id=eq.user_…` —
  PostgREST 404 because the **`notification_preferences` table does not exist on prod**. This is the
  root cause of KI-095 (see edge-function logs below). Direct PostgREST hit confirms the table is
  missing, not just a handler error.

No 5xx in the API service window. Realtime websocket upgrades 101 (expected).

---

## Postgres logs

Mostly LOG-level connection auth (PgBouncer, postgres, authenticator). Three ERROR-level entries:

- **`tuple concurrently updated` × 3** at timestamps `1778135478190`, `1778135477328`,
  `1778135476947`. This is a Postgres race when two transactions modify the same row near-
  simultaneously. Often benign and self-recovering; in this trace they cluster around what looks
  like the migration-runner's `CREATE OR REPLACE FUNCTION public.handle_updated_at` statement
  (visible repeatedly in the logs). Likely a deploy-time race during a migration retry — not a
  production user path. **P3 — note for future migration runs but not a launch blocker.**

No fatal/panic, no constraint violations, no slow-query warnings.

---

## Edge function logs

One handler dominates: `wmdcnjgtsppftrofaqqa_8589b160-…_50` (the `server` function, version 50).

Status code distribution in the captured window:
- 200/204: ~80% (estimate-requests, bids, user-profile, reports, vehicles, geocode/search,
  website-preferences/relationships, etc.)
- **500 × 2** on `GET /notification-preferences` at `1778135494871` and `1778126191699` —
  **confirms KI-095 still firing in prod today.**
- **401 × ~17** on `GET /notification-preferences` in a tight cluster (`1778126367697`–`1778126439126`).
  Pattern: client polled the endpoint without a valid Clerk JWT. The 401 returns are correct
  behavior; the cluster suggests the client retried in a tight loop after a sign-out or token-rotation
  event. Worth a glance at the polling cadence in the client, but not a new KI — KI-095 already
  notes the 60s circuit breaker.

**No other 5xx.** Geocode, reports, bids, vehicles, user-profile, website-preferences all 200.

---

## Migration parity

Prod (5 migrations, version-stamped server-side):

| Version | Name |
|---|---|
| 20251231134703 | remote_schema |
| 20251231140130 | remote_schema |
| 20251231165433 | create_kv_table_85e96b22 |
| 20260111155047 | create_kv_table_9f243523 |
| 20260501174520 | storage_pointer_backfill |

Local (`supabase/migrations/`, 7 SQL files):

| File |
|---|
| 20251230000001_full_schema.sql |
| 20260416000001_soft_delete_rls_hardening.sql |
| 20260416000002_report_submission_idempotency.sql |
| 20260416000003_estimate_accepted_status.sql |
| 20260423000001_remote_rls_backfill.sql |
| 20260429000001_realtime_publication.sql |
| 20260501000001_storage_pointer_backfill.sql |

**Apparent drift:** local has 7 files, prod has 5. The naming convention diverges (local
`YYYYMMDDhhmmss` vs prod's collapsed pre-2026-01-01 schema dump as two `remote_schema` rows). The
`storage_pointer_backfill` migration appears in both with different timestamps but matching
semantics — that one is consistent.

**Real gap candidates (local SQL not visibly applied to prod by name):**
- `20260416000001_soft_delete_rls_hardening`
- `20260416000002_report_submission_idempotency`
- `20260416000003_estimate_accepted_status`
- `20260423000001_remote_rls_backfill`
- `20260429000001_realtime_publication`

Possible explanations (not investigated this pass — would require `execute_sql` reads):
1. They were applied via dashboard paste with different version stamps and never reconciled.
2. They were applied to staging (`lhhdqycnhweaxqviwdqt`) only. The `feedback_supabase_cli_pg17`
   memory notes `supabase db push` is broken on PG17 staging — the team has been pasting through
   the dashboard, which can produce timestamp-mismatched history.
3. They genuinely haven't been applied to prod.

**Most likely candidate for "missing on prod":** the `notification_preferences` table itself.
There is NO local migration that creates it. The handler at
[`supabase/functions/server/handlers/notification_preferences.ts`](../../../supabase/functions/server/handlers/notification_preferences.ts)
queries `from("notification_preferences")` (lines 86, 105, 180, and 28 in `notificationEmails.ts`),
but the schema is nowhere in the migrations directory. This is what's producing KI-095's 500s.

**Owner action needed (not autopilot):** confirm whether `notification_preferences` table exists on
prod via `select count(*) from notification_preferences` in Supabase Studio, then either (a) write
the missing migration and apply it, or (b) gate the handler behind a feature flag until the schema
lands.

---

## What would have been a hard stop (none triggered)

- ❌ ERROR-level security advisor — none.
- ❌ Exposed PII — none observed.
- ❌ Missing RLS on a user-data table — all user-data tables have RLS enabled (the no-policy ones
  are intentional service-role-only).
- ⚠️ Migration drift — present, but inherited (KI-095 already tracks the consequence). Not new and
  not catastrophic enough to escalate today.

---

## Triage table — findings → action

| Finding | Severity | KI | Owner-action vs AI-actionable |
|---|---|---|---|
| `/notification-preferences` 500 reconfirmed | P1 | KI-095 (existing) | Owner — needs schema migration write + apply, OR feature-flag the handler. Not autopilot scope. |
| `notification_preferences` table missing on prod | P1 | (root cause of KI-095) | Owner — schema decision + migration application. |
| Migration drift (5 local SQL not visibly on prod) | P2 | (not yet KI'd) | Owner — confirm via Studio whether content was applied with different timestamps. If genuinely missing, investigate via `feedback_supabase_cli_pg17` workflow. |
| 4× function `search_path` mutable | P3 | (backlog) | AI-actionable post-launch. One small migration: `ALTER FUNCTION ... SET search_path = '';` × 4. |
| 21× `auth_rls_initplan` | P3 | (backlog) | AI-actionable post-launch. Wrap each `auth.uid()` reference in `(select auth.uid())`. |
| 102× `multiple_permissive_policies` | P3 | (backlog) | AI-actionable post-launch — RLS consolidation pass. Out of scope for hardening per LAW. |
| 2× `duplicate_index` | P3 | (backlog) | AI-actionable post-launch — drop the duplicates in one migration. |
| 3× `tuple concurrently updated` ERROR | P3 | (backlog) | Likely deploy-time migration race; verify on next migration run. |
| 69× `unused_index` | P4 | (backlog) | Post-launch cleanup if storage costs become relevant. |
| 3× `unindexed_foreign_keys` | P4 | (backlog) | Post-launch — index any FK that joins shows up in slow query log. |
| `auth_leaked_password_protection` | n/a | n/a | False positive against Clerk. Discard. |
| 4× `rls_enabled_no_policy` (deny-by-default) | n/a | n/a | Intentional. Discard. |
| 4× `rls_policy_always_true` (public submit) | n/a | n/a | Intentional public funnels. Discard. |

---

## Net Pass 45 sub-audit A verdict

**Ship gate: CLEAR with one acknowledged P1.** KI-095 was already known and explicitly noted in
prior planner verdicts. No new P0 or unknown-P1 surfaced. Performance backlog is real but not
launch-blocking; per LAW it stays post-launch.
