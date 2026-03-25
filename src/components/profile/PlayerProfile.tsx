import * as ImagePicker from "expo-image-picker";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  FOOT_SKILL_VALUES,
  getPlayStyleLabels,
  getPlayerProfileSectionCopy,
  getPreferredFootLabel,
} from "@/constants/player-profile-sections";
import { getCountryFlag, getCountryLabel, getAgeBandLabel, getProfileDashboardCopy, getRoleBadgeLabel, getStatusBadgeLabel, getTierDisplay, buildRadarValues } from "@/constants/profile-dashboard";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfileDashboard } from "@/hooks/usePlayerProfileDashboard";
import { ProfileRadarChart, type RadarMetric } from "@/shared/components/ProfileRadarChart";
import type { SupportedAvatarContentType, SupportedLanguage } from "@/types/profile.types";

const HEADER_BG = "#161827";
const HEADER_MUTED = "#8d92ae";
const TAG_BG = "#262a3d";
const CARD_BG = "#ffffff";
const PAGE_BG = "#eff1f7";
const BORDER = "#e7e9f0";
const TEXT_DARK = "#111827";
const TEXT_SOFT = "#6b7280";
const OWNER_BG = "#fde68a";
const OWNER_TEXT = "#92400e";
const BLUE = "#3b82f6";
const RED = "#ff2d55";
const BLUE_SOFT = "#dbeafe";
const MODAL_BACKDROP = "rgba(15, 23, 42, 0.42)";

type MetricRow = {
  key: string;
  label: string;
  value: number;
};

const METRIC_LABELS: Record<SupportedLanguage, Omit<Record<keyof ReturnType<typeof buildRadarValues>, string>, never>> = {
  ko: {
    stamina: "\uCCB4\uB825",
    dribble: "\uB4DC\uB9AC\uBE14",
    shooting: "\uC288\uD305",
    speed: "\uC2A4\uD53C\uB4DC",
    defense: "\uC218\uBE44",
    pass: "\uD328\uC2A4",
  },
  vi: {
    stamina: "The luc",
    dribble: "Di bong",
    shooting: "Sut",
    speed: "Toc do",
    defense: "Phong ngu",
    pass: "Chuyen bong",
  },
  en: {
    stamina: "Stamina",
    dribble: "Dribble",
    shooting: "Shooting",
    speed: "Speed",
    defense: "Defense",
    pass: "Pass",
  },
};

const ROLE_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  ko: {
    player: "\uC120\uC218",
    referee: "\uC2EC\uD310",
    facility_manager: "\uAD00\uB9AC\uC790",
  },
  vi: {
    player: "Cau thu",
    referee: "Trong tai",
    facility_manager: "Quan ly",
  },
  en: {
    player: "Player",
    referee: "Referee",
    facility_manager: "Manager",
  },
};

function getAvatarContentType(asset: ImagePicker.ImagePickerAsset): SupportedAvatarContentType | null {
  const mimeType = asset.mimeType?.toLowerCase();

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  ) {
    return mimeType;
  }

  const sourceName = (asset.fileName ?? asset.uri).toLowerCase();

  if (sourceName.endsWith(".jpg") || sourceName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (sourceName.endsWith(".png")) {
    return "image/png";
  }

  if (sourceName.endsWith(".webp")) {
    return "image/webp";
  }

  if (sourceName.endsWith(".heic")) {
    return "image/heic";
  }

  if (sourceName.endsWith(".heif")) {
    return "image/heif";
  }

  return null;
}

function getAvatarFileName(asset: ImagePicker.ImagePickerAsset, contentType: SupportedAvatarContentType): string {
  if (asset.fileName) {
    return asset.fileName;
  }

  if (contentType === "image/png") {
    return `avatar-${Date.now()}.png`;
  }

  if (contentType === "image/webp") {
    return `avatar-${Date.now()}.webp`;
  }

  if (contentType === "image/heic") {
    return `avatar-${Date.now()}.heic`;
  }

  if (contentType === "image/heif") {
    return `avatar-${Date.now()}.heif`;
  }

  return `avatar-${Date.now()}.jpg`;
}

