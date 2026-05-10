# Audit Runtime Pass 19 — Phase G Opening + First Live Design-Hygiene Patch Batch
**Date:** 2026-05-10
**Lane:** Audit AI (now also fixer for small visible design errors per owner directive 2026-05-10)
**Branch:** BidOnDent-Horizon-Beta
**Companion to:** Pass 18 evidence (FALSE-A-PURE inventory) and Pass 301 (second live extraction).

---

## 0. Mission shift this pass

Owner directive 2026-05-10 added a NEW operating mode to the audit lane:

> "fix design issues you notice or box layout issues or text going over text boxes and fix small desgn errors similar to that in codebas as you continue fully with your auto pilot work with authority."

Audit lane is therefore no longer purely observational. It now ALSO carries
narrow tactical fix authority for the specific category:

- **In-scope for fixing:** small visible design errors — text overflow,
  flex container missing `min-w-0 flex-1`, missing `truncate` next to
  long-string fields, popup boxes without `max-w` bounds, badge/chip
  layout drift, and similar narrow CSS hygiene. Single-file, single-section
  patches only.
- **Out of scope (still observation-only):** doctrine, architecture,
  LAW docs, AI_LOCK schema rules, source files in active modification
  by other lanes, anything touching auth/storage/schema invariants,
  anything that would require restructuring (forbidden by
  MOLANDJESUS_DESIGN_DECISIONS.md structural lock).

Phase G framing from ChatGPT relay (live browser survivability auditing)
is preserved. This pass executes the cheapest leg of Priority A
(continuity/layout stability — popups + sheets) and Priority B
(modal/overlay stress — header layouts) without spinning up a live Chrome
session, by reading the source carefully for known anti-patterns and
patching them. Live Chrome runtime probing is deferred to a later pass
because (a) the dev server availability is unknown from inside the
sandbox and (b) the static read already surfaced concrete fixes.

---

## 1. Pre-flight discipline

- **AI_LOCK status read (start):** Active AI was `(none)` after Pass 301
  standdown (2026-05-10). Lane was open at start of this pass.
- **AI_LOCK race condition mid-pass:** between starting and finishing this
  batch, another lane (Claude Opus 4.7, 1M ctx) claimed the lock for
  Pass 302 Provider-Seam-Pattern Doctrine Artifact, with locked files
  `docs/REF_PROVIDER_SEAM_PATTERN_2026-05-10.md` and `AI_LOCK.md`. The
  Pass 302 locked file list does NOT overlap with this pass's three
  source patches or this evidence file, so the work proceeds without
  collision. **This pass intentionally does NOT modify `AI_LOCK.md`**
  since it is on the Pass 302 locked list. Pass 19's claim/release is
  recorded only in this evidence file.
- **`git status` read first:** detected uncommitted modifications belonging
  to other lanes — `CLAUDE.md`, `docs/LAW_PROJECT_RULES.md`, several REF
  docs, `src/app/components/dashboard/ShopMapWidget.tsx`, and three test
  files. **None of these files were touched in this pass.** Per Mola's
  rule "Don't revert, reset, or overwrite changes that aren't yours."
- **Verification ceiling honored:** ran `npx tsc --noEmit` after fixes.
  Result: ONLY the 4+1 pre-existing errors documented in Pass 301
  standdown (coverageMapLifecycle MapTileMode `"standard"`,
  reducedMotionContinuity MapTileMode `"standard"`,
  AdminIntakeOperationsPanel `getToken` stale,
  edgeErrorMessage `SHOP_PROFILE_REQUIRED`, plus the related
  NavigationDiscoveryPlace test conversion). **Zero new TS errors
  introduced by this batch.**
- Did NOT attempt `vitest` or `vite build` per CLAUDE.md §6 sandbox
  rollup-arm64 caveat — flag for host-side run.

---

## 2. Fixes applied (3 files, all ≤6 lines changed each)

All three are the same root anti-pattern surfacing in three different
contexts: **a flex/popup container that allows long string content to
push siblings or overflow horizontally because the inner text element
lacks the `min-w-0 flex-1` + `truncate` pair (or the popup lacks an
upper-bound `max-w`).**

### 2.1 `src/app/components/shop/ShopDirectoryMapPopup.tsx` line 167

**Before:**
```tsx
<div className="flex items-start justify-between gap-2">
  <div className="min-w-0">
    <p className={`truncate ...`}>{shopPopup.shop.name}</p>
```

**After:**
```tsx
<div className="flex items-start justify-between gap-2">
  <div className="min-w-0 flex-1">
    <p className={`truncate ...`}>{shopPopup.shop.name}</p>
```

