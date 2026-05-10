# REF — First Micro-Extraction Preparation Spec: `cn` Utility (Pass 298, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #21 (Phase C Priority A: prepare the first micro-extraction candidate; the purpose is NOT reuse value, the purpose is to prove the seam mechanism itself).
**Tier:** REF (preparation spec — not execution).
**Source modification:** ZERO. No actual file moved. No imports rewritten. No alias added. Pure read-only spec ready for owner ratification.
**Companion to:** Pass 295 §7 (3 unblocker decisions); Pass 296 §3.1 (cn classified as A-pure); Pass 297 §5 extraction-trigger taxonomy (cn = "designed-for-extraction").

---

## §1. Premise — controlled seam proving

Relay #21 framed Phase C as: *"prove that lightweight extraction-safe seams can survive WITHOUT flattening doctrine."* The relay explicitly nominated cn as the first candidate because:

> *"tiny blast radius, structurally universal, behaviorally universal, no trust choreography, no continuity semantics, no authority ownership, no orchestration load, and extraction success/failure is immediately visible. The purpose of this extraction is NOT reuse value. The purpose is: prove the seam mechanism itself."*

This pass produces the EXTRACTION SPEC. Owner ratification of the spec (and the underlying Pass 295 §7 unblocker decisions) is the trigger for actual execution. Pass 298 itself extracts NOTHING.

---

## §2. The candidate

**File:** [`src/app/components/ui/utils.ts`](../src/app/components/ui/utils.ts) (5 lines)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**External deps:** `clsx` + `tailwind-merge` (both standard npm packages).
**Internal deps:** ZERO.
**Side effects:** ZERO.

This is the canonical shadcn `cn` helper — ubiquitous in shadcn-based codebases, fully vendor-neutral.

---

## §3. Current consumer surface

**Total consumers:** 89 imports across `src/app/`.

**Three distinct relative-path patterns observed:**

| Pattern | Where it occurs | Approx count |
|---|---|---|
| `from "./utils"` | inside `src/app/components/ui/` (siblings) | ~50 |
| `from "../ui/utils"` | one level up (e.g. `components/maps/`, `components/landing/`) | ~25 |
| `from "../../ui/utils"` | two levels up (e.g. `components/maps/command-center/`, `components/maps/navigation/`) | ~14 |

**Path-alias availability:** `@/` is already mapped to `./src/` in both [`tsconfig.json`](../tsconfig.json) (`"paths": { "@/*": ["./src/*"] }`) and [`vite.config.ts`](../vite.config.ts) (`alias: { "@": path.resolve(__dirname, "./src") }`). So `@/app/components/ui/utils` works today as a stable absolute import.

**Implication:** the codebase ALREADY has the alias infrastructure to support a stable cn import path. Extraction does not require introducing a new alias.

---

## §4. Four extraction shapes

Each option implies a different answer to the Pass 295 §7 unblocker decisions:

### Option α — `src/platform-core/cn.ts` (creates platform-core folder)

**Shape:** new top-level folder `src/platform-core/`. cn lives at `src/platform-core/cn.ts`. Imports become `from "@/platform-core/cn"`.

**Owner-decision implications:**
- **Pass 295 §7 #1** (PLAN_PLATFORM_BOOTSTRAP_PREP §3.3 package boundary): answers as "in-repo folder boundary, not npm package."
- **Pass 295 §7 #3** (PLAN_PLATFORM_BOOTSTRAP_PREP §6.6 workspace tooling): answers as "single-repo path-aliased imports, not pnpm + Turborepo."

**Pros:**
- Establishes the `platform-core/` folder as the future platform surface (visible decision)
- Uses existing `@/` alias — no new alias needed
- Eslint can enforce import direction via `no-restricted-imports` against `platform-core` importing from `bidondent-app/`

**Cons:**
- Commits to an in-repo folder structure that may not match a future monorepo layout
- If owner later prefers monorepo (option δ), this becomes a migration burden

