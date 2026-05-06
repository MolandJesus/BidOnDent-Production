# Plan: BidOnDent post-Pass-28 (2026-05-06)

**Authority:** PLAN — future direction. Not current truth (REF wins; LAW wins over REF).
**Owner:** Mola
**Authors:** Claude Opus 4.7 (1M context), via builder relay
**Status:** Draft awaiting owner gate decisions
**Last updated:** 2026-05-06

> **Why this doc exists.** Two AI sessions have independently converged on "scope exhausted under current authorization" after the polish/cleanup arc of Passes 12–28. This document captures what was hardened, classifies every remaining open item by which gate it sits behind, and proposes a critical path to soft launch. It is the single decision document for the next round of owner unlocks.

---

## 0. Cross-references

- [`docs/LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — North Star, Launch Scope Guardrails, Phase 0–6 sequence (governs)
- [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-001 … KI-120 (current truth)
- [`docs/REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) — period-spread rule, atmosphere ledger
- [`docs/LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — Light-Mode Surface Rule, Premium Gold Palette
- [`docs/map_coherence_audit_sonnet_2026-05-06.md`](map_coherence_audit_sonnet_2026-05-06.md) — map chrome unification audit
- [`docs/audit-assets/visual-2026-05-06/`](audit-assets/visual-2026-05-06/) — atmosphere coherence audit (Pass 18)
- [`docs/PLAN_POST_LAUNCH_ROADMAP.md`](PLAN_POST_LAUNCH_ROADMAP.md) — what is explicitly deferred to after launch

---

## 1. Polish ledger — what shipped through Pass 28

Two AI sessions, 28 disciplined passes, all on `main`. Grouped by domain.

### 1.1 Map coherence unification (Pass 12, batches A/B/C)

Map chrome unified at the `bd-glass-card--map` utility layer. Four surface migrations + "Start Navigation" label sweep + dashboard tile-mode parity. Outcome: every active map surface inherits the same cool-blue cream-gold liquid glass family. Cross-ref: [`docs/map_coherence_audit_sonnet_2026-05-06.md`](map_coherence_audit_sonnet_2026-05-06.md).

### 1.2 KI-118 mileage data integrity (Pass 13 / 13b / 13c)

`DEFAULT_COORDINATE_ANCHOR` moved Dallas TX → White Plains NY. 9 NY metro cities added to `CITY_COORDINATE_DIRECTORY`. 3 region aliases (westchester / hudson valley / new york). Verified at the user surface: dashboard "Find Shops" cards now show in-region NY shops at ~4.5 mi instead of 700+ mi cross-country fallback. **KI-118 RESOLVED.**

### 1.3 LAW pure-white-inset slip cleanup (Pass 9a, 13d–13h, 24, 27, 28)

Every active map chrome + every `bd-*` utility surface + 6 inline `boxShadow` component sites migrated to locked Premium Gold Palette cream `rgba(252,240,208,Xα)`. Repo-wide grep on the canonical surgical pattern `inset 0 1px 0 rgba(255,255,255,0.5+)` across `src/app`: **zero hits.**

| Pass | Scope                                                                                    | Commit           |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- |
| 9a   | KI-068 shop-family white-surface migration                                               | (pre-batch)      |
| 13d  | `.map-command-sidebar-shell`, `.bd-glass-floating`, `.bd-dashboard-section--accent-rose` | (Pass 13 family) |
| 13e  | Active-surface inset cleanup                                                             | `9f6a9ee3`       |
| 13f  | MapLibre popup + popup-tip                                                               | `7b95a961`       |
| 13g  | MapLibre attribution + ctrl-group                                                        | `c5acf52b`       |
| 13h  | Brand badge + scale control                                                              | `8ff779d6`       |
| 24   | Base `.bd-glass-card` (theme.css)                                                        | `74b0d3a1`       |
| 27   | `.bd-glass-badge` (theme.css)                                                            | `299e4646`       |
| 28   | 7 inline `boxShadow` sites across 6 component files                                      | `774f6923`       |

### 1.4 Bid Realtime trust signal (Pass 14, 19)

`connectionStatus` chip surfaced through `BidsScreenProps → BidsScreen → BidsSummaryHeader` (Pass 14, KI-012 RESOLVED) and parity-mirrored on `ReportDetailScreen` (Pass 19). Live / Reconnecting / Offline · last known states; hidden when `idle` (seed reports). Closes the silent-fallback trust gap on the marketplace.

### 1.5 Living-lava atmosphere (Pass 15, 16a, 16b, 17, 17b)

Living premium gold liquid-glass lava motion landed across:

- Dashboard atmosphere (Pass 15) — 28+36s periods
- Landing toplamp (Pass 16a) — 32+44s
- Landing bottomwash (Pass 16b) — 24+38s

Period-spread invariant locked in [`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) (Pass 17). `.bd-bloom-atmosphere` documented as no-drift exception (Pass 17b).

