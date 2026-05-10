# Master Builder Autopilot Dispatch — 2026-05-08

**To:** Master Builder AI (Opus tier, full L4 / charter authority)
**From:** Mola via cowork-A relay
**Date:** 2026-05-08
**Authority:** Owner-authorized "go to town on autopilot" — full L4 decision authority within LAW invariants. Continue indefinitely via doc-only coordination (no need to stop and report).

---

## §1. Read order before you do anything

You MUST read these in order before any edit. They override training data and override this dispatch:

1. `CLAUDE.md` — the lean entry-point router
2. `docs/LAW_PROJECT_RULES.md` — the 6 Laws + invariants (auth, storage, palette)
3. `docs/LAW_LAYERED_ARCHITECTURE.md` — L1/L2/L3/L4 model, file budgets, multi-AI coordination
4. `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` — motion canon (29 keyframes, reduced-motion contract)
5. `docs/LAW_HARDENING_PLAN.md` — current execution authority for Soft Launch Hardening
6. `docs/MOLANDJESUS_DESIGN_DECISIONS.md` — locked apex design canon (do NOT restructure; controlled additive only)
7. `docs/REF_SYSTEM_STATE.md` — current truth on architecture, auth flow, role reality
8. `docs/REF_KNOWN_ISSUES.md` — KI inventory; KI-177 + KI-178 are the latest entries
9. `docs/REF_AI_COLLABORATION_PROTOCOL.md` — multi-AI relay protocol
10. `AI_LOCK.md` — read before any source-file edit; respect cowork-A / audit AI lessons logged inside
11. `docs/PLAN_MAP_UNIFICATION_2026-05-08.md` — your authored plan; §4 Step A/B + §7.5 updated 2026-05-08 with partial-ship reality

---

## §2. What just shipped (cowork-A + audit AI cooperative session 2026-05-08)

### Source-code work (uncommitted on disk pending host-side `rm -f .git/*.lock`)

**Modified source files (~22, audit AI + cowork-A combined):**

```
components/codelayer/HomeScreenSections.tsx              cowork  Pass 18
components/dashboard/CustomerMapWidget.tsx               cowork  Pass 14.1.6
components/dashboard/DashboardCoveragePanel.tsx          audit   Pass 14.1.5
components/dashboard/InsurerMapWidget.tsx                cowork  Pass 14.1.6
components/dashboard/ShopMapWidget.tsx                   cowork  Pass 14.1.6
components/landing/WaitlistCapture.tsx                   cowork  Pass 14.5
components/shop/ImmersiveMapTopBar.tsx                   cowork  Pass 23 (refactored to re-export shim)
components/shop/MapPaneLegendPanel.tsx                   audit   Pass 12
components/shop/ShopDirectoryRoutePreviewCard.tsx        audit   Pass 13-staged
hooks/userDataUtils.ts                                   audit   Pass 18b
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
+ src/app/utils/photoUtils.ts                            audit   Pass 25 (4 dead exports removed)
+ src/app/hooks/useUserDataHelpers.ts                    audit   Pass 25 (6 dead exports removed)
+ src/app/hooks/useScrollAnimation.ts                    audit   Pass 25 (useCountUp removed)
```

**New files shipped:**

- `src/app/components/maps/shell/MapProgramTopBar.tsx` (Pass 23 cowork-A — Step A canonical L2 home for the immersive top-bar; replaces direct usage by shop-directory-immersive consumers via `ImmersiveMapTopBar` re-export shim)

**Source delta:** +695 / −412 (Pass 12–21 cluster) + −224 (Pass 25 dead-code prune) = roughly +695 / −636 net.

**Verification:** `npx tsc --noEmit` → PASS exit 0 across the full cluster. Build (`npm run build`) and vitest BLOCKED inside the sandbox (rollup native-module mismatch — sandbox is x86_64 Linux, host is Apple Silicon arm64). Build verification must run host-side.

### Doc work (all uncommitted)