function getInitials(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "KG";
  }

  const tokens = trimmed.split(/\s+/).slice(0, 2);
  return tokens.map((token) => token[0]?.toUpperCase() ?? "").join("") || trimmed.slice(0, 2).toUpperCase();
}

function getPrimaryRoleLabel(language: SupportedLanguage, accountTypes: string[]): string {
  const prioritizedRole = accountTypes[0] ?? "player";
  return ROLE_LABELS[language][prioritizedRole] ?? ROLE_LABELS[language].player;
}

function getMetrics(language: SupportedLanguage, reputationScore: number): { radar: RadarMetric[]; rows: MetricRow[] } {
  const values = buildRadarValues(reputationScore);
  const labels = METRIC_LABELS[language];

  const rows: MetricRow[] = [
    { key: "stamina", label: labels.stamina, value: values.stamina },
    { key: "dribble", label: labels.dribble, value: values.dribble },
    { key: "shooting", label: labels.shooting, value: values.shooting },
    { key: "speed", label: labels.speed, value: values.speed },
    { key: "defense", label: labels.defense, value: values.defense },
    { key: "pass", label: labels.pass, value: values.pass },
  ];

  return {
    radar: rows.map((row) => ({ key: row.key, label: row.label, value: row.value })),
    rows,
  };
}

function StatTile(props: { value: number; label: string }): JSX.Element {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{props.value}</Text>
      <Text style={styles.statLabel}>{props.label}</Text>
    </View>
  );
}

