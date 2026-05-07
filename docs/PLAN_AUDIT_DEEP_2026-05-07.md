# Deep Audit Plan for Chrome Browser AI — 2026-05-07 (Pass 9 dispatch)

**Authority:** Audit AI has Chrome extension + Supabase MCP (full dashboard) + GitHub browser tab (signed in) + safe-fix authority for SQL data corrections / cleanup DDL / Studio toggles. Does NOT have source code edit access. Does NOT have `git push`. Owner-authorized "full authority" for in-scope work.

**Scope of this plan:** what 8 prior audit passes did NOT deeply test. The site is far more built-out than early audits assumed (140+ commits queued, Phases 1-3 + most of Phase 6 of master plan SHIPPED, KI-138 backend CLOSED, KI-116/117/118/126/128/134/135/136/137/140/141/142/143/144/145/147/148/150/153 either RESOLVED or partial). This plan targets the genuinely-uncovered surfaces.

**Token budget:** owner has authorized exhaustive scope. Multi-session is fine. Keep individual reports under ~3000 words; produce a final synthesis at the end.

**Output format:** structured report following the section IDs below. Multiple screenshots per surface. Network captures + console captures where relevant. Tables wherever possible.

---

## §1 — End-to-end role flows (NEW; deeper than prior surface walks)

Prior audits walked surfaces. This section walks **complete user journeys** end-to-end.

### §1.1 Customer journey — submit damage report → receive bids → accept

