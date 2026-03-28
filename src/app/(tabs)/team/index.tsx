import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { TeamFabSheet } from "@/features/team-shell/components/TeamFabSheet";
import { TeamListEmptyState } from "@/features/team-shell/components/TeamListEmptyState";
import { TeamSimpleCard } from "@/features/team-shell/components/TeamSimpleCard";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";

export default function TeamTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamShellCopy(language);
  const { hasProfile, pendingRoleOnboarding, isProfileLoading } = useProfile();
  const { teams, isTeamsLoading, teamErrorMessage } = useTeams({ enabled: hasProfile });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openCreate = (): void => {
    setIsSheetOpen(false);
    router.push("/(tabs)/team/create");
  };

  const openJoin = (): void => {
    setIsSheetOpen(false);
    router.push("/(tabs)/team/join");
  };

  if (isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.centerText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.blockTitle}>Complete onboarding first</Text>
          <Text style={styles.blockBody}>You need a common profile before accessing team features.</Text>
          <Pressable
            onPress={() => router.push(pendingRoleOnboarding ? "/(onboarding)/player" : "/(onboarding)/create-profile")}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.primaryButtonLabel}>Continue onboarding</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.page}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={teams}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>{copy.listTitle}</Text>
              <Text style={styles.headerSubtitle}>{copy.listSubtitle}</Text>
              {teamErrorMessage ? <Text style={styles.errorText}>{teamErrorMessage}</Text> : null}
            </View>
          }
          ListEmptyComponent={
            isTeamsLoading ? (
              <View style={styles.loadingWrap}>
                <Text style={styles.centerText}>Loading...</Text>
              </View>
            ) : (
              <TeamListEmptyState language={language} onCreate={openCreate} onJoin={openJoin} />
            )
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <TeamSimpleCard
                language={language}
                membership={item}
                onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]", params: { teamId: item.team.id } })}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <Pressable onPress={() => setIsSheetOpen(true)} style={({ pressed }) => [styles.fab, pressed ? styles.pressed : null]}>
          <Text style={styles.fabLabel}>+</Text>
        </Pressable>

        <TeamFabSheet language={language} onClose={() => setIsSheetOpen(false)} onCreate={openCreate} onJoin={openJoin} visible={isSheetOpen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  page: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 16,
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
  },
  errorText: {
    marginTop: 10,
    color: "#dc2626",
    fontSize: 13,
  },
  cardWrap: {
    marginBottom: 12,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1d9e75",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1d9e75",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  fabLabel: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "500",
    lineHeight: 32,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  loadingWrap: {
    paddingTop: 48,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  blockBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#10231f",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.88,
  },
});
