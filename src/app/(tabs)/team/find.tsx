import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamRecruitmentLabel } from "@/features/team-shell/team-shell.helpers";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeamSearchQuery } from "@/hooks/useTeamSearchQuery";
import type { TeamRecord } from "@/types/team.types";

const PAGE_BG = "#ffffff";
const CARD_BG = "#ffffff";
const BORDER = "#e8ebf2";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6b7280";
const DARK_BG = "#1a1a2e";
const DARK_TAG_BG = "#2a2a3e";
const DARK_TAG_TEXT = "#c9cfdb";
const BRAND = "#1d9e75";
const SEARCH_BG = "#f5f7fb";

type CopyKey = "ko" | "vi" | "en";

const COPY: Record<CopyKey, {
  title: string;
  subtitle: string;
  placeholder: string;
  emptyTitle: string;
  emptyBody: string;
  createTeam: string;
  joinByCode: string;
  detail: string;
  loading: string;
  retry: string;
  needProfileTitle: string;
  continueOnboarding: string;
  goHome: string;
  recruitingOpen: string;
  recruitingClosed: string;
  recruitingInviteOnly: string;
}> = {
  ko: {
    title: "? ??",
    subtitle: "?? ?? ???? ? ?? ???? ??? ? ???.",
    placeholder: "? ???? ??",
    emptyTitle: "??? ?? ?? ???",
    emptyBody: "???? ???? ?? ? ?? ??????.",
    createTeam: "? ???",
    joinByCode: "????? ??",
    detail: "?? ??",
    loading: "? ??? ???? ????.",
    retry: "?? ??",
    needProfileTitle: "? ??? ????? ?? ???? ????.",
    continueOnboarding: "??? ??",
    goHome: "??? ??",
    recruitingOpen: "???",
    recruitingClosed: "????",
    recruitingInviteOnly: "????",
  },
  vi: {
    title: "Tim doi",
    subtitle: "Tim doi cong khai va mo trang chi tiet doi.",
    placeholder: "Tim theo ten doi",
    emptyTitle: "Khong co doi phu hop",
    emptyBody: "Hay doi tu khoa hoac tao doi moi.",
    createTeam: "Tao doi",
    joinByCode: "Tham gia bang ma moi",
    detail: "Xem chi tiet",
    loading: "Dang tai danh sach doi.",
    retry: "Thu lai",
    needProfileTitle: "Can ho so chung de dung tinh nang doi.",
    continueOnboarding: "Tiep tuc onboarding",
    goHome: "Ve trang chu",
    recruitingOpen: "Dang tuyen",
    recruitingClosed: "Dong tuyen",
    recruitingInviteOnly: "Chi bang loi moi",
  },
  en: {
    title: "Find Team",
    subtitle: "Browse public teams and open their detail pages.",
    placeholder: "Search by team name",
    emptyTitle: "No team matched your search",
    emptyBody: "Try another keyword or create a new team yourself.",
    createTeam: "Create team",
    joinByCode: "Join by code",
    detail: "Open details",
    loading: "Loading teams.",
    retry: "Retry",
    needProfileTitle: "A common profile is required before using team features.",
    continueOnboarding: "Continue onboarding",
    goHome: "Go home",
    recruitingOpen: "Recruiting",
    recruitingClosed: "Closed",
    recruitingInviteOnly: "Invite only",
  },
};

function buildInitials(name: string): string {
  const tokens = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());

  return tokens.join("") || name.slice(0, 1).toUpperCase();
}

function getSportLabel(language: CopyKey, sportType: TeamRecord["sport_type"]): string {
  const map = {
    ko: { soccer: "??", futsal: "??", both: "?? / ??" },
    vi: { soccer: "Bong da", futsal: "Futsal", both: "Bong da / Futsal" },
    en: { soccer: "Soccer", futsal: "Futsal", both: "Soccer / Futsal" },
  } as const;

  if (!sportType) {
    return map[language].soccer;
  }

  return map[language][sportType];
}

function getRecruitmentLabel(locale: CopyKey, team: TeamRecord): string {
  if (locale === "ko") {
    return getTeamRecruitmentLabel("ko", team);
  }

  if (locale === "vi") {
    return getTeamRecruitmentLabel("vi", team);
  }

  return getTeamRecruitmentLabel("en", team);
}

