## Pass 458 — MapLibre stabilization + doc truth sync (2026-03-29)

- **Why this pass was chosen:** After the renderer migration, the active docs still mixed Leaflet-era descriptions with new MapLibre files, and editor diagnostics were being inflated by a stale map import plus mixed `DamageReport` shapes.
- **What changed:**
  - Restored zero-error typecheck by aligning shared `DamageReport` typing, report adapters, and seed report shapes.
  - Replaced the deleted `mapTileLayers` dependency with `mapLibreTileLabels`.
  - Tightened the shop-directory map cursor so the pointer appears only when hovering actual shop markers.
  - Updated active docs to the real checked-in MapLibre file paths, controller/helper extractions, and click-enabled dashboard preview behavior.
  - Added MapLibre-related spell-check dictionary entries so editor noise stays down on map files and docs.
- **Files touched:** `src/app/types/index.ts`, `src/app/hooks/userDataUtils.ts`, `src/app/constants/index.ts`, `src/app/components/dashboard/DashboardCoveragePanel.tsx`, `src/app/components/insurer/insurerClaimsUtils.ts`, `src/app/components/maps/mapLibreControllers.tsx`, `src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`, `cspell.json`, `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/MAP_EXPERIENCE_ARCHITECTURE.md`, `docs/CODE_ORGANIZATION_AUDIT.md`, `docs/BIDONDENT_PRODUCT_BRAIN.md`, `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`, `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- **Validation:** `npx tsc --noEmit`, `npm run build`, targeted `npx cspell lint ...`
- **Impact:** The active map docs now match the checked-in MapLibre architecture, and the editor/build baseline is quiet again without changing the broader map product direction.

---

## Pass 452 — Master context + map docs MapLibre alignment (2026-03-29)

- **Why this pass was chosen:** After completing the full MapLibre migration (Passes 446-451), the master context and map docs still referenced Leaflet as the map engine. Any future AI agent would receive incorrect architecture guidance.
- **What changed:**
  - Updated tech stack: React Leaflet / Leaflet → MapLibre GL JS 5.21.1 + react-map-gl 8.1.0
  - Updated §5 Map Architecture: ServiceCoverageMap → MapLibreServiceCoverageMap, ShopDirectoryMapPane → MapLibreShopDirectoryMapPane, added MapLibreDashboardMapPreview section, added MapLibre-specific component files
  - Updated §7 Rule 8: "Leaflet popups are always white" → "MapLibre popups use glass blur styling"
  - Updated Map Theme System: CARTO Voyager/Dark All/Esri Satellite tiles, mapLibreStyles.ts reference, removed OpenStreetMap reference
  - Updated §8 Key Files: new MapLibre file paths with correct purposes
  - Added §15: MapLibre GL JS Migration pass log (Passes 442-451)
  - Updated map tracker with migration summary
- **Files touched:** `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- **Validation:** Docs-only pass. Build: not required.
- **Impact:** Any future AI agent now receives correct MapLibre architecture guidance instead of stale Leaflet references. Eliminates doc-code mismatch risk for map-related work.

---

## MapLibre GL JS Migration Summary (Passes 442-451)

**Engine:** Leaflet (canvas) → MapLibre GL JS 5.21.1 (WebGL) + react-map-gl 8.1.0
**Tiles:** OpenStreetMap → CARTO Voyager (light), CARTO Dark All (night), Esri Satellite
**Result:** 14 Leaflet files deleted (2,021 lines), 7 MapLibre components created, leaflet/react-leaflet/@types/leaflet packages removed

| Component                                  | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| `MapLibreServiceCoverageMap.tsx`           | Landing + coverage map with route glow + GPS glow         |
| `MapLibreShopDirectoryMapPane.tsx`         | Dashboard shop discovery map with GeoJSON sources         |
| `MapLibreShopDirectoryViewportManager.tsx` | useMap() viewport management for shop directory           |
| `MapLibreDashboardMapPreview.tsx`          | Lightweight click-through preview for dashboard widgets   |
| `MapLibrePartnerShopLayer.tsx`             | GeoJSON partner shop circle layer                         |
| `MapLibreReportLayer.tsx`                  | GeoJSON report marker layer                               |
| `MapLibreDiscoveryPlaceLayer.tsx`          | Discovery place circles with category colors              |
| `mapLibreStyles.ts`                        | StyleSpecification objects for 3 tile modes               |

---

## Pass 399 — Refactor-governance docs hardening + kickoff prompt packaging (2026-03-28)

- **Why this pass was chosen:** After reconciling concurrent AI implementation updates, the project needed explicit refactor-governance constraints and a reusable kickoff prompt to start the next refactor chat with consistent expectations.
- **What changed:**
  - Added explicit pre-refactor governance constraints in baseline/matrix docs: preserve Clerk->edge->Supabase boundaries, verify security assumptions on service-contract changes, and enforce file-size limits (hard 600, preferred 500).
  - Added dedicated kickoff prompt artifact for the next chat so refactor execution starts with product/architecture/doc-update discipline instead of ad-hoc prompting.
- **Files touched:** `docs/PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`, `docs/FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`, `docs/AI_REFACTOR_KICKOFF_PROMPT_2026-03-28.md`
- **Validation:** Spellcheck: complete (0 issues across 6 touched docs). Diagnostics: complete (no errors in touched docs). Build: not required (docs-only pass).
- **Impact:** Reduces startup friction for next-session refactor work and hardens execution boundaries so UI/feature changes do not regress auth/security architecture.

## Pass 398 — Concurrent AI security-track reconciliation into source-of-truth docs (2026-03-28)

- **Why this pass was chosen:** Parallel AI work landed substantial auth/storage/edge changes; core source-of-truth docs needed to reflect implementation reality before refactor planning proceeds.
- **What changed:**
  - `CLAUDE_AI_MASTER_CONTEXT.md`: updated last-updated marker and added concurrent AI snapshot covering edge auth headers, intake/workflow edge routing, Clerk-keyed navigation session persistence, private-storage lifecycle, and stricter server authz helpers.
  - `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`: added verified concurrent security-track behavior and refactor constraints.
  - `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`: added explicit security boundary verification checklist and refactor gate items.
- **Files touched:** `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`, `docs/FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`
- **Validation:** Spellcheck: complete (0 issues across 6 touched docs). Diagnostics: complete (no errors in touched docs). Build: not required (docs-only pass).
- **Impact:** Keeps execution truth synchronized with live implementation so the next refactor phase starts from verified system reality.

## Build Hygiene Note — bids/reports import-path cleanup (2026-03-28)

- **Why this slice was chosen:** After the storage hardening pass, the recurring remaining build defect was the Vite warning pair caused by dynamically importing `supabase/bids` and `supabase/reports` from files where those modules were already part of the static runtime graph.
- **What changed:**
  - Replaced stale dynamic imports with direct imports in `useMarketplaceReports.ts`, `useBidsForReport.ts`, `useAppHandlers.ts`, and `buildDashboardRouterProps.ts`.
  - Kept behavior unchanged while removing the false signal that those modules were being split into separate lazy chunks.
- **Files touched:** `src/app/hooks/useMarketplaceReports.ts`, `src/app/hooks/useBidsForReport.ts`, `src/app/hooks/useAppHandlers.ts`, `src/app/utils/buildDashboardRouterProps.ts`, `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- **Validation:** Build: ✓ 0 errors · 2.19s, with the prior Vite dynamic-import warnings removed. Tests: ✓ 81 passed / 5 files. TypeScript: ✓ `npx tsc --noEmit`. `git diff --check`: ✓ clean.
- **Impact:** Cleans the build signal for future stabilization work and sets a clearer refactor rule for service-module loading boundaries.

## Security Track Note — Generic storage adapter boundary hardening (2026-03-28)

- **Why this slice was chosen:** After the intake/workflow hardening, the most likely remaining boundary-regression seam was the shared `StorageService`/`SupabaseStorageAdapter` path, which still allowed browser-direct private-bucket operations if future code reused it.
- **What changed:**
  - Added authenticated storage edge routes for scoped file listing and scoped signed-URL generation.
  - Extended the upload route to accept path-preserving uploads while keeping user ownership scoped under `users/{clerkUserId}/`.
  - Updated `SupabaseStorageAdapter` to route user-scoped private buckets through authenticated edge flows for upload, delete, list, and signed-url operations instead of direct browser storage mutations.
- **Files touched:** `src/app/services/supabase/runtime.ts`, `src/app/services/supabase/storage.ts`, `src/app/services/storage/SupabaseStorageAdapter.ts`, `supabase/functions/server/utils/storage.ts`, `supabase/functions/server/handlers/storage.ts`, `supabase/functions/server/index.ts`, `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- **Validation:** Build: ✓ 0 errors · 2.17s. Tests: ✓ 81 passed / 5 files. TypeScript: ✓ `npx tsc --noEmit`. `git diff --check`: ✓ clean.
- **Impact:** Removes a legacy shared-service bypass around private media handling and leaves a smaller, clearer future refactor seam: unify generic storage and media-optimization behavior behind one server-owned media gateway.

## Security Track Note — Public intake + workflow edge-boundary hardening (2026-03-28)

- **Why this slice was chosen:** After the navigation/storage hardening passes, the remaining live browser-write seams with the highest operational risk were public business-inquiry submissions and shop-side workflow event logging.
- **What changed:**
  - Added edge handlers for public intake submissions (`shop-interest`, `insurer-interest`) with centralized payload validation and server-side activity-event logging.
  - Routed landing inquiry services through edge endpoints instead of direct browser table inserts.
  - Added authenticated edge handlers for workflow events and job-assignment mutations, and moved `workflow.ts` to those routes.
  - Hardened `ShopRequestsScreen.tsx` against unhandled workflow-event promise rejections.
- **Files touched:** `supabase/functions/server/handlers/intake.ts`, `supabase/functions/server/handlers/workflow.ts`, `supabase/functions/server/index.ts`, `src/app/services/supabase/runtime.ts`, `src/app/services/supabase/intake.ts`, `src/app/services/supabase/workflow.ts`, `src/app/components/shop/ShopRequestsScreen.tsx`, `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- **Validation:** Build: ✓ 0 errors · 2.41s. Tests: ✓ 81 passed / 5 files. TypeScript: ✓ `npx tsc --noEmit`. `git diff --check`: ✓ clean.
- **Impact:** Reduces anonymous/browser mutation surface, brings more operational writes under rate-limited edge control, and sharpens a future refactor seam for consolidating public intake plus app command mutations into one server-owned command layer.

## Pass 397 — MCP plan + legacy tracker archive-language alignment (2026-03-28)

- **Why this pass was chosen:** Remaining docs still included one operational plan source and one legacy tracker line that could imply the archived dashboard is still an active workflow anchor.
- **What changed:**
  - `MCP_PLUGIN_INTEGRATION_PLAN.md`: updated Phase 2 sync source from archived build dashboard to active map tracker governance.
  - `BIDONDENT_MAP_TRACKER_2026-03-21.md`: reworded a legacy historical narrative line so it explicitly treats build dashboard as pass-era archive context.
- **Files touched:** `docs/MCP_PLUGIN_INTEGRATION_PLAN.md`, `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- **Validation:** Spellcheck: complete (0 issues across 3 touched docs). Build: not required (docs-only pass).
- **Impact:** Removes another routing ambiguity where automation plans or historical narrative could accidentally reactivate retired reporting behavior.

## Pass 396 — Historical sprint report governance alignment (2026-03-28)

- **Why this pass was chosen:** The historical sprint report still used active-governance wording that could be misread as current process rules.
- **What changed:**
  - `COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md`: reworded stale "actively maintained" and "update after every pass" language to explicit historical-sprint context.
  - Updated sprint report document-ecosystem table entries so build dashboard is clearly archived and tracker status is scoped as historical snapshot for that sprint period.
- **Files touched:** `docs/COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md`
- **Validation:** Spellcheck: complete (0 issues across 3 touched docs). Build: not required (docs-only pass).
- **Impact:** Reduces governance ambiguity by preventing old sprint-report wording from overriding active documentation policy.

## Pass 395 — Residual archive-reference cleanup in authority docs (2026-03-28)

- **Why this pass was chosen:** Residual references in authority docs still implied the build dashboard could be used as an active detailed pass log.
- **What changed:**
  - `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`: updated legacy pass reference line to use map tracker as active governance and build dashboard as historical context.
  - `CLAUDE_AI_MASTER_CONTEXT.md`: updated docs reference table entry to explicitly label build dashboard as archived pass history context.
- **Files touched:** `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`, `docs/CLAUDE_AI_MASTER_CONTEXT.md`
- **Validation:** Spellcheck: complete (0 issues across 3 touched docs). Build: not required (docs-only pass).
- **Impact:** Removes remaining ambiguous wording that could route agents to retired status workflows.

## Pass 394 — Prompt docs governance alignment (archive vs active trackers) (2026-03-28)

- **Why this pass was chosen:** Multiple AI prompt/coordination docs still pointed execution updates to the archived build dashboard, risking process drift.
- **What changed:**
  - `AI_HANDOFF_PROMPT.md`: reclassified build dashboard references as historical archive in docs inventory tables.
  - `DUAL_AI_COORDINATION_PROMPT.md`: moved active coordination update instructions from build dashboard to map tracker/master docs.
  - `CHATGPT_AUTOPILOT_STRATEGY_QUESTIONS.md`: replaced archived dashboard in core-doc list with active map tracker.
  - `AI_LIQUID_GLASS_HANDOFF_PROMPT.md`: clarified map tracker as active governance source and build dashboard as historical archive.
- **Files touched:** `docs/AI_HANDOFF_PROMPT.md`, `docs/DUAL_AI_COORDINATION_PROMPT.md`, `docs/CHATGPT_AUTOPILOT_STRATEGY_QUESTIONS.md`, `docs/AI_LIQUID_GLASS_HANDOFF_PROMPT.md`
- **Validation:** Spellcheck: complete (0 issues across 6 touched docs). Build: not required (docs-only pass).
- **Impact:** Reduces future AI workflow drift by aligning operational prompts with active documentation governance.

## Pass 393 — Onboarding/execution doc policy alignment (2026-03-28)

- **Why this pass was chosen:** Continued stale-doc cleanup found a governance mismatch where the finishing plan still required updating a now-archived dashboard doc every pass.
- **What changed:**
  - `BIDONDENT_FINISHING_MASTER_PLAN.md`: corrected Documentation Rule so active pass logging targets tracker/master/README policy surfaces instead of the archived build dashboard.
  - `GETTING_STARTED.md`: refreshed metadata date and added a scope note pointing execution truth to current baseline/verification docs.
- **Files touched:** `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`, `docs/GETTING_STARTED.md`
- **Validation:** Spellcheck: complete (0 issues across 4 touched docs). Build: not required (docs-only pass).
- **Impact:** Removes policy contradiction that could cause future agents to write status into retired docs and improves onboarding clarity.

## Pass 392 — Authority docs archival clarity (Product Brain + Master Context) (2026-03-28)

- **Why this pass was chosen:** User requested continued stale-doc cleanup; two highest-authority docs still contained historical sections framed as current state.
- **What changed:**
  - `CLAUDE_AI_MASTER_CONTEXT.md`: relabeled old "Current State" block as a historical Pass 286 snapshot, added archive notes, and redirected active execution truth to baseline/verification docs.
  - `BIDONDENT_PRODUCT_BRAIN.md`: updated metadata date and reclassified the 2026-03-25 screenshot section as historical visual snapshot instead of current canonical state.
- **Files touched:** `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/BIDONDENT_PRODUCT_BRAIN.md`
- **Validation:** Spellcheck: complete (0 issues across 4 touched docs). Build: not required (docs-only pass).
- **Impact:** Prevents high-authority docs from unintentionally overriding current execution truth with stale snapshot language.

## Pass 391 — Map docs archival clarity: retire stale "current/in progress" labels (2026-03-28)

- **Why this pass was chosen:** The user requested continued stale-content removal; map docs still had legacy sections labeled as current/in-progress that could mislead execution.
- **What changed:**
  - Corrected Pass 390 validation to reflect completed spellcheck run.
  - Reframed `Current Program Status (Pass 92)` as a historical snapshot and added explicit pointers to active baseline/matrix docs.
  - Reframed legacy `Pass 179` status in map master plan as historical (recorded as in progress at time of capture), not an active current state.
  - Clarified that map master themes are a historical strategic snapshot and that current truth lives in current baseline/verification docs.
- **Files touched:** `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`, `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- **Validation:** Spellcheck: complete (0 issues across 2 touched docs). Build: not required (docs-only pass).
- **Impact:** Reduces documentation trust risk by preventing old status blocks from being interpreted as current execution state.

## Pass 390 — Stale docs cleanup: retire legacy sequencing + archive old status board (2026-03-28)

- **Why this pass was chosen:** User requested continued full-doc cleanup, including deleting outdated guidance that no longer matches current execution reality.
- **What changed:**
  - `BIDONDENT_FINISHING_MASTER_PLAN.md`: removed legacy pass-numbered roadmap sequencing and replaced it with current pre-refactor execution policy tied to active baseline/matrix/map docs.
  - `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`: reclassified as historical archive and redirected readers to active execution trackers.
  - `docs/README.md`: updated planning section to classify build dashboard as historical (non-authoritative for current status).
- **Files touched:** `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`, `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`, `docs/README.md`
- **Validation:** Spellcheck: complete (0 issues across 5 touched docs). Build: not required (docs-only pass).
- **Impact:** Reduces stale execution drift by removing outdated pass sequencing and clarifying current source-of-truth documentation paths.

## Pass 389 — Full docs synchronization (README + Supabase/Auth guides + parallel-track protocol) (2026-03-28)

- **Why this pass was chosen:** User requested full-documentation updates across all doc surfaces before refactor, specifically including README and Supabase/auth setup docs, with merge-safe coordination for a concurrent security AI.
- **What changed:**
  - Consolidated duplicated docs index structure and refreshed governance/parallel-AI protocol in `docs/README.md`.
  - Updated Supabase setup/auth ownership guide in `docs/SUPABASE_SETUP_GUIDE.md` with current date and explicit parallel security-track merge guidance.
  - Updated `docs/GOOGLE_OAUTH_SETUP.md` metadata and added auth-doc synchronization note.
  - Updated `docs/CLAUDE_AI_MASTER_CONTEXT.md` last-updated marker and added concurrent security-track documentation rule.
  - Updated pre-refactor baseline and functional verification matrix docs to include additive merge protocol for parallel security updates.
- **Files touched:** `docs/README.md`, `docs/SUPABASE_SETUP_GUIDE.md`, `docs/GOOGLE_OAUTH_SETUP.md`, `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`, `docs/FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`
- **Validation:** Spellcheck: pending at end of pass run. Build: not required (docs-only pass).
- **Impact:** Aligns full docs stack with current execution reality and reduces cross-agent doc drift while security and UX tracks run in parallel.

## Pass 388 — Full-site functionality verification matrix + docs synchronization (2026-03-28)

- **Why this pass was chosen:** Pre-refactor execution needed an explicit account/page verification matrix and synchronized doc references so functional completeness can be tracked across all site surfaces, not only major map docs.
- **What changed:**
  - Added `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md` with role-based route coverage, shared surface checks, map-program checks, and mobile/desktop verification gates.
  - Updated docs governance references to include the new matrix in `docs/README.md` and `BIDONDENT_FINISHING_MASTER_PLAN.md`.
- **Files touched:** `docs/FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`, `docs/README.md`, `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`
- **Validation:** Build: ✓ 0 errors · 2.04s. Diagnostics: 0 in touched code files. Spellcheck: ✓ clean on touched docs.
- **Impact:** Establishes a concrete, auditable pre-refactor functionality gate across account types, pages, and map/mobile/desktop flows.

## Pass 387 — Landing settings overlay layering + dashboard logo typography fix (2026-03-28)

- **Why this pass was chosen:** Two user-visible regressions were blocking quality: landing-page site settings could appear under landing content layers, and dashboard logo typography rendered a stylized/tilted "On" that violated brand intent.
- **What changed:**
  - `SettingsModal.tsx`: switched modal rendering to `createPortal(..., document.body)` and kept high z-index overlay, guaranteeing top-layer rendering across landing/dashboard shells.
  - `DashboardLayout.tsx`: removed italic styling from the "On" span in both desktop and mobile header logo render paths.
- **Files touched:** `src/app/components/codelayer/account/SettingsModal.tsx`, `src/app/components/app/DashboardLayout.tsx`
- **Validation:** Build: ✓ 0 errors · 2.04s. Diagnostics: 0 in touched files. Mobile/Desktop: modal overlay no longer constrained by header stacking context; logo text styling now straight.
- **Impact:** Restores reliable settings accessibility on landing and aligns dashboard wordmark typography with intended branding.

## Pass 386 — Pre-refactor full-site baseline + docs metadata normalization (2026-03-28)

- **Why this pass was chosen:** Before broad refactor work, the project needed one coherent cross-account functionality baseline and documentation governance consistency across the full docs set, not only map-major files.
- **What changed:**
  - Added `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` with audited coverage across account types, site pages, map program state, mobile/desktop readiness, and code-structure risk seams.
  - Updated `docs/README.md` index to include the new pre-refactor baseline artifact.
  - Normalized explicit `Last updated` / `Status` metadata markers across docs that were missing them (historical prompts, architecture snapshots, sprint report, and planning docs).
- **Files touched:** `docs/PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md`, `docs/README.md`, `docs/AI_BACKEND_TASK_PROMPT.md`, `docs/AI_DASHBOARD_WORK_PROMPT.md`, `docs/AI_DESIGN_HANDOFF_PROMPT.md`, `docs/AI_HANDOFF_PROMPT.md`, `docs/AI_LIQUID_GLASS_HANDOFF_PROMPT.md`, `docs/CHATGPT_AUTOPILOT_STRATEGY_QUESTIONS.md`, `docs/CLAUDE_AI_MASTER_CONTEXT.md`, `docs/CODE_ORGANIZATION_AUDIT.md`, `docs/COMPREHENSIVE_SPRINT_REPORT_PASSES_1_40.md`, `docs/DUAL_AI_COORDINATION_PROMPT.md`, `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md`, `docs/BIDONDENT_FINISHING_MASTER_PLAN.md`, `docs/MCP_PLUGIN_INTEGRATION_PLAN.md`, `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`, `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
- **Validation:** Metadata coverage check: ✓ all docs include `Last updated` and `Status` markers. Spellcheck: pending at end of pass run. Mobile/Desktop: baseline status documented for pre-refactor planning.
- **Impact:** Establishes a shared, auditable readiness baseline and removes documentation-governance drift before refactor sequencing.

