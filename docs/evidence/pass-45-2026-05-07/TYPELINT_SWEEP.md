# Sub-Audit C — Type + Lint Sweep

**Status:** COMPLETE. Clean.

## Typecheck

Command: `npm run typecheck` (resolves to `tsc -p tsconfig.json --noEmit` from local devDeps — avoids the wrong-tsc-on-PATH pitfall).

```
> bidondent@3.2.0 typecheck
> tsc -p tsconfig.json --noEmit
```

Exit code: **0**. Zero type errors. Raw: [`tsc.log`](tsc.log).

## Lint

No lint script defined in `package.json`:

```
"format":       "prettier --write .",
"format:check": "prettier --check ."
```

The repo uses Prettier for formatting only — no ESLint pipeline is wired. Per Pass 45 read-only scope, did **not** run `format:check` (would surface diffs but not actionable findings here, and the planner directive was "lint" specifically).

If a future pass adds ESLint (PLAN-tier work, not LAW), it should integrate with the existing typecheck + build pipeline.

## Findings summary

| Check          | Errors               | Warnings |
| -------------- | -------------------- | -------- |
| `tsc --noEmit` | 0                    | 0        |
| ESLint         | n/a — not configured | n/a      |

## Hard-stop check

- ❌ No tsc errors → no escalation.
- The Pass 43 build (3.52s) and this typecheck both pass, confirming the bid-card-article rename did not introduce type drift.
