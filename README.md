# 🚗 BidOnDent - Auto Repair Bidding Platform

**An intelligent platform connecting customers needing car repairs with local auto body shops and insurance companies.**

---

## 📖 What is BidOnDent?

BidOnDent is a comprehensive web-based marketplace that revolutionizes the auto repair industry by creating a transparent, competitive bidding environment. The platform connects three distinct user groups—car owners needing repairs, auto body shops seeking business, and insurance companies managing claims—in a seamless, efficient ecosystem.

### 🎯 The Problem We Solve

**For Customers:**

- 🤷 Difficulty finding trustworthy repair shops
- 💰 Uncertainty about fair pricing
- 📱 Time-consuming process of calling multiple shops
- 📋 No centralized way to track repair quotes

**For Auto Body Shops:**

- 📉 Inconsistent lead generation
- 🎯 Difficulty reaching customers actively seeking repairs
- 💼 Manual quote management processes
- 🤝 Limited visibility to potential customers

**For Insurance Companies:**

- 🏢 Challenges maintaining preferred shop networks
- 📊 Inefficient claim processing workflows
- 🔍 Difficulty tracking repair progress
- 🤝 Complex partner management

### 💡 The BidOnDent Solution

BidOnDent creates a streamlined digital marketplace where:

1. **Customers** submit damage reports with photos in minutes
2. **Shops** receive notifications and submit competitive bids instantly
3. **Insurers** manage claims and partner networks efficiently
4. Everyone benefits from **transparency**, **speed**, and **competitive pricing**

---

## 🌟 Key Features at a Glance

### Latest UI Updates (February 2026)

- Modernized dashboard layout with tighter spacing and improved visual hierarchy
- Redesigned bids experience with richer comparison cards and smoother animations
- Refined 5-step report flow styling and progress behavior
- Updated account screen to match the newer dashboard design system
- Improved sidebar/top-right profile menu behavior and demo mode placement
- Landing page CTA and logo treatment polished for a more app-like feel

### For Customers 👤

**Damage Reporting Made Easy:**

- **5-step guided workflow** - No confusion, just follow the steps
- **Photo documentation** - Camera capture or file upload
- **Vehicle management** - Store multiple vehicles for quick selection
- **Instant bid comparison** - View all quotes side-by-side
- **Shop discovery** - Browse local shops, save favorites
- **Repair tracking** - Monitor status from quote to completion

**User Experience Highlights:**

- Auto-save drafts (never lose your progress)
- Mobile-optimized camera capture
- Visual progress indicators
- One-click bid acceptance
- Complete repair history

### For Auto Body Shops 🏪

**Efficient Lead Management:**

- **Real-time request notifications** - Never miss an opportunity
- **Quick bid submission** - Submit quotes in minutes
- **Active job tracking** - Manage all ongoing repairs
- **Profile customization** - Showcase specialties and certifications
- **Service area definition** - Target your ideal customers

**Business Tools:**

- Live notification system (<500ms latency)
- Visual indicators for new requests
- Professional shop profile pages
- Competitive bidding analytics
- Customer communication tools

### For Insurance Companies 🛡️

**Streamlined Claim Management:**

- **Partner shop network** - Add and manage preferred shops
- **Claim creation workflow** - Digital claim filing
- **Bid approval system** - Review and approve shop quotes
- **Claims tracking** - Monitor all active claims
- **Analytics dashboard** - Insights on costs and partnerships

**Network Management:**

- Browse and recruit new partner shops
- Track partnership performance
- Manage claim assignments
- Monitor repair quality and costs

---

## 🧭 Developer Quick Map

**Project structure (most-used paths):**

- `src/main.tsx` - App entry
- `src/app/App.tsx` - Root app component
- `src/app/components/` - Feature-based UI components
- `src/app/components/admin/` - Admin tools
- `src/app/components/auth/` - Auth flows and Clerk helpers
- `src/app/components/demo/` - Demo mode UI
- `src/app/components/devtools/` - Debug and storage tools
- `src/app/components/insurer/` - Insurer screens
- `src/app/components/landing/` - Landing page sections
- `src/app/components/reports/` - Reports list/detail screens
- `src/app/components/shop/` - Shop screens
- `src/app/components/codelayer/` - Legacy screens used by the dashboard router
- `src/app/routers/` - Screen routing and view composition
- `src/app/services/` - Supabase/Clerk and business logic
- `src/app/hooks/` - Shared app effects/handlers and state hooks
- `src/assets/` - Images used by UI components

