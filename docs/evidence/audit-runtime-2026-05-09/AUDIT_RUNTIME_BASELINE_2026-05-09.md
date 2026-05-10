# AUDIT — Runtime + UX Integrity Baseline (2026-05-09)

**Author:** Audit AI (independent runtime-verification lane, parallel to Builder AI architecture lane)
**Authorization:** Owner relay 2026-05-09 — "we have done a lot of work, audit it through chrome browser"
**Mode:** Observational only (no source-file edits, no doc-tier edits outside this evidence file)
**Lock state at session start:** AI_LOCK shows another Opus session active on `docs/REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md` + `AI_LOCK.md` (Pass 275). Audit lane non-overlapping (writes only to fresh evidence dir; no source / locked-doc edits).
**Branch / commit:** `BidOnDent-Horizon-Beta` @ `3baeff18` (265 commits ahead of origin, dirty tree per pre-existing owner-policy revisions)
**Live system:** `http://localhost:5173/` — dev server, signed in as `molalign5@gmail.com` (Clerk userId `user_37l2aa5TqRLeLesZQIq5ibdXUul`)
**Browser:** Chrome (MCP-driven). Viewport pinned to 1658×982 @ DPR 1.8 (window-resize MCP could not drop below this — mobile MQs untestable from sandbox; flagged below).
**Method:** Live browser traversal + JS introspection + console + network audit. No assumptions about source — every claim grounded in observed runtime behavior.

---

## Executive summary

The convergence work landed with **strong storage-invariant integrity** (zero `storage://` leaks across 18 rendered images), **strong recovery affordances** (failed-map → list-mode fallback works), and **strong design-token compliance on the bronze/gold lamp palette** (rendered `rgba(140, 82, 22)` trim and `rgba(196, 144, 65)` lamp match LAW exactly).

But the runtime surface exposes **four critical-tier instabilities** invisible to architectural audits:

1. **Map state-desync** — `Map failed to load` overlay renders on top of a fully-rendered map (basemap tiles loaded, route line drawn, report-bubble visible, canvas active 2098×1151). Reproducible across reload, 100% of dashboard loads in this session.
2. **Realtime subscription churn** — `RealtimeBidService` subscribes → unsubscribes → re-subscribes 3 cycles within 4 seconds for 3 distinct report IDs (12 sub/unsub events). Same dependency-array shape as the `/bids?reportId=` 2× duplicate-fetch pattern.
3. **PII leak in localStorage key** — `bidondent_user:molalign5@gmail.com` uses the user's email as a storage-key suffix. Visible to any same-origin script, devtools dump, screen share, browser extension.
4. **Empty-content routes** — Account and Report sidebar tabs render ONLY the header chrome — main content area is blank. No console errors. URL never changes for any sidebar click (no client-side router push) — matches Pass 274 §5 route-taxonomy risk surfaced in execution-readiness inventory.

Plus three **high-tier issues** the convergence-discovery lane should fold in:

5. KI-179 / KI-169 implausible-route warnings fire **40+ times per page load** for a single shop (`Express Auto Body`) with broken seed data (origin Atlanta GA `(33.95, -84.08)` mapped to NY metro destination → 737-872mi distances).
6. The same KI-179 broken seed data **leaks to customer-visible UX**: shop card shows "737.2 mi" and "<2 hours" simultaneously. Time-band labels and distance values are computed from different sources and don't reconcile.
7. **localStorage growth** — 22 `bidondent_nav_session_user_*_nav-*` entries with no visible LRU eviction. Will eventually hit the 5MB browser cap → silent persist failure.

---

## §1 Findings, classified

Severity scale: `CRT` Critical Runtime Failure · `FN` Functional Regression · `SC` State Continuity · `VI` Visual Integrity · `EM` Emotional Continuity · `RP` Responsiveness · `A11Y` Accessibility · `PRF` Performance · `RT` Realtime Consistency · `PN` Persistence Namespace · `IF` Interaction Friction · `DR` Architectural Drift · `OK` Verified-good

