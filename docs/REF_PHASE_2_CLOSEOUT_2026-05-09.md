---
status: CANONICAL
authority: REFERENCE
scope: phase-2-motion-conformance-and-engine-3-contract-closeout
canonical_source_of_truth: REF_PHASE_2_CLOSEOUT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Phase 2 ("Motion conformance + Engine 3 contract") closeout. Captures what the four Phase 2 passes (236/237/238/239) delivered, the KI movements they produced (KI-191 RESOLVED, KI-193/194/195 NEW), the explicit owner-mandated STOP gate before any Phase 3 / Engine 2 / Engine 3 migration work begins, and the Phase 3 dispatch options for owner ratification.
last_updated: 2026-05-09
---

# Phase 2 — Closeout + Phase 3 Dispatch Options (2026-05-09)

> Phase 2 / final pass. **STOP gate.** No Engine 3 migration sub-pass
> A/B/C, no Engine 2 work, no Host A/B modification, no operational
> runtime semantics change, no persistence change, no reroute
> lifecycle change, no continuity guarantee change executes after
> this without explicit owner authorization for the specific next
> pass.

---

## §1. Phase 2 mission recap

Owner-stated mission (verbatim from the Phase 2 authorization):

> **Phase 2 authorization granted. Resume full autopilot execution
> under the existing governance model.** Approved sequence:
> Pass 236 → 237 → 238 → 239 → 240 → STOP. Constraints:
> characterization-first, test-first, no Engine 2 work, no Host
> A/B merger, no operational runtime rewrites, no hidden authority
> introduction, no reduced-motion weakening.

Doctrine carried into every pass:

- **Characterize before normalize.**
- **Lock invariants before behavior rewrites.**
- **Runtime truth over implementation symmetry.**
- **Minimum conceptual fragmentation, not minimum file count.**
- **"Preview owns no camera" remains authoritative for Engine 3.**
- **Every pass requires the full 10-point convergence metadata
  block in its commit message.**

Phase 2 did not change runtime semantics. It did not change camera
authority. It did not change persistence. It did not modify any
production code path. Every test added is characterization;
every doc added is reference; every KI filed is for a pre-existing
surface.

---

## §2. What the four Phase 2 passes delivered

| Pass | Surface                                                 | Commit     | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | What did not change                                                                                |
| ---- | ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 236  | Engine 3 motion topology                                | `d60beef1` | NEW `MapLibreDashboardMapPreview.motion.test.tsx` (~280 lines, 9 tests). §1 source-level (no useMap, no flyTo/easeTo/jumpTo/panTo/zoomTo/fitBounds/panBy/zoomBy/rotateTo, no `from "maplibre-gl"`). §2 controlled viewState (caller echo + onMove + prop-change snap). §3 reduced-motion trivial-by-absence. §4 tooltip motion-reduce + single animate-in usage.                                                                                                                                       | Engine 3 source code unchanged. No production behavior change.                                     |
| 237  | Engine 3 camera authority audit + migration prep        | `32d8f741` | NEW `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` (~280 lines). 5-source authority chain inventory; identifies `fittedView` memo as the single hidden-authority point (KI-181); designs additive `autoFit: 'always' \| 'when-no-caller-bounds' \| 'never'` prop migration in three STOP-gated sub-passes. Adds 1 characterization test for dynamic auto-fit recomputation (NY→LA shops swap), pinning the dynamic half of KI-181 (Pass 231g pinned the mount-time half).                          | Engine 3 source code unchanged. Migration design staged but NOT executed.                          |
| 238  | Reduced-motion contract CI promotion                    | `0748a3ed` | NEW `src/app/__tests__/reducedMotionContract.test.ts`: (a) spawns existing `audit-reduced-motion.mjs` and asserts exit 0 (CSS-keyframe half) — promotes Pass 71 audit from manual to vitest-integrated; (b) walks `src/app/**/*.tsx` and asserts every Tailwind `animate-in`/`animate-out` is paired with `motion-reduce:` within ±5 lines (JSX half). KI-191 RESOLVED. NEW KI-193 filed for the 12 vendored shadcn/ui primitives that lack `motion-reduce:` partners (excluded as characterized gap). | No production behavior change. Existing Engine 3 tooltip + 50+ BidOnDent surfaces already conform. |
| 239  | Hidden-authority evidence inventory + KI reconciliation | `b263e6d9` | NEW `docs/REF_HIDDEN_AUTHORITY_EVIDENCE_2026-05-09.md`. Per-engine audit: Engine 1 = ✅ no hidden authority at canvas (delegates to controllers covered by Pass 231i); Engine 2 = 3 surfaces (KI-180 + NEW KI-194 tile-mode triple authority + NEW KI-195 guidance-mode auto-clear); Engine 3 = 1 surface (KI-181, fully covered by Pass 237). Cross-cutting: KI-045, KI-186 cross-referenced. Tier B preview consumers ✅ all 6 forward props declaratively.                                          | No production code touched. Engine 2 surfaces catalogued but NOT remediated.                       |

