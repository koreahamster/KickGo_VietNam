-- File: 031_harden_team_member_update_policy.sql
-- Purpose: Stabilize direct team_members role updates for owner and manager actions by moving role checks into security definer helpers.
-- Execution Order: 31
-- Notes:
--   - Managers can assign only captain/player.
--   - Owners can assign captain/player/manager.
--   - Self updates and owner target rows remain blocked.

create or replace function public.is_team_owner(target_team_id uuid)
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
      and tm.role = 'owner'
  );
$$;

revoke all on function public.is_team_owner(uuid) from public;
grant execute on function public.is_team_owner(uuid) to authenticated;

create or replace function public.can_assign_team_member_role(target_team_id uuid, next_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when next_role in ('captain', 'player') then public.can_manage_team_roster(target_team_id)
    when next_role = 'manager' then public.is_team_owner(target_team_id)
    else false
  end;
$$;

revoke all on function public.can_assign_team_member_role(uuid, text) from public;
grant execute on function public.can_assign_team_member_role(uuid, text) to authenticated;

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
  status = 'active'
  and user_id <> auth.uid()
  and public.can_assign_team_member_role(team_id, role)
);
