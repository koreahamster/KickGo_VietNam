-- File: 016_apply_team_core_policies.sql
-- Purpose: Enable the minimum RLS policies required for public/member-visible teams and self team-membership reads.
-- Execution Order: 16
-- Notes:
--   - Team writes continue to go through Edge Functions in this phase.
--   - Direct inserts/updates through REST stay closed until explicit server-side flows are added.

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists teams_select on public.teams;
create policy teams_select
on public.teams
for select
using (
  visibility = 'public'
  or (visibility = 'members_only' and auth.uid() is not null)
  or exists (
    select 1
    from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists team_members_select on public.team_members;
create policy team_members_select
on public.team_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.team_members tm
    where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);