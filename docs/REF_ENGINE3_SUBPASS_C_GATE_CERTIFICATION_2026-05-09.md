---
status: CANONICAL
authority: REFERENCE
scope: engine-3-subpass-c-convergence-gate
canonical_source_of_truth: REF_ENGINE3_SUBPASS_C_GATE_CERTIFICATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: KI reconciliation + sub-pass C convergence gate certification. Audits the status of every KI ChatGPT named (KI-181, KI-187, KI-190, KI-191) plus the broader 180-196 set, and produces a safe-to-authorize-next matrix separating "safe to converge now" from "requires new owner architectural ruling." Doc-only; no production source touched.
last_updated: 2026-05-09
---

# Engine 3 Sub-Pass C Convergence Gate Certification (Pass 246, ≡ ChatGPT-relayed 232c)

> Convergence-preparation deliverable. **Doc-only — no production
> source touched, no KI status flipped**. Final pre-authorization
> audit for sub-pass C (Engine 3 autoFit default flip).
>
> **Sibling docs (the convergence-prep trilogy):**
>
> - [`REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md`](REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md) (Pass 244) — what each call site needs.
> - [`REF_ENGINE3_SUBPASS_C_SIMULATION_2026-05-09.md`](REF_ENGINE3_SUBPASS_C_SIMULATION_2026-05-09.md) (Pass 245) — what each test does at landing.
> - This doc (Pass 246) — what KIs and gates the owner is signing off on.
>
> **Constitutional bridge:** [`REF_MAP_CONVERGENCE_READINESS_2026-05-09.md`](REF_MAP_CONVERGENCE_READINESS_2026-05-09.md) (Pass 231k).
>
> **Authority tier:** REFERENCE. This doc records audit findings; it
> does NOT propose, execute, or authorize anything. Status flips on
> any KI are owner-gated and ship in a separate pass.

---

## §1. KI status reconciliation

