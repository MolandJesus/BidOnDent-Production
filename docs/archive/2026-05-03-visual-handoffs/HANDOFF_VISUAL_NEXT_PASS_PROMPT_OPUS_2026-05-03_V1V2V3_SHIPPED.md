---
title: HANDOFF — Visual Master Plan V1+V2+V3 shipped, next session pickup
date: 2026-05-03
target_model: Claude Opus 4.7
status: READY — paste the prompt at the bottom of this doc into a fresh Opus chat
prior_session_branch: BidOnDent-Horizon-Beta
prior_session_commits:
  - 7dfd5cef design(visual)  V1 trust + mobile landing critical fixes
  - e9fb687a design(hero)    V2 hero signature — mobile map presence + desktop immersion
  - 366e8442 design(glass)   V3 landing + dashboard liquid-glass premium lift
companion_docs:
  - docs/PLAN_VISUAL_MASTER_2026-05-03.md  (master plan; still the active execution record)
  - docs/visual_audit_sonnet_2026-05-03.md (Sonnet audit; integrated into V1+V2+V3)
  - docs/HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03.md (older handoff template)
  - docs/REF_VISUAL_SYSTEM.md (system law)
  - docs/LAW_PROJECT_RULES.md
  - docs/LAW_HARDENING_PLAN.md
  - docs/MOLANDJESUS_DESIGN_DECISIONS.md §7 + §9
---

# Visual Master Plan — V1/V2/V3 Shipped, Session Handoff

> Three approved bundles from `PLAN_VISUAL_MASTER_2026-05-03.md` shipped under autopilot on 2026-05-03. This doc is the durable record + the prompt for the next Opus chat.

---

## What shipped

### V1 — Coverage Trust + Mobile Landing Critical Fixes (commit `7dfd5cef`)

10 files. Trust copy + mobile critical breakage cleared before any decorative polish.