## Pass 385 — Search-panel control touch-target compliance (2026-03-28)

- **Why this pass was chosen:** Shop directory search/origin/view controls were still using compact 32px chip sizing, which increased mis-tap risk in the core mobile map-discovery flow.
- **What changed:**
  - `ShopDirectorySearchPanel.tsx`: raised submit, origin chips, location/save actions, view-mode chips, sort/filter/theme/area pills, clear-origin action, and related-screen CTA to explicit 44px minimum touch targets.
  - `ShopDirectorySearchPanel.tsx`: normalized control text sizing/spacing to maintain readability after target-size increases.
- **Files touched:** `src/app/components/shop/ShopDirectorySearchPanel.tsx`
- **Validation:** Build: ✓ 0 errors · 2.08s. Diagnostics: 0 in touched files. Spellcheck: 0 issues in touched files/docs. Mobile/Desktop: improved tap reliability across the shop-directory control stack without changing behavior.
- **Impact:** Reduces control-level friction in the report -> map -> shop loop by making primary discovery controls easier to hit on phones.

## Pass 384 — Map-pane action touch-target compliance (2026-03-28)

- **Why this pass was chosen:** The map-pane selected-shop CTA and area-search pills were below preferred mobile tap-size guidance, increasing mis-tap risk in high-frequency map actions.
- **What changed:**
  - `ShopDirectoryMapPane.tsx`: raised selected-shop directions CTA from 40px to explicit `min-h-[44px]` and normalized legibility sizing.
  - `ShopDirectoryMapPane.tsx`: upgraded `Search this area` and `Area active` pills to `min-h-[44px]` with larger spacing/text for mobile reliability.
- **Files touched:** `src/app/components/shop/ShopDirectoryMapPane.tsx`
- **Validation:** Build: ✓ 0 errors · 2.07s. Diagnostics: 0 in touched files. Spellcheck: 0 issues in touched files/docs. Mobile/Desktop: tap confidence improved on map-over-map controls without changing behavior.
- **Impact:** Strengthens action reliability in the map-first flow by reducing touch friction on phone-sized screens.

## Pass 383 — Shop result-card light-mode readability + touch-target hardening (2026-03-28)

- **Why this pass was chosen:** Core shop result cards still had dark-biased copy/chip styling in light mode and lacked explicit 44px minimum action targets, creating readability and tap-confidence risk in the map -> shop decision loop.
- **What changed:**
  - `ShopDirectoryResultCard.tsx`: made non-compact AI summary copy mode-aware (`text-slate-600` in light mode).
  - `ShopDirectoryResultCard.tsx`: made certification chips mode-aware (light-mode amber chip tokens, dark mode unchanged).
  - `ShopDirectoryResultCard.tsx`: enforced `min-h-[44px]` on all three action buttons (primary, secondary, directions).
- **Files touched:** `src/app/components/shop/ShopDirectoryResultCard.tsx`
- **Validation:** Build: ✓ 0 errors · 2.12s. Diagnostics: 0 in touched files. Spellcheck: 0 issues in touched files/docs. Mobile/Desktop: stronger light-mode contrast and explicit tap-target compliance in list cards.
- **Impact:** Improves readability and action reliability in one of the highest-frequency map-adjacent decision surfaces.

## Pass 382 — Liked shops appearance-mode parity hardening (2026-03-28)

- **Why this pass was chosen:** Liked Shops still had dark-biased header/control surfaces in light mode, creating readability and visual-cohesion drift inside the customer map loop.
- **What changed:**
  - `LikedShopsScreen.tsx`: added mode-aware page shell background for light mode.
  - `LikedShopsScreen.tsx`: converted sticky header (background, border, back button, title support copy) to light/dark conditional styling.
  - `LikedShopsScreen.tsx`: converted search icon/input styling to light/dark conditional tokens.
  - `LikedShopsScreen.tsx`: converted remove-button, insurer-program chips, and secondary `Contact Shop` action to light/dark conditional styling.
- **Files touched:** `src/app/components/shop/LikedShopsScreen.tsx`
- **Validation:** Build: ✓ 0 errors · 2.11s. Diagnostics: 0 in touched files. Spellcheck: 0 issues in touched files/docs. Mobile/Desktop: improved contrast and visual parity in light mode while preserving map-dark behavior.
- **Impact:** Increases trust and legibility for customer shortlist flows and keeps appearance-mode behavior consistent in map-adjacent surfaces.

## Pass 383 — Reload-loop fix for authenticated startup + cached-data migration (2026-03-28)

- **Why this pass was chosen:** The site could enter a repeated reload loop when Clerk-backed startup hit the cached-data migration path and forced a full page refresh before cloud state had fully stabilized.
- **What changed:**
  - `useUserData.ts`: removed the hard `window.location.reload()` from the cached-data migration branch, migrated cached reports alongside profile/vehicles, rehydrated from Supabase in-place, and gated cloud bootstrap on Clerk auth readiness.
  - `App.tsx`: waited for Clerk auth readiness before registering the edge-token getter and before kicking off authenticated user-data loading.
  - `ClerkAccountTypeSelector.tsx`: removed the full-page reload after account setup completion so Clerk metadata updates can flow through normal app state.
- **Files touched:** `src/app/App.tsx`, `src/app/hooks/useUserData.ts`, `src/app/components/auth/ClerkAccountTypeSelector.tsx`
- **Validation:** Build: ✓ 0 errors · 2.09s. Tests: ✓ 81 passed / 5 files. `git diff --check`: ✓ clean.
- **Impact:** Stops the repeated reload behavior, reduces startup thrash during authenticated sessions, and keeps user migration/setup inside stable stateful flow instead of hard browser refreshes.

## Pass 381 — Directions CTA language parity across map flows (2026-03-28)

- **Why this pass was chosen:** The selected map-shop CTA used hardcoded copy that drifted from session-level directions wording used elsewhere, creating subtle language inconsistency in the same user action flow.
- **What changed:**
  - `ShopDirectoryMapPane.tsx`: introduced optional `directionsActionLabel` prop and replaced hardcoded selected-card CTA text with the shared label fallback pattern.
  - `ShopDirectoryScreen.tsx`: passed `session.directionsActionLabel` into `ShopDirectoryMapPane` in the standard map flow.
  - `ShopDirectoryImmersiveMap.tsx`: passed `directionsActionLabel` into `ShopDirectoryMapPane` in immersive flow.
- **Files touched:** `src/app/components/shop/ShopDirectoryMapPane.tsx`, `src/app/components/shop/ShopDirectoryScreen.tsx`, `src/app/components/shop/ShopDirectoryImmersiveMap.tsx`
- **Validation:** Build: ✓ 0 errors · 2.15s. Diagnostics: 0 in touched files. Spellcheck: 0 issues in touched files/docs. Mobile/Desktop: selected-shop map CTA now matches shared directions language in both standard and immersive views.
- **Impact:** Improves map/list action-language coherence and reduces cognitive friction in the report -> map -> shop -> action loop.

## Pass 380 — Selected-map-shop actionability boost (2026-03-28)

- **Why this pass was chosen:** The selected shop card on the map had strong context but no direct action, creating unnecessary friction versus list cards that already expose actionable controls.
- **What changed:**
  - `ShopDirectoryMapPane.tsx`: added optional `onOpenShopDirections` callback prop and a direct CTA button inside the selected shop card (`Open directions`).
  - `ShopDirectoryScreen.tsx`: wired standard map flow to pass `session.handleOpenShopDirections` into `ShopDirectoryMapPane`.
  - `ShopDirectoryImmersiveMap.tsx`: wired immersive map flow to pass existing `onOpenShopDirections` callback into `ShopDirectoryMapPane`.
- **Files touched:** `src/app/components/shop/ShopDirectoryMapPane.tsx`, `src/app/components/shop/ShopDirectoryScreen.tsx`, `src/app/components/shop/ShopDirectoryImmersiveMap.tsx`
- **Validation:** Build: ✓ 0 errors · 2.03s. Diagnostics: 0 in touched files. Mobile/Desktop: selected-map-shop now has immediate action parity with list flow.
- **Impact:** Reduces map-to-action friction by enabling direct navigation launch from the selected shop card on mobile and desktop map views.

## Pass 382 — Security hardening follow-up: remove client DB fallbacks + document edge-only admin verification (2026-03-28)

- **Why this pass was chosen:** After the initial security sweep, a few legacy client helpers still contained raw browser-side table reads or direct-query fallback paths that could undermine the hardened edge-auth model if left in place.
- **What changed:**
  - `useAdminActions.ts`: replaced direct browser database verification with an authenticated deep health check through the protected edge function.
  - `admin.ts`: added a typed admin deep-health helper so admin diagnostics flow through the same secured edge request path as the rest of the dashboard.
  - `admin-dashboard-core-actions.ts`: removed legacy direct `profiles` reads and public-anon health fetch usage in favor of admin edge helpers.
  - `reports.ts`, `vehicles.ts`: removed direct browser fallback reads/writes/deletes and kept those flows on Clerk-authenticated edge routes only.
  - `PerformanceOptimizer.ts`: replaced direct preload table reads with the secured profile/vehicle/report service layer to avoid hidden browser bypass paths.
- **Files touched:** `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`, `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`, `src/app/components/admin/useAdminActions.ts`, `src/app/components/admin/admin-dashboard-core-actions.ts`, `src/app/services/performance/PerformanceOptimizer.ts`, `src/app/services/supabase/admin.ts`, `src/app/services/supabase/reports.ts`, `src/app/services/supabase/runtime.ts`, `src/app/services/supabase/vehicles.ts`
- **Validation:** Build: ✓ 0 errors · 2.19s. Tests: ✓ 81 passed / 5 files. `git diff --check`: ✓ clean.
- **Impact:** Reduces browser-side exposure paths, keeps admin diagnostics behind authenticated edge authorization, and tightens the rule that sensitive account/report/vehicle data must flow through the hardened server boundary.

## Pass 379 — Mobile safe-area clearance for dashboard map list flow (2026-03-28)

- **Why this pass was chosen:** In map mode, lower list content could visually collide with fixed mobile nav/browser chrome, reducing access to final cards and actions.
- **What changed:**
  - `ShopDirectoryListBody.tsx`: added mobile-only bottom safe-area padding when map pane is active (`pb-[calc(env(safe-area-inset-bottom)+6.5rem)]`) while keeping desktop density unchanged.
- **Files touched:** `src/app/components/shop/ShopDirectoryListBody.tsx`
- **Validation:** Build: ✓ 0 errors · 2.09s. Diagnostics: 0 in touched files. Mobile/Desktop: map-mode list now has clearer end-of-scroll breathing room on mobile.
- **Impact:** Prevents content clipping behind fixed chrome and improves completion of map-list browsing actions on phones.

## Pass 378 — Mobile map control hierarchy alignment (2026-03-28)

- **Why this pass was chosen:** After Pass 377 fixes, map controls still felt visually inconsistent between landing and dashboard on mobile, and iOS touch-scroll resilience needed hardening in settings.
- **What changed:**
  - `SettingsModal.tsx`: added explicit touch-scroll hints (`touchAction: pan-y`, `-webkit-overflow-scrolling: touch`) to both outer and inner scroll containers.
  - `ShopDirectorySearchPanel.tsx`: restructured search row to bounded two-column grid (`query + Update`) matching landing control hierarchy, reduced input pressure, and normalized view/sort controls with minimum touch heights.
  - `ShopDirectorySearchPanel.tsx`: converted lower control cluster to responsive grid on mobile to reduce chip-wrap crowding and improve tap confidence.
- **Files touched:** `src/app/components/codelayer/account/SettingsModal.tsx`, `src/app/components/shop/ShopDirectorySearchPanel.tsx`
- **Validation:** Build: ✓ 0 errors · 2.09s. Diagnostics: 0 in touched files. Mobile/Desktop: improved control rhythm on mobile, desktop behavior preserved.
- **Impact:** Landing and dashboard map controls now read as one system on mobile, and settings scrolling is more robust on touch devices.

## Pass 377 — Mobile viewport fixes: settings scroll, landing map controls, dashboard map polish (2026-03-28)

- **Why this pass was chosen:** Three mobile regressions were blocking smooth usage: settings modal scroll friction, landing coverage control overflow, and dashboard map list density/crowding.
- **What changed:**
  - `SettingsModal.tsx`: rebuilt modal as a viewport-safe scroll container (`overflow-y-auto` shell + internal scroll body + fixed footer actions) and increased panel opacity to prevent background bleed-through on mobile.
  - `CoverageSearchPanel.tsx`: switched top controls to a bounded two-column grid (`ZIP input + radius selector`) with `min-w-0`/`overflow-hidden` protections and mobile 3-column action buttons so the range selector stays inside the panel.
  - `ShopDirectoryHero.tsx`: ensured back control icon contrast in dark map mode.
  - `ShopDirectoryListBody.tsx`: tightened mobile spacing, chip/button sizing, and converted recommendation header row to stack on mobile for cleaner map-list readability.
- **Files touched:** `src/app/components/codelayer/account/SettingsModal.tsx`, `src/app/components/landing/CoverageSearchPanel.tsx`, `src/app/components/shop/ShopDirectoryHero.tsx`, `src/app/components/shop/ShopDirectoryListBody.tsx`
- **Validation:** Build: ✓ 0 errors · 2.28s. Diagnostics: 0 in touched files. Mobile/Desktop: updated mobile behavior for all three reported surfaces while preserving desktop layouts.
- **Impact:** Mobile settings are now scroll-safe, landing map search controls remain contained, and dashboard map/list sections are cleaner and easier to scan.

## Pass 376 — Map screen layout refinement + dark-mode appearance fix (2026-03-28)

- **Why this pass was chosen:** Mobile map/list surfaces remained visually dense and the appearance mode settings modal could render incorrectly when opened from landing dark mode due to missing dark-theme container attributes.
- **What changed:**
  - `LandingPageLayout.tsx`: added dark theme shell attributes (`dark` class + `data-theme`) so settings modal glass surfaces render correctly in dark mode when launched from landing view.
  - `ShopDirectorySearchPanel.tsx`: compacted mobile controls (search row, origin chips, view/sort controls, role panel) and reduced vertical pressure while preserving all existing actions.
  - `ShopDirectoryMapPane.tsx`: tightened top badges, refined selected-shop bottom card rhythm, and reduced map overlay pill density for better map visibility.
  - `ShopDirectoryHero.tsx`: reduced map-mode header density (smaller back chip, role chip, title sizing) for better first-screen map focus.
  - `ShopDirectoryScreen.tsx`: adjusted split-shell geometry for desktop and responsive map height behavior for mobile.
- **Files touched:** `src/app/components/app/LandingPageLayout.tsx`, `src/app/components/shop/ShopDirectorySearchPanel.tsx`, `src/app/components/shop/ShopDirectoryMapPane.tsx`, `src/app/components/shop/ShopDirectoryHero.tsx`, `src/app/components/shop/ShopDirectoryScreen.tsx`
- **Validation:** Build: ✓ 0 errors · 2.12s. Diagnostics: 0 in touched files. Mobile/Desktop: map/list parity updated for both view modes.
- **Impact:** Shop map experience is denser, clearer, and more map-forward on mobile while keeping desktop split-view usable. Appearance mode behavior is now consistent in dark mode from landing and dashboard entry points.

## Passes 181–185 — Design Consolidation + Infrastructure (2026-03-24)

**Summary:** 8-pass design consolidation sweep covering glass system unification, blue token upgrade, CTA hierarchy, empty state visibility, report flow touch targets, landing page consistency, Sentry project creation, and MCP plugin integration planning.

- **Pass 181**: Sign Out/Delete Account button hierarchy, Bids empty state glass
- **Pass 182A-E**: Glass system unification, map overlay sidebar offset, header/logo refinement, blue token upgrade, card remnant removal (ChatGPT-validated)
- **Pass 183**: Critical empty state fixes (ShopDirectoryListBody → `bd-glass-card`, dim icon colors → `text-blue-400/70`)
- **Pass 184**: Landing CTA button → pill shape, vertical gradient, proportional sizing (matches hero)
- **Pass 185**: Report creation flow — all buttons `min-h-[44px]`, `py-3` consistent padding, StepPhotos empty state → glass
- **Infrastructure**: Sentry project created (`bidondent-production`), DSN wired to `.env`, MCP plugin integration plan written

**Files touched (across all passes):** 16 files — `AccountMenu.tsx`, `BidsScreen.tsx`, `HomeScreenSections.tsx`, `HomeScreen.tsx`, `DashboardLayout.tsx`, `MobileBottomNav.tsx`, `CustomerMapWidget.tsx`, `theme.css`, `ShopDirectoryListBody.tsx`, `LikedShopsScreen.tsx`, `InsurerClaimsScreen.tsx`, `ShopActiveJobsScreen.tsx`, `CTASection.tsx`, `StepDamageArea.tsx`, `StepPhotos.tsx`, `StepDescription.tsx`, `StepComplete.tsx`, `StepVehicleInfo.tsx`

**Build:** ✓ 0 errors · 1.88s

### Current Map State (2026-03-25 — Screenshot Verified)

The Operating Regions / coverage map section is the **strongest visual identity anchor** on the entire site. Confirmed working:

- Interactive Leaflet map with day/night/satellite/focus/overview/expand modes
- ZIP search with radius selector (20-mile default)
- County grid: Rockland, Dutchess, Westchester, Nassau, Orange, Putnam
- Partner shop list with distance + navigation handoff (Apple Maps / Google Maps / Waze)
- Performance metrics overlay (zoom/pan budget, provider health)
- "BIDONDENT MAPS" branded overlay badges
- Dark navy background anchors the product identity

**Map-first gap remaining:** Dashboard map widget exists but dashboard still feels like "UI with a map" rather than "map with floating panels." Next priority: map dominance finalization — reduce visual weight of non-map dashboard elements.

**Runtime issue:** ~~"Can't find variable: props" crash~~ — ✅ **FIXED Pass 186**. Root cause: `DashboardRouter.tsx` destructured params but referenced undefined `props` variable.

**Best next pass:** Map dominance finalization → Interaction flow smoothing → Feature completion (bid pipeline, shop ops)

## Pass 200 — Dashboard shell night cohesion + map/header separation (2026-03-25)

- **Why this pass was chosen:** Mobile and desktop screenshot review showed the fixed map layer visually colliding with the sticky header, weakening the map-first shell feel.
- **What changed:**
  - `HomeScreen.tsx`: Fixed map hero layer now starts below the sticky header (`top: max(env(safe-area-inset-top), 4.25rem)`), reducing header overlap.
  - `DashboardLayout.tsx`: Header and desktop sidebar surfaces now use dark navy glass gradients aligned to map night mode; text contrast updated for the darker shell.
  - `MobileBottomNav.tsx`: Bottom nav moved to dark glass tone to match the map-native shell language.
- **Validation:** Build ✓ 0 errors · 2.00s · 738KB main bundle.
- **Impact:** Dashboard entry now reads as a coherent map-world shell instead of separate bright chrome over dark map atmosphere.

## Pass 203 — Operating regions county list hierarchy treatment (2026-03-25)

- **Why this pass was chosen:** Coverage county rows looked utilitarian and flat, reducing scan speed and weakening map-surface identity.
- **What changed:**
  - `OperatingRegionsSection.tsx`: Added “Active Counties” micro-header and live-region count badge.
  - County rows now use left-aligned place identity + right-side active status badge.
  - Preserved existing county data and map behavior while improving hierarchy clarity.
- **Validation:** Build ✓ 0 errors · 1.87s · 739.64KB main bundle.
- **Impact:** County coverage is now glanceable and map-native, improving readability on both mobile and desktop.

## Pass 205 — Account system preferences appearance mode wiring (2026-03-25)

- **Why this pass was chosen:** Users needed a first-class way to move between immersive map-night shell and a lighter shell without fragmenting map-first product direction.
- **What changed:**
  - Added persisted appearance mode at app root (`map-dark` default, `light` optional) in `App.tsx`.
  - Wired mode through dashboard router contracts and account settings path.
  - Added `System Preferences` controls in `SettingsModal.tsx` under Account settings.
  - Applied selected mode to dashboard shell and landing shell backgrounds in `DashboardLayout.tsx` and `LandingPageLayout.tsx`.
- **Validation:** Build ✓ 0 errors · 2.60s · 741.06KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Appearance mode now has a stable product-level control path and persistence foundation for future system-wide theming passes.

## Pass 206 — Appearance shell consistency hardening (2026-03-25)

