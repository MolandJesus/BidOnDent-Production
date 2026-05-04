# Autopilot Session — 2026-05-05 Functionality Sweep, Part 2

**Branch:** `BidOnDent-Horizon-Beta`
**Owner directive:** "Autopilot re-authorized. New scope: landing section border issue. F-16 smoke test gate temporarily lifted. Diagnose-first protocol required."
**Span:** Pass L (KI-104) → KI-100 diagnose-only → this report
**Commits this session:** 2 (range `6b96c22b → <this commit>`)

---

## Summary

Sustained autopilot continuation from Part 1. Two outputs:

1. **Pass L** (commit `6b96c22b`) — fixed the visible "border stripe" at landing section transitions that persisted after Pass K. Diagnose-first protocol per owner brief identified two root causes; minimum-change structural fix shipped in single commit.
2. **KI-100 diagnose-only** (this report) — no patch. Confirms pre-requisites are partially met, scopes the 20-file refactor in detail, surfaces 5 open questions requiring owner input before patch authorization.

---

## Pass L — Landing section "border stripe" fix (KI-104)

**Commit:** `6b96c22b`
**Files:** 2 (`src/styles/theme.css` + `docs/REF_KNOWN_ISSUES.md`)

### Diagnose findings

Owner reported a visible darker horizontal stripe between landing sections, especially in dark mode, despite Pass K (KI-094) having trimmed seam-fade height + bumped alphas.

