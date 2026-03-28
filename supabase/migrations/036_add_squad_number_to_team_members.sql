-- Add squad numbers to team members and prevent duplicates within the same team.
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS squad_number integer;

CREATE UNIQUE INDEX IF NOT EXISTS team_members_team_id_squad_number_unique_idx
  ON public.team_members (team_id, squad_number)
  WHERE squad_number IS NOT NULL;