KI numbering and severity match the committed state of
[`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) as of `dd724d4b`.

### §1.1 KIs ChatGPT named (KI-181 / KI-187 / KI-190 / KI-191)

| KI       | Severity                  | Filed at | Audit state                                                                                                                                                                                                                                                                | Recommended next state |
| -------- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| KI-181   | P2-HIDDEN-AUTHORITY       | Pass 229 | **PARTIALLY MITIGATED.** Pass 241 added explicit `autoFit` prop with default `"always"`. Pass 242+243 explicitized 13/14 production call sites (1 remains owner-dirty). The hidden-authority surface is closed at the *call-site explicitness* level. The hidden-authority *behavior* (silent fittedView override at site #1 ReportDetail) is still live until sub-pass C lands. | RESOLVED upon sub-pass C landing. Until then, OPEN with a reconciliation note: "explicitization complete; default-flip pending owner authorization." |
| KI-187   | P1-TEST-COVERAGE          | Pass 229 | **CHARACTERIZED across all 3 engines.** Engine 1 (Pass 193 — render + prop wiring + canvas frame composition). Engine 2 (Pass 231h — useMapPaneState lifecycle hook, including mapRenderNonce hard-remount + 12s timeout + handleMapLoad/handleMapLoadError). Engine 3 (Pass 231g + 236 + 241 — mount/unmount, per-instance id, gesture suppression, motion, autoFit branches). | RESOLVED. The "zero coverage" predicate the KI named no longer holds for any of the 3 engines. (Note: KI-187 specifically asked for mount/unmount + onLoad/onError. Engine 1's onLoad/onError gap is a SEPARATE issue tracked as KI-184; this does not block KI-187 closure.) |
| KI-190   | P2-INVARIANT-NOT-ENFORCED | Pass 229 | **RESOLVED at Pass 231j (`41bac732`).** Sentinel side-effect added to `maplibreResizePatch.ts`; assertion helper centralized in harness; invariant test runs against direct + transitive (Engine 3) import. KI text already references the helper-side surface. | RESOLVED — eligible for status flip in a follow-up KI reconciliation pass. |
| KI-191   | P2-INVARIANT-NOT-ENFORCED | Pass 229 | **RESOLVED at Pass 238 (`0748a3ed`).** Already marked RESOLVED in `REF_KNOWN_ISSUES.md` line 1377. Reduced-motion contract is now CI-enforced via the promoted `audit-reduced-motion.mjs` checks. | Already RESOLVED. No further action. |

**Net for ChatGPT-named set:** 1 PARTIALLY MITIGATED (KI-181, awaiting
sub-pass C), 1 CHARACTERIZED-and-eligible-for-RESOLVED (KI-187), 1
just-RESOLVED-at-231j (KI-190), 1 already-RESOLVED (KI-191).

### §1.2 Adjacent KIs surfaced in the convergence-prep trilogy

| KI       | Severity                  | Filed at | Audit state                                                                                                                                                                                  |
| -------- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KI-180   | P2-LAW-CONFORMANCE        | Pass 229 | **OPEN (Engine 2 imperative flyTo).** Pass 231i pinned the topology baseline. Fix requires Phase 3 authorization (Engine 2 lane). Out of scope for sub-pass C.                              |
| KI-182   | P1-MENTAL-MODEL           | Pass 229 | OPEN ("navigation" naming overload). Pass 231k documented the topology. Fix requires LAW §7-1 owner ruling.                                                                                  |
| KI-183   | P2-NAMING-COLLISION       | Pass 229 | OPEN. Out of sub-pass C scope.                                                                                                                                                                |
| KI-184   | P2-LIFECYCLE-GAP          | Pass 229 | OPEN (Engine 1 onLoad/onError missing). Test-side surface exists in harness; production fix is gated.                                                                                        |
| KI-185   | P3-COHESION               | Pass 229 | OPEN (pitch caps inconsistent across engines). Tied to LAW §7-2.                                                                                                                              |
| KI-186   | P3-LATENT                 | Pass 229 | OPEN (GPS dual-instantiation risk).                                                                                                                                                            |
| KI-188   | P1-TEST-COVERAGE          | Pass 229 | OPEN (Host A/B coverage). The single biggest gap remaining; out of sub-pass C scope.                                                                                                          |
| KI-189   | P2-TEST-COVERAGE          | Pass 229 | OPEN (surface-level coverage). Per Pass 244 §3, all 14 Engine 3 callers have at least invariant-level coverage via `engine3CallSiteAutoFitContract.test.ts` — partial mitigation but not closure. |
| KI-192   | P3-DOC-DRIFT              | Pass 229 | OPEN (PLAN_MAP_UNIFICATION §1.6 caller count). Trivial fix; deferred while PLAN doc is owner-dirty.                                                                                          |
| KI-193   | P2-LAW-CONFORMANCE        | Pass 238 | OPEN (shadcn/ui motion-reduce opt-out). Filed alongside Pass 238 KI-191 RESOLVED. Out of sub-pass C scope; tied to motion-reduce sweep authorization.                                       |
| KI-194   | P3-IMPLICIT-AUTHORITY     | Pass 239 | OPEN (Engine 2 tile-mode authority split). Out of sub-pass C scope (Engine 2).                                                                                                               |
| KI-195   | P3-IMPLICIT-STATE-MUTATION| Pass 239 | OPEN (Engine 2 guidance-mode popup auto-clear). Out of sub-pass C scope (Engine 2).                                                                                                          |
| KI-196   | P3-LATENT-RERENDER-LOOP   | Pass 243 | OPEN (Engine 3 `reportPins = []` default param). Defensive fix is behavior-preserving; eligible for sub-pass C bundling per `REF_ENGINE_3_CAMERA_AUTHORITY` §12.4. |

### §1.3 Reconciliation summary

| Bucket                                        | KIs                          | Count |
| --------------------------------------------- | ---------------------------- | ----- |
| RESOLVED (eligible for status flip)           | KI-187, KI-190               | 2     |
| Already RESOLVED (per file text)              | KI-191                       | 1     |
| PARTIALLY MITIGATED (awaiting sub-pass C)     | KI-181                       | 1     |
| OPEN — behavior-preserving fix bundleable      | KI-196                       | 1     |
| OPEN — Phase 3 / Engine 2 / Host gating       | KI-180, KI-184, KI-188, KI-194, KI-195 | 5 |
| OPEN — LAW §7 owner ruling required           | KI-182, KI-185               | 2     |
| OPEN — out of map scope or trivial doc fix    | KI-183, KI-186, KI-189, KI-192, KI-193 | 5 |

The convergence-prep trilogy (Passes 244/245/246) directly serves
KI-181 + KI-187 + KI-196. KI-190 + KI-191 are already RESOLVED. The
remaining KIs are out of sub-pass C scope.

---

## §2. Sub-pass C convergence gate checklist

Per `LAW_MAP_RENDERER_CONTRACT` §5.1 (required artifacts for any
convergence pass), each item below is either ✅ ready or ⏸ blocked.

| #   | Required artifact                               | Status                                                                                                                                         |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rollback plan                                    | ✅ READY — Pass 245 §5: 4-step plan, mechanically trivial, screenshot review for ReportDetail revert.                                          |
| 2   | Renderer-ownership diff                         | ✅ READY — Pass 245 §4: 2 files, ~3 token edits, no engine swap.                                                                                |
| 3   | Lifecycle before/after table                    | ✅ READY — Pass 244 §3 site-by-site: 12/14 no-op, 1 UX shift (#1 ReportDetail), 1 owner-dirty (#6 ShopMapWidget).                              |
| 4   | Affected-surfaces list                          | ✅ READY — Pass 244 §3 + §6.                                                                                                                    |
| 5   | Orchestration-authority diff                    | ✅ READY — none. Sub-pass C does not touch Host A or Host B.                                                                                    |
| 6   | Runtime-risk classification                     | ✅ READY — `low` (preview-to-preview behavior shift confined to Tier B; one site UX-visible).                                                   |
| 7   | Required test coverage                          | ✅ READY — Pass 245 §6 enumerates expected CI signals at landing (one INTENTIONAL FLIP, all else INVARIANT).                                    |

| #   | Required validation (LAW §5.2)                  | Status                                                                                                                                         |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Build passes                                    | ⏸ to be verified at landing.                                                                                                                   |
| V2  | Mount/unmount tests for affected surfaces       | ✅ READY — Pass 231g + Pass 241 motion tests already lock Engine 3 lifecycle.                                                                  |
| V3  | Visual diff (mobile + desktop)                  | ⏸ owner screenshot review for ReportDetail mini-map.                                                                                          |
| V4  | Reduced-motion contract verified                | ✅ READY — Pass 238 invariant + Pass 245 simulation §6 confirm sub-pass C does not touch motion semantics.                                    |
| V5  | Tier B → tap-to-expand affordance verified      | ✅ READY — Tier B classification unchanged at every site.                                                                                      |
| V6  | LAW §5.4 hard-stops not crossed                 | ✅ READY — sub-pass C does not change Tier classification, navigation runtime, camera authority model, or touch any owner-dirty file.        |

| #   | Pre-authorization blockers (per §12.4 of REF_ENGINE_3_CAMERA_AUTHORITY) | Status                                                                                                                                         |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | ShopMapWidget owner-dirty release                                       | ⏸ BLOCKED. Owner must release the file. Then a re-audit pass (call it "sub-pass B-completion") adds the `autoFit="always"` declaration.        |
| B2  | ReportDetail UX screenshot review                                       | ⏸ BLOCKED. Owner must approve the visible behavior shift (map stops reframing on bid arrival).                                                |
| B3  | KI-196 defensive `EMPTY_PINS` const hoist                               | ⏸ READY-TO-BUNDLE. Behavior-preserving fix; can ship with sub-pass C or as a precursor.                                                       |

**Net:** 7/7 LAW §5.1 artifacts READY. 4/6 §5.2 validations READY (2
deferred to landing). 1/3 §12.4 blockers READY-TO-BUNDLE. The
remaining 2 blockers (B1, B2) are owner-attention items.

---

## §3. Safe-to-authorize-next matrix (for owner review)

Maps every Phase-3-eligible work item to either "safe to converge now"
or "requires new owner architectural ruling." Sub-pass C scope is a
single row in this matrix.

### §3.1 Safe to converge now (no new architectural ruling required)

| Work item                                           | Authorization shape                                                                                                                                  | Pre-flight                            | Risk     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------- |
| **Sub-pass C** (Engine 3 default flip + #1 ReportDetail UX shift) | Owner approves (a) the visible UX change at ReportDetail (screenshot review) and (b) ShopMapWidget release.                                        | Passes 244 + 245 + 246 (this doc)     | low      |
| KI-196 defensive `EMPTY_PINS` const hoist            | Behavior-preserving; can ship as a precursor or with sub-pass C. Already named in `REF_ENGINE_3_CAMERA_AUTHORITY` §12.4. Owner pre-flight optional. | Existing motion test invariants       | very low |
| **ShopMapWidget release + audit** (sub-pass B completion) | Owner releases the dirty file; one builder pass adds `autoFit="always"` declaration; CI invariant allowlist exclusion gets removed in same commit. | Existing CI invariant test            | very low |
| KI-192 PLAN_MAP_UNIFICATION §1.6 caller-count fix    | Trivial doc edit. Currently deferred while PLAN_MAP_UNIFICATION is owner-dirty.                                                                       | None (read-only KI)                   | none     |

### §3.2 Requires new owner architectural ruling (LAW §7 or Phase-gate)

| Work item                                           | LAW §7 / governance question                                                                                                                                                                                  | Why blocked                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| KI-180 — Engine 2 reduced-motion gating              | Phase 3 / Engine 2 lane authorization                                                                                                                                                                          | Engine 2 imperative `flyTo` migration is in §7 of LAW (canonical camera authority model change risk).      |
| KI-182 — "Navigation" naming + Coverage tier        | LAW §7-1 (Coverage navigation Tier classification)                                                                                                                                                            | Owner has not chosen Tier A grow vs Tier B reclassification.                                                |
| KI-184 — Engine 1 onLoad/onError                     | Phase 3 authorization                                                                                                                                                                                         | Production runtime change (adds new event handlers); not characterization.                                  |
| KI-185 — Pitch caps unification                      | LAW §7-2 (pitch policy)                                                                                                                                                                                       | Owner-deferred. Each engine's pitch policy diverges; unification risks UX shift.                            |
| KI-186 — GPS dual-instantiation risk                 | Phase 3 / orchestration                                                                                                                                                                                        | Tied to host orchestration topology.                                                                        |
| KI-188 — Host A/B test coverage                      | Phase 3 / orchestration                                                                                                                                                                                        | Hook composition tests; the single largest test-coverage gap remaining.                                     |
| KI-193 — shadcn motion-reduce sweep                   | Phase 3 / motion-reduce sweep                                                                                                                                                                                  | Filed at Pass 238; broad scope across shadcn primitives.                                                    |
| KI-194 — Engine 2 tile-mode authority split          | Phase 3 / Engine 2 lane                                                                                                                                                                                        | Engine 2 internal hidden authority.                                                                         |
| KI-195 — Engine 2 guidance popup auto-clear         | Phase 3 / Engine 2 lane                                                                                                                                                                                        | Engine 2 internal state mutation.                                                                           |

### §3.3 Recommended sequencing (advisory, not prescriptive)

If the owner wants to make sub-pass C ship without UX surprises,
the pragmatic sequencing is:

1. **Release ShopMapWidget** + ship the `autoFit="always"` declaration in a small builder pass. Removes B1 + closes a CI allowlist exclusion. Risk: very low.
2. **Bundle KI-196 const hoist** as either a precursor or a co-update with sub-pass C. Risk: none (behavior-preserving).
3. **Owner screenshot review** of ReportDetail's behavior under sub-pass C. (Can be done conceptually before any code change — the change is "map stops reframing on bid arrival.")
4. **Authorize sub-pass C.** Single builder pass: default flip + #1 ReportDetail update + the one INTENTIONAL FLIP test edit (motion test T11).
5. **Status flips** in a follow-up doc-only pass: KI-181 → RESOLVED, KI-187 → RESOLVED, KI-190 → RESOLVED. (KI-191 already RESOLVED.)

This sequencing is a recommendation, not a requirement. Owner may
authorize sub-pass C in a different shape; the gate checklist above
adapts.

---

## §4. What this certification does NOT do

- Does NOT propose, simulate, or execute sub-pass C.
- Does NOT flip any KI status (status flips are owner-gated and ship in a separate pass).
- Does NOT modify `REF_KNOWN_ISSUES.md` (committed file, not in scope for this audit).
- Does NOT touch any production source.
- Does NOT touch any test.
- Does NOT touch any owner-dirty file (per AI_LOCK rule 5).
- Does NOT mentally merge Builder AI 1's in-flight motion test edits.
- Does NOT classify Engine 1 or Engine 2 work beyond what's already in REF docs.
- Does NOT supersede any existing audit doc.

---

## §5. End-of-trilogy index

The convergence-prep trilogy is now complete:

| Pass     | Commit       | Doc                                                                                              | Role                                                                                                                |
| -------- | ------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 244      | `dd724d4b`   | `REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md`                                         | What each call site needs (5 axes per site).                                                                       |
| 245      | `459ff35e`   | `REF_ENGINE3_SUBPASS_C_SIMULATION_2026-05-09.md`                                                 | What each test does at landing (3 buckets per assertion).                                                          |
| 246      | this commit  | `REF_ENGINE3_SUBPASS_C_GATE_CERTIFICATION_2026-05-09.md`                                         | What KIs and gates the owner is signing off on (KI reconciliation + safe-to-authorize-next matrix).                |

The trilogy is intentionally narrow-scope and additive. None of the
three docs supersede or compete with `REF_ENGINE_3_CAMERA_AUTHORITY`
§12 (the canonical Phase 3A landing log) or `REF_MAP_CONVERGENCE_READINESS`
(Pass 231k bridge). All three cite §12 and 231k as inputs.

---

## §6. Status

- **Drafted:** 2026-05-09 (Pass 246, ≡ ChatGPT-relayed 232c).
- **Status:** ACTIVE certification. Updates only when KI states or
  the Phase 3A blockers in §12.4 change.
- **Authority:** REFERENCE.
- **Owner approval required:** false (audit-only).
- **Supersedes:** none.
- **Superseded by:** none.

**Recommended next action (owner):** review §3 safe-to-authorize-next
matrix and pick a sub-pass C authorization shape (or defer).
