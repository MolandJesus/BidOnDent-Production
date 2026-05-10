# AUDIT — Runtime Integrity Pass 12 (2026-05-09)

**Pass:** 12 of N — Authority-transition deepening + doctrine taxonomy refinement
**Trajectory:** symptom → mechanism → topology → continuity infrastructure → continuity-governance → continuity OS → spatial continuity OS → spatial cinematography → continuity-cooperation topology → continuity-congestion threshold mapping → doctrine stabilization → **doctrine taxonomy refinement**
**Discipline:** observational only; zero source-file edits; zero LAW/locked-doc edits; one new evidence file (this one).
**Lock state:** AI_LOCK Pass 275 unchanged.
**Branch / commit:** `BidOnDent-Horizon-Beta` @ `3baeff18` (unchanged across all twelve audit passes).

This pass deepened authority-transition observation through source reading of `useNavigation.ts`, `MapSessionProvider.tsx`, and `ShopDirectoryMapPaneInlineUI.tsx`. Discovered **gesture-aware history depth control** as a refinement of Pass 2 N-01 ("no router") finding. Added **Inert Seam Doctrine** as a 7th REF-tier candidate. Built a 6-grouping doctrine taxonomy.

**Pass 12 surfaces TWO findings worth reporting:**
1. **Pass 2 N-01 refinement:** the system DOES use the History API (not "no router") — it uses `history.state` as the source of truth and explicitly distinguishes pushState (depth changes) vs replaceState (peer-tab swaps). URL pathname is still decorative.
2. **Inert Seam Doctrine** — `MapSessionProvider` ships engine-less in Phase 1 so future phases can inflate without changing existing consumers. "Trivial rollback" preserved as architectural commitment.

---

## §1 Lane A — Authority-transition deepening (REFINES Pass 2 N-01)

### Source-read of `useNavigation.ts` (274 lines) reveals deliberate gesture-aware history grammar

```typescript
// useNavigation.ts lines 155-167
const prev = prevNavRef.current;
const isFirstWrite = prev === null;
const viewModeChanged = !isFirstWrite && prev.viewMode !== viewMode;
const reportIdChanged = !isFirstWrite && prev.selectedReportId !== selectedReportId;
// Push only on real depth changes (viewMode or selectedReportId).
// Peer-tab swaps within the same viewMode collapse to replaceState.
const shouldPush = isFirstWrite || viewModeChanged || reportIdChanged;

if (shouldPush) {
  history.pushState(navigationState, "");
} else {
  history.replaceState(navigationState, "");
}
```

**This is gesture-aware history depth control.** The system distinguishes:
- **Vertical depth changes** (viewMode entering sub-view OR selectedReportId changing) → `pushState` (browser back-button reaches them)
- **Horizontal peer changes** (sidebar tab swap within same viewMode) → `replaceState` (back-button skips, only meaningful navigation in history)

```typescript
// useNavigation.ts lines 173-195
const handlePopState = (event: PopStateEvent) => {
  const state = event.state as { currentTab?, viewMode?, selectedReportId? } | null;
  isRestoringFromHistory.current = true;
  if (state?.viewMode && VALID_VIEW_MODES.has(state.viewMode)) {
    setViewMode(state.viewMode as ViewMode);
    setCurrentTab(state.currentTab || "home");
    setSelectedReportId(state.selectedReportId ?? null);
  } else {
    // Bottom of history stack — return to dashboard home
    setViewMode("dashboard");
    setCurrentTab("home");
    setSelectedReportId(null);
  }
};
window.addEventListener("popstate", handlePopState);
```

**Browser back/forward IS supported.** The popstate handler reads the historical state, validates `viewMode` against `VALID_VIEW_MODES`, restores all three state slots. Falls back to home/dashboard when reaching bottom of stack.

The `isRestoringFromHistory` flag prevents the push-effect from feedback-looping on popstate-driven setState calls.

### REFINED Pass 2 N-01 understanding

Pass 2 said "no client-side router; URL is decorative." Pass 12 refines:

- **There IS a router** — `useNavigation.ts` IS the router
- **URL pathname IS decorative** (Pass 2 finding holds)
- **`history.state` IS the navigation truth** (NOT the URL)
- **Browser back/forward IS supported** via popstate (Pass 2 understated this)
- **History depth IS deliberately managed** via push/replace asymmetry