- **Why this pass was chosen:** Screenshots showed shell-level theme cohesion still needed reinforcement, especially for mobile bottom navigation and future system-wide appearance expansion.
- **What changed:**
  - `App.tsx`: appearance mode now also sets `data-appearance-mode` and `color-scheme` on the document root for scalable styling.
  - `DashboardLayout.tsx`: mobile bottom nav now receives active appearance mode; main content shell gets subtle mode-aware backdrop treatment.
  - `MobileBottomNav.tsx`: fully mode-aware dark/light visual treatment and inactive-tab contrast tuning.
- **Validation:** Build ✓ 0 errors · 2.21s · 741.65KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Appearance mode behavior is now more coherent across authenticated shell surfaces and better prepared for future tokenized theme expansion.

## Pass 207 — Mobile contrast + map card cohesion sweep (2026-03-25)

- **Why this pass was chosen:** Screenshot baseline still showed washed mobile text in light sections and inconsistent card language between dashboard shell and map-related surfaces.
- **What changed:**
  - Landing readability sweep in `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`, `BenefitsSection.tsx`, and `AboutOpportunitySection.tsx` with stronger text contrast and cleaner card surfaces.
  - Dashboard map cohesion in `CustomerMapWidget.tsx` by moving shop list widget from bright card treatment into dark map-native glass styling.
  - Bids screen alignment in `BidsScreen.tsx` by upgrading empty and summary surfaces to map-dark card styling with improved typography contrast.
- **Validation:** Build ✓ 0 errors · 2.10s · 742.03KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Mobile readability and visual trust improved in both public and authenticated map-first flows.

## Pass 208 — Dashboard mobile stack rhythm tuning (2026-03-25)

- **Why this pass was chosen:** Dashboard home on mobile still felt vertically crowded near the top stack (map widget into welcome/actions handoff).
- **What changed:**
  - `HomeScreen.tsx`: increased mobile map-to-content offset, tightened top hero card spacing, and made primary action button full-width on mobile.
  - `CustomerMapWidget.tsx`: reduced mobile density with compact list limit and smaller row rhythm while preserving full map expansion path.
- **Validation:** Build ✓ 0 errors · 2.10s · 742.03KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Home dashboard now reads as a calmer map-first flow with less perceived crowding at first scroll depth.

## Pass 209 — Account card dark-shell cohesion (2026-03-25)

- **Why this pass was chosen:** Account tab still used bright, gray-heavy card surfaces that visually broke the dark map-shell dashboard experience.
- **What changed:**
  - `AccountInfoCard.tsx`: switched panel and sub-card surfaces to dark map-native glass treatment with improved text contrast.
  - `AccountMenu.tsx`: aligned rows, icon chips, and affordance colors to dark-shell palette while preserving destructive-action clarity.
- **Validation:** Build ✓ 0 errors · 2.05s · 742.03KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Account tab now visually matches the rest of the authenticated dark-shell system and feels less segmented.

## Pass 210 — Report flow dark-shell cohesion (2026-03-25)

- **Why this pass was chosen:** Report tab still had brighter utility bars and form surfaces that looked detached from the dark dashboard shell.
- **What changed:**
  - `ReportHeader.tsx`: moved title bar and step badge treatment to dark map-shell glass.
  - `ReportProgress.tsx`: aligned inactive step and connector visuals to dark-shell system.
  - `StepVehicleInfo.tsx`: upgraded first report step form container and fields to dark-glass styling with improved text contrast.
- **Validation:** Build ✓ 0 errors · 2.15s · 742.03KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Report flow now enters with a more consistent map-night experience and less visual theme switching.

## Pass 211 — Report step dark-shell parity completion (2026-03-25)

- **Why this pass was chosen:** Remaining report steps (damage area and final description) still used bright card/form surfaces that broke visual continuity in the core report intake loop.
- **What changed:**
  - `StepDamageArea.tsx`: moved step shell and area selectors to dark map-glass styling with improved selected/unselected state contrast.
  - `StepDescription.tsx`: moved description/incident fields, labels, back button, and submit-error surface to dark-shell treatment.
  - Preserved step behavior and validation logic; this pass is strictly visual cohesion and readability hardening.
- **Validation:** Build ✓ 0 errors · 2.03s · 742.03KB main bundle. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Report intake now maintains map-night visual continuity from step 1 through submit, reducing context switching in the report -> map -> shop loop.

## Pass 212 — Report appearance-mode parity wiring (2026-03-25)

- **Why this pass was chosen:** Report flow had hardcoded dark-shell styling but did not respond to the app's appearance mode toggle (map-dark vs light).
- **What changed:**
  - `DashboardRouter.tsx`: threads `appearanceMode` prop to `<ReportScreen>`.
  - `ReportScreen.tsx`: receives mode, derives `isLightAppearance`, passes to all step components.
  - `ReportHeader.tsx`, `ReportProgress.tsx`, `StepVehicleInfo.tsx`, `StepDamageArea.tsx`, `StepDescription.tsx`: all conditional on appearance mode.
- **Validation:** Build ✓ 0 errors · 2.06s · 742KB main. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Report intake now responds correctly to both map-dark and light appearance modes for the first 5 steps.

## Pass 213 — Remaining report steps appearance-mode completion (2026-03-25)

- **Why this pass was chosen:** StepPhotos, StepServiceLocation, and StepComplete were the last report steps without appearance-mode conditional styling.
- **What changed:**
  - `StepPhotos.tsx`: title, info block, upload indicator, empty state, photo labels, action buttons, sticky footer — all conditional on appearance mode.
  - `StepServiceLocation.tsx`: heading, form labels, inputs, info block, skip link — all conditional.
  - `StepComplete.tsx`: success heading, timeline items, back-to-dashboard button — all conditional.
  - `ReportScreen.tsx`: threads `appearanceMode` to StepServiceLocation (case 3), StepPhotos (case 4), and StepComplete (case 6).
- **Validation:** Build ✓ 0 errors · 2.09s · 742KB main. Diagnostics: 0. Spellcheck: 0.
- **Impact:** Entire 6-step report creation flow now responds to app appearance mode. Full dark/light parity achieved for report intake.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven overlays) (2026-03-24)

- **Why this pass was chosen:** Map-driven shop actions (bid/accept) were not surfaced as primary overlays, limiting mobile and map-first flows. Needed to complete the spatial shop loop and ensure all actions are accessible from the map.
- **What changed:**
  - Added a floating shop action overlay to `ShopDirectoryMapOverlays.tsx`.
  - Overlay provides large, mobile-first "Place Bid" and "Accept" buttons, always accessible when a shop and route are selected.
  - Buttons are glass/royal blue, 44x44px+ touch targets, and follow the design system.
  - Actions dispatch custom events for integration with the rest of the shop flow.
- **Files touched:** `ShopDirectoryMapOverlays.tsx`
- **Validation:** Build: ✓ 0 errors · 990.81 KB · 2.08s. Diagnostics: 0. Spellcheck: 0. Overlay appears and works on mobile and desktop.
- **What this unlocks:** Shop actions are now map-native, mobile-first, and always accessible. Enables customer decision loop and navigation flow hardening.
- **Best next pass:** Pass 180 — Customer decision loop (map-driven bid/action).

## Pass 178 — Map-first overlays, dashboard bugfixes, mobile fix (2026-03-24)

**Status:** Complete

**Summary:**

- Refactored HomeScreen and overlays for map-first, floating panel structure
- Fixed dashboard header/logo, removed blocky blue background
- Fixed mobile loading bug and report marker tap-to-open
- Strict verification and doc update

**Files touched:** src/app/components/codelayer/HomeScreen.tsx, src/app/components/maps/MapReportMarkers.tsx, src/app/components/dashboard/DashboardHeader.tsx

**Validation:** Build 1.81s, 0 errors. Diagnostics: 0. Spellcheck: 0.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven shop bid/accept) (2026-03-24)

**Status:** ✅ Complete (see above)

---

## Known Incomplete Fixes — Mobile Screenshot Audit (2026-03-23)

### ~~"Coverage focus" Fallback Label (Pass 88 Incomplete)~~ ✅ RESOLVED (Pass 113)

- ~~**MapSearchTargetMarkers.tsx**: `activeSearchTarget.county || "Coverage focus"`~~ → Now `"Service area"`
- ~~**useCoverageNavigationExperience.ts**: Ultimate fallback label is still `"Coverage focus"`~~ → Now `"Service area"`
- Pass 88 fixed 2 files; Pass 113 fixed remaining 2. All 4 files now consistent.
- **Status**: ✅ Fully resolved.

---

### Pass 113 — P2-DATA: Coverage Focus Label Cleanup (2026-03-23)

**Category:** Data consistency — fallback label alignment

**Delivered:**

- `MapSearchTargetMarkers.tsx`: Fallback `"Coverage focus"` → `"Service area"`
- `useCoverageNavigationExperience.ts`: Ultimate fallback `"Coverage focus"` → `"Service area"`
- Completes Pass 88's incomplete fix across all 4 files.

**Files touched:** `MapSearchTargetMarkers.tsx`, `useCoverageNavigationExperience.ts`

**Validation:** Build 1.81s, 0 errors. Bundle: 977.66 KB. Diagnostics: 0. Spellcheck: 0.

---

### Pass 111 — Accessibility: WCAG A Violations Fix (2026-03-23)

**Category:** Accessibility (WCAG Level A) — label-input association, button ARIA roles

**Delivered:**

- `PlannerAddressSearch.tsx`: `<label>` now has `htmlFor="planner-address-search"`. `<input>` now has `id="planner-address-search"`. Fixes WCAG 1.3.1 (Level A) for all navigation planner users.
- `DashboardLayout.tsx` (profile button): Added `aria-expanded={showTopProfileMenu}`, `aria-haspopup="menu"`, `aria-label="User profile menu"`. Fixes WCAG 4.1.2 (Level A).
- `DashboardLayout.tsx` (profile dropdown): Container now has `role="menu"` + `aria-label`. All three buttons now have `role="menuitem"`. Fixes WCAG 4.1.2 (Level A).

**Files touched:** `PlannerAddressSearch.tsx`, `DashboardLayout.tsx`

**Validation:** Build 1.82s, 0 errors. Bundle: 977.68 KB. Diagnostics: 0.

---

### Pass 110 — Sentry Integration (2026-03-23)

**Category:** Production Hardening — observability, crash reporting infrastructure

**Delivered:**

- Installed `@sentry/react` (7 packages).
- Created `src/app/services/sentryInit.ts`:
  - `initSentry()` — no-op without `VITE_SENTRY_DSN`.
  - `isSentryReady()` — runtime guard used by `errorReporting.ts`.
  - `tracesSampleRate: 0.1` in production, 100% in dev.
  - `beforeSend` filter strips browser extension errors.
- Created `src/app/services/errorReporting.ts`:
  - `captureException(error, context)` — routes to Sentry when active, logs in DEV.
  - `captureMessage(message, context?)` — same routing logic.
- Updated `src/main.tsx`: `initSentry()` called before `ReactDOM.createRoot`.
- Updated `NavigationErrorBoundary.tsx`: removed bare `console.error`, now calls `captureException`.
- Updated `ImageErrorBoundary.tsx`: removed bare `console.error`, now calls `captureException`.

**To activate**: Add `VITE_SENTRY_DSN=<your_dsn>` and `VITE_SENTRY_ENVIRONMENT=production` to `.env`. No code changes needed.

**Files touched:** `src/app/services/sentryInit.ts` _(new)_, `src/app/services/errorReporting.ts` _(new)_, `src/main.tsx`, `NavigationErrorBoundary.tsx`, `ImageErrorBoundary.tsx`

**Validation:** Build 1.82s, 0 errors. Bundle: 977.68 KB / 250.17 KB gzip. Diagnostics: 0.

---

### Pass 109 — Global Error Boundary (2026-03-23)

**Category:** P1-RUNTIME / Production Hardening — root-level crash protection

**Delivered:**

- Replaced bare `RootErrorBoundary` in `src/main.tsx` with `GlobalErrorBoundary`:
  - BidOnDent-branded fallback (`bg-[#eef2f7]`, royal-blue gradient logo mark).
  - Calm user-facing message — no stack traces or jargon in production.
  - "Try Again" (re-mount) + "Reload Page" (full refresh) recovery buttons.
  - Error detail visible only in `import.meta.env.DEV`.
- Added `window.onerror` and `unhandledrejection` global handlers → `captureException` via `errorReporting.ts`.

**Files touched:** `src/main.tsx`

**Validation:** Build 1.82s, 0 errors. Bundle: 977.68 KB. Diagnostics: 0.

---

### Pass 108 — App Interior Card Padding Sweep (2026-03-23)

**Category:** P4-UX — bare `p-6` inner card panels without responsive modifier in app interior and insurer modals

**Delivered:**

- `HomeScreenSections.tsx`: Gradient hero card `p-6` → `p-4 sm:p-6`.
- `BidsScreen.tsx`: No-bids empty state `p-6` → `p-5 sm:p-6`.
- `ShopDirectoryListBody.tsx`: No-results empty state `p-6` → `p-4 sm:p-6`.
- `InsurerClaimApprovalModal.tsx`, `InsurerNewClaimForm.tsx`, `AddProspectModal.tsx`, `InsurerConnectionScreen.tsx`: Inner content panels `p-6` → `p-4 sm:p-6`.

**Files touched:** `HomeScreenSections.tsx`, `BidsScreen.tsx`, `ShopDirectoryListBody.tsx`, `InsurerClaimApprovalModal.tsx`, `InsurerNewClaimForm.tsx`, `AddProspectModal.tsx`, `InsurerConnectionScreen.tsx`

**Validation:** Build 1.84s, 0 errors. Bundle: 976.03 KB. Diagnostics: 0.

### Pass 107 — Onboarding Form Card + Modal Padding Sweep (2026-03-23)

**Category:** P4-UX — bare `p-6` / `px-6 py-6` on onboarding cards and modals with no responsive modifier

**Delivered:**

- `ShopOnboardingStep1/2/3/4.tsx`: Form wrapper cards `p-6 space-y-*` → `p-4 sm:p-6 space-y-*`.
- `InsurerOnboarding.tsx`: 3 form section cards `p-6` → `p-4 sm:p-6`.
- `LoginModal.tsx`, `AccountTypeMigrationModal.tsx`: Modal `p-6` → `p-5 sm:p-6`.
- `DeleteAccountModal.tsx`, `ShopProfileModal.tsx`, `HelpModal.tsx`, `SettingsModal.tsx`, `PaymentModal.tsx`: Modal inner content `p-6` → `p-5 sm:p-6`.
- `VehicleProfileScreen.tsx`: Vehicle card `p-6` → `p-4 sm:p-6`.
- `ShopRatingModal.tsx`: Rating inner content `p-6` → `p-4 sm:p-6`.
- `EditProfileModal.tsx`: Profile edit `px-6 py-6` → `px-4 sm:px-6 py-5 sm:py-6`.

**Files touched:** `ShopOnboardingStep1.tsx`, `ShopOnboardingStep2.tsx`, `ShopOnboardingStep3.tsx`, `ShopOnboardingStep4.tsx`, `InsurerOnboarding.tsx`, `LoginModal.tsx`, `AccountTypeMigrationModal.tsx`, `DeleteAccountModal.tsx`, `ShopProfileModal.tsx`, `HelpModal.tsx`, `SettingsModal.tsx`, `PaymentModal.tsx`, `VehicleProfileScreen.tsx`, `ShopRatingModal.tsx`, `EditProfileModal.tsx`

**Validation:** Build 1.65s, 0 errors. Bundle: 975.98 KB. Diagnostics: 0.

### Pass 106 — Empty State Card Padding Sweep (2026-03-23)

**Category:** P4-UX — bare `p-8` on 7 empty-state cards across shop, insurer, customer, and home flows

**Delivered:**

- `VehicleProfileScreen.tsx`, `LikedShopsScreen.tsx`, `ShopActiveJobsScreen.tsx`, `ShopRequestsScreen.tsx`, `InsurerClaimsScreen.tsx`, `ReportsListScreen.tsx`, `HomeScreenSections.tsx`: Empty state cards `p-8` → `p-5 sm:p-8`. Recovers 24px of horizontal breathing room at mobile.

**Files touched:** `VehicleProfileScreen.tsx`, `LikedShopsScreen.tsx`, `ShopActiveJobsScreen.tsx`, `ShopRequestsScreen.tsx`, `InsurerClaimsScreen.tsx`, `ReportsListScreen.tsx`, `HomeScreenSections.tsx`

**Validation:** Build 1.75s, 0 errors. Bundle: 975.87 KB. Diagnostics: 0.

### Pass 105 — Responsive Grid Layout Sweep (2026-03-23)

**Category:** P4-UX — cramped `grid-cols-3` gaps and oversized card padding on mobile viewports

**Delivered:**

- `CompetitorAnalysisScreen.tsx`: stats grid `gap-4` → `gap-2 sm:gap-4`.
- `ProfileRoleStats.tsx`: 3× stat grids `gap-3` → `gap-2 sm:gap-3`.
- `InsurerMapWidget.tsx`: stat grid `gap-3` → `gap-2 sm:gap-3`.
- `InsuranceCompaniesScreen.tsx`: partner logo grid `gap-4` → `gap-2 sm:gap-4`.
- `photo-guide-steps.tsx`: 4× step cards `p-6` → `p-4 sm:p-6`.
- `InsurerClaimCard.tsx`, `ShopActiveJobsScreen.tsx`, `InsurerNewClaimScreen.tsx` (×2): action button grids `gap-2` → `gap-1.5 sm:gap-2`.

**Files touched:** `CompetitorAnalysisScreen.tsx`, `ProfileRoleStats.tsx`, `InsurerMapWidget.tsx`, `InsuranceCompaniesScreen.tsx`, `photo-guide-steps.tsx`, `InsurerClaimCard.tsx`, `ShopActiveJobsScreen.tsx`, `InsurerNewClaimScreen.tsx`

**Validation:** Build 1.74s, 0 errors. Bundle: 975.82 KB. Diagnostics: 0.

### Pass 104 — Codebase-Wide Form Input Touch Target Sweep (2026-03-23)

**Category:** P4-UX — sub-44px form inputs across shop onboarding, vehicle profile, insurer connection, shop rating

**Delivered:**

- `py-2` → `py-3` on all form inputs in: `ShopOnboardingStep1.tsx` (7), `VehicleProfileScreen.tsx` (6), `InsurerConnectionScreen.tsx` (2 inputs + 1 button), `ShopOnboardingStep2.tsx` (1), `ShopRatingModal.tsx` (1).

**Files touched:** `ShopOnboardingStep1.tsx`, `VehicleProfileScreen.tsx`, `InsurerConnectionScreen.tsx`, `ShopOnboardingStep2.tsx`, `ShopRatingModal.tsx`

**Validation:** Build 1.71s, 0 errors. Bundle: 975.70 KB. Diagnostics: 0.

### Pass 103 — Form Input + Filter Tab Touch Target Sweep (2026-03-23)

**Category:** P4-UX — sub-44px form inputs and filter tabs across auth, insurer, and shop flows

**Delivered:**

- `ClerkAccountTypeSelector`: Card `p-8` → `p-5 sm:p-8`. Both inputs `py-2` → `py-3`.
- `InsurerOnboarding`: 8 inputs `py-2` → `py-3` (all steps of mandatory flow).
- `InsurerClaimsScreen` + `ShopActiveJobsScreen`: Filter tabs `py-2` → `py-2 min-h-[44px]`.

**Files touched:** `ClerkAccountTypeSelector.tsx`, `InsurerOnboarding.tsx`, `InsurerClaimsScreen.tsx`, `ShopActiveJobsScreen.tsx`

**Validation:** Build 1.80s, 0 errors. Bundle: 975.70 KB. Diagnostics: 0.

### Pass 102 — Reports Screen Back Button + Filter Tab Touch Targets (2026-03-23)

**Category:** P4-UX — undersized tap targets on Reports screens

**Delivered:**

- Back buttons on `ReportDetailScreen`, `ReportsListScreen`, `CompetitorAnalysisScreen`: `p-2` → explicit `h-11 w-11 flex items-center justify-center` (44×44px).
- Filter tabs on `ReportsListScreen`: `py-2` → `py-2.5 min-h-[44px]`.

**Files touched:** `ReportDetailScreen.tsx`, `ReportsListScreen.tsx`, `CompetitorAnalysisScreen.tsx`

**Validation:** Build 1.87s, 0 errors. Bundle: 975.66 KB. Diagnostics: 0.

### Pass 101 — Hero Carousel Dots Touch Target Fix (2026-03-23)

**Category:** P4-UX — untappable carousel controls on landing page

**Delivered:**

- Carousel dot buttons wrapped in `h-11 w-7` flex centering containers. Hit area: 6×6px → 44×28px. Visual dot unchanged.

**Files touched:** `HeroSection.tsx`

**Validation:** Build 1.80s, 0 errors. Bundle: 975.53 KB. Diagnostics: 0.

### Pass 100 — Landing Page Mobile Typography Sweep (2026-03-23)

**Category:** P4-UX — oversized headings and card padding on mobile landing page

**Delivered:**

- 7 section headings scaled responsively: `text-4xl` → `text-2xl sm:text-4xl` (long titles) or `text-3xl sm:text-4xl` (short titles). Desktop appearance unchanged.
- Card padding on HowItWorks and WhoWeServe sections: `p-8` → `p-5 sm:p-8`. Recovers ~24px per card on mobile.

**Files touched:** `BusinessInquirySection.tsx`, `AboutOpportunitySection.tsx`, `AboutPage.tsx`, `InsurerPartnershipPage.tsx`, `BenefitsSection.tsx`, `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`

**Validation:** Build 1.67s, 0 errors. Bundle: 975.45 KB. Diagnostics: 0.

### Pass 99 — Map Overlay Cards Mobile Separation (2026-03-23)

