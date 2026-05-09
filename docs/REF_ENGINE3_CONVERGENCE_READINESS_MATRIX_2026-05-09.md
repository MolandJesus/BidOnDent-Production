---
status: CANONICAL
authority: REFERENCE
scope: engine-3-convergence-readiness
canonical_source_of_truth: REF_ENGINE3_CONVERGENCE_READINESS_MATRIX_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: Layered convergence-readiness classification on top of REF_ENGINE_3_CAMERA_AUTHORITY §12 14-site inventory. Adds per-site risk band, "preview owns no camera" (PONC) satisfaction status, rollback complexity, and sub-pass C readiness so the eventual default-flip authorization is mechanically obvious. Audit-only — no production change.
last_updated: 2026-05-09
---

# Engine 3 Convergence-Readiness Matrix (Pass 244, ≡ ChatGPT-relayed 232a)

> Convergence-preparation deliverable. Audit-only — **no production
> source touched**. Builds on the committed Phase 3A landing log
> (`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12) and on
> [`REF_MAP_CONVERGENCE_READINESS_2026-05-09.md`](REF_MAP_CONVERGENCE_READINESS_2026-05-09.md)
> (Pass 231k bridge document).
>
> **Why this exists:** Phase 3A's §12 table already enumerates the 14
> call sites and their `autoFit` declarations. What it does NOT do is
> classify each site against the convergence-readiness criteria the
> next owner ratification will need to weigh. This doc adds that
> layer — risk band, "preview owns no camera" (PONC) satisfaction
> status, rollback complexity, and per-site sub-pass C readiness —
> in a single matrix.
>
> **Audience:** the owner deciding whether/how to authorize sub-pass C
> (default flip from `"always"` to `"when-no-caller-bounds"`).
>
> **Authority tier:** REFERENCE. Subordinate to LAW_MAP_RENDERER_CONTRACT,
> the active PLAN sequence, and Pass 231k. This doc proposes nothing
> — it classifies.

---

## §1. Inputs

- Committed source-of-truth for the 14-site inventory:
  [`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) §12.2 + §12.2.1.
- Constitutional bridge:
  [`REF_MAP_CONVERGENCE_READINESS_2026-05-09.md`](REF_MAP_CONVERGENCE_READINESS_2026-05-09.md) (Pass 231k).
- Active CI invariant:
  [`src/app/__tests__/engine3CallSiteAutoFitContract.test.ts`](../src/app/__tests__/engine3CallSiteAutoFitContract.test.ts) (Pass 243).