The earlier finding's spirit was correct; the precision wasn't. Pass 12 puts the right shape on it.

### Authority-transition matrix (synthesized across all 12 passes)

| Action | currentTab | viewMode | selectedReportId | History op |
|---|---|---|---|---|
| App cold-load | hydrate from localStorage `bidondent_navigation_state` | hydrate | hydrate | initial pushState |
| Click sidebar tab | UPDATE | RESET to "dashboard" | (preserved) | replaceState (peer swap, same viewMode after reset) |
| navigateToView (mode + reportId) | (preserved) | UPDATE | UPDATE | pushState (depth ↑) |
| navigateToView (mode only) | (preserved) | UPDATE | (preserved) | pushState (depth ↑) |
| returnToDashboard | (preserved) | RESET to "dashboard" | NULL | pushState (depth change to dashboard) |
| Demo mode enable | RESET to "home" | RESET to "dashboard" | (cleared) | pushState |
| Demo mode exit | RESET to "home" | RESET to "dashboard" | (cleared) | pushState |
| Browser back/forward | restored from popstate | restored | restored | popstate (no push) |
| Tile-mode toggle | (no nav state) | (no nav state) | (no nav state) | (no history op) |
| Map pan | (no nav state) | (no nav state) | (no nav state) | (no history op) |

### Lane A refined findings

