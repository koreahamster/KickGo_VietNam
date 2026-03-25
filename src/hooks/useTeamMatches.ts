import { useEffect, useState } from "react";

import { createMatch as createMatchService, getTeamMatches } from "@/services/match.service";
import type { CreateMatchInput, CreateMatchResult, TeamMatchSummaryRecord } from "@/types/match.types";

type UseTeamMatchesOptions = {
  enabled?: boolean;
};

type UseTeamMatchesResult = {
  matches: TeamMatchSummaryRecord[];
  isMatchesLoading: boolean;
  isSubmittingMatch: boolean;
  matchErrorMessage: string | null;
  matchStatusMessage: string | null;
  loadTeamMatches: () => Promise<TeamMatchSummaryRecord[]>;
  createMatch: (input: CreateMatchInput) => Promise<CreateMatchResult>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Match request failed.";
}

export function useTeamMatches(teamId: string | null, options?: UseTeamMatchesOptions): UseTeamMatchesResult {
  const enabled = options?.enabled ?? true;
  const [matches, setMatches] = useState<TeamMatchSummaryRecord[]>([]);
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(enabled && !!teamId);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState<boolean>(false);
  const [matchErrorMessage, setMatchErrorMessage] = useState<string | null>(null);
  const [matchStatusMessage, setMatchStatusMessage] = useState<string | null>(null);

  const loadTeamMatches = async (): Promise<TeamMatchSummaryRecord[]> => {
    if (!enabled || !teamId) {
      setMatches([]);
      setMatchErrorMessage(null);
      setMatchStatusMessage(null);
      setIsMatchesLoading(false);
      return [];
    }

    try {
      setIsMatchesLoading(true);
      setMatchErrorMessage(null);
      const nextMatches = await getTeamMatches(teamId);
      setMatches(nextMatches);
      return nextMatches;
    } catch (error: unknown) {
      setMatches([]);
      setMatchErrorMessage(getErrorMessage(error));
      return [];
    } finally {
      setIsMatchesLoading(false);
    }
  };

  useEffect(() => {
    void loadTeamMatches();
  }, [enabled, teamId]);

  return {
    matches,
    isMatchesLoading,
    isSubmittingMatch,
    matchErrorMessage,
    matchStatusMessage,
    loadTeamMatches,
    createMatch: async (input) => {
      try {
        setIsSubmittingMatch(true);
        setMatchErrorMessage(null);
        setMatchStatusMessage(null);
        const result = await createMatchService(input);
        await loadTeamMatches();
        setMatchStatusMessage("Match created.");
        return result;
      } catch (error: unknown) {
        setMatchErrorMessage(getErrorMessage(error));
        throw error;
      } finally {
        setIsSubmittingMatch(false);
      }
    },
  };
}