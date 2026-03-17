import { Stack } from "expo-router";

export default function SettingsLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="settings" options={{ title: "설정" }} />
      <Stack.Screen name="language" options={{ title: "언어 설정" }} />
      <Stack.Screen name="region" options={{ title: "지역 설정" }} />
      <Stack.Screen name="roles" options={{ title: "계정 역할" }} />
    </Stack>
  );
}
