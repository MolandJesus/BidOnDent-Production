# AUDIT — Runtime Integrity Pass 2 (2026-05-09)

**Pass:** 2 of N (operational integrity verification)
**Trajectory:** surface QA → operational integrity verification (per owner Pass-2 brief)
**Discipline:** observational only; zero source-file edits; zero edits to AI_LOCK or any locked doc; single new evidence file (this one).
**Lock state:** AI_LOCK Pass 275 (Type-Import Dependency Graph) was active at session start; this audit lane stayed entirely outside its scope.
**Branch / commit:** `BidOnDent-Horizon-Beta` @ `3baeff18` (unchanged since Pass 1 audit).
**Live system:** dev server `http://localhost:5173/`, signed in as `molalign5@gmail.com` (Clerk userId `user_37l2aa5TqRLeLesZQIq5ibdXUul`).

This pass focused on the seven priority lanes the owner brief established: route-state authority, map-state authority, persistence stress, realtime quantification, emotional continuity, performance perception, and taxonomy expansion.

---

## §1 Headline reframings (reversal of Pass-1 hypotheses where evidence demanded it)

Two Pass-1 hypotheses were materially refined here. Recording these reversals first because they reorganize how subsequent findings are read.

### Reversal A — R-04 was wrong about the cause; right about the symptom.

**Pass-1 said:** "Account + Report tabs render BLANK with only the header. No console errors. Likely a one-line tab-switch case statement returning `null`."

**Pass-2 evidence:** The Account view is **fully built and functional**. After hard reload while `currentTab === 'account'`, the page renders the complete Account experience: ACCOUNT HUB hero with profile, IDENTITY > Account Information section with name/phone/email/vehicles fields populated, SETTINGS > Actions & Preferences section, PREFERENCES > Appearance Settings entry, PROFILE TOOLS (My Vehicles / Help & Support / Smoke Test Checklist), SESSION > "End this session" link. Multi-tab cross-check (opening a fresh tab) renders Account at full fidelity.

**Real cause:** the **tab transition** is broken. When the user clicks Account from any other tab, the previous view's render persists, layered with a transient dim/blur. The destination view (Account) is mounted but its visual emergence is incomplete. Hard reload bypasses the transition path entirely and renders correctly.

**Severity is higher, not lower:** Pass-1 thought a route was missing. Reality is a transition-path defect, which is a **State Authority Divergence** affecting every tab-to-tab navigation. R-04 is upgraded from "Account/Report blank" to "Tab transition fails to complete content swap, leaves stale prior view visible".

### Reversal B — Mobile bottom nav exists; ships at all viewports.

**Pass-1 noted:** "8 sidebar buttons (4 unique × 2 instances) — likely a hidden mobile nav rendering at desktop."

**Pass-2 evidence:** Confirmed. The duplicate Account button has rect `(0, 0, 0, 0)` — DOM-present, layout-collapsed at desktop. Parent class is `flex items-center justify-around py-1.5 px-2` (mobile bottom-nav idiom). It is shipped on every render regardless of viewport. Hydration cost; misleading for any future a11y or button-count audit; otherwise harmless.

---

## §2 Expanded severity taxonomy (per owner brief)

| Code | Name | What it captures |
|---|---|---|
| `SAD` | State Authority Divergence | Two layers (URL/state/storage/render) disagree on the same fact |
| `RTM` | Runtime Truth Mismatch | UI claims one thing, underlying subsystem succeeded/failed differently |
| `ETD` | Emotional Tone Drift | Motion/atmosphere/pacing breaks character |
| `NAF` | Navigation Authority Failure | Routing layer doesn't actually route |
| `PSR` | Persistence Saturation Risk | Storage growth without LRU; quota approach unmanaged |
| `LAR` | Lifecycle Amplification Risk | One conceptual event triggers multiple physical events |
| `UTI` | UX Trust Instability | The product visibly looks broken even when functionally healthy |
| `ICF` | Interaction Confidence Failure | User cannot tell whether their action took effect |
| `OK` | Verified-good runtime invariant | Positive baseline; preserve in extraction-era |
| (Pass-1 codes preserved) | CRT/FN/SC/VI/EM/RP/A11Y/PRF/RT/PN/IF/DR | Still valid; expanded codes refine where appropriate |