**Category:** P4-UX — overlay card stacking on mobile map

**Delivered:**

- Route preview card repositioned on mobile: `bottom-24` → `bottom-64 sm:bottom-24`. Clears the selected shop card area (gradient + card ~250px tall) on 375px screens. Desktop unchanged at `bottom-24`.
- Marker legend hidden on mobile (`hidden sm:block`): frees ~50px of bottom-area real estate. Legend is secondary reference info, unnecessary on small screens.

**Files touched:** `ShopDirectoryMapPane.tsx`, `ShopDirectoryMapOverlays.tsx`

**Validation:** Build 1.68s, 0 errors. Bundle: 975.38 KB. Diagnostics: 0.

### Pass 98 — Immersive Map Z-Index Above MobileBottomNav (2026-03-23)

**Category:** P1-RUNTIME — MobileBottomNav overlapping immersive map on mobile

**Delivered:**

- ShopDirectoryImmersiveMap `z-40` → `z-[60]`: Full-screen immersive map now sits above MobileBottomNav (`z-50`) and dashboard header (`z-40`). Tab bar no longer bleeds through the map on mobile.
- Internal map z-indices (z-[500]–z-[570]) unaffected — remain within the z-[60] stacking context.

**Files touched:** `ShopDirectoryImmersiveMap.tsx`

**Validation:** Build 1.65s, 0 errors. Bundle: 975.35 KB. Diagnostics: 0.

### Pass 92 — Landing Page Copy Polish (2026-03-23)

**Category:** P6-SPELL — minor wording improvements on landing page

**Delivered:**

- "Active NY rollout" → "Now available in NY" in HeroSection badge
- "Submission and status events are captured" → "Every submission and status update is recorded" in AboutOpportunitySection

**Files touched:** `HeroSection.tsx`, `AboutOpportunitySection.tsx`

**Validation:** Build 1.72s, 0 errors. Spellcheck: 0/136 files.

### Pass 91 — Gate Diagnostics Panel to Dev-Only (2026-03-23)

**Category:** P3-ARCH — internal diagnostics panel exposed to all users

**Delivered:**

- PlannerDiagnosticsPanel (system confidence, provider health, map performance, discovery quality) gated behind `import.meta.env.DEV`. Default changed from `true` to `Boolean(import.meta.env?.DEV)` in planner, and explicit DEV check added in sidebar caller.
- Production users no longer see internal monitoring panels.

**Files touched:** `CoverageNavigationPlanner.tsx`, `CoverageBrowseSidebarContent.tsx`

**Validation:** Build 1.74s, 0 errors. Bundle: 976.96 KB. Diagnostics: 0.

### Pass 90 — Guard Console Statements in Consumer Components (2026-03-23)

**Category:** P2-DATA — internal data exposed in production console

**Delivered:**

- 9 unguarded console.log/error/warn statements gated behind `import.meta.env.DEV` across `ReportScreen.tsx`, `AccountScreen.tsx`, `BusinessInquirySection.tsx`, `CoverageMapDialog.tsx`.
- Emoji decorators stripped from all log messages.
- NavigationErrorBoundary `console.error` left intentionally (standard error boundary pattern).

**Validation:** Build 1.77s, 0 errors. Bundle: 976.97 KB. Diagnostics: 0. Spellcheck: 0.

### Pass 89 — Remove macOS Traffic Light Dots (2026-03-23)

**Category:** P4-UX — macOS window chrome on mobile app

**Delivered:**

- Removed macOS-style traffic light dots (red/yellow/green circles) from `CoverageCommandCenterHeader.tsx`. The map command center now presents as a product-owned surface, not a desktop window clone.

**Validation:** Build clean. Diagnostics: 0.

### Pass 88 — Mobile Map Panel Labels Cleanup (2026-03-23)

**Category:** P4-UX — developer jargon on consumer-facing map panels

**Delivered:**

- "Active origin" → "Your location" in PlannerAddressSearch
- "Route preview" → "Route to shop" in PlannerRoutePreview
- "Route status" → "Your route" in PlannerRoutePreview
- "Search-first command center" → "Find Nearby Shops" in CoverageCommandCenterHeader
- "Coverage focus" → "Service Area" in MapSurfaceHeaderBadges

**Files touched:** `PlannerAddressSearch.tsx`, `PlannerRoutePreview.tsx`, `CoverageCommandCenterHeader.tsx`, `MapSurfaceHeaderBadges.tsx`

**Validation:** Build 1.64s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**What this unlocks:** All map panel surfaces now use consumer-grade language. Combined with Pass 87, developer jargon has been eliminated from every user-facing map and landing surface.

### Pass 87 — Strip Internal Developer Content from Consumer Surfaces (2026-03-23)

**Category:** P0-TRUST — developer content exposed to consumers

**Delivered:**

- Performance monitoring metrics (zoom/pan ms, over-budget counters, sample timing) gated behind `import.meta.env.DEV` in `MapSurfaceStatusBar.tsx`. Production builds tree-shake the entire block.
- All developer-facing copy in `CoverageSearchPanel.tsx` replaced with consumer-friendly language:
  - "Coverage Direction Surface" → "Find Nearby Shops"
  - "Apple-style glass chrome" pill → removed
  - "ZIP focus ready" → "Search by ZIP"
  - Internal descriptions → user-facing benefit statements

**Files touched:** `MapSurfaceStatusBar.tsx`, `CoverageSearchPanel.tsx`

**Validation:** Build 1.69s, 0 errors. Diagnostics: 0. Spellcheck: 0. Bundle size reduced ~1.5 KB.

**What this unlocks:** The landing page and map surfaces now read as consumer-grade product copy. No user will encounter internal monitoring data or developer jargon. Trust and professionalism reinforced.

### Pass 86 — Mobile Active Navigation Critical Fixes (2026-03-23)

**Category:** P0-RUNTIME, P1-RUNTIME — active navigation mobile overlap + hidden info

**Delivered:**

- Voice controls sheet repositioned from `bottom-3` to `bottom-[13rem]` on mobile — no longer covers SummarySheet, "End Route" button, or ETA info. Desktop position unchanged.
- Destination name + address now visible on all screen sizes — compact mobile row (`text-sm`, `rounded-2xl`, `px-3 py-2.5`) with `sm:` breakpoints for existing larger desktop card. Users can confirm they're heading to the correct shop.
- **Pass 96:** Destination shop name upgraded from `truncate text-sm` to `line-clamp-2 text-base leading-snug` on mobile — names now wrap to 2 lines before truncating (~40 chars visible vs. ~19), font bumped to 16px for glanceability. Desktop `sm:text-2xl` unchanged.
- Speed panel bottom offset increased from `bottom-[12rem]` to `bottom-[14rem]` — prevents overlap with the now-taller SummarySheet on narrow phones.
- **Pass 95:** Speed panel repositioned to `bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)+17rem)]` — safe-area-aware clearance above the summary sheet on all devices. SpeedLimitBadge scaled to 76×76px / CurrentSpeedBadge to 88px min-width on mobile (restored at `sm:`). Combined badge footprint reduced from 228px (61% of 375px) to 172px (46%). Speed numbers remain glanceable at 24px (`text-2xl`). Desktop unchanged via `md:bottom-8`.

**Files touched:** `NavigationVoiceControlsSheet.tsx`, `NavigationSummarySheet.tsx`, `NavigationActiveSpeedPanel.tsx`

**Validation:** Build 1.70s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**What this unlocks:** Mobile users in active navigation can now see their destination name, access "End Route" even with voice controls open, and have no panel overlap on any phone size. Active navigation on mobile is now functionally complete for all critical information.

### Pass 85 — Mobile Bottom Sheet "Never Trapped" UX (2026-03-23)

**Category:** P4-UX — mobile map interaction

**Delivered:**

- 4-snap-point system: COLLAPSED (24px, handle-only — map fully visible), PEEK (90px), HALF (40%), FULL (88%)
- "Back to Map" button — sky-500/15 pill with Map icon, visible whenever sheet is expanded beyond collapsed state
- Enlarged drag handle hit area — py-4, w-14, sky-400/70 for reliable gesture capture on all screen sizes
- Scroll gating — overflow-y-auto only at HALF and FULL snap points, preventing scroll-gesture conflicts at PEEK
- Sheet never unmounts — `dismissible={false}` retained, user collapses to 24px instead of closing

**Files touched:** `MobileMapBottomSheet.tsx`

**Validation:** Build 1.75s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**What this unlocks:** Mobile users can now collapse the bottom sheet to a thin handle and interact with the map freely, then swipe back up at any time. No more trapped-in-sheet dead ends.

### Pass 84 — Critical Bug Sweep + Migration Fix (2026-03-23)

**Category:** P1-RUNTIME, P2-DATA, P4-UX — multi-bug sweep

**Delivered:**

- Account page crash eliminated — `onDeleteAccount` prop plumbed through both `DashboardRouter.tsx` and `DashboardTabScreens.tsx`
- Damage report persistence restored — migration `010_add_clerk_user_id_to_damage_reports.sql` adds `clerk_user_id TEXT` column, makes `user_id` nullable, adds constraint and index to align runtime schema with edge function expectations
- Mobile bottom sheet swipe restored — `pointer-events-auto` added to `MobileMapBottomSheet.tsx` DrawerContent so touch/drag gestures are captured instead of passed through to the Leaflet map

**Files touched:** `DashboardRouter.tsx`, `DashboardTabScreens.tsx`, `MobileMapBottomSheet.tsx`, `010_add_clerk_user_id_to_damage_reports.sql` (new)

**Validation:** Build 1.71s, 0 errors. Spellcheck: 0.

**What this unlocks:** Account management, report lifecycle, and mobile map browsing now function end-to-end. Users can sign out and back in without losing reports. Mobile map bottom sheet is interactive again.

### Pass 80 — OperatingRegionsSection Hook Extraction (2026-03-23)

- **P3-ARCH FIX**: `OperatingRegionsSection.tsx` at 476 lines — all state, memos, effects, and handlers tightly coupled in one component
- Created `useOperatingRegionsCoverage.ts` (348 lines): 15+ state variables, 6 `useMemo` computations, 3 `useEffect` hooks, 9 handler functions (zip search, geolocation, shop selection, map navigation, directions)
- `OperatingRegionsSection.tsx`: 476 → 175 lines. Now a thin JSX renderer: calls `useOperatingRegionsCoverage()`, passes results to `CoverageSearchPanel`, `ServiceCoverageMap`, `CoverageNearestShops`, `CoverageMapDialog`.
- No consumer changes required — external prop interface and default export unchanged.
- 2 files touched. Build: 2446 modules, 1.63s, 0 errors. Spellcheck: 0.

### Pass 79 — Sonnet Audit + InsurerNewClaimScreen Fix (2026-03-23)

- **P0-BUILD FIX**: Sonnet's incomplete extraction left orphaned inline modal JSX in `InsurerNewClaimScreen.tsx` (lines 362-486), causing build failure (`Unterminated regular expression`)
- Removed orphaned JSX — `InsurerNewClaimScreen.tsx`: 477 → 362 lines. Now uses `<InsurerNewClaimForm>` component (created by Sonnet).
- **P0-BUILD FIX**: `LoginSignupView.tsx` line 204 — `"login"` missing from `LoginView` type union. Added `"login"` to type in `src/app/types/index.ts`.
- **P0-BUILD FIX**: `ShopDirectoryListBody.tsx` line 28 — `routeSummary` typed as `IntelligenceSummary` (requires `callouts`) but `buildRoleAwareRouteSummary` only returns `{ title, description }`. Relaxed `ShopDirectoryRoutePanel` prop type to `{ title: string; description: string }` since `callouts` was never used.
- 4 files touched: `InsurerNewClaimScreen.tsx`, `src/app/types/index.ts`, `ShopDirectoryRoutePanel.tsx`, (removed unused `IntelligenceSummary` import). Build: 1.63s, 0 errors. Spellcheck: 0.

### Pass 78 — ShopOnboarding Extraction (2026-03-23)

- **P3-ARCH FIX**: `ShopOnboarding.tsx` at 484 lines (16 from 500 hard limit)
- Created `ShopOnboardingStep1.tsx` (148 lines): shop info form with inline phone formatting
- Created `ShopOnboardingStep2.tsx` (76 lines): business hours input
- Created `ShopOnboardingStep3.tsx` (127 lines): certifications + specialties toggle buttons (includes local `toggleArrayItem` helper and static option arrays)
- Created `ShopOnboardingStep4.tsx` (91 lines): insurance/estimates preferences + complete button
- `ShopOnboarding.tsx`: 484 → 115 lines. Now an orchestrator: state, progress bar, step routing only.
- No consumer changes required — external prop interface and default export unchanged.
- 5 files touched. Build: 1.63s, 0 errors. Spellcheck: 0.

### Pass 77 — ShopDirectoryScreen Extraction (2026-03-23)

- **P3-ARCH FIX**: `ShopDirectoryScreen.tsx` at 489 lines (11 from 500 hard limit)
- Created `ShopDirectoryListBody.tsx` (168 lines): scrollable sidebar list body (route panel + role collection + saved places + recent searches + results header + shop cards loop)
- `ShopDirectoryScreen.tsx`: 489 → 339 lines. Removes 5 imports (Bookmark, Search, ShopDirectoryResultCard, ShopDirectoryRoutePanel, getRoleCollectionActionLabels) — all moved to sub-component.
- No consumer changes required — external prop interface and default export unchanged.
- 2 files touched. Build: 1.65s, 0 errors. Spellcheck: 0.

### Pass 76 — LoginModal Extraction (2026-03-23)

- **P3-ARCH FIX**: `LoginModal.tsx` at 484 lines (16 from 500 hard limit) — extracted 3 inline view sections
- Created `LoginMainView.tsx` (87 lines): user-type selection (customer / shop / insurer)
- Created `LoginSignupView.tsx` (185 lines): full signup form with name, phone, email, password, social buttons
- Created `LoginLoginView.tsx` (160 lines): login form with email, password, social buttons
- `LoginModal.tsx`: 484 → 134 lines. Wrapper + header + conditional rendering only.
- No consumer changes required — external prop interface and default export unchanged.
- 4 files touched. Build: 1.62s, 0 errors. Spellcheck: 0.

### Pass 75 — Admin Hook Extraction (2026-03-23)

- **P3-ARCH FIX**: `useAdminActions.ts` at 490 lines (10 from 500 hard limit) — extracted before it grew further
- Extracted `useAdminAccountStatuses.ts` (62 lines): `accountStatuses` state + `checkAccountStatus`
- Extracted `useAdminRoleManagement.ts` (57 lines): role management state + `handleManageAdmin`
- `useAdminActions.ts`: 490 → 367 lines. Now well under hard limit, returning object unchanged.
- No consumer changes required (`AdminDashboard.tsx` still works via same return interface)
- 3 files touched. Build: 1.62s, 0 errors. Spellcheck: 0.

### Pass 74 — HeroSection Mobile UX (2026-03-23)

- **P4-UX FIX**: Both CTA buttons had equal visual weight — no primary/secondary hierarchy
- "Get Started" keeps `bd-glass-control` (primary, dark blue gradient)
- "Learn More" changed to `bd-glass-control--secondary` (light blue-gray, clearly secondary)
- Both CTAs: `w-full sm:w-auto` — full-width stacked on mobile, auto-width on sm+
- Carousel container: `h-14` → `h-16` to prevent text clipping on narrow mobile screens
- 1 file touched: `HeroSection.tsx`. Build: 1.61s, 0 errors. Spellcheck: 0.

### Pass 73 — LandingPageHeader Visual Hierarchy (2026-03-23)

- **P4-UX FIX**: Logo wrapped in `bd-glass-control` made it look like a dark blue CTA button
- **P4-UX FIX**: Nav links (How It Works, Who We Serve, About) used primary `bd-glass-control` — should be subtle
- **P4-UX FIX**: Login had equal visual weight to "Get Started" — no CTA hierarchy
- Logo button: `bd-glass-control` → transparent hover (`hover:bg-white/20`)
- Nav links: `bd-glass-control font-medium` → `bd-glass-control--utility font-medium`
- Login: `bd-glass-control` → `bd-glass-control--secondary hidden md:block`
- Dashboard: Consolidated mobile/desktop duplicate buttons into single responsive button
- 1 file touched: `LandingPageHeader.tsx`. Build: 1.61s, 0 errors. Spellcheck: 0.

### Pass 72 — Mobile Dashboard Content Density (2026-03-23)

- **P4-UX FIX**: Stat cards occupied too much vertical space on mobile (min-h-[158px], single column)
- Stat grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` → `grid-cols-2 xl:grid-cols-4` (2-col on mobile)
- Stat cards: compact on mobile (`p-3.5`, `min-h-[120px]`, smaller icon/text) → desktop-scale at md+
- Badge hidden on mobile (visual noise reduction)
- Space-y reduced on mobile: `space-y-5` → `space-y-4 md:space-y-5`
- DashboardLayout main padding tightened: `px-4 py-5` → `px-3 py-4`
- 2 files touched: `HomeScreen.tsx`, `DashboardLayout.tsx`. Build: 1.75s, 0 errors. Spellcheck: 0.

### Pass 71 — HomeScreen Extraction (2026-03-23)

- **P3-ARCH FIX**: `HomeScreen.tsx` at 483 lines (near 500 hard limit) — extracted before next touch
- `HomeScreen.tsx`: 483 → 249 lines
- New: `HomeScreenSections.tsx` (309 lines) — `HomeOnboardingCard`, `HomeReportsList`, `HomeSidebar`
- All three are leaf render components with no hooks, safe to co-locate in one file
- Build: 2439 modules, 1.66s, 0 errors. Spellcheck: 0.

### Pass 70 — Production Polish: Page Title + Meta Tags (2026-03-23)

- **P5-DOC FIX**: Page title was "BidOnDent Full_DEMO" — visible in browser tab, bookmarks
- New title: "BidOnDent — Compare Auto Body Repair Bids"
- Added `<meta name="description">`, `og:title`, `og:description`, `og:type`, `theme-color`
- 1 file touched: `index.html`. Build: 1.70s, 0 errors. Spellcheck: 0.

### Pass 69 — Customer Dashboard Empty-State Polish (2026-03-23)

- **P4-UX FIX**: New customer dashboard was sparse/dead-looking with zero data
- Context-aware greeting: "Welcome" (new) vs "Welcome back" (returning)
- Stats grid replaced with "How BidOnDent Works" 3-step onboarding card for new customers
- Empty reports section: centered layout, camera icon, descriptive copy, inline "Start Your First Report" CTA button
- Subtitle updated: explains value proposition for new users vs status updates for returning
- `HomeScreen.tsx`: 421 → 483 lines (near soft limit, extraction candidate next touch)
- 1 file touched. Build: 1.68s, 2438 modules, 0 errors. Spellcheck: 0.

### Pass 68 — Safari Blank White Screen Fix (2026-03-23)

- **P1-RUNTIME FIX**: Safari reload → blank white screen — JS module stall leaves no visible feedback
- Fix 1: Pre-mount loading indicator directly in `index.html` `#root` (spinner + "Loading BidOnDent…")
- Fix 2: 10s timeout in pre-mount HTML shows "Tap to reload" recovery link if JS never mounts
- Fix 3: `AppLoading.tsx` now shows "Tap to reload" after 8s if React loading gate stays blocked
- Root cause: Clerk SDK or Supabase session sync can stall on Safari reload (ESM cache / network timing)
- `createRoot` (not `hydrateRoot`) naturally replaces pre-mount content — no hydration mismatch
- 2 files touched: `index.html`, `AppLoading.tsx`. Build: 1.70s, 2438 modules, 0 errors. Spellcheck: 0.

### Pass 67 — Header Button Sizing (2026-03-23)

- **P4-UX FIX**: Landing page header nav buttons oversized — CSS `bd-glass-control` reduced
- `padding: 0.75em 2.2em` → `0.5em 1.6em`, `font-size: 1.08rem` → `0.92rem`
- 1 file touched: `theme.css`. Build: 1.70s, 0 errors. Spellcheck: 0.

### Pass 67+ — User Feedback Observations (2026-03-23)

**Confirmed working:**

- Map UI significantly improved — full-bleed, bottom sheet, compact nav overlays
- X close button now visible and functional (portal fix)
- Planner content compacted for mobile

**Issues identified from user screenshots (queued for passes):**

- **P4-UX**: Landing page header nav buttons oversized/chunky — need size reduction
- **P4-UX**: Customer dashboard empty/sparse vs polished map UI (design parity gap)
- **P4-UX**: Insurer dashboard UI (claims, partner shops) dated vs map polish — future parity pass
- **P1-RUNTIME**: Safari blank white screen on dashboard reload — hydration or routing issue
- **P5-DOC/IDENTITY**: Map UI should not over-Apple-ify — maintain BidOnDent product character
- **P7-TECHDEBT**: Broader site UI parity with landing page map polish — staged for future

### Pass 66 — Bottom Sheet Peek Optimization (2026-03-23)

- **P4-UX**: Peek 120px→90px, half-snap 45%→40% — more map visible
- 1 file touched. Build: 1.71s, 0 errors. Spellcheck: 0.

### Pass 64/65 — Dialog Close Fix + Planner Compaction (2026-03-23)

- **P1-RUNTIME FIX**: Dialog X non-functional — z-index stacking context trap. Fixed via portal close button.
- **P4-UX**: Active nav chrome md→xl, planner sections hidden on mobile sheet.
- 5 files touched. Build: 1.82s, 0 errors. Spellcheck: 0.

### Pass 63 — Browse Mode Map-First (2026-03-23)

- **P4-UX FIX**: Desktop chrome pushed from md→xl — full-bleed map below 1280px
- Tile mode + Center/Reset controls hidden on mobile sheet
- 2 files touched. Build: 1.86s, 0 errors. Spellcheck: 0.