### Option β — `src/platform/utils/cn.ts` (deeper nesting)

**Shape:** `src/platform/utils/cn.ts`. Imports become `from "@/platform/utils/cn"`.

**Pros:**
- Mirrors the eventual npm package structure (`@platform/utils`) without committing to monorepo
- Allows future grouping of related utilities under `platform/utils/`

**Cons:**
- Deeper paths
- The "utils" subfolder invites future utility-soup
- The relay #21 explicit prohibition: *"avoid mega shared folders"* — `utils/` risks becoming exactly that

### Option γ — Alias-only (file stays put)

**Shape:** file stays at `src/app/components/ui/utils.ts`. Add a NEW alias `@platform/cn` in tsconfig + vite that resolves to the same path. New imports use `@platform/cn`; old imports stay relative.

**Pros:**
- Zero file movement; near-zero risk
- Tests the alias mechanism in isolation
- Easy to evolve later (when the file actually moves, only the alias needs updating)

**Cons:**
- Doesn't prove the FOLDER mechanism (the relay's "folder-boundary friction" observation can't be made)
- Two paths for the same file is a confusing intermediate state
- Stacey's site cannot use this aliased path unless she has the same alias config — defeats the seam-proving purpose

### Option δ — Monorepo `packages/platform-core/src/cn.ts`

**Shape:** convert the project to a pnpm + Turborepo monorepo. cn lives at `packages/platform-core/src/cn.ts`. App imports become `from "@bidondent/platform-core"` (or chosen scope).

**Owner-decision implications:**
- Resolves Pass 295 §7 #1 + #3 unblockers in the heaviest direction
- Commits to monorepo philosophy + workspace tooling

**Pros:**
- Most realistic future shape if the platform actually ships as packages
- Tests publish-time semantics + workspace dependency hoisting

**Cons:**
- HEAVY. Converts the entire repo's tooling.
- Per relay #19 explicit prohibition: *"avoid premature package systems"* + *"do NOT create giant platform-core folders"*
- Destroys the "small, mechanically obvious, near-zero doctrine load, easy to reverse" criteria the relay set for the FIRST extraction.

---

## §5. Recommended option (contingent on owner unblockers)

**Recommendation:** **Option α** (`src/platform-core/cn.ts`) — IF owner answers Pass 295 §7 #1 as "in-repo folder boundary."

**Rationale:**
- Aligns with relay #19/#20/#21 explicit guidance to AVOID monorepo prematurely.
- Uses existing `@/` alias — no infrastructure change.
- Establishes the `platform-core/` folder visibly without committing to publish-time semantics.
- Reversible: revert is `git revert` of one commit + 89 import-path changes.
- Enables import-direction lint rule via `no-restricted-imports` (Priority B exploration).
- Stacey's future site can copy the file or import via the same alias if shared via path-mapping later.

**If owner picks differently:**
- Option β (deeper nesting) — discouraged per relay #21's "avoid mega shared folders."
- Option γ (alias-only) — discouraged because it doesn't prove the folder mechanism the relay actually wants tested.
- Option δ (monorepo) — explicitly contradicts relay #19/#20/#21 prohibitions and Pass 295 §7 should be re-opened first.

---

## §6. Mechanical execution checklist (when authorized)

Single commit recommended; entirely revertible.

1. **Create new folder + file:**
   - `mkdir src/platform-core`
   - Move `src/app/components/ui/utils.ts` → `src/platform-core/cn.ts`
   - Use `git mv` to preserve history.

2. **Rewrite 89 imports:**
   - Use a codemod / sed across `src/`:
     ```
     find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
       -e 's|from "\./utils"|from "@/platform-core/cn"|g' \
       -e 's|from "\.\./ui/utils"|from "@/platform-core/cn"|g' \
       -e 's|from "\.\./\.\./ui/utils"|from "@/platform-core/cn"|g'
     ```
   - **Caution:** `from "./utils"` may also exist OUTSIDE `components/ui/` for unrelated `utils.ts` files. Verify scope: limit the sed to ONLY `src/app/components/ui/*.tsx` for the `./utils` pattern.
   - Verify with grep that all 89 sites now resolve to `@/platform-core/cn`.

