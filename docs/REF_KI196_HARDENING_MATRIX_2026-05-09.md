# REF — KI-196 SAFE-TO-HARDEN Matrix

**Created:** 2026-05-09
**Pass:** 250 (KI-196 lane / Phase 3B-adjacent stability hardening)
**Tier:** REFERENCE
**Status:** ACTIVE — feeds Pass 251 execution.
**Authority:** Owner-authorized full-autopilot pivot OUT of Phase
3B continuation. Lane = behavior-preserving hardening ONLY.
**Inputs:** `REF_KI196_INVENTORY_2026-05-09.md` (Pass 249).

---

## Mission

For each non-owner-dirty hazard hit identified by Pass 249,
produce a verdict: **GO**, **DEFER**, or **NO**.

Verdict criteria:

- **rollback complexity** — one-token revert?
- **blast radius** — single component / single tree / cross-tree?
- **semantic sensitivity** — does identity stabilization change
  any consumer's observable behavior?
- **CI coverage sufficiency** — what tests would catch a
  regression?
- **equality semantics** — does any consumer rely on inequality
  / fresh-array semantics?

GO = land in Pass 251 with companion semantic-equivalence test.
DEFER = land in a later authorized lane; no execution this sweep.
NO = do not land at all (intentional design).

---

## §1. Caller-side audit — does any caller omit?

Production caller scan (grep `reportPins=` across `src/app/`):

| Caller                                                                  | Passes `reportPins` explicitly? |
| ----------------------------------------------------------------------- | ------------------------------- |
| `src/app/components/reports/ReportDetailScreen.tsx:369`                 | YES (`reportPins={reportPins}`) |
| `src/app/components/reports/ReportsListScreen.tsx:210`                  | YES (`reportPins={reportMapPins}`)|
| `src/app/components/shop/ShopActiveJobsScreen.tsx:351`                  | YES (`reportPins={jobPins}`)    |
| `src/app/components/dashboard/InsurerMapWidget.tsx`                     | YES (local useMemo result)      |
| `src/app/components/dashboard/CustomerMapWidget.tsx`                    | YES (local useMemo result)      |
| `src/app/components/dashboard/ShopMapWidget.tsx` (owner-dirty)          | YES (local useMemo result)      |

**Conclusion:** ZERO production callers omit `reportPins`. The
`reportPins = []` default is defensive only. A singleton extraction
changes ZERO observable behavior in production today and ELIMINATES
the latent loop hazard for any future caller that does omit.

Same conclusion holds for `serviceAreaCircles` (caller-side scan
shows all production callers pass it, never omit it).

---

## §2. Per-site verdict matrix

### Hit 1 — `MapLibreDashboardMapPreview.reportPins = []` → **GO**

| Criterion              | Assessment                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Rollback complexity    | One-line: change default to literal `[]` again. Module const survives or is also reverted.  |
| Blast radius           | Single file (renderer). Singleton const lives at module scope, exported only if test needs. |
| Semantic sensitivity   | NONE. Production callers always pass; test callers always pass `[]` literal explicitly.     |
| CI coverage            | Pass 245 simulation tests + Pass 246 reduced-motion tests + Pass 247 footprint test all pass `reportPins={[]}` and remain green. New Pass 251 test adds explicit semantic-equivalence assertion. |
| Equality semantics     | No consumer relies on inequality. The `allPoints` useMemo deps include `reportPins`; a stable identity REDUCES recomputation. The `fittedView` useMemo gates on `length`, so length is preserved. |
| Pass 247 §1 conflict   | NO. Pass 247 footprint regex does not lock the `reportPins = []` token.                      |

**Verdict:** **GO**. Hardening: extract module-scope
`const EMPTY_REPORT_PINS: ReportPin[] = []` and use as default.

### Hit 2 — `MapLibreDashboardMapPreview.serviceAreaCircles = []` → **GO**

| Criterion              | Assessment                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Rollback complexity    | One-line.                                                                                 |
| Blast radius           | Same file as Hit 1. Same module-scope const pattern.                                      |
| Semantic sensitivity   | NONE. `serviceAreaPolygons` useMemo recomputes on identity; consumer is render-only and gated on `length > 0`. |
| CI coverage            | All existing Pass 245/246/247 tests omit `serviceAreaCircles` (rely on the default). Stable singleton makes those test-side defaults stable too — strengthens, not regresses, existing coverage. |
| Equality semantics     | No consumer relies on inequality.                                                         |
| Pass 247 §1 conflict   | NO.                                                                                       |

**Verdict:** **GO**. Same singleton pattern.

### Hit 3 — `InsurerMapWidget.reports = []` → **DEFER**

| Criterion              | Assessment                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Rollback complexity    | One-line.                                                                                 |
| Blast radius           | Single file. Local `reportPins` useMemo absorbs identity churn into its OWN new array.    |
| Semantic sensitivity   | NONE.                                                                                     |
| CI coverage            | No widget-level rerender characterization tests exist. Adding them requires a separate test fixture pass. |
| Equality semantics     | None.                                                                                     |
| Reason for DEFER       | Tributary, not a root site. Local useMemo already breaks the identity chain inside the widget — the downstream `reportPins` prop into `<DashboardMapPreview>` already gets a fresh array from the local memo on every `reports`-identity churn, so the widget-level default doesn't propagate identity through. Hardening here is correct but **lower-priority than Hit 1**. Best done together with Hits 4/5 in a future widget-cohort pass. |

**Verdict:** **DEFER** to a future widget-cohort pass.

### Hit 4 — `ShopMapWidget.reports = []` → **DEFER (owner-dirty)**

