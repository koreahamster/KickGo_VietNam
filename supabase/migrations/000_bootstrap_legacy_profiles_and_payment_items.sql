-- File: 000_bootstrap_legacy_profiles_and_payment_items.sql
-- Purpose: Bootstrap legacy-compatible base tables when applying the migration stack to a fresh Supabase project.
-- Execution Order: 0
-- Notes:
--   - This file preserves the gradual migration strategy by creating only the minimum legacy structures expected by later migrations.
--   - Existing projects with already-created tables are unaffected because all objects are guarded with IF NOT EXISTS.
--   - Legacy player fields and primary_region_code remain present so backfill migrations can run safely.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  is_phone_verified boolean not null default false,
  display_name text,
  avatar_url text,
  birth_year integer,
  bio text,
  preferred_position text,
  preferred_foot text,
  top_size text,
  shoe_size text,
  dominant_foot text,
  skill_tier integer,
  reputation_score integer,
  primary_region_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_items (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid,
  item_type text,
  item_id uuid,
  amount numeric(18,2),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Bootstrap legacy-compatible profile base table for gradual schema migration.';
comment on table public.payment_items is 'Bootstrap legacy-compatible payment item table preserved for gradual payment_intent migration.';
comment on column public.profiles.primary_region_code is 'Legacy region field retained for backfill into province_code.';
