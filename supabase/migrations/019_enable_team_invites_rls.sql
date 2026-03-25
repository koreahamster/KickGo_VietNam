-- File: 019_enable_team_invites_rls.sql
-- Purpose: Enable RLS on team_invites while keeping direct REST access closed in the current phase.
-- Execution Order: 19
-- Notes:
--   - Invite creation/join stays server-driven through Edge Functions.

alter table public.team_invites enable row level security;