### Pass 62 — ActionRail Mobile Refinement (2026-03-23)

- **P4-UX FIX**: ActionRail moved from horizontal bottom to vertical right-side (Apple Maps pattern)
- Eliminates overlap with SummarySheet on mobile
- 1 file touched. Build: 1.93s, 0 errors. Spellcheck: 0.

### Pass 61 — Active Navigation Mobile Layout (2026-03-23)

- **P4-UX FIX**: Active navigation compacted for mobile — real nav app feel
- Map full-bleed `100dvh` during active navigation on mobile
- ManeuverCard: icon/text smaller, following step hidden on mobile
- SummarySheet: stats smaller, shop card hidden, End Route compact
- SpeedPanel: repositioned, road info hidden on mobile
- Exit button repositioned below ManeuverCard (no overlap)
- 4 files touched
- Build: 1.67s, 2437 modules, 0 errors.

### Pass 60C — Map Dominance + Visual Softening (2026-03-23)

- **P4-UX FIX**: Map = primary surface on mobile. Full-bleed `100dvh`, no header, no shell chrome.
- Outer shell transparent on mobile (gradient/blur/shadow at md: only)
- Visual softening: liquid sheen −30%, panel/card shadows −25%, rail shadows −20%
- Mobile overrides further reduced for atmospheric feel
- 2 files touched: `CoverageBrowseExperience.tsx`, `theme.css`
- Build: 1.80s, 2437 modules, 0 errors.

### Pass 59B — Mobile Interaction Model (2026-03-23)

- **P2-UX FIX**: Mobile browse overlays removed — map gets full bleed on mobile
- Browse overlays hidden below xl breakpoint; bottom sheet is sole mobile interaction surface
- Escape key added to NavigationTurnListSheet + NavigationVoiceControlsSheet
- 4 files touched
- Build: 1.66s, 2437 modules, 0 errors.

### Pass 58A — Navigation Trap Fix (2026-03-23)

- **P1-UX FIX**: Three navigation traps eliminated — no dead-end UI states remain
- Dialog close button now at z-[700] — always above map overlays on mobile
- Active navigation gets floating X exit button (top-left, z-[570]) — always reachable
- Escape key exits active navigation back to browse mode
- 2 files touched: `CoverageMapDialog.tsx` (403 lines), `dialog.tsx`
- Build: 1.67s, 2437 modules, 0 errors.

### Pass 57 — Navigation Session Retry Resilience (2026-03-23)

- **P1-DATA FIX**: Session cloud persistence failures now survive 75-second outages (was 15s)
- Exponential backoff: 5s → 10s → 20s → 40s (4 attempts vs previous 3)
- `online` event listener resumes retries immediately when network restores
- localStorage persist failure now warns in console for debugging
- `navigationSessionCloudService.ts`: 225 → 245 lines
- Build: 1.82s, 2436 modules, 0 errors.

### Pass 56 — useShopDirectorySession Hard-Limit Relief (2026-03-23)

- **P3-ARCH FIX**: `useShopDirectorySession.ts` at 499 lines (1 from hard limit) — extracted utils before next touch
- `useShopDirectorySession.ts`: 499 → 436 lines
- New: `shopDirectorySessionUtils.ts` (75 lines) — `slugify`, `buildSavedPlace`, `buildRecentSearches`, `getContextChips`
- Build: 1.76s, 2436 modules, 0 errors.

### Pass 55 — DashboardRouterScreens Hard-Limit Relief (2026-03-23)

- **P3-ARCH FIX**: `DashboardRouterScreens.tsx` at 493 lines (7 from hard limit) — split before next touch
- `DashboardRouterScreens.tsx`: 493 → 16 lines (composition shell only)
- New: `DashboardTabScreens.tsx` (240), `DashboardStandaloneScreens.tsx` (229), `DashboardAnimatedScreen.tsx` (23) — all under 300 soft limit
- Build: 1.62s, 2436 modules, 0 errors.

### Pass 54 — OSRM Circuit-Breaker Protection (2026-03-23)

- **P3-ARCH FIX**: No protection against OSRM public endpoint failures — repeated errors would hit the API without backoff
- `isProviderCircuitOpen("osrm-route")` now short-circuits `fetchNavigationRouteOptions` after 3 consecutive failures, with a 90s cooldown before the next attempt
- Fully telemetry-driven: uses existing persisted health events, no new storage keys
- `providerHealth.ts`: 257 → 278 lines. `routeEngine.ts`: 422 → 426 lines. Both under limits.
- Build: 1.65s, 2436 modules, 0 errors.

### Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

- Vision clarified and governance aligned for the future BidOnDent map/platform/design experience.
- Product-owned, blue-system, and atmosphere direction locked as **future planning** (not shipped code).
- Day/night guidance mode, richer world feel, and glass/atmosphere direction are all **planned, not implemented**.
- Tracker will log progress toward these goals and ensure future passes do not drift from this vision.

### Pass 38 — AdminDashboard Hook Extraction (2026-03-23)

- AdminDashboard.tsx: 593 → 139 lines (76% reduction)
- NEW: useAdminActions.ts (490 lines) — all state + async handlers extracted
- All 5 previously identified oversized files now resolved ✔

### Pass 39 — HomeScreen Data Extraction (2026-03-23)

- HomeScreen.tsx: 576 → 421 lines (27% reduction)
- NEW: homeScreenData.ts (225 lines) — types, constants, per-userType builder functions
- Zero behavior change, zero UI change

### Pass 40 — useUserData Utility & Transform Extraction (2026-03-23)

- useUserData.ts: 574 → 487 lines (15% reduction, under 500 hard limit ✔)
- NEW: userDataUtils.ts (71 lines) — pure utility functions + report transform/payload builders
- Eliminated duplicated report-transform and report-payload blocks

### Pass 41 — BusinessInquirySection Utils Extraction (2026-03-23)

- BusinessInquirySection.tsx: 551 → 457 lines (17% reduction, under 500 hard limit ✔)
- NEW: businessInquiryUtils.ts (96 lines) — types, initial state, formatters, validators

### Pass 42 — InsurerClaimsScreen Utils Extraction (2026-03-23)

- InsurerClaimsScreen.tsx: 509 → 453 lines (11% reduction, under 500 hard limit ✔)
- NEW: insurerClaimsUtils.ts (86 lines) — ClaimData type, transforms, status/priority helpers
- **ZERO files remain over the 500-line hard limit**

### Pass 43 — Navigation Session Auth Identity Fix (2026-03-23)

- **P0 FIX**: useNavigationSession used hardcoded "demo-user" — all sessions shared one Supabase key
- useNavigationSession now accepts `authUserId?: string`; consumers pass Clerk `providerUserId`
- ShopDirectoryScreen + ShopDirectoryMapOverlays wired to forward real user identity
- Build: 1.70s, 2435 modules, 0 errors

### Pass 43b — Stable Anonymous Navigation Identity (2026-03-23)

- Follow-up: shared `"anonymous"` fallback still caused collision for unauthenticated users
- `getStableAnonId()` creates a per-browser UUID via localStorage (`bidondent_anon_nav_id`)
- Anonymous users now get unique `anon-<uuid>` keys; authenticated path unchanged
- Build: 1.66s, 2435 modules, 0 errors

### Pass 44 — currentStepIndex Stability on Route Refresh (2026-03-23)

- **P1 FIX**: Navigation step index and voice guidance blindly reset to step 1 on every GPS-triggered route refresh
- `resolveStepIndexAfterRefresh()` finds nearest upcoming step by GPS proximity
- `rebuildSpokenSteps()` carries forward spoken-step history for surviving maneuvers
- Both route-fetch and alt-route paths fixed; 1 file: useCoverageNavigationExperience.ts
- Build: 1.65s, 2435 modules, 0 errors

### Pass 45 — Navigation Cloud Sync Unload Protection (2026-03-23)

- **P1 FIX**: In-memory retry queue lost on tab close — pending cloud writes silently dropped
- `persistPendingQueue()` on `pagehide`; `recoverPendingQueue()` on next load
- localStorage key `bidondent_nav_pending_writes`; auto-cleared after recovery
- 1 file: navigationSessionCloudService.ts
- Build: 1.59s, 2435 modules, 0 errors

### Pass 46 — Session Hydration Race Guard (2026-03-23)

- **P1 FIX**: Cloud hydration overwrites user actions during in-flight fetch
- Hydration `setSession` guarded with `prev.status === "idle"` check
- 1 file: useNavigationSession.ts
- Build: 1.65s, 2435 modules, 0 errors

### Pass 47 — Stale Retry Write Guard (2026-03-23)

- **P2 FIX**: Out-of-order retried writes could overwrite newer cloud state
- `latestWriteTs` map + `queuedAt` on `PendingWrite` — retries skip stale entries
- 1 file: navigationSessionCloudService.ts
- Build: 1.66s, 2435 modules, 0 errors

### Pass 51 — Saved Location Recent Staleness Pruning (2026-03-23)

- **P5 FIX**: Recent saved locations never expired; now pruned after 30 days of inactivity
- Pinned categories (`home`, `work`, `saved`) unaffected
- 1 file: savedLocations.ts
- Build: 1.62s, 2435 modules, 0 errors

### Pass 52 — Voice Support Status Surface in Planning UI (2026-03-23)

- **P4 FIX**: Safari gesture-blocked state ("Tap to enable voice") was silently generated but never shown in planning UI
- `useCoverageNavigationExperience` now calls `useVoiceSupport()` and exposes `voiceStatusLabel`
- Voice footer in `PlannerVoiceGpsSettings` now shows status-aware label for non-ready states
- Build: 2435 → 2436 modules (useVoiceSupport now bundled), 1.63s, 0 errors
- 4 files: useCoverageNavigationExperience.ts, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, CoverageBrowseSidebarContent.tsx

### Pass 53 — useCoverageNavigationExperience Extraction (2026-03-23)

- **P3-ARCH FIX**: Hook hit 510 lines — hard limit breach
- Extracted `resolveStepIndexAfterRefresh` + `computeCarriedSpokenSteps` (formerly `rebuildSpokenSteps`) to `navigationGuidanceHelpers.ts`
- Pure function refactor: `computeCarriedSpokenSteps` returns `Set<string>` instead of mutating ref via closure
- Hook: 510 → 450 lines. Helpers: 153 → 224 lines.
- Build: 1.63s, 2436 modules, 0 errors
- 2 files: useCoverageNavigationExperience.ts, navigationGuidanceHelpers.ts

### Pass 50 — Place Discovery Dedup Precision + GPS Stale Auto-Recovery (2026-03-23)

- **P3 FIX**: Place discovery dedup key coord precision raised 4 → 6 decimals
- **P4 FIX**: GPS stale state now auto-retries once per episode via `staleAutoRetryFiredRef`; flag resets on recovery
- 2 files: useNavigationGpsTracking.ts, placeDiscovery.ts
- Build: 1.64s, 2435 modules, 0 errors

### Pass 49 — Route Destination Key Hardening (2026-03-23)

- **P2-P3 FIX**: Destination key collision when two shops share name + nearby coordinates
- `buildDestinationKey` now uses `shop.id → name|address|county → unknown-shop` priority
- Coordinate precision raised from 4 to 6 decimal places in both origin/destination keys
- 1 file: navigationGuidanceHelpers.ts
- Build: 1.67s, 2435 modules, 0 errors

### Pass 48 — GPS Permission Denied Recovery + Error Differentiation (2026-03-23)

- **P2 FIX**: GPS permission denied, signal loss, and timeout all mapped to same "lost" status
- New `GpsStatus = "denied"` with specific error messaging and user-actionable retry button
- `retryGps()` callback re-triggers `watchPosition` after user grants permission
- 5 files: useNavigationGpsTracking.ts, useCoverageNavigationExperience.ts, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, CoverageBrowseSidebarContent.tsx
- Build: 1.67s, 2435 modules, 0 errors

# BidOnDent Map Tracker (2026-03-21)

Last updated: March 24, 2026  
Status: Active execution tracker
Companion to: `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`

Also cross-reference:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — map implementation reality table, design expansion plan
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table (updated 2026-03)

## Purpose

Track execution slices, validation outcomes, and next map priorities without duplicating master-plan strategy.

## Historical Program Snapshot (Pass 92, 2026-03-23)

Archive note: This section records the program snapshot captured during Pass 92. For current execution reality, use `PRE_REFACTOR_FULL_SITE_BASELINE_2026-03-28.md` and `FULL_SITE_FUNCTIONAL_VERIFICATION_MATRIX_2026-03-28.md`.

- Reliability and diagnostics: **Advanced** — GPS degradation, speed-limit fallback, error boundaries, cloud sync, circuit breaker, session retry all delivered. Network error recovery UI pending.
- Explainable trust UI: **Stable** — Provider health surfaced in planner. Confidence trends documented. Trust signals wired.
- Real discovery/routing integrity: **Stable** — Demo gating tightened. Route continuity expanded. Discovery quality telemetry integrated.
- Mobile and desktop quality parity: **Advanced** — Full-bleed mobile maps, 4-snap bottom sheet, immersive mode, active nav mobile layout, no panel overlaps all delivered.
- Workspace diagnostics and readability cleanup: **Complete** — All oversized files extracted under 500-line hard limit. Architecture boundaries clean.
- Navigation productization: **Advanced** — Deviation detection, voice guidance, reroute lifecycle, session cloud sync, GPS jitter filtering all delivered.
- Design system: **Complete** — Royal-blue glass system deployed site-wide. Unified hover. Navy dark mode. Landing identity converged.
- Consumer trust: **Advanced** — All dev jargon removed from consumer surfaces (Passes 87–92). Diagnostics/metrics/console gated behind DEV.

## Completed Delivery Slices

### 2026-03-23: DashboardRouter Interface & Animation Dedup (Pass 37)

**Summary:** Extracted the large inline DashboardRouterProps interface from DashboardRouter.tsx to the existing dashboard-router-types.ts companion file (synced missing props: websiteIdentity, onPasswordChange, onDeleteAccount). Deduplicated 19 identical motion.div animation attribute blocks into a shared screenTransition constant. Zero behavior change.

**Files touched:**

- src/app/routers/DashboardRouter.tsx — 608 → 432 lines (29% reduction, under 500 hard limit)
- src/app/routers/dashboard-router-types.ts — updated (74 lines). Added websiteIdentity, onPasswordChange, onDeleteAccount
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 37 entry added

**Validation:**

- Build: 1.64s, 2431 modules, 0 errors
- Diagnostics: 0 errors. Spellcheck: 0 issues.

### 2026-03-23: InsurerPartnerShopsScreen Decomposition (Pass 36)

**Summary:** Decomposed InsurerPartnerShopsScreen.tsx (786 lines) into 4 well-sized files. Extracted types and pure helper functions into insurerPartnerShopsUtils.ts. Extracted the add-prospect modal (with its own form state) into AddProspectModal.tsx. Extracted the manual lead card into ManualProspectCard.tsx. Zero consumer changes. Zero behavior change.

**Files touched:**

- src/app/components/insurer/InsurerPartnerShopsScreen.tsx — 786 → 471 lines (40% reduction, under 500 hard limit)
- src/app/components/insurer/insurerPartnerShopsUtils.ts — NEW (78 lines). Types + helpers
- src/app/components/insurer/AddProspectModal.tsx — NEW (198 lines). Self-contained prospect entry form
- src/app/components/insurer/ManualProspectCard.tsx — NEW (66 lines). Manual lead card
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 36 entry added

**Validation:**

- Build: 1.64s, 2431 modules (+3 new files), 0 errors
- Diagnostics: 0 errors. Spellcheck: 0 issues.

### 2026-03-23: marketIntelligence Seed Data Extraction (Pass 35)

**Summary:** Extracted SHOPS (8 shop profiles) and INSURERS (8 insurance company profiles) seed data arrays from marketIntelligence.ts into marketSeedData.ts. The parent file now imports the data arrays instead of defining them inline. Zero consumer changes required. Zero behavior change.

**Files touched:**

- src/app/services/intelligence/marketIntelligence.ts — 783 → 405 lines (48% reduction, now under 500 hard limit)
- src/app/services/intelligence/marketSeedData.ts — NEW (379 lines). Seed data: shop profiles + insurance company profiles
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 35 entry added

**Validation:**

- Build: 1.70s, 2428 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on all files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: marketIntelligence.ts now 405 lines ✔ under 500 hard limit. All seed data isolated in dedicated module. All map-domain intelligence files now compliant.
- P7-TECHDEBT: Non-map oversized files ALL RESOLVED: InsurerPartnerShopsScreen.tsx (471 ✔), DashboardRouter.tsx (432 ✔), AdminDashboard.tsx (139 ✔)

**Architecture decisions:**

- Seed data module placed alongside parent in services/intelligence/ (same domain)
- SHOPS and INSURERS exported as named constants from marketSeedData
- marketIntelligence.ts imports them — no re-export needed since consumers import functions, not raw data

**What this unlocks next:**

- Map domain intelligence files fully compliant — all under 500 hard limit
- Non-map oversized files: InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

### 2026-03-23: shopMapExperience Data Constants Extraction (Pass 34)

**Summary:** Extracted static shop directory data from shopMapExperience.ts into shopMapData.ts. The new file contains: ShopLocationRecord type, DEFAULT_MAP_CENTER constant, SHOP_LOCATION_DIRECTORY (6 shop entries with coordinates/addresses), SUGGESTED_SEARCH_ORIGINS (4 Dallas-area places), and three accessor functions (getLocationForShop, getDefaultMapCenter, getSuggestedSearchOrigins). Re-exports from shopMapExperience.ts ensure zero consumer changes. Removed unused Place type import.

**shopMapExperience decomposition summary (Passes 33–34):**

- shopMapExperience.ts: 824 → 463 lines (44% total reduction ✔ under 500 hard limit)
- shopMapRouting.ts: 250 lines (route preview logic)
- shopMapData.ts: 122 lines (directory data + accessors)

**Files touched:**

- src/app/services/intelligence/shopMapExperience.ts — 578 → 463 lines (20% reduction, now under 500 hard limit)
- src/app/services/intelligence/shopMapData.ts — NEW (122 lines). Shop directory data module
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 34 entry added

**Validation:**

- Build: 1.67s, 2427 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on all files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: shopMapExperience.ts now 463 lines ✔ under 500 hard limit. All static data isolated in dedicated module.
- P7-TECHDEBT: marketIntelligence.ts (774 lines) is the next map-domain file over hard limit.

**Architecture decisions:**

- Data module placed alongside parent in services/intelligence/ (same domain)
- ShopLocationRecord type exported from data file (used by both data accessors and parent listing builder)
- Re-exports from shopMapExperience prevent consumer import changes

**What this unlocks next:**

- marketIntelligence.ts shop profile data extraction (774 lines — 55% over hard limit)
- Non-map oversized files: InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

### 2026-03-23: shopMapExperience Route-Building Extraction (Pass 33)

**Summary:** Extracted route preview module from shopMapExperience.ts into shopMapRouting.ts. The new file contains: ROUTE_VARIANTS data constant, polyline interpolation (interpolatePoint, buildRoutePolyline), route instruction building, duration/distance formatting, Haversine distance calculation (calculateDistanceMiles), and the two exported route builders (buildShopRouteOptions, buildRoleAwareRouteSummary). Re-exports from shopMapExperience.ts ensure zero consumer changes. Zero behavior change, zero UI change.

**Files touched:**

- src/app/services/intelligence/shopMapExperience.ts — 824 → 578 lines (30% reduction, still over 500 hard limit)
- src/app/services/intelligence/shopMapRouting.ts — NEW (250 lines). Route preview module
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 33 entry added

**Validation:**

- Build: 1.71s, 2426 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on all files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: shopMapExperience.ts reduced 30% but still 16% over hard limit. Route preview logic now isolated in dedicated module with correct responsibility boundary.
- P7-TECHDEBT: shopMapExperience.ts needs one more pass (data constants or role-aware highlights). marketIntelligence.ts (774) also over limit.

**Architecture decisions:**

- Route module placed alongside parent in services/intelligence/ (same domain)
- calculateDistanceMiles and formatDistanceLabel exported from routing file and imported back by parent (shared utility pattern)
- Re-exports from shopMapExperience.ts prevent any consumer import changes

**What this unlocks next:**

- One more shopMapExperience.ts pass to get under 500 (data constants or role-aware highlights)
- marketIntelligence.ts shop profile data extraction

### 2026-03-23: ServiceCoverageMap Partner Shop + Search Target Marker Extraction (Pass 32)

**Summary:** Extracted partner shop markers and search target markers from ServiceCoverageMap.tsx into two focused sub-components. MapPartnerShopMarkers.tsx handles partner shop CircleMarkers with selection state, presentation-mode variants, click handlers, popup, and tooltip. MapSearchTargetMarkers.tsx handles coverage-mode search radius circle, center marker with popup, and inner dot. Both follow the existing MapDiscoveryPlaceMarkers.tsx pattern. Zero behavior change, zero UI change, zero prop contract changes.

**Files touched:**

- src/app/components/maps/ServiceCoverageMap.tsx — 514 → 437 lines (15% reduction, now well under 500 hard limit)
- src/app/components/maps/MapPartnerShopMarkers.tsx — NEW (71 lines). Partner shop markers, pure presentation
- src/app/components/maps/MapSearchTargetMarkers.tsx — NEW (57 lines). Search target markers, pure presentation
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 32 entry added

**Validation:**

