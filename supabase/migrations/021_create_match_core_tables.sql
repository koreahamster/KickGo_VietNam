-- File: 021_create_match_core_tables.sql
-- Purpose: Add the first persisted match slice and attendance poll tables.
-- Execution Order: 21
-- Notes:
--   - Keeps away_team_id nullable for the current UI, which still captures opponent_name as free text.
--   - Adds temporary app-facing fields used by the current Phase 3 match screens.

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references public.teams(id) on delete cascade,
  away_team_id uuid references public.teams(id) on delete set null,
  season_id uuid,
  tier_id uuid,
  tournament_id uuid,
  referee_user_id uuid references public.profiles(id) on delete set null,
  facility_booking_id uuid,
  scheduled_at timestamptz not null,
  venue_name text,
  sport_type text not null,
  match_type text not null default 'friendly',
  futsal_match_type text,
  status text not null default 'scheduled',
  opponent_name text,
  team_side text not null default 'home',
  quarter_count integer not null default 2,
  quarter_minutes integer not null default 25,
  attendance_deadline_at timestamptz,
  notice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_sport_type_check check (sport_type in ('soccer', 'futsal')),
  constraint matches_match_type_check check (match_type in ('friendly', 'league', 'tournament')),
  constraint matches_futsal_match_type_check check (futsal_match_type is null or futsal_match_type in ('ranked', 'friendly')),
  constraint matches_status_check check (status in ('scheduled', 'ongoing', 'awaiting_confirmation', 'awaiting_result', 'finalized', 'disputed', 'auto_finalized', 'cancelled')),
  constraint matches_team_side_check check (team_side in ('home', 'away')),
  constraint matches_quarter_count_check check (quarter_count between 1 and 8),
  constraint matches_quarter_minutes_check check (quarter_minutes between 1 and 90)
);

create index if not exists idx_matches_home_team_id on public.matches(home_team_id);
create index if not exists idx_matches_away_team_id on public.matches(away_team_id);
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_matches_scheduled_at on public.matches(scheduled_at);
create index if not exists idx_matches_sport_type on public.matches(sport_type);

comment on table public.matches is 'Persisted match core for Phase 3 match registration and attendance flow.';
comment on column public.matches.opponent_name is 'Temporary opponent text until full away-team selection is introduced.';
comment on column public.matches.team_side is 'Current team perspective for the match create flow.';
comment on column public.matches.quarter_count is 'Number of quarters selected for the current amateur match.';
comment on column public.matches.quarter_minutes is 'Length of each quarter in minutes.';
comment on column public.matches.notice is 'Coach or club notice shown in the match detail surface.';

create table if not exists public.attendance_polls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  deadline_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendance_polls_match_id on public.attendance_polls(match_id);
create index if not exists idx_attendance_polls_team_id on public.attendance_polls(team_id);

comment on table public.attendance_polls is 'One attendance poll per team/match pair for the first attendance voting slice.';

create table if not exists public.attendance_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.attendance_polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  response text not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint attendance_votes_response_check check (response in ('yes', 'no', 'late', 'unknown')),
  constraint attendance_votes_poll_user_unique unique (poll_id, user_id)
);

create index if not exists idx_attendance_votes_poll_id on public.attendance_votes(poll_id);
create index if not exists idx_attendance_votes_user_id on public.attendance_votes(user_id);

comment on table public.attendance_votes is 'Attendance responses for the first match voting slice.';