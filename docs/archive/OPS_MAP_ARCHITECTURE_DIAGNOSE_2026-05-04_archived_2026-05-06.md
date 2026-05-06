# Map Architecture Diagnose 2026-05-04 (OPS)

**Authority level:** OPS — read-only architectural audit of the BidOnDent map system. **No code edits this commit.** No refactors. No KI invented without evidence.

**Last updated:** 2026-05-04

**Phase context:** Phase 5 of v3.3 master plan per [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md). Read-only diagnose to inform Phase 6/6.5/7/7.5/8/8.5 execution.

**Companion docs:**

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — layer model + budgets (this diagnose audits against it)
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — map strategy + product law
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon (LOCKED, NOT touched by this audit)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI ledger; this audit references existing KIs and DOES NOT invent new ones

**Method:** Static code audit (grep + Read). No runtime inspection. No Playwright. Build state verified at commit `29ffbdae` (Phase 4.5 close, 3818.49 KiB precache stable).

---

## TL;DR

The map system is **architecturally sound at the file level** but has **one systemic cross-layer flow violation** that will need a coordinated fix before Phase 8 ships: **~30+ L2 components import L4 services directly**, bypassing the L3 orchestration layer that `LAW_LAYERED_ARCHITECTURE.md` requires.

This is grandfathered (the charter explicitly excluded existing files). It is **not a fire** — the code works. But Phase 8's L3/L4 boundary work needs an explicit plan before any refactor lands. **`PLAN_MAP_L3_L4_BOUNDARY.md` is recommended but not written this commit** — owner reviews this diagnose first per the relay's "don't force it" rule.

No P0/P1 findings. No new KI entries created. **Map system is shippable as-is.** Phase 8 is the cleanup phase, not a rescue.

---

## Inventory

### components/maps/ — 42 files

| Category                    |                                                                                                                                                                                                           Files |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| MapLibre integration shells |                                                      6 (MapLibreReportLayer, MapLibreServiceCoverageMap, MapLibreCoverageMapLayers, MapLibrePartnerShopLayer, MapLibreDiscoveryPlaceLayer, mapLibreControllers) |
| Map UI overlays + controls  |                                               8 (MapSurfaceControls, MapSurfaceStatusBar, MapSurfaceHeaderBadges, MapNavigationHud, MapBidSheet, ReportLayerPopup, ReportDetailDrawer, NavigationErrorBoundary) |
| Command center subtree      |                     8 (CoverageNavigationPlanner, CoverageCommandCenterHeader, CoverageCommandCenterSidebar, PlannerVoiceGpsSettings, PlannerRoutePreview, PlannerAddressSearch, PlannerDiagnosticsPanel, etc.) |
| Navigation subtree          | 7+ (NavigationDeviationPrompt, NavigationBrowseDiscoveryPanel, NavigationSavedPlacesPanel, NavigationDiscoveryPlacesList, NavigationVoiceControlsSheet, NavigationSettingsSheet, NavigationTurnListSheet, etc.) |
| Helpers / themes / types    |                                                                          6 (mapSurfaceTheme, mapLibreStyles, mapLibreHelpers, mapRoutePresentation, mapLibreServiceCoverageMapHelpers, serviceCoverageMapTypes) |
| Performance + diagnostics   |                                                                                                                                                               2 (useMapPerformanceTracking, useReportLayerData) |
| Other                       |                                                                                                                                                                                        5 (other minor surfaces) |

### services/navigation/ — ~30 files

Substantial L4 navigation service surface: address search, geocoding client, navigation session, navigation session cloud sync, place discovery, parked car location, navigation preferences, share ETA, voice support, external navigation, etc. Plus diagnostics check files (`*.check.ts`) and tests.

### Map-relevant L3 hooks — 32 files in `src/app/hooks/`

`useShopDirectory*` (10 hooks), `useNavigation*` (7 hooks), `useCoverage*` (3 hooks), `useReportLayer*` (in maps/), `useOperatingRegionsCoverage`, `useSavedNavigationLocations`, `useUserGeolocation`, plus shop/insurer notification hooks that touch map data.

---

## File-size budget audit (vs LAW_LAYERED_ARCHITECTURE)

