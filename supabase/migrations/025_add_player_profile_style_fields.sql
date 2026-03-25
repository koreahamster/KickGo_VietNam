-- File: 025_add_player_profile_style_fields.sql
-- Purpose: Add foot-skill and play-style fields to player_profiles.

alter table public.player_profiles
  add column if not exists left_foot_skill integer not null default 3,
  add column if not exists right_foot_skill integer not null default 3,
  add column if not exists play_styles text[] not null default '{}'::text[];

comment on column public.player_profiles.left_foot_skill is 'Player left foot skill level (1-5).';
comment on column public.player_profiles.right_foot_skill is 'Player right foot skill level (1-5).';
comment on column public.player_profiles.play_styles is 'Selected play-style tags managed through update-player-profile.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'player_profiles_left_foot_skill_range_check'
  ) THEN
    ALTER TABLE public.player_profiles
      ADD CONSTRAINT player_profiles_left_foot_skill_range_check
      CHECK (left_foot_skill between 1 and 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'player_profiles_right_foot_skill_range_check'
  ) THEN
    ALTER TABLE public.player_profiles
      ADD CONSTRAINT player_profiles_right_foot_skill_range_check
      CHECK (right_foot_skill between 1 and 5);
  END IF;
END $$;