import { useEffect, useState } from "react";

import { getTeamDetail } from "@/services/team.service";
import type { TeamDetailRecord } from "@/types/team.types";

type UseTeamDetailOptions = {
  enabled?: boolean;
};

type UseTeamDetailResult = {
  teamDetail: TeamDetailRecord | null;
  isTeamDetailLoading: boolean;
  teamDetailErrorMessage: string | null;
  loadTeamDetail: () => Promise<TeamDetailRecord | null>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load team detail.";
}

export function useTeamDetail(teamId: string | null, options?: UseTeamDetailOptions): UseTeamDetailResult {
  const enabled = options?.enabled ?? true;
  const [teamDetail, setTeamDetail] = useState<TeamDetailRecord | null>(null);
  const [isTeamDetailLoading, setIsTeamDetailLoading] = useState<boolean>(enabled && !!teamId);
  const [teamDetailErrorMessage, setTeamDetailErrorMessage] = useState<string | null>(null);

  const loadTeamDetail = async (): Promise<TeamDetailRecord | null> => {
    if (!enabled || !teamId) {
      setTeamDetail(null);
      setTeamDetailErrorMessage(null);
      setIsTeamDetailLoading(false);
      return null;
    }

    try {
      setIsTeamDetailLoading(true);
      setTeamDetailErrorMessage(null);
      const nextTeamDetail = await getTeamDetail(teamId);
      setTeamDetail(nextTeamDetail);
      return nextTeamDetail;
    } catch (error: unknown) {
      setTeamDetail(null);
      setTeamDetailErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsTeamDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadTeamDetail();
  }, [enabled, teamId]);

  return {
    teamDetail,
    isTeamDetailLoading,
    teamDetailErrorMessage,
    loadTeamDetail,
  };
}