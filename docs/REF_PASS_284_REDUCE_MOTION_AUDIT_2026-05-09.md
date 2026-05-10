---
status: ACTIVE
authority: REF
scope: pass-284-reduce-motion-audit-validation
canonical_source_of_truth: REF_PASS_284_REDUCE_MOTION_AUDIT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 284 reduced-motion audit validation under owner relay 2026-05-09 #14 priority Item C. Pass 280 §13 step 4 prescribed an audit script "if/when implemented." Discovery: scripts/audit-reduced-motion.mjs ALREADY EXISTS from Pass 71 (KI-139, 2026-05-07) — complete, working, 7,694 bytes. Pass 284 executes the existing script, captures clean baseline (35/35 keyframes have full guard coverage; exit 0), and documents existence + usage so future agents can find it. The audit infrastructure satisfies LAW_ANIMATION_AND_ATMOSPHERE.md §3 mandatory contract by mechanically verifying every @keyframes consumer is guarded under @media (prefers-reduced-motion: reduce). Pass 284 doc-only — no new script created (per CLAUDE.md "no half-finished implementations" + relay #14 prohibition on duplicate work). NO source / LAW / MOLANDJESUS touched. ZERO new owner-decision points (cumulative remains 31). Forward trigger surfaced: wire audit into pre-commit hook or CI to catch future drift (Pass 71 file header notes this is currently caught by humans).
last_updated: 2026-05-09
---

# Pass 284 — Reduced-Motion Audit Validation

> **Tier:** REF. Validation pass for existing audit infrastructure.
> **Authority:** Owner relay 2026-05-09 #14 priority Item C
> ("reduced-motion audit automation; read-only validation infrastructure").
>
> **Pass type:** Discovery + validation. The audit script already
> exists from Pass 71 (KI-139, 2026-05-07). Pass 284 executes it,
> captures the clean baseline, and documents the infrastructure
> for future agents.

---

## §1 — Mission

Per relay #14 priority Item C: provide reduced-motion audit
automation. Pass 280 §13 step 4 prescribed: "Audit script: every
keyframe consumer has a reduce-guard."

**Discovery:** the audit script already exists. Pass 284 does NOT
create a duplicate; it validates and documents the existing one.

---

## §2 — Existing audit script

**Path:** `scripts/audit-reduced-motion.mjs`
**Created:** Pass 71 (2026-05-07), KI-139
**Size:** 7,694 bytes / 254 lines
**Status:** complete, working, executable

**Purpose (per file header):**

> "LAW_ANIMATION_AND_ATMOSPHERE §3 requires every `@keyframes`
> referenced by user-facing styles to be neutralized under
> `@media (prefers-reduced-motion: reduce)`. Drift between added
> keyframes and added guards (KI-139) is caught here."

**Algorithm summary (per file):**
1. Find every `@keyframes <name>` definition in `src/styles/*.css`
2. Find every consumer selector outside reduce blocks that
   references the keyframe via `animation` shorthand or
   `animation-name` longhand
3. Inside `@media (prefers-reduced-motion: reduce)` blocks, collect
   selectors that disable animation (`animation: none`, `animation:
   0s`, `animation-duration: 0s`, `animation-name: none`).
   Wildcard selectors (`*`, `*::before`) cover all consumers.
4. A keyframe is "guarded" if EVERY consumer selector that uses it
   is also (a) covered by a wildcard reduce-rule, OR (b) named
   verbatim in a reduce block with an animation-disabling rule.

**Exit codes:**
- 0 = every keyframe has full guard coverage
- 1 = at least one keyframe has unguarded consumers (failing names + offending selectors are printed)

---

## §3 — Pass 284 baseline run

**Command:** `node scripts/audit-reduced-motion.mjs`
**Date:** 2026-05-09
**Result:**

```
reduced-motion audit: 35/35 keyframes have full guard coverage.
```

**Exit code:** 0 (clean).

### §3.1 What this confirms

1. **35 keyframes** total across `src/styles/*.css` (matches
   Pass 280 §6 estimate of ~34).
2. **100% guard coverage** — every consumer selector that
   references any keyframe is either covered by a wildcard
   reduce-rule or named in a reduce-motion guard block.
3. **LAW_ANIMATION_AND_ATMOSPHERE.md §3 mandatory contract** is
   mechanically satisfied as of Pass 284 baseline.
4. **Pass 280 §13 step 4** is satisfied — the audit infrastructure
   exists, runs cleanly, and is ready to catch future drift.

### §3.2 What this does NOT confirm

The audit verifies **structural** coverage (every keyframe has a
guard). It does NOT verify:
- **Visual correctness** of guards (whether `animation: none` is
  the right neutralizer for a given motion)
