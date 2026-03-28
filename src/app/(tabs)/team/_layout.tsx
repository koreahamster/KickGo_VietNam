import { router, Stack } from "expo-router";
import { Pressable, Text } from "react-native";

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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen
        name="join"
        options={{
          title: "\uD300 \uCC38\uAC00",
          headerLeft: () => (
            <Pressable hitSlop={10} onPress={() => router.back()} style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#10231f" }}>\u2039</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="find"
        options={{
          title: "\uD300 \uCC3E\uAE30",
          headerLeft: () => (
            <Pressable hitSlop={10} onPress={() => router.back()} style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#10231f" }}>\u2039</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="[teamId]" options={{ headerShown: false }} />
    </Stack>
  );
}
