# Audit — Visual Deep (2026-05-05)

**HEAD:** `708d0d3805b19b62907ec14d172a1f65ab0b1cf7`
**Date:** 2026-05-05
**Auditor:** Sonnet (running inside VS Code agent / Electron browser)
**Scope:** Visual Deep Audit (Audit A of dual prompt)
**Pre-flight:** PARTIAL — see "Pre-flight reconciliation" below
**Findings count by severity:** P0:1 P1:1 P2:1 P3:3 P4:2

```yaml
machine_summary:
  head: 708d0d3805b19b62907ec14d172a1f65ab0b1cf7
  date: 2026-05-05
  scope: visual_deep
  pre_flight: partial
  findings:
    P0: 1
    P1: 1
    P2: 1
    P3: 3
    P4: 2
  coverage_gaps:
    - mobile_375_viewport_emulation_unavailable
    - app_dark_mode_toggle_not_reachable
    - unauthenticated_landing_not_reachable_in_dev_demo_session
```

---

## Pre-flight reconciliation

| Check                                       | Result                                                                                                                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pwd`                                       | ✓ project root                                                                                                                                                                                                                 |
| `git rev-parse HEAD`                        | ✓ `708d0d38` matches expected pin                                                                                                                                                                                              |
| `git status --short`                        | ⚠ 3 modified files (concurrent agent): [docs/LAW_HARDENING_PLAN.md](docs/LAW_HARDENING_PLAN.md), [docs/REF_KNOWN_ISSUES.md](docs/REF_KNOWN_ISSUES.md), [src/app/hooks/useBidsForReport.ts](src/app/hooks/useBidsForReport.ts) |
| `npm run build`                             | ✓ PASS in 3.30s, 63 PWA precache entries                                                                                                                                                                                       |
| `npm run dev`                               | ✓ already running on `localhost:5173`                                                                                                                                                                                          |
| Browser tooling: `reducedMotion: 'reduce'`  | ✓ supported                                                                                                                                                                                                                    |
| Browser tooling: `getComputedStyle()` reads | ✓ supported                                                                                                                                                                                                                    |
| Browser tooling: `page.hover()`             | ✓ supported                                                                                                                                                                                                                    |
| Browser tooling: `page.on('console')`       | ✓ supported                                                                                                                                                                                                                    |
| Browser tooling: viewport size emulation    | ⚠ partial — `setViewportSize({width:375})` did not propagate to `document.documentElement.scrollWidth` (stayed at 1652)                                                                                                       |
| Browser tooling: geolocation override       | ⚠ unavailable in this Electron context — surfaces "Location not available" disabled button (acceptable degraded path, see Audit B M-Pos.5)                                                                                    |

**Override authorization:** Owner granted "full authority" mid-session and acknowledged a concurrent AI editing the repo. Per the multi-AI dirty-worktree rule, no dirty file was reverted, stashed, or read-as-truth — they belong to the other agent's in-progress work. Audit is read-only/measurement, so no collision.

**Coverage gaps explicitly accepted (re-measure required before any P0 sweep based on this report):**

- **Mobile 375 viewport** could not be reliably set in the integrated Electron browser. All measurements report desktop dimensions even when `setViewportSize({width:375})` was called. The user's persistent memory note records this same limitation. § A.2 item 5 (touch ≥ 44×44) and item 6 (no horizontal scroll at 375) are therefore **not measured for mobile** in this pass — only at 1440 desktop, where 44×44 is not a LAW requirement. A mobile re-audit needs a real browser context (Chromium standalone, BrowserStack, or device).
- **App-level dark mode toggle** could not be reached. The `Dark` button found on Smart Shop Map is the **map-tile theme** toggle, not the app theme. The Account profile menu / popover did not return menu items (likely portal-rendered + closed before query). § A.1 dark-mode rows are therefore unmeasured. The dark-mode depth-bar contract (§ A.2 item 4) was instead inspected via computed `box-shadow` of `.bd-dashboard-panel` / `.bd-dashboard-section` and verified to compose the expected gold-lamp + cool-blue-ring + cream-catchlight family in the current (light) render — so the _tokens_ are correct; the _render-mode_ swap was not exercised.
- **Unauthenticated landing** was not reachable in this dev-demo session. The browser is signed in as `molalign5@gmail.com` via `DevDemoCustomerInner`; `/landing` resolves to the SPA root and continues to render the dashboard. Sign-In modal (Audit A row 4) and any landing-only sections (hero atmosphere, bloom, liquid-gold-flow) were therefore **not measured**. Forcing logout would disrupt the concurrent agent's session.
- **Bid acceptance overlay** (Audit A row 5) and **Shop detail sheet** (Audit A row 6) were not exercised — they require completing flow steps that would mutate live data.

What WAS measured: **Dashboard home**, **Smart Shop Map**, **Bids**, **Account**, **Report (Step 1 shell)** — all in **light mode at 1440 desktop**.

---

## Findings

### V-001 [P0] — Reduced-motion contract leak on `.bd-glass-card` (KI-113 regression candidate)

- **Route:** `/` Smart Shop Map and any surface mounting `.bd-glass-card` (universal — class is broadly applied)
- **Selector:** `.bd-glass-card`
- **Measured value (under `prefers-reduced-motion: reduce`):**
  - `transition-property: transform, box-shadow, border-color`
  - `transition-duration: 0.2s, 0.2s, 0.2s`
  - `animation: none 0s ease 0s 1 normal none running` ✓ (animation correctly suppressed)
- **Expected per LAW:** [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](docs/LAW_ANIMATION_AND_ATMOSPHERE.md) §3 Forbidden patterns: _"CSS `transition:` declarations on interactive states (hover, focus, focus-visible, active) that produce visible motion (transform, opacity-via-transform-overlap) without a `@media (prefers-reduced-motion: reduce)` override — REJECTED."_ The KI-113 closure-proof scope contract ([`docs/OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md`](docs/OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md)) explicitly notes WAAPI overrides are independent of CSS transitions and both must respect reduce.
- **Screenshot:** N/A (computed-style finding; no visual artifact at rest)
- **Notes:** Same shape as the original KI-113 finding on `.bd-dashboard-section--interactive`, just on a different selector. The neighbour class `.bd-dashboard-section` returned `transition-property: all` but with `0s` duration under reduce — that one is correctly guarded. Spot-check confirms `button.bd-dashboard-primary-button` is fully clean (`transition: none`). Recommend a CSS audit of `.bd-glass-card` and any siblings (`--landing`, `--landing-warm`, `--dashboard`) for the same leak.

---

### V-002 [P1] — CSP `img-src` blocks all Unsplash imagery (broken landing/hero photos)

- **Route:** Any surface that consumes Unsplash photo URLs (landing hero scene, benefits/trust cards, bid-card-float thumbnails)
- **Selector:** `<img src="https://images.unsplash.com/...">`
- **Measured value:** Verbatim console output:
  ```
  Loading the image 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?...'
  violates the following Content Security Policy directive:
  "img-src 'self' data: blob: https://*.supabase.co https://*.basemaps.cartocdn.com
   https://server.arcgisonline.com https://*.clerk.com https://img.clerk.com".
  ```
  At least 8 distinct Unsplash photo IDs were blocked on a single dashboard load.
- **Expected per LAW:** [`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md) §6 Security by Default permits CSP allowlists, but Law 3 (Document What Is) requires the visual system to render the surfaces it claims. [`docs/REF_VISUAL_SYSTEM.md`](docs/REF_VISUAL_SYSTEM.md) §3 lists hero result chips and benefit photo cards as shipped — those depend on the same Unsplash URLs that CSP now blocks.
- **Screenshot:** [docs/audit-assets/visual-2026-05-05/01-dashboard-smart-map-light-1440.png](docs/audit-assets/visual-2026-05-05/01-dashboard-smart-map-light-1440.png) (Smart Shop Map renders without these images; absence not visually loud here, but bid-card-float on landing relies on them)
- **Notes:** Either (a) extend CSP to allow `https://images.unsplash.com`, or (b) migrate the imagery onto the same Supabase Storage `storage://` pointer flow used by user media (preferred — same hydrate path, no third-party dependency, signed). Skill `supabase-storage-signed-urls` covers the migration pattern.

