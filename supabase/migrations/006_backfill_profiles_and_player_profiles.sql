-- File: 006_backfill_profiles_and_player_profiles.sql
-- Purpose: Backfill common profile fields, initial player role, and player profile data from legacy profiles.
-- Execution Order: 6
-- Notes:
--   - Existing users receive player as the initial default account type.
--   - primary_region_code is copied into province_code as a temporary fallback.
--   - district_code remains null until a later region refinement step.
--   - player_profiles rows are created only when at least one legacy player field exists.

update public.profiles
set country_code = coalesce(country_code, 'VN'),
    preferred_language = coalesce(preferred_language, 'vi'),
    province_code = coalesce(province_code, primary_region_code)
where true;

insert into public.account_types (user_id, type)
select p.id, 'player'
from public.profiles p
where not exists (
  select 1
  from public.account_types at
  where at.user_id = p.id
    and at.type = 'player'
);

insert into public.player_profiles (
  user_id,
  preferred_position,
  preferred_foot,
  dominant_foot,
  top_size,
  shoe_size,
  skill_tier,
  reputation_score,
  created_at,
  updated_at
)
select
  p.id,
  p.preferred_position,
  p.preferred_foot,
  p.dominant_foot,
  p.top_size,
  p.shoe_size,
  coalesce(p.skill_tier, 0),
  coalesce(p.reputation_score, 0),
  now(),
  now()
from public.profiles p
where (
    p.preferred_position is not null
    or p.preferred_foot is not null
    or p.dominant_foot is not null
    or p.top_size is not null
    or p.shoe_size is not null
    or p.skill_tier is not null
    or p.reputation_score is not null
  )
  and not exists (
    select 1
    from public.player_profiles pp
    where pp.user_id = p.id
  );
