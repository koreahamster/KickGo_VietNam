-- File: 028_create_audit_logs_for_team_member_actions.sql
-- Purpose: Add audit_logs storage required for owner-driven team member management actions.
-- Execution Order: 28
-- Notes:
--   - Client access remains blocked; only service_role-backed functions should write audit logs.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_actor_user_id
  on public.audit_logs(actor_user_id);

create index if not exists idx_audit_logs_entity
  on public.audit_logs(entity_type, entity_id);

create index if not exists idx_audit_logs_created_at
  on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select
on public.audit_logs
for select
using (false);

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert
on public.audit_logs
for insert
with check (false);
