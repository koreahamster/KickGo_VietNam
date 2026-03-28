import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  confirmMatchRoster,
  deleteAvailability,
  getAvailableReferees,
  getMatchAssignment,
  getMatchRosters,
  getMyAssignments,
  getMyAvailability,
  getRefereeRatings,
  rateReferee,
  recordRefereePayment,
  registerAvailability,
  requestAssignment,
  respondAssignment,
  submitMatchRoster,
} from "@/services/referee.service";
import type {
  MatchRoster,
  RateRefereeRequest,
  RecordPaymentRequest,
  RefereeAssignment,
  RefereeAvailability,
  RefereePaymentRecord,
  RefereeRating,
  RegisterAvailabilityRequest,
  RequestAssignmentRequest,
  RespondAssignmentDecision,
  RespondAssignmentRequest,
  SubmitRosterRequest,
} from "@/types/referee.types";

type RespondContext = {
  previousAssignments?: RefereeAssignment[];
  previousMatchAssignment?: RefereeAssignment | null;
};

export function useMyAvailability(refereeId: string | null, enabled = true) {
  return useQuery<RefereeAvailability[]>({
    queryKey: ["referee-availability", refereeId],
    queryFn: () => {
      if (!refereeId) {
        throw new Error("Referee id is required.");
      }
      return getMyAvailability(refereeId);
    },
    enabled: enabled && Boolean(refereeId),
  });
}

export function useAvailableReferees(date: string | null, startTime: string | null, provinceCode: string | null, enabled = true) {
  return useQuery<RefereeAvailability[]>({
    queryKey: ["available-referees", { date, startTime, provinceCode }],
    queryFn: () => {
      if (!date || !startTime || !provinceCode) {
        throw new Error("Date, time, and province are required.");
      }
      return getAvailableReferees(date, startTime, provinceCode);
    },
    enabled: enabled && Boolean(date) && Boolean(startTime) && Boolean(provinceCode),
  });
}

export function useMatchAssignment(matchId: string | null, enabled = true) {
  return useQuery<RefereeAssignment | null>({
    queryKey: ["match-assignment", matchId],
    queryFn: () => {
      if (!matchId) {
        throw new Error("Match id is required.");
      }
      return getMatchAssignment(matchId);
    },
    enabled: enabled && Boolean(matchId),
  });
}

export function useMyAssignments(refereeId: string | null, enabled = true) {
  return useQuery<RefereeAssignment[]>({
    queryKey: ["my-assignments", refereeId],
    queryFn: () => {
      if (!refereeId) {
        throw new Error("Referee id is required.");
      }
      return getMyAssignments(refereeId);
    },
    enabled: enabled && Boolean(refereeId),
  });
}

export function useMatchRosters(matchId: string | null, enabled = true) {
  return useQuery<MatchRoster[]>({
    queryKey: ["match-rosters", matchId],
    queryFn: () => {
      if (!matchId) {
        throw new Error("Match id is required.");
      }
      return getMatchRosters(matchId);
    },
    enabled: enabled && Boolean(matchId),
  });
}

export function useRefereeRatings(matchId: string | null, enabled = true) {
  return useQuery<RefereeRating[]>({
    queryKey: ["referee-ratings", matchId],
    queryFn: () => {
      if (!matchId) {
        throw new Error("Match id is required.");
      }
      return getRefereeRatings(matchId);
    },
    enabled: enabled && Boolean(matchId),
  });
}

export function useRegisterAvailability() {
  const queryClient = useQueryClient();

  return useMutation<RefereeAvailability, Error, { refereeId: string; request: RegisterAvailabilityRequest }>({
    mutationFn: ({ request }) => registerAvailability(request),
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["referee-availability", variables.refereeId] });
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { refereeId: string; availabilityId: string }>({
    mutationFn: ({ availabilityId }) => deleteAvailability({ availabilityId }),
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["referee-availability", variables.refereeId] });
    },
  });
}

