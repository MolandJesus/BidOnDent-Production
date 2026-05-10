# AUDIT — Runtime Integrity Pass 8 (2026-05-09)

**Pass:** 8 of N — Spatial cinematography + density saturation audit
**Trajectory:** symptom → mechanism → topology → continuity infrastructure → continuity-governance → continuity OS → spatial continuity OS → spatial cinematography
**Discipline:** observational only; zero source-file edits; zero LAW/locked-doc edits; one new evidence file (this one).
**Lock state:** AI_LOCK Pass 275 unchanged.
**Branch / commit:** `BidOnDent-Horizon-Beta` @ `3baeff18` (unchanged across all eight audit passes).
**Live system:** dev server `http://localhost:5173/`.

This pass executed the eight priority lanes the owner brief sequenced — spatial layout integrity, map continuity behavior, routing/navigation continuity, atmospheric/emotional UX, spatial failure-state behavior, visual hierarchy + density, mobile/constrained simulation, and runtime orchestration visual timing. Per discipline: report only when a new instability class emerges, a continuity doctrine fails, a continuity illusion collapses, or a major architectural boundary is discovered.

**Pass 8 surfaces ONE significant new finding** worth elevating: **continuity saturation is mechanically measurable** at 106 buttons / 1352 DOM elements on the Smart Shop Map view — the densest interactive surface yet measured in the repo. **R-01 failure UX is graceful, not catastrophic** — failure card preserves spatial trust by leaving the map visible behind. The atmospheric/emotional layer is intact even during state-desync.

---

## §1 Pass-8 findings table

| ID | Severity | Lane | Title | Confidence |
|---|---|---|---|---|
| **L8-01** | DR | 1 | Dashboard layout: 1370px main / 976px panels / page height ~2000px (2× viewport) | 100% |
| **L8-02** | DR | 7 | Mobile/constrained simulation untestable from sandbox (Chrome MCP resize_window is no-op below 1658×982) — Pass-1 R-15 confirmed durable | 100% |
| **C8-01** | DR | 2 | Smart Shop Map view emergence is 3-stage cinematic: chrome (~2s) → tiles+route (~6s) → cluster pin (~10s) | 95% |
| **C8-02** | OK | 2 | Map subsystem renders MapLibre via Canvas (not `<img>` tags); tile loading invisible to DOM probes | 100% |
| **N8-01** | OK | 3 | "Previous session restored" toast emerges quickly on Smart Shop Map cold load — continuity affordance fires reliably | 100% |
| **D8-01** | OK | 4 | Night theme realization: deep navy gradient + cyan route glow + soft cluster pin = high cinematic quality | 100% |
| **D8-02** | OK | 4 | Cream/champagne hero panel ("Search our NY partner network") provides emotional anchor against blue ambient | 100% |
| **F8-01** | OK | 5 | R-01 failure UX is graceful: small centered card, calm two-path messaging ("Retry map" / "Use list mode"), map remains visible behind preserving spatial trust | 100% |
| **H8-01** | DR | 6 | **CONTINUITY SATURATION measurable**: 106 buttons + 17 imgs + 19 headings + 1352 DOM elements on Smart Shop Map view | 100% |
| **H8-02** | DR | 6 | Only 2 `<section>` elements in 1352-DOM view — semantic structure thin; a11y screen-reader concern | 90% |
| **T8-01** | DR | 8 | "Previous session restored" toast appears at t≈2s on cold load (timing arrived via Pass 6 B6-01 + Pass 8 verification) | 100% |
| **T8-02** | UTI | 8 | The 4-second gap between "chrome ready" and "tiles loaded" reads as loading rather than intentional pacing | 80% |

**No new unstable class emerged. No continuity doctrine disproven. No major architectural boundary crossed.** Per Pass-7+ brief threshold, Pass 8 stays below report-threshold individually but synthesizes the cumulative observational map.

---

## §2 Lane 1+2 — Spatial layout integrity + map continuity

### Dashboard baseline