Excluded by AI_LOCK rule. Owner-side modifications in worktree.
Cannot land in Pass 251.

### Hit 5 — `CustomerMapWidget.reports = []` → **DEFER**

Same logic as Hit 3. Twin hardening, lower-priority than Hit 1.

### Hit 6 — `MapLibreServiceCoverageMap.counties = []` → **GO**

| Criterion              | Assessment                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Rollback complexity    | One-line.                                                                                  |
| Blast radius           | Single file. Singleton lives at module scope of `MapLibreServiceCoverageMap`.              |
| Semantic sensitivity   | NONE. `counties` flows into `useMapEngineGeoJSON` which builds GeoJSON; identity churn would otherwise re-fire the GeoJSON memo. |
| CI coverage            | Existing service-coverage tests (if any) and the `useMapEngineGeoJSON` memo behavior are stable on length/content. New singleton REDUCES recomputation. |
| Equality semantics     | None.                                                                                      |

**Verdict:** **GO**.

### Hit 7 — `MapLibreServiceCoverageMap.partnerShops = []` → **GO**

Render-only consumer (Source/Layer data prop). Singleton extraction
removes latent identity churn cost; zero behavior change.

**Verdict:** **GO**.

### Hit 8 — `MapLibreServiceCoverageMap.discoveryPlaces = []` → **NO**

Already self-stabilized via length-keyed memo deps
(`interactiveLayerIds` deps include `discoveryPlaces.length`, not
the array identity). Singleton extraction would be cosmetic and
adds a module-scope export with no measurable benefit. Per
implementation-discipline rule (no over-engineering), do not land.

**Verdict:** **NO**.

### Hit 9 — `CoverageNavigationPlanner.addressSuggestions = []` → **DEFER**

| Criterion              | Assessment                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Rollback complexity    | One-line.                                                                                 |
| Blast radius           | Single file, but the component has 50+ props and is a heavy planner shell.                |
| Semantic sensitivity   | UNKNOWN without a deeper consumer trace. Pass 250 budget did not include a full trace.    |
| CI coverage            | Insufficient for confident landing without companion test.                                |
| Reason for DEFER       | Heavy component, deeper trace needed. Deferred to keep Pass 251 surgical.                 |

**Verdict:** **DEFER**.

---

## §3. Pass 251 execution plan

Land hardening for: **Hits 1, 2, 6, 7** — all in TWO files:

- `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`
  - Add module-scope `const EMPTY_REPORT_PINS: ReportPin[] = []`
  - Add module-scope `const EMPTY_SERVICE_AREA_CIRCLES: ServiceAreaCircle[] = []`
  - Replace `reportPins = []` default → `reportPins = EMPTY_REPORT_PINS`
  - Replace `serviceAreaCircles = []` default → `serviceAreaCircles = EMPTY_SERVICE_AREA_CIRCLES`
- `src/app/components/maps/MapLibreServiceCoverageMap.tsx`
  - Add module-scope `const EMPTY_COUNTIES: <Type>[] = []`
  - Add module-scope `const EMPTY_PARTNER_SHOPS: <Type>[] = []`
  - Replace `counties = []` default → `counties = EMPTY_COUNTIES`
  - Replace `partnerShops = []` default → `partnerShops = EMPTY_PARTNER_SHOPS`

Add ONE companion test file:

- `src/app/__tests__/ki196DefaultParamStability.test.tsx`
  - §1 — Hit 1: omitting `reportPins` does NOT change rendered
    Map props vs. passing `[]` literal (semantic equivalence).
  - §2 — Hit 2: omitting `serviceAreaCircles` does NOT change
    rendered Map props vs. passing `[]` literal.
  - §3 — module-scope singleton identity stability: two
    consecutive renders that omit the prop pass the SAME array
    instance into the consumer chain (identity-preserving).

Test count target: 6 new tests (3 sections × 2 props for
sections 1+2 = 4 + 2 identity tests).

### Out-of-scope confirmations

- Will NOT touch `autoFit`, `callerBoundsExplicit`, or the
  `effectiveFittedView` gate.
- Will NOT touch any viewport / fit / camera logic.
- Will NOT touch any owner-dirty file.
- Will NOT touch sub-pass C readiness.
- Will NOT touch the widget tributaries (Hits 3, 5).

### Validation plan

- `npx vitest run src/app/__tests__/ki196DefaultParamStability.test.tsx` → expect 6/6.
- `npx vitest run` → expect 893 + 6 = 899/899.
- `npm run build` → expect success.
- Pass 247 §1 footprint test: re-run, expect still passing (regex
  unchanged; default tokens move from `[]` literal to identifier
  references; the §1 regexes target `autoFit` and
  `callerBoundsExplicit` only).

### Rollback semantics

Per-site one-line revert. Modular: any one of the four sites can
be reverted independently. The companion test file can be deleted
to revert the verification coverage.

---

## §4. STOP discipline

After Pass 251 lands and validates, the KI-196 lane reaches its
authorized stop. Next-pass guidance:

- DO NOT extend hardening to Hits 3, 5, 9 without explicit owner
  authorization for a "widget-cohort hardening" lane.
- DO NOT touch ShopMapWidget (Hit 4) until owner clears its
  dirty status.
- DO NOT use the EMPTY_* singleton pattern as license to refactor
  unrelated default-param sites elsewhere in the codebase.
- DO NOT reopen Phase 3B / sub-pass C theory.

If owner directs further work, the next coherent unit is the
"Tier B map surface coverage expansion" lane named in the
KI-196 directive.
