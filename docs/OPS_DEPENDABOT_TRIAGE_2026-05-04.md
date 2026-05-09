# Dependabot Triage 2026-05-04 (OPS)

**Authority level:** OPS — operational snapshot of the dependabot triage executed in Phase 3.6.

**Last updated:** 2026-05-05 (sweep verification appended; see §6).

**Status:** HISTORICAL — **COMPLETE on `BidOnDent-Horizon-Beta` (working branch).** All 3 vulnerabilities resolved at the lockfile level — `npm audit` returns 0 vulnerabilities. **NOT YET MERGED TO `main`** (default branch). GitHub Dependabot alerts #18 (postcss medium), #19 (`@clerk/shared` high), #20 (`@clerk/clerk-react` high) remain OPEN on the default branch and will auto-close on the eventual Horizon-Beta → main merge. See §6 for 2026-05-05 sweep verification details.

**Phase context:** [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) Phase 3.6 row.

---

## Trigger

GitHub flagged 3 vulnerabilities on every push to `BidOnDent-Horizon-Beta` starting at the Phase 0 push (2026-05-04). The warnings were noted but deferred until Phase 3.6 was authorized.

`npm audit` snapshot at start of triage:

```
3 vulnerabilities (1 moderate, 2 high)
  - @clerk/clerk-react   high      GHSA-w24r-5266-9c3c
  - @clerk/shared        high      GHSA-w24r-5266-9c3c (transitive)
  - postcss              moderate  GHSA-qx2v-qp2m-jg93 (transitive)
```

---

## Triage decisions

### 1. Clerk authorization bypass (high, 2 packages)

| Field          | Value                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Advisory       | GHSA-w24r-5266-9c3c                                                                                                                                    |
| CWE            | CWE-754 (improper check), CWE-863 (incorrect authorization)                                                                                            |
| Affected       | `@clerk/clerk-react` 5.9.0–5.61.5; `@clerk/shared` 3.0.0–3.47.4                                                                                        |
| Vulnerability  | Authorization bypass when combining organization, billing, or reverification checks                                                                    |
| Classification | **(a) Runtime path — auth/identity invariant**                                                                                                         |
| Reasoning      | Clerk JWT verification is load-bearing per `LAW_PROJECT_RULES.md` Storage + Auth Invariants §17. Any auth-path bypass is patch-now.                    |
| Action         | **PATCHED.** Direct dep `@clerk/clerk-react` 5.61.5 → 5.61.6 (commit `9b11bb9b`). Transitive `@clerk/shared` resolved 3.47.4 → 3.47.5 in same install. |
| Bump scope     | PATCH (within Clerk 5.x major line). Hard-stop rule observed.                                                                                          |
| Verification   | `npm audit` post-patch: 0 high vulns remaining. Build clean.                                                                                           |

### 2. PostCSS XSS via CSS Stringify (moderate)

| Field          | Value                                                                                                                                                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advisory       | GHSA-qx2v-qp2m-jg93                                                                                                                                                                                                                                                                                                                                 |
| CWE            | CWE-79 (XSS)                                                                                                                                                                                                                                                                                                                                        |
| CVSS           | 6.1                                                                                                                                                                                                                                                                                                                                                 |
| Affected       | `postcss` <8.5.10                                                                                                                                                                                                                                                                                                                                   |
| Vulnerability  | XSS via unescaped `</style>` in CSS stringify output                                                                                                                                                                                                                                                                                                |
| Classification | **(b) Build/dev-only transitive — could escalate if exposed**                                                                                                                                                                                                                                                                                       |
| Reasoning      | postcss is a transitive of `vite@6.4.2` (build-time tool). Production paths use statically-built CSS, so XSS exploit requires user-controlled CSS being stringified at runtime — not a path BidOnDent exercises. Severity-by-practical-exposure: low. But the override fix is mechanical and non-breaking, so patch-now was preferable to KI-defer. |
| Action         | **PATCHED.** Added `"postcss": "^8.5.10"` to `package.json` `overrides` block (commit `df122c25`). Resolved postcss 8.5.6 → 8.5.14.                                                                                                                                                                                                                 |
| Bump scope     | PATCH (within postcss 8.x major line). No vite bump. Hard-stop rule observed.                                                                                                                                                                                                                                                                       |
| Verification   | `npm audit` post-patch: 0 vulns total. Build clean.                                                                                                                                                                                                                                                                                                 |

### 3. (n/a — only 2 distinct advisories; the @clerk/shared finding was the same advisory as #1, transitively listed)

---

## Bump-scope summary

| Package                         | Before | After  | Bump kind | Hard-stop check                           |
| ------------------------------- | ------ | ------ | --------- | ----------------------------------------- |
| `@clerk/clerk-react`            | 5.61.5 | 5.61.6 | PATCH     | ✅ within Clerk 5.x major                 |
| `@clerk/shared` (transitive)    | 3.47.4 | 3.47.5 | PATCH     | ✅ within Clerk shared 3.x major          |
| `postcss` (transitive override) | 8.5.6  | 8.5.14 | PATCH     | ✅ within postcss 8.x major; no vite bump |

**Hard-stop rules from PLAN_PHASE_4_MOBILE_SWEEP / Phase 3.6 brief:**

- ✅ No major version bumps
- ✅ No Vite 6 / Tailwind v4 / Clerk / Supabase major-line touches (Vite stays at 6.4.2; Clerk stays at 5.x major)
- ✅ Build green on first try (no retry needed)

---

## Build state

