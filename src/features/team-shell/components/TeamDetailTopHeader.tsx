import { Ionicons } from "@expo/vector-icons";
import { router, useGlobalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import {
  buildTeamInitial,
  getRecruitmentStatusTone,
  getTeamRecruitmentLabel,
  getTeamRegionLabels,
} from "@/features/team-shell/team-shell.helpers";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useDrawerStore } from "@/store/drawer.store";

type TeamTabKey = "index" | "members" | "matches" | "announcements" | "fee";

type TeamDetailTopHeaderProps = {
  activeTab: TeamTabKey;
};

type TabItem = {
  key: TeamTabKey;
  label: string;
};

const TAB_ROUTE_MAP: Record<TeamTabKey, string> = {
  index: "/(tabs)/team/[teamId]",
  members: "/(tabs)/team/[teamId]/members",
  matches: "/(tabs)/team/[teamId]/matches",
  announcements: "/(tabs)/team/[teamId]/announcements",
  fee: "/(tabs)/team/[teamId]/fee",
};

export function TeamDetailTopHeader(props: TeamDetailTopHeaderProps): JSX.Element {
  const { activeTab } = props;
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const copy = getTeamShellCopy(language);
  const params = useGlobalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = useMemo<TabItem[]>(
    () => [
      { key: "index", label: copy.tabHome },
      { key: "members", label: copy.tabMembers },
      { key: "matches", label: copy.tabMatches },
      { key: "announcements", label: copy.tabAnnouncements },
      { key: "fee", label: copy.tabFee },
    ],
    [copy.tabAnnouncements, copy.tabFee, copy.tabHome, copy.tabMatches, copy.tabMembers],
  );

  const team = detailQuery.data?.team ?? null;
  const membershipRole = detailQuery.data?.currentMembership?.role ?? null;
  const canEdit = membershipRole === "owner" || membershipRole === "manager";
  const regionLabels = team ? getTeamRegionLabels(team) : [];
  const recruitmentTone = team ? getRecruitmentStatusTone(team) : null;

  const handleNavigate = (key: TeamTabKey): void => {
    if (!teamId || key === activeTab) {
      return;
    }

    router.replace({ pathname: TAB_ROUTE_MAP[key], params: { teamId } });
  };

  const handleBack = (): void => {
    router.replace("/(tabs)/team");
  };

  const handleShare = async (): Promise<void> => {
    if (!team) {
      return;
    }

    try {
      await Share.share({ message: `${team.name} - KickGo` });
    } catch {
      // noop
    }
  };

  return (
    <>
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <View style={styles.leadingWrap}>
            <Pressable hitSlop={10} onPress={handleBack} style={styles.backButton}>
              <Ionicons color="#ffffff" name="chevron-back" size={22} />
            </Pressable>

            <View style={styles.identityWrap}>
              {team?.emblem_url ? (
                <Image source={{ uri: team.emblem_url }} style={styles.emblem} />
              ) : (
                <View style={styles.initialWrap}>
                  <Text style={styles.initialLabel}>{buildTeamInitial(team?.name ?? "K")}</Text>
                </View>
              )}

              <View style={styles.copyWrap}>
                <Text numberOfLines={1} style={styles.teamName}>
                  {team?.name ?? "KickGo"}
                </Text>
                <View style={styles.badgeRow}>
                  {regionLabels.map((label) => (
                    <View key={label} style={styles.badge}>
                      <Text style={styles.badgeLabel}>{label}</Text>
                    </View>
                  ))}
                  {team && recruitmentTone ? (
                    <View style={[styles.badge, { backgroundColor: recruitmentTone.backgroundColor }]}>
                      <Text style={[styles.badgeLabel, { color: recruitmentTone.color }]}>
                        {getTeamRecruitmentLabel(language, team)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.iconRow}>
            <Pressable hitSlop={10} onPress={() => void handleShare()} style={styles.iconButton}>
              <Ionicons color="#ffffff" name="share-social-outline" size={20} />
            </Pressable>
            <Pressable hitSlop={10} onPress={() => setIsMenuOpen(true)} style={styles.iconButton}>
              <Ionicons color="#ffffff" name="ellipsis-horizontal" size={20} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.tabBarContent} horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => handleNavigate(tab.key)} style={styles.tabButton}>
                <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>{tab.label}</Text>
                <View style={[styles.tabUnderline, isActive ? styles.tabUnderlineActive : null]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsMenuOpen(false)} transparent visible={isMenuOpen}>
        <Pressable onPress={() => setIsMenuOpen(false)} style={styles.menuOverlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.menuCard}>
            {canEdit && teamId ? (
              <Pressable
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push({ pathname: "/(tabs)/team/[teamId]/edit", params: { teamId } });
                }}
                style={({ pressed }) => [styles.menuAction, pressed ? styles.menuPressed : null]}
              >
                <Ionicons color="#111827" name="create-outline" size={18} />
                <Text style={styles.menuActionLabel}>{copy.headerMenuEdit}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => {
                setIsMenuOpen(false);
                openDrawer();
              }}
              style={({ pressed }) => [styles.menuAction, pressed ? styles.menuPressed : null]}
            >
              <Ionicons color="#111827" name="swap-horizontal-outline" size={18} />
              <Text style={styles.menuActionLabel}>Role Switch</Text>
            </Pressable>
            <Pressable onPress={() => setIsMenuOpen(false)} style={({ pressed }) => [styles.menuAction, pressed ? styles.menuPressed : null]}>
              <Ionicons color="#111827" name="close-outline" size={18} />
              <Text style={styles.menuActionLabel}>{copy.headerMenuClose}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: "#161827",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  leadingWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  identityWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  emblem: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  initialWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  initialLabel: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  copyWrap: {
    flex: 1,
    gap: 8,
  },
  teamName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#2a2a3e",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c9cfdb",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabBarContent: {
    gap: 20,
    paddingTop: 16,
  },
  tabButton: {
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  tabLabelActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  tabUnderline: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  tabUnderlineActive: {
    backgroundColor: "#22c55e",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    paddingTop: 92,
    paddingHorizontal: 20,
  },
  menuCard: {
    alignSelf: "flex-end",
    minWidth: 190,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    shadowColor: "#111827",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuPressed: {
    backgroundColor: "#f9fafb",
  },
  menuActionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
});
