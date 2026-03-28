import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import TeamRecruitmentManagerCard from "@/features/team-recruitment/components/TeamRecruitmentManagerCard";
import { getTeamRecruitmentCopy } from "@/features/team-recruitment/team-recruitment.copy";
import TeamMemberActionSheet from "@/features/team-members/components/TeamMemberActionSheet";
import TeamMemberCard, { getRoleTone } from "@/features/team-members/components/TeamMemberCard";
import TeamMemberKickDialog from "@/features/team-members/components/TeamMemberKickDialog";
import TeamMemberSectionHeader from "@/features/team-members/components/TeamMemberSectionHeader";
import { TEAM_MEMBERS_COPY, getTeamMemberRoleLabel } from "@/features/team-members/team-members.copy";
import {
  buildTeamMembersListItems,
  getTeamMemberDisplayName,
  getTeamMembersLocale,
  type TeamMembersListItem,
} from "@/features/team-members/team-members.helpers";
import { useAuth } from "@/hooks/useAuth";
import { useRecruitmentApplications, useRecruitmentPosts, useUpdateRecruitmentStatus } from "@/hooks/useTeamRecruitmentQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";
import { kickTeamMember, updateTeamMemberRole } from "@/services/team.service";
import type { ManageableTeamMemberRole, TeamRecruitmentStatus, TeamRosterMemberRecord } from "@/types/team.types";

type SquadNumberOption = {
  value: number | null;
  label: string;
  assigneeName: string | null;
  disabled: boolean;
};

