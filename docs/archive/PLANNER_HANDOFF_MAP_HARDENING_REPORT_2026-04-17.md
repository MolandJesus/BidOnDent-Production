# Planner Handoff — Map Hardening, Browser Audit, and Cross-Surface Chrome Redesign

**Date:** 2026-04-17  
**Prepared for:** Planner AI / long-range strategy planning  
**Scope:** This report captures the meaningful map-facing work completed in this session chain before planning the next long-term strategy pass.

---

## 1. Executive Summary

This work completed three connected goals:

1. **Removed a real runtime trust weakness** in browser geocoding by moving shared browser geocoding traffic behind the public Supabase `server` edge route.
2. **Hardened browser-audit governance** so AI/browser agents use the real in-app landing return flow instead of brittle root navigation.
3. **Redesigned and browser-verified the shared map chrome** across the landing coverage map, landing fullscreen map, dashboard Smart Shop Map, immersive/fullscreen dashboard map, route preview, and active turn-by-turn guidance.

The result is not a new feature set. It is a hardening-safe polish and trust pass across already-existing map surfaces. The visual system is now more coherent, the browser QA path is more reliable, and the active navigation state is no longer a partially unverified edge case.

---

## 2. What Was Completed Before The Redesign Pass

### 2.1 Edge-proxied geocoding transport hardening

Previously, shared browser geocoding flows depended on direct requests to `nominatim.openstreetmap.org`. That weakened reliability because browser CORS/rate-limit/provider behavior could break Smart Shop Map origin search and related geocoding flows from the client.

Completed work:

- Added a public `GET /functions/v1/server/geocode/search` route to the shared Supabase `server` edge function.
- Added a shared web `geocodingClient` and moved map/browser geocoding callers onto that edge route.
- Preserved the existing UI/hook contracts so the transport changed without forcing a surface-level refactor.
- Added focused regression coverage proving the client now calls the edge route rather than direct browser Nominatim.
- Deployed the updated `server` edge function live.

Practical effect:

- Browser map geocoding is now edge-proxied and more trustworthy.
- The real provider is still Nominatim.
- This was transport hardening, not a provider migration.

### 2.2 Navigation session missing-table fallback hardening

The connected backend environment still lacks `public.navigation_sessions`. That caused noisy `500` traffic and made the client repeatedly hit a broken path.

Completed work:

- Added missing-table detection to the navigation session cloud service.
- Added a timed local-only cooldown so the app stops hammering the broken cloud path.
- Preserved local session storage as the immediate fallback.

Practical effect:

- Runtime noise is reduced.
- Cross-device sync is still not restored until backend schema parity is fixed.
- The client now fails honestly and quietly instead of failing noisily and repeatedly.

### 2.3 Landing coverage runtime synchronization fix

The landing coverage experience had a hook-order/runtime issue tied to appearance-driven tile-mode behavior.

Completed work:

- Updated `useOperatingRegionsCoverage` so light/dark appearance drives tile mode safely without shifting later hook order.
- Preserved the one explicit persisted override users are allowed to keep (`satellite`).

Practical effect:

- The landing coverage surface now tracks site appearance more reliably.
- Hot refresh / runtime order risk in that hook path was reduced.

---

## 3. Browser Navigation Governance Completed In This Session

The user explicitly called out that AI/browser agents should navigate through the dashboard logo flow rather than brute-forcing root navigation. That guidance is now formalized.

Completed work:

- Added and used `docs/REF_AI_BROWSER_NAVIGATION.md` as the required browser-audit runbook.
- Updated `.github/copilot-instructions.md` so AI/browser audit work must re-read that doc before browser actions.
- Verified the real authenticated landing-return behavior in code and in the browser:
  - `App.tsx` still routes dashboard-logo clicks through `navigation.setShowLandingPage(true)`.
  - The earlier apparent mismatch turned out to be a browser-targeting issue caused by multiple matching logo controls, not a broken app handler.
- Locked the real rule: **use the visible logo/wordmark button flow, not `page.goto("/")`, when returning to landing while authenticated.**

Important discovery for future audits:

- The browser snapshot can show multiple plausible logo controls.
- Selector choice matters.
- The app logic was correct; the naive interaction was not.

This matters strategically because future design audits now have a repeatable navigation contract instead of depending on brittle root redirects.

---

## 4. Cross-Surface Map Chrome Redesign Completed

This was the main visible change set.

### 4.1 Design intent

The goal was not "make it prettier" in a generic sense. The goal was to make existing map surfaces feel like one product-owned system:

- less oversized fullscreen chrome
- fewer disconnected floating islands
- stronger hierarchy between shell, controls, and map content
- more honest and actionable empty states
- stronger continuity between landing coverage browse, dashboard shop discovery, and route-active navigation