---

### V-003 [P2] — Clerk telemetry blocked by CSP

- **Route:** All authenticated routes
- **Selector:** N/A (network-layer)
- **Measured value:** Verbatim console:
  ```
  Connecting to 'https://clerk-telemetry.com/v1/event' violates the following
  Content Security Policy directive: "connect-src 'self' http://127.0.0.1:54321
  http://localhost:54321 ws://127.0.0.1:54321 ws://localhost:54321
  https://*.supabase.co wss://*.supabase.co https://*.clerk.accounts.dev
  https://*.clerk.com https://*.sentry.io https://*.basemaps.cartocdn.com
  https://server.arcgisonline.com https://nominatim.openstreetmap.org
  https://router.project-osrm.org https://overpass-api.de".
  ```
- **Expected per LAW:** No LAW requirement to send telemetry; Clerk works without it. Issue is **console-noise pollution** that obscures real errors during dev/QA.
- **Screenshot:** N/A
- **Notes:** Either add `https://clerk-telemetry.com` to `connect-src` if telemetry is desired, or disable Clerk telemetry at the SDK level (Clerk supports a `telemetry: { disabled: true }` option) to silence the warning. Recommend the latter — fewer third-party endpoints, less attack surface.

---

### V-004 [P3] — `X-Frame-Options` set via `<meta>` tag (invalid)

