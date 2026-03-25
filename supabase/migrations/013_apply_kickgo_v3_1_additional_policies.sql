-- File: 013_apply_kickgo_v3_1_additional_policies.sql
-- Purpose: Align RLS behavior with KickGo v3.1 for visibility-driven profile access and newly added governance/support tables.
-- Execution Order: 13
-- Notes:
--   - Run after 012_align_kickgo_v3_1_core_schema.sql.
--   - Keeps privileged updates on admin/support tables server-driven except where explicitly allowed by docs.

alter table public.user_blocks enable row level security;
alter table public.user_admin_roles enable row level security;
alter table public.platform_settings enable row level security;
alter table public.currency_formats enable row level security;
alter table public.player_team_history enable row level security;
alter table public.user_consents enable row level security;
alter table public.reports enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles
for select
using (
  auth.uid() = id
  or visibility = 'public'
  or (visibility = 'members_only' and auth.uid() is not null)
);

drop policy if exists referee_profiles_select_own on public.referee_profiles;
drop policy if exists referee_profiles_select_authenticated on public.referee_profiles;
create policy referee_profiles_select_authenticated
on public.referee_profiles
for select
using (auth.uid() is not null);

drop policy if exists user_blocks_select_own on public.user_blocks;
drop policy if exists user_blocks_insert_own on public.user_blocks;
drop policy if exists user_blocks_delete_own on public.user_blocks;
create policy user_blocks_select_own
on public.user_blocks
for select
using (auth.uid() = blocker_id);

create policy user_blocks_insert_own
on public.user_blocks
for insert
with check (auth.uid() = blocker_id and auth.uid() <> blocked_id);

create policy user_blocks_delete_own
on public.user_blocks
for delete
using (auth.uid() = blocker_id);

drop policy if exists admin_roles_select_own on public.user_admin_roles;
create policy admin_roles_select_own
on public.user_admin_roles
for select
using (auth.uid() = user_id);

drop policy if exists platform_settings_select on public.platform_settings;
drop policy if exists platform_settings_update on public.platform_settings;
create policy platform_settings_select
on public.platform_settings
for select
using (auth.uid() is not null);

create policy platform_settings_update
on public.platform_settings
for update
using (
  exists (
    select 1
    from public.user_admin_roles uar
    where uar.user_id = auth.uid()
      and uar.role = 'super_admin'
  )
);

drop policy if exists currency_formats_select on public.currency_formats;
drop policy if exists currency_formats_update on public.currency_formats;
create policy currency_formats_select
on public.currency_formats
for select
using (auth.uid() is not null);

create policy currency_formats_update
on public.currency_formats
for update
using (
  exists (
    select 1
    from public.user_admin_roles uar
    where uar.user_id = auth.uid()
      and uar.role = 'super_admin'
  )
);

drop policy if exists player_team_history_select on public.player_team_history;
create policy player_team_history_select
on public.player_team_history
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = player_team_history.user_id
      and (
        p.visibility = 'public'
        or (p.visibility = 'members_only' and auth.uid() is not null)
        or p.id = auth.uid()
      )
  )
);

drop policy if exists user_consents_select on public.user_consents;
drop policy if exists user_consents_insert on public.user_consents;
create policy user_consents_select
on public.user_consents
for select
using (auth.uid() = user_id);

create policy user_consents_insert
on public.user_consents
for insert
with check (auth.uid() = user_id);

drop policy if exists reports_select on public.reports;
drop policy if exists reports_insert on public.reports;
drop policy if exists reports_update on public.reports;
create policy reports_select
on public.reports
for select
using (
  auth.uid() = reporter_id
  or exists (
    select 1
    from public.user_admin_roles uar
    where uar.user_id = auth.uid()
      and uar.role in ('support_admin', 'super_admin')
  )
);

create policy reports_insert
on public.reports
for insert
with check (auth.uid() = reporter_id);

create policy reports_update
on public.reports
for update
using (
  exists (
    select 1
    from public.user_admin_roles uar
    where uar.user_id = auth.uid()
      and uar.role in ('support_admin', 'super_admin', 'ops_admin')
  )
);