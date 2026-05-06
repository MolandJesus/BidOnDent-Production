# 🟦 SONNET CLOSURE-PROOF VERIFICATION PROMPT — KI-113 / Phase 7.6 — v1

**Status of the work this prompt verifies:** Pipeline Commits 1–9 already shipped on `BidOnDent-Horizon-Beta`. Static audit by Opus passed Tasks 1, 2, 3, 7 from the v6 Auditor spec. **Tasks 4, 5, 6 (runtime DOM measurement, S1 + S3 closure-proof, recovery) and a new Visual Integrity Sweep are this prompt's scope.** Without runtime verification, KI-113 cannot be declared truly RESOLVED — Phase 7.5's whole reason for existing was that static-only verification missed the Class 1 falsification.

**Branch:** `BidOnDent-Horizon-Beta` at `11ecdafd` (10 commits ahead of `b1fea150`).

**Mode:** Verification only. No code edits to `src/`. No commits beyond the optional Commit 10 doc-update with measurement values quoted.

---

## Pre-flight (RUN FIRST, halt on any FAIL)

1. `git rev-parse HEAD` must equal `11ecdafd`. FAIL → halt.
2. `git status --short` must be empty. FAIL → halt.
3. `npm run build` must exit 0. FAIL → halt.
4. Browser automation tool available. If you have Playwright MCP, use it. If you have generic browser MCP, use it. If you have neither, **halt and report**: this prompt requires runtime DOM measurement.
5. `npm run dev` (or equivalent) must be runnable. Start the dev server in background; wait for `localhost:5173` (or shown port) ready signal.

If all 5 pass, log `Pre-flight PASS` and proceed.

---

## Global Rules (binding)

1. **Verification only.** No `src/` edits. The only writes allowed are: (a) measurement-output append to `docs/OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md` close footer, (b) one Commit 10 `docs(verification):` doc commit if `VERDICT: CLEAN`.
2. **Quote computed DOM values verbatim.** "Looks fine" / "feels instant" / "appears reduced" = FAIL. The value `0s` must appear literally in your output.
3. **Anti-hallucination clause:** if a value cannot be observed in your runtime tool output, state `not observable in runtime log`. Do not reconstruct, estimate, or infer. `not observable` = FAIL for Tasks 5 and 6 verdict purposes.
4. **STOP-on-uncertainty:** halt and report.
5. **No "while I'm here" doc edits.** Only the Commit 10 verification footer is allowed; do not touch other doc lines, do not refactor markdown, do not propose new sections.

---

## Required Reading (load before starting)

1. `docs/REF_AI_BROWSER_NAVIGATION.md` — your browser-automation discipline guide
2. `docs/OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md` close footer (existing) — what was claimed to be done
3. `docs/OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md` close footer + Sonnet runtime verification section — original S1 + S3 falsification report; the verbatim FAIL verdict you must close

---

## Tooling reference (browser MCP)

You will need to:

1. Launch a headed Chromium (visual confirmation possible) or headless (faster; only if MCP supports DOM property reads)
2. Navigate to surface routes
3. Toggle `prefers-reduced-motion` via Chrome DevTools Protocol or `page.emulateMedia({ reducedMotion: 'reduce' })` in Playwright
4. Read computed style: `window.getComputedStyle(element).getPropertyValue('transition-duration')` and `transition-property`
5. Optional: capture screenshots for the Visual Integrity Sweep (Task NEW)

If your browser MCP exposes a different API (e.g. `mcp__browser__navigate`, `mcp__browser__getStyle`), use that. Quote the actual tool output verbatim in your report.

---

## Verification Tasks

### Task 4 — Runtime DOM measurement under reduce (per-surface, per-element)

For each surface route below, navigate, set `prefers-reduced-motion: reduce`, identify every rendered DOM node from a migrated `motion.*` element, and capture computed `transition-duration` + `transition-property`.

**PASS PER ELEMENT ONLY IF:** `transition-duration === "0s"` OR `transition-property === "none"`.

