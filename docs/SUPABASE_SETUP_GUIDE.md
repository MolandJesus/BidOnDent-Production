# 🗄️ Supabase Setup Guide - Data Storage Only

**Important**: BidOnDent uses **Clerk for authentication** and **Supabase for data storage**. This guide covers Supabase database and storage setup only.

---

## 🎯 What Supabase Handles

✅ **Data Storage**:
- User profiles (optional sync from Clerk)
- Vehicles
- Damage reports
- Bids
- Images (profile, vehicle, damage photos)

❌ **NOT Handled by Supabase**:
- User authentication (handled by Clerk)
- Sign up/login flows (handled by Clerk)
- User sessions (handled by Clerk)
- Password management (handled by Clerk)

---

## 📋 Setup Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose organization
4. Fill in project details:
   - **Name**: `bidondent` (or your preference)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to your users
5. Click **Create new project**
6. Wait for project to initialize (~2 minutes)

---

### Step 2: Get Project Credentials

1. In Supabase Dashboard, go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:

   - Project URL (for `projectId`)
   - Anon key (for `publicAnonKey`)
   - Service role key (for Edge Function secrets)

4. Update `projectId` and `publicAnonKey` in `utils/supabase/info.tsx`

---

### Step 3: Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in left sidebar
2. Click **New Query**
3. Follow the migration order in `/supabase/migrations/README.md`
4. Paste each migration into SQL Editor and run in order
5. ✅ Expected: `Success. No rows returned`

**This creates**:
- `profiles` table (optional Clerk sync)
- `vehicles` table
- `damage_reports` table
- `bids` table
- Row Level Security (RLS) policies
- Indexes for performance
- Storage buckets (if you run the storage migration)

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

---

### Step 4: Create Storage Buckets

Storage buckets hold uploaded images. Create three buckets:

#### 1. Profile Images Bucket

