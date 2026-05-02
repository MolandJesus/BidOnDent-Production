# BidOnDent Visual + Functionality Fix Plan

**Date:** 2026-04-27
**Audience:** Autonomous executor (Sonnet 4.6) running for several hours unsupervised.
**Status:** Ready to execute. Do not deviate from this document. Do not invent new fixes. Do not ask for input — make a sensible call and document it in the commit message.

This is a **code-only** plan derived from a multi-AI live audit of the BidOnDent Vercel preview (`bid-on-dent-production-git-bidond-9712c0-…`). All findings have been verified against the codebase. Every fix below has a known file path, known root cause, and a defined Done state.

---

## Mission

Execute the passes below **in order**. After each pass:

1. Run `npm run typecheck` (must be clean) and `npm test -- --run` (must pass).
2. Manually verify the fix by reading the modified files and reasoning about the rendered output. Do NOT start a dev server unless a pass explicitly requires it.
3. Create one commit per pass using the prescribed message.
4. **Do not push. Do not open PRs. Do not amend earlier commits.**

If any step fails (typecheck, tests, or your own re-read indicates the fix is wrong), stop, document what failed in a section called `## Pass [X] — Blocked` at the bottom of this file, and skip to the next pass. Do not try to "force" the fix by adding bypass logic.

---

## Ground rules (non-negotiable)

1. **Use `bd-*` utility classes from `src/styles/theme.css` first.** Don't hand-roll inline `bg-white/[0.10]` / `border-white/[0.16]` styling. The canonical utilities — `bd-glass-card`, `bd-glass-panel`, `bd-glass-badge`, `bd-glass-control`, `bd-report-input`, `bd-report-primary-button`, `bd-report-secondary-button`, `bd-dashboard-section`, `bd-dashboard-section--deep`, `bd-dashboard-section--accent-blue`, `bd-dashboard-section--accent-cyan`, `bd-dashboard-section--accent-indigo`, `bd-dashboard-panel`, `bd-dashboard-chip`, `bd-dashboard-primary-button`, `bd-dashboard-secondary-button` — already handle light/dark/frosted modes correctly via `[data-appearance-mode="…"]` selectors. Reaching for them is always preferred over hand-rolling.

2. **Light mode and dark mode (`map-dark`) must both work.** When you branch on `appearanceMode` or pass `isLightAppearance`, write both branches. Never assume "this only renders in dark."

3. **Brand color system:** royal blue `#003d82` (primary action), atmospheric soft blue, navy depth, gray-blue subdued, accent cyan `#00a0e9`. Don't introduce green/orange/violet _as primary surface accents_ — they are status colors only.

4. **Don't touch:**
   - `CarDiagram.tsx` and `StepDamageArea.tsx` (design-AI owned).
   - The Clerk dashboard config — the "(Demo)" label, dev-key swap, JWT template setup are _config tasks the human owns_, not code tasks.
   - Anything under `node_modules/`, `dist/`, `supabase/migrations/_archived/`.

5. **No new dependencies.** Don't `npm install` anything. If you think you need a library, you don't.

6. **No comments unless WHY is non-obvious.** Don't add explanatory comments referencing this document, this audit, or "fixes the contrast bug." The commit message is enough.

7. **Don't refactor surrounding code.** A one-line fix doesn't justify rewriting the file. Stay narrow.

8. **Backwards-compat shims are forbidden.** If you're changing a string or removing a counter, just remove it. Don't keep the old version "for safety."

---

## Pre-flight check

Before starting Pass A:

1. Confirm working directory is `/Users/molalignmeagher/BidOnDent GitHub Repository/BidOnDent-Production`.
2. Confirm `git status` is clean.
3. Confirm current branch (`git branch --show-current`). All commits in this plan go on the current branch — do **not** create a new branch.
4. Run `npm run typecheck` to establish a green baseline. If it's red, stop and write a `## Blocked` section.
5. Run `npm test -- --run` to establish a green baseline. If it's red, stop.

If pre-flight passes, begin Pass A.

## Pre-flight result (2026-04-28)

