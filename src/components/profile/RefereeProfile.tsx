import * as ImagePicker from "expo-image-picker";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeroHeader } from "@/components/profile/ProfileHeroHeader";
import {
  PROFILE_BLUE,
  PROFILE_BLUE_SOFT,
  PROFILE_BORDER,
  PROFILE_CARD_BG,
  PROFILE_OWNER_BG,
  PROFILE_OWNER_TEXT,
  PROFILE_PAGE_BG,
  PROFILE_TEXT_DARK,
  PROFILE_TEXT_SOFT,
  formatCompactCurrency,
  formatDateTime,
  getAvatarContentType,
  getAvatarFileName,
} from "@/components/profile/profileShared";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getRefereeAssignmentStatusLabel, getRefereeAssignmentTone, getRefereeSystemCopy } from "@/features/referee/referee.copy";
import { useAuth } from "@/hooks/useAuth";
import { useMyAssignments } from "@/hooks/useRefereeQuery";
import { useRefereeProfileDashboard } from "@/hooks/useRefereeProfileDashboard";
import { useDrawerStore } from "@/store/drawer.store";
import type { SupportedLanguage } from "@/types/profile.types";
import type { RefereeAssignment } from "@/types/referee.types";

type LocalCopy = {
  roleBadge: string;
  regionUnknown: string;
  loading: string;
  noProfileTitle: string;
  noProfileBody: string;
  continueOnboarding: string;
  uploadPermission: string;
  uploadUnsupported: string;
  uploadFailed: string;
  ratingTitle: string;
  fairness: string;
  accuracy: string;
  attitude: string;
  reviewCount: string;
  activityTitle: string;
  totalAssignments: string;
  monthAssignments: string;
  monthRevenue: string;
  recentMatchesTitle: string;
  noMatches: string;
  noMatchesBody: string;
  pendingStatus: string;
  quickActionsTitle: string;
  schedule: string;
  availability: string;
  revenue: string;
  settings: string;
  assignmentPreviewTitle: string;
};

