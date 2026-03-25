import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { getMembershipBadgeLabel, getTeamHubCopy } from "@/constants/team-hub";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import type { TeamRosterMemberRecord } from "@/types/team.types";

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "?";
}

function getSinceYear(): string {
  return String(new Date().getFullYear());
}

function formatSchedule(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeamDetailScreen(): JSX.Element {
  const { teamId } = useLocalSearchParams<{ teamId?: string }>();
  const normalizedTeamId = typeof teamId === "string" ? teamId : null;
  const { language } = useI18n();
  const copy = getTeamHubCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute } = useProfile({ enabled: isAuthenticated });
  const { teamDetail, isTeamDetailLoading, teamDetailErrorMessage } = useTeamDetail(normalizedTeamId, {
    enabled: isAuthenticated && hasProfile && !!normalizedTeamId,
  });
  const { matches, isMatchesLoading, matchErrorMessage } = useTeamMatches(normalizedTeamId, {
    enabled: isAuthenticated && hasProfile && !!normalizedTeamId,
  });
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const regionLabel = useMemo(() => {
    if (!teamDetail) {
      return "-";
    }

    const provinceLabel = getOptionLabel(provinceOptions, teamDetail.team.province_code) ?? teamDetail.team.province_code;
    const districtLabel = getOptionLabel(getDistrictOptions(teamDetail.team.province_code), teamDetail.team.district_code) ?? teamDetail.team.district_code;
    return `${provinceLabel} / ${districtLabel}`;
  }, [provinceOptions, teamDetail]);

  const memberCount = teamDetail?.members.length ?? 0;
  const managerCount = teamDetail?.members.filter((member) => member.role === "owner" || member.role === "manager").length ?? 0;
  const latestMatch = matches[0] ?? null;
  const matchCount = matches.length;

  const renderMember = (member: TeamRosterMemberRecord): JSX.Element => {
    const memberName = member.profile?.display_name?.trim() || copy.hiddenMember;
    const badgeLabel = getMembershipBadgeLabel(language, member.role);

    return (
      <View key={member.id} style={styles.memberRow}>
        <View style={styles.memberIdentity}>
          {member.profile?.avatar_url ? (
            <Image source={{ uri: member.profile.avatar_url }} style={styles.memberAvatar} />
          ) : (
            <View style={styles.memberAvatarFallback}>
              <Text style={styles.memberAvatarFallbackText}>{getInitial(memberName)}</Text>
            </View>
          )}
          <View style={styles.memberTextWrap}>
            <Text style={styles.memberName}>{memberName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeLabel}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.memberChevron}>{">"}</Text>
      </View>
    );
  };

  if (isAuthLoading || isProfileLoading || isTeamDetailLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{copy.dashboardSubtitle}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{copy.dashboardSubtitle}</Text>
          <PrimaryButton label={copy.registerMatch} onPress={() => router.replace(nextOnboardingRoute)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!teamDetail) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{teamDetailErrorMessage ?? "Team detail is unavailable."}</Text>
          <PrimaryButton label={copy.rosterButton} onPress={() => router.replace("/(tabs)/teams")} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconButtonText}>{"<"}</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton} onPress={() => router.replace("/(tabs)/teams")}>
              <Text style={styles.iconButtonText}>{copy.shareAction}</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => router.push("/(team)/create")}>
              <Text style={styles.iconButtonText}>{copy.editAction}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroRegion}>{regionLabel}</Text>
            <Text style={styles.heroSince}>Since {getSinceYear()}</Text>
          </View>

          <View style={styles.heroCenterRow}>
            <View style={styles.heroAvatarShell}>
              {teamDetail.team.emblem_url ? (
                <Image source={{ uri: teamDetail.team.emblem_url }} style={styles.heroAvatar} />
              ) : (
                <View style={styles.heroAvatarFallback}>
                  <Text style={styles.heroAvatarFallbackText}>{getInitial(teamDetail.team.name)}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.heroTitle}>{teamDetail.team.name}</Text>
          <Text style={styles.heroSubtitle}>{teamDetail.team.description?.trim() || copy.dashboardSubtitle}</Text>

          <View style={styles.chipRow}>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>{copy.statRecruiting}</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>{teamDetail.team.is_recruiting ? "ON" : "OFF"}</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>{teamDetail.team.visibility}</Text></View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>{copy.summaryTitle}</Text>
          <Text style={styles.sectionSubtitle}>{copy.summarySubtitle}</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}><Text style={styles.statValue}>{memberCount}</Text><Text style={styles.statLabel}>{copy.statMembers}</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{managerCount}</Text><Text style={styles.statLabel}>{copy.statManagers}</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{matchCount}</Text><Text style={styles.statLabel}>{copy.statMatches}</Text></View>
            <View style={styles.statItem}><Text style={styles.statValue}>{teamDetail.currentMembership ? getMembershipBadgeLabel(language, teamDetail.currentMembership.role) : "-"}</Text><Text style={styles.statLabel}>{copy.myRoleLabel}</Text></View>
          </View>
        </View>

        <View style={styles.actionPanel}>
          <Text style={styles.sectionTitle}>{copy.matchHubTitle}</Text>
          <Text style={styles.sectionSubtitle}>{copy.matchHubSubtitle}</Text>
          <View style={styles.actionGrid}>
            <PrimaryButton
              label={copy.registerMatch}
              onPress={() => router.push({ pathname: "/(team)/match-create", params: { teamId: teamDetail.team.id, teamName: teamDetail.team.name } })}
            />
            <PrimaryButton
              label={copy.voteButton}
              variant="outline"
              isDisabled={!latestMatch}
              onPress={() => latestMatch ? router.push({ pathname: "/(team)/match-vote", params: { teamId: teamDetail.team.id, teamName: teamDetail.team.name, matchId: latestMatch.match.id, quarterCount: String(latestMatch.match.quarter_count) } }) : undefined}
            />
            <PrimaryButton
              label={copy.lineupButton}
              variant="outline"
              isDisabled={!latestMatch}
              onPress={() => latestMatch ? router.push({ pathname: "/(team)/match-lineup", params: { teamId: teamDetail.team.id, teamName: teamDetail.team.name, matchId: latestMatch.match.id, quarterCount: String(latestMatch.match.quarter_count), quarterMinutes: String(latestMatch.match.quarter_minutes) } }) : undefined}
            />
            <PrimaryButton label={copy.shareCodeButton} onPress={() => router.replace("/(tabs)/teams")} variant="secondary" />
          </View>
        </View>

        <View style={styles.matchCard}>
          <Text style={styles.sectionTitle}>{copy.matchHubTitle}</Text>
          {matchErrorMessage ? <Text style={styles.errorText}>{matchErrorMessage}</Text> : null}
          {isMatchesLoading ? <Text style={styles.sectionSubtitle}>{copy.matchHubSubtitle}</Text> : null}
          {latestMatch ? (
            <>
              <Text style={styles.emptyTitle}>{latestMatch.opponentDisplayName}</Text>
              <Text style={styles.emptySubtitle}>{formatSchedule(latestMatch.match.scheduled_at)} / {latestMatch.match.venue_name?.trim() || copy.venuePlaceholder}</Text>
              <Text style={styles.emptySubtitle}>{latestMatch.match.quarter_count}{copy.quarterPrefix} / {latestMatch.match.quarter_minutes}{copy.perQuarterSuffix}</Text>
              <Text style={styles.emptySubtitle}>O {latestMatch.attendanceSummary.yes} / D {latestMatch.attendanceSummary.late} / X {latestMatch.attendanceSummary.no} / {copy.notVotedTab} {latestMatch.attendanceSummary.unknown}</Text>
              <PrimaryButton
                label={copy.matchDetailTitle}
                onPress={() => router.push({ pathname: "/(team)/match-detail", params: { teamId: teamDetail.team.id, teamName: teamDetail.team.name, matchId: latestMatch.match.id } })}
              />
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>{copy.noMatchTitle}</Text>
              <Text style={styles.emptySubtitle}>{copy.noMatchSubtitle}</Text>
              <PrimaryButton
                label={copy.registerMatch}
                onPress={() => router.push({ pathname: "/(team)/match-create", params: { teamId: teamDetail.team.id, teamName: teamDetail.team.name } })}
              />
            </>
          )}
        </View>

        <View style={styles.rosterCard}>
          <Text style={styles.sectionTitle}>{copy.rosterTitle}</Text>
          <Text style={styles.sectionSubtitle}>{copy.rosterSubtitle}</Text>
          {teamDetail.members.length === 0 ? <Text style={styles.emptySubtitle}>{copy.hiddenMember}</Text> : teamDetail.members.map((member) => renderMember(member))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f6f4ef" },
  scrollContent: { padding: SPACING.screenHorizontal, paddingBottom: 48, gap: SPACING.lg },
  loadingWrap: { flex: 1, paddingHorizontal: SPACING.screenHorizontal, justifyContent: "center", gap: SPACING.md, backgroundColor: "#f6f4ef" },
  loadingText: { fontSize: 16, lineHeight: 24, color: COLORS.textSecondary, textAlign: "center" },
  errorText: { fontSize: 16, lineHeight: 24, color: "#b83a3a", textAlign: "center" },
  headerRow: { paddingTop: SPACING.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerActions: { flexDirection: "row", gap: SPACING.sm },
  iconButton: { minWidth: 52, minHeight: 52, borderRadius: 26, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.md },
  iconButtonText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  heroCard: { marginTop: SPACING.md, borderRadius: 30, backgroundColor: "#171c2a", padding: SPACING.lg },
  heroMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroRegion: { color: "#f6f6f6", fontSize: 15, fontWeight: "600" },
  heroSince: { color: "#d5d7de", fontSize: 15 },
  heroCenterRow: { alignItems: "center", marginTop: 28 },
  heroAvatarShell: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  heroAvatar: { width: 96, height: 96, borderRadius: 48 },
  heroAvatarFallback: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.brandSoft },
  heroAvatarFallbackText: { fontSize: 34, fontWeight: "800", color: COLORS.textPrimary },
  heroTitle: { marginTop: SPACING.lg, textAlign: "center", color: "#ffffff", fontSize: 34, fontWeight: "800" },
  heroSubtitle: { marginTop: SPACING.sm, textAlign: "center", color: "#c4cad6", fontSize: 15, lineHeight: 22 },
  chipRow: { marginTop: SPACING.lg, flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: SPACING.sm },
  infoChip: { borderRadius: 14, backgroundColor: "#2a3040", paddingHorizontal: 14, paddingVertical: 10 },
  infoChipText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  summaryCard: { borderRadius: 28, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.md },
  sectionTitle: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  statItem: { width: "47%", borderRadius: 22, backgroundColor: "#f5f8ff", paddingVertical: 18, paddingHorizontal: 16, gap: 6 },
  statValue: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  statLabel: { fontSize: 14, color: COLORS.textSecondary },
  actionPanel: { borderRadius: 28, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.md },
  actionGrid: { gap: SPACING.sm },
  matchCard: { borderRadius: 28, backgroundColor: "#eaf0fb", padding: SPACING.lg, gap: SPACING.md },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary },
  emptySubtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  rosterCard: { borderRadius: 28, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.md },
  memberRow: { borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#fbfcff", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  memberIdentity: { flexDirection: "row", alignItems: "center", gap: SPACING.md, flex: 1 },
  memberAvatar: { width: 56, height: 56, borderRadius: 28 },
  memberAvatarFallback: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.brandSoft },
  memberAvatarFallbackText: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
  memberTextWrap: { gap: 6, flex: 1 },
  memberName: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  badge: { alignSelf: "flex-start", borderRadius: 12, backgroundColor: "#ffe07a", paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontWeight: "800", color: "#5a4300" },
  memberChevron: { fontSize: 28, color: COLORS.textMuted },
});