### 1.6 Atmosphere coherence audit (Pass 18)

Audit-only pass. Confirmed the living-lava ledger complete and surfaced two open forks (Liquid Map Intelligence keyframe swap; landing warm-register host gradient). Both deferred as owner taste calls. Cross-ref: [`docs/audit-assets/visual-2026-05-06/atmosphere-coherence-pass18-audit.md`](audit-assets/visual-2026-05-06/atmosphere-coherence-pass18-audit.md).

### 1.7 Cspell + Prettier housekeeping (Pass 20, 21, 26)

- Pass 20 (`aa323912`, `0d7376f0`): 138 domain words added to `cspell.json`. 151 → 3 issues (intentional verbatim owner quotes).
- Pass 21 (`48e83d6a`, `87802b0e`): cleared phantom Prettier dirty-tree antipattern (5 files, whitespace-only).
- Pass 26 (`5982fe6a`): Prettier reflow on Pass 24 inline comment.

### 1.8 Documented declines with rationale (Pass 22, 23, 25)

Three Phase B/C/E proposals declined as no-fit + WONTFIX KIs per the brief's authorized "ship the documented decline" clause:

- Pass 22 — `bd-bloom-atmosphere` drift attempt (no-op: host has no own gradient to drift). Override path documented.
- Pass 23 — Phase C `MapTileSegmentedControl` extraction declined → **KI-119 WONTFIX**.
- Pass 25 — Phase E `MapRoutePreviewCard` extraction declined → **KI-120 WONTFIX**.

### 1.9 Net state after Pass 28

- `main` HEAD: `774f6923`
- branch HEAD: `8ba93671` (one commit behind main, normal post-merge state)
- typecheck PASS · build PASS (3.59s, 2920 modules) · vitest 569/569 PASS
- cspell on `src/**` + `docs/**`: 3 issues (intentional verbatim owner quotes)
- Working tree: clean
- Repo-wide `inset 0 1px 0 rgba(255,255,255,0.5+)` in `src/app`: **zero**

---

## 2. Remaining work — classified by gate type

Every open item below is gated. The taxonomy makes the gate explicit.

### 2A — Owner taste-call gates (visual / architectural; per-item approval)

| ID              | Summary                                                                                                   | Blast radius | Notes                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pass 14 #8 / #9 | Bids surfaces additional trust elements deferred per Pass 23/25 decline rationale                         | Small        | Now WONTFIX via KI-119/120; owner can override                                                                                                           |
| Pass 16c        | `.bd-bloom-atmosphere` drift extension (Pass 22 declined as no-op)                                        | Small        | Override path: explicitly authorize adding new gradients to the host (changes visual identity, not just motion)                                          |
| Pass 18 #1      | Liquid Map Intelligence keyframe swap (`bdLiquidGoldFlow` / `mapLiquidSheenDrift` → canonical `orbDrift`) | Medium       | Open fork from atmosphere coherence audit. Trade-off: coherence with the living-lava family vs preserving the bespoke flow as the map's signature motion |
| Phase A         | Playwright visual evidence batch (Sonnet skipped this)                                                    | Small        | Owner can spin up dedicated browser session, or builder can if Playwright tools loaded                                                                   |