3. **Verify the old `utils.ts` location has no remaining content needed by other files:**
   - `utils.ts` had ONLY the `cn` export. Confirmed via §2.
   - The file should be entirely deleted by `git mv` (not just contents removed).

4. **TypeScript verification:**
   - `npx tsc --noEmit` should pass.
   - The `@/platform-core/cn` import resolves via the existing tsconfig `@/*` alias.

5. **Vite/build verification:**
   - `pnpm build` (or equivalent) should pass.
   - Dev server `pnpm dev` should hot-reload cleanly.

6. **Test verification:**
   - `pnpm test` should pass.

7. **Commit message format:**
   ```
   refactor(platform): Pass 299 — first micro-extraction (cn → platform-core)

   Owner-authorized first seam-proving extraction per relay #21
   Phase C Priority A. Moves cn utility from
   src/app/components/ui/utils.ts to src/platform-core/cn.ts;
   rewrites 89 imports to @/platform-core/cn.

   Verifies that the platform-core/ folder mechanism works without
   tooling changes (uses existing @/ alias).

   Pressure points observed: ...
   ```

---

## §7. Pressure points to observe (per relay #21)

When extraction is executed, these observations are the actual product:

### 7.1 Import pressure

- 89 import sites updated mechanically. Codemod success/failure rate.
- Any sites missed by sed (e.g. dynamic imports, comment references)?
- Any sites that BREAK after the move (e.g. depended on side effect from being in `components/ui/`)?

**Expected:** clean. cn has zero side effects. All updates should be mechanical.

### 7.2 Alias pressure

- Does `@/platform-core/cn` resolve in BOTH tsconfig AND vite? (Both use the `@/` alias.)
- Does it resolve in test runner config? Check `vitest.config.ts` if separate.
- Does the IDE auto-import the new path?

**Expected:** clean. Existing `@/` alias does the work.

### 7.3 Lint pressure

- Does ESLint accept the new path?
- Is `no-restricted-imports` configured? If so, does it flag `platform-core` importing from `app/`?
- Add a new lint rule: `platform-core/**` may NOT import from `app/**`. This is the seam-enforcement test.

**Expected:** lint config may need a new rule for direction enforcement. This is doctrine-shaping work.

### 7.4 Folder-boundary friction

