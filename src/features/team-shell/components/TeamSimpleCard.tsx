import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  buildTeamInitial,
  getRecruitmentStatusTone,
  getTeamRecruitmentLabel,
  getTeamRegionLabels,
  getTeamRoleLabel,
  getTeamSportLabel,
} from "@/features/team-shell/team-shell.helpers";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import type { SupportedLanguage } from "@/types/profile.types";
import type { TeamMembershipRecord } from "@/types/team.types";

type TeamSimpleCardProps = {
  language: SupportedLanguage;
  membership: TeamMembershipRecord;
  onPress: () => void;
};

export function TeamSimpleCard(props: TeamSimpleCardProps): JSX.Element {
  const { language, membership, onPress } = props;
  const copy = getTeamShellCopy(language);
  const regionLabels = getTeamRegionLabels(membership.team);
  const recruitmentTone = getRecruitmentStatusTone(membership.team);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.leftWrap}>
        {membership.team.emblem_url ? (
          <Image source={{ uri: membership.team.emblem_url }} style={styles.emblem} />
        ) : (
          <View style={styles.initialWrap}>
            <Text style={styles.initialLabel}>{buildTeamInitial(membership.team.name)}</Text>
          </View>
        )}
      </View>

      <View style={styles.centerWrap}>
        <Text numberOfLines={1} style={styles.teamName}>{membership.team.name}</Text>
        <Text numberOfLines={1} style={styles.regionText}>{regionLabels.join(" · ") || copy.venueFallback}</Text>
        <View style={styles.inlineBadges}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeLabel}>{getTeamSportLabel(language, membership.team.sport_type)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: recruitmentTone.backgroundColor }]}> 
            <Text style={[styles.statusLabel, { color: recruitmentTone.color }]}>
              {getTeamRecruitmentLabel(language, membership.team)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightWrap}>
        <View
          style={[
            styles.roleBadge,
            membership.role === "owner"
              ? styles.ownerBadge
              : membership.role === "manager"
                ? styles.managerBadge
                : membership.role === "captain"
                  ? styles.captainBadge
                  : styles.playerBadge,
          ]}
        >
          <Text
            style={[
              styles.roleLabel,
              membership.role === "owner"
                ? styles.ownerLabel
                : membership.role === "manager"
                  ? styles.managerLabel
                  : membership.role === "captain"
                    ? styles.captainLabel
                    : styles.playerLabel,
            ]}
          >
            {getTeamRoleLabel(language, membership.role)}
          </Text>
        </View>
        <View style={styles.tierBadge}>
          <Text style={styles.tierLabel}>{copy.tierFallback}</Text>
        </View>
        <Ionicons color="#9ca3af" name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  leftWrap: {
    justifyContent: "center",
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
    borderRadius: 26,
    backgroundColor: "#10231f",
    alignItems: "center",
    justifyContent: "center",
  },
  initialLabel: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  centerWrap: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  regionText: {
    fontSize: 13,
    color: "#6b7280",
  },
  inlineBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  sportBadge: {
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sportBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  rightWrap: {
    alignItems: "flex-end",
    gap: 8,
  },
  roleBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ownerBadge: { backgroundColor: "#fef3c7" },
  managerBadge: { backgroundColor: "#dbeafe" },
  captainBadge: { backgroundColor: "#dcfce7" },
  playerBadge: { backgroundColor: "#f3f4f6" },
  roleLabel: { fontSize: 11, fontWeight: "800" },
  ownerLabel: { color: "#92400e" },
  managerLabel: { color: "#1d4ed8" },
  captainLabel: { color: "#15803d" },
  playerLabel: { color: "#4b5563" },
  tierBadge: {
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4338ca",
  },
});