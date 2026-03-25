import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function TeamLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="join" options={{ title: "팀 가입" }} />
      <Stack.Screen name="find" options={{ title: "팀 찾기" }} />
      <Stack.Screen name="[teamId]" options={{ headerShown: false }} />
    </Stack>
  );
}