# BidOnDent

> **Map-first auto repair bidding marketplace** connecting customers, body shops, and insurers.

[![CI](https://github.com/MolandJesus/BidOnDent-Production/actions/workflows/ci.yml/badge.svg)](https://github.com/MolandJesus/BidOnDent-Production/actions/workflows/ci.yml)

---

## Overview

BidOnDent is a web-based platform that creates a transparent, competitive bidding environment for auto repair. Customers submit damage reports, shops compete with real-time bids, and insurers manage claims — all through a map-driven interface.

### Core Loop

```
Report damage → See shops on map → Receive bids → Accept best offer → Track repair
```

### Three Account Types

| Role         | Key Actions                                               |
| ------------ | --------------------------------------------------------- |
| **Customer** | Report damage, compare bids, accept quotes, track repairs |
| **Shop**     | View requests, submit bids, manage active jobs            |
| **Insurer**  | Create claims, manage partner shops, approve bids         |

---

## Tech Stack

| Layer        | Technology                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| **Frontend** | React 18, TypeScript, Tailwind CSS v4, Vite 6                                 |
| **Auth**     | Clerk (Google OAuth, email/password)                                          |
| **Backend**  | Supabase (PostgreSQL, Edge Functions via Deno, Storage)                       |
| **Maps**     | MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (WebGL — Leaflet removed Pass 448) |
| **Testing**  | Vitest (543+/555 passing), GitHub Actions CI                                  |
| **Design**   | Liquid glass system — dark navy base, royal blue accents                      |

---

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm 10+
- Clerk account with publishable key
- Supabase project with anon key

### Install and Run

```bash
# Clone
git clone https://github.com/MolandJesus/BidOnDent-Production.git
cd BidOnDent-Production

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in your Clerk and Supabase keys

# Start development server
npm run dev
```

### Configuration

All keys are configured via `.env` (copy `.env.example` to `.env`):

| Variable                     | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk Dashboard → API Keys) |
| `VITE_SUPABASE_URL`          | Supabase project URL (from Project Settings → API)      |
| `VITE_SUPABASE_ANON_KEY`     | Supabase anon/public key (from Project Settings → API)  |
| `VITE_SENTRY_DSN`            | Sentry DSN for error tracking (optional)                |

For detailed setup, see [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) and [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md).

---

## Project Structure

```
src/
  main.tsx                          # App entry point
  app/
    App.tsx                         # Root component
    components/
      codelayer/                    # Dashboard screens (Home, Report, Account)
      dashboard/                    # Map widgets (Customer, Shop, Insurer)
      landing/                      # Landing page sections
      shop/                         # Shop directory + map experience
      insurer/                      # Insurer claim screens
      auth/                         # Auth flows
      app/                          # Shell (DashboardLayout, header, sidebar)
    routers/                        # DashboardRouter — all view routing
    services/                       # Business logic + Supabase clients
      auth/                         # Identity, session, relationships
      intelligence/                 # Map data, routing, recommendations
      supabase/                     # DB runtime client
      networkProfiles.ts            # Directory inventory
    hooks/                          # State orchestration
    types/                          # Shared type definitions
  styles/                           # CSS (Tailwind, glass tokens, animations)
  assets/                           # Images

supabase/
  functions/server/                 # Edge functions (Deno.serve router, ~50 routes)
  migrations/                       # PostgreSQL schema migrations

docs/                               # Project documentation
```

---

## Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test

# Format code
npm run format

# Spell check
npx cspell lint "src/**/*.{ts,tsx}" --no-progress
```

### Build Stats (verified 2026-04-16)

- **Build time:** ~3.4s
- **Bundle size:** vendor-split — index chunk ~230 KB, map vendor chunk ~1070 KB (MapLibre + tile styles), other vendor chunks each under 200 KB
- **Tests:** 555/557 passing (2 pre-existing network-mock edge cases in `bids.test.ts` — not blocking)
- **Build errors:** 0

---

## Architecture

### Design System

BidOnDent uses a **liquid glass** design system with dark navy surfaces and royal blue accents:

- `bd-glass-panel` — primary container surfaces
- `bd-glass-card` — content cards with translucent depth
- `bd-glass-floating` — elevated controls and overlays
- `bd-glass-badge` — status indicators
- `bd-glass-control` — interactive elements

### Data Flow

```
Clerk (identity) → Supabase (persistence) → Services → Hooks → Components
```

- **Supabase** is the source of truth for profiles, vehicles, reports, bids, and photos.
- **localStorage** is cache-only, scoped per user.
- **Edge Functions** handle server-side operations with CORS and auth validation.

### Map System

The map is the primary product surface — not a supporting component.

- **ShopDirectoryScreen** — full map-first shop discovery experience
- **CustomerMapWidget / ShopMapWidget / InsurerMapWidget** — dashboard map widgets
- **ServiceCoverageMap** — landing page map
- MapLibre GL JS WebGL engine with CARTO/Esri tile layers, real shop + report markers, OSRM routing, Nominatim search, Web Speech turn-by-turn voice navigation

---

## Demo Mode

Experience all three account types without creating additional accounts:

1. Sign in with any account
2. Click profile dropdown → **Switch Demo Account**
3. Choose: Customer, Shop, or Insurer
4. Explore with pre-populated demo data
5. Exit anytime to return to your real account

---

## Branches

| Branch                   | Purpose                              |
| ------------------------ | ------------------------------------ |
| `main`                   | Production — auto-deploys via Vercel |
| `BidOnDent-Horizon-Beta` | Active development                   |

Archived branches (`archive/*`) are preserved for history but inactive.

---

## Documentation

**Current phase:** Soft Launch Hardening. Docs follow a **LAW > REFERENCE > PLAN** authority model. LAW docs govern all work.

| Document | Purpose |
|---|---|
| [**LAW: Project Rules**](docs/LAW_PROJECT_RULES.md) | Permanent behavioral rules, product definition, 6 laws |
| [**LAW: Hardening Plan**](docs/LAW_HARDENING_PLAN.md) | Execution authority. Launch Scope Guardrails, phased Execution Plan, Execution Discipline |
| [**REF: System State**](docs/REF_SYSTEM_STATE.md) | Current architecture truth. Auth flow, state ownership, role reality, known bottlenecks |
| [**REF: Known Issues**](docs/REF_KNOWN_ISSUES.md) | Living inventory of bugs, gaps, and structural issues |
| [Docs Operating Index](docs/README.md) | Full navigation of active docs + archive pointers |
| [Post-Launch Roadmap](docs/BIDONDENT_POST_LAUNCH_ROADMAP_2026-04-14.md) | Deferred work with priority bands + triggers |
| [Getting Started](docs/GETTING_STARTED.md) | Local setup guide |
| [Supabase Setup](docs/SUPABASE_SETUP_GUIDE.md) | Database + edge function reference |

---

## License

Proprietary — all rights reserved.

---

## Credits

See [docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md) for third-party licenses and credits.