| ID | Sev | Layer | Title | Confidence |
|---|---|---|---|---|
| **R-01** | CRT/SC | L2 → L4 | Map "Failed" overlay paints over fully-rendered map | 99% |
| **R-02** | CRT/RT | L4 services | Realtime sub/unsub thrash (12 events / 4s) | 99% |
| **R-03** | CRT/PN | L4 hooks | PII in localStorage key (`bidondent_user:<email>`) | 100% |
| **R-04** | CRT/FN | L2 routes | Account + Report tabs render blank (header-only) | 100% |
| **R-05** | FN/PN | L4 | Duplicate `/bids?reportId=` fetch (6 calls / 3 reports) | 95% |
| **R-06** | FN/PRF | L4 routing | KI-179/KI-169 warning storm — 40+/load for one shop | 99% |
| **R-07** | FN/IF | L2 cards | Implausible distance/time pairing visible to users | 95% |
| **R-08** | DR/SC | L3 nav | Sidebar nav doesn't update URL (no router push) | 100% |
| **R-09** | PN | L4 | localStorage nav-session keys (22) — no LRU eviction | 100% |
| **R-10** | A11Y/PN | L4 | PII in console.log (`Phone: <number>`) ungated | 100% |
| **R-11** | DR/VI | L1 theme.css | Cream inset `rgba(247,232,194)` outside locked range | 80% |
| **R-12** | PRF | L1 css | 147 `transition: all` declarations + 28s ambient anim | 70% |
| **R-13** | IF | L2 seed | Damage-report card shows cat photo (seed UX) | 100% |
| **R-14** | A11Y | L1 | OpenStreetMap attribution link h=12px (touch target) | 100% |
| **R-15** | RP | n/a | Mobile MQs untestable from Chrome MCP (resize floor) | 100% |
| **+P-01** | OK | L4 | Storage `storage://` invariant holds (0 leaks / 18 imgs) | 100% |
| **+P-02** | OK | L1 | Bronze trim `rgba(140,82,22)` + lamp `rgba(196,144,65)` = LAW match | 100% |
| **+P-03** | OK | L4 | Signed URL TTL 24h (`exp - iat = 86400s`) matches LAW pin | 100% |
| **+P-04** | OK | L2 | Failed-map → "Use list mode" recovery transitions cleanly | 100% |
| **+P-05** | OK | L1 | KI-172 disclaimer banner ("Showing example shop locations") live | 100% |
| **+P-06** | OK | L1 | Focus ring via `box-shadow` on `:focus-visible` (WCAG-correct) | 95% |
| **+P-07** | OK | L4 | Realtime services `unsubscribe` runs cleanly (no leak — but churn) | 100% |
| **+P-08** | OK | n/a | Zero console errors during full session traversal | 95% |

---

## §2 Critical-tier evidence

### R-01 — Map state-desync (failed overlay over working map)

**Reproduction:** Sign in → land on `/`. After ~5s, the inline map slot in the dashboard "Smart Shop Discovery" panel displays the "Map failed to load — Retry map · Use list mode" overlay panel, **but** the basemap tiles, the NYC area zoom, the blue route polyline (Westchester → Atlanta region), and the "YOUR REPORT" card with the 2014 Mazda Mazda6 thumbnail all render normally underneath. Click "Retry map" → canvas briefly clears, basemap tiles re-load, route+card re-paint, **failed overlay still shows.** URL stays `http://localhost:5173/` throughout (no nav).

**Runtime probe:**
```
{ "mapPresent": true, "mapVisibility": "visible",
  "mapRect": { "w": 1166.467, "h": 640 },
  "canvasCount": 1, "canvasFirstSize": { "w": 2098, "h": 1151 },
  "overlayButtons": [ {"txt":"Retry map","visible":true},
                       {"txt":"Use list mode","visible":true} ] }
```

