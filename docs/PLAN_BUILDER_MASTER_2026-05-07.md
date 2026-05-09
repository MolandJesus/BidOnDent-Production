# Builder-AI Master Plan (2026-05-07) — Post-Audit Synthesis

**Authority level:** PLAN — operational dispatch for builder-AI autopilot.
**Mode:** Builder takes this doc into a fresh chat, reads referenced KIs + LAW docs + current code, and works through the phases sequentially.
**Owner authorization:** "fully build out site for major work for builder ai to start later on in new chat" + standing KI-075 unlock (commit `1e18b405`) + audit-AI third-pass deliverable.

---

## What this plan replaces

This supersedes the prior Pass 61-69 chain dispatched at 2026-05-07. That chain put test scaffolding (Pass 61) before bug fixes (Passes 62+). External audit AI's three-pass deep audit captured **42 active KIs** and proved the bug list deserves to ship before tests. Tests on top of buggy behavior would lock the bugs in.

## Source-of-truth references

Builder reads these in order before starting:

1. **`docs/REF_KNOWN_ISSUES.md`** — the full active KI list (42 entries). KIs 116-137 are the audit-AI cluster. Older active KIs (002, 010, 011, 020, 021, 030, 040, 041, 042, 045, 050-053, 067, 075, 100, 101-108, 111, 112, 114, 115) remain in scope per their own statuses.
2. **`docs/LAW_PROJECT_RULES.md`** — Six Laws.
3. **`docs/LAW_LAYERED_ARCHITECTURE.md`** — file-size budgets + L1/L2/L3/L4 rules.
4. **`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`** — 29 LAW keyframes + reduce-motion contract.
5. **`docs/MOLANDJESUS_DESIGN_DECISIONS.md`** — LOCKED apex canon.
6. **`docs/evidence/pass-46-2026-05-07/MAP_AUDIT.md`** — Pass 46 inventory (note: missed `src/app/features/navigation/` — Pass 53 corrected).
7. **`docs/evidence/pass-53-2026-05-07/ENGINE_AUDIT.md`** — corrected nav engine inventory.
8. **`docs/REF_SYSTEM_STATE.md`** — current architecture truth.

External audit AI's design specs (referenced inline below):
- **Map-program-feel 25-item spec** (audit pass 2): marker variants, clustering, search-as-you-type, smooth flyTo, compass, 3D buildings, tilt/rotate, route alternatives, traffic-tier line color, lane guidance, speed badge, voice ducking, persona consistency, cue distance config, no-active-route empty state, map loading skeleton, tile failure recovery, pin click smooth pan, marker pulse animation, custom map style, branded place labels, branded route line, map-first layout for Smart Shop Map.
- **Non-map design spec** (audit pass 3): 30+ specific suggestions across landing (10), dashboard (8), account (7), bids (5), report flow (7).

Both specs are reproduced in audit AI's pass 2 + pass 3 reports (in chat history). When building Phase 6+, reference the original spec quoted by category.

---

## Containment rules (binding on every pass)

These hold across every pass in this plan:

1. **One concern per pass.** No mega-passes. If a pass scope grows beyond ~5 files or ~300 LOC diff, split it.
2. **No schema migration apply.** Builder writes migration SQL files; owner applies via Supabase Studio per `feedback_supabase_cli_pg17`.
3. **Provider stack LOCKED.** MapLibre 5.21.1 + react-map-gl 8.1.0 + OSRM public + Nominatim via `/geocode/search` edge proxy + Overpass. No new providers without owner unlock.
4. **No new runtime dependencies** without explicit owner approval per pass.
5. **No LAW edits** beyond co-update obligations.
6. **No `MOLANDJESUS_DESIGN_DECISIONS.md` edits.** LOCKED apex canon.
7. **`prefers-reduced-motion` contract** is non-negotiable on every CSS change.
8. **Auth invariants:** Clerk JWT verified inside edge handlers via `requireClerkSession()`. `verify_jwt: false` stays pinned in `supabase/config.toml`. `__clerk_db_jwt` cookie behavior — see KI-134.
9. **Storage invariants:** `storage://<bucket>/<path>` pointers persisted; signed URLs minted on read via `hydrateSignedStorageUrl`.
10. **Per-pass commit, no push.** Owner pushes manually.
11. **Build clean + typecheck clean** before every commit.
12. **Co-update doc rules** (LAW_PROJECT_RULES § Co-Update Rules) on every load-bearing fact change.