```
viewport:        1658 × 982 (DPR 1.8)
sidebar:          288 × 982
header:           1346 × 81  (top bar)
main:            1370 × 889  at x=288, y=93
content panels:   976 × varies, centered at x=485
total page height: ~2000 px (2× viewport — requires scroll)

Top-to-bottom panel stack:
  1. Repair overview hero       147 px
  2. Quick Actions              267 px
  3. Repair activity (3 reports) 608 px
  4. Coverage map preview       686 px (Engine C)
  5. Smart Map Tools panel      220 px
  6. Nearby Matches             214 px
  ...
```

**Layout reading:** the dashboard is content-rich and information-dense. The map preview sits at position 4 — below 3 substantial content panels. To reach the map preview the user must scroll past the welcome hero, quick actions, and reports list. **Map is not a primary surface on the dashboard** — it's a secondary discovery affordance.

This is consistent with the modal-less, continuity-bias architecture (Pass 6 §3): the system prefers giving users context (welcome, recent activity) before prompting spatial action.

### Smart Shop Map (fullscreen) layout

```
Top section:
  Disclaimer banner         (KI-172, persistent)
  View title row            (Back btn / SMART SHOP MATCHING / Smart Shop Map / 15 shops)
  Discovery panel           (search field + ORIGIN + Hybrid|Map|List + Smart Match + 4.5+ + Dark)
  Origin chips row          (My Location + 4 cities)
  + Save button

Map area (1166 × 640, aspect 1.82, canvas 2098 × 1151 at DPR 1.8):
  "Search this area" pill   (top-center)
  Route line                (NY → south, blue polyline)
  "15" cluster pin          (top-right at NY metro)
  ROUTE box                 (collapsed bottom-left)
  Map controls              (zoom +/-, locate, attribution bottom-right)

Below map:
  "Focused on Express Auto Body. The map stays live..." messaging
  My Location chip + Focused-shop chip
  Preview directory disclaimer
  RECOMMENDED SHOPS / 15 results / FOCUSED SHOP badge
  3-column shop card grid (5 rows × 3 cards = 15 cards)
```

### Map continuity behavior (C8-01, C8-02)

3-stage emergence captured:
- **t≈2s**: page chrome ready (sidebar + header + view title + search panel structure)
- **t≈6s**: map area populated (tiles, route line)
- **t≈10s**: cluster pin "15" appears

The 4-second gap between chrome-ready and tiles-loaded is the longest hesitation. From a user trust perspective, this reads as "loading" rather than "intentional cinematic pacing." Production build measurement (host-side) would confirm whether dev-mode lazy modules are amplifying this — if production collapses to <1s, the perceived experience would be cinematic. Otherwise it's a loading gap.

**MapLibre uses Canvas rendering** (C8-02), not `<img>` tag tiles. This means DOM probes for tile images return 0 even when tiles are visible. Methodology note: future audits should probe `canvas.toDataURL().length > 1000` rather than `<img>` count to detect map render state.

---

## §3 Lane 4 — Atmospheric + emotional UX (cinematic systems)

### Visual quality reading

The product's visual identity is genuinely premium and emotionally coherent:

- **Cream/champagne hero panels** ("Welcome back, Molalign" / "Search our NY partner network") read as warm, calm, automotive-finish. They function as emotional anchors against the cool blue ambient.
- **Blue ambient panels** (Quick Actions, Repair Activity, Smart Map Tools) provide cool, calm operational tone. Don't compete with the warm hero.
- **Glass/translucent treatment** on cards and chips reads as premium rather than cluttered.
- **Bronze trim + lamp lighting** is restrained — never overpowers the cool dominant. Verified at LAW-locked values per Pass 1 +P-02.
- **Night theme** (D8-01) is dramatic without being game-like. The deep navy + cyan route glow + soft cluster pin reads as "spatial trust." High cinematic quality.

The product's emotional tone is **calm-confident-premium** — matches the LAW intent and the "calm/premium/map-first identity" doctrine.

### Specific atmospheric findings

**D8-01 — Night theme cinematic quality:** A user scrolling to the map and seeing the night-tile rendering experiences a moment of "this is well-built." The route line cyan glow against deep navy reads as automotive-grade UI. Premium feel intact.

**D8-02 — Hero/ambient color contrast:** The cream hero panel against the blue page ambient creates a clear visual hierarchy without being jarring. Eye knows where to look first (warm = primary CTA region).

### Where atmospheric continuity might wobble

