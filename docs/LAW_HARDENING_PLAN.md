# BidOnDent — Hardening Plan (LAW)

**Authority level:** LAW — execution authority during the hardening phase. Governs all current work.

**Created:** 2026-04-14  
**Promoted to LAW tier:** 2026-04-16  
**Status:** IN PROGRESS  
**Purpose:** Single source of truth for the "harden and activate the marketplace loop" phase leading to soft launch. Captures every locked decision, rationale, and open question so the main AI on auto-pilot can execute without guesswork.

**Companion docs:** See `LAW_PROJECT_RULES.md` for permanent behavioral rules. See `REF_KNOWN_ISSUES.md` for the full known-issues inventory. See `REF_SYSTEM_STATE.md` for current architecture truth.

---

## North Star

> **"Does this serve the core transaction OR protect the product DNA that makes BidOnDent worth choosing over alternatives?"**
> If neither → defer. No new features beyond this filter. Harden, activate, launch.

**The goal is NOT:** more features, better UI, scaling infra.  
**The goal IS:** make one real customer → real shop → real bid → real job happen cleanly, while preserving the spatial-first identity that makes BidOnDent worth building.

(Refined from the original "one real transaction" filter during the 2026-04-16 planning session. The addition of "product DNA" ensures the map-first identity, premium design system, and PostGIS spatial infrastructure are protected — not just the raw transaction mechanics.)

---

## Timeline

- **1–2 weeks** → Soft launch (real users)
- **3–6 weeks** → First meaningful usage data
- **2–3 months** → Investor/demo-ready polish

Source: Pass 854 audit confirmed codebase is past "pre-product." Core loop is wired end-to-end. Biggest risk is not missing features — it's that no one is using the loop yet, and "fake vs real" ambiguity will erode trust the moment real users arrive.

---

## Biggest Risk (Refined)

**Not:** missing features, missing payments, missing push notifications.
**Actually:** mismatch between what the UI implies and what actually happens.

Every locked decision below is filtered through this lens: does it close the gap between implied reality and actual reality?

---

## Launch Scope Guardrails (Non-Negotiable)

These items are launch-scope regardless of which question group they originate from. They are listed here explicitly so the main AI does not quietly reclassify them as "post-launch" during execution drift.

