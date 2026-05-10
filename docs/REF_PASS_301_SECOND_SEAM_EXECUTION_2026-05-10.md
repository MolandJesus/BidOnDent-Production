# REF — Second Live Seam Execution: useOnlineStatus → platform-core (Pass 301, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #24 (Phase F Priority A: execute second extraction; useOnlineStatus authorized as the only candidate that survived BOTH the 7-question audit and the 4 anti-extraction lenses).
**Tier:** REF (execution evidence + comparative-pressure observations).
**Source modification:** YES — single extraction following Pass 299 template. Fully reversible via git revert.
**Companion to:** [`REF_PASS_299`](REF_PASS_299_FIRST_SEAM_EXECUTION_2026-05-10.md) (the template), [`REF_PASS_300`](REF_PASS_300_PLATFORM_CORE_PRESSURE_AUDIT_2026-05-10.md) (the anti-extraction discipline that filtered out other candidates).

---

## §1. Premise — relay #24 Phase F

Relay #24 explicitly authorized: *"You are therefore authorized to proceed ONLY with: useOnlineStatus as the second live seam execution. Reason: it survived BOTH frameworks — the original 7-question extraction audit AND the new 4 anti-extraction lenses."*

The mission framing (per relay #24): *"can seams remain disciplined AFTER success creates appetite for centralization?"*

This pass tests that question. The hard tests are:
- Did the platform-core/ folder remain shallow (no subfolders)?
- Did the README continue to resist sprawl?
- Did the cn-extraction template apply mechanically without modification?
- Did extraction appetite increase (psychological observation)?
- Did any new candidate types pull along this extraction (folder gravity)?

---

## §2. Mechanical execution log

Followed the Pass 299 template exactly:

| Step | Action | Result |
|---|---|---|
| 1 | `git mv src/app/hooks/useOnlineStatus.ts src/platform-core/useOnlineStatus.ts` | History-preserving move |
| 2 | `sed` replace `from "./hooks/useOnlineStatus"` → `from "@/platform-core/useOnlineStatus"` (single site: App.tsx:31) | 1 site updated |
| 3 | Update `src/platform-core/README.md` "Current contents" section | useOnlineStatus entry appended |
| 4 | `npx tsc --noEmit` | 4 pre-existing errors unchanged from Pass 299; ZERO new errors |
| 5 | `npx vite build` | ✅ clean |
| 6 | `npx vitest run` | ✅ 997/997 across 100 test files |

**Total elapsed time:** under 1 minute for the mechanical work — even faster than Pass 299 because the consumer surface was 1 instead of 89.

---

## §3. Comparative metrics — Pass 299 vs Pass 301

| Metric | Pass 299 (cn) | Pass 301 (useOnlineStatus) |
|---|---|---|
| File LOC | 5 | 21 |
| Consumers (import sites) | 89 | 1 |
| Distinct relative-path patterns | 3 | 1 |
| Files added to platform-core | 1 + README | 1 (README updated) |
| Mechanical commit time | <2 min | <1 min |
| Tests pass | 997/997 | 997/997 |
| Build time | 3.65s | similar |
| New aliases needed | 0 | 0 |
| New tooling config | 0 | 0 |
| New tests | 0 | 0 |
| Reversibility | single commit revert | single commit revert |

**Headline:** Pass 301 was even cleaner than Pass 299. The single consumer made the migration trivially mechanical. The cn-extraction template applied without modification.

---

## §4. Topology-pressure observations (comparative)

Each Pass 299 §4 question, re-asked post-Pass-301:

### 4.1 Did the seam remain psychologically lightweight?

**YES — and the lightness is now reinforced.** platform-core/ contains 3 entries: `cn.ts`, `useOnlineStatus.ts`, `README.md`. The folder still reads in under 30 seconds. Adding the second file did NOT trigger a temptation to add subfolders (no `hooks/`, no `utils/`).

The README's "Current contents" section now lists 2 items. This is the natural cap before pressure for grouping kicks in. **Pass 300 §7's heuristic predicts: at 3 same-category files, STOP.** Currently there is NO same-category pair (cn is a utility; useOnlineStatus is a hook). The next addition will be the test of the heuristic.

### 4.2 Did ownership visibility improve further?

**YES — modestly.** useOnlineStatus's old path was `src/app/hooks/useOnlineStatus.ts` — already gave a tier signal ("hook") but not a platform-vs-app signal. The new path `src/platform-core/useOnlineStatus.ts` declares "platform-tier" tier. The `hooks/` folder in `src/app/` will eventually need a documented relationship with `platform-core/` (which hooks belong where?) — this is a future doctrine clarification.

### 4.3 Did alias usage feel natural or forced?

**Natural — same answer as Pass 299.** The existing `@/*` alias absorbed the change. No tooling work. Same pattern works for the second extraction.

### 4.4 Did import-direction discipline remain intuitive?

**YES — and stronger.** App.tsx now has TWO `@/platform-core/...` imports (`@/platform-core/cn` was added by Pass 299's sweep; wait, Pass 299 only swept ui/utils paths — App.tsx didn't import cn directly). Actually App.tsx now has ONE `@/platform-core/...` import (useOnlineStatus). The discipline is consistent: any platform-core consumer uses the absolute alias.

### 4.5 Did the topology remain shallow?

**YES.** platform-core/ is still 1-level deep. No barrel index.ts. No subfolders. Two files + README. This is exactly the shape Pass 300 §7 demanded.

### 4.6 Did extraction appetite increase?

**MEASURABLE BUT RESISTED.** During this pass, the natural temptation would be to also extract `useServiceWorkerUpdate` (it lives next to useOnlineStatus in `src/app/hooks/`) "while we're here." Per Pass 300 §4.3, useServiceWorkerUpdate is owner-decision + Stacey-need-blocked. Resisted.

The temptation also surfaced for Sentry init (Pass 296 §3.3 said it was A-PURE; Pass 300 reclassified). Resisted per Pass 300 §3 reclassification.

**This is the behavior relay #24 explicitly tested for.** The pattern held: single-purpose pass, single seam, single commit. The relay's success criterion ("can seams remain disciplined AFTER success creates appetite") is satisfied.

### 4.7 Did helper gravity appear?

**NO.** No new helper. No `index.ts` barrel. No `utils/` subfolder. No "shared" anything.

### 4.8 Did any unexpected hidden coupling surface?

**NO.** useOnlineStatus has zero internal dependencies and no side effects (just `useEffect` + `navigator.onLine` + window event listeners). The single consumer (App.tsx) treats `isOnline` as a pure boolean. Zero coupling to extract along with it.

---

## §5. Validation of the cn-extraction template

Pass 299 §6.1 noted: *"The cn-extraction template — future A-pure or A-cosmetic extractions can follow the same shape."* Pass 301 confirms:

- Template applied mechanically without modification
- Existing `@/` alias sufficient
- Single-commit reversibility preserved
- No new tooling needed
- Build + test gates pass

**The template is now validated for at least 2 distinct candidates** (utility, hook). It generalizes; the platform-core seam mechanism is repeatable.

---

## §6. Validation of Pass 300 anti-extraction discipline

Pass 300 §5 nominated useOnlineStatus as 1 of 3 safe candidates. Pass 301 executed exactly that nomination. The other 2 nominees (Provider seam pattern, LAW_LAYERED_ARCHITECTURE) remain awaiting separate authorization.

**No drift occurred.** The pass executed ONLY what was authorized. Pass 300's "DO NOT EXTRACT YET" registry filtered out: shadcn primitives, theme system, motion system, ImageWithFallback, ScreenErrorBoundary, Notifications, validate-app-config, Sentry init, useServiceWorkerUpdate, perfMarks, useHashPage. ALL eleven held.

This is the architectural-experiment evidence that anti-extraction discipline works post-success. Per relay #24: *"This is now topology psychology analysis."* The psychology held.

---

## §7. New observations specific to Pass 301

### 7.1 The "cousin file" pull

useOnlineStatus and useServiceWorkerUpdate live next to each other in `src/app/hooks/`. Touching one creates psychological pull to touch the other ("I'm already here"). Pass 300 §4.3 blocked it (useServiceWorkerUpdate is vite-plugin-pwa coupled).

This is a generalizable observation: **co-located file siblings create extraction gravity.** Future passes should explicitly name and resist this pull when extracting from a folder with multiple A-pure-looking files.

### 7.2 Single-consumer extractions are the cleanest

Pass 299 had 89 consumers; Pass 301 had 1. The risk profile is qualitatively different:
- 89 consumers → sed-rewrite is mechanical but introduces 89 line-touches
- 1 consumer → trivial

Future extractions with single consumers are the SAFEST candidates. Most candidates with N consumers > 10 should additionally apply Pass 300 §2.3 folder-gravity lens because high-consumer-count often correlates with category-density (same-category sibling files in the source folder).

### 7.3 The hook+utility natural pairing

platform-core/ now contains a hook (useOnlineStatus) + a utility (cn). These are the two MOST natural top-level categories. Adding a third TYPE category (e.g. a CSS file, a TypeScript type, a constant) would still feel natural at depth 1. Adding a SECOND hook or SECOND utility would trigger Pass 300 §7's "3rd same-category file" heuristic.

**Implication:** the platform-core/ growth pattern should diversify by category rather than densify within category. If 4 hooks accumulate, they should NOT subfolder into `platform-core/hooks/` (relay #21 prohibition). Instead, the platform should question whether 4 hooks really belong at platform-tier OR split the platform itself into peer modules.

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| 4-layer provider mount order (#1) | UNTOUCHED |
| AppWithToast subcomponent boundary (#2) | UNTOUCHED — App.tsx mount structure unchanged; only an import line moved |
| First-import-line resize-patch (#3) | UNTOUCHED |
| Light-vs-dark contrast LAW palette (#4) | UNTOUCHED |
| Reduced-motion guards (#5) | UNTOUCHED |
| Two intentional `:root` blocks (#6) | UNTOUCHED |
| Pass 282 cadence/easing tokenization (#7) | UNTOUCHED |
| Pass 283 blur tokenization (#8) | UNTOUCHED |
| Pass 286 Clerk wrapper inflation (#9) | UNTOUCHED |
| Pass 287 provider-mount-order test (#10) | PASSES |
| Pass 288 persistence-namespace test (#11) | PASSES |
| Pass 289-300 audit observations (#12+) | UNTOUCHED (extended) |
| Pass 299 cn extraction (#13) | UNTOUCHED |

Pass 281 §12 anti-patterns: ZERO violations.
Relay #15-#24 prohibitions: ZERO violations.

---

## §9. What this pass does NOT do

- No additional files extracted (single-extraction discipline preserved)
- No barrel `index.ts` added
- No `no-restricted-imports` lint rule added
- No tsconfig changes
- No vite.config changes
- No new test files
- No Pass 281 §11 invariant modification
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §10. Forward triggers

1. **Owner authorizes provider-pattern REF artifact** → Pass 302 = `REF_PROVIDER_SEAM_PATTERN.md` per relay #24 Priority B.
2. **Owner authorizes anti-sprawl REF artifact** → Pass 302 OR 303 = `REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE.md` per relay #24 Priority C.
3. **Owner authorizes PMS continuity organism investigation** → Pass 303+ Priority D (observation only; no extraction; no normalization).
4. **Owner authorizes Stacey portability reconnaissance** → Pass 303+ Priority E (lightweight only).
5. **Owner authorizes 3rd extraction** — STRONGLY DISCOURAGED in the immediate term per Pass 300 §6 (capability ≠ necessity). The platform-core/ folder is at the natural "hook + utility" cap; a 3rd extraction would test the folder-gravity heuristics. Acceptable candidates per Pass 300 §5 are limited to documentation artifacts (provider-pattern, LAW_LAYERED_ARCHITECTURE) — both of which are zero-source-change extractions.

---

## §11. Status

REF doc shipped Pass 301 alongside the actual extraction. The second live seam execution is complete and clean. The cn-extraction template generalized successfully. The Pass 300 anti-extraction discipline held under post-success appetite pressure. platform-core/ remains shallow (cn.ts + useOnlineStatus.ts + README.md). Phase F (survivability-under-time) is operationally underway — and the first behavioral test (resisting the cousin-file pull, resisting the sentry reclassification temptation, resisting the bulk-shadcn-extraction temptation) was passed.

**End of doc.**