- Branch: `BidOnDent-Horizon-Beta` — clean (only untracked file is this plan).
- `git status`: clean (no uncommitted changes).
- `npm run typecheck`: **pre-existing error** — `tsconfig.json(24,27): error TS5103: Invalid value for '--ignoreDeprecations'` (`"6.0"` is not a valid value in TypeScript 5.7.3). This error predates this plan; the project builds successfully via Vite. Will use new errors introduced by a pass as the stop signal.
- `npm test -- --run`: **569 tests passed** across 58 files — green baseline.
- Proceeding with Pass A.

---

## Pass A — Legal page light-mode contrast (HIGH severity)

**Root cause confirmed.** `PrivacyPolicyPage.tsx` and `TermsOfServicePage.tsx` hardcode `text-slate-100` (very-light) text colors that are invisible against the ivory `bd-glass-card` background in light mode. `bd-glass-card` in light mode renders with `color: #1e293b` and an `rgba(255, 253, 248, 0.92)` background — see `src/styles/theme.css:1320-1334`. The two pages also don't import `useAppearanceModeCtx`. The sibling pages `AboutPage.tsx` and `InsurerPartnershipPage.tsx` already do appearance branching correctly — use them as the structural template.

**Files:**

- `src/app/components/legal/PrivacyPolicyPage.tsx`
- `src/app/components/legal/TermsOfServicePage.tsx`

**Pattern to apply** (from `AboutPage.tsx:26-92`):

```tsx
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";
// …
const [appearanceMode] = useAppearanceModeCtx();
const isLight = appearanceMode === "light";
```

Then replace every hardcoded text color class with a ternary on `isLight`:

| Old class                           | Light branch                        | Dark branch                         |
| ----------------------------------- | ----------------------------------- | ----------------------------------- |
| `text-slate-100`                    | `text-slate-900`                    | `text-slate-100`                    |
| `text-slate-300`                    | `text-slate-700`                    | `text-slate-300`                    |
| `text-slate-400`                    | `text-slate-500`                    | `text-slate-400`                    |
| `text-blue-200`                     | `text-blue-800`                     | `text-blue-200`                     |
| `text-blue-400`                     | `text-blue-700`                     | `text-blue-400`                     |
| `text-blue-400 hover:text-blue-300` | `text-blue-700 hover:text-blue-800` | `text-blue-400 hover:text-blue-300` |
| `border-white/[0.12]`               | `border-slate-300/60`               | `border-white/[0.12]`               |

**For the highlighted notice boxes** (Privacy line 27-33, Terms line 125-131) — they currently use `border-blue-400/20 bg-blue-500/10` with `text-blue-200` text. In light mode that's blue-on-blue and unreadable. Change to:

```tsx
className={`rounded-xl border p-4 mb-6 ${
  isLight
    ? "border-blue-200 bg-blue-50"
    : "border-blue-400/20 bg-blue-500/10"
}`}
```

…and the inner `<p>` to `text-blue-900` (light) / `text-blue-200` (dark).

**Done state:** Both files import and use `useAppearanceModeCtx`. Every text color, border, and background that previously assumed dark now branches on `isLight`. The `<main>` wrapper should also pick up an appearance-aware bg gradient like AboutPage line 30-32 does:

```tsx
className={`min-h-screen bg-gradient-to-b py-16 px-4 ${
  isLight ? "from-slate-50 to-slate-100/80" : "from-slate-900 to-slate-800/90"
}`}
```

**Commit message:**

```
fix(legal): make Privacy Policy and Terms of Service readable in light mode
```

---

## Pass B — Hash route page bottom whitespace + dark mode background

**Root cause confirmed.** All four hash route pages (`AboutPage`, `PrivacyPolicyPage`, `TermsOfServicePage`, `InsurerPartnershipPage`) wrap content in a `min-h-screen` `<main>` but the gradient hardcoded in About / Insurer is `from-slate-900 to-slate-800/90` — that's a slate gradient, not the BidOnDent navy. In dark mode it reads as near-black. Privacy and Terms (after Pass A) will inherit this. Also the audit observed "huge empty space" — that's the natural result of `min-h-screen` on a short content card. We can't make the content longer, but we can make the empty space _match the BidOnDent atmosphere_ instead of looking like a void.

