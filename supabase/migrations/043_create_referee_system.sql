create table if not exists public.referee_availability (
  id uuid primary key default gen_random_uuid(),
  referee_id uuid not null references public.profiles(id) on delete cascade,
  available_date date not null,
  start_time time not null,
  end_time time not null,
  province_code text not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.referee_assignments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  referee_id uuid not null references public.profiles(id),
  requesting_team_id uuid not null references public.teams(id),
  fee_amount bigint not null default 0,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','completed','cancelled')),
  requested_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, referee_id)
);

create table if not exists public.referee_payment_records (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.referee_assignments(id),
  fee_amount bigint not null,
  note text,
  paid_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'referee_availability_unique_slot'
  ) then
    alter table public.referee_availability
      add constraint referee_availability_unique_slot unique (referee_id, available_date, start_time);
  end if;
end $$;

create index if not exists referee_availability_lookup_idx
  on public.referee_availability (available_date, province_code, is_booked, start_time);

create index if not exists referee_assignments_referee_idx
  on public.referee_assignments (referee_id, status, created_at desc);

create index if not exists referee_assignments_match_idx
  on public.referee_assignments (match_id);

alter table public.referee_availability enable row level security;
alter table public.referee_assignments enable row level security;
alter table public.referee_payment_records enable row level security;

drop policy if exists referee_availability_select on public.referee_availability;
create policy referee_availability_select
on public.referee_availability
for select
using (auth.uid() is not null);

drop policy if exists referee_availability_insert on public.referee_availability;
create policy referee_availability_insert
on public.referee_availability
for insert
with check (auth.uid() = referee_id);

drop policy if exists referee_availability_update on public.referee_availability;
create policy referee_availability_update
on public.referee_availability
for update
using (auth.uid() = referee_id)
with check (auth.uid() = referee_id);

drop policy if exists referee_availability_delete on public.referee_availability;
create policy referee_availability_delete
on public.referee_availability
for delete
using (auth.uid() = referee_id);

drop policy if exists referee_assignments_select on public.referee_assignments;
create policy referee_assignments_select
on public.referee_assignments
for select
using (
  auth.uid() = referee_id
  or public.is_team_manager_or_owner(requesting_team_id)
);

drop policy if exists referee_assignments_insert on public.referee_assignments;
create policy referee_assignments_insert
on public.referee_assignments
for insert
with check (public.is_team_manager_or_owner(requesting_team_id));

drop policy if exists referee_assignments_update on public.referee_assignments;
create policy referee_assignments_update
on public.referee_assignments
for update
using (
  auth.uid() = referee_id
  or public.is_team_manager_or_owner(requesting_team_id)
)
with check (
  auth.uid() = referee_id
  or public.is_team_manager_or_owner(requesting_team_id)
);

drop policy if exists referee_payment_records_select on public.referee_payment_records;
create policy referee_payment_records_select
on public.referee_payment_records
for select
using (
  exists (
    select 1
    from public.referee_assignments assignment
    where assignment.id = referee_payment_records.assignment_id
      and (
        assignment.referee_id = auth.uid()
        or public.is_team_manager_or_owner(assignment.requesting_team_id)
      )
  )
);

drop policy if exists referee_payment_records_insert on public.referee_payment_records;
create policy referee_payment_records_insert
on public.referee_payment_records
for insert
with check (
  auth.uid() = created_by
  and exists (
    select 1
    from public.referee_assignments assignment
    where assignment.id = referee_payment_records.assignment_id
      and public.is_team_manager_or_owner(assignment.requesting_team_id)
  )
);