# Dependabot Triage 2026-05-04 (OPS)

**Authority level:** OPS — operational snapshot of the dependabot triage executed in Phase 3.6.

**Last updated:** 2026-05-04

**Status:** **COMPLETE.** All 3 vulnerabilities resolved. Final audit: `found 0 vulnerabilities`.

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
- Commit chain: `9b11bb9b` (Clerk) → `df122c25` (postcss) → this commit (snapshot doc)
