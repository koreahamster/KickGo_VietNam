-- File: 023_create_team_chat_core.sql
-- Purpose: Add the first persisted team chat slice and team chat image bucket.
-- Execution Order: 23
-- Notes:
--   - Team chat supports text and image attachments only for the MVP.
--   - Image paths are stored relative to the "team-chat" storage bucket.

create table if not exists public.team_chat_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message_text text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_chat_messages_content_check
    check (
      nullif(btrim(coalesce(message_text, '')), '') is not null
      or image_path is not null
    )
);

create index if not exists idx_team_chat_messages_team_id_created_at
  on public.team_chat_messages(team_id, created_at desc);

create index if not exists idx_team_chat_messages_user_id
  on public.team_chat_messages(user_id);

comment on table public.team_chat_messages is 'Realtime team chat messages for team members.';
comment on column public.team_chat_messages.image_path is 'Storage path inside the team-chat bucket. Format: {teamId}/{messageId}.{ext}.';

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_chat_messages'
  ) then
    alter publication supabase_realtime add table public.team_chat_messages;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-chat',
  'team-chat',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;