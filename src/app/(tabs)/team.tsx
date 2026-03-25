import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";
import type { CreateTeamInviteResult, TeamMembershipRecord } from "@/types/team.types";

const PAGE_BG = "#ffffff";
const HEADER_BG = "#1a1a2e";
const HEADER_TAG_BG = "#2a2a3e";
const HEADER_TAG_TEXT = "#c7cad8";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#e9e9ef";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6b7280";
const ROLE_BG = "#facc15";
const ROLE_TEXT = "#7c5700";
const TIER_BG = "#eef2ff";
const TIER_TEXT = "#3757c5";
const INVITE_BG = "#dff7ee";
const INVITE_TEXT = "#15704f";
const FAB_BG = "#1d9e75";
const FAB_SHEET_BG = "#ffffff";
const DIVIDER = "#f0f1f5";

const COPY = {
  ko: {
    title: "내 팀",
    subtitle: "참여 중인 팀을 확인하세요",
    loading: "팀 목록을 불러오는 중입니다.",
    needProfileTitle: "팀 기능을 사용하려면 공통 프로필이 필요합니다.",
    needProfileBody: "프로필과 역할 온보딩을 완료한 뒤 팀을 만들거나 가입할 수 있습니다.",
    continueOnboarding: "온보딩 계속",
    goHome: "홈으로 이동",
    emptyTitle: "아직 참여 중인 팀이 없어요",
    emptyBody: "팀을 만들거나 초대코드로 가입해서 팀 활동을 시작해 보세요.",
    createTeam: "팀 만들기",
    joinByCode: "초대코드로 가입",
    chat: "채팅",
    matches: "경기",
    detail: "상세 보기",
    invite: "초대코드",
    inviteReady: "초대코드가 준비되었습니다",
    inviteCode: "초대코드",
    expiresAt: "만료일",
    shareInvite: "코드 공유",
    fabOpen: "팀 액션 열기",
    recruitingOpen: "모집중",
    recruitingClosed: "모집마감",
    createHint: "새 팀을 등록합니다",
    joinHint: "초대코드로 팀에 참여합니다",
    tier: "Bronze 0pt",
    joinedAt: "가입일",
    memberHint: "활성 멤버 수는 상세 보기에서 확인",
  },
  vi: {
    title: "Doi cua toi",
    subtitle: "Xem cac doi dang tham gia",
    loading: "Dang tai danh sach doi.",
    needProfileTitle: "Can ho so chung de dung tinh nang doi.",
    needProfileBody: "Hoan tat ho so va onboarding vai tro truoc khi tao hoac tham gia doi.",
    continueOnboarding: "Tiep tuc onboarding",
    goHome: "Ve trang chu",
    emptyTitle: "Ban chua tham gia doi nao",
    emptyBody: "Hay tao doi moi hoac tham gia bang ma moi de bat dau hoat dong cung doi bong.",
    createTeam: "Tao doi",
    joinByCode: "Tham gia bang ma moi",
    chat: "Chat",
    matches: "Tran dau",
    detail: "Chi tiet",
    invite: "Ma moi",
    inviteReady: "Ma moi da san sang",
    inviteCode: "Ma moi",
    expiresAt: "Het han",
    shareInvite: "Chia se ma",
    fabOpen: "Mo menu doi",
    recruitingOpen: "Dang tuyen",
    recruitingClosed: "Dong tuyen",
    createHint: "Dang ky doi moi",
    joinHint: "Nhap ma moi de tham gia doi",
    tier: "Bronze 0pt",
    joinedAt: "Ngay tham gia",
    memberHint: "Xem so thanh vien trong trang chi tiet",
  },
  en: {
    title: "My Teams",
    subtitle: "Check the teams you are participating in",
    loading: "Loading team list.",
    needProfileTitle: "A common profile is required before using team features.",
    needProfileBody: "Finish profile and role onboarding before creating or joining a team.",
    continueOnboarding: "Continue onboarding",
    goHome: "Go home",
    emptyTitle: "You have not joined any team yet",
    emptyBody: "Create a team or join with an invite code to start playing together.",
    createTeam: "Create team",
    joinByCode: "Join by code",
    chat: "Chat",
    matches: "Matches",
    detail: "Details",
    invite: "Invite code",
    inviteReady: "Invite code is ready",
    inviteCode: "Invite code",
    expiresAt: "Expires",
    shareInvite: "Share code",
    fabOpen: "Open team actions",
    recruitingOpen: "Recruiting",
    recruitingClosed: "Closed",
    createHint: "Register a new team",
    joinHint: "Join a team with an invite code",
    tier: "Bronze 0pt",
    joinedAt: "Joined",
    memberHint: "See member count in the detail screen",
  },
} as const;

type CopyKey = keyof typeof COPY;

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

