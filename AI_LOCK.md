# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** Main Builder AI (Tier B Surface Confidence Expansion lane — owner-authorized 2026-05-09; Passes 252/253/254 = async-warning characterization → conditional test-env hardening → Tier B lifecycle confidence suite. NOT a reopening of KI-196 or Phase 3B. NO viewport/camera/autoFit/callerBoundsExplicit/convergence/orchestration changes. NO ShopMapWidget. Runtime edits only if strictly behavior-preserving + tied to test determinism. STOP and characterize on any semantic defect surfaced.)
**Active layer:** L3 (test-env + characterization tests) + minimal L1/L2/L3 source IF strictly defensive + behavior-preserving + test-determinism-tied
**Locked files:** src/test-setup/** (planned, Pass 253 if authorized), src/app/**tests**/asyncWarningCharacterization.test.ts (planned, Pass 252), vitest.config.\* (planned, Pass 253 if authorized)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:\*\* Pass 251 — KI-196 EMPTY\_\* singleton hardening (4 sites, 2 files). KI-196 lane delivered Passes 249/250/251: default-param hazard inventory (11 hits), SAFE-TO-HARDEN matrix (4 GO / 4 DEFER / 1 NO), behavior-preserving hardening with companion identity + semantic-equivalence tests (+8). Suite: 901/901 across 87 files. autoFit / callerBoundsExplicit / sub-pass C surfaces UNTOUCHED. ShopMapWidget UNTOUCHED (owner-dirty). DEFER hits (3, 4, 5, 9) and NO hit (8) NOT executed — re-authorization required for any 'widget-cohort hardening' lane.

## Cooperative-edit lesson logged (2026-05-08 race outcome)

Pass 14 Step 1.6 was authorized concurrently by both sessions. Co-worker shipped 3-widget edits while audit AI was reading the same files; no merge conflict because edits were identical scope and pattern, but the protocol gap is real. Future passes: when starting work after a previous standdown, re-claim AI_LOCK Active AI before any source-file edit, even if the work is a continuation of an earlier-authorized track. The standdown line records "Pass X complete," not "all subsequent edits authorized." Each work batch needs its own claim/standdown cycle.

## Skills applied this session

(none — text + doc work; no reusable AI pattern surfaced)

---

## Rules

1. Read this file before any edit on this branch.
2. Refuse to touch any path listed in `Locked files` if `Active AI` is set and is not you.
3. Update this file in the **same commit** as the work it describes.
4. On standdown, clear `Active AI`, `Active layer`, and `Locked files` in your final commit.
5. If `git status` shows changes you did not make, **STOP** and ask the owner.
6. Charter changes (`LAW_*` tier docs) are Opus-only.
7. High-risk L4 work (`supabase/functions/`, auth/storage invariants) is Opus-only.

## Layer assignment guidance

Per [`docs/LAW_LAYERED_ARCHITECTURE.md`](docs/LAW_LAYERED_ARCHITECTURE.md):

- L1 (design primitives) — `src/styles/`, `src/app/theme/`, `src/app/components/ui/`, `src/app/components/atmosphere/`
- L2 (screens) — `src/app/components/{landing,dashboard,maps,shop,insurer,codelayer,reports,admin}/`, `src/app/pages/`
- L3 (orchestration) — `src/app/features/`, `src/app/hooks/`
- L4 (services + edge) — `src/app/services/`, `supabase/functions/`, `supabase/migrations/`

Parallel AI work (one AI per layer) is only enabled after Phase 3 lock dry run + Phase 4 mobile sweep both ship clean.

## Hard stops (no AI proceeds)

- LAW conflicts
- Destructive data changes (DROP, DELETE without WHERE, force-push to main)
- Auth/storage invariants (verify_jwt change, signed-URL persistence)
- Schema migrations without owner authorization
- Provider changes (MapLibre → Mapbox, Clerk → other)
- Deploy/secret actions
- Overwriting unrelated work
- **Structural** changes to [`docs/MOLANDJESUS_DESIGN_DECISIONS.md`](docs/MOLANDJESUS_DESIGN_DECISIONS.md) — no merges, splits, archives, renames, or restructuring ever (structural lock is absolute). **Controlled additive edits** are permitted only under the clause in [`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md) "Controlled-edit clause" — phase-required, additive-only, `docs(canon):` prefixed.

## Skills applied schema

When a session uses a reusable AI skill, list it here so future agents can find the pattern source. Example values: `bd-design-identity`, `mola-ai-relay-protocol`, `supabase-clerk-edge-function`, `supabase-storage-signed-urls`, `supabase-pro-cost-control`.
