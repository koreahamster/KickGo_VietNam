-- File: 022_apply_match_core_policies.sql
-- Purpose: Add minimal RLS policies for persisted matches and attendance polls.
-- Execution Order: 22
-- Notes:
--   - Keeps writes server-driven except for attendance vote self-service.
--   - Uses helper functions to avoid recursive team_members policy checks.

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
  or referee_user_id = auth.uid()
);

drop policy if exists matches_insert on public.matches;
create policy matches_insert
on public.matches
for insert
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
using (user_id = auth.uid());

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