function getRoleLabel(language: CopyKey, role: TeamMembershipRecord["role"]): string {
  const map = {
    ko: { owner: "Owner", manager: "Manager", captain: "Captain", player: "Player" },
    vi: { owner: "Chu doi", manager: "Quan ly", captain: "Doi truong", player: "Thanh vien" },
    en: { owner: "Owner", manager: "Manager", captain: "Captain", player: "Player" },
  } as const;

  return map[language][role];
}

function getSportLabel(language: CopyKey, sportType: TeamMembershipRecord["team"]["sport_type"]): string {
  const map = {
    ko: {
      soccer: "축구",
      futsal: "풋살",
      both: "축구·풋살",
    },
    vi: {
      soccer: "Bong da",
      futsal: "Futsal",
      both: "Bong da · Futsal",
    },
    en: {
      soccer: "Soccer",
      futsal: "Futsal",
      both: "Soccer · Futsal",
    },
  } as const;

  if (!sportType) {
    return map[language].soccer;
  }

  return map[language][sportType];
}

function buildInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk.charAt(0).toUpperCase())
      .join("") || name.slice(0, 1).toUpperCase()
  );
}

function EmptyState(props: { copy: (typeof COPY)[CopyKey] }): JSX.Element {
  const { copy } = props;

  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons color="#8aa09a" name="people-outline" size={44} />
      </View>
      <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
      <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
      <View style={styles.emptyActions}>
        <Pressable style={styles.emptyPrimaryButton} onPress={() => router.push("/(team)/create")}>
          <Text style={styles.emptyPrimaryButtonLabel}>{copy.createTeam}</Text>
        </Pressable>
        <Pressable style={styles.emptySecondaryButton} onPress={() => router.push("/(team)/join")}>
          <Text style={styles.emptySecondaryButtonLabel}>{copy.joinByCode}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FabSheet(props: {
  visible: boolean;
  copy: (typeof COPY)[CopyKey];
  onClose: () => void;
}): JSX.Element {
  const { visible, copy, onClose } = props;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{copy.fabOpen}</Text>
          <Pressable
            style={styles.sheetActionButton}
            onPress={() => {
              onClose();
              router.push("/(team)/create");
            }}
          >
            <View style={styles.sheetActionIconWrap}>
              <Ionicons color={FAB_BG} name="add" size={20} />
            </View>
            <View style={styles.sheetActionCopy}>
              <Text style={styles.sheetActionTitle}>{copy.createTeam}</Text>
              <Text style={styles.sheetActionBody}>{copy.createHint}</Text>
            </View>
            <Ionicons color="#9aa0ad" name="chevron-forward" size={18} />
          </Pressable>
          <Pressable
            style={styles.sheetActionButton}
            onPress={() => {
              onClose();
              router.push("/(team)/join");
            }}
          >
            <View style={[styles.sheetActionIconWrap, styles.sheetActionIconWrapAlt]}>
              <Ionicons color="#0f766e" name="key-outline" size={18} />
            </View>
            <View style={styles.sheetActionCopy}>
              <Text style={styles.sheetActionTitle}>{copy.joinByCode}</Text>
              <Text style={styles.sheetActionBody}>{copy.joinHint}</Text>
            </View>
            <Ionicons color="#9aa0ad" name="chevron-forward" size={18} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TeamCard(props: {
  membership: TeamMembershipRecord;
  copy: (typeof COPY)[CopyKey];
  locale: CopyKey;
  regionLabel: string;
  inviteInfo?: CreateTeamInviteResult;
  isInviteBusy: boolean;
  onCreateInvite: () => void;
  onShareInvite: () => void;
}): JSX.Element {
  const { membership, copy, locale, regionLabel, inviteInfo, isInviteBusy, onCreateInvite, onShareInvite } = props;
  const isTeamManager = membership.role === "owner" || membership.role === "manager";
  const joinedLabel = membership.joined_at ? `${copy.joinedAt} · ${formatDate(membership.joined_at)}` : copy.memberHint;

  return (
    <View style={styles.teamCard}>
      <View style={styles.teamCardHero}>
        <View style={styles.teamCardHeroCopy}>
          <Text style={styles.teamCardTitle}>{membership.team.name}</Text>
          <View style={styles.tagRow}>
            <View style={styles.darkTag}>
              <Text style={styles.darkTagLabel}>{regionLabel}</Text>
            </View>
            <View style={styles.darkTag}>
              <Text style={styles.darkTagLabel}>{membership.team.is_recruiting ? copy.recruitingOpen : copy.recruitingClosed}</Text>
            </View>
          </View>
        </View>
        <View style={styles.emblemFallback}>
          <Text style={styles.emblemFallbackLabel}>{buildInitials(membership.team.name)}</Text>
        </View>
      </View>

      <View style={styles.teamMetaRow}>
        <View style={styles.metaBadges}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeLabel}>{getRoleLabel(locale, membership.role)}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeLabel}>{copy.tier}</Text>
          </View>
        </View>
        <Text style={styles.metaHint}>{copy.memberHint}</Text>
      </View>

      <View style={styles.subMetaRow}>
        <Text style={styles.subMetaText}>{joinedLabel}</Text>
        <Text style={styles.subMetaText}>{getSportLabel(locale, membership.team.sport_type)}</Text>
      </View>

      <View style={styles.actionGrid}>
        <Pressable
          style={styles.actionCell}
          onPress={() => router.push({ pathname: "/(team)/[teamId]/chat", params: { teamId: membership.team.id } })}
        >
          <Ionicons color="#4b5563" name="chatbubble-ellipses-outline" size={20} />
          <Text style={styles.actionCellLabel}>{copy.chat}</Text>
        </Pressable>
        <Pressable
          style={styles.actionCell}
          onPress={() => router.push({ pathname: "/(team)/[teamId]/matches", params: { teamId: membership.team.id } })}
        >
          <Ionicons color="#4b5563" name="calendar-outline" size={20} />
          <Text style={styles.actionCellLabel}>{copy.matches}</Text>
        </Pressable>
        <Pressable
          style={styles.actionCell}
          onPress={() => router.push({ pathname: "/(team)/[teamId]", params: { teamId: membership.team.id } })}
        >
          <Ionicons color="#4b5563" name="shield-outline" size={20} />
          <Text style={styles.actionCellLabel}>{copy.detail}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionCell, styles.actionCellInvite, !isTeamManager ? styles.actionCellDisabled : null]}
          disabled={!isTeamManager || isInviteBusy}
          onPress={onCreateInvite}
        >
          <Ionicons color={isTeamManager ? INVITE_TEXT : "#9ca3af"} name="link-outline" size={20} />
          <Text style={[styles.actionCellLabel, isTeamManager ? styles.actionCellInviteLabel : styles.actionCellDisabledLabel]}>
            {copy.invite}
          </Text>
        </Pressable>
      </View>

      {inviteInfo ? (
        <View style={styles.inviteBanner}>
          <View style={styles.inviteBannerCopy}>
            <Text style={styles.inviteBannerTitle}>{copy.inviteReady}</Text>
            <Text style={styles.inviteBannerBody}>{`${copy.inviteCode}: ${inviteInfo.invite_code}`}</Text>
            {inviteInfo.expires_at ? (
              <Text style={styles.inviteBannerExpiry}>{`${copy.expiresAt}: ${formatDate(inviteInfo.expires_at) ?? inviteInfo.expires_at}`}</Text>
            ) : null}
          </View>
          <Pressable style={styles.inviteShareButton} onPress={onShareInvite}>
            <Text style={styles.inviteShareButtonLabel}>{copy.shareInvite}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function TeamsScreen(): JSX.Element {
  const { language } = useI18n();
  const locale = (language in COPY ? language : "en") as CopyKey;
  const copy = COPY[locale];
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
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
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (isAuthenticated && hasProfile) {
      void loadMyTeams();
    }
  }, [hasProfile, isAuthenticated, refresh]);

  const getRegionLabel = (membership: TeamMembershipRecord): string => {
    const provinceLabel = getOptionLabel(provinceOptions, membership.team.province_code) ?? membership.team.province_code;
    const districtLabel =
      getOptionLabel(getDistrictOptions(membership.team.province_code), membership.team.district_code) ??
      membership.team.district_code;

    return `${provinceLabel} · ${districtLabel}`;
  };

  const handleCreateInvite = async (teamId: string): Promise<void> => {
    try {
      const result = await createTeamInvite(teamId);
      setInviteMap((previous) => ({
        ...previous,
        [teamId]: result,
      }));
    } catch {
      // hook-level message rendered below
    }
  };

  const handleShareInvite = async (inviteInfo: CreateTeamInviteResult): Promise<void> => {
    try {
      await Share.share({
        message: `${copy.inviteCode}: ${inviteInfo.invite_code}`,
      });
    } catch {
      // keep current UI state only
    }
  };

  const renderBody = (): JSX.Element => {
    if (isAuthLoading || isProfileLoading || isTeamsLoading) {
      return (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{copy.title}</Text>
          <Text style={styles.stateBody}>{copy.loading}</Text>
        </View>
      );
    }

    if (!hasProfile) {
      return (
        <View style={styles.stateWrap}>
          <Text style={styles.stateTitle}>{copy.title}</Text>
          <Text style={styles.stateBody}>{copy.needProfileTitle}</Text>
          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingBody}>{copy.needProfileBody}</Text>
            <Pressable style={styles.fullPrimaryButton} onPress={() => router.replace(nextOnboardingRoute)}>
              <Text style={styles.fullPrimaryButtonLabel}>{copy.continueOnboarding}</Text>
            </Pressable>
            <Pressable style={styles.fullSecondaryButton} onPress={() => router.replace("/")}>
              <Text style={styles.fullSecondaryButtonLabel}>{copy.goHome}</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (teams.length === 0) {
      return <EmptyState copy={copy} />;
    }

    return (
      <View style={styles.contentWrap}>
        <View style={styles.headerCopyWrap}>
          <Text style={styles.pageTitle}>{copy.title}</Text>
          <Text style={styles.pageSubtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.cardList}>
          {teams.map((membership) => {
            const inviteInfo = inviteMap[membership.team.id];

            return (
              <TeamCard
                key={membership.id}
                membership={membership}
                copy={copy}
                locale={locale}
                regionLabel={getRegionLabel(membership)}
                inviteInfo={inviteInfo}
                isInviteBusy={isSubmittingTeam}
                onCreateInvite={() => void handleCreateInvite(membership.team.id)}
                onShareInvite={() => {
                  if (inviteInfo) {
                    void handleShareInvite(inviteInfo);
                  }
                }}
              />
            );
          })}
        </View>

        {teamStatusMessage ? <Text style={styles.statusText}>{teamStatusMessage}</Text> : null}
        {teamErrorMessage ? <Text style={styles.errorText}>{teamErrorMessage}</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderBody()}
        </ScrollView>

        {hasProfile && teams.length > 0 ? (
          <Pressable accessibilityLabel={copy.fabOpen} style={styles.fabButton} onPress={() => setSheetVisible(true)}>
            <Ionicons color="#ffffff" name="add" size={28} />
          </Pressable>
        ) : null}

        <FabSheet visible={sheetVisible} copy={copy} onClose={() => setSheetVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  root: { flex: 1, backgroundColor: PAGE_BG },
  scrollContent: { flexGrow: 1, paddingBottom: 120 },
  contentWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: PAGE_BG,
  },
  headerCopyWrap: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_SECONDARY,
  },
  cardList: {
    gap: 16,
  },
  teamCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  teamCardHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    backgroundColor: HEADER_BG,
    padding: 18,
  },
  teamCardHeroCopy: {
    flex: 1,
    gap: 10,
  },
  teamCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  darkTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: HEADER_TAG_BG,
  },
  darkTagLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: HEADER_TAG_TEXT,
  },
  emblemFallback: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  emblemFallbackLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  teamMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  metaBadges: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: ROLE_BG,
  },
  roleBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: ROLE_TEXT,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: TIER_BG,
  },
  tierBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TIER_TEXT,
  },
  metaHint: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: "right",
    flexShrink: 1,
  },
  subMetaRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  subMetaText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: CARD_BG,
  },
  actionCell: {
    width: "48.5%",
    minHeight: 82,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f6f7fb",
  },
  actionCellInvite: {
    backgroundColor: INVITE_BG,
  },
  actionCellDisabled: {
    opacity: 0.55,
  },
  actionCellLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  actionCellInviteLabel: {
    color: INVITE_TEXT,
  },
  actionCellDisabledLabel: {
    color: "#9ca3af",
  },
  inviteBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f4fbf8",
    borderWidth: 1,
    borderColor: "#d5efe4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inviteBannerCopy: {
    flex: 1,
    gap: 4,
  },
  inviteBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: INVITE_TEXT,
  },
  inviteBannerBody: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  inviteBannerExpiry: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  inviteShareButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: HEADER_BG,
  },
  inviteShareButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  fabButton: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FAB_BG,
    shadowColor: "#111827",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,24,39,0.3)",
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: FAB_SHEET_BG,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#d7d9e1",
  },
  sheetTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  sheetActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DIVIDER,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  sheetActionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eefaf5",
  },
  sheetActionIconWrapAlt: {
    backgroundColor: "#edf7fb",
  },
  sheetActionCopy: {
    flex: 1,
    gap: 4,
  },
  sheetActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  sheetActionBody: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SECONDARY,
  },
  emptyWrap: {
    minHeight: 620,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
    backgroundColor: PAGE_BG,
  },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f6f4",
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
  emptyActions: {
    width: "100%",
    gap: 12,
    marginTop: 28,
  },
  emptyPrimaryButton: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: HEADER_BG,
  },
  emptyPrimaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptySecondaryButton: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: "#ffffff",
  },
  emptySecondaryButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  stateWrap: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: PAGE_BG,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  stateBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SECONDARY,
  },
  onboardingCard: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 12,
  },
  onboardingBody: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SECONDARY,
  },
  fullPrimaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: HEADER_BG,
  },
  fullPrimaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  fullSecondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: "#ffffff",
  },
  fullSecondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  statusText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.brand,
  },
  errorText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 13,
    color: "#b83a3a",
  },
});
