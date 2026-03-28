import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getRecruitmentApplications,
  getRecruitmentPosts,
  respondRecruitmentApplication,
  updateRecruitmentStatus,
} from "@/services/team.service";
import type {
  RecruitmentApplication,
  RecruitmentDecision,
  TeamDetailRecord,
  TeamRecruitmentPost,
  TeamRecruitmentStatus,
} from "@/types/team.types";

type RecruitmentStatusMutationContext = {
  previousTeam?: TeamDetailRecord;
};

type RecruitmentApplicationMutationContext = {
  previousApplications?: RecruitmentApplication[];
};

export function useRecruitmentPosts(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team-recruitment-posts", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }

      return getRecruitmentPosts(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useRecruitmentApplications(postId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team-recruitment-applications", postId],
    queryFn: () => {
      if (!postId) {
        throw new Error("Recruitment post id is required.");
      }

      return getRecruitmentApplications(postId);
    },
    enabled: enabled && Boolean(postId),
  });
}

export function useUpdateRecruitmentStatus(teamId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<TeamDetailRecord["team"], Error, TeamRecruitmentStatus, RecruitmentStatusMutationContext>({
    mutationFn: (status) => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }

      return updateRecruitmentStatus(teamId, status);
    },
    onMutate: async (status) => {
      if (!teamId) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: ["team", teamId] });
      const previousTeam = queryClient.getQueryData<TeamDetailRecord>(["team", teamId]);

      if (previousTeam) {
        queryClient.setQueryData<TeamDetailRecord>(["team", teamId], {
          ...previousTeam,
          team: {
            ...previousTeam.team,
            recruitment_status: status,
            is_recruiting: status === "open",
          },
        });
      }

      return { previousTeam };
    },
    onError: (_error, _status, context) => {
      if (!teamId || !context?.previousTeam) {
        return;
      }

      queryClient.setQueryData<TeamDetailRecord>(["team", teamId], context.previousTeam);
    },
    onSettled: async () => {
      if (!teamId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team", teamId] }),
        queryClient.invalidateQueries({ queryKey: ["team-members", teamId] }),
      ]);
    },
  });
}

export function useRespondRecruitmentApplication(teamId: string | null, postId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    RecruitmentApplication,
    Error,
    { applicationId: string; decision: RecruitmentDecision },
    RecruitmentApplicationMutationContext
  >({
    mutationFn: (variables) => respondRecruitmentApplication(variables.applicationId, variables.decision),
    onMutate: async (variables) => {
      if (!postId) {
        return {};
      }

      await queryClient.cancelQueries({ queryKey: ["team-recruitment-applications", postId] });
      const previousApplications = queryClient.getQueryData<RecruitmentApplication[]>([
        "team-recruitment-applications",
        postId,
      ]);

      queryClient.setQueryData<RecruitmentApplication[]>(["team-recruitment-applications", postId], (current) =>
        (current ?? []).filter((item) => item.id !== variables.applicationId),
      );

      return { previousApplications };
    },
    onError: (_error, _variables, context) => {
      if (!postId || !context?.previousApplications) {
        return;
      }

      queryClient.setQueryData<RecruitmentApplication[]>(
        ["team-recruitment-applications", postId],
        context.previousApplications,
      );
    },
    onSettled: async () => {
      const tasks: Promise<unknown>[] = [];

      if (postId) {
        tasks.push(queryClient.invalidateQueries({ queryKey: ["team-recruitment-applications", postId] }));
      }

      if (teamId) {
        tasks.push(queryClient.invalidateQueries({ queryKey: ["team-members", teamId] }));
        tasks.push(queryClient.invalidateQueries({ queryKey: ["team", teamId] }));
        tasks.push(queryClient.invalidateQueries({ queryKey: ["team-recruitment-posts", teamId] }));
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }
    },
  });
}