| Layer  | Soft | Hard | Findings in map system                                                                                                                                                                                                                                        |
| ------ | ---: | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1** |  200 |  400 | None — all map L1 files (themes, styles, helpers) within budget                                                                                                                                                                                               |
| **L2** |  400 |  600 | All under hard limit. MapLibreReportLayer.tsx (413) is largest — slightly over soft, well under hard. NavigationBrowseDiscoveryPanel (378), PlannerRoutePreview (376), NavigationSavedPlacesPanel (375), MapLibreServiceCoverageMap (348) all in healthy zone |
| **L3** |  300 |  500 | **1 violation: `useOperatingRegionsCoverage.ts` 512 LOC** — exceeds L3 hard limit. **Already grandfathered** in `LAW_LAYERED_ARCHITECTURE.md` "Known existing exceptions" + tracked as P3-tier. No new ledger entry needed.                                   |
| **L4** |  300 |  500 | All under hard limit (check sample: navigationSessionCloudService is large but stayed under 500 last verified)                                                                                                                                                |

**Verdict:** Healthy. Only 1 budget violation, already grandfathered. No P-rank action required.

---

## Cross-layer flow audit (the load-bearing finding)

### What `LAW_LAYERED_ARCHITECTURE.md` requires

> "A screen never imports from `services/` directly — it imports a hook from `hooks/` or a feature from `features/`, which imports from `services/`."

L2 → L4 direct imports are forbidden flows.

### What the codebase actually does

`grep -rE "from [\"'].*services/(supabase|navigation|intelligence|realtime)" src/app/components/` (excluding `type` imports and tests) returns **30+ instances** across L2 surfaces:

| L2 surface                                                                                                                                                                | L4 service imported directly                                                                                                                        | Count                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `components/maps/useReportLayerData.ts`                                                                                                                                   | `services/supabase/reports`, `services/supabase/bids`, `services/supabase/map`, `services/supabaseService`                                          | 4                        |
| `components/dashboard/DashboardCoveragePanel.tsx`                                                                                                                         | `services/navigation/savedLocations`, `services/navigation/navigationSession`, `services/navigation/voiceSupport`, `services/supabase/map`          | 4                        |
| `components/dashboard/{Customer,Shop,Insurer}MapWidget.tsx`                                                                                                               | `services/supabase/map` (haversineMiles, zipToCoordinates)                                                                                          | 3                        |
| `components/shop/{LikedShopsScreen,ShopRequestsScreen,etc.}.tsx`                                                                                                          | `services/intelligence/shopMapExperience`, `services/supabase/map`, `services/supabaseService`                                                      | 6+                       |
| `components/insurer/InsurerClaimsScreen.tsx` + `InsurerPartnerShopCard.tsx` + `InsurerPartnerShopsScreen.tsx`                                                             | `services/supabase/map`, `services/intelligence/shopMapExperience`                                                                                  | 3+                       |
| `components/landing/CoverageMapDialog.tsx` + `CoverageActiveNavigationLayout.tsx` + `CoverageBrowseExperience.tsx` + `BusinessInquirySection.tsx` + `WaitlistCapture.tsx` | `services/navigation/voiceSupport`, `services/navigation/shareEta`, `services/supabase/map`, `services/supabase/intake`, `services/supabase/client` | 5+                       |
| `components/maps/MapLibreCoverageMapLayers.tsx` + `MapLibreDiscoveryPlaceLayer.tsx` + `MapLibreReportLayer.tsx`                                                           | `services/navigation/placeDiscovery` (TYPE imports — these are legitimate, the rule allows type-only L4 ref)                                        | 3 (legitimate type-only) |

**Total non-type-only L2 → L4 imports: ~30**

### Severity classification

| Severity  | Definition                                                                             | Map-system finding                                                                                       |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **P0**    | LAW violation that breaks production                                                   | None                                                                                                     |
| **P1**    | LAW violation visible to users                                                         | None                                                                                                     |
| **P2**    | LAW violation affecting code stability                                                 | None                                                                                                     |
| **P3**    | Architectural smell that should be fixed in a coordinated phase, not opportunistically | **The L2 → L4 systemic pattern.** Grandfathered status confirmed; refactor is Phase 8 territory minimum. |
| **P4–P7** | Minor / cosmetic / aspirational                                                        | None for cross-layer; see budget audit above for KI-107 reference                                        |

**Why P3, not lower:** the pattern is consistent (every L2 surface that needs L4 data imports L4 directly), and the codebase WORKS. But the LAYERED_ARCHITECTURE charter exists precisely to prevent this from being permanent. Phase 8 needs a coordinated cleanup or this charter becomes aspirational.

