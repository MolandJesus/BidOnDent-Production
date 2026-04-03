# BidOnDent — Finishing Master Plan

**Last updated:** April 3, 2026
**Created:** 2026-03-25
**Status:** Active execution policy
**Phase:** Pre-refactor stabilization, verification, and controlled completion

This doc defines **how finishing work should be prioritized and governed**. It is not the pass log, not the setup guide, and not the product-architecture source of truth.

Use alongside:

- `CLAUDE_AI_MASTER_CONTEXT.md` for product and architecture truth
- `BIDONDENT_MAP_TRACKER_2026-03-21.md` for current execution reality
- `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` for the verified baseline snapshot
- `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` for active validation coverage

---

## Product Truth

BidOnDent is a **map-first auto body repair marketplace**. The map is not a feature. It is the product surface that ties together damage reporting, shop discovery, routing, bids, and insurer workflows.

The platform is past its original milestone and no longer needs broad idea generation. It needs disciplined completion, coherence, and verification.

## What This Doc Owns

- Finishing priorities
- Validation discipline
- Stop conditions
- Rules for keeping completion work coherent

## What This Doc Does Not Own

- Pass-by-pass execution history
- Setup instructions
- Deep architecture reference
- Historical sprint sequencing

For those, use the tracker, setup guides, or archive.

## Hard Rules

1. **No silent scope expansion.** If a problem is real but outside the pass, log it instead of absorbing it.
2. **No fake capability.** Product trust depends on honest behavior, copy, and data boundaries.
3. **No broad rewrites during finishing work.** Prefer scoped slices, extraction, and verification.
4. **No mixing unrelated work.** One coherent pass should have one main goal.
5. **No doc drift.** If execution truth changes, update the relevant active docs in the same pass.
6. **No bypassing architecture law.** Keep services, hooks, components, and backend boundaries intact.

## Current Finishing Priorities

1. Functional correctness across customer, shop, and insurer routes.
2. Map-first continuity across the main product loop: report -> map -> shop -> action.
3. Security, data-boundary, and trust issues before polish.
4. Validation accuracy across baseline, matrix, and current tracker.
5. Refactor readiness only after current behavior is clearly verified.

## Current Execution Policy

Use this order when deciding what to do next:

1. Fix real breakage or trust failures first.
2. Fix blockers in the core product loop next.
3. Tighten architecture only when it directly reduces delivery risk.
4. Polish only after behavior, trust, and verification are solid.

Execution should stay **vertical and truthful**:

- verify a real problem
- fix one coherent slice
- validate it
- update active docs if truth changed

## Validation Gate

Every finishing pass should be able to answer yes to these questions:

1. Does this make the product more correct or more trustworthy?
2. Does this reduce friction in the real user flow?
3. Does this reinforce the map-first product identity?
4. Is the validation result explicit and honest?

If any answer is no, the pass likely needs to be narrowed or reconsidered.

## Documentation Rule

After a completed pass:

1. Update `BIDONDENT_MAP_TRACKER_2026-03-21.md` when execution reality changed.
2. Update `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` when map strategy, architecture, or map-law implications changed.
3. Update `docs/README.md` when the documentation hierarchy or source-of-truth guidance changed.
4. Update this plan only when finishing policy or priority order changed.

## Stop Conditions

Pause and realign if:

- the build breaks in a genuinely new way
- required product behavior is unclear
- a reserved or concurrent-work file would need risky edits
- docs are contradictory enough to block safe action

Otherwise: keep moving.

## North Star

The product should feel like a **live map system**, not a disconnected website with map widgets attached.

Every finishing pass should make BidOnDent feel more spatial, more trustworthy, and more operationally coherent.
