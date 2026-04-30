# REF_AI_BROWSER_NAVIGATION

**Last updated:** 2026-04-26
**Status:** Active reference
**Scope:** Browser automation behavior for Playwright-like tools in BidOnDent

---

## Purpose

This document defines the required navigation protocol for AI/browser agents.

Goal: avoid route drift, redirect loops, and repeated failures when moving between dashboard and landing surfaces.

For local Docker browser audits, the expected target is `http://localhost:5173/`, started with `npm run dev:local-browser` (no proxy required — the dev-server CSP allow-lists local Supabase URLs directly). Do not run a plain `npm run dev` for these audits unless the pass explicitly wants the cloud Supabase project; `dev:local-browser` is the helper that auto-wires Vite to the running local Docker stack via `supabase status -o env`.

Every AI/browser audit pass must read this file before taking browser actions on BidOnDent.

If browser navigation behavior changes, this file must be updated in the same pass.

---

## Non-Negotiable Rule

When an agent needs to return to the landing page while authenticated, or start a landing-page audit from a logged-in dashboard session, it must use the BidOnDent logo flow.

- Required action: click the visible BidOnDent site logo or wordmark button, preferably the control with `aria-label="Open dashboard home"` when it exists.
- Prohibited shortcut: direct `page.goto("/")` as a landing return strategy.
- Prohibited shortcut: coordinate-based logo clicks for ordinary navigation.

Why: auth routing and app state can redirect root navigation back into dashboard context; logo navigation follows intended in-app transitions.

---

## Canonical Flows

### 1) Return to landing map section (authenticated)

1. Close any modal/full-map dialog first (overlay blocks pointer events).
2. Click the dashboard/site BidOnDent logo using selectors, not coordinates.
3. Scroll to section id `coverage`.
4. Verify landing state by checking at least two markers:
   - Heading contains: "Find shops near you, right on the map."
   - Coverage section exists with search panel + map surface.

Preferred landing-return selectors, in order:

1. `button[aria-label="Open dashboard home"]`
2. `header button[aria-label="Back to top"]`
3. `header button:has-text("BidOnDent")`
4. `header a:has-text("BidOnDent")`

### 2) Open full map from landing

1. From coverage section, click "Open Full Map".
2. Verify dialog open markers:
   - Close control with `aria-label="Close map"`
   - Sidebar tab row with Search / Explore / Saved / Shops

### 3) Return from full map to landing

1. Click close map button.
2. If state is uncertain, click header BidOnDent logo again.
3. Re-verify coverage heading and map section.

### 4) Open dashboard Smart Shop Map

1. Start from dashboard home or another authenticated dashboard surface.
2. Prefer the explicit Smart Shop Map / Directions entry point instead of trying to route through unrelated cards.
3. Verify dashboard map state with at least two markers:

- Heading contains: `Smart Shop Map`
- Search/origin shell and map surface are both present

### 5) Audit active navigation state

1. From Smart Shop Map, use an existing route preview and click `Start Navigation`.
2. Verify active-navigation markers:

- Maneuver overlay contains `Next maneuver`
- Guidance card contains route status plus action buttons (`Pause`, `Recenter`, `End Route`)
- Right action rail contains turn-list, voice, settings, and recenter controls

3. If location permission is denied in desktop browser QA, treat `GPS weak` plus retry guidance as expected degraded behavior, not as silent failure.

---

## Selector Strategy (ordered)

Prefer resilient selectors in this order:

1. Accessibility label/role selectors (`aria-label`, role + text)
2. Visible button text exact match
3. Header-scoped link/button text match
4. Last-resort structural selector

Avoid brittle absolute-coordinate clicks unless validating map pin hit-testing behavior after screenshot evidence confirms the target.

---

## Known Failure Modes and Recovery

### Overlay intercepts pointer events

Symptom: click timeout with dialog overlay intercept.

Recovery:

1. Click close map control (`aria-label="Close map"`) with force if needed.
2. Retry header-logo navigation.

### Root URL redirects unexpectedly

Symptom: `page.goto("/")` lands in dashboard context.

Recovery:

1. Stop using direct root navigation for return flow.
2. Use header logo flow.

### Sidebar or fullscreen chrome blocks the logo

Symptom: the dashboard/site logo is visible but another overlay or immersive shell intercepts pointer events.

Recovery:

1. Exit fullscreen/immersive mode with the relevant close or back control.
2. Retry the logo flow using the selector order above.
3. If the logo still fails, reload once and retry the canonical flow.

### Snapshot appears stale

Symptom: UI does not reflect recent edits.

Recovery:

1. Reload page.
2. Re-run canonical flow from logo click.
3. Re-capture screenshot before making design judgments.

### Shop results appear empty while auditing route states

Symptom: Smart Shop Map loads, but the current search/filter state shows zero shops and no routable results.

Recovery:

1. Clear any persisted search text first.
2. Prefer the dashboard `Directions` / Smart Shop Map entry point to surface the seeded example route-preview state quickly.
3. If route preview still does not appear, use a known quick origin chip (for example `White Plains`) and re-run `Search this area`.

---

## Verification Checklist For Map Design Passes

For each pass that changes map UI:

1. Landing coverage section screenshot
2. Full map (Search tab) screenshot
3. Full map (Explore tab) screenshot
4. Full map (Saved tab) screenshot
5. Full map (Shops tab) screenshot
6. Dashboard inline Smart Shop Map screenshot
7. Dashboard immersive/fullscreen Smart Shop Map screenshot
8. If changed: route preview screenshot
9. If changed: active navigation screenshot
10. If changed: pin popup/destination card screenshot

Do not mark design passes complete without this screenshot set.

---

## Quick Automation Snippet

```ts
// Project-standard landing return flow
await page
  .locator('button[aria-label="Close map"]')
  .first()
  .click({ force: true })
  .catch(() => {});
await page
  .locator(
    'button[aria-label="Open dashboard home"], header button[aria-label="Back to top"], header button:has-text("BidOnDent"), header a:has-text("BidOnDent")'
  )
  .first()
  .click({ force: true });
await page.evaluate(() =>
  document.getElementById("coverage")?.scrollIntoView({ behavior: "instant", block: "start" })
);
```

Use this flow as the default before map QA screenshots or design validation.
