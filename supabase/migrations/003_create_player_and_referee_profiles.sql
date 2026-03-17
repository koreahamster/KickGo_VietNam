-- File: 003_create_player_and_referee_profiles.sql
-- Purpose: Split player and referee detail data from common profiles.
-- Execution Order: 3
-- Notes:
--   - Player fields remain nullable during the transition.
--   - skill_tier and reputation_score are system-managed fields.
--   - Role existence is enforced later by server validation or triggers, not by FK in this migration.

create table if not exists public.player_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferred_position text,
  preferred_foot text,
  dominant_foot text,
  top_size text,
  shoe_size text,
  skill_tier integer not null default 0,
  reputation_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referee_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.player_profiles is 'Player-specific profile details separated from public.profiles.';
comment on column public.player_profiles.skill_tier is 'System-managed field. Must not be client writable.';
comment on column public.player_profiles.reputation_score is 'System-managed field. Must not be client writable.';
comment on table public.referee_profiles is 'Minimal MVP referee profile record.';