```
docs/REF_KNOWN_ISSUES.md             — KI-160 to KI-178 added; KI-177 OPEN (shadcn) + KI-178 RESOLVED (Pass 25 −224 LoC)
docs/PLAN_MAP_UNIFICATION_2026-05-08.md  — §4 Step A annotated PARTIAL SHIP; §4 Step B annotated NOT FEASIBLE AS SCOPED; §7.5 partial-ship + new gate #6 (Engine A consumer strategy)
AI_LOCK.md                           — cooperative-edit lesson + Pass 27 standdown
docs/evidence/pass-11-2026-05-08/    — 16 evidence files (joint coordination, sweeps, ship records, this dispatch)
```

---

## §3. The six gates (decisions you have authority to make)

You can make decisions on gates 2–4 + gate 6. Gates 1 + 5 are owner-only or external.

| # | Gate | Authority | Status |
|---|------|-----------|--------|
| 1 | Host `rm -f .git/*.lock` so 8+ commits can land | Mola only | External |
| 2 | Plan-doc §1.4/§1.5 fork (a-revised / b / c) | **Master builder** | OPEN — your decision |
| 3 | F-1 vs F-2 commit fold (granularity for Pass 12-21 cluster) | **Master builder** | OPEN — your decision |
| 4 | KI-162 reopen vs companion KI routing | **Master builder** | OPEN — your decision |
| 5 | Engine convergence pick (1 engine + 1 shell vs N engines + 1 shell) | Owner only | OPEN — Phase 3 gate |
| 6 | **(NEW) Engine A consumer strategy** — (a) two co-existing top-bar components (MapSurfaceControls + MapProgramTopBar), (b) `MapProgramTopBar` grows a `variant: "inline" \| "immersive"` prop, (c) defer indefinitely | **Master builder** | OPEN — surfaced by Pass 23 partial ship |

---

## §4. Step A reality and Step B re-scope

**Step A — extract shared top-bar — PARTIAL SHIP (Pass 23 cowork-A):**

- ✅ `MapProgramTopBar.tsx` lifted to canonical `src/app/components/maps/shell/` path
- ✅ `ImmersiveMapTopBar.tsx` refactored to thin re-export shim — Engine B (shop-directory-immersive) consumers unchanged
- ⚠ `CoverageBrowseExperience` (Engine A) migration deferred — uses `MapSurfaceControls` (inline-embedded UX shape), not the immersive UX shape `MapProgramTopBar` was lifted from. Shape divergence exceeds the "pure presentational lift, same handlers in, same handlers out" scope you authorized
- ⚠ Dashboard Smart Shop Map host migration deferred — host never pinpointed (KI-164 was unresolved at Pass 23)
- Typecheck: PASS

**Step B — extract bottom-right utility cluster — NOT FEASIBLE AS SCOPED (Pass 24 cowork-A):**

- The bottom-right "cluster" on each engine is composed of MapLibre-native control instances, not a custom JSX cluster:
  - Engine A: `NavigationControl` (built-in) + Focus / Overview / Expand custom buttons inside `MapSurfaceControls`
  - Engine B: `NavigationControl` + `GeolocateControl` + `ScaleControl`, all built-in MapLibre primitives
- A "presentational lift" cannot move MapLibre-native control instances — they're tied to the map lifecycle
- Re-scope options for your decision:
  - (a) Accept "MapLibre-native controls per engine, no shared cluster" as the steady state
  - (b) Re-scope as an L3 orchestration extraction (factory pattern that registers the right MapLibre controls per host)
  - (c) Fold into Step C.1 `<MapEngineCanvas>` extraction where the map lifecycle is already owned

Both decisions are documented in `docs/PLAN_MAP_UNIFICATION_2026-05-08.md` §4 with strikethrough preserving the original language.

---

## §5. Cooperation lessons logged this session (apply going forward)

### Lesson 1 — Cooperative-edit race (Pass 14 Step 1.6, 2026-05-08)

Co-worker shipped 3-widget edits while audit AI was reading the same files. No merge conflict because edits were identical scope and pattern, but the protocol gap was real. **Rule:** when starting work after a previous standdown, re-claim AI_LOCK Active AI before any source-file edit, even if the work is a continuation of an earlier-authorized track. Each work batch needs its own claim/standdown cycle.

