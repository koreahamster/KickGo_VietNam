import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function MatchDetailLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="index" options={{ title: "Match Detail" }} />
      <Stack.Screen name="roster" options={{ title: "Match Roster" }} />
      <Stack.Screen name="result" options={{ title: "Match Result" }} />
      <Stack.Screen name="vote" options={{ title: "MVP Vote" }} />
      <Stack.Screen name="card" options={{ title: "Match Card" }} />
    </Stack>
  );
}