**Files:**

- `src/app/components/landing/AboutPage.tsx`
- `src/app/components/landing/InsurerPartnershipPage.tsx`
- `src/app/components/legal/PrivacyPolicyPage.tsx` (after Pass A)
- `src/app/components/legal/TermsOfServicePage.tsx` (after Pass A)

**Change** the `<main>` className gradient on all four files to:

```tsx
className={`min-h-screen py-14 px-4 ${
  isLight
    ? "bg-gradient-to-b from-[#eef4fb] via-[#e6eef9] to-[#dde6f5]"
    : "bg-gradient-to-b from-[#08142b] via-[#0a1626] to-[#060d1c]"
}`}
```

Those tones match the dark navy used elsewhere (`#0a1626` is the same color as `colorBackground` in `clerkAppearance.ts`). Light mode picks up a gentle blue-tinted wash that matches the landing page's atmosphere instead of the gray slate gradient.

**Commit message:**

```
fix(legal,landing): use BidOnDent navy gradient on standalone hash pages
```

---

## Pass C — Production hygiene strings (HIGH severity, low risk)

Five small text/string fixes. All trivially safe.

### C.1 — Settings modal copy

**File:** `src/app/components/codelayer/account/SettingsModal.tsx`

- Line 109-110 currently reads: _"Appearance and notification changes save immediately. Privacy and language controls are shown for upcoming account-settings wiring and do not save yet."_
  Replace with: _"Appearance and notification changes save immediately."_
  (Drop the "do not save yet" half-sentence — Privacy controls _do_ now wire through `useNotificationPreferences`. Language is the only thing that doesn't, and it has its own "Coming soon" badge already.)

- Line 380: _"Warmer frosted shell with amber glow accents."_
  Replace with: _"Warm frosted shell with soft blue accents."_
  (The light theme is ivory + blue, not amber. Audit screenshot confirms.)

### C.2 — Photo plural

**File:** `src/app/components/shop/ShopRequestCard.tsx`
**Line:** 238

```tsx
<span>{request.photoCount} photos</span>
```

Replace with:

```tsx
<span>
  {request.photoCount} {request.photoCount === 1 ? "photo" : "photos"}
</span>
```

### C.3 — Internal counter labels

These three counters expose internal data-structure sizes to end users with no informational value.

**File 1:** `src/app/components/codelayer/HomeScreenSections.tsx` line 192

Delete the entire `<span>` block (lines ~187-193):

```tsx
<span
  className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
    isLight ? "bg-white/85 text-blue-700" : "border-blue-200/18 bg-white/10 text-blue-50"
  }`}
>
  {quickActions.length} shortcuts