### 4.2 Shared visual language updates

Core shared styling in `src/styles/theme.css` was strengthened:

- `map-liquid-panel`
- `map-liquid-card`
- `map-liquid-rail`
- `map-liquid-sheen`
- `map-command-sidebar-shell`
- `map-command-sidebar-panel`

These changes increased coherence in blur depth, border treatment, highlight sheen, and shadow rhythm so map-adjacent elements read as one family instead of many one-off panels.

### 4.3 Landing fullscreen coverage browse updates

Updated files:

- `src/app/components/landing/CoverageBrowseExperience.tsx`
- `src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx`
- `src/app/components/landing/CoverageBrowseMapOverlays.tsx`

What changed:

- Narrowed the desktop command-center shell so fullscreen no longer feels dominated by a bulky left rail.
- Added stronger outer/inner shell treatment using the new shared sidebar classes.
- Added a compact top status strip when overview cards are hidden:
  - mode label
  - region count
  - live shop count
- Converted the scattered right-side icon column into a grouped liquid rail.

User-facing effect:

- The fullscreen landing map now feels more like an intentional command center and less like a wide dialog with floating leftovers.

### 4.4 Dashboard Smart Shop Map and immersive/fullscreen updates

Updated files:

- `src/app/components/shop/ImmersiveMapTopBar.tsx`
- `src/app/components/shop/ShopDirectoryMapPaneInlineUI.tsx`

What changed:

- Grouped the immersive top-bar drawer/split/tile controls into one shared shell.
- Reduced the disconnected floating-button look.
- Upgraded the inline map tile picker to a stronger rail treatment.
- Moved the inline no-results state into a smaller, more deliberate bottom-centered panel instead of a dead centered overlay.

User-facing effect:

- The dashboard map experience now tracks the landing map language more closely.
- Inline and immersive modes feel related rather than separately designed.

### 4.5 Route preview and active-guidance chrome updates

Updated files:

- `src/app/components/maps/navigation/NavigationActionRail.tsx`
- `src/app/components/maps/navigation/NavigationActiveSpeedPanel.tsx`
- `src/app/components/shop/ShopDirectoryGuidanceCard.tsx`
- `src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx`

What changed:

- The route action rail now uses stronger rounded-rect buttons instead of generic circular controls.
- Active controls visibly pulse through the shared `map-nav-icon-ring-pulse` treatment.
- Speed and limit badges now sit inside one shared liquid rail instead of reading like separate floating badges.
- Route preview cards and guidance cards now use the same liquid panel/card language as the rest of the map system.
- Sub-panels for route errors, GPS recovery, and route options now feel embedded rather than tacked on.

User-facing effect:

- The route-active state finally looks like part of the same product family as landing and dashboard map browse states.

---

## 5. Live Browser Audit Completed

This pass was not closed from code inspection alone. A real browser audit was completed.

### 5.1 Desktop states verified live

Verified states:

1. Landing coverage inline map section
2. Landing fullscreen Search tab
3. Landing fullscreen Explore tab
4. Landing fullscreen Saved tab
5. Landing fullscreen Shops tab
6. Dashboard inline Smart Shop Map
7. Dashboard immersive/fullscreen Smart Shop Map
8. Route preview state
9. Active turn-by-turn navigation state

### 5.2 Specific route-state verification completed

The route-active state had been the least-verified redesign target earlier in the session. That gap is now closed.

Completed live actions:

- Routed through the dashboard Smart Shop Map / Directions flow.
- Confirmed a real route preview card rendered.
- Started navigation from the preview path.
- Confirmed active-guidance state rendered with:
  - maneuver overlay (`Next maneuver`)
  - left guidance/status card
  - route state chips (`Live route`, `GPS weak`)
  - action buttons (`Pause`, `Recenter`, `End Route`)
  - right action rail (turn list, voice, settings, recenter)

Observed runtime truth:

- Navigation works in the current build.
- Desktop browser sessions without granted geolocation correctly surface a degraded state rather than pretending navigation is fully healthy.

### 5.3 Browser findings that matter for future planning

- The authenticated landing-return flow is reliable when the correct visible logo selector is used.
- Smart Shop Map route preview is reachable with the current seeded/example data path.
- Route-active UI is no longer a theoretical or untested state after the redesign.
- Map chrome now reads consistently enough across surfaces that future work can focus more on behavior and information architecture instead of re-solving base styling on every screen.

---

## 6. Validation Completed

### 6.1 Diagnostics

- Touched TypeScript/TSX files: clean
- `theme.css`: only pre-existing duplicate-selector warnings remained (`:root`, `[data-appearance-mode="light"]`), no new syntax or build breakage

### 6.2 Build

- Production build completed successfully
- No build-breaking regressions surfaced from the redesign set

