import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function OnboardingLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="create-profile" options={{ title: "Create Profile" }} />
      <Stack.Screen name="role-select" options={{ title: "Role Select" }} />
      <Stack.Screen name="role-onboarding" options={{ title: "Role Onboarding" }} />
      <Stack.Screen name="player" options={{ title: "Player Onboarding" }} />
      <Stack.Screen name="referee" options={{ title: "Referee Onboarding" }} />
      <Stack.Screen name="player-onboarding" options={{ title: "Player Onboarding" }} />
      <Stack.Screen name="referee-onboarding" options={{ title: "Referee Onboarding" }} />
      <Stack.Screen name="facility-manager-onboarding" options={{ title: "Facility Manager Onboarding" }} />
      <Stack.Screen name="tutorial" options={{ title: "Tutorial" }} />
    </Stack>
  );
}