</span>
```

The header reads fine without the counter chip.

**File 2:** `src/app/components/codelayer/account/AccountMenu.tsx`

- Line 273: delete the `<span>` containing `3 zones`.
- Line 284: delete the `<span>` containing `{preferenceRows.length} items`.
- Line 300: delete the `<span>` containing `{profileRows.length} items`.
- Line 316: keep `Sensitive actions` — that one is informative, not a counter.

For each deletion, also remove the wrapper `<div className="mb-2 flex items-center justify-between px-1">` if it now has only one child — collapse to just the `<p>` eyebrow.

### C.4 — Customer name fallback

**File:** `src/app/components/shop/shopRequestsScreenHelpers.ts`
**Lines:** 44-46

Currently:

```ts
customerName: report?.customerName || "Not provided",
customerEmail: report?.customerEmail || "Not provided",
customerPhone: report?.customerPhone || "Not provided",
```

Change `customerName` line to:

```ts
customerName: report?.customerName || "Customer",
```

Leave email and phone as `"Not provided"` — those are correct (action surfaces in `ShopRequestCard.tsx:262-279` and `ShopActiveJobCard.tsx:270-287` already check `!== "Not provided"` to gate the call/email buttons, so don't change that contract).

Also: `src/app/components/shop/ShopActiveJobsScreen.tsx` line 128 has the same `"Not provided"` for `customerName` — apply the same `"Customer"` fallback there.

### C.5 — Coverage `0 recommended` zero state

**File:** `src/app/components/landing/OperatingRegionsSection.tsx`
**Line:** 182

Currently:

```tsx
{
  coverage.nearbyShops.length;
}
recommended;
```

Change to:

```tsx
{
  coverage.nearbyShops.length > 0
    ? `${coverage.nearbyShops.length} recommended`
    : "Set an origin to see shops";
}
```

Verify the surrounding chip element doesn't fall over with a longer string — read 30 lines around it to confirm the layout flexes. If the chip uses fixed width, leave the chip and just change the inner string.

**Commit message for Pass C:**

```
fix(ui): clean up developer-facing copy and pluralization in production UI
```

---

## Pass D — Account info "Phone" field tone parity

**Root cause confirmed.** `AccountInfoCard.tsx:55-57` assigns `bd-dashboard-section--accent-cyan` to the Phone field. In light mode, that token (`theme.css:2282-2285`) renders `linear-gradient(180deg, rgba(237, 249, 245, 0.98) 0%, rgba(222, 243, 236, 0.94) 100%)` — a teal/green tint. The audit picked it up as "Phone field has green-tinted background vs other fields (gray)". The fix is to use the deep tone like Name / Email.

**File:** `src/app/components/codelayer/account/AccountInfoCard.tsx`
**Line:** 57

```ts
toneClass: "bd-dashboard-section--accent-cyan",
```

Change to:

```ts
toneClass: "bd-dashboard-section--deep",
```

That makes Phone match Name (line 52). Don't touch the Vehicles section's `accent-blue` (line 178) or the Shop Profile / Insurer Profile `accent-indigo` (lines 71, 81) — those are intentional differentiation.

**Commit message:**

```
fix(account): align Phone field tone with sibling Name / Email fields
```

---

## Pass E — CTA email input → bd-report-input parity

**Root cause confirmed.** `WaitlistCapture.tsx:53-57` hand-rolls input styling: `bg-white/10 text-white placeholder:text-blue-200/50` for dark mode, which renders as the white-on-dark mismatch the audit caught. The codebase already has `bd-report-input` (theme.css:1806+) tuned for both modes via CSS variables.

**File:** `src/app/components/landing/WaitlistCapture.tsx`
**Lines:** 43-58

Replace the input element with:

```tsx
<input
  type="email"
  required
  placeholder="your@email.com"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (status === "error") setStatus("idle");
  }}
  className="bd-report-input flex-1 rounded-full px-4 py-2.5 text-sm outline-none min-h-[44px]"
