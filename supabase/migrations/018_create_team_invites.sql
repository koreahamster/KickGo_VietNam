-- File: 018_create_team_invites.sql
-- Purpose: Add the minimum invite-code table required for team join flows.
-- Execution Order: 18
-- Notes:
--   - Invite rows are treated as single-use in the current phase.
--   - Public/REST access remains closed; writes go through Edge Functions.

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invite_code text not null unique,
  invite_type text not null default 'code' check (invite_type in ('link', 'code')),
  expires_at timestamptz,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_team_invites_team_id
  on public.team_invites(team_id);

create index if not exists idx_team_invites_invited_by
  on public.team_invites(invited_by);

create index if not exists idx_team_invites_expires_at
  on public.team_invites(expires_at);