**Network confirms tile load success:** 15× CartoCDN voyager tiles 200 OK (zoom 5, NY/East-Coast bbox).

**Likely subsystem:** Engine A coverage-map preview wrapper. The `mapStatus` state machine has a path that sets `failed` but the success listener (MapLibre `'load'` event or shop-marker placement promise) doesn't propagate back to the React state. May be entangled with R-06 (KI-179 marker placement throwing → caught as map-fail → tiles still drew).

**Severity:** CRITICAL. Customer-visible. Erodes trust on first impression. Not an "expected unfinished" — the map IS working, the UI is lying.

**Recommended next step:** Trace the `mapStatus`/`mapState` reducer that controls the overlay; verify that EITHER (a) marker-placement failure is allowed to fail open without flipping mapStatus to `failed`, or (b) the basemap-success path explicitly clears `failed` regardless of marker outcome.

---

### R-02 — Realtime subscription churn (12 events in 4 seconds)

**Reproduction:** Reload `/`. Capture console with pattern `realtime|subscribing|unsub`.

**Console trace (timestamps 7:45:18.000 – 7:45:22.000):**
```
[18.x] 🔴 Subscribing to real-time bids for report: 48e97a54...
[18.x] 🔴 Subscribing to real-time bids for report: 6b14694e...
[18.x] 🔴 Subscribing to real-time bids for report: fc30160a...
[18.x] 📋 Subscribing to damage report UPDATEs
[18.x] 🔴 Unsubscribing from bids for report: 48e97a54...   ← CYCLE 1 ENDS
[18.x] 🔴 Subscription status for 48e97a54: CLOSED
... (same teardown for 6b14694e + fc30160a + reports)

[19.x] 🔴 Subscribing to real-time bids for report: 48e97a54...   ← CYCLE 2 STARTS
... (full subscribe set, then full teardown)

[22.x] 🔴 Unsubscribing from bids for report: 48e97a54...
[22.x] 🔴 Subscribing to real-time bids for report: 48e97a54...   ← CYCLE 3 STARTS
```

3 full cycles × 4 channel-types per report × 3 reports = ~36 raw realtime events on initial mount. Final state reaches stable subscription, but there's significant Supabase realtime gateway pressure during the warmup window.

**Same root cause as R-05:** the `/bids?reportId=...` GETs fire 6 times for 3 distinct reportIds (each reportId fetched twice). Both patterns suggest a `useEffect` whose dependency array contains a referentially-unstable object (likely the user-data object that itself updates 3× as cache→supabase→cache reconciles).

**Severity:** CRITICAL — RT consistency risk. Symptoms: increased Supabase realtime quota burn, brief subscription gaps where missed events would not be replayed, possible race between unsub-in-flight and resub.

**Recommended next step:** Audit dependency arrays on the realtime-subscribing `useEffect` — specifically `RealtimeBidService.ts:16` and `RealtimeReportService.ts:69`. Memoize the report-list source via `useMemo` on a STABLE key (e.g. `JSON.stringify(reportIds.sort())` or a Set membership signature) before passing to the subscription hook.

---

### R-03 — PII leak in localStorage key

**Probe:**
```js
{ "totalKeys": 40,
  "piiKeyCount": 1,
  "piiSample": ["bidondent_user:molalign5@gmail.com"],
  "namespaces": { "bidondent_": 33, "clerk_": 1, "bd:": 1,
                  "<no-prefix>": 2, "bidondent.": 3 } }
```

**Why it's a problem:** localStorage keys are accessible to any same-origin script (third-party widgets, browser extensions, debug consoles, error-reporters that snapshot storage). Encoding a user's email in the KEY (not just the value) means PII surfaces:
- in `Application → Storage → Local Storage` panel during any screen-share or remote-pair session
- in `JSON.stringify(localStorage)` dumps that some monitoring SDKs send up
- in any future analytics that hash key names
- when developers paste storage state into bug reports

