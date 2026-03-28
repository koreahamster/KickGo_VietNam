-- File: 038_create_matches.sql
-- Purpose: Harden the match core schema and policies for the team-tab calendar and attendance flow.
-- Execution Order: 38

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references public.teams(id) on delete cascade,
  away_team_id uuid references public.teams(id) on delete set null,
  scheduled_at timestamptz not null,
  venue_name text,
  sport_type text not null default 'soccer',
  match_type text not null default 'friendly',
  status text not null default 'scheduled',
  home_score integer,
  away_score integer,
  tier_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches add column if not exists home_score integer;
alter table public.matches add column if not exists away_score integer;
alter table public.matches add column if not exists tier_id uuid;
alter table public.matches add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.matches add column if not exists updated_at timestamptz not null default now();
alter table public.matches add column if not exists venue_name text;
alter table public.matches add column if not exists sport_type text not null default 'soccer';
alter table public.matches add column if not exists match_type text not null default 'friendly';
alter table public.matches add column if not exists status text not null default 'scheduled';
alter table public.matches add column if not exists created_at timestamptz not null default now();

alter table public.matches drop constraint if exists matches_sport_type_check;
alter table public.matches add constraint matches_sport_type_check check (sport_type in ('soccer', 'futsal'));

alter table public.matches drop constraint if exists matches_match_type_check;
alter table public.matches add constraint matches_match_type_check check (match_type in ('friendly', 'league', 'tournament'));

alter table public.matches drop constraint if exists matches_status_check;
alter table public.matches add constraint matches_status_check check (
  status in (
    'scheduled',
    'ongoing',
    'finished',
    'cancelled',
    'disputed',
    'finalized',
    'awaiting_confirmation',
    'awaiting_result',
    'auto_finalized'
  )
);

create table if not exists public.attendance_polls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  deadline_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.attendance_polls add column if not exists deadline_at timestamptz;
alter table public.attendance_polls add column if not exists created_at timestamptz not null default now();

create table if not exists public.attendance_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.attendance_polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response text not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint attendance_votes_poll_user_unique unique (poll_id, user_id)
);

alter table public.attendance_votes add column if not exists responded_at timestamptz;
alter table public.attendance_votes add column if not exists created_at timestamptz not null default now();

alter table public.attendance_votes drop constraint if exists attendance_votes_response_check;
alter table public.attendance_votes add constraint attendance_votes_response_check check (
  response in ('yes', 'no', 'maybe', 'late', 'unknown')
);

create index if not exists idx_matches_home_team_id on public.matches(home_team_id);
create index if not exists idx_matches_away_team_id on public.matches(away_team_id);
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_matches_scheduled_at on public.matches(scheduled_at);
create index if not exists idx_attendance_polls_match_id on public.attendance_polls(match_id);
create index if not exists idx_attendance_polls_team_id on public.attendance_polls(team_id);
create index if not exists idx_attendance_votes_poll_id on public.attendance_votes(poll_id);
create index if not exists idx_attendance_votes_user_id on public.attendance_votes(user_id);

create or replace function public.is_team_manager_or_owner(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = target_team_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.role in ('owner', 'manager')
  );
$$;

revoke all on function public.is_team_manager_or_owner(uuid) from public;
grant execute on function public.is_team_manager_or_owner(uuid) to authenticated;

alter table public.matches enable row level security;
alter table public.attendance_polls enable row level security;
alter table public.attendance_votes enable row level security;

drop policy if exists matches_select on public.matches;
create policy matches_select
on public.matches
for select
using (
  public.is_active_team_member(home_team_id)
  or (away_team_id is not null and public.is_active_team_member(away_team_id))
  or created_by = auth.uid()
);

drop policy if exists matches_insert on public.matches;
create policy matches_insert
on public.matches
for insert
with check (public.is_team_manager_or_owner(home_team_id));

drop policy if exists matches_update on public.matches;
create policy matches_update
on public.matches
for update
using (public.is_team_manager_or_owner(home_team_id))
with check (public.is_team_manager_or_owner(home_team_id));

drop policy if exists attendance_polls_select on public.attendance_polls;
create policy attendance_polls_select
on public.attendance_polls
for select
using (public.is_active_team_member(team_id));

drop policy if exists attendance_votes_select on public.attendance_votes;
create policy attendance_votes_select
on public.attendance_votes
for select
using (
  exists (
    select 1
    from public.attendance_polls ap
    where ap.id = poll_id
      and public.is_active_team_member(ap.team_id)
  )
);

drop policy if exists attendance_votes_insert on public.attendance_votes;
create policy attendance_votes_insert
on public.attendance_votes
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.attendance_polls ap
    where ap.id = poll_id
      and public.is_active_team_member(ap.team_id)
  )
);

drop policy if exists attendance_votes_update on public.attendance_votes;
create policy attendance_votes_update
on public.attendance_votes
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.attendance_polls ap
    where ap.id = poll_id
      and public.is_active_team_member(ap.team_id)
  )
);
