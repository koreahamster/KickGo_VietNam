import { useEffect, useState } from "react";
import {
  createTeam as createTeamService,
  createTeamInvite as createTeamInviteService,
  getMyTeams,
  joinTeam as joinTeamService,
} from "@/services/team.service";
import type {
  CreateTeamInput,
  CreateTeamInviteResult,
  CreateTeamResult,
  JoinTeamResult,
  TeamMembershipRecord,
} from "@/types/team.types";
type UseTeamsOptions = {
  enabled?: boolean;
};
type UseTeamsResult = {
  teams: TeamMembershipRecord[];
  isTeamsLoading: boolean;
  isSubmittingTeam: boolean;
  teamErrorMessage: string | null;
  teamStatusMessage: string | null;
  loadMyTeams: () => Promise<TeamMembershipRecord[]>;
  createTeam: (input: CreateTeamInput) => Promise<CreateTeamResult>;
  createTeamInvite: (teamId: string) => Promise<CreateTeamInviteResult>;
  joinTeam: (inviteCode: string) => Promise<JoinTeamResult>;
};
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Team request failed.";
}
export function useTeams(options?: UseTeamsOptions): UseTeamsResult {
  const enabled = options?.enabled ?? true;
  const [teams, setTeams] = useState<TeamMembershipRecord[]>([]);
  const [isTeamsLoading, setIsTeamsLoading] = useState<boolean>(enabled);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState<boolean>(false);
  const [teamErrorMessage, setTeamErrorMessage] = useState<string | null>(null);
  const [teamStatusMessage, setTeamStatusMessage] = useState<string | null>(null);
  const loadMyTeams = async (): Promise<TeamMembershipRecord[]> => {
    if (!enabled) {
      setTeams([]);
      setTeamErrorMessage(null);
      setTeamStatusMessage(null);
      setIsTeamsLoading(false);
      return [];
    }
    try {
      setIsTeamsLoading(true);
      setTeamErrorMessage(null);
      const nextTeams = await getMyTeams();
      setTeams(nextTeams);
      return nextTeams;
    } catch (error: unknown) {
      setTeamErrorMessage(getErrorMessage(error));
      return [];
    } finally {
      setIsTeamsLoading(false);
    }
  };
  useEffect(() => {
    void loadMyTeams();
  }, [enabled]);
  return {
    teams,
    isTeamsLoading,
    isSubmittingTeam,
    teamErrorMessage,
    teamStatusMessage,
    loadMyTeams,
    createTeam: async (input) => {
      try {
        setIsSubmittingTeam(true);
        setTeamErrorMessage(null);
        setTeamStatusMessage(null);
        const result = await createTeamService(input);
        await loadMyTeams();
        setTeamStatusMessage("Team created.");
        return result;
      } catch (error: unknown) {
        setTeamErrorMessage(getErrorMessage(error));
        throw error;
      } finally {
        setIsSubmittingTeam(false);
      }
    },
    createTeamInvite: async (teamId) => {
      try {
        setIsSubmittingTeam(true);
        setTeamErrorMessage(null);
        setTeamStatusMessage(null);
        const result = await createTeamInviteService(teamId);
        setTeamStatusMessage("Invite code created.");
        return result;
      } catch (error: unknown) {
        setTeamErrorMessage(getErrorMessage(error));
        throw error;
      } finally {
        setIsSubmittingTeam(false);
      }
    },
    joinTeam: async (inviteCode) => {
      try {
        setIsSubmittingTeam(true);
        setTeamErrorMessage(null);
        setTeamStatusMessage(null);
        const result = await joinTeamService(inviteCode);
        await loadMyTeams();
        setTeamStatusMessage("Joined team.");
        return result;
      } catch (error: unknown) {
        setTeamErrorMessage(getErrorMessage(error));
        throw error;
      } finally {
        setIsSubmittingTeam(false);
      }
    },
  };
}