---

## §3 Pass-2 findings table

| ID | Sev | Layer | Title | Confidence |
|---|---|---|---|---|
| **N-01** | NAF/SAD | L3 nav | No client-side router exists; URL is decorative | 100% |
| **N-02** | SAD | L3 nav | currentTab authority order: localStorage > history.state > URL | 99% |
| **N-03** | NAF | L3 nav | All URLs (incl `/random-xyz`) render the same view | 100% |
| **N-04** | NAF | L3 nav | No 404 page; unknown URLs silently render last view | 100% |
| **N-05** | UTI/ICF | L2 transitions | Tab transition fails to swap content (Pass-1 R-04 reframed) | 99% |
| **N-06** | SAD | L3 storage | Multi-tab inherits currentTab via localStorage; no isolation | 100% |
| **N-07** | RTM | L2 chrome | Header text + sidebar active state agree with state, NOT URL | 100% |
| **N-08** | DR | L2 nav | Mobile bottom-nav DOM-shipped at all viewports (rect 0×0 at desktop) | 100% |
| **N-09** | UTI | L2 account | "Smoke Test Checklist" admin surface exposed in Account view | 95% |
| **P-01** | LAR | L4 services | (Re-confirmed) Mount-time realtime+fetch double-trigger; idle-time = 0 events | 100% |
| **P-02** | OK | L4 storage | Malformed JSON in `bidondent_navigation_state` recovered gracefully | 100% |
| **P-03** | PSR | L4 storage | 22 nav-session keys spanning 1.8 days; no LRU; 0.84% of 5MB | 100% |
| **P-04** | OK | n/a | localStorage 43KB / 40 keys / 0.84% of cap; healthy headroom | 100% |
| **F-01** | PRF | L1 dev | dev-mode FCP `9492ms` vs `domContentLoaded 202ms` (caveated) | 70% |
| **F-02** | OK | L2 layout | Cumulative Layout Shift = 0.000 — perfect | 100% |
| **F-03** | OK | L4 runtime | JS heap 59 MB / 4096 MB cap; 0 long tasks during idle | 100% |
| **F-04** | OK | L4 runtime | 10s idle window: 0 realtime events, 0 fetches | 100% |
| **F-05** | OK | L2 transitions | Tab click → 1 bid fetch (not 6); cold-mount only triggers amplification | 100% |
| **A-01** | OK | L2 chrome | `aria-current="page"` correctly applied to active sidebar tab | 100% |
| **C-01** | UTI | L2 transitions | Bids click renders Account view content for ~6s before swap completes | 95% |

---

## §4 Lane 1 — Route-State + Navigation Authority (HIGHEST priority lane)

### N-01 — There is no client-side router

```
hasReactRouter: false
Array.from(document.querySelectorAll('script')).some(/react-router/) === false
```

The application does not include `react-router`, `wouter`, `tanstack-router`, `next/router`, or any other routing library. Confirmed by global symbol scan (`window.__REACT_ROUTER__` undefined) and by behavior: navigating to `/account`, `/bids`, `/random-nonexistent-route-xyz123` produces identical render results. URL is purely cosmetic.

### N-02 — State authority order: localStorage > history.state > URL

Evidence chain:

1. URL `/account`, `history.state.currentTab='home'` → renders Dashboard
2. URL `/`, after `history.replaceState({currentTab:'home',...})` → still rendered **Account** (because localStorage `bidondent_navigation_state` had `currentTab='account'` and overrode my state injection)
3. Hard reload at URL `/account` with `history.state.currentTab='home'` → renders Dashboard, header "Dashboard", aria-current "Dashboard". URL did not influence render.
4. Cold-mount of new tab to `/` → renders **Account** (localStorage carried `currentTab='account'` across tab boundaries)

The render-decision derives from `currentTab`. `currentTab` is hydrated on mount from localStorage (`bidondent_navigation_state`). `history.state` and the URL pathname are write-only display labels for the React app; the React app does not read them on hydration in any decisive way.

