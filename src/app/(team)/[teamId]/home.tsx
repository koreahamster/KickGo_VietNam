import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getRoleBadgeLabel } from "@/constants/profile-dashboard";
import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";

const HEADER_BG = "#161827";
const PAGE_BG = "#eff1f7";
const CARD_BG = "#ffffff";
const TEXT_DARK = "#111827";
const TEXT_SOFT = "#6b7280";
const GREEN = "#0f766e";
const OWNER_BG = "#fde68a";
const OWNER_TEXT = "#92400e";
const BLUE = "#3b82f6";

const COPY = {
  ko: {
    subtitle: "\uD300 \uC6B4\uC601 \uD604\uD669\uACFC \uD604\uC7AC \uBA64\uBC84 \uAD6C\uC131\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.",
    memberCountSuffix: "\uBA85\uC758 \uD65C\uC131 \uBA64\uBC84",
    quickChat: "\uD300 \uCC44\uD305",
    quickMatches: "\uB9E4\uCE58",
    quickAnnouncements: "\uACF5\uC9C0",
    quickEdit: "\uC815\uBCF4 \uC218\uC815",
    introTitle: "\uD300 \uC18C\uAC1C",
    membersTitle: "\uD604\uC7AC \uBA64\uBC84",
    emptyMembers: "\uC544\uC9C1 \uD65C\uC131 \uBA64\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    recruitingOpen: "\uBAA8\uC9D1 \uC911",
    recruitingClosed: "\uBAA8\uC9D1 \uC885\uB8CC",
    teamList: "\uD300 \uBAA9\uB85D",
    privateMember: "\uBE44\uACF5\uAC1C \uBA64\uBC84",
    noDescription: "\uB4F1\uB85D\uB41C \uD300 \uC18C\uAC1C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    shareError: "\uACF5\uC720\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
    detailError: "\uD300 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
    comingSoon: "\uD574\uB2F9 \uAE30\uB2A5\uC740 \uB2E4\uC74C \uB2E8\uACC4\uC5D0\uC11C \uC5F0\uACB0\uB429\uB2C8\uB2E4.",
    loading: "\uD300 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911...",
  },
  vi: {
    subtitle: "Xem thong tin doi va danh sach thanh vien hien tai.",
    memberCountSuffix: "thanh vien dang hoat dong",
    quickChat: "Chat doi",
    quickMatches: "Tran dau",
    quickAnnouncements: "Thong bao",
    quickEdit: "Sua thong tin",
    introTitle: "Gioi thieu doi",
    membersTitle: "Thanh vien hien tai",
    emptyMembers: "Chua co thanh vien dang hoat dong.",
    recruitingOpen: "Dang tuyen",
    recruitingClosed: "Tam dong tuyen",
    teamList: "Danh sach doi",
    privateMember: "Thanh vien rieng tu",
    noDescription: "Chua co mo ta doi bong.",
    shareError: "Khong the chia se luc nay.",
    detailError: "Khong the tai thong tin doi.",
    comingSoon: "Tinh nang nay se duoc hoan thien o buoc tiep theo.",
    loading: "Dang tai thong tin doi...",
  },
  en: {
    subtitle: "Review team status and the current member lineup.",
    memberCountSuffix: "active members",
    quickChat: "Team chat",
    quickMatches: "Matches",
    quickAnnouncements: "Announcements",
    quickEdit: "Edit team",
    introTitle: "About this team",
    membersTitle: "Current members",
    emptyMembers: "There are no active members yet.",
    recruitingOpen: "Recruiting",
    recruitingClosed: "Closed",
    teamList: "Team list",
    privateMember: "Private member",
    noDescription: "No team introduction has been registered yet.",
    shareError: "Unable to share right now.",
    detailError: "Could not load the team detail.",
    comingSoon: "This feature will be connected in the next step.",
    loading: "Loading team detail...",
  },
} as const;

