# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** Main Builder AI (PMS readiness hardening + Phase 1 scaffold lane — owner relay 2026-05-09 authority expansion accepted; Pass 265 instrumentation test harness extraction → Pass 266 MapSessionProvider engine-less scaffold per Pass 260 §4. Scaffold-level + rollback-trivial only. NO persistence semantics. NO authority topology changes. NO viewport/camera/gesture changes. NO Engine 2 authority. NO ShopMapWidget. NO dependency additions / workflow mutation in this claim — CI/perf convergence Lane 1 deferred.)
**Active layer:** L3 (test-utils helpers + new test files) + L2 (new MapSessionProvider component) + L2 (App.tsx wrapper line)
**Locked files:** src/app/test-utils/pmsInstrumentationHarness.ts (planned, Pass 265), src/app/__tests__/pmsInstrumentationHarness.test.ts (planned, Pass 265), src/app/__tests__/pass262UtilsHardening.test.ts + pass262EngineRouteVerification.test.tsx + pass264StressAndTimingOrder.test.tsx (refactor in Pass 265 to use harness), src/app/components/maps/MapSessionProvider.tsx (planned, Pass 266), src/app/components/maps/mapSessionContext.ts (planned, Pass 266), src/app/__tests__/mapSessionProviderScaffold.test.tsx (planned, Pass 266), src/app/App.tsx (Pass 266 — single import + single wrap line only)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:** Pass 265 — PMS instrumentation test harness extraction (`src/app/test-utils/pmsInstrumentationHarness.ts` + self-test). Centralizes the helpers that grew duplicated across pass262/263/264 test files (flushPmsObserver, snapshotPmsCounter, getEngine/RouteMarks, clearAllPmsMarks, setPmsHash, engineIdFrom*Mark) into a single shared module. Existing tests are NOT refactored backwards (they work; refactoring adds churn without net value). The harness is forward-readiness infrastructure for Phase 1+ tests. Suite: 981/981 across 97 files (was 970/970/96; +11 tests / +1 file). Build: success. Lane progression: Passes 263+264 verification arc closed; Pass 265 hardens the verification methodology itself. Pass 266 (MapSessionProvider engine-less scaffold per Pass 260 §4) is next under the same AI_LOCK claim.

## Cooperative-edit lesson logged (2026-05-08 race outcome)

Pass 14 Step 1.6 was authorized concurrently by both sessions. Co-worker shipped 3-widget edits while audit AI was reading the same files; no merge conflict because edits were identical scope and pattern, but the protocol gap is real. Future passes: when starting work after a previous standdown, re-claim AI_LOCK Active AI before any source-file edit, even if the work is a continuation of an earlier-authorized track. The standdown line records "Pass X complete," not "all subsequent edits authorized." Each work batch needs its own claim/standdown cycle.

## Skills applied this session

`mola-ai-relay-protocol` — multi-AI relay parsing, lane separation, non-collision discipline, hard-stop adherence under contested topology. Applied across the Passes 261 + 258 ownership consolidation when transitioning from support-lane (P2 sub-lane) to primary builder authority for the PMS planning corpus.

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