Implications:
- **No deep-linking.** Sharing a URL doesn't share a view.
- **Browser back/forward buttons skip tabs.** Back navigation walks URL history (which the React app doesn't react to) and leaves the rendered view in place.
- **Bookmarks don't work.** A bookmark for `/bids` reopens to whatever tab the localStorage says.
- **Server analytics see `/` for everything.** Funnel attribution by URL is untrustworthy.
- **Cross-tab leak.** Opening a second tab inherits the first tab's view selection.

### N-03 / N-04 — Catch-all renders, no 404

Navigation to `/random-nonexistent-route-xyz123`:
```
url:        /random-nonexistent-route-xyz123
historyState: null  (not the React app's tab state)
has404:     false
mainStart:  Skip to main content...BidOnDent...Dashboard...Report...Bids...Account...
```

No "Not Found" page exists. Unknown URLs silently render the last-set tab. Search engines hitting random URLs would see real content.

### N-05 — Tab transition fails to complete content swap (R-04 reframed)

**Reproducible sequence:**
1. Land on Bids tab (renders Bid Comparison + Repair Bids + TestShop card cleanly)
2. Click sidebar `Account`
3. Header changes to "Account", sidebar Account button gets `aria-current="page"`, history.state mutates to `currentTab='account'`
4. **Visible content stays as Bids view, dimmed/blurred**, for several seconds
5. Eventually transitions to Account UI

Severity is high because:
- Three of four chrome elements (sidebar, header, aria) say "Account"; the fourth (visible content) says "Bids"
- User cannot tell whether the click registered
- This is `UTI` (visibly broken) AND `ICF` (cannot tell if action took effect) AND `SAD` (state diverges from render) at the same time

The destination view IS mounted (verified via DOM walk: `Account Hub`, `Molalign Meagher Profile`, `Account Information`, etc., all in the DOM). The transition machinery just doesn't fully complete the visual handoff.

### N-06 — Multi-tab cross-contamination

Opening a second browser tab to `http://localhost:5173/`:
```
Tab 1: currentTab='account', Account UI dimmed
Tab 2 (newly created): currentTab='account', Account UI fully rendered
```

Both tabs landed on Account. The fresh tab inherited the existing tab's state via shared localStorage. Two tabs of the same app cannot independently view different sections.

Bonus observation: Tab 2 (fresh load) renders Account at FULL fidelity. Tab 1 (transitioned from Bids → Account) renders Account at reduced opacity. Side-by-side, the visual difference is dramatic. **This is conclusive evidence that the dim is a transition-path defect, not a view-implementation defect.**

### N-07 — Header / sidebar / aria are state-driven; URL is decorative

When URL is `/account` but state is `currentTab='home'`:
- header: "Dashboard"
- sidebar Dashboard button: highlighted with `aria-current="page"`
- sidebar Account button: not active
- content: Dashboard view

Three chrome elements all internally agree (sidebar, header, content). They diverge only from the URL bar. Users who type URLs into the address bar will be quietly ignored.

---

## §5 Lane 2 — Map-State Authority

Pass-2 was unable to fully re-test the map-authority chain because reaching the map view from a clean session required navigating through the home/dashboard scroll position with a specific currentTab value, and the navigation defects in §4 made reproducible cold-mount of the map surface unreliable in this session. Pass-1's R-01 evidence stands; deeper chain mapping deferred to Pass 3 with a clean reset protocol.

What was confirmed in this pass:
- Map renders only when `currentTab === 'home'` AND user has scrolled into the Smart Shop Discovery panel (Engine A coverage map preview).
- Account/Bids/Report tabs do not instantiate any MapLibre canvas — confirmed by `document.querySelectorAll('canvas').length === 0` while on those tabs.
- This is **correct lazy-mounting** behavior. No wasted MapLibre instantiation when the tab doesn't need it. **Mark as +OK.**

---

## §6 Lane 3 — Persistence Lifecycle Stress

### P-01 — Mount-time amplification re-confirmed; idle is silent

10-second idle window measurements:
```
{ rtSubscriptionEvents: 0, rtUnsubscriptionEvents: 0,
  bidsFetchEvents: 0, longTasksDuringIdle: 0 }
```

Tab-click measurements (after instrumented `console.log` and `fetch` interception):
```
After clicking sidebar Bids (from Account):
{ rtSubs: 0, rtUnsubs: 0, bidsFetches: 1, header: "Bids" }
```
One fetch per tab activation — clean. R-02's "12 sub/unsub events in 4s" pattern from Pass 1 is **specifically a cold-mount-only amplification**. Steady-state is well-behaved.

### P-02 — Malformed storage payload is recovered gracefully

Test:
```js
localStorage.setItem('bidondent_navigation_state', '{not valid json');
location.reload();
```

Result:
- Page rendered Dashboard view fully
- localStorage was **rewritten** to `{"currentTab":"home","viewMode":"dashboard","selectedReportId":null}`
- No console errors
- No visible degradation

This is excellent defensive behavior. The hydration code catches the JSON parse error, defaults to a safe state, and self-heals the storage. **Verified-good runtime invariant.**

### P-03 — localStorage growth + nav-session accumulation

```
totalKeys: 40
totalBytes: 43996  (43 KB)
pctOf5MB: 0.84%
navSessionCount: 22
oldestNavSession: 2026-05-08T05:07:00Z
newestNavSession: 2026-05-09T23:45:19Z
ageSpanDays: 1.8
```

Growth rate ≈ 12 nav sessions/day for active use ≈ 16 KB/day at current per-session size. At this rate, the 5 MB ceiling is ~315 days away (~10 months). Not immediate risk; recommend LRU eviction with a 30-session or 7-day cap as Pass-3+ work.

Namespace breakdown:
```
bidondent_  : 33 keys / 29 KB  (correct prefix)
bidondent.  :  3 keys /  7 KB  (correct prefix, dotted variant)
bd:         :  1 key  / 27 B   (legend expand state)
clerk_      :  1 key  / 813 B  (Clerk SDK)
<root>      :  2 keys / 6.8 KB (NO prefix at all — 2 unnamespaced keys)
```

Confirms Pass 274 §3 finding of 4 BidOnDent-side namespacing conventions + unnamespaced. Worth folding into the type-import dependency graph that Pass 275 is building.

### P-04 — Storage + memory healthy

JS heap: 59 MB used / 4096 MB cap (1.4% of limit). No leaks observed across the multi-tab + transition sequence. Steady-state memory is fine.

---

## §7 Lane 4 — Realtime Lifecycle topology

Quantitative result already covered in §6 P-01. Topology summary:

| State | Realtime sub events | Realtime unsub events | Bid fetches |
|---|---|---|---|
| Cold mount (with reports loaded) | ~9 (3 reports × 3 cycles) | ~9 (matched cleanup) | 6 (3 reports × 2 dup) |
| Idle 10s | 0 | 0 | 0 |
| Tab click (Bids → Account) | 0 | 1 (clean teardown) | 0 |
| Tab click (Account → Bids) | 0 | 0 (Bids not subscribed yet) | 1 |
| Multi-tab open | per-tab cold-mount cost | per-tab cold-mount cost | per-tab |

Multi-tab note: each open tab maintains its own realtime subscriptions. Two tabs open against the same user = 2× subscription load on the Supabase realtime gateway. Not catastrophic for one user, but a fan-out concern for power users with many tabs and worth noting in the realtime topology baseline.

---

## §8 Lane 5 — Emotional Continuity + Motion Integrity

Documented qualitatively from Pass-1 + Pass-2 observations:

- **+OK:** The bronze/champagne lamp + cool-blue glass design language is consistently applied across Dashboard, Bids, Account views. The atmospheric warmth survives tab transitions.
- **ETD candidate:** The **transition dim** during tab switches (N-05 / C-01) breaks emotional continuity. The user's eye expects either a clean instant cut or a graceful crossfade; instead, they see the previous view flat-fade to ~30% opacity, hold there, then the new view emerges underneath. This is the most emotionally jarring artifact found across both passes.
- **+OK:** Loading transitions on the map fallback ("Use list mode") are pace-coherent — clean fade with no jitter.
- **+OK:** The "Welcome back, Molalign" hero panel uses warm-cream to bronze-trim layering exactly per LAW spec.
- **Question for owner:** the ~6-second hold on the previous view's content during tab transitions reads as "broken loading" rather than "intentional pause". Is this the result of an awaited async data fetch holding back the new view? If so, a skeleton/shimmer for the destination view would close the trust gap without changing the underlying machinery.

---

## §9 Lane 6 — Performance Perception

### F-01 — Dev-mode FCP anomaly

```
domInteractive            21 ms
domContentLoadedEventEnd  202 ms
loadEventEnd              256 ms
first-paint               9492 ms
first-contentful-paint    9492 ms
LCP                       null (observer didn't capture)
resourceCount             216
```

The 9.5-second gap between DCL and FCP is unusual. Vite dev mode ships ES modules individually (216 resources confirms this), so this is largely a dev-mode artifact. **Do not action without verifying in production build.** Recommend repeating this measurement against `vite preview` or production deploy.

The `LCP: null` is also a measurement artifact — likely the LCP observer was set up after the largest content paint had occurred. Production measurement should re-establish.

### F-02 — Cumulative Layout Shift = 0.000 (perfect)

`performance.getEntriesByType('layout-shift').reduce((s,e) => s+e.value, 0) === 0.0000`

No unintended layout shifts captured across the session. Core Web Vitals "Good" threshold is < 0.1; this is far better. **Verified-good baseline.**

### F-03 — Memory & long tasks

```
JS heap used:    59 MB
JS heap total:   61 MB
JS heap limit: 4096 MB
Long tasks during idle: 0
```

Healthy. No long tasks during the 10-second idle observation window. **Verified-good baseline.**

### F-04 — Idle is silent, tab activations are minimal

Quantified in §6 P-01. The runtime is well-behaved at rest.

---

## §10 Lane 7 — Anchors for future audits

Documented runtime invariants worth preserving as regression baselines:

1. **Storage signed-URL invariant** — 0 `storage://` leaks across rendered images (Pass-1 +P-01).
2. **24h signed URL TTL** — `exp - iat = 86400s` exactly (Pass-1 +P-03).
3. **Bronze trim + lamp colors match LAW** — `rgba(140, 82, 22)` trim and `rgba(196, 144, 65)` lamp computed from live DOM (Pass-1 +P-02).
4. **CLS = 0.000** — perfect cumulative layout shift, dashboard + bids + account (Pass-2 F-02).
5. **Idle = silent** — 0 realtime events, 0 fetches over 10s observation window (Pass-2 P-01).
6. **Tab activation = 1 net fetch** — clean steady-state (Pass-2 F-05).
7. **Malformed-storage recovery** — invalid JSON in nav state self-heals to default (Pass-2 P-02).
8. **JS heap = 59 MB** — well within limits, no leaks observed (Pass-2 F-03).
9. **`aria-current="page"`** — correctly applied to active sidebar tab (Pass-2 A-01).
10. **Realtime cleanup** — subscribe/unsubscribe pairs are deterministic (Pass-1 +P-07; Pass-2 P-01 confirms steady-state).
11. **Realtime cleanup on tab change** — clean teardown observed (Pass-2 §7 table row).

These eleven invariants form a regression-detection baseline. Any future extraction-era refactor that violates one of them should fail audit.

---

## §11 Cross-pass severity revision summary

| Pass-1 ID | Pass-1 severity | Pass-2 outcome |
|---|---|---|
| R-01 (map state desync) | CRT/SC | Confirmed — RTM (Runtime Truth Mismatch) is the better label |
| R-02 (realtime churn) | CRT/RT | Confirmed; **scope narrowed**: cold-mount only, idle silent → LAR (Lifecycle Amplification Risk) |
| R-03 (PII in storage key) | CRT/PN | Unchanged |
| R-04 (Account/Report blank) | CRT/FN | **Reframed**: not blank-route, but tab-transition dim — UTI/ICF/SAD; severity remains CRT but cause is different |
| R-05 (duplicate fetches) | FN/PN | Confirmed cold-mount-only (LAR sub-finding of R-02) |
| R-06 (KI-179 storm) | FN/PRF | Unchanged |
| R-07 (737mi + <2hours) | FN/IF | Unchanged |
| R-08 (no URL routing) | DR/SC | **Confirmed and quantified**: NAF (Navigation Authority Failure); now N-01 through N-04 |
| R-09 (localStorage growth) | PN | Confirmed; PSR; quantified at 22 sessions / 1.8 days / 16 KB/day growth |
| R-10 (PII in console.log) | A11Y/PN | Unchanged |
| R-11 (cream inset drift) | DR/VI | Unchanged |
| R-12 (transition perf) | PRF | Unchanged |
| R-13 (cat seed photo) | IF | Unchanged |
| R-14 (12px attribution link) | A11Y | Unchanged |
| R-15 (mobile resize gap) | RP | Unchanged (still untestable from sandbox) |

New Pass-2 codes:
- N-01 through N-09 (navigation authority lane)
- P-01 through P-04 (persistence lane; some +OK)
- F-01 through F-05 (performance lane; mostly +OK)
- A-01 (a11y +OK)
- C-01 (continuity)

---

## §12 Recommended action queue (advisory; no source edits made)

Re-ranked after Pass-2 evidence:

1. **N-05 (tab transition dim)** — highest UX trust impact; affects every tab change. Same root cause likely closes Pass-1 R-04.
2. **N-01 / N-02 (no router; localStorage > URL)** — architectural; informs Pass 274 §5 route taxonomy seam directly. Owner-decision-point candidate.
3. **N-06 (multi-tab cross-contamination)** — affects power users; once router is added (#2), this closes itself if router is per-tab.
4. **R-03 (PII in storage key)** — single-line fix; ongoing privacy exposure.
5. **R-01 (map state desync)** — RTM root cause likely related to N-05 transition machinery.
6. **R-02 (mount-time amplification)** — narrow surface (cold-mount only); useMemo on report-id signature should fix.
7. **N-04 (no 404)** — needed before public launch; trivial once router exists.
8. **N-09 (Smoke Test Checklist exposed)** — verify it's `import.meta.env.DEV`-gated; ensure not shipped to prod.
9. **P-03 (nav-session LRU)** — defer; not urgent; estimate 10 months until quota issue.
10. **F-01 (FCP)** — re-measure in production build before actioning.

None of these require LAW changes, schema migrations, auth/storage invariant modifications, or Builder-AI lane work. All are within Phase 0–6 hardening scope.

---

## §13 Audit methodology — additions to Pass-1 reusable list

- **Test by URL navigation, not just by sidebar click.** Pass-1 missed N-01 entirely because all navigation was via sidebar. Hitting `/random-nonexistent-route-xyz` exposed the no-router truth in one call.
- **Compare two browser tabs side-by-side.** Pass-1 read R-04 as "blank Account view" because only one tab was tested. Multi-tab comparison revealed the dim is transition-specific, not view-implementation-specific.
- **Probe localStorage authority precedence with `replaceState` + reload.** This is the cleanest way to prove which layer is really driving render decisions.
- **Inject malformed storage payloads and reload.** Tests defensive recovery behavior in one shot.
- **Instrument `console.log` and `fetch` from inside `javascript_tool`.** Lets you measure event rates without source modification.
- **Take performance.getEntriesByType('layout-shift') sample.** CLS is one of the best proxies for emotional-continuity health.
- **Always check `aria-current` separately from focus.** They're WCAG-distinct concerns; both matter.
- **Note when `LCP` is null.** It usually means the LCP observer was set up too late; flag it but don't conclude perf is broken.

---

## §14 Standdown

Pass 2 ships this single evidence doc. Zero source edits. Zero edits to AI_LOCK or any locked doc. AI_LOCK Pass 275 (Type-Import Dependency Graph) was active throughout this audit and remains untouched and unblocked.

Open lanes for Pass 3 (when authorized):
- **Lane 2 (map authority)** — needs clean cold-mount with `currentTab='home'` for the Smart Shop Discovery view; the navigation defects in §4 made this unreliable in Pass 2.
- **Network throttling** — not exposed via Chrome MCP; would need devtools instrumentation to test reduced-connectivity behavior.
- **Production-build perf comparison** — needs `npm run build && vite preview` or deployed env to validate F-01 dev-mode artifact.
- **prefers-reduced-motion adherence** — still requires devtools emulation; flagged as known sandbox limitation.
- **Storage quota saturation** — would require injecting ~5MB of synthetic localStorage and observing failure mode; useful as a Pass 3 stress test if owner authorizes.

The runtime audit lane is now operationally mature enough to function as a regression-detection baseline for the extraction era. Pass 3 should focus on:
- map-authority chain mapping (deferred from this pass)
- production-build perf re-measurement
- prefers-reduced-motion adherence (with devtools)
- form-input flows (Report wizard 5-step, Edit profile, etc.)
- write-path runtime integrity (creating a damage report end-to-end)