**Contrast with sibling keys:** the `bidondent_nav_session_user_37l2aa5TqRLeLesZQIq5ibdXUul_*` family uses Clerk's stable userId (`user_37l2aa5TqRLeLesZQIq5ibdXUul`) — that's the correct shape. Only `bidondent_user:` regressed to the email shape.

**Severity:** CRITICAL — PN + privacy. Pattern likely lives in a single source line.

**Recommended next step:** Replace email-keyed lookup with userId-keyed (or `bidondent_user:current` + value-side `{ email, ... }`). One-time migration: read old key on init, write to new key, delete old. Worth a KI ticket in REF_KNOWN_ISSUES.md.

---

### R-04 — Account + Report tabs render BLANK content

**Reproduction:**
1. Click sidebar `Bids` → Smart Shop Map subview renders correctly with intelligence panels (`Connected Carriers 0`, `Damage Signals 9`, `Express Auto Body is your smartest current match`).
2. Click sidebar `Account` → header bar shows "Account" but **the entire main content area renders empty** (cool blue gradient backdrop, no panels, no forms, no copy).
3. Click sidebar `Report` → header bar shows "Report" but **same empty state.**
4. Console shows zero errors during these transitions. URL stays at `/` throughout.

**Probe (after Account click):**
```
{ "url": "http://localhost:5173/", "h1": "BidOnDent",
  "formCount": 1,    ← only the search bar
  "inputCount": 2 }  ← only the search bar
```

**Likely cause:** the `setCurrentTab('account')` reducer runs (sidebar shows the active state correctly with the bronze-tinted lamp), but the `currentTab === 'account'` switch in the layout returns `null` or an empty `Suspense` that never resolves. Could be feature-gated behind a flag the Clerk user hasn't satisfied. Could be a missing route definition. Cannot tell without reading source — flagged for investigation by Builder AI.

**Severity:** CRITICAL — fundamental Account flow broken. Customer can't reach their profile, settings, billing, or any account management.

**Cross-ref:** Pass 274 §5 finding ("12 viewModes + 7 tabs + 3 account types + 17 setCurrentTab reference sites + currentTab loose typing risk") — this empty-render symptom is exactly what loose typing + scattered setCurrentTab sites would produce.

---

## §3 High-tier evidence

### R-05 — Duplicate `/bids?reportId=` fetches

12 supabase requests captured, of which 6 are bids:
```
GET /functions/v1/server/bids?reportId=fc30160a... → 200
GET /functions/v1/server/bids?reportId=48e97a54... → 200
GET /functions/v1/server/bids?reportId=6b14694e... → 200
GET /functions/v1/server/bids?reportId=fc30160a... → 200   (dup)
GET /functions/v1/server/bids?reportId=48e97a54... → 200   (dup)
GET /functions/v1/server/bids?reportId=6b14694e... → 200   (dup)
```
Same root cause family as R-02.

### R-06 — KI-179/KI-169 warning storm

40+ warnings per page load for **one** shop ("Express Auto Body"). Three distinct distance values per cycle (737.2 / 770.4 / 803.6 mi from `shopMapRouting.ts`, 853.4 / 872.0 mi from `routeEngine.ts:46`) → strong signal that the same routing computation runs from multiple call sites against different origins, AND it re-runs every render cycle.

Origin in console: `(33.9511, -84.0855)` = **near Lawrenceville GA / Norcross GA** — confirmed by network: `geocode/search?q=Lawrenceville%2C+30044` returned during init. Destination `(40.9312, -73.8990)` = Westchester county NY. The user's location appears to default to GA; the shop is correctly in NY → distance is real but classified as "implausible" because it crosses the 100-mile band.

This isn't a "broken plausibility check" — the check is correct. The seed data for Express Auto Body is correct. The bug is **showing a 737-mile shop in an NY-metro user's recommended-shops feed in the first place**. Some upstream filter is matching on something other than geographic proximity.

