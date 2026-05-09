# Pass D — KI Surface-Area Summary (Engine-Attributed)

**Author:** Co-worker AI (Cowork session, full folder access).
**Date:** 2026-05-08, post-Pass-13-staged (audit AI staged ShopDirectoryRoutePreviewCard.tsx:176 fix on disk).
**Trigger:** T-A track from co-worker parallel-track dispatch + audit-AI Pass 12 §F.1 suggestion to expand LAW + REF read for additional Pass-D-relevant KIs.
**Scope:** the 10 KIs cited in the original T-A list (140, 145, 147, 158, 161, 162, 163, 167, 168, 169), each annotated with engine attribution per the ENGINE_SURFACES_MATRIX evidence file.
**Engine-count-neutral:** does not depend on master-builder resolution of the §1.4/§1.5 fork. Engine attribution is structural and invariant under (a-revised) / (b) / (c).
**Output budget:** ≤200 lines.

---

## Per-KI summary

### KI-140 — Mobile Smart Shop Map legend overlay too dense (P2-UX) — **RESOLVED Pass 78**

- **Engine attribution:** Engine B (`MapLibreShopDirectoryMapPane`). Legend mounts via `ShopDirectoryMapPaneOverlays.tsx:294` inside `MapPaneBottomOverlay`, rendered above the engine canvas of B.1 (`ShopDirectoryHybridMapSection`) + B.2 (`ImmersiveMapViewport`).
- **File:** `src/app/components/shop/MapPaneLegendPanel.tsx` (originally 206 lines; now 247 post-Pass-12 KI-164/166 fix).
- **Pass-D-impact:** P0-PRECEDENT. The Pass 78 `density="compact"` collapse-to-pill pattern is the precedent Pass 12 just extended to default density to close KI-164/166. Pass D's Engine-B shell adoption inherits this surface; no further change needed beyond ensuring the collapse persists through shell migration.
- **Pass D action:** carry the localStorage-persisted collapse-default state through the shell migration; verify expanded state still renders cleanly inside `<MapProgramShell>` `legend` slot.

### KI-145 — Drop 3 duplicate indexes on `kv_store_85e96b22` (P3-INFRA) — **RESOLVED Pass 6 (2026-05-07)**

- **Engine attribution:** **NONE** (L4 database-tier; not engine-bound). Mentioned only because audit AI's safe-fix authority precedent for KI-145 is the lineage that authorizes KI-159/KI-160 future passes.
- **File:** N/A (DB-only via Supabase MCP).
- **Pass-D-impact:** P4-CONTEXT. No surface intersection.
- **Pass D action:** none; cite as audit-AI safe-fix authority precedent if/when KI-159/KI-160 ship.

### KI-147 — Fullscreen map mode does not exit on ESC (P2-A11Y) — **RESOLVED Pass 81**

