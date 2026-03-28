-- Add ranked preferred positions and editable player stats.

alter table if exists public.player_profiles
  add column if not exists position_first text,
  add column if not exists position_second text,
  add column if not exists position_third text,
  add column if not exists stat_stamina integer not null default 50,
  add column if not exists stat_dribble integer not null default 50,
  add column if not exists stat_shooting integer not null default 50,
  add column if not exists stat_passing integer not null default 50,
  add column if not exists stat_defense integer not null default 50,
  add column if not exists stat_speed integer not null default 50;

update public.player_profiles
set
  position_first = coalesce(position_first, preferred_position),
  stat_stamina = coalesce(stat_stamina, 50),
  stat_dribble = coalesce(stat_dribble, 50),
  stat_shooting = coalesce(stat_shooting, 50),
  stat_passing = coalesce(stat_passing, 50),
  stat_defense = coalesce(stat_defense, 50),
  stat_speed = coalesce(stat_speed, 50)
where true;

alter table public.player_profiles
  drop constraint if exists player_profiles_stat_stamina_range,
  drop constraint if exists player_profiles_stat_dribble_range,
  drop constraint if exists player_profiles_stat_shooting_range,
  drop constraint if exists player_profiles_stat_passing_range,
  drop constraint if exists player_profiles_stat_defense_range,
  drop constraint if exists player_profiles_stat_speed_range;

alter table public.player_profiles
  add constraint player_profiles_stat_stamina_range check (stat_stamina between 0 and 100),
  add constraint player_profiles_stat_dribble_range check (stat_dribble between 0 and 100),
  add constraint player_profiles_stat_shooting_range check (stat_shooting between 0 and 100),
  add constraint player_profiles_stat_passing_range check (stat_passing between 0 and 100),
  add constraint player_profiles_stat_defense_range check (stat_defense between 0 and 100),
  add constraint player_profiles_stat_speed_range check (stat_speed between 0 and 100);