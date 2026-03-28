import { Stack } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";

export default function SearchStackLayout(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="mercenary/[postId]" options={{ title: copy.detailTitle, headerShadowVisible: false }} />
    </Stack>
  );
}