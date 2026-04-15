# Bidondent Database Migrations

This directory contains SQL migration files to set up the Bidondent database schema in Supabase.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order. Recommended order:
    - `001_initial_schema.sql`
    - `004_fix_profiles_recursion.sql`
    - `20231223000001_create_storage_buckets.sql`
5. If you are applying the legacy files instead, run in this order:
    - `001_create_profiles_table.sql`
    - `002_create_vehicles_table.sql`
    - `003_create_damage_reports_table.sql`
6. Click **Run** for each migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# From your project root
supabase db push
```

## Migration Files

### 001_initial_schema.sql
Creates the baseline tables and policies for profiles, vehicles, damage reports, and bids.

### 001_create_profiles_table.sql
Creates the `profiles` table to store user account information including:
- User ID (linked to auth.users)
- Email, name, phone
- Profile image URL
- Account type (customer, shop, insurer)
- Timestamps

Includes Row Level Security policies so users can read all profiles but only modify their own.

### 002_create_vehicles_table.sql
Creates the `vehicles` table to store user vehicles including:
- User ID (linked to auth.users)
- Make, model, year
- Color, license plate, VIN
- Vehicle image URL
- Timestamps

Includes Row Level Security policies so users can only access their own vehicles.

### 003_create_damage_reports_table.sql
Creates the `damage_reports` table to store damage reports including:
- User ID (linked to auth.users)
- Vehicle information
- Damage details (type, severity, location, description)
- Location information (address, city, state, zip)
- Photo URLs (array)
- Insurance information
- Status tracking
- Timestamps

Includes Row Level Security policies so:
- Users can access their own damage reports
- Shops and insurers can view all damage reports
- Users can only modify their own reports

### 004_fix_profiles_recursion.sql
Fixes a recursion issue in profile policies.

### 20231223000001_create_storage_buckets.sql
Creates the required Supabase Storage buckets for profile, vehicle, and damage photos.

## Database Schema Overview

```
auth.users (Supabase Auth)
    ↓
profiles (user account info)
    ↓
vehicles (user vehicles)
    ↓
damage_reports (damage reports linked to vehicles)
```

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Read all, modify own
- **Vehicles**: Full CRUD for own vehicles only
- **Damage Reports**: 
  - Customers: Full CRUD for own reports
  - Shops/Insurers: Read all reports (for bidding/claims)

## Notes

- All tables use UUID for primary keys
- Foreign keys use CASCADE delete for automatic cleanup
- Timestamps are automatically managed with triggers
- Photo URLs are stored as TEXT arrays for damage_reports