- **Email delivery.** `RESEND_API_KEY` deployed to the Supabase edge function environment. Emails verified as actually sending end-to-end before launch. Email is NOT the same category as push notifications — push is deferred, email is not.
- **Observability.** Sentry is already wired in code ([src/main.tsx:10](src/main.tsx#L10), [sentryInit.ts](src/app/services/sentryInit.ts), [errorReporting.ts](src/app/services/errorReporting.ts)). Guardrail requires verifying `VITE_SENTRY_DSN` is configured in prod + staging and that capture actually fires end-to-end before launch. You cannot harden what you cannot see. No launch without proven capture.
- **Event capture quality.** Even though the audit logging dashboard (S2 in Post-Launch Roadmap) is deferred, the underlying event data is not. Every launch-critical event in `platform_activity_events` (or equivalent) must capture: actor ID, object ID, timestamp, outcome (success/failure), and sufficient context to reconstruct a user's journey. The dashboard can wait; the data cannot.
- **Global error boundary at app root.** Verify `ScreenErrorBoundary` (or equivalent) is wired at the application root, not only inside per-screen surfaces. Unhandled errors must never produce a blank white screen for real users.
- **Staging vs prod separation.** (Pending Group 7 lock, but flagged here as a guardrail — `main = production` with no staging environment is a launch risk that needs an intentional answer, not a default.)
- **Identity normalization on launch-critical tables.** Per Group 5b. Launch-first pragmatism means narrow scope, but it does NOT mean skipping it entirely.
- **RLS on every user- or business-relevant table.** Per Group 5a. Non-negotiable.

**Rule:** if execution wants to defer any of these, it must be explicitly reclassified with written justification in the Change Log — not silently dropped.

### Additional P0 Items (Surfaced 2026-04-16 Deep Planning Audit)

These items were identified during a four-pass deep system audit and are added as launch-scope guardrails:

- **Geographic filtering for shop marketplace view.** `useMarketplaceReports` currently fetches ALL damage reports with no pagination and no geographic filtering. Shops in Austin see reports from Miami. This makes the marketplace UX broken at any real scale. **Action:** Wire `getReportsInServiceArea` (already built) to filter shop reports by service area. As interim minimum, add `limit(100)` to the marketplace query. See `REF_KNOWN_ISSUES.md` KI-001.

- **Rate limiter identity from JWT, not query params.** The rate limit key is currently derived from `url.searchParams.get('clerkUserId')` — a client-supplied value that is easy to spoof. **Action:** Extract identity from the verified Clerk JWT session for rate limiting purposes. See `REF_KNOWN_ISSUES.md` KI-003.

- **Bid acceptance confirmation dialog.** Accepting a bid is a financial commitment but currently fires immediately on click with no confirmation step. Accidental mobile taps could accept unintentionally. **Action:** Add a confirmation dialog/bottom sheet before `onAcceptBid` fires. See `REF_KNOWN_ISSUES.md` KI-004.

- **User-visible error feedback on mutation failures.** Many async handlers (bid rejection, job status update, report completion, vehicle save) only `console.error` on failure. Users see nothing when operations fail. **Action:** Add toast notifications via existing `NotificationContext.showToast()` to all mutation failure paths. See `REF_KNOWN_ISSUES.md` KI-005.

---

## Locked Decisions

### Group 1 — Direction & Timeline ✅

**1a. Timeline:** Real users in 1–2 weeks (soft launch). Investor-ready polish 2–3 months out.

**1b. Focus:** STOP adding features. Harden + activate the marketplace loop. **No Phase 4 / payments yet.**

---

### Group 2 — Dev Workflow Going Forward ✅

**2a. Development model:** Main AI on auto-pilot executing a pre-agreed plan, with a smaller AI handling code cleanup / type error corrections as a support role. MolandJesus approves at checkpoints.

**2b. Progress tracking:** Switch primary "where are we" tool to the **Module Completion Matrix** (per-module: backend % / frontend % / tests / real data / prod-ready). Pass log continues from 855+ as historical audit trail only — no longer the primary tracker.

**2c. `DUAL_AI_COORDINATION.md`:** Archive to `docs/archive/` (don't delete — has historical context on why certain files were split between Claude and ChatGPT ownership).

---

### Group 3 — Demo vs Real Posture ✅

**3a. Demo mode (`VITE_DEMO_MODE`):** Keep in production, **hidden behind URL param** (e.g. `?demo=true` or `/demo`).

- When active, show an **explicit, unmistakable banner**: "You're in demo mode — no real jobs will be sent."
- Purpose: investor demos, shop recruiting, your own debugging.
- Must NOT be accessible from any normal navigation surface.

**3b. Map demo fallback (`VITE_ENABLE_MAP_DEMO_FALLBACK`):** **OFF in production.**

- No fake shop density. Ever.
- Replace with **conversion-focused empty states**:
  - "No shops in your area yet — we're onboarding shops right now. Be first in line when they go live."
  - Email capture + zip code capture.
  - "Are you a shop?" CTA → shop signup flow.
- Turns the weakness (cold-start) into a signal-gathering tool (demand + supply leads).

**3c. "Coming Soon" UI (PaymentModal, SettingsModal, etc.):** **Convert to waitlist / signal capture.**

- No dead buttons. No "coming soon" text without action.
- Every placeholder becomes a signal-capture moment:
  - Payments → "Get notified when payments go live"
  - Advanced settings → "Join beta access"
  - Push notifications → "Enable alerts when available"
- Outcome: learn what users actually care about → informs Phase 4 prioritization.

**3d. Market Status Layer (NEW — added during planning):** Introduce a transparent market-density indicator across the app.

- Surfaces: map, report flow confirmation, shop directory, landing page coverage areas.
- Examples: "No shops yet in this area" / "1 shop active" / "3 shops responding nearby."
- Purpose: align expectations _before_ users act, not after. Directly attacks the trust risk.

---

### Group 4 — Architecture Consolidation ✅

**Verification-first discipline confirmed:** Two of the original recommendations in this group were overturned after verifying load-bearing reality in the codebase. Going forward, destructive cleanup decisions (deletions, archival, source-of-truth changes) must be verified against the live code **before** locking, not during execution.

**4a. Type system — explicit adapter layer at service boundary only.**

- DB row types (`services/supabase/types.ts`, snake_case) stay **inside** the data/service layer. They do not escape.
- Adapters convert DB ↔ domain/UI models at the service boundary.
- Components and hooks consume normalized app-domain types (`app/types/index.ts`, camelCase) only.
- **No mapping logic in UI code. No mini-adapters scattered across components.**
- Full merge to a single canonical type set remains the long-term goal post-launch — clean, organized code is a stated priority alongside functionality and design.

**4b. Schema source of truth — SQL migrations are canonical law (updated Pass 871/877, Pass 10).**

- `supabase/migrations/20251230000001_full_schema.sql` = **canonical schema law.** Single source of truth. FROZEN — new schema goes in new timestamped migrations alongside it.
- `supabase/functions/server/database_init.tsx` = **validation-only safety net (Pass 10).** As of Pass 10 this file no longer runs DDL. It connects on cold start, verifies the required tables and the `requesting_clerk_user_id()` function exist, logs the result, and exits. The only DDL retained is a `CREATE OR REPLACE FUNCTION public.handle_updated_at()` which is idempotent and harmless. Load-bearing call site unchanged: [supabase/functions/server/index.ts:92](supabase/functions/server/index.ts#L92).
- `supabase/functions/server/handlers/health.ts` `migrateDatabase` = validation endpoint only (Pass 10). Previously contained redundant `ALTER TABLE` DDL; that has been removed.
- `supabase/functions/server/database_schema_sql_*.ts` = **reference-only dead code.** Removed in Pass 878.
- **Execution rule (updated Pass 871):** see Execution Discipline rule 4 below. Every schema-affecting change lands as a new migration file. No dual-path sync required.
- **Post-launch:** the Pass 10 conversion means `database_init.tsx` can be further simplified or removed once prod edge function is redeployed and we have observability that schema validation failures would be caught elsewhere.

**4c. Hardcoded Clerk + Supabase keys — migrate to `.env`.**

- Verified load-bearing in 3 runtime files: [App.tsx:61](src/app/App.tsx#L61), [services/supabase/runtime.ts:1](src/app/services/supabase/runtime.ts#L1), [utils/validateAppConfig.ts:8](src/app/utils/validateAppConfig.ts#L8). Deletion off the table.
- Migrate all key reads to `.env`-driven runtime config.
- Update all docs and error copy to stop telling users to edit source files: [README.md](README.md), [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md), [docs/GETTING_STARTED.md](archive/GETTING_STARTED_archived_2026-05-04.md), [AppShell.tsx:17](src/app/components/app/AppShell.tsx#L17) error copy.
- Enables clean staging vs prod key separation (ties directly into Group 7).

**4d. Meta — verification discipline (locked as ongoing rule).** Strategic decisions can lock now. Destructive decisions (deletion, archival, source-of-truth changes, runtime assumptions) must be verified against live code as part of the planning group before finalizing. Do not defer load-bearing claims to execution time.

---

### Group 5 — Security Posture ✅

**Execution order:** 5b (scoped) → 5a → 5c. Identity consistency must precede RLS authoring, but 5b is **not allowed to become an endless precondition** that blocks 5a. If 5b scope expands beyond launch-critical tables, do a launch-scope identity normalization first, ship RLS against those tables, and defer broader identity cleanup to the Post-Launch Roadmap.

**5a. RLS on every user- or business-relevant table before launch.**

- Current gap (verified in audit): `shop_interest_submissions`, `insurer_interest_submissions`, `platform_activity_events`, `job_assignments`, `notification_preferences`, `shop_service_areas`.
- Why: the Supabase anon key ships in the client bundle. Edge function auth alone is not enough — any user can open a console and query unprotected tables directly. RLS is the only real server-side enforcement for this architecture.
- Why not "edge-function-only access": Supabase Realtime uses direct client subscriptions, and Realtime is core to the product. Locking down client access kills Realtime.
- **Execution rule:** no table is considered prod-ready without RLS verification. The Module Completion Matrix must explicitly mark RLS status per table or module.

**5b. Unify on `clerk_user_id` (TEXT) as the forward identity standard — launch-first pragmatism.**

- Lock the standard now: `clerk_user_id` (TEXT) is the single identity column going forward.
- For soft launch, normalize only the **launch-critical tables** (the ones RLS policies will target). If the full migration scope is clean and small, do it all. If scope starts branching, stop, ship launch-critical normalization, and defer the rest to the Post-Launch Roadmap (A3).
- Why not bridge Clerk → Supabase Auth via webhook (the orthodox path): 2–3 days + webhook infra, too expensive for soft launch. See Post-Launch Roadmap A4 for the alternative future.
- Must happen **before** 5a RLS rollout, because RLS policies need to reference a consistent identity column.

**5c. Soft delete on critical tables — minimal implementation.**

- Scope: `reports` (damage_reports), `bids`, `job_assignments`, `vehicles`.
- Implementation: `deleted_at` column + filter deleted rows out of standard queries + update RLS policies to respect `deleted_at`.
- **No restore UI, no audit dashboard, no elaborate admin UX** for launch. Those live in the Post-Launch Roadmap (S1, S2).
- Backend-first, minimal, cheap. ~1 day of work.

---

### Group 6 — Cleanup Scope Confirmations ✅

All four areas verified against the live codebase before locking. See Change Log for verification-driven corrections.

**6a. Orphaned components — targeted handling, not blanket delete.**

- **Delete:** [src/app/components/admin/GoToAdminButton.tsx](src/app/components/admin/GoToAdminButton.tsx) — zero imports, flagged in archive docs as leaking sensitive data (user email, session tokens). Deleting is a mild security win.
- **Delete:** [src/app/components/auth/AccountTypeMigrationModal.tsx](src/app/components/auth/AccountTypeMigrationModal.tsx) — zero imports. "80% built unwired components" are mental clutter. Post-registration account switching is explicitly NOT launch-critical. Delete unless a confirmed near-term feature requires it (none identified at this time).
- **Keep and reuse:** [src/app/components/demo/DemoModeBanner.tsx](src/app/components/demo/DemoModeBanner.tsx) — Group 3a explicitly requires an "in demo mode" banner behind the URL param. Rebuilding it from scratch would be wasteful. This component becomes the implementation target for 3a.
- **Keep and wire if cheap; otherwise keep for immediate hardening follow-up:** [src/app/components/reports/MissingReportState.tsx](src/app/components/reports/MissingReportState.tsx) — "report not found" is a legitimate product state, not speculative UI. Do not park indefinitely — either wire it in during the hardening pass or rebuild minimally. Not a candidate for the Post-Launch Roadmap.

**6b. Unused devtools — be selective, do NOT wire all four by default.**

- **Wire into AdminDashboard (hardening-critical):**
  - [src/app/components/devtools/EdgeFunctionStatus.tsx](src/app/components/devtools/EdgeFunctionStatus.tsx) — direct launch value: at-a-glance view of whether edge functions are healthy.
  - [src/app/components/devtools/RealtimeStatusIndicator.tsx](src/app/components/devtools/RealtimeStatusIndicator.tsx) — direct launch value: at-a-glance view of whether Supabase Realtime is connected. Realtime is core to the product.
- **Validate then keep or cut:**
  - [src/app/components/devtools/StorageMonitor.tsx](src/app/components/devtools/StorageMonitor.tsx) — less central to launch confidence. Keep only if validated as working and genuinely useful for the hardening phase.
  - [src/app/components/devtools/StorageInspector.tsx](src/app/components/devtools/StorageInspector.tsx) — same. Archive docs flag a known `any` type issue. Keep only if validated; otherwise delete and don't rebuild.
- **Rule:** do not wire components into admin surfaces just because they exist. Value must be proven before they stay.

**6c. `make-server-9f243523/` legacy edge function alias — DEFER to Post-Launch Roadmap.**

- Verified as a live backward-compatibility layer with four touchpoints (runtime constant, path-stripping logic, deploy command, docs). Not a simple stub.
- Removing safely requires: verifying no clients still hit the legacy URL, removing the runtime constant and callers, removing the path-stripping logic, updating deploy commands, un-deploying the legacy function.
- Not launch-critical. Classic "cleaner-looking but not helpful for launch" work. Added to Post-Launch Roadmap.

**6d. Atlanta QA pack — convert to NY metro QA pack.**

- Atlanta 45-destination QA drive panel was a DEV-only dual-AI pass era artifact. Coverage area is NY metro, not Atlanta.
- Conversion gives immediate launch value: a QA drive panel populated with real NY destinations so manual navigation testing happens in the actual coverage area.
- Scope: `atlantaQADestinations.ts`, `atlantaTestHubSeedData.ts`, their tests, and `ShopDirectoryQADrivePanel.tsx`. Do NOT touch unrelated test fixtures that happen to use "Atlanta" as a generic string — those test different logic.
- This is one of the few cleanup tasks that also creates launch value, so it passes the North Star test.

---

### Group 7 — Launch-Operability Prerequisites ✅

**Framing rule:** Group 7 is about launch _operability_, not general infrastructure polish. Every item in this group answers the question "is the launch actually survivable?" — not "is the infra pretty?" If execution tries to expand this group into platform work, push back.

**7a. Staging vs prod — Vercel preview deployments as practical staging, backed by staging Supabase config.**

- Use Vercel PR preview URLs as the de-facto staging tier.
- Point previews at a **staging Supabase project** (or staging schema on the same project, if simpler) via env var overrides.
- One clean flow: branch/PR → Vercel preview URL → verify auth, edge functions, realtime, email sending, error tracking → merge to `main` → prod.
- **Keep it minimal.** Do NOT build a separate heavyweight staging environment or a second Vercel project. Previews + staging env vars are enough for soft launch.
- What this buys you: a real pre-prod check for auth, edge functions, realtime, env/config mistakes, email behavior, error tracking wiring.

**7b. `RESEND_API_KEY` — verification + deployment + proof of one real email.**

- This is an **execution verification item**, not a strategy question. The lock is the action, not the decision.
- Execution sequence:
  1. Verify whether `RESEND_API_KEY` is already in the Supabase edge function environment.
  2. If not, deploy it. Requires a Resend account + API key; treat Resend account setup itself as in-scope launch work if the account does not exist yet.
  3. Prove at least **one end-to-end email flow** actually lands in a real inbox (e.g., new-bid notification to a test customer) before launch.
- Launch cannot proceed without this working. Already listed under Launch Scope Guardrails as non-negotiable.

**7c. Geocoding — stay on Nominatim for soft launch. Defer provider migration.**

- Do not proactively migrate. A proactive migration now is classic overbuilding: more config, more vendor complexity, more cost, zero immediate launch benefit.
- **Trigger for migration:** rate limit incidents, reliability issues, or daily report volume exceeding Nominatim's polite-use threshold. Not "professionalism."
- **Soft future preference (not a lock):** Mapbox if the priority is a developer-friendly mapping/geocoding ecosystem fit, Google if the priority is broadest enterprise reliability / mature geocoding depth. Decision not required until the trigger fires.
- Tracked in Post-Launch Roadmap as I1.

**7d. Prod-readiness smoke-test checklist (new — added during planning).**

- Before launch, a short checklist of concrete smoke tests must be run against the staging environment AND again against prod after deploy. Items at minimum:
  - Sign up a new customer end-to-end (Clerk → Supabase profile created).
  - Submit a damage report with at least one photo upload.
  - From a shop account, see the new report and submit a bid.
  - From the customer account, accept the bid, confirm competing-bid auto-reject and job assignment.
  - Receive the confirmation email (proves 7b is working).
  - Open navigation to the shop, confirm route and turn-by-turn work.
  - Verify observability captures a deliberately-triggered error.
  - Verify RLS by attempting direct Supabase client queries on protected tables from an unauthenticated session — must fail.

---

## Open Questions (Still To Decide)

_All 7 groups locked as of 2026-04-14. No open questions. Any new ambiguity surfaced during execution must be brought back here for explicit lock before proceeding._

---

## Execution Plan

**Purpose:** Ordered, concrete work for the main AI on auto. Each phase is a work block with explicit dependencies, parallel-safe markers, and a checkpoint gate where MolandJesus reviews before the next block begins. Do not reorder phases. Do not merge phases. If execution discovers a blocker, stop at the current phase and bring it back to the open questions section for an explicit lock before continuing.

**Pass numbering:** Continue from pass 855+. Each pass follows the existing "one coherent change per pass" discipline. Pass log remains the historical audit trail; the Module Completion Matrix (built in Phase 5) is the primary "where are we" tool going forward.

**Parallel-safe vs sequential:** Items within a phase may be done in parallel unless marked `[SEQ]`. Phases themselves are sequential except where noted.

---

### Phase 0 — Pre-flight Verification 🛑 Checkpoint gate

**Purpose:** Establish ground truth before any work begins. Verification-first discipline applies.

Work items:

1. Audit the current state of every Launch Scope Guardrail:
   - Is `RESEND_API_KEY` deployed to Supabase edge function env? (yes/no + evidence)
   - Is Sentry capture actually firing? `initSentry()` is already called from [src/main.tsx:10](src/main.tsx#L10) and [sentryInit.ts](src/app/services/sentryInit.ts) is wired — verify `VITE_SENTRY_DSN` is set in prod/staging env and that a deliberate test error reaches the dashboard. This is verification, not installation.
   - Is `ScreenErrorBoundary` (or equivalent) wired at the **application root**, not just per-screen? (yes/no + file/line)
   - Does `platform_activity_events` currently capture actor/object/timestamp/outcome, or is the data thin? (report sample rows)
   - Which of the 6 launch-critical tables currently have RLS policies? (list per table)
   - Are `clerk_user_id` vs `user_id` columns used consistently or inconsistently per table? (report the split)
2. **Rate-limiter coverage audit.** `rateLimiter.ts` exists and is wired into the edge function middleware at [supabase/functions/server/index.ts:88,120-121](supabase/functions/server/index.ts#L88). Verify that every launch-critical write endpoint (report create, bid create, bid accept/job assignment, estimate submit, onboarding submits) is actually covered by a `rateLimitType` classification. Report any uncovered endpoint — do NOT build new limiter logic, just confirm or flag gaps.
3. **Legal/trust-surface audit.** [TermsOfServicePage.tsx](src/app/components/legal/TermsOfServicePage.tsx) and [PrivacyPolicyPage.tsx](src/app/components/legal/PrivacyPolicyPage.tsx) exist and are routed in [App.tsx:266-267](src/app/App.tsx#L266-L267). Verify: (a) both pages are reachable from the footer/nav on launch surfaces, (b) content is not visibly placeholder/stale, (c) nothing in either page is actively misleading about current functionality (e.g., claims about payments when payments are not live). Fixes go into Phase 1. No full compliance rewrite.
4. Re-verify Group 4b and 4c load-bearing claims still hold (in case of drift since 2026-04-14 planning).
5. Re-verify Group 6 orphaned-component and devtools import counts are still zero.
6. Produce a concrete **Pre-flight Report** documenting findings and the resulting punch list going into Phase 1.

**Gate criteria:** Pre-flight Report must explicitly mark each Launch Scope Guardrail as one of: **already satisfied**, **missing**, or **needs verification fix**, with file/line or runtime evidence for each. No Phase 1 start until every guardrail has an owner action attached. MolandJesus reviews the report; any surprising findings (e.g., guardrails unexpectedly met, or load-bearing claims changed) must be reconciled before Phase 1 begins.

---

### Phase 1 — Safe Cleanup + Early Observability 🛑 Checkpoint gate

**Purpose:** Get visibility installed and remove dead weight. **Parallel-safe block.** This phase does not touch architecture or security — only additive observability and subtractive cleanup.

Why observability is in Phase 1: you cannot harden what you cannot see. Any breakage introduced by Phase 2+ must be immediately visible.

Work items (parallel-safe):

**1.1 Observability verification (not installation) — highest priority in this phase**

- **Sentry is already installed and wired.** [src/main.tsx:10](src/main.tsx#L10) calls `initSentry()`, [sentryInit.ts](src/app/services/sentryInit.ts) owns the lifecycle, [errorReporting.ts](src/app/services/errorReporting.ts) is the capture adapter, existing error boundaries (`GlobalErrorBoundary`, `NavigationErrorBoundary`, `ImageErrorBoundary`) already route through it. **Activation is just setting `VITE_SENTRY_DSN` in `.env`.** Do NOT re-install or replace the SDK.
- Verify `VITE_SENTRY_DSN` is configured in prod and staging env (ties into Phase 1.5 `.env` migration).
- Verify frontend capture works end-to-end with one deliberate test error that reaches the Sentry dashboard.
- Verify at least one error boundary actually routes a thrown error through `errorReporting.ts` → Sentry.
- Verify edge function / server-side capture path if a Deno integration is configured; if not configured, flag it as a decision (add to Phase 1 punch list or consciously defer — but the decision must be explicit, not silent).
- Keep it minimal: no custom dashboards, no alerting config beyond defaults.

**1.2 Global error boundary verification + fix**

- Audit `ScreenErrorBoundary` wiring at the application root in [src/app/App.tsx](src/app/App.tsx) and [src/app/components/app/AppShell.tsx](src/app/components/app/AppShell.tsx).
- If the root is not protected, wire the boundary there. Verify that a deliberate thrown error in a child component produces a graceful fallback UI, not a blank white screen.
- The fallback UI must route the error into the observability layer from 1.1.

**1.3 Group 6 deletions (confirmed safe)**

- Delete [src/app/components/admin/GoToAdminButton.tsx](src/app/components/admin/GoToAdminButton.tsx).
- Delete [src/app/components/auth/AccountTypeMigrationModal.tsx](src/app/components/auth/AccountTypeMigrationModal.tsx).
- Do NOT delete `DemoModeBanner.tsx` — reserved for Phase 4 (Group 3a reuse).
- Do NOT delete `MissingReportState.tsx` — reserved for Phase 4 wire-in.

**1.4 Group 6 devtool wiring (selective)**

- Wire [src/app/components/devtools/EdgeFunctionStatus.tsx](src/app/components/devtools/EdgeFunctionStatus.tsx) into AdminDashboard.
- Wire [src/app/components/devtools/RealtimeStatusIndicator.tsx](src/app/components/devtools/RealtimeStatusIndicator.tsx) into AdminDashboard.
- Validate `StorageMonitor.tsx` and `StorageInspector.tsx`. If they work and are genuinely useful → wire them. If not → delete. Do not rebuild.

**1.5 Group 4c — `.env` migration**

- Migrate `clerkPublishableKey` and Supabase `projectId` / `publicAnonKey` from [utils/clerk/info.tsx](utils/clerk/info.tsx) and [utils/supabase/info.tsx](utils/supabase/info.tsx) into `.env`-driven runtime config.
- Update the 3 verified callers: [App.tsx:61](src/app/App.tsx#L61), [runtime.ts:1](src/app/services/supabase/runtime.ts#L1), [validateAppConfig.ts:8](src/app/utils/validateAppConfig.ts#L8).
- Update docs so nothing tells users to edit source files: [README.md](README.md), [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md), [docs/GETTING_STARTED.md](archive/GETTING_STARTED_archived_2026-05-04.md), and the error copy in [AppShell.tsx:17](src/app/components/app/AppShell.tsx#L17).
- Keep `info.tsx` files as thin re-exports from env, OR delete them after callers are migrated (prefer delete for cleanliness).
- **Preserve current runtime behavior during the migration.** Config centralization is the goal; changing effective keys, environment resolution order, or fallback behavior is not. A successful `.env` migration must be indistinguishable from the prior hardcoded path at runtime.

**1.6 Group 2c — archive `DUAL_AI_COORDINATION.md`**

- Move to `docs/archive/`. Do not delete.

**1.7 Group 6d — Atlanta QA pack → NY metro conversion**

- Build a 45-destination NY metro pack covering the real coverage area (Westchester, Rockland, Dutchess, etc.). Use a mix of commercial, residential, landmark, and transit destinations.
- Update [atlantaQADestinations.ts](src/app/services/intelligence/atlantaQADestinations.ts) → rename to `nyMetroQADestinations.ts` with new data.
- Update [atlantaTestHubSeedData.ts](src/app/services/intelligence/atlantaTestHubSeedData.ts) → rename accordingly.
- Update all imports and their tests.
- Update [ShopDirectoryQADrivePanel.tsx](src/app/components/shop/ShopDirectoryQADrivePanel.tsx) to use NY metro data.
- Do NOT touch unrelated test fixtures that use "Atlanta" as a generic string (identity sanitizers, market intelligence, etc.).

**Gate criteria:** Observability captures a deliberate test error. Global error boundary catches a deliberate thrown error. All deletions complete with no broken imports. `.env` migration verified in dev + preview deploy. NY metro QA pack usable for a manual drive test.

---

### Phase 2 — Architecture Foundations 🛑 Checkpoint gate

**Purpose:** Lay the consistent identity and type groundwork that Phase 3 security hardening depends on. **Sequential — do not parallelize these items with each other.**

Work items:

**2.1 [SEQ] Group 4a — Adapter layer at service boundary**

- Define the canonical app-domain types in [src/app/types/index.ts](src/app/types/index.ts) (camelCase).
- **Launch-critical first.** Start with the launch-critical flows: reports, bids, jobs, vehicles, shop profiles, activity events. Only expand to the remaining models (insurer profiles, estimates, service areas, preferences) **if the pattern is stable and the pass remains contained**. If scope starts ballooning, stop, ship the launch-critical adapters, and defer the rest to Post-Launch Roadmap A1.
- For each in-scope data model that crosses the DB↔UI boundary, build explicit `fromDb()` and `toDb()` adapters in the service layer.
- Adapters live in the corresponding `services/supabase/*.ts` files. **No mapping logic in components or hooks.**
- Components and hooks consume only domain types. Reject any PR/pass that leaks snake_case DB types into UI code.
- Fix the known `Vehicle.year` type conflict (string vs number) — pick number, adapt on the way in.

**2.2 [SEQ] Group 5b — Launch-critical identity normalization**

- Identify the launch-critical tables (the ones that will have RLS policies in Phase 3). At minimum: `damage_reports`, `bids`, `job_assignments`, `vehicles`, `shop_profiles`, `insurer_profiles`, `notification_preferences`, `shop_service_areas`, `estimate_requests`, `platform_activity_events`.
- For each, normalize to `clerk_user_id` (TEXT) as the primary identity column. Write migrations.
- Update all service-layer code to use `clerk_user_id` consistently.
- **Launch-first pragmatism:** if scope expands beyond these tables, stop, document the remaining work in [PLAN_POST_LAUNCH_ROADMAP.md](PLAN_POST_LAUNCH_ROADMAP.md) under A3, and proceed to Phase 3. Do NOT let identity cleanup block RLS rollout.
- ~~Schema sync execution rule~~ — **Superseded by Pass 871.** Migrations folder is the sole authority; `database_schema_sql_*.ts` helpers are dead code. See Execution Discipline rule 4.

**Gate criteria:** Launch-critical flows have **no verified DB-type leaks into UI code**, adapter functions exist for each launch-critical model, and a grep/typecheck review confirms no new snake_case DB types are consumed directly in components/hooks for those flows. Launch-critical tables all use `clerk_user_id`. Full test suite still passing (543+/555 baseline, do not regress). No runtime errors in preview env.

---

### Phase 3 — Security Hardening 🛑 Checkpoint gate

**Purpose:** Close the trust gap. Depends on Phase 2 identity consistency.

Work items:

**3.1 [SEQ] Group 5a — RLS on launch-critical tables**

- Write and apply RLS policies for each launch-critical table identified in 2.2.
- Policies must reference `clerk_user_id` consistently.
- Required policies per table (at minimum):
  - Owner can select/insert/update/delete their own rows.
  - Cross-user read only where explicitly required by product logic (e.g., shops reading reports in their service area, customers reading bids on their reports).
  - No anon/public access unless explicitly required (e.g., landing page coverage stats).
- Test each policy by attempting direct Supabase client queries with and without auth from a browser console. RLS must block what it should block.
- **Save a short verification artifact per table**: query attempted, auth state, expected result, actual result. A small markdown table in the pass log is sufficient. "Tested manually" is not an acceptable gate claim.
- Update the Module Completion Matrix as each table is cleared.

**3.2 Event capture quality verification (Launch Scope Guardrail)**

- Audit `platform_activity_events` (or equivalent) capture paths across all launch-critical flows: report creation, bid creation, bid acceptance, job assignment, shop onboarding, customer signup.
- Each event must include: actor ID (clerk_user_id), object ID, object type, timestamp, outcome (success/failure), and a JSON context payload with enough info to reconstruct the user's journey.
- Fix any gaps. No dashboard work — data capture only.

**3.3 Idempotency / duplicate-submission protection for launch-critical write flows (narrow scope)**

- **Verify or add** duplicate-prevention for the following flows only: report submission, bid creation, bid acceptance / job assignment transition, and the outbound email side effects tied to those writes. This is NOT a mandate to build a full idempotency framework.
- UI-level `isSubmitting` / debounce is helpful but insufficient on its own. The concern is retries, double-clicks across tabs, network resubmits, repeated edge-function invocation, and duplicate email side effects.
- Acceptable minimum: server-side dedupe via unique constraint, idempotency key, or state-machine check that rejects a repeat transition (e.g., a bid in `accepted` state cannot be accepted again; a report with the same `(clerk_user_id, client-provided request id)` cannot insert twice within a short window).
- For each of the four flows, produce a one-line verification artifact: flow → mechanism → test performed → result. Same lightweight format as the RLS artifacts in 3.1.
- If existing protection already exists (e.g., unique constraints, state checks), mark it verified and move on. If it does not exist, add the narrowest viable protection — do not turn this into a framework project.

**3.4 Group 5c — Minimal soft delete**

- Add `deleted_at TIMESTAMPTZ NULL` to: `damage_reports`, `bids`, `job_assignments`, `vehicles`.
- Update all standard queries to filter `deleted_at IS NULL` by default.
- Update RLS policies so soft-deleted rows are not returned.
- Replace existing hard-delete calls with soft-delete calls.
- **No restore UI. No audit dashboard. Backend-only.** Admin restore UI is deferred to S1 in the Post-Launch Roadmap.

**Gate criteria:** Every launch-critical table has RLS verified by direct-client query attempts with per-table artifacts saved. Event capture populates all required fields in a live test flow. Idempotency / duplicate-submission protection is verified (or added) on all four launch-critical write flows with per-flow artifacts saved. Soft delete works end-to-end on at least one table (verify a deleted bid disappears from standard queries but remains in DB).

---

### Phase 4 — Trust Surfaces (Higher Urgency + Tightly-Scoped Addendum) 🛑 Checkpoint gate

**Purpose:** Close the "UI implies vs reality" gap defined as the biggest launch risk. Split into two sub-phases by urgency per ChatGPT pressure-test.

#### Phase 4A — Higher-urgency trust surfaces (parallel-safe)

**4A.1 Group 3a — Demo mode URL param + explicit banner**

- Gate demo mode on a URL param (`?demo=true` OR a `/demo` route — pick one, be consistent).
- Reuse [DemoModeBanner.tsx](src/app/components/demo/DemoModeBanner.tsx) as the implementation target. Do not rebuild.
- Banner copy: "You're in demo mode — no real jobs will be sent." Must be unmistakable, not a subtle chip.
- Demo mode must NOT be accessible from any normal navigation surface.
- Verify: a real visitor landing on `/` never sees demo state.

**4A.2 Group 3b — Map fallback OFF in prod + honest empty states with conversion**

- Turn `VITE_ENABLE_MAP_DEMO_FALLBACK` off in production env.
- Replace empty-state UI with conversion-focused copy: "No shops in your area yet — we're onboarding shops right now. Be first in line when they go live."
- Add: email capture + zip code capture form on empty states.
- Add: "Are you a shop?" CTA linking to shop signup flow.
- Store captures in a new `waitlist_signups` table (or reuse `shop_interest_submissions` / `insurer_interest_submissions` if schema fits). **Prefer reusing an existing submission table only if it preserves semantic clarity and does not force mixed-purpose records that will complicate follow-up workflows.** If reuse would muddy the table's purpose, create `waitlist_signups`.

**4A.3 Group 3c — Coming Soon → waitlist conversion**

- [PaymentModal.tsx](src/app/components/codelayer/account/PaymentModal.tsx): replace "Billing tools are coming soon" with "Get notified when payments go live" + email capture.
- [SettingsModal.tsx](src/app/components/codelayer/account/SettingsModal.tsx): replace disabled-with-badge fields with "Join beta access" capture where appropriate, or hide entirely.
- No dead buttons. Every clickable surface does something.
- Reuse a single `WaitlistCapture` component so future deferred features can add one line to get a capture surface.

**4A.4 Group 6 — `MissingReportState` wire-in**

- Wire the existing [MissingReportState.tsx](src/app/components/reports/MissingReportState.tsx) into the report detail route as the 404/error state.
- If the existing component needs more than a quick update to fit, rebuild minimally rather than forcing the old one.
- Do NOT skip this — "report not found" is a legitimate product state and shipping without it = bad UX on a broken link.

#### Phase 4B — Market Status Layer (tightly scoped)

**4B.1 Group 3d — Market status layer MVP**

- **Tight scope.** One component, reused in 3–4 places max. Not a redesign.
- Possible surfaces: map overlay corner, report confirmation screen, shop directory header, landing page coverage section.
- Content rules:
  - "No shops yet" when count = 0.
  - "1 shop active" / "N shops active" when count > 0.
  - "N shops responding nearby" only if realtime response data is already available (do not build new real-time pipelines for this).
- **Do not invent new realtime pipelines, new data sources, or new UX flows for this.** If the data isn't already wired, use what's available or skip that surface.
- If any one surface takes more than a few hours to wire, cut the surface from scope — do not expand.

**Gate criteria:** Demo mode never surfaces to real visitors. Empty states no longer show fake shops. No dead Coming Soon buttons. **One reusable market-status component is live on at least 2 approved surfaces, uses existing data only, and required no new backend endpoint, no new realtime pipeline, and no page-layout redesign.** `MissingReportState` handles a deliberate broken URL test.

---

### Phase 5 — Launch Operability 🛑 Checkpoint gate

**Purpose:** Everything that makes the launch actually survivable. Depends on prior phases being stable.

Work items:

**5.1 Group 7a — ~~Vercel previews as practical staging~~ Local dev + staging Supabase** _(Updated 2026-04-15)_

- ~~Configure Vercel preview deployments to use staging Supabase config via env var overrides.~~
- Staging Supabase project `lhhdqycnhweaxqviwdqt` created and fully bootstrapped (Pass 872).
- Local Docker dev stack running via `supabase start` with consolidated migration (Pass c2b44425).
- Edge function deployed to staging (Pass 880) and serving locally.
- Primary dev/test workflow: `localhost:5173` + local Supabase Docker stack. Deployment method (Vercel or otherwise) is TBD and does not gate any Phase 5/6 work.
- **Status: COMPLETE.** Local stack + staging Supabase are sufficient for all development and smoke testing.

**5.2 Group 7b — RESEND verification + deployment + one real email proof**

- Verify whether `RESEND_API_KEY` is already in the Supabase edge function env.
- If missing: create/confirm a Resend account, generate an API key, deploy it to Supabase edge function env.
- Send one end-to-end test email through the real Resend integration (e.g., a new-bid notification to a test customer inbox).
- Confirm delivery with a screenshot or log entry. Do not mark this done based on "the code runs" — mark done only when an email lands in an inbox.
- **Produce a launch-critical email mapping table** covering every notification the four handler functions in [supabase/functions/server/handlers/notificationEmails.ts](supabase/functions/server/handlers/notificationEmails.ts) can send (notifyCustomerNewBid, notifyShopBidStatus, notifyCustomerClaimDecision, and any others present). Columns: **trigger event → expected recipient → template used → expected timing → observed result**. Fill by running each happy-path trigger once. "One real email landed" is necessary but not sufficient — the mapping table catches wrong-event, missing-event, and duplicate-event failures that single-email proof cannot.
- **If domain-based sending is intended for launch, verify sender identity configuration (SPF/DKIM/verified domain) is sufficient for actual delivery, not just sandbox acceptance.** Not a full deliverability project — just enough to prevent the false-positive where email technically sends in test but prod sender reputation/config silently breaks delivery.

**5.3 Group 2b — Module Completion Matrix, first populated version**

- Build the Module Completion Matrix as a new doc (or section of an existing doc): `docs/REF_MODULE_STATUS.md`.
- Columns per module: Backend %, Frontend %, Tests, Real Data, RLS Status, Prod-Ready %.
- Populate from current state of each module after all prior phases complete.
- **Keep the first version minimal and evidence-based.** Do not turn the matrix into a second planning system. It exists to reflect reality, not to prescribe work.
- This matrix becomes the primary "where are we" reference going forward, replacing the pass log as the day-to-day tracker.

**Gate criteria:** Local dev server (`localhost:5173`) proves end-to-end against local or staging Supabase. At least one real email delivered to a real inbox. Module Completion Matrix populated and reviewed.

---

### Phase 5.5 — Validated Launch-Critical Hardening Passes (2026-04-25) 🛑 Checkpoint gate

**Purpose:** Three contained, validated passes from the 2026-04-25 verification + execution-brief mode review against the deep audit's three highest-severity findings. Each pass is small, launch-relevant, and execution-ready. Pass 1 is a P0 launch blocker; Passes 2 and 3 are P1 pre-launch fixes. Execute strictly in order with owner approval at each gate — Pass 1 in particular is auth-touching and must not be applied silently.

**Verification context (verified 2026-04-25):**

- Build green (`npm run build` 3.42s); tests 568/568 passing.
- Edge function `server` is deployed with `--no-verify-jwt` (verified in `docs/archive/MAP_TRACKER_PASSES_1_499.md:1011` and required by the Clerk JWT auth model — Supabase gateway cannot verify Clerk-issued tokens). All `server` routes are reachable from the open internet; handler-level auth is the only enforcement point.
- Service-role Supabase client at [supabase/functions/server/config/clients.ts:13](../supabase/functions/server/config/clients.ts#L13) bypasses RLS — handler authorization is load-bearing.
- Validation cross-checked by ChatGPT spot-read; the one open caveat (`--no-verify-jwt` deployment dependency) was resolved against repo evidence.

**Pass 1 — Workflow handler authorization (P0 launch blocker)**

See **KI-048** in `REF_KNOWN_ISSUES.md` for the full evidence and misuse paths.

- File: `supabase/functions/server/handlers/workflow.ts` (plus optional `requireInsurerContext` helper in `supabase/functions/server/utils/authz.ts`).
- Changes:
  - `getJobAssignments`: add `requireClerkSession` + assert `session.clerkUserId === shopClerkUserId` OR admin.
  - `updateJobAssignmentStatus`: pre-fetch the assignment, assert caller is one of `shop/customer/insurer_clerk_user_id` OR admin.
  - `createJobAssignment`: assert `session.clerkUserId === payload.customer_clerk_user_id` OR admin (note: post-KI-022, the server-side accept-bid flow in `bids.ts` is the primary creator — this endpoint is the fallback).
  - `submitInsuranceClaim` and `updateClaimDecision`: replace `requireMarketplaceContext` with insurer-only check (`profile.account_type === "insurer" || profile.is_admin`). UI callers are insurer-only verified — no UI surface affected.
- Required artifacts (per the Phase 3 discipline): for each of the five routes, save `route → caller role → expected status → actual status` evidence in the pass log.
- Tests: add Vitest coverage for the four authorization cases (unauthenticated, cross-shop read, cross-user mutation, shop-on-claim-decision).
- Requires edge function redeploy.

**Pass 2 — Customer completion lifecycle propagation (P1)**

See **KI-049** in `REF_KNOWN_ISSUES.md`.

- File: `supabase/functions/server/handlers/reports.ts` (server). Optional minor refetch in `src/app/utils/buildDashboardRouterProps.ts` (client).
- Change: when `updateReport` sets `status = "completed"`, also update the active `job_assignments` row (status in `scheduled`/`in_progress`/`awaiting_parts`) to `completed`. Emit a `repair_completed` activity event referencing both IDs.
- Must remain unchanged: bid-accept atomic flow in `bids.ts`; the bid-accept "active vs accepted" label (adapter-reconciled, not drift); shop-driven status updates from Active Jobs.
- Tests: handler test for `updateReport` covering completion propagation and non-completion no-op.
- Requires edge function redeploy.

**Pass 3 — Remove SEED fallback from authenticated marketplace (P1)**

See **KI-050** in `REF_KNOWN_ISSUES.md`.

- File: `src/app/routers/useDashboardData.ts` (single hook change). Three small prop simplifications in shop/insurer screens become optional cleanup (banner blocks become unreachable but harmless).
- Change: replace [lines 121-122](../src/app/routers/useDashboardData.ts#L121-L122) with `const shopInsurerReports = liveMarketplaceReports; const usingSeedFallback = false;`. Drop `SEED_DAMAGE_REPORTS` import. `SEED_DAMAGE_REPORTS` constant stays defined for demo-mode use.
- Must remain unchanged: seed-id mutation guards (belt-and-suspenders); `useMarketplaceReports` hook contract; the toast on fetch-failure.
- Tests: update any Vitest assertions that check `isSeedData = true` or seed-record counts on these screens.
- No backend change, no edge function redeploy.

**Sequencing rule:** Pass 1 lands and is verified against its per-route artifact checklist before Pass 2 begins. Pass 2 lands and is verified end-to-end (customer confirms completion → shop sees `completed` in Active Jobs) before Pass 3 begins. Each pass is its own commit; Passes 1 and 2 require an edge function deploy.

**Gate criteria:** All three passes complete. Pass 1 produces per-route authorization artifacts for the five routes. Pass 2 verified end-to-end on a real customer→shop flow. Pass 3 verified on a brand-new shop account (empty state renders, no seed records visible). All three KIs (KI-048, KI-049, KI-050) marked RESOLVED in the same pass that fixes them.

---

### AI Role Split for Phase 5.5 (Group 2a reaffirmation)

For the three-pass execution:

- **Primary (Opus):** Owns each pass end-to-end — code change, tests, manual verification artifacts, doc updates in the same pass per the doc-sync rule. Does not start Pass N+1 until Pass N is approved at the gate.
- **Secondary (Sonnet):** Targeted support after each Opus pass — runs `npm run build && npm test`, surfaces any TypeScript drift or test regressions, performs a focused visual smoke check on the three primary surfaces (`ShopRequestsScreen`, `ShopActiveJobsScreen`, `InsurerClaimsScreen`) in light + map-dark modes after Pass 3. Does not author new code unless explicitly handed a fix list.
- **Owner approval gate:** MolandJesus reviews each pass at the gate before the next begins. Pass 1 in particular is auth-touching and must not be applied silently — explicit approval required before merge and before edge function redeploy.

---

### Phase 6 — Pre-launch Verification Gate 🛑 Final checkpoint before launch

**Purpose:** Last line of defense. Group 7d smoke-test checklist run against staging, then against prod after deploy.

**6.1 Run smoke-test checklist against local dev server**
Run every item in the Group 7d checklist on `localhost:5173` with the local Supabase Docker stack (or staging Supabase keys in `.env`). **The full end-to-end happy path must be executed using a fresh customer account AND a fresh shop account in one uninterrupted run** — not seeded/demo identities, not previously used test accounts. Seeded/reused accounts can hide onboarding, profile initialization, identity linkage, role-specific permission, and duplicate-record bugs that only appear on day-one users. Record each step with evidence (screenshot or log line).

Additionally, verify **legal-surface discoverability** as part of the smoke test: from the landing page nav/footer, both Terms of Service and Privacy Policy must be reachable in one click, must render, and must not contain content that is visibly misleading about current launch functionality (e.g., references to payments while payments are not live).

- Sign up a new customer end-to-end (Clerk → Supabase profile created).
- Submit a damage report with at least one photo upload.
- From a shop account, see the new report and submit a bid.
- From the customer account, accept the bid, confirm competing-bid auto-reject and job assignment.
- Receive the confirmation email (proves 7b is working).
- Open the navigation flow to the shop, confirm route and turn-by-turn work.
- Verify observability captures a deliberately-triggered error.
- Verify RLS by attempting direct Supabase client queries on protected tables from an unauthenticated browser console — must fail.

**6.2 Deploy to prod**

- Merge the hardening branch(es) to `main`.
- Deploy via chosen method (TBD — not blocking Phase 5/6 work).

**6.3 Re-run smoke-test checklist against prod**
Same checklist, against the live prod URL. Everything must pass.

**6.4 Soft launch**

- The loop is now survivable. Start inviting real users per the launch plan.
- First priority: one real transaction cleanly, end-to-end.

**Gate criteria:** Every smoke-test item passes on both staging and prod. No regressions from Phase 4 changes. Observability is catching real events. Emails are landing.

---

## Execution Discipline (Standing Rules)

1. **Verification-first.** Any destructive action (deletion, archival, source-of-truth change, removal of load-bearing code) must be verified against the live code in the current pass, not assumed from the plan. If verification contradicts the plan, stop and escalate. **Edge function corollary (added Pass 11a, 2026-04-15):** changes to any file under `supabase/functions/**` must be verified via a live cold-start (`supabase functions serve` or equivalent) before commit. `npm run build` and `tsc --noEmit` do **not** typecheck the Deno runtime — a file can compile clean under Vite and still fail to parse at edge function boot. Pass 10 shipped broken this way and the follow-up cleanup audit missed it. Live cold-start is the only authoritative check.
2. **North Star filter.** For every in-phase pass, ask: "Does this help one real transaction happen cleanly, end-to-end?" If no, defer to the Post-Launch Roadmap instead of shipping it.
3. **No scope expansion.** If a pass needs work beyond its stated scope, stop and document the addition as a new planned pass. Do not silently expand.
4. **Schema source of truth (Group 4b, updated Pass 871).** `supabase/migrations/` is the single authoritative schema source. Every schema-affecting change goes in a new migration file. `database_init.tsx` is a legacy cold-start safety net only — no new schema logic there. `database_schema_sql_*.ts` helpers are reference-only dead code.
5. **Launch Scope Guardrails are inviolable.** If execution wants to defer one, it must be explicitly reclassified with written justification in the Change Log. Otherwise they ship.
6. **Checkpoint gates are hard stops.** Do not begin the next phase until MolandJesus has reviewed the prior phase's gate criteria.

---

## Change Log

### Planning phase (2026-04-14)

- Document created. Groups 1–7 locked after codebase verification and adversarial pressure-testing.
- Launch Scope Guardrails added (email, observability, event capture, error boundary, identity normalization, RLS).
- Execution Plan written: Phases 0–6 with checkpoint gates. Execution Discipline standing rules added.
- Phase 3.3 (idempotency) and Phase 5.2 (email trigger mapping) added after pressure-test gaps found.

### Execution: Phases 0–5 (2026-04-14 to 2026-04-15)

| Phase | Status  | Key outcomes                                                                                 |
| ----- | ------- | -------------------------------------------------------------------------------------------- |
| 0     | Done    | All 7 Launch Scope Guardrails audited with file:line evidence                                |
| 1     | Done    | `.env` migration, dead component cleanup, NY metro QA pack, devtools wired                   |
| 2     | Done    | Adapter layer, identity normalization on launch-critical tables                              |
| 3     | Done    | RLS verification, idempotency (atomic bid transitions, report dedupe), event capture quality |
| 4     | Done    | Trust surfaces (demo banner, empty states, market status layer)                              |
| 5.1   | Done    | Staging Supabase (`lhhdqycnhweaxqviwdqt`), migration collapse to frozen baseline             |
| 5.2   | Pending | RESEND key deployment + real email proof                                                     |
| 5.3   | Done    | Module Completion Matrix created                                                             |

### Bug fixes (2026-04-15, Passes 8–16)

| Pass | Fix                                                                        |
| ---- | -------------------------------------------------------------------------- |
| 8    | `vehicle.year.trim` crash — String/Number boundary fix                     |
| 9A   | Report submission UUID rejection — vehicle_id lookup fix                   |
| 9B   | Report wizard SVG (CarDiagram.tsx), button rounding                        |
| 10   | `database_init.tsx` collapsed from 758→95 lines (validation only)          |
| 11a  | P0 edge function Deno parse error from Pass 10 — PgClient interface fix    |
| 11b  | Event capture gaps closed (3 missing event types + actor_id Clerk ID fix)  |
| 12   | Atomic bid transitions + report submission idempotency                     |
| 13   | Atomic estimate_request transitions                                        |
| 14   | tsc audit: 49 errors scoped into 3 clusters                                |
| 15   | tsc 49→0: camelCase sweep, adapter boundary sealing, stale component fixes |
| 16   | Shop onboarding infinite loading — `useBusinessProfile` dependency key fix |

### Marketplace hardening (2026-04-16, Passes 46–54)

| Pass | Fix                                                                     |
| ---- | ----------------------------------------------------------------------- |
| 46   | Removed redundant client-side competing bid rejection                   |
| 47   | Added DEV logging to `updateReportStatus` failure path                  |
| 48   | Active Jobs UUID crash: `Number(uuid)` → `String(uuid)`                 |
| 48.1 | `buildTasks` TDZ crash — moved before `useMemo`                         |
| 49   | Deduplicated Active Jobs (DB + report-derived overlap)                  |
| 49S  | Bid count mismatch + customer_name join in job assignments              |
| 51   | Cross-account report leakage — user-scoped localStorage keys            |
| 52   | Customer report deletion with accepted-bid server guard                 |
| 53   | `hydrateReport` resilience (`.single()` → `.maybeSingle()` + try/catch) |
| 54   | `notification-preferences` fix (`session.sub` → `session.clerkUserId`)  |

**Historical deploy point:** Edge functions were at version 40 after these passes. Build: 3.36s, 0 errors.

### Open items

- ~~**P0:** Geographic filtering for shop marketplace view~~ — **RESOLVED** (2026-04-16). `getMarketplaceReports` auto-filters for shops via PostGIS service area RPC. Insurers bounded to 100. KI-001 closed.
- ~~**P0:** Rate limiter identity from JWT~~ — **RESOLVED** (2026-04-16). `extractJwtSubject()` decodes JWT `sub` from Authorization header. KI-003 closed.
- ~~**P0:** Bid acceptance confirmation dialog~~ — **RESOLVED** (2026-04-16). `BidAcceptConfirmationDialog` with Radix AlertDialog. KI-004 closed.
- ~~**P1:** User-visible error toasts on mutation failures~~ — **RESOLVED** (2026-04-16). `showErrorToast` callback wired through `buildDashboardRouterProps`. KI-005 closed.
- ~~**P1:** `updateReportStatus` silent failure after bid acceptance~~ — **RESOLVED** (2026-04-16). Root cause: client-orchestrated multi-call flow. Fix: server-side atomic accept-bid (report status + job assignment + competing bid rejection in one handler). KI-022 closed.
- **Queued (Pass 17):** `estimate_requests` customer-accept flow — `accepted` status missing from DB CHECK constraint and state model. Product decision needed: (A) add `accepted` to state machine, (B) treat as transition creating job_assignment, or (C) remove and route through bid-accept. Recommendation: option B.

### Edge function deploy handoff (2026-04-16)

**Historical note:** This handoff was closed by the 2026-04-27 production deploy to `server` version 47. The bullets below are retained as the version-40 → version-47 change bundle for audit traceability, not as pending work.

Command: `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt`

Changes included:

1. **KI-001:** `getMarketplaceReports` geo-filters for shops via PostGIS `find_reports_in_service_area`. Shop marketplace shows only biddable reports (pending/reviewing/quoted).
2. **KI-003:** `extractJwtSubject()` — rate limit identity from JWT instead of query params
3. **KI-022:** Server-side atomic accept-bid (report status + job assignment + auto-reject in one handler)
4. **Pass 66:** `createBid` server-side guard rejects bids on non-biddable reports (409)
5. **KI-002 prep:** `getUserName` column fix (`full_name` → `name`), email template URL cleanup
6. **KI-002 blocked:** Email delivery requires `supabase secrets set RESEND_API_KEY=re_xxx` before deploy. See KI-002 in REF_KNOWN_ISSUES.md for full steps.

Deployment executed 2026-04-27. Current production metadata: `server` version 47, updated 2026-04-27 11:23:25 UTC.

### Change log addendum (2026-04-16)

- Promoted to LAW tier. Previous version archived as `BIDONDENT_SOFT_LAUNCH_HARDENING_PLAN_2026-04-14_archived_2026-04-16.md`.
- North Star refined to include product DNA protection alongside transaction focus.
- Four new P0/P1 items added from deep planning audit: geo filtering, rate limit security, bid confirmation, error visibility.
- Companion docs created: `LAW_PROJECT_RULES.md`, `REF_KNOWN_ISSUES.md`, `REF_SYSTEM_STATE.md`.
- Old `CLAUDE_AI_MASTER_CONTEXT.md` superseded by `REF_SYSTEM_STATE.md` and archived.

### Phase 5.5 Pass 1 — code-side complete (2026-04-25)

**Scope:** Workflow handler authorization (KI-048). Single-handler change in `supabase/functions/server/handlers/workflow.ts` plus new `requireInsurerContext` helper in `supabase/functions/server/utils/authz.ts`.

**Build/tests:** `npm run build` 3.34s, 0 errors. `npm test` 568/568 passing. No regressions.

**Per-route authorization expectations (intent — to be re-verified live after edge function redeploy):**

| Route                                | Method | Caller scenario                                          | Expected status | Source of expectation                                                                      |
| ------------------------------------ | ------ | -------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `/job-assignments`                   | GET    | No Authorization header                                  | 401             | `requireAuthenticatedProfile` → `requireClerkSession` → "No Authorization header provided" |
| `/job-assignments?shopClerkUserId=X` | GET    | Authenticated as shop X                                  | 200             | `isOwner` true                                                                             |
| `/job-assignments?shopClerkUserId=X` | GET    | Authenticated as shop Y (≠ X), not admin                 | 403             | `!isOwner && !isAdmin`                                                                     |
| `/job-assignments?shopClerkUserId=X` | GET    | Authenticated as admin                                   | 200             | `isAdmin` true                                                                             |
| `/job-assignment`                    | POST   | Body names customer C, caller is C                       | 201/200         | `isCustomer` true                                                                          |
| `/job-assignment`                    | POST   | Body names customer C, caller is shop S (≠ C), not admin | 403             | `!isCustomer && !isAdmin`                                                                  |
| `/job-assignment/status`             | POST   | Caller is one of the parties on the row                  | 200             | `isParty` true                                                                             |
| `/job-assignment/status`             | POST   | Caller is logged in but not on the row, not admin        | 403             | `!isParty && !isAdmin`                                                                     |
| `/job-assignment/status`             | POST   | Assignment ID does not exist                             | 404             | row pre-fetch returns null                                                                 |
| `/claim-submission`                  | POST   | Caller is shop account                                   | 403             | `requireInsurerContext` → "Insurer access required"                                        |
| `/claim-submission`                  | POST   | Caller is insurer account                                | 200             | `isInsurerOrAdmin` true                                                                    |
| `/claim-decision`                    | POST   | Caller is shop account                                   | 403             | `requireInsurerContext` → "Insurer access required"                                        |
| `/claim-decision`                    | POST   | Caller is insurer account                                | 200             | `isInsurerOrAdmin` true                                                                    |

**Pre-existing client-side test coverage (still passing):** `src/app/services/supabase/workflow.test.ts` — `logWorkflowEvent`, `createJobAssignment`, `updateJobAssignmentStatus` request-shape and error propagation. No new handler-level test infrastructure introduced (none exists for any handler in the repo — convention preserved).

**Owner action required for Pass 1 gate close:**

1. Approve code changes (done in chat).
2. Run `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt`.
3. Execute the per-route table above against the live edge environment (curl or browser). Record actual status codes alongside expected.

**Sequencing exception (logged 2026-04-25):** Owner explicitly approved continuing to Pass 2 and Pass 3 with the live-verification step for Pass 1 deferred to the next deployment window. Cross-verified by GPT-5.4-high secondary AI: Pass 1 code-side clean, no build/test regressions, table populated with expected (not yet live actual). Deferral is acceptable because Passes 2 and 3 are independent code surfaces and the live-verification step is a redeploy-bound step that batches naturally with the other two passes.

### Phase 5.5 Pass 2 — code-side complete (2026-04-25)

**Scope:** Customer completion lifecycle propagation (KI-049). Single-handler change in `supabase/functions/server/handlers/reports.ts`.

**Behavior added:** When `updateReport` succeeds with `payload.status === 'completed'`, the handler immediately runs an UPDATE on `job_assignments` matching `damage_report_id` with status in `('scheduled','in_progress','awaiting_parts')` and `deleted_at IS NULL`, setting `status = 'completed'` and `updated_at = now()`. On success, fires a `repair_completed` activity event referencing both `damage_report_id` and `job_assignment_id` with `initiated_by: 'customer'`. Propagation is non-fatal — assignment failure is logged but does not roll back the report update. The report row update remains owner-locked via `clerk_user_id = authenticatedClerkUserId` (existing behavior preserved).

**Build/tests:** `npm run build` 3.22s, 0 errors. `npm test` 568/568 passing.

**Live verification expected:** Customer accepts a bid → confirms completion → shop reloads Active Jobs → assignment shows `completed` and disappears from non-completed filters. To be run after deploy.

### Phase 5.5 Pass 3 — code-side complete (2026-04-25)

**Scope:** Remove SEED fallback from authenticated marketplace (KI-050). Single hook change in `src/app/routers/useDashboardData.ts`.

**Behavior changed:** `SEED_DAMAGE_REPORTS` import removed. `shopInsurerReports` is now a direct passthrough of `liveMarketplaceReports`. `usingSeedFallback` is hard-coded `false`. Empty marketplace renders the existing per-screen empty state ("No repair requests yet" / "No active jobs yet" / "No claims yet"). Amber `isSeedData` banner blocks on the three screens are now unreachable; left in code as harmless dead branches (cleanup out of pass scope). Seed-id mutation guards on bid/claim submission paths preserved. `SEED_DAMAGE_REPORTS` constant stays exported in `src/app/constants` for demo-mode use.

**Build/tests:** `npm run build` 3.23s, 0 errors. `npm test` 568/568 passing. No test asserted seed-record presence on these surfaces, so no test updates required.

**Live verification expected:** Brand-new shop account, no live reports in DB → empty state renders, no seed records visible. To be run after merge.

### Phase 5.5 — owner action queue (updated 2026-04-26)

Secondary AI validation completed the code-side and local checks. The 2026-04-27 production deploy closed the deploy step and also carried KI-055 customer data recovery. Current status:

- Completed 2026-04-27: `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa --no-verify-jwt`.
- Completed 2026-04-27: production `server` metadata now reads version 47, updated 2026-04-27 11:23:25 UTC.
- Completed 2026-04-27: KI-055 live verification passed — vehicle ownership for the affected customer collapsed from mixed `current + NULL` buckets to one current `clerk_user_id` bucket with 20 total rows; `Account > My Vehicles` showed 20 vehicles and report Step 1 showed `20 saved`.

Remaining Phase 5.5 gate work:

1. Live-verify Pass 1 per-route table against the deployed function — record actual status codes alongside expected.
2. Live-verify Pass 2 customer→shop completion flow against prod.
3. Drop the "pending prod redeploy + prod live verification" qualifier from KI-048 / KI-049. KI-050 and KI-055 are already fully RESOLVED.

After step 5, Phase 5.5 gate is closed and Phase 6 (Pre-launch Verification Gate) becomes unblocked.

**Out-of-scope follow-up flagged 2026-04-26 by secondary AI:** Console noise on the demo-switcher reload path — `403` from website session sync calls and `500` from a service-area fetch. These did not block any Phase 5.5 verification step but are worth checking against existing KI entries (likely KI-043 territory) before launch.

### Dev-environment hardening — KI-054 (2026-04-26)

During the audit pass below, the dev-server CSP forced the audit AI to spin up an in-process proxy to make the local Supabase stack reachable from the browser. That proxy was a single point of failure: when its terminal died, the "dev server" appeared dead even though Vite was still running. Root-cause fix landed the same day:

- Extended the dev-only CSP `connect-src` in `vite.config.ts` to allow `http://127.0.0.1:54321` / `http://localhost:54321` / `ws://...` (production CSP via Vercel headers is unaffected).
- Simplified `scripts/dev-local-browser.mjs` to point Vite directly at the local API URL from `supabase status -o env` — no proxy hop.
- Deleted `scripts/local-browser-proxy.mjs`, removed the `http-proxy` dev dep, removed the `local-browser-proxy` npm script.
- Updated `docs/GETTING_STARTED.md` and `docs/REF_AI_BROWSER_NAVIGATION.md` to the simpler one-command flow.
- Build green (3.79s, 0 errors); tests 568/568 passing.

See KI-054 in `REF_KNOWN_ISSUES.md` for the full record. Future audit AIs should use `npm run dev:local-browser` and target `http://localhost:5173/` directly — no proxy required.

### Phase 5.5 Audit Pass (2026-04-26)

Local read-only visual + functional audit by secondary AI (GPT-5.4-high). Read the full output in chat history; below is the docs-side rollup.

**Phase 5.5 verification (local):**

- Pass 1 (workflow auth): **PASS** — owner shop reads `getJobAssignments` (200, enriched with linked completed report); mismatched `shopClerkUserId` returns 403. Per-route artifact table here remains expected-only until prod live verification fills actual statuses.
- Pass 2 (completion propagation): **PARTIALLY VERIFIED** — server side wired correctly (`reports.ts` propagates, local DB shows expected `completed`/`completed` pairing). Customer-side click flow not exercised: no customer fixture in local DB.
- Pass 3 (seed-fallback removed): **NOT REACHED** — authenticated shop landed in onboarding (no `shop_profiles` row), so the marketplace empty-state surfaces were not visited under a real authenticated session in this pass. Note: KI-050 itself is already fully RESOLVED — Pass 3 was previously verified end-to-end via network interception in the prior session.

**New KIs filed:** KI-051 (CSP missing overpass-api.de — P1), KI-052 (route presentation invents travel time/distance for zero-distance demos — P4), KI-053 (map performance budget overruns — P4). See `REF_KNOWN_ISSUES.md`.

**Tooling limits documented:**

- VSCode integrated browser does not honor forced viewport changes — mobile coverage was not claimed in this pass.
- Local DB fixtures are sparse (1 shop profile, 1 completed report, 1 completed job, 0 bids, 0 service areas, 0 `shop_profiles`, 0 `insurer_profiles`). The authenticated shop hits onboarding because `shop_profiles` is empty.
- 2026-04-25 local-browser incident: the audit depended on `http://localhost:4174/`, but the repo had no owned startup path for that target. The cached 4174 tab eventually failed mid-audit (`ERR_CONNECTION_REFUSED` / dynamic import fetch failure), which forced the audit to stop. Recovery is now repo-owned: `npm run dev:local-browser` starts Vite with local Supabase env overrides, and `npm run local-browser-proxy` restores the same-origin browser target on `4174`.

**Pre-known noise (not filed as KIs):**

- 108 cspell hits across 12 files — concentrated in archived docs + NY geography + demo-seed vocabulary.
- TypeScript `baseUrl` deprecation warning in `tsconfig.json` — pre-existing, surfaced in every audit since 2026-04-25.

---

### Post-Phase 5.5 — Visual Master Build (PLANNING, 2026-04-26)

**Purpose:** A focused, multi-pass quality initiative that closes the gaps the 2026-04-26 audit surfaced, brings the authenticated surfaces up to the design identity standard, and adds the mobile coverage that current tooling can't provide. Distinct from Phase 5.5 (which is correctness-focused) — this is **trust + polish + truthfulness** focused.

**Scope filter:** still bound by the LAW_PROJECT_RULES North Star ("does this serve the core transaction OR protect the product DNA"). Map-first identity, premium glass, blue system, and customer/shop marketplace core are the protect-always anchors. Nothing in this initiative should add new features.

**Provisional pass list (to be locked when Phase 5.5 closes):**

1. **VMB Pass 1 — Map command-center truthfulness + provider access (P1+P4 cluster).** Address KI-051 (CSP/Overpass) and KI-052 (route presentation floors) together, since both live on the strongest public product surface and one is a real functional gap. Prefer the edge-proxy shape for KI-051 to match the pattern set by KI-046. Single coherent pass.
2. **VMB Pass 2 — Authenticated surface fixture seeding + Phase 5.5 follow-through.** Stand up minimal local fixtures (customer profile, second shop with `shop_profiles`, insurer profile, two reports with bids) so the authenticated dashboard, customer report flow, insurer claims flow, and Pass 2's customer-side click can all be exercised in-browser. Re-run the visual audit on those surfaces against the design identity.
3. **VMB Pass 3 — Mobile coverage pass.** Tooling-dependent. Either (a) drive Playwright in headed mode with a real mobile viewport via standalone `npx playwright test` (not VSCode's integrated browser), or (b) spin a real device via the deployed Vercel preview URL. Cover the same surfaces as VMB Pass 2 at 375×812 and 414×896.
4. **VMB Pass 4 — Map performance profile + targeted fix (KI-053).** Out-of-scope for pre-launch unless VMB Pass 1 reveals a cheap win on the same code paths. Likely lands as a focused post-launch polish pass.
5. **VMB Pass 5 — Design identity sweep across all primary surfaces.** A focused pass to enforce `bd-*` utility usage, blue system consistency, glass surface adoption, and the dark-mode navy palette. Not a redesign — a polish pass with a concrete checklist per surface.

**Sequencing rule:** VMB Pass 1 first because it directly affects the public product surface (and one of its findings is P1). VMB Pass 2 unblocks the rest of the authenticated audit. VMB Pass 3 depends on tooling decision. VMB Pass 4 depends on profiling result. VMB Pass 5 last, as a closeout polish.

**Owner approval gate:** each pass requires explicit owner approval before code changes — same discipline as Phase 5.5. The audit work itself can run autonomously between passes.

**Authority:** PLANNING tier — not yet locked. Will be promoted to active execution authority when Phase 5.5 closes (prod deploy + verification done) and the owner approves the pass list.

---

### Validation pass (2026-04-25)

- Read-only validation + execution-brief mode review of the three highest-severity findings from the 2026-04-25 deep audit.
- **Seam 1 — Workflow-edge authorization:** CONFIRMED (and broader than headlined). `getJobAssignments` is unauthenticated PII leak; `updateJobAssignmentStatus`/`createJobAssignment` accept any authenticated cross-user mutation; claim routes accept shop callers. Filed as KI-048. P0 launch blocker.
- **Seam 2 — Authenticated marketplace seed/fallback:** PARTIALLY CONFIRMED. Banner mitigates and seed-id mutation guards intact, but trust signal wrong on cold-start. Filed as KI-050. P1.
- **Seam 3 — Bid/job/report lifecycle:** PARTIALLY CONFIRMED. Bid-accept "active vs accepted" label is OVERSTATED — adapter-reconciled by `normalizeReportStatus` (KI-021). Customer-completion drift is REAL — `damage_reports.status=completed` does not propagate to `job_assignments`. Filed as KI-049. P1.
- Three contained passes locked as Phase 5.5 (above). Sequencing: Pass 1 → owner approval → Pass 2 → owner approval → Pass 3 → Phase 6.
- Cross-checked by ChatGPT spot-read; one open caveat (deployment dependency on `--no-verify-jwt`) resolved against repo evidence.
- Caller verification 2026-04-25: claim handlers (`submitInsuranceClaim`, `updateClaimDecision`) are insurer-only at the UI layer ([DashboardRouter.tsx:320-355](../src/app/routers/DashboardRouter.tsx#L320), [DashboardSecondaryViews.tsx:286-310](../src/app/routers/DashboardSecondaryViews.tsx#L286)) — handler tightening to insurer-only is safe.
- AI role split for Phase 5.5 reaffirmed (Opus primary, Sonnet secondary, owner approval gate per pass).

### Storage + auth hardening (2026-05-02)

**Triggered by:** Customer dashboard images failing to load. Investigation surfaced two compound issues plus an unrelated cost finding.

**Closed:**

- **KI-058 — Persisted signed URLs expire after 24h.** Storage pointer pattern shipped: `handleUploadPhoto` now returns `storage://<bucket>/<path>`, all read paths re-sign via `hydrateSignedStorageUrl()`. Backfill migration `20260501000001_storage_pointer_backfill.sql` converted 4 prod rows. `workflow.getJobAssignments` bypass closed (was returning raw `select('*')` rows without hydration). Failure-handling tightened: hydrate now returns null instead of leaking the pointer when signing fails; array variant filters nulls.
- **KI-059 — Gateway `verify_jwt: true` blocks Clerk JWTs.** Re-deployed `server` with `verify_jwt: false`, then **pinned** the flag in `supabase/config.toml` `[functions.server]` so no future deploy silently flips it back. Symptom map and full deployment guidance: `SUPABASE_SETUP_GUIDE.md` §17.
- **KI-061 — Production over-provisioned.** Compute downgraded from Medium → Micro (saves ~$50/mo). Tracked in `REF_KNOWN_ISSUES.md`.

**Production state:**

- `server` edge function: v48 → **v50** (deployed 2026-05-02), `verify_jwt: false`.
- `damage_reports.photo_urls`: all 4 rows now hold pointers; zero `/object/sign/` strings remain.
- Storage RLS: confirmed deny-by-default (RLS enabled, zero policies, all buckets private). Access only via service-role-from-edge-function or signed URLs minted there.

**New skills (reusable across future projects):**

- `~/.claude/skills/supabase-clerk-edge-function/` — verify_jwt:false + requireClerkSession pattern
- `~/.claude/skills/supabase-storage-signed-urls/` — pointer-on-write, sign-on-read; backfill template
- `~/.claude/skills/supabase-pro-cost-control/` — per-project compute cost model + remediation

**Doc deltas in this session:**

- `SUPABASE_SETUP_GUIDE.md` §16 (Storage Pointer Pattern) + §17 (verify_jwt = false) added.
- `REF_SYSTEM_STATE.md` Auth Flow + Storage URL Pattern updated; production env table refreshed to v50/Micro.
- `REF_KNOWN_ISSUES.md` KI-058/059/060/061 added.
- `MOLANDJEUS_DESIGN_DECISIONS.md` renamed to `MOLANDJESUS_DESIGN_DECISIONS.md` (typo fix); `MolandJeus` → `MolandJesus` in active prose.

### v3.3 master-plan Phase 6 close (2026-05-04)

> **Disambiguation:** The v3.3 master plan's "Phase 6" (landing + dashboard map redesign) is **separate from** this doc's "Phase 6 — Pre-launch Verification Gate" (§ Phase 6 above, lines 584+). The hardening-plan Phase 6 remains active as the pre-launch verification checkpoint. This session entry records only the v3.3 master plan phase closure.

**Outcome:** v3.3 master-plan Phase 6 closed via Path A — single defensive commit on `DashboardCoveragePanel.tsx` (light-mode text-color gating per the Phase 2 `InsurerClaimApprovalModal` pattern). Majority of the originally-scoped Phase 6 work (8–11 commits estimated) was subsumed by prior sweeps:

- **Pass C 2026-05-03** — Liquid Map Intelligence scene shipped both mobile + desktop hero map preview variants in `HeroSection.tsx`
- **Pass H 2026-05-05 (KI-091)** — `mapSurfaceTheme.ts` canon adoption (body opacity 0.84/0.76 within range, directional top-cast champagne lamp added, internal gold radial reduced to 0.05)
- Customer/Shop/Insurer dashboard map widgets — all canon-applied via `bd-dashboard-section--accent-{cyan,blue,indigo,deep}` utilities with `isLight` gating from inception of the dashboard widget pattern

Cluster 6A halt revealed the v3.3 Phase 6 scope contract was built on a partially-wrong premise (decorative blueprint SVG conflated with sample-quote map preview pair). Pre-execution audit then verified Clusters 6B/6C/6D/6E and concluded 3 of 5 clusters had 0 findings. Cluster 6E's defensive fix shipped as the only Phase 6 code change.

**Process update — standing rule going forward:** every remaining v3.3 master-plan phase gets a **read-only pre-execution audit** before charter execution. Phase 4 demonstrated the value (3 of 5 clusters compliant at audit time); Phase 6 confirmed it (4 of 5 clusters needed nothing). Phase 6.5 / 7 / 7.5 / 8 / 8.5 each ship a pre-execution audit doc as their first commit; the audit's findings table dictates whether (and at what scope) the phase's charter executes. This rule is now binding for v3.3 master-plan phase work.

**Docs shipped this session:**

- `docs/PLAN_PHASE_6_SCOPE.md` — superseded banner + retrospective (preserved as historical reference).
- `docs/archive/OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md` — read-only audit findings.
- `docs/PLAN_DOC_INDEX_BY_PHASE.md` — Phase 6 row marked CLOSED with Path A annotation.
- `src/app/components/dashboard/DashboardCoveragePanel.tsx` — `appearanceMode` prop added, 8 hardcoded text colors gated behind `isLight` ternary per Phase 2 `InsurerClaimApprovalModal` pattern.

### v3.3 master-plan Phase 6.5 close (2026-05-04)

Phase 6.5 (landing atmosphere + section transitions) closed via **Path B** (close-only with deferred-aesthetic note). Pre-execution audit (`docs/archive/OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md`) confirmed 4 of 4 originally-scoped deliverables already shipped via prior sweeps (parallax via `useParallaxOffset`, idle drift via 17 orb-animation instances, section transitions via `useScrollAnimation` + `bd-bloom-atmosphere`, coverage map ambient via `bd-pin-pulse` family). 1 aesthetic gap (gold-lamp halos in BenefitsSection / AboutOpportunitySection are static radials, not breathing) parked as **KI-112 P7-TECHDEBT** in `REF_KNOWN_ISSUES.md` with removal trigger "post-launch aesthetic pass OR Phase 8.5 ambient/idle motion work, whichever comes first." `OPS_LANDING_ATMOSPHERE_LOG.md` not written (Path B; audit doc + KI-112 are the durable record). 0 code edits this commit.

### v3.3 master-plan Phase 7 close (2026-05-04)

Phase 7 (bids/report/shop/insurer map redesign) closed via **Path B** (close-only with deferred-split note). Pre-execution audit (`docs/archive/OPS_PHASE_7_PRE_EXECUTION_AUDIT_2026-05-04_archived_2026-05-06.md`) confirmed visual + functional surfaces are canon-applied or theme-driven correctly: BidsScreen 15 isLight + 7 bd-\*; BidsGeographyMap 7/5; StepServiceLocation 21 isLight (inline glass); MapLibreShopDirectoryMapPane uses canonical `data-map-theme` DOM-attribute theming; ShopDirectoryScreen 15 isLight; InsurerClaimsScreen 24/4 + InsurerPartnerShopsScreen 19/4 (post-Phase 2 light-mode work). 0 hard-limit violations (largest = MapLibreShopDirectoryMapPane 484 / 600 = 81%). Architectural lift remains Phase 8 territory (KI-108/109/110 explicitly scoped there). The `shop/` sub-folder split is a discoverability candidate parked as **KI-111 P6** (already in `REF_KNOWN_ISSUES.md`; no new KI created). `OPS_BIDS_REPORT_SHOP_INSURER_MAP_LOG.md` not written (Path B; audit doc + KI-111 are the durable record). 0 code edits this commit. Pre-execution-audit pattern is now 4-for-4 (Phases 4 / 6 / 6.5 / 7 all delivered audit-or-tiny-fix outcomes); cumulative ~18–26 commits saved vs original v3.3 estimates.

### v3.3 master-plan Phase 7.5 audit blocked by LAW-vs-reality drift; §5 amendment shipped (2026-05-04)

Phase 7.5 pre-execution audit halted pre-output by builder when surface inventory revealed `motion@12.23.24` installed and consumed by 49 files via `motion/react`, contradicting `LAW_ANIMATION_AND_ATMOSPHERE.md` §5 ("CSS-first lock — framer-motion is NOT installed"). The discrepancy is the framer-motion → motion package rebrand from upstream (Nov 2024); same library, renamed. Owner adjudicated as **P2 LAW-vs-reality drift**, picked **Path B** (charter-aligns-to-reality) over Path A (refactor 49 files; out of hardening scope) and Path C (note in audit; leaves LAW wrong). `docs(canon):` commit shipped: amends §5 only (§1–§4 untouched, MOLANDJESUS not touched, no code edits) to acknowledge motion/react reality, define the permitted envelope based on existing 49-file usage (AnimatePresence enter/exit + whileTap/whileHover gestures + drag/swipe sheets), extend the reduced-motion contract to require `useReducedMotion()` honoring on motion/react surfaces, refactor the Phase-4.6 escape clause to apply to remaining unintegrated JS animation libs (gsap, lottie, @react-spring, three), and add a new-component guardrail requiring justification when a NEW file introduces motion/react. CSS-first default + 29-keyframe primary vocabulary preserved. Phase 7.5 audit unblocked and ships in the next commit, with one added scope item per owner relay: verify reduced-motion compliance across the 49 motion/react files.

### v3.3 master-plan Phase 7.5 close (2026-05-05)

Phase 7.5 (dashboard atmosphere + interior animations) closed via **Path Y** (docs-only close per X+ bounded-sweep safety-valve trip). Verification chain: (1) audit shipped 2026-05-04 (commit `7a04ae95`) finding F1 P3 reduced-motion gap (originally 1/49 compliant) + F2 + F3 P7-TECHDEBT aesthetic gaps (mini-map idle drift + dropdown enter/exit not shipped). (2) Owner picked Path B / Class 1 / global `MotionConfig` mitigation; relay added DevTools verification gate. (3) Class 1 falsified by Sonnet runtime verification (browser-automated, owner-supervised, 2026-05-05): `MotionConfig reducedMotion="user"` only suppresses spring transitions, not explicit-duration tweens. Surfaces 1 (BidCardArticle hover, `duration: 0.2`) and 3 (DashboardRouter route transition, `duration: 0.2`) failed under emulated `prefers-reduced-motion: reduce`; Surface 2 (MobileBottomNav whileTap, spring) passed. (4) Builder bounded sweep (X+ Step 2A read-only) classified all 49 motion/react files: 32 explicit-duration (definite fail), 2 mixed (partial fail), 4 spring-only (MotionConfig-coverable), 7 delay-only (uncertain), 4 no-transition (uncertain). Bounded-sweep ≥15-file safety valve tripped at 32 affected files; X+ collapsed to Y. (5) Audit-stat correction: original "1/49 compliant" was wrong — `ReportScreen.tsx:200` matchMedia gates `scrollIntoView` behavior, not the `motion.div` step transition at L290. Actual compliance ratio: **0/49** on motion/react component-level transition behavior. (6) F1 reclassified P3 → KI-113 with full 32-file bucket A scope contract (plus 2-file bucket B + 11-file bucket D+E "audit needed" sub-scope). F2 + F3 folded into KI-112 extension (atmosphere/idle motion gap family expanded to subsume dashboard surfaces + dropdown enter/exit). `MotionConfig` wrap intentionally NOT shipped this commit — partial fix adjacent to "32 files broken" KI would have read poorly in `git log` and weakened the `fix(a11y):` headline of the future fix phase. Single `docs(close):` commit; no code edits; `MotionConfig` + per-file `useReducedMotion()` sweep deferred to future phase that closes KI-113. Pre-execution-audit pattern is now 5-for-5 with Phase 7.5 producing the first non-trivial defensive finding (P3 with cross-AI verification chain) any pre-execution audit has surfaced — the pattern's safety valve worked exactly as designed: caught a real gap, prevented a partial fix from shipping, scoped a future phase honestly.

### v3.3 master-plan Phase 8 close (2026-05-05)

Phase 8 (Map L3/L4 + provider boundary — KI-108 / KI-109 / KI-110 territory) shipped under owner authorization "go full auto on code work doc work and design work for hours after." First architectural-execution phase in the v3.3 master plan: ~8 commits across audit + 6 refactor + close, all on `BidOnDent-Horizon-Beta`, build green every commit. Branch went `9de09232` → `3e8d28be` (audit) → `07947353` (relocate `useReportLayerData`) → `24e66d76` (`useGeoCoordinates` + 3 callers) → `3118198e` (`useHaversineDistance` + 1 caller) → Sonnet Playwright runtime audit (P3 hook 3 contract drift surfaced) → `48764ccb` (`useNavigationVoicePriming` + 3 callers, full closure) → `8fa136d7` (`useShopMapListings` Y1 narrowed authoring) → `9846ef46` (3 `buildShopMapListings` caller migrations — KI-110 substantive-use closure) → `d8c99055` (KI-109 split: `useOperatingRegionsCoverage.ts` 512 → 468 LOC via 6-helper extraction) → this `docs(close):` commit. Audit shape was **scope-contract** (per advisor framing), not findings — produced concrete TypeScript hook signatures + caller ordering + risk surface map that the builder executed against directly. Two scope refinements during execution: (a) **selectivity policy**, established at hook 1 — per-list-item callers (`.map()` over a list calling pure L4 utilities) cannot use hooks (hooks-in-loops violation) and stay with direct L4 imports; trivial pure-function and constant-getter callers also stay direct as a documented architectural exception; (b) **Y1 narrowed hook 4** — caller inventory revealed the contract's "kitchen sink" return shape matched no actual caller, so `useShopMapListings` collapsed to `(args) => ShopMapListing[]` and migration scope dropped from 7 callers to 3 substantive-use sites. Sonnet's runtime Playwright audit between commits 5 and 6 confirmed all 4 migrated commits ship-ready and surfaced one P3 contract-vs-implementation drift on hook 3 (signature `() => PrimeVoiceResult` instead of contract's `{ prime, primed }`); resolved in this close commit's §1 hook 3 + §1 hook 4 amendments. **KI-109 RESOLVED** via the 6-helper extraction (cleaner than the original sub-hook proposal because origin-resolution handlers were too tightly coupled to parent state to extract cleanly; pure-function extraction kept refactor neutrality with no behavior change). **KI-110 RESOLVED-WITH-RESIDUAL** — leverage hook + 3 substantive-use callers shipped; 4 smaller-utility surfaces fold into KI-108's documented residual. **KI-108 OPEN with reduced surface area** — 4 hooks shipped covering 8 single-call sites; 15+ surfaces remain grandfathered with documented selectivity policy. No `≥400 LOC sub-extraction` triggered; largest new hook (`useShopMapListings`) at ~80 LOC. No charter amendments, no MOLANDJESUS edits, no LAW edits. Pre-execution-audit pattern is now 6-for-6 with Phase 8 demonstrating the scope-contract output style works for execution-authority audits the same way findings-style works for verification audits — different shape, same verification rigor, same safety-valve discipline. Cumulative effect over 6 phases: ~25-30 commits saved vs original v3.3 estimates + 1 substantive architectural phase (this) shipped on schedule with documented residual.

### v3.3 master-plan Phase 7.6 close (2026-05-05)

Phase 7.6 (reduced-motion sweep — KI-113 closure) shipped under owner "go full auto" authorization (Sonnet pipeline: Executor → Auditor → Finalizer). Two-layer architectural fix executed as a 9-commit pipeline on `BidOnDent-Horizon-Beta`. **Layer 1** — `<MotionConfig reducedMotion="user">` wrap at `src/main.tsx` (Commit 1, SHA `b1fea150`) — covers spring/whileTap/gesture surfaces globally. **Layer 2** — per-file `useReducedMotion()` migration across all 45 files (buckets A + B + D + E): explicit-duration transitions gated via `reduceMotion ? 0 : <original>`. Execution commits 2–8 (SHAs `b07f7dd3` → `1d55f035` → `9eaee53e` → `f53ab7da` → `77205da5` → `982dbae4` → `099b3742`) — build verified green after every commit. Migration patterns: A.1 (explicit `duration: N` → conditional), A.2 (Bucket B overlay-only conditional; spring untouched), A.5 (variant-object → factory function + `useMemo`). Auditor pass (8 tasks) returned **VERDICT: CLEAN**: 7 KI-113 commits, build green (2920 modules), 45 files with `useReducedMotion`, 62 wrapped sites, 0 missed plain durations, Bucket B springs untouched, all original numeric values preserved verbatim in non-reduce branches. Post-audit forensic pass (Sonnet v3.1 + §12 delta) surfaced WAAPI-vs-CSS layering gap on 5 interactive selectors (`.bd-dashboard-section--interactive` + dashboard-button family + report-input family + glass-control); shipped as 8 LOC of CSS reduce-guards in commit `6cbff2d0` plus 1-line LAW §3 amendment + 23-LOC KI-113 close-doc post-audit clarification footer + §12 delta to v3.1 (no new prompt file, no v3.2). KI-114 considered but rejected per ChatGPT advisor's tight forensic-pass containment discipline; stale `KI-114` reference in CSS comment purged in commit `8eb54b9c`. Sonnet v3.1 + §12 closure-proof re-run (commit `bb20f554`) returned **VERDICT: CLEAN** on the 10 PART A patched selectors plus S1 (BidCardArticle hover) + S3 (DashboardRouter route transition) — `transitionDuration: "0s"`, `transitionProperty: "none"`, `waapiAnimations: []` under `prefers-reduced-motion: reduce`; recovery proven (S1 0.18s; S3 WAAPI duration 200ms in-flight) under `no-preference`; Bucket C confirmed via single root `MotionConfig`. PART B residual inventory: GUARDED:9 / INTERACTIVE-UNGUARDED:5 (glass-control variants + glass-card + report-choice) / DECORATIVE-UNGUARDED:5 (maplibre + glass-floating + bid-card-float decorative) — informational only, no follow-up KI per containment doctrine. Prettier reflow on closure artifact (commit `021c6450`) closed the loop. **KI-113 RESOLVED.** KI-112 close + Phase 8.5 Path A now unblocked. Pre-execution-audit pattern is now 7-for-7; Phase 7.6 demonstrates the Sonnet 3-prompt pipeline (Executor/Auditor/Finalizer) as a valid high-confidence execution format for mechanical multi-file sweeps. Containment doctrine ("when stabilizing, prefer surgical patches over framework expansion; no new KIs/versions/layers per finding") emerged as the load-bearing lesson and is encoded as durable feedback memory + LAW §3 forbidden-pattern entry.

### v3.3 master-plan KI-112 gating-chain unblock close (2026-05-05)

KI-112 (atmosphere/idle motion gap family — landing gold-lamp halos + dashboard atmosphere + dashboard dropdowns) closed-pass via **docs-only gating-chain unblock acknowledgment** under owner "go full auto" authorization. Phase 7.6 / KI-113 close (commits `b1fea150` → `bb20f554`) shipped the `<MotionConfig reducedMotion="user">` root wrap (`src/main.tsx`) + per-file `useReducedMotion()` pattern across 45 motion/react files, mechanically clearing the reduced-motion contract gating that any future KI-112 sub-fix activation requires. Status remains **OPEN** — sub-fixes (F1 landing gold-lamp breathing / F2 dashboard atmosphere mini-map idle drift / F3 dashboard dropdown enter/exit) are owner-taste-deferred to Phase 8.5 ambient/idle motion work or post-launch aesthetic pass per the existing removal trigger. Single `docs(known-issues):` commit; KI-112 status line annotated with Phase 7.6 close cross-ref + mechanical-inheritance note (root `MotionConfig` + per-file `useReducedMotion()` pattern already in place for motion/react surfaces; F1 CSS keyframe activations must still author their own `@media (prefers-reduced-motion: reduce)` block per LAW §3); [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) is the durable record. 0 code edits this commit. No new audit framework, no scope expansion. Pre-execution-audit pattern not invoked (docs-only ledger maintenance, not a phase). Cumulative gating-chain progress: KI-113 (P3) RESOLVED → KI-112 (P7) gating cleared → Phase 8.5 Path A unblocked.

### v3.3 master-plan Phase 8.5 close (2026-05-05)

Phase 8.5 (map ambient + idle motion) closed via **Path Y** (docs-only close + KI-112 extension) under owner autopilot authorization with no explicit Path A directive. Pre-execution audit ([`docs/archive/OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05_archived_2026-05-06.md`](archive/OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05_archived_2026-05-06.md), commit `4f4bd444`) confirmed 2 of 7 LAW §2 §E map-specific keyframes consumed (`mapPopupEnter` at `theme.css:741` + `arrival-scale-in` in `GuidanceArrivalSection.tsx`); 5 of 7 unconsumed (`bdLiquidGoldFlow` consumed on landing only; `bdPinPulse` consumed on landing only; `bdRouteShimmer` + `dashMove` zero consumers; `bdGoldSheenOneShot` partial consumption). Findings: F1 (route preview draw-on NOT shipped — `bdRouteShimmer` + `dashMove` zero consumers; charter mismatch flag — keyframes are DOM-targeted, canvas routes need MapLibre paint property animation OR DOM-overlaid SVG), F2 (pin pulse on canvas NOT shipped — `bdPinPulse` consumed on landing hero only; charter mismatch flag — same canvas-vs-DOM issue), F3 (camera idle drift NOT shipped — already tracked under KI-112 F2 from Phase 7.5; no new KI), F4 (liquid sheen NOT extended from landing to map frames — keyframe + class shipped, consumption is the missing piece; trivial ~10 LOC). All 4 P7-TECHDEBT, 0 P0/P1/P2/P3. Path Y selected per audit §5 default recommendation; KI-112 extended with F4 (route preview, audit F1), F5 (pin pulse on canvas, audit F2), F6 (liquid sheen extension to map frames, audit F4); audit F3 maps to existing KI-112 F2 (no duplicate). KI-112 title updated ("+ map ambient surfaces"); scope-extended note appended; Impact, Location, Evidence, Fix direction, and Status sections all extended for F4/F5/F6. Single `docs(close):` commit (4 docs touched: REF_KNOWN_ISSUES + OPS_PHASE_8_5 audit footer §9 + PLAN_DOC_INDEX + this LAW_HARDENING_PLAN session log). 0 code edits. No new audit framework, no scope expansion, no new prompt or methodology design — strict containment doctrine adherence. `OPS_MAP_AMBIENT_MOTION_LOG.md` confirmed NOT WRITTEN per conditional clause (would have been written only on Path A). Path A (3-4 aesthetic execution commits — wire `bd-pin-pulse` to map pins via DOM-overlaid markers, wire route shimmer via `line-dasharray` interpolation OR DOM-overlay SVG, wire `bd-liquid-gold-flow` to map frames, author camera-idle-drift JS scheduler) remains available as a post-launch aesthetic pass or owner-driven phase. KI-113's reduced-motion contract is now in place mechanically for motion/react surfaces; CSS-keyframe Path-A activations would need to author their own `@media (prefers-reduced-motion: reduce)` block per LAW §3 in the same commit. **Pre-execution-audit pattern is now 8-for-8** (Phases 4 / 6 / 6.5 / 7 / 7.5 / 7.6 / 8 / 8.5 all delivered tight scope-or-defer outcomes). Cumulative effect over 8 phases: ~25-32 commits saved vs original v3.3 estimates + 2 substantive execution phases shipped (Phase 8 architectural lift + Phase 7.6 reduced-motion sweep).

### v3.3 master-plan KI-057 close (2026-05-05)

KI-057 (StrictMode realtime channel cycling, dev-only, P7) RESOLVED via two commits under owner explicit pivot authorization ("KI-057" pick from the C-narrow / C-broad / D menu after binary-check eliminated KI-021 and KI-060 as autopilot-incompatible). Pre-execution audit-pre-staging discipline applied: read full KI-057 entry (`useBidsForReport.ts` + `RealtimeBidService.ts` named as scope), `git log` confirmed last touch on `useBidsForReport.ts` was `1c34e44f fix(realtime): wire Clerk JWTs via accessToken callback` (2026-04-30), KI-057 grep returned only `30682ff4 docs: ... KI-057 deferred` (the deferral being explicitly overridden by this owner pivot). Root cause: React 18 StrictMode invokes mount → cleanup → mount synchronously within one render task; the realtime effect previously called `realtimeBidService.subscribeToReportBids()` directly inside the effect body, so mount-1 sent `phx_join`, the StrictMode cleanup sent `phx_leave` before the join had acked, and mount-2 sent another `phx_join` — the "WebSocket closed before connection established" warning is the half-finished `phx_leave`. Fix pattern: wrap `doSubscribe()` call in `queueMicrotask(doSubscribe)` to defer the actual subscribe by one microtask, and add `if (!mounted) return;` short-circuit at the top of `doSubscribe`. Mechanism: StrictMode's mount-cleanup-mount completes synchronously _before_ any microtask fires; the cleanup sets `mounted = false` for closure-1 before closure-1's microtask runs, so closure-1's deferred subscribe is short-circuited, and only closure-2's microtask actually opens a channel. Production behavior unchanged (one-tick delay imperceptible; channel-creation path identical; `accessToken` callback fires at channel-join time as before — see `client.ts:80-88`).

**Commit 1 (`e4946e20`, initial scope):** `useBidsForReport.ts` only. Shipped per the KI's stated scope. Owner asked for ChatGPT-driven deep audit before standing down.

**Audit findings (post-`e4946e20`, pre-commit-2):** ChatGPT-driven critique flagged "selection framing was overconfident — KI-057 may be part of a distributed lifecycle system, not an isolated bug." Builder audit confirmed: 8 vulnerable subscription sites total, not 1. The KI's stated scope was wrong. Vulnerable consumers identified via `grep -rn "subscribeTo\|\.channel("`: `useBidsForReport.ts` (✅ commit 1), `useCustomerBidNotifications.ts`, `useShopBidStatusNotifications.ts`, `useCustomerReportStatusNotifications.ts`, `useShopEstimateStatusNotifications.ts`, `useCustomerEstimateResponseNotifications.ts`, `useInsurerClaimNotifications.ts`, `useReportLayerData.ts` (2 channels). Auth-flow audit at `client.ts:80-88` confirmed the microtask delay does NOT reorder auth-dependent calls: token is fetched via `accessToken` async callback at channel-join time, not at mount time, so callback-driven token semantics are unchanged. Service-layer defer rejected as alternative (would have broken `RealtimeBidService.test.ts` synchronous expectations at lines 75-90, 110-125, 247-265 — higher blast radius). Hook-level defer at each site = identical pattern to `e4946e20`, zero test impact, X+ ≤8 valve compliant.

**Commit 2 (audit-driven follow-up):** Same `queueMicrotask + mounted` pattern applied to remaining 7 hook files (8 subscription sites). Each file uses a 2-line reference comment pointing back to `useBidsForReport.ts` for the full mechanism. Verified: `npm run typecheck` clean, `npm run build` green (3.19s). Net diff across both commits: ~75 lines code added across 8 files, identical pattern, no new abstractions.

Containment doctrine adherence: no framework expansion, no new audit pattern, no new layer, no `AbortController` introduction, no service-layer contract change. Surgical hook-level patches to existing closure-state machines, in keeping with `feedback_containment_over_expansion.md` memory. Pre-execution-audit pattern fired correctly during target selection (last turn's KI-113 work-ledger catch). Pre-execution discipline: **9-for-9** (8 phases + KI-113 work-ledger catch). The post-commit-1 audit itself is a notable case: ChatGPT identified that Builder's "uniquely isolated" framing was overclaimed; Builder ran a real audit, accepted the critique, expanded coverage. **This is a constraining use of cross-AI critique under autopilot — Builder ship was real but the framing was wrong; the audit caught it before declaring KI-057 closed.** Honest cite-ledger update: this turn produced 1 constraining use of cross-AI critique-vs-execution (4th constraining use of binary-check-family rules this session, but applied to a different rule — "external critique against shipped work warrants re-audit, not defensive justification"). Owner pivot from "go full auto and build" → KI-057 → audit follow-up = clean three-step transition, all binary-check-compliant. Branch `BidOnDent-Horizon-Beta`.

### Sonnet visual + map audit ship (2026-05-05)

Sonnet ran a dual visual-deep + map-functionality audit against HEAD `708d0d38` (pre-Builder-KI-057) under owner "full authority" extension. Findings: 8 visual + 5 map = 13 total. Sonnet self-applied fixes for the 6 actionable visual findings (V-001 P0 reduce-motion leak, V-002 P1 Unsplash CSP, V-003 P2 Clerk telemetry CSP, V-004 P3 X-Frame-Options invalid meta, V-005 P3 AlertDialogOverlay forwardRef, V-007 P4 aria-hidden on focused descendant) and verified each live via Playwright runtime emulation (`reducedMotion: 'reduce'` for V-001, network probe for V-002/V-003, DOM presence checks for V-004, console-clean check for V-005/V-007). Sonnet stopped before commit per owner-review convention. Builder (Opus, this commit) inherits the verified working tree, sanity-checks the 5 file diffs against Sonnet's claims (all match — see commit body), runs `npm run typecheck` clean + `npm run build` green (3.27s), updates `REF_KNOWN_ISSUES.md` KI-057 with M-004 cross-reference (Sonnet's M-004 finding is the same StrictMode cycling Builder resolved in commits `e4946e20` + `6e94c6a7` — Sonnet was working from pre-fix HEAD and didn't have that context, so M-004 in the audit doc reads as an open finding but is RESOLVED in current HEAD; cross-link added so future readers don't double-report), and ships the bundle as a single commit. Sonnet-not-fixed (correctly): V-006 (transient HMR cascade caused by Builder's mid-edit state, since cleared), V-008 (cosmetic library warning, no code action), M-001 (expected MapLibre tile-cancel debounce behavior), M-002 (Clerk env mismatch — environment, not source), M-003 (perf budget, needs prod profiling), M-005 (passing). Multi-AI coordination held: Sonnet enumerated "3 dirty files belonging to the concurrent agent" (Builder's KI-057 hooks) before editing and routed around them; Builder reciprocated by hard non-action while Sonnet was mid-flight. Layer separation clean (CSS/HTML/UI primitives vs hook layer). Single `fix(audit):` commit shipping 5 source files + 2 audit reports + 7 screenshots (~16MB) + REF_KNOWN_ISSUES M-004 cross-link. Sonnet credited as primary author via Co-Authored-By; Builder is deployer + cross-link author. Cite ledger this turn: 1 constraining use of multi-AI handoff discipline (Builder declined to act in parallel until Sonnet committed/cleared; Sonnet enumerated dirty-file boundary before editing — both sides held the AI_LOCK convention without explicit instruction). Same-session ledger: 1 articulation + 5 constraining + 2 framing + 0 independent (binary-check-family rules this session).