- **Route:** Every page load
- **Selector:** `<head>` (HTML meta tag)
- **Measured value:** Verbatim console: `X-Frame-Options may only be set via an HTTP header sent along with a document. It may not be set inside <meta>.`
- **Expected per LAW:** [`docs/LAW_PROJECT_RULES.md`](docs/LAW_PROJECT_RULES.md) §6 Security by Default. The `X-Frame-Options` header MUST be served via HTTP response headers (Vercel edge config, hosting platform headers, or `vite.config.ts` middleware) — not embedded in HTML where browsers ignore it.
- **Screenshot:** N/A
- **Notes:** The site is currently NOT clickjacking-protected via this meta tag despite the developer intent. Move to `Vercel.json` `headers` block (or equivalent for the hosting target) and remove the `<meta http-equiv="X-Frame-Options">` from [index.html](index.html).

---

### V-005 [P3] — React `forwardRef` warning in `AlertDialogOverlay` (BidAcceptConfirmationDialog)

- **Route:** Bid acceptance flow (when `BidAcceptConfirmationDialog` mounts)
- **Selector:** `AlertDialogOverlay` inside `[src/app/components/ui/alert-dialog.tsx](src/app/components/ui/alert-dialog.tsx)`
- **Measured value:** `Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?` — stack trace shows `AlertDialogOverlay → AlertDialogPortal → AlertDialogContent → BidAcceptConfirmationDialog → BidsScreen`.
- **Expected per LAW:** No specific LAW rule, but Law 5 (Errors Are User-Visible) implies that runtime warnings about broken refs should be addressed since they can cause focus-management bugs in modals (a critical surface for the Bid → Accept transaction).
- **Screenshot:** N/A (warning is dev-only console; no visual symptom yet)
- **Notes:** Wrap the function component in `React.forwardRef`. This is a standard radix-ui adapter pattern.

---

### V-006 [P3] — Vite HMR cascade failure (concurrent-agent side effect)

- **Route:** All routes (HMR overlay)
- **Selector:** N/A
- **Measured value:** Verbatim console:
  ```
  [vite] Failed to reload /src/app/routers/DashboardRouter.tsx.
  This could be due to syntax errors or importing non-existent modules.
  GET request to http://localhost:5173/src/app/hooks/useInsurerClaimNotifications.ts failed: 500
  ```
- **Expected per LAW:** Hot reload should converge cleanly; failed reloads degrade developer trust in the dev server.
- **Notes:** This MAY be a transient artifact of the concurrent agent editing files mid-audit (`useBidsForReport.ts` was on the dirty list). Re-test on a clean tree. If reproducible on clean tree, escalate.

---

