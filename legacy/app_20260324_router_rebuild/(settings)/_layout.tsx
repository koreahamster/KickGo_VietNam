import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function SettingsLayout(): JSX.Element {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="settings" options={{ title: t("settings.main.title") }} />
      <Stack.Screen name="visibility" options={{ title: t("settings.visibility.title") }} />
      <Stack.Screen name="language" options={{ title: t("settings.language.title") }} />
      <Stack.Screen name="region" options={{ title: t("settings.region.title") }} />
      <Stack.Screen name="roles" options={{ title: t("settings.roles.title") }} />
      <Stack.Screen name="notifications" options={{ title: t("settings.notifications.title") }} />
      <Stack.Screen name="account" options={{ title: t("settings.account.title") }} />
    </Stack>
  );
}