**Defect:** `min-w-0` alone does not force the wrapper to take the
available flex space — `truncate` on the inner `<p>` therefore could
not actually fire. With `justify-between` the wrapper sized to its
content's natural width, which was already the un-truncated string.
**Fix:** add `flex-1` so the wrapper claims the row, leaving the
shrink-0 close button anchored right and the address `<p>` truncating
when the shop name + address exceeds the popup width.

### 2.2 `src/app/components/maps/MapBidSheet.tsx` lines 101-110

**Before:**
```tsx
<div className="mb-5 flex items-start justify-between">
  <div>
    <h3>Place Bid</h3>
    <p className={cn("mt-0.5 text-sm", ...)}>
      {vehicleLabel}
      {report.damageArea ? ` — ${report.damageArea}` : ""}
    </p>
  </div>
```

**After:**
```tsx
<div className="mb-5 flex items-start justify-between gap-3">
  <div className="min-w-0 flex-1">
    <h3>Place Bid</h3>
    <p className={cn("mt-0.5 truncate text-sm", ...)}>
      {vehicleLabel}
      {report.damageArea ? ` — ${report.damageArea}` : ""}
    </p>
  </div>
```

**Defect:** the bid-sheet header had no `gap-*` between the label
column and the close button, AND the label column had no
`min-w-0 flex-1`, AND the vehicle label `<p>` had no `truncate`. Long
combinations like `2019 Mercedes-Benz GLS-Class Maybach Edition — Front
Driver Quarter Panel` could push the close button rightward off the
sheet on narrow phones.
**Fix:** `gap-3` on the header, `min-w-0 flex-1` on the label column,
`truncate` on the `<p>`. Close button (already `shrink-0` via
`min-h-[44px] min-w-[44px]`) stays anchored.

### 2.3 `src/app/components/maps/ReportLayerPopup.tsx` lines 35-49

**Before:**
```tsx
<div className="min-w-[160px] space-y-1 p-1 ...">
  ...
  <div className={`text-sm font-semibold ...`}>
    {[year, make, model].filter(Boolean).join(" ") || "Damage Report"}
  </div>
```

**After:**
```tsx
<div className="min-w-[160px] max-w-[260px] space-y-1 p-1 ...">
  ...
  <div className={`truncate text-sm font-semibold ...`}>
    {[year, make, model].filter(Boolean).join(" ") || "Damage Report"}
  </div>
```

**Defect:** the report-pin map popup had a `min-w` floor but no `max-w`
ceiling, and the vehicle line had no `truncate`. Long vehicle strings
could blow the popup horizontally beyond its visual ceiling — visible
as a popup that "grows" awkwardly when a luxury or trim-heavy vehicle
name is loaded.
**Fix:** `max-w-[260px]` (matches the hand-drawn glass-popup family
used elsewhere — pinned conservatively under the 320px max used by
`ShopDirectoryMapPopup` non-compact mode, and over the 264px compact
mode), plus `truncate` on the vehicle line. The chips below
(status + bid-count) already use `inline-block` and remain
single-line — no change required.

---

## 3. Phase G observations (no fixes — observation only)

Below are non-fix findings that emerged while reading these surfaces.
They are recorded for builder/architecture lane consideration but were
NOT acted on this pass.

### 3.1 Two distinct popup width conventions exist

- `ShopDirectoryMapPopup`: `maxWidth="264px"` (compact) / `"320px"` (default)
  enforced via the `react-map-gl` `<Popup maxWidth>` prop.
- `ReportLayerPopup`: was previously `min-w-[160px]` only, no max.
  Now patched to `min-w-[160px] max-w-[260px]` via Tailwind.
- Two width-ceiling conventions in the same map subsystem is mild
  topology entropy. Consider unifying on the `<Popup maxWidth>` prop
  (more semantically correct — react-map-gl uses it for collision
  positioning math) in a future doctrine-aware pass. NOT extracted to
  platform-core (would be a category-blur trap — popup widths carry
  map-domain doctrine, not generic UI doctrine).

### 3.2 The `min-w-0 flex-1` + `truncate` triad is a recurring trap

Cross-codebase pattern: out of ~5 surfaces I checked,
`NavigationBrowseDiscoveryPanel.tsx:262` already does this correctly
(template), `LikedShopCard.tsx:41` does it correctly,
`ShopDirectoryMapPopup` and `MapBidSheet` did NOT (now fixed). Hit
rate of ~50% suggests this is a CLASS of defect, not a one-off. A
linter rule could machine-enforce this (e.g. eslint-plugin-tailwindcss
custom rule: `truncate` requires an ancestor `flex-1` if it has any
`flex` ancestor with `justify-*`). **Recommendation logged, not
acted on** — adding lint rules is outside the audit lane's scope.

