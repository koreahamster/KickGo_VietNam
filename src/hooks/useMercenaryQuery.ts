import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyMercenary,
  closeMercenaryPost,
  createMercenaryPost,
  getAcceptedMercenariesForMatch,
  getMercenaryPostDetail,
  getMercenaryPosts,
  getMyApplications,
  getTeamMercenaryPosts,
  respondMercenaryApplication,
} from "@/services/mercenary.service";
import type {
  ApplyMercenaryRequest,
  CreateMercenaryPostRequest,
  MercenaryApplication,
  MercenaryPositionFilter,
  MercenaryPost,
  MercenaryPostDetail,
  RespondMercenaryRequest,
} from "@/types/mercenary.types";

type RespondContext = {
  previousDetail?: MercenaryPostDetail | undefined;
};

export function useMercenaryPosts(provinceCode: string | null, position?: MercenaryPositionFilter) {
  return useQuery<MercenaryPost[]>({
    queryKey: ["mercenary-posts", { provinceCode, position: position ?? null }],
    queryFn: () => {
      if (!provinceCode) {
        throw new Error("Province code is required.");
      }
      return getMercenaryPosts(provinceCode, position);
    },
    enabled: Boolean(provinceCode),
  });
}

export function useTeamMercenaryPosts(teamId: string | null, enabled = true) {
  return useQuery<MercenaryPost[]>({
    queryKey: ["team-mercenary-posts", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getTeamMercenaryPosts(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useMercenaryPostDetail(postId: string | null, enabled = true) {
  return useQuery<MercenaryPostDetail>({
    queryKey: ["mercenary-post", postId],
    queryFn: () => {
      if (!postId) {
        throw new Error("Post id is required.");
      }
      return getMercenaryPostDetail(postId);
    },
    enabled: enabled && Boolean(postId),
  });
}

export function useMyApplications(userId: string | null, enabled = true) {
  return useQuery<MercenaryApplication[]>({
    queryKey: ["my-applications", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User id is required.");
      }
      return getMyApplications(userId);
    },
    enabled: enabled && Boolean(userId),
  });
}

export function useCreateMercenaryPost() {
  const queryClient = useQueryClient();

  return useMutation<MercenaryPost, Error, CreateMercenaryPostRequest>({
    mutationFn: (request) => createMercenaryPost(request),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team-mercenary-posts", variables.team_id] }),
        queryClient.invalidateQueries({ queryKey: ["mercenary-posts"] }),
      ]);
    },
  });
}

export function useApplyMercenary() {
  const queryClient = useQueryClient();

  return useMutation<MercenaryApplication, Error, ApplyMercenaryRequest>({
    mutationFn: (request) => applyMercenary(request),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mercenary-post", variables.post_id] }),
        queryClient.invalidateQueries({ queryKey: ["mercenary-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["team-mercenary-posts"] }),
      ]);
    },
  });
}

export function useRespondMercenaryApplication() {
  const queryClient = useQueryClient();

  return useMutation<MercenaryApplication, Error, { postId: string; request: RespondMercenaryRequest }, RespondContext>({
    mutationFn: ({ request }) => respondMercenaryApplication(request),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["mercenary-post", variables.postId] });
      const previousDetail = queryClient.getQueryData<MercenaryPostDetail>(["mercenary-post", variables.postId]);

      queryClient.setQueryData<MercenaryPostDetail | undefined>(["mercenary-post", variables.postId], (current) => {
        if (!current) {
          return current;
        }

        const nextStatus: MercenaryApplication["status"] = variables.request.decision === "accept" ? "accepted" : "rejected";
        const nextApplications: MercenaryApplication[] = current.applications.map((item) =>
          item.id === variables.request.application_id ? { ...item, status: nextStatus } : item,
        );
        const acceptedCount = nextApplications.filter((item) => item.status === "accepted").length;

        return {
          ...current,
          post: {
            ...current.post,
            accepted_count: acceptedCount,
            status: acceptedCount >= current.post.needed_count ? "closed" : current.post.status,
          },
          applications: nextApplications,
        };
      });

      return { previousDetail };
    },
    onError: (_error, variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(["mercenary-post", variables.postId], context.previousDetail);
      }
    },
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mercenary-post", variables.postId] }),
        queryClient.invalidateQueries({ queryKey: ["team-mercenary-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["mercenary-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["my-applications"] }),
      ]);
    },
  });
}

export function useCloseMercenaryPost() {
  const queryClient = useQueryClient();

  return useMutation<MercenaryPost, Error, { postId: string; teamId: string }>({
    mutationFn: ({ postId }) => closeMercenaryPost(postId),
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team-mercenary-posts", variables.teamId] }),
        queryClient.invalidateQueries({ queryKey: ["mercenary-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["mercenary-post"] }),
      ]);
    },
  });
}

export function useAcceptedMercenaries(teamId: string | null, matchId: string | null, enabled = true) {
  return useQuery<MercenaryApplication[]>({
    queryKey: ["accepted-mercenaries", teamId, matchId],
    queryFn: () => {
      if (!teamId || !matchId) {
        throw new Error("Team id and match id are required.");
      }
      return getAcceptedMercenariesForMatch(teamId, matchId);
    },
    enabled: enabled && Boolean(teamId) && Boolean(matchId),
  });
}


