-- File: 026_expand_team_schema_for_create_flow.sql
-- Purpose: Expand the teams table to support the multi-step KickGo team creation flow.
-- Execution Order: 26

alter table public.teams
  add column if not exists sport_type text not null default 'soccer',
  add column if not exists founded_date date,
  add column if not exists home_ground text,
  add column if not exists gender_type text,
  add column if not exists age_groups text[] not null default '{}'::text[],
  add column if not exists uniform_colors text[] not null default '{}'::text[],
  add column if not exists photo_url text,
  add column if not exists match_days text[] not null default '{}'::text[],
  add column if not exists match_times text[] not null default '{}'::text[],
  add column if not exists monthly_fee integer,
  add column if not exists formation_a text,
  add column if not exists formation_b text,
  add column if not exists tactic_style text,
  add column if not exists attack_direction text,
  add column if not exists defense_style text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'teams_sport_type_check'
  ) then
    alter table public.teams
      add constraint teams_sport_type_check
      check (sport_type in ('soccer', 'futsal', 'both'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'teams_gender_type_check'
  ) then
    alter table public.teams
      add constraint teams_gender_type_check
      check (gender_type is null or gender_type in ('male', 'female', 'mixed'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'teams_monthly_fee_check'
  ) then
    alter table public.teams
      add constraint teams_monthly_fee_check
      check (monthly_fee is null or monthly_fee >= 0);
  end if;
end $$;

comment on column public.teams.sport_type is 'soccer, futsal, or both.';
comment on column public.teams.founded_date is 'Founded date captured from the team create flow.';
comment on column public.teams.home_ground is 'Optional preferred home ground label.';
comment on column public.teams.gender_type is 'Primary gender composition of the team.';
comment on column public.teams.age_groups is 'Selected age-group tags from the create flow.';
comment on column public.teams.uniform_colors is 'Selected uniform colors in priority order (home/away/third).';
comment on column public.teams.photo_url is 'Public hero photo URL for the team profile.';
comment on column public.teams.match_days is 'Preferred weekly match days.';
comment on column public.teams.match_times is 'Preferred match time ranges.';
comment on column public.teams.monthly_fee is 'Optional monthly team fee.';
comment on column public.teams.formation_a is 'Primary formation option.';
comment on column public.teams.formation_b is 'Secondary formation option.';
comment on column public.teams.tactic_style is 'Overall tactical style selection.';
comment on column public.teams.attack_direction is 'Preferred attack direction.';
comment on column public.teams.defense_style is 'Preferred defense style.';