- **Engine attribution:** Engine B (`MapLibreShopDirectoryMapPane`). Wired into `ShopDirectoryScreen.tsx` at the top level (B's parent screen), gated by `session.isImmersive`.
- **File:** `src/app/components/shop/ShopDirectoryScreen.tsx` (uses shared `useEscapeKey` hook from `src/app/hooks/useEscapeKey.ts`).
- **Pass-D-impact:** P0-PRECEDENT for cross-engine ESC pattern. When Pass D's shell mounts at the dashboard-fullscreen surface (Engine B per KI-164 host pinpoint), the ESC handler must continue to fire at the shell-host level, not be displaced by the shell's own keyboard handling. Pattern: shell does not own ESC; surface-host owns ESC.
- **Pass D action:** verify `<MapProgramShell>` does NOT install a global ESC handler; ESC remains the host's responsibility per Pass 81 pattern.

### KI-158 — handle_updated_at search_path lock wiped on cold start (P2-SECURITY-DRIFT) — **SOURCE-PATCHED Pass 174 (owner deploy pending)**

- **Engine attribution:** **NONE** (L4 edge-function-tier). Not engine-bound; cold-start bootstrap loop in `database_init.tsx`.
- **File:** `supabase/functions/server/database_init.tsx:56-63` + `supabase/migrations/20251230000001_full_schema.sql:22-28`. Source-patched; awaiting owner edge-function v51 deploy.
- **Pass-D-impact:** P4-CONTEXT. No surface intersection. Cited only because audit AI flagged it among the OPEN-pending KIs with security implications worth tracking through any pre-launch hardening pass.
- **Pass D action:** none.

### KI-161 — Active navigation duplicate maneuver text (P1-CONTENT) — **RESOLVED Pass 176**

- **Engine attribution:** Engine A (`MapLibreServiceCoverageMap`). Fix applied at `CoverageActiveNavigationLayout.tsx:325` (an A-engine consumer surface) by passing `nextInstruction={null}` to suppress duplicate render in `MapNavigationHud`. The HUD is engine-adjacent — mounted inside the engine wrapper at `MapLibreServiceCoverageMap.tsx:241` and gated on `nextInstruction` truthiness at `MapNavigationHud.tsx:112-119`.
- **Files:** `CoverageActiveNavigationLayout.tsx:325` (gate), `MapNavigationHud.tsx:112-119` (consumer).
- **Pass-D-impact:** P1-PRESERVE. Pass D's shell migration MUST keep the gate at the surface level. If `MapNavigationHud` lifts to shell `rightPanel` slot per plan-doc feature-transfer matrix #11, the slot owner (CoverageActiveNavigationLayout) must continue to gate `nextInstruction` at the slot props boundary.
- **Pass D action:** when lifting `MapNavigationHud` to shell `rightPanel`, preserve the `nextInstruction` prop as a gateable input. Anti-regression test: render a navigation surface with `<NavigationActiveManeuverCard>` mounted; verify the HUD does NOT render the duplicate.

### KI-162 — `liveRemainingEtaLabel` "Nm" instead of "N min" (P1-CONTENT) — **PARTIAL-RESOLVED (Pass 175 covered 2 of 3); Pass 13 staged for L176 closure**

- **Engine attribution:** Cross-engine — affects Engine B (shop-directory family) and Engine C (dashboard mini-map via display chip mounting). The `liveRemainingEtaLabel` originates in `shopDirectoryNavigationDerived.ts:173` (an L3 hook used across shop screens — Engine B + Engine C surfaces alike). The route-options chip at `ShopDirectoryRoutePreviewCard.tsx:176` is the unfixed display surface.
- **Files:** `shopDirectoryNavigationDerived.ts:173` (PASS), `ShopDirectoryGuidanceCard.tsx:291` (PASS), `ShopDirectoryRoutePreviewCard.tsx:176` (FAIL — Pass 13 staged), `shopDirectoryNavigationDerived.test.ts:180` (PASS fixture).
- **Pass-D-impact:** P1-PRESERVE. The Pass 13 swap should land before any Pass D engine adoption to ensure shell migration doesn't carry forward partial fixes. Engine B Phase 2b adoption is a clean cutover only if the L176 swap lands in Pass 13 first.
- **Pass D action:** wait for Pass 13 commit; verify the swap is in HEAD before opening Pass D Phase 2b.

### KI-163 — Active navigation control sprawl across 5 corners (P2-DESIGN) — **OPEN**

- **Engine attribution:** Engine A (`MapLibreServiceCoverageMap`). The `NavigationActionRail` and `MapNavigationHud` mount through A's engine wrapper into A.1 (CoverageActiveNavigationLayout) when `presentationMode === "navigation"`.
- **File:** `src/app/components/maps/navigation/NavigationActionRail.tsx` + sibling sites.
- **Pass-D-impact:** P2-RIGHTPANEL-CONTRACT. Plan doc §3 maps `rightPanel` slot for `dashboard-fullscreen` host to `<MapNavigationHud>` and for `landing-dialog` host to `<CoverageBrowseMapOverlays>`. KI-163's "right-edge vertical toolbar at x:1576" is the `NavigationActionRail` floating outside the right-panel slot. Pass D should plan for `NavigationActionRail` to consolidate into `rightPanel` slot OR sit on the shell as a `utilityCluster` extension. Owner-deferred until master builder picks the structural fix direction.
- **Pass D action:** decide whether `NavigationActionRail` becomes a shell concern (utilityCluster extension) or stays surface-host (rightPanel slot content). Either choice is engine-count-neutral; affects Step C.1 / Step C.2 scope.

### KI-167 — "My Location" preset chip duplicated (P2-CONTENT) — **RESOLVED Pass 177**

- **Engine attribution:** Engine B (`MapLibreShopDirectoryMapPane`). `ShopDirectoryOriginSearch.tsx` mounts inside the shop-directory chrome around Engine B.
- **File:** `src/app/components/shop/ShopDirectoryOriginSearch.tsx:50-58`.
- **Pass-D-impact:** P3-CARRY. Search/discovery affordances move into shell `leftPanel` slot in plan doc §3 for `shop-directory-immersive` host. The `selectedIsUserGeolocation` guard must survive the panel lift.
- **Pass D action:** verify the dedup guard travels with `ShopDirectoryOriginSearch` when it relocates to slot content.

### KI-168 — Smart Shop Map fullscreen entry — three layered transition states (P2-LOADING) — **OPEN**

- **Engine attribution:** Engine B (`MapLibreShopDirectoryMapPane`). Fullscreen entry is the immersive surface (B.2 `ImmersiveMapViewport`) mounting under `ShopDirectoryScreen` route.
- **File:** entry-transition lives across `ShopDirectoryScreen.tsx` + `ShopDirectoryHybridStage.tsx` + the engine wrapper. No single fix-site identified.
- **Pass-D-impact:** P2-LOADING-CONTRACT. Pass D shell extraction is the natural moment to define a unified loading-state contract: spinner-only during engine hydration, no faded ROUTE box / faded legend bar at low opacity during the transition window. The slot contract gives the shell authority over which slots render during loading vs. hydrated states.
- **Pass D action:** define `<MapProgramShell>` loading-state semantics. Either suppress slot rendering until `engineReady === true`, or render slots in a low-opacity overlay that stays consistent across transitions instead of three separately-faded layers.

### KI-169 — Dashboard mini-map ROUTE box mixes meters + miles + 21-hour route (P2-CONTENT) — **PARTIAL (sanity flag SHIPPED Pass 179; display bug + upstream coordinate fix OPEN)**

- **Engine attribution:** Engine C (`MapLibreDashboardMapPreview`). Dashboard mini-map ROUTE box renders through C-engine consumers (CustomerMapWidget, ShopMapWidget, InsurerMapWidget — C.1 / C.2 / C.3).
- **Files:** `src/app/services/intelligence/shopMapRouting.ts` (sanity flag — SHIPPED Pass 179 with `flagImplausibleRoute`); display bug second half lives in route-alternative chip render — likely `ShopDirectoryRoutePreviewCard.tsx:176` (overlap with KI-162-reopen!).
- **Pass-D-impact:** P1-FOLD-CANDIDATE. Audit AI Pass 12 §B suggested folding KI-162-reopen + KI-169 second half into a single Pass 13 commit because the L176 swap mechanically closes the unit-mislabeling for both. With Pass 13 staged, this fold is one commit away. Pass D can treat KI-169 as functionally CLOSED for display purposes once Pass 13 lands; upstream coordinate fix remains separate work.
- **Pass D action:** wait for Pass 13 commit + master-builder fold decision. Engine C Phase 2c shell adoption inherits a clean state once L176 lands.

---

## Aggregate engine attribution (Pass-D-relevant)

| Engine | KIs touching it (open + recently closed) |
|---|---|
| Engine A — `MapLibreServiceCoverageMap` (3 surfaces, landing/) | KI-161 (RESOLVED), KI-163 (OPEN), KI-053 (PARTIAL — covered separately in §6 item 9) |
| Engine B — `MapLibreShopDirectoryMapPane` (2 surfaces, shop/) | KI-140 (RESOLVED), KI-147 (RESOLVED), KI-162 (PARTIAL via shop/ surfaces), KI-164 (RESOLVED Pass 12), KI-165 (HOLD-DOM-INSPECTION), KI-166 (RESOLVED Pass 12), KI-167 (RESOLVED), KI-168 (OPEN), KI-170 (PARTIAL via shell unification), KI-171 (subsumed by KI-170) |
| Engine C — `MapLibreDashboardMapPreview` (14 surfaces) | KI-162 (PARTIAL via dashboard mini-map chip — overlap with Engine B fix shape), KI-169 (PARTIAL) |
| Cross-cutting / non-engine | KI-145 (RESOLVED, DB), KI-158 (SOURCE-PATCHED, edge), KI-159 (OPEN, RLS), KI-160 (OPEN, RLS) |

---

## Pass D scoping observations

1. **Engine B carries the bulk of the open KI surface.** 9 of the 10 cited KIs touch Engine B in some way. This is consistent with the Engine B = "shop-directory family" framing — the immersive fullscreen surface is the densest UI in the product.
2. **Engine A is small-and-stable.** Only KI-161 (RESOLVED) and KI-163 (OPEN) are active. Engine A Phase 2a adoption is the lowest-risk first-engine migration in the proposed sequence.
3. **Engine C has 14 surfaces but only one open KI.** KI-169 second half is the lone meaningful open item, and Pass 13 closes its display half. Engine C Phase 2c is risk-bounded by surface count, not by KI density. The 14 surfaces still mean blast radius is real.
4. **Cross-engine fix shapes** — KI-162's `m → min` swap and KI-118/KI-147's `useEscapeKey` hook both ship across engine boundaries via shared utilities. Pass D must avoid embedding engine-specific copies of these shared concerns into shell internals.
5. **KI-165 remains the lone DOM-inspection-required KI.** Cannot be advanced without a working dev-server tile fetch. Until then, it sits on the Engine B side as an unresolved layout leak that doesn't block Pass D Phase 2b but does block its full closure claim.

---

## Cross-references

- ENGINE_SURFACES_MATRIX.md (this directory) — engine attribution evidence
- PASS_D_LAW_REF_NOTES.md (this directory) — LAW + REF guardrails
- ANTI_REGRESSION_13_14_VERIFICATION.md (this directory) — §6 items 1-12 (post audit AI continuation: 12/12 PASS) + items 13-14 (1 PASS, 1 FAIL routing through KI-162-reopen)
- PLAN_MAP_UNIFICATION_2026-05-08.md §3 host-configurations table + §4 Step C / Step E / Step F sequencing
- REF_KNOWN_ISSUES.md per-KI source

**Surface-area summary complete.** ≤200 lines target met. Engine-attribution column locks the per-KI fix-site relationship to the engine wrapper, regardless of master-builder fork resolution. Ready for Pass D plan-doc draft once §1.4/§1.5 lands.