**Three compounding causes** (matching owner's hypothesis brief #2 + #4 plus a third I surfaced):

1. **Hypothesis #4 confirmed** — `.bd-landing-seam-fade` was a SIBLING block element BETWEEN sections in [LandingPageLayout.tsx](src/app/components/app/LandingPageLayout.tsx). Its gradient rendered in empty layout space rather than bridging across the section boundary.

2. **Hypothesis #2 confirmed** — adjacent section bg gradients have mismatched endpoint colors. Worst at warm↔cool transitions in dark mode (HowItWorks→Benefits, Benefits→WhoWeServe, AboutOpp→TrustStats, TrustStats→OperatingRegions).

3. **Self-inflicted darkening layer** — the seam-fade had a `linear-gradient(to bottom, ...)` navy layer at center: `rgba(8,16,32,0.38)` dark / `rgba(15,30,60,0.12)` light. The navy color (`#081020`) is DARKER than every section bg in dark mode. So the seam-fade was visibly DARKENING the boundary area below adjacent section colors — _creating_ the very stripe owner was seeing.

**Hypothesis #1 ruled out** — no explicit `border-t/-b/-y` Tailwind classes on any of the 8 section wrappers (verified via grep).

### Fix shipped

Single coherent structural change to `.bd-landing-seam-fade`:

- **Negative-margin overlap** — added `margin-top: -36px; margin-bottom: -36px;` so the seam-fade overlaps adjacent sections by 36px each side. Turns it from a between-band into a true bridge: gold radial center sits exactly at the section boundary, soft-lighting ACROSS rather than DARKENING BETWEEN.
- **Drop the navy linear layer entirely** (light + dark register). Gold radial alone IS the bridge.

Gold radial alphas UNCHANGED from Pass K (0.13/0.04 light, 0.20/0.06 dark) — well under the 0.22a single-layer halo cap. Pass K spacing UNCHANGED. HeroSection UNTOUCHED. Position/z-index/pointer-events behavior preserved.

### Verification

- `npm run build` clean (3817.64 KiB precache stable, -0.07 KiB from KI-097 baseline)
- Branch-aware forbidden grep ZERO
- Pre-existing IDE diagnostics at L453/L483/L2555/L2685 UNCHANGED — documented in audit, not caused by this edit

---

## KI-100 Diagnose-Only Report — full Supabase swap for shop directory

**Status:** Diagnose complete. **No code changes made.** 5 owner-decision blockers identified before patch can proceed.

### Pre-requisite check

| Pre-req                                                | Status                       | Evidence                                                                                                                                                                     |
| ------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public_partner_shops` table exists in migration       | ✅ Confirmed                 | [supabase/migrations/20251230000001_full_schema.sql:400-422](supabase/migrations/20251230000001_full_schema.sql#L400) — full schema, indexes on `is_active` + `zip_code`     |
| RLS enabled with public-read policy                    | ✅ Confirmed                 | Migration L543 (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`) + L776-779 (`SELECT` policy for public read)                                                                      |
| Existing query infrastructure                          | ✅ Confirmed                 | [src/app/services/supabase/map.ts:152](src/app/services/supabase/map.ts#L152) `getPublicPartnerShops()` returns `Promise<PartnerShopMapRecord[]>`, awaited, error-handled    |
| Working consumer pattern                               | ✅ Confirmed                 | [src/app/hooks/useCoveragePartnerShops.ts](src/app/hooks/useCoveragePartnerShops.ts) — landing already uses this; useState + useEffect + DEV fallback. Proven model to copy. |
| **Production DB has ≥1 row in `public_partner_shops`** | ⏳ **Owner action required** | Cannot verify from code. SQL: `SELECT COUNT(*) FROM public.public_partner_shops WHERE is_active = TRUE;`                                                                     |

### Schema gap analysis — `public_partner_shops` vs `marketSeedShops.ShopProfile`

The current dashboard `ShopRecommendation` type has rich fields. The prod `public_partner_shops` table has fewer.

**Available in prod table:**
`shop_name`, `address/city/state/zip`, `latitude/longitude`, `specialties[]`, `rating` (NUMERIC), `phone_number`, `email`, `is_active`, `created_at`, `updated_at`

**Missing from prod table** (currently sourced from seed data):
`reviews` (count), `distanceMiles` (derivable from lat/lng), `completionRate`, `certifications[]`, `capabilityTags[]`, `supportedMakes[]`, `insurerPrograms[]`, `aiSummary`, `capacityBand`

The full Supabase swap requires one of:

- **(i)** Schema extension migration to add the missing columns (significant work, owner action)
- **(ii)** Map seed-style defaults onto missing fields (partial fidelity loss)
- **(iii)** Drop missing-data features from the UI (graceful degradation — simpler ranking, no certifications shown, etc.)

### Refactor scope (~20 files)

Sync→async swap blast radius identified via grep:

**Service layer (1 file):**

- [src/app/services/intelligence/marketIntelligence.ts](src/app/services/intelligence/marketIntelligence.ts) — `getShopDirectory()` + `buildShopRecommendations()`. Currently sync. Need async variants OR full async conversion.

**Component layer (~15 files):**

- `MapLibreReportLayer.tsx`, `ImmersiveMapResultsDrawer.tsx`, `ShopDirectoryHybridStage.tsx`, `LikedShopCard.tsx`, `MapLibreShopDirectoryViewportManager.tsx`, `GuidanceArrivalSection.tsx`, `ShopDirectoryHero.tsx`, `ShopDirectoryMapInfoPanel.tsx`, `ShopDirectoryListBody.tsx`, `useShopMapInteraction.ts`, `LikedShopsScreen.tsx`, `ShopDirectoryIntelligencePanel.tsx`, `ShopDirectoryMapPopup.tsx`, `ShopDirectoryMapOverlays.tsx`

**Type/helper files (~4 files):**

- `shopDirectoryImmersiveMapTypes.ts`, `shopDirectoryRoutePanelUtils.ts`, `shopDirectoryGuidanceCardHelpers.ts`, `shopDirectoryScreenUtils.ts`

### Recommended phased decomposition

**NOT a single autopilot commit. Owner-authorized stages.**

| Phase                    | Scope                                                                                                                                                                                                                                  | Risk                                | Owner gate                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| **1 — Foundation**       | Add `buildShopRecommendationsAsync()` alongside existing sync. Calls `getPublicPartnerShops()` + maps to `ShopRecommendation[]` with seed-style defaults for missing fields. Keep sync version as `import.meta.env.DEV` fallback only. | Low (1 file, additive)              | Diagnose questions answered                     |
| **2 — First consumer**   | Convert `ShopDirectoryHybridStage` (main shop browsing screen) to use async path with useState + useEffect + loading + empty state. Pattern matches `useCoveragePartnerShops` exactly.                                                 | Medium (1 component + state design) | Phase 1 verified working                        |
| **3 — Consumer rollout** | Convert remaining ~14 components in waves of 3-4 per commit. Each commit: own scope, own KI, "one bug, one commit."                                                                                                                    | Medium per wave                     | Each wave: build clean + grep ZERO + smoke test |
| **4 — Flag flip**        | Once all consumers are async + receiving real data, change `SHOP_DIRECTORY_IS_PREVIEW` from `true` to `shops.length >= MIN_REAL_SHOPS_PER_REGION`. Banner auto-disappears as shops onboard per region.                                 | Low (1 file, 1 line)                | Owner approves real-shops display               |
| **5 — Schema decision**  | Owner picks (i) extend schema, (ii) seed-default mapping, or (iii) feature drop. Phase ordering depends on choice.                                                                                                                     | Variable                            | Owner decides                                   |

### Open questions blocking patch authorization

1. **Production DB row count in `public_partner_shops`** — if zero, the swap ships an empty marketplace which fails the same trust test F-24 was trying to protect. Owner action: SQL query above.
2. **Schema gap decision** — extend (i) / map defaults (ii) / drop features (iii)?
3. **Empty-state UX when zero shops match a user's region** — waitlist email capture? Marketplace explainer? "Be first to know when a partner joins" CTA? Per-region "Coming to your area" message?
4. **Distance ranking** — current `getLocationForShop(shop.id)` is seed-data-bound. Replace with Haversine over `latitude/longitude` from prod table (requires user location capture)?
5. **AI matching algorithm fidelity** — `aiSummary`, `recommendationScore`, `matchReasons` currently consume `certifications`, `insurerPrograms`, `supportedMakes`, `capabilityTags`. Without those in prod table, scoring becomes thin. Simplify the algorithm or stub the missing fields with reasonable defaults?

### Risk assessment

- **20-file sync→async refactor** — HIGH blast radius. Must be phased, not autopilot single-shot.
- **Schema gap without migration** — partial feature loss without (i) or (ii); UX implications.
- **Empty state on zero prod rows** — HIGH risk to first-impression marketplace credibility. This is precisely the problem F-24's preview banner was trying to mitigate. If KI-100 ships before real shops onboard, we replace fake-but-rich data with empty-but-honest data — arguably worse for soft launch.
- **Distance/ranking quality regression** — algorithm simplification may degrade the "smart match" feature if not handled carefully.

### Recommendation

**Do not patch under autopilot.** KI-100 needs:

1. Owner answers to the 5 questions above
2. Explicit "go KI-100 Phase 1" authorization
3. Phase 1 ships as scope-locked single commit (foundation — additive async function alongside sync, no consumer changes yet)
4. Owner verifies Phase 1 in browser before Phase 2 begins
5. Repeat per phase

This matches the F-16 diagnose→patch protocol that owner reinforced as the right pattern for high-blast-radius work.

**Alternative:** if production `public_partner_shops` row count is < N (TBD threshold, perhaps 5), the right move is **defer KI-100 entirely** until shop signup ramps. F-24's preview banner (KI-099, commit `7f6d55ce`) is doing exactly the right thing in the meantime.

---

## KI status changes (this Part 2 block)

| KI     | Subject                                | Pre-Part-2      | Post-Part-2                                                                      |
| ------ | -------------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| KI-104 | Pass L — landing section border stripe | Not yet opened  | RESOLVED + documented (commit `6b96c22b`)                                        |
| KI-100 | F-24 follow-up: full Supabase swap     | OPEN (deferred) | OPEN (diagnose complete; 5 owner-decision blockers surfaced; phase plan written) |

---

## Hard stops honored

Both Part 2 actions:

- ✅ No edge function modified
- ✅ `verify_jwt: false` preserved
- ✅ `requireClerkSession()` UNCHANGED
- ✅ JWT/Clerk SDK UNCHANGED
- ✅ No new migrations, no schema change
- ✅ No `storage.objects` policy change
- ✅ No `hydrateSignedStorageUrl` bypass
- ✅ Locked Premium Gold Palette only (canon champagne `rgba(196,144,65)`)
- ✅ 0.22a single-layer halo cap NOT exceeded (Pass L kept Pass K alphas)
- ✅ Pass K spacing UNCHANGED
- ✅ HeroSection UNTOUCHED
- ✅ Build clean (3817.64 KiB stable across both Part 2 commits)
- ✅ Branch-aware forbidden grep ZERO
- ✅ "One bug, one commit" preserved (Pass L is one commit; KI-100 diagnose is doc-only, no code)
- ✅ Diagnose-first protocol respected on KI-100 — NO patch attempted under autopilot per owner brief

---

## Owner action items still pending (carried over from Part 1 + new)

From Part 1:

1. **F-16 browser smoke test** (KI-096) — gate temporarily lifted but should still close
2. **F-04 Supabase log check** (KI-095)
3. **KI-101 Toyoto typo** UPDATE
4. **KI-102 cat photo** delete + UPDATE
5. **KI-103 footer email** decision

New from Part 2: 6. **KI-100 prod DB row count check** — `SELECT COUNT(*) FROM public.public_partner_shops WHERE is_active = TRUE` 7. **KI-100 schema gap decision** — extend / map defaults / drop features 8. **KI-100 empty-state UX direction** 9. **KI-100 distance ranking decision** — Haversine over real lat/lng? 10. **KI-100 AI matching fidelity decision** — simplify algorithm or stub missing fields?

---

## Next session recommendation

If you want to keep moving:

- **If F-16 smoke test passes + KI-095 prod check shows table exists** — close those KIs (paste migration if needed for KI-095)
- **For KI-100** — answer the 5 questions above, then authorize Phase 1 (additive async foundation) as a scope-locked diagnose-then-patch pass

If KI-100 is out of scope for the current launch window, defer entirely — KI-099's preview banner is doing the right thing for soft launch.

---

## Verification commands

```bash
# Part 2 commit range
git log --oneline 3c04211b^..HEAD

# Pass L specific change
git show 6b96c22b --stat

# Forbidden grep (expected: 0)
grep -rE "rgba\(228, ?(140|175)|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" src/ \
  | grep -v "// legacy" | grep -v "(legacy register"

# Build
npm run build  # → clean, 3817.64 KiB precache stable
```

---

_Generated end of Part 2 of the 2026-05-05 sustained functionality-sweep autopilot session._
_Per `bd-design-identity`, `mola-ai-relay-protocol`, `supabase-clerk-edge-function`, `supabase-storage-signed-urls` skills._
_Per LAW_PROJECT_RULES.md hard-stop discipline + diagnose-first protocol per owner brief._
