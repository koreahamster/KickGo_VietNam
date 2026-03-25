import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function LeagueLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="tier-standings" options={{ title: "Tier Standings" }} />
      <Stack.Screen name="region-stats" options={{ title: "Region Stats" }} />
      <Stack.Screen name="promotion" options={{ title: "Promotion" }} />
    </Stack>
  );
}