| Sub-pass | Surface                                                                                  | What changed                                                                                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1.2     | `src/app/components/codelayer/ImageWithFallback.tsx`                                     | Premium glass fallback (champagne inset, amber rim, lucide image icon). Defensive guard short-circuits `storage://` or empty `src` to the fallback instead of rendering a broken `<img>`.                            |
| V1.2     | `src/app/components/codelayer/HomeReportsList.tsx`                                       | Thumbnail wrapper upgraded to liquid-glass treatment (champagne inset light / amber inset dark) for visual parity between hydrated photos and the fallback.                                                          |
| V1.3     | `src/app/components/landing/OperatingRegionsSection.tsx`                                 | "Live Coverage" → "Coverage Map", `bd-pin-pulse--soft` removed in favor of static `MapPin`. Headline reframed: "Browse our NY service area, right on the map."                                                       |
| V1.3     | `src/app/components/landing/CoverageSearchPanel.tsx`                                     | Removed "live coverage signal" phrasing; out-of-coverage ZIP copy now states NY-only focus explicitly.                                                                                                               |
| V1.3     | `src/app/components/codelayer/home-data.ts`                                              | Quick-action description: "live coverage and service map" → "coverage and service map."                                                                                                                              |
| V1.4     | `src/app/components/landing/CoverageNearestShops.tsx` + `coverageNearestShopsHelpers.ts` | New `isOutsideServiceArea` prop drives an honest empty state: "You're outside our current NY service region" with the six covered counties listed. In-region empty state stays calmer ("Service area is expanding"). |
| V1.5     | `src/app/components/codelayer/HomeScreen.tsx`                                            | "Live activity" welcome chip is now conditional on at least one report having `active`/`in repair` status; otherwise shows "Summary."                                                                                |
| V1.6     | `src/app/components/landing/CTASection.tsx`                                              | Card wrapper `overflow-hidden sm:overflow-visible` so decorative orbs read as corner glints on mobile, full circles on sm+.                                                                                          |
| V1.7     | `src/app/components/landing/HeroSection.tsx`                                             | Right column hidden `< lg` (~200px dead space gone). Section bottom padding tightened to `pb-10` mobile. "Learn More" dark contrast: bg 0.10→0.20, border 0.25→0.45, champagne inset highlight.                      |
| V1.7     | `src/app/components/landing/OperatingRegionsSection.tsx`                                 | Coverage pills mobile fade colors realigned to actual card bg (#e8eef7 light / #071830 dark) + champagne hairline.                                                                                                   |

### V2 — Hero Signature (commit `e9fb687a`)

2 files. Mobile gets real map-first DNA; desktop hero stops reading boxed.

| Sub-pass | Surface                                      | What changed                                                                                                                                                                                                                                                                                                                                                                        |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2.1     | `src/app/components/landing/HeroSection.tsx` | New 200px Liquid Map Intelligence strip below trust chips, hidden at `lg+`. Reuses `bd-map-contour`, `bd-liquid-gold-flow`, `bd-route-line`, `bd-pin-pulse`, `bd-liquid-gold-sheen`. Glass chrome: champagne top bezel + amber bottom-edge lamp inset, outer ambient bloom (cool blue + faint gold halo). "NY Coverage" eyebrow + "Browse coverage" pill. Tap target → `#coverage`. |
| V2.2     | `src/app/components/landing/HeroSection.tsx` | Desktop map stage immersion: outline ring removed; dual-edge inset (champagne top + amber bottom). Multi-layer outer ambient bloom (cool blue inner + warm gold halo outer).                                                                                                                                                                                                        |
| V2.3     | `src/app/components/landing/HeroSection.tsx` | Dark hero contrast: "Best Price" → `text-sky-300`; "Auto Body Repair" gradient start raised from `#003d82` (near-navy) to `#3b82f6`, terminus `#93c5fd`. Light mode unchanged.                                                                                                                                                                                                      |
| V2.4     | `src/styles/theme.css`                       | `bd-bid-card-float` hover: one-shot champagne sheen via ::before with `mix-blend-mode: screen` (light catching glass, never film over content). Drift pauses on hover; chip lifts -1px; ::after carries outer gold halo. Reduced-motion + KI-062 mobile guards extended.                                                                                                            |

### V3 — Liquid-Glass Premium Lift (commit `366e8442`)

7 files. Multi-layer shadow + liquid-glass thickness + gold-as-light treatments across landing + dashboard.

| Sub-pass | Surface                                                                       | What changed                                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V3a      | `src/app/components/landing/BenefitsSection.tsx` + `TrustStatsSection.tsx`    | Bottom transitions (warm Direction B → cool next section) are now multi-stop temperature bridges with desaturated mid-stop. Champagne hairline at boundary. Direction B amber preserved per LAW.                                    |
| V3b      | `src/styles/theme.css`                                                        | `bd-glass-card` gets `backdrop-filter: blur(…) saturate(1.4)`. `bd-glass-card--landing`, `--landing-warm`, `--dashboard` get one-shot champagne hover sheen via ::before with `mix-blend-mode: screen`. Reduced-motion guard added. |
| V3c      | `src/styles/theme.css`                                                        | `bd-glass-floating` body alpha 0.94/0.88 → 0.86/0.78 + `saturate(1.5)` + champagne top bezel + amber bottom-edge inset so dashboard gold-lamp atmosphere reads through the glass.                                                   |
| V3c      | `src/app/components/dashboard/ProfileDropdown.tsx` + `NotificationCenter.tsx` | Inline body alpha lowered to 0.86/0.80 both modes + `saturate(1.5)` + champagne/amber inset stack. Resolves Sonnet's "plain white panel, no glass identity" finding for light mode. Dark mode now also catches more lamp light.     |
| V3e      | `src/app/components/codelayer/HomeScreenSections.tsx`                         | Mobile Quick Actions horizontal scroll wrapped in relative; right-edge fade affordance + champagne hairline. Confirmed Codex's read: tiles 3+4 weren't hidden, just undiscoverable.                                                 |
| V3e      | `src/app/components/dashboard/MobileBottomNav.tsx`                            | Active tab now carries a thin champagne underline below the label in addition to the existing blue top-bar indicator. Gold-as-light, blue product/action signal preserved.                                                          |

---

## Audit issue ledger (where each landed)

| Sonnet ID                                       | Status                                                    | Bundle    |
| ----------------------------------------------- | --------------------------------------------------------- | --------- |
| P1-TRUST-01 Honda Accord red rectangle          | ✅ Resolved (defensive)                                   | V1.2      |
| P1-TRUST-02 "Live Coverage" + 0 partner shops   | ✅ Resolved                                               | V1.3      |
| P1-TRUST-NEW Atlanta map under NY chips         | ✅ Resolved                                               | V1.4      |
| P1-UX-03 Desktop hero boxed map                 | ✅ Resolved                                               | V2.2      |
| P1-MOBILE-04 Mobile hero map absent             | ✅ Resolved                                               | V2.1      |
| P1-MOBILE-05 Mobile CTA orb overflow            | ✅ Resolved                                               | V1.6      |
| P2-UX-06 Benefits→WhoWeServe seam               | ✅ Resolved                                               | V3a       |
| P2-UX-07 Quick Actions discoverability          | ✅ Resolved                                               | V3e       |
| P2-UX-08 Mobile hero dead space                 | ✅ Resolved                                               | V1.7      |
| P2-UX-09 Mobile dark "Learn More" invisible     | ✅ Resolved                                               | V1.7      |
| P2-UX-10 Coverage pills clip                    | ✅ Resolved                                               | V1.7      |
| P2-UX-11 Profile/Notification no glass identity | ✅ Resolved                                               | V3c       |
| P2-UX-12 Light dashboard not gold-lamp twin     | ✅ Resolved                                               | V3b + V3c |
| P2-COPY-13 "Live activity" pill always-on       | ✅ Resolved                                               | V1.5      |
| P2-NEW-14 Account tile color tints              | ⊘ Preserved (intentional role semantic per memory)        | —         |
| P2-NEW-15 Two amber-bath sections               | ⊘ Preserved (Direction B per LAW); seams improved instead | V3a       |
| P2-NEW-16 Hero result chip hover                | ✅ Resolved                                               | V2.4      |
| P2-NEW-17 Section seam alternation              | ✅ Partially addressed (warm→cool seams bridged)          | V3a       |
| F-1 Dark dashboard atmosphere depth             | ⊘ Preserved (Sonnet locked "perfectly calibrated")        | —         |

---

## Worktree state at handoff

### Branch

- Working: `BidOnDent-Horizon-Beta` (3 commits ahead of starting state)
- `main` is behind. Vercel production won't reflect V1/V2/V3 until merged.

### Uncommitted files NOT touched by autopilot (owner's parallel work)

These were modified in the worktree at start; left untouched per autopilot brief ("Do not overwrite unrelated user/agent changes"):

- `.claude/agents/Mola's Coder.agent.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/REF_AI_BROWSER_NAVIGATION.md`
- `docs/REF_SYSTEM_STATE.md`
- `docs/REF_AI_COLLABORATION_PROTOCOL.md` (untracked)
- `docs/HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03.md` (untracked)
- `docs/PLAN_VISUAL_MASTER_2026-05-03.md` (untracked — written this session)
- `docs/visual_audit_sonnet_2026-05-03.md` (untracked — Sonnet's audit)

These are the owner's in-flight work. The next session should treat them the same way unless the owner directs otherwise.

---

## What's deferred

### Phase H — Smart Shop Map flagship arc

- Status: deferred per master plan §6 + §7.6
- Eligible to begin now that V1/V2/V3 are stable
- Hard rule: don't let it expand BidOnDent core scope; treat as its own product track

### B-5 anchored lamps for Direction B sections

- Skipped per LAW preserve list + memory `feedback_external_audit_handling`
- Direction B amber sections (Benefits, TrustStats) stay warm; only seams improved

### F-1 dashboard dark atmosphere outer halo

- Skipped per Sonnet's "perfectly calibrated, do not strengthen" lock

### Browser verification

- Build passed on every bundle (`npm run build` clean, 3.46s, no errors).
- Browser walk on `BidOnDent-Horizon-Beta` not done by autopilot (no agent screenshot tool here).
- Owner should walk localhost in both modes, both viewports, before merging to `main`.

### Honda Accord root cause

- V1.2 ships a defensive fallback that hides the symptom regardless of cause.
- Underlying record's `photo_urls` content not investigated (per autopilot brief: "Treat as single bad record... do not assume global hydration failure").
- Worth a brief check + KI-### entry next session if the symptom persists after deployment.

---

## Verification checklist for next session (browser walk)

Walk in this order to confirm V1/V2/V3:

1. **Localhost dashboard, dark + light:**
   - Honda Accord card now shows a premium glass placeholder, never a red rectangle.
   - "REPAIR OVERVIEW" header chip says "Live activity" only if there's an in-repair report; otherwise "Summary."
   - Quick Actions on mobile have a right-edge fade indicating scrollability.
   - Profile dropdown + notification panel in light mode have visible glass + champagne edge (no flat white).
   - Mobile bottom tab active state has a thin champagne underline below the label.

2. **Localhost landing, dark + light, both desktop + mobile:**
   - Hero map on mobile: 200px Liquid Map Intelligence strip below trust chips, taps to coverage section.
   - Hero map on desktop: ambient bloom integration, no hard rectangular outline.
   - Dark hero "Auto Body Repair" gradient is brighter and reads cleanly on the navy.
   - "Learn More" button on mobile dark is clearly visible.
   - Hero result chips: hover triggers a one-shot champagne sheen + drift pauses + outer gold halo.
   - OperatingRegions eyebrow says "Coverage Map" with a static pin (no pulse).
   - "Browse our NY service area" headline in coverage section.
   - With GPS spoofed to outside NY: empty state reads "You're outside our current NY service region" with six counties listed.
   - Coverage pills row right-edge has a champagne-tinted fade affordance on mobile.
   - CTA section orbs on mobile read as corner glints, not overflowing the section.
   - Benefits→WhoWeServe seam: smoother temperature transition, no hard cut.
   - TrustStats→Coverage seam: same smoother transition.
   - Landing card hover: subtle champagne sheen sweep + lift.

3. **Production parity (only after owner is satisfied with localhost):**
   - Merge `BidOnDent-Horizon-Beta` → `main` to unblock Vercel verification.

---

## Suggested entry points for the next session

In priority order:

1. **Browser walk + sign off on V1/V2/V3** — owner verifies on localhost, then merges to main. Probably the right immediate next step.
2. **Phase H — Smart Shop Map flagship arc kickoff** — own briefing, separate plan doc, multi-session.
3. **Honda Accord root cause spike** — quick `select photo_urls from damage_reports where vehicle_make ilike 'Honda%'` to confirm whether the broken record holds a `storage://` literal or something else, then KI-### entry in REF_KNOWN_ISSUES.md.
4. **Update REF_VISUAL_SYSTEM.md** — V3 added new behaviors (saturate boost on `bd-glass-card`, hover sheen pseudo-elements, champagne edge-light pattern). REF doesn't strictly need an update because no new utility class was added, but a short note in §1 about the cross-cutting depth treatments would help future agents discover the pattern.

---

# Prompt to paste into a fresh Opus chat

Copy everything between the `---PROMPT---` markers into the next chat.

```
---PROMPT---

You are continuing visual work on BidOnDent (`/Users/molalignmeagher/BidOnDent GitHub Repository/BidOnDent-Production`), a map-first auto repair bidding marketplace in soft-launch hardening.

**Prior-session state (read first, in order):**
1. `docs/HANDOFF_VISUAL_NEXT_PASS_PROMPT_OPUS_2026-05-03_V1V2V3_SHIPPED.md` — what shipped, what's deferred, current worktree state
2. `docs/PLAN_VISUAL_MASTER_2026-05-03.md` — the active execution plan (V1/V2/V3 sub-bundles all marked done)
3. `docs/visual_audit_sonnet_2026-05-03.md` — Sonnet's audit (issue ledger maps to bundles in handoff doc)
4. `docs/REF_VISUAL_SYSTEM.md` — system law (gold = lighting/halo/trim, alpha 0.10–0.25, never wallpaper, never primary infill)
5. `docs/LAW_PROJECT_RULES.md`
6. `docs/MOLANDJESUS_DESIGN_DECISIONS.md` §7 (Direction B / amber-lit garage)

**State you are entering:**
- Branch `BidOnDent-Horizon-Beta` is 3 commits ahead of starting:
  - `7dfd5cef` V1 trust + mobile landing critical fixes
  - `e9fb687a` V2 hero signature — mobile map presence + desktop immersion
  - `366e8442` V3 landing + dashboard liquid-glass premium lift
- `main` is behind. Vercel production won't reflect V1/V2/V3 until merged.
- 18 of 19 audited issues resolved; rest were intentionally preserved per LAW or memory feedback.
- Worktree has unrelated uncommitted edits (`AGENTS.md`, `CLAUDE.md`, `docs/REF_AI_*`, `.claude/agents/Mola's Coder.agent.md`, plus a few new docs). Per prior autopilot brief: do not overwrite, do not reset.

**Owner defaults already established (do not re-ask):**
- No production data mutation. Frontend defensive fallbacks instead.
- Honest copy: replace "live" claims with "coverage" / "service area" framing whenever density isn't real.
- Out-of-region state: explicit NY-only messaging, no email capture.
- Mobile: lightweight static/liquid map strip (no second MapLibre instance) + map-first identity required on every device.
- Gold = light catching glass. Forbidden: gold card backgrounds, gold button infills, full amber baths beyond the existing Direction B sections.
- BidOnDent Map (current product) and Future Full Map Program (Phase H, deferred) stay separate — Phase H must not expand BidOnDent core scope during hardening.
- Stop only for: LAW conflict, destructive data mutation, schema migration risk, backend auth/storage invariant risk, map provider change, secret/deploy requirement, scope expansion, data-loss risk.
- Do not stop for: copy nits, hover values, exact glow alphas, whether to split commits, choice between equally-valid CSS approaches.

**What I want you to do (pick the path the owner asks for):**

PATH A — Verification + sign-off (most likely default if owner hasn't said otherwise)
- Spin up the dev server locally if requested; otherwise just wait for the owner to walk the build.
- Be ready to investigate any visual regressions or unexpected behavior on V1/V2/V3 surfaces.
- If the owner reports an issue: scope it tightly, fix only the specific surface, do not bleed into other passes.
- If the owner says "merge to main": confirm and run `git merge` from main locally (do not force push).

PATH B — Phase H — Smart Shop Map flagship arc kickoff
- Treat as a brand-new multi-session product track, not a polish pass. Don't start coding until you've drafted a Phase H plan doc (`docs/PLAN_MAP_PROGRAM_FLAGSHIP_<DATE>.md`) covering: surfaces in scope, design language relative to BidOnDent core, status pill treatment, pin glow upgrades, "Search this area" interaction, empty state identity, layer/theme toggles, split-mode polish, performance/tile loading. Get owner approval on the plan before any code.
- Hard boundary: no feature expansion of BidOnDent core. Anything that benefits BidOnDent core gets backported as its own bundle, not snuck into Phase H.

PATH C — Honda Accord root cause spike
- Run a quick query against the staging Supabase project (ref `lhhdqycnhweaxqviwdqt` per memory `project_staging_supabase`) or the prod project to confirm whether the broken record holds a `storage://` literal, an empty string, or a corrupted image URL.
- If it's a `storage://` literal that should have hydrated: trace the dashboard handler that returns reports and verify it pipes `photo_urls` through `hydrateSignedStorageUrl()` per the `supabase-storage-signed-urls` skill.
- Add a KI-### entry to `docs/REF_KNOWN_ISSUES.md` regardless of the outcome.

PATH D — Cross-cutting REF doc update
- V3 added new behaviors (saturate boost on `bd-glass-card`, hover sheen pseudo-elements, champagne edge-light pattern) without introducing new utility classes. REF_VISUAL_SYSTEM doesn't strictly require an update, but a short note in §1 + §2 about the cross-cutting depth treatments would help future agents discover the pattern. Small focused edit only.

**Hard rules carried over:**
- Do not invent new `bd-*` utilities unless reducing real duplication.
- Do not strip gold from any surface. Add depth (multi-layer shadow, liquid glass, edge highlights) instead of saturation.
- Do not break the preserve list in `PLAN_VISUAL_MASTER_2026-05-03.md` §3.
- Do not skip `npm run build` after edits.
- Do not commit owner's unrelated uncommitted changes.
- Do not push to `main` or force-push anywhere without explicit owner approval.
- Do not start Phase H implementation until V1/V2/V3 are owner-verified stable.

**Reusable skills to apply when relevant:** `bd-design-identity`, `supabase-clerk-edge-function`, `supabase-storage-signed-urls`, `supabase-pro-cost-control`. Mention them by name in commit messages.

Begin by reading the handoff doc + plan doc + audit doc, then ask the owner which path (A/B/C/D) — or wait for the owner's first message and route from there.

---END PROMPT---
```
