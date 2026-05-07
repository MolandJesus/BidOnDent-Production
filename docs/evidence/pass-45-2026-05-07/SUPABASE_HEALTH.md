# Sub-Audit A — Supabase Prod Read-Only Health (DEFERRED)

**Status:** Deferred. No Supabase MCP server available in this VS Code Copilot environment.

## Why deferred

Planner's prompt referenced `mcp__claude_ai_Supabase__*` tools (`list_projects`, `get_advisors`, `get_logs`, `list_migrations`). Those are Claude Code-specific MCP integrations. This pass ran in VS Code Copilot, where the available MCP toolset includes GitHub, Pylance, GitKraken, and Sonarqube — but not Supabase.

A targeted tool search for `supabase mcp advisors logs migrations list_projects` returned only Pylance/GitHub/GitKraken hits — no Supabase MCP surface.

## What this means for the ship gate

This sub-audit is the only Pass 45 branch left uncleared. It does NOT block ship-gate; it's a read-only sweep meant to surface advisories. If the owner wants this run before push:

### Option 1 — Run from Claude Code (recommended, takes 2 minutes)

```
Pass 45A — Supabase prod read-only health (Claude Code).

Run these MCP calls (read-only) and dump output to
docs/evidence/pass-45-2026-05-07/SUPABASE_HEALTH_RAW.md:

1. mcp__claude_ai_Supabase__list_projects
   → Confirm prod project ref (NOT staging "lhhdqycnhweaxqviwdqt").
2. mcp__claude_ai_Supabase__get_advisors type="security"
3. mcp__claude_ai_Supabase__get_advisors type="performance"
4. mcp__claude_ai_Supabase__get_logs service="api" (default window)
5. mcp__claude_ai_Supabase__get_logs service="postgres" (default window)
6. mcp__claude_ai_Supabase__get_logs service="edge-function" (default window)
7. mcp__claude_ai_Supabase__list_migrations
   → Diff vs local supabase/migrations/ filenames.

Triage table: each finding → existing KI?, severity P0-P5, owner vs AI.
DO NOT call: apply_migration, create_branch, deploy_edge_function,
pause_project, restore_project, execute_sql with mutations.

Read-only SELECT via execute_sql is OK for triage.
```

### Option 2 — Owner runs in Supabase dashboard

Supabase Studio → Project → Advisors. Same advisor data, GUI presentation. Manual but self-service.

### Option 3 — Skip

If `npm audit` clean and typecheck clean are sufficient launch evidence (see sibling `DEPS_HEALTH.md` and `TYPELINT_SWEEP.md`), this sub-audit can be deferred to post-launch monitoring. Supabase advisors generally surface long-lived schema issues (missing indexes on FKs, RLS gaps on public tables) — useful to know but rarely launch-blocking if the app already works.

## What would have been a hard stop

Per planner directive, any of these would have escalated to owner immediately:

- ERROR-level security advisor
- Exposed PII
- Missing RLS on a user-data table
- Migration drift (cloud has migrations not in local repo, or vice versa)

None of those can be ruled out without the actual run. Recommend Option 1 before push.
