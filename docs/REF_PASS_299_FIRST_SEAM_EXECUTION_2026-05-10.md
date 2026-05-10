# REF — First Live Seam Execution: cn → platform-core (Pass 299, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #22 (Priority A: execute Pass 298 Option α; relay explicitly satisfied Pass 295 §7 unblocker #1).
**Tier:** REF (execution evidence + topology-pressure observations).
**Source modification:** YES — single extraction per Pass 298 §6 mechanical checklist. Fully reversible via git revert.
**Companion to:** [`REF_PASS_298_FIRST_MICRO_EXTRACTION_SPEC_CN_2026-05-10.md`](REF_PASS_298_FIRST_MICRO_EXTRACTION_SPEC_CN_2026-05-10.md) (the spec this pass executes).

---

## §1. Premise — relay #22 Phase D

Relay #22 explicitly authorized execution: *"You are therefore authorized to proceed with the FIRST micro-extraction execution pass. Proceed under: 'in-repo folder boundary, not npm package.'"*

That answer satisfies Pass 295 §7 unblocker #1 (PLAN_PLATFORM_BOOTSTRAP_PREP §3.3 package boundary granularity). Pass 298 Option α is the doctrine-aligned execution shape. This pass executes per Pass 298 §6 mechanical checklist and reports topology-pressure observations per relay #22 Priority B.

**Critical framing per relay #22:** *"The cn extraction is NOT valuable because 'a utility moved folders.' It is valuable because it will reveal: topology friction, ownership clarity, alias survivability, import-pressure behavior, boundary ergonomics, and future extraction psychology. This is now an architectural experiment."*

---

## §2. Mechanical execution log

Followed Pass 298 §6 in order:

| Step | Action | Result |
|---|---|---|
| 1 | `mkdir -p src/platform-core` | Folder created |
| 2 | `git mv src/app/components/ui/utils.ts src/platform-core/cn.ts` | History-preserving move; status shows `R` (rename) |
| 3 | `sed` replace `from "./utils"` → `from "@/platform-core/cn"` (scoped to `src/app/components/ui/*`) | 45 sites updated |
| 4 | `sed` replace `from "../ui/utils"` → `from "@/platform-core/cn"` (across `src/`) | 25 sites updated (approx) |
| 5 | `sed` replace `from "../../ui/utils"` → `from "@/platform-core/cn"` (across `src/`) | 19 sites updated (approx) |
| — | Verify zero remaining old paths | ✅ Clean |
| — | Verify exactly 89 sites at new canonical path | ✅ 89/89 |
| 6 | Add `src/platform-core/README.md` (~30 lines, inclusion criteria + sprawl resistance) | Created |
| 7 | `npx tsc --noEmit` | See §3 — pre-existing errors only |
| 8 | `npx vite build` | ✅ Built in 3.65s |
| 9 | `npx vitest run` (full suite) | ✅ 997/997 pass across 100 test files |

**Total elapsed time:** under 2 minutes for the mechanical work.

---

## §3. Pre-existing TypeScript errors (NOT caused by Pass 299)

`tsc --noEmit` surfaced 4 errors. **None reference `cn`, `@/platform-core/`, or any extraction-related path.** Verified by `grep -E "platform-core/cn|ui/utils|cn\(" <file>` returning empty for all 4:

| File | Error | Root cause | Pass 299 relevance |
|---|---|---|---|
| `coverageMapLifecycle.test.tsx:129,149` | `MapTileMode "standard"` mismatch + `NavigationDiscoveryPlace` shape | Pre-existing in committed code (test fixture stale vs current types) | NONE — file does not import cn |
| `reducedMotionContinuity.test.tsx:156` | Same `MapTileMode "standard"` mismatch | Pre-existing in committed code | NONE — file does not import cn |
| `AdminIntakeOperationsPanel.tsx:23` | `getToken` not on `useAuth` return type | Stale type from before Pass 286 wrapper inflation; runtime works | NONE — admin panel issue, not cn |
| `edgeErrorMessage.test.ts:28` | `SHOP_PROFILE_REQUIRED` not in `EdgeErrorCode` | Pre-existing dirty state (file was M in working tree at conversation start) | NONE — file does not import cn |

**Conclusion:** Pass 299's mechanical change is type-safe. Every consumer that imported `cn` from `./utils` etc. now imports `cn` from `@/platform-core/cn` — same exported function, same signature, same runtime behavior. The pre-existing errors are tracked separately and would have surfaced regardless of this pass.