- **Smart Shop Map disclaimer banner** ("Showing example shop locations") is yellow/cream — sits awkwardly in the continuum between cream hero and blue ambient. Reads as a third color zone. May fragment the dominant-warm + dominant-cool palette.
- **3-stage emergence cinematography** (T8-02) is technically pacing but emotionally reads as loading. The system's atmospheric work is good; the timing isn't yet selling it as intentional.
- **Failure overlay readability** (F8-01) — under night theme, the dark glass treatment of the failure card maintains the premium feel even during error. Verified-good.

---

## §4 Lane 5 — Spatial failure-state behavior (R-01 trust impact)

### F8-01 — Failure UX preserves spatial trust

The R-01 "Map failed to load" overlay treatment, observed under both light and night themes:

```
Failure card layout:
  Centered 200 × 110 pixel card on the map area
  Dark glass / light glass treatment (theme-adaptive)
  Title:        "Map failed to load"
  Subtitle:     "Your shop list is still available. Retry the map or continue in list mode."
  Two buttons:  [Retry map]  [Use list mode]
  
The map BEHIND the overlay remains visible:
  Tiles still rendered
  Route line still drawn
  Cluster pin still placed
```

**Emotional reading:** the failure UX is **graceful, not catastrophic**. The card is small and centered, not a full-viewport blocker. The message is calm (no exclamation, no red, no scolding language). The two paths offer recovery without forcing modal interruption. The map remains visible underneath, preserving the user's spatial trust ("the map is THERE, just having issues").

**This is one of the better failure-UX patterns in the audit.** The product's modal-less continuity-bias architecture (Pass 6) extends to failure states: even when something is wrong, the system preserves the user's visual context.

The IRONY: R-01 is a **state-desync** — the map is technically working (tiles + route + cluster all rendered), the reducer just incorrectly reports failure. So users see the failure card but the map underneath proves the system DID succeed. The graceful UX accidentally compensates for the underlying bug — users are unlikely to complain because "Use list mode" works fine and the map is visible enough to feel trusted.

This is **continuity-as-architecture protecting against runtime instability**. The system's emotional resilience absorbs operational hiccups.

### Trust signaling intact

Per Pass 7 §6 messaging: "The map stays live while the strongest recommended shops stay below for easy comparison." This product-side framing makes the R-01 condition feel like "expected" continuity preservation rather than "broken" failure.

---

## §5 Lane 6 — Visual hierarchy + density (continuity saturation)

### H8-01 — Density measurement

Smart Shop Map view interactive density:

```
Total DOM elements:        1,352
Total <button> elements:     106
Total <img> elements:         17
Total <h1>/<h2>/<h3>:         19
Total <section> elements:      2
Inline-styled motion-managed: ~8 (Pass 6 D6-01)
```

**106 buttons on a single view** is exceptional. For comparison, a typical SaaS dashboard surface has 20–40 buttons. A Stripe-style payment dashboard might hit 50–60. **Smart Shop Map at 106 approaches what I'd call "continuity saturation"** — the point at which adding more affordances stops increasing utility and starts increasing emotional noise.

The 106 break down approximately:
- Sidebar nav (4) + bottom nav copy (4)
- Top chrome (search bar, bell, avatar) (3)
- Search panel: search btn, ORIGIN btn, Hybrid/Map/List × 3, Smart Match select, 4.5+ btn, Dark btn, 5 location chips, Save (15)
- Map controls: Search this area, +, –, Locate, Reset North (5)
- "Focused on" chip cluster (My Location + Focused-shop) (2)
- Recommended shops 15 cards × 4 buttons each (View fit, Request Estimate, Save for bids, Start Navigation) = 60
- Plus shadow buttons in collapsed accordion sections, dropdown options, etc.

The recommendation cards alone account for ~60 buttons. **Each shop card has 4 CTAs** — that's the multiplier driving saturation. From a cognitive load perspective, asking the user to evaluate 4 actions × 15 shops = 60 micro-decisions just on the shop list.

### H8-02 — Semantic structure thin

Only **2 `<section>` elements** in 1352 DOM elements means the markup is heavily DIV-based. Screen reader users (per WCAG + Pass 1 a11y findings) will navigate by heading structure (19 headings — better) but cannot use section-jump shortcuts effectively.

This is a low-priority a11y gap — flagged for awareness, not action.