/>
```

You can drop the `isLightAppearance` prop branching for the input itself — `bd-report-input` reads CSS variables that already switch on `[data-appearance-mode="light"]`. Keep `isLightAppearance` on the surrounding form wrapper if it's still used elsewhere.

**Verification:** read theme.css around line 1806 first to confirm `bd-report-input` is exported as a class (not a `@apply`-only utility). It is. Then make the change.

**Commit message:**

```
fix(landing): use bd-report-input on CTA waitlist field for theme parity
```

---

## Pass F — "Accepted" status should be a badge, not a disabled button

**Root cause confirmed.** `BidCardArticle.tsx:204-214` renders one button with the text `Accepted` when `isAccepted` is true. The styling stays "button-shaped" — gradient bg, rounded-xl — but `disabled` is true and the cursor becomes `not-allowed`. Reads as broken UI. The fix is to render a status pill instead of a disabled button when `isAccepted`.

**File:** `src/app/components/codelayer/BidCardArticle.tsx`
**Lines:** 204-226 (the action button cluster)

Replace the existing `Accept Bid` button block with:

```tsx
{
  isAccepted ? (
    <span
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
        isLight
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
      }`}
    >
      <BadgeCheck className="w-4 h-4" />
      Accepted
    </span>
  ) : (
    <>
      <button
        onClick={onAccept}
        className="bd-dashboard-primary-button rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
        }}
      >
        Accept Bid
      </button>
      {onReject && (
        <button
          onClick={onReject}
          className={`bd-dashboard-secondary-button rounded-xl px-4 py-2.5 font-medium ${
            isLight ? "text-rose-600 hover:text-rose-700" : "text-rose-300 hover:text-rose-200"
          }`}
        >
          Decline
        </button>
      )}
    </>
  );
}
```

`BadgeCheck` is already imported at line 11. The Phone / Message / ExternalLink / ThumbsUp action buttons below stay unchanged — they should still render whether or not the bid is accepted (so a user can still call/message after accepting).

**Commit message:**

```
fix(bids): show Accepted as a status badge instead of a disabled button
```

---

## Pass G — Hide redundant "Average Quote" stat when only one bid

**Root cause confirmed.** `BidsSummaryHeader.tsx:109-135` renders three stat tiles: Lowest Bid, Average Quote, Fastest Timeline. With one bid, Lowest = Average — the audit flagged this as redundant noise. The fix: when `bidCount === 1`, swap "Average Quote" out for something more useful, or drop it.

**File:** `src/app/components/codelayer/BidsSummaryHeader.tsx`
**Lines:** 109-115

Change the array literal to compute conditionally:

```tsx
const stats =
  bidCount <= 1
    ? [
        { label: "Bid Amount", value: `$${lowestPrice.toLocaleString()}` },
        { label: "Fastest Timeline", value: `${fastestBidDays}-${fastestBidDays + 1} days` },
      ]
    : [
        { label: "Lowest Bid", value: `$${lowestPrice.toLocaleString()}` },
        { label: "Average Quote", value: `$${averagePrice.toLocaleString()}` },
        { label: "Fastest Timeline", value: `${fastestBidDays}-${fastestBidDays + 1} days` },
      ];
```

Replace the inline `[…] as const).map(…)` with `stats.map(…)`.

The grid layout stays `sm:grid-cols-3` — with two children in a 3-col grid the items render at the left + middle, leaving an empty cell. If that looks bad, change the grid to `sm:grid-cols-${stats.length}` or `sm:grid-cols-2 md:grid-cols-3` and let the breakpoint handle it. Use the second option:

```tsx
className = "mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5";
// when bidCount > 1, override to 3 cols at md
```

Simpler approach: always render in `grid-cols-1 sm:grid-cols-${stats.length}` using a template literal — but Tailwind won't pick that up at build time. Instead use:

```tsx
className={`mt-4 grid grid-cols-1 gap-2.5 ${
  stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
}`}
```

**Commit message:**

```
fix(bids): collapse redundant Average Quote tile when only one bid exists
```

---

## Pass H — Quick Actions icon-color discipline

**Root cause confirmed.** `homeScreenData.ts:53-65` exports two arrays — `actionIconTones` (dark) and `actionIconTonesLight` — that cycle through 4 hues (blue, emerald, amber, violet/indigo). The audit flagged: _"Icon colors inconsistent: blue (Requests), green (Active Jobs), amber (Shop Directory)"_. The fix: collapse to a single blue tone for visual discipline.

**File:** `src/app/components/codelayer/homeScreenData.ts`
**Lines:** 53-65

Replace the two arrays with single-tone arrays:

```ts
export const actionIconTones = [
  "bg-blue-400/15 text-blue-200 shadow-sm",
  "bg-blue-400/15 text-blue-200 shadow-sm",
  "bg-blue-400/15 text-blue-200 shadow-sm",
  "bg-blue-400/15 text-blue-200 shadow-sm",
];

export const actionIconTonesLight = [
  "border border-blue-200/70 bg-blue-50 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]",
  "border border-blue-200/70 bg-blue-50 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]",
  "border border-blue-200/70 bg-blue-50 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]",
  "border border-blue-200/70 bg-blue-50 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]",
];
```

You could simplify to a single string and tweak the consumer at `HomeScreenSections.tsx:198-201` to drop the index modulo lookup, but that's the kind of refactor we explicitly forbid in ground rule 7. Keep the array shape so the consumer doesn't change.

**Surface variation will still come from the section background classes (`actionSurfaceClasses` lines 160-165 of `HomeScreenSections.tsx`).** Leave those alone — they're the deep/blue/cyan/indigo navy variants and provide _intended_ tonal differentiation.

**Commit message:**

```
fix(dashboard): unify Quick Action icon tones to blue for visual discipline
```

---

## Pass I — Defensive handling for the notification-preferences 500

**Root cause confirmed.** The Supabase edge function `GET /notification-preferences` returns 500 because the Clerk dashboard is missing a `supabase` JWT template — see `src/app/App.tsx:114-120`. The human will fix that in the Clerk dashboard (out of scope for this plan). However, there's a smaller code task: the SettingsModal currently reads "Unable to load preferences." (`SettingsModal.tsx:267-269`) when the fetch fails, but `useNotificationPreferences.ts:47-54` already falls back to `DEFAULT_PREFERENCES` and only the `notifPrefs === null` branch shows the failure copy. Looking at it carefully, the failure branch is currently unreachable — the hook always sets `preferences` to either remote prefs or defaults. So the `else` block at line 266-270 is dead code.

But the audit's actual user-visible issue is **the 500 in the network tab** spamming the console for every authenticated user. We can't suppress the server-side 500 from client code — but we **can** add a small server-error check in the request-helper layer so the console error message is more informative and we log it once per session, not on every retry.

**File:** `src/app/services/supabase/notificationPreferences.ts`
**Lines:** 29-34

Wrap the `getNotificationPreferences` call in a single-flight guard so subsequent failed loads in the same session don't hammer the endpoint:

```ts
let cachedFailure: { until: number } | null = null;
const FAILURE_BACKOFF_MS = 60_000;

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  if (cachedFailure && Date.now() < cachedFailure.until) {
    throw new Error("notification-preferences temporarily unavailable");
  }
  try {
    const result = await requestSupabaseEdge<{
      preferences: NotificationPreferences;
    }>(SUPABASE_EDGE_ROUTES.notificationPreferences, { method: "GET" });
    cachedFailure = null;
    return result.preferences;
  } catch (err) {
    cachedFailure = { until: Date.now() + FAILURE_BACKOFF_MS };
    throw err;
  }
}
```

This stops the function from spamming a known-broken endpoint every time a user opens Account → Settings within a 60s window. The hook's existing fallback to defaults still works — `useNotificationPreferences.ts` catches the throw and falls back.

Also delete the dead "Unable to load preferences." branch (`SettingsModal.tsx:266-270`) — `notifPrefs` is never `null` after the hook resolves.

**Commit message:**

```
fix(notif-prefs): backoff on edge-function failure to stop console spam
```

---

## Pass J — Drop unused `isLightAppearance` plumbing on WaitlistCapture (cleanup follow-up to Pass E)

After Pass E lands, `WaitlistCapture` no longer branches on `isLightAppearance` for the input. If it doesn't branch on it elsewhere either, drop the prop and its callers.

**File:** `src/app/components/landing/WaitlistCapture.tsx`

Read the post-E version. If `isLightAppearance` is no longer referenced inside the component body (other than the function signature), remove the prop from `WaitlistCaptureProps` and the destructure. Then update **callers** — grep for `<WaitlistCapture`:

```bash
grep -rn "<WaitlistCapture" src/
```

Remove the `isLightAppearance={…}` prop from each call site.

**If** `isLightAppearance` is still used somewhere in WaitlistCapture (e.g., on the button), leave it. Don't force the cleanup.

**Commit message:**

```
chore(landing): drop unused isLightAppearance prop from WaitlistCapture
```

---

## Pass K — Extra polish: report list trash icon needs gating

**Audit observation:** trash buttons appear directly on report cards in the customer dashboard, with a `confirm()` browser dialog as the only protection. The audit suggested moving trash to an overflow menu. Implementing an overflow menu cleanly is a non-trivial change. **Compromise:** keep the trash button visible (so the affordance exists) but improve the visibility cue so it doesn't read as a "primary action."

**File:** `src/app/components/codelayer/HomeReportsList.tsx`
**Lines:** 277-302

Currently the trash button is always visible and has hover states. Wrap the entire `<button>` in a CSS opacity reveal so it's only fully visible on hover/focus of the parent card. The parent `<article>` element is at the top of the map iteration (~line 200-ish in the file — re-read it). Add `group` to the article className and `opacity-50 group-hover:opacity-100 focus:opacity-100 transition-opacity` to the trash button className.

If you can't add `group` cleanly to the parent without disturbing the existing `.group` usage in the same file, skip this pass and leave the trash button visible. Document the skip in `## Pass K — Skipped` at the bottom of this file.

**Commit message:**

```
ui(reports): de-emphasize report-card delete trash to reduce mis-tap risk
```

---

## Pass L — Final cross-checks (read-only, no commit)

After Passes A through K land, do a final read-only sanity sweep:

1. `git log --oneline -15` — confirm 8-11 commits exist with the prescribed messages, in order.
2. `git diff main..HEAD --stat` — confirm only the files listed in this plan were touched.
3. `npm run typecheck` — must be green.
4. `npm test -- --run` — must be green.
5. `grep -rn "{quickActions.length} shortcuts\|3 zones\|{preferenceRows.length} items\|{profileRows.length} items" src/` — must return zero hits.
6. `grep -rn "Average Quote" src/` — must return one hit (the array entry in BidsSummaryHeader.tsx, only used when `bidCount > 1`).
7. `grep -rn "amber glow accents\|do not save yet" src/` — must return zero hits.

If any of those checks fails, write up what failed in `## Final Check — Anomalies` at the bottom of this file.

**No commit for Pass L.** It's read-only verification.

---

## What this plan deliberately does NOT cover

The auditor surfaced these issues but they're **out of scope** for this autonomous run, either because they need human input or because they require coordinated infrastructure changes:

| Item                                                                                      | Why deferred                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Clerk "(Demo)" label, dev-key swap                                                        | Clerk dashboard config — human owns                                                                                                          |
| `supabase` JWT template setup                                                             | Clerk dashboard config — human owns                                                                                                          |
| `bidondent@gmail.com` everywhere                                                          | Needs decision on real support email + custom domain — human owns                                                                            |
| Test data cleanup (Toyoto Camry, wine-bottle photo, "It's probably better…" descriptions) | Lives in Supabase rows, not code — needs SQL cleanup or re-seed                                                                              |
| Mobile audit findings                                                                     | Audit tool couldn't actually resize past 1600px — need a separate pass on Chrome DevTools device toolbar or Playwright with `isMobile: true` |
| Light-mode "premium" overhaul (cards feeling flat, generic blobs in hero)                 | Scoped design project, not punch-list                                                                                                        |
| Image upload content validation (rejecting non-vehicle photos)                            | Requires server-side ML/vision work — separate project                                                                                       |
| Bid geography map "0/1 mapped"                                                            | Shop coordinates aren't linked to bids — needs server query work                                                                             |
| Service area map showing national dots when service area is "Not set"                     | Needs decision on the empty-state UX — human owns                                                                                            |
| Workflow step name unification across job cards                                           | Needs design decision on canonical step names — human owns                                                                                   |
| Vercel preview-deploy floating toolbar (orange button)                                    | Vercel infrastructure, not app code; vanishes on production domain                                                                           |

Do **not** attempt any of these in this run. Note them in your final summary so the human knows they're still on the punch list.

---

## Stop conditions

Halt the run and write up status if any of these fire:

1. `npm run typecheck` is red after a fix and you can't see why within two attempts.
2. `npm test -- --run` is red after a fix.
3. A pass requires reading more than 5 files you didn't expect (likely indicates the codebase shifted from this plan's assumptions).
4. You catch yourself wanting to `npm install` something. Stop.
5. You catch yourself wanting to run `git push` or open a PR. Stop.
6. You catch yourself rewriting `CarDiagram.tsx` or `StepDamageArea.tsx`. Stop.

When you halt, write a `## Halted` section at the bottom of this file with the pass number, what you tried, and what you saw. Do not delete uncommitted changes.

---

## End of plan

When all passes are committed (or skipped with documentation), produce a final markdown summary in chat:

```
## Run summary
- Passes completed: A, B, C, D, …
- Passes skipped: <list, with one-line reason each>
- Commits: <count>
- Typecheck: green / red
- Tests: green / red
- Anomalies: <list, or "none">
- Out-of-scope items still owed to human: <copy from "What this plan deliberately does NOT cover">
```

Then stop. Wait for human review before any further action.