Surface route map:

| Route                                                                               | Migrated files to inspect                                                                                                                                                                                                                                                                                                                            | Suggested DOM landmarks                                                       |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/` (landing → click "Sign In" or use `?demo=customer` shortcut if landing has one) | LoginModal                                                                                                                                                                                                                                                                                                                                           | dialog `motion.div`, login form `motion.div`                                  |
| `/signin` (or wherever ClerkAccountTypeSelector renders)                            | ClerkAccountTypeSelector                                                                                                                                                                                                                                                                                                                             | role-card list, the variants stagger items                                    |
| Login screens (Clerk-provided container)                                            | LoginLoginView, LoginMainView, LoginSignupView                                                                                                                                                                                                                                                                                                       | view-container `motion.div` with explicit-duration transitions                |
| `?demo=customer` (dev demo, bypasses auth — see `src/app/utils/devDemoMode.ts`)     | DemoAccountSwitcher (if shown), DashboardRouter (route container), DashboardSecondaryViews (overlay views), BidCardArticle, BidsScreen, BidsEmptyState, BidsGeographyMap, BidsSummaryHeader, AccountScreen, AccountHeader, AccountInfoCard, AccountMenu, ReportScreen, MissingReportState, ReportsListScreen, StepComplete, CompetitorAnalysisScreen | Bids screen card list, account menu items, report wizard `motion.div`         |
| `?demo=shop`                                                                        | ShopActiveJobsScreen, ShopEstimateInboxScreen, ShopRequestsScreen, LikedShopsScreen, ShopOnboardingStep1–4 (if reachable in demo mode)                                                                                                                                                                                                               | shop card lists, onboarding step containers                                   |
| Insurer demo if available, else authenticated insurer dashboard                     | InsurerClaimsScreen, InsurerOnboarding, InsurerPartnerShopsScreen                                                                                                                                                                                                                                                                                    | claims list, partner card list, onboarding step containers                    |
| Admin route (`?demo=admin` if exists, else authenticated admin)                     | AdminDashboard, AdminInfoPanel, AdminManagementPanel, AdminIntakeOperationsPanel, LinkedTestAccounts, QuickActions, SwitchBackPanel, AdminHeader, NewAccountForm                                                                                                                                                                                     | admin card stagger, quick-actions panel                                       |
| Sheet flows (trigger acceptance flow if reachable)                                  | AcceptedBidConfirmationSheet (overlay portion), ShopDetailSheet (overlay portion)                                                                                                                                                                                                                                                                    | overlay backdrop `motion.div` (NOT the sheet body — that's spring, untouched) |
| `/devtools` or whatever route mounts StorageDebugPanel                              | StorageDebugPanel                                                                                                                                                                                                                                                                                                                                    | panel container `motion.div`                                                  |

**Output per surface:** list every measured node, its CSS selector or component name, and the captured `transition-duration` + `transition-property` values.

**Mandatory measurement granularity:** at least 1 node per migrated file. Some files have 2-3 transition sites; measure each.

If a surface route is unreachable in your test environment (auth gate, missing demo mode, etc.), state `<route>: not observable in runtime log` for every file mapped to that route. Those files become `not observable` for verdict purposes.

### Task 5 — S1 + S3 closure-proof (load-bearing; this is the real reason this prompt exists)

The two surfaces Phase 7.5 Sonnet falsified Class 1 against. **Both must measure `transition-duration === "0s"` under reduce.** Anything else closes nothing.

#### S1 — `BidCardArticle` hover under reduce

1. Navigate to `?demo=customer` (or any route that renders a bid list with at least one bid card)
2. Verify at least one `motion.article` element with class containing `bid-card` (or matching `BidCardArticle` source structure) is visible in the DOM
3. Set `prefers-reduced-motion: reduce`
4. Hover the card (Playwright `page.hover(selector)`)
5. While hovered, capture computed `transition-duration` of the `motion.article` element

**Expected (Phase 7.5 original FAIL verdict):** `transition-duration: 200ms`
**Required (this prompt PASS):** `transition-duration: 0s`

If the value is anything other than `0s` (including `200ms`, `0.2s`, `0.3s`, mixed-list with non-zero entries) → S1 FAIL. Quote the literal value.

#### S3 — `DashboardRouter` route transition under reduce

1. Navigate to a dashboard route (`?demo=customer`)
2. Identify the `motion.div` route container (DashboardRouter renders motion.div around the routed content)
3. Set `prefers-reduced-motion: reduce`
4. Trigger a route navigation (e.g. click a tab to switch between Bids → Reports → Account, or use the `setView` callback exposed)
5. During the transition (or immediately after; if your tool can't capture mid-transition, capture post-navigation), capture computed `transition-duration` of the route container `motion.div`

**Expected (Phase 7.5 original FAIL verdict):** `transition-duration: 0.2s` (inferred from same explicit-duration pattern as S1)
**Required (this prompt PASS):** `transition-duration: 0s`

If anything other than `0s` → S3 FAIL.

If your runtime tool cannot reliably capture the in-transition value, capture instead the steady-state computed `transition-duration` value on the routed `motion.div` after navigation completes — the migrated `transition` prop should produce `0s` regardless of in-flight state.

### Task 6 — Recovery check (emulation off)

Disable `prefers-reduced-motion` emulation. Reload. Re-visit:

- 3 surfaces from Task 4 (your choice; pick high-traffic: BidsScreen, AccountScreen, AdminDashboard)
- S1 (BidCardArticle hover)
- S3 (DashboardRouter route transition)

**PASS PER MEASUREMENT ONLY IF** `transition-duration` is now non-zero (e.g. `0.2s`, `0.3s`).

If any measurement still shows `0s` after emulation disabled → migration is over-applied and broke non-reduce motion → FAIL. This is the failure mode the v6 spec's "reverse smoke check" was designed to catch.

### Task NEW — Visual Integrity Sweep (the design-quality check)

Beyond `transition-duration`, the migrated motion must preserve the BD design system's visual identity. Check these per surface:

#### NEW.1 — No flash on mount under reduce

When a `motion.div` with `initial={{ opacity: 0 }}` mounts under reduce, the `useReducedMotion()` hook + `transition: { duration: 0 }` together should make the element appear at its final `animate` state IMMEDIATELY. Verify:

- Component should NOT briefly appear at `opacity: 0` and then snap to `opacity: 1`. If you see a flash (even 1 frame), it's a FAIL.
- For Playwright: capture a screenshot at `domcontentloaded` and at `networkidle`. Both should show the component fully visible. Compare via pixel diff or visual inspection.

Test surfaces (one each):

- BidsScreen (BidCardArticle initial mount)
- AccountScreen (AccountMenu initial mount)
- AdminDashboard (admin card stagger initial mount)

#### NEW.2 — No layout shift between reduce on/off

The DOM tree, element positioning, and styling should be byte-identical between `prefers-reduced-motion: reduce` and `prefers-reduced-motion: no-preference`. The only thing that should differ is whether transitions animate.

- Capture screenshot under reduce
- Toggle reduce off, reload, capture screenshot at the same scroll position
- Compare: any layout shift, repositioning, or styling change = FAIL

If your tool supports `pixelmatch` or similar, use a low-tolerance diff (≤ 0.5%). If not, visual inspection: focus on element positions, font rendering, color values.

Test surfaces (one each):

- LikedShopsScreen
- DashboardRouter post-navigation (settled state)

#### NEW.3 — BD design system intact

The KI-113 sweep should NOT have touched any visual styling. Verify on a representative sample:

- Gold lamp halos on landing warm-register sections (BenefitsSection, AboutOpportunitySection) — still rendered, still using `rgba(196, 144, 65, *)` color values
- Cyan section headings (per MOLANDJESUS canon) — still cyan
- Glass surfaces (`backdrop-filter: blur(*)`) — still rendered
- BD utility classes (`bd-*`) — still applied

If any visual regression observed (color drift, glass missing, layout broken) → FAIL.

#### NEW.4 — Interactive feedback preserved

Under reduce, the migration should make motion instant — but interactive feedback (hover state changes, focus rings, active states) must remain visible. Verify on:

- BidCardArticle: hover state still shows visual change (background, border, or other styling) — just not animated
- MobileBottomNav: tap state still shows pressed appearance — just snaps instead of springs (this was Sonnet S2 in Phase 7.5; should still PASS via MotionConfig wrap, but verify)
- Login form button: focus ring still visible, active state still shows

If any interactive state is invisible under reduce → FAIL (a11y regression: motion was reduced beyond what the contract required).

---

## Output Format (machine-parseable, exact shape)

```
=== KI-113 CLOSURE-PROOF VERIFICATION REPORT ===
Branch: BidOnDent-Horizon-Beta @ 11ecdafd
Pre-flight: PASS
Browser tool: <Playwright MCP | generic browser MCP | other>
Dev server: <port>

