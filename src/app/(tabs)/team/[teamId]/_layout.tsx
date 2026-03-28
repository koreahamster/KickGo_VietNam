import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import { TeamDetailTopHeader } from "@/features/team-shell/components/TeamDetailTopHeader";

function TeamSubHeaderLeft(): JSX.Element {
  return (
    <Pressable hitSlop={10} onPress={() => router.back()} style={{ marginLeft: 12, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
      <Ionicons color="#10231f" name="chevron-back" size={22} />
    </Pressable>
  );
}

export default function TeamDetailLayout(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamShellCopy(language);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="index" options={{ header: () => <TeamDetailTopHeader activeTab="index" /> }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="members" options={{ header: () => <TeamDetailTopHeader activeTab="members" />, contentStyle: { backgroundColor: "#f3f4f6" } }} />
      <Stack.Screen name="matches" options={{ header: () => <TeamDetailTopHeader activeTab="matches" /> }} />
      <Stack.Screen name="match-create" options={{ header: () => <TeamDetailTopHeader activeTab="matches" /> }} />`r`n      <Stack.Screen name="roster-submit" options={{ header: () => <TeamDetailTopHeader activeTab="matches" /> }} />
      <Stack.Screen name="match/[matchId]" options={{ header: () => <TeamDetailTopHeader activeTab="matches" /> }} />
      <Stack.Screen name="tournament/[tournamentId]" options={{ header: () => <TeamDetailTopHeader activeTab="matches" /> }} />
      <Stack.Screen name="announcements" options={{ header: () => <TeamDetailTopHeader activeTab="announcements" /> }} />
      <Stack.Screen name="fee" options={{ header: () => <TeamDetailTopHeader activeTab="fee" />, contentStyle: { backgroundColor: "#f3f4f6" } }} />
      <Stack.Screen name="fee-history" options={{ header: () => <TeamDetailTopHeader activeTab="fee" />, contentStyle: { backgroundColor: "#f3f4f6" } }} />
      <Stack.Screen name="fee-settings" options={{ header: () => <TeamDetailTopHeader activeTab="fee" />, contentStyle: { backgroundColor: "#ffffff" } }} />
      <Stack.Screen name="fees" options={{ header: () => <TeamDetailTopHeader activeTab="fee" />, contentStyle: { backgroundColor: "#f3f4f6" } }} />
      <Stack.Screen name="applicants" options={{ header: () => <TeamDetailTopHeader activeTab="members" />, contentStyle: { backgroundColor: "#f3f4f6" } }} />
      <Stack.Screen name="announcement-create" options={{ title: copy.tabAnnouncements, headerLeft: () => <TeamSubHeaderLeft /> }} />
      <Stack.Screen name="announcement/[announcementId]" options={{ title: copy.tabAnnouncements, headerLeft: () => <TeamSubHeaderLeft /> }} />
      <Stack.Screen name="chat" options={{ title: copy.quickChat, headerLeft: () => <TeamSubHeaderLeft /> }} />
      <Stack.Screen name="stats" options={{ title: copy.quickMatches, headerLeft: () => <TeamSubHeaderLeft /> }} />
      <Stack.Screen name="edit" options={{ header: () => <TeamDetailTopHeader activeTab="index" /> }} />
      <Stack.Screen name="mercenary" options={{ header: () => <TeamDetailTopHeader activeTab="index" /> }} />
      <Stack.Screen name="mercenary-create" options={{ header: () => <TeamDetailTopHeader activeTab="index" /> }} />
      <Stack.Screen name="mercenary-applicants" options={{ header: () => <TeamDetailTopHeader activeTab="index" /> }} />
    </Stack>
  );
}
