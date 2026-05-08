# Anti-Regression Items 13–14 Verification (T-C)

**Source:** PLAN_MAP_UNIFICATION_2026-05-08.md §7.4 (Pass 180 master-builder additions to §6).
**Pass:** Co-worker AI Pass 11 follow-up — T-C track per audit-AI authorization 2026-05-08.
**Method:** file-and-line read against repo HEAD (commit `96916ae0`); ripgrep sweep for regression patterns across `src/`.

## Item 13 — Pass 175 `liveRemainingEtaLabel` "N min" suffix

| # | Site | Expected | Actual | Result |
|---|---|---|---|---|
| 13.a | `src/app/hooks/shopDirectoryNavigationDerived.ts:173` | `` `${Math.round(remainingDurationSeconds / 60)} min` `` | `` `${Math.round(remainingDurationSeconds / 60)} min` `` | **PASS** |
| 13.b | `src/app/components/shop/ShopDirectoryGuidanceCard.tsx:291` | `` `${selectedRoute.estimatedDurationMinutes} min` `` | `` `${selectedRoute.estimatedDurationMinutes} min` `` | **PASS** |
| 13.c | `src/app/hooks/shopDirectoryNavigationDerived.test.ts:180` | `expect(result.liveRemainingEtaLabel).toBe("15 min")` | `expect(result.liveRemainingEtaLabel).toBe("15 min")` | **PASS** |
| 13.d | Repo-wide regression sweep — `${...DurationMinutes}m` / `}m\b` short-suffix on time values | zero remaining instances | **`src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx:176`** still renders `{route.estimatedDurationMinutes}m` for the route-alternatives chip row (Fastest / Balanced / Local roads). Reads as "15m" / "23m" — same bug class as KI-162. | **FAIL** |

**Net for Item 13:** REGRESSION — Pass 175 fix shipped to 2 of 3 surfaces. The route-alternatives chip retained the unfixed pattern. Likely also explains part of KI-169's "1005m / 853.4 mi" observation if `route.estimatedDurationMinutes` ever returns a duration value rendered as the top-line of the chip (the sibling `route.totalDistanceLabel` renders below as the real distance, so a duration "1005m" stacked on top of a distance label is exactly the audit symptom).

**Recommended follow-up (NOT shipped this track per dispatch — verification only):** apply the same Pass 175 swap at `ShopDirectoryRoutePreviewCard.tsx:176`: `{route.estimatedDurationMinutes}m` → `{route.estimatedDurationMinutes} min`. 1-line, semantic-equivalent, no behavior change. Promote to next-pass commit list under either KI-162 reopen or as a KI-162-companion entry.

## Item 14 — Pass 176 single-source maneuver text via `nextInstruction={null}`

| # | Site | Expected | Actual | Result |
|---|---|---|---|---|
| 14.a | `src/app/components/landing/CoverageActiveNavigationLayout.tsx:325` | `nextInstruction={null}` | `nextInstruction={null}` | **PASS** |
| 14.b | `src/app/components/maps/MapNavigationHud.tsx:112-119` | maneuver block gated on truthy `nextInstruction` | `{nextInstruction ? (<div ...>...{nextInstruction}</div>) : null}` at L112-L119 | **PASS** |
| 14.c | Other `nextInstruction={...}` consumers preserve their pass-through (per KI-161 fix-shipped note: only the active-nav surface gates to null; preview/browse modes keep the HUD maneuver) | preserved | All 11 other consumers pass real values: `MapLibreServiceCoverageMap` (engine pass-through), `CoverageBrowseExperience` (preview), `OperatingRegionsSection` (inline preview), `ShopDirectoryListBody`, `ShopDirectoryScreen`, `ShopDirectoryHybridMapSection`, `ImmersiveMapViewport`, `ShopDirectoryImmersiveMap`, `ShopDirectoryMapOverlays` — all read `navigation.nextStep?.instruction ?? null` or `routePanel.nextInstruction`. Active-nav layout is the lone gate-to-null. | **PASS** |

**Net for Item 14:** PASS. KI-161 fix preserved across the surface set. No regression observed.

## Summary

| Item | Status | Action required |
|---|---|---|
| 13 | **FAIL** | Apply Pass 175 swap at `ShopDirectoryRoutePreviewCard.tsx:176` in next pass; reopen KI-162 or file companion KI |
| 14 | **PASS** | None |

**Evidence file complete.** ≤80 lines target met. Hand-back to audit AI for fold into next-pass dispatch.
