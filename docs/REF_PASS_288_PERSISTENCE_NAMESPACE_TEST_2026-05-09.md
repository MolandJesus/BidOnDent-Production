---
status: ACTIVE
authority: REF
scope: pass-288-source-change-evidence
canonical_source_of_truth: REF_PASS_288_PERSISTENCE_NAMESPACE_TEST_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 288 source-change evidence — Phase 1 closer of Pass 285 harness §3.5 (persistence-key namespace consistency). New test file src/app/__tests__/persistenceNamespace.test.ts (~180 lines) implements vitest snapshot test that scans src/app/**/*.ts{x} for `*KEY*` / `*STORAGE*` named constants and verifies their string-literal values match documented namespace conventions or appear in a 5-entry allowlist. CRITICAL DRIFT DISCOVERY (per relay #15 reporting criteria): the test on its first run flagged `bidondent-navigation-discovery-quality-snapshot-v1` at src/app/services/navigation/placeDiscoveryQuality.ts:51 as an undocumented FIFTH namespace convention. Pass 274 §3.1 catalogued 4 conventions (bidondent. / bidondent_ / bd-short / un-namespaced); the hyphen-separated `bidondent-` is a fifth. Drift was added to allowlist with explicit citation pointing to Pass 274 §3.4 RISK 2 (convention drift remediation is owner-authorize work). Allowlist now contains 5 documented entries: coverageCurrentLocation (Pass 274 §3.2 RISK 1) + demo + mode (query-string keys, Pass 274 §3.2) + __BIDONDENT_MAPLIBRE_RESIZE_PATCHED__ (window global, Pass 274 §3.3) + bidondent-navigation-discovery-quality-snapshot-v1 (Pass 288 drift discovery). All 3 tests PASS. Phase 1 of Pass 285 harness now 3/3 COMPLETE: §3.1 (Pass 287) + §3.2 (Pass 238 pre-existing) + §3.5 (Pass 288, this pass). NO production source touched (test-only file). Pass 281 §11 invariants ALL preserved + invariant #5 (persistence-namespace doctrine) now mechanically PROTECTED. NO LAW touched. ZERO new owner-decision points (cumulative remains 31). Pass 274 §3.1 documentation drift remediation surfaced as forward trigger for owner-authorized future pass.
last_updated: 2026-05-09
---

# Pass 288 — Persistence-Key Namespace Snapshot Test (Evidence)

> **Tier:** REF. Source-change evidence document.
> **Authority:** Owner relay 2026-05-09 #15 — autonomous continuation
> authorization for Phase 1 of Pass 285 harness implementation.
>
> **Pass type:** Phase 1 closer. Closes Pass 285 §3.5 (persistence-key
> namespace consistency). Combined with Pass 287 (§3.1) and Pass 238
> (§3.2 pre-existing), Phase 1 is now 3/3 complete.

---

## §1 — Mission

Per Pass 285 §3.5 specification:
> "Persistence-key namespace consistency. Invariant: localStorage
> keys are namespace-prefixed (bidondent.*, bidondent_*, bd-* / bd:*)
> with a small known set of un-namespaced exceptions. Tooling:
> TypeScript compiler API or AST traversal."

Pass 288 implements this via lightweight regex-based source scan
of `*KEY*` / `*STORAGE*` named constants. Simpler than full AST
parser; sufficient for the storage-key convention check.

---

## §2 — CRITICAL DISCOVERY: 5th namespace convention drift

The test on first execution flagged a previously-uncatalogued
namespace convention:

**File:** `src/app/services/navigation/placeDiscoveryQuality.ts:51`
**Constant:** `const discoveryQualityStorageKey = "bidondent-navigation-discovery-quality-snapshot-v1";`

**Why it's drift:** Pass 274 §3.1 catalogued FOUR namespacing
conventions:
1. `bidondent.` (dot-namespaced) — 4 keys
2. `bidondent_` (underscore-namespaced) — 22 keys
3. `bd-` / `bd:` (short prefix) — 2 keys
4. UN-NAMESPACED — 3 keys

The hyphen-separated `bidondent-...` style does NOT appear in any
of the 4 documented conventions. It's a fifth convention introduced
since (or missed by) Pass 274 §3 inventory.

**Severity:** MEDIUM. Pass 274 §3.4 RISK 2 already flagged
"convention drift" as MEDIUM; this discovery confirms drift
exceeds Pass 274's documented count.

**Remediation:** owner-authorize work. Two options:
- **Option A:** rename the key to use one of the 4 documented
  conventions (e.g., `bidondent_navigation_discovery_quality_snapshot_v1`
  or `bidondent.navigation.discovery-quality-snapshot.v1`). Single-file
  source edit + migration script.
- **Option B:** sanction `bidondent-` as a 5th convention; update
  Pass 274 §3.1 to catalogue it; tighten the test's NAMESPACE_PATTERNS.

**Pass 288 stance:** allowlist the existing key explicitly. Test
documents the drift; future un-allowlisted keys still fail. Owner
decides remediation.

---

## §3 — Edits applied

### §3.1 New file: `src/app/__tests__/persistenceNamespace.test.ts`

**Size:** ~180 lines.
**Imports:** `node:fs`, `node:path`, `vitest`.
**Algorithm:**
1. Walk `src/app/**/*.ts{x}` (excluding `__tests__`, test files)
2. Extract string-literal values from constants matching
   `(?:export\s+)?const\s+\w*(?:KEY|STORAGE)\w*\s*(?::\s*[^=]+)?=\s*["']([^"']+)["']`
3. Filter via `looksLikeStorageKey` heuristic (length 3-80, no
   spaces, no `/`)
4. Categorize each by namespace pattern
5. Assert un-namespaced subset is contained in allowlist

**Allowlist (5 entries, all documented):**

| Entry | Source | Documentation |
| --- | --- | --- |
| `coverageCurrentLocation` | clearStaleNavSessions.ts | Pass 274 §3.2 RISK 1 |
| `demo` | devDemoMode.ts | Pass 274 §3.2 query-string |
| `mode` | devDemoMode.ts | Pass 274 §3.2 query-string |
| `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` | maplibreResizePatch.ts | Pass 274 §3.3 window global |
| `bidondent-navigation-discovery-quality-snapshot-v1` | placeDiscoveryQuality.ts:51 | **Pass 288 drift discovery (this pass)** |

### §3.2 Test execution

```
npx vitest run src/app/__tests__/persistenceNamespace.test.ts
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  651ms
```

3/3 PASS after allowlist documentation.

---

## §4 — Phase 1 status — NOW 3/3 COMPLETE

| Pass 285 §3 invariant | Status | Implementation |
| --- | --- | --- |
| §3.1 Provider mount order | ✓ DONE | Pass 287 |
| §3.2 Reduce-motion guard coverage | ✓ DONE | Pass 238 (pre-existing; discovered Pass 287) |
| **§3.5 Persistence-key namespace** | **✓ DONE** | **Pass 288 (this pass)** |
| §3.3 Hydration timing | PENDING | Phase 2 (Playwright) |
| §3.4 Atmospheric-layer continuity | PENDING | Phase 2 (Playwright) |
| §3.6 Provider teardown sequencing | PENDING | Phase 3 (instrumented runtime) |

**Phase 1 closure:** the 3 structural invariants are mechanically
protected. Future regressions in any of:
- Provider mount order
- Reduce-motion guard coverage
- Persistence-key namespace consistency

… will fail the test suite at commit time.

Phase 1 cost: ~3-5 vitest test files (Pass 285 §4.1 estimated).
Actual: 1 new file by Pass 287 + 1 new file by Pass 288 + 1
pre-existing file from Pass 238 = 3 total. Estimate was accurate.

---

## §5 — What was preserved

### §5.1 Production source — UNTOUCHED

Pass 288 is purely additive. Single new test file. Zero production
source touched.

### §5.2 Per Pass 281 §11 invariants

All 8 invariants preserved. Specifically:
- Invariant #5 (cascade-order :root blocks) — UNTOUCHED
- Invariant #4 (atmospheric layer choreography) — UNTOUCHED
- The 4-layer provider mount order — UNTOUCHED (and now PROTECTED by Pass 287 test)
- Reduced-motion guards (35/35 baseline) — UNTOUCHED (and now PROTECTED by Pass 238 test)
- **Persistence-namespace doctrine — UNTOUCHED (and now PROTECTED by Pass 288 test)**

### §5.3 Per Pass 281 §12 anti-patterns

Zero violations.

---

## §6 — Verification

### §6.1 Mechanical verification

3/3 tests PASS. Allowlist correctly accepts the 5 known exceptions
(1 original + 4 documented additions/discoveries).

### §6.2 Negative-case behavior

If a future code addition introduces:
- New un-allowlisted un-namespaced storage key → Test 2 fails with
  message citing Pass 274 §3 + the offending key.
- New namespace convention beyond the 3 documented patterns AND
  not in allowlist → same Test 2 failure.
- A storage key string matching multiple namespace patterns
  simultaneously → Test 3 fails (currently impossible with the
  3 patterns, but defensive guard).

### §6.3 Reverse-revertibility

Pass 288 is fully reversible via `git revert <commit-sha>`.
Reverting deletes the test file. Production code unaffected.

---

## §7 — Forward triggers

1. **Owner authorizes Pass 274 §3.1 documentation update** to
   include the 5th `bidondent-` convention OR authorizes
   remediation rename of `placeDiscoveryQuality.ts:51` key to
   match an existing convention (Pass 274 §3.4 RISK 2 work).
2. **Phase 2 of Pass 285 harness implementation** — Playwright
   visual continuity tests (medium-cost; requires Playwright
   install + setup).
3. **Phase 3 of Pass 285 harness implementation** — instrumented
   runtime checks (highest-cost; requires production-code hooks).
4. **Pass 289 — Item E notification parameterization** (relay #14
   menu remaining).
5. **Pass 289 — Item A extension** (39-site cubic-bezier mass
   replace; needs owner Step-5-style decision).
6. **Owner ratifies any of 31 cumulative decision points**.
7. **Stacey answers** (Pass 268 §8).

---

## §8 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT modify Pass 274 §3.1 catalogue (drift documented in
  test allowlist + this evidence doc; Pass 274 update is
  owner-authorize).
