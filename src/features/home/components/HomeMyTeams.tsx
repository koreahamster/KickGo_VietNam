import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import { HomeTeamOnboardingCard } from "@/features/home/components/HomeTeamOnboardingCard";
import type { HomeCopy } from "@/features/home/home-copy";
import { useMyTeams } from "@/hooks/home/useMyTeams";

type HomeMyTeamsProps = {
  userId: string | null;
  enabled: boolean;
  copy: HomeCopy;
};

export function HomeMyTeams(props: HomeMyTeamsProps): JSX.Element | null {
  const { userId, enabled, copy } = props;
  const teamsQuery = useMyTeams(userId, enabled);

  if (!enabled) {
    return null;
  }

  if (teamsQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.manage} onPress={() => router.push("/(tabs)/team")} title={copy.myTeams} />
        <HomeSectionSkeleton count={2} height={88} />
      </View>
    );
  }

  if (teamsQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.manage} onPress={() => router.push("/(tabs)/team")} title={copy.myTeams} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void teamsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!teamsQuery.data || teamsQuery.data.length === 0) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.myTeams} />
        <HomeTeamOnboardingCard copy={copy} onCreateTeam={() => router.push("/(team)/create")} onJoinTeam={() => router.push("/(team)/join")} />
      </View>
    );
  }

  const items = [...teamsQuery.data, null] as const;

  return (
    <View style={styles.section}>
      <HomeSectionHeader actionLabel={copy.manage} onPress={() => router.push("/(tabs)/team")} title={copy.myTeams} />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        horizontal
        keyExtractor={(item, index) => (item ? item.id : `add-${index}`)}
        renderItem={({ item }) => {
          if (!item) {
            return (
              <Pressable style={styles.addChip} onPress={() => router.push("/(team)/create")}>
                <Ionicons color="#1d9e75" name="add" size={24} />
                <Text style={styles.addChipLabel}>{copy.teamAdded}</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              style={styles.teamChip}
              onPress={() => router.push({ pathname: "/(team)/[teamId]", params: { teamId: item.team.id } })}
            >
              <View style={styles.emblemFallback}>
                <Text style={styles.emblemFallbackLabel}>{item.team.name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text numberOfLines={1} style={styles.teamChipLabel}>{item.team.name}</Text>
            </Pressable>
          );
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContent: {
    paddingRight: 20,
    gap: 12,
  },
  teamChip: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emblemFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  emblemFallbackLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  teamChipLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  addChip: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1fae5",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  addChipLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  errorWrap: {
    gap: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});