### R-07 — Customer-visible 737mi + "<2 hours" inconsistency

Shop card in the recommended-shops grid (Express Auto Body, Yonkers NY):
```
4.8 (124)   737.2 mi   < 2 hours
```
At 60mph, 737.2 mi = 12.3 hours. The "< 2 hours" label is a **time-band bucket** computed independently of the displayed distance. They contradict each other on the same card. Both are visible to customers in the live demo.

### R-08 — Sidebar nav doesn't update URL

Verified via 3 sidebar clicks: URL stays `http://localhost:5173/` throughout. No `pushState`. No `hash`. Implications:
- No deep-linking
- Browser back/forward buttons skip tabs entirely
- Reload resets to default tab
- Cannot bookmark Account, Bids, or Report
- Server logs see only `/` traffic for everything

### R-09 — localStorage growth (no LRU)

22 `bidondent_nav_session_user_<id>_nav-<timestamp>-<n>` entries observed. None appear to be pruned over time — each navigation session adds another record. At ~1KB per entry × 22 entries ≈ 22KB right now, but on power users this will compound. localStorage cap is 5MB; soft-failure mode is silent `QuotaExceededError` on `setItem`.

---

## §4 Medium / drift findings

### R-10 — PII in console.log

Console line 54: `Updated phone from Clerk: 8454908919` from `useAppEffects.ts:33`.
Likely DEV-only intent but no visible `import.meta.env.DEV` guard on the log. Phone numbers and emails should never hit console even in dev — the convention in this repo (per Pass 19b sweep) is to gate ALL identity-bearing logs.

### R-11 — Cream inset color drift

LAW (LAW_PROJECT_RULES.md § Premium Gold Palette):
> gold-tinted cream insets use `rgba(252, 238-240, 204-208)`

Rendered (live computed):
```
linear-gradient(rgba(232, 238, 248, 0.9), rgba(247, 232, 194, 0.84))
linear-gradient(rgba(247, 232, 194, 0.9), rgba(232, 238, 248, 0.82))
```

`rgba(247, 232, 194)` is outside the documented `r=252, g=238-240, b=204-208` band by 5/6/10 units respectively. Not on the LAW's explicit-forbidden list (`rgba(254,248,220)` is forbidden — current value is darker). Likely an intentional newer canonical that drifted from documented value, OR unintentional drift. **Owner decision needed:** ratify `rgba(247,232,194)` as new canonical OR pull rendered toward documented `rgba(252, 238-240, 204-208)`.

### R-12 — Animation tempo + perf

- 10 active animations, longest cycle = `bdLiquidGoldFlow` at 28s — a beautiful ambient atmospheric primitive but heavy if not gated by `prefers-reduced-motion`.
- 147 elements with non-zero `transition-duration`, many on `transition-property: all` (the Tailwind default). `transition: all` re-evaluates ALL animatable properties on every change, which can produce subtle jank on large DOM. Best-practice: scope to `transform, opacity, color, background-color` explicitly.
- `prefers-reduced-motion` adherence not testable from Chrome MCP (no devtools-mode emulation surface). LAW requires this gate; recommend manual verification with system pref toggled.

### R-13 — Damage-report card shows cat photo

The "YOUR REPORT" preview card overlaid on the dashboard map shows a fluffy orange cat as the damage thumbnail for a "2014 Mazda Mazda6 — front · moderate" report. Almost certainly seeded test data, but it ships visibly to anyone signed in as `molalign5@gmail.com`. May leak to demo recordings or screen shares. Worth purging seed data before any external demo.

### R-14 — OpenStreetMap attribution link 12px tall

Touch-target minimum per WCAG AAA is 24×24. The OpenStreetMap attribution link in the bottom-right of the map widget measures 78×12. Practically uninteractive on mobile. Low priority — attribution is informational, not action — but flagged for the a11y register.

### R-15 — Mobile responsive testing gap

