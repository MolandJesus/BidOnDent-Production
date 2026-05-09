# Cooperative Session Log — 2026-05-08

**Canonical record** of the multi-AI cooperative work performed on 2026-05-08. Read this single doc for the full picture; deeper detail lives in the linked evidence files.

**Participants:**

- **audit AI** — primary territory: `services/`, `hooks/`, root configs, REF_KNOWN_ISSUES, plan docs
- **cowork-A** — primary territory: `components/`, `src/styles/`, evidence files, AI_LOCK
- **Mola (owner)** — directive relay, gate decisions, external-access actions
- **master builder (Opus, dispatched at session close)** — gate decisions 2/3/4/6, charter authority

**Branch:** working tree on disk; uncommitted (host `.git/*.lock` blocks commits)
**Final cluster typecheck:** PASS exit 0

---

## §1. Session-arc summary (what got done)

| Pass | AI | Scope | Outcome |
|------|----|-------|---------|
| 9    | audit | KI-170/171/172 surfaced; Coverage Dialog ↔ Smart Shop Map parity audit | KI added |
| 10   | audit | KI-172 banner ship in `CoverageBrowseExperience` (`bd-notice--warn`); plan doc authored | RESOLVED + plan |
| 11   | cowork | Anti-regression sweeps; evidence batch | Evidence drop |
| 12   | audit | KI-164 ROUTE/legend overlap fix in `MapPaneLegendPanel` | RESOLVED |
| 13   | audit | KI-169 alternative-card mileage sanity (staged) | PARTIAL |
| 14   | both | Dashboard error-UX parity (Customer/Insurer/Shop widgets); cooperative-edit race logged | Shipped + lesson |
| 14.1 | audit | `services/supabase/map.ts` + `DashboardCoveragePanel` cleanups | Shipped |
| 14.2 | audit | `networkProfiles.ts` cleanup | Shipped |
| 14.3 | audit | `edgeFunctions.ts` + `runtime.ts` cleanups | Shipped |
| 14.4 | cowork | `adminIntake.ts` cleanup | Shipped |
| 14.5 | cowork | `WaitlistCapture.tsx` cleanup | Shipped |
| 15   | audit | `websitePreferencesSync.ts` + `websiteRelationshipsSync.ts` cleanups | Shipped |
| 15   | cowork | `requestTimeout.ts` cleanup | Shipped |
| 16   | audit | `networkProfiles.ts` round-2 + `adminIntake.ts` audit pass | Shipped |
| 17   | audit | `marketIntelligence.ts` + `nyMetroTestHubSeed.ts` (stub) | Shipped |
| 18   | cowork | `HomeScreenSections.tsx` cleanup | Shipped |
| 18b  | audit | `userDataUtils.ts` cleanup | Shipped |
| 19   | cowork | `authSession.ts` + `reports.ts` cleanups | Shipped |
| 19b  | cowork | Auth/nav/hooks PII negative-finding sweep | Clean (negative finding) |
| 19c  | cowork | CSS palette negative-finding sweep | Clean (negative finding) |
| 20   | cowork | TODO/quality negative-finding sweep | Clean (negative finding) |
| 21   | cowork | Edge-function auth negative-finding sweep | Clean (negative finding) |
| 22   | cowork | Sandbox-vs-host build constraint logged; first standdown | Standdown |
| 23   | cowork | **Step A PARTIAL SHIP** — `MapProgramTopBar.tsx` canonical L2 home; `ImmersiveMapTopBar` shim | Shipped (Engine B coverage) |
| 24   | cowork | **Step B feasibility** — NOT FEASIBLE AS SCOPED; MapLibre-native control divergence | Blocker logged |
| 25   | audit | **Dead-code prune** — −224 LoC across 3 files (`useCountUp` + 4 `photoUtils` exports + 6 `useUserDataHelpers` exports); cowork-A overstatement corrected | Shipped + KI-178 RESOLVED |
| 25b  | cowork | Shadcn `ui/` dormant audit | KI-177 (47 of 53 dormant ~4,178 LoC) |
| 26   | cowork | Plan doc §4/§7.5 partial-ship annotation; KI-177/178 enrolled | Doc-only ship |
| 27   | cowork | KI-178 RESOLVED status fold-in; KI-177 numbers re-verified; methodology lesson logged | Doc-only ship + standdown |

---

## §2. Source delta

### Modified files (~25)