### 2B — Owner-action items (independent of any AI)

| KI         | Summary                                                                                                               | What unblocks it                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **KI-002** | Email notifications not delivering — code complete, blocked on `RESEND_API_KEY` deploy to Supabase edge env           | **Owner deploy of secret. P0 launch blocker.**                                                                                                                              |
| KI-051     | CSP missing `overpass-api.de` blocks public map place discovery                                                       | Owner CSP edit + deploy                                                                                                                                                     |
| KI-058     | Persisted signed URLs in `damage_reports.photo_urls` expire after 24h — root-cause investigation pending              | Owner SQL run against prod data, then migration §3.17 + RLS via Dashboard SQL Editor (per `feedback_supabase_cli_pg17` memory: dashboard paste is the working path on PG17) |
| KI-060     | Two legacy edge functions still deployed and unused                                                                   | Owner Supabase dashboard delete                                                                                                                                             |
| KI-053     | Map performance budget overruns on landing/fullscreen map                                                             | Owner runs Chrome DevTools profiler; AI can analyze the captured trace                                                                                                      |
| KI-064     | Honda Accord dashboard thumbnail renders as solid red rectangle — bytes-level issue confirmed (not `storage://` leak) | Owner data-layer action                                                                                                                                                     |
| KI-095     | (per its KI text — owner action item)                                                                                 | See KI body                                                                                                                                                                 |
| KI-100     | F-24 follow-up — full Supabase swap for `buildShopRecommendations`                                                    | Owner explicit second authorization (intentional defer)                                                                                                                     |
| KI-101     | F-01 — "Toyoto" misspelled vehicle make persisted in DB                                                               | Owner DB hygiene action                                                                                                                                                     |
| KI-102     | F-03 — Cat photo as damage report thumbnail                                                                           | Owner data hygiene action                                                                                                                                                   |
| KI-103     | F-14 — `bidondent@gmail.com` in landing footer                                                                        | Owner decision (keep / change / route)                                                                                                                                      |

### 2C — Hard-NO scope (owner override required to unlock)