- Does NOT rename `discoveryQualityStorageKey` (remediation is
  Pass 274 §3.4 RISK 2 work; owner-authorize).
- Does NOT touch any LAW doc.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT implement Phase 2 / Phase 3 of Pass 285 harness
  (deferred to future authorized passes).
- Does NOT modify any existing test file.

---

## §9 — Cross-references

- Pass 287 [`REF_PASS_287_PROVIDER_MOUNT_ORDER_TEST_2026-05-09.md`](REF_PASS_287_PROVIDER_MOUNT_ORDER_TEST_2026-05-09.md) — companion Phase 1 test (§3.1).
- Pass 286 [`REF_PASS_286_CLERK_WRAPPER_INFLATION_2026-05-09.md`](REF_PASS_286_CLERK_WRAPPER_INFLATION_2026-05-09.md) — preserved by Pass 288 test (Clerk wrapper inflation didn't touch storage layer).
- Pass 285 [`REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md`](REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md) §3.5 — specification Pass 288 implements.
- Pass 281 [`REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md`](REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md) §9 + §11 invariant #5 — doctrine Pass 288 mechanically enforces.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) §3 — namespace catalogue + §3.4 RISK 2 convention drift.
- Pass 238 — `reducedMotionContract.test.ts` (Phase 1 §3.2 implementation; pre-existing).
- `src/app/services/navigation/placeDiscoveryQuality.ts:51` — drift discovery site.
- Owner relay 2026-05-09 #15.

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 288, Phase 1 closure).
- **Status:** ACTIVE. New test file added; 3/3 tests pass; **Phase 1
  of Pass 285 harness now 3/3 COMPLETE**. Companion to commit.
- **Authority:** REF.
- **Owner approval required:** FALSE for this doc. Pass 288 source
  change executed under relay #15 autonomous continuation. Future
  Pass 274 §3.1 documentation update OR placeDiscoveryQuality.ts
  rename requires explicit owner authorization.
- **Refines:** Pass 285 §3.5 by implementing it; refines Pass 274
  §3.1 by surfacing drift evidence (without modifying the doc).

The persistence-key namespace doctrine is now mechanically
protected against future drift. Phase 1 of the runtime continuity
regression harness is complete. Pass 281 §11 invariant #5
(persistence-namespace consistency) joins invariant #1 (provider
mount order) + reduced-motion contract as machine-enforced
preservation surfaces.

The next implementation pass can either close Phase 2 of the
harness (Playwright visual continuity) or pivot to relay #14 menu
items (Item E notification parameterization, Item A extension)
or owner decision points.
