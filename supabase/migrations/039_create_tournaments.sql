-- File: 039_create_tournaments.sql
-- Purpose: Add tournament entities and policies for team-based tournament creation.
-- Execution Order: 39

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host_team_id uuid not null references public.teams(id) on delete cascade,
  province_code text,
  max_teams integer not null default 4,
  status text not null default 'open',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tournaments add column if not exists name text;
alter table public.tournaments add column if not exists host_team_id uuid references public.teams(id) on delete cascade;
alter table public.tournaments add column if not exists province_code text;
alter table public.tournaments add column if not exists max_teams integer not null default 4;
alter table public.tournaments add column if not exists status text not null default 'open';
alter table public.tournaments add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.tournaments add column if not exists created_at timestamptz not null default now();

alter table public.tournaments drop constraint if exists tournaments_status_check;
alter table public.tournaments add constraint tournaments_status_check check (status in ('open', 'in_progress', 'finished'));

create table if not exists public.tournament_team_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  seed_number integer,
  created_at timestamptz not null default now(),
  constraint tournament_team_registrations_unique unique (tournament_id, team_id)
);

alter table public.tournament_team_registrations add column if not exists seed_number integer;
alter table public.tournament_team_registrations add column if not exists created_at timestamptz not null default now();

create table if not exists public.tournament_brackets (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round integer not null,
  match_order integer not null,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  winner_team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tournament_brackets add column if not exists round integer;
alter table public.tournament_brackets add column if not exists match_order integer;
alter table public.tournament_brackets add column if not exists home_team_id uuid references public.teams(id) on delete set null;
alter table public.tournament_brackets add column if not exists away_team_id uuid references public.teams(id) on delete set null;
alter table public.tournament_brackets add column if not exists match_id uuid references public.matches(id) on delete set null;
alter table public.tournament_brackets add column if not exists winner_team_id uuid references public.teams(id) on delete set null;
alter table public.tournament_brackets add column if not exists created_at timestamptz not null default now();

create index if not exists idx_tournaments_host_team on public.tournaments(host_team_id);
create index if not exists idx_tournament_registrations_tournament on public.tournament_team_registrations(tournament_id);
create index if not exists idx_tournament_brackets_tournament on public.tournament_brackets(tournament_id);

create or replace function public.can_manage_tournament(target_tournament_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournaments t
    join public.team_members tm
      on tm.team_id = t.host_team_id
    where t.id = target_tournament_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.role in ('owner', 'manager')
  );
$$;

revoke all on function public.can_manage_tournament(uuid) from public;
grant execute on function public.can_manage_tournament(uuid) to authenticated;

alter table public.tournaments enable row level security;
alter table public.tournament_team_registrations enable row level security;
alter table public.tournament_brackets enable row level security;

drop policy if exists tournaments_select on public.tournaments;
create policy tournaments_select
on public.tournaments
for select
using (auth.role() = 'authenticated');

drop policy if exists tournaments_insert on public.tournaments;
create policy tournaments_insert
on public.tournaments
for insert
with check (public.is_team_manager_or_owner(host_team_id));

drop policy if exists tournaments_update on public.tournaments;
create policy tournaments_update
on public.tournaments
for update
using (public.is_team_manager_or_owner(host_team_id))
with check (public.is_team_manager_or_owner(host_team_id));

drop policy if exists tournament_team_registrations_select on public.tournament_team_registrations;
create policy tournament_team_registrations_select
on public.tournament_team_registrations
for select
using (auth.role() = 'authenticated');

drop policy if exists tournament_team_registrations_insert on public.tournament_team_registrations;
create policy tournament_team_registrations_insert
on public.tournament_team_registrations
for insert
with check (public.can_manage_tournament(tournament_id));

drop policy if exists tournament_team_registrations_update on public.tournament_team_registrations;
create policy tournament_team_registrations_update
on public.tournament_team_registrations
for update
using (public.can_manage_tournament(tournament_id))
with check (public.can_manage_tournament(tournament_id));

drop policy if exists tournament_brackets_select on public.tournament_brackets;
create policy tournament_brackets_select
on public.tournament_brackets
for select
using (auth.role() = 'authenticated');

drop policy if exists tournament_brackets_insert on public.tournament_brackets;
create policy tournament_brackets_insert
on public.tournament_brackets
for insert
with check (public.can_manage_tournament(tournament_id));

drop policy if exists tournament_brackets_update on public.tournament_brackets;
create policy tournament_brackets_update
on public.tournament_brackets
for update
using (public.can_manage_tournament(tournament_id))
with check (public.can_manage_tournament(tournament_id));