### Where saturation matters

- **Mobile** (untestable from sandbox per L8-02): 106 touch targets in a scrolling viewport will produce frequent accidental taps. Especially the 60 shop-card CTAs all sized for desktop.
- **Reduced-motion users**: per Pass 6 E-04, reduce-motion strips the staggered-emergence courtesy. The 106-affordance density landing all at once visually instead of pacing-in could feel overwhelming.
- **Color-blind users**: with so many warm/cool/glass treatments competing, the hierarchy depends heavily on color. A mode that flattens treatment would make it hard to identify primary vs. secondary actions.

### What's working

The system avoids **outright clutter** despite the density via:
- Glass/blur treatments that visually layer rather than crowd
- Generous padding (16–20px on most panels)
- Cool ambient that lets warm anchors pop
- Cards with hero images that establish visual rhythm
- Step-aware affordance grouping (4 actions per card, not 12)

The density is high but **organized**. It's at the threshold; not yet over.

---

## §6 Lane 7 — Mobile / constrained-layout simulation (LIMITATION)

**L8-02 — confirmed:** Chrome MCP `resize_window` is a no-op below 1658×982 in this user's environment. Verified across:
- 2560 × 600 (ultrawide short-height): innerWidth stayed 1658
- 1024 × 768 (laptop tablet-ish): innerWidth stayed 1658
- 390 × 844 (iPhone Pro): per Pass 1 R-15, no effect