**Configuration keys:**

- Update `clerkPublishableKey` in `utils/clerk/info.tsx`.
- Update `projectId` and `publicAnonKey` in `utils/supabase/info.tsx`.
- `.env.example` is included as a reference if you prefer wiring keys to Vite env later.

**Data persistence:**

- Supabase is the source of truth for profiles, vehicles, reports, and photo URLs.
- localStorage is cache-only and scoped per user for faster initial loads.
- Report drafts are stored locally and do not sync across devices.

---

## 🔐 Account System & Demo Mode

### Three Account Types

**1. Customer Account**

```
Sign Up → Select "I need repairs" → Access Customer Dashboard
- Report damage
- Manage vehicles
- View and compare bids
- Track repair status
- Browse shop directory
```

**2. Shop Account**

```
Sign Up → Select "I'm a repair shop" → Access Shop Dashboard
- View repair requests
- Submit competitive bids
- Manage active jobs
- Update shop profile
- Real-time notifications
```

**3. Insurer Account**

```
Sign Up → Select "I'm an insurer" → Access Insurer Dashboard
- Manage partner shops
- Create insurance claims
- Approve bids
- Track claim progress
- View analytics
```

### 🎨 Innovative Demo Mode

**Experience all account types without multiple signups:**

One of BidOnDent's unique features is **Demo Mode**, allowing users to instantly switch between all three account types to explore the full platform:

1. **Sign in with any account**
2. **Click profile dropdown** → "Switch Demo Account"
3. **Choose demo type:** Customer, Shop, or Insurer
4. **Explore with demo data** - Full functionality, realistic scenarios
5. **Exit anytime** - Return to your real account with one click

**Benefits:**

- ✨ **No additional signups** - One account explores everything
- 🔄 **Instant switching** - Change account types in real-time
- 📊 **Realistic demo data** - Pre-populated scenarios
- 🎯 **Full functionality** - All features available in demo mode
- 🔒 **Isolated data** - Demo actions don't affect real data
- 👁️ **Visual indicator** - Clear banner shows demo mode is active

**Perfect for:**

- Prospective users evaluating the platform
- Stakeholders understanding all perspectives
- Demonstrations and presentations
- Training and onboarding

---

## 🚀 Complete User Journey Examples

### Customer Journey: Reporting Damage

**Step 1: Create Account**

```
Landing Page → "Get Started Now" → Sign Up with Google/Email
→ Choose "I need repairs" → Enter name & phone → Dashboard
```

**Step 2: Add Vehicle (Optional)**

```
Dashboard → Vehicles Tab → "Add Vehicle"
→ Enter: Make, Model, Year, License Plate → Upload photo → Save
```

**Step 3: Report Damage**

```
Dashboard → Home Tab → "Report Damage" → 5-Step Flow:

1. Location: Enter repair location, set urgency
2. Vehicle: Select from saved vehicles (or enter new one)
3. Photos: Upload damage photos (tap for camera or select files)
4. Description: Describe damage, add notes
5. Review: Confirm all details → Submit
```

**Step 4: Receive & Compare Bids**

```
Dashboard → Reports Tab → Select damage report
→ View all shop bids side-by-side
→ Compare: Price, Timeline, Shop Rating, Location
→ Accept preferred bid → Confirm repair
```

**Step 5: Track Repair**

```
Dashboard → Reports Tab → "In Progress" status
→ View shop details, contact info, updates
→ Upon completion → Rate shop, leave review
```

### Shop Journey: Winning a Bid

**Step 1: Create Shop Account**

```
Landing Page → "Get Started Now" → Sign Up
→ Choose "I'm a repair shop" → Setup profile
→ Add: Shop name, certifications, service area, specialties
```

**Step 2: Receive Notification**

