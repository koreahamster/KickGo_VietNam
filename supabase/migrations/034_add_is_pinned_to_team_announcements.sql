-- File: 034_add_is_pinned_to_team_announcements.sql
-- Purpose: Add pinned announcements and bulletin-board policies for team announcements.
-- Execution Order: 34
-- Notes:
--   - Supports pinned announcements ordered above regular announcements.
--   - Team members can read; owner/manager can write.

create table if not exists public.team_announcements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.team_announcements
  add column if not exists is_pinned boolean;

update public.team_announcements
set is_pinned = false
where is_pinned is null;

alter table public.team_announcements
  alter column is_pinned set default false;

alter table public.team_announcements
  alter column is_pinned set not null;

alter table public.team_announcements
  drop constraint if exists team_announcements_title_length;

alter table public.team_announcements
  drop constraint if exists team_announcements_body_length;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_announcements_title_length'
  ) then
    alter table public.team_announcements
      add constraint team_announcements_title_length
      check (char_length(title) between 1 and 100);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_announcements_body_length'
  ) then
    alter table public.team_announcements
      add constraint team_announcements_body_length
      check (char_length(body) between 1 and 2000);
  end if;
end $$;

create index if not exists idx_team_announcements_team_pinned_created_at
  on public.team_announcements(team_id, is_pinned desc, created_at desc);

create index if not exists idx_team_announcements_author_id
  on public.team_announcements(author_id);

alter table public.team_announcements enable row level security;

drop policy if exists team_announcements_select on public.team_announcements;
create policy team_announcements_select
on public.team_announcements
for select
using (public.is_active_team_member(team_id));

drop policy if exists team_announcements_insert on public.team_announcements;
create policy team_announcements_insert
on public.team_announcements
for insert
with check (
  author_id = auth.uid()
  and public.is_team_manager_or_owner(team_id)
);

drop policy if exists team_announcements_update on public.team_announcements;
create policy team_announcements_update
on public.team_announcements
for update
using (public.is_team_manager_or_owner(team_id))
with check (public.is_team_manager_or_owner(team_id));

drop policy if exists team_announcements_delete on public.team_announcements;
create policy team_announcements_delete
on public.team_announcements
for delete
using (public.is_team_manager_or_owner(team_id));