--- Task 4: Runtime DOM under reduce ---
Surfaces routes attempted: <count>
Surfaces routes reachable: <count>
Surfaces routes unreachable: <count> (reason: auth gate / missing demo mode / etc.)
Total motion elements measured: <count>
PASS elements: <count>
FAIL elements: <count>
Not observable: <count>

<for each surface route reached, list the measured nodes and their values:>
Route: <e.g., "?demo=customer">
  Element: <selector or component name>
  transition-duration: <verbatim value>
  transition-property: <verbatim value>
  Verdict: PASS | FAIL | not observable
[repeat per element]

--- Task 5: S1 + S3 closure-proof ---
S1 (BidCardArticle hover under reduce):
  Selector: <CSS selector used>
  Captured transition-duration: <verbatim value>
  Verdict: PASS | FAIL | not observable in runtime log

S3 (DashboardRouter route transition under reduce):
  Selector: <CSS selector used>
  Captured transition-duration: <verbatim value>
  Verdict: PASS | FAIL | not observable in runtime log

--- Task 6: Recovery (emulation off) ---
Surfaces re-checked: <count>
Recovery PASS: <count>
Recovery FAIL: <count>
S1 recovery transition-duration: <verbatim value>  (must be non-zero)
S3 recovery transition-duration: <verbatim value>  (must be non-zero)