export function useRequestAssignment() {
  const queryClient = useQueryClient();

  return useMutation<
    RefereeAssignment,
    Error,
    {
      matchId: string;
      request: RequestAssignmentRequest;
      availabilityDate?: string | null;
      availabilityStartTime?: string | null;
      provinceCode?: string | null;
      refereeId?: string | null;
    }
  >({
    mutationFn: ({ request }) => requestAssignment(request),
    onSettled: async (_result, _error, variables) => {
      const invalidations: Promise<unknown>[] = [
        queryClient.invalidateQueries({ queryKey: ["match-assignment", variables.matchId] }),
      ];

      if (variables.availabilityDate && variables.availabilityStartTime && variables.provinceCode) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: ["available-referees", { date: variables.availabilityDate, startTime: variables.availabilityStartTime, provinceCode: variables.provinceCode }],
          }),
        );
      } else {
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["available-referees"] }));
      }

      if (variables.refereeId) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["my-assignments", variables.refereeId] }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["referee-availability", variables.refereeId] }));
      }

      await Promise.all(invalidations);
    },
  });
}

export function useRespondAssignment() {
  const queryClient = useQueryClient();

  return useMutation<
    RefereeAssignment,
    Error,
    { refereeId: string; matchId: string; request: RespondAssignmentRequest },
    RespondContext
  >({
    mutationFn: ({ request }) => respondAssignment(request),
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["my-assignments", variables.refereeId] }),
        queryClient.cancelQueries({ queryKey: ["match-assignment", variables.matchId] }),
      ]);

      const previousAssignments = queryClient.getQueryData<RefereeAssignment[]>(["my-assignments", variables.refereeId]);
      const previousMatchAssignment = queryClient.getQueryData<RefereeAssignment | null>(["match-assignment", variables.matchId]);
      const nextStatus = variables.request.decision === "accept" ? "accepted" : "rejected";
      const respondedAt = new Date().toISOString();

      queryClient.setQueryData<RefereeAssignment[]>(["my-assignments", variables.refereeId], (current) =>
        (current ?? []).map((item) =>
          item.id === variables.request.assignment_id ? { ...item, status: nextStatus, responded_at: respondedAt } : item,
        ),
      );

      queryClient.setQueryData<RefereeAssignment | null>(["match-assignment", variables.matchId], (current) =>
        current && current.id === variables.request.assignment_id ? { ...current, status: nextStatus, responded_at: respondedAt } : current,
      );

      return { previousAssignments, previousMatchAssignment };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(["my-assignments", variables.refereeId], context?.previousAssignments);
      queryClient.setQueryData(["match-assignment", variables.matchId], context?.previousMatchAssignment);
    },
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-assignments", variables.refereeId] }),
        queryClient.invalidateQueries({ queryKey: ["match-assignment", variables.matchId] }),
        queryClient.invalidateQueries({ queryKey: ["available-referees"] }),
      ]);
    },
  });
}

export function useSubmitRoster() {
  const queryClient = useQueryClient();

  return useMutation<MatchRoster[], Error, SubmitRosterRequest>({
    mutationFn: (request) => submitMatchRoster(request),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["match-rosters", variables.match_id] }),
        queryClient.invalidateQueries({ queryKey: ["match", variables.match_id] }),
      ]);
    },
  });
}

export function useConfirmRoster() {
  const queryClient = useQueryClient();

  return useMutation<{ match_id: string; status: string }, Error, { matchId: string }>({
    mutationFn: ({ matchId }) => confirmMatchRoster({ match_id: matchId }),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] }),
        queryClient.invalidateQueries({ queryKey: ["match-assignment", variables.matchId] }),
      ]);
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation<RefereePaymentRecord, Error, { refereeId?: string | null; matchId?: string | null; request: RecordPaymentRequest }>({
    mutationFn: ({ request }) => recordRefereePayment(request),
    onSettled: async (_result, _error, variables) => {
      const invalidations: Promise<unknown>[] = [];
      if (variables.refereeId) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["my-assignments", variables.refereeId] }));
      }
      if (variables.matchId) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["match-assignment", variables.matchId] }));
        invalidations.push(queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] }));
      }
      await Promise.all(invalidations);
    },
  });
}

export function useRateReferee() {
  const queryClient = useQueryClient();

  return useMutation<RefereeRating, Error, RateRefereeRequest>({
    mutationFn: (request) => rateReferee(request),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["match", variables.match_id] }),
        queryClient.invalidateQueries({ queryKey: ["referee-ratings", variables.match_id] }),
      ]);
    },
  });
}