const COPY: Record<SupportedLanguage, LocalCopy> = {
  ko: {
    roleBadge: "\uC2EC\uD310",
    regionUnknown: "\uC9C0\uC5ED \uBBF8\uC124\uC815",
    loading: "\uBD88\uB7EC\uC624\uB294 \uC911...",
    noProfileTitle: "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    noProfileBody: "\uC2EC\uD310 \uD504\uB85C\uD544\uC744 \uBCF4\uB824\uBA74 \uBA3C\uC800 \uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uC644\uC131\uD574 \uC8FC\uC138\uC694.",
    continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
    uploadPermission: "\uC0AC\uC9C4 \uBCF4\uAD00\uD568 \uC811\uADFC \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    uploadUnsupported: "JPG, PNG, WEBP, HEIC, HEIF \uD30C\uC77C\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    uploadFailed: "\uC544\uBC14\uD0C0 \uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
    ratingTitle: "\uD3C9\uC810",
    fairness: "\uACF5\uC815\uC131",
    accuracy: "\uC815\uD655\uC131",
    attitude: "\uD0DC\uB3C4",
    reviewCount: "\uD3C9\uAC00",
    activityTitle: "\uD65C\uB3D9 \uD1B5\uACC4",
    totalAssignments: "\uCD1D \uBC30\uC815 \uACBD\uAE30",
    monthAssignments: "\uC774\uBC88 \uB2EC \uACBD\uAE30",
    monthRevenue: "\uC774\uBC88 \uB2EC \uC218\uC775",
    recentMatchesTitle: "\uCD5C\uADFC \uBC30\uC815 \uACBD\uAE30",
    noMatches: "\uCD5C\uADFC \uBC30\uC815\uB41C \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    noMatchesBody: "\uBC30\uC815\uC774 \uC2DC\uC791\uB418\uBA74 \uC774\uACF3\uC5D0 \uCD5C\uC2E0 \uACBD\uAE30 \uC77C\uC815\uC774 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
    pendingStatus: "\uC815\uC0B0 \uB300\uAE30",
    quickActionsTitle: "\uBE60\uB978 \uC2E4\uD589",
    schedule: "\uC77C\uC815 \uAD00\uB9AC",
    availability: "\uAC00\uC6A9\uC2DC\uAC04 \uAD00\uB9AC",
    revenue: "\uC218\uC775 \uD655\uC778",
    settings: "\uC124\uC815",
    assignmentPreviewTitle: "\uCD5C\uADFC \uC694\uCCAD",
  },
  vi: {
    roleBadge: "Trong tai",
    regionUnknown: "Chua chon khu vuc",
    loading: "Dang tai...",
    noProfileTitle: "Can ho so chung.",
    noProfileBody: "Hay hoan thanh ho so chung truoc khi xem trang trong tai.",
    continueOnboarding: "Tiep tuc",
    uploadPermission: "Can quyen truy cap thu vien anh.",
    uploadUnsupported: "Chi ho tro JPG, PNG, WEBP, HEIC, HEIF.",
    uploadFailed: "Tai anh dai dien that bai.",
    ratingTitle: "Danh gia",
    fairness: "Cong bang",
    accuracy: "Chinh xac",
    attitude: "Thai do",
    reviewCount: "Luot danh gia",
    activityTitle: "Thong ke hoat dong",
    totalAssignments: "Tong tran duoc phan cong",
    monthAssignments: "Tran trong thang",
    monthRevenue: "Thu nhap thang nay",
    recentMatchesTitle: "Tran gan day",
    noMatches: "Chua co tran duoc phan cong.",
    noMatchesBody: "Tran dau moi se hien o day khi duoc sap lich.",
    pendingStatus: "Cho thanh toan",
    quickActionsTitle: "Truy cap nhanh",
    schedule: "Lich",
    availability: "Lich trong",
    revenue: "Thu nhap",
    settings: "Cai dat",
    assignmentPreviewTitle: "Yeu cau gan day",
  },
  en: {
    roleBadge: "Referee",
    regionUnknown: "Region not set",
    loading: "Loading...",
    noProfileTitle: "A common profile is required.",
    noProfileBody: "Finish your common profile before using the referee dashboard.",
    continueOnboarding: "Continue onboarding",
    uploadPermission: "Photo library access is required.",
    uploadUnsupported: "Only JPG, PNG, WEBP, HEIC, or HEIF files are supported.",
    uploadFailed: "Avatar upload failed.",
    ratingTitle: "Rating",
    fairness: "Fairness",
    accuracy: "Accuracy",
    attitude: "Attitude",
    reviewCount: "Reviews",
    activityTitle: "Activity stats",
    totalAssignments: "Total assignments",
    monthAssignments: "This month",
    monthRevenue: "This month revenue",
    recentMatchesTitle: "Recent assignments",
    noMatches: "No assigned matches yet.",
    noMatchesBody: "New appointments will appear here.",
    pendingStatus: "Pending payout",
    quickActionsTitle: "Quick actions",
    schedule: "Schedule",
    availability: "Availability",
    revenue: "Revenue",
    settings: "Settings",
    assignmentPreviewTitle: "Recent requests",
  },
};

function getCountryLabel(code: string | null | undefined): string {
  if (code === "VN") return "VN";
  if (code === "KR") return "KR";
  if (code === "US") return "US";
  return "GL";
}

function StatCard(props: { value: string; label: string }): JSX.Element {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{props.value}</Text>
      <Text style={styles.statLabel}>{props.label}</Text>
    </View>
  );
}

function RatingMetric(props: { label: string; value: number }): JSX.Element {
  return (
    <View style={styles.ratingMetricRow}>
      <Text style={styles.ratingMetricLabel}>{props.label}</Text>
      <Text style={styles.ratingMetricValue}>{props.value.toFixed(1)}</Text>
    </View>
  );
}

function buildAssignmentTitle(item: RefereeAssignment): string {
  const home = item.home_team_name?.trim() || "Home Team";
  const away = item.away_team_name?.trim() || "Away Team";
  return `${home} vs ${away}`;
}