--- Task NEW: Visual Integrity Sweep ---
NEW.1 No flash on mount: PASS | FAIL | not observable
  <if FAIL, name the surface and describe the flash>
NEW.2 No layout shift: PASS | FAIL | not observable
  <if FAIL, name the surface and describe the shift>
NEW.3 BD design system intact: PASS | FAIL | not observable
  <if FAIL, name the violation>
NEW.4 Interactive feedback preserved: PASS | FAIL | not observable
  <if FAIL, name the surface and the missing feedback>

=== VERDICT ===
VERDICT: CLEAN
```

OR

```
VERDICT: BLOCKED
```

**`VERDICT: CLEAN` requires ALL of:**

- Task 4: 0 FAIL elements (Not observable count is acceptable if the unreachable routes are auth-gated or missing demo modes; flag them but don't block)
- Task 5: BOTH S1 and S3 = `PASS` (not `FAIL`, not `not observable`)
- Task 6: 0 recovery FAIL; both S1 and S3 recovery measurements show non-zero transition-duration
- Task NEW.1, NEW.2, NEW.3, NEW.4: all `PASS` (or `not observable` only if the tool genuinely cannot measure that specific check, AND a manual visual sample by you confirms the spirit)

Anything else → `VERDICT: BLOCKED`.

---

## If `VERDICT: CLEAN` — Commit 10 (optional doc update)

Append the measured S1 + S3 values verbatim to `docs/OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md` close footer, after the existing close-footer content.

Diff shape (approximate; preserve existing content):

```markdown
[existing close footer content stays]

### Closure-proof runtime verification (added 2026-05-05 by post-pipeline Sonnet sweep)

