# AI_LOCK — Active Session Coordination

**Schema purpose:** Coordinates multi-AI work on the same branch. Every AI session reads this file before any file edit. Updated in the same commit as the work it describes — no standalone "claim lock" or "release lock" commits.

---

## Active session

**Active branch:** BidOnDent-Horizon-Beta
**Active AI:** (none — PMS readiness hardening + Phase 1 scaffold lane standdown after Pass 266; Phase 2+ implementation gated on next owner authorization surface)
**Active layer:** (none)
**Locked files:** (none)
**Session start:** 2026-05-08 (cowork-A — Pass 26 owner-authorized continuation under "go full auto" directive; doc-only edits, no source files)
**Last commit:** Pass 266 — MapSessionProvider Phase 1 engine-less scaffold per Pass 260 §4. Three new files: `src/app/components/maps/MapSessionProvider.tsx` (provider component with first-line `maplibreResizePatch` import per Pass 260 §6 #1), `src/app/components/maps/mapSessionContext.ts` (`MapSessionContextValue` type + frozen `MAP_SESSION_DEFAULT_VALUE` no-op + `MapSessionContext`), `src/app/__tests__/mapSessionProviderScaffold.test.tsx` (8 tests pinning: renders children, default shape, frozen, callable no-ops, default with provider, default without provider via React fallback, mount/unmount cleanly, nested providers). Single source modification: `src/app/App.tsx` adds one import line + wraps `<AppWithToast />` with `<MapSessionProvider>` inside the existing `<ClerkProvider>` (Pass 259 §5 location (d) — post-Clerk). Phase 1 is intentionally INERT: provider returns `<Context.Provider value={MAP_SESSION_DEFAULT_VALUE}>{children}</Context.Provider>`; no engine mount, no state, no side effects beyond the resize-patch import. Behavior is byte-identical with or without the provider wrapper (default value is the createContext() fallback too). Suite: 989/989 across 98 files (was 981/981/97; +8 / +1 exact match). Build: success; bundle precache +4.33 KiB (provider + context ship to production as inert React tree node). NO autoFit / callerBoundsExplicit / viewport / camera / orchestration / Engine 2 authority / ShopMapWidget / sub-pass C changes. Phase 2 (engine lift) requires next owner authorization surface per Pass 260 §10.

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