1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Fill in:
   - **Name**: `bidondent-profiles`
   - **Public bucket**: ❌ **OFF** (private)
   - **File size limit**: `10485760` (10 MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/heic`
4. Click **Create bucket**

#### 2. Vehicle Images Bucket

Repeat above with:
- **Name**: `bidondent-vehicles`
- Same settings as profile bucket

#### 3. Damage Photos Bucket

Repeat above with:
- **Name**: `bidondent-damage-photos`
- Same settings as profile bucket

---

### Step 5: Configure Storage Policies (Optional)

For enhanced security, add storage policies:

1. Go to **Storage** → Select bucket
2. Click **Policies** tab
3. Click **New policy**
4. Add these policies:

**Upload Policy**:
```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bidondent-profiles' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
```

**Select Policy**:
```sql
-- Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bidondent-profiles' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);
```

**Note**: Adjust bucket name for each bucket (`bidondent-profiles`, `bidondent-vehicles`, `bidondent-damage-photos`)

---

### Step 6: Deploy Edge Function (Optional)

Edge Functions handle server-side operations like photo uploads.

#### Via Supabase CLI:

```bash
# Navigate to project root
cd /path/to/bidondent

# Deploy the server function
supabase functions deploy make-server-9f243523 --project-ref your-project-id
```

#### Via Supabase Dashboard:

1. Go to **Edge Functions** in left sidebar
2. Click **Deploy new function**
3. Name: `make-server-9f243523`
4. Copy contents of `/supabase/functions/server/index.tsx`
5. Click **Deploy**

---

### Step 7: Set Environment Variables for Edge Function

1. Go to **Edge Functions** → **Settings**
2. Add these secrets:

   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save changes

---

## ✅ Verification Checklist

After setup, verify everything works:

### Database
- [ ] Run `SELECT * FROM profiles LIMIT 1;` in SQL Editor (should succeed)
- [ ] Check that all tables exist in **Table Editor**
- [ ] Verify RLS policies are enabled on tables

### Storage
- [ ] Three buckets exist: `bidondent-profiles`, `bidondent-vehicles`, `bidondent-damage-photos`
- [ ] All buckets are **private** (not public)
- [ ] File size limits are set to 10MB

### Edge Function
- [ ] Function appears in Edge Functions list
- [ ] Function shows "deployed" status
- [ ] Environment variables are set

### Application
- [ ] App connects to Supabase (check browser console for errors)
- [ ] Can create user profile
- [ ] Can upload images
- [ ] Images display correctly

---

## 🔍 Testing the Setup

### Test Database Connection

Run this in your app's browser console:

```javascript
// Verify the Supabase project ID is set in utils/supabase/info.tsx
console.log("Supabase project configured");

// This should log without errors
window.checkBidondentSession();
```

### Test Image Upload

1. Log in to the app
2. Go to **Account** page
3. Click profile image placeholder
4. Select and upload an image
5. **Expected**: Image uploads and displays

### Test Data Operations

1. Add a new vehicle
2. Refresh the page
3. **Expected**: Vehicle still exists
4. Check Supabase Dashboard → **Table Editor** → `vehicles`
5. **Expected**: Vehicle row exists

---

## 🚨 Common Issues

### "relation 'profiles' does not exist"
**Fix**: Run Step 3 database migrations

### "bucket 'bidondent-profiles' does not exist"
**Fix**: Run Step 4 to create storage buckets

### "Invalid API key"
**Fix**: Double-check `publicAnonKey` in `utils/supabase/info.tsx`

### Photos upload but don't display
**Fix**: 
1. Check storage bucket is created
2. Verify bucket names match in code
3. Check browser console for CORS errors

### "Failed to fetch" errors
**Fix**: 
1. Verify Supabase project is not paused
2. Check project URL is correct
3. Ensure Edge Function is deployed

---

## 📊 Understanding the Data Flow

```
User Action (Frontend)
  ↓
Clerk Authentication (if needed)
  ↓
Supabase Service Layer (/src/app/services/supabaseService.ts, re-exporting /src/app/services/supabase/*)
  ↓
Supabase Database / Storage
  ↓
Data Returned to Frontend
  ↓
UI Updates
```

### Example: Creating a Damage Report

1. **User**: Fills out damage report form
2. **Frontend**: Compresses images
3. **Edge Function**: Uploads images to Storage
4. **Database**: Saves report data with image URLs
5. **Frontend**: Displays success message

---

## 🔐 Security Best Practices

### Row Level Security (RLS)
- ✅ Always enabled on all tables
- ✅ Users can only access their own data
- ✅ Prevents unauthorized data access

### Storage Security
- ✅ Private buckets (not public)
- ✅ Signed URLs for temporary access
- ✅ File size limits enforced

### API Keys
- ✅ `anon` key for frontend (safe to expose)
- ❌ `service_role` key only in Edge Functions (never in frontend)

---

## 🔄 Updating the Schema

When adding new features that need database changes:

1. Create new migration file:
   ```
   /supabase/migrations/00X_feature_name.sql
   ```

2. Write SQL for changes:
   ```sql
   -- Add new column
   ALTER TABLE damage_reports 
   ADD COLUMN estimated_cost DECIMAL(10,2);
   ```

3. Run migration:
   - Dashboard: Copy/paste into SQL Editor
   - CLI: `supabase db push`

4. Update TypeScript types in `/src/app/services/supabase/types.ts`

---

## 📈 Monitoring & Maintenance

### Check Database Size
1. Go to **Database** → **Usage**
2. Monitor:
   - Database size
   - Monthly active users
   - API requests

### Check Storage Usage
1. Go to **Storage** → **Usage**
2. Monitor:
   - Total storage used
   - Number of files
   - Bandwidth usage

### Free Tier Limits
- **Database**: 500 MB
- **Storage**: 1 GB
- **Edge Function**: 500K invocations/month
- **Bandwidth**: 5 GB/month

**Tip**: Use the StorageMonitor component to track usage in real-time.

---

## 🆘 Need Help?

### Supabase Resources
- [Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

### BidOnDent Resources
- [Getting Started](./GETTING_STARTED.md)
- [Documentation Index](./README.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)

---

## 🎓 Next Steps

After completing Supabase setup:

1. **Configure Google OAuth** → [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
2. **Review Current Docs** → [README.md](./README.md)
3. **Return to Getting Started** → [GETTING_STARTED.md](./GETTING_STARTED.md)
4. **Review Main Documentation** → [README.md](./README.md)

---

**Last Updated**: February 8, 2026  
**Supabase Version**: Compatible with latest (v2.x)