---

## §4. Topology-pressure observations (relay #22 Priority B)

Each of the 7 questions from Pass 298 §7 + relay #22 Priority B:

### 4.1 Did the seam remain psychologically lightweight?

**YES.** The platform-core folder contains exactly 2 files (`cn.ts` + `README.md`). Reading the folder takes 30 seconds. There is no temptation to add infrastructure layers because the README explicitly resists sprawl. The seam is a folder boundary, not a framework.

### 4.2 Did ownership visibility improve?

**YES — meaningfully.** Before: `src/app/components/ui/utils.ts` carried no semantic signal about its tier. Was it shadcn-only? App-only? Generic? The path "components/ui/utils" implied "UI utility" but `cn` is not specifically a UI thing — it's a className helper. After: `src/platform-core/cn.ts` declares "this is platform-tier" by location alone. The new path is self-documenting in a way the old path was not.

### 4.3 Did alias usage feel natural or forced?

**Natural.** The existing `@/*` alias (already mapped to `./src/*` in both tsconfig + vite) absorbed the change with zero infrastructure work. `from "@/platform-core/cn"` reads cleanly because `@/` is already widely understood in shadcn-based codebases. No NEW alias was needed. This is significant: the seam mechanism succeeded WITHOUT touching tooling.

### 4.4 Did import-direction clarity improve?

**YES.** All 89 import sites now have an absolute path that names the platform tier. Before: relative paths varied by depth (`./utils`, `../ui/utils`, `../../ui/utils`) — same target, different paths. After: ONE canonical path. A reader can immediately tell "this is a platform-tier import" without computing the relative path.

A future ESLint `no-restricted-imports` rule can now mechanically enforce that `src/platform-core/**` does not import from `src/app/**`. The seam is enforceable, not just documented.

### 4.5 Did the topology remain shallow?