- Does `platform-core/` feel like a coherent folder, or arbitrary?
- After this extraction, is there a temptation to add MORE files to `platform-core/`? (Resist — per relay #21 "avoid mega shared folders.")
- Does the folder name signal its purpose to a new reader?

**Expected:** for cn alone, the folder feels sparse. That's correct. Future additions earn their place via the duplication-triggered or designed-for-extraction trigger only.

### 7.5 Ownership visibility

- Is it obvious to a reader that `cn` in `platform-core/` is "platform-tier, not app-tier"?
- Does the new path make Stacey-portability obvious (she can import from `@/platform-core/cn` if her site lives in the same repo, or `@stacey/platform-core/cn` if extracted)?
- Is there a need for a `platform-core/README.md` documenting the criteria for what belongs here?

**Expected:** the folder name carries meaning. A short README listing "criteria for inclusion" (per Pass 295 A-pure definition) would help.

---

## §8. Reversibility plan

**Single-commit revert is the recovery path:**

```
git revert <commit-sha>
```

Reverts:
- `git mv` undoes the file move
- 89 import-path changes are reverted in the same commit
- TypeScript / build / tests return to pre-extraction state

**No persistent state changes:** no migrations, no schema, no localStorage keys, no API contracts.

**Recovery time:** seconds.

This reversibility is exactly why cn is the right first candidate.

---

## §9. Connection to relay #21

| Relay #21 directive | This pass addresses |
|---|---|
| "Prepare the FIRST micro-extraction candidate" | §1-§6 — full preparation spec |
| "tiny blast radius" | §2 — 5-line file, no side effects |
| "structurally universal" | §2 — pure shadcn pattern |
| "no continuity semantics / no authority ownership / no orchestration load" | §2 — confirmed via Pass 296 §3.1 7-question audit |
| "extraction success/failure is immediately visible" | §6 — TypeScript + build + tests as immediate verification |
| "observe import / alias / lint / folder-boundary / ownership pressure" | §7 — explicit observation framework |
| "treat it as a seam survivability experiment" | §1 — preparation framing |
| "Avoid mega shared folders" | §4 Option β rejection + §5 Option α justification |
| "Avoid premature package systems" | §4 Option δ rejection |

**Compliance:** full.

---

## §10. Connection to existing planning corpus

### 10.1 Activates Pass 295 §7 unblocker #1

Pass 295 §7 named PLAN_PLATFORM_BOOTSTRAP_PREP §3.3 (package boundary granularity) as the immediate bootstrap blocker. Pass 298 §4 makes this concrete: the cn extraction's option choice IS the package-boundary decision. Owner answer to §3.3 = owner authorization to execute Option α (or another).

### 10.2 Defers Pass 295 §7 unblocker #3

Pass 295 §7 §6.6 (workspace tooling — pnpm + Turborepo vs single-repo aliases) is implicitly answered by Option α as "single-repo path-aliased imports." Owner can defer the formal answer until the SECOND or THIRD extraction (when the in-repo folder approach is either confirmed or rejected by experience).

### 10.3 Validates extraction-trigger taxonomy (Pass 297 §5)

cn is the canonical "designed-for-extraction" trigger candidate. Pass 298 demonstrates how the taxonomy translates into actionable spec. Future extractions in other taxonomy categories (cosmetic-debranding, module-shaped, etc.) will require different spec shapes — cn's spec is NOT a template, only an instance.

### 10.4 Does NOT address Pass 295 §7 unblocker #2

PLAN_PLATFORM_BOOTSTRAP_PREP §4.5 (token architecture 3-tier) is unaffected by the cn extraction. Theme-system extraction is gated separately.

---

## §11. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 / #21 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| LAW_* / MOLANDJESUS / PLAN_PLATFORM_* | UNTOUCHED |
| `cn` source file | UNTOUCHED (preparation only) |

ZERO new owner-decision points (cumulative remains 31). The owner-decision needed to execute the spec (Pass 295 §7 #1 + #3) ALREADY EXISTS in the cumulative count.

---

## §12. What this pass does NOT do

- No file movement (preparation only)
- No import rewrites
- No alias addition
- No tsconfig / vite.config changes
- No new test files
- No source modification
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No bootstrap of any new repo
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §13. Forward triggers

1. **Owner answers Pass 295 §7 unblocker #1 (PLAN_PLATFORM_BOOTSTRAP_PREP §3.3) as "in-repo folder boundary"** → Pass 299 = AUTHORIZED execution of Option α per §6 mechanical checklist.
2. **Owner answers differently** → Pass 299 = revised execution spec for the chosen option.
3. **Owner defers** → Pass 299 = continue Priority C (provider-pattern doctrine REF) and Priority D (PMS / performance-tracking deep-dive). Both are pure-doc work that does not require unblocker answers.
4. **Pass 300+** continues per relay #21 priorities.

---

## §14. Status

REF spec doc shipped Pass 298. Audit + spec only — no extraction. Ready for owner ratification of execution shape. The cn extraction is the smallest possible test of the seam mechanism; the mechanics are documented; reversibility is single-commit; pressure points are explicit. Owner authorization unblocks Pass 299 execution.

**End of doc.**
