# Phase A — Visual Evidence + KI-053 Diagnostic

**Date:** 2026-05-07
**Scope:** Audit-only. Zero code changes. Zero doc edits outside this folder.
**Branch HEAD at capture:** `6b8c85e9` (Pass 42 baseline)
**Build verified:** `npm run build` clean — 3.37s, 0 errors, 2920 modules

---

## How this evidence was captured

Two capture surfaces were used:

1. **VS Code integrated browser (Playwright)** — captured the **authenticated desktop session** for `molalign5@gmail.com` at logical width 1280 (real viewport 1518×1002; the integrated browser ignores `setViewportSize` and CDP `Emulation.setDeviceMetricsOverride` — known limitation, see user memory note + REF_AI_BROWSER_NAVIGATION).
2. **System Chrome via `puppeteer-core`** (`/Applications/Google Chrome.app`) — launched fresh, no Clerk session, captured the **public unauthenticated landing surface** at true 375×812 (mobile, dsf 2) and 768×1024 (tablet, dsf 2). `puppeteer-core` was installed with `npm install --no-save` so `package.json` is unchanged.

**Why two surfaces?** The integrated browser cannot honor mobile viewports, and a fresh puppeteer Chrome cannot inherit Clerk cookies. Together they cover desktop-authenticated and mobile-unauth honestly. Authenticated mobile evidence is **not in this batch** — it requires Clerk session-cookie injection or a real device pass and is the recommended next planner-AI scope item.

---

## File inventory (all in `docs/evidence/phase-a-2026-05-07/`)

### Authenticated desktop (1280, integrated browser, real vp 1518)

| Surface    | Light                      | Dark                      | Notes                                                                                                                  |
| ---------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Dashboard  | `dashboard_1280_light.png` | `dashboard_1280_dark.png` | Welcome back, Molalign — 9 reports / 0 unread. Account Hub card visible.                                               |
| Account    | `account_1280_light.png`   | `account_1280_dark.png`   | Account hub, identity, settings. Right-edge header content visually clipped due to 1518→1280 crop, **not a real bug**. |
| Bids       | `bids_1280_light.png`      | `bids_1280_dark.png`      | 2 bids for 2023 Honda Accord — Lowest $450, Avg $513, Fastest 3-4d.                                                    |
| Report     | `report_1280_light.png`    | `report_1280_dark.png`    | Report flow entry.                                                                                                     |
| Find Shops | `findshops_1280_light.png` | `findshops_1280_dark.png` | Map-first shop finder, authenticated.                                                                                  |

### Unauthenticated landing (real-mobile + tablet via puppeteer-core)

| Surface                       | 375 light                        | 375 dark                        | 768 light                        | 768 dark                        | 1280 light                        | 1280 dark                        |
| ----------------------------- | -------------------------------- | ------------------------------- | -------------------------------- | ------------------------------- | --------------------------------- | -------------------------------- |
| Landing (hero)                | `landing_375_light.png`          | `landing_375_dark.png`          | `landing_768_light.png`          | `landing_768_dark.png`          | `landing_1280_light.png`          | `landing_1280_dark.png`          |
| Landing (coverage map scroll) | `landing-coverage_375_light.png` | `landing-coverage_375_dark.png` | `landing-coverage_768_light.png` | `landing-coverage_768_dark.png` | `landing-coverage_1280_light.png` | `landing-coverage_1280_dark.png` |

### Cells skipped (with reason)

| Cell                                                                 | Reason                                                                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dashboard / Account / Bids / Report / Find Shops at 375 + 768 (auth) | Requires Clerk cookie injection or live device — not capturable by a fresh puppeteer launch in this pass. |

The 12 misleading screenshots (account/bids/report at 375/768) captured by the integrated browser at its real 1518vp were quarantined to `_invalid_viewport/` rather than deleted, so reviewers can see the artifact.

### Diagnostic artifacts

- `ki053-trace.json` — Chrome DevTools tracing capture (~10s pan + zoom + idle on landing coverage map).
- `ki053-summary.json` — tile request/response counts + sample failures.

---

## Anomalies flagged (NOT fixed)

### P0 — none

No build-breaking, runtime-crash, or data-integrity anomalies surfaced in this audit. Build is clean. Dashboard, account, bids, find-shops all render and respond.

### P1 — product / trust

1. **"Recommended" badge on a worse bid.** `bids_1280_dark.png` (and light): the lowest bid is `$450 / 3-4 days` (TestShop), but the **Recommended** badge is attached to the **higher-priced, slower** offer (`$575 / 4-5 days, +$125 vs lowest`). There is no inline explainer for what "Recommended" means (rating? trust score? distance?). Without that, the badge actively undermines trust in the comparison engine — it appears to recommend the worse bid. **Recommend either: (a) attach a tooltip/microcopy that names the criterion behind the recommendation, or (b) gate the badge behind clear logic so it never appears next to a `+$X vs lowest` and slower offer simultaneously.**
2. **Authenticated mobile coverage gap.** No 375/768 evidence exists for dashboard / account / bids / report / find-shops in this pass. The product is mobile-first per LAW; we cannot attest to mobile readiness of the authenticated surface from this batch alone. Action: planner-AI follow-up scope item — capture authenticated-mobile via session-cookie injection script or live device.

### P2 — content / hygiene (already known, owner action)

- `dashboard_1280_*`: **"Toyoto Camry"** misspelling visible in Recent Reports list — see KI-101 (owner-action data hygiene).
- `bids_1280_*` + `dashboard_1280_*`: **placeholder image icon** for shop logo on TestShop entries — see KI-064 / KI-102 (owner-action seed-data assets).
- `dashboard_1280_*`: **red rectangle placeholder** where Honda Accord vehicle image should be — see KI-064 (owner-action seed-data assets).

### P2 — visual / atmosphere

- `account_1280_dark.png` and `bids_1280_dark.png`: a warm gold lamp halo extends from the upper-right of the header card into the next row in dark mode. Visually pleasing and consistent with the locked premium gold lamp canon (LAW_PROJECT_RULES — Premium Gold Palette). **Confirms canon is rendering correctly.** No fix needed; flagged here only because it could be misread as a leak in a future audit without context.
- `landing_375_*`, `landing_768_*`: hero stack and "Get Started" CTA render correctly at mobile and tablet — no horizontal scroll, hamburger present, hero copy intact, NY coverage pill ("Now serving New York") visible. Mobile landing is launch-coherent.
- `landing-coverage_375_*`: coverage search panel + ZIP input + "Find Shops" CTA render correctly; NY metro / Putnam Valley / Yorktown / Peekskill labels visible on map. Map renders on mobile without horizontal overflow.

### P3 — architecture / structural

- None new in this pass. Existing structural work continues per LAW_HARDENING_PLAN.

---

## Validation

- Build: ✅ clean prior to capture (3.37s, 0 errors, 2920 modules). No code touched in this pass.
- `git diff src/` — empty.
- `git diff supabase/` — empty.
- Only `docs/evidence/phase-a-2026-05-07/` and one capture script under `scripts/` were added. The capture script is intentionally outside `src/` and `supabase/` and is annotated as audit-only tooling.

## What this unlocks

1. Planner-AI can scope a **Pass 43 — Bids "Recommended" badge clarification** (P1, surgical, single component, copy + conditional render).
2. Planner-AI can scope a **Pass 44 — authenticated mobile evidence capture** (audit-only, uses Clerk session-cookie injection from logged-in browser → puppeteer profile).
3. KI-053 can be **closed or downgraded** based on `KI053_DIAGNOSIS.md` (see file).
