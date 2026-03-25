-- File: 017_fix_team_member_policy_recursion.sql
-- Purpose: Fix recursive RLS evaluation on public.team_members introduced by the initial team core policy set.
-- Execution Order: 17
-- Notes:
--   - Keep team_members readable only by the member themself in this phase.
--   - teams_select can still check membership through team_members without recursion after this change.

alter table public.team_members enable row level security;

drop policy if exists team_members_select on public.team_members;
create policy team_members_select
on public.team_members
for select
using (user_id = auth.uid());