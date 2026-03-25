import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function SocialLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="feed" options={{ title: "Feed" }} />
      <Stack.Screen name="shorts-upload" options={{ title: "Shorts Upload" }} />
      <Stack.Screen name="[postId]" options={{ title: "Post Detail" }} />
      <Stack.Screen name="profile-public" options={{ title: "Public Profile" }} />
    </Stack>
  );
}