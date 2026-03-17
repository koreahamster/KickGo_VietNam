-- File: 002_create_account_types.sql
-- Purpose: Introduce multi-role support for service-level account types.
-- Execution Order: 2
-- Notes:
--   - One user may have multiple account types.
--   - Team roles and match-scoped referee authority remain separate concepts.

create table if not exists public.account_types (
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  constraint account_types_pkey primary key (user_id, type),
  constraint account_types_type_check check (type in ('player', 'referee', 'facility_manager'))
);

comment on table public.account_types is 'Service-level account roles. Multiple rows per user are allowed.';
comment on column public.account_types.type is 'Allowed values: player, referee, facility_manager.';