function TeamFindCard(props: { team: TeamRecord; locale: CopyKey; copy: (typeof COPY)[CopyKey] }): JSX.Element {
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);
  const provinceLabel = getOptionLabel(provinceOptions, props.team.province_code) ?? props.team.province_code;
  const districtLabel =
    getOptionLabel(getDistrictOptions(props.team.province_code), props.team.district_code) ?? props.team.district_code;
  const fallbackLocation = `${provinceLabel} / ${districtLabel}`;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(tabs)/team/[teamId]",
          params: { teamId: props.team.id },
        })
      }
      style={styles.card}
    >
      <View style={styles.cardHero}>
        <View style={styles.cardHeroCopy}>
          <Text style={styles.cardTitle}>{props.team.name}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagLabel}>{provinceLabel}</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagLabel}>{districtLabel}</Text>
            </View>
            <View style={styles.tagPill}>
              <Text style={styles.tagLabel}>{getRecruitmentLabel(props.locale, props.team)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.emblemFallback}>
          <Text style={styles.emblemFallbackLabel}>{buildInitials(props.team.name)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardMeta}>{getSportLabel(props.locale, props.team.sport_type)}</Text>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {props.team.description?.trim() || "KickGo public team"}
        </Text>
        <View style={styles.cardFooter}>
          <Text numberOfLines={1} style={styles.cardSubMeta}>
            {props.team.home_ground?.trim() || fallbackLocation}
          </Text>
          <View style={styles.detailPill}>
            <Text style={styles.detailPillLabel}>{props.copy.detail}</Text>
            <Ionicons color={BRAND} name="chevron-forward" size={14} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function TeamFindScreen(): JSX.Element {
  const { language } = useI18n();
  const locale = (language in COPY ? language : "en") as CopyKey;
  const copy = COPY[locale];
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute } = useProfile({ enabled: isAuthenticated });
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredKeyword = useDeferredValue(searchKeyword);
  const query = useTeamSearchQuery(deferredKeyword, isAuthenticated && hasProfile);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={BRAND} size="small" />
          <Text style={styles.centerStateText}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.centerStateTitle}>{copy.needProfileTitle}</Text>
          <View style={styles.emptyActions}>
            <Pressable style={styles.primaryButton} onPress={() => router.replace(nextOnboardingRoute)}>
              <Text style={styles.primaryButtonLabel}>{copy.continueOnboarding}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.replace("/")}>
              <Text style={styles.secondaryButtonLabel}>{copy.goHome}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={BRAND} />}
      >
        <View style={styles.headerCopyWrap}>
          <Text style={styles.pageTitle}>{copy.title}</Text>
          <Text style={styles.pageSubtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons color={TEXT_SECONDARY} name="search" size={18} />
          <TextInput
            onChangeText={setSearchKeyword}
            placeholder={copy.placeholder}
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchKeyword}
          />
          {searchKeyword.length > 0 ? (
            <Pressable hitSlop={10} onPress={() => setSearchKeyword("")}>
              <Ionicons color="#9ca3af" name="close-circle" size={18} />
            </Pressable>
          ) : null}
        </View>

        {query.isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={BRAND} size="small" />
            <Text style={styles.centerStateText}>{copy.loading}</Text>
          </View>
        ) : query.error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{query.error.message}</Text>
            <Pressable style={styles.primaryButton} onPress={() => void query.refetch()}>
              <Text style={styles.primaryButtonLabel}>{copy.retry}</Text>
            </Pressable>
          </View>
        ) : query.data && query.data.length > 0 ? (
          <View style={styles.cardList}>
            {query.data.map((team) => (
              <TeamFindCard key={team.id} team={team} locale={locale} copy={copy} />
            ))}
          </View>
        ) : (
          <View style={styles.centerState}>
            <Ionicons color="#cbd5e1" name="shield-outline" size={42} />
            <Text style={styles.centerStateTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.centerStateText}>{copy.emptyBody}</Text>
            <View style={styles.emptyActions}>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/team/create")}>
                <Text style={styles.primaryButtonLabel}>{copy.createTeam}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => router.push("/(tabs)/team/join")}>
                <Text style={styles.secondaryButtonLabel}>{copy.joinByCode}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 18,
  },
  headerCopyWrap: {
    gap: 8,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SECONDARY,
  },
  searchBar: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SEARCH_BG,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  cardList: {
    gap: 16,
  },
  card: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  cardHero: {
    backgroundColor: DARK_BG,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  cardHeroCopy: {
    flex: 1,
    gap: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: DARK_TAG_BG,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: DARK_TAG_TEXT,
  },
  emblemFallback: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  emblemFallbackLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: "#ffffff",
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_SECONDARY,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardSubMeta: {
    flex: 1,
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
  },
  detailPillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
  },
  centerState: {
    marginTop: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: "center",
    gap: 10,
  },
  centerStateTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  centerStateText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_SECONDARY,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#b91c1c",
  },
  emptyActions: {
    width: "100%",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
});