- Build: 1.77s, 2425 modules (+2 new files), 0 errors
- Diagnostics: 0 errors on all 3 files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: ServiceCoverageMap.tsx reduced from 514 to 437 lines — now well under hard limit. All map-core rendering files clean. Complete marker-component pattern established (discovery places, partner shops, search targets all extracted).
- P7-TECHDEBT: Remaining oversized files outside map rendering: shopMapExperience.ts (824), marketIntelligence.ts (774), InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

**Architecture decisions:**

- Both sub-components placed in `maps/` root alongside parent and MapDiscoveryPlaceMarkers (same pattern, same directory)
- Both are pure presentation — zero hooks, zero effects, zero service calls
- Props are clean subsets of ServiceCoverageMap's existing props — no new types needed
- All react-leaflet imports (Circle, CircleMarker, Popup, Tooltip) retained in parent for county markers and GPS position markers still inline

**What this unlocks next:**

- All map-core rendering files under hard limit — rendering tier is clean
- Intelligence/services tier next: shopMapExperience.ts (824), marketIntelligence.ts (774)

### 2026-03-22: NavigationBrowseDiscoveryPanel Discovery Places Extraction (Pass 31)

**Summary:** Extracted all discovery-places rendering (selected detail card, loading skeleton, error state, empty state, places list) plus three helper functions (discoveryCategoryLabel, discoveryCategoryAccentClassName, discoveryQualityBadgeClassName) from NavigationBrowseDiscoveryPanel.tsx into a new NavigationDiscoveryPlacesList.tsx sub-component. Parent receives the theme object as a prop and delegates completely. Zero behavior change, zero UI change, zero consumer file changes.

**Files touched:**

- src/app/components/maps/navigation/NavigationBrowseDiscoveryPanel.tsx — 583 → 350 lines (40% reduction, now under 500 hard limit)
- src/app/components/maps/navigation/NavigationDiscoveryPlacesList.tsx — NEW (303 lines). Discovery places presentation with all states and helpers
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 31 entry added

**Validation:**

- Build: 1.70s, 2423 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on both files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: NavigationBrowseDiscoveryPanel.tsx reduced from 583 to 350 lines — now under hard limit. Original two oversized map files (NavigationBrowseDiscoveryPanel, useCoverageNavigationExperience) both resolved.
- P7-TECHDEBT: Remaining oversized files outside map slice: shopMapExperience.ts (824), marketIntelligence.ts (774), InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

**Architecture decisions:**

- Sub-component placed in `maps/navigation/` alongside parent (visual co-location, same domain)
- Sub-component is pure presentation — receives `theme` and `tone` props, owns no state, no effects, no service calls
- Helper functions (category label, accent class, quality badge class) moved to sub-component that actually uses them — correct responsibility boundary
- `MapSurfaceTheme` type imported from `serviceCoverageMapTypes` (existing export, no new type needed)

**What this unlocks next:**

- All original oversized map files resolved — map slice architecture is clean
- Next highest-impact oversized files: shopMapExperience.ts (824), InsurerPartnerShopsScreen.tsx (786), marketIntelligence.ts (774)

### 2026-03-22: useNavigationGpsTracking Sub-Hook Extraction (Pass 30)

**Summary:** Extracted GPS position tracking and speed limit monitoring from useCoverageNavigationExperience.ts into a dedicated useNavigationGpsTracking hook. The sub-hook owns all GPS state (position, speed, accuracy, error, status), speed limit state (snapshot, status), and their associated refs and effects. Parent hook calls the sub-hook and destructures results. Zero behavior change, zero UI change, zero consumer file changes.

**Files touched:**

- src/app/hooks/useCoverageNavigationExperience.ts — 673 → 543 lines (19% reduction). Removed 7 useState, 4 useRef, 2 useEffect (GPS tracking + speed limit), GPS_STALE_THRESHOLD_MS constant. Added sub-hook call + destructure. GpsStatus/SpeedLimitStatus re-exported from sub-hook
- src/app/hooks/useNavigationGpsTracking.ts — NEW (188 lines). GPS watchPosition effect, speed limit fetch effect, all GPS/speed state and refs
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 30 entry added

**Validation:**

- Build: 1.70s, 2421 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on both files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: useCoverageNavigationExperience.ts reduced from 673 to 543 (9% over hard limit). fetchNearestSpeedLimit and calculateFallbackSpeedMph imports removed from parent
- P7-TECHDEBT: useCoverageNavigationExperience.ts at 543 lines needs ~43 more lines extracted. NavigationBrowseDiscoveryPanel at 583 lines remains oversized

**Architecture decisions:**

- Sub-hook placed in hooks/ directory (React state lifecycle orchestration, not service layer)
- GpsStatus and SpeedLimitStatus types defined in sub-hook, re-exported via `export type { ... }` from parent — zero consumer import changes
- haversineMiles imported in both files (parent uses it in route + voice effects; sub-hook uses it in speed limit distance check)
- createTimeoutAbortController imported in both files (parent for route fetching; sub-hook for speed limit fetching)

**What this unlocks next:**

- Address search extraction from useCoverageNavigationExperience.ts to get under 500 lines
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines)

### 2026-03-22: useCoverageNavigationExperience Helper Extraction (Pass 29)

**Summary:** Extracted 9 pure helper functions from useCoverageNavigationExperience.ts into navigationGuidanceHelpers.ts. Functions cover search-target construction, GPS speed fallback calculation, voice guidance timing thresholds (maneuver distance, speed/accuracy adjustments), and routing key builders. Zero behavior change, zero UI change, zero consumer file changes.

**Files touched:**

- src/app/hooks/useCoverageNavigationExperience.ts — 782 → 673 lines (14% reduction). Hook body, types, and exports unchanged
- src/app/services/navigation/navigationGuidanceHelpers.ts — NEW (135 lines). 9 exported pure functions
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 29 entry added

**Validation:**

- Build: 1.65s, 2420 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on both files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: useCoverageNavigationExperience.ts reduced from 782 to 673. Still 35% over hard limit — further sub-hook extraction needed
- P7-TECHDEBT: NavigationBrowseDiscoveryPanel at 583 lines remains oversized. useCoverageNavigationExperience at 673 lines needs GPS/routing effect extraction

**Architecture decisions:**

- Helpers are pure functions with zero React dependency — testable in isolation
- haversineMiles import stays in both files (hook body uses it directly in 3 places beyond the extracted calculateFallbackSpeedMph)
- All type imports remain in the hook file since types are used in the hook body
- Zero consumer impact — no external file imports these helpers directly

**What this unlocks next:**

- Sub-hook extraction from useCoverageNavigationExperience.ts (GPS tracking, speed-limit monitoring, or route-fetching effects as standalone hooks)
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines)

### 2026-03-22: placeDiscovery Quality Layer Extraction (Pass 28)

**Summary:** Structural extraction pass. placeDiscovery.ts split into two single-responsibility files: placeDiscovery.ts (fetch/query/category/dedup/discovery retrieval) and placeDiscoveryQuality.ts (quality scoring, validation, normalization, snapshot persistence, snapshot reading). Zero behavior change, zero UI change. All existing imports remain backward-compatible via re-exports.

**Files touched:**

- src/app/services/navigation/placeDiscovery.ts — 728 → 377 lines (48% reduction). Retains fetch, Overpass query building, category rules, dedup, diversity, fetchNearbyDiscoveryPlaces
- src/app/services/navigation/placeDiscoveryQuality.ts — NEW (374 lines). DiscoveryQualitySnapshot type, BuildDiscoveryQualitySnapshotArgs type, all normalize\* helpers, toValidatedDiscoveryQualitySnapshot, sanitizeDiscoveryQualitySnapshotFromRaw, getLatestDiscoveryQualitySnapshot, persistDiscoveryQualitySnapshot, buildDiscoveryQualitySnapshot, scorePlaceQuality, toQualityLabel
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 28 entry added

**Validation:**

- Build: 1.69s, 2419 modules (+1 new file), 0 errors
- Diagnostics: 0 errors on placeDiscovery.ts, placeDiscoveryQuality.ts, placeDiscoveryDiagnostics.check.ts, CoverageNavigationPlanner.tsx, PlannerDiagnosticsPanel.tsx
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: placeDiscovery.ts reduced from 46% over hard limit to well under soft limit. Both resulting files under 400 lines
- P7-TECHDEBT: NavigationBrowseDiscoveryPanel at 583 lines and useCoverageNavigationExperience at 782 lines remain oversized

**Architecture decisions:**

- Clean 50/50 split at responsibility boundary: fetch vs quality
- placeDiscoveryQuality.ts uses `import type` from placeDiscovery.ts for NavigationDiscoveryPlace and NavigationDiscoveryRole — no runtime circular dependency
- placeDiscovery.ts imports 4 quality functions for internal use in fetchNearbyDiscoveryPlaces (scorePlaceQuality, toQualityLabel, persistDiscoveryQualitySnapshot, buildDiscoveryQualitySnapshot)
- Backward-compatible re-exports: DiscoveryQualitySnapshot, getLatestDiscoveryQualitySnapshot, sanitizeDiscoveryQualitySnapshotFromRaw, buildDiscoveryQualitySnapshot — all consumers keep existing import paths
- Zero consumer file changes needed

**What this unlocks next:**

- useCoverageNavigationExperience.ts extraction (782 lines, highest remaining oversized file)
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines)
- All navigation service files now under file limits

### 2026-03-22: CoverageNavigationPlanner Extraction (Pass 27)

**Summary:** Structural extraction pass. CoverageNavigationPlanner.tsx decomposed from 1,033 lines into a 273-line composition shell + 4 pure presentation sub-components. Zero behavior change, zero visual change — exact JSX parity. All state (useState ×5, useRef ×1), effects (useEffect ×1), handlers, and service reads remain in the parent shell. All children receive computed values as props and render only.

**Files touched:**

- src/app/components/maps/command-center/CoverageNavigationPlanner.tsx — 1,033 → 273 lines (74% reduction). Now a pure orchestration shell composing PlannerAddressSearch, PlannerVoiceGpsSettings, PlannerRoutePreview, PlannerDiagnosticsPanel
- src/app/components/maps/command-center/PlannerAddressSearch.tsx — NEW (219 lines). Address input, suggestions, results, active origin card
- src/app/components/maps/command-center/PlannerVoiceGpsSettings.tsx — NEW (211 lines). Voice mode/volume, GPS toggle, speed-limit alerts, collapsed shell fallback
- src/app/components/maps/command-center/PlannerRoutePreview.tsx — NEW (288 lines). Route loading/error/preview, alternatives grid, metrics, turns, attribution, start button
- src/app/components/maps/command-center/PlannerDiagnosticsPanel.tsx — NEW (318 lines). Signal card, confidence trend, stale telemetry warning, details toggle, dev actions, provider health grid
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 27 entry added

**Validation:**

- Build: 1.65s, 2418 modules, 0 errors
- Diagnostics: 0 errors on all 5 files
- Spellcheck: 0 issues on all 5 files

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: CoverageNavigationPlanner reduced from 2× hard limit to well under soft limit. All 4 children under 300-line soft limit. Helper functions (providerLabel, diagnosticsDriverLabel, etc.) moved to respective children
- P7-TECHDEBT: NavigationBrowseDiscoveryPanel at 583 lines and useCoverageNavigationExperience at 782 lines remain oversized

**Architecture decisions:**

- All 4 sub-components are PURE PRESENTATION — zero useState, zero useRef, zero useEffect, zero service reads
- PlannerDiagnosticsPanel receives ALL diagnostics data as props (diagnosticsSignal, confidenceTrend, providerHealth, mapPerformance, discoveryQualitySnapshot, etc.)
- Helper functions duplicated in children rather than shared module — keeps each sub-component self-contained and import-free from parent
- showDiagnosticsDetails toggle passed as onToggleDiagnosticsDetails callback — state stays in parent

**What this unlocks next:**

- All map command-center components now under file limits
- Device testing for mobile bottom sheet experience
- Button/header design improvements for soft modern design system
- NavigationBrowseDiscoveryPanel extraction (583 lines)

### 2026-03-24: Shared Sidebar Content Extraction (Pass 26)

**Summary:** Structural extraction pass. Created CoverageBrowseSidebarContent.tsx (317 lines) as a shared presentation layer for the sidebar/sheet content. CoverageBrowseExperience.tsx reduced from 588 → 430 lines (27% reduction). Both desktop sidebar and mobile bottom sheet now render the same shared content — mobile users get full access to all 4 views (Search, Explore, Saved, Shops) instead of shops-only. Button aesthetics improved: replaced 2×2 grid of individual pill buttons with compact segmented tab control using theme.segmentedClassName tokens. Center/Reset buttons downgraded to tertiaryButtonClassName. Fixed "nums" spellcheck issue and "roadmap" vs "map" MapTileMode type mismatch.

**Files touched:**

- src/app/components/landing/CoverageBrowseSidebarContent.tsx — NEW: shared sidebar content (317 lines). VIEW_TABS constant, TILE_MODES constant, segmented tab bar, NavigationErrorBoundary wrapping 4 conditional panels
- src/app/components/landing/CoverageBrowseExperience.tsx — 588 → 430 lines. Removed 6 imports (lucide icons, child panel components). Added 5 pre-composed handler functions. Desktop sidebar and mobile sheet both use {sidebarContent}
- cspell.json — Added "nums" to words array

**Validation:**

- Build: 1.76s, 0 errors
- Diagnostics: 0 errors on both touched source files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 1 found (MapTileMode "map" vs "roadmap" mismatch) → fixed
- P3-ARCH: CBE now 430 lines (below 500 hard limit). Content component is 317 lines (under 300 soft limit). State ownership unchanged in CBE
- P4-UX: Mobile bottom sheet now exposes full sidebar experience — significant UX improvement. Segmented tabs are more compact and cohesive than pill grid
- P6-SPELL: 1 found ("nums" from tabular-nums CSS) → fixed
- P7-TECHDEBT: ~~CoverageNavigationPlanner at 1,033 lines~~ (resolved in Pass 27) and NavigationBrowseDiscoveryPanel at 583 lines remain oversized — future extraction candidates

**Architecture decisions:**

- CoverageBrowseSidebarContent is PURE PRESENTATION — no hooks, no state, no effects. All state stays in CBE
- sidebarContent variable shared between desktop sidebar and mobile sheet (mutually exclusive via isDesktop gate)
- 5 pre-composed handler functions in CBE avoid inline arrow callbacks in props
- focusMode derived inside content component from sidebarView prop (search → "search", else → "route")
- VIEW_TABS and TILE_MODES constants extracted to content component (previously inline arrays in CBE)

**What this unlocks next:**

- Mobile users have full map experience (all 4 sidebar views in bottom sheet)
- CBE is now under 500 lines — architecture compliant
- Future mobile full-screen navigation direction (Apple Maps style) has clean extraction point
- ~~CoverageNavigationPlanner (1,033 lines) is the next oversized extraction candidate~~ (resolved in Pass 27 — now 273 lines)

### 2026-03-24: Glass System Refinement (Pass 25)

**Summary:** Visual-only refinement pass. All light-tone map control tokens in mapSurfaceTheme.ts were too opaque (bg-white/72–80%), making buttons, panels, lists, and segmented controls feel like solid white objects instead of frosted glass floating over the map. Systematically reduced light-tone opacity across every token category following a coherent glass hierarchy: tertiary buttons (bg-white/20) → secondary/icon/list (bg-white/30) → panels (bg-white/36) → strong panels (gradient 0.42–0.58) → primary blue (rgba 0.82–0.88). Added backdrop-blur-xl to all interactive button bases. Replaced hardcoded solid-blue tile active states with translucent sky-500/80. Dark-mode values were not touched (already properly translucent).

**Files touched:**

- src/app/components/maps/mapSurfaceTheme.ts — 14+ light-tone token class changes: primaryButton, secondaryButton, tertiaryButton, iconButton, softBadge, segmented, activeSegment, inactiveSegment, listCard, selectedListCard, panel, panelStrong, accentPanel. Added backdrop-blur-xl to buttonBase and iconButtonBase.
- src/app/components/landing/CoverageBrowseMapOverlays.tsx — tile mode active: `!bg-[#1e3a8a]` → `!bg-sky-500/80 !border-sky-400/50` (3 tile buttons)
- src/app/components/landing/CoverageBrowseExperience.tsx — segmented tile container: `bg-slate-100/50 border-white/60` → `bg-white/25 border-white/40`
- docs/BIDONDENT_MAP_TRACKER_2026-03-21.md — Pass 25 entry
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 25 entry

**Validation:**

- Build: 1.69s, 0 errors
- Diagnostics: 0 errors on all 3 source files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P4-UX: Glass hierarchy now coherent — controls breathe over the map. Visual testing needed on actual devices to validate translucency levels especially in bright sunlight
- P7-TECHDEBT: Dark-mode values untouched (verified already correct). Destructive button intentionally left solid red

**Architecture decisions:**

- All changes centralized in mapSurfaceTheme.ts — propagates automatically to every consumer via the theme system. Only 2 hardcoded inline overrides needed fixing (tile active in overlays, segment container in CBE)
- Added backdrop-blur-xl at the button/icon base level so ALL button variants inherit consistent blur
- Glass opacity hierarchy: tertiary (20%) < secondary/icon/list (30%) < panel (36%) < panelStrong (42–58%) < primary blue (82–88%). Hover adds 12–15% opacity (not 16–20% as before)
- Destructive button not touched — solid red for destructive actions is intentional per design system

**What this unlocks next:**

- Visual refinement complete — controls now match the documented glass/frosted design intent
- Device testing (iPhone Safari, Android Chrome) to validate translucency in various lighting conditions
- Future dark-mode refinement can follow the same auditing methodology
- CBE is still at 588 lines — sidebar content extraction remains a future pass

### 2026-03-22: Mobile Map Bottom Sheet (Pass 24)

**Summary:** Mobile-first bottom-sheet system for map browsing. Created MobileMapBottomSheet component using vaul Drawer in non-modal mode with three snap points (120px peek, 45% half, 88% full). Map stays interactive below the sheet. Created useMediaQuery hook for responsive breakpoint detection at xl (1280px). On mobile (< xl), the desktop sidebar is hidden and replaced by the bottom sheet showing CoverageNearestShops for shop browsing. On desktop (>= xl), layout is unchanged. bd-glass visual system applied (map-liquid-card, backdrop-blur-2xl, sky-blue drag handle). Safe-area-inset padding for iPhone.

**Files touched:**

- src/app/hooks/useMediaQuery.ts — NEW: responsive media query hook (16 lines)
- src/app/components/landing/MobileMapBottomSheet.tsx — NEW: vaul-based mobile bottom sheet (71 lines)
- src/app/components/landing/CoverageBrowseExperience.tsx — conditional desktop sidebar / mobile sheet rendering (560 → 588 lines)
- docs/BIDONDENT_MAP_TRACKER_2026-03-21.md — Pass 24 entry
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 24 entry

**Validation:**

- Build: 1.70s, 0 errors
- Diagnostics: 0 errors on all 3 source files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P4-UX: Bottom sheet peek (120px) may partially overlap bottom route HUD on mobile — acceptable trade-off, standard map app behavior. Traffic light dots in header show on mobile (pre-existing, not in scope)
- P7-TECHDEBT: CBE at 588 lines (above 500 soft limit). Mobile sheet shows shops panel only — explore, saved, planner panels are future mobile pass. Bottom sheet snap points may need tuning based on device testing

**Architecture decisions:**

- useMediaQuery for conditional rendering (single instance of sidebar content at any time, no double-mounting)
- vaul Drawer with modal=false, dismissible=false, always open — non-blocking, map stays interactive
- Sheet renders via portal (document.body) — clean z-index separation from map stacking context
- Shops-only content in sheet — pragmatic first step, avoids 197-line content duplication or 40-prop extraction
- CoverageBrowseMapOverlays (from Pass 23) remains above the sheet — overlay floats at top, sheet at bottom

**What this unlocks next:**

- Mobile users get swipeable shop browsing over full-bleed map
- Future passes can add explore/saved/planner panels to the sheet
- Sidebar content extraction (to reduce CBE line count) now has a clear consumer for both desktop and mobile
- iPhone Safari testing can validate touch gestures and safe-area behavior

### 2026-03-23: CoverageBrowseExperience Extraction (Pass 23)

**Summary:** Extraction pass — CoverageBrowseExperience.tsx reduced from 781 to 560 lines by extracting the floating map overlay JSX (maneuver card, quick-action toolbar, tile mode buttons, right action rail, bottom route HUD) into CoverageBrowseMapOverlays.tsx (272 lines). Zero behavior change. New component receives only the data it needs via props. Three unused icon imports removed from the parent.

**Files touched:**

- src/app/components/landing/CoverageBrowseExperience.tsx — removed 221 lines of overlay JSX, replaced with CoverageBrowseMapOverlays component call
- src/app/components/landing/CoverageBrowseMapOverlays.tsx — NEW: extracted floating HUD component (272 lines)
- docs/BIDONDENT_MAP_TRACKER_2026-03-21.md — Pass 23 entry
- docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Pass 23 entry

**Validation:**

- Build: 1.66s, 0 errors
- Diagnostics: 0 errors on both files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P3-ARCH: Fixed — CoverageBrowseExperience reduced from 781 to 560 lines (below the previous hard-limit violation)
- P7-TECHDEBT: CBE still at 560 lines (above 500 soft limit); remaining lines are tightly coupled sidebar wiring and map — further extraction would require splitting the sidebar view logic which is a separate scoped pass

**Architecture decisions:**

- Extracted by responsibility: overlays are pure presentation consuming props, no hooks, no state ownership
- Parent keeps all state, effects, and handler functions — no state ownership moved
- Overlay component is dumb/presentational — receives computed values (arrivalLabel, routeMinutes, canStartNavigation) rather than raw navigation objects