export default function TeamMembersScreen(): JSX.Element {
  const { language } = useI18n();
  const locale = getTeamMembersLocale(language);
  const copy = TEAM_MEMBERS_COPY[locale];
  const recruitmentCopy = getTeamRecruitmentCopy(language);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { teamId: rawTeamId } = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(rawTeamId) ? rawTeamId[0] ?? null : rawTeamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const [selectedMember, setSelectedMember] = useState<TeamRosterMemberRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<ManageableTeamMemberRole>("player");
  const [selectedSquadNumber, setSelectedSquadNumber] = useState<number | null>(null);
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentRole = membersQuery.data?.currentRole ?? null;
  const canManageRoles = currentRole === "owner" || currentRole === "manager";
  const canKickMembers = currentRole === "owner";
  const canAssignManager = currentRole === "owner";
  const team = detailQuery.data?.team ?? null;

  const recruitmentPostsQuery = useRecruitmentPosts(teamId, Boolean(teamId) && canManageRoles);
  const latestRecruitmentPost = recruitmentPostsQuery.data?.[0] ?? null;
  const recruitmentApplicationsQuery = useRecruitmentApplications(
    latestRecruitmentPost?.id ?? null,
    Boolean(latestRecruitmentPost?.id) && canManageRoles,
  );
  const pendingApplicants = (recruitmentApplicationsQuery.data ?? []).filter((item) => item.status === "pending").length;
  const recruitmentStatusMutation = useUpdateRecruitmentStatus(teamId);

  const listItems = useMemo(
    () => buildTeamMembersListItems(locale, membersQuery.data?.members ?? []),
    [locale, membersQuery.data?.members],
  );

  const squadNumberOptions = useMemo<SquadNumberOption[]>(() => {
    const members = membersQuery.data?.members ?? [];
    const currentMemberId = selectedMember?.id ?? null;
    const currentMemberName = selectedMember ? getTeamMemberDisplayName(locale, selectedMember) : null;
    const currentMemberNumber = selectedMember?.squad_number ?? null;

    const base: SquadNumberOption[] = [
      {
        value: null,
        label: copy.squadNumberNone,
        assigneeName: null,
        disabled: false,
      },
    ];

    for (let number = 1; number <= 99; number += 1) {
      const assignedMember = members.find((member) => member.squad_number === number);
      const isCurrentMemberNumber = assignedMember?.id === currentMemberId && currentMemberNumber === number;
      base.push({
        value: number,
        label: `#${number}`,
        assigneeName: assignedMember ? getTeamMemberDisplayName(locale, assignedMember) : null,
        disabled: Boolean(assignedMember) && !isCurrentMemberNumber,
      });
    }

    return base.map((option) => {
      if (option.value === currentMemberNumber) {
        return {
          ...option,
          assigneeName: currentMemberName,
          disabled: false,
        };
      }
      return option;
    });
  }, [copy.squadNumberNone, locale, membersQuery.data?.members, selectedMember]);

  const roleMutation = useMutation({
    mutationFn: (input: { teamId: string; targetUserId: string; role: ManageableTeamMemberRole; squadNumber: number | null }) =>
      updateTeamMemberRole({
        teamId: input.teamId,
        targetUserId: input.targetUserId,
        role: input.role,
        squadNumber: input.squadNumber,
      }),
    onSuccess: async () => {
      if (teamId) {
        await queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      }
      setFeedbackMessage(copy.roleChanged);
      setIsRoleSheetOpen(false);
      setSelectedMember(null);
      setSelectedSquadNumber(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : copy.errorTitle;
      if (message.includes("SQUAD_NUMBER_TAKEN")) {
        Alert.alert("KickGo", copy.squadNumberSaveError);
        setFeedbackMessage(copy.squadNumberTaken);
        return;
      }
      setFeedbackMessage(message);
    },
  });

  const kickMutation = useMutation({
    mutationFn: (input: { teamId: string; targetUserId: string }) =>
      kickTeamMember({ teamId: input.teamId, targetUserId: input.targetUserId, reason: "Kicked by owner" }),
    onSuccess: async () => {
      if (teamId) {
        await queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      }
      setFeedbackMessage(copy.memberKicked);
      setIsKickDialogOpen(false);
      setIsRoleSheetOpen(false);
      setSelectedMember(null);
      setSelectedSquadNumber(null);
    },
    onError: (error: unknown) => {
      setFeedbackMessage(error instanceof Error ? error.message : copy.errorTitle);
    },
  });

  const handleOpenActions = (member: TeamRosterMemberRecord): void => {
    if (!canManageRoles || member.user_id === user?.id || member.role === "owner") {
      return;
    }

    setSelectedMember(member);
    setSelectedRole(member.role === "captain" ? "captain" : member.role === "manager" ? "manager" : "player");
    setSelectedSquadNumber(member.squad_number ?? null);
    setIsRoleSheetOpen(true);
  };

  const handleApplyRole = async (): Promise<void> => {
    if (!teamId || !selectedMember) {
      return;
    }

    await roleMutation.mutateAsync({
      teamId,
      targetUserId: selectedMember.user_id,
      role: selectedRole,
      squadNumber: selectedSquadNumber,
    });
  };

  const handleConfirmKick = async (): Promise<void> => {
    if (!teamId || !selectedMember) {
      return;
    }

    await kickMutation.mutateAsync({
      teamId,
      targetUserId: selectedMember.user_id,
    });
  };

  const handleRecruitmentStatusChange = async (status: TeamRecruitmentStatus): Promise<void> => {
    try {
      await recruitmentStatusMutation.mutateAsync(status);
      if (status === "open") {
        setFeedbackMessage(recruitmentCopy.updatedOpen);
      } else if (status === "closed") {
        setFeedbackMessage(recruitmentCopy.updatedClosed);
      } else {
        setFeedbackMessage(recruitmentCopy.updatedInviteOnly);
      }
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : recruitmentCopy.updateError);
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<TeamMembersListItem>) => {
    if (item.type === "header") {
      return <TeamMemberSectionHeader count={item.count} title={item.title} />;
    }

    const member = item.member;
    const showActions = canManageRoles && member.user_id !== user?.id && member.role !== "owner";
    const displayName = getTeamMemberDisplayName(locale, member);
    const squadNumberLabel = member.squad_number ? `#${member.squad_number}` : null;

    return (
      <TeamMemberCard
        displayName={displayName}
        member={member}
        onPressActions={() => handleOpenActions(member)}
        roleLabel={getTeamMemberRoleLabel(locale, member.role)}
        roleTone={getRoleTone(member.role)}
        showActions={showActions}
        squadNumberLabel={squadNumberLabel}
      />
    );
  };

  if (membersQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (membersQuery.isError) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>{copy.errorTitle}</Text>
          <Text style={styles.errorBody}>{membersQuery.error instanceof Error ? membersQuery.error.message : copy.errorTitle}</Text>
          <Pressable onPress={() => void membersQuery.refetch()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>{copy.retry}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.contentContainer}
        data={listItems}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={<Text style={styles.emptyText}>{copy.empty}</Text>}
        ListHeaderComponent={
          <>
            {canManageRoles && team ? (
              <TeamRecruitmentManagerCard
                isUpdating={recruitmentStatusMutation.isPending}
                onChangeStatus={(status) => void handleRecruitmentStatusChange(status)}
                onPressApplicants={() => router.push({ pathname: "/(tabs)/team/[teamId]/applicants", params: { teamId } })}
                pendingCount={pendingApplicants}
                team={team}
              />
            ) : null}
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>{copy.screenTitle}</Text>
              <Text style={styles.headerSubtitle}>{copy.screenSubtitle}</Text>
              {feedbackMessage ? <Text style={styles.feedbackText}>{feedbackMessage}</Text> : null}
            </View>
          </>
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <TeamMemberActionSheet
        canAssignManager={canAssignManager}
        canKick={canKickMembers && selectedMember?.user_id !== user?.id}
        isSaving={roleMutation.isPending}
        locale={locale}
        onApply={() => void handleApplyRole()}
        onClose={() => {
          setIsRoleSheetOpen(false);
          setSelectedMember(null);
          setSelectedSquadNumber(null);
        }}
        onKick={() => {
          setIsRoleSheetOpen(false);
          setIsKickDialogOpen(true);
        }}
        onSelectRole={setSelectedRole}
        onSelectSquadNumber={setSelectedSquadNumber}
        selectedRole={selectedRole}
        selectedSquadNumber={selectedSquadNumber}
        squadNumberOptions={squadNumberOptions}
        visible={isRoleSheetOpen}
      />

      <TeamMemberKickDialog
        isSubmitting={kickMutation.isPending}
        locale={locale}
        onCancel={() => setIsKickDialogOpen(false)}
        onConfirm={() => void handleConfirmKick()}
        visible={isKickDialogOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 13,
    color: "#15803d",
    fontWeight: "700",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
  },
  primaryButton: {
    minWidth: 140,
    minHeight: 48,
    marginTop: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