### 6.3 Spellcheck

- Touched map UI files and touched docs were checked with `cspell`
- No new spelling issues from this pass remained
- Remaining `cspell` hits came from historical vocabulary already present in older tracker entries (`ungated`, `pathspec`, commit hashes, and similar audit shorthand)

### 6.4 Mobile/desktop honesty

- Desktop browser verification is complete and trustworthy.
- The integrated browser did not provide a dependable forced `375x812` viewport in this session, so mobile verification is only partially live-checked and still deserves a dedicated real-device or trustworthy responsive-browser pass.
- This should remain an explicit planning follow-up, not an assumed completion state.

---

## 7. What Is Materially Better Now

### 7.1 Trust and product feel

- The map program feels more product-owned and less like multiple separate map experiments.
- Empty states and pre-search states are more honest and actionable.
- Route-active guidance now visually belongs to the same system as browse states.

### 7.2 Auditability

- Browser-audit navigation is now governed.
- Future AI/browser passes have a real protocol instead of improvising landing return behavior.
- Route-active QA is now a defined and repeatable part of map validation.

### 7.3 Technical hygiene

- Browser geocoding is more resilient because it no longer depends on direct provider calls.
- Navigation session cloud drift no longer hammers a broken backend table path.
- Coverage browse report-layer access is harder to misuse from customer-facing coverage surfaces.

---

## 8. What Did Not Change

This is important for planning honesty.

The following were **not** changed by this work:

- no provider migration
- no new routing provider
- no new marketplace intelligence model
- no change to Supabase as source of truth
- no navigation-session backend schema repair
- no new map feature family
- no real third-party shop onboarding activation
- no URL routing/deep-linking migration

This was a hardening-and-clarity pass, not a roadmap expansion.

---

## 9. Risks, Gaps, and Constraints Still Present

### 9.1 Backend schema drift still exists for navigation sessions

- The client mitigation is in place.
- True cross-device cloud sync still depends on restoring `public.navigation_sessions` in the connected backend.

### 9.2 Smart Shop Map still mixes real posture with example shop data

- The UI honestly states that verified partner shops appear once the account is connected.
- This is still not the same thing as a fully real live shop marketplace.

### 9.3 Mobile verification is incomplete

- Desktop validation is strong.
- Mobile still needs a dedicated follow-up with trustworthy viewport tooling or a real device.

### 9.4 State-driven routing still limits deep-link and planner-style flows

- Browser QA is workable.
- But shared URLs, planner handoff links, and direct state-entry links are still constrained by the current state-driven routing model.

---

## 10. Best Long-Term Strategy Recommendations For Planner AI

The next strategic planning should probably focus on these in order:

### Recommendation 1 — Close the trust gap between map UI and real market reality

Reason:

- The chrome is now materially stronger.
- The next leverage point is not more polish; it is making the Smart Shop Map feel less example-driven and more operationally real.

Likely planning questions:

- How do we surface real market-density truth more clearly?
- What is the shortest path from seeded/example shop inventory to a genuinely trustworthy live partner-shop loop?
- Which parts of Smart Shop Map should remain example-backed versus be made fully real first?

### Recommendation 2 — Restore backend schema parity for navigation sessions

Reason:

- The client mitigation is only a safety net.
- The architecture already expects Supabase-backed session continuity.

Likely planning questions:

- Is the connected environment missing only `navigation_sessions`, or are there broader schema drifts left?
- Should the planner prioritize a backend parity sweep before any additional navigation investment?

### Recommendation 3 — Run a real mobile map audit and mobile-specific cleanup pass

Reason:

- The codebase now has better cross-surface chrome, but the mobile claim is weaker than the desktop claim.
- A real mobile audit will likely expose layout or density issues that are invisible on desktop.

Likely planning questions:

- Which map states are still too desktop-shaped on phones?
- Does fullscreen coverage browse need stronger mobile-only behavior or a stricter bottom-sheet-first approach?
- Does active guidance need mobile-specific spacing or button clustering changes?

### Recommendation 4 — Decide whether route-active navigation remains frozen or becomes a future differentiator

Reason:

- Current project law says advanced navigation investment is frozen relative to launch priorities.
- But this pass proved the route-active UI is now coherent enough that it could become a stronger future differentiator if the product chooses to re-open that track post-launch.

Likely planning question:

- Should navigation stay in “credible, frozen support layer” status, or should it become a post-launch productization track once the customer-shop transaction loop is live?

---

## 11. Single-Sentence Planning Readout

The map system is now significantly more coherent, more honestly validated, and better governed for future browser audits, but the next strategic leverage is no longer visual polish alone; it is converting the strongest map surfaces from well-designed hybrid/demo trust signals into clearly operational, backend-aligned marketplace truth.
