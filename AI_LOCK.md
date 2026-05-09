# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** Main Builder AI (Phase 3B PREP — owner-authorized full autopilot relay from ChatGPT meta-arbiter; Passes 245/246/247/248 simulation + audit + rehearsal tier; NO sub-pass C default flip, NO semantic inversion, NO Engine 2 work; STOP gate at Pass 248 closeout)
**Active layer:** L3 (test-only) + REFERENCE docs
**Locked files:** src/app/**tests**/engine3DefaultFlipSimulation.test.tsx, src/app/**tests**/engine3ReducedMotionAutoFitInteraction.test.tsx (planned), src/app/**tests**/engine3RollbackRehearsal.test.ts (planned), docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md (Phase 3B PREP §13 addendum only)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:** (uncommitted on disk pending host-side `rm -f .git/*.lock`) — Pass 14 Step 1.6 dashboard error-UX parity (co-worker AI) + Pass 12/13/14 audit AI edits + Pass 11 evidence batch + Pass 23 Step A MapProgramTopBar canonicalization + Pass 26 doc-only enrollment

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
