import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { getTeamRoleLabel, getTeamUiCopy, getTeamVisibilityOptions } from "@/constants/team-ui";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";
import type { CreateTeamInviteResult, TeamMembershipRecord } from "@/types/team.types";

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export default function TeamsScreen(): JSX.Element {
  const { language } = useI18n();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const copy = getTeamUiCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute } = useProfile({ enabled: isAuthenticated });
  const {
    teams,
    isTeamsLoading,
    isSubmittingTeam,
    teamErrorMessage,
    teamStatusMessage,
    loadMyTeams,
    createTeamInvite,
  } = useTeams({
    enabled: isAuthenticated && hasProfile,
  });
  const [inviteMap, setInviteMap] = useState<Record<string, CreateTeamInviteResult>>({});
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);
  const visibilityOptions = useMemo(() => getTeamVisibilityOptions(language), [language]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (isAuthenticated && hasProfile) {
      void loadMyTeams();
    }
  }, [hasProfile, isAuthenticated, refresh]);

  const getRegionLabel = (membership: TeamMembershipRecord): string => {
    const provinceLabel =
      getOptionLabel(provinceOptions, membership.team.province_code) ?? membership.team.province_code;
    const districtLabel =
      getOptionLabel(getDistrictOptions(membership.team.province_code), membership.team.district_code) ??
      membership.team.district_code;

    return `${provinceLabel} / ${districtLabel}`;
  };

  const handleCreateInvite = async (teamId: string): Promise<void> => {
    try {
      const result = await createTeamInvite(teamId);
      setInviteMap((previous) => ({
        ...previous,
        [teamId]: result,
      }));
    } catch {
      // hook-level message is rendered below
    }
  };

  const renderContent = (): JSX.Element => {
    if (isAuthLoading || isProfileLoading || isTeamsLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.listTitle}</Text>
          <Text style={styles.subtitle}>{copy.loading}</Text>
        </View>
      );
    }

    if (!hasProfile) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.listTitle}</Text>
          <Text style={styles.subtitle}>{copy.needProfileTitle}</Text>
          <View style={styles.card}>
            <Text style={styles.value}>{copy.needProfileHelper}</Text>
            <PrimaryButton label={copy.continueOnboarding} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={copy.goHome} variant="outline" onPress={() => router.replace("/")} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{copy.listTitle}</Text>
        <Text style={styles.subtitle}>{copy.listSubtitle}</Text>
        <View style={styles.topActions}>
          <PrimaryButton label={copy.createButton} onPress={() => router.push("/(team)/create")} />
          <PrimaryButton label={copy.joinButton} onPress={() => router.push("/(team)/join")} variant="outline" />
        </View>

        {teams.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.value}>{copy.emptySubtitle}</Text>
          </View>
        ) : (
          teams.map((membership) => {
            const visibilityLabel = getOptionLabel(visibilityOptions, membership.team.visibility) ?? copy.notSet;
            const joinedAt = formatDate(membership.joined_at);
            const inviteInfo = inviteMap[membership.team.id];
            const isTeamManager = membership.role === "owner" || membership.role === "manager";

            return (
              <View key={membership.id} style={styles.card}>
                <Text style={styles.sectionTitle}>{membership.team.name}</Text>
                <Text style={styles.value}>{getRegionLabel(membership)}</Text>
                {membership.team.description ? <Text style={styles.value}>{membership.team.description}</Text> : null}
                <Text style={styles.value}>{`${copy.rolePrefix}: ${getTeamRoleLabel(language, membership.role)}`}</Text>
                <Text style={styles.value}>{`${copy.visibilityPrefix}: ${visibilityLabel}`}</Text>
                <Text style={styles.value}>{membership.team.is_recruiting ? copy.recruitingOpen : copy.recruitingClosed}</Text>
                {joinedAt ? <Text style={styles.value}>{`${copy.joinedAtPrefix}: ${joinedAt}`}</Text> : null}

                <View style={styles.cardActions}>
                  <PrimaryButton
                    label={copy.detailButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(team)/[teamId]",
                        params: { teamId: membership.team.id },
                      })
                    }
                    variant="outline"
                  />
                  {isTeamManager ? (
                    <PrimaryButton
                      label={isSubmittingTeam ? copy.inviteCreating : copy.inviteButton}
                      onPress={() => void handleCreateInvite(membership.team.id)}
                      isDisabled={isSubmittingTeam}
                      variant="secondary"
                    />
                  ) : null}
                </View>

                {inviteInfo ? (
                  <View style={styles.inviteInfoCard}>
                    <Text style={styles.value}>{`${copy.inviteCodePrefix}: ${inviteInfo.invite_code}`}</Text>
                    {inviteInfo.expires_at ? (
                      <Text style={styles.value}>{`${copy.inviteExpiresPrefix}: ${formatDate(inviteInfo.expires_at) ?? inviteInfo.expires_at}`}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        {teamStatusMessage ? <Text style={styles.statusText}>{teamStatusMessage}</Text> : null}
        {teamErrorMessage ? <Text style={styles.errorText}>{teamErrorMessage}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  topActions: { marginTop: SPACING.xl, gap: SPACING.md },
  card: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  value: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  cardActions: { marginTop: SPACING.sm, gap: SPACING.sm },
  inviteInfoCard: {
    marginTop: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fffdf8",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statusText: {
    marginTop: SPACING.lg,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.brand,
  },
  errorText: {
    marginTop: SPACING.lg,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b83a3a",
  },
});