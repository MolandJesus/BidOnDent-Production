# Pass 25 — Dormant Exports Sweep: hooks/ + utils/ (cowork-A)

**Date:** 2026-05-08, post-Pass-24.
**Authority:** extension of T-B + audit AI Pass 17 dormant-exports investigation. Read-only investigation; no code removal authorized this pass (per LAW Anti-Cascade Rule).
**Scope:** `src/app/hooks/` (68 hook files) + `src/app/utils/`. Method: extract every `export const|function|async function`, count repo-wide consumers via `\bNAME\b` ripgrep, treat count=1 as candidate dead-code (only the definition site).

---

## High-confidence findings

### 1. `src/app/utils/photoUtils.ts` — **ENTIRE FILE DEAD** (154 lines)

`grep -rn "photoUtils" src/` returns **ZERO matches** across the codebase. No file imports from this module. All exports are dormant:
- `fileToBase64`
- `uploadPhotoDemo`
- `hasLocalStorageSpace`
- (any other exports in this 154-line file)

Largest single dead-code finding in the dormant-exports investigation cluster (across T-B, Pass 17, and this sweep).

### 2. `src/app/hooks/useUserDataHelpers.ts` — **5 of 6 exports dead** (~80-100 dormant lines)

Only ONE function in this 156-line file is consumed:
- `parseCachedUserData` — imported by `useUserData.ts:27` + `useUserDataLoader.ts:29` ✓ ALIVE

The other 5 are dormant:
- `loadCachedUserData` (L47)
- `saveUserDataCache` (L81)
- `buildUserDataCachePayload` (L107)
- `isCloudImageUrl` (L133)
- `createSupabaseReportPayload` (L138)

Estimated dormant LoC: ~80-100 (depends on shared types/helpers between alive and dead exports).

### 3. `src/app/hooks/useScrollAnimation.ts` — `useCountUp` dead (~30 lines)

The main hook `useScrollAnimation` is heavily consumed (10+ landing components — CTASection, FooterSection, BusinessInquirySection, HowItWorksSection, etc.). But the secondary export `useCountUp` (L37) has **zero consumers** — only the definition site.

### 4. `src/app/hooks/shopDirectoryNavigationUtils.ts` — `toCoveragePartnerShop` dead

Single dead export at L11. Unknown total file size; minor.

---

## Aggregate

**Total confirmed dormant LoC: ~260-280 across 3 files** (1 entirely dead + 2 partially dead).

Add to T-B + Pass 17 prior cumulative: total dormant-exports investigation has now identified roughly:
- ~229 lines from `nyMetroTestHubSeed.ts` (REMOVED audit AI Pass 17)
- ~3 lines from `marketIntelligence.ts:getShopDirectory` (REMOVED audit AI Pass 17)
- ~6 lines from `userDataUtils.ts:toMapReportShape` (REMOVED audit AI Pass 18b)
- **~260-280 lines surfaced this pass (NOT YET REMOVED)**

Removing the Pass 25 candidates would close out the "code cleanup" theme cleanly. Each file is independently removable with low blast radius.

---

## Recommended cleanup-pass scope (NOT shipped this turn)

Per LAW Anti-Cascade Rule, dead-code removal awaits master-builder authorization. When approved:

**Pass 26 candidate (master-builder authorization required):**

```bash
# Mechanical removal — each file's dormant exports + dependencies
git rm src/app/utils/photoUtils.ts                       # entire file
# Edit useUserDataHelpers.ts to keep only parseCachedUserData (~80 line removal)
# Edit useScrollAnimation.ts to remove useCountUp (~30 line removal)
# Edit shopDirectoryNavigationUtils.ts to remove toCoveragePartnerShop (small)
```

Verification: typecheck before/after; no behavior change expected.

**Risk assessment:** LOW. Each file/export is independently dead per ripgrep verification. The cleanup-pass commit can be reverted file-by-file if any cascade surfaces.

---

## Why not shipped now

1. **LAW Anti-Cascade Rule:** "discovering a grandfathered file exceeds its budget is **not** an obligation to refactor it." Same principle applies to dead code — surfacing without authorization is the safe path.
2. **Audit AI Pass 17 precedent:** they shipped removals only with master-builder + owner-implicit authority via the autopilot directive. The directive scope was Pass 17 ("dormant exports janitor pass"). A Pass 26 fresh authorization keeps the audit trail honest.
3. **Concurrent-edit risk:** `useUserDataHelpers.ts` is in `hooks/` which audit AI's coordination doc §3 lists as their primary territory. Coordination-respect: leave it for them OR explicit cross-territory claim via AI_LOCK before editing.

---

## Counter-finding — strong code quality signal

Across hooks/ + utils/ (~80+ exports examined), only 7-9 are dormant. The vast majority (75+ exports) have 3+ consumers. The codebase is genuinely well-pruned at the per-export level; the dormant code that exists is concentrated in 3 specific files (photoUtils, useUserDataHelpers, useScrollAnimation), not scattered across the codebase.

This is the ideal pattern for a janitor pass: small number of files, each with concentrated dead code, low cross-dependency risk.

---

## Cross-references

- `DORMANT_EXPORTS_SWEEP.md` (T-B prior, services/intelligence/ scope)
- audit AI Pass 17 ship (nyMetroTestHubSeed + getShopDirectory removed)
- audit AI Pass 18b ship (toMapReportShape alias removed)
- LAW_LAYERED_ARCHITECTURE.md "Anti-cascade rule"
- JOINT_SESSION_COORDINATION.md §3 file-touch boundaries (hooks/ in audit AI primary territory)

End of Pass 25 evidence. No source-code changes shipped this pass.