**Components (8):**
```
components/codelayer/HomeScreenSections.tsx              cowork  Pass 18
components/dashboard/CustomerMapWidget.tsx               cowork  Pass 14.1.6
components/dashboard/DashboardCoveragePanel.tsx          audit   Pass 14.1.5
components/dashboard/InsurerMapWidget.tsx                cowork  Pass 14.1.6
components/dashboard/ShopMapWidget.tsx                   cowork  Pass 14.1.6
components/landing/WaitlistCapture.tsx                   cowork  Pass 14.5
components/shop/ImmersiveMapTopBar.tsx                   cowork  Pass 23 (re-export shim)
components/shop/MapPaneLegendPanel.tsx                   audit   Pass 12
components/shop/ShopDirectoryRoutePreviewCard.tsx        audit   Pass 13-staged
```

**Hooks / utils (4):**
```
hooks/userDataUtils.ts                                   audit   Pass 18b
hooks/useScrollAnimation.ts                              audit   Pass 25 (useCountUp removed)
hooks/useUserDataHelpers.ts                              audit   Pass 25 (6 dead exports)
utils/photoUtils.ts                                      audit   Pass 25 (4 dead exports)
```

**Services (11):**
```
services/auth/websitePreferencesSync.ts                  audit   Pass 15
services/auth/websiteRelationshipsSync.ts                audit   Pass 15
services/intelligence/marketIntelligence.ts              audit   Pass 17
services/intelligence/nyMetroTestHubSeed.ts              audit   Pass 17 (stub)
services/navigation/requestTimeout.ts                    cowork  Pass 15
services/networkProfiles.ts                              audit   Pass 14.2 + 16
services/supabase/adminIntake.ts                         cowork  Pass 14.4 + audit Pass 16
services/supabase/authSession.ts                         cowork  Pass 19
services/supabase/edgeFunctions.ts                       audit   Pass 14.3
services/supabase/map.ts                                 audit   Pass 14.1
services/supabase/reports.ts                             cowork  Pass 19
services/supabase/runtime.ts                             audit   Pass 14.3
```

### New files (1)

```
src/app/components/maps/shell/MapProgramTopBar.tsx       cowork  Pass 23 (canonical L2 shell)
```

### Net source delta

```
Pass 12-21 cluster:    +695 / -412
Pass 25 prune:                  -224
Pass 23 new file:      +~150 (MapProgramTopBar.tsx)
─────────────────────────────────────
Net:                   ≈ +845 / -636
```

### Verification

- `npx tsc --noEmit` → **PASS exit 0** across the full cluster (last run end of Pass 25)
- `npm run build` → **BLOCKED in sandbox** (rollup native-module mismatch: sandbox=x86_64 Linux vs host=Apple Silicon arm64). Must run host-side
- `vitest` → **BLOCKED in sandbox** (same rollup constraint)
- `eslint` → **NOT CONFIGURED** at project level (no `eslint.config.*`)
- Typecheck remains the highest verification ceiling reachable from inside the sandbox

---

## §3. Doc delta

| Doc | Change | By |
|-----|--------|----|
| `docs/REF_KNOWN_ISSUES.md` | KI-160/161/162/163/164/165/166/167/168/169/170/171/172/177/178 added; KI-161/162/164/166/167/172/178 marked RESOLVED | both |
| `docs/PLAN_MAP_UNIFICATION_2026-05-08.md` | §4 Step A annotated PARTIAL SHIP; §4 Step B annotated NOT FEASIBLE AS SCOPED with re-scope options; §7.5 partial-ship + new gate #6 (Engine A consumer strategy) | cowork (Pass 26) |
| `AI_LOCK.md` | Cooperative-edit lesson logged (Pass 14 race); Pass 22/26/27 standdowns; last-commit pointer extended | cowork |
| `docs/evidence/pass-11-2026-05-08/*` | 17 evidence files | both |

---

## §4. Known Issues (KIs) cumulative state

### Added this session

