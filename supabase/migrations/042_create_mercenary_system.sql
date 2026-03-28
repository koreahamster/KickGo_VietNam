create table if not exists public.mercenary_posts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  needed_positions text[] not null,
  needed_count integer not null default 1,
  province_code text not null,
  description text,
  status text not null default 'open',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint mercenary_posts_needed_count_check check (needed_count between 1 and 11),
  constraint mercenary_posts_status_check check (status in ('open', 'closed', 'cancelled'))
);

create table if not exists public.mercenary_applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.mercenary_posts(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id),
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  constraint mercenary_applications_status_check check (status in ('pending', 'accepted', 'rejected')),
  constraint mercenary_applications_unique_applicant unique (post_id, applicant_id)
);

alter table public.mercenary_posts enable row level security;
alter table public.mercenary_applications enable row level security;

create index if not exists idx_mercenary_posts_province_status_created_at on public.mercenary_posts (province_code, status, created_at desc);
create index if not exists idx_mercenary_posts_team_id_created_at on public.mercenary_posts (team_id, created_at desc);
create index if not exists idx_mercenary_posts_match_id on public.mercenary_posts (match_id);
create index if not exists idx_mercenary_applications_post_id_status on public.mercenary_applications (post_id, status, created_at desc);
create index if not exists idx_mercenary_applications_applicant_id on public.mercenary_applications (applicant_id, created_at desc);

create or replace function public.set_mercenary_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_mercenary_posts_updated_at on public.mercenary_posts;
create trigger trg_mercenary_posts_updated_at
before update on public.mercenary_posts
for each row
execute function public.set_mercenary_posts_updated_at();

drop policy if exists mercenary_posts_select_authenticated on public.mercenary_posts;
create policy mercenary_posts_select_authenticated on public.mercenary_posts for select to authenticated using (true);

drop policy if exists mercenary_posts_insert_manager on public.mercenary_posts;
create policy mercenary_posts_insert_manager
on public.mercenary_posts
for insert
to authenticated
with check (
  exists (
    select 1 from public.team_members team_member
    where team_member.team_id = mercenary_posts.team_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
);

drop policy if exists mercenary_posts_update_manager on public.mercenary_posts;
create policy mercenary_posts_update_manager
on public.mercenary_posts
for update
to authenticated
using (
  exists (
    select 1 from public.team_members team_member
    where team_member.team_id = mercenary_posts.team_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1 from public.team_members team_member
    where team_member.team_id = mercenary_posts.team_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
);

drop policy if exists mercenary_applications_select_owner_or_self on public.mercenary_applications;
create policy mercenary_applications_select_owner_or_self
on public.mercenary_applications
for select
to authenticated
using (
  mercenary_applications.applicant_id = auth.uid()
  or exists (
    select 1
    from public.mercenary_posts post
    join public.team_members team_member on team_member.team_id = post.team_id
    where post.id = mercenary_applications.post_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
);

drop policy if exists mercenary_applications_insert_authenticated on public.mercenary_applications;
create policy mercenary_applications_insert_authenticated
on public.mercenary_applications
for insert
to authenticated
with check (
  mercenary_applications.applicant_id = auth.uid()
  and not exists (
    select 1
    from public.mercenary_posts post
    join public.team_members team_member on team_member.team_id = post.team_id
    where post.id = mercenary_applications.post_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
  )
);

drop policy if exists mercenary_applications_update_manager on public.mercenary_applications;
create policy mercenary_applications_update_manager
on public.mercenary_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.mercenary_posts post
    join public.team_members team_member on team_member.team_id = post.team_id
    where post.id = mercenary_applications.post_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.mercenary_posts post
    join public.team_members team_member on team_member.team_id = post.team_id
    where post.id = mercenary_applications.post_id
      and team_member.user_id = auth.uid()
      and team_member.status = 'active'
      and team_member.role in ('owner', 'manager')
  )
);