**Why not P2:** No production breakage. No user-visible regression. No security implication. The pattern is strongly typed and the imports are explicit — refactoring is mechanical, not perilous.

---

## L3 hook coverage gap

The 30+ L2 → L4 imports happen because the **L3 hook layer is incomplete for map data flows.** Specifically:

- `services/supabase/map` exposes `zipToCoordinates`, `haversineMiles`, `geocodeAddress` directly. **No L3 hook wraps these** as `useZipCoordinates`, `useHaversineMiles`, etc. Each L2 widget reaches into L4 instead.
- `services/navigation/voiceSupport` exposes `primeVoiceEngine`. **No L3 hook wraps this**; landing surfaces call the service directly.
- `services/intelligence/shopMapExperience` exposes `buildShopMapListings`, `getRoleCollectionTitle`, etc. **Each L2 surface that needs them imports directly.** This module is the most concerning because it has business logic (role-aware shop ranking) — L3 wrapping would let Phase 8 swap or test it cleanly.

**Concrete L3 hook wrappers that would close the gap (proposed, NOT being built this commit):**

1. `useGeoCoordinates(zip: string)` — wraps `zipToCoordinates` + caches the result
2. `useHaversineDistance(originLat, originLng, destLat, destLng)` — wraps `haversineMiles`
3. `useShopMapListings(role)` — wraps `buildShopMapListings` + `getRoleCollectionActionLabels` + `getDefaultMapCenter` (the trio currently imported piecewise)
4. `useNavigationVoicePriming()` — wraps `primeVoiceEngine` + handles autoplay-policy edge cases
5. `useReportLayerData()` — already exists at `components/maps/useReportLayerData.ts` but lives in L2 path; should move to `hooks/` and import L4 from there

These would shrink the L2 → L4 import surface from 30+ to ~5 (the L3 hooks themselves).

---

## Provider boundary audit

Current provider stack (verified in `package.json` + Phase 4.5 charter):

| Provider           | Role            | Lock state       |
| ------------------ | --------------- | ---------------- |
| **MapLibre GL JS** | Tile renderer   | LOCKED — no swap |
| **OSRM**           | Routing engine  | LOCKED — no swap |
| **Nominatim**      | Geocoding       | LOCKED — no swap |
| **Overpass**       | POI / discovery | LOCKED — no swap |

**No new providers introduced. No removal proposed.** Stack is stable. Phase 8.5 ambient/idle motion + Phase 8 L3/L4 boundary work both stay within the current provider set.

**Future-only escape clause:** `PLAN_PRODUCT_FUTURE_CARDS.md` "CARD: Provider Evolution" notes provider swap is **NOT** under consideration without specific trigger (rate limits, feature gap, business justification). Phase 5 confirms: no triggers fired.

---

## Demo data isolation

Demo data lives in:

- `src/app/components/landing/coverageData.ts` — landing demo (KI-099 / KI-100 territory)
- `src/app/components/maps/MapBidSheet.tsx` — has fallback demo state for unhydrated routes
- `src/app/components/maps/mapRoutePresentation.ts` — KI-052 honesty thresholds (no longer fabricates demo durations — verified in Phase 2)
- `src/app/components/maps/MapLibrePartnerShopLayer.tsx` — partner shop fallback list
- `src/app/services/intelligence/marketIntelligence.ts` — market intelligence demo data
- `src/app/components/maps/serviceCoverageMapTypes.ts` — type guards for demo vs real

**Audit verdict:** Demo data is **clearly labeled and isolated** per the Map Master Plan rule. The KI-099/KI-100 mitigation around "demo shop data shown as real recommendations" already shipped — those KIs document the current state. **No new demo-data isolation finding.**

---

## Mobile vs desktop divergence

Audited for which map surfaces have mobile-specific codepaths:

| Surface                                          | Has mobile branch?                          | Notes                                                                                  |
| ------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `MapLibreReportLayer`                            | Yes (responsive)                            | Touch-target compliance verified in Phase 4 audit                                      |
| `CoverageBrowseExperience`                       | Yes — explicitly via `lg:block`/`md:hidden` | 372px overlay panel desktop-only (Phase 4 audit confirmed safe)                        |
| `CoverageCommandCenter*`                         | Limited                                     | Command center is primarily desktop chrome; mobile viewport may need Phase 6 attention |
| `Navigation*Sheet` (Voice / Settings / TurnList) | Yes — `max-w-[440px]` patterns              | Used as bottom sheets on mobile, dialogs on desktop                                    |
| `MapBidSheet`                                    | Yes — `max-md:fixed max-md:bottom-0`        | Mobile bottom-sheet pattern correctly applied                                          |