Total surfaces audited: **3 engines + 6 Tier B consumers + 2 cross-cutting subsystems.**
Total tests added: **10** (9 from Pass 236 + 1 from Pass 237). All run as part of `npm test`.
Total docs added: **3 canonical REF docs.**
Total KI movements: **+3 OPEN (KI-193, 194, 195), +1 RESOLVED (KI-191).**

---

## §3. KI inventory delta

| KI                                                         | Before Phase 2                      | After Phase 2                                                   | Pass that moved it        |
| ---------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------- | ------------------------- |
| KI-180 (Engine 2 imperative flyTo bypasses reduced-motion) | OPEN                                | OPEN — characterized in §2.2 of evidence inventory              | Pass 239 (cross-ref only) |
| KI-181 (Engine 3 fittedView silent override)               | OPEN, mount-time half pinned (231g) | OPEN, BOTH halves pinned (mount + dynamic). Migration designed. | Pass 237                  |
| KI-186 (GPS dual-instantiation risk)                       | OPEN, latent                        | OPEN, latent — cross-referenced                                 | Pass 239 (cross-ref only) |
| KI-191 (reduced-motion contract not CI-enforced)           | OPEN                                | **RESOLVED**                                                    | Pass 238                  |
| KI-193 (shadcn/ui primitives lack motion-reduce: opt-out)  | —                                   | **NEW, OPEN**                                                   | Pass 238                  |
| KI-194 (Engine 2 tile-mode triple authority)               | —                                   | **NEW, OPEN**                                                   | Pass 239                  |
| KI-195 (Engine 2 guidance-mode auto-clears popups)         | —                                   | **NEW, OPEN**                                                   | Pass 239                  |

Net: +3 OPEN, +1 RESOLVED. The +3 OPEN are characterizations of
pre-existing surfaces, not regressions.

---

## §4. The 10-point convergence metadata convention (still architectural law)

Every Phase 2 commit carried the full 10-point metadata block in
its commit message body. The convention from Phase 1 ratification
is preserved:

```
 1. Runtime paths touched
 2. Runtime classes touched
 3. Tier semantics touched
 4. Motion classes touched
 5. Shell hierarchy impact
 6. Authority semantics
 7. Reduced-motion inheritance
 8. Hidden-authority risk
 9. Continuity guarantees
10. Rollback semantics
```

Any pass that omits this block is **governance-incomplete** and
must not be merged.

---

## §5. Validation summary across Phase 2

- `npx vitest run` (full suite): **836/836 pass** across 81 files
  (~7-8s end-to-end). Includes:
  - Pass 236's 9 Engine 3 motion tests.
  - Pass 237's 1 Engine 3 dynamic auto-fit recomputation test.
  - Pass 238's 2 reduced-motion contract tests.
  - Pre-existing 824 tests, all green.
- `npm run build`: success after every pass.
- `npx cspell lint` on every touched doc: PASS.
- Hard-stop list: **0 violations.** ShopMapWidget.tsx remained
  owner-dirty throughout Phase 2 and was never touched.

---

## §6. Hard stops still binding (carry forward)

These remain in force regardless of which Phase 3 option owner
chooses:

- ❌ ShopMapWidget.tsx (owner-dirty since Pass 234 commit).
- ❌ CLAUDE.md, docs/LAW_PROJECT_RULES.md, docs/PLAN_AUDIT_DEEP_2026-05-07.md, docs/PLAN_MAP_UNIFICATION_2026-05-08.md, docs/REF_AI_COLLABORATION_PROTOCOL.md, docs/REF_BLOCK_C_DISPATCH_PACKET_2026-05-09.md, docs/REF_BLOCK_D_CLOSEOUT_2026-05-09.md, docs/REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md, docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md, docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md (owner-dirty docs).
- ❌ src/app/features/navigation/computeNavigationMetrics.test.ts, src/app/utils/edgeErrorMessage.test.ts, src/app/utils/formatVehicleLabel.test.ts (owner-dirty tests).
- ❌ src/app/test-utils/mapTestHarness.ts (became owner-dirty during Phase 2; do NOT touch).
- ❌ Untracked: docs/COWORK_GLOBAL_INSTRUCTIONS.md, src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx (per Pass 231g — owner concurrent edit space).
- ❌ `git add -A` ever. Always stage specific files only.
- ❌ `git push` (any). Branch must accumulate locally only.