```
🔔 Real-time notification: "New repair request in your area"
→ Click notification → View damage report
→ See: Photos, description, vehicle info, customer location
```

**Step 3: Submit Bid**

```
Repair Request Detail → "Submit Bid" button
→ Enter: Quote amount, estimated timeline, notes
→ Add: Warranty details, special offers
→ Submit bid
```

**Step 4: Win the Job**

```
🎉 Notification: "Your bid was accepted!"
→ Dashboard → Active Jobs Tab → New job appears
→ View: Customer contact info, vehicle details, agreed price
→ Begin repair work
```

**Step 5: Complete & Get Paid**

```
Active Jobs → Select job → "Mark Complete"
→ Upload completion photos
→ Customer receives notification → Reviews work
→ Payment processed (future feature)
```

### Insurer Journey: Managing Claims

**Step 1: Create Insurer Account**

```
Landing Page → Sign Up → Choose "I'm an insurer"
→ Setup: Company name, contact details
```

**Step 2: Build Partner Network**

```
Dashboard → Partner Shops Tab → "Browse Shops"
→ Filter: Location, certifications, ratings
→ Add partners to network
```

**Step 3: Create Insurance Claim**

```
Dashboard → Claims Tab → "New Claim"
→ Enter: Policy number, customer info, incident details
→ Upload: Police report, initial photos
→ Submit to partner shops
```

**Step 4: Review Bids & Approve**

```
Claims Tab → Select claim → View shop bids
→ Compare: Estimates, shop credentials, timeline
→ Approve preferred bid
→ Notify customer and shop
```

**Step 5: Track to Completion**

```
Claims Tab → "In Progress" claims
→ Monitor: Status updates, milestones, costs
→ Upon completion → Review, close claim, update records
```

---

## 🎯 Getting Started

Use the setup guide for a clean, step-by-step local install:

- [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)

---

## 🏗️ Architecture Overview

### Authentication & User Management

- **Clerk** - Complete authentication system (sign up, login, OAuth)
- User profiles stored in Clerk metadata (name, phone, account type)

### Data Storage

- **Supabase** - PostgreSQL database for application data
  - Vehicles
  - Damage reports
  - Bids
  - Profile sync (optional)
- **Supabase Storage** - Image storage with aggressive compression
  - Profile images
  - Vehicle photos
  - Damage report photos

### Key Features

- **Multi-User System**: 3 account types (Customer, Shop, Insurer)
- **Demo Mode**: Switch between account types without creating new accounts
- **5-Step Damage Reporting**: Guided flow with photo uploads
- **Bid Comparison System**: Compare quotes from multiple shops
- **Responsive Design**: Mobile-first with bottom navigation tabs
- **Real-Time Updates**: Live bid notifications
- **Storage Management**: Built-in monitoring for free tier optimization

---

## 📁 Project Structure

```
bidondent/
├── src/app/
│   ├── App.tsx                    # Main application component
│   ├── components/                # React components
│   │   ├── landing/              # Landing page sections
│   │   ├── dashboard/            # Dashboard components
│   │   ├── ClerkAccountTypeSelector.tsx
│   │   ├── DemoModeBanner.tsx
│   │   ├── StorageMonitor.tsx
│   │   └── ...
│   ├── services/                  # Business logic services
│   │   ├── clerkService.ts       # Clerk auth utilities
│   │   ├── supabase/             # Modular Supabase services
│   │   ├── supabaseService.ts    # Supabase re-exports
│   │   ├── demoAuthService.ts    # Demo mode management
│   │   └── storageMonitor.ts     # Storage tracking
│   ├── hooks/                     # Custom React hooks
│   │   ├── useUserData.ts        # User data management
│   │   ├── useNavigation.ts      # Navigation state
│   │   ├── useAppEffects.ts      # Shared app effects
│   │   └── useAppHandlers.ts     # Shared app handlers
│   ├── config/                    # Configuration files
│   │   └── demoMode.ts           # Demo mode config
│   └── utils/                     # Utility functions
│       ├── buildDashboardRouterProps.ts # Dashboard router props builder
│       ├── imageCompression.ts   # Aggressive image compression
│       └── photoUtils.ts         # Photo handling
│
├── supabase/
│   ├── functions/server/         # Edge functions
│   │   ├── index.tsx             # Main server routes
│   │   ├── storage_init.tsx      # Storage bucket setup
│   │   └── kv_store.tsx          # Key-value storage
│   └── migrations/               # Database migrations
│       ├── 001_create_profiles_table.sql
│       ├── 002_create_vehicles_table.sql
│       └── 003_create_damage_reports_table.sql
│
├── utils/
│   ├── clerk/info.tsx            # Clerk configuration
│   └── supabase/info.tsx         # Supabase configuration
│
└── docs/                          # Documentation hub
  ├── GETTING_STARTED.md
  ├── PROJECT_STATUS.md
  ├── SUPABASE_SETUP_GUIDE.md
  ├── GOOGLE_OAUTH_SETUP.md
  └── ATTRIBUTIONS.md
```