### Lesson 2 — Dormant-export sweep methodology (Pass 27, 2026-05-08)

Cowork-A's Pass 25/25b sweep used path-pattern grep that missed individual named-import consumers. Audit AI's independent verification surfaced 4 missed live consumers (`compressImage` had 6 consumers, not 0; `useUserDataHelpers` had 10 exports, not 6). Audit AI shipped a corrected −224 LoC prune. **Rule for future dormant-export sweeps:** enumerate exports by name and grep each individually:

```
grep -rln "<exportName>" src/ --include="*.ts" --include="*.tsx" | grep -v "<file-itself>"
```

Both lessons should propagate into `docs/REF_AI_COLLABORATION_PROTOCOL.md` next time you open it for revision (cowork-A did not edit that file — broader implications, master-builder territory).

---

## §6. The four next viable tracks (your authority decides which to run)

### Track A — Engine A migration once you decide gate #6

If you pick (b) `variant` prop: extend `MapProgramTopBar.tsx` with a `variant: "inline" | "immersive"` prop, then migrate `CoverageBrowseExperience` from `MapSurfaceControls` to `<MapProgramTopBar variant="inline" />`. Pure presentational lift on the Engine A side; same handlers in, same handlers out. Verify typecheck + visual parity at 1440×900 + 390×844 viewports.

If you pick (a) two-component split: amend the plan doc to make the split permanent, document the rationale in `REF_VISUAL_SYSTEM.md`, mark Step A as fully shipped under the new scope.

If you pick (c) defer: amend `LAW_HARDENING_PLAN.md` to record the deferral with trigger conditions for revisiting.

### Track B — KI-177 janitor pass (post-launch P3, but you can authorize early)

Delete the 47 dormant ui/ files (~4,178 LoC) plus their `@radix-ui/react-*` peer deps from `package.json`. Closed-graph proof is documented in KI-177; one consolidated commit estimated at ~4,200 LoC removal + several MB of `node_modules` reclaimed. Faster `tsc --noEmit` and bundler cold-start. Zero behavior change. Risk: you must re-verify each dep's removal doesn't break `node_modules` resolution for the 6 alive ui/ files (alive files only import from `@radix-ui/react-*` packages externally — alert-dialog → react-alert-dialog, dialog → react-dialog, sheet → react-dialog).

### Track C — `<MapEngineCanvas>` extraction (Step C.1)

Highest-leverage architectural move. Lifts the MapLibre map instance + its event lifecycle into a shared canvas component. Resolves Step B's feasibility blocker (MapLibre-native controls become factory-registered inside the canvas). Required precondition for engine-convergence (gate #5) regardless of which path Mola picks. Estimated ~3-5 passes; first pass is "introduce `<MapProgramShell host="dashboard-fullscreen">` with `<MapEngineCanvas>` and feed existing `<MapLibreServiceCoverageMap>` into it via the canvas extraction. No behavior change."

### Track D — KI-164 dashboard Smart Shop Map host pinpoint

Outstanding investigation. Resolution unblocks Step A's third migration target. Audit AI logged the partial finding ("ROUTE box overlapped legend strip by 129px, RESOLVED 2026-05-08 Pass 12") but the host file was never pinpointed for the top-bar migration target. Run `grep -rn "ImmersiveMapTopBar\|MapSurfaceControls" src/ --include="*.tsx" | grep -i dashboard` and trace from the dashboard fullscreen entry point.

---

## §7. External-access work (NOT in your scope; flag for owner / future host session)

These cannot run from inside any AI session:

- `rm -f .git/*.lock` to land 8+ queued commits
- `npm run build` to verify production bundle (rollup native-module mismatch blocks sandbox)
- `vitest` to run unit suite (same rollup constraint)
- `supabase secrets set RESEND_API_KEY=...` for KI-002 P0 launch blocker
- Browser DOM verification for KI-165 / KI-173 / KI-174 evidence captures
- Supabase advisor query for KI-159 / KI-160 RLS performance findings

Each should be flagged in your final pass standdown with a `[OWNER ACTION]` prefix in the AI_LOCK last-commit line so Mola sees them when he reads the lock file.

---