**Verdict:** Mobile divergence is consistent and well-applied. Phase 4 audit already addressed touch-target gaps. No new mobile-divergence finding for the map system.

---

## Findings table (severity-ranked)

| #   | Severity          | Finding                                                                                                                                                        | Recommended phase                      | Notes                                                                                               |
| --- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | **P3**            | ~30 L2 surfaces import L4 services directly, bypassing L3 orchestration layer required by `LAW_LAYERED_ARCHITECTURE.md`                                        | Phase 8 (L3/L4 boundary)               | Grandfathered; charter explicitly excluded existing files. Concrete L3 hook proposals listed above. |
| 2   | **P3** (existing) | `useOperatingRegionsCoverage.ts` at 512 LOC exceeds L3 hard limit (500)                                                                                        | Owner-named only                       | Already grandfathered; tracked in `LAW_LAYERED_ARCHITECTURE.md` "Known existing exceptions"         |
| 3   | **P5**            | `services/intelligence/shopMapExperience` has business logic (role-aware shop ranking) that callers reach into directly. Higher coupling than ideal.           | Phase 8 (alongside #1)                 | Wrapping in `useShopMapListings(role)` L3 hook unblocks future testing/swap                         |
| 4   | **P6**            | Command-center subtree (8 files) and navigation subtree (7+ files) are monolithic by convention rather than enforced — could grow toward sub-folder discipline | Phase 7 (which targets shop directory) | Same pattern emerging in shop/. Not urgent; flag for Phase 7 sub-folder split discussion            |

**Total findings: 4. P-distribution: 0 / 0 / 0 / 2 / 0 / 1 / 1 / 0 (P0/P1/P2/P3/P4/P5/P6/P7).**

---

## Decision: write `PLAN_MAP_L3_L4_BOUNDARY.md` now? — NO

Per relay prompt: _"If diagnose surfaces a clear L3/L4 boundary worth pre-declaring before Phase 8 execution, write the conditional `PLAN_MAP_L3_L4_BOUNDARY.md`. If not, skip — don't force it."_

**Skipping the PLAN doc this commit.** Reasoning:

1. **Owner review first.** This diagnose surfaces a P3 systemic pattern that's been grandfathered. Pre-locking Phase 8 scope before owner reads the diagnose risks scope creep into "boundary refactoring" territory the owner didn't authorize.
2. **The proposed L3 hook wrappers are specific enough** (Section "L3 hook coverage gap" above) that the owner can review them inline and decide whether Phase 8 should target all 5, a subset, or a different sequence.
3. **The findings are P3, not P1.** No urgency. Code works. Phase 8 can spend a planning step on the boundary doc if/when the owner authorizes — owner-named only.
4. **PLAN_DOC_INDEX_BY_PHASE.md retains the row** for `PLAN_MAP_L3_L4_BOUNDARY.md` as conditional. If/when a future Phase 5.x or Phase 8 prep authorization fires, that doc gets written then.

Phase 5 closes here. Phase 6+ is owner-gated per the relay re-authorization clause.

---

## What this audit does NOT do

- Does NOT touch any code. Read-only.
- Does NOT touch MOLANDJESUS (structural lock holds; this audit doesn't even need the controlled-edit clause because it cross-refs MOLANDJESUS rather than amending).
- Does NOT invent new KI entries. KI-107 (HeroSection grandfathered) and KI-099/KI-100 (demo data) are referenced; no KI-108+ created.
- Does NOT refactor opportunistically. The 30+ L2 → L4 imports stay as-is until Phase 8 explicitly targets them.
- Does NOT pre-lock Phase 8 scope. PLAN_MAP_L3_L4_BOUNDARY remains conditional.

---

## Cross-references

- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 5 row updated this commit
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — the charter this audit measures against
- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — Phase 4.5 charter (sister doc)
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — map strategy + product law
- [`PLAN_PRODUCT_FUTURE_CARDS.md`](PLAN_PRODUCT_FUTURE_CARDS.md) — provider evolution card (no triggers fired)
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED, NOT touched)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-052 family (closed), KI-099/KI-100 (demo data), KI-107 (HeroSection P3)
