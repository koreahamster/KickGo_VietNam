import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function MatchLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="create" options={{ title: "Create Match" }} />
      <Stack.Screen name="match-calendar" options={{ title: "Match Calendar" }} />
      <Stack.Screen name="[matchId]" options={{ headerShown: false }} />
    </Stack>
  );
}