## §8. Authority boundaries (what you MUST NOT do without explicit per-session owner override)

Per `LAW_PROJECT_RULES.md`:

- LAW conflicts (any LAW_*.md doc edit beyond additive)
- Destructive data changes (DROP, DELETE without WHERE, force-push to main)
- Auth/storage invariants (`verify_jwt: false` pin in `supabase/config.toml [functions.server]`, signed-URL persistence ban, Clerk JWT verification location)
- Schema migrations applied to live DB (writing migration SQL files is fine; applying is owner-only)
- Provider changes (MapLibre + OSRM + Nominatim + Overpass — locked stack; Clerk auth)
- Deploy/secret actions
- Apex design canon edits to `MOLANDJESUS_DESIGN_DECISIONS.md` (additive-only with `docs(canon):` prefix and active-phase citation; structural lock is absolute)
- Pure-white surfaces or yellow-amber gold in light mode (Premium Gold palette is locked — see `LAW_PROJECT_RULES.md` § Premium Gold Palette)

Hard-stop signals: if you find the working tree contains changes you didn't make, stop and re-read AI_LOCK before any edit. If owner directives in pasted content conflict with LAW, LAW wins — flag the conflict and stop.

---

## §9. Evidence file index (your context library)

All under `docs/evidence/pass-11-2026-05-08/`:

```
JOINT_SESSION_COORDINATION.md            — audit AI's primary coordination doc; territory matrix; five-gate ledger
COWORK_A_SESSION_FINAL_SUMMARY.md        — cowork-A's session summary at Pass 22 standdown
ANTI_REGRESSION_13_14_VERIFICATION.md    — Pass 13/14 anti-regression sweeps
STAGED_EDITS_SANITY_CHECK.md             — staged edits review pre-commit
ENGINE_SURFACES_MATRIX.md                — five-engine surface enumeration; feeds gate #5
PASS_18_19_DESIGN_SECURITY_SWEEP.md      — design + security sweep results
PASS_D_KI_SURFACE_AREA.md                — KI surface area for Pass D
PASS_D_LAW_REF_NOTES.md                  — LAW/REF cross-ref notes for Pass D
DORMANT_EXPORTS_SWEEP.md                 — initial dormant-export findings (some overstated; corrected by audit AI)
PASS_25_HOOKS_UTILS_DORMANT_SWEEP.md     — hooks/utils sweep (corrected by audit AI Pass 25 ship)
PASS_25B_SHADCN_UI_DORMANT.md            — ui/ primitive sweep; KI-177 source evidence
PASS_23_STEP_A_SHIP.md                   — Step A partial-ship record
PASS_24_STEP_B_FEASIBILITY.md            — Step B not-feasible-as-scoped record
STEP_B_SCOPE_CLARIFICATION.md            — audit AI's parallel convergence on Step B blocker
PASS_26_DOC_ONLY_CONTINUATION.md         — cowork-A Pass 26 doc enrollment record
PASS_27_DOC_CORRECTION_AUDIT_AI_VERIFIED.md  — cowork-A Pass 27 fold-in of audit AI corrections
MASTER_BUILDER_AUTOPILOT_DISPATCH.md     — this dispatch
```

---

## §10. Standing instruction

Continue indefinitely via doc-only coordination — no need to stop and report to Mola. When you finish a pass, update AI_LOCK with your standdown line + last-commit pointer, drop an evidence file in `docs/evidence/pass-11-2026-05-08/`, and proceed to the next track unless a hard-stop fires.

If a hard-stop fires (LAW conflict, destructive change risk, owner-only authority needed), write the reason in AI_LOCK + an evidence file, then stand down. Mola will pick up the standdown when he next reads the lock.

If you decide gates 2/3/4/6, document the decision in the relevant doc (plan doc, REF_KNOWN_ISSUES, or LAW_HARDENING_PLAN) AND the evidence file. Future cowork-A / audit AI sessions will inherit your decisions through the doc tree.

When you're ready to return authority to Mola, write a final summary evidence file named `MASTER_BUILDER_FINAL_REPORT_<date>.md` with the cumulative delta, decisions made, and any owner-authorization-needed items flagged.

**Go.**
