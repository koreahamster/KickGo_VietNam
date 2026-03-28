import { Stack } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";

const TITLES = {
  ko: {
    playStyle: "플레이 스타일",
  },
  vi: {
    playStyle: "Phong cach choi",
  },
  en: {
    playStyle: "Play Style",
  },
} as const;

export default function ProfileStackLayout(): JSX.Element {
  const { language } = useI18n();
  const mercenaryCopy = getMercenaryCopy(language);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="play-style"
        options={{
          title: TITLES[language].playStyle,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="applications"
        options={{
          title: mercenaryCopy.myApplicationsTitle,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="referee-availability" options={{ headerShown: false }} />
      <Stack.Screen name="referee-assignments" options={{ headerShown: false }} />
    </Stack>
  );
}
