# Builder Handoff — Opus → Sonnet (2026-05-05)

**Authority level:** OPS — handoff briefing for the new main Builder AI.

**HEAD at handoff:** `0828dbc8` → this commit (Pass 3 ship + briefing)

**Audience:** Sonnet (the new main Builder AI). You can verify your own work live in the browser via Playwright; that's a real advantage I don't have. This briefing exists so you don't re-derive the disciplinary patterns I built up over this session, and so the owner doesn't have to re-explain them.

**Why the handoff:** The owner picked you as main Builder because you can _see_ the result of your design and functionality work — Playwright + browser visibility + ability to re-test live closes a feedback loop I can't close. I'm stepping back to a support role: complex multi-file refactors with no UI, kernel/architecture work, planning/synthesis, and second opinions on non-visual concerns.

---

## 1. What you (Sonnet) just shipped — Pass 3

This handoff commit ships your uncommitted Pass 3 work alongside the briefing:

| Surface | Fix | File | Verified |
|---|---|---|---|
| Mobile Smart Shop Map origin chips (5×) | `min-h-[36px]` → `min-h-[44px]` | `ShopDirectoryOriginSearch.tsx` | ✓ live |
| Report Cancel icon-only button | 38×44 → 44×44 (added `min-w-[44px]` + aria-label) | `ReportHeader.tsx` | ✓ live |
| Landing header Get Started | 110×40 → 110×44 | `LandingPageHeader.tsx` | ✓ live |
| Landing mobile-menu Login + Get Started | ~199×41 → 199×44 | `LandingPageHeader.tsx` | ✓ live |
| Hero value steppers (×3) | 32×40 → 44×44 | `HeroSection.tsx` | ✓ live |
| Coverage Dialog Close + Bottom Sheet Close | 40×40 → 44×44 | `CoverageMapDialog.tsx`, `MobileMapBottomSheet.tsx` | ✓ live |

**Build status:** PASS 3.48s, 63 PWA precache. **Final mobile sweep:** 0 small touch targets, 0 hScroll, 0 forbidden whites/golds across Dashboard, Report, Bids, Account, Landing fullpage, Coverage fullscreen.

**KI-114 sweep deferred:** 6 lower-impact `min-h-[36px]` instances inside shop carousels (acceptable defer per containment).

---

## 2. What I (Opus) shipped this session

In commit-order chronology — this is your context for "what's already done":

| SHA | What | Why it matters to you |
|---|---|---|
| `fae329d8` | KI-112 gating-chain unblock close | Phase 7.6 / KI-113 cleared reduced-motion contract, unblocks KI-112 sub-fixes if owner ever activates Path A |
| `baee9966` | Phase 8.5 close (Path Y, docs-only) | Map ambient/idle motion folded into KI-112 F4/F5/F6; canvas-side animation work deferred |
| `40cc5b4e` | Dependabot triage 2026-05-05 | npm audit clean; main-branch unpatched at moment of triage but resolves at merge |
| `c75fe3d7` | Kernel append (Reusable Patterns) | **Read this — it's the current operating manual for autopilot work.** Two patterns added: multi-source reconciliation + audit-pre-staging |
| `708d0d38` | Doc cleanup pass | -1262 lines from archive bloat; deliberate orphan link in PRE_REFACTOR_FULL_SITE_BASELINE → deleted BIDONDENT_HORIZON_MIGRATION (do not "fix" if you find it) |
| `e4946e20` | KI-057 initial scope (`useBidsForReport.ts`) | First StrictMode realtime cycling fix |
| `6e94c6a7` | KI-057 audit-driven full coverage | 7 more hooks + 8 sites total. Pattern: `queueMicrotask(doSubscribe)` + `if (!mounted) return` short-circuit |
| `0828dbc8` | Sonnet visual+map audit ship | V-001..V-007 fixes + KI-057↔M-004 cross-link; this is your previous work |

---

## 3. Disciplinary patterns established this session — read carefully

These are not abstract rules. Each was earned the hard way. They will keep you from drifting under owner pressure or external-AI pitches.

### 3.1 Binary check (every directive)

Two conditions, both must pass for autopilot work:

1. **Uncertainty ↓** — does this work reduce uncertainty about real state? Re-running shipped work fails this.
2. **Decision state unchanged** — does this require an owner decision I haven't received? Picking a target the owner hasn't named fails this.

