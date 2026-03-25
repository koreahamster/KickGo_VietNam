import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function AuthLayout(): JSX.Element {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="login" options={{ title: t("auth.login.title") }} />
      <Stack.Screen name="signup" options={{ title: t("auth.signup.title") }} />
      <Stack.Screen name="phone-verify" options={{ title: t("auth.phoneVerify.title") }} />
    </Stack>
  );
}