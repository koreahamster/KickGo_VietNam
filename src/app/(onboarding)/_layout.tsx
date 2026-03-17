import { Stack } from "expo-router";

export default function OnboardingLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="create-profile" options={{ title: "공통 프로필" }} />
      <Stack.Screen name="role-onboarding" options={{ title: "역할 온보딩" }} />
    </Stack>
  );
}
