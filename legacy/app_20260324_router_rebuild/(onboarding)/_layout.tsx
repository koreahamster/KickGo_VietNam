import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function OnboardingLayout(): JSX.Element {
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="create-profile" options={{ title: t("onboarding.createProfile.loadingTitle") }} />
      <Stack.Screen name="role-onboarding" options={{ title: t("onboarding.roleOnboarding.title") }} />
    </Stack>
  );
}