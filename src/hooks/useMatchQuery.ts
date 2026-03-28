import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import {
  createMatch,
  createTournament,
  getAttendancePoll,
  getAttendanceVotes,
  getMatchDetail,
  getTeamMatches,
  getTournament,
  getTournamentBrackets,
  voteAttendance,
} from "@/services/match.service";
import type {
  AttendancePollRecord,
  AttendanceResponse,
  AttendanceVoteRecord,
  CreateMatchRequest,
  CreateTournamentRequest,
  MatchDetailRecord,
  MatchRecord,
  TeamMatchSummaryRecord,
  TournamentBracketRecord,
  TournamentRecord,
} from "@/types/match.types";

type AttendanceVotesContext = {
  previousVotes: AttendanceVoteRecord[] | undefined;
};

export function useTeamMatches(teamId: string | null, year: number, month: number, enabled = true) {
  return useQuery<TeamMatchSummaryRecord[]>({
    queryKey: ["matches", { teamId, year, month }],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getTeamMatches(teamId, year, month);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useMatchDetail(matchId: string | null, enabled = true) {
  return useQuery<MatchDetailRecord>({
    queryKey: ["match", matchId],
    queryFn: () => {
      if (!matchId) {
        throw new Error("Match id is required.");
      }
      return getMatchDetail(matchId);
    },
    enabled: enabled && Boolean(matchId),
  });
}

export function useAttendancePoll(matchId: string | null, teamId: string | null, enabled = true) {
  return useQuery<AttendancePollRecord | null>({
    queryKey: ["attendance-poll", matchId, teamId],
    queryFn: () => {
      if (!matchId || !teamId) {
        throw new Error("Match id and team id are required.");
      }
      return getAttendancePoll(matchId, teamId);
    },
    enabled: enabled && Boolean(matchId) && Boolean(teamId),
  });
}

export function useAttendanceVotes(pollId: string | null, enabled = true) {
  return useQuery<AttendanceVoteRecord[]>({
    queryKey: ["attendance-votes", pollId],
    queryFn: () => {
      if (!pollId) {
        throw new Error("Poll id is required.");
      }
      return getAttendanceVotes(pollId);
    },
    enabled: enabled && Boolean(pollId),
  });
}

export function useVoteAttendance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<
    AttendanceVoteRecord,
    Error,
    { pollId: string; response: Extract<AttendanceResponse, "yes" | "no" | "maybe"> },
    AttendanceVotesContext
  >({
    mutationFn: ({ pollId, response }) => voteAttendance(pollId, response),
    onMutate: async (variables) => {
      const queryKey = ["attendance-votes", variables.pollId];
      await queryClient.cancelQueries({ queryKey });
      const previousVotes = queryClient.getQueryData<AttendanceVoteRecord[]>(queryKey);

      if (user?.id) {
        const optimisticVote: AttendanceVoteRecord = {
          id: `optimistic-${variables.pollId}-${user.id}`,
          poll_id: variables.pollId,
          user_id: user.id,
          response: variables.response,
          responded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        queryClient.setQueryData<AttendanceVoteRecord[]>(queryKey, (current) => {
          const list = current ?? [];
          const existingIndex = list.findIndex((item) => item.user_id === user.id);
          if (existingIndex >= 0) {
            return list.map((item, index) =>
              index === existingIndex
                ? { ...item, response: variables.response, responded_at: optimisticVote.responded_at }
                : item,
            );
          }
          return [...list, optimisticVote];
        });
      }

      return { previousVotes };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(["attendance-votes", variables.pollId], context?.previousVotes);
    },
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["attendance-votes", variables.pollId] });
    },
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation<MatchRecord, Error, CreateMatchRequest>({
    mutationFn: (request) => createMatch(request),
    onSettled: async (_result, _error, variables) => {
      const scheduledDate = new Date(variables.scheduled_at);
      const year = scheduledDate.getUTCFullYear();
      const month = scheduledDate.getUTCMonth() + 1;
      await queryClient.invalidateQueries({ queryKey: ["matches", { teamId: variables.home_team_id, year, month }] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      await queryClient.invalidateQueries({ queryKey: ["team", variables.home_team_id] });
    },
  });
}

export function useTournament(tournamentId: string | null, enabled = true) {
  return useQuery<TournamentRecord>({
    queryKey: ["tournament", tournamentId],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error("Tournament id is required.");
      }
      return getTournament(tournamentId);
    },
    enabled: enabled && Boolean(tournamentId),
  });
}

export function useTournamentBrackets(tournamentId: string | null, enabled = true) {
  return useQuery<TournamentBracketRecord[]>({
    queryKey: ["tournament-brackets", tournamentId],
    queryFn: () => {
      if (!tournamentId) {
        throw new Error("Tournament id is required.");
      }
      return getTournamentBrackets(tournamentId);
    },
    enabled: enabled && Boolean(tournamentId),
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation<TournamentRecord, Error, CreateTournamentRequest>({
    mutationFn: (request) => createTournament(request),
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      await queryClient.invalidateQueries({ queryKey: ["team", variables.host_team_id] });
      await queryClient.invalidateQueries({ queryKey: ["tournament"] });
    },
  });
}