export default function ProfileTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getProfileDashboardCopy(language);
  const sectionCopy = getPlayerProfileSectionCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const dashboard = usePlayerProfileDashboard({
    userId: user?.id ?? null,
    enabled: isAuthenticated,
  });
  const [skillEditorSide, setSkillEditorSide] = useState<"left" | "right" | null>(null);
  const [skillDraft, setSkillDraft] = useState(3);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  const profile = dashboard.profileBundle?.profile ?? null;
  const playerProfile = dashboard.profileBundle?.playerProfile ?? null;
  const accountTypes = dashboard.profileBundle?.accountTypes ?? [];
  const displayName = profile?.display_name?.trim() || user?.email || "KickGo";
  const statusBadge = getStatusBadgeLabel(language, playerProfile?.preferred_position);
  const primaryRoleLabel = getPrimaryRoleLabel(language, accountTypes);
  const countryLabel = `${getCountryFlag(profile?.country_code)} ${getCountryLabel(language, profile?.country_code, copy.countryFallback)}`;
  const secondaryTag = getAgeBandLabel(language, profile?.birth_year, primaryRoleLabel);
  const tierDisplay = getTierDisplay(language, playerProfile?.skill_tier ?? 0, playerProfile?.reputation_score ?? 0);
  const metrics = useMemo(() => getMetrics(language, playerProfile?.reputation_score ?? 0), [language, playerProfile?.reputation_score]);
  const playStyleLabels = useMemo(
    () => getPlayStyleLabels(language, playerProfile?.play_styles ?? []),
    [language, playerProfile?.play_styles],
  );
  const needsPlayerProfileOnboarding = !playerProfile || !playerProfile.preferred_position;

  const handleUploadAvatar = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("KickGo", copy.uploadAvatar);
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
      Alert.alert("KickGo", "Only JPG, PNG, WEBP, HEIC, or HEIF files are supported.");
      return;
    }

    try {
      await dashboard.uploadAvatar({
        uri: asset.uri,
        fileName: getAvatarFileName(asset, contentType),
        contentType,
      });
    } catch (error: unknown) {
      Alert.alert("KickGo", error instanceof Error ? error.message : "Avatar upload failed.");
    }
  };

  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        message: `${displayName} - KickGo`,
      });
    } catch {
      // ignore native share cancel
    }
  };

  const openFootSkillEditor = (side: "left" | "right"): void => {
    if (!playerProfile) {
      Alert.alert("KickGo", sectionCopy.playerProfileRequired);
      return;
    }

    setSkillEditorSide(side);
    setSkillDraft(side === "left" ? playerProfile.left_foot_skill : playerProfile.right_foot_skill);
  };

  const closeFootSkillEditor = (): void => {
    if (dashboard.isUpdatingPlayerProfile) {
      return;
    }

    setSkillEditorSide(null);
  };

  const handleSaveFootSkill = async (): Promise<void> => {
    if (!skillEditorSide) {
      return;
    }

    try {
      await dashboard.updatePlayerProfile(
        skillEditorSide === "left" ? { leftFootSkill: skillDraft } : { rightFootSkill: skillDraft },
      );
      setSkillEditorSide(null);
    } catch (error: unknown) {
      Alert.alert("KickGo", error instanceof Error ? error.message : sectionCopy.footSkillSave);
    }
  };

  const handleOpenPlayStyle = (): void => {
    if (!playerProfile) {
      Alert.alert("KickGo", sectionCopy.playerProfileRequired);
      return;
    }

    router.push("/(tabs)/profile/play-style");
  };

  if (isAuthLoading || dashboard.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{copy.noProfileTitle}</Text>
          <Text style={styles.emptyBody}>{copy.noProfileBody}</Text>
          <Pressable style={styles.primaryWideButton} onPress={() => router.push("/(onboarding)/create-profile")}>
            <Text style={styles.primaryWideButtonLabel}>{copy.continueOnboarding}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={dashboard.isLoading} onRefresh={() => void dashboard.refetchAll()} tintColor="#ffffff" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <View style={styles.headerActionsRow}>
            <Pressable hitSlop={12} onPress={() => router.replace("/(tabs)/home")} style={styles.iconButton}>
              <Ionicons color="#ffffff" name="chevron-back" size={24} />
            </Pressable>
            <View style={styles.headerRightActions}>
              <Pressable hitSlop={12} onPress={() => void handleShare()} style={styles.iconButton}>
                <Ionicons color="#ffffff" name="share-social-outline" size={22} />
              </Pressable>
              <Pressable hitSlop={12} onPress={() => router.push("/notifications")} style={styles.iconButton}>
                <Ionicons color="#ffffff" name="notifications-outline" size={22} />
              </Pressable>
              <Pressable hitSlop={12} onPress={() => router.push("/(settings)/settings")} style={styles.iconButton}>
                <Ionicons color="#ffffff" name="settings-outline" size={22} />
              </Pressable>
            </View>
          </View>

          <View style={styles.profileHeroRow}>
            <View style={styles.heroTextBlock}>
              <Pressable onPress={() => router.push("/(onboarding)/create-profile?mode=edit")} style={styles.nameRow}>
                <Text style={styles.heroName}>{displayName}</Text>
                <Ionicons color="#ffffff" name="chevron-forward" size={18} />
              </Pressable>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeLabel}>{statusBadge}</Text>
              </View>
              <View style={styles.tagRow}>
                <View style={styles.tagPill}>
                  <Text style={styles.tagLabel}>{countryLabel}</Text>
                </View>
                <View style={styles.tagPill}>
                  <Text style={styles.tagLabel}>{secondaryTag}</Text>
                </View>
              </View>
            </View>

            <View style={styles.avatarWrap}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackLabel}>{getInitials(displayName)}</Text>
                </View>
              )}
              <Pressable onPress={() => void handleUploadAvatar()} style={styles.cameraButton}>
                <Ionicons color={TEXT_DARK} name="camera-outline" size={16} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.cardsWrap}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.categoryToggle}>
                <Ionicons color={TEXT_SOFT} name="chevron-up" size={14} />
                <Text style={styles.categoryToggleLabel}>{copy.competitionLabel}</Text>
                <Ionicons color={TEXT_SOFT} name="chevron-down" size={14} />
              </View>
            </View>
            <View style={styles.statsRow}>
              <StatTile value={0} label={copy.statMatches} />
              <StatTile value={0} label={copy.statGoals} />
              <StatTile value={0} label={copy.statAssists} />
              <StatTile value={0} label={copy.statMvp} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.teamTitle}</Text>
            {dashboard.teams.length > 0 ? (
              <View style={styles.teamListWrap}>
                {dashboard.teams.map((membership, index) => (
                  <View key={membership.id}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(team)/[teamId]",
                          params: { teamId: membership.team.id },
                        })
                      }
                      style={styles.teamRow}
                    >
                      {membership.team.emblem_url ? (
                        <Image source={{ uri: membership.team.emblem_url }} style={styles.teamEmblem} />
                      ) : (
                        <View style={styles.teamEmblemFallback}>
                          <Text style={styles.teamEmblemFallbackLabel}>{membership.team.name.slice(0, 1).toUpperCase()}</Text>
                        </View>
                      )}
                      <View style={styles.teamRowBody}>
                        <View style={styles.teamNameRow}>
                          <Text numberOfLines={1} style={styles.teamName}>{membership.team.name}</Text>
                          <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeLabel}>{getRoleBadgeLabel(language, membership.role)}</Text>
                          </View>
                        </View>
                        <Text numberOfLines={1} style={styles.teamMeta}>
                          {membership.team.province_code} / {membership.team.district_code}
                        </Text>
                      </View>
                      <Ionicons color={TEXT_SOFT} name="chevron-forward" size={18} />
                    </Pressable>
                    {index < dashboard.teams.length - 1 ? <View style={styles.cardDivider} /> : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noTeamCard}>
                <Text style={styles.noTeamTitle}>{copy.noTeamTitle}</Text>
                <Text style={styles.noTeamBody}>{copy.noTeamBody}</Text>
              </View>
            )}
            <View style={styles.bottomActionRow}>
              <Pressable onPress={() => router.push("/(team)/find")} style={styles.bottomActionButton}>
                <Feather color={TEXT_SOFT} name="search" size={18} />
                <Text style={styles.bottomActionLabel}>{copy.teamFind}</Text>
              </Pressable>
              <View style={styles.bottomActionDivider} />
              <Pressable onPress={() => router.push("/(team)/create")} style={styles.bottomActionButton}>
                <Ionicons color={TEXT_SOFT} name="add" size={20} />
                <Text style={styles.bottomActionLabel}>{copy.teamCreate}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.levelHeaderRow}>
              <Text style={styles.sectionTitle}>{copy.levelTitle}</Text>
              <Pressable onPress={() => Alert.alert("KickGo", copy.levelInputSoon)} style={styles.levelTitleButton}>
                <View style={styles.tierIconWrap}>
                  <Ionicons color={BLUE} name="sparkles" size={15} />
                </View>
                <Text style={styles.tierSummary}>{`${tierDisplay.label} ${tierDisplay.score}`}</Text>
                <Ionicons color={TEXT_SOFT} name="chevron-forward" size={16} />
              </Pressable>
            </View>

            <ProfileRadarChart metrics={metrics.radar} />

            <View style={styles.metricRowsWrap}>
              {metrics.rows.map((metric) => (
                <View key={metric.key} style={styles.metricRow}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <View style={styles.metricTrack}>
                    <View style={[styles.metricFill, { width: `${metric.value}%` }]} />
                  </View>
                  <Text style={styles.metricValue}>{metric.value}/100</Text>
                </View>
              ))}
            </View>

            <Pressable onPress={() => Alert.alert("KickGo", copy.scoreInputSoon)} style={styles.fabButton}>
              <Ionicons color="#ffffff" name="add" size={26} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.inlineHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>{sectionCopy.footSkillTitle}</Text>
                <Text style={styles.sectionDescription}>{sectionCopy.footSkillDescription}</Text>
              </View>
              <View style={styles.preferredFootBadge}>
                <Text style={styles.preferredFootLabel}>{`${sectionCopy.preferredFootLabel} / ${getPreferredFootLabel(language, playerProfile?.preferred_foot)}`}</Text>
              </View>
            </View>

            <View style={styles.footSkillRow}>
              <Pressable
                disabled={dashboard.isUpdatingPlayerProfile}
                onPress={() => openFootSkillEditor("left")}
                style={({ pressed }) => [styles.footSkillItem, pressed ? styles.footSkillItemPressed : null]}
              >
                <View style={styles.footSkillIconWrap}>
                  <FontAwesome5 color={BLUE} name="shoe-prints" size={20} />
                </View>
                <Text style={styles.footSkillLabel}>{sectionCopy.leftFoot}</Text>
                <Text style={styles.footSkillValue}>{playerProfile?.left_foot_skill ?? 3}/5</Text>
              </Pressable>

              <Pressable
                disabled={dashboard.isUpdatingPlayerProfile}
                onPress={() => openFootSkillEditor("right")}
                style={({ pressed }) => [styles.footSkillItem, pressed ? styles.footSkillItemPressed : null]}
              >
                <View style={styles.footSkillIconWrap}>
                  <FontAwesome5 color={BLUE} name="shoe-prints" size={20} />
                </View>
                <Text style={styles.footSkillLabel}>{sectionCopy.rightFoot}</Text>
                <Text style={styles.footSkillValue}>{playerProfile?.right_foot_skill ?? 3}/5</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleOpenPlayStyle} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
            <View style={styles.playStyleHeaderRow}>
              <View style={styles.playStyleTitleWrap}>
                <Text style={styles.sectionTitle}>{sectionCopy.playStyleTitle}</Text>
                <Text style={styles.sectionDescription}>{sectionCopy.playStyleSubtitle}</Text>
              </View>
              <Ionicons color={TEXT_SOFT} name="chevron-forward" size={18} />
            </View>

            {playStyleLabels.length > 0 ? (
              <View style={styles.playStyleTagWrap}>
                {playStyleLabels.map((label) => (
                  <View key={label} style={styles.playStyleTag}>
                    <Text style={styles.playStyleTagLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStylePill}>
                <Text style={styles.emptyStylePillLabel}>{sectionCopy.playStyleEmpty}</Text>
              </View>
            )}
          </Pressable>

          {dashboard.errorMessage ? <Text style={styles.errorText}>{dashboard.errorMessage}</Text> : null}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={skillEditorSide !== null} onRequestClose={closeFootSkillEditor}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeFootSkillEditor} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>{sectionCopy.footSkillModalTitle}</Text>
            <Text style={styles.bottomSheetSubtitle}>
              {skillEditorSide === "left" ? sectionCopy.leftFoot : sectionCopy.rightFoot}
            </Text>

            <View style={styles.skillOptionRow}>
              {FOOT_SKILL_VALUES.map((value) => {
                const isSelected = value === skillDraft;

                return (
                  <Pressable
                    key={value}
                    disabled={dashboard.isUpdatingPlayerProfile}
                    onPress={() => setSkillDraft(value)}
                    style={[styles.skillOption, isSelected ? styles.skillOptionSelected : styles.skillOptionIdle]}
                  >
                    <Text style={[styles.skillOptionLabel, isSelected ? styles.skillOptionLabelSelected : styles.skillOptionLabelIdle]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.bottomSheetActions}>
              <Pressable disabled={dashboard.isUpdatingPlayerProfile} onPress={closeFootSkillEditor} style={styles.sheetSecondaryButton}>
                <Text style={styles.sheetSecondaryLabel}>{sectionCopy.footSkillCancel}</Text>
              </Pressable>
              <Pressable
                disabled={dashboard.isUpdatingPlayerProfile}
                onPress={() => void handleSaveFootSkill()}
                style={[styles.sheetPrimaryButton, dashboard.isUpdatingPlayerProfile ? styles.sheetPrimaryButtonDisabled : null]}
              >
                <Text style={styles.sheetPrimaryLabel}>
                  {dashboard.isUpdatingPlayerProfile ? "Saving..." : sectionCopy.footSkillSave}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scrollContent: {
    paddingBottom: 48,
  },
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
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: PAGE_BG,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  emptyBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SOFT,
  },
  primaryWideButton: {
    marginTop: 24,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: RED,
  },
  primaryWideButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerBlock: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 96,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    minWidth: 28,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeroRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextBlock: {
    flex: 1,
    gap: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#ffffff",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: TAG_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusBadgeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagPill: {
    borderRadius: 14,
    backgroundColor: TAG_BG,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  avatarWrap: {
    position: "relative",
    marginTop: 8,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#ffffff",
    backgroundColor: "#d9d9d9",
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#ffffff",
    backgroundColor: "#d8b4fe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackLabel: {
    fontSize: 34,
    fontWeight: "800",
    color: HEADER_BG,
  },
  cameraButton: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardsWrap: {
    marginTop: -56,
    paddingHorizontal: 20,
    gap: 18,
  },
  card: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
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
  },
  categoryToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryToggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  statsRow: {
    marginTop: 18,
    flexDirection: "row",
  },
  statTile: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  teamListWrap: {
    marginTop: 14,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  teamEmblem: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  teamEmblemFallback: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  teamEmblemFallbackLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  teamRowBody: {
    flex: 1,
    gap: 6,
  },
  teamNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamName: {
    maxWidth: "68%",
    fontSize: 17,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: OWNER_BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: OWNER_TEXT,
  },
  teamMeta: {
    fontSize: 13,
    color: TEXT_SOFT,
  },
  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
  },
  noTeamCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    padding: 16,
    gap: 8,
  },
  noTeamTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  noTeamBody: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_SOFT,
  },
  bottomActionRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
  },
  bottomActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  bottomActionDivider: {
    width: 1,
    height: 22,
    backgroundColor: BORDER,
  },
  bottomActionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  levelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelTitleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tierIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0ecff",
  },
  tierSummary: {
    fontSize: 16,
    fontWeight: "700",
    color: BLUE,
  },
  metricRowsWrap: {
    marginTop: 4,
    gap: 10,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricLabel: {
    width: 62,
    fontSize: 13,
    color: TEXT_DARK,
  },
  metricTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#e5edf9",
    overflow: "hidden",
  },
  metricFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: BLUE,
  },
  metricValue: {
    width: 52,
    textAlign: "right",
    fontSize: 12,
    color: TEXT_SOFT,
  },
  fabButton: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: RED,
    shadowColor: RED,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.96,
  },
  inlineHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SOFT,
  },
  preferredFootBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  preferredFootLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BLUE,
  },
  footSkillRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  footSkillItem: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fbfdff",
  },
  footSkillItemPressed: {
    opacity: 0.9,
  },
  footSkillIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BLUE_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  footSkillLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  footSkillValue: {
    fontSize: 22,
    fontWeight: "800",
    color: BLUE,
  },
  playStyleHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  playStyleTitleWrap: {
    flex: 1,
  },
  playStyleTagWrap: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  playStyleTag: {
    borderRadius: 999,
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  playStyleTagLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BLUE,
  },
  emptyStylePill: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#eef2f7",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  emptyStylePillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: MODAL_BACKDROP,
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomSheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#dbe3ef",
    marginBottom: 18,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  bottomSheetSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: TEXT_SOFT,
  },
  skillOptionRow: {
    marginTop: 24,
    flexDirection: "row",
    gap: 10,
  },
  skillOption: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  skillOptionSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  skillOptionIdle: {
    backgroundColor: "#ffffff",
    borderColor: BORDER,
  },
  skillOptionLabel: {
    fontSize: 18,
    fontWeight: "800",
  },
  skillOptionLabelSelected: {
    color: "#ffffff",
  },
  skillOptionLabelIdle: {
    color: TEXT_DARK,
  },
  bottomSheetActions: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  sheetSecondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2f7",
  },
  sheetSecondaryLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  sheetPrimaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLUE,
  },
  sheetPrimaryButtonDisabled: {
    opacity: 0.55,
  },
  sheetPrimaryLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  errorText: {
    paddingHorizontal: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b91c1c",
  },
});