export default function RefereeProfile(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];
  const refereeCopy = getRefereeSystemCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const dashboard = useRefereeProfileDashboard({ userId: user?.id ?? null, enabled: isAuthenticated });
  const assignmentsQuery = useMyAssignments(user?.id ?? null, Boolean(user?.id && isAuthenticated));

  const profile = dashboard.profileBundle?.profile ?? null;
  const refereeProfile = dashboard.profileBundle?.refereeProfile ?? null;
  const displayName = profile?.display_name?.trim() || user?.email || "KickGo";
  const recentAssignments = useMemo(() => (assignmentsQuery.data ?? []).slice(0, 2), [assignmentsQuery.data]);
  const pendingCount = useMemo(
    () => (assignmentsQuery.data ?? []).filter((item) => item.status === "pending").length,
    [assignmentsQuery.data],
  );
  const tags = useMemo(() => {
    if (!profile) {
      return [copy.regionUnknown];
    }
    const regionParts = [profile.province_code, profile.district_code].filter(Boolean);
    return [`${getCountryLabel(profile.country_code)} ${profile.country_code}`, regionParts.join(" / ") || copy.regionUnknown];
  }, [copy.regionUnknown, profile]);
  const averageRating = Number(refereeProfile?.average_rating ?? 0);

  const handleUploadAvatar = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("KickGo", copy.uploadPermission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const contentType = getAvatarContentType(asset);
    if (!contentType) {
      Alert.alert("KickGo", copy.uploadUnsupported);
      return;
    }

    try {
      await dashboard.uploadAvatar({
        uri: asset.uri,
        fileName: getAvatarFileName(asset, contentType),
        contentType,
      });
    } catch (error: unknown) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.uploadFailed);
    }
  };

  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({ message: `${displayName} - KickGo` });
    } catch {
      // ignore
    }
  };

  if (isAuthLoading || dashboard.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyTitle}>{copy.noProfileTitle}</Text>
          <Text style={styles.emptyBody}>{copy.noProfileBody}</Text>
          <Pressable onPress={() => router.push("/(onboarding)/create-profile")} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>{copy.continueOnboarding}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={dashboard.isLoading} onRefresh={() => void dashboard.refetchAll()} />}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroHeader
          avatarUrl={profile.avatar_url}
          badgeLabel={copy.roleBadge}
          displayName={displayName}
          tags={tags}
          onBack={() => router.replace("/(tabs)/home")}
          onEdit={() => router.push("/(onboarding)/create-profile?mode=edit")}
          onNotifications={() => router.push("/notifications")}
          onSettings={openDrawer}
          onShare={() => void handleShare()}
          onUploadAvatar={() => void handleUploadAvatar()}
        />

        <View style={styles.cardsWrap}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.ratingTitle}</Text>
            <View style={styles.ratingHeaderRow}>
              <Text style={styles.ratingValue}>{`¡Ú ${averageRating.toFixed(1)} / 5.0`}</Text>
              <View style={styles.reviewCountBadge}>
                <Text style={styles.reviewCountLabel}>{`${copy.reviewCount} ${refereeProfile?.rating_count ?? 0}`}</Text>
              </View>
            </View>
            <View style={styles.ratingMetricsWrap}>
              <RatingMetric label={copy.fairness} value={averageRating} />
              <RatingMetric label={copy.accuracy} value={averageRating} />
              <RatingMetric label={copy.attitude} value={averageRating} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.activityTitle}</Text>
            <View style={styles.statsRow}>
              <StatCard value={`${dashboard.stats.totalAssignments}`} label={copy.totalAssignments} />
              <StatCard value={`${dashboard.stats.monthAssignments}`} label={copy.monthAssignments} />
              <StatCard value={formatCompactCurrency(dashboard.stats.monthRevenue, language)} label={copy.monthRevenue} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{refereeCopy.assignmentsSectionTitle}</Text>
              <Pressable onPress={() => router.push("/(tabs)/profile/referee-assignments")} style={styles.linkButton}>
                <Text style={styles.linkButtonLabel}>{refereeCopy.assignmentsViewAll}</Text>
              </Pressable>
            </View>
            <View style={styles.assignmentSummaryRow}>
              <View style={styles.assignmentCountBadge}>
                <Text style={styles.assignmentCountLabel}>{`${refereeCopy.assignmentsPendingBadge} ${pendingCount}`}</Text>
              </View>
              <Text style={styles.assignmentHint}>{copy.assignmentPreviewTitle}</Text>
            </View>
            {recentAssignments.length > 0 ? (
              <View style={styles.listWrap}>
                {recentAssignments.map((item, index) => {
                  const tone = getRefereeAssignmentTone(item.status);
                  return (
                    <View key={item.id}>
                      <Pressable onPress={() => router.push("/(tabs)/profile/referee-assignments")} style={styles.matchRow}>
                        <View style={styles.matchTextWrap}>
                          <Text style={styles.matchTitle}>{buildAssignmentTitle(item)}</Text>
                          <Text style={styles.matchMeta}>{formatDateTime(item.match_scheduled_at ?? null, language)}</Text>
                          <Text style={styles.matchMeta}>{formatCompactCurrency(item.fee_amount, language)}</Text>
                        </View>
                        <View style={[styles.statusChip, { backgroundColor: tone.backgroundColor }]}>
                          <Text style={[styles.statusChipLabel, { color: tone.color }]}>{getRefereeAssignmentStatusLabel(refereeCopy, item.status)}</Text>
                        </View>
                      </Pressable>
                      {index < recentAssignments.length - 1 ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>{refereeCopy.assignmentRecentEmpty}</Text>
                <Text style={styles.emptyCardBody}>{refereeCopy.assignmentActionStep2Hint}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.recentMatchesTitle}</Text>
            {dashboard.recentMatches.length > 0 ? (
              <View style={styles.listWrap}>
                {dashboard.recentMatches.map((match, index) => (
                  <View key={match.id}>
                    <Pressable
                      onPress={() => router.push({ pathname: "/(referee)/match/[matchId]", params: { matchId: match.id } })}
                      style={styles.matchRow}
                    >
                      <View style={styles.matchTextWrap}>
                        <Text style={styles.matchTitle}>{`${match.home_team_name} vs ${match.away_team_name}`}</Text>
                        <Text style={styles.matchMeta}>{formatDateTime(match.scheduled_at, language)}</Text>
                        {match.venue_name ? <Text style={styles.matchMeta}>{match.venue_name}</Text> : null}
                      </View>
                      <View style={styles.matchMetaWrap}>
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeLabel}>{copy.pendingStatus}</Text>
                        </View>
                        <Ionicons color={PROFILE_TEXT_SOFT} name="chevron-forward" size={18} />
                      </View>
                    </Pressable>
                    {index < dashboard.recentMatches.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>{copy.noMatches}</Text>
                <Text style={styles.emptyCardBody}>{copy.noMatchesBody}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.quickActionsTitle}</Text>
            <View style={styles.quickGrid}>
              <Pressable onPress={() => router.push("/(tabs)/schedule")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="calendar-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.schedule}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/profile/referee-availability")} style={styles.quickItem}>
                <MaterialCommunityIcons color={PROFILE_BLUE} name="clock-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.availability}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/profile/referee-assignments")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="document-text-outline" size={22} />
                <Text style={styles.quickLabel}>{refereeCopy.assignmentsTitle}</Text>
              </Pressable>
              <Pressable onPress={openDrawer} style={styles.quickItem}>
                <Feather color={PROFILE_BLUE} name="settings" size={22} />
                <Text style={styles.quickLabel}>{copy.settings}</Text>
              </Pressable>
            </View>
          </View>

          {dashboard.errorMessage ? <Text style={styles.errorText}>{dashboard.errorMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PROFILE_PAGE_BG },
  scrollContent: { paddingBottom: 48 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: PROFILE_PAGE_BG,
  },
  loadingText: { fontSize: 16, fontWeight: "600", color: PROFILE_TEXT_SOFT },
  emptyTitle: { fontSize: 28, fontWeight: "800", color: PROFILE_TEXT_DARK, textAlign: "center" },
  emptyBody: { marginTop: 12, fontSize: 15, lineHeight: 22, color: PROFILE_TEXT_SOFT, textAlign: "center" },
  primaryButton: {
    marginTop: 24,
    minHeight: 54,
    alignSelf: "stretch",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_BLUE,
  },
  primaryButtonLabel: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  cardsWrap: { marginTop: -56, paddingHorizontal: 20, gap: 18 },
  card: {
    borderRadius: 22,
    backgroundColor: PROFILE_CARD_BG,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: PROFILE_TEXT_DARK },
  linkButton: { paddingHorizontal: 10, paddingVertical: 6 },
  linkButtonLabel: { fontSize: 12, fontWeight: "800", color: PROFILE_BLUE },
  ratingHeaderRow: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  ratingValue: { fontSize: 28, fontWeight: "900", color: PROFILE_TEXT_DARK },
  reviewCountBadge: { borderRadius: 999, backgroundColor: PROFILE_BLUE_SOFT, paddingHorizontal: 12, paddingVertical: 8 },
  reviewCountLabel: { fontSize: 12, fontWeight: "700", color: PROFILE_BLUE },
  ratingMetricsWrap: { marginTop: 18, gap: 12 },
  ratingMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ratingMetricLabel: { fontSize: 14, fontWeight: "600", color: PROFILE_TEXT_SOFT },
  ratingMetricValue: { fontSize: 16, fontWeight: "800", color: PROFILE_TEXT_DARK },
  statsRow: { marginTop: 18, flexDirection: "row", gap: 12 },
  statTile: {
    flex: 1,
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: PROFILE_TEXT_DARK, textAlign: "center" },
  statLabel: { marginTop: 6, fontSize: 12, fontWeight: "600", color: PROFILE_TEXT_SOFT, textAlign: "center" },
  assignmentSummaryRow: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  assignmentCountBadge: { borderRadius: 999, backgroundColor: PROFILE_BLUE_SOFT, paddingHorizontal: 12, paddingVertical: 8 },
  assignmentCountLabel: { fontSize: 12, fontWeight: "800", color: PROFILE_BLUE },
  assignmentHint: { fontSize: 12, fontWeight: "700", color: PROFILE_TEXT_SOFT },
  listWrap: { marginTop: 16 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  matchTextWrap: { flex: 1, gap: 4 },
  matchTitle: { fontSize: 16, fontWeight: "800", color: PROFILE_TEXT_DARK },
  matchMeta: { fontSize: 13, color: PROFILE_TEXT_SOFT },
  matchMetaWrap: { alignItems: "flex-end", gap: 10 },
  pendingBadge: { borderRadius: 999, backgroundColor: PROFILE_OWNER_BG, paddingHorizontal: 10, paddingVertical: 6 },
  pendingBadgeLabel: { fontSize: 12, fontWeight: "700", color: PROFILE_OWNER_TEXT },
  statusChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusChipLabel: { fontSize: 12, fontWeight: "800" },
  divider: { height: 1, backgroundColor: PROFILE_BORDER },
  emptyCard: { marginTop: 16, borderRadius: 18, backgroundColor: "#f8fafc", padding: 16, gap: 8 },
  emptyCardTitle: { fontSize: 16, fontWeight: "800", color: PROFILE_TEXT_DARK },
  emptyCardBody: { fontSize: 14, lineHeight: 20, color: PROFILE_TEXT_SOFT },
  quickGrid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickItem: {
    width: "48%",
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
    backgroundColor: "#fbfdff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 10,
  },
  quickLabel: { fontSize: 13, fontWeight: "700", color: PROFILE_TEXT_DARK, textAlign: "center" },
  errorText: { paddingHorizontal: 8, textAlign: "center", fontSize: 14, lineHeight: 20, color: "#b91c1c" },
});