- **Authority TRANSFERS** on any explicit user gesture that hits a navigation-aware action
- **Authority REVERTS** via browser back/forward (popstate restores state)
- **Authority PERSISTS** across reload (localStorage `bidondent_navigation_state` re-hydrates the initial state on cold mount)
- **IRREVERSIBLE actions:** none observed — all transitions are reversible via back-button
- **SESSION-SCOPED:** demo mode (in-session bool, not persisted to localStorage)
- **REFUSED user ownership:** none — every user gesture is honored
- **Map pan / tile toggle** intentionally do NOT push history (they're local map state, not navigation)

This validates the framework prediction "authority transfers on explicit gesture, system never reclaims authority without explicit re-trigger."

---

## §2 Lane A continued — `MapSessionProvider.tsx` reveals INERT SEAM DOCTRINE

```typescript
// MapSessionProvider.tsx header comment (lines 1-50)
/**
 * MapSessionProvider — architectural seam for the Persistent Map Session (PMS).
 * 
 * Pass 266 (Phase 1 scaffold per Pass 260 §4) — engine-less. The
 * provider currently:
 *   - Establishes the React context boundary at the post-Clerk
 *     app shell location (Pass 259 §5 recommended location (d)).
 *   - Imports `maplibreResizePatch` as its first side-effect line
 *     so the resize-crash patch is in place before any future
 *     engine construction (Pass 260 §6 #1).
 *   - Provides the no-op `MAP_SESSION_DEFAULT_VALUE` so consumers
 *     written today won't change behavior when later phases swap
 *     in a stateful provider value.
 * 
 * Phase 1 is intentionally inert — provider returns
 * `<MapSessionContext.Provider value={MAP_SESSION_DEFAULT_VALUE}>{children}</...>`
 * No engine mount, no state, no side effects beyond the resize-patch import.
 * 
 * Future phases:
 *   - Phase 2: engine lift...
 *   - Phase 3: slot consumers...
 *   - Phase 5: auth-flip cleanup...
 * 
 * Rollback (Pass 260 §4.7): TRIVIAL. Delete this file +
 * `mapSessionContext.ts` + the corresponding test +
 * the wrapper line in `App.tsx`.
 */
```

This is a TEMPLATE for **inert-seam-first architectural extraction**:

1. **Phase 1: ship the seam, not the implementation.** Provider mounts with no-op default value.
2. **Existing consumers don't change** — they read the context but get a no-op value. Behavior identical.
3. **Future phases inflate the seam** — Phase 2 mounts the engine, Phase 3 wires slot consumers, etc.
4. **Patch-once semantics preserved** — first-import-line `maplibreResizePatch` ensures the patch is loaded before any engine construction
5. **Rollback documented** as trivial — delete the file + test + wrapper

This is **Inert Seam Doctrine** — landing infrastructure shells before populating them. It's the architectural equivalent of "feature flag default off" for entire provider trees. The cost of being wrong is trivial (delete the file). The benefit of being right is that downstream phases can land into stable infrastructure.

**This pattern is highly significant for the extraction era.** The architecture lane (Pass 268+) has been planning a multi-pass extraction. The MapSessionProvider Phase 1 demonstrates the TEMPLATE: ship inert seams first, inflate later. Each phase preserves "Zero behavior change" until the final phase activates the new behavior.

### REF-tier candidate addition

**Doctrine candidate 7: Inert Seam Doctrine** (NEW Pass 12)
- **Evidence:** `MapSessionProvider.tsx` Phase 1 ships engine-less; planned 5-phase progression; "Trivial rollback" documented; "first-import-line" patch convention.
- **Assertion:** "Multi-phase architectural changes ship inert seams first (no-op providers, scaffold modules) so subsequent phases can inflate without changing existing consumers. Each phase maintains 'Zero behavior change' until the activating phase."
- **REF-tier wording suggestion:** Doctrine doc, references the explicit pattern for future extraction work.

---

## §3 Lane B — Evolutionary persistence doctrine tracing

### Namespace convention chronology (synthesized)

Earlier inventory across 12 passes:

| Convention | Example | First observed | Likely era |
|---|---|---|---|
| `bidondent_*` (underscore) | `bidondent_navigation_preferences` | Earliest | Original convention |
| `bidondent_user:<email>` (PII-keyed) | `bidondent_user:molalign5@gmail.com` | Pass 1 R-03 | Early (legacy PII shape) |
| `bidondent_nav_session_user_<id>_*` | `bidondent_nav_session_user_37l2..._nav-1778...-2` | Pass 4 | Mid-era (Clerk-aware) |
| `bd:<area>:<key>` (short colon) | `bd:map:legend:expanded` | Pass 12 (Pass 12 KI-164/166 fix) | Pass 12-era UI microstate |
| `bidondent.<feature>.<sub>.v<n>` (dot+versioned) | `bidondent.navigation.mapPerformance.v1` | Pass 4 B4-04 | Mid-late era (versioned-shape adoption) |
| `bidondent-<feature>-<sub>-v<n>` (dash+versioned) | `bidondent-navigation-discovery-quality-snapshot-v1` | Pass 11 §1 | Pass 28-extracted |
| `__<vendor>_*` | `__clerk_environment` | Pass 4 | Vendor-managed |
| `lswt-<random>` (transient) | `lswt-0.7615...` | Pass 5 F5-04 | Vendor leader-election |

### Per-brief Lane B question: do conventions correlate with semantic volatility / user ownership / extraction-era modularization?

Observed patterns:

- **Underscore convention** correlates with: oldest, longer-lived, original-codebase persisters (preferences, sessions, parked car, saved locations).
- **Dot+versioned convention** correlates with: structured data with potential schema evolution (mapPerformance, providerHealth — both array-shaped, both consumed by analytics).
- **Dash+versioned convention** correlates with: extracted-module persisters (placeDiscoveryQuality is the only one observed; it's a Pass 28 extraction).
- **Colon convention** (`bd:`) correlates with: small UI microstate (legend expanded boolean — 27 bytes).
- **PII-keyed convention** correlates with: legacy user-data shapes (the email-keyed user cache — predates Clerk userId-keyed pattern).

**Strongest correlation:** newer conventions are adopted when modules are EXTRACTED or when a new persistence class is introduced. **Existing persisters are NOT retrofitted to match newer conventions.** This preserves continuity across migrations — old user data in `bidondent_navigation_preferences` continues to work because the read path doesn't change.

**The asymmetry IS continuity-preservation infrastructure.** Each convention represents a generation; flattening would break user data.

---

## §4 Lane C — Failure-preservation choreography deepening

### `ShopDirectoryMapPaneInlineUI.tsx` source confirms graceful failure design

```typescript
// ShopDirectoryMapPaneInlineUI.tsx lines 60-90
) : (
  <>
    <p className={`text-sm font-semibold ${isDark ? "text-white/90" : "text-slate-800"}`}>
      Map failed to load
    </p>
    <p className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-slate-500"}`}>
      Your shop list is still available. Retry the map or continue in list mode.
    </p>
    <div className="mt-1.5 flex w-full flex-wrap justify-center gap-2">
      <button onClick={onRetryMap} className="...">Retry map</button>
      {onSwitchToListMode ? (
        <button onClick={onSwitchToListMode} className="...">Use list mode</button>
      ) : null}
    </div>
  </>
)}
```

**Source-confirmed properties of the failure UX:**

1. **Theme-adaptive treatment** — `isDark` controls text color (white/65 vs slate-500), button styling. Failure visual treatment respects user's tile preference.
2. **Concise honest copy** — "Map failed to load" + "Your shop list is still available. Retry the map or continue in list mode." No exclamations, no error codes, no scolding.
3. **Two recovery paths** — Retry primary (blue), Use list mode secondary (bronze-trim glass). Conditional render `{onSwitchToListMode ? ...}` — secondary path optional based on consumer.
4. **Bronze-trim secondary button** — `border-[rgba(140,82,22,0.28)]` matches the LAW-locked palette. Failure UI participates in the brand.
5. **`min-h-[40px]` touch targets** — meets WCAG AA but not AAA (Pass 9 I9-02).
6. **`flex-wrap justify-center`** — buttons wrap to second line on narrow widths (mobile-considerate even though not directly testable per Pass 1 R-15).

### Failure-preservation doctrine (REF-tier candidate from Pass 11 §5 #6, now refined)

The failure UX preserves trust by:

| Preservation mechanism | Evidence |
|---|---|
| Spatial context retained | Map tiles visible behind failure card (Pass 8 F8-01) |
| Multiple recovery paths | Retry (network) + Use list mode (graceful degradation) |
| Theme continuity | Dark/light adaptive treatment |
| Brand continuity | Bronze trim on secondary button |
| Calm tone | No exclamation, no error code, no blame |
| Layout responsiveness | `flex-wrap justify-center` for mobile |
| Conditional secondary path | `onSwitchToListMode` may be undefined; UI handles gracefully |

This refines the Pass 11 §5 doctrine candidate 6: **Spatial-Trust-During-Failure** is now mechanically corroborated by source-reading. The pattern includes theme-adaptive + brand-continuous + multi-path + non-blocking properties.

### Ranking failure-preservation across surfaces

| Surface | Failure-preservation strength | Evidence |
|---|---|---|
| Map (R-01) | HIGH | Tile preservation + 2-path recovery + theme adaptive |
| Wizard write-path | MEDIUM-LOW | Cancel silently destroys (C-09); cross-tab leak (F5-03) |
| Tab transition (A4-02) | LOW | Stuck blank state with no recovery affordance |
| Storage corruption | HIGH | Pass 2 P-02 self-heal to default + rewrite |
| Realtime cleanup | HIGH | Deterministic teardown (Pass 1 +P-07) |
| Navigation popstate | HIGH | Falls back to home/dashboard if state invalid (useNavigation.ts:185) |

The map and storage-corruption surfaces are exemplary. The wizard-Cancel and A4-02 stuck-mount surfaces are the outliers where failure-preservation doctrine isn't applied uniformly. Those are the targets for the architecture lane to consider.

---

## §5 Lane D — Perceptual governance (Pass 9 z-tier inventory CORRECTION)

### Z-tier inventory was incomplete — Pass 12 finds more

Pass 9 O9-01 listed 6 z-tiers. Pass 12 source-reading discovered:

```typescript
// ShopDirectoryMapPaneInlineUI.tsx line 118
className={`pointer-events-none absolute z-[520] ${...}`}
```

**z-520** for the MapTilePicker (light/night/satellite tile mode picker on map) — sits between z-510 (search-this-area + ROUTE box) and z-600 (failure overlay).

Updated z-tier inventory:

```
z-9999  bd-skip-link (a11y top)
z-600   R-01 failure overlay
z-520   MapTilePicker (tile mode picker)         ← NEW Pass 12
z-510   "Search this area" + ROUTE box
z-490   decorative atmosphere overlay
z-205   bd-liquid-gold-flow ambient (BENEATH map)
z-50    mobile bottom nav
```

**7 deliberate tiers** now (not 6). Still cooperative not accumulated. The atmospheric inversion (z-205 BELOW map) and skip-link supremacy (z-9999) hold. The new z-520 fits cleanly between map controls (510) and failure UI (600) — visual depth: tile picker is "above" search-this-area but "below" the failure card. **Logical ordering preserved.**

This DOES NOT invalidate Pass 9 O9-01 finding ("cooperative not accumulated") — it strengthens it: the system has SEVEN deliberate tiers all with logical roles.

### Updated REF-tier doctrine candidate 5 (Cooperative Z-Tier Hierarchy)

Updated count: **7 deliberate tiers** in BidOnDent code (excluding 2 vendor overlays at MAX_INT-1).

---

## §6 Lane E — Doctrine taxonomy refinement (REF-tier groupings)

Per brief: "Possible future taxonomy groupings: authority doctrines, continuity doctrines, trust-preservation doctrines, orchestration doctrines, emotional-navigation doctrines, evolutionary-governance doctrines."

### Proposed 6-grouping REF-tier taxonomy

#### Group 1: Authority Doctrines
- **Authority-Transition-on-Explicit-Gesture** (Pass 11 §5 #2): system default → user explicit click → user-owned. Holds across camera, tab nav, tile mode, wizard step.
- **Gesture-Aware History Depth Control** (NEW Pass 12 §1): `pushState` for depth changes, `replaceState` for peer swaps. History.state is the navigation truth.
- **Distributed-Authority Persistence** (Pass 11 §5 #1): shared harness, locally-owned contracts, evolutionary naming.

#### Group 2: Continuity Doctrines
- **Modal-less Continuity-Bias UI** (Pass 11 §5 #3): zero `<dialog>`, inline-state confirmations.
- **Cooperative Z-Tier Hierarchy** (Pass 11 §5 #5, refined Pass 12 §5): 7 deliberate tiers with cooperative roles. Atmospheric inversion deliberate.

#### Group 3: Trust-Preservation Doctrines
- **Spatial-Trust-During-Failure** (Pass 11 §5 #6, refined Pass 12 §4): failure UX preserves user's spatial/operational context behind any failure messaging. Theme-adaptive, brand-continuous, multi-path, non-blocking.
- **Defer-Fetch-on-Pan** (NEW Pass 12 from §2): explicit "Search this area" button defers re-fetch to user signal. System refuses to auto-refetch on every pan.

#### Group 4: Orchestration Doctrines
- **Restrained Motion Discipline** (Pass 11 §5 #4): 1 infinite ambient + N one-shots, CSS for self-contained / framer-motion for view orchestration.
- **Inert Seam Doctrine** (NEW Pass 12 §2): multi-phase architectural changes ship inert seams first (no-op providers); subsequent phases inflate without changing existing consumers.

#### Group 5: Emotional-Navigation Doctrines
- **3-Stage Cinematic Emergence** (Pass 8 T8-01, dev-mode-amplified): chrome → tiles+route → cluster pin. Production behavior unverified; doctrine candidate pending host-side measurement.
- **Warm-Anchor / Cool-Ambient Color Hierarchy** (Pass 8 D8-02, observational): cream/champagne hero anchors against cool blue ambient establish visual eye-flow without competition.

#### Group 6: Evolutionary-Governance Doctrines
- **Asymmetry-as-Evolution** (NEW Pass 12 §3): namespace conventions are NOT retrofitted; each represents a generation. Old persisters keep old conventions. Evolution preserves continuity by avoiding mass-rewrite.
- **Phased Extraction with Trivial Rollback** (NEW Pass 12 §2): each architectural extraction is a multi-phase plan with documented rollback. "Zero behavior change" until activating phase.

### REF-tier taxonomy summary

```
Authority Doctrines       (3 candidates)
Continuity Doctrines      (2 candidates)
Trust-Preservation        (2 candidates)
Orchestration Doctrines   (2 candidates)
Emotional-Navigation      (2 candidates)
Evolutionary-Governance   (2 candidates)
                          ────────────
