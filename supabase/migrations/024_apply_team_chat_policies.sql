-- File: 024_apply_team_chat_policies.sql
-- Purpose: Apply minimal RLS for team chat messages and image uploads.
-- Execution Order: 24
-- Notes:
--   - Read/write access is limited to active team members.
--   - Image upload paths use the first folder segment as the team id.

alter table public.team_chat_messages enable row level security;

drop policy if exists team_chat_messages_select on public.team_chat_messages;
create policy team_chat_messages_select
on public.team_chat_messages
for select
using (public.is_active_team_member(team_id));

drop policy if exists team_chat_messages_insert on public.team_chat_messages;
create policy team_chat_messages_insert
on public.team_chat_messages
for insert
with check (
  user_id = auth.uid()
  and public.is_active_team_member(team_id)
);

drop policy if exists "team_chat_storage_insert" on storage.objects;
create policy "team_chat_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'team-chat'
  and array_length(storage.foldername(name), 1) >= 1
  and public.is_active_team_member((storage.foldername(name))[1]::uuid)
);