- Phase 3A STOP gate text and sub-pass C blockers:
  [`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) §12.4.

This doc is descriptive, not prescriptive — Builder AI 1 owns the
runtime migration lane. This doc does not propose or execute any
changes.

---

## §2. Classification axes

Each call site is rated on five axes:

| Axis                          | Meaning                                                                                                                                                                            | Possible values                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Tier**                      | LAW §4 classification — uniform Tier B for every Engine 3 caller (Engine 3 is the canonical Tier B preview engine).                                                                | always Tier B for this matrix                                                                                                            |
| **Implicit-authority-dep.**   | Did the call site, pre-Phase-3A, depend on the silent fittedView override to compose its frame? "yes" sites benefit from explicit `autoFit="always"` declaration; "no" sites would have rendered identically with `autoFit="never"`. | YES (depends on fit) / NO (single-pin, fit no-op)                                                                                        |
| **Future autoFit (sub-pass C target)** | Doctrinal target value when sub-pass C lands per §12.2.                                                                                                                      | `"always"` / `"when-no-caller-bounds"` / `"never"`                                                                                       |
| **Rollback complexity**       | What's needed to revert this site if the eventual sub-pass C declaration is wrong. Lower is better.                                                                                | TRIVIAL (one-token edit) / SCREENSHOT (visual UX revert verification needed) / N/A (already at sub-pass C target)                       |
| **PONC satisfaction**         | Whether the call site, AS DECLARED TODAY, satisfies the "preview owns no camera" acceptance criterion. A site satisfies PONC when its declared `autoFit` mode plus its `callerBoundsExplicit` value (if any) means user gestures cannot affect camera state and the renderer doesn't silently override caller intent. | YES / NO-AT-SUBPASS-C-TARGET / NO-FIT-DRIVEN-BY-DESIGN                                                                                  |

**Important:** "PONC = NO-FIT-DRIVEN-BY-DESIGN" is NOT a regression.
A site whose explicit purpose is "fit to a multi-pin overview" legitimately
hands camera authority to the renderer. The acceptance criterion is
*explicit declaration of that intent*, not "no camera authority anywhere."
A site is PONC-violating only if it BOTH passes a caller-supplied
center/zoom AND the renderer silently overrides that authority. Pre-Phase-3A,
ReportDetail (#1) was the sole site that fit this strict definition.

---

## §3. The matrix

> Site numbering follows §12.2 + §12.2.1 of REF_ENGINE_3_CAMERA_AUTHORITY.
> Five axes per row. Where the doctrinal sub-pass C target equals the
> current declaration (`"always"` → `"always"`), no migration work is
> needed for that site at sub-pass C; only #1 and #6 require change.

| #   | Call site                            | Implicit-authority-dep. | Future autoFit (sub-pass C target)                          | Rollback complexity                  | PONC satisfaction (today, declared)            | Notes                                                                                                                                |
| --- | ------------------------------------ | ----------------------- | ----------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | ReportDetailScreen mini-map          | YES                     | `"when-no-caller-bounds"` + `callerBoundsExplicit`          | SCREENSHOT (visible UX change)       | NO-AT-SUBPASS-C-TARGET                          | Sole strict KI-181 hazard site. Caller passes report coords; today's `"always"` re-overrides them when ≥2 bidding shops appear. Sub-pass C removes the override; the map will stop reframing on bid arrival. |
| 2   | ReportsListScreen overview map       | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Genuine multi-pin overview. Fit-driven framing is the intent. Already correctly declared.                                                                                  |
| 3   | CompetitorAnalysisScreen map         | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Multi-competitor distribution surface. Fit-driven by design.                                                                                                              |
| 4   | InsurerMapWidget overview            | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Partner shops + active reports framed by fittedView. Genuine fit-driven preview.                                                                                          |
| 5   | CustomerMapWidget preview            | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Partner shops around customer. Fit-driven by design.                                                                                                                       |
| 6   | ShopMapWidget                        | UNAUDITED               | `"always"` (per §12.2 expected when released)               | OWNER-DIRTY                          | UNAUDITED                                       | OWNER-DIRTY per Phase 2/3 hard-stop list — not yet audited. Expected sub-pass B target value is `"always"` per §12.2; final classification deferred until file is released. |
| 7   | ShopActiveJobsScreen multi-job map   | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Jobs distribution preview.                                                                                                                                                  |
| 8   | InsurerPartnerShopsScreen            | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Partner-distribution.                                                                                                                                                        |
| 9   | InsurerClaimsScreen                  | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Claims-distribution.                                                                                                                                                         |
| 10  | ShopRequestsScreen                   | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Requests-distribution.                                                                                                                                                       |
| 11  | LikedShopsScreen                     | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Saved-shops distribution.                                                                                                                                                    |
| 12  | BidsGeographyMap                     | YES                     | `"always"` (no change)                                      | N/A                                  | NO-FIT-DRIVEN-BY-DESIGN                         | Bid distribution.                                                                                                                                                            |
| 13  | AcceptedBidConfirmationSheet         | NO                      | `"always"` (no change — fittedView is null at single-shop)  | TRIVIAL                              | YES (single-pin; fittedView trivially null)     | Single-shop confirmation. Fittedview returns null when `fitPoints < 2`, so `autoFit` is a runtime no-op here. Declared for invariant compliance per §12.2.1.                |
| 14  | StepServiceLocation                  | NO                      | `"always"` (no change — single pin, fittedView null)         | TRIVIAL                              | YES (single-pin; fittedView trivially null)     | Same shape as #13: single pin, fittedView null. Declared for invariant compliance.                                                                                          |

---

## §4. Aggregations

### §4.1 By sub-pass C target

| Target                                 | Count | Sites                                          |
| -------------------------------------- | ----- | ---------------------------------------------- |
| `"when-no-caller-bounds"`              | 1     | #1 (ReportDetail)                              |
| `"always"`                             | 12    | #2-#5, #7-#14                                  |
| `"always"` (pending owner-dirty audit) | 1     | #6 (ShopMapWidget)                             |
| `"never"`                              | 0     | (none — no site needs gestures-disabled but no-fit) |

**Net:** sub-pass C is a **one-site UX migration** (#1) plus an
**owner-dirty release prerequisite** (#6). Twelve sites are no-op
under the default flip — their explicit `autoFit="always"` declaration
already pins their behavior.

### §4.2 By PONC satisfaction (today)

| Status                          | Count | Notes                                                                                                                       |
| ------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| YES                             | 2     | #13, #14 — single-pin sites where fittedView is trivially null. Camera authority sits with caller props, full stop.        |
| NO-FIT-DRIVEN-BY-DESIGN         | 10    | #2-#5, #7-#12 — explicit `autoFit="always"` is the camera authority declaration; PONC satisfied via *intent transparency*. |
| NO-AT-SUBPASS-C-TARGET          | 1     | #1 — currently `"always"`, will satisfy strict PONC when sub-pass C flips it to `"when-no-caller-bounds"`.                  |
| UNAUDITED                       | 1     | #6 — owner-dirty.                                                                                                           |

**Net:** 13 of 14 sites satisfy PONC today (under the looser
"intent-transparency" reading). The strict-PONC violator is #1. Sub-pass C
closes it.

### §4.3 By rollback complexity

| Complexity                           | Count | Sites                                                        |
| ------------------------------------ | ----- | ------------------------------------------------------------ |
| N/A (already at sub-pass C target)   | 11    | #2-#5, #7-#12                                                |
| TRIVIAL (one-token revert)           | 2     | #13, #14                                                     |
| SCREENSHOT (UX revert verification)  | 1     | #1                                                           |
| OWNER-DIRTY                          | 1     | #6                                                           |

**Net:** sub-pass C's rollback story is dominated by exactly one site
(#1, screenshot-required). Twelve sites have no rollback need.

---

## §5. Sub-pass C readiness assessment per site

> "Ready" means: if the owner authorized sub-pass C tomorrow, this site
> could land in the same pass. "Not ready" means a prerequisite must
> resolve first.

| #   | Site                              | Sub-pass C readiness                                                                                                                              |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ReportDetailScreen                | NOT READY — owner UX screenshot review required (§12.4 blocker).                                                                                  |
| 2-5 | Reports/Competitor/Insurer/Customer overview | READY — no change at sub-pass C; explicit `"always"` already pins behavior.                                                                       |
| 6   | ShopMapWidget                     | NOT READY — owner-dirty release required (§12.4 blocker). Plus a re-audit pass to confirm the `"always"` expectation.                             |
| 7-12 | Shop / Insurer / Bids screens    | READY — no change at sub-pass C.                                                                                                                  |
| 13  | AcceptedBidConfirmationSheet      | READY — runtime no-op.                                                                                                                            |
| 14  | StepServiceLocation               | READY — runtime no-op.                                                                                                                            |

**Net (sub-pass C readiness):** 12/14 ready, 2/14 blocked. Both blockers
are owner-dirty / owner-attention items, not technical work.

---

## §6. Migration-sensitive vs safe call sites

For an authorization-decision-ready summary:

### §6.1 Safe callers (no UX change at sub-pass C, no owner attention required)

#13 AcceptedBidConfirmationSheet, #14 StepServiceLocation. Single-pin
sites where the renderer's fittedView is trivially null; the explicit
`autoFit="always"` is purely invariant compliance, removing it would not
change behavior. These are the only two strictly-PONC-satisfying sites
in the inventory.

### §6.2 Already-satisfying-by-design callers (no change, no owner attention required)

11 callers: #2-#5, #7-#12. These are genuine multi-pin overviews. Their
explicit `autoFit="always"` declaration *is* the fit-driven authority
contract. Sub-pass C does not affect them.

### §6.3 Migration-sensitive caller (owner UX review required)

#1 ReportDetailScreen. Pre-Phase-3A, the silent fittedView override was
the KI-181 hazard. Today's `"always"` declaration preserves that hazard
but makes it caller-visible. Sub-pass C target
`"when-no-caller-bounds"` + `callerBoundsExplicit` removes the override
entirely — the map will stop reframing when bidding shops arrive. That
is the intended UX (caller-centered framing on a report); the change
is therefore a UX *improvement*, but it changes user-visible behavior
and the owner must approve the screenshot-reviewable shift.

### §6.4 Owner-dirty caller (re-audit required when released)

#6 ShopMapWidget. Cannot be classified beyond §12.2's expected
`"always"` value until the file is released. The CI invariant test
(Pass 243) holds the allowlist exclusion stable so this site cannot
silently regress while owner-dirty.

---

## §7. What this matrix does NOT do

- Does NOT propose, simulate, or execute sub-pass C.
- Does NOT touch any production source.
- Does NOT modify the existing CI invariant test.
- Does NOT change Builder AI 1's runtime migration lane.
- Does NOT supersede or compete with §12 of `REF_ENGINE_3_CAMERA_AUTHORITY`. It layers on top.
- Does NOT classify Engine 1 or Engine 2 callers (out of Phase 3A scope per Pass 240 STOP gate).
- Does NOT touch any owner-dirty file.

---

## §8. Cross-references

- `REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12 (canonical 14-site inventory with `autoFit` declarations).
- `REF_MAP_CONVERGENCE_READINESS_2026-05-09.md` (Pass 231k bridge document — defines "preview owns no camera" canonical terminology).
- `LAW_MAP_RENDERER_CONTRACT.md` §4.2 (Tier B obligations).
- `REF_KNOWN_ISSUES.md` KI-181 (hidden authority — current status TBD pending Pass 246 reconciliation).
- `src/app/__tests__/engine3CallSiteAutoFitContract.test.ts` (CI invariant locking the explicitization gain).

---

## §9. Status

- **Drafted:** 2026-05-09 (Pass 244, ≡ ChatGPT-relayed 232a revised).
- **Status:** ACTIVE matrix. Updates only when the call-site inventory or
  the doctrinal sub-pass C target changes (i.e., when §12 of
  REF_ENGINE_3_CAMERA_AUTHORITY changes).
- **Authority:** REFERENCE. Subordinate to LAW_MAP_RENDERER_CONTRACT, the
  active PLAN sequence, and Pass 231k.
- **Owner approval required:** false (audit-only).
- **Supersedes:** none.
- **Superseded by:** none.

**Next pass (≡ ChatGPT-relayed 232b):** sub-pass C migration simulation
+ CI assertion flip map. Doc-only, no production touch.
