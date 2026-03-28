import * as ImagePicker from "expo-image-picker";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
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
  PROFILE_TEXT_DARK,
  PROFILE_TEXT_SOFT,
  getAvatarContentType,
  getAvatarFileName,
  getInitials,
} from "@/components/profile/profileShared";
import {
  FOOT_SKILL_VALUES,
  getPlayStyleLabels,
  getPlayerProfileSectionCopy,
  getPreferredFootLabel,
} from "@/constants/player-profile-sections";
import { useI18n } from "@/core/i18n/LanguageProvider";
import {
  buildRadarMetrics,
  getAgeBandLabel,
  getCountryFlag,
  getCountryLabel,
  getPlayerProfileCopy,
  getPositionOptions,
  getPrimaryRoleLabel,
  getRoleBadgeLabel,
  getStatusBadgeLabel,
  getTierDisplay,
} from "@/features/profile/player-profile.copy";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfileDashboard } from "@/hooks/usePlayerProfileDashboard";
import { ProfileRadarChart } from "@/shared/components/ProfileRadarChart";
import { MyMercenaryApplicationsPreview } from "@/features/mercenary/components/MyMercenaryApplicationsPreview";
import type { PlayerPosition, PlayerProfileRecord, SupportedAvatarContentType } from "@/types/profile.types";
import type { TeamMembershipRecord } from "@/types/team.types";

type PositionRank = "first" | "second" | "third";
type StatKey = "stamina" | "dribble" | "shooting" | "passing" | "defense" | "speed";
type StatsDraft = Record<StatKey, number>;
type PositionDraft = Record<PositionRank, PlayerPosition | null>;

const MODAL_BACKDROP = "rgba(15, 23, 42, 0.42)";
const SEGMENT_VALUES = Array.from({ length: 21 }, (_, index) => index * 5);