**Mobile responsive testing remains structurally untestable from sandbox.** Recommendations from earlier passes hold:
- Chrome DevTools device-mode emulation (host-side, MCP can't access)
- Real mobile device at the live URL
- Production build + responsive testing service

This is an **environmental constraint**, not a finding. Pass 1 R-15 documented it; Pass 8 confirms its persistence.

---

## §7 Lane 8 — Runtime orchestration visual timing (cinematic vs broken)

### T8-01 / T8-02 — Cinematic timing analysis

3-stage Smart Shop Map emergence:
- **0–2s**: page chrome arrives (sidebar nav, header, view title, search panel structure)
- **2–6s**: tiles + route line emerge (4-second gap — perceptible)
- **6–10s**: cluster pin appears (4-second gap — perceptible but smaller)

**Threshold reading:**
- ≤200ms: feels instant
- 200ms–1s: feels responsive  
- 1–3s: perceptible delay, ambiguous (could be intentional pacing)
- 3–10s: feels like loading
- >10s: feels broken

The Smart Shop Map's 4-second chrome→tiles gap and 4-second tiles→cluster gap both fall in the "loading" band. **This timing in dev-mode is loading, not cinematic pacing.**

**HOWEVER, this is dev-mode-amplified per Pass 4 PROD-* / Pass 6 §3.** Production build (`vite preview` host-side, untested) might collapse to <1s per stage, in which case the same orchestration would read as intentional cinematic emergence.

**The system's intent appears to be cinematic.** The infrastructure exists (framer-motion stagger, atmospheric layers, "Previous session restored" toast). The dev-mode timing prevents the intent from being realized at audit time. **Until production runtime is measured, the cinematic-vs-loading question stays open.**

### T8-02 trust impact

Per the owner Pass-8 brief: "whether the user emotionally interprets delays as cinematic pacing or broken rendering" is critical.

In dev mode currently: the 4-second gaps are interpreted as loading. The "Previous session restored" toast at t≈2s helps signal liveness, which mitigates the trust risk somewhat. But the chrome-vs-content gap is large enough that a user not expecting it would assume the page is hung.

This is the same family as A4-02 / F6-01 mount-orchestration delay. **Production measurement is the gate** before classifying severity.

---

## §8 Cumulative across 8 passes

- ~135 distinct findings
- **41 verified-good runtime invariants** (regression baseline unchanged from Pass 7 — Pass 8 is mostly observational)
- **31 continuity-preservation mechanisms** inventoried (unchanged — Pass 8 confirms density without adding new mechanisms)
- 8 namespace families × 5 ownership categories
- 3 motion subsystems mapped
- 3 multi-tab continuity models
- 3 identity systems
- 14 framework predictions confirmed (Pass 8 reinforces several but adds no new prediction confirmations)
- A4-02 / F6-01 resolved as 2-layer condition
- Modal-less architecture identified as deliberate design constraint
- 2D navigation state (`currentTab × viewMode`) characterized
- **Smart Shop Map quantified at 106 buttons / 1352 DOM elements / 2 sections — densest interactive surface measured in repo**
- R-01 failure UX classified as graceful (preserves spatial trust by design)
- Cinematic timing identified as 3-stage but dev-mode-amplified

### Continuity-saturation observation

The density measurement (H8-01) introduces a NEW dimension to continuity-OS reverse-engineering: **continuity infrastructure has a density ceiling beyond which adding more mechanisms reduces clarity rather than increasing it.** The Smart Shop Map view is at or near that ceiling. The product hasn't crossed it (yet) — the glass treatments and panel organization keep it organized — but it's close enough that any future shop-card affordance addition would push it over.

Per discipline: NOT promoting "Continuity Saturation" to doctrine yet. Need evidence that any other view in the system approaches similar density. Currently only the Smart Shop Map demonstrates this density — every other view (Dashboard, Account, Bids, Report wizard) measures 200–500 DOM elements with 20–50 buttons. The saturation might be a Smart-Shop-Map-specific phenomenon, not a systemic doctrine concern.

---

## §9 Per owner-brief reporting threshold

The Pass-8 brief asks the audit lane to "Continue uninterrupted observational acquisition" and "Do NOT report unless: a new instability class emerges, a preservation doctrine fails, a continuity illusion collapses, or a major architectural boundary is discovered."

### Pass 8 evaluation

- **New instability class?** No. H8-01 density saturation is a NEW MEASUREMENT of an existing concern (visual hierarchy density was already inventoried in Pass 7 §3). It's not a new class of failure.
- **Continuity doctrine failed?** No. F8-01 confirms the failure-UX treatment is graceful — the modal-less continuity-bias doctrine is intact even at failure states.
- **Continuity illusion collapsed?** No. The night-theme cinematic quality (D8-01) and "Previous session restored" toast (N8-01) and "The map stays live" messaging (Pass 7 M7-19) all reinforce the continuity-as-architecture intent.
- **Major architectural boundary discovered?** Partial. H8-01 establishes that the system has a **measurable density saturation point** (~100 affordances), which is a soft architectural boundary worth tracking. But it's not a hard boundary that would alter extraction-era planning.

**Per discipline threshold: Pass 8 stays below report-threshold.** Single evidence doc shipped (this one). No urgent escalation.

---

## §10 Recommended Pass 9 priorities

Per owner brief: continue observational discipline; acquire continuity mechanics first.

Candidate lanes for Pass 9:
- **Touch ergonomics on real mobile device** (host-side or real device) — would close the Pass 1 R-15 / Pass 8 L8-02 gap.
- **Production build cinematic timing measurement** — would resolve T8-02 dev-vs-prod ambiguity.
- **Camera persistence audit** — when user pans the map, scrolls away, scrolls back, does view state restore?
- **Marker reordering during realtime updates** — when bids stream in, does the cluster animate or re-render?
- **Search-this-area orchestration race** — user pans, clicks Search-this-area, pans again before fetch returns: what happens?
- **Authorized auth-flip test** (Pass 5 §5 — 8 questions still pending owner authorization).

---

## §11 Standdown

Pass 8 ships this single evidence doc. Zero source edits. Zero edits to AI_LOCK or any locked doc. AI_LOCK Pass 275 unchanged.

The runtime audit lane has now produced a comprehensive operational topology of the continuity OS:
- 8 passes
- ~135 distinct findings
- 41 verified-good runtime invariants
- 31 continuity-preservation mechanisms
- 14 framework predictions confirmed
- 7 truly-unstable items in cumulative action queue
- All ~10 architectural boundaries (modal-less, 2D nav state, app-scoped persistence, vendor-managed auth, framer-motion JS orchestration, CSS toast subsystem, etc.) characterized

The system is materially understood at mechanism level. The remaining unknowns require either owner-authorized testing (auth flip, mobile device) or host-side execution (production build timing). The runtime lane has reached operational maturity sufficient to function as the regression-detection baseline for the extraction era.

Per owner Pass-7+ direction: continuing autonomous observational acquisition. Reporting only when threshold criteria are crossed.