Total                      13 REF-tier doctrine candidates
```

**13 REF-tier candidates** across 6 groupings. None are LAW-tier yet.

Per discipline: "Do NOT escalate to LAW-tier unless: patterns remain stable across: time, maintainers, feature additions, and production pressure."

The taxonomy makes the doctrine landscape visible without enforcing it. Future contributors can read these as PATTERNS to honor; future architects can choose which to elevate to LAW-tier when stability is sufficient.

---

## §7 Cumulative verified-good runtime invariants (now at 60)

Adding to Pass 1–11 (56 prior baselines):

57. **Gesture-aware history depth control** — pushState for depth, replaceState for peer; popstate handler restores all 3 state slots.
58. **MapSessionProvider Phase 1 inert seam** — engine-less default value preserves existing consumer behavior.
59. **Z-tier inventory expanded to 7 deliberate values** — adds z-520 for MapTilePicker between map controls and failure UI.
60. **Failure UX is theme-adaptive AND brand-continuous** — Dark/light treatment + bronze-trim secondary button. Failure participates in the brand.

Total verified-good runtime invariants across 12 passes: **60**.

---

## §8 Cumulative framework predictivity (now at 19)

Pass 12 confirms one additional framework prediction:

| Framework prediction | Pass-12 confirming evidence |
|---|---|
| "Architectural extractions preserve continuity through phased seam-shipping" | §2 MapSessionProvider Phase 1 demonstrates the template: ship inert seam, inflate later. "Zero behavior change" guarantee. |

Total framework predictions confirmed across 12 passes: **19**.

---

## §9 Per owner-brief reporting threshold

Per Pass-12 brief escalation criteria:
- Mechanically undeniable instability — **No**
- Doctrine contradictions — **No**
- Continuity invalidations — **No**
- Governance collapse — **No**
- Owner-decision-bound semantic ambiguity — **No new ones; F5-03 wizard cross-tab leak still pending owner decision**

Plus implicit: **major audit-phase completion** — Pass 12 reaches 13 REF-tier doctrine candidates organized into 6 taxonomy groupings. Doctrine taxonomy refinement phase reaches a coherent state.

Reporting per phase-completion threshold.

---

## §10 Recommended Pass 13+ priorities

Per discipline: continue observational acquisition.

Candidate next lanes:
- **Owner ratification of REF-tier doctrine taxonomy** — owner decides which of the 13 candidates to formalize as REF docs in `docs/REF_*.md` or as REF sections in existing docs.
- **Camera-pan via mouse-drag simulation** — would test camera authority transitions empirically.
- **Production-build cinematic timing measurement** (host-side `npm run preview`).
- **Authorized auth-flip test** (Pass 5 §5 — 8 questions still pending).
- **SP10-01 fix execution** (still pending owner authorization for builder lane).
- **Cross-tab wizard-draft race characterization** (F5-03 — intentional or not?).

---

## §11 Standdown

Pass 12 ships this single evidence doc. Zero source edits. Zero edits to AI_LOCK or any locked doc. AI_LOCK Pass 275 unchanged.

Cumulative across 12 passes:
- ~175 distinct findings
- **60 verified-good runtime invariants** — comprehensive regression-detection baseline
- 31 continuity-preservation mechanisms
- **7 deliberate z-tiers** topologized (corrected from Pass 9 6-tier finding)
- 1 infinite + 7 one-shot animations characterized
- 8 namespace families × 5 conventions × 5 ownership categories
- 3 motion subsystems mapped
- 3 multi-tab continuity models
- 3 identity systems
- 19 framework predictions confirmed
- **13 REF-tier doctrine candidates** organized into 6 taxonomy groupings (NOT enforced)
- placeDiscoveryQuality.ts:51 mechanically explained
- useNavigation.ts gesture-aware history depth control mechanically captured
- MapSessionProvider Inert Seam Doctrine identified

The runtime audit lane has now produced a comprehensive operational map AND a 13-candidate doctrine taxonomy AND a 60-invariant regression baseline. The architecture lane has substantial reference material to ground extraction-era preservation work.

Per Pass-7+ discipline: continuing autonomous observational acquisition. Reporting only when threshold criteria are crossed.
