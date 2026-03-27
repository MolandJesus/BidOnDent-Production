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

| Role | Key Actions |
|------|------------|
| **Customer** | Report damage, compare bids, accept quotes, track repairs |
| **Shop** | View requests, submit bids, manage active jobs |
| **Insurer** | Create claims, manage partner shops, approve bids |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4, Vite 6 |
| **Auth** | Clerk (Google OAuth, email/password) |
| **Backend** | Supabase (PostgreSQL, Edge Functions via Hono, Storage) |
| **Maps** | Leaflet with custom glass overlays |
| **Testing** | Vitest (81 tests), GitHub Actions CI |
| **Design** | Liquid glass system — dark navy base, royal blue accents |

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

| File | Purpose |
|------|---------|
| `utils/clerk/info.tsx` | Clerk publishable key |
| `utils/supabase/info.tsx` | Supabase project URL and anon key |
| `.env` | Sentry DSN (optional) |

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
  functions/server/                 # Edge functions (11 Hono handlers)
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

### Build Stats

- **Build time:** ~2s
- **Bundle size:** ~504KB (vendor-split)
- **Tests:** 81 passing
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
- Leaflet with theme-aware glass overlays and floating intelligence panels

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

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys via Vercel |
| `BidOnDent-Horizon-Beta` | Active development |

Archived branches (`archive/*`) are preserved for history but inactive.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [AI Master Context](docs/CLAUDE_AI_MASTER_CONTEXT.md) | Single source of truth for AI agents — **start here** |
| [Product Brain](docs/BIDONDENT_PRODUCT_BRAIN.md) | Product vision, identity, roadmap |
| [Map Master Plan](docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md) | Map strategy and design law |
| [Map Tracker](docs/BIDONDENT_MAP_TRACKER_2026-03-21.md) | Execution log and validation |
| [Build Progress](docs/BIDONDENT_BUILD_PROGRESS_DASHBOARD.md) | Pass-by-pass build dashboard |
| [Getting Started](docs/GETTING_STARTED.md) | Local setup guide |
| [Supabase Setup](docs/SUPABASE_SETUP_GUIDE.md) | Database configuration |

---

## License

Proprietary — all rights reserved.

---

## Credits

See [docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md) for third-party licenses and credits.
