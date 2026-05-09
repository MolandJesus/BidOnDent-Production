# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** (none — Pass 268 Platform Extraction Discovery brief shipped; lane standdown. Forward triggers: owner picks repo-split option / ratifies platform doctrine / provides Stacey answers / authorizes PMS Phase 2.)
**Active layer:** (none)
**Locked files:** (none)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:** Pass 268 — Platform Extraction Discovery brief (`docs/PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`, 698 lines, PLAN-tier). Doc-only response to owner relay 2026-05-09 strategic expansion (BidOnDent → legacy/R&D, new modular platform repo, Stacey first branded implementation). Single discovery brief intentionally NOT split across 4 separate doctrine docs (would have been framework expansion against feedback_containment_over_expansion). Sections: §1 strategic context, §2 current repo architectural inventory (LOC by domain — ~30K business-coupled, ~10K platform-core, ~8.5K optional-module map), §3 4-tier extraction matrix (A platform core / B optional modules / C business-coupled / D archive-only), §4 3 repo-split options (α two-repo / β monorepo / γ three-repo) with axis tradeoffs and monorepo recommendation, §5 9 platform doctrine principles (brand-platform separation / provider seam discipline / optional-module independence / theme isolation / reduced-motion LAW / auth-provider-agnostic / storage-pointer doctrine / edge-function-auth doctrine / schema source-of-truth — most are direct ports of existing BD doctrine to platform tier), §6 5-phase migration sequencing thoughts (foundation → Tier A → Tier B → Stacey app → BD legacy decision), §7 PMS roadmap preservation (Phase 2+ docs remain authoritative; migrate to packages/persistent-map-session/ later), §8 Stacey planning prerequisites (8 question categories — service model / target client / emotional tone / positioning / reference brands / practical needs / existing assets / timeline — to defer brand work until answered), §9 explicit non-touches, §10 cross-references, §11 status. NO source / LAW / MOLANDJESUS touched. Decisions surfaced for owner review, NOT pre-committed.

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
