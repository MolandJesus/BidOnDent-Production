# Pass 44 — Authenticated Mobile Evidence Capture (2026-05-07)

**Status:** Strategy A executed — capture machinery validated, **authenticated evidence NOT captured** (no cookies file present).
**Mode:** Audit-only. Zero `src/` or `supabase/` changes.

---

## What this pass set out to do

Capture authenticated mobile evidence (375 + 768 × light + dark) for the five primary post-login surfaces (dashboard, account, bids, report, find-shops). Phase A only had unauthenticated landing coverage at mobile widths because the integrated VS Code browser cannot resize below 1280px.

## Strategy chosen

**Strategy A — puppeteer cookie injection.** The capture script (`phase-44-mobile-capture.mjs`) launches system Chrome via `puppeteer-core`, injects Clerk session cookies from `mobile-auth-cookies.json` (gitignored), then walks each surface at each viewport × theme.

Strategy B (Clerk admin API session minting) was deferred — it requires the Clerk secret key, which is owner-input.

## What actually happened

`mobile-auth-cookies.json` does not exist (this is the first run; the example file ships with placeholder values). The script ran in `unauth-fallback` mode and produced 20 captures — all of which turned out to be the **public landing page rendered at /dashboard**.

The app does **not** redirect unauthenticated visitors away from `/dashboard`; it serves the landing page in-place. The script's `auth=true` heuristic (URL stayed at `/dashboard`) was therefore misleading. All 20 PNGs have been quarantined to [`_unauth_landing_artifacts/`](_unauth_landing_artifacts/) so future readers can see the artifact without confusing it for real authenticated evidence.

**Net new authenticated evidence: zero.** Phase A's existing 12 honest landing captures already cover the unauth surface adequately.

## What this pass DID produce

1. `phase-44-mobile-capture.mjs` — working puppeteer capture machinery, ready to produce real authed evidence as soon as cookies are supplied.
2. `mobile-auth-cookies.example.json` — placeholder shape with the exact cookie names Clerk uses on `localhost:5173`.
3. `.gitignore` updated to permanently exclude any real cookies file from being committed.
4. This SUMMARY documenting the failure mode honestly so the next agent does not retry blindly.

## Owner action required to unblock authed mobile evidence

1. Open `http://localhost:5173/dashboard` in your normal logged-in Chrome (where you are already signed in as molalign5@gmail.com).
2. DevTools → Application → Cookies → `http://localhost:5173`.
3. Copy the values for `__session` and `__client_uat` into a new file at `docs/evidence/pass-44-2026-05-07/mobile-auth-cookies.json`, using `mobile-auth-cookies.example.json` as the shape.
4. Run: `node docs/evidence/pass-44-2026-05-07/phase-44-mobile-capture.mjs`
5. The real cookies file is gitignored — it stays local. Never commit it.

If Clerk rejects the cookies (UA / fingerprint mismatch — planner estimated ~50% chance), Strategy A fails permanently and Strategy B (server-side session minting via Clerk admin API) is the next move.

## Files in this pass

| File                               | Purpose                             | Committed?             |
| ---------------------------------- | ----------------------------------- | ---------------------- |
| `phase-44-mobile-capture.mjs`      | Capture script                      | Yes                    |
| `mobile-auth-cookies.example.json` | Placeholder shape                   | Yes                    |
| `mobile-auth-cookies.json`         | Real cookies (owner-only)           | **No — gitignored**    |
| `capture-log.json`                 | Run log from this attempt           | Yes                    |
| `_unauth_landing_artifacts/*.png`  | 20 misleading captures, quarantined | Yes (for transparency) |
| `SUMMARY.md`                       | This file                           | Yes                    |

## Validation

- Build: not run — pass touched no `src/` or `supabase/` code.
- Diagnostics/Lint: n/a.
- `git status` confirms src/ and supabase/ are untouched.
- Capture script exit code: 0. Twenty PNGs produced and quarantined.

## Risk

**Low.** Only docs/scripts in `docs/evidence/`. No application code or schema touched. Cookie file is permanently gitignored before any cookies could ever be created.

## Next best pass (recommendation only — not auto-executed)

The autopilot-compatible next pass is one of:

- **Pass 45** — Owner exports cookies → re-run script → if successful, capture authed mobile evidence and triage what we find. (Owner-input dependent.)
- **Pass 45-alt** — Pick the next P-priority finding from Phase A SUMMARY that is _not_ mobile-authed-evidence-blocked. Candidates: KI-053 deeper trace under controlled load, dashboard P3 polish items (planner explicitly approved low-risk additive work).

Per planner standby verdict, neither is urgent. Soft Launch Hardening Phase 0 is fundamentally complete. The map-first directive deserves attention before more chrome polish.
