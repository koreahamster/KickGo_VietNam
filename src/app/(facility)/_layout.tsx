import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function FacilityLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="facility-search" options={{ title: "Facility Search" }} />
      <Stack.Screen name="notice-create" options={{ title: "공지 등록" }} />
      <Stack.Screen name="[facilityId]" options={{ headerShown: false }} />
    </Stack>
  );
}
