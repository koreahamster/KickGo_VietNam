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
  PROFILE_GREEN,
  PROFILE_OWNER_BG,
  PROFILE_OWNER_TEXT,
  PROFILE_PAGE_BG,
  PROFILE_ROLE_LABELS,
  PROFILE_TEXT_DARK,
  PROFILE_TEXT_SOFT,
  formatCompactCurrency,
  getAvatarContentType,
  getAvatarFileName,
} from "@/components/profile/profileShared";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useFacilityManagerProfile } from "@/hooks/useFacilityManagerProfile";
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
  statsTitle: string;
  registeredFacilities: string;
  todayBookings: string;
  monthRevenue: string;
  bookingShortcut: string;
  facilityListTitle: string;
  facilityApproved: string;
  addFacility: string;
  quickActionsTitle: string;
  bookingManagement: string;
  facilityManagement: string;
  revenue: string;
  noticeCreate: string;
  settings: string;
  noFacilities: string;
  noFacilitiesBody: string;
}> = {
  ko: {
    roleBadge: "시설 관리자",
    regionUnknown: "지역 미설정",
    loading: "불러오는 중...",
    noProfileTitle: "공통 프로필이 필요합니다.",
    noProfileBody: "시설 관리자 프로필을 보려면 먼저 공통 프로필을 완성해 주세요.",
    continueOnboarding: "온보딩 계속",
    uploadPermission: "사진 보관함 접근 권한이 필요합니다.",
    uploadUnsupported: "JPG, PNG, WEBP, HEIC, HEIF 파일만 업로드할 수 있습니다.",
    uploadFailed: "아바타 업로드에 실패했습니다.",
    statsTitle: "운동장 현황",
    registeredFacilities: "등록 운동장",
    todayBookings: "오늘 예약",
    monthRevenue: "이번 달 수익",
    bookingShortcut: "예약 관리 바로가기 >",
    facilityListTitle: "내 운동장 목록",
    facilityApproved: "승인 완료",
    addFacility: "+ 운동장 등록",
    quickActionsTitle: "빠른 실행",
    bookingManagement: "예약 현황",
    facilityManagement: "운동장 관리",
    revenue: "수익 확인",
    noticeCreate: "공지 등록",
    settings: "설정",
    noFacilities: "아직 등록한 운동장이 없습니다.",
    noFacilitiesBody: "운동장 관리에서 첫 시설을 등록해 보세요.",
  },
  vi: {
    roleBadge: "Quan ly san",
    regionUnknown: "Chua chon khu vuc",
    loading: "Dang tai...",
    noProfileTitle: "Can ho so chung.",
    noProfileBody: "Hay hoan thanh ho so chung truoc khi xem trang quan ly san.",
    continueOnboarding: "Tiep tuc",
    uploadPermission: "Can quyen truy cap thu vien anh.",
    uploadUnsupported: "Chi ho tro JPG, PNG, WEBP, HEIC, HEIF.",
    uploadFailed: "Tai anh dai dien that bai.",
    statsTitle: "Tong quan san",
    registeredFacilities: "San da dang ky",
    todayBookings: "Dat hom nay",
    monthRevenue: "Doanh thu thang nay",
    bookingShortcut: "Den quan ly dat san >",
    facilityListTitle: "Danh sach san",
    facilityApproved: "Da duyet",
    addFacility: "+ Dang ky san",
    quickActionsTitle: "Truy cap nhanh",
    bookingManagement: "Dat san",
    facilityManagement: "Quan ly san",
    revenue: "Doanh thu",
    noticeCreate: "Dang thong bao",
    settings: "Cai dat",
    noFacilities: "Chua co san nao.",
    noFacilitiesBody: "Hay them co so dau tien tu man quan ly san.",
  },
  en: {
    roleBadge: "Facility Manager",
    regionUnknown: "Region not set",
    loading: "Loading...",
    noProfileTitle: "A common profile is required.",
    noProfileBody: "Finish your common profile before using the facility manager dashboard.",
    continueOnboarding: "Continue onboarding",
    uploadPermission: "Photo library access is required.",
    uploadUnsupported: "Only JPG, PNG, WEBP, HEIC, or HEIF files are supported.",
    uploadFailed: "Avatar upload failed.",
    statsTitle: "Facility overview",
    registeredFacilities: "Facilities",
    todayBookings: "Today bookings",
    monthRevenue: "This month revenue",
    bookingShortcut: "Go to booking management >",
    facilityListTitle: "My facilities",
    facilityApproved: "Approved",
    addFacility: "+ Add facility",
    quickActionsTitle: "Quick actions",
    bookingManagement: "Bookings",
    facilityManagement: "Facilities",
    revenue: "Revenue",
    noticeCreate: "Notice",
    settings: "Settings",
    noFacilities: "No facilities registered yet.",
    noFacilitiesBody: "Register your first facility from the management screen.",
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

export default function FacilityManagerProfile(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const dashboard = useFacilityManagerProfile({ userId: user?.id ?? null, enabled: isAuthenticated });

  const profile = dashboard.profileBundle?.profile ?? null;
  const displayName = profile?.display_name?.trim() || user?.email || "KickGo";
  const tags = useMemo(() => {
    if (!profile) {
      return [copy.regionUnknown];
    }

    const regionParts = [profile.province_code, profile.district_code].filter(Boolean);
    return [`${getCountryFlag(profile.country_code)} ${profile.country_code}`, regionParts.join(" / ") || copy.regionUnknown];
  }, [copy.regionUnknown, profile]);

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
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>{copy.statsTitle}</Text>
              <Pressable onPress={() => router.push("/(tabs)/booking-management")}> 
                <Text style={styles.linkButton}>{copy.bookingShortcut}</Text>
              </Pressable>
            </View>
            <View style={styles.statsRow}>
              <StatCard value={`${dashboard.stats.registeredFacilities}`} label={copy.registeredFacilities} />
              <StatCard value={`${dashboard.stats.todayBookings}`} label={copy.todayBookings} />
              <StatCard value={formatCompactCurrency(dashboard.stats.monthlyRevenue, language)} label={copy.monthRevenue} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>{copy.facilityListTitle}</Text>
              <Pressable onPress={() => router.push("/(tabs)/facility-management")}>
                <Text style={styles.linkButton}>{copy.addFacility}</Text>
              </Pressable>
            </View>

            {dashboard.facilities.length > 0 ? (
              <View style={styles.listWrap}>
                {dashboard.facilities.map((facility, index) => (
                  <View key={facility.id}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(facility)/[facilityId]",
                          params: { facilityId: facility.id },
                        })
                      }
                      style={styles.facilityRow}
                    >
                      <View style={styles.facilityAvatar}>
                        <MaterialCommunityIcons color={PROFILE_GREEN} name="soccer-field" size={22} />
                      </View>
                      <View style={styles.facilityBody}>
                        <Text style={styles.facilityName}>{facility.name}</Text>
                        <Text style={styles.facilityMeta}>{facility.province_code} / {facility.district_code}</Text>
                      </View>
                      <View style={styles.approvalBadge}>
                        <Text style={styles.approvalBadgeLabel}>{copy.facilityApproved}</Text>
                      </View>
                    </Pressable>
                    {index < dashboard.facilities.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>{copy.noFacilities}</Text>
                <Text style={styles.emptyCardBody}>{copy.noFacilitiesBody}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.quickActionsTitle}</Text>
            <View style={styles.quickGrid}>
              <Pressable onPress={() => router.push("/(tabs)/booking-management")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="calendar-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.bookingManagement}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/facility-management")} style={styles.quickItem}>
                <MaterialCommunityIcons color={PROFILE_BLUE} name="soccer-field" size={22} />
                <Text style={styles.quickLabel}>{copy.facilityManagement}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/revenue")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="wallet-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.revenue}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(facility)/notice-create")} style={styles.quickItem}>
                <Ionicons color={PROFILE_BLUE} name="megaphone-outline" size={22} />
                <Text style={styles.quickLabel}>{copy.noticeCreate}</Text>
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
    backgroundColor: PROFILE_GREEN,
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  linkButton: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_BLUE,
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
  facilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  facilityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PROFILE_BLUE_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  facilityBody: {
    flex: 1,
    gap: 5,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  facilityMeta: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  approvalBadge: {
    borderRadius: 999,
    backgroundColor: PROFILE_OWNER_BG,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  approvalBadgeLabel: {
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
    width: "31%",
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

