# 🚀 Quick Start Guide

Get BidOnDent running in **5 minutes**.

---

## Prerequisites

- Node.js 18+ installed
- Clerk account ([clerk.com](https://clerk.com))
- Supabase account ([supabase.com](https://supabase.com))

---

## Setup Steps

### 1️⃣ Install Dependencies (1 minute)

```bash
npm install
```

### 2️⃣ Configure Keys (2 minutes)

Update the key files in the repo:

- `utils/clerk/info.tsx` → set `clerkPublishableKey`
- `utils/supabase/info.tsx` → set `projectId` and `publicAnonKey`

**Where to find these:**
- **Clerk**: Dashboard → Your App → API Keys
- **Supabase**: Project Settings → API → Project URL & anon key

`.env.example` is included as a reference if you want to wire keys to Vite env later.

### 3️⃣ Setup Database (2 minutes)

In Supabase Dashboard:

1. Go to **SQL Editor**
2. Click **New query**
3. Copy and paste from `/supabase/migrations/001_initial_schema.sql`
4. Click **Run**

This creates:
- `profiles` table
- `vehicles` table  
- `damage_reports` table
- `bids` table

### 4️⃣ Start Development Server

```bash
npm run dev
```

App opens at: `http://localhost:5173`

---

## First Login

### As Admin

1. Click **"Get Started Now"**
2. Sign up with: `bidondent@gmail.com`
3. Choose any account type (auto-promoted to admin)
4. Complete profile setup
5. Access admin dashboard

**Admin privileges:**
- Storage Inspector (`Ctrl+Shift+S`)
- User Management
- System Monitoring
- Demo Mode Controls

### As Regular User

1. Click **"Get Started Now"**
2. Sign up with any email
3. Choose account type:
   - **Customer** - Report damage, get bids
   - **Shop** - View requests, submit bids
   - **Insurer** - Manage claims, partner shops
4. Complete profile setup
5. Access personalized dashboard

---

## Testing Demo Mode

1. **Sign in** to any account
2. Click **profile dropdown** (top right)
3. Select **"Switch Demo Account"**
4. Choose account type to demo
5. Explore full functionality with demo data
6. Click **"Exit Demo Mode"** to return

Demo Mode Features:
- No signup required
- Full functionality
- Persistent demo data
- Dynamic navigation
- Visual banner

---

## Browser Console Tools

Press `F12` to open console, then use:

```javascript
// Check authentication status
window.checkBidondentSession()

// Clear all session data
window.clearBidondentSession()

// Open Storage Inspector (Admin only)
// Or press: Ctrl+Shift+S
```

---

## Troubleshooting

### "Environment variables not found"
→ Make sure `utils/clerk/info.tsx` and `utils/supabase/info.tsx` contain valid keys

### Clerk sign-up form not appearing
→ Check `clerkPublishableKey` is correct and starts with `pk_`

### Database errors on first use
→ Run the SQL migrations in Supabase (Step 3)

### Photos not uploading
→ Ensure Supabase storage buckets exist (auto-created on first upload)

### "Invalid token" or auth errors
→ Clear browser cache and run `window.clearBidondentSession()`

---

## Next Steps

After quick start:

1. **Read Project Status** → [PROJECT_STATUS.md](./PROJECT_STATUS.md)
2. **Complete Setup** → [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
3. **Add Google OAuth** → [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
4. **Explore Features** → Check out the README.md

---

## Success Checklist

Verify everything works:

- [ ] App loads at localhost:5173
- [ ] Landing page displays correctly
- [ ] Can sign up with new account
- [ ] Account type selection works
- [ ] Dashboard loads after setup
- [ ] Profile dropdown shows user info
- [ ] Demo mode switch works
- [ ] Photos upload successfully
- [ ] No console errors
- [ ] Page refresh maintains session

**All checked?** → You're ready to develop! 🎉

---

## Getting Help

- **Setup Issues**: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- **Project Status**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **OAuth Setup**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

---

**Ready to build?** Let's go! 🚀