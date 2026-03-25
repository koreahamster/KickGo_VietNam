import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function TeamDetailLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#eff1f7" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="matches" options={{ title: "팀 매치" }} />
      <Stack.Screen name="members" options={{ title: "팀 멤버" }} />
      <Stack.Screen name="announcements" options={{ title: "팀 공지" }} />
      <Stack.Screen name="chat" options={{ title: "팀 채팅" }} />
      <Stack.Screen name="fees" options={{ title: "팀 회비" }} />
      <Stack.Screen name="stats" options={{ title: "팀 통계" }} />
      <Stack.Screen name="edit" options={{ title: "팀 정보 수정" }} />
    </Stack>
  );
}