Forbidden categories that remain binding:

- Host A/B merger.
- Engine 2 convergence or authority migration (KI-180 fix, KI-194 fix, KI-195 fix all blocked).
- Engine 3 `autoFit` migration sub-pass A/B/C (designed in Pass 237 but blocked behind explicit owner authorization).
- Operational runtime semantic rewrites.
- Cross-runtime orchestration collapse.
- Single-engine unification.
- Hidden authority introduction.
- Reduced-motion weakening.
- Persistence expansion.
- Reroute lifecycle change.
- Continuity guarantee change.

---

## §7. Phase 3 dispatch options (for owner ratification)

Phase 2 produced four candidate next-phase options. None execute
without explicit owner authorization.

### §7.1 Option A — Engine 3 declarative migration (sub-pass A only)

Per [`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) §5.

- Add `autoFit?: 'always' | 'when-no-caller-bounds' | 'never'` prop.
- Default `'always'` (zero call-site churn — current behavior preserved).
- Add 4 new test branches (per §6.2 of the camera-authority doc).
- Sub-pass B (explicit call-site declarations) and sub-pass C (default flip) remain STOP-gated separately.

**Risk:** low. Default preserves behavior. Reversible by deleting one prop.
**Unlocks:** KI-181 path-to-RESOLVED.
**Excluded scope:** Engines 1 + 2 untouched.

### §7.2 Option B — KI-193 shadcn primitives sweep

Per KI-193 entry in [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md).

- Add `motion-reduce:animate-none` (and equivalent neutralizers) to the 12 vendored shadcn primitives.
- Remove `src/app/components/ui` from `EXCLUDED_DIRS` in the Pass 238 audit so the audit covers the primitives going forward.
- Behavior change: respects `prefers-reduced-motion: reduce` for menus, dialogs, popovers, tooltips, sheets, etc.

**Risk:** low. Each primitive change is local. Visual diff under non-reduce-motion = zero.
**Unlocks:** KI-193 path-to-RESOLVED + closes a LAW_ANIMATION_AND_ATMOSPHERE §3 conformance gap across the entire shadcn surface.
**Excluded scope:** no map work, no Engine 2/3 work.

### §7.3 Option C — Engine 1 controllers deeper audit

Pass 231i added the reduced-motion topology baseline. Deeper audit
would enumerate camera-authority surfaces inside the three
controllers (`MapLibreViewportController`,
`MapLibreFollowLocationController`, `MapLibreArrivalCameraEffect`)
to mirror what Pass 237 did for Engine 3.

**Risk:** low (audit-only).
**Unlocks:** Engine 1 declarative-migration design (analogous to Engine 3's `autoFit`).
**Excluded scope:** Engine 2 still blocked.

### §7.4 Option D — Continued audit-only sweep

Continue characterization across remaining map-adjacent surfaces
(navigation hosts, search/discovery layers, route preview cards)
to reach 100% inventory coverage before any behavior-change phase.

**Risk:** zero (audit-only).
**Unlocks:** complete pre-migration map of authority surfaces.
**Excluded scope:** all behavior change.

---

## §8. Phase 2 STOP gate

Pass 240 ratifies that Phase 2 is **complete**. The next pass does
NOT execute under the Phase 2 authorization. Owner must:

1. Choose one of the four Phase 3 options above (or a different
   shape).
2. Explicitly authorize the chosen sub-scope by name.
3. Confirm carry-forward of the hard-stops listed in §6.
4. Confirm the 10-point convergence metadata convention remains
   architectural law for Phase 3.

Until that authorization arrives, no further work executes.

---

## §9. End of Phase 2

Phase 2 ships:

- 4 commits (`d60beef1`, `32d8f741`, `0748a3ed`, `b263e6d9`).
- 1 new test file (`reducedMotionContract.test.ts`).
- 1 extended test file (`MapLibreDashboardMapPreview.motion.test.tsx`).
- 3 new canonical REF docs (Engine 3 camera authority audit + Hidden-authority evidence inventory + this Phase 2 closeout).
- 1 KI RESOLVED (KI-191), 3 KIs filed (KI-193, KI-194, KI-195).
- 0 production behavior changes.
- 0 hard-stop violations.

**STOP. Awaiting owner authorization for Phase 3.**
