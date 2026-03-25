import { useEffect, useState } from "react";

import { getMatchDetail } from "@/services/match.service";
import type { MatchDetailRecord } from "@/types/match.types";

type UseMatchDetailOptions = {
  enabled?: boolean;
};

type UseMatchDetailResult = {
  matchDetail: MatchDetailRecord | null;
  isMatchDetailLoading: boolean;
  matchDetailErrorMessage: string | null;
  loadMatchDetail: () => Promise<MatchDetailRecord | null>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load match detail.";
}

export function useMatchDetail(matchId: string | null, options?: UseMatchDetailOptions): UseMatchDetailResult {
  const enabled = options?.enabled ?? true;
  const [matchDetail, setMatchDetail] = useState<MatchDetailRecord | null>(null);
  const [isMatchDetailLoading, setIsMatchDetailLoading] = useState<boolean>(enabled && !!matchId);
  const [matchDetailErrorMessage, setMatchDetailErrorMessage] = useState<string | null>(null);

  const loadMatchDetail = async (): Promise<MatchDetailRecord | null> => {
    if (!enabled || !matchId) {
      setMatchDetail(null);
      setMatchDetailErrorMessage(null);
      setIsMatchDetailLoading(false);
      return null;
    }

    try {
      setIsMatchDetailLoading(true);
      setMatchDetailErrorMessage(null);
      const nextMatchDetail = await getMatchDetail(matchId);
      setMatchDetail(nextMatchDetail);
      return nextMatchDetail;
    } catch (error: unknown) {
      setMatchDetail(null);
      setMatchDetailErrorMessage(getErrorMessage(error));
      return null;
    } finally {
      setIsMatchDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadMatchDetail();
  }, [enabled, matchId]);

  return {
    matchDetail,
    isMatchDetailLoading,
    matchDetailErrorMessage,
    loadMatchDetail,
  };
}