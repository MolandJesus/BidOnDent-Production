# Engine-Wrapper × Surface Matrix (Co-Worker AI scratchpad)

**Author:** Co-worker AI (Cowork session, full folder access).
**Date:** 2026-05-08, post-Pass-12 (audit AI built KI-164/166 fix; uncommitted on disk pending lock clear).
**Trigger:** audit AI Pass 12 hand-back §C suggested I verify `MapLibreDashboardMapPreview.tsx` consumer surfaces and stage an engine-surfaces matrix.
**Scope:** every JSX mount of every MapLibre `<Map>` engine wrapper in `src/`. Verified by grep + manual mount-vs-import check (false positives stripped).
**Purpose:** evidence input for master-builder reply on plan-doc §1.4/§1.5 fork (now 3-engine confirmed).

---

## Engine wrappers — three confirmed

Each file directly imports `Map` from `react-map-gl/maplibre` and renders `<Map>` JSX:

| Engine wrapper | File | Lines | `<Map>` instantiation | Layer (per LAW_LAYERED_ARCHITECTURE) |
|---|---|---|---|---|
| `MapLibreServiceCoverageMap` | `src/app/components/maps/MapLibreServiceCoverageMap.tsx` | 368 | L267 | L2 (composed UI) |
| `MapLibreShopDirectoryMapPane` | `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx` | 531 | L286 | L2 (composed UI) |
| `MapLibreDashboardMapPreview` | `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx` | 273 | L156 | L2 (composed UI) |

No other file in `src/` imports `Map` from `react-map-gl/maplibre` and renders it. Confirmed via repo-wide regex sweep.

---

## Surface mounts per engine (verified mount sites only)

False-positive filter: a file is only a "mount site" if it actually renders the engine as JSX (`<EngineName ...>`), not merely imports the symbol. Type-only imports and utility-shared comments are stripped.

### Engine A — `MapLibreServiceCoverageMap` (3 mount sites)

| # | Mount site | Folder | Notes |
|---|---|---|---|
| A.1 | `src/app/components/landing/CoverageActiveNavigationLayout.tsx` | landing | Active turn-by-turn nav surface |
| A.2 | `src/app/components/landing/OperatingRegionsSection.tsx` | landing | Inline-on-landing surface; KI-053 lazy-mount lives here |
| A.3 | `src/app/components/landing/CoverageBrowseExperience.tsx` | landing | Inside CoverageMapDialog when `presentationMode === "browse"`; KI-172 banner here |

### Engine B — `MapLibreShopDirectoryMapPane` (2 mount sites)

| # | Mount site | Folder | Notes |
|---|---|---|---|
| B.1 | `src/app/components/shop/ShopDirectoryHybridMapSection.tsx` | shop | Aliased import: `import ShopDirectoryMapPane from "...MapLibreShopDirectoryMapPane"`. Rendered at L119 |
| B.2 | `src/app/components/shop/ImmersiveMapViewport.tsx` | shop | Same aliased import. The KI-164/166 host file (`MapPaneLegendPanel.tsx`) is mounted INSIDE this engine's overlay system via `ShopDirectoryMapPaneOverlays.tsx:294` |

False-positive removed: `src/app/components/shop/ShopDirectoryMapPopup.tsx` imports related types but does NOT render `<ShopDirectoryMapPane>`. Stripped.

### Engine C — `MapLibreDashboardMapPreview` (14 mount sites)

| # | Mount site | Folder | Notes |
|---|---|---|---|
| C.1 | `src/app/components/dashboard/CustomerMapWidget.tsx` | dashboard | Customer dashboard mini-map — likely the surface plan doc §3 calls "dashboard-mini" |
| C.2 | `src/app/components/dashboard/ShopMapWidget.tsx` | dashboard | Shop dashboard mini-map |
| C.3 | `src/app/components/dashboard/InsurerMapWidget.tsx` | dashboard | Insurer dashboard mini-map |
| C.4 | `src/app/components/shop/LikedShopsScreen.tsx` | shop | Liked-shops list with map |
| C.5 | `src/app/components/shop/ShopRequestsScreen.tsx` | shop | Shop's incoming requests list with map |
| C.6 | `src/app/components/shop/ShopActiveJobsScreen.tsx` | shop | Active-jobs list with map |
| C.7 | `src/app/components/codelayer/BidsGeographyMap.tsx` | codelayer (legacy) | Bid geography overview |
| C.8 | `src/app/components/codelayer/report/StepServiceLocation.tsx` | codelayer/report | Report wizard — service location step |
| C.9 | `src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx` | codelayer | Bid acceptance confirmation sheet (uses `motion/react` per LAW_ANIMATION_AND_ATMOSPHERE envelope) |
| C.10 | `src/app/components/insurer/InsurerClaimsScreen.tsx` | insurer | Insurer claims list with map |
| C.11 | `src/app/components/insurer/InsurerPartnerShopsScreen.tsx` | insurer | Insurer partner-shops view with map |
| C.12 | `src/app/components/reports/CompetitorAnalysisScreen.tsx` | reports | Competitor analysis screen |
| C.13 | `src/app/components/reports/ReportsListScreen.tsx` | reports | Reports list with map |
| C.14 | `src/app/components/reports/ReportDetailScreen.tsx` | reports | Single-report detail with map |

