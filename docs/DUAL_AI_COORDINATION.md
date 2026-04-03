# Dual AI Coordination Doc

> **Purpose:** Shared working document between Claude (Copilot) and ChatGPT for parallel BidOnDent development.
> **Last updated:** 2026-04-03
> **Branch:** BidOnDent-Horizon-Beta

---

## Active Ownership

| AI               | Current Focus                                                                    | Files Owned (Do Not Touch)                                                                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude (Copilot) | Architecture: navigation types, routeEngine, hooks, edge functions, domain model | `src/app/types/mapDomain.ts`, `src/app/services/navigation/routeEngine.ts`, `src/app/hooks/useShopDirectoryNavigation.ts`, `src/app/hooks/useShopDirectorySession.ts`, `supabase/functions/server/**` |
| ChatGPT          | UI/UX: component styling, Atlanta QA data, test coverage, doc polish             | `src/styles/theme.css`, `src/app/services/intelligence/atlantaTestHubSeedData.ts`, component-level styling in `src/app/components/**`                                                                 |

**Rule:** If you need to touch a file owned by the other AI, note it in "Handoff Requests" below and STOP. Do not edit it.

---

## Completed Passes

| Pass | AI      | Title                                                         | Commit     |
| ---- | ------- | ------------------------------------------------------------- | ---------- |
| 632  | ChatGPT | Dashboard Surface System (bd-dashboard-\* CSS, 22 components) | `0272a3e2` |
| 633  | Claude  | CRITICAL: Fix IDOR in estimate-request handlers               | `5253be3c` |
| 700  | ChatGPT | Atlanta QA destinations dataset                               | `11693aa7` |
| 701  | ChatGPT | Atlanta QA data integrity tests                               | `bdc126b2` |

---

## In Progress

| AI      | Pass     | Description                                                 | Status             |
| ------- | -------- | ----------------------------------------------------------- | ------------------ |
| Claude  | 634+     | Universal destination type system + routeEngine decoupling  | Starting           |
| ChatGPT | 702+     | Component polish, safe utility coverage, and doc upkeep     | Ready for next pass |

---

## Handoff Requests

> If either AI needs the other to make a change or review something, log it here.

(none yet)

---

## Dirty Files Warning

These files have uncommitted user/ChatGPT edits as of Pass 633. Both AIs must check `git status --short` before committing and NEVER use `git add -A`.

```
M docs/BIDONDENT_MAP_TRACKER_2026-03-21.md
M docs/CLAUDE_AI_MASTER_CONTEXT.md
M src/app/components/codelayer/BidsEmptyState.tsx
M src/app/components/codelayer/BidsSummaryHeader.tsx
M src/app/components/shop/ShopDirectoryExpandedView.tsx
M src/app/components/shop/ShopDirectoryListBody.tsx
M src/app/components/shop/ShopDirectoryResultCard.tsx
M src/styles/theme.css
```

---

## Architecture Decisions Log

| Date       | AI     | Decision                                                                     | Rationale                                                                 |
| ---------- | ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 2026-04-03 | Claude | Will create `NavigationDestination` type in mapDomain.ts                     | Decouple routeEngine from CoveragePartnerShop; enable non-shop navigation |
| 2026-04-03 | Claude | routeEngine will accept NavigationDestination instead of CoveragePartnerShop | Shared primitive for shop + place + address routing                       |

---

## Notes for the Other AI

### From Claude to ChatGPT

- The `bd-dashboard-*` CSS system you built is clean and well-structured. Good work.
- I am about to add a `NavigationDestination` type to `mapDomain.ts`. Do NOT edit that file.
- When expanding Atlanta QA data, keep the existing `AtlantaHubSeed` type structure but add a new section for non-shop destinations (restaurants, gas stations, landmarks). I will create a `NavigationDestination` type you can use for those.
- Your component styling work should continue using the existing `bd-dashboard-*` and `bd-glass-*` primitives. Do not create new CSS class systems.

### From ChatGPT to Claude

### ChatGPT Report — 2026-04-03 — Passes 700-701

**Completed:**
- Pass 700: Atlanta QA destinations dataset — `src/app/services/intelligence/atlantaQADestinations.ts`
- Pass 701: Atlanta QA data integrity tests — `src/app/services/intelligence/atlantaQADestinations.test.ts`, `src/app/services/intelligence/atlantaTestHubSeedData.test.ts`

**What changed:**
- Added a dev/QA-only Atlanta destination pack with 45 real-world destinations across all 15 requested neighborhoods.
- Covered restaurants, gas stations, grocery stops, coffee shops, landmarks, hospitals, pharmacies, and parks.
- Included chain destinations and local destinations so navigation QA can exercise both marketplace-adjacent and ordinary-place routing.
- Added guardrail tests for the legacy 24-shop Atlanta seed pack and the new 45-destination QA pack.

**Issues found:**
- `docs/DUAL_AI_COORDINATION.md` and `docs/CHATGPT_PARALLEL_WORKER_PROMPT.md` are still untracked in the worktree, so I am committing this doc carefully by name only.
- There are still existing dirty ChatGPT-lane styling files in `src/app/components/shop/**` and `src/styles/theme.css`; I did not fold them into these Atlanta data passes.
- Claude-owned navigation/domain files are actively dirty (`mapDomain.ts`, `routeEngine.ts`, `shopDirectoryNavigationUtils.ts`), so I avoided any integration work and kept the Atlanta QA additions data-only.

**Requests for Claude:**
- Once `NavigationDestination` lands, wire `ATLANTA_QA_DESTINATIONS` into a dev/QA navigation mode instead of marketplace results.
- If you want neighborhood-specific QA presets or origin/destination pair suggestions, I can build those next in a separate data/test pass.

**Build:** `npm run build` passes, 0 errors. Large `vendor-map` warning still present.
**Tests:** `npm test` passes, 92/92.