`mcp__Claude_in_Chrome__resize_window` accepts narrow widths but the actual `window.innerWidth` floor on this Chrome instance is 1658 (DPR 1.8). All `(max-width: 640px)` and `(max-width: 1024px)` media queries evaluate `false` regardless of resize call. Mobile responsive testing requires either:
- Chrome DevTools device-mode emulation (not exposed via MCP)
- Real mobile device at the live URL
- `Cmd+Option+R` style mode in Safari Responsive Design
This audit cannot validate mobile breakpoints from the sandbox. Flagged so future audit passes plan around it.

---

## §5 Verified-good (positive evidence)

These are the things the recent convergence/extraction-readiness work got RIGHT, validated at runtime — worth preserving as regression markers in any future refactor.

### +P-01 — Storage pointer-on-write / sign-on-read invariant
- `document.querySelectorAll('img').length === 18`, `storagePointerLeaks === 0`. Every rendered image resolves to either a CDN URL or a `https://wmdcnjgtsppftrofaqqa.supabase.co/storage/v1/object/sign/...?token=...` signed URL. **No `storage://` strings leaked to client.** Load-bearing fact #2 holds.

### +P-02 — Bronze trim + lamp colors match LAW exactly
Computed values from live DOM:
- Border: `rgba(140, 82, 22, 0.26)` ← exact LAW bronze trim `rgba(140, 82, 22)`
- Lamp halo: `rgba(196, 144, 65, 0.2)` ← exact LAW top/corner lamp `rgba(196, 144, 65)`
- No occurrences of forbidden previous-gen `rgba(220, 165, 90)` halo or `rgba(160, 95, 25)` trim found in the visible warm-tone scan.

### +P-03 — Signed URL TTL = 24h, matches LAW pin
JWT `iat = 1778370319, exp = 1778456719` → exactly 86400s = 24h. Matches the LAW maximum.

### +P-04 — Map-failed → list-mode recovery
Click "Use list mode" cleanly hides the failed map (`mapsHidden: true`, no failure overlay) and surfaces a richer fallback experience: ROLE PANEL with insurance-rank explanation, ROUTE PREVIEW with Fastest/Balanced toggle, full shop card grid. No data loss in the transition.

### +P-05 — KI-172 disclaimer banner live
"Showing example shop locations. Verified partner shops will appear once your account is connected." renders at the top of the Smart Shop Map subview. Pass 10 work is in production.