export default function TeamHomeScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];
  const { teamId: rawTeamId } = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(rawTeamId) ? rawTeamId[0] ?? null : rawTeamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);

  const handleShare = async (): Promise<void> => {
    if (!detailQuery.data) {
      return;
    }

    try {
      await Share.share({
        message: `${detailQuery.data.team.name} - KickGo`,
      });
    } catch {
      Alert.alert("KickGo", copy.shareError);
    }
  };

  const handleComingSoon = (): void => {
    Alert.alert("KickGo", copy.comingSoon);
  };

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detailQuery.data) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>{copy.detailError}</Text>
          <Text style={styles.errorBody}>{detailQuery.error instanceof Error ? detailQuery.error.message : copy.detailError}</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace("/(tabs)/team")}>
            <Text style={styles.primaryButtonLabel}>{copy.teamList}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { team, currentMembership, members } = detailQuery.data;
  const provinceLabel = getOptionLabel(provinceOptions, team.province_code) ?? team.province_code;
  const districtLabel = getOptionLabel(getDistrictOptions(team.province_code), team.district_code) ?? team.district_code;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.topRow}>
            <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons color="#ffffff" name="chevron-back" size={24} />
            </Pressable>
            <View style={styles.topActions}>
              <Pressable hitSlop={12} onPress={() => void handleShare()} style={styles.iconButton}>
                <Ionicons color="#ffffff" name="share-social-outline" size={22} />
              </Pressable>
              <Pressable
                hitSlop={12}
                onPress={() => router.push({ pathname: "/(team)/[teamId]/chat", params: { teamId: team.id } })}
                style={styles.iconButton}
              >
                <Ionicons color="#ffffff" name="chatbubble-ellipses-outline" size={22} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{team.name}</Text>
                <Text style={styles.heroSubtitle}>{copy.subtitle}</Text>
                <View style={styles.heroTagRow}>
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagLabel}>{provinceLabel}</Text>
                  </View>
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagLabel}>{districtLabel}</Text>
                  </View>
                  <View style={[styles.heroTag, team.is_recruiting ? styles.heroTagRecruiting : styles.heroTagClosed]}>
                    <Text style={[styles.heroTagLabel, team.is_recruiting ? styles.heroTagRecruitingLabel : styles.heroTagClosedLabel]}>
                      {team.is_recruiting ? copy.recruitingOpen : copy.recruitingClosed}
                    </Text>
                  </View>
                </View>
              </View>
              {team.emblem_url ? (
                <Image source={{ uri: team.emblem_url }} style={styles.emblemImage} />
              ) : (
                <View style={styles.emblemFallback}>
                  <Text style={styles.emblemFallbackLabel}>{team.name.slice(0, 1).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bodyWrap}>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>{copy.membersTitle}</Text>
            <Text style={styles.summaryValue}>{`${members.length} ${copy.memberCountSuffix}`}</Text>
            {currentMembership ? (
              <View style={styles.rolePill}>
                <Text style={styles.rolePillLabel}>{getRoleBadgeLabel(language, currentMembership.role)}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.quickGrid}>
            <Pressable style={styles.quickCard} onPress={() => router.push({ pathname: "/(team)/[teamId]/chat", params: { teamId: team.id } })}>
              <Ionicons color={GREEN} name="chatbubble-ellipses-outline" size={20} />
              <Text style={styles.quickCardLabel}>{copy.quickChat}</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={handleComingSoon}>
              <Ionicons color={GREEN} name="calendar-outline" size={20} />
              <Text style={styles.quickCardLabel}>{copy.quickMatches}</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={handleComingSoon}>
              <Ionicons color={GREEN} name="megaphone-outline" size={20} />
              <Text style={styles.quickCardLabel}>{copy.quickAnnouncements}</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={handleComingSoon}>
              <Ionicons color={GREEN} name="create-outline" size={20} />
              <Text style={styles.quickCardLabel}>{copy.quickEdit}</Text>
            </Pressable>
          </View>

          <View style={styles.whiteCard}>
            <Text style={styles.sectionTitle}>{copy.introTitle}</Text>
            <Text style={styles.bodyText}>{team.description?.trim() ? team.description : copy.noDescription}</Text>
          </View>

          <View style={styles.whiteCard}>
            <Text style={styles.sectionTitle}>{copy.membersTitle}</Text>
            {members.length === 0 ? (
              <Text style={styles.bodyText}>{copy.emptyMembers}</Text>
            ) : (
              <View style={styles.memberList}>
                {members.map((member, index) => (
                  <View key={member.id}>
                    <View style={styles.memberRow}>
                      {member.profile?.avatar_url ? (
                        <Image source={{ uri: member.profile.avatar_url }} style={styles.memberAvatar} />
                      ) : (
                        <View style={styles.memberAvatarFallback}>
                          <Text style={styles.memberAvatarFallbackLabel}>
                            {(member.profile?.display_name ?? copy.privateMember).slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.memberMeta}>
                        <Text style={styles.memberName}>{member.profile?.display_name ?? copy.privateMember}</Text>
                        <Text style={styles.memberRole}>{getRoleBadgeLabel(language, member.role)}</Text>
                      </View>
                      {member.squad_number ? <Text style={styles.squadNumber}>{member.squad_number}</Text> : null}
                    </View>
                    {index < members.length - 1 ? <View style={styles.memberDivider} /> : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  scrollContent: { paddingBottom: 40 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BG,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  errorWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: PAGE_BG,
  },
  errorTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  errorBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SOFT,
  },
  primaryButton: {
    marginTop: 22,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroSection: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 96,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextWrap: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#d7dbec",
  },
  heroTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  heroTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroTagRecruiting: {
    backgroundColor: "#dcfce7",
  },
  heroTagClosed: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroTagLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  heroTagRecruitingLabel: {
    color: "#166534",
  },
  heroTagClosedLabel: {
    color: "#ffffff",
  },
  emblemImage: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  emblemFallback: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  emblemFallbackLabel: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
  },
  bodyWrap: {
    marginTop: -56,
    gap: 16,
    paddingHorizontal: 20,
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: CARD_BG,
    padding: 20,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  summaryValue: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: OWNER_BG,
  },
  rolePillLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: OWNER_TEXT,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "48%",
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: CARD_BG,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: "space-between",
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  quickCardLabel: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  whiteCard: {
    borderRadius: 24,
    backgroundColor: CARD_BG,
    padding: 20,
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  bodyText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SOFT,
  },
  memberList: {
    marginTop: 12,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 62,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#dbe4ff",
  },
  memberAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbe4ff",
  },
  memberAvatarFallbackLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: BLUE,
  },
  memberMeta: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  squadNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: BLUE,
  },
  memberDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#edf0f5",
  },
});