### V-007 [P4] — `aria-hidden` on focused-descendant element (a11y)

- **Route:** Image zoom interactive (any view containing the in-place zoom button with class `cursor-zoom-in`)
- **Selector:** `<button class="absolute inset-x-[15%] inset-y-[18%] cursor-zoom-in ...">`
- **Measured value:** Verbatim console:
  ```
  Blocked aria-hidden on an element because its descendant retained focus.
  The focus must not be hidden from assistive technology users.
  Avoid using aria-hidden on a focused element or its ancestor. Consider using
  the inert attribute instead, which will also prevent focus.
  Element with focus: <button.absolute inset-x-[15%] inset-y-[18%] cursor-zoom-in ...>
  Ancestor with aria-hidden: <div.relative>
  ```
- **Expected per LAW:** WCAG 4.1.2 (compatibility with assistive tech). LAW does not call this out explicitly but Law 5 + the role hierarchy (customer-first) implies a11y matters.
- **Notes:** Replace `aria-hidden="true"` on the wrapping `<div>` with `inert` (HTML attribute) to prevent both focus and AT exposure correctly.

---

### V-008 [P4] — `motion/react` reduced-motion library warning

- **Route:** Every authenticated load
- **Selector:** N/A (library-level)
- **Measured value:** Verbatim console: `You have Reduced Motion enabled on your device. Animations may not appear as expected.. For more information and steps for solving, visit https://motion.dev/troubleshooting/reduced-motion-disabled`
- **Expected per LAW:** Cosmetic dev warning only — `motion/react` is correctly honoring reduce-motion (V-001 confirmed `animation: none` under reduce). The library is just verbose about it.
- **Notes:** Filter the warning at MotionConfig if it's noise, or accept it as confirmation the contract is honored.

---

## Positive verifications (no findings — informational)

- **0 forbidden-white load-bearing surfaces** across Dashboard home, Smart Shop Map, Bids, Account, Report — sampled 41 + 9 + 11 + 16 + 3 surfaces respectively at 1440 light. No `rgba(255,255,255,>=0.5α)` panel/section/card body found.
- **0 forbidden gold palette values** on the same surfaces. No `rgba(220,165,90)`, `rgba(254,248,220)`, `rgba(160,95,25)`, or `rgba(220,140,50)` matches.
- **0 horizontal scroll** at 1440 desktop on every measured surface.
- **Atmospheric tokens applied:** `--bd-dashboard-panel-shadow`, `--bd-dashboard-section-shadow`, `--bd-dashboard-panel-bg` all populate with locked palette values (`rgba(196, 144, 65)` for the gold lamp; `rgba(15, 30, 60)` for the navy drop). Sample (truncated):
  ```
  --bd-dashboard-panel-shadow: 0 18px 42px rgba(15, 30, 60, 0.22),
                               0 36px 80px rgba(15, 30, 60, 0.1), …
  --bd-dashboard-panel-bg: radial-gradient(ellipse 90% 50% at 50% 0%,
                                            rgba(196, 144, 65, 0.05), transparent…)
  ```
- **Dashboard panel depth-bar (8-criteria, light):** `.bd-dashboard-panel` returns a composed `box-shadow` containing all of: navy drop-shadow stack `rgba(15, 30, 60, …)`, gold lamp inset highlight `rgba(252, 238, 204, 0.76)`, cool-blue ring `rgba(96, 165, 250, …)`. Matches REF_VISUAL_SYSTEM §1 contract.
- **Dashboard section depth-bar (light):** `.bd-dashboard-section` carries the gold lamp inset + indigo-tinted shadow stack but does **not** return a cool-blue ring — consistent with REF_VISUAL_SYSTEM stating sections use lower-alpha and skip criterion 7 in light mode.
- **Reduced-motion contract honored on:** `.bd-dashboard-section` (animation+transition both 0s), `button.bd-dashboard-primary-button` (transition: none), all sampled `*-pulse` / `*-flow` / `*-route` keyframe classes (animation: none 0s).

---

## Audit complete. 8 findings logged. No code changes made. Tree unchanged at 708d0d38 by this audit (3 pre-existing concurrent-agent files remain).
