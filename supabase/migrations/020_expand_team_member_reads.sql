-- File: 020_expand_team_member_reads.sql
-- Purpose: Allow active team members to read the active roster of their own teams without recursive RLS checks.
-- Execution Order: 20
-- Notes:
--   - Uses a security definer helper to avoid self-referencing team_members policy recursion.
--   - Keeps write operations server-driven; only SELECT scope is expanded here.

create or replace function public.is_active_team_member(target_team_id uuid)
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
  );
$$;

revoke all on function public.is_active_team_member(uuid) from public;
grant execute on function public.is_active_team_member(uuid) to authenticated;

drop policy if exists team_members_select on public.team_members;
create policy team_members_select
on public.team_members
for select
using (
  user_id = auth.uid()
  or public.is_active_team_member(team_id)
);