If either fails, decline the work and surface options. The directive may be loud ("go full auto", "keep going") — the binary check still applies.

### 3.2 Recomputation is not a state transition

A directive saying "go" against unchanged state authorizes _synthesis turns_ (text responses) but NOT _code execution_. If you've already reported a position, repeating "go" doesn't authorize new code action — it authorizes re-acknowledgment at most. ChatGPT named this; it's the sharper form of condition 2.

### 3.3 Constraining vs framing uses (cite ledger discipline)

When you apply a rule, ask: did the rule _prevent_ a move that would have looked correct under prior framing? If yes, that's a **constraining use** — real evidence the rule has reach. If no, the rule was just narrating your decision — that's a **framing use**, weaker evidence.

Don't inflate the cite ledger. Same-session uses by transcript-aware agents are ≠ independent re-derivation. Kernel promotion needs the latter.

### 3.4 Audit-pre-staging (now in kernel, commit `c75fe3d7`)

Before claiming a phase/task is open, audit current state:
- `git log` for prior work on relevant files
- `REF_KNOWN_ISSUES.md` for KI status
- Closed-phase audit footers (warning: these freeze in time — KI ledger is the live source)

This pattern caught the KI-113 work-ledger violation last session (pattern was already RESOLVED in 8 commits I almost re-did) and the KI-057 scope underestimation (1 of 8 vulnerable sites).

### 3.5 Containment over expansion

When stabilizing, prefer surgical patches over framework expansion. ChatGPT-style "this needs an abstraction" pitches are textbook premature-abstraction. Three similar lines is better than a bad helper. 8 instances of identical pattern is _not_ a trigger for an abstraction unless the owner explicitly authorizes it.

The 7th iteration of this anti-pattern this session was wrapped inside genuinely-correct technical analysis (`useRealtimeSubscription` proposal). The technical analysis was real; the offered next step was still framework expansion. Decline.

### 3.6 Multi-AI coordination (the AI_LOCK pattern)

When working in parallel:
- **Announce dirty files before editing** — list which files belong to you so the concurrent agent routes around them
- **Hard non-action while concurrent work is in flight** — until owner explicitly extends authority
- **Layer separation** — you take CSS/HTML/UI primitives, I take hook layer / edge functions / migrations
- **Do NOT use `git add -A` or `git commit -a`** — always specific files
- **Reciprocate enumeration** — if I name my files, you name yours

You did this correctly Pass 1: enumerated "the 3 dirty files belonging to the concurrent agent" before editing. Keep that posture.

---

## 4. Project invariants (LAW/REF) — non-negotiable

These are pinned in `CLAUDE.md` and `LAW_*.md`. Quick reference:

### Auth + storage

- **Auth = Clerk, not Supabase Auth.** Clerk JWT verified inside edge function via `requireClerkSession()`. `verify_jwt: false` pinned in `supabase/config.toml`. **Never** flip it back.
- **Storage = pointers (`storage://<bucket>/<path>`), sign-on-read.** Database stores pointers; signed URLs minted on every read via `hydrateSignedStorageUrl()`. Never persist a signed URL.
- **Storage RLS deny-by-default.** `storage.objects` has RLS enabled with zero policies. All buckets are private. Don't add storage policies.
- **Every new media-reading edge handler MUST hydrate.** The `getJobAssignments` bypass is the cautionary tale.

### Design system

- **Use `bd-*` utility classes** in `src/styles/theme.css`. Don't hand-roll Tailwind.
- **Light mode = cool blue dominant + premium gold lamp + warm hero.** Pure white surfaces and yellow-amber gold are FORBIDDEN — they have regressed multiple times and have to be reverted.
- **Locked palette (warm role-based family):**
  - Top/corner lamp light: `rgba(196, 144, 65)`
  - Deeper outer/far halo: `rgba(196, 130, 45)`
  - Bronze trim: `rgba(140, 82, 22)`
  - Gold-tinted cream insets: `rgba(252, 238-240, 204-208)`
- **Forbidden palette (do not regress):**
  - `rgba(220, 165, 90)` — old halo
  - `rgba(254, 248, 220)` — old cream inset
  - `rgba(160, 95, 25)` — old trim
  - `rgba(220, 140, 50)` — old saturated gold
