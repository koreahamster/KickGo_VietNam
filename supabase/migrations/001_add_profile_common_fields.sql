-- File: 001_add_profile_common_fields.sql
-- Purpose: Add common profile fields required by the revised documents without removing legacy player fields yet.
-- Execution Order: 1
-- Notes:
--   - Do not drop primary_region_code in this migration.
--   - province_code and district_code remain nullable until backfill is complete.

alter table public.profiles
  add column if not exists country_code text,
  add column if not exists province_code text,
  add column if not exists district_code text,
  add column if not exists preferred_language text;

alter table public.profiles
  alter column country_code set default 'VN';

alter table public.profiles
  alter column preferred_language set default 'vi';

update public.profiles
set country_code = coalesce(country_code, 'VN')
where country_code is null;

update public.profiles
set preferred_language = coalesce(preferred_language, 'vi')
where preferred_language is null;

alter table public.profiles
  alter column country_code set not null;

alter table public.profiles
  alter column preferred_language set not null;

comment on column public.profiles.country_code is 'Country code for common profile. MVP default is VN.';
comment on column public.profiles.province_code is 'Province/city code. Backfilled gradually from legacy region data.';
comment on column public.profiles.district_code is 'District code. Nullable during migration until region refinement completes.';
comment on column public.profiles.preferred_language is 'Preferred language. Priority: stored value > device language > vi.';
comment on column public.profiles.primary_region_code is 'Deprecated legacy region field. Retained temporarily for gradual migration.';
