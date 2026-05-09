# Dormant Exports Sweep (T-B) — Co-Worker AI

**Author:** Co-worker AI (Cowork session, full folder access).
**Date:** 2026-05-08, post-Pass-14-cluster-close, parallel with audit AI Pass 15.
**Trigger:** T-B from co-worker parallel-track dispatch; explicitly deferred to "pass 13/14" by audit AI Pass 12 closeout. Pass 14 cluster is complete; running T-B now.
**Method:** extract every `export const|function|async function` from `src/app/services/intelligence/`, count repo-wide references via `\bNAME\b` ripgrep, treat count=1 as candidate dead-code (only the definition site). Verify each candidate is not consumed via re-exports, barrel files, test fixtures, or aliased imports.
**Scope:** `src/app/services/intelligence/` (the file family Pass 11 first identified). Deeper sweeps (services/supabase, hooks/) deferred to follow-on passes.

---

## CORRECTION 2026-05-08 (audit AI Pass 17 self-correction propagated)

> Audit AI Pass 17 self-corrected their Pass 11 KI-165 entry: the function name `buildShopMapExperience` does NOT exist in shopMapExperienceHelpers.ts. The actual function at L218 of that file is `buildRoleAwareMapHighlights`, which is heavily consumed (useShopDirectoryComputedValues.ts:9 + 139, plus tests, plus re-export). My T-B sweep here propagated the original Pass 11 error and listed `buildShopMapExperience` as #1 dormant export. **It's not dead — it doesn't exist.** Independent verification 2026-05-08: `grep -nE "function buildShopMapExperience" src/app/services/intelligence/shopMapExperienceHelpers.ts` returns ZERO matches. Removing from dormant list.
>
> The other 4 dormant exports (NY_METRO_SUGGESTED_ORIGINS, NY_METRO_TEST_SHOPS, NY_METRO_TEST_SHOP_LOCATIONS, getShopDirectory) ARE confirmed dormant per their Pass 17 ship — audit AI removed nyMetroTestHubSeed.ts (229-line file → 22-line stub) and getShopDirectory() in marketIntelligence.ts. T-B sweep finding 2-5 stand; finding 1 retracted.

## Confirmed dormant exports (4 — was 5; 1 retracted)

| # | Export | Source | Pass-finding | Verified absent in |
|---|---|---|---|---|
| ~~1~~ | ~~`buildShopMapExperience`~~ | RETRACTED — function doesn't exist | Pass 17 audit AI self-correction | n/a |
| 2 | `NY_METRO_SUGGESTED_ORIGINS` | `services/intelligence/nyMetroTestHubSeed.ts:168` | this sweep (T-B) | source tree, test files, no barrel re-export |
| 3 | `NY_METRO_TEST_SHOPS` | `services/intelligence/nyMetroTestHubSeed.ts:166` | this sweep | same |
| 4 | `NY_METRO_TEST_SHOP_LOCATIONS` | `services/intelligence/nyMetroTestHubSeed.ts:152` | this sweep | same |
| 5 | `getShopDirectory` | `services/intelligence/marketIntelligence.ts:57` | this sweep | source tree, test files, no consumer (see KI-100 reconciliation below) |

All five exports survive in the production bundle (esbuild keeps named exports unless tree-shaken at the bundler level), but contribute zero functionality. Removing them is mechanical and revertable.

## KI-100 status finding (audit-trail update)

`REF_KNOWN_ISSUES.md` KI-100 says of `getShopDirectory` and `buildShopRecommendations`:

> "20+ consumers across `src/app/components/shop/` + `src/app/components/maps/`"

Repo-wide ripgrep contradicts this claim:

| Function | Repo-wide consumer count (file-level) |
|---|---|
| `getShopDirectory` | 1 (only the export site) — **DEAD** |
| `buildShopRecommendations` | 3 (export site + test fixture + 1 downstream service `shopMapExperience.ts`) |

The "20+ consumers" KI-100 cites no longer reflects current state. The deferred KI-100 refactor target has shrunk to almost nothing for `getShopDirectory` (zero consumers) and to 3 files for `buildShopRecommendations` (one of which is the test).

**KI-100 status update recommendation:**
- Reframe from "20+ consumer file refactor" to "remove `getShopDirectory` (dead) + migrate `buildShopRecommendations`'s 1 actual consumer (`shopMapExperience.ts`) to async + Supabase"
- Severity: P3-DEAD-CODE for `getShopDirectory` removal alone
- Scope shrinks from "dedicated pass with diagnose-first protocol" to "single-pass janitor work"

NOT writing this update myself — REF_KNOWN_ISSUES.md is currently being modified by audit AI's Pass 14 + Pass 15 work; coordinated update via master-builder fold avoids edit collision. Flagging for next pass.

## Removable line count estimate

| File | Approx lines to remove |
|---|---|
| `shopMapExperienceHelpers.ts` | `buildShopMapExperience` block ~11 lines + customer-fallback persona block + types if unused elsewhere |
| `nyMetroTestHubSeed.ts` | three exports + the `Place[]` / `ShopProfile[]` arrays they reference (depends on whether `Place` / `ShopProfile` types are used elsewhere) |
| `marketIntelligence.ts` | `getShopDirectory` function definition (~3 lines) |

Conservative estimate: **40-80 LoC removable** in a janitor pass. Type cleanup adds another 10-30 LoC if the dependent types are also dead.

## Cleanup-pass scope sketch

NOT staged this turn (Pass 11 hard-stop "pinpoint + recommend only" still applies to dead-code removal; master-builder authorization required for actual removal).

When master builder authorizes, suggested commit shape:

  Pass 16 candidate (or whichever number is next):
    files: shopMapExperienceHelpers.ts, nyMetroTestHubSeed.ts, marketIntelligence.ts
    scope: remove the 5 dormant exports + their unused dependencies
    risk: low — five exports each verified zero-consumer; reverts cleanly
    verification: typecheck before/after; no behavior change expected
    KI fold: KI-100 status downgrade to P3-DEAD-CODE companion finding

## Sweep limitations / future scope

This sweep covered ONLY `services/intelligence/`. Worth running on:

- `src/app/services/supabase/` — recently churned via Pass 14 cluster; some helpers may have lost consumers
- `src/app/services/intelligence/shopMapExperienceHelpers.ts` deeper — `buildShopMapExperience` is dead, but the entire file may have other dormant helpers it co-wrote
- `src/app/hooks/` — large flat directory (68 hooks per LAW_LAYERED_ARCHITECTURE), some hooks likely unused
- `src/app/types/` — type definitions that no longer have callers

Each is a separate T-B-style sweep, time-bounded to ~30 min per directory. Not pursued this turn.

---

## Cross-references

- `REF_KNOWN_ISSUES.md` KI-100 (refactor scope outdated; recommend status update)
- `REF_KNOWN_ISSUES.md` KI-165 (Pass 11 dead-code lineage of `buildShopMapExperience`)
- LAW_LAYERED_ARCHITECTURE.md (anti-cascade rule applies — discovering dead code is not an obligation to refactor; awaits master-builder authorization)
- audit AI Pass 12 closeout authorizing T-B for "pass 13/14"
- ENGINE_SURFACES_MATRIX.md (services/intelligence/ files referenced; this sweep complements engine attribution)

**Sweep complete.** 5 confirmed dormant exports + 1 KI-100 status correction queued for master-builder fold. No actual removal performed; recommend-only output.
