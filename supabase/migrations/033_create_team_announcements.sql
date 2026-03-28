-- File: 033_create_team_announcements.sql
-- Purpose: Add team announcement storage and member-visible read policy.
-- Execution Order: 33
-- Notes:
--   - Announcements are created by an Edge Function with service role.
--   - Active team members can read announcements.

create table if not exists public.team_announcements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint team_announcements_title_length check (char_length(title) between 1 and 100),
  constraint team_announcements_body_length check (char_length(body) between 1 and 1000)
);

create index if not exists idx_team_announcements_team_created_at
  on public.team_announcements(team_id, created_at desc);

create index if not exists idx_team_announcements_author_id
  on public.team_announcements(author_id);

alter table public.team_announcements enable row level security;

drop policy if exists team_announcements_select on public.team_announcements;
create policy team_announcements_select
on public.team_announcements
for select
using (public.is_active_team_member(team_id));