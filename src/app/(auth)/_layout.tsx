import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function AuthLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="email-login" options={{ headerShown: false }} />
      <Stack.Screen name="email-signup" options={{ headerShown: false }} />
      <Stack.Screen name="phone-verify" options={{ headerShown: false }} />
      <Stack.Screen name="consent" options={{ title: "Consent" }} />
      <Stack.Screen name="faq" options={{ headerShown: false }} />
    </Stack>
  );
}
