-- File: 012_align_kickgo_v3_1_core_schema.sql
-- Purpose: Align the current schema with KickGo v3.1 for visibility, referee stats, and newly documented governance/support tables.
-- Execution Order: 12
-- Notes:
--   - Additive migration only. Existing legacy fields remain intact.
--   - platform_settings and currency_formats receive initial VN defaults from the docs.
--   - player_team_history keeps team_id as uuid for now and adds the FK in a later phase when teams is introduced.

alter table public.profiles
  add column if not exists visibility text;

update public.profiles
set visibility = coalesce(visibility, 'members_only')
where visibility is null;

alter table public.profiles
  alter column visibility set default 'members_only';

alter table public.profiles
  alter column visibility set not null;

alter table public.profiles
  drop constraint if exists profiles_visibility_check;

alter table public.profiles
  add constraint profiles_visibility_check
  check (visibility in ('public', 'members_only', 'private'));

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;

alter table public.profiles
  add constraint profiles_preferred_language_check
  check (preferred_language in ('vi', 'ko', 'en'));

comment on column public.profiles.visibility is 'Profile visibility scope: public, members_only, private.';

alter table public.player_profiles
  alter column skill_tier set default 1000;

alter table public.player_profiles
  alter column reputation_score set default 100;

update public.player_profiles
set skill_tier = 1000
where skill_tier is null or skill_tier = 0;

update public.player_profiles
set reputation_score = 100
where reputation_score is null or reputation_score = 0;

alter table public.referee_profiles
  add column if not exists average_rating numeric(3,2),
  add column if not exists rating_count integer;

update public.referee_profiles
set rating_count = coalesce(rating_count, 0)
where rating_count is null;

alter table public.referee_profiles
  alter column rating_count set default 0;

alter table public.referee_profiles
  alter column rating_count set not null;

comment on column public.referee_profiles.average_rating is 'Aggregated referee rating average.';
comment on column public.referee_profiles.rating_count is 'Number of submitted ratings for the referee.';

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_unique_pair unique (blocker_id, blocked_id),
  constraint user_blocks_self_block_check check (blocker_id <> blocked_id)
);

create table if not exists public.user_admin_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint user_admin_roles_pkey primary key (user_id, role),
  constraint user_admin_roles_role_check check (role in ('super_admin', 'ops_admin', 'content_admin', 'support_admin'))
);

create table if not exists public.platform_settings (
  key text primary key,
  value text not null,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.currency_formats (
  country_code text primary key,
  currency_code text not null,
  symbol text not null,
  decimal_separator text not null,
  thousands_separator text not null,
  symbol_position text not null,
  updated_at timestamptz not null default now(),
  constraint currency_formats_symbol_position_check check (symbol_position in ('before', 'after'))
);

create table if not exists public.player_team_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid not null,
  season_year integer not null,
  role text,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,
  is_agreed boolean not null,
  policy_version text not null,
  agreed_at timestamptz not null default now(),
  ip_address text,
  created_at timestamptz not null default now(),
  constraint user_consents_unique_type unique (user_id, consent_type),
  constraint user_consents_type_check check (consent_type in ('privacy_policy', 'marketing'))
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  report_type text not null,
  description text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_type_check check (target_type in ('user', 'post', 'shorts', 'comment', 'team')),
  constraint reports_report_type_check check (report_type in ('noshow', 'abuse', 'violence', 'false_report', 'spam', 'inappropriate')),
  constraint reports_status_check check (status in ('pending', 'reviewed', 'dismissed', 'actioned'))
);

insert into public.platform_settings (key, value, description)
values
  ('referee_commission_rate', '0', 'KickGo v3.1 default referee commission rate'),
  ('facility_commission_rate', '0', 'KickGo v3.1 default facility commission rate'),
  ('shop_commission_rate', '0', 'KickGo v3.1 default shop commission rate')
on conflict (key) do nothing;

insert into public.currency_formats (
  country_code,
  currency_code,
  symbol,
  decimal_separator,
  thousands_separator,
  symbol_position
)
values (
  'VN',
  'VND',
  chr(8363),
  '.',
  '.',
  'after'
)
on conflict (country_code) do nothing;

create index if not exists idx_user_blocks_blocker_id
  on public.user_blocks(blocker_id);

create index if not exists idx_user_blocks_blocked_id
  on public.user_blocks(blocked_id);

create index if not exists idx_player_team_history_user_id
  on public.player_team_history(user_id);

create index if not exists idx_player_team_history_team_id
  on public.player_team_history(team_id);

create index if not exists idx_player_team_history_season_year
  on public.player_team_history(season_year desc);

create index if not exists idx_user_consents_user_id
  on public.user_consents(user_id);

create index if not exists idx_reports_reporter_id
  on public.reports(reporter_id);

create index if not exists idx_reports_status
  on public.reports(status);