| KI | Title | Severity | Status |
|----|-------|----------|--------|
| KI-160 | `multiple_permissive_policies` — ~25 duplicate RLS policy pairs (~110 advisor warnings) | P2-PERF | PARTIAL AUTHORIZED |
| KI-161 | Active navigation — duplicate maneuver instruction across NEXT MANEUVER + Live Navigation | P1-CONTENT | **RESOLVED** Pass 14 |
| KI-162 | Active navigation — `liveRemainingEtaLabel` rendered "Nm" instead of "N min" | P1-CONTENT | **RESOLVED** Pass 14 |
| KI-163 | Active navigation — control sprawl across 5 corners | P2-DESIGN | OPEN |
| KI-164 | Smart Shop Map fullscreen — ROUTE box overlapped legend strip by 129px | P1-LAYOUT | **RESOLVED** Pass 12 |
| KI-165 | Smart Shop Map fullscreen — phantom second top-bar pill leaks past load | P2-LAYOUT | PARTIAL Pass 14 |
| KI-166 | Smart Shop Map fullscreen — bottom legend strip eats 185px (20%) of viewport | P2-LAYOUT | **RESOLVED** Pass 12 |
| KI-167 | Smart Shop Discovery — "My Location" preset chip duplicated | P2-CONTENT | **RESOLVED** Pass 14 |
| KI-168 | Smart Shop Map fullscreen entry — three layered transition states visible during load | P2-LOADING | OPEN |
| KI-169 | Dashboard mini-map ROUTE — alternative cards mix meters + miles + 21-hour value | P2-CONTENT | FIRST HALF SHIPPED Pass 13 |
| KI-170 | Landing Coverage Dialog vs Dashboard Smart Shop Map — 100% divergent design language | P1-PARITY | OPEN (subsumed by plan doc) |
| KI-171 | Landing — three different map presentations stacked vertically | P2-CONSISTENCY | OPEN (paired with KI-170) |
| KI-172 | Landing Coverage Dialog — 6 rated pins but Shops tab "0 partner shops" | P1-DATA | **RESOLVED** Pass 10 |
| KI-177 | shadcn/ui primitive boilerplate — 47 of 53 files dormant (~4,178 LoC dead) | P3-TECH-DEBT | **OPEN** post-launch janitor |
| KI-178 | hooks/utils dormant exports — `photoUtils` 4/5 dead, `useUserDataHelpers` 6/10 dead, `useCountUp` dead (~−224 LoC) | P3-TECH-DEBT | **RESOLVED** Pass 25 |

### Pre-existing referenced KIs

`KI-002` (RESEND_API_KEY P0 launch blocker — owner external action), `KI-053`, `KI-075`, `KI-118`, `KI-140`, `KI-145`, `KI-147`, `KI-152`, `KI-158`, `KI-159` (auth_rls_initplan family — AUTHORIZED next pass).

---

## §5. The six gates

| # | Gate | Authority | Status |
|---|------|-----------|--------|
| 1 | Host `rm -f .git/*.lock` so 8+ commits can land | **Mola** (external) | OPEN |
| 2 | Plan-doc §1.4/§1.5 fork (a-revised / b / c) | **Master builder** | OPEN |
| 3 | F-1 vs F-2 commit fold (Pass 12-21 granularity) | **Master builder** | OPEN |
| 4 | KI-162 reopen vs companion KI routing | **Master builder** | OPEN |
| 5 | Engine convergence pick (1 engine vs N engines) | **Mola** (Phase 3) | OPEN |
| 6 | Engine A consumer strategy — (a) two-component split / (b) `variant` prop / (c) defer | **Master builder** | OPEN (NEW Pass 23) |

---

## §6. Two methodology lessons logged this session

### Lesson 1 — Cooperative-edit race (Pass 14 Step 1.6)

Cowork-A shipped 3-widget edits while audit AI was reading the same files. No merge conflict because edits were identical scope and pattern, but the protocol gap was real.

**Rule going forward:** when starting work after a previous standdown, re-claim AI_LOCK Active AI before any source-file edit, even if the work is a continuation of an earlier-authorized track. Each work batch needs its own claim/standdown cycle. The standdown line records "Pass X complete," not "all subsequent edits authorized."

### Lesson 2 — Dormant-export sweep methodology (Pass 27 / KI-178 correction)

Cowork-A's Pass 25/25b grep methodology used path patterns that did not catch all consumer permutations. Audit AI's independent verification surfaced 4 missed live consumers (`compressImage` had 6 consumers, not 0; `useUserDataHelpers` had 10 exports, not 6).

**Rule going forward:** dormant-export sweeps must enumerate exports by name and grep each name individually:

```bash
grep -rln "<exportName>" src/ --include="*.ts" --include="*.tsx" | grep -v "<file-itself>"
```

Both lessons should propagate into `docs/REF_AI_COLLABORATION_PROTOCOL.md` next time a master-builder pass opens it for revision.

---

## §7. The four next viable tracks (master builder authority decides)

### Track A — Engine A migration (gate #6 dependency)

If gate #6 = (b) `variant` prop: extend `MapProgramTopBar.tsx` with `variant: "inline" | "immersive"`, migrate `CoverageBrowseExperience` from `MapSurfaceControls` to `<MapProgramTopBar variant="inline" />`. Pure presentational lift; verify typecheck + visual parity at 1440×900 + 390×844.

If gate #6 = (a) two-component split: amend plan doc; mark Step A fully shipped under new scope; document rationale in `REF_VISUAL_SYSTEM.md`.

If gate #6 = (c) defer: amend `LAW_HARDENING_PLAN.md` with deferral + revisit triggers.

### Track B — KI-177 janitor pass

Post-launch P3 by current policy, but master builder can authorize early. Delete 47 dormant `ui/` files (~4,178 LoC) + their `@radix-ui/react-*` peer deps from `package.json`. Closed-graph proof in KI-177; one consolidated commit. Verify each dep removal doesn't break `node_modules` resolution for the 6 alive `ui/` files.

