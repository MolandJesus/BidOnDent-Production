# Developer Setup (OPS)

**Authority level:** OPS — operational guide for getting BidOnDent running locally with Clerk + Supabase, plus Google OAuth provider configuration.

**Last updated:** 2026-05-04

**Supersedes:** `GETTING_STARTED.md` + `GOOGLE_OAUTH_SETUP.md` (both archived 2026-05-04 under `docs/archive/`).

**Scope note:** This guide covers local setup, first-run flow, and one-time auth-provider configuration. For current execution truth during hardening, read [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md). For architecture truth, read [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md). For Supabase platform contract details (signed-URL pattern, edge function `verify_jwt: false`, etc.), read [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md).

**AI agents:** read [`../AGENTS.md`](../AGENTS.md) (or [`../CLAUDE.md`](../CLAUDE.md)) before starting any work. Those entry points list load-bearing rules and the active skill set.

Total expected setup time: ~10 minutes for local dev, +10 minutes if you also configure Google OAuth.

---

## Part 1 — Local environment setup

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- Clerk account: https://clerk.com
- Supabase account: https://supabase.com

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Fill in `.env` with:

| Variable                     | Source                                                    |
| ---------------------------- | --------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → Your App → API Keys (starts with `pk_`) |
| `VITE_SUPABASE_URL`          | Supabase Project Settings → API → Project URL             |
| `VITE_SUPABASE_ANON_KEY`     | Supabase Project Settings → API → anon/public key         |

Optional for local development:

- `SUPABASE_ACCESS_TOKEN` — CLI auth for deployments
- `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD` — direct Postgres access

Keep all `.env` values local-only. Do not commit `.env` or `.env.*` files.

### 3) Bootstrap the database

As of 2026-04-15 the schema is a single consolidated migration: [`supabase/migrations/20251230000001_full_schema.sql`](../supabase/migrations/20251230000001_full_schema.sql). The 27 historical incremental migrations are archived at `supabase/migrations/_archived/` and must not be re-applied — see that folder's README for context.

#### Option A — Local Docker stack (preferred for dev)

Install the Supabase CLI, make sure Docker Desktop is running, then from the repo root:

```bash
supabase start
```

The CLI spins up Postgres + Studio + edge runtime locally and applies `20251230000001_full_schema.sql` on first boot. Studio is at http://127.0.0.1:54323.

#### Option B — Dashboard paste against a hosted project

If you're bootstrapping a brand-new hosted Supabase project (fresh staging, cloned prod, personal sandbox):

1. Open the project's SQL Editor in the Supabase dashboard.
2. Paste the contents of `supabase/migrations/20251230000001_full_schema.sql` and run it.
3. Verify: 17 tables in `public`, 34 RLS policies, 3 canonical + 3 legacy storage buckets (all `public = false`), PostGIS enabled.

`supabase db push` is **not** a supported path right now: production's migration history contains the old per-file names, so a push would try to re-apply the consolidated file and fail. Dashboard paste is the current bootstrap path for hosted environments.

This bootstrap creates:

- Core tables (profiles, vehicles, damage reports, bids)
- Website identity/session tables (`website_preferences`, `website_relationships`)
- RLS policies, indexes, triggers
- Canonical storage buckets (`bidondent-account-media`, `bidondent-vehicle-media`, `bidondent-report-media`) — all private, accessed via edge functions + signed URLs

### 4) Start the app

```bash
npm run dev
```

Open: http://localhost:5173

#### Local browser audit mode (browser hits the local Docker Supabase stack)

When the browser needs to exercise the local Docker Supabase stack instead of the cloud project, use the repo-owned helper. It auto-discovers the local API URL and anon key — no copy/paste of secrets, no proxy hop.

```bash
supabase start            # if the local stack isn't already running
npm run dev:local-browser
```

Open: http://localhost:5173

Notes:

- `npm run dev:local-browser` runs `supabase status -o env` to read the local Docker `API_URL` and `ANON_KEY`, then starts Vite with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set to those values for that process only. Your `.env` is not modified.
- The dev-server CSP in `vite.config.ts` allow-lists `http://127.0.0.1:54321` and `http://localhost:54321` for dev only, so the browser can call the local stack directly. The production CSP (set via Vercel headers) is unaffected.
- Override the discovered URL only if needed: `BIDONDENT_LOCAL_SUPABASE_URL=http://127.0.0.1:54321 npm run dev:local-browser`.

### 5) First login

Regular user:

- Sign up with any email
- Choose account type: Customer, Shop, or Insurer
- Complete account setup

If "Sign up with Google" does nothing, see Part 2 below.

### Data persistence notes

- Supabase stores profiles, vehicles, reports, and photo URLs.
- Website memory for the new map and account-aware search experience syncs through Supabase edge routes and `website_preferences` / `website_relationships`.
- localStorage is used as a per-user cache for speed.
- Report drafts are local-only and do not sync across devices.

### Common issues

- Missing keys: verify `.env` has `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` set.
- Local browser audit can't reach Supabase: confirm `supabase start` is running and `npm run dev:local-browser` printed the local API URL on startup. The dev-server CSP allows local Supabase on `127.0.0.1:54321` / `localhost:54321` only — if you point `BIDONDENT_LOCAL_SUPABASE_URL` at a different host or port, extend the CSP `connect-src` in `vite.config.ts` (dev block only).
- Auth UI not loading: verify Clerk key starts with `pk_`.
- Database errors: confirm migrations ran in order.
- Photos not uploading: confirm the canonical media buckets exist and the `server` edge function is deployed.
- Photos uploaded but not rendering after a day: storage pointer pattern issue. See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §16 — DB should hold `storage://…` pointers, never raw signed URLs.
- Signed-in users see empty dashboards / 401s on every API call: gateway `verify_jwt` was flipped back to `true`. See [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) §17 to fix.

---

## Part 2 — Google OAuth provider setup (Clerk)

If "Sign up with Google" doesn't work, Google OAuth has not been configured in your Clerk dashboard yet. This is a one-time setup step per Clerk environment.

**Parallel security-track note:** if auth/security passes update Clerk or provider boundaries, update this guide additively and keep [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) synchronized in the same documentation pass.

### Step 1 — Open Clerk Dashboard

1. Visit https://dashboard.clerk.com
2. Select your application (e.g. `joint-oarfish-23`)
3. Click **SSO Connections** or **Social Connections** in the sidebar

### Step 2 — Enable the Google provider

1. Find **Google** in the list of providers
2. Click **Configure** or toggle it ON
3. Clerk will provide:
   - A **Redirect URI** (needed for Google Console)
   - Instructions for obtaining Google OAuth credentials

### Step 3 — Create Google OAuth credentials

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted:
   - User type: **External**
   - App name: **Bidondent**
   - Support email: your email
   - Add authorized domain (your Clerk domain)
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Bidondent — Clerk**
   - Authorized JavaScript origins: add your Clerk domain
   - Authorized redirect URIs: paste the redirect URI from Clerk dashboard
7. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

### Step 4 — Add credentials to Clerk

1. Return to Clerk Dashboard → Google configuration
2. Paste the Client ID
3. Paste the Client Secret
4. Click **Save**

### Step 5 — Test Google Sign-In

1. Hard refresh the BidOnDent app (`Ctrl+Shift+R` / `Cmd+Shift+R`)
2. Click **Get Started**
3. Select an account type (Customer / Shop / Insurer)
4. Click **Sign up as…**
5. In Clerk's modal, click **Continue with Google**
6. You should be redirected to Google's authentication page

### Verification checklist

- [ ] Google button appears in Clerk's sign-in modal
- [ ] Clicking Google opens Google's authentication page
- [ ] After Google auth, you return to BidOnDent
- [ ] Account type is set correctly
- [ ] You're redirected to the appropriate dashboard

### Troubleshooting

- **"Error 400: redirect_uri_mismatch"** — make sure the redirect URI in Google Console exactly matches the one provided by Clerk.
- **"Access blocked: Authorization Error"** — your app needs to be verified by Google or you need to add test users in the OAuth consent screen.
- **Google button doesn't appear** — confirm Google is enabled in Clerk Dashboard, hard refresh the browser, check browser console for errors.
- **"The OAuth client was not found"** — double-check that you entered the correct Client ID and Client Secret in Clerk.

### Additional resources

- Clerk Google OAuth docs: https://clerk.com/docs/authentication/social-connections/google
- Google OAuth setup: https://support.google.com/cloud/answer/6158849
- Clerk Dashboard: https://dashboard.clerk.com

---

## Cross-references

- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — current execution authority
- [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — current architecture truth
- [`SUPABASE_SETUP_GUIDE.md`](SUPABASE_SETUP_GUIDE.md) — Supabase platform contract (storage pointer pattern §16, `verify_jwt: false` §17)
- [`README.md`](README.md) — docs operating index
- [`../README.md`](../README.md) — repo root overview
