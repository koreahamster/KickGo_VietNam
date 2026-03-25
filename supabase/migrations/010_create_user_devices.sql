-- File: 010_create_user_devices.sql
-- Purpose: Add user_devices table required by KickGo v3.1 for push token tracking.
-- Execution Order: 10
-- Notes:
--   - This migration is additive and safe after 009.
--   - Push registration logic remains a later implementation step.

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_platform text not null,
  push_token text not null,
  app_version text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_devices_platform_check check (device_platform in ('ios', 'android'))
);

create unique index if not exists idx_user_devices_user_push_token
  on public.user_devices(user_id, push_token);

create index if not exists idx_user_devices_user_id
  on public.user_devices(user_id);

create index if not exists idx_user_devices_active
  on public.user_devices(is_active);

comment on table public.user_devices is 'Stores authenticated device push tokens for FCM notifications.';
comment on column public.user_devices.device_platform is 'Supported values: ios, android.';
comment on column public.user_devices.push_token is 'FCM push token for the current app/device installation.';