**S1 — BidCardArticle hover under `prefers-reduced-motion: reduce`:**

- Captured `transition-duration: <S1_VALUE>` (verbatim)
- Verdict: PASS — closes Phase 7.5 falsification (original was FAIL at `200ms`)

**S3 — DashboardRouter route transition under `prefers-reduced-motion: reduce`:**

- Captured `transition-duration: <S3_VALUE>` (verbatim)
- Verdict: PASS — closes Phase 7.5 falsification (original was FAIL inferred from same explicit-duration pattern)

**Recovery check (emulation off):**

- S1 recovery `transition-duration`: `<S1_RECOVERY>` (non-zero confirms reduce-state was the only trigger)
- S3 recovery `transition-duration`: `<S3_RECOVERY>` (non-zero confirms reduce-state was the only trigger)

**Visual Integrity Sweep:**

- NEW.1 No flash on mount: PASS
- NEW.2 No layout shift: PASS
- NEW.3 BD design system intact: PASS
- NEW.4 Interactive feedback preserved: PASS

**Tool used:** `<Playwright MCP | etc.>`. **Tool log timestamp:** `<UTC timestamp from your runtime>`.

KI-113 closure proof now load-bearing: not just static substring presence, but runtime DOM measurement of the two specific failure surfaces Phase 7.5 falsified Class 1 against. Closure is honest.
```

Commit message (verbatim):

```
docs(verification): KI-113 closure-proof runtime verification — S1 + S3 PASS under reduce; closes Phase 7.5 falsification

Post-pipeline Sonnet runtime sweep verified the load-bearing surfaces
of KI-113's closure claim:

  S1 (BidCardArticle hover under reduce):
    transition-duration: <S1_VALUE>  (verbatim from runtime tool)
    Verdict: PASS (Phase 7.5 original: FAIL at 200ms)

  S3 (DashboardRouter route transition under reduce):
    transition-duration: <S3_VALUE>  (verbatim)
    Verdict: PASS (Phase 7.5 original: FAIL inferred)

Recovery check (emulation off): S1 → <S1_RECOVERY>; S3 → <S3_RECOVERY>
(both non-zero; confirms migration was reduce-only, not motion-killing).

Visual Integrity Sweep:
  NEW.1 No flash on mount: PASS
  NEW.2 No layout shift: PASS
  NEW.3 BD design system intact: PASS
  NEW.4 Interactive feedback preserved: PASS

KI-113 closure is now runtime-proven, not just static-substring-proven.

Tool: <browser MCP / Playwright>
Surfaces measured: <count> elements across <count> routes
0 FAIL elements; 0 recovery FAIL; 0 visual regressions.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Push.** Done.

---

## If `VERDICT: BLOCKED` — halt, do not commit

Report verbatim measurements + the specific FAIL surface(s) + your tool log. Return control to owner. Do not attempt to "fix" anything in `src/`. The KI-113 close commit (`6aff6593`) stays in git history claiming RESOLVED, but a follow-up amendment commit will document the regression. That's owner-decision territory, not yours.

---

## Hard Stops (return control immediately, no retry)

- Pre-flight any of 5 checks fails
- Browser tool unavailable or unreliable
- Tasks 4-6 cannot run because of dev-server / auth / route-resolution issues that block measurement
- Task 5 S1 OR S3 fails or is `not observable`
- Visual Integrity Sweep surfaces a regression you cannot definitively classify
- You catch yourself reasoning beyond literal measurement (e.g., "the value is 16ms but that's basically 0 so PASS" — NO. PASS only on `0s`)
- Two consecutive failed runs of the same measurement (browser flake)
- Owner sends new directive

On halt: log halt reason, leave branch in current state (do not revert anything), return control. Do not write to any file outside the optional Commit 10 docs append.

---

## Done When

- Either Commit 10 verification doc-only commit is created and pushed (`VERDICT: CLEAN`), OR
- Halt + report (`VERDICT: BLOCKED` or hard-stop)

Pipeline ends.
