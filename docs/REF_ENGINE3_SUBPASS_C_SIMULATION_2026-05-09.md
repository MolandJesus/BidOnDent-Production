---
status: CANONICAL
authority: REFERENCE
scope: engine-3-subpass-c-migration-simulation
canonical_source_of_truth: REF_ENGINE3_SUBPASS_C_SIMULATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: Conceptual migration simulation of the future Engine 3 sub-pass C (default flip from "always" to "when-no-caller-bounds"). Maps every existing CI assertion onto one of three buckets — INTENTIONAL FLIP, INVARIANT, TOPOLOGY-REGRESSION-INDICATOR — so the eventual sub-pass C author has a pre-flight checklist. Doc-only; no production source touched.
last_updated: 2026-05-09
---

# Engine 3 Sub-Pass C Migration Simulation (Pass 245, ≡ ChatGPT-relayed 232b)

> Convergence-preparation deliverable. **Doc-only — no production
> source or test code edited**. Conceptual simulation of the future
> sub-pass C migration so the eventual builder pass has a pre-flight
> assertion-flip map.
>
> **Sibling docs:**
>
> - [`REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md`](REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md) (Pass 244 — what each call site needs)
> - [`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) §12 (canonical landing log)
> - [`REF_MAP_CONVERGENCE_READINESS_2026-05-09.md`](REF_MAP_CONVERGENCE_READINESS_2026-05-09.md) (Pass 231k bridge)

---

## §1. What sub-pass C does

Per `REF_ENGINE_3_CAMERA_AUTHORITY` §12.4 + the Pass 244 matrix:

1. **Renderer change:** flip the default value of `autoFit` from
   `"always"` to `"when-no-caller-bounds"` in the
   `MapLibreDashboardMapPreview` prop signature.
2. **Site change (one site):** at `ReportDetailScreen` (matrix #1),
   change `autoFit="always"` → `autoFit="when-no-caller-bounds"` +
   `callerBoundsExplicit={true}`. Caller-centered framing wins; bidding
   shops no longer reframe the map.

Twelve other sites are no-op under the default flip because they
already declare `autoFit="always"` explicitly. One site (#6
ShopMapWidget) is owner-dirty and gates the entire migration until
released + audited.

This simulation does NOT predict any other production change.

---

## §2. Assertion-flip taxonomy

Three buckets:

| Bucket                                | Meaning                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **INTENTIONAL FLIP**                  | The assertion was written to lock the *current* default. Sub-pass C deliberately changes the default. The assertion MUST be updated in the same pass that flips it; failure = the migration didn't ship. |
| **INVARIANT**                         | The assertion locks a behavior that is intentionally orthogonal to the default. Sub-pass C MUST NOT change it. If the assertion fails after sub-pass C, the migration introduced collateral damage. |
| **TOPOLOGY-REGRESSION-INDICATOR**     | The assertion locks a structural property (e.g., explicit-declaration discipline). Sub-pass C MUST NOT change it. Failure here means a deeper architectural problem than just the default flip. |

The discipline is: in the sub-pass C commit, **every test that fails
must fall into the INTENTIONAL FLIP bucket**. Anything else means
either the simulation is wrong or the migration overshot.

---

## §3. Per-test classification

Source: committed state of
`src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx`
+ `src/app/__tests__/engine3CallSiteAutoFitContract.test.ts` as of
`0c52b442` (Pass 243). The file is owner-dirty in the worktree;
classifications below cite the COMMITTED state.

### §3.1 `MapLibreDashboardMapPreview.motion.test.tsx`

| #   | Test (line)                                                                                                | Bucket                              | Reasoning                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | "does not import useMap() from react-map-gl/maplibre" (147)                                                | TOPOLOGY-REGRESSION-INDICATOR       | Locks "preview owns no camera" at the source-import level. Independent of default.                                                                                            |
| T2  | "does not invoke flyTo / easeTo / jumpTo / panTo / zoomTo / fitBounds" (156)                               | TOPOLOGY-REGRESSION-INDICATOR       | Same as T1 — imperative-camera prohibition. Independent of default.                                                                                                           |
| T3  | "does not import the imperative maplibre-gl Map type for camera control" (175)                             | TOPOLOGY-REGRESSION-INDICATOR       | Same family as T1/T2.                                                                                                                                                          |
| T4  | "renders with the exact caller-supplied longitude/latitude/zoom when no fit override applies" (190)        | INVARIANT                           | The condition "when no fit override applies" includes the new default's non-overriding branch (when callerBoundsExplicit=true OR shops < 2). Sub-pass C does not break it.    |
| T5  | "forwards onMove so caller-driven viewport sync stays a controlled-component pattern" (206)                | INVARIANT                           | Locks the controlled-viewport contract. Default-independent.                                                                                                                  |
| T6  | "re-renders snap (not animated) when caller props change — viewport mutation is synchronous" (214)         | INVARIANT                           | Locks "no motion path" at the viewState mutation level. Default-independent.                                                                                                  |
| T7  | "renders identically under prefers-reduced-motion: reduce" (248)                                           | INVARIANT                           | Locks reduced-motion conformance. Default-independent.                                                                                                                        |
| T8  | "tooltip animation classes include motion-reduce:animate-none" (311)                                       | INVARIANT                           | Tooltip-CSS lock. Default-independent.                                                                                                                                        |
| T9  | "tooltip animation classes are the only animate-in usage" (315)                                            | INVARIANT                           | Tooltip-CSS lock. Default-independent.                                                                                                                                        |
| T10 | "when shops change from one cluster to another, viewport snaps to the new fittedView" (337)                | INVARIANT *if* test passes explicit `autoFit="always"` | Pass 237 added this test; needs verification of how it was authored. **Action item for sub-pass C author:** confirm this test passes `autoFit="always"` explicitly; if it relies on default, bump it to INTENTIONAL FLIP and update.        |
| T11 | "default (autoFit undefined) matches the pre-Pass-241 implicit-fit behavior exactly" (413)                 | **INTENTIONAL FLIP**                | This is the canonical default-equals-"always" lock. Sub-pass C MUST update this assertion to: "default (autoFit undefined) matches autoFit=\"when-no-caller-bounds\" behavior."  |
| T12 | 'autoFit="always" + 2 shops → fittedView wins (re-pinned under explicit prop)' (434)                       | INVARIANT                           | Locks the "always" branch. Sub-pass C must preserve.                                                                                                                          |
| T13 | 'autoFit="never" + 2 shops → caller wins (auto-fit opt-out)' (450)                                         | INVARIANT                           | Locks the "never" branch. Sub-pass C must preserve.                                                                                                                            |
| T14 | 'autoFit="never" + 0 shops → caller wins (consistent with "always" no-fit branch)' (467)                   | INVARIANT                           | Same family as T13.                                                                                                                                                            |
| T15 | 'autoFit="when-no-caller-bounds" + callerBoundsExplicit=false → fittedView wins' (488)                     | INVARIANT                           | Locks the "when-no-caller-bounds" branch's permissive subcase. Sub-pass C must preserve. **Note:** this becomes the new *default* behavior, but the test is written against the explicit prop, not the default. |
| T16 | 'autoFit="when-no-caller-bounds" + callerBoundsExplicit=true → caller wins' (508)                          | INVARIANT                           | Locks the "when-no-caller-bounds" branch's strict subcase. The Site #1 ReportDetail target case.                                                                              |
| T17 | 'callerBoundsExplicit is ignored under autoFit="always" (no hidden cross-mode coupling)' (531)             | INVARIANT                           | Cross-mode independence lock. Sub-pass C must preserve.                                                                                                                       |
| T18 | 'callerBoundsExplicit is ignored under autoFit="never" (no hidden cross-mode coupling)' (551)              | INVARIANT                           | Same family as T17.                                                                                                                                                            |
| T19 | 'dynamic auto-fit recomputation still fires under autoFit="always"' (569)                                  | INVARIANT *(if the test passes "always" explicitly, which the title suggests)* | Pass 237 invariant preservation. Should be untouched.                                                                                                                          |
| T20 | "autoFit prop appears in source as a typed surface" (602)                                                  | TOPOLOGY-REGRESSION-INDICATOR       | Asserts the prop name + callerBoundsExplicit token are present in the renderer source. Default-independent.                                                                  |

**Sub-pass C INTENTIONAL-FLIP set (motion test):** T11 only.
**Sub-pass C INVARIANT set (motion test):** T1–T10, T12–T20.

### §3.2 `engine3CallSiteAutoFitContract.test.ts`

| #   | Test (paraphrased)                                                              | Bucket                              | Reasoning                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | "discovers at least one call site (smoke)"                                      | TOPOLOGY-REGRESSION-INDICATOR       | Default-independent.                                                                                                                                             |
| C2  | "every accessible call site declares autoFit explicitly"                        | TOPOLOGY-REGRESSION-INDICATOR       | Default-independent. The discipline is "explicit declaration", not a particular value.                                                                          |
| C3  | "owner-dirty exclusions are still owner-dirty"                                  | TOPOLOGY-REGRESSION-INDICATOR       | Default-independent.                                                                                                                                             |

**Sub-pass C INTENTIONAL-FLIP set (CI invariant):** none.
**Sub-pass C INVARIANT / TOPOLOGY set (CI invariant):** C1–C3.

The CI invariant was specifically authored to be default-agnostic
(per its own header: *"It does NOT assert any specific autoFit value.
Sites may legitimately use 'always', 'when-no-caller-bounds', or
'never'"*). This means the invariant test will NOT need editing at
sub-pass C — confirming the design's robustness.

### §3.3 Other test files

`MapLibreDashboardMapPreview.test.tsx` (Pass 231g, the original
KI-181 baseline matrix). 10 tests in the committed state. Some
overlap with the Pass 241 motion tests:

| Test (paraphrased)                                                          | Bucket                       |
| --------------------------------------------------------------------------- | ---------------------------- |
| "0 shops, 0 pins → caller-supplied center/zoom"                             | INVARIANT                    |
| "1 shop, 0 pins → caller wins (fitPoints < 2)"                              | INVARIANT                    |
| "0 shops, 1 pin → caller wins (fitPoints < 2)"                              | INVARIANT                    |
| "2+ shops → fittedView OVERRIDES caller (HIDDEN AUTHORITY — KI-181)"        | **POSSIBLE INTENTIONAL FLIP** *if* the test was authored against the default. Pass 244 §6.3 noted ReportDetail's "always" preserves the override; sub-pass C only flips Site #1 plus default. **Need verification** by the sub-pass C author against the committed test — if the test passes no `autoFit` prop, it relied on default and needs flip. |
| "1 shop + 1 pin → fittedView still overrides via allPoints fallback"        | Same as above — needs verification. |
| Mount + per-instance id + gesture suppression + style swap                  | TOPOLOGY-REGRESSION-INDICATOR (3 tests) |

**Sub-pass C action items for `MapLibreDashboardMapPreview.test.tsx`:** if either of the two "fittedView OVERRIDES" tests passes no `autoFit` prop, both should be updated to pass `autoFit="always"` explicitly. The tests' INTENT is to lock the override path; that path remains live under explicit `"always"`. The semantic remains; only the prop wiring changes.

---

## §4. Production-source diff surface (conceptual)

What sub-pass C touches in production code:

| File                                                              | Change                                                                                                                                                | Risk |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`    | One default-value flip: `autoFit?: AutoFitMode` default `"when-no-caller-bounds"` (was `"always"`). Or: param destructure: `autoFit = "when-no-caller-bounds"` (was `"always"`). | low  |
| `src/app/components/reports/ReportDetailScreen.tsx`               | One call-site update: `autoFit="when-no-caller-bounds"` + `callerBoundsExplicit={true}` (was `autoFit="always"`).                                       | medium (UX-visible change — owner screenshot review required) |
| `src/app/components/dashboard/ShopMapWidget.tsx`                  | **NOT TOUCHED** until owner-dirty status released. After release: `autoFit="always"` per §12.2 expected value.                                          | gated by §12.4 blocker |

Total production diff under sub-pass C: 2 files, ~3 token-level changes.
ShopMapWidget release is a separate prerequisite pass (call it
"sub-pass B-completion") that adds the explicit declaration when the
file is released — independent of the default flip itself.

---

## §5. Rollback shape

If sub-pass C lands and needs reverting:

1. **Renderer revert:** flip `autoFit` default back to `"always"`. One-token edit.
2. **ReportDetail revert:** restore `autoFit="always"` and remove `callerBoundsExplicit`. One-line edit.
3. **Test revert (T11):** restore the original assertion text in `MapLibreDashboardMapPreview.motion.test.tsx`.
4. **Verify CI invariant test still passes.** It's default-agnostic, so no changes needed there.

Rollback is mechanically trivial. UX visibility on the ReportDetail
revert means the owner should screenshot-test the revert too, just as
they screenshot-tested the forward migration.

---

## §6. CI-validation expectations at sub-pass C landing

A correctly-shipped sub-pass C produces this CI signal pattern:

| Signal                                                                                  | Expected at sub-pass C landing                                                                              |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `MapLibreDashboardMapPreview.motion.test.tsx` T11                                       | FAILING before the test edit; PASSING after the test edit. The two changes (default flip + test update) ship together in the same commit. |
| `MapLibreDashboardMapPreview.motion.test.tsx` T1–T10, T12–T20                           | PASSING throughout (INVARIANT bucket).                                                                       |
| `MapLibreDashboardMapPreview.test.tsx` (Pass 231g) override tests                       | PASSING — but verify they pass `autoFit="always"` explicitly. If not, bundle the explicitization edit with sub-pass C. |
| `engine3CallSiteAutoFitContract.test.ts` C1–C3                                          | PASSING throughout (TOPOLOGY-REGRESSION bucket).                                                            |
| Reduced-motion CI invariant (Pass 238)                                                  | PASSING throughout (sub-pass C does not touch motion semantics).                                            |
| Resize-patch invariant (Pass 231j)                                                      | PASSING throughout (sub-pass C does not touch the patch).                                                   |
| `useMapEngineGeoJSON.test.tsx` (Pass 186)                                               | PASSING throughout (Engine 1 hook, untouched by sub-pass C).                                                |
| `MapEngineCanvas.test.tsx` (Pass 193)                                                   | PASSING throughout (Engine 1, untouched).                                                                    |
| `useMapPaneState.test.tsx` (Pass 231h)                                                  | PASSING throughout (Engine 2, untouched).                                                                    |
| `mapLibreControllers.test.tsx` (Pass 231i)                                              | PASSING throughout (Engine 1 controllers, untouched).                                                        |
| `maplibreResizePatch.test.ts` (Pass 231j)                                               | PASSING throughout.                                                                                          |

**Net:** the only test that intentionally fails-then-passes during
sub-pass C is T11 in the motion test. Anything else failing is a
TOPOLOGY-REGRESSION-INDICATOR, not an intentional outcome.

---

## §7. Site-by-site impact (sourced from Pass 244 matrix)

Per Pass 244 §3, sub-pass C is no-op at 12 of 14 call sites. Detail:

| Site            | Sub-pass C action                                                          | UX visibility                                              |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| #1 ReportDetail | UPDATE: `autoFit="always"` → `autoFit="when-no-caller-bounds"` + `callerBoundsExplicit={true}` | YES — map stops reframing on bid arrival                   |
| #2-#5           | NO CHANGE — `autoFit="always"` remains literal                              | NONE                                                       |
| #6 ShopMapWidget | NOT TOUCHED — owner-dirty                                                  | NONE (until released)                                      |
| #7-#12          | NO CHANGE — `autoFit="always"` remains literal                              | NONE                                                       |
| #13-#14         | NO CHANGE — `autoFit="always"` is a runtime no-op (single-pin sites)        | NONE                                                       |

The aggregate UX impact of sub-pass C is **one site**, ReportDetail
mini-map. Owner authorization should be screenshot-scoped to that
surface specifically.

---

## §8. What this simulation does NOT do

- Does NOT modify any production source.
- Does NOT modify any test.
- Does NOT propose owner-side decisions — it only enumerates them.
- Does NOT change the existing CI invariant test.
- Does NOT change Engine 1 or Engine 2.
- Does NOT touch any owner-dirty file (per AI_LOCK rule 5).
- Does NOT mentally merge ShopMapWidget's in-flight diff into reasoning.

---

## §9. Status

- **Drafted:** 2026-05-09 (Pass 245, ≡ ChatGPT-relayed 232b revised).
- **Status:** ACTIVE simulation. Updates only when the test file
  shape changes (e.g., a new `autoFit`-related test lands).
- **Authority:** REFERENCE.
- **Owner approval required:** false (audit-only).
- **Supersedes:** none.
- **Superseded by:** none.

**Next pass (≡ ChatGPT-relayed 232c):** KI reconciliation +
sub-pass C convergence gate certification. Doc-only.