### Track C — `<MapEngineCanvas>` extraction (Step C.1)

Highest-leverage architectural move. Lifts MapLibre map instance + lifecycle into shared canvas. Resolves Step B's feasibility blocker (factory-registered MapLibre controls). Required precondition for engine-convergence gate #5. Estimated 3-5 passes; first pass introduces `<MapProgramShell host="dashboard-fullscreen">` + `<MapEngineCanvas>` and feeds existing `<MapLibreServiceCoverageMap>` into it. No behavior change.

### Track D — KI-164 host pinpoint

Outstanding investigation. Resolution unblocks Step A's third migration target (dashboard Smart Shop Map host). Trace from `grep -rn "ImmersiveMapTopBar\|MapSurfaceControls" src/ --include="*.tsx" | grep -i dashboard`.

---

## §8. External-access work (NOT in any AI scope)

| Action | Purpose | Who |
|--------|---------|-----|
| `rm -f .git/*.lock` | Land 8+ queued commits | Mola |
| `npm run build` | Verify production bundle (rollup native-module sandbox blocker) | Mola |
| `vitest` run | Unit suite verification | Mola |
| `supabase secrets set RESEND_API_KEY=...` | KI-002 P0 launch blocker | Mola |
| Browser DOM verification | KI-165 / KI-173 / KI-174 evidence captures | Chrome MCP / Mola |
| Supabase advisor query | KI-159 / KI-160 RLS performance findings | Supabase MCP / Mola |

---

## §9. Authority boundaries (LAW)

NO AI may do without explicit per-session owner override:

- LAW conflicts (any LAW_*.md doc edit beyond additive)
- Destructive data changes
- Auth/storage invariants (`verify_jwt: false` pin, signed-URL persistence ban, Clerk JWT verification location)
- Schema migrations applied to live DB
- Provider changes (MapLibre + OSRM + Nominatim + Overpass; Clerk auth — locked stack)
- Deploy/secret actions
- Apex design canon edits to `MOLANDJESUS_DESIGN_DECISIONS.md` (additive-only with `docs(canon):` prefix; structural lock absolute)
- Pure-white surfaces or yellow-amber gold in light mode (Premium Gold palette is locked)

---

## §10. Evidence file index

All under `docs/evidence/pass-11-2026-05-08/`:

```
SESSION_LOG_2026-05-08_CANONICAL.md          — this doc (master reference)
JOINT_SESSION_COORDINATION.md                — audit AI's territory matrix + five-gate ledger
COWORK_A_SESSION_FINAL_SUMMARY.md            — cowork-A Pass 22 standdown summary
ANTI_REGRESSION_13_14_VERIFICATION.md        — Pass 13/14 anti-regression sweeps
STAGED_EDITS_SANITY_CHECK.md                 — pre-commit staged-edits review
ENGINE_SURFACES_MATRIX.md                    — five-engine surface enumeration (gate #5 input)
PASS_18_19_DESIGN_SECURITY_SWEEP.md          — design + security sweep
PASS_D_KI_SURFACE_AREA.md                    — KI surface area for Pass D
PASS_D_LAW_REF_NOTES.md                      — LAW/REF cross-ref notes
DORMANT_EXPORTS_SWEEP.md                     — initial dormant-export findings
PASS_25_HOOKS_UTILS_DORMANT_SWEEP.md         — hooks/utils sweep (corrected by audit AI)
PASS_25B_SHADCN_UI_DORMANT.md                — ui/ primitive sweep; KI-177 source
PASS_23_STEP_A_SHIP.md                       — Step A partial-ship record
PASS_24_STEP_B_FEASIBILITY.md                — Step B not-feasible-as-scoped record
STEP_B_SCOPE_CLARIFICATION.md                — audit AI parallel convergence on Step B
PASS_26_DOC_ONLY_CONTINUATION.md             — cowork-A Pass 26 doc enrollment
PASS_27_DOC_CORRECTION_AUDIT_AI_VERIFIED.md  — cowork-A Pass 27 audit-AI fold-in
MASTER_BUILDER_AUTOPILOT_DISPATCH.md         — dispatch prompt for master builder
```

---

## §11. End state at session close (Pass 27)

- Source typecheck PASS exit 0 across cluster
- ~25 source files modified, +845/−636 net
- 1 new file (`MapProgramTopBar.tsx` — canonical shell L2)
- 17 evidence files on disk
- 15 KIs added this session; 7 RESOLVED, 8 OPEN (1 PARTIAL, 1 PARTIAL AUTHORIZED, 1 FIRST HALF SHIPPED)
- Six gates standing, all documented
- Two methodology lessons logged
- All commits pending host-side `.git/*.lock` clear
- `npm run build` pending host-side run for production verification
- Master builder dispatched with full context

End of canonical session log.