## Pass-level standard structure

Every pass must produce:
- **Single commit** with a descriptive message
- **Validation evidence** in the commit message: build time, precache size, typecheck status, smoke test
- **KI co-update** when a KI is touched (status note, fix-direction update, RESOLVED stamp where appropriate)
- **Tracker append** in `docs/evidence/pass-NN-2026-05-NN/TRACKER.md` (or shared monthly tracker) — pass row with commit hash, files, scope, deliverables
- **Final report to planner**: 1 file changed list, surprises, hard stops triggered, recommended next pass

## Hard-stop list (apply across all passes)

Builder pauses and pings owner+planner immediately on any of:
- Build break / typecheck break
- Test break that requires more than mechanical snapshot update
- Schema migration apply attempt
- New runtime dependency wanted
- New voice library / new routing provider / new tile provider
- LAW doc edit beyond co-update
- `MOLANDJESUS_DESIGN_DECISIONS.md` edit
- prefers-reduced-motion regression
- Auth/storage invariant change
- File count >5 (>6 for scaffolding passes; flag if needs more)
- LOC diff >300
- Visible regression in dev-server smoke test
- Owner product decision needed (e.g., "what should each role see on map?")
- Any pass exceeds 30 minutes wall-clock — abort and report
- Chain has shipped 4+ passes — pause for planner check-in

---

## Phase 1 — P0 Runtime Fixes (must ship FIRST)

These ship before any test scaffolding. Tests written on top of buggy behavior lock bugs in.

### Pass 61 — Gate navigation engine on active session + clean stale localStorage (KI-116 + KI-117)

**Scope:** Single highest-leverage fix. Six P0 symptoms collapse into one fix.

**Files (target 4-5):**
- `src/app/hooks/useNavigationGpsTracking.ts` — gate the GPS tracking effect on `session.status === 'active'`. If status !== active, do NOT subscribe to geolocation.
- `src/app/features/navigation/useNavigationIntelligence.ts` — short-circuit `evaluate(snapshot)` when session is not active.
- `src/app/hooks/useShopDirectoryNavigation.ts` AND/OR `src/app/hooks/useCoverageNavigationExperience.ts` — pass session-status gate prop to GPS tracking + intelligence hooks.
- `src/app/hooks/useDashboardSession.ts` (or equivalent dashboard mount hook) — on mount, scan `localStorage` for `bidondent_nav_session_*` keys, parse each, and clear any with `status === "planning"` AND (`activatedAt === null` OR `updatedAt` older than 30 minutes).
- Sign-out handler (likely in `useAppHandlers.ts` or `App.tsx`) — explicitly delete every `bidondent_nav_session_*`, `bidondent_user:*`, `coverageCurrentLocation`, and any other user-scoped key before redirecting to landing.

**Validation:**
- Smoke test: load dashboard from cold cache. Verify NO 737mi banner, NO "Finding a new route" toast, NO "Stopped detected" toast, NO speed-limit error spam in console.
- Notification counter stays stable (does not climb on idle).
- Carto basemap 503 storm collapses (since cross-US fitBounds was driven by demo shop geometry triggering the engine — verify in Network panel).
- Sign out, sign back in. Verify no stale planning sessions in localStorage post-flow.

