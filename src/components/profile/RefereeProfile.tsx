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
import { useAuth } from "@/hooks/useAuth";
import { useRefereeProfileDashboard } from "@/hooks/useRefereeProfileDashboard";
import type { SupportedLanguage } from "@/types/profile.types";

const COPY: Record<SupportedLanguage, {
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
}> = {
  ko: {
    roleBadge: "심판",
    regionUnknown: "지역 미설정",
    loading: "불러오는 중...",
    noProfileTitle: "공통 프로필이 필요합니다.",
    noProfileBody: "심판 프로필을 보려면 먼저 공통 프로필을 완성해 주세요.",
    continueOnboarding: "온보딩 계속",
    uploadPermission: "사진 보관함 접근 권한이 필요합니다.",
    uploadUnsupported: "JPG, PNG, WEBP, HEIC, HEIF 파일만 업로드할 수 있습니다.",
    uploadFailed: "아바타 업로드에 실패했습니다.",
    ratingTitle: "평점",
    fairness: "공정성",
    accuracy: "정확성",
    attitude: "태도",
    reviewCount: "평가",
    activityTitle: "활동 통계",
    totalAssignments: "총 배정 경기",
    monthAssignments: "이번 달 경기",
    monthRevenue: "이번 달 수익",
    recentMatchesTitle: "최근 배정 경기",
    noMatches: "최근 배정된 경기가 없습니다.",
    noMatchesBody: "배정이 시작되면 이곳에 최신 경기 일정이 표시됩니다.",
    pendingStatus: "정산 대기",
    quickActionsTitle: "빠른 실행",
    schedule: "일정 관리",
    availability: "가용시간 등록",
    revenue: "수익 확인",
    settings: "설정",
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
    availability: "Dang ky lich trong",
    revenue: "Thu nhap",
    settings: "Cai dat",
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
  },
};

function getCountryFlag(code: string | null | undefined): string {
  if (code === "VN") {
    return "🇻🇳";
  }
  if (code === "KR") {
    return "🇰🇷";
  }
  if (code === "US") {
    return "🇺🇸";
  }
  return "🌐";
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

export default function RefereeProfile(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const dashboard = useRefereeProfileDashboard({ userId: user?.id ?? null, enabled: isAuthenticated });

  const profile = dashboard.profileBundle?.profile ?? null;
  const refereeProfile = dashboard.profileBundle?.refereeProfile ?? null;
  const displayName = profile?.display_name?.trim() || user?.email || "KickGo";
  const tags = useMemo(() => {
    if (!profile) {
      return [copy.regionUnknown];
    }

    const regionParts = [profile.province_code, profile.district_code].filter(Boolean);
    return [`${getCountryFlag(profile.country_code)} ${profile.country_code}`, regionParts.join(" / ") || copy.regionUnknown];
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
          onSettings={() => router.push("/(settings)/settings")}
          onShare={() => void handleShare()}
          onUploadAvatar={() => void handleUploadAvatar()}
        />

        <View style={styles.cardsWrap}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.ratingTitle}</Text>
            <View style={styles.ratingHeaderRow}>
              <Text style={styles.ratingValue}>★ {averageRating.toFixed(1)} / 5.0</Text>
              <View style={styles.reviewCountBadge}>
                <Text style={styles.reviewCountLabel}>{copy.reviewCount} {refereeProfile?.rating_count ?? 0}</Text>
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
                        <Text style={styles.matchTitle}>{match.home_team_name} vs {match.away_team_name}</Text>
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
              <Pressable onPress={() => router.push("/(referee)/availability")} style={styles.quickItem}>
                <MaterialCommunityIcons color={PROFILE_BLUE} name="clock-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.availability}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/revenue")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="wallet-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.revenue}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(settings)/settings")} style={styles.quickItem}>
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
  safeArea: {
    flex: 1,
    backgroundColor: PROFILE_PAGE_BG,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: PROFILE_PAGE_BG,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: PROFILE_TEXT_SOFT,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: PROFILE_TEXT_SOFT,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 54,
    alignSelf: "stretch",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PROFILE_BLUE,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardsWrap: {
    marginTop: -56,
    paddingHorizontal: 20,
    gap: 18,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  ratingHeaderRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: "900",
    color: PROFILE_TEXT_DARK,
  },
  reviewCountBadge: {
    borderRadius: 999,
    backgroundColor: PROFILE_BLUE_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewCountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PROFILE_BLUE,
  },
  ratingMetricsWrap: {
    marginTop: 18,
    gap: 12,
  },
  ratingMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ratingMetricLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_TEXT_SOFT,
  },
  ratingMetricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  statsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  statTile: {
    flex: 1,
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
    textAlign: "center",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_TEXT_SOFT,
    textAlign: "center",
  },
  listWrap: {
    marginTop: 16,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  matchTextWrap: {
    flex: 1,
    gap: 4,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  matchMeta: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  matchMetaWrap: {
    alignItems: "flex-end",
    gap: 10,
  },
  pendingBadge: {
    borderRadius: 999,
    backgroundColor: PROFILE_OWNER_BG,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PROFILE_OWNER_TEXT,
  },
  divider: {
    height: 1,
    backgroundColor: PROFILE_BORDER,
  },
  emptyCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    padding: 16,
    gap: 8,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  emptyCardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: PROFILE_TEXT_SOFT,
  },
  quickGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
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
  quickLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
    textAlign: "center",
  },
  errorText: {
    paddingHorizontal: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b91c1c",
  },
});