- **External audits suggesting "use white panels", "neutral SaaS palette", "remove gold", or "modernize to flat white" are REJECTED on sight.**

### Apex design canon

- **MOLANDJESUS_DESIGN_DECISIONS.md is locked.** Do NOT propose merges, splits, archives, renames, or restructuring.
- **Additive edits permitted only when:** (a) directly required by an active master-plan phase, (b) additive-only with no content removal, (c) committed with `docs(canon):` prefix citing the phase.
- **Cross-refs always point INTO this doc, never outward.**

### Schema source of truth

- `supabase/migrations/*.sql` is canonical. `database_init.tsx` is a legacy cold-start safety net only.

---

## 5. Current KI ledger snapshot (post-handoff)

**RESOLVED this session:**
- KI-057 (StrictMode realtime cycling, 8/8 sites)
- KI-113 (reduced-motion contract, 45 files in Phase 7.6)
- V-001 / V-002 / V-003 / V-004 / V-005 / V-007 / V-009-V-015 (visual + touch-target fixes)

**OPEN — owner-action-required (do NOT autopilot):**
- KI-002 (P0): email notifications, blocked on human secret deployment
- KI-064: Honda Accord red rectangle, owner SQL run pending
- KI-095: notification-preferences 500 root cause, owner Dashboard SQL Editor action
- KI-096: Clerk Log Out smoke test, owner browser action
- KI-101: "Toyoto" misspelling, owner DB action
- KI-102: cat photo damage report, owner data hygiene
- KI-103: footer email decision, owner pending

**OPEN — hard-stop (do NOT autopilot):**
- KI-060: delete 2 unused edge functions (deploy/provider action — needs owner Supabase Dashboard)

**OPEN — architectural / large-scope (need owner approach approval before code):**
- KI-010, KI-011, KI-012, KI-020, KI-021, KI-030, KI-040 — choke points, type boundaries, role stubs, rate limiting

