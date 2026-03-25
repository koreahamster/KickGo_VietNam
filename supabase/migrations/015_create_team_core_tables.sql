-- File: 015_create_team_core_tables.sql
-- Purpose: Introduce the minimum Phase 3 team core tables required for create-team and my-team flows.
-- Execution Order: 15
-- Notes:
--   - Keeps team invites, announcements, fee records, and recruitment tables for later migrations.
--   - Starts with teams and team_members only.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  emblem_url text,
  country_code text not null default 'VN',
  province_code text not null,
  district_code text not null,
  description text,
  visibility text not null default 'public' check (visibility in ('public', 'members_only', 'private')),
  is_recruiting boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_teams_region
  on public.teams(country_code, province_code, district_code);

create index if not exists idx_teams_visibility
  on public.teams(visibility);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'captain', 'player')),
  squad_number integer,
  status text not null default 'active' check (status in ('pending', 'active', 'left', 'banned')),
  kicked_by uuid references public.profiles(id) on delete set null,
  kicked_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_members_team_user_unique unique (team_id, user_id)
);

create index if not exists idx_team_members_team_id
  on public.team_members(team_id);

create index if not exists idx_team_members_user_id
  on public.team_members(user_id);

create index if not exists idx_team_members_status
  on public.team_members(status);