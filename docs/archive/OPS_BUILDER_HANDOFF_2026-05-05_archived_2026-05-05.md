# Builder Handoff — 2026-05-05

**Authority level:** OPS — durable handoff briefing for the main Builder AI on this repo.

**HEAD at handoff:** `08fe13a6` → updated to current after this correction commit

**Outgoing Builder:** Opus 4.7 (1M context, this session — orchestration, hook layer, edge logic, kernel)

**Incoming main Builder:** Opus (VS Code extension surface, with Playwright + browser tooling — closes the visual feedback loop the outgoing Builder didn't have)

**Why the handoff:** Owner picked the VS Code Opus instance as main Builder because the live-browser feedback loop closes a verification cycle the outgoing Opus instance can't reach. Both agents are full peer-level Builders — same model family, same architectural range. The distinction is _surface_, not capability. The incoming Builder gains visibility; both retain the same coding/planning/architecture range. Outgoing Opus stands by in support for: cross-session synthesis, multi-file refactors with no UI, second-opinion on non-visual concerns, kernel/architecture work that benefits from a fresh-context peer.

> **Note on the audit doc author attribution:** The Pass 1/2/3 audit docs (`AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md`, `AUDIT_MAP_FUNCTIONALITY_2026-05-05_SONNET.md`) have `**Auditor:** Sonnet` in their headers — that was a self-mis-identification by the audit AI, which was actually Opus running in the VS Code extension surface. The historical headers are preserved as written; treat the recipient (you) as full peer-level Opus, not Sonnet.

---

## 1. Reading order on first session

These docs override anything in this briefing. Read in this order before acting:

1. [`CLAUDE.md`](../CLAUDE.md) — project entry point + load-bearing facts
2. [`docs/LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — 6 Laws + apex design canon clauses
3. [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — L1/L2/L3/L4 model + file-size budgets + multi-AI coordination
4. [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon + reduced-motion contract
5. [`docs/LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — current execution authority + session log (read the most recent ~5 entries)
6. [`docs/MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — locked apex design canon (do not propose merges/splits/restructures)
7. [`docs/REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — current truth about the system
8. [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI ledger
9. [`docs/REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md) — multi-AI session rules
10. [`docs/OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md`](OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md) — kernel patterns including audit-pre-staging
11. [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI lock conventions
12. This handoff doc — session-specific context not in the above

---

## 2. Repo facts you need

```
Repo:        BidOnDent (map-first auto repair bidding marketplace)
Branch:      BidOnDent-Horizon-Beta (active development)
Main:        main (production target — owner gates merges)
HEAD:        08fe13a6 (Pass 3 + handoff briefing) → this correction commit
Working dir: /Users/molalignmeagher/BidOnDent GitHub Repository/BidOnDent-Production
Phase:       Soft Launch Hardening (no new features — harden + ship)
```

**Frontend:** React 18 + TypeScript + Vite 6 + Tailwind v4 + MapLibre GL JS
**Auth:** Clerk (JWT) — NOT Supabase Auth
**Backend:** Supabase (Postgres + PostGIS + Storage + Realtime + Edge Functions in Deno)
**Animation:** `motion/react` v12 (framer-motion rebrand) + CSS keyframes; reduced-motion contract mandatory

---

## 3. What this session shipped — chronology + reasoning

In commit-order, with rationale:

| SHA        | What                                                          | Why it matters                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fae329d8` | KI-112 gating-chain unblock close                             | Phase 7.6 / KI-113 cleared reduced-motion contract; unblocks KI-112 sub-fixes if owner activates Path A later                                                                          |
| `baee9966` | Phase 8.5 close (Path Y, docs-only)                           | Map ambient/idle motion folded into KI-112 F4/F5/F6; canvas-side animation deferred to post-launch                                                                                     |
| `40cc5b4e` | Dependabot triage 2026-05-05                                  | npm audit clean on Horizon-Beta; main-branch unpatched at moment of triage but resolves at merge                                                                                       |
| `c75fe3d7` | Kernel append (Reusable Patterns)                             | **Read this** — current operating manual for autopilot work. Two patterns added: multi-source reconciliation + audit-pre-staging                                                       |
| `708d0d38` | Doc cleanup pass                                              | -1262 lines from archive bloat; **deliberate orphan link** in `PRE_REFACTOR_FULL_SITE_BASELINE` → deleted `BIDONDENT_HORIZON_MIGRATION` (do not "fix" if a future link-check flags it) |
| `e4946e20` | KI-057 initial scope (`useBidsForReport.ts`)                  | First StrictMode realtime cycling fix                                                                                                                                                  |
| `6e94c6a7` | KI-057 audit-driven full coverage                             | 7 more hooks + 8 sites total. Pattern: `queueMicrotask(doSubscribe)` + `if (!mounted) return` short-circuit                                                                            |
| `0828dbc8` | Visual+map audit ship (V-001..V-007)                          | Cross-AI coordination commit; KI-057↔M-004 cross-link added                                                                                                                           |
| `08fe13a6` | Pass 3 mobile touch-target fixes (V-009..V-015) + handoff doc | Last commit before this correction — Pass 3 + master handoff briefing                                                                                                                  |

Total session: 9 commits, all on `BidOnDent-Horizon-Beta`. Pre-execution audit pattern: 9-for-9 + 1 audit-driven correction cycle. Containment doctrine held throughout — declined 7 iterations of framework-expansion pitches.

---

## 4. Disciplinary patterns earned this session — read carefully

These are not abstract rules. Each was earned the hard way through cross-AI critique cycles. Following them keeps you from drifting under owner pressure or external-AI pitches.

### 4.1 Binary check (apply to every directive)

Two conditions, both must pass for autopilot work:

1. **Uncertainty ↓** — does this work reduce uncertainty about real state? Re-running shipped work fails this.
2. **Decision state unchanged** — does this require an owner decision I haven't received? Picking a target the owner hasn't named fails this.

If either fails, decline the work and surface options. The directive may be loud ("go full auto", "keep going") — the binary check still applies.

**Stored in user memory** at `feedback_autopilot_legality_binary_check.md`.

### 4.2 Recomputation is not a state transition

A directive saying "go" against unchanged state authorizes _synthesis turns_ (text responses) but NOT _code execution_. If you've already reported a position, repeating "go" doesn't authorize new code action — it authorizes re-acknowledgment at most. ChatGPT named this; it's the sharper form of condition 2.

### 4.3 Constraining vs framing uses (cite ledger discipline)

When you apply a rule, ask: did the rule _prevent_ a move that would have looked correct under prior framing? If yes, that's a **constraining use** — real evidence the rule has reach. If no, the rule was just narrating your decision — that's a **framing use**, weaker evidence.

Don't inflate the cite ledger. Same-session uses by transcript-aware agents are ≠ independent re-derivation. Kernel promotion needs the latter.

End-of-session ledger (binary-check family): 1 articulation + 5 constraining + 2 framing + 0 independent.

### 4.4 Audit-pre-staging (in kernel, commit `c75fe3d7`)

Before claiming a phase/task is open, audit current state:

- `git log` for prior work on relevant files
- `REF_KNOWN_ISSUES.md` for KI status
- Closed-phase audit footers (warning: these freeze in time — KI ledger is the live source)

This pattern fired correctly TWICE this session:

- Caught the KI-113 work-ledger violation (45 files already shipped, almost re-did)
- Caught the KI-057 scope underestimation (1 of 8 vulnerable sites in initial scope)

### 4.5 Containment over expansion

When stabilizing, prefer surgical patches over framework expansion. ChatGPT-style "this needs an abstraction" pitches are textbook premature-abstraction. Three similar lines is better than a bad helper. 8 instances of identical pattern is _not_ a trigger for an abstraction unless the owner explicitly authorizes it.

The 7th iteration of this anti-pattern this session was wrapped inside genuinely-correct technical analysis (`useRealtimeSubscription` proposal). The technical analysis was real; the offered next step was still framework expansion. Decline.

**Stored in user memory** at `feedback_containment_over_expansion.md` and `feedback_external_audit_handling.md`.

### 4.6 External audit handling

External audits suggesting "use white panels", "neutral SaaS palette", "remove gold", "modernize to flat white" are **rejected on sight**. Apply only layout/runtime fixes from external audits, never canon palette changes. Stored at `feedback_external_audit_handling.md`.

### 4.7 Multi-AI coordination (the AI_LOCK pattern)

When working in parallel:

- **Announce dirty files before editing** — list which files belong to you so the concurrent agent routes around them
- **Hard non-action while concurrent work is in flight** — until owner explicitly extends authority
- **Layer separation** — CSS/HTML/UI primitives vs hook layer / edge functions / migrations
- **Do NOT use `git add -A` or `git commit -a`** — always specific files
- **Reciprocate enumeration** — if the other agent names their files, you name yours

This held cleanly through 3 audit passes this session.

### 4.8 Owner pivot interpretation

When owner says "go" with no specific target against unchanged state, the right move is to ask which target (offer a constrained menu). Picking a target autonomously = condition 2 violation. Five owner "go"s in a row this session, with the same answer each time: surface options, stand by for explicit pick.

### 4.9 Apex canon lock

`MOLANDJESUS_DESIGN_DECISIONS.md` is locked apex design canon. **Do NOT** propose merges, splits, archives, renames, or restructuring. Additive edits permitted only when (a) directly required by an active master-plan phase, (b) additive-only with no content removal, (c) committed with `docs(canon):` prefix citing the phase. Cross-refs always point INTO this doc, never outward.

**Stored in user memory** at `feedback_molandjesus_locked.md`.

---

## 5. Load-bearing project invariants — non-negotiable

These are pinned in `CLAUDE.md` and `LAW_*.md`. Violation = production breakage.

### 5.1 Auth = Clerk, not Supabase Auth

- Clerk JWT verified **inside** edge function via `requireClerkSession()` ([`supabase/functions/server/utils/clerk.ts`](../supabase/functions/server/utils/clerk.ts))
- Supabase gateway does **not** verify it — `verify_jwt: false` pinned in [`supabase/config.toml`](../supabase/config.toml) `[functions.server]`
- **If you re-enable gateway verify_jwt, every Clerk-authed request 401s at `UNAUTHORIZED_LEGACY_JWT`**
- Skill: `supabase-clerk-edge-function`. Doc: `SUPABASE_SETUP_GUIDE.md` §17.

### 5.2 Storage URLs are pointers, not signed URLs

- Database columns that hold user media (`damage_reports.photo_urls`, `*.profile_image_url`, `vehicles.image_url`) store `storage://<bucket>/<path>` pointers
- Signed URLs minted **on every read** via `hydrateSignedStorageUrl()` ([`supabase/functions/server/utils/storage.ts`](../supabase/functions/server/utils/storage.ts))
- **Never persist a signed URL** — they expire after 24h max
- Skill: `supabase-storage-signed-urls`. Doc: `SUPABASE_SETUP_GUIDE.md` §16

### 5.3 Storage RLS is deny-by-default

- `storage.objects` has RLS enabled with **zero policies**
- All buckets are private
- Access only through edge function (service role) or signed URLs minted by it
- **Don't add storage policies** unless adding direct-from-client upload/read flows

### 5.4 Every new edge handler that reads media must hydrate

If you write a new handler that does `select('*')` from `damage_reports`, `vehicles`, or any profiles table and returns rows to the client, it **must** pipe `photo_urls` / `image_url` / `profile_image_url` through `hydrateSignedStorageUrl(s)` first. The historical bypass at `getJobAssignments` is the cautionary tale (KI-058).

### 5.5 Use `bd-*` utility classes, not hand-rolled Tailwind

Form fields, cards, buttons should use the `bd-*` utility set in [`src/styles/theme.css`](../src/styles/theme.css). Calm/premium/map-first identity. Skill: `bd-design-identity`.

### 5.6 Schema source of truth = `supabase/migrations/*.sql`

`database_init.tsx` is a legacy cold-start safety net only. New schema changes land as new migration files.

### 5.7 Light mode = cool blue dominant + premium gold lamp + warm hero — NEVER pure white, NEVER yellow-amber

- Cool misty blue-gray canvas
- Layered hierarchy of cool blue/cyan/indigo glass panels
- Lit from above by premium bronze/champagne gold lamp
- Single warm cream-gold hero panel per screen
- Warm gold/champagne pop tiles on Quick Actions row

**Locked palette (warm role-based family):**

- Top/corner lamp light: `rgba(196, 144, 65)`
- Deeper outer/far halo: `rgba(196, 130, 45)`
- Bronze trim: `rgba(140, 82, 22)`
- Gold-tinted cream insets: `rgba(252, 238-240, 204-208)`

**Forbidden palette (do not regress — each has reverted multiple times):**

- `rgba(220, 165, 90)` — old halo
- `rgba(254, 248, 220)` — old cream inset
- `rgba(160, 95, 25)` — old trim
- `rgba(220, 140, 50)` — old saturated gold

### 5.8 Reduced-motion contract (LAW_ANIMATION_AND_ATMOSPHERE §3 + §5)

- All `motion/react` surfaces must use `useReducedMotion()` OR be wrapped by `<MotionConfig reducedMotion="user">` (root wrap shipped in `src/main.tsx` per Phase 7.6 / KI-113 close)
- `MotionConfig` covers spring/whileTap surfaces by default but does NOT override explicit `transition={{ duration: N }}` props — those need per-component `useReducedMotion()`
- All CSS keyframes must have `@media (prefers-reduced-motion: reduce)` overrides setting `animation: none` and `transition: none`
- WAAPI animations are independent of CSS transitions — both must respect reduce
- 45 motion/react files wrapped via `useReducedMotion()` + `reduceMotion ? 0 : <original>` pattern (Phase 7.6 sweep)

### 5.9 Touch targets — 44×44 minimum on mobile

LAW touch-target rule. Exception: elements inside `overflow-x-auto` swipe carousels (intentional). 6 violations fixed this session (V-009..V-015); 6 lower-impact `min-h-[36px]` instances inside shop carousels deferred as KI-114 (acceptable).

---

## 6. Current KI ledger snapshot

**RESOLVED this session:**

- KI-057 (StrictMode realtime cycling, 8/8 sites)
- KI-113 (reduced-motion contract, 45 files in Phase 7.6)
- V-001 / V-002 / V-003 / V-004 / V-005 / V-007 / V-009-V-015 (visual + touch-target fixes)

**OPEN — owner-action-required (do NOT autopilot):**
| KI | What | Owner action |
|---|---|---|
| KI-002 (P0) | Email notifications | Human secret deployment to Resend |
| KI-064 | Honda Accord red rectangle | Owner SQL run on prod data |
| KI-095 | notification-preferences 500 | Owner Dashboard SQL Editor (PG17 path) |
| KI-096 | Clerk Log Out smoke test | Owner browser test |
| KI-101 | "Toyoto" misspelling | Owner DB action |
| KI-102 | Cat photo damage report | Owner data hygiene |
| KI-103 | Footer email decision | Owner UX decision |

**OPEN — hard-stop (do NOT autopilot):**
| KI | Why it's hard-stop |
|---|---|
| KI-060 | Delete 2 unused edge functions = deploy/provider action; needs owner Supabase Dashboard |

**OPEN — architectural / large-scope (need owner approach approval before code):**
| KI | Severity | Concern |
|---|---|---|
| KI-010 | P2 | `buildDashboardRouterProps` architectural choke point |
| KI-011 | P2 | State-driven routing (no URL sharing) |
| KI-012 | P3 | Bids split state ownership |
| KI-020 | P2 | Type boundary mapping locations |
| KI-021 | P3 | DamageReport.status DB-vs-domain mismatch |
| KI-030 | P3 | Insurer role thin stub |
| KI-040 | P3 | Rate limiting per-instance, not distributed |

**OPEN — deferred (intentional, post-launch):**

- KI-041, KI-042, KI-053, KI-075, KI-100, KI-089, KI-106
- KI-112 (atmosphere/idle motion gap family — owner-taste-deferred sub-fixes F1/F2/F3/F4/F5/F6)
- KI-114 (lower-impact `min-h-[36px]` shop carousel sweep — Pass 3 deferred follow-up)

**OPEN — small-scope:**

- KI-057 family is closed; previously named C-narrow lane is exhausted
- No remaining open KI fits "single-commit, dev-only, no owner action mid-flight, ships end-to-end on Builder alone" without owner pivot

---

## 7. Suggestions for design work

You can _see_ your work live via Playwright. That feedback loop is the right tool for any design or visual change — use it aggressively but stay disciplined.

### What live verification unlocks

- **Forbidden-color sweep across surfaces** — script in §9.2 below; reuse for any design change
- **Touch-target enforcement at real mobile** — measure before claiming compliance; the 457×844 viewport is the practical mobile reach
- **Depth-bar token verification** — sample `box-shadow` of `.bd-dashboard-panel` and confirm composition (gold lamp 196,144,65 + cool-blue ring 96,165,250 + navy 2,6,23 stack)
- **Reduced-motion contract** — `page.emulateMedia({reducedMotion:'reduce'})` + computed-style read; canonical pattern for any new motion surface
- **Dark-mode toggle (Electron browser)** — `localStorage.setItem('bidondent.appearance-mode', 'map-dark')` + reload (no UI toggle reachable in dev-demo session)
- **Sign-out (for unauth landing audits)** — `await window.Clerk.signOut()` + `localStorage.clear()` + `sessionStorage.clear()` + `goto('/landing')`

### What to NOT change

- **MOLANDJESUS canon** — locked, structural, never touch
- **Forbidden palette values** — never reintroduce
- **`bd-glass-card` family without reduce-motion guards** — V-001 is the model; siblings (`--landing`, `--landing-warm`, `--dashboard`) cannot regress without an explicit override
- **`aria-hidden` on focused-descendant elements** — V-007 is the model; use `inert` if you need both focus + AT exposure suppressed
- **AlertDialog primitives without `forwardRef`** — V-005 is the model; radix-ui adapter pattern

### Suggested design discipline

1. **Measure first, claim second** — every "fixed" claim should have a live verification step
2. **Sample widely** — 41 surfaces on dashboard light + 9 on Smart Map + 11 on Bids etc. Don't audit one and generalize
3. **Use the forbidden-color regex check** in Playwright. It catches regressions automatically
4. **Cite LAW** — every finding should reference the LAW_PROJECT_RULES or LAW_ANIMATION_AND_ATMOSPHERE clause it relates to
5. **Audit doc convention** — `docs/AUDIT_<TYPE>_<DATE>_<AUTHOR>.md`, pin HEAD at top, severity-ranked findings table, screenshot per visual finding under `docs/audit-assets/<type>-<date>/`
6. **Skill: `bd-design-identity`** — invoke for any UI/visual work

---

## 8. Suggestions for functionality work

### 8.1 Realtime / hooks

**Canonical pattern for any new realtime subscription:**

```tsx
useEffect(() => {
  // ... early returns ...

  let mounted = true;
  let currentUnsubscribe: (() => void) | null = null;

  function doSubscribe() {
    // StrictMode-safe: defer subscribe by one microtask + `mounted` short-circuit.
    // See useBidsForReport.ts for full mechanism + KI-057.
    if (!mounted) return;
    currentUnsubscribe = realtimeXxxService.subscribeXxx(...);
  }

  queueMicrotask(doSubscribe);

  return () => {
    mounted = false;
    if (currentUnsubscribe) currentUnsubscribe();
  };
}, [...]);
```

- **Reference implementation:** [`src/app/hooks/useBidsForReport.ts`](../src/app/hooks/useBidsForReport.ts) (lines 102-167) has the full WHY comment
- **All 8 hooks already on this pattern:** useBidsForReport, useCustomerBidNotifications, useShopBidStatusNotifications, useCustomerReportStatusNotifications, useShopEstimateStatusNotifications, useCustomerEstimateResponseNotifications, useInsurerClaimNotifications, useReportLayerData
- **Don't service-layer-defer** — `RealtimeBidService.test.ts` lines 75-90, 110-125, 247-265 have synchronous expectations that would break
- **Don't introduce `useRealtimeSubscription` abstraction** — declined under containment

### 8.2 Edge functions

- **Always `requireClerkSession()`** at handler entry
- **Always pipe media reads through `hydrateSignedStorageUrl(s)`** if response includes `photo_urls`, `image_url`, `profile_image_url`
- **`verify_jwt: false`** in `supabase/config.toml` `[functions.server]` — never flip back
- **Edge function source structure:** [`supabase/functions/server/`](../supabase/functions/server/)
  - `index.ts` — Hono router
  - `handlers/<route>.ts` — handler files (auth-gated)
  - `utils/clerk.ts` — `requireClerkSession()`, JWKS verification
  - `utils/storage.ts` — `hydrateSignedStorageUrl()`
- **Skill `supabase-clerk-edge-function`** — invoke when adding/editing any Clerk-authed handler

### 8.3 React 18 + StrictMode

- **All useEffect-driven subscriptions need StrictMode-safe defer** (KI-057 pattern above)
- **All function-component refs need `forwardRef` wrap** (V-005 lesson — radix-ui adapter pattern)
- **All animations need reduced-motion guard** — `useReducedMotion()` hook OR `@media (prefers-reduced-motion: reduce)` for CSS keyframes

### 8.4 Type system

- Domain types in `src/app/types/*` (canonical app types)
- DB row types from Supabase types generation
- Mapping at boundary (KI-020 tracks mapping fragmentation)
- **Don't introduce a third type layer** without owner approval

### 8.5 Migrations

- New schema = new migration file in `supabase/migrations/`
- **Use `gen_random_uuid()` instead of `uuid_generate_v4()`** — `db push` is broken on PG17 staging (`feedback_supabase_cli_pg17` memory)
- **Workflow:** write migration → paste in Supabase Dashboard SQL editor for staging (CLI broken) → apply via CLI or Dashboard for prod
- Update `REF_SYSTEM_STATE.md` in same pass

---

## 9. Suggestions for auditing

### 9.1 Audit-pre-staging (mandatory before any phase / task)

```
1. Read REF_KNOWN_ISSUES.md for the relevant KI's full entry
2. git log -- <files> to confirm no in-flight work
3. git log --grep="<KI-id>" to confirm no shipped fix
4. Check closed-phase audit footers for "RESOLUTION NOTE" subsections
   (audit doc footers freeze in time — KI ledger is live)
5. Only then start work
```

### 9.2 Forbidden-color audit (per surface, Playwright)

```js
const FORBIDDEN = [
  [220, 165, 90],
  [254, 248, 220],
  [160, 95, 25],
  [220, 140, 50],
];
function rgb(s) {
  const m = s.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? +m[4] : 1 } : null;
}
function tag(el) {
  const c = (el.className || "").toString().trim().split(/\s+/).slice(0, 2).join(".");
  return el.tagName.toLowerCase() + (c ? "." + c : "");
}
const out = { whites: [], golds: [] };
document
  .querySelectorAll(
    'section, main > *, [class*="bd-glass"], [class*="bd-dashboard"], [class*="bd-landing"], header'
  )
  .forEach((el, i) => {
    if (i > 40) return;
    const cs = getComputedStyle(el);
    const c = rgb(cs.backgroundColor);
    if (c && c.r === 255 && c.g === 255 && c.b === 255 && c.a >= 0.5) out.whites.push(tag(el));
    const all = cs.backgroundColor + " " + cs.backgroundImage;
    FORBIDDEN.forEach(([R, G, B]) => {
      const re = new RegExp(`rgba?\\(\\s*${R}\\s*,\\s*${G}\\s*,\\s*${B}\\b`);
      if (re.test(all)) out.golds.push({ sel: tag(el), hit: `${R},${G},${B}` });
    });
  });
return JSON.stringify(out);
```

### 9.3 Touch-target audit (per surface, mobile)

```js
const seen = new Set();
const out = {
  hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  smallTouch: [],
};
document.querySelectorAll('button, a[href], [role="button"]').forEach((el) => {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return;
  if (r.bottom < 0 || r.top > 4000) return;
  // Ignore inside horizontal-scroll carousel parent
  let p = el.parentElement,
    inCarousel = false;
  for (let i = 0; i < 5 && p; i++) {
    const ovx = getComputedStyle(p).overflowX;
    if (ovx === "auto" || ovx === "scroll") {
      inCarousel = true;
      break;
    }
    p = p.parentElement;
  }
  if (inCarousel) return;
  if (r.height < 43.5 || r.width < 43.5) {
    const txt = (el.textContent || "").trim().slice(0, 28) || el.getAttribute("aria-label") || "?";
    const k = el.tagName + "|" + (el.className || "").toString().slice(0, 40) + "|" + txt;
    if (!seen.has(k)) {
      seen.add(k);
      out.smallTouch.push({ w: +r.width.toFixed(1), h: +r.height.toFixed(1), txt });
    }
  }
});
out.smallTouch = out.smallTouch.slice(0, 25);
return JSON.stringify(out);
```

### 9.4 Reduced-motion contract verification

```js
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForTimeout(500);
const result = await page.evaluate(() => {
  const targets = [".bd-glass-card", ".bd-dashboard-panel", ".bd-dashboard-section"];
  return targets.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, found: false };
    const cs = getComputedStyle(el);
    const durs = cs.transitionDuration.split(",").map((d) => parseFloat(d));
    return {
      sel,
      found: true,
      transitionDuration: cs.transitionDuration,
      animationName: cs.animationName,
      maxDur: Math.max(...durs),
      pass: durs.every((d) => d <= 0.05) && cs.animationName === "none",
    };
  });
});
await page.emulateMedia({ reducedMotion: "no-preference" });
return JSON.stringify(result);
```

### 9.5 Audit doc convention

- **Filename:** `docs/AUDIT_<TYPE>_<DATE>_<AUTHOR>.md`
- **Pin HEAD** at the top: `**HEAD:** <sha>`
- **Findings table** with severity ranking (P0..P4, P7-TECHDEBT, P7-DOCS-ONLY)
- **Verbatim console output** for every measured value
- **Screenshot path** for every visual finding (under `docs/audit-assets/<type>-<date>/`)
- **"Positive verifications"** section listing what was clean
- **Coverage gaps** explicitly accepted

---

## 10. Co-update rules — every commit

When you change a load-bearing fact, update the docs it contradicts in the same pass:

| Trigger                          | Must update                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| New migration applied            | `REF_SYSTEM_STATE.md`                                                               |
| New edge endpoint                | `REF_SYSTEM_STATE.md` + `SUPABASE_SETUP_GUIDE.md` route map                         |
| Bug found                        | `REF_KNOWN_ISSUES.md` (next free KI-### id)                                         |
| Bug fixed                        | `REF_KNOWN_ISSUES.md` mark RESOLVED with date                                       |
| New persisted media URL column   | Hydrate via `hydrateSignedStorageUrl()` + document in `SUPABASE_SETUP_GUIDE.md` §16 |
| Edge function deploy             | Verify `verify_jwt: false` preserved. Never use `--verify-jwt`                      |
| New reusable AI pattern surfaced | Add a skill in `~/.claude/skills/` and reference in CLAUDE.md                       |
| Doc superseded                   | Move to `docs/archive/` with date suffix; update cross-refs in same pass            |

---

## 11. Commit hygiene

- **`Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`** for your work
- **Subject under 70 chars**, body details
- **Conventional prefix:** `fix(...)`, `feat(...)`, `docs(...)`, `chore(...)`, `polish(...)` matching project history
- **Body includes:** root cause, fix mechanism, verification (build/typecheck/Playwright), files-touched stat, containment notes if applicable
- **Specific files** — never `git add -A` or `git commit -a`
- **Co-update doc updates** in the same commit as the code change
- **Always create NEW commits** rather than amending — pre-commit hook failures means commit didn't happen, so `--amend` would modify the prior commit (data loss risk)

---

## 12. Multi-AI coordination — current state

- **You are now main Builder** in this repo
- **Outgoing Opus** stands by for: cross-session synthesis, multi-file refactors with no UI, edge function logic, kernel/architecture work, second-opinion on non-visual concerns, migration design
- **No third agent** currently active (audit AI handed off cleanly — that audit AI was you, in your earlier visual+map audit pass)
- **AI_LOCK convention** held throughout this session — preserve it for any future parallel work

When to ask for outgoing-Opus support:

- Architecture / kernel work — adding to `OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md`, scoping new phases
- Multi-file refactors with no UI — type signatures, hook contracts, service boundaries
- Edge function logic — auth flow, storage hydration, error handling
- Second opinion on ChatGPT-style external critique that isn't visually verifiable
- Migration design — schema changes, RLS policies, RPC functions
- Multi-AI escalation — if a third AI joins or layer-separation breaks down

You don't need outgoing-Opus for: visual fixes, touch-target compliance, palette enforcement, animation contracts, accessibility (WCAG), HMR debugging, audit doc writing, anything Playwright-verifiable, KI close commits within owner-named scope.

---

## 13. Suggested first action after taking over

1. **Read this doc end-to-end** — it's your durable reference
2. **Read `CLAUDE.md`** — project entry point, has load-bearing facts you'll need on every task
3. **`git log -10`** — confirm tree state
4. **Quick scan** of [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI ledger
5. **If owner names a target:** apply binary check + audit-pre-staging, then execute
6. **If owner says "go full auto" with no target:** surface autopilot-eligible work-ledger or stand by

**Don't** start with KI-114 sweep automatically — it's parked, and starting it without owner pivot would be condition 2 violation.

**Don't** commit any work the outgoing Opus left mid-flight without verifying — they did committed everything before handing off (tree clean at HEAD after this correction).

---

## 14. Deep architecture context

### 14.1 Layered architecture (LAW)

Per [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md):

- **L1 — Atoms / Tokens** — `src/styles/theme.css`, design tokens, primitive UI components in `src/app/components/ui/`
- **L2 — Composed Components** — `src/app/components/{role}/*` — feature-scoped components (admin/, customer/, shop/, insurer/, landing/, dashboard/, codelayer/)
- **L3 — Hooks + Services** — `src/app/hooks/*`, `src/app/services/*` — data access, state machines, realtime
- **L4 — Edge / Backend** — `supabase/functions/server/*`, `supabase/migrations/*`

**File-size budgets:**

- L1: typically <200 LOC
- L2: typically <500 LOC; some screens up to 800
- L3: typically <300 LOC for hooks; services can be larger
- L4: handler files <250 LOC; utilities <150 LOC

**Forbidden cross-layer flows:**

- L4 → L3: edge handlers don't know about hooks
- L1 → L3 or L4: tokens don't fetch
- L2 → L4 directly: components route through hooks/services

### 14.2 Map architecture

- MapLibre GL JS (canvas-side rendering)
- DOM-overlay markers for some pin types (landing hero)
- Style files: `mapLibreStyles*.json` (cartocdn voyager + arcgis satellite)
- Realtime layer data via `useReportLayerData` hook (subscribes to `damage_reports` + `bids` channels)
- Tile aborts (M-001) are expected during pan — not a bug

Active map plan: [`docs/PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md). Future nav engine: KI-075 (deferred).

### 14.3 Notification + realtime system

- **Three realtime services** — `RealtimeBidService`, `RealtimeReportService`, `RealtimeEstimateService`
- **8 consumer hooks** — see §8.1 for full list, all on the queueMicrotask pattern
- **Notification stack** — `useNotifications()` + `NotificationContext` + `NotificationCenter` UI
- **Toast layer** — `showToast` callback wired through `buildDashboardRouterProps`

### 14.4 Past incidents that taught patterns (reference)

| KI                          | What broke                                             | Pattern learned                                                 |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| KI-058                      | Persisted signed URLs expired after 24h                | Storage pointer pattern (`storage://`) + sign-on-read           |
| KI-059                      | Gateway `verify_jwt: true` 401'd Clerk JWTs            | Pin `verify_jwt: false` in `config.toml`; verify inside handler |
| KI-046                      | Browser geocoding hit Nominatim directly (CSP)         | Route through edge function                                     |
| KI-052                      | Map invented zero-distance demo route times            | Pure function honesty fix                                       |
| KI-055                      | Customer data lost after Clerk ID rotation             | Stable email-based fallback ID                                  |
| KI-057                      | StrictMode realtime cycling                            | `queueMicrotask` defer + `mounted` short-circuit                |
| KI-058 (catch-block bypass) | Hydrate fallback returned raw `storage://` strings     | Fail closed, return empty array                                 |
| KI-065                      | Multiple raw `<img>` sites could leak `storage://`     | `ImageWithFallback` everywhere                                  |
| KI-113                      | 45 motion/react files ignored `prefers-reduced-motion` | `MotionConfig` root + per-file `useReducedMotion()`             |

These are the patterns that turn into kernel rules. Read `OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md` for the formalized versions.

---

## 15. Standing position at handoff

| Layer                             | State                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------- |
| HEAD                              | this commit (correction + rename) — tracks `08fe13a6` Pass 3 + handoff briefing |
| Tree                              | clean after this commit                                                         |
| Pass 3                            | shipped (V-009..V-015 touch-target fixes)                                       |
| Master handoff doc                | this doc, live at `docs/OPS_BUILDER_HANDOFF_2026-05-05.md`                      |
| Main Builder                      | you (Opus, VS Code surface, Playwright-equipped)                                |
| Outgoing Opus                     | support role                                                                    |
| Cite ledger (binary-check family) | 1 articulation + 5 constraining + 2 framing + 0 independent                     |
| Pre-execution audit pattern       | 9-for-9 + 1 audit-driven correction cycle                                       |
| Containment doctrine              | held throughout session                                                         |

---

## 16. Final note

This session converged 5 cross-AI critique cycles into stable patterns. Each anti-pattern came wrapped in better-and-better framing, ending with technical analysis that was substantively right but still pitched scope expansion. The session held the line every time. That's the model: take critique seriously enough to audit, but not seriously enough to abandon containment.

You have the visual feedback loop. You also have full Builder range — edge functions, hooks, migrations, kernel work — you're a peer-level Opus. Use both.

The owner has both surfaces. Use that division when work splits cleanly along visual-vs-non-visual lines, but don't artificially constrain your scope to just visual.

`08fe13a6` → this correction commit.

— Outgoing Opus 4.7 (1M context), 2026-05-05

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
- [`docs/AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md`](AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md) — Pass 1/2/3 audit doc (header attributes "Sonnet" — actual auditor was Opus VS Code instance; historical artifact preserved)
- [`docs/AUDIT_MAP_FUNCTIONALITY_2026-05-05_SONNET.md`](AUDIT_MAP_FUNCTIONALITY_2026-05-05_SONNET.md) — map audit
- [`AI_LOCK.md`](../AI_LOCK.md) — multi-AI lock conventions
