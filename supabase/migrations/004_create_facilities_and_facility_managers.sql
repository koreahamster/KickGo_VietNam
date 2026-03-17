-- File: 004_create_facilities_and_facility_managers.sql
-- Purpose: Add facility and facility-manager relation structures.
-- Execution Order: 4
-- Notes:
--   - Public facility creation is intentionally not opened by this migration.
--   - facility_managers only models the relationship; workflow authorization is applied later.

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null default 'VN',
  province_code text,
  district_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facility_managers (
  user_id uuid not null references public.profiles(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_managers_pkey primary key (user_id, facility_id)
);

comment on table public.facilities is 'Facility master records. MVP creation path is admin/operator only.';
comment on table public.facility_managers is 'Relation table between users and facilities they manage.';
