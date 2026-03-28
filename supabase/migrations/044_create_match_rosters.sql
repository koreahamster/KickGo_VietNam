create table if not exists public.match_rosters (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  user_id uuid not null references public.profiles(id),
  squad_number integer,
  position text,
  is_mercenary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, team_id, user_id)
);

create table if not exists public.referee_ratings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id),
  assignment_id uuid not null references public.referee_assignments(id),
  rated_by uuid not null references public.profiles(id),
  score_fairness integer not null,
  score_accuracy integer not null,
  score_attitude integer not null,
  overall_score integer not null,
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, rated_by)
);

alter table public.match_rosters add column if not exists squad_number integer;
alter table public.match_rosters add column if not exists position text;
alter table public.match_rosters add column if not exists is_mercenary boolean not null default false;
alter table public.match_rosters add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.referee_ratings add column if not exists assignment_id uuid references public.referee_assignments(id);
alter table public.referee_ratings add column if not exists rated_by uuid references public.profiles(id);
alter table public.referee_ratings add column if not exists score_fairness integer;
alter table public.referee_ratings add column if not exists score_accuracy integer;
alter table public.referee_ratings add column if not exists score_attitude integer;
alter table public.referee_ratings add column if not exists overall_score integer;
alter table public.referee_ratings add column if not exists comment text;
alter table public.referee_ratings add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.matches add column if not exists referee_id uuid references public.profiles(id);

alter table public.referee_ratings drop constraint if exists referee_ratings_score_fairness_check;
alter table public.referee_ratings add constraint referee_ratings_score_fairness_check check (score_fairness between 1 and 5);
alter table public.referee_ratings drop constraint if exists referee_ratings_score_accuracy_check;
alter table public.referee_ratings add constraint referee_ratings_score_accuracy_check check (score_accuracy between 1 and 5);
alter table public.referee_ratings drop constraint if exists referee_ratings_score_attitude_check;
alter table public.referee_ratings add constraint referee_ratings_score_attitude_check check (score_attitude between 1 and 5);
alter table public.referee_ratings drop constraint if exists referee_ratings_overall_score_check;
alter table public.referee_ratings add constraint referee_ratings_overall_score_check check (overall_score between 1 and 5);

create index if not exists match_rosters_match_team_idx on public.match_rosters (match_id, team_id);
create index if not exists match_rosters_match_user_idx on public.match_rosters (match_id, user_id);
create index if not exists referee_ratings_match_idx on public.referee_ratings (match_id);
create index if not exists referee_ratings_assignment_idx on public.referee_ratings (assignment_id);

alter table public.match_rosters enable row level security;
alter table public.referee_ratings enable row level security;

drop policy if exists match_rosters_select on public.match_rosters;
create policy match_rosters_select
on public.match_rosters
for select
using (
  public.is_active_team_member(team_id)
  or exists (
    select 1
    from public.referee_assignments assignment
    where assignment.match_id = match_rosters.match_id
      and assignment.referee_id = auth.uid()
      and assignment.status in ('accepted', 'completed')
  )
);

drop policy if exists match_rosters_insert on public.match_rosters;
create policy match_rosters_insert
on public.match_rosters
for insert
with check (public.is_team_manager_or_owner(team_id));

drop policy if exists match_rosters_update on public.match_rosters;
create policy match_rosters_update
on public.match_rosters
for update
using (public.is_team_manager_or_owner(team_id))
with check (public.is_team_manager_or_owner(team_id));

drop policy if exists match_rosters_delete on public.match_rosters;
create policy match_rosters_delete
on public.match_rosters
for delete
using (public.is_team_manager_or_owner(team_id));

drop policy if exists referee_ratings_select on public.referee_ratings;
create policy referee_ratings_select
on public.referee_ratings
for select
using (auth.uid() is not null);

drop policy if exists referee_ratings_insert on public.referee_ratings;
create policy referee_ratings_insert
on public.referee_ratings
for insert
with check (
  auth.uid() = rated_by
  and exists (
    select 1
    from public.referee_assignments assignment
    join public.matches m on m.id = assignment.match_id
    where assignment.id = referee_ratings.assignment_id
      and assignment.match_id = referee_ratings.match_id
      and assignment.requesting_team_id in (
        select tm.team_id
        from public.team_members tm
        where tm.user_id = auth.uid()
          and tm.status = 'active'
          and tm.role in ('owner', 'manager')
      )
      and m.status in ('finalized', 'auto_finalized')
  )
);