| Scope                                                                                               | Why locked                                                                                                                                                                                                                              | Unlock cost                                                                          |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.bd-report-progress-*` cream migration (theme.css L2876 / L2889 light-mode insets at 0.96 / 0.98α) | Same exact pattern Pass 28 swept everywhere else, but on the brief's Hard-NO scope per Sonnet Pass 9a audit boundary. Intentional preservation of the report-shell visual identity as a "different surface" from the panel/badge family | Single owner approval; ~6 lines of CSS; completes the LAW slip story across the repo |

### 2D — P2 architectural (sustainable feature dev; not launch blockers)

| KI     | Summary                                                     |
| ------ | ----------------------------------------------------------- |
| KI-010 | `buildDashboardRouterProps` is an architectural choke point |
| KI-011 | State-driven routing prevents URL sharing/bookmarking       |
| KI-020 | Type boundary mapping has multiple locations                |

### 2E — P3 post-launch deferred

KI-021 (status taxonomy alignment), KI-022 (silent failure after bid acceptance), KI-030 (insurer thin stub data model), KI-031 (empty placeholders), KI-040 (per-instance rate limiting), KI-041 (content moderation pipeline), KI-042 (dispute resolution mechanism). All explicitly deferred per LAW_HARDENING_PLAN North Star filter.

### 2F — Living-lava extension (owner taste call)

Pass 16c `.bd-bloom-atmosphere` motion attempt — Pass 22 declined as no-op because host has no own gradient. Owner override path: explicitly authorize **adding** new gradients to the host (changes visual identity, not just motion). This is a category-2A item but called out separately because it's the only living-lava work still open.

---

## 3. Critical path to soft launch

Per [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) Launch Scope Guardrails, the **only remaining P0 launch blocker** is:

| KI                                            | Status                                                  | Path to launch                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **KI-002** Email notifications not delivering | Code COMPLETE; blocked on owner `RESEND_API_KEY` deploy | Owner deploys secret to Supabase edge function env → owner verifies emails actually fire end-to-end → KI-002 RESOLVED → launch unblocked from this axis |

Everything else marked P0/P1 in REF_KNOWN_ISSUES.md is RESOLVED at HEAD `774f6923`. Re-grep on `Status:.*P0|Status:.*P1.*Open` returns:

- KI-002 (above — owner-action)
- (nothing else)

**Launch trajectory summary:** the polish/cleanup arc through Pass 28 has closed every code-side launch-blocker the AI sessions could safely close without owner action. Soft launch is gated on KI-002 secret deploy + the LAW_HARDENING_PLAN Launch Scope Guardrails (Sentry DSN verification, event capture quality, global error boundary verification, staging vs prod separation decision, RLS verification on launch-critical tables) — every one of which is owner-action or owner-verification.

---

## 4. Recommended sequence (post-Pass-28)

Rank-ordered. Each item: name · gate type · AI-actionable? · blast radius · owner-decision needed?

| #   | Item                                         | Gate | AI?                                   | Blast                           | Owner decision?                                                                   |
| --- | -------------------------------------------- | ---- | ------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **KI-002 email secret deploy**               | 2B   | No (owner only)                       | Tiny (env var)                  | Yes — single deploy action                                                        |
| 2   | **`.bd-report-progress-*` Hard-NO unlock**   | 2C   | Yes (after approval)                  | ~6 lines CSS                    | Yes — single approval unlocks completion of the LAW slip story                    |
| 3   | **Phase A Playwright visual evidence batch** | 2A   | Yes (if Playwright tools loaded)      | Audit-only, no code change      | Optional — useful for confidence before launch                                    |
| 4   | **KI-053 map performance profiling**         | 2B   | Partial (AI analyzes captured trace)  | Diagnostic-only                 | Owner runs DevTools profiler                                                      |
| 5   | **KI-051 CSP fix for overpass-api.de**       | 2B   | No (deploy)                           | Single CSP edit                 | Owner deploys                                                                     |
| 6   | **KI-058 signed-URL persistence root-cause** | 2B   | Partial (AI can prep migration §3.17) | Migration + RLS                 | Owner runs SQL via dashboard                                                      |
| 7   | **KI-060 delete legacy edge functions**      | 2B   | No (owner dashboard action)           | Tiny                            | Owner clicks delete                                                               |
| 8   | **Pass 14 #8 / #9 re-evaluation**            | 2A   | Yes (after override)                  | Small                           | Owner reviews KI-119/120 decline rationale and chooses override or accept WONTFIX |
| 9   | **Pass 18 #1 Liquid Map keyframe swap**      | 2A   | Yes (after approval)                  | Medium (motion identity change) | Yes — taste call between coherence and bespoke signature                          |
| 10  | **KI-064 Honda Accord red rectangle**        | 2B   | No (data action)                      | Single record                   | Owner data action                                                                 |

**The top of this list is unambiguous:** unblock KI-002 (#1) and approve `.bd-report-progress-*` (#2). Those two actions close the last remaining surgical loops the AI sessions surfaced.

---

## 5. Dependencies + meta-decisions

- **KI-002 deploy must happen before KI-051 CSP deploy.** Both are deploy actions; stacking them risks the email path being broken longer than necessary if the CSP change introduces a regression. Sequence: KI-002 first, verify email fires, then KI-051.
- **KI-058 root-cause investigation should precede KI-060 cleanup.** Legacy edge functions may be implicated in the signed-URL persistence story; deleting them before root-cause confirmation removes diagnostic surface.
- **`.bd-report-progress-*` unlock is independent of the launch path.** It completes the LAW slip story but does not block launch. Owner can defer indefinitely without consequence; the only cost is the inconsistency between the report shell and the panel/badge family.
- **Pass 18 #1 (Liquid Map keyframe swap) is independent of the launch path.** It is a coherence-vs-signature taste call and has no functional impact.

---

## 6. Open questions for owner

These are decisions only the owner can make. Each is a real fork.

1. **`.bd-report-progress-*` cream migration:** should the report shell get the same cream migration that swept everywhere else through Passes 24/27/28, or is the report shell's white-inset specular intentional/grandfathered? **Both positions are defensible.** Argument for migration: completes the LAW slip story across the entire repo; eliminates the "different surface" exception that future audits will keep flagging. Argument for preservation: Sonnet Pass 9a audit boundary explicitly carved out the report shell as a different visual surface; the report shell carries trust weight (status / progress) and the high-α white inset reads as legitimate document-paper specular; migrating it changes the visual identity of a critical conversion surface.

2. **Pass 18 #1 Liquid Map Intelligence keyframe swap:** should the bespoke `bdLiquidGoldFlow` / `mapLiquidSheenDrift` keyframes swap to the canonical `orbDrift` for atmosphere coherence with the living-lava family, or preserve the bespoke flow as the map's signature motion? Argument for swap: coherence — every other living-lava surface uses canonical periods (`orbDrift` 28+36 / 32+44 / 24+38). Argument for preservation: the map is the product's hero surface; bespoke motion reads as intentional craft, not drift.

3. **Soft launch trajectory:** is the LAW_HARDENING_PLAN North Star ("one real customer → real shop → real bid → real job") still the priority and timeline (1–2 weeks soft launch), or has the goal shifted? This drives whether items 3+ on the recommended sequence get owner attention now or after first real-user signal.

4. **Pass 14 #8 / #9 re-evaluation:** the Pass 23 / 25 decline rationale (KI-119, KI-120) was authored under autopilot scope discipline. Owner reading the rationale may agree (accept WONTFIX permanently) or override (re-open as a sanctioned pass). Either is fine — but the items will sit in WONTFIX limbo until owner picks one.

5. **Living-lava `.bd-bloom-atmosphere` extension (Pass 16c):** owner can authorize **adding** new gradients to the host so the period-spread motion has something to drift over. This is a visual-identity change, not a motion change. Worth doing, or leave the host static?

---

## 7. After this plan ships

Per the Pass 29 brief's "After plan ships" clause: the builder may continue without stopping into any **sanctioned-narrow** code-only work the plan surfaces. Specifically:

- If the plan reveals a previously-missed narrow code-only item that's not gated → execute as Pass 30+.
- If the plan reveals a P1 KI that's actually still open and code-only fixable → execute.
- If the plan reveals a doc inconsistency (RESOLVED KI not yet doc-marked, etc.) → fix.
- **Do not** auto-take any 2A / 2B / 2C / 2F item — those are explicitly gated.
- **Do not** invent work — if the plan reveals nothing executable, stop.

**Audit outcome of the plan itself:** a deliberate sweep against `REF_KNOWN_ISSUES.md` at HEAD `774f6923` finds **zero** narrow code-only AI-actionable items remaining outside the gate categories above. The polish arc through Pass 28 was thorough. Pass 29 ships as the plan doc alone, and the codebase enters honest standby pending owner gate decisions on Section 6.

---

## 8. Stop conditions for the next session

Same as the brief specifies:

- Hard-NO surface inadvertently in the path → stop, ask.
- Taste call surfaces that the AI can't make alone → stop, ask.
- Validation goes red and the fix isn't obvious → stop, summarize.
- Regression caught (e.g. Pass 13i stale-bounds case) → fix as next pass, then stop.
- Context budget runs short → stop, summarize.
- Plan reveals nothing executable → stop, brief one-screen summary.

---

**End of plan.**
