# Pass 45 — Pre-Launch Read-Only Health Sweep (2026-05-07)

**Status:** Complete. Three sub-audits run, all three delivered. Sub-audit A initially deferred by
VS Code Copilot builder (no MCP), then completed by planner-AI (Claude Code Opus) in the same
calendar day from a session with Supabase MCP available.
**Mode:** Read-only. Zero `src/` or `supabase/` edits. Zero installs. Zero deploys. Zero Supabase writes.

## Headline finding

**AI-side ship gate: CLEAR with one already-known P1 reconfirmed.**

- npm audit: **0 vulnerabilities** across 744 deps.
- Typecheck: **clean** (`npm run typecheck` exit 0).
- Outdated deps: 54 total, **none are security advisories**, all major-version drift is intentional (React 18→19, Vite 6→8 are deliberate holds).
- Supabase prod advisors: **completed.** No new P0 or unknown-P1. The only P1 surfaced is
  **KI-095 reconfirmed** — `GET /notification-preferences` returns 500 in cloud prod,
  re-reproduced today at timestamps `1778135494871` and `1778126191699`. Root cause confirmed:
  the `notification_preferences` table is missing on prod (PostgREST 404 alongside the edge
  function 500). Client circuit-breaker (60s) still masks the toast. **Owner-action: write the
  missing migration or feature-flag the handler.** Not autopilot scope.

## Sub-audit deliverables

| Sub-audit                         | Status   | Deliverable                                              |
| --------------------------------- | -------- | -------------------------------------------------------- |
| A. Supabase prod read-only health | COMPLETE | [`SUPABASE_HEALTH.md`](SUPABASE_HEALTH.md) (real findings) |
| B. npm supply-chain               | COMPLETE | [`DEPS_HEALTH.md`](DEPS_HEALTH.md) + raw json            |
| C. Type + lint sweep              | COMPLETE | [`TYPELINT_SWEEP.md`](TYPELINT_SWEEP.md) + raw logs      |

## Sub-audit A real findings — quick reference

(Full triage in `SUPABASE_HEALTH.md`.)

- **P1:** KI-095 reconfirmed — `/notification-preferences` 500 in prod. Owner-action.
- **P2:** Migration drift — 5 local SQL files not visibly applied to prod by name. Owner verifies via Studio.
- **P3 backlog (none launch-blocking):** 4× function `search_path_mutable`, 21× `auth_rls_initplan`,
  102× `multiple_permissive_policies`, 2× `duplicate_index`, 3× transient `tuple concurrently updated`.
- **P4 backlog:** 69× `unused_index`, 3× `unindexed_foreign_keys`.
- **Discarded as expected/false-positive:** 4× `rls_enabled_no_policy` (deny-by-default service tables),
  4× `rls_policy_always_true` (intentional public-submission funnels), 1× `auth_leaked_password_protection`
  (Clerk stack, not Supabase Auth — advisor doesn't apply).

**Net new KIs opened by this pass: zero.** Per `feedback_containment_over_expansion`, backlog items
are not getting new KI numbers each — they are noted in `SUPABASE_HEALTH.md` and surface for
post-launch consideration.

## Remaining ship blockers (owner-only)

Per planner verdict, these cannot be cleared by AI:

1. **KI-002** — `RESEND_API_KEY` not configured in prod. Owner deploy/secret action.
2. **KI-095** — `notification_preferences` table missing on prod. Owner schema decision: write
   the missing migration, or feature-flag the handler until the schema lands.
3. **`git push origin BidOnDent-Horizon-Beta`** — unpushed commits ahead of origin
   (`32f6bb18`, `79c55bd4`, `d14b5f6d`, prior Pass 45 commit, plus this sub-audit-A completion commit).
4. **Real-device validation** — iPhone walk per planner's Pass 44 alternative checklist.
5. **(Optional) Migration parity check** — owner confirms via Supabase Studio whether the 5
   local SQL files were applied with different timestamps or are genuinely missing.
6. **(Optional) Pass 44 unblock** — owner exports Clerk session cookies if authed mobile evidence is wanted before launch.

Manufacturing a Pass 46 from this clean sweep would be polish-drift. Autopilot terminates here per planner directive.
