import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTeamAnnouncement,
  getTeamAnnouncementDetail,
  getTeamAnnouncements,
  toggleAnnouncementPin,
} from "@/services/team.service";
import type { CreateAnnouncementRequest, TeamAnnouncement, TogglePinRequest } from "@/types/team.types";

type AnnouncementMutationContext = {
  previousList: TeamAnnouncement[] | undefined;
  previousDetail?: TeamAnnouncement | undefined;
};

export function useTeamAnnouncements(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team-announcements", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }

      return getTeamAnnouncements(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useTeamAnnouncementDetail(teamId: string | null, announcementId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team-announcement", teamId, announcementId],
    queryFn: () => {
      if (!teamId || !announcementId) {
        throw new Error("Announcement detail requires team id and announcement id.");
      }

      return getTeamAnnouncementDetail(teamId, announcementId);
    },
    enabled: enabled && Boolean(teamId) && Boolean(announcementId),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation<TeamAnnouncement, Error, CreateAnnouncementRequest, AnnouncementMutationContext>({
    mutationFn: (request: CreateAnnouncementRequest) => createTeamAnnouncement(request),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["team-announcements", variables.team_id] });

      const previousList = queryClient.getQueryData<TeamAnnouncement[]>(["team-announcements", variables.team_id]);
      const optimisticItem: TeamAnnouncement = {
        id: `optimistic-${Date.now()}`,
        team_id: variables.team_id,
        author_id: "",
        title: variables.title,
        body: variables.body,
        is_pinned: variables.is_pinned,
        created_at: new Date().toISOString(),
        author_display_name: null,
      };

      queryClient.setQueryData<TeamAnnouncement[]>(["team-announcements", variables.team_id], (current) => {
        const next = [optimisticItem, ...(current ?? [])];
        return next.sort((left, right) => {
          if (left.is_pinned !== right.is_pinned) {
            return left.is_pinned ? -1 : 1;
          }

          return right.created_at.localeCompare(left.created_at);
        });
      });

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["team-announcements", variables.team_id], context.previousList);
      }
    },
    onSettled: async (_result, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team-announcements", variables.team_id] }),
        queryClient.invalidateQueries({ queryKey: ["team", variables.team_id] }),
      ]);
    },
  });
}

type TogglePinVariables = {
  teamId: string;
  request: TogglePinRequest;
};

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation<TeamAnnouncement, Error, TogglePinVariables, AnnouncementMutationContext>({
    mutationFn: ({ request }: TogglePinVariables) => toggleAnnouncementPin(request),
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["team-announcements", variables.teamId] }),
        queryClient.cancelQueries({ queryKey: ["team-announcement", variables.teamId, variables.request.announcement_id] }),
      ]);

      const previousList = queryClient.getQueryData<TeamAnnouncement[]>(["team-announcements", variables.teamId]);
      const previousDetail = queryClient.getQueryData<TeamAnnouncement>([
        "team-announcement",
        variables.teamId,
        variables.request.announcement_id,
      ]);

      queryClient.setQueryData<TeamAnnouncement[]>(["team-announcements", variables.teamId], (current) => {
        const next = (current ?? []).map((item) =>
          item.id === variables.request.announcement_id ? { ...item, is_pinned: !item.is_pinned } : item,
        );

        return next.sort((left, right) => {
          if (left.is_pinned !== right.is_pinned) {
            return left.is_pinned ? -1 : 1;
          }

          return right.created_at.localeCompare(left.created_at);
        });
      });

      queryClient.setQueryData<TeamAnnouncement | undefined>(
        ["team-announcement", variables.teamId, variables.request.announcement_id],
        (current) => (current ? { ...current, is_pinned: !current.is_pinned } : current),
      );

      return { previousList, previousDetail };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["team-announcements", variables.teamId], context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ["team-announcement", variables.teamId, variables.request.announcement_id],
          context.previousDetail,
        );
      }
    },
    onSettled: async (updatedAnnouncement, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team-announcements", variables.teamId] }),
        queryClient.invalidateQueries({
          queryKey: ["team-announcement", variables.teamId, updatedAnnouncement?.id ?? variables.request.announcement_id],
        }),
        queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] }),
      ]);
    },
  });
}