---

## 📚 Docs Index

All documentation lives in the docs folder:

- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Local setup and first login
- **[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** - Current development status
- **[docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md)** - Database setup
- **[docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)** - Google sign-in setup
- **[docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md)** - Credits and licenses

---

## 🎨 Demo Mode

Demo Mode allows users to experience all three account types without creating multiple accounts:

### How to Use

1. **Enable**: Click your profile → "Switch Demo Account"
2. **Choose Type**: Customer, Shop, or Insurer
3. **Explore**: Full functionality with demo data
4. **Exit**: Return to your real account anytime

### Features

- Real-time account type switching
- Persistent demo data
- Dynamic navigation tabs
- No signup required
- Visual banner when active

---

## 🖼️ Image Compression Strategy

To stay within Supabase's free tier limits, we use **extremely aggressive compression**:

- **Max Dimensions**: 800px
- **Quality**: 50%
- **Target Size**: 500KB per image
- **Format**: JPEG with optimized encoding

### Storage Management

- **Built-in Monitor**: Real-time storage usage tracking
- **Automatic Cleanup**: Endpoints for removing old images
- **User Limits**: Per-user storage quotas
- **Debug Tools**: Storage monitoring utilities

---

## 🧪 Testing

### Manual Testing

```bash
npm run dev
```

**Testing Multiple Account Types**: Use Demo Mode (see above) to test Customer, Shop, and Insurer perspectives instantly.

### Browser Console Tools

```javascript
// Check current session
window.checkBidondentSession();

// Clear session data
window.clearBidondentSession();

// Use demo mode to test multiple account types
```

---

## 🚀 Deployment

### Prerequisites

- Clerk account with publishable key
- Supabase project with database and storage
- Node.js 18+ runtime

### Configuration Keys

- `utils/clerk/info.tsx` → `clerkPublishableKey`
- `utils/supabase/info.tsx` → `projectId`, `publicAnonKey`

### Build

```bash
npm run build
```

### Deploy

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend & Services

- **Clerk** - Authentication & user management
- **Supabase** - Database & storage
  - PostgreSQL database
  - Edge Functions (Deno)
  - Storage buckets
- **Hono** - Edge function router

### Libraries

- **@clerk/clerk-react** - Clerk integration
- **@supabase/supabase-js** - Supabase client
- **react-slick** - Carousels
- **sonner** - Toast notifications

---

## 📊 Current Status

✅ **Production Ready Features:**

- Clerk authentication fully integrated
- Multi-user dashboard system
- 5-step damage reporting with photo uploads
- Bid submission and comparison
- Demo mode with full account switching
- Storage monitoring and management
- Responsive mobile/desktop design
- Real-time notifications

🚧 **In Development:**

- Shop discovery and filtering
- Insurance claim integration
- Payment processing
- Advanced analytics dashboard

---

## 📄 License

[Add your license here]

---

## 🙏 Credits

See [docs/ATTRIBUTIONS.md](docs/ATTRIBUTIONS.md) for full credits and licenses.

---

## 🆘 Need Help?

- **Getting Started Issues**: See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- **Setup Problems**: Check [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md)
- **OAuth Setup**: Follow [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)
- **Current Status**: Review [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md)

---

**Built with ❤️ for seamless auto repair bidding**
