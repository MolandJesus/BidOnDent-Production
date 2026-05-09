# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** (none — Pass 270 Platform Contamination Audit + MVP definition shipped; lane standdown. Forward triggers: owner ratifies MVP scope (Pass 270 §6.5) / ratifies anti-drift rules (Pass 270 §10) / answers any of the 24 cumulative decision points across Passes 268+269+270 / authorizes repo bootstrap / authorizes PMS Phase 2 / provides Stacey answers.)
**Active layer:** (none)
**Locked files:** (none)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:** Pass 270 — Platform Contamination Audit + MVP platform-core definition (`docs/PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`, 883 lines, PLAN-tier). Owner relay 2026-05-09 expanded directives 1-8 answered in single PLAN-tier doc per single-doc-per-pass discipline. Concrete data: 948 BD-naming occurrences across 225 files (mostly in theme.css `bd-` utilities), 274 files reference `shop`, 115 files `insurer`, 76 `bid`, 77 `vehicle`. Shell-layer coupling: 3 of 6 shell files CLEAN/LOW (BrandLogo, DashboardSidebar — zero refs; AppShell, LandingPageLayout — 1 ref each); DashboardHeader heaviest at 7 refs. UI primitives: 30+ files, ~95% clean (only NotificationToast has `bd-`). Pass 266 MapSessionProvider + Pass 262 perfMarks: essentially platform-grade already (only namespace prefix renames). Theme.css: 196 tokens + 208 `bd-*` utility classes + 4913 lines = primary refactor surface. MVP platform-core nucleus defined as 16 subsystems (§6.2). Emotional architecture concept formalized (4 layers: motion personality / interaction tempo / narrative density / atmospheric weight) as separate from visual design. Inert-seam doctrine codified ("seams before behavior", Pass 266 as exemplar) as candidate platform LAW. 5-layer doctrine separation table (operational / engineering / design / brand / business). 7 anti-drift operational rules to protect AI-governance from erosion. Three new owner-decision points beyond Pass 268+269: MVP scope ratification, optional-module-in/out, Stacey-gaps-strategy. NO source / LAW / MOLANDJESUS touched. **Last commit (prior — preserved for trail):** Pass 269 Platform Bootstrap Prep brief (`5c11e189`, 866 lines). Owner relay 2026-05-09 Point 7 explicit "deeply think through" directive answered: 6 architecture topics (naming / package boundaries / token-theme / auth abstraction / workspace tooling / AI-governance portability) + Point 2 AI-operational-environment-as-portable-asset concept formalized as meta-doctrine. Includes 21-decision-point owner checklist consolidating Pass 268 + 269 prerequisites for repo bootstrap. Recommendations surfaced (monorepo with pnpm+Turborepo / 3-tier token architecture / thin Clerk wrapper / META_AI_OPERATIONAL_DOCTRINE.md extraction) but ALL ratification required from owner before any new repo work. Platform direction expands canvas; canvas does not loosen brushwork. Companion memories updated: project_pms_planning_corpus (notes Phase 0/1 shipped + future module candidate status), new project_platform_extraction_direction (full strategic shift recap). Pass 268 DISCOVERY brief (`621fef2e`) precedes; Pass 269 deepens but does not supersede. NO source / LAW / MOLANDJESUS touched. Standdown follows. **Last commit (prior — preserved for trail):** Pass 268 Platform Extraction Discovery brief (`621fef2e`, 698 lines). Doc-only response to owner relay 2026-05-09 strategic expansion (BidOnDent → legacy/R&D, new modular platform repo, Stacey first branded implementation). Single discovery brief intentionally NOT split across 4 separate doctrine docs (would have been framework expansion against feedback_containment_over_expansion). Sections: §1 strategic context, §2 current repo architectural inventory (LOC by domain — ~30K business-coupled, ~10K platform-core, ~8.5K optional-module map), §3 4-tier extraction matrix (A platform core / B optional modules / C business-coupled / D archive-only), §4 3 repo-split options (α two-repo / β monorepo / γ three-repo) with axis tradeoffs and monorepo recommendation, §5 9 platform doctrine principles (brand-platform separation / provider seam discipline / optional-module independence / theme isolation / reduced-motion LAW / auth-provider-agnostic / storage-pointer doctrine / edge-function-auth doctrine / schema source-of-truth — most are direct ports of existing BD doctrine to platform tier), §6 5-phase migration sequencing thoughts (foundation → Tier A → Tier B → Stacey app → BD legacy decision), §7 PMS roadmap preservation (Phase 2+ docs remain authoritative; migrate to packages/persistent-map-session/ later), §8 Stacey planning prerequisites (8 question categories — service model / target client / emotional tone / positioning / reference brands / practical needs / existing assets / timeline — to defer brand work until answered), §9 explicit non-touches, §10 cross-references, §11 status. NO source / LAW / MOLANDJESUS touched. Decisions surfaced for owner review, NOT pre-committed.

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
