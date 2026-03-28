import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { TeamMemberRole, TeamRosterMemberRecord } from "@/types/team.types";

type RoleTone = {
  backgroundColor: string;
  color: string;
};

type TeamMemberCardProps = {
  member: TeamRosterMemberRecord;
  displayName: string;
  roleLabel: string;
  squadNumberLabel: string | null;
  roleTone: RoleTone;
  showActions: boolean;
  onPressActions: () => void;
};

function buildInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "KG";
  }

  return (
    trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((token) => token[0]?.toUpperCase() ?? "")
      .join("") || trimmed.slice(0, 2).toUpperCase()
  );
}

export function getRoleTone(role: TeamMemberRole): RoleTone {
  if (role === "owner") {
    return { backgroundColor: "#fef3c7", color: "#92400e" };
  }
  if (role === "manager") {
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  }
  if (role === "captain") {
    return { backgroundColor: "#dcfce7", color: "#15803d" };
  }
  return { backgroundColor: "#f3f4f6", color: "#4b5563" };
}

export default function TeamMemberCard(props: TeamMemberCardProps): JSX.Element {
  const { member, displayName, roleLabel, squadNumberLabel, roleTone, showActions, onPressActions } = props;

  return (
    <View style={styles.card}>
      {member.profile?.avatar_url ? (
        <Image source={{ uri: member.profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackLabel}>{buildInitials(displayName)}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameWrap}>
            <Text numberOfLines={1} style={styles.name}>
              {displayName}
            </Text>
            {squadNumberLabel ? <Text style={styles.squadNumber}>{squadNumberLabel}</Text> : null}
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleTone.backgroundColor }]}>
            <Text style={[styles.roleBadgeLabel, { color: roleTone.color }]}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      {showActions ? (
        <Pressable onPress={onPressActions} style={styles.actionButton}>
          <Ionicons color="#6b7280" name="ellipsis-horizontal" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },
  avatarFallbackLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  squadNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f766e",
  },
  roleBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
});
