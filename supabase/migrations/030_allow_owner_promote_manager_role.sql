-- File: 030_allow_owner_promote_manager_role.sql
-- Purpose: Allow team owners to promote active members to manager through direct REST PATCH.
-- Execution Order: 30
-- Notes:
--   - Managers can continue changing members only between captain/player.
--   - Only owners can assign the manager role.

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
  and user_id <> auth.uid()
  and (
    role in ('captain', 'player')
    or (
      role = 'manager'
      and exists (
        select 1
        from public.team_members actor
        where actor.team_id = team_members.team_id
          and actor.user_id = auth.uid()
          and actor.status = 'active'
          and actor.role = 'owner'
      )
    )
  )
);