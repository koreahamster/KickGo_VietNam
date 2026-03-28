-- Team fee management

create table if not exists public.team_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  provider text not null,
  account_name text not null,
  account_number text,
  qr_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint team_payment_accounts_provider_check check (provider in ('momo', 'zalopay', 'bank'))
);

create table if not exists public.team_fee_settings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams(id) on delete cascade,
  fee_type text not null default 'monthly',
  monthly_amount bigint not null default 0,
  per_match_amount bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_fee_settings_fee_type_check check (fee_type in ('monthly', 'per_match', 'mixed'))
);

create table if not exists public.team_fee_records (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  fee_type text not null,
  year_month text,
  match_id uuid references public.matches(id) on delete set null,
  amount bigint not null,
  is_paid boolean not null default false,
  paid_at timestamptz,
  confirmed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint team_fee_records_fee_type_check check (fee_type in ('monthly', 'per_match'))
);

create table if not exists public.team_fee_usages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  amount bigint not null,
  description text not null,
  used_at date not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists team_payment_accounts_team_provider_active_idx
  on public.team_payment_accounts(team_id, provider)
  where is_active = true;

create index if not exists team_fee_records_team_year_month_idx
  on public.team_fee_records(team_id, year_month, fee_type, created_at desc);

create index if not exists team_fee_records_match_idx
  on public.team_fee_records(match_id);

create index if not exists team_fee_usages_team_used_at_idx
  on public.team_fee_usages(team_id, used_at desc, created_at desc);

alter table public.team_payment_accounts enable row level security;
alter table public.team_fee_settings enable row level security;
alter table public.team_fee_records enable row level security;
alter table public.team_fee_usages enable row level security;

drop policy if exists team_payment_accounts_select on public.team_payment_accounts;
create policy team_payment_accounts_select
  on public.team_payment_accounts
  for select
  using (public.is_active_team_member(team_id));

drop policy if exists team_payment_accounts_insert on public.team_payment_accounts;
create policy team_payment_accounts_insert
  on public.team_payment_accounts
  for insert
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_payment_accounts_update on public.team_payment_accounts;
create policy team_payment_accounts_update
  on public.team_payment_accounts
  for update
  using (public.can_manage_team_roster(team_id))
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_payment_accounts_delete on public.team_payment_accounts;
create policy team_payment_accounts_delete
  on public.team_payment_accounts
  for delete
  using (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_settings_select on public.team_fee_settings;
create policy team_fee_settings_select
  on public.team_fee_settings
  for select
  using (public.is_active_team_member(team_id));

drop policy if exists team_fee_settings_insert on public.team_fee_settings;
create policy team_fee_settings_insert
  on public.team_fee_settings
  for insert
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_settings_update on public.team_fee_settings;
create policy team_fee_settings_update
  on public.team_fee_settings
  for update
  using (public.can_manage_team_roster(team_id))
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_records_select on public.team_fee_records;
create policy team_fee_records_select
  on public.team_fee_records
  for select
  using (
    user_id = auth.uid()
    or public.can_manage_team_roster(team_id)
  );

drop policy if exists team_fee_records_insert on public.team_fee_records;
create policy team_fee_records_insert
  on public.team_fee_records
  for insert
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_records_update on public.team_fee_records;
create policy team_fee_records_update
  on public.team_fee_records
  for update
  using (public.can_manage_team_roster(team_id))
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_usages_select on public.team_fee_usages;
create policy team_fee_usages_select
  on public.team_fee_usages
  for select
  using (public.is_active_team_member(team_id));

drop policy if exists team_fee_usages_insert on public.team_fee_usages;
create policy team_fee_usages_insert
  on public.team_fee_usages
  for insert
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_usages_update on public.team_fee_usages;
create policy team_fee_usages_update
  on public.team_fee_usages
  for update
  using (public.can_manage_team_roster(team_id))
  with check (public.can_manage_team_roster(team_id));

drop policy if exists team_fee_usages_delete on public.team_fee_usages;
create policy team_fee_usages_delete
  on public.team_fee_usages
  for delete
  using (public.can_manage_team_roster(team_id));