- **Atmospheric continuity** under reduced-motion (whether the
  app feels right when motion is disabled — runtime-audit lane
  responsibility)
- **Per-keyframe fallback semantics** (whether some animations
  should be replaced with a single-frame state rather than
  disabled entirely)

These are runtime-validation concerns, complementary to the
mechanical structural audit.

---

## §4 — Recommended usage

### §4.1 Manual run

```bash
node scripts/audit-reduced-motion.mjs
```

Run before committing any keyframe addition or reduce-motion
guard modification. Exit code 0 = safe; exit code 1 = gap to
remediate before commit.

### §4.2 CI / pre-commit (future enhancement — NOT in Pass 284 scope)

Pass 71 file header notes:

> "Pass 71 baseline: this script catches future drift only.
> Cleaning up the existing backlog (KI-139 OPEN list) is staged
> for a later sweep."

The existing backlog has now been cleared (Pass 284 baseline:
35/35 clean). The remaining future work is **wiring the script
into automated enforcement** so drift is caught at commit-time
rather than by ad-hoc human runs.

Possible automation surfaces:
- `package.json` script: `"audit:reduce-motion": "node scripts/audit-reduced-motion.mjs"`
- Pre-commit hook (husky / lefthook): block commits if exit code 1
- CI job: run on PR to detect drift before merge

**Not authorized for Pass 284.** Surfaced as future trigger; owner can authorize automation wiring as a separate pass.

---

## §5 — Cross-references for Pass 282 + 283 changes

Pass 282 (cadence/easing tokenization) added 1 token and replaced
3 inline values. Pass 283 (blur tokenization) added 3 tokens and
replaced 36 inline values. Neither pass added new keyframes or
modified reduce-motion guards.

**Pass 284 audit confirms** these passes did NOT introduce new
keyframe drift. The 35/35 clean baseline is preserved.

This validates the **conservative-mechanical pattern** (Pass 282
+ 283): tokenization preserves existing structure including the
reduce-motion contract.

---

## §6 — Forward triggers

1. **Wire `audit-reduced-motion.mjs` into automated enforcement**
   (pre-commit hook or CI). Single-pass scope; touches
   `package.json` or hooks config. Owner-authorize as Pass 286+.
2. **Address visual-correctness concerns** (§3.2) via
   runtime-audit lane work. Independent gate; not source-edit.
3. **Pass 285 — Item G**: runtime continuity regression harness
   prep (next priority per relay #14 sequencing).
4. **Pass 286+ — Items A-extension or D or E**: cadence-mass-replace,
   Clerk wrapper, or notification parameterization (per relay #14
   menu).

---

## §7 — What this pass DOES NOT do

- Does NOT create a new audit script (existing one from Pass 71
  is complete and working).
- Does NOT touch any production source.
- Does NOT touch `LAW_ANIMATION_AND_ATMOSPHERE.md` or any LAW.
- Does NOT modify `MOLANDJESUS_DESIGN_DECISIONS.md` or `CLAUDE.md`.
- Does NOT wire automation (pre-commit / CI) — surfaced as future
  trigger.
- Does NOT fix any audit failure — the baseline is already clean
  (35/35).
- Does NOT extend the audit to verify visual correctness — that
  is runtime-audit lane responsibility.
- Does NOT add new owner-decision points (cumulative remains 31).

---

## §8 — Cross-references

- `scripts/audit-reduced-motion.mjs` — the audit script (Pass 71, 2026-05-07).
- `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` §3 — mandatory reduce-motion contract.
- Pass 282 [`REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md`](REF_PASS_282_CADENCE_TOKENIZATION_2026-05-09.md) — preserved reduce-motion guards.
- Pass 283 [`REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md`](REF_PASS_283_BLUR_TIER_TOKENIZATION_2026-05-09.md) — preserved reduce-motion guards.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) §11 invariant #6 — reduce-motion guards must be preserved mechanically.
- Pass 280 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) §13 step 4 — prescribed audit script (now confirmed already exists).
- KI-139 — original drift discovery + Pass 71 remediation context.
- Owner relay 2026-05-09 #14 priority Item C.

---

## §9 — Status

- **Drafted:** 2026-05-09 (Pass 284, validation pass for existing audit infrastructure).
- **Status:** ACTIVE reference. Documents existing audit-reduced-motion.mjs script + captures Pass 284 clean baseline (35/35 keyframes guarded).
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc. Pass 284 is read-only validation; no source touched.
- **Refines:** Pass 280 §13 step 4 by confirming the audit script already exists from Pass 71 + capturing current clean baseline.

The reduced-motion audit infrastructure is in place AND the
current state is clean. Pass 282 + 283 mechanical work preserved
the contract perfectly. The pattern is sound; the contract is
mechanically enforceable; future drift will be caught.