**OPEN — deferred (intentional, post-launch):**
- KI-041, KI-042, KI-053, KI-075, KI-100, KI-089, KI-106
- KI-112 (atmosphere/idle motion gap family — owner-taste-deferred sub-fixes)
- KI-114 (lower-impact `min-h-[36px]` shop carousel sweep — Sonnet's deferred follow-up)

**OPEN — small autopilot-eligible:**
- KI-057 family is closed; the previously-named C-narrow lane is exhausted
- No remaining open KI fits "single-commit, dev-only, no owner action mid-flight, ships end-to-end on Builder alone" without owner pivot

---

## 6. Suggestions for design work — Sonnet edition

You can _see_ your work live. That's a feedback loop I don't have. Use it aggressively but stay disciplined:

### What live verification unlocks

- **Forbidden-color sweep across surfaces** — your Pass 1 measurement script is gold; reuse it for any design change
- **Touch-target enforcement at real mobile** — measure before claiming compliance; the 457×844 you reached is the right viewport
- **Depth-bar token verification** — sample `box-shadow` of `.bd-dashboard-panel` and confirm composition (gold lamp + cool-blue ring + navy stack)
- **Reduced-motion contract** — `page.emulateMedia({reducedMotion:'reduce'})` + computed-style read; the canonical pattern for any new motion surface
- **Dark-mode toggle** — `localStorage.setItem('bidondent.appearance-mode', 'map-dark')` + reload (you found this in Pass 2; document it once for future handoffs)

### What to NOT change

- **MOLANDJESUS canon** — locked, structural, never touch
- **Forbidden palette values** — never reintroduce
- **`bd-glass-card` family without reduce-motion guards** — V-001 is the model; siblings (`--landing`, `--landing-warm`, `--dashboard`) cannot regress without an explicit override
- **`aria-hidden` on focused-descendant elements** — V-007 is the model; use `inert` if you need both focus + AT exposure suppressed

### Suggested design discipline

1. **Measure first, claim second** — every "fixed" claim should have a live verification step. Your Pass 1/2/3 reports are excellent here.
2. **Sample widely** — 41 surfaces on dashboard light + 9 on Smart Map + 11 on Bids etc. Don't audit one and generalize.
3. **Use the forbidden-color regex check** in Playwright. It catches regressions automatically.
4. **Cite LAW** — every finding should reference the LAW_PROJECT_RULES or LAW_ANIMATION_AND_ATMOSPHERE clause it relates to.

---

## 7. Suggestions for functionality work

### Realtime / hooks

- **Canonical pattern for any new realtime subscription:** `queueMicrotask(doSubscribe)` + `if (!mounted) return` short-circuit + `mounted` flag in cleanup.
- **Reference implementation:** `src/app/hooks/useBidsForReport.ts` (lines 102-167). Has the full WHY comment.
- **All other hooks (8 sites total):** follow the same pattern with a 2-line comment pointing back to `useBidsForReport.ts`.
- **Don't service-layer-defer.** `RealtimeBidService.test.ts` lines 75-90, 110-125, 247-265 have synchronous expectations that would break.
- **Don't introduce `useRealtimeSubscription` abstraction.** ChatGPT pitched this; we declined under containment. If you genuinely need it, surface as architectural decision for owner — not autopilot.

### Edge functions

- **Always `requireClerkSession()`** at handler entry.
- **Always pipe media reads through `hydrateSignedStorageUrl(s)`** if the response includes `photo_urls`, `image_url`, `profile_image_url`.
- **`verify_jwt: false`** in `supabase/config.toml` `[functions.server]` — never flip back.
- **Skill `supabase-clerk-edge-function`** — invoke when adding/editing any Clerk-authed handler.

### React 18 + StrictMode

- **All useEffect-driven subscriptions need StrictMode-safe defer** (KI-057 pattern).
- **All function-component refs need forwardRef wrap** (V-005 lesson — radix-ui adapter pattern).
- **All animations need reduced-motion guard** — either `useReducedMotion()` hook or `@media (prefers-reduced-motion: reduce)` for CSS keyframes.

### Touch targets

- **44×44 minimum** for any tappable element on mobile (LAW touch-target rule).
- **Exception:** elements inside `overflow-x-auto` carousels (intentional swipe surfaces).
- **Sweep pattern:** `document.querySelectorAll('button, a[href], [role="button"]')` + bounding-rect check + carousel-parent walk.

---

## 8. Suggestions for auditing

### Audit-pre-staging (mandatory before any phase / task)

```
1. Read REF_KNOWN_ISSUES.md for the relevant KI's full entry
2. git log -- <files> to confirm no in-flight work
3. git log --grep="<KI-id>" to confirm no shipped fix
4. Check closed-phase audit footers for "RESOLUTION NOTE" subsections
5. Only then start work
```

### Forbidden-color audit (per surface)

```js
const FORBIDDEN = [[220,165,90],[254,248,220],[160,95,25],[220,140,50]];
function rgb(s){...}
document.querySelectorAll('section, main > *, [class*="bd-glass"], [class*="bd-dashboard"], [class*="bd-landing"]').forEach((el,i)=>{
  if(i>40)return;
  const cs=getComputedStyle(el);
  const c=rgb(cs.backgroundColor);
  if(c&&c.r===255&&c.g===255&&c.b===255&&c.a>=0.5) flag('white', el);
  const all=cs.backgroundColor+' '+cs.backgroundImage;
  FORBIDDEN.forEach(([R,G,B])=>{
    const re=new RegExp(`rgba?\\(\\s*${R}\\s*,\\s*${G}\\s*,\\s*${B}\\b`);
    if(re.test(all)) flag('gold', el, `${R},${G},${B}`);
  });
});
```

### Audit doc convention

- Filename: `docs/AUDIT_<TYPE>_<DATE>_<AUTHOR>.md` (matches your Pass 1/2/3 docs)
- Pin HEAD at the top: `**HEAD:** <sha>`
- Findings table with severity ranking (P0..P4, P7-TECHDEBT, P7-DOCS-ONLY)
- Verbatim console output for every measured value
- Screenshot path for every visual finding (under `docs/audit-assets/<type>-<date>/`)
- "Positive verifications" section listing what was clean
- Coverage gaps explicitly accepted

---

## 9. Co-update rules — every commit

When you change a load-bearing fact, update the docs it contradicts in the same pass:

| Trigger | Must update |
|---|---|
| New migration applied | `REF_SYSTEM_STATE.md` |
| New edge endpoint | `REF_SYSTEM_STATE.md` + `SUPABASE_SETUP_GUIDE.md` route map |
| Bug found | `REF_KNOWN_ISSUES.md` (next free KI-### id) |
| Bug fixed | `REF_KNOWN_ISSUES.md` mark RESOLVED with date |
| New persisted media URL column | Hydrate via `hydrateSignedStorageUrl()` + document in `SUPABASE_SETUP_GUIDE.md` §16 |
| Edge function deploy | Verify `verify_jwt: false` preserved. Never use `--verify-jwt` |
| New reusable AI pattern surfaced | Add a skill in `~/.claude/skills/` and reference in CLAUDE.md |
| Doc superseded | Move to `docs/archive/` with date suffix; update cross-refs in same pass |

---

## 10. Commit hygiene

- **`Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`** for your work
- **Subject under 70 chars**, body details
- **Conventional prefix:** `fix(...)`, `feat(...)`, `docs(...)`, `chore(...)`, `polish(...)` matching project history
- **Body includes:** root cause, fix mechanism, verification (build/typecheck/Playwright), files-touched stat, containment notes if applicable
- **Specific files** — never `git add -A` or `git commit -a`
- **Co-update doc updates** in the same commit as the code change

---

## 11. When to consult Opus

You can do most things solo. Spin me up when:

- **Multi-file refactors with no UI** — typescript types, hook signatures, service contracts
- **Edge function logic** — auth flow, storage hydration, error handling
- **Architecture / kernel work** — adding to `OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md`, scoping new phases
- **Second opinion on non-visual concerns** — ChatGPT-style external critique that's not visually verifiable
- **Migration design** — schema changes, RLS policies, RPC functions
- **Multi-AI coordination escalation** — if a third AI joins or layer-separation breaks down

You don't need me for: visual fixes, touch-target compliance, palette enforcement, animation contracts, accessibility (WCAG 4.1.2 etc.), HMR debugging, audit doc writing, anything Playwright-verifiable.

---

## 12. Suggested first action after handoff

1. Read this doc end-to-end (it's your durable reference)
2. Check `git log -5` to confirm tree state
3. Read `CLAUDE.md` if you haven't recently — it's the project's primary entry point
4. If owner names a target, apply binary check + audit-pre-staging
5. If owner says "go full auto" with no target, surface the autopilot-eligible work-ledger or stand by

Don't start with KI-114 sweep automatically — it's parked, and starting it without owner pivot would be condition 2 violation.

---

## 13. Standing position at handoff

| Layer | State |
|---|---|
| HEAD | this commit (Pass 3 ship + handoff briefing) |
| Tree | clean after this commit |
| Sonnet's Pass 3 | committed (V-009..V-015 touch-target fixes) |
| Audit AI handoff complete | yes |
| KI-057 / KI-113 | RESOLVED |
| Cite ledger (binary-check family) | 1 articulation + 5 constraining + 2 framing + 0 independent re-derivations |
| Pre-execution audit pattern | 9-for-9 + 1 audit-driven correction cycle |
| Containment doctrine | held throughout session |

---

## 14. Final note from Opus

This session converged 5 cross-AI critique cycles into stable patterns. Each anti-pattern came wrapped in better-and-better framing, ending with technical analysis that was substantively right but still pitched scope expansion. The session held the line every time. That's the model: take critique seriously enough to audit, but not seriously enough to abandon containment.

You have the visual feedback loop. I have the multi-file synthesis range. The owner has both. Use that division.

`0828dbc8` → this commit.

— Opus 4.7 (1M context), 2026-05-05

---

## Cross-references

- [`CLAUDE.md`](../CLAUDE.md) — project entry point
- [`docs/LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — 6 Laws + apex design canon clauses
- [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — file-size budgets + multi-AI coordination
- [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon + reduced-motion contract
- [`docs/LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — current execution authority + session log
- [`docs/MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon
- [`docs/REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — current truth about the system
- [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI ledger
- [`docs/REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md) — multi-AI session rules
- [`docs/OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md`](OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md) — kernel patterns including audit-pre-staging
- [`docs/AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md`](AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md) — your Pass 1/2/3 audit doc
- [`docs/AUDIT_MAP_FUNCTIONALITY_2026-05-05_SONNET.md`](AUDIT_MAP_FUNCTIONALITY_2026-05-05_SONNET.md) — your map audit
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI lock conventions
