-- Team recruitment status and applications
alter table public.teams
  add column if not exists recruitment_status text;

update public.teams
set recruitment_status = 'open'
where recruitment_status is null;

alter table public.teams
  alter column recruitment_status set default 'open';

alter table public.teams
  alter column recruitment_status set not null;

alter table public.teams
  drop constraint if exists teams_recruitment_status_check;

alter table public.teams
  add constraint teams_recruitment_status_check
  check (recruitment_status in ('open', 'closed', 'invite_only'));

update public.teams
set is_recruiting = (recruitment_status = 'open')
where is_recruiting is distinct from (recruitment_status = 'open');

create table if not exists public.team_recruitment_posts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null default 'Recruitment',
  body text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_recruitment_applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.team_recruitment_posts(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_recruitment_applications_status_check check (status in ('pending', 'accepted', 'rejected')),
  constraint team_recruitment_applications_post_applicant_key unique (post_id, applicant_id)
);

alter table public.team_recruitment_posts enable row level security;
alter table public.team_recruitment_applications enable row level security;

drop policy if exists team_recruitment_posts_select on public.team_recruitment_posts;
create policy team_recruitment_posts_select
  on public.team_recruitment_posts
  for select
  using (public.is_active_team_member(team_id));

drop policy if exists team_recruitment_posts_insert on public.team_recruitment_posts;
create policy team_recruitment_posts_insert
  on public.team_recruitment_posts
  for insert
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_recruitment_posts_update on public.team_recruitment_posts;
create policy team_recruitment_posts_update
  on public.team_recruitment_posts
  for update
  using (public.can_manage_team_roster(team_id))
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_recruitment_posts_delete on public.team_recruitment_posts;
create policy team_recruitment_posts_delete
  on public.team_recruitment_posts
  for delete
  using (public.can_manage_team_roster(team_id));

drop policy if exists team_recruitment_applications_select on public.team_recruitment_applications;
create policy team_recruitment_applications_select
  on public.team_recruitment_applications
  for select
  using (
    exists (
      select 1
      from public.team_recruitment_posts post
      where post.id = team_recruitment_applications.post_id
        and public.can_manage_team_roster(post.team_id)
    )
  );

drop policy if exists team_recruitment_applications_update on public.team_recruitment_applications;
create policy team_recruitment_applications_update
  on public.team_recruitment_applications
  for update
  using (
    exists (
      select 1
      from public.team_recruitment_posts post
      where post.id = team_recruitment_applications.post_id
        and public.can_manage_team_roster(post.team_id)
    )
  )
  with check (
    exists (
      select 1
      from public.team_recruitment_posts post
      where post.id = team_recruitment_applications.post_id
        and public.can_manage_team_roster(post.team_id)
    )
  );

drop policy if exists team_recruitment_applications_delete on public.team_recruitment_applications;
create policy team_recruitment_applications_delete
  on public.team_recruitment_applications
  for delete
  using (
    exists (
      select 1
      from public.team_recruitment_posts post
      where post.id = team_recruitment_applications.post_id
        and public.can_manage_team_roster(post.team_id)
    )
  );