import { create } from "zustand";

import type {
  CreateTeamResult,
  TeamAgeGroup,
  TeamAttackDirection,
  TeamDefenseStyle,
  TeamFormation,
  TeamGenderType,
  TeamMatchDay,
  TeamMatchTime,
  TeamSportType,
  TeamTacticStyle,
  TeamUniformColor,
} from "@/types/team.types";

export type TeamCreateDraft = {
  sportType: TeamSportType;
  name: string;
  foundedDate: string;
  provinceCode: string;
  districtCode: string;
  homeGround: string;
  genderType: TeamGenderType;
  ageGroups: TeamAgeGroup[];
  uniformColors: TeamUniformColor[];
  emblemUrl: string | null;
  matchDays: TeamMatchDay[];
  matchTimes: TeamMatchTime[];
  photoUrl: string | null;
  description: string;
  hasMonthlyFee: boolean;
  monthlyFee: number | null;
  formationA: TeamFormation | "";
  formationB: TeamFormation | "";
  tacticStyle: TeamTacticStyle | "";
  attackDirection: TeamAttackDirection | "";
  defenseStyle: TeamDefenseStyle | "";
};

export function getInitialTeamCreateDraft(): TeamCreateDraft {
  return {
    sportType: "soccer",
    name: "",
    foundedDate: "",
    provinceCode: "",
    districtCode: "",
    homeGround: "",
    genderType: "male",
    ageGroups: [],
    uniformColors: [],
    emblemUrl: null,
    matchDays: [],
    matchTimes: [],
    photoUrl: null,
    description: "",
    hasMonthlyFee: false,
    monthlyFee: null,
    formationA: "",
    formationB: "",
    tacticStyle: "",
    attackDirection: "",
    defenseStyle: "",
  };
}

type TeamCreateStore = TeamCreateDraft & {
  createdTeamId: string | null;
  createdTeamSlug: string | null;
  createdInviteCode: string | null;
  patchDraft: (values: Partial<TeamCreateDraft>) => void;
  setCreatedTeam: (result: CreateTeamResult) => void;
  setCreatedInviteCode: (inviteCode: string | null) => void;
  resetDraft: () => void;
};

export const useTeamCreateStore = create<TeamCreateStore>((set) => ({
  ...getInitialTeamCreateDraft(),
  createdTeamId: null,
  createdTeamSlug: null,
  createdInviteCode: null,
  patchDraft: (values) => set((state) => ({ ...state, ...values })),
  setCreatedTeam: (result) =>
    set({
      createdTeamId: result.team_id,
      createdTeamSlug: result.slug,
    }),
  setCreatedInviteCode: (inviteCode) => set({ createdInviteCode: inviteCode }),
  resetDraft: () =>
    set({
      ...getInitialTeamCreateDraft(),
      createdTeamId: null,
      createdTeamSlug: null,
      createdInviteCode: null,
    }),
}));