**YES.** Folder structure: `src/platform-core/cn.ts` + `src/platform-core/README.md`. Two files, one level deep. No `index.ts` barrel (relay #21 implicit warning against re-export indirection). No `utils/`, `helpers/`, `lib/` subfolders (relay #21 explicit prohibition: "avoid mega shared folders"). The depth is exactly what the doctrine asks for.

### 4.6 Did extraction create pressure toward platform sprawl?

**Resisted by design.** The README explicitly states inclusion criteria (the 7 questions) and sprawl-resistance ("New additions earn their place ONLY via the designed-for-extraction trigger or the duplication-triggered trigger. Do NOT use this folder as a generic `utils/` dumping ground."). Future passes have a mechanical reference to refuse opportunistic additions.

**One observed pressure:** the temptation to immediately move other A-pure files (the 48 shadcn primitives, Sentry init, useOnlineStatus, etc.) is real. The relay #22 directive resisted it: *"Do NOT opportunistically extract additional files."* This pass observes the temptation; future passes must continue to resist it. Each subsequent extraction earns its own owner-authorization.

### 4.7 Did any hidden coupling appear unexpectedly?

**NO.** All 89 import sites rewrote cleanly via sed. Zero compile errors caused by the move. Zero test failures caused by the move. Zero build failures caused by the move. The `cn` function had no hidden dependencies (`clsx` + `tailwind-merge` are external npm packages; no internal coupling).

The 4 pre-existing TypeScript errors are EXPLICITLY unrelated (verified by grep). They are tracked separately as known dirty-state issues that would have failed `tsc` regardless.

---

## §5. Successful seam-survivability evidence

The relay called this "an architectural experiment." Evidence collected:

**Mechanical evidence:**
- 89/89 import sites migrated cleanly
- Build: 3.65s, no errors
- Tests: 997/997 pass
- Reversibility: single `git revert` reverts everything

**Doctrine-preservation evidence:**
- ZERO new providers added
- ZERO orchestration depth increase
- ZERO new alias / tooling / config changes
- ZERO modification of any LAW doc
- ZERO modification of `placeDiscoveryQuality.ts:51` (per relay #18 — convergence hotspot continues to be preserved)
- ZERO modification of MOLANDJESUS / CLAUDE.md / PLAN_PLATFORM_*

**Architectural evidence:**
- Ownership visibility improved (§4.2)
- Import-direction clarity improved (§4.4)
- Folder topology remained shallow (§4.5)
- Sprawl pressure visible but resisted (§4.6)

**Relay #22 success criteria satisfied:** the seam mechanism works without flattening doctrine. Phase C → Phase D transition is complete.

---

## §6. What this pass establishes for future extractions

### 6.1 The cn-extraction template

Future A-pure or A-cosmetic extractions can follow the same shape:
1. Single file (or small file group) per pass
2. Move via `git mv` to `src/platform-core/<name>.ts`
3. Sed-rewrite imports to `@/platform-core/<name>`
4. Update README's "Current contents" list
5. Verify tsc + build + tests
6. Single commit

This is NOT a template for multiple files in one pass — relay #22 forbids opportunistic batching.

### 6.2 The README as sprawl-resistance mechanism

`src/platform-core/README.md` codifies the inclusion criteria. Any future agent attempting to add a file to `platform-core/` should be filtered through the README's 7-question check. The README itself becomes the enforcement instrument.

### 6.3 The alias-only doctrine confirmed

The cn extraction succeeded WITHOUT any tooling change. This validates Option α over Option δ (monorepo). Future extractions can continue under the same in-repo + `@/` alias model. Pass 295 §7 unblocker #3 (workspace tooling) is implicitly answered by experience: in-repo path-aliased imports work; pnpm + Turborepo is not yet needed.

### 6.4 The first concrete Stacey-portability proof

`@/platform-core/cn` is now a path Stacey's future site can copy verbatim if it lives in the same repo, OR import from a future shared layer. The extraction creates the FIRST file that's explicitly platform-tier rather than BD-tier. Stacey-V1 (per Pass 297 §7 — pure Tier A consumer) now has its first concrete consumable.

---

## §7. Pass 281 invariants check

| Invariant | Status |
|---|---|
| 4-layer provider mount order (#1) | UNTOUCHED |
| AppWithToast subcomponent boundary (#2) | UNTOUCHED |
| First-import-line resize-patch (#3) | UNTOUCHED — Pass 293 verification still holds |
| Light-vs-dark contrast LAW palette (#4) | UNTOUCHED |
| Reduced-motion guards (#5) | UNTOUCHED — Pass 287 + Pass 288 tests still pass |
| Two intentional `:root` blocks (#6) | UNTOUCHED |
| Pass 282 cadence/easing tokenization (#7) | UNTOUCHED |
| Pass 283 blur tokenization (#8) | UNTOUCHED |
| Pass 286 Clerk wrapper inflation (#9) | UNTOUCHED |
| Pass 287 provider-mount-order test (#10) | PASSES (verified §2 step 9) |
| Pass 288 persistence-namespace test (#11) | PASSES (verified §2 step 9) |
| Pass 289-297 audit observations (#12+) | UNTOUCHED (extended) |

Pass 281 §12 anti-patterns: ZERO violations.
Relay #15/#17/#18/#19/#20/#21/#22 prohibitions: ZERO violations.

---

## §8. What this pass does NOT do

- No additional files extracted (single-extraction discipline)
- No barrel `index.ts` added (would create re-export indirection)
- No `no-restricted-imports` lint rule added (relay #21: "soft boundary conventions" — flagged for future micro-pass, not bundled here)
- No tsconfig changes
- No vite.config changes
- No new test files
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit (owner-ratified work-product)
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors (NOT in scope; tracked separately)
- No modification of any other pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §9. Forward triggers

1. **Pass 300+ continues per relay #22 priorities:**
   - Priority C: provider-pattern doctrine REF artifact (relay #21+#22 explicit recommendation; pure-doc work)
   - Priority D: PMS / performance-tracking deep-dive (carefully — heavy continuity load)
   - Priority E: Stacey bootstrap simplification (awaits owner business context)
   - Priority F: continue false-universal detection
2. **Owner authorizes second extraction** — A-pure candidate set from Pass 295-297 includes Sentry init + errorReporting, useOnlineStatus, ~48 shadcn primitives. Each is a separate single-pass extraction. Recommended next: useOnlineStatus (single-file hook with no internal deps; same shape as cn).
3. **Owner authorizes lint rule** — `no-restricted-imports` for `platform-core/**` to formalize the import-direction discipline.
4. **Owner authorizes README evolution** — the README could grow a "How to add to platform-core" section with explicit rejection criteria. Optional.

---

## §10. Status

REF doc shipped Pass 299 alongside the actual extraction. The first live seam execution is complete and clean. Relay #22's "architectural experiment" has produced its first batch of evidence: the seam mechanism works, ownership visibility improved, no doctrine was flattened, reversibility is intact. Phase D → Phase E (continued seam evolution) is now a viable next step under owner authorization.

**End of doc.**