**KI co-updates:**
- KI-116 → RESOLVED 2026-05-NN with this commit hash.
- KI-117 → RESOLVED 2026-05-NN with this commit hash.
- KI-127 (toast/avatar overlap) → mark RESOLVED-DEPENDENT on KI-116 (or surface remaining if toast still renders somewhere it shouldn't).

**Hard stops:**
- If `useNavigationGpsTracking` is consumed by surfaces other than dashboard/inline-coverage that legitimately need it — verify those still work post-gate.
- If session-status gate causes regressions on the actual nav surfaces, investigate and refine the gate before shipping.

### Pass 62 — Clerk session destroy on Sign Out (KI-134)

**Scope:** Sign Out is not currently a true session destroy. `__clerk_db_jwt` cookie persists, allowing silent re-auth on reload.

**Owner decision required first:** Pause and ask owner — full destroy OR rename to "Switch Accounts"?

If full destroy:
- Sign out handler calls `clerk.signOut({ redirectUrl: '/' })` with explicit `{ session: true }` flag.
- Explicit cookie clear: delete `__clerk_db_jwt` and `__client_uat` from `document.cookie`.
- Verify post-sign-out reload does NOT auto-restore session.

If rename:
- "Sign Out" → "Switch Accounts" in UI copy.
- Add "Forget this device" link below "Switch Accounts" that does the full destroy.

**Files (target 2-3):**
- Sign-out handler
- UI copy (Account tab + sidebar pill)

**Validation:**
- Reload after sign out. Login link should require credentials, not auto-restore.
- KI-117's stale localStorage cleanup (Pass 61) plus KI-134's cookie cleanup together = honest sign-out.

**KI co-update:**
- KI-134 → RESOLVED with commit hash.

---

## Phase 2 — P1 User-Facing Fixes

### Pass 63 — Wizard empty-state layout overflow (KI-126 re-scoped)

**Scope:** Single CSS rule fix. Affects every wizard step's empty form panel (Steps 3 + 4 confirmed; Step 5 likely).

**Approach:**
- Open Report flow Step 3 with empty form in dev. Use DevTools Elements → walk up the tree from the clipped heading to find the clipping ancestor.
- Capture computed transform/positioning. Diff against filled-state.
- Fix the rule.

**Files (target 1-2):**
- The CSS module/file containing the wizard form-card rule.
- Possibly the wizard layout component if the rule is component-scoped.

**Validation:**
- Step 3 (empty) renders correctly.
- Step 3 (filled) renders correctly (no regression).
- Step 4 (empty) renders correctly.
- Step 5 (if reachable via Playwright `setInputFiles`) renders correctly.

**KI co-update:** KI-126 → RESOLVED.

### Pass 64 — Report Step 1 form bindings (KI-125 + KI-129)

**Scope:** Two related Step 1 form bugs.

**KI-125 fix:**
- "Use" button on saved-vehicle pill must populate the controlled inputs via `setMake`/`setModel`/`setYear`.
- Verify post-click that `value` attribute reflects saved data.

**KI-129 fix:**
- Add `required` HTML attribute to Make/Model/Year inputs.
- Verify visual asterisks now match HTML semantics.

**Files (target 1-2):**
- Report Step 1 vehicle entry component.

**Validation:**
- Click "Use" on saved vehicle → inputs populate.
- Submit empty Step 1 → browser-native validation fires.
- Pass 75 test scaffolding will include regression test "saved-vehicle Use button populates form values."

**KI co-updates:** KI-125 → RESOLVED. KI-129 → RESOLVED.

### Pass 65 — Photo Tips Skip-for-now flow (KI-128)

**Scope:** Two-line fix. "Skip for now" should call `onClose()` AND `goToNextStep()`.

**Files (target 1):** `src/app/components/reports/PhotoTipsModal.tsx` (or equivalent).

**Validation:**
- Click "Skip for now" on Photo Tips modal → advance to Step 4 with photos empty.
- Click "Got it" on Photo Tips modal → also advance to Step 4 (existing behavior preserved).
- Back button from Step 4 → returns to Step 3, not the modal.

**KI co-update:** KI-128 → RESOLVED.

### Pass 66 — Owner-action surface (KI-101 + KI-102 + KI-002 + KI-114 + KI-115)

**Not a code pass.** Builder produces a single doc handoff at `docs/OWNER_ACTION_HANDOFF_2026-05-NN.md` with:
- KI-101: SQL UPDATE statement for the `vehicles` row.
- KI-102: SQL UPDATE statement to clear/replace the cat photo (or owner replaces via Storage UI).
- KI-002: `supabase secrets set RESEND_API_KEY=...` + `supabase functions deploy server` step-by-step.
- KI-114: `supabase/migrations/20260507000001_create_navigation_saved_places.sql` apply via Studio.
- KI-115: `supabase/migrations/20260507000002_add_shop_availability_columns.sql` apply via Studio.

Each with verification curl + expected response. Single handoff doc minimizes owner cognitive load.

---

## Phase 3 — P2 Polish (high-impact)

### Pass 67 — ESC handlers on map UI panels (KI-118)

Voice Controls + Navigation Settings sheets. Standard `useEffect` `keydown` listener → `event.key === "Escape"` → `onClose()`.

**Bonus:** verify ESC behavior on every modal/sheet/panel in the app while you're in there. Audit AI noted Coverage Map Dialog DOES close on ESC; the asymmetry between modal vs sheet patterns is the surface area to align.

**Files:** Voice + Settings sheets, plus any sister sheets that share the same pattern.

### Pass 68 — Fullscreen tile-mode "Light" repair (KI-122)

Fix the broken Light tile source binding. Verify CSP allowlists `cartocdn.com/light_all/`.

### Pass 69 — Landing carousel reduce-motion + manual control (KI-131)

- Pause auto-rotation on `prefers-reduced-motion: reduce`.
- Pause on hover/focus.
- Add small pause/play affordance next to dots.

### Pass 70 — Skip-link for keyboard users (KI-135)

Add `<a href="#main-content" class="bd-skip-link">Skip to main content</a>` as first focusable element. CSS hidden until `:focus`. Add `id="main-content"` to `<main>`.

### Pass 71 — Touch target sizing (KI-136)

`min-height: 44px` on Search reports input + BidOnDent logo button hit area.

### Pass 72 — Sign Out + Delete Account separation (KI-137)

- Move Sign Out to sidebar bottom pill (one-click).
- Keep Delete Account in separate "Danger Zone" section, type-email confirmation.

---

## Phase 4 — Tile Scope + Production Lighthouse

### Pass 73 — Constrain dashboard inline map fitBounds (KI-053 / map-program tile storm)

**Approach:** Dashboard inline coverage map should fit bounds to the user's selected region or current location, NOT the entire 15-shop demo set.

**Files:** Dashboard inline coverage component + any prop-passing helpers.

**Validation:** Network panel shows tile requests scoped to one region (Yonkers/NY area), not Yonkers→Rockies→Pacific NW.

### Pass 74 — Production-build Lighthouse run

**Not a code pass.** Builder runs `npm run build && npm run preview` and runs Lighthouse against the preview build for each surface. Captures actual production-mode scores. Compares against audit AI's dev-mode FCP 5,580ms baseline.

Owner reads the report; subsequent passes target whatever the production scores actually need.

---

## Phase 5 — Test Scaffolding (after fixes land)

### Pass 75 — Tests for Pass 58 + 59 services ✅ DONE 2026-05-09 (autopilot Pass 204)

(Was Pass 61 in earlier chain — moved here so tests cover fixed behavior.)

`navigationSavedPlaces.test.ts` (13 cases) + `shopAvailability.test.ts` (13 cases). Circuit breaker + fallback + mutation coverage + realtime subscribe smoke. Vitest + vi.mock pattern with `vi.resetModules()` per test to reset module-level `cachedFailure` state. Suite 597 → 623 PASS, no regressions.

### Pass 76 — Tests for engine pure functions ✅ DONE 2026-05-09 (autopilot Pass 205)

`detectDeviation.test.ts` (20 cases) + `shouldTriggerReroute.test.ts` (12 cases). Pure-function tests covering all four detector branches, GPS jitter guard, severity bands, and the full reroute decision matrix (null/wrong-type/severity/lifecycle/cooldown). KI-116 regression case explicitly asserts that a user sitting on the origin polyline vertex must not be reported as off_route. Suite 623 → 655 PASS.

### Pass 77 — Playwright Report flow test

Use `page.setInputFiles` to bypass React's controlled file-input limitation. Cover Step 1 → Step 5 end-to-end. Include regression test for "saved-vehicle Use button populates form values" (KI-125).

---

## Phase 6 — Polish Bundle + Non-Map Design Suggestions

### Pass 78 — KI-124 polish bundle batch 1 (5 sub-items)

- "1 offers" → "1 offer"
- "2014 Mazda Mazda6" — dedup make/model concatenation
- "Smoke Test Checklist" gated behind `import.meta.env.DEV`
- "save immediately" vs "Save Appearance" copy contradiction
- Voice persona label/value consistency

### Pass 79 — KI-124 polish bundle batch 2 (5 sub-items)

- "Browse all shops & AI matching" gradient bleed past container
- Right action bar icon labels
- Tile-mode toggle visible mode label
- Off-route pill+banner consolidation
- "Cancel navigation" affordance in fullscreen

### Pass 80 — Landing design batch 1

From audit AI non-map design spec (Landing): items 1-5 (CTA hierarchy, carousel pause, hero illustration interaction, section progress indicator, Coverage Map "Open Full Map" makes whole map clickable).

### Pass 81 — Landing design batch 2

From spec items 6-10 (outside-service-region notify-me, footer email replacement, "Now serving" pill placement, trust pills with data, final CTA overlay readability).

### Pass 82 — Dashboard design

From spec: welcome card actual counts, Quick Actions color semantics, repair activity progress dots, View All button, map pin glyph overflow menu, empty-state design for 0-reports user.

### Pass 83 — Account design

From spec: Account hub palette uniqueness, profile completion bar context, vehicles list as cards, Smoke Test gating, Appearance Settings live preview swatch, sign-out cleanup messaging.

### Pass 84 — Bids design

From spec: bid card hierarchy single decision-driving headline, sort/filter affordance, awaiting-more-bids shimmer state.

### Pass 85 — Report flow design

From spec: saved-vehicle pill full-tap, photo upload Skip-with-warning option, step indicator interactivity, cancel confirmation with draft persistence (L — needs draft API).

---

## Phase 7 — Map-Program-Feel Buildout

From audit AI's 25-item map design spec. Each pass picks one item.

### Pass 86 — Distinct pin variants (origin / destination / shop / saved)

Three pin types minimum: origin (cool blue, center dot), destination (bronze, target ring), shop (current blue with rating). Saved bookmark glyph.

### Pass 87 — Marker clustering at low zoom

`supercluster.js` integration. Density-based clustering with "+12 shops" badge that explodes on zoom-in. Also fixes part of tile storm.

### Pass 88 — Search-as-you-type autocomplete

200ms debounced typeahead via Nominatim. Single biggest discoverability win.

### Pass 89 — Smooth flyTo camera transitions

Replace `fitBounds` with `easeTo` for ~600ms cubic-bezier transitions.

### Pass 90 — Compass / north indicator

Enable `showCompass: true` on MapLibre `NavigationControl`.

### Pass 91 — Real-time location indicator with directional cone

Apple/Google's signature blue dot + heading cone. The single most recognizable map-program affordance.

### Pass 92 — Saved-place autocomplete promotion

When user types "h" in search → "Home" promoted to top result.

### Pass 93 — Recent searches dropdown

Empty-state of search input shows last 5 destinations.

### Pass 94 — Maneuver card with prominent next-turn arrow

Giant turn arrow + "0.3 mi → Turn right onto E 233rd St" + active-step-progress bar. ~20% of screen height when active.

### Pass 95 — Speed badge with over-limit color coding

Green (≤limit) / amber (≤+5) / red (>+5). Logic exists in `useNavigationGpsTracking`.

### Pass 96 — ETA + arrival time + remaining distance live

"Arrives 4:47 PM · 12 min · 4.2 mi" trio. Update every 1s on GPS update.

### Pass 97 — Voice ducking

WebAudio `gainNode.gain.setValueAtTime(0.2, currentTime)` when speaking guidance.

### Pass 98 — Voice cue distance configurability

Settings option: Early (2 mi) / Standard (0.5 mi) / Late (0.1 mi) / Continuous.

### Pass 99 — Tile failure recovery with retry CTA

"Map partially loaded — Retry tiles" banner with retry button.

### Pass 100 — Pin click smooth pan + sheet open

`easeTo` to pin upper-third of viewport over ~500ms.

### Pass 101 — Marker pulse animation on click

Quick 1.2× → 1.0× scale pulse + soft outer ring fade.

### Pass 102 — "No active route" empty state in turn list drawer

Friendly explainer + "Find a shop" CTA.

### Pass 103 — Map loading skeleton matching atmosphere

Faint shimmer over actual tile grid + BidOnDent logo pulsing in same color register as loaded map.

---

## Phase 8 — Map Identity (deeper)

### Pass 104 — Custom map style

Bronze roads, royal-blue water, cream ground (light) / deep navy (dark). MapLibre style JSON.

### Pass 105 — Branded place labels

Custom font + tinted color (light: navy on cream, dark: cream on navy).

### Pass 106 — Branded route line

Bronze-to-cyan gradient along polyline matching `bd-liquid-gold-flow`.

### Pass 107 — Map-first layout for Smart Shop Map (BIG)

Single biggest "feels like a real map program" gain. Map dominant, search collapses to top floating pill, results slide up as bottom sheet on mobile.

**Owner approval recommended before this pass.** Touches major UX patterns.

---

## Phase 9 — Aspirational (deferred decisions)

These need owner unlock or product decision:

- 3D buildings (provider-coupled, KI-075 territory)
- Tilt + rotate gestures (free if MapLibre defaults are enabled)
- Lane guidance for highway exits (provider-coupled)
- Route alternatives (provider-coupled)
- Real-time partner-shop UI consuming Pass 59 data — gated on KI-115 application
- Per-role map layer activation rules (F6, owner policy decision)

## Phase 10 — P3 + Infrastructure (defer until launched)

- Pass 108 — KI-130 service worker (PWA — defer or ship depending on PWA target)
- Pass 109 — KI-132 SPA history fix (companion to KI-011 router migration)
- Pass 110 — KI-133 dehash localStorage key
- Pass 111 — KI-123 notification badge ARIA fix
- Pass 112 — KI-124 polish remaining items as they surface

## Phase 11 — Architecture (post-launch)

These are P2 architectural items that need extended owner approval:

- KI-010 — DashboardContext refactor (replace `buildDashboardRouterProps` choke point)
- KI-011 — React Router migration (URL becomes source of truth)
- KI-020 — Type boundary consolidation
- KI-100 — Real Supabase swap for `buildShopRecommendations`

---

## Cross-cutting validation gates

Every 5 passes builder runs:
1. Full `npm run build && npm run preview` smoke test.
2. Lighthouse Mobile + Desktop on Dashboard + Smart Shop Map.
3. Cold-load console capture (no Clerk-telemetry, no extension noise) — should be clean.
4. Network panel — no 5xx storms, no 503 patterns, no excessive retries.
5. localStorage audit — no stale `bidondent_nav_session_*` after fresh sign-out.

If any gate fails, builder pauses and pings.

## Owner-action items tracked separately

These never enter builder's autopilot scope — they're gated on owner action:

| KI | Owner action | Steps |
|---|---|---|
| KI-002 | Deploy `RESEND_API_KEY` | `supabase secrets set` + `supabase functions deploy server` |
| KI-101 | Update `vehicles` row | `UPDATE vehicles SET make='Toyota' WHERE make='Toyoto';` via Studio |
| KI-102 | Replace cat photo | Storage UI (or `damage_reports` row update) |
| KI-103 | Decide on `bidondent@gmail.com` footer email | Replace with `support@bidondent.com` (requires domain email registration) OR keep as decision |
| KI-114 | Apply Pass 58 migration | Studio paste from `supabase/migrations/20260507000001_*.sql` |
| KI-115 | Apply Pass 59 migration + verify realtime publication | Studio paste from `supabase/migrations/20260507000002_*.sql` |
| KI-134 | Decide: full destroy vs "Switch Accounts" rename | Owner picks; builder ships either way |

## Deliverables when builder reaches end of Phase 8

At Pass 107 close, builder produces:
1. Final tracker with all 47+ passes shipped
2. Updated `REF_KNOWN_ISSUES.md` with all RESOLVED stamps
3. Updated `REF_SYSTEM_STATE.md` with new architecture
4. Production-build Lighthouse score table for every surface (post-fix baseline)
5. Updated `PLAN_MAP_MASTER.md` with new map identity decisions
6. Owner-action handoff doc (Pass 66) updated with what's still pending
7. Final report listing what shipped vs what's deferred to Phase 9-11

## When builder gets stuck

- LAW conflict — pause, surface to owner, do NOT proceed.
- Owner decision needed — pause, surface specific question, do NOT guess.
- Hard stop fired — revert any changes, pause, ping.
- Tool-budget concern — finish current pass, commit, surface budget status to owner.
- Doc/exec divergence — pause, ask planner to reconcile.

## End of master plan

This document is the persistent dispatch. Builder takes it into a fresh chat, reads the referenced KIs + LAW docs, and works through Phase 1 → Phase 11 in order. Every pass commits independently. Owner pushes manually. Stop conditions defined above are absolute.