function clampStat(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function createStatsDraft(playerProfile: PlayerProfileRecord | null): StatsDraft {
  return {
    stamina: playerProfile?.stat_stamina ?? 50,
    dribble: playerProfile?.stat_dribble ?? 50,
    shooting: playerProfile?.stat_shooting ?? 50,
    passing: playerProfile?.stat_passing ?? 50,
    defense: playerProfile?.stat_defense ?? 50,
    speed: playerProfile?.stat_speed ?? 50,
  };
}

function createPositionDraft(playerProfile: PlayerProfileRecord | null): PositionDraft {
  return {
    first: playerProfile?.position_first ?? playerProfile?.preferred_position ?? null,
    second: playerProfile?.position_second ?? null,
    third: playerProfile?.position_third ?? null,
  };
}

function PositionRow(props: { label: string; value: string; onPress: () => void }): JSX.Element {
  return (
    <Pressable onPress={props.onPress} style={styles.positionRow}>
      <Text style={styles.positionRankLabel}>{props.label}</Text>
      <View style={styles.positionValueWrap}>
        <Text style={styles.positionValue}>{props.value}</Text>
        <Ionicons color={PROFILE_TEXT_SOFT} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function TeamMembershipCard(props: { membership: TeamMembershipRecord; roleLabel: string }): JSX.Element {
  const { membership, roleLabel } = props;
  const emblemUrl = membership.team.emblem_url;
  const teamName = membership.team.name;
  const regionLabel = `${membership.team.province_code} / ${membership.team.district_code}`;

  return (
    <Pressable onPress={() => router.push(`/(tabs)/team/${membership.team.id}`)} style={styles.teamCard}>
      <View style={styles.teamCardLeft}>
        {emblemUrl ? (
          <Image source={{ uri: emblemUrl }} style={styles.teamEmblem} />
        ) : (
          <View style={styles.teamEmblemFallback}>
            <Text style={styles.teamEmblemFallbackLabel}>{getInitials(teamName).slice(0, 1)}</Text>
          </View>
        )}
        <View style={styles.teamCopyWrap}>
          <Text numberOfLines={1} style={styles.teamNameLabel}>{teamName}</Text>
          <Text numberOfLines={1} style={styles.teamSubLabel}>{regionLabel}</Text>
        </View>
      </View>
      <View style={styles.teamRolePill}>
        <Text style={styles.teamRolePillLabel}>{roleLabel}</Text>
      </View>
    </Pressable>
  );
}

function StatEditorRow(props: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onSelect: (value: number) => void;
}): JSX.Element {
  return (
    <View style={styles.statEditorRow}>
      <View style={styles.statEditorHeader}>
        <Text style={styles.statEditorLabel}>{props.label}</Text>
        <Text style={styles.statEditorValue}>{props.value}</Text>
      </View>
      <View style={styles.statEditorControls}>
        <Pressable onPress={props.onDecrease} style={styles.statAdjustButton}>
          <Feather color={PROFILE_TEXT_DARK} name="minus" size={16} />
        </Pressable>
        <View style={styles.statSegmentsWrap}>
          {SEGMENT_VALUES.map((segmentValue) => {
            const active = props.value >= segmentValue;
            return (

          <Pressable
                key={`${props.label}-${segmentValue}`}
                onPress={() => props.onSelect(segmentValue)}
                style={[styles.statSegment, active ? styles.statSegmentActive : styles.statSegmentIdle]}
              />
            );
          })}
        </View>
        <Pressable onPress={props.onIncrease} style={styles.statAdjustButton}>
          <Feather color={PROFILE_TEXT_DARK} name="plus" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

function StatTile(props: { value: number; label: string }): JSX.Element {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{props.value}</Text>
      <Text style={styles.statLabel}>{props.label}</Text>
    </View>
  );
}

export default function PlayerProfile(): JSX.Element {
  const { language } = useI18n();
  const copy = getPlayerProfileCopy(language);
  const sectionCopy = getPlayerProfileSectionCopy(language);
  const positionOptions = useMemo(() => getPositionOptions(language), [language]);
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const dashboard = usePlayerProfileDashboard({ userId: user?.id ?? null, enabled: isAuthenticated });

  const [footEditorSide, setFootEditorSide] = useState<"left" | "right" | null>(null);
  const [footSkillDraft, setFootSkillDraft] = useState(3);
  const [positionPickerRank, setPositionPickerRank] = useState<PositionRank | null>(null);
  const [positionDraft, setPositionDraft] = useState<PositionDraft>({ first: null, second: null, third: null });
  const [statsEditorVisible, setStatsEditorVisible] = useState(false);
  const [statsDraft, setStatsDraft] = useState<StatsDraft>(createStatsDraft(null));

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  const profile = dashboard.profileBundle?.profile ?? null;
  const playerProfile = dashboard.profileBundle?.playerProfile ?? null;
  const accountTypes = dashboard.profileBundle?.accountTypes ?? [];
  const teams = dashboard.teams;
  const displayName = profile?.display_name?.trim() || user?.email || "KickGo";
  const resolvedFirstPosition = playerProfile?.position_first ?? playerProfile?.preferred_position ?? null;
  const countryLabel = `${getCountryFlag(profile?.country_code)} ${getCountryLabel(language, profile?.country_code, copy.countryFallback)}`;
  const primaryRoleLabel = getPrimaryRoleLabel(language, accountTypes);
  const secondaryTag = getAgeBandLabel(language, profile?.birth_year, primaryRoleLabel);
  const tierDisplay = getTierDisplay(language, playerProfile?.skill_tier, playerProfile?.reputation_score);
  const statusBadge = getStatusBadgeLabel(language, resolvedFirstPosition);
  const radarMetrics = useMemo(
    () => buildRadarMetrics(language, playerProfile, statsEditorVisible ? statsDraft : undefined),
    [language, playerProfile, statsDraft, statsEditorVisible],
  );
  const playStyleLabels = useMemo(
    () => getPlayStyleLabels(language, playerProfile?.play_styles ?? []),
    [language, playerProfile?.play_styles],
  );
  const needsPlayerProfileOnboarding = !playerProfile || !resolvedFirstPosition;
  const hasPositionChanges =
    positionDraft.first !== (playerProfile?.position_first ?? playerProfile?.preferred_position ?? null) ||
    positionDraft.second !== (playerProfile?.position_second ?? null) ||
    positionDraft.third !== (playerProfile?.position_third ?? null);
  const hasStatChanges =
    statsDraft.stamina !== (playerProfile?.stat_stamina ?? 50) ||
    statsDraft.dribble !== (playerProfile?.stat_dribble ?? 50) ||
    statsDraft.shooting !== (playerProfile?.stat_shooting ?? 50) ||
    statsDraft.passing !== (playerProfile?.stat_passing ?? 50) ||
    statsDraft.defense !== (playerProfile?.stat_defense ?? 50) ||
    statsDraft.speed !== (playerProfile?.stat_speed ?? 50);

  useEffect(() => {
    setPositionDraft(createPositionDraft(playerProfile));
    setStatsDraft(createStatsDraft(playerProfile));
  }, [playerProfile]);

  const selectedPositionValues = useMemo(
    () => [positionDraft.first, positionDraft.second, positionDraft.third].filter(Boolean) as PlayerPosition[],
    [positionDraft],
  );

  const roleLabels = useMemo(
    () =>
      Object.fromEntries(
        teams.map((membership) => [membership.id, getRoleBadgeLabel(language, membership.role)]),
      ) as Record<string, string>,
    [language, teams],
  );

  const openFootEditor = (side: "left" | "right"): void => {
    if (!playerProfile) {
      Alert.alert(copy.title, sectionCopy.playerProfileRequired);
      return;
    }

    setFootEditorSide(side);
    setFootSkillDraft(side === "left" ? playerProfile.left_foot_skill : playerProfile.right_foot_skill);
  };

  const handleSelectPosition = (value: PlayerPosition | null): void => {
    if (!positionPickerRank) {
      return;
    }

    setPositionDraft((current) => ({
      ...current,
      [positionPickerRank]: value,
    }));
    setPositionPickerRank(null);
  };  const handleSavePositions = async (): Promise<void> => {
    if (!positionDraft.first) {
      Alert.alert(copy.title, copy.positionRequired);
      return;
    }

    const uniquePositions = new Set(selectedPositionValues);
    if (uniquePositions.size !== selectedPositionValues.length) {
      Alert.alert(copy.title, copy.positionDuplicate);
      return;
    }

    try {
      await dashboard.updatePlayerProfile({
        preferredPosition: positionDraft.first,
        positionFirst: positionDraft.first,
        positionSecond: positionDraft.second,
        positionThird: positionDraft.third,
      });
      Alert.alert(copy.title, copy.positionsSaved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update player profile.";
      Alert.alert(copy.title, message);
    }
  };

  const handleAdjustStat = (key: StatKey, value: number): void => {
    setStatsDraft((current) => ({
      ...current,
      [key]: clampStat(value),
    }));
  };

  const handleSaveStats = async (): Promise<void> => {
    try {
      await dashboard.updatePlayerProfile({
        statStamina: statsDraft.stamina,
        statDribble: statsDraft.dribble,
        statShooting: statsDraft.shooting,
        statPassing: statsDraft.passing,
        statDefense: statsDraft.defense,
        statSpeed: statsDraft.speed,
      });
      setStatsEditorVisible(false);
      Alert.alert(copy.title, copy.statsSaved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update player profile.";
      Alert.alert(copy.title, message);
    }
  };

  const handleSaveFootSkill = async (): Promise<void> => {
    if (!footEditorSide || !playerProfile) {
      return;
    }

    try {
      await dashboard.updatePlayerProfile(
        footEditorSide === "left"
          ? { leftFootSkill: footSkillDraft }
          : { rightFootSkill: footSkillDraft },
      );
      setFootEditorSide(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update player profile.";
      Alert.alert(copy.title, message);
    }
  };

  const handleUploadAvatar = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(copy.title, "Media permission denied.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const contentType = getAvatarContentType(asset);

    if (!contentType) {
      Alert.alert(copy.title, "Unsupported image type.");
      return;
    }

    try {
      await dashboard.uploadAvatar({
        uri: asset.uri,
        fileName: getAvatarFileName(asset, contentType as SupportedAvatarContentType),
        contentType,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload avatar.";
      Alert.alert(copy.title, message);
    }
  };

  const previewMetrics = buildRadarMetrics(language, playerProfile, statsDraft);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl onRefresh={() => void dashboard.refetchAll()} refreshing={dashboard.isLoading} />}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroHeader
          avatarUrl={profile?.avatar_url ?? null}
          badgeLabel={statusBadge}
          displayName={displayName}
          onBack={() => router.replace("/(tabs)/home")}
          onEdit={() => router.push("/(onboarding)/create-profile?mode=edit")}
          onNotifications={() => router.push("/(settings)/notifications")}
          onSettings={() => router.push("/(settings)/settings")}
          onShare={() => Alert.alert(copy.title, "Share is not ready yet.")}
          onUploadAvatar={() => void handleUploadAvatar()}
          tags={[countryLabel, secondaryTag]}
        />

        <View style={styles.contentWrap}>
          {dashboard.errorMessage ? <Text style={styles.errorText}>{dashboard.errorMessage}</Text> : null}

          {needsPlayerProfileOnboarding ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{copy.profileIncompleteTitle}</Text>
              <Text style={styles.helperText}>{copy.profileIncompleteBody}</Text>

          <Pressable onPress={() => router.push("/(onboarding)/player")} style={styles.primaryButton}>
                <Text style={styles.primaryButtonLabel}>{copy.continueOnboarding}</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <StatTile label={copy.overviewMatches} value={0} />
              <StatTile label={copy.overviewGoals} value={0} />
              <StatTile label={copy.overviewAssists} value={0} />
              <StatTile label={copy.overviewMvp} value={0} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{copy.teamSectionTitle}</Text>
            </View>
            {teams.length > 0 ? (
              <View style={styles.teamListWrap}>
                {teams.map((membership) => (
                  <TeamMembershipCard
                    key={membership.id}
                    membership={membership}
                    roleLabel={roleLabels[membership.id] ?? membership.role}
                  />
                ))}
              </View>
            ) : (
              <>
                <Text style={styles.emptyTitle}>{copy.teamEmptyTitle}</Text>
                <Text style={styles.helperText}>{copy.teamEmptyBody}</Text>
                <View style={styles.inlineButtonRow}>

          <Pressable onPress={() => router.push("/(tabs)/team/find")} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonLabel}>{copy.findTeam}</Text>
                  </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/team/create")} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonLabel}>{copy.createTeam}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{copy.preferredPositionsTitle}</Text>
            <Text style={styles.helperText}>{copy.preferredPositionsDescription}</Text>
            <View style={styles.positionListWrap}>
              <PositionRow
                label={copy.firstChoice}
                onPress={() => setPositionPickerRank("first")}
                value={positionDraft.first ? copy.positionLabels[positionDraft.first] : copy.noPosition}
              />
              <PositionRow
                label={copy.secondChoice}
                onPress={() => setPositionPickerRank("second")}
                value={positionDraft.second ? copy.positionLabels[positionDraft.second] : copy.noPosition}
              />
              <PositionRow
                label={copy.thirdChoice}
                onPress={() => setPositionPickerRank("third")}
                value={positionDraft.third ? copy.positionLabels[positionDraft.third] : copy.noPosition}
              />
            </View>

          <Pressable
              disabled={!hasPositionChanges || dashboard.isUpdatingPlayerProfile}
              onPress={() => void handleSavePositions()}
              style={[styles.primaryButton, (!hasPositionChanges || dashboard.isUpdatingPlayerProfile) && styles.primaryButtonDisabled]}
            >
              <Text style={styles.primaryButtonLabel}>
                {dashboard.isUpdatingPlayerProfile ? copy.saving : copy.savePositions}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>{copy.levelTitle}</Text>
                <Text style={styles.tierValue}>{tierDisplay}</Text>
              </View>

          <Pressable onPress={() => setStatsEditorVisible(true)} style={styles.ghostButton}>
                <Text style={styles.ghostButtonLabel}>{copy.levelEdit}</Text>
              </Pressable>
            </View>
            <ProfileRadarChart metrics={previewMetrics} />
            <View style={styles.statsGrid}> 
              {previewMetrics.map((metric) => (
                <StatTile key={metric.key} label={metric.label} value={metric.value} />
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{sectionCopy.footSkillTitle}</Text>
            <Text style={styles.helperText}>{sectionCopy.footSkillDescription}</Text>
            <View style={styles.footSkillRow}>

          <Pressable onPress={() => openFootEditor("left")} style={styles.footSkillCard}>
                <Ionicons color={PROFILE_BLUE} name="footsteps" size={28} />
                <Text style={styles.footSkillLabel}>{sectionCopy.leftFoot}</Text>
                <Text style={styles.footSkillValue}>{playerProfile?.left_foot_skill ?? 3}</Text>
              </Pressable>

          <Pressable onPress={() => openFootEditor("right")} style={styles.footSkillCard}>
                <Ionicons color={PROFILE_BLUE} name="footsteps-outline" size={28} />
                <Text style={styles.footSkillLabel}>{sectionCopy.rightFoot}</Text>
                <Text style={styles.footSkillValue}>{playerProfile?.right_foot_skill ?? 3}</Text>
              </Pressable>
            </View>
            <Text style={styles.subtleValueLabel}>
              {`${sectionCopy.preferredFootLabel}: ${getPreferredFootLabel(language, playerProfile?.preferred_foot)}`}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (!playerProfile) {
                Alert.alert(copy.title, sectionCopy.playerProfileRequired);
                return;
              }
              router.push("/(tabs)/profile/play-style");
            }}
            style={styles.card}
          >
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>{sectionCopy.playStyleTitle}</Text>
                <Text style={styles.helperText}>{sectionCopy.playStyleSubtitle}</Text>
              </View>
              <Ionicons color={PROFILE_TEXT_SOFT} name="chevron-forward" size={20} />
            </View>
            <View style={styles.playStyleWrap}>
              {playStyleLabels.length > 0 ? (
                playStyleLabels.map((label) => (
                  <View key={label} style={styles.playStyleChip}>
                    <Text style={styles.playStyleChipLabel}>{label}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.playStyleEmptyChip}>
                  <Text style={styles.playStyleEmptyLabel}>{sectionCopy.playStyleEmpty}</Text>
                </View>
              )}
            </View>

          </Pressable>
          <MyMercenaryApplicationsPreview />
        </View>
      </ScrollView>

      <Modal animationType="fade" onRequestClose={() => setPositionPickerRank(null)} transparent visible={positionPickerRank !== null}>
        <Pressable onPress={() => setPositionPickerRank(null)} style={styles.modalBackdrop}>

          <Pressable style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>{copy.choosePosition}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {positionPickerRank !== "first" ? (

          <Pressable onPress={() => handleSelectPosition(null)} style={styles.sheetRow}>
                  <Text style={styles.sheetRowLabel}>{copy.noPosition}</Text>
                  {(positionPickerRank === "second" ? positionDraft.second : positionDraft.third) === null ? (
                    <Ionicons color={PROFILE_GREEN} name="checkmark" size={18} />
                  ) : null}
                </Pressable>
              ) : null}
              {positionOptions.map((option) => {
                const isSelected = positionDraft[positionPickerRank ?? "first"] === option.value;
                const isTaken = selectedPositionValues.includes(option.value) && !isSelected;
                return (

          <Pressable
                    disabled={isTaken}
                    key={option.value}
                    onPress={() => handleSelectPosition(option.value)}
                    style={[styles.sheetRow, isTaken && styles.sheetRowDisabled]}
                  >
                    <View>
                      <Text style={[styles.sheetRowLabel, isTaken && styles.sheetRowDisabledLabel]}>{option.code}</Text>
                      <Text style={[styles.sheetRowMeta, isTaken && styles.sheetRowDisabledLabel]}>{option.label}</Text>
                    </View>
                    {isSelected ? <Ionicons color={PROFILE_GREEN} name="checkmark" size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setStatsEditorVisible(false)} transparent visible={statsEditorVisible}>
        <Pressable onPress={() => setStatsEditorVisible(false)} style={styles.modalBackdrop}>

          <Pressable style={styles.sheetCardLarge}>
            <Text style={styles.sheetTitle}>{copy.statsEditorTitle}</Text>
            <Text style={styles.sheetBody}>{copy.statsEditorBody}</Text>
            <ProfileRadarChart metrics={previewMetrics} size={236} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <StatEditorRow
                label={copy.staminaLabel}
                onDecrease={() => handleAdjustStat("stamina", statsDraft.stamina - 5)}
                onIncrease={() => handleAdjustStat("stamina", statsDraft.stamina + 5)}
                onSelect={(value) => handleAdjustStat("stamina", value)}
                value={statsDraft.stamina}
              />
              <StatEditorRow
                label={copy.dribbleLabel}
                onDecrease={() => handleAdjustStat("dribble", statsDraft.dribble - 5)}
                onIncrease={() => handleAdjustStat("dribble", statsDraft.dribble + 5)}
                onSelect={(value) => handleAdjustStat("dribble", value)}
                value={statsDraft.dribble}
              />
              <StatEditorRow
                label={copy.shootingLabel}
                onDecrease={() => handleAdjustStat("shooting", statsDraft.shooting - 5)}
                onIncrease={() => handleAdjustStat("shooting", statsDraft.shooting + 5)}
                onSelect={(value) => handleAdjustStat("shooting", value)}
                value={statsDraft.shooting}
              />
              <StatEditorRow
                label={copy.passingLabel}
                onDecrease={() => handleAdjustStat("passing", statsDraft.passing - 5)}
                onIncrease={() => handleAdjustStat("passing", statsDraft.passing + 5)}
                onSelect={(value) => handleAdjustStat("passing", value)}
                value={statsDraft.passing}
              />
              <StatEditorRow
                label={copy.defenseLabel}
                onDecrease={() => handleAdjustStat("defense", statsDraft.defense - 5)}
                onIncrease={() => handleAdjustStat("defense", statsDraft.defense + 5)}
                onSelect={(value) => handleAdjustStat("defense", value)}
                value={statsDraft.defense}
              />
              <StatEditorRow
                label={copy.speedLabel}
                onDecrease={() => handleAdjustStat("speed", statsDraft.speed - 5)}
                onIncrease={() => handleAdjustStat("speed", statsDraft.speed + 5)}
                onSelect={(value) => handleAdjustStat("speed", value)}
                value={statsDraft.speed}
              />
            </ScrollView>
            <View style={styles.inlineButtonRow}>

          <Pressable onPress={() => setStatsEditorVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonLabel}>{copy.cancel}</Text>
              </Pressable>

          <Pressable
                disabled={!hasStatChanges || dashboard.isUpdatingPlayerProfile}
                onPress={() => void handleSaveStats()}
                style={[styles.primaryButton, styles.modalPrimaryButton, (!hasStatChanges || dashboard.isUpdatingPlayerProfile) && styles.primaryButtonDisabled]}
              >
                <Text style={styles.primaryButtonLabel}>{dashboard.isUpdatingPlayerProfile ? copy.saving : copy.saveStats}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setFootEditorSide(null)} transparent visible={footEditorSide !== null}>
        <Pressable onPress={() => setFootEditorSide(null)} style={styles.modalBackdrop}>

          <Pressable style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>{sectionCopy.footSkillModalTitle}</Text>
            <View style={styles.skillOptionsWrap}>
              {FOOT_SKILL_VALUES.map((value) => (

          <Pressable
                  key={`foot-skill-${value}`}
                  onPress={() => setFootSkillDraft(value)}
                  style={[styles.skillChip, footSkillDraft === value && styles.skillChipActive]}
                >
                  <Text style={[styles.skillChipLabel, footSkillDraft === value && styles.skillChipLabelActive]}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inlineButtonRow}>

          <Pressable onPress={() => setFootEditorSide(null)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonLabel}>{sectionCopy.footSkillCancel}</Text>
              </Pressable>

          <Pressable onPress={() => void handleSaveFootSkill()} style={[styles.primaryButton, styles.modalPrimaryButton]}>
                <Text style={styles.primaryButtonLabel}>{sectionCopy.footSkillSave}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PROFILE_PAGE_BG,
  },
  scrollContent: {
    paddingBottom: 44,
  },
  contentWrap: {
    marginTop: -68,
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: PROFILE_CARD_BG,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#b91c1c",
    paddingHorizontal: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: PROFILE_TEXT_SOFT,
  },
  tierValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_BLUE,
  },
  ghostButton: {
    borderRadius: 999,
    backgroundColor: PROFILE_BLUE_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostButtonLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_BLUE,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: PROFILE_BLUE,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  inlineButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statTile: {
    width: "47%",
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: PROFILE_TEXT_DARK,
  },
  statLabel: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  teamListWrap: {
    gap: 12,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  teamCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teamEmblem: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  teamEmblemFallback: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  teamEmblemFallbackLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_BLUE,
  },
  teamCopyWrap: {
    flex: 1,
    gap: 3,
  },
  teamNameLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  teamSubLabel: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  teamRolePill: {
    borderRadius: 999,
    backgroundColor: PROFILE_OWNER_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  teamRolePillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PROFILE_OWNER_TEXT,
  },
  positionListWrap: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
  },
  positionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_BORDER,
    backgroundColor: "#ffffff",
  },
  positionRankLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  positionValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  positionValue: {
    fontSize: 14,
    color: PROFILE_TEXT_SOFT,
  },
  footSkillRow: {
    flexDirection: "row",
    gap: 12,
  },
  footSkillCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 6,
  },
  footSkillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  footSkillValue: {
    fontSize: 28,
    fontWeight: "900",
    color: PROFILE_BLUE,
  },
  subtleValueLabel: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  playStyleWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  playStyleChip: {
    borderRadius: 999,
    backgroundColor: PROFILE_BLUE_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  playStyleChipLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_BLUE,
  },
  playStyleEmptyChip: {
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  playStyleEmptyLabel: {
    fontSize: 13,
    color: PROFILE_TEXT_SOFT,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: MODAL_BACKDROP,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
  },
  sheetCard: {
    maxHeight: "72%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  sheetCardLarge: {
    maxHeight: "84%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  sheetBody: {
    fontSize: 13,
    lineHeight: 20,
    color: PROFILE_TEXT_SOFT,
  },
  sheetRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_BORDER,
  },
  sheetRowDisabled: {
    opacity: 0.35,
  },
  sheetRowLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  sheetRowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: PROFILE_TEXT_SOFT,
  },
  sheetRowDisabledLabel: {
    color: PROFILE_TEXT_SOFT,
  },
  statEditorRow: {
    gap: 10,
    marginBottom: 14,
  },
  statEditorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statEditorLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  statEditorValue: {
    fontSize: 14,
    fontWeight: "800",
    color: PROFILE_BLUE,
  },
  statEditorControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statAdjustButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  statSegmentsWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  statSegment: {
    flex: 1,
    height: 12,
    borderRadius: 999,
  },
  statSegmentActive: {
    backgroundColor: PROFILE_BLUE,
  },
  statSegmentIdle: {
    backgroundColor: "#dbe3ef",
  },
  skillOptionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillChip: {
    minWidth: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PROFILE_BORDER,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skillChipActive: {
    borderColor: PROFILE_GREEN,
    backgroundColor: "#e8fff6",
  },
  skillChipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFILE_TEXT_DARK,
  },
  skillChipLabelActive: {
    color: PROFILE_GREEN,
  },
});