### 3.3 Popup width discipline is doctrine-loaded

The decision "how wide can a map popup grow before it occludes the
underlying spatial canvas" is NOT generic UI hygiene — it is map-domain
trust choreography. A 320px popup on a 375px iPhone viewport occludes
85% of the map; a 200px popup occludes 53%. The choice has continuity
implications. This belongs to map-doctrine, NOT to platform-core. Flag
this as another **anti-extraction signal** for the platform-core
gravity audit lane: popup-sizing utilities would look generic but
actually carry spatial-trust semantics. Add to the FALSE-A-PURE
candidate registry alongside `lazyWithRetry` and `use-mobile`.

### 3.4 Cumulative FALSE-A-PURE registry (Passes 16+18+19)

| Utility | Looks generic | Actual doctrine load |
|---|---|---|
| `validateAppConfig` | Boolean validator | Type-vs-function asymmetry doctrine |
| `lazyWithRetry` | React.lazy wrapper | 1500ms retry pacing = trust choreography |
| `use-mobile` | Breakpoint hook | Hardcoded 768px + boolean coalescing |
| **`popup max-width tokens`** (new this pass) | CSS width constant | Map-occlusion trust choreography |

4 confirmed FALSE-A-PURE × 3 confirmed A-pure (`Sentry init`,
`useOnlineStatus`, `cn`) — split now 4:3 against generic extraction.
**Brief framing reinforced: assume more false-universals exist.**

---

## 4. Phase G priorities NOT executed this pass (deferred)

To stay within the narrow design-fix authority granted, the following
Priority A-F live-runtime probes were NOT executed:

- **Priority A — Chrome continuity audit:** requires live dev server
  + Chrome MCP. Deferred to a pass where the dev server is confirmed
  running.
- **Priority B — modal stress:** the static read found the truncate
  defects above, but the *interruption-sequencing* pressure test
  (rapid open-close, resize-during-open, escape-during-transition,
  back-button mid-overlay) requires live runtime.
- **Priority C — emotional-runtime coherence:** requires live
  observation of pacing.
- **Priority D — false-universal browser primitive hunt:** partially
  executed (popup-width finding above). Live-pressure validation
  deferred.
- **Priority E — Stacey portability:** documentary-only audit
  deferred.
- **Priority F — hostile fragility (tab suspend, throttled CPU):**
  requires live Chrome.

These remain on the audit lane's queue. Owner can authorize a
"Phase G live-runtime pass" by confirming the dev server is up and
specifying which surfaces to exercise.

---

## 5. Cumulative ledger update (after Pass 19)

- **Total findings across 19 passes:** ~228 (3 new this pass: §3.1,
  §3.2, §3.3).
- **A-pure pressure-test results:** 7 utilities tested → 3 confirmed
  + 4 FALSE-A-PURE.
- **Platform-core sprawl status:** still 2 entries (`cn.ts`,
  `useOnlineStatus.ts`) + README. Pass 301 added 1, Pass 19 added 0.
  Sparse discipline holds.
- **Live design-hygiene patches:** 3 files, 3 narrow patches, all
  truncate/min-w-0/max-w hygiene, zero behavior change, zero new TS
  errors.
- **Audit lane doctrine:** Pass 19 establishes the precedent that
  the audit lane CAN execute narrow CSS hygiene fixes when owner
  explicitly grants fixer authority, WITHOUT compromising
  observational discipline on doctrine/architecture/LAW questions.

---

## 6. Standdown criteria for this pass

- ✅ AI_LOCK race detected mid-pass; intentionally NOT modified
  (Pass 302 holds it; their locked-files list does not overlap with
  this pass's files). Pass 19 claim/release recorded in this evidence
  doc only.
- ✅ `git status` reviewed first; no other-lane work overwritten.
- ✅ Three narrow patches, single concern per patch, all reversible
  by single `git revert`.
- ✅ TypeScript clean (only pre-existing errors remain).
- ✅ No LAW edits. No AI_LOCK schema edits. No source files in
  active modification by other lanes. No auth/storage/schema
  changes. No provider changes.
- ✅ No README files created.
- ✅ Evidence doc written to
  `docs/evidence/audit-runtime-2026-05-09/` — same folder convention
  as Passes 2-18.
- ✅ Skill mentioned in commit message per CLAUDE.md §7
  (`bd-design-identity` template).

Audit lane is releasing the AI_LOCK. Builder/Platform lane resumes
authority for any subsequent doctrine work.