### +P-06 — Focus rings via `:focus-visible` + `box-shadow`
Tab-keyed traversal lands focus on `Start Navigation` button → computed `box-shadow: rgba(241, 245, 249, 0.95) 0px 0px 0px 2px, rgba(59, 130, 246, ...)` and `:focus-visible: true`. Inset white ring + outer blue glow — WCAG-compliant pattern. (A naive `.focus()`-based audit produces false positives because it doesn't trigger `:focus-visible`. Future audits should keyboard-tab through critical surfaces, not script-focus.)

### +P-07 — Realtime cleanup runs deterministically
Despite the churn (R-02), every `Subscribing to real-time bids` is followed by a corresponding `Unsubscribing` with `CLOSED` status confirmation. No orphaned subscriptions left dangling. The cleanup half of the `useEffect` returns is healthy — it's the dependency array driving the over-firing.

### +P-08 — Zero unhandled console errors
Across every flow exercised (initial load, retry-map, list-mode fallback, sidebar nav to Bids/Account/Report, multiple tab switches), zero `console.error` and zero unhandled promise rejections were captured. The 40+ warnings are all KI-179/KI-169 and self-classified — not crashes.

---

## §6 Cross-references

- **LAW_PROJECT_RULES.md § Light-Mode Surface Rule + § Premium Gold Palette** — R-11 cream inset drift sits inside this rule's scope.
- **LAW_PROJECT_RULES.md** load-bearing fact #2 (storage pointers) — verified at runtime per +P-01 / +P-03.
- **REF_KNOWN_ISSUES.md KI-165** (phantom loading pill) — R-01 may share root cause class (loading-overlay deadlock); recommend reopening or expanding KI-165 scope.
- **REF_KNOWN_ISSUES.md KI-172** (disclaimer banner) — verified resolved per +P-05.
- **REF_KNOWN_ISSUES.md KI-179** (implausible nav-engine routes) — verified active per R-06.
- **Pass 273 / Pass 274 platform docs** — R-08 (no URL routing) confirms route-taxonomy seam category #5; R-09 (localStorage growth) confirms persistence-namespace seam category #6; R-03 (PII in storage key) is a NEW sub-finding inside Pass 274 §3 ("UN-NAMESPACED" / 4-conventions inventory) that should be folded into a future inventory.
- **AI_LOCK Pass 275** — this audit lane stayed entirely outside the locked files (`AI_LOCK.md`, `docs/REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md`). Audit is observational; no source / locked-doc edits. Single new file written: this evidence doc.

---

## §7 Recommended action queue (advisory; no source edits made)

Ranked by risk × visibility:

1. **R-04 (Account/Report blank)** — investigate immediately; customer cannot reach Account flow. Likely a one-line tab-switch case statement returning `null` for two enums.
2. **R-03 (PII in storage key)** — single line fix + one-time migration; eliminates ongoing privacy exposure.
3. **R-01 (map state-desync)** — reducer audit; likely 5-10 line fix in the `mapStatus` consolidation path.
4. **R-02 + R-05 (realtime+fetch churn)** — single root cause; one `useMemo` on the report-id list signature should fix both.
5. **R-06 + R-07 (KI-179 storm + customer-visible inconsistency)** — split: (a) add log-rate limit so KI-179 fires once per shop+session not once per render; (b) decide whether time-band labels should hide when distance crosses plausibility band.
6. **R-08 (no URL routing)** — architectural; Builder AI's lane. Route taxonomy seam already inventoried in Pass 274 §5.
7. **R-09 (localStorage growth)** — add LRU eviction, cap at 10 sessions per user.
8. **R-10 (PII in console)** — add `import.meta.env.DEV &&` guard at `useAppEffects.ts:33`.
9. **R-11 (cream inset drift)** — owner ratification needed (no engineering change blocked on it).
10. **R-12 (transition perf)** — defer; instrument before changing.

None of these require LAW changes. None require schema migrations. None require auth/storage invariant modifications. All are within Phase 0–6 hardening scope.

---

## §8 Audit methodology (reusable)

For future runtime-integrity passes against this codebase:

- **Always reload with console + network tracking armed** — first navigation captures nothing because trackers attach AFTER load. Use a probe-call → reload pattern.
- **Treat reducible state-desync as critical** — UI claiming failure while the underlying engine works is uniquely trust-corrosive (vs. a clean failure with retry).
- **Probe localStorage namespacing every audit** — Pass 273-274 mapped 4 conventions; this audit found a 5th risk shape (PII in key suffix). Inventory drifts.
- **Don't trust `.focus()` for a11y audits** — keyboard-tab and inspect `:focus-visible` instead.
- **Resize-window MCP cannot test mobile** — flag explicitly so future audits don't claim mobile-validated when they haven't been.
- **Capture every image's `currentSrc`** — single best test for `storage://` invariant breach. Should be a one-liner in any future audit.
- **Time-window console grep for sub/unsub patterns** — fastest way to spot useEffect dependency-array bugs at runtime.

---

## §9 Standdown

Audit lane shipping this single evidence doc only — zero source changes, zero edits to any locked file or LAW-tier doc. AI_LOCK Active AI (Pass 275 doc lane) untouched and unblocked.

Builder AI's architecture / extraction-readiness lane proceeds independently; this audit does not authorize or block any builder action. Owner-decision points 1-4 (severity-CRT items R-01 through R-04) recommended for next builder pass once Pass 275 standdown lands.