1. Sign in as customer.
2. Click "New Repair Request" from Dashboard.
3. **Step 1** (vehicle): use a saved vehicle via "Use" button. Verify Continue activates. Capture screenshot.
4. **Step 2** (damage zone): pick "Front". Continue.
5. **Step 3** (location): enter ZIP. Verify empty-state overflow (KI-126) absent. Continue.
6. **Step 4** (photos): in Photo Tips modal, click "Got it" (NOT "Skip" — that's KI-128 fixed but worth verifying). Upload one small test image (browser file picker; if not feasible, verify Skip-for-now now advances to Step 4 empty per KI-128 fix).
7. **Step 5** (review): the unverified surface. Capture EVERY field rendered. Specifically:
   - Vehicle string — does it say "Toyota" (post-KI-101 fix) or "Toyoto"?
   - Make/Model/Year derived from saved vehicle Use button (KI-125 risk)?
   - Location ZIP echoed correctly?
   - Photo thumbnails rendered?
   - Submit button enabled state.
8. Submit. Capture network calls (edge function path? REST? Photo upload sequence?).
9. Land where? Confirmation screen, Bids tab, Dashboard? Capture.
10. Open Bids tab. Find the just-submitted report. Capture bid card empty state if no bids yet.
11. (If test bid data exists) Accept a bid. Capture flow + confirmation + post-accept state.

**Output for §1.1:** screenshots at every step, network log per step, final answer to "does Step 5 show 'Toyota' or 'Toyoto'?", any new bugs.

### §1.2 Shop journey — receive incoming report → submit bid → accept job → complete

1. Sign in as shop role (if reachable; if not, document the routing).
2. Walk: Shop Dashboard → Active Jobs → Estimate Inbox → submit a bid.
3. After submit, verify bid appears in shop's outgoing bids.
4. Cross-tab test: open customer Tab A + shop Tab B. Shop submits bid → customer sees bid in realtime?
5. After customer accepts: shop Active Jobs updates? Realtime?
6. Mark job complete flow.

**Output:** shop dashboard state at each phase, realtime cross-tab evidence, any KI-056/057 regressions surfaced.

### §1.3 Insurer journey — view claims → approve/deny

1. Sign in as insurer.
2. Walk: Insurer Dashboard → Claims → click a claim → approve/deny.
3. Capture claim detail surface, approval modal, post-approval state.
4. Verify what data is being patched (Network tab — `damage_reports` PATCH expected per KI-030).

**Output:** insurer flow surfaces, comparative depth vs customer/shop journeys, KI-030 confirmation (still stub-grade).

### §1.4 Sign-up flow — end-to-end

1. Sign out fully (verify KI-152 silent re-auth still happens — cookies cleared but `__clerk_db_jwt` persists?).
2. Click "Get Started" from landing.
3. Walk full Clerk sign-up surface — email entry, password, verification email, etc.
4. Capture every screen.
5. After successful sign-up → land where? Dashboard? Onboarding? Capture.
6. **DO NOT actually create an account if test seed users exist** — just walk surface to first send-email step.

**Output:** sign-up flow surface inventory + Clerk integration sanity.

### §1.5 Forgot password flow

1. From Login screen, click "Forgot password?".
2. Walk through entire reset flow.
3. Don't actually reset — capture surface inventory only.

---

## §2 — Active turn-by-turn navigation (BIG GAP from prior audits)

Audit AI prior passes confirmed nav engine code (detectDeviation, voiceGuidance, useNavigationVoiceAlerts) is wired. KI-116 fix (Pass 61) gated `intelligence.evaluate()` on `session.status === 'active'`. **This section verifies the gate works correctly when navigation IS active.**

### §2.1 Pre-active state — gate verification

1. Land on dashboard cold (cleared localStorage if needed).
2. Verify NO 737mi banner. Verify NO "Off route" pill. Verify NO speed-limit error toast.
3. Open Smart Shop Map. Verify NO deviation banner.
4. Pick a destination shop. Verify NO deviation banner during planning state.
5. Verify the gate holds.

### §2.2 Active state — start navigation

1. From planning state, click "Start" / "Begin Navigation" (whatever the CTA is).
2. Capture state transition: planning → active.
3. Verify maneuver card appears.
4. Verify route polyline drawn on map.
5. Verify ETA + remaining distance shown.

### §2.3 Simulated GPS movement (DevTools geolocation override)

DevTools → ⋮ → More tools → Sensors → Location: override.

1. **Set GPS to origin point of route.** Verify NO deviation banner (user is on route).
2. **Set GPS to a point along the route polyline.** Verify NO deviation banner. Verify maneuver advances if past first maneuver point.
3. **Set GPS to a point ~50m off the route.** Verify deviation engine fires:
   - `useNavigationIntelligence.evaluate()` produces an `off_route` event
   - NavigationDeviationPrompt UI appears
   - No double-fire (KI-148 regression test — was fixed Pass 82)
4. **Set GPS to a point ~1mi off the route.** Verify HIGH-severity off_route event.
5. **Set GPS speed to 0 mph.** Verify "stopped" detection (low severity).
6. **Set GPS back to origin.** Verify deviation banner clears.
7. **Set GPS to destination.** Verify arrival flow:
   - Arrival toast
   - Maneuver card transitions to arrival state
   - Auto-end timer fires (per `useNavigationLifecycleEffects:154`)

**Output for §2.3:** screenshot per state transition, console log per deviation event, network log per OSRM call.

### §2.4 Voice TTS verification (browser audio enabled)

1. With `voiceMode: full`, click "Preview voice" in NavigationVoiceControlsSheet. Verify speech audible.
2. Set `voiceMode: alerts-only`. Verify only deviation/reroute cues fire (test by triggering off-route in §2.3).
3. Set `voiceMode: muted`. Verify no speech.
4. Test voice persona switching (`british-smooth` etc.) — verify the voice changes.
5. Test that voice cues fire DURING simulated nav (not just on Preview button).

**Critical question:** does voice fire on step transitions? Per audit AI pass 6 §B finding, `useNavigationRoutePreview.ts:268-272` should call `speakNavigationInstruction` when `stepDistanceMeters ≤ adaptiveSpeakThreshold`. Verify this fires by simulating GPS movement past a maneuver point.

### §2.5 Reroute lifecycle end-to-end

1. Trigger off-route via §2.3 simulation.
2. Capture NavigationDeviationPrompt UI.
3. Click "Review route" (or equivalent CTA).
4. Verify lifecycle: eligible → pending. Network: new OSRM call?
5. After OSRM resolves: pending → completed. New routePreview?
6. After cooldown: completed → idle. Cooldown timer ~90s per `REROUTE_COOLDOWN_MS`.
7. Test auto-reroute path (high-severity off_route + autoRerouteEnabled): does it skip the prompt and auto-fire?

**Output for §2.5:** state transitions captured, OSRM network calls counted, KI-054 (reroute confirm-timing fix) regression test.

### §2.6 End / cancel navigation

1. From active state, click "End navigation" / "Cancel" / equivalent.
2. Verify session resets to idle.
3. Verify no stale state in localStorage post-end.
4. Verify deviation engine stops firing.

---

## §3 — Map program full-screen + identity audit

### §3.1 Tile mode cycling at fullscreen — KI-122 verification

Note: code shows 3 modes — `roadmap`/`night`/`satellite` (no "Light"). Audit AI's earlier "Light tile mode broken" may have been an older labeling.

1. Open Smart Shop Map → fullscreen.
2. Cycle tile-mode segmented control: roadmap → night → satellite → roadmap.
3. For each: verify CARTO Voyager (roadmap) / CARTO Dark (night) / Esri Satellite (satellite) tiles load.
4. Capture screenshot at each mode.
5. If any mode shows blank canvas: capture Network tab — what tile URLs are firing? CSP block? 503? Just slow?

### §3.2 Marker variants — verify current state vs Phase 7 #1 spec

Audit AI pass 2 spec item: "Distinct origin / destination / waypoint pins."

1. With a route active, identify visible marker types on the map:
   - Origin pin
   - Destination pin
   - Selected shop
   - Saved places
   - Search results
   - Reports
2. For each: capture pin appearance (color, shape, glyph).
3. Are they visually distinct from each other? Or all blue dots?
4. Output a marker-variant inventory: type × visual treatment × distinguishability score.

### §3.3 Marker click → camera ease — Phase 7 #16 verification

1. Click a shop pin on the map.
2. Capture: does the camera EASE to the pin (smooth transition) or jump?
3. Does the pin get pushed to upper-third of viewport so the bottom sheet doesn't cover it?
4. Does the click trigger a visible pulse animation on the marker (Phase 7 #17)?

### §3.4 Search-as-you-type — Phase 7 #10 verification

1. In Smart Shop Map search field, start typing an address.
2. Does autocomplete appear (Nominatim-backed)?
3. Latency? Quality of suggestions?
4. Capture network calls — `/geocode/search` edge route hit?

### §3.5 Compass / north indicator — verify shop directory guidance mode

1. Enter shop directory map.
2. Trigger guidance mode (start nav).
3. Per code: `showCompass={navigationMode === "guidance"}` — compass should appear.
4. Capture: visible? Click-to-reset works? Rotates with bearing?

### §3.6 Map atmosphere identity — visual canon comparison

For each map surface (landing inline coverage, dashboard inline, Smart Shop Map, Coverage Dialog, immersive shop directory):

1. Light mode screenshot.
2. Dark mode screenshot.
3. Compare against MOLANDJESUS_DESIGN_DECISIONS.md visual principles:
   - Light: cool blue canvas + warm cream cards + bronze trim + premium gold lamp
   - Dark: deep royal navy + bronze rim + cool blue ring + 2-layer black drop + bronze halo + cool blue border + gradient body + ceiling lamp radial (8-criteria depth bar)
4. Score each surface: Pass / Partial / Fail per criterion.
5. Surface any visual canon regressions.

### §3.7 KI-067 verification — mobile coverage map sheet vs map dominance

Per audit AI pass 6 §F: at fullscreen mobile, bottom nav remained accessible + legend auto-decluttered. **At NON-fullscreen mobile, was sheet still dominating the map?** Verify and re-score KI-067.

1. Mobile viewport (DevTools 390×844 iPhone 12 Pro emulation).
2. Open Coverage Map Dialog.
3. Capture: how much of viewport is map vs sheet at default state?
4. Verify peek-state behavior (if implemented post-Pass-78).

---

## §4 — Performance deep dive (production build)

### §4.1 Production build + Lighthouse — gates Phase 4 of master plan

This is **owner-action OR audit-AI-action via terminal access**. Audit AI's prior passes established this requires:
- Owner: `npm run build && npm run preview` then DevTools → Lighthouse panel
- OR audit AI: navigates to `localhost:4173` after owner runs preview

For each surface (Landing, Dashboard, Bids, Account, Smart Shop Map, Coverage Dialog):
1. Lighthouse Mobile (default config) — capture full report
2. Lighthouse Desktop (default config) — capture full report
3. Lighthouse Accessibility — capture full report

**Output:** Surface × profile × {Performance, Accessibility, Best Practices, SEO} score table + Web Vitals (FCP, LCP, CLS, TBT, INP). Filter contrast warnings against premium glass surfaces (Lighthouse can't compute layered transparency contrast — flag only if genuinely unreadable).

### §4.2 Tile network behavior — KI-053 closure

1. Dashboard cold load with Network tab open.
2. Filter: `cartocdn.com`, `arcgisonline.com`, `tile.openstreetmap.org`.
3. Group by status: 200 / 503 / cancelled.
4. For 503s: capture geographic span (decode tile coords → lat/lng).
5. **After Pass 73 fitBounds scope fix (already shipped) — verify 503 storm is gone.**

### §4.3 Realtime channel load test

1. Open Bids tab + leave open 5 minutes.
2. Capture WebSocket frames in Network tab.
3. Count: subscribe events, heartbeats, reconnects.
4. Per KI-056/057 fix: should be 1 stable subscribe per channel (not 4 cycles in 4 seconds).
5. If StrictMode-only cycling persists (dev artifact), document.

### §4.4 Memory + animation budget at idle

1. Open Performance tab.
2. Record 10s of idle dashboard.
3. JS heap size? GC frequency?
4. Active animations count via `document.getAnimations()` — Phase 6 entrance loop should leave most animations idle once entered.

---

## §5 — Accessibility deep dive

### §5.1 Full keyboard tab traversal per surface

For Landing, Dashboard, Bids, Account, Smart Shop Map, Coverage Dialog, Settings Modal, Voice Controls panel, Navigation Settings panel, Photo Tips modal:

1. Press Tab from cold load until focus cycles back.
2. Document EVERY focus position: index, element label, focus ring (Y/N), Enter behavior, Esc behavior.
3. Identify keyboard traps.
4. Identify unreachable interactive elements.
5. Verify Pass 68 skip-link works (first Tab from cold should focus skip-link, Enter should scroll to main content).

### §5.2 Screen reader audit (VoiceOver on macOS)

If audit AI can run VoiceOver via DevTools Accessibility tree inspection or via Mac VoiceOver:

1. Activate VO. Walk Dashboard.
2. Verify: every button has an accessible name, every form field labeled, every status announces via aria-live.
3. Identify any unlabeled icon buttons (Pass 7 added 22 aria-labels per KI-115; verify coverage holds).

### §5.3 Color contrast — Lighthouse + visual

Per surface:
1. Lighthouse Accessibility flagged contrast warnings.
2. For each: visually verify if the text is genuinely hard to read on top of the actual background (translucent glass surfaces are mostly false positives).
3. Real failures: flag.

### §5.4 Reduced motion sweep — verification

1. DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`.
2. Reload each surface.
3. Verify ALL animations stop/become instant:
   - Landing hero atmosphere drift
   - Glass shimmer
   - Toast slide-in
   - Modal fade-in
   - Headline carousel (KI-131 — should pause)
   - Pin pulse (`bd-pin-pulse` — already has reduce-guards at theme.css:4574/4646)
   - All Pass 151-169 entrance animations (`motion-reduce:animate-none`)
4. List any animations that still fire under reduce. Pass 56 + KI-139 work should keep gap = 0.

### §5.5 Touch targets at 375 mobile

DevTools device emulation iPhone SE 375×667 OR iPhone 12 Pro 390×844.

For every interactive element on each surface:
1. Measure hit-box via DevTools Elements > Computed > Box model.
2. Min 44×44 CSS pixels.
3. Flag any below threshold.

KI-136 known offenders: search input (260×34), BidOnDent logo button (148×40). Verify Pass 71 (if shipped) raised both to ≥44.

---

## §6 — Realtime + cross-tab + cross-role

### §6.1 Cross-tab theme persistence — verification

1. Tab A: toggle theme to Light. Tab B: does it sync?
2. Tab A: toggle Dark. Tab B: does it sync?
3. Pass 6 confirmed StorageEvent pattern works for theme.

### §6.2 Cross-tab sign-out propagation — verification

Audit AI pass 6 §D was DEFERRED. Verify now:
1. Tab A + Tab B both signed in.
2. Tab A: Sign Out.
3. Tab B: does it detect sign-out automatically? Or zombie?
4. If zombie: how long until next interaction redirects to landing?

### §6.3 Cross-role realtime — customer accepts bid

1. Tab A: customer signed in, viewing report with pending bids.
2. Tab B: shop signed in, viewing outgoing bids.
3. Tab A: customer accepts a bid.
4. Tab B: does the shop's bid card update in real-time? Or only on refresh?

### §6.4 Notification preferences cross-tab

1. Tab A: Account → Appearance Settings → toggle a notification preference.
2. Tab B: same Account view: does the toggle reflect change? Refresh required?

---

## §7 — Specific KI verifications

For each open KI not yet verified post-fix (or where the fix was speculative), verify:

| KI | What to verify |
|---|---|
| KI-122 | Fullscreen tile mode cycle: roadmap/night/satellite all load correctly. If "Light" ever appears, what does it show? |
| KI-126 | Wizard empty-state desktop overflow on Step 3 + Step 4. Single CSS rule fix expected. Was it shipped? Pass numbering search needed. |
| KI-127 | Toast/avatar overlap — should be moot post-KI-116 (toast doesn't fire on dashboard). Verify. |
| KI-131 | Hero carousel pause on reduce-motion + manual control (Pass 79 shipped). Verify in browser. |
| KI-138 | After owner deploys edge function v51 + planner-applied migration: notification-preferences UX works fully? Or fallback still firing? |
| KI-141 | Mobile header active tab label (Pass 75 shipped). Verify. |
| KI-142 | Mobile Quick Actions horizontal-scroll carousel (verified at Pass 77). Re-verify. |
| KI-149 | "Previous session restored" toast on every page load. Still appearing post-Pass-79 (KI-130 close)? |
| KI-150 | PWA service worker registers in production build. Verify via `npm run preview` then `navigator.serviceWorker.controller`. |
| KI-153 | ci.yml permissions block (Pass 74 shipped). Verify GitHub Security tab no longer flags. |

---

## §8 — Edge cases + error states

### §8.1 Network throttling

1. DevTools Network → Slow 3G.
2. Reload each top-level surface.
3. Capture: skeleton loading state? Timeout behavior? Graceful degrade? Error toast?

### §8.2 Offline mode

1. DevTools Network → Offline.
2. Reload each surface.
3. PWA manifest + SW should provide offline shell (KI-130 / KI-150).
4. Verify: which routes work offline? Which crash?

### §8.3 URL-blocking error states (KI-095 graceful-degrade verification)

1. DevTools Network → Block request URL → block:
   - `/functions/v1/server/notification-preferences` → Account → Appearance Settings → Notifications section
   - `/functions/v1/server/navigation-saved-places` → Smart Shop Map → Saved
   - `tile.openstreetmap.org/*` AND `cartocdn.com/*` → Smart Shop Map
   - `/rest/v1/damage_reports` → Dashboard
2. For each: capture user-facing state (error toast? skeleton forever? blank? fallback data?).
3. Confirm KI-095 graceful-degrade pattern fires for endpoints that have it.

### §8.4 Long form input + boundary inputs

1. Vehicle make: enter 200 chars. Truncated? Error? Submitted as-is?
2. ZIP: enter alphabetic. Validation fires?
3. Description: enter 5000 chars. Form constraint?
4. Photo: try uploading 50MB file. Rejection? Progress? Error message?
5. Photo: try uploading non-image file (e.g. .txt renamed .jpg). What happens?

---

## §9 — Camera + geolocation permission flows

### §9.1 Geolocation permission

1. Sign out; clear browser permissions.
2. Sign in.
3. Open Coverage Map Dialog.
4. Click "Use my location" / equivalent.
5. Verify browser prompt appears.
6. **Deny** → what happens? Error toast? Manual fallback?
7. **Grant** → location pins on map?
8. **Grant + low accuracy** (DevTools Sensors → high accuracy: off) → graceful degrade?

### §9.2 Camera permission (Report flow Step 4 photos)

1. Click "Take Photo" CTA.
2. Verify browser camera prompt.
3. Deny → fallback to file picker?
4. Grant → live camera preview?

---

## §10 — Form validation across all forms

For each form: Report Step 1-5, Account profile, Account vehicles, Bid response, Bid accept/decline, sign-up, login, forgot password, contact:

1. Submit empty → required-field validation fires?
2. Invalid email → validation message?
3. Visual asterisk consistency (KI-129 fixed make/model/year — verify others).
4. Submit while loading → double-submit prevention?
5. Network failure mid-submit → state recovery?

---

## §11 — Deep visual canon audit per surface (MOLANDJESUS-locked)

For each surface in the inventory below, capture light + dark + 375/768/1280 = 6 screenshots. Score against:

- ✓ Cool blue canvas (light) / Deep royal navy (dark)
- ✓ Warm cream-ivory cards (light) / Premium glass with 8-criteria depth bar (dark)
- ✓ Bronze trim (NOT yellow-amber)
- ✓ Premium gold lamp lighting (top-edge catchlight + bronze rim + atmospheric outer halo)
- ✓ NO pure white panels in light mode
- ✓ NO yellow-amber gold
- ✓ NO flat solid fills (translucent glass everywhere)
- ✓ bd-* utility class consistency (form fields, cards, buttons)

**Surface inventory** (≈30 surfaces):
- Landing hero
- Landing OperatingRegions / Coverage section
- Landing How It Works / Why Choose / Who We Serve
- Landing footer
- Sign in / Sign up / Forgot password
- Customer Dashboard home
- Customer Dashboard Bids
- Customer Dashboard Account hub
- Customer Dashboard Account → Appearance Settings
- Customer Dashboard Account → Vehicles
- Customer Report flow Step 1-5
- Customer Smart Shop Map
- Customer Coverage Map Dialog (Search/Explore/Saved/Shops)
- Customer ImmersiveMapResultsDrawer
- Customer ReportDetailScreen
- Customer Bid card / Bid sheet
- Shop Dashboard home
- Shop Active Jobs
- Shop Estimate Inbox
- Shop Service Area Map (if exists)
- Shop Dashboard widgets
- Insurer Dashboard home
- Insurer Claims list
- Insurer Claim detail / approval modal
- Insurer Network Coverage Map
- All modals (Voice Controls, Settings, Photo Tips, Coverage Dialog)
- All toasts + notifications
- All error states
- All loading skeletons
- All empty states

**Output for §11:** screenshot grid + per-surface scorecard + photo evidence of any violations.

---

## §12 — New finding hunting

Open-ended. Things to actively look for that 8 prior passes might have missed:

1. **Long-press behaviors** on mobile.
2. **Right-click context menus** anywhere they shouldn't appear.
3. **Drag-and-drop interactions** beyond file upload.
4. **Print stylesheets** — print preview any surface; layout sane?
5. **Browser zoom** at 200% and 400% — layout breaks?
6. **High-contrast mode** — Windows HCM emulation in DevTools — surfaces still readable?
7. **Forced colors** mode — same.
8. **Inverted color mode** — macOS invert colors: surfaces still readable?
9. **Pinch zoom on map** — does it conflict with scroll?
10. **Two-finger drag on map** — does it tilt? Should it?
11. **Rotation gesture** — supported?
12. **Browser autofill** on form fields — works correctly?
13. **Autocomplete on form fields** — appropriate suggestions?
14. **Browser extensions** that inject content — any conflicts?
15. **Strict CSP errors** in console — anything blocked?
16. **Mixed-content warnings** — http: resources on https: page?
17. **Console errors** from any third-party script.
18. **Memory leaks** — open + close Coverage Map Dialog 20 times; heap grows?
19. **Token expiry** — sit on Bids tab for 1h+; does Clerk JWT refresh seamlessly or break?
20. **Time-zone display** — does ETA show in user's local TZ?
21. **DST transitions** — any time-display bugs around DST?
22. **Currency formatting** — bid prices ($575) localized correctly?
23. **Pluralization edge cases** — "0 offers", "1 offer", "2 offers", "100+ offers".
24. **Empty data sets** — user with 0 reports, 0 vehicles, 0 bids — every empty state designed?
25. **Very long names** — vehicle "Lamborghini Huracán Performante" doesn't break layout?
26. **Emojis in user input** — handled gracefully?
27. **RTL text** — if a user types in Arabic/Hebrew, does it display correctly?
28. **Special chars in URLs** — query params with #, &, % handled?
29. **Browser back-button trapping** — does any flow trap the user?
30. **Tab-restore behavior** — close tab mid-flow, reopen — state restored?

---

## §13 — Owner-action items still pending (NOT for audit-AI execution)

Document status of each at end of audit:

- KI-152 Service Role Key rotation
- KI-138/146 edge function deploy (v51)
- KI-114 + KI-115 git push + Studio apply
- KI-134 Clerk sign-out semantic decision (full destroy vs Switch Accounts)
- KI-101 (RESOLVED — verify still RESOLVED)
- KI-103 footer email decision
- KI-002 RESEND_API_KEY deploy
- HaveIBeenPwned enable in Studio Auth Settings
- Production-build Lighthouse JSON for Phase 4 gate

---

## Output deliverables

End of full pass (multi-session OK):

1. **EXECUTIVE_SUMMARY.md** — top P0/P1/P2/P3 sorted, recommended next builder passes.
2. **ROLE_FLOW_REPORT.md** — §1 results, screenshots, surfaces.
3. **NAVIGATION_LIVE_REPORT.md** — §2 results, simulated GPS + voice + reroute findings.
4. **MAP_PROGRAM_REPORT.md** — §3 + §11 visual canon results, marker variant inventory.
5. **PERFORMANCE_REPORT.md** — §4 production-build Lighthouse table + tile network evidence.
6. **A11Y_REPORT.md** — §5 keyboard + screen reader + contrast + reduced-motion findings.
7. **REALTIME_REPORT.md** — §6 cross-tab + cross-role propagation evidence.
8. **KI_VERIFICATION_REPORT.md** — §7 status of each KI.
9. **EDGE_CASES_REPORT.md** — §8 + §9 + §10 + §12 misc findings.
10. **OWNER_ACTION_STATUS.md** — §13 + any new items surfaced.

Save all under `docs/evidence/audit-pass-9-2026-05-NN/`.

---

## Hard stops (audit AI safety)

Pause and ping owner before:

- Running a `git push`
- Modifying `MOLANDJESUS_DESIGN_DECISIONS.md` or any LAW_*.md
- Rotating Service Role Key (KI-152)
- Applying any migration that involves user-data tables (`damage_reports`, `bids`, `profiles`, `vehicles`)
- Deploying edge function v51 (owner CLI cleaner per KI-146)
- Submitting a real damage report or accepting a real bid in production data
- Anything that costs money (e.g., Resend test email if RESEND_API_KEY were already deployed)

Otherwise proceed under standing safe-fix authority precedent.

---

## End of plan

This plan supersedes the prior pass-7 + pass-8 dispatches. Continue iterating until §1-§13 are covered. Multi-session OK. Token budget unbounded per owner directive.

**Start with §1.1 (Customer report-flow Step 5 verification)** — that's the single biggest functional gap from prior audits AND informs the final master-builder-AI handoff (KI-101 propagation is the load-bearing question Step 5 answers).
