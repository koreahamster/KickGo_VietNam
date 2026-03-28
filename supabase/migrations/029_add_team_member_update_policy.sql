-- File: 029_add_team_member_update_policy.sql
-- Purpose: Allow active owner/manager members to update captain/player roles through direct REST PATCH.
-- Execution Order: 29
-- Notes:
--   - Only role changes to captain/player are allowed in this phase.
--   - Owner rows and self rows remain immutable through direct REST updates.

create or replace function public.can_manage_team_roster(target_team_id uuid)
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

revoke all on function public.can_manage_team_roster(uuid) from public;
grant execute on function public.can_manage_team_roster(uuid) to authenticated;

drop policy if exists team_members_update on public.team_members;
create policy team_members_update
on public.team_members
for update
using (
  public.can_manage_team_roster(team_id)
  and status = 'active'
  and role <> 'owner'
  and user_id <> auth.uid()
)
with check (
  public.can_manage_team_roster(team_id)
  and status = 'active'
  and role in ('captain', 'player')
  and user_id <> auth.uid()
);