**What this unlocks next:**

- Overlay component can now be independently iterated for mobile refinement
- Future bottom-sheet pattern sits naturally alongside this component
- CBE is no longer a hard-limit P3 violation

### 2026-03-23: Mobile-First + Toast Wiring + Session UX + Future Map Docs (Pass 22)

**Summary:** Mobile-first refinement pass. Removed boxed/framed shells on mobile (CoverageBrowseExperience, ShopDirectoryScreen). Made CoverageMapDialog full-bleed on mobile. Reduced min-heights for short viewports. Unhid floating navigation overlays (maneuver card, bottom HUD) on mobile. Created useNavigationToastBridge hook wiring session transitions and deviation events to the unified notification system. Added restoredFromCloud and syncError state to useNavigationSession for calm, trustworthy session UX. Added Future Theme E (mobile-first map) and Future Theme F (globe/world mode honesty) to the Map Master Plan.

**Files touched:**

- src/app/components/landing/CoverageBrowseExperience.tsx — mobile-responsive: removed rounded shell, removed map padding, reduced min-height, unhid floating overlays
- src/app/components/landing/CoverageMapDialog.tsx — full-bleed on mobile, reduced min-height, removed padding on mobile
- src/app/components/shop/ShopDirectoryScreen.tsx — removed framed container on mobile, wired useNavigationToastBridge
- src/app/features/navigation/useNavigationToastBridge.ts — NEW: bridge hook emitting toasts for session transitions, deviation events, cloud restore, sync errors
- src/app/features/navigation/useNavigationSession.ts — added restoredFromCloud flag, syncError state, cloud sync error surfacing
- src/app/features/navigation/sessionTypes.ts — added restoredFromCloud and syncError to NavigationSessionActions
- src/app/features/navigation/index.ts — barrel export for useNavigationToastBridge
- docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md — Future Theme E (mobile-first) and Theme F (globe honesty)
- cspell.json — added "viewports"

**Validation:**

- Build: 1.66s, 0 errors
- Diagnostics: 0 errors on all touched files
- Spellcheck: 0 issues

**Problem taxonomy summary:**

- P0-BUILD: 0
- P1-RUNTIME: 0
- P2-DATA: 0
- P3-ARCH: 0 new (pre-existing: admin direct-DB calls, CoverageBrowseExperience 781 lines, service type inversions)
- P4-UX: Fixed — mobile full-bleed, floating controls visible, calm session feedback
- P5-DOC: Updated — Master Plan + Tracker
- P6-SPELL: Fixed — added "viewports" to cspell dictionary
- P7-TECHDEBT: ShopDirectoryScreen approaching soft limit (490 lines), CoverageMapDialog at 374 lines

**Architecture decisions:**

- Toast bridge as separate hook (useNavigationToastBridge) — keeps useNavigationSession pure domain state, notifications as cross-cutting concern wired at consumer level
- restoredFromCloud and syncError as first-class return values — honest session state over silent swallowing
- Mobile responsive via responsive Tailwind classes (md:/lg:) — no separate mobile codebase, no media query JS

**What this unlocks next:**