False-positive removed: `src/app/components/codelayer/BidsScreen.tsx` is import-only (no JSX render). `src/app/utils/geoCircle.ts` is a comment reference (line 3: "Shared between MapLibreDashboardMapPreview and MapLibreShopDirectoryMapPane"), not a consumer.

---

## Aggregate counts vs. plan doc framing

| Source | Engine count | Surface count |
|---|---|---|
| `PLAN_MAP_UNIFICATION_2026-05-08.md` §1 (5-surface framing) | 1 (`MapLibreServiceCoverageMap` named) | 5 (CoverageBrowseExperience, CoverageMapDialog, OperatingRegionsSection, MapLibreServiceCoverageMap [as surface], ShopDirectoryImmersiveMap) |
| `PLAN_MAP_UNIFICATION_2026-05-08.md` §3 (host-configurations table) | implied 1 | 4 hosts (dashboard-fullscreen, landing-dialog, shop-directory-immersive, dashboard-mini) |
| **Repo HEAD reality** | **3 engine wrappers** | **19 verified mount sites** (3 + 2 + 14) |

Gap: plan doc §1 catalogs ~5 surfaces; reality is 19. Plan doc §1 names 1 engine; reality is 3.

---

## Implications for plan-doc fork (master-builder pending)

1. **Engine-axis becomes the natural primary frame.** Audit AI's §C-revised recommendation flipped to "(c) hold for owner" because the strategic choice is "1 engine + 1 shell" vs "N engines + 1 shell." With 3 engines and 19 surfaces, the latter is materially cheaper than forcing convergence in this hardening phase.
2. **Step E reframed as a third engine convergence pass.** The plan doc treats Step E ("operating-regions-inline + dashboard-mini") as a degenerate case of `MapLibreServiceCoverageMap`. Reality: dashboard-mini uses `MapLibreDashboardMapPreview` engine (14 surfaces). Step E is the WIDEST migration surface in the plan, not the narrowest.
3. **Step C / Step F coupling is real.** Both target Engine B (`MapLibreShopDirectoryMapPane`). Either combine into a single shop-directory engine migration, or sequence with explicit shared-state checkpoints.
4. **Step D (landing-dialog) is the only truly independent migration.** It targets Engine A (`MapLibreServiceCoverageMap`), which is independent of Engines B and C.
5. **The shell unification value proposition holds regardless.** "One `<MapProgramShell>` + slot contract" can wrap any of the three engines. Engine convergence is a separate strategic decision; shell unification can proceed engine-agnostic.

## Recommended migration sequence under the 3-engine reality (no plan-doc commitment yet)

**Phase 1 — Shell extraction (engine-agnostic).**
- Step A: extract `MapProgramTopBar` (top-bar union across all 3 engines).
- Step B: extract `MapProgramUtilityCluster` (locate-me, recenter, compass, zoom).

**Phase 2 — Per-engine shell adoption (one engine per pass).**
- Phase 2a: Engine A (`MapLibreServiceCoverageMap`) adopts `<MapProgramShell>` across its 3 surfaces.
- Phase 2b: Engine B (`MapLibreShopDirectoryMapPane`) adopts shell across its 2 surfaces. KI-164/166 fix lives here (already shipped on disk pending commit per Pass 12).
- Phase 2c: Engine C (`MapLibreDashboardMapPreview`) adopts shell across its 14 surfaces. Largest blast surface; goes last.

**Phase 3 — Engine convergence (owner-gated).**
- If owner picks "1 engine + 1 shell," a separate Phase 3 spike investigates engine convergence per audit AI's Pass 180 §7.3.2 path (promoting capabilities into a shared canvas vs. forking the engine).
- If owner picks "N engines + 1 shell," Phase 3 doesn't happen.

This sequence is engine-axis-honest, respects the 19-surface reality, and keeps the shell unification deliverable independent of the engine-convergence strategic decision.

---

## Cross-references

- `PLAN_MAP_UNIFICATION_2026-05-08.md` §1.1-§1.5 (current surface inventory — incorrect / incomplete per this matrix)
- `PLAN_MAP_UNIFICATION_2026-05-08.md` §3 (host-configurations table — partially aligned; covers dashboard-mini implicitly)
- `PLAN_MAP_UNIFICATION_2026-05-08.md` §4 Step C, Step E, Step F (sequencing affected by 3-engine reality)
- `PLAN_MAP_UNIFICATION_2026-05-08.md` §7.3.2 (audit AI Pass 180 master-builder review on F.1 spike — engine convergence path applies regardless)
- Audit AI Pass 12 hand-back §C (recommendation flipped to "hold for owner")
- Co-worker AI evidence-refinement to audit AI mid-dispatch (third engine flagged 2026-05-08)
- LAW_LAYERED_ARCHITECTURE.md (engine wrappers all sit at L2; canvas extraction goes to `engine/` sub-folder per Pass 180 §7.1)

**Matrix complete.** Engine-axis evidence locked. Ready for citation by full Pass D plan-doc draft once master-builder fork response lands.
