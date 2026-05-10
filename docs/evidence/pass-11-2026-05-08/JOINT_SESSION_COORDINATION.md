# Joint Session Coordination — Audit AI ↔ Co-worker AI

**Date:** 2026-05-08
**Communication channel:** this file + AI_LOCK.md + REF_KNOWN_ISSUES.md (per user directive: "communicate through codebase doc updates")
**Canonical reference (Pass 27):** [`SESSION_LOG_2026-05-08_CANONICAL.md`](SESSION_LOG_2026-05-08_CANONICAL.md) is the authoritative session-wide log shipped by co-worker AI Pass 27. This coordination doc remains the running per-pass scoreboard; the canonical log is the post-session reference.
**Master-builder paste-ready dispatch:** [`MASTER_BUILDER_AUTOPILOT_DISPATCH.md`](MASTER_BUILDER_AUTOPILOT_DISPATCH.md) — direct dispatch for the next master-builder Opus session.
**Owner authorization in effect:** "go full auto now for hours, full authority with other ai"

---

## §1. Joint session output (Pass 11 → Pass 21)

### Audit AI track

| Pass | Files | Scope | Status |
| --- | --- | --- | --- |
| 12 | `MapPaneLegendPanel.tsx` + REF_KNOWN_ISSUES | KI-164 + KI-166 collapse-default + localStorage persist | RESOLVED |
| 13 | `ShopDirectoryRoutePreviewCard.tsx` | KI-162 partial-app + KI-169 second-half L176 swap | STAGED |
| 14.1 | `services/supabase/map.ts` | KI-165 root cause — `getPublicPartnerShops` timeout | RESOLVED |
| 14.1.5 | `DashboardCoveragePanel.tsx` | Silent-failure fetchError leak | RESOLVED |
| 14.2 | `services/networkProfiles.ts` | 5-call timeout wrap | RESOLVED |
| 14.3 | `services/supabase/runtime.ts` + `edgeFunctions.ts` | Shared edge wrappers — cascade benefit | RESOLVED |
| 15 | `services/auth/websitePreferencesSync.ts` + `websiteRelationshipsSync.ts` | Promise.race → canonical AbortController (soft leak) | RESOLVED |
| 16 | `networkProfiles.ts` + `adminIntake.ts` | Helper retrofit to shared `fetchWithTimeout` | RESOLVED |
| 17 | `marketIntelligence.ts` + `nyMetroTestHubSeed.ts` | Dormant export removal + KI-100 scope correction | RESOLVED |
| 18b | `userDataUtils.ts` | `toMapReportShape` dead alias removed | RESOLVED |
| 19b | (read-only audit) | PII console-statement gating in auth/nav/hooks | CLEAN — zero new fixes |
| 19c | (read-only audit) | CSS forbidden warm-tone palette + LAW canonical values | CLEAN — zero violations |
| 19d | (read-only audit) | Build config + `verify_jwt = false` invariant | CLEAN — invariant preserved |
| 22b | (read-only audit) | Realtime subscription cleanup at services/realtime/* (3 files) | CLEAN — all 3 services properly unsubscribe + `supabase.removeChannel()` |
| 24 prep | `STEP_B_SCOPE_CLARIFICATION.md` (new evidence file) | Step B as plan-doc-framed doesn't map to codebase reality (bottom-right is MapLibre built-ins, not custom). Documented mismatch + 4 corrected-scope candidates for master-builder review. **DEFERRED** rather than shipping a misguided extraction. | DEFERRED |
| 25 | `hooks/useScrollAnimation.ts` (-52 LoC) + `utils/photoUtils.ts` (-78 LoC) + `hooks/useUserDataHelpers.ts` (-94 LoC) | Dead-code removal continuing co-worker's dormant-exports sweep. Independently verified each candidate before removal (4 of 5 photoUtils exports + 6 of 10 useUserDataHelpers exports + useCountUp). Net **−224 LoC** removed; typecheck PASS. | RESOLVED |
| 26 (cowork) | `PLAN_MAP_UNIFICATION_2026-05-08.md` (+31) + `REF_KNOWN_ISSUES.md` (+27) + `AI_LOCK.md` + `PASS_26_DOC_ONLY_CONTINUATION.md` (134) | Doc-only continuation: §4 Step A annotated as PARTIAL SHIP with Engine A deferral; §4 Step B annotated NOT FEASIBLE AS SCOPED; KI-177 (shadcn ui/ ~4,100 LoC dormant) + KI-178 (hooks/utils ~260 LoC dormant) enrolled. New gate #6 — Engine A consumer strategy (a/b/c). | RECORDED |
| 27 (cowork) | `SESSION_LOG_2026-05-08_CANONICAL.md` (286 lines, NEW) + `MASTER_BUILDER_AUTOPILOT_DISPATCH.md` (231 lines, NEW) | Canonical session reference docs: full pass-by-pass arc 9→27, source/doc deltas, 15-KI cumulative state, 6 gates, 2 methodology lessons, 4 next-track recommendations, evidence index. Plus paste-ready master-builder dispatch (second person, decision authority + gate breakdown + final "Go" line). Total evidence dir = 18 files. | DELIVERED |

### Co-worker AI track

| Pass | Files | Scope | Status |
| --- | --- | --- | --- |
| 11 evidence | 5 docs (engine matrix, KI surface area, LAW/REF notes, sanity check) | Pass 11 documentation batch | DELIVERED |
| 14.1.6 | `CustomerMapWidget` + `ShopMapWidget` + `InsurerMapWidget` | 3-widget fetchError parity | RESOLVED |
| 14.4 | `services/supabase/adminIntake.ts` | Timeout wrap | RESOLVED |
| 14.5 | `components/landing/WaitlistCapture.tsx` | Timeout wrap | RESOLVED |
| 15 | `services/navigation/requestTimeout.ts` | Shared `fetchWithTimeout` extraction (+43 lines) | DELIVERED |
| 18 | `components/codelayer/HomeScreenSections.tsx` | LAW Light-Mode Surface Rule fixes | RESOLVED |
| 19 | `services/supabase/authSession.ts` + `reports.ts` + `estimateRequests.ts` | PII console-statement DEV-gating | RESOLVED |
| 20 | (read-only audit) | Code-quality null sweep | CLEAN |
| 21 | (read-only audit) | LAW Law 6 edge-function auth coverage (22 handlers) | CLEAN |
| **23 / Step A** | **`src/app/components/maps/shell/MapProgramTopBar.tsx` (NEW, 199 lines)** | **Master builder Pass 180 §7.5 authorized — pure presentational lift of immersive-fullscreen top-bar shape only. Engine-A union (Coverage* + MapSurfaceControls) intentionally deferred to post-§1.4/§1.5-fork-resolution Step A.2.** | **DELIVERED** |

### Joint cumulative metrics

- **22 source files modified**
- **Source delta: ~+695 / -412 lines** (net functional improvement after dead-code removal)
- **Typecheck: PASS exit 0** end-to-end after every pass
- **6 evidence files** on disk
- **6+ KI status updates** in REF_KNOWN_ISSUES.md
- **Zero LAW violations** found across 4 read-only audit dimensions

### KI status board

| KI | Was | Now |
| --- | --- | --- |
| KI-164 | OPEN P1-LAYOUT | RESOLVED Pass 12 |
| KI-165 | OPEN P2-LAYOUT | PARTIAL-RESOLVED — service-layer + soft-leak class closed; DOM verify pending |
| KI-166 | OPEN P2-LAYOUT | RESOLVED Pass 12 (co-resolved) |
| KI-162-reopen + KI-169 second-half | OPEN | STAGED Pass 13 |
| Dashboard error-UX parity | (new finding) | RESOLVED Pass 14.1.5 + 14.1.6 |
| Soft auth-sync leak class | (new finding) | RESOLVED Pass 15 |
| KI-100 scope | "20+ consumer refactor" | DOWNGRADED P3-DEAD-CODE-MOSTLY |
| Dormant exports (4 confirmed) | (new finding) | REMOVED Pass 17 + 18b |
| LAW Law 6 edge auth coverage | (audit needed) | VERIFIED CLEAN Pass 21 |
| LAW Light-Mode design rule | (audit needed) | VIOLATIONS FIXED Pass 18 + Pass 19c CLEAN |
| PII console statements | (audit needed) | DEV-GATED Pass 19 + Pass 19b CLEAN |

---

## §2. Pass 22 candidate roster (forward-looking)

Both AIs at genuine exhaustion of safely-parallel work from sandbox. Candidates below are queued for fresh authorization or environment access.

### A — Master-builder authorization required

| Candidate | Scope | Authority gate |
| --- | --- | --- |
| ~~Step A — `MapProgramTopBar` extraction~~ | **DELIVERED Pass 23 by co-worker AI** — 199-line scaffold at `src/app/components/maps/shell/MapProgramTopBar.tsx`. Immersive-fullscreen shape only; Engine-A union deferred to A.2. | Closed |
| **Step A.2 — host-discriminator extension** | Extend `MapProgramTopBar` with `host="landing-dialog"` / `host="dashboard-fullscreen"` discriminators that select the appropriate UX shape (immersive shape vs MapSurfaceControls shape). | Gates on §1.4/§1.5 fork resolution — master builder picks (a-revised)/(b)/(c) first |
| **Step B — `MapProgramUtilityCluster` extraction** | New file at `src/app/components/maps/shell/MapProgramUtilityCluster.tsx`. Lift locate-me / recenter / compass / zoom. Pure presentational. | Co-worker AI ↔ audit AI consensus on next-pass authorship; master builder hasn't authorized yet but Step A precedent suggests it would clear |
| Plan doc §1.4/§1.5 fork resolution | Choose (a-revised) restructure / (b) footnote / (c) hold-for-owner | Master builder owes a response on the 3-engine reality |
| KI-162 reopen vs companion routing | Master builder picks the routing direction | Open question |
| KI-100 follow-on path | Owner picks: wire `buildShopRecommendations` into a real consumer (path 1) OR remove it as dead code (path 2) | Owner directive |
| F-1 vs F-2 commit fold call | Master builder picks atomic-revert granularity for the Pass 12 → Pass 21 cluster | Open question |
| §6 anti-regression items 15-18 fold | Co-worker proposed 4 additions (mileage, nav-engine containment, atmosphere preservation, motion-reduce comprehensiveness); master builder edits plan doc §6 | Open question |

### B — External environment access required

| Candidate | Blocker |
| --- | --- |
| KI-159 + KI-160 advisor pass | Supabase MCP authorization (advisor count + pg_get_expr verification) |
| KI-165 DOM React-fiber verify | Chrome MCP / dev-server with working tile load |
| KI-173 + KI-174 evidence capture | Browser screenshots / DevTools traced source values |

### C — Owner directive required

| Candidate | Blocker |
| --- | --- |
| Engine convergence: 1 engine + 1 shell vs N engines + 1 shell | Strategic owner decision (Phase 3 of unification roadmap) |
| Persona switcher promotion to landing | Owner pick (LAW § Public Scope) |
| Step C — dashboard-fullscreen migration | Master-builder + owner sign-off after Step A lands |

---

## §3. Coordination protocol (post-this-doc)

### Communication channel

- **AI_LOCK.md** — claim/standdown for active edits (per protocol lesson Pass 14.1.6 → 14.5 race)
- **This file** (`JOINT_SESSION_COORDINATION.md`) — append updates as new passes ship
- **REF_KNOWN_ISSUES.md** — KI status updates (Co-Update Rules from CLAUDE.md)
- **STAGED_EDITS_SANITY_CHECK.md** — co-worker's running pass log
- **DORMANT_EXPORTS_SWEEP.md** — co-worker's dead-code investigation

### File-touch boundaries

To minimize race conditions if either AI continues without master-builder review:

- **Audit AI primary territory:** `services/supabase/`, `services/auth/`, `services/intelligence/`, `src/app/hooks/`, root configs (`tsconfig.json`, `vite.config.ts`)
- **Co-worker primary territory:** `components/`, `src/styles/theme.css`, evidence files in `docs/evidence/pass-11-2026-05-08/`, `AI_LOCK.md`
- **Shared territory** (claim AI_LOCK first): `REF_KNOWN_ISSUES.md`, `services/navigation/requestTimeout.ts`, plan doc

### Hard stops (no proceed without explicit per-session owner override)

Per CLAUDE.md `LAW_PROJECT_RULES`:

- LAW conflicts (any LAW_*.md doc)
- Destructive data changes
- Auth/storage invariants (`verify_jwt: false` pin, signed-URL persistence, Clerk JWT verification location)
- Schema migrations APPLIED to live DB
- Provider changes (MapLibre + OSRM + Nominatim + Overpass — locked stack)
- Deploy/secret actions
- Apex design canon edits to `MOLANDJESUS_DESIGN_DECISIONS.md` (additive-only with `docs(canon):` prefix and active-phase citation)

---

## §4. Standing six gates (Pass 26 added gate #6)

1. **Host clear of `.git/*.lock`** → 8+ commits land cleanly
2. **Master builder §1.4/§1.5 fork** → unblocks plan doc restructure + Step A scope clarity
3. **Master builder F-1 vs F-2 commit fold** → granularity decision for Pass 12-21 cluster
4. **Master builder KI-162 routing** → reopen vs companion KI
5. **Owner engine convergence pick** → 1 engine vs N engines (Phase 3 gate)
6. **(NEW Pass 26) Master builder Engine A consumer strategy** — (a) two co-existing top-bar components, (b) `MapProgramTopBar` grows a `variant` prop, or (c) defer indefinitely

Plus 5 follow-on gates per §2.B + §2.C above.

---

## §5. Final cumulative working tree state (audit AI snapshot 2026-05-08)

```
Modified sources (~22):
  components/codelayer/HomeScreenSections.tsx              cowork Pass 18
  components/dashboard/CustomerMapWidget.tsx               cowork Pass 14.1.6
  components/dashboard/DashboardCoveragePanel.tsx          audit  Pass 14.1.5
  components/dashboard/InsurerMapWidget.tsx                cowork Pass 14.1.6
  components/dashboard/ShopMapWidget.tsx                   cowork Pass 14.1.6
  components/landing/WaitlistCapture.tsx                   cowork Pass 14.5
  components/shop/MapPaneLegendPanel.tsx                   audit  Pass 12
  components/shop/ShopDirectoryRoutePreviewCard.tsx        audit  Pass 13-staged
  hooks/userDataUtils.ts                                   audit  Pass 18b
  services/auth/websitePreferencesSync.ts                  audit  Pass 15
  services/auth/websiteRelationshipsSync.ts                audit  Pass 15
  services/intelligence/marketIntelligence.ts              audit  Pass 17
  services/intelligence/nyMetroTestHubSeed.ts              audit  Pass 17 (stub)
  services/navigation/requestTimeout.ts                    cowork Pass 15
  services/networkProfiles.ts                              audit  Pass 14.2 + 16
  services/supabase/adminIntake.ts                         cowork Pass 14.4 + audit Pass 16
  services/supabase/authSession.ts                         cowork Pass 19
  services/supabase/edgeFunctions.ts                       audit  Pass 14.3
  services/supabase/map.ts                                 audit  Pass 14.1
  services/supabase/reports.ts                             cowork Pass 19
  services/supabase/runtime.ts                             audit  Pass 14.3

Modified docs (3):
  REF_KNOWN_ISSUES.md                                      audit  Pass 12-19
  AI_LOCK.md                                               cowork  protocol updates
  ANTI_REGRESSION_13_14_VERIFICATION.md                    cowork  extended

Untracked evidence (6+):
  STAGED_EDITS_SANITY_CHECK.md                             cowork
  ENGINE_SURFACES_MATRIX.md                                cowork
  PASS_D_KI_SURFACE_AREA.md                                cowork
  PASS_D_LAW_REF_NOTES.md                                  cowork
  DORMANT_EXPORTS_SWEEP.md                                 cowork
  PASS_18_19_DESIGN_SECURITY_SWEEP.md                      cowork
  JOINT_SESSION_COORDINATION.md                            audit  (this file)
```

**Source delta: +695 / -412**
**Typecheck: PASS exit 0**
**Five gates unchanged.**

End of joint coordination doc.
