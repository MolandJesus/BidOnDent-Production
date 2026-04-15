-- navigation_sessions.sql
-- Supabase migration: create navigation_sessions table for cloud session sync

create table if not exists navigation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  session_id text not null,
  session_data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, session_id)
);

-- Index for fast lookup by user/session
create index if not exists idx_navigation_sessions_user_session on navigation_sessions(user_id, session_id);