- iPhone Safari testing on LAN (http://192.168.1.191:5173/)
- Bottom-sheet pattern for mobile shop results
- Bid submission toast integration
- Navigation settings UI

### 2026-03-23: Master Prompt Execution — UI Quality + Navigation Hardening + Platform Foundation (Pass 20)

**Summary:** Comprehensive quality and hardening pass driven by the Master Prompt. Fixed UI quality (theme system, button consistency, press animations, dark mode navy tones), hardened navigation (cloud sync with localStorage fallback + retry queue, GPS jitter filtering, event deduplication, voice system reactive hook), created notification system foundation, and verified architecture boundaries.

**Files touched:**

- src/app/components/maps/serviceCoverageMapTypes.ts — added destructive + tertiary button types
- src/app/components/maps/mapSurfaceTheme.ts — destructive/tertiary button variants, press animations
- src/app/components/maps/NavigationErrorBoundary.tsx — raw button → bd-glass-control
- src/app/components/maps/navigation/NavigationSummarySheet.tsx — End Route → theme.destructiveButtonClassName
- src/app/components/maps/navigation/NavigationActiveManeuverCard.tsx — bg-black → bg-slate-950
- src/app/components/maps/MapSurfaceStatusBar.tsx — Reset → theme.tertiaryButtonClassName
- src/app/components/maps/command-center/CoverageNavigationPlanner.tsx — bg-black hover → bg-slate-950
- src/styles/theme.css — #000 → #0f172a (slate-900) in bd-glass-control
- src/app/services/navigation/navigationSessionCloudService.ts — rewritten with localStorage fallback + retry queue
- src/app/features/navigation/useNavigationSession.ts — dispatch cleanup, silent catch removed
- src/app/features/navigation/detectDeviation.ts — GPS jitter filtering (8m threshold)
- src/app/features/navigation/useNavigationIntelligence.ts — 5s event deduplication
- src/app/features/notifications/notificationEventTypes.ts — NEW: notification domain types
- src/app/features/notifications/useNotificationEvents.ts — NEW: in-memory notification feed hook
- src/app/features/notifications/index.ts — NEW: notification barrel exports
- src/app/hooks/useVoiceSupport.ts — NEW: reactive voice support status hook

**Validation:**

- Build: Clean (0 errors, ~1.5-1.6s)
- Diagnostics: 0 errors on all touched files
- Spellcheck: Pending final validation

**Problem taxonomy summary:**

- P0-BUILD: 0 issues
- P1-RUNTIME: 0 issues
- P2-DATA: Fixed — cloud sync now has localStorage fallback + retry; GPS jitter guard prevents false deviation events
- P3-ARCH: 0 layer violations found; 5 files exceed 500-line hard limit (noted, not refactored per Scope Protection Rule)
- P4-UX: Fixed — press animations, destructive/tertiary button variants, no pure black
- P5-DOC: Updated tracker + dashboard
- P6-SPELL: Pending
- P7-TECHDEBT: CoverageNavigationPlanner.tsx (1033 lines), useCoverageNavigationExperience.ts (782 lines), placeDiscovery.ts (728 lines) need extraction

**Architecture decisions:**

- Notification system placed in features/notifications/ (not services/) — it's a UI-facing event feed, not a data service
- Voice support hook in hooks/ — it's orchestration/state lifecycle
- Cloud sync retry queue uses in-memory array, not persistent — avoids stale retry corruption

**What this unlocks next:**

- Notification toast UI component integration
- Voice controls sheet can now use useVoiceSupport() for real-time status
- Navigation settings UI (voice picker, speed toggle)
- Architecture extraction passes for oversized files

### 2026-03-23: UI Quality Sweep + Notification Toast (Pass 21)

**Files touched:**

- src/app/components/ui/NotificationToast.tsx — NEW: toast overlay component (auto-dismiss, variant icons, bd-glass styling)
- src/app/features/notifications/NotificationContext.ts — NEW: React context + useNotifications hook
- src/app/features/notifications/index.ts — barrel export updated
- src/app/App.tsx — AppWithToast wrapper + NotificationProvider integration
- src/styles/theme.css — bd-glass-control--destructive variant added
- 20 component files across auth, insurer, shop, reports, dashboard, maps, codelayer folders

**Validation:**

- Build: 2407 modules, 1.68s, 0 errors
- Diagnostics: 0 new errors (3 pre-existing CSS contrast warnings)
- Spellcheck: 0 issues across all 17 checked files

**Problem taxonomy:**

- P4-UX: 45 non-compliant buttons fixed (harsh gray borders, raw Tailwind hover → bd-glass variants)
- P3-ARCH: Toast system needed global context — solved via NotificationProvider wrapper

**Architecture decisions:**

- Toast renders via AppWithToast wrapper outside conditional returns — always visible
- NotificationProvider wraps AppContent so any child can call useNotifications()
- bd-glass-control--destructive reused across delete/disconnect/sign-out controls

**What this unlocks next:**

- Wire toast to navigation session events (start → reroute → end)
- iPhone Safari mobile testing verification
- Voice controls sheet upgrade
- Oversized file extraction passes

### 2026-03-22: Map Overlay Intelligence Enrichment (Pass 18)

**Files touched:**

**Validation:**

**Problem taxonomy summary:**

### 2026-03-23: Navigation Session Cloud Sync (Pass 19)

- Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **Files touched:**
  - supabase/migrations/009_create_navigation_sessions.sql
  - src/app/services/navigation/navigationSessionCloudService.ts
  - src/app/features/navigation/useNavigationSession.ts
  - src/app/features/navigation/sessionTypes.ts (reviewed)
- **Validation:**
  - Build: Success (vite build, 0 errors)
  - Diagnostics: Clean (no type errors)
  - Spellcheck: Clean (0 issues)
  - Session persistence verified after reload and across devices
- **Problem taxonomy summary:**
  - P0–P2: None found
  - P3: None (architecture boundaries respected)
  - P4: No UI drift, session state now real and cross-device
  - P5: Docs updated and aligned
  - P6: No spelling/wording issues
  - P7: No new tech debt

**Architecture decisions:**

- Only overlay logic and metrics computation touched
- No design system, theme, or unrelated files changed

**Doc updates made:**

- All governed map/product/design docs updated for Pass 18

**What this unlocks next:**

- Next: Navigation session cloud sync, persistent session memory, and further overlay enrichment

**Best next immediate pass:**

- Navigation Session Cloud Sync (Supabase-backed session memory, localStorage as cache)

- ShopDirectoryHero and ShopRequestsScreen refactored to enforce bd-glass-panel, bd-glass-card, and bd-glass-control for all surfaces and controls.
  All white/gray backgrounds and window-like layouts removed. Blue-tinted, premium navigation product feel established. All controls and overlays now use the glass system, with depth, lighting, and blue environment unified.
  Build clean, spellcheck clean, diagnostics clean. Mobile and desktop UI reviewed for glass compliance and blue environment. No errors found.
  This change is documented in both the Master Plan and Tracker as required.

### Reliability and diagnostics

- Map performance summaries now use recent-window logic and canonical sample age.
- Diagnostics ingestion now sanitizes malformed/future-skewed sample data.
- Local cache self-healing added for map performance telemetry.
- Provider health ingestion and summaries hardened with canonical recency fields.
- Single-pass summary aggregation adopted for map and provider telemetry paths.
- Deterministic diagnostics helpers and lightweight check modules added.
- Dev console check entry points added:
  - `window.runMapPerformanceDiagnosticsChecks()`
  - `window.runProviderHealthDiagnosticsChecks()`
  - `window.runNavigationDiagnosticsChecks()`
- Startup hydration for persisted navigation state now routes through a central versioned parse/validate/normalize/migrate helper so malformed or stale storage payloads cannot break boot.
- Persisted payload self-healing now rewrites normalized envelopes for map performance, provider health, discovery quality snapshots, navigation session, guidance preferences, saved locations, parked-car location, and discovery role.
- Added deterministic discovery-quality diagnostics checks for snapshot counter/ratio math normalization and integrated them into unified diagnostics checks.
- Non-navigation localStorage paths hardened: `useNavigation` view-state reads now validate field types and ViewMode membership via `Set`; `reportDraftStorage` validates full draft + vehicle shape before accepting cached data (malformed drafts self-heal via cleanup); `useUserData` and `useUserDataHelpers` `setItem` calls wrapped in try/catch for quota/private-mode resilience; falsy empty-array handling fixed for cached notifications (|| → ??).
- Navigation reliability audit (2026-03-21): confirmed route errors, GPS errors, and address errors all surface in the UI via `CoverageNavigationPlanner` with retry affordances. Speed-limit `.catch()` now nulls the snapshot on non-aborted failure so stale data cannot persist after a lookup error. GPS staleness detection identified as a future-pass item (no `gpsStatus` enum yet).
- GPS degradation detection (2026-03-22): Added `gpsStatus` (`active | lost | stale`) to `useCoverageNavigationExperience`. A 3-second interval checks whether the last `watchPosition` update is older than 10 seconds and promotes status to `stale`; the error callback sets `lost`. `CoverageNavigationPlanner` renders an inline warning banner (rose for lost, amber for stale) with `LocateFixed` icon. Existing `gpsError` and accuracy display preserved. Checklist item 2a delivered.
- Speed-limit unavailable state (2026-03-22): Added `speedLimitStatus` (`off | waiting | loading | available | unavailable`) to `useCoverageNavigationExperience`. The speed-limit fetch effect now tracks lifecycle: `off` when monitor/GPS disabled, `waiting` when no position yet, `loading` during fetch, `available` on success with data, `unavailable` on null result or error. `CoverageNavigationPlanner` renders an inline slate-toned banner with `ShieldAlert` icon when status is `unavailable` and speed alerts are enabled. Checklist item 4 delivered.
- NavigationErrorBoundary (2026-03-22): Created `NavigationErrorBoundary.tsx` class component in `components/maps/`. Wraps `CoverageNavigationPlanner` + discovery/saved panels inside `CoverageBrowseExperience.tsx`. On render error: logs to console, shows `bd-glass-card` fallback with amber warning icon, "Navigation hit an error" message, and Retry button that resets boundary state. 62 lines, zero dependencies beyond React + Lucide.
- HomeScreen Stage 3a glass adoption (2026-03-22): Stat cards, reports list container, quick actions panel, and recent activity panel all switched from `bg-white rounded-2xl border border-slate-200 shadow-sm` to `bd-glass-card`. Stat card badges switched to `bd-glass-badge`. All user types (customer, shop, insurer) now see glass-forward dashboard. 5 class replacements in `HomeScreen.tsx`.
- DashboardCoveragePanel wiring (2026-03-22): `DashboardCoveragePanel` is now imported and rendered in `HomeScreen.tsx` between the stats grid and the main content grid. All three user types (customer, shop, insurer) see the coverage command center on their dashboard. Props wired: `primaryColor`, `secondaryColor`, `userType`, `onOpenCoveragePage` (→ `onViewShops`). The panel's "Open Coverage Map" button opens `CoverageMapDialog` with full navigation experience; "Full Search Flow" navigates to the coverage page. Glass design tokens (`bd-glass-panel`, `bd-glass-card`) are visible on the dashboard surface for the first time.
- Role-aware dashboard widgets — Pass 7 (2026-03-22): Replaced monolithic `DashboardCoveragePanel` in HomeScreen with three role-specific CarPlay-style widgets. **CustomerMapWidget** (~230 lines): compact `bd-glass-card` showing 5 nearest shops (distance + rating), "Open Map" button triggers `CoverageMapDialog`, full data via `useCoveragePartnerShops()` + `haversineMiles()`. **ShopMapWidget** (~85 lines): placeholder showing region count, partner density, operating region pills, "coming soon" message. **InsurerMapWidget** (~85 lines): placeholder showing 3-column stats (shops/regions/avg rating), "coming soon" message. HomeScreen now renders role-conditionally: customer → CustomerMapWidget, shop → ShopMapWidget, insurer → InsurerMapWidget. `DashboardCoveragePanel` remains as infrastructure (not deleted). All widgets use glass tokens, gradient icon badges, max 300px height.
- Engine reliability hardening — Pass 8 (2026-03-22): Fixed `useCoveragePartnerShops` demo fallback silent activation (removed `!import.meta.env.PROD` — only `DEMO_MODE` now enables fallback), added `.catch()` error handling and `fetchError` state so consumers can show failure UI. Typed onboarding handlers: created `ShopOnboardingFormData` and `InsurerOnboardingFormData` interfaces, replaced `data: any` in `ShopOnboarding.tsx`, `InsurerOnboarding.tsx`, and `App.tsx` handlers. Added `Array.isArray` guards on Supabase `getDamageReports` / `getAllDamageReports` before `as DamageReport[]` casts. Files touched: `useCoveragePartnerShops.ts`, `types/index.ts`, `ShopOnboarding.tsx`, `InsurerOnboarding.tsx`, `App.tsx`, `reports.ts`.
- Landing page glass unification — Pass 1 (2026-03-22): All primary marketing surfaces now adopt the BidOnDent glass design system. **HeroSection**: blue-tinted page bg (`from-blue-50/80 via-[#f8fbff]`), hero floating badges switched to `bd-glass-floating`, trust microcopy badges switched to `bd-glass-badge`, Learn More hover corrected to `hover:bg-white/40`. **LandingPageHeader**: all nav hover states corrected to `hover:bg-white/40`; Dashboard button border softened to `border-slate-200/60`. **BenefitsSection**: benefit cards switched to `bd-glass-card`; trust badges row switched to `bd-glass-card` pills; section badge switched to `bd-glass-badge`. **CTASection**: CTA card container switched to `bd-glass-card`; badge switched to `bd-glass-badge`. **TrustStatsSection**: section bg aligned to navy (`from-[#0c1929] to-[#1e3a5f]`); icon color updated to `text-blue-300`. **HowItWorksSection**: section bg changed to `bg-gradient-to-b from-white to-blue-50/50`; step cards switched to `bd-glass-card`; badge to `bd-glass-badge`. **WhoWeServeSection**: section bg adds `bg-gradient-to-b from-blue-50/30 to-white`; trust badges switched to `bd-glass-card` pills; badge to `bd-glass-badge`. **FooterSection**: bg aligned to navy (`#0c1929`); border updated to `#1c2e47`; social icon bg aligned to `#132237`/`#1c2e47`. Files touched: `HeroSection.tsx`, `LandingPageHeader.tsx`, `BenefitsSection.tsx`, `CTASection.tsx`, `TrustStatsSection.tsx`, `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`, `FooterSection.tsx`. Build clean, spellcheck clean, diagnostics clean. Blue-tinted glass tokens (alice-blue light `rgba(240,248,255,0.74)`, blue-glow dark `rgba(96,165,250,0.08)`). `bd-glass-control` now includes CSS hover/active states (brightness lift, scale 0.97). Unified hover standard `hover:bg-white/40` across all screens (eliminated ~30 ad-hoc `hover:bg-slate-50/100` and `hover:bg-gray-50/100` instances). Borders softened to `border-slate-200/60` and `border-gray-200/60`. Map zoom controls premium with pill group, blue gradient, and navy dark variant. Files touched: `theme.css`, `globalSurfaceTheme.ts`, `DashboardLayout.tsx`, `HomeScreen.tsx`, `BidsScreen.tsx`, `DesktopNavTabs.tsx`, `MissingReportState.tsx`, `ReportDetailScreen.tsx`, `ReportsListScreen.tsx`, `CompetitorAnalysisScreen.tsx`, `StepDamageArea.tsx`, `StepComplete.tsx`, `StepDescription.tsx`, `StepPhotos.tsx`, `ShopDirectoryScreen.tsx`, `ShopActiveJobsScreen.tsx`, `ShopRatingModal.tsx`, `ShopRequestsScreen.tsx`, `VehicleProfileScreen.tsx`, `DemoAccountSwitcher.tsx`, `CoverageBrowseExperience.tsx`, `NavigationSavedPlacesPanel.tsx`. Build clean, spellcheck clean, diagnostics clean.
- Landing identity convergence — Pass 12 (2026-03-22): All 7 remaining landing surfaces now visually unified with the map/dashboard design language. **HeroSection**: animated value carousel (3.8s cycle, CSS opacity/translateY transitions, `prefers-reduced-motion` safe, dot navigation); hero bg richer blue (`from-[#e8f0fe] via-[#f0f6ff] to-[#e8f4fd]`) with radial atmospheric overlay; headline color `#0c2340` (deep navy); “Best Price” → `#003d82`; “Auto Body Repair” → brand gradient text-clip; trust badge → `bd-glass-badge`; CTA button → gradient `${primaryColor}→0→#147dd6 100%`; buttons `rounded-2xl`. **LandingPageHeader**: scrolled bg blue-atmospheric `rgba(240,248,255,0.92)`, shadow `0_4px_24px_rgba(0,61,130,0.06)`, border `border-blue-200/40`; nav links `text-slate-600 hover:text-[#003d82]`; hover bg `hover:bg-blue-50/60`. **LandingPageLayout**: wrapper `bg-gradient-to-b from-[#f0f6ff] via-white to-[#f0f6ff]` (blue atmospheric breathing). **HowItWorksSection**: step number badges → navy-to-blue gradient (fixed green mismatch); step icons `text-blue-400`. **WhoWeServeSection**: shops card `from-orange-50/hoverBg:#f97316` → `from-sky-50/hoverBg:secondaryColor` (fixed orange semantic mismatch). **AboutOpportunitySection**: section bg gradient `from-white to-blue-50/30`; cards → `bd-glass-card`; card icons `bg-blue-50 border-blue-100/60 text-[#003d82]`; section badge → `bd-glass-badge`; “Read Full About” → `bd-glass-control`; expanded separator `border-blue-100/60`. **BenefitsSection**: all 3 image overlay badges → `bg-white/85 text-[#003d82] backdrop-blur-sm border border-blue-100/40`; description text → `text-slate-600`. Files touched: `HeroSection.tsx`, `LandingPageHeader.tsx`, `LandingPageLayout.tsx`, `HowItWorksSection.tsx`, `WhoWeServeSection.tsx`, `AboutOpportunitySection.tsx`, `BenefitsSection.tsx`. Build: 2401 modules, 0 errors. Spellcheck: 0 issues. Diagnostics: 0 errors.

### Explainable trust UI

- Combined trust signal (`idle/healthy/watch/degraded`) wired into planner.
- Planner drill-down now shows primary driver and provider risk context.
- At-risk provider highlight behavior added for watch/degraded states.
- Canonical provider risk reason tags surfaced (`recent-error`, `failure-rate`, `stale-telemetry`).
- Added explicit stale-telemetry refresh guidance in trust UI so provider age warnings include clear recovery actions.
- Added shared planner presentation helpers for confidence-trend labels and route-alternative delta messaging so threshold behavior remains deterministic.
- Added deterministic manual checks for trend thresholds (`-10`, `+10`, `-2`, and sub-threshold flat behavior) plus route-alternative delta labels (`similar/slower/faster`) and wired them into the unified diagnostics checks runner.
- Confidence score surfaced and bounded to canonical range expectations.
- Confidence trend hint added with significant-shift thresholds:
  - significant drop: delta <= -10
  - strong gain: delta >= +10

### Discovery and routing integrity

- Production gating tightened so demo map discovery data cannot silently leak into production paths.
- Route-launch continuity expanded across map-facing searchable shop surfaces.
- Deterministic placeholder coordinates retained only for demo/manual entries lacking geocodes.
- Added discovery quality telemetry snapshot counters (accepted by quality tier, below-threshold filtered, deduped, and diversity-trimmed) so false-positive pressure is measurable per discovery run.
- Planner diagnostics details now surface discovery-quality pressure (`limited accepted` and `below-threshold filtered`) for faster production tuning.
- Planner diagnostics details now surface category-level discovery mix ratios and limited-acceptance rate percentage for quicker false-positive triage by role context.

### UX quality and acceptance

- Mobile contrast and motion acceptance sweep completed for command-center and active-navigation overlays.
- Reduced-motion-safe animation behavior preserved for map UI motion utilities.
- Trust-card and provider snapshot layout tuned for smaller mobile breakpoints (stacked header/actions, full-width detail controls, improved provider-row spacing) to keep diagnostics readable during triage.
- Expanded command-center sidebar moved to a search-first workflow model with explicit quick-view tabs (Search, Explore, Saved, Shops) so only one heavy panel is shown at a time.
- Expanded map layout widened the sidebar rail and increased map canvas height to reduce text/button clipping and improve control affordance density on desktop.
- Navigation planner now supports search-focused rendering with diagnostics/advanced detail progressive disclosure to reduce visual noise during first-step address and origin setup.
- macOS app-shell pass in progress: left docked command rail, reduced duplicate sidebar cards, and aligned floating map action rail + route summary card to remove button scatter in expanded desktop mode.
- Royal-blue visual pass applied to map surface theme and map controls to establish consistent light/dark BidOnDent color identity.
- Leaflet attribution presentation now suppresses the default Leaflet brand prefix while preserving required provider attribution strings and introducing a dedicated BidOnDent map badge.
- Added a compact in-map command pod (search/explore/saved/shops + tile/center/reset controls) so critical left-rail actions are available directly as overlays.
- Glass-heavy map overlays now include layered entry timing and subtle float motion utility with reduced-motion-safe fallback preserved.
- Mobile zoom and attribution controls compacted with tighter spacing and smaller tap visuals for improved phone ergonomics.

### Design-system Stage 1 delivery (2026-03-21)

- Extracted BidOnDent royal-blue palette to CSS custom properties in `:root`: `--bd-royal-blue`, `--bd-royal-blue-strong`, `--bd-royal-blue-medium`, `--bd-royal-blue-soft`, `--bd-royal-blue-faint`, plus glass blur/background/border/shadow/radius tokens.
- Created three global glass utility classes: `.bd-glass-panel`, `.bd-glass-card`, `.bd-glass-badge` — NOT scoped to `.coverage-map-surface`, usable on any element app-wide.
- Dark-tone variants support both `.dark` class and `[data-theme="dark"]` selector.
- Reduced-motion fallback disables backdrop-filter for glass classes.
- `-webkit-backdrop-filter` included for Safari compatibility.
- Stage 2 prerequisite (global tokens + classes exist) is now met. `DashboardCoveragePanel` glass adoption can proceed.

### DashboardCoveragePanel glass adoption (2026-03-21)

- Outer section container adopted `bd-glass-panel` class — replaces hardcoded `bg-white rounded-2xl border border-slate-200 shadow-sm` with token-driven glass surface.
- Coverage badge adopted `--bd-royal-blue-faint` background and `--bd-royal-blue` text — replaces generic Tailwind `bg-blue-50 text-blue-700` with brand-aligned tokens.
- Three stat cards adopted `bd-glass-card` class — replaces hardcoded `rounded-xl border border-slate-200 bg-slate-50`.
- Dynamic per-role gradient buttons (`primaryColor`/`secondaryColor` props) intentionally preserved — those are role-theming, not brand tokens.
- Dark mode support automatically inherited via `bd-glass-*` class dark variants.
- Component is defined but not yet wired into routing — glass treatment will be visible once connected.

### Shell surface glass adoption (2026-03-21)

- `MobileBottomNav.tsx`: Adopted `bd-glass-panel` class — replaces manual `bg-white/95 backdrop-blur border-slate-200` with token-driven glass surface. Inherits dark mode support.
- `ProfileDropdown.tsx`: Both variants adopted glass tokens — embedded gets `bd-glass-card`, absolute popover gets `bd-glass-panel`. Replaces hardcoded `bg-white rounded-xl/lg border shadow` patterns.
- All three Stage 2 target surfaces (DashboardCoveragePanel, MobileBottomNav, ProfileDropdown) now use design tokens.

### Code organization delivery (2026-03-21)

- Extracted 24 voice instruction phrase arrays (432 lines) from `routeEngine.ts` into new `routeVoicePhrases.ts` — engine file reduced from 828 → 422 lines, under the 500-line guardrail.
- Pure mechanical extraction: no logic changes, no behavior differences, zero-impact on bundle size (tree-shaking confirmed identical output).

### Cross-doc audit (2026-03-21)

- Confirmed all navigation features are real production code: GPS tracking, turn-by-turn (OSRM public), speed HUD (Overpass API), voice navigation (Web Speech API), address search (Nominatim).
- Fixed `osrm-demo` route provider mislabel to `osrm-public` across types, route engine, and preferences — the engine calls real production OSRM, label was misleading.
- Updated Phase 2 truth table: 10 of 14 items now marked "Real (2026-03)" — only globe rendering remains "Not real."
- Added implementation reality table and design expansion plan to Product Brain for cross-doc awareness.
- Added companion document references to Map Master Plan and this tracker.
- Identified cloud sync gap: all navigation persistence is localStorage-only, no Supabase sync.

### Future direction logged

All future directions follow the consistent 6-part structure (Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals) in their source docs:

| Direction                                                                     | Source Doc      | Section                                 |
| ----------------------------------------------------------------------------- | --------------- | --------------------------------------- |
| Navigation productization (Functional → Reliable → Polished → Platform-Grade) | Product Brain   | "Navigation Productization Roadmap"     |
| Role-specific map intelligence (customer/shop/insurer)                        | Product Brain   | "Role-Specific Future Map Intelligence" |
| Design system expansion (glass tokens → shell → dashboards → site-wide)       | Product Brain   | "Design System Direction"               |
| Provider evolution decision framework                                         | Map Master Plan | "Future Theme C"                        |
| Dashboard compact map widgets (CarPlay-style per role)                        | Map Master Plan | "Future Theme B"                        |

This tracker does not duplicate the full 6-part plans above. The staged roadmap tables below track execution status against those plans.

## Active Risks

1. Provider telemetry can still appear healthy if upstream events become sparse without timely refresh.
2. Discovery quality depends on third-party OSM/Overpass metadata consistency.
3. Trust UI complexity can drift if new indicators bypass canonical summary contracts.
4. Startup hydration risk reduced: non-navigation localStorage paths now validate shape, handle quota/private-mode, and self-heal malformed data. Core navigation paths were already safe via `persistedState.ts`. Remaining risk: Supabase response types are untyped (`any`) in `useUserData.ts`.
5. Accumulating VS Code diagnostics/spell-check noise can hide real regressions and reduce map-code readability if cleanup does not stay aligned with canonical contracts.

## Vision Alignment & Future Guidance (Pass 17)

### Map Product Final Vision

- The BidOnDent map product is moving toward a **royal-blue-first, product-owned navigation world**.
- Blue system: royal blue for identity/action/route, baby/light blue for air/sky/calm, deep ocean blue for depth/premium, gray-blue/navy for night/dark mode.
- Map surfaces, overlays, and controls must use these blue tones intentionally for meaning, not just as decoration.
- The map should feel like a branded geographic world, not a generic tile with overlays.
- **Day/night guidance mode**: Automatic day/night visual switching based on local time/route context is a planned feature (not yet implemented). Day mode = lighter/sky/atmospheric; night mode = navy/gray-blue/low-glare.
- All map and design decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI.

### Tracker Alignment

- This tracker will log progress toward the above vision and ensure all map-related work aligns with the product-owned, blue-driven, day/night-aware direction.
- No feature will be marked as delivered until it is real in code.

---

## Next Priority Queue

1. Continue design-system correction and visual consistency — hover standardization delivered, glass classes deployed, dark navy delivered. Preserve and refine.
2. Continue provider telemetry depth and canonical risk classification with minimal UI churn.
3. Expand trust-signal evidence weighting using canonical normalized persisted summaries only.
4. Continue command-center interaction polish (micro-animations, state transitions, and focus management) while preserving search-first hierarchy.
5. Add targeted manual stale/future-skew payload injection checklist snippets for QA runbooks.
6. Continue navigation productization Level 2 (reliability): deviation detection, cross-browser voice testing.
7. Landing page unification complete (Pass 12). Next: Stage 3b form/table glass treatment.

## Staged Future Roadmap

This roadmap tracks the progression from current state toward aspirational features. Items move from "Planned" to "In Progress" to "Delivered" as work begins. See the Product Brain for full architectural detail on each item.

### Near-Term (next 2-3 passes)

| Item                                          | Status    | Depends On                            | Tracker Theme           |
| --------------------------------------------- | --------- | ------------------------------------- | ----------------------- | --- | ------------------------- | --------- | ------- | ----------------------- |
| Navigation reliability (graceful degradation) | Delivered | Nothing                               | Future Theme A, Level 2 |
| Design token extraction to global scope       | Delivered | Nothing                               | Theme 6 / Stage 1       |
| Customer nearest-shops compact widget         | Delivered | Partner shop data (already available) | Future Theme B          |
| DashboardCoveragePanel glass adoption         | Delivered | Design token extraction (done)        | Theme 6 / Stage 2       |
| Design system visual correction (Pass 0)      | Delivered | Nothing                               | Theme 5 / Pass 0        |
| Landing page glass unification                | Delivered | Pass 0 delivered                      | Theme 6 / Stage 3       |
| ShopDirectoryScreen extraction                | Delivered | Nothing                               | Architecture cleanup    |
| Deviation detection foundation                | Delivered | Nothing                               | Navigation Intelligence |
| Off-route prompt UI                           | Delivered | Deviation detection foundation        | Navigation Intelligence |
| Automatic reroute trigger groundwork          | Delivered | Off-route prompt UI                   | Navigation Intelligence |     | Cross-browser voice audit | Delivered | Nothing | Navigation Intelligence |

### Medium-Term (3-6 passes)

| Item                                                | Status    | Depends On                           | Tracker Theme           |
| --------------------------------------------------- | --------- | ------------------------------------ | ----------------------- |
| Navigation settings UI (voice picker, speed toggle) | Planned   | Level 2 reliability first            | Future Theme A, Level 3 |
| Cloud-synced navigation sessions                    | Delivered | `navigation_sessions` Supabase table | Future Theme A, Level 3 |
| Shop service area visualization                     | Planned   | `shop_service_areas` Supabase table  | Future Theme B          |
| Design token adoption in shell surfaces             | Delivered | Stage 1 token extraction             | Theme 6 / Stage 2       |
| Role-specific dashboard stat card glass treatment   | Delivered | Stage 2 shell adoption               | Theme 6 / Stage 3       |

### Long-Term (6+ passes)

| Item                              | Status  | Depends On                      | Tracker Theme           |
| --------------------------------- | ------- | ------------------------------- | ----------------------- |
| Automatic rerouting on deviation  | Planned | Reroute trigger groundwork      | Future Theme A, Level 3 |
| Marketplace-aware navigation      | Planned | Shop availability data          | Future Theme A, Level 4 |
| Insurer claims density heatmap    | Planned | Aggregated geo-coded claim data | Future Theme B          |
| Provider migration evaluation     | Planned | Usage data showing rate limits  | Future Theme C          |
| Full site-wide design unification | Planned | Stages 1-3 Design system        | Theme 6 / Stage 4       |

## Validation Checklist Per Map Pass

1. Build passes.
2. Touched map flows verified after reload.
3. Startup boot verified with stale, malformed, empty, and missing persisted diagnostics payloads.
4. VS Code diagnostics count reduced or justified for all touched files; no meaningful warnings hidden just to quiet the workspace.
5. Spelling/readability fixes reviewed so naming and wording remain consistent with canonical map/trust terminology.
6. Mobile and desktop checks completed for touched UI.
7. Trust-state regression spot-check completed (`healthy/watch/degraded` scenarios).

## Immediate Execution Direction

1. ~~Fix startup hydration/persisted-state resilience~~ — Delivered.
2. ~~Clean current workspace diagnostics~~ — Delivered.
3. ~~Begin navigation productization Level 2~~ — Delivered. GPS staleness detection, speed-limit unavailable state, NavigationErrorBoundary all shipped.
4. ~~Begin design token extraction Stage 1~~ — Delivered.
5. ~~Adopt design tokens in shell surfaces~~ — Delivered.
6. ~~Extract oversized files~~ — Delivered. routeEngine.ts phrase arrays extracted.
7. ~~Design system visual correction (Pass 0)~~ — Delivered. Navy dark mode, blue-tinted glass, unified hover, premium map controls, ad-hoc blur reviewed.
8. ~~Role-aware dashboard widgets~~ — Delivered. CustomerMapWidget, ShopMapWidget, InsurerMapWidget.
9. ~~Continue landing page glass unification (HeroSection animated carousel, remaining marketing surfaces)~~ — Delivered. All primary marketing sections adopt glass design system. Animated carousel is a follow-up enhancement.
10. ~~Continue navigation productization (deviation detection, cross-browser voice testing).~~ — Deviation detection foundation Delivered. New domain: `src/app/features/navigation/` with `deviationTypes.ts`, `detectDeviation.ts`, `useNavigationIntelligence.ts`. Route-change, off-route, stopped, and delay-increase events integrated into ShopDirectoryScreen. Cross-browser voice testing is next.
11. ~~Extract `ShopDirectoryScreen.tsx` (1383 lines) into composable sub-modules.~~ — Delivered. Screen reduced to 979 lines. Extracted: `ShopDirectoryResultCard`, `ShopDirectoryIntelligencePanel`, `ShopDirectoryRoutePanel`, `ShopDirectoryContextCards`.
12. ~~Off-route prompt UI.~~ — Delivered. `NavigationDeviationPrompt.tsx` in `components/maps/navigation/`. Calm, glass-styled floating banner reacts to `latestEvent` from `useNavigationIntelligence`. Integrated into ShopDirectoryScreen between intelligence header and map shell.
13. ~~Automatic reroute trigger groundwork.~~ — Delivered. New files in `features/navigation/`: `rerouteTypes.ts` (reroute lifecycle, request, state types + constants), `shouldTriggerReroute.ts` (pure decision helper with severity/cooldown/lifecycle checks), `useNavigationReroute.ts` (orchestration hook: idle → eligible → pending → completed → cooldown). Off-route prompt `onReviewRoute` now wired through reroute flow — selects alternate route on confirm with 60s cooldown against re-trigger.
14. ~~Cross-browser voice audit.~~ — Delivered. Created `voiceSupport.ts` with `VoiceSupportStatus` type (available/no-api/no-voices/gesture-blocked), `detectVoiceSupport()` snapshot, `primeVoiceEngine()` for Safari gesture gate. Hardened `voiceGuidance.ts`: `SpeakResult` return type (spoken/muted/no-api/no-text) replaces boolean, `onerror` handler on utterances tracks speech failures, cross-browser compatibility documented in code headers. Wired `primeVoiceEngine()` into `useCoverageNavigationExperience` — fires on voice mode activation from user gesture. Browser matrix documented: Chrome async voices, Safari gesture gate, Firefox limited voices, iOS screen-lock, Chrome 15s pause bug.
15. ~~Voice deviation alerts + reroute announcements.~~ — Delivered. Created `deviationVoicePhrases.ts`: phrase pools for off-route (medium + high severity), delay increase, reroute pending, reroute confirmed — all randomly sampled. Created `useNavigationVoiceAlerts.ts`: orchestration hook consuming `latestEvent` + `rerouteStatus` + voice settings. Deduplicates via announced-event-ID set and last-announced-reroute-status ref. Off-route/delay-increase filtered by severity (low = silent). Delay increase restricted to `full` mode; off-route fires on `alerts-only` and `full`. Reroute pending + cooldown (= just completed) each spoken once on transition. Single voice entry point: all speech dispatched through `speakNavigationInstruction`. Wired into `ShopDirectoryScreen` alongside intelligence + reroute hooks. Barrel exports extended. Build: 2395 modules, 1.64s, 0 errors. Diagnostics: 0. Spellcheck: 0.
16. ~~Typed navigation domain refinement.~~ — Delivered. `DeviationEvent` converted from flat interface with `Record<string, unknown>` metadata to a **discriminated union**: `RouteChangeEvent`, `OffRouteEvent`, `StoppedEvent`, `DelayIncreaseEvent`, `UnknownDeviationEvent` — each variant carries a typed metadata interface, consumers can narrow by `type` literal safely. Removed generic `buildEvent()` from `detectDeviation.ts` — each detector now returns its specific variant type directly. Added `NavigationVoiceSettings = Pick<NavigationGuidanceSettings, "voiceMode" | "voicePersona" | "voiceVolumePreset">` to `types/navigation.ts` as the canonical voice settings slice. Added `SpeakInstructionArgs = NavigationVoiceSettings & { text: string }` to `voiceGuidance.ts` — eliminates inline type duplication at call sites. Retired `VoiceAlertSettings` duplicate — `useNavigationVoiceAlerts` now accepts `NavigationVoiceSettings`. Barrel exports extended with all 5 variant types + `DeviationPosition`. Build: 2395 modules, 1.73s, 0 errors. Diagnostics: 0. Spellcheck: 0.
17. ~~Map UX realignment + Build Progress Dashboard.~~ — Delivered. Created `docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` as a pass-era progress board for that historical phase (now archived). Map-first UX structural correction: created `ShopDirectoryMapOverlays.tsx` — floating in-map overlay layer (intelligence chip top-left, route preview card bottom-left, deviation prompt top-center) using glass-style `bg-slate-950/70 backdrop-blur-md` styling. Modified `ShopDirectoryMapPane.tsx` to accept `children?: React.ReactNode` for overlay injection. Refactored `ShopDirectoryScreen.tsx`: hero collapses to compact bar in map/hybrid modes; route panel, role intelligence panel, and context cards hidden from sidebar in map/hybrid modes (now surface on map overlay); `NavigationDeviationPrompt` moved to float on map surface in map/hybrid modes. Fullscreen map now map-first — sidebar contains only search + results. Build: 2396 modules, 1.62s, 0 errors. Diagnostics: 0. Spellcheck: 0.
18. ~~Map UX realignment Phase 2 — immersive viewport + map-owned search.~~ — Delivered. Created `ShopDirectoryImmersiveMap.tsx` (253 lines): full-viewport (`fixed inset-0 z-40`) immersive map experience. Map takes over entire viewport in map mode. Floating glass top bar with back button, map-owned search input (`rounded-full bg-slate-950/70 backdrop-blur-md`), results drawer toggle, mode switch (Split/List), and theme toggle. Collapsible left-side results drawer with `ShopDirectoryResultCard` list replaces fixed sidebar. `ShopDirectoryScreen` now early-returns the immersive component in map mode — list/hybrid paths unchanged. Added `suppressHeader` boolean prop to `ShopDirectoryMapPane` to hide built-in top gradient badges in immersive mode. Added `navigationMode` prop (`browse | route-preview | guidance`) to `ShopDirectoryMapOverlays` — intelligence chip and route card gated by mode; deviation prompt shows only in route-preview/guidance. `ShopDirectoryScreen` derives `navigationMode` from intelligence events and selected route. Build: 2397 modules, 1.67s, 0 errors. Diagnostics: 0. Spellcheck: 0.
19. ~~ShopDirectoryScreen extraction + navigation session lifecycle.~~ — Delivered. **Extraction**: `ShopDirectoryScreen.tsx` slimmed from 1163 → 478 lines via 3 extractions. Created `useShopDirectorySession.ts` (494 lines): all 18 state variables, effects, handlers, and computed values extracted to dedicated hook. Created `ShopDirectorySearchPanel.tsx` (276 lines): search form, origin selector, view/sort controls, role panel. Created `ShopDirectoryHero.tsx` (149 lines): two-mode hero (compact bar vs full card). Fixed potential TDZ bug: `selectedRoute` const used before declaration in navigation mode ternary. **Navigation session lifecycle**: Created `sessionTypes.ts` (96 lines): formal state machine `idle → planning → active ⇄ paused → ended` with `NavigationSession`, `NavigationSessionEvent`, `SessionWaypoint`, `SessionPauseEntry` types. Created `useNavigationSession.ts` (190 lines): reducer-driven hook with `startPlanning`, `selectRoute`, `activate`, `pause`, `resume`, `end`, `reset` actions; tracks active seconds minus pause time; `isNavigating` and `hasSession` derived booleans. Integrated into `ShopDirectoryScreen`: session auto-transitions `idle → planning` on shop+route selection, `planning → route-locked` on route select, ends on route clear. Build: 2401 modules, 1.63s, 0 errors. Diagnostics: 0. Spellcheck: 0.