| Stage                                         | Precache    | Δ from baseline                       |
| --------------------------------------------- | ----------- | ------------------------------------- |
| Pre-triage (commit `b5f8c302`, Phase 4 close) | 3818.49 KiB | baseline                              |
| Post-Clerk patch (`9b11bb9b`)                 | 3819.11 KiB | +0.62 KiB (Clerk auth-check fix code) |
| Post-postcss override (`df122c25`)            | 3819.11 KiB | +0 (build-time only, no bundle delta) |

---

## Future review triggers

No KI entries created — all 3 vulns patched, none deferred. Future `npm audit` warnings should follow the same triage pattern:

1. Run `npm audit --json`
2. Classify each: (a) runtime auth/storage/payment/identity, (b) build/dev-only transitive, (c) framework-pinned
3. (a) → patch-now with one commit per advisory; (b) → patch via override if non-breaking, else KI-defer; (c) → KI-defer with upstream-tracking note
4. Hard stops: any major version bump, any Vite 6 / Tailwind v4 / Clerk / Supabase major-line touch, any build failure after one retry

---

## Cross-references

- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 3.6 row updated this commit
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — Storage + Auth Invariants §17 (Clerk patch rationale)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — no entries created (all vulns patched, none deferred)
- Commit chain: `9b11bb9b` (Clerk) → `df122c25` (postcss) → original triage snapshot doc (2026-05-04)

---

## §6. Sweep verification 2026-05-05

**Trigger:** Owner authorized autopilot queue item "Dependabot triage sweep — review OPS_DEPENDABOT_TRIAGE_2026-05-04 + GH alerts" after KI-112 + Phase 8.5 closes shipped (commits `fae329d8` → `baee9966`).

**Method:** `gh api repos/MolandJesus/BidOnDent-Production/dependabot/alerts` cross-referenced against `npm audit` on `BidOnDent-Horizon-Beta` HEAD.

### 6.1 GitHub Dependabot alerts (default branch = `main`)

| #   | Package              | Severity | State    | GHSA                                  | Created    |
| --- | -------------------- | -------- | -------- | ------------------------------------- | ---------- |
| 20  | `@clerk/clerk-react` | high     | **open** | (auth-bypass advisory)                | 2026-04-30 |
| 19  | `@clerk/shared`      | high     | **open** | (same advisory, transitive)           | 2026-04-30 |
| 18  | `postcss`            | medium   | **open** | (XSS via `</style>` in CSS Stringify) | 2026-04-30 |

These match the 3 vulnerabilities triaged on 2026-05-04 — same advisories, same packages.

### 6.2 Lockfile reality on `BidOnDent-Horizon-Beta`

```
@clerk/clerk-react: 5.61.6   (patched per §1)
@clerk/shared: 3.47.5         (transitive resolution per §1)
postcss: 8.5.14               (override per §2)
```

`npm audit` output: **0 vulnerabilities (info: 0, low: 0, moderate: 0, high: 0, critical: 0)**.

### 6.3 Reconciliation: why GH alerts still OPEN

**Root cause: branch divergence.** The 2026-05-04 triage shipped patches `9b11bb9b` (Clerk) and `df122c25` (postcss) to `BidOnDent-Horizon-Beta` but **not to `main`** (the default branch GitHub Dependabot scans). As of 2026-05-05:

- `main` `package.json` still pins `"@clerk/clerk-react": "^5.61.5"` (the vulnerable range).
- `main` has no `postcss` override.
- `BidOnDent-Horizon-Beta` is **207 commits ahead** of `main` (entire soft-launch hardening sequence + Phase 0–8.5 work).

This is the expected state during soft-launch hardening: development continues on Horizon-Beta; `main` is a stable historical reference until the merge gate.

### 6.4 Action: defer to merge

**No new commits this sweep.** The patches exist; the merge will resolve the alerts. Manual dismissal of the alerts via `gh api ... -X PATCH` is technically possible but inappropriate while `main` actually contains the vulnerable versions — dismissing would mark them "fixed" when production-on-`main` is still vulnerable.

The correct resolution path is the eventual `BidOnDent-Horizon-Beta` → `main` merge, at which point Dependabot's next scan will auto-close all 3 alerts.

### 6.5 No new triage required

`npm audit` on Horizon-Beta is clean. No new vulnerabilities surfaced between 2026-05-04 and 2026-05-05. The Phase 3.6 triage decisions (PATCH for Clerk; PATCH-via-override for postcss) remain correct.

If Dependabot surfaces a new vulnerability before the Horizon-Beta → main merge, the established triage pattern from §3.6 / §95 of this doc applies:

1. Run `npm audit --json`
2. Classify: (a) runtime auth/storage/payment/identity, (b) build/dev-only transitive, (c) framework-pinned
3. (a) → patch-now on Horizon-Beta with one commit per advisory; (b) → patch via override if non-breaking, else KI-defer; (c) → KI-defer with upstream-tracking note
4. Hard stops: any major version bump, any Vite 6 / Tailwind v4 / Clerk / Supabase major-line touch, any build failure after one retry
5. Patches land on Horizon-Beta; `main` resolves at the merge gate

### 6.6 Sweep verdict

**Horizon-Beta:** ✅ clean (0 vulnerabilities).
**`main`:** ⚠️ 3 known unpatched (resolution = merge, not new patch).
**Action this sweep:** Single `docs(security):` doc-update commit recording the verification. Zero code edits. No new KI. No alert dismissal. No cherry-pick to main (out of autopilot scope; main-branch ops are owner-decision territory per soft-launch hardening posture).
