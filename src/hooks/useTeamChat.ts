import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { useProfile } from "@/hooks/useProfile";
import {
  fetchTeamChatMessages,
  getTeamChatMessageById,
  sendTeamChatMessage,
  subscribeToTeamChatMessages,
} from "@/services/team-chat.service";
import type { SendTeamChatMessageInput, TeamChatMessagePage, TeamChatMessageRecord } from "@/types/team-chat.types";

type UseTeamChatResult = {
  currentUserId: string | null;
  messages: TeamChatMessageRecord[];
  isTeamChatLoading: boolean;
  teamChatErrorMessage: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isSendingMessage: boolean;
  loadOlderMessages: () => Promise<void>;
  sendMessage: (input: SendTeamChatMessageInput) => Promise<void>;
  refetchMessages: () => Promise<void>;
};

function mergeIntoNewestPage(
  current: InfiniteData<TeamChatMessagePage, string | null> | undefined,
  message: TeamChatMessageRecord,
): InfiniteData<TeamChatMessagePage, string | null> {
  if (!current) {
    return {
      pages: [
        {
          messages: [message],
          nextCursor: null,
        },
      ],
      pageParams: [null],
    };
  }

  const alreadyExists = current.pages.some((page) => page.messages.some((item) => item.id === message.id));

  if (alreadyExists) {
    return current;
  }

  const [firstPage, ...restPages] = current.pages;

  return {
    ...current,
    pages: [
      {
        ...firstPage,
        messages: [message, ...firstPage.messages],
      },
      ...restPages,
    ],
  };
}

function getErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load team chat.";
}

export function useTeamChat(teamId: string | null): UseTeamChatResult {
  const queryClient = useQueryClient();
  const { profileBundle } = useProfile();
  const currentUserId = profileBundle.profile?.id ?? null;
  const queryKey = useMemo(() => ["team-chat", teamId] as const, [teamId]);

  const teamChatQuery = useInfiniteQuery({
    queryKey,
    enabled: Boolean(teamId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchTeamChatMessages(teamId as string, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (input: SendTeamChatMessageInput) => sendTeamChatMessage(input),
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<TeamChatMessagePage, string | null>>(queryKey, (current) =>
        mergeIntoNewestPage(current, message),
      );
    },
  });

  useEffect(() => {
    if (!teamId) {
      return;
    }

    const unsubscribe = subscribeToTeamChatMessages(teamId, (messageId) => {
      void (async () => {
        const message = await getTeamChatMessageById(messageId);

        if (!message) {
          return;
        }

        queryClient.setQueryData<InfiniteData<TeamChatMessagePage, string | null>>(queryKey, (current) =>
          mergeIntoNewestPage(current, message),
        );
      })();
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, queryKey, teamId]);

  const messages = useMemo(
    () => teamChatQuery.data?.pages.flatMap((page) => page.messages) ?? [],
    [teamChatQuery.data],
  );

  return {
    currentUserId,
    messages,
    isTeamChatLoading: teamChatQuery.isLoading,
    teamChatErrorMessage: getErrorMessage(teamChatQuery.error) ?? getErrorMessage(sendMessageMutation.error),
    hasNextPage: Boolean(teamChatQuery.hasNextPage),
    isFetchingNextPage: teamChatQuery.isFetchingNextPage,
    isSendingMessage: sendMessageMutation.isPending,
    loadOlderMessages: async () => {
      if (!teamChatQuery.hasNextPage || teamChatQuery.isFetchingNextPage) {
        return;
      }

      await teamChatQuery.fetchNextPage();
    },
    sendMessage: async (input) => {
      await sendMessageMutation.mutateAsync(input);
    },
    refetchMessages: async () => {
      